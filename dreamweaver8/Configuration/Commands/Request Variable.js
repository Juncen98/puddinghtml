// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var helpDoc         = MM.HELP_ssRequestVariable;

//******************* API **********************

function commandButtons(){
  return new Array(MM.BTN_OK,"okClicked()",MM.BTN_Cancel,"window.close()",MM.BTN_Help,"displayHelp()");
}

//***************** LOCAL FUNCTIONS  ******************

function okClicked(){
  var nameObj = document.forms[0].theName;

  if (nameObj.value) {
    if (IsValidVarName(nameObj.value)) {
      var typeObj = document.forms[0].theType;
      MM.requestContents = nameObj.value;
      MM.requestType     = typeObj.options[typeObj.selectedIndex].value;
      MM.retVal="OK";
      window.close();
    } else {
      alert(nameObj.value + " " + MM.MSG_InvalidParamName);
    }
  } else {
    alert(MM.MSG_NoName);
  }
}

function initializeUI() {
  var nameObj = document.forms[0].theName;
  nameObj.focus();
  nameObj.select();
}
