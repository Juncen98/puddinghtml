// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.
// ASP.NET_Csharp Connection
 
// *************** GLOBALS VARS *****************

var helpDoc = MM.HELP_connASPNETSqlServer;
var defaultString = "Persist Security Info=False;\nData Source=[serverName];\nInitial Catalog=[databaseName];\nUser ID=[username];\nPassword=[password];"

// ******************* API **********************

function findConnection(text)
{
    connRec = findConnectionParameters(text);
	
    if (connRec == null)
        return null;

    // Specify the include statement that's used to include this connection
    
	if ((connRec.cname != connRec.cnameDBType) ||
	    (connRec.cname != connRec.cnameHandler) ||
	    (connRec.cname != connRec.cnameSchema) ||
	    (connRec.cname != connRec.cnameCatalog))
		return null;

	// ADO connectivity expects connection string to be
	// enclosed in quotes for Server.MapPath() support
	connRec.string = ensureQuotes(connRec.string);

    // We need to pull out the last ; from the string, but not the last "
    if (connRec.string.substr(connRec.string.length - 2, 2) == ';"')
	  connRec.string = connRec.string.substr(0, connRec.string.length - 2) + '"';

    // Specify the variables that are defined in the connection file
    connRec.variables = new Object();

	if (theLanguage == "C#")
	{
		// Escape backslashes for C# variables
		var escString = connRec.string.replace(/\\/g, "\\\\");

		connRec.variables["System.Configuration.ConfigurationSettings.AppSettings[\"MM_CONNECTION_STRING_" + connRec.cname + "\"]"] = escString;
		connRec.variables["System.Configuration.ConfigurationSettings.AppSettings[\"MM_CONNECTION_DATABASETYPE_" + connRec.cname + "\"]"] = "\"" + connRec.databaseType + "\"";
	}
	else if (theLanguage == "VB")
	{
		connRec.variables["System.Configuration.ConfigurationSettings.AppSettings(\"MM_CONNECTION_STRING_" + connRec.cname + "\")"] = connRec.string;
		connRec.variables["System.Configuration.ConfigurationSettings.AppSettings(\"MM_CONNECTION_DATABASETYPE_" + connRec.cname + "\")"] = "\"" + connRec.databaseType + "\"";
	}

	connRec.filename = "sqlserver.htm"
	connRec.type = "ADO";
	connRec.designtimeType = "ADO";
	connRec.designtimeString = "";
	connRec.http = "true";

	//  Downstream, when MMHTTPDB.asp is invoked (via HTTP) to introspect the schema
	//  of this database, we may need to convert this SQL Server connection string into
	//  one compatible with OLE DB.  This is because MMHTTPDB.asp uses ADODB.Connection
	//  to connect to the database (to introspect its schema).  ADODB.Connection only
	//  accepts two kinds of connection strings:  OLE DB and DSN.  It does not accept
	//  a SQL Server connection string.  So, we'll have to morph it in MMHTTPDB.asp
	//  (actually, the morphing is done in MMHTTPDB.js which is included by MMHTTPDB.asp).
	//  To do that morphing, MMHTTPDB.js needs to know what database type the given
	//  connection string corresponds to.  That way, it do the right morphing to convert
	//  it into one compatible with OLE DB.  We communicate the database type to MMHTTPDB.asp
	//  by setting the so-called custom url params parameter in this connection record.
	//  The connection manager always passes these custom url params over to MMHTTPDB.asp
	//  directly (without interpretation).

	connRec.customURLParams = "DATABASETYPE=" + connRec.databaseType.replace(/"/g, "");

    return connRec;
}

function inspectConnection(connRec)
{ 
  var updateMode = connRec.updateExisting;

  // Enable for initialization
  
  document.theForm.ConnectionName.setAttribute("disabled", "false");
  document.theForm.ConnectionName.value = connRec.name;

  if (updateMode || connRec.string != "")
  {
    document.theForm.ConnectionString.value = formatConnectionString(connRec.string);
  }
  else
  {
    document.theForm.ConnectionString.value = defaultString;
  }

  // initializeUI() gets called before we have this flag,
  // so we disable the name field here, if necessary

  if (updateMode)
  {
    document.theForm.ConnectionName.setAttribute("disabled", "true");
    document.theForm.ConnectionString.focus();
  }
  else
  {   
    document.theForm.ConnectionName.focus();
  }
}

function applyConnection()
{ 
  if (!isValid())
    return "";

  // Build tokens array

  connRec = new Object();

  connRec.cnameHandler = Trim(document.theForm.ConnectionName.value);
  connRec.handler = "sqlserver.htm"
  connRec.cname = connRec.cnameHandler;
  connRec.string = ensureQuotes(Trim(unFormatConnectionString(connStringObject.value)));  
  connRec.cnameDBType = connRec.cnameHandler;
  connRec.databaseType = "SQLServer";
  connRec.cnameSchema = connRec.cnameHandler;
  connRec.schema = restrict_schema;
  connRec.cnameCatalog = connRec.cnameHandler;
  connRec.schema = "";
  connRec.catalog = "";
  connRec.filename = "sqlserver.htm"
  connRec.type = "ADO";
  connRec.designtimeType = "ADO";
  connRec.designtimeString = "";
  connRec.http = "true";

  // Start with insertText
  
  var code = dw.getExtDataValue("connection_includefile", "insertText");

  // Replace each token
  
  for (var i in connRec)
  {
    code = code.replace(RegExp("@@"+i+"@@", "g"), connRec[i]);
  }

  return code;
}

function commandButtons()
{
  return new Array(MM.BTN_OK, "",
                   MM.BTN_Cancel, "",
				   MM.BTN_Test, "clickedTest()",
				   MM.BTN_Help, "displayHelp()")
}

// ***************** LOCAL FUNCTIONS  ******************

function formatConnectionString(connStr)
{
  var connectionStr = Trim(connStr);

  var strArray = connectionStr.split(";");
  
  if (strArray.length == 0)
    return "";

  var retVal = strArray[0];
  
  for (var i=1; i < strArray.length; i++)
  {
  	  retVal += ";\n" + strArray[i];
  }

  return retVal;
}

function unFormatConnectionString(connectionStr)
{
  return StripChars("\r\n", connectionStr);
}

function initializeUI() 
{ 
  connStringObject = findObject("ConnectionString");
}

function clickedTest()
{
  if (!isValid())
  {
    return;
  }

  // Build tokens array

  var tokens = new Object();

  tokens.type = "ADO";
  tokens.http = "true"
  tokens.string = ensureQuotes(Trim(unFormatConnectionString(connStringObject.value)));
  tokens.databaseType = "SQLServer";

  //  Downstream, when MMHTTPDB.asp is invoked (via HTTP) to introspect the schema
  //  of this database, we may need to convert this SQL Server connection string into
  //  one compatible with OLE DB.  This is because MMHTTPDB.asp uses ADODB.Connection
  //  to connect to the database (to introspect its schema).  ADODB.Connection only
  //  accepts two kinds of connection strings:  OLE DB and DSN.  It does not accept
  //  a SQL Server connection string.  So, we'll have to morph it in MMHTTPDB.asp
  //  (actually, the morphing is done in MMHTTPDB.js which is included by MMHTTPDB.asp).
  //  To do that morphing, MMHTTPDB.js needs to know what database type the given
  //  connection string corresponds to.  That way, it do the right morphing to convert
  //  it into one compatible with OLE DB.  We communicate the database type to MMHTTPDB.asp
  //  by setting the so-called custom url params parameter in this connection record.
  //  The connection manager always passes these custom url params over to MMHTTPDB.asp
  //  directly (without interpretation).

  tokens.customURLParams = "DATABASETYPE=" + tokens.databaseType.replace(/"/g, "");

  // This method returns success indicator, but we do not care
  // since it displays status messages for us

  MMDB.testConnection(tokens);
}

function isValid()
{
  var connName = document.theForm.ConnectionName.value;

  if (!IsValidVarName(connName))
  {
    alert(MM.MSG_InvalidConnectionName);
    document.theForm.ConnectionName.focus();
    return false;
  }

  return true;
}
