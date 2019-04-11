// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

var STOREDPROC_FILENAME = "SP_D.gif"
var DATASOURCE_LEAF_FILENAME = "DSL_D.gif"

//--------------------------------------------------------------------
// FUNCTION:
//   addDynamicSource
//
// DESCRIPTION:
//   Displays the Stored Procedure Server Behavior dialog
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function addDynamicSource()
{
  dw.popupServerBehavior("StoredProc.htm");
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
//   array of objects with five properties: title, imageFile, allowDelete,
//   dataSource, and name. 
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
    
    var sbObjs = dwscripts.getServerBehaviorsByFileName("StoredProc.htm");

    for (var i = 0; i < sbObjs.length; i++)
    {
      // Note that the recordset datasource will handle creating datasources
      //   for recordsets returned from stored procs.
 
      // Add a datasource if the stored proc has any Output, 
	  // InputOutput or ReturnValue parameters
      
	  var callParams = new Array();
	  var sproc = sbObjs[i].getDatabaseCall(callParams);

      for (var j = 0; j < callParams.length; ++j)
      {
        var varDirection = callParams[j].direction.toUpperCase();
         
		if ((varDirection.indexOf("OUTPUT") != (-1)) || 
		    (varDirection.indexOf("RETURNVALUE") != (-1)))
        {
          retList.push(new DataSource(sbObjs[i].getTitle(),
                                      STOREDPROC_FILENAME, 
                                      true,
											                "StoredProc.htm", ""));
	      break;
        }
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
//   Stored Procedure.
//
// ARGUMENTS:
//   sourceName - One of the title strings returned in findDynamicSource
//
// RETURNS:
//   Returns a list of bindings for the given sourceName
//--------------------------------------------------------------------

function generateDynamicSourceBindings(sourceName)
{
  var retList = new Array();

  // find the sbobj for the stored proc

  var sbObjs = dwscripts.getServerBehaviorsByTitle(sourceName);

  if (sbObjs && sbObjs.length)
  {
    // Add a binding for each "Output", "InputOutput" or "ReturnValue" parameter

    var callParams = new Array();
    
	sbObjs[0].getDatabaseCall(callParams);
    
    for (var j = 0; j < callParams.length; ++j)
    {
      var varDirection = callParams[j].direction.toUpperCase();
    
      if ((varDirection.indexOf("OUTPUT") != (-1)) || 
		  (varDirection.indexOf("RETURNVALUE") != (-1)))
      {
        retList.push(new DataSourceBinding(callParams[j].name,
                                           DATASOURCE_LEAF_FILENAME, 
                                           false,
											                     "StoredProc.htm", ""));
      }
    }
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

function generateDynamicDataRef(sourceName,bindingName)
{
  var retVal = "";
  var sbObjs = dwscripts.getServerBehaviorsByTitle(sourceName);
  
  if (sbObjs && sbObjs.length)
  {
    var paramObj = new Object();
    
	paramObj.sourceName = sbObjs[0].getRecordsetName();
	paramObj.bindingName = bindingName;
    
	retVal = extPart.getInsertString("", "StoredProc_DataRef", paramObj);
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
  var retVal = null; 

  if (expression.length)
  {
    var params = extPart.findInString("StoredProc_DataRef", expression);
    
    if (params)
    {
      // Find the original stored procedure that uses the parameter
      //   refered to in this expression.
      
	  var sbObjs = dwscripts.getServerBehaviorsByFileName("StoredProc.htm");
      var bFoundParent = false;
      
	  for (var i = 0; !bFoundParent && (i < sbObjs.length); i++)
      {
 		var callParams = new Array();
        
		sbObjs[i].getDatabaseCall(callParams);
        
		for (var j = 0; !bFoundParent && (j < callParams.length); ++j)
        {
           var varDirection = callParams[j].direction.toUpperCase();
           
		   if (((varDirection.indexOf("OUTPUT") != (-1)) || 
		        (varDirection.indexOf("RETURNVALUE") != (-1))) &&
                (callParams[j].name.toUpperCase() == params.bindingName.toUpperCase()))
          {
            // Note that it's possible two stored procedures reference the same 
            //   output parameter. If this is the case, we'll just take the first.
            
			bFoundParent = true;
          }
        }
        
        // Build return array if we've found the correct stored proc object.

        if (bFoundParent)
        {
          retVal = new Array();
          retVal[0] = sbObjs[i].getTitle();
          retVal[1] = params.bindingName;
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

function deleteDynamicSource(sourceName,bindingName)
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

