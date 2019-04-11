// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// FUNCTION:
//   isValidConnectionName
//
// DESCRIPTION:
//   Checks if the form field specified in connectionNameObj is a 
//   valid connection name.  If it is not, then an alert is displayed
//   and focus is placed in the text box.
//
// ARGUMENTS:
//   connectionNameObj - dom object - the text field object which
//     contains the connection name to check.
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function isValidConnectionName(connectionNameObj)
{
  var retVal = true;
  
  if (connectionNameObj) 
  {
    var connectionName = connectionNameObj.value;

	if (dwscripts.IS_MAC && connectionName.length > 27)
	{
	  alert(MM.MSG_MacNameTooLong);
      retVal = false;
	}
    else if (!dwscripts.isValidVarName(connectionName))
    {
	  if (connectionName.charAt(0).search(/\d/) != -1)  // can't start with a number
        alert(MM.MSG_InvalidConnectionName2);      
      else 
	    alert(MM.MSG_InvalidConnectionName);
	  
      connectionNameObj.focus();
      retVal = false;
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   isValidConnectionString
//
// DESCRIPTION:
//   Displays a message if no connection string is specfied
//
// ARGUMENTS:
//   connectionStringObj - DOM object - the text form field which
//     contians the connection string.
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function isValidConnectionString(connectionStringObj)
{
  var retVal = true;
  
  if (connectionStringObj)
  {
    var connString = connectionStringObj.value;

    if (connString.length == 0)
    {
      alert(MM.MSG_SpecifyConnString);
      connectionStringObj.focus();
      retVal = false;
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   isValidDriverString
//
// DESCRIPTION:
//   Displays a message if no driver string is specfied
//
// ARGUMENTS:
//   driverStringObj - DOM object - the text form field which
//     contians the driver string.
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function isValidDriverString(driverStringObj, useHTTP)
{
  var retVal = true;
  
  if (driverStringObj && !useHTTP)
  {
    var driverString = driverStringObj.value;

    if (driverString.length == 0)
    {
      alert(MM.MSG_SpecifyDriver);
      driverStringObj.focus();
      retVal = false;
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   isValidDSN
//
// DESCRIPTION:
//   Displays a message if no driver string is specfied
//
// ARGUMENTS:
//   dsnObj - DOM object - the select form field which
//     contians the dsn string.
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function isValidDSN(dsnObj, useHTTP)
{
  var retVal = true;
  
  if (dsnObj)
  {
    if (dsnObj.list.length == 0)
    {
      alert(useHTTP ?  MM.MSG_NoServerCfDSNs : MM.MSG_NoLocalOdbcDSNs);
      retVal = false;
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   decodeDSNConnectionString
//
// DESCRIPTION:
//   Returns an array with the values stored in the connection string.
//   The returned order is: dsn, uid, pwd
//
// ARGUMENTS:
//   connStr - string - the connection string to decode
//
// RETURNS:
//   array of strings - dsn, uid, pwd
//--------------------------------------------------------------------

function decodeDSNConnectionString(connStr)
{
  var retList = new Array();

  retList.push((connStr.search(/dsn=([^;]+);/gi) != -1) ? RegExp.$1 : "");
  retList.push((connStr.search(/uid=([^;]*);/gi) != -1) ? RegExp.$1 : "");
  retList.push((connStr.search(/pwd=([^;]*);/gi) != -1) ? RegExp.$1 : "");

  return retList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   buildDSNConnectionString
//
// DESCRIPTION:
//   Creates a connection string based on the given data source name,
//   username and password.
//
// ARGUMENTS:
//   dsn - string - the data source name for this connection
//   username - string - the username for this connection
//   password - string - the password for this connection
//
// RETURNS:
//   string - connection string
//--------------------------------------------------------------------

function buildDSNConnectionString(dsn, username, password)
{
  var retVal = new Array()
  
  username = dwscripts.stripChars(username," ");
  
  retVal.push("dsn=" + dsn);

  if (username != "")
  {
    retVal.push("uid=" + username);
  }

  if (password != "")
  {
    retVal.push("pwd=" + password);
  }

  // join does not add trailing semi
  return retVal.join(";") + ";";
}


//--------------------------------------------------------------------
// FUNCTION:
//   decodeJDBCConnectionString
//
// DESCRIPTION:
//   Returns an array with the values stored in the connection string.
//   The returned order is: driver, url, uid, pword
//
// ARGUMENTS:
//   connStr - string - the connection string to decode
//
// RETURNS:
//   array of strings - driver, url, uid, pword
//--------------------------------------------------------------------

function decodeJDBCConnectionString(connStr)
{
  var retList = new Array();
  
  var re = /driver=([^\|]*)\|url=([^\|]*)\|uid=([^\|]*)\|pword=(.*)/gi;
  
  if(connStr.search(re) != -1)
  { 
    retList.push(RegExp.$1);
    retList.push(RegExp.$2);
    retList.push(RegExp.$3);
    retList.push(RegExp.$4);
  }
  else
  {
    retList.push("");
    retList.push("");
    retList.push("");
    retList.push("");
  }
  
  return retList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   buildJDBCConnectionString
//
// DESCRIPTION:
//   Creates a connection string based on the given data source name,
//   username and password.
//
// ARGUMENTS:
//   driver - string - the driver name for this connection
//   url - string - the url for this connection
//   user - string - the username for this connection
//   pword - string - the password for this connection
//
// RETURNS:
//   string - connection string
//--------------------------------------------------------------------

function buildJDBCConnectionString(driver, url, user, pword)
{
  var retVal = "";
  
  retVal = "driver=" + dwscripts.trim(driver) + "|" +
           "url=" + dwscripts.trim(url) + "|" +
           "uid=" + dwscripts.trim(user) + "|" +
           "pword=" + dwscripts.trim(pword);
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ensureQuotesForStaticText
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

function ensureQuotesForStaticText(theStr)
{
  var retVal = dwscripts.trim(theStr);
  
  // If outer single- or double-quotes are not present,
  // and the string is static text, add double-quotes
  if (!dwscripts.isQuoted(retVal))
  {
    // Verify standard format, otherwise theStr is not static
    var matchResult = retVal.match(/[\w\s]+=[^'";]*/g);
    if (matchResult != null)
    {
      var theStr2 = matchResult.join(';');

      //Join does not add the trailing semicolon...
      if (retVal[retVal.length-1] == ";")
      {
        theStr2 += ";";
      }

      if ((matchResult.length > 0) && (theStr2 == retVal))
      {
        retVal = '"' + retVal + '"';
      }
    }
  }

  return retVal;
}