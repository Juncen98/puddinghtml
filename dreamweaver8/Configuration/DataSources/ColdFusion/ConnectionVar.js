// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//************** GLOBALS VARS *****************

var CONNECTIONVAR_FILENAME = "REQ_D.gif";
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
//   defaultName - string - (optional) name to display
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function addDynamicSource(defaultName)
{
  var retVal = false;
  
  var siteURL = dw.getSiteRoot();
  if (siteURL.length)
  {
    var currList = dwscripts.getListValuesFromNote(siteURL,"ConnectionVar");
    var nameList = new Array();
    for (var i=0; i < currList.length; i++)
    {
      nameList.push(currList[i].split(";")[0]);
    }
    
    var args = new Object();
    args.defaultName = defaultName;
    args.nameList = nameList;
    
    var info = dwscripts.callCommand("ConnectionVariable", args);
    if (info)
    {
      var success = dwscripts.addListValueToNote(siteURL, "ConnectionVar", info.name + ";" + info.dataSource, true);
      if (success)
      {
        retVal = true;
      }
    }
  }
  else
  {
    alert(MM.MSG_DefineSite);
  }
  
  return retVal;
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
    var bindingsArray = dwscripts.getListValuesFromNote(siteURL, "ConnectionVar");
    if (bindingsArray.length > 0)
    {
      retList.push(new DataSource(MM.LABEL_ConnectionVar, 
                                  CONNECTIONVAR_FILENAME, 
                                  false, 
                                  "ConnectionVar.htm"))
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
  if (siteURL.length)
  {
    var bindingsArray = dwscripts.getListValuesFromNote(siteURL, "ConnectionVar");
    
    for (var i=0; i < bindingsArray.length; i++)
    {
      var info = bindingsArray[i].split(";");
      
      if (info && info.length == 2)
      {
        retVal.push(new DataSource(info[0],DATASOURCELEAF_FILENAME,true,"ConnectionVar.htm",info[1]));
      }
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
  var retStr = extPart.getInsertString("", "ConnectionVar_DataRef", paramObj);

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
    var params = extPart.findInString("ConnectionVar_DataRef", expression);
    if (params)
    {
      retArray[0] = MM.LABEL_ConnectionVar;
      retArray[1] = params.bindingName;
    }
  }
    
  return retArray;
}


//--------------------------------------------------------------------
// FUNCTION:
//   editDynamicSource
//
// DESCRIPTION:
//   edits a dynamic source from the document.
//
// ARGUMENTS:
//   sourceName - a data source name
//   bindingName - one of the bindings for that data source
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function editDynamicSource(sourceName, bindingName)
{
  retVal = false;
  
  var siteURL = dw.getSiteRoot();      
  if (siteURL.length && bindingName)
  {
    var bindingsArray = dwscripts.getListValuesFromNote(siteURL, "ConnectionVar");
    var index = dwscripts.findInArray(bindingsArray, bindingName,
         new Function ("arrayVal, searchVal","return (arrayVal.indexOf(searchVal) == 0);"));
    if (index != -1)
    {
      var info = bindingsArray[index].split(";");
      
      if (info.length >= 2)
      {      
        var args = new Object();
        args.name = info[0];
        args.dataSource = info[1];

        var info = dwscripts.callCommand("ConnectionVariable", args);
        if (info)
        {
          dwscripts.deleteListValueFromNote(siteURL, "ConnectionVar", bindingsArray[index]);
          var success = dwscripts.addListValueToNote(siteURL, "ConnectionVar", info.name + ";" + info.dataSource, true);
          if (success)
          {
            retVal = true;
          }
        }
      }
    }
  }
  
  return retVal;
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
    var bindingsArray = dwscripts.getListValuesFromNote(siteURL, "ConnectionVar");
    var index = dwscripts.findInArray(bindingsArray, bindingName,
         new Function ("arrayVal, searchVal","return (arrayVal.indexOf(searchVal) == 0);"));
    if (index != -1)
    {
      dwscripts.deleteListValueFromNote(siteURL, "ConnectionVar", bindingsArray[index]);
    }
  }
}
