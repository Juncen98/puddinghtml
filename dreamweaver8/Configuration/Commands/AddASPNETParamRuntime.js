// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

var helpDoc = MM.HELP_cmdASPNetBuildRuntime;

var _ParamName = null;
var _ParamSource = null;
var _ParamDefault = new TextField("AddASPNetParamRuntime.htm", "ParamDefault");

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
  var paramName = _ParamName.value;
  var paramSource = _ParamSource.getValue();
  var paramDefault = _ParamDefault.getValue();
  var runtime = dwscripts.getParameterCodeFromType(paramSource, paramName, paramDefault);

  dwscripts.setCommandReturnValue(runtime);
  window.close();

  return;
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
  // Initialize UI elements

  _ParamName = dwscripts.findDOMObject("ParamName"); 
  _ParamSource = new ListControl("ParamSource");
  _ParamDefault.initializeUI();

  // Get the arguments passed in

  var cmdArgs = dwscripts.getCommandArguments();
  var paramName = "";
  var paramDefault = "";

  if (cmdArgs && cmdArgs.length) 
  {
	paramName = (cmdArgs[0] ? cmdArgs[0] : "");
	paramDefault = (cmdArgs[1] ? cmdArgs[1] : "");
  }

  // If the name starts with "@", remove it

  if (paramName.charAt(0) == '@')
  {
    paramName = paramName.substring(1, paramName.length);
  }
  
  _ParamName.value = paramName;
  _ParamDefault.setValue(paramDefault);

  var types = dwscripts.getParameterTypeArray(true);
  _ParamSource.setAll(types, types);

  _ParamName.focus();
}
