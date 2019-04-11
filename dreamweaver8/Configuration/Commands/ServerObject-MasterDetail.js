// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

var HELP_DOC = MM.HELP_objMasterDetail;

var _RecordsetName = new RecordsetMenu("","RecordsetName");
var _MasterPageFields = new RecordsetFieldsOrderedList("MasterDetail.htm", "MasterPageFields", "");
var _LinkField = new RecordsetFieldMenu("MasterDetail.htm", "LinkField", "");
var _UniqueKeyField = new RecordsetFieldMenu("MasterDetail.htm", "UniqueKeyField", "");
var _NumRecs = new NumRecButtons("MasterDetail.htm", "NumRecs", "");
var _DetailPageName = new URLTextField("MasterDetail.htm", "DetailPageName", "");
var _DetailPageFields = new RecordsetFieldsOrderedList("MasterDetail.htm", "DetailPageFields", "");
var _Numeric = new CheckBox("MasterDetail.htm","Numeric","");

var _documentTypeID = "";

//--------------------------------------------------------------------
// FUNCTION:
//   commandButtons
//
// DESCRIPTION:
//   API function for commands. Controls dialog buttons.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   an array of button names and function calls
//--------------------------------------------------------------------
function commandButtons()
{
  return new Array(MM.BTN_OK,      "clickedOK()",
                   MM.BTN_Cancel,  "window.close()",
                   MM.BTN_Help,    "displayHelp()");
}



//--------------------------------------------------------------------
// FUNCTION:
//   createMasterDetailSet
//
// DESCRIPTION:
//   Inserts the content into the master and detail pages.
//
//   In this implementation, this function is responsible for all
//   insertion work.
//
// ARGUMENTS:
//   paramObj. Contains properties:
//     RecordsetName -- string
//     MasterPageFields -- array
//     DetailPageFields -- array
//     LinkToField -- string
//     UniqueIDField -- string
//     DetailPagePath -- string, relative path from master page
//     DetailPageName -- string, file name only
//     PageSize -- string or number, "all" or positive integer
//
// RETURNS:
//   string - empty upon success, or an error message
//--------------------------------------------------------------------
function createMasterDetailSet(paramObj)
{
  var docURL = dw.getDocumentPath('document');
  var siteURL = dw.getSiteRoot();
  var detailPageName = paramObj.DetailPageName;
  var detailPageAbsURL = dwscripts.getAbsoluteURL(detailPageName,docURL,siteURL);
  var uniqueIDField = paramObj.UniqueIDField;
  _documentTypeID = dw.getDocumentDOM().documentType;

  // add recordset parameters. Looks for the recordset paramObj.RecordsetName,
  // and adds its parameters to paramObj
  getRecordsetParameters(paramObj);
  
  paramObj.AddQueryString = "QueryString";

  // hava: genericize this so that it is not platform-specific...
  var urlVar = (paramObj.Numeric)?"#URL.recordID#":"'" + "#URL.recordID#" + "'";
  var conditionStr = paramObj.UniqueIDField + " = " + urlVar;

  // new SQL statement used in detail page recordset
  paramObj.SQLStatement = editWhereClause(paramObj.SQLStatement,conditionStr);

  // add navigation bar parameters
  paramObj.FirstLinkText = MM.LABEL_NewMoveToFirstLinkLabel;
  paramObj.PrevLinkText  = MM.LABEL_NewMoveToPrevLinkLabel;
  paramObj.NextLinkText  = MM.LABEL_NewMoveToNextLinkLabel;
  paramObj.LastLinkText  = MM.LABEL_NewMoveToLastLinkLabel;

  // add navigation statistic parameters
  paramObj.beforeFirst = MM.LABEL_RSNavBeforeFirst;
  paramObj.beforeLast  = MM.LABEL_RSNavBeforeLast;
  paramObj.beforeTotal = MM.LABEL_RSNavBeforeTotal;
  paramObj.afterTotal  = MM.LABEL_RSNavAfterTotal;
  paramObj.total = MM.LABEL_RSNavTotal;
  
  if (!dwscripts.selectionIsInBody())
  {
    dwscripts.setCursorToEndOfBody();
  }

  // insert content into master page, which is the currently open page
  if (paramObj.PageSize)
    extGroup.queueDocEdits("MasterPageNumRecs",paramObj,null);
  else
    extGroup.queueDocEdits("MasterPageAllRecs",paramObj,null);
  dwscripts.applyDocEdits();


  // create new or open existing detail page, and prep for insertion
  createAndPrepDetailPage(detailPageName,detailPageAbsURL);

  // create unique name for the detail page recordset
  // Note: the below line of code  *must* be placed at a point
  // in the workflow where the Detail Page already has the focus.
  paramObj.RecordsetName = getUniqueRecordsetName();

  // insert detail page content into detail page, which is currently open
  extGroup.queueDocEdits("DetailPage",paramObj,null);
  dwscripts.applyDocEdits();
  createLiveDataSettings(); // allow detail page to be viewed with Live Data

  // switch focus back to Master Page
  dw.openDocument(docURL);


  return "";

}

//--------------------------------------------------------------------
// FUNCTION:
//   createLiveDataSettings
//
// DESCRIPTION:
//   sets the recordID variable to 1 so that page can be previewed
//   from within the application
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function createLiveDataSettings(detailPageObj)
{
  // NOTE: This is currently Cold Fusion specific
  var str =  "recordID=1";
  dw.setLiveDataParameters(str);
}

//--------------------------------------------------------------------
// FUNCTION:
//   clickedOK
//
// DESCRIPTION:
//   verifies data and alerts err msg if invalid.
//   if valid, sets value of MM.cmdReturnValue to parameters and
//   closes dialog
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   an array of button names and function calls
//--------------------------------------------------------------------
function clickedOK()
{

  var errMsg = "";
  var detailPageName = _DetailPageName.getValue();
  var masterPageName = dwscripts.getFileName(dw.getDocumentPath("document"));
  var rsName = _RecordsetName.getValue();
  var numRecs = _NumRecs.getValue();

  // check that all parameter values are valid

  // check detail page name
  if (   !detailPageName || detailPageName.charAt(0) == " "
      || detailPageName.indexOf("/") != -1 
      || (detailPageName.indexOf(".") == 0) 
      || (detailPageName.indexOf(".") == detailPageName.length - 1)
     )
  {
    errMsg = MM.MSG_invalidDetailPageName;
  }
  
  if (!errMsg)
  {
    if (   (detailPageName == masterPageName) 
        || (masterPageName.indexOf(detailPageName + ".") == 0)
       )
    {
      errMsg = MM.MSG_NeedUniqueDetailPageName;
    }
  }

  if (!errMsg) // check number of records validity
  {
    errMsg = _NumRecs.applyServerBehavior();
  }
  
  if (!errMsg)
  {
    if (numRecs != "all")
    {
      var sbObj = sbUtils.getRepeatRegionWithPageNav(rsName, true);
      if (sbObj != null)
      {
        errMsg = MM.MSG_RepeatRegionWithPageNavExists;
      }
    }
  }

  if (!errMsg) // check that valid columns exist
  {
    var masterFields = _MasterPageFields.getValue();

    if((masterFields.length == 0) ||
       (masterFields.length == 1 && masterFields[0].indexOf("MM_ERROR")!=-1))
    {
      errMsg = MM.MSG_columnsEmpty;
    }
  }


  if (errMsg)
  {
    alert(errMsg);
  }
  else
  {
    paramObj = new Object();
    paramObj.RecordsetName = _RecordsetName.getValue();
    paramObj.MasterPageFields = _MasterPageFields.getValue();
    paramObj.DetailPageFields = _DetailPageFields.getValue();
    paramObj.LinkToField = _LinkField.getValue();
    paramObj.UniqueIDField = _UniqueKeyField.getValue();
    paramObj.DetailPageName = addExtensionToFileName(detailPageName);
    paramObj.PageSize = (_NumRecs.getValue() =="all") ? "":_NumRecs.getValue();
    paramObj.Numeric = _Numeric.getCheckedState();

    MM.cmdReturnValue.push(paramObj);

    window.close();
  }
}



//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//   Prepare the dialog and controls for user input
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function initializeUI()
{
  var elts;

  _RecordsetName.initializeUI();
  _MasterPageFields.initializeUI();
  _LinkField.initializeUI();
  _UniqueKeyField.initializeUI();
  _NumRecs.initializeUI();
  _DetailPageName.initializeUI();
  _DetailPageFields.initializeUI();
  _Numeric.initializeUI();

  elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
}



//-------------------------------------------------------------------
// FUNCTION:
//   displayHelp
//
// DESCRIPTION:
//   displays appropriate help file
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function displayHelp()
{
  dwscripts.displayDWHelp(HELP_DOC);
}



//--------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//   Called from controls to update the dialog based on user input
//
// ARGUMENTS:
//   whatChanged -- string -- key for which UI element has been updated
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function updateUI(whatChanged)
{
  switch (whatChanged)
  {

    case "masterFieldsLength":
      var masterFieldsArr = _MasterPageFields.getValue();
      var linkFieldsArr = _LinkField.listControl.list;

      if (masterFieldsArr.length != linkFieldsArr.length)
      {
        _LinkField.listControl.setAll(masterFieldsArr,masterFieldsArr);
      }
      break;

    default:
      break;
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   getUniqueRecordsetName
//
// DESCRIPTION:
//   Returns a unique recordset name for the current document
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   unique recordset name
//--------------------------------------------------------------------
function getUniqueRecordsetName()
{
  var dsNames = dwscripts.getRecordsetNames();
  var nNames = dsNames.length;
  var num = 0;
  var uniqueName = false;
  var rsName = ""

  while(!uniqueName)
  {
    num++;
    rsName = "Recordset" + num;
    uniqueName = true;
    for (var i=0;i<nNames;i++)
    {
      if (dsNames.toLowerCase() == rsName.toLowerCase())
      {
        uniqueName = false;
        break;
      }
    }
  }

  return rsName;
}



//-------------------------------------------------------------------
// FUNCTION:
//   addExtensionToFileName
//
// DESCRIPTION:
//   Given a file name, check for a file extension, and add a
//   file extension (server-specific) if one does not exist
//
// ARGUMENTS:
//   fileName -- string, file name
//
// RETURNS:
//   file name
//--------------------------------------------------------------------
function addExtensionToFileName(fileName)
{
  var retVal = fileName;
  var hasExtension = (fileName.search(/\.\w+$/) != -1);

  if (!hasExtension)
  {
    var fileExtension = dwscripts.getFileExtension(dw.getDocumentDOM().URL)
    retVal = fileName +"." + fileExtension;
  }

  return retVal;
}

// HE Note: This is modified from the original in Sam's file because I'm passing
// in the entire filter; this makes it generic and easier to copy for multiple users.
// function: editWhereClause -- would better be part of the SQL class

// SQL RELATED FUNCTIONS BELOW, should be moved
// They belong in the main SQL function

var CONST_where = "WHERE";
var CONST_and = "AND";
var CONST_orderBy = "ORDER BY";
var CONST_groupBy = "GROUP BY";

function buildNewSQLSource(sourceStr, index, clause, filter)
{
  var newSource;

  newSource = sourceStr.substr(0, index - 1) + " " + clause + " " + filter + " " + sourceStr.substr(index, sourceStr.length - index);

  return newSource;

}

function editWhereClause(SQLStatement,newFilter)
{

   //var part = new Participant("recordset_sqlVar");
   var sourceStr = SQLStatement
   var filter = "";
   var newSource = "";

   var paramObj = new Object();
   // paramObj.rsName = rsName;
   // paramObj.varName = varName;

   // filter = part.getInsertString(paramObj);

   // filter = colId + " = " + enclosingToken + filter + enclosingToken;

   filter = newFilter;
   var re = new RegExp("\\bwhere\\b","gi");

   var index = sourceStr.search(re);

   if (index == -1) {
     //The where clause was not found in the sql

     var reOrderBy = new RegExp("\\border\\s+by\\b","gi");
     var reGroupBy = new RegExp("\\bgroup\\s+by\\b","gi");
     var orderIndex = sourceStr.search(reOrderBy);
     var groupIndex = sourceStr.search(reGroupBy);
     if(groupIndex == orderIndex)
     {
         //This can only mean that the group by and order by clause both don't exist (index returns -1).
         newSource = sourceStr + " " + CONST_where + " " + filter;
     } else {

         var groupBoolean = new Boolean(false);

         // Either group by or order by or both clauses exist in the sql.
       if((groupIndex > -1) && (orderIndex > -1)) {
           // both clause's exist. Check which one has the least index value and insert the filter before it.
         groupBoolean = (groupIndex < orderIndex);
       } else {
           //only one clause exists. Check which one has the greater index value and insert the filter before it.
             groupBoolean = (groupIndex > orderIndex);
       }
       if(groupBoolean)
          newSource = buildNewSQLSource(sourceStr, groupIndex, CONST_where, filter);
       else
          newSource = buildNewSQLSource(sourceStr, orderIndex, CONST_where, filter);
     }
   } 
   else 
   {
     //The sql contains a where clause. We need to find out where it is and insert our filter just after it.
     //newSource = sourceStr.substr(0, index + 6) + filter + " AND " + sourceStr.substr(index + 6);
		 //bug #174946 invalid SQL created in detail page when master page uses a filtered recordset and is preceded by a search page  
      newSource = sourceStr.substr(0, index) + " " + CONST_where + " " + filter;
   }

   return newSource;
}

//--------------------------------------------------------------------
// FUNCTION:
//   getUniqueRecordsetName
//
// DESCRIPTION:
//   Returns a unique recordset name for the current document
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   unique recordset name
//--------------------------------------------------------------------
function getUniqueRecordsetName()
{
  var dsNames = dwscripts.getRecordsetNames();
  var nNames = dsNames.length;
  var num = 0;
  var uniqueName = false;
  var rsName = ""

  while(!uniqueName)
  {
    num++;
    rsName = "Recordset" + num;
    uniqueName = true;
    for (var i=0;i<nNames;i++)
    {
      if (dsNames[i].toLowerCase() == rsName.toLowerCase())
      {
        uniqueName = false;
        break;
      }
    }
  }

  return rsName;
}

//--------------------------------------------------------------------
// FUNCTION:
//   getSQLStringForURLVariable
//
// DESCRIPTION:
//   Returns url variable surrounded by appropriate delimiters
//
// ARGUMENTS:
//   connName -- string, name of connection. Note: in CF, this is the data source name
//   tableName -- string, name of table
//   colName -- string, name of column
//   varStr -- string, url variable for sql statement, e.g.: #URL.recordID#
//
//
//
// RETURNS:
//   unique recordset name
//--------------------------------------------------------------------
function getSQLStringForURLVariable(connName,tableName,colName,varStr)
{
    var colAndTypes = MMDB.getColumnAndTypeOfTable(connectionName, tableName);
    var nItems = colAndTypes.length;
    var i;
    var colType = "";
    var retVal = colName;

    // find colName in colAndTypesArr
    // note that colAndTypes is single dimensional array in form of
    // column name, column type, etc.

    for (i=0;i<nItems;i+=2)
    {
      if (colAndTypes[i] == colName)
      {
        colType = colAndTypes[i+1];
      }
    }

    // hava: is colType number or string type? Will next clause work?
    if (colType)
    {
      retVal = dwscripts.getSQLStringForDBColumnType(varStr,colType);
    }
    else
    {
      // this case should not be hit, but if it is, use no delimiters
      retVal = varStr;
    }

    return retVal;


}

//--------------------------------------------------------------------
// FUNCTION:
//   getRecordsetParameters
//
// DESCRIPTION:
//   Finds paramObj.RecordsetName in the current document, and adds all
//   recordset related parameters to paramObj
//   NOTE: Another way to do this would be use an explicit recordset
//   copying method. hava: is one way preferable over another?
//
// ARGUMENTS:
//   paramObj -- object to store parameters. Must include a property
//   named "RecordsetName" with a valid recordset name.
//   The recordset properties are added to paramObj. Note: this
//   function will override existing paramObj properties of the same
//   name.
//
// RETURNS:
//   nothing. paramObj is passed by reference; return value not needed.
//--------------------------------------------------------------------
function getRecordsetParameters(paramObj)
{
  var sbRecs = dw.sbi.getServerBehaviors();
  var nRecs = sbRecs.length;
  var rsName = paramObj.RecordsetName;
  var i;
  var currRec = "";

  for (i=0;i<nRecs;i++)
  {
    currRec = sbRecs[i];
    if (currRec.getName() == "Recordset" && currRec.getParameter("RecordsetName") == rsName)
    {
      rsParamObj = currRec.getParameters();
      break;
    }
  }

  // add recordset parameters to paramObj
  for (var i in rsParamObj)
  {
    paramObj[i] = rsParamObj[i];
  }
}




// shamelessly copied -- only temporary to focus on major issues first
// add to common dwscripts file? or at least to server behavior file
// in any case, move it!

//Invokes dialog to allow user to select filename. Puts value in text input.
// The optional flag stripParameters will remove anything after a question
// mark if it is set to true

function browseFile(fieldToStoreURL, stripParameters)
{
  var fileName = "";
  fileName = browseForFileURL();  //returns a local filename
  if (stripParameters) {
    var index = fileName.indexOf("?");
    if (index != -1) {
      fileName = fileName.substring(0,index);
    }
  }
  if (fileName) fieldToStoreURL.value = fileName;
}


//--------------------------------------------------------------------
// FUNCTION:
//   createAndPrepDetailPage
//
// DESCRIPTION:
//   Looks at detail page name to determine if it exists. Creates
//   file for detail page if it does not already exist. Preps file
//   in either case to ensure that future html insertion will not
//   cause invalid html markup.
//
//
// ARGUMENTS:
//   detailPageName -- string
//   detailPageAbsURL -- string -- detail page absolute path
//   dom (optional) -- document object model for current document
//
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function createAndPrepDetailPage(detailPageName,detailPageAbsURL,theDom)
{
  var detailPageExists = dwscripts.fileExists(detailPageAbsURL);
  var detailPageIsOpen = detailPageExists && dwscripts.fileIsCurrentlyOpen(detailPageAbsURL);
  var detailPageIsOpen = false;
  var dom = (theDom)?theDom:dw.getDocumentDOM();

  if (detailPageExists)
  {
    dw.openDocument(detailPageAbsURL);
    dom = dw.getDocumentDOM();

    if (detailPageIsOpen)
    {
      // move cursor from head, move outside of block tags
      dwscripts.fixUpSelection(dom,false,false);
    }
      else
    {
      // if it was closed, move cursor to the end of the just-opened document
      dwscripts.setCursorToEndOfBody(dom);
    }
  }

  else // create a new page to use as the detail page
  {
    dw.createDocument(false, _documentTypeID);
    dom = dw.getDocumentDOM();
    dw.saveDocument(dom,detailPageAbsURL);
  }
}

