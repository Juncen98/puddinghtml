//
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
// ----------------------------------------------------
//
// Flash Text.js
//
// See Commands/Flash Text.js for implementation of
// Insert Flash Text object
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
	return "";
  }

  if (dreamweaver.getDocumentDOM().getIsTemplateDocument())
	if (!confirm(MSG_ConfirmTemplateSWF))
      return "";

  retVal = callCommand("Flash Text");
  return "";
}