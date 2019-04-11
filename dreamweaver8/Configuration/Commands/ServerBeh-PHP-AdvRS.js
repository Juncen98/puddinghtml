// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.


// *************** GLOBALS VARS *****************

var helpDoc = MM.HELP_ssAdvancedRecordset;


var RECORDSET_SBOBJ;  // SBRecordset argument to the command.
var CMD_FILENAME_SIMPLE;
var RECORDSET_TYPE = 'Advanced';


var _RecordsetName = new TextField("Recordset.htm", "RecordsetName");
var _ConnectionName = new ConnectionMenu("Recordset.htm", "ConnectionName");
var _SQL = new TextField("Recordset.htm", "SQL");
var _ParamList = null;
var _DBTree = null;
var _RsTypeParameter = new RsTypeMenu("Recordset.htm", "RsTypeParameter",recordsetDialog.searchByType(RECORDSET_TYPE));

var sqlObject = null;


// ******************* API **********************

//--------------------------------------------------------------------
// FUNCTION:
//   commandButtons
//
// DESCRIPTION:
//   Returns the list of buttons which should appear on the right hand
//   side of the dialog
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   Array - pairs of button name and function call
//--------------------------------------------------------------------

function commandButtons()
{
	btnArray =  new Array(
		MM.BTN_OK,       "clickedOK()", 
                   MM.BTN_Cancel, "clickedCancel()", 
        MM.BTN_Test,     "clickedTest()");
	// add a button for each different rs type
	for (i = 0;i < MM.rsTypes.length;i++) {
 	  if(MM.rsTypes[i].single == "true") {
	    continue;
	  }
    	if (dw.getDocumentDOM().serverModel.getServerName() == MM.rsTypes[i].serverModel) {
    		if (RECORDSET_TYPE.toLowerCase() != MM.rsTypes[i].type.toLowerCase()) {
				var btnLabel = dw.loadString("recordsetType/" + MM.rsTypes[i].type);
				if (!btnLabel)
					btnLabel = MM.rsTypes[i].type;
				btnArray.push(btnLabel+"...");
				btnArray.push("clickedChange(" + i + ")");
			}
		}
	}
	btnArray.push(MM.BTN_Help);
	btnArray.push("displayHelp()"); 
	return btnArray;
}
//--------------------------------------------------------------------
// FUNCTION:
//   clickedChange
//
// DESCRIPTION:
//   This function is called when the user clicks another rs Type button
//
// ARGUMENTS:
//   newUIAction - the index of the new rs Type
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function clickedChange(newUIAction) {
  // Update RECORDSET_SBOBJ from the UI.
  updateSBRecordsetObject();

  recordsetDialog.onClickSwitchUI(window, newUIAction, 
                                  RECORDSET_SBOBJ, MM.rsTypes[newUIAction].command);
}

//--------------------------------------------------------------------
// FUNCTION:
//   clickedChange
//
// DESCRIPTION:
//   This function is called when the user clicks another rs Type button
//
// ARGUMENTS:
//   newUIAction - the index of the new rs Type
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function clickedChange(newUIAction) {
  // Update RECORDSET_SBOBJ from the UI.
  updateSBRecordsetObject();

  recordsetDialog.onClickSwitchUI(window, newUIAction, 
                                  RECORDSET_SBOBJ, MM.rsTypes[newUIAction].command);
}

//--------------------------------------------------------------------
// FUNCTION:
//   clickedOK
//
// DESCRIPTION:
//   This function is called when the user clicks OK
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function clickedOK()
{
  // Update RECORDSET_SBOBJ from the UI.
  updateSBRecordsetObject();

  recordsetDialog.onClickOK(window, RECORDSET_SBOBJ);
}


//--------------------------------------------------------------------
// FUNCTION:
//   clickedCancel
//
// DESCRIPTION:
//   This function is called when CANCEL is clicked
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function clickedCancel()
{
  recordsetDialog.onClickCancel(window);
}


//--------------------------------------------------------------------
// FUNCTION:
//   clickedTest
//
// DESCRIPTION:
//   This function is called when the user clicks the TEST button
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function clickedTest()
{
  // Update RECORDSET_SBOBJ from the UI.
  updateSBRecordsetObject();

  recordsetDialog.displayTestDialog(RECORDSET_SBOBJ);
}


//--------------------------------------------------------------------
// FUNCTION:
//   clickedSimple
//
// DESCRIPTION:
//   This function is called when the user clicks the SIMPLE button
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

//function clickedSimple()
//{
//  // Update RECORDSET_SBOBJ from the UI.
//  updateSBRecordsetObject();
//
//  recordsetDialog.onClickSwitchUI(window, recordsetDialog.UI_ACTION_SWITCH_SIMPLE, 
//                                  RECORDSET_SBOBJ, CMD_FILENAME_SIMPLE);
//}


//--------------------------------------------------------------------
// FUNCTION:
//   displayHelp
//
// DESCRIPTION:
//   This function is called when the user clicks the HELP button
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function displayHelp()
{
  dwscripts.displayDWHelp(helpDoc);
}


// ***************** LOCAL FUNCTIONS  ******************

//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//   This function is called in the onLoad event.  It is responsible
//   for initializing the UI.  If we are inserting a recordset, this
//   is a matter of populating the connection drop down.
//
//   If we are modifying a recordset, this is a matter of inspecting
//   the recordset tag and setting all the form elements.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function initializeUI()
{
  var args = dwscripts.getCommandArguments();
  RECORDSET_SBOBJ = args;
  //CMD_FILENAME_SIMPLE = args[1];
  
  // Get the UI elements
  _RsTypeParameter.initializeUI();
  _RecordsetName.initializeUI();
  _ConnectionName.initializeUI();
  _SQL.initializeUI();
  _ParamList = new GridControl("ParamList");
  _DBTree = new DatabaseTreeControl("DBTree");

	if (RECORDSET_SBOBJ.subType) {
		_RsTypeParameter.pickValue(RECORDSET_SBOBJ.subType);
	} else if (RECORDSET_SBOBJ.getParameter("MM_subType")) {
		_RsTypeParameter.pickValue(RECORDSET_SBOBJ.getParameter("MM_subType"));
	}

  var rsName = RECORDSET_SBOBJ.getRecordsetName();
  if (!rsName)
  {
    rsName = RECORDSET_SBOBJ.getUniqueRecordsetName();
  }
  _RecordsetName.setValue(rsName);
  
  var connectionName = RECORDSET_SBOBJ.getConnectionName();
  if (connectionName)
  {
    _ConnectionName.pickValue(RECORDSET_SBOBJ.getConnectionName());
  }

  var sqlParams = new Array();
  var sqlString = RECORDSET_SBOBJ.getDatabaseCall(sqlParams);
  if (sqlString)
  {
    sqlObject = new SQLStatement(sqlString);
    sqlObject.formatStatement();
    _SQL.setValue(sqlObject.getStatement());
  }
  else
  {
    sqlObject = new SQLStatement("");
  }

  var varArray = new Array();
  var count = sqlParams.length;
  for (var i=0; i < count; i++)
  {
    var param = sqlParams[i];
    var row = new Array();
    row.push(param.varName);
    row.push(param.defaultValue);
    row.push(param.runtimeValue);
    varArray.push(row);
  }
  _ParamList.setAll(varArray);

  elts = document.forms[0].elements;
  if (elts && elts.length)
  {
    elts[0].focus();
    elts[0].select();
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//   This function is called by the UI controls to handle UI updates
//
// ARGUMENTS:
//   control - string - the name of the control sending the event
//   event - string - the event which is being sent
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function updateUI(control, event)
{
  if (control == "plusButton")
  {
	var cmdArgs = dwscripts.callCommand("AddPHPParam", null);
	
    if (cmdArgs)
    {
	 // var param = new Object();
	 // param.name = cmdArgs[0];
	 // param.defValue = cmdArgs[1];
     // param.runtime = cmdArgs[2];

      _ParamList.add( cmdArgs );
	  // _ParamList.add(param.name, param);
	 }
  }
  else if (control == "minusButton")
  {
    _ParamList.del();
  }
  else if (control == "Define")
  {
    _ConnectionName.launchConnectionDialog();
    _DBTree.setConnection(_ConnectionName.getValue());
  }
  else if (control == "ConnectionName")
  {
    _DBTree.setConnection(_ConnectionName.getValue());
  }
  else if (control == "DBTree")
  {
    // place code here to enable and disable insertion buttons
    // based on the DB tree selection
  }
  else if (control == "SelectButton")
  {
    sqlObject.setStatement(_SQL.getValue());
    if (sqlObject.getType() == SQLStatement.STMT_TYPE_SELECT ||
        sqlObject.getType() == SQLStatement.STMT_TYPE_EMPTY)
    {
      var dbInfo = _DBTree.getSelectedData();

      if ( dbInfo && (dbInfo.isTable() || dbInfo.isColumn()) )
      {
        sqlObject.addFrom(dbInfo.table);
        if (dbInfo.isColumn())
        {
          sqlObject.addSelect(dbInfo.table, dbInfo.column);
        }

        _SQL.setValue(sqlObject.getStatement());
      }
    }
    else
    {
      alert(MM.MSG_CanOnlyUseButtonsOnSelectStatements);
    }
  }
  else if (control == "WhereButton")
  {
    sqlObject.setStatement(_SQL.getValue());
    if (sqlObject.getType() == SQLStatement.STMT_TYPE_SELECT)
    {
      var dbInfo = _DBTree.getSelectedData();

      if ( dbInfo && dbInfo.isColumn() )
      {
        sqlObject.addWhere(dbInfo.table, dbInfo.column);
        _SQL.setValue(sqlObject.getStatement());
      }
    }
    else if (sqlObject.getType() != SQLStatement.STMT_TYPE_EMPTY)
    {
      alert(MM.MSG_CanOnlyUseButtonsOnSelectStatements);
    }
  }
  else if (control == "OrderByButton")
  {
    sqlObject.setStatement(_SQL.getValue());
    if (sqlObject.getType() == SQLStatement.STMT_TYPE_SELECT)
    {
      var dbInfo = _DBTree.getSelectedData();

      if ( dbInfo && dbInfo.isColumn() )
      {
        sqlObject.addOrderBy(dbInfo.table, dbInfo.column);
        _SQL.setValue(sqlObject.getStatement());
      }
    }
    else if (sqlObject.getType() != SQLStatement.STMT_TYPE_EMPTY)
    {
      alert(MM.MSG_CanOnlyUseButtonsOnSelectStatements);
    }
  }
  else if (control == "SQL")
  {
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateSBRecordsetObject
//
// DESCRIPTION:
//   Collects information from the UI and sets the SBRecordset object
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean - true if successful, false otherwise
//--------------------------------------------------------------------

function updateSBRecordsetObject()
{
  RECORDSET_SBOBJ.setRecordsetName(_RecordsetName.getValue());

  RECORDSET_SBOBJ.setConnectionName(_ConnectionName.getValue());

  var sqlParams = new Array();
  var varArray = _ParamList.getAll();
  for (var i=0; i < varArray.length; i++)
  {
    var param = new Object();
    param.varName = varArray[i][0];
    param.defaultValue = varArray[i][1];
    param.runtimeValue = varArray[i][2];
    sqlParams.push(param);
  }

  RECORDSET_SBOBJ.setDatabaseCall(_SQL.getValue(), sqlParams);
	// set the MM_subType parameter 
	RECORDSET_SBOBJ.setParameter("MM_subType",_RsTypeParameter.getValue());
}




//--------------------------------------------------------------------
// FUNCTION:
//   canDisplayRecordset
//
// DESCRIPTION:
//   Returns true if the given recordset can be displayed in this
//   recordset dialog. Called by the recordsetDialog to determine which
//   dialog to display.
//
// ARGUMENTS: 
//   sbRecordset - SBRecordset. the recordset to check.
//
// RETURNS:
//   boolean - true if can display the recordset.
//--------------------------------------------------------------------

function canDisplayRecordset(sbRecordset) 
{
	return true;
}
