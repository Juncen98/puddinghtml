// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

var CFParamNameList = null;
var CFParamValue = null;


// *************** GLOBALS VARS *****************

var HELP_DOC = MM.HELP_cmdCFAddParam; 


//*************************API**************************

//--------------------------------------------------------------------
// FUNCTION:
//   commandButtons
//
// DESCRIPTION:
//   Returns the array of buttons that should be displayed on the
//   right hand side of the dialog.  The array is comprised
//   of name, handler function name pairs.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   array of strings - name, handler function name pairs
//--------------------------------------------------------------------

function commandButtons()
{                          
  return new Array(MM.BTN_OK,     "okClicked()",
                   MM.BTN_Cancel, "cancelClicked()",
                   MM.BTN_Help,   "displayHelp()" );
}


//--------------------------------------------------------------------
// FUNCTION:
//   okClicked
//
// DESCRIPTION:
//   Sets the return value to the selected DSN and closes the window.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function okClicked()
{
  var paramName = CFParamNameList.get();
  var paramDefault = CFParamValue.value;
  if (!paramName || !dwscripts.trim(paramName))
  {
    alert(MM.MSG_MissingParameterName); 
  }
  else
  {
    var retArray = new Array(paramName,paramDefault); 
    dwscripts.setCommandReturnValue(retArray);
    window.close();
  } 
}

//--------------------------------------------------------------------
// FUNCTION:
//   cancelClicked
//
// DESCRIPTION:
//   Closes the window and returns nothing
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function cancelClicked()
{
  dwscripts.setCommandReturnValue("");

  window.close();
}

//--------------------------------------------------------------------
// FUNCTION:
//   displayHelp
//
// DESCRIPTION:
//   This function is called when the user clicks the HELP button
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function displayHelp()
{
  dwscripts.displayDWHelp(HELP_DOC);
}

// ***************** LOCAL FUNCTIONS  ******************
//--------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//   This function is called by the UI controls to handle UI updates
//
// ARGUMENTS:
//   control - string - the name of the control sending the event
//   event - string - the event which is being sent
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function updateUI(control, event)
{
  if (control == "CFParamName")
  {
    CFParamValue.value = "";
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//   This function is called in the onLoad event.  It is responsible
//   for initializing the UI.  If we are inserting a recordset, this
//   is a matter of populating the connection drop down.
//
//   If we are modifying a recordset, this is a matter of inspecting
//   the recordset tag and setting all the form elements.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function initializeUI()
{
  var theArgumentObj = dwscripts.getCommandArguments(); 

  var isEdit = false;
  var nameList = new Array();
  var selectName = "";
  var selectDefault = ""; 
  
  if (theArgumentObj && theArgumentObj.length) 
  {
    isEdit = (theArgumentObj[0]) ? theArgumentObj[0] : false;
    nameList = (theArgumentObj[1]) ? theArgumentObj[1] : new Array();
    selectName = (theArgumentObj[2]) ? theArgumentObj[2] : "";
    selectDefault = (theArgumentObj[3]) ? theArgumentObj[3] : ""; 
  }

  CFParamNameList = new ListControl("CFParamName"); 
  CFParamNameList.setAll(nameList, nameList);
  if (nameList.length)
  {
    CFParamNameList.setIndex(0);
  }
  else
  {
    CFParamNameList.setIndex(-1);
    
    // Bug: when bring up dialog for second time, the param name list remembers
    //   the last value that was selected - even if you setAll with a blank array. 
    //   I assume this has to do with the fact that this is an editable select
    //   list. This workaround ensures the beginning value is empty.
    CFParamNameList.pick("");
  }
  
  CFParamValue = dwscripts.findDOMObject("CFParamValue"); 
  CFParamValue.value = selectDefault; 
  if (isEdit)
  {
    CFParamNameList.pick(selectName);
    CFParamNameList.disable();
    CFParamValue.focus();
  }
  else
  {
    CFParamNameList.enable();
    CFParamNameList.focus()
  }
}