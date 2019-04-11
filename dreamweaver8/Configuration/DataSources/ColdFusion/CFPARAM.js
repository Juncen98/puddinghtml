// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//*************** GLOBALS VARS *****************

var CFPARAM_FILENAME = "REQ_D.gif";
var CFPARAM_LEAF_FILENAME = "DSL_D.gif";


//******************* API **********************


//--------------------------------------------------------------------
// FUNCTION:
//   addDynamicSource
//
// DESCRIPTION:
//   Displays the Recordset Server Behavior dialog
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function addDynamicSource()
{
  dw.popupServerBehavior("CFParam.htm");
}


//--------------------------------------------------------------------
// FUNCTION:
//   findDynamicSource
//
// DESCRIPTION:
//   Called by UD to locate instances of this data source on the page.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   A list of object with two attributes.  
//   The title to display, and the icon to display.
//--------------------------------------------------------------------

function findDynamicSources()
{
  var retList = new Array();
  
  var sbObjs = dwscripts.getServerBehaviorsByFileName("CFParam.htm");

  if (sbObjs.length > 0)
  {
    var dataSource = new DataSource(CFPARAM_TITLE, CFPARAM_FILENAME, false, "CFPARAM.htm", "");
    
    retList.push(dataSource);
  }

  return retList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   generateDynamicSourceBindings
//
// DESCRIPTION:
//   Given a one of the title strings returned from findDynamicSource,
//   this function returns the source bindings associated with that
//   Recordset
//
// ARGUMENTS:
//   sourceName - One of the title strings returned in findDynamicSource
//
// RETURNS:
//   Returns a list of bindings for the given elementName
//--------------------------------------------------------------------

function generateDynamicSourceBindings(sourceName)
{
  var retList = new Array();
  
  var sbObjs = dwscripts.getServerBehaviorsByFileName("CFParam.htm");

  for (var i=0; i < sbObjs.length; i++)
  {
    var dataSource = new DataSource(sbObjs[i].getParameter("ParamName"), CFPARAM_LEAF_FILENAME, true, "CFPARAM.htm", "");
    
    retList.push(dataSource);
  }

  return retList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   generateDynamicDataRef
//
// DESCRIPTION:
//   Returns a dynamic binding string for the given source and binding
//
// ARGUMENTS: 
//   sourceName - the name of a data source
//   bindingName - the name of a binding within that source
//
// RETURNS:
//   Returns a dynamic binding string
//--------------------------------------------------------------------

function generateDynamicDataRef(sourceName, bindingName, dropObject)
{
  var retVal = "";
  
  var sbObj = getServerBehaviorByParamName(bindingName);

  if (sbObj)
  {
    var paramObj = new Object();
    paramObj.bindingName = bindingName;

    retVal = extPart.getInsertString("", "CFParam_DataRef", paramObj);
  }
  
  // We need to strip the cfoutput tags if we are inserting into a CFOUTPUT tag
  // or binding to the attributes of a ColdFusion tag.
  if (dwscripts.canStripCfOutputTags(dropObject, true))
  {
    retVal = dwscripts.stripCFOutputTags(retVal, true);
  } 

  return retVal;
}



//--------------------------------------------------------------------
// FUNCTION:
//   inspectDynamicDataRef
//
// DESCRIPTION:
//   Inspects a dynamic binding string and returns a pair of 
//   source and binding names.
//
// ARGUMENTS: 
//   expression - a dynamic binding string
//
// RETURNS:
//   An array of two items.
//   The source name, and the binding name for the given string.
//--------------------------------------------------------------------

function inspectDynamicDataRef(expression)
{
  var retVal = new Array();

  if (expression.length)
  {    
    var params = extPart.findInString("CFParam_DataRef", expression);
    if (params && params.bindingName)
    {
      // search for params.bindingName within the SBs
      var sbObjs = dwscripts.getServerBehaviorsByFileName("CFParam.htm");

      for (var i=0; i < sbObjs.length; i++)
      {
        if (sbObjs[i].getParameter("ParamName").toUpperCase() == params.bindingName.toUpperCase())
        {
          retVal.push(CFPARAM_TITLE);
          retVal.push(params.bindingName);
          break;
        }
      }

    }          
  }
  
  return retVal;
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
  var retVal = false;
  
  var sbObj = getServerBehaviorByParamName(bindingName);
  
  if (sbObj)
  {
	  dw.popupServerBehavior(sbObj);
    retVal = true;
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
//   sourceName - a data source name
//   bindingName - one of the bindings for that data source
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function deleteDynamicSource(sourceName, bindingName)
{
  var sbObj = getServerBehaviorByParamName(bindingName);
  
  if (sbObj)
  {
    dw.serverBehaviorInspector.deleteServerBehavior(sbObj);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   getServerBehaviorByParamName
//
// DESCRIPTION:
//   Returns the server behavior object that cooresponds to the
//   given cfparam name
//
// ARGUMENTS:
//   paramName - string - the parameter name to locate
//
// RETURNS:
//   server behavior object
//--------------------------------------------------------------------

function getServerBehaviorByParamName(paramName)
{
  retVal = null;
  
  var sbObjs = dwscripts.getServerBehaviorsByFileName("CFParam.htm");
  
  for (var i=0; i < sbObjs.length; i++)
  {
    if (sbObjs[i].getParameter("ParamName") == paramName)
    {
      retVal = sbObjs[i];
      break;
    }
  }
  
  return retVal;
}