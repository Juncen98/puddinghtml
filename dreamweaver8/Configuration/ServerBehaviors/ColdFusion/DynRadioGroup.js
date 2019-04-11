// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************
var HELP_DOC = MM.HELP_ssDynamicRadioGroupCF;

var GROUP_NAME = "DynRadioGroup";
var PART_CHECKED_ATTR = "DynRadioGroup_checkedAttr";
var _input_type_radio__tag = new TagMenu(GROUP_NAME, "input_type_radio__tag", "INPUT/RADIO");
var _DynValue = new DynamicTextField(GROUP_NAME, "DynValue", "");


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

  _input_type_radio__tag.initializeUI();
  _DynValue.initializeUI();

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
  var sbObjs = new Array();
  var radioGroups = _input_type_radio__tag.getTagElements();
  var nGroups = radioGroups.length;
  var searchPatt = extPart.getSearchPatterns(PART_CHECKED_ATTR);
  var quickSearch = extPart.getQuickSearch(PART_CHECKED_ATTR);
  var currPart, currRadio, currSB, currGroup, i, j, nRadios, aMatch;

  for (i=0;i<nGroups;i++) // traverse through groups
  {
    currSB = null;
    currGroup = radioGroups[i];
    nRadios = currGroup.length;
    for (j=0;j<nRadios;j++) // traverse through buttons within a group
    {
      currRadio = currGroup[j];
      nodeStr = currRadio.outerHTML;
      aMatch = extUtils.findPatternsInString(nodeStr, quickSearch, searchPatt)
      if (aMatch)
      {
        // create a new server behavior object, or add participant info
        // to existing server behavior object
        if (currSB==null)
        {
          currSB = new ServerBehavior();
          currSB.setTitle(MM.LABEL_DynamicRadioGroupTitle + " (" + currRadio.name + ")");
          currSB.ordinalOfGroup = i;
        }

        partParamObj = extUtils.extractParameters(searchPatt);

        if (partParamObj.RadioButtonValue != currRadio.value)
        {
          currSB.incomplete = true;
          currSB.errMsg = MM.MSG_RadioValuesHaveChanged;
        }
        currPart = new SBParticipant(PART_CHECKED_ATTR,currRadio,aMatch[0],aMatch[1],partParamObj);
        currSB.addParticipant(currPart);
        
        // Set the first radio button as the selected node
        if (!currSB.getSelectedNode())
        {
          currSB.setSelectedNode(currRadio);
        }
      }

      // if there is a server behavior in this radio group, and we have collected
      // all of the participants, then add server behavior to server behavior array
      if ( j==(nRadios-1) && currSB != null)
      {
        currSB.DynValue = partParamObj.DynValue;
	      sbObjs.push(currSB);
      }

    } // end loop looping through radio buttons within a group
  }   // end loop looping through the groups

  return sbObjs;
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
    success = _input_type_radio__tag.canApplyServerBehavior(sbObj);
  }

  return success;

}


//--------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//   Collects values from the form elements in the dialog box and
//   adds the Server Behavior to the users document
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
  var radioGroup = _input_type_radio__tag.listControl.getValue();
  var i, currButton=null, insertionStr = "", nButtons = radioGroup.length;
  var partParams, errStr = "",msg="",paramObj = new Object();

  errStr = _DynValue.applyServerBehavior(sbObj, paramObj, MM.MSG_NothingEntered);

  if (!errStr && !sbObj)
  {
    // If this is an insert, make sure a dynamic radio group does not already exist
    //   on the chosen one.
    var sbList = dw.sbi.getServerBehaviors();
    for (var i = 0; i < sbList.length; ++i)
    {
      if (   sbList[i].title.indexOf(MM.LABEL_DynamicRadioGroupTitle) == 0
          && radioGroup.length
          && dwscripts.findInArray(sbList[i].participants, radioGroup[0]) != -1
         )
      {
        errStr = MM.MSG_RadioGroupHasServerBehavior;
      }
    }
  }

  if (errStr)  return errStr; // alert error string if server behavior can't be applied

  // format properly: strip delimiters off, surround in quotes, etc.
  var newDynValue = dwscripts.encodeDynamicExpression(_DynValue.getValue());
  
  // We need to strip the outer #'s if present
  if (   newDynValue.length > 1 && newDynValue.charAt(0) == "#" 
      && newDynValue.charAt(newDynValue.length - 1) == "#" 
     )
  {
    newDynValue = newDynValue.slice(1, newDynValue.length - 1);
  }
  var partParams = new Object();

	partParams.checked = 'checked=""checked""';

  partParams.DynValue = newDynValue; // this value is the same for all participants

  // line up all of the edits for insertion (each radio button is an edit)

  if (sbObj) // if inspecting, instead of applying for the first time
  {
    var sbParts = sbObj.getParticipants();
    var nParts = sbObj.getParticipantCount(), currPart, currNodeSegment;
    var dynamicValueChanged = (newDynValue != sbObj.DynValue);
    var radioValueChanged,newInsertionStr,prevPartParams;

    for(i=0;i<nParts;i++)
    {
      currPart = sbParts[i];
      prevPartParams = currPart.getParameters();
      radioValueChanged = (prevPartParams.RadioButtonValue != currPart.getNode().value);

      // only edit the document if the dynamic expression or radio button value has changed
      if (dynamicValueChanged || radioValueChanged)
      {
        var priorNodeSegment = currPart.getNodeSegment();
        partParams.RadioButtonValue = currPart.getNode().value;
        newInsertionStr = extPart.getInsertString(GROUP_NAME,PART_CHECKED_ATTR,partParams,"nodeAttribute");

        docEdits_queue(newInsertionStr,priorNodeSegment,currPart.getWeight(),currPart.getNode());
      }
    }
  }
  
  else // we are applying the edits for the first time, not inspecting existing edits
  {
    var currRadio;
    for (i=0;i<nButtons;i++)
    {
      currRadio = radioGroup[i];
      partParams.RadioButtonValue = currRadio.value;
      insertionStr = extPart.getInsertString(GROUP_NAME,PART_CHECKED_ATTR,partParams,"nodeAttribute");
      dwscripts.queueDocEdit(insertionStr,"nodeAttribute",currRadio);
    }
  }

  // perform edits
  dwscripts.applyDocEdits();

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
  _input_type_radio__tag.listControl.setIndex(sbObj.ordinalOfGroup);
  _input_type_radio__tag.listControl.object.setAttribute("disabled","true");
  _DynValue.setValue(dwscripts.decodeDynamicExpression(sbObj.DynValue));

  // alert err msg if html radio button value does not match the server code
  if (sbObj.incomplete && sbObj.errMsg)
    alert(sbObj.errMsg);

}


//--------------------------------------------------------------------
// FUNCTION:
//   deleteServerBehavior
//
// DESCRIPTION:
//   Remove the specified Server Behavior from the users document
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
function analyzeServerBehavior(sbObj, allRecs)
{
  _input_type_radio__tag.analyzeServerBehavior(sbObj, allRecs);
  _DynValue.analyzeServerBehavior(sbObj, allRecs);
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

    if (_input_type_radio__tag.updateUI != null)
    {
      _input_type_radio__tag.updateUI(controlObj, event);
    }
    if (_DynValue.updateUI != null)
    {
      _DynValue.updateUI(controlObj, event);
    }
  }
}
