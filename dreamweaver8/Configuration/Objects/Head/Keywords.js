// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------

var helpDoc = MM.HELP_objKeywords;

//---------------     API FUNCTIONS    ---------------
function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	return false;
}

function objectTag() {
  // Return the html tag that should be inserted
  return '<meta name="keywords" content="' + document.theForm.Keywords.value + '">'
}
