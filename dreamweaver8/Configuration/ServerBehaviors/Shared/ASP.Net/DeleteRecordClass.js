// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

//--------------------------------------------------------------------
// CLASS:
//   SBDeleteRecord
//
// DESCRIPTION:
//   This class is derived from the ServerBehaviorClass, and
//   represents a Delete Record Server Behvaior
//
// PUBLIC PROPERTIES:
//   <property> - <type and description>
//
// PUBLIC FUNCTIONS:
//   <function name> - <description>
//--------------------------------------------------------------------

SBDeleteRecord.prototype.__proto__ = SBEditOpsASPNET.prototype;

SBDeleteRecord.prototype.initSBDeleteRecord = SBDeleteRecord_initSBDeleteRecord;
SBDeleteRecord.prototype.setSQLStatement = SBDeleteRecord_setSQLStatement;

//--------------------------------------------------------------------
// FUNCTION:
//   SBDeleteRecord
//
// DESCRIPTION:
//   Constructor
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBDeleteRecord(name, title, selectedNode)
{  
  this.initSBDeleteRecord((name) ? name : "DeleteRecordset", title, selectedNode);
}

function SBDeleteRecord_initSBDeleteRecord(name, title, selectedNode)
{
  this.initSBEditOpsASPNET(name, title, selectedNode);
}

//--------------------------------------------------------------------
// FUNCTION:
//   SBDeleteRecord.setSQLStatement
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

function SBDeleteRecord_setSQLStatement(tableName, columnInfo)
{
  var sqlObj = new SQLStatement("");
  sqlObj.createDeleteStatement(tableName, columnInfo);
  
  var sql = sqlObj.getStatement(true);
  
  sql = dwscripts.escSQLQuotes(sql);
    
  this.setParameter(this.EXT_DATA_SQL, sql);
}
