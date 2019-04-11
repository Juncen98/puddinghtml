//
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved. 
// --------------------------------------------------------------------------
//
// Export Table.js
//
// --------------------------------------------------------------------------

//****************** GLOBALS ********************

var helpDoc = MM.HELP_cmdExportTable;

//****************** API ********************

function commandButtons(){
   return new Array(MM.BTN_Export,     "exportTable();window.close()",
                    MM.BTN_Cancel,     "window.close()",
                    MM.BTN_Help,       "displayHelp()" );
}

function canAcceptCommand(){
   if (  !site.windowIsFrontmost() && findTable()  )
      return true;
   return false;
}

//LOCAL FUNCTIONS

//function: getLineBreak
//description: returns line break based on platform

function getLineBreak(theForm){
   var retVal;
   var selInd = theForm.WhichPlatform.selectedIndex;

   switch (selInd){
      case 0:
	     retVal = "\r\n";
		 break;
	  case 1:
	     retVal = "\r";
		 break;
	  case 2:
	     retVal = "\n";
		 break;
   }
   
   return retVal;

}

//function: getDelimiter
//description: returns delimiter based on form parameters

function getDelimiter(theForm){
   var retVal;
   var selInd = theForm.Delimiter.selectedIndex;

   switch (selInd){
      case 0:
	     retVal = "\t";
		 break;
	  case 1:
	     retVal = " ";
		 break;
	  case 2:
	     retVal = ",";
		 break;
	  case 3:
	     retVal = ";";
		 break;
	  case 4:
	     retVal = ":";
		 break;
   }
   return retVal;
}

//function: findTable
//description: returns tableObject that insertion point is in
//returns an empty string if IP not in table

function findTable(){
  var tableObj="";
  var theDoc = dw.getDocumentDOM();
  
  if (!theDoc) return null;
  
  var selArr = theDoc.getSelection();
  // make sure we have a valid selection array
  if (selArr.length != 2) return null;
  // get the selected object
  var selObj = theDoc.offsetsToNode(selArr[0],selArr[1]);

  while (tableObj=="" && selObj.parentNode){
    if (selObj.nodeType == Node.ELEMENT_NODE && selObj.tagName=="TABLE")
	  tableObj=selObj;
	else
	  selObj = selObj.parentNode;
  }
  return tableObj;
}

//function:initializeUI
//description: sets default line breaks based on platform.
//Loads select lists with localized text strings.

function initializeUI(){
   var theForm = document.forms[0];
   var selPlatform = theForm.WhichPlatform;
   var selDelimiter = theForm.Delimiter;

   //load select widgets
   loadSelectList(selPlatform,OPTIONS_Platforms);
   loadSelectList(selDelimiter,OPTIONS_Delimiters);

   //change default line break type based on platform
   if (navigator.platform == "MacPPC")
      selPlatform.selectedIndex = 1;

}


//function: exportOneRow
//description: called from exportTable or exportRows
//exports single row of html table

function exportOneRow(tableRow, delimiter, lineBreak){
   var exportData = "";
   var tableCells = tableRow.childNodes;
   var nCells = tableCells.length;
   var i;
   for (i=0;i<nCells;i++){
      exportData += addQualifiers(getTextNode(tableCells.item(i)), delimiter);
      exportData += delimiter;
   }
   return exportData.substring(0,exportData.length-1) + lineBreak;   
}

//function: exportRows
//description: called from exportTable
//exports several rows of html table - children of 
//thead, tbody or tfoot section

function exportRows(tableSection, delimiter, lineBreak){
   var exportData = "";
   var tableRows = tableSection.childNodes;
   var nRows = tableRows.length;
   var i;
   for (i=0;i<nRows;i++){
      if (tableRows.item(i).tagName=="TR")
         exportData += exportOneRow(tableRows.item(i), delimiter, lineBreak);
   }
   return exportData;
}

//function: exportTable
//description: called from Export button
//exports tabular table based on html table

function exportTable(){
   var exportData = "";
   var footData = "";
   var theForm = document.forms[0];
   var currTable = findTable();
   var lineBreak = getLineBreak(theForm);
   var delimiter = getDelimiter(theForm);
   var tableChildren = currTable.childNodes;
   var nChildren = tableChildren.length;
   var i;
   var footChild = -1;

   for (i=0; i < nChildren; i++) {
      if (tableChildren.item(i).tagName == "THEAD" || tableChildren.item(i).tagName == "TBODY") {
         exportData += exportRows(tableChildren.item(i), delimiter, lineBreak);
	  }
      else if (tableChildren.item(i).tagName == "TFOOT") {
         footData += exportRows(tableChildren.item(i), delimiter, lineBreak);
	  }
	  else if (tableChildren.item(i).tagName == "TR") {
	     exportData += exportOneRow(tableChildren.item(i), delimiter, lineBreak);
	  }
   }
   exportData += footData;
   writeToFile(exportData);
}


//function: writeToFile
//description: writes data to a user specified file
//Arguments:
//exportData = text string to write to a file

function writeToFile(exportData){
   var filePath = dw.browseForFileURL("save",LABEL_ExportAs); //determine file path
   var index;

   if (!filePath) {
      alert(ERROR_No_Save_Path);
	  return;
   }

   index = filePath.lastIndexOf(".")
   if (index == -1 || (filePath.length - index)!=4 )
      filePath += ".csv"
   //save file
   DWfile.write(filePath,exportData,"write","utf-8");
}


//function: addQualifiers
//description: In a delimited file, quotes should be wrapped
//around any data containing double quotes, commas, or a delimiter.
//This function is two fold: One, wrap quotes around any of the
//above listed items. Two, surround any double quotes with double quotes.
//Examples:
//text from table cell  ->  how it should appear in exported file
//Doe, Jane                  "Doe, Jane"
//My name is "Sue"           "My name is ""Sue"""
//Arguments:
//cellData - text string representing text content of table cell
//delimiter - character used to separate data

function addQualifiers(cellData,delimiter){
   
   var dataLen = cellData.length;
   var qualifier = '"'   //qualifier is double quotes
   var counter=0;
   var i; 
   var currChar;
   var bSurroundWithQualifier = false;
   
   //precede all double quotes (") with another, so:
   //  " --> ""
   cellData = cellData.replace(/"/g, '""'); 

   //surround any word containing comma,quotes,or delimiters with double quotes
   dataLen = cellData.length;
   
   for (i=0;i<dataLen;i++){
      if (  cellData.charAt( i ) == "," ||
	        cellData.charAt( i ) == qualifier  ||
			cellData.charAt( i ) == delimiter ){
	  
	           bSurroundWithQualifier = true;
		       break;
			}
   }
   
   if (bSurroundWithQualifier)
      cellData = qualifier + cellData + qualifier;
	  
   return cellData;
 
}

//function: getTextNode
//description: returns the text from a table cell
//returns only the text and not the html markup
//Arguments:
//tableCellObj - a TD object
//Returns:
//the text from that table cell

function getTextNode(tableCellObj){
  var iter=tableCellObj.childNodes;
  var counter=0;
  var child=iter.item(counter);
  var retVal="";

  while (child) {
    retVal+=getTextNode(child);
    child=iter.item(++counter);
  }

  if (tableCellObj.nodeType == Node.TEXT_NODE)
    retVal+=tableCellObj.data;

  // Replace white space 
  retVal = retVal.replace(/\s+/gi,' ');
  retVal = retVal.replace(/^\s+/,'');
  retVal = retVal.replace(/\s+$/,'');

  return retVal;
}

//GENERIC FUNCTIONS
//loadSelectList()
