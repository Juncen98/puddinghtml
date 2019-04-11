//SHARE-IN-MEMORY=true
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//*-------------------------------------------------------------------
// CLASS:
//   NumRecButtons
//
// DESCRIPTION:
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//
//--------------------------------------------------------------------




//-------------------------------------------------------------------
// FUNCTION:
//  NumRecButtons
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------

function NumRecButtons(behaviorName, paramName) 
{
  this.behaviorName = behaviorName;
  this.paramName = paramName;
  this.radioObj = dwscripts.findDOMObject(paramName);
  this.tfName = "tf_" + paramName;
  this.textFieldObj = null;
  this.numRecs = 0;
}

//public methods
NumRecButtons.prototype.initializeUI = NumRecButtons_initializeUI;
NumRecButtons.prototype.updateUI = NumRecButtons_updateUI;
NumRecButtons.prototype.findServerBehaviors = NumRecButtons_findServerBehaviors;
NumRecButtons.prototype.canApplyServerBehavior = NumRecButtons_canApplyServerBehavior;
NumRecButtons.prototype.applyServerBehavior = NumRecButtons_applyServerBehavior;
NumRecButtons.prototype.inspectServerBehavior = NumRecButtons_inspectServerBehavior;
NumRecButtons.prototype.deleteServerBehavior = NumRecButtons_deleteServerBehavior;
NumRecButtons.prototype.analyzeServerBehavior = NumRecButtons_analyzeServerBehavior;
NumRecButtons.prototype.getValue  = NumRecButtons_getValue;
NumRecButtons.prototype.setValue  = NumRecButtons_setValue;

//private methods
NumRecButtons.prototype.checkNumberOfRecords = NumRecButtons_checkNumberOfRecords;




//*-------------------------------------------------------------------
// FUNCTION:
//   initializeUI()
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function NumRecButtons_initializeUI() 
{
  this.textFieldObj = dwscripts.findDOMObject(this.tfName);
}


//*-------------------------------------------------------------------
// FUNCTION:
//   updateUI()
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function NumRecButtons_updateUI(whichControl) 
{
 
  var textFieldObj = this.textFieldObj;
  
  if (whichControl == "allButton")
  {
    textFieldObj.setAttribute("disabled","true");
  }
  else if (whichControl == "countButton")
  {
    textFieldObj.removeAttribute("disabled");
  }
  else if (whichControl == "numRecField")
  {
    this.numRecs = this.textFieldObj.value;
  }
}


//*-------------------------------------------------------------------
// FUNCTION:
//   findServerBehaviors
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function NumRecButtons_findServerBehaviors(paramObj) {
  // no op
}



//*-------------------------------------------------------------------
// FUNCTION:
//   canApplyServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function NumRecButtons_canApplyServerBehavior(sbObj) {
  var retVal = true;
  return retVal;
}



//*-------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function NumRecButtons_applyServerBehavior(sbObj, paramObj) 
{

  var retVal = "";

  
  if (this.radioObj[0].checked == true)
  {
    this.numRecs = this.textFieldObj.value;
    retVal = this.checkNumberOfRecords(); // generates err msg if warranted                                  
  }
  else
  {
    this.numRecs = -1;
  }

  if (retVal == "" && paramObj)
    paramObj[this.paramName] = this.numRecs;
    
  return retVal;
}



//*-------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function NumRecButtons_inspectServerBehavior(sbObj) {

  var retVal = "";
  var numRecs = -1;
  
  if (sbObj.parameters[this.paramName])
    numRecs = sbObj.parameters[this.paramName];
  
  
  if (numRecs == -1)
  {
    this.radioObj[1].checked = true;
    this.textFieldObj.setAttribute("disabled","true");
  }
  else
  {
    this.radioObj[0].checked = true;
    this.textFieldObj.removeAttribute("disabled");
  }
  
  this.numRecs = numRecs;
  
  return retVal;
}



//*-------------------------------------------------------------------
// FUNCTION:
//   deleteServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function NumRecButtons_deleteServerBehavior(sbObj) {
  // no op
}



//*-------------------------------------------------------------------
// FUNCTION:
//   analyzeServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function NumRecButtons_analyzeServerBehavior(sbObj, allRecs) {
  // nothing needed here
}

//*-------------------------------------------------------------------
// FUNCTION:
//   getValue
//
// DESCRIPTION:
//   returns either "all" or a number, indicating the number of records
//   in the repeated region
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//   "all" or an integer
//--------------------------------------------------------------------
function NumRecButtons_getValue()
{
  var retVal = "all";
  
  if (this.radioObj[0].checked == true && this.textFieldObj)
    retVal = this.textFieldObj.value;
    
  return retVal;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   setValue
//
// DESCRIPTION:
//   set to "all recs" or certain number of recs
//
// ARGUMENTS: 
//   numRecs - "all" or integer
//
// RETURNS:
//   "all" or an integer
//--------------------------------------------------------------------
function NumRecButtons_setValue(numRecs)
{ /*
  if (numRecs == "all")
  {
    this.updateUI("allButton");
  }
  else if (numRecs && (parseInt(numRecs) == numRecs) && (numRecs > -1))
  {
    this.updateUI("countButton");
    this.textFieldObj.value = numRecs;
    this.updateUI("numRecField");
  }*/
}


//*------------------------------------------------------------------
// FUNCTION:
//   checkNumberOfRecords
//
// DESCRIPTION:
//   returns empty string if valid value, error message if invalid value     
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------

function NumRecButtons_checkNumberOfRecords() 
{
  var retVal  = "";
  var numRecs = this.numRecs;
  var isNumber = (numRecs == parseInt(numRecs));
  
  if (!numRecs)
    retVal = MM.MSG_NeedNumberOfRecords; // All values must be complete
  else if (!isNumber || numRecs < 1)
    retVal = MM.MSG_NeedValidNumberOfRecords;
  
  return retVal;
}










