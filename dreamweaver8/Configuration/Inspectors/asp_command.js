//Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
var gcdname = null;
var gCDObj = null;
var priorRec=null;
var DEBUG = false;
var LIST_RS;
var CONST_TYPE = "command";

var REC_INDEX = -1;
var theCDObj = null;
var helpDoc = MM.HELP_inspStoredProcedure;

function editServerBehavior() 
{
	var ssRecs = null;
	if (dw.sbi)
	ssRecs = dw.sbi.getServerBehaviors()

	if (ssRecs) 
	{
		var nRecs = ssRecs.length,recInd,partInd, parts,nParts,currRec;
		for (recInd=0; recInd < nRecs; recInd++) 
		{
			currRec = ssRecs[recInd];
			// search the server behavior list, and check if it's a 'command'
			if (currRec.type == CONST_TYPE) 
			{
				parts = currRec.participants;
				nParts = parts.length;
			    
				for (partInd=0; partInd < nParts; partInd++)
				{
					if (theCDObj == parts[partInd])
					{
						REC_INDEX = recInd;
						break;
					}
				}
			}
		}
	}

	// pass the index to the selected object.
	if (REC_INDEX > -1)
	{
		var thisRec = ssRecs[REC_INDEX];
		dw.popupServerBehavior(thisRec);
	}
}
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
	if ((translatorClass != "MM_ASPSCRIPT") && (translatorClass != "MM_LIVE_DATA"))
	{
	return false;
	}

	lockType = theObj.getAttribute("type");
	if ( lockType != "command")
	{
		return false;
	}

	return true;

} // function canInspectSelection()

function initializeUI() {

  SQL_BOX     = findObject("SQL");
  CD_NAME_BOX   = findObject("CommandName");
  PREPARED    = findObject("Prepared");
  CD_TIME_OUT   = findObject("CommandTimeOut");   
  RRESULTSET    = findObject("RResultset");
  RRESULTSETNAME  = findObject("RResultsetName");
  CONN_LIST   = findObject("ConnectionList")

}


function inspectSelection() 
{
  var theObj;
  var curSelection;
  var CdName;

  var currentdom = dreamweaver.getDocumentDOM();
  curSelection = dreamweaver.getSelection();
  theObj = dreamweaver.offsetsToNode(curSelection[0],curSelection[0]);


  // get the name of the selected command
  var selectedString = currentdom.documentElement.outerHTML.substring(curSelection[0],curSelection[1])
  if ( selectedString.search(/\b(\w+)\b\s*=\s*server.createobject/i) != -1)
  {
    var commandName = RegExp.$1 
  }
  else
  {
    return
  }

  var lockType = theObj.getAttribute("type")
  if (lockType != "command")
  {
    return;
  }

  //  Get the selection and the data from the selection
  if (theObj.nodeType != Node.ELEMENT_NODE) 
  {
    return;
  }

  var theRRObj = null;
  var RRnodes = currentdom.getElementsByTagName("MM_COMMAND");
  
  for (var index =0 ; index < RRnodes.length ; index++)
  {
    var rrnode = RRnodes[index];
    if (rrnode)
    {   
      if (rrnode.getAttribute("name") == commandName)
      {
        theCDObj = rrnode;
        gCDObj = rrnode;
        break;
      }
    }
  }

  initializeUI();

  priorRec = findSSrec(theCDObj,CONST_TYPE);

  if (priorRec && !priorRec.incomplete)
  {
    CD_NAME_BOX.value   = priorRec.cdName;
    gcdname         = priorRec.cdName;
    SQL_BOX.value     = priorRec.commandText;

    if (priorRec.commandTimeout)
      CD_TIME_OUT.value   = priorRec.commandTimeout;
    else
      CD_TIME_OUT.value   = "";

    SetEnabled(CONN_LIST, true);
    CONN_LIST.value = priorRec.connectionName;
    SetEnabled(CONN_LIST, false);

    if (priorRec.prepared == true)
      PREPARED.checked = true;
    else
      PREPARED.checked = false;

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
//This function checks for duplicate names, and verifies that the name is valid.
////////////////////////////////////////////////////////////
function CheckForDuplicates()
{
  var cdName = CD_NAME_BOX.value;
  var errMsg = "";

  if (priorRec.cdName == cdName)
      return;

  if (cdName == "")
  {
    errMsg = MM.MSG_MissingCommandName;
  } 
  else if (!IsValidVarName(cdName)) 
  {
    errMsg = MM.MSG_InvalidCommandName;
  } 
  else if (CheckForDuplicateNames("MM_COMMAND",cdName,gCDObj)) 
  {
    errMsg = MM.MSG_DupeCommandName;
  } 
  
  if (!errMsg) {
    UpdateCommand();
  } else {
    alert(errMsg);
    // CD_NAME_BOX.value = priorRec.cdName;
    CD_NAME_BOX.focus();
    CD_NAME_BOX.select();
  }
}

////////////////////////////////////////////////////////////
//                              //    
////////////////////////////////////////////////////////////
function LaunchCmd()
{
  if (gCDObj)
  {
    priorRec = findSSrec(gCDObj,CONST_TYPE);
    if (priorRec)
      dw.popupServerBehavior(priorRec);
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
  
  if (priorRec.commandText == theSQL)
    return;

  var validSQL = false

  var spRE = /^\s*call/i
  if (theSQL.search(spRE) > -1)
    validSQL = true

  var insertRE = /^\s*insert/i
  if (theSQL.search(insertRE ) > -1)
    validSQL = true

  var updateRE = /^\s*update/i
  if (theSQL.search(updateRE ) > -1)
    validSQL = true

  var deleteRE = /^\s*delete/i
  if (theSQL.search(insertRE ) > -1)
    validSQL = true

  if (!validSQL)
  {
    alert(MM.MSG_InvalidSQL);
    SQL_BOX.select();
    return;
  }
  UpdateCommand();
}


function CheckForInvalidCommandTimeOut()
{
  commandTimeOut = CD_TIME_OUT.value;

  if (priorRec.commandTimeout == commandTimeOut)
    return;

  if (commandTimeOut.length > 0)
  {
       if (!(parseInt(commandTimeOut) == commandTimeOut) || !(commandTimeOut>=0))
       {
        alert(MM.MSG_InvalidTimeout);
        CD_TIME_OUT.focus();
        CD_TIME_OUT.select();
        return;
       }
  }
  else
  {
      alert(MM.MSG_InvalidCommandTimeout);
      return;
  }
  UpdateCommand();
}

function returnResultSetCheck()
{
	var rschecked     =  RRESULTSET.checked;
	if (!rschecked)
	{
		RRESULTSETNAME.value = "";
	}
	UpdateCommand();
}

////////////////////////////////////////////////////////////
//This functions Updates Command calling into 
//helper fucntions using a bunch of validations before it
//it makes the call.
////////////////////////////////////////////////////////////
function UpdateCommand()
{
  theName       =  CD_NAME_BOX.value;
  theParamArray   =  ConvertParamRecToArray(priorRec);
  theCommandText    =  GetCommandText(theName, theParamArray, priorRec.commandtype);
  //theConnectionString =  "\"" + MMDB.getConnectionString(CONN_LIST.getValue())  + "\"" ;
  //theConnectionString =  MMDB.getConnectionString(CONN_LIST.value);
  theConnectionString = "MM_" + CONN_LIST.value + "_STRING";
  thePrepared     =  PREPARED.checked; 
  rschecked     =  RRESULTSET.checked;
  theCommandTimeOut =  CD_TIME_OUT.value;
  theResultSetName  = null;

  theResultSetName = RRESULTSETNAME.value;
  if (theResultSetName && (theResultSetName.length <= 0))
  {
   theResultSetName = null;  
  }

  if (priorRec)
  {
    if ((priorRec.cdName != theName) ||
      (priorRec.commandText != theCommandText)  ||
      (priorRec.commandTimeout != theCommandTimeOut) ||
      (priorRec.prepared != thePrepared) ||
      (priorRec.recordset != theResultSetName)    ||
      (priorRec.activeconnection != theConnectionString)) 
    {
      var dom = dreamweaver.getDocumentDOM(dreamweaver.getConfigurationPath() + "/ServerBehaviors/ASP_VBS/Command.htm");
      if (dom)
      {
        var editList = dom.parentWindow.buildSSEdits(priorRec, theName, CONN_LIST.value, theConnectionString, theCommandText, priorRec.commandtype, theCommandTimeOut, thePrepared, theResultSetName, theParamArray);
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
      if (priorRec.commandtype == 4)
      {
        Param[0] = thisParam.name;
        Param[1] = thisParam.type;
        Param[2] = thisParam.direction;
        Param[3] = thisParam.size;
        Param[4] = thisParam.value;
        Param[5] = thisParam.runTime;
        
      }
      else
      {
        Param[0] = thisParam.name;
        Param[1] = thisParam.value;
        Param[2] = thisParam.runTime;
      }
      ParamArray.push(Param);
    }
  }
  return ParamArray;
}

function GetCommandText(cdName,ParamArray,theCommandType)
{
  /*
  This function looks at the list of params and
  creates a SQL string that has variables in it.
  For example: If there is a parameter called
  "@Name" and a SQL statement that looks like
  "Select * from table where name = 'Name'",
  this function will output
  "Select * from table where name = '" + Command1_Name + "'"
  (Note: the double quotes at the ends of the string are not 
  included in the output)
  */
    var ServerBehaviorLanguage = dw.getDocumentDOM().serverModel.getServerLanguage();

  var theSQL = SQL_BOX.value;
  if (ServerBehaviorLanguage == "JavaScript")
  {
    theSQL = theSQL.replace(/\n/g,"\\n");
    theSQL = theSQL.replace(/\r/g,"\\r");
  }
  else
  {
    theSQL = theSQL.replace(/\r/g,"\" + Chr(13) + Chr(10) + \"");
    theSQL = theSQL.replace(/\n/g,"");
  }

  if ((theCommandType == 4) || (ParamArray.length == 0))
  {
    return "\"" + theSQL + "\"";
  }


  //there were params
  for (i = 0; i < ParamArray.length; i++)
  {
    var ParamName = ParamArray[i][0];
    var ParamRe = new RegExp("\\b" + ParamName + "\\b","ig");
    
    if (dw.getDocumentDOM().serverModel.getServerLanguage() == "JavaScript")
    {
      var sqlparam = MASK_AspSQLJSParam;
      sqlparam = sqlparam.replace(/##cdname##/g,cdName);
      sqlparam = sqlparam.replace(/##pname##/g,ParamName);
      theSQL = theSQL.replace(ParamRe,sqlparam)
    }
    else
    {
      var sqlparam = MASK_AspSQLVBParam;
      sqlparam = sqlparam.replace(/##cdname##/g,cdName);
      sqlparam = sqlparam.replace(/##pname##/g,ParamName);
      theSQL = theSQL.replace(ParamRe,sqlparam)
    }
  }

  return "\"" + theSQL + "\"";
}
