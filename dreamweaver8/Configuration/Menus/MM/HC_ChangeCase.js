// Copyright 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//******************* API **********************
//-------------------------------------------------------------------
// FUNCTION:
//   canAcceptCommand()
//
// DESCRIPTION: 
//   Determines whether the menu item should be active or dimmed. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   Boolean value that indicates whether the item should be enabled.
//--------------------------------------------------------------------

function canAcceptCommand()
{
  // Get the DOM 
  var theDOM = dw.getDocumentDOM();
  
  if (theDOM == null)
	return false;
	
  // Get the offsets of the selection
  var theSel = theDOM.source.getSelection();
  var selText = theDOM.source.getText(theSel[0],theSel[1]);
  var regExp;
  if (arguments[0] == "lowerCase")
    regExp = /[A-Z]+/;
  else if(arguments[0] == "upperCase")
    regExp = /[a-z]+/;
    
  if(regExp.test(selText) && (dw.getFocus(true) != 'document'))
    return true;
  else
    return false;
}

//-------------------------------------------------------------------
// FUNCTION:
//   receiveArguments()
//
// DESCRIPTION: 
//  Processes any arguments that are passed from a menuitem item.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//-----------------------------------------------------------------

function receiveArguments()
{
    changeCase(arguments[0]);
}

//-------------------------------------------------------------------
// FUNCTION:
//   setMenuText()
//
// DESCRIPTION: 
//   Specifies the text that should appear in the menu.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   The string that should appear in the menu.

//-------------------------------------------------------------------

function setMenuText()
{
  if (arguments[0] == "lowerCase")
    return Menu_HC_ToLowercase;
  else if(arguments[0] == "upperCase")
    return Menu_HC_ToUppercase;
}

//***************    LOCAL FUNCTIONS   ***************
//--------------------------------------------------------------------
// FUNCTION:
//   changeCase
//
// DESCRIPTION:
//   Converts the case of selected text.
//
// ARGUMENTS:
//   caseType - case type, Upper or Lower case.
//
// RETURNS:
//   nothing
//
//--------------------------------------------------------------------

function changeCase(caseType)
{ 
  // Get the DOM 
  var theDOM = dw.getDocumentDOM();
  // Get the outerHTML of the HTML tag (the
  // entire contents of the document)
  var theDocEl = theDOM.documentElement;
  var theWholeDoc = theDocEl.outerHTML;
  
  // Get the offsets of the selection
  var theSel = theDOM.source.getSelection();
  var selText = theDOM.source.getText(theSel[0],theSel[1]);
 
  var replaceText = "";
  //change the case of the selected text
  if (caseType == "lowerCase")  
    replaceText = selText.toLowerCase();
  else if (caseType == "upperCase")
    replaceText = selText.toUpperCase();
  
  //replace the selected text with the modified text.
  if(dw.canShowDesignView(theDOM))
    theDocEl.outerHTML = theWholeDoc.substring(0,theSel[0]) + replaceText + theWholeDoc.substr(theSel[1]);
  else
    theDOM.source.replaceRange(theSel[0],theSel[1],replaceText);
    
  // Set the selection at the ending point of selection
  theDOM.source.setSelection(theSel[1],theSel[1]);  
}
