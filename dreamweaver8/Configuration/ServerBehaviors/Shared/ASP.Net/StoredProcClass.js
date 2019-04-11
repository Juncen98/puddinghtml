// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// Inherit from the SBRecordsetASPNET class

SBStoredProcASPNET.prototype.__proto__ = SBRecordsetASPNET.prototype;

SBStoredProcASPNET.prototype.initSBStoredProcASPNET = SBStoredProcASPNET_initSBStoredProcASPNET;
SBStoredProcASPNET.prototype.checkRecordsetName = SBStoredProcASPNET_checkRecordsetName;
SBStoredProcASPNET.prototype.checkDatabaseCall = SBStoredProcASPNET_checkDatabaseCall;
SBStoredProcASPNET.prototype.createsDataSet = SBStoredProcASPNET_createsDataSet;
SBStoredProcASPNET.prototype.getProcedureName = SBStoredProcASPNET_getProcedureName;
SBStoredProcASPNET.prototype.setCreateDataSet = SBStoredProcASPNET_setCreateDataSet;
SBStoredProcASPNET.prototype.getSPParamsAndTestVals = SBStoredProcASPNET_getSPParamsAndTestVals;
SBStoredProcASPNET.prototype.getUniqueProcedureId = SBStoredProcASPNET_getUniqueProcedureId;
SBStoredProcASPNET.prototype.getSQLForRecordsetBindings = SBStoredProcASPNET_getSQLForRecordsetBindings;
SBStoredProcASPNET.prototype.getRecordsetBindings = SBStoredProcASPNET_getRecordsetBindings;
SBStoredProcASPNET.prototype.setDatabaseCall = SBStoredProcASPNET_setDatabaseCall;
SBStoredProcASPNET.prototype.getDatabaseCall = SBStoredProcASPNET_getDatabaseCall;
SBStoredProcASPNET.prototype.isCallObject = SBStoredProcASPNET_isCallObject;


// PUBLIC PROPERTIES
// CLASS CONSTANTS
// Override of RecordsetSB.prototype.EXT_DATA_* constants. Stores names of
// common extension data elements. See RecordsetSB.prototype.EXT_DATA_* for 
// details. 

SBStoredProcASPNET.prototype.EXT_DATA_CREATE_DATASET	= "CreateDataSet";

//--------------------------------------------------------------------

function SBStoredProcASPNET(name, title, selectedNode)
{
  this.initSBStoredProcASPNET((name) ? name : "StoredProc", title, selectedNode);
}

function SBStoredProcASPNET_initSBStoredProcASPNET(name, title, selectedNode)
{
  // First, initialize base class

  this.initSBRecordsetASPNET(name, title, selectedNode);

  this.setParameter(this.EXT_DATA_CREATE_DATASET, "false");
}

function SBStoredProcASPNET_setDatabaseCall(storedProcName, storedProcParams)
{
  var paramNames = new Array();
  var paramRuntimes = new Array();
  var paramTypes = new Array();
  var paramSizes = new Array();
  var paramDirections = new Array();
  var varNameAndTestValues = new Array();
  //var varTestValues = new Array();

  if (storedProcParams != null)
  {
    for (var i = 0; i < storedProcParams.length; ++i)
    {
      var param = storedProcParams[i];
      
      paramNames.push(param.name);
      paramRuntimes.push(param.runtime);
      paramTypes.push(param.type);
      paramSizes.push(param.size);
      paramDirections.push(param.direction);

	  // The cache function expects an array of even elements as the var name,
      // and odd elements as the test value.
      
	  if (SBDatabaseCallASPNET.isInputParam(param.direction))
	  {
	    varNameAndTestValues.push(param.name);
        varNameAndTestValues.push(param.testValue);
      }

	  // The live data cache expects just the test values
      // TODO: varTestValues.push(param.testValue);
    }
  
    if (storedProcName)
    {
      SBDatabaseCall.schemaCache.saveParamTestValueArrayForCache(storedProcName, varNameAndTestValues);  
	  // TODO: this.setTestValuesForLiveData(varTestValues);
    }
  }

  this.setParameter(this.EXT_DATA_SQL, dwscripts.trim(storedProcName));
  this.setParameter(this.EXT_DATA_SQL_VAR_NAME, paramNames);
  this.setParameter(this.EXT_DATA_SQL_VAR_RUNTIME, paramRuntimes);
  this.setParameter(this.EXT_DATA_SQL_VAR_TYPE, paramTypes);
  this.setParameter(this.EXT_DATA_SQL_VAR_SIZE, paramSizes);
  this.setParameter(this.EXT_DATA_SQL_VAR_DIRECTION, paramDirections);
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBStoredProcASPNET.isCallObject
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

function SBStoredProcASPNET_isCallObject()
{
  return true; 
}


function SBStoredProcASPNET_getDatabaseCall(storedProcParams)
{
  var storedProcName = this.getParameter(this.EXT_DATA_SQL);

  if (storedProcParams != null)
  {
    // Populate the sql parameters array with the variable values

    var paramRuntimes = this.getParameter(this.EXT_DATA_SQL_VAR_RUNTIME);
    
	if (paramRuntimes && (paramRuntimes.length > 0))
	{
	  var paramNames = this.getParameter(this.EXT_DATA_SQL_VAR_NAME);
      var paramTypes = this.getParameter(this.EXT_DATA_SQL_VAR_TYPE);
      var paramSizes = this.getParameter(this.EXT_DATA_SQL_VAR_SIZE);
      var paramDirections = this.getParameter(this.EXT_DATA_SQL_VAR_DIRECTION);
      var cachedTestValues = SBDatabaseCall.schemaCache.getCachedParamTestValueArray(storedProcName);

  	  for (var j = 0; j < paramRuntimes.length; j++) 
      {
        var param = new Object();

	    param.name = paramNames[j];
 	    param.runtime = paramRuntimes[j];
        param.type = paramTypes[j];
	    param.size = paramSizes[j];
	    param.direction = paramDirections[j];
        param.testValue = "";

	    if (cachedTestValues && SBDatabaseCallASPNET.isInputParam(param.direction))
        {
          var index = dwscripts.findInArray(cachedTestValues, param.name, caseInsensitiveCompare);

		  if ((index != (-1)) && ((index + 1) < cachedTestValues.length))
          {
            param.testValue = cachedTestValues[index + 1];
          }
        }

        storedProcParams.push(param);
      }
    }
  }

  return storedProcName;
}

function SBStoredProcASPNET_checkRecordsetName(bIsForTest)
{
  var isValidRS = true;

  if (!bIsForTest)
  {
    // Check for valid recordset name
 	
	var theName = this.getRecordsetName();

    if ((theName == null) || theName == "")
    {
      isValidRS = false      
      this.appendErrorMessage(MM.MSG_NoStoredProcName);
    }
    else
    {
      if (!dwscripts.isValidVarName(theName))
      {
        isValidRS = false      
        this.appendErrorMessage(MM.MSG_InvalidStoredProcName);
      }
  
      var oldName;
	  
	  if (this.bInEditMode)
	  {
	    oldName = this.parameters[this.EXT_DATA_RS_NAME];
      }

	  if (!this.isUniqueRecordsetName(theName, oldName))
      {
        isValidRS = false      
        this.appendErrorMessage(MM.MSG_DupeStoredProcName);
      }

      if (dwscripts.isReservedWord(theName))
      {
        isValidRS = false      
        this.appendErrorMessage(dwscripts.sprintf(MM.MSG_ReservedWord, theName));
      }
    }
  }

  return isValidRS;
}

function SBStoredProcASPNET_checkDatabaseCall(bIsForTest)
{
  var isValidSproc = true;
  var params = new Array();
  var procedure = this.getDatabaseCall(params);

  if (dwscripts.stripChars(procedure, " \r\n\t") == "")
  {
    isValidSproc = false;
    this.appendErrorMessage(MM.MSG_NoStoredProcText);
  }

  // TODO: Check for correct number of parameters

  // Check to make sure all input parameters have
  // runtime and test values defined

  for (var i = 0; i < params.length; i++)
  {
    var direction = params[i].direction.toUpperCase();
         
    if (SBDatabaseCallASPNET.isInputParam(direction))
	{
	  if ((params[i].runtime == null) || (params[i].runtime == ""))
	  {
	    isValidSproc = false;
        this.appendErrorMessage(MM.MSG_RunTimeValMissing + params[i].name);
	  }

	  if ((params[i].testValue == null) || (params[i].testValue == ""))
	  {
	    isValidSproc = false;
        this.appendErrorMessage(dwscripts.sprintf(MM.MSG_MissingParamTestValue, params[i].name));
	  }
    }
	else if (SBDatabaseCallASPNET.isOutputParam(direction))
	{
	  if (SBDatabaseCallASPNET.isVariableLengthType(params[i].type) &&
	      (params[i].size <= 0))
	  {
	    isValidSproc = false;
        this.appendErrorMessage(dwscripts.sprintf(MM.MSG_MissingParamSize, params[i].name));
	  }
	}
  }

  return isValidSproc;
}

function SBStoredProcASPNET_setCreateDataSet(createDataSet)
{
  this.setParameter(this.EXT_DATA_CREATE_DATASET, createDataSet); 
}

function SBStoredProcASPNET_createsDataSet()
{
  return (this.getParameter(this.EXT_DATA_CREATE_DATASET) == "true");
}

function SBStoredProcASPNET_getProcedureName()
{
  return this.getParameter(this.EXT_DATA_SQL);
}

function SBStoredProcASPNET_getSQLForRecordsetBindings()
{
  // Not used in this subclass
  return "";
}

function SBStoredProcASPNET_getUniqueProcedureId()
{ 
  var procId = "";
  var uniqueName = false;
  var num = 1;

  while (!uniqueName)
  {
    procId = "Procedure" + num++;
    uniqueName = this.isUniqueDataSetId(procId);
  }

  return procId;
}

function SBStoredProcASPNET_getSPParamsAndTestVals(outParamNames, outParamValues, bPromptIfNotFound)
{
  var retVal = true;
  var params = new Array();
  var sproc = this.getDatabaseCall(params);
  var cachedTestValues = SBDatabaseCall.schemaCache.getCachedParamTestValueArray(sproc);
  var updateCachedValues = false;

  for (var i = 0; i < params.length; ++i)
  {   
	if (SBDatabaseCallASPNET.isInputParam(params[i].direction))
    {
      var testValue = "";
      var found = false;

	  // First, look in the cache

	  if (cachedTestValues)
      {
        var index = dwscripts.findInArray(cachedTestValues, params[i].name, caseInsensitiveCompare);

		if ((index != (-1)) && ((index + 1) < cachedTestValues.length))
        {
          testValue = cachedTestValues[index + 1];
		  found = true;
        }
      }

	  // Prompt the user for input values (but not for "entered values")

	  if (!found && bPromptIfNotFound)
	  {
        var paramInfo = dwscripts.getParameterTypeFromCode(params[i].runtime);

		testValue = (paramInfo) ? paramInfo.varDefault : "";
		
		MM.paramName = params[i].name;
	    MM.SimpleRecordsetDefaultVal = dwscripts.trimQuotes(testValue);
 
	    dw.runCommand("GetTestValue");

        if (MM.clickedOK)
        {
          testValue = MM.SimpleRecordsetDefaultVal;
        }
	    else
	    {
          // user clicked cancel, so exit
          retVal = false;
          break;
	    }
      
	    // Escape instances of '

        testValue = testValue.replace(/'/g, "''");

		// Cache this testValue

        cachedTestValues.push(params[i].name);
		cachedTestValues.push(testValue);
		  
		updateCachedValues = true;
      }
	   
	  outParamNames.push(params[i].name);
	  outParamValues.push(testValue);
    }
  }

  if (updateCachedValues)
  {
    SBDatabaseCall.schemaCache.saveParamTestValueArrayForCache(sproc, cachedTestValues);  
  }

  return retVal;
}

function SBStoredProcASPNET_getRecordsetBindings()
{
  var bindingsAndTypeArray = null;
  var rsName = this.getRecordsetName();

  // Check if the information is in the cache
  
  bindingsAndTypeArray = 
    SBDatabaseCall.schemaCache.getCachedColumnAndTypeArray(rsName);

  if (!bindingsAndTypeArray || !bindingsAndTypeArray.length) 
  {
    // Try to retrieve the information from database
    
	var connName = this.getConnectionName();
    var procedureName = this.getDatabaseCall(null);
    var paramNames = new Array();
    var paramValues = new Array();
    
	if (this.getSPParamsAndTestVals(paramNames, paramValues, true))
	{
  	  bindingsAndTypeArray = MMDB.getSPColumnListNamedParams(connName,
	                                                         procedureName, 
                                                             paramNames,
														     paramValues,
														     true);

      // Save it to the cache for future use
      SBDatabaseCall.schemaCache.saveColumnAndTypeArrayForCache(rsName, bindingsAndTypeArray);
    }
  }

  return bindingsAndTypeArray;
}

function caseInsensitiveCompare(object, searchValue)
{
  return (String(object).toUpperCase() == String(searchValue).toUpperCase());
}



