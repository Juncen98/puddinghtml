// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var recordset_filename = "RS_D.gif";
var datasourceleaf_filename = "DSL_D.gif";


//******************* API **********************


//*-------------------------------------------------------------------
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


//*-------------------------------------------------------------------
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
  if (dom) {

    //find matching ssRecs
    var ssRecs = dw.serverBehaviorInspector.getServerBehaviors();
    for (var i=0; i < ssRecs.length; i++) {
      if (ssRecs[i].serverBehavior == "Recordset.htm") {
        retList.push(new ObjectInfo(ssRecs[i].title, recordset_filename, true, "Recordset.htm", ssRecs[i].rsName));
      }
    }
  }

  return retList;
}


//*-------------------------------------------------------------------
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
//
//--------------------------------------------------------------------
function generateDynamicSourceBindings(sourceName)
{
  var retList = new Array();
  
  var ssRec = findSSRecByTitle(sourceName,"Recordset.htm");
  
  if (ssRec != null) {
    
    var bindingsArray = new Array();
    
    //check if the information is in the cache
    cachedCTArray = getCachedColumnAndTypeArray(ssRec.parameters.rsName);
    
    if (cachedCTArray.length) {
      
      for (var i=0; i < cachedCTArray.length ; i+=2) {
        bindingsArray.push(cachedCTArray[i]);
      }
      
    }
    else
    {  
      //Try to retrieve the information from database
      var bindingsAndTypeArray = getDynamicBindings(ssRec);
      
      if (bindingsAndTypeArray)
      {
        //save it to the cache for future use
        SaveColumnAndTypeArrayForCache(ssRec.parameters.rsName, bindingsAndTypeArray);
      
        //pull out only the binding information
        for (var i=0; i < bindingsAndTypeArray.length; i+=2)
        {
          bindingsArray.push(bindingsAndTypeArray[i]);
        }
      }
    }
    
    bindingsArray.push(MM.LABEL_FirstRecordIndex);
    bindingsArray.push(MM.LABEL_LastRecordIndex);
    bindingsArray.push(MM.LABEL_TotalRecordIndex);

    retList = getObjectInfoList(bindingsArray, datasourceleaf_filename, "Recordset.htm");
  }
  
  return retList;
}


//*-------------------------------------------------------------------
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
//
//--------------------------------------------------------------------
function generateDynamicDataRef(sourceName, bindingName, dropObject) {
  var retVal = "";
  
  var ssRec = findSSRecByTitle(sourceName,"Recordset.htm");

  if (ssRec != null) {
    
    var paramObj = new Object();
    paramObj.rsName = ssRec.parameters.rsName;
    paramObj.rs = ssRec.parameters.rsName;
    paramObj.bindingName = bindingName;

    if ((bindingName == MM.LABEL_FirstRecordIndex) || (bindingName == MM.LABEL_LastRecordIndex) || (bindingName == MM.LABEL_TotalRecordIndex))  {

      //  Recordset statistics.
      var group = new Group("Recordset Statistics");

      if (bindingName == MM.LABEL_FirstRecordIndex) {
        paramObj.bindingName = "first";
      } else if (bindingName == MM.LABEL_LastRecordIndex) {
        paramObj.bindingName = "last";
      } else if (bindingName == MM.LABEL_TotalRecordIndex)  {
        paramObj.bindingName = "total";
      }
      
      var insertText = group.getInsertStrings(paramObj, "replaceSelection");
      retVal = insertText.join("");

    } else  {
      
      var group = new Group("dynamicData");
      var insertText = group.getInsertStrings(paramObj, "replaceSelection");
      
      retVal = insertText.join("");
      
    }
    
  }

  // If ColdFusion, strip the cfoutput tags if we're inserting inside
  // an existing cfoutput tag.  For other server models, strip the script
  // delimiters if we're inserting inside an existing script block.
  if (dw.getDocumentDOM().serverModel.getServerName() == "Cold Fusion") {
    if (dwscripts.canStripCfOutputTags(dropObject, true))
      retVal = dwscripts.stripCFOutputTags(retVal, true);
  }
  else
  {
    if (dwscripts.canStripScriptDelimiters(dropObject))
      retVal = dwscripts.stripScriptDelimiters(retVal);
  }
  
  return retVal;
}



//*-------------------------------------------------------------------
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

  var aDom = dw.getDocumentDOM();

//if the dom is not available return ...
  if (!aDom)
  {
	return retVal;
  }
  
  var serverModel = aDom.serverModel.getServerName();
  
  if (expression.length &&
      ((serverModel == "Cold Fusion" && expression.indexOf("#") != -1) ||
       (serverModel != "Cold Fusion" && expression.indexOf("<%=") != -1))) {
    
    var rsName = "";
    var bindingName = "";

    //get the group information
    var group = new Group("dynamicData");
    var part = group.getParticipants("replaceSelection")[0];
    
    var params = part.findInString(expression);
    if (params != null) {
      rsName = params.rsName;
      bindingName = params.bindingName;
    }

    if (!rsName) {
      //get the group information
      var group = new Group("Recordset Statistics");
      var part = group.getParticipants("replaceSelection")[0];

      var params = part.findInString(expression);
      if (params != null) {
        rsName = params.rsName;
        bindingName = params.bindingName;
        if (bindingName == "first") {
          bindingName = MM.LABEL_FirstRecordIndex;
        } else if (bindingName == "last") {
          bindingName = MM.LABEL_LastRecordIndex;
        } else if (bindingName == "total") {
          bindingName = MM.LABEL_TotalRecordIndex;
        }
      }
    }

    //find the original ssRec
    var ssRecs = dw.serverBehaviorInspector.getServerBehaviors();
    for (var i=0; i < ssRecs.length; i++) {
      if (ssRecs[i].serverBehavior == "Recordset.htm" && ssRecs[i].parameters.rsName == rsName) {
        retVal[0] = ssRecs[i].title;
        retVal[1] = bindingName;
        break;
      }
    }
          
  }
  
  return retVal;
}


//*-------------------------------------------------------------------
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
  var ssRec = findSSRecByTitle(sourceName,"Recordset.htm")

  if (ssRec != null && !bindingName) {
    dw.serverBehaviorInspector.deleteServerBehavior(ssRec);
  } else if (bindingName) {
    alert(MM.MSG_CantDelColumn);
  }
  
}


//***************** LOCAL FUNCTIONS  ******************


//*-------------------------------------------------------------------
// FUNCTION:
//   getDynamicBindings
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function getDynamicBindings(ss)
{
  var dom = dw.getDocumentDOM();
  if (!dom)
  	return null;
  	
  var serverModel = dom.serverModel.getServerName();

  var bindingsAndTypeArray = new Array();
  
  var connName  =  ss.connectionName
  var statement = ss.source
  var rsName    = ss.rsName

  // remove SQL comments
  statement = statement.replace(/\/\*[\S\s]*?\*\//g, " ");  
 
  var bIsSimple = ParseSimpleSQL(statement);

 //To keep the fix minimized the we do it for simple SQL Statement 
 //only.

  statement = stripCFIFSimple(statement);
   
  if (bIsSimple)
  {
  statement = RemoveWhereClause(statement,false);
  }
  else
  { 
    var pa = new Array()
    if (ss.ParamArray != null) {
    
    for (var i = 0; i < ss.ParamArray.length; i++)
    {
      pa[i] = new Array()
      pa[i][0] = ss.ParamArray[i].name
      pa[i][1] = ss.ParamArray[i].value
    } 
    }
  var statement = replaceParamsWithVals(statement, pa, serverModel);
  }
  bindingsAndTypeArray = MMDB.getColumnAndTypeList(connName, statement)
  //if the where clause fails we just call it again without the where clause 
  if(String(bindingsAndTypeArray).substr(0,9) == "MM_ERROR:"){ 
	statement = RemoveWhereClause(statement,false); 
	bindingsAndTypeArray = MMDB.getColumnAndTypeList(connName, statement);
  }
  return bindingsAndTypeArray;
}

function replaceParamsWithVals(st, pa, serverModel)
{
  var statement = st
  
  if (serverModel == "ASP" || serverModel == "ASPNet" ) {
    for (var i = 0; i < pa.length; i++)
    {
      var theParamVal = String(pa[i][1]).replace(/'/g, "''")
      var myRe = new RegExp("\\b" + pa[i][0] + "\\b","g")
      statement = statement.replace(myRe, theParamVal)
    }
    
  } else if (serverModel == "Cold Fusion" || serverModel == "JSP") {
    for (var i = 0; i < pa.length; i++)
    {
      var myRe = new RegExp("\\b" + pa[i][0] + "\\b","g")
      statement = statement.replace(myRe, pa[i][1])
    }
    statement = stripCFIF(statement);
  }
  
  return statement;
}


function stripCFIF(sql)
{
  var statement = sql.replace(/\n/g, " ")
  statement = statement.replace(/\r/g, " ")
  var found = statement.search(/^(.*)\s*<cfif/i)
  if (found != -1)
  {
    statement = RegExp.$1
  }
  return statement
}

function stripCFIFSimple(sql)
{
  var serverModel = dw.getDocumentDOM().serverModel.getServerName();

  if (serverModel == "Cold Fusion")
  {
    var statement = sql.replace(/\n/g, " ")
    statement = statement.replace(/\r/g, " ")
    var found = statement.indexOf("<cfif")
    if (found != -1)
    {
    statement = statement.substr(0,found);
    }
    return statement
  }
  
  return sql;
}



function RemoveWhereClause(sql,bKeepAway)
{
  //This function truncates the SQL Statement to workaround a bug
  //in CF RDS due to lack for max rows , and in ASP to work around
  //blobs 

  //by Forcing the flag Keep Away it would return the original 
  //SQL Untampered.

  if (bKeepAway)
  {
    return sql;
  }

  var theSQL = String(sql)
  var strOut = theSQL;

  var wherePos = theSQL.search(/\s+where\s+/i)
  if (wherePos != -1)
  {
    strOut = theSQL.substring(0, wherePos)
  }
  
  var orderByPos = strOut.search(/\s+order\s+by\s+/i)
  if (orderByPos != -1)
  {
    strOut = strOut.substring(0, orderByPos)
  }

  strOut = strOut + " where 1=0";

  return strOut;
}
