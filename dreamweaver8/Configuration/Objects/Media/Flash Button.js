//
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
// ----------------------------------------------------
//
// Flash Button.js
//
// See Commands/Flash Button.js for implementation of
// Insert Flash Button object
//

//
// ---- Object API ---
//
function objectTag()
{
  var flashButtonCmdURL, flashButtonDoc, retVal, theURL;
  if (!dw.getDocumentPath("document"))
  {
    alert(MSG_PleaseSaveDocument);
//	theURL = dreamweaver.browseForFileURL("save");
//	if (!theURL)
	  return "";
//	else
//	  dreamweaver.saveDocument(dw.getDocumentDOM(), theURL);
  }

  if (dreamweaver.getDocumentDOM().getIsTemplateDocument())
	if (!confirm(MSG_ConfirmTemplateSWF))
      return "";

  flashButtonCmdURL = dreamweaver.getConfigurationPath() + "/Commands/Flash Button.htm";
  flashButtonDoc    = dreamweaver.getDocumentDOM( flashButtonCmdURL);
  retVal = callCommand("Flash Button");

  return retVal="";
}

