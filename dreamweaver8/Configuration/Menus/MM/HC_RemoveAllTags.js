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
      if (theNode.tagName == 'TR' || theNode.tagName == 'TD' || theNode.tagName == 'TH'){
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
  return Menu_HC_RemoveAllTags;   
}

//***************    LOCAL FUNCTIONS   ***************
//--------------------------------------------------------------------
// FUNCTION:
//   removeAllTags()
//
// DESCRIPTION:
//   Removes all Tags from the selected lines
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//
//--------------------------------------------------------------------

function removeAllTags() 
{
  // Get the DOM
  var theDOM = dw.getDocumentDOM(); 
  // Get the offsets of the selection
  var theSel = theDOM.source.getSelection();
  
  // Get the outerHTML of the HTML tag (the
  // entire contents of the document)
  var theDocEl = theDOM.documentElement;
  var theWholeDoc = theDocEl.outerHTML;
  var selText = theDOM.source.getText(theSel[0],theSel[1]);
  
  //Get first index of opening tag
  var openTagIndex = selText.indexOf("<");
  var nextOpenTagIndex;
  var closingTagIndex;
 
  //iterate until opening tag exists
  while(openTagIndex != -1)
  {    
    //get the first closing tag index after first opening tag
    closingTagIndex = selText.indexOf(">",openTagIndex + 1);
    //get the next opening tag index after first opening tag
    nextOpenTagIndex = selText.indexOf("<",openTagIndex + 1);
    
    if((closingTagIndex != -1) && (nextOpenTagIndex != -1))
    {
      if(closingTagIndex < nextOpenTagIndex)
        selText = selText.substring(0,openTagIndex) + selText.substr(closingTagIndex + 1);
      else
        selText = selText.substring(0,openTagIndex) + selText.substr(nextOpenTagIndex + 1);
    }      
    else if(closingTagIndex != -1)
      selText = selText.substring(0,openTagIndex) + selText.substr(closingTagIndex + 1);  
    else if(nextOpenTagIndex != -1)
      selText = selText.substring(0,openTagIndex) + selText.substr(nextOpenTagIndex + 1); 
    else
      selText = selText.substring(0,openTagIndex);
      
    openTagIndex = selText.indexOf("<");
  }  
  //replace the selected text with the modified text.
  if(dw.canShowDesignView(theDOM))
    theDocEl.outerHTML = theWholeDoc.substring(0,theSel[0]) + selText + theWholeDoc.substr(theSel[1]);
  else
    theDOM.source.replaceRange(theSel[0],theSel[1],selText);
    
  // Set the selection at the end point of modified text
  theDOM.source.setSelection((theSel[0] + selText.length),(theSel[0] + selText.length));
} 
