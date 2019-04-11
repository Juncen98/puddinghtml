// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

var DATASRCBUTTONUP			= "Components/Common/DataSources/DataSource.gif";
var DATASRCBUTTONDOWN		= "Components/Common/DataSources/DataSource_sel.gif";
var DATASRCBUTTONDISABLED	= "Components/Common/DataSources/DataSource_dis.gif";

var DEBUG = false
var helpDoc = MM.HELP_compConnections;

//*************** GLOBALS VARS *****************

// !! IMPORTANT!! 
// 
// Files that include Connections.js must also include
// Component_LocalText.js, which contains the localizable strings.
//
// !! IMPORTANT !!

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
		var ConnectionList = MMDB.getConnectionList();
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
			var TablesCompInfo = new ComponentRec(MM.LABEL_Tables, TABLES_FILENAME, true,false, MM.LABEL_Tables, false);
			TablesCompInfo.objectType = "Tables";
			cs_Children.push(TablesCompInfo);

			var ViewsCompInfo = new ComponentRec(MM.LABEL_Views, VIEWS_FILENAME, true, false, MM.LABEL_Views, false);
			ViewsCompInfo.objectType = "Views";
			cs_Children.push(ViewsCompInfo);

			var StoredProceduresCompInfo = new ComponentRec(MM.LABEL_StoredProcs,  PROCEDURES_FILENAME, true, false, MM.LABEL_StoredProcs, false);
			StoredProceduresCompInfo.objectType = "Stored Procedures";
			cs_Children.push(StoredProceduresCompInfo);
		}
		else if (componentRec.objectType == "Tables")
		{
			//get the list of tables for the given Connection object.
			var connectionName = componentRec.parent.name;
			if(connectionName && connectionName.length)
			{
				var tableObjects	   = MMDB.getTables(connectionName);
				for (i = 0; i < tableObjects.length; i++)
				{
				  var thisTable = tableObjects[i]
				  thisSchema =  dwscripts.trim(thisTable.schema)
				  if (thisSchema.length == 0)
				  {
					thisSchema = dwscripts.trim(thisTable.catalog)
				  }
				  if (thisSchema.length > 0)
				  {
					thisSchema += "."
				  }

				  var tableName = String(thisSchema + thisTable.table);
				  var TableCompInfo = new ComponentRec(tableName, TABLE_FILENAME,true,true,tableName,false,true);
				  TableCompInfo.objectType = "Table";
				  cs_Children.push(TableCompInfo);
				}
			}
		}
		else if (componentRec.objectType == "Views")
		{
			//get the list of tables for the given Connection object.
			var connectionName = componentRec.parent.name;
			if(connectionName && connectionName.length)
			{
				var viewObjects	   = MMDB.getViews(connectionName);
				for (i = 0; i < viewObjects.length; i++)
				{
				  var thisView = viewObjects[i]
				  thisSchema =  dwscripts.trim(thisView.schema)
				  if (thisSchema.length == 0)
				  {
					thisSchema = dwscripts.trim(thisView.catalog)
				  }
				  if (thisSchema.length > 0)
				  {
					thisSchema += "."
				  }

				  var viewName = String(thisSchema + thisView.view);
				  var ViewCompInfo = new ComponentRec(viewName, VIEW_FILENAME,true,true,viewName,false,true);
				  ViewCompInfo.objectType = "View";
				  cs_Children.push(ViewCompInfo);
				}
			}
		}
		else if (componentRec.objectType == "Stored Procedures")
		{
			//get the list of tables for the given Connection object.
			var connectionName = componentRec.parent.name;
			if(connectionName && connectionName.length)
			{
				var procObjects	   = MMDB.getProcedures(connectionName);
				for (i = 0; i < procObjects.length; i++)
				{
				  var thisProcedure = procObjects[i]
				  thisSchema =  dwscripts.trim(thisProcedure.schema)
				  if (thisSchema.length == 0)
				  {
					thisSchema = dwscripts.trim(thisProcedure.catalog)
				  }
				  if (thisSchema.length > 0)
				  {
					thisSchema += "."
				  }

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

			if(tableName && tableName.length)
			{
				if(tableName.indexOf(" ") >= 0)
				{
					var aBracketedTable = "";
					var aSplitTable = tableName.split(".");
					var n = aSplitTable.length;
					for(var i = 0; i < n; i++)
					{
						if(i > 0)
						{
							aBracketedTable += ".";
						}
						var aSlice = aSplitTable[i];
						if(aSlice.indexOf(" ") >= 0 && aSlice.charAt(0) != "[")
						{
							aBracketedTable += "[" + aSlice + "]";
						}
						else
						{
							aBracketedTable += aSlice;
						}
					}
					tableName = aBracketedTable;
				}

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
				var databaseType   = MMDB.getDatabaseType(connName);
				var paramNameObjs = MMDB.getSPParameters(connName,procName);

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
//   handleDoubleClick
//
// DESCRIPTION:
//	 event handler to javascript to implement on double clicked on item.
//
// ARGUMENTS:
//	 parentNode-componentRec.
//	
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function handleDoubleClick(componentRec) 
{
  if (componentRec) 
  {
	if (componentRec.objectType=="Connection")
	{
		clickedEdit();
		return true;
	}
  }
  return false;
}

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
	return "DWConnectionsContext";
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

	//if we're a coldfusion connection, add a button to get to admin via the server
	if (isDisplayingColdfusionConnections())
	{
		var datasrcButton = new ToolbarControlRec();
		datasrcButton.image			= DATASRCBUTTONUP;
		datasrcButton.pressedImage	= DATASRCBUTTONDOWN;
		datasrcButton.disabledImage	= DATASRCBUTTONDISABLED;
		datasrcButton.toolStyle		= "right";
		datasrcButton.toolTipText	= MM.BTN_ModifyDataSources;
		datasrcButton.command = "MMDB.showColdFusionAdmin();";
		datasrcButton.enabled = true;
		toolBarBtnArray.push(datasrcButton);
	}

	var refreshButton = new ToolbarControlRec();
	refreshButton.image			= REFRESHBUTTONUP;
	refreshButton.pressedImage	= REFRESHBUTTONDOWN;
	refreshButton.disabledImage	= REFRESHBUTTONDISABLED;
	refreshButton.toolStyle		= "right";
	refreshButton.toolTipText	= MM.BTN_Refresh;
	refreshButton.command = "clickedRefresh()";
	// No reason to ever disable refresh button
	//refreshButton.enabled = "(dw.databasePalette.getSelectedNode() && (dw.databasePalette.getSelectedNode().objectType=='Connection'))";
	toolBarBtnArray.push(refreshButton);

    return toolBarBtnArray;
}

//*-------------------------------------------------------------------
// FUNCTION:
//   modifyColdFusionDataSources()
//
// DESCRIPTION: Invoke ColdFusion ODBC Data Source Administration panel
//
// ARGUMENTS: None
//	
// RETURNS: None
//--------------------------------------------------------------------
function modifyColdFusionDataSources()
{
	MMDB.showColdFusionAdmin();
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
      var connectionURL = dwscripts.getConnectionURL(componentRec.name);
      
      var codeToDrop = dw.getExtDataValue("connectioninc_statement", "insertText");
      
      codeToDrop = codeToDrop.replace(/@@connectionURL@@/, connectionURL);      
    }
	else if ((componentRec.objectType == "Column") ||
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
		if ((componentRec.objectType == "Table") || (componentRec.objectType == "View"))
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
			//[akishnani 08/01/05] bug fix for bug 197600:All recordsets are created with name 'Recordset1', on drag & drop a table from database panel
			MM.RecordsetPriorRec = null; 
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




//*******************  LOCAL  FUNCTIONS **********************
//*-------------------------------------------------------------------
// FUNCTION:
//   toolbarButtons
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------

function clickedDelete()
{
	var selectedObj = dw.databasePalette.getSelectedNode();
	if (selectedObj && selectedObj.objectType=="Connection")
	{
		var connRec = MMDB.getConnection(selectedObj.name);
		if (connRec) 
		{
			MMDB.deleteConnection(selectedObj.name);
			if (isDisplayingColdfusionConnections())
			{
				deleteDSN(selectedObj.name);
			}
			clickedRefresh();
		}
	}
}

//*-------------------------------------------------------------------
// FUNCTION:
//   clickedEdit()
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function clickedEdit()
{
	var selectedObj = dw.databasePalette.getSelectedNode();
	if (selectedObj && selectedObj.objectType=="Connection")
	{
		var connRec = MMDB.getConnection(selectedObj.name);
		if (connRec) 
		{
			if (isDisplayingColdfusionConnections()) {
				MM.DSNName = selectedObj.name;
				var dsType = getDataSourceType(selectedObj.name);
				if (dsType) {
					switch (dsType.toLowerCase()) {
						case "db2":
							MMDB.popupConnection('Conn_CF_01_DB2.htm');
							break;
						case "informix":
							MMDB.popupConnection('Conn_CF_02_Informix.htm');
							break;
						case "msaccess":
							MMDB.popupConnection('Conn_CF_03_MSAccess.htm');
							break;
						case "msaccessjet":
							MMDB.popupConnection('Conn_CF_04_MSAccessUnicode.htm');
							break;
						case "mssqlserver":
							MMDB.popupConnection('Conn_CF_05_MSSQL.htm');
							break;
						case "mysql":
							MMDB.popupConnection('Conn_CF_06_MySQL.htm');
							break;
						case "odbcsocket":
							MMDB.popupConnection('Conn_CF_07_ODBC.htm');
							break;
						case "oracle":
							MMDB.popupConnection('Conn_CF_08_Oracle.htm');
							break;
						case "sybase":
							MMDB.popupConnection('Conn_CF_10_Sybase.htm');
							break;
						default:
							MMDB.popupConnection('Conn_CF_09_Other.htm');
							break;
					}
				}
			} else {
				MMDB.popupConnection(connRec);
			}
		}
	}
}

//*-------------------------------------------------------------------
// FUNCTION:
//   clickedDuplicate()
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function clickedDuplicate()
{
	var selectedObj = dw.databasePalette.getSelectedNode();
	if (selectedObj && selectedObj.objectType=="Connection")
	{
		var connRec = MMDB.getConnection(selectedObj.name);
		if (connRec)
		{
			MMDB.popupConnection(connRec,true);
			dw.databasePalette.refresh();
		}
	}
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
//   clickedRefresh()
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function clickedRefresh() 
{
	if (isDisplayingColdfusionConnections()) {
		refreshDSList();
	}
	dw.databasePalette.refresh();
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
	objname = dwscripts.unescServerQuotes(objname);
	var sqlstatement = "Select * from " + objname;
	MMDB.showResultset(connname,sqlstatement,MM.MSG_ViewData);
  }
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
  if (isDisplayingColdfusionConnections())
  {
		instructions.push(dwscripts.sprintf(MM.MSG_SetRDSPassword,'<a href="#" onMouseDown="event:SetRDSPassword">','</a>'));
	}
	instructions.push(MM.MSG_ClickPlusBtnToCreateConn);

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
  if (dom.serverModel.testAppServer() == false)
    return 2;

  if (isDisplayingColdfusionConnections())
  {
    if (MMDB.needToPromptForRdsInfo(true))
      stepsCompleted = 3;
    else
    {
      var connList = MMDB.getConnectionList();
      if (connList.length == 0)
        stepsCompleted = 4;
    }
  }
  else
  {
    var connList = MMDB.getConnectionList();
    if (connList.length == 0)
      stepsCompleted = 3;
  }

  return stepsCompleted;
}

//*-------------------------------------------------------------------
// FUNCTION:
//   isDisplayingColdfusionConnections
//
// DESCRIPTION:
//	 returns true if these are CF connectins
//
// ARGUMENTS:
//	 none
//	
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function isDisplayingColdfusionConnections()
{
	dom = dw.getDocumentDOM();
	var aServerModelName = null;
	if (dom && dom.serverModel){
		aServerModelName = dom.serverModel.getDisplayName();
	}else{
		//look in the site for potential server model
		aServerModelName = site.getServerDisplayNameForSite();
	}

	return (aServerModelName.length && aServerModelName.toLowerCase() == "coldfusion")
}
