// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//******************* API **********************
//-------------------------------------------------------------------
// FUNCTION:
//   canAcceptCommand()
//
// DESCRIPTION: 
//  Determines whether the menu item should be active or dimmed. 
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
  // get the selected text
  var selText = theDOM.source.getText(theSel[0],theSel[1]);  
  var tabVal = dreamweaver.getPreferenceInt("Source Format", "Tab Size", 4);
  var tabToSpaces = "";
  
  for(var i=0; i<tabVal; i++)
    tabToSpaces = tabToSpaces + " ";

  if ((selText.indexOf(tabToSpaces) != -1) && (dw.getFocus(true) != 'document'))
    return true;
  else
    return false; 
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
  return Menu_HC_SpacesToTabs;   
}


//***************    LOCAL FUNCTIONS   ***************
//--------------------------------------------------------------------
// FUNCTION:
//   convertSpacesToTabs
//
// DESCRIPTION:
//   converts all qualifying spaces to tabs in the current selection.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//
//--------------------------------------------------------------------

function convertSpacesToTabs() 
{
  // Get the DOM 
  var theDOM = dw.getDocumentDOM();
  // Get the offsets of the selection
  var theSel = theDOM.source.getSelection();
  
  // Get the outerHTML of the HTML tag (the
  // entire contents of the document)
  var theDocEl = theDOM.documentElement;
  var theWholeDoc = theDocEl.outerHTML;
  var selText = "";
  //Get the Tab size from Registry
  var tabVal = dreamweaver.getPreferenceInt("Source Format", "Tab Size", 4);
  
  selText = theDOM.source.getText(theSel[0],theSel[1]);  
  var tabToSpaces = "";
  //get a string of spaces equivalent to one tab.
  for(var i=0; i<tabVal; i++)
    tabToSpaces = tabToSpaces + " ";

  //regular expression for qualifying spaces.
  var regExpSpaces = new RegExp(tabToSpaces,"g");
  //replace all qualifying spaces with tab.
  if(regExpSpaces.test(selText))
    selText = selText.replace(regExpSpaces,"\t");
    
  //replace the selected text with the modified text.
  if(dw.canShowDesignView(theDOM))
    theDocEl.outerHTML = theWholeDoc.substring(0,theSel[0]) + selText + theWholeDoc.substr(theSel[1]);
  else
    theDOM.source.replaceRange(theSel[0],theSel[1],selText);
    
  // Set the selection at the end point of modified text
  theDOM.source.setSelection((theSel[0] + selText.length),(theSel[0] + selText.length));
}

