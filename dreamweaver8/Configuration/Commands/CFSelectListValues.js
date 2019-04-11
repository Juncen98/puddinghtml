// Copyright 2005 Macromedia, Inc. All rights reserved
var ELEMENTS = null;

var BUTTON_UP;
var BUTTON_DOWN;
var BUTTON_REMOVE;

//--------------------------------------------------------------------
// FUNCTION:
//   commandButtons
//
// DESCRIPTION:
//   Returns the list of buttons which should appear on the right hand
//   side of the dialog
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   Array - pairs of button name and function call
//--------------------------------------------------------------------
function commandButtons() {
	btnArray =  new Array(
		MM.BTN_OK,		"clickedOK()", 
	    MM.BTN_Cancel,	"clickedCancel()", 
		MM.BTN_Help, 	"displayHelp()" 
	);
	return btnArray;
}



//--------------------------------------------------------------------
// FUNCTION:
//   clickedOK
//
// DESCRIPTION:
//   Implements the actions to be done when user clicks OK button
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function clickedOK() {
//    enabled = "dw.selInspEvents.canAddNewListItem();"
//    command = "dw.selInspEvents.addNewListItem();"
	var myList = ELEMENTS.getAll();
	dwscripts.setCommandReturnValue(myList);
	window.close();
}



//--------------------------------------------------------------------
// FUNCTION:
//   clickedCancel
//
// DESCRIPTION:
//   closes this window without makeing any changes
//   side of the dialog
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function clickedCancel() {
	window.close();
}



//--------------------------------------------------------------------
// FUNCTION:
//   displayHelp
//
// DESCRIPTION:
//   Displays the help window for this command
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function displayHelp() {
	dwscripts.displayDWHelp("DW_Using:41_for53.htm");
}



//--------------------------------------------------------------------
// FUNCTION:
//   addElement
//
// DESCRIPTION:
//   Adds a new elemnt to the end of the list
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function addElement() {
	ELEMENTS.append(MM.LABEL_MenuGrid, MM.LABEL_MenuGrid);
	if (BUTTON_REMOVE.getAttribute("disabled")) {
		BUTTON_REMOVE.src = "../Shared/MM/Images/btnDel.gif"; 
		BUTTON_REMOVE.removeAttribute("disabled");
	}
}



//--------------------------------------------------------------------
// FUNCTION:
//   removeElement
//
// DESCRIPTION:
//   removes the currently selected element
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function removeElement() {
	ELEMENTS.del();
	if (ELEMENTS.getIndex() == -1) {
    	BUTTON_REMOVE.setAttribute("disabled", true);
		BUTTON_REMOVE.src = "../Shared/MM/Images/btnDel_dis.gif"; 
	}
}



//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI()
//
// DESCRIPTION:
//   Initializes the UI controls
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function initializeUI() {
	BUTTON_UP = dwscripts.findDOMObject('elemUp');
	BUTTON_DOWN = dwscripts.findDOMObject('elemDown');
	BUTTON_REMOVE = dwscripts.findDOMObject('elemDel');

	ELEMENTS = new GridControl('theElements');

 	edited = dwscripts.getCommandArguments();
	var gridLabels = makeGridElements(edited);
	ELEMENTS.setAll(gridLabels, gridLabels);
	ELEMENTS.setIndex(0);
}



//--------------------------------------------------------------------
// FUNCTION:
//   makeGridElements
//
// DESCRIPTION:
//   Returns a 2D array with the items received via command's argument
//
// ARGUMENTS:
//   obj - object received
//
// RETURNS:
//   an array ready to be inserted in the grid
//--------------------------------------------------------------------
function makeGridElements(obj) {
	var row = new Array();
	var allRows = new Array();
	for (var i=0; i<obj.labels.length; i++) {
		row = new Array();
		row.push(obj.labels[i]);
		row.push(obj.values[i]);
		allRows.push(row);
	}
	return allRows;
}
