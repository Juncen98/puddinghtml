// Copyright 2005 Macromedia, Inc. All rights reserved.

var HELP_DOC = MM.HELP_cmdAttachXSLT;
var LABEL_XSLTFILTER = "XSL (*.xsl;*.xslt)|*.xsl;*.xslt|XSL|";

var _xslFile = new URLTextField("AttachXSLStyleSheet.htm", "xslFile", "");
var _xslBrowseBtn = null;

//*************************API**************************

//--------------------------------------------------------------------
// FUNCTION:
//   commandButtons
//
// DESCRIPTION:
//   Returns the array of buttons that should be displayed on the
//   right hand side of the dialog.  The array is comprised
//   of name, handler function name pairs.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   array of strings - name, handler function name pairs
//--------------------------------------------------------------------

function commandButtons()
{                          
  return new Array(MM.BTN_OK,     "okClicked()",
                   MM.BTN_Cancel, "cancelClicked()",
                   MM.BTN_Help,   "displayHelp()" );
}


//--------------------------------------------------------------------
// FUNCTION:
//   getExistingXSLReference
//
// DESCRIPTION:
//   gets an existing reference to xslt file
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------
function getExistingXSLReference()
{
  var existingXSLTReference = "";
	var aDoc = dw.getDocumentDOM();
	var currentDocText = aDoc.source.getText();
	var styleSheetRegExp = /<\?xml-stylesheet(.*)href\s*=\s*['"]([^\r\n]*?)['"](.*)\?>/ig;
	if (currentDocText && currentDocText.length)
	{
		if (currentDocText.match(styleSheetRegExp) != null)
		{
			existingXSLTReference = RegExp.$2;
		}
	}
	return existingXSLTReference;
}

//--------------------------------------------------------------------
// FUNCTION:
//   okClicked
//
// DESCRIPTION:
//   Sets the return value to the selected DSN and closes the window.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function okClicked()
{
	var aDoc = dw.getDocumentDOM();
	var docURL = aDoc.URL;
	if(docURL.length == 0) 
	{
		alert(dw.loadString("XMLXSL_Attach/SaveFile"));
		return;
	}

  //validate the xslt file name
	var anXSLFile = _xslFile.getValue();
	if (anXSLFile != null)
	{
		if (anXSLFile.length == 0)
		{
			alert(dw.loadString("XMLXSL_SBError/XSLEmpty"));
			return;
		}

		if (!anXSLFile.match(/\.xsl$/i)) 
		{
			alert(dw.loadString("XMLXSL_SBError/NO_XSLFile"));
			return;
		}
	}

	var currentDocText = aDoc.source.getText();
	var styleSheetRegExp = /<\?xml-stylesheet(.*)href\s*=\s*['"]([^\r\n]*?)['"](.*)\?>/ig;
	var styleSheetReference = "<?xml-stylesheet href=\"@@XSLFile@@\" type=\"text/xsl\"?>";
	if (currentDocText && currentDocText.length)
	{
		var existingDocLength = currentDocText.length;
		var existingXSLTRefernece = getExistingXSLReference();
		if (currentDocText.match(styleSheetRegExp) != null)
		{
			//replace the existing stylesheet file with the new 
			var existingXSLFile = RegExp.$2;
			if ((existingXSLFile != null) && (existingXSLFile.length))
			{
				styleSheetReference = styleSheetReference.replace("@@XSLFile@@",_xslFile.getValue());
				currentDocText = currentDocText.replace(styleSheetRegExp,styleSheetReference);
				aDoc.source.replaceRange(0,existingDocLength,currentDocText);
			}
		}
		else
		{
			//add a new reference after the xml node or the beginning of the doc
			var xmlRegExp = /<\s*\?\s*xml\s*/ig;
			var xmlReference = currentDocText.match(xmlRegExp);
			if (xmlReference != null)
			{
					var xmlStartOffset = -1;
					var xmlEndOffset =  -1;
					if (xmlReference.length > 0)
					{
						xmlStartOffset = currentDocText.search(xmlReference[0]);
					}

					if (xmlStartOffset != -1)
					{
						var searchString = currentDocText.substr(xmlStartOffset, existingDocLength - xmlStartOffset);
						xmlEndOffset = xmlStartOffset + searchString.search('>');
					}

					
					if (xmlEndOffset != -1)
					{
						styleSheetReference = styleSheetReference.replace("@@XSLFile@@",_xslFile.getValue());
						// We now have the end of the <?xml insert <?xsl-stylesheet
						currentDocText = currentDocText.substr(0, xmlEndOffset + 1) + '\r\n' + styleSheetReference + 
											currentDocText.substr(xmlEndOffset + 1, existingDocLength);
						aDoc.source.replaceRange(0,existingDocLength,currentDocText);						
					}
			}
			else
			{ 
			  //if the xml declarative is missing (which won't happen generally)
				styleSheetReference = styleSheetReference.replace("@@XSLFile@@",_xslFile.getValue());
				currentDocText = styleSheetReference + '\r\n' + currentDocText;
			  aDoc.source.replaceRange(0,existingDocLength,currentDocText);						
			}
		}
	}
  window.close();
}

//--------------------------------------------------------------------
// FUNCTION:
//   cancelClicked
//
// DESCRIPTION:
//   Closes the window and returns nothing
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function cancelClicked()
{
  dwscripts.setCommandReturnValue("");
  window.close();
}

//--------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//   This function is called by the UI controls to handle UI updates
//
// ARGUMENTS:
//   control - string - the name of the control sending the event
//   event - string - the event which is being sent
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function updateUI(control, event)
{
}

//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//   This function is called in the onLoad event.  It is responsible
//   for initializing the UI.  If we are inserting a recordset, this
//   is a matter of populating the connection drop down.
//
//   If we are modifying a recordset, this is a matter of inspecting
//   the recordset tag and setting all the form elements.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function initializeUI()
{
  // Initialize UI elements
 
  //_ParamName = dwscripts.findDOMObject("ParamName"); 
	_xslFile.initializeUI();
  _xslBrowseBtn = dwscripts.findDOMObject("xslBrowse"); 
  _xslBrowseBtn.setAttribute("value", dw.loadString("XMLXSL_SB/BrowseBtn")); 
	_xslFile.setValue(getExistingXSLReference());
}

//--------------------------------------------------------------------
// FUNCTION:
//   browseForXSLTFile
//
// DESCRIPTION:
//   browses for the xslt file
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function browseForXSLTFile()
{
  var fileName = "";
  var theXSLFilter	= new Array(LABEL_XSLTFILTER);
  fileName = dw.browseForFileURL("select",dw.loadString("XMLXSL_SB/SelectXSLT"),false,false,theXSLFilter);
  if (fileName) 
  {
    // If we are using ColdFusion, then we probably want this URL
    // for a cflocation tag, therefore we should strip any cfoutput tags.
    // This will be a no-op for other server models.
    if (dwscripts.stripCFOutputTags != null)
    {
      fileName = dwscripts.stripCFOutputTags(fileName);
    }    
   _xslFile.setValue(fileName);
  }	
}



//--------------------------------------------------------------------
// FUNCTION:
//   displayHelp
//
// DESCRIPTION:
//   Displays the built-in Dreamweaver help.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function displayHelp()
{
  // Replace the following call if you are modifying this file for your own use.
	dwscripts.displayDWHelp(HELP_DOC);
}