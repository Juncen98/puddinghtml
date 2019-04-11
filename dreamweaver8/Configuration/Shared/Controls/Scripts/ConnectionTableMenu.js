//SHARE-IN-MEMORY=true
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   ConnectionTableMenu
//
// DESCRIPTION:
//   This class represents a select list of tables within a given
//   connection
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//
//   initializeUI()
//   updateUI(control, event)
//
//   getValue()
//   pickValue(theValue)
//   setDiabled(theValue)
//
//   applyServerBehavior(sbObj, paramObj)
//   inspectServerBehavior(sbObj)
//
//--------------------------------------------------------------------


//-------------------------------------------------------------------
// FUNCTION:
//   ConnectionTableMenu
//
// DESCRIPTION:
//   Constructor function
//
// ARGUMENTS:
//   behaviorName - the name of the behavior using this control
//   paramName - the name of the parameter that is being set
//
// RETURNS:
//--------------------------------------------------------------------

function ConnectionTableMenu(behaviorName, paramName, empty) 
{
  this.behaviorName = behaviorName;
  this.paramName = paramName;
  
  this.connection = '';  // this is a pointer to a Connection instance

  this.haveTables = false;
  
  this.listControl = '';
  
  window.MM_CONNECTION_TABLE_MENU = this;
}

//public methods
ConnectionTableMenu.prototype.initializeUI = ConnectionTableMenu_initializeUI;
ConnectionTableMenu.prototype.updateUI = ConnectionTableMenu_updateUI;

ConnectionTableMenu.prototype.getValue = ConnectionTableMenu_getValue;
ConnectionTableMenu.prototype.pickValue = ConnectionTableMenu_pickValue;
ConnectionTableMenu.prototype.setDisabled = ConnectionTableMenu_setDisabled;

ConnectionTableMenu.prototype.applyServerBehavior = ConnectionTableMenu_applyServerBehavior;
ConnectionTableMenu.prototype.inspectServerBehavior = ConnectionTableMenu_inspectServerBehavior;

//no ops
ConnectionTableMenu.prototype.findServerBehaviors = ConnectionTableMenu_findServerBehaviors;
ConnectionTableMenu.prototype.canApplyServerBehavior = ConnectionTableMenu_canApplyServerBehavior;
ConnectionTableMenu.prototype.deleteServerBehavior = ConnectionTableMenu_deleteServerBehavior;
ConnectionTableMenu.prototype.analyzeServerBehavior = ConnectionTableMenu_analyzeServerBehavior;



//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI()
//
// DESCRIPTION:
//   Locates the Connection Menu control which is needed for this
//   control, and adds a callback to its event handler.
//
// ARGUMENTS:
//   elementName - string - (optional) the name of the form control, if it
//     differs from the parameter name
//   connMenuObj - JS Object - (optional) the connection control to 
//     use for this table control
//
// RETURNS:
//   boolean - false if could not retrieve tables for the connection.
//--------------------------------------------------------------------

function ConnectionTableMenu_initializeUI(elementName, connMenuObj) 
{
  var retVal = true;

  // set the connection control
  if (connMenuObj != null) 
  {
    this.connection = connMenuObj;
  }
  else if (window.MM_CONNECTION_MENU)
  {
    this.connection = window.MM_CONNECTION_MENU;
  }
  else
  {
    alert(MM.MSG_MENU_ERROR_3); 
  }

    
  var elemName = (elementName) ? elementName : this.paramName;
  
  this.listControl = new ListControl(elemName);

  var tableNames = new Array();

  if (this.connection)
  {
    var connectionName = this.connection.getValue();

    tableNames = dwscripts.getTableNames(connectionName);
  }

  if (tableNames.length)
  {
    this.listControl.setAll(tableNames,tableNames);
    this.haveTables = true;
  }
  else
  {
    this.listControl.setAll(new Array(""),new Array(""));
    this.haveTables = false;
    retVal = false;
  }
  
  this.listControl.setIndex(-1);

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateUI()
//
// DESCRIPTION:
//   Called from the Connection Menu to indicate that a new
//   connection has been selected.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean - false if could not find tables for the connection.
//--------------------------------------------------------------------

function ConnectionTableMenu_updateUI(control, event)
{
  var retVal = true;
  
  if (this.connection && control == this.connection)
  {
    var connectionName = this.connection.getValue();

    var tableNames = dwscripts.getTableNames(connectionName);

    if (tableNames.length && tableNames.length > 0)
    {
      this.listControl.setAll(tableNames,tableNames);
      this.haveTables = true;
    }
    else
    {
      this.listControl.setAll(new Array(""),new Array(""));
      this.listControl.set(MM.LABEL_NoTables, 0); 
      this.haveTables = false;
      retVal = false;
    }

    if (window.updateUI != null)
    {
      window.updateUI(this.paramName, "onUpdateUI"); // indicate that we have updated
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getValue
//
// DESCRIPTION:
//   Returns the currently selected table name
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function ConnectionTableMenu_getValue()
{
  var retVal = "";

  if (this.listControl)
  {
    retVal = this.listControl.getValue();
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   pickValue
//
// DESCRIPTION:
//   Select the table with the given name
//
// ARGUMENTS:
//   tableName - string - the table to select
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function ConnectionTableMenu_pickValue(tableName)
{
  var retVal = false;
  
  if (this.connection) 
  {    
    // Perform a case insensitive search in the list control.
    // In SQL, column and table names are case insensitive.
    retVal = this.listControl.pickValue(tableName, 
      new Function("object,searchValue", "return (String(object).toUpperCase() == String(searchValue).toUpperCase());"));

    if (retVal && window.updateUI != null)
    {
      window.updateUI(this.paramName, "onPickValue");
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   setDisabled
//
// DESCRIPTION:
//   Disables or enables the list or menu
//
// ARGUMENTS:
//   theValue - boolean - true to disable, false to enable
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function ConnectionTableMenu_setDisabled(theValue)
{
  if (this.listControl)
  {
    if (theValue && !this.listControl.object.getAttribute("disabled"))
    {
      this.listControl.object.setAttribute("disabled", true);
    }
    else if (!theValue && this.listControl.object.getAttribute("disabled"))
    {
      this.listControl.object.removeAttribute("disabled");
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------

function ConnectionTableMenu_applyServerBehavior(sbObj, paramObj, emptyMessage) 
{
  var retVal = "";
  
  var tableName  = this.listControl.getValue();
  
  if (!tableName || tableName.indexOf("MM_ERROR") != -1)
  {
    if (emptyMessage)
    {
      retVal = emptyMessage;
    }
    else
    {
      retVal = MM.MSG_NeedTable;
    }
  }
  
  paramObj[this.paramName] = tableName;
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------

function ConnectionTableMenu_inspectServerBehavior(sbObj, notFoundMsg)
{
  var retVal = false;
  
  var tableName = sbObj.parameters[this.paramName];

  retVal = this.pickValue(tableName);

  if (!retVal && this.haveTables) 
  {
    if (notFoundMsg)
    {
      alert(notFoundMsg);
    }
    else
    {
      alert(dwscripts.sprintf(MM.MSG_TableNotFound));
    }
  }
  
  return retVal;
}

//--------------------------------------------------------------------
// FUNCTION:
//   findServerBehaviors
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------

function ConnectionTableMenu_findServerBehaviors(paramObj)
{
  // nothing needed here 
}


//--------------------------------------------------------------------
// FUNCTION:
//   canApplyServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------

function ConnectionTableMenu_canApplyServerBehavior(sbObj)
{
  var retVal = true;
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   deleteServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------

function ConnectionTableMenu_deleteServerBehavior(sbObj)
{
  // nothing needed here 
}


//--------------------------------------------------------------------
// FUNCTION:
//   analyzeServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------

function ConnectionTableMenu_analyzeServerBehavior(sbObj, allRecs)
{
  // nothing needed here
}
