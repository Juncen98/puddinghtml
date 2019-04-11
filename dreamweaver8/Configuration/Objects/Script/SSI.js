// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//---------------     API FUNCTIONS    ---------------

function isDOMRequired()
{ 
	// Return false, indicating that this object is available in code view.
	return false;
}

function objectTag()
{
  var bDialogState = dw.getShowDialogsOnInsert(); // Was dialog shown?
  var newURL = browseForFileURL("select");

  if ((newURL == '') && bDialogState)
    return '';

  // Attempt to get SSI used for connection include file if Server Model is defined for page
  // and the URL doesn't already contain directive syntax.  Nested directives are bad.
  var insertText = "";
  if (newURL.indexOf("<%") == -1 &&
	  newURL.indexOf("<?") == -1 &&
	  dw.getDocumentDOM().serverModel.getDisplayName() != "")
    insertText = dw.getExtDataValue("connectioninc_statement", "insertText");

  // Default to NCSA SSI
  if (insertText == "" || insertText.indexOf('@@connectionURL@@') == -1)
	  insertText = '<!--#include file="@@connectionURL@@" -->';

	if (newURL.substring(0,1) == "/")
	{
		//for PHP_MySQL replaces "require_once" by "virtual" to serve site relative roots
	  var currServerModel = dw.getDocumentDOM().serverModel.getServerName();
		if (currServerModel == "PHP")
		{
			insertText = insertText.replace("require_once", "virtual");
		}
		else if (currServerModel == "JSP")
		{
			//don't replace file with virtual since file directive in JSP
			//supports site relative URL's
		}
		else
		{	
	  // For Apache include, use 'virtual' for site relative file paths, otherwise 'file'
			insertText = insertText.replace("#include file", "#include virtual");
		}
	}
	else
	{
		insertText = insertText.replace("#include virtual", "#include file");
	}

  return (insertText.replace('@@connectionURL@@', newURL));
}

