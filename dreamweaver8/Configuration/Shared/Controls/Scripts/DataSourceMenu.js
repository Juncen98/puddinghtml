//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//*-------------------------------------------------------------------
// CLASS:
//   DataSourceMenu
//
// DESCRIPTION:
//   This class represents a menu of data source names.
//   Only data sources which have xml files implementing this
//   server behavior will be listed in the menu.  This is determined
//   through the two group file attributes 'serverBehavior' and
//   'dataSource'
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//
//--------------------------------------------------------------------




//*-------------------------------------------------------------------
// FUNCTION:
//  DataSourceMenu
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function DataSourceMenu(behaviorName, paramName) {
  this.behaviorName = behaviorName;
  this.paramName = paramName;
  
  this.listControl = '';
}

//public methods
DataSourceMenu.prototype.initializeUI = DataSourceMenu_initializeUI;
DataSourceMenu.prototype.findServerBehaviors = DataSourceMenu_findServerBehaviors;
DataSourceMenu.prototype.canApplyServerBehavior = DataSourceMenu_canApplyServerBehavior;
DataSourceMenu.prototype.applyServerBehavior = DataSourceMenu_applyServerBehavior;
DataSourceMenu.prototype.inspectServerBehavior = DataSourceMenu_inspectServerBehavior;
DataSourceMenu.prototype.deleteServerBehavior = DataSourceMenu_deleteServerBehavior;
DataSourceMenu.prototype.analyzeServerBehavior = DataSourceMenu_analyzeServerBehavior;
DataSourceMenu.prototype.getValue = DataSourceMenu_getValue;

//private methods
DataSourceMenu.prototype.findAllDataSourcesNames = DataSourceMenu_findAllDataSourcesNames;
DataSourceMenu.prototype.dsNameIsValid = DataSourceMenu_dsNameIsValid;


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
function DataSourceMenu_initializeUI()
{ 
  var nameValueArray = this.findAllDataSourcesNames();
  var dsNames  = nameValueArray[0];
  var dsValues = nameValueArray[1];
  
  this.listControl = new ListControl(this.paramName);
  this.listControl.setAll(dsNames,dsValues);
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
function DataSourceMenu_findServerBehaviors(paramObj) {
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
function DataSourceMenu_canApplyServerBehavior(sbObj) {
  var retVal = true;
  
  var nameValueArray = this.findAllDataSourcesNames();

  var dsNames = nameValueArray[0];

  if (!sbObj && dsNames.length == 0)
  {
    alert(dwscripts.sprintf(MM.MSG_NoRecordsets, dwscripts.getRecordsetDisplayName()));
    retVal = false;                     //return false to indicate an error
  }
    
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
function DataSourceMenu_applyServerBehavior(sbObj, paramObj) {
  var dsName  = this.listControl.get();
  var dsValue = this.listControl.getValue();
  
  //set the special data source flag, so that the sbManager adds
  // the correct code to the page
  paramObj.MM_dataSource = dsValue;
  
  //add the data source name to the paramObj
  paramObj[this.paramName] = dsName;
  
  return "";
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
function DataSourceMenu_inspectServerBehavior(sbObj, newErrMsgStr) 
{
  var retVal = false;
  
  var dsName = sbObj.parameters[this.paramName];
  
  //find the name in the list
  for (var i=0; i < this.listControl.getLen() ; i++) {
    if (this.listControl.get(i) == dsName) {
      retVal = this.listControl.setIndex(i);
      break;
    }
  }
  
  //now limit the list to only data sources of the same type
  if (retVal) {
    
    var dsValue = this.listControl.getValue(i);
    for (var i=this.listControl.getLen(); i >= 0; i--) {
      if (this.listControl.getValue(i) != dsValue) {
        this.listControl.del(i);
      }
    }
    
  } else { // data source name not found
    
    //display error message (default if none). If "" passed in, don't display any error.
    if (newErrMsgStr == null)
	{
	  var displayName = dwscripts.getRecordsetDisplayName();
      alert(dwscripts.sprintf(MM.MSG_CouldNotFindRecordsetName, displayName, dsName, displayName));
    }
	else if (newErrMsgStr.length)
	{
      alert(newErrMsgStr);
    }
    
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
function DataSourceMenu_deleteServerBehavior(sbObj) {
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
function DataSourceMenu_analyzeServerBehavior(sbObj, allRecs) {
  if (!sbObj.incomplete && !this.dsNameIsValid(sbObj.parameters[this.paramName])) {
    sbObj.incomplete = true;
  }
}



//*-------------------------------------------------------------------
// FUNCTION:
//   getValue
//
// DESCRIPTION:
//   This function returns the name of the currently selected data source
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//   string - selected data source name
//--------------------------------------------------------------------
function DataSourceMenu_getValue() {
  return this.listControl.get();
}



//*-------------------------------------------------------------------
// FUNCTION:
//   findAllDataSourcesNames
//
// DESCRIPTION:
//   This function returns a list of all the data source names and
//   values which are defined for the given behavior name.
//   It first gets a list of data sources on the page, then it gets
//   a list of group xml files which reference this behavior.  These
//   lists are then compared to determine the final list of data
//   sources.
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//   an array of two arrays - the first array is the names of the
//   datasources, the second array is the type of each datasource.
//--------------------------------------------------------------------
function DataSourceMenu_findAllDataSourcesNames() {
  var nameValueArray = new Array();

  var dsNames = new Array();
  var dsValues = new Array();
  
  //ask dreamweaver for the list of data sources
  var dsList = dw.dbi.getDataSources();
  
  //get the list of groups which reference this server behavior  
  var brList = dw.getExtGroups(this.behaviorName, "serverBehavior");
  
  //for each data source, check if a group file exists for it
  for (var i=0; i < dsList.length; i++) {
    for (var j = 0; j < brList.length; j++) {
      var dsSource = dw.getExtDataValue(brList[j],"dataSource");

      if (dsSource == dsList[i].dataSource) {

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
      dsNames.push(dsList[i].name);
      dsValues.push(dsList[i].dataSource);
    }
      }
    }
  }
  
  //add the names and values arrays to the return array
  nameValueArray.push(dsNames);
  nameValueArray.push(dsValues);

  return nameValueArray;
}



//*-------------------------------------------------------------------
// FUNCTION:
//   dsNameIsValid
//
// DESCRIPTION:
//   This function returns true if the given data source name exists
//   in our list of valid data source names.
//
// ARGUMENTS: 
//   the name of a data source
//
// RETURNS:
//   boolean - true if the name is valid, false otherwise
//--------------------------------------------------------------------
function DataSourceMenu_dsNameIsValid(dsName) {
  var retVal = false;
  
  var nameValueArray = this.findAllDataSourcesNames();
  
  var dsNames    = nameValueArray[0];

  for (var i=0; i < dsNames.length; i++) {
    if (dsNames[i] == dsName) {
      retVal = true;
      break;
    }
  }
  
  return retVal;
}

