namespace myproj;

using { managed, cuid } from '@sap/cds/common';


entity employeeDtls {
    key id : String(30);
        location : String(120);
        company : String(120);
}

entity mediaFile {
    key id : Integer64;
        @Core.ContentDisposition.Filename : fileName
        @Core.MediaType : mediaType  //@Core.MediaType – It denotes the data element contains media data.
        content : LargeBinary;
        @Core.IsMediaType : true  //@Core.IsMediaType – It denotes the data element contains a MIME type
        mediaType : String;
        fileName : String;
        url : String;
}
