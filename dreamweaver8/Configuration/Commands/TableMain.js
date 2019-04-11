// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------

var helpDoc = MM.HELP_objTable;
var gDialogShown = false;
var gReturnTag;
var gRepeatRows = false; 

//---------------     API FUNCTIONS    ---------------

function isDOMRequired() {
	return false;
}
	
function commandButtons(){
   return new Array(MM.BTN_OK,         "onOK()",
                    MM.BTN_Cancel,     "window.close()",
                    MM.BTN_Help,       "displayHelp()" );
}

function receiveArguments()
	{	
	gRepeatRows = (arguments.length > 0 && arguments[0] == "repeatRows");
	} //receiveArguments

function onOK()
	{
	if (gRepeatRows)
		{
		//Make sure the rows make sense. 
  		var Rows = document.theForm.Rows.value;
 		var repeatStart = document.theForm.startingRow.value; 
  		var repeatEnd = document.theForm.endingRow.value;
  		
  		if (repeatStart > Rows || repeatEnd < repeatStart || repeatEnd > Rows)
  			{
  			alert(MM.RepeatTableRowsWarning);
  			return;
  			}
  		}
		
	setTableStr();
	window.close();
	}

//Get a row of a table that has edit regions in each cell. 
function getEditTableRow(columnCount)
	{
	var tableRow = ""; 
	  for (i=0; i< Columns; i++)
	  	{
	  	var curCellName = getUniqueRegionName(MM.EditAutonamePreamble, "MMTemplate:Editable", dw.getDocumentDOM("document")); 
	  	var curCell = "<TD>\n<MMTemplate:Editable name=\"" + curCellName + "\">" + dw.getDocumentDOM("document").getNBSPChar() + "</MMTemplate:Editable>\n</TD>";
	    tableRow += curCell;
	   	}
	   	
	 return tableRow = "<"+"TR>" + tableRow + "<"+"/TR>";
	}
			
function setTableStr(){

  var Columns = document.theForm.Cols.value;
  var Rows = document.theForm.Rows.value;
  var Border = document.theForm.Border.value;
  var Width = document.theForm.Width.value;
  var cellSpacing = document.theForm.Cellspace.value;
  var cellPadding = document.theForm.Cellpad.value;
  var unitChoice = document.forms[0].Units.selectedIndex;

  var repeatStart = -1; 
  var repeatEnd = -1; 
  var repeatStartContent = ""; 
  var repeatEndContent = ""; 
  
  if (gRepeatRows)
  	{
  	repeatStart = document.theForm.startingRow.value;
  	repeatEnd = document.theForm.endingRow.value;
  	
  	var regionName = getUniqueRegionName(MM.RepeatAutonamePreamble, "MMTemplate:Repeat", dw.getDocumentDOM("document"));
  	
  	repeatStartContent = "<MMTemplate:Repeat name=\"" + regionName + "\">"; 
  	repeatEndContent = "</MMTemplate:Repeat>";
  	}
  	
  var tableCells='<'+'TD>' + dw.getDocumentDOM("document").getNBSPChar() + '<'+'/TD>\n';
  var tableRow='',tableContent='';
  var openTag= '<' + 'table', spaceIndex;
  var widthAttr;

  //change any negative or non-numeric row or column value into 1
  Columns = (parseInt(Columns)== Columns && Columns>0)?Columns:1;
  Rows = (parseInt(Rows)== Rows && Rows>0)?Rows:1;

  //CREATE TABLE
  //determine contents of 1 table row
  for (i=0; i< Columns; i++)
  {
    tableRow += tableCells;
  }
  tableRow = "<"+"TR>\n" + tableRow + "<"+"/TR>\n";
  
  //determine number of table rows & concatenate rows together
  for (i=0; i< Rows; i++)
  {
    if (gRepeatRows && i == repeatStart-1)
    	tableContent += repeatStartContent; 
    
    if (gRepeatRows && i >= repeatStart-1 && i <= repeatEnd -1)
    	tableContent += getEditTableRow(Columns); 
    else
    {
      //if first row, Contribute, and multi-column, add width percentages to table cells
      if (i == 0 && dw.appName == "Contribute" && Columns > 1)
      {
        var colWidth = Math.max(1,Math.round(100/Columns));   //compute percent, not less than 1
        tableContent += tableRow.replace(/(<TD)/gi,'$1 WIDTH="'+colWidth+'\%"');  //add WIDTH="nn%" to TD tags
      }
      //otherwise just add table row code
      else
      {
        tableContent += tableRow;
      }
    }
    
    if (gRepeatRows && i == repeatEnd - 1)
    	tableContent += repeatEndContent; 
	}
	
	
  //add percent or pixel values to opening tag, if applicable
  if (Width)
    openTag += ' width="'+Width + ((unitChoice == 0)? '%" ' : '"');
  //add border value, if applicable
  if (Border)
    openTag+=' border="' + Border + '" ';
  //add cellspacing value, if applicable
  if (cellSpacing)
    openTag+=' cellspacing="' + cellSpacing + '"';
  //add cellpadding value, if applicable
  if (cellPadding)
    openTag+=' cellpadding="' + cellPadding + '"';

  //strip extra space from openTag, if it exists
  spaceIndex = openTag.length-1
  if (escape(openTag.charAt(spaceIndex))=='%20')
    openTag = openTag.substring(0,spaceIndex);

  openTag += '>\n' + tableContent;

  if (gDialogShown) {
    saveExtension(document)
  }
  gDialogShown = false; // Reset show dialog global.
  
  openTag += '<'+'/table'+'>';
  gReturnTag= openTag;
}


function createTableStr() {

	return gReturnTag;

}
//---------------    LOCAL FUNCTIONS   ---------------

function saveExtension(curDOM) {
  var curHTML = DWfile.read(curDOM.URL);
  var tempFilename = dw.getConfigurationPath() + '/Shared/MM/Cache/empty.htm';
  if (DWfile.exists(tempFilename)) {
    var tempDOM = dw.getDocumentDOM(tempFilename);
    tempDOM.documentElement.outerHTML = curHTML;
	var atrStr = DWfile.getAttributes(curDOM.URL);
    if (tempDOM.body.outerHTML != curDOM.body.outerHTML && (atrStr.indexOf('R') == -1)){
      tempDOM.body.outerHTML = curDOM.body.outerHTML;
      DWfile.write(curDOM.URL, tempDOM.documentElement.outerHTML);
	}
  }
}

function initializeUI()
{	
  document.theForm.Rows.focus(); //set focus on textbox
  document.theForm.Rows.select(); //set insertion point into textbox
  gDialogShown = true;
  gReturnTag = '';
}

