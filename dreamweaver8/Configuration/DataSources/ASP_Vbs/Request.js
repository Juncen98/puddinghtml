// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
var DEBUG = false
var request_filename = "REQ_D.gif"
var datasourceleaf_filename = "DSL_D.gif"



function addDynamicSource()
{
  MM.retVal = "";
  MM.requestContents = "";

  var dom = dw.getDocumentDOM();
  var fileURL = dom.URL;
  if (!fileURL.length){
    fileURL = dwscripts.getTempURLForDesignNotes();
  }

  dw.popupCommand("Request Variable");
  if (MM.retVal == "OK") {
    var theResponse = MM.requestContents;
    var theRequestType = MM.requestType;
    if (theResponse.length) {
      switch (theRequestType) {
      case "request":
        addValueToNote(fileURL,"requestCount","Request",theResponse);
        break;
      case "querystring":
        addValueToNote(fileURL,"requestQStringCount","RequestQString",theResponse);
        break;
      case "form":
        addValueToNote(fileURL,"requestFormCount","RequestForm",theResponse);
        break;
      case "cookie":
        addValueToNote(fileURL,"requestCookieCount","RequestCookie",theResponse);
        break;
      case "servervar":
        addValueToNote(fileURL,"requestServerVarCount","RequestServerVar",theResponse);
        break;
      case "clientcert":
        addValueToNote(fileURL,"requestCertCount","RequestCert",theResponse);
        break;
      }
    }
    else {
      alert(MM.MSG_RequestGiveName);
    }
  }
}


function findDynamicSources()
{
  var DSL = new Array();

  var dom = dw.getDocumentDOM();

  if (dom) {
    var fileURL = dom.URL;
    if (!fileURL.length)
      fileURL = dwscripts.getTempURLForDesignNotes();

    if (fileURL.length){
      var RBindingsArray = new Array();

      //Check for request variables
      getValuesFromNote(fileURL,RBindingsArray,"Request","requestCount");
      if (RBindingsArray.length > 0) {
        DSL.push(new ObjectInfo(MM.LABEL_Request, request_filename, false, "Request.htm",""))
      }

      if (RBindingsArray.length == 0) {
        //check for form variables
        getValuesFromNote(fileURL,RBindingsArray,"RequestQString","requestQStringCount");
        if (RBindingsArray.length > 0) {
          DSL.push(new ObjectInfo(MM.LABEL_Request, request_filename, false, "Request.htm",""))
        }
      }


      if (RBindingsArray.length == 0) {
        //check for form variables
        getValuesFromNote(fileURL,RBindingsArray,"RequestForm","requestFormCount");
        if (RBindingsArray.length > 0) {
          DSL.push(new ObjectInfo(MM.LABEL_Request, request_filename, false, "Request.htm",""))
        }
      }

      if (RBindingsArray.length == 0) {
        //check for cookie variable
        getValuesFromNote(fileURL,RBindingsArray,"RequestCookie","requestCookieCount");
        if (RBindingsArray.length > 0) {
          DSL.push(new ObjectInfo(MM.LABEL_Request, request_filename, false, "Request.htm",""))
        }
      }

      if (RBindingsArray.length == 0) {
        //check for servervar variable
        getValuesFromNote(fileURL,RBindingsArray,"RequestServerVar","requestServerVarCount");
        if (RBindingsArray.length > 0) {
          DSL.push(new ObjectInfo(MM.LABEL_Request, request_filename, false, "Request.htm",""))
        }
      }

      if (RBindingsArray.length == 0) {
        //check for servervar variable
        getValuesFromNote(fileURL,RBindingsArray,"RequestCert","requestCertCount");
        if (RBindingsArray.length > 0) {
          DSL.push(new ObjectInfo(MM.LABEL_Request, request_filename, false, "Request.htm",""))
        }
      }


    }
  }

  return DSL;
}

////////////////////////////////////////////////////////////////////////////////
//  Function: generateDynamicSourceBindings()
//
//  Returns a list of bindings for elementNode on the page.
////////////////////////////////////////////////////////////////////////////////
function generateDynamicSourceBindings(elementName)
{
  var BindingsArray = new Array();
  var outArray;

  var dom = dw.getDocumentDOM();
    if (dom) {
    var fileURL = dom.URL;
    if (!fileURL.length)
      fileURL = dwscripts.getTempURLForDesignNotes();
    if (fileURL.length){

      getValuesFromNote(fileURL,BindingsArray,"Request","requestCount");

      var FormVarArray = new Array();
      getValuesFromNote(fileURL,FormVarArray,"RequestQString","requestQStringCount");
      for (var fvar=0;fvar < FormVarArray.length ;fvar++) {
        BindingsArray.push("QueryString." + FormVarArray[fvar]);
      }


      var FormVarArray = new Array();
      getValuesFromNote(fileURL,FormVarArray,"RequestForm","requestFormCount");
      for (var fvar=0;fvar < FormVarArray.length ;fvar++) {
        BindingsArray.push("Form." + FormVarArray[fvar]);
      }

      var CookieVarArray = new Array();
      getValuesFromNote(fileURL,CookieVarArray,"RequestCookie","requestCookieCount");
      for (var cvar=0;cvar < CookieVarArray.length ;cvar++) {
        BindingsArray.push("Cookies." + CookieVarArray[cvar]);
      }

      var ServerVarArray = new Array();
      getValuesFromNote(fileURL,ServerVarArray,"RequestServerVar","requestServerVarCount");
      for (var svar=0;svar < ServerVarArray.length ;svar++) {
        BindingsArray.push("ServerVariables." + ServerVarArray[svar]);
      }

      var CertArray = new Array();
      getValuesFromNote(fileURL,CertArray,"RequestCert","requestCertCount");
      for (var ctvar=0;ctvar < CertArray.length ;ctvar++) {
        BindingsArray.push("ClientCertificate." + CertArray[ctvar]);
      }

      outArray = GenerateObjectInfoForSourceBindings(BindingsArray, datasourceleaf_filename, "Request.htm","");
    }
  }
    
  return outArray;

}


////////////////////////////////////////////////////////////////////////////////
//
//  Function: generateDynamicDataRef
//
//  Returns a dynamic binding string.
////////////////////////////////////////////////////////////////////////////////
function generateDynamicDataRef(elementName,bindingName,dropObject)
{
  var retStr = "";

  var re = /^Form\.(\w+)/i;
  index = bindingName.search(re);
  if (index != -1) {
    retStr = "<%= Request.Form(\"" + RegExp.$1 + "\") %>";
    if (dwscripts.canStripScriptDelimiters(dropObject))
      retStr = dwscripts.stripScriptDelimiters(retStr);
    return retStr;
  }
  
  var re = /^Cookies\.(\w+)/i;
  index = bindingName.search(re);
  if (index != -1) {
    retStr = "<%= Request.Cookies(\"" + RegExp.$1 + "\") %>";
    if (dwscripts.canStripScriptDelimiters(dropObject))
      retStr = dwscripts.stripScriptDelimiters(retStr);
    return retStr;
  }

  var re = /^QueryString\.(\w+)/i;
  index = bindingName.search(re);
  if (index != -1) {
    retStr = "<%= Request.QueryString(\"" + RegExp.$1 + "\") %>";
    if (dwscripts.canStripScriptDelimiters(dropObject))
      retStr = dwscripts.stripScriptDelimiters(retStr);
    return retStr;
  }


  var re = /^ServerVariables\.(\w+)/i;
  index = bindingName.search(re);
  if (index != -1) {
    retStr = "<%= Request.ServerVariables(\"" + RegExp.$1 + "\") %>";
    if (dwscripts.canStripScriptDelimiters(dropObject))
      retStr = dwscripts.stripScriptDelimiters(retStr);
    return retStr;
  }

  var re = /^ClientCertificate\.(\w+)/i;
  index = bindingName.search(re);
  if (index != -1) {
    retStr = "<%= Request.ClientCertificate(\"" + RegExp.$1 + "\") %>";
    if (dwscripts.canStripScriptDelimiters(dropObject))
      retStr = dwscripts.stripScriptDelimiters(retStr);
    return retStr;
  }

  retStr = "<%= Request(\"" + bindingName + "\") %>";
  if (dwscripts.canStripScriptDelimiters(dropObject))
    retStr = dwscripts.stripScriptDelimiters(retStr);
  return retStr;
}


////////////////////////////////////////////////////////////////////////////////
//
//  Function: inspectDynamicDataRef
//
//  Inspects a dynamic binding string and returns a pair of source and binding.
////////////////////////////////////////////////////////////////////////////////
function inspectDynamicDataRef(expression)
{
  var retArray = new Array();
  if(expression.length) {

    // Quickly reject if the expression doesn't contain "<%="
    var exprIndex = expression.indexOf("<%=");
    if (exprIndex != -1)
    {
      // No need to search the string prior to the "<%="
      expression = expression.substr(exprIndex);

      var TranslatorDOM = dreamweaver.getDocumentDOM(dreamweaver.getConfigurationPath() + "/Translators/ASP.htm");
      if (TranslatorDOM)  {
        TranslatedStr = TranslatorDOM.parentWindow.miniTranslateMarkup("", "", expression, false);
        if (TranslatedStr.length)
        {
          var found = TranslatedStr.search(/mm_dynamic_content\s+source=(\w+)\s+binding="([^"]*)"/i)
          if (found != -1)
          {
            retArray[0] = RegExp.$1
            retArray[1] = RegExp.$2
            //alert("source=" + retArray[0] + " binding=" + retArray[1])
          }
        }
      }
    }
  }
    
  return retArray;
}


////////////////////////////////////////////////////////////////////////////////
//
//  Function: deleteDynamicSource
//
//  Deletes a dynamic source from the document.
////////////////////////////////////////////////////////////////////////////////
function deleteDynamicSource(sourceName,bindingName)
{
     var dom = dw.getDocumentDOM();
     if (dom) {
       var fileURL = dom.URL;
         if (!fileURL.length)
           fileURL = dwscripts.getTempURLForDesignNotes();
       if (fileURL.length){

      var re = /^Form\.(\w+)/i;
      index = bindingName.search(re);
      if (index != -1) {
        deleteValueFromNote(fileURL,"requestFormCount","RequestForm",RegExp.$1);
        return;
      } 

      var re = /^Cookies\.(\w+)/i;
      index = bindingName.search(re);
      if (index != -1) {
        deleteValueFromNote(fileURL,"requestCookieCount","RequestCookie",RegExp.$1);
        return;
      } 

      var re = /^QueryString\.(\w+)/i;
      index = bindingName.search(re);
      if (index != -1) {
        deleteValueFromNote(fileURL,"requestQStringCount","RequestQString",RegExp.$1);
        return;
      }


      var re = /^ServerVariables\.(\w+)/i;
      index = bindingName.search(re);
      if (index != -1) {
        deleteValueFromNote(fileURL,"requestServerVarCount","RequestServerVar",RegExp.$1);
        return;
      }

      var re = /^ClientCertificate\.(\w+)/i;
      index = bindingName.search(re);
      if (index != -1) {
        deleteValueFromNote(fileURL,"requestCertCount","RequestCert",RegExp.$1);
        return;
      }


      deleteValueFromNote(fileURL,"requestCount","Request",bindingName);
     }  
  }
}
