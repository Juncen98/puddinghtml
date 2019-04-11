//  Copyright 2005 Macromedia, Inc. All rights reserved.

// ******************* GLOBALS **********************

var helpDoc = MM.HELP_templateDescription;

var PLATFORM = navigator.platform;
var theTextField = null;

// ******************* API **********************

//--------------------------------------------------------------------
// FUNCTION:
//   commandButtons
//
// DESCRIPTION:
//   The list of buttons to display on the right of the dialog,
//   along with the functions to call when they are pressed.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   javascript array
//--------------------------------------------------------------------

function commandButtons()
{
	return new Array( MM.BTN_OK,     "cmdOK()",
                      MM.BTN_Cancel, "cmdCancel()",
                      MM.BTN_Help,   "displayHelp()" );
}

function isDomRequired()
{
	return true;
}

function canAcceptCommand()
{	
	var curDOM = dw.getDocumentDOM(); 	
	if (curDOM == null)
		return false; 
	
	return (curDOM.getIsTemplateDocument());
} //canAcceptCommand
	
function cmdOK()
{
	var curDOM = dw.getDocumentDOM();
	curDOM.disableLocking();

	if (theTextField == null)
		return;

	var value = theTextField.innerHTML;
	var curDOM = dw.getDocumentDOM();	
	var filePtr = MMNotes.open(curDOM.URL, true, false); // force open, not read-only
	if (filePtr)
	{
		if (value == "")
		{
			MMNotes.remove(filePtr, "mm_new_doc_desc");
		}
		else
		{
			MMNotes.set(filePtr, "mm_new_doc_desc", value);
		}
		MMNotes.close(filePtr);
	}

	window.close();
} //cmdOK

function cmdCancel()
{
  	window.close();
} //cmdCancel

function displayHelp()
{
  dwscripts.displayDWHelp(helpDoc);
}



//***************** LOCAL FUNCTIONS  ******************
	
function initializeUI()
{
	theTextField = findObject("desc", null);
	var curDOM = dw.getDocumentDOM();
	if (curDOM.URL != "" && theTextField)
	{
		var filePtr = MMNotes.open(curDOM.URL, false, true); // don't force open, read-only
		if (filePtr)
		{
			var value = MMNotes.get(filePtr, "mm_new_doc_desc");
			if (value)
			{
				theTextField.innerHTML = value;
			}
			MMNotes.close(filePtr);
		}
	}
	window.resizeToContents(); 
} //initializeUI

function adjustButtons()
{
	var theStyle;
	if (PLATFORM=="Win32")
	{
		theStyle=document.okLayer.getAttribute("STYLE");
		theStyle=theStyle.replace(/left:\w*;/,LEFT_LAYER).replace(/top:\w*;/,TOP_LAYER);
		document.okLayer.setAttribute("STYLE", theStyle);
		theStyle=document.cancelLayer.getAttribute("STYLE");
		theStyle=theStyle.replace(/left:\w*;/,RIGHT_LAYER).replace(/top:\w*;/,TOP_LAYER);
		document.cancelLayer.setAttribute("STYLE", theStyle);
	}
}
