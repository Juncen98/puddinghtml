//Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

var REC_SELECTED;
var REC_INDEX;
var NODE_INDEX;
var TF_NAME;
var TF_COUNT;
var MENU_RS;
var RB_ALL
var RB_COUNT;
var ARR_SS_RECS;
var helpDoc = MM.HELP_inspRepeatedRegion;



function getTagName(dom) {
  var tagName = (dom.serverModel.getServerName() == "Cold Fusion") ? "CFOUTPUT" : "MM_REPEATEDREGION";
  return tagName;
}


function canInspectSelection() {
  var dom = dw.getDocumentDOM();
  
  //get all participants of all server behaviors
  var ssRecs = ARR_SS_RECS = dw.sbi.getServerBehaviors();
  var nRecs = (ssRecs != null) ? ssRecs.length : 0;
  if (nRecs == 0) return false;
  
  //get the selected node
  var curSel = dom.getSelection(true);
  var selectedObj = dom.offsetsToNode(curSel[0],curSel[0]);
  
  var foundRec = "";  
    
  if (dom.serverModel.getServerName() != "Cold Fusion") {
    
    var rrNode = getRepeatedRegion(curSel);
    if (rrNode) {
      for (var recInd=0; recInd < nRecs; recInd++) {
        var currRec = ssRecs[recInd];
        if ((currRec.type == "repeatedRegion" || currRec.type == "repeatedRegionAll") && rrNode.name == currRec.parameters.loopName) {
          REC_SELECTED = foundRec = currRec;
          REC_INDEX = recInd;
          break;
        }
      }
    }
    
  } else {

    var rrNode = getRepeatedRegion(curSel);
    if (rrNode) {
      for (var recInd=0; recInd < nRecs; recInd++) {
        var currRec = ssRecs[recInd];
        if (currRec.type == "repeatedRegion" || currRec.type == "repeatedRegionAll") {
          var parts = currRec.participants;
          var nParts = parts.length;
          for (var partInd=0; partInd < nParts; partInd++){
            if (rrNode == parts[partInd]) {
              REC_SELECTED = foundRec = currRec;
              REC_INDEX = recInd;
              break;
            }
          }
          if (foundRec) break;
        }
      }
    }

  }
  
  return (foundRec != "");
  
}



//This function will check when all selected cells are completely contained
//within the repeated region.
function getRepeatedRegion(curSelection)
{
  var returnNode = null;
  var dom = dw.getDocumentDOM();
  var nodes = dom.getElementsByTagName(getTagName(dom));
  
  for (var index =0 ; index < nodes.length ; index++) {
    
    var offsets = dom.nodeToOffsets(nodes[index]);
    var found = true;
    for (i =0 ; i < curSelection.length ; i+=2) {
      
      if (curSelection[i] && curSelection[i+1]) {
        
        if ((offsets[0] > curSelection[i])||
            (offsets[1] < curSelection[i+1])) {
          found = false;
          break;
        }
        
      } else {
        found = false
        break
      }

    }
    
    if (found) {      
      returnNode = nodes[index];
      NODE_INDEX = index;
      break;
    }
  }
  
  return returnNode;
}



function inspectSelection() {
  initializeUI();
  
  var regionRec = REC_SELECTED;
  var params = regionRec.parameters;
  var recordset = params.rsName;
  var loopName = params.loopName;
  var nRows    = params.numRows;
  var modelIsColdFusion = dw.getDocumentDOM().serverModel.getServerName() == "Cold Fusion";
  var theRS = MENU_RS.inspectServerBehavior(regionRec,"");
  
  
  if (nRows == -1 || !nRows) { // if showing all records
    setRadioGroup(1);
    if (modelIsColdFusion) { 
      TF_NAME.value = "";
      disableNameField();
    } else {
      TF_NAME.value = (loopName)?loopName:"";
    }
  } else {  // if showing only n records per set
    setRadioGroup(2);
    TF_COUNT.value = nRows;
    if (modelIsColdFusion) {
      enableNameField(); 
    }
    TF_NAME.value = (loopName)?loopName:"";
  }
}



function initializeUI() {
  RB_ALL    = findObject("AllCount");
  RB_COUNT  = findObject("NumCount"); 
  TF_NAME   = findObject("LoopName");
  TF_COUNT  = findObject("NumValue");
  MENU_RS = new RecordsetMenu("Repeated Region.htm", "rsName");
  MENU_RS.initializeUI();
}



function updateRepeatedRegion() {
  var paramType = updateRepeatedRegion.arguments[0];
  var updateIsValid = true;
  var regionRec = REC_SELECTED;
  var modelIsColdFusion = dw.getDocumentDOM().serverModel.getServerName();
  
  // Sanity check: if the list of server behaviors has changed, bail.
  if (ARR_SS_RECS != dw.sbi.getServerBehaviors())
    return;
  
  // the "paramType" is an optional variable that tells which parameter
  // was just changed. Do error checking relevent to the just changed parameter only.
  if (paramType){
    if (paramType == "regionName"){
      updateIsValid = validateRegionName(TF_NAME.value);
      if (!updateIsValid){ // if new name isn't valid, change to previous name
        TF_NAME.value = regionRec.parameters.loopName;
      }
    } else if (paramType == "numRecs"){
      var numRecVal = TF_COUNT.value;
      if (notAnInteger(numRecVal) || numRecVal<1){
        updateIsValid = false;
        alert(MM.MSG_ValueGreaterThanZero);
        TF_COUNT.value = regionRec.parameters.numRows;
      }
    }
  }
  
  if (updateIsValid) {
    var paramObj = new Object();
    paramObj.rsName =  MENU_RS.getValue();
    loopName = TF_NAME.value;
    if ( RB_ALL.checked.toString() == "true" ) { // if showing all records
      paramObj.numRows = -1;
      paramObj.MM_subType = "all";
      if (loopName)
        paramObj.loopName = loopName;
      
      
    } else { // if showing only n records
      paramObj.numRows = TF_COUNT.value;
      paramObj.loopName = (loopName)?loopName:createUniqueRepeatedRegionName();
    }


    errStr = MENU_RS.applyServerBehavior(REC_SELECTED, paramObj);

    if (!errStr) {
      applySB(paramObj,REC_SELECTED,"Repeated Region.htm");
      setTimeout("resetOriginalSelection()",20);
    }
  }
}



// whichButton is 0 for no button clicked, 1 for the Num Records button,
// 2 for the All Records button
function setRadioGroup(whichButton) 
{

    if (whichButton == 1) 
    {
      // All button was checked
      RB_ALL.checked     = true;
      RB_COUNT.checked   = false;
      TF_COUNT.setAttribute("disabled","true");
      
    } 
    else if (whichButton == 2) 
    {
      // Count button was checked
      RB_COUNT.checked  = true; 
      RB_ALL.checked    = false;
      TF_COUNT.removeAttribute("disabled")

      if (  TF_COUNT.value == "" || (parseInt(TF_COUNT.value) != TF_COUNT.value)  ) {
        TF_COUNT.value = 10;
      }      
    }
}



function resetOriginalSelection() {
  var dom = dw.getDocumentDOM();
  if (dom) {
    var nodes = dom.getElementsByTagName(getTagName(dom));
    if (nodes[NODE_INDEX]) {
      dom.setSelectedNode(nodes[NODE_INDEX]);
    }
  }
}



function validateRegionName(regionName){
  var isValid = true;
  var errMsg = "";
  
  // return true if name has not changed
  if (regionName == REC_SELECTED.parameters.loopName) {
    return isValid;
  }
  
  if (regionName == ""){
    errMsg = MM.MSG_MissingRepeatName;
  } else if (!IsValidVarName(regionName)) {
    errMsg = MM.MSG_InvalidRepeatName;
  } else if (isDuplicateRegionName(regionName)) {
    errMsg = MM.MSG_DuplicateRR;
  }
  
  if (errMsg){
    alert (errMsg);
    isValid = false; 
  }
  
  return isValid;
  
}



function isDuplicateRegionName(regionName) {
  var isDupe = false;
  var ssRecs = ARR_SS_RECS;
  var currRec = REC_SELECTED;
  var nRecs = ssRecs.length, i, currRec;
  
  for (i=0;i<nRecs;i++) {
    currRec = ssRecs[i];
    if (currRec.type && (currRec.type == "repeatedRegion" || currRec.type == "repeatedRegionAll") &&
        currRec.parameters.loopName == regionName && currRec != REC_SELECTED) {
           isDupe = true;
           break;
    }
  }
  
  return isDupe;
  
}


function notAnInteger(val){
  return (val != parseInt(val));
}


function enableNameField(){
  if (TF_NAME.disabled)
    TF_NAME.removeAttribute("disabled");
}


function disableNameField(){
  if (!TF_NAME.disabled)
    TF_NAME.setAttribute("disabled","true");
}
