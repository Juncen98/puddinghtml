// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved

//---------------   GLOBAL VARIABLES   ---------------

var TEXT_LEGEND;

//---------------     API FUNCTIONS    ---------------

function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	return false;
}

function onOK(){
	return true;	
}

function objectTag(){
  var upCaseTag = (dw.getPreferenceString("Source Format", "Tags Upper Case", "") == 'TRUE');

	var before = (upCaseTag)?'<FIELDSET>':'<fieldset>';
	var after = (upCaseTag)?'</FIELDSET>':'</fieldset>';

	if (TEXT_LEGEND.value != ""){
		before += ((upCaseTag)?'<LEGEND>':'<legend>') + TEXT_LEGEND.value + ((upCaseTag)?'</LEGEND>':'</legend>');
	}
	
	// Manually wrap tags around selection.
	var dom = dw.getDocumentDOM();
	dom.source.wrapSelection(before,after);

  // Just return -- don't do anything else.
	return;
}

//---------------    LOCAL FUNCTIONS   ---------------
function initUI() {
	TEXT_LEGEND = document.theForm.legendField;
	TEXT_LEGEND.focus();
}
