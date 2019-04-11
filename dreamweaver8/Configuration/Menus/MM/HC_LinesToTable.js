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
//
//-------------------------------------------------------------------

function setMenuText()
{
  return Menu_HC_LinesToTable;   
}

//***************    LOCAL FUNCTIONS   ***************
//--------------------------------------------------------------------
// FUNCTION:
//   convertLinesToTable
//
// DESCRIPTION:
//   Wraps the selection in a <table> tag.   
//   Adds every selected line to the cell of a table.  
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//
//--------------------------------------------------------------------

function convertLinesToTable() 
{
  // Get the DOM
  var theDOM = dw.getDocumentDOM();
  // Get the offsets of the selection
  var theSel = theDOM.source.getSelection();
  //Get the selected Lines
  var arrLines = theDOM.source.getCurrentLines();
  // Get the outerHTML of the HTML tag (the
  // entire contents of the document)
  var theDocEl = theDOM.documentElement;
  var theWholeDoc = theDocEl.outerHTML;
  var selText = "";
  var lineSel;
  var firstLnStartIndex = 0;
  var lastLnEndIndex = 0;
  var regExp;  
  // new line char
  var newLine = "";  
  
  if(navigator.platform != "Win32")
  {
    newLine = "\r";
    regExp = /\r/g;
  }
  else
  {
    newLine = "\r\n";
    regExp = /\r\n/g;
  }

  //check if the selection ends with a new line char
  var selectedText = theDOM.source.getText(theSel[0],theSel[1]);  
  if(arrLines[1] > arrLines[0])
  {
    if(navigator.platform != "Win32" && (selectedText.lastIndexOf(newLine) + 1) == selectedText.length)
      arrLines[1] = arrLines[1] - 1;
 
    if(navigator.platform == "Win32" && (selectedText.lastIndexOf(newLine) + 2) == selectedText.length)
      arrLines[1] = arrLines[1] - 1;
  }
  
  var spaces = "";
  var indentVal = dreamweaver.getPreferenceInt("Source Format", "Indent Size", 2);
  if(indentVal != 0)
  {
    for(var i=0; i<indentVal; i++)
      spaces = spaces + " ";
  } 
  
  //get the start index of the first line of selection.
  lineSel = getLineRange(theDOM,arrLines[0]);
  firstLnStartIndex = lineSel[0];
  
  //get the end index of the last line of selection
  lineSel = getLineRange(theDOM,arrLines[1]);
  lastLnEndIndex = lineSel[1];
  
  selText = theDOM.source.getText(firstLnStartIndex,lastLnEndIndex); 
  
  //wrap each line, of the selected text, in the cell of a table.
  if(regExp.test(selText))
    selText = selText.replace(regExp, ("</td>" + newLine + spaces + "</tr>" + newLine + spaces + "<tr>" + newLine + spaces + spaces + "<td>"));
  
  selText = "<table>" + newLine + spaces + "<tr>" + newLine + spaces + spaces +"<td>" + selText + "</td>" + newLine + spaces + "</tr>" + newLine +"</table>";
  
  //replace the selected text with the modified text.
  if(dw.canShowDesignView(theDOM))
    theDocEl.outerHTML = theWholeDoc.substring(0,firstLnStartIndex) + selText + theWholeDoc.substr(lastLnEndIndex);
  else
    theDOM.source.replaceRange(firstLnStartIndex,lastLnEndIndex,selText);
    
  // Set the selection at the end point of modified text
  theDOM.source.setSelection((firstLnStartIndex + selText.length),(firstLnStartIndex + selText.length));
  
}

//--------------------------------------------------------------------
// FUNCTION:
//   getLineRange
//
// DESCRIPTION:
//   gets the start and end index of a line   
//   
//
// ARGUMENTS:
//   theDOM - Document object
//   line - line number
//
// RETURNS:
//   return - array of start and end index of the line
//
//--------------------------------------------------------------------

function getLineRange(theDOM,line)
{
  var range;
  var lineSel;
  if(theDOM.getView() == "code")
  {
    theDOM.setView("code");
    theDOM.source.setCurrentLine(line);
    theDOM.source.endOfLine(true);
    range = theDOM.source.getSelection();
  }
  else
  {
    range = new Array(2);
    theDOM.source.setCurrentLine(line);    
    lineSel = theDOM.source.getSelection();
    range[0] = lineSel[0];
    var bol = theDOM.source.setCurrentLine(line+1);
    lineSel = theDOM.source.getSelection();  
    var selText = theDOM.source.getText(range[0],lineSel[0]);
    var reg = /\r/;

    if(navigator.platform != "Win32")
      range[1] = lineSel[0]-1;  
    else
      range[1] = lineSel[0]-2;
      
    //check if there exists no next line. 
    if(!reg.test(selText))
      range[1] = lineSel[0];
      
    range[1] = ((range[0] > range[1]) ? range[0] : range[1]);    
  }
  return range;
}
