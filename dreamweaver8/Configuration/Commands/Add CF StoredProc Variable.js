// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

var VAR_TYPE_LIST = null; 
var CF_SQL_TYPE_LIST = null;
var VAR_VALUE_FIELD = null;
var VAR_TEST_VALUE_FIELD = null;
var DB_VAR_NAME_FIELD = null;
var CF_VAR_NAME_FIELD = null;
var STORED_PROC_OBJ = null;

// *************** GLOBALS VARS *****************

var HELP_DOC = MM.cmdCFAddStoredProcVar; 


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
  var dbVarName = DB_VAR_NAME_FIELD.value;
  var varType = VAR_TYPE_LIST.get();
  var cfSQLType = CF_SQL_TYPE_LIST.get();
  // If varValue field is disabled, return empty value for it.
  var varValue = (!VAR_VALUE_FIELD.getAttribute("disabled")) ? VAR_VALUE_FIELD.value : "";
  // If varTestValue field is disabled, return empty value for it.
  var varTestValue = (!VAR_TEST_VALUE_FIELD.getAttribute("disabled")) ? VAR_TEST_VALUE_FIELD.value : "";
  // If cfVarName field is disabled, return empty value for it.
  var cfVarName = (!CF_VAR_NAME_FIELD.getAttribute("disabled")) ? CF_VAR_NAME_FIELD.value : "";
  var retArray = new Array(dbVarName, varType, cfSQLType, varValue, cfVarName, varTestValue); 
  dwscripts.setCommandReturnValue(retArray);
  window.close();
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
//   Displays the built-in Dreamweaver help.
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
  if (control == "VarType")
  {
    var varType = VAR_TYPE_LIST.get();
    switch (varType.toUpperCase())
    {
      case "IN":
        CF_VAR_NAME_FIELD.setAttribute("disabled", "disabled");
        VAR_VALUE_FIELD.removeAttribute("disabled");
        VAR_TEST_VALUE_FIELD.removeAttribute("disabled");
        break;
      case "OUT":
        CF_VAR_NAME_FIELD.removeAttribute("disabled");
        VAR_VALUE_FIELD.setAttribute("disabled", "disabled");
        VAR_TEST_VALUE_FIELD.setAttribute("disabled", "disabled");
        break;
      case "INOUT":
        CF_VAR_NAME_FIELD.removeAttribute("disabled");
        VAR_VALUE_FIELD.removeAttribute("disabled");
        VAR_TEST_VALUE_FIELD.removeAttribute("disabled");
        break;
    } 
    
    if (   !CF_VAR_NAME_FIELD.getAttribute("disabled") && !CF_VAR_NAME_FIELD.value
        && STORED_PROC_OBJ
       )
    {
      CF_VAR_NAME_FIELD.value = STORED_PROC_OBJ.getUniqueVariableName("out_"
                              + dwscripts.stripChars(DB_VAR_NAME_FIELD.value, "@"));
    }
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
  // Initialize UI elements.
  VAR_TYPE_LIST = new ListControl("VarType"); 
  CF_SQL_TYPE_LIST = new ListControl("CFSQLType");
  VAR_VALUE_FIELD = dwscripts.findDOMObject("Value"); 
  VAR_TEST_VALUE_FIELD = dwscripts.findDOMObject("TestValue"); 
  DB_VAR_NAME_FIELD = dwscripts.findDOMObject("DBVarName"); 
  CF_VAR_NAME_FIELD = dwscripts.findDOMObject("CFVarName"); 

  // Grab the command arguments.
  var theArgumentObj = dwscripts.getCommandArguments(); 

  var isEdit = false;
  var dbVarName = "";
  var varType = "";
  var varValue = "";
  var varTestValue = "";
  var cfVarName = "";
  var cfSQLType = ""; 
  STORED_PROC_OBJ = null;
  
  if (theArgumentObj && theArgumentObj.length) 
  {
    isEdit = (theArgumentObj[0]) ? theArgumentObj[0] : false;
    dbVarName = (theArgumentObj[1]) ? theArgumentObj[1] : "";
    varType = (theArgumentObj[2]) ? theArgumentObj[2] : "";
    varValue = (theArgumentObj[3]) ? theArgumentObj[3] : "";
    cfVarName = (theArgumentObj[4]) ? theArgumentObj[4] : ""; 
    cfSQLType = (theArgumentObj[5]) ? theArgumentObj[5] : ""; 
    varTestValue = (theArgumentObj[6]) ? theArgumentObj[6] : ""; 
    STORED_PROC_OBJ = (theArgumentObj[7]) ? theArgumentObj[7] : null;
  }

  DB_VAR_NAME_FIELD.value = dbVarName;
  if (isEdit)
  {
    DB_VAR_NAME_FIELD.setAttribute("disabled", "disabled");
  }
  else
  {
    DB_VAR_NAME_FIELD.removeAttribute("disabled");
  }

  CF_VAR_NAME_FIELD.value = cfVarName; 
  VAR_VALUE_FIELD.value = varValue;
  VAR_TEST_VALUE_FIELD.value = varTestValue;
  
  var varTypes = ["IN", "OUT", "INOUT"];
  VAR_TYPE_LIST.setAll(varTypes, varTypes);
  VAR_TYPE_LIST.pickValue(varType.toUpperCase()); 
  
  var sqlTypes = STORED_PROC_OBJ.getCFSQLTypeList();
  CF_SQL_TYPE_LIST.setAll(sqlTypes, sqlTypes);
  CF_SQL_TYPE_LIST.pickValue(cfSQLType.toUpperCase());

  updateUI("VarType", "onChange");
}