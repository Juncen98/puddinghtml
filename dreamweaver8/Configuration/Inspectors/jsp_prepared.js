//Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
var gpreparedName = null;
var gPreparedObj = null;
var priorRec=null;
var DEBUG = false;

var PREPARED_TIMEOUT;
var SQL_BOX;
var PREPARED_NAME_BOX;
var CONST_TYPE = "prepared";

var helpDoc = MM.HELP_inspJspPrepared;

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
  if ( lockType != "prepared")
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
  PREPARED_NAME_BOX = findObject("PreparedName")
  PREPARED_TIMEOUT = findObject("TimeOut"); 
  CONN_LIST   = findObject("ConnectionList")

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
  if ( selectedString.search(/\s*PreparedStatement\s*\b(\w+)\b\s*/i) != -1)
  {
    var preparedName = RegExp.$1  
  }
  else
  {
    return
  }

  var lockType = theObj.getAttribute("type")
  if (lockType != "prepared")
  {
    return;
  }



  //  Get the selection and the data from the selection
  if (theObj.nodeType != Node.ELEMENT_NODE) 
  {
    return;
  }

  var theRRObj = null;
  var RRnodes = currentdom.getElementsByTagName("MM_PREPARED");
  for (var index =0 ; index < RRnodes.length ; index++)
  {
    var rrnode = RRnodes[index];
    if (rrnode)
    {
      //if (IsNodeInsideRange(theObj,rrnode))  //This was causing a crash
      if (rrnode.getAttribute("name") == preparedName)
      {
        thePreparedObj = rrnode;
        gpreparedObj = rrnode;
        break;
      }
    }
  }

  initializeUI();

  priorRec = findSSrec(thePreparedObj,CONST_TYPE);

  if (priorRec && !priorRec.incomplete)
  {
    PREPARED_NAME_BOX.value = priorRec.preparedName;
    gpreparedName     = priorRec.preparedName;
    SQL_BOX.value     = priorRec.preparedText;
    PREPARED_TIMEOUT.value  = priorRec.querytimeOut;
    SetEnabled(CONN_LIST, true);
    CONN_LIST.value = priorRec.connectionName;
    SetEnabled(CONN_LIST, false);
  }

} // function inspectSelection() 
  


////////////////////////////////////////////////////////////
//This function checks for duplicate Prepared Name 
//and other auxillary validations.
////////////////////////////////////////////////////////////
function CheckForDuplicates()
{

  var preparedName = PREPARED_NAME_BOX.value;
  var errMsg = "";

  if (priorRec.preparedName == preparedName)
      return;

  if (preparedName == "")
  {
    errMsg = MM.MSG_NoPreparedName;
  }
  else if (!IsValidVarName(preparedName))
  {
    errMsg = MM.MSG_InvalidPreparedName
  }
  else if (CheckForDuplicateNames("MM_PREPARED",preparedName,gpreparedObj))
  {
    errMsg = MM.MSG_DuplicatePreparedName;
  }
  
  if (!errMsg) {
    UpdatePrepared();
  } else {
    alert(errMsg);
    // PREPARED_NAME_BOX.value = priorRec.preparedName;
    PREPARED_NAME_BOX.focus();
    PREPARED_NAME_BOX.select();
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

  var insertRE = /^\s*insert/i
  if (theSQL.search(insertRE) > -1)
    validSQL = true

  var updateRE = /^\s*update/i
  if (theSQL.search(updateRE) > -1)
    validSQL = true

  var deleteRE = /^\s*delete/i
  if (theSQL.search(deleteRE) > -1)
    validSQL = true

  if (!validSQL)
  {
    alert(MM.MSG_InvalidSQL);
    SQL_BOX.select();
    return;
  }
  UpdatePrepared();
}

function CheckForInvalidQueryTimeOut()
{
  commandTimeOut = PREPARED_TIMEOUT.value;

  if (priorRec.querytimeOut == commandTimeOut)
    return;

  if (commandTimeOut.length > 0)
  {
       if (!(parseInt(commandTimeOut) == commandTimeOut) || !(commandTimeOut>=0))
       {
        alert(MM.MSG_InvalidTimeout);
        PREPARED_TIMEOUT.focus();
        PREPARED_TIMEOUT.select();
        return;
       }
  }
  UpdatePrepared();
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
function UpdatePrepared()
{
  //Form the param array...
  theName       =  PREPARED_NAME_BOX.value;
  theParamArray   =  ConvertParamRecToArray(priorRec);
  theSQL        =  GetSQL(theName, theParamArray);
  //connName      =  CONN_LIST.getValue();
  connName      =  CONN_LIST.value;
  theConnectionString = "MM_" + connName + "_STRING";
  theDriverName   = "MM_" + connName + "_DRIVER";
  theUserName     = "MM_" + connName + "_USERNAME";
  thePassword     = "MM_" + connName + "_PASSWORD";
  theQueryTimeout   =  PREPARED_TIMEOUT.value;

  if (priorRec)
  {
    if ((priorRec.preparedName != theName) ||
      (priorRec.preparedText != theSQL) ||
      (priorRec.querytimeOut != theQueryTimeout)  ||
      (priorRec.activeconnection != theConnectionString)) 
    { 
      var dom = dreamweaver.getDocumentDOM(dreamweaver.getConfigurationPath() + "/ServerBehaviors/Jsp/Prepared.htm");
      if (dom)
      {
        var editList = dom.parentWindow.buildSSEdits(priorRec, theName, connName, theConnectionString, theDriverName, theUserName, thePassword, theSQL, theQueryTimeout, theParamArray);
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
      Param[1] = thisParam.runTime;
      ParamArray.push(Param);
    }
  }
  return ParamArray;
}

function GetSQL(preparedName,ParamArray)
{
  /*
  This function looks at the list of params and
  creates a SQL string that has variables in it.
  For example: If there is a parameter called
  "@Name" and a SQL statement that looks like
  "Select * from table where name = 'Name'",
  this function will output
  "Select * from table where name = '" + Recordset1_Name + "'"
  (Note: the double quotes at the ends of the string are not 
  included in the output)
  */
  theSQL = SQL_BOX.value
  theSQL = theSQL.replace(/\n/g,"\\n");
  theSQL = theSQL.replace(/\r/g,"\\r");

  if (ParamArray.length == 0)
  {
    return "\"" + theSQL + "\""
  }


  //there were params
  for (i = 0; i < ParamArray.length; i++)
  {
    var ParamName = ParamArray[i][0];
    var ParamRe = new RegExp("\\b" + ParamName + "\\b","ig");

    var sqlparam = MASK_SQLParam;
    sqlparam = sqlparam.replace(/##stname##/g,preparedName);
    sqlparam = sqlparam.replace(/##pname##/g,ParamName);
    theSQL = theSQL.replace(ParamRe,sqlparam)
  }
  return "\"" + theSQL + "\""
}
