// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
var DEBUG = false
var application_filename = "APP_D.gif"
var datasourceleaf_filename = "DSL_D.gif"

function addDynamicSource()
{
  MM.retVal = "";
  MM.applicationContents = "";
  dw.popupCommand("Application Variable");
  if (MM.retVal == "OK") {
    var theResponse = MM.applicationContents;
    if (theResponse.length) {
      var siteURL = dw.getSiteRoot();
      if (siteURL.length){
        addValueToNote(siteURL,"applicationCount","Application",theResponse);   
      }
      else{
        alert(MM.MSG_DefineSite);
      }
    }
    else {
      alert(MM.MSG_DefineApplication);
    }
  }
}


function findDynamicSources()
{
  var DSL = new Array();

  var siteURL = dw.getSiteRoot()

  if (siteURL.length){
    var ABindingsArray = new Array();
    getValuesFromNote(siteURL,ABindingsArray,"Application","applicationCount");
    if (ABindingsArray.length > 0) {
      //DSL.push("Application");
      DSL.push(new ObjectInfo(MM.LABEL_Application, application_filename, false, "Application.htm",""))
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

  var siteURL = dw.getSiteRoot();

  //For localized object name
  if (elementName != "Application")     
    elementName = "Application"

  if (siteURL.length){
    getValuesFromNote(siteURL,BindingsArray,elementName,"applicationCount");
    outArray = GenerateObjectInfoForSourceBindings(BindingsArray, datasourceleaf_filename, "Application.htm","");
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
  retStr = "<%= Application(\"" + bindingName + "\") %>";

  // If the string is being inserted inside a script block, strip the
  // script delimiters.
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
    var siteURL = dw.getSiteRoot();
      if (siteURL.length){

      //For localized object name
    if (sourceName != "Application")      
      sourceName = "Application"
    deleteValueFromNote(siteURL,"applicationCount",sourceName,bindingName);
    }
}
