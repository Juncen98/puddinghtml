//SHARE-IN-MEMORY=true
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   NumericTextField
//
// DESCRIPTION:
//   This class represents a text field control
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//
//   initializeUI()
//   findServerBehaviors()
//   canApplyServerBehavior(sbObj)
//   applyServerBehavior(sbObj, paramObj, emptyMessage)
//   inspectServerBehavior(sbObj)
//   deleteServerBehavior(sbObj)
//   analyzeServerBehavior(sbObj, allRecs)
//
//   getValue()
//   setValue(theValue)
//   setDisabled(theValue)

//--------------------------------------------------------------------




//--------------------------------------------------------------------
// FUNCTION:
//   NumericTextField
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
function NumericTextField(behaviorName, paramName)
{
  this.behaviorName = behaviorName;
  this.paramName = paramName;
  
  this.textControl = '';
}

//public methods
NumericTextField.prototype.initializeUI = NumericTextField_initializeUI;
NumericTextField.prototype.findServerBehaviors = NumericTextField_findServerBehaviors;
NumericTextField.prototype.canApplyServerBehavior = NumericTextField_canApplyServerBehavior;
NumericTextField.prototype.applyServerBehavior = NumericTextField_applyServerBehavior;
NumericTextField.prototype.inspectServerBehavior = NumericTextField_inspectServerBehavior;
NumericTextField.prototype.deleteServerBehavior = NumericTextField_deleteServerBehavior;
NumericTextField.prototype.analyzeServerBehavior = NumericTextField_analyzeServerBehavior;

NumericTextField.prototype.getValue = NumericTextField_getValue;
NumericTextField.prototype.setValue = NumericTextField_setValue;
NumericTextField.prototype.setDisabled = NumericTextField_setDisabled


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
function NumericTextField_initializeUI()
{
  this.textControl = dwscripts.findDOMObject(this.paramName);
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
function NumericTextField_findServerBehaviors(paramObj) 
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
function NumericTextField_canApplyServerBehavior(sbObj)
{
  var retVal = true;
  
  return retVal;
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
function NumericTextField_applyServerBehavior(sbObj, paramObj, emptyMessage)
{
  var errStr = "";
  
  var theValue  = this.textControl.value;
  
  if (emptyMessage && !theValue) {
    errStr = emptyMessage;
  }
  
  if (this.textControl.getAttribute("disabled") != "true")
  {
    paramObj[this.paramName] = theValue;
  }
  else
  {
    paramObj[this.paramName] = "";
  }
  
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
function NumericTextField_inspectServerBehavior(sbObj)
{
  var retVal = true;
  
  var theValue = sbObj.parameters[this.paramName];
  
  this.textControl.value = theValue;
  
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
function NumericTextField_deleteServerBehavior(sbObj)
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
function NumericTextField_analyzeServerBehavior(sbObj, allRecs)
{
  // nothing needed here 
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
function NumericTextField_getValue()
{
  return this.textControl.value;
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
function NumericTextField_setValue(theValue)
{
  this.textControl.value = theValue;
}


//--------------------------------------------------------------------
// FUNCTION:
//   setDisabled
//
// DESCRIPTION:
//   Enables or disables the text field
//
// ARGUMENTS:
//   theValue - boolean - true to disable, false to enable
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function NumericTextField_setDisabled(theValue)
{
  this.textControl.setAttribute("disabled", theValue.toString());
}
