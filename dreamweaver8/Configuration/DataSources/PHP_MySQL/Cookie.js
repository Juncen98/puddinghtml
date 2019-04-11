// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.


//************** GLOBALS VARS *****************

var COOKIE_FILENAME = "REQ_D.gif"; 
var DATASOURCELEAF_FILENAME = "DSL_D.gif"; 


//****************** API **********************

//--------------------------------------------------------------------
// FUNCTION:
//   addDynamicSource
//
// DESCRIPTION:
//   Adds a Dynamic Source to the Data Bindings panel
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function addDynamicSource()
{
  MM.retVal = "";
  MM.CookieContents = "";
  dw.popupCommand("Cookie Variable");

  if (MM.retVal == "OK")
  {
    var theResponse = MM.CookieContents;

    if (theResponse.length)
    {
      var siteURL = dw.getSiteRoot();
      if (siteURL.length)
      {
        dwscripts.addListValueToNote(siteURL, "Cookie", theResponse);   
      }
      else
      {
        alert(MM.MSG_DefineSite);
      }
    }
    else 
    {
      alert(MM.MSG_DefineCookie);
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   findDynamicSources
//
// DESCRIPTION:
//   Returns a list of Dynamic Sources on the page
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   JavaScript Array of Objects
//--------------------------------------------------------------------

function findDynamicSources()
{
  var retList = new Array();

  var siteURL = dw.getSiteRoot()

  if (siteURL.length)
  {
    var bindingsArray = dwscripts.getListValuesFromNote(siteURL, "Cookie");
    if (bindingsArray.length > 0)
    {
      retList.push(new DataSource(MM.LABEL_Cookie, 
                                  COOKIE_FILENAME, 
                                  false, 
                                  "Cookie.htm"))
    }
  }

  return retList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   generateDynamicSourceBindings
//
// DESCRIPTION:
//   Returns a list of bindings for the given elementName on the page.
//
// ARGUMENTS:
//   sourceName - string - the name returned from the findDynamicSources
//     function
//
// RETURNS:
//   JavaScript Array of Objects
//--------------------------------------------------------------------

function generateDynamicSourceBindings(sourceName)
{
  var retVal = new Array();

  var siteURL = dw.getSiteRoot();

  //For localized object name
  if (sourceName != "Cookie")
  {
    sourceName = "Cookie";
  }

  if (siteURL.length)
  {
    var bindingsArray = dwscripts.getListValuesFromNote(siteURL, sourceName);
    retVal = getDataSourceBindingList(bindingsArray, 
                                      DATASOURCELEAF_FILENAME,
                                      true,
                                      "Cookie.htm");
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   generateDynamicDataRef
//
// DESCRIPTION:
//   Returns a dynamic binding string.
//
// ARGUMENTS:
//   sourceName - string - the name of the dynamic source returned
//     from the findDynamicSources function
//   bindingName - string - the name of a dynamic source binding returned
//     from generateDynamicSourceBindings
//
// RETURNS:
//   string - the code to insert on the page
//--------------------------------------------------------------------

function generateDynamicDataRef(sourceName, bindingName, dropObject)
{
  var paramObj = new Object();
  paramObj.bindingName = bindingName;
  var retStr = extPart.getInsertString("", "Cookie_DataRef", paramObj);

  if (dwscripts.canStripScriptDelimiters(dropObject, true))
  {
    retStr = dwscripts.stripScriptDelimiters(retStr, true);
  } 

  return retStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   inspectDynamicDataRef
//
// DESCRIPTION:
//   Inspects a dynamic binding string and returns a pair of 
//   source and binding values.
//
// ARGUMENTS:
//   expression - string - the dynamic binding expression to be
//     inspected
//
// RETURNS:
//   JavaScript Array of strings - an array of length 2, with the first
//   value being the sourceName, and the second being the bindingName
//--------------------------------------------------------------------

function inspectDynamicDataRef(expression)
{
  var retArray = new Array();

  if(expression.length)
  {
    var params = extPart.findInString("Cookie_DataRef", expression);
    if (params)
    {
      retArray[0] = "Cookie";
      retArray[1] = params.bindingName;
    }
  }
    
  return retArray;
}


//--------------------------------------------------------------------
// FUNCTION:
//   deleteDynamicSource
//
// DESCRIPTION:
//   Deletes a dynamic source from the document.
//
// ARGUMENTS:
//   sourceName - string - the name of the dynamic source returned
//     from the findDynamicSources function
//   bindingName - string - the name of a dynamic source binding returned
//     from generateDynamicSourceBindings
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function deleteDynamicSource(sourceName, bindingName)
{
  var siteURL = dw.getSiteRoot();
      
  if (siteURL.length)
  {
    //For localized object name
    if (sourceName != "Cookie")
    {
      sourceName = "Cookie";
    }

    dwscripts.deleteListValueFromNote(siteURL, sourceName, bindingName);
  }
}
