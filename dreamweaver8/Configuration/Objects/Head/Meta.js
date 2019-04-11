// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------

var helpDoc = MM.HELP_objMeta;

//---------------     API FUNCTIONS    ---------------

function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	return false;
}

function objectTag() {
  var theForm = document.theForm;
  var retVal = "";
  var content = "";
  var selInd = theForm.metaAttribute.selectedIndex;
  var metaAttribute = (selInd == 0) ? 'name' : 'http-equiv';
  
  // Convert any returns in the Content to spaces before inserting.
  // If this replacement results in double spaces, convert to 
  // single spaces.
  content = theForm.Content.value.replace(/[\n\r]/g," ");
  content = content.replace(/\s+/g, " ");
  
  retVal='<meta ' + metaAttribute + '="' + 
    theForm.metaValue.value + '" Content="' + content +
    '">';    
 
  return retVal;
}

//---------------    LOCAL FUNCTIONS   ---------------

function initializeUI(){
  document.theForm.metaValue.focus(); //set focus in Value text field
}
