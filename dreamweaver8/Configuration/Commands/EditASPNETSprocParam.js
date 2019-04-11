// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

var helpDoc = MM.HELP_cmdASPNetSprocParam;

var _ParamName = null;
var _ParamType = null;
var _ParamSize = null;
var _ParamDirection = null;
var _ParamTestValue = null;
var _ParamValue = null;
var _BuildButton = null;

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
  do
  {
    var paramName = _ParamName.value;
  
    if (paramName == "")
    {
      alert(MM.MSG_NeedParamName);
      _ParamName.focus();
      break;
    }
	
    var direction = _ParamDirection.getValue();

    if (direction.toUpperCase().indexOf("INPUT") != (-1))
    {
      var paramTestValue = _ParamTestValue.value;

      if (paramTestValue == "")
      {
        alert(MM.MSG_NeedParamTestValue);
        _ParamTestValue.focus();
        break;
      }
	
      var paramValue = _ParamValue.value;

      if (paramValue == "")
      {
        alert(MM.MSG_NeedParamValue);
        _ParamValue.focus();
        break;
      }
    }
	
    var retVal = new Array();

    retVal.push(_ParamName.value);
    retVal.push(_ParamType.getValue());
    retVal.push(_ParamSize.value);
    retVal.push(_ParamDirection.getValue());
    retVal.push(_ParamTestValue.value);
    retVal.push(_ParamValue.value);

    dwscripts.setCommandReturnValue(retVal);
    window.close();
  }
  while (false);
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
  _ParamType = new ListControl("ParamType");
  _ParamSize = dwscripts.findDOMObject("ParamSize");
  _ParamDirection = new ListControl("ParamDirection");
  _ParamTestValue = dwscripts.findDOMObject("ParamTestValue");
  _ParamValue = dwscripts.findDOMObject("ParamValue");
  _BuildButton = dwscripts.findDOMObject("BuildValue"); 

  var directions = ["Input", "Output", "InputOutput", "ReturnValue"];
  _ParamDirection.setAll(directions, directions);

  var cmdArgs = dwscripts.getCommandArguments();

  if (cmdArgs && (cmdArgs.length > 6))
  {
    var databaseType = cmdArgs[6];
    var types = SBDatabaseCallASPNET.getParamTypeList(databaseType);

    _ParamType.setAll(types, types);

    _ParamName.value = cmdArgs[0];
    _ParamType.pickValue(cmdArgs[1]);
    _ParamSize.value = cmdArgs[2];
    _ParamDirection.pickValue(cmdArgs[3]);
    _ParamTestValue.value = cmdArgs[4];
    _ParamValue.value = cmdArgs[5];
  }
  else
  {
    _ParamName.value = "";
    _ParamType.setIndex(0);
    _ParamSize.value = "";
    _ParamDirection.setIndex(0);
    _ParamTestValue.value = "";
    _ParamValue.value = "";
  }

  onParamDirectionChanged();

  _ParamName.focus();
}

function onBuildValueClicked()
{
  var cmdArgs = new Array();
  
  cmdArgs.push(_ParamName.value);
  cmdArgs.push(_ParamTestValue.value);

  cmdArgs = dwscripts.callCommand("AddASPNETParamRuntime", cmdArgs);

  if (cmdArgs)
  {
    _ParamValue.value = cmdArgs;
  }
}

function onParamDirectionChanged()
{
  var direction = _ParamDirection.getValue();

  if (direction.toUpperCase().indexOf("INPUT") != (-1))
  {
    _ParamTestValue.removeAttribute("disabled");
    _ParamValue.removeAttribute("disabled");
    _BuildButton.removeAttribute("disabled");   
  }
  else
  {
    _ParamTestValue.value = "";
    _ParamValue.value = "";

    _ParamTestValue.setAttribute("disabled", "disabled");
    _ParamValue.setAttribute("disabled", "disabled");
    _BuildButton.setAttribute("disabled", "disabled");   
  }
}
