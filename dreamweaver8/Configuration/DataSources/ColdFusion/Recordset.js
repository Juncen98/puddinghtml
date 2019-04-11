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
      if (sbObjs[i].getSQLForRecordsetBindings())
      {
        var dataSource = new DataSource(sbObjs[i].getTitle(), RECORDSET_FILENAME, true, 
                               "Recordset.htm", sbObjs[i].getRecordsetName());
        retList.push(dataSource);
      }
    }

    // The stored procedures on the page may return a recordset. Add a datasource for
    //   each recordset returned from a stored procedure.
    var sbObjs = dwscripts.getServerBehaviorsByFileName("CFStoredProc.htm");
    for (var i=0; i < sbObjs.length; i++)
    {
      var rsName = sbObjs[i].getRecordsetName();
      if (rsName)
      {
        var dataSource = new DataSource(dwscripts.sprintf(MM.LABEL_StoredProcRecordset, rsName),  
                                  RECORDSET_FILENAME, true, "Recordset.htm", rsName);
        dataSource.isStoredProc = true;
        retList.push(dataSource);
      }
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
  var sbObj = null;
  
  // First check if this recordset datasource is returned from a stored procedure. If so,
  //   get the stored procedure SB object which returns the recordset. Otherwise,
  //   just grab the associated recordset SB. 
  sbObj = getStoredProcedureFromDSTitle(sourceName);
  if (!sbObj)
  {
    var sbObjs = dwscripts.getServerBehaviorsByTitle(sourceName);
    if (sbObjs.length > 0) 
    {
      sbObj = sbObjs[0];
    }
  }
  
  if (sbObj) 
  {
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
  var sbObj = null;
  
  // First check if this recordset datasource is returned from a stored procedure. If so,
  //   get the stored procedure SB object which returns the recordset. Otherwise,
  //   just grab the associated recordset SB. 
  sbObj = getStoredProcedureFromDSTitle(sourceName);
  if (!sbObj)
  {
    var sbObjs = dwscripts.getServerBehaviorsByTitle(sourceName);
    if (sbObjs.length > 0) 
    {
      sbObj = sbObjs[0];
    }
  }

  if (sbObj)
  {
    var paramObj = new Object();
    paramObj.sourceName = sbObj.getRecordsetName();
    paramObj.bindingName = bindingName;

    retVal = extPart.getInsertString("", "Recordset_DataRef", paramObj);
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
    var params = extPart.findInString("Recordset_DataRef", expression);
    if (params)
    {
      // Find the original sbObject. Note that we look through recordsets and
      //   stored procs since stored procs can return a recordset too.
      var sbObjs = dwscripts.getServerBehaviorsByFileName("Recordset.htm");
      sbObjs = sbObjs.concat(dwscripts.getServerBehaviorsByFileName("CFStoredProc.htm"));
      for (var i=0; i < sbObjs.length; i++)
      {
        if (sbObjs[i].getRecordsetName() == params.sourceName)
        {
          // Use different title if recordset vs. storedproc recordset.
          retVal[0] = (!sbObjs[i].isCallObject()) ? sbObjs[i].getTitle()
                    : dwscripts.sprintf(MM.LABEL_StoredProcRecordset, params.sourceName);
          retVal[1] = params.bindingName;
          break;
        }
      }
    }          
  }
  
  return retVal;
}


//*-------------------------------------------------------------------
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
  var bHandled = false;
  var sbObj = getStoredProcedureFromDSTitle(sourceName);
  if (!sbObj)
  {
    var sbObjs = dwscripts.getServerBehaviorsByTitle(sourceName);
  
    if (sbObjs.length > 0) 
    {
      sbObj = sbObjs[0];
    }
  }

  if (sbObj)
  {
	dreamweaver.popupServerBehavior(sbObj);  
	bHandled = true;
  }
  return bHandled;
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
  var sbObj = null;

  // First check if this recordset datasource is returned from a stored procedure. If so,
  //   get the stored procedure SB object which returns the recordset. Otherwise,
  //   just grab the associated recordset SB. 
  sbObj = getStoredProcedureFromDSTitle(sourceName);
  if (!sbObj)
  {
    var sbObjs = dwscripts.getServerBehaviorsByTitle(sourceName);
    if (sbObjs.length > 0) 
    {
      sbObj = sbObjs[0];
    }
  }

  if (sbObj && !bindingName)
  {
    // If this is a recordset from a stored procedure, deleting it will delete
    //   the stored procedure as well. Warn the user about this to make sure this
    //   is the desired action.
    var continueDelete = true;
    if (sbObj.isCallObject())
    {
      var callParams = new Array();
      var storedProcName = sbObj.getDatabaseCall(callParams);
	  var displayName = dwscripts.getRecordsetDisplayName();
      continueDelete = confirm(dwscripts.sprintf(MM.MSG_WarnDelParentStoredProc, 
                                                 displayName,
												 storedProcName,
												 displayName));
    }

    if (continueDelete)
    {
      dw.serverBehaviorInspector.deleteServerBehavior(sbObj);
    }
  }
  else if (bindingName) 
  {
    alert(MM.MSG_CantDelColumn);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   getStoredProcedureFromDSTitle
//
// DESCRIPTION:
//   Recordset datasources may come from a regular recordset or from a stored
//   procedure that returns a recordset. If it is the latter, this function
//   returns the stored procedure object that returns the recordset given
//   the sourceName.
//
// ARGUMENTS:
//   sourceName - a data source name
//
// RETURNS:
//   CFStoredProc - stored proc server behavior object. null if this is not a 
//     recordset returned from a stored procedure.
//--------------------------------------------------------------------

function getStoredProcedureFromDSTitle(sourceName)
{
  var storedProc = null;

  var rsNameRegExp = /\(([\w\.]+)\)/;
  rsNameRegExp.exec(sourceName);
  var rsName = RegExp.$1;

  if (rsName)
  {
    var sbObjs = dwscripts.getServerBehaviorsByFileName("CFStoredProc.htm");
    for (var i = 0; (i < sbObjs.length) && (storedProc == null); i++)
    {
      if (sbObjs[i].getRecordsetName() == rsName)
      {
        storedProc = sbObjs[i];
      }
    }
  }

  return storedProc;
}
