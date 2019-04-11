// Copyright 2002, 2003, 2004 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

// ***************** LOCAL FUNCTIONS  ******************

//--------------------------------------------------------------------
// FUNCTION:
//   queueDefaultDocEdits
//
// DESCRIPTION:
//   This function is called before the docEdits are applied to the
//   page to allow any default doc edits to be added.  We will add
//   the language tag.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function getDirectiveNode(participantName, startRegExp)
{
  var partList = dw.getParticipants(participantName);

  if (!partList || (partList.length == 0))  // does not currently exist
  {
    // HACK: For some reason, the *Directive_lang participant will
    //       sometimes not be found, even though it exists on the page.
    //       This code checks to make sure that the language tag
    //       is *really* not on the page, before trying to add it again.
    
    var dom = dw.getDocumentDOM();
    if (dom)
    {
      var docStr = dom.documentElement.outerHTML;
      var directiveStart = docStr.search(  startRegExp  );

      if( directiveStart > -1 )
      {
        var node = dom.offsetsToNode(directiveStart,directiveStart);
		return node;
      }
    }
  }
  else
  {
	return partList[0].participantNode;
  }

  return null;
}

function queueDefaultDocEdits()
{
  var controlNode = getDirectiveNode("ControlDirective_lang", /<%\s*@\s*Control/i);
  if (controlNode)
  {
    dwscripts.queueParticipantInfo("ControlDirective_lang", controlNode);
  }
  else
  {
    var pageNode = getDirectiveNode("PageDirective_lang", /<%\s*@\s*Page/i);
    if (pageNode)
    {
      dwscripts.queueParticipantInfo("PageDirective_lang", pageNode);
    }
    else
    {
      var genericNode = getDirectiveNode("GenericDirective_lang", /<%\s*@\s*Language/i);
      if (genericNode)
      {
        dwscripts.queueParticipantInfo("GenericDirective_lang", genericNode);
      }
      else
      {
	    var dom = dw.getDocumentDOM();
	    if (dom != null && dom.URL != null)
		{
			var lastDot = dom.URL.lastIndexOf(".");
			if (lastDot > -1)
			{
				var fileExt = dom.URL.substring(lastDot).toLowerCase();
				if (fileExt == ".ascx")
				{
			        var paramObj = new Object();
			        paramObj.Language = "C#";
			        dwscripts.queueDocEditsForParticipant("ControlDirective_lang", paramObj);
					return;
				}
			}
		}
        var paramObj = new Object();
        paramObj.Language = "C#";
        dwscripts.queueDocEditsForParticipant("PageDirective_lang", paramObj);
      }
    }
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   encodeDynamicExpression
//
// DESCRIPTION:
//   This function prepares a dynamic expression for insertion onto
//   the page.  It is assumed that this expression will be used
//   within a larger dynamic statement, therefore all server markup
//   is stripped.
//
// ARGUMENTS:
//   expression - string - the dyanmic expression to encode
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function encodeDynamicExpression(expression)
{
  var retVal = "";
  expression = expression.toString();

  if (hasServerMarkup(expression))
  {
    retVal = trimServerMarkup(expression);
  }
  else
  {
    var parameters = expression.match(/(true|false|[-]?\d+[\.]?\d*)/);
    if (parameters && parameters[0].length == expression.length) // matches, return exact
    {
      retVal = expression;
    }
    else
    {
      if (!dwscripts.isQuoted(expression))
      {
        retVal = "\"" + dwscripts.escQuotes(expression) + "\"";
      }
      else
      {
        retVal = expression;
      }
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   decodeDynamicExpression
//
// DESCRIPTION:
//   This function prepares a dynamic expression for display within
//   a dialog box.  Quotes are removed,a nd server markup is re-added.
//
// ARGUMENTS:
//   expression - string - the dynamic expression to prepare for display
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function decodeDynamicExpression(expression)
{
  var retVal = "";

  expression = dwscripts.trim(expression.toString());
  var unquoted = dwscripts.trimQuotes(expression);

  var parameters = unquoted.match(/(true|false|[-]?\d+[\.]?\d*)/);
  if (parameters && parameters[0].length == unquoted.length) // matches, return exact
  {
    retVal = expression;
  }
  else
  {
    if (dwscripts.isQuoted(expression))
    {
      retVal = dwscripts.unescQuotes(unquoted);
    }
    else
    {
      retVal = "<%# " + expression + " %>";
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   hasServerMarkup
//
// DESCRIPTION:
//   This function returns true if the given expression contains
//   server markup.
//
// ARGUMENTS:
//   expression - string - the expression to test for server markup
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function hasServerMarkup(expression)
{
  expression = expression.toString();
  return (expression.indexOf("<%") != -1 && expression.indexOf("%>") != -1);
}


//--------------------------------------------------------------------
// FUNCTION:
//   trimServerMarkup
//
// DESCRIPTION:
//   This function returns the given expression with any server markup
//   removed.
//
// ARGUMENTS:
//   expression - string - the expression to remove server markup from
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function trimServerMarkup(expression)
{
  var retVal = expression.toString();

  if (retVal.length)
  {
    var begininlineindex = retVal.indexOf("<%#");
    var endinlineindex  =  retVal.indexOf("%>");
    if ((begininlineindex != -1) && (endinlineindex!=-1))
    {
      retVal = retVal.substring(begininlineindex+3, endinlineindex);
    }
    else
    {
      var begininlineindex = retVal.indexOf("<%");
      var endinlineindex  =  retVal.indexOf("%>");
      if ((begininlineindex != -1) && (endinlineindex!=-1))
      {
        retVal = retVal.substring(begininlineindex+2, endinlineindex);
      }
    }

    retVal = dwscripts.trim(retVal);
  }

  return retVal;
}

//--------------------------------------------------------------------
// FUNCTION:
//   findAllColumnNames
//
// DESCRIPTION:
//   Returns the column names for the given recordset.
//   If rs is not specified the column names for the first recordset
//   are returned.
//
// ARGUMENTS:
//   rs - string - optional - the name of a data source
//
// RETURNS:
//   array of strings
//--------------------------------------------------------------------

function findAllColumnNames(rs)
{
  var nameList = new Array();

  // Is it a "normal" recordset or from a stored procedure?

  var sbObjs = dwscripts.getServerBehaviorsByFileName("Recordset.htm");
  var sbObj = null;

  for (var i = 0; (i < sbObjs.length) && (sbObj == null); i++)
  {
    if (sbObjs[i].getRecordsetName() == rs)
    {
      sbObj = sbObjs[i];
    }
  }

  if (!sbObj)
  {
    sbObjs = dwscripts.getServerBehaviorsByFileName("StoredProc.htm");

    for (var i = 0; (i < sbObjs.length) && (sbObj == null); i++)
    {
      if (sbObjs[i].getRecordsetName() == rs)
      {
        sbObj = sbObjs[i];
      }
    }
  }

  if (sbObj)
  {
    var rsDOM = dreamweaver.getDocumentDOM(dreamweaver.getConfigurationPath() + "/DataSources/ASP.NET_Csharp/Recordset.htm");

    if (rsDOM)
    {
      nameList = rsDOM.parentWindow.generateDynamicSourceBindings(sbObj.getTitle());
    }
  }

  return nameList;
}

function getParameterCodeFromType(varType, varNameOrValue, varDefault)
{
  var runtime = getParameterSyntaxFromType(varType, varNameOrValue);
  
  if (varType != MM.LABEL_ASPNET_Param_Types[5])
  {
    // Wrap varDefault in quotes (unless it's "null" (C#) or "Nothing" (VB))

    if ((varDefault.charAt(0) != '"') && 
        (varDefault.toLowerCase() != getNullToken().toLowerCase()))
    {
      varDefault = "\"" + varDefault + "\"";
    }
    
    switch (varType)
    {
      case MM.LABEL_ASPNET_Param_Types[2]:
        runtime += ".Value";
	    break;
    }

    var condition = getParameterExpressionFromType(varType, varNameOrValue);
    var trueClause = runtime;
    var falseClause = varDefault;

    runtime = getTernaryStatement(condition, trueClause, falseClause);
  }

  return runtime;
}

function getNullToken()
{
  return "null";
}

function getEqualsStatement(left, right)
{
  return (left + " == " + right);
}

function getTernaryStatement(condition, trueClause, falseClause)
{
  return condition + " ? " + trueClause + " : " + falseClause;
}

function getParameterAsInteger(param)
{
  return "Int32.Parse(" + param + ")";
}

function getParameterExpressionFromType(varType, varNameOrValue)
{
  var expr = null;
  var snytax = getParameterSyntaxFromType(varType, varNameOrValue);

  switch (varType)
  {
    case MM.LABEL_ASPNET_Param_Types[0]:
    case MM.LABEL_ASPNET_Param_Types[1]:
	  expr = "((" + snytax + " != null) && (" +  snytax + ".Length > 0))";
      break;

    case MM.LABEL_ASPNET_Param_Types[2]:
    case MM.LABEL_ASPNET_Param_Types[3]:
    case MM.LABEL_ASPNET_Param_Types[4]:
	  expr = "(" + snytax + " != null)";
      break;
  }

  return expr;
}

function getParameterSyntaxFromType(varType, varNameOrValue)
{
  var runtimeVal;

  switch (varType)
  {
    case MM.LABEL_ASPNET_Param_Types[0]:
      runtimeVal = "Request.QueryString[\"" + varNameOrValue + "\"]";
      break;

    case MM.LABEL_ASPNET_Param_Types[1]:
      runtimeVal = "Request.Form[\"" + varNameOrValue + "\"]";
      break;

    case MM.LABEL_ASPNET_Param_Types[2]:
      runtimeVal = "Request.Cookies[\"" + varNameOrValue + "\"]";
      break;

    case MM.LABEL_ASPNET_Param_Types[3]:
      runtimeVal = "Session[\"" + varNameOrValue + "\"]";
      break;

    case MM.LABEL_ASPNET_Param_Types[4]:
      runtimeVal = "Application[\"" + varNameOrValue + "\"]";
      break;

    case MM.LABEL_ASPNET_Param_Types[5]:
    {
      runtimeVal = varNameOrValue;

      if (runtimeVal.length > 1)
      {
         if (((runtimeVal.charAt(0) == '"') && (runtimeVal.charAt(runtimeVal.length-1) == '"')) ||
             ((runtimeVal.charAt(0) == '\'') && (runtimeVal.charAt(runtimeVal.length-1) == '\'')))
         {
            //  Assume that the user didn't know that we will automatically
            //  surround the literal string with quotes.  So ignore the quotes
            //  that they put in.

            runtimeVal = runtimeVal.substring(1, runtimeVal.length - 1);
         }
      }

      //  Encode any remaining single or double quotes so they don't mess up
      //  the parser.

      runtimeVal = '"' + escSQLQuotes(runtimeVal) + '"';

      break;
    }

    default:
      runtimeVal = dwscripts.sprintf(MM.MSG_UnknownParamType, varType);
      break;
  }

  return runtimeVal;
}

function getParameterTypeFromCode(runtimeValue)
{
  var runtime = runtimeValue;
  var varType;
  var varNameOrValue = "";
  var varFilterType = "";
  var varFilterRuntime = "";
  var varDefault = "";

  // If this is a "filter" parameter (used for a LIKE clause),
  // then it will contain a % before the runtime, after the runtime
  // or both. Deal with this before testing for the type of the
  // runtime.

  if (runtime.search(/['|"]%['|"]\s*\+\s*\(([\s\S]+)\)\s*\+\s*['|"]%['|"]/i) != -1)
  {
    varFilterType = "contains";
    varFilterRuntime = RegExp.$1;

    runtime = varFilterRuntime;
  }
  else if (runtime.search(/['|"]%['|"]\s*\+\s*\(([\s\S]+)\)/i) != -1)
  {
    varFilterType = "ends with";
    varFilterRuntime = RegExp.$1;

    runtime = varFilterRuntime;
  }
  else if (runtime.search(/\(([\s\S]+)\)\s*\+\s*['|"]%['|"]/i) != -1)
  {
    varFilterType = "begins with";
    varFilterRuntime = RegExp.$1;

    runtime = varFilterRuntime;
  }

  if (runtime.search(/\(\(Request\.QueryString\["([^"]*)"\] != null\) && \(Request\.QueryString\["([^"]*)"\]\.Length > 0\)\) \? ([^\r\n]*) : ([^\r\n]*)\s*/i) != (-1))
  {
    varType = MM.LABEL_ASPNET_Param_Types[0];
  }
  else if (runtime.search(/\(\(Request\.Form\["([^"]*)"\] != null\) && \(Request\.Form\["([^"]*)"\]\.Length > 0\)\) \? ([^\r\n]*) : ([^\r\n]*)\s*/i) != (-1))
  {
    varType = MM.LABEL_ASPNET_Param_Types[1];
  }
  else if (runtime.search(/\(Request\.Cookies\["([^"]*)"\] != null\) \? ([^\r\n]*) : ([^\r\n]*)\s*/i) != (-1))
  {
    varType = MM.LABEL_ASPNET_Param_Types[2];
  }
  else if (runtime.search(/\(Session\["([^"]*)"\] != null\) \? ([^\r\n]*) : ([^\r\n]*)\s*/i) != (-1))
  {
    varType = MM.LABEL_ASPNET_Param_Types[3];
  }
  else if (runtime.search(/\(Application\["([^"]*)"\] != null\) \? ([^\r\n]*) : ([^\r\n]*)\s*/i) != (-1))
  {
    varType = MM.LABEL_ASPNET_Param_Types[4];
  }
  else
  {
    varType = MM.LABEL_ASPNET_Param_Types[5];
  }

  if (varType == MM.LABEL_ASPNET_Param_Types[5])
  {
    varNameOrValue = runtime;
  }
  else
  {
    varNameOrValue = RegExp.$1;
    varDefault = RegExp.$4;

  }

  var outObj = new Object();

  outObj.varType = varType;
  outObj.varNameOrValue = dwscripts.trim(varNameOrValue);
  outObj.varDefault = dwscripts.trim(varDefault);
  outObj.varFilterType = varFilterType;
  outObj.varFilterRuntime = varFilterRuntime;

  return outObj;
}

function getParameterTypeFromExpression(expression)
{
  var runtimeVal = expression;
  var varType;
  var varNameOrValue = "";
  var charSet = dw.getDocumentDOM().getCharSet();
  var doEncode = false;

  if (runtimeVal.search(/\(\(Request\.QueryString\["([^"]*)"\] != null\) && \(Request\.QueryString\["([^"]*)"\]\.Length > 0\)\)/i) != (-1))
  {
    varType = MM.LABEL_ASPNET_Param_Types[0];
  }
  else if (runtimeVal.search(/\(\(Request\.Form\["([^"]*)"\] != null\) && \(Request\.Form\["([^"]*)"\]\.Length > 0\)\)/i) != (-1))
  {
    varType = MM.LABEL_ASPNET_Param_Types[1];
  }
  else if (runtimeVal.search(/\(Request\.Cookies\["([^"]*)"\] != null\)/i) != (-1))
  {
    varType = MM.LABEL_ASPNET_Param_Types[2];
  }
  else if (runtimeVal.search(/\(Session\["([^"]*)"\] != null\)/i) != (-1))
  {
    varType = MM.LABEL_ASPNET_Param_Types[3];
  }
  else if (runtimeVal.search(/\(Application\["([^"]*)"\] != null\)/i) != (-1))
  {
    varType = MM.LABEL_ASPNET_Param_Types[4];
  }
  else
  {
    varType = MM.LABEL_ASPNET_Param_Types[5];
  }

  if (varType == MM.LABEL_ASPNET_Param_Types[5])
  {
    varNameOrValue = runtimeValue;
  }
  else
  {
    varNameOrValue = RegExp.$1;
  }

  var outObj = new Object();

  outObj.varType = varType;
  outObj.varNameOrValue = dwscripts.trim(varNameOrValue);

  return outObj;
}

//--------------------------------------------------------------------
// FUNCTION:
//   escSqlQuotes
//
// DESCRIPTION:
//   For C#, single quotes in the sql string must be
//   replace with \u0027
//
// ARGUMENTS:
//   SQL statement as a string
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function escSQLQuotes(sql)
{
  var retVal = sql;

  retVal =  retVal.replace(/'/g, "\\u0027");

  return retVal;
}

function unescSQLQuotes(sql)
{
  var retVal = sql;

  retVal = retVal.replace(/\\u0027/g, "'");

  return retVal;
}


function escServerQuotes(theString)
{
  var retVal = theString;

  retVal =  retVal.replace(/"/g, "\\\"");

  return retVal;
}

function unescServerQuotes(theString)
{
  var retVal = theString;

  retVal = retVal.replace(/\\"/g, "\"");

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   encodeSQLTableRef
//
// DESCRIPTION:
//   Returns a table reference suitable for use within a SQL statement.
//   Wraps the reference in quotes if the table name contains a space,
//   begins with an underscore, or begins with a number.
//
// ARGUMENTS:
//   tableName - string - the table name we are referencing
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function encodeSQLTableRef(tableName)
{
  var retVal = tableName;

  // we need to remove any table prefix which might exist,
  // and then add it back on after encoding
  var prefix = "";
  var preIndex = tableName.lastIndexOf(".");
  if (preIndex != -1)
  {
    prefix = tableName.substring(0, preIndex+1);
    tableName = tableName.substring(preIndex+1);
    retVal = tableName;
  }

  if (tableName.charAt(0) == "_")
  {
    retVal = "\\\"" + retVal + "\\\"";
  }
  else if (dwscripts.isNumber(tableName.charAt(0)))
  {
  retVal = "\\\"" + retVal + "\\\"";
  }
  else if (tableName.indexOf(" ") != -1)
  {
  retVal = "\\\"" + retVal + "\\\"";
  }
  else if (dwscripts.isSQLReservedWord(tableName))
  {
  retVal = "\\\"" + retVal + "\\\"";
  }

  if (prefix)
  {
    retVal = prefix + retVal;
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   encodeSQLColumnRef
//
// DESCRIPTION:
//   Returns a column reference suitable for use within a SQL statement.
//   Adds the table name qualifier if needed, and wraps the reference
//   in quotes if the column name contains a space, starts with an
//   underscore, or starts with a number.
//
// ARGUMENTS:
//   tableName - string - the table name to be used if the column is
//     not unique
//   columnName - string - the column name to return a reference to
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function encodeSQLColumnRef(tableName, columnName)
{
  var retVal = "";
  
  cName = columnName;
  if (columnName.charAt(0) == "_")
  {
    cName = "\\\"" + cName + "\\\"";
  }
  else if (dwscripts.isNumber(columnName.charAt(0)))
  {
    cName = "\\\"" + cName + "\\\"";
  }
  else if (columnName.indexOf(" ") != -1)
  {
    cName = "\\\"" + cName + "\\\"";
  }
  else if (dwscripts.isSQLReservedWord(columnName))
  {
    cName = "\\\"" + cName + "\\\"";
  }

  var tName = dwscripts.encodeSQLTableRef(tableName);

  if (tName)
  {
    retVal = tName + "." + cName;
  }
  else
  {
    retVal = cName;
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   decodeSQLTableRef
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

function decodeSQLTableRef(theRef)
{
  var retVal = theRef;
  
  if (theRef.indexOf("\\\"") != -1)
  {
    retVal = dwscripts.stripChars(retVal, "\\\"");
  }

  retVal = dwscripts.trim(retVal);
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   decodeSQLColumnRef
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

function decodeSQLColumnRef(theRef)
{
  var retVal = theRef;
  
  if (retVal.indexOf("\\\"") != -1)
  {
    retVal = dwscripts.stripChars(retVal, "\\\"");
  }

  retVal = dwscripts.trim(retVal);

  // remove the table prefix if it exists
  if (retVal.lastIndexOf(".") != -1)
  {
    retVal = retVal.substring(retVal.lastIndexOf(".")+1);
  }
      
  return retVal;
}


