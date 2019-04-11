// Copyright 2001, 2002, 2003, 2004 Macromedia, Inc. All rights reserved.

// Inherit from the SBDatabaseCall class

SBDatabaseCallASPNET.prototype.__proto__ = SBDatabaseCall.prototype;

// Class methods:

SBDatabaseCallASPNET.getParamTypeList = SBDatabaseCallASPNET_getParamTypeList;
SBDatabaseCallASPNET.getParamDirection = SBDatabaseCallASPNET_getParamDirection;
SBDatabaseCallASPNET.isStringType = SBDatabaseCallASPNET_isStringType;
SBDatabaseCallASPNET.isDateTimeType = SBDatabaseCallASPNET_isDateTimeType;
SBDatabaseCallASPNET.isVariableLengthType = SBDatabaseCallASPNET_isVariableLengthType;
SBDatabaseCallASPNET.isInputParam = SBDatabaseCallASPNET_isInputParam;
SBDatabaseCallASPNET.isOutputParam = SBDatabaseCallASPNET_isOutputParam;
SBDatabaseCallASPNET.transformURL = SBDatabaseCallASPNET_transformURL;

// Inspectors

SBDatabaseCallASPNET.prototype.getDatabaseCall = SBDatabaseCallASPNET_getDatabaseCall;
SBDatabaseCallASPNET.prototype.isUniqueDataSetId = SBDatabaseCallASPNET_isUniqueDataSetId;
SBDatabaseCallASPNET.prototype.isUniqueRecordsetName = SBDatabaseCallASPNET_isUniqueDataSetId;
SBDatabaseCallASPNET.prototype.analyzeConnectionName = SBDatabaseCallASPNET_analyzeConnectionName;

// Updaters

SBDatabaseCallASPNET.prototype.setDatabaseCall = SBDatabaseCallASPNET_setDatabaseCall;
SBDatabaseCallASPNET.prototype.checkPlatformSpecific = SBDatabaseCallASPNET_checkPlatformSpecific;
SBDatabaseCallASPNET.prototype.checkRecordsetName = SBDatabaseCallASPNET_checkRecordsetName;
SBDatabaseCallASPNET.prototype.analyzeDatabaseCall = SBDatabaseCallASPNET_analyzeDatabaseCall;
SBDatabaseCallASPNET.prototype.analyzePlatformSpecific = SBDatabaseCallASPNET_analyzePlatformSpecific;
SBDatabaseCallASPNET.prototype.sortParameters = SBDatabaseCallASPNET_sortParameters;

// Construction

SBDatabaseCallASPNET.prototype.initSBDatabaseCallASPNET = SBDatabaseCallASPNET_initSBDatabaseCallASPNET;
SBDatabaseCallASPNET.prototype.postProcessFind = SBDatabaseCallASPNET_postProcessFind;
SBDatabaseCallASPNET.prototype.loadParameters = SBDatabaseCallASPNET_loadParameters;

SBDatabaseCallASPNET.prototype.setDatabaseType = SBDatabaseCallASPNET_setDatabaseType;
SBDatabaseCallASPNET.prototype.getDatabaseType = SBDatabaseCallASPNET_getDatabaseType;
SBDatabaseCallASPNET.prototype.getSQLStatement = SBDatabaseCallASPNET_getSQLStatement;
SBDatabaseCallASPNET.prototype.setVarNames = SBDatabaseCallASPNET_setVarNames;
SBDatabaseCallASPNET.prototype.getVarNames = SBDatabaseCallASPNET_getVarNames;
SBDatabaseCallASPNET.prototype.setVarRuntimes = SBDatabaseCallASPNET_setVarRuntimes;
SBDatabaseCallASPNET.prototype.getVarRuntimes = SBDatabaseCallASPNET_getVarRuntimes;
SBDatabaseCallASPNET.prototype.setVarTypes = SBDatabaseCallASPNET_setVarTypes;
SBDatabaseCallASPNET.prototype.getVarTypes = SBDatabaseCallASPNET_getVarTypes;
SBDatabaseCallASPNET.prototype.setSuccessURL = SBDatabaseCallASPNET_setSuccessURL;
SBDatabaseCallASPNET.prototype.setFailureURL = SBDatabaseCallASPNET_setFailureURL;
SBDatabaseCallASPNET.prototype.getSuccessURL = SBDatabaseCallASPNET_getSuccessURL;
SBDatabaseCallASPNET.prototype.getFailureURL = SBDatabaseCallASPNET_getFailureURL;
SBDatabaseCallASPNET.prototype.setExpression = SBDatabaseCallASPNET_setExpression;
SBDatabaseCallASPNET.prototype.getExpression = SBDatabaseCallASPNET_getExpression;
SBDatabaseCallASPNET.prototype.setDebug = SBDatabaseCallASPNET_setDebug;
SBDatabaseCallASPNET.prototype.getDebug = SBDatabaseCallASPNET_getDebug;
SBDatabaseCallASPNET.prototype.setEditOpParamNames = SBDatabaseCallASPNET_setEditOpParamNames;
SBDatabaseCallASPNET.prototype.getEditOpParamNames = SBDatabaseCallASPNET_getEditOpParamNames;
SBDatabaseCallASPNET.prototype.setEditOpParamTypes = SBDatabaseCallASPNET_setEditOpParamTypes;
SBDatabaseCallASPNET.prototype.getEditOpParamTypes = SBDatabaseCallASPNET_getEditOpParamTypes;
SBDatabaseCallASPNET.prototype.setEditOpParamIsPrimaries = SBDatabaseCallASPNET_setEditOpParamIsPrimaries;
SBDatabaseCallASPNET.prototype.getEditOpParamIsPrimaries = SBDatabaseCallASPNET_getEditOpParamIsPrimaries;
SBDatabaseCallASPNET.prototype.transformURLs = SBDatabaseCallASPNET_transformURLs;

// PUBLIC PROPERTIES
// CLASS CONSTANTS
// Override of RecordsetSB.prototype.EXT_DATA_* constants. Stores names of
// common extension data elements. See RecordsetSB.prototype.EXT_DATA_* for 
// details. 

SBDatabaseCallASPNET.prototype.EXT_DATA_LANGUAGE				= "Language";
SBDatabaseCallASPNET.prototype.EXT_DATA_SQL						= "CommandText";
SBDatabaseCallASPNET.prototype.EXT_DATA_SQL_VAR_NAME			= "SqlVarName";
SBDatabaseCallASPNET.prototype.EXT_DATA_SQL_VAR_RUNTIME			= "SqlVarRuntime";
SBDatabaseCallASPNET.prototype.EXT_DATA_SQL_VAR_TYPE			= "SqlVarType";
SBDatabaseCallASPNET.prototype.EXT_DATA_SQL_VAR_SIZE			= "SqlVarSize";
SBDatabaseCallASPNET.prototype.EXT_DATA_SQL_VAR_DIRECTION		= "SqlVarDirection";
SBDatabaseCallASPNET.prototype.EXT_DATA_DEBUG					= "Debug";
SBDatabaseCallASPNET.prototype.EXT_DATA_EXPRESSION				= "Expression";
SBDatabaseCallASPNET.prototype.EXT_DATA_SUCCESS_URL				= "SuccessURL";
SBDatabaseCallASPNET.prototype.EXT_DATA_FAILURE_URL				= "FailureURL";
SBDatabaseCallASPNET.prototype.EXT_DATA_EDITOP_TABLE 			= "EditOpTable";
SBDatabaseCallASPNET.prototype.EXT_DATA_EDITOP_PARAM_NAME		= "EditOpParamName";
SBDatabaseCallASPNET.prototype.EXT_DATA_EDITOP_PARAM_TYPE		= "EditOpParamType";
SBDatabaseCallASPNET.prototype.EXT_DATA_EDITOP_PARAM_ISPRIMARY	= "EditOpParamIsPrimary";
SBDatabaseCallASPNET.prototype.EXT_DATA_PROCESS_ON_POSTBACK		= "ProcessOnPostBack";
SBDatabaseCallASPNET.prototype.EXT_DATA_DATABASE_TYPE			= "DatabaseType";

//--------------------------------------------------------------------

function SBDatabaseCallASPNET(name, title, selectedNode)
{
  this.initSBDatabaseCallASPNET(name, title, selectedNode);
}

function SBDatabaseCallASPNET_initSBDatabaseCallASPNET(name, title, selectedNode)
{
  // First, initialize base class

  this.initSBDatabaseCall(name, title, selectedNode);

  // Initialize parameters

  this.setParameter(this.EXT_DATA_LANGUAGE, dw.getDocumentDOM().serverModel.getServerInfo().serverLanguage);

  this.setParameter(this.EXT_DATA_DATABASE_TYPE, "");
  this.setParameter(this.EXT_DATA_DEBUG, "");
  this.setParameter(this.EXT_DATA_EXPRESSION, "");
  this.setParameter(this.EXT_DATA_SUCCESS_URL, "");
  this.setParameter(this.EXT_DATA_FAILURE_URL, "");
  this.setParameter(this.EXT_DATA_PROCESS_ON_POSTBACK, "");

  this.setParameter(this.EXT_DATA_EDITOP_TABLE, "");
  this.setParameter(this.EXT_DATA_EDITOP_PARAM_NAME, null);
  this.setParameter(this.EXT_DATA_EDITOP_PARAM_TYPE, null);
  this.setParameter(this.EXT_DATA_EDITOP_PARAM_ISPRIMARY, null);
}

function SBDatabaseCallASPNET_postProcessFind(mainPartName)
{
  this.loadParameters(mainPartName);
}

function SBDatabaseCallASPNET_getSQLStatement()
{
  var retVal = this.getParameter(this.EXT_DATA_SQL);
  
  retVal = dwscripts.unescSQLQuotes(retVal);
  
  return retVal;
}

function SBDatabaseCallASPNET_setDatabaseType(databaseType)
{
  this.setParameter(this.EXT_DATA_DATABASE_TYPE, databaseType);
}

function SBDatabaseCallASPNET_getDatabaseType()
{
  return this.getParameter(this.EXT_DATA_DATABASE_TYPE);
}

function SBDatabaseCallASPNET_setVarNames(names)
{
  this.setParameter(this.EXT_DATA_SQL_VAR_NAME, names);
}

function SBDatabaseCallASPNET_getVarNames()
{
  return this.getParameter(this.EXT_DATA_SQL_VAR_NAME);
}

function SBDatabaseCallASPNET_setVarRuntimes(runtimes)
{
  this.setParameter(this.EXT_DATA_SQL_VAR_RUNTIME, runtimes);
}

function SBDatabaseCallASPNET_getVarRuntimes()
{
  return this.getParameter(this.EXT_DATA_SQL_VAR_RUNTIME);
}

function SBDatabaseCallASPNET_setVarTypes(types)
{
  this.setParameter(this.EXT_DATA_SQL_VAR_TYPE, types);
}

function SBDatabaseCallASPNET_getVarTypes()
{
  return this.getParameter(this.EXT_DATA_SQL_VAR_TYPE);
}

function SBDatabaseCallASPNET_setExpression(expression)
{
  this.setParameter(this.EXT_DATA_EXPRESSION, expression);
}

function SBDatabaseCallASPNET_getExpression()
{
  return this.getParameter(this.EXT_DATA_EXPRESSION);
}

function SBDatabaseCallASPNET_setDebug(debugVal)
{
  this.setParameter(this.EXT_DATA_DEBUG, debugVal);
}

function SBDatabaseCallASPNET_getDebug()
{
  return this.getParameter(this.EXT_DATA_DEBUG);
}

function SBDatabaseCallASPNET_setSuccessURL(url)
{
  this.setParameter(this.EXT_DATA_SUCCESS_URL, url);
}

function SBDatabaseCallASPNET_setFailureURL(url)
{
  this.setParameter(this.EXT_DATA_FAILURE_URL, url);
}

function SBDatabaseCallASPNET_getSuccessURL()
{
  return this.getParameter(this.EXT_DATA_SUCCESS_URL);
}

function SBDatabaseCallASPNET_getFailureURL()
{
  return this.getParameter(this.EXT_DATA_FAILURE_URL);
}

function SBDatabaseCallASPNET_setEditOpTable(table)
{
  this.setParameter(this.EXT_DATA_EDITOP_PARAM_TABLE, table);
}

function SBDatabaseCallASPNET_getEditOpParamTable()
{
  return this.getParameter(this.EXT_DATA_EDITOP_TABLE);
}

function SBDatabaseCallASPNET_setEditOpParamNames(names)
{
  this.setParameter(this.EXT_DATA_EDITOP_PARAM_NAME, names);
}

function SBDatabaseCallASPNET_getEditOpParamNames()
{
  return this.getParameter(this.EXT_DATA_EDITOP_PARAM_NAME);
}

function SBDatabaseCallASPNET_setEditOpParamTypes(types)
{
  this.setParameter(this.EXT_DATA_EDITOP_PARAM_TYPE, types);
}

function SBDatabaseCallASPNET_getEditOpParamTypes()
{
  return this.getParameter(this.EXT_DATA_EDITOP_PARAM_TYPE);
}

function SBDatabaseCallASPNET_setEditOpParamIsPrimaries(isPrimaries)
{
  this.setParameter(this.EXT_DATA_EDITOP_PARAM_ISPRIMARY, isPrimaries);
}

function SBDatabaseCallASPNET_getEditOpParamIsPrimaries()
{
  return this.getParameter(this.EXT_DATA_EDITOP_PARAM_ISPRIMARY);
}

function SBDatabaseCallASPNET_isInputParam(direction)
{
  return (direction.toUpperCase().indexOf("INPUT") != (-1));
}

function SBDatabaseCallASPNET_isOutputParam(direction)
{
  return ((direction.toUpperCase().indexOf("OUTPUT") != (-1)) ||
		  (direction.toUpperCase() == "RETURNVALUE"));
}

function SBDatabaseCallASPNET_loadParameters(mainPartName)
{
  // Load the parameters

  var part = this.getNamedSBPart(mainPartName);
  
  if (part)
  {
    var paramNames = new Array();
    var paramRuntimes = new Array();
    var paramTypes = new Array();
    var paramSizes = new Array();
    var paramDirections = new Array();
    var editOpNames = new Array();
	var editOpTypes = new Array();
	var editOpIsPrimaries = new Array();
	    
	var mainTag = new TagEdit(dwscripts.getOuterHTML(part.getNode()));
    var subTags = mainTag.getChildNodes();    

    for (var i = 0; i < subTags.length; i++)
    {
      if (subTags[i].getTagName() == "PARAMETERS")
      {
	    var paramTags = subTags[i].getChildNodes();

        for (var j = 0; j < paramTags.length; j++)
        {
          if (paramTags[j].getTagName() == "PARAMETER")
          {
            paramNames.push(paramTags[j].getAttribute("name") ? paramTags[j].getAttribute("name") : "");
            paramTypes.push(paramTags[j].getAttribute("type") ? paramTags[j].getAttribute("type") : "");
            paramSizes.push(paramTags[j].getAttribute("size") ? paramTags[j].getAttribute("size") : "");
            paramDirections.push(paramTags[j].getAttribute("direction") ? paramTags[j].getAttribute("direction") : "");

            var runtime = paramTags[j].getAttribute("value");

            if (runtime)
			{
			  // Runtime should look like <%# value %> -- extract the value
			  			
              if (runtime.search(/^\s*<%#\s*([^']+?)\s*%>\s*$/) != (-1))
              {
                runtime = RegExp.$1
              }
			}
            else
            {
			  runtime = "";
			}

			paramRuntimes.push(runtime);
	      }
        }
	  }
      else if (subTags[i].getTagName() == "EDITOPS")
      {
	    var paramTags = subTags[i].getChildNodes();

        for (var j = 0; j < paramTags.length; j++)
        {
          if (paramTags[j].getTagName() == "PARAMETER")
          {
            editOpNames.push(paramTags[j].getAttribute("name"));
            editOpTypes.push(paramTags[j].getAttribute("type"));
			editOpIsPrimaries.push(paramTags[j].getAttribute("isprimary"));
	      }
		  else if (paramTags[j].getTagName() == "EDITOPSTABLE")
		  {
            this.setParameter(this.EXT_DATA_EDITOP_TABLE, paramTags[j].getAttribute("name"));		    
		  }
        }
	  }
	}

    this.setParameter(this.EXT_DATA_SQL_VAR_NAME, paramNames);
    this.setParameter(this.EXT_DATA_SQL_VAR_RUNTIME, paramRuntimes);
    this.setParameter(this.EXT_DATA_SQL_VAR_TYPE, paramTypes);
    this.setParameter(this.EXT_DATA_SQL_VAR_SIZE, paramSizes);
    this.setParameter(this.EXT_DATA_SQL_VAR_DIRECTION, paramDirections);
	
	this.sortParameters();

	this.setEditOpParamNames(editOpNames);
	this.setEditOpParamTypes(editOpTypes);		
	this.setEditOpParamIsPrimaries(editOpIsPrimaries);		
  }
  else
  {
    alert("INTERNAL ERROR: main participant not found.");
  }  
}

function SBDatabaseCallASPNET_getDatabaseCall(outSQLParameters)
{
  var sql = this.getParameter(this.EXT_DATA_SQL);

  // Strip off surrounding quotes

  sql = dwscripts.trim(sql)
  sql = dwscripts.trimQuotes(sql);
  sql = dwscripts.unescSQLQuotes(sql);

  if (outSQLParameters != null)
  {
    // Populate the sql parameters array with the variable values

    var paramNames = this.getParameter(this.EXT_DATA_SQL_VAR_NAME);
    var paramRuntimes = this.getParameter(this.EXT_DATA_SQL_VAR_RUNTIME);
    var paramTypes = this.getParameter(this.EXT_DATA_SQL_VAR_TYPE);
    var paramSizes = this.getParameter(this.EXT_DATA_SQL_VAR_SIZE);
    var paramDirections = this.getParameter(this.EXT_DATA_SQL_VAR_DIRECTION);
   
	for (var j = 0; paramRuntimes && (j < paramRuntimes.length); j++) 
    {
      var param = new Object();

	  param.name = paramNames[j];
 	  param.runtime = paramRuntimes[j];
      param.type = paramTypes[j];
	  param.size = paramSizes[j];
	  param.direction = paramDirections[j];

      outSQLParameters.push(param);
    }
  }

  return sql;
}

function SBDatabaseCallASPNET_setDatabaseCall(sql, sqlParameters)
{
  // Strip out all new lines and CRs

  sql = sql.replace(/[\n\r]/g," ");
  
  // Handle parameters

  var paramNames = new Array();
  var paramRuntimes = new Array();
  var paramTypes = new Array();
  var paramSizes = new Array();
  var paramDirections = new Array();

  if (sqlParameters != null)
  {
    for (var i = 0; i < sqlParameters.length; ++i)
    {
      var param = sqlParameters[i];
      
      paramNames.push(param.name);
      paramRuntimes.push(param.runtime);
      paramTypes.push(param.type);
      paramSizes.push(param.size);
      paramDirections.push(param.direction);
    }
  }

  // Escape quotes

  sql = dwscripts.escSQLQuotes(sql);

  // Surround sql with quotes

  if (sql.charAt(0) != '"')
  {
    sql = "\"" + sql + "\"";
  }

  this.setParameter(this.EXT_DATA_SQL, dwscripts.trim(sql));
  this.setParameter(this.EXT_DATA_SQL_VAR_NAME, paramNames);
  this.setParameter(this.EXT_DATA_SQL_VAR_RUNTIME, paramRuntimes);
  this.setParameter(this.EXT_DATA_SQL_VAR_TYPE, paramTypes);
  this.setParameter(this.EXT_DATA_SQL_VAR_SIZE, paramSizes);
  this.setParameter(this.EXT_DATA_SQL_VAR_DIRECTION, paramDirections);

  this.sortParameters();
}

function SBDatabaseCallASPNET_sortParameters()
{
  // If there is a "ReturnValue" parameter, it must be first

  var paramDirections = this.getParameter(this.EXT_DATA_SQL_VAR_DIRECTION);

  if (paramDirections.length > 0)
  {
    for (var i = 0; i < paramDirections.length; i++)
    {  
      if (paramDirections[i] == "ReturnValue")
	  {
	  	break;    
	  }
    }

    if ((i > 0) && (i < paramDirections.length))
	{
      var paramNames = this.getParameter(this.EXT_DATA_SQL_VAR_NAME);
      var paramRuntimes = this.getParameter(this.EXT_DATA_SQL_VAR_RUNTIME);
      var paramTypes = this.getParameter(this.EXT_DATA_SQL_VAR_TYPE);
      var paramSizes = this.getParameter(this.EXT_DATA_SQL_VAR_SIZE);
  
      // TODO: sort arrays

	  this.setParameter(this.EXT_DATA_SQL_VAR_NAME, paramNames);
      this.setParameter(this.EXT_DATA_SQL_VAR_RUNTIME, paramRuntimes);
      this.setParameter(this.EXT_DATA_SQL_VAR_TYPE, paramTypes);
      this.setParameter(this.EXT_DATA_SQL_VAR_SIZE, paramSizes);
      this.setParameter(this.EXT_DATA_SQL_VAR_DIRECTION, paramDirections);
	}
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.checkRecordsetName
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

function SBDatabaseCallASPNET_checkRecordsetName(bIsForTest)
{
  var isValidRS = true;
  
  if (!bIsForTest)
  {
    // Check for valid recordset name.
    var theName = this.getRecordsetName();
    var oldName = this.parameters[this.EXT_DATA_RS_NAME];

    if (!theName || theName == "")
    {
      isValidRS = false      
      this.appendErrorMessage(MM.MSG_NoDataSetName);
    }
    else
    {
      if (!dwscripts.isValidVarName(theName))
      {
        isValidRS = false      
        this.appendErrorMessage(MM.MSG_InvalidDataSetName);
      }
  
      if (!this.isUniqueRecordsetName(theName, oldName))
      {
        isValidRS = false      
        this.appendErrorMessage(MM.MSG_DupeDataSetName);
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

function SBDatabaseCallASPNET_isUniqueDataSetId(newId, oldId)
{
	var retVal = true;

	if (newId != oldId) 
	{
		var dom = dw.getDocumentDOM();
		var paramTags = dom.getElementsByTagName("MM:DataSet");

		for (var j = 0; j < paramTags.length; ++j)
		{
			var id = paramTags[j].getAttribute("ID");

			if (id && (id.toLowerCase() == newId.toLowerCase()))
			{
				retVal = false;
				break;
			}
		}
	}

	return retVal;
}

function SBDatabaseCallASPNET_analyzeConnectionName()
{
	//  Do nothing for now.
}

function SBDatabaseCallASPNET_analyzeDatabaseCall()
{
  // TODO: Make sure "ReturnValue" is first parameter
}

function SBDatabaseCallASPNET_checkDatabaseCall(bIsForTest)
{
  return true;
}

function SBDatabaseCallASPNET_analyzePlatformSpecific()
{
}

function SBDatabaseCallASPNET_checkPlatformSpecific(bIsForText)
{
  return true;
}

function SBDatabaseCallASPNET_getParamDirection(directionEnum)
{
  var retVal = "";
  
  switch(directionEnum)
  {
    case 1:
      retVal = "Input";
      break;
    case 2:
      retVal = "Output";
      break;
    case 3:
      retVal = "InputOutput";
      break;
    case 4:
      retVal = "ReturnValue";
      break;
  }

  return retVal;
}

function SBDatabaseCallASPNET_getParamTypeList(databaseType)
{
	var typeList = new Array();

	if (databaseType.toLowerCase() == "sqlserver")
	{
		typeList[0] = "BigInt";
		typeList[1] = "Bit";
		typeList[2] = "Char";
		typeList[3] = "DateTime";
		typeList[4] = "Decimal";
		typeList[5] = "Float";
		typeList[6] = "Int";
		typeList[7] = "Money";
		typeList[8] = "NChar";
		typeList[9] = "NText";
		typeList[10] = "NVarChar";
		typeList[11] = "Real";
		typeList[12] = "SmallDateTime";
		typeList[13] = "SmallInt";
		typeList[14] = "SmallMoney";
		typeList[15] = "Text";
		typeList[16] = "TimeStamp";
		typeList[17] = "TinyInt";
		typeList[18] = "VarChar";
	}
	else
	{
		typeList[0] = "BigInt"; 
		typeList[1] = "Boolean";
		typeList[2] = "BSTR";
		typeList[3] = "Char"; 
		typeList[4] = "Currency"; 
		typeList[5] = "Date"; 
		typeList[6] = "DBDate"; 
		typeList[7] = "DBTime"; 
		typeList[8] = "DBTimeStamp"; 
		typeList[9] = "Decimal"; 
		typeList[10] = "Double"; 
		typeList[11] = "Filetime"; 
		typeList[12] = "Integer"; 
		typeList[13] = "LongVarChar"; 
		typeList[14] = "LongVarWChar"; 
		typeList[15] = "Numeric"; 
		typeList[16] = "Single"; 
		typeList[17] = "SmallInt"; 
		typeList[18] = "TinyInt"; 
		typeList[19] = "UnsignedBigInt"; 
		typeList[20] = "UnsignedInt"; 
		typeList[21] = "UnsignedSmallInt"; 
		typeList[22] = "UnsignedTinyInt"; 
		typeList[23] = "VarChar";   
		typeList[24] = "VarNumeric"; 
		typeList[25] = "VarWChar";   
		typeList[26] = "WChar";   
	}

	return typeList;
}

function SBDatabaseCallASPNET_isStringType(type)
{
  var ret = false;

  switch (type)
  {
    case "BSTR":
	case "Char":
	case "LongVarChar":
	case "LongVarWChar":
    case "VarChar":
	case "VarWChar":
	case "WChar":
	case "NChar":
	case "NText":
	case "NVarChar":
	case "Text":
	  ret = true;
      break;
  }
 
  return ret;    
}

//check for date time variants
function SBDatabaseCallASPNET_isDateTimeType(type)
{
  var ret = false;

  switch (type)
  {
    case "DBDate":
    case "DBTime":
	case "DBTimeStamp":
	case "Date":
	case "DateTime":
	case "TimeStamp":
	case "FileTime":
	  ret = true;
      break;
  }
 
  return ret;    
}

function SBDatabaseCallASPNET_isVariableLengthType(type)
{
  var ret = false;

  switch (type)
  {
    case "BSTR":
	case "LongVarChar":
	case "LongVarWChar":
    case "VarChar":
    case "VarWChar":
	case "NChar":
	case "NText":
	case "NVarChar":
	  ret = true;
      break;
  }
 
  return ret;    
}

function SBDatabaseCallASPNET_transformURLs(makeParam)
{
	this.setSuccessURL(SBDatabaseCallASPNET.transformURL(this.getSuccessURL(), makeParam));
	this.setFailureURL(SBDatabaseCallASPNET.transformURL(this.getFailureURL(), makeParam));
}

function SBDatabaseCallASPNET_transformURL(url, makeParam)
{
	if (url && (url.length > 0))
	{
		url = dwscripts.trim(url);
		
		if (makeParam)
		{
			// If there are any <%# ...%> chunks,
			// replace the server delimiters so that
			// it builds a string. Otherwise, just
			// wrap with quotes.
		
			if (url.indexOf("<%#") != (-1))
			{
				url = url.replace(/<%#/g, "\" + ");
				url = url.replace(/%>/g, " + \"");

				// Fix the cases where we replaced the 
				// first opening tag or last closing tag

				if (url.substring(0, 4) == "\" + ")
				{
					url = url.substring(4);
				}
				else
				{
					url = "\"" + url;
				}

				if (url.substring(url.length - 4) == " + \"")
				{
					url = url.substring(0, (url.length - 4));
				}
				else
				{
					url += "\"";
				}
			}
			else if ((url.charAt(0) != '"') &&
					 (url.charAt(url.length - 1) != '"'))
			{
				// If there are any "\" + " or " + \"" tokens
				// assume the string has already been transformed
				 
				if ((url.indexOf("\" + ") == (-1)) &&
					(url.indexOf(" + \"") == (-1)))
				{
					url = "\"" + url + "\"";
				}
			}
		}
		else
		{
			// If the only quotes are the beginning and
			// ending ones, remove them

			if ((url.charAt(0) == '"') &&
				(url.charAt(url.length - 1) == '"'))
			{
				var withoutQuotes = url.substring(1, url.length - 1);

				if (withoutQuotes.indexOf("\"") == (-1))
				{
					url = withoutQuotes;
				}
			}
		}
	}

	return url;
}
