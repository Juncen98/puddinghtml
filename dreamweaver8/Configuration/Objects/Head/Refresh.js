// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//---------------   GLOBAL VARIABLES   ---------------

var helpDoc = MM.HELP_objRefresh;


//---------------     API FUNCTIONS    ---------------

function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	return false;
}

function objectTag() {
  var Form=document.theForm;
  var Delay = Form.Seconds.value;
	if (!Delay)
	  Delay = 0;
  var Target=(Form.Target[0].checked)?Delay + ';URL=' + Form.URL.value:Delay;
  return '<meta http-equiv="refresh" content="' + Target + '">'
}

//---------------    LOCAL FUNCTIONS   ---------------

function browseForFile(){
  var fileName=browseForFileURL();
  document.theForm.URL.value=fileName;
}
