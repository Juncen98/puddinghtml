// Copyright 2003 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************
var helpDoc = MM.HELP_savePageDesign; 
// ******************* API **********************

function commandButtons()
{
  return new Array(MM.BTN_OK, "clickedOK()", MM.BTN_Cancel, "clickedCancel()", MM.BTN_Help, "displayHelp()"); 
}

//***************** LOCAL FUNCTIONS  ******************

function initializeUI() {
// Lori to do: hook up mechanism to remember last choice using MMNotes.
	document.theForm.localOrServer[0].checked = true;

}

function clickedCancel() {
  MM.commandReturnValue = "";
  window.close();
}

function clickedOK() {
  var retVal = "local";

  if (document.theForm.localOrServer[0].checked == true)
    retVal = "local";
  else
	  retVal = "server";
  
  MM.commandReturnValue = retVal;
  window.close();    
}