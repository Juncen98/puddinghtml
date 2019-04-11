//Copyright 2000, 2001, 2002, 2003, 2004 Macromedia, Inc. All rights reserved.


var MENU_CURSOR_TYPE;
var MENU_CURSOR_LOCATION;
var MENU_LOCK_TYPE;
var TF_SQL;
var TF_CONNECTION;
var TF_NAME;
var TF_MAXROWS;
var TF_TIMEOUT;

var helpDoc = MM.HELP_inspRecordset;
var REC_SELECTED; 
var PART_SELECTED;
var REC_INDEX;


// ********************* API FUNCTIONS ***************************


function canInspectSelection() {
  var dom = dw.getDocumentDOM();
  var selectedObj = dom.getSelectedNode();
  var foundRec = "";
  var foundPart = "";
  
  // get all participants of all server behaviors
  var ssRecs = null;
  if (dw.sbi)
	ssRecs = dw.sbi.getServerBehaviors()
  if (ssRecs) {
    var nRecs = ssRecs.length,recInd,partInd, parts,nParts,currRec;

    
    for (recInd=0;recInd<nRecs;recInd++) {
      currRec = ssRecs[recInd];
      if (currRec.type == "recordset" || currRec.type == "recordset_JDBC20") {
        parts = currRec.participants;
        nParts = parts.length;
        for (partInd=0;partInd<nParts;partInd++){
          if (selectedObj == parts[partInd]){
            REC_SELECTED = foundRec = currRec;
            PART_SELECTED = foundPart = parts[partInd];
            REC_INDEX = recInd;
            break;
          }
        }
        if (foundPart) break;
      }
    }
  }
  
  return (foundRec != "");
}


function initializeUI() {
  var currServerModel = dw.getDocumentDOM().serverModel.getServerName();

  // define form widgets
  if (currServerModel != "Cold Fusion") {
    
    MENU_CURSOR_TYPE     = new ListControl("CursorType","",true);
    MENU_LOCK_TYPE       = new ListControl("LockType","",true);
    if (currServerModel == "ASP" || currServerModel == "ASPNet") {
      MENU_CURSOR_LOCATION = new ListControl("CursorLocation","",true);
    } else { // model is JSP
      TF_TIMEOUT = findObject("TimeOut");
    }
  }
  if (currServerModel == "Cold Fusion" || currServerModel == "JSP") {
    TF_MAXROWS = findObject("MaxRows");
  }

  TF_SQL               = findObject("SQL")
  TF_NAME              = findObject("RecordsetName")
  TF_CONNECTION        = findObject("ConnectionList")

 // reposition form elements for Windows Platform
   if (navigator.platform.charAt(0)=="W" && findObject("bottomLayer")) {
     prefsUseLargeFont = dw.getPreferenceString("Accessibility", "Use Large Font", "");
	 if(prefsUseLargeFont != 'TRUE')
       document.layers["bottomLayer"].top = 54;
	 else
	   document.layers["bottomLayer"].top = 54;
   }
}


function inspectSelection() {
  
  var sbObj = REC_SELECTED;
           
  initializeUI();

  TF_NAME.value = sbObj.parameters.rsName;
  setConnectionDisplay(sbObj.parameters.cname);
  TF_SQL.value = stripNewLineChars(sbObj.parameters.sql);
  
  var currServerModel = dw.getDocumentDOM().serverModel.getServerName();

  if (currServerModel == "ASP" || currServerModel == "ASPNet") {
      
    if (MENU_CURSOR_TYPE) // if this field exists
      MENU_CURSOR_TYPE.pickValue(sbObj.parameters.cursorType);
    if (MENU_LOCK_TYPE) // if this field exists
      MENU_LOCK_TYPE.pickValue(sbObj.parameters.lockType)
    if (MENU_CURSOR_LOCATION) // if this field exists
      MENU_CURSOR_LOCATION.pickValue(sbObj.parameters.cursorLocation);
      
  } else if (currServerModel == "Cold Fusion") {

    if (TF_MAXROWS) {
      TF_MAXROWS.value = (sbObj.parameters.maxRowsValue) ? sbObj.parameters.maxRowsValue : "";
    }

  } else if (currServerModel == "JSP") {
    
    if (MENU_CURSOR_TYPE) { // if this field exists
      var index = getResultSetTypeIndex(sbObj.parameters.cursorType);
      MENU_CURSOR_TYPE.setIndex(index);
    }
    if (MENU_LOCK_TYPE) { // if this field exists
      var index = getResultSetConIndex(sbObj.parameters.lockType);
      MENU_LOCK_TYPE.setIndex(index);
    }
    if (TF_MAXROWS) {
      TF_MAXROWS.value = (sbObj.parameters.fetchSize) ? sbObj.parameters.fetchSize : "";
    }
    if (TF_TIMEOUT) {
      TF_TIMEOUT.value = (sbObj.parameters.queryTimeout) ? sbObj.parameters.queryTimeout : "";
    }

  }
      
}


// function: LaunchRSS
// description: launch the Recordset command, and changes the
// values on the PI accordingly
function LaunchRSS()
{
  priorRec = REC_SELECTED;
  if (priorRec)
    dw.popupServerBehavior(priorRec);
}



function updateRSRec(){
  var updateIsValid = true;
  var rsRec = REC_SELECTED;
  var currParams = rsRec.parameters;
  var currRec = REC_SELECTED;
  var paramType = updateRSRec.arguments[0];
  
  // validate new values
  // if invalid, place focus back in textfield that contains the
  // invalid value
  // the validation functions alert the actual error messages
  if (paramType) {
    switch (paramType){
      case "rsName":
        updateIsValid = validateRSName(TF_NAME.value);
        if (!updateIsValid) {
          TF_NAME.value = rsRec.rsName;
        }
        break;
        
      case "sql":
        updateIsValid = validateSQL(TF_SQL.value);
        if (!updateIsValid) {
          TF_SQL.value = stripNewLineChars(rsRec.source);
        }
        break;
        
      case "maxRows":
        var maxRowsVal = TF_MAXROWS.value;
        if (maxRowsVal == "") maxRowsVal = "0";
        if (maxRowsVal != "" && (notAnInteger(maxRowsVal) || maxRowsVal<0)) {
          alert (MM.MSG_ValueGreaterThanOrEqualToZero);
          updateIsValid = false;
          TF_MAXROWS.value = (rsRec.parameters.maxRowsValue)?rsRec.parameters.maxRowsValue:"";
        }
        break;
      
      case "timeOut":
        var timeOutVal = TF_TIMEOUT.value;
        if (timeOutVal == "") timeOutVal = "0";
        if (timeOutVal != "" && (notAnInteger(timeOutVal) || timeOutVal<0)) {
          alert (MM.MSG_ValueGreaterThanOrEqualToZero);
          updateIsValid = false;
          TF_TIMEOUT.value = (rsRec.parameters.timeOut)?rsRec.parameters.timeOut:"";
        }
    }
  }

  if (updateIsValid){
    var rsObj = MM.RecordsetObject; // potentially needed for encodeVarRefs function
    
    var paramObj = new Object();

    // values for parameter object not included in PI UI
    paramObj.varName = rsRec.parameters.varName;
    paramObj.defaultValue = rsRec.parameters.defaultValue;
    paramObj.runtimeValue =  rsRec.parameters.runtimeValue;

    // values taken from PI
    paramObj.cname = TF_CONNECTION.value;
    paramObj.sql =  TF_SQL.value;
    
    // If the user changed the name of the recordset, he/she probably wants
    //   all references to that recordset updated as well. Help user perform
    //   these updates by setting the find/replace dialog to replace all references
    //   in the document. 
    //   Note: the call to showFindReplaceDialog is non-blocking. So, the
    //   SB functions will finish up first and leave the Find/Replace dialog up for the
    //   user to work with.
    //   Note: if this code is called before the server behavior is updated, it will
    //   cause the recordset name NOT to be updated when the server behavior updates are
    //   applied. Rather, it assumes all recordset name updates for the entire page will be
    //   performed using the find/replace dialog. The idea is that the user probably doesn't
    //   really want to change the recordset name if they don't want to update it's references.
    //   To change this behavior, simply move this code after the recordset update is applied.

    // Only try to update the recordset references if the old name is different
    //   from the new name to apply and if the old name is already used on the
    //   page. 
    if (rsRec.rsName && TF_NAME.value && rsRec.rsName != TF_NAME.value)
    {
      alert(MM.MSG_UpdateRecordsetRefs);
        
      var searchObject = 
        { searchString: rsRec.rsName, 
          replaceString: TF_NAME.value,
          searchSource: true,
          matchCase: true,
          useRegularExpressions: false,
          ignoreWhitespace: false,
          searchWhat: "document"
        };
      
      dw.setActiveWindow(dw.getDocumentDOM());                       
      dw.setUpFindReplace(searchObject);
      dw.showFindReplaceDialog();
  
      // Force the recordset name to NOT get updated during apply.
      TF_NAME.value = rsRec.rsName;
    }
    // set the recordset name.
    paramObj.rsName = TF_NAME.value;
    
    var currServerModel = dw.getDocumentDOM().serverModel.getServerName();
    
    if (currServerModel == "ASP" || currServerModel == "ASPNet") {
      
      if (MENU_CURSOR_LOCATION) // if cursor location field
        paramObj.cursorLocation = MENU_CURSOR_LOCATION.getValue();
      if (MENU_CURSOR_TYPE) // if cursor type field
        paramObj.cursorType = MENU_CURSOR_TYPE.getValue();
      if (MENU_LOCK_TYPE) // if lock type field
        paramObj.lockType = MENU_LOCK_TYPE.getValue();
        
    } else if (currServerModel == "Cold Fusion") {

      if (TF_MAXROWS) {
        paramObj.maxRowsValue = TF_MAXROWS.value;
      }
      
    } else if (currServerModel == "JSP") {
      
      if (MENU_CURSOR_TYPE) { // if cursor type field
        var cursorType = MENU_CURSOR_TYPE.getValue();
        paramObj.cursorType = getResultSetTypeValue(cursorType);
      }
      if (MENU_LOCK_TYPE) { // if lock type field
        var lockType = MENU_LOCK_TYPE.getValue();
        paramObj.lockType = getResultSetConValue(lockType);
      }
      if (TF_MAXROWS) {
        paramObj.fetchSize = TF_MAXROWS.value;
      }
      if (TF_TIMEOUT) {
        paramObj.queryTimeout = TF_TIMEOUT.value;
      }
        
    }
    
    fixUpParamObjRecordset(paramObj, rsRec);

    applySB(paramObj,rsRec,"Recordset.htm");

    // reset original selection
    setTimeout("resetOriginalSelection()",20);
 }
  
}


function resetOriginalSelection(){
  var ssRecs = dw.sbi.getServerBehaviors()
  var thisRec = ssRecs[REC_INDEX];
  var primaryNode = thisRec.selectedNode;
  var theOffsets = dw.getDocumentDOM().nodeToOffsets(primaryNode);
  dw.getDocumentDOM().setSelection(theOffsets[0]+1,theOffsets[1]-1);
}


function stripNewLineChars(theStr){
  var str = theStr;
  
  while ( str.charAt(0) && (str.charAt(0) == "\n" || str.charAt(0) == "\r") ){
    str = str.substring(1);
  }
  
  if (str.charAt(0)){
    var lastChar = str.length-1;
    while ( str.charAt(lastChar) && 
           (str.charAt(lastChar) == "\n" || str.charAt(lastChar) == "\r") ){
      str = str.substring(0,str.length-1); 
      lastChar--;
    }
  }
  
  return str;
}


function notAnInteger(val){
  return (val != parseInt(val));
}


function validateRSName(rsName) {
  var isValid = true;
  var alertMsg = "";
  
  // just return true if the name hasn't changed
  if (REC_SELECTED.parameters.rsName == rsName)
    return isValid;

  if (rsName == "") {
    alertMsg = MM.MSG_NoRecordsetName;
  } else if (!IsValidVarName(rsName)) {
    alertMsg = MM.MSG_InvalidRecordsetName;
  } else if (IsDupeObjectName(rsName,REC_SELECTED.parameters.rsName)) {
    alertMsg = MM.MSG_DupeRecordsetName;
  }
  
  if (alertMsg) {
    alert (alertMsg);
    isValid = false;
  }
  
  return isValid;
}


function validateSQL(SQLstr) {
  // if value hasn't changed, just return true;
  if (SQLstr == REC_SELECTED.parameters.sql)
    return true;
    
  var validSQL = false;
  
  var spRE = /^\s*call/i
  if (SQLstr.search(spRE) > -1)
    validSQL = true
  var selectRE = /^\s*select/i
  if (SQLstr.search(selectRE) > -1)
    validSQL = true
    
  if (!validSQL) alert(MM.MSG_InvalidSQL);
  return validSQL;
}


function editServerBehavior() {
  var ssRecs = dw.sbi.getServerBehaviors()
  var thisRec = ssRecs[REC_INDEX];
  dw.popupServerBehavior(thisRec);
}


function setConnectionDisplay(newConnection) {
  TF_CONNECTION.removeAttribute("disabled");
  TF_CONNECTION.value = newConnection;
  TF_CONNECTION.setAttribute("disabled","true");
}


function getResultSetTypeValue(index)
{
  var resultsettype = new Array();

  resultsettype[0]="";
  resultsettype[1]="ResultSet.TYPE_FORWARD_ONLY";
  resultsettype[2]="ResultSet.TYPE_SCROLL_SENSITIVE";
  resultsettype[3]="ResultSet.TYPE_SCROLL_INSENSITIVE";

  return resultsettype[index];
}


function getResultSetTypeIndex(value) 
{
  var retVal = 0;
  value = (value) ? value : "";
  
  var resultsettype = new Array();

  resultsettype[0]="";
  resultsettype[1]="ResultSet.TYPE_FORWARD_ONLY";
  resultsettype[2]="ResultSet.TYPE_SCROLL_SENSITIVE";
  resultsettype[3]="ResultSet.TYPE_SCROLL_INSENSITIVE";
  
  for (var i=0; i < resultsettype.length; i++) {
    if (value == resultsettype[i]) {
      retVal = i;
      break;
    }
  }
  
  return retVal;
}


function getResultSetConValue(index)
{
  var resultsetcon = new Array();

  resultsetcon[0]="";
  resultsetcon[1]="ResultSet.CONCUR_READ_ONLY";
  resultsetcon[2]="ResultSet.CONCUR_UPDATABLE";

  return resultsetcon[index];
}


function getResultSetConIndex(value) 
{
  var retVal = 0;
  value = (value) ? value : "";
  
  var resultsetcon = new Array();

  resultsetcon[0]="";
  resultsetcon[1]="ResultSet.CONCUR_READ_ONLY";
  resultsetcon[2]="ResultSet.CONCUR_UPDATABLE";

  for (var i=0; i < resultsetcon.length; i++) {
    if (value == resultsetcon[i]) {
      retVal = i;
      break;
    }
  }
  
  return retVal;
}
