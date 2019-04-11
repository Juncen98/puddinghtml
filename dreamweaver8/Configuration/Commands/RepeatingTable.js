// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------

var helpDoc = MM.HELP_objRepeatingTable;
var gDialogShown = false;
var gReturnTag;

var nextEditRegionInd = -1; 
var haveCalledCanInsert = false; 

//---------------     API FUNCTIONS    ---------------

function isDOMRequired() {
	return false;
}
	
function commandButtons(){
   return new Array(MM.BTN_OK,         "onOK()",
                    MM.BTN_Cancel,     "window.close()",
                    MM.BTN_Help,       "dwscripts.displayDWHelp(helpDoc);" );
}

function onOK()
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
	
	 var regionName = document.theForm.repeatName.value; 
	 if (findNamedRepeatingRegion(regionName, dw.getDocumentDOM("document")) != null)	
		{
		alert(MSG_alreadyExists_Repeat);
		return; 
		}
	
	if (!checkLegalTemplateName(document.theForm.repeatName.value))
		return; 
	
	setTableStr();
		
	simpleBlockInsert( gReturnTag, "", dw.getDocumentDOM("document"), false );
	
	dw.getDocumentDOM("document").selectTemplateRegion("repeat", regionName);
	
	gReturnTag = "";
	
	window.close();
	}



//Get a row of a table that has edit regions in each cell. 
function getEditTableRow(columnCount)
	{
	var tableRow = ""; 
	  for (var i=0; i< columnCount; i++)
	  	{
	  	var curCellName = MM.EditAutonamePreamble + nextEditRegionInd;
	  	nextEditRegionInd++; 
	  	
	  	var curCell; 
	  	
	  	
	  	if (dw.generateTemplateTagSyntax())
	  		curCell = "<TD><MMTemplate:Editable name=\"" + curCellName + "\">" + dw.getDocumentDOM("document").getNBSPChar() + "</MMTemplate:Editable></TD>";
	    else	
	  		curCell = "<TD><!-- TemplateBeginEditable name=\"" + curCellName + "\" -->" + dw.getDocumentDOM("document").getNBSPChar() + "<!-- TemplateEndEditable --></TD>";
	    
	    tableRow += curCell;
	   	}
	   	
	 return tableRow = "<"+"TR>" + tableRow + "<"+"/TR>";
	}
					
function canInsert()
	{	
	haveCalledCanInsert = true; 
	
	targetDom = arguments[0];
	if (targetDom == null)
		targetDom = dw.getDocumentDOM();
			
	if (!CheckWarnNoTemplate(targetDom))
		return false;
	
	var result = new Object();
	if (!canMakeTemplateContent("repeatingTable", targetDom, result))
		{		
		if (result.status == "contained in DW4 edit")
			alert(MM.MSG_SaveDW4First);
		else if (result.status == "locked")
			alert(MSG_cantInsertRepeatHere);
		else if (result.status == "tableCells")
			alert(MM.TEMPLATE_UTILS_MultipleCellsNotAllowed);
		else if (result.status == "markup overlap")
			alert(MM.MSG_WrappingExistingEdit);
		else
			alert(MM.MSG_AlreadyEdit);
			
		return false; 
		}			
			
	return true; 
	} //canInsert



function setTableStr(){

  var Columns = document.theForm.Cols.value;
  var Rows = document.theForm.Rows.value;
  var Border = document.theForm.Border.value;
  var Width = document.theForm.Width.value;
  var cellSpacing = document.theForm.Cellspace.value;
  var cellPadding = document.theForm.Cellpad.value;
  var unitChoice = document.forms[0].Units.selectedIndex;

  var repeatEnd = document.theForm.endingRow.value;
  var repeatStart = document.theForm.startingRow.value;

  var regionName = document.theForm.repeatName.value; 
  
  if (regionName == "")
  	regionName = getUniqueRegionName(MM.RepeatAutonamePreamble, "MMTemplate:Repeat", dw.getDocumentDOM("document"));

  var repeatStartContent;
  var repeatEndContent; 

  if (dw.generateTemplateTagSyntax())
  	{
  	repeatStartContent = "<MMTemplate:Repeat name=\"" + regionName + "\">"; 
  	repeatEndContent = "</MMTemplate:Repeat>";
  	}
  else
  	{
 	repeatStartContent = "<!-- TemplateBeginRepeat name=\"" + regionName + "\" -->";
 	repeatEndContent = "<!-- TemplateEndRepeat -->";
  	}
  	
  var tableCells='<'+'TD>' + dw.getDocumentDOM("document").getNBSPChar() + '<'+'/TD>\n';
  var tableRow='',tableContent='';
  var openTag= '<' + 'table ', spaceIndex;
  var widthAttr;

  //change any negative or non-numeric row or column value into 1
  if (Columns <= 0)
  	Columns = 1; 
  if (Rows <= 0)
  	Rows = 1; 
  if (repeatEnd <= 0)
  	repeatEnd = 1; 
  if (repeatStart <= 0)
  	repeatStart = 1; 

  //CREATE TABLE
  //determine contents of 1 table row
  for (i=0; i< Columns; i++)
    tableRow+=tableCells;
  tableRow = "<"+"TR>\n" + tableRow + "<"+"/TR>\n";
  
  nextEditRegionInd = getUniqueRegionCount(MM.EditAutonamePreamble, "MMTemplate:Editable", dw.getDocumentDOM("document"));

  //determine number of table rows & concatanate rows together
  for (var i=0; i< Rows; i++)
  	{ 	
    if (i == repeatStart-1)
    	tableContent += repeatStartContent; 
    	
    if (i >= repeatStart-1 && i <= repeatEnd -1)
    	tableContent += getEditTableRow(Columns); 
    else
    	tableContent += tableRow;
    
    if (i == repeatEnd - 1)
    	tableContent += repeatEndContent; 
	
	}
	
	
  //add percent or pixel values to opening tag, if applicable
  if (Width)
    openTag += 'width="'+Width + ((unitChoice == 0)? '%" ' : '" ');
  //add border value, if applicable
  if (Border)
    openTag+='border="' + Border + '" ';
  //add cellspacing value, if applicable
  if (cellSpacing)
    openTag+='cellspacing="' + cellSpacing + '" ';
  //add cellpadding value, if applicable
  if (cellPadding)
    openTag+='cellpadding="' + cellPadding + '" ';

  //strip extra space from openTag, if it exists
  spaceIndex = openTag.length-1
  if (escape(openTag.charAt(spaceIndex))=='%20')
    openTag = openTag.substring(0,spaceIndex);

  openTag += '>' + tableContent;

  if (gDialogShown) {
    saveExtension(document)
  }
  gDialogShown = false; // Reset show dialog global.
  
  openTag += '<'+'/table'+'>';
  gReturnTag= openTag;	
   dw.getDocumentDOM("document").disableLocking();
}


function objectTag(){
	
	alert(gReturnTag);
	return gReturnTag; 
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
if (!haveCalledCanInsert && !canInsert())
	{
	haveCalledCanInsert = false; 
	window.close();
	return;
	}
	
  document.theForm.repeatName.value =  getUniqueRegionName(MM.RepeatAutonamePreamble, "MMTemplate:Repeat", dw.getDocumentDOM("document"));

  document.theForm.Rows.focus(); //set focus on textbox
  document.theForm.Rows.select(); //set insertion point into textbox
  gDialogShown = true;
  gReturnTag = '';
  haveCalledCanInsert = false; 
}




	
