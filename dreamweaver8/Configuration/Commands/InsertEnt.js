// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------

var helpDoc = MM.HELP_objInsertEntity;

//---------------     API FUNCTIONS    ---------------

function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	return false;
}

function commandButtons(){
	return new Array(MM.BTN_OK,		'insertChars()',
                   MM.BTN_Cancel,	'cleanupUI()',
                   MM.BTN_Help,		'displayHelp()');
}


function canAcceptCommand() {
  return true;
}


//---------------    LOCAL FUNCTIONS   ---------------

// function: initUI
// description: initialize UI and other associated preferences
function initUI() {  
}

// function: cleanupUI
// description: 
function cleanupUI() {
  // Exit
  document.entityForm.Insert.childNodes[1].value = '';
  window.close();
}

// function: insertChars
// description: Insert selected character and cleanupUI
function insertChars(curChar) {
// As an Object this command uses the return value in Object tag to insert characters.
  window.close();
}

// function: objectTag
// description: Insert character entity programmatically, and then
// shift the selection so it becomes an IP after the inserted character.
// This allows the user to continue typing immediately after insertion.
function objectTag() {
  var dom = dw.getDocumentDOM();
  var sel;
  if (dom.getView() == 'design' || (dom.getView() == 'split' && dw.getFocus(true) != 'textView')){
    dom.insertHTML(document.entityForm.Insert.childNodes[1].value,true);
    sel = dom.getSelection();
    dom.setSelection(sel[1],sel[1]);
  }
  else{
    // CodeView has focus so just insert the entity string
    // directly into the source over whatever is currently selected.
    // The selection should be automatically collapsed after the
    // entity when we are through, so no need to manually set it.

    sel = dom.source.getSelection();
    dom.source.replaceRange(sel[0], sel[1], document.entityForm.Insert.childNodes[1].value);
  }
  return;
}

//--- Interface Support Functions

// Handles selection and display of choosen character in the form field.
function setChar(curChar) {
  // Add the character to the insertion field.
  document.entityForm.Insert.childNodes[1].value = '&' + curChar + ';';
}
