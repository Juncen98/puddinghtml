// Copyright 2005 Macromedia, Inc. All rights reserved.

// FlashVideo.js
//
// See Commands/FlashVideo.js for implementation of
// Insert Flash Video object
//
//
// ---- Object API ---
//
function objectTag()
{
  var filePath = dw.getDocumentPath("document");
  var errMsg = "";

   // save document if not saved
  if (!filePath) 
  {
    if (confirm(MM.MSG_NeedSavedDocumentForFlashVideoObj) && 
        dw.canSaveDocument(dreamweaver.getDocumentDOM())) 
    {
      dw.saveDocument(dreamweaver.getDocumentDOM());
      filePath = dw.getDocumentPath("document");
    }
  }
 
  if (!filePath || errMsg)
  {
    if (errMsg) alert(errMsg)
  }
  else
  {
    dwscripts.callCommand("FlashVideo.htm");
  }

  return "";
}
