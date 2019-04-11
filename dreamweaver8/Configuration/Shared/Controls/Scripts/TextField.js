//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   TextField
//
// DESCRIPTION:
//   This class represents a text field control
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//
//   initializeUI()
//
//   getValue()
//   setValue(theValue)
//   setDisabled(theValue)
//
//   applyServerBehavior(sbObj, paramObj, emptyMessage)
//   inspectServerBehavior(sbObj)
//
//--------------------------------------------------------------------




//--------------------------------------------------------------------
// FUNCTION:
//   TextField
//
// DESCRIPTION:
//   This is the contructor function for the text field class
//
// ARGUMENTS:
//   behaviorName - string - the simple name of the server behavior
//     this control is part of
//   paramName - string - the name of the parameter controled by this
//     field
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function TextField(behaviorName, paramName)
{
  this.behaviorName = behaviorName;
  this.paramName = paramName;
  
  this.textControl = '';
}

//public methods
TextField.prototype.initializeUI = TextField_initializeUI;

TextField.prototype.getValue = TextField_getValue;
TextField.prototype.setValue = TextField_setValue;
TextField.prototype.setDisabled = TextField_setDisabled;

TextField.prototype.applyServerBehavior = TextField_applyServerBehavior;
TextField.prototype.inspectServerBehavior = TextField_inspectServerBehavior;

// no ops
TextField.prototype.findServerBehaviors = TextField_findServerBehaviors;
TextField.prototype.canApplyServerBehavior = TextField_canApplyServerBehavior;
TextField.prototype.deleteServerBehavior = TextField_deleteServerBehavior;
TextField.prototype.analyzeServerBehavior = TextField_analyzeServerBehavior;



//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI()
//
// DESCRIPTION:
//   Finds the control within the dom of the object
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function TextField_initializeUI()
{
  this.textControl = dwscripts.findDOMObject(this.paramName);

  if (!this.textControl)
  {
    throw dwscripts.sprintf(MM.MSG_unknownNodeObject, this.paramName);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   getValue
//
// DESCRIPTION:
//   Returns the current value of the text field
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function TextField_getValue()
{
  return (this.textControl.value)?this.textControl.value:"";
}



//--------------------------------------------------------------------
// FUNCTION:
//   setValue
//
// DESCRIPTION:
//   Sets the value of the text field
//
// ARGUMENTS:
//   theValue - string - the value to set the control to
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function TextField_setValue(theValue)
{
  this.textControl.value = theValue;
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
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function TextField_setDisabled(theValue)
{
  if (this.textControl)
  {
    if (theValue && !this.textControl.getAttribute("disabled"))
    {
      this.textControl.setAttribute("disabled", true);
    }
    else if (!theValue && this.textControl.getAttribute("disabled"))
    {
      this.textControl.removeAttribute("disabled");
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//   Adds the value of the text field to the parameter object
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - the previous instance of this SB
//   paramObj - JavaScript object - the object to add the parameter
//     value to
//   emptyMessage - string - the message to display if the field
//     is empty
//
// RETURNS:
//   string - error message if there are problems, or empty string
//--------------------------------------------------------------------
function TextField_applyServerBehavior(sbObj, paramObj, emptyMessage)
{
  var errStr = "";
  
  var theValue = "";
  
  if (!this.textControl.getAttribute("disabled"))
  {
    theValue  = this.textControl.value;
    
    if (emptyMessage && !theValue) 
    {
      errStr = emptyMessage;
    }  
  }
  
  paramObj[this.paramName] = theValue;
  
  return errStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//   Extracts the value for this control from the SB object
//
// ARGUMENTS: 
//   sbObj - ServerBehavior object - an instance of a server behavior
//
// RETURNS:
//   boolean - true if successful, false otherwise
//--------------------------------------------------------------------
function TextField_inspectServerBehavior(sbObj)
{
  var retVal = true;
  
  var theValue = sbObj.parameters[this.paramName];
  
  this.textControl.value = (theValue)?theValue:"";
  
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
function TextField_findServerBehaviors(paramObj) 
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
function TextField_canApplyServerBehavior(sbObj)
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
function TextField_deleteServerBehavior(sbObj)
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
function TextField_analyzeServerBehavior(sbObj, allRecs)
{
  // nothing needed here 
}


