//
// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
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


var globalFormItem;
var returnTag='';
var helpDoc = MM.HELP_objImageAccessOptions;

function commandButtons() {
   return new Array(MM.BTN_OK,         "setImageStr();window.close()",
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

function setImageStr()
{
	var rtnStr='';

	rtnStr= globalFormItem;

////////////////////////////////////////////////////////////////
// Attributes: Compose rtnStr with the attributes that have a value
// Possible attributes are: alt and longdesc


// if 'alt attribute' has a value, apply it to the initStr

	altIndexSelected = document.forms[0].alt.selectedIndex;
	altText = "";

	if( altText == null || altIndexSelected == 0){} 
	else {
		// If index < 0, user typed in a value for alt. Grab it using the editText
		// property.
		if (altIndexSelected < 0)
		{
			altText = document.forms[0].alt.editText;
		}
		var dom = dw.getDocumentDOM();
		var encoding = "";
		if( dom )
  		encoding = dom.getCharSet();
		altText = dwscripts_minEntityNameEncode(altText);
		if (encoding.toLowerCase() == "iso-8859-1" ) 
			altText = entityNameEncode(altText);

		rtnStr= addAttribute("alt", altText, rtnStr);
	}

	// if 'longdesc attribute' has a value, apply it to the initStr
	longdescValue=document.forms[0].longdesc.value;

	if( (longdescValue == null) || (longdescValue == "") || (longdescValue == "http://") ){} 
	else {
		rtnStr= addAttribute("longdesc", longdescValue, rtnStr);
	}

	returnTag= rtnStr;
}

function returnAccessibilityStr () {
	return returnTag;
}

///////////////////////////////////////////////////////////////
// other functions
//////////////////////////////////////////////////////////////
function initUI(){
  document.forms[0].alt.focus();
}

function addAttribute(tagName, tagVal, initStr){
	closeIdx = initStr.lastIndexOf(">");
	if (initStr.substring(closeIdx-1,closeIdx-1) == "/")
		closeIdx = closeIdx-1;
	if (initStr.substring(closeIdx-2,closeIdx-2) == " ")
		closeIdx = closeIdx-1;
	endStr = initStr.substring(closeIdx);
	startStr = initStr.substring(0,closeIdx);
	rtnStr= startStr + " " + tagName + "=" + '\"' + tagVal + '\"' + endStr;	
	return rtnStr;
}


function getImageSrc(tagStr){
	arrayElements= tagStr.split("src=\"");
	arrayStrings=  arrayElements[1].split("\"");
	src= arrayStrings[0];
	return src;
}

function browseForURL(){
  var urlField = document.forms[0].browseBtn.value;
  var url = dw.browseForFileURL('select');
  if (url != ""){
    document.longdesc.value = url;
    document.longdesc.focus();
  }
}
