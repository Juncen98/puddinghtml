// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

var helpDoc = MM.HELP_sbASPNetUpdateRecord; 
var SB_NAME = dwscripts.getSBFileName();

//--------------------------------------------------------------------
// FUNCTION:
//   findServerBehaviors
//
// DESCRIPTION:
//   Returns an array of ServerBehavior objects, each one representing
//   an instance of this Server Behavior on the page
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   JavaScript Array of ServerBehavior objects
//--------------------------------------------------------------------

function findServerBehaviors()
{
  var sbArray = dwscripts.findSBs(MM.LABEL_TitleUpdateRecord, SBUpdateRecord);
  
  for (var i = 0; i < sbArray.length; i++)
  {
    sbArray[i].postProcessFind("UpdateRecord_main", MM.LABEL_TitleUpdateRecord);
  }

  return sbArray;
}

//--------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//   Collects values from the form elements in the dialog box and
//   adds the Server Behavior to the user's document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   string - empty upon success, or an error message
//--------------------------------------------------------------------

function applyServerBehavior(sbObj)
{
  var newObj = null; 

  if (sbObj)
  {
    newObj = sbObj.makeEditableCopy();
  }
  else
  {
    newObj = new SBUpdateRecord();
  }
  
  if (!updateSBObjFromUI(newObj) || !newObj.checkData())
  {
    return newObj.getErrorMessage();
  }

  try
  {
    if (newObj)
    {
      dwscripts.fixUpSelection(dw.getDocumentDOM(), true, true);
      dwscripts.applySB(newObj.getParameters(), sbObj);

      // Mark the cache as dirty.

      MMDB.refreshCache(true);
    }
  }
  finally
  {
    // We are building up individual doc edits to apply to the document. If some
    //   JavaScript error occurs, we need to clear leftover edits that didn't
    //   get applied. Otherwise, they'll get added on the next apply.
    
	dwscripts.clearDocEdits();
  }
      
  return "";
}

//--------------------------------------------------------------------
// FUNCTION:
//   deleteServerBehavior
//
// DESCRIPTION:
//   Remove the specified Server Behavior from the user's document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function deleteServerBehavior(sbObj)
{
  dwscripts.deleteSB(sbObj);
}

//--------------------------------------------------------------------
// FUNCTION:
//   displayHelp
//
// DESCRIPTION:
//   Displays the built-in Dreamweaver help.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function displayHelp()
{
  // Replace the following call if you are modifying this file for your own use.
  dwscripts.displayDWHelp(helpDoc);
}
