// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

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
      retVal = unescQuotes(unquoted);
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
        retVal = "\"" + escQuotes(expression) + "\"";
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
    retVal = trimInlineASP(str);
  } else if (serverModel == "JSP") {
    retVal = trimInlineJSP(str);
  }
  return retVal;
}


function trimInlineASP(inStr) {
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


function trimInlineJSP(inStr) {
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


function launchDynamicData(fieldToStore) {
  var serverModel = dw.getDocumentDOM().serverModel.getServerName();
  var expression = dw.showDynamicDataDialog(fieldToStore.value);
  if (expression) {
    if (serverModel == "Cold Fusion") {
      expression = stripCFOutput(expression);
    }
    fieldToStore.value = expression;
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


