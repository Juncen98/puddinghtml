// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.


// *************** GLOBALS VARS *****************

var helpDoc = MM.HELP_ssSimpleRecordset;


var RECORDSET_SBOBJ;  // SBRecordset argument to the command.
var CMD_FILENAME_ADV; // Command filename for the advanced recordset dialog.
var SIMPLE_PARAM_NAME = 'colname' ;
var RECORDSET_TYPE = 'Simple';

var _RecordsetName = new TextField("Recordset.htm", "RecordsetName");
var _ConnectionName = new ConnectionMenu("Recordset.htm", "ConnectionName");
var _TableName = new ConnectionTableMenu("Recordset.htm", "TableName");
var _ColumnType = new RadioGroup("Recordset.htm", "ColumnType");
var _ColumnList = new ConnectionColumnMenu("Recordset.htm", "ColumnList", "", false);
var _FilterColumn = new ConnectionColumnMenu("Recordset.htm", "FilterColumn", "", true);
var _FilterOperator = new ListMenu("Recordset.htm", "FilterOperator");
var _FilterParameter = new ListMenu("Recordset.htm", "FilterParameter");
var _FilterParameterValue = new TextField("Recordset.htm", "FilterParameterValue");
var _SortColumn = new ConnectionColumnMenu("Recordset.htm", "SortColumn", "", true);
var _SortDirection = new ListMenu("Recordset.htm", "SortDirection");
var _RsTypeParameter = new RsTypeMenu("Recordset.htm", "RsTypeParameter",recordsetDialog.searchByType(RECORDSET_TYPE));



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
                   MM.BTN_Cancel,   "clickedCancel()", 
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
  // added a check to make sure that some columns are selected if the radio
  // radio buttion is checked.
  if (_ColumnType.getValue() == "some")
  {
    if (_ColumnList.getValues().length == 0)
	{
	  alert(MM.MSG_SelectColumns);
	  return;
	}
  }
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
//   clickedAdvanced
//
// DESCRIPTION:
//   This function is called when the user clicks the ADVANCED button
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

//function clickedAdvanced()
//{
//  // Update RECORDSET_SBOBJ from the UI.
//  updateSBRecordsetObject();
//
//  recordsetDialog.onClickSwitchUI(window, recordsetDialog.UI_ACTION_SWITCH_ADV, 
//                                  RECORDSET_SBOBJ, CMD_FILENAME_ADV);
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
  var sqlObject = null;

  var args = dwscripts.getCommandArguments();
  RECORDSET_SBOBJ = args;
  //CMD_FILENAME_ADV = args[1];
  
  // Get the UI elements
	_RsTypeParameter.initializeUI();
  _RecordsetName.initializeUI();
  _ConnectionName.initializeUI();
  _TableName.initializeUI();
  _ColumnType.initializeUI();
  _ColumnList.initializeUI();
  _FilterColumn.initializeUI();
  _FilterOperator.initializeUI();
  _FilterParameter.initializeUI(dwscripts.getParameterTypeArray(), dwscripts.getParameterTypeArray());
  _FilterParameterValue.initializeUI();
  _SortColumn.initializeUI();
  _SortDirection.initializeUI();

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
  }
  else
  {
    sqlObject = new SQLStatement("");
  }

  if (sqlObject.getType() == SQLStatement.STMT_TYPE_SELECT)
  {
    // select the correct table
    var tableNames = sqlObject.getTableNames();
    if (tableNames && tableNames.length > 0)
    {
      _TableName.pickValue(tableNames[0]);
    }

    // selet the correct columns
    var columnNames = sqlObject.getColumnNames();
    if (columnNames.length == 1 && columnNames[0] == "*")
    {
      _ColumnType.pickValue("all");
    }
    else
    {
      _ColumnType.pickValue("some");
      _ColumnList.setDisabled(false);
      // multiply select the given columns
      _ColumnList.pickValues(columnNames);
    }

    // select the correct filter column
   
    var filterInfo = RECORDSET_SBOBJ.getSimpleWhereInfo(sqlObject);
    if (filterInfo != null)
    {
      if (filterInfo.lval)
      {
        _FilterColumn.pickValue(filterInfo.lval);
      }
      if (filterInfo.operator)
      {
        _FilterOperator.pickValue(filterInfo.operator);
      }
      if (filterInfo.rval)
      {
        var param = new Object();
        // If there is not sql parameter, this is probably an entered parameter
        //   value. Use the filter rval as the runtime code.
        if (sqlParams.length > 0)
        {
          param = sqlParams[0];
        }
        else
        {
          param.runtimeValue = filterInfo.rval; 
        }

        // The parameter name is the 'runtime' value expected in dwscripts.getParameterTypeFromCode.
        var paramInfo = dwscripts.getParameterTypeFromCode(param.runtimeValue);
        
        if (filterInfo.isString && paramInfo.paramType == MM.LABEL_PHP_Param_Types[5])
        {
          paramInfo.paramName = "'" + paramInfo.paramName + "'";
        }
        
        if (paramInfo.paramType == "Entered Value") {
        	paramInfo.paramName = paramInfo.paramName.replace(/^'/, "");
        	paramInfo.paramName = paramInfo.paramName.replace(/'$/, "");
        }

        _FilterParameter.pickValue(paramInfo.paramType);
        _FilterParameterValue.setValue(paramInfo.paramName);
      }
    }
    else
    {
      updateUI("FilterColumn", "onChange");
    }

    var orderByInfo = RECORDSET_SBOBJ.getSimpleOrderByInfo(sqlObject);
    if (orderByInfo != null)
    {
      if (orderByInfo.column)
      {
        _SortColumn.pickValue(orderByInfo.column);
      }
      if (orderByInfo.direction)
      {
        _SortDirection.pickValue(orderByInfo.direction);
      }
    }
    else
    {
      updateUI("SortColumn", "onChange");
    }
  }
  else
  {
    updateUI("ColumnType", "onChange");
    updateUI("FilterColumn", "onChange");
    updateUI("SortColumn", "onChange");
  }

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
  if (control == "RecordsetName")
  {
  }
  else if (control == "ConnectionName")
  {
    _TableName.updateUI(_ConnectionName, event);
  }
  else if (control == "Define")
  {
    _ConnectionName.launchConnectionDialog();
  }
  else if (control == "TableName")
  {
    _ColumnList.updateUI(_TableName, event);
    _FilterColumn.updateUI(_TableName, event);
    _SortColumn.updateUI(_TableName, event);
    _ColumnType.pickValue("all");
  }
  else if (control == "ColumnType")
  {
    var value = _ColumnType.getValue();
    if (value == "all")
    {
      _ColumnList.setDisabled(true, true);
    }
    else
    {
      _ColumnList.setDisabled(false);
    }
  }
  else if (control == "FilterColumn")
  {
    if (_FilterColumn.getValue() == "")
    {
      _FilterOperator.setDisabled(true);
      _FilterParameter.setDisabled(true);
      _FilterParameterValue.setValue("");
      _FilterParameterValue.setDisabled(true);
    }
    else
    {
      _FilterOperator.setDisabled(false);
      _FilterParameter.setDisabled(false);
      _FilterParameterValue.setDisabled(false);
      _FilterParameterValue.setValue(_FilterColumn.getValue());
    }
  }
  else if (control == "SortColumn")
  {
    if (_SortColumn.getValue() == "")
    {
      _SortDirection.setDisabled(true);
    }
    else
    {
      _SortDirection.setDisabled(false);
    }
  }
  else
  {
    //alert("updateUI(" + control + ", " + event + ")");
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

  var sqlObject = new SQLStatement("");

  sqlObject.addFrom(_TableName.getValue());

  var colType = _ColumnType.getValue();
  if (colType != "all")
  {
    var columnNames = _ColumnList.getValues();
    for (var i=0; i < columnNames.length; i++)
    {
      sqlObject.addSelect(_TableName.getValue(), columnNames[i], true); // dont include table prefix
    }
  }

  var sqlParams = new Array();

  if (_FilterColumn.getValue() != "")
  {
    var paramInfo = dwscripts.getParameterCodeFromType(_FilterParameter.getValue(), 
                                                       _FilterParameterValue.getValue(),
                             "");

    // If there is no parameter, enter the filter parameter value directly to the
    //   where clause.
    if (paramInfo != null)
    {
      var paramName = dwscripts.getSQLStringForDBColumnType(SIMPLE_PARAM_NAME, _FilterColumn.getType());

      RECORDSET_SBOBJ.addSimpleWhere(sqlObject, _FilterColumn.getValue(), _FilterOperator.getValue(), paramName);

      var sqlParam = new Object();
      sqlParam.varName = SIMPLE_PARAM_NAME;
			//HACK
			//default values must be set from dwscriptsServerImpl.getParameterCodeFromType
			//but we cannot have access there for MySQL Server Model
      sqlParam.defaultValue = "-1";//paramInfo.defaultVal; 
      sqlParam.runtimeValue = paramInfo.runtimeVal;
      sqlParam.valuePrompt = _FilterParameter.getValue() + ": " + _FilterParameterValue.getValue();
  
      sqlParams.push(sqlParam);
    }
    else
    {
      var paramName = dwscripts.getSQLStringForDBColumnType(_FilterParameterValue.getValue(), _FilterColumn.getType());
      RECORDSET_SBOBJ.addSimpleWhere(sqlObject, _FilterColumn.getValue(), _FilterOperator.getValue(), paramName);      
    }
  }

  if (_SortColumn.getValue() != "")
  {
    sqlObject.addOrderBy(_TableName.getValue(), _SortColumn.getValue(), _SortDirection.getValue(), true);  // dont include table prefix
  }
  
  RECORDSET_SBOBJ.setDatabaseCall(sqlObject.getStatement(), sqlParams);
	
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
  var retVal = false;

  if (!sbRecordset)
  {
    retVal = true;
  }

  if (!retVal)
  {
    var sqlParams = new Array();
    var sqlString = sbRecordset.getDatabaseCall(sqlParams);

    if (!sqlString || (sqlString == ""))
    {
      retVal = true;
      return retVal;
    }
    
    var sqlObject = new SQLStatement(sqlString);

    // check for select statement
    if (sqlObject.getType() == SQLStatement.STMT_TYPE_SELECT)
    {
      // check that only one table is specified
      var tableNames = sqlObject.getTableNames();
      if (tableNames.length == 1)
      {
        // check that the table exists for the connection.
        var connName = sbRecordset.getConnectionName();
        var bTableExistsForConn = true;
        if (connName)
        {  
          bTableExistsForConn = false;
          
          var tableObjects = MMDB.getTables(connName);

          var viewObjects = MMDB.getViews(connName);
          for (var i=0; i < viewObjects.length; i++)
          {
            // make a view object look like a table object
            viewObjects[i].table = viewObjects[i].view;
            // add it to the list of table objects
            tableObjects.push(viewObjects[i]);
          }
          
          if (tableObjects.length > 0)
          {
            var tableNameCaps = tableNames[0].toUpperCase();
            for (var i=0; i < tableObjects.length; i++)
            {
              var tableObj = tableObjects[i];
      
              var schema = dwscripts.trim(tableObj.schema);
              if (schema.length == 0)
              {
                schema = dwscripts.trim(tableObj.catalog);
              }
              if (schema.length > 0)
              {
                schema += ".";
              }

              var connTableName = String(schema + tableObj.table).toUpperCase(); 
              if (connTableName.indexOf(tableNameCaps) != -1)
              {
                bTableExistsForConn = true;
                break;
              }
            }
          }
        }
        if (bTableExistsForConn)
        {
          // check that the columns are simple values
          var columns = sqlObject.getColumnNames();
          var bSimpleNames = true;
          for (var i=0; i < columns.length; i++)
          { 
            if (!sbRecordset.isSimpleColumnName(columns[i]))
            {
              bSimpleNames = false;
              break;
            }
        }
          if (bSimpleNames)
          {

            // check for no filter column, or filter is single param,
            // or filter is single entered value (no parameter).    
            var whereInfo = sbRecordset.getSimpleWhereInfo(sqlObject);

            if (   whereInfo != null 
                && (   (!whereInfo.rval && sqlParams.length == 0) 
                    || (sqlParams.length == 0)
                    || (   whereInfo.rval && sqlParams.length == 1 
                            && whereInfo.rval == sqlParams[0].varName
                      )
                  )
              )
            {
              // check for a single order by column
              var orderByInfo = sbRecordset.getSimpleOrderByInfo(sqlObject);

              if (orderByInfo != null)
              {
                // now check that the other clauses are empty
                if (!sqlObject.getHaving() && !sqlObject.getGroupBy())
                {
                  retVal = true;
                }
              }
            }
          }
        }
      }
    }
  }

  return retVal;
}


