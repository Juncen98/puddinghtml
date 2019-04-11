//Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

var HELP_DOC = '';

var divNames = new Array("TextPassword", "ButtonSubmitReset", "CheckboxRadio", "File", "Hidden", "Image", "DatefieldDatechooser");

var TAG_IMG;
var TAG_TITLE;

// Text, Password
var TP_CBOX_READONLY;
var TP_LIST_MODE;
var TP_MAXLEN;
var TP_TEXT;
var TP_MASK;
var textModeVals = ['text', 'password'];

// Button, Submit, Reset
var BSR_SUBMIT;
var BSR_RESET;
var BSR_NONE;

// Checkbox, Radio
var CR_VALUE;
var CR_CHECKED;
var CR_UNCHECKED;

// File
var F_MAXLEN;

// Hidden
var H_VALUE;

// Image
var I_SRC;
var I_ALT;
var I_ALIGN;
var I_BORDER;

//DateField, DateChooser
var DFDC_VALUE;

// CF specific & GENERAL attributes
var NAME;
var VALIDATE;
var VALIDATEAT;
var LABEL;
var PATTERN;
var HEIGHT;
var WIDTH;
var SIZE;
var REQUIRED;

var validateAtVals = ['', 'onSubmit', 'onServer', 'onBlur']


//--------------------------------------------------------------------
// FUNCTION:
//   hideAllDivs
//
// DESCRIPTION:
//   Sets the visibility attribute to hidden for all divs defined in
//   divNames array
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//   Nothing.
//--------------------------------------------------------------------
function hideAllDivs() {
	for (var i in divNames) {
		document.layers[divNames[i]].visibility = "hidden";
	}
}



//--------------------------------------------------------------------
// FUNCTION:
//   showDiv
//
// DESCRIPTION:
//   Sets the visibility attribute to "visible" for the div indicated
//   by name argument, and sets to "hidden" all other divs
//
// ARGUMENTS: 
//   name - div name o be displayed
//
// RETURNS:
//   Nothing.
//--------------------------------------------------------------------
function showDiv(name) {
		//Tags the toggled based on input selection
	TAG_IMG = dwscripts.findDOMObject("piImage");
	TAG_TITLE = dwscripts.findDOMObject("HHH");
	
	switch (name) {
		case "text":
		case "password":
			TAG_IMG.src = 'Img/input_textbox.gif';
			TAG_TITLE.innerHTML = 'Cftextfield';	//'CF TextField';
			HELP_DOC = MM.HELP_settingCFtextfieldProperties_PI;
			if (document.layers["TextPassword"].visibility == "hidden") {
				hideAllDivs();
				document.layers["TextPassword"].visibility = "visible";
			}
		break;
		case "button":
		case "submit":
		case "reset":
			TAG_IMG.src = 'Img/input_button.gif';
			TAG_TITLE.innerHTML = 'Cfbutton';		//'CF Button';
			HELP_DOC = MM.HELP_settingCFbuttonProperties_PI;
			if (document.layers["ButtonSubmitReset"].visibility == "hidden") {
				hideAllDivs();
				document.layers["ButtonSubmitReset"].visibility = "visible";
			}
		break;
		case "checkbox":
		case "radio":
			if (name == "checkbox") {
				TAG_IMG.src = 'Img/input_checkbox.gif';
				TAG_TITLE.innerHTML = 'Cfcheckbox';	//'CF CheckBox';
				HELP_DOC = MM.HELP_settingCFcheckboxProperties_PI;
			} else {
				TAG_IMG.src = 'Img/input_radiobutton.gif';
				TAG_TITLE.innerHTML = 'Cfradiobutton';
				HELP_DOC = MM.HELP_settingCFradiobuttonProperties_PI;
			}
			if (document.layers["CheckboxRadio"].visibility == "hidden") {
				hideAllDivs();
				document.layers["CheckboxRadio"].visibility = "visible";
			}
		break;
		case "file":
			TAG_IMG.src = 'Img/input_file.gif';
			TAG_TITLE.innerHTML = 'Cffilefield';	//'CF FileField';
			HELP_DOC = MM.HELP_settingCFfilefieldProperties_PI;
			if (document.layers["File"].visibility == "hidden") {
				hideAllDivs();
				document.layers["File"].visibility = "visible";
			}
		break;
		case "hidden":
			TAG_IMG.src = 'Img/input_hidden.gif';
			TAG_TITLE.innerHTML = 'Cfhiddenfield';	//'CF HiddenField';
			HELP_DOC = MM.HELP_settingCFhiddenfieldProperties_PI;
			if (document.layers["Hidden"].visibility == "hidden") {
				hideAllDivs();
				document.layers["Hidden"].visibility = "visible";
			}
		break;
		case "image":
			TAG_IMG.src = 'Img/input_image.gif';
			TAG_TITLE.innerHTML = 'Cfimagefield';	//'CF ImageField';
			HELP_DOC = MM.HELP_settingCFimagefieldProperties_PI;
			if (document.layers["Image"].visibility == "hidden") {
				hideAllDivs();
				document.layers["Image"].visibility = "visible";
			}
		break;
		case "datefield":
		case "datechooser":
			TAG_IMG.src = 'Img/input_datefield.gif';
			if (name == "datefield") {
				TAG_TITLE.innerHTML = 'Cfdatefield';//'CF DateField';
				HELP_DOC = MM.HELP_settingCFdatefieldProperties_PI;
			} else {
				TAG_TITLE.innerHTML = 'Cfdatechooser';//'CF DateChooser';
				HELP_DOC = MM.HELP_settingCFdatechooserProperties_PI;
			}
			if (document.layers["DatefieldDatechooser"].visibility == "hidden") {
				hideAllDivs();
				document.layers["DatefieldDatechooser"].visibility = "visible";
			}
		break;
	}
}



//--------------------------------------------------------------------
// FUNCTION:
//   getDynamicData
//
// DESCRIPTION:
//   Opens the dynamic data dialog and allows the user to choose
//   a database field, then populates the passed-in text field
//   with the dynamic value.
//
// ARGUMENTS: 
//   forField - the field that should be populated with the dynamic
//     value
//
// RETURNS:
//   Nothing.
//--------------------------------------------------------------------
function getDynamicData(forField){
  var oldVal = forField.value;
  var newVal = dw.showDynamicDataDialog(forField.value);
  if (newVal){
    forField.value = newVal;
  }else{
    forField.value = oldVal;
  }
}



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
	fileName = dw.browseForFileURL("select", "", true);
	if (fileName) {
		tag.value = fileName;
	}
}



//--------------------------------------------------------------------
// FUNCTION:
//   editImage()
//
// DESCRIPTION:
//   This function allows you to edit the currently loaded image
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//   Nothing.
//--------------------------------------------------------------------
function editImage() {
	var app = dreamweaver.getPrimaryExtensionEditor(I_SRC.value);
	if ((app.length == 2)&&(I_SRC.value)) {
		dreamweaver.openWithApp(I_SRC.value, app[1]);
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

	// TEXT and PASSWORD type vars
	TP_CBOX_READONLY = dwscripts.findDOMObject("readOnly");
	TP_MAXLEN = dwscripts.findDOMObject("maxLength");
	TP_TEXT = dwscripts.findDOMObject("text");
	TP_MASK = dwscripts.findDOMObject("theMask");
	TP_LIST_MODE = new ListControl("textMode");

	
	// BUTTON, RESET, SUBMIT type vars
	BSR_SUBMIT = dwscripts.findDOMObject("theSubmit");
	BSR_RESET = dwscripts.findDOMObject("theReset");
	BSR_NONE = dwscripts.findDOMObject("theNone");

	// Checkbox, radio
	CR_VALUE = dwscripts.findDOMObject("CR_theValue");
	CR_CHECKED = dwscripts.findDOMObject("CR_theChecked");
	CR_UNCHECKED = dwscripts.findDOMObject("CR_theUnchecked");
	
	// File
	F_MAXLEN = dwscripts.findDOMObject("F_maxLength");
	
	// Hidden
	H_VALUE = dwscripts.findDOMObject("H_theValue");

	// Image
	I_SRC = dwscripts.findDOMObject("I_theSrc");
	I_ALT = dwscripts.findDOMObject("I_theAlt");
	I_BORDER = dwscripts.findDOMObject("I_theBorder");
	I_ALIGN = new ListControl("I_theAlign");
	I_ALIGN.setAll(theAlignImgCap, theAlignImgVal);

	//DateField, DateChooser
	DFDC_VALUE = dwscripts.findDOMObject("DFDC_theValue");

	// CF only attributes
	VALIDATE = new ListControl("validateMenu");
	VALIDATE.setAll(theInputValidateCap, theInputValidateVal);
	VALIDATE.prepend("","");
	VALIDATEAT = new ListControl("theValidateAt");
	VALIDATEAT.setAll(validateAtVals, validateAtVals);
	
	LABEL = dwscripts.findDOMObject("theLabel");
	PATTERN = dwscripts.findDOMObject("thePattern");
	HEIGHT = dwscripts.findDOMObject("theHeight");
	WIDTH = dwscripts.findDOMObject("theWidth");
	SIZE = dwscripts.findDOMObject("theSize");

	REQUIRED = dwscripts.findDOMObject("theRequired");
    
	// reposition form elements for Windows
	//if (navigator.platform.charAt(0)=="W") {
		// Move icon into position
		//document.layers["piImage"].top = 2;
		//document.layers["piImage"].left = 4;
		//document.layers["idBoxLayer"].top = 2;
		//document.layers["idBoxLayer"].left = 43;
	//}
	
	//Get the localized text names for the tag library array. We only want the ones in textModeVals
	//The arrays from the tag dialogs we want to use are theSelInputVal; and theSelInputCap;
	
	var listModeNames = new Array;
	var listModeVals = new Array;
	
	for( i = 0 ; i < textModeVals.length ; i++ )
	{
		for( j = 0 ; j < theSelInputVal.length ; j++ )
		{
			if( textModeVals[i] == theSelInputVal[j] )
			{
				listModeNames.push(theSelInputCap[j]);
				listModeVals.push(theSelInputVal[j]);
				break;	
			}
		}
	}
	
	TP_LIST_MODE.setAll(listModeNames,listModeVals);
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
	
	// TEXT and PASSWORD type vars
	TP_CBOX_READONLY.checked = false;
	TP_MAXLEN.value = "";
	TP_TEXT.value = "";
	TP_MASK.value = "";
	
	// Button, Reset, Submit
	BSR_SUBMIT.checked = false;
	BSR_RESET.checked = false;
	BSR_NONE.checked = false;

	// Checkbox, radio
	CR_VALUE.value = "";
	CR_CHECKED.checked = false;
	CR_UNCHECKED.checked = true;
	
	// File
	F_MAXLEN.value = "";
	
	// Hidden
	H_VALUE.value = "";
	
	// Image
	I_SRC.value = "";
	I_ALT.value = "";
	I_BORDER.value = "";
	I_ALIGN.setIndex(0);

	//DateField, DateChooser
	DFDC_VALUE.value = "";

	// CF only attributes
	VALIDATE.pickValue("");
	VALIDATEAT.pickValue("");
	LABEL.value = "";
	PATTERN.value = "";
	HEIGHT.value = "";
	WIDTH.value = "";
	SIZE.value = "";
	REQUIRED.checked = false;
}


//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
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

	var divType = theObj.getAttribute("type") ? theObj.getAttribute("type").toLowerCase() : "text";
	showDiv(divType);

	// Call initializeUI() here; it's how the global variables get
	// initialized. The onLoad event on the body tag is never triggered
	// in inspectors.
	initializeUI();
	initValues();

    
	if (theObj.getAttribute("name")) {
		NAME.value = theObj.getAttribute("name");
	}

	// Inspecting attribute values for the particular attributes

	// Text, Select
	if (theObj.getAttribute("type")) {
		TP_LIST_MODE.pickValue(theObj.getAttribute("type"), new Function("a,b", "return (a.toLowerCase() == b.toLowerCase());"));
	}
	if (theObj.getAttribute("maxLength")) {
		TP_MAXLEN.value = theObj.getAttribute("maxLength");
	}  
	if (theObj.getAttribute("value")) {
		TP_TEXT.value = theObj.getAttribute("value");
	}  
	if (theObj.getAttribute("mask")) {
		TP_MASK.value = theObj.getAttribute("mask");
	}  
	if (theObj.getAttribute("readonly")) {
		TP_CBOX_READONLY.checked = (theObj.getAttribute("readonly").toLowerCase() == "true") ? true : false;
	} else {
		TP_CBOX_READONLY.checked = false;
	}


	// Button, Submit, Reset
	if (theObj.getAttribute("type")) {
		switch (theObj.getAttribute("type").toLowerCase()) {
			case "button":
				BSR_NONE.checked = true;
				break;
			case "submit":
				BSR_SUBMIT.checked = true;
				break;
			case "reset":
				BSR_RESET.checked = true;
				break;
		}
	}

	// Checkbox, radio
	if (theObj.getAttribute("value")) {
		CR_VALUE.value = theObj.getAttribute("value");
	}  

	if (theObj.getAttribute("checked")) {
		if (theObj.getAttribute("checked") == "true") {
			CR_UNCHECKED.checked = false;
			CR_CHECKED.checked = true;
		} else {
			CR_UNCHECKED.checked = true;
			CR_CHECKED.checked = false;
		}
	} else {
		CR_UNCHECKED.checked = true;
		CR_CHECKED.checked = false;
	}
	
	// File
	if (theObj.getAttribute("maxLength")) {
		F_MAXLEN.value = theObj.getAttribute("maxLength");
	}  
	
	// Hidden
	if (theObj.getAttribute("value")) {
		H_VALUE.value = theObj.getAttribute("value");
	}  
	
	// Image
	if (theObj.getAttribute("src")) {
		I_SRC.value = theObj.getAttribute("src");
	}  
	if (theObj.getAttribute("alt")) {
		I_ALT.value = theObj.getAttribute("alt");
	}  
	if (theObj.getAttribute("border")) {
		I_BORDER.value = theObj.getAttribute("border");
	}  
	if (theObj.getAttribute("align")) {
		I_ALIGN.pickValue(theObj.getAttribute("align"), new Function("a,b", "return (a.toLowerCase() == b.toLowerCase());"));
	}
	
	//DateField, DateChooser
	if (theObj.getAttribute("value")) {
		DFDC_VALUE.value = theObj.getAttribute("value");
	}  
	
	// CF only attributes
	if (theObj.getAttribute("validate")) {
		VALIDATE.pickValue(theObj.getAttribute("validate"), new Function("a,b", "return (a.toLowerCase() == b.toLowerCase());"));
	}
	if (theObj.getAttribute("validateAt")) {
		VALIDATEAT.pickValue(theObj.getAttribute("validateAt"), new Function("a,b", "return (a.toLowerCase() == b.toLowerCase());"));
	}
	if (theObj.getAttribute("label")) {
		LABEL.value = theObj.getAttribute("label");
	}  
	if (theObj.getAttribute("pattern")) {
		PATTERN.value = theObj.getAttribute("pattern");
	}  
	if (theObj.getAttribute("height")) {
		HEIGHT.value = theObj.getAttribute("height");
	}  
	if (theObj.getAttribute("width")) {
		WIDTH.value = theObj.getAttribute("width");
	}  
	if (theObj.getAttribute("size")) {
		SIZE.value = theObj.getAttribute("size");
	}  
	if (theObj.getAttribute("required")) {
		if (theObj.getAttribute("required").toLowerCase() == "yes") {
			REQUIRED.checked = true;
		} else {
			REQUIRED.checked = false;
		}
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
	var editOccurred = false;

	if (attrib) {
		switch (attrib) {
			// Text, Password
			case "text":
				if (theObj.getAttribute("value") != TP_TEXT.value && TP_TEXT.value != "") {
					theObj.setAttribute("value", TP_TEXT.value);
				} else if (theObj.getAttribute("value") && TP_TEXT.value == "") {
					theObj.removeAttribute("value");
				}
			break;
        
			case "mask":
				if (theObj.getAttribute("mask") != TP_MASK.value && TP_MASK.value != "") {
					theObj.setAttribute("mask", TP_MASK.value);
				} else if (theObj.getAttribute("mask") && TP_MASK.value == "") {
					theObj.removeAttribute("mask");
				}
			break;
        
			case "maxLength":
				if (TP_MAXLEN.value != "") {
					if (TP_MAXLEN.value != parseInt(TP_MAXLEN.value) || parseInt(TP_MAXLEN.value) < 0) {
						alert(MM.MSG_ValuePositiveInteger);
						if (theObj.getAttribute("maxlength"))
							TP_MAXLEN.value = theObj.getAttribute("maxlength");
						else
							TP_MAXLEN.value = "";            
					} else if (theObj.getAttribute("maxlength") != TP_MAXLEN.value) {
						theObj.setAttribute("maxlength",TP_MAXLEN.value);
						editOccurred = true;
					}
				} else if (theObj.getAttribute("maxlength")) {
					theObj.removeAttribute("maxlength");
					editOccurred = true;
				}
			break;
        
			case "readOnly":
				if (theObj.getAttribute("readonly") && TP_CBOX_READONLY.checked == false) {
					theObj.removeAttribute("readonly");
					editOccurred = true;
				} else if (TP_CBOX_READONLY.checked == true) {
					theObj.setAttribute("readonly","true");
					editOccurred = true;
				}
			break;
        
			case "textMode":
				if (theObj.getAttribute("type") != TP_LIST_MODE.getValue() && TP_LIST_MODE.getValue() != "") {
					theObj.setAttribute("type",TP_LIST_MODE.getValue());
					editOccurred = true;
				} else if (theObj.getAttribute("type") && TP_LIST_MODE.getValue() == "") {
					theObj.removeAttribute("type");
					editOccurred = true;
				}
			break;
		
		
			// Checkbox, radio
			case "CR_checked":		// checkbox & radio checked attribute
				if (theObj.getAttribute("checked")) {
					if (CR_UNCHECKED.checked) {
						theObj.removeAttribute("checked");
					}
				} else if (CR_CHECKED.checked) {
					theObj.setAttribute("checked", "true");
				}

			break;

			case "CR_value":		// checkbox & radio value attribute
				if (theObj.getAttribute("value") != CR_VALUE.value && CR_VALUE.value != "") {
					theObj.setAttribute("value", CR_VALUE.value);
					editOccurred = true;
				} else if (theObj.getAttribute("value") && CR_VALUE.value == "") {
					theObj.removeAttribute("value");
					editOccurred = true;
				}
			break;


			// Button, Submit, Reset
			case "type":
				if ((BSR_NONE.checked)&&(theObj.getAttribute("type").toLowerCase() != "button")) {
					theObj.setAttribute("type", "button");
					editOccurred = true;
				} else if ((BSR_SUBMIT.checked)&&(theObj.getAttribute("type").toLowerCase() != "submit")) {
					theObj.setAttribute("type", "submit");
					editOccurred = true;
				} else if ((BSR_RESET.checked)&&(theObj.getAttribute("type").toLowerCase() != "reset")) {
					theObj.setAttribute("type", "reset");
					editOccurred = true;
				}
			break;


			// File
			case "F_maxLength":
				if (F_MAXLEN.value != "") {
					if (F_MAXLEN.value != parseInt(F_MAXLEN.value) || parseInt(F_MAXLEN.value) < 0) {
						alert(MM.MSG_ValuePositiveInteger);
						if (theObj.getAttribute("maxlength"))
							F_MAXLEN.value = theObj.getAttribute("maxlength");
						else
							F_MAXLEN.value = "";            
					} else if (theObj.getAttribute("maxlength") != F_MAXLEN.value) {
						theObj.setAttribute("maxlength",F_MAXLEN.value);
					}
				} else if (theObj.getAttribute("maxlength")) {
					theObj.removeAttribute("maxlength");
				}
			break;
        
			
			// Hidden
			case "H_value":		// checkbox & radio value attribute
				if (theObj.getAttribute("value") != H_VALUE.value && H_VALUE.value != "") {
					theObj.setAttribute("value", H_VALUE.value);
				} else if (theObj.getAttribute("value") && H_VALUE.value == "") {
					theObj.removeAttribute("value");
				}
			break;


			// Image
			case "I_src":		// IMAGE src attribute
				if (theObj.getAttribute("src") != I_SRC.value && I_SRC.value != "") {
					theObj.setAttribute("src", I_SRC.value);
				} else if (theObj.getAttribute("src") && I_SRC.value == "") {
					theObj.removeAttribute("src");
				}
			break;

			case "I_alt":		// IMAGE alt attribute
				if (theObj.getAttribute("alt") != I_ALT.value && I_ALT.value != "") {
					theObj.setAttribute("alt", I_ALT.value);
				} else if (theObj.getAttribute("alt") && I_ALT.value == "") {
					theObj.removeAttribute("alt");
				}
			break;
			
			case "I_border":		// IMAGE border attribute
				if (theObj.getAttribute("border") != I_BORDER.value && I_BORDER.value != "") {
					theObj.setAttribute("border", I_BORDER.value);
				} else if (theObj.getAttribute("border") && I_BORDER.value == "") {
					theObj.removeAttribute("border");
				}
			break;
			
			case "I_align":		// IMAGE align attribute
				if (theObj.getAttribute("align")) {
					if (theObj.getAttribute("align").toLowerCase() != I_ALIGN.getValue().toLowerCase() && I_ALIGN.getValue() != "") {
						theObj.setAttribute("align", I_ALIGN.getValue().toLowerCase());
					} else if (I_ALIGN.getValue() == "") {
						theObj.removeAttribute("align");
					}
				} else if (I_ALIGN.getValue() != "") {
					theObj.setAttribute("align", I_ALIGN.getValue().toLowerCase());
				}
			break;

			//DateField, DateChooser
			case "DFDC_value":		// checkbox & radio value attribute
				if (theObj.getAttribute("value") != DFDC_VALUE.value && DFDC_VALUE.value != "") {
					theObj.setAttribute("value", DFDC_VALUE.value);
				} else if (theObj.getAttribute("value") && DFDC_VALUE.value == "") {
					theObj.removeAttribute("value");
				}
			break;



			// Common tags
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

			case "pattern":
				if (theObj.getAttribute("pattern") != PATTERN.value && PATTERN.value != "") {
					theObj.setAttribute("pattern", PATTERN.value);
					editOccurred = true;
				} else if (theObj.getAttribute("pattern") && PATTERN.value == "") {
					theObj.removeAttribute("pattern");
					editOccurred = true;
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

			case "size":
				if (SIZE.value != "") {
					if (SIZE.value != parseInt(SIZE.value) || parseInt(SIZE.value) < 0) {
						alert(MM.MSG_ValuePositiveInteger);
						if (theObj.getAttribute("size"))
							SIZE.value = theObj.getAttribute("size");
						else
							SIZE.value = "";            
					} else if (theObj.getAttribute("size") != SIZE.value) {
						theObj.setAttribute("size", SIZE.value);
					}
				} else if (theObj.getAttribute("size")) {
					theObj.removeAttribute("size");
				}
			break;

			case "required":
				if (REQUIRED.checked) {
					theObj.setAttribute("required", "yes");
				} else {
					theObj.removeAttribute("required");
				}
			break;
		}

		// Only change the document if the editOccurred flag has been set (which we
		// set if a change to the TagEdit object occurred).
	}  
}


//--------------------------------------------------------------------
// FUNCTION:
//   refreshRadioGroup
//
// DESCRIPTION:
//   This function implements a radio-group. Only one radio button cand
//   be checked at ane time
//
// ARGUMENTS:
//   group - group name
//   name - the radio name to be checked
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function refreshRadioGroup(group, name) {
	if (group == 'BSR') {
		switch (name) {
			case "submit":
				BSR_RESET.checked = false;
				BSR_NONE.checked = false;
				break;
			case "reset":
				BSR_SUBMIT.checked = false;
				BSR_NONE.checked = false;
				break;
			case "none":
				BSR_RESET.checked = false;
				BSR_SUBMIT.checked = false;
				break;
		}
	} else if (group == 'CR') {
		switch (name) {
			case "checked":
				CR_UNCHECKED.checked = false;
				break;
			case "unchecked":
				CR_CHECKED.checked = false;
				break;
		}
	}
}
