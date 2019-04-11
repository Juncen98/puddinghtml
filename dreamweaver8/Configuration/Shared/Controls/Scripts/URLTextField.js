//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//*-------------------------------------------------------------------
// CLASS:
//   URLTextField
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
//  URLTextField
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function URLTextField(behaviorName, paramName) {
  this.behaviorName = behaviorName;
  this.paramName = paramName;
  
  this.textControl = '';
}

//public methods
URLTextField.prototype.initializeUI = URLTextField_initializeUI;
URLTextField.prototype.findServerBehaviors = URLTextField_findServerBehaviors;
URLTextField.prototype.canApplyServerBehavior = URLTextField_canApplyServerBehavior;
URLTextField.prototype.applyServerBehavior = URLTextField_applyServerBehavior;
URLTextField.prototype.inspectServerBehavior = URLTextField_inspectServerBehavior;
URLTextField.prototype.deleteServerBehavior = URLTextField_deleteServerBehavior;
URLTextField.prototype.analyzeServerBehavior = URLTextField_analyzeServerBehavior;
URLTextField.prototype.browseForFile = URLTextField_browseForFile;
URLTextField.prototype.getValue = URLTextField_getValue;
URLTextField.prototype.setValue = URLTextField_setValue;


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
function URLTextField_initializeUI() {
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
function URLTextField_findServerBehaviors(paramObj) {
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
function URLTextField_canApplyServerBehavior(sbObj) {
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
function URLTextField_applyServerBehavior(sbObj, paramObj, emptyMessage) {
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
function URLTextField_inspectServerBehavior(sbObj) {
  var retVal = true;
  var theValue = sbObj.parameters[this.paramName];
  this.textControl.value = theValue;
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
function URLTextField_deleteServerBehavior(sbObj) {
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
function URLTextField_analyzeServerBehavior(sbObj, allRecs) {
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
function URLTextField_getValue() {
  return this.textControl.value;
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
function URLTextField_setValue(theValue) {
  this.textControl.value = theValue;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   browseForFile
//
// DESCRIPTION:
//   browses for a file; places file string in associated textfield
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//--------------------------------------------------------------------
function URLTextField_browseForFile()
{
  var fileName = "";
  fileName = browseForFileURL();  //returns a local filename
  if (fileName) 
  {
    // If we are using ColdFusion, then we probably want this URL
    // for a cflocation tag, therefore we should strip any cfoutput tags.
    // This will be a no-op for other server models.
    if (dwscripts.stripCFOutputTags != null)
    {
      fileName = dwscripts.stripCFOutputTags(fileName);
    }
    
    this.textControl.value = fileName;
  }
}
