//SHARE-IN-MEMORY=true
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   SQLStatement
//
// DESCRIPTION:
//   This class contains get/set functions to easily manipulate the SQL
//   statement programmatically. All set functions return true upon 
//   success, and false on failure. If a set function fails, the data
//   structure is not modified. The class supports the following 
//   SQL statement types: Select, Insert, Update, Delete, and Stored Procedure.
//
//   Limitations / Issues:
//
//   Column names with spaces must be enclosed with [ ]. This is not done
//   within this code.
//
//   Values must be enclosed in appropriate delimiters (eg Access dates 
//   with #, and strings with '). This is not done within this code.
//
//   Column names which are the same as reserved words, must be enclosed
//   in back ticks.  This is not done within this code.
//
// PUBLIC PROPERTIES:
//
// Available statement types:
//
//   SQLStatement.STMT_TYPE_EMPTY
//   SQLStatement.STMT_TYPE_SELECT
//   SQLStatement.STMT_TYPE_INSERT
//   SQLStatement.STMT_TYPE_UPDATE
//   SQLStatement.STMT_TYPE_DELETE
//   SQLStatement.STMT_TYPE_STORED_PROC
//   SQLStatement.STMT_TYPE_UNKNOWN
//
//
// PUBLIC FUNCTIONS:
//
//   getType() - gets the SQLStatement type. One of SQLStatement.STMT_TYPE_*.
//   getStatement() - gets the SQL string
//   setStatement()  - sets the SQL string
//   getStatementForMMDB() - get a SQL statement suitable for use in MMDB calls
//
// For Select Statement:
//   getSelect()
//   setSelect(newSelectClause)
//   addSelect(tableName, columnName)
//   getFrom()
//   setFrom(newFromClause)
//   addFrom(tableName)
//   getWhere()
//   setWhere(newWhereClause)
//   addWhere(tableName, columnName)
//   getGroupBy()
//   setGroupBy(newGroupByClause)
//   getHaving()
//   setHaving(newHavingClause)
//   getOrderBy()
//   setOrderBy(newOrderByClause)
//   addOrderBy(tableName, columnName, sortDirection)
//
// For Insert Statement:
//   getInsertInto()
//   setInsertInto(tableName)
//   getColumns()
//   setColumns(columnList)
//   getValues()
//   setValues(valueList)
//   addInsert(columnName, value)
//
// For Delete Statement:
//   getDeleteFrom()
//   setDeleteFrom(tableName)
//   getWhere()
//   setWhere(newWhereClause)
//   addWhere(columnName)
//
// For Update Statement:
//   getUpdate()
//   setUpdate(tableName)
//   getSet()
//   setSet(expressionList)
//   addSet(columnName, value)
//   getWhere()
//   setWhere(newWhereClause)
//   addWhere(columnName)
//
// For Stored Procedure:
//   getCommand()
//   setCommand(newCommand)
//   getSPName()
//   setSPName(spName)
//   getParams()
//   setParams(paramList)
//   addParam(param)
//--------------------------------------------------------------------


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement
//
// DESCRIPTION:
//   Constructor.
//
// ARGUMENTS:
//   theStatement - string - the SQL statement to parse
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SQLStatement(theStatement)
{
  this.setStatement(theStatement);
}


// public methods

SQLStatement.prototype.getType = SQLStatement_getType;
SQLStatement.prototype.setStatement = SQLStatement_setStatement;
SQLStatement.prototype.getStatement = SQLStatement_getStatement;
SQLStatement.prototype.getStatementForMMDB = SQLStatement_getStatementForMMDB;
SQLStatement.prototype.formatStatement = SQLStatement_formatStatement;

// for select statement
SQLStatement.prototype.getSelect = SQLStatement_getSelect;
SQLStatement.prototype.setSelect = SQLStatement_setSelect;
SQLStatement.prototype.addSelect = SQLStatement_addSelect;
SQLStatement.prototype.getFrom = SQLStatement_getFrom;
SQLStatement.prototype.setFrom = SQLStatement_setFrom;
SQLStatement.prototype.addFrom = SQLStatement_addFrom;
SQLStatement.prototype.getWhere = SQLStatement_getWhere;
SQLStatement.prototype.setWhere = SQLStatement_setWhere;
SQLStatement.prototype.addWhere = SQLStatement_addWhere;
SQLStatement.prototype.getGroupBy = SQLStatement_getGroupBy;
SQLStatement.prototype.setGroupBy = SQLStatement_setGroupBy;
SQLStatement.prototype.getHaving = SQLStatement_getHaving;
SQLStatement.prototype.setHaving = SQLStatement_setHaving;
SQLStatement.prototype.getOrderBy = SQLStatement_getOrderBy;
SQLStatement.prototype.setOrderBy = SQLStatement_setOrderBy;
SQLStatement.prototype.addOrderBy = SQLStatement_addOrderBy;

// for insert statement
SQLStatement.prototype.getInsertInto = SQLStatement_getInsertInto;
SQLStatement.prototype.setInsertInto = SQLStatement_setInsertInto;
SQLStatement.prototype.getColumns = SQLStatement_getColumns;
SQLStatement.prototype.setColumns = SQLStatement_setColumns;
SQLStatement.prototype.getValues = SQLStatement_getValues;
SQLStatement.prototype.setValues = SQLStatement_setValues;
SQLStatement.prototype.addInsert = SQLStatement_addInsert;

// for update statement
SQLStatement.prototype.getUpdate = SQLStatement_getUpdate;
SQLStatement.prototype.setUpdate = SQLStatement_setUpdate;
SQLStatement.prototype.getSet = SQLStatement_getSet;
SQLStatement.prototype.setSet = SQLStatement_setSet;
SQLStatement.prototype.addSet = SQLStatement_addSet;

// for delete
SQLStatement.prototype.getDeleteFrom = SQLStatement_getDeleteFrom;
SQLStatement.prototype.setDeleteFrom = SQLStatement_setDeleteFrom;

// for stored procedure call
SQLStatement.prototype.getCommand = SQLStatement_getCommand;
SQLStatement.prototype.setCommand = SQLStatement_setCommand;
SQLStatement.prototype.getSPName = SQLStatement_getSPName;
SQLStatement.prototype.setSPName = SQLStatement_setSPName;
SQLStatement.prototype.getParams = SQLStatement_getParams;
SQLStatement.prototype.setParams = SQLStatement_setParams;
SQLStatement.prototype.addParam = SQLStatement_addParam;

// utility functions
SQLStatement.prototype.getTableNames = SQLStatement_getTableNames;
SQLStatement.prototype.getColumnNames = SQLStatement_getColumnNames;
SQLStatement.prototype.getColumnValues = SQLStatement_getColumnValues;

SQLStatement.prototype.createInsertStatement = SQLStatement_createInsertStatement;
SQLStatement.prototype.createUpdateStatement = SQLStatement_createUpdateStatement;
SQLStatement.prototype.createDeleteStatement = SQLStatement_createDeleteStatement;
SQLStatement.prototype.extractColumnInfo = SQLStatement_extractColumnInfo;

// public properties

SQLStatement.STMT_TYPE_EMPTY       = 0;
SQLStatement.STMT_TYPE_SELECT      = 1;
SQLStatement.STMT_TYPE_INSERT      = 2;
SQLStatement.STMT_TYPE_UPDATE      = 3;
SQLStatement.STMT_TYPE_DELETE      = 4;
SQLStatement.STMT_TYPE_STORED_PROC = 5;
SQLStatement.STMT_TYPE_UNKNOWN     = 9;


// select statement keywords
SQLStatement.SELECT_KEYWORD   = "SELECT ";
SQLStatement.FROM_KEYWORD     = "\nFROM ";
SQLStatement.WHERE_KEYWORD    = "\nWHERE ";
SQLStatement.GROUP_BY_KEYWORD = "\nGROUP BY ";
SQLStatement.HAVING_KEYWORD   = "\nHAVING ";
SQLStatement.ORDER_BY_KEYWORD = "\nORDER BY ";

// insert statement keywords
SQLStatement.INSERT_INTO_KEYWORD = "INSERT INTO ";
SQLStatement.COLUMNS_KEYWORD  = " ";
SQLStatement.VALUES_KEYWORD  = "\nVALUES ";

// update statement keywords
SQLStatement.UPDATE_KEYWORD = "UPDATE ";
SQLStatement.SET_KEYWORD    = "\nSET ";

// delete statement keywords
SQLStatement.DELETE_FROM_KEYWORD = "DELETE FROM ";


// private methods

SQLStatement.prototype.appendToClause = SQLStatement_appendToClause;
SQLStatement.prototype.hasTable = SQLStatement_hasTable;

SQLStatement.prototype.setSelectSQL = SQLStatement_setSelectSQL;
SQLStatement.prototype.getSelectSQL = SQLStatement_getSelectSQL;
SQLStatement.prototype.setInsertSQL = SQLStatement_setInsertSQL;
SQLStatement.prototype.getInsertSQL = SQLStatement_getInsertSQL;
SQLStatement.prototype.setDeleteSQL = SQLStatement_setDeleteSQL;
SQLStatement.prototype.getDeleteSQL = SQLStatement_getDeleteSQL;
SQLStatement.prototype.setUpdateSQL = SQLStatement_setUpdateSQL;
SQLStatement.prototype.getUpdateSQL = SQLStatement_getUpdateSQL;
SQLStatement.prototype.setStoredProcSQL = SQLStatement_setStoredProcSQL;
SQLStatement.prototype.getStoredProcSQL = SQLStatement_getStoredProcSQL;

SQLStatement.stripComments = SQLStatement_stripComments;



//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.getType
//
// DESCRIPTION:
//   Return the type of the SQL Statement.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   enumerated - one of SQLStatement.STMT_TYPE_* 
//--------------------------------------------------------------------

function SQLStatement_getType()
{
  return this.type;
} 


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.setStatement
//
// DESCRIPTION:
//   Parses a SQL statement, determines its type, and extracts the appropriate
//   pieces. 
// 
// ARGUMENTS:
//   theSQL - string - the SQL statement to parse
//
// RETURNS:
//   boolean - true
//--------------------------------------------------------------------

function SQLStatement_setStatement(theSQL) 
{
  var retVal = false;

  // set the default to empty
  this.type = SQLStatement.STMT_TYPE_EMPTY;

  // select statement properties
  this.prefix = '';
  this.selectKeyword = '';
  this.selectClause = '';
  this.fromKeyword = '';
  this.fromClause = '';
  this.whereKeyword = '';
  this.whereClause = '';
  this.groupByKeyword = '';
  this.groupByClause = '';
  this.havingKeyword = '';
  this.havingClause = '';
  this.orderByKeyword = '';
  this.orderByClause = '';

  // insert statement properties
  this.insertIntoKeyword = '';
  this.insertIntoClause = '';
  this.columnsKeyword = '';
  this.columnsClause = '';
  this.valuesKeyword = '';
  this.valuesClause = '';

  // update statement properties
  this.updateKeyword = '';
  this.updateClause = '';
  this.setKeyword = '';
  this.setClause = '';

  // delete statement properties
  this.deleteFromKeyword = '';
  this.deleteFromClause = '';

  // stored procedure statement properties
  this.command = '';
  this.SPName = '';
  this.paramArray = new Array();


  // now parse the sql
  if (typeof theSQL == "string") 
  { 
    //strip trailing ';' if present
    theSQL = theSQL.replace(/\s*;\s*$/, "");

    if (dwscripts.trim(theSQL)=="") 
    {
      this.type = SQLStatement.STMT_TYPE_EMPTY;
    } 
    else if (this.setSelectSQL(theSQL))
    {
      this.type = SQLStatement.STMT_TYPE_SELECT;
    }
    else if (this.setInsertSQL(theSQL))
    {      
      this.type = SQLStatement.STMT_TYPE_INSERT;
    } 
    else if (this.setDeleteSQL(theSQL))
    {
      this.type = SQLStatement.STMT_TYPE_DELETE;
    } 
    else if (this.setUpdateSQL(theSQL))
    {
      this.type = SQLStatement.STMT_TYPE_UPDATE;
    } 
    else if (this.setStoredProcSQL(theSQL))
    {
      this.type = SQLStatement.STMT_TYPE_STORED_PROC;
    }
    else
    {
      this.type = SQLStatement.STMT_TYPE_UNKNOWN;
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.getStatement
//
// DESCRIPTION:
//   Get the string representation of the SQL Statement.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - the sql string. Returns empty string if no SQL.
//--------------------------------------------------------------------

function SQLStatement_getStatement(stripLineBreaks)
{
  var theSQL = "";

  switch (this.type)
  {
    case SQLStatement.STMT_TYPE_SELECT:
      theSQL = this.getSelectSQL(stripLineBreaks);
      break;
    case SQLStatement.STMT_TYPE_INSERT:
      theSQL = this.getInsertSQL(stripLineBreaks);
      break;
    case SQLStatement.STMT_TYPE_UPDATE:
      theSQL = this.getUpdateSQL(stripLineBreaks);
      break;
    case SQLStatement.STMT_TYPE_DELETE:
      theSQL = this.getDeleteSQL(stripLineBreaks);
      break;
    case SQLStatement.STMT_TYPE_STORED_PROC:
      theSQL = this.getStoredProcSQL(stripLineBreaks);
      break;
  }

  // Replace multiple line-breaks with a single  
  theSQL = theSQL.replace(/[\n\r]+[\n\r]+/gi, "\n");

  return theSQL;  
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.getStatementForMMDB
//
// DESCRIPTION:
//   This function returns a SQL statement suitable for use in
//   the function MMDB.getColumnAndTypeList(). It removes all clauses
//   other than SELECT, FROM and GROUP BY, and adds a dummy WHERE clause, which
//   ensures that no data is actually returned.
//
//   This works around a bug in CF RDS due to lack for max rows , 
//   and in ASP to work around blobs 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - a simple sql statement with a dummy where clause 
//--------------------------------------------------------------------

function SQLStatement_getStatementForMMDB()
{
  var stmt = new Array();

  if (this.type == SQLStatement.STMT_TYPE_SELECT)
  {
    stmt.push(this.selectKeyword);
    stmt.push(this.selectClause);
    stmt.push(this.fromKeyword);
    stmt.push(this.fromClause);
    stmt.push(SQLStatement.WHERE_KEYWORD);
    stmt.push("0 = 1");
	
    // We need to keep the group by clause if
    // there is one
    if (this.groupByKeyword)
    {
      stmt.push(this.groupByKeyword);
      stmt.push(this.groupByClause);
    }
  }

  retVal = stmt.join("");
  
  retVal = SQLStatement.stripComments(retVal);

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   formatStatement
//
// DESCRIPTION:
//   This function formats the SQL statement to clean up 
//   line breaks, etc.  This is useful for languages which store the
//   SQL as a single quoted string.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SQLStatement_formatStatement()
{
  if (this.type == SQLStatement.STMT_TYPE_SELECT)
  {
    // set the keyword variables to their formatted values
    if (this.selectKeyword)
    {
      this.selectKeyword = SQLStatement.SELECT_KEYWORD;
    }
    if (this.fromKeyword)
    {
      this.fromKeyword = SQLStatement.FROM_KEYWORD;
    }
    if (this.whereKeyword)
    {
      this.whereKeyword = SQLStatement.WHERE_KEYWORD;
    }
    if (this.groupByKeyword)
    {
      this.groupByKeyword = SQLStatement.GROUP_BY_KEYWORD;
    }
    if (this.havingKeyword)
    {
      this.havingKeyword = SQLStatement.HAVING_KEYWORD;
    }
    if (this.orderByKeyword)
    {
      this.orderByKeyword = SQLStatement.ORDER_BY_KEYWORD;
    }
  }
  else if (this.type == SQLStatement.STMT_TYPE_INSERT)
  {
    if (this.insertIntoKeyword)
    {
      this.insertIntoKeyword = SQLStatement.INSERT_INTO_KEYWORD;
    }
    if (this.columnsKeyword)
    {
      this.columnsKeyword = SQLStatement.COLUMNS_KEYWORD;
    }
    if (this.valuesKeyword)
    {
      this.valuesKeyword = SQLStatement.VALUES_KEYWORD;
    }
  }
  else if (this.type == SQLStatement.STMT_TYPE_UPDATE)
  {
    if (this.updateKeyword)
    {
      this.updateKeyword = SQLStatement.UPDATE_KEYWORD;
    }
    if (this.setKeyword)
    {
      this.setKeyword = SQLStatement.SET_KEYWORD;
    }
    if (this.whereKeyword)
    {
      this.whereKeyword = SQLStatement.WHERE_KEYWORD;
    }
  }
  else if (this.type == SQLStatement.STMT_TYPE_DELETE)
  {
    if (this.deleteFromKeyword)
    {
      this.deleteFromKeyword = SQLStatement.DELETE_FROM_KEYWORD;
    }
    if (this.whereKeyword)
    {
      this.whereKeyword = SQLStatement.WHERE_KEYWORD;
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.stripComments
//
// DESCRIPTION:
//   This function removes comments from the given sql statement.
//   This function only supports comments of the type /* ... */
//
// ARGUMENTS:
//   theSQL - string - the SQL statement to strip comments from
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function SQLStatement_stripComments(theSQL)
{
  var retVal = theSQL;
   
  if (theSQL)
  {
    retVal = theSQL.replace(/\/\*[\S\s]*?\*\//g, " ");
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.setSelectSQL
//
// DESCRIPTION:
//   Parses the sql as a SelectStatement
//
// ARGUMENTS:
//   theSQL - string - the SQL statement to set
//
// RETURNS:
//   boolean - true if successfully parsed the SQL as a select statement
//--------------------------------------------------------------------

function SQLStatement_setSelectSQL(theSQL)
{
  var retVal = false;
  
  var oldMultiLine = RegExp.multiline;
  RegExp.multiline = false;
  
  //var match = theSQL.match(/^([\S\s]*?)(select\s+)([\S\s]+?)(\s+from\s+)([\S\s]+?)(?:(\s+where\s+)([\S\s]+?))?(?:(\s+group\s+by\s+)([\S\s]+?))?(?:(\s+having\s+)([\S\s]+?))?(?:(\s+order\s+by\s+)([\S\s]+))?$/i);
  var match = theSQL.match(/^([\S\s]*?)(select\s*?)((?!from\b)[\S][\S\s]*?)?(?:(\s+from\b\s*?)((?!where|group by|having|order by)[\S][\S\s]*?)?)?(?:(\s+where\s*?)((?!group by|having|order by)[\S][\S\s]*?)?)?(?:(\s+group\s+by\s*?)((?!having|order by)[\S][\S\s]*?)?)?(?:(\s+having\s*?)((?!order by)[\S][\S\s]*?)?)?(?:(\s+order\s+by\s*?)([\S][\S\s]*)?)?$/i);
  
  RegExp.multiline = oldMultiLine;
  
  if (match && match.length > 0 && match[0].length == theSQL.length)
  {
    retVal = true;

    // set uninitialized array variables
    for (var i=0; i < 14; i++)
    {
      if (match[i] == null)
      {
        match[i] = '';
      }
    }
    
    this.prefix = match[1];
    this.selectKeyword = match[2];
    this.selectKeyword = this.selectKeyword.replace(/([^\s])$/,"$1 ");
    this.fromKeyword = match[4];
    this.fromKeyword = this.fromKeyword.replace(/([^\s])$/,"$1 ");
    this.whereKeyword = match[6];
    this.whereKeyword = this.whereKeyword.replace(/([^\s])$/,"$1 ");
    this.groupByKeyword = match[8];
    this.groupByKeyword = this.groupByKeyword.replace(/([^\s])$/,"$1 ");
    this.havingKeyword = match[10];
    this.havingKeyword = this.havingKeyword.replace(/([^\s])$/,"$1 ");
    this.orderByKeyword = match[12];
    this.orderByKeyword = this.orderByKeyword.replace(/([^\s])$/,"$1 ");

    retVal &= this.setSelect( match[3] );
    retVal &= this.setFrom( match[5] );
    retVal &= this.setWhere( match[7] );
    retVal &= this.setGroupBy( match[9] );
    retVal &= this.setHaving( match[11] );
    retVal &= this.setOrderBy( match[13] );
  } 
  
  return retVal;  
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.getSelectSQL
//
// DESCRIPTION:
//   Returns the string representation of the select statement.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function SQLStatement_getSelectSQL(stripLineBreaks) 
{
  var stmt = new Array();

  stmt.push(this.prefix);
  stmt.push(this.selectKeyword);
  stmt.push(this.selectClause);
  stmt.push(this.fromKeyword);
  stmt.push(this.fromClause);
  stmt.push(this.whereKeyword);
  stmt.push(this.whereClause);
  stmt.push(this.groupByKeyword);
  stmt.push(this.groupByClause);
  stmt.push(this.havingKeyword);
  stmt.push(this.havingClause);
  stmt.push(this.orderByKeyword);
  stmt.push(this.orderByClause);

  retVal = stmt.join("");

  if (stripLineBreaks)
  { 
    retVal = retVal.replace(/[\r\n]+/gi," "); 
  } 
 
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.setInsertSQL
//
// DESCRIPTION:
//   Parse the SQL for an Insert Statement
//
// ARGUMENTS:
//   theSQL - string - the SQL statement to parse
//
// RETURNS:
//   boolean - true if successfully parsed SQL as insert statement
//--------------------------------------------------------------------

function SQLStatement_setInsertSQL(theSQL)
{
  var retVal = false;

  var oldMultiLine = RegExp.multiline;
  RegExp.multiline = false;
  
  var match = theSQL.match(/^(\s*insert\s+into\s+)(\S+)(\s*)(\([\S\s]+\))(\s*values\s*)(\([\S\s]+\))\s*$/i);

  RegExp.multiline = oldMultiLine;
  
  if (match && match.length > 0 && match[0].length == theSQL.length)
  {
    retVal = true;

    // set uninitialized array variables
    for (var i=0; i < 7; i++)
    {
      if (match[i] == null)
      {
        match[i] = '';
      }
    }
    
    this.insertKeyword = match[1];
    this.columnsKeyword = match[3];
    this.valuesKeyword = match[5];

    retVal &= this.setInsertInto(match[2]);
    retVal &= this.setColumns(match[4]);
    retVal &= this.setValues(match[6]);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.getInsertSQL
//
// DESCRIPTION:
//   Returns a string representation of the insert statement
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function SQLStatement_getInsertSQL(stripLineBreaks)
{
  var stmt = new Array();

  stmt.push(this.insertIntoKeyword);
  stmt.push(this.insertIntoClause);
  stmt.push(this.columnsKeyword);
  stmt.push(this.columnsClause);
  stmt.push(this.valuesKeyword);
  stmt.push(this.valuesClause);

  retVal = stmt.join("");

  if (stripLineBreaks)
  { 
    retVal = retVal.replace(/[\n\r]/gi," "); 
  } 

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.setUpdateSQL
//
// DESCRIPTION:
//   Parse the sql as an update statement.
//
// ARGUMENTS:
//   theSQL - string - the SQL statement to parse
//
// RETURNS:
//   boolean - true is successfully parsed the sql as update statement
//--------------------------------------------------------------------

function SQLStatement_setUpdateSQL(theSQL)
{
  var retVal = false;

  var oldMultiLine = RegExp.multiline;
  RegExp.multiline = false;
  
  var match = theSQL.match(/^(\s*update\s+)(\S+)(\s+set\s+)([\S\s]+?)(?:(\s+where\s+)([\S\s]*))?\s*$/i);

  RegExp.multiline = oldMultiLine;
  
  if (match && match.length > 0 && match[0].length == theSQL.length)
  {
    retVal = true;

    // set uninitialized array variables
    for (var i=0; i < 7; i++)
    {
      if (match[i] == null)
      {
        match[i] = '';
      }
    }

    this.updateKeyword = match[1];
    this.setKeyword = match[3];
    this.whereKeyword = match[5];

    retVal &= this.setUpdate(match[2]);
    retVal &= this.setSet(match[4]);
    retVal &= this.setWhere(match[6]);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.getUpdateSQL
//
// DESCRIPTION:
//   Returns the string representation of the Update Statement.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function SQLStatement_getUpdateSQL(stripLineBreaks)
{
  var stmt = new Array();

  stmt.push(this.updateKeyword);
  stmt.push(this.updateClause);
  stmt.push(this.setKeyword);
  stmt.push(this.setClause);
  stmt.push(this.whereKeyword);
  stmt.push(this.whereClause);

  retVal = stmt.join("");

  if (stripLineBreaks)
  { 
    retVal = retVal.replace(/[\n\r]/gi," "); 
  }   

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.setDeleteSQL
//
// DESCRIPTION:
//   Parse the sql as a delete statement.
//
// ARGUMENTS:
//   theSQL - string - the SQL statement to parse
//
// RETURNS:
//   boolean - true if successfully parsed sql as a delete statement.
//--------------------------------------------------------------------

function SQLStatement_setDeleteSQL(theSQL) 
{
  var retVal = false;

  var oldMultiLine = RegExp.multiline;
  RegExp.multiline = false;
  
  var match = theSQL.match(/^(\s*delete\s+from\s+)(\S+)(\s+where\s+)([\S\s]*)$/i);

  RegExp.multiline = oldMultiLine;
  
  if (match && match.length > 0 && match[0].length == theSQL.length)
  {
    retVal = true;

    // set uninitialized array variables
    for (var i=0; i < 5; i++)
    {
      if (match[i] == null)
      {
        match[i] = '';
      }
    }

    this.deleteFromKeyword = match[1];
    this.whereKeyword = match[3];

    retVal &= this.setDeleteFrom(match[2]);
    retVal &= this.setWhere(match[4]);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.getDeleteSQL
//
// DESCRIPTION:
//   Returns the string representation of the delete statement.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function SQLStatement_getDeleteSQL(stripLineBreaks)
{
  var stmt = new Array();

  stmt.push(this.deleteFromKeyword);
  stmt.push(this.deleteFromClause);
  stmt.push(this.whereKeyword);
  stmt.push(this.whereClause);

  retVal = stmt.join("");

  if (stripLineBreaks)
  { 
    retVal = retVal.replace(/[\n\r]/gi," "); 
  }   
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.setStoredProcSQL
//
// DESCRIPTION:
//   Parse the SQL as a stored procedure call.
//
// ARGUMENTS:
//   theSQL - string - the SQL statement to parse
//
// RETURNS:
//   boolean - true if successfully parsed the sql as a stored procedure call.
//--------------------------------------------------------------------

function SQLStatement_setStoredProcSQL(theSQL)
{
  var success = false;

  var oldMultiLine = RegExp.multiline;
  RegExp.multiline = false;

  if (theSQL.search(/^\s*\{\s*(call|exec|execute)\s+(\S+)\s*(?:\(([\S\s]*)\))?\s*\}\s*$/i) != -1)
  {
    // capture subexpressions before we execute any other regexp's.
    var command = RegExp.$1;
    var spName = RegExp.$2;
    var params = RegExp.$3;
    success = true;
    this.paramArray = new Array();
  
    this.setCommand( command );
    this.setSPName( spName );
    this.setParams( params );
  }

  RegExp.multiline = oldMultiLine;  
  
  return success;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.getStoredProcSQL
//
// DESCRIPTION:
//   Returns the string representation of the stored procedure call.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function SQLStatement_getStoredProcSQL()
{
  var retVal = "{" + this.command + " " + this.SPName;

  if (this.paramArray.length > 0)
  {
    retVal += " (" + this.paramArray.join(", ") + ") ";
  }

  retVal += "}";

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   appendToClause
//
// DESCRIPTION:
//   This function adds a new value to a comma separated clause
//
// ARGUMENTS:
//   origClause - string - the clause to append to
//   newValue - string - the value to append to the clause
//
// RETURNS:
//   string - the new clause with the value appended
//--------------------------------------------------------------------

function SQLStatement_appendToClause(origClause, newValue)
{
  var retVal = origClause;

  var trimmedClause = dwscripts.trim(origClause);

  if (trimmedClause.length == 0)
  {
    retVal = newValue;
  }
  else if (trimmedClause.charAt(trimmedClause.length - 1) == ',')
  {
    retVal = origClause + " " + newValue;
  }
  else
  {
    retVal = origClause + ", " + newValue;
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   hasTable
//
// DESCRIPTION:
//   Returns true if the current statement contains the given table
//
// ARGUMENTS:
//   tableName - string - the table name to check
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function SQLStatement_hasTable(tableName)
{
  var retVal = false;
  
  tableName = dwscripts.encodeSQLTableRef(tableName);

  if (this.type == SQLStatement.STMT_TYPE_SELECT)
  {
    if (this.fromClause)
    {
      var searchClause = " " + this.fromClause + " ";
      
      tablePatt = new RegExp("[,\\s]" + dwscripts.escRegExpChars(tableName) + "[,\\s]", "i");
      
      if (tablePatt.test(searchClause))
      {
        retVal = true;
      }      
    }
  }
  else if (this.type == SQLStatement.STMT_TYPE_INSERT)
  {
    if (this.insertIntoClause)
    {
      var searchClause = " " + this.insertIntoClause + " ";
      
      tablePatt = new RegExp("[,\\s]" + dwscripts.escRegExpChars(tableName) + "[,\\s]", "i");
      
      if (tablePatt.test(searchClause))
      {
        retVal = true;
      }      
    }
  }
  else if (this.type == SQLStatement.STMT_TYPE_UPDATE)
  {
    if (this.updateClause)
    {
      var searchClause = " " + this.updateClause + " ";
      
      tablePatt = new RegExp("[,\\s]" + dwscripts.escRegExpChars(tableName) + "[,\\s]", "i");
      
      if (tablePatt.test(searchClause))
      {
        retVal = true;
      }      
    }
  }
  else if (this.type == SQLStatement.STMT_TYPE_DELETE)
  {
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.getSelect
//
// DESCRIPTION:
//   Returns the SELECT clause of the SQL statement
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   Array of strings - the column names in the SELECT clause
//--------------------------------------------------------------------

function SQLStatement_getSelect()
{ 
  return this.selectClause;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.setSelect
//
// DESCRIPTION:
//   Sets the SELECT clause of the SQL statement
//
// ARGUMENTS:
//   newSelectClause - string - the clause that should appear after
//     the select statement
//
// RETURNS:
//   boolean - true for success, false otherwise
//--------------------------------------------------------------------

function SQLStatement_setSelect(newSelectClause)
{
  var retVal = true;

  if (newSelectClause)
  {
    this.selectClause = newSelectClause;

    if (!this.selectKeyword)
    {
      this.selectKeyword = SQLStatement.SELECT_KEYWORD;
    }
  }
  else
  {
    this.selectClause = "";
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.addSelect
//
// DESCRIPTION:
//   Adds a column to the SELECT clause without duplication.
//   Will apply table qualifiers if needed to disambiguate columns.
//
// ARGUMENTS:
//   tableName - string - the name of the table conataining this column
//   columnName - string - the column name to add to the SELECT clause
//   noTablePrefix - boolean - true if the table name prefix should not
//     be included
//
// RETURNS:
//   boolean - true if added, false if not added
//--------------------------------------------------------------------

function SQLStatement_addSelect(tableName, columnName, noTablePrefix)
{
  var retVal = false;

  var myTable = dwscripts.trim(tableName);
  var myCol = dwscripts.trim(columnName);

  if (this.type == SQLStatement.STMT_TYPE_SELECT &&
      myCol != "" &&
      (!myTable || this.hasTable(myTable)))
  {
    var columnRef = "";
    if (noTablePrefix)
    {
      columnRef = dwscripts.encodeSQLColumnRef("", myCol);
    }
    else
    {
      columnRef = dwscripts.encodeSQLColumnRef(myTable, myCol);
    }
    
    //special case to replace * with first column
    if (this.selectClause.length == 1 && this.selectClause == "*")
    {
      this.selectClause = columnRef;
      retVal = true;
    }

    if (!retVal)
    {
      this.selectClause = this.appendToClause(this.selectClause, columnRef);
      retVal = true;
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.getFrom
//
// DESCRIPTION:
//   Returns the FROM clause of a SQL statement
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   JavaScript Array of strings
//--------------------------------------------------------------------

function SQLStatement_getFrom()
{
  return this.fromClause;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.setFrom
//
// DESCRIPTION:
//   Sets the FROM clause of the SQL statement
//
// ARGUMENTS:
//   newFromClause - string - the clause to appear after the from
//     keyword
//
// RETURNS:
//   boolean - true for success, false otherwise
//--------------------------------------------------------------------

function SQLStatement_setFrom(newFromClause)
{
  var retVal = true;

  if (newFromClause)
  {
    this.fromClause = newFromClause;

    if (!this.fromKeyword)
    {
      this.fromKeyword = SQLStatement.FROM_KEYWORD;
    }
  }
  else
  {
    this.fromClause = "";
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.addFrom
//
// DESCRIPTION:
//   Adds a table to the FROM clause without duplication.
//   Will not allow the addition if it would result in name conflict
//   with another table or alias.
//
// ARGUMENTS:
//   tableName - string - the table name to add to the FROM clause
//
// RETURNS:
//   boolean - true if added, false if not
//--------------------------------------------------------------------

function SQLStatement_addFrom(tableName)
{
  var retVal = false;

  var myTable = dwscripts.trim(tableName);
  
  // make sure they passed a table name
  if (myTable != "")
  {
    retVal = true;

    // if the statement type is empty, make it a select
    if (this.type == SQLStatement.STMT_TYPE_EMPTY)
    {
      this.type = SQLStatement.STMT_TYPE_SELECT;
    }

    // check if the table already exists
    if (this.hasTable(myTable))
    {
      retVal = false;
    }

    if (retVal)
    {
      if (!this.fromKeyword)
      {
        this.fromKeyword = SQLStatement.FROM_KEYWORD;
      }

      if (!this.fromClause)
      {
        this.fromClause = dwscripts.encodeSQLTableRef(myTable);
      }
      else
      {
        this.fromClause = this.appendToClause(this.fromClause, dwscripts.encodeSQLTableRef(myTable));
      }

      if (!this.selectKeyword)
      {
        this.selectKeyword = SQLStatement.SELECT_KEYWORD;
      }
      if (!this.selectClause)
      {
        this.selectClause = "*";
      }
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.getWhere
//
// DESCRIPTION:
//   Returns the WHERE clause from the SQL statement
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function SQLStatement_getWhere()
{
  return this.whereClause;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.setWhere
//
// DESCRIPTION:
//   Sets the WHERE clause for the SQL statement
//
// ARGUMENTS:
//   newWhereClause - string - the new WHERE clause
//
// RETURNS:
//   boolean - true if set, flase if not
//--------------------------------------------------------------------

function SQLStatement_setWhere(newWhereClause)
{
  var retVal = true;

  if (newWhereClause)
  {
    this.whereClause = newWhereClause;

    if (!this.whereKeyword)
    {
      this.whereKeyword = SQLStatement.WHERE_KEYWORD;
    }
  }
  else
  {
    this.whereClause = "";
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.addWhere
//
// DESCRIPTION:
//   Adds a column to the WHERE clause of the SQL statement.
//
//   NOTE: This is only a UI convenience function, in that the 
//         resultant WHERE clause is unlikely to make sense.
//
// ARGUMENTS:
//   tableName - string - the name of the table conataining this column
//   columnName - string - the column name to add to the WHERE clause
//   noTablePrefix - boolean - true if the table name prefix should not
//     be included
//
// RETURNS:
//   boolean - true if added, false if not
//--------------------------------------------------------------------

function SQLStatement_addWhere(tableName, columnName, noTablePrefix)
{
  var retVal = false;

  var operator = ""; 

  var myTable = dwscripts.trim(tableName);
  var myCol = dwscripts.trim(columnName);

  if (this.type == SQLStatement.STMT_TYPE_SELECT &&
      myCol != "" &&
      (!myTable || this.hasTable(myTable)))
  {
    var columnRef = "";
    if (noTablePrefix)
    {
      columnRef = dwscripts.encodeSQLColumnRef("", myCol);
    }
    else
    {
      columnRef = dwscripts.encodeSQLColumnRef(myTable, myCol);
    }
    
    if (this.whereClause.length > 0 && 
        this.whereClause.search(/(=|<|>|(<=)|(>=)|(<>)|(and)|(or)|(not)|(is)|(in)|(like))\s*$/i) == -1)
    {
      operator = " AND ";
    }

    this.whereClause += operator + columnRef;

    if (!this.whereKeyword)
    {
      this.whereKeyword = SQLStatement.WHERE_KEYWORD;
    }

    retVal = true;
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getGroupBy
//
// DESCRIPTION:
//   Return the GROUP BY clause for the SQL statement
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function SQLStatement_getGroupBy()
{ 
  return this.groupByClause;
}


//--------------------------------------------------------------------
// FUNCTION:
//   setGroupBy
//
// DESCRIPTION:
//   Sets the GROUP BY clause of the SQL statement
//
// ARGUMENTS:
//   newGroupByClause - string - the new GROUP BY clause
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function SQLStatement_setGroupBy(newGroupByClause)
{
  var retVal = true;

  if (newGroupByClause)
  {
    this.groupByClause = newGroupByClause;

    if (!this.groupByKeyword)
    {
      this.groupByKeyword = SQLStatement.GROUP_BY_KEYWORD;
    }
  }
  else
  {
    this.groupByClause = "";
  }

  return retVal; 
}


//--------------------------------------------------------------------
// FUNCTION:
//   getHaving
//
// DESCRIPTION:
//   Returns the HAVING clause of the SQL statement
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function SQLStatement_getHaving()
{ 
  return this.havingClause;
}


//--------------------------------------------------------------------
// FUNCTION:
//   setHaving
//
// DESCRIPTION:
//   Sets the HAVING clause of the SQL statement
//
// ARGUMENTS:
//   newHavingClause - string - the new HAVING clause
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function SQLStatement_setHaving(newHavingClause)
{
  var retVal = true;

  if (newHavingClause)
  {
    this.havingClause = newHavingClause;

    if (!this.havingKeyword)
    {
      this.havingKeyword = SQLStatement.HAVING_KEYWORD;
    }
  }
  else
  {
    this.havingClause = "";
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getOrderBy
//
// DESCRIPTION:
//   Returns the ORDER BY clause of the SQL statement
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function SQLStatement_getOrderBy() 
{ 
  return this.orderByClause;
}


//--------------------------------------------------------------------
// FUNCTION:
//   setOrderBy
//
// DESCRIPTION:
//   Sets the ORDER BY clause of the SQL statement
//
// ARGUMENTS:
//   newOrderByClause - string - the new ORDER BY clause
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function SQLStatement_setOrderBy(newOrderByClause)
{
  var retVal =  true;

  if (newOrderByClause)
  {
    this.orderByClause = newOrderByClause;

    if (!this.orderByKeyword)
    {
      this.orderByKeyword = SQLStatement.ORDER_BY_KEYWORD;
    }
  }
  else
  {
    this.orderByClause = "";
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   addOrderBy
//
// DESCRIPTION:
//   Adds stuff to the ORDER BY clause.
//   No duplication check is done.
//
// ARGUMENTS:
//   tableName - string - the name of the table conataining this column
//   columnName - string - the column name to add to the ORDER BY clause
//   sortDirection - string - optional sort direction string (ASC, DEC)
//   noTablePrefix - boolean - true if the table name prefix should not
//     be included
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function SQLStatement_addOrderBy(tableName, columnName, sortDirection, noTablePrefix)
{
  var retVal = false;

  var myTable = dwscripts.trim(tableName);
  var myCol = dwscripts.trim(columnName);

  if (this.type == SQLStatement.STMT_TYPE_SELECT &&
      myCol != "" &&
      (!myTable || this.hasTable(myTable)))
  {
    var columnRef = "";
    if (noTablePrefix)
    {
      columnRef = dwscripts.encodeSQLColumnRef("", myCol);
    }
    else
    {
      columnRef = dwscripts.encodeSQLColumnRef(myTable, myCol);
    }
    
    this.orderByClause = this.appendToClause(this.orderByClause, columnRef);

    if (sortDirection)
    {
      this.orderByClause += " " + sortDirection;
    }

    if (!this.orderByKeyword)
    {
      this.orderByKeyword = SQLStatement.ORDER_BY_KEYWORD;
    }

    retVal = true;
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.getUpdate
//
// DESCRIPTION:
//   Returns the update clause from the UPDATE statement
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function SQLStatement_getInsertInto()
{
  return this.insertIntoClause;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.setInsertInto
//
// DESCRIPTION:
//   Sets the table for the SQL statement
//
// ARGUMENTS:
//   tableName - string - the new table to set
//
// RETURNS:
//   boolean - true if set, false if not
//--------------------------------------------------------------------

function SQLStatement_setInsertInto(tableName)
{
  var retVal =  true;

  if (tableName)
  {
    this.insertIntoClause = tableName;
    
    if (this.type == SQLStatement.STMT_TYPE_EMPTY)
    {
      this.type = SQLStatement.STMT_TYPE_INSERT;
    }

    if (!this.insertIntoKeyword)
    {
      this.insertIntoKeyword = SQLStatement.INSERT_INTO_KEYWORD;
    }
  }
  else
  {
    this.insertIntoClause = "";
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.getColumns
//
// DESCRIPTION:
//   Returns an array of the column names referenced in the INSERT
//   statement
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   JavaScript Array of strings
//--------------------------------------------------------------------

function SQLStatement_getColumns()
{
  return this.columnsClause;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.setColumns
//
// DESCRIPTION:
//   Sets the columns of the INSERT statement
//
// ARGUMENTS:
//   newColumnsClause - string - A comma separated list of columns
//     for the insert statement
//
// RETURNS:
//   boolean - true if set, false if not
//--------------------------------------------------------------------

function SQLStatement_setColumns(newColumnsClause)
{
  var retVal =  true;

  if (newColumnsClause)
  {
    this.columnsClause = newColumnsClause;

    if (!this.columnsKeyword)
    {
      this.columnsKeyword = SQLStatement.COLUMNS_KEYWORD;
    }
  }
  else
  {
    this.columnsClause = "";
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.getValues
//
// DESCRIPTION:
//   Returns an array of the values within the INSERT statement
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   JavaScript Array of strings -  the values within the INSERT
//--------------------------------------------------------------------

function SQLStatement_getValues()
{
  return this.valuesClause;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.setValues
//
// DESCRIPTION:
//   Sets the values within the INSERT statement
//
// ARGUMENTS:
//   newValuesClause - string - the new values clause
//
// RETURNS:
//   boolean - true if set, false if not
//--------------------------------------------------------------------

function SQLStatement_setValues(newValuesClause)
{
  var retVal =  true;

  if (newValuesClause)
  {
    this.valuesClause = newValuesClause;

    if (!this.valuesKeyword)
    {
      this.valuesKeyword = SQLStatement.VALUES_KEYWORD;
    }
  }
  else
  {
    this.valuesClause = "";
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.addInsert
//
// DESCRIPTION:
//   Adds a column and value to the INSERT statement
//
// ARGUMENTS:
//   columnName - string - the column name
//   value - string - the value for the column
//
// RETURNS:
//   boolean - true if added, false if not
//--------------------------------------------------------------------

function SQLStatement_addInsert(columnName, value)
{
  var retVal = false;
  
  var myTable = this.insertIntoClause;
  var myColumnName = dwscripts.trim(columnName);
  var myValue = dwscripts.trim(value);
  
  // Make sure we have items to insert, and that the statement
  //  type has already been set.  This is done in setInsertInto.
  if (myColumnName && myValue && 
      this.type == SQLStatement.STMT_TYPE_INSERT)
  {
    // add the column and value
    if (!this.columnsClause && !this.valuesClause)
    {
      // don't pass the table name, so we don't prefix the column ref
      this.columnsClause = "(" + dwscripts.encodeSQLColumnRef("",myColumnName) + ")";
      this.valuesClause = "(" + myValue + ")";
      
      if (!this.columnsKeyword)
      {
        this.columnsKeyword = SQLStatement.COLUMNS_KEYWORD;
      }
      
      if (!this.valuesKeyword)
      {
        this.valuesKeyword = SQLStatement.VALUES_KEYWORD;
      }
    }
    else
    {
      // in order to append the values, we will remove the 
      // trailing paren, and then use the standard appendToClause
      // function
      var parenIndex = this.columnsClause.lastIndexOf(")");
      if (parenIndex != -1)
      {
        var subClause = this.columnsClause.substring(0, parenIndex);
        this.columnsClause = this.appendToClause(subClause, dwscripts.encodeSQLColumnRef("",myColumnName)) +
                             this.columnsClause.substring(parenIndex);
      }
      else
      {
        this.columnsClause = this.appendToClause(subClause, dwscripts.encodeSQLColumnRef("",myColumnName));
      }

      var parenIndex = this.valuesClause.lastIndexOf(")");
      if (parenIndex != -1)
      {
        var subClause = this.valuesClause.substring(0, parenIndex);
        this.valuesClause = this.appendToClause(subClause, myValue) +
                             this.valuesClause.substring(parenIndex);
      }
      else
      {
        this.valuesClause = this.appendToClause(subClause, myValue);
      }
            
    }      
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.getUpdate
//
// DESCRIPTION:
//   Returns the update clause from the UPDATE statement
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function SQLStatement_getUpdate()
{
  return this.updateClause;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.setUpdate
//
// DESCRIPTION:
//   Sets the table for the SQL statement
//
// ARGUMENTS:
//   tableName - string - the new table to set
//
// RETURNS:
//   boolean - true if set, false if not
//--------------------------------------------------------------------

function SQLStatement_setUpdate(tableName)
{
  var retVal =  true;

  if (tableName)
  {
    this.updateClause = tableName;

    if (!this.updateKeyword)
    {
      this.updateKeyword = SQLStatement.UPDATE_KEYWORD;
    }
  }
  else
  {
    this.updateClause = "";
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.getSet
//
// DESCRIPTION:
//   Returns the SET clause within the UPDATE statement
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   JavaScript Array of strings - each string will be in the form
//     of "column = value"
//--------------------------------------------------------------------

function SQLStatement_getSet()
{
  return this.setClause;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.setSet
//
// DESCRIPTION:
//   Sets the UPDATE clause of the UPDATE statement
//
// ARGUMENTS:
//   expressionList - string - a comma separated list of expressions.
//     (each expression should be in the form of "column = value")
//
// RETURNS:
//   boolean - true if set, false if not
//--------------------------------------------------------------------

function SQLStatement_setSet(expressionList)
{
  var retVal =  true;

  if (expressionList)
  {
    this.setClause = expressionList;

    if (!this.setKeyword)
    {
      this.setKeyword = SQLStatement.SET_KEYWORD;
    }
  }
  else
  {
    this.setClause = "";
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.addSet
//
// DESCRIPTION:
//   Adds a "column = value" expression to the SET clause
//
// ARGUMENTS:
//   columnName - string. the column name
//   value - string. the value for the column
//
// RETURNS:
//   boolean - true if added, false if not
//--------------------------------------------------------------------

function SQLStatement_addSet(columnName, value)
{
  var retVal = false;
  var myTable = this.updateClause;
  var myColumnName = dwscripts.trim(columnName);
  var myValue = dwscripts.trim(value);
  
  // Make sure we have items to update, and that the statement
  //  type has already been set.  This is done in setUpdate.
  if (myColumnName && myValue && 
      this.type == SQLStatement.STMT_TYPE_UPDATE)
  {
    retVal = true;
    
    if (!this.setClause)
    {
      this.setClause = dwscripts.encodeSQLColumnRef("", myColumnName) + "=" + myValue;
      
      if (!this.setKeyword)
      {
        this.setKeyword = SQLStatement.SET_KEYWORD;
      }
    }
    else
    {
      this.setClause = this.appendToClause(this.setClause, dwscripts.encodeSQLColumnRef("", myColumnName) 
                                                           + "=" + myValue);
    }      
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.getDeleteFrom
//
// DESCRIPTION:
//   Returns the delete from clause from the DELETE statement
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function SQLStatement_getDeleteFrom()
{
  return this.deleteFromClause;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.setDeleteFrom
//
// DESCRIPTION:
//   Sets the delete from clause for the DELETE statement
//
// ARGUMENTS:
//   tableName - string - the new table to set
//
// RETURNS:
//   boolean - true if set, false if not
//--------------------------------------------------------------------

function SQLStatement_setDeleteFrom(tableName)
{
  var retVal =  true;

  if (tableName)
  {
    this.deleteFromClause = tableName;

    if (this.type == SQLStatement.STMT_TYPE_EMPTY)
    {
      this.type = SQLStatement.STMT_TYPE_DELETE;
    }
     
    if (!this.deleteFromKeyword)
    {
      this.deleteFromKeyword = SQLStatement.DELETE_FROM_KEYWORD;
    }
  }
  else
  {
    this.deleteFromClause = "";
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.getCommand
//
// DESCRIPTION:
//   Returns the command from the Stored Procedure call
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function SQLStatement_getCommand()
{ 
  return this.command;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.setCommand
//
// DESCRIPTION:
//   Sets the command of the Stored Procedure call
//
// ARGUMENTS:
//   newCommand - string - the new command to set
//
// RETURNS:
//   boolean - true if set, false if not
//--------------------------------------------------------------------

function SQLStatement_setCommand(newCommand)
{
  var retVal = true;

  this.command = newCommand;

  if (this.type == SQLStatement.STMT_TYPE_EMPTY)
  {
    this.type = SQLStatement.STMT_TYPE_STORED_PROC;
  }
     
  return retVal; 
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.getSPName
//
// DESCRIPTION:
//   Returns the name of the Stored Procedure call
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function SQLStatement_getSPName()
{
  return this.SPName;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.setSPName
//
// DESCRIPTION:
//   Sets the name of the Stored Procedure call
//
// ARGUMENTS:
//   spName - string - the new Stored Procedure name
//
// RETURNS:
//   boolean - true if set, false if not
//--------------------------------------------------------------------

function SQLStatement_setSPName(spName)
{
  var retVal = true;

  this.SPName = spName;

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.getParams
//
// DESCRIPTION:
//   Returns the parameter array for the Stored Procedure call
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   Array of strings - the parameters for this call
//--------------------------------------------------------------------

function SQLStatement_getParams()
{
  return this.paramArray;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.setParams
//
// DESCRIPTION:
//   Sets the parameters for the Stored Procedure call
//
// ARGUMENTS:
//   paramLisy - string - comma separated list of parameters
//
// RETURNS:
//   boolean - true if set, false if not
//--------------------------------------------------------------------

function SQLStatement_setParams(paramList)
{
  var retVal = true;

  this.paramArray = paramList.split(/\s*,\s*/);

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.addParam
//
// DESCRIPTION:
//   Adds a parameter to the Stored Procedure call
//
// ARGUMENTS:
//   param - string - the parameter to add
//
// RETURNS:
//   boolean - true if added, false if not
//--------------------------------------------------------------------

function SQLStatement_addParam(param)
{
  var retVal = false;

  if (param && param != "")
  {
    this.paramArray.push( param );
    retVal = true;
  }

  return retVal;
}



//--------------------------------------------------------------------
// FUNCTION:
//   getTableNames
//
// DESCRIPTION:
//   Returns the list of tables referenced in the SQL statement
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   array of string
//--------------------------------------------------------------------

function SQLStatement_getTableNames()
{
  var retVal = new Array();

  if (this.type == SQLStatement.STMT_TYPE_SELECT)
  {
    if (this.fromClause)
    {
      retVal = dw.getTokens(this.fromClause, ",");
      
      for (var i=0; i < retVal.length; i++)
      {
        // Note: we should remove the keywords
        //  RIGHT OUTER JOIN, LEFT OUTER JOIN, INNER JOIN, ON
        retVal[i] = dwscripts.decodeSQLTableRef(retVal[i]);
      }

    }
  }
  else if (this.type == SQLStatement.STMT_TYPE_INSERT)
  {
    if (this.insertIntoClause)
    {
      retVal.push(this.insertIntoClause);
      
      retVal[0] = dwscripts.decodeSQLTableRef(retVal[0]);
    }      
  }
  else if (this.type == SQLStatement.STMT_TYPE_UPDATE)
  {
    if (this.updateClause)
    {
      retVal.push(this.updateClause);
      
      retVal[0] = dwscripts.decodeSQLTableRef(retVal[0]);
    }      
  }
  else if (this.type == SQLStatement.STMT_TYPE_DELETE)
  {
    if (this.deleteFromClause)
    {
      retVal.push(this.deleteFromClause);
      
      retVal[0] = dwscripts.decodeSQLTableRef(retVal[0]);
    }      
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getColumnNames
//
// DESCRIPTION:
//   Returns the list of columns referenced in the SQL statement.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   array of strings
//--------------------------------------------------------------------

function SQLStatement_getColumnNames()
{
  var retVal = new Array();

  if (this.type == SQLStatement.STMT_TYPE_SELECT)
  {
    if (this.selectClause)
    {
      retVal = dw.getTokens(this.selectClause, ",");
      
      for (var i=0; i < retVal.length; i++)
      {
        retVal[i] = dwscripts.decodeSQLColumnRef(retVal[i]);
      }

    }
  }
  else if (this.type == SQLStatement.STMT_TYPE_INSERT)
  {
    if (this.columnsClause)
    {
      var columnsStr = dwscripts.trim(this.columnsClause);
      if (columnsStr.charAt(0) == "(" && columnsStr.charAt(columnsStr.length-1) == ")")
      {
        columnsStr = columnsStr.substring(1,columnsStr.length-1);
      }
      
      retVal = dw.getTokens(columnsStr, ",");

      for (var i=0; i < retVal.length; i++)
      {
        retVal[i] = dwscripts.decodeSQLColumnRef(retVal[i]);
      }
    }
  }
  else if (this.type == SQLStatement.STMT_TYPE_UPDATE)
  {
    if (this.setClause)
    {
      var columnsStr = dwscripts.trim(this.setClause);
      
      // Each column assignment is separated by a ',' in the set clause.
      retVal = dw.getTokens(columnsStr, ",");
      
      for (var i=0; i < retVal.length; i++)
      {
        // The column name will be the only text on the left side of the first '='
        var indexEquals = retVal[i].indexOf("=");
        if (indexEquals != -1)
        {
          retVal[i] = retVal[i].substr(0, indexEquals);
        }

        retVal[i] = dwscripts.decodeSQLColumnRef(retVal[i]);
      }
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getColumnValues
//
// DESCRIPTION:
//   Returns the list of values referenced in the SQL statement, for
//   INSERT and UPDATE statements.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   array of strings
//--------------------------------------------------------------------

function SQLStatement_getColumnValues()
{
  var retVal = new Array();

  if (this.type == SQLStatement.STMT_TYPE_INSERT)
  {
    if (this.valuesClause)
    {
      var valuesStr = dwscripts.trim(this.valuesClause);
      if (valuesStr.charAt(0) == "(" && valuesStr.charAt(valuesStr.length-1) == ")")
      {
        valuesStr = valuesStr.substring(1,valuesStr.length-1);
      }
      
      retVal = dw.getTokens(valuesStr, ",");

      for (var i=0; i < retVal.length; i++)
      {
        //if (retVal[i].indexOf("\"") != -1)
        //{
        //  retVal[i] = dwscripts.stripChars(retVal[i], "\"");
        //}
          
        retVal[i] = dwscripts.trim(retVal[i]);
      }
    }
  }
  else if (this.type == SQLStatement.STMT_TYPE_UPDATE)
  {
    if (this.setClause)
    {
      var columnsStr = dwscripts.trim(this.setClause);

      // Each column assignment is separated by a ',' in the set clause.
      retVal = dw.getTokens(columnsStr,",");
      for (var i=0; i < retVal.length; i++)
      {
        // The column value will be the text on the right side of the first '='
        var indexEquals = retVal[i].indexOf("=");
        if (indexEquals != -1)
        {
          retVal[i] = retVal[i].substr(indexEquals + 1);
        }

        retVal[i] = dwscripts.trim(retVal[i]);
      }
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.createInsertStatement
//
// DESCRIPTION:
//   This function takes a tableName and a list of ColumnValueNodes,
//   and creates a SQL insert statement.  The ColumnValueNode class
//   can be derived from for each server model, such that this
//   statement is suitable for use directly in the runtime code.
//
//   If the ColumnValueNode class returns a value for the 
//   getRuntimePlaceholder() function, then the placeholder is
//   used in the SQL, and an array of runtime values is returned
//   from this function.
//
// ARGUMENTS:
//   tableName - string - the name of the table to insert into
//   columnValueList - array of ColumnValueNode objects - the
//     array of column information to use in creating the statement
//
// RETURNS:
//   array
//--------------------------------------------------------------------

function SQLStatement_createInsertStatement(tableName, columnValueList)
{
  var retVal = new Array();

  this.setInsertInto(tableName);
  
  var concatStart = null;
  var concatEnd = null;
  
  for (var i=0; i < columnValueList.length; i++)
  {
    var column = columnValueList[i].getColumnName();
    var runtimeValue  = columnValueList[i].getRuntimeValue();
    var placeholder = columnValueList[i].getRuntimePlaceholder();

    if (concatStart == null || concatEnd == null)
    {
      concatStart = columnValueList[i].getConcatStartString();
      concatEnd   = columnValueList[i].getConcatEndString();
    }
    
    if (runtimeValue)
    {
      // if a placeholder is returned, that means that the sql statement
      // is being assembled with a sprintf style call.  Therefore,
      // we return an array of the runtime values for use in this
      // statement
      if (placeholder)
      {
        this.addInsert(column, concatStart + placeholder + concatEnd);
        retVal.push(runtimeValue);
      }
      else
      {
        this.addInsert(column, concatStart + runtimeValue + concatEnd);
      }
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.createUpdateStatement
//
// DESCRIPTION:
//   This function takes a tableName and a list of ColumnValueNodes,
//   and creates a SQL update statement.  The ColumnValueNode class
//   can be derived from for each server model, such that this
//   statement is suitable for use directly in the runtime code.
//
//   If the ColumnValueNode class returns a value for the 
//   getRuntimePlaceholder() function, then the placeholder is
//   used in the SQL, and an array of runtime values is returned
//   from this function.
//
// ARGUMENTS:
//   tableName - string - the name of the table to insert into
//   columnValueList - array of ColumnValueNode objects - the
//     array of column information to use in creating the statement
//
// RETURNS:
//   array
//--------------------------------------------------------------------

function SQLStatement_createUpdateStatement(tableName, columnValueList)
{
  retVal = new Array();

  var whereValues = new Array();

  this.type = SQLStatement.STMT_TYPE_UPDATE;
  this.setUpdate(tableName);
  var newWhereClause = "";
  
  var concatStart = null;
  var concatEnd = null;
  
  for (var i = 0; i < columnValueList.length; ++i)
  {
    var column = columnValueList[i].getColumnName();
    var runtimeValue = columnValueList[i].getRuntimeValue();
    var isPrimaryKey = columnValueList[i].getIsPrimaryKey();
    var placeholder = columnValueList[i].getRuntimePlaceholder();

    if (concatStart == null || concatEnd == null)
    {
      concatStart = columnValueList[i].getConcatStartString();
      concatEnd   = columnValueList[i].getConcatEndString();
    }
    
    if (runtimeValue)
    {
      // if a placeholder is returned, that means that the sql statement
      // is being assembled with a sprintf style call.  Therefore,
      // we return an array of the runtime values for use in this
      // statement
      if (placeholder)
      {
        // If the column is being submitted as a primary key, add it to the where
        //   clause.
        if (isPrimaryKey)
        {
          newWhereClause = newWhereClause + ((newWhereClause.length) ? concatEnd + " AND " : "") 
                         + dwscripts.encodeSQLColumnRef("", column) + "=" + concatStart + placeholder;
          whereValues.push(runtimeValue);
        }
        else
        {
          this.addSet(column, concatStart + placeholder + concatEnd);
          retVal.push(runtimeValue);
        }
      }
      else
      {
        // If the column is being submitted as a primary key, add it to the where
        //   clause.
        if (isPrimaryKey)
        {
          newWhereClause = newWhereClause + ((newWhereClause.length) ? concatEnd + " AND " : "") 
                         + dwscripts.encodeSQLColumnRef("", column) + "=" + concatStart + runtimeValue;
        }
        else
        {
          this.addSet(column, concatStart + runtimeValue + concatEnd);
        }
      }
    }
  }

  this.setWhere(newWhereClause);

  return retVal.concat(whereValues);
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.createDeleteStatement
//
// DESCRIPTION:
//   Creates a delete SQL statement 
//
//   If the ColumnValueNode class returns a value for the 
//   getRuntimePlaceholder() function, then the placeholder is
//   used in the SQL, and an array of runtime values is returned
//   from this function.
//
// ARGUMENTS:
//   tableName - string - the name of the table to insert into
//   columnValueList - array of ColumnValueNode objects - the
//     array of column information to use in creating the statement
//
// RETURNS:
//   array
//--------------------------------------------------------------------

function SQLStatement_createDeleteStatement(tableName, columnValueList)
{
  retVal = new Array();

  this.setDeleteFrom(tableName);
  
  var concatStart = null;
  var concatEnd = null;
  
  var newWhereClause = "";
  for (var i = 0; i < columnValueList.length; ++i)
  {
    var column = columnValueList[i].getColumnName();
    var runtimeValue = columnValueList[i].getRuntimeValue();
    var placeholder = columnValueList[i].getRuntimePlaceholder();

    if (concatStart == null || concatEnd == null)
    {
      concatStart = columnValueList[i].getConcatStartString();
      concatEnd   = columnValueList[i].getConcatEndString();
    }

    if (runtimeValue)
    {
      // if a placeholder is returned, that means that the sql statement
      // is being assembled with a sprintf style call.  Therefore,
      // we return an array of the runtime values for use in this
      // statement
      if (placeholder)
      {
        newWhereClause = newWhereClause + ((newWhereClause.length) ? concatEnd + " AND " : "") 
                       + dwscripts.encodeSQLColumnRef("", column) + "=" + concatStart + placeholder;
        retVal.push(runtimeValue);
      }
      else
      {
        newWhereClause = newWhereClause + ((newWhereClause.length) ? concatEnd + " AND " : "") 
                       + dwscripts.encodeSQLColumnRef("", column) + "=" + concatStart + runtimeValue;
      }
    }
  }

  this.setWhere(newWhereClause);

  return retVal;
}



//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.extractColumnInfo
//
// DESCRIPTION:
//   This function parses the current statement, and return an array
//   of CoulumnValueNode objects, which represent the information
//   contained in the statement.  The optional constructor function
//   can be used to extract platform specfic information.
//
// ARGUMENTS:
//   columnValueList - array of ColumnValueNode objects - the list
//     of columns, which should be updated with the information
//     in the SQL statement.
//   sqlVarList - array of runtime values - (optional) this is passed
//     when working with sprintf style SQL statements.  This is an
//     array of the runtimes which coorespond to each column in the
//     SQL statement.
//
// RETURNS:
//   array of ColumnValueNode objects
//--------------------------------------------------------------------

function SQLStatement_extractColumnInfo(columnValueList, sqlVarList)
{
  var retVal = true;

  var varListIndex = 0;
  
  if (this.getType() != SQLStatement.STMT_TYPE_INSERT)
  {
    // Begin by ensuring no column nodes are marked as primary keys. The primary
    //   key flag is set as appropriate in dwscripts.getColumnValueList for
    //   initialization purposes. However, in this function, we want to set the
    //   primary key flag based on how the column is used in the sql statement
    //   (unless this is an insert, then we need to preserve this info).
    for (var i = 0; columnValueList && i < columnValueList.length; ++i)
    {
      columnValueList[i].setIsPrimaryKey(false);
    }
  }
      
  if (this.getType() == SQLStatement.STMT_TYPE_INSERT)
  {
    // set the column array
    var columns = this.getColumnNames();
    var values = this.getColumnValues();

    for (var i=0; i < columns.length; i++)
    {
      var index = dwscripts.findInArray(columnValueList, columns[i],
        new Function("object,searchValue", "return (object.columnName == searchValue);"));
        
      if (index >= 0)
      {
        if (sqlVarList)
        {
          columnValueList[index].setRuntimeValue(sqlVarList[varListIndex++]);
        }
        else
        {
          columnValueList[index].setRuntimeValue(values[i]);
        }
      } 
      else
      {
        retVal = false;
      }
    }
  }
  else if (this.getType() == SQLStatement.STMT_TYPE_UPDATE)
  {
    // set the column array
    var columns = this.getColumnNames();
    var values = this.getColumnValues();

    for (var i=0; i < columns.length; i++)
    {
      var index = dwscripts.findInArray(columnValueList, columns[i],
        new Function("object,searchValue", "return (object.columnName == searchValue);"));
  
      if (index >= 0)
      {
        if (sqlVarList)
        {
          columnValueList[index].setRuntimeValue(sqlVarList[varListIndex++]);
        }
        else
        {
          columnValueList[index].setRuntimeValue(values[i]);
        }
      } 
      else
      {
        retVal = false;
      }
    }

    // Also, we must find column references in the where clause and update the
    //   associated columnValueNode.
    // Note that we don't find column references in the where clause for update
    //   in getColumnNames/Values. That function didn't feel like the right place
    //   for finding columns in the where clause given how it's used for the
    //   select statement.
    var whereClause = this.getWhere();
    var columnValuePairs = whereClause.split(/AND/i);
    for (var i = 0; i < columnValuePairs.length; ++i)
    {
      // Extract the column and value. (We are assuming the pairs in the where clause
      //   for an update sql statement will always equals statements.)
      var indexEquals = columnValuePairs[i].indexOf('=');      
      var column = '';
      var value = '';
      if (indexEquals != -1)
      {
        column = columnValuePairs[i].substr(0, indexEquals);
        value = columnValuePairs[i].substr(indexEquals + 1);
      }

      column = dwscripts.decodeSQLColumnRef(column);
        
      value = dwscripts.trim(value);

      // Find the where clause column in the columnValueList. If found, update the
      //   runtime value and mark the node as a primary key.
      var index = dwscripts.findInArray(columnValueList, column,
        new Function("object,searchValue", "return (object.columnName == searchValue);"));
        
      if (index >= 0)
      {
        if (sqlVarList)
        {
          columnValueList[index].setRuntimeValue(sqlVarList[varListIndex++]);
        }
        else
        {
          columnValueList[index].setRuntimeValue(value);
        }
        columnValueList[index].setIsPrimaryKey(true);
      } 
      else
      {
        retVal = false;
      }
    }
  }
  else if (this.getType() == SQLStatement.STMT_TYPE_DELETE)
  {
    // The only columns for a delete statement appear in the where clause. 
    var whereClause = this.getWhere();
    var columnValuePairs = whereClause.split(/AND/i);
    for (var i = 0; i < columnValuePairs.length; ++i)
    {
      // Extract the column and value. (We are assuming the pairs in the where clause
      //   for a delete sql statement will always equals statements.)
      var indexEquals = columnValuePairs[i].indexOf('=');      
      var column = '';
      var value = '';
      if (indexEquals != -1)
      {
        column = columnValuePairs[i].substr(0, indexEquals);
        value = columnValuePairs[i].substr(indexEquals + 1);
      }

      column = dwscripts.decodeSQLColumnRef(column);

      value = dwscripts.trim(value);
      
      // Find the where clause column in the columnValueList. If found, update the
      //   runtime value and mark the node as a primary key.
      var index = dwscripts.findInArray(columnValueList, column,
        new Function("object,searchValue", "return (object.columnName == searchValue);"));
        
      if (index >= 0)
      {
        if (sqlVarList)
        {
          columnValueList[index].setRuntimeValue(sqlVarList[varListIndex++]);
        }
        else
        {
          columnValueList[index].setRuntimeValue(value);
        }
        columnValueList[index].setIsPrimaryKey(true);
      } 
      else
      {
        retVal = false;
      }
    }
  }
  
  return retVal;
}

