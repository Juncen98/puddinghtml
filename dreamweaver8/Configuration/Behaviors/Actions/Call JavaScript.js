// Copyright 1998, 1999, 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var helpDoc = MM.HELP_behCallJavaScript;

//******************* BEHAVIOR FUNCTION **********************

//Evals a JavaScript string.
//browser window. Passed the following arg:
//  jsStr - a string

function MM_callJS(jsStr) { //v2.0
  return eval(jsStr)
}


//******************* API **********************


//Can be used with any tag and any event

function canAcceptBehavior(){
  return true;
}



//Returns a Javascript function to be inserted in HTML head with script tags.

function behaviorFunction(){
  return "MM_callJS";
}



//Returns fn call to insert in HTML tag <TAG... onEvent='thisFn(arg)'>
//Calls escQuotes to find embedded quotes and precede them with \

function applyBehavior() {
  var jsStr = escQuotes(document.theForm.message.value);
  if (jsStr == '') {
    return MSG_NoMsg;
  } else {
    return "MM_callJS('" + jsStr + "')";
  }
}



//Passed the function call above, takes prior arguments and reloads the UI.
//Removes any escape characters \

function inspectBehavior(jsStr){
  var startPos = jsStr.indexOf("(")+2;
  var endPos = jsStr.lastIndexOf(")",jsStr.length)-1;
  document.theForm.message.value = unescQuotes(jsStr.substring(startPos,endPos));
}



//***************** LOCAL FUNCTIONS  ******************


//Set the insertion point

function initializeUI(){
  document.theForm.message.focus(); //set focus on textbox
  document.theForm.message.select(); //set insertion point into textbox
}
