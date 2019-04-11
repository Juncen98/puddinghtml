// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

var helpDoc = MM.HELP_sbASPNetStoredProc; 
var SB_FILENAME = dwscripts.getSBFileName();
var STATIC_LENGTH = 190;

var _ProcedureID = new TextField(SB_FILENAME, "RecordsetName");
var _ConnectionName = new ConnectionMenu(SB_FILENAME, "ConnectionName");
var _StoredProcName = new ConnectionStoredProcMenu(SB_FILENAME, "Procedure"); 
var _ParamList = new ListControl("ParamList");
var _ParamName = null;
var _ParamType = null;
var _ParamSize = null;
var _ParamDirection = null;
var _ParamValue = null;
var _ParamTestValue = null;
var _BuildRuntimeButton = null;
var _TestButton = null;
var _ParamEditBtn = null;
var _ParamDeleteBtn = null;
var _DatabaseType = null;
var _SuccessURL = new TextField(SB_FILENAME, "SuccessURL");
var _FailureURL = new TextField(SB_FILENAME, "FailureURL");
var _DebugInfo = new CheckBox(SB_FILENAME, "Debug");
var _FailureURLBrowseButton = null;

// ***************** LOCAL FUNCTIONS ******************

function initializeUI()
{
  // Get the UI elements

  _ProcedureID.initializeUI();
  _ConnectionName.initializeUI();
  _StoredProcName.initializeUI(_ConnectionName);
  _SuccessURL.initializeUI();  
  _FailureURL.initializeUI(); 
  _DebugInfo.initializeUI(); 
  _FailureURLBrowseButton = dwscripts.findDOMObject("FailureURLBrowseButton");

  _ParamName = dwscripts.findDOMObject("ParamName");
  _ParamType = dwscripts.findDOMObject("ParamType");
  _ParamSize = dwscripts.findDOMObject("ParamSize");
  _ParamDirection = dwscripts.findDOMObject("ParamDirection");
  _ParamValue = dwscripts.findDOMObject("ParamValue");
  _ParamTestValue = dwscripts.findDOMObject("ParamTestValue");

  // set the readonly param properties
  _ParamName.innerHTML = dwscripts.entityNameEncode(MM.LABEL_ParamAttributesName);
  _ParamType.innerHTML = dwscripts.entityNameEncode(MM.LABEL_ParamAttributesType);
  _ParamSize.innerHTML = dwscripts.entityNameEncode(MM.LABEL_ParamAttributesSize);
  _ParamDirection.innerHTML = dwscripts.entityNameEncode(MM.LABEL_VarType);
  _ParamValue.innerHTML = dwscripts.entityNameEncode(MM.LABEL_ParamAttributesValue);
  _ParamTestValue.innerHTML = dwscripts.entityNameEncode(MM.LABEL_VarTestValue);

  _ReturnsRecordset = dwscripts.findDOMObject("ReturnsRecordset"); 
  _PlusBtn = dwscripts.findDOMObject("plusButton"); 
  _TestButton = dwscripts.findDOMObject("TestButton"); 
  _ParamEditBtn = dwscripts.findDOMObject("EditParam"); 
  _ParamDeleteBtn = dwscripts.findDOMObject("DeleteParam"); 

  var tempStoredProc = new SBStoredProcASPNET();
  _ProcedureID.setValue(tempStoredProc.getUniqueProcedureId());

  _DebugInfo.setCheckedState(true);

  updateUI("Debug");

  onParameterChanged();
}

function updateUI(control, event)
{
  if (control == "ConnectionName")
  { 
    _StoredProcName.updateUI(_ConnectionName, event);
	_DatabaseType = MMDB.getDatabaseType(_ConnectionName.getValue());

    updateUI("Procedure", "onChange");
  }
  else if (control == "Procedure")
  {
    onProcedureChange();
  }
  else if (control == "Define")
  {
    var before = _ConnectionName.getValue();

    _ConnectionName.launchConnectionDialog();

	if (before != _ConnectionName.getValue())
	{
	  updateUI("ConnectionName");
	}
  }
  else if (control == "ParamList")
  {
    onParameterChanged();
  }
  else if (control == "EditParam")
  {
    var param = _ParamList.getValue();
    var cmdArgs = new Array();
    
	cmdArgs[0] = param.name;
	cmdArgs[1] = param.type;
	cmdArgs[2] = param.size;
	cmdArgs[3] = param.direction;
	cmdArgs[4] = param.testValue;
	cmdArgs[5] = param.runtime;
    cmdArgs[6] = _DatabaseType;
	    
	var ret = dwscripts.callCommand("EditASPNETSprocParam", cmdArgs);
    
	if (ret && (ret.length > 5))
    {
	  param.name = ret[0];
	  param.type = ret[1];
	  param.size = ret[2];
	  param.direction = ret[3];
	  param.testValue = ret[4];
	  param.runtime = ret[5];

      onParameterChanged();
    }
  }
  else if (control == "DeleteParam")
  {
    var param = _ParamList.getValue();
    
	if (param)
	{
	  _ParamList.del();
	  onParameterChanged();
	}
  }
  else if (control == "TestButton")
  {
    PopUpTestDialog();
  }
  else if (control == "ReturnsRecordset")
  {
    updateRSNameAndTest();
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
    var debugEnabled = _DebugInfo.getCheckedState();

    _FailureURL.setDisabled(debugEnabled);

    if (debugEnabled)
	{
	  _FailureURLBrowseButton.setAttribute("disabled", "disabled");
	}
	else
	{
	  _FailureURLBrowseButton.removeAttribute("disabled");
	}
  }
}

function updateRSNameAndTest()
{
  // If the ReturnsRecordset is set to false, disable recordset name control - otherwise enable it
  
  if (_ReturnsRecordset.checked)
  {
	_TestButton.removeAttribute("disabled"); 
  }
  else 
  {
    _TestButton.setAttribute("disabled", "disabled"); 
  }
}

function updateButtons()
{
  var param = _ParamList.getValue();

  if (param)
  {
	_ParamEditBtn.removeAttribute("disabled");   
	_ParamDeleteBtn.removeAttribute("disabled");   
  }
  else
  {
    _ParamEditBtn.setAttribute("disabled","disabled"); 
    _ParamDeleteBtn.setAttribute("disabled","disabled"); 
  }
}

function onProcedureChange()
{
  var conName = _ConnectionName.getValue(); 
  var spName = _StoredProcName.getValue(); 

  // Clear out the old stored proc parameters

  var paramNames = new Array();
  var paramObjs = new Array();

  if (conName && spName) 
  {
    // Retrieve stored procedure's parameters and update the parameter list

    var databaseType = MMDB.getDatabaseType(conName);
	var encodedSPParamsString = MMDB.getSPParamsAsString(conName, spName); 
   	var paramRegExp = /name:([^;]+);direction:([^;]+);datatype:([^;]+);/ig;
    
	while (paramRegExp.exec(encodedSPParamsString))
    {
      var param = new Object();
      var columnType = dwscripts.getDBColumnTypeEnum(RegExp.$3);

	  // Oracle uses REF CURSORs for returning recordsets, but
	  // we don't support them.

	  if ((columnType != 900) && (columnType != 13))
	  {
	    param.name = RegExp.$1;
        param.direction = SBDatabaseCallASPNET.getParamDirection(Number(RegExp.$2));
        param.type = dwscripts.getDBColumnTypeAsString(columnType, databaseType);
	    param.runtime = "";
        param.testValue = "";
        param.size = "";

		// If it's an output parameter and the type
		// doesn't have a fixed length, suggest one.
		
		if (SBDatabaseCallASPNET.isOutputParam(param.direction) &&
		    SBDatabaseCallASPNET.isVariableLengthType(param.type))
		{
		  param.size = "255";
		}
			        
	    paramNames.push(param.name);
	    paramObjs.push(param);
	  }
    } 
	   
    paramRegExp.lastIndex = 0;
  }

  _ParamList.setAll(paramNames, paramObjs);
  
  updateUI("ParamList", "onChange");

  _ReturnsRecordset.checked = false;

  updateRSNameAndTest();
}

function onParameterChanged()
{
  var paramName = "";
  var paramType = "";
  var paramValue = "";
  var paramSize = "";
  var paramDirection = "";
  var paramTestValue = "";

  var param = _ParamList.getValue();

  if (param)
  {
    paramName = param.name;
    paramType = param.type;
    paramValue = param.runtime;
    paramSize = param.size;
    paramDirection = param.direction;
	paramTestValue = param.testValue;
  }

  var shortParamName = dw.shortenString(MM.LABEL_ParamAttributesName + paramName, STATIC_LENGTH, false);
  _ParamName.innerHTML = dwscripts.entityNameEncode(shortParamName);
  
  var shortParamType = dw.shortenString(MM.LABEL_ParamAttributesType + paramType, STATIC_LENGTH, false);
  _ParamType.innerHTML = dwscripts.entityNameEncode(shortParamType);

  var shortParamSize = dw.shortenString(MM.LABEL_ParamAttributesSize + paramSize, STATIC_LENGTH, false);
  _ParamSize.innerHTML = dwscripts.entityNameEncode(shortParamSize);

  var shortParamDirection = dw.shortenString(MM.LABEL_VarType + paramDirection, STATIC_LENGTH, false);
  _ParamDirection.innerHTML = dwscripts.entityNameEncode(shortParamDirection);

  // Don't show these for output/return value parameters

  if (paramDirection.toUpperCase().indexOf("INPUT") != (-1))
  {
    var shortParamValue = dw.shortenString(MM.LABEL_ParamAttributesValue + paramValue, STATIC_LENGTH, false);
    _ParamValue.innerHTML = dwscripts.entityNameEncode(shortParamValue);

    var shortParamTestValue = dw.shortenString(MM.LABEL_VarTestValue + paramTestValue, STATIC_LENGTH, false);
    _ParamTestValue.innerHTML = dwscripts.entityNameEncode(shortParamTestValue);
  }
  else
  {
    _ParamValue.innerHTML = MM.LABEL_ParamPlaceholder;
    _ParamTestValue.innerHTML = MM.LABEL_ParamPlaceholder;
  }

  updateButtons();
}

function updateSBObjFromUI(newObj)
{
  var isValid = true;
  var errStr;
  var params = newObj.getParameters();

  newObj.setErrorMessage("");

  do
  {
	_ProcedureID.applyServerBehavior(newObj, params);

	errStr = _ConnectionName.applyServerBehavior(newObj, params);
    
	if (errStr)
	{
      newObj.appendErrorMessage(errStr);
	  isValid = false;
	  break;
	}

    // Update parameters
  
    var params = _ParamList.getValue('all');
    var procName = _StoredProcName.getValue();
  
    newObj.setDatabaseCall((procName) ? procName : "", params);
    newObj.setCreateDataSet(_ReturnsRecordset.checked ? "true" : "false");
    newObj.setSuccessURL(_SuccessURL.getValue());
    newObj.setFailureURL(_FailureURL.getValue());
	newObj.transformURLs(true);
    newObj.setDebug(_DebugInfo.getCheckedState());
  }
  while (false);

  return isValid;
}

function PopUpTestDialog()
{
  var newObj = new SBStoredProcASPNET();
  
  if (!updateSBObjFromUI(newObj) || !newObj.checkData(true))
  {
    alert(newObj.getErrorMessage());
  }
  else
  {
    // Get test values for parameters
    
    var paramNames = _ParamList.get('all');
    var paramValues = new Array();
    
    for (var i = 0; i < paramNames.length; ++i)
    {
      paramValues.push(_ParamList.getValue(i).testValue);
    }
	
    var connName = newObj.getConnectionName();
   	var procedureName = newObj.getProcedureName();    

	MMDB.showSPResultsetNamedParams(connName, procedureName, paramNames, paramValues);
  }
}

// ******************* Server Behavior API ***************************

function findServerBehaviors()
{
  var sbList = dwscripts.findSBs(MM.LABEL_TitleStoredProc + " (@@RecordsetName@@)", SBStoredProcASPNET);

  for (var i = 0; i < sbList.length; i++)
  {
    sbList[i].postProcessFind("StoredProc_main");
  }

  return sbList;
}

function canApplyServerBehavior(sbObj)
{
  dwscripts.canApplySB(sbObj, false); // preventNesting is false
  return true;
}

function applyServerBehavior(oldSB)
{
  var newObj = (oldSB != null) ? oldSB.makeEditableCopy() : new SBStoredProcASPNET();
  
  if (!updateSBObjFromUI(newObj))
  {
    return newObj.getErrorMessage();
  }

  if (!newObj.checkData(false))
  {
    return newObj.getErrorMessage();
  }

  try
  {
    if (newObj != null)
    {
	  if (oldSB != null)
	  {
        // Update references to the recordset on name change.
        // We want the call to updateRecordsetRefs() to do the
	    // name change, force the new name back to the old
	  
	    newObj.updateRecordsetRefs(MM.MSG_UpdateStoredProcRefs);
        newObj.applyParameters[newObj.EXT_DATA_RS_NAME] = newObj.parameters[newObj.EXT_DATA_RS_NAME];
      }

	  dwscripts.fixUpSelection(dw.getDocumentDOM(), true, true);
      dwscripts.applySB(newObj.getParameters(), oldSB);

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

function inspectServerBehavior(sbObj)
{
  sbObj.transformURLs(false);

  var params = new Array();
  var storedProcName = sbObj.getDatabaseCall(params);
  var procedureId = sbObj.getRecordsetName();
  
  if (!procedureId)
  {
    procedureId = sbObj.getUniqueProcedureId();
  }

  _ProcedureID.setValue(procedureId);
  _ConnectionName.inspectServerBehavior(sbObj);

  _StoredProcName.pickValue(storedProcName);

  _FailureURL.inspectServerBehavior(sbObj);
  _SuccessURL.inspectServerBehavior(sbObj);
  _DebugInfo.inspectServerBehavior(sbObj);

  updateUI("Debug");

  // Update the stored procedure parameter list and the parameter list.
  
  var paramNames = new Array();
  
  for (var i = 0; i < params.length; ++i)
  {
    paramNames.push(params[i].name);
  }

  _ParamList.setAll(paramNames, params);

  updateUI("ParamList", "onChange");

  _ReturnsRecordset.checked = sbObj.createsDataSet();

  updateRSNameAndTest();
}

function deleteServerBehavior(sbObj)
{
  dwscripts.deleteSB(sbObj);
  
  var rsName = sbObj.getRecordsetName();

  if (rsName)
  {
    SBDatabaseCall.schemaCache.removeCachedSchemaInfo(rsName);
  }

  SBDatabaseCall.schemaCache.removeCachedSchemaInfo(sbObj.getProcedureName());
  MMDB.refreshCache(true);
}

function analyzeServerBehavior(sbObj, allRecs)
{
  sbObj.analyze();
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
