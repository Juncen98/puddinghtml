// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

// Inherit from the SBDatabaseCallASPNET class

SBRecordsetASPNET.prototype.__proto__ = SBDatabaseCallASPNET.prototype;

// Inspectors

SBRecordsetASPNET.prototype.isLiteralVariableType = SBRecordsetASPNET_isLiteralVariableType;
SBRecordsetASPNET.prototype.isPageNavigation = SBRecordsetASPNET_isPageNavigation;

// SQL Utilities

SBRecordsetASPNET.prototype.isSimpleColumnName = SBRecordsetASPNET_isSimpleColumnName;
SBRecordsetASPNET.prototype.getSimpleWhereInfo = SBRecordsetASPNET_getSimpleWhereInfo;
SBRecordsetASPNET.prototype.getSimpleOrderByInfo = SBRecordsetASPNET_getSimpleOrderByInfo;
SBRecordsetASPNET.prototype.addSimpleWhere = SBRecordsetASPNET_addSimpleWhere;

// Updaters

SBRecordsetASPNET.prototype.checkDatabaseCall = SBRecordsetASPNET_checkDatabaseCall;
SBRecordsetASPNET.prototype.analyzeDatabaseCall = SBRecordsetASPNET_analyzeDatabaseCall;

// Construction

SBRecordsetASPNET.prototype.initSBRecordsetASPNET = SBRecordsetASPNET_initSBRecordsetASPNET;

// PRIVATE METHODS

SBRecordsetASPNET.prototype.replaceParamsWithVals = SBRecordsetASPNET_replaceParamsWithVals;
SBRecordsetASPNET.prototype.getSQLForTest = SBRecordsetASPNET_getSQLForTest;
SBRecordsetASPNET.prototype.getSQLForRecordsetBindings = SBRecordsetASPNET_getSQLForRecordsetBindings;
SBRecordsetASPNET.prototype.escRegExp = SBRecordsetASPNET_escRegExp;

// PUBLIC PROPERTIES

SBRecordsetASPNET.EXT_DATA_PAGE_SIZE			= "PageSize";
SBRecordsetASPNET.EXT_DATA_CURRENT_PAGE			= "CurrentPage";

//--------------------------------------------------------------------

function SBRecordsetASPNET(name, title, selectedNode)
{
  this.initSBRecordsetASPNET((name) ? name : "Recordset", title, selectedNode);
}

function SBRecordsetASPNET_initSBRecordsetASPNET(name, title, selectedNode)
{
  // First, initialize base class

  this.initSBDatabaseCallASPNET(name, title, selectedNode);

  // Initialize parameters

  this.setParameter(SBRecordsetASPNET.EXT_DATA_PAGE_SIZE, "");
  this.setParameter(SBRecordsetASPNET.EXT_DATA_CURRENT_PAGE, "");
}

function SBRecordsetASPNET_analyzeDatabaseCall()
{
}

function SBRecordsetASPNET_checkDatabaseCall(bIsForTest)
{
  var isValidRS = true;
  
  // Make sure the parallel arrays representing the SQL parameters have same length.
  //   Otherwise, we'll get an error when processing the insert text.
  //   For now - just check that EXT_DATA_SQL_VAR_SIZE & EXT_DATA_SQL_VAR_DIRECTION
  //   have the same length as the others. If not, make them the same size by
  //   pushing empty strings into the arrays.
  var paramRuntimes = this.getParameter(this.EXT_DATA_SQL_VAR_RUNTIME);
  var paramSizes = this.getParameter(this.EXT_DATA_SQL_VAR_SIZE);
  var paramDirections = this.getParameter(this.EXT_DATA_SQL_VAR_DIRECTION);
  
  var numEmptyItemsToPush = paramRuntimes.length - paramSizes.length;
  for (var i = 0; i < numEmptyItemsToPush; ++i)
  {
    paramSizes.push('');
  }
  if (numEmptyItemsToPush)
  {
    this.setParameter(this.EXT_DATA_SQL_VAR_SIZE, paramSizes);
  }
   
  var numEmptyItemsToPush = paramRuntimes.length - paramDirections.length;
  for (var i = 0; i < numEmptyItemsToPush; ++i)
  {
    paramDirections.push('');
  }
  if (numEmptyItemsToPush)
  {
    this.setParameter(this.EXT_DATA_SQL_VAR_DIRECTION, paramDirections);
  }
  

  // Make sure the SQL is a Select statement or call to stored procedure.

  var sqlParams = new Array();
  var theSQL = this.getDatabaseCall(sqlParams);

  if (dwscripts.stripChars(theSQL, " \r\n\t") == "")
  {
    isValidRS = false;
    this.appendErrorMessage(MM.MSG_NoSelectStatement);
  }
  else
  {
    var sqlObj = new SQLStatement(theSQL);

    if (!sqlObj || (sqlObj.getType() != SQLStatement.STMT_TYPE_SELECT))
    {
      isValidRS = false;
      this.appendErrorMessage(MM.MSG_NoSelectStatement);
    }
  }

  // Check to make sure all input parameters have a runtime
  // value defined

  for (var i = 0; i < sqlParams.length; i++)
  {
    if (!sqlParams[i].runtime || (sqlParams[i].runtime == ""))
	{
	  isValidRS = false;
      this.appendErrorMessage(MM.MSG_RunTimeValMissing + sqlParams[i].name);
	}
  }

  // Check the variable blocks against the references in the sql.
  // If they are not the same, the found instance is incomplete.
  
  // TODO: Ignore ?s used in ternary operators

  var sqlParamRegExp = /(\?)/g;
  var paramCount = 0;

  while (sqlParamRegExp.exec(theSQL))
  {
    paramCount++;
  }

  if (paramCount != sqlParams.length) 
  {
    this.setIsIncomplete(true);
    this.appendErrorMessage(MM.MSG_MissingParamNames);
  }

  return isValidRS;
}

function SBRecordsetASPNET_getSQLForRecordsetBindings()
{
  var sqlParams = new Array();
  var sql = this.getDatabaseCall(sqlParams);

  sql = dwscripts.unescServerQuotes(sql);
  
  // To keep the fix minimized, we do it for simple SQL Statement only

  var sqlObj = new SQLStatement(sql); 
  var tempSQL = sqlObj.getStatementForMMDB(); 
  
  sql = (tempSQL) ? tempSQL : this.replaceParamsWithVals(sql, sqlParams);

  return sql;
}

function SBRecordsetASPNET_getSQLForTest()
{
  var sqlParams = new Array();
  var sql = this.getDatabaseCall(sqlParams);
  var databaseType = MMDB.getDatabaseType(this.getConnectionName());
      
  sql = SQLStatement.stripComments(sql);
  
  sql = dwscripts.unescServerQuotes(sql);
  
  var sqlVarDefault;

  // We must replace all variables referenced in the sql with the appropriate
  //   default value.

  for (var i = 0; i < sqlParams.length; ++i)
  {
    // Prompt the user

    var keepGoing = true;
    var runtime = sqlParams[i].runtime;
	var paramInfo = dwscripts.getParameterTypeFromCode(runtime);

    if (!paramInfo)
	  continue;

 	if (paramInfo.varFilterType != "")
	{
	  runtime = paramInfo.varFilterRuntime;
	}

	sqlVarDefault = (paramInfo) ? paramInfo.varDefault : "";

    if (paramInfo.varType != MM.LABEL_ASPNET_Param_Types[5])
	{
	  if (sqlParams[i].name != "?")
  	  {
	    MM.paramName = sqlParams[i].name;
      }
	  else if (paramInfo && (paramInfo.name != "?"))
	  {
	    MM.paramName = paramInfo.name;
	  }
      else
	  {
	    MM.paramName = runtime;
	  }

	  MM.SimpleRecordsetDefaultVal = ""; // dwscripts.trimQuotes(sqlVarDefault);

	  dw.runCommand("GetTestValue");

      if (MM.clickedOK)
      {
        sqlVarDefault = MM.SimpleRecordsetDefaultVal;
      }
	  else
	  {
	    keepGoing = false;
	  }
    }
	else
	{
	  sqlVarDefault = runtime.replace(/"/g, "'");
	}

	if (keepGoing)
	{
 	  switch (paramInfo.varFilterType)
	  {
	    case "begins with":
		  sqlVarDefault = sqlVarDefault + "%";
		  break;
		case "ends with":
		  sqlVarDefault = "%" + sqlVarDefault;
		  break;
		case "contains":
		  sqlVarDefault = "%" + sqlVarDefault + "%";
		  break;
      }
	  
	  // Add quotes to string params if they aren't already present
      // Note: Access databases require non-string parameters
	  // to be surrounded by #s instead of 's. If we see #s,
	  // then leave them alone.

      if (SBDatabaseCallASPNET.isStringType(sqlParams[i].type)
			|| SBDatabaseCallASPNET.isDateTimeType(sqlParams[i].type))
	  {
	    if ((sqlVarDefault.charAt(0) != "\'") &&
	        (sqlVarDefault.charAt(0) != "#"))
	    {
		  sqlVarDefault = "\'" + sqlVarDefault + "\'";
        }
      }

      var paramName = (databaseType.toLowerCase() == "oledb") ? "\\?" : sqlParams[i].name;	  
	  sql = sql.replace(new RegExp(paramName), sqlVarDefault);
    }
    else
    {
      // user clicked cancel, so exit and set statement to blank

      sql = "";
      break;
    }
  }

  // Handle code segments in sql
  // Assume the sql looks like...
  //     "sql statements" + (code) + "sql statements" [+ (code)][...]
  //     "sql statements" & (code) & "sql statements" [& (code)][...]
  // Remove quotes around sql statements as we go
  //
  // NOTE: We're assuming that the first thing in the sting is NOT code
  // NOTE: We're requiring parens around the code segments -- .net seems
  //       to require these so...

  if (sql.charAt(0) == '"')
  {
    sql = sql.substring(1);
  }

  // Look for the end of the first sql statement
  
  var re = /("\s*[+&]\s*\()/;
  var matches = sql.match(re);

  while (matches && (matches.length > 0))
  {
    var i = sql.indexOf(matches[0]);
    var endOfString = false;

    // Collect everything in this code segment
	
	var j = (i + matches[0].length); // skip over search token
    
	// Look for matching close paren
	
    var parenCount = 0;

	for (var k = j; k < sql.length; k++)
	{
	  if (sql.charAt(k) == '(')
	  {
	    parenCount++;
	  }
	  else if (sql.charAt(k) == ')')
	  {
	    if (parenCount == 0)
		{
		  break;
		}
		 
		parenCount--;
      }
	}

    endOfString = (k == sql.length);
    codeSegment = sql.substring(j, k);

	// Prompt for test value
	// The code segment could be long, truncate

	MM.paramName = ":<br>" + codeSegment;
    MM.maxParamNamePixels = (navigator.platform.charAt(0) == "M") ? 360 : 480;
	MM.SimpleRecordsetDefaultVal = "";

	dw.runCommand("GetTestValue");

    if (MM.clickedOK)
    {
      sqlVarDefault = MM.SimpleRecordsetDefaultVal;

      var targetString = matches[0] + codeSegment + ")";
      var reTarget = new RegExp(this.escRegExp(targetString));

      sql = sql.replace(reTarget, sqlVarDefault);

      // If we're not at the end of the string, there must be
	  // another sql statement following, remove the plus sign
	  // and beginning quote

	  if (!endOfString)
	  {
		var loc = (i + sqlVarDefault.length);
		sql = (sql.substring(0, loc) + sql.substring((loc + 4), sql.length));
	  }

      matches = sql.match(re);
    }
	else
	{
      // user clicked cancel, so exit and set statement to blank

	  sql = "";
	  break;
	}
  }

  if (sql != "")
  {
	sql = dwscripts.unescSQLQuotes(sql);
  }

  return sql;
}

function SBRecordsetASPNET_escRegExp(theStr)
{
  theStr = theStr.replace(/\\/g, "\\\\")
  theStr = theStr.replace(/\[/g, "\\[")
  theStr = theStr.replace(/\]/g, "\\]")
  theStr = theStr.replace(/\^/g, "\\^")
  theStr = theStr.replace(/\{/g, "\\{")
  theStr = theStr.replace(/\}/g, "\\}")
  theStr = theStr.replace(/\$/g, "\\$")
  theStr = theStr.replace(/\*/g, "\\*")
  theStr = theStr.replace(/\+/g, "\\+")
  theStr = theStr.replace(/\?/g, "\\?")
  theStr = theStr.replace(/\(/g, "\\(")
  theStr = theStr.replace(/\)/g, "\\)")
  theStr = theStr.replace(/\./g, "\\.")

  return theStr;
}

function SBRecordsetASPNET_replaceParamsWithVals(sql, sqlParams)
{
  var statement = sql;
  
  for (var i = 0; i < sqlParams.length; i++)
  {
    var theParam = sqlParams[i];
    var theParamVal = ""; // TODO: String(theParam.defaultValue).replace(/'/g, "''");
    var myRe = new RegExp("\?","g");
    
	// TODO: Be smarter about which ?s get replaced

	statement = statement.replace(myRe, theParamVal);
  }
  
  return statement;
}

function SBRecordsetASPNET_isLiteralVariableType(varType)
{
  return (varType == MM.LABEL_ASPNET_Param_Types[5]);
}

function SBRecordsetASPNET_isPageNavigation()
{
  return (this.getParameter(SBRecordsetASPNET.EXT_DATA_PAGE_SIZE) != "");
}

function SBRecordsetASPNET_isSimpleColumnName(columnName)
{
  var retVal = false;
  var colName = dwscripts.trim(columnName);

  if (colName == '*' || ((colName.search(/^[\w\. ]*$/) == 0) && 
       (colName.search(/\bas\b/i) == -1)))
  {
    retVal = true;
  }

  return retVal;
}

function SBRecordsetASPNET_getSimpleWhereInfo(sqlObj, sqlParams)
{
	var ret = null;
	var whereStr = dwscripts.trim(sqlObj.whereClause);
	var info = new Object();

	info.lval = "";
	info.operator = "";
	info.isString = true

	if (whereStr != "")
	{
		do
		{
			if (whereStr.search(/^\s*([\w\. "\\]+?)\s*([=><])\s*([@\?\w\.]+?)\s*$/) != -1)
			{
				info.lval = RegExp.$1
				info.operator = RegExp.$2
				info.rval = RegExp.$3;
			}
			else if (whereStr.search(/^\s*([\w\. "\\]+?)\s*((<>)|(>=)|(<=))\s*([@\?\w\.]+?)\s*$/) != -1)
			{
				info.lval = RegExp.$1
				info.operator = RegExp.$2
				info.rval = RegExp.$3;
			}   
			else if (whereStr.search(/^\s*([\w\. "\\]+?)\s*like\s*([@\?\w\.]+?)\s*$/i) != -1)
			{
				info.lval = RegExp.$1

				// If we have a LIKE clause that uses a parameter,
				// then the %(s) will be in the parameter value, not
				// the sql.

				// bug fix for bug 200169
				// JS error when double click to open a simple recordset with "contains/begins with/ends with"in filltering 
				if ((sqlParams == null) || ((sqlParams != null) &&  (sqlParams.length < 1)))
					break;
									   
				var runtime = sqlParams[0].runtime;

				if (runtime.search(/['|"]%['|"]\s*\+\s*\(([\s\S]+)\)\s*\+\s*['|"]%['|"]/i) != -1)
				{
					info.operator = "contains";
					info.rval = RegExp.$1;
				}
				else if (runtime.search(/['|"]%['|"]\s*\+\s*\(([\s\S]+)\)/i) != -1)
				{
					info.operator = "ends with";
					info.rval = RegExp.$1;
				}
				else if (runtime.search(/\(([\s\S]+)\)\s*\+\s*['|"]%['|"]/i) != -1)
				{
					info.operator = "begins with";
					info.rval = RegExp.$1;
				}
				else
				{
					break;
				}
			}		
			else
			{
				break;
			}

			ret = info;
		}
		while (false);
	}
	else
	{
		//if there is no where class return an empty info
		//bug fix for 200032 - SQL string with multiple filters is corrupted after switching to simple recordset form
		ret = info;
	}

  if (ret && ret.lval)
  {
    ret.lval = dwscripts.decodeSQLColumnRef(ret.lval);
  }

	return ret;
}

function SBRecordsetASPNET_addSimpleWhere(sqlObj, columnName, operatorType, parameterName)
{
  switch (operatorType)
  {
  case "=":
  case ">":
  case "<":
  case ">=":
  case "<=":
  case "<>":
    sqlObj.whereClause = dwscripts.encodeSQLColumnRef("",columnName) + " " + operatorType + " " + parameterName;
    break;
  case "begins with":
  case "ends with":
  case "contains":
	sqlObj.whereClause = dwscripts.encodeSQLColumnRef("",columnName) + " LIKE " + parameterName;
	break;
  }

  if (sqlObj.whereClause && !sqlObj.whereKeyword)
  {
    sqlObj.whereKeyword = SQLStatement.WHERE_KEYWORD;
  }
}

function SBRecordsetASPNET_getSimpleOrderByInfo(sqlObj)
{
  var retVal = null;
  var orderByStr = dwscripts.trim(sqlObj.orderByClause);
  var info = new Object();

  info.column = "";
  info.direction = "";

  if (orderByStr != "")
  {
    // Note: The order of these regexp checks is important. The third regexp matches
    //   the case where no order (ASC, DESC) is specified; however, it will match 
    //   the first two cases where an order is specified. When matching these cases,
    //   it extracts the incorrect value for the column. So, we perform the more 
    //   specific regexp matches first.

    if (orderByStr.search(/^\s*([\w\. "\\]+)\s+asc\s*$/i) != -1)
    {
      info.column = RegExp.$1    
      info.direction = "ASC"
    }
    else if (orderByStr.search(/^\s*([\w\. "\\]+)\s+desc\s*$/i) != -1)
    {
      info.column = RegExp.$1    
      info.direction = "DESC"
    }
    else if (orderByStr.search(/^\s*([\w\. "\\]+)\s*$/i) != -1)
    {
      info.column = RegExp.$1    
      info.direction = "ASC"
    }
    else
    {
      info = null;
    }
    
    if (info && info.column)
    {
      info.column = dwscripts.decodeSQLColumnRef(info.column);
    }
    
    retVal = info;
  }
  else
  {
    retVal = new Object();
  }

  return retVal;
}

