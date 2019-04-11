// Copyright 2002, 2003, 2004 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

// ***************** LOCAL FUNCTIONS  ******************

//--------------------------------------------------------------------
// FUNCTION:
//   queueDefaultDocEdits
//
// DESCRIPTION:
//   This function is called before the docEdits are applied to the
//   page to allow any default doc edits to be added.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function queueDefaultDocEdits()
{
  var partList = null;
  
  partList = dw.getParticipants("PageDirective_processDir");
  if (partList && partList.length)
  {
    dwscripts.queueParticipantInfo("PageDirective_processDir", partList[0].participantNode);
  }
  
  partList = dw.getParticipants("PageDirective_content");
  if (partList && partList.length)
  {
    dwscripts.queueParticipantInfo("PageDirective_content", partList[0].participantNode);
  }

  partList = dw.getParticipants("PageDirective_setEncoding");
  if (partList && partList.length)
  {
    for (var i=0; i < partList.length; i++)
    {
       dwscripts.queueParticipantInfo("PageDirective_setEncoding", partList[i].participantNode);
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
  if (expression == null)
  {
    return retVal;
  }
  expression = expression.toString();

  if (hasServerMarkup(expression))
  {
    retVal = trimServerMarkup(expression, true);
  }
  else
  {
    var parameters = expression.match(/(true|false|[-]?\d+[\.]?\d*)/i);
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

  var parameters = unquoted.match(/(true|false|[-]?\d+[\.]?\d*)/i);
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
    else if (!(   expression.charAt(0) == "#"
               && expression.charAt(expression.length-1) == "#"
              )
            )
    {
      retVal = "#" + expression +"#";  // no need to add cfoutput tags
    }
    else
    {
      retVal = expression;
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
  var retVal = false;

  if (expression == null)
  {
    return retVal;
  }
  expression = expression.toString();

  var exp1 = /<cfoutput[^>]*>/gi;
  var exp2 = /<\/cfoutput>/gi;
  if ((expression.search(exp1) != -1 && expression.search(exp2) != -1))
  {
    retVal = true;
  }

  if (!retVal)
  {
    // search for the starting and closing pound signs
    //  need to handle pound signs escaped with double pounds

    var beginindex = expression.indexOf("#");
    while (beginindex != -1)
    {
      if (beginindex+1 >= expression.length || expression.charAt(beginindex+1) != "#")
      {
        break;
      }
      beginindex = expression.indexOf("#", beginindex+2);
    }
    if (beginindex != -1)
    {
      var endindex = expression.indexOf("#", beginindex+1);
      while (endindex != -1)
      {
        if (endindex+1 >= expression.length || expression.charAt(endindex+1) != "#")
        {
          break;
        }
        endindex = expression.indexOf("#", endindex+2);
      }

      if (beginindex != -1 && endindex != -1)
      {
        retVal = true;
      }
    }
  }

  return retVal;
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
//   ignorePoundSigns - boolean - if true, the pound signs will not
//     be removed from the expression
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function trimServerMarkup(expression, ignorePoundSigns)
{
  var retVal = expression.toString();

  var exp1 = /<cfoutput[^>]*>/gi;
  var exp2 = /<\/cfoutput[^>]*>/gi;

  retVal = retVal.replace(exp1,"");
  retVal = retVal.replace(exp2,"");

  if (!ignorePoundSigns)
  {
    // search for the starting and closing pound signs
    //  need to handle pound signs escaped with double pounds

    var beginindex = retVal.indexOf("#");
    while (beginindex != -1)
    {
      if (beginindex+1 >= retVal.length || retVal.charAt(beginindex+1) != "#")
      {
        break;
      }
      beginindex = retVal.indexOf("#", beginindex+2);
    }
    if (beginindex != -1)
    {
      var endindex = retVal.indexOf("#", beginindex+1);
      while (endindex != -1)
      {
        if (endindex+1 >= retVal.length || retVal.charAt(endindex+1) != "#")
        {
          break;
        }
        endindex = retVal.indexOf("#", endindex+2);
      }
      if (beginindex != -1 && endindex != -1)
      {
        retVal = retVal.substring(beginindex+1,endindex);
      }
    }
  }

  retVal = dwscripts.trim(retVal);

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   preprocessDocEditInsertText
//
// DESCRIPTION:
//   This function is called during dwscripts.applyDocEdits(), to
//   allow the Server Models to pre-process the inserted text.
//   It returns he processed string which should be inserted into
//   the document.
//
//   For Cold Fusion, we need to strip any nested CFOUTPUT tags
//
// ARGUMENTS:
//   insertText - string - the text that will be inserted
//   editNode - DOM node - the location where this text will be inserted
//   isUpdate - boolean - true if we are updating the node, rather
//     than inserting for the first time.
//
// RETURNS:
//   string - the new insert text
//--------------------------------------------------------------------

function preprocessDocEditInsertText(insertText, editNode, isUpdate)
{
  var retVal = String(insertText);

  if (retVal)
  {
    var indexStartCFOutput = retVal.search(/<cfoutput/i);
    if (indexStartCFOutput != -1) //if contains <cfoutput>
    {
      var callback = new Object();
      callback.tagName = "";
      callback.queryAttr = "";
      callback.tagEnd = false;
      callback.openTagBegin = new Function("tag,offset","if (!this.tagName) { this.tagName = tag.toUpperCase(); }");
      callback.attribute = new Function("name,code","if (!this.tagEnd && !this.queryAttr && name.toUpperCase() == \"QUERY\") { this.queryAttr = code; }");
      callback.openTagEnd = new Function("","this.tagEnd = true;");

      dw.scanSourceString(retVal, callback);
      
      // If this is a repeat region, strip the inner tags
      if (callback.tagName == "CFOUTPUT" &&
          callback.queryAttr != "")
      {
        // don't strip any cfoutputs if we are updating a repeat region
        if (!isUpdate)
        {
          // The insertText may contain nested cfoutputs. We must remove the inner
          //   cfoutputs. A scenario where this might occur is if we are wrapping
          //   dynamic text with a repeat region. In this case, the insert becomes
          //   a replace of the dynamic text cfoutput node with the repeat region
          //   cfoutput enclosing the dynamic text cfoutput as the insert text.
          var capsRetVal = retVal.toUpperCase();
          var indexEndCFOutput = capsRetVal.lastIndexOf("</CFOUTPUT");
          var innerSlice = retVal.substring(indexStartCFOutput + 1, indexEndCFOutput + 1);
          var innerSliceSansCFOutputs = dwscripts.stripCFOutputTags(innerSlice);
          retVal = retVal.substring(0, indexStartCFOutput + 1)
                 + innerSliceSansCFOutputs
                 + retVal.substring(indexEndCFOutput + 1);
        }
      }
      else
      {
        var dom = dw.getDocumentDOM();
        if (dom)
        {
          // If we have an edit node, turn it into offsets.
          var charRange = null;
          if (editNode)
          {
            var offsets = dom.nodeToOffsets(editNode);
            charRange = {startoffset: offsets[0], endoffset: offsets[1]};
          }

          if (dwscripts.canStripCfOutputTags(charRange))
          {
            retVal = dwscripts.stripCFOutputTags(retVal);
          }
        }
      }
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getDBColumnTypeAsString
//
// DESCRIPTION:
//   Maps the enumerated number used by the database to represent a type to the
//   corresponding sql type string.
//
// ARGUMENTS:
//   typeNum - enumerated number. Number used by the database to represent
//     the type.
//
// RETURNS:
//   string - ColdFusion SQL type string. null if typeNum is not found.
//--------------------------------------------------------------------

function getDBColumnTypeAsString(typeNum)
{
// todo: should store dbtype array somewhere like in dwscripts?
  var retVal = null;
  var a = new Array();

  a[0] = "Empty";
  a[2] = "CF_SQL_SMALLINT";
  a[3] = "CF_SQL_INTEGER";
  a[4] = "CF_SQL_FLOAT";
  a[5] = "CF_SQL_FLOAT";
  a[6] = "CF_SQL_MONEY";
  a[7] = "CF_SQL_DATE";
  a[8] = "CF_SQL_CHAR"; //?
  a[9] = "IDispatch";
  a[10] = "Error";
  a[11] = "CF_SQL_BIT"; //Boolean
  a[12] = "Variant";
  a[13] = "IUnknown";
  a[14] = "CF_SQL_DECIMAL"; //Decimal
  a[16] = "CF_SQL_TINYINT"; //TinyInt
  a[17] = "CF_SQL_TINYINT"; //UnsignedTinyInt
  a[18] = "CF_SQL_SMALLINT"; //UnsignedSmallInt
  a[19] = "CF_SQL_INTEGER"; //UnsignedInt
  a[20] = "CF_SQL_BIGINT"; //BigInt
  a[21] = "CF_SQL_BIGINT"; //UnsignedBigInt
  a[72] = "GUID";
  a[128] = "Binary";
  a[129] = "CF_SQL_CHAR"; //Char
  a[130] = "CF_SQL_CHAR"; //WChar
  a[131] = "CF_SQL_NUMERIC"; //Numeric
  a[132] = "UserDefined";
  a[133] = "CF_SQL_DATE"; //DBDate
  a[134] = "CF_SQL_TIME"; //DBTime
  a[135] = "CF_SQL_TIMESTAMP"; //DBTimeStamp
  a[200] = "CF_SQL_VARCHAR"; //VarChar
  a[201] = "CF_SQL_LONGVARCHAR"; //LongVarChar
  a[202] = "CF_SQL_VARCHAR"; //VarWChar
  a[203] = "CF_SQL_LONGVARCHAR"; //LongVarWChar
  a[204] = "VarBinary";
  a[205] = "LongVarBinary";
  //Defined for CF support
  a[400] = "CF_SQL_REAL";
  a[401] = "CF_SQL_FLOAT";
  a[402] = "CF_SQL_LONGVARCHAR";
  a[403] = "CF_SQL_MONEY4";
  a[900] = "REF CURSOR" // Special case for Oracle
  a[901] = "CF_SQL_BIT";

  if (a[typeNum])
  {
    retVal = a[typeNum];
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getColumnValueNode
//
// DESCRIPTION:
//   This function returns a platform specific instance of the
//   ColumnValueNode class.  This function is called by dwscripts,
//   and serves as a factory method.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   CFColumnValueNode object
//--------------------------------------------------------------------

function getColumnValueNode()
{
  var retVal = new CFColumnValueNode();
  return retVal;
}





//--------------------------------------------------------------------
// CLASS:
//   CFColumnValueNode
//
// DESCRIPTION:
//   This class represents the mapping of a database column to a value.
//
// PUBLIC PROPERTIES:
//   None
//
// PUBLIC FUNCTIONS:
//   See the base class in:
//     Configuration/Shared/Common/Scripts/ColumnValueNodeClass.js
//
//--------------------------------------------------------------------

//--------------------------------------------------------------------
// FUNCTION:
//   CFColumnValueNode
//
// DESCRIPTION:
//   Consructor function for the ColdFusion specific ColumnValueNode class
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function CFColumnValueNode()
{
  this.initialize();
}

// Inherit from the ColumnValueNode class.
CFColumnValueNode.prototype.__proto__ = ColumnValueNode.prototype;

CFColumnValueNode.prototype.encodeSQLVarRef = CFColumnValueNode_encodeSQLVarRef;
CFColumnValueNode.prototype.decodeSQLVarRef = CFColumnValueNode_decodeSQLVarRef;

CFColumnValueNode.prototype.getRuntimeValue = CFColumnValueNode_getRuntimeValue;
CFColumnValueNode.prototype.setRuntimeValue = CFColumnValueNode_setRuntimeValue;


//--------------------------------------------------------------------
// FUNCTION:
//   CFColumnValueNode.encodeSQLVarRef
//
// DESCRIPTION:
//   Given a variable name and a wrap character, returns a string
//   suitable for insertion into a SQL statement
//
// ARGUMENTS:
//   variable - string - the variable reference to encode
//   wrapChar - string - the character to enclose the reference in
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function CFColumnValueNode_encodeSQLVarRef(variable, wrapChar)
{
  var sqlVarRef = "#" + variable + "#";

  if (wrapChar)
  {
    // Must escape a wrapchar of '#'
    if (wrapChar == "#")
    {
      wrapChar = "##";
    }
    sqlVarRef = wrapChar + sqlVarRef + wrapChar;
  }

  return sqlVarRef;
}


//--------------------------------------------------------------------
// FUNCTION:
//   CFColumnValueNode.decodeSQLVarRef
//
// DESCRIPTION:
//   Given a SQL variable reference, this function extracts the
//   variable name and the wrap character.
//
// ARGUMENTS:
//   sqlVarRef - string - the SQL variable reference to decode
//
// RETURNS:
//   object with two properties: variable and wrapChar
//--------------------------------------------------------------------

function CFColumnValueNode_decodeSQLVarRef(sqlVarRef)
{
  var retVal = new Object();
  retVal.value = sqlVarRef;
  retVal.variable = "";
  retVal.wrapChar = "";

  if (sqlVarRef.charAt(0) == sqlVarRef.charAt(sqlVarRef.length-1))
  {
    if (sqlVarRef.indexOf("###") == -1)
    {
      if (sqlVarRef.charAt(0) != "#")
      {
        retVal.wrapChar = sqlVarRef.charAt(0);
        retVal.variable = sqlVarRef.substring(1,sqlVarRef.length-1);
        if (retVal.variable.charAt(0) == retVal.variable.charAt(retVal.variable.length-1) &&
            retVal.variable.charAt(0) == "#")
        {
          retVal.variable = retVal.variable.substring(1,retVal.variable.length-1);
        }
        else
        {
          // this is not a variable
          retVal.variable = "";
          retVal.wrapChar = "";
        }
      }
      else
      {
        retVal.variable = sqlVarRef.substring(1,sqlVarRef.length-1);
      }
    }
    else
    {
      // this is an access date, handle differently
      retVal.wrapChar = "#";
      retVal.variable = sqlVarRef.substring(3,sqlVarRef.length-3);
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   CFColumnValueNode.getRuntimeValue
//
// DESCRIPTION:
//   Returns the runtime value suitable for insertion into a SQL
//   statement, for this column value mapping.
//
//   NOTE: This is an override of a base class method
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function CFColumnValueNode_getRuntimeValue()
{
  this.runtimeValue = "";

  if (this.varName)
  {
    this.runtimeValue = this.encodeSQLVarRef(this.varName, this.wrapChar);

    if (!this.isPrimaryKey)
    {
      if (this.altValue && this.defaultValue)
      {
        // generate the value for this column
        var paramObj = new Object();
        paramObj.Variable = this.varName;
        paramObj.AltValue = this.altValue;
        paramObj.DefaultValue = this.defaultValue;

        this.runtimeValue = extPart.getInsertString("", "SQLVariable_altValue", paramObj);
      }
      else if (this.defaultValue)
      {
        // generate the value for this column
        var paramObj = new Object();
        paramObj.Variable = this.varName;
        paramObj.RuntimeValue = this.runtimeValue;
        paramObj.DefaultValue = this.defaultValue;

        this.runtimeValue = extPart.getInsertString("", "SQLVariable_defaultValue", paramObj);
      }
    }
  }

  return this.runtimeValue;
}


//--------------------------------------------------------------------
// FUNCTION:
//   CFColumnValueNode.setRuntimeValue
//
// DESCRIPTION:
//   Given a runtime value from a SQL statement, this function sets
//   the properties of this object to match this runtime code.
//
//   NOTE: This is an override of a base class function
//
// ARGUMENTS:
//   runtimeValue - string - a SQL column value mapping
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function CFColumnValueNode_setRuntimeValue(runtimeValue)
{
  this.runtimeValue = runtimeValue;

  // check if we have an altValue or defaultValue string
  var paramObj = extPart.findInString("SQLVariable_altValue", this.runtimeValue);
  if (paramObj != null)
  {
    // we have an alt value
    this.varName = paramObj["Variable"];
    this.wrapChar = "";
    this.altValue = paramObj["AltValue"];
    this.defaultValue = paramObj["DefaultValue"];
  }
  else
  {
    paramObj = extPart.findInString("SQLVariable_defaultValue", this.runtimeValue);
    if (paramObj != null)
    {
      // we have a default value
      this.varName = paramObj["Variable"];
      this.wrapChar = this.decodeSQLVarRef(paramObj["RuntimeValue"]).wrapChar;
      this.altValue = "";
      this.defaultValue = paramObj["DefaultValue"];
    }
    else
    {
      // we have a normal value
      var info = this.decodeSQLVarRef(this.runtimeValue);
      this.varName = info.variable;
      this.wrapChar = info.wrapChar;
      this.altValue = "";
      this.defaultValue = "NULL";
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   getParameterTypeArray
//
// DESCRIPTION:
//   Get list of available parameter types.
//
// ARGUMENTS:
//   bRemoveEnteredVal - boolean (optional). 'true' if should remove 'Entered Value'
//     as a possible parameter type. Defaults to 'false'.
//
// RETURNS:
//   array of strings - localized list of parameter types.
//--------------------------------------------------------------------

function getParameterTypeArray(bRemoveEnteredVal)
{
  // Make a copy of MM.LABEL_CF_Param_Types. We may need to alter it and we
  //   don't want to affect the original array.
  var paramTypes = new Array();
  for (var i = 0; i < MM.LABEL_CF_Param_Types.length; ++i)
  {
    paramTypes.push(MM.LABEL_CF_Param_Types[i]);
  }

  if (bRemoveEnteredVal)
  {
    paramTypes.splice(paramTypes.length - 1, 1);
  }

  return paramTypes;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getParameterCodeFromType
//
// DESCRIPTION:
//   Gets the runtime code and default value for the parameter type.
//
// ARGUMENTS:
//   paramType - string. one of elements returned from getParameterTypeArray.
//   paramNameOrValue - string. Value for the parameter.
//
// RETURNS:
//   object - with runtimeVal, defaultVal, and nameVal properties. null
//     if no parameter is used.
//--------------------------------------------------------------------

function getParameterCodeFromType(paramType, paramNameOrValue, paramDefault)
{
  var runtimeVal = dwscripts.sprintf(MM.MSG_UnknownParamType, paramType);
  var nameVal = "";
  var defaultVal = "1";

  switch(paramType)
  {
    case MM.LABEL_CF_Param_Types[0]:
      runtimeVal = "#URL." + paramNameOrValue + "#";
      nameVal = "URL." + paramNameOrValue;
      break;
    case MM.LABEL_CF_Param_Types[1]:
      runtimeVal = "#FORM." + paramNameOrValue + "#";
      nameVal = "FORM." + paramNameOrValue;
      break;
    case MM.LABEL_CF_Param_Types[2]:
      runtimeVal = "#COOKIE." + paramNameOrValue + "#";
      nameVal = "COOKIE." + paramNameOrValue;
      break;
    case MM.LABEL_CF_Param_Types[3]:
      runtimeVal = "#SESSION." + paramNameOrValue + "#";
      nameVal = "SESSION." + paramNameOrValue;
      break;
    case MM.LABEL_CF_Param_Types[4]:
      runtimeVal = "#APPLICATION." + paramNameOrValue + "#";
      nameVal = "APPLICATION." + paramNameOrValue;
      break;
  }

  var outObj = new Object();
  if (paramType == MM.LABEL_CF_Param_Types[5])
  {
    outObj = null;
  }
  else
  {
    outObj.defaultVal = defaultVal;
    outObj.runtimeVal = runtimeVal;
    outObj.nameVal = nameVal;
  }

  return outObj;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getParameterTypeFromCode
//
// DESCRIPTION:
//   Get parameter type and name from its runtime value.
//
// ARGUMENTS:
//   runtimeValue - string - the runtime code
//
// RETURNS:
//   object - contains paramType (one of elements returned from getParameterTypeArray)
//     and paramName properties.
//--------------------------------------------------------------------

function getParameterTypeFromCode(runtimeValue)
{
  var runtimeVal = runtimeValue;

  var outObj = new Object();

  var paramType = -1;
  var paramName = runtimeValue;

  if (runtimeVal.search(/\s*url\.([^"]*)\s*/i) != -1)
  {
    paramType = MM.LABEL_CF_Param_Types[0];
  }
  else if (runtimeVal.search(/\s*form\.([^"]*)\s*/i) != -1)
  {
    paramType = MM.LABEL_CF_Param_Types[1];
  }
  else if (runtimeVal.search(/\s*cookie\.([^"]*)\s*/i) != -1)
  {
    paramType = MM.LABEL_CF_Param_Types[2];
  }
  else if (runtimeVal.search(/\s*session\.([^"]*)\s*/i) != -1)
  {
    paramType = MM.LABEL_CF_Param_Types[3];
  }
  else if (runtimeVal.search(/\s*application\.([^"]*)\s*/i) != -1)
  {
    paramType = MM.LABEL_CF_Param_Types[4];
  }
  else
  {
    paramType = MM.LABEL_CF_Param_Types[5];
  }

  if (paramType == MM.LABEL_CF_Param_Types[5])
  {
    paramName = runtimeValue;
  }
  else
  {
    paramName = RegExp.$1;
  }

  if (paramType != -1)
  {
    outObj.paramType = paramType;
    outObj.paramName = paramName;
    return outObj;
  }
  else
  {
    return false;
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   isValidServerVarName
//
// DESCRIPTION:
//   Returns true if the given variable name is legal
//
// ARGUMENTS:
//   theVarName - string - variable to check
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function isValidServerVarName(theVarName)
{
  var retVal = true;

  var parts = theVarName.split(".");

  for (var i=0; i < parts.length; i++)
  {
    if (!dwscripts.isValidVarName(parts[i]))
    {
      retVal = false;
      break;
    }
  }

  return retVal;
}


