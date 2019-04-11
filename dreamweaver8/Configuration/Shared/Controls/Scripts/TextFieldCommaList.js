//SHARE-IN-MEMORY=true
// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   TextFieldCommaList
//
// DESCRIPTION:
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//
//--------------------------------------------------------------------




//--------------------------------------------------------------------
// FUNCTION:
//  TextFieldCommaList
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function TextFieldCommaList(behaviorName, paramName)
{
  this.behaviorName = behaviorName;
  this.paramName = paramName;
  
  this.textControl = '';
}

//public methods
TextFieldCommaList.prototype.initializeUI = TextFieldCommaList_initializeUI;
TextFieldCommaList.prototype.findServerBehaviors = TextFieldCommaList_findServerBehaviors;
TextFieldCommaList.prototype.canApplyServerBehavior = TextFieldCommaList_canApplyServerBehavior;
TextFieldCommaList.prototype.applyServerBehavior = TextFieldCommaList_applyServerBehavior;
TextFieldCommaList.prototype.inspectServerBehavior = TextFieldCommaList_inspectServerBehavior;
TextFieldCommaList.prototype.deleteServerBehavior = TextFieldCommaList_deleteServerBehavior;
TextFieldCommaList.prototype.analyzeServerBehavior = TextFieldCommaList_analyzeServerBehavior;
TextFieldCommaList.prototype.getValue = TextFieldCommaList_getValue;
TextFieldCommaList.prototype.setValue = TextFieldCommaList_setValue;


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
function TextFieldCommaList_initializeUI() 
{
  this.textControl = findObject(this.paramName);
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
function TextFieldCommaList_findServerBehaviors(paramObj)
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
function TextFieldCommaList_canApplyServerBehavior(sbObj)
{
  var retVal = true;
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
function TextFieldCommaList_applyServerBehavior(sbObj, paramObj, emptyMessage)
{
  var errStr = "";
  
  var theValue  = this.textControl.value;
  
  if (emptyMessage && !theValue) {
    errStr = emptyMessage;
  }
  
  if (theValue)
  {
    paramObj[this.paramName] = theValue.split(",");
  }
  else
  {
    paramObj[this.paramName] = new Array();
  }
  
  return errStr;
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
function TextFieldCommaList_inspectServerBehavior(sbObj) 
{
  var retVal = true;
  var theValue = sbObj.parameters[this.paramName].join(",");
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
function TextFieldCommaList_deleteServerBehavior(sbObj)
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
function TextFieldCommaList_analyzeServerBehavior(sbObj, allRecs)
{
  // no op
}



//--------------------------------------------------------------------
// FUNCTION:
//   getValue
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function TextFieldCommaList_getValue()
{
  return this.textControl.value;
}



//--------------------------------------------------------------------
// FUNCTION:
//   setValue
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function TextFieldCommaList_setValue(theValue)
{
  this.textControl.value = theValue;
}
