// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

    
//**********************GLOBAL VARS********************

var helpDoc = MM.HELP_objUpdateRecord;

var rsName = "";

// stores separate file dom needed for dynamic UI
var domUIPieces = dw.getDocumentDOM("ServerObject-FormEditHTML.htm"); 


// global form widget variables
var _DisplayAs, _SubmitAs, _ElemUp, _ElemDown, _ElemAdd, _ElemDel;
var _GoToURL, _ElementLabel;

var _ConnectionName = new CFDataSourceMenu("ServerObject-UpdateRecord.htm", "ConnectionName"); 
var _UserName = new TextField("ServerObject-UpdateRecord.htm", "UserName");
var _Password = new TextField("ServerObject-UpdateRecord.htm", "Password");
var _TableName = new ConnectionTableMenu("ServerObject-UpdateRecord.htm", "TableName");
var _RecordsetName  = new RecordsetMenu("UpdateRecord.htm", "RecordsetName", "");
var _ColumnNames = new TreeControlWithNavControls("ColumnNames");
var _UniqueKeyColumn = new ListControl("UniqueKeyColumn");
var _IsNumeric = new CheckBox("", "IsNumeric"); 

var _includeQuery = null;

var ColumnsToAdd = new Array();  // the list of columns available for adding
var ColumnTypes = new Array();

// stores the unique key column's SubmitAs
// TODO: the submitAs types are platform specific
var SUBMIT_AS_NUMERIC_KEY = "none,none,NULL";
var SUBMIT_AS_TEXT_KEY = "',none,NULL";   

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
    errMsgStr = dwscripts.sprintf(MM.MSG_NeedRecordsetForObject, dwscripts.getRecordsetDisplayName());
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
  if (!_ConnectionName.getValue()) 
  {
    errMsgStr = MM.MSG_NoCFDataSource;
  } 
  else if (!table) 
  {
    errMsgStr = MM.MSG_NoTablesInDS;
  }
  else if (!nRows)
  {
    errMsgStr = MM.Msg_NoColumnsInTable;
  } 
  else if (!rs)
  {
    alert(dwscripts.sprintf(MM.MSG_NoRecordsets, dwscripts.getRecordsetDisplayName()));
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
      // TODO: The 'Form.' prefix is platform specific, how can we remove this?
      columnInfoNode.setVariableName("FORM." + fieldInfoObj.fieldName);                  
   
      // Check if this field is the unique primary key field, if so
      // push another node for the primary key...
      if (columnName == col)
      {
        addedPrimary = true;
        columnInfoNode.setIsPrimaryKey(true);
        // Select between submit as strings for a text primary key or numeric primary key.
        columnInfoNode.setSubmitAs(_IsNumeric.getCheckedState() ? SUBMIT_AS_NUMERIC_KEY 
                                                                : SUBMIT_AS_TEXT_KEY);
                                                                
        // push the Primary Key column hidden field into the hidden field array                                                                
        hiddenFieldNamesArr.push(fieldInfoObj.fieldName);
        hiddenFieldValuesArr.push(fieldInfoObj.text);                                                                   
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
  
  // Push the Update hidden field into the array...
  hiddenFieldNamesArr.push("MM_UpdateRecord");
  hiddenFieldValuesArr.push(formName);
  
  // TODO: the following code is platform specific, how can we remove this?
//  hiddenFieldNamesArr.push(col);
//  var primaryKeyValue = "<cfoutput>" + "#" + rs + "." + col + "#" + "</cfoutput>";
//  hiddenFieldValuesArr.push(primaryKeyValue);
  
  if (!addedPrimary)
  {
    // add primary key columnInfoNode
    var keyFieldName = getElementNameFromColumnName(col);
    columnInfoNode = dwscripts.getColumnValueNode(); // get platform specific ColumnValueNode
    columnInfoNode.setColumnName(col);
    columnInfoNode.setColumnType("");
    columnInfoNode.setVariableName("FORM." + keyFieldName);                  
    columnInfoNode.setIsPrimaryKey(true);
    // Select between submit as strings for a text primary key or numeric primary key.
    columnInfoNode.setSubmitAs(_IsNumeric.getCheckedState() ? SUBMIT_AS_NUMERIC_KEY 
                                                            : SUBMIT_AS_TEXT_KEY);
    columnInfoList.push(columnInfoNode);
    
    // push the Primary Key column hidden field into the hidden field array                                                                
    hiddenFieldNamesArr.push(keyFieldName);
    hiddenFieldValuesArr.push(createDynamicData(rs, col));       
  }
  
  paramObj.HiddenFieldName = hiddenFieldNamesArr;
  paramObj.HiddenFieldValue = hiddenFieldValuesArr;
    
  // this will go through all the form elements and returns a string array...
  ElementStrArr = createFormElementStrings(rowInfoArr);
  
  paramObj.ElementString = ElementStrArr;
  paramObj.ButtonText = MM.BTN_UpdateRecord;
  
  paramObj.RedirectURL = redirectURL;
  paramObj.ActionQueryString = (_includeQuery.checked) ? "?#CGI.QUERY_STRING#" : "";
  
  paramObj.ConnectionName = _ConnectionName.getName();
  paramObj.UserName = _UserName.getValue();
  paramObj.Password = _Password.getValue();
  
  paramObj.RecordsetName = rs;
  paramObj.PrimaryKeyColumn = col; 
 
  sqlObj.createUpdateStatement(table, columnInfoList);    
  var sqlString = sqlObj.getStatement();
  paramObj.SQLStatement = sqlString;
  
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
     
  _includeQuery = dwscripts.findDOMObject("includeQuery");
  
  // initialize the form elements
  var setConnectionSuccess = true;  // return value from connectionmenu's initializeUI() 
  setConnectionSuccess = _ConnectionName.initializeUI();
  
  _IsNumeric.initializeUI(); 
 
   // populate menus
   var displayAsArr = new Array(TEXTFIELD,TEXTAREA,MENU,HIDDENFIELD,CHECKBOX,RADIOGROUP,PASSWORDFIELD,STATICTEXT);
   _DisplayAs.setAll(displayAsArr,displayAsArr);
   
   _SubmitAs.init();  // get the values from the HTML
   
  _RecordsetName.initializeUI();
  _UserName.initializeUI();
  _Password.initializeUI();
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
   // check the connection, and get a username and password if needed
   _ConnectionName.ensureLogin();

   if (event == "onChange")
   {
     // set the username and password for this data source
     _UserName.setValue(_ConnectionName.getUsername());
     _Password.setValue(_ConnectionName.getPassword());
   }

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
    if (event == "onClick")
    {
      var theRedirectURL = dw.browseForFileURL("select", MM.LABEL_FileRedirect,0,0); 

      if (theRedirectURL.length > 0)
      {
        theRedirectURL = dwscripts.stripCFOutputTags(theRedirectURL);

        _GoToURL.value = theRedirectURL; 
        _GoToURL.focus();

        _includeQuery.checked = hasQueryString(theRedirectURL);
      } 
    }
    else if (event == "onBlur")
    {
      _includeQuery.checked = hasQueryString(_GoToURL.value);
    }
  }
  else if (control == "includeQuery")
  {
    var redirectURL = getRedirectURL(_GoToURL.value, _includeQuery.checked);
    
    _GoToURL.value = redirectURL;
  }

}
