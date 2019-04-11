//SHARE-IN-MEMORY=true
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   ConnectionColumnMenu
//
// DESCRIPTION:
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//
//   initializeUI()
//   updateUI(control, event)
//
//   getValue()
//   getType()
//   getValues()
//   pickValue(columnName)
//   pickValues(columnNames)
//   setDisabled(theValue, clearSelection)
//
//   applyServerBehavior(sbObj, paramObj)
//   inspectServerBehavior(sbObj)
//
//--------------------------------------------------------------------


//-------------------------------------------------------------------
// FUNCTION:
//  ConnectionColumnMenu
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------

function ConnectionColumnMenu(behaviorName, paramName, empty, includeNoneOption) 
{
  this.behaviorName = behaviorName;
  this.paramName = paramName;
  
  this.connection = '';  // this is a pointer to a Connection instance
  this.table = '';       // this is a pointer to a Connection Table instance
  
  this.haveColumns = false;

  this.includeNoneOption = (includeNoneOption != null) ? includeNoneOption :  false;
  
  this.typesMap = null;
  
  this.listControl = '';
}

//public methods
ConnectionColumnMenu.prototype.initializeUI = ConnectionColumnMenu_initializeUI;
ConnectionColumnMenu.prototype.updateUI = ConnectionColumnMenu_updateUI;

ConnectionColumnMenu.prototype.getValue = ConnectionColumnMenu_getValue;
ConnectionColumnMenu.prototype.getValues = ConnectionColumnMenu_getValues;
ConnectionColumnMenu.prototype.pickValue = ConnectionColumnMenu_pickValue;
ConnectionColumnMenu.prototype.pickValues = ConnectionColumnMenu_pickValues;
ConnectionColumnMenu.prototype.getType = ConnectionColumnMenu_getType;
ConnectionColumnMenu.prototype.setDisabled = ConnectionColumnMenu_setDisabled;

ConnectionColumnMenu.prototype.applyServerBehavior = ConnectionColumnMenu_applyServerBehavior;
ConnectionColumnMenu.prototype.inspectServerBehavior = ConnectionColumnMenu_inspectServerBehavior;

//private methods
ConnectionColumnMenu.prototype.findAllColumnNames = ConnectionColumnMenu_findAllColumnNames;

// no ops
ConnectionColumnMenu.prototype.findServerBehaviors = ConnectionColumnMenu_findServerBehaviors;
ConnectionColumnMenu.prototype.canApplyServerBehavior = ConnectionColumnMenu_canApplyServerBehavior;
ConnectionColumnMenu.prototype.deleteServerBehavior = ConnectionColumnMenu_deleteServerBehavior;
ConnectionColumnMenu.prototype.analyzeServerBehavior = ConnectionColumnMenu_analyzeServerBehavior;



//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI()
//
// DESCRIPTION:
//   initializes the list control with the names of the columns
//
// ARGUMENTS: 
//   elementName - string - (optional) the name of the form control, if it
//     differs from the parameter name
//   connTableMenuObj - JS Object - (optional) the connection 
//     table control to use for this column control
//
// RETURNS:
//--------------------------------------------------------------------

function ConnectionColumnMenu_initializeUI(elementName, connTableMenuObj) 
{
  if (connTableMenuObj != null)
  {
    this.table = connTableMenuObj;
    this.connection = this.table.connection;
  }
  else if (window.MM_CONNECTION_TABLE_MENU)
  {
    this.table = window.MM_CONNECTION_TABLE_MENU;
    this.connection = this.table.connection;
  }
  else
  {
    alert(MM.MSG_MENU_ERROR_1); 
  }
   
  var elemName = (elementName) ? elementName : this.paramName;
  
  this.listControl = new ListControl(elemName);
  
  if (this.table.connection && this.table)
  {
    var connectionName = this.table.connection.getValue();
    var tableName = this.table.getValue();

    var columnNames = this.findAllColumnNames(connectionName, tableName);

    if (columnNames.length && columnNames.length > 0)
    {
      if (this.includeNoneOption)
      {
        var noneArray = new Array(MM.LABEL_None);
        var blankArray = new Array("");
        
        this.listControl.setAll(noneArray.concat(columnNames), blankArray.concat(columnNames));
      }                                                    
      else
      {
        this.listControl.setAll(columnNames,columnNames);
      }
      
      this.haveColumns = true;
    }
    else
    {
      if (this.includeNoneOption)
      {
        this.listControl.setAll(new Array(MM.LABEL_None),new Array(""));
      }
      else
      {
        this.listControl.setAll(new Array(""),new Array(""));
      }
      
      this.haveColumns = false;
    }

    if (this.includeNoneOption)
    {
      this.listControl.setIndex(0);
    }
    else
    {
      this.listControl.setIndex(-1);
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateUI()
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------

function ConnectionColumnMenu_updateUI(control, event)
{
  if (this.table && control == this.table) 
  {
    var connectionName = this.table.connection.getValue();
    var tableName = this.table.getValue();

    var columnNames = this.findAllColumnNames(connectionName, tableName);

    if (columnNames.length && columnNames.length > 0)
    {
      var origValue = this.listControl.getValue();
      
      if (this.includeNoneOption)
      {
        var noneArray = new Array(MM.LABEL_None);
        var blankArray = new Array("");
        
        this.listControl.setAll(noneArray.concat(columnNames), blankArray.concat(columnNames));
      }
      else
      {
        this.listControl.setAll(columnNames,columnNames);
      }
      
      this.haveColumns = true;

      if (!this.listControl.pickValue(origValue))
      {
        this.listControl.setIndex(0);
      }
    }
    else
    {
      if (this.includeNoneOption)
      {
        this.listControl.setAll(new Array(MM.LABEL_None),new Array(""));
      }
      else
      {
        this.listControl.setAll(new Array(MM.LABEL_NoColumns), new Array(""));
        this.listControl.object.selectedIndex = -1; 
      }
      
      this.haveColumns = false;
    }

    if (window.updateUI != null)
    {
      window.updateUI(this.paramName, "onUpdateUI");
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   getValue
//
// DESCRIPTION:
//   Returns the currently selected column
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function ConnectionColumnMenu_getValue()
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
//   getType
//
// DESCRIPTION:
//   Returns the column type for the currently selected column
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - column type as returned by MMDB
//--------------------------------------------------------------------

function ConnectionColumnMenu_getType()
{
  var retVal = "";
  
  if (this.typesMap != null)
  {
    var value = this.getValue();
    
    if (this.typesMap[value] != null)
    {
      retVal = this.typesMap[value];
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getValues
//
// DESCRIPTION:
//   For a multiple select list, it returns an array of the selected
//   columns
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   array of strings
//--------------------------------------------------------------------

function ConnectionColumnMenu_getValues()
{
  var retVal = new Array();

  for (var i=0; i < this.listControl.object.options.length; i++)
  {
    if (this.listControl.object.options[i].selected)
    {
      retVal.push(this.listControl.object.options[i].value);
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   pickValue
//
// DESCRIPTION:
//   Selects the given column name from the list of column names.
//   Returns false if the value is not found
//
// ARGUMENTS:
//   columnName - string - the name of the column to select
//
// RETURNS:
//   boolean - false if not found
//--------------------------------------------------------------------

function ConnectionColumnMenu_pickValue(columnName)
{
  // Perform a case insensitive search in the list control. In SQL, column and table 
  //   names are case insensitive.
  var retVal = this.listControl.pickValue(columnName, 
    new Function("object,searchValue", "return (String(object).toUpperCase() == String(searchValue).toUpperCase());"));

  if (retVal && window.updateUI != null)
  {
    window.updateUI(this.paramName, "onPickValue");
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   pickValues
//
// DESCRIPTION:
//   Selects the given column names from the list of column names.
//   Returns false if the values are not found
//
// ARGUMENTS:
//   columnNames - array of strings - the names of the columns to select
//
// RETURNS:
//   boolean - false if not found
//--------------------------------------------------------------------

function ConnectionColumnMenu_pickValues(columnNames)
{
  var retVal = false;

  for (var i=0; i < this.listControl.object.options.length; i++)
  {
    var option = this.listControl.object.options[i].value;

    // Perform a case insensitive search in the list control. In SQL, column and table 
    //   names are case insensitive.
    if (dwscripts.findInArray(columnNames, option, 
        new Function("object,searchValue", "return (String(object).toUpperCase() == String(searchValue).toUpperCase());")) != -1
       )
    {
      this.listControl.object.options[i].selected = true;
      retVal = true;
    }
    else
    {
      this.listControl.object.options[i].selected = false;
    }
  }

  if (retVal && window.updateUI != null)
  {
    window.updateUI(this.paramName, "onPickValues");
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   setDisabled
//
// DESCRIPTION:
//   Enables or disables the list menu
//
// ARGUMENTS:
//   theValue - boolean - true to disable, false to enable
//   clearSelection - boolean - clear the selection when disabling
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function ConnectionColumnMenu_setDisabled(theValue, clearSelection)
{
  if (this.listControl)
  {
    if (theValue && clearSelection)
    {
      this.listControl.object.selectedIndex = -1;
    }
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
function ConnectionColumnMenu_applyServerBehavior(sbObj, paramObj, emptyMessage) 
{
  var retVal = "";
  
  var columnName  = this.listControl.getValue();
  
  if (!columnName || columnName.indexOf("MM_ERROR") != -1) 
  {
    if (emptyMessage)
    {
      retVal = emptyMessage;
    }
    else
    {
      retVal = MM.MSG_NeedColumn;
    }
  }
  
  paramObj[this.paramName] = columnName;
  
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
function ConnectionColumnMenu_inspectServerBehavior(sbObj, notFoundMsg)
{
  var retVal = false;
  
  var columnName = sbObj.parameters[this.paramName];

  retVal = this.pickValue(columnName);

  if (!retVal && this.haveColumns) 
  {
    if (notFoundMsg)
    {
      alert(notFoundMsg);
    }
    else
    {
      alert(dwscripts.sprintf(MM.MSG_ColNotFound,columnName));
    }
  }

  return retVal;
}


//-------------------------------------------------------------------
// FUNCTION:
//   findAllColumnNames
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function ConnectionColumnMenu_findAllColumnNames(connName, tableName)
{
  var colNames = new Array();
  
  // store the types in case we need them later
  this.typesMap = new Object();
  
  var colsAndTypes = MMDB.getColumnAndTypeOfTable(connName,tableName);
  
  for (var i=0; i < colsAndTypes.length; i+=2) 
  {
    colNames.push(colsAndTypes[i]);
    this.typesMap[colsAndTypes[i]] = colsAndTypes[i+1];
  }
  
  return colNames;
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
function ConnectionColumnMenu_findServerBehaviors(paramObj)
{
  // no op
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
function ConnectionColumnMenu_canApplyServerBehavior(sbObj)
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
function ConnectionColumnMenu_deleteServerBehavior(sbObj)
{
  // no op
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
function ConnectionColumnMenu_analyzeServerBehavior(sbObj, allRecs)
{
  // nothing needed here
}


