// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.


// *************** GLOBALS VARS *****************

var helpDoc = MM.HELP_ssCFAdvancedRecordset;


var RECORDSET_SBOBJ;  // SBRecordset argument to the command.
var CMD_FILENAME_SIMPLE; // Command filename for simple recorset dialog.
var RECORDSET_TYPE = 'Advanced';
var DOCTYPE_IS_CFC = false;

var _RecordsetName = new TextField("Recordset.htm", "RecordsetName");
var _ConnectionName = new CFDataSourceMenu("Recordset.htm", "ConnectionName");
var _SQL = new TextField("Recordset.htm", "SQL");
var _UserName = new TextField("Recordset.htm", "UserName");
var _Password = new TextField("Recordset.htm", "Password");
var _ParamList = new ListControl("ParamList");
var _DBTree = null;
var _SelectBtn = null;
var _WhereBtn = null;
var _OrderByBtn = null;
var _PlusBtn = null;
var _MinusBtn = null;
var _ParamName = null;
var _ParamDefault = null;
var _ParamEditBtn = null;
var _cffunction__tag = new TagMenu("Recordset.htm", "cffunction__tag", "CFFUNCTION");

var sqlObject = null;

var G_BtnDelOff = "../Shared/UltraDev/Images/MinusButtonDisabled.gif";
var G_BtnAddOff = "../Shared/UltraDev/Images/PlusButtonDisabled.gif";

var G_BtnDelOn = "../Shared/UltraDev/Images/MinusButtonEnabled.gif";
var G_BtnAddOn = "../Shared/UltraDev/Images/PlusButton.gif";

var VARPROP_WIDTH_PX = 190;

var _RsTypeParameter;


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
  var btnArray =  new Array(MM.BTN_OK,     "clickedOK()", 
                   MM.BTN_Cancel, "clickedCancel()", 
                   MM.BTN_Test,   "clickedTest()");

	var dom = dreamweaver.getDocumentDOM();
	var docName = dom.URL;
	var docType = dom.documentType;
	
	// add a button for each different rs type
	for (i = 0;i < MM.rsTypes.length;i++) 
	{
		if(MM.rsTypes[i].single == "true") {
			continue;
		}
		if( (!MM.rsTypes[i].fileExt      || docName.match(MM.rsTypes[i].fileExtRegExp)) ||
		    (!MM.rsTypes[i].documentType || docType.match(MM.rsTypes[i].documentTypeRegExp)) )
		{	     
    		if (dom.serverModel.getServerName() == MM.rsTypes[i].serverModel) {
    			if (RECORDSET_TYPE.toLowerCase() != MM.rsTypes[i].type.toLowerCase()) {
	 				var btnLabel = dw.loadString("recordsetType/" + MM.rsTypes[i].type);
					if (!btnLabel)
						btnLabel = MM.rsTypes[i].type;
					btnArray.push(btnLabel+"...");
					btnArray.push("clickedChange(" + i + ")");
				}
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
	if( DOCTYPE_IS_CFC )
	{
		var fName = _cffunction__tag.listControl.getValue();
		if (!fName) {
			alert(MM.MSG_Select_Function);
			return;
		}
	}
	
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
  
  if (!RECORDSET_SBOBJ.checkData(true))
  {
    alert(RECORDSET_SBOBJ.getErrorMessage());
    return;
  }

  var theSQL = RECORDSET_SBOBJ.getSQLForTest();
  
  if (theSQL)
  {
    MMDB.showResultset(dwscripts.getCFDataSourceName(RECORDSET_SBOBJ.getConnectionName()), theSQL);
  }
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
  // Update RECORDSET_SBOBJ from the UI.
//  updateSBRecordsetObject();
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
	if(!checkAdvRS('2.7.7')) {
		alert(MM.MSG_CFC_old_AdvRS);
	}
	

	var setConnectionSuccess = true;  // return value from connectionmenu's initializeUI() 
	var args = dwscripts.getCommandArguments();
	RECORDSET_SBOBJ = args;

	// reanalyze to collect params IF editing a Recordset
	if (RECORDSET_SBOBJ.participants.length > 0) {
		RECORDSET_SBOBJ.analyze();
	}

	//  CMD_FILENAME_SIMPLE = args[1];
	var dom = dreamweaver.getDocumentDOM();
	DOCTYPE_IS_CFC = ( dom && dom.documentType == "CFC");
  
	// Get the UI elements
	_RsTypeParameter= new RsTypeMenu("Recordset.htm", "RsTypeParameter",recordsetDialog.searchByType(RECORDSET_TYPE));
	_RsTypeParameter.initializeUI();
	_RecordsetName.initializeUI();
	setConnectionSuccess = _ConnectionName.initializeUI();

	if( DOCTYPE_IS_CFC )
	{
		//make sure any cfc specific code is uncommented
		var tmpBody = new String( document.documentElement.outerHTML );
		if( tmpBody.indexOf( "<!--showOnlyForCFCs" ) != -1 )
		{
			tmpBody = tmpBody.replace(/<!--showOnlyForCFCs/mgi, "");
			tmpBody = tmpBody.replace(/showOnlyForCFCs-->/mgi, "")
			document.documentElement.outerHTML = tmpBody;
		}
		
		_cffunction__tag.initializeUI();
		if(RECORDSET_SBOBJ.sbParticipants.length > 0) {
			_cffunction__tag.listControl.object.setAttribute("disabled","true");
			var _newFunction = 	dwscripts.findDOMObject("newFunction");
			_newFunction.setAttribute("disabled","true");
		}
		if(RECORDSET_SBOBJ){
			_cffunction__tag.pickValue(RECORDSET_SBOBJ.getParameter("cffunction__tag"));
		}
	}

	_SQL.initializeUI();
	_UserName.initializeUI(); 
	_Password.initializeUI(); 

	// _ParamList = new GridControl("ParamList");
	_DBTree = new DatabaseTreeControl("DBTree");

	if (RECORDSET_SBOBJ.subType) {
		_RsTypeParameter.pickValue(RECORDSET_SBOBJ.subType);
	} else if (RECORDSET_SBOBJ.getParameter("MM_subType")) {
		_RsTypeParameter.pickValue(RECORDSET_SBOBJ.getParameter("MM_subType"));
	}

	// initialize the controls
	_SelectBtn = dwscripts.findDOMObject("SelectButton"); 
	_WhereBtn = dwscripts.findDOMObject("WhereButton"); 
	_OrderByBtn = dwscripts.findDOMObject("OrderByButton"); 
	_PlusBtn = dwscripts.findDOMObject("plusButton"); 
	_MinusBtn = dwscripts.findDOMObject("minusButton"); 
	_ParamName = dwscripts.findDOMObject("ParamName"); 
	_ParamDefault = dwscripts.findDOMObject("ParamDefault"); 
	_ParamEditBtn = dwscripts.findDOMObject("EditCFParam"); 
  
	var rsName = RECORDSET_SBOBJ.getRecordsetName();
	if (!rsName)
	{
		rsName = RECORDSET_SBOBJ.getUniqueRecordsetName();
	}
	_RecordsetName.setValue(rsName);
	_UserName.setValue(RECORDSET_SBOBJ.getUserName()); 
	_Password.setValue(RECORDSET_SBOBJ.getPassword());
	    
	// set the readonly param properties
	_ParamName.innerHTML = dwscripts.entityNameEncode(MM.LABEL_ParamAttributesName);
	_ParamDefault.innerHTML = dwscripts.entityNameEncode(MM.LABEL_ParamAttributesDefault);

	// If no value is defined for username, initialize user name control to empty string
	if (_UserName.getValue() == "null")  
	{
		_UserName.setValue(""); 
	}  
	  
	// If no value is defined for password, initialize password control to empty string
	if (_Password.getValue() == "null")
	{
		_Password.setValue(""); 
	}
  	
	var connectionName = RECORDSET_SBOBJ.getConnectionName();
	if (connectionName)
	{
		_ConnectionName.pickName(RECORDSET_SBOBJ.getConnectionName());
	}
  
	var sqlParams = new Array();
	var sqlString = RECORDSET_SBOBJ.getDatabaseCall(sqlParams);
	if (sqlString)
	{
		sqlObject = new SQLStatement(sqlString);
		if (sqlObject.getType() != SQLStatement.STMT_TYPE_UNKNOWN)
		{
			sqlObject.formatStatement();
			_SQL.setValue(sqlObject.getStatement());
		}
		else
		{
			_SQL.setValue(sqlString);
		}
	} 
	else  
	{
		sqlObject = new SQLStatement("");
	}
  
	var varNames = new Array();
	var varDefaults = new Array();  
	var count = sqlParams.length;
	for (var i=0; i < count; i++)
	{
		var param = sqlParams[i];
		varNames.push(param.varName);
		varDefaults.push(param.varDefault);
	}
	_ParamList.setAll(varNames, varDefaults);
	updateCFParamProperties(); 
	setParamEditButtonState(); 
	
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

  if (control == "ConnectionName")
  {
    // check the connection, and get a username and password if needed
    _ConnectionName.ensureLogin(RECORDSET_SBOBJ.getUserName(),
                                RECORDSET_SBOBJ.getPassword());

    if (event == "onChange")
    {
      // set the username and password for this data source
      _UserName.setValue(_ConnectionName.getUsername());
      _Password.setValue(_ConnectionName.getPassword());
    }
    
    // update the database tree
    _DBTree.setConnection(_ConnectionName.getValue());
  }
  else if (control == "DBTree")
  {
    setUIDisabledStateForCFSP(); 
  }
  else if (control == "SelectButton")
  {
    sqlObject.setStatement(_SQL.getValue());
    var sqlType = sqlObject.getType();
    
    var dbInfo = _DBTree.getSelectedData();
    
    if (!dbInfo)
    {
      alert(MM.MSG_InvalidSelectionCF);
    }
    else if ((sqlType == SQLStatement.STMT_TYPE_SELECT ||
              sqlType == SQLStatement.STMT_TYPE_EMPTY) &&
             (dbInfo.isTable() || dbInfo.isColumn()))
    {
      sqlObject.addFrom(dbInfo.table);
      if (dbInfo.isColumn())
      {
        sqlObject.addSelect(dbInfo.table, dbInfo.column);
      }

      _SQL.setValue(sqlObject.getStatement());
    }
    else if (dbInfo.isProcedure())
    {
      var sql = getStoredProcedureSQL(dbInfo.procedure, dbInfo.paramArray);

      if (sql)
      {
        _SQL.setValue(sql);
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
  else if (control == "plusButton")
  {
    var variableRefs = new Array();
    RECORDSET_SBOBJ.decodeVarRefs(_SQL.getValue(), variableRefs);
    var cmdArgs = new Array();
    cmdArgs[0] = false;
    cmdArgs[1] = variableRefs;
    cmdArgs[2] = "";
    cmdArgs[3] = "";
    var addParamResult = dwscripts.callCommand("Add CF Parameter", cmdArgs);    
    if (addParamResult && addParamResult.length && addParamResult[0])
    {
      var existingParams = _ParamList.get('all');
      var indexOfParam = dwscripts.findInArray(existingParams, addParamResult[0]);
      if (indexOfParam != -1)
      {
        if (confirm(dwscripts.sprintf(MM.MSG_ParameterAlreadyDefined, addParamResult[0])))
        {
          _ParamList.setValue(addParamResult[1], indexOfParam);
        }
      }
      else
      {
        _ParamList.append(addParamResult[0],addParamResult[1]);
      }
      updateCFParamProperties(); 
      setParamEditButtonState(); 
    }
  }
  else if (control == "minusButton")
  {
    _ParamList.del();
    updateCFParamProperties(); 
    setParamEditButtonState(); 
  }
  else if (control == "editCFParam")
  {
    var cmdArgs = new Array();
    cmdArgs[0] = true;
    cmdArgs[1] = null;
    cmdArgs[2] = _ParamList.get();
    cmdArgs[3] = _ParamList.getValue();
    var editParamResult = dwscripts.callCommand("Edit CF Parameter", cmdArgs);            
    if (editParamResult && editParamResult.length)
    {
      _ParamList.setValue(editParamResult[1]);
      updateCFParamProperties(); 
      setParamEditButtonState(); 
    }
  }
  else if (control == "ParamList")
  {
    setParamEditButtonState(); 
    updateCFParamProperties();
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
	RECORDSET_SBOBJ.setConnectionName(_ConnectionName.getName());
	RECORDSET_SBOBJ.setUserName(_UserName.getValue());
	RECORDSET_SBOBJ.setPassword(_Password.getValue());
	
	var sqlParams = new Array();
	
	var varNames = _ParamList.get('all');
	var varDefaults = _ParamList.getValue('all');
	for (var i=0; i < varNames.length; i++)
	{
		var param = new Object();
		param.varName = varNames[i];
		param.varDefault = varDefaults[i];
		sqlParams.push(param);
	}
  
	RECORDSET_SBOBJ.setDatabaseCall(_SQL.getValue(), sqlParams);
	if( DOCTYPE_IS_CFC )
	{
		if (RECORDSET_SBOBJ.sbParticipants.length == 0) {
			// set the MM_subType parameter
			RECORDSET_SBOBJ.setParameter("MM_subType",_RsTypeParameter.getValue());
			// set the cffunction tag parameter
			RECORDSET_SBOBJ.setParameter("cffunction__tag",_cffunction__tag.listControl.getValue());
		} else {
			// set the MM_subType parameter 
			RECORDSET_SBOBJ.setParameter("MM_subType", "Standard");
		}
	}
	else
	{
		RECORDSET_SBOBJ.setParameter("MM_subType",_RsTypeParameter.getValue());
	}

}


//--------------------------------------------------------------------
// FUNCTION:
//   setUIStateForCFSP
//
// DESCRIPTION:
//   Determines whether a stored procedure item has been selected in the 
//   DBTree control. If it has, disable the SQL buttons (select, where, orderby).
//   Otherwise, maintain 
//   the default state of the dialog where these controls are enabled. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function setUIDisabledStateForCFSP()
{
  var dbTreeInfo = _DBTree.getSelectedData(); 
  var CFStoredProcWarnNode = dwscripts.findDOMObject("CFStoredProcWarning"); 

  if (dbTreeInfo.isProcedure())
  {
    _SelectBtn.setAttribute("value", MM.LABEL_AddProc);
    _WhereBtn.setAttribute("disabled", "true");     
    _OrderByBtn.setAttribute("disabled", "true"); 

    CFStoredProcWarnNode.innerHTML = dwscripts.entityNameEncode(MM.MSG_StoredProcWarning); 
  }
  else 
  {
    _SelectBtn.setAttribute("value", MM.LABEL_AddSelect);
    _WhereBtn.removeAttribute("disabled");     
    _OrderByBtn.removeAttribute("disabled");   
    CFStoredProcWarnNode.innerHTML = ""; 
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateCFParamProperties
//
// DESCRIPTION:
//   Updates the name and default read only display values if there 
//   is a parameter selected in the list control 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function updateCFParamProperties()
{
  var selParamName = (_ParamList.get()) ? _ParamList.get() : ""; 
  var selParamDefault = (_ParamList.getValue()) ? _ParamList.getValue() : "";

  var shortParamName = dw.shortenString(MM.LABEL_ParamAttributesName + selParamName, 
                                        VARPROP_WIDTH_PX, false);
  _ParamName.innerHTML = dwscripts.entityNameEncode(shortParamName);
  var shortParamDefault = dw.shortenString(MM.LABEL_ParamAttributesDefault + selParamDefault, 
                                           VARPROP_WIDTH_PX, false);
  _ParamDefault.innerHTML = dwscripts.entityNameEncode(shortParamDefault);
}


//--------------------------------------------------------------------
// FUNCTION:
//   setParamEditButtonState
//
// DESCRIPTION:
//   Sets the param edit button to be enabled or disabled depending
//   on whether there is a selected parameter
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function setParamEditButtonState()
{
  if (_ParamList.get()){
    _ParamEditBtn.removeAttribute("disabled");   
  }
  else 
  {
    _ParamEditBtn.setAttribute("disabled","disabled"); 
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   getStoredProcedureSQL
//
// DESCRIPTION:
//   This method builds the SQL statment when a stored procedure is
//   selected in the tree.
//
// ARGUMENTS:
//   procedureName - string - name of the stored procedure
//   paramList - array - list of stored proc parameters returned
//     from the db tree control class
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function getStoredProcedureSQL(procedureName, paramList)
{
  var retVal = "";
  
  var sqlObject = new SQLStatement();
  
  sqlObject.setCommand("call");
  sqlObject.setSPName(procedureName);
  
  if (paramList)
  {
    for (var i=0; i < paramList.length; i++)
    {
      var paramName = dwscripts.stripChars(paramList[i].name, "@");

      var stype   = dwscripts.getDBColumnTypeAsString(paramList[i].type)
      var bString = dwscripts.isStringDBColumnType(paramList[i].type);
      var bBinary = dwscripts.isBinaryDBColumnType(paramList[i].type);

      if (paramName.toUpperCase() != "RETURN_VALUE")
      {
        if (bString)
        {
          sqlObject.addParam("'#" + paramName + "#'");
        }
        else
        {
          if (stype.toUpperCase() == "REF CURSOR" || bBinary)
          {
            sqlObject.addParam("?");
          }
          else
          {
            sqlObject.addParam("#" + paramName + "#");
          }
        }
      }
    }
  }
  
  retVal = sqlObject.getStatement();
  
  return retVal;
}
