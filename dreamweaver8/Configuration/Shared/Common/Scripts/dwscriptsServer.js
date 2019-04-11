//SHARE-IN-MEMORY=true

// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   dwscripts (Server Model specific functions)
//
// DESCRIPTION:
//   This file is a continuation of the dwscripts namespace, with
//   functions specific to Server Models.
//
// PUBLIC PROPERTIES:
//   TBD
//
// PUBLIC FUNCTIONS:
//   TBD
//--------------------------------------------------------------------

// Static Properties

dwscripts.DB_COLUMN_ENUM_MAP = null;
dwscripts.DB_COLUMN_STRING_MAP = null;

dwscripts.SQL_RESERVED_WORDS = null;


// Static Methods

//server model
dwscripts.hasServerModel = dwscripts_hasServerModel;
dwscripts.getServerModel = dwscripts_getServerModel;

dwscripts.getServerImplObject = dwscripts_getServerImplObject;

//recordset information
dwscripts.getRecordsetNames = dwscripts_getRecordsetNames;
dwscripts.getFieldNames = dwscripts_getFieldNames;

//server behavior objects
dwscripts.getServerBehaviorsByFileName = dwscripts_getServerBehaviorsByFileName;
dwscripts.getServerBehaviorsByTitle = dwscripts_getServerBehaviorsByTitle;
dwscripts.getServerBehaviorByParam = dwscripts_getServerBehaviorByParam;

//data source objects
dwscripts.getDataSourcesByFileName = dwscripts_getDataSourcesByFileName;
dwscripts.getDataSourcesForSB = dwscripts_getDataSourcesForSB;
dwscripts.getDataSourceNames = dwscripts_getDataSourceNames;
dwscripts.getDataSourceTypes = dwscripts_getDataSourceTypes;
dwscripts.getDataSourceNodes = dwscripts_getDataSourceNodes;

dwscripts.popupDataSource = dwscripts_popupDataSource;

//dynamic expression
dwscripts.decodeDynamicExpression = dwscripts_decodeDynamicExpression;
dwscripts.encodeDynamicExpression = dwscripts_encodeDynamicExpression;

dwscripts.hasServerMarkup = dwscripts_hasServerMarkup;
dwscripts.trimServerMarkup = dwscripts_trimServerMarkup;

//cold fusion specific
dwscripts.canStripCfOutputTags = dwscripts_canStripCfOutputTags;
dwscripts.stripCFOutputTags = dwscripts_stripCFOutputTags;

//similar functions for all other server models
dwscripts.canStripScriptDelimiters = dwscripts_canStripScriptDelimiters;
dwscripts.stripScriptDelimiters = dwscripts_stripScriptDelimiters;

//variables
dwscripts.isValidServerVarName = dwscripts_isValidServerVarName;
dwscripts.isReservedWord = dwscripts_isReservedWord;

//SQL functions
dwscripts.isSQLReservedWord = dwscripts_isSQLReservedWord;
dwscripts.encodeSQLTableRef = dwscripts_encodeSQLTableRef;
dwscripts.encodeSQLColumnRef = dwscripts_encodeSQLColumnRef;
dwscripts.decodeSQLTableRef = dwscripts_decodeSQLTableRef;
dwscripts.decodeSQLColumnRef = dwscripts_decodeSQLColumnRef;

dwscripts.escSQLQuotes = dwscripts_escSQLQuotes;
dwscripts.unescSQLQuotes = dwscripts_unescSQLQuotes;

dwscripts.escServerQuotes = dwscripts_escServerQuotes;
dwscripts.unescServerQuotes = dwscripts_unescServerQuotes;

//database column types
dwscripts.getDBColumnTypeEnum = dwscripts_getDBColumnTypeEnum;
dwscripts.getDBColumnTypeAsString = dwscripts_getDBColumnTypeAsString;
dwscripts.getSQLStringForDBColumnType = dwscripts_getSQLStringForDBColumnType;

dwscripts.isNumericDBColumnType = dwscripts_isNumericDBColumnType;
dwscripts.isIntegerDBColumnType = dwscripts_isIntegerDBColumnType;
dwscripts.isDoubleDBColumnType  = dwscripts_isDoubleDBColumnType;
dwscripts.isStringDBColumnType = dwscripts_isStringDBColumnType;
dwscripts.isBinaryDBColumnType = dwscripts_isBinaryDBColumnType;
dwscripts.isDateDBColumnType = dwscripts_isDateDBColumnType;
dwscripts.isBooleanDBColumnType = dwscripts_isBooleanDBColumnType;
dwscripts.isCurrencyDBColumnType = dwscripts_isCurrencyDBColumnType;

//connections
dwscripts.getConnectionURL = dwscripts_getConnectionURL;
dwscripts.getTableNames = dwscripts_getTableNames;

//recordset names
dwscripts.getRecordsetDisplayName = dwscripts_getRecordsetDisplayName;
dwscripts.getRecordsetBaseName = dwscripts_getRecordsetBaseName;

//repeat region
dwscripts.getPageNavDisplaySBs = dwscripts_getPageNavDisplaySBs;
dwscripts.warnIfNoPageNavDisplay = dwscripts_warnIfNoPageNavDisplay;
dwscripts.getRecordsetNameWithPageNav = dwscripts_getRecordsetNameWithPageNav;
dwscripts.canInsertPageNavDisplay = dwscripts_canInsertPageNavDisplay;

//column value node
dwscripts.getColumnValueList = dwscripts_getColumnValueList;
dwscripts.getColumnValueNode = dwscripts_getColumnValueNode;

//parameter type
dwscripts.getParameterTypeFromCode = dwscripts_getParameterTypeFromCode;
dwscripts.getParameterCodeFromType = dwscripts_getParameterCodeFromType;
dwscripts.getParameterExpressionFromType = dwscripts_getParameterExpressionFromType;
dwscripts.getParameterTypeFromExpression = dwscripts_getParameterTypeFromExpression;
dwscripts.getParameterSyntaxFromType = dwscripts_getParameterSyntaxFromType;
dwscripts.getParameterTypeArray = dwscripts_getParameterTypeArray;
dwscripts.getTernaryStatement = dwscripts_getTernaryStatement;
dwscripts.getParameterAsInteger = dwscripts_getParameterAsInteger;
dwscripts.getNullToken = dwscripts_getNullToken;
dwscripts.getEqualsStatement = dwscripts_getEqualsStatement;

//connection variables
dwscripts.getCFDataSourceName = dwscripts_getCFDataSourceName;


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.hasServerModel
//
// DESCRIPTION:
//   Returns true if the given document has a server model.  If no
//   DOM is provided, the current document is used.
//
// ARGUMENTS:
//   dom - DOM object - (optional) the dom to check for a server model
//
// RETURNS:
//   boolean - true if the given page has a server model, 
//             false if it doesn't
//--------------------------------------------------------------------

function dwscripts_hasServerModel(dom)
{
  var theDOM = (dom) ? dom:dw.getDocumentDOM();
  
  var retVal = (theDOM.serverModel.getFolderName() != "");
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getServerModel
//
// DESCRIPTION:
//   Returns the server model folder name for the given document.  
//   If no DOM is provided, the current document is used.
//
// ARGUMENTS:
//   dom - DOM object - (optional) the dom to get the server model for.
//
// RETURNS:
//   String - the server model of the current document, or empty
//            string if not server model is set
//--------------------------------------------------------------------

function dwscripts_getServerModel(dom)
{
  var theDOM = (dom) ? dom:dw.getDocumentDOM();
  
  var retVal = theDOM.serverModel.getFolderName();
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getServerImplObject
//
// DESCRIPTION:
//   Returns the window object for the server model specific
//   implementation of the functions in this file.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   window object of the implementation file
//--------------------------------------------------------------------

function dwscripts_getServerImplObject()
{
  var retVal = null;
  var dom = dw.getDocumentDOM();
  
  if (dom)
  {
    var serverInfo = dom.serverModel.getServerInfo();

    if (serverInfo)
    {
      if (serverInfo.implObject != null)
      {
        retVal = serverInfo.implObject;
      }
      else
      {
        var folderName = dom.serverModel.getFolderName();
        if (folderName)
        {
          var implPath = dw.getConfigurationPath() + "/ServerModels/" + 
                         folderName + 
                         "/dwscriptsServerImpl.htm";
                        
          if (dwscripts.fileExists(implPath))
          {
            var implDOM = dw.getDocumentDOM(implPath);
            if (implDOM)
            {
              serverInfo.implObject = implDOM.parentWindow;
              retVal = serverInfo.implObject
            }
          }
          else
          {
            alert(dwscripts.sprintf("ERROR: server model implementation file missing: %s",implPath));
          }
        }
      }
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getRecordsetNames
//
// DESCRIPTION:
//   Returns a list of the current recordset names in the document.
//
//   NOTE:
//     This function is backwards compatible with older server models
//     by defining the findAllRecordsets function in the Server Model
//     HTML file.
//
// RETURNS:
//   JavaScript array of recordset names
//--------------------------------------------------------------------

function dwscripts_getRecordsetNames(dontIncludeStoredProcRS)
{
  var retVal = new Array();
  
  // Use the Server Model version if it exists
  var serverObj = dwscripts.getServerImplObject();
  
  if (serverObj != null && serverObj.getRecordsetNames != null)
  {
    retVal = serverObj.getRecordsetNames(dontIncludeStoredProcRS);
  }
  else
  {
    var dsList = dwscripts.getDataSourcesByFileName("Recordset.htm");
    
    if (dontIncludeStoredProcRS)
    {
      for (var i=dsList.length-1; i >= 0; i--)
      {
        if (dsList[i].isStoredProc)
        {
          dsList.splice(i,1);
        }
      }
    }
    
    retVal = dwscripts.getDataSourceNames(dsList);
    
  }
  
  // Remove any macromedia specific recordsets
  for (var i=retVal.length-1; i >= 0; i--)
  {
    if (retVal[i].indexOf("MM_") == 0) 
    {
      retVal.splice(i,1);
    }
  }

  return retVal;
}



//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getFieldNames
//
// DESCRIPTION:
//   Returns an array of the field names for the given data source.
//
// ARGUMENTS:
//   dataSourceName - string - the name of the data source
//
// RETURNS:
//   JavaScript array of strings
//--------------------------------------------------------------------

function dwscripts_getFieldNames(dataSourceName)
{
  var retVal = new Array();
  
  // Use the Server Model version if it exists
  var serverObj = dwscripts.getServerImplObject();
  
  if (serverObj != null && serverObj.getFieldNames != null)
  {
    retVal = serverObj.getFieldNames(dataSourceName);
  }
  else
  {  
    // handle prior versions
    if (serverObj != null && serverObj.getColumnNames != null)
    {
      var dsList = serverObj.getColumnNames(dataSourceName);

      // findAllColumnNames returns data source objects, convert to strings
      for (var i=0; i < dsList.length; i++)
      {
        retVal.push(dsList[i].title);
      }
    }
    
    if (retVal == null || retVal.length == 0)
    {
      var serverModelFolder = dw.getDocumentDOM().serverModel.getFolderName();

      //ask dreamweaver for the list of data sources
      var dsList = dw.dbi.getDataSources();

      //find the data source with the given name
      for (var i=0; i < dsList.length; i++) 
      {
        if (dsList[i].name == dataSourceName || dsList[i].title == dataSourceName) 
        {
          var dataSource = dsList[i].dataSource;

          //get the dom of the data source
          var dsDOM = dreamweaver.getDocumentDOM(dreamweaver.getConfigurationPath() + "/DataSources/" + serverModelFolder + "/" + dataSource);

          //call the generateDynamicSourceBindings function
          if (dsDOM) 
          {
            objList = dsDOM.parentWindow.generateDynamicSourceBindings(dsList[i].title);
            if (objList && objList.length) 
            {
              for (var j=0; j < objList.length; j++) 
              {
                retVal.push(objList[j].title);
              }
            }
          }

          break;
        }
      }
    }
  }
  
  // Remove the statistics from the list
  for (var i=retVal.length-1; i >= 0; i--)
  {
    var value = retVal[i];
    if (value == MM.LABEL_FirstRecordIndex ||
        value == MM.LABEL_LastRecordIndex  ||
        value == MM.LABEL_TotalRecordIndex)
    {
      retVal.splice(i,1);
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getServerBehaviorsByFileName
//
// DESCRIPTION:
//   Returns all of the ServerBehavior objects which have the given
//   Server Behavior name.  This function makes it easy to retrieve
//   all of the ServerBehavior objects created by a given
//   Server Behvaior.
//
// ARGUMENTS:
//   sbFileName - string - the Server Behavior file name to look for
//
// RETURNS:
//   JavaScript Array - the ServerBehavior objects with the given
//      SB file name
//--------------------------------------------------------------------

function dwscripts_getServerBehaviorsByFileName(sbFileName)
{
  var retVal = new Array();

  var allSBObjs = dw.serverBehaviorInspector.getServerBehaviors();

  for (var i=0; i < allSBObjs.length; i++)
  {
     if (allSBObjs[i].getServerBehaviorFileName &&
    (allSBObjs[i].getServerBehaviorFileName().indexOf(sbFileName) == 0))
    {
      retVal.push(allSBObjs[i]);
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getServerBehaviorsByTitle
//
// DESCRIPTION:
//   Returns all of the ServerBehavior objects which have the given
//   title.
//
// ARGUMENTS:
//   theTitle - string - the title of the server behavior to look for
//
// RETURNS:
//   JavaScript Array - the ServerBehavior objects with the given title
//--------------------------------------------------------------------

function dwscripts_getServerBehaviorsByTitle(theTitle)
{
  var retVal = new Array();

  var allSBObjs = dw.serverBehaviorInspector.getServerBehaviors();

  for (var i=0; i < allSBObjs.length; i++)
  {
    if (allSBObjs[i].getTitle &&
     (allSBObjs[i].getTitle() == theTitle))
   {
      retVal.push(allSBObjs[i]);
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getServerBehaviorByParam
//
// DESCRIPTION:
//   Returns all of the ServerBehavior objects which have the given
//   Server Behavior name.  This function makes it easy to retrieve
//   all of the ServerBehavior objects created by a given
//   Server Behvaior.
//
// ARGUMENTS:
//   sbFileName - string - the Server Behavior file name to look for
//   paramName - string - the name of the parameter to search for
//   paramValue - string - the parameter value to match
//   ignoreCase - boolean - true if case should not be considered in
//     the match
//
// RETURNS:
//   JavaScript Array - the ServerBehavior objects with the given
//      SB file name
//--------------------------------------------------------------------

function dwscripts_getServerBehaviorByParam(sbFileName, paramName, paramValue, ignoreCase)
{
  var retVal = null;
  
  if (ignoreCase)
  {
    paramValue = paramValue.toLowerCase();
  }

  var allSBObjs = dw.serverBehaviorInspector.getServerBehaviors();

  for (var i=0; i < allSBObjs.length; i++)
  {
    if (allSBObjs[i].getServerBehaviorFileName &&
        (allSBObjs[i].getServerBehaviorFileName().indexOf(sbFileName) == 0))
    {
      var paramVal = allSBObjs[i].getParameter(paramName);
      
      if (paramValue == (ignoreCase ? paramVal.toLowerCase() : paramVal))
      {
        retVal = allSBObjs[i];
        break;
      }
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getDataSourcesByFileName
//
// DESCRIPTION:
//   Returns a list of the current DataSources.  If a data source
//   file name is specified, then it returns the list of data sources 
//   associated with that file name.
//
// ARGUMENTS:
//   dsFileName - string - (optional) the simple file name of the
//     data source nodes to returns (i.e. "Recordset.htm")
//
// RETURNS:
//   array of JavaScript objects - DataSource objects
//--------------------------------------------------------------------

function dwscripts_getDataSourcesByFileName(dsFileName)
{
  var retList = new Array();

  //ask dreamweaver for the list of data sources
  var dsList = dw.dbi.getDataSources();
  
  for (var i=0; i < dsList.length; i++) 
  {
    if (!dsFileName || dsList[i].dataSource == dsFileName)
    {
      retList.push(dsList[i]);
    }
  }
  
  return retList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getDataSourcesForSB
//
// DESCRIPTION:
//   Returns a list of DataSource objects.  If a server behavior
//   is specified, then it returns the list of data sources which 
//   can be used with the given server behavior.  (Group files
//   can specify a dataSource attribute to determine which
//   data sources should be returned in this list.)
//
// ARGUMENTS:
//   sbFileName - string - (optional) the simple file name of the SB 
//     for which the list will be displayed.
//
// RETURNS:
//   array of JavaScript objects - DataSource objects
//--------------------------------------------------------------------

function dwscripts_getDataSourcesForSB(sbFileName)
{
  var retList = new Array();

  //ask dreamweaver for the list of data sources
  var dsList = dw.dbi.getDataSources();
  
  if (sbFileName) // limit the list to datasources which support the given SB
  {
    //get the list of groups which reference this server behavior  
    var brList = dw.getExtGroups(sbFileName, "serverBehavior");
  
    //for each data source, check if a group file exists for it
    for (var i=0; i < dsList.length; i++) 
    {
      for (var j = 0; j < brList.length; j++) 
      {
        var dsSource = dw.getExtDataValue(brList[j],"dataSource");

        if ((dsSource && (dsSource == dsList[i].dataSource || dsSource == "*")) ||
            (!dsSource && dsList[i].dataSource == "Recordset.htm"))
        {
          retList.push(dsList[i]);
          break;
        }
      }
    }
  }
  else
  {
    for (var i=0; i < dsList.length; i++) 
    {
      retList.push(dsList[i]);
    }
  }
  
  return retList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getDataSourceNames
//
// DESCRIPTION:
//   Given an array of DataSource nodes, this function returns
//   an array of DataSource names, suitable for display in a
//   drop down list.
//
// ARGUMENTS:
//   arrayOfDataSourceNodes - array - an array of data source
//     nodes as returned by getDataSourcesByFileName or
//     getDataSourcesForSB
//
// RETURNS:
//   array of strings
//--------------------------------------------------------------------

function dwscripts_getDataSourceNames(arrayOfDataSourceNodes)
{
  var retVal = new Array();
  
  if (arrayOfDataSourceNodes != null)
  {  
    for (var i=0; i < arrayOfDataSourceNodes.length; i++)
    {
      if (arrayOfDataSourceNodes[i].name) 
      {
        retVal.push(arrayOfDataSourceNodes[i].name);
      } 
      else 
      {
        retVal.push(arrayOfDataSourceNodes[i].title);
      }
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getDataSourceTypes
//
// DESCRIPTION:
//   Given an array of DataSource nodes, this function returns
//   an array of DataSource types.  The data source type is the 
//   simple file name of the data source.
//
// ARGUMENTS:
//   arrayOfDataSourceNodes - array - an array of data source
//     nodes as returned by getDataSourcesByFileName or
//     getDataSourcesForSB
//
// RETURNS:
//   array of strings
//--------------------------------------------------------------------

function dwscripts_getDataSourceTypes(arrayOfDataSourceNodes)
{
  var retVal = new Array();
  
  if (arrayOfDataSourceNodes != null)
  {
    for (var i=0; i < arrayOfDataSourceNodes.length; i++)
    {
      retVal.push(arrayOfDataSourceNodes[i].dataSource);
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getDataSourceNodes
//
// DESCRIPTION:
//   Given a dataSource, returns the DataSource nodes which correspond
//   to the children of the data source
//
// ARGUMENTS:
//   dataSource - DataSource object - the data source for which to get nodes
//
// RETURNS:
//   array of DataSource nodes
//--------------------------------------------------------------------

function dwscripts_getDataSourceNodes(dataSource)
{
  var retVal = new Array();
  
  var serverModelFolder = dw.getDocumentDOM().serverModel.getFolderName();

  //get the dom of the data source
  var dsDOM = dreamweaver.getDocumentDOM(dreamweaver.getConfigurationPath() + "/DataSources/" + serverModelFolder + "/" + dataSource.dataSource);

  //call the generateDynamicSourceBindings function
  if (dsDOM) 
  {
    objList = dsDOM.parentWindow.generateDynamicSourceBindings(dataSource.title);
    
    if (objList && objList.length) 
    {
      retVal = objList;
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.popupDataSource
//
// DESCRIPTION:
//   This function displays the given data source dialog.
//
// ARGUMENTS:
//   dsFileName - string - the simple HTML file name of the Data Source
//     item to add
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function dwscripts_popupDataSource(dsFileName, argument)
{
  // call the addDynamicSource function in the given file
  var configDir = dw.getConfigurationPath();
  var dom = dw.getDocumentDOM();
  var smDir = dom.serverModel.getFolderName();
  var fullPath = configDir + "/DataSources/" + smDir + "/" + dsFileName;
  if (dwscripts.fileExists(fullPath))
  {
    var dsDOM = dw.getDocumentDOM(fullPath);
    if (dsDOM)
    {
      var parentWin = dsDOM.parentWindow;
      if (parentWin.addDynamicSource != null)
      {
        parentWin.addDynamicSource(argument);
        
        // Refresh the list of Data Sources
        
        // In order to force a refresh of the dataSources
        // we need to clear the dataSources property on
        // the current documents window.
        
        if (dom.parentWindow)
        {
          dom.parentWindow.dataSources = null;
          dw.dbi.getDataSources();
        }
      }
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.encodeDynamicExpression
//
// DESCRIPTION:
//   This function prepares a dynamic expression for insertion onto
//   the page.  It is assumed that this expression will be used
//   within a larger dynamic statement, therefore all server markup
//   is stripped.
//
// ARGUMENTS:
//   expression - string - the dyanmic expression to encode
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_encodeDynamicExpression(expression)
{
  var retVal = expression;
  
  // Use the Server Model version if it exists
  var serverObj = dwscripts.getServerImplObject();
  if (serverObj != null && serverObj.encodeDynamicExpression != null)
  {
    retVal = serverObj.encodeDynamicExpression(expression);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.decodeDynamicExpression
//
// DESCRIPTION:
//   This function prepares a dynamic expression for display within
//   a dialog box.  Quotes are removed,a nd server markup is re-added.
//
// ARGUMENTS:
//   expression - string - the dynamic expression to prepare for display
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_decodeDynamicExpression(expression)
{
  var retVal = expression;
  
  // Use the Server Model version if it exists
  var serverObj = dwscripts.getServerImplObject();
  if (serverObj != null && serverObj.decodeDynamicExpression != null)
  {
    retVal = serverObj.decodeDynamicExpression(expression);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.hasServerMarkup
//
// DESCRIPTION:
//   This function returns true if the given expression contains
//   server markup.
//
// ARGUMENTS:
//   expression - string - the expression to test for server markup
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_hasServerMarkup(expression)
{
  var retVal = false;
  
  // Use the Server Model version if it exists
  var serverObj = dwscripts.getServerImplObject();
  if (serverObj != null && serverObj.hasServerMarkup != null)
  {
    retVal = serverObj.hasServerMarkup(expression);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.trimServerMarkup
//
// DESCRIPTION:
//   This function returns the given expression with any server markup
//   removed.
//
// ARGUMENTS:
//   expression - string - the expression to remove server markup from
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_trimServerMarkup(expression)
{
  var retVal = expression;
  
  // Use the Server Model version if it exists
  var serverObj = dwscripts.getServerImplObject();
  if (serverObj != null && serverObj.trimServerMarkup != null)
  {
    retVal = serverObj.trimServerMarkup(expression);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.canStripCfOutputTags
//
// DESCRIPTION:
//   This function returns true if cfoutputs are not needed
//   around any dynamic text inserted at the given location.  
//   If no character range is provided, the current selection
//   is used.
//
// ARGUMENTS:
//   charRange - (optional) If non-null, this object has
//     startOffset and endOffset properties.  Use those properties
//     instead of the current selection.
//   checkForBind - (optional) If this boolean argument
//     is true, then check to see if charRange surrounds a
//     ColdFusion tag.  If it does, we're binding to the attribute
//     of that tag, so the cfoutput tags are not needed
//
// RETURNS:
//   boolean - true if cfoutput tags are not needed
//--------------------------------------------------------------------

function dwscripts_canStripCfOutputTags(charRange, checkForBind)
{
  var isNested = false;
  var startOffset = 0;
  var endOffset = 0;
  var dom = dw.getDocumentDOM();

  // If we were not given a charRange, then get the current selection
  if (charRange)
  {
    startOffset = charRange.startoffset;
    endOffset = charRange.endoffset;
  }
  else
  {
    var selOffsets = dom.getSelection(true);
    startOffset = selOffsets[0];
    endOffset = selOffsets[1];
  }

  // Convert the range into a node
  var node = dom.offsetsToNode(startOffset, endOffset);

  // If checkForBind is true, check to see if we're binding to
  //  an attribute of a ColdFusion tag.
  if (checkForBind)
  {
    if (node &&
        node.nodeType == Node.ELEMENT_NODE &&
        node.tagName.indexOf("CF") == 0)
    {
      // Determine the offset range within which the char range must be to
      //   warrant cfoutput removal.
      var offsets = dom.nodeToOffsets(node);
      var minOffset = offsets[0];
      var maxOffset = offsets[1];
     
      // For most CF tags, we always want to strip the cfoutput, if the char
      //   range is somewhere within the tag outerHTML. However, for a few tags, (e.g.,
      //   cfform), we want to strip the cfoutput if the char range
      //   is within the attribute list, but not if the char range is 
      //   within the innerHTML of the tag. 
      if (node.tagName == "CFFORM")
      { 
        // Only strip the cfoutput's if the char range is in the attribute list.
        var nodeStr = dwscripts.getOuterHTML(node);
  
        var callback = new Object();
        callback.tagCount = 0;
        callback.outerStart = 0;
        callback.innerStart = 0;
        callback.openTagBegin = new Function("tag,offset","if (this.tagCount == 0) {this.outerStart = offset}");
        callback.openTagEnd = new Function("offset","if (this.tagCount == 0) { this.innerStart = offset; } this.tagCount++;");
        dw.scanSourceString(nodeStr, callback);
  
        minOffset = minOffset + callback.outerStart;
        maxOffset = minOffset + callback.innerStart;
      }
      
      if (   startOffset >= minOffset && startOffset < maxOffset 
          && endOffset <= maxOffset && endOffset > minOffset
         )
      {
        // If the returned node is a CFOUTPUT node, check to
        //  see if the selection is less than the entire tag.
        //  If it is, set nested to true.  If it is not, then
        //  we are replacing the CFOUTPUT node, so nested should
        //  be left false.
        if (   node.tagName != "CFOUTPUT"
            || (startOffset > minOffset || endOffset < maxOffset)
           )
        {
          isNested = true;
        }
      }
      
    }
  }
  else
  {     
    // If the returned node is a CFOUTPUT node, check to
    //  see if the selection is less than the entire tag.
    //  If it is, set nested to true.  If it is not, then
    //  we are replacing the CFOUTPUT node, so nested should
    //  be left false.
    if (node && 
        node.nodeType == Node.ELEMENT_NODE &&
        node.tagName == "CFOUTPUT")
    {
      var offsets = dom.nodeToOffsets(node);
      if (startOffset > offsets[0] ||
          endOffset < offsets[1])
      {
        isNested = true;
      }
    }
  }

  if (!isNested)
  {
    // We want to check the first enclosing node of either the
    //  selection, or the node we will replace.
    if (node)
    {
      node = node.parentNode;
    }
    
    while (node)
    {
      if (node.nodeType == Node.ELEMENT_NODE && node.tagName == "CFOUTPUT")
      {
        isNested = true;
        break;
      }
      node = node.parentNode;
    }
  }

  return isNested;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.stripCFOutputTags
//
// DESCRIPTION:
//   This function returns the given expression with the open and
//   close CFOUTPUT tags removed.
//
// ARGUMENTS:
//   expression - string - the string to remove the CFOUTPUT tags from
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_stripCFOutputTags(expression)
{
  var retVal = expression.toString();

  var exp1 = /<cfoutput[^>]*>/gi;
  var exp2 = /<\/cfoutput[^>]*>/gi;

  retVal = retVal.replace(exp1,"");
  retVal = retVal.replace(exp2,"");

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.canStripScriptDelimiters
//
// DESCRIPTION:
//   If the passed-in character range falls entirely inside a 
//   a script block, then return true.  The caller, who is inserting
//   dynamic text at that location, whill call
//   dwscripts.stripScriptDelimiters to remove the opening "<%"
//   and closing "%>" from the string that's being inserted.
//
// ARGUMENTS:
//   charRange - (optional) If non-null, this object has
//     startOffset and endOffset properties.
//
// RETURNS:
//   boolean - true if script delimiters are not needed
//--------------------------------------------------------------------

function dwscripts_canStripScriptDelimiters(charRange)
{
  var dom = dw.getDocumentDOM();
  var nodeStr;
  var offsets;
  var i;

  // If we were not given a charRange, then assume that we're not
  // inside a script block
  if (charRange == null)
    return false;

  // Get the node containing this character range.    
  var node = dom.offsetsToNode(charRange.startoffset, charRange.endoffset);
  if (node == null)
    return false;

  if (node.nodeType == Node.COMMENT_NODE)
  {
    // Both comments and script directives are treated as COMMENT_NODEs in
  // the DOM.  In either case, we want to strip the script delimiters.
  //
  // Verify that the range is inside the node, as opposed to just before
  // or just after it.  If it is inside, return true.

    offsets = dom.nodeToOffsets(node);
  return charRange.startoffset > offsets[0] &&
         charRange.endoffset < offsets[1];
  }

  if (node.nodeType == Node.ELEMENT_NODE &&
      (node.tagName == "MM:BEGINLOCK" || node.tagName == "MM:ENDLOCK"))
  {
    // The range is inside a locked region, which may be a script block.
  // Get the original source for the locked region and compare it to 
  // the set of script delimiters for this server model.  If no match
  // is found, this isn't a script block.

    var delimInfo = dom.serverModel.getDelimiters();
    var nodeStr = node.outerHTML;
    var isScriptBlock = false;
    for (i=0; i < delimInfo.length; i++)
    {
      delim = delimInfo[i];
      re = new RegExp("^" + delim.startPattern + "[^\\0]*" + delim.endPattern + "$", "i");
      if (re.test(nodeStr))
    {
      isScriptBlock = true;
    break;
    }
  }
  if (!isScriptBlock)
    return false;
  
  // As we did for comments above, verify that the range is inside the
  // node.  If it is, return true.
    var offsets = dom.nodeToOffsets(node);
  return charRange.startoffset > offsets[0] &&
         charRange.endoffset < offsets[1];
  }

  // The range is not inside a directive or a locked region, so return false
  return false;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.stripStripScriptDelimiters
//
// DESCRIPTION:
//   This function returns the given expression with the opening and
//   clsing script delimiters removed.
//
// ARGUMENTS:
//   expression - string - the string to remove the delimiters from
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_stripScriptDelimiters(expression)
{
  var dom = dw.getDocumentDOM();
  var delimInfo = dom.serverModel.getDelimiters();
  var i = 0;
  var delim = null;
  var re = null;
  var match = null;
  var retVal = "";
  var withoutDelimiters = null;

  // Iterate through all the script delimiters for this server model, looking
  // for one that matches expression.  If multiple matches are found, choose
  // the one that trims the most characters off the beginning and end of the
  // expression (i.e.: choose "<%=" over "<%")
  for (i=0; i < delimInfo.length; i++)
  {
    delim = delimInfo[i];
    re = new RegExp("^" + delim.startPattern + "([^\\0]*)" + delim.endPattern + "$", "i");
    match = re.exec(expression);
    if (match != null)
  {
    withoutDelimiters = match[1];
    if (retVal.length == 0 || withoutDelimiters.length < retVal.length)
      retVal = withoutDelimiters;
  }
  }
  
  // If no match was found, just return the original expression     
  if (retVal.length == 0)
    return expression;

  // Trim space off the beginning and ending of the string
  var firstChar = 0;
  var lastChar = retVal.length - 1;
  while (retVal[firstChar] == ' ' && firstChar < lastChar)
    firstChar++;
  while (retVal[lastChar] == ' ' && lastChar > firstChar)
    lastChar--;
  retVal = retVal.substr(firstChar, lastChar-firstChar+1);

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.isValidServerVarName
//
// DESCRIPTION:
//   Returns true if the given variable name is legal
//
// ARGUMENTS:
//   theVarName - string - variable to check
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_isValidServerVarName(theVarName)
{
  var retVal = true;
  
  // Use the Server Model version if it exists
  var serverObj = dwscripts.getServerImplObject();
  if (serverObj != null && serverObj.isValidServerVarName != null)
  {
    retVal = serverObj.isValidServerVarName(theVarName);
  }
  else
  {
    retVal = dwscripts.isValidVarName(theVarName);
    
    if (retVal)
    {
      retVal = !dwscripts.isReservedWord(theVarName);
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.isReservedWord
//
// DESCRIPTION:
//   This function returns true if the given string is a reserved word.
//   This is useful for checking variable names.
//
//   This function calls a function defined in the server model html
///  file, so that this can be customized per server model.
//
// ARGUMENTS:
//   theStr - string - the string to check
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_isReservedWord(theStr)
{
  var retVal = false;
  
  // Use the Server Model version if it exists
  var serverObj = dwscripts.getServerImplObject();
  if (serverObj != null && serverObj.isReservedWord != null)
  {
    retVal = serverObj.isReservedWord(theStr);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.isSQLReservedWord
//
// DESCRIPTION:
//   This function returns true if the given word has special meaining
//   within the SQL syntax. 
//
// ARGUMENTS:
//   theStr - string - the word to check
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_isSQLReservedWord(theStr)
{
  var retVal = false;
  
  // Use the Server Model version if it exists
  var serverObj = dwscripts.getServerImplObject();
  if (serverObj != null && serverObj.isSQLReservedWord != null)
  {
    retVal = serverObj.isSQLReservedWord(theStr);
  }
  else
  {
    if (dwscripts.SQL_RESERVED_WORDS == null)
    {
       var a = new Array
       (
         "absolute",
         "action",
         "add",
         "admin",
         "after",
         "aggregate",
         "alias",
         "all",
         "allocate",
         "alter",
         "and",
         "any",
         "are",
         "array",
         "as",
         "asc",
         "assertion",
         "at",
         "authorization",
         "avg",
         "before",
         "begin",
         "between",
         "binary",
         "bit",
         "bit_length",
         "blob",
         "boolean",
         "both",
         "breadth",
         "by",
         "call",
         "cascade",
         "cascaded",
         "case",
         "cast",
         "catalog",
         "char",
         "character",
         "character_length",
         "char_length",
         "check",
         "class",
         "clob",
         "close",
         "coalesce",
         "collate",
         "collation",
         "column",
         "commit",
         "completion",
         "connect",
         "connection",
         "constraint",
         "constraints",
         "constructor",
         "continue",
         "convert",
         "corresponding",
         "count",
         "create",
         "cross",
         "cube",
         "current",
         "current_date",
         "current_path",
         "current_role",
         "current_time",
         "current_timestamp",
         "current_user",
         "cursor",
         "cycle",
         "data",
         "date",
         "day",
         "deallocate",
         "dec",
         "decimal",
         "declare",
         "default",
         "deferrable",
         "deferred",
         "delete",
         "depth",
         "deref",
         "desc",
         "describe",
         "descriptor",
         "destroy",
         "destructor",
         "deterministic",
         "diagnostics",
         "dictionary",
         "disconnect",
         "distinct",
         "domain",
         "double",
         "drop",
         "dynamic",
         "each",
         "else",
         "end",
         "end-exec",
         "equals",
         "escape",
         "every",
         "except",
         "exception",
         "exec",
         "execute",
         "exists",
         "external",
         "extract",
         "false",
         "fetch",
         "first",
         "float",
         "for",
         "foreign",
         "found",
         "free",
         "from",
         "full",
         "general",
         "get",
         "global",
         "go",
         "goto",
         "grant",
         "group",
         "grouping",
         "having",
         "host",
         "hour",
         "identity",
         "ignore",
         "immediate",
         "in",
         "indicator",
         "initialize",
         "initially",
         "inner",
         "inout",
         "input",
         "insensitive",
         "insert",
         "int",
         "integer",
         "intersect",
         "interval",
         "into",
         "is",
         "isolation",
         "iterate",
         "join",
         "key",
         "language",
         "large",
         "last",
         "lateral",
         "leading",
         "left",
         "less",
         "level",
         "like",
         "limit",
         "local",
         "localtime",
         "localtimestamp",
         "locator",
         "lower",
         "map",
         "match",
         "max",
         "min",
         "minute",
         "modifies",
         "modify",
         "module",
         "month",
         "names",
         "national",
         "natural",
         "nchar",
         "nclob",
         "new",
         "next",
         "no",
         "none",
         "not",
         "null",
         "nullif",
         "numeric",
         "object",
         "octet_length",
         "of",
         "old",
         "on",
         "only",
         "open",
         "operation",
         "option",
         "or",
         "order",
         "ordinality",
         "out",
         "outer",
         "output",
         "overlaps",
         "pad",
         "parameter",
         "parameters",
         "partial",
         "path",
         "position",
         "postfix",
         "precision",
         "prefix",
         "preorder",
         "prepare",
         "preserve",
         "primary",
         "prior",
         "privileges",
         "procedure",
         "public",
         "read",
         "reads",
         "real",
         "recursive",
         "ref",
         "references",
         "referencing",
         "relative",
         "restrict",
         "result",
         "returns",
         "revoke",
         "right",
         "role",
         "rollback",
         "rollup",
         "routine",
         "row",
         "rows",
         "savepoint",
         "schema",
         "scroll",
         "scope",
         "search",
         "second",
         "section",
         "select",
         "sequence",
         "session",
         "session_user",
         "set",
         "sets",
         "size",
         "smallint",
         "some",
         "space",
         "specific",
         "specifictype",
         "sql",
         "sqlcode",
         "sqlerror",
         "sqlexception",
         "sqlstate",
         "sqlwarning",
         "start",
         "state",
         "statement",
         "static",
         "structure",
         "substring",
         "sum",
         "system_user",
         "table",
         "temporary",
         "terminate",
         "than",
         "then",
         "time",
         "timestamp",
         "timezone_hour",
         "timezone_minute",
         "to",
         "trailing",
         "transaction",
         "translate",
         "translation",
         "trailing",
         "translation",
         "treat",
         "trim",
         "true",
         "under",
         "union",
         "unique",
         "unknown",
         "unnest",
         "update",
         "upper",
         "usage",
         "user",
         "using",
         "value",
         "values",
         "varchar",
         "variable",
         "varying",
         "view",
         "when",
         "whenever",
         "where",
         "with",
         "without",
         "work",
         "write",
         "year",
         "zone"
       );

       dwscripts.SQL_RESERVED_WORDS = a;
    }

    if (dwscripts.SQL_RESERVED_WORDS != null)
    {
      var word = theStr.toLowerCase();

      if (dwscripts.findInArray(dwscripts.SQL_RESERVED_WORDS, word) != -1)
      {
        retVal = true;
      }
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.encodeSQLTableRef
//
// DESCRIPTION:
//   Returns a table reference suitable for use within a SQL statement.
//   Wraps the reference in quotes if the table name contains a space,
//   begins with an underscore, or begins with a number.
//
// ARGUMENTS:
//   tableName - string - the table name we are referencing
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_encodeSQLTableRef(tableName)
{
  var retVal = tableName;

  // Use the Server Model version if it exists
  var serverObj = dwscripts.getServerImplObject();
  if (serverObj != null && serverObj.encodeSQLTableRef != null)
  {
    retVal = serverObj.encodeSQLTableRef(tableName);
  }
  else
  {
    // we need to remove any table prefix which might exist,
    // and then add it back on after encoding
    var prefix = "";
    var preIndex = tableName.lastIndexOf(".");
    if (preIndex != -1)
    {
      prefix = tableName.substring(0, preIndex+1);
      tableName = tableName.substring(preIndex+1);
      retVal = tableName;
    }
    
    if (tableName.charAt(0) == "_")
    {
		retVal = "\"" + retVal + "\"";
	}
    else if (dwscripts.isNumber(tableName.charAt(0)))
    {
		retVal = "\"" + retVal + "\"";
    }
    else if (tableName.indexOf(" ") != -1)
    {
		retVal = "\"" + retVal + "\"";
    }
/* [lcho 06.23.05] removing reserved-word check, as it appears to be generating invalid code
    else if (dwscripts.isSQLReservedWord(tableName))
    {
		retVal = "\"" + retVal + "\"";
    }
*/    
    if (prefix)
    {
      retVal = prefix + retVal;
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.encodeSQLColumnRef
//
// DESCRIPTION:
//   Returns a column reference suitable for use within a SQL statement.
//   Adds the table name qualifier if needed, and wraps the reference
//   in quotes if the column name contains a space, starts with an
//   underscore, or starts with a number.
//
// ARGUMENTS:
//   tableName - string - the table name to be used if the column is
//     not unique
//   columnName - string - the column name to return a reference to
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_encodeSQLColumnRef(tableName, columnName)
{
  var retVal = "";
  
  // Use the Server Model version if it exists
  var serverObj = dwscripts.getServerImplObject();
  if (serverObj != null && serverObj.encodeSQLColumnRef != null)
  {
    retVal = serverObj.encodeSQLColumnRef(tableName,columnName);
  }
  else
  {
    cName = columnName;
    if (columnName.charAt(0) == "_")
    {
      cName = "\"" + cName + "\"";
    }
    else if (dwscripts.isNumber(columnName.charAt(0)))
    {
      cName = "\"" + cName + "\"";
    }
    else if (columnName.indexOf(" ") != -1)
    {
      cName = "\"" + cName + "\"";
    }
/* [lcho 06.23.05] removing reserved-word check, as it appears to be generating invalid code
	else if (dwscripts.isSQLReservedWord(columnName))
    {
      cName = "\"" + cName + "\"";
    }
*/
    var tName = dwscripts.encodeSQLTableRef(tableName);
    
    if (tName)
    {
      retVal = tName + "." + cName;
    }
    else
    {
      retVal = cName;
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.decodeSQLTableRef
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function dwscripts_decodeSQLTableRef(theRef)
{
  var retVal = theRef;
  
  // Use the Server Model version if it exists
  var serverObj = dwscripts.getServerImplObject();
  if (serverObj != null && serverObj.decodeSQLTableRef != null)
  {
    retVal = serverObj.decodeSQLTableRef(theRef);
  }
  else
  {
    if (theRef.indexOf("\"") != -1)
    {
      retVal = dwscripts.stripChars(retVal, "\"");
    }
    
    retVal = dwscripts.trim(retVal);
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.decodeSQLColumnRef
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function dwscripts_decodeSQLColumnRef(theRef)
{
  var retVal = theRef;
  
  // Use the Server Model version if it exists
  var serverObj = dwscripts.getServerImplObject();
  if (serverObj != null && serverObj.decodeSQLColumnRef != null)
  {
    retVal = serverObj.decodeSQLColumnRef(theRef);
  }
  else
  {
    if (retVal.indexOf("\"") != -1)
    {
      retVal = dwscripts.stripChars(retVal, "\"");
    }

    retVal = dwscripts.trim(retVal);
    
    // remove the table prefix if it exists
    if (retVal.lastIndexOf(".") != -1)
    {
      retVal = retVal.substring(retVal.lastIndexOf(".")+1);
    }
      
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.escSQLQuotes
//
// DESCRIPTION:
//   Escape quotes in sql statement 
//
// ARGUMENTS:
//   sql - string - the sql statement
//
// RETURNS:
//   string - sql statement with quotes escaped
//--------------------------------------------------------------------

function dwscripts_escSQLQuotes(sql)
{
  var retVal = sql;

  var serverObj = dwscripts.getServerImplObject();

  if (serverObj != null && serverObj.escSQLQuotes != null)
  {
    retVal = serverObj.escSQLQuotes(sql);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.unescSQLQuotes
//
// DESCRIPTION:
//   Unescape quotes in sql statement 
//
// ARGUMENTS:
//   sql - string - the sql statement
//
// RETURNS:
//   string - sql statement with quotes unescaped
//--------------------------------------------------------------------

function dwscripts_unescSQLQuotes(sql)
{
  var retVal = sql;

  var serverObj = dwscripts.getServerImplObject();

  if (serverObj != null && serverObj.unescSQLQuotes != null)
  {
    retVal = serverObj.unescSQLQuotes(sql);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.escServerQuotes
//
// DESCRIPTION:
//   Escape quotes in a quoted string
//
// ARGUMENTS:
//   theString - string - the string
//
// RETURNS:
//   string - the string with quotes escaped
//--------------------------------------------------------------------

function dwscripts_escServerQuotes(theString)
{
  var retVal = theString;

  var serverObj = dwscripts.getServerImplObject();

  if (serverObj != null && serverObj.escServerQuotes != null)
  {
    retVal = serverObj.escServerQuotes(theString);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.unescServerQuotes
//
// DESCRIPTION:
//   Unescape quotes in a quoted string
//
// ARGUMENTS:
//   theString - string - the string
//
// RETURNS:
//   string - the string with quotes unescaped
//--------------------------------------------------------------------

function dwscripts_unescServerQuotes(theString)
{
  var retVal = theString;

  var serverObj = dwscripts.getServerImplObject();

  if (serverObj != null && serverObj.unescServerQuotes != null)
  {
    retVal = serverObj.unescServerQuotes(theString);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getDBColumnTypeEnum
//
// DESCRIPTION:
//   This function returns the enumerated value corresponding to the
//   given column type.  The enumeration numbers should match those
//   used by the databases themselves.
//
// ARGUMENTS:
//   columnType - string - a column type as returned by the MMDB functions
//
// RETURNS:
//   enumeration number
//--------------------------------------------------------------------

function dwscripts_getDBColumnTypeEnum(columnType)
{
  var retVal = null;
  
  // Use the Server Model version if it exists
  var serverObj = dwscripts.getServerImplObject();
  
  if (serverObj != null && serverObj.getDBColumnTypeEnum != null)
  {
    retVal = serverObj.getDBColumnTypeEnum(columnType);
  }
  else
  {
    // Set the default to 129 to work around a bug, where the "text"
    //  data type for SQL Server was returning blank.
    var retVal = 129;

    columnType = String(columnType);

    if (dwscripts.isNumber(columnType) && dwscripts.getNumber(columnType) >= 0)
    {
      retVal = dwscripts.getNumber(columnType);
    }
    else
    {
      if (dwscripts.DB_COLUMN_ENUM_MAP == null)
      {
        // TODO: read in from a configuration file
        var a = new Array();

        //from the ASP book
        a["empty"] = 0;
        a["smallint"] = 2;
        a["integer"] = 3;
        a["single"] = 4;
        a["double"] = 5;
        a["currency"] = 6;
        a["date"] = 7;
        a["bstr"] = 8;
        a["idispatch"] = 9;
        a["error"] = 10;
        a["boolean"] = 11;
        a["variant"] = 12;
        a["iunknown"] = 13;
        a["decimal"] = 14;
        a["tinyint"] = 16;
        a["unsignedtinyint"] = 17;
        a["unsignedsmallint"] = 18;
        a["unsignedint"] = 19;
        a["bigint"] = 20;
        a["ebigint"] = 20; // matched to bigint
        a["unsignedbigint"] = 21;
        a["guid"] = 72;
        a["binary"] = 128;
        a["char"] = 129;
        a["wchar"] = 130;
        a["numeric"] = 131;
        a["varnumeric"] = 131;
        a["userdefined"] = 132;
        a["dbdate"] = 133;
        a["dbtime"] = 134;
        a["dbtimestamp"] = 135;
        a["varchar"] = 200;
        a["longchar"] = 201;
        a["longvarchar"] = 201;
        a["memo"] = 201;
        a["varwchar"] = 202;
        a["string"]=201;
        a["longvarwchar"] = 203;
        a["varbinary"] = 204;
        a["longvarbinary"] = 204; 
        a["longbinary"] = 205; // matched to longvarbinary

        //others
        a["money"] = 6;
        a["int"] = 3; //integer
        a["counter"] = 131; //numeric
        a["logical"] = 901; //bit
        a["byte"] = 16; //tinyint
        
        //oracle
        a["varchar2"] = 200;
        a["smalldatetime"] = 135;
        a["datetime"] = 135;
        a["number"] = 5; //double
        a["ref cursor"] = 900; //Arbitrary ID Val
        a["refcursor"] = 900;
        a["bit"] = 901; //Arbitrary ID Val;
        a["long raw"] = 20; // Match it to BigInt
        a["clob"] = 129; //char
        a["long"] = 20; // bigint
        a["double precision"] = 131; //numeric
        a["raw"]  = 204;// Match it to Binary
        a["nclob"]  = 204;//Match it to Binary
        a["bfile"]  = 204;//Match it to Binary
        a["rowid"]  = 129 ;//Match it to Hexadecimal String 
        a["urowid"] = 129 ;//Match it to Hexadecimal String

        //odbc
        a["empid"] = 129; //char
        a["tid"] = 129;
        a["bit"] = 901; 
        a["id"] = 200; //varchar

        // SQL Server 7
        a["smallmoney"] = 6; //currency
        a["float"] = 5; //double
        a["nchar"] = 200; //varchar
        a["real"] = 131; //numeric
        a["text"] = 200; //varchar
        a["blob"] = 200       // matched to text
        a["tinyblob"] = 200   // matched to text
        a["mediumblob"] = 200 // matched to text
        a["longblob"]  = 200  // matched to text
        a["timestamp"] = 135; //numeric
        a["sysname"] = 129;
        a["int identity"] = 131; //numeric counter
        a["smallint identity"] = 131; //numeric counter
        a["tinyint identity"] = 131; //numeric counter
        a["bigint identity"] = 131; //numeric counter
        a["decimal() identity"] = 131; //numeric counter
        a["numeric() identity"] = 131; //numeric counter
        a["uniqueidentifier"] = 131;//numeric
        a["ntext"]  = 200; //varchar
        a["nvarchar"] = 200; //varchar
        a["nvarchar2"] = 200; //varchar
        a["image"]  =  204 ;// binary

        // DB2
        a["time"] = 135; // needs '
        a["character () for bit data"] = 129;
        // the following entries are already defined to 200 for SQL Server
        //a["blob"] = 128; //binary
        //a["tinyblob"] = 128; //binary
        //a["mediumblob"] = 128; //binary
        //a["longblob"] = 128; //binary
        a["long varchar for bit data"] = 200; //varchar
        a["varchar () for bit data"] = 200; //varchar
        a["long varchar"] = 131; //numeric
        a["character"] = 129; //char

        //JDBC Specifc constants
        a["-8"] = 200; //JDBC varchar
        a["-9"] = 200; //JDBC varchar
        a["-10"] = 200; //JDBC varchar
        a["other"] = 200; //JDBC varchar

        //MySQL
        a["year"] = 133; //dbdate
        a["tinytext"] = 200; //varchar
        a["mediumtext"] = 200; //varchar
        a["longtext"] = 201; //longvarchar
        a["mediumint"] = 3; //integer
        a["enum"] = 200; //var char

        a["set"] = 132; //userdefined
        a["double unsigned zerofill"] = 5; //double
        a["float unsigned zerofill"] = 5; //double

        dwscripts.DB_COLUMN_ENUM_MAP = a;
      }

      if (dwscripts.DB_COLUMN_ENUM_MAP != null)
      {
        retVal = dwscripts.DB_COLUMN_ENUM_MAP[columnType.toLowerCase()];

        if (retVal == null)
        {
          alert(dwscripts.sprintf(MM.MSG_SQLTypeAsNumNotInMap,columnType));
          retVal = 0;
        }
      }
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getDBColumnTypeAsString
//
// DESCRIPTION:
//   This function returns a string representation of the given
//   column type.
//
// ARGUMENTS:
//   columnType - string - a column type string returned from MMDB
//   databaseType - string - only used for asp.net - "OleDb" or "SQLServer" for now.
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_getDBColumnTypeAsString(columnType, databaseType)
{
  var retVal = "Empty";
  
  var typeNum = dwscripts.getDBColumnTypeEnum(columnType);
  
  // If the server model defines getDBColumnTypeAsString, invoke it to get the
  //   type string. Otherwise, return the type string for ASP.
  var serverObj = dwscripts.getServerImplObject();
  if (serverObj != null && serverObj.getDBColumnTypeAsString != null)
  {
    retVal = serverObj.getDBColumnTypeAsString(typeNum, databaseType);
  }
  else 
  {
    if (dwscripts.DB_COLUMN_STRING_MAP == null)
    {
      var a = new Array();
      //from the ASP book
      a['0'] = "Empty";
      a['2'] = "SmallInt";
      a['3'] = "Integer";
      a['4'] = "Single";
      a['5'] = "Double";
      a['6'] = "Currency";
      a['7'] = "Date";
      a['8'] = "BSTR";
      a['9'] = "IDispatch";
      a['10'] = "Error";
      a['11'] = "Boolean";
      a['12'] = "Variant";
      a['13'] = "IUnknown";
      a['14'] = "Decimal";
      a['16'] = "TinyInt";
      a['17'] = "UnsignedTinyInt";
      a['18'] = "UnsignedSmallInt";
      a['19'] = "UnsignedInt";
      a['20'] = "BigInt";
      a['21'] = "UnsignedBigInt";
      a['72'] = "GUID";
      a['128'] = "Binary";
      a['129'] = "Char";
      a['130'] = "WChar";
      a['131'] = "Numeric";
      a['132'] = "UserDefined";
      a['133'] = "DBDate";
      a['134'] = "DBTime";
      a['135'] = "DBTimeStamp";
      a['200'] = "VarChar";
      a['201'] = "LongVarChar";
      a['202'] = "VarWChar";
      a['203'] = "LongVarWChar";
      a['204'] = "VarBinary";
      a['205'] = "LongVarBinary";
      a['900'] = "REF CURSOR"
      a['901'] = "bit"
      
      dwscripts.DB_COLUMN_STRING_MAP = a;
    }

    if (dwscripts.DB_COLUMN_STRING_MAP != null)
    {
      retVal = dwscripts.DB_COLUMN_STRING_MAP[typeNum.toString()];      
    }
  }

  if (retVal == null)
  {
    alert(dwscripts.sprintf(MM.MSG_SQLTypeNotInMap, columnType));
    retVal = "";
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getSQLStringForDBColumnType
//
// DESCRIPTION:
//   Returns the value passed in paramName with the appropriate
//   SQL delimeters added for the given column type
//
//   NOTE: eventually, we would like to enhance this function to
//         return the correct value for all database type.  It will
//         currently fail with Access dates.
//
// ARGUMENTS:
//   origString - string - the value to be inserted into the SQL
//   columnType - string - the column type with which this value
//     is being used
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_getSQLStringForDBColumnType(origString, columnType)
{
  var retVal = origString;

  // Use the Server Model version if it exists
  var serverObj = dwscripts.getServerImplObject();
  
  if (serverObj != null && serverObj.getSQLStringForDBColumnType != null)
  {
    retVal = serverObj.getSQLStringForDBColumnType(origString, columnType);
  }
  else
  {
    var typeNum = dwscripts.getDBColumnTypeEnum(columnType);

    if (dwscripts.isStringDBColumnType(typeNum) ||
        dwscripts.isBinaryDBColumnType(typeNum) ||
        dwscripts.isDateDBColumnType(typeNum) )
    {
      retVal = "'" + origString + "'";
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.isNumericDBColumnType
//
// DESCRIPTION:
//   Returns true if the given column type is numeric.
//
//   If we do not recognize the type of a column as any of the
//   other categories, we default to numeric.
//
// ARGUMENTS:
//   columnType - string - a column type string returned from MMDB
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_isNumericDBColumnType(columnType)
{
  var retVal = true;
  
  // Use the Server Model version if it exists
  var serverObj = dwscripts.getServerImplObject();
  
  if (serverObj != null && serverObj.isNumericDBColumnType != null)
  {
    retVal = serverObj.isNumericDBColumnType(columnType);
  }
  else
  {
    var typeNum = dwscripts.getDBColumnTypeEnum(columnType);

    // assume the numeric type, unless it is called out in one
    //  of the other functions below.

    switch (typeNum) 
    {
      case 8:
      case 129:
      case 130:
      case 200:
      case 201:
      case 202:
      case 203: 
      case 13:
      case 128:
      case 204:
      case 205:
      case 7:
      case 133:
      case 134:
      case 135:
        retVal = false;
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.isIntegerDBColumnType
//
// DESCRIPTION:
//   Returns true if the given column type is integer.
//
// ARGUMENTS:
//   columnType - string - a column type string returned from MMDB
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_isIntegerDBColumnType(columnType)
{
  var retVal  = false;
  
  // Use the Server Model version if it exists
  var serverObj = dwscripts.getServerImplObject();
  
  if (serverObj != null && serverObj.isIntegerDBColumnType != null)
  {
    retVal = serverObj.isIntegerDBColumnType(columnType);
  }
  else
  {
    var typeNum = dwscripts.getDBColumnTypeEnum(columnType);

    switch (typeNum) 
    {
      case 2:
      case 3:
      case 4:
      case 16:
      case 17:
      case 18:
      case 19:
      case 20:
      case 21:
      case 131:
        retVal = true;
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.isDoubleDBColumnType
//
// DESCRIPTION:
//   Returns true if the given column type is double.
//
// ARGUMENTS:
//   columnType - string - a column type string returned from MMDB
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_isDoubleDBColumnType(columnType)
{
  var retVal  = false;

  // Use the Server Model version if it exists
  var serverObj = dwscripts.getServerImplObject();
  
  if (serverObj != null && serverObj.isDoubleDBColumnType != null)
  {
    retVal = serverObj.isDoubleDBColumnType(columnType);
  }
  else
  {
    var typeNum = dwscripts.getDBColumnTypeEnum(columnType);

    switch (typeNum) 
    {
      case 5:
      case 14:
        retVal = true;
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.isStringDBColumnType
//
// DESCRIPTION:
//   This function returns true if the given column type represents
//   a string value
//
// ARGUMENTS:
//   columnType - string - a column type string returned from MMDB
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_isStringDBColumnType(columnType)
{
  var retVal = false;
  
  // Use the Server Model version if it exists
  var serverObj = dwscripts.getServerImplObject();
  
  if (serverObj != null && serverObj.isStringDBColumnType != null)
  {
    retVal = serverObj.isStringDBColumnType(columnType);
  }
  else
  {
    var typeNum = dwscripts.getDBColumnTypeEnum(columnType);

    switch (typeNum) 
    {
      case 8:
      case 129:
      case 130:
      case 200:
      case 201:
      case 202:
      case 203: 
        retVal = true;
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.isBinaryDBColumnType
//
// DESCRIPTION:
//   This function returns true if the given column type represents
//   binary data
//
// ARGUMENTS:
//   columnType - string - a column type string returned from MMDB
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_isBinaryDBColumnType(columnType)
{
  var retVal = false;
  
  // Use the Server Model version if it exists
  var serverObj = dwscripts.getServerImplObject();
  
  if (serverObj != null && serverObj.isBinaryDBColumnType != null)
  {
    retVal = serverObj.isBinaryDBColumnType(columnType);
  }
  else
  {
    var typeNum = dwscripts.getDBColumnTypeEnum(columnType);

    switch (typeNum) 
    {
      case 13:
      case 128:
      case 204:
      case 205:
        retVal = true;
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.isDateDBColumnType
//
// DESCRIPTION:
//   This function returns true if the given column type represents
//   a date or time value
//
// ARGUMENTS:
//   columnType - string - a column type string returned from MMDB
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_isDateDBColumnType(columnType)
{
  var retVal = false;
  
  // Use the Server Model version if it exists
  var serverObj = dwscripts.getServerImplObject();
  
  if (serverObj != null && serverObj.isDateDBColumnType != null)
  {
    retVal = serverObj.isDateDBColumnType(columnType);
  }
  else
  {
    var typeNum = dwscripts.getDBColumnTypeEnum(columnType);

    switch (typeNum) 
    {
      case 7:
      case 133:
      case 134:
      case 135:
        retVal = true;
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.isBooleanDBColumnType
//
// DESCRIPTION:
//   This function returns true if the given column type represents
//   binary data
//
// ARGUMENTS:
//   columnType - string - a column type string returned from MMDB
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_isBooleanDBColumnType(columnType)
{
  var retVal = false;
  
  // Use the Server Model version if it exists
  var serverObj = dwscripts.getServerImplObject();
  
  if (serverObj != null && serverObj.isBooleanDBColumnType != null)
  {
    retVal = serverObj.isBooleanDBColumnType(columnType);
  }
  else
  {
    var typeNum = dwscripts.getDBColumnTypeEnum(columnType);

    switch (typeNum) 
    {
      case 11:
      case 901:
        retVal = true;
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.isCurrencyDBColumnType
//
// DESCRIPTION:
//   This function returns true if the given column type represents
//   a monetary value
//
// ARGUMENTS:
//   columnType - string - a column type string returned from MMDB
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_isCurrencyDBColumnType(columnType)
{
  var retVal = false;
  
  // Use the Server Model version if it exists
  var serverObj = dwscripts.getServerImplObject();
  
  if (serverObj != null && serverObj.isCurrencyDBColumnType != null)
  {
    retVal = serverObj.isCurrencyDBColumnType(columnType);
  }
  else
  {
    var typeNum = dwscripts.getDBColumnTypeEnum(columnType);

    switch (typeNum) 
    {
      case 6:
        retVal = true;
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getConnectionURL
//
// DESCRIPTION:
//   Returns a string which represents the relative path from the
//   current document to the connection file for the given connection
//   name
//
// ARGUMENTS: 
//   connectionName - string - the connection name to return the URL for
//   siteRelative - boolean
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_getConnectionURL(connectionName, siteRelative) 
{
  var retVal = "";
  
  if (connectionName)
  {
    var dom = dw.getDocumentDOM();
    var fileUrl = dom.URL;
    var siteUrl = dw.getSiteRoot();
		var siteUrlPrefix = dom.getSiteURLPrefixFromDoc();


    if (siteRelative && siteUrl)
    {
      retVal = siteUrlPrefix + "/";
    }
    else if (fileUrl && siteUrl && fileUrl.toLowerCase().indexOf(siteUrl.toLowerCase()) != -1) 
    {

      //remove the site path from the file path
      fileUrl = fileUrl.substring(siteUrl.length);

      //if the site did not end in a slash, remove it from the fileUrl
      if (fileUrl.charAt(0) == "/") 
      {
        fileUrl = fileUrl.substring(1);
      }

      //add an enclosing directory reference for each slash encountered
      for (var i=0; i < fileUrl.length; i++) 
      {
        if (fileUrl.charAt(i) == "/") 
        {
          retVal += "../";
        }
      }
    } 
    else if (!fileUrl && siteUrl) 
    {    
      retVal = siteUrl;    
    }
    else
    {
      // error in creating path
      return retVal;
    }

    retVal = escape(retVal + "Connections/" + connectionName + dom.serverModel.getServerExtension());
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getPageNavDisplaySBs
//
// DESCRIPTION:
//   Returns the Server Behavior objects associated with the given
//   recordset.  If no recordset name is provided, then all page
//   nav display SBs are returned.
//
// ARGUMENTS:
//   recordsetName - string - (optional) the name of the recordset
//     which the repeat region should be associated with
//   ignoreCase - boolean - true if the case of the recordset name
//     should not be considered
//   includeAllType - boolean - true if display SB's configured for
//     showing all records should be included
//     
// RETURNS:
//   Server Behavior object, or null if none found
//--------------------------------------------------------------------

function dwscripts_getPageNavDisplaySBs(recordsetName, ignoreCase, includeAllType)
{
  var retVal = null;
  
  var serverObj = dwscripts.getServerImplObject();

  if ((serverObj != null) && (serverObj.getPageNavDisplaySBs != null))
  {
    retVal = serverObj.getPageNavDisplaySBs(recordsetName, ignoreCase);
  }
  else
  {
    retVal = new Array();
    
    if (recordsetName && ignoreCase)
    {
      recordsetName = recordsetName.toLowerCase();
    }

    var sbObjs = dwscripts.getServerBehaviorsByFileName("RepeatedRegion.htm");

    for (var i = 0; i < sbObjs.length; i++)
    {
      if (includeAllType || 
          (sbObjs[i].isPageNavigation == null || sbObjs[i].isPageNavigation()))
      {
        if (recordsetName && (sbObjs[i].getRecordsetName != null))
        {
          var sbRsName = sbObjs[i].getRecordsetName();

          if (ignoreCase)
          {
            sbRsName = sbRsName.toLowerCase();
          }

          if (recordsetName == sbRsName)
          {
            retVal.push(sbObjs[i]);
          }
        }
        else
        {
          retVal.push(sbObjs[i]);
        }
      }
    }
  }

  return retVal;  
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.warnIfNoPageNavDisplay
//
// DESCRIPTION:
//   This function checks to see if a Server Behavior configured for
//   displaying a page of records exists for the given recordset name.
//   If on does not exist, the user is warned.
//
// ARGUMENTS:
//   recordsetName - string - the name of the recordset to check for
//   ignoreCase - boolean - true if the case of the recordset name
//     should not be considered
//
// RETURNS:
//   boolean - true if no page nav display exists
//--------------------------------------------------------------------

function dwscripts_warnIfNoPageNavDisplay(recordsetName, ignoreCase)
{
  var retVal = false; 
  
  var serverObj = dwscripts.getServerImplObject();

  if ((serverObj != null) && (serverObj.warnIfNoPageNavDisplay != null))
  {
    retVal = serverObj.warnIfNoPageNavDisplay(recordsetName, ignoreCase);
  }
  else
  {
    var sbObjs = dwscripts.getPageNavDisplaySBs(recordsetName, ignoreCase, true);
  
    if (!sbObjs || sbObjs.length == 0) // none found
    {
      var retVal = true;
      
      dwscripts.informDontShow(dwscripts.sprintf(MM.MSG_WarnAboutRepeatRegionForRecordset, recordsetName),
        "Extensions\\ServerBehaviors\\PageNavigation","SkipPageNavDisplayWarning");
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts_getRecordsetNameWithPageNav
//
// DESCRIPTION:
//   Returns the name of the first recordset found which has a page
//   navigation repeat region associated with it.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - recordset name
//--------------------------------------------------------------------

function dwscripts_getRecordsetNameWithPageNav()
{
  var retVal = "";
  
  var serverObj = dwscripts.getServerImplObject();

  if ((serverObj != null) && (serverObj.getRecordsetNameWithPageNav != null))
  {
    retVal = serverObj.getRecordsetNameWithPageNav();
  }
  else
  {
    var sbObjs = dwscripts.getPageNavDisplaySBs();
  
    if (sbObjs && sbObjs.length && sbObjs[0].getRecordsetName != null)
    {
      retVal = sbObjs[0].getRecordsetName();
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.canInsertPageNavDisplay
//
// DESCRIPTION:
//   This function determines if a pageNavDisplay behavior can be added
//   to the current document.  It returns an appropriate error message
//   if one cannot be inserted.
//
// ARGUMENTS:
//   recordsetName - string - the recordset that the item will be 
//     associated with.
//   ignoreCase - boolean - ignore case when matching recordset name
//   isAll - boolean - indicates if the page nav display being inserted
//     will loop over all records.
//
// RETURNS:
//   string - empty if successful, or error message
//--------------------------------------------------------------------

function dwscripts_canInsertPageNavDisplay(recordsetName, ignoreCase, isAll)
{
  var retVal = "";
  
  var serverObj = dwscripts.getServerImplObject();

  if ((serverObj != null) && (serverObj.canInsertPageNavDisplay != null))
  {
    retVal = serverObj.canInsertPageNavDisplay(recordsetName, ignoreCase, isAll);
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getColumnValueList
//
// DESCRIPTION:
//   This function returns an array of column value nodes, based on
//   the given connection name and table name.  This list can then
//   be passed to the UI for display, or to the SQL class to be 
//   populated with values from the insert, update, or delete statement.
//
//   The returned column value nodes will be the platform specific
//   implementation of this class, as defined in the Server Model
//   html file.  The platform specific object is retrieved by calling
//   dwscripts.getColumnValueNode().
//
// ARGUMENTS:
//   connectionName - string - the connection to retrieve columns from
//   tableName - string - the table to retrieve columns from
//
// RETURNS:
//   array of objects derived from the ColumnValueNode class
//--------------------------------------------------------------------

function dwscripts_getColumnValueList(connectionName, tableName)
{
  var retVal = new Array();
  
  var columnNames = new Array();
  var columnTypes = new Array();
  
  // get the db fields and types for the currently selected connection/table
  var tableColumnsAndTypes = MMDB.getColumnAndTypeOfTable(connectionName, tableName); 

  // if there's at least one data type returned, then store off all DB column types in columnTypes array 
  if (tableColumnsAndTypes.length && tableColumnsAndTypes.length > 0)
  {
    for (var i=0; i < tableColumnsAndTypes.length; i=i+2)
    {
      columnNames.push(tableColumnsAndTypes[i]);
      columnTypes.push(tableColumnsAndTypes[i+1]); 
    } 
  }


  if (columnNames.length > 0)
  {
    // Try to find the columns that comprise the primary keys. Add the primary key
    //   info to the created column nodes.
    var primaryKeys = MMDB.getPrimaryKeys(connectionName, tableName);

    // for every column listed in the tree control 
    for (var i=0; i < columnNames.length; i++)
    {
      var node = dwscripts.getColumnValueNode();  // get platform specific object

      if (node)
      {
        node.setColumnName(columnNames[i]);
        node.setColumnType(columnTypes[i]);

        if (dwscripts.findInArray(primaryKeys, node.columnName) != -1)
        {
          node.setIsPrimaryKey(true);
        }
        
        retVal.push(node);
      }
    }    
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts_getColumnValueNode
//
// DESCRIPTION:
//   This is a factory function for returning a Server Model specific
//   instance of the ColumnValueNode class.  If the Server Model does
//   not define this function, null will be returned.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   object derived from ColumnValueNode
//--------------------------------------------------------------------

function dwscripts_getColumnValueNode()
{
  var retVal = false;
  var serverObj = dwscripts.getServerImplObject();

  if (serverObj != null && serverObj.getColumnValueNode != null)
  {
    retVal = serverObj.getColumnValueNode();
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getParameterTypeArray
//
// DESCRIPTION:
//   Get list of available parameter types.
//
// ARGUMENTS:
//   bRemoveEnteredVal - boolean (optional). 'true' if should remove 'Entered Value'
//     as a possible parameter type. Defaults to 'false'.
//
// RETURNS:
//   array of strings - localized list of parameter types.
//--------------------------------------------------------------------

function dwscripts_getParameterTypeArray(bRemoveEnteredVal)
{
  var retVal = null;
  var serverObj = dwscripts.getServerImplObject();

  if (serverObj != null && serverObj.getParameterTypeArray != null)
  {
    retVal = serverObj.getParameterTypeArray(bRemoveEnteredVal);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getParameterCodeFromType
//
// DESCRIPTION:
//   Gets the runtime code and default value for the parameter type. 
//
// ARGUMENTS:
//   paramType - string. one of elements returned from dwscripts.getParameterTypeArray.
//   paramNameOrValue - string. Value for the parameter.
//   paramDefault - string. Default value for the parameter.
//
// RETURNS:
//   object - with runtimeVal, defaultVal, and nameVal properties. null
//     if no parameter is used.
//--------------------------------------------------------------------

function dwscripts_getParameterCodeFromType(paramType,
                                            paramNameOrValue,
                                            paramDefault)
{
  var retVal = null;
  var serverObj = dwscripts.getServerImplObject();

  if (serverObj != null && serverObj.getParameterCodeFromType != null)
  {
    retVal = serverObj.getParameterCodeFromType(paramType,
                                                paramNameOrValue, 
                                                paramDefault);
  }

  return retVal;
}

//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getParameterSyntaxFromType
//
// DESCRIPTION:
//   Gets the syntax for the parameter type. 
//
// ARGUMENTS:
//   paramType - string. one of elements returned from dwscripts.getParameterTypeArray.
//   paramNameOrValue - string. Value for the parameter.
//
// RETURNS:
//   string
//
//--------------------------------------------------------------------

function dwscripts_getParameterSyntaxFromType(paramType, paramNameOrValue)
{
  var retVal = null;
  var serverObj = dwscripts.getServerImplObject();

  if (serverObj != null && serverObj.getParameterSyntaxFromType != null)
  {
    retVal = serverObj.getParameterSyntaxFromType(paramType, paramNameOrValue);
  }

  return retVal;
}

//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getParameterAsInteger
//
// DESCRIPTION:
//   Wraps the parameter with code appropriate to return an integer
//
// ARGUMENTS:
//   param - string.
//
// RETURNS:
//   string
//
//--------------------------------------------------------------------

function dwscripts_getParameterAsInteger(param)
{
  var retVal = null;
  var serverObj = dwscripts.getServerImplObject();

  if (serverObj != null && serverObj.getParameterAsInteger != null)
  {
    retVal = serverObj.getParameterAsInteger(param);
  }

  return retVal;
}

//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getTernaryStatement
//
// DESCRIPTION:
//   Gets the syntax for a ternary statement ((condition) ? trueClause : falseClause)
//
// ARGUMENTS:
//   condition - string.
//   trueClause - string. Value for the statement to be executed if the condition is true.
//   falseClause - string. Value for the statement to be executed if the condition is false.
//
// RETURNS:
//   string
//
//--------------------------------------------------------------------

function dwscripts_getTernaryStatement(condition, trueClause, falseClause)
{
  var retVal = null;
  var serverObj = dwscripts.getServerImplObject();

  if (serverObj != null && serverObj.getTernaryStatement != null)
  {
    retVal = serverObj.getTernaryStatement(condition, trueClause, falseClause);
  }

  return retVal;
}

//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getEqualsStatement
//
// DESCRIPTION:
//   Gets the syntax for a Equals statement (a == b, a = b, etc.)
//
// ARGUMENTS:
//   left - string.
//   right - string.
//
// RETURNS:
//   string
//
//--------------------------------------------------------------------

function dwscripts_getEqualsStatement(left, right)
{
  var retVal = null;
  var serverObj = dwscripts.getServerImplObject();

  if (serverObj != null && serverObj.getEqualsStatement != null)
  {
    retVal = serverObj.getEqualsStatement(left, right);
  }

  return retVal;
}

//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getNullToken
//
// DESCRIPTION:
//   Gets the syntax for "null" (i.e. "null" for C#, "Nothing" for VB)
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//
//--------------------------------------------------------------------

function dwscripts_getNullToken()
{
  var retVal = null;
  var serverObj = dwscripts.getServerImplObject();

  if (serverObj != null && serverObj.getNullToken != null)
  {
    retVal = serverObj.getNullToken();
  }

  return retVal;
}

//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getParameterExpressionFromType
//
// DESCRIPTION:
//   Gets the runtime code and default value for the parameter type. 
//
// ARGUMENTS:
//   paramType - string. one of elements returned from dwscripts.getParameterTypeArray.
//   paramNameOrValue - string. Value for the parameter.
//
// RETURNS:
//   string - with runtimeVal, defaultVal, and nameVal properties. null
//     if no parameter is used.
//--------------------------------------------------------------------

function dwscripts_getParameterExpressionFromType(paramType, paramNameOrValue)
{
  var retVal = null;
  var serverObj = dwscripts.getServerImplObject();

  if (serverObj != null && serverObj.getParameterExpressionFromType != null)
  {
    retVal = serverObj.getParameterExpressionFromType(paramType, paramNameOrValue);
  }

  return retVal;
}

//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getParameterTypeFromCode
//
// DESCRIPTION:
//   Get parameter type and name from its runtime value. 
//
// ARGUMENTS:
//   runtimeValue - string - the runtime code
//
// RETURNS:
//   object - contains paramType (one of elements returned from 
//     dwscripts.getParameterTypeArray) and paramName properties.
//--------------------------------------------------------------------

function dwscripts_getParameterTypeFromCode(runtimeValue)
{
  var retVal = null;
  var serverObj = dwscripts.getServerImplObject();

  if (serverObj != null && serverObj.getParameterTypeFromCode != null)
  {
    retVal = serverObj.getParameterTypeFromCode(runtimeValue);
  }

  return retVal;
}

//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getParameterTypeFromExpression
//
// DESCRIPTION:
//   Get parameter type and name from its runtime value. 
//
// ARGUMENTS:
//   runtimeValue - string - the runtime code
//
// RETURNS:
//   object - contains paramType (one of elements returned from 
//     dwscripts.getParameterTypeArray) and paramName properties.
//--------------------------------------------------------------------

function dwscripts_getParameterTypeFromExpression(runtimeValue)
{
  var retVal = null;
  var serverObj = dwscripts.getServerImplObject();
  
  if (serverObj != null && serverObj.getParameterTypeFromExpression != null)
  {
    retVal = serverObj.getParameterTypeFromExpression(runtimeValue);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getRecordsetDisplayName
//
// DESCRIPTION:
//   get display name for recordsets (i.e. Recordset vs. DataSet)
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - display name
//--------------------------------------------------------------------

function dwscripts_getRecordsetDisplayName()
{
  // default to Recordset for non-dynamic document types
  var retVal = MM.LABEL_TitleRecordset;
  
  var dom = dw.getDocumentDOM();
  if (dom)
  {
    var displayName = dom.serverModel.getRecordsetDisplayName();
    if (displayName)
    {
      retVal = displayName;
    }
  }
  
  return retVal;
}

//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getRecordsetBaseName
//
// DESCRIPTION:
//   Get base name for generating unique recordset names.
//   Same as getRecordsetDisplayName(), except the translation
//   (if there is one) doesn't use high-ascii or double-byte.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - base name
//--------------------------------------------------------------------

function dwscripts_getRecordsetBaseName()
{
  // default to Recordset for non-dynamic document types
  var retVal = MM.LABEL_RecordsetBaseName;
  
  var dom = dw.getDocumentDOM();
  if (dom)
  {
    var baseName = dom.serverModel.getRecordsetBaseName();
    if (baseName)
    {
      retVal = baseName;
    }
  }
  
  return retVal;
}

//-------------------------------------------------------------------
// FUNCTION:
//   findAllTableNames
//
// DESCRIPTION:
//   Returns the list of tables and views found in the given connection
//
// ARGUMENTS:
//   connectionName - string - the connection to use
//
// RETURNS:
//   JavaScript array - table names
//--------------------------------------------------------------------

function dwscripts_getTableNames(connectionName)
{
  var tableNames = new Array();

  if (connectionName)
  {  
    var tableObjects = MMDB.getTables(connectionName);

    if (tableObjects.length > 0)
    {
      for (var i=0; i < tableObjects.length; i++)
      {
        var tableObj = tableObjects[i];
        var schema =  dwscripts.trim(tableObj.schema);

        if (schema.length == 0)
        {
          schema = dwscripts.trim(tableObj.catalog);
        }
        
		if (schema.length > 0)
        {
          schema += ".";
        }

        tableNames.push(String(schema + tableObj.table));  
      }
    }
  }

  // Now get the views
  var viewNames = new Array(); 
  var viewObjects = MMDB.getViews(connectionName)
  
  for (i = 0; i < viewObjects.length; i++)
  {
    thisTable = viewObjects[i]
    thisSchema =  dwscripts.trim(thisTable.schema)
  
    if (thisSchema.length == 0)
    {
      thisSchema = dwscripts.trim(thisTable.catalog)
    }
    
	if (thisSchema.length > 0)
    {
      thisSchema += "."
    }
    
	viewNames.push(String(thisSchema + thisTable.view))
  }

  if (viewNames.length > 0) 
  {
    var isMySQL = false;
    var tableslen = tableNames.length;
    var viewslen = viewNames.length;

    if (tableslen == viewslen)
    {
      if ((tableslen) && (viewslen))
      {
        // Quick check for mysql...

        if ((tableNames[0] == viewNames[0]) &&
            (tableNames[tableslen-1] == viewNames[viewslen-1]) &&
            (tableNames[tableslen/2] == viewNames[viewslen/2]))
        {
          isMySQL = true;
        }
      }
    }

    if (!isMySQL)
    { 
      tableNames = tableNames.concat(viewNames)
    }
  }  

  return tableNames;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getCFDataSourceName
//
// DESCRIPTION:
//   Given a connection name, this function returns the corresponding
//   CF data source name.  In most cases, these names are the same,
//   except for when the user has defined connection variables.
//
// ARGUMENTS:
//   connectionName - string - the connection name or variable to get
//     the data source for
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_getCFDataSourceName(connectionName)
{
  var retVal = connectionName;
  
  if (dwscripts.hasServerMarkup(connectionName))
  {
    var simpleName = dwscripts.trimServerMarkup(connectionName);
    
    var dsList = dwscripts.getDataSourcesByFileName("ConnectionVar.htm");
    
    var nodeList = null;
    if (dsList && dsList.length)
    {
      nodeList = dwscripts.getDataSourceNodes(dsList[0]);
    }
    
    if (nodeList && nodeList.length)
    {
      for (var i=0; i < nodeList.length; i++)
      {
        if (nodeList[i].title == simpleName)
        {
          retVal = nodeList[i].name;
          break;
        }
      }
    }
  }

  return retVal;
}


