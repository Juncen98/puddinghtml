//SHARE-IN-MEMORY=true

// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   ColumnValueNode
//
// DESCRIPTION:
//   This class represents the mapping of a database column to a value
//
// PUBLIC PROPERTIES:
//   None
//
// PUBLIC FUNCTIONS:
//
//   getColumnName()
//   setColumnName(columnName)
//
//   getColumnType()
//   setColumnType(columnType)
//
//   getIsPrimaryKey()
//   setIsPrimaryKey(isPrimaryKey)
//
//   getVariableName()
//   setVariableName(variableName)
//
//   getRuntimeValue()
//   setRuntimeValue(runtimeValue)
//
//   getSubmitAs()
//   setSubmitAs(submitAs)
//
//   toString()
//--------------------------------------------------------------------

//--------------------------------------------------------------------
// FUNCTION:
//   ColumnValueNode
//
// DESCRIPTION:
//   Contructor function
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function ColumnValueNode()
{
  this.initialize();
}

// public methods
ColumnValueNode.prototype.initialize = ColumnValueNode_intialize;

ColumnValueNode.prototype.getColumnName = ColumnValueNode_getColumnName;
ColumnValueNode.prototype.setColumnName = ColumnValueNode_setColumnName;

ColumnValueNode.prototype.getColumnType = ColumnValueNode_getColumnType;
ColumnValueNode.prototype.setColumnType = ColumnValueNode_setColumnType;

ColumnValueNode.prototype.getIsPrimaryKey = ColumnValueNode_getIsPrimaryKey;
ColumnValueNode.prototype.setIsPrimaryKey = ColumnValueNode_setIsPrimaryKey;

ColumnValueNode.prototype.getVariableName = ColumnValueNode_getVariableName;
ColumnValueNode.prototype.setVariableName = ColumnValueNode_setVariableName;

ColumnValueNode.prototype.getRuntimeValue = ColumnValueNode_getRuntimeValue;
ColumnValueNode.prototype.setRuntimeValue = ColumnValueNode_setRuntimeValue;

ColumnValueNode.prototype.getSubmitAs = ColumnValueNode_getSubmitAs;
ColumnValueNode.prototype.setSubmitAs = ColumnValueNode_setSubmitAs;

ColumnValueNode.prototype.getRuntimePlaceholder = ColumnValueNode_getRuntimePlaceholder;

ColumnValueNode.prototype.getConcatStartString = ColumnValueNode_getConcatStartString;
ColumnValueNode.prototype.getConcatEndString = ColumnValueNode_getConcatEndString;

ColumnValueNode.prototype.toString = ColumnValueNode_toString;


//--------------------------------------------------------------------
// FUNCTION:
//   ColumnValueNode.intialize
//
// DESCRIPTION:
//   Initializes the object
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function ColumnValueNode_intialize()
{
  this.columnName = '';
  this.columnType = '';
  this.isPrimaryKey = false;
  
  this.varName = '';
  
  this.runtimeValue = '';
  
  this.wrapChar = '';
  this.altValue = '';
  this.defaultValue = '';
}


//--------------------------------------------------------------------
// FUNCTION:
//   ColumnValueNode.getColumnName
//
// DESCRIPTION:
//   Returns the column name
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function ColumnValueNode_getColumnName()
{
  return this.columnName;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ColumnValueNode.setColumnName
//
// DESCRIPTION:
//   Sets the column name
//
// ARGUMENTS:
//   columnName - string - the column name to set
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function ColumnValueNode_setColumnName(columnName)
{
  this.columnName = columnName;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ColumnValueNode.getColumnType
//
// DESCRIPTION:
//   Returns the column type
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function ColumnValueNode_getColumnType()
{
  return this.columnType;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ColumnValueNode.setColumnType
//
// DESCRIPTION:
//   Sets the column type
//
// ARGUMENTS:
//   columnType - string - the column type to set
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function ColumnValueNode_setColumnType(columnType)
{
  this.columnType = columnType;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ColumnValueNode.getIsPrimaryKey
//
// DESCRIPTION:
//   Returns true if this column represents a primary key
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function ColumnValueNode_getIsPrimaryKey()
{
  return this.isPrimaryKey;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ColumnValueNode.setIsPrimaryKey
//
// DESCRIPTION:
//   Sets if this column is a primary key
//
// ARGUMENTS:
//   isPrimaryKey - boolean - true if the column is a primary key,
//     false otherwise
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function ColumnValueNode_setIsPrimaryKey(isPrimaryKey)
{
  this.isPrimaryKey = isPrimaryKey;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ColumnValueNode.getVariableName
//
// DESCRIPTION:
//   Returns the variable name mapped to the current column
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function ColumnValueNode_getVariableName()
{
  return this.varName;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ColumnValueNode.setVariableName
//
// DESCRIPTION:
//   Sets the variable name mapped to the current column
//
// ARGUMENTS:
//   columnName - string - the variable name to set
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function ColumnValueNode_setVariableName(variableName)
{
  this.varName = variableName;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ColumnValueNode.getRuntimeValue
//
// DESCRIPTION:
//   Returns the runtime value for this column value mapping
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function ColumnValueNode_getRuntimeValue()
{
  return this.runtimeValue;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ColumnValueNode.setRuntimeValue
//
// DESCRIPTION:
//   Sets the runtime value for this column value mapping
//
// ARGUMENTS:
//   runtimeValue - string - the runtime value to set
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function ColumnValueNode_setRuntimeValue(runtimeValue)
{
  this.runtimeValue = runtimeValue;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ColumnValueNode.getSubmitAs
//
// DESCRIPTION:
//   Returns the submit as value for this column value mapping.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - comma separated list of three values:
//     wrap character, alternate value, and default value
//     the word 'none' should be used for items with no value
//--------------------------------------------------------------------

function ColumnValueNode_getSubmitAs()
{
  var retVal = "";

  retVal = ((this.wrapChar) ? this.wrapChar : "none") + "," +
           ((this.altValue) ? this.altValue : "none") + "," +
           ((this.defaultValue) ? this.defaultValue : "none");

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ColumnValueNode.setSubmitAs
//
// DESCRIPTION:
//   Sets the submit as value for this column value mapping
//
// ARGUMENTS:
//   submitAs - string - comma separated list of three values:
//     wrap character, alternate value, and default value
//     the word 'none' should be used for items with no value
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function ColumnValueNode_setSubmitAs(submitAs)
{
  var info = submitAs.split(",");
  
  if (info.length >= 3)
  {
    var wrapChar = info[0];
    wrapChar = (wrapChar != "none") ? wrapChar : "";
    this.wrapChar = wrapChar;

    var altValue = info[1];
    altValue = (altValue != "none") ? altValue : "";
    this.altValue = altValue;

    var defaultValue = info[2];
    defaultValue = (defaultValue != "none") ? defaultValue : "";
    this.defaultValue = defaultValue;
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   ColumnValueNode.getRuntimePlaceholder
//
// DESCRIPTION:
//   This function should return the string used as a placeholder
//   in sprintf style SQL statements.  If this function returns
//   a value, then the functions in the SQLStatement class will
//   use this value in place of the runtime value when constructing
//   the sql statement.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function ColumnValueNode_getRuntimePlaceholder()
{
  return "";
}


//--------------------------------------------------------------------
// FUNCTION:
//   ColumnValueNode.getConcatStartString
//
// DESCRIPTION:
//   This function should return the string used to start a 
//   concatenation of a runtime values in the SQL string.  This
//   function should be over-ridden in the derived class if this
//   is needed.  For example, in PHP, one would have this function
//   return "\" .";
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function ColumnValueNode_getConcatStartString()
{
  return "";
}


//--------------------------------------------------------------------
// FUNCTION:
//   ColumnValueNode.getConcatEndString
//
// DESCRIPTION:
//   This function should return the string used to end a 
//   concatenation of a runtime values in the SQL string.  This
//   function should be over-ridden in the derived class if this
//   is needed.  For example, in PHP, one would have this function
//   return ". \"";
//
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function ColumnValueNode_getConcatEndString()
{
  return "";
}


//--------------------------------------------------------------------
// FUNCTION:
//   ColumnValueNode.toString
//
// DESCRIPTION:
//   Returns a string representation of this node
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function ColumnValueNode_toString()
{
  var retVal = new Array();
  retVal.push("ColumnName   = " + this.columnName);
  retVal.push("ColumnType   = " + this.columnType);
  retVal.push("IsPrimaryKey = " + this.isPrimaryKey);
  retVal.push("VariableName = " + this.varName);
  retVal.push("RuntimeValue = " + this.runtimeValue);
  retVal.push("WrapChar     = " + this.wrapChar);
  retVal.push("AltValue     = " + this.altValue);
  retVal.push("DefaultValue = " + this.defaultValue);
  return retVal.join("\n");
}
