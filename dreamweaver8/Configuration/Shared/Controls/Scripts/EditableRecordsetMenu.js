//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   EditableRecordsetMenu
//
// DESCRIPTION:
//   This class represents a select list of recordsets
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//
//   initializeUI()
//   updateUI(controlObj, event)
//
//   getValue()
//   pickValue(theValue)
//   setDisabled(theValue)
//
//   canApplyServerBehavior(sbObj)
//   applyServerBehavior(sbObj, paramObj, emptyErrorMessage)
//   inspectServerBehavior(sbObj) 
//   analyzeServerBehavior(sbObj, allRecs)
//
//--------------------------------------------------------------------


//--------------------------------------------------------------------
// FUNCTION:
//   EditableRecordsetMenu
//
// DESCRIPTION:
//   Constructor function for the RecordetMenu control
//
// ARGUMENTS:
//   behaviorName - the name of the behavior using this control
//   paramName - the name of the parameter that is being set
//   bPrependNoneLabel - boolean (optional). 'true' if should prepend a 'None' to the 
//     beginning of the labels list. Defaults to false.
//
// RETURNS:
//--------------------------------------------------------------------
function EditableRecordsetMenu(behaviorName, paramName, bPrependNoneLabel)
{
  this.behaviorName = behaviorName;
  this.paramName = paramName;
  
  this.bPrependNoneLabel = (bPrependNoneLabel) ? true : false;  
  
  this.listControl = '';
  
  this.isRecordsetMenu = true;
  
  // store a reference to ourselves on the main dialog
  window.MM_RECORDSET_MENU = this;
}


//public methods
EditableRecordsetMenu.prototype.initializeUI = EditableRecordsetMenu_initializeUI;

EditableRecordsetMenu.prototype.getValue = EditableRecordsetMenu_getValue;
EditableRecordsetMenu.prototype.pickValue = EditableRecordsetMenu_pickValue;
EditableRecordsetMenu.prototype.setDisabled = EditableRecordsetMenu_setDisabled;

EditableRecordsetMenu.prototype.canApplyServerBehavior = EditableRecordsetMenu_canApplyServerBehavior;
EditableRecordsetMenu.prototype.applyServerBehavior = EditableRecordsetMenu_applyServerBehavior;
EditableRecordsetMenu.prototype.inspectServerBehavior = EditableRecordsetMenu_inspectServerBehavior;
EditableRecordsetMenu.prototype.analyzeServerBehavior = EditableRecordsetMenu_analyzeServerBehavior;

//no ops
EditableRecordsetMenu.prototype.findServerBehaviors = EditableRecordsetMenu_findServerBehaviors;
EditableRecordsetMenu.prototype.deleteServerBehavior = EditableRecordsetMenu_deleteServerBehavior;

//private methods
EditableRecordsetMenu.prototype.findAllRecordsetNames = EditableRecordsetMenu_findAllRecordsetNames;
EditableRecordsetMenu.prototype.rsNameIsValid = EditableRecordsetMenu_rsNameIsValid;
EditableRecordsetMenu.prototype.pick = EditableRecordsetMenu_pick;



//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI()
//
// DESCRIPTION:
//   initializes the list control with the names of the recordsets
//
// ARGUMENTS:
//   elementName - string - (optional) the name of the form control, if it
//     differs from the parameter name
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function EditableRecordsetMenu_initializeUI(elementName)
{ 
  var elemName = (elementName) ? elementName : this.paramName;
  
  this.emptyLabel = dwscripts.sprintf(MM.LABEL_NoRecordsets, dwscripts.getRecordsetDisplayName());
  
  this.listControl = new ListControl(elemName);
  
  var rsNames = new Array();
  var rsValues = new Array();
  
  var nameValueArray = this.findAllRecordsetNames();

  rsNames = nameValueArray[0];
  rsValues = nameValueArray[1];
  
  if (rsNames.length)
  {
    this.listControl.setAll(rsNames,rsValues);
    
    // if there is only one recordset make this recordset come up as the default selection
    if (rsNames.length == 1 || this.listControl.isEditable())
    {
      this.listControl.setIndex(0);
    }
  }
  else
  {
    this.listControl.setAll(new Array(this.emptyLabel), new Array(""));
    if (this.listControl.isEditable())
    {
      this.listControl.setIndex(-1);
    }
  }
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
//   value of the currently selected list item. value of MM.LABEL_None if 
//   localized value of 'None' is the currently selected value.
//--------------------------------------------------------------------
function EditableRecordsetMenu_getValue()
{
  // NOTE: this function is called getValue, and yet we are calling
  //       the get function on the list control.  This is done to make
  //       this control work like the others.  Usually the value is
  //       what you want, just not in this case.
  
  var retVal = "";

  if (this.listControl)
  {
    retVal = this.listControl.get();
  }

  return retVal;
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

function EditableRecordsetMenu_pickValue(theValue)
{
  // NOTE: this function is called pickValue, and yet we are calling
  //       the pick function on the list control.  This is done to make
  //       this control work like the others.  Usually the value is
  //       what you want, just not in this case.
  
  var retVal = this.listControl.pick(theValue);

  if (retVal && window.updateUI != null)
  {
    window.updateUI(this.paramName, "onPickValue");
  }
  
  return retVal;
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

function EditableRecordsetMenu_setDisabled(theValue)
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
//   canApplyServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function EditableRecordsetMenu_canApplyServerBehavior(sbObj)
{
  // NOTE: do not use this.listControl in this function,
  // because initializeUI() has not yet been run
  
  var retVal = true;
  
  var control = dwscripts.findDOMObject(this.paramName);
  
  if (control && !control.editable)
  {  
    var nameValueArray = this.findAllRecordsetNames();

    var rsNames = nameValueArray[0];

    if (!sbObj && rsNames.length == 0)    //if there are no Recordsets
    {
      alert(dwscripts.sprintf(MM.MSG_NoRecordsets, dwscripts.getRecordsetDisplayName()));

      retVal = false;                     //return false to indicate an error
    }
  }
    
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
function EditableRecordsetMenu_applyServerBehavior(sbObj, paramObj, emptyMessage)
{
  var errString = "";

  var rsName  = this.listControl.get();
  var rsValue = this.listControl.getValue();

  if (this.listControl.isEditable() && (!rsName || rsName == this.emptyLabel))
  {
    if (emptyMessage == null)
    {
      errString = dwscripts.sprintf(MM.MSG_NeedRs, dwscripts.getRecordsetDisplayName());
    }
    else if (emptyMessage)
    {
      errString = emptyMessage;
    }
  }
  else
  { 
    if (rsValue != rsName)
    {
      //set the special data source flag, so that the sbManager adds
      // the correct code to the page
      paramObj.MM_dataSource = rsValue;
    }

    //add the data source name to the paramObj
    paramObj[this.paramName] = rsName;
  }
  
  return errString;
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
function EditableRecordsetMenu_inspectServerBehavior(sbObj, notFoundMsg)
{
  var retVal = false;
  
  var rsName = sbObj.parameters[this.paramName];
  
  if (this.listControl.isEditable())
  {
    retVal = true;

    if (!rsName)
    {
      if (notFoundMsg)
      {
        alert(notFoundMsg);
        retVal = false;
      }
    }
    else
    {
      if (this.listControl.list[0] == this.emptyLabel)
      {
        this.listControl.setIndex(0);
        this.listControl.del();
      }
      this.listControl.pickValue(rsName);
    }
  }
  else
  {
    //find the name in the list
    for (var i=0; i < this.listControl.getLen() ; i++)
    {
      if (this.listControl.get(i) == rsName)
      {
        retVal = this.listControl.setIndex(i);
        break;
      }
    }

    if (!retVal) 
    { // data source name not found

      //display error message (default if none). If "" passed in, don't display any error.
      if (notFoundMsg == null)
      {
        var displayName = dwscripts.getRecordsetDisplayName();
        alert(dwscripts.sprintf(MM.MSG_CouldNotFindRecordsetName, displayName, rsName, displayName));
      } 
      else if (notFoundMsg.length) 
      {
        alert(notFoundMsg);
      }

    }
  }
    
  return retVal;
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
function EditableRecordsetMenu_analyzeServerBehavior(sbObj, allRecs)
{
  // NOTE: do not use this.listControl in this function,
  // because initializeUI() has not yet been run
  
  var control = dwscripts.findDOMObject(this.paramName);
  
  if (!sbObj.incomplete && 
      control &&
      !control.editable && 
      !this.rsNameIsValid(sbObj.parameters[this.paramName])) 
  {
    sbObj.incomplete = true;
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   findAllRecordsetNames
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function EditableRecordsetMenu_findAllRecordsetNames()
{
  var nameValueArray = new Array();

  var dsNames = new Array();
  var dsValues = new Array();
  
  if (dwscripts && dwscripts.getDataSourcesForSB != null)
  {
    var dsList = null;
    if (this.behaviorName)
    {
      dsList = dwscripts.getDataSourcesForSB(this.behaviorName);
    }
    else
    {
      dsList = dwscripts.getDataSourcesByFileName("Recordset.htm");
    }

    if (dsList)
    {
      dsNames = dwscripts.getDataSourceNames(dsList);
      dsValues = dwscripts.getDataSourceTypes(dsList);
    }
  }
  else
  {  
    //ask dreamweaver for the list of data sources
    var dsList = dw.dbi.getDataSources();

    //get the list of groups which reference this server behavior  
    var brList = new Array();
    if (this.behaviorName)
    {
      brList = dw.getExtGroups(this.behaviorName, "serverBehavior");
    }
    else
    {
      brList.push("");
    }

    //for each data source, check if a group file exists for it
    for (var i=0; i < dsList.length; i++)
    {
      for (var j = 0; j < brList.length; j++)
      {
        var dsSource = dw.getExtDataValue(brList[j],"dataSource");

        if ((dsSource && (dsSource == dsList[i].dataSource || dsSource == "*")) ||
            (!dsSource && dsList[i].dataSource == "Recordset.htm"))
        {

          //Let make sure we don't have a same data source listed twice because of subtype.
          //until we figure out a solution to support 
          var isExist = false;
          for (var k=0; k < dsNames.length; k++) 
          {
            if (dsList[i].name == dsNames[k]) 
            {
              isExist = true;
            }
          }

          if (!isExist)
          {
            if (dsList[i].name) 
            {
              dsNames.push(dsList[i].name);
            } 
            else
            {
              dsNames.push(dsList[i].title);
            }
            dsValues.push(dsList[i].dataSource);
          }
        }
      }
    }
  }
  
  // Prepend 'None' label if required.
  if (this.bPrependNoneLabel)
  {
    dsNames.splice(0, 0, MM.LABEL_None);
    dsValues.splice(0, 0, null); 
  }
    
  //add the names and values arrays to the return array
  nameValueArray.push(dsNames);
  nameValueArray.push(dsValues);

  return nameValueArray;
}



//--------------------------------------------------------------------
// FUNCTION:
//   rsNameIsValid
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function EditableRecordsetMenu_rsNameIsValid(rsName)
{
  var retVal = false;
  
  var nameValueArray = this.findAllRecordsetNames();
  
  var rsNames = nameValueArray[0];

  for (var i=0; i < rsNames.length; i++)
  {
    if (rsNames[i] == rsName) 
    {
      retVal = true;
      break;
    }
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
function EditableRecordsetMenu_findServerBehaviors(paramObj)
{
  // no op
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
function EditableRecordsetMenu_deleteServerBehavior(sbObj)
{
  // no op
}


//--------------------------------------------------------------------
// FUNCTION:
//   pick
//
// DESCRIPTION:
//
// ARGUMENTS: 
//   name of the item to select
//
// RETURNS:
//--------------------------------------------------------------------
function EditableRecordsetMenu_pick(label)
{
  var retVal = this.listControl.pick(label);

  if (retVal && window.updateUI != null)
  {
    window.updateUI(this.paramName, "onPick");
  }
  
  return retVal;
}

