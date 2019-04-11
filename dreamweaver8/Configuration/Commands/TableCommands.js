// Copyright 1999, 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------
var OBJECT_FILE = dw.getConfigurationPath() + '/commands/TableCommands.htm';
var DEBUG_FILE = dw.getConfigurationPath() + '/Objects/Common/TABLE_DEBUG.txt';
var helpDoc = MM.HELP_objTable;
var returnTag='';
var gDialogShown = false;
var TBL_HDR;  //instance of iconSelectorClass, used for selecting table header icons

//---------------     API FUNCTIONS    ---------------

function isDOMRequired() {
	return false;
}

function commandButtons()
{
   return new Array("PutButtonsOnBottom", "OkButton defaultButton", MM.BTN_OK, "if (setTableStr()) window.close()",
                    "PutButtonOnLeft", MM.BTN_Help, "displayHelp()",
                    "CancelButton", MM.BTN_Cancel, "window.close()" );
}
	

function setTableStr() {
  var dom = dw.getDocumentDOM();
  var theNBSP = dom.getNBSPChar();
  var Columns = document.theForm.Cols.value;
  var Rows = document.theForm.Rows.value;
  var Border = document.theForm.Border.value;
  var Width = document.theForm.Width.value;
  var cellSpacing = document.theForm.Cellspace.value;
  var cellPadding = document.theForm.Cellpad.value;
  var unitChoice = document.forms[0].Units.selectedIndex;
  var captionStr = document.theForm.Caption.value;
  var alignCapChoice = document.theForm.CaptionAlign.selectedIndex;
  var alignCaption = document.theForm.CaptionAlign.options[alignCapChoice].value;
  var summaryStr = document.theForm.Summary.value;

  var retStr = "";  
  var tableCells='<'+'TD>' + theNBSP + '<'+'/TD>\n';
  var tableScopeRowCells='<'+'TH scope="row">' + theNBSP + '<'+'/TH>\n';
  var tableScopeColCells='<'+'TH scope="col">' + theNBSP + '<'+'/TH>\n';
  var tableRow='',tableContent='', tableRowScopeRow='', tableRowScopeCol='';
  var openTag= '<' + 'table';
  var captionTag = '<caption';
  var spaceIndex;
  var widthAttr;

  // header choice can be "none", "row", "column" or "both"
  var i = 0;
  var headerchoice;
  
  // make sure UI is initialized
  if (!gDialogShown)
    initializeUI();
    
  headerChoice = TBL_HDR.value;

  //change any negative or non-numeric row or column value into 1
  Columns = parseInt(Columns);
  Columns = (Columns>0)?Columns:1;
  Rows = parseInt(Rows);
  Rows = (Rows>0)?Rows:1;

  //CREATE TABLE
  //determine contents of 1 table row according to the number of columns
  //accessibility: first column value is added later; begin with the second column

  for (i=1; i< Columns; i++){
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
  for (i=1; i< Rows; i++)
    tableContent += RestTableRow;

  //add percent or pixel values to opening tag, if applicable
  if (Width)
    openTag += ' width="'+Width + ((unitChoice == 0)? '%"' : '"');
  //add border value, if applicable
  if (Border)
    openTag+=' border="' + Border + '"';
  //add cellspacing value, if applicable
  if (cellSpacing)
    openTag+=' cellspacing="' + cellSpacing + '"';
  //add cellpadding value, if applicable
  if (cellPadding)
    openTag+=' cellpadding="' + cellPadding + '"';

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
  
  retStr = openTag;

  if (gDialogShown){
	document.theForm.Summary.value = "";
	document.theForm.Caption.value = "";
    dwscripts.saveExtension(document);
  }
  gDialogShown = false; // Reset show dialog global.

  returnTag = retStr;
  return true;
}

function createTableStr()
{
	return returnTag;
}

//---------------    LOCAL FUNCTIONS   ---------------

function initializeUI()
{
  // don't do it twice
  if (!gDialogShown)
  {
    //initialize Table Header selector, default value "none"
    TBL_HDR = new IconSelectorClass(new Array("none","row","col","both"),"none");
    document.theForm.Rows.focus(); //set focus on textbox
    document.theForm.Rows.select(); //set insertion point into textbox
    gDialogShown = true;
  }
}


///--------------------------------------------------------------------
// CLASS:
//   IconSelectorClass
//
// DESCRIPTION:
//   This class is used to provide radio-button functionality to images.
// When clicking images in table cells, their cells will highlight. To
// find out which image is selected, get the value property of the object.
//
// To set it up, place images in table cells, name the table cells uniquely,
// and add onMouse handlers to each image that call the update method and
// pass the name of their table cells.
//
// PUBLIC PROPERTIES:
//   value (read-only) - the name of the table cell currently selected.
//
// PUBLIC FUNCTIONS:
//   update(value) - passed by the click handler to select a new cell.
//
// CONSTRUCTOR:
//   tableCellNames - an array of all table cell names to be used
//   initialName (optional) - initial cell to select (otherwise 1st)
//
//--------------------------------------------------------------------

function IconSelectorClass(tableCellNames, initialName)
{
  //Private properties
  this.selectedColor = "#316AC5";   //background color for selected table cell
  this.unselectedColor = "#CCCCCC";        //background color for unselected table cell (#9D9CA7 on table)
  this.selectedTextColor = "#FFFFFF";   //color for selected text (white)
  this.unselectedTextColor = "#000000"; //color for unselected text (black)

  // find which is selected
  for (var i=0; i<tableCellNames.length; i++)
  {
    if (document[tableCellNames[i]].bgColor == this.selectedColor)
    {
      this.value = tableCellNames[i];
      break;
    }
  }

  // if didn't find it, initialize it
  if (!this.value)
    this.value = initialName;
}

IconSelectorClass.prototype.update = IconSelectorClass_update;


//Update method. Pass in a new value, one of the table cell names.
function IconSelectorClass_update(newValue)
{
  if (this.value == newValue)
    return;

  // for the previously selected cell, change bgColor and font color to unselected colors
  document[this.value].bgColor = this.unselectedColor;
  document[this.value + "font"].color = this.unselectedTextColor;

  //change the value to the new value
  this.value = newValue;

  // set the colors for the newly selected cell
  document[this.value].bgColor = this.selectedColor;
  document[this.value + "font"].color = this.selectedTextColor;
}

//----------- END IconSelectorClass --------------
