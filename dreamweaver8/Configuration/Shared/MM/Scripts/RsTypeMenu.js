//SHARE-IN-MEMORY=true
//Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   RsTypeMenu
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
//   RsTypeMenu
//
// DESCRIPTION:
//   Constructor function for the RsTypeMenu control
//
// ARGUMENTS:
//   behaviorName - the name of the behavior using this control
//   paramName - the name of the parameter that is being set
//   rsIndex - index of the recordset type
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function RsTypeMenu(behaviorName, paramName, rsIndex) 
{
  this.behaviorName = behaviorName;
  this.paramName = paramName;
  
  this.listControl = '';

  this.isRsTypeMenu = true;
	this.rsIndex = rsIndex;
}

//public methods
RsTypeMenu.prototype.initializeUI = RsTypeMenu_initializeUI;

RsTypeMenu.prototype.getValue = RsTypeMenu_getValue;
RsTypeMenu.prototype.pickValue = RsTypeMenu_pickValue;
RsTypeMenu.prototype.setIndex = RsTypeMenu_setIndex;
RsTypeMenu.prototype.setDisabled = RsTypeMenu_setDisabled;
RsTypeMenu.prototype.updateVisiblity = RsTypeMenu_updateVisiblity;

RsTypeMenu.prototype.applyServerBehavior = RsTypeMenu_applyServerBehavior;
RsTypeMenu.prototype.inspectServerBehavior = RsTypeMenu_inspectServerBehavior;

RsTypeMenu.prototype.launchConnectionDialog = RsTypeMenu_launchConnectionDialog;

// no ops
RsTypeMenu.prototype.findServerBehaviors = RsTypeMenu_findServerBehaviors;
RsTypeMenu.prototype.canApplyServerBehavior = RsTypeMenu_canApplyServerBehavior;
RsTypeMenu.prototype.deleteServerBehavior = RsTypeMenu_deleteServerBehavior;
RsTypeMenu.prototype.analyzeServerBehavior = RsTypeMenu_analyzeServerBehavior;


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

function RsTypeMenu_initializeUI(elementName) 
{ 
  var retValue = true; 

  var elemName = (elementName) ? elementName : this.paramName;
  
  this.listControl = new ListControl(elemName);

	tmArray = new Array();
	tmArrayVal = new Array();
	for (i = 0;i < MM.rsTypes[this.rsIndex].subTypes.length;i++) {
		tmArray.push(MM.rsTypes[this.rsIndex].subTypes[i].name);
		tmArrayVal.push(MM.rsTypes[this.rsIndex].subTypes[i].value);
	}
  this.listControl.setAll(tmArray,tmArrayVal);
  this.setIndex(0);
  
  this.updateVisiblity();
  
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

function RsTypeMenu_getValue()
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
//   Select the connection with the given name
//
// ARGUMENTS:
//   connName - string - the connection to select
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function RsTypeMenu_pickValue(connName)
{
  retVal = false;

  //find the name in the list
  for (var i=0; i < this.listControl.getLen() ; i++) 
  {
    if (this.listControl.getValue(i) == connName) 
    {
      retVal = this.setIndex(i);

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
//   setIndex
//
// DESCRIPTION:
//   pass through to list control
//
// ARGUMENTS:
//   theIndex - integer - the index to select within the list (zero based
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function RsTypeMenu_setIndex(theIndex)
{
	return this.listControl.setIndex(theIndex);
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

function RsTypeMenu_setDisabled(theValue)
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
//   updateVisiblity
//
// DESCRIPTION:
//   shows or hides the control based on what's in the list
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function RsTypeMenu_updateVisiblity()
{
	//show this control only of there's something to pick
	if (this.listControl.getLen() > 1) {
		this.listControl.object.visibility = 'visible';
	}
	else {
		this.listControl.object.visibility = 'hidden';
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

function RsTypeMenu_applyServerBehavior(sbObj, paramObj, emptyMessage)
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
	alert(connName);

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

function RsTypeMenu_inspectServerBehavior(sbObj, notFoundMsg)
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

function RsTypeMenu_launchConnectionDialog()
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
function RsTypeMenu_findServerBehaviors(paramObj) 
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
function RsTypeMenu_canApplyServerBehavior(sbObj) 
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
function RsTypeMenu_deleteServerBehavior(sbObj) 
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
function RsTypeMenu_analyzeServerBehavior(sbObj, allRecs) 
{
  // nothing needed here
}
