//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//*-------------------------------------------------------------------
// CLASS:
//   DynamicTextField
//
// DESCRIPTION:
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//
//--------------------------------------------------------------------




//*-------------------------------------------------------------------
// FUNCTION:
//  DynamicTextField
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function DynamicTextField(behaviorName, paramName) {
  this.behaviorName = behaviorName;
  this.paramName = paramName;
  
  this.textControl = '';
}

//public methods
DynamicTextField.prototype.initializeUI = DynamicTextField_initializeUI;
DynamicTextField.prototype.findServerBehaviors = DynamicTextField_findServerBehaviors;
DynamicTextField.prototype.canApplyServerBehavior = DynamicTextField_canApplyServerBehavior;
DynamicTextField.prototype.applyServerBehavior = DynamicTextField_applyServerBehavior;
DynamicTextField.prototype.inspectServerBehavior = DynamicTextField_inspectServerBehavior;
DynamicTextField.prototype.deleteServerBehavior = DynamicTextField_deleteServerBehavior;
DynamicTextField.prototype.analyzeServerBehavior = DynamicTextField_analyzeServerBehavior;
DynamicTextField.prototype.getValue = DynamicTextField_getValue;
DynamicTextField.prototype.setValue = DynamicTextField_setValue;
DynamicTextField.prototype.launchDynamicData = DynamicTextField_launchDynamicData;



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
function DynamicTextField_initializeUI() {
  this.textControl = dwscripts.findDOMObject(this.paramName);
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
function DynamicTextField_findServerBehaviors(paramObj) {
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
function DynamicTextField_canApplyServerBehavior(sbObj) {
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
function DynamicTextField_applyServerBehavior(sbObj, paramObj, emptyMessage) {
  var errStr = "";
  
  var theValue  = this.textControl.value;
  
  if (emptyMessage && !theValue) {
    errStr = emptyMessage;
  }
  
  paramObj[this.paramName] = theValue;
  
  return errStr;
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
function DynamicTextField_inspectServerBehavior(sbObj) {
  var retVal = true;
  var theValue = sbObj.parameters[this.paramName];
  this.textControl.value = (theValue)?theValue:"";
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
function DynamicTextField_deleteServerBehavior(sbObj) {
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
function DynamicTextField_analyzeServerBehavior(sbObj, allRecs) {
  // no op
}



//*-------------------------------------------------------------------
// FUNCTION:
//   getValue
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function DynamicTextField_getValue() {

  return ((this.textControl.value)?this.textControl.value:"");
}



//*-------------------------------------------------------------------
// FUNCTION:
//   setValue
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function DynamicTextField_setValue(theValue) {
  this.textControl.value = theValue;
}



//*-------------------------------------------------------------------
// FUNCTION:
//   launchDynamicData
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function DynamicTextField_launchDynamicData() {
  var expression = dw.showDynamicDataDialog(this.textControl.value);
  if (expression) {
    this.textControl.value = expression;
  }
}
