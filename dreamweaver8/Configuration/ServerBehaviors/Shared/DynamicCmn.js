// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------

//---------------   JavaScript Masks   ---------------

var PATT_AspJsNotQuoted = /(true|false|[-]?\d+[\.]?\d*)/;

//---------------   VBScript Masks   ---------------

var PATT_AspVbNotQuoted = /[\x00]/;  // quote all values for ASP/VB

//---------------   Cold Fusion Masks   ---------------

var PATT_CfmlNotQuoted = /(true|false|[-]?\d+[\.]?\d*)/i;

//---------------   JSP Masks   ---------------

var PATT_JspNotQuoted = /[\x00]/;  // quote all values for JSP


//---------------   LOCAL FUNCTIONS   ---------------

// This function is called to extract a dynamic expression from the page.
function extractDynamicExpression(expression) {
  var retVal = "";
  expression = dwscripts.trim(expression);
  var unquoted = stripQuotes(expression);
  var parameters = unquoted.match(getServerData("patt", "NotQuoted"));
  if (parameters && parameters[0].length == unquoted.length) { // expression matches, return exact
    retVal = expression;
  } else {    // does not match, return the simple version
    if (isQuoted(expression)) {
      retVal = dwscripts.unescQuotes(unquoted);
    } else {
      retVal = wrapDynamicDataRef(expression);
    }
  }
  return retVal;
}

// This function is called to format a dynamic expression for insertion on the page.
function formatDynamicExpression(theExpression) {
  var retVal = "";
  var expression = theExpression.toString();
  if (dynamicServerDataExists(expression)) {
    retVal = trimServerMarkup(expression);
  } else {
    var parameters = expression.match(getServerData("patt", "NotQuoted"));
    if (parameters && parameters[0].length == expression.length) {   // matches, should not be quoted
      retVal = expression;
    } else {
      if (!isQuoted(expression)) {
        retVal = "\"" + dwscripts.escQuotes(expression) + "\"";
      } else {
        retVal = expression;
      }
    }
  }
  return retVal;
}


function trimServerMarkup(str) {
  var serverModel = dw.getDocumentDOM().serverModel.getServerName();
  var retVal = "";

  if (serverModel == "Cold Fusion") {
    retVal = stripCFOutput(str);
  } else if (serverModel == "ASP") {
    retVal = TrimInlineASP(str);
  } else if (serverModel == "JSP") {
    retVal = TrimInlineJSP(str);
  }
  return retVal;
}


function TrimInlineASP(inStr) {
  if (inStr.length) {
    var begininlineindex = inStr.indexOf("<%=(");
    var endinlineindex  =  inStr.indexOf(")%>"); 
    if ((begininlineindex != -1) && (endinlineindex!=-1)) {
      inStr = inStr.substring(begininlineindex+4,endinlineindex);
    } else {
      var begininlineindex = inStr.indexOf("<%=");
      var endinlineindex  =  inStr.indexOf("%>"); 
      if ((begininlineindex != -1) && (endinlineindex!=-1)) {
        inStr = inStr.substring(begininlineindex+3,endinlineindex);
      }
    } 
  }
  inStr = dwscripts.trim(inStr);

  return inStr;
}


function stripCFOutput(str) {
  var retVal = str;
  retVal = stripCFOutputTags(retVal);
  return retVal;
}


function TrimInlineJSP(inStr) {
  if (inStr.length) {
    var begininlineindex = inStr.indexOf("<%=");
    var endinlineindex  =  inStr.indexOf("%>");
    if ((begininlineindex != -1) && (endinlineindex!=-1)) {
      inStr = inStr.substring(begininlineindex+3,endinlineindex);
    }
    inStr = dwscripts.trim(inStr);
  }

  return inStr;
}


function attributeIsServerMarkup(attribute) {
  var serverModel = dw.getDocumentDOM().serverModel.getServerName();
  var isServerMarkup = false;
  
  if (serverModel == "ASP"){
    if (attribute.indexOf("<%=") == 0) isServerMarkup = true;
  } else if (serverModel == "Cold Fusion"){
    if (attribute.indexOf("<cfif") == 0) isServerMarkup = true;
  } else if (serverModel == "JSP") {
    if (attribute.indexOf("<%=") == 0) isServerMarkup = true;
  }

  return isServerMarkup;
}


function wrapDynamicDataRef(rVal){
  var retVal = "";
  var serverModel = dw.getDocumentDOM().serverModel.getServerName();

  if (serverModel == "ASP") {
    if (rVal && rVal.charAt(0) == "(" && rVal.charAt(rVal.length-1) == ")")
      retVal = "<%=" + rVal + "%>";
    else
      retVal = "<%=(" + rVal +  ")%>";
  } else if (serverModel == "Cold Fusion") {
    retVal = rVal; // no need to wrap in cfoutput tags
  } else if (serverModel == "JSP") {
    if (rVal && rVal.charAt(0) == "(" && rVal.charAt(rVal.length-1) == ")")
      retVal = "<%= " + rVal + " %>";
    else
      retVal = "<%= (" + rVal +  ") %>";
  }

  return retVal;
}


function LaunchDynamicData() {
  var serverModel = dw.getDocumentDOM().serverModel.getServerName();
  var expression = dw.showDynamicDataDialog(EQUALSTO.value);
  if (expression) {
    if (serverModel == "Cold Fusion") {
      expression = stripCFOutput(expression);
    }
    EQUALSTO.value = expression;
  }
}


function dynamicServerDataExists(inStr){
  var serverModel = dw.getDocumentDOM().serverModel.getServerName();
  var bDataExists = false;
  if (serverModel == "ASP") {
    if ((inStr.toString().indexOf("<%") != -1 && inStr.toString().indexOf("%>") != -1))
      bDataExists = true;

  } else if (serverModel == "Cold Fusion")
  {
    var exp1 = /<cfoutput[^>]*>/gi;
    var exp2 = /<\/cfoutput>/gi;
    if ((inStr.search(exp1) != -1 && inStr.search(exp2) != -1))
    {
      bDataExists = true;
    }

    if (!bDataExists)
    {
      var exp3 = /#.*#/gi;
      if ((inStr.search(exp3) != -1))
      {
        bDataExists = true;
      }
    }
  } else if (serverModel == "JSP") {
    if ((inStr.indexOf("<%") != -1))
      bDataExists = true;
  }

  return bDataExists;
}


function isQuoted(theStr) {
  var retVal = false;
  if (theStr && theStr.length > 1) {
    theQuote = theStr.charAt(0);
    if ((theQuote == "'" || theQuote == '"') &&
        theStr.charAt(theStr.length-1) == theQuote) {
      retVal = true;
    }
  }
  return retVal;
}

function stripQuotes(theStr) {
  if (isQuoted(theStr)) {
    theStr = theStr.substring(1,theStr.length-1);
  }
  return theStr;
}

// This function is a safe version of the standard string replace.
// It is needed in case the replacement value is a number.
// Dreamweaver is incorrectly combining this number with the $# parameters.
// The pattern should group items that need to be preserved.
function safeReplace(text,patt,value) {
  var retVal = text;
  var result = patt.exec(retVal);
  if (result != null) {
    retVal = retVal.substring(0, result.index) + 
             result[1] + value + result[2] + 
             retVal.substring(result.index + result[0].length);
  }
  return retVal;
}


//For Cold Fusion: if looks like an invalid datasource,
//return if that name comes from valid tag such as CFPOP or CFLDAP.
//Typically this means the sbObj should not be marked incomplete, but deleted.
function isForeignCfDataSource(rsName) {
  var retVal = false;
  if (dw.getDocumentDOM().serverModel.getServerName() == "Cold Fusion" && rsName) {
    var dom = dw.getDocumentDOM();
    var cfDataSrcs = dom.getElementsByTagName("CFPOP");
    cfDataSrcs = cfDataSrcs.concat(dom.getElementsByTagName("CFLDAP"));
    cfDataSrcs = cfDataSrcs.concat(dom.getElementsByTagName("CFDIRECTORY"));
    for (var i=0; i<cfDataSrcs.length; i++) {
      if (cfDataSrcs[i].name && cfDataSrcs[i].name.toUpperCase() == rsName.toUpperCase()) {
        retVal = true;
        break;
      }
    }
  }
  return retVal
}



//Check if data source is valid (can be a known recordset, or a session, request, url etc.
//Also passed allRecs since this is usually called by analyzeServerBehavior.

function isAnyDataSource(rsName, allRecs) {
  var found = false;

  var rsNameLowercase = rsName.toLowerCase();
  if ((rsNameLowercase == "session")||
      (rsNameLowercase == "request")||
      (rsNameLowercase == "application")||
      (rsNameLowercase == "client")||
      (rsNameLowercase == "url")||
      (rsNameLowercase == "form")||
      (rsNameLowercase == "cgi") ||
      (rsNameLowercase == "cookie")||
      (rsNameLowercase == "server") ||  
      (rsNameLowercase == "os") ||  
      (rsNameLowercase == "variables"))
  {
    found = true;
  }

  if (!found) {
    for (var i = 0; i < allRecs.length; i++) {
      var theType = allRecs[i].type;
      if ((theType == "recordset"    && allRecs[i].rsName       == rsName)   //ASP
        ||(allRecs[i].serverBehavior == "Recordset.htm" && allRecs[i].rsName == rsName)
        ||(theType == "command"      && allRecs[i].recordset    == rsName)
        ||(theType == "command"      && allRecs[i].cdName    == rsName)
        ||(theType == "cfquery"      && allRecs[i].name.toLowerCase()  == rsName.toLowerCase())   //CFML
        ||(theType == "cfstoredproc" && allRecs[i].name.toLowerCase()  == rsName.toLowerCase())
        ||(theType == "cfstoredproc" && allRecs[i].resultsetName && allRecs[i].resultsetName.toLowerCase()  == rsName.toLowerCase()) 
        ||(theType == "resultset"    && allRecs[i].rsName       == rsName)   //JSP
        ||(theType == "callable"     && allRecs[i].callableName == rsName)
        ||(theType == "JavaBean"     && allRecs[i].parameters.Id == rsName)
        ||(theType == "JavaBeanIndexed"     && ((allRecs[i].parameters.Id+"_item") == rsName))
        ||(theType == "callable"     && allRecs[i].recordset == rsName)) 
    {
        found = true
        break
  } } }

  return found;
}
