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
  if ((theSel[0] != theSel[1]) && (dw.getFocus(true) != 'document'))
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
    changeTagCase(arguments[0]);
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
  if (arguments[0] == "tagToLowerCase")
    return Menu_HC_TagsToLowercase;
  else if(arguments[0] == "tagToUpperCase")
    return Menu_HC_TagsToUppercase;
}

//***************    LOCAL FUNCTIONS   ***************
//--------------------------------------------------------------------
// FUNCTION:
//   changeTagCase()
//
// DESCRIPTION:
//   changes case of the tag.
//
// ARGUMENTS:
//   tagCaseType - case type, Upper or Lower case
//
// RETURNS:
//   nothing
//
//--------------------------------------------------------------------

function changeTagCase(tagCaseType)
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
    //skip if tag is PHP (<? ?>) or ASP/JSP (<% %>) of comments (<! >)
    if (selText.charAt(openTagIndex + 1) == "?" || 
        selText.charAt(openTagIndex + 1) == "%" ||
        selText.charAt(openTagIndex + 1) == "!")
    {
      openTagIndex = selText.indexOf("<",openTagIndex + 1);
      continue;
    }

    //get the first closing tag index after first opening tag
    closingTagIndex = selText.indexOf(">",openTagIndex + 1);
    //get the next opening tag index after first opening tag
    nextOpenTagIndex = selText.indexOf("<",openTagIndex + 1);
    //change the tag case
    if((closingTagIndex != -1) && (nextOpenTagIndex != -1))
    {
      if(closingTagIndex < nextOpenTagIndex)
      {
        selText = changeCaseForOneTag(selText,openTagIndex,closingTagIndex,tagCaseType);
        openTagIndex = nextOpenTagIndex;
      }
      else
      {
        selText = changeCaseForOneTag(selText,openTagIndex,nextOpenTagIndex,tagCaseType);
	    openTagIndex = selText.indexOf("<", nextOpenTagIndex + 1);
      }
    }      
    else if(closingTagIndex != -1)
    {
      selText = changeCaseForOneTag(selText,openTagIndex,closingTagIndex,tagCaseType);      
      openTagIndex = nextOpenTagIndex;
    }
    else if(nextOpenTagIndex != -1)
    {
      selText = changeCaseForOneTag(selText,openTagIndex,nextOpenTagIndex,tagCaseType);      
      openTagIndex = selText.indexOf("<", nextOpenTagIndex + 1);
    }
    else
    {
      if(tagCaseType == "tagToLowerCase")
        selText = selText.substring(0,openTagIndex) + selText.substr(openTagIndex).toLowerCase();
      else if(tagCaseType == "tagToUpperCase")
        selText = selText.substring(0,openTagIndex) + selText.substr(openTagIndex).toUpperCase();
      
      openTagIndex = selText.indexOf("<", openTagIndex + 1);
    }    
  }    
   
  //replace the selected text with the modified text.
  if(dw.canShowDesignView(theDOM))
    theDocEl.outerHTML = theWholeDoc.substring(0,theSel[0]) + selText + theWholeDoc.substr(theSel[1]);
  else
    theDOM.source.replaceRange(theSel[0],theSel[1],selText);
    
  // Set the selection back to the starting point of selection
  theDOM.source.setSelection(theSel[1],theSel[1]);  
} 

//--------------------------------------------------------------------
// FUNCTION:
//   changeCaseForOneTag()
//
// DESCRIPTION:
//   changes case of the tag.
//
// ARGUMENTS:
//   selText - selected Text
//   openTagIndex - opening tag index
//   nextTagIndex - next opening or closing tag index.
//   tagCaseType - case type, Upper or Lower case
//
// RETURNS:
//   return - text with changed tag case.
//
//--------------------------------------------------------------------

function changeCaseForOneTag(selText,openTagIndex,nextTagIndex,tagCaseType)
{
  var startIndex = openTagIndex;
  var tagString = selText.substring(openTagIndex+1,nextTagIndex);
  var cfifPattern = /^\s*cf(else)*if/i;
  var cfsetPattern = /^\s*cfset\s+/i;
  var cfreturnPattern = /^\s*cfreturn/i;
  var exceptionalTags = (tagString.search(cfifPattern) == 0) || (tagString.search(cfsetPattern) == 0) || (tagString.search(cfreturnPattern) == 0);

  if (exceptionalTags)
  {
    var endIndex = selText.indexOf(" ", openTagIndex+1);
    if (endIndex == -1)
      endIndex = selText.indexOf(">", openTagIndex+1);
    if (endIndex != -1)
      selText = selText.substring(0,startIndex) + changeCase(selText,startIndex,endIndex,tagCaseType);
    return selText;
  }
  
  var nextAttrIndex = tagString.search(/\S+\s*=\s*["']/);
  var tempStr = selText.substr(openTagIndex);

  if (nextAttrIndex != -1)
    nextAttrIndex += openTagIndex;
    
  while (nextAttrIndex != -1 && nextAttrIndex < nextTagIndex)
  {
    tempStr = selText.substr(nextAttrIndex);
    var startQuoteIndex = nextAttrIndex+tempStr.search(/["']/);
    var quoteChar = selText.charAt(startQuoteIndex);
    var endQuoteIndex = selText.indexOf(quoteChar, startQuoteIndex+1);

    // skip all escaped quotes
    while (endQuoteIndex != -1 && selText.charAt(endQuoteIndex-1) == "\\")
      endQuoteIndex = selText.indexOf(quoteChar, endQuoteIndex+1);
	
    selText = selText.substring(0,startIndex) + changeCase(selText,startIndex,startQuoteIndex,tagCaseType);
    if (endQuoteIndex != -1)
      startIndex = endQuoteIndex+1;
    else
      startIndex = startQuoteIndex+1;
    tempStr = selText.substr(startIndex);
    nextAttrIndex = tempStr.search(/\S+\s*=\s*["']/);
    if (nextAttrIndex != -1)
      nextAttrIndex += startIndex;
  }
  if (startIndex < nextTagIndex)
    selText = selText.substring(0,startIndex) + changeCase(selText,startIndex,nextTagIndex,tagCaseType);

  return selText;
}

//--------------------------------------------------------------------
// FUNCTION:
//   changeCase()
//
// DESCRIPTION:
//   changes case of a block of text.
//
// ARGUMENTS:
//   selText - selected Text
//   startIndex - start index of the block
//   endIndex - end index of the block
//   tagCaseType - case type, Upper or Lower case
//
// RETURNS:
//   return - text with changed tag case.
//
//--------------------------------------------------------------------

function changeCase(selText,startIndex,endIndex,tagCaseType)
{
  //change the tag case according to the tagCaseType.
  if(tagCaseType == "tagToLowerCase")
    selText = selText.substring(startIndex,endIndex + 1).toLowerCase() + selText.substr(endIndex + 1);
  else if(tagCaseType == "tagToUpperCase")
    selText = selText.substring(startIndex,endIndex + 1).toUpperCase() + selText.substr(endIndex + 1);
  return selText;
}
