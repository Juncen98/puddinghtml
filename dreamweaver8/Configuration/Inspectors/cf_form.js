//Copyright 2005 Macromedia, Inc. All rights reserved.

var HELP_DOC = MM.HELP_settingCFformProperties_PI;

// Form variables
var NAME;

var ACTION;
var METHOD;
var TARGET;
var ENCTYPE;
var targetVals = new Array('', '_blank', '_parent', '_self', '_top');

var FORMAT;
var STYLE;
var SKIN;
var PRESERVEDATA;
var SCRIPTSRC;
var ARCHIVE;
var HEIGHT;
var WIDTH;
var skinVals = new Array('', 'haloSilver', 'haloBlue', 'haloGreen', 'haloOrange');
var preservedataVals = new Array('', 'true', 'false');

//--------------------------------------------------------------------
// FUNCTION:
//   fileBrowser()
//
// DESCRIPTION:
//   Opens the file browser dialog and allows the user to choose
//   a file, then populates the passed-in text field with that file.
//
// ARGUMENTS: 
//   tag - the field that should be populated with the filename selected
//
// RETURNS:
//   Nothing.
//--------------------------------------------------------------------
function fileBrowser(tag) {
	var fileName = "";
	fileName = dw.browseForFileURL("select", "", false);
	if (fileName) {
		tag.value = fileName;
	}
}


//--------------------------------------------------------------------
// FUNCTION:
//   displayTagDialog
//
// DESCRIPTION:
//   Forces the focus into code view and then displays the tag dialog
//   for the currently-selected tag (in edit mode). When the user
//   clicks OK or cancel in the tag dialog, returns the view and focus
//   back to where they were, and attempts to re-select the tag (the
//   tag editor leaves the IP right after the tag if any edits were
//   made).
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean indicating whether the tag dialog was shown
//--------------------------------------------------------------------
function displayTagDialog() {
	// variant:
	// dw.selectionInspector.canEditTag();" command="dw.selectionInspector.editTag();

	var ok = dw.canPopupEditTagDialog();
	//var ok = dw.selectionInspector.canEditTag();
	var dom = dw.getDocumentDOM();
	var curView = dom.getView();
	var curFocus = dw.getFocus();
	var retVal = false;
	
	if (ok) {
		//dw.selectionInspector.editTag();
		dw.popupEditTagDialog();
		/*
		if (curView == 'design') {
			dom.setView('split');
		}
		dw.setFocus('textView');
		dw.popupEditTagDialog();
		*/
		retVal = true;
//		dom.setView(curView);
//		dw.setFocus(curFocus);
		if ((curView == 'design' || curFocus == 'document') && (dom.getSelection()[0] == dom.getSelection()[1])) {
			dom.setSelection(dom.getSelection()[0]-2,dom.getSelection()[0]-2);
		}
	}
	return retVal;
}



//--------------------------------------------------------------------
// FUNCTION:
//   displayHelp()
//
// DESCRIPTION:
//   This function displays help window
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//   Nothing.
//--------------------------------------------------------------------
function displayHelp() {
	dwscripts.displayDWHelp(HELP_DOC);
}


// ********************* API FUNCTIONS ***************************

//--------------------------------------------------------------------
// FUNCTION:
//   canInspectSelection()
//
// DESCRIPTION:
//   Determines whether the Property inspector is appropriate for the
//   current selection.
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//   Dreamweaver expects true if the inspector can inspect the
//   current selection; false otherwise
//--------------------------------------------------------------------
function canInspectSelection() {
	return (dw.getDocumentDOM().serverModel.getServerVersion('Server.ColdFusion.ProductVersion.Major') >= 7);
	/*
	var dom = dw.getDocumentDOM();
	var theObj = dom.getSelectedNode(); //new TagEdit(dom.getSelectedNode().outerHTML);
	return (theObj.tagName == "CFINPUT");
	*/
}



//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//   This function is called in the onLoad event.  It is responsible
//   for initializing the UI.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function initializeUI() {
	if (typeof NAME != 'undefined') {
		return;
	}

	// NAME var
	NAME = dwscripts.findDOMObject("theName");

	// FORM
	ACTION = dwscripts.findDOMObject("theAction");
	TARGET = new ListControl("theTarget");
	TARGET.setAll(targetVals, targetVals);
	METHOD = new ListControl("theMethod");
	METHOD.setAll(new Array('', 'GET', 'POST'), new Array('', 'get', 'post'));
	ENCTYPE = new ListControl("theEnctype");
	var temp = new Array('').concat(theEncTypesVal);
	ENCTYPE.setAll(temp, temp);
	

	FORMAT = new ListControl("theFormat");
	tagDialog.populateDropDownList(FORMAT, theFormFormatCap, theFormFormatVal, 1); 
	
	STYLE = dwscripts.findDOMObject("theStyle");
	SKIN = new ListControl("theSkin");
	SKIN.setAll(skinVals, skinVals);
	PRESERVEDATA = new ListControl("thePreserveData");
	PRESERVEDATA.setAll(preservedataVals, preservedataVals);
	SCRIPTSRC = dwscripts.findDOMObject("theScriptSrc");
	ARCHIVE = dwscripts.findDOMObject("theArchive");
	HEIGHT = dwscripts.findDOMObject("theHeight");
	WIDTH = dwscripts.findDOMObject("theWidth");

	// reposition form elements for Windows
	//if (navigator.platform.charAt(0)=="W") {
		// Move icon into position
		//document.layers["piImage"].top = 2;
		//document.layers["piImage"].left = 4;
		//document.layers["idBoxLayer"].top = 2;
		//document.layers["idBoxLayer"].left = 43;
	//}
}


//--------------------------------------------------------------------
// FUNCTION:
//   initValues()
//
// DESCRIPTION:
//   This function is called in the inspectSelection() event. It is
//   responsible for initializing all the components in the UI with
//   default values.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function initValues() {
	NAME.value = "";
	
	// FROM
	ACTION.value = "";
	TARGET.setIndex(0);
	METHOD.setIndex(0);
	ENCTYPE.setIndex(0);

	FORMAT.pickValue('');
	STYLE.value = '';
	SKIN.pickValue('');
	PRESERVEDATA.pickValue('');
	SCRIPTSRC.value = '';
	ARCHIVE.value = ''
	HEIGHT.value = '';
	WIDTH.value = '';
}


//--------------------------------------------------------------------
// FUNCTION:
//   inspectSelection
//
// DESCRIPTION:
//   Refreshes the contents of the text fields based on the attributes
//   of the current selection.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function inspectSelection() {
	var dom = dw.getDocumentDOM();
	var theObj = dom.getSelectedNode(); //new TagEdit(dom.getSelectedNode().outerHTML);

	// Call initializeUI() here; it's how the global variables get
	// initialized. The onLoad event on the body tag is never triggered
	// in inspectors.
	initializeUI();
	initValues();

    
	if (theObj.getAttribute("name")) {
		NAME.value = theObj.getAttribute("name");
	}

	if (theObj.getAttribute("action")) {
		ACTION.value = theObj.getAttribute("action");
	}
	
	if (theObj.getAttribute("method")) {
		METHOD.pickValue(theObj.getAttribute("method"), new Function("a,b", "return (a.toLowerCase() == b.toLowerCase());"));
	}

	if (theObj.getAttribute("target")) {
		TARGET.pickValue(theObj.getAttribute("target"), new Function("a,b", "return (a.toLowerCase() == b.toLowerCase());"));
	}

	if (theObj.getAttribute("enctype")) {
		ENCTYPE.pickValue(theObj.getAttribute("enctype"), new Function("a,b", "return (a.toLowerCase() == b.toLowerCase());"));
	}


	if (theObj.getAttribute("format")) {
		FORMAT.pickValue(theObj.getAttribute("format"), new Function("a,b", "return (a.toLowerCase() == b.toLowerCase());"));
	}  
	updateSkinList();

	if (theObj.getAttribute("style")) {
		STYLE.value = theObj.getAttribute("style");
	}  
	if (theObj.getAttribute("SKIN")) {
		SKIN.pickValue(theObj.getAttribute("skin"), new Function("a,b", "return (a.toLowerCase() == b.toLowerCase());"));
	}
	if (theObj.getAttribute("preserveData")) {
		PRESERVEDATA.pickValue(theObj.getAttribute("preserveData"), new Function("a,b", "return (a.toLowerCase() == b.toLowerCase());"));
	}
	if (theObj.getAttribute("scriptSrc")) {
		SCRIPTSRC.value = theObj.getAttribute("scriptSrc");
	}  
	if (theObj.getAttribute("archive")) {
		ARCHIVE.value = theObj.getAttribute("archive");
	}  
	if (theObj.getAttribute("height")) {
		HEIGHT.value = theObj.getAttribute("height");
	}  
	if (theObj.getAttribute("width")) {
		WIDTH.value = theObj.getAttribute("width");
	}  
}



//--------------------------------------------------------------------
// FUNCTION:
//   updateTag
//
// DESCRIPTION:
//   writes back in the source-code the changes made by user
//
// ARGUMENTS:
//   attrib - the attribute name to be updated
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function updateTag(attrib) {
	var dom = dw.getDocumentDOM();
	var theObj = dom.getSelectedNode(); //new TagEdit(dom.getSelectedNode().outerHTML);

	if (attrib) {
		switch (attrib) {
			case "name":
				if (theObj.getAttribute("name") != NAME.value && NAME.value != "") {
					if ((theObj.getAttribute("id"))&&
					    (theObj.getAttribute("name"))&&
					    (theObj.getAttribute("id") == theObj.getAttribute("name"))) {
							theObj.setAttribute("id", NAME.value);
						}
					if (!(theObj.getAttribute("id"))) {
						theObj.setAttribute("id", NAME.value);
					}
					theObj.setAttribute("name", NAME.value);
					editOccurred = true;
				} else if (theObj.getAttribute("name") && NAME.value == "") {
					theObj.removeAttribute("name");
					editOccurred = true;
				}
				
//				if (NAME.value != "" && !dwscripts.isValidVarName(NAME.value)) {
//						alert(MM.MSG_InvalidIDAutoFix);	// test the case of a name with first chr a number or special chr
//				}
			break;

			case "action":
				if (theObj.getAttribute("action") != ACTION.value && ACTION.value != "") {
					theObj.setAttribute("action", ACTION.value);
				} else if (theObj.getAttribute("action") && ACTION.value == "") {
					theObj.removeAttribute("action");
				}
			break;

			case "method":
				if (theObj.getAttribute("method") != METHOD.getValue() && METHOD.getValue() != "") {
					theObj.setAttribute("method", METHOD.getValue());
					//when the method changes, we modify the enctype combo box to reflect valid values
					updateEncTypeList(METHOD.getValue());
				} else if (theObj.getAttribute("method") && METHOD.getValue() == "") {
					theObj.removeAttribute("method");
				}
			break;

			case "target":
				if (theObj.getAttribute("target") != TARGET.getValue() && TARGET.getValue() != "") {
					theObj.setAttribute("target", TARGET.getValue());
				} else if (theObj.getAttribute("target") && TARGET.getValue() == "") {
					theObj.removeAttribute("target");
				}
			break;

			case "enctype":
				if (theObj.getAttribute("enctype") != ENCTYPE.getValue() && ENCTYPE.getValue() != "") {
					theObj.setAttribute("enctype", ENCTYPE.getValue());
				} else if (theObj.getAttribute("enctype") && ENCTYPE.getValue() == "") {
					theObj.removeAttribute("enctype");
				}
			break;

			// Common tags
			case "format":
				if (theObj.getAttribute("format") != FORMAT.getValue() && FORMAT.getValue() != "") {
					theObj.setAttribute("format", FORMAT.getValue());
					updateSkinList();
					theObj.removeAttribute("skin");
					SKIN.pickValue("");
				} else if (theObj.getAttribute("format") && FORMAT.getValue() == "") {
					theObj.removeAttribute("format");
					updateSkinList();
					theObj.removeAttribute("skin");
					SKIN.pickValue("");
				}
			break;

			case "style":
				if (theObj.getAttribute("style") != STYLE.value && STYLE.value != "") {
					theObj.setAttribute("style", STYLE.value);
				} else if (theObj.getAttribute("style") && STYLE.value == "") {
					theObj.removeAttribute("style");
				}
			break;

			case "skin":
				if (theObj.getAttribute("skin") != SKIN.getValue() && SKIN.getValue() != "") {
					theObj.setAttribute("skin", SKIN.getValue());
				} else if (theObj.getAttribute("skin") && SKIN.getValue() == "") {
					theObj.removeAttribute("skin");
				}
			break;

			case "preserveData":
				if (theObj.getAttribute("preserveData") != PRESERVEDATA.getValue() && PRESERVEDATA.getValue() != "") {
					theObj.setAttribute("preserveData", PRESERVEDATA.getValue());
				} else if (theObj.getAttribute("preserveData") && PRESERVEDATA.getValue() == "") {
					theObj.removeAttribute("preserveData");
				}
			break;

			case "scriptSrc":
				if (theObj.getAttribute("scriptSrc") != SCRIPTSRC.value && SCRIPTSRC.value != "") {
					theObj.setAttribute("scriptSrc", SCRIPTSRC.value);
				} else if (theObj.getAttribute("scriptSrc") && SCRIPTSRC.value == "") {
					theObj.removeAttribute("scriptSrc");
				}
			break;

			case "archive":
				if (theObj.getAttribute("archive") != ARCHIVE.value && ARCHIVE.value != "") {
					theObj.setAttribute("archive", ARCHIVE.value);
				} else if (theObj.getAttribute("archive") && ARCHIVE.value == "") {
					theObj.removeAttribute("archive");
				}
			break;

			case "height":
				if (HEIGHT.value != "") {
					if (HEIGHT.value != parseInt(HEIGHT.value) || parseInt(HEIGHT.value) < 0) {
						alert(MM.MSG_ValuePositiveInteger);
						if (theObj.getAttribute("height"))
							HEIGHT.value = theObj.getAttribute("height");
						else
							HEIGHT.value = "";            
					} else if (theObj.getAttribute("height") != HEIGHT.value) {
						theObj.setAttribute("height", HEIGHT.value);
						editOccurred = true;
					}
				} else if (theObj.getAttribute("height")) {
					theObj.removeAttribute("height");
					editOccurred = true;
				}
			break;

			case "width":
				if (WIDTH.value != "") {
					if (WIDTH.value != parseInt(WIDTH.value) || parseInt(WIDTH.value) < 0) {
						alert(MM.MSG_ValuePositiveInteger);
						if (theObj.getAttribute("width"))
							WIDTH.value = theObj.getAttribute("width");
						else
							WIDTH.value = "";
					} else if (theObj.getAttribute("width") != WIDTH.value) {
						theObj.setAttribute("width", WIDTH.value);
						editOccurred = true;
					}
				} else if (theObj.getAttribute("width")) {
					theObj.removeAttribute("width");
					editOccurred = true;
				}
			break;
		}
	}  
}

function updateEncTypeList(submissionMethod) {
	// Remember old value if there was one
	var oldValue = ENCTYPE.getValue();
	
	// Null out the list first, then add the new values.
	if (submissionMethod == 'get'){
		ENCTYPE.setAll(new Array(0),new Array(0));
		tagDialog.populateDropDownList(ENCTYPE, theFormEncTypeGetVal, theFormEncTypeGetVal, 1);
	}else{
		ENCTYPE.setAll(new Array(0),new Array(0));
		tagDialog.populateDropDownList(ENCTYPE, theFormEncTypePostVal, theFormEncTypePostVal, 1);
	}
	
	// If the user had already chosen application/x-www-form-urlencoded
	// and then changed from get to post, leave the enctype field as-is.
	// If instead she'd chosen multipart/form-data and changed from post
	// to get, choose the blank item (multipart/form-data is not a valid
	// enctype for get).
	if (submissionMethod == 'get' && oldValue == 'multipart/form-data'){
		ENCTYPE.pickValue("");
		updateTag("enctype");
	}else{
		ENCTYPE.pickValue(oldValue);
	}
}

function updateSkinList() {
	if (FORMAT.getValue() == 'xml') {
		tagDialog.populateDropDownList(SKIN, theXMLSkinListCap, theXMLSkinListVal, 1);
		dwscripts.findDOMObject('theSkin').disabled = false;
		} else if (FORMAT.getValue() == 'flash'){
		dwscripts.findDOMObject('theSkin').disabled = false;
		tagDialog.populateDropDownList(SKIN, theSkinListCap, theSkinListVal, 1);
		} else{
		dwscripts.findDOMObject('theSkin').disabled = true;
		}
}
