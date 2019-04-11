//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//*-------------------------------------------------------------------
// CLASS:
//   RecordsetColumnMenu
//
// DESCRIPTION:
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//
//   setDisabled(theValue)
//--------------------------------------------------------------------




//*-------------------------------------------------------------------
// FUNCTION:
//  RecordsetColumnMenu
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function RecordsetColumnMenu(behaviorName, paramName, empty, rsParamName, bDisableWhenNoRS) {
  this.behaviorName = behaviorName;
  this.paramName = paramName;
  this.rsParamName = rsParamName;
  this.bDisableWhenNoRS = (bDisableWhenNoRS) ? bDisableWhenNoRS : false;
  
  this.recordset = '';
  this.rsName = '';
  
  this.listControl = '';
}

//public methods
RecordsetColumnMenu.prototype.initializeUI = RecordsetColumnMenu_initializeUI;
RecordsetColumnMenu.prototype.updateUI = RecordsetColumnMenu_updateUI;
RecordsetColumnMenu.prototype.findServerBehaviors = RecordsetColumnMenu_findServerBehaviors;
RecordsetColumnMenu.prototype.canApplyServerBehavior = RecordsetColumnMenu_canApplyServerBehavior;
RecordsetColumnMenu.prototype.applyServerBehavior = RecordsetColumnMenu_applyServerBehavior;
RecordsetColumnMenu.prototype.inspectServerBehavior = RecordsetColumnMenu_inspectServerBehavior;
RecordsetColumnMenu.prototype.deleteServerBehavior = RecordsetColumnMenu_deleteServerBehavior;
RecordsetColumnMenu.prototype.analyzeServerBehavior = RecordsetColumnMenu_analyzeServerBehavior;
RecordsetColumnMenu.prototype.getValue = RecordsetColumnMenu_getValue;
RecordsetColumnMenu.prototype.setDisabled = RecordsetColumnMenu_setDisabled;

//private methods
RecordsetColumnMenu.prototype.findAllColumnNames = RecordsetColumnMenu_findAllColumnNames;
RecordsetColumnMenu.prototype.colNameIsValid = RecordsetColumnMenu_colNameIsValid;



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
function RecordsetColumnMenu_initializeUI() {
  this.recordset = window[this.rsParamName];
  if (this.recordset.listControl.object.onChange) {
    this.recordset.listControl.object.onChange = this.paramName + ".updateUI();" +
                                                 this.recordset.listControl.object.onChange;
  } else {
    this.recordset.listControl.object.onChange = this.paramName + ".updateUI();";
  }
  
  this.listControl = new ListControl(this.paramName);
  
  this.updateUI();
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
function RecordsetColumnMenu_updateUI() 
{
  this.rsName = this.recordset.listControl.get();
  var colNames = this.findAllColumnNames(this.rsName);
  this.listControl.setAll(colNames,colNames);
  
  // If required, disable self if no returned recordsets and enable self if
  //   returned recordsets. 
  if (this.bDisableWhenNoRS)
  {
    if (!colNames || colNames.length == 0)
    {
      this.setDisabled(true);
    }
    else
    {
      this.setDisabled(false);
    }
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
function RecordsetColumnMenu_findServerBehaviors(paramObj) {
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
function RecordsetColumnMenu_canApplyServerBehavior(sbObj) {
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
function RecordsetColumnMenu_applyServerBehavior(sbObj, paramObj) {
  var retVal = "";
  var colName  = this.listControl.getValue();
  if (!colName || colName.indexOf("MM_ERROR") != -1) {
    retVal = MM.MSG_NeedColumn;
  }
  paramObj[this.paramName] = colName;
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
function RecordsetColumnMenu_inspectServerBehavior(sbObj) {
  this.updateUI();
  var colName = sbObj.parameters[this.paramName];
  var retVal = this.listControl.pickValue(colName);
  if (!retVal) {
    alert(dwscripts.sprintf(MM.MSG_CouldNotFindColumnName,colName));
  }
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
function RecordsetColumnMenu_deleteServerBehavior(sbObj) {
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
function RecordsetColumnMenu_analyzeServerBehavior(sbObj, allRecs) {
  if (!sbObj.incomplete && !this.colNameIsValid(sbObj.parameters[this.rsParamName], sbObj.parameters[this.paramName])) {
    sbObj.incomplete = true;
  }
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
function RecordsetColumnMenu_getValue() {
  return this.listControl.getValue();
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

function RecordsetColumnMenu_setDisabled(theValue)
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


//*-------------------------------------------------------------------
// FUNCTION:
//   findAllColumnNames
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function RecordsetColumnMenu_findAllColumnNames(rsName) {
  var retVal = false;
  if (dwscripts && dwscripts.getFieldNames)
  {
    retVal = dwscripts.getFieldNames(rsName);
  }
  else
  {
    retVal = findAllColumnNames(rsName);
  }
  return retVal;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   colNameIsValid
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function RecordsetColumnMenu_colNameIsValid(rsName, colName) {
  var retVal = false;
  
  if (colName) 
  {
    var colNames;
    if (dwscripts && dwscripts.getFieldNames)
    {
      colNames = dwscripts.getFieldNames(rsName);
    }
    else
    {
      colNames = this.findAllColumnNames(rsName);
    }
    
    for (var i=0; i < colNames.length; i++)
    {
      if (colNames[i] == colName)
      {
        retVal = true;
        break;
      }
    }
  }
  
  return retVal;
}



