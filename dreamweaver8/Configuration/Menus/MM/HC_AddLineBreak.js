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
  var retVal = (dw.getFocus(true) != 'document');
  // Get the DOM 
  var theDOM = dw.getDocumentDOM();
  
  if (theDOM == null)
	return false;
	
  // Get the offsets of the selection
  var theSel = theDOM.source.getSelection();
  if(theSel[0] != theSel[1]){
    var theNode = theDOM.offsetsToNode(theSel[0],theSel[1]);
    if (theNode && theNode.nodeType == Node.ELEMENT_NODE){
      if (theNode.tagName == 'TR' || theNode.tagName == 'TABLE' || theNode.tagName == 'TD' || theNode.tagName == 'TH'){
        retVal = false;
      }
    }
  }  
  else
    retVal = false;

  return retVal;
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
  return Menu_HC_AddLineBreaks;   
}


//***************    LOCAL FUNCTIONS   ***************
//--------------------------------------------------------------------
// FUNCTION:
//   insertLineBreak
//
// DESCRIPTION:
//   Inserts line break <br>, at the end of   
//   all the selected lines.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//
//--------------------------------------------------------------------

function insertLineBreak()
{
  var theDOM = dw.getDocumentDOM();
  // Get the offsets of the selection
  var theSel = theDOM.source.getSelection();
  //Get the selected Lines
  var arrLines = theDOM.source.getCurrentLines();
  // Get the outerHTML of the HTML tag (the
  // entire contents of the document)
  var theDocEl = theDOM.documentElement;
  var theWholeDoc = theDocEl.outerHTML;
  var tagToInsert;
  var tagToInsertEOL;
  if (theDOM.getIsXHTMLDocument())
  {
    tagToInsert = "<br />";
    tagToInsertEOL = "<br />\r";
  }
  else
  {
    tagToInsert = "<br>";
    tagToInsertEOL = "<br>\r";
  }
  var selText = "";  
  var regExp = /\n/g;
  if (navigator.platform == "Win32")
  	regExp = /\r/g;
	
  selText = theDOM.source.getText(theSel[0],theSel[1]);
  
  //add <br> at the end of every line.
  if(regExp.test(selText))
    selText = selText.replace(regExp, tagToInsertEOL);
  
  //add <br> at the end of selection  
  selText = selText + tagToInsert;
  
  //replace the selected text with the modified text.
  if(dw.canShowDesignView(theDOM))
    theDocEl.outerHTML = theWholeDoc.substring(0,theSel[0]) + selText + theWholeDoc.substr(theSel[1]);
  else
    theDOM.source.replaceRange(theSel[0],theSel[1],selText);
    
  // Set the selection at the end point of modified text
  theDOM.source.setSelection((theSel[0] + selText.length),(theSel[0] + selText.length));
}
