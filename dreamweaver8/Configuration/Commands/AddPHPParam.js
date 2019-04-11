// Copyright 002 Macromedia, Inc. All rights reserved.

var helpDoc = MM.HELP_cmdPHPAddParam;

var _ParamName = null ;
var _DefaultValue = null ;
var _RuntimeValue = null ;

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
    var defaultValue = _DefaultValue.value;

	if (defaultValue != "")
	{
      var retVal = new Array();

      retVal.push(_ParamName.value);
      // retVal.push(_ParamType.getValue());
      retVal.push(_DefaultValue.value );
	  retVal.push(_RuntimeValue.value ) ;

      dwscripts.setCommandReturnValue(retVal);
      window.close();
    }
	else
	{
	  alert(MM.MSG_NeedParamValue);
	  _DefaultValue.focus();
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
 
  _ParamName = dwscripts.findDOMObject("ParamName"); 
  _DefaultValue = dwscripts.findDOMObject("DefaultValue");
  _RuntimeValue = dwscripts.findDOMObject("RuntimeValue");
 
  var cmdArgs = dwscripts.getCommandArguments();
 
  if (cmdArgs && (cmdArgs.length > 2))
  {
    _ParamName.value = cmdArgs[0];
	_DefaultValue.value = cmdArgs[1] ;
	_RuntimeValue.value = cmdArgs[2] ;
		
  }
  else
  {
    _ParamName.value = "";
	_DefaultValue.value = "" ;
	_RuntimeValue.value = "" ;
	
  }
  
  _ParamName.focus();
  
}



