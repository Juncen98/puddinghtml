//
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
// ----------------------------------------------------
//
// Object Options.js
//
// This command adds attributes to the following objects: generator, shockwave, flash.
// when the preferences for accessibility are checked.
//
// Version 1.0
// Functions:
//
// setAccessibilityAttrib: sets the attributes to the object selected by generator.js, activex.htm, flash.js, shockwave.js
// receives: string with object tag; if cancel the same string is returned.
// returns: if any accessibility attribute is supplied it returns the object tag with added attributes.
// ----------------------------------------------------

var globalFormItem;
var returnTag='';
var helpDoc = MM.HELP_objObjectAccessOptions;

function commandButtons() {
   return new Array(MM.BTN_OK,         "setAccessibilityStr(); window.close()",
                    MM.BTN_Cancel,     "window.close()",
                    MM.BTN_Help,       "displayHelp()"    );


}

function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	return false;
}

function setFormItem(formItem) {

	globalFormItem = formItem;	 
	returnTag= formItem;
}

function setAccessibilityStr()
{

	var rtnStr= globalFormItem;

	var title='', tabindex='', accesskey='',objStr='' ;
	var objFile = dreamweaver.getConfigurationPath() + "/Commands/Object Options.htm";
	var objDOM = dreamweaver.getDocumentDOM(objFile);
	
	title= objDOM.theForm.title.value;
	tabindex= objDOM.theForm.tabindex.value;
	accesskey= objDOM.theForm.accesskey.value;

	var tempFile = dreamweaver.getConfigurationPath() + "/Shared/Common/Cache/empty.htm";
    docDOM = dw.getDocumentDOM(tempFile);

    docDOM.body.innerHTML=globalFormItem;

    // media objects include plugin, applet and object tags; first define which tag to manage.
	var patternObject= /object/i;
	var patternApplet= /applet/i;
	var patternEmbed= /embed/i;

    if (patternObject.test(globalFormItem)) {objStr= docDOM.getElementsByTagName('object');} 
		else {if (patternEmbed.test(globalFormItem)){objStr= docDOM.getElementsByTagName('embed');}
			else {if (patternApplet.test(globalFormItem)){objStr= docDOM.getElementsByTagName('applet');} }}

	if (title != '') objStr[0].setAttribute('title', title);
	if (accesskey != '') objStr[0].setAttribute('accesskey', accesskey);
	if (tabindex != '') objStr[0].setAttribute('tabindex', tabindex);
	
	returnTag= docDOM.body.innerHTML;
}


function returnAccessibilityStr(){

	return returnTag;
}

// to do: implement data entry validation
function validateEntry() {

	var validateAccess= 0; 
	var validateTabIndex =0;

	while (validateAccess != 1 && validateTabIndex != 1){

		tabindex= objDOM.theForm.tabindex.value;
		accesskey= objDOM.theForm.accesskey.value;

		if (accesskey.length ) {alert(MSG_ACCESSKEY);} else {validateAccess= 1;}
		if (tabindex == NaN || tabindex > 32767 || tabindex < -32767) {alert(MSG_TABINDEX);} else {validateTabIndex= 1;}
	}
}
