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
//   the VBSCRIPT language tag.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function queueDefaultDocEdits()
{
  var partList = dw.getParticipants("PageDirective_main");
  if (!partList || partList.length == 0)  // does not currently exist
  {
  	    // HACK: For some reason, the PageDirective_lang participant will
    //       sometimes not be found, even though it exists on the page.
    //       This code checks to make sure that the language tag
    //       is *really* not on the page, before trying to add it again.
    
    var found = false;
    var dom = dw.getDocumentDOM();
    if (dom)
    {
      var docStr = dom.documentElement.outerHTML;
      var endSearch = -1;
      var pageDirectiveStart = -1;
      var startSearch = docStr.indexOf('<%');
      if (startSearch > -1)
        endSearch = docStr.indexOf('%>');
        
      if (startSearch > -1 && endSearch > 0){
        pageDirectiveStart = docStr.substring(startSearch,endSearch).search( /\s*@\s*page/i );
      }
      
      if( pageDirectiveStart > -1 )
      {
        found = true;
        var node = dom.offsetsToNode(pageDirectiveStart,pageDirectiveStart);
        if (node)
        {
          dwscripts.queueParticipantInfo("PageDirective_main", node);
        }
      }
    }
        
    if (!found)
    {
      var encoding = dw.getDocumentDOM().getCharSet();
      if (encoding != "")
      {
         encoding = "text/html; charset=" + encoding;
      }

      var paramObj = new Object();
      paramObj.ContentType = encoding;
      paramObj.Language = "java";
      paramObj.Imports = "java.sql.*";
      paramObj.ErrorPage = "";
      dwscripts.queueDocEditsForParticipant("PageDirective_main",paramObj);
    }
  }
  else
  {
    dwscripts.queueParticipantInfo("PageDirective_main", partList[0].participantNode);
  }

  partList = dw.getParticipants("SetEncoding_language");
    
  if (partList && partList.length)
  {
    dwscripts.queueParticipantInfo("SetEncoding_language", partList[0].participantNode);
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
    // quote all values for JSP
    if (!dwscripts.isQuoted(expression))
    {
      retVal = "\"" + dwscripts.escQuotes(expression) + "\"";
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

  if (dwscripts.isQuoted(expression))
  {
    retVal = dwscripts.unescQuotes(unquoted);
  }
  else
  {
    retVal = "<%= " + expression + " %>";
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
    var begininlineindex = retVal.indexOf("<%=");
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
        retVal = retVal.substring(begininlineindex+3, endinlineindex);
      }
    }

    retVal = dwscripts.trim(retVal);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getDBColumnTypeEnum
//
// DESCRIPTION:
//   This function returns the enumerated value corresponding to the
//   given column type.  The enumeration numbers should match those
//   used by the databases themselves.
//
// ARGUMENTS:
//   columnType - string - a column type as returned by the MMDB functions
//
// RETURNS:
//   enumeration number
//--------------------------------------------------------------------

var DB_COLUMN_ENUM_MAP = null;

function getDBColumnTypeEnum(columnType)
{
  var retVal = 0;

  columnType = String(columnType);

  if (dwscripts.isNumber(columnType))
  {
    retVal = dwscripts.getNumber(columnType);
  }
  else
  {
    if (DB_COLUMN_ENUM_MAP == null)
    {
      var a = new Array();

      a["null"] = 0;
      a["char"] = 1;
      a["numeric"] = 2;
	  a["int identity"]=2; //as varchar
	  a["counter"]=2;
	  a["varnumeric"] = 2;
	  a["number"] = 2;
	  a["money"]=2;
	  a["smallmoney"]=2;
	  a["currency"]=2;
	  a["uniqueidentifier"]=2;
	  a["rowid"]=2;
	  a["mediumint"]=2;
      a["decimal"] = 3;
      a["integer"] = 4;
	  a["long"] = 4;
      a["int"] = 4;
      a["mediumint"] = 4; //integer
      a["smallint"] = 5;
      a["smallint identity"] = 5;
      a["float"] = 6;
      a["float unsigned zerofill"] = 6; //double

      a["real"] = 7;
      a["double"] = 8;
      a["double unsigned zerofill"] = 8;

      a["longchar"] = 12; 
      a["varchar"] = 12;

      a["date"] = 91;
      a["time"] = 92;
      a["timestamp"] = 93;
      a["datetime"] = 93;
	  a["smalldatetime"]=93;
      a["year"] = 93; //dbdate

      a["varchar2"] = 1111;

      a["distinct"] = 2001;
      a["struct"] = 2002;
      a["enum"] = 2002; //var char
      a["set"] = 2002; //userdefined
      a["array"] = 2003;
      a["blob"] = 2004;
	  a["image"]=2004;
      a["clob"] = 2005;
      a["ref"] = 2006;
      a["ref cursor"] = 2006;

      a["longvarchar"] = -1;
      a["binary"] = -2;
	  a["raw"] = -2;
      a["varbinary"] = -3;
      a["longvarbinary"] = -4;
      a["bigint"] = -5;
      a["tinyint"] = -6;
      a["bit"] = -7;
      a["nchar"] = -8;
      a["nvarchar"] = -9;
	  a["nvarchar2"] = -9;
      a["text"] = -10;
      a["ntext"] = -10;
      a["tinytext"] = -10; //varchar
      a["mediumtext"] = -10; //varchar
      a["longtext"] = -10; //longvarchar
	  a["pl/sql"]=2006; //oracle specific pl/sql
	  a["object"]=2006; //oracle specific object
	  a["id"]=12; //as varchar
 

      DB_COLUMN_ENUM_MAP = a;
    }

    if (DB_COLUMN_ENUM_MAP != null)
    {
	  if (columnType.indexOf("pl/sql")!=-1)
	  {
		columnType = "pl/sql";
	  }

      retVal = DB_COLUMN_ENUM_MAP[columnType.toLowerCase()];

      if (retVal == null)
      {
        alert(dwscripts.sprintf(MM.MSG_SQLTypeAsNumNotInMap,columnType));
        retVal = 0;
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
//   This function returns a string representation of the given
//   column type.
//
// ARGUMENTS:
//   columnType - string - a column type string returned from MMDB
//
// RETURNS:
//   string
//--------------------------------------------------------------------

var DB_COLUMN_STRING_MAP = null;

function getDBColumnTypeAsString(columnType)
{
  var retVal = "Empty";

  var typeNum = getDBColumnTypeEnum(columnType);

  if (DB_COLUMN_STRING_MAP == null)
  {
    var a = new Array();

    a['0'] = "Null";
    a['1'] = "Char";
    a['2'] = "Numeric";
    a['3'] = "Decimal";
    a['4'] = "Integer";
    a['5'] = "SmallInt";
    a['6'] = "Float";
    a['7'] = "Real";
    a['8'] = "Double";
    a['12'] = "VarChar";

    a['91'] = "Date";
    a['92'] = "Time";
    a['93'] = "Timestamp";

    a['1111'] = "VarChar2";

    a['2001'] = "Distinct";
    a['2002'] = "Struct";
    a['2003'] = "Array";
    a['2004'] = "Blob";
    a['2005'] = "Clob";
    a['2006'] = "Ref";

    a['-1'] = "LongVarChar";
    a['-2'] = "Binary";
    a['-3'] = "VarBinary";
    a['-4'] = "LongVarBinary";
    a['-5'] = "BigInt";
    a['-6'] = "TinyInt";
    a['-7'] = "Bit";
    a['-8'] = "NChar";
    a['-9'] = "NVarChar";
    a['-10'] = "Text";

    DB_COLUMN_STRING_MAP = a;
  }

  if (DB_COLUMN_STRING_MAP != null)
  {
    retVal = DB_COLUMN_STRING_MAP[String(typeNum)];
  }

  if (retVal == null)
  {
    alert(dwscripts.sprintf(MM.MSG_SQLTypeNotInMap, columnType));
    retVal = "";
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   isNumericDBColumnType
//
// DESCRIPTION:
//   Returns true if the given column type is numeric.
//
//   If we do not recognize the type of a column as any of the
//   other categories, we default to numeric.
//
// ARGUMENTS:
//   columnType - string - a column type string returned from MMDB
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function isNumericDBColumnType(columnType)
{
  var retVal = true;

  var typeNum = getDBColumnTypeEnum(columnType);

  // assume the numeric type, unless it is called out in one
  //  of the other functions below.

  switch (typeNum)
  {
    case 1:
    case 12:
    case 91:
    case 92:
    case 93:
    case -1:
    case -8:
    case -9:
    case -10:
    case 1111:
      retVal = false;
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   isIntegerDBColumnType
//
// DESCRIPTION:
//   Returns true if the given column type is integer.
//
// ARGUMENTS:
//   columnType - string - a column type string returned from MMDB
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function isIntegerDBColumnType(columnType)
{
  var retVal  = false;

  var typeNum = getDBColumnTypeEnum(columnType);

  switch (typeNum)
  {
    case 4:
    case 5:
    case -5:
    case -6:
      retVal = true;
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   isDoubleDBColumnType
//
// DESCRIPTION:
//   Returns true if the given column type is double.
//
// ARGUMENTS:
//   columnType - string - a column type string returned from MMDB
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function isDoubleDBColumnType(columnType)
{
  var retVal  = false;

  var typeNum = getDBColumnTypeEnum(columnType);

  switch (typeNum)
  {
    case 8:
      retVal = true;
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   isStringDBColumnType
//
// DESCRIPTION:
//   This function returns true if the given column type represents
//   a string value
//
// ARGUMENTS:
//   columnType - string - a column type string returned from MMDB
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function isStringDBColumnType(columnType)
{
  var retVal = false;

  var typeNum = getDBColumnTypeEnum(columnType);

  switch (typeNum)
  {
    case 1:
    case 12:
    case -1:
    case -8:
    case -9:
    case -10:
    case 1111:
      retVal = true;
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   isBinaryDBColumnType
//
// DESCRIPTION:
//   This function returns true if the given column type represents
//   binary data
//
// ARGUMENTS:
//   columnType - string - a column type string returned from MMDB
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function isBinaryDBColumnType(columnType)
{
  var retVal = false;

  var typeNum = getDBColumnTypeEnum(columnType);

  switch (typeNum)
  {
    case -2:
    case -3:
    case -4:
    case -7:
      retVal = true;
  }

  if (!retVal)
  {
	  switch (columnType)
	  {
		case "image":
			retVal = true;
	  }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   isDateDBColumnType
//
// DESCRIPTION:
//   This function returns true if the given column type represents
//   a date or time value
//
// ARGUMENTS:
//   columnType - string - a column type string returned from MMDB
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function isDateDBColumnType(columnType)
{
  var retVal = false;

  var typeNum = dwscripts.getDBColumnTypeEnum(columnType);

  switch (typeNum)
  {
    case 91:
    case 92:
    case 93:
      retVal = true;
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   isBooleanDBColumnType
//
// DESCRIPTION:
//   This function returns true if the given column type represents
//   binary data
//
// ARGUMENTS:
//   columnType - string - a column type string returned from MMDB
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function isBooleanDBColumnType(columnType)
{
  var retVal = false;

  var typeNum = getDBColumnTypeEnum(columnType);

  switch (typeNum)
  {
    case -7:
      retVal = true;
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   isCurrencyDBColumnType
//
// DESCRIPTION:
//   This function returns true if the given column type represents
//   a monetary value
//
// ARGUMENTS:
//   columnType - string - a column type string returned from MMDB
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function isCurrencyDBColumnType(columnType)
{
  var retVal = false;
  switch (columnType)
  {
    case "money":
    case "smallmoney":
    case "currency":
      retVal = true;
  }

  return retVal;
}


////////////////////////////////////////////////////////////////////////////////
//These are some helper functions used by SSI infrastructure and not
//part of the Server API.
////////////////////////////////////////////////////////////////////////////////


//--------------------------------------------------------------------
// FUNCTION:
//   getRecordsetNames
//
// DESCRIPTION:
//   Returns a list of all recordset names on the page.
//
// ARGUMENTS:
//   dontIncludeStoredProcRS - boolean (optional). 'true' if should not
//     include recordsets returned from stored procedures. defaults to
//     'false'.
//
// RETURNS:
//   array of strings
//--------------------------------------------------------------------

function getRecordsetNames(dontIncludeStoredProcRS)
{
  if (!dontIncludeStoredProcRS) dontIncludeStoredProcRS = false;

  var nameList = new Array();
  var currentdom = dreamweaver.getDocumentDOM();

  if (currentdom) {
    var nodes = currentdom.getElementsByTagName("MM_RECORDSET");
    for (var index =0 ; index < nodes.length ; index++)
    {
      var node = nodes.item(index);
      if (node)
      {
        nameList.push(node.getAttribute("NAME"));
      }
    }

    if (!dontIncludeStoredProcRS)
    {
      var nodes = currentdom.getElementsByTagName("MM_CALLRESSET");
      for (var index =0 ; index < nodes.length ; index++)
      {
        var node = nodes.item(index);
        if (node)
        {
          nameList.push(node.getAttribute("NAME"));
        }
      }
    }
  }

  return nameList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getRepeatedRegionNames
//
// DESCRIPTION:
//   Returns a list of all repeated region names on the page.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   array of strings
//--------------------------------------------------------------------

function getRepeatedRegionNames()
{
  var nameList = new Array();
  var currentdom = dreamweaver.getDocumentDOM();

  if (currentdom)
  {
    var nodes = currentdom.getElementsByTagName("MM_REPEATEDREGION");
    for (var index =0 ; index < nodes.length ; index++)
    {
      var node = nodes.item(index);
      if (node)
      {
        nameList.push(node.getAttribute("NAME"));
      }
    }
  }

  return nameList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   findSourceNode
//
// DESCRIPTION:
//   Returns a data source name by name.
//
// ARGUMENTS:
//   elementName - string - the name of the data source
//
// RETURNS:
//   DOM node pointer
//--------------------------------------------------------------------

function findSourceNode(elementName)
{
  var foundnode = null;
  var currentdom = dreamweaver.getDocumentDOM();

  if (currentdom)
  {
    var nodes = currentdom.getElementsByTagName("MM_RECORDSET");
    for (var index =0 ; index < nodes.length ; index++)
    {
      var node = nodes.item(index);
      if (node)
      {
        if(node.getAttribute("NAME") == elementName)
        {
          foundnode = node;
        }
      }
    }

    if (!foundnode)
    {
      var nodes = currentdom.getElementsByTagName("MM_CALLABLE");
      for (var index =0 ; index < nodes.length ; index++)
      {
        var node = nodes.item(index);
        if (node)
        {
          if(node.getAttribute("NAME") == elementName)
          {
            foundnode = node;
          }
        }
      }
    }

    if (!foundnode)
    {
      var nodes = currentdom.getElementsByTagName("MM_CALLRESSET");
      for (var index =0 ; index < nodes.length ; index++)
      {
        var node = nodes.item(index);
        if (node)
        {
          if(node.getAttribute("NAME") == elementName)
          {
            foundnode = node;
          }
        }
      }
    }
  }

  return foundnode;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getColumnNames
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

function getColumnNames(rs)
{
  var rsDOM, nameList = new Array();

  dataSourceNode = findSourceNode(rs);

  if (dataSourceNode && dataSourceNode.tagName == "MM_RECORDSET")
  {
    rsDOM = dreamweaver.getDocumentDOM(dreamweaver.getConfigurationPath() + "/DataSources/Jsp/Recordset.htm");
  }
  else if (dataSourceNode && dataSourceNode.tagName == "MM_CALLRESSET")
  {
    var rsDOM = dreamweaver.getDocumentDOM(dreamweaver.getConfigurationPath() + "/DataSources/Jsp/Callable.htm");
  }

  if (rsDOM)
  {
    nameList = rsDOM.parentWindow.generateDynamicSourceBindings(rs);
  }

  return nameList;
}
