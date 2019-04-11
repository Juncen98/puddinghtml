//SHARE-IN-MEMORY=true
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   RecordsetFieldsOrderedList
//
// DESCRIPTION:
//   Creates a list of the fields in a given recordset.
//   These fields can be deleted (and added back), moved up, and moved down.
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//
//--------------------------------------------------------------------


//--------------------------------------------------------------------
// FUNCTION:
//   RecordsetFieldsOrderedList
//
// DESCRIPTION:
//   Constructor function for the RecordsetFieldsOrderedList control
//
// ARGUMENTS:
//   behaviorName - the name of the behavior using this control
//   paramName - the name of the parameter that is being set
//
// RETURNS:
//--------------------------------------------------------------------

function RecordsetFieldsOrderedList(behaviorName, paramName, empty, rsMenuObj)
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
  
  this.unusedFields = new Array();
  
  this.listControl = "";  
}


//public methods
RecordsetFieldsOrderedList.prototype.initializeUI = RecordsetFieldsOrderedList_initializeUI;
RecordsetFieldsOrderedList.prototype.updateUI = RecordsetFieldsOrderedList_updateUI;

RecordsetFieldsOrderedList.prototype.findServerBehaviors = RecordsetFieldsOrderedList_findServerBehaviors;
RecordsetFieldsOrderedList.prototype.canApplyServerBehavior = RecordsetFieldsOrderedList_canApplyServerBehavior;
RecordsetFieldsOrderedList.prototype.applyServerBehavior = RecordsetFieldsOrderedList_applyServerBehavior;
RecordsetFieldsOrderedList.prototype.inspectServerBehavior = RecordsetFieldsOrderedList_inspectServerBehavior;
RecordsetFieldsOrderedList.prototype.deleteServerBehavior = RecordsetFieldsOrderedList_deleteServerBehavior;
RecordsetFieldsOrderedList.prototype.analyzeServerBehavior = RecordsetFieldsOrderedList_analyzeServerBehavior;
RecordsetFieldsOrderedList.prototype.getValue = RecordsetFieldsOrderedList_getValue;

//private methods
RecordsetFieldsOrderedList.prototype.canDisplayMoreFields = RecordsetFieldsOrderedList_canDisplayMoreFields;
RecordsetFieldsOrderedList.prototype.getFields = RecordsetFieldsOrderedList_getFields;
RecordsetFieldsOrderedList.prototype.updateUnusedFieldsArray = RecordsetFieldsOrderedList_updateUnusedFieldsArray;



//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI()
//
// DESCRIPTION:
//   initializes the list control with the names of the connections
//
// ARGUMENTS:
//   elementName - string - (optional) the name of the form control, if it
//     differs from the parameter name
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function RecordsetFieldsOrderedList_initializeUI(elementName) 
{ 
  if (!this.rsMenuObj)
  {
    if (this.rsParamName)
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
      alert(MM.MSG_MENU_ERROR_7); 
    }
  }
  
  var elemName = (elementName) ? elementName : this.paramName;
  
  this.listControl = new ListControl(elemName);
  
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
                                                     ";_" + this.paramName + ".updateUI('chooseDifferentRecordset');";
      } 
      else 
      {
        this.recordset.listControl.object.onChange = "_" + this.paramName + ".updateUI('chooseDifferentRecordset');";
      }

      if (this.recordset.listControl.isEditable()) 
      {
        if (this.recordset.listControl.object.onBlur)
        {
          this.recordset.listControl.object.onBlur = this.recordset.listControl.object.onBlur +
                                                     ";_" + this.paramName + ".updateUI('chooseDifferentRecordset');"

        } 
        else
        {
          this.recordset.listControl.object.onBlur = "_" + this.paramName + ".updateUI('chooseDifferentRecordset');";
        }
      }
    }
  }
  
  this.updateUI("chooseDifferentRecordset");
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

function RecordsetFieldsOrderedList_findServerBehaviors(paramObj)
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
function RecordsetFieldsOrderedList_canApplyServerBehavior(sbObj)
{
  // no op: this element needs a recordset to be applied, but the
  // recordset control already displays this message, and this
  // element is always used with a recordset menu
  
  return true;
}


//--------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS: a comma-deliminated string of the chosen fields
//--------------------------------------------------------------------

function RecordsetFieldsOrderedList_applyServerBehavior(sbObj, paramObj)
{
  var fieldNamesArr = this.listControl.list;
  
  paramObj[this.paramName] = fieldNamesArr;
   
  return "";
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

function RecordsetFieldsOrderedList_inspectServerBehavior(sbObj, newErrMsgStr) 
{
  var fieldsArr = sbObj[this.paramName];
  
  // The line above seems wrong, but I am leaving it for backwards compatibility.
  //  If it returns null, like I expect it to, the try the parameters property.
  if (!fieldsArr)
  {
    fieldsArr = sbObj.parameters[this.paramName];
  }
  
  // In case the user uses this with a non-array parameter, convert it to an array
  if (typeof fieldsArr == "string")
  {
    fieldsArr = fieldsArr.split(",");
  }
  
  
  // move the current columns to the unused list,
  // then add the listed columns back to the list control,
  // and remove them from the unused list
  this.unusedFields = this.listControl.list;
  
  this.listControl.setAll(fieldsArr, fieldsArr);
  
  var nFields = fieldsArr.length, i, currField;
  
  for (i=0;i<nFields;i++)
  {
    currField = fieldsArr[i];
    
    this.updateUnusedFieldsArray('del', currField);
  }

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

function RecordsetFieldsOrderedList_deleteServerBehavior(sbObj)
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

function RecordsetFieldsOrderedList_analyzeServerBehavior(sbObj, allRecs)
{
  // no op
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------

function RecordsetFieldsOrderedList_updateUI(how)
{
  if (typeof how == "string")
  {
    var listControl = this.listControl;
    var currInd = listControl.getIndex();
    var currLen = listControl.getLen();

    switch (how)
    { 
      case "chooseDifferentRecordset":
        var rsName = this.rsMenuObj.getValue();
        var fieldNames = dwscripts.getFieldNames(rsName);

        listControl.setAll(fieldNames, fieldNames);
        listControl.setIndex(0);
        this.unusedFields = new Array();
        break;

      case "moveFieldUp":
        if (currInd != 0)  // check that first item is not selected
        {
          var fieldName = this.listControl.get();
          var temp = "";

          temp = listControl.get(currInd-1);
          listControl.set(fieldName,currInd-1);
          listControl.set(temp,currInd);
          listControl.setIndex(currInd-1);
        }
        break;

      case "moveFieldDown":
        if ( (currInd != (currLen-1) ) && (currInd != -1)) // check for last item selection
        {
          var fieldName = this.listControl.get();
          var temp = "";

          temp = listControl.get(currInd+1);
          listControl.set(fieldName,currInd+1);
          listControl.set(temp,currInd);
          listControl.setIndex(currInd+1);
        }
        break;

      case "addField":
        // check to see if there are columns to add first
        var unusedFieldsArr = this.unusedFields;

        if (unusedFieldsArr.length == 0)
        {
          alert(MM.MSG_NoMoreColumnsToAdd);
          return;
        }

        var fieldsToAdd = dwscripts.callCommand('Add Column.htm',unusedFieldsArr);
        if (!fieldsToAdd) return; // user clicked Cancel

        var nFields = fieldsToAdd.length,i, newField;

        for (i=0;i<nFields;i++)
        {
          listControl.add(fieldsToAdd[i]);
          this.updateUnusedFieldsArray('del',fieldsToAdd[i]);
        }
        break;

      case "removeField": 

        // check to see that the last field is not being deleted
        // since multiple items can be selected, check that not
        // all items are selected
        var listObj = listControl.object;
        var nItems  = listObj.options.length;
        var nSelected = 0;
        var i;
        var removeArr = new Array();

        for (i=0;i<nItems;i++)
        {
          if (listObj.options[i].selected == true)
          {
            nSelected++;
            removeArr.push(listObj.options[i].text);
          }
        }

        if (nItems == 1 || nItems == nSelected)
        {
          alert(MM.MSG_NeedOneColumnInList);
          return;
        }

        // move all deleted fields to the unused field array
        for (var i=0;i<removeArr.length;i++)
        {
          this.updateUnusedFieldsArray("add",removeArr[i]);
        }

        // do the actual deletion
        listControl.del();
        break;

      default:
        break;
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   populateFieldsList
//
// DESCRIPTION:
//
// ARGUMENTS: whichFields: an integer of 0 or 1
//
// RETURNS:
//--------------------------------------------------------------------

function RecordsetFieldsOrderedList_launchUnusedFieldsDialog ()
{
}


//--------------------------------------------------------------------
// FUNCTION:
//   canDisplayMoreFields
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------

function RecordsetFieldsOrderedList_canDisplayMoreFields ()
{
  return (this.unusedFields.length > 0);
}


//--------------------------------------------------------------------
// FUNCTION:
//   getFields
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------

function RecordsetFieldsOrderedList_getFields (rsName)
{
  
  var retVal;
  var serverModel = dw.getDocumentDOM().serverModel.getServerName();
  
  //ask dreamweaver for the list of data sources
  var dsList = dw.dbi.getDataSources();
  
  //find the data source with the given name
  for (var i=0; i < dsList.length; i++) {
    if (dsList[i].name == rsName || dsList[i].title == rsName) {
      var dataSource = dsList[i].dataSource;
            
      //get the dom of the data source
      var dsDOM = dreamweaver.getDocumentDOM(dreamweaver.getConfigurationPath() + "/DataSources/" + serverModel + "/" + dataSource);

      //call the generateDynamicSourceBindings function
      if (dsDOM) {
        objList = dsDOM.parentWindow.generateDynamicSourceBindings(rsName);
        if (objList && objList.length) {
          retVal = new Array();
          for (var j=0; j < objList.length; j++) {
            retVal.push(objList[j].title);
          }
        }
      }
      
      break;
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateUnusedFieldsArray
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------

function RecordsetFieldsOrderedList_updateUnusedFieldsArray(action,field)
{
   var unusedFieldsArr = this.unusedFields;
   
   if (action == 'add')
   {
      unusedFieldsArr.push(field);
   } 
   else if ( action == 'clear')
   {
     unusedFieldsArr = new Array();
   } 
   else 
   { // delete an item from additional column list
     var nItems = unusedFieldsArr.length,i;
     
     for (i=0;i<nItems;i++)
     {
       if (unusedFieldsArr[i] == field)
       {
         unusedFieldsArr.splice(i,1);
         break;
       }
     }
   }
}


//--------------------------------------------------------------------
// FUNCTION:
//   getValue
//
// DESCRIPTION:
//   returns the current fields in an array
//
// ARGUMENTS: 
//
//
// RETURNS:
//   an array
//--------------------------------------------------------------------

function RecordsetFieldsOrderedList_getValue(returnAsArray)
{
  return this.listControl.list;
}

