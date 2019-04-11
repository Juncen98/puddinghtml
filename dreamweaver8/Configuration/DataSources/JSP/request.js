// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
var DEBUG = false
var request_filename = "REQ_D.gif"
var datasourceleaf_filename = "DSL_D.gif"



function addDynamicSource()
{
  var dom = dw.getDocumentDOM();
  var fileURL = dom.URL;
  if (!fileURL.length){
    fileURL = dwscripts.getTempURLForDesignNotes();
  }

  MM.retVal = "";
  MM.requestContents = "";
  dw.popupCommand("jsprequest");
  if (MM.retVal == "OK") {
    var theResponse = MM.requestContents;
    if (theResponse.length) {
        addValueToNote(fileURL,"requestCount","request",theResponse);
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
      getValuesFromNote(fileURL,RBindingsArray,"request","requestCount");
      if (RBindingsArray.length > 0) {
        DSL.push(new ObjectInfo(MM.LABEL_RequestJSP, request_filename, false, "Request.htm",""))
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

    //For localized object name
    if (elementName != "request")     
      elementName = "request"

    if (!fileURL.length)
      fileURL = dwscripts.getTempURLForDesignNotes();
    if (fileURL.length){
      getValuesFromNote(fileURL,BindingsArray,elementName,"requestCount");
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
  // If the string is being inserted inside a script block, strip the
  // script delimiters.
  if (dwscripts.canStripScriptDelimiters(dropObject))
    retStr = "request.getParameter(\"" + bindingName + "\")";
  else
    retStr = "<%= " + "((" + "request.getParameter(\"" + bindingName + "\")!=null)?" + "request.getParameter(\"" + bindingName + "\")" + ":\"\")" +  " %>";

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
  if(expression.length) 
  {

    // Quickly reject if the expression doesn't contain "<%="
    var exprIndex = expression.indexOf("<%=");
    if (exprIndex != -1)
    {
      // No need to search the string prior to the "<%="
      expression = expression.substr(exprIndex);

      var TranslatorDOM = dreamweaver.getDocumentDOM(dreamweaver.getConfigurationPath() + "/Translators/JSP.htm");
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

      //For localized object name
     if (sourceName != "request")     
      sourceName = "request"

     if (dom) {
       var fileURL = dom.URL;
         if (!fileURL.length)
           fileURL = dwscripts.getTempURLForDesignNotes();
       if (fileURL.length){
      deleteValueFromNote(fileURL,"requestCount",sourceName,bindingName);
     }  
} }
