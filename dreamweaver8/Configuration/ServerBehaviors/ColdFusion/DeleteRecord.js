// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


// *************** GLOBALS VARS *****************

var HELP_DOC = MM.HELP_sbCFDeleteRecord; 

var SB_NAME = dwscripts.getSBFileName();

// Constants for submit as formats
var SUBMIT_AS_NUMERIC_KEY = "none,none,NULL";
var SUBMIT_AS_TEXT_KEY = "',none,NULL";

var _DeleteIfDefinedParameter = new ListMenu(SB_NAME, "DeleteIfDefinedParameter");
var _DeleteIfDefinedParameterValue = new TextField(SB_NAME, "DeleteIfDefinedParameterValue");
var _ConnectionName = new CFDataSourceMenu(SB_NAME, "ConnectionName");
var _UserName = new TextField(SB_NAME, "UserName");
var _Password = new TextField(SB_NAME, "Password");
var _TableName = new ConnectionTableMenu(SB_NAME, "TableName");
var _ColumnList = null; 
var _IsNumeric = new CheckBox(SB_NAME, "IsNumeric"); 
var _PrimaryKeyParameter = new ListMenu(SB_NAME, "PrimaryKeyParameter");
var _PrimaryKeyParameterValue = new TextField(SB_NAME, "PrimaryKeyParameterValue");
var _RedirectURL = new TextField(SB_NAME, "RedirectURL");



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
  var ifDefinedLabels = [MM.LABEL_NeverCheckIfParamIsDefined];
  var ifDefinedValues = [""];
  _DeleteIfDefinedParameter.initializeUI(ifDefinedLabels.concat(dwscripts.getParameterTypeArray(true)), 
                                         ifDefinedValues.concat(dwscripts.getParameterTypeArray(true))
                                        );
  _DeleteIfDefinedParameterValue.initializeUI(); 
  _ConnectionName.initializeUI();
  _UserName.initializeUI(); 
  _Password.initializeUI(); 
  _TableName.initializeUI();
  _ColumnList = new ListControl("ColumnList");
  _IsNumeric.initializeUI(); 
  _PrimaryKeyParameter.initializeUI(dwscripts.getParameterTypeArray(true), 
                                    dwscripts.getParameterTypeArray(true)
                                   ); 
  _PrimaryKeyParameterValue.initializeUI(); 
  _RedirectURL.initializeUI();  
 
  updateUI('ConnectionName');  
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
  if (control == "DeleteIfDefinedParameter")
  {
    if (_DeleteIfDefinedParameter.getValue() == "")
    {
      _DeleteIfDefinedParameterValue.setValue(""); 
      _DeleteIfDefinedParameterValue.setDisabled(true); 
    }
    else
    {
      _DeleteIfDefinedParameterValue.setDisabled(false);       
    }
  }
  else if (control == "ConnectionName")
  {
    // check the connection, and get a username and password if needed
    _ConnectionName.ensureLogin("", "");

    if (event == "onChange")
    {
      // set the username and password for this data source
      _UserName.setValue(_ConnectionName.getUsername());
      _Password.setValue(_ConnectionName.getPassword());
    }
    
    // update the table
    _TableName.updateUI(_ConnectionName, event);
  }
  
  else if (control == "TableName")
  {
    // Update the ColumnList
    var columnInfo = dwscripts.getColumnValueList
      (_ConnectionName.getValue(), _TableName.getValue());

    var names = new Array();
    var keyColumnName = null;
    for (var i=0; i < columnInfo.length; i++)
    {
      // Determine the primary key so we can select it by default. (Must be done
      //   before setting default mapping because we mark all columns as keys by
      //   default in this case).
      if (columnInfo[i].getIsPrimaryKey() && !keyColumnName)
      {
        keyColumnName = columnInfo[i].getColumnName();
      }
      
      names.push(columnInfo[i].getColumnName());
      setDefaultMapping(columnInfo[i]);      
    }
    _ColumnList.setAll(names, columnInfo);
    
    // Set selection to table primary key if we found one.
    if (keyColumnName)
    {
      _ColumnList.pick(keyColumnName);
    }
    
    updateUI("ColumnList");
  }

  else if (control=="ColumnList")
  {
    var columnInfo = _ColumnList.getValue();
    
    if (columnInfo)
    {
      // Based on the submit as type, preset the IsNumeric checkbox.
      var submitAsType = columnInfo.getSubmitAs();
      _IsNumeric.setCheckedState(submitAsType == SUBMIT_AS_NUMERIC_KEY);

      // Fill in the primary key parameter fields based on the column value.
      var columnValue = columnInfo.getVariableName();
      var paramInfo = dwscripts.getParameterTypeFromCode(columnValue);
      _PrimaryKeyParameter.pickValue(paramInfo.paramType);
      _PrimaryKeyParameterValue.setValue(paramInfo.paramName);
    }
  }
  else if (control == "IsNumeric")
  {
    var columnInfo = _ColumnList.getValue();
    if (columnInfo)
    {
      // Select between submit as strings for a text primary key or numeric primary key.
      columnInfo.setSubmitAs(_IsNumeric.getCheckedState() ? SUBMIT_AS_NUMERIC_KEY 
                                                          : SUBMIT_AS_TEXT_KEY);
      columnInfo.setIsPrimaryKey(true);
    }
  }
  else if (control == "PrimaryKeyParameterValue")
  {
    var columnInfo = _ColumnList.getValue();
    if (columnInfo)
    {
      var paramValue = _PrimaryKeyParameterValue.getValue();
      var paramType = _PrimaryKeyParameter.getValue();
      var paramInfo = dwscripts.getParameterCodeFromType(paramType, paramValue, "");
      columnInfo.setVariableName(paramInfo.nameVal);
    }
  }
  else if (control == 'PrimaryKeyParameter')
  {
    if (event == "onChange")
    {
      var columnInfo = _ColumnList.getValue();
      if (columnInfo)
      {
        var paramValue = _PrimaryKeyParameterValue.getValue();
        var paramType = _PrimaryKeyParameter.getValue();
        var paramInfo = dwscripts.getParameterCodeFromType(paramType, paramValue, "");
        columnInfo.setVariableName(paramInfo.nameVal);
      }
    }
  }
  else if (control == "RedirectURL")
  {
    var theRedirectURL = dw.browseForFileURL("select", MM.LABEL_FileRedirect,0,0); 
    
    if (theRedirectURL.length > 0)
    {
      theRedirectURL = dwscripts.stripCFOutputTags(theRedirectURL);

      _RedirectURL.setValue(theRedirectURL); 
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
//   setDefaultMapping
//
// DESCRIPTION:
//   This function maps a column value node to default values and submit as types.  This
//   function should be called whenever the list of columns changes,
//   or the list of values changes.
//
// ARGUMENTS:
//   columnValueNode - ColumnValueNode.
//
// RETURNS:
//   columnValueNode
//--------------------------------------------------------------------

function setDefaultMapping(columnValueNode)
{
  setDefaultValue(columnValueNode);
  setDefaultSubmitAs(columnValueNode);
}


//--------------------------------------------------------------------
// FUNCTION:
//   setDefaultValue
//
// DESCRIPTION:
//   This function sets a default value for the column based on the column name.
//
// ARGUMENTS:
//   columnValueNode - ColumnValueNode.
//
// RETURNS:
//   columnValueNode
//--------------------------------------------------------------------

function setDefaultValue(columnValueNode)
{
  // Default to a the first type parameter in the list.
  var firstParamType = (dwscripts.getParameterTypeArray(true))[0];
  var paramInfo = dwscripts.getParameterCodeFromType(firstParamType, 
                                           columnValueNode.getColumnName(),
										   "");
  columnValueNode.setVariableName(paramInfo.nameVal);
}


//--------------------------------------------------------------------
// FUNCTION:
//   setDefaultSubmitAs
//
// DESCRIPTION:
//   This function sets a default submit as type based on the column
//   type. 
//
// ARGUMENTS:
//   columnValueNode - ColumnValueNode.
//
// RETURNS:
//   columnValueNode
//--------------------------------------------------------------------

function setDefaultSubmitAs(columnValueNode)
{
  var columnType = columnValueNode.getColumnType();
  
  // For our Delete Record implementation, we are treating the column which will
  //   choose the record to delete as if it's a primary key. So, go ahead and mark
  //   all columns as primary keys by default.
  var submitAsType = (dwscripts.isNumericDBColumnType(columnType)) ? SUBMIT_AS_NUMERIC_KEY
                                                                   : SUBMIT_AS_TEXT_KEY;
  columnValueNode.setSubmitAs(submitAsType);
  columnValueNode.setIsPrimaryKey(true);
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

  sbArray = dwscripts.findSBs(MM.LABEL_TitleDeleteRecord, SBDeleteRecord);
  
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
  
  // If we can't retrieve any CF data sources, ask user to create one before
  //   using this behavior.
  var cfDSNList = MMDB.getColdFusionDsnList();
  if (cfDSNList == null || cfDSNList.length == 0)
  {
    errMsgStr = MM.MSG_SBCreateCFDataSource;
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
    newObj = new SBDeleteRecord();
    paramObj = newObj.getParameters(false);
  }
  
  var errStr = "";
  
  
  if (!errStr)
  {
    errStr = _ConnectionName.applyServerBehavior(sbObj, paramObj);
  } 

  if (!errStr)
  {
    if (_DeleteIfDefinedParameter.getValue() != "" && _DeleteIfDefinedParameterValue.getValue()&& _DeleteIfDefinedParameterValue.getValue() != "" )
    {
      if (dwscripts.isValidVarName(_DeleteIfDefinedParameterValue.getValue())) 
      { 
        var paramType = _DeleteIfDefinedParameter.getValue();
        var paramValue = _DeleteIfDefinedParameterValue.getValue();
        var paramInfo = dwscripts.getParameterCodeFromType(paramType, paramValue, "");
        paramObj["DeleteIfDefined"] = (paramInfo) ? paramInfo.nameVal : null;
      }
      else 
      {
        errStr = MM.MSG_InvalidCheckIfIsDefinedVarName;  
      }
    }
    else 
    {
      paramObj["DeleteIfDefined"] = null; 
    }
  }

  if (!errStr)
  {
    errStr = _UserName.applyServerBehavior(sbObj, paramObj);
  }

  if (!errStr)
  {
    errStr = _Password.applyServerBehavior(sbObj, paramObj);
  }  

  if (!errStr)
  {
    errStr = _RedirectURL.applyServerBehavior(sbObj, paramObj);
  }

  if (!errStr)
  {
    errStr = _TableName.applyServerBehavior(sbObj, paramObj);
  }

  if (!errStr)
  {
    // We only use the selected column value node.
    var colValueNode = _ColumnList.getValue();
    paramObj["ColumnList"] = [colValueNode];
    newObj.setSQLStatement();
    
    paramObj["PrimaryKeyParameter"] = colValueNode.getVariableName();
  }

  if (!errStr)
  {
    // todo: rethink the location of this code - perhaps in checkData()? 
    if (_PrimaryKeyParameter.getValue() != "" && _PrimaryKeyParameterValue.getValue() && _PrimaryKeyParameterValue.getValue() != "" )
    {
      if (!dwscripts.isValidVarName(_PrimaryKeyParameterValue.getValue()))
      {
        errStr = MM.MSG_InvalidPrimaryKeyVarName;
      }
    }  
    else 
    {
      errStr = MM.MSG_NoMappedKey; 
    }
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
      // edit the cfquery tag by hand
      
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
  var objectText = ""; 
  
  // Set 'Delete If Defined' parameter fields.
  var deleteIfDefinedParam = sbObj.getParameter("DeleteIfDefined");
  if (deleteIfDefinedParam)
  {
    var paramInfo = dwscripts.getParameterTypeFromCode(deleteIfDefinedParam);
    if (paramInfo)
    {
      _DeleteIfDefinedParameter.pickValue(paramInfo.paramType);
      _DeleteIfDefinedParameterValue.setValue(paramInfo.paramName);
    }
  }
  
  _ConnectionName.inspectServerBehavior(sbObj);
  _UserName.inspectServerBehavior(sbObj);
  _Password.inspectServerBehavior(sbObj);
  _TableName.inspectServerBehavior(sbObj);
  _RedirectURL.inspectServerBehavior(sbObj);
  
  // Update the ColumnList
  var columnInfo = sbObj.getColumnList();
  var names = new Array();
  var indexPrimaryKey = -1;
  for (var i=0; i < columnInfo.length; i++)
  {
    names.push(columnInfo[i].getColumnName());
    
    // Set the selection to the first column that has a runtime value and is a primary
    //   key. Note that only one column should have a runtime value for this server
    //   behavior. For all other items, set default values for the Submit As and runtime
    //   value.
    if (   indexPrimaryKey == -1 && columnInfo[i].getIsPrimaryKey() 
        && columnInfo[i].getRuntimeValue()
       )
    {
      indexPrimaryKey = i;
    }
    else
    {
      setDefaultMapping(columnInfo[i]);      
    }
  }
  _ColumnList.setAll(names, columnInfo);
  _ColumnList.setIndex(indexPrimaryKey);
  
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



//--------------------------------------------------------------------
// CLASS:
//   SBDeleteRecord
//
// DESCRIPTION:
//   This class is derived from the ServerBehaviorClass, and
//   represents a Delete Record Server Behvaior
//   
//   It handles CFQUERY tags with SQL statements of the form:
//
//     DELETE FROM Category 
//     where CategoryID = #FORM.CategoryID# 
//
// PUBLIC PROPERTIES:
//   <property> - <type and description>
//
// PUBLIC FUNCTIONS:
//   <function name> - <description>
//--------------------------------------------------------------------

//--------------------------------------------------------------------
// FUNCTION:
//   SBDeleteRecord
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

function SBDeleteRecord(name, title, selectedNode)
{  
  // Use the init function for construction.
  this.initServerBehavior(name, title, selectedNode);
}

// Inherit from the ServerBehavior class.
SBDeleteRecord.prototype.__proto__ = ServerBehavior.prototype;

//public methods
SBDeleteRecord.prototype.postProcessFind = SBDeleteRecord_postProcessFind;
SBDeleteRecord.prototype.analyze = SBDeleteRecord_analyze;
SBDeleteRecord.prototype.queueDocEdits = SBDeleteRecord_queueDocEdits;
SBDeleteRecord.prototype.checkData = SBDeleteRecord_checkData;
SBDeleteRecord.prototype.getColumnList = SBDeleteRecord_getColumnList;

SBDeleteRecord.prototype.setSQLStatement = SBDeleteRecord_setSQLStatement;


//--------------------------------------------------------------------
// FUNCTION:
//   SBDeleteRecord.setSQLStatement
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

function SBDeleteRecord_setSQLStatement()
{
  var sqlObj = new SQLStatement("");
  sqlObj.createDeleteStatement(this.getParameter("TableName"),
                               this.getParameter("ColumnList"));  
    
  var sqlString = sqlObj.getStatement();
  this.setParameter("SQLStatement", sqlString);
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDeleteRecord.postProcessFind
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

function SBDeleteRecord_postProcessFind()
{
  var part = this.getNamedSBPart("DeleteRecord_main");
  if (part)
  {
    var mainTag = new TagEdit(dwscripts.getOuterHTML(part.getNode()));
    
    var queryTag = null;
    var locationTag = null;
    
    // find the child nodes for cfquery and cflocation    
    var subTags = mainTag.getChildNodes();    
    for (var i=0; i < subTags.length; i++)
    {
      if (subTags[i].getTagName() == "CFQUERY")
      {
        queryTag = subTags[i];
      }
      else if (subTags[i].getTagName() == "CFLOCATION")
      {
        locationTag = subTags[i];
      }
    }
    
    // extract the cfquery tag parameters
    if (queryTag)
    {    
      this.setParameter("ConnectionName", queryTag.getAttribute("datasource"));
      this.setParameter("UserName", queryTag.getAttribute("username"));
      this.setParameter("Password", queryTag.getAttribute("password"));
      this.setParameter("SQLStatement", queryTag.getInnerHTML());
    }
    else
    {
      //alert("INTERNAL ERROR: no query tag found");
      this.deleted = true;
      return;
    }
    
    // extract the cflocation tag parameters
    if (locationTag)
    {
      this.setParameter("RedirectURL", locationTag.getAttribute("url"));
    }
    else
    {
      this.setParameter("RedirectURL", "");
    }
    
    //extract the SQL statement
    var sqlObj = new SQLStatement(this.getParameter("SQLStatement"));
      
    if (sqlObj.getType() == SQLStatement.STMT_TYPE_DELETE)
    {
      // set the table name
      var tables = sqlObj.getTableNames();
      this.setParameter("TableName", tables[0]);
      
      // Note: Hold off on setting the "ColumnList" parameter. That requires
      //   querying the database for the tables columns. Just call the
      //   SBDeleteRecord_getColumnList function when it is needed (e.g., in
      //   inspectServerBehavior).
    }
    
    this.setTitle(MM.LABEL_TitleDeleteRecord + " (" +
       this.getParameter("ConnectionName") + ", " +
       this.getParameter("TableName") + ")");
    
  }
  else
  {
    //this.delete = true;
    alert("INTERNAL ERROR: main participant not found. How could that be???");
  }  
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDeleteRecord.analyze
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

function SBDeleteRecord_analyze(allRecs)
{
  // Mark this sb as incomplete, if the user renamed the form and not the references
  //   to it.
  
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDeleteRecord.queueDocEdits
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

function SBDeleteRecord_queueDocEdits()
{
  var part = this.getNamedSBPart("DeleteRecord_main");
  
  if (part)
  {
    var mainTag = new TagEdit(dwscripts.getOuterHTML(part.getNode()));
    
    var queryTag = null;
    var locationTag = null;
    
    // find the child nodes for cfquery and cflocation    
    var subTags = mainTag.getChildNodes();    
    for (var i=0; i < subTags.length; i++)
    {
      if (subTags[i].getTagName() == "CFQUERY")
      {
        queryTag = subTags[i];
      }
      else if (subTags[i].getTagName() == "CFLOCATION")
      {
        locationTag = subTags[i];
      }
    }
        
    var connectionName = this.getParameter("ConnectionName");
    if (connectionName != queryTag.getAttribute("datasource"))
    {
      queryTag.setAttribute("datasource", connectionName);
    }
    
    // The password and username attributes are optional. Remove them if their
    //   values are empty.
    var newPassword = this.getParameter("Password");
    var oldPassword = queryTag.getAttribute("password");
    if (newPassword != oldPassword)
    {
      if (newPassword == "" )
      {
        queryTag.removeAttribute("password");
      }
      else
      {
        queryTag.setAttribute("password", newPassword);
      }
    }

    var newUsername = this.getParameter("UserName");
    var oldUsername = queryTag.getAttribute("username");
    if (newUsername != oldUsername)
    {
      if (newUsername == "")
      {
        queryTag.removeAttribute("username");
        
        // It doesn't make sense to have the password attribute without the
        //   username. So, remove it.
        queryTag.removeAttribute("password");
      }
      else
      {
        queryTag.setAttribute("username", newUsername);
      }
    }
        
    queryTag.setInnerHTML(this.getParameter("SQLStatement"));
    
    // now update the cflocation tag
    var redirectUrl = this.getParameter("RedirectURL");
    if (redirectUrl)
    {
      if (locationTag)
      {
        // set the new value
        locationTag.setAttribute("url", redirectUrl);
      }
      else
      {
        // add a cflocation node
        var childNodes = mainTag.getChildNodes();
        childNodes.push(new TagEdit("<cflocation url=\""+redirectUrl+"\">"));
        mainTag.setChildNodes(childNodes);
      }
    }
    else  if (locationTag)
    {
      var childNodes = mainTag.getChildNodes();
      var index = dwscripts.findInArray(childNodes, locationTag);
      if (index >= 0)
      {
        childNodes.splice(index, 1); // remove the node
        mainTag.setChildNodes(childNodes);
      }
      
    }
    
    var newOuterHTML = mainTag.getOuterHTML();
    
    if (this.bInEditMode)
    {  
      // If any parameters changed that affect the cfif condition, we must replace
      //   the cfif condition.
      var oldDeleteIfDefined = (this.parameters["DeleteIfDefined"]) ?
                               this.parameters["DeleteIfDefined"] : "";
      var newDeleteIfDefined = (this.applyParameters["DeleteIfDefined"]) ?
                               this.applyParameters["DeleteIfDefined"] : "";
      var oldPrimaryKeyParam = this.parameters["PrimaryKeyParameter"];
      var newPrimaryKeyParam = this.applyParameters["PrimaryKeyParameter"];
      if (   oldDeleteIfDefined.toUpperCase() != newDeleteIfDefined.toUpperCase()
          || oldPrimaryKeyParam.toUpperCase() != newPrimaryKeyParam.toUpperCase()
         )
      {
        // The cfif tag must be updated in the newOuterHTML returned from the tagEdit.
        var cfifRegExp = /<cfif IsDefined\("[^\r\n]*?"\) AND #([^\r\n]*?)# NEQ ""(?: AND IsDefined\("([^\r\n]*?)"\))?>/i;
        var updateText = "<cfif IsDefined(\"" + newPrimaryKeyParam + "\")" 
                       + " AND #" + newPrimaryKeyParam + "# NEQ \"\""
                       + ((newDeleteIfDefined && newPrimaryKeyParam != newDeleteIfDefined) ? " AND IsDefined(\"" + newDeleteIfDefined + "\")" : "")
                       + ">";
        newOuterHTML = newOuterHTML.replace(cfifRegExp, updateText);
      }
    }
    
    dwscripts.queueDocEdit(newOuterHTML, "replaceNode", part.getNode());

  }
  else
  {
    alert("INTERNAL ERROR: DeleteRecord_main not found");
  }  
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDeleteRecord.checkData
//
// DESCRIPTION:
//   Checks that the data supplied for the repeat region is complete
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function SBDeleteRecord_checkData()
{
  var isValid = true;
   
  return isValid;
}

      
//--------------------------------------------------------------------
// FUNCTION:
//   SBDeleteRecord.getColumnList
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

function SBDeleteRecord_getColumnList()
{
  //extract the SQL statement
  var sqlObj = new SQLStatement(this.getParameter("SQLStatement"));

  var columnList = dwscripts.getColumnValueList
     (dwscripts.getCFDataSourceName(this.getParameter("ConnectionName")), 
      this.getParameter("TableName"));
      
  sqlObj.extractColumnInfo(columnList);
  
  this.setParameter("ColumnList", columnList);
  
  return columnList;
}
