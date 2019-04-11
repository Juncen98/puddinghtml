//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//*-------------------------------------------------------------------
// CLASS:
//   DynamicExpressionTextfield
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
//  DynamicExpressionTextfield
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function DynamicExpressionTextfield(behaviorName, paramName) {
  this.behaviorName = behaviorName;
  this.paramName = paramName;
  
  this.textControl = '';
}

DynamicExpressionTextfield.prototype.initializeUI = DynamicExpressionTextfield_initializeUI;
DynamicExpressionTextfield.prototype.findServerBehaviors = DynamicExpressionTextfield_findServerBehaviors;
DynamicExpressionTextfield.prototype.canApplyServerBehavior = DynamicExpressionTextfield_canApplyServerBehavior;
DynamicExpressionTextfield.prototype.applyServerBehavior = DynamicExpressionTextfield_applyServerBehavior;
DynamicExpressionTextfield.prototype.inspectServerBehavior = DynamicExpressionTextfield_inspectServerBehavior;
DynamicExpressionTextfield.prototype.deleteServerBehavior = DynamicExpressionTextfield_deleteServerBehavior;
DynamicExpressionTextfield.prototype.analyzeServerBehavior = DynamicExpressionTextfield_analyzeServerBehavior;
DynamicExpressionTextfield.prototype.getValue = DynamicExpressionTextfield_getValue;
DynamicExpressionTextfield.prototype.setValue = DynamicExpressionTextfield_setValue;


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
function DynamicExpressionTextfield_initializeUI() {
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
function DynamicExpressionTextfield_findServerBehaviors(paramObj) {
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
function DynamicExpressionTextfield_canApplyServerBehavior(sbObj) {
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
function DynamicExpressionTextfield_applyServerBehavior(sbObj, paramObj, emptyError) {
  var retVal = "";
  var theValue  = this.textControl.value;

  if (theValue)
  {
    if (dwscripts.encodeDynamicExpression != null)
    {
      theValue = dwscripts.encodeDynamicExpression(theValue);
    }
    else
    {
      theValue = formatDynamicExpression(theValue);
    }
      
    paramObj[this.paramName] = theValue;
  } 
  else
  {
    if (emptyError) retVal = emptyError;
  }
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
function DynamicExpressionTextfield_inspectServerBehavior(sbObj)
{
  var retVal = true;
  
  var theValue = sbObj.parameters[this.paramName];
  
  if (theValue == null)
  {
    theValue = "";
  }
  
  if (theValue)
  {
    if (dwscripts.decodeDynamicExpression != null)
    {
      theValue = dwscripts.decodeDynamicExpression(theValue);
    }
    else
    {
      theValue = extractDynamicExpression(theValue);
    }
  }
  
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
function DynamicExpressionTextfield_deleteServerBehavior(sbObj) {
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
function DynamicExpressionTextfield_analyzeServerBehavior(sbObj, allRecs) {
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
function DynamicExpressionTextfield_getValue() {
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
function DynamicExpressionTextfield_setValue(theValue) {
  this.textControl.value = theValue;
}

