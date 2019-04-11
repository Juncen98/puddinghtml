// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

    
//**********************GLOBAL VARS********************

var helpDoc = MM.HELP_soASPNetUpdateForm;
var SB_FILENAME = "ServerObject-UpdRecASPNet.htm";

// stores separate file dom needed for dynamic UI

var domUIPieces = dw.getDocumentDOM("ServerObject-FormEditHTML.htm"); 

var _ConnectionName = new ConnectionMenu(SB_FILENAME, "ConnectionName");
var _TableName = new ConnectionTableMenu(SB_FILENAME, "TableName");
var _RecordsetName  = new RecordsetMenu("UpdateRecord.htm", "RecordsetName", "");
var _ColumnNames = null;
var _ElemUp = null;
var _ElemDown = null;
var _ElemAdd = null;
var _ElemDel = null;
var _ElementLabel = null;
var _DisplayAs = null;
var _UseWebFormCtrl = new CheckBox(SB_FILENAME, "UseWebFormControl");
var _SubmitAs = null;
var _SuccessURL = new TextField(SB_FILENAME, "SuccessURL");
var _FailureURL = new TextField(SB_FILENAME, "FailureURL");
var _DebugInfo = new CheckBox(SB_FILENAME, "Debug");
var _UniqueKeyColumn = null;
var _UniqueKeySubmitAs = null;

var ColumnsToAdd = new Array();
var ColumnTypes = new Array();
var recordsetName = "";
var uniqueKeyColumnName = "";

//********************API FUNCTIONS******************************

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
  return new Array(MM.BTN_OK,     "clickedOK()", 
                   MM.BTN_Cancel, "clickedCancel()", 
                   MM.BTN_Help,   "displayHelp()"); 
}

//--------------------------------------------------------------------
// FUNCTION:
//   canInsertObject
//
// DESCRIPTION:
//   This function is called to determine if this object can be inserted
//   into the current document.  It displays the relevant error messages,
//   and then returns a boolean to indicate if insertion is possible.
//
//   NOTE: this function is called before initializeUI, so it should
//         not rely on internal state.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function canInsertObject()
{
  return true;
}

//********************LOCAL FUNCTIONS****************************** 

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
  var conn = _ConnectionName.getValue();
  var databaseType = MMDB.getDatabaseType(conn);
  var table = _TableName.getValue();
  var successURL = (_SuccessURL.getValue()) ? _SuccessURL.getValue() : "";
  var failureURL = (_FailureURL.getValue()) ? _FailureURL.getValue() : "";
  var debug = _DebugInfo.getCheckedState();
  var uniqueCol = _UniqueKeyColumn.getValue();

  recordsetName = _RecordsetName.getValue();

  var i;
  var currRowInfoObj;
  var fieldInfoObj;
  var sqlObj = new SQLStatement("");
  var columnInfoList = new Array();
  var ElementStrArr = new Array();
  var hiddenFieldNamesArr = new Array();
  var hiddenFieldValuesArr = new Array();
  var rowInfoArr = _ColumnNames.valueList;
  var nRows = rowInfoArr.length;

  // check for error conditions

  var errMsgStr = "";

  if (!conn)
  {
    errMsgStr = MM.MSG_NoDataSource;
  }
  else if (!table)
  {
    errMsgStr = MM.MSG_NoTablesInDS;
  }
  else if (!recordsetName)
  {
    errMsgStr = dwscripts.sprintf(MM.MSG_NoRecordsets, dwscripts.getRecordsetDisplayName());
  }
  else if (!nRows)
  {
    errMsgStr = MM.Msg_NoColumnsInTable;
  }   

  if (!errMsgStr) 
  {
	// check that the selected column exists in the recordset
    
	var colList = dwscripts.getFieldNames(recordsetName);
	var found = false;
    
	for (var j = 0; j < colList.length; j++)
    {
      if (colList[j].toLowerCase() == uniqueCol.toLowerCase())
	  {
	    found = true;
		break;
	  }
    }

    if (!found)
	{
	  errMsgStr = dwscripts.sprintf(MM.MSG_NoColumnInRS, dwscripts.getRecordsetDisplayName());
	}
  }

  // if error condition, alert it and return

  if (errMsgStr)
  {
    alert (errMsgStr);
    return;
  }
    
  // if no error conditions, build the edits to apply to the document

  MM.setBusyCursor();

  // create parameter object used to provide variables for this edit op
  // server behavior

  var paramObj = new Object(); 

  paramObj.TableAlign   = "center";

  // Get a unique form name...

  var formName = dwscripts.getUniqueNameForTag("FORM", "form");

  paramObj.FormName = formName;
  paramObj.Language = dw.getDocumentDOM().serverModel.getServerLanguage();

  var addedPrimary = false;
    
  for (i = 0; i < nRows; i++)
  {
    currRowInfoObj = rowInfoArr[i];
    
	  fieldInfoObj = currRowInfoObj.displayAs; 
    fieldInfoObj.fieldName = currRowInfoObj.fieldName;

    var columnName = currRowInfoObj.column;

    if (columnName)
    {
      var columnInfoNode = dwscripts.getColumnValueNode();
	        
	  columnInfoNode.setColumnName(columnName);
      columnInfoNode.setColumnType(fieldInfoObj.type);
      columnInfoNode.setVariableName(fieldInfoObj.fieldName);
      columnInfoNode.setRuntimeValue((databaseType.toLowerCase() == "oledb") ? "?" : ("@" + columnName));

      // Check if this field is the unique primary key field
	  // if so push another node for the primary key...

      if (columnName == uniqueCol)
      {
        addedPrimary = true;

        columnInfoNode.setIsPrimaryKey(true);
		columnInfoNode.setSubmitAs(_UniqueKeySubmitAs.getValue());
                                                                
        // push the Primary Key column into the hidden field
		// array if it's not already slated for that

        if (fieldInfoObj.type != "hiddenField")
		{
		  hiddenFieldNamesArr.push(fieldInfoObj.fieldName);
          hiddenFieldValuesArr.push(fieldInfoObj.text);
		}                                                                   
      }
      else
      {      
        columnInfoNode.setSubmitAs(currRowInfoObj.submitAs);                  
      }    

	  columnInfoList.push(columnInfoNode);
    }
        
    // handle the hidden fields

    if (fieldInfoObj.type == "hiddenField")
    {
      hiddenFieldNamesArr.push(fieldInfoObj.fieldName);
      hiddenFieldValuesArr.push(fieldInfoObj.value);
    }  
  }
  
  // Also push the Update hidden field into the array...
  
  hiddenFieldNamesArr.push("MM_update");
  hiddenFieldValuesArr.push(formName);
  
  // Handle the primary key if not already done

  if (!addedPrimary)
  {
    columnInfoNode = dwscripts.getColumnValueNode();
    
    var uniqueColFieldName = getElementNameFromColumnName(uniqueCol);
	
	columnInfoNode.setColumnName(uniqueCol);
    columnInfoNode.setColumnType("");
    columnInfoNode.setVariableName(uniqueColFieldName);                  
    columnInfoNode.setIsPrimaryKey(true);
    columnInfoNode.setSubmitAs(_UniqueKeySubmitAs.getValue());
    columnInfoNode.setRuntimeValue((databaseType.toLowerCase() == "oledb") ? "?" : ("@" + uniqueCol));

    columnInfoList.push(columnInfoNode);
    
    // push the Primary Key column hidden field into the hidden field array                                                                
	hiddenFieldNamesArr.push(uniqueColFieldName);
    hiddenFieldValuesArr.push(createDynamicData(recordsetName, uniqueCol));       
  }

  paramObj.HiddenFieldName = hiddenFieldNamesArr;
  paramObj.HiddenFieldValue = hiddenFieldValuesArr;
  
  // Parameters need to be in the same order as they
  // are referenced in the sql. For an update statement,
  // the primary keys are at the end. So, put them last.

  columnInfoList.sort(sortByPrimaryKeyCB);

  // this will go through all the form elements and returns a string array...
  
  ElementStrArr = createFormElementStrings(rowInfoArr);
  
  paramObj.ElementString = ElementStrArr;
  paramObj.ButtonText = MM.BTN_UpdateRecord;
  //paramObj.ConnectionPath = dwscripts.getConnectionURL(conn);
	paramObj.UrlFormat = getConnectionsUrlFormat(dw.getDocumentDOM());
	var bIsSiteRelative = false;
	if (paramObj.UrlFormat == "virtual")
	{
	  bIsSiteRelative=true;
	}
  paramObj.ConnectionPath = dwscripts.getConnectionURL(conn,bIsSiteRelative);


  sqlObj.createUpdateStatement(table, columnInfoList);    
  
  paramObj.FormName = formName;
  paramObj.CommandText = dwscripts.escSQLQuotes(sqlObj.getStatement(true));
  paramObj.ConnectionName = conn;  
  paramObj.SuccessURL = SBDatabaseCallASPNET.transformURL(successURL, true);
  paramObj.FailureURL = SBDatabaseCallASPNET.transformURL(failureURL, true);
  paramObj.Debug = debug;
   
  // Parmeters
  
  var paramNames = new Array();
  var paramRuntimes = new Array(); 
  var paramTypes = new Array(); 
 
  for (var z = 0; z < columnInfoList.length; ++z)
  {
    if (columnInfoList[z].getVariableName())
    {
      var columnName = columnInfoList[z].getColumnName();
      var paramName = ("@" + columnName);
      var defaultValue = (columnInfoList[z].getDefaultValue() != "") ? 
                          columnInfoList[z].getDefaultValue() : "\"\"";
  	  var submitAs = columnInfoList[z].getSubmitAs();
	  var runtime = dwscripts.getParameterCodeFromType(MM.LABEL_ASPNET_Param_Types[1],
    												   columnInfoList[z].getVariableName(),
  												       defaultValue,
													   submitAs);

      paramNames.push(paramName);
	  paramRuntimes.push(runtime);     
      paramTypes.push(submitAs);
    }
  }
  
  paramObj.SqlVarName = paramNames;
  paramObj.SqlVarRuntime = paramRuntimes;
  paramObj.SqlVarType = paramTypes;
  
  // correct the selection
  checkThatCursorIsNotInsideOfAForm();
  dwscripts.setCursorOutsideParagraph();
  dwscripts.fixUpSelection(dw.getDocumentDOM(), false, true);
  
  dwscripts.applyGroup("RecordUpdateForm", paramObj);

  MM.clearBusyCursor();
  window.close();
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
  MM.commandReturnValue = "";
  window.close();
}

//--------------------------------------------------------------------
// FUNCTION:
//   displayHelp
//
// DESCRIPTION:
//   Displays the built-in Dreamweaver help.
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

//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//   This function is called in the onLoad event.  It is responsible
//   for initializing the UI.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function initializeUI()
{ 
  // define global form elements

  _DisplayAs = new ListControl("DisplayAs");
  _SubmitAs = new ListControl("SubmitAs");
  _ElementLabel = dwscripts.findDOMObject("ElementLabel");
  _UniqueKeyColumn = new ListControl("UniqueKeyColumn");
  _UniqueKeySubmitAs = new ListControl("UniqueKeySubmitAs");
  _ColumnNames = new TreeControlWithNavControls("ColumnNames");
  _ElemUp = dwscripts.findDOMObject("elemUp");
  _ElemDown = dwscripts.findDOMObject("elemDown");
  _ElemAdd = dwscripts.findDOMObject("elemAdd");
  _ElemDel = dwscripts.findDOMObject("elemDel");
  _SuccessURL.initializeUI();
  _FailureURL.initializeUI();
  _DebugInfo.initializeUI();  
  _DebugInfo.setCheckedState(true);
  _UseWebFormCtrl.initializeUI();

  // initialize the form elements

  var setConnectionSuccess = _ConnectionName.initializeUI();
  
  if (!setConnectionSuccess)
  {
    clickedCancel(); 
  }   

  _RecordsetName.initializeUI();
  _TableName.initializeUI();
  _ColumnNames.setColumnNames(MM.LABEL_ColGrid);
  
  var displayAsArr = new Array(TEXTFIELD,
                               TEXTAREA,
							   MENU,
							   HIDDENFIELD,
							   CHECKBOX,
							   RADIOGROUP,
							   PASSWORDFIELD,
							   STATICTEXT);
  
  _DisplayAs.setAll(displayAsArr, displayAsArr);
  
  recordsetName = _RecordsetName.getValue();

  updateUI("Debug");

  elts = document.forms[0].elements;
  if (elts && elts.length)
  {
    elts[0].focus();
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
    var databaseType = MMDB.getDatabaseType(_ConnectionName.getValue());
    var theTypes = SBDatabaseCallASPNET.getParamTypeList(databaseType);
  
    _UniqueKeySubmitAs.setAll(theTypes, theTypes);
    _SubmitAs.setAll(theTypes, theTypes);

    _TableName.updateUI(_ConnectionName, event); // this will trigger a recursive call to this function
  }
  else if (control == "Define")
  {
    _ConnectionName.launchConnectionDialog();
  }  
  else if (control == "TableName")
  {
    // clear additional column list
    // it lists columns that don't get populated in the grid, and needs to be cleared
    
	updateAdditionalColumnList('clear'); 

    // populate grid
    
	populateColumnGrid();
    
    // clear global field names array (used to check for dupe field names)
    
	STR_ELEMENT_NAMES = STR_DIVIDER;
    
    // populate UI according to first grid item
    
	displayGridFieldValues();

	// populate uniqueKey control

    var colArr = new Array();
	var uniqueKeyCol = null;

	for (i in ColumnTypes)
    {
      colArr.push(i);
    }
    
    if (colArr.length > 0)
    {
	  _UniqueKeyColumn.setAll(colArr, colArr);
    }
	else
    {
	  _UniqueKeyColumn.setAll(new Array(MM.LABEL_NoColumns), new Array()); 
    }
	
	if (uniqueKeyColumnName)
	{
	  _UniqueKeyColumn.pickValue(uniqueKeyColumnName);
	}

	updateUI("UniqueKeyColumn");
  }
  else if (control == "RecordsetName")
  {
    if (event == 'onChange')
    {
      if (recordsetName != "")
      {
        populateColumnGrid(); 
        checkForUnsupportedColumnTypes(false);         
        updateDefaultFormFieldValues(recordsetName, _RecordsetName.getValue());
        displayGridFieldValues();
        
		recordsetName = _RecordsetName.getValue();
      }
    }
  }
  else if (control == "UniqueKeyColumn")
  {        
    var column = _UniqueKeyColumn.get();
    
    // populate the column grid again after the
	// unique key column is selected
    
	populateColumnGrid();
    
    checkForUnsupportedColumnTypes(false);
    
    // refresh the grid field values
    
	displayGridFieldValues();
        
    if (ColumnTypes[column] != null) 
    {
	  var connectionName = _ConnectionName.getValue();
	  var databaseType = MMDB.getDatabaseType(connectionName);

      _UniqueKeySubmitAs.pickValue(dwscripts.getDBColumnTypeAsString(ColumnTypes[column], databaseType));
    }
  }
  else if (control == "AddRow")
  {
    addGridRow();
  }
  else if (control == "DeleteRow")
  {
    deleteGridRow();
  }
  else if (control == "MoveRowUp")
  {
    _ColumnNames.moveRowUp();
  }
  else if (control == "MoveRowDown")
  {
    _ColumnNames.moveRowDown();
  }
  else if (control == "ColumnNames")
  {
    displayGridFieldValues();
  }
  else if (control == "ElementLabel")
  {
    updateGridRow('label');
  }
  else if (control == "SubmitAs")
  {
    updateGridRow('submitAs');
  }
  else if (control == "DisplayAs")
  {
    showDifferentParams(true);
    updateGridRow('displayAs')
  }
  else if (control == "UseWebFormControl")
  {
    updateGridRow('useWebFormControl');
  }
  else if (control == "SuccessURL")
  {
    var theSuccessURL = dw.browseForFileURL("select", MM.LABEL_FileRedirect,0,0); 
    
    if (theSuccessURL.length > 0)
    {
      _SuccessURL.setValue(theSuccessURL); 
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
}