// using { CE_DIRECTACTIVITYALLOCATION_0001 as mySrv } from './external/CE_DIRECTACTIVITYALLOCATION_0001';
using { myproj.employeeDtls as empDtls } from '../db/apihub';
using { myproj } from '../db/apihub';


service MyService @(path : '/myCustomService'){

    // entity ActivityAllocation as projection on mySrv.ActivityAllocation;  //through APIHUB api
    entity empDetails as projection on empDtls; //through db table
    entity mediaFile as projection on myproj.mediaFile; //for file upload into db table directly

    @cds.persistence.skip
    @odata.singleton
    entity readDataFromExcel {
        @Core.MediaType : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        excel : LargeBinary;
    }

}