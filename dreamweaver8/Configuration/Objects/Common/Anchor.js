// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved

//---------------   GLOBAL VARIABLES   ---------------

var helpDoc = MM.HELP_objAnchor;

//---------------    LOCAL FUNCTIONS   ---------------

function initUI() {
  var curDOM = dw.getDocumentDOM('document');
  if (curDOM && (curDOM.getSelectedNode().nodeType == Node.TEXT_NODE)) {
    var curSel = dw.getSelection();
    document.theform.anchorname.value = curDOM.documentElement.outerHTML.slice(curSel[0],curSel[1]);
  }
  document.theform.anchorname.focus();
}

function errorCheck()
{
  var theString = document.forms[0].anchorname.value;
	if (theString.search(/\W/) != -1)
	{
	  alert(MM.MSG_InvalidName);
		document.forms[0].anchorname.value = theString.replace(/\W/g,"")
	}
}
//---------------     API FUNCTIONS    ---------------

function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	return false;
}

function objectTag() {
  // Return the html tag that should be inserted
  errorCheck()

  var idStr = ''
  if (dw.getDocumentDOM().getIsXHTMLDocument())
	idStr = ' id="' + document.forms[0].anchorname.value + '"'

  if (dw.getFocus(true) == 'html' || dw.getFocus() == 'textView')
    return '<A NAME="' + document.forms[0].anchorname.value + '"' + idStr + '></A>';
  else
    return '<A NAME="' + document.forms[0].anchorname.value + '"' + idStr + '>';
}



