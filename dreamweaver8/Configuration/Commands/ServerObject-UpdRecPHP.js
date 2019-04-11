// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

    
//**********************GLOBAL VARS********************

var helpDoc = MM.HELP_objUpdateRecord;

var rsName = "";

// stores separate file dom needed for dynamic UI
var domUIPieces = dw.getDocumentDOM("ServerObject-FormEditHTML.htm"); 


// global form widget variables
var _DisplayAs, _SubmitAs, _ElemUp, _ElemDown, _ElemAdd, _ElemDel;
var _GoToURL, _ElementLabel;

var _ConnectionName = new ConnectionMenu("ServerObject-UpdRecPHP.htm", "ConnectionName"); 
var _TableName = new ConnectionTableMenu("ServerObject-UpdRecPHP.htm", "TableName");
var _RecordsetName  = new RecordsetMenu("", "RecordsetName", "");
var _ColumnNames = new TreeControlWithNavControls("ColumnNames");
var _UniqueKeyColumn = new ListControl("UniqueKeyColumn");
var _IsNumeric = new CheckBox("", "IsNumeric"); 


var ColumnsToAdd = new Array();  // the list of columns available for adding
var ColumnTypes = new Array();

// stores the unique key column's SubmitAs
// TODO: the submitAs types are platform specific
var SUBMIT_AS_NUMERIC_KEY = "none,0,null";
var SUBMIT_AS_TEXT_KEY = "',none,none";   

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
  var retVal = true;

  var errMsgStr = "";
  if (dwscripts.getRecordsetNames().length == 0) 
  { 
    errMsgStr = MM.MSG_NeedRecordsetForObject;
  }

  if (errMsgStr)
  {
    alert (errMsgStr);
    retVal = false;
  }

  return retVal;
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
  var table = _TableName.getValue();
  var redirectURL   = (_GoToURL.value)?_GoToURL.value:"";
  var nRows, i, currRowInfoObj, fieldInfoObj;  
  var sqlObj = new SQLStatement("");
  var columnInfoList = new Array(), columnInfoNode, ElementStrArr = new Array();
  var hiddenFieldNamesArr = new Array(), hiddenFieldValuesArr = new Array();
  
  rs  = _RecordsetName.getValue();
  col = _UniqueKeyColumn.getValue();
  rowInfoArr = _ColumnNames.valueList;
  nRows = rowInfoArr.length;
    
  // check for error conditions
  var errMsgStr = "";
  if (!conn) 
  {
    errMsgStr = MM.MSG_NoConnection;
  } 
  else if (!table) 
  {
    errMsgStr = MM.MSG_NoTables;
  }
  else if (!nRows)
  {
    errMsgStr = MM.Msg_NoColumnsInTable;
  } 
  else if (!rs)
  {
    errMsgStr = MM.MSG_NoRecordset;
  }
  else if (!col) 
  {
    errMsgStr = MM.MSG_NoColumn;
  }
  
  if (!errMsgStr) 
  {
    var colList = dwscripts.getFieldNames(rs);
    // check that the selected column exists in the recordset
    var j, found=true;
    for (j=0, found=false; !found && j < colList.length; j++)
    {
      found = (colList[j].toLowerCase() == col.toLowerCase());
    }  
    if (!found) errMsgStr = dwscripts.sprintf(MM.MSG_NoColumnInRS, dwscripts.getRecordsetDisplayName());
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
  var formName = dwscripts.getUniqueNameForTag("FORM","form");
  paramObj.FormName = formName; 
  
  var addedPrimary = false;
  
  for (i = 0; i < nRows; i++)
  {
    currRowInfoObj = rowInfoArr[i];
    fieldInfoObj = currRowInfoObj.displayAs; 
    fieldInfoObj.fieldName = currRowInfoObj.fieldName;
    var columnName = currRowInfoObj.column;
    
    if (columnName)
    {
      columnInfoNode = dwscripts.getColumnValueNode(); // get platform specific ColumnValueNode
      columnInfoNode.setColumnName(columnName);    
      columnInfoNode.setColumnType(fieldInfoObj.type);      
      columnInfoNode.setVariableName(getVarNameFromFormField(fieldInfoObj.fieldName));                  
   
      // Check if this field is the unique primary key field, if so
      // push another node for the primary key...
      if (columnName == col)
      {
        addedPrimary = true;
        columnInfoNode.setIsPrimaryKey(true);
        // Select between submit as strings for a text primary key or numeric primary key.
        columnInfoNode.setSubmitAs(_IsNumeric.getCheckedState() ? SUBMIT_AS_NUMERIC_KEY 
                                                                : SUBMIT_AS_TEXT_KEY);
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
  
  // Also push the Update and Primary Key column hidden fields into the array...
  hiddenFieldNamesArr.push("MM_update");
  hiddenFieldValuesArr.push(formName);
  
  // TODO: the following code is platform specific, how can we remove this?
  hiddenFieldNamesArr.push(col);
  var primaryKeyValue = "<?php echo $row_" + rs + "['" + col + "']; ?>";
  hiddenFieldValuesArr.push(primaryKeyValue);
  
  if (!addedPrimary)
  {
    // add primary key columnInfoNode
    columnInfoNode = dwscripts.getColumnValueNode(); // get platform specific ColumnValueNode
    columnInfoNode.setColumnName(col);
    columnInfoNode.setColumnType("");
    columnInfoNode.setVariableName(getVarNameFromFormField(col));                  
    columnInfoNode.setIsPrimaryKey(true);
    // Select between submit as strings for a text primary key or numeric primary key.
    columnInfoNode.setSubmitAs(_IsNumeric.getCheckedState() ? SUBMIT_AS_NUMERIC_KEY 
                                                            : SUBMIT_AS_TEXT_KEY);
    columnInfoList.push(columnInfoNode);
  }
  
  paramObj.HiddenFieldName = hiddenFieldNamesArr;
  paramObj.HiddenFieldValue = hiddenFieldValuesArr;
    
  // this will go through all the form elements and returns a string array...
  ElementStrArr = createFormElementStrings(rowInfoArr);
  
  paramObj.ElementString = ElementStrArr;
  paramObj.ButtonText = MM.BTN_UpdateRecord;
  
  paramObj.Redirect_url = redirectURL;
  paramObj.ConnectionName = conn;
  //paramObj.COnnectionPath = dwscripts.getConnectionURL(conn);
	var bIsSiteRelative = false;
	var urlFormat = getConnectionsUrlFormat(dw.getDocumentDOM());
	if (urlFormat == "virtual")
	{
	  bIsSiteRelative=true;
	}
  paramObj.ConnectionPath = dwscripts.getConnectionURL(conn,bIsSiteRelative);
	if (urlFormat == "file")
	{
		urlFormat = "require_once";
	}	
	paramObj.UrlFormat = urlFormat;	

  
  paramObj.RecordsetName = rs;
  paramObj.PrimaryKeyColumn = col; 
 
  var sqlVarList = sqlObj.createUpdateStatement(table, columnInfoList);    
  var sqlString = sqlObj.getStatement(true);  // strip line breaks
  paramObj.SQLStatement = sqlString;
  paramObj.SQLVariableList = sqlVarList.join(",\n                       ");
  
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
function clickedCancel(){
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
  // Replace the following call if you are modifying this file for your own use.
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
  _DisplayAs = new ListControl("DisplayAs");
  _SubmitAs = new ListControl("SubmitAs");
  _GoToURL  = dwscripts.findDOMObject("GoToURL");
  _ElementLabel    = dwscripts.findDOMObject("ElementLabel");
  _ElemUp = dwscripts.findDOMObject("elemUp");
  _ElemDown = dwscripts.findDOMObject("elemDown");
  _ElemAdd = dwscripts.findDOMObject("elemAdd");
  _ElemDel = dwscripts.findDOMObject("elemDel");
     
  // initialize the form elements
  _ConnectionName.initializeUI();
  
  _IsNumeric.initializeUI(); 
 
   // populate menus
   var displayAsArr = new Array(TEXTFIELD,TEXTAREA,MENU,HIDDENFIELD,CHECKBOX,RADIOGROUP,PASSWORDFIELD,STATICTEXT);
   _DisplayAs.setAll(displayAsArr,displayAsArr);
   
   _SubmitAs.init();  // get the values from the HTML
   
  _RecordsetName.initializeUI();
  _TableName.initializeUI();   

  rsName = _RecordsetName.getValue();
  
  _ColumnNames.setColumnNames(MM.LABEL_ColGrid);
  
  //EnableDisableUpDownBtns();
  //EnableDisableAddDelBtns();    

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
   _TableName.updateUI(_ConnectionName, event); // this will trigger a recursive call to this function
  }
  else if (control == "TableName")
  {
    var i, colArr = new Array(), EMPTY_LIST = new Array();
    // clear additional column list
    // it lists columns that don't get populated in the grid, and needs to be cleared
    updateAdditionalColumnList('clear'); 

    // populate grid
    populateColumnGrid();
    
    checkForUnsupportedColumnTypes(true);
    
    // clear global field names array (used to check for dupe field names)
    STR_ELEMENT_NAMES = STR_DIVIDER;
    
    // populate UI according to first grid item
    displayGridFieldValues();

    // populate uniqueID menu
    for (i in ColumnTypes)
    {
      colArr.push(i);
    }
    
    if (colArr.length > 0)
      _UniqueKeyColumn.setAll(colArr, colArr);
    else
      _UniqueKeyColumn.setAll(new Array(MM.LABEL_NoColumns), EMPTY_LIST); 
    updateUI("UniqueKeyColumn");
  }
  else if (control == "RecordsetName")
  {
    if(event == 'onChange')
    {
      if (rsName != "")
      {
        // populate grid
        populateColumnGrid(); 
        checkForUnsupportedColumnTypes(false);         
        updateDefaultFormFieldValues(rsName, _RecordsetName.getValue());
        displayGridFieldValues();
        rsName = _RecordsetName.getValue();
      }
    }
  }
  else if (control == "UniqueKeyColumn")
  {        
    // check for checking numeric box here
    var column = _UniqueKeyColumn.get();
    
    // populate the column grid again after the unique key column is selected
    populateColumnGrid();
    
    checkForUnsupportedColumnTypes(false);
    
    // refresh the grid field values
    displayGridFieldValues();
        
    if (ColumnTypes[column] != null) 
    {
      if (dwscripts.isNumericDBColumnType(ColumnTypes[column])) {
        _IsNumeric.setCheckedState(true);
      } else {
        _IsNumeric.setCheckedState(false);
      }
    }
  }
  else if (control == "AddRow")
  {
    addGridRow();
    //EnableDisableUpDownBtns();
    //EnableDisableAddDelBtns();    
  }
  else if (control == "DeleteRow")
  {
    deleteGridRow();
    //EnableDisableUpDownBtns();
    //EnableDisableAddDelBtns();    
  }
  else if (control == "MoveRowUp")
  {
    _ColumnNames.moveRowUp();
    //EnableDisableUpDownBtns();
  }
  else if (control == "MoveRowDown")
  {
    _ColumnNames.moveRowDown();
    //EnableDisableUpDownBtns();
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

    var newSubmitType = getSubmitTypeBasedOnElementType
      (_SubmitAs.getValue(),_DisplayAs.get(),ColumnTypes[ _ColumnNames.getRowValue().column ]);
    _SubmitAs.pickValue(newSubmitType);

    updateGridRow('displayAs')
  }  
  else if (control == "GoToURL")
  {
    var theRedirect_url = dw.browseForFileURL("select", MM.LABEL_FileRedirect,0,0); 
    
    if (theRedirect_url.length > 0)
    {
      // convert any script blocks to concat values
      theRedirect_url = theRedirect_url.replace(/<\?php\s+(?:echo\s+)?/gi, "\" . ");
      theRedirect_url = theRedirect_url.replace(/;?\s*\?>/gi, " . \"");
      
      _GoToURL.value = theRedirect_url;
    }
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   getVarNameFromFormField
//
// DESCRIPTION:
//   Prepare the php columnValueNode variable name based on form field name.
//
// ARGUMENTS:
//   value - formFieldName
//
// RETURNS:
//   string - php columnValueNode variable name
//--------------------------------------------------------------------
function getVarNameFromFormField(value)
{
  var varName = "";
  if (value)
  {
    var paramInfo = dwscripts.getParameterCodeFromType(MM.LABEL_PHP_Param_Types[1], value);
    varName = ((paramInfo) ? paramInfo.nameVal : "");
  }
  return varName;
}