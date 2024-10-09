const cds = require('@sap/cds');
const { Readable, PassThrough } = require("stream");
cds.env.features.fetch_csrf = true

// module.exports =  srv =>{ srv.on()}
module.exports = cds.service.impl(function () {
    const { mediaFile } = this.entities;  //entitysets declared in services.cds file srv folder

    this.on('READ', 'ActivityAllocation', async (req, next) => {  //if something is not going through custom handler then it will be gone throgh next
        var serv = await cds.connect.to('CE_DIRECTACTIVITYALLOCATION_0001');
        let data = await serv.run(SELECT`*`.from('MyService.ActivityAllocation'));
        return data;
    });

    //for media file upload
    /*
        In OData V4, we can't directly upload file using POST method , we should use PUT to upload, but with V2 we can upload directly using POST method
        Steps for file uploading in OData V4 :
        1.Create an empty data with file id in db table
        2.Using Update method, update the content to the db table using already created ID
    */
    this.on('UPDATE', mediaFile, async (req, next) => {
        const url = req._.req.path;
        if (url.includes('content')) {
            //creating entry in db table
            //first  we are fetching the data from table for large id & making entry into the db table
            let aLastRecInTable = await cds.run(SELECT`*`.from`myproj.mediaFile`.orderBy`id desc`.limit('1'));
            if (aLastRecInTable.length == 0) {
                this.fileId = 1;
                await cds.run(INSERT.into`myproj.mediaFile`.entries({ id: this.fileId }))
            }
            else {
                this.fileId = parseInt(aLastRecInTable[0].id) + 1;
                await cds.run(INSERT.into`myproj.mediaFile`.entries({ id: this.fileId }))
            }

            //1.first connect to db
            const db = await cds.connect.to('db');
            //2.collect already created id(which was passed in url) which are created in Create method
            const id = req.data.id; //id  which was passed in the url
            // let obj = db.read(mediaFile, id);  //read the db table data using id
            let obj = db.read(mediaFile, this.fileId); //if passing empty id in the url

            if (!obj) {
                req.reject(404, 'No data found!');
                return;
            }
            else {
                obj.fileName = req.headers.slug;
                obj.mediaType = req.headers['content-type'];
                obj.url = `/media/${mediaFile}(${this.fileId})/content`;

                const stream = new PassThrough()
                let chunks = [];
                stream.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                stream.on('end', async function(){
                    obj.content = Buffer.concat(chunks).toString('base64');
                    await db.update(mediaFile, this.fileId).with(obj);  //updating the database table with uploaded file
                }.bind(this));

                //now to trigger the stream
                req.data.content.pipe(stream)
            }
        }
        else next() //if the url doesn't includes content then generic handler will be triggered




    });

    this.on('PUT','readDataFromExcel',async(req,next)=>{
        if(req.data.excel){
            var fileName = req.headers.slug;
            const stream = new PassThrough();
            var buffers = [];

            read.data.excel.pipe(stream); //this will trigger the stream events like 'data', 'end'

            await new Promise(async (resolve,reject)=>{
                stream.on('data',(dataChunk)=>{
                    buffers.push(dataChunk);
                });

                stream.on('end',async()=>{
                    var buffer = Buffer.concat(buffers);
                    var workbook = XLSX.read(buffer, { type: "buffer", cellText: true, cellDates: true, dateNF: 'dd"."mm"."yyyy', cellNF: true, rawNumbers: false });
                    var data = [];
                    var sheets = workbook.SheetNames;

                    for(var i=0;i<sheets.length;i++){
                        const temp = XLSX.sheet_to_json(
                            workbook.sheets[workbook.SheetNames[i]],
                            { cellText: true, cellDates: true, dateNF: 'dd"."mm"."yyyy', rawNumbers: false }
                        );

                        temp.forEach((res,index)=>{
                            if (index == 0) return;
                            data.push(JSON.parse(JSON.stringify(res)))
                        });

                        console.log('')
                    }
                })
            })
        }
    })


})


