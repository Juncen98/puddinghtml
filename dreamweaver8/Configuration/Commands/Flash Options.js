//
// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
// ----------------------------------------------------
//
// Accessibility.js
//
// This command adds attributes to the flash objects when 
// the preferences for accessibility are checked.
//
// Version 1.0
// Functions:
//
// addAccessibilityAttrib: sets the attributes to the object selected by Flash Text.js or Flash Button.js
// receives: dom of document with flash object, and attributes from Flash Options.htm
// returns: nothing 
// ----------------------------------------------------


var globalFormItem;
var helpDoc = MM.HELP_objFlashAccessOptions;

function commandButtons() {
   return new Array(MM.BTN_OK,         "addAccessibilityAttrib();window.close()",
                    MM.BTN_Cancel,     "window.close()",
                    MM.BTN_Help,       "displayHelp()"    );


}

function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	return false;
}

function setFormItem(formItem) {

	globalDom = formItem;
}

function addAccessibilityAttrib()
{

	var title='', tabindex='', accesskey='',objStr='' ;

	var docDom= globalDom; 
	var objtag= docDom.getSelectedNode();


	var objFile = dreamweaver.getConfigurationPath() + "/Commands/Flash Options.htm";
	var objDOM = dreamweaver.getDocumentDOM(objFile);
	
	title= objDOM.theForm.title.value;
	tabindex= objDOM.theForm.tabindex.value;
	accesskey= objDOM.theForm.accesskey.value;

	if (accesskey != '') { docDom.setAttribute('accesskey', accesskey); }
	else if (objtag.getTranslatedAttribute('accesskey') != '') { objtag.removeAttribute('accesskey'); }
	if (tabindex != '') { docDom.setAttribute('tabindex', tabindex); }
	else if (objtag.getTranslatedAttribute('tabindex') != '') { objtag.removeAttribute('tabindex'); }
	if (title != '') { docDom.setAttribute('title', title); }
	else if (objtag.getTranslatedAttribute('title') != '') { objtag.removeAttribute('title'); }

}

function initializeUI()
// populate dialog attributes if defined
{

	var docDom= globalDom; 
	var objtag= docDom.getSelectedNode();

	var objFile = dreamweaver.getConfigurationPath() + "/Commands/Flash Options.htm";
	var objDOM = dreamweaver.getDocumentDOM(objFile);

	var title='', tabindex='', accesskey='',objStr='' ;

	title= objtag.getTranslatedAttribute('title');
	if (title) objDOM.theForm.title.value= title;

	tabindex= objtag.getTranslatedAttribute('tabindex');
	if (tabindex) objDOM.theForm.tabindex.value= tabindex;

	accesskey= objtag.getTranslatedAttribute('accesskey');
	if (accesskey) objDOM.theForm.accesskey.value= accesskey;
	
}

