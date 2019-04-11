// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//******************* GLOBALS **********************

var CMD_TO_LAUNCH = "Design Notes.htm";
var KEY_OPEN   = "showOnOpen";

//***************** API  ******************

function canAcceptCommand() {
  return true;
}

//***************** LOCAL FUNCTIONS  ******************

function onOpen() {
  var filePath = "", src, metafile;

  filePath = dw.getDocumentPath("document");
  if (filePath) {                         //if file is saved
    metafile = MMNotes.open(filePath, false, true);  //open, or create metafile
    if (metafile) {                           //if opened ok
      temp = MMNotes.get(metafile,KEY_OPEN);  //read KEY_OPEN
      MMNotes.close(metafile);                //close file
      if (temp && temp.toString().toLowerCase() == "true") { //if KEY_OPEN flag and set to true

        var fObj = new File(filePath);                    //determine if file is writeable
        MMNotes.FileInfo_isWriteable = (fObj.canWrite());

        MMNotes.FileInfo_filePath = filePath;    //store the filePath as a global
        dw.popupCommand(CMD_TO_LAUNCH); //launch the command
  } } }
}
