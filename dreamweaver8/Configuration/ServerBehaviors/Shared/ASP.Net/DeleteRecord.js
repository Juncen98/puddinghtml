// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

var helpDoc = MM.HELP_sbASPNetDeleteRecord; 
var SB_NAME = dwscripts.getSBFileName();

// Constants for submit as formats

var _DeleteIfDefinedParameter = new ListMenu(SB_NAME, "DeleteIfDefinedParameter");
var _DeleteIfDefinedParameterValue = new TextField(SB_NAME, "DeleteIfDefinedParameterValue");
var _ConnectionName = new ConnectionMenu(SB_NAME, "ConnectionName");
var _TableName = new ConnectionTableMenu(SB_NAME, "TableName");
var _ColumnList = null; 
var _PrimaryKeySubmitAs = null; 
var _PrimaryKeyParameter = new ListMenu(SB_NAME, "PrimaryKeyParameter");
var _PrimaryKeyParameterValue = new TextField(SB_NAME, "PrimaryKeyParameterValue");
var _SuccessURL = new TextField(SB_NAME, "SuccessURL");
var _FailureURL = new TextField(SB_NAME, "FailureURL");
var _DebugInfo = new CheckBox(SB_NAME, "Debug");

// ***************** LOCAL FUNCTIONS  ******************

//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//   This function is called in the onLoad event.  It is responsible
//   for initializing the UI.  If we are inserting a recordset, this
//   is a matter of populating the connection drop down.
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
  
  _ConnectionName.initializeUI();
  
  var ifDefinedLabels = [MM.LABEL_NeverCheckIfParamIsDefined];
  var ifDefinedValues = [""];

  var paramTypeArray = dwscripts.getParameterTypeArray(true);

  _DeleteIfDefinedParameter.initializeUI(ifDefinedLabels.concat(paramTypeArray), 
                                         ifDefinedValues.concat(paramTypeArray));
  
  _DeleteIfDefinedParameterValue.initializeUI(); 
  _ConnectionName.initializeUI();
  _TableName.initializeUI();
  _ColumnList = new ListControl("ColumnList");

  _PrimaryKeySubmitAs = new ListControl("PrimaryKeySubmitAs", null, true);

  _PrimaryKeyParameter.initializeUI(paramTypeArray, paramTypeArray);
  _PrimaryKeyParameterValue.initializeUI(); 
  _SuccessURL.initializeUI();  
  _FailureURL.initializeUI(); 
  _DebugInfo.initializeUI(); 
  _DebugInfo.setCheckedState(true);

  updateUI("ConnectionName");
  updateUI("Debug");
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
  if (control == "DeleteIfDefinedParameter")
  {
    if (_DeleteIfDefinedParameter.getValue() == "")
    {
      _DeleteIfDefinedParameterValue.setValue(""); 
      _DeleteIfDefinedParameterValue.setDisabled(true); 
    }
    else
    {
      _DeleteIfDefinedParameterValue.setDisabled(false);       
    }
  }
  else if (control == "ConnectionName")
  {
    var databaseType = MMDB.getDatabaseType(_ConnectionName.getValue());
    var theTypes = SBDatabaseCallASPNET.getParamTypeList(databaseType);

    _PrimaryKeySubmitAs.setAll(theTypes, theTypes);
    _TableName.updateUI(_ConnectionName, event);
  }
  else if (control == "Define")
  {
    _ConnectionName.launchConnectionDialog();
  }   
  else if (control == "TableName")
  {
    // Update the ColumnList

    var connName = _ConnectionName.getValue();
	var databaseType = MMDB.getDatabaseType(connName);
	var columnInfo = dwscripts.getColumnValueList(connName, _TableName.getValue());
    var names = new Array();
    var keyColumnName = null;
    
	for (var i = 0; i < columnInfo.length; i++)
    {
	  var columnName = columnInfo[i].getColumnName();

      // Determine the primary key so we can select it by default. (Must be done
      //   before setting default mapping because we mark all columns as keys by
      //   default in this case).
      
	  if (columnInfo[i].getIsPrimaryKey() && !keyColumnName)
      {
        keyColumnName = columnName;
      }
      
      names.push(columnName);

	  columnInfo[i].setVariableName(columnName);
	  setDefaultSubmitAs(columnInfo[i], databaseType);
    }
    
	_ColumnList.setAll(names, columnInfo);

    // Set selection to table primary key if we found one.
    
	if (keyColumnName)
    {
      _ColumnList.pick(keyColumnName);
    }
    
    updateUI("ColumnList");
  }
  else if (control == "ColumnList")
  {
    var columnInfo = _ColumnList.getValue();

    if (columnInfo)
    {
      _PrimaryKeySubmitAs.pickValue(columnInfo.getSubmitAs());
      _PrimaryKeyParameter.pickValue(columnInfo.getParamType());
      _PrimaryKeyParameterValue.setValue(columnInfo.getVariableName());
    }
  }
  else if (control == "PrimaryKeySubmitAs")
  {
    if (event == "onChange")
    {
      var columnInfo = _ColumnList.getValue();

      if (columnInfo)
      {
        columnInfo.setSubmitAs(_PrimaryKeySubmitAs.getValue());
      }
    }
  }
  else if (control == "PrimaryKeyParameterValue")
  {
    if (event == "onBlur")
    {
      var columnInfo = _ColumnList.getValue();

      if (columnInfo)
      {
        columnInfo.setVariableName(_PrimaryKeyParameterValue.getValue());
      }
    }
  }
  else if (control == "PrimaryKeyParameter")
  {
    if (event == "onChange")
    {
      var columnInfo = _ColumnList.getValue();

      if (columnInfo)
      {
        columnInfo.setParamType(_PrimaryKeyParameter.getValue());
      }
    }
  }
  else if (control == "SuccessURL")
  {
    var theSuccessURL = dw.browseForFileURL("select", MM.LABEL_FileRedirect,0,0); 
    
    if (theSuccessURL.length > 0)
    {
      _SuccessURL.setValue(theSuccessURL); 
    }    
  }
  else if (control == "FailureURL")
  {
    var theFailureURL = dw.browseForFileURL("select", MM.LABEL_FileRedirect,0,0); 
    
    if (theFailureURL.length > 0)
    {
      _FailureURL.setValue(theFailureURL); 
    }    
  }
  else if (control == "Debug")
  {
    _FailureURL.setDisabled(_DebugInfo.getCheckedState());
  }
  else 
  {
    alert("The following control does not exist: " + control); 
  }
}

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
  var sbArray = new Array(); 

  sbArray = dwscripts.findSBs(MM.LABEL_TitleDeleteRecord, SBDeleteRecord);
  
  for (var i=0; i < sbArray.length; i++)
  {
    sbArray[i].postProcessFind("DeleteRecord_main", MM.LABEL_TitleDeleteRecord);
  }

  return sbArray;
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
  return true;
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
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   string - empty upon success, or an error message
//--------------------------------------------------------------------

function applyServerBehavior(sbObj)
{
  var newObj = null; 

  if (sbObj)
  {
    newObj = sbObj.makeEditableCopy();
  }
  else
  {
    newObj = new SBDeleteRecord();
  }
  
  if (!updateSBObjFromUI(newObj) || !newObj.checkData())
  {
    return newObj.getErrorMessage();
  }

  try
  {
    if (newObj)
    {
      dwscripts.fixUpSelection(dw.getDocumentDOM(), true, true);
      dwscripts.applySB(newObj.getParameters(), sbObj);

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
//   updateSBObjFromUI()
//
// DESCRIPTION:
//   Populate object from dialog.
//
// ARGUMENTS:
//   EditOpsASPNET
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function updateSBObjFromUI(newObj)
{
  var isValid = true;
  var errStr;
  var params = newObj.getParameters();

  newObj.setErrorMessage("");

  do
  {
    errStr = _ConnectionName.applyServerBehavior(newObj, params);
    
	if (errStr)
	{
      newObj.appendErrorMessage(errStr);
	  isValid = false;
	  break;
	}

	var deleteIfDefined = "";
  
    if (_DeleteIfDefinedParameter.getValue() != "")
    {
      var paramType = _DeleteIfDefinedParameter.getValue();
      var paramValue = _DeleteIfDefinedParameterValue.getValue();
    
      if (!dwscripts.isValidVarName(paramValue))
      {
        newObj.appendErrorMessage(MM.MSG_InvalidCheckIfIsDefinedVarName);
		isValid = false;
	  }
	  
	  deleteIfDefined = dwscripts.getParameterExpressionFromType(paramType, paramValue);
    }
	else
	{
	  var paramType = _PrimaryKeyParameter.getValue();
      var paramValue = _PrimaryKeyParameterValue.getValue();
      deleteIfDefined = dwscripts.getParameterExpressionFromType(paramType, paramValue);
    }

    newObj.setExpression((deleteIfDefined != "") ? deleteIfDefined : null);

    errStr = _TableName.applyServerBehavior(newObj, params);
 
    if (errStr)
	{
      newObj.appendErrorMessage(errStr);
      isValid = false;
	  break;
    }

    // Parmeters

    var columnInfo = _ColumnList.getValue();
  
    if (columnInfo)
    {
      var paramNames = new Array();
      var paramRuntimes = new Array(); 
      var paramTypes = new Array(); 

      var paramName = "@" + columnInfo.getColumnName();
	  var paramType = _PrimaryKeyParameter.getValue();
      var paramValue = _PrimaryKeyParameterValue.getValue();
      var runtime = dwscripts.getParameterCodeFromType(paramType, paramValue, "");
	  
	  if (!dwscripts.isValidVarName(paramValue))
      {
        newObj.appendErrorMessage(MM.MSG_InvalidPrimaryKeyVarName);
		isValid = false;
      }  

      paramNames.push(paramName);
	  paramRuntimes.push(runtime);     
      paramTypes.push(columnInfo.getSubmitAs());

      newObj.setVarNames(paramNames);
      newObj.setVarRuntimes(paramRuntimes);
      newObj.setVarTypes(paramTypes);

      // If the database type is OleDb, then use "?" as the parameter
	  // in the where clause, otherwise, use a named parameter.

      var databaseType = MMDB.getDatabaseType(_ConnectionName.getValue());
	  var whereParam = (databaseType.toLowerCase() == "oledb") ? "?" : paramName;
   
	  columnInfo.setRuntimeValue(whereParam);

      // Create single-entry list to pass to setSqlStatement()

      var columnInfoList = new Array();
      columnInfoList.push(columnInfo);
  
      newObj.setColumnList(columnInfoList);
      newObj.setSQLStatement(newObj.getTableName(), columnInfoList);
    }

    _SuccessURL.applyServerBehavior(newObj, params);

	// Not calling applyServerBehavior() for _FailureURL because
	// we want to write it out even if it's disabled

    newObj.setFailureURL(_FailureURL.getValue());
	newObj.transformURLs(true);
	
    _DebugInfo.applyServerBehavior(newObj, params);
  }
  while (false);

  return isValid;
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
  sbObj.transformURLs(false);

  _ConnectionName.inspectServerBehavior(sbObj);
  _TableName.inspectServerBehavior(sbObj);
  _FailureURL.inspectServerBehavior(sbObj);
  _SuccessURL.inspectServerBehavior(sbObj);
  _DebugInfo.inspectServerBehavior(sbObj);

  // Update the ColumnList
  
  var databaseType = MMDB.getDatabaseType(_ConnectionName.getValue());
  var columnInfo = sbObj.initColumnList();
  var names = new Array();
  var indexPrimaryKey = (-1);
  
  for (var i = 0; i < columnInfo.length; i++)
  {
    names.push(columnInfo[i].getColumnName());
    
    // Set the selection to the first column that has a runtime value and is a primary
    //   key. Note that only one column should have a runtime value for this server
    //   behavior. For all other items, set default values for the Submit As and runtime
    //   value.
    
	if ((indexPrimaryKey == (-1)) &&
			columnInfo[i].getIsPrimaryKey() &&
			columnInfo[i].getRuntimeValue())
    {
      indexPrimaryKey = i;
    }
    else
    {
      setDefaultSubmitAs(columnInfo[i], databaseType);
    }
  }

  _ColumnList.setAll(names, columnInfo);
  _ColumnList.setIndex(indexPrimaryKey);
  
  _PrimaryKeyParameter.pickValue(columnInfo[indexPrimaryKey].getParamType());
  _PrimaryKeyParameterValue.setValue(columnInfo[indexPrimaryKey].getVariableName());

  // If the parameter and value for the "Delete If Defined" field match
  // those for the primary key, then assume that "Primary Key" should be
  // selected in the "Delete If Defined" field.

  var deleteIfDefined = sbObj.getExpression();
  
  if (deleteIfDefined)
  {
    var paramInfo = dwscripts.getParameterTypeFromExpression(deleteIfDefined);

    if (paramInfo)
    {
	  if ((paramInfo.varType == columnInfo[indexPrimaryKey].getParamType()) &&
          (paramInfo.varNameOrValue == columnInfo[indexPrimaryKey].getVariableName()))
	  {
        _DeleteIfDefinedParameter.pickValue("");
        _DeleteIfDefinedParameterValue.setValue("");
	  }
	  else
	  {
        _DeleteIfDefinedParameter.pickValue(paramInfo.varType);
        _DeleteIfDefinedParameterValue.setValue(paramInfo.varNameOrValue);
	  }
    }
  }
  
  updateUI("ColumnList", "onInspect");
  updateUI("Debug");
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
  dwscripts.displayDWHelp(helpDoc);
}

