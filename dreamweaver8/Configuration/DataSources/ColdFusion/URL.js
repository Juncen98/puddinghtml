// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//************** GLOBALS VARS *****************

var URL_FILENAME = "REQ_D.gif";
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
  MM.URLContents = "";
  dw.popupCommand("URL Variable");
  if (MM.retVal == "OK")
  {
    var theResponse = MM.URLContents;
    if (theResponse.length)
    {
      var siteURL = dw.getSiteRoot();
      if (siteURL.length)
      {
        dwscripts.addListValueToNote(siteURL, "URL", theResponse);   
      }
      else
      {
        alert(MM.MSG_DefineSite);
      }
    }
    else 
    {
      alert(MM.MSG_DefineURL);
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
    var bindingsArray = dwscripts.getListValuesFromNote(siteURL, "URL");
    if (bindingsArray.length > 0)
    {
      retList.push(new DataSource(MM.LABEL_URL, 
                                  URL_FILENAME, 
                                  false, 
                                  "URL.htm"))
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
  if (sourceName != "URL")
  {
    sourceName = "URL";
  }

  if (siteURL.length)
  {
    var bindingsArray = dwscripts.getListValuesFromNote(siteURL, sourceName);
    retVal = getDataSourceBindingList(bindingsArray, 
                                      DATASOURCELEAF_FILENAME,
                                      true,
                                      "URL.htm");
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
  var retStr = extPart.getInsertString("", "URL_DataRef", paramObj);

  // We need to strip the cfoutput tags if we are inserting into a CFOUTPUT tag
  // or binding to the attributes of a ColdFusion tag.
  if (dwscripts.canStripCfOutputTags(dropObject, true))
  {
    retStr = dwscripts.stripCFOutputTags(retStr, true);
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
    var params = extPart.findInString("URL_DataRef", expression);
    if (params)
    {
      retArray[0] = params.sourceName;
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
    if (sourceName != "URL")
    {
      sourceName = "URL";
    }

    dwscripts.deleteListValueFromNote(siteURL, sourceName, bindingName);
  }
}
