//Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
var gcallableName = null;
var gCallableObj = null;
var priorRec=null;
var DEBUG = false;

var CALLABLE_TIMEOUT;
var SQL_BOX;
var CALLABLE_NAME_BOX;
var CONST_TYPE = "callable";

var helpDoc = MM.HELP_inspStoredProcedure;

function canInspectSelection() 
{
  var curSelection  = dreamweaver.getSelection();
  var theObj      = dreamweaver.offsetsToNode(curSelection[0],curSelection[0]);

  var translatorClass;
  var lockType;

  if ( theObj.nodeType != Node.ELEMENT_NODE )
  {
    return false; 
  }

  translatorClass = theObj.getAttribute("translatorClass");
  if ((translatorClass != "MM_JSPSCRIPT") && (translatorClass != "MM_LIVE_DATA"))
  {
    return false;
  }

  lockType = theObj.getAttribute("type");
  if ( lockType != "callable")
  {
    return false;
  }
  
  return true;

} // function canInspectSelection()

function initializeUI() {

  //Initial values for other fields?
  
  //CONN_LIST = new ListControl("ConnectionList");
  //CONN_LIST.object.innerHTML = ""
  
  //connList = MMDB.getConnectionList()
  //CONN_LIST.setAll(connList, connList)


  SQL_BOX = findObject("SQL")
  CALLABLE_NAME_BOX = findObject("CallableName")
  CALLABLE_TIMEOUT = findObject("TimeOut"); 
  RRESULTSET    = findObject("RResultset");
  RRESULTSETNAME  = findObject("RResultsetName");

  CONN_LIST   = findObject("ConnectionList");
  
   // reposition form elements for Windows Platform
   if (navigator.platform.charAt(0)=="W" && findObject("bottomLayer")) {
     prefsUseLargeFont = dw.getPreferenceString("Accessibility", "Use Large Font", "");
	 if (prefsUseLargeFont != 'TRUE')
       document.layers["bottomLayer"].top = 46;
	 else
	   document.layers["bottomLayer"].top = 54;
   }
}


function inspectSelection() 
{
  var theObj;
  var curSelection;
  var RecSetName;

  var currentdom = dreamweaver.getDocumentDOM();
  curSelection = dreamweaver.getSelection();
  theObj = dreamweaver.offsetsToNode(curSelection[0],curSelection[0]);

  // get the name of the selected command
  var selectedString = currentdom.documentElement.outerHTML.substring(curSelection[0],curSelection[1])
  if ( selectedString.search(/\s*CallableStatement\s*\b(\w+)\b\s*/i) != -1)
  {
    var callableName = RegExp.$1  
  }
  else
  {
    return
  }

  var lockType = theObj.getAttribute("type")
  if (lockType != "callable")
  {
    return;
  }



  //  Get the selection and the data from the selection
  if (theObj.nodeType != Node.ELEMENT_NODE) 
  {
    return;
  }

  var theRRObj = null;
  var RRnodes = currentdom.getElementsByTagName("MM_CALLABLE");
  for (var index =0 ; index < RRnodes.length ; index++)
  {
    var rrnode = RRnodes[index];
    if (rrnode)
    {
      //if (IsNodeInsideRange(theObj,rrnode))  //This was causing a crash
      if (rrnode.getAttribute("name") == callableName)
      {
        theCallableObj = rrnode;
        gcallableObj = rrnode;
        break;
      }
    }
  }

  initializeUI();

  priorRec = findSSrec(theCallableObj,CONST_TYPE);

  if (priorRec && !priorRec.incomplete)
  {
    CALLABLE_NAME_BOX.value = priorRec.callableName;
    gcallableName     = priorRec.callableName;
    SQL_BOX.value     = priorRec.callableText;
    CALLABLE_TIMEOUT.value  = priorRec.querytimeOut;
    SetEnabled(CONN_LIST, true);
    CONN_LIST.value = priorRec.connectionName;
    SetEnabled(CONN_LIST, false);

    if (priorRec.recordset)
    {
      RRESULTSET.checked = true;
      RRESULTSETNAME.value = priorRec.recordset;
    }
    else
    {
      RRESULTSET.checked = false;
      RRESULTSETNAME.value = "";
    }
  }

} // function inspectSelection() 
  


////////////////////////////////////////////////////////////
//This function checks for duplicate Callable Name 
//and other auxillary validations.
////////////////////////////////////////////////////////////
function CheckForDuplicates()
{

  var callableName = CALLABLE_NAME_BOX.value;
  var errMsg = "";

  if (priorRec.callableName == callableName)
      return;

  if (callableName == "")
  {
    errMsg = MM.MSG_NoCallableName;
  }
  else if (!IsValidVarName(callableName))
  {
    errMsg = MM.MSG_InvalidCallableName;
  }
    else if (CheckForDuplicateNames("MM_CALLABLE",callableName,gcallableObj))
  {
    errMsg = MM.MSG_DuplicateCallableName;
  }
  
  if (!errMsg) {
    UpdateCallable();
  } else {
    alert(errMsg);
    // CALLABLE_NAME_BOX.value = priorRec.callableName;
    CALLABLE_NAME_BOX.focus();
    CALLABLE_NAME_BOX.select();
  }
}



////////////////////////////////////////////////////////////
//This function checks for valid SQL
////////////////////////////////////////////////////////////
function CheckForInvalidSQL()
{

  // we only accept Select statements
  // and calls to sp's
  theSQL  =  SQL_BOX.value;

  if (priorRec.source == theSQL)
      return;

  var validSQL = false
  if (theSQL.indexOf("call") > -1)
    validSQL = true

  if (!validSQL)
  {
    alert(MM.MSG_InvalidSQL);
    SQL_BOX.select();
    return;
  }
  UpdateCallable();
}

function CheckForInvalidQueryTimeOut()
{
  commandTimeOut = CALLABLE_TIMEOUT.value;

  if (priorRec.querytimeOut == commandTimeOut)
    return;

  if (commandTimeOut.length > 0)
  {
       if (!(parseInt(commandTimeOut) == commandTimeOut) || !(commandTimeOut>=0))
       {
        alert(MM.MSG_InvalidTimeout);
        CALLABLE_TIMEOUT.focus();
        CALLABLE_TIMEOUT.select();
        return;
       }
  }
  else
  /*
  {
      alert(MM.MSG_InvalidTimeOut);
      return;
  }
  */
  UpdateCallable();
}


////////////////////////////////////////////////////////////
//                              //    
////////////////////////////////////////////////////////////
function LaunchRSS()
{
  priorRec = findSSrec(theRSObj,CONST_TYPE);
  if (priorRec)
    dw.popupServerBehavior(priorRec);
}

function GetValue(list)
{
  return list.options[list.selectedIndex].value
}

////////////////////////////////////////////////////////////
//This functions UpdatesRepeated Region calling into 
//helper fucntions using a bunch of validations before it
//it makes the call.
////////////////////////////////////////////////////////////
function UpdateCallable()
{
  //Form the param array...
  theName       = CALLABLE_NAME_BOX.value;
  theParamArray   = ConvertParamRecToArray(priorRec);
  theSQL        = GetCallableText(SQL_BOX.value);
  //connName      = CONN_LIST.getValue();
  connName      = CONN_LIST.value;
  theConnectionString = "MM_" + connName + "_STRING";
  theDriverName   = "MM_" + connName + "_DRIVER";
  theUserName     = "MM_" + connName + "_USERNAME";
  thePassword     = "MM_" + connName + "_PASSWORD";
  theQueryTimeout   = CALLABLE_TIMEOUT.value;

  rsChecked     =  RRESULTSET.checked;
  theResultsetName  = null;
  if (rsChecked)
  {
    theResultsetName = RRESULTSETNAME.value;
    if (theResultsetName.length <= 0)
    {
      theResultsetName = null;  
    }
  }

  if (priorRec)
  {
    if ((priorRec.callableName != theName) ||
      (priorRec.callableText != theSQL) ||
      (priorRec.querytimeOut != theQueryTimeout)  ||
      (priorRec.activeconnection != theConnectionString)||
      (priorRec.recordset != theResultsetName)) 
    {
      var dom = dreamweaver.getDocumentDOM(dreamweaver.getConfigurationPath() + "/ServerBehaviors/Jsp/Callable.htm");
      if (dom)
      {
        var editList = dom.parentWindow.buildSSEdits(priorRec, theName, connName, theConnectionString, theDriverName, theUserName, thePassword, theSQL, theQueryTimeout, theResultsetName, theParamArray,true);
        editList.insert(true);
      }
    }
  }  
}


function ConvertParamRecToArray(priorRec)
{
  var ParamArray = new Array();
  if (priorRec.ParamArray)
  {
    for (i = 0;i < priorRec.ParamArray.length; i++)
    {
      thisParam = priorRec.ParamArray[i];
      Param = new Array();
      Param[0] = thisParam.name;
      Param[1] = thisParam.type;
      Param[2] = thisParam.direction;
      Param[3] = thisParam.value;
      Param[4] = thisParam.runTime;
      ParamArray.push(Param);
    }
  }
  return ParamArray;
}

function GetCallableText(callableText)
{
  var theSQL = callableText;
  theSQL = theSQL.replace(/\n/g,"\\n");
  theSQL = theSQL.replace(/\r/g,"\\r");
  return "\"" + theSQL + "\"";
}
