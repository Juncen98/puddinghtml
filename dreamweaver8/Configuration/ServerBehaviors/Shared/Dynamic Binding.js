// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var helpDoc = MM.HELP_ssDynamicBinding;
var CONST_TYPE = "dynamicBinding";

var NUM_Participants = 1;  //used to check completeness. If a participant
                           //is missing, set the .incomplete property

var WGHT_DyanmicData = "replaceSelection";

var useMiniTranslator = true;
var PATT_transSource = /SOURCE="?(\w+)"?/g;
var PATT_transBinding = /BINDING="([^"]*)"/g;
var PATT_transOrig = /orig="([^"]*)"/g;


var LIST_RS;
var DEBUG = false;
var translatorDOM = null;


//******************* API **********************


//*-------------------------------------------------------------------
// FUNCTION:
//   findServerBehaviors
//
// DESCRIPTION:
//   Locates instances of this server behavior on the current page.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   an array of SSRecord objects
//--------------------------------------------------------------------
function findServerBehaviors() {
  var i, ssRec, ssRecList = new Array();
  var dom = dw.getDocumentDOM();

  var nodes = dom.getElementsByAttributeName("mmTranslatedValueDynAttrs");
 
  if (nodes) {
    for (i=0; i<nodes.length; i++) {
      ssAttrList = buildSSRecord(nodes[i]);
      for (j=0; j < ssAttrList.length; j++) {
        if (ssAttrList[j]) ssRecList.push(ssAttrList[j]); //add record to the array
      }
    }
  }
  return ssRecList; //empty means there are none here yet
}


//*-------------------------------------------------------------------
// FUNCTION:
//   canApplyServerBehavior
//
// DESCRIPTION:
//   Returns true if the server behavior can be applied.
//   Otherwise, displays an alert and returns false.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function canApplyServerBehavior() {
  return true;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//   adds the server behavior to the users page, based on the UI settings
//
// ARGUMENTS:
//   priorRec - if we are re-applying, the previous SSRecord for this
//              server behavior
//
// RETURNS:
//   string - error message to indicate failure, or the empty string
//            to indicate success
//--------------------------------------------------------------------
function applyServerBehavior(priorRec) 
{
  var editList;
  var expression;

  if (priorRec) 
  {
    // edit an existing dynamic data item

    var ssRec = priorRec
    if (ssRec.incomplete)
    {
      alert(ssRec.message)  
    }

    expression = dreamweaver.showDynamicDataDialog(priorRec.expression);

    if (expression.length > 0)
    {
      if (priorRec.selectedNode) 
      {
        //search for offset in the original string.
        var vnode = priorRec.selectedNode.getAttribute(priorRec.attribute);
        var startindex = vnode.indexOf(priorRec.expression);
        if (startindex != -1)
        {
          var partA  = vnode.substring(0,startindex);
          var partB  = vnode.substring(startindex + priorRec.expression.length);
          expression = partA + expression + partB;
          priorRec.selectedNode.setAttribute(priorRec.attribute,expression);
        }
      }
    }
  } 

  return "";
}


//*-------------------------------------------------------------------
// FUNCTION:
//   analyzeServerBehavior
//
// DESCRIPTION:
//   Called after all server behaviors have been found to allow
//   for any further checks which need to be performed
//
// ARGUMENTS: 
//   ssRec - the SSRecord of the behavior we are analyzing
//   allRecs - a list of all server behavior records
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function analyzeServerBehavior(ssRec, allRecs)
{
  var deleted = false;
  for (var i = 0; i < allRecs.length; i++) {
    var thisRec = allRecs[i]
    if ((thisRec != ssRec) && (thisRec.type != CONST_TYPE)) {
      for (j = 0; j < thisRec.participants.length; j++) {
        if (thisRec.participants[j] == ssRec.participants[0]) {
          if (ssRec.isStat && ssRec.incomplete) {
            thisRec.isStat = true;
            thisRec.incomplete = true;
            thisRec.statType = ssRec.statType;
            thisRec.rs = ssRec.rs;
          }
          ssRec.deleted = true;
          deleted = true;
          break;
        }
      }
    }
    if (deleted) break;
  }
  
  if (ssRec.attribute && ssRec.attribute.toLowerCase() == "action" && 
      ssRec.expression && ssRec.expression.indexOf("MM_LoginAction") != -1) {
    ssRec.deleted = true;
  }
  
  if (!ssRec.deleted && ssRec.sourcename != null) {
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
    if (!found)
	{
        ssRec.incomplete = true;
        ssRec.message = errMsg(dwscripts.sprintf(MM.MSG_CouldNotFindSource1,
		                                         dwscripts.getRecordsetDisplayName(), 
												 rsName));
        ssRec.severity = "ok";
    }
  }
}


//*-------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//   populates the UI based on the SSRecord of the current server behavior
//
// ARGUMENTS: 
//   sbObj - the instance of the server behavior to inspect
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function inspectServerBehavior(ssRec) {
}


//*-------------------------------------------------------------------
// FUNCTION:
//   deleteServerBehavior
//
// DESCRIPTION:
//   Removes the selected server behavior from the page
//
// ARGUMENTS: 
//   sbObj - the SSRecord of the server behavior to delete
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function deleteServerBehavior(ssRec) {
  var currServerModel = dw.getDocumentDOM().serverModel.getServerName();
  
  if (ssRec && ssRec.participants) {
    if (ssRec.participants.length == 1) {
      
      var attrValue = ssRec.participants[0].getAttribute(ssRec.attribute);
      var startindex = attrValue.indexOf(ssRec.expression);
      
      if (startindex != -1) {
        
        var partA  = attrValue.substring(0,startindex);
        var partB  = attrValue.substring(startindex + ssRec.expression.length);
        var expression = partA + partB;
        if (expression.length) {
          ssRec.participants[0].setAttribute(ssRec.attribute,expression);
        } else {
          ssRec.participants[0].removeAttribute(ssRec.attribute);
        }
        
      } 
      
    } else { //has rs statistics, so remove all
      ssRec.del();
    }
  }
  
  return true;
}


//***************** LOCAL FUNCTIONS  ******************

//Passed a single tag node, returns an SSRecord if it's recognized.

function buildSSRecord(node) {

  var ssDynaList = new Array();
  
  var ssAttrStr = node.getAttribute("mmTranslatedValueDynAttrs");

  if (ssAttrStr && ssAttrStr.length) {
    
    var index = ssAttrStr.indexOf("=");

    if (index > -1) {

      var ssAttrStr = ssAttrStr.substring(index+1);

      var dynAttrs = ssAttrStr.split(",");
      
      for (var i=0; i < dynAttrs.length; i++) {

        var dynAttrValue = node.getAttribute(dynAttrs[i]);
        
        if (dynAttrValue) {
        
          var dynInfoArray = new Array();

          if (useMiniTranslator) {

            var transFileName = "";
            var currServerModel = dw.getDocumentDOM().serverModel.getFolderName();
            if (currServerModel == "ASP_JS" || currServerModel == "ASP_VBS")
            {
              transFileName = "ASP.htm";
            }
            else if (currServerModel == "JSP")
            {
              transFileName = currServerModel + ".htm";
            }
            
            if (transFileName) {
              translatorDOM = dw.getDocumentDOM(dw.getConfigurationPath() + "/Translators/" + transFileName);

              if (translatorDOM) {
                var info;
                if (currServerModel == "Cold Fusion" &&
                    dynAttrValue.toLowerCase().indexOf("<cfoutput") == -1) {
                  var translation = translatorDOM.parentWindow.miniTranslateMarkup("", "", "<cfoutput>" + dynAttrValue + "</cfoutput>", false);
                } else {
                  var translation = translatorDOM.parentWindow.miniTranslateMarkup("", "", dynAttrValue, false);
                }

                var source, binding, orig;
                PATT_transSource.lastIndex = 0;
                PATT_transBinding.lastIndex = 0;
                PATT_transOrig.lastIndex = 0;
                while ( (source = PATT_transSource.exec(translation)) != null &&
                        (binding = PATT_transBinding.exec(translation)) != null &&
                        (orig = PATT_transOrig.exec(translation)) != null ) {
                  info = new Object();
                  info.sourcename = source[1];
                  info.bindingname = binding[1];
                  info.expression = unescape(orig[1]);
                  if (currServerModel == "Cold Fusion" && 
                      dynAttrValue.toLowerCase().indexOf("<cfoutput") == -1) {
                    info.expression = info.expression.replace(/<[\/]?cfoutput>/gi, "");
                  }
                  dynInfoArray.push(info);
                }            
              }
            }

          }

          if (!dynInfoArray.length) {
            dynInfoArray[0] = new Object();  // default value
          }

          for (var j=0; j < dynInfoArray.length; j++) {

            var expectedParticipants=0;
            expectedParticipants++;
            ssRec = new SSRecord();
            ssRec.attribute = dynAttrs[i];
            ssRec.expression = dynAttrValue;

            if (dynInfoArray[j].sourcename != null) {
              ssRec.sourcename = dynInfoArray[j].sourcename;
              ssRec.bindingname = dynInfoArray[j].bindingname;
              ssRec.expression = dynInfoArray[j].expression;
            }

            tagName = node.tagName;
            if (node.getAttribute("name")) {
              tagName = node.getAttribute("name");
            }

            ssRec.type  = CONST_TYPE;
            if (ssRec.sourcename && ssRec.bindingname) {
              ssRec.title = MM.LABEL_DynamicAttrTitle + " (" + tagName.toLowerCase() + "." + dynAttrs[i] + ", " + ssRec.sourcename + "." + ssRec.bindingname +")";
            } else {
              ssRec.title = MM.LABEL_DynamicAttrTitle + " (" + tagName.toLowerCase() + "." + dynAttrs[i] +")";
            }
            ssRec.participants.push(node);
            ssRec.weights.push("nodeAttribute+"+ssRec.attribute);
            ssRec.selectedNode = node;

            ssRec.incomplete = (ssRec.participants.length != NUM_Participants); 

            ssRec.isStat = false;
            if (ssRec.bindingname) {
              //determine if recordset statistic
              var statType = ssRec.bindingname.match(/(\w+) record/i);//pattern for stats, set by translator
              if (statType && statType.length > 1) {          //if Recordset Statistic, add participant
                ssRec.statType = statType[1];
                ssRec.rs       = ssRec.sourcename;
                ssRec.isStat = true;
                var participantList = new Array("DeclareStats", "CountRecords");
                expectedParticipants += findScriptParticipants(ssRec, participantList, getScriptNodes());
                ssRec.incomplete = (ssRec.participants.length != expectedParticipants);
              }

              if (ssRec.incomplete) {
                ssRec.message = MM.MSG_CouldNotFindMyCode
                ssRec.severity = "abort"
              }
            }

            ssDynaList.push(ssRec);
          }
        }
      }
    }
    
  }
          
  return ssDynaList;
}
