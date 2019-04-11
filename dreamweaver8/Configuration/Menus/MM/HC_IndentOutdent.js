// Copyright 2003 Macromedia, Inc. All rights reserved.

//******************* API **********************
//-------------------------------------------------------------------
// FUNCTION:
//   isDOMRequired()
//
// DESCRIPTION: 
//  Standard API, specifies whether the 
//  command requires a valid DOM to operate.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   true : if the DOM is required
//   false: if the DOM is not required. 
//-----------------------------------------------------------------

function isDOMRequired() 
{ 
  // Return false, indicating that this command is available in code view.
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
  indentOutdent(arguments[0]);
}

//-------------------------------------------------------------------
// FUNCTION:
//   setMenuText()
//
// DESCRIPTION: 
//  Specifies the text that should appear in the menu.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   The string that should appear in the menu.
//-------------------------------------------------------------------
function setMenuText()
{
  if (arguments[0] == "indent")
    return Menu_HC_Indent;
  else if(arguments[0] == "outdent")
    return Menu_HC_Outdent;
}


//***************    LOCAL FUNCTIONS   ***************
//--------------------------------------------------------------------
// FUNCTION:
//   indentOutdent()
//
// DESCRIPTION:
//   Moves selected source view text one tab stop to the right or left.   
//
// ARGUMENTS:
//   type - Indent or outdent types
//
// RETURNS:
//   nothing
//
//--------------------------------------------------------------------

function indentOutdent(indentType) 
{  
  // Get the DOM
  var theDOM = dw.getDocumentDOM();
   
  if (theDOM == null)
	return;
	
 if (indentType == "indent")
    theDOM.source.indentTextView();
  else if(indentType == "outdent")
    theDOM.source.outdentTextView();
}
