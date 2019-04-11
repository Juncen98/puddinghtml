// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var HELP_DOC         = MM.HELP_ssDynamicCheckBox;

var GROUP_NAME = "dynamicCheckbox";
var PART_CHECKED_ATTR = "dynamicCheckbox_attrib";

// fields in UI
var LIST_CBOXNODES;
var TEXT_EXP1;
var TEXT_EXP2;

var DEBUG_FILE = dw.getConfigurationPath() + "/Checkbox_Debug.txt";
var DEBUG_DATE = new Date();

//******************* API **********************

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
function findServerBehaviors(){
 //DEBUG  DWfile.write(DEBUG_FILE,"findSBs called" + DEBUG_DATE.getHours() + ":" + DEBUG_DATE.getMinutes() + ":" + DEBUG_DATE.getSeconds() + "\n","append");

  var sbObjs = new Array();
  var nodes = dotNetUtils.getASPNodesAsElements("asp:checkbox");
  var ckboxList = new Array();

  for (var i=0; i < nodes.length; i++){
    // get the dom of the checkbox
    var tempDom = nodes[i].parentNode;
    while (tempDom.parentNode != null){
      tempDom = tempDom.parentNode;
    }    
    // get the offsets of the checkbox
    var offsets = tempDom.nodeToOffsets(nodes[i]);
    
    // get the node in the current document
    var dom = dw.getDocumentDOM();
    var localNode = dom.offsetsToNode(offsets[0],offsets[1]); 
    ckboxList.push(localNode);
  }

  // This search pattern approximates the ones in the edml files. (What's
  // different is that VB uses one =, and C# uses two. This regexp accounts
  // for both patterns, while the edml files are specific to each language.)
  var searchPatt = /\s*<%#\s*(IIf\()?\(([^\r\n]*?)\s*==?\s*"([^\r\n]*?)"\)/i;
  var currPart, currCbox, currSB, aMatch, tagEdit;

//  <%# (DataSet1.FieldValue("readAwhileAgo", Container) == "1") ? true : false %>
//  <%# IIf((rsBook.FieldValue("readAwhileAgo", Container) = "1"), true, false) %>
//  <%# (rsBook.FieldValue("readAwhileAgo", Container) = "1") %>
  
  
  // Cycle through all the checkboxes looking for this server behavior.
  for (var i=0; i < ckboxList.length; i++){ // for all the groups...
    currSB = new ServerBehavior();
    currCbox = ckboxList[i];
    nodeStr = currCbox.outerHTML;
    tagEdit = new TagEdit(nodeStr);
    //DEBUG DWfile.write(DEBUG_FILE,"this node is: " + nodeStr + "\n","append");
    aMatch = nodeStr.match(searchPatt);
    if (aMatch){
      //DEBUG DWfile.write(DEBUG_FILE,"aMatch[0] = " + aMatch[0] + "\naMatch[1] = " + aMatch[1] + "\naMatch[2] = " + aMatch[2] + "\n","append");

      var partParamObj = new Object();
      // This is essentially what extUtils.extractParameters(searchPatt) is supposed to do;
      // I'm doing it manually here for simplicity's sake.
      partParamObj['expression1'] = aMatch[2];
      partParamObj['expression2'] = aMatch[3];
      //DEBUG DWfile.write(DEBUG_FILE,"\npartParamObj['expression1'] = " + partParamObj['expression1'] + "\npartParamObj['expression2'] = " + partParamObj['expression2'] + "\n\n","append");
      currPart = new SBParticipant(PART_CHECKED_ATTR,currCbox,aMatch[0],aMatch[2],partParamObj);
      currSB.addParticipant(currPart);

      currSB.setTitle(MM.LABEL_DynCheckboxTitle.replace(/@@theName@@/,tagEdit.getAttribute("id")));
      currSB.ordinalOfGroup = i;
      currSB.setSelectedNode(currCbox);
      currSB.expression1 = partParamObj['expression1'];
      currSB.expression2 = partParamObj['expression2'];
	    sbObjs.push(currSB);
    }
  }
  
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
function canApplyServerBehavior(sbObj){
  var success = false;
  if (dotNetUtils.getASPNodesAsElements("asp:checkbox").length > 0){
    success = true;
  }else{
    alert(dwscripts.sprintf(MM.MSG_NoSpecificTag,'asp:checkbox'));
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
function applyServerBehavior(sbObj){

  var cbox = LIST_CBOXNODES.getValue();
  var insertionStr = "";
  var partParams, errStr = "", msg= "";
  var paramObj = new Object();
    
  if (TEXT_EXP1.value == "" || TEXT_EXP2.value == "") {
    errStr = MM.MSG_NothingEntered;
  }else{
    paramObj["expression1"] = TEXT_EXP1.value;
  }

  if (!errStr) {
    paramObj["expression2"] = TEXT_EXP2.value;
  }
  
  if (!errStr && !sbObj){
    // If this is an insert, make sure a dynamic checkbox SB does not already exist
    // on the chosen checkbox.
    var sbList = dw.sbi.getServerBehaviors();
    var tagEdit = new TagEdit(dwscripts.getOuterHTML(cbox));
    // DEBUG alert("dwscripts.getOuterHTML(cbox) = " + dwscripts.getOuterHTML(cbox) + "\nid = " + tagEdit.getAttribute("id"));
    var theTitle = MM.LABEL_DynCheckboxTitle.replace(/@@theName@@/,tagEdit.getAttribute("id"))
    for (var i = 0; i < sbList.length; ++i){
      if (sbList[i].title.search(theTitle) == 0
          && cbox.length
          && dwscripts.findInArray(sbList[i].participants, cbox[0]) != -1
         )
      {
        errStr = MM.MSG_cboxHasServerBehavior;
      }
    }
  }

  if (errStr)  return errStr; // alert error string if server behavior can't be applied

  // format properly: strip delimiters off, surround in quotes, etc.
  var newDynValue = dwscripts.encodeDynamicExpression(TEXT_EXP1.value);
  
  var partParams = new Object();
  partParams.expression1 = newDynValue;

  if (sbObj){ // if inspecting, instead of applying for the first time
    var sbParts = sbObj.getParticipants();
    var currPart, currNodeSegment;
    var dynamicValueChanged = (newDynValue != sbObj.expression1);
    var cboxValueChanged = false;
    var newInsertionStr,prevPartParams;

    for(i=0; i < sbObj.getParticipantCount(); i++){
      currPart = sbParts[i];
      prevPartParams = currPart.getParameters();
      cboxValueChanged = (prevPartParams.expression2 != TEXT_EXP2.value);

      // only edit the document if the dynamic expression or checkbox value has changed
      if (dynamicValueChanged || cboxValueChanged){
        var priorNodeSegment = currPart.getNodeSegment();
        partParams.expression2 = TEXT_EXP2.value;
        newInsertionStr = extPart.getInsertString(GROUP_NAME,PART_CHECKED_ATTR,partParams,"nodeAttribute+Checked");

        docEdits_queue(newInsertionStr,priorNodeSegment,currPart.getWeight(),currPart.getNode());
      }
    }
  }
  else // we are applying the edits for the first time, not inspecting existing edits
  {
    partParams.expression2 = TEXT_EXP2.value;
    insertionStr = extPart.getInsertString(GROUP_NAME,PART_CHECKED_ATTR,partParams,"nodeAttribute+Checked");
    //DEBUG alert("insertionStr = " + insertionStr);
    dwscripts.queueDocEdit(insertionStr,"nodeAttribute+Checked",cbox);
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
  LIST_CBOXNODES.setIndex(sbObj.ordinalOfGroup);
  LIST_CBOXNODES.object.setAttribute("disabled","true");
  TEXT_EXP1.value = dwscripts.decodeDynamicExpression(sbObj.expression1);
  TEXT_EXP2.value = sbObj.expression2;
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
function analyzeServerBehavior(sbObj, allRecs)
{
// don't do anything.
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

//***************** LOCAL FUNCTIONS  ******************

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
  LIST_CBOXNODES = new ListControl("chbxNode");  
  TEXT_EXP1 = dwscripts.findDOMObject("expression1");
  TEXT_EXP2 = dwscripts.findDOMObject("expression2");

  var tagNames = new Array()
  var tagValues = new Array();
  var nodes = dotNetUtils.getASPNodesAsElements("asp:checkbox");
  // If the asp:checkbox tag is translated, using getSelectedNode() alone
  // won't get us the right tag or allow us access to its attribute. Turning
  // the node into a TagEdit object will.
  var selNode = new TagEdit(dwscripts.getOuterHTML(dw.getDocumentDOM().getSelectedNode()));
  var ckboxList = new Array();
  var selIndex = 0;
  
  for (var i=0; i < nodes.length; i++){
    
    // get the dom of the checkbox (it's a temporary file)
    var tempDom = nodes[i].parentNode;
    while (tempDom.parentNode != null)
    {
      tempDom = tempDom.parentNode;
    }
    
    // get the offsets of the checkbox
    var offsets = tempDom.nodeToOffsets(nodes[i]);
    
    // get the node in the current document
    var dom = dw.getDocumentDOM();
    var localNode = dom.offsetsToNode(offsets[0],offsets[1]); 

    // Determine whether the current node is the selected node
    var editNode = new TagEdit(dwscripts.getOuterHTML(nodes[i]));
    if (editNode.getAttribute("id") == selNode.getAttribute("id")){
      selIndex = i;
    }
    ckboxList.push(localNode);
  }
  for (var i=0; i < ckboxList.length; i++) {
    tagNames.push(dotNetUtils.getNiceName(ckboxList[i], i));
    tagValues.push(ckboxList[i]);
  }
    
  // set the list control
  LIST_CBOXNODES.setAll(tagNames, tagValues);
  LIST_CBOXNODES.setIndex(selIndex);

  var elts;
  elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
}

