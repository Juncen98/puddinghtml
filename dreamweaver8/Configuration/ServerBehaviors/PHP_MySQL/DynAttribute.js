// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

var HELP_DOC = MM.HELP_ssDynamicBinding;

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
  
  var partList = dw.getParticipants("DynAttribute");
  
  for (var i=0; i < partList.length; i++)
  {
    var part = partList[i];
    
    var partName = part.participantName;
    var parameters = part.parameters;
    var node = part.participantNode;
    
    var attrs = parameters["dynamicAttrs"];
    if (attrs)
    {
      var attributeList = attrs.split(",");
      for (var j=0; j < attributeList.length; j++)
      {
        if (attributeList[j])
        {
          var params = new Object();
          params.attributeName = attributeList[j];
          params.attributeValue = node.getAttribute(params.attributeName);

          nodeOffsets = extUtils.findAttributePosition(node, params.attributeName, true, true);

          if (nodeOffsets != null)
          {
            var sbPart = new SBParticipant(partName, node, nodeOffsets[0], nodeOffsets[1], params);

            var title = MM.LABEL_DynamicAttrTitle + 
                        " (" + node.tagName.toLowerCase() + 
                        "." + params.attributeName.toLowerCase() + 
                        ", " + getFieldFromDynDataCode(params.attributeValue) + 
                        ")";

            // create a node for each attribute
            var sbObj = new ServerBehavior("DynAttribute", title, node);

            sbObj.addParticipant(sbPart);

            // Set the priority to the lowest, so that this server behavior
            //  will only claim nodes that don't belong to other SBs
            sbObj.setPriority(10);

            sbArray.push(sbObj);
          }
        }
      }
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
  var success = true;
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
  var dom = dw.getDocumentDOM();

  var paramObj = new Object();
  var errStr = "";

  var priorSrc = "";
  var node = null;
  var attrName = "";
  if (sbObj)
  {
    var parts = sbObj.getParticipants();
    if (parts.length > 0)
    {
      node = parts[0].getNode();
      attrName = sbObj.getParameter("attributeName");
      if (node && attrName)
      {
        priorSrc = node.getAttribute(attrName);
      }
    }
  }

  expression = dreamweaver.showDynamicDataDialog(priorSrc, MM.LABEL_DynamicTextTitle);

  if (expression)
  {
    if (sbObj)
    {
      if (priorSrc)
      {
        dwscripts.queueDocEdit(expression, "nodeAttribute+" + attrName.toUpperCase(), node);
        dwscripts.applyDocEdits();
      }
    }
    /* No first time apply for attributes, because we need a node and an attribute name
    else
    {
      dwscripts.fixUpSelection(dom, false); // move selection to body if in head
      dwscripts.adjustCursorForEmptyTableCell();

      dwscripts.queueDocEdit(expression,"nodeAttribute+" + attrName, node);
      dwscripts.applyDocEdits();
    }
    */
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
  // If we've found a dynamic attribute on an option tag, this is almost certainly
  //   contained within a dynamic menu. (The only interesting case in which it may not
  //   be is a dynamic selection, be we don't recognize this case). 
  //   This case won't be caught in
  //   deleteIfAlreadyReferenced() when it compares the main nodes of the two
  //   SB's (it will be comparing a cfoutput to an option). For performance reasons,
  //   deleteIfAlreadyReferenced() should not be updated to compare all child
  //   nodes as well. So, if the main node for this dynamic attribute is on
  //   an option tag, mark it as deleted. 
  var mainPart = sbObj.getNamedSBPart("DynAttribute_main");
  var mainPartNode = mainPart.getNodeSegment().node;
  if (mainPartNode && mainPartNode.tagName == "OPTION")
  {
    sbObj.deleted = true;
  }
  else
  {
    sbObj.deleteIfAlreadyReferenced(allSBs);
    sbObj.deleteIfSelectedNodeOutsideBody();
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

//--------------------------------------------------------------------
// FUNCTION:
//   getFieldFromDynDataCode
//
// DESCRIPTION:
//   Takes the code returned from dw.showDynamicDataDialog and 
//   extracts only the recordSet and column info (e.g. <?php echo 
//   $row_Recordset1['column']; ?> returns $row_Recordset1['column'])
//
// ARGUMENTS:
//   value - the dynamic data run time code retrieved from 
//           dw.showDynamicDataDialog
//
// RETURNS:
//   stripped out dynamic recordSet/column info
//--------------------------------------------------------------------
function getFieldFromDynDataCode(value)
{
  var pos = value.search(/(\$row_([^\r\n]*?)\[([^\r\n]*?)\])/i);
  if (pos != -1)
  {
    return RegExp.$1;
  }
  else
  {
  	return value;
  }
}

