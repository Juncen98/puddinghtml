// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var helpDoc         = MM.HELP_ssDynamicRadioGroup;

var LIST_expression2;
var EDIT_expression2;

var radioNode = new TagMenu("Dynamic Radio.htm", "radioNode", "INPUT/RADIO");
var expression1 = new DynamicExpressionTextfield("Dynamic Radio.htm", "expression1");


//******************* API **********************

function findServerBehaviors() {
  //find UD4 radio groups
  var group = new Group("dynamicRadioButtons");
  group.participants[0].partType = "multiple";
  group.title = MM.LABEL_DynamicRadioTitle + " (@@theName@@)";
  var sbList = group.find();

  //find UD1 radio groups. Note that some server models do not have this
  //  group file. So, check if participants were retrieved before continuing.
  var group = new Group("dynamicRadioButtons_UD1");
  if (   group.participants && (typeof group.participants == "object")
      && (group.participants.length > 0)
     )
  {
    group.participants[0].partType = "multiple";
    group.title = MM.LABEL_DynamicRadioTitle + " (@@theName@@)";
    var sbList2 = group.find();
    if (sbList2.length) sbList = sbList.concat(sbList2);  //add if any found
  }
    
  for (var i=0; i<sbList.length; i++) {
    //We need special purpose attributes attached to ssRec to support the DBI/PI in C++.
    //so please do not remove them.
    sbList[i].groupname = sbList[i].parameters.theName;
    sbList[i].equalstoexp = extractDynamicExpression(sbList[i].parameters.expression1);
  }
  
  return sbList;
}


function canApplyServerBehavior(sbObj) {
  var success = true;

  if (success) {
    success = radioNode.canApplyServerBehavior(sbObj);
  }

  if (success) {
    success = expression1.canApplyServerBehavior(sbObj);
  }

  return success;
}


function applyServerBehavior(sbObj) {
  var paramObj = new Object();
  var errStr = "";

  if(applyServerBehavior.arguments.length > 1) {
    
    //We handle this call since this may be silent call.
    paramObj.radioNode = applyServerBehavior.arguments[0];
    paramObj.expression1 = formatDynamicExpression(applyServerBehavior.arguments[1]);
    var value = paramObj.radioNode.value;
    value = (value) ? value : "";
    paramObj.expression2 = formatDynamicExpression(value);
    paramObj.value = value;
    
    sbObj = null;
    
  } else {
    
    if (!errStr) {
      errStr = radioNode.applyServerBehavior(sbObj, paramObj);
    }

    if (!errStr) {
      errStr = expression1.applyServerBehavior(sbObj, paramObj, MM.MSG_NothingEntered);
    }

    if (!errStr) {
      var values = LIST_expression2.getValue("all");
      paramObj.expression2 = new Array();
      paramObj.value = new Array();
      for (var i=0; i < values.length; i++) {
        paramObj.expression2.push(formatDynamicExpression(values[i]));
        paramObj.value.push(values[i]);
      }
    }
    
  }

  if (!errStr && !sbObj)
  {
    // If this is an insert, make sure a dynamic radio group does not already exist
    //   on the chosen one.
    var sbList = dw.sbi.getServerBehaviors();
    for (var i = 0; i < sbList.length; ++i)
    {
      if (   sbList[i].title.indexOf(MM.LABEL_DynamicRadioTitle) == 0
          && paramObj.radioNode.length
          && dwscripts.findInArray(sbList[i].participants, paramObj.radioNode[0]) != -1
         )
      {
        errStr = MM.MSG_RadioGroupHasServerBehavior;
      }
    }
  }
  
  if (!errStr) {
	  var serverModel = dwscripts.getServerModel();
		paramObj.checked = 'checked="checked"';

		if (serverModel.match(/(?:PHP|ASP_JS|JSP)/i)) {
			paramObj.checked = paramObj.checked.replace(/"/g, '\\"');
		}
		if (serverModel.match(/(?:ASP_VB)/i)) {
			paramObj.checked = paramObj.checked.replace(/"/g, '""');
		}
	}

  if (!errStr) {
    if (sbObj && sbObj.subType && sbObj.subType=="UD1") {
      var group = new Group("dynamicRadioButtons_UD1");
    } else {
      var group = new Group("dynamicRadioButtons");
    }
    group.participants[0].partType = "multiple";
    group.apply(paramObj, sbObj);
  }

  return errStr;
}


function inspectServerBehavior(sbObj) {
  var success = true;

  success = radioNode.inspectServerBehavior(sbObj);
  success = expression1.inspectServerBehavior(sbObj);
    
  updateUI("radioNode");
}


function deleteServerBehavior(sbObj) {
  radioNode.deleteServerBehavior(sbObj);
  expression1.deleteServerBehavior(sbObj);
  deleteSB(sbObj);
}


function analyzeServerBehavior(sbObj, allRecs) {
  radioNode.analyzeServerBehavior(sbObj, allRecs);
  expression1.analyzeServerBehavior(sbObj, allRecs);

  //If recognized an UltraDev1.0 Dyn Radio, maybe reject it if it's a valid UD4 Dyn Radio.
  if (sbObj && sbObj.subType && sbObj.subType.indexOf("UD1")!=-1) {
    for (var i=0; i<allRecs.length; i++) {
      var otherRec = allRecs[i];

      //if it has the same type, different subType, and the same number of participants
      if (otherRec.title == sbObj.title && otherRec.subType != sbObj.subType
          && otherRec.participants.length == sbObj.participants.length) {
        sbObj.deleted = true;  //assume it needs deleting
        for (var j=0; j<otherRec.participants.length; j++) {

          //if has a different participant, then don't delete it
          if (otherRec.participants[j] != sbObj.participants[j]) {
            sbObj.deleted = false;
            break;
          }
        }
      }
    }
  }
}


function initializeUI() {
  radioNode.initializeUI();
  expression1.initializeUI();
  
  LIST_expression2 = new ListControl("expression2");
  EDIT_expression2 = findObject("expression2_edit");
  updateUI("radioNode");

  elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
}


function updateUI(itemName) {
  if (itemName == "radioNode") {
    //populate expression2 with the radio values
    var radios = radioNode.getValue();
    var radioVals = new Array();
    for (var i=0; i < radios.length; i++) {
      if (radios[i].value) {
        radioVals.push(radios[i].value);
      } else {
        radioVals.push("");
      }
    }
    LIST_expression2.setAll(radioVals, radioVals);
    LIST_expression2.pickValue();
    
    updateUI("expression2");
  } else if (itemName == "expression2") {
    EDIT_expression2.value = LIST_expression2.getValue();
  } else if (itemName == "expression2_edit") {
    LIST_expression2.set(EDIT_expression2.value);
    //LIST_expression2.setValue(EDIT_expression2.value);
    LIST_expression2.valueList[LIST_expression2.getIndex()] = EDIT_expression2.value
  }
}


function canAddPartToGroup(partGroup, part, partList, participant) {
  var retVal = true;
  
  var partName = part.parameters.theName;

  for (var j=0; j < partGroup.length; j++) {
    if (partName != partGroup[j].parameters.theName || 
        part.participantNode == partGroup[j].participantNode) {
      retVal = false;
      break;
    }
  }
  
  return retVal;
}

