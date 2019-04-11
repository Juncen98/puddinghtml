// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************
var helpDoc = MM.HELP_ssCallableJsp;

var CONST_TYPE = "callable";
var NUM_Participants = 2;  //used to check completeness. If a participant
                           //is missing, set the .incomplete property

var WGHT_JspCallableInit = 40;
var WGHT_JspCallable = 50;
var WGHT_JspCallableClose="afterDocument";
var DEBUG = false;
var FOR_TEST = 1
var FINAL = 2

function findServerBehaviors(){

  var i, ssRec, ssRecList = new Array();
  var dom = dw.getDocumentDOM();

  var nodes = dom.getElementsByTagName("MM_CALLABLE");

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
  var callableName = String(node.getAttribute("NAME"))
  if (callableName != "undefined")
  {
    ssRec = new SSRecord();
    ssRec.errorMsg = "";
    ssRec.type  = CONST_TYPE;
    ssRec.title = MM.LABEL_TitleCallable + " (" + callableName + ")";

    ssRec.callableName      = callableName;
    //ssRec.callableName      = callableName;
    ssRec.activeconnection    = unescapequote(node.getAttribute("CONNECTIONNAME"));
    ssRec.driver        = unescapequote(node.getAttribute("DRIVER"));
    ssRec.callableText      = unescapequote(node.getAttribute("STATEMENT"));
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

    ssRec.participants.push(node);
    ssRec.weights.push(WGHT_JspCallable);
    ssRec.types.push("callable_main");
    ssRec.selectedNode = node;

      var dom = dw.getDocumentDOM();
    var nodes = dom.getElementsByTagName("MM_CALLABLECLOSE");
        for (i=0; i<nodes.length; i++) {
      var name = nodes[i].getAttribute("NAME");
      if (name.indexOf(ssRec.callableName) > -1)
      {
        ssRec.participants.push(nodes[i]);
        ssRec.weights.push(WGHT_JspCallableClose);
        ssRec.types.push("callable_close");
      }
    }   

    var found = (ssRec.callableText.search(/\s*call\s*([^\s\(\)\}]*)\s*/i) > -1)
    if (found)
    {
      var proc  =  RegExp.$1

      var CachedParamList = getCachedSchemaKeyInfo(ssRec.callableName);

      if (CachedParamList && CachedParamList.length)
      {
        paramList = CachedParamList;
      }
      else
      {
        paramList = MMDB.getSPParamsAsString(ssRec.connectionName,proc);
      }


      if (!ssRec.ParamArray)
        ssRec.ParamArray = new Array();

      var paramArray = GridControlCSVToArray(paramList)
      var gridArray = new Array()
      for (var i = 0; i < paramArray.length; i++)
      {
        var Param   = new Object();
        Param.name = GetParamAttr("name", paramArray[i]);
        Param.type = GetParamAttr("type", paramArray[i]);
        if (Param.type == "int")
        {
          Param.type = "3"
        }

        if (Param.type && (Param.type != "undefined"))
        {
          if ((Param.type == "REF CURSOR") || (Param.type == "REFCURSOR"))
          {
            Param.direction = 2;
          }
          else
          {
            Param.direction = Number(GetParamAttr("direction", paramArray[i]));
          }
          Param.value = ""
          Param.runTime = ""
          ssRec.ParamArray[ssRec.ParamArray.length]=Param;
        }
      }
    }


    for (k = 0;k < node.childNodes.length; k++)
    {
      thisChild = node.childNodes[k];
      if(thisChild.tagName == "MM_CALLRESSET")
      {
        ssRec.recordset = thisChild.getAttribute("NAME");
      }
      else if(thisChild.tagName == "MM_PARAMETERS")
      {
         dom = dw.getDocumentDOM();
         var parameterValueNode=null;
         nameValueNodes = dom.getElementsByTagName("MM_VARIABLES");
         for (j=0; j<nameValueNodes.length; j++) { //with each MM_VARIABLES node
          nameValueNode = nameValueNodes[j];
          if (nameValueNode && nameValueNode.getAttribute("NAME") == ssRec.callableName)
          {
            parameterValueNode=nameValueNode;
            ssRec.participants.push(parameterValueNode);
            ssRec.weights.push(WGHT_JspCallableInit);
            ssRec.types.push("callable_param");
          }
         }

        var paramchilds = thisChild.childNodes;
        for (i = 0;i < paramchilds.length; i++)
        {
          thisParam = paramchilds[i];
          name = Trim(thisParam.VALUE);
          if (parameterValueNode)
          {
            for (j =0; j < parameterValueNode.childNodes.length;j++)
            {
               ValueNode = parameterValueNode.childNodes[j];
               pname = Trim(ValueNode.getAttribute("NAME"));
               if (name == pname)
               {
                pIndex    = thisParam.INDEX;
                value = unescapequote(ValueNode.getAttribute("VALUE"));
                value = GetValueFromEncoding(value);
                if ((ssRec.ParamArray.length) && (pIndex-1 <= ssRec.ParamArray.length))
                {
                  ssRec.ParamArray[pIndex-1].value = value;
                }
                runTime = unescapequote(ValueNode.getAttribute("RUNTIME"));
                if ((ssRec.ParamArray.length) && (pIndex-1 <= ssRec.ParamArray.length))
                {
                  ssRec.ParamArray[pIndex-1].runTime = runTime;
                }
               }
            }
          }
        }
      }
    }

    ssRec.incomplete = (ssRec.participants.length < NUM_Participants);

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
          var dom = dw.getDocumentDOM();
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
  var errMsg = CheckData(FINAL,priorRec) 

  if (errMsg == "")
  {
    var theName     = GetName();
    var theDSN      = CONN_LIST.getValue();
    var theParamArray = GetParamArray();
    var theCallableText = GetCallableText(theName,theParamArray);
    var theResultset  = RR_CHECKBOX.checked;
    var theConnectionString = getJDBCConnectionString(theDSN);
    var theDriverName   = getDriverName(theDSN);
    var theUserName     = getUserName(theDSN);
    var thePassword     = getPassword(theDSN);
    var theResultsetName  = null;
    if (theResultset)
    {
      theResultsetName = RR_NAME.value;
    }
    if (priorRec)
    {
      var theQueryTimeout = priorRec.querytimeOut;
    }
    else
    {
      var theQueryTimeout = GetQueryTimeOut();
    }
    var editList = buildSSEdits(priorRec, theName, theDSN, theConnectionString, theDriverName, theUserName, thePassword, theCallableText, theQueryTimeout, theResultsetName, theParamArray,false);
    editList.insert(true);

     //refresh the cache for callable.
     MMDB.refreshCache(true);
  }

  return errMsg;
}

function getJDBCConnectionString(name)
{
  //return "\"" + MMDB.getDeployConnectionString(name) + "\"";
  return "MM_" + name + "_STRING";
}

function getDriverName(name)
{
  //return "\"" +MMDB.getDriverName(name) + "\"";
  return "MM_" + name + "_DRIVER";
}

function getUserName(name)
{
  //return "\"" + MMDB.getUserName(name) + "\"";
  return "MM_" + name + "_USERNAME";
}

function getPassword(name)
{
  //return "\"" + MMDB.getPassword(name) + "\"";
  return "MM_" + name + "_PASSWORD";
}


function checkBoxClicked()
{
  if (RR_CHECKBOX.checked)
  {
    SetEnabled(TEST_BUTTON, true)
  }
  else
  {
    SetEnabled(TEST_BUTTON, false)  
  }
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


function buildSSEdits(priorRec, theName, theDSN, theConnectionString, theDriverName, theUserName, thePassword, theCallableText, theQueryTimeout, theResultsetName, theParamArray,bPreserveParam)
{
  editList = new SSEdits();
  
  var priorInitNode = null;
  var priorCloseNode = null;
  var priorPrimaryNode = null;
  if (priorRec) {
    priorPrimaryNode = priorRec.getParticipant("callable_main");
    priorCloseNode = priorRec.getParticipant("callable_close");
    priorInitNode = priorRec.getParticipant("callable_param");
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
      editList.add(newClose, priorCloseNode, WGHT_JspCallableClose);
  }

  if (!bPreserveParam)
  {
    var newInit = getInit(priorInitNode, theName, theParamArray);
    if (priorInitNode || newInit.length)
    {
      editList.add(newInit, priorInitNode, WGHT_JspCallableInit);
    }
  }

  var newPrimary = getPrimary(priorPrimaryNode, theName, theConnectionString, theDriverName, theUserName, thePassword, theCallableText, theQueryTimeout, theResultsetName, theParamArray,bPreserveParam);
  if (priorPrimaryNode || newPrimary.length)
  {
      editList.add(newPrimary, priorPrimaryNode, WGHT_JspCallable);
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
    var close = MASK_CallableClose;
    close = close.replace(/##stname##/g, theName);
  }

  return close;
}

function getInit(node, theName, theParamArray)
{
  var init = "";
  if (theParamArray.length)
  {
    for (var i=0; i < theParamArray.length; i++)
    {
      var paramName     = StripChars("@", theParamArray[i][0])
      var paramDefaultValue = theParamArray[i][3];
      var paramRExpression  = theParamArray[i][4];
      var paramDirection    = theParamArray[i][2];
      if ((paramDirection == 2) || (paramDirection == 4))
      { 
        //ignore the initialization chunk for that parameter
        continue;
      }
      var param = MASK_Param;       
      param = param.replace(/##pname##/g, paramName);
      paramDefaultValue = "\"" + paramDefaultValue.replace(/"/g, "\\\"") + "\""
      param = param.replace(/##pvalue##/g, paramDefaultValue);
      param = param.replace(/##rexpression##/g, paramRExpression);
      param = param.replace(/##stname##/g, theName);
      init += param;
    }
    if (init.length)
    {
      init = "\n<%\n" + init + "\n%>\n";
    }
  }

  return init;
}

function getPrimary(node, theName, theConnectionString, theDriverName, theUserName, thePassword, theCallableText, theQueryTimeout, theResultsetName, theParamArray,bPreserveParam)
{
  if (node)
  {
    var primary = getOrigForLockedNode(node);
    primary = updatePrimary(primary, theName, theConnectionString, theDriverName, theUserName, thePassword, theCallableText, theQueryTimeout, theResultsetName, theParamArray,bPreserveParam);
  }
  else
  {
    var primary = MASK_Callable;
    primary = primary.replace(/##stname##/g, theName);
    primary = primary.replace(/##theConnectionString##/g, theConnectionString);
    primary = primary.replace(/##drivername##/g, theDriverName);
    primary = primary.replace(/##theUserName##/g, theUserName);
    primary = primary.replace(/##theUserPass##/g, thePassword);
    primary = primary.replace(/##theSQL##/g, theCallableText);
    //primary = primary.replace(/##theQueryTimeOut##/g, theQueryTimeout);
    // Stored Procedure case where we use the Create Parameter methods.
      primary += getParameters(theName, theParamArray);
    var exec = MASK_CallableExec;
    exec = exec.replace(/##stname##/g,theName);
    primary += exec;
    var bHasRefCur = false;
    for (var i =0; i < theParamArray.length; i++)
    {
      var paramType     =  theParamArray[i][1]; 
      var origParamName   =  theParamArray[i][0];
      var paramName       =  StripChars("@", origParamName);
      if (theResultsetName)
      {
        if ((paramType == "REF CURSOR")||(paramType == "REFCURSOR"))
        {
          var getRefCurResultset = MASK_RSRefCursorParam;
          getRefCurResultset  =  getRefCurResultset.replace(/##stname##/g, theName);
          getRefCurResultset  =  getRefCurResultset.replace(/##pindex##/g, i+1);
          getRefCurResultset  =  getRefCurResultset.replace(/##pname##/g, theResultsetName);
          primary += getRefCurResultset;
          bHasRefCur = true;
        }
      }
    }

    if (!bHasRefCur)
    {
      if (theResultsetName)
      {
        var getResultset =  MASK_RSCallable;
        getResultset  =  getResultset.replace(/##stname##/g, theName);
        getResultset  =  getResultset.replace(/##rsname##/g, theResultsetName);
        primary += getResultset;
      }
    }
    primary = "\n<%\n" + primary + "\n%>\n";
  }

  return primary;
}

function getParameters(theName, theParamArray)
{
  var parameters = "";
  for (var i =0; i < theParamArray.length; i++)
  {
    var origParamName   =  theParamArray[i][0];
    var paramName       =  StripChars("@", origParamName);
    var paramType     =  theParamArray[i][1]; 
    var paramDirection    =  theParamArray[i][2]; 
      //check for out and ret values;
    if ((paramDirection == 2) || (paramDirection == 4) || (paramDirection == 3))
    {
      if ((paramType == "REF CURSOR")||(paramType == "REFCURSOR"))
      {
        var param = MASK_SQLCallRefCurOutParam;
      }
      else
      {
        var param = MASK_SQLCallOutParam;
      }
    }
    if ((paramDirection == 1) || (paramDirection == 3))
    {
      var param = MASK_SQLCallInParam;
      param = param.replace(/##pname##/g, paramName);
    }
    param = param.replace(/##stname##/g, theName);
    param = param.replace(/##pindex##/g, i+1);
    parameters += param;
  }

  return parameters;
}

function updatePrimary(primary, theName, theConnectionString, theDriverName, theUserName, thePassword, theCallableText, theQueryTimeout, theResultset, theParamArray,bPreserveParam)
{
  var pattern = "([\\r\\n]+\\s*CallableStatement\\s+)(\\w+)(\\s*=\\s*Conn)(\\w+)(\\.prepareCall\\(\\s*)(\"[^\"]+\")\\)";
  var re = new RegExp(pattern,"i");
  if (primary.search(re) != -1)
  {
    primary = primary.replace(re, RegExp.$1 + theName + RegExp.$3 + theName + RegExp.$5 + theCallableText + ")");
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
      // Search for the execute call and prepend to it.
      if (theQueryTimeout != "")
      {
        pattern = "([\\r\\n]+\\s*)" + name + "\\.execute\\(\\)\\s*;";
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

    // update other instances of the name if changed
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
      re = new RegExp(name + "_data","g");
      if (primary.search(re) != -1)
      {
        primary = primary.replace(re, theName + "_data");
      }
    }
    if (theParamArray)
    {
      // regenerate the in and out parameters
      // remove in parameters

    if (!bPreserveParam)
    {
      pattern = "[\\r\\n]+\\s*" + theName + ".setString\\(\\s*([0-9]+)\\s*,\\s*(" + theName + "__\\w+)\\s*\\)" + "\\s*\\;";
      re = new RegExp(pattern, "gi");
      if (primary.search(re) != -1)
      {
      primary = primary.replace(re, "");
      }
      // remove out parameters
      pattern = "[\\r\\n]+\\s*" + theName + ".registerOutParameter\\(\\s*([0-9]+)\\s*,\\s*([^\\)]+)\\)" + "\\s*\\;";
      re = new RegExp(pattern, "gi");
      if (primary.search(re) != -1)
      {
      primary = primary.replace(re, "");
      }
      var newParams = getParameters(theName, theParamArray);
      if (newParams.length)
      {
      // insert after the callableText
      var pattern = "([\\r\\n]+\\s*CallableStatement[^\\r\\n]+)";
      re = new RegExp(pattern, "i");
      primary = primary.replace(re, "$1" + newParams);
      }
    }

      var iRefCurIndex = -1;
      for (var i =0; i < theParamArray.length; i++)
      {
        var paramType     =  theParamArray[i][1]; 
        var origParamName   =  theParamArray[i][0];
        var paramName       =  StripChars("@", origParamName);
        if ((paramType == "REF CURSOR")||(paramType == "REFCURSOR"))
        {
          iRefCurIndex = i+1;
          break;
        }
      }
      
      if (iRefCurIndex != -1)
      {
        pattern2 = "(Resultset\\s+)(\\w+)(\\s*=\\s*\\(resultset\\)\\s*)";
        re = new RegExp(pattern2, "i");
        //To support Oracle Ref Cursors.
        if (primary.search(re) != -1)
        {
          var oldRsName = RegExp.$2;
          if (oldRsName != theResultset)
          {
            if (theResultset && theResultset.length)
            {
              // update name for getresult
              primary = primary.replace(re, RegExp.$1 + theResultset + RegExp.$3);
            
              //update the num rows block.
              pattern = oldRsName + "(_numRows)";
              reNum = new RegExp(pattern, "i");
              if (primary.search(reNum) != -1)
              {
                primary = primary.replace(reNum, theResultset + RegExp.$1);
              }

              pattern = new RegExp(oldRsName + "(\\.)","g");
              if (primary.search(pattern) != -1)
              {
                primary = primary.replace(pattern, theResultset + RegExp.$1);
              }

              pattern = new RegExp(oldRsName + "_","g");
              if (primary.search(pattern) != -1)
              {
                primary = primary.replace(pattern, theResultset + "_");
              }
            }
            else
            {
              // remove resultset
              pattern = "[\\r\\n]+\\s*Resultset\\s+" + oldRsName + "\\s*=\\s*\\(resultset\\)\\s*" + theName + "\\.getobject\\(\\s*\\d\\s*\\)\\s*;\\s*";
              re = new RegExp(pattern, "i");
              if (primary.search(re) != -1)
              {
                primary = primary.replace(re, "");
              }

              // remove the next statement
              pattern = "\\s*boolean\\s+" + oldRsName + "_isEmpty\\s*=\\s*!\\s*" + oldRsName + "\\.next\\s*\\(.+\\n";
              re = new RegExp(pattern, "i");
              if (primary.search(re) != -1)
              {
                primary = primary.replace(re, "");
              }

              // remove the hasData statement
              pattern = "\\s*boolean\\s+" + oldRsName + "_hasData\\s*=\\s*!\\s*" + oldRsName + "_isEmpty\\s*.+\\n";
              re = new RegExp(pattern, "i");
              if (primary.search(re) != -1)
              {
                primary = primary.replace(re, "");
              }

              // remove the data statement
              pattern = "\\s*Object\\s+" + oldRsName + "_data;.+\\n";
              re = new RegExp(pattern, "i");
              if (primary.search(re) != -1)
              {
                primary = primary.replace(re, "");
              }

              //update the num rows block.
              pattern = "\\s*int\\s+" + oldRsName + "_numRows\\s*=\\s*0\\s*;\\s*";
              reNum = new RegExp(pattern, "i");
              if (primary.search(reNum) != -1)
              {
                primary = primary.replace(reNum, "");
              }
            }
          }
        }
        else
        {
          // generate refcuror code;
          if (theResultset && theResultset.length)
          {
            pattern = theName + "(.execute\\s*\\(\\s*\\)\\s*;)";
            re = new RegExp(pattern, "i");
            if (primary.search(re) != -1)
            {
              var r1 = RegExp.$1;
              var getRefCurResultset = MASK_RSRefCursorParam;
              getRefCurResultset  =  getRefCurResultset.replace(/##stname##/g, theName);
              getRefCurResultset  =  getRefCurResultset.replace(/##pindex##/g, iRefCurIndex);
              getRefCurResultset  =  getRefCurResultset.replace(/##pname##/g, theResultset);
              primary = primary.replace(re,theName + r1 + getRefCurResultset);
            }
          }
        }
      }
      else 
      {
        pattern = "([\\r\\n]+\\s*ResultSet\\s+)(\\w+)(\\s*=\\s*" + theName + "\\.getresultset\\(\\s*\\)\\s*;\\s*)";
        re = new RegExp(pattern, "i");
        if (primary.search(re) != -1)
        {
          var oldRsName = RegExp.$2;
          if (oldRsName != theResultset)
          {
            if (theResultset && theResultset.length)
            {
              // update name for getresult
              primary = primary.replace(re, RegExp.$1 + theResultset + RegExp.$3);
              // update name for next
              
              //update the num rows block.
              pattern = "([\\r\\n]+\\s*)" + oldRsName + "(_numRows)";
              reNum = new RegExp(pattern, "i");
              if (primary.search(reNum) != -1)
              {
                primary = primary.replace(reNum, RegExp.$1 + theResultset + RegExp.$2);
              }

              pattern = new RegExp(oldRsName + "(\\.)","g");
              if (primary.search(pattern) != -1)
              {
                primary = primary.replace(pattern, theResultset + RegExp.$1);
              }

              pattern = new RegExp(oldRsName + "_","g");
              if (primary.search(pattern) != -1)
              {
                primary = primary.replace(pattern, theResultset + "_");
              }
            }
            else
            {
              // remove resultset
              primary = primary.replace(re, "");
              // remove the next statement
              pattern = "\\s*boolean\\s+" + oldRsName + "_isEmpty\\s*=\\s*!\\s*" + oldRsName + "\\.next\\s*\\(.+\\n";
              re = new RegExp(pattern, "i");
              if (primary.search(re) != -1)
              {
                primary = primary.replace(re, "");
              }

              // remove the hasData statement
              pattern = "\\s*boolean\\s+" + oldRsName + "_hasData\\s*=\\s*!\\s*" + oldRsName + "_isEmpty\\s*.+\\n";
              re = new RegExp(pattern, "i");
              if (primary.search(re) != -1)
              {
                primary = primary.replace(re, "");
              }

              // remove the data statement
              pattern = "\\s*Object\\s+" + oldRsName + "_data;.+\\n";
              re = new RegExp(pattern, "i");
              if (primary.search(re) != -1)
              {
                primary = primary.replace(re, "");
              }

              //update the num rows block.
              pattern = "\\s*int\\s+" + oldRsName + "_numRows\\s*=\\s*0\\s*;\\s*";
              reNum = new RegExp(pattern, "i");
              if (primary.search(reNum) != -1)
              {
                primary = primary.replace(reNum, "");
              }

            }
          }
        }
        else
        {
          if (theResultset && theResultset.length)
          {
            pattern = theName + "(.execute\\s*\\(\\s*\\)\\s*;)";
            re = new RegExp(pattern, "i");
            if (primary.search(re) != -1)
            {
              var r1 = RegExp.$1;
              var getResultset =  MASK_RSCallable;
              getResultset  =  getResultset.replace(/##stname##/g, theName);
              getResultset  =  getResultset.replace(/##rsname##/g, theResultset);
              primary = primary.replace(re, theName + r1 + getResultset);
            }
          }
        }
      }
    }
  }

  return primary;
}

//Passed the function call above, takes prior arguments and reloads the UI.
//Removes any escape characters \

function inspectServerBehavior(ssRec) {


  CALLABLE_TEXT.value   = ssRec.callableText;
  CALLABLE_NAME_BOX.value   = ssRec.callableName;

  CONN_LIST.pickValue(ssRec.connectionName);

  TREE.setConnection(ssRec.connectionName)

  if (ssRec.recordset)
  {
    RR_CHECKBOX.checked = true;
    RR_NAME.value = ssRec.recordset;
  }

  var list = PARAM_LIST;

  if (ssRec.ParamArray)
  {
    var gridArray = new Array()
    for (i = 0;i < ssRec.ParamArray.length; i++)
    {
      var thisParam = ssRec.ParamArray[i];
      var thisRow = new Array()

      thisRow[0] = thisParam.name;
      if (parseInt(thisParam.type) == thisParam.type)
      {
        thisRow[1] = thisParam.type;
      }
      else
      {
        thisRow[1] = thisParam.type;
      }
      thisRow[2] = GetDirString(thisParam.direction);
      thisRow[3] = thisParam.value;
      thisRow[4] = thisParam.runTime;

      gridArray.push(thisRow);
    }
    PARAM_LIST.setContents(gridArray)
  }

  checkBoxClicked() //updates the test button
  
  if (ssRec.outOfDate) {
    alert(MM.MSG_SBOutOfDate);
  }
  if (ssRec && ssRec.errorMsg) {
    alert(ssRec.errorMsg);
  }
}

function GetDirString(dirNum)
{
  var a = new Array()

  a[1] = "in"
  a[2] = "out"
  a[3] = "in/out"
  a[4] = "RETURN_VALUE"

  if (!a[dirNum])
    alert(errMsg(MM.MSG_DirNum,dirNum));

  return a[dirNum]
}

function GetDirNum(dirString)
{
  var a = new Array()

  a["in"] = 1
  a["out"] = 2
  a["in/out"] = 3
  a["RETURN_VALUE"] = 4
  
  if (!a[dirString])
    alert(errMsg(MM.MSG_DirString,dirString));

  return a[dirString]
}



function deleteServerBehavior(ssRec) 
{
  ssRec.del();

  //refresh the cache for command.
  removeCachedSchemaInfo(ssRec.callableName);
  if (ssRec.recordset)
  {
    removeCachedSchemaInfo(ssRec.recordset);
  }

  MMDB.refreshCache(true);

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

  if (reason == FOR_TEST)
  {
    if (!RR_CHECKBOX.checked)
    {
      return "Must be sp and check box must be checked..." +
        "this shouldn't appear since the button should be disabled."
    }
  }

  if (reason == FINAL)
  {
    // we don't get here if we are just testing the statement
    var theName = Trim(CALLABLE_NAME_BOX.value)
    if (theName == "")
    {
      strOut += MM.MSG_NoCallableName;
      return strOut
    }

    if (!IsValidVarName(theName))
    {
      strOut = MM.MSG_InvalidCallableName
      return strOut
    }

    var priorName = null
    if(priorRec)
    {
      priorName = priorRec.callableName;
    }

    if (IsDupeObjectName(theName, priorName))
    {
      return MM.MSG_DuplicateCallableName
    }

  }

  if (CONN_LIST.getIndex() == 0)
  {
    strOut += MM.MSG_NoConnection;
    return strOut
  }
  

  if (RR_CHECKBOX.checked)
  {
    if (reason == FINAL)
    {
      var rsName = RR_NAME.value
      if (StripChars(" \t\r\n", rsName) == "")
      {
        return MM.MSG_NoRecordsetName;
      }

      if (!IsValidVarName(rsName))
    {
    strOut = MM.MSG_InvalidRecordsetName
        return strOut
    }

      
      var priorName = null
      if(priorRec)
      {
        priorName = priorRec.recordset
      }

      if (IsDupeObjectName(rsName, priorName))
      {
        return MM.MSG_DupeRecordsetName;
      }

      if (rsName == theName)
      {
        return MM.MSG_CallableAndResultsetDiffNames;
      }
    }
  }

  var theSQL =  CALLABLE_TEXT.value
  if (StripChars(" \r\n\t", theSQL) == "")
  {
    strOut += MM.MSG_NoSQLStatement;
    return strOut
  }


  var pa = PARAM_LIST.getContents()
  if (pa.length > 0)
  {   
      strOut = CheckSPParams(pa, reason)
  }

  return strOut
}



function CheckSPParams(pa, reason)
{
  var strOut = ""

  for (var i = 0; i < pa.length; i++)
  {
    var anOption = pa[i]
    var theType = GetDirNum(anOption[2])

    var theName = Trim(anOption[0])
    if (theName == "")
    {
      strOut =  strOut = MM.LABEL_ParamRow + (i + 1) + "\n\n" + MM.MSG_MissingParamName
      return strOut
    }
/*
    if (!IsValidVarName(theName))
    {
      strOut = MM.LABEL_ParamRow + (i + 1) + "\n\n" + theName + "\n\n" + MM.MSG_InvalidParamName
      return strOut
    }
*/

    var theDefaultVal = Trim(anOption[3])
    if (theDefaultVal == "" && (theType == 1 || theType == 3))
    {
      strOut = MM.LABEL_ParamRow + (i + 1) + "\n\n" + MM.MSG_DefaultValMissing + theName
      return strOut
    }

    if (reason == FINAL)
    {
      var theRunTimeVal = Trim(anOption[4])
      if ((theType == 1) || (theType == 3))
      {
        if ((theRunTimeVal == "" ) || (theRunTimeVal == "request.getParameter(\"\")"))
        {
          strOut = MM.LABEL_ParamRow + (i + 1) + "\n\n" + MM.MSG_RunTimeValMissing + theName
          return strOut
        }
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
  return Trim(CALLABLE_NAME_BOX.value)
}


function GetCallableText(callableName,ParamArray)
{
  /*
  This function looks at the list of params and
  creates a SQL string that has variables in it.
  For example: If there is a parameter called
  "@Name" and a SQL statement that looks like
  "Select * from table where name = 'Name'",
  this function will output
  "Select * from table where name = '" + Callable1_Name + "'"
  (Note: the double quotes at the ends of the string are not 
  included in the output)
  */

  var theSQL = CALLABLE_TEXT.value
  theSQL = theSQL.replace(/\n/g,"\\n");
  theSQL = theSQL.replace(/\r/g,"\\r");

  return "\"" + theSQL + "\"";
}


function GetPrepared()
{
  return "true";
}

function GetQueryTimeOut()
{
  return 0;
}

function GetParamArray()
{
  var ParamArray = PARAM_LIST.getContents();
  // convert direction string to a number
  for (var i = 0; i < ParamArray.length; i++)
  {
    ParamArray[i][2] = GetDirNum(ParamArray[i][2])
  }

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
  CALLABLE_TEXT = findObject("theCallableText")
  TREE_SEL_BOX  = findObject("TreeSelection")
  CALLABLE_NAME_BOX = findObject("callableName")
  MINUS_BUTTON  = findObject("minusButton")
  PLUS_BUTTON   = findObject("plusButton")
  //TREE      = findObject("DBTree")
  TREE      = new DBTreeControl("DBTree")
  RR_CHECKBOX   = findObject("RResultset");
  RR_NAME     = findObject("RResultsetName");
  TEST_BUTTON   = findObject("testButton")
  PopulateConnectionList();
  CALLABLE_NAME_BOX.value = CreateNewName()
  SetEnabled(TEST_BUTTON, false)
}


function CreateNewName()
{
  var num = 0
  var dom = dw.getDocumentDOM();
  var nodes = dom.getElementsByTagName("MM_CALLABLE");
  var newNameFound = false

  while (!newNameFound)
  {
    num++
    var comName = "Callable" + num
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


function PopUpTestDialog()
{
  var msg = CheckData(FOR_TEST)
  if (msg != "")
  {
    alert(msg)
    return
  }

  var pa = PARAM_LIST.getContents()
  var paramNames = new Array()
  var paramValues = new Array()
  
  for (var i = 0; i < pa.length; i++)
  {
    var aParam = pa[i]
    paramNames[i]  = aParam[0]
    paramValues[i] = aParam[3]
  }

  var statement = CALLABLE_TEXT.value

  var found = (statement.search(/\s*call\s*([^\s\(\)\}]*)\s*/i) > -1)

  var proc = RegExp.$1

  MMDB.showSPResultsetNamedParams(CONN_LIST.getValue(), proc, paramNames, paramValues)

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
  var curText = CALLABLE_TEXT.value

  if (!treeData.IsProcedure())
  {
    alert(errMsg(MM.MSG_StoredProcedure))
    return
  } else  {
    PARAM_LIST.delAll()
    var returnValue = ""
    var numParams = 0
    var outParams = ""

    var treeData = TREE.getData()
    var procName = treeData.procedure 
    var paramArray = treeData.paramArray

    procName = "call " + procName; 
    var paramArray = treeData.paramArray;
    var gridArray = new Array()
    var pCount = 0;
    for (var i = 0; i < paramArray.length; i++)
    {
      if (i == 0)
      {
        procName = procName + "(";
      }

      var stype = paramArray[i].type;
      gridArray[i] = new Array()      
      gridArray[i][0] = paramArray[i].name;
      gridArray[i][1] = paramArray[i].type;
      if (gridArray[i][1] == "int")
        gridArray[i][1] = "3"

      var dirNum = Number(paramArray[i].direction);
      switch (dirNum)
      {
        //in,out,in-out case for parameters
        case 1:
        case 2:
        case 3:
             {
            if (pCount)
              procName = procName + ",?";     
            else
              procName = procName + "?";      
            }
            pCount++;
            break;
        case 4:
            procName = "?= " + procName;      
            break;
      }
      gridArray[i][2] = GetDirString(dirNum);
      gridArray[i][3] = ""
      //Check for ref cursor type...
      if ((paramArray[i].type != "REF CURSOR")&&(paramArray[i].type != "REFCURSOR"))
      {
        gridArray[i][4] = "request.getParameter(\"\")"
      }
      else
      {
        gridArray[i][2] = "out";
      }
    }
  
    PARAM_LIST.setContents(gridArray)
    if (paramArray.length) 
    {
      procName = "{" + procName + ")" + "}";
    }
    else
    {
      procName = "{" + procName + "}";
    }
    CALLABLE_TEXT.value = procName;
  }
}

function UpdateTreeSelection()
{
  //TREE_SEL_BOX.value = TREE.selectedItem
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

function GetValueFromEncoding(strIn)
{
  var value = strIn

  value = value.replace(/\\"/ig, "\"") // decode  \"
  //now take off the quotes on the ends
  return value
}

function generateDynamicDataRef(elementNode,elementname)
{
  var retStr=null;
  if (elementNode.tagName == "MM_CALLABLE")
  {
    var ss = findSSrec(elementNode, CONST_TYPE)
    if (ss) {
      if (ss.ParamArray && ss.ParamArray.length)
      {
        for (var i = 0; i < ss.ParamArray.length; i++)
        {
          if (ss.ParamArray[i].name == elementname)
          {
            retStr =  i+1;
          }
        }
      }
    }
  }
  return retStr;
}

function getDynamicBindings(elementNode)
{
  var parametersArray = new Array()
  var columnsArray = new Array()

  if (elementNode.tagName == "MM_CALLABLE")
  {
    var ss = findSSrec(elementNode, CONST_TYPE)

    //First we construct an array of the return value and out/(in/out) parameters
    if (String(ss.ParamArray) != "undefined")
    {
      for (var i = 0; i < ss.ParamArray.length; i++)
      {
        var dir = Number(ss.ParamArray[i].direction);
        if (dir == 4 || dir == 2 || dir == 3)
        {
          parametersArray.push(ss.ParamArray[i].name)
        }
      }
    }
  }
  else if (elementNode.tagName == "MM_CALLRESSET")
  {

    var ss = findSSrec(elementNode.parentNode, CONST_TYPE)

    var connString = ss.activeconnection
    var connName = ss.connectionName
    var statement = ss.callableText
    var comName = ss.callableName

    var paramNames = new Array()
    var paramValues = new Array()

    if (ss.ParamArray)
    {
      var pa = ss.ParamArray

      for (var i = 0; i < pa.length; i++)
      {
        var aParam = pa[i]
        paramNames[i] = aParam.name
        paramValues[i] = aParam.value
      }
    }

    var found = (statement.search(/\s*call\s*([^\s\(\)\}]*)\s*/i) > -1)
    if (found)
    {
      var proc = RegExp.$1

      strOut = "Proc Name: " + proc + "\n"
      for (var i = 0; i < paramNames.length; i++)
      {
        strOut += "\nParam " + i + "\n  name:" + paramNames[i]
        strOut += "\n  value: " + paramValues[i]
      }
      columnsArray = MMDB.getSPColumnListNamedParams(connName, proc, paramNames, paramValues,true)
    }
  }

  var outArray = new Array()

  for (var i = 0; i < parametersArray.length; i++)
  {
    outArray.push(parametersArray[i])
  } 

  for (var i = 0; i < columnsArray.length; i++)
  {
    outArray.push(columnsArray[i])
  } 

  return outArray
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
