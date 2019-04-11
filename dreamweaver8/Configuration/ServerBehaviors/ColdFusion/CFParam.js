// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


// *************** GLOBALS VARS *****************
var _ParamName = new TextField("CFParam.htm", "ParamName", "");
var _Default = new TextField("CFParam.htm", "Default", "");
var _ParamType = new ListMenu("CFParam.htm", "ParamType", "");


// ***************** LOCAL FUNCTIONS  ******************

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

  _ParamName.initializeUI();
  _Default.initializeUI();
  try {
    _ParamType.initializeUI();
  }
  catch(e)
  {
    _ParamType = null;
  }


  elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
}



// ******************* Server Behavior API ***************************

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
  _ParamName.findServerBehaviors();
  _Default.findServerBehaviors();
  if (_ParamType) _ParamType.findServerBehaviors();

  sbArray = dwscripts.findSBs();

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
    success = _ParamName.canApplyServerBehavior(sbObj);
  }
  if (success)
  {
    success = _Default.canApplyServerBehavior(sbObj);
  }
  if (success && _ParamType)
  {
    success = _ParamType.canApplyServerBehavior(sbObj);
  }
  if (success)
  {
    success = dwscripts.canApplySB(sbObj, false); // preventNesting is false
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
  var paramObj = new Object();
  var errStr = "";
  var paramName = _ParamName.getValue();
  var paramDefault = _Default.getValue(); 
  var paramType = (_ParamType) ? _ParamType.getValue() : "";

  if (!errStr)
  {
    errStr = _ParamName.applyServerBehavior(sbObj, paramObj);
    if (!paramName || dwscripts.trim(paramName) == "")
    {
      errStr = MM.MSG_ProvideParamName;
    }
    else
    {
      if (!sbObj || sbObj.getParameter('ParamName').toUpperCase() != paramName.toUpperCase())
      {
        // Check if there is already a cfparam of the same name.
        var dom = dw.getDocumentDOM();
        var paramTags = dom.getElementsByTagName("cfparam");
        for (var i = 0; i < paramTags.length; ++i)
        {
          if (paramTags[i].getAttribute("name").toUpperCase() == paramName.toUpperCase())
          {
            errStr = dwscripts.sprintf(MM.MSG_ProvideUniqueParamName, paramName);
            break;
          }
        }
      }
    }
  }
  if (!errStr)
  {
    errStr = _Default.applyServerBehavior(sbObj, paramObj);
  }
  if (!errStr)
  {
    if (_ParamType)
    {
      errStr = _ParamType.applyServerBehavior(sbObj, paramObj);
    }
    else
    {
      paramObj["ParamType"] = "";
    }
  }

  if (!errStr)
  {
    // Manually update the cfparam tag if this is an update operation.
    if (!sbObj)
    {
      if (dw.getDocumentDOM().documentType == "CFC")
      {
        paramObj["MM_location"] = "beforeSelection";
      }
      else
      {
        dwscripts.fixUpSelection(dw.getDocumentDOM(), true, true);
      }
      dwscripts.applySB(paramObj, sbObj);
    }
    else
    {
      var sbParts = sbObj.getParticipants();
      var node = sbParts[0].getNode();
      var udpateText = "";
      var tagEdit = new TagEdit(node);
      
      tagEdit.setAttribute("name", paramName);
      
      if (paramDefault == null)
      {
        tagEdit.removeAttribute("default");
      }
      else 
      {
        tagEdit.setAttribute("default", paramDefault);
      }
      
      if (paramType)
      {
        tagEdit.setAttribute("type", paramType);
      }
      else
      {
        tagEdit.removeAttribute("type");
      }

      updateText = tagEdit.getOuterHTML();
      dwscripts.queueNodeEdit(updateText, node);
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
  _ParamName.inspectServerBehavior(sbObj);
  _Default.inspectServerBehavior(sbObj);
  if (_ParamType) _ParamType.inspectServerBehavior(sbObj);
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
  _ParamName.deleteServerBehavior(sbObj);
  _Default.deleteServerBehavior(sbObj);
  if (_ParamType) _ParamType.deleteServerBehavior(sbObj);

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

    if (_ParamName.updateUI != null)
    {
      _ParamName.updateUI(controlObj, event);
    }
    if (_Default.updateUI != null)
    {
      _Default.updateUI(controlObj, event);
    }
    if (_ParamType && _ParamType.updateUI != null)
    {
      _ParamType.updateUI(controlObj, event);
    }
  }
}


