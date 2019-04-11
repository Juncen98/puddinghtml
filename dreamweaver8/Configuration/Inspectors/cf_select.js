//Copyright 2005 Macromedia, Inc. All rights reserved.

var HELP_DOC = MM.HELP_settingCFselectProperties_PI;

var NAME;

var TYPE_MENU;
var TYPE_LIST;
var SIZE;
var ALLOW_MULTIPLE;
var LIST_VALUES;		// button

var QUERY;
var DISPALY;
var VALUE;
var LABEL;
var HEIGHT;
var WIDTH;
var MESSAGE;
var REQUIRED;
var SELECTED;

var dom;
var theObj;

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
//   listValues()
//
// DESCRIPTION:
//   Opens a dialog from which the user can view, add, delete options
//   to his select.
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//   Nothing.
//--------------------------------------------------------------------
function listValues() {
	var list = theObj.getElementsByTagName("option");

	var options = new Object();
	options.labels = new Array();
	options.values = new Array();

	for (var i=0; i<list.length; i++) {
		options.labels.push(list[i].text);
		options.values.push(list[i].value);
	}
	var newOptions = dwscripts.callCommand('CFSelectListValues.htm', options);

	if (newOptions) {
		theObj.innerHTML = '';
	
		for (var i=0; i<newOptions.length; i++) {
			theObj.innerHTML = theObj.innerHTML + '<option value="'+newOptions[i][1]+'">'+newOptions[i][0]+'</option>';
		}
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
	if (group == 'theType') {
		switch (name) {
			case "theMenu":
				TYPE_LIST.checked = false;
				SIZE.disabled = true;
				ALLOW_MULTIPLE.disabled = true;
			break;
			case "theList":
				TYPE_MENU.checked = false;
				SIZE.disabled = false;
				ALLOW_MULTIPLE.disabled = false;
			break;
		}
	}
}



//--------------------------------------------------------------------
// FUNCTION:
//   getOptions()
//
// DESCRIPTION:
//   Loads the entire list of options within the current CFSelect tag
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function getOptions() {
	var list = theObj.getElementsByTagName("option");

	SELECTED.innerHTML = '';
	
	for (var i=0; i<list.length; i++) {
		var newOption = new Option();
		newOption.text = list[i].text;
		newOption.value = list[i].value;
		SELECTED.options.push(newOption);
	}
	
	if (ALLOW_MULTIPLE.checked) {
		SELECTED.setAttribute('multiple', true);
	} else {
		SELECTED.removeAttribute("multiple");
	}
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

	NAME = dwscripts.findDOMObject("theName");
	
	TYPE_MENU = dwscripts.findDOMObject('theMenu');
	TYPE_LIST = dwscripts.findDOMObject('theList');
	
	SIZE = dwscripts.findDOMObject("theSize");
	LIST_VALUES = dwscripts.findDOMObject('theListValues');
	ALLOW_MULTIPLE = dwscripts.findDOMObject('theAllowMultiple');
	
	QUERY = new EditableRecordsetMenu("", "theQuery", true);
	DISPLAY = dwscripts.findDOMObject('theDisplay');
	VALUE = dwscripts.findDOMObject('theValue');
	LABEL = dwscripts.findDOMObject('theLabel');
	HEIGHT = dwscripts.findDOMObject('theHeight');
	WIDTH = dwscripts.findDOMObject('theWidth');
	MESSAGE = dwscripts.findDOMObject('theMessage');
	REQUIRED = dwscripts.findDOMObject("theRequired");

	SELECTED = dwscripts.findDOMObject('theSelected');
    
	// reposition form elements for Windows
	//if (navigator.platform.charAt(0)=="W") {
		// Move icon into position
	//	document.layers["piImage"].top = 2;
	//	document.layers["piImage"].left = 4;
	//	document.layers["idBoxLayer"].top = 2;
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
	
	TYPE_MENU.checked = true;
	TYPE_LIST.checked = false;
	SIZE.value = "";
	SIZE.disabled = true;
	ALLOW_MULTIPLE.checked = false;
	ALLOW_MULTIPLE.disabled = true;

	//do this just to populate the menu with the available recordsets
	QUERY.initializeUI("theQuery");
	//replace the "none" first value with an acutal empty label
	QUERY.listControl.set('', 0);
	QUERY.listControl.setValue('', 0);
	
	DISPLAY.value = "";
	VALUE.value = "";
	LABEL.value = "";
	HEIGHT.value = "";
	WIDTH.value = "";
	MESSAGE.value = "";
	REQUIRED.checked = false;
	
	dom = dw.getDocumentDOM();
	theObj = dom.getSelectedNode();

    getOptions();
}


//--------------------------------------------------------------------
// FUNCTION:
//   inspectSelectedOptions
//
// DESCRIPTION:
//   Refreshes the contents of the Initially selected options
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function inspectSelectedOptions() {
	list = theObj.getElementsByTagName("option");
	for (var i=0; i<list.length; i++) {
		if (list[i].getAttribute('selected')) {
			SELECTED.options[i].setAttribute("selected", true);
		} else {
			if (SELECTED.options[i].getAttribute("selected")) {
				SELECTED.options[i].removeAttribute("selected");
			}
		}
	}
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
//	var dom = dw.getDocumentDOM();
//	var theObj = dom.getSelectedNode(); //new TagEdit(dom.getSelectedNode().outerHTML);

	// Call initializeUI() here; it's how the global variables get
	// initialized. The onLoad event on the body tag is never triggered
	// in inspectors.
	initializeUI();
	initValues();

	if (theObj.getAttribute("name")) {
		NAME.value = theObj.getAttribute("name");
	}

	if (theObj.getAttribute("size")) {
		TYPE_LIST.checked = true;
		TYPE_MENU.checked = false;
		SIZE.value = theObj.getAttribute("size");
		ALLOW_MULTIPLE.checked = (theObj.getAttribute("multiple") == "yes") ? true : false;
		SIZE.disabled = false;
		ALLOW_MULTIPLE.disabled = false;
	} else {
		TYPE_MENU.checked = true;
		TYPE_LIST.checked = false;
		SIZE.disabled = true;
		ALLOW_MULTIPLE.disabled = true;
	}

	var queryVal = theObj.getAttribute("query")
	if (queryVal) {
		if( !QUERY.rsNameIsValid(queryVal) )
		{
			//not a RS we recognize, change the empty label to this
			QUERY.listControl.set(queryVal, 0);
			QUERY.listControl.setValue(queryVal, 0);
		}
		QUERY.listControl.pick(queryVal);
	}

	if (theObj.getAttribute("display")) {
		DISPLAY.value = theObj.getAttribute("display");
	}  

	if (theObj.getAttribute("value")) {
		VALUE.value = theObj.getAttribute("value");
	}  

	if (theObj.getAttribute("label")) {
		LABEL.value = theObj.getAttribute("label");
	}  

	if (theObj.getAttribute("height")) {
		HEIGHT.value = theObj.getAttribute("height");
	}  

	if (theObj.getAttribute("width")) {
		WIDTH.value = theObj.getAttribute("width");
	}  

	if (theObj.getAttribute("message")) {
		MESSAGE.value = theObj.getAttribute("message");
	}  

	if (theObj.getAttribute("required")) {
		if (theObj.getAttribute("required").toLowerCase() == "yes") {
			REQUIRED.checked = true;
		} else {
			REQUIRED.checked = false;
		}
	}

	if (SELECTED.getAttribute("multiple")) {
		SELECTED.removeAttribute("multiple");
	}
	
	if (ALLOW_MULTIPLE.checked) {
		SELECTED.setAttribute("multiple", true);
	}

	inspectSelectedOptions();
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
				} else if (theObj.getAttribute("name") && NAME.value == "") {
					theObj.removeAttribute("name");
				}
				
//				if (NAME.value != "" && !dwscripts.isValidVarName(NAME.value)) {
//						alert(MM.MSG_InvalidIDAutoFix);	// test the case of a name with first chr a number or special chr
//				}
			break;

			case "type":
				if (TYPE_MENU.checked) {
					if (theObj.getAttribute("size")) {
						theObj.removeAttribute("size");
					}
					if (theObj.getAttribute("multiple")) {
						theObj.removeAttribute("multiple");
					}
				} else if (TYPE_LIST.checked) {
					theObj.setAttribute("size", 1);
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

			case "allowMultiple":
				if (ALLOW_MULTIPLE.checked) {
					if ((!theObj.getAttribute("multiple")) || (theObj.getAttribute("multiple").toLowerCase() != "yes")) {
						theObj.setAttribute("multiple", "yes");
					}
				} else {
					if (theObj.getAttribute("multiple")) {
						theObj.removeAttribute("multiple");
					}
				}
			break;
			
			case "query":
				if (theObj.getAttribute("query") != QUERY.getValue() && QUERY.getValue() != "") {
					theObj.setAttribute("query", QUERY.getValue());
				} else if (theObj.getAttribute("query") && QUERY.getValue() == "") {
					theObj.removeAttribute("query");
				}
			break;

			case "display":
				if (theObj.getAttribute("display") != DISPLAY.value && DISPLAY.value != "") {
					theObj.setAttribute("display", DISPLAY.value);
				} else if (theObj.getAttribute("display") && DISPLAY.value == "") {
					theObj.removeAttribute("display");
				}
			break;

			case "value":
				if (theObj.getAttribute("value") != VALUE.value && VALUE.value != "") {
					theObj.setAttribute("value", VALUE.value);
				} else if (theObj.getAttribute("value") && VALUE.value == "") {
					theObj.removeAttribute("value");
				}
			break;

			case "label":
				if (theObj.getAttribute("label") != LABEL.value && LABEL.value != "") {
					theObj.setAttribute("label", LABEL.value);
				} else if (theObj.getAttribute("label") && LABEL.value == "") {
					theObj.removeAttribute("label");
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
					}
				} else if (theObj.getAttribute("height")) {
					theObj.removeAttribute("height");
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
					}
				} else if (theObj.getAttribute("width")) {
					theObj.removeAttribute("width");
				}
			break;

			case "message":
				if (theObj.getAttribute("message") != MESSAGE.value && MESSAGE.value != "") {
					theObj.setAttribute("message", MESSAGE.value);
				} else if (theObj.getAttribute("message") && MESSAGE.value == "") {
					theObj.removeAttribute("message");
				}
			break;

			case "required":
				if (REQUIRED.checked) {
					theObj.setAttribute("required", "yes");
				} else {
					theObj.removeAttribute("required");
				}
			break;
			
			case "selected":
				var list = theObj.getElementsByTagName("option");
				for (var i=0; i<SELECTED.options.length; i++) {
					if (SELECTED.options[i].getAttribute("selected")) {
						if (!list[i].getAttribute("selected")) {
							list[i].setAttribute("selected", true);
						}
					} else if (list[i].getAttribute("selected")) {
						list[i].removeAttribute("selected");
					}
				}
				dom.setSelectedNode(theObj);
			break;
		}
	}  
}
