// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


// *************** GLOBALS VARS *****************
var helpDoc = MM.HELP_ssCFStoredProc; 

// Handle to the original sbObj from inspectServerBehavior.
var ORIG_SB_OBJ = null;

var CONNECTION_NAME_FIELD = new CFDataSourceMenu("CFStoredProc.htm", "ConnectionName");
var STOREDPROC_NAME_FIELD = new ConnectionStoredProcMenu("CFStoredProc.htm", "Procedure"); 

var USERNAME_FIELD = new TextField("CFStoredProc.htm", "UserName");
var PASSWORD_FIELD = new TextField("CFStoredProc.htm", "Password");
var RECORDSET_NAME_FIELD = new TextField("CFStoredProc.htm", "RecordsetName");
var RETURNS_RS_CHECK = null; 
var STATUS_CODE_VARNAME_FIELD = new TextField("CFStoredProc.htm", "StatusCodeVarName");
var RETURNS_STATUS_CHECK = null;
var TEST_BTN = null; 

// UI elements for the SP variables.
var VARIABLE_EDIT_BTN = null; 
var VARIABLE_LIST = null;
// Map to store properties associated with variables in VARIABLE_LIST UI element.
//   There are a number of additional properties to store with the UI element, but
//   select lists only provide us with room for storing one property - in the 'value'
//   attribute of each option. Store the extra props here.
var MAP_VARNAME_TO_PROPS = null;

// Span UI elements used to display variable properties.
var DBVARNAME_SPAN = null; 
var VARTYPE_SPAN = null; 
var CFSQLTYPE_SPAN = null;
var VARVALUE_SPAN = null;
var VARTESTVALUE_SPAN = null;
var CFVARNAME_SPAN = null;

// UI elements for the cf parameters.
var PARAM_NAME_SPAN = null; 
var PARAM_DEFAULT_SPAN = null; 
var PARAM_EDIT_BTN = null; 
var PARAM_LIST = null;

var VARPROP_WIDTH_PX = 190;

// ***************** LOCAL FUNCTIONS ******************

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
  dwscripts.displayDWHelp(helpDoc);
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
  // Get the UI elements
  RETURNS_RS_CHECK = dwscripts.findDOMObject("ReturnsRecordset"); 
  RETURNS_STATUS_CHECK = dwscripts.findDOMObject("ReturnsStatusCode"); 
  TEST_BTN = dwscripts.findDOMObject("TestButton"); 
  DBVARNAME_SPAN = dwscripts.findDOMObject("DBVarName"); 
  VARTYPE_SPAN = dwscripts.findDOMObject("VarType"); 
  CFSQLTYPE_SPAN = dwscripts.findDOMObject("CFSQLType");
  VARVALUE_SPAN = dwscripts.findDOMObject("VarValue");
  VARTESTVALUE_SPAN = dwscripts.findDOMObject("VarTestValue");
  CFVARNAME_SPAN = dwscripts.findDOMObject("CFVarName");
  VARIABLE_EDIT_BTN = dwscripts.findDOMObject("EditVariable"); 
  VARIABLE_LIST = new ListControl("VariableList");
  PARAM_NAME_SPAN = dwscripts.findDOMObject("ParamName"); 
  PARAM_DEFAULT_SPAN = dwscripts.findDOMObject("ParamDefault"); 
  PARAM_EDIT_BTN = dwscripts.findDOMObject("EditParam"); 
  PARAM_LIST = new ListControl("ParamList");
  CONNECTION_NAME_FIELD.initializeUI();
  STOREDPROC_NAME_FIELD.initializeUI(CONNECTION_NAME_FIELD);
  USERNAME_FIELD.initializeUI(); 
  PASSWORD_FIELD.initializeUI(); 
  RECORDSET_NAME_FIELD.initializeUI(); 
  STATUS_CODE_VARNAME_FIELD.initializeUI();

  // set the readonly param properties
  PARAM_NAME_SPAN.innerHTML = dwscripts.entityNameEncode(MM.LABEL_ParamAttributesName);
  PARAM_DEFAULT_SPAN.innerHTML = dwscripts.entityNameEncode(MM.LABEL_ParamAttributesDefault);

  // set the readonly variable properties
  DBVARNAME_SPAN.innerHTML = dwscripts.entityNameEncode(MM.LABEL_DBVarName);
  VARTYPE_SPAN.innerHTML = dwscripts.entityNameEncode(MM.LABEL_VarType);
  CFSQLTYPE_SPAN.innerHTML = dwscripts.entityNameEncode(MM.LABEL_CFSQLType);
  VARVALUE_SPAN.innerHTML = dwscripts.entityNameEncode(MM.LABEL_VarValue);
  VARTESTVALUE_SPAN.innerHTML = dwscripts.entityNameEncode(MM.LABEL_VarTestValue);
  CFVARNAME_SPAN.innerHTML = dwscripts.entityNameEncode(MM.LABEL_CFVarName);

  MAP_VARNAME_TO_PROPS = new Object();
}

//--------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//   This function is called by the UI controls to handle UI updates.
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
  if (control == "ConnectionName")
  { 
    // check the connection, and get a username and password if needed
    CONNECTION_NAME_FIELD.ensureLogin((ORIG_SB_OBJ) ? ORIG_SB_OBJ.getUserName() : "",
                                      (ORIG_SB_OBJ) ? ORIG_SB_OBJ.getPassword() : "");

    if (event == "onChange")
    {
      // set the username and password for this data source
      USERNAME_FIELD.setValue(CONNECTION_NAME_FIELD.getUsername());
      PASSWORD_FIELD.setValue(CONNECTION_NAME_FIELD.getPassword());
    }
    
    STOREDPROC_NAME_FIELD.updateUI(CONNECTION_NAME_FIELD, event);

    MAP_VARNAME_TO_PROPS = new Object();
    updateUI("Procedure", "onChange");
  }
  else if (control == "TestButton")
  {
    PopUpTestDialog();
  }
  else if (control == "ReturnsRecordset")
  {
    updateRSNameAndTest();
  }
  else if (control == "ReturnsStatusCode")
  {
    updateStatusCodeName();
  }
  else if (control == "EditVariable")
  {
    onEditVariable();
  }
  else if (control == "VariableList")
  {
    updateVariableEditButtonState(); 
    updateVariableProperties();
  }
  else if (control == "MinusButtonParams")
  {
    PARAM_LIST.del();
    updateParamProperties(); 
    updateParamEditButtonState(); 
  }
  else if (control == "PlusButtonParams")
  {
    onAddParameter();
  }
  else if (control == "EditParam")
  {
    var cmdArgs = new Array();
    cmdArgs[0] = true;
    cmdArgs[1] = null;
    cmdArgs[2] = PARAM_LIST.get();
    cmdArgs[3] = PARAM_LIST.getValue();
    var editParamResult = dwscripts.callCommand("Edit CF Parameter", cmdArgs);            
    if (editParamResult && editParamResult.length)
    {
      PARAM_LIST.setValue(editParamResult[1]);
      updateParamProperties(); 
      updateParamEditButtonState(); 
    }
  }
  else if (control == "ParamList")
  {
    updateParamEditButtonState(); 
    updateParamProperties();
  }
  else if (control == "Procedure")
  {
    onStoredProcNameChange();
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   onAddParameter
//
// DESCRIPTION:
//   Update the UI in response to an 'add parameter' event. Bring up the Add Parameter 
//   dialog and update the UI on successful add. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function onAddParameter()
{
  // Create the list of available cfparam names from the 'runtime value' property
  //   of the stored proc variables. Make sure not to use runtime values that
  //   are literals (i.e. the reference is not surrounded by #'s).
  var variableRefs = new Array();    
  for (var i in MAP_VARNAME_TO_PROPS)
  {
    var varValue = MAP_VARNAME_TO_PROPS[i].varValue;

    if (   varValue 
        && varValue.charAt(0) == "#" && varValue.charAt(varValue.length - 1) == "#"
       )
    {
      var varValueSansHash = dwscripts.stripChars(varValue, "#");
      if (dwscripts.findInArray(variableRefs, varValueSansHash, caseInsensitiveCompare) == -1)
      {
        variableRefs.push(varValueSansHash);
      }
    }
  }

  var cmdArgs = new Array();
  cmdArgs[0] = false;
  cmdArgs[1] = variableRefs;
  cmdArgs[2] = "";
  cmdArgs[3] = "";
  var addParamResult = dwscripts.callCommand("Add CF Parameter", cmdArgs);    
  if (addParamResult && addParamResult.length && addParamResult[0])
  {
    var existingParams = PARAM_LIST.get('all');

    var indexOfParam = dwscripts.findInArray(existingParams, addParamResult[0]);
    if (indexOfParam != -1)
    {
      if (confirm(dwscripts.sprintf(MM.MSG_ParameterAlreadyDefined, addParamResult[0])))
      {
        PARAM_LIST.setValue(addParamResult[1], indexOfParam);
      }
    }
    else
    {
      PARAM_LIST.append(addParamResult[0],addParamResult[1]);
    }
    updateParamProperties(); 
    updateParamEditButtonState(); 
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   onEditVariable
//
// DESCRIPTION:
//   Update UI in response to an edit variable event.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function onEditVariable()
{
  var cmdArgs = new Array();
  var dbVarName = VARIABLE_LIST.get();
  var varProps = MAP_VARNAME_TO_PROPS[dbVarName];
  cmdArgs[0] = true;
  cmdArgs[1] = dbVarName;
  cmdArgs[2] = (varProps.varType) ? varProps.varType : "";
  cmdArgs[3] = (varProps.varValue) ? varProps.varValue : "";
  cmdArgs[4] = (varProps.cfVarName) ? varProps.cfVarName : "";
  cmdArgs[5] = (varProps.cfSQLType) ? varProps.cfSQLType : "";
  cmdArgs[6] = (varProps.varTestValue) ? varProps.varTestValue : "";

  // If the user converts the variable to an OUT or INOUT type in the Edit Variable
  //   dialog, we'd like to be able to provide a unique variable name as a default.
  //   To get that functionality, we must pass the updated stored proc sbObj to
  //   the command.
  var newStoredProc = (ORIG_SB_OBJ) ? ORIG_SB_OBJ.makeEditableCopy() 
                                    : new SBStoredProcCF();
  updateSBObjFromUI(newStoredProc);
  cmdArgs[7] = newStoredProc;
  
  var editVariableResult = dwscripts.callCommand("Add CF StoredProc Variable", cmdArgs);

  // If variable properties were edited, update the property map and control. 
  if (editVariableResult && editVariableResult.length)
  {
    varProps = new Object();
    varProps.dbVarName = editVariableResult[0];
    varProps.varType = editVariableResult[1];
    varProps.cfSQLType = editVariableResult[2];
    varProps.varValue = editVariableResult[3];
    varProps.cfVarName = editVariableResult[4];
    varProps.varTestValue = editVariableResult[5];
    MAP_VARNAME_TO_PROPS[dbVarName] = varProps;
    
    updateVariableProperties(); 
    updateVariableEditButtonState(); 
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   onStoredProcNameChange
//
// DESCRIPTION:
//   Update the UI in response to a stored procedure name change.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function onStoredProcNameChange()
{
  var conName = CONNECTION_NAME_FIELD.getValue(); 
  var spName = STOREDPROC_NAME_FIELD.getValue(); 
  var encodedSPParamsString = ""; 
  
  // Clear out the old stored proc variables.
  MAP_VARNAME_TO_PROPS = new Object();
  
  var dbVarNames = new Array();
  if (conName && spName) 
  {
    // Retrieve stored procedure's parameters and update the variable list.
    encodedSPParamsString = MMDB.getSPParamsAsString(conName,spName); 
    var paramRegExp = /name:([^;]+);direction:([^;]+);datatype:([^;]+);/ig;
    while (paramRegExp.exec(encodedSPParamsString))
    {
      var param = new Object();
      dbVarNames.push(RegExp.$1);
      param.dbVarName = RegExp.$1;
      param.varType = SBStoredProcCF.getTypeStringFromDirEnum(Number(RegExp.$2));
      param.cfSQLType = dwscripts.getDBColumnTypeAsString(RegExp.$3); 
      
      // Provide default cfvarName value if type is OUT or INOUT.
      if (param.varType.toUpperCase() == "IN")
      {
        param.cfVarName = "";
      }
      else
      {
        var newStoredProc = (ORIG_SB_OBJ) ? ORIG_SB_OBJ.makeEditableCopy() 
                                          : new SBStoredProcCF();
        updateSBObjFromUI(newStoredProc);
        param.cfVarName = newStoredProc.getUniqueVariableName("out_" + 
                          dwscripts.stripChars(param.dbVarName, "@"));
      }

      // Provide default varvalue and varTestValue if type is IN or INOUT.
      if (param.varType.toUpperCase() == "OUT")
      {
        param.varValue = "";
        param.varTestValue = "";
      }
      else
      {
        param.varValue = "#" + dwscripts.stripChars(param.dbVarName, "@") + "#";
        param.varTestValue = "";
      }

      param.varDefault = null;
      MAP_VARNAME_TO_PROPS[param.dbVarName] = param;
    }    
    paramRegExp.lastIndex = 0;
  }

  VARIABLE_LIST.setAll(dbVarNames, dbVarNames);
  updateUI("VariableList", "onChange");
  PARAM_LIST.setAll([], []);
  updateUI("ParamList", "onChange");
  
  // Reset the return recordset and return status code to false.
  RETURNS_STATUS_CHECK.checked = false;
  updateStatusCodeName();
  RETURNS_RS_CHECK.checked = false;
  updateRSNameAndTest();
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateParamProperties
//
// DESCRIPTION:
//   Updates the name and default read only display values if there 
//   is a parameter selected in the list control 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function updateParamProperties()
{
  var retVal = false; 
  
  var selParamName = (PARAM_LIST.get()) ? PARAM_LIST.get() : ""; 
  var selParamDefault = (PARAM_LIST.getValue()) ? PARAM_LIST.getValue() : "";

  var shortParamName = dw.shortenString(MM.LABEL_ParamAttributesName + selParamName, VARPROP_WIDTH_PX, false);
  PARAM_NAME_SPAN.innerHTML = dwscripts.entityNameEncode(shortParamName);
  var shortParamDefault = dw.shortenString(MM.LABEL_ParamAttributesDefault + selParamDefault, VARPROP_WIDTH_PX, false);
  PARAM_DEFAULT_SPAN.innerHTML = dwscripts.entityNameEncode(shortParamDefault);
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateParamEditButtonState
//
// DESCRIPTION:
//   Sets the param edit button to be enabled or disabled depending
//   on whether there is a selected parameter
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function updateParamEditButtonState()
{
  if (PARAM_LIST.get())
  {
    PARAM_EDIT_BTN.removeAttribute("disabled");   
  }
  else 
  {
    PARAM_EDIT_BTN.setAttribute("disabled","disabled"); 
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateVariableProperties
//
// DESCRIPTION:
//   Updates the variable properties in the read only display, if there 
//   is a parameter selected in the list control 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function updateVariableProperties()
{
  var retVal = false; 
  
  var selDBVarName = (VARIABLE_LIST.get()) ? VARIABLE_LIST.get() : ""; 
  var selVarProps = MAP_VARNAME_TO_PROPS[selDBVarName];

  var varType = "";
  var varValue = "";
  var varTestValue = "";
  var cfVarName = "";
  var cfSQLType = "";
  if (selVarProps)
  {
    varType = selVarProps.varType;
    varValue = selVarProps.varValue;
    varTestValue = selVarProps.varTestValue;
    cfVarName = selVarProps.cfVarName;
    cfSQLType = selVarProps.cfSQLType;
  }

  var shortDBVarName = dw.shortenString(MM.LABEL_DBVarName + selDBVarName, VARPROP_WIDTH_PX, false); 
  DBVARNAME_SPAN.innerHTML = dwscripts.entityNameEncode(shortDBVarName); 
  var shortVarType = dw.shortenString(MM.LABEL_VarType + varType, VARPROP_WIDTH_PX, false);
  VARTYPE_SPAN.innerHTML = dwscripts.entityNameEncode(shortVarType);
  var shortCFSQLType = dw.shortenString(MM.LABEL_CFSQLType + cfSQLType, VARPROP_WIDTH_PX, false);
  CFSQLTYPE_SPAN.innerHTML = dwscripts.entityNameEncode(shortCFSQLType);
  var shortVarValue = dw.shortenString(MM.LABEL_VarValue + varValue, VARPROP_WIDTH_PX, false);
  VARVALUE_SPAN.innerHTML = dwscripts.entityNameEncode(shortVarValue);
  var shortVarTestValue = dw.shortenString(MM.LABEL_VarTestValue + varTestValue, VARPROP_WIDTH_PX, false);
  VARTESTVALUE_SPAN.innerHTML = dwscripts.entityNameEncode(shortVarTestValue);
  var shortCFVarName = dw.shortenString(MM.LABEL_CFVarName + cfVarName, VARPROP_WIDTH_PX, false);
  CFVARNAME_SPAN.innerHTML = dwscripts.entityNameEncode(shortCFVarName);
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateVariableEditButtonState
//
// DESCRIPTION:
//   Sets the variable edit button to be enabled or disabled depending
//   on whether there is a selected variable.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function updateVariableEditButtonState()
{
  if (VARIABLE_LIST.get())
  {
    VARIABLE_EDIT_BTN.removeAttribute("disabled");   
  }
  else 
  {
    VARIABLE_EDIT_BTN.setAttribute("disabled","disabled"); 
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateRSNameAndTest
//
// DESCRIPTION:
//   Update the Recordset name field and the Test button
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function updateRSNameAndTest()
{
  // if the ReturnsRecordset is set to false, disable recordset name control - otherwise enable it
  if (RETURNS_RS_CHECK.checked)
  {
    RECORDSET_NAME_FIELD.setDisabled(false); 
    if (!RECORDSET_NAME_FIELD.getValue())
    {
      var tempCFStoredProc = new SBStoredProcCF();
      RECORDSET_NAME_FIELD.setValue(tempCFStoredProc.getUniqueRecordsetName());
    }
    TEST_BTN.removeAttribute("disabled"); 
  }
  else 
  {
    RECORDSET_NAME_FIELD.setDisabled(true); 
    TEST_BTN.setAttribute("disabled", "disabled"); 
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateStatusCodeName
//
// DESCRIPTION:
//   Update the Status Code variable name field.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function updateStatusCodeName()
{
  // if the ReturnsStatusCode is set to false, disable status code name control, 
  //   otherwise enable it
  if (RETURNS_STATUS_CHECK.checked)
  {
    STATUS_CODE_VARNAME_FIELD.setDisabled(false); 
    if (!STATUS_CODE_VARNAME_FIELD.getValue())
    {
      // To get a unique variable name, we must get the updated stored proc
      //   sbObj and use its getUniqueVariableName function. 
      var newStoredProc = (ORIG_SB_OBJ) ? ORIG_SB_OBJ.makeEditableCopy() 
                                        : new SBStoredProcCF();
      updateSBObjFromUI(newStoredProc);
      var statusCodeVarName = newStoredProc.getUniqueVariableName("statusCode");
      STATUS_CODE_VARNAME_FIELD.setValue(statusCodeVarName);
    }
  }
  else 
  {
    STATUS_CODE_VARNAME_FIELD.setDisabled(true); 
  }
}


function caseInsensitiveCompare(object, searchValue)
{
  return (String(object).toUpperCase() == String(searchValue).toUpperCase());
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateSBObjFromUI
//
// DESCRIPTION:
//   Update the server behavior object from the UI.
//
// ARGUMENTS:
//   newSBStoredProc - SBStoredProcCF. The server behavior object to update.
//
// RETURNS:
//   newSBStoredProc - returned as an output parameter.
//--------------------------------------------------------------------

function updateSBObjFromUI(newSBStoredProc)
{
  newSBStoredProc.setConnectionName(CONNECTION_NAME_FIELD.getName());
  newSBStoredProc.setUserName(USERNAME_FIELD.getValue());
  newSBStoredProc.setPassword(PASSWORD_FIELD.getValue());

  if (RETURNS_RS_CHECK.checked)
  {
    newSBStoredProc.setRecordsetName(RECORDSET_NAME_FIELD.getValue());
  }
  else
  {
    newSBStoredProc.setRecordsetName(null);
  }

  if (RETURNS_STATUS_CHECK.checked)
  {
    newSBStoredProc.setStatusCodeVarName(STATUS_CODE_VARNAME_FIELD.getValue());
  }
  else
  {
    newSBStoredProc.setStatusCodeVarName(null);
  }

  // Update stored procedure name and variables.
  var storedProcParams = new Array();
  // Collect default values associated with each variable from param list.
  var paramNames = PARAM_LIST.get('all');
  var paramDefaults = PARAM_LIST.getValue('all');
  var paramNameToDefaultLeftovers = new Object();
  for (var i = 0; i < paramNames.length; ++i)
  {
    // Just store the default value with the associated variable in the variable 
    //   map.
    var bFoundValue = false;
    for (var j in MAP_VARNAME_TO_PROPS)
    {
      var valueSansHash = dwscripts.stripChars(MAP_VARNAME_TO_PROPS[j].varValue, "#");
      if (valueSansHash.toUpperCase() == paramNames[i].toUpperCase())
      {
        bFoundValue = true;
        MAP_VARNAME_TO_PROPS[j].varDefault = paramDefaults[i];
      }
    }

    // If there was no associated entry in the variable map, save the param
    //   entry for later.
    if (!bFoundValue)
    {
      paramNameToDefaultLeftovers[paramNames[i]] = paramDefaults[i];
    }
  }

  // Add stored proc variables to the list of variables to update in the SB.
  for (var i in MAP_VARNAME_TO_PROPS)
  {
    storedProcParams.push(MAP_VARNAME_TO_PROPS[i]);
  }

  // Add leftover default values to the list of variables to update in the SB. 
  for (var i in paramNameToDefaultLeftovers)
  {
    var param = new Object();
    param.varValue = i;
    param.varDefault = paramNameToDefaultLeftovers[i];
    storedProcParams.push(param);    
  }
  
  var procName = STOREDPROC_NAME_FIELD.getValue();
  newSBStoredProc.setDatabaseCall((procName) ? procName : "", storedProcParams);
}


//--------------------------------------------------------------------
// FUNCTION:
//   PopUpTestDialog
//
// DESCRIPTION:
//   Displays a dialog box with the results of executing the current stored
//   procedure. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function PopUpTestDialog()
{
  var newSBStoredProc = (ORIG_SB_OBJ) ? ORIG_SB_OBJ.makeEditableCopy() 
                                      : new SBStoredProcCF();
  updateSBObjFromUI(newSBStoredProc);

  // If the storedproc checks out, try to test it.
  if (!newSBStoredProc.checkData(true))
  {
    alert(newSBStoredProc.getErrorMessage());
  }
  else
  {
    // Must get test/default values for parameters to test.
    var callParams = new Array();    
    var paramNames = new Array();
    var paramValues = new Array();
    var connName = dwscripts.getCFDataSourceName(newSBStoredProc.getConnectionName());
    var procedureName = newSBStoredProc.getDatabaseCall(callParams);    
    newSBStoredProc.getSPParamsAndTestVals(paramNames, paramValues, true);
    MMDB.showSPResultsetNamedParams(connName, procedureName, paramNames, paramValues);
  }
}


// ******************* Server Behavior API ***************************

//--------------------------------------------------------------------
// FUNCTION:
//   findServerBehaviors
//
// DESCRIPTION:
//   Returns an array of ServerBehavior objects, each one representing
//   an instance of this Server Behavior on the page
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   JavaScript Array of ServerBehavior objects
//--------------------------------------------------------------------

function findServerBehaviors()
{
  var sbList = dwscripts.findSBs(MM.LABEL_TitleStoredProc + " (@@Procedure@@)", SBStoredProcCF);
  return sbList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   canApplyServerBehavior
//
// DESCRIPTION:
//   Returns true if a Server Behavior can be applied to the current
//   document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   boolean - true if the behavior can be applied, false otherwise
//--------------------------------------------------------------------
function canApplyServerBehavior(sbObj)
{
  var success = true;
  
  if (success)
  {
    success = dwscripts.canApplySB(sbObj, false); // preventNesting is false
  }

  if (success)
  {
    // If we can't retrieve any CF data sources, ask user to create one before
    //   using this behavior.
    var cfDSNList = MMDB.getColdFusionDsnList();
    if (cfDSNList == null || cfDSNList.length == 0)
    {
      alert(MM.MSG_SBCreateCFDataSource);
      success = false;
    }
  }
  
  return success;
}


//--------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//   Collects values from the form elements in the dialog box and
//   adds the Server Behavior to the user's document
//
// ARGUMENTS:
//   priorSBStoredProc - SBRecordset object - one of the objects returned
//     from findServerBehaviors
//
// RETURNS:
//   string - empty upon success, or an error message
//--------------------------------------------------------------------

function applyServerBehavior(priorSBStoredProc)
{
  var updateText = "";
  var tagEdit = null;
  var newSBStoredProc = null; 
  if (priorSBStoredProc)
  {
    newSBStoredProc = priorSBStoredProc.makeEditableCopy();
  }
  else
  {
    newSBStoredProc = new SBStoredProcCF();
  }
  
  updateSBObjFromUI(newSBStoredProc);

  if (!newSBStoredProc.checkData())
  {
    return newSBStoredProc.getErrorMessage();
  }

  try
  {
    if (newSBStoredProc)
    {
      newSBStoredProc.queueDocEdits();  
      dwscripts.applyDocEdits();
      
      // Mark the cache as dirty.
      MMDB.refreshCache(true);
    }
  }
  finally
  {
    // We are building up individual doc edits to apply to the document. If some
    //   JavaScript error occurs, we need to clear leftover edits that didn't
    //   get applied. Otherwise, they'll get added on the next apply.
    dwscripts.clearDocEdits();
  }
      
  return "";
}


//--------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//   Sets the values of the form elements in the dialog box based
//   on the given ServerBehavior object
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function inspectServerBehavior(sbObj)
{
  ORIG_SB_OBJ = sbObj;
  var storedProcParams = new Array();
  var storedProcName = sbObj.getDatabaseCall(storedProcParams);

  CONNECTION_NAME_FIELD.pickName(sbObj.getConnectionName());
  var username = sbObj.getUserName();
  USERNAME_FIELD.setValue((username) ? username : "");
  var password = sbObj.getPassword();
  PASSWORD_FIELD.setValue((password) ? password : "");
  STOREDPROC_NAME_FIELD.pickValue(storedProcName);
  
  // Update the stored procedure variable list and the parameter list.
  MAP_VARNAME_TO_PROPS = new Object();
  var dbVarNames = new Array();
  var cfParamNames = new Array();
  var cfParamDefaults = new Array();
  for (var i = 0; i < storedProcParams.length; ++i)
  {
    // Track variable names to put in variable list.
    dbVarNames.push(storedProcParams[i].dbVarName);
    // Store extra variable properties in map.
    MAP_VARNAME_TO_PROPS[storedProcParams[i].dbVarName] = storedProcParams[i];
    
    // If there is a default value associated with this variable, track it for
    //   the parameter list.
    if (storedProcParams[i].varDefault != null && storedProcParams[i].varValue)
    {
      var valSansHash = dwscripts.stripChars(storedProcParams[i].varValue, "#");
      
      // Only add this default value if it hasn't already been added. Stored Proc
      //   parameters could have the same value and, thus, share the same cfparam.
      //   So, we must protect against adding duplicate entries in the default values
      //   list.
      if (dwscripts.findInArray(cfParamNames, valSansHash, caseInsensitiveCompare) == -1)
      {
        cfParamNames.push(valSansHash);
        cfParamDefaults.push(storedProcParams[i].varDefault);
      }
    }
  }

  VARIABLE_LIST.setAll(dbVarNames, dbVarNames);
  updateUI("VariableList", "onChange");
  PARAM_LIST.setAll(cfParamNames, cfParamDefaults);
  updateUI("ParamList", "onChange");

  var rsName = sbObj.getRecordsetName();
  if (rsName)
  {
    RETURNS_RS_CHECK.checked = true;
    RECORDSET_NAME_FIELD.setValue(rsName);
  }
  else
  {
    RETURNS_RS_CHECK.checked = false;
    RECORDSET_NAME_FIELD.setValue("");
  }
  updateRSNameAndTest();
  
  var statusCodeVarName = sbObj.getStatusCodeVarName();
  if (statusCodeVarName)
  {
    RETURNS_STATUS_CHECK.checked = true;
    STATUS_CODE_VARNAME_FIELD.setValue(statusCodeVarName);
  }
  else
  {
    RETURNS_STATUS_CHECK.checked = false;
    STATUS_CODE_VARNAME_FIELD.setValue("");
  }
  updateStatusCodeName();
}


//--------------------------------------------------------------------
// FUNCTION:
//   deleteServerBehavior
//
// DESCRIPTION:
//   Remove the specified Server Behavior from the user's document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function deleteServerBehavior(sbObj)
{
  dwscripts.deleteSB(sbObj);

  // Clear out the cache for this stored proc.
  var rsName = sbObj.getRecordsetName();
  if (rsName)
  {
    SBDatabaseCall.schemaCache.removeCachedSchemaInfo(rsName);
  }
  
  var ignore = new Array();
  SBDatabaseCall.schemaCache.removeCachedSchemaInfo(sbObj.getDatabaseCall(ignore));

  MMDB.refreshCache(true);
}


//--------------------------------------------------------------------
// FUNCTION:
//   analyzeServerBehavior
//
// DESCRIPTION:
//   Performs extra checks needed to determine if the Server Behavior
//   is complete
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//   allRecs - JavaScripts Array of ServerBehavior objects - all of the
//             ServerBehavior objects known to Dreamweaver
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function analyzeServerBehavior(sbObj, allRecs)
{
  sbObj.analyze();
}


//--------------------------------------------------------------------
// CLASS:
//   SBStoredProcCF
//
// DESCRIPTION:
//   Subclass of SBDatabaseCall which includes CF Stored Procedure specific 
//   functionality.
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//   INSPECTORS:
//
//   Overriden SBDatabaseCall functions:
//   getDatabaseCall(returnedCallParams) - get the text used to invoke
//     a database action and the parameters referenced in the call text.
//   isCallObject() - true if an object, such as a command or stored procedure,
//     is making the database call. false if this is a direct database query (e.g.,
//     a SQL statement).
//   getRecordsetBindings - get the columns and column types for the
//
//   Added functions:
//   getUserName()
//   getPassword()
//   getStatusCodeVarName()
//   getCFSQLTypeList() - get list of sql types.
//   getSPParameterNameStr(paramName) - gets parameter name to use for the SP call.
//   getTypeStringFromDirEnum - get cfprocparam type from enumerated direction value
//     from MMDB.getSPParamsAsString.
//   getSPParamsAndTestVals(outParamNames, outParamValues, bPromptIfNotFound) - get
//     parameters and default values needed to test or get info about the recordset
//     returned from a SP.
//
//   UPDATORS:
//
//   Overriden SBDatabaseCall functions:
//   setDatabaseCall(dbCallText, callParameters) - set the text used to invoke
//     a database action and the parameters referenced in the call text.
//   checkDatabaseCall()
//   checkConnectionName()
//   checkPlatformSpecific()
//   checkRecordsetName()
//   queueDocEdits() - schedule the SB edits on the edit list for the page.
//     They are committed when dwscripts.applySB() is called.
//
//   Added functions:
//   setUserName()
//   setPassword()
//   setStatusCodeVarName()
//
//   CONSTRUCTION:
//
//   Overriden SBDatabaseCall functions:
//   analyzeDatabaseCall()
//   analyzePlatformSpecific()
//
//   Added functions:
//   initSBStoredProcCF() - base class constructor for subclasses.
//
// INCLUDE:
//   ServerBehaviorClass.js
//   SBDatabaseCallClass.js
//   TagEditClass.js
//--------------------------------------------------------------------

function SBStoredProcCF(name, title, selectedNode)
{
  this.initSBStoredProcCF((name) ? name : "CFStoredProc", title, selectedNode);
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.initSBStoredProcCF
//
// DESCRIPTION:
//   SBStoredProcCF 'constructor' for subclasses. In JS, subclasses cannot call
//   the base class constructor to initialize it's properties for the subclass
//   instance. Calls directly to the contructor set the base class properties for
//   all instances of the subclass! We provide this init function for subclasses 
//   to call instead of the constructor. Calls to this 'constructor' initialize
//   the base class properties only for the subclass instance. The SBStoredProcCF 
//   constructor calls into this function as well.
//
// ARGUMENTS:
//   name - string. recordset name
//   title - string. 
//   selectedNode - document node ptr. node to select when SB selected in SBPanel.
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function SBStoredProcCF_initSBStoredProcCF(name, title, selectedNode)
{
  // First, initialize base class.
  this.initSBDatabaseCall(name, title, selectedNode);  
}

// Inherit from the SBDatabaseCall class.
SBStoredProcCF.prototype.__proto__ = SBDatabaseCall.prototype;


// PUBLIC METHODS

// Class methods:
SBStoredProcCF.getSPParameterNameStr = SBStoredProcCF_getSPParameterNameStr;
SBStoredProcCF.getTypeStringFromDirEnum = SBStoredProcCF_getTypeStringFromDirEnum;
SBStoredProcCF.getNumRefsToVarName = SBStoredProcCF_getNumRefsToVarName;

// Inspectors:
SBStoredProcCF.prototype.getDatabaseCall = SBStoredProcCF_getDatabaseCall;
SBStoredProcCF.prototype.getUserName = SBStoredProcCF_getUserName; 
SBStoredProcCF.prototype.getPassword = SBStoredProcCF_getPassword; 
SBStoredProcCF.prototype.isCallObject = SBStoredProcCF_isCallObject;
SBStoredProcCF.prototype.getRecordsetBindings = SBStoredProcCF_getRecordsetBindings;
SBStoredProcCF.prototype.getUniqueVariableName = SBStoredProcCF_getUniqueVariableName;
SBStoredProcCF.prototype.getSPParamsAndTestVals = SBStoredProcCF_getSPParamsAndTestVals;
SBStoredProcCF.prototype.getStatusCodeVarName = SBStoredProcCF_getStatusCodeVarName;
SBStoredProcCF.prototype.getCFSQLTypeList = SBStoredProcCF_getCFSQLTypeList;

// Updaters:
SBStoredProcCF.prototype.setDatabaseCall = SBStoredProcCF_setDatabaseCall;
SBStoredProcCF.prototype.setPassword = SBStoredProcCF_setPassword; 
SBStoredProcCF.prototype.setUserName = SBStoredProcCF_setUserName; 
SBStoredProcCF.prototype.checkDatabaseCall = SBStoredProcCF_checkDatabaseCall;
SBStoredProcCF.prototype.checkPlatformSpecific = SBStoredProcCF_checkPlatformSpecific;
SBStoredProcCF.prototype.checkRecordsetName = SBStoredProcCF_checkRecordsetName;
SBStoredProcCF.prototype.checkConnectionName = SBStoredProcCF_checkConnectionName;
SBStoredProcCF.prototype.checkReturnStatusCode = SBStoredProcCF_checkReturnStatusCode;
SBStoredProcCF.prototype.queueDocEdits = SBStoredProcCF_queueDocEdits;
SBStoredProcCF.prototype.queueCFParamEdits = SBStoredProcCF_queueCFParamEdits;
SBStoredProcCF.prototype.queueCFStoredProcEdits = SBStoredProcCF_queueCFStoredProcEdits;
SBStoredProcCF.prototype.getCFProcParamTagEdits = SBStoredProcCF_getCFProcParamTagEdits;
SBStoredProcCF.prototype.getCFProcResultTagEdits = SBStoredProcCF_getCFProcResultTagEdits;
SBStoredProcCF.prototype.setStatusCodeVarName = SBStoredProcCF_setStatusCodeVarName;

// Construction
SBStoredProcCF.prototype.initSBStoredProcCF = SBStoredProcCF_initSBStoredProcCF;
SBStoredProcCF.prototype.analyzeConnectionName = SBStoredProcCF_analyzeConnectionName;
SBStoredProcCF.prototype.analyzeDatabaseCall = SBStoredProcCF_analyzeDatabaseCall;
SBStoredProcCF.prototype.analyzePlatformSpecific = SBStoredProcCF_analyzePlatformSpecific;


// PRIVATE METHODS
SBStoredProcCF.prototype.getSQLForRecordsetBindings = SBStoredProcCF_getSQLForRecordsetBindings;
SBStoredProcCF.prototype.getSQLForTest = SBStoredProcCF_getSQLForTest;
SBStoredProcCF.prototype.isUniqueVariableName = SBStoredProcCF_isUniqueVariableName;
SBStoredProcCF.prototype.setTestValuesForLiveData = SBStoredProcCF_setTestValuesForLiveData;

// PUBLIC PROPERTIES
// CLASS CONSTANTS
// Override of SBDatabaseCall.prototype.EXT_DATA_* constants. Stores names of
// common extension data elements. See SBDatabaseCall.prototype.EXT_DATA_* for 
// details. 
SBStoredProcCF.prototype.EXT_DATA_RS_NAME         = "RecordsetName";
SBStoredProcCF.prototype.EXT_DATA_USER_NAME       = "Username";
SBStoredProcCF.prototype.EXT_DATA_PASSWORD        = "Password";
SBStoredProcCF.prototype.EXT_DATA_CONN_NAME       = "ConnectionName";

// CF Stored Proc specific constants
SBStoredProcCF.prototype.EXT_DATA_DB_CALL_TEXT    = "Procedure";
SBStoredProcCF.prototype.EXT_DATA_STATUS_VARNAME  = "StatusCodeVarName";
SBStoredProcCF.prototype.EXT_DATA_VAR_TYPES       = "VariableTypes";
SBStoredProcCF.prototype.EXT_DATA_DB_VAR_NAMES    = "DBVariableNames";
SBStoredProcCF.prototype.EXT_DATA_VAR_VALUES      = "VariableValues";
SBStoredProcCF.prototype.EXT_DATA_CF_VAR_NAMES    = "CFVariableNames";
SBStoredProcCF.prototype.EXT_DATA_VAR_SQL_TYPES   = "VariableSQLTypes";
SBStoredProcCF.prototype.EXT_DATA_VAR_DEFAULTS    = "VariableDefaults";


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.getDatabaseCall
//
// DESCRIPTION:
//   Get the stored procedure name and parameters.
//
// ARGUMENTS:
//   returnedCallParams - array. Empty array object used to retrieve the stored
//     procedure parameters. 
//
// RETURNS:
//   string - stored procedure name. null if not set.
//   returnedCallParams - array. Elements are objects with the following
//     properties: varType, dbVarName, varValue, cfVarName, cfSQLType,
//     varDefault, varTestValue. Each element describes a stored procedure parameter.
//--------------------------------------------------------------------

function SBStoredProcCF_getDatabaseCall(returnedCallParams)
{
  var storedProcName = this.getParameter(this.EXT_DATA_DB_CALL_TEXT);

  var storedProcVars = new Array();
  
  if (returnedCallParams != null)
  {
    var varTypes = this.getParameter(this.EXT_DATA_VAR_TYPES);
    var varValues = this.getParameter(this.EXT_DATA_VAR_VALUES);
    var cfVarNames = this.getParameter(this.EXT_DATA_CF_VAR_NAMES);
    var cfSQLTypes = this.getParameter(this.EXT_DATA_VAR_SQL_TYPES);
    var varDefaults = this.getParameter(this.EXT_DATA_VAR_DEFAULTS);
    var dbVarNames = this.getParameter(this.EXT_DATA_DB_VAR_NAMES);
    var ignore = new Array();
    var varTestValues = new Array();
    this.getSPParamsAndTestVals(ignore, varTestValues, false);
    
    for (var j=0; varTypes && j < varTypes.length; j++) 
    {
      var paramObj = new Object();
      paramObj.varType = varTypes[j];
      paramObj.dbVarName = (dbVarNames && dbVarNames.length) ? dbVarNames[j] : ''; 
      paramObj.varValue = (varValues && varValues.length) ? varValues[j] : ''; 
      paramObj.cfVarName = (cfVarNames && cfVarNames.length) ? cfVarNames[j] : '';
      paramObj.cfSQLType = (cfSQLTypes && cfSQLTypes.length) ? cfSQLTypes[j] : '';
      paramObj.varDefault = (varDefaults && varDefaults.length) ? varDefaults[j] : null;
      paramObj.varTestValue = varTestValues[j];
      
      returnedCallParams.push(paramObj);
    }
  }

  return storedProcName;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.setDatabaseCall
//
// DESCRIPTION:
//   set the stored procedure name and parameters. 
//   if in editable copy, set in preparation for updating the SB instance.
//
// ARGUMENTS:
//   storedProcName - string.
//   storedProcParams - array. Elements are objects with the following
//     properties: varType, dbVarName, varValue, cfVarName, cfSQLType,
//     varDefault, varTestValue. Each element describes a stored procedure parameter.
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function SBStoredProcCF_setDatabaseCall(storedProcName, storedProcParams)
{
  var varTypes = new Array();
  var dbVarNames = new Array();
  var varValues = new Array();
  var cfVarNames = new Array();
  var cfSQLTypes = new Array();
  var varDefaults = new Array();
  var varNameAndTestValues = new Array();
  
  if (storedProcParams != null)
  {
    var paramCount = storedProcParams.length;
    for (var i = 0; i < paramCount; ++i)
    {
      var param = storedProcParams[i];    
      varTypes.push(param.varType);
      dbVarNames.push(param.dbVarName);
      varValues.push(param.varValue);
      cfVarNames.push(param.cfVarName);
      cfSQLTypes.push(param.cfSQLType);
      varDefaults.push(param.varDefault);
      
      // The cache function expects an array of even elements as the var name,
      //   and odd elements as the test value.
      varNameAndTestValues.push(param.dbVarName);
      varNameAndTestValues.push(param.varTestValue);
    }
  }

  this.setParameter(this.EXT_DATA_DB_CALL_TEXT, storedProcName);
  this.setParameter(this.EXT_DATA_VAR_TYPES, varTypes);
  this.setParameter(this.EXT_DATA_DB_VAR_NAMES, dbVarNames);
  this.setParameter(this.EXT_DATA_VAR_VALUES, varValues);
  this.setParameter(this.EXT_DATA_CF_VAR_NAMES, cfVarNames);
  this.setParameter(this.EXT_DATA_VAR_SQL_TYPES, cfSQLTypes);
  this.setParameter(this.EXT_DATA_VAR_DEFAULTS, varDefaults);

  if (storedProcName)
  {
    SBDatabaseCall.schemaCache.saveParamTestValueArrayForCache(storedProcName, varNameAndTestValues);  

    // Also update the test values for live data.
    var varTestValues = new Array();
    for (var j = 1; j < varNameAndTestValues.length; j += 2)
    {
      varTestValues.push(varNameAndTestValues[j]);
    }
    this.setTestValuesForLiveData(varTestValues);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.isCallObject
//
// DESCRIPTION:
//   return true if an object, such as a command or stored procedure,
//     is making the database call. false if this is a direct database query (e.g.,
//     a SQL statement).
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean - true if object is making the database call.
//--------------------------------------------------------------------

function SBStoredProcCF_isCallObject()
{
  return true; 
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.analyzeConnectionName
//
// DESCRIPTION:
//   Perform any post-find checks on the Connection name.  Override of base
//   class - ColdFusion does not use connection include files anymore.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBStoredProcCF_analyzeConnectionName()
{
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.analyzeDatabaseCall
//
// DESCRIPTION:
//   Check that the stored procedure name and parameters are valid
//   
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBStoredProcCF_analyzeDatabaseCall()
{
  // When the stored procedure is found, arrays are returned for each
  //   of the attributes for the cfprocparams. Parallel elements of these
  //   arrays represent an individual cfprocparam. However, cfprocparams of type
  //   'IN' do not have the cfvarname attribute, and cfprocparams of type
  //   'OUT' do not have the value attribute. Since the value and cfvarname
  //   attributes are not extracted for some cfprocparams, the arrays for
  //   cfvarname and value may not be parallel with the others. For example,
  //   a cfprocparam of type 'IN' should have a entry of '' in the array of
  //   cfvarnames, but we do not extract a '' if there is no cfvarname for some
  //   cfprocparam. We must fix these arrays.

  var varTypes = this.getParameter(this.EXT_DATA_VAR_TYPES);
  var varValues = this.getParameter(this.EXT_DATA_VAR_VALUES);
  var cfVarNames = this.getParameter(this.EXT_DATA_CF_VAR_NAMES);

  for (var i = 0; varTypes && i < varTypes.length; ++i)
  {
    // If the param is type 'IN', add an empty entry in cfvarnames.      
    //   Otherwise, if the param is type 'OUT', add an empty entry in values.
    if (varTypes[i].toUpperCase() == 'IN')
    {
      if (!cfVarNames)
      {
        cfVarNames = new Array();
      }
      
      // It appears that analyze is sometimes called on a cached version of this
      //   sbObj. So we don't want to automatically insert '' in the cfVarNames
      //   array. ONLY do it if the lengths of varTypes and cfVarNames is different -
      //   then we know for sure that they are not parallel and need repair.
      if (varTypes.length != cfVarNames.length)
      {
        cfVarNames.splice(i, 0, '');
      }
    }
    else if (varTypes[i].toUpperCase() == 'OUT')
    {
      if (!varValues)
      {
        varValues = new Array();
      }

      // It appears that analyze is sometimes called on a cached version of this
      //   sbObj. So we don't want to automatically insert '' in the varValues
      //   array. ONLY do it if the lengths of varTypes and varValues is different -
      //   then we know for sure that they are not parallel and need repair.
      if (varTypes.length != varValues.length)
      {
        varValues.splice(i, 0, '');
      }
    }  
  }
    
  // Update the parameter object.
  if (varValues)
  {
    this.setParameter(this.EXT_DATA_VAR_VALUES, varValues);
  }
  if (cfVarNames)
  {
    this.setParameter(this.EXT_DATA_CF_VAR_NAMES, cfVarNames);
  }

  // To determine if any of the stored procedure variables have default values,
  //   we need to search for cfparam tags on the page whose name is the same as
  //   the stored proc variable's runtime value. Once these default values are collected,
  //   store them in the parameter object with the other parallel arrays describing
  //   stored proc variables.
  var varDefaults = new Array();
  var dom = dw.getDocumentDOM();
  var paramTags = dom.getElementsByTagName("cfparam");
  for (i = 0; varValues && i < varValues.length; ++i)
  {
    var bFoundDefault = false;
    
    // Only look for the associated cfparam if the runtime value is not a literal
    //   value, i.e. it's surrounded by #'s.
    if (   varValues[i] && varValues[i].length > 2 
        && varValues[i].charAt(0) == "#" 
        && varValues[i].charAt(varValues[i].length - 1) == "#"
       )
    {
      for (var j = 0; !bFoundDefault && j < paramTags.length; ++j)
      {
        var paramTagName = paramTags[j].getAttribute("name");
        var paramTagDefault = paramTags[j].getAttribute("default");
  
        // Strip '#' from variable value for comparison.
        var valueSansHash = dwscripts.stripChars(varValues[i], "#");
        if (paramTagName.toUpperCase() == valueSansHash.toUpperCase())
        {
          varDefaults[i] = paramTagDefault;
          bFoundDefault = true;
        }
      }
    }

    if (!bFoundDefault)
    {
      varDefaults[i] = null;
    }
  }

  if (varDefaults.length > 0)
  {
    this.setParameter(this.EXT_DATA_VAR_DEFAULTS, varDefaults);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.analyzePlatformSpecific
//
// DESCRIPTION:
//   Check that the platform specific parameters are valid
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBStoredProcCF_analyzePlatformSpecific()
{
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.checkRecordsetName
//
// DESCRIPTION:
//   Checks that the currently assigned Recordset name is valid
//
// ARGUMENTS:
//   bIsForTest - boolean - see description in checkData
//
// RETURNS:
//   boolean - true if the name is valid
//--------------------------------------------------------------------

function SBStoredProcCF_checkRecordsetName(bIsForTest)
{
  var isValidRS = true;
  
  if (!bIsForTest)
  {
    // Check for valid recordset name, but only if it is used.
    var theName = this.getRecordsetName();
    var oldName = this.parameters[this.EXT_DATA_RS_NAME];

    if (theName != null)
    {
      if (!dwscripts.isValidVarName(theName))
      {
        isValidRS = false      
        this.appendErrorMessage(MM.MSG_InvalidRecordsetName);
      }

      if (!this.isUniqueVariableName(theName, true))
      {
        isValidRS = false      
        this.appendErrorMessage(MM.MSG_DupeRecordsetName);
      }

      if (dwscripts.isReservedWord(theName))
      {
        isValidRS = false      
        this.appendErrorMessage(dwscripts.sprintf(MM.MSG_ReservedWord, theName));
      }
    }
    else
    {
      this.setRecordsetName(null);
    }
  }

  return isValidRS;
}

//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.checkConnectionName
//
// DESCRIPTION:
//   Checks that the currently assigned Connection name is valid.
//   Also assigns the appropriate connection path. Override of
//   base class function.
//
// ARGUMENTS:
//   bIsForTest - boolean - see description in checkData
//
// RETURNS:
//   boolean - true if the name is valid
//--------------------------------------------------------------------

function SBStoredProcCF_checkConnectionName(bIsForTest)
{
  var isValidRS = true;

  var connName = this.getConnectionName();
  if (!connName)
  {
    isValidRS = false      
    this.appendErrorMessage(MM.MSG_NoCFDataSource);
  }

  return isValidRS;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.checkPlatformSpecific
//
// DESCRIPTION:
//   Check that the platform specific parameters are valid, and provide
//   the proper defaults if no values were provided.
//
// ARGUMENTS:
//   bIsForTest - boolean - indicates if this check is for the test button
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function SBStoredProcCF_checkPlatformSpecific(bIsForText)
{

  var isValid = true;

  if (this.getUserName() == null) 
  {
    this.setUserName("");
  }
  if (this.getPassword() == null) 
  {
    this.setPassword("");
  }
  
  return isValid;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.getCFSQLTypeList
//
// DESCRIPTION:
//   Used to get the list of cold fusion sql types.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   array - elements are sql type strings.
//--------------------------------------------------------------------

function SBStoredProcCF_getCFSQLTypeList()
{
  var cfSQLTypeList = new Array();
  cfSQLTypeList[0] = "CF_SQL_BIGINT";
  cfSQLTypeList[1] = "CF_SQL_BIT";
  cfSQLTypeList[2] = "CF_SQL_CHAR";
  cfSQLTypeList[3] = "CF_SQL_DATE";
  cfSQLTypeList[4] = "CF_SQL_DECIMAL";
  cfSQLTypeList[5] = "CF_SQL_DOUBLE";
  cfSQLTypeList[6] = "CF_SQL_FLOAT";
  cfSQLTypeList[7] = "CF_SQL_IDSTAMP";
  cfSQLTypeList[8] = "CF_SQL_INTEGER";
  cfSQLTypeList[9] = "CF_SQL_LONGVARCHAR";
  cfSQLTypeList[10] = "CF_SQL_MONEY";
  cfSQLTypeList[11] = "CF_SQL_MONEY4";
  cfSQLTypeList[12] = "CF_SQL_NUMERIC";
  cfSQLTypeList[13] = "CF_SQL_REAL";
  cfSQLTypeList[14] = "CF_SQL_SMALLINT";
  cfSQLTypeList[15] = "CF_SQL_TIME";
  cfSQLTypeList[16] = "CF_SQL_TIMESTAMP";
  cfSQLTypeList[17] = "CF_SQL_TINYINT";
  cfSQLTypeList[18] = "CF_SQL_VARCHAR";
  
  return cfSQLTypeList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.getTypeStringFromDirEnum
//
// DESCRIPTION:
//   Get the cfprocparam type from the enumerated direction value returned from
//   MMDB.getSPParamsAsString. Static function.
//
// ARGUMENTS:
//   directionEnum - integer. enumerated direction value returned from
//     MMDB.getSPParamsAsString, 1 to 4.
//
// RETURNS:
//   string - cfprocparam type.
//--------------------------------------------------------------------

function SBStoredProcCF_getTypeStringFromDirEnum(directionEnum)
{
  var retVal = "";
  switch(directionEnum)
  {
    case 1:
      retVal = "IN";
      break;
    case 2:
      retVal = "OUT";
      break;
    case 3:
      retVal = "INOUT";
      break;
    case 4:
      retVal = "RETURN";
      break;
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.getSPParameterNameStr
//
// DESCRIPTION:
//   Returns the string to send to the stored procedure call for the given
//   parameter. Static function.
//
// ARGUMENTS:
//   paramName - string. stored procedure parameter name.
//
// RETURNS:
//   string - reference to send to the SP.
//--------------------------------------------------------------------

function SBStoredProcCF_getSPParameterNameStr(paramName)
{
  // Currently, we merely tack a '@' on the front of the paramName. Ultimately,
  //   we may be able to figure out what kind of database we are connected to
  //   (e.g., Oracle, SQL Server, Sybase, etc.) and make the right decision about
  //   whether to tack on the '@' or not. For example, an oracle database will not
  //   accept the '@', but SQL Server requires it.
  if (paramName.charAt(0) != "@")
  {
    paramName = "@" + paramName;
  }
  return paramName;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.checkDatabaseCall
//
// DESCRIPTION:
//   Check that the entered database call and call parameters are valid.
//
// ARGUMENTS:
//   bIsForTest - boolean - indicates if this check is for the test button
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function SBStoredProcCF_checkDatabaseCall(bIsForTest)
{
  var isValid = true;
  var storedProcParams = new Array();

  // Track param test values if we need to update them in the cache. Note, this
  //   array's even elements are param names, and its odd elements are test values.
  var varNameAndTestValues = new Array();
  var bUpdateTestValueCache = false;
  
  // Check for valid stored procedure name.
  var storedProcName = this.getDatabaseCall(storedProcParams);
  if (dwscripts.stripChars(storedProcName, " \r\n\t") == "")
  {
    isValid = false;
    this.appendErrorMessage(MM.MSG_NoStoredProcText);
  }

  isValid = isValid && this.checkReturnStatusCode();
  
  // Check that all necessary stored proc param values are set.
  for (var i = 0; i < storedProcParams.length; i++)
  {
    var param = storedProcParams[i];

    // Check the variable name.
    var theName = dwscripts.trim(param.dbVarName);
    if (!theName)
    {
      // In the StoredProc dialog, it is possible for users to enter a cfparam
      //   which is not associated with a cfprocparam. If this is the case, the
      //   storedProcParam entry would only have the varDefault and varValue
      //   properties. Throw an error - we want to restrict the user to cfparams
      //   that are associated with cfprocparams.
      if (   (param.varDefault != null) && param.varValue && !param.varType && !param.cfSQLType
          && !param.cfVarName
         )
      {
        isValid = false;
        this.appendErrorMessage(MM.MSG_NoVariableForDefault);
      }
      else
      {
        // Just missing the dbVarName.
        isValid = false;
        this.appendErrorMessage(MM.MSG_MissingVariableNames);
      }

      // If we find a missing variable name, just return because we need the name
      //   to identify other missing values.
      return isValid;
    }
    else
    {
      theName = dwscripts.stripChars(theName, "@");
      // Check the variable type (direction).
      var theType = dwscripts.trim(param.varType);
      if (theType == "")
      {
        isValid = false;
        this.appendErrorMessage(dwscripts.sprintf(MM.MSG_MissingParamDirection, theName));
      }

      // Check the sql type.
      var cfSQLTypeList = this.getCFSQLTypeList();
      var theCFSQLType = dwscripts.trim(param.cfSQLType).toUpperCase();
      if (theCFSQLType == "")
      {
        isValid = false;
        this.appendErrorMessage(dwscripts.sprintf(MM.MSG_MissingParamCFSQLType, theName));
      }
      else  if (dwscripts.findInArray(cfSQLTypeList, theCFSQLType) == -1)
      {
        isValid = false;
        this.appendErrorMessage(dwscripts.sprintf(MM.MSG_InvalidParamCFSQLType, theName));
      }

      // Check the runtime value and test value.
      var theValue = dwscripts.trim(param.varValue);
      var theTestValue = dwscripts.trim(param.varTestValue);
      if (theType.toUpperCase() == "IN" || theType.toUpperCase() == "INOUT")
      {
        if (theValue == "")
        {
          isValid = false;
          this.appendErrorMessage(dwscripts.sprintf(MM.MSG_MissingParamRunTimeVal, theName));
        }
        else if (   (theValue.charAt(0) == "#" && theValue.charAt(theValue.length - 1) != "#")
                 || (theValue.charAt(0) != "#" && theValue.charAt(theValue.length - 1) == "#")
                )
        {
          isValid = false;
          this.appendErrorMessage(dwscripts.sprintf(MM.MSG_InvalidParamRunTimeVal, theName));
        }
        else
        {
          // The runtime value is valid, so make sure it has a test value. The test value
          //   is required to test the stored procedure and to retrieve the return 
          //   recordset columns. 
          if (!theTestValue)
          {
            // If we don't have a test value, use the runtime value if it is a literal
            //   value. If not, use the default value. If no default value, report
            //   an error.
            if (theValue.charAt(0) != "#" && theValue.charAt(theValue.length - 1) != "#")
            {
              // We need to update the cache since we're using the runtime literal value
              //   as the test value.
              bUpdateTestValueCache = true;
              theTestValue = theValue;
            }
            else if (param.varDefault != null)
            {
              // We need to update the cache since we're using the default value
              //   as the test value.
              bUpdateTestValueCache = true;
              theTestValue = param.varDefault;
            }
            else
            {
              isValid = false;
              this.appendErrorMessage(dwscripts.sprintf(MM.MSG_MissingParamTestValue, theName));
            }
          }

          // Keep track of the test values in case we have to update the cache.
          varNameAndTestValues.push(param.dbVarName); 
          varNameAndTestValues.push(theTestValue);
        }
      }  
      
      var theCFVarName = dwscripts.trim(param.cfVarName);
      if (theType.toUpperCase() == "INOUT" || theType.toUpperCase() == "OUT")
      {
        if (theCFVarName == "")
        {
          isValid = false;
          this.appendErrorMessage(dwscripts.sprintf(MM.MSG_MissingReturnVarName, theName));
        }
        else
        {
          if (!dwscripts.isValidVarName(theCFVarName))
          {
            isValid = false      
            this.appendErrorMessage(dwscripts.sprintf(MM.MSG_InvalidReturnVarName, theName, theCFVarName));
          }
      
          if (dwscripts.isReservedWord(theCFVarName))
          {
            isValid = false      
            this.appendErrorMessage(dwscripts.sprintf(MM.MSG_ReturnVarIsReservedWord, theName, theCFVarName));
          }

          if (!this.isUniqueVariableName(theCFVarName, true))
          {
            isValid = false      
            this.appendErrorMessage(dwscripts.sprintf(MM.MSG_DupeVariableName, theName, theCFVarName));
          }
        }
      }
    }
  }

  // If necessary, update the test value cache.
  if (bUpdateTestValueCache && isValid)
  {
    SBDatabaseCall.schemaCache.saveParamTestValueArrayForCache(storedProcName, varNameAndTestValues);  

    // Also update the test values for live data.
    var varTestValues = new Array();
    for (var j = 1; j < varNameAndTestValues.length; j += 2)
    {
      varTestValues.push(varNameAndTestValues[j]);
    }
    this.setTestValuesForLiveData(varTestValues);
  }

  return isValid;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.checkReturnStatusCode
//
// DESCRIPTION:
//   Helper function to checkDatabaseCall. Checks validity of the status code
//   variable.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   true if the status code is valid. On false, get error message using
//   getErrorMessage().
//--------------------------------------------------------------------

function SBStoredProcCF_checkReturnStatusCode()
{
  var isValid = true;
  var statusCodeVarName = this.getStatusCodeVarName();
  if (statusCodeVarName != null)
  {
    statusCodeVarName = dwscripts.trim(statusCodeVarName);
    
    if (statusCodeVarName == "")
    {
      isValid = false;
      this.appendErrorMessage(MM.MSG_MissingStatusVarName);
    }
    else
    {
      if (!dwscripts.isValidVarName(statusCodeVarName))
      {
        isValid = false      
        this.appendErrorMessage(MM.MSG_InvalidStatusVarName);
      }
  
      if (dwscripts.isReservedWord(statusCodeVarName))
      {
        isValid = false      
        this.appendErrorMessage(MM.MSG_StatusVarIsReservedWord);
      }

      if (!this.isUniqueVariableName(statusCodeVarName, true))
      {
        isValid = false      
        this.appendErrorMessage(MM.MSG_DupeStatusVarName);
      }
    }
  }
  
  return isValid;  
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.isUniqueVariableName
//
// DESCRIPTION:
//   Search through all output variable names for this and all existing stored
//   procs to determine if the variable name is unique.
//
// ARGUMENTS:
//   varName - string. Variable name to check for uniqueness.
//   bOneDuplicateOK - boolean. 'true' if the variable name should still be considered
//     unique if one duplicate is found in this stored proc. Send 'true' if you've
//     already updated this stored proc to use varName and are just checking its
//     uniqueness among the other variable names. You must allow one duplicate in 
//     this case since you've already updated this stored proc with it.
//
// RETURNS:
//   true if the variable is unique. false if it is already used in
//   this stored proc, or if it is already used in existing stored procs.
//--------------------------------------------------------------------

function SBStoredProcCF_isUniqueVariableName(varName, bOneDuplicateOK)
{
  // First search through all output variable names used in this stored proc.
  var retVal = true;
  var numDuplicates = SBStoredProcCF.getNumRefsToVarName(this, varName);

  // If one dupe is OK, decrement found number of dupes.
  if (bOneDuplicateOK)
  {
    --numDuplicates;
  }
    
  if (numDuplicates > 0)
  {
    retVal = false;
  }
  
  // If we haven't found any duplicates yet, check all other stored procedures on
  //   the page.
  if (retVal)
  {
    numDuplicates = 0;
    var storedProcs = dwscripts.getServerBehaviorsByFileName("CFStoredProc.htm");
    if (storedProcs)
    {
      for (var i = 0; retVal && i < storedProcs.length; ++i)
      {
        // Do not recheck the existing instance of this stored proc if there is one.
        //   (We check for the existing version by comparing the main part nodes.)
        //   It is being replaced with the updated version, so it's variables shouldn't
        //   be considered in the duplicates check.
        if (   !this.bInEditMode 
            || (   storedProcs[i].getNamedSBPart("CFStoredProc_main").getNode() 
                != this.getNamedSBPart("CFStoredProc_main").getNode() 
               )
           ) 
        {
          numDuplicates = SBStoredProcCF.getNumRefsToVarName(storedProcs[i], varName);
          if (numDuplicates > 0)
          {
            retVal = false;
          }
        }
      }
    }    
  }
      
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.getNumRefsToVarName
//
// DESCRIPTION:
//   Retrieve the number of times the variable name is used in the given
//   stored procedure. Static function.
//
// ARGUMENTS:
//   storedProc - SBStoredProcCF. Stored proc object in which to perform
//     reference check.
//   varName - string. Variable name.
//
// RETURNS:
//   integer - number of references to the variable.
//--------------------------------------------------------------------

function SBStoredProcCF_getNumRefsToVarName(storedProc, varName)
{
  // Search through all output variables for the given stored proc.
  //   Output variables consist of output parameter names, returned 
  //   recordset name, and returned status code variable name.
  var existingVarNames = new Array();
  var cfVarNames = storedProc.getParameter(storedProc.EXT_DATA_CF_VAR_NAMES);
  var statusCodeVarName = storedProc.getStatusCodeVarName();
  var recordsetName = storedProc.getRecordsetName();
  
  if (cfVarNames && cfVarNames.length)
  {
    existingVarNames = existingVarNames.concat(cfVarNames);
  }
  if (statusCodeVarName)
  {
    existingVarNames = existingVarNames.concat(statusCodeVarName);  
  }
  if (recordsetName)
  {
    existingVarNames = existingVarNames.concat(recordsetName);  
  }

  var numReferences = 0;
  for (var i = 0; i < existingVarNames.length; ++i)
  {
    if (   existingVarNames[i]
        && existingVarNames[i].toUpperCase() == varName.toUpperCase()
       )
    {
      ++numReferences;
    }
  }

  return numReferences;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.getUniqueVariableName
//
// DESCRIPTION:
//   Return a variable name that is unique to the current document and among
//   the variable return names for the existing stored proc.
//
// ARGUMENTS:
//   baseName - string. Name to use. Will tack on integer if not unique.
//     
// RETURNS:
//   string - unique name.
//--------------------------------------------------------------------

function SBStoredProcCF_getUniqueVariableName(baseName)
{
  var uniqueName = baseName;
  for (var i = 0; !this.isUniqueVariableName(uniqueName, false); ++i)
  {
    uniqueName = baseName + String(i);
  }

  return uniqueName;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.setTestValuesForLiveData
//
// DESCRIPTION:
//   Set the Live Data parameters to include any stored procedure variable
//   runtime values which do not have default values. Otherwise, Live Data
//   will not function correctly.
//
// ARGUMENTS:
//   varTestValues - array. List of test values which is parallel to the other
//   arrays describing a stored procedure variable's properties (e.g., dbVarNames,
//   varTypes, etc.). 
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBStoredProcCF_setTestValuesForLiveData(varTestValues)
{
  var varTypes = this.getParameter(this.EXT_DATA_VAR_TYPES);
  var varValues = this.getParameter(this.EXT_DATA_VAR_VALUES);
  var varDefaults = this.getParameter(this.EXT_DATA_VAR_DEFAULTS);
  var urlParamString = "";
  
  // Track the runtime values we add to the url string.
  var addedURLParams = new Array();
    
  for (var i = 0; i < varTypes.length; ++i)
  {
    // If this is an input parameter that is not a literal (i.e. not surrounded by
    //   #'s), and it has no default value, add it to the url parameter string.
    if (   varTypes[i] && varTypes[i].toUpperCase().indexOf("IN") != -1
        && (varDefaults[i] == null) && varTestValues[i]
        && varValues[i].indexOf('#') != -1
       )
    {
      var valueSansHash = dwscripts.stripChars(varValues[i], "#");
      addedURLParams.push(valueSansHash);    
      urlParamString = urlParamString + ((urlParamString) ? "&" : "")
                     + valueSansHash + "=" + varTestValues[i];
    }
  }
  
  // Add all existing parameters back on the url parameter string if we didn't add 
  //   them above.
  var currentLiveDataParams = dw.getLiveDataParameters();
  for (var i = 0; i < currentLiveDataParams.length; i += 2)
  {
    if (dwscripts.findInArray(addedURLParams, currentLiveDataParams[i]) == -1)
    {
      urlParamString = urlParamString + ((urlParamString) ? "&" : "")
                     + currentLiveDataParams[i] + "=" + currentLiveDataParams[i + 1];
    }
  }
  
  dw.setLiveDataParameters(urlParamString);
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.queueDocEdits
//
// DESCRIPTION:
//   schedule the SB edits on the edit list for the page. They are committed when
//   dwscripts.applySB() is called. If this is an update of an existing instance,
//   performs manual update. Override of SBDatabaseCall base function.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function SBStoredProcCF_queueDocEdits()
{
  var storedProcParams = new Array();
  var storedProcName = this.getDatabaseCall(storedProcParams);

  // Update the page cfparams. cfparams are not a participant of stored proc, so 
  //   update them manually whether this is an insert or reedit.
  this.queueCFParamEdits(storedProcParams);

  // If this is an insert, use the extension data files to apply the stored proc
  //   server behavior. 
  // If this is an update, perform a precise update of the stored proc instance
  //   manually. The extension data file update tags do not provide the precision
  //   updates we require for tag participants.
  if (!this.bInEditMode)
  {
    if (dw.getDocumentDOM().documentType == "CFC")
    {
      this.setParameter("MM_location", "afterSelection");
    }
    else
    {
      dwscripts.fixUpSelection(dw.getDocumentDOM(), true, true);
    }
    extGroup.queueDocEdits(this.name, this.getParameters(), null);
  }
  else
  {
    this.queueCFStoredProcEdits(storedProcParams);
    
    // Queue edit for the status code participant.
    var statusCodeVarName = this.getStatusCodeVarName();
    if (statusCodeVarName)
    {    
      extPart.queueDocEdits(this.name,"CFStoredProc_status", this.getParameters(), this);
    }
    else
    {
      var part = this.getNamedSBPart("CFStoredProc_status");
      if (part)
      {
        dwscripts.queueNodeEdit("", part.getNode());
      }
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF_queueCFParamEdits
//
// DESCRIPTION:
//   Helper function to queueDocEdits. Queues up edits to cfparams. Note,
//   the extension data does not update the page parameters used to provide
//   default values for stored proc parameters. So, we must manually update 
//   them. Does not delete cfparams
//   if they are no longer referred to by the stored proc. They may be 
//   referred to by other SBs.
//
// ARGUMENTS:
//   storedProcParams - array of call params. Get this value from this.getDatabaseCall.
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBStoredProcCF_queueCFParamEdits(storedProcParams)
{
  var dom = dw.getDocumentDOM();
  var paramTags = dom.getElementsByTagName("cfparam");

  // Cycle through the parameters in the updated stored proc object. For 
  //   those which have default values, update the associated cfparam.
  
  // Track the variable values for which we've already inserted a cfparam. If 
  //   more than one stored proc variable has the same value, and hence uses the 
  //   same cfparam, we don't want to add the cfparam twice.
  var processedVarValues = new Array();
  for (var i = 0; i < storedProcParams.length; ++i)
  {
    var varDefault = storedProcParams[i].varDefault;
    var varValue = storedProcParams[i].varValue;
    if (   varDefault != null && storedProcParams[i].varType.toUpperCase() != "OUT"
        && dwscripts.findInArray(processedVarValues, varValue, caseInsensitiveCompare) == -1
       )
    {
      // Add the variable value to the list of processed values.
      processedVarValues.push(varValue);
      
      // Try to find the parameter among the existing cfparams on the page.
      var bPriorNode = false;
      // Strip '#' from variable value for comparison with cfparam name.
      var valueSansHash = dwscripts.stripChars(varValue, "#");
      for (var j = 0; j < paramTags.length && !bPriorNode; ++j)
      {
        // If the parameter already exists on the page, update it if needed.
        if (valueSansHash.toUpperCase() == paramTags[j].getAttribute("name").toUpperCase())
        {
          bPriorNode = true;          
          if (varDefault != paramTags[j].getAttribute("default"))
          {
            tagEdit = new TagEdit(paramTags[j]);

            if (varDefault != null)
            {
              tagEdit.setAttribute("default", varDefault);
            }
            else
            {
              tagEdit.removeAttribute("default");
            }
            
            updateText = tagEdit.getOuterHTML();
            dwscripts.queueNodeEdit(updateText, paramTags[j]);
          }        
        }      
      }
      
      // If node was not updated, we need to add it.
      if (!bPriorNode)
      {
        var paramObj = new Object();
        paramObj.ParamName = valueSansHash;
        paramObj.Default = varDefault;
        paramObj.ParamType = "";
        if (dw.getDocumentDOM().documentType == "CFC")
        {
          paramObj["MM_location"] = "beforeSelection";
        }
        extPart.queueDocEdits("","CFParam_main", paramObj, null);
      }
    }
  }    
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.queueCFStoredProcEdits
//
// DESCRIPTION:
//   Helper function to queueDocEdits. Queues up edits to the cfstoredproc
//   tag and child tags.
//
// ARGUMENTS:
//   storedProcParams - array of call params. Returned from getDatabaseCall().
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBStoredProcCF_queueCFStoredProcEdits(storedProcParams)
{
  // Create TagEdit instance based on the cfstoredproc node. 
  var mainPart = this.getNamedSBPart("CFStoredProc_main");
  tagEdit = new TagEdit(mainPart.getNode());

  var newStoredProcName = this.getParameter(this.EXT_DATA_DB_CALL_TEXT);
  var oldStoredProcParams = new Array();
  var oldStoredProcName = tagEdit.getAttribute("procedure"); 
  if (newStoredProcName.toUpperCase() != oldStoredProcName.toUpperCase())
  {
    tagEdit.setAttribute("procedure", newStoredProcName);
  }     

  var newConnectionName = this.getConnectionName();
  var oldConnectionName = tagEdit.getAttribute("datasource");
  if (newConnectionName != oldConnectionName)
  {
    tagEdit.setAttribute("datasource", newConnectionName);
  }
  
  // The password and username attributes are optional. Remove them if their
  //   values are empty.
  var newPassword = this.getPassword();
  var oldPassword = tagEdit.getAttribute("password");
  if (newPassword != oldPassword)
  {
    if (newPassword == "")
    {
      tagEdit.removeAttribute("password");
    }
    else
    {
      tagEdit.setAttribute("password", newPassword);
    }
  }
  
  var newUsername = this.getUserName();
  var oldUsername = tagEdit.getAttribute("username");
  if (newUsername != oldUsername)
  {
    if (newUsername == "")
    {
      tagEdit.removeAttribute("username");
    }
    else
    {
      tagEdit.setAttribute("username", newUsername);
    }
  }

  var newStatusCodeVarName = this.getStatusCodeVarName();
  var oldStatusCodeVarName = tagEdit.getAttribute("returncode");
  if (newStatusCodeVarName != oldStatusCodeVarName)
  {
    if (!newStatusCodeVarName)
    {
      tagEdit.removeAttribute("returncode");
    }
    else
    {
      tagEdit.setAttribute("returncode", "YES");
    }
  }
  
  // Get edits for the cfstoredproc child nodes.
  var tagEditChildNodes = tagEdit.getChildNodes();
  if (tagEditChildNodes == null)
  {
    tagEditChildNodes = new Array();
  }
  this.getCFProcParamTagEdits(tagEditChildNodes, storedProcParams);        
  this.getCFProcResultTagEdits(tagEditChildNodes);        
    
  // Apply the edits for the cfstoredproc.
  tagEdit.setChildNodes(tagEditChildNodes);
  var updateText = tagEdit.getOuterHTML();
  dwscripts.queueDocEdit(updateText, "replaceNode", mainPart.getNode());
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.getCFProcParamTagEdits
//
// DESCRIPTION:
//   Helper function for queueCFStoredProcEdits. Adds edits to the cfprocparam tags
//   in the tagEdit array.
//
// ARGUMENTS:
//   tagEditChildNodes - array of tagEdit objects. Array of tagEdits for the child
//     tags of cfstoredproc.
//   storedProcParams - array of call params. Get this value from this.getDatabaseCall.
//
// RETURNS:
//   tagEditChildNodes - updates the cfprocparams in the array of tagEdits.
//--------------------------------------------------------------------

function SBStoredProcCF_getCFProcParamTagEdits(tagEditChildNodes, storedProcParams)
{
  // Update the cfprocparam tags.
  // First remove any cfprocparams that we are no longer using
  var indicesToRemove = new Array();
  for (var k = 0; k < tagEditChildNodes.length; ++k)
  {
    if (tagEditChildNodes[k].getTagName().toUpperCase() == "CFPROCPARAM")
    {
      var dbVarName = tagEditChildNodes[k].getAttribute("dbvarname");
      var bRemoveParam = true;

      for (var j = 0; bRemoveParam && j < storedProcParams.length; ++j)
      {
        if (storedProcParams[j].dbVarName.toUpperCase() == dbVarName.toUpperCase())
        {
          bRemoveParam = false
        }
      }
            
      if (bRemoveParam)
      {
        indicesToRemove.push(k);
      }
    }
  }
        
  // Cycle through the indices to remove and remove them. Note, we cycle through in
  //   reverse so higher indices are deleted first. This ensures that the smaller 
  //   indices are still valid after we've altered the array.
  for (k = indicesToRemove.length - 1; k > -1; --k)
  {
    tagEditChildNodes.splice(indicesToRemove[k], 1);
  }
                
  // Insert or update cfprocparams from our updated list.
  for (var k = 0; k < storedProcParams.length; ++k)
  {
    var dbVarName = storedProcParams[k].dbVarName;
    var varValue = storedProcParams[k].varValue;
    var cfSQLType = storedProcParams[k].cfSQLType;
    var cfVarName = storedProcParams[k].cfVarName;
    var varType = storedProcParams[k].varType;
          
    var bFoundPriorNode = false;
    for (var j = 0; !bFoundPriorNode && j < tagEditChildNodes.length; ++j)
    {
      // Found the prior node, so update it.
      var oldDBVarName = tagEditChildNodes[j].getAttribute("dbvarname");
      if (oldDBVarName && oldDBVarName.toUpperCase() == dbVarName.toUpperCase())
      {
        bFoundPriorNode = true;
              
        // Note: we are blindly updating the node. At this point, we assume
        //   error checking is already complete.
        var priorSQLType = tagEditChildNodes[j].getAttribute("cfsqltype");
        if (!priorSQLType || priorSQLType.toUpperCase() != cfSQLType.toUpperCase())
        {
          tagEditChildNodes[j].setAttribute("cfsqltype", cfSQLType);
        }

        var priorVarType = tagEditChildNodes[j].getAttribute("type");
        if (!priorVarType || priorVarType.toUpperCase() != varType.toUpperCase())
        {
          tagEditChildNodes[j].setAttribute("type", varType);
        }
              
        // Since value is optional, remove it if empty.
        var priorVarValue = tagEditChildNodes[j].getAttribute("value");
        if (varValue == "")
        {
          tagEditChildNodes[j].removeAttribute("value");
        }
        else if (!priorVarValue || priorVarValue.toUpperCase() != varValue.toUpperCase())
        {
          tagEditChildNodes[j].setAttribute("value", varValue);
        }

        // Since cfvarname is optional, remove it if empty.
        var priorCFVarName = tagEditChildNodes[j].getAttribute("variable");
        if (cfVarName == "")
        {
          tagEditChildNodes[j].removeAttribute("variable");
        }
        else if (!priorCFVarName || priorCFVarName.toUpperCase() != cfVarName.toUpperCase())
        {
          tagEditChildNodes[j].setAttribute("variable", cfVarName);
        }              
      }
    }
          
    if (!bFoundPriorNode)
    {
      var procText = "<cfprocparam dbvarname=\"" + dbVarName + "\""
                   + " type=\"" + varType + "\""
                   + " cfsqltype=\"" + cfSQLType + "\""
                   + ((varValue) ?  (" value=\"" + varValue + "\"")      : "")
                   + ((cfVarName) ? (" variable=\"" + cfVarName + "\"") : "")
                   + ">";
      var newTagEdit = new TagEdit(procText);
      tagEditChildNodes.push(newTagEdit);
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.getCFProcResultTagEdits
//
// DESCRIPTION:
//   Helper function to queueCFStoredProcEdits. Adds edits to the cfprocresult tag
//   in the tagEdit array.
//
// ARGUMENTS:
//   tagEditChildNodes - array of tagEdit objects. Array of tagEdits for the child
//     tags of cfstoredproc.
//
// RETURNS:
//   tagEditChildNodes - updates the cfprocresult tag in the array of tagEdits.
//--------------------------------------------------------------------

function SBStoredProcCF_getCFProcResultTagEdits(tagEditChildNodes)
{
  // Update the cfprocresult tag.
  var newRSName = this.getRecordsetName();
  var bFoundPriorNode = false;
  for (var k = 0; !bFoundPriorNode && k < tagEditChildNodes.length; ++k)
  {
    if (tagEditChildNodes[k].getTagName().toUpperCase() == "CFPROCRESULT")
    {
      bFoundPriorNode = true;
      if (newRSName == null)
      {
        tagEditChildNodes.splice(k, 1);
      }
      else if (newRSName.toUpperCase() != tagEditChildNodes[k].getAttribute("name").toUpperCase())
      {
        tagEditChildNodes[k].setAttribute("name", newRSName);
      }
    }
  }
          
  if (!bFoundPriorNode && newRSName)
  {
    var procResultText = "<cfprocresult name=\"" + newRSName + "\">";
    var newTagEdit = new TagEdit(procResultText);
    tagEditChildNodes.push(newTagEdit);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.getSQLForRecordsetBindings
//
// DESCRIPTION:
//   Returns the SQL statement that should be used to get the meta data
//   for this Recordset
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - sql statement
//--------------------------------------------------------------------

function SBStoredProcCF_getSQLForRecordsetBindings()
{
  // Not used in this subclass.
  return "";
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.getUserName
//
// DESCRIPTION:
//   retrieve the user name
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - user name. null if not set.
//--------------------------------------------------------------------

function SBStoredProcCF_getUserName()
{
  return this.getParameter(this.EXT_DATA_USER_NAME);
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.getPassword
//
// DESCRIPTION:
//   retrieve the password 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - password name. null if not set.
//--------------------------------------------------------------------

function SBStoredProcCF_getPassword()
{
  return this.getParameter(this.EXT_DATA_PASSWORD);
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.setUserName
//
// DESCRIPTION:
//   set the user name for the recordset. if in editable copy, set in preparation for updating
//   the SB instance.
//
// ARGUMENTS:
//   userName - string recordset user name
//
// RETURNS:
//   none
//
// ADDED BY: RCHRISTENSEN
//--------------------------------------------------------------------

function SBStoredProcCF_setUserName(userName)
{
  this.setParameter(this.EXT_DATA_USER_NAME, userName);
}


//--------------------------------------------------------------------
// FUNCTION:
//  SBStoredProcCF.setPassword
//
// DESCRIPTION:
//   set the password for the recordset. if in editable copy, set in preparation for updating
//   the SB instance.
//
// ARGUMENTS:
//   password - string recordset password
//
// RETURNS:
//   none
//
// ADDED BY: RCHRISTENSEN
//--------------------------------------------------------------------

function SBStoredProcCF_setPassword(password)
{
  this.setParameter(this.EXT_DATA_PASSWORD, password);
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.getStatusCodeVarName
//
// DESCRIPTION:
//   Get the variable name used to return the status code for the stored procedure.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBStoredProcCF_getStatusCodeVarName()
{
  return this.getParameter(this.EXT_DATA_STATUS_VARNAME);
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.setStatusCodeVarName
//
// DESCRIPTION:
//   Set the variable name used to return the status code for the stored procedure.
//
// ARGUMENTS:
//   statusCodeVarName - string. Variable name to use for the status code.
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBStoredProcCF_setStatusCodeVarName(statusCodeVarName)
{
  this.setParameter(this.EXT_DATA_STATUS_VARNAME, statusCodeVarName);
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.getRecordsetBindings
//
// DESCRIPTION:
//   Get the columns and column types for the recordset returned from the 
//   database call if a recordset is returned. First checks to see if
//   these values are cached. If not, it gets the info from the database and
//   caches the results.
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//   array - even elements (e.g. i) are column names, odd elements (e.g. i+1)
//     are column types. null if no recordset is returned from the database call.
//--------------------------------------------------------------------

function SBStoredProcCF_getRecordsetBindings()
{
  var bindingsAndTypeArray = null;
    
  // Check if the information is in the cache
  bindingsAndTypeArray = 
    SBDatabaseCall.schemaCache.getCachedColumnAndTypeArray(this.getRecordsetName());
  
  if (!bindingsAndTypeArray || !bindingsAndTypeArray.length) 
  {
    // Try to retrieve the information from database
    var connName = dwscripts.getCFDataSourceName(this.getConnectionName());
    var callParams = new Array();
    var procedureName = this.getDatabaseCall(callParams);
    var paramNames = new Array();
    var paramValues = new Array();
    this.getSPParamsAndTestVals(paramNames, paramValues, true);
    bindingsAndTypeArray = MMDB.getSPColumnListNamedParams(connName, procedureName, 
                           paramNames, paramValues, true);

    // Save it to the cache for future use
    var rsName = this.getRecordsetName();

    SBDatabaseCall.schemaCache.saveColumnAndTypeArrayForCache(rsName, bindingsAndTypeArray);
  }

  return bindingsAndTypeArray;
}


// Helper function used as last argument to dwscripts.findInArray for case
//   insensitive comparisons.
function caseInsensitiveCompare(object, searchValue)
{
  return (String(object).toUpperCase() == String(searchValue).toUpperCase());
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF_getSPParamsAndTestVals
//
// DESCRIPTION:
//   Get parameters and default values needed to test or get info about the recordset
//   returned from a SP. Looks first for the cached test value. If not cached,
//   checks if the runtime value and uses it if it is a literal value. If not, uses 
//   default value entered by the user. Otherwise, prompts the user for a value. 
//   Update the cache of values when done.
//
// ARGUMENTS:
//   outParamNames - empty array.
//   outParamValues - empty array.
//   bPromptIfNotFound - boolean. 'true' if should prompt the user to enter a
//     default/test value if we can't find it.
//
// RETURNS:
//   outParamNames - array of name strings. Ordering in array is parallel to
//     other variable array properties in the parameter object.
//   outParamValues - array of value strings. Parallel to outParamNames.
//--------------------------------------------------------------------

function SBStoredProcCF_getSPParamsAndTestVals(outParamNames, outParamValues, 
                                               bPromptIfNotFound)
{
  var bUpdateTestValueCache = false;
  var procedureName = this.getParameter(this.EXT_DATA_DB_CALL_TEXT);
  var dbVarNames = this.getParameter(this.EXT_DATA_DB_VAR_NAMES);
  var varDefaults = this.getParameter(this.EXT_DATA_VAR_DEFAULTS);
  var varValues = this.getParameter(this.EXT_DATA_VAR_VALUES);
  var varTypes = this.getParameter(this.EXT_DATA_VAR_TYPES);
  
  // If we must prompt the user for test values, give them an informational alert
  //   before the first prompt so the user understands what is going on. For example,
  //   the DBP calls this function for SP's and if we don't already have
  //   test values cached away, a prompt for them will appear. This prompt will be
  //   pretty disconcerting without a little background. This boolean tracks whether
  //   we've already displayed this informational alert.
  var bDisplayedTestValBackground = false;
  
  // Get the cached dbvarname test values. 
  var cachedParamValues = 
    SBDatabaseCall.schemaCache.getCachedParamTestValueArray(procedureName);
    
  // Declare array to track new cached param values if we don't already have them
  //   all cached.
  var newCachedParamValues = new Array();
  for (var i = 0; dbVarNames && i < dbVarNames.length; ++i)
  {
    outParamNames.push(dbVarNames[i]);
    newCachedParamValues.push(dbVarNames[i]);

    // We only care about the test value if it's an IN or INOUT parameter.
    var varDefault = null;
    if (varTypes[i] && varTypes[i].toUpperCase().indexOf("IN") != -1)
    {
      // Look first in the cached values.
      if (cachedParamValues)
      {
        // If dbvarname is found, the default value will be in the next element.
        var index = dwscripts.findInArray(cachedParamValues, dbVarNames[i],
                                          caseInsensitiveCompare);
        if (index != -1 && (index + 1 < cachedParamValues.length))
        {
          varDefault = cachedParamValues[index + 1];
        }
      }

      if (varDefault == null)
      {
        // Try using the runtime value if it's a literal value (i.e., it's not
        //   a variable reference surrounded by #'s).
        if (varValues[i].indexOf('#') == -1)
        {
          varDefault = varValues[i];
        }
        
        if (varDefault == null)
        {
          // Try using the default value entered by the user.
          varDefault = varDefaults[i];
  
          // If there is no default value, prompt the user for the test value.
          if (varDefault == null && bPromptIfNotFound)
          {
            var bUserPressedCancel = false;
            
            // Tell the user why we are prompting before the first prompt.
            if (!bDisplayedTestValBackground)
            {
              bUserPressedCancel = !confirm(dwscripts.sprintf(MM.MSG_EnterTestValuesToContinue, dwscripts.getRecordsetDisplayName()));
              bDisplayedTestValBackground = true;            
            }
            
            // Prompt user if hasn't cancelled yet.
            if (!bUserPressedCancel)
            {
              MM.paramName = dwscripts.stripChars(dbVarNames[i], "@");
              dw.runCommand("GetTestValue");
              bUserPressedCancel = !MM.clickedOK;
            }
                      
            // Grab the entered test value or bail if user doesn't want to continue.          
            if (!bUserPressedCancel)
            {
              varDefault = MM.retVal;
            }
            else
            {
              outParamNames.length = 0;
              outParamValues.length = 0;
              return;
            }
          }
        }
      
        // We'll need to update the cache because we couldn't find one of the 
        //   variable test values. However, only update it if we found a value
        //   for it. We don't want to write     
        if (varDefault != null)
        {
          bUpdateTestValueCache = true;
        }
      }
    }

    outParamValues.push(varDefault);
    newCachedParamValues.push(varDefault);
  }

  // If we didn't get all the test values from the cache, cache the new values.
  if (bUpdateTestValueCache && procedureName)
  {
    SBDatabaseCall.schemaCache.saveParamTestValueArrayForCache(procedureName, newCachedParamValues);
    
    // Also update the test values for live data.
    var varTestValues = new Array();
    for (var j = 1; j < newCachedParamValues.length; j += 2)
    {
      varTestValues.push(newCachedParamValues[j]);
    }
    this.setTestValuesForLiveData(varTestValues);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcCF.getSQLForTest
//
// DESCRIPTION:
//   Returns the SQL statement that should be used when displaying 
//   the test dialog.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - sql statement
//--------------------------------------------------------------------

function SBStoredProcCF_getSQLForTest()
{
  // Not used for stored proc.
  return "";
}


