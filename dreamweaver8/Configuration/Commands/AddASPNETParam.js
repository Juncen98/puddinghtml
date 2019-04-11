// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

var helpDoc = MM.HELP_cmdASPNetAddParam;

var _ParamName = null;
var _ParamType = null;
var _ParamValue = null;

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
  
  if (paramName != "")
  {
    var paramValue = _ParamValue.value;

	if (paramValue != "")
	{
      var retVal = new Array();

      retVal.push(_ParamName.value);
      retVal.push(_ParamType.get());
      retVal.push(_ParamValue.value);

      dwscripts.setCommandReturnValue(retVal);
      window.close();
    }
	else
	{
	  alert(MM.MSG_NeedParamValue);
	  _ParamValue.focus();
	}
  }
  else
  {
    alert(MM.MSG_NeedParamName);
    _ParamName.focus();
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

  var cmdArgs = dwscripts.getCommandArguments();

  _ParamName = dwscripts.findDOMObject("ParamName"); 
  _ParamType = new ListControl("ParamType");
  _ParamValue = dwscripts.findDOMObject("ParamValue");

  var paramName = "";
  var paramType = "";
  var paramValue = "";
 
  if (cmdArgs)
  {
    if (cmdArgs.length > 0)
    {
      var databaseType = cmdArgs[0];
      var types = SBDatabaseCallASPNET.getParamTypeList(databaseType);
    
	  _ParamType.setAll(types);
	}

	if (cmdArgs.length > 3)
	{
      paramName = cmdArgs[1];
	  paramType = cmdArgs[2];
      paramValue = cmdArgs[3];
	}
  }
   
  _ParamName.value = paramName;
  _ParamType.pick(paramType);
  _ParamValue.value = paramValue;

  _ParamName.focus();
}

function OnBuildValueClicked()
{
  var cmdArgs = new Array();
  
  cmdArgs.push(_ParamName.value);
    
  cmdArgs = dwscripts.callCommand("AddASPNETParamRuntime", cmdArgs);

  if (cmdArgs)
  {
    _ParamValue.value = cmdArgs;
  }
}
