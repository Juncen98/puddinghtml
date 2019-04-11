// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

var HELP_DOC = MM.HELP_ssRepeatedRegion;

var _RecordsetName = new EditableRecordsetMenu("RepeatedRegion.htm", "RecordsetName", "");
var _PageSize = new TextField("RepeatedRegion.htm", "PageSize", "");
var _Show = new RadioGroup("RepeatedRegion.htm", "Show", "");


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
  var elts;

  _RecordsetName.initializeUI();
  _PageSize.initializeUI();
  _Show.initializeUI();

  elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
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
  sbArray = dwscripts.findSBs(MM.LABEL_TitleRepeatRegion + " (@@RecordsetName@@)", SBRepeatedRegion);
  
  for (var i=0; i < sbArray.length; i++)
  {
    sbArray[i].postProcessFind();
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
  var success = true;
  if (success)
  {
    success = _RecordsetName.canApplyServerBehavior(sbObj);
  }
  if (success)
  {
    success = _PageSize.canApplyServerBehavior(sbObj);
  }
  if (success)
  {
    success = dwscripts.canApplySB(sbObj, true); // preventNesting is true
  }
  
  if (success)
  {
    // Need to check if we are in a CFOUTPUT tag.  
    if (dwscripts.canStripCfOutputTags())
    {
      // Special Case: when all but the CFOUTPUT tags are selected.
         
      success = false;
      
      var dom = dw.getDocumentDOM();
      var selOffsets = dom.getSelection(true);
      var node = dom.offsetsToNode(selOffsets[0],selOffsets[1]);      
      
      // If the selected node is a cfoutput, and the
      //  entire innerHTML is selected, we are fine
      if (node && node.nodeType == Node.ELEMENT_NODE &&
          node.tagName == "CFOUTPUT")
      {
        var innerHTML = dwscripts.trim(dwscripts.getInnerHTML(node));
        
        // If the entire innerHTML is selected
        if (innerHTML.length <= (selOffsets[1] - selOffsets[0]))
        {
          dom.setSelectedNode(node);
          success = true;
        }
      }
      else
      {
        var parentNode = node.parentNode;

        // Special Case: when a row is selected, we actually get
        //  the TR tag as the selection.  Need to set the parentNode
        //  as the parent of the TR tag.
        if (parentNode &&
            parentNode.nodeType == Node.ELEMENT_NODE &&
            parentNode.tagName == "TR")
        {
          node = parentNode;
          selOffsets = dom.nodeToOffsets(node);
          parentNode = node.parentNode;
        }

        // if the cfoutput is the direct parent
        if (parentNode && 
            parentNode.nodeType == Node.ELEMENT_NODE &&
            parentNode.tagName == "CFOUTPUT")
        {
          var innerHTML = dwscripts.trim(dwscripts.getInnerHTML(parentNode));

          // If the entire innerHTML is selected
          if (innerHTML.length <= (selOffsets[1] - selOffsets[0]))
          {
            dom.setSelectedNode(parentNode);
            success = true;
          }
        }
      }
    
      if (!success)
      {
        alert(MM.MSG_NoRepeatsInCfoutput);
      }
    }
  }
  
  return success;
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
  var paramObj = "";
  
  if (sbObj)
  {
    newObj = sbObj.makeEditableCopy();
    paramObj = newObj.getParameters();
  }
  else
  {
    newObj = new SBRepeatedRegion();
    paramObj = newObj.getParameters();
  }
  
  var errStr = "";

  if (!errStr)
  {
    errStr = _RecordsetName.applyServerBehavior(sbObj, paramObj);
  }
  if (!errStr)
  {
    errStr = _PageSize.applyServerBehavior(sbObj, paramObj);
  }
  if (!errStr)
  {
    errStr = _Show.applyServerBehavior(sbObj, paramObj);
  }
  
  if (!errStr)
  {
    if (!newObj.checkData(sbObj))
    {
      errStr = newObj.getErrorMessage();
    }
  }
  
  if (!errStr)
  {
    var node = null;
    if (sbObj == null)
    {
      var dom = dw.getDocumentDOM();
      var selOffsets = dom.getSelection(true);
      node = dom.offsetsToNode(selOffsets[0],selOffsets[1]);      
      
      if (node && node.tagName != "CFOUTPUT")
      {
        node = null;
      }
    }
    
    if (sbObj == null && node == null)
    {
      // first time insert
      
      dwscripts.fixUpSelection(dw.getDocumentDOM(), true, false);
      dwscripts.applySB(paramObj, null)
    }
    else
    {
      // edit the cfoutput tag by hand
      
      newObj.queueDocEdits(node, sbObj);      
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
  _RecordsetName.inspectServerBehavior(sbObj);
  _PageSize.inspectServerBehavior(sbObj);

  // Custom code added to handle the radio buttons
  if (_PageSize.getValue())
  {
    _Show.pickValue("PageSize");
  }
  else
  {
    _Show.pickValue("All");
    
    // reset the defaults
    _PageSize.setValue("10");
  }
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
  _RecordsetName.deleteServerBehavior(sbObj);
  _PageSize.deleteServerBehavior(sbObj);

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
function analyzeServerBehavior(sbObj, allRecs)
{
  _RecordsetName.analyzeServerBehavior(sbObj, allRecs);
  _PageSize.analyzeServerBehavior(sbObj, allRecs);

  sbObj.analyze(allRecs);
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//   Called from controls to update the dialog based on user input
//
// ARGUMENTS:
//   controlName - string - the name of the control which called us
//   event - string - the name of the event which triggered this call
//           or null
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function updateUI(controlName, event)
{
  if (window["_" + controlName] != null)
  {
    var controlObj = window["_" + controlName];

    if (_RecordsetName.updateUI != null)
    {
      _RecordsetName.updateUI(controlObj, event);
    }
    if (_PageSize.updateUI != null)
    {
      _PageSize.updateUI(controlObj, event);
    }
  }
  
  // Custom code added to handle the radio buttons
  if (controlName == "Show")
  {
    if (_Show.getValue() == "PageSize")
    {
      _PageSize.setDisabled(false);
    }
    else if (_Show.getValue() == "All")
    {
      _PageSize.setDisabled(true);
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



// ***************** LOCAL FUNCTIONS  ******************

//--------------------------------------------------------------------
// CLASS:
//   SBRepeatedRegion
//
// DESCRIPTION:
//   This class is derived from the ServerBehaviorClass, and
//   represents a RepeatRegion Server Behvaior
//
// PUBLIC PROPERTIES:
//   <property> - <type and description>
//
// PUBLIC FUNCTIONS:
//   <function name> - <description>
//--------------------------------------------------------------------

//--------------------------------------------------------------------
// FUNCTION:
//   SBRepeatedRegion
//
// DESCRIPTION:
//   Constructor
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBRepeatedRegion(name, title, selectedNode)
{
  // Use the init function for construction.
  this.initServerBehavior(name, title, selectedNode);
}

// Inherit from the ServerBehavior class.
SBRepeatedRegion.prototype.__proto__ = ServerBehavior.prototype;

//public methods
SBRepeatedRegion.prototype.postProcessFind = SBRepeatedRegion_postProcessFind;
SBRepeatedRegion.prototype.analyze = SBRepeatedRegion_analyze;
SBRepeatedRegion.prototype.queueDocEdits = SBRepeatedRegion_queueDocEdits;
SBRepeatedRegion.prototype.checkData = SBRepeatedRegion_checkData;
SBRepeatedRegion.prototype.getRecordsetName = SBRepeatedRegion_getRecordsetName;
SBRepeatedRegion.prototype.isPageNavigation = SBRepeatedRegion_isPageNavigation;


//--------------------------------------------------------------------
// FUNCTION:
//   SBRepeatedRegion.postProcessFind
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function SBRepeatedRegion_postProcessFind()
{
  var part = this.getNamedSBPart("RepeatedRegion_main");
  
  // Eliminate cfoutput loops found above or below the HTML
  if (part)
  {
    var isVisible = false;
    for (var node = part.getNode(); node != null; node = node.parentNode)
    {
      if (node.nodeType == Node.ELEMENT_NODE && node.tagName == "BODY")
      {
        // visible tag, do not delete
        isVisible = true;
        break;
      }
    }
    
    if (!isVisible)
    {
      this.deleted = true;
    }
  }
  
  if (!this.deleted)
  {
    if (!this.getParameter("RecordsetName"))
    {
      this.deleted = true;
    }
  }

  if (!this.deleted)
  {
    // Check if startrow or maxrows are our variables  
    var startrow = this.getParameter("StartRow");
    var maxrows = this.getParameter("MaxRows");
    
    if (startrow && maxrows &&
        startrow.indexOf("#StartRow_") == 0 &&
        maxrows.indexOf("#MaxRows_") == 0)
    {
      this.setParameter("StartRow", "");
      this.setParameter("MaxRows", "");
    }
    else if (!startrow && !maxrows)
    {
      this.setParameter("PageSize", "");
    }
    else
    {
      // if this cfouput has startrow or maxrow set, do not
      //  create the server behavior
      this.deleted = true;
    }

    // If we are not a page navigation repeat region,
    //  remove those participants
    if ( !this.isPageNavigation() )
    {
      this.removeNamedSBPart("RepeatedRegion_pageNum");
      this.removeNamedSBPart("RepeatedRegion_maxRows");
      this.removeNamedSBPart("RepeatedRegion_startRow");
      this.removeNamedSBPart("RepeatedRegion_endRow");
      this.removeNamedSBPart("RepeatedRegion_totalPages");
    }
  }
  
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRepeatedRegion.analyze
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function SBRepeatedRegion_analyze(allRecs)
{
  // remove our repeat region references if another SB claims the cfoutput
  this.deleteIfAlreadyReferenced(allRecs);
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRepeatedRegion.queueDocEdits
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function SBRepeatedRegion_queueDocEdits(existingNode, sbObj)
{
  var part = this.getNamedSBPart("RepeatedRegion_main");
  
  if (part || existingNode)
  {
    var node = ((part) ? part.getNode() : existingNode);
    
    var tagEdit = new TagEdit(node);
    
    var rsName = this.getParameter("RecordsetName");
    var pageSize = this.getParameter("PageSize");
    
    tagEdit.setAttribute("query", rsName);
    
    if (this.isPageNavigation())
    {
      tagEdit.setAttribute("startrow", "#StartRow_" + rsName + "#");
      tagEdit.setAttribute("maxrows", "#MaxRows_" + rsName + "#");
    }
    else
    {
      tagEdit.removeAttribute("startrow");
      tagEdit.removeAttribute("maxrows");
    }

    var newOuterHTML = tagEdit.getOuterHTML();
    
    dwscripts.queueNodeEdit(newOuterHTML, node);


    // handle the other participants
    
    if (this.isPageNavigation())
    {
      // We should only pass sbObj if we are updating a page navigation
      // repeat region.  Otherwise, those participants were not
      // included in the sbObj, and cannot be updated.
      if (sbObj && !sbObj.isPageNavigation())
      {
        sbObj = null;
      }
      
      // add the cfparam and cfset tags if needed
      extPart.queueDocEdits("RepeatedRegion","RepeatedRegion_pageNum",   this.getParameters(), sbObj);
      extPart.queueDocEdits("RepeatedRegion","RepeatedRegion_maxRows",   this.getParameters(), sbObj);
      extPart.queueDocEdits("RepeatedRegion","RepeatedRegion_startRow",  this.getParameters(), sbObj);
      extPart.queueDocEdits("RepeatedRegion","RepeatedRegion_endRow",    this.getParameters(), sbObj);
      extPart.queueDocEdits("RepeatedRegion","RepeatedRegion_totalPages",this.getParameters(), sbObj);
    }
    else
    {
      // Need to check first if any other SB's depend on these participants
      
      // remove the cfparam and cfset tags
      var part = this.getNamedSBPart("RepeatedRegion_pageNum");
      if (part && !extUtils.isDependentNodeSegment(part))
      {
        dwscripts.queueNodeEdit("", part.getNode());
      }
      var part = this.getNamedSBPart("RepeatedRegion_maxRows");
      if (part && !extUtils.isDependentNodeSegment(part))
      {
        dwscripts.queueNodeEdit("", part.getNode());
      }
      var part = this.getNamedSBPart("RepeatedRegion_startRow");
      if (part && !extUtils.isDependentNodeSegment(part))
      {
        dwscripts.queueNodeEdit("", part.getNode());
      }
      var part = this.getNamedSBPart("RepeatedRegion_endRow");
      if (part && !extUtils.isDependentNodeSegment(part))
      {
        dwscripts.queueNodeEdit("", part.getNode());
      }
      var part = this.getNamedSBPart("RepeatedRegion_totalPages");
      if (part && !extUtils.isDependentNodeSegment(part))
      {
        dwscripts.queueNodeEdit("", part.getNode());
      }
    }

  }
  else
  {
    alert("RepeatedRegion_main not found");
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRepeatedRegion.checkData
//
// DESCRIPTION:
//   Checks that the data supplied for the repeat region is complete
//
// ARGUMENTS:
//   priorObj -  Server Behavior object - the prior server behavior
//     object if we are updating this SB
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function SBRepeatedRegion_checkData(priorObj)
{
  var isValid = true;
  
  // Clear out the error message.
  this.setErrorMessage("");
  
  var show = this.getParameter("Show");

  if (show == "PageSize")
  {
    // Check that pagesize is an integer greater than 0.
    var pageSize = this.getParameter("PageSize");
    if ((pageSize < 1) || (parseInt(pageSize) != pageSize))
    {
      this.appendErrorMessage(MM.MSG_InvalidPageSize);
      isValid = false;
    }
    
    // Start row and max row are not needed in this case. Make them "".
    this.setParameter("StartRow", "");
    this.setParameter("MaxRows", "");
  }
  else
  {
    this.setParameter("PageSize", "");
    this.setParameter("StartRow", "");
    this.setParameter("MaxRows", "");
  }
    
/* NOTE: we have decided not to check for this case, because
         the returned error message was not very clear.
         
  // Check if a page navigation repeat region already exists
  //  for this recordset
  if (show == "PageSize")
  {
    var sbObjs = dwscripts.getPageNavDisplaySBs(this.getRecordsetName(), true);
    if (sbObjs && sbObjs.length > 0)
    {
      // found one, so alert the user
      this.appendErrorMessage(MM.MSG_RepeatRegionWithPageNavExists);
      isValid = false;
    }
  }
*/
  
  return isValid;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRepeatedRegion.getRecordsetName
//
// DESCRIPTION:
//   Returns the recordset name for this repeat region
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function SBRepeatedRegion_getRecordsetName()
{
  return this.getParameter("RecordsetName");
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRepeatedRegion.isPageNavigation
//
// DESCRIPTION:
//   Returns true if this SB is configured for Page Navigation
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function SBRepeatedRegion_isPageNavigation()
{
  var retVal = false;
  
  if (this.getParameter("PageSize"))
  {
    retVal = true;
  }

  return retVal;
}

