//
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------
var helpDoc = MM.HELP_objTableAccessOptions;
var targetDom = null;
var returnTag='';

var COLS;
var ROWS;
var BORDER;
var WIDTH;
var CELLSPACE;
var CELLPAD;
var UNITS;

//---------------     API FUNCTIONS    ---------------

function isDOMRequired() {
	return false;
}

function commandButtons(){
   return new Array(MM.BTN_OK,         "setTableStr();window.close()",
                    MM.BTN_Cancel,     "window.close()",
                    MM.BTN_Help,       "displayHelp()" );
}

function receiveArguments(){
  // gather arguments from table object and
  // use to set global vars
  COLS = arguments[0];
  ROWS = arguments[1];
  BORDER = arguments[2];
  WIDTH = arguments[3];
  CELLSPACE = arguments[4];
  CELLPAD = arguments[5];
  UNITS = arguments[6];
}

function setTableStr(){
  var dom = dw.getDocumentDOM();
  var theNBSP = dom.getNBSPChar();
  
  var summaryStr = document.theForm.Summary.value;
  var captionStr = document.theForm.Caption.value;
  var alignCapChoice = document.theForm.alignCap.selectedIndex;
  var alignCaption = document.theForm.alignCap.options[alignCapChoice].value;
  var headerChoiceIndex = document.theForm.Header.selectedIndex;
  var headerChoice= document.theForm.Header.options[headerChoiceIndex].value;

  var captionTag = '<caption';
  var tableCells='<'+'TD>' + theNBSP + '<'+'/TD>\n';
  var tableScopeRowCells='<'+'TH scope="row">' + theNBSP + '<'+'/TH>\n';
  var tableScopeColCells='<'+'TH scope="col">' + theNBSP + '<'+'/TH>\n';
  var tableRow='',tableContent='', tableRowScopeRow='', tableRowScopeCol='';
  var openTag= '<' + 'table', spaceIndex;
  var widthAttr;

  //change any negative or non-numeric row or column value into 1
  COLS = parseInt(COLS);
  COLS = (COLS>0)?COLS:1;
  ROWS = parseInt(ROWS);
  ROWS = (ROWS>0)?ROWS:1;

  //CREATE TABLE
  //determine contents of 1 table row according to the number of columns
  //accessibility: first column value is added later; begin with the second column

  for (i=1; i< COLS; i++){
	tableRow+=tableCells;
	tableRowScopeRow+=tableScopeRowCells;
	tableRowScopeCol+=tableScopeColCells;
  }

  // set the value for FirstTableRow and RestTableRow depending on header request.
  if (headerChoice == 'row'){

	FirstTableRow = "<"+"TR>\n" + tableScopeColCells + tableRowScopeCol + "<"+"/TR>\n";
	RestTableRow = "<"+"TR>\n" + tableCells + tableRow + "<"+"/TR>\n";
  }
  else{
		if(headerChoice == 'col'){

		 FirstTableRow = "<"+"TR>\n"+ tableScopeRowCells + tableRow + "<"+"/TR>\n";
		 RestTableRow = FirstTableRow;

		}
		else{
		      if(headerChoice == 'both'){
	            FirstTableRow = "<"+"TR>\n" + tableScopeColCells + tableRowScopeCol + "<"+"/TR>\n";
				RestTableRow = "<"+"TR>\n"+ tableScopeRowCells + tableRow + "<"+"/TR>\n";
		      } 
			  else{
					FirstTableRow = "<"+"TR>\n"+ tableCells + tableRow + "<"+"/TR>\n";
					RestTableRow = FirstTableRow;
		      }

		}
  }

  	  tableContent+= FirstTableRow;

  //determine number of table rows & concatanate rows together
  for (i=1; i< ROWS; i++)
	  tableContent += RestTableRow;
 
  //add percent or pixel values to opening tag, if applicable
  if (WIDTH)
    openTag += ' width="'+WIDTH + ((UNITS == 0)? '%" ' : '"');
  //add border value, if applicable
  if (BORDER)
    openTag+=' border="' + BORDER + '"';
  //add cellspacing value, if applicable
  if (CELLSPACE)
    openTag+=' cellspacing="' + CELLSPACE + '"';
  //add cellpadding value, if applicable
  if (CELLPAD)
    openTag+=' cellpadding="' + CELLPAD + '"';

  //add summary to openTag table tag, if applicable 
  if(summaryStr != null && summaryStr != "") 
	openTag+= ' summary="' + summaryStr + '"';

  //add caption to openTag table tag, if applicable 
  if(captionStr != null && captionStr != "") 
	{
	  (alignCaption == "default" || alignCaption == undefined)?captionTag+= '>':captionTag+= ' align="' + alignCaption + '">';
	  openTag+= '>\n' + captionTag + captionStr + '<\/CAPTION>\n' + tableContent;
	}
	else {
	  openTag += '>\n' + tableContent;
	}

  //strip extra space from openTag, if it exists
  spaceIndex = openTag.length-1
  if (escape(openTag.charAt(spaceIndex))=='%20')
    openTag = openTag.substring(0,spaceIndex);


  openTag += '<'+'/table'+'>';

  // set global
  returnTag = openTag;
}


function createTableStr() {

	return returnTag;

}


//////////////////////////////////////////////////////////////
// /////////// Update Radio Button Control functions /////////
//
// Header is set to 'none'; 
// if user changes it updateHeader resets its icon accordingly
//
//////////////////////////////////////////////////////////////

function updateHeader(){
  var headerChoiceIndex = document.theForm.Header.selectedIndex;
  var headerChoice= document.theForm.Header.options[headerChoiceIndex].value;

	switch(headerChoice) {
		case 'col': document.theForm.tableImage.src= "../Shared/MM/Images/tableHeaderColumn.gif"; break;
		case 'row': document.theForm.tableImage.src= "../Shared/MM/Images/tableHeaderRow.gif"; break;
		case 'none': document.theForm.tableImage.src= "../Shared/MM/Images/tableHeaderNone.gif"; break;
		case 'both': document.theForm.tableImage.src= "../Shared/MM/Images/tableHeaderBoth.gif"; break;
	}
}



//////////////////////////////////////////////////////////////////
// Initialize UI:                                   
// set default values for fields, visibility for layers.
//////////////////////////////////////////////////////////////////

function initializeUI()
{	
    document.theForm.Caption.value = "";
    document.theForm.Summary.value = "";
     
	  var alignCaption="";
	  var headerChoice='none';
	  document.theForm.Header.selectedIndex= 0;
	  document.theForm.tableImage.src= "../Shared/MM/Images/tableHeaderNone.gif";

	  document.theForm.Caption.focus(); //set focus on textbox
	  document.theForm.Caption.select(); //set insertion point into textbox
    
} 

