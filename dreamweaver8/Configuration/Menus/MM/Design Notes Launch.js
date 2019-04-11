// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//******************* GLOBALS **********************

var CMD_TO_LAUNCH = "Design Notes.htm";


//***************** API  ******************

function canAcceptCommand() {
  var retVal = true;             //always true for document window
    
  if (dw.getFocus(true) == 'site')  {
    // getSiteSelFile() returns true if a single file or folder within the
    // site is selected, and false if a drive or the site root folder 
    // is selected.
    retVal = (getSiteSelFile() != false); 
    
  }
  else if (dw.getDocumentDOM() == null){
    retVal = false;
  }
  
  return retVal;
}

//***************** LOCAL FUNCTIONS  ******************

function initializeUI() {
  var filePath = "", src, metafile;

  MMNotes.UpdateSite = false;

  //ensure file is saved

  if (dw.getFocus(true) == 'site')
  { //if called for site window
    if (site.getFocus().toLowerCase() != "remote") { //local or map file selected
      src = getSiteSelFile();
      if (src) 
			{ 
			  //single selection
				//if the docURL is not defined , default to src
				var docURL = src;
				if (dw.getDocumentDOM() != null)
				{
					docURL = dw.getDocumentDOM().URL;
				}
        var fObj = new File(src,docURL);
        filePath = fObj.getAbsolutePath(); //resolve the local path of the selection
        if (fObj.canWrite()) {
		  MMNotes.FileInfo_isWriteable = true;
		  MMNotes.UpdateSite = true;
		}
		else {
          alert(MSG_ReadOnlyFile);
          filePath = fObj.getAbsolutePath(); //resolve the local path of the selection
		  MMNotes.FileInfo_isWriteable = false;
        }
      }
    } else {
      alert(MSG_RemoteFileSel);
    }

  } else {                        //called for doc window
    filePath = dreamweaver.getDocumentPath("document");
    if (!filePath) {
      if (confirm(MSG_WantSave) && dw.canSaveDocument(dreamweaver.getDocumentDOM('document'))) {
        dw.saveDocument(dreamweaver.getDocumentDOM('document'));
        filePath = dreamweaver.getDocumentPath("document");
      }
    } else { //file exists, ensure it's writeable
      var fObj = new File(filePath);
      if (fObj.canWrite()) {
		MMNotes.FileInfo_isWriteable = true;
	  }
	  else {
        //filePath = "";           //clear, because we can't edit
        MMNotes.FileInfo_isWriteable = false;
		alert(MSG_ReadOnlyFile);
      }

    }
  }

  if (filePath) {
    metafile = (MMNotes.open(filePath));  //open, or create metafile
    if (metafile) {                            //if okay to open
      MMNotes.close(metafile);                  //close it
      MMNotes.FileInfo_filePath = filePath;     //store the filePath as a global
      dreamweaver.popupCommand(CMD_TO_LAUNCH); //launch the command
    } else {
      if(!MMNotes.getSiteRootForFile(filePath)) { // if this file is not in a site
        site.tryDefineOrEditSite("design notes"); // ask user to define or
        return;                                   // edit site
      }
      alert(MSG_MetaDisabled);
    }
  }
}


function getSiteSelFile() {
  var fileList = site.getSelection();
  
  // do not return true if the items selected are disk volumes, or
  // if the site root folder is selected.
  for (i=0; i < fileList.length; i++)
  {
    var file = fileList[i];
    var urlPrefix = "file:///";
    var strTemp = file.substr(urlPrefix.length);
    if(strTemp.indexOf("/") == -1 || file == dw.getSiteRoot().substring(0,dw.getSiteRoot().length-1))
      return false;
  }
  
  return ((fileList.length == 1)? fileList[0] : false);
}
