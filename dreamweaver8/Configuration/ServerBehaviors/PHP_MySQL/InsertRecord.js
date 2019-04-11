// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

var HELP_DOC = MM.HELP_sbPHPInsertRecord;

var SB_NAME = dwscripts.getSBFileName();

var _FormName = new TagMenu(SB_NAME, "form__tag", "form"); 
var _ConnectionName = new ConnectionMenu("Recordset.htm", "ConnectionName");
var _TableName = new ConnectionTableMenu(SB_NAME, "TableName");

var _ColumnList = null;
var _SubmittedValueList = new FormFieldsMenu(SB_NAME, "SubmittedValueList", true,
                                             FormFieldsMenu.LABELS_MASK_FORMREF,
                                             [{prop: "type", value: "submit"}, 
                                              {prop: "type", value: "reset"},
                                              {prop: "name", value: "MM_insert"},
                                              {prop: "name", value: "MM_delete"},
                                              {prop: "name", value: "MM_update"}]);
var _FieldColFormat = null;

var _Redirect_url = new TextField(SB_NAME, "Redirect_url");

// Array constants to hold field format values and labels from the _FieldColFormat 
//   control.
var FieldColFormatValues = null;
var FieldColFormatLabels = null;

// Constants used to index into the above arrays.
INDEX_FORMAT_TEXT              = 0;
INDEX_FORMAT_INTEGER           = 1;
INDEX_FORMAT_NUMERIC           = 1;
INDEX_FORMAT_DOUBLE            = 2;
INDEX_FORMAT_DATE              = 3;
INDEX_FORMAT_CHECKBOX_YN       = 4;
INDEX_FORMAT_CHECKBOX_POS      = 5;
INDEX_FORMAT_CHECKBOX_NEG      = 6;



// ***************** LOCAL FUNCTIONS  ******************

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
  // Get the UI elements
  setConnectionSuccess = _ConnectionName.initializeUI();

  if (!setConnectionSuccess)
  {
    clickedCancel(); 
  }

  _FormName.initializeUI();
  _ConnectionName.initializeUI();
  _TableName.initializeUI();
  _ColumnList = new ListControl("ColumnList");
  _SubmittedValueList.initializeUI(_FormName);  
  _Redirect_url.initializeUI();
  
  // Load the labels and values from the html for _FieldColFormat. The store the
  //   loaded labels and values for later use.
  _FieldColFormat = new ListControl("FieldColFormat", null, true);
  FieldColFormatValues = _FieldColFormat.getValue('all');
  FieldColFormatLabels = _FieldColFormat.get('all');
  
  updateUI('ConnectionName');
  updateUI('FormName'); 
  
  setSubmitAsDisabledState();
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
  if (control == "FormName")
  {
    _SubmittedValueList.updateUI(_FormName, event); 
  }

  else if (control == "ConnectionName")
  {
    // update the table
    _TableName.updateUI(_ConnectionName, event);
  }
  
  else if (control == "TableName")
  {
    // Update the ColumnList
    var columnInfo = dwscripts.getColumnValueList
      (_ConnectionName.getValue(), _TableName.getValue());

    var names = new Array();
    for (var i=0; i < columnInfo.length; i++)
    {
      // map the columns to matching form items
      setDefaultMapping(columnInfo[i], _SubmittedValueList.get('all'), 
                        _SubmittedValueList.getValue('all'));
      
      names.push(getDisplayString(columnInfo[i]));
    }

    _ColumnList.setAll(names, columnInfo);

    updateUI("ColumnList");
  }

  else if (control=="ColumnList")
  {
    var columnInfo = _ColumnList.getValue();

    if (columnInfo)
    {
      var value = getSubmitAsValueFromVarName(columnInfo.getVariableName());
      _SubmittedValueList.pick(value);
      _FieldColFormat.pickValue(columnInfo.getSubmitAs());
    }
          
    setSubmitAsDisabledState(); 
  }
  
  else if (control=="FieldColFormat")
  {
    var columnInfo = _ColumnList.getValue();
    
    columnInfo.setSubmitAs(_FieldColFormat.getValue());
    _ColumnList.set(getDisplayString(columnInfo));
    
    setSubmitAsDisabledState();
  }
  
  else if (control == "SubmittedValueList")
  {
    if (event == "onChange")
    {
      var columnInfo = _ColumnList.getValue();
      
      if (columnInfo)
      {      
        columnInfo.setVariableName(getVarNameFromSubmitAsValue(_SubmittedValueList.get()));

        // Set the default SubmitAs value based on the new submitted value type.
        setDefaultSubmitAs(columnInfo, _SubmittedValueList.get('all'), 
                           _SubmittedValueList.getValue('all'));
        _FieldColFormat.pickValue(columnInfo.getSubmitAs());

        _ColumnList.set(getDisplayString(columnInfo));

        setSubmitAsDisabledState();
      }
    }
  }
  
  else if (control == "Redirect_url")
  {
    var theRedirect_url = dw.browseForFileURL("select", MM.LABEL_FileRedirect,0,0); 
    
    if (theRedirect_url.length > 0)
    {
      // convert any script blocks to concat values
      theRedirect_url = theRedirect_url.replace(/<\?php\s+(?:echo\s+)?/gi, "\" . ");
      theRedirect_url = theRedirect_url.replace(/;?\s*\?>/gi, " . \"");
      
      _Redirect_url.setValue(theRedirect_url); 
    }    
  }

  // default case - throw error message 
  else 
  {
    alert("The following control does not exist: " + control); 
  }
}
  
//--------------------------------------------------------------------
// FUNCTION:
//   findServerBehaviors
//
// DESCRIPTION:
//   Returns an array of ServerBehavior objects, each one representing
//   an instance of this Server Behavior on the page
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   JavaScript Array of ServerBehavior objects
//--------------------------------------------------------------------
function findServerBehaviors()
{
  var sbArray = new Array(); 

  sbArray = dwscripts.findSBs(MM.LABEL_TitleInsertRecord, SBInsertRecord);

  for (var i=0; i < sbArray.length; i++)
  {
    sbArray[i].postProcessFind();
  }

  return sbArray;
}


//--------------------------------------------------------------------
// FUNCTION:
//   canApplyServerBehavior
//
// DESCRIPTION:
//   Returns true if a Server Behavior can be applied to the current
//   document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   boolean - true if the behavior can be applied, false otherwise
//--------------------------------------------------------------------
function canApplyServerBehavior(sbObj)
{
  var success = true;
  var errMsgStr = ""; 
  
  if (findAllForms().length == 0) {  //if there are no forms
    errMsgStr += MM.MSG_NoForms;
    success = false; 
  }  

  if (errMsgStr) alert(errMsgStr); //popup error message
  
  return success;
}


//--------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//   Collects values from the form elements in the dialog box and
//   adds the Server Behavior to the user's document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   string - empty upon success, or an error message
//--------------------------------------------------------------------
function applyServerBehavior(sbObj)
{
  var newObj = null;
  var paramObj = "";
  
  if (sbObj)
  {
    newObj = sbObj.makeEditableCopy();
    paramObj = newObj.getParameters(false);
  }
  else
  {
    newObj = new SBInsertRecord();
    paramObj = newObj.getParameters(false);
  }
  
  var errStr = "";

  if (!errStr)
  {
    errStr = _ConnectionName.applyServerBehavior(sbObj, paramObj);

    if (!errStr)
    {
			var connectionPath = paramObj["ConnectionPath"];
			var bSiteRelative = IsConnectionSiteRelative(connectionPath);
			var urlFormat = "require_once";
			if (bSiteRelative)
			{
				urlFormat = "virtual";
			}		
			paramObj["UrlFormat"] = urlFormat;
      paramObj["ConnectionName"] = _ConnectionName.getValue();
      paramObj["ConnectionPath"] = dwscripts.getConnectionURL(paramObj["ConnectionName"],bSiteRelative);
    }
  } 

  if (!errStr)
  {
    errStr = _Redirect_url.applyServerBehavior(sbObj, paramObj);
  }

  if (!errStr)
  {
    errStr = _TableName.applyServerBehavior(sbObj, paramObj);
  }

  if (!errStr)
  {
    errStr = _FormName.applyServerBehavior(sbObj, paramObj);
    
    // If the form doesn't have a name, we must add one.
    var formName = _FormName.getValue().getAttribute("name");
    if (!formName)
    {
      formName = dwscripts.getUniqueNameForTag("FORM", "form");
    } 

    paramObj["FormName"] = formName; 
  }
  
  if (!errStr)
  {
    paramObj["ColumnList"] = _ColumnList.getValue('all');
    
    newObj.setSQLStatement();
  }
    
  if (!errStr)
  {
    if (!newObj.checkData())
    {
      errStr = newObj.getErrorMessage();
    }
  }
  
  if (!errStr)
  {
    if (sbObj == null)
    {
      // first time insert
      dwscripts.applySB(paramObj, null)
    }
    else
    {
      // edit the query by hand
      newObj.queueDocEdits();      
      dwscripts.applyDocEdits();      
    }
  }
  
  return errStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//   Sets the values of the form elements in the dialog box based
//   on the given ServerBehavior object
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function inspectServerBehavior(sbObj)
{
  // Note that the form name is updated automatically by our FormName control.
  //   We pick a value in the FormName control by sending it the form node. It updates
  //   the select list label with the form nodes actual name - not the previous name
  //   that we refer to in other parts of the code (the hidden and cfif). So, if
  //   the user changes the form name in the source, it still gets updated to the 
  //   correct value even though the FormName control is disabled on update.
  _FormName.inspectServerBehavior(sbObj);

  // Must update other ui elements based on form.
  updateUI("FormName", "onInspect");

  _ConnectionName.inspectServerBehavior(sbObj);
  _TableName.inspectServerBehavior(sbObj);
  _Redirect_url.inspectServerBehavior(sbObj);
  
  // Update the ColumnList
  var columnInfo = sbObj.getColumnList();
  var names = new Array();
  for (var i=0; i < columnInfo.length; i++)
  {
    names.push(getDisplayString(columnInfo[i]));
  }
  _ColumnList.setAll(names, columnInfo);
  
  updateUI("ColumnList", "onInspect");
}


//--------------------------------------------------------------------
// FUNCTION:
//   deleteServerBehavior
//
// DESCRIPTION:
//   Remove the specified Server Behavior from the user's document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function deleteServerBehavior(sbObj)
{
  dwscripts.deleteSB(sbObj);
}


//--------------------------------------------------------------------
// FUNCTION:
//   analyzeServerBehavior
//
// DESCRIPTION:
//   Performs extra checks needed to determine if the Server Behavior
//   is complete
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//   allRecs - JavaScripts Array of ServerBehavior objects - all of the
//             ServerBehavior objects known to Dreamweaver
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function analyzeServerBehavior(sbObj, allRecs)
{
  sbObj.analyze(allRecs);
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
  dwscripts.displayDWHelp(HELP_DOC);
}




// ***************** LOCAL FUNCTIONS  ******************

//--------------------------------------------------------------------
// FUNCTION:
//   findAllForms
//
// DESCRIPTION:
//   This function returns an array of all form nodes in the current DOM 
//
// ARGUMENTS:
//   none

//
// RETURNS:
//   array of <form> nodes
//--------------------------------------------------------------------

function findAllForms() 
{
  var retList = new Array();
  var dom = dw.getDocumentDOM();
  var forms = dom.getElementsByTagName("FORM");

  for (var i=0; i < forms.length; i++) 
  {
    var formName; 
    formName ? forms[i].getAttribute("name") : MM.LABEL_Unnamed; 
    retList.push(formName);
  }
  return retList;
}


function setSubmitAsDisabledState()
{
  if ( _SubmittedValueList.get() == "")
  {
    _FieldColFormat.disable(); 
  }
  else 
  {
    _FieldColFormat.enable();   
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   getDisplayString
//
// DESCRIPTION:
//   Retrieve the string to display in the column list for the given
//   columnValueNode.
//
// ARGUMENTS:
//   columnValueNode - ColumnValueNode.
//
// RETURNS:
//   string - display string.
//--------------------------------------------------------------------

function getDisplayString(columnValueNode)
{
  var retVal = "";
  var value = getSubmitAsValueFromVarName(columnValueNode.getVariableName());
  var columnName = columnValueNode.getColumnName();
  var isPrimaryKey = columnValueNode.getIsPrimaryKey();
  
  if (value)
  {
    var submitName = "";
    
    var index = dwscripts.findInArray(FieldColFormatValues, columnValueNode.getSubmitAs());
    if (index >= 0)
    {
      submitName = FieldColFormatLabels[index];
    }
    else
    {
      submitName = FieldColFormatLabels[INDEX_FORMAT_TEXT];
    }
    
    retVal = dwscripts.sprintf(MM.LABEL_IsMappedMask, columnName, value, submitName);
  }
  else
  {
    var labelMask = MM.LABEL_IsNotMappedMask;
    if (isPrimaryKey)
    {
      labelMask = MM.LABEL_IsNotMappedKeyMask;
    }
    
    retVal = dwscripts.sprintf(labelMask, columnName);
  }
  
  return retVal;    
}


//--------------------------------------------------------------------
// FUNCTION:
//   setDefaultMapping
//
// DESCRIPTION:
//   This function maps columns to values and submit as types.  This
//   function should be called whenever the list of columns changes,
//   or the list of values changes.
//
// ARGUMENTS:
//   columnValueNode - ColumnValueNode.
//   valueList - array of form element name references. The set of form element
//     references whose associated form elements are available to provide the 
//     value for the column. Parallel to nodeList.
//   nodeList - array of form element nodes. The set of form elements 
//     available to provide the value for the column. Parallel to valueList.
//
// RETURNS:
//   columnValueNode
//--------------------------------------------------------------------

function setDefaultMapping(columnValueNode, valueList, nodeList)
{
  setDefaultValue(columnValueNode, valueList, nodeList);
  setDefaultSubmitAs(columnValueNode, valueList, nodeList);
}


//--------------------------------------------------------------------
// FUNCTION:
//   setDefaultValue
//
// DESCRIPTION:
//   This function sets a default value based on the column name, and
//   the list of values.
//
// ARGUMENTS:
//   columnValueNode - ColumnValueNode.
//   valueList - array of form element name references. The set of form element
//     references whose associated form elements are available to provide the 
//     value for the column. Parallel to nodeList.
//   nodeList - array of form element nodes. The set of form elements 
//     available to provide the value for the column. Parallel to valueList.
//
// RETURNS:
//   columnValueNode
//--------------------------------------------------------------------

function setDefaultValue(columnValueNode, valueList, nodeList)
{
  var foundDefaultValue = false;
  var columnName = columnValueNode.getColumnName();
  for (var i = 0; !foundDefaultValue && i < nodeList.length; ++i)
  {
    var name = (nodeList[i] ? nodeList[i].getAttribute('NAME') : "");
    if (columnName.toUpperCase() == name.toUpperCase())
    {
      columnValueNode.setVariableName(getVarNameFromSubmitAsValue(valueList[i]));
      foundDefaultValue = true;
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   setDefaultSubmitAs
//
// DESCRIPTION:
//   This function sets a default submit as type, based on the column
//   type and the form control type. 
//
// ARGUMENTS:
//   columnValueNode - ColumnValueNode.
//   valueList - array of form element name references. The set of form element
//     references whose associated form elements are available to provide the 
//     value for the column. Parallel to nodeList.
//   nodeList - array of form element nodes. The set of form elements 
//     available to provide the value for the column. Parallel to valueList.
//
// RETURNS:
//   columnValueNode
//--------------------------------------------------------------------

function setDefaultSubmitAs(columnValueNode, valueList, nodeList)
{
  // only set submit as if we have a column and a value
  var value = getSubmitAsValueFromVarName(columnValueNode.getVariableName());
  var columnType = columnValueNode.getColumnType();
  var colType = "";

  if (columnType && value)
  {
    var index = dwscripts.findInArray(valueList, value);
    var node = nodeList[index];
    var isCheckbox = (node && node.getAttribute('TYPE')
                      && node.getAttribute('TYPE').toUpperCase() == 'CHECKBOX');
    var submitAs = "";

    // map the column type and form element type to the correct submit as value
    if (dwscripts.isStringDBColumnType(columnType))
    {
      if (isCheckbox)
      {
        submitAs = FieldColFormatValues[INDEX_FORMAT_CHECKBOX_YN];
      }
      else
      {
        submitAs = FieldColFormatValues[INDEX_FORMAT_TEXT];
      }
    }
    else if (dwscripts.isIntegerDBColumnType(columnType))
    {
      if (isCheckbox)
      {
        submitAs = FieldColFormatValues[INDEX_FORMAT_CHECKBOX_POS];  
      }
      else
      {
        submitAs = FieldColFormatValues[INDEX_FORMAT_INTEGER];
      }
    }
    else if (dwscripts.isDoubleDBColumnType(columnType))
    {
      if (isCheckbox)
      {
        submitAs = FieldColFormatValues[INDEX_FORMAT_CHECKBOX_POS];  
      }
      else
      {
        submitAs = FieldColFormatValues[INDEX_FORMAT_DOUBLE];
      }
    }
    else if (dwscripts.isNumericDBColumnType(columnType))
    {
      if (isCheckbox)
      {
        submitAs = FieldColFormatValues[INDEX_FORMAT_CHECKBOX_POS];  
      }
      else
      {
        submitAs = FieldColFormatValues[INDEX_FORMAT_NUMERIC]; 
      }
    }
    else if (dwscripts.isDateDBColumnType(columnType))
    {
      submitAs = FieldColFormatValues[INDEX_FORMAT_DATE]; 
    }
    else if (dwscripts.isBinaryDBColumnType(columnType) || isCheckbox)
    {
      submitAs = FieldColFormatValues[INDEX_FORMAT_CHECKBOX_YN]; 
    }
    else
    {
      submitAs = FieldColFormatValues[INDEX_FORMAT_TEXT];       
    }
    
    columnValueNode.setSubmitAs(submitAs);
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   getSubmitAsValueFromVarName
//
// DESCRIPTION:
//   The submitAsValue list has values of the form 'Form.elementName'. This
//   function converts php columnValueNode variable names to this form.
//
// ARGUMENTS:
//   varName - php columnValueNode variable name
//
// RETURNS:
//   string - submitAsValue list value
//--------------------------------------------------------------------
function getSubmitAsValueFromVarName(varName)
{
  var value = "";
  if (varName)
  {
    var paramInfo = dwscripts.getParameterTypeFromCode(varName);
    value = ((paramInfo) ? "FORM." + paramInfo.paramName : "");
  }
  return value;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getVarNameFromSubmitAsValue
//
// DESCRIPTION:
//   The submitAsValue list has values of the form 'FORM.elementName'. This
//   function converts submitAsValue list values to php columnValueNode variable 
//   names.
//
// ARGUMENTS:
//   value - submitAsValue list value
//
// RETURNS:
//   string - php columnValueNode variable name
//--------------------------------------------------------------------
function getVarNameFromSubmitAsValue(value)
{
  var varName = "";
  if (value)
  {
    value = value.slice(5);
    var paramInfo = dwscripts.getParameterCodeFromType(MM.LABEL_PHP_Param_Types[1], value);
    varName = ((paramInfo) ? paramInfo.nameVal : "");
  }
  return varName;
}


//--------------------------------------------------------------------
// CLASS:
//   SBInsertRecord
//
// DESCRIPTION:
//   This class is derived from the ServerBehaviorClass, and
//   represents a Insert Record Server Behvaior
//   
//   It handles CFQUERY tags with SQL statements of the form:
//
//     INSERT INTO Category (Foo, Bar, Ball) VALUES
//     ('#Form.Foo#', 
//      <CFIF Evaluate("Form.Bar") NEQ "">#Form.Bar#<CFELSE>NULL</CFIF>,
//      <CFIF IsDefined("Form.Bar")>'Y'<CFELSE>'N'</CFIF>
//     )
//
// PUBLIC PROPERTIES:
//   <property> - <type and description>
//
// PUBLIC FUNCTIONS:
//   <function name> - <description>
//--------------------------------------------------------------------

//--------------------------------------------------------------------
// FUNCTION:
//   SBInsertRecord
//
// DESCRIPTION:
//   Constructor
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBInsertRecord(name, title, selectedNode)
{  
  // Use the init function for construction.
  this.initServerBehavior(name, title, selectedNode);
}

// Inherit from the ServerBehavior class.
SBInsertRecord.prototype.__proto__ = ServerBehavior.prototype;

//public methods
SBInsertRecord.prototype.postProcessFind = SBInsertRecord_postProcessFind;
SBInsertRecord.prototype.analyze = SBInsertRecord_analyze;
SBInsertRecord.prototype.queueDocEdits = SBInsertRecord_queueDocEdits;
SBInsertRecord.prototype.checkData = SBInsertRecord_checkData;
SBInsertRecord.prototype.getColumnList = SBInsertRecord_getColumnList;
SBInsertRecord.prototype.getFormElementNames = SBInsertRecord_getFormElementNames;

SBInsertRecord.prototype.setSQLStatement = SBInsertRecord_setSQLStatement;
SBInsertRecord.prototype.getSQLStatement = SBInsertRecord_getSQLStatement;


//--------------------------------------------------------------------
// FUNCTION:
//   SBInsertRecord.setSQLStatement
//
// DESCRIPTION:
//   sets "SQLStatement" parameter for PHP/MySQL insert, inserting calls 
//   to the GetSQLValueString PHP function in the current page. 
//
//   E.g:
//
//   "INSERT INTO customers (lastname, custno) VALUES (" . GetSQLValueString($_POST['txtLast'], "text") . ", " . GetSQLValueString($_POST['txtCustno'], "int") . ")";
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBInsertRecord_setSQLStatement()
{
  var sqlObj = new SQLStatement("");
  
  var sqlVarList = sqlObj.createInsertStatement(this.getParameter("TableName"), this.getParameter("ColumnList"));
    
  var sqlString = sqlObj.getStatement(true); //strip line breaks
  
  this.setParameter("SQLStatement", sqlString);

  this.setParameter("SQLVariableList", sqlVarList.join(",\n                       "));
}



//--------------------------------------------------------------------
// FUNCTION:
//   SBInsertRecord.getSQLStatement
//
// DESCRIPTION:
//   Returns the SQL statement string
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   SQL string (stripped of PHP-specific code)
//--------------------------------------------------------------------

function SBInsertRecord_getSQLStatement()
{
  var sqlString = this.getParameter("SQLStatement");

  return sqlString;
}



//--------------------------------------------------------------------
// FUNCTION:
//   SBInsertRecord.postProcessFind
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function SBInsertRecord_postProcessFind()
{
  //extract the SQL statement
  var sqlObj = new SQLStatement(this.getSQLStatement());

  if (sqlObj.getType() == SQLStatement.STMT_TYPE_INSERT)
  {
    // set the table name
    var tables = sqlObj.getTableNames();
    this.setParameter("TableName", tables[0]);

    // Note: Hold off on setting the "ColumnList" parameter. That requires
    //   querying the database for the tables columns. Just call the
    //   SBInsertRecord_getColumnList function when it is needed (e.g., in
    //   inspectServerBehavior).
  }

  this.setParameter("ConnectionName", dwscripts.getSimpleFileName(this.getParameter("ConnectionPath")));

  var formNode = this.getParameter("form__tag");
  if (formNode)
  {
    this.setParameter("FormName", formNode.getAttribute("NAME"));
  }

  this.setTitle(MM.LABEL_TitleInsertRecord + " (" +
     this.getParameter("FormName") + ", " + 
     this.getParameter("ConnectionName") + ", " +
     this.getParameter("TableName") + ")");
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBInsertRecord.analyze
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function SBInsertRecord_analyze(allRecs)
{
  // Mark this sb as incomplete, if the user renamed the form and not the references
  //   to it.
  var formNameReference = this.getParameter("FormName");
  
  var formNode = this.getParameter("form__tag");
  var actualFormName = "";
  if (formNode && formNode.getAttribute("NAME"))
  {
    var actualFormName = formNode.getAttribute("NAME");
  }
  
  if ((!formNode) || (actualFormName.toUpperCase() != formNameReference.toUpperCase()))
  {
    this.setIsIncomplete(true);    
  }

  // Check that the form nodes referenced in the sql are present in the bound form.
  var formElmNames = this.getFormElementNames();
  for (var i = 0; !this.getIsIncomplete() && i < formElmNames.length; ++i)
  {
    // Note: strip off "Form." reference if present.
    if (formElmNames[i] && !formNode[formElmNames[i].replace(/form\./i, "")])
    {
      this.setIsIncomplete(true);
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBInsertRecord.queueDocEdits
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function SBInsertRecord_queueDocEdits()
{
  // If the form name was changed in the source, we need to update the hidden element
  if (this.bInEditMode)
  {  
    // Note that the new form name is updated automatically by our FormName control.
    //   We pick a value in the FormName control by sending it the form node. It updates
    //   the select list label with the form nodes actual name - not the previous name
    //   that we refer to in other parts of the code (the hidden). So, if
    //   the user changes the form name in the source, it still gets updated to the 
    //   correct value even though the FormName control is disabled on update.
    // Also note that the old form name is not extracted from the actual form node, but
    //   from our references to it in the code (the hidden). So, it will be
    //   different from the new name if the form name was changed manually in the source.
    var oldFormName = this.parameters["FormName"];
    var newFormName = this.applyParameters["FormName"];
    if (oldFormName.toUpperCase() != newFormName.toUpperCase())
    {
      // Just queue a doc edit to replace the hidden participant.
      extPart.queueDocEdits(this.getName(), "InsertRecord_hidden", 
                            this.getParameters(), this);
    }
  }

  // If the form name was deleted, add it back to the form tag.
  var formNode = this.getParameter("form__tag");
  if (formNode && !formNode.getAttribute("name"))
  {
    dwscripts.queueDocEdit(newFormName, "nodeAttribute+name", formNode);
  }

  extPart.queueDocEdits(this.getServerBehaviorFileName(), "InsertRecord_main", this.getParameters(), this);
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBInsertRecord.checkData
//
// DESCRIPTION:
//   Checks that the data supplied for the insert record region is complete
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function SBInsertRecord_checkData()
{
  var isValid = true;
  
  // Clear out the error message.
  this.setErrorMessage("");

  // Declare function for dwscripts.findInArray that is called later.
  var compareElementNameToName = function(object, searchValue)
  {
    var objectName = (object.getAttribute("name")) ? String(object.getAttribute("name")).toUpperCase() : "";
    var searchName = String(searchValue).toUpperCase();
    return objectName == searchName;
  };
                                  
  // Get all form elements for the chosen form so we can check that mapped columns
  //   are mapped to an existing form element. We only do this check if this is a
  //   reedit and we already have the form node pointer.
  var formNode = this.getParameter("form__tag");
  var formElements = (formNode) ? formNode.elements : null;
  
  var columns = this.getParameter("ColumnList");
  var found = false;
  for (var i = 0; columns && i < columns.length; i++)
  {
    // Check that user has bound some columns to values. Also, make sure the columns are
    //   bound to existing form elements.
    if (getSubmitAsValueFromVarName(columns[i].getVariableName()))
    {
      found = true;
      var columnValue = getSubmitAsValueFromVarName(columns[i].getVariableName());
      // Remove the 'Form.' prefix.
      columnValue = columnValue.substr(5);
      if (   formElements
          && dwscripts.findInArray(formElements, columnValue, 
                                   compareElementNameToName) == -1
         )
      {
        isValid = false;
        this.appendErrorMessage(dwscripts.sprintf(MM.MSG_MapColumnToExistingElement, 
                                                  columns[i].getColumnName())
                               );
      }
    }
  }
  
  if (!found)
  {
    this.appendErrorMessage(MM.MSG_NoMappedColumns);
    isValid = false;
  }

  return isValid;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBInsertRecord.getColumnList
//
// DESCRIPTION:
//   Gets the column list parameter. Users should always call this function when
//   attempting to get the ColumnList parameter.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   array of ColumnVariableNodes - the parameter value for ColumnList.
//--------------------------------------------------------------------

function SBInsertRecord_getColumnList()
{
  var sqlObj = new SQLStatement(this.getSQLStatement());
  var columnList = dwscripts.getColumnValueList(this.getParameter("ConnectionName"), this.getParameter("TableName"));

  var sqlVarListStr = this.getParameter("SQLVariableList");
  var sqlVarList = sqlVarListStr.split(/\s*,\s*(?=Get)/);

  sqlObj.extractColumnInfo(columnList, sqlVarList);

  this.setParameter("ColumnList", columnList);
  
  return columnList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBInsertRecord.getFormElementNames
//
// DESCRIPTION:
//   Returns an array of the form element names that are bound to
//   columns in this insert SB.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   array of string - the names of the bound form elements
//--------------------------------------------------------------------

function SBInsertRecord_getFormElementNames()
{
  var retVal = new Array();
  
  var columnList = this.getParameter("ColumnList");
  if (!columnList || columnList.length == 0)
  {
    columnList = this.getColumnList();
  }
  
  for (var i=0; i < columnList.length; i++)
  {
    var varName = getSubmitAsValueFromVarName(columnList[i].getVariableName());
    retVal.push(varName);
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   DisplayParameters
//
// DESCRIPTION:
//   Displays current parameters of an SB object for debugging)
//
// ARGUMENTS:
//   title  - description for alert()
//  obj   - a parameters object
//
// RETURNS:
//   nothing, just displays an alert dialog
//--------------------------------------------------------------------

function DisplayParameters(title, obj){
  var names = '';
  for (var name in obj) names += name + " = " + obj[name] + "\n";
  alert(title + '\n\n' + names);
}
