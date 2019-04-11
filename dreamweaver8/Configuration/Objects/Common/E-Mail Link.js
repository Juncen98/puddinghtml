// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved

var helpDoc = MM.HELP_objEMailLink;

//---------------   GLOBAL VARIABLES   ---------------

var gDialogShown = false;
var gDefaultEmail =  LABEL_DefaultEmail;

//---------------     API FUNCTIONS    ---------------

function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	return false;
}


// we need to extract the entity encoded version of the text
function getInputHTML(inputField)
{
	var inputHTML = inputField.innerHTML;
	var start = inputHTML.indexOf('value="');
	var end = inputHTML.indexOf('"',start + 7);
	var valueHTML = inputHTML.substring(start + 7,end);
	if (start > -1 && end > start)
		return valueHTML;
	else
		return inputField.value;
}


function objectTag() {
  var EmailFld;
  var InsertText;
  
  if (gDialogShown) {
    EmailFld = document.MainForm.EmailFld.value;
    InsertText = getInputHTML(document.MainForm.TextFld);
 
    // Save preferences.
    savePreferences();
  } else {
    populateFields();
    EmailFld = document.MainForm.EmailFld.value;
    if (!EmailFld) EmailFld = gDefaultEmail;
 //   InsertText = getInputHTML(document.MainForm.TextFld);
  }

  if (!InsertText) InsertText = EmailFld;
  var rtnString = '<a href="mailto:' + EmailFld + '">' + InsertText + '<'+'/a>'

  var curDOM = dw.getDocumentDOM('document');
  if (dw.getFocus() != 'textView' && dw.getFocus(true) != 'html' && isCurSelectionTextOnly(curDOM)) {
    curDOM.insertHTML(rtnString, true); // Replaces current selection.
    rtnString = ''; // Set return value to empty, tag already inserted.
  }
  gDialogShown = false; // Reset show dialog global.
  return rtnString;
}

//---------------    LOCAL FUNCTIONS   ---------------

// Description: Determines if the current selection is contained within a text node.
// Parameters:  DOM - checked for valid, returns false if no DOM.
function isCurSelectionTextOnly(curDOM) {
  var rtnBool = false;
  if (curDOM != null) {
    var curNode = curDOM.getSelectedNode();
    if (curNode.nodeType == Node.TEXT_NODE) { // Return true if we are a text node.
      rtnBool = true;
    } else { // Return true if the selection contains a single text node.
      if (curNode.hasChildNodes() && curNode.childNodes[0].nodeType == Node.TEXT_NODE) {
        var curSel = curDOM.getSelection();
        var nodeOffset = dw.nodeToOffsets(curNode.childNodes[0]);
        if  ((nodeOffset[0] <= curSel[0]) && (curSel[1] <= nodeOffset[1])) {
          rtnBool = true;
  } } } }
  return rtnBool;
}

function populateFields() {
  var metaFile, curVal;
  if (typeof MMNotes == 'undefined') {return;} // Check for MMNotes extension.
  metaFile = MMNotes.open(document.URL, false);
  if (metaFile) {
    // If the user entered an e-mail address before, it's been saved.
    // Use that value to populate the E-mail field.
    curVal = MMNotes.get(metaFile, 'MM_pref_E-Mail');
    if (curVal) document.MainForm.EmailFld.value = curVal;
    MMNotes.close(metaFile);
  }
  
  // Populate the Text field with the currently-selected text, if
  // applicable.
  var curDOM = dw.getDocumentDOM('document');
  if (isCurSelectionTextOnly(curDOM)) {
    var curSel = curDOM.getSelection();
    var selText = curDOM.documentElement.outerHTML.slice(curSel[0],curSel[1]);
    // replace carriage returns (and the space on either side of any carriage returns, 
    // if one exists) with a single space.
    selText = selText.replace(/\s*[\n\r]+\s*/g, ' ');
    document.MainForm.TextFld.value = entityNameDecode(selText);
    if (selText.match(/\w+(\.\w+)?@\w+\.\w+/)){
      document.MainForm.EmailFld.value = selText;
    }
  }
}

function savePreferences() {
  if (typeof MMNotes == 'undefined') {return;} // Check for MMNotes extension.
  var metaFile, curVal;
  metaFile = MMNotes.open(document.URL, true);
  if (metaFile) {
    curVal = MMNotes.set(metaFile, 'MM_pref_E-Mail', document.MainForm.EmailFld.value);
    MMNotes.close(metaFile);
  }
}

function initUI() {
  // Initialize the form dialog.
  populateFields();

  document.MainForm.TextFld.focus(); //set focus on textbox
  document.MainForm.TextFld.select(); //set insertion point into textbox
  gDialogShown = true;
}
