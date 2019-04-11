// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//-****************** GLOBAL VARS **********************

var HELP_DOC = MM.HELP_ssRepeatedRegion;

var rsName = new RecordsetMenu("Repeated Region.htm", "rsName");

var RADIOS_count = '';
var RADIO_value = 0;
var RADIO_all = 1;

var TEXT_repeatCount = '';

                                
//-****************** API **********************


//--------------------------------------------------------------------
// FUNCTION:
//   findServerBehaviors
//
// DESCRIPTION:
//   Locates instances of this server behavior on the current page.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   an array of SSRecord objects
//--------------------------------------------------------------------
function findServerBehaviors()
{
  var paramObj = new Object();

  rsName.findServerBehaviors(paramObj);

  var sbList = dwscripts.findSBs(MM.LABEL_TitleRepeatRegion + " (@@rsName@@)");
  
  return sbList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   canApplyServerBehavior
//
// DESCRIPTION:
//   Returns true if the server behavior can be applied.
//   Otherwise, displays an alert and returns false.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function canApplyServerBehavior(sbObj)
{
  var success = true;

  if (success)
    success = rsName.canApplyServerBehavior(sbObj);

  if (success && (!sbObj || !sbObj.selectedNode))
  {
    var errMsg = checkForInvalidSelection();
    if (errMsg)
    {
      alert(errMsg);
      success = false;
    }
  }
  
  return success;
}


//--------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//   adds the server behavior to the users page, based on the UI settings
//
// ARGUMENTS:
//   sbObj - if we are re-applying, the previous SSRecord for this
//              server behavior
//
// RETURNS:
//   string - error message to indicate failure, or the empty string
//            to indicate success
//--------------------------------------------------------------------
function applyServerBehavior(sbObj)
{
  var paramObj = new Object();
  var dom = dw.getDocumentDOM();
  var currServerModel = dom.serverModel.getServerName();
  var errStr = "";

  if (!errStr)
    errStr = rsName.applyServerBehavior(sbObj, paramObj);

  if (!errStr) {
    if (sbObj && sbObj.parameters.loopName) {
      paramObj.loopName = sbObj.parameters.loopName;
    } else {
      paramObj.loopName = createUniqueRepeatedRegionName();
    }
  }
    
  if (!errStr) {
    if (RADIOS_count.getSelectedIndex() == RADIO_value) { //user entered count
      paramObj.numRows = TEXT_repeatCount.value;

      if (!paramObj.numRows) {
        errStr = MM.MSG_NothingEntered;
      } else { 
        var rc = parseInt(paramObj.numRows);

        if (rc != paramObj.numRows || rc <= 0) {
          errStr = MM.MSG_ValueGreaterThanZero;
        }
      }
      
    } else { //all
      paramObj.numRows = -1;
      paramObj.MM_subType = "all";
    }
  }

  if (!errStr) {
    
    //if we are applying the first time, balance the selection
    // and remove nested cfoutput tags
    if (currServerModel == "Cold Fusion" && !sbObj) {

      //Very special case to handle if selection is table row, and <CFOUTPUT><TR><TD>
      //In that case, force selection of <CFOUTPUT> and don't call fixupSelection().
      var selOffsets = dom.getSelection(true);
      var selNode = dom.offsetsToNode(selOffsets[0],selOffsets[1]);
      if (selNode && selNode.tagName == "TD" && selNode.parentNode.tagName == "TR"
          && selNode.parentNode.parentNode.tagName == "CFOUTPUT") {
        selNode = selNode.parentNode.parentNode;
        dom.setSelectedNode(selNode);
        paramObj.MM_selection = selNode.innerHTML;

      //Normal case, fixupSelection().
      } else {
        paramObj.MM_selection = dwscripts.fixUpSelection(dw.getDocumentDOM(),true);
        paramObj.MM_selection = paramObj.MM_selection.replace(/<[\/]?cfoutput>/gi, "");
      }
    }
    else
    {
      dwscripts.fixUpSelection(dw.getDocumentDOM(),true);
    }
    
    //if no dataSource set, set the default
    if (!paramObj.MM_dataSource) {
      paramObj.MM_dataSource = "Recordset.htm";
    }
    
    dwscripts.applySB(paramObj, sbObj);
  }

  return errStr;
}



//--------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//   populates the UI based on the SSRecord of the current server behavior
//
// ARGUMENTS: 
//   sbObj - the instance of the server behavior to inspect
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function inspectServerBehavior(sbObj)
{

  rsName.inspectServerBehavior(sbObj)
    
  if (!sbObj.parameters.numRows || sbObj.parameters.numRows == -1) {
    RADIOS_count.setSelectedIndex(RADIO_all);
  } else {
    RADIOS_count.setSelectedIndex(RADIO_value);
    TEXT_repeatCount.value = sbObj.parameters.numRows;
  }

  updateUI("count");    
}


//--------------------------------------------------------------------
// FUNCTION:
//   deleteServerBehavior
//
// DESCRIPTION:
//   Removes the selected server behavior from the page
//
// ARGUMENTS: 
//   sbObj - the SSRecord of the server behavior to delete
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function deleteServerBehavior(sbObj)
{
  rsName.deleteServerBehavior(sbObj);
  dwscripts.deleteSB(sbObj);
}


//--------------------------------------------------------------------
// FUNCTION:
//   analyzeServerBehavior
//
// DESCRIPTION:
//   Called after all server behaviors have been found to allow
//   for any further checks which need to be performed
//
// ARGUMENTS: 
//   sbObj - the SSRecord of the behavior we are analyzing
//   allRecs - a list of all server behavior records
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function analyzeServerBehavior(sbObj, allRecs)
{
  rsName.analyzeServerBehavior(sbObj, allRecs);

  //For Cold Fusion: if looks like RR but incomplete because rsName is invalid,
  //forget about it if that name comes from valid tag such as CFPOP or CFLDAP.
  if (sbObj.incomplete && isForeignCfDataSource(sbObj.parameters.rsName)) {
    sbObj.deleted = true;
  }
  
  //remove repeat all's which are actually 
  // duplicates of the standard repeat region
  // (No way to eliminate using regular expressions)
  if (sbObj.subType == "all" && 
      sbObj.parameters.loopName != null) {
    sbObj.deleted = true;
  }

  //special case: if incomplete because region missing begin or end block,
  //clear the selectedNode so they can make a new selection and we can repair it.
  if (!sbObj.deleted && sbObj.incomplete && sbObj.types) {
    var currServerModel = dw.getDocumentDOM().serverModel.getServerName();
    if (currServerModel == "ASP" || currServerModel == "JSP") {  //only ASP and JSP
      var allTypes = sbObj.types.join(",");
      hasBegin = (allTypes.indexOf("_begin")!=-1);
      hasEnd   = (allTypes.indexOf("_end"  )!=-1);
      if (hasBegin != hasEnd) {    //if has one and not the other
        sbObj.selectedNode = null; //don't select anything
      }
    }
  }
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



//-**************** LOCAL FUNCTIONS  ******************


//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//   popoulate the UI elements
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function initializeUI()
{
  rsName.initializeUI();
  
  RADIOS_count     =  new RadioGroup("count");
  TEXT_repeatCount = document.repeatCount;
  
  elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
}



//--------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//   process any events from the UI elements
//
// ARGUMENTS:
//   itemName - the name of the control which called updateUI
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function updateUI(itemName)
{
  if (itemName == "count") {
    if (RADIOS_count.getSelectedIndex() == RADIO_all) {
      TEXT_repeatCount.setAttribute("disabled", "true");
    } else {
      TEXT_repeatCount.setAttribute("disabled", "false");
    }
  }
}




//--------------------------------------------------------------------
// FUNCTION:
//   checkForInvalidSelection
//
// DESCRIPTION:
//   This function checks that the current selection is valid for
//   inserting a repeated region
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//   string - an error string if a problem is encountered,
//            otherwise the empty string is returned
//--------------------------------------------------------------------
function checkForInvalidSelection()
{
  var dom = dw.getDocumentDOM();
  var currSelection  = dom.getSelection(true);
  var selObj = dom.getSelectedNode();
  var currServerModel = dw.getDocumentDOM().serverModel.getServerName();
  
  if (currSelection[0] == currSelection[1] || !selectionIsInBody(selObj)) {
    errMsg = MM.MSG_RequiresSelection;
    
  } else if (currServerModel == "Cold Fusion" && isWithinCfoutput(true)) {
    errMsg = MM.MSG_NoRepeatsInCfoutput;
    
  } else {
  
    var currOffsets = currSelection;
    var rrNodes = findAllRepeatedRegionNodes();
    var errMsg = ""
    var rrOffsets, index;

    for (index =0 ; index < rrNodes.length ; index++) {
      rrOffsets = dom.nodeToOffsets(rrNodes[index]);

      if (rrOffsets[0] < currOffsets[0] && rrOffsets[1] > currOffsets[1]) {
        errMsg = MM.MSG_SelectionIsInsideOfRepeatedRegion;
        break;
      } else if ( (rrOffsets[0] > currOffsets[0] && rrOffsets[0] < currOffsets[1]) ||
                  (rrOffsets[1] > currOffsets[0] && rrOffsets[1] < currOffsets[1]) ) {                                                     
        errMsg = MM.MSG_SelectionContainsRepeatedRegion;
        break;
      }
    }
  }
    
  return errMsg;
}

