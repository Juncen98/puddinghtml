//SHARE-IN-MEMORY=true
// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   ListMenu
//
// DESCRIPTION:
//   This class represents a List or Menu control with static values.
//   It is suitable for use with the Server Behavior Builder, or
//   as a stand-along control
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//
//   initializeUI(labelArray, valueArray)
//
//   getValue()
//   pickValue(theValue)
//   setDisabled(theValue)
//
//   applyServerBehavior(sbObj, paramObj, emptyErrorMessage)
//   inspectServerBehavior(sbObj) 
//
//--------------------------------------------------------------------




//--------------------------------------------------------------------
// FUNCTION:
//   ListMenu
//
// DESCRIPTION:
//   Constructor function for the ListMenu control
//
// ARGUMENTS:
//   behaviorName - the name of the behavior using this control
//   paramName - the name of the parameter that is being set
//   labelArr(optional) -- labels for the menu options
//   valueArr(optional) -- values for the menu options
//
// RETURNS:
//--------------------------------------------------------------------

function ListMenu(behaviorName, paramName) 
{
  this.behaviorName = behaviorName;
  this.paramName = paramName;
  
  this.listControl = '';
}

// public methods
ListMenu.prototype.initializeUI = ListMenu_initializeUI;

ListMenu.prototype.getValue = ListMenu_getValue;
ListMenu.prototype.pickValue = ListMenu_pickValue;
ListMenu.prototype.setDisabled = ListMenu_setDisabled;

ListMenu.prototype.applyServerBehavior = ListMenu_applyServerBehavior;
ListMenu.prototype.inspectServerBehavior = ListMenu_inspectServerBehavior;

// no ops
ListMenu.prototype.findServerBehaviors = ListMenu_findServerBehaviors;
ListMenu.prototype.canApplyServerBehavior = ListMenu_canApplyServerBehavior;
ListMenu.prototype.deleteServerBehavior = ListMenu_deleteServerBehavior;
ListMenu.prototype.analyzeServerBehavior = ListMenu_analyzeServerBehavior;



//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//   Creates the list control object, and populates with the given
//   labels and values, or uses the HTML, if no values were passed.
//
// ARGUMENTS:
//   labelArray - array of strings - (optional) the labels to display
//     within the UI
//   valueArray - array of strings - (optional) the values to store
//     for each of the given label items
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function ListMenu_initializeUI(labelArray, valueArray) 
{
  this.listControl = new ListControl(this.paramName);
  
  if (labelArray)
  {
    if (valueArray)
    {
      this.listControl.setAll(labelArray, valueArray);
    }
    else
    {
      this.listControl.setAll(labelArray, this.labelArray);
    }
  }
  else
  {
    this.listControl.init();
    
    // now check to see if the list has any values
    var found = false;
    for (var i=0; i < this.listControl.valueList.length; i++)
    {
      if (this.listControl.valueList[i] != '')
      {
        found = true;
      }
    }
    
    // if no values are found, set them equal to the labels
    if (!found)
    {
      for (var i=0; i < this.listControl.valueList.length; i++)
      {
        this.listControl.valueList[i] = this.listControl.list[i];
      }
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   getValue
//
// DESCRIPTION:
//   Returns the currently selected value
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function ListMenu_getValue()
{
  return this.listControl.getValue();
}


//--------------------------------------------------------------------
// FUNCTION:
//   pickValue
//
// DESCRIPTION:
//   Selects the given value from the list of elements
//
// ARGUMENTS:
//   theValue - string - the value to select
//
// RETURNS:
//   boolean -  true if the value was found
//--------------------------------------------------------------------

function ListMenu_pickValue(theValue)
{
  var retVal = this.listControl.pickValue(theValue);

  if (retVal && window.updateUI != null)
  {
    window.updateUI(this.paramName, "onPick");
  }
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

function ListMenu_setDisabled(theValue)
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
//   Collects the currently selected value from the select list, and
//   adds it to the paramObj
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - the previous instance of this
//     behavior
//   paramObj - object - the list of parameter values to set
//   emptyErrorMessage - string - (optional) the error message to display
//     if the currently selected item has an empty value
//
// RETURNS:
//   string - empty if successful, or an error message
//--------------------------------------------------------------------

function ListMenu_applyServerBehavior(sbObj, paramObj, emptyErrorMessage)
{
  var retVal = "";
  
  paramObj[this.paramName] = this.listControl.getValue();

  if (emptyErrorMessage && paramObj[this.paramName] == "")
  {
    retVal = emptyErrorMessage;
  }
    
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//   Extracts a value from the ServerBehavior object and selects it in 
//   the list control.
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - the object to inspect
//
// RETURNS:
//   string - empty if successful
//--------------------------------------------------------------------

function ListMenu_inspectServerBehavior(sbObj) 
{
  var retVal = "";
  
  var value = sbObj.parameters[this.paramName];

  retVal = this.pickValue(value);
  
  var currText = this.listControl.get();
  retVal = this.listControl.pick(currText);
  
  if (!retVal)
  {
    //alert("Invalid value passed for parameter " + this.paramName);
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

function ListMenu_findServerBehaviors(paramObj)
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

function ListMenu_canApplyServerBehavior(sbObj, paramObj) 
{
  return true;
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

function ListMenu_deleteServerBehavior(sbObj)
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

function ListMenu_analyzeServerBehavior(sbObj, allRecs) 
{
  // nothing needed here 
}
