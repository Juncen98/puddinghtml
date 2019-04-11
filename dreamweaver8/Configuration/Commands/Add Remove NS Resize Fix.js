// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved

//---------------     API FUNCTIONS    ---------------

function commandButtons() {
  var addCmd    =  "addNSResizeFix(); window.close();";
  var removeCmd =  "removeNSLayerFix(); window.close();";
  var retArr;

  // Include only buttons that make sense for the current selection.
  if (!dw.getDocumentDOM()) {
    retArr = new Array( 
                      MM.BTN_Cancel,   "window.close()"
                    );
  } else if (hasNSLayerFix() ){
    retArr = new Array( 
                      MM.BTN_Remove,   removeCmd,
                      MM.BTN_Cancel,   "window.close()"
                    );
  } else {
    retArr = new Array( 
                      MM.BTN_Add,       addCmd,
                      MM.BTN_Cancel,   "window.close()"
                    );
  }
  return retArr;
}

function canAcceptCommand() {
  var retVal = false;
  if (dw.getDocumentDOM() && dw.getDocumentDOM().getParseMode() == 'html' && (dw.getFocus() == 'document' || dw.getFocus(true) == 'html' || dw.getFocus() == 'textView')){
    retVal = true;
  }
  return retVal;
}


//---------------    LOCAL FUNCTIONS   ---------------


function initializeUI() {
  if (dw.getDocumentDOM() == null) return;
  if (hasNSLayerFix()) {
    document.mainForm.addMsg.visibility = "hidden";
    document.mainForm.removeMsg.visibility = "visible";
  } else {
    document.mainForm.removeMsg.visibility = "hidden";
    document.mainForm.addMsg.visibility = "visible";
  }
}

// Return the script to be inserted. The boolean parameter, if true
//  returns the enclosing script tag.
function nsScriptToInsert (bAddScript) {
  var rtnStr = '';
  rtnStr = 'function MM_reloadPage(init) %7B  //reloads the window if Nav4 resized%0D  if (init==true) with (navigator) %7Bif ((appName=="Netscape")&&(parseInt(appVersion)==4)) %7B%0D    document.MM_pgW=innerWidth; document.MM_pgH=innerHeight; onresize=MM_reloadPage; %7D%7D%0D  else if (innerWidth!=document.MM_pgW %7C%7C innerHeight!=document.MM_pgH) location.reload();%0D%7D%0DMM_reloadPage(true);%0D';
  if (bAddScript) 
	{
	  var aCurrDoc = dw.getDocumentDOM();
		if (dwscripts.isXSLTDoc())
		{
			rtnStr = '%3Cscript type=%22text%2Fjavascript%22%3E%0D%3C![CDATA[%0D' + rtnStr + ']]%3E%0D%3C/script%3E%0D';
		}
		else
		{
			rtnStr = '%3Cscript type=%22text%2Fjavascript%22%3E%0D%3C!--%0D' + rtnStr + '//--%3E%0D%3C/script%3E%0D';
		}
  }
  return unescape(rtnStr);
}


function hasNSLayerFix() {
  // The active window dom contains the document that Navigator will send 
  //  onresize event. This may be a frameset, a containing frameset or 
  //  or just the document.
  var curDOM = dw.getActiveWindow();
  return hasFunctionCall('MM_reloadPage', curDOM);
}


function addNSResizeFix() {
  var retVal = false;
  var dom = dw.getActiveWindow();
  var head = dom.getElementsByTagName('head');
  if (head && head.length > 0 && !hasNSLayerFix()) {
    // Add the entire fix and script tag.
    head[0].innerHTML += '\n' + nsScriptToInsert(true);
    retVal = true;
  } else { retVal = false;} // No head, fail to insert.
  return retVal;
}


function removeNSLayerFix() {
  var curDOM = dw.getActiveWindow();
  var inNode;
  // Look for exactly what we add, if the entire tag, comment and script are
  //  intact then remove the entire block.
  var curHTML = curDOM.documentElement.outerHTML;
  var nsFixStr = nsScriptToInsert(true);
  var nsFixLoc = curHTML.indexOf(nsFixStr);
  if (nsFixLoc != -1) {
    curHTML = curHTML.slice(0,nsFixLoc) + curHTML.slice(nsFixLoc + nsFixStr.length);
    curDOM.documentElement.outerHTML = curHTML;
  }
  // Otherwise, remove the function and calls.
  // Remove any calls to the function.
  while (deleteFunction('MM_reloadPage', curDOM)) {};
  // Note: deleteFunctionCall removes the script if empty.
  while (deleteFunctionCall('MM_reloadPage', curDOM)) {};
}
