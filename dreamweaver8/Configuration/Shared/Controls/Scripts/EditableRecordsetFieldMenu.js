//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   EditableRecordsetFieldMenu
//
// DESCRIPTION:
//   This class represents a select list of recordset fields
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
//   applyServerBehavior(sbObj, paramObj, emptyErrorMessage)
//   inspectServerBehavior(sbObj) 
//   analyzeServerBehavior(sbObj, allRecs)
//
//--------------------------------------------------------------------


//--------------------------------------------------------------------
// FUNCTION:
//  EditableRecordsetFieldMenu
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function EditableRecordsetFieldMenu(behaviorName, paramName, empty, rsMenuObj)
{
  this.behaviorName = behaviorName;
  this.paramName = paramName;
  
  this.rsParamName = "";
  this.rsMenuObj = null;
  
  if (typeof rsMenuObj == "string")  // handle UD4 style arguments
  {
    this.rsParamName = rsMenuObj;
  }
  else if (rsMenuObj && rsMenuObj.paramName)
  {
    this.rsMenuObj = rsMenuObj;
    this.rsParamName = this.rsMenuObj.paramName;
  }
  
  this.recordset = null;
  
  this.listControl = '';
  
  window.MM_RECORDSET_FIELD_MENU = this;
}


//public methods
EditableRecordsetFieldMenu.prototype.initializeUI = EditableRecordsetFieldMenu_initializeUI;
EditableRecordsetFieldMenu.prototype.updateUI = EditableRecordsetFieldMenu_updateUI;

EditableRecordsetFieldMenu.prototype.getValue = EditableRecordsetFieldMenu_getValue;
EditableRecordsetFieldMenu.prototype.pickValue = EditableRecordsetFieldMenu_pickValue;
EditableRecordsetFieldMenu.prototype.setDisabled = EditableRecordsetFieldMenu_setDisabled;

EditableRecordsetFieldMenu.prototype.applyServerBehavior = EditableRecordsetFieldMenu_applyServerBehavior;
EditableRecordsetFieldMenu.prototype.inspectServerBehavior = EditableRecordsetFieldMenu_inspectServerBehavior;
EditableRecordsetFieldMenu.prototype.analyzeServerBehavior = EditableRecordsetFieldMenu_analyzeServerBehavior;

EditableRecordsetFieldMenu.prototype.findServerBehaviors = EditableRecordsetFieldMenu_findServerBehaviors;
EditableRecordsetFieldMenu.prototype.canApplyServerBehavior = EditableRecordsetFieldMenu_canApplyServerBehavior;
EditableRecordsetFieldMenu.prototype.deleteServerBehavior = EditableRecordsetFieldMenu_deleteServerBehavior;

//private methods
EditableRecordsetFieldMenu.prototype.findAllFieldNames = EditableRecordsetFieldMenu_findAllFieldNames;
EditableRecordsetFieldMenu.prototype.fieldNameIsValid = EditableRecordsetFieldMenu_fieldNameIsValid;



//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI()
//
// DESCRIPTION:
//
// ARGUMENTS: 
//   elementName - string - (optional) the name of the form control, if it
//     differs from the parameter name
//
// RETURNS:
//--------------------------------------------------------------------
function EditableRecordsetFieldMenu_initializeUI(elementName)
{
  var elemName = (elementName) ? elementName : this.paramName;
  
  if (!this.rsMenuObj)
  {
    if (this.rsParamName && window[this.rsParamName] != null)
    {
      // Leave this first case for UD4 backwards compatibility.  If the user
      // has passed a string for rsMenuObj, then they are expecting 
      // this code to be run

      this.rsMenuObj = window[this.rsParamName];
    } 
    else if (window.MM_RECORDSET_MENU)
    {
      // This should work for old and new server behaviors
      // The updated RecordsetMenu object will be setting this
      // value so that we can find it here.

      this.rsMenuObj = window.MM_RECORDSET_MENU;
      this.rsParamName = this.rsMenuObj.paramName;
    }
    else
    {
      // Non-localized string to indicate error to SB developers
      alert(MM.MSG_MENU_ERROR_4); 
    }
  }
  
  if (this.rsMenuObj)
  {
    // We will use the recordset parameter to indicate if this is
    // being called from a UD4 server behavior.  We will initially
    // add a direct call to our event handler to the recordset
    // object.  If we are called by the new window.updateUI function
    // first, then we will set recordset to null, to indicate that
    // we are being called from the new code.
    
    this.recordset = this.rsMenuObj;
    
    if (this.recordset)
    {
      if (this.recordset.listControl.object.onChange)
      {
        this.recordset.listControl.object.onChange = this.recordset.listControl.object.onChange +
                                                     ";_" + this.paramName + ".updateUI();";
      } 
      else 
      {
        this.recordset.listControl.object.onChange = "_" + this.paramName + ".updateUI();";
      }

      if (this.recordset.listControl.isEditable()) 
      {
        if (this.recordset.listControl.object.onBlur)
        {
          this.recordset.listControl.object.onBlur = this.recordset.listControl.object.onBlur +
                                                     ";_" + this.paramName + ".updateUI();"

        } 
        else
        {
          this.recordset.listControl.object.onBlur = "_" + this.paramName + ".updateUI();";
        }
      }
    }
  }
  
  this.listControl = new ListControl(elemName);
  
  this.updateUI();
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateUI()
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function EditableRecordsetFieldMenu_updateUI(controlObj, event)
{
  if (controlObj == null)  // called in the UD4 style
  {
    if (this.recordset) 
    {
      var rsName = this.recordset.listControl.get();
      
      var success = false;
      
      if (rsName)
      {
        var fieldNames = this.findAllFieldNames(rsName);

        this.listControl.setAll(fieldNames,fieldNames);
        
        success = true;
      }
        
        if (this.listControl.isEditable())
        {
        if (!success)
      {
        var noFieldsArr = new Array(MM.LABEL_NoFields);
        this.listControl.setAll(noFieldsArr,noFieldsArr);
        this.listControl.setIndex(-1);
      }
        else
        {
          this.listControl.setIndex(0);
        }
      }
    }
  }
  else  // called in the new style
  {
    if (this.rsMenuObj && this.rsMenuObj == controlObj) 
    {
      var rsName = this.rsMenuObj.getValue();
      
      var success = false;
      
      if (rsName)
      {
        var fieldNames = this.findAllFieldNames(rsName);

        this.listControl.setAll(fieldNames,fieldNames);
        
        success = true;
      }

        if (this.listControl.isEditable())
        {
        if (!success)
        {
          var noFieldsArr = new Array(MM.LABEL_NoFields);
          this.listControl.setAll(noFieldsArr,noFieldsArr);
          this.listControl.setIndex(-1);
        }
        else
        {
          this.listControl.setIndex(0);
        }
      }
      
      this.recordset = null;   // we are being called from a new SB
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
//--------------------------------------------------------------------
function EditableRecordsetFieldMenu_getValue()
{
  var retVal = "";

  if (this.listControl)
  {
    retVal = this.listControl.getValue();
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

function EditableRecordsetFieldMenu_pickValue(theValue)
{
  var retVal = this.listControl.pickValue(theValue);

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

function EditableRecordsetFieldMenu_setDisabled(theValue)
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
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function EditableRecordsetFieldMenu_applyServerBehavior(sbObj, paramObj, emptyMessage)
{
  var retVal = "";
  
  var colName  = this.listControl.getValue();
  
  if (!colName || 
      colName.indexOf("MM_ERROR") != -1 ||
      colName == MM.LABEL_NoFields)
  {
    if (emptyMessage)
    {
      retVal = emptyMessage;
    }
    else
    {
      retVal = MM.MSG_NeedColumn;
    }
  }

  paramObj[this.paramName] = colName;
    
  return retVal;
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
function EditableRecordsetFieldMenu_inspectServerBehavior(sbObj, notFoundMsg)
{
  var retVal = true;
  
  if (this.listControl.isEditable() &&
      this.listControl.list[0] && 
      this.listControl.list[0] == MM.LABEL_NoFields)
  {
    this.listControl.setIndex(0);
    this.listControl.del();
  }
  
  // call updateUI in case we are being called from a UD4 SB
  this.updateUI();
    
  var colName = sbObj.parameters[this.paramName];

  retVal = this.pickValue(colName);

  if (!retVal)
  {
    if (notFoundMsg)
    {
      alert(notFoundMsg);
    }
    else if (!this.listControl.isEditable())
    {
      alert(dwscripts.sprintf(MM.MSG_CouldNotFindFieldName,colName));
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
function EditableRecordsetFieldMenu_analyzeServerBehavior(sbObj, allRecs)
{
  // NOTE: do not use this.listControl in this function,
  // because initializeUI() has not yet been run
  
  var control = dwscripts.findDOMObject(this.paramName);
  
  if (control && !control.editable)
  {
    // We are called before initializeUI, so we need to set
    // rsParamName if it was not passed to us in the contructor
    if (!this.rsParamName)
    {
      if (window.MM_RECORDSET_MENU)
      {
        this.rsParamName = window.MM_RECORDSET_MENU.paramName;
      }
    }

    // Now check if the field name is valid
    if (this.rsParamName &&
        !sbObj.incomplete && 
        !this.fieldNameIsValid(sbObj.parameters[this.rsParamName], sbObj.parameters[this.paramName]))
    {
      sbObj.incomplete = true;
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   findAllFieldNames
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function EditableRecordsetFieldMenu_findAllFieldNames(rsName)
{
  var retVal = false;
  
  if (dwscripts && dwscripts.getFieldNames)
  {
    retVal = dwscripts.getFieldNames(rsName);
  }
  else
  {
    var serverModelFolder = dw.getDocumentDOM().serverModel.getFolderName();

    //ask dreamweaver for the list of data sources
    var dsList = dw.dbi.getDataSources();

    //find the data source with the given name
    for (var i=0; i < dsList.length; i++)
    {
      if (dsList[i].name == rsName || dsList[i].title == rsName)
      {
        var dataSource = dsList[i].dataSource;

        //get the dom of the data source
        var dsDOM = dreamweaver.getDocumentDOM(dreamweaver.getConfigurationPath() + "/DataSources/" + serverModelFolder + "/" + dataSource);

        //call the generateDynamicSourceBindings function
        if (dsDOM)
        {
          objList = dsDOM.parentWindow.generateDynamicSourceBindings(dsList[i].title);
          if (objList && objList.length)
          {
            retVal = new Array();
            for (var j=0; j < objList.length; j++)
            {
              retVal.push(objList[j].title);
            }
          }
        }

        break;
      }
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   fieldNameIsValid
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function EditableRecordsetFieldMenu_fieldNameIsValid(rsName, fieldName)
{
  var retVal = false;
  
  if (fieldName)
  {
    var fieldNames = this.findAllFieldNames(rsName);
    
    for (var i=0; fieldNames && i < fieldNames.length; i++)
    {
      if (fieldNames[i].toUpperCase() == fieldName.toUpperCase())
      {
        retVal = true;
        break;
      }
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
function EditableRecordsetFieldMenu_findServerBehaviors(paramObj)
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
function EditableRecordsetFieldMenu_canApplyServerBehavior(sbObj)
{
  var retVal = true;
  
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
function EditableRecordsetFieldMenu_deleteServerBehavior(sbObj)
{
  // no op
}

