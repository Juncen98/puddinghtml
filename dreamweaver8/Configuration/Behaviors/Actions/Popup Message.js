// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var helpDoc = MM.HELP_behPopupMessage;

//******************* BEHAVIOR FUNCTION **********************

//Passed a expression string, pops it up in an alert.

function MM_popupMsg(msg) { //v1.0
  alert(msg);
}


//******************* API **********************


//Can be used with any tag and any event

function canAcceptBehavior(){
  var retVal = "onClick,onMouseUp,onMouseDown,(onClick)";
  return retVal;
}



//Returns a Javascript function to be inserted in HTML head with script tags.

function behaviorFunction(){
  return "MM_popupMsg";
}



//Returns fn call to insert in HTML tag <TAG... onEvent='thisFn(arg)'>

function applyBehavior() {
  var index,frameObj,presBg,msgStr="",retVal;
  with (document.theForm) {
    msgStr = escExprStr(message.value,false);
  }
  if (msgStr == null) retVal = MSG_BadBraces;
  else if (msgStr) retVal = "MM_popupMsg('"+msgStr+"')";
  else retVal = MSG_NoMsg;
  return retVal
}



//Passed the function call above, takes prior arguments and reloads the UI.
//Removes any escape characters "\"

function inspectBehavior(fnStr){
  var argArray, msgStr;
 
  argArray = extractExprStr(fnStr);
  if (argArray.length == 1) { //expect 1 arg
    document.theForm.message.value = unescExprStr(argArray[0],false);
  }
}



//***************** LOCAL FUNCTIONS  ******************


//Load up the frames, set the insertion point

function initializeUI(){
  document.theForm.message.focus(); //set focus on textbox
  document.theForm.message.select(); //set insertion point into textbox
}
