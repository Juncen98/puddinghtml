//SHARE-IN-MEMORY=true
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   RadioGroup
//
// DESCRIPTION:
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//
//   initializeUI()
//   updateUI()
//
//   getValue()
//   setValue(theValue)
//   getIndex()
//   setIndex(theIndex)
//
//   applyServerBehavior(sbObj, paramObj)
//   inspectServerBehavior(sbObj)
//
//--------------------------------------------------------------------



//-------------------------------------------------------------------
// FUNCTION:
//   RadioGroup
//
// DESCRIPTION:
//   Constructor function
//
// ARGUMENTS: 
//   behaviorName - the name of the behavior using this control
//   paramName - the name of the parameter that is being set
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function RadioGroup(behaviorName, paramName, empty) 
{
  this.behaviorName = behaviorName;
  this.paramName = paramName;
  
  this.radioObject = '';
}

//public methods
RadioGroup.prototype.initializeUI = RadioGroup_initializeUI;

RadioGroup.prototype.getValue = RadioGroup_getValue;
RadioGroup.prototype.pickValue = RadioGroup_pickValue;
RadioGroup.prototype.getIndex = RadioGroup_getIndex;
RadioGroup.prototype.setIndex = RadioGroup_setIndex;

RadioGroup.prototype.applyServerBehavior = RadioGroup_applyServerBehavior;
RadioGroup.prototype.inspectServerBehavior = RadioGroup_inspectServerBehavior;


//no ops
RadioGroup.prototype.findServerBehaviors = RadioGroup_findServerBehaviors;
RadioGroup.prototype.canApplyServerBehavior = RadioGroup_canApplyServerBehavior;
RadioGroup.prototype.deleteServerBehavior = RadioGroup_deleteServerBehavior;
RadioGroup.prototype.analyzeServerBehavior = RadioGroup_analyzeServerBehavior;



//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI()
//
// DESCRIPTION:
//   locates the radio group object
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function RadioGroup_initializeUI() 
{
  this.radioObject = dwscripts.findDOMObject(this.paramName); 
}


//--------------------------------------------------------------------
// FUNCTION:
//   getValue
//
// DESCRIPTION:
//   Returns the currently selected radio value
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------
function RadioGroup_getValue()
{
  var selVal = null;

  var selInd = this.getIndex();

  if (selInd != -1 && this.radioObject[selInd].value)
  {
    selVal = this.radioObject[selInd].value;
  }

  return selVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   pickValue
//
// DESCRIPTION:
//   Selects the radio button with the given value
//
// ARGUMENTS: 
//   theValue - string - the value to select
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function RadioGroup_pickValue(theValue)
{
  var retVal = false;

  for (var i=0; i < this.radioObject.length; i++)
  {
    if (this.radioObject[i].value == theValue)
    {
      this.radioObject[i].checked = true;
      retVal = true;

      if (window.updateUI != null)
      {
        window.updateUI(this.paramName, "onClick");
      }
      break;
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getIndex
//
// DESCRIPTION:
//   Returns the index of the currently selected item
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//   integer
//--------------------------------------------------------------------
function RadioGroup_getIndex()
{
  var selInd = -1;

  for (var i=0; i < this.radioObject.length; i++)
  {
    if (this.radioObject[i].checked == true)
    {
      selInd = i;
      break;
    }
  }

  return selInd;
}


//--------------------------------------------------------------------
// FUNCTION:
//   setIndex
//
// DESCRIPTION:
//   Selects the radio button with the given index in the array of radio
//   buttons
//
// ARGUMENTS: 
//   theIndex - integer - the index to select
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function RadioGroup_setIndex(theIndex)
{
  var retVal = false;

  if (theIndex < this.radioObject.length)
  {
    this.radioObject[theIndex].checked = true;
    retVal = true;

    if (window.updateUI != null)
    {
      window.updateUI(this.paramName, "onClick");
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//   Adds the currently selected value to the paramObj
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - the previous instance of this SB
//   paramObj - object - the object to add parameter values to
//
// RETURNS:
//   string - error message
//--------------------------------------------------------------------
function RadioGroup_applyServerBehavior(sbObj, paramObj) 
{
  var retVal = "";
  
  var selInd = this.getIndex();
  
  
  if (selInd == -1)
  {
    retVal = MM.MSG_NothingEntered; // tell user to complete all values
  }
  else
  {
   var selVal = this.getValue();
   
   paramObj[this.paramName] = selVal;
  }
  
  return retVal;
}



//--------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//   extracts the value of the parameter and selects the appropriate
//   radio button
//
// ARGUMENTS: 
//   sbObj - ServerBehavior object - the object we are inspecting
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function RadioGroup_inspectServerBehavior(sbObj)
{
  var retVal = "";
  
  var valToFind = sbObj.parameters[this.paramName];
  
  retVal = this.pickValue(valToFind);
  
  if (!retVal)
  {
    alert("Error");
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
function RadioGroup_findServerBehaviors() 
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
function RadioGroup_canApplyServerBehavior(sbObj) 
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
function RadioGroup_deleteServerBehavior(sbObj)
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
function RadioGroup_analyzeServerBehavior(sbObj, allRecs)
{
  // nothing needed here
}


