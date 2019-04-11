// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved

var helpDoc = MM.HELP_objAcronym;

//---------------   GLOBAL VARIABLES   ---------------

var TEXT_FULL;
var TEXT_LANG;
var gDialogShown = false;

//---------------     API FUNCTIONS    ---------------

function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	return false;
}

function onOK(){
  if (!gDialogShown){
  	TEXT_FULL = document.theForm.fullText;
	  TEXT_LANG = document.theForm.langAtt;
	  TEXT_FULL.focus();
  }
	var okToInsert = true;
	if (TEXT_FULL == ""){
		alert(MSG_NEED_FULL_TEXT);
		okToInsert = false;
		TEXT_FULL.focus();
	}
	return okToInsert;
}

function objectTag(){
  if (!gDialogShown){
  	TEXT_FULL = document.theForm.fullText;
	  TEXT_LANG = document.theForm.langAtt;
	  TEXT_FULL.focus();
  }
	var lang = "";
  var upCaseTag = (dw.getPreferenceString("Source Format", "Tags Upper Case", "") == 'TRUE');
  var upCaseAtt = (dw.getPreferenceString("Source Format", "Attrs Upper Case", "") == 'TRUE');
  
	if (TEXT_LANG.value != ""){
		lang = ((upCaseAtt)?' LANG="':' lang="') + TEXT_LANG.value + '"';
	}
	
	// Manually wrap tags around selection.
  var dom = dw.getDocumentDOM();
  var beginWrap = (upCaseTag)?'<ACRONYM':'<acronym';
  beginWrap += ((upCaseAtt)?' TITLE="':' title="') + TEXT_FULL.value + '"' + lang + '>';
  var endWrap = (upCaseTag)?'</ACRONYM>':'</acronym>';

	dom.source.wrapSelection(beginWrap,endWrap);

  // Just return -- don't do anything else.
	return;
}

//---------------    LOCAL FUNCTIONS   ---------------
function initUI() {
  gDialogShown = true;
	TEXT_FULL = document.theForm.fullText;
	TEXT_LANG = document.theForm.langAtt;
	TEXT_FULL.focus();
}
