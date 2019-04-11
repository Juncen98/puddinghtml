// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved

//---------------   GLOBAL VARIABLES   ---------------

var helpDoc = MM.HELP_objTabularData;

//---------------     API FUNCTIONS    ---------------

function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	// This means this object/command is guaranteed to not use the DOM of the current document,
	// except for dw.getDocumentDOM().source...
	return false;
}

function commandButtons(){
   return new Array(MM.BTN_OK,         "createTableStr()",
                    MM.BTN_Cancel,     "window.close()",
                    MM.BTN_Help,       "displayHelp()" );
}

//---------------    LOCAL FUNCTIONS   ---------------

function setTableFileToImport() {
  var fName = dw.browseForFileURL('open','', false, true);
  if (fName) {
    document.forms[0].DataFile.value =  fName;
    setDelimiter(fName);
  }
}

//function:setDelimiter
//description: after choosing a file, set delimiter select menu
//based on file type, e.g.: set it to Comma if a *.csv file is chosen

function setDelimiter(fileName){
   var selDelimiter = document.forms[0].Delimiter;
   var extension = fileName.substring(  fileName.indexOf(".")  );
   
   if (extension==".csv")   selDelimiter.selectedIndex = 1; //comma
   if (extension==".xls")   alert( ERROR_Unsupported_Format + ERROR_Supported_Formats);
   //if we support more formats in the future
   //such as space-delimited (.csv), more checks may be added here
}

//function:getDelimiter
//description: returns user-chosen delimiter based on form parameters

function getDelimiter(theForm){
   var retVal;
   var selInd = theForm.Delimiter.selectedIndex;
   
   switch (selInd){
      case 0:
        retVal = "\t";   
        break;
     case 1:
        retVal = ",";
        break;
     case 2:
        retVal = ";";
        break;
     case 3:
        retVal = ":";
        break;
     case 4:
        retVal = theForm.CustomDelimiter.value;
        break;
   }
   return retVal;
}

//function: getNewLineChar
//description: returns newline character

function getNewLineChar(dataStr){
   var retVal;
   
   if (  dataStr.search("\r\n")!= -1)
      retVal = "\r\n";
   else if (  dataStr.search("\n")!= -1)
      retVal="\n";
   else
      retVal="\r";
     
   return retVal;
   
}


//function: getFormatTags
//description: returns a two-item array representing opening and closing 
//format tags to be used in the first row based on FormatTopRow form parameter

function getFormatTags(theForm){
   var retVal = new Array("","");
   var selInd = theForm.FormatTopRow.selectedIndex;
   
   switch (selInd){
      case 1:
        retVal[0] = "<b>";
         retVal[1] = "</b>";
       break;
     case 2:
        retVal[0] = "<i>";
        retVal[1] = "</i>";
       break;
     case 3:
        retVal[0] = "<b><i>";
        retVal[1] = "</i></b>";
       break;  
   }
   return retVal;
}


//function: createTableStr
//description: creates the html table based on the form parameters

function createTableStr(){
   var theForm = document.forms[0];
   var delimiter = getDelimiter(theForm);
   if (!delimiter){
      alert(ERROR_No_Delimiter);
     return;
   }
   if (delimiter.length>1){
      alert(ERROR_Incorrect_Delimiter);
     return;
   }
   var bAutoWidth = theForm.Width[0].checked;
   if (!bAutoWidth){
      var unitChoice = (theForm.WidthUnit.selectedIndex==0)?'%':'';
     var width = theForm.WidthValue.value + unitChoice;
   }
   var cellSpacing = theForm.CellSpacing.value;
   var cellPadding = theForm.CellPadding.value;
   var border = theForm.Border.value;
   var formatFirstRowArr = getFormatTags(theForm);   
   var openTag = createOpenTableTag(width,border,cellSpacing,cellPadding);
   
   var dataFile = theForm.DataFile.value;
   if ( dataFile && dataFile.substring(dataFile.lastIndexOf(".")) == ".xls"){
      alert(ERROR_Unsupported_Format + ERROR_Supported_Formats);
     return;
   }
   
   var tableFileURL = getFullPath(dataFile);
   if (  !verifyFilePath(tableFileURL)  )
      return;
     
   MM.setBusyCursor();
   var dataStr = DWfile.read(tableFileURL, dw.getDocumentDOM().getCharSet());
   var newline = getNewLineChar(dataStr);
   
   if (dw.getFocus(true) == "html" || dw.getFocus() == "textView") {
   	  selArray = dw.getDocumentDOM().source.getSelection();
      dw.getDocumentDOM().source.replaceRange(selArray[0], selArray[1], 
      	openTag + createTableBody(dataStr,delimiter,newline,formatFirstRowArr) + 
               "</TABLE>");
   } else {    
   	  dw.getDocumentDOM().insertHTML( openTag + createTableBody(dataStr,delimiter,newline,formatFirstRowArr) + 
               "</TABLE>" );
   }

   MM.clearBusyCursor();

   // save settings for next time
   dwscripts.saveExtension(document,["DataFile"]);

   window.close();
  
}

//function: verifyFilePath
//description: verify that file path is not null and is correct
//and alert correct error message in each case
//returns: true if valid, false if invalid

function verifyFilePath(fileURL){
   retVal = true;
   
   //if no file path or incorrect file path, alert error message
   if ( !fileURL ){
      alert(ERROR_No_File)
      retVal=false;
   } else if (  !DWfile.exists( fileURL)  ){
      alert(ERROR_Incorrect_File_Path)
      retVal=false;
   }
   return retVal;
}

//function: createOpenTableTag
//description: creates an open table tag based on argument values

 function createOpenTableTag(width,border,cellSpacing,cellPadding){
    var openTag = '<TABLE';
   
   if (width)         openTag +=' width="' + width + '"';
   if (border)        openTag +=' border="' + border + '"';
   if (cellSpacing)   openTag +=' cellspacing="' + cellSpacing + '"';
   if (cellPadding)   openTag +=' cellpadding="' + cellPadding + '"';
   
   return openTag + '>';
 
 }
 
//function: getTableCells
//description:returns an array of the table cell data.
//Parses row data to take into account cases where
//the delimiter is included in the cell.
//For example, if the delimiter is a comma
//ensures we don't divide the data at the comma in "Doe, Jane".
//Note:Excel places double quotes around data with reserved characters
//and surrounds double quotes with quotes.
//Examples:
//Excel (.xls file)  ->  Delimited file
//Doe,Jane    ->       "Doe,Jane"
//My name is "Jane" ->  "My name is ""Jane"""
//
//Arguments:
//rowData - text string from original file that represents
//one row of data
//delimiter - character used to separate entries


 function getTableCells(rowData,delimiter){
    var retArr = new Array();
   var startingOffset = 0;
   var endingOffset = 0;
   var cellData="";
   var qualifier='"'; //qualifer is double quotes
   var dataLen=0;
   var rowDataLen = 0;
   var qualifierCount = 0;
   var i,j;
   var lastInd;
   
   // Optimization
   //if tab-delimited, just split data at tabs and return.
   if (delimiter == "\t") {
      retArr = rowData.split(delimiter);
      return retArr;
   }
   
   
   //When we encounter a delimiter, we want to determine if the
   //the delimiter is separating data: e.g: a,b,c, or
   //if it included in the cell data: "Doe, Jane"
   //To accomplish this goal, we count the number of double quotes
   //between the beginning of the data and the delimiter character 
   //that we find.
   //If this number is even, we have completed getting the cell data.
   //If it is odd, the cell data is not complete so we step
   //through until reaching the next delimiter and repeat the 
   //double-quote test.
   
   rowDataLen = rowData.length;
   lastInd = rowDataLen - 1;
   for (i=0;i<rowDataLen;i++){

      if (  rowData.charAt(i)==delimiter || i == lastInd ){
         endingOffset = i;
        if (  i!=lastInd || rowData.charAt(lastInd) == delimiter  ){
           cellData = rowData.substring(startingOffset,endingOffset);
        } else {
           cellData = rowData.substring(startingOffset);
        }       
        //The way we are dividing the data, the delimiter character
        //is the first character in all but the first data string
        //We want to delete it.
        if ( cellData[0] == delimiter ){
           if (  cellData.charAt(1)  )
             cellData = cellData.substring(1);
           else
             cellData = "";
        }
      
        //Go through the cell data and count the number of double quotes
        //I've assigned the double quotes to a qualifier variable
        //to make it easy to allow custom qualifiers in future versions
        if (cellData){
           dataLen = cellData.length;
           for (j=0;j<dataLen;j++){
              if (cellData.charAt(j) == qualifier)
                qualifierCount++;
           }
        }

        //if this is the complete cell data, add it to the return array
        //and reset start offset to the end of the cell data we have
        //just processed
        if (qualifierCount%2==0){ 
           retArr[retArr.length] = cellData;  
          startingOffset = endingOffset; 
        } 
      }
      qualifierCount=0;
   }
   //if far right cell is blank, add last cell to return array:
   if (  rowData.charAt( lastInd )==delimiter  )
      retArr[retArr.length] = "";

   return retArr; // Note: optimization return at beginning of function.
}
 
 
 //function: createTable
 //description: creates the body of the table based on the contents of the
 //tabular data file. Parses contents of tabular data file.

function createTableBody(dataStr, colDelim, rowDelim, formatFirstRowArr) {
  var openCellFormat = '<td>' + formatFirstRowArr[0];
  var closeCellFormat = formatFirstRowArr[1] + '</td>';
  var emptyFormat = '<td>&nbsp;</td>';
  var escapeChar = '"';
  var rtnArr = new Array();
  var startLoc = 0, curRow = new Array();
  var curRow = new Array();
  var curChar, escapedStr = '';
  var cellContents = '';
  
  // Collect rows of data.
  for (var curLoc = 0; curLoc < dataStr.length; curLoc++) {
    curChar = dataStr.charAt(curLoc);
    if (curChar == escapeChar) {
      escapedStr = '';
      // Ignore everything until we get to the ending escape character.
      for (curLoc++; curLoc < dataStr.length; curLoc++) {
        curChar = dataStr.charAt(curLoc);
        // Look for the ending escape character
        if (curChar == escapeChar) { // Possibly ending escape character
          if (dataStr.charAt(curLoc) == dataStr.charAt(curLoc+1)) {
            // Nope, just the escaped escape character.
            escapedStr += dataStr.substring(startLoc+1,curLoc+1);
            // Save the string and keep looking.
            curLoc++; // Throw away the extra escape character.
            startLoc = curLoc;
          } else {
            // Found the terminating escape
            escapedStr += dataStr.substring(startLoc+1,curLoc).replace(/(\r\n)|[\r\n]/g,'<br>');
            startLoc = curLoc+1;
            break; // Break out of inner for loop.
          }
        }
      }
    } else if (curChar == colDelim) {
      cellContents = escapedStr + dataStr.substring(startLoc,curLoc);
      if (cellContents) {
         curRow.push(openCellFormat + cellContents + closeCellFormat);
      } else {
         curRow.push(emptyFormat);
      }
      escapedStr = '';
      startLoc = curLoc+1;

    } else if (curChar == rowDelim.charAt(0)) {
      cellContents = escapedStr + dataStr.substring(startLoc,curLoc);
      if (cellContents) {
         curRow.push(openCellFormat + cellContents + closeCellFormat);
      } else {
         curRow.push(emptyFormat);
      }
      openCellFormat = '<td>';
      closeCellFormat = '</td>';
      escapedStr = '';
      startLoc = curLoc + rowDelim.length;
      rtnArr.push('<tr>' + curRow.join('') + '</tr>');
      curRow = new Array();
    }
  }
  cellContents = escapedStr + dataStr.substring(startLoc,curLoc);
  if (cellContents) {
     curRow.push(openCellFormat + cellContents + closeCellFormat);
  } else if (curRow.length > 0) {
     curRow.push(emptyFormat);
  }
  if (curRow.length > 0) {
    rtnArr.push('<tr>' + curRow.join('') + '</tr>');
  }
  return rtnArr.join('');
}


//function: toggleCustomField
//description: if Other is chosen in the Delimiter Type select list,
//this function makes a text entry field dynamically appear. Also
//hides it if Other is not chosen

function toggleCustomField(optionText){
   // Ignore OptionText because it is localized.
   var theForm = document.forms[0];
   // The "other" option is always last, check if the last option is selected.
   if (theForm.Delimiter.options.length==(theForm.Delimiter.selectedIndex+1)){
      findObject("DelimiterSpan").innerHTML = '<input type="text" maxlength="1" name="CustomDelimiter" size="7">';
   } else {
      findObject("DelimiterSpan").innerHTML = '';
   }
}


//function: innitializeUI
//description: loads the select menus with localized text strings
//and performs other tasks relating to initializing the UI

function initializeUI(){

   var theForm = document.forms[0];

   //If "other" is chosen in the delimiter type select widget, a
   //text field is dynamically added allowing the user to enter a
   //custom delimiter.
   //If this happens, the height of the table cell is re-calculated
   //(which is visually jarring) unless we include a text field in the 
   //table row when loading the file. the line below hides this field:
   findObject("DelimiterSpan").innerHTML="";
   
   //put focus in data file name field
   theForm.DataFile.focus();
   
   //place localized text strings in select widgets
   //variable name note: variable names preceded by sel
   //indicate a select widget object
   
   var selDelimiter = theForm.Delimiter;
   var selFormatTopRow = theForm.FormatTopRow;
   var selWidthUnit = theForm.WidthUnit;
   
   loadSelectList(selDelimiter,OPTIONS_Delimiters);
   loadSelectList(selFormatTopRow,OPTIONS_Formatting);
   loadSelectList(selWidthUnit,OPTIONS_Units);
   enableBuddy("true")
}

function enableBuddy(OnOff){
   var theForm = document.forms[0];
   var selWidthUnit = theForm.WidthUnit;

   if (OnOff=="true") {
      selWidthUnit.setAttribute("disabled","disabled");
      theForm.WidthValue.setAttribute("disabled","disabled");	
   } else {
      selWidthUnit.removeAttribute("disabled");
      theForm.WidthValue.removeAttribute("disabled");	
   }
}
