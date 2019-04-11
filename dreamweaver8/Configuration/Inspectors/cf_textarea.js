//Copyright 2005 Macromedia, Inc. All rights reserved.

var HELP_DOC = MM.HELP_settingCFtextareaProperties_PI;

var NAME;

var CHAR_WIDTH;
var NUM_LINES;
var WRAP;
var REQUIRED;
var VALIDATE;
var VALIDATEAT;
var LABEL;
var STYLE;
var HEIGHT;
var WIDTH;
var VALUE;

var validateAtVals = new Array('', 'onSubmit', 'onServer', 'onBlur');


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
	var ok = dw.canPopupEditTagDialog();
	var dom = dw.getDocumentDOM();
	var curView = dom.getView();
	var curFocus = dw.getFocus();
	var retVal = false;
	if (ok) {
		dw.popupEditTagDialog();
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

	CHAR_WIDTH = dwscripts.findDOMObject("theCharWidth");
	NUM_LINES = dwscripts.findDOMObject("theNumLines");
	WRAP = new ListControl("theWrap");
	WRAP.setAll(theWrapTACap, theWrapTAVal);
	REQUIRED = dwscripts.findDOMObject("theRequired");

	VALIDATE = new ListControl("validateMenu");
	VALIDATE.setAll(theInputValidateCap, theInputValidateVal);
	VALIDATE.prepend("","");
	VALIDATEAT = new ListControl("theValidateAt");
	VALIDATEAT.setAll(validateAtVals, validateAtVals);
	
	LABEL = dwscripts.findDOMObject("theLabel");
	STYLE = dwscripts.findDOMObject("theStyle");;
	HEIGHT = dwscripts.findDOMObject("theHeight");
	WIDTH = dwscripts.findDOMObject("theWidth");
	VALUE = dwscripts.findDOMObject("theValue");

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
	
	CHAR_WIDTH.value = "";
	NUM_LINES.value = "";
	WRAP.pickValue("");
	REQUIRED.checked = false;

	VALIDATE.pickValue("");
	VALIDATEAT.pickValue("");
	LABEL.value = "";
	STYLE.value = "";
	HEIGHT.value = "";
	WIDTH.value = "";
	
	VALUE.value = "";
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
	var theObj = dom.getSelectedNode();

	// Call initializeUI() here; it's how the global variables get
	// initialized. The onLoad event on the body tag is never triggered
	// in inspectors.
	initializeUI();
	initValues();

    
	if (theObj.getAttribute("name")) {
		NAME.value = theObj.getAttribute("name");
	}

	if (theObj.getAttribute("cols")) {
		CHAR_WIDTH.value = theObj.getAttribute("cols");
	}

	if (theObj.getAttribute("rows")) {
		NUM_LINES.value = theObj.getAttribute("rows");
	}

	if (theObj.getAttribute("wrap")) {
		WRAP.pickValue(theObj.getAttribute("wrap"), new Function("a,b", "return (a.toLowerCase() == b.toLowerCase());"));
	}

	if (theObj.getAttribute("required")) {
		if (theObj.getAttribute("required").toLowerCase() == "yes") {
			REQUIRED.checked = true;
		} else {
			REQUIRED.checked = false;
		}
	}

	if (theObj.getAttribute("validate")) {
		VALIDATE.pickValue(theObj.getAttribute("validate"), new Function("a,b", "return (a.toLowerCase() == b.toLowerCase());"));
	}

	if (theObj.getAttribute("validateAt")) {
		VALIDATEAT.pickValue(theObj.getAttribute("validateAt"), new Function("a,b", "return (a.toLowerCase() == b.toLowerCase());"));
	}

	if (theObj.getAttribute("label")) {
		LABEL.value = theObj.getAttribute("label");
	}  

	if (theObj.getAttribute("style")) {
		STYLE.value = theObj.getAttribute("style");
	}  

	if (theObj.getAttribute("height")) {
		HEIGHT.value = theObj.getAttribute("height");
	}  

	if (theObj.getAttribute("width")) {
		WIDTH.value = theObj.getAttribute("width");
	}  

	if (theObj.getAttribute("value")) {
		VALUE.value = theObj.getAttribute("value");
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

			case "cols":
				if (theObj.getAttribute("cols") != CHAR_WIDTH.value && CHAR_WIDTH.value != "") {
					theObj.setAttribute("cols", CHAR_WIDTH.value);
				} else if (theObj.getAttribute("cols") && CHAR_WIDTH.value == "") {
					theObj.removeAttribute("cols");
				}
			break;

			case "rows":
				if (theObj.getAttribute("rows") != NUM_LINES.value && NUM_LINES.value != "") {
					theObj.setAttribute("rows", NUM_LINES.value);
				} else if (theObj.getAttribute("rows") && NUM_LINES.value == "") {
					theObj.removeAttribute("rows");
				}
			break;

			case "wrap":
				if (theObj.getAttribute("wrap") != WRAP.getValue() && WRAP.getValue() != "") {
					theObj.setAttribute("wrap", WRAP.getValue());
				} else if (theObj.getAttribute("wrap") && WRAP.getValue() == "") {
					theObj.removeAttribute("wrap");
				}
			break;

			case "required":
				if (REQUIRED.checked) {
					theObj.setAttribute("required", "yes");
				} else {
					theObj.removeAttribute("required");
				}
			break;

			case "validate":
				if (theObj.getAttribute("validate") != VALIDATE.getValue() && VALIDATE.getValue() != "") {
					theObj.setAttribute("validate",VALIDATE.getValue());
					editOccurred = true;
				} else if (theObj.getAttribute("validate") && VALIDATE.getValue() == "") {
					theObj.removeAttribute("validate");
					editOccurred = true;
				}
			break;

			case "validateAt":
				if (theObj.getAttribute("validateAt") != VALIDATEAT.getValue() && VALIDATEAT.getValue() != "") {
					theObj.setAttribute("validateAt",VALIDATEAT.getValue());
					editOccurred = true;
				} else if (theObj.getAttribute("validateAt") && VALIDATEAT.getValue() == "") {
					theObj.removeAttribute("validateAt");
					editOccurred = true;
				}
			break;

			case "label":
				if (theObj.getAttribute("label") != LABEL.value && LABEL.value != "") {
					theObj.setAttribute("label", LABEL.value);
					editOccurred = true;
				} else if (theObj.getAttribute("label") && LABEL.value == "") {
					theObj.removeAttribute("label");
					editOccurred = true;
				}
			break;

			case "style":
				if (theObj.getAttribute("style") != STYLE.value && STYLE.value != "") {
					theObj.setAttribute("style", STYLE.value);
				} else if (theObj.getAttribute("style") && STYLE.value == "") {
					theObj.removeAttribute("style");
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



			case "value":
				if (theObj.getAttribute("value") != VALUE.value && VALUE.value != "") {
					theObj.setAttribute("value", VALUE.value);
				} else if (theObj.getAttribute("value") && VALUE.value == "") {
					theObj.removeAttribute("value");
				}
			break;

		}

		// Only change the document if the editOccurred flag has been set (which we
		// set if a change to the TagEdit object occurred).
	}  
}
