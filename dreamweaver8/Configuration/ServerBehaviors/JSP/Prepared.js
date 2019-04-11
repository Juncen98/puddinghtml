// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************
var helpDoc = MM.HELP_ssPreparedJsp;

var CONST_TYPE = "prepared";
var NUM_Participants = 2;  //used to check completeness. If a participant
                           //is missing, set the .incomplete property
curPreparedType = -1
var contentsArray = new Array() //used to save the param grid
contentsArray[0] = new Array()
contentsArray[1] = new Array()
contentsArray[2] = new Array()
contentsArray[3] = new Array()
contentsArray[4] = new Array()

//These globals are used for SQL parsing
var CONST_UPDATE = "UPDATE"
var CONST_SET = "SET"
var CONST_WHERE = "WHERE"
var CONST_DELETE = "DELETE FROM"
var CONST_INSERT = "INSERT INTO"
var CONST_VALUES = "VALUES"

var VAR_UPD_UPDATE = ""
var VAR_UPD_SET = ""
var VAR_UPD_WHERE = ""
var VAR_DEL_DELETE = ""
var VAR_DEL_WHERE = ""
var VAR_INS_INSERT = ""
var VAR_INS_COLS = ""
var VAR_INS_VALUES = ""
var VAR_PROC = ""

var InsertLabelArray
var UpdateLabelArray
var DeleteLabelArray
var ProcLabelArray

var WGHT_JspPreparedInit = 40;
var WGHT_JspPrepared = 50;
var WGHT_JspPreparedClose="afterDocument";
var DEBUG = false;
var FOR_TEST = 1
var FINAL = 2

var ButtonArray = new Array()

function findServerBehaviors(){

  var i, ssRec, ssRecList = new Array();
  var dom = dw.getDocumentDOM();

  var nodes = dom.getElementsByTagName("MM_PREPARED");

  for (i=0; i<nodes.length; i++) {
    ssRec = buildSSRecord(nodes[i]);
    if (ssRec) ssRecList.push(ssRec); //add record to the array
  }
  return ssRecList; //empty means there are none here yet
}


function getConnectionName(theRec)
{
  // We need to find the correct UltraDev connection based on
  // the driver, URL, and username and password.
  var driver = theRec.driver;
  var url = theRec.activeconnection;
  var username = theRec.username?theRec.username:"";
  var password = theRec.password?theRec.password:"";

  return MMDB.getConnectionName(url, driver, "", username, password);
}


function buildSSRecord(node) {

  var preparedName = String(node.getAttribute("NAME"))
  if (preparedName != "undefined")
  {
    ssRec = new SSRecord();
    ssRec.errorMsg = "";
    ssRec.type  = CONST_TYPE;
    ssRec.title = MM.LABEL_TitlePrepared + " (" + preparedName + ")";

    ssRec.preparedName    = preparedName;
    ssRec.objectName    = preparedName;
    ssRec.activeconnection    = unescapequote(node.getAttribute("CONNECTIONNAME"));
    ssRec.driver        = unescapequote(node.getAttribute("DRIVER"));
    ssRec.preparedText      = unescapequote(node.getAttribute("QUERY"));
    ssRec.fetchSize       = node.getAttribute("FETCHSIZE");
    ssRec.querytimeOut      = node.getAttribute("QUERYTIMEOUT");
    if (ssRec.querytimeOut == null) ssRec.querytimeOut = "";
    ssRec.username        = unescapequote(node.getAttribute("CONNECTIONUSER"));
    ssRec.password        = unescapequote(node.getAttribute("CONNECTIONPASSWORD"));

    //check if this is a new connection
    var match = ssRec.activeconnection.match(/MM_(\w+)_STRING/);
    if (match && match.length > 0) {
      ssRec.connectionName = match[1];
      ssRec.activeconnection = MMDB.getConnectionString(ssRec.connectionName);      
    } else {    
      connectionName      = getConnectionName(ssRec);
      ssRec.connectionName  = connectionName;
      ssRec.outOfDate = true;
      ssRec.title += MM.LABEL_OutOfDate;
    }

    var insertRE = /^\s*insert/i
    var updateRE = /^\s*update/i
    var deleteRE = /^\s*delete/i
    if (ssRec.preparedText.search(insertRE ) > -1)
    {
      ssRec.preparedtype=3;
    }
    else if (ssRec.preparedText.search(updateRE ) > -1)
    {
      ssRec.preparedtype=2;
    }
    else if (ssRec.preparedText.search(deleteRE ) > -1)
    {
      ssRec.preparedtype=1;
    }
    else
    {
      ssRec.preparedtype=0;
    }

    ssRec.participants.push(node);
    ssRec.weights.push(WGHT_JspPrepared);
    ssRec.types.push("prepared_main");
    ssRec.selectedNode = node;

    var dom = dw.getDocumentDOM();
    var nodes = dom.getElementsByTagName("MM_PREPAREDCLOSE");
        for (i=0; i<nodes.length; i++) {
      var name = nodes[i].getAttribute("NAME");
      if (name.indexOf(ssRec.preparedName) > -1)
      {
        ssRec.participants.push(nodes[i]);
        ssRec.weights.push(WGHT_JspPreparedClose);
        ssRec.types.push("prepared_close");
        break;
      }
    }

    var allParameterPresent = true;
    if (node.hasChildNodes())
    {

      if (!ssRec.ParamArray)
        ssRec.ParamArray = new Array();

       var parameterValueNode=null;

       dom = dw.getDocumentDOM();
      
       nameValueNodes = dom.getElementsByTagName("MM_VARIABLES");
       for (j=0; j<nameValueNodes.length; j++) { //with each MM_VARIABLES node
        nameValueNode = nameValueNodes[j];
        if (nameValueNode && nameValueNode.getAttribute("NAME") == ssRec.preparedName)
        {
          parameterValueNode=nameValueNode;
          break;
        }
       }
      
      if (parameterValueNode)
      {
        for (i = 0;i < node.childNodes.length; i++)
        {
          thisParam = node.childNodes[i];
          name = Trim(thisParam.NAME);
          for (j =0; j < parameterValueNode.childNodes.length;j++)
          {
               ValueNode = parameterValueNode.childNodes[j];
             pname = Trim(ValueNode.getAttribute("NAME"));
             if (name == pname)
             {
              var Param = new Object();
              var re = /(\w+)__(\w+)/i;
              index = name.search(re);
              if (index != -1)
              {
                Param.name =  RegExp.$2;
                runTime = unescapequote(ValueNode.getAttribute("RUNTIME"));
                Param.runTime = runTime;
                ssRec.ParamArray[ssRec.ParamArray.length]=Param;
              }
             }
          }
        }

        ssRec.participants.push(parameterValueNode);
        ssRec.weights.push(WGHT_JspPreparedInit);
        ssRec.types.push("prepared_param");
      }
      allParameterPresent = (node.childNodes.length == ssRec.ParamArray.length);
    }
    ssRec.incomplete = (ssRec.participants.length < NUM_Participants) || (!allParameterPresent);

    if (!ssRec.outOfDate) {
      //look for the connection statement
      var found = false;
      var part = new Participant("connectionref_statement");
      //NOTE: dw.getParticipants will only find participants that are
      //      part of a server behavior group file whose find is triggered.
      //      We can use this call here, because the search patterns for
      //      recordset will be triggered by the Callable runtime code.
      var partList = dw.getParticipants("connectionref_statement");
      for (var i=0; partList && i < partList.length; i++) {
        if (partList[i].parameters.cname == ssRec.connectionName) {
          //add this part to the ssRec
          ssRec.participants.push(partList[i].participantNode);
          ssRec.weights.push(part.location);
          ssRec.types.push(part.name);
          ssRec.parameters = new Object();
          ssRec.parameters.cname = partList[i].parameters.cname;
          ssRec.parameters.urlformat = partList[i].parameters.urlformat;
          ssRec.parameters.relpath = partList[i].parameters.relpath;
          ssRec.parameters.ext = partList[i].parameters.ext;

          //check if the path is correct, if the file is saved
					//if the current server model is JSP
					var urlformat = ssRec.parameters.urlformat;
					//if the connection relative path begins with '/' it is site relative
					if ((ssRec.parameters.relpath != null) && (ssRec.parameters.relpath[0]=='/'))
					{
						//set the urlformat to virtual
						urlformat = "virtual";
					}
          if (dom && dom.URL && partList[i].parameters.relpath != getConnectionsPath(partList[i].parameters.cname,urlformat)) {
            ssRec.incomplete = true;
            ssRec.errorMsg += "\n"+MM.MSG_ConnectionPathInvalid;
          }

          found = true;
          break;
        }
      }
      if (!found) ssRec.incomplete = true;
    }


  }
  return ssRec;
}


function applyServerBehavior(priorRec) 
{
  var errMsg = CheckData(FINAL,priorRec);

  if (errMsg == "")
  {
    var theName       = GetName();
    var theDSN        = CONN_LIST.getValue();
    var theParamArray   = GetParamArray();
    var thePreparedText   = GetPreparedText(theName, theParamArray);
    var theConnectionString = getJDBCConnectionString(theDSN);
    var theDriverName   = getDriverName(theDSN);
    var theUserName     = getUserName(theDSN);
    var thePassword     = getPassword(theDSN);
    if (priorRec)
    {
      var theQueryTimeout = priorRec.querytimeOut;
    }
    else
    { 
      var theQueryTimeout  = GetQueryTimeOut();
    }
    editList = buildSSEdits(priorRec, theName, theDSN, theConnectionString, theDriverName, theUserName, thePassword, thePreparedText, theQueryTimeout, theParamArray);
    editList.insert(true);
  }

  return errMsg;
}


function GetValueFromEncoding(strIn)
{
  var value=null;
  
  if (strIn){
    value = strIn

    value = value.replace(/\\"/ig, "\"") // decode  \"
    //now take off the quotes on the ends

    if (value.length > 1)
    {
      value = value.substring(1, value.length - 1)
    }
  }
  return value
}



function getJDBCConnectionString(name)
{
  //return "\"" + MMDB.getDeployConnectionString(name) + "\"";
  return "MM_" + name + "_STRING";
}

function getDriverName(name)
{
  //return "\"" + MMDB.getDriverName(name) + "\"";
  return "MM_" + name + "_DRIVER";
}

function getUserName(name)
{
  //return "\"" + MMDB.getUserName(name) +  "\"";
  return "MM_" + name + "_USERNAME";
}

function getPassword(name)
{
  //return "\"" + MMDB.getPassword(name) + "\"";
  return "MM_" + name + "_PASSWORD";
}

function getConnectionInfo(connectionString)
{
  var ConnectionInfo = new Array();

  var re = /dsn\s*=\s*(\w+)\s*;uid\s*=\s*(\w+)\s*;pwd\s*=\s*(\w+)\s*/i;

  if (connectionString.length)
  {
    var index = connectionString.search(re);
    if (index != -1)
    {
      ConnectionInfo[0] = RegExp.$1;
      ConnectionInfo[1] = RegExp.$2;
      ConnectionInfo[2] = RegExp.$3;
    }
  }

  return ConnectionInfo;
}


//This function returns a Connection Object with ConnectionProperties
function getConnectionString(connectionName)
{
  return "\""+ MMDB.getConnectionString(connectionName) + "\"";
}

function buildSSEdits(priorRec, theName, theDSN, theConnectionString, theDriverName, theUserName, thePassword, thePreparedText, theQueryTimeout, theParamArray)
{
  editList = new SSEdits();
  
  var priorInitNode = null;
  var priorCloseNode = null;
  var priorPrimaryNode = null;
  if (priorRec) {
    priorPrimaryNode = priorRec.getParticipant("prepared_main");
    priorCloseNode = priorRec.getParticipant("prepared_close");
    priorInitNode = priorRec.getParticipant("prepared_param");    
  }

  //insert the connection include if necessary
  var connectionRef = new Participant("connectionref_statement");
  var paramObj = new Object();
  paramObj.cname = theDSN;    
	if (priorRec != null)
	{
	  //get the existing url format
		paramObj.urlformat = priorRec.parameters.urlformat;
		if ((priorRec.parameters.relpath != null) && (priorRec.parameters.relpath[0]=='/'))
		{
			//set the urlformat to virtual
			paramObj.urlformat = "virtual";
		}
	}
	else
	{
	  //get a default url format
		paramObj.urlformat = getConnectionsUrlFormat(dw.getDocumentDOM());
	}
  paramObj.relpath = getConnectionsPath(paramObj.cname,paramObj.urlformat);
  paramObj.ext = getServerExtension();
	//for JSP file with "/" serves as virtual url prefix, so change the urlformat to "file"
	if ((paramObj.urlformat != null) && (paramObj.urlformat == "virtual"))
	{
		paramObj.urlformat = "file";
	}
    
    
  //special case the update of connection_ref, to prevent multiple
  // connection statements from being created
  if (priorRec && 
      (priorRec.parameters.relpath != paramObj.relpath ||
       priorRec.parameters.ext != paramObj.ext) &&
      priorRec.parameters.cname == paramObj.cname) {
    priorRec.MM_forcePriorUpdate = "connectionref_statement";
  }
  
	var bAddConnectionChunk = true;
	var partList = dw.getParticipants("connectionref_statement");
	for (var j=0; partList && j < partList.length; j++) {
		if (partList[j].parameters.cname == paramObj.cname) {
			bAddConnectionChunk = false;
			break;
		}
	}

	//if we don't have a connection add it
	if (bAddConnectionChunk)
	{
		connectionRef.apply(editList,paramObj, priorRec);
	}
  

  var newClose = getClose(priorCloseNode, theName);
  if (priorCloseNode || newClose.length)
  {
      editList.add(newClose, priorCloseNode, WGHT_JspPreparedClose);
  }
  var newInit = getInit(priorInitNode, theName, theParamArray);
  if (priorInitNode || newInit.length)
  {
      editList.add(newInit, priorInitNode, WGHT_JspPreparedInit);
  }
  var newPrimary = getPrimary(priorPrimaryNode, theName, theConnectionString, theDriverName, theUserName, thePassword, thePreparedText, theQueryTimeout, theParamArray);
  if (priorPrimaryNode || newPrimary.length)
  {
      editList.add(newPrimary, priorPrimaryNode, WGHT_JspPrepared);
  }

  return editList;
}

function getClose(node, theName)
{
  if (node)
  {
    var close = getOrigForLockedNode(node);
    close = close.replace(/(Conn)\w+(\.close)/i, "$1" + theName + "$2");
  }
  else
  {
    var close = MASK_JspPreparedClose;
    close = close.replace(/##stname##/g, theName);
  }

  return close;
}

function getInit(node, theName, theParamArray)
{
  var init = "";
  if (theParamArray.length)
  {
    init = "\n<%\n";
    for (var i=0; i < theParamArray.length; i++)
    {
      var paramName     = theParamArray[i][0]; 
      var paramRExpression  = theParamArray[i][1];
      var param = MASK_Param;       
      param = param.replace(/##pname##/g, paramName);
      param = param.replace(/##rexpression##/g, paramRExpression);
      param = param.replace(/##stname##/g, theName);
      init += param;
    }
    init += "\n%>\n";
  }

  return init;
}

function getPrimary(node, theName, theConnectionString, theDriverName, theUserName, thePassword, thePreparedText, theQueryTimeout, theParamArray)
{
  if (node)
  {
    var primary = getOrigForLockedNode(node);
    primary = updatePrimary(primary, theName, theConnectionString, theDriverName, theUserName, thePassword, thePreparedText, theQueryTimeout, theParamArray);
  }
  else
  {
    var primary = MASK_Prepared;
    primary = primary.replace(/##stname##/g, theName);
    primary = primary.replace(/##theConnectionString##/g, theConnectionString);
    primary = primary.replace(/##drivername##/g, theDriverName);
    primary = primary.replace(/##theUserName##/g, theUserName);
    primary = primary.replace(/##theUserPass##/g, thePassword);
    primary = primary.replace(/##theSQL##/g, thePreparedText);
    primary = primary.replace(/##theQueryTimeOut##/g, theQueryTimeout);
  }

  return primary;
}

function updatePrimary(primary, theName, theConnectionString, theDriverName, theUserName, thePassword, thePreparedText, theQueryTimeout, theParamArray)
{
  // update the preparedText
  var pattern = "([\\r\\n]+\\s*PreparedStatement\\s+)(\\w+)(\\s*=\\s*Conn)(\\w+)(\\.prepareStatement\\()([^;]+\\;)";
  var re = new RegExp(pattern,"i");
  if (primary.search(re) != -1)
  {
    primary = primary.replace(re, RegExp.$1 + theName + RegExp.$3 + theName + RegExp.$5 + thePreparedText + ");");
    name = RegExp.$2;

    // update the driver
    pattern = "(<%|[\\r\\n]+\s*)(Driver\\s+Driver)" + name + "(\\s*=\\s*\\(\\s*Driver\\s*\\)Class.forName\\s*\\()([^\\)]+)(\\).newInstance\\(\\s*\\))";
    re = new RegExp(pattern,"i");
    if (primary.search(re) != -1)
    {
      primary = primary.replace(re, RegExp.$1 + RegExp.$2 + theName + RegExp.$3 + theDriverName + RegExp.$5);
    }

    // update the connection, username, and password
    pattern = "([\\r\\n]+\\s*Connection\\s+Conn)" + name + "(\\s*=\\s*DriverManager\\.getConnection\\()([^,]+),([^,]+),([^\\)]+)\\)";
    re = new RegExp(pattern,"i");
    if (primary.search(re) != -1)
    {
      primary = primary.replace(re, RegExp.$1 + theName + RegExp.$2 + theConnectionString + "," + theUserName + "," + thePassword + ")");
    }

    // update the queryTimeout
    pattern = "([\\r\\n]+\\s*)" + name + "(\\.setQueryTimeout\\()([^\\)]+)\\)\\s*;";
    re = new RegExp(pattern,"i");
    if (primary.search(re) != -1)
    {
      if (theQueryTimeout != "")
      {
        primary = primary.replace(re, RegExp.$1 + theName + RegExp.$2 + theQueryTimeout + ");");
      }
      else
      {
        primary = primary.replace(re,"");
      }
    }
    else
    {
      // Search for the executeUpdate call and prepend to it.
      if (theQueryTimeout != "")
      {
        pattern = "([\\r\\n]+\\s*)" + name + "\\.executeUpdate\\(\\)\\s*;";
        re = new RegExp(pattern,"i");
        if (primary.search(re) != -1)
        {
          primary = primary.replace(re, RegExp.$1 + theName + ".setQueryTimeout(" + theQueryTimeout + ");" + RegExp.lastMatch);
        }
      }
    }
/*
    // update the queryTimeout
    pattern = "([\\r\\n]+\\s*)" + name + "(\\.setQueryTimeout\\()([^\\)]+)\\)";
    re = new RegExp(pattern,"i");
    if (primary.search(re) != -1)
    {
      primary = primary.replace(re, RegExp.$1 + theName + RegExp.$2 + theQueryTimeout + ")");
    }
*/
    
    
    if (name != theName)
    {
      re = new RegExp(name + "(\\.)","g");
      if (primary.search(re) != -1)
      {
        primary = primary.replace(re, theName + RegExp.$1);
      }
      re = new RegExp(name + "__","g");
      if (primary.search(re) != -1)
      {
        primary = primary.replace(re, theName + "__");
      }
    }
  }

  return primary;
}


//Passed the function call above, takes prior arguments and reloads the UI.
//Removes any escape characters \

function inspectServerBehavior(ssRec) {


  //PREPARED_TEXT.value     = ssRec.preparedText;
  PREAPRED_NAME_BOX.value   = ssRec.preparedName;

  CONN_LIST.pickValue(ssRec.connectionName);

  var ind = -1

  var insertRE = /^\s*insert/i
  var updateRE = /^\s*update/i
  var deleteRE = /^\s*delete/i

  if (ssRec.preparedText.search(insertRE ) > -1)
  {
    TYPE_LIST.pickValue(3);
    ind = 3
    parseInsertSQL(ssRec.preparedText);
  }
  else if (ssRec.preparedText.search(updateRE ) > -1)
  {
    TYPE_LIST.pickValue(2);
    ind = 2
    parseUpdateSQL(ssRec.preparedText);
  }
  else if (ssRec.preparedText.search(deleteRE ) > -1)
  {
    TYPE_LIST.pickValue(1);
    ind = 1
    parseDeleteSQL(ssRec.preparedText);
  }
  else
  {
    TYPE_LIST.pickValue(0);
  }

  TypeChanged(ssRec.preparedtype);

  //TREE.connection = ssRec.connectionName;
  TREE.setConnection(ssRec.connectionName)


  var list = PARAM_LIST;
  if (ssRec.ParamArray)
  {
    var gridArray = new Array()
    for (i = 0;i < ssRec.ParamArray.length; i++)
    {
      var thisRow = new Array()
      thisParam = ssRec.ParamArray[i];
      thisRow[0] = thisParam.name;
      thisRow[1] = thisParam.runTime;
      gridArray.push(thisRow);
    }
    PARAM_LIST.setContents(gridArray)
  }

  PARAM_LIST.setIndex(0);
  
  if (ssRec.outOfDate) {
    alert(MM.MSG_SBOutOfDate);
  }
  if (ssRec && ssRec.errorMsg) {
    alert(ssRec.errorMsg);
  }

}


function deleteServerBehavior(ssRec) 
{
  ssRec.del();

  return true;
}



function CheckData(reason,priorRec)
{
  /*
  This function checks all of the input variables to see
  if the user has filled out everything okay...if not
  return an error string.  If so, return empty string
  */

  var strOut = ""

  if (reason == FINAL)
  {
    // we don't get here if we are just testing the statement
    var theName = Trim(PREAPRED_NAME_BOX.value)
    if (theName == "")
    {
      strOut += MM.MSG_NoPreparedName;
      return strOut
    }

    if (!IsValidVarName(theName))
    {
      strOut = MM.MSG_InvalidPreparedName
      return strOut
    }

    var priorName = null
    if(priorRec)
    {
      priorName = priorRec.preparedName;
    }

    if (IsDupeObjectName(theName, priorName))
    {
      return MM.MSG_DuplicatePreparedName;
    }

  }

  if (CONN_LIST.getIndex() == 0)
  {
    strOut += MM.MSG_NoConnection;
    return strOut
  }
  
  if (TYPE_LIST.getIndex() == 0)
  {
    strOut += MM.MSG_MissingPreparedType;
    return strOut
  }


  var theSQL =  PREPARED_TEXT.value
  if (StripChars(" \r\n\t", theSQL) == "")
  {
    strOut += MM.MSG_NoSQLStatement;
    return strOut
  }

  var theType = TYPE_LIST.getValue()
  if (theType == 3 /*insert*/)
  {
    if (theSQL.search(/^\s*insert\b/i) == -1)
    {
      return MM.MSG_NotValidPreparedTextForInsert
    }
  }
  else if (theType == 2 /*update*/)
  {
    if (theSQL.search(/^\s*update\b/i) == -1)
    {
      return MM.MSG_NotValidPreparedTextForUpdate
    }
  }
  else if (theType == 1 /*delete*/)
  {
    if (theSQL.search(/^\s*delete\b/i) == -1)
    {
      return MM.MSG_NotValidPreparedTextForDelete
    }
  }
  else if (theType != 0)
  {
    return "Whoops...this shouldn't appear. They selected a type that wasn't 1 thru 4?"
  }

  var pa = PARAM_LIST.getContents()
  if (pa.length > 0)
  {   
    strOut = CheckSQLParams(pa, reason)
  }

  return strOut
}



function CheckSQLParams(pa, reason)
{
  var strOut = ""

  for (var i = 0; i < pa.length; i++)
  {
    var anOption = pa[i]

    var theName = Trim(anOption[0])
    if (theName == "")
    {
      strOut =  strOut = MM.LABEL_ParamRow + (i + 1) + "\n\n" + MM.MSG_MissingParamName
      return strOut
    }
    if (!IsValidVarName(theName))
    {
      strOut = MM.LABEL_ParamRow + (i + 1) + "\n\n" + theName + "\n\n" + MM.MSG_InvalidParamName
      return strOut
    }

    if (reason == FINAL)
    {
      var theRunTimeVal = Trim(anOption[1])
      if (theRunTimeVal == "")
      {
        strOut = MM.LABEL_ParamRow + (i + 1) + "\n\n" + MM.MSG_RunTimeValMissing + theName
        return strOut
      }
    } 
  }

  return ""
}

function GetName()
{
  /*
  Returns the name the user entered in the form
  */
  return Trim(PREAPRED_NAME_BOX.value)
}



function GetPreparedText(preparedName,ParamArray)
{
  /*
  This function looks at the list of params and
  creates a SQL string that has variables in it.
  For example: If there is a parameter called
  "@Name" and a SQL statement that looks like
  "Select * from table where name = 'Name'",
  this function will output
  "Select * from table where name = '" + Prepared1_Name + "'"
  (Note: the double quotes at the ends of the string are not 
  included in the output)
  */
 
  var theSQL = PREPARED_TEXT.value
  theSQL = theSQL.replace(/\n/g,"");
  theSQL = theSQL.replace(/\r/g," ")

  /*theSQL = theSQL.replace(/\n/g,"\\n");
  theSQL = theSQL.replace(/\r/g,"\\r");*/

  if (ParamArray.length == 0)
  {
    return "\"" + theSQL + "\"";
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


  return "\"" + theSQL + "\"";
}


function GetQueryTimeOut()
{
  return 0;
}

function GetParamArray()
{
  var ParamArray = PARAM_LIST.getContents();
  return ParamArray;
}


function PopulateConnectionList()
{
  var oldConn = CONN_LIST.getValue()

  var connList = MMDB.getConnectionList()

  var wholeList = new Array()

  wholeList.push(MM.LABEL_None)
  for (var i = 0; i < connList.length; i++)
  {
    wholeList.push(connList[i])
  }

  CONN_LIST.setAll(wholeList, wholeList)
  CONN_LIST.setValue(MM.LABEL_None, 0)

  var index = CONN_LIST.getIndex(oldConn)

  if (!CONN_LIST.pickValue(oldConn)) 
  {
    if (CONN_LIST.getLen() == 2) 
    { 
      CONN_LIST.setIndex(1)
      ConnectionChanged()
    }
    else
    {
      CONN_LIST.setIndex(0)
    }
  }
  else
  {
    //the database tree ctrl could be populated
    //already... so, it needs to be refreshed. The tree control will not 
    //refresh itself if the connection passed in is the same, so set it 
    //to a dummy value and then re-set the original connection. This will
    //force it to update the meta-data.
    TREE.setConnection("");
    TREE.setConnection(oldConn);
  }
}

function PopulateTypeList()
{
  TYPE_LIST.add(MM.LABEL_None,0);
  TYPE_LIST.add(MM.LABEL_CTInsert,3);
  TYPE_LIST.add(MM.LABEL_CTUpdate,2);
  TYPE_LIST.add(MM.LABEL_CTDelete,1);
  TYPE_LIST.setIndex(0)
}

function TypeChanged(preparedType)
{
  var ind = Number(preparedType)
  
  //save off the param grid

  curPreparedType = ind;
  
  if (curPreparedType != -1)
  {
    contentsArray[curPreparedType] = PARAM_LIST.getContents()
    ParseCurrentData(curPreparedType)
  }

  switch(curPreparedType)
    {
    case 1: DisplayDeleteStatement()
        break
    case 2: DisplayUpdateStatement()
        break
    case 3: DisplayInsertStatement()
        break
    case 0: NoStatement()
        DisableAllButtons()
        break
    default: break
    }

  PARAM_LIST.delAll();

  //populate from the saved array
  if ( contentsArray[ind].length > 0 )
  {
    var contents = contentsArray[ind]
  
    /*for (var i = 0; i < contents.length; i++)
    {
      var paramRow = contents[i]
      var strRow = ""
      for (var j = 0; j < paramRow.length; j++)
      {
        if (j > 0)
          strRow += ","
        
        strRow += paramRow[j]
      }
      PARAM_LIST.append(strRow)
    }*/
    //populate from the saved array
    if ( contentsArray[ind].length > 0 )
    {
      PARAM_LIST.setContents(contentsArray[ind])
    }
  }
}

function OnTypeChanged()
{
  TypeChanged(TYPE_LIST.getValue());
}

function initializeUI()
{
  /*
  This function is called in the onLoad event.  It is responsible
  for initializing the UI.  If we are inserting a recordset, this
  is a matter of populating the connection drop down.

  If we are modifying a recordset, this is a matter of inspecting
  the recordset tag and setting all the form elements.
  */

  //Create global vars for all controls
  CONN_LIST   = new ListControl("ConnectionList")
  PARAM_LIST    = new GridControl("ParamList")
  PREPARED_TEXT = findObject("thePreparedText")
  //TREE_SEL_BOX  = findObject("TreeSelection")
  PREAPRED_NAME_BOX = findObject("preparedName")
  MINUS_BUTTON  = findObject("minusButton")
  PLUS_BUTTON     = findObject("plusButton")
  //TREE      = findObject("DBTree")
  TREE      = new DBTreeControl("DBTree");
  TYPE_LIST   = new ListControl("TypeList")

  ButtonArray.push("ColumnButton1")
  ButtonArray.push("ColumnButton2")
  //ButtonArray.push("ParamButton1")
  //ButtonArray.push("ParamButton2")

  InsertLabelArray = new Array(MM.LABEL_AddToColumn, ""/*, MM.LABEL_AddToValue, ""*/)
  UpdateLabelArray = new Array(MM.LABEL_AddToSet, MM.LABEL_AddToWhere/*, MM.LABEL_AddToSet, MM.LABEL_AddToWhere */)
  DeleteLabelArray = new Array(MM.LABEL_AddToDelete, MM.LABEL_AddToWhere/*, MM.LABEL_AddToWhere, ""*/)

  PopulateConnectionList();
  PopulateTypeList();
  PREAPRED_NAME_BOX.value = CreateNewName()
}


function CreateNewName()
{
  var num = 0
  var dom = dw.getDocumentDOM();
  var nodes = dom.getElementsByTagName("MM_PREPARED");
  var newNameFound = false

  while (!newNameFound)
  {
    num++
    var comName = "Prepared" + num
    for (var i = 0; i < nodes.length; i++)
    {
      var theName = (nodes[i].getAttribute("NAME")? nodes[i].getAttribute("NAME") : "")
      if (theName.toLowerCase() == comName.toLowerCase())
      {
        break
      }
    }

    if (i == nodes.length)
    {
      newNameFound = true
    }
    }

  return comName
}


function DeleteParam()
{
  /*
  This function is called when the user
  clicks on the minus button above the params list box.
  If there is not a selected index in the list, we do
  nothing. 
  */

  PARAM_LIST.del()
  //UpdateMinusButton()
}

function AddParam()
{
  //PARAM_LIST.append()
  //UpdateMinusButton()
  if (dw.isOSX())
  {
    // work around a problem in OSX where the first editable
    // region does not get focus.  Add a defaut name
    // so the user can see that something happened
    PARAM_LIST.object.options.push(new Option(MM.LABEL_Unnamed))
  }
  else
  {
    PARAM_LIST.object.options.push(new Option(""))
  }
}


function UpdateMinusButton()
{
  if (PARAM_LIST.getIndex() >= 0)
  {
    MINUS_BUTTON.src = "../../Shared/UltraDev/Images/MinusButtonEnabled.gif"
  }
  else
  {
    MINUS_BUTTON.src = "../../Shared/UltraDev/Images/MinusButtonDisabled.gif"
  }
}

function ReplaceParamsWithVals(st, pa, valCol)
{
  var statement = st
  for (var i = 0; i < pa.length; i++)
  {
    var myRe = new RegExp("\\b" + pa[i][0] + "\\b","g");
    statement = statement.replace(myRe, pa[i][valCol])
  }
  return statement
}


function ConnectionChanged()
{
  //TREE.connection = CONN_LIST.getValue();
  TREE.setConnection(CONN_LIST.getValue());
}

function GetParamAttr(attr, paramDef)
{
  var index = paramDef.indexOf(attr + ":")
  var theEnd = paramDef.indexOf(";", index)
  return paramDef.substring(index + attr.length + 1, theEnd)
}

function AppendToSQL()
{
  //var treeVal = TREE_SEL_BOX.value
  var treeData = TREE.getData();
  var curText = PREPARED_TEXT.value
  var treeVal = treeData.origStr
  var index = treeVal.indexOf(":MM_SP_PARAMS:")

  if (index == -1)
  {
    if(treeData.IsColumn)
    {
      //PREPARED_TEXT.value = curText + " " + treeVal
      PREPARED_TEXT.value = curText + treeData.column;
    } else {
      if(tree.IsTable)  
      {
        PREPARED_TEXT.value = curText + treeData.table;
      }
    }
  }
}

function UpdateTreeSelection()
{
  //TREE_SEL_BOX.value = TREE.selectedItem
  //TREE_SEL_BOX.value = TREE.selectedItem;
  var treeData = TREE.getData();
  /*if(treeData.IsProcedure())
  {
    if(TYPE_LIST.getValue() != 4)
    {
      TYPE_LIST.pickValue(4);
      TypeChanged(4);
    }
  }*/
}



function LaunchConnectionManager()
{
  var oldList = String(CONN_LIST.valueList).split(",")
  MMDB.showConnectionMgrDialog()
  PopulateConnectionList()
  var newConnectionIndex = getNewConnection(oldList, CONN_LIST.valueList)
  if (newConnectionIndex != -1)
  {
    CONN_LIST.setIndex(newConnectionIndex)
    ConnectionChanged()
  }
}

function parseUpdateSQL(SQLString)
{
  var regularParse = true
  var bReturn = true

  SQLString = StripChars("\t", SQLString)

  SQLString = SQLString.replace(/\n/g,"");
  SQLString = SQLString.replace(/\r/g," "); 

  if (SQLString == "")
  {
    DisplayUpdateStatement()
    return bReturn
  }
  
  //Remove any carriage returns and line feeds that may be embedded.

  var re1 = /(update)(\s*|.*)(set)(\s*|.*)(where)(\s*|.*)$/i;
  var re2 = /(update)(\s*|.*)(set)(\s*|.*)(where)$/i;
  var re3 = /(update)(\s*|.*)(set)(\s*|.*)$/i;
  var re4 = /(update)(\s*|.*)(set)$/i;
  var re5 = /(update)(\s*|.*)(where)(\s*|.*)$/i;
  var re6 = /(update)(\s*|.*)(where)$/i;
  var re7 = /(update)(\s*|.*)$/i;
  var re8 = /(update)$/i;

  if(SQLString.search(re1) == -1)
  {
    if(SQLString.search(re2) == -1)
    {
        if(SQLString.search(re3) == -1)
    {
      if(SQLString.search(re4) == -1)
      {
      if(SQLString.search(re5) == -1)
      {
        if(SQLString.search(re6) == -1)
        {
          if(SQLString.search(re7) == -1)
          {
            if(SQLString.search(re8) == -1)
            {
              bReturn = false
            }
          }
        } else {
          regularParse = false
        }
      } else {
        regularParse = false
      }
      }
    }
    }
  }

  if (!bReturn)
    return bReturn;

  if (regularParse)
  { 
    VAR_UPD_UPDATE = Trim(RegExp.$2)
    VAR_UPD_SET = Trim(RegExp.$4)
    VAR_UPD_WHERE = Trim(RegExp.$6)
  } else {
    VAR_UPD_TABLENAME = Trim(RegExp.$2)
    VAR_UPD_SET = ""
    VAR_UPD_WHERE = Trim(RegExp.$4)
  }


  return bReturn;
  
}

function parseDeleteSQL(SQLString)
{
  var bReturn = true
  
  SQLString = StripChars("\t", SQLString)

  //Remove any carriage returns and line feeds that may be embedded.
  SQLString = SQLString.replace(/\n/g,"");
  SQLString = SQLString.replace(/\r/g," "); 


  if (SQLString == "")
  {
    DisplayDeleteStatement()
    return bReturn
  }

  var re1 = /(delete\sfrom)(\s*|.*)(where)(\s*|.*)$/i;
  var re2 = /(delete\sfrom)(\s*|.*)(where)\s*$/i;
  var re3 = /(delete\sfrom)(\s*|.*)$/i;
  var re4 = /(delete\sfrom)\s*$/i;

  if(SQLString.search(re1) == -1)
  {
    if(SQLString.search(re2) == -1)
    {
        if(SQLString.search(re3) == -1)
    {
      if(SQLString.search(re4) == -1)
      {
      bReturn = false
      }
    }
    }
  }

  if (!bReturn)
    return bReturn;

  
  VAR_DEL_DELETE = Trim(RegExp.$2)
  VAR_DEL_WHERE = Trim(RegExp.$4)

  return bReturn;
}

function parseInsertSQL(SQLString)
{
  var parseType = 0
  var bReturn = true
  
  SQLString = StripChars("\t", SQLString)

  SQLString = SQLString.replace(/\n/g,"");

  SQLString = SQLString.replace(/\r/g," ");
  
  if (SQLString == "")
  {
    DisplayInsertStatement()
    return bReturn
  }
  //Remove any carriage returns and line feeds that may be embedded.

  var re1 = /(insert\sinto)(\s*|.*)(\()(\s*|.*)(\))\s*(values)\s*(\()(\s*|.*)(\))\s*$/i;
  var re2 = /(insert\sinto)(\s*|.*)(\()(\s*|.*)(\))\s+(values)(\s*|.*)$/i;
  var re3 = /(insert\sinto)(\s*|.*)(\()(\s*|.*)(\))\s+(values)\s*$/i;
  var re4 = /(insert\sinto)(\s*|.*)(\()(\s*|.*)(\))\s*$/i;
  var re5 = /(insert\sinto)(\s*|.*)(values)\s*$/i;

  if(SQLString.search(re1) == -1)
  {
    if(SQLString.search(re2) == -1)
    {
        if(SQLString.search(re3) == -1)
    {
      if(SQLString.search(re4) == -1)
      {
      if(SQLString.search(re5) == -1)
      {
        bReturn = false
      } else {
        parseType = 4
      }
      } else {
        parseType = 3
      }
    } else {
      parseType = 2
    }
    } else {
    parseType = 2
    }
  } else 
  {
    parseType = 1
  }

  if (!bReturn)
    return bReturn;
  
  switch(parseType)
  {
  case 1: VAR_INS_INSERT = Trim(RegExp.$2)
      VAR_INS_COLS = Trim(RegExp.$4)
      VAR_INS_VALUES = Trim(RegExp.$8)
      break
  case 2: VAR_INS_INSERT = Trim(RegExp.$2)
      VAR_INS_COLS = Trim(RegExp.$4)
      VAR_INS_VALUES = Trim(RegExp.$7)
      break
  case 3: VAR_INS_INSERT = Trim(RegExp.$2)
      VAR_INS_COLS = Trim(RegExp.$4)
      VAR_INS_VALUES = ""
      break
  /*case 4: VAR_INS_INSERT = Trim(RegExp.$2)
      VAR_INS_COLS = ""
      VAR_INS_VALUES = ""
      break*/
  default: break
  }

  return bReturn;

}


function DisplayDeleteStatement()
{
  var outStr = ""
  
  outStr += CONST_DELETE + " " 
  if(Trim(VAR_DEL_DELETE) != "")
  {
    outStr += VAR_DEL_DELETE + " "
  }
  outStr += "\r" + CONST_WHERE + " " 
  if(Trim(VAR_DEL_WHERE) != "")
  {
    outStr += VAR_DEL_WHERE + " "
  }

  PREPARED_TEXT.value = outStr
  UpdateButtons(DeleteLabelArray)
}

function DisplayUpdateStatement()
{
  var outStr = ""
  
  outStr += CONST_UPDATE + " " 
  if(Trim(VAR_UPD_UPDATE) != "")
  {
    outStr += VAR_UPD_UPDATE + " "
  }
  outStr += "\r" + CONST_SET + " " 
  if(Trim(VAR_UPD_SET) != "")
  {
    outStr += VAR_UPD_SET + " "
  }
  outStr += "\r" + CONST_WHERE + " " 
  if(Trim(VAR_UPD_WHERE) != "")
  {
    outStr += VAR_UPD_WHERE + " "
  }

  PREPARED_TEXT.value = outStr
  UpdateButtons(UpdateLabelArray)
}

function DisplayInsertStatement()
{
  
  var outStr = ""
  
  outStr += CONST_INSERT + " " 

  if(Trim(VAR_INS_INSERT) != "")
  {
    outStr += VAR_INS_INSERT
  }
  
  outStr += " ("

  if(Trim(VAR_INS_COLS) != "")
  {
    outStr += VAR_INS_COLS
  } else {
    outStr += " "
  }

  outStr += ") "

  outStr += "\r" + CONST_VALUES + " (" 

  if(Trim(VAR_INS_VALUES) != "")
  {
    outStr += VAR_INS_VALUES
  } else {
    outStr += " "
  }

  outStr += ") "

  PREPARED_TEXT.value = outStr

  UpdateButtons(InsertLabelArray)
}


function NoStatement()
{
  PREPARED_TEXT.value = "";
}


function UpdateButtons(labelButtonArray)
{ 
  var i
  var obj

  for (i = 0; i < labelButtonArray.length; i++)
  {
    obj = findObject(ButtonArray[i])
    if (labelButtonArray[i] != "" && obj)
    {
      obj.value = labelButtonArray[i];
      enableTheButton(obj)
    } else {
      disableTheButton(obj)
    }
  }
}

function DisableAllButtons()
{
  var i
  //We know that there are only four buttons...
  for (i = 0; i < 4; i++)
  {
    obj = findObject(ButtonArray[i])
    if (obj)
    {
      disableTheButton(obj)
    }
  }
  
}

function enableTheButton(obj)
{
  var re1 = /(\s*|.*)(DISABLED )(\s|.*)/
  var source = obj.outerHTML;

  if(source.search(re1) != -1)
  {
    source = RegExp.$1 + RegExp.$3
  }

  obj.outerHTML = source;
}

function disableTheButton(obj)
{
  var str = "DISABLED "
  var re1 = /(\s*|.*)(DISABLED )(\s|.*)/i
  var re2 = /(\s*|.*)(NAME)(\s|.*)/i
  var source = obj.outerHTML;

  if(source.search(re1) == -1)
  {
    if(source.search(re2) != -1)
    {
      source = RegExp.$1 + str + RegExp.$2 + RegExp.$3
    }
  }

  obj.outerHTML = source;
}

function toggleEnablement(obj)
{
  var str = "DISABLED "
  var re1 = /(\s*|.*)(DISABLED )(\s|.*)/i
  var re2 = /(\s*|.*)(NAME)(\s|.*)/i
  var source = obj.outerHTML;

  if(source.search(re1) == -1)
  {
    if(source.search(re2) != -1)
    {
      source = RegExp.$1 + str + RegExp.$2 + RegExp.$3
    }
  } else {
    source = RegExp.$1 + RegExp.$3
  }

  obj.outerHTML = source;
}

function Button1Clicked()
{
  if(!IsConnectionSelected())
  {
   return;
  }
  
  if (ParseCurrentData())
  {
    switch(TYPE_LIST.getValue())
    {
    case 1: Button1DeleteSelected()
        break
    case 2: Button1UpdateSelected()
        break
    case 3: Button1InsertSelected()
        break
    /*case 4: Button1ProcSelected()
        break*/
    default: break
    }
  } else {
    alert(MM.MSG_InvalidSQL)
  }
}

function Button2Clicked()
{
  if(!IsConnectionSelected())
  {
   return;
  }

  if( ParseCurrentData() )
  {
    switch(TYPE_LIST.getValue())
    {
    case 1: Button2DeleteSelected()
        break
    case 2: Button2UpdateSelected()
        break
    default: break
    }
  } else {
    alert(MM.MSG_InvalidSQL)
  }
}

function ParamButton1Clicked()
{
  if(!IsConnectionSelected())
  {
   return;
  }

  if( ParseCurrentData())
  {
    switch(TYPE_LIST.getValue())
    {
    case 1: ParamButton1DeleteSelected()
        break
    case 2: ParamButton1UpdateSelected()
        break
    case 3: ParamButton1InsertSelected()
        break
    default: break
    }
  } else {
    alert(MM.MSG_InvalidSQL)
  }
}

function ParamButton2Clicked()
{
  if(!IsConnectionSelected())
  {
   return;
  }

  if(ParseCurrentData())
  {
    switch(TYPE_LIST.getValue())
    {
    case 2: ParamButton2UpdateSelected()
        break
    default: break
    }

  } else {
    alert(MM.MSG_InvalidSQL)
  }
}

function ParseCurrentData(currentType)
{ var bRet = false;
  var type
  if(!currentType)
  {
    type = TYPE_LIST.getValue()
  } else {
    type = currentType
  }

  switch (type)
  {
    case 1: bRet = parseDeleteSQL(PREPARED_TEXT.value)
        break
    case 2: bRet = parseUpdateSQL(PREPARED_TEXT.value)
        break
    case 3: bRet = parseInsertSQL(PREPARED_TEXT.value)
        break
    /*case 4: bRet = parseProcedureSQL(PREPARED_TEXT.value)
        break*/
    case 0: DisableAllButtons()
        bRet = true;
        break;
    default: break
  }
  return bRet
}


function Button1DeleteSelected()
{
  var treeData = TREE.getData()
  if(!treeData.IsProcedure())
  {
    if( (treeData.IsTable())  && (treeData.table != "undefined"))
    {
      VAR_DEL_DELETE = treeData.table;
      DisplayDeleteStatement()
    } else {
      alert (MM.MSG_SelectTable)
    }
  } else {
    alert(MM.MSG_SelectTable)
  }
}


function Button1UpdateSelected()
{
  var treeData = TREE.getData()
  if(!treeData.IsProcedure())
  {
    if( (treeData.IsTable())  && (treeData.table != "undefined") )
    {
      VAR_UPD_UPDATE = treeData.table;
      DisplayUpdateStatement()
    } else {
      if(treeData.IsColumn())
      {
        VAR_UPD_UPDATE = treeData.table;
        VAR_UPD_SET = ParamStringConcat(VAR_UPD_SET, ", ", treeData.column)
        DisplayUpdateStatement();
      } else {
        alert(MM.MSG_SelectTableOrColumn)
      }
    }
  } else {
    alert(MM.MSG_SelectTableOrColumn)
  }
}

function Button1InsertSelected()
{
  var treeData = TREE.getData()
  if(!treeData.IsProcedure())
  {
    if(treeData.IsColumn())
    {
      VAR_INS_INSERT = treeData.table;
      VAR_INS_COLS = ParamStringConcat(VAR_INS_COLS, ", ", treeData.column)

      DisplayInsertStatement()
    } else {
      alert (MM.MSG_SelectColumn)
    }
  } else {
    alert(MM.MSG_SelectColumn)
  }
}


function Button2DeleteSelected()
{
  var treeData = TREE.getData()
  if(!treeData.IsProcedure())
  {
    if(treeData.IsColumn())
    {
      VAR_DEL_WHERE = ParamStringConcat(VAR_DEL_WHERE, " and ", treeData.column)
      DisplayDeleteStatement()
    } else {
      alert (MM.MSG_SelectColumn)
    }
  } else {
    alert(MM.MSG_SelectColumn)
  }
}

function Button2UpdateSelected()
{
  var treeData = TREE.getData()
  if(!treeData.IsProcedure())
  {
    if(treeData.IsColumn())
    {
      VAR_UPD_WHERE = ParamStringConcat(VAR_UPD_WHERE, " and ", treeData.column)

      DisplayUpdateStatement()
    } else {
      alert (MM.MSG_SelectColumn)
    }
  } else {
    alert(MM.MSG_SelectColumn)
  }
}

function ParamButton1DeleteSelected()
{
  var i = PARAM_LIST.getIndex()

  var paramlist = PARAM_LIST.getContents();
  if(paramlist.length == 0)
  {
    alert(MM.MSG_EmptyParamList);
    return;
  }

  if(i > -1)
  {
    var list = PARAM_LIST.getContents()
    VAR_DEL_WHERE = ParamStringConcat(VAR_DEL_WHERE, " = ", list[i][0])
    DisplayDeleteStatement()
  }
}

function ParamButton1UpdateSelected()
{
  var i = PARAM_LIST.getIndex()

    var paramlist = PARAM_LIST.getContents();
    if(paramlist.length == 0)
    {
    alert(MM.MSG_EmptyParamList);
    return;
    }


  if(i > -1)
  {
    var list = PARAM_LIST.getContents()
    VAR_UPD_SET = ParamStringConcat(VAR_UPD_SET, " = ", list[i][0])
    DisplayUpdateStatement()
  }
}


function ParamButton1InsertSelected()
{
  var i = PARAM_LIST.getIndex()

  var paramlist = PARAM_LIST.getContents();
  if(paramlist.length == 0)
  {
    alert(MM.MSG_EmptyParamList);
    return;
  }

  if(i > -1)
  {
    var list = PARAM_LIST.getContents()
    VAR_INS_VALUES = ParamStringConcat(VAR_INS_VALUES, ", ", list[i][0]);   
    DisplayInsertStatement()
  }
}


function ParamButton2UpdateSelected()
{
  var i = PARAM_LIST.getIndex()

  var paramlist = PARAM_LIST.getContents();
  if(paramlist.length == 0)
  {
    alert(MM.MSG_EmptyParamList);
    return;
  }


  if(i > -1)
  {
    var list = PARAM_LIST.getContents()
    var str = list[i][0]
    VAR_UPD_WHERE = ParamStringConcat(VAR_UPD_WHERE, " = ", str)
    DisplayUpdateStatement()
  }
}


function ParamStringConcat(origVal, concat, newVal)
{
  var str = Trim(origVal)
  var retstr

  if (str == "")
  {
    retstr = newVal
  } else {

    if (str.lastIndexOf(Trim(concat)) == (str.length - Trim(concat).length ))
    {
      retstr = origVal + " " + newVal;
    } else {
      retstr = origVal + concat + newVal ;
    }
  }
  return retstr;
}


function IsConnectionSelected()
{
  
  var conn = CONN_LIST.getValue();
  if((conn == MM.LABEL_None) || (Trim(conn) == "") || (conn == MM.LABEL_EmptyOption))
  {
    alert(MM.MSG_MissingConnection);
    return false;
  }
  return true;
}


function IsTableOrViewOrColumnSelected()
{
  var treedata = TREE.getData();
  if(!treeData.IsProcedure)
  {
    if ( (treeData.IsTable()) || (treeData.IsColumn()) ) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

function PlusMouseDown()
{
  PlusButtonMouseDown(PLUS_BUTTON);
}

function PlusMouseUp()
{
  PlusButtonMouseUp(PLUS_BUTTON);
  AddParam();
}

function MinusMouseDown()
{
  if(PARAM_LIST.getIndex() >= 0) {
  MinusButtonMouseDown(MINUS_BUTTON)
  }
}

function MinusMouseUp()
{
  if(PARAM_LIST.getIndex() >= 0) {
  MinusButtonMouseUp(MINUS_BUTTON)
    DeleteParam();
  }
}
