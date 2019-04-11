// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   sbUtils
//
// DESCRIPTION:
//   This file contains shared functions for use within Macromedia
//   Server Behaviors.  Please see the dwscripts class in 
//   Configuration/Shared/Common/Scripts for more general purpose
//   utilities.  In other words... move along, nothing to see here.
//
// PUBLIC PROPERTIES:
//   TBD
//
// PUBLIC FUNCTIONS:
//   TBD
//--------------------------------------------------------------------

function sbUtils()
{
}

// Static Properties

sbUtils.RECORDSET_FILE_NAME = "Recordset.htm";
sbUtils.REPEAT_REGION_FILE_NAME = "RepeatedRegion.htm";

// Static Methods

sbUtils.canApplyRepeatRegionDependentItem = sbUtils_canApplyRepeatRegionDependentItem;
sbUtils.getRepeatRegions = sbUtils_getRepeatRegions;
sbUtils.getRepeatRegionWithPageNav = sbUtils_getRepeatRegionWithPageNav;
sbUtils.checkForRepeatRegionWithPageNav = sbUtils_checkForRepeatRegionWithPageNav;
sbUtils.getRecordsetNameWithPageNav = sbUtils_getRecordsetNameWithPageNav;

//--------------------------------------------------------------------
// FUNCTION:
//   sbUtils.canApplyPagingDependentItem
//
// DESCRIPTION:
//   This function checks to see if any Repeat Region SBs exist
//   on the page.   If none are found, and appropriate error
//   message is displayed.
//
// ARGUMENTS:
//   isServerObject - boolean - true if this is called from a server
//     object
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function sbUtils_canApplyRepeatRegionDependentItem(isServerObject)
{
  var retVal = false;
  var serverObj = dwscripts.getServerImplObject();

  if ((serverObj != null) && (serverObj.canApplyRepeatRegionDependentItem != null))
  {
    retVal = serverObj.canApplyRepeatRegionDependentItem(isServerObject);
  }
  else
  {
    var sbObjs = dwscripts.getServerBehaviorsByFileName(sbUtils.REPEAT_REGION_FILE_NAME);
  
    retVal = (sbObjs && sbObjs.length > 0);
  
    if (!retVal)
    {
      if (isServerObject)
      {
        alert(MM.MSG_NeedRepeatRegionForSO);
      }
      else
      {
        alert(MM.MSG_NeedRepeatRegionForSB);
      }
    }
  }
   
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   sbUtils.getRepeatRegions
//
// DESCRIPTION:
//   Returns the array of repeat region Server Behavior objects which
//   are associated with the given recordset name.  If no recordset
//   name is provided, then all repeat regions are returned.
//
// ARGUMENTS:
//   recordsetName - string - (optional) the name of the recordset
//     which the repeat region should be associated with
//   ignoreCase - boolean - true if the case of the recordset name
//     should not be considered
//
// RETURNS:
//   array of server behavior objects
//--------------------------------------------------------------------

function sbUtils_getRepeatRegions(recordsetName, ignoreCase)
{
  var retVal = new Array();

  if (recordsetName && ignoreCase)
  {
    recordsetName = recordsetName.toLowerCase();
  }
  
  var sbObjs = dwscripts.getServerBehaviorsByFileName(sbUtils.REPEAT_REGION_FILE_NAME);
  sbObjs = sbObjs.concat(dwscripts.getServerBehaviorsByFileName(sbUtils.RECORDSET_FILE_NAME));

  for (var i = 0; i < sbObjs.length; i++)
  {
    if (recordsetName && (sbObjs[i].getRecordsetName != null))
    {
      var sbRsName = sbObjs[i].getRecordsetName();

      if (ignoreCase)
      {
        sbRsName = sbRsName.toLowerCase();
      }

      if (recordsetName == sbRsName)
      {
        retVal.push(sbObjs[i]);
      }
    }
    else
    {
      retVal.push(sbObjs[i]);
    }
  }

  return retVal;  
}


//--------------------------------------------------------------------
// FUNCTION:
//   sbUtils.getRepeatRegionWithPageNav
//
// DESCRIPTION:
//   Returns the Server Behavior object for the Repeat Region
//   associated with the given recordset name.  If no recordset
//   name is provided, the first page navigation repeat region
//   is returned.
//
// ARGUMENTS:
//   recordsetName - string - (optional) the name of the recordset
//     which the repeat region should be associated with
//   ignoreCase - boolean - true if the case of the recordset name
//     should not be considered
//     
// RETURNS:
//   Server Behavior object, or null if none found
//--------------------------------------------------------------------

function sbUtils_getRepeatRegionWithPageNav(recordsetName, ignoreCase)
{
  var retVal = null;
  var sbObjs = this.getRepeatRegions(recordsetName, ignoreCase);
  
  for (var i = 0; i < sbObjs.length; i++)
  {
    if ((sbObjs[i].isPageNavigation != null) &&
         sbObjs[i].isPageNavigation())
    {
      retVal = sbObjs[i];
      break;
    }
  }

  return retVal;  
}


//--------------------------------------------------------------------
// FUNCTION:
//   sbUtils.checkForRepeatRegionWithPageNav
//
// DESCRIPTION:
//   This function checks to see if a Repeat Region Server Behavior
//   exists with the given recordset name
//
// ARGUMENTS:
//   recordsetName - string - the name of the recordset to check for
//   ignoreCase - boolean - true if the case of the recordset name
//     should not be considered
//
// RETURNS:
//   string - error message if not found, or empty string
//--------------------------------------------------------------------

function sbUtils_checkForRepeatRegionWithPageNav(recordsetName, ignoreCase)
{
  var retVal = ""; 
  var serverObj = dwscripts.getServerImplObject();

  if ((serverObj != null) && (serverObj.checkForRepeatRegionWithPageNav != null))
  {
    retVal = serverObj.checkForRepeatRegionWithPageNav(recordsetName, ignoreCase);
  }
  else
  {
    var sbObj = sbUtils.getRepeatRegionWithPageNav(recordsetName, ignoreCase);
  
    if (sbObj == null) // none found
    {
      // check if any repeat regions exist for this recordset
      var matchingSBs = sbUtils.getRepeatRegions(recordsetName, ignoreCase);
    
      if (matchingSBs.length == 1 && matchingSBs[0].convertToPageNavigation != null)
      {
        matchingSBs[0].convertToPageNavigation();
      }
      else if (matchingSBs.length > 0)
      {
        retVal = dwscripts.sprintf(MM.NeedRepeatRegionWithPageNav, recordsetName);
      }
      else
      {
        retVal = dwscripts.sprintf(MM.NeedRepeatRegionForRecordset, recordsetName);
      } 
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   sbUtils_getRecordsetNameWithPageNav
//
// DESCRIPTION:
//   Returns the name of the first recordset found which has a page
//   navigation repeat region associated with it.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - recordset name
//--------------------------------------------------------------------

function sbUtils_getRecordsetNameWithPageNav()
{
  var retVal = "";
  var serverObj = dwscripts.getServerImplObject();

  if ((serverObj != null) && (serverObj.getRecordsetNameWithPageNav != null))
  {
    retVal = serverObj.getRecordsetNameWithPageNav();
  }
  else
  {
    var sbObj = sbUtils.getRepeatRegionWithPageNav();
  
    if (sbObj != null)
    {
      retVal = sbObj.getRecordsetName();
    }
  }

  return retVal;  
}
