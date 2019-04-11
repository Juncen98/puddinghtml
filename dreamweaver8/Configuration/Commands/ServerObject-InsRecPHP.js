// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

    
//**********************GLOBAL VARS********************

var helpDoc = MM.HELP_objInsertRecord;

// stores separate file dom needed for dynamic UI
var domUIPieces = dw.getDocumentDOM("ServerObject-FormEditHTML.htm"); 

// global form widget variables
var _DisplayAs, _SubmitAs, _ElemUp, _ElemDown, _ElemAdd, _ElemDel;
var _GoToURL, _ElementLabel, _ColumnNames;

var _ConnectionName = new ConnectionMenu("ServerObject-InsRecPHP.htm", "ConnectionName"); 
var _TableName = new ConnectionTableMenu("ServerObject-InsRecPHP.htm", "TableName");

var ColumnsToAdd = new Array();  // the list of columns available for adding
var ColumnTypes = new Array();

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
    
  for (i = 0; i < nRows; i++)
  {
    currRowInfoObj = rowInfoArr[i];
    fieldInfoObj = currRowInfoObj.displayAs; 
    var columnName = currRowInfoObj.column;
    fieldInfoObj.fieldName = currRowInfoObj.fieldName;
    if (currRowInfoObj.submitAs && columnName)
    {
      columnInfoNode = dwscripts.getColumnValueNode(); // get platform specific ColumnValueNode
      columnInfoNode.setColumnName(columnName);
      columnInfoNode.setColumnType(fieldInfoObj.type);
      columnInfoNode.setVariableName(getVarNameFromFormField(fieldInfoObj.fieldName));
      columnInfoNode.setSubmitAs(currRowInfoObj.submitAs);
      columnInfoList.push(columnInfoNode);
    }
        
    // handle the hidden fields
    if (fieldInfoObj.type == "hiddenField")
    {
      hiddenFieldNamesArr.push(fieldInfoObj.fieldName);
      hiddenFieldValuesArr.push(fieldInfoObj.value);
    }  
  }
  
  // Also push the Insert hidden field into the array...
  hiddenFieldNamesArr.push("MM_insert");
  hiddenFieldValuesArr.push(formName);
  
  paramObj.HiddenFieldName = hiddenFieldNamesArr;
  paramObj.HiddenFieldValue = hiddenFieldValuesArr;
  
  // this will go through all the form elements and returns a string array...
  ElementStrArr = createFormElementStrings(rowInfoArr);
  
  paramObj.ElementString = ElementStrArr;
  paramObj.ButtonText = MM.BTN_InsertRecord;
  
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

   
  var sqlVarList = sqlObj.createInsertStatement(table, columnInfoList);    
  var sqlString = sqlObj.getStatement(true);
  paramObj.SQLStatement = sqlString;
  paramObj.SQLVariableList = sqlVarList.join(",\n                       ");

  // correct the selection
  checkThatCursorIsNotInsideOfAForm();
  dwscripts.setCursorOutsideParagraph();
  dwscripts.fixUpSelection(dw.getDocumentDOM(), false, true);
  
  dwscripts.applyGroup("RecordInsertForm", paramObj);

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
  // define global form elements
  _DisplayAs = new ListControl("DisplayAs");
  _SubmitAs = new ListControl("SubmitAs");
  _GoToURL  = dwscripts.findDOMObject("GoToURL");
  _ElementLabel    = dwscripts.findDOMObject("ElementLabel");
  _ColumnNames = new TreeControlWithNavControls("ColumnNames");
  _ElemUp = dwscripts.findDOMObject("elemUp");
  _ElemDown = dwscripts.findDOMObject("elemDown");
  _ElemAdd = dwscripts.findDOMObject("elemAdd");
  _ElemDel = dwscripts.findDOMObject("elemDel");
  
  
  // initialize the form elements
  _ConnectionName.initializeUI();
  _TableName.initializeUI();

  _ColumnNames.setColumnNames(MM.LABEL_ColGrid);

  //EnableDisableUpDownBtns();
  //EnableDisableAddDelBtns();
  
  var displayAsArr = new Array(TEXTFIELD,TEXTAREA,MENU,HIDDENFIELD,CHECKBOX,RADIOGROUP,PASSWORDFIELD,STATICTEXT);
  _DisplayAs.setAll(displayAsArr,displayAsArr);
  
  _SubmitAs.init();  // get the values from the HTML

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
    // clear additional column list
    // it lists columns that don't get populated in the grid, and needs to be cleared
    updateAdditionalColumnList('clear'); 

    // populate grid
    populateColumnGrid();
    
    // clear global field names array (used to check for dupe field names)
    STR_ELEMENT_NAMES = STR_DIVIDER;
    
    // populate UI according to first grid item
    displayGridFieldValues();
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
