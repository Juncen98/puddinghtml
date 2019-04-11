// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
var DEBUG = false
var helpDoc = MM.HELP_compDataSources;

//*************** GLOBALS VARS *****************


//*******************  COMPONENT API **********************
//*-------------------------------------------------------------------
// FUNCTION:
//   getComponentChildren
//
// DESCRIPTION:
//	 returns a list of component Children.
//
// ARGUMENTS:
//	 parentNode-componentRec.
//	
// RETURNS:
//   a array of componentRec nodes.
//--------------------------------------------------------------------
function getComponentChildren(componentRec)
{
	var cs_Children = new Array();

	if (!componentRec)
	{
		var ConnectionList = new Array();
		ConnectionList = MMDB.getColdFusionDsnList();

		for (var i=0;i<ConnectionList.length;i++)
		{
			var aName = ConnectionList[i];
			var rootCompInfo = new ComponentRec(aName, CONNECTION_FILENAME,true,true,aName,true);
			rootCompInfo.objectType = "Connection";
			cs_Children.push(rootCompInfo);
		}
	}
	else
	{
		if (componentRec.objectType == "Connection")
		{
			var TablesCompInfo = new ComponentRec(MM.LABEL_Tables, TABLES_FILENAME, true, false, MM.LABEL_Tables, false);
			TablesCompInfo.objectType = "Tables";
			cs_Children.push(TablesCompInfo);

			var ViewsCompInfo = new ComponentRec(MM.LABEL_Views, VIEWS_FILENAME, true, false, MM.LABEL_Views, false);
			ViewsCompInfo.objectType = "Views";
			cs_Children.push(ViewsCompInfo);

			var StoredProceduresCompInfo = new ComponentRec(MM.LABEL_StoredProcs, PROCEDURES_FILENAME, true, false, MM.LABEL_StoredProcs, false);
			StoredProceduresCompInfo.objectType = "Stored Procedures";
			cs_Children.push(StoredProceduresCompInfo);
		}
		else if (componentRec.objectType == "Tables")
		{
			//get the list of tables for the given Connection object.
			var connectionName = componentRec.parent.name;
			if(connectionName && connectionName.length)
			{
				var tableObjects = MMDB.getTables(connectionName);
				var bTest = true;
				if (tableObjects.length==0)
				{
					bTest = EnsureDataSourceLogin(connectionName);
					if (bTest)
						tableObjects = MMDB.getTables(connectionName);
				}

				if (bTest)
				{
					for (i = 0; i < tableObjects.length; i++)
					{
						var thisTable = tableObjects[i];
						thisSchema =  dwscripts.trim(thisTable.schema);

						if (thisSchema.length == 0)
							thisSchema = dwscripts.trim(thisTable.catalog);

						if (thisSchema.length > 0)
							thisSchema += ".";

						var tableName = String(thisSchema + thisTable.table);
						var TableCompInfo = new ComponentRec(tableName, TABLE_FILENAME,true,true,tableName,false,true);
						TableCompInfo.objectType = "Table";
						cs_Children.push(TableCompInfo);
					}
				}
			}
		}
		else if (componentRec.objectType == "Views")
		{
			//get the list of tables for the given Connection object.
			var connectionName = componentRec.parent.name;
			if(connectionName && connectionName.length)
			{
				var viewObjects	= MMDB.getViews(connectionName);
				var bTest = true;
				if (viewObjects.length==0)
				{
					bTest = EnsureDataSourceLogin(connectionName);
					if (bTest)
						viewObjects	= MMDB.getViews(connectionName);
				}

				if (bTest)
				{
					for (i = 0; i < viewObjects.length; i++)
					{
						var thisView = viewObjects[i];
						thisSchema =  dwscripts.trim(thisView.schema);

						if (thisSchema.length == 0)
							thisSchema = dwscripts.trim(thisView.catalog);

						if (thisSchema.length > 0)
							thisSchema += ".";

						var viewName = String(thisSchema + thisView.view);
						var ViewCompInfo = new ComponentRec(viewName, VIEW_FILENAME,true,true,viewName,false,true);
						ViewCompInfo.objectType = "View";
						cs_Children.push(ViewCompInfo);
					}
				}
			}
		}
		else if (componentRec.objectType == "Stored Procedures")
		{
			//get the list of tables for the given Connection object.
			var connectionName = componentRec.parent.name;
			if(connectionName && connectionName.length)
			{
				var procObjects = MMDB.getProcedures(connectionName);
				if (procObjects.length==0)
				{
					var connRec = MMDB.getConnection(connectionName);
					var bTest = MMDB.testConnection(connRec, false);
					if (!bTest)
					{
						var username = connRec.username;
						var password = connRec.password;
						var retVal = dwscripts.callCommand("Connection_cf_login.htm", new Array(connectionName, username,password));
						if (retVal && retVal.length)
						{
							connRec.username = retVal[0];
							connRec.password = retVal[1];
							MMDB.setConnection(connRec);
						}
					}
					procObjects = MMDB.getProcedures(connectionName);
				}

				for (i = 0; i < procObjects.length; i++)
				{
					var thisProcedure = procObjects[i];
					thisSchema =  dwscripts.trim(thisProcedure.schema);

					if (thisSchema.length == 0)
						thisSchema = dwscripts.trim(thisProcedure.catalog);

					if (thisSchema.length > 0)
						thisSchema += ".";

					var procName = String(thisSchema + thisProcedure.procedure);
					var ProcedureCompInfo = new ComponentRec(procName, PROCEDURE_FILENAME,true,true,procName,false);
					ProcedureCompInfo.objectType = "Procedure";
					cs_Children.push(ProcedureCompInfo);
				}
			}
		}
		else if ((componentRec.objectType == "Table")||
				 (componentRec.objectType == "View"))	
		{
			var connName  = componentRec.parent.parent.name;
			var tableName = componentRec.name;

			if (tableName && tableName.length)
			{
				var sqlstatement = "select * from " + tableName + " where 1=0";
				var columnNameObjs = MMDB.getColumns(connName,tableName);
				var primaryKeys	   = MMDB.getPrimaryKeys(connName,tableName);
				var databaseType   = MMDB.getDatabaseType(connName);
				
				for (i = 0; i < columnNameObjs.length; i++)
				{
					var columnObj = columnNameObjs[i];
					var columnName = columnObj.name;
					var typename = columnObj.datatype;
					//if (AllInRange("0", "9", typename))
                    if (dwscripts.isNumber(typename))
					{
						// it already is a num
                        typename = dwscripts.getDBColumnTypeAsString(typename, databaseType);
					}

					var tooltiptext = typename;

					if (columnObj.definedsize && columnObj.definedsize.length)
					{
						tooltiptext += " ";
						tooltiptext += columnObj.definedsize;
					}

					var isnullable = columnObj.nullable;
					var nullablestr = "";

					if ((isnullable=="0") || (isnullable=="NO") || (isnullable=="false"))
					{
						nullablestr = MM.LABEL_Required;	
					}

					if (nullablestr && nullablestr.length)
					{						
						tooltiptext += " ";
						tooltiptext += nullablestr;
					}

					var iconfile="";
					for (j=0;j < primaryKeys.length; j++)
					{
						if (primaryKeys[j] == columnObj.name)
						{
							iconfile = TYPEPK_FILENAME;	
							break;
						}
					}

					if (!iconfile.length)
						iconfile = getIconForType(typename)

					columnName += " (";
					columnName += tooltiptext;
					columnName += ")";

					var ColumnNameCompInfo = new ComponentRec(columnName, iconfile,false,true,tooltiptext,false);
					ColumnNameCompInfo.objectType = "Column";
					ColumnNameCompInfo.dropcode = columnObj.name;
					cs_Children.push(ColumnNameCompInfo);
				}
			}
		}
		else if (componentRec.objectType == "Procedure")
		{
			var connName  = componentRec.parent.parent.name;
			var procName = componentRec.name;

			if(procName && procName.length)
			{
				var paramNameObjs = MMDB.getSPParameters(connName,procName);
				var databaseType   = MMDB.getDatabaseType(connName);
				
				for (i = 0; i < paramNameObjs.length; i++)
				{
					var paramObj = paramNameObjs[i];
					var paramName = paramObj.name;
					var typename = paramObj.datatype;
					//if (AllInRange("0", "9", typename)) 
                    if (dwscripts.isNumber(typename))
					{
						// it already is a num
                        typename = dwscripts.getDBColumnTypeAsString(typename, databaseType);
					}

					var tooltiptext = typename;
					tooltiptext+=" ";
					tooltiptext+=GetDirString(paramObj.directiontype);
					var iconfile = getIconForType(typename);

					paramName += " (";
					paramName += tooltiptext;
					paramName += ")";

					var ParameterCompInfo = new ComponentRec(paramName, iconfile,false,true,tooltiptext,false);
					ParameterCompInfo.objectType = "Parameter";
					ParameterCompInfo.dropcode = paramObj.name;
					cs_Children.push(ParameterCompInfo);
				}
			}
		}
	}

	if (cs_Children.length > 0)
		cs_Children = cs_Children.sort(nameSort);

	return cs_Children;
}

//*-------------------------------------------------------------------
// FUNCTION:
//   nameSort
//
// DESCRIPTION:
//	 Case-insensitive sort algorithm based on name property
//
// ARGUMENTS:
//	obj1  :   The first object
//  obj2  :   The second object
//
// RETURNS:
//   integer
//--------------------------------------------------------------------
function nameSort(obj1, obj2)
{
	return LocaleSort.compareString(obj1.name.toUpperCase(), obj2.name.toUpperCase());
}

//*******************  COMPONENT API **********************

//*-------------------------------------------------------------------
// FUNCTION:
//   getContextMenuId
//
// DESCRIPTION:
//	 returns the context menu id for the connection view
//
// ARGUMENTS:
//		String;
//	
// RETURNS:
//   context menu id
//--------------------------------------------------------------------
function getContextMenuId()
{
	return "DWDataSourcesContext";
}

//*-------------------------------------------------------------------
// FUNCTION:
//   toolbarButtons
//
// DESCRIPTION:
//	 returns a list of toolbaricons
//
// ARGUMENTS:
//	 parentNode-componentRec.
//	
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function toolbarControls()
{
	var toolBarBtnArray = new Array();

	// Modify Data Sources button
	var datasrcButton = new ToolbarControlRec();
	datasrcButton.image			= DATASRCBUTTONUP;
	datasrcButton.pressedImage	= DATASRCBUTTONDOWN;
	datasrcButton.disabledImage	= DATASRCBUTTONDISABLED;
	datasrcButton.toolStyle		= "right";
	datasrcButton.toolTipText	= MM.BTN_ModifyDataSources;
	datasrcButton.command = "modifyDataSources()";
	datasrcButton.enabled = true;
	toolBarBtnArray.push(datasrcButton);

	// Refresh button
	var refreshButton = new ToolbarControlRec();
	refreshButton.image			= REFRESHBUTTONUP;
	refreshButton.pressedImage	= REFRESHBUTTONDOWN;
	refreshButton.disabledImage	= REFRESHBUTTONDISABLED;
	refreshButton.toolStyle		= "right";
	refreshButton.toolTipText	= MM.BTN_Refresh;
	refreshButton.command = "clickedRefresh()";
	toolBarBtnArray.push(refreshButton);

    return toolBarBtnArray;
}

//*-------------------------------------------------------------------
// FUNCTION:
//   getCodeViewDropCode
//
// DESCRIPTION:
//	 returns the code snippet to drop after a drag operation.
//
// ARGUMENTS:
//	 component Rec.
//	
// RETURNS:
//   code to drop into code view.
//--------------------------------------------------------------------

function getCodeViewDropCode(componentRec)
{
	var codeToDrop="";
	if (componentRec)
	{
		if (componentRec.objectType == "Connection")
		{
			var connPart = new Participant("datasource_tag");
			var paramObj = new Object();
			paramObj.datasource = componentRec.name;
			codeToDrop = connPart.getInsertString(paramObj, "aboveHTML");
		}
		else if ((componentRec.objectType == "Column")||
				 (componentRec.objectType == "Parameter"))
		{
			codeToDrop =  componentRec.dropcode;
		}
		else
		{
			codeToDrop =  componentRec.name;
		}
	}
	return codeToDrop;
}

//*-------------------------------------------------------------------
// FUNCTION:
//   handleDesignViewDrop
//
// DESCRIPTION:
//	handle the drop operation to the design view from the database/component panel.
//
// ARGUMENTS:
//	 component Rec.
//	
// RETURNS:
//   boolean(drop operation was handled).
//--------------------------------------------------------------------

function handleDesignViewDrop(componentRec)
{
	var bHandled = false;
	if (componentRec)
	{
		// For drops of a table or view, popup the recordset server behavior with
    //   the table/view name and connection name filled in.
    if ((componentRec.objectType == "Table")|| (componentRec.objectType == "View"))
		{
      // Setup default values for the sql and connection name on the MM object.
      //   These will be used by the recordset server behavior.
      MM.recordsetSBDefaults = new Object();
      MM.recordsetSBDefaults.sql = "";
      if (componentRec.getName())
      {
       MM.recordsetSBDefaults.sql = "Select * From " + componentRec.getName();
      }
      MM.recordsetSBDefaults.connectionName = "";
      if (componentRec.parent && componentRec.parent.parent)
      {
        MM.recordsetSBDefaults.connectionName = componentRec.parent.parent.getName();
      }

      MM.RecordsetApplied = false;
      dw.popupServerBehavior("Recordset.htm");
      MM.recordsetSBDefaults = null;
			bHandled = true;

      // if a recordset has been sucessfully applied, the user needs feedback about what
      // has just occurred. Because a recordset has no visual cue and inserts no visible html,
      // the way we let the user know a recordset has been added is by popping up the data
      // bindings panel, thereby allowing the user to see the recordset and drag dynamic
      // content from the recordset into the document
      if (MM.RecordsetApplied)
      {
        // after inserting the recordset, give the data bindings panel focus
        if ( !dw.getFloaterVisibility('data bindings'))
        {
          dw.toggleFloater('data bindings');
          //refresh the data bindings panel
          dw.dbi.refresh();
        }
        
        var rsDisplayName = dwscripts.getRecordsetDisplayName();
        var message = dwscripts.sprintf(MM.MSG_ARecordsetWasAdded,rsDisplayName,rsDisplayName);
        dwscripts.informDontShow(message,
          "Extensions\\ServerObjects\\Recordset","SkipRecordsetAddedWarning");
      }
		}
	}
	return bHandled;
}




//*-------------------------------------------------------------------
// FUNCTION:
//   clickedRefresh()
//
// DESCRIPTION:
//   Refresh tree data from application server
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function clickedRefresh()
{
	// Mark data sources as needing to be refreshed
	MMDB.needToRefreshColdFusionDsnList();

	dw.databasePalette.refresh();
}


//*-------------------------------------------------------------------
// FUNCTION:
//   modifyDataSources()
//
// DESCRIPTION: Invoke ColdFusion ODBC Data Source Administration panel
//
// ARGUMENTS: None
//	
// RETURNS: None
//--------------------------------------------------------------------
function modifyDataSources()
{
	MMDB.showColdFusionAdmin();
}


//*-------------------------------------------------------------------
// FUNCTION:
//   clickedTest()
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function clickedTest()
{
	var selectedObj = dw.databasePalette.getSelectedNode();
	if (selectedObj && selectedObj.objectType=="Connection")
	{
		var connRec = MMDB.getConnection(selectedObj.name);
		if (connRec)
		{
			MMDB.testConnection(connRec);
		}
	}
}

//*-------------------------------------------------------------------
// FUNCTION:
//   clickedViewData()
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function clickedViewData()
{
  var connObj = dw.databasePalette.getSelectedNode();
  if (connObj && 
      ((connObj.objectType=="Table")||
       (connObj.objectType=="View")))	
  {
	var objname = connObj.name;
	var connname = connObj.parent.parent.name;
	objname = dwscripts.encodeSQLTableRef(objname);
	var sqlstatement = "Select * from " + objname;
	MMDB.showResultset(connname,sqlstatement,MM.MSG_ViewData);
  }
}

//*-------------------------------------------------------------------
// FUNCTION:
//   clickedDelete()
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function clickedDelete()
{
	//we don't have anything to delete since these 
	//are connections on the server.
}


// This method gives the extension author an opportunity to ensure that the user
// has been prompted to enter the RDS user name and password.
function EnsureRDSValidation(force)
{
  // If user has previously cancelled out of the RDS Login dialog, then do not
  // display it again here, because this will inundate them with modal dialogs.
  // User can go to Server Component panel once they know the correct RDS login info.
  var prompt = MMDB.needToPromptForRdsInfo(force);

  // Prompt user until connection is successful, or Cancel
  while (prompt)
  {
    var returnArray = new Array();

    // Show the RDS Dialog
    returnArray = MMDB.showRdsUserDialog(MMDB.getRDSUserName(), MMDB.getRDSPassword(), returnArray);

    // Proceed if the user name or password and not empty. We use OR instead of AND because
    // ColdFusion might need only a password in certain circumstances.
    if (returnArray.username != null || returnArray.password != null) 
    {
      MMDB.setRDSUserName(returnArray.username ? returnArray.username : "");
      MMDB.setRDSPassword(returnArray.password ? returnArray.password : "");

      var dsArray = new Array();
      MMDB.needToRefreshColdFusionDsnList();	// force server connection
      var dsArray = MMDB.getColdFusionDsnList();

      // Ignore the number of data sources returned, use needToPromptForRdsInfo()
	  // to determine if connection was successful.
      prompt = MMDB.needToPromptForRdsInfo(true);
	}
	else
	  prompt = false;
  }
}


// This function gives the user an opportunity to ensure the Data Source user name
// and password are correct. If the user hits the ok button in the DS dialog,
// the connection will be tested automatically and if it fails, the dialog
// pops up again. If the user clicks cancel, the dialog closes without 
// testing the connection. 

function EnsureDataSourceLogin(connectionName)
{
	var connRec = new Object();
	connRec = MMDB.getConnection(connectionName);
	var bTest = MMDB.testConnection(connRec, false);

	if (!bTest && connRec)
	{
		var bCancelled = false;
		while (!bTest && !bCancelled)
		{
			var username = connRec.username;
			var password = connRec.password;
			var retVal = dwscripts.callCommand("Connection_cf_login.htm", new Array(connectionName, username,password));
			if (retVal && retVal.length)
			{
				connRec.username = retVal[0];
				connRec.password = retVal[1];
				MMDB.setConnection(connRec);
				bTest = MMDB.testConnection(connRec, false);
			}
			else
				bCancelled = true;
		}
	}

	return bTest;
}

// TODO: Remove the following:
// 1. displayInstructions() API is no longer necessary.
// 2. cleanup code and strings
//
// Specify list of steps that user must complete to get useful information
// in this panel. Note that we display previous steps (1-4) so that we present
// user with a single dynamic list (not 2 static list)
//
// TODO: do we want to implement the "events" from previous list for consistency?

function getSetupSteps()
{
  var dom = null;
  var url = "";
  var curSite = null;

  // Try to get the site for the currently selected document
  dom = dw.getDocumentDOM();
  if (dom != null)
    url = dom.URL;
  if (url.length > 0)
    curSite = site.getSiteForURL(url);
  else
    curSite = site.getCurrentSite(); 
  if (curSite.length == 0)
	curSite = site.getCurrentServerSite();
  var instructions = new Array();
  
  instructions.push(MM.MSG_BeforeUsingDynamicData);
  if (curSite.length != 0 && site.getIsServerSite(curSite))
	 instructions.push(dwscripts.sprintf(MM.MSG_CreateServer,'<a href="#" onMouseDown="event:CreateSite">','</a>'));
  else
	 instructions.push(dwscripts.sprintf(MM.MSG_CreateSite,'<a href="#" onMouseDown="event:CreateSite">','</a>'));
  instructions.push(dwscripts.sprintf(MM.MSG_ChooseDynamicDocType,'<a href="#" onMouseDown="event:SetDocType">','</a>'));
  if (curSite.length != 0 && site.getIsServerSite(curSite))
	 instructions.push(dwscripts.sprintf(MM.MSG_SetURLPrefix,'<a href="#" onMouseDown="event:CreateSite">','</a>'));
  else
 	 instructions.push(dwscripts.sprintf(MM.MSG_SetAppServer,'<a href="#" onMouseDown="event:SetAppServer">','</a>'));
  instructions.push(dwscripts.sprintf(MM.MSG_SetRDSPassword,'<a href="#" onMouseDown="event:SetRDSPassword">','</a>'));
  instructions.push(dwscripts.sprintf(MM.MSG_CreateCFDataSource,'<a href="#" onMouseDown="event:CreateCFDataSource">','</a>'));

  return instructions;
}



function setupStepsCompleted()
{
  var stepsCompleted = -1;	// all steps complete
  var dom = null;
  var serverModel = "";
  var url = "";
  var curSite = null;

  // Try to get the site for the currently selected document
  dom = dw.getDocumentDOM();
  if (dom != null)
    url = dom.URL;
  if (url.length > 0)
    curSite = site.getSiteForURL(url);
  else
    curSite = site.getCurrentSite();
  if (curSite.length == 0)
	curSite = site.getCurrentServerSite();

  // If no site defined, prompt user to create one
  if (curSite.length == 0)
    return 0;

  // Try to get the server model of the currently selected document
  // If no document is open, get the default server model for cur site.
  if (dom == null)
    dom = dw.getNewDocumentDOM();
  if (dom && dom.serverModel)
    serverModel = dom.serverModel.getFolderName();

  // If doc type does not support server markup, prompt user
  // to choose dynamic doc type
  if (serverModel.length == 0)
    return 1;

  // If no app server is defined, prompt user to specify one
  if (dom == null || dom.serverModel.testAppServer() == false)
    return 2;

  if (MMDB.needToPromptForRdsInfo(true))
    stepsCompleted = 3;
  else
  {
    MMDB.needToRefreshColdFusionDsnList();	// force refresh
    var dsnList = MMDB.getColdFusionDsnList();
    if (dsnList.length == 0)
      stepsCompleted = 4;
  }

  return stepsCompleted;
}
