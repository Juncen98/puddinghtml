// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.
//--------------------------------------------------------------------
// CLASS:
//   SBEditOpsASPNET
//
// DESCRIPTION:
//   This class is derived from the SBDatabaseCallASPNET, and
//   represents a EditOps Server Behvaior

// Inherit from the SBDatabaseCallASPNET class.

SBEditOpsASPNET.prototype.__proto__ = SBDatabaseCallASPNET.prototype;

SBEditOpsASPNET.prototype.initSBEditOpsASPNET = SBEditOpsASPNET_initSBEditOpsASPNET;
SBEditOpsASPNET.prototype.postProcessFind = SBEditOpsASPNET_postProcessFind;
SBEditOpsASPNET.prototype.analyze = SBEditOpsASPNET_analyze;
SBEditOpsASPNET.prototype.checkData = SBEditOpsASPNET_checkData;
SBEditOpsASPNET.prototype.initColumnList = SBEditOpsASPNET_initColumnList;

SBEditOpsASPNET.prototype.setTableName = SBEditOpsASPNET_setTableName;
SBEditOpsASPNET.prototype.getTableName = SBEditOpsASPNET_getTableName;
SBEditOpsASPNET.prototype.setColumnList = SBEditOpsASPNET_setColumnList;
SBEditOpsASPNET.prototype.getColumnList = SBEditOpsASPNET_getColumnList;

SBEditOpsASPNET.prototype.EXT_DATA_TABLE_NAME		= "TableName";
SBEditOpsASPNET.prototype.EXT_DATA_COLUMN_LIST		= "ColumnList";

//--------------------------------------------------------------------
// FUNCTION:
//   SBEditOpsASPNET
//
// DESCRIPTION:
//   Constructor function
//
// ARGUMENTS:
//   name, title, selectedNode 
//
//--------------------------------------------------------------------

function SBEditOpsASPNET(name, title, selectedNode)
{
  this.initSBEditOpsASPNET(name, title, selectedNode);
}

function SBEditOpsASPNET_initSBEditOpsASPNET(name, title, selectedNode)
{
  this.initSBDatabaseCallASPNET(name, title, selectedNode);
}

function SBEditOpsASPNET_setTableName(tableName)
{
  this.setParameter(this.EXT_DATA_TABLE_NAME, tableName);
}

function SBEditOpsASPNET_getTableName()
{
  return this.getParameter(this.EXT_DATA_TABLE_NAME);
}

function SBEditOpsASPNET_setColumnList(columnList)
{
  this.setParameter(this.EXT_DATA_COLUMN_LIST, columnList);
}

function SBEditOpsASPNET_getColumnList()
{
  return this.getParameter(this.EXT_DATA_COLUMN_LIST);
}

//--------------------------------------------------------------------
// FUNCTION:
//   SBEditOpsASPNET.postProcessFind
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function SBEditOpsASPNET_postProcessFind(partName, title)
{
  var part = this.getNamedSBPart(partName);
  
  if (part)
  {
    // Extract the SQL statement
    
	var sqlObj = new SQLStatement(this.getSQLStatement());
  
    // Set the table name
     
	var tables = sqlObj.getTableNames();
    this.setTableName(tables[0]);
      
    // Note: Hold off on setting the "ColumnList" parameter. That requires
    //   querying the database for the tables columns. Just call the
    //   SBEditOpsASPNET_initColumnList function when it is needed (e.g., in
    //   inspectServerBehavior).
    
    this.setTitle(title + " (" +
						this.getConnectionName() + ", " +
						this.getTableName() + ")");

    // Extract the parameters
    
	this.loadParameters(partName);
  }
  else
  {
    alert("INTERNAL ERROR: main participant not found.");
  }  
}

//--------------------------------------------------------------------
// FUNCTION:
//   SBEditOpsASPNET.analyze
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function SBEditOpsASPNET_analyze(allRecs)
{
}

//--------------------------------------------------------------------
// FUNCTION:
//   SBEditOpsASPNET.checkData
//
// DESCRIPTION:
//   Checks that the data supplied for the repeat region is complete
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function SBEditOpsASPNET_checkData()
{
  var isValid = true;
  
  // Clear out the error message.
  
  this.setErrorMessage("");

  isValid = this.checkConnectionName(false) && isValid;

  return isValid;
}

//--------------------------------------------------------------------
// FUNCTION:
//   SBEditOpsASPNET.initColumnList
//
// DESCRIPTION:
//   Gets the column list parameter. Users should always call this function when
//   attempting to get the ColumnList parameter.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   array of ColumnVariableNodes - the parameter value for ColumnList.
//--------------------------------------------------------------------

function SBEditOpsASPNET_initColumnList()
{
  // Extract the SQL statement
 
  var sqlObj = new SQLStatement(this.getSQLStatement());
  
  // Get a list of column names from the database

  var connName = this.getConnectionName();
  var databaseType = MMDB.getDatabaseType(connName);
  var columnList = dwscripts.getColumnValueList(connName, this.getTableName());

  sqlObj.extractColumnInfo(columnList);
  
  // ExtractColumnInfo() assumes the runtime values are in the sql statement. This isn't
  // true for ASP.Net, where the runtime values could be in the <parameter> tags,
  // in which case the value in the sql statement will just be the parameter name. So, we
  // need to update the columnList.
 
  var paramNames = this.getVarNames();
  var paramRuntimes = this.getVarRuntimes();
  var paramTypes = this.getVarTypes();

  for (var i = 0; i < columnList.length; i++)
  {
    // Don't assume the columnList and paramRuntimes are in the same order.
    // Parameter names are column names with @ prepended

    var columnName = "@" + columnList[i].columnName;
    var index = dwscripts.findInArray(paramNames, columnName, findColumnNameInNames);

	if (index >= 0)
	{
	  var paramInfo = dwscripts.getParameterTypeFromCode(paramRuntimes[index]);

	  if (paramInfo)
	  {
        columnList[i].setVariableName(paramInfo.varNameOrValue);
        columnList[i].setDefaultValue(dwscripts.trimQuotes(paramInfo.varDefault));
        columnList[i].setSubmitAs(paramTypes[index]);
        columnList[i].setParamType(paramInfo.varType);
        columnList[i].setRuntimeValue((databaseType.toLowerCase() == "oledb") ? "?" : columnName);
      }
	}
  }

  this.setColumnList(columnList);

  return columnList;
}

function findColumnNameInNames(object, searchValue)
{
  return (object == searchValue);
}
