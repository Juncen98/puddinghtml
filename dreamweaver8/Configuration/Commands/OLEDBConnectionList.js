// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//***********************GLOBAL*************************

var helpDoc = MM.HELP_connASPNETOleDbTemplate;

/*
The Providers and Templates lists are extensible. Edit the two arrays
below to customise either list. Please back up this file before you 
make changes. 
*/

var ProviderArray = new Array(
	MM.OLE_DB_TEMPLATE_Oracle_Microsoft_Provider,
	MM.OLE_DB_TEMPLATE_Oracle_Oracle_Provider,
	MM.OLE_DB_TEMPLATE_Microsoft_SQL_Server,
	MM.OLE_DB_TEMPLATE_Microsoft_Access_97,
	MM.OLE_DB_TEMPLATE_Microsoft_Access_2000,
	MM.OLE_DB_TEMPLATE_UDL_File
);

var TemplateArray = new Array(
          "Provider=MSDAORA;Data Source=[OracleServiceName];User ID=[username];Password=[password];", //MS Oracle Provider
          "Provider=OraOLEDB.Oracle;User ID=[username];Password=[password];Data Source=[OracleServiceName];", //Oracle Provider by Oracle
          "Provider=SQLOLEDB.1;Persist Security Info=False;Data Source=[serverName];Initial Catalog=[databaseName];User ID=[username];Password=[password];", //SQLServer
          "Provider=Microsoft.Jet.OLEDB.3.5;Data Source=[databaseName];User ID=[username];Password=[password];", //Jet 3.5
          "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=[databaseName];User ID=[username];Password=[password];", //Jet 4.0
          "File Name=[filename]" //UDL	
);

var ListObj;

//*************************API**************************

function commandButtons(){
  return new Array(MM.BTN_OK,		"okClicked()",
                   MM.BTN_Cancel,	"cancelClicked()",
				   MM.BTN_Help,		"displayHelp()")
}

//*******************LOCAL FUNCTIONS*********************

function initializeUI(){
  ListObj = new ListControl("ProviderList");
  ListObj.setAll(ProviderArray, TemplateArray);
}

function cancelClicked(){
  MM.commandReturnValue = "";
  window.close();
}

function okClicked(){
  MM.commandReturnValue = ListObj.getValue();
  window.close();
}