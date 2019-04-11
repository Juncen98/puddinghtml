// Copyright 2005 Macromedia, Inc. All rights reserved.

var CFParamNameList = null;
var _CFParamValue = new TextField('', 'CFParamValue');
var _CFParamDefValue = new TextField('', 'CFParamDefValue');
var _CFParamName = new TextField('', 'CFParamName');

var _CFParamType = new ParamTypesList('CFParamType');


// *************** GLOBALS VARS *****************

var HELP_DOC = MM.HELP_editParam_cmd; 


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
  
  _CFParamType.initializeUI();
  _CFParamName.initializeUI();
  _CFParamValue.initializeUI();
  _CFParamDefValue.initializeUI();
  
  if (theArgumentObj && theArgumentObj.length) 
  {
    isEdit = (theArgumentObj[0]) ? theArgumentObj[0] : false;
    selectName = (theArgumentObj[1]) ? theArgumentObj[1] : "";
    selectValue = (theArgumentObj[2]) ? theArgumentObj[2] : "";
    selectDefault = (theArgumentObj[3]) ? theArgumentObj[3] : ""; 
  }

	var ret = dwscripts.getParameterTypeFromCode(selectValue);

	_CFParamName.setValue(selectName);
	_CFParamName.setDisabled(true);
	_CFParamType.pickValue(ret.paramType);
	_CFParamValue.setValue(ret.paramName);
	if(_CFParamType.getValue() == 'Entered Value') {
		_CFParamDefValue.setDisabled(true);
	} else {
		_CFParamDefValue.setValue(selectDefault);
	}


/*  
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
*/
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
	var paramValue = getParameterCode(_CFParamType.getValue(), _CFParamValue.getValue());
	var paramDefault = null;
	if(!_CFParamDefValue.textControl.getAttribute("disabled")) {
		paramDefault= _CFParamDefValue.getValue();
	}

	if (!paramValue || !dwscripts.trim(paramValue))
	{
	    alert(MM.MSG_MissingParameterName); 
	}
	else
	{
	    var retArray = new Array(paramValue, paramDefault); 
	    dwscripts.setCommandReturnValue(retArray);
	    window.close();
	} 
}

function getParameterCode(type, val) {
	var ret = dwscripts.getParameterCodeFromType(type, val);
	if(ret) {
		return ret.nameVal;
	} else {
		// Entered Value
		return val;
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
  if (control == "CFParamType")
  {
    var value = _CFParamType.getValue();
    if(value == 'Entered Value') {
    	_CFParamDefValue.setDisabled(true);
    } else {
    	_CFParamDefValue.setDisabled(false);    
    }
  }
}


