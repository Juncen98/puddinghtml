// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//*************** GLOBALS VARS *****************

var RECORDSET_FILENAME = "RS_D.gif";
var DATASOURCELEAF_FILENAME = "DSL_D.gif";


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
  dw.popupServerBehavior("Recordset.htm");
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
  
  var dom = dreamweaver.getDocumentDOM();
  if (dom)
  {
    var fileURL = dom.URL;

    if (fileURL.length)
    {
      dwscripts.copyDesignNotesFromTempURL();
    }
    
    var sbObjs = dwscripts.getServerBehaviorsByFileName("Recordset.htm");
    for (var i=0; i < sbObjs.length; i++)
    {
      retList.push(new DataSource(sbObjs[i].getTitle(), RECORDSET_FILENAME, true, "Recordset.htm", sbObjs[i].getRecordsetName()));
    }
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

  var sbObjs = dwscripts.getServerBehaviorsByTitle(sourceName);
  
  if (sbObjs.length > 0) 
  {
    var sbObj = sbObjs[0];
    
    var bindingsArray = new Array();

    //Try to retrieve the information from database
    var bindingsAndTypeArray = sbObj.getRecordsetBindings();

    //pull out only the binding information
    for (var i=0; i < bindingsAndTypeArray.length; i+=2) 
    {
      bindingsArray.push(bindingsAndTypeArray[i]);
    }
      
    retList = getDataSourceBindingList(bindingsArray, DATASOURCELEAF_FILENAME, false, "Recordset.htm");
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

  var sbObjs = dwscripts.getServerBehaviorsByTitle(sourceName);
  
  if (sbObjs.length > 0)
  {
    var sbObj = sbObjs[0];
    
    var paramObj = new Object();
    paramObj.sourceName = sbObj.getRecordsetName();
    paramObj.bindingName = bindingName;

    retVal = extPart.getInsertString("", "Recordset_DataRef", paramObj);

    // If the string is being inserted inside a script block, strip the
    // script delimiters.
    if (dwscripts.canStripScriptDelimiters(dropObject))
      retVal = dwscripts.stripScriptDelimiters(retVal);
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
    var params = extPart.findInString("Recordset_DataRef", expression);
    if (params)
    {
      //find the original sbObject
      var sbObjs = dwscripts.getServerBehaviorsByFileName("Recordset.htm");
      for (var i=0; i < sbObjs.length; i++)
      {
        if (sbObjs[i].getRecordsetName() == params.sourceName)
        {
          retVal[0] = sbObjs[i].getTitle();
          retVal[1] = params.bindingName;
          break;
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
//   sourceName - a data source name
//   bindingName - one of the bindings for that data source
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function deleteDynamicSource(sourceName, bindingName)
{
  var sbObjs = dwscripts.getServerBehaviorsByTitle(sourceName);

  if (sbObjs.length > 0 && !bindingName)
  {
    dw.serverBehaviorInspector.deleteServerBehavior(sbObjs[0]);
  }
  else if (bindingName) 
  {
    alert(MM.MSG_CantDelColumn);
  }
  
}

