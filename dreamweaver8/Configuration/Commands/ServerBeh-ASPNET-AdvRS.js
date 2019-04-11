// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

var helpDoc = MM.HELP_sbASPNetAdvRecordset;

var SB_FILENAME = dwscripts.getSBFileName();
var RECORDSET_SBOBJ;  // SBRecordset argument to the command.
var CMD_FILENAME_SIMPLE;
var STATIC_LENGTH = 190;
var RECORDSET_TYPE = 'Advanced';


var _RecordsetName = new TextField(SB_FILENAME, "RecordsetName");
var _ConnectionName = new ConnectionMenu(SB_FILENAME, "ConnectionName");
var _SQL = new TextField(SB_FILENAME, "SQL");
var _ParamList = new ListControl("ParamList");
var _ParamName = null;
var _ParamType = null;
var _ParamValue = null;
var _DBTree = null;
var _PlusBtn = null;
var _MinusBtn = null;
var _SelectBtn = null;
var _WhereBtn = null;
var _OrderByBtn = null;
var _FailureURL = new TextField(SB_FILENAME, "FailureURL");
var _DebugInfo = new CheckBox(SB_FILENAME, "Debug");
var _ParamEditBtn = null;
var _RsTypeParameter = new RsTypeMenu("Recordset.htm", "RsTypeParameter",recordsetDialog.searchByType(RECORDSET_TYPE));

var sqlObject = null;
var databaseType = null;

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
    MM.BTN_Test,     "clickedTest()"
	);
	var sm = dw.getDocumentDOM().serverModel.getServerName();
	// add a button for each different rs type
	for (i = 0;i < MM.rsTypes.length;i++) {
		if(MM.rsTypes[i].single == "true") {
			continue;
		}
		if (sm == MM.rsTypes[i].serverModel) {
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
//  updateSBRecordsetObject();
//  recordsetDialog.onClickSwitchUI(window,
//                                  recordsetDialog.UI_ACTION_SWITCH_SIMPLE, 
//                                  RECORDSET_SBOBJ,
//								  CMD_FILENAME_SIMPLE);
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
  
  RECORDSET_SBOBJ.transformURLs(false);

  // Get the UI elements

 	_RsTypeParameter.initializeUI();
  _RecordsetName.initializeUI();
  _ConnectionName.initializeUI();
  _SQL.initializeUI();
  _DBTree = new DatabaseTreeControl("DBTree");
  _SelectBtn = dwscripts.findDOMObject("SelectButton"); 
  _WhereBtn = dwscripts.findDOMObject("WhereButton"); 
  _OrderByBtn = dwscripts.findDOMObject("OrderByButton"); 
  _PlusBtn = new ImageButton("plusButton", "_PlusBtn", "sSd", false);
  _MinusBtn = new ImageButton("minusButton", "_MinusBtn", "sSd", false);
  _ParamEditBtn = dwscripts.findDOMObject("EditParam"); 
  _FailureURL.initializeUI(); 
  _DebugInfo.initializeUI(); 

  _ParamName = dwscripts.findDOMObject("ParamName");
  _ParamType = dwscripts.findDOMObject("ParamType");
  _ParamValue = dwscripts.findDOMObject("ParamValue");

  // set the readonly param properties
  _ParamName.innerHTML = dwscripts.entityNameEncode(MM.LABEL_ParamAttributesName);
  _ParamType.innerHTML = dwscripts.entityNameEncode(MM.LABEL_ParamAttributesType);
  _ParamValue.innerHTML = dwscripts.entityNameEncode(MM.LABEL_ParamAttributesValue);

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
	databaseType = MMDB.getDatabaseType(connectionName);
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

  var paramNames = new Array();

  for (var i = 0; i < sqlParams.length; i++)
  {
    paramNames.push(sqlParams[i].name);
  }

  _ParamList.setAll(paramNames, sqlParams);

  onParameterChanged();

  _FailureURL.setValue(RECORDSET_SBOBJ.getFailureURL());
  _DebugInfo.setCheckedState(RECORDSET_SBOBJ.getDebug());

  updateUI("Debug");

  elts = document.forms[0].elements;
  if (elts && elts.length)
  {
    elts[0].focus();
    elts[0].select();
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   setUIDisabledStateForSP
//
// DESCRIPTION:
//   Determines whether a stored procedure item has been selected in the 
//   DBTree control. If it has, disable the SQL buttons (select, where, orderby)
//   and also set the plus/minus button be disabled. Otherwise, maintain 
//   the default state of the dialog where these controls are enabled. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function setUIDisabledStateForSP()
{
  var dbTreeInfo = _DBTree.getSelectedData(); 
  var StoredProcWarnNode = dwscripts.findDOMObject("StoredProcWarning"); 

  if (dbTreeInfo.isProcedure())
  {
    _SelectBtn.setAttribute("disabled", "true"); 
    _WhereBtn.setAttribute("disabled", "true");     
    _OrderByBtn.setAttribute("disabled", "true"); 

    StoredProcWarnNode.innerHTML = dwscripts.entityNameEncode(MM.MSG_StoredProcWarning); 
  }
  else 
  {
    _SelectBtn.removeAttribute("disabled"); 
    _WhereBtn.removeAttribute("disabled");     
    _OrderByBtn.removeAttribute("disabled");   

    StoredProcWarnNode.innerHTML = ""; 
  }

  updateButtons();
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
    if (!_PlusBtn.disabled)
	{
	  var cmdArgs = new Array();
  
      cmdArgs.push(databaseType);
	
	  cmdArgs = dwscripts.callCommand("AddASPNETParam", cmdArgs);

      if (cmdArgs)
      {
	    var param = new Object();

	    param.name = cmdArgs[0];
	    param.type = cmdArgs[1];
        param.runtime = cmdArgs[2];
      
        _ParamList.add(param.name, param);
	    onParameterChanged();
      }
    }
  }
  else if (control == "minusButton")
  {
    if (!_MinusBtn.disabled)
	{
	  _ParamList.del();
	  onParameterChanged();
    }
  }
  else if (control == "Define")
  {
    var before = _ConnectionName.getValue();

    _ConnectionName.launchConnectionDialog();

	if (before != _ConnectionName.getValue())
	{
	  updateUI("ConnectionName");
	}
  }
  else if (control == "ConnectionName")
  {
    var connName = _ConnectionName.getValue();

    _DBTree.setConnection(connName);
	databaseType = MMDB.getDatabaseType(connName);

	updateButtons();
  }
  else if (control == "ParamList")
  {
    onParameterChanged();
  }
  else if (control == "EditParam")
  {
    var param = _ParamList.getValue();
    var cmdArgs = new Array();
    
	cmdArgs[0] = databaseType;
	cmdArgs[1] = param.name;
	cmdArgs[2] = param.type;
	cmdArgs[3] = param.runtime;
    
	var ret = dwscripts.callCommand("EditASPNETParam", cmdArgs);
    
	if (ret && ret.length)
    {
	  param.name = ret[0];
	  param.type = ret[1];
	  param.runtime = ret[2];

      _ParamList.set(param.name);

      onParameterChanged();
    }
  }
  else if (control == "FailureURL")
  {
    var theFailureURL = dw.browseForFileURL("select", MM.LABEL_FileRedirect,0,0); 
    
    if (theFailureURL.length > 0)
    {
      _FailureURL.setValue(theFailureURL); 
    }    
  }
  else if (control == "Debug")
  {
    _FailureURL.setDisabled(_DebugInfo.getCheckedState());
  }
  else if (control == "DBTree")
  {
    setUIDisabledStateForSP(); 
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

      if (dbInfo && dbInfo.isColumn())
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

      if (dbInfo && dbInfo.isColumn())
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

  var sql = dwscripts.trim(_SQL.getValue());
  var params = _ParamList.getValue('all');

  RECORDSET_SBOBJ.setDatabaseCall(sql, params);
  RECORDSET_SBOBJ.setFailureURL(_FailureURL.getValue());
  RECORDSET_SBOBJ.transformURLs(true);
  RECORDSET_SBOBJ.setDebug(_DebugInfo.getCheckedState());

	// set the MM_subType parameter 
	RECORDSET_SBOBJ.setParameter("MM_subType",_RsTypeParameter.getValue());
}

function onParameterChanged()
{
  var paramName = "";
  var paramType = "";
  var paramValue = "";

  var param = _ParamList.getValue();
    
  if (param)
  {
  	paramName = param.name;
	paramType = param.type;
    paramValue = param.runtime;
  }

  var shortParamName = dw.shortenString(MM.LABEL_ParamAttributesName + paramName, STATIC_LENGTH, false);
  _ParamName.innerHTML = dwscripts.entityNameEncode(shortParamName);
  
  var shortParamType = dw.shortenString(MM.LABEL_ParamAttributesType + paramType, STATIC_LENGTH, false);
  _ParamType.innerHTML = dwscripts.entityNameEncode(shortParamType);

  var shortParamValue= dw.shortenString(MM.LABEL_ParamAttributesValue + paramValue, STATIC_LENGTH, false);
  _ParamValue.innerHTML = dwscripts.entityNameEncode(shortParamValue);

  updateButtons();
}

function updateButtons()
{
  var param = _ParamList.getValue();
  var dbTreeInfo = _DBTree.getSelectedData(); 
  var isProcedure = dbTreeInfo ? dbTreeInfo.isProcedure() : false;
    
  _MinusBtn.setDisabled(!param || isProcedure);

  if (databaseType && !isProcedure)
  {
    _PlusBtn.enable();
	
	if (param)
	{
	  _ParamEditBtn.removeAttribute("disabled");
	}
  }
  else
  {
    _PlusBtn.disable();
    _ParamEditBtn.setAttribute("disabled", "disabled");
  }
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
