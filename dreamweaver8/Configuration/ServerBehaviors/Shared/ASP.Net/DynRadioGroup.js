// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************
var HELP_DOC = MM.HELP_ssDynamicRadioGroupASPNet;

var GROUP_NAME = "DynRadioGroup";
var PART_CHECKED_ATTR = "DynRadioGroup_checkedAttr";

// fields in UI
var LIST_RADIONODES;
var TEXT_EXP1;
var LIST_EXP2;
var TEXT_EXP2;

// global variables for storing the id of each radiobutton
// and its associated value.
var RADIO_ID_ARRAY = null;
var RADIO_VAL_ARRAY = null;

var DEBUG_FILE = dw.getConfigurationPath() + "/RadioGroup_Debug.txt";
var DEBUG_DATE = new Date();


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
function initializeUI(){
//DEBUG DWfile.write(DEBUG_FILE,"Opening new DEBUG_FILE record at " + DEBUG_DATE.getHours() + ":" + DEBUG_DATE.getMinutes() + ":" + DEBUG_DATE.getSeconds() + "\n");

  LIST_RADIONODES = new ListControl("radioNodes");  
  LIST_EXP2 = new ListControl("expression2");
  TEXT_EXP2 = dwscripts.findDOMObject("expression2_edit");
  TEXT_EXP1 = dwscripts.findDOMObject("expression1");

  var tagNames = new Array()
  var tagValues = new Array();
  var nodes = dotNetUtils.getASPNodesAsElements("asp:radiobutton");
  // If the asp:radiobutton tag is translated, using getSelectedNode() alone
  // won't get us the right tag or allow us access to its attribute. Turning
  // the node into a TagEdit object will.
  var selNode = new TagEdit(dwscripts.getOuterHTML(dw.getDocumentDOM().getSelectedNode()));
  var radioGroups = new Array();
  var radioList = new Array();
  for (var i=0; i < nodes.length; i++){
    
    // get the dom of currRadio -- thx CMD
    var tempDom = nodes[i].parentNode;
    while (tempDom.parentNode != null)
    {
      tempDom = tempDom.parentNode;
    }
    
    // get the offsets of currRadio
    var offsets = tempDom.nodeToOffsets(nodes[i]);
    
    // get the node in the current document
    var dom = dw.getDocumentDOM();
    var localNode = dom.offsetsToNode(offsets[0],offsets[1]); 

    var name = nodes[i].getAttribute("groupname");
    if (!name)
      name = nodes[i].getAttribute("id");
    if (!name)
      name = "RadioButton" + i;
    if (radioList[name] == null){
      radioList[name] = new Array();
      radioList[name].isRadio = true;
      if ((selNode.getAttribute("groupname") && selNode.getAttribute("groupname") == name) || (!selNode.getAttribute("groupname") && selNode.getAttribute("id") == name)){
        radioList[name].isSel = true;
      }
      radioList[name].push(localNode);
      radioGroups.push(radioList[name]);
    }else{
      radioList[name].push(localNode);
    }
  }
  for (var i=0; i < radioGroups.length; i++) {
    tagNames.push(dotNetUtils.getNiceName(radioGroups[i], i));
    tagValues.push(radioGroups[i]);
  }
    
  // set the list control
  LIST_RADIONODES.setAll(tagNames, tagValues);

  for (var q=0; q < radioGroups.length; q++){
    if (radioGroups[q].isSel){
      LIST_RADIONODES.pickValue(radioGroups[q]);
      break;
    }
  }
  updateUI("radioNodes");
  
  var elts;
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
function findServerBehaviors(){
  //DEBUG DWfile.write(DEBUG_FILE,"findSBs called" + DEBUG_DATE.getHours() + ":" + DEBUG_DATE.getMinutes() + ":" + DEBUG_DATE.getSeconds() + "\n","append");
  var sbObjs = new Array();
  var nodes = dotNetUtils.getASPNodesAsElements("asp:radiobutton");
  var radioGroups = new Array();
  var radioList = new Array();

  for (var i=0; i < nodes.length; i++){
    // get the dom of currRadio
    var tempDom = nodes[i].parentNode;
    while (tempDom.parentNode != null){
      tempDom = tempDom.parentNode;
    }    
    // get the offsets of currRadio
    var offsets = tempDom.nodeToOffsets(nodes[i]);
    
    // get the node in the current document
    var dom = dw.getDocumentDOM();
    var localNode = dom.offsetsToNode(offsets[0],offsets[1]); 

    var name = nodes[i].getAttribute("groupname");
    if (!name)
      name = nodes[i].getAttribute("id");
    if (!name)
      name = "RadioButton" + i;
    if (radioList[name] == null){
      radioList[name] = new Array();
      // store the name as a property, so we can show it in the SB panel
      radioList[name].name = name;
      radioList[name].isRadio = true;
      radioList[name].push(localNode);
      radioGroups.push(radioList[name]);
    }else{
      radioList[name].push(localNode);
    }
  }

  // This search pattern approximates the ones in the edml files. (What's
  // different is that VB uses one =, and C# uses two. This regexp accounts
  // for both patterns, while the edml files are specific to each language.)
  var searchPatt = /\s*<%#\s*(IIf\()?\(([^\r\n]*?)\s*==?\s*"([^\r\n]*?)"\)/i;
  var currPart, currRadio, currSB, currGroup, aMatch;

  //DEBUG DWfile.write(DEBUG_FILE,"there are " + radioGroups.length + " radio groups in this document.\n","append");

  // Cycle through all the radiobuttons within each group
  // looking for this server behavior.
  for (var i=0; i < radioGroups.length; i++){ // for all the groups...
    currSB = null;
    currGroup = radioGroups[i];
    for (var j=0; j < currGroup.length; j++){ // and all the buttons within each group...
      currRadio = currGroup[j];
      nodeStr = currRadio.outerHTML;
      //DEBUG DWfile.write(DEBUG_FILE,"this node is: " + nodeStr + "\n","append");
      aMatch = nodeStr.match(searchPatt);
      //DEBUG 
      if (aMatch){
        //DEBUG DWfile.write(DEBUG_FILE,"aMatch[0] = " + aMatch[0] + "\naMatch[1] = " + aMatch[1] + "\naMatch[2] = " + aMatch[2] + "\n","append");
        //DEBUG alert(aMatch.join("\n"));

        // create a new server behavior object OR
        // add participant info to existing server behavior object
        if (currSB==null){
          currSB = new ServerBehavior();
          currSB.setTitle(MM.LABEL_DynamicRadioGroupTitle + " (" + currGroup.name + ")");
          currSB.ordinalOfGroup = i;
        }

        var partParamObj = new Object();
        // This is essentially what extUtils.extractParameters(searchPatt) is supposed to do;
        // I'm doing it manually here for simplicity's sake.
        partParamObj['expression1'] = aMatch[2];
        partParamObj['expression2'] = aMatch[3];
        //DEBUG DWfile.write(DEBUG_FILE,"\npartParamObj['expression1'] = " + partParamObj['expression1'] + "\npartParamObj['expression2'] = " + partParamObj['expression2'] + "\n\n","append");
        currPart = new SBParticipant(PART_CHECKED_ATTR,currRadio,aMatch[0],aMatch[2],partParamObj);
        currPart.expression2 = partParamObj['expression2'];
        currSB.addParticipant(currPart);
        
        // Set the first radio button as the selected node
        if (!currSB.getSelectedNode()){
          currSB.setSelectedNode(currRadio);
        }
      }

      // if there is a server behavior in this radio group, and we have collected
      // all of the participants, then add server behavior to server behavior array
      if ( j==(currGroup.length-1) && currSB != null){
        currSB.expression1 = partParamObj['expression1'];
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
function canApplyServerBehavior(sbObj){
  var success = false;
  if (dotNetUtils.getASPNodesAsElements("asp:radiobutton").length > 0){
    success = true;
  }else{
    alert(dwscripts.sprintf(MM.MSG_NoSpecificTag,'asp:radiobutton'));
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
function applyServerBehavior(sbObj){
  var radioGroup = LIST_RADIONODES.getValue();
  var i, currButton = null, insertionStr = "";
  var partParams, errStr = "", msg = "", paramObj = new Object();
    
  if (TEXT_EXP1.value == "") {
    errStr = MM.MSG_NothingEntered;
  }else{
    paramObj["expression1"] = TEXT_EXP1.value;
  }

  if (!errStr) {
    var values = LIST_EXP2.getValue("all");
    paramObj.expression2 = new Array();
    paramObj.value = new Array();
    for (var i=0; i < values.length; i++) {
      paramObj.expression2.push(dwscripts.encodeDynamicExpression(values[i]));
      paramObj.value.push(values[i]);
    }
  }
  //DEBUG alert("paramObj.expression2 contains:\n\n" + paramObj.expression2.join("\n"));
  //DEBUG alert("radioGroup.length = " + radioGroup.length);
  
  if (!errStr && !sbObj)
  {
    // If this is an insert, make sure a dynamic radio group does not already exist
    // on the chosen one.
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
  var newDynValue = dwscripts.encodeDynamicExpression(TEXT_EXP1.value);
  
  var partParams = new Object();
  partParams.expression1 = newDynValue; // this value is the same for all participants

  // line up all of the edits for insertion (each radio button is an edit)

  if (sbObj) // if inspecting, instead of applying for the first time
  {
    var sbParts = sbObj.getParticipants();
    var currPart, currNodeSegment;
    var dynamicValueChanged = (newDynValue != sbObj.expression1);
    var radioValueChanged,newInsertionStr,prevPartParams;

    for(i=0; i < sbObj.getParticipantCount(); i++)
    {
      currPart = sbParts[i];
      prevPartParams = currPart.getParameters();
      radioValueChanged = (prevPartParams.expression2 != LIST_EXP2.getValue(i));

      // only edit the document if the dynamic expression or radio button value has changed
      if (dynamicValueChanged || radioValueChanged)
      {
        var priorNodeSegment = currPart.getNodeSegment();
        partParams.expression2 = LIST_EXP2.getValue(i);
        newInsertionStr = extPart.getInsertString(GROUP_NAME,PART_CHECKED_ATTR,partParams,"nodeAttribute+Checked");

        docEdits_queue(newInsertionStr,priorNodeSegment,currPart.getWeight(),currPart.getNode());
      }
    }
  }
  else // we are applying the edits for the first time, not inspecting existing edits
  {
    var currRadio;
    for (i=0;i<radioGroup.length;i++)
    {
      currRadio = radioGroup[i];
      partParams.expression2 = LIST_EXP2.getValue(i);
      insertionStr = extPart.getInsertString(GROUP_NAME,PART_CHECKED_ATTR,partParams,"nodeAttribute+Checked");
      //DEBUG alert("insertionStr = " + insertionStr);
      dwscripts.queueDocEdit(insertionStr,"nodeAttribute+Checked",currRadio);
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
function inspectServerBehavior(sbObj){
  //DEBUG DWfile.write(DEBUG_FILE,"inspectSB called" + DEBUG_DATE.getHours() + ":" + DEBUG_DATE.getMinutes() + ":" + DEBUG_DATE.getSeconds() + "\n","append");
  LIST_RADIONODES.setIndex(sbObj.ordinalOfGroup);
  LIST_RADIONODES.object.setAttribute("disabled","true");
  TEXT_EXP1.value = dwscripts.decodeDynamicExpression(sbObj.expression1);
  
  var parts = sbObj.getParticipants();
  for (var i=0; i < parts.length; i++){
    RADIO_VAL_ARRAY[i] = parts[i].expression2;
  }
  LIST_EXP2.setAll(RADIO_ID_ARRAY, RADIO_VAL_ARRAY);
  updateUI("expression2");
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

function updateUI(itemName) {
  if (itemName == "radioNodes") {
    //populate expression2 with the radio values
    var radios = LIST_RADIONODES.getValue();
    RADIO_ID_ARRAY = new Array();
    for (var i=0; i < radios.length; i++) {
      var tagEdit = new TagEdit(dwscripts.getOuterHTML(radios[i]));
      if (tagEdit.getAttribute("id"))
        RADIO_ID_ARRAY.push(tagEdit.getAttribute("id"));
      else
        RADIO_ID_ARRAY.push("RadioButton" + i);
    }
    // Create a value array of the same length as the id 
    // array and populate it with empty strings. If we're
    // reinspecting, inspectServerBehavior() will replace
    // these empty strings with the actual values in the code.
    if (!RADIO_VAL_ARRAY){
      RADIO_VAL_ARRAY = new Array(RADIO_ID_ARRAY.length);
      for (var x=0; x < RADIO_VAL_ARRAY.length; x++){
        RADIO_VAL_ARRAY[x] = "";
      }
    }
    LIST_EXP2.setAll(RADIO_ID_ARRAY, RADIO_VAL_ARRAY);
    LIST_EXP2.setIndex(0);
    updateUI("expression2");
  } else if (itemName == "expression2") {
      TEXT_EXP2.value = LIST_EXP2.getValue();
  } else if (itemName == "expression2_edit") {
     LIST_EXP2.setValue(TEXT_EXP2.value);
  }
}



