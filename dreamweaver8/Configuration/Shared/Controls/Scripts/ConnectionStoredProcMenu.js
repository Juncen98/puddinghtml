//SHARE-IN-MEMORY=true
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   ConnectionStoredProcMenu
//
// DESCRIPTION:
//   This class represents a select list of stored procedures within a given
//   connection.
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
//
//   applyServerBehavior(sbObj, paramObj)
//   inspectServerBehavior(sbObj)
//
//--------------------------------------------------------------------


//-------------------------------------------------------------------
// FUNCTION:
//   ConnectionStoredProcMenu
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

function ConnectionStoredProcMenu(behaviorName, paramName) 
{
  this.behaviorName = behaviorName;
  this.paramName = paramName;
  
  this.connection = '';  // this is a pointer to a Connection instance

  this.haveProcedures = false;
  
  this.listControl = '';
  
  window.MM_CONNECTION_STOREDPROC_MENU = this;
}

//public methods
ConnectionStoredProcMenu.prototype.initializeUI = ConnectionStoredProcMenu_initializeUI;
ConnectionStoredProcMenu.prototype.updateUI = ConnectionStoredProcMenu_updateUI;

ConnectionStoredProcMenu.prototype.getValue = ConnectionStoredProcMenu_getValue;
ConnectionStoredProcMenu.prototype.pickValue = ConnectionStoredProcMenu_pickValue;

ConnectionStoredProcMenu.prototype.applyServerBehavior = ConnectionStoredProcMenu_applyServerBehavior;
ConnectionStoredProcMenu.prototype.inspectServerBehavior = ConnectionStoredProcMenu_inspectServerBehavior;

//private methods
ConnectionStoredProcMenu.prototype.findAllStoredProcNames = ConnectionStoredProcMenu_findAllStoredProcNames;

//no ops
ConnectionStoredProcMenu.prototype.findServerBehaviors = ConnectionStoredProcMenu_findServerBehaviors;
ConnectionStoredProcMenu.prototype.canApplyServerBehavior = ConnectionStoredProcMenu_canApplyServerBehavior;
ConnectionStoredProcMenu.prototype.deleteServerBehavior = ConnectionStoredProcMenu_deleteServerBehavior;
ConnectionStoredProcMenu.prototype.analyzeServerBehavior = ConnectionStoredProcMenu_analyzeServerBehavior;


//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI()
//
// DESCRIPTION:
//   Locates the Connection Menu control which is needed for this
//   control, and adds a callback to its event handler.
//
// ARGUMENTS:
//   connectionControl - JS Object - the connection control to 
//     use for this stored procedure control
//
// RETURNS:
//   boolean - false if could not retrieve stored procedures for the connection.
//--------------------------------------------------------------------

function ConnectionStoredProcMenu_initializeUI(connectionControl) 
{
  var retVal = true;

  // set the connection control
  if (connectionControl != null) 
  {
    this.connection = connectionControl;
  }
  else if (window.MM_CONNECTION_MENU)
  {
    this.connection = window.MM_CONNECTION_MENU
  }
  else
  {
    alert(MM.MSG_MENU_ERROR_2); 
  }

  this.listControl = new ListControl(this.paramName);

  var procedureNames = new Array();

  if (this.connection)
  {
    var connectionName = this.connection.getValue();
    procedureNames = this.findAllStoredProcNames(connectionName);
  }

  if (procedureNames.length && procedureNames.length > 0)
  {
    this.listControl.setAll(procedureNames, procedureNames);
    this.haveProcedures = true;
  }
  else
  {
    this.listControl.setAll(new Array(""),new Array(""));
    this.haveProcedures = false;
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
//   boolean - false if could not find stored procedures for the connection.
//--------------------------------------------------------------------
function ConnectionStoredProcMenu_updateUI(control, event)
{
  var retVal = true;
  
  if (this.connection && control == this.connection)
  {
    var connectionName = this.connection.getValue();

    var procedureNames = this.findAllStoredProcNames(connectionName);

    if (procedureNames.length && procedureNames.length > 0)
    {
      this.listControl.setAll(procedureNames,procedureNames);
      this.listControl.setIndex(0);
      this.haveProcedures = true;
    }
    else
    {
      this.listControl.setAll(new Array(""),new Array(""));
      this.listControl.set(MM.LABEL_NoProcedures, 0); 
      this.haveProcedures = false;
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
//   Returns the currently selected stored procedure name
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function ConnectionStoredProcMenu_getValue()
{
  var retVal = this.listControl.getValue();

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   pickValue
//
// DESCRIPTION:
//   Select the stored procedure with the given name
//
// ARGUMENTS:
//   procedureName - string - the procedure to select
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function ConnectionStoredProcMenu_pickValue(procedureName)
{
  var retVal = false;
  
  if (this.connection) 
  {    
    // Perform a case insensitive search in the list control. Also, the storedproc
    //   menu prepends the schema name on the storedproc names. If searchValue is
    //   an existing storedproc name without the schema name, we still want to accept it. 
    var compareFtn = 
      function (object, searchValue)
      {
        var theObject = String(object).toUpperCase();
        var theSearchValue = String(searchValue).toUpperCase();
        if (   theObject == theSearchValue
            || theObject.indexOf("." + theSearchValue) != -1
           )
        {
          return true;
        }
        else
        {
          return false;
        }
      }
    retVal = this.listControl.pickValue(procedureName, compareFtn);

    if (retVal && window.updateUI != null)
    {
      window.updateUI(this.paramName, "onPickValue");
    }
  }
  
  return retVal;
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

function ConnectionStoredProcMenu_applyServerBehavior(sbObj, paramObj) 
{
  var retVal = "";
  
  var procedureName  = this.listControl.getValue();
  
  if (!procedureName || procedureName.indexOf("MM_ERROR") != -1)
  {
    retVal = MM.MSG_NoStoredProcText;
  }
  
  paramObj[this.paramName] = procedureName;
  
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
function ConnectionStoredProcMenu_inspectServerBehavior(sbObj)
{
  var retVal = false;
  
  var procedureName = sbObj.parameters[this.paramName];

  retVal = this.pickValue(procedureName);

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
function ConnectionStoredProcMenu_findServerBehaviors(paramObj)
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
function ConnectionStoredProcMenu_canApplyServerBehavior(sbObj)
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
function ConnectionStoredProcMenu_deleteServerBehavior(sbObj)
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
function ConnectionStoredProcMenu_analyzeServerBehavior(sbObj, allRecs)
{
  // nothing needed here
}


//-------------------------------------------------------------------
// FUNCTION:
//   findAllStoredProcNames
//
// DESCRIPTION:
//   Returns the list of stored procedures found in the given connection
//
// ARGUMENTS:
//   connectionName - string - the connection to use
//
// RETURNS:
//   JavaScript array - stored procedure names
//--------------------------------------------------------------------

function ConnectionStoredProcMenu_findAllStoredProcNames(connectionName)
{
  var sortedSPList = new Array();

  if (MMDB.supportsProcedures(connectionName))
  {
    var proceduresForSelCon = MMDB.getProcedures(connectionName); 
   
    if (proceduresForSelCon.length)
    {
      for (var z = 0; z < proceduresForSelCon.length; ++z)
      {
        var procDisplayName = dwscripts.trim(proceduresForSelCon[z].procedure);
      
	    if (proceduresForSelCon[z].schema)
        {
          procDisplayName = dwscripts.trim(proceduresForSelCon[z].schema) + "." 
                                + procDisplayName;
        }

        sortedSPList.push(procDisplayName); 
      }
    
	  sortedSPList = sortedSPList.sort(); 
    }
  }

  return sortedSPList;
}

