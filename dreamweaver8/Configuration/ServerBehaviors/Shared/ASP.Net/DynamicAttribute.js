// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

var HELP_DOC = MM.HELP_ssDynamicBinding;

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
  
  var partList = dw.getParticipants("DynamicAttribute");
  
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
        var params = new Object();

        params.attributeName = attributeList[j];
        params.attributeValue = node.getAttribute(params.attributeName);
        
        nodeOffsets = extUtils.findAttributePosition(node, params.attributeName, true, true);
        
        if (nodeOffsets)
		{
		  var sbPart = new SBParticipant(partName, node, nodeOffsets[0], nodeOffsets[1], params);        
          var title = MM.LABEL_DynamicAttrTitle + 
                      " (" + node.tagName.toLowerCase() + 
                      "." + params.attributeName.toLowerCase() + 
                      //", " + params.attributeValue + 
                      ")";
        
          // create a node for each attribute
        
		  var sbObj = new ServerBehavior("DynamicAttribute", title, node);
        
          sbObj.addParticipant(sbPart);
        
          // Set the priority to the lowest, so that this server behavior
          //  will only claim nodes that don't belong to other SBs
        
		  sbObj.setPriority(10);
        
          sbArray.push(sbObj);
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
  return true;
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
  var priorSrc = null;
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
      // No first time apply for attributes, because we need a node and an attribute name
      
	  if (priorSrc)
      {
        dwscripts.queueDocEdit(expression, "nodeAttribute+" + attrName.toUpperCase(), node);
        dwscripts.applyDocEdits();
      }
    }
  }

  return "";
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


