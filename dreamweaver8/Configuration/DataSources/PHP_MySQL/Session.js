// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.


//************** GLOBALS VARS *****************

var SESSION_FILENAME = "SES_D.gif"; 
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
  MM.sessionContents = "";
  dw.popupCommand("Session Variable");

  if (MM.retVal == "OK")
  {
    var theResponse = MM.sessionContents;

    if (theResponse.length)
    {
      var siteURL = dw.getSiteRoot();
      if (siteURL.length)
      {
        dwscripts.addListValueToNote(siteURL, "Session", theResponse);   
      }
      else
      {
        alert(MM.MSG_DefineSite);
      }
    }
    else 
    {
      alert(MM.MSG_DefineSession);
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
    var bindingsArray = dwscripts.getListValuesFromNote(siteURL, "Session");
    if (bindingsArray.length > 0)
    {
      retList.push(new DataSource(MM.LABEL_Session, 
                                  SESSION_FILENAME, 
                                  false, 
                                  "Session.htm"))
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
  if (sourceName != "Session")
  {
    sourceName = "Session";
  }

  if (siteURL.length)
  {
    var bindingsArray = dwscripts.getListValuesFromNote(siteURL, sourceName);
    retVal = getDataSourceBindingList(bindingsArray, 
                                      DATASOURCELEAF_FILENAME,
                                      true,
                                      "Session.htm");

    // Add the variable names to a code hints menu
    dw.codeHints.resetMenu("CodeHints_Object_Methods", "$HTTP_SESSION_VARS['", "PHP_MySQL");
    dw.codeHints.resetMenu("CodeHints_Object_Methods", "$_SESSION['", "PHP_MySQL");
    if (bindingsArray.length > 0)
    {
      dw.codeHints.addMenu("CodeHints_Object_Methods","$HTTP_SESSION_VARS['",
        bindingsArray, bindingsArray, "shared/mm/images/hintMisc.gif", 
        "PHP_MySQL");

      dw.codeHints.addMenu("CodeHints_Object_Methods","$_SESSION['",
        bindingsArray, bindingsArray, "shared/mm/images/hintMisc.gif", 
        "PHP_MySQL");
    }
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
  var retStr = extPart.getInsertString("", "Session_DataRef", paramObj);

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
    var params = extPart.findInString("Session_DataRef", expression);
    if (params)
    {
      retArray[0] = "Session";
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
    if (sourceName != "Session")
    {
      sourceName = "Session";
    }

    dwscripts.deleteListValueFromNote(siteURL, sourceName, bindingName);
  }
}
