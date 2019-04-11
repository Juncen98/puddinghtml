//
// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.
// ----------------------------------------------------
//
// Accessibility.js
//
// This command adds 
// 
//
// Version 1.0
// Added functions...
// ----------------------------------------------------


var golbalFormItem;
var returnTag='';
var helpDoc = MM.HELP_objAppletAccessOptions;

function commandButtons() {
   return new Array(MM.BTN_OK,         "setAppletStr();window.close()",
                    MM.BTN_Cancel,     "window.close()",
                    MM.BTN_Help,       "displayHelp()"    );


}

function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	return false;
}

function setFormItem(formItem) {
	globalFormItem = formItem;
	returnTag = globalFormItem;
}

function setAppletStr()
{
	var rtnStr='';

	rtnStr= globalFormItem;


////////////////////////////////////////////////////////////////
// Attributes: Compose rtnStr with the attributes that have a value
// Possible attributes are: alt and title


// if alt attribute has a value, apply it to the initStr

	var altValue = document.forms[0].altField.value;
	if (altValue != ""){
		rtnStr = addAttribute("alt", altValue, rtnStr);
	}

// if title attribute has a value, apply it to the initStr

	var titleValue = document.forms[0].titleField.value;

	if (titleValue != ""){ 
		rtnStr= addAttribute("title", titleValue, rtnStr);
	}

	returnTag= rtnStr;
}

function returnAccessibilityStr () {

	return returnTag;
}

///////////////////////////////////////////////////////////////
// other functions
//////////////////////////////////////////////////////////////


function addAttribute(attName, attVal, initStr){

	arrayElem= initStr.split(">");
	rtnStr= arrayElem[0] + " " + attName + "=" + '\"' + attVal + '\"' + ">" + arrayElem[1] + ">";
	
	return rtnStr;
}
