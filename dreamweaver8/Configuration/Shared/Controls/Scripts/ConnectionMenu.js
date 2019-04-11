//SHARE-IN-MEMORY=true
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   ConnectionMenu
//
// DESCRIPTION:
//   Creates a menu of the current connections
//   The menu consists of menu labels and menu values
//   The labels are a user-friendly list of connections
//   The values are the actual connection paths.
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//
//   initializeUI()
//
//   getValue()
//   getPath()
//   pickValue(connName)
//   setDisabled(theValue)
//
//   applyServerBehavior(sbObj, paramObj)
//   inspectServerBehavior(sbObj)
//
//   launchConnectionDialog()
//
//--------------------------------------------------------------------


//--------------------------------------------------------------------
// FUNCTION:
//   ConnectionMenu
//
// DESCRIPTION:
//   Constructor function for the ConnectionMenu control
//
// ARGUMENTS:
//   behaviorName - the name of the behavior using this control
//   paramName - the name of the parameter that is being set
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function ConnectionMenu(behaviorName, paramName, empty) 
{
  this.behaviorName = behaviorName;
  this.paramName = paramName;
  
  this.listControl = '';

  this.isConnectionMenu = true;
  
  window.MM_CONNECTION_MENU = this;
}

//public methods
ConnectionMenu.prototype.initializeUI = ConnectionMenu_initializeUI;

ConnectionMenu.prototype.getValue = ConnectionMenu_getValue;
ConnectionMenu.prototype.getPath = ConnectionMenu_getPath;
ConnectionMenu.prototype.pickValue = ConnectionMenu_pickValue;
ConnectionMenu.prototype.setDisabled = ConnectionMenu_setDisabled;

ConnectionMenu.prototype.applyServerBehavior = ConnectionMenu_applyServerBehavior;
ConnectionMenu.prototype.inspectServerBehavior = ConnectionMenu_inspectServerBehavior;

ConnectionMenu.prototype.launchConnectionDialog = ConnectionMenu_launchConnectionDialog;

// no ops
ConnectionMenu.prototype.findServerBehaviors = ConnectionMenu_findServerBehaviors;
ConnectionMenu.prototype.canApplyServerBehavior = ConnectionMenu_canApplyServerBehavior;
ConnectionMenu.prototype.deleteServerBehavior = ConnectionMenu_deleteServerBehavior;
ConnectionMenu.prototype.analyzeServerBehavior = ConnectionMenu_analyzeServerBehavior;


//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI()
//
// DESCRIPTION:
//   initializes the list control with the names of the connections
//
// ARGUMENTS:
//   elementName - string - (optional) the name of the form control, if it
//     differs from the parameter name
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function ConnectionMenu_initializeUI(elementName) 
{ 
  var retValue = true; 

  var elemName = (elementName) ? elementName : this.paramName;
  
  this.listControl = new ListControl(elemName);

  var noneArray = new Array(MM.LABEL_None);
  var blankArray = new Array("");

  var connNames = MMDB.getConnectionList(); 
    
  this.listControl.setAll(noneArray.concat(connNames), blankArray.concat(connNames));
  this.listControl.setIndex(0);
  
  return retValue; 
}


//--------------------------------------------------------------------
// FUNCTION:
//   getValue
//
// DESCRIPTION:
//   Returned the currently selected name
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function ConnectionMenu_getValue()
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
//   getPath
//
// DESCRIPTION:
//   Returns the path of the currently selected connection
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function ConnectionMenu_getPath()
{
  var retVal = "";

  var connName = this.getValue();
  
  retVal = dwscripts.getConnectionURL(connName);
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   pickValue
//
// DESCRIPTION:
//   Select the connection with the given name
//
// ARGUMENTS:
//   connName - string - the connection to select
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function ConnectionMenu_pickValue(connName)
{
  retVal = false;

  //find the name in the list
  for (var i=0; i < this.listControl.getLen() ; i++) 
  {
    if (this.listControl.getValue(i) == connName) 
    {
      retVal = this.listControl.setIndex(i);

      if (window.updateUI != null)
      {
        window.updateUI(this.paramName, "onPickValue");
      }

      break;
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

function ConnectionMenu_setDisabled(theValue)
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
//   Add the selected connection path to the list of parameters
//
// ARGUMENTS: 
//   sbObj - ServerBehavior objct - the previous SB instance
//   paramObj - JavaScript Object - the parameter values array
//
// RETURNS:
//   boolean - true is successful
//--------------------------------------------------------------------

function ConnectionMenu_applyServerBehavior(sbObj, paramObj, emptyMessage)
{
  // NOTE: need to handle the case where the include should be
  //       changed rather than adding a new one.
  
  var retVal = "";
  
  var connName = this.listControl.getValue();
  
  if (!connName) 
  {
    if (emptyMessage)
    {
      retVal = emptyMessage;
    }
    else
    {
      retVal = MM.MSG_NoConnection;
    }
  } 

  paramObj[this.paramName] = connName;
   
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//   Sets the selected connection, based on the parameters for the
//   given ServerBehavior
//
// ARGUMENTS:
//   sbObj - ServerBehvaior object
//   notFoundMsg - string - and alternate error message to be displayed
//     if the given connection cannot be found
//
// RETURNS:
//   boolean - true if successful
//--------------------------------------------------------------------

function ConnectionMenu_inspectServerBehavior(sbObj, notFoundMsg)
{
  var retVal = "";
  
  var connName = sbObj.parameters[this.paramName];

  retVal = this.pickValue(connName);
  
  if (!retVal) // if connection name can't be found
  {
    // If "" passed in, don't display any error.
    if (notFoundMsg == null) 
    {
      alert(dwscripts.sprintf(MM.MSG_ConnNotFound,connName)); // display specific error msg
    } 
    else if (notFoundMsg.length) 
    {
      alert(notFoundMsg);        // display generic error msg
    }
  }
    
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   launchConnectionDialog
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------

function ConnectionMenu_launchConnectionDialog()
{
  var pickedValue = this.listControl.getValue(); // store current selection
  
  MMDB.showConnectionMgrDialog();
  
  var connNames = MMDB.getConnectionList();

  var noneArray = new Array(MM.LABEL_None);
  var blankArray = new Array("");

  this.listControl.setAll(noneArray.concat(connNames), blankArray.concat(connNames));

  this.listControl.pickValue(pickedValue);
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
function ConnectionMenu_findServerBehaviors(paramObj) 
{
  // nothing needed here
}


//--------------------------------------------------------------------
// FUNCTION:
//   canApplyServerBehavior
//
// DESCRIPTION:
//   The user can define new connections, so nothing is needed here.
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function ConnectionMenu_canApplyServerBehavior(sbObj) 
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
function ConnectionMenu_deleteServerBehavior(sbObj) 
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
function ConnectionMenu_analyzeServerBehavior(sbObj, allRecs) 
{
  // nothing needed here
}
