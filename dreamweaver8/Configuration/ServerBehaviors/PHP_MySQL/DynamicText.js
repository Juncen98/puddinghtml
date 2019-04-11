// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

var HELP_DOC = MM.HELP_ssDynamicData;

var SB_NAME = dwscripts.getSBFileName();


// ******************* API **********************

//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//   Prepare the dialog and controls for user input
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function initializeUI()
{
}


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
  var sbArray = new Array();

  sbArray = dwscripts.findSBs(MM.LABEL_DynamicTextTitle);
  
  for (var i=0; i < sbArray.length; i++)
  {
    // Set the priority to the lowest, so that this server behavior
    //  will only claim nodes that don't belong to other SBs
    sbArray[i].setPriority(10);
    
    // Set the title to include the binding parameter if appropriate
    var source = sbArray[i].getParameter("source");
    var binding = sbArray[i].getParameter("binding");
    
    if (source)
    {
      source = unescape(source);  // remove the URL encoding
    }
    if (binding)
    {
      binding = unescape(binding); // remove the URL encoding
    }
    
    if (source && binding)
    {
      sbArray[i].setTitle(MM.LABEL_DynamicTextTitle + " (" + source + "." + binding + ")");
    }
    else if (binding)
    {
      sbArray[i].setTitle(MM.LABEL_DynamicTextTitle + " (" + binding + ")");
    }
    else if (source)
    {
      sbArray[i].setTitle(MM.LABEL_DynamicTextTitle + " (" + source + ")");
    }
  }
    
  
  return sbArray;
}


//--------------------------------------------------------------------
// FUNCTION:
//   canApplyServerBehavior
//
// DESCRIPTION:
//   Returns true if a Server Behavior can be applied to the current
//   document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   boolean - true if the behavior can be applied, false otherwise
//--------------------------------------------------------------------
function canApplyServerBehavior(sbObj)
{
  // Enable apply if there are existing datasources or if the server behavior
  //   is already on the page.
  var dataSources = null;
  if (dw.dbi)
    dataSources = dw.dbi.getDataSources();

  if (sbObj || (dataSources != null && dataSources.length > 0))
  {
    return true;
  }
  else 
  {
    alert(dwscripts.sprintf(MM.MSG_NoRecordsets, dwscripts.getRecordsetDisplayName()));
    return false;
  }
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
  var dom = dw.getDocumentDOM();
  
  var paramObj = new Object();
  var errStr = "";

  var priorSrc = "";
  var nodeSeg = null;
  if (sbObj)
  {
    var parts = sbObj.getParticipants();
    if (parts.length > 0)
    {
      nodeSeg = parts[0].getNodeSegment();
      if (nodeSeg)
      {
        priorSrc = nodeSeg.toString();
        priorSrc = priorSrc.replace(/[\n\r]/g,"");
      }
    }
  }
  
  // If this is a first time insert, fix up the selection.
  // This needs to be correct before we launch the dynamic data dialog, 
  // so that the correct delimeters are returned.
  var adjustedForTableCell = false;
  if (!sbObj)
  {
    dwscripts.fixUpSelection(dom, false); // move selection to body if in head
    adjustedForTableCell = dwscripts.adjustCursorForEmptyTableCell();
  }

  expression = dreamweaver.showDynamicDataDialog(priorSrc, MM.LABEL_DynamicTextTitle);

  if (expression)
  {
    if (sbObj)
    {
      if (priorSrc && nodeSeg)
      {
        dwscripts.queueNodeEdit(expression, nodeSeg.node, nodeSeg.matchRangeMin, nodeSeg.matchRangeMax, true);
        dwscripts.applyDocEdits();
      }
    }
    else
    {
      var editType = "afterSelection";
      if (adjustedForTableCell)
      {
        editType = "replaceSelection";
      }
      
      dwscripts.queueDocEdit(expression, editType, null, false, true);
      dwscripts.applyDocEdits();
    }
  }
  
  return errStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//   Sets the values of the form elements in the dialog box based
//   on the given ServerBehavior object
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function inspectServerBehavior(sbObj)
{
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
//   analyzeServerBehavior
//
// DESCRIPTION:
//   Performs extra checks needed to determine if the Server Behavior
//   is complete
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//   allRecs - JavaScripts Array of ServerBehavior objects - all of the
//             ServerBehavior objects known to Dreamweaver
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function analyzeServerBehavior(sbObj, allSBs)
{
  sbObj.deleteIfAlreadyReferenced(allSBs);
  sbObj.deleteIfSelectedNodeOutsideBody();
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
  dwscripts.displayDWHelp(HELP_DOC);
}

