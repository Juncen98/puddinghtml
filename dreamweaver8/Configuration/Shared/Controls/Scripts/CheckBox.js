//SHARE-IN-MEMORY=true
// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   CheckBox
//
// DESCRIPTION:
//   This class represents a simple checkbox control
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//
//   initializeUI()
//   findServerBehaviors(paramObj)
//   canApplyServerBehavior(sbObj)
//   applyServerBehavior(sbObj, paramObj)
//   inspectServerBehavior(sbObj)
//   deleteServerBehavior(sbObj)
//   analyzeServerBehavior(sbObj, allRecs)
//
//   setCheckedState(isChecked)
//   getCheckedState()
//   enable()
//
//--------------------------------------------------------------------




//-------------------------------------------------------------------
// FUNCTION:
//   CheckBox
//
// DESCRIPTION:
//   Constructor function for the checkbox control
//
// ARGUMENTS:
//   behaviorName - the simple name of the behavior html file
//   paramName - the name of the parameter to be controlled.
//
// RETURNS:
//--------------------------------------------------------------------

function CheckBox(behaviorName, paramName) 
{
  this.behaviorName = behaviorName;
  this.paramName = paramName;
  this.checkBox = null;
}

//public methods
CheckBox.prototype.initializeUI = CheckBox_initializeUI;
CheckBox.prototype.findServerBehaviors = CheckBox_findServerBehaviors;
CheckBox.prototype.canApplyServerBehavior = CheckBox_canApplyServerBehavior;
CheckBox.prototype.applyServerBehavior = CheckBox_applyServerBehavior;
CheckBox.prototype.inspectServerBehavior = CheckBox_inspectServerBehavior;
CheckBox.prototype.deleteServerBehavior = CheckBox_deleteServerBehavior;
CheckBox.prototype.analyzeServerBehavior = CheckBox_analyzeServerBehavior;
CheckBox.prototype.setCheckedState = CheckBox_setCheckedState;
CheckBox.prototype.getCheckedState = CheckBox_getCheckedState;
CheckBox.prototype.enable = CheckBox_enable;

//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI()
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function CheckBox_initializeUI() 
{
  this.checkBox = dwscripts.findDOMObject(this.paramName);
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
function CheckBox_findServerBehaviors(paramObj) 
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
function CheckBox_canApplyServerBehavior(sbObj) 
{
  var retVal = true;
  
  return retVal;
}



//--------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//   Sets the parameter to the value property of the checkbox.
//
// ARGUMENTS:
//   sbObj - ServerBehavior objct - the previous SB instance
//   paramObj - JavaScript Object - the parameter values array
//
// RETURNS:
//   boolean - true is successful
//--------------------------------------------------------------------
function CheckBox_applyServerBehavior(sbObj, paramObj) 
{

  var retVal = "";
  
  if (this.checkBox.checked)
  {
    paramObj[this.paramName] = this.checkBox.value;
  }
  else
  {
    paramObj[this.paramName] = "";
  }
  
  return retVal;
}



//--------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//   Sets the checkbox control based on the parameter value
//
// ARGUMENTS:
//   sbObj - ServerBehvaior object
//
// RETURNS:
//   boolean - true if successful
//--------------------------------------------------------------------
function CheckBox_inspectServerBehavior(sbObj) 
{
  var retVal = "";
  
  var checkBoxState = sbObj.parameters[this.paramName];
  
  if (checkBoxState == this.checkBox.value || checkBoxState == true || 
      checkBoxState == "true" || checkBoxState == 1)
  {
    this.checkBox.setAttribute("checked","true");
  }
  else
  {
    this.checkBox.removeAttribute("checked");
  }
 
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
function CheckBox_deleteServerBehavior(sbObj)
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
function CheckBox_analyzeServerBehavior(sbObj, allRecs) 
{
  // nothing needed here
}


//--------------------------------------------------------------------
// FUNCTION:
//   setCheckedState
//
// DESCRIPTION:
//   Sets the checkbox to the given state
//
// ARGUMENTS: 
//   isChecked - boolean - true to check the checkbox, false otherwise
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function CheckBox_setCheckedState(isChecked) 
{
  if (this.checkBox)
  {
    if (isChecked)
    {
      this.checkBox.setAttribute("checked","true");
    }
    else
    {
      this.checkBox.removeAttribute("checked");
    }
  }
}



//--------------------------------------------------------------------
// FUNCTION:
//   getCheckedState
//
// DESCRIPTION:
//   Gets the checked state
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//   true or false 
//--------------------------------------------------------------------
function CheckBox_getCheckedState()
{
  var retValue = undefined;

  if (this.checkBox)
  {
    if (this.checkBox.getAttribute("checked"))
    {
      retValue = true;
    }
    else 
    {
      retValue = false;
    } 
  }
  
  return retValue; 
}

//--------------------------------------------------------------------
// FUNCTION:
//   CheckBox_enable
//
// DESCRIPTION:
//   Enables or disables the check box
//
// ARGUMENTS:
//   enable - boolean (true to enable, false to disable)
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function CheckBox_enable(enable)
{
  if (this.checkBox)
  {
    if ((enable != null) && !enable)
    {
      this.checkBox.setAttribute("disabled", "true");
    }
    else
    {
      this.checkBox.removeAttribute("disabled");
    }
  }
}
