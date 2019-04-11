// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

var SB_NAME = dwscripts.getSBFileName();

var _FormName = new TagMenu(SB_NAME, "form__tag", "form"); 
var _ConnectionName = new ConnectionMenu(SB_NAME, "ConnectionName");
var _TableName = new ConnectionTableMenu(SB_NAME, "TableName");
var _ColumnList = null;
var _SubmittedValueList = new FormFieldsMenuASPNet(SB_NAME, "SubmittedValueList", true,
                                                   FormFieldsMenu.LABELS_MASK_NONE,
                                                   [{ prop: "type", value: "submit" }, 
                                                    { prop: "name", value: "MM_insert" },
                                                    { prop: "name", value: "MM_update" }]);
var _IsPrimaryKey = null;
var _FieldColFormat = null;
var _SuccessURL = new TextField(SB_NAME, "SuccessURL");
var _FailureURL = new TextField(SB_NAME, "FailureURL");
var _DebugInfo = new CheckBox(SB_NAME, "Debug");
var _DatabaseType = null;

//--------------------------------------------------------------------
// FUNCTION:
//   formExists
//
// DESCRIPTION:
//   Determine if there are any forms in the document.
//
// ARGUMENTS:
//   None.
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function formExists() 
{
  var dom = dw.getDocumentDOM();
  var forms = dom.getElementsByTagName("FORM");
  
  return (forms.length > 0);
}

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
  // Get the UI elements

  _ConnectionName.initializeUI();
  _FormName.initializeUI(); 
  _TableName.initializeUI();
  _ColumnList = new ListControl("ColumnList");
  _SubmittedValueList.initializeUI(_FormName);  
  _SuccessURL.initializeUI();
  _FailureURL.initializeUI();  
  _FieldColFormat = new ListControl("FieldColFormat", null, true);
  _DebugInfo.initializeUI();
  _DebugInfo.setCheckedState(true);

  if (dwscripts.findDOMObject("IsPrimaryKey"))
  {
    _IsPrimaryKey = new CheckBox(SB_NAME, "IsPrimaryKey", "");
    _IsPrimaryKey.initializeUI();
  }

  updateUI('ConnectionName');
  updateUI('FormName'); 
  updateUI('Debug');

  setDisabledState();
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
    _DatabaseType = MMDB.getDatabaseType(_ConnectionName.getValue());
    
	var theTypes = SBDatabaseCallASPNET.getParamTypeList(_DatabaseType);
    _FieldColFormat.setAll(theTypes, theTypes);

    _TableName.updateUI(_ConnectionName, event);
  }
  else if (control == "Define")
  {
    _ConnectionName.launchConnectionDialog();
  }  
  else if (control == "TableName")
  {
    // Update the ColumnList

    var columnInfo = dwscripts.getColumnValueList(_ConnectionName.getValue(), _TableName.getValue());
	var names = new Array();
    
	for (var i = 0; i < columnInfo.length; i++)
    {
      // Map the columns to matching form items
      
	  setDefaultMapping(columnInfo[i],
	                      _SubmittedValueList.get('all'), 
				          _SubmittedValueList.getValue('all'),
						  _DatabaseType);
      
      names.push(getDisplayString(columnInfo[i]));
    }
    
	_ColumnList.setAll(names, columnInfo);
    updateUI("ColumnList");
  }
  else if (control == "ColumnList")
  {
    var columnInfo = _ColumnList.getValue();

    if (columnInfo)
    {
      _SubmittedValueList.pick(columnInfo.getVariableName());
      _FieldColFormat.pickValue(columnInfo.getSubmitAs());
	  
	  if (_IsPrimaryKey != null)
	  {
	    _IsPrimaryKey.setCheckedState(columnInfo.getIsPrimaryKey());
      }
    }
	    
    setDisabledState(); 
  }
  else if (control == "FieldColFormat")
  {
    var columnInfo = _ColumnList.getValue();
    
	if (columnInfo)
	{
      columnInfo.setSubmitAs(_FieldColFormat.getValue());
      _ColumnList.set(getDisplayString(columnInfo));
    }

    setDisabledState();
  }
  else if (control == "SubmittedValueList")
  {
    if (event == "onChange")
    {
      var columnInfo = _ColumnList.getValue();

      if (columnInfo)
	  {
	    columnInfo.setVariableName(_SubmittedValueList.get());

        // Set the default Type value based on the new submitted value type.

        setDefaultSubmitAs(columnInfo, _DatabaseType);
      
	    _FieldColFormat.pickValue(columnInfo.getSubmitAs());
        _ColumnList.set(getDisplayString(columnInfo));
      }

      setDisabledState();
    }
  }
  else if (control == "IsPrimaryKey")
  {
    var columnInfo = _ColumnList.getValue();
    
    if (columnInfo)
	{
	  columnInfo.setIsPrimaryKey(_IsPrimaryKey.getCheckedState());
      _ColumnList.set(getDisplayString(columnInfo));
    }
	  
    setDisabledState();
  }
  else if (control == "SuccessURL")
  {
    var theSuccessURL = dw.browseForFileURL("select", MM.LABEL_FileRedirect, 0, 0); 
    
    if (theSuccessURL.length > 0)
    {
      _SuccessURL.setValue(theSuccessURL); 
    }    
  }
  else if (control == "FailureURL")
  {
    var theFailureURL = dw.browseForFileURL("select", MM.LABEL_FileRedirect, 0, 0); 
    
    if (theFailureURL.length > 0)
    {
      _FailureURL.setValue(theFailureURL); 
    }    
  }
  else if (control == "Debug")
  {
    _FailureURL.setDisabled(_DebugInfo.getCheckedState());
  }
  else 
  {  
    alert("The following control does not exist: " + control); 
  }
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
  
  // Cannot apply insert or update record in live data because the asp.net server
  //   renames forms with runat=server.
  if (dw.getLiveDataMode())
  {
    errMsgStr = MM.MSG_CannotApplyInLiveData;
    success = false;
  }
  
  if (!errMsgStr && !formExists())
  {
    errMsgStr += MM.MSG_NoForms;
    success = false; 
  }  

  if (errMsgStr)
  {
    alert(errMsgStr);
  }

  return success;
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
  sbObj.transformURLs(false);

  _FormName.inspectServerBehavior(sbObj);

  // Must update other ui elements based on form.

  updateUI("FormName", "onInspect");

  _ConnectionName.inspectServerBehavior(sbObj);
  _TableName.inspectServerBehavior(sbObj);
  _SuccessURL.inspectServerBehavior(sbObj);
  _FailureURL.inspectServerBehavior(sbObj);
  _DebugInfo.inspectServerBehavior(sbObj);
  
  // Update the ColumnList

  var columnInfo = sbObj.initColumnList();
  var names = new Array();

  for (var i = 0; i < columnInfo.length; i++)
  {
	names.push(getDisplayString(columnInfo[i]));
  }

  _ColumnList.setAll(names, columnInfo);
  
  updateUI("ColumnList", "onInspect");
  updateUI("Debug");
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
//   setDisabledState
//
// DESCRIPTION:
//   Enable/Disable the field-specific controls as appropriate.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function setDisabledState()
{
  if (_ColumnList.getValue())
  {
    _SubmittedValueList.enable();
	
	if (_IsPrimaryKey != null)
	{
	  _IsPrimaryKey.enable();
	}
  }
  else
  {
    _SubmittedValueList.pick("");
    _SubmittedValueList.enable(false);

	if (_IsPrimaryKey != null)
	{
      _IsPrimaryKey.setCheckedState(false);
  	  _IsPrimaryKey.enable(false);
    }
  }

  if (_SubmittedValueList.get() == "")
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
//   updateSBObjFromUI()
//
// DESCRIPTION:
//   Populate object from dialog.
//
// ARGUMENTS:
//   EditOpsASPNET
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function updateSBObjFromUI(newObj)
{
  var isValid = true;
  var errStr;
  var params = newObj.getParameters();

  newObj.setErrorMessage("");

  do
  {
    errStr = _FormName.applyServerBehavior(newObj, params);
    
	if (errStr)
	{
      newObj.appendErrorMessage(errStr);
	  isValid = false;
	  break;
	}

    // If the form doesn't have a name, we must add one.

    var formName = _FormName.getValue().getAttribute("name");
  
    if (!formName)
    {
      formName = dwscripts.getUniqueNameForTag("FORM", "form");
    } 

    newObj.setFormName(formName);
	
    errStr = _ConnectionName.applyServerBehavior(newObj, newObj.getParameters());
  
	if (errStr)
	{
      newObj.appendErrorMessage(errStr);
	  isValid = false;
	  break;
	}

    errStr = _TableName.applyServerBehavior(newObj, params);
 
    if (errStr)
	{
      newObj.appendErrorMessage(errStr);
      isValid = false;
	  break;
    }
  
    // Parameters

    var tempColumnInfo = _ColumnList.getValue('all');
    
    // Since we need to sort the columnInfo array, make a copy of the original
    //   one. Otherwise, we'll be affecting the same columnInfo array stored in
    //   the _ColumnList control. This could affect what the UI displays if checkData
    //   returns false and the user must work more with the UI.
    
	var columnInfo = new Array();
    
	for (var i = 0; i < tempColumnInfo.length; ++i)
    {
      columnInfo.push(tempColumnInfo[i]);
    }
    
    // Parameters need to be in the same order as they
    // are referenced in the sql. For an update statement,
    // the primary keys are at the end. So, put them last.

    if (_IsPrimaryKey != null)
    {
      columnInfo.sort(sortByPrimaryKeyCB);
    }

    var paramNames = new Array();
	var paramRuntimes = new Array(); 
    var paramTypes = new Array(); 
   
    for (var z = 0; z < columnInfo.length; ++z)
    {
      if (columnInfo[z].getVariableName())
      {
	    var columnName = "@" + columnInfo[z].getColumnName();
		var defaultValue = (columnInfo[z].getDefaultValue() != "") ? 
                            columnInfo[z].getDefaultValue() : "\"\"";
	    var submitAs = columnInfo[z].getSubmitAs();
	    var runtime = dwscripts.getParameterCodeFromType(MM.LABEL_ASPNET_Param_Types[1],
		  												columnInfo[z].getVariableName(),
														defaultValue,
														submitAs);

        columnInfo[z].setRuntimeValue((_DatabaseType.toLowerCase() == "oledb") ? "?" : columnName);
        
        paramNames.push(columnName);
		paramRuntimes.push(runtime);     
        paramTypes.push(submitAs);
      }
	  else
	  {
        columnInfo[z].setRuntimeValue(null);
	  }
    }

    newObj.setVarNames(paramNames);
    newObj.setVarRuntimes(paramRuntimes);
    newObj.setVarTypes(paramTypes);

    newObj.setColumnList(columnInfo);
    newObj.setSQLStatement(newObj.getTableName(), columnInfo);
  
    _SuccessURL.applyServerBehavior(newObj, params);

	// Not calling applyServerBehavior() for _FailureURL because
	// we want to write it out even if it's disabled

    newObj.setFailureURL(_FailureURL.getValue());
	newObj.transformURLs(true);

    _DebugInfo.applyServerBehavior(newObj, params);
  }
  while (false);

  return isValid;
}

//--------------------------------------------------------------------
// FUNCTION:
//   sortByPrimaryKeyCB
//
// DESCRIPTION:
//   Sort such that columns that are primary keys are at the end.
//
// ARGUMENTS:
//   a, b: columnValueNodes.
//
// RETURNS:
//   If -1 is returned: order stays the same, if 1: values are switched, if 0: values are equal
//--------------------------------------------------------------------

function sortByPrimaryKeyCB(a, b)
{
  return (a.getIsPrimaryKey() && !b.getIsPrimaryKey()) ? 1 : (-1);
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
//   usePrimaryKey - Boolean, whether to use primary key masks.
//
// RETURNS:
//   string - display string.
//--------------------------------------------------------------------

function getDisplayString(columnValueNode)
{
  var retVal = "";
  var value = columnValueNode.getVariableName();
  var columnName = columnValueNode.getColumnName();
  var isPrimaryKey = ((_IsPrimaryKey != null) && columnValueNode.getIsPrimaryKey());
  var labelMask;

  if (value)
  {
    labelMask = (isPrimaryKey) ? MM.LABEL_IsMappedKeyMask : MM.LABEL_IsMappedMask;
    retVal = dwscripts.sprintf(labelMask, columnName, value, columnValueNode.getSubmitAs());
  }
  else
  {
    labelMask = (isPrimaryKey) ? MM.LABEL_IsNotMappedKeyMask : MM.LABEL_IsNotMappedMask;
    retVal = dwscripts.sprintf(labelMask, columnName);
  }
  
  return retVal;    
}
