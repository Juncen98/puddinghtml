//
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
// ----------------------------------------------------
//
// Accessibility.js
//
// This command adds accessibility attributes/tags to the <input> element
// attributes: tabindex, accessKey, "<lable for>|<lable>|none" and the label.
// 
//
// Version 1.0
// Added functions... TODO: use the dom to add attributes instead of pattern matching.
// ----------------------------------------------------

var helpDoc = MM.HELP_objFormAccessOptions;
var globalFormItem;
var returnTag='';

function commandButtons() {
   return new Array(MM.BTN_OK,         "setAccessibilityStr();window.close()",
                    MM.BTN_Cancel,     "setReturnStr();window.close()",
                    MM.BTN_Help,       "displayHelp()"    );


}


function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	return false;
}

function setFormItem(formItem) {
	globalFormItem = formItem;

}

function setReturnStr(){

    returnTag=globalFormItem;
}

function setAccessibilityStr()
{

	initStr= globalFormItem;
	rtnStr= initStr;


////////////////////////////////////////////////////////////////
// Attributes: Compose initStr with the attributes that have a value
// Possible attributes are: accesskey, tabindex and id (when <label for=""> is used.)


// if 'accesskey attribute' has a value, apply it to the initStr

	acsKeyValue=document.forms[0].accesskey.value;
	if( (acsKeyValue == null) || (acsKeyValue == "") ){} 
	else {
		initStr= addAttribute("accesskey", acsKeyValue, initStr);
	}

// if 'tabindex attribute' has a value, apply it to the initStr

	tabIndexValue=document.forms[0].tabindex.value;

	if( (tabIndexValue == null) || (tabIndexValue == "") ){} 
	else {
		initStr= addAttribute("tabindex", tabIndexValue, initStr);
	}

// if style requested is to include the 'for' attribute, then add id='elementName' to initStr

	elementName= getElement(initStr);
	if (document.forms[0].labeloption[1].checked) {

		initStr= addAttribute("id", elementName, initStr);
	}

////////////////////////////////////////////////////////////////
// Dialog Options: Label Style and Position
// resolve 'style option' and position for <LABEL> tag.

	labelStyle='none';
	// style CASE: 'wrap with label'  
	if (document.forms[0].labeloption[0].checked) {
		labelStyle='0';
		
		// position 'before/after' CASE
		if (document.forms[0].position[1].checked) {
			rtnStr= "<LABEL>" + initStr + document.forms[0].label.value + "</LABEL>";
		} 
		else {
			if (document.forms[0].position[0].checked) {
				rtnStr= "<LABEL>" + document.forms[0].label.value + initStr + "</LABEL>";
			}
		}
	}

	// style CASE: 'wrap with label and use 'for' attribute'  
	if (document.forms[0].labeloption[1].checked) {
		labelStyle='1';
		elementName= getElement(initStr);

		// position CASE: 'before/after' 
		if (document.forms[0].position[1].checked) {
			rtnStr= initStr + "<LABEL for=" + "\"" + elementName + "\">"+ document.forms[0].label.value + "</LABEL>";
		} 
		else {
			if (document.forms[0].position[0].checked) {
				rtnStr= "<LABEL for=" + "\"" + elementName + "\">"+ document.forms[0].label.value + "</LABEL>" + initStr;
			}
		}
	}

	if(	labelStyle == 'none'){
	labelStyle= '2';

		// position CASE: 'before/after' 
		if (document.forms[0].position[1].checked) {
			rtnStr= initStr + document.forms[0].label.value;
		} 
		else {
			if (document.forms[0].position[0].checked) {
				rtnStr= document.forms[0].label.value + initStr;
			}
		}	
	}
	setLabelPref(labelStyle);
	returnTag= rtnStr;
}

function returnAccessibilityStr(){

return returnTag;
}

///////////////////////////////////////////////////////////////
// functions
//////////////////////////////////////////////////////////////

function isRadioButton(){
	var pattern= /type="radio"/;
	isradio= pattern.test(globalFormItem);
	return isradio;
}

function isCheckbox(){
	var pattern= /type="checkbox"/;
	ischeckbox= pattern.test(globalFormItem);
	return ischeckbox;
}

function addAttribute(tagName, tagVal, initStr){
	arrayElem= initStr.split(">");
  if (arrayElem.length == 1 || arrayElem[1] == ""){
  	rtnStr= arrayElem[0] + " " + tagName + "=" + '\"' + tagVal + '\"' + ">";
  }else{
  	rtnStr= arrayElem[0] + " " + tagName + "=" + '\"' + tagVal + '\"' + ">" + arrayElem[1] + ">";
  }
	return rtnStr;
}

function initialize(){

	theForm = document.forms[0];

	labelStyle= getLabelStyle();
	if (labelStyle != 'none')
	{theForm.labeloption[labelStyle].checked=true;}

	if (isCheckbox() || isRadioButton()) {	
		theForm.position[1].checked=true;
	} 
	else {
		theForm.position[0].checked=true;
	}

}


function getLabelStyle() {
  var autoAdd, rtnValue = 'none';
  var path = dreamweaver.getConfigurationPath() + '/Objects/Forms/AccessibilityOptions.js';
  var metaFile;
  metaFile = MMNotes.open(path, false);
  if (metaFile) {

    autoAdd = MMNotes.get(metaFile, 'LABEL_style');
    if (autoAdd) rtnValue = autoAdd;
    MMNotes.close(metaFile);
  }
  return rtnValue;
}


function setLabelPref(setValue) {
  var path = dreamweaver.getConfigurationPath() + '/Objects/Forms/AccessibilityOptions.js';
  var metaFile;

  metaFile = MMNotes.open(path, true); // Force create the note file.
  if (metaFile) {
	if (setValue){

		autoAdd = MMNotes.set(metaFile, 'LABEL_style', setValue);
	}
    MMNotes.close(metaFile);
  }
}

function getElement(initStr){

	arrayElements= initStr.split("name=\"");
	arrayStrings=  arrayElements[1].split("\"");
	name= arrayStrings[0];
	return name;
}