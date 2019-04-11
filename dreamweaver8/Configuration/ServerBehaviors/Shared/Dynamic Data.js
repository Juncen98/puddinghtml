// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var helpDoc = MM.HELP_ssDynamicData;
var CONST_TYPE = "dynamicContent";


//******************* API **********************

//Returns a Javascript function to be inserted in HTML head with script tags.

function findServerBehaviors() {
  var i, ssRec, ssRecList = new Array();
  var dom = dw.getDocumentDOM();
  var nodes = dom.getElementsByTagName("MM_DYNAMIC_CONTENT");

  //get the stats block participants
  var group = new Group("recordsetStatsBlock", true);
  var statRecs = group.find(); 
  
  for (i=0; i<nodes.length; i++) {
    ssRec = buildSSRecord(nodes[i], statRecs);
    if (ssRec) ssRecList.push(ssRec); //add record to the array
  }
  
  return ssRecList; //empty means there are none here yet
}

function canApplyServerBehavior(sbObj)
{
  var retVal = true;
  
  if (!sbObj)
  {
    var dsList = dw.dbi.getDataSources();
    if(!dsList.length)
    {
      alert(dwscripts.sprintf(MM.MSG_NoRecordsets, dwscripts.getRecordsetDisplayName()));
      retVal = false;
    }
  }
  
  return retVal;
}

function applyServerBehavior(priorRec) {
  var priorNode="", expression, editList;
 

  if (priorRec) {
    if (priorRec.message) alert(priorRec.message);
    priorNode = getOrigForLockedNode(priorRec.participants[0]);
  }
  

  expression = dreamweaver.showDynamicDataDialog(priorNode, MM.LABEL_DynamicTextTitle);
  if (expression.length > 0)   {
    // if cursor is in head, move it to inside of body
    if (  !selectionIsInBody( dw.getDocumentDOM().getSelectedNode() )  ){
      moveCursorToEndOfBody();
    }
    // special case handling if user has manually selected &nbsp; of table cell
    tweakSelectionIfInsideOfEmptyTableCell();
    
    editList = buildSSEdits(priorRec, expression, false);
    editList.insert();
      
  }
  return "";
}


//Passed the function call above, takes prior arguments and reloads the UI.
//Removes any escape characters \

function inspectServerBehavior(ssRec) {
}


function deleteServerBehavior(ssRec) {
  ssRec.del();
  return true;
}

function analyzeServerBehavior(ssRec, allRecs) {
  var rsName = ssRec.sourcename;

  //Check if data source is valid (can be a known recordset, or a session, request, url etc.
  var found = isAnyDataSource(rsName, allRecs);

  //For Cold Fusion: if looks dynamic, but rsName appears invalid,
  //it's okay if that name comes from valid tag such as CFPOP or CFLDAP.
  if (!found && (!rsName.length || isForeignCfDataSource(rsName))) {
    found = true;
    ssRec.deleted = true;
  }

  //if not found, mark as incomplete
  if (!found) {
      ssRec.incomplete = true;
      ssRec.message = errMsg(dwscripts.sprintf(MM.MSG_CouldNotFindSource1,
		                                         dwscripts.getRecordsetDisplayName(), 
												 rsName));
      ssRec.severity = "ok";
  }


}

//***************** LOCAL FUNCTIONS  ******************

//Passed a single tag node, returns an SSRecord if it's recognized.

function buildSSRecord(node, statRecs) {
  var ssRec, i, name, nodes, nameValueNodes;
  var dom = dw.getDocumentDOM();

  if (node.getAttribute("BINDING") && node.getAttribute("SOURCE")) {
    //First find the primary node
    ssRec = new SSRecord();

    ssRec.sourcename        = node.getAttribute("SOURCE");
    ssRec.bindingname       = node.getAttribute("BINDING");
    ssRec.type  = CONST_TYPE;
    ssRec.title = MM.LABEL_DynamicTextTitle +" (" + ssRec.sourcename;
    if (ssRec.sourcename)
    {
    ssRec.title += (ssRec.bindingname.length && ssRec.bindingname.charAt(0)=="[")? " " : ".";
    }    
  ssRec.title += ssRec.bindingname + ")";
    ssRec.selectedNode = node;

    //Add primary participant
    ssRec.participants.push(node);
    ssRec.weights.push("");
    ssRec.types.push("data");
    ssRec.rs = "";
    ssRec.statType = "";
    ssRec.isStat = false;

    //If Recordset Statistic, add other participants
    var binding  = node.getAttribute("BINDING");
    var statType = binding.match(/(\w+) record/i);//pattern for stats, set by translator
    if (statType && statType.length > 1) {          //if Recordset Statistic, add participant
      ssRec.statType = statType[1];
      ssRec.rs       = node.getAttribute("SOURCE");
      ssRec.isStat = true;
      
      ssRec.incomplete = true;
      for (var j=0; j < statRecs.length; j++) {
        if (statRecs[j].parameters.rsName == ssRec.rs) {
          ssRec.participants = ssRec.participants.concat(statRecs[j].participants);
          ssRec.weights = ssRec.weights.concat(statRecs[j].weights);
          ssRec.types = ssRec.types.concat(statRecs[j].types);
          ssRec.deleteTypes = ssRec.deleteTypes.concat(statRecs[j].deleteTypes);
          ssRec.incomplete = statRecs[j].incomplete;
          break;
        }
      }  
    }

  }

  return ssRec;
}



//Passed a prior SSRec if there, followed by all relevant args from the UI.

// editList = buildSSEdits(priorRec, expression, false);
function buildSSEdits(priorRec, expression, bOnlySupportScripts) {
  var chunk, editList, priorNode;
  editList = new SSEdits();

  //check for statistics
  var group = new Group("Recordset Statistics");
  var part = group.getParticipants("replaceSelection")[0];
  var params = part.findInString(expression);
  if (params != null) {

    setMoveToParamsForJsp(params);

    group = new Group("recordsetStatsBlock");
    group.addEdits(editList, params, priorRec);

  }
      
  if (!bOnlySupportScripts) {
    priorNode = (priorRec)? priorRec.participants[0] : "";
    editList.add(expression,priorNode,"replaceSelection");
  }

  return editList;
}


//add server behavior code to page (for all orphaned stats on the page)

function repairOrphans() {
  var recordSets = new Array();
  var editList = new SSEdits();

  //recs = dw.findServerBehaviors();
  recs = dw.serverBehaviorInspector.getServerBehaviors();  //get all SBs. Now handles Dynamic Attribute too
  for (var i = 0; i < recs.length; i++) {
    var thisRec = recs[i]
    if ((thisRec.isStat) && (thisRec.incomplete)) {
      var isDuplicateRS = false;
      for (var j = 0; j < recordSets.length; j++) {
        if (recordSets[j] == thisRec.rs) {
          isDuplicateRS = true;
          break;
        }
      }

      if (!isDuplicateRS) {
        recordSets.push(thisRec.rs);
        
        var paramObj = new Object();
        paramObj.rsName = thisRec.rs;
        setMoveToParamsForJsp(paramObj);
        var group = new Group("recordsetStatsBlock");
        group.addEdits(editList, paramObj, thisRec);
      }
    }
  }  
  if (editList.length) {
    var currSel = dw.getSelection();
    var htmlNode = dw.getDocumentDOM().documentElement;
    var oldHtmlOffsets = dw.nodeToOffsets(htmlNode);

    editList.insert();

    htmlNode = dreamweaver.getDocumentDOM().documentElement;
    var newHtmlOffsets = dw.nodeToOffsets(htmlNode);
    var delta = newHtmlOffsets[1] - oldHtmlOffsets[1];
    dw.setSelection(currSel[0]+delta, currSel[1]+delta);
  }
  return "";
}

