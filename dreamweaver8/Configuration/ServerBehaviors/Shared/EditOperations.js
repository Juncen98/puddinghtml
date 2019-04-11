// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var LIST_CONN, LIST_TABLE, LIST_COL, MAP_COL_TYPES, LIST_RS;
var LIST_FORM, LIST_FIELDS, LIST_FCOL, LIST_FORMAT;
var EMPTY_LIST = new Array("");

var FORMAT_FOR_STRING = "',none,''";       //IMPORTANT! Ensure values appear in the UI select 'fieldColFormat'
var FORMAT_FOR_NUMBER = "none,none,NULL";
var FORMAT_FOR_DATE   = "',none,NULL";
var FORMAT_FOR_CHECKBOX_STRING = "none,'Y','N'";
var FORMAT_FOR_CHECKBOX_NUMBER = "none,1,0";


//These patterns are used to detect if form elements are dynamically bound.
//If we find a match, this same binding is used as the default binding for the edit op.
var PATT_AspJsBoundAttr = "Fields\\.Item\\(\"(\\w+)\"\\)\\.Value";
var PATT_AspVbBoundAttr = "Fields\\.Item\\(\"(\\w+)\"\\)\\.Value";
var PATT_CfmlBoundAttr = "\\w+\\.(\\w+)";
var PATT_JspBoundAttr = "getObject\\(\"(\\w+)\"\\)";


//******************* API **********************

//--------------------------------------------------------------------
// FUNCTION:
//   canApplyServerBehavior
//
// DESCRIPTION:
//   Returns true if a Server Behavior can be applied to the current
//   document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   boolean - true if the behavior can be applied, false otherwise
//--------------------------------------------------------------------
function canApplyServerBehavior(sbObj)
{
  var errMsgStr = "";

  if (PROP_TYPE != "insertRecord" && dwscripts.getRecordsetNames().length == 0) { //if update/del and no recordsets
    errMsgStr += dwscripts.sprintf(MM.MSG_NoRecordsets, dwscripts.getRecordsetDisplayName());
  }
  
  if (findAllForms().length == 0) {  //if there are no forms
    errMsgStr += MM.MSG_NoForms;
  }
  
  if (errMsgStr) alert(errMsgStr); //popup error message
  return (errMsgStr == "");     //return false if error message
}


//--------------------------------------------------------------------
// FUNCTION:
//   findServerBehaviors
//
// DESCRIPTION:
//   Returns an array of ServerBehavior objects, each one representing
//   an instance of this Server Behavior on the page
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   JavaScript Array of ServerBehavior objects
//--------------------------------------------------------------------
function findServerBehaviors()
{
  var paramObj = new Object();
  var currServerModel = dw.getDocumentDOM().serverModel.getServerName();
  var sbList = dwscripts.findSBs();
  
  //do some extra processing on the ssRecs
  for (var i=0; i < sbList.length; i++) {
    var sbObj = sbList[i];
    sbObj.errorMsg = "";
    
    // check if the form name has changed
    var formName = sbObj.getParameter("formName");
    if (formName && formName != "true")
    {
      var formNode = sbObj.getParameter("formNode");
      if (formNode && formNode.getAttribute("name") != formName)
      {
        sbObj.incomplete = true;
      }
    }
    
    //set the selectedNode
    sbList[i].selectedNode = sbList[i].parameters.formNode;
    
    //set the title
    sbList[i].title = getNewTitle();
    var titleStr = "";
    if (sbList[i].parameters.rs) {
      titleStr += ((titleStr)?", ":"") + sbList[i].parameters.rs;
    }
    if (sbList[i].selectedNode && sbList[i].selectedNode.getAttribute("NAME")) {
      titleStr += ((titleStr)?", ":"") + MM.TYPE_Form + ' "'+sbList[i].selectedNode.getAttribute("NAME")+'"';
    }
    sbList[i].title += " ("+ titleStr + ")";
      
    //convert the elemStr into an array of values for old edit ops
    if (sbObj.parameters.elemStr) {
      if (currServerModel == "Cold Fusion") {
        sbObj.parameters.elemStr = sbObj.parameters.elemStr.replace(/##/g,"#");
      }
      var fields = sbObj.parameters.elemStr.split(","); //get comma-separated list of array params
      sbObj.parameters.fields = new Array();
      for (var j=0; j+4 < fields.length; j+=5) {
        sbObj.parameters.fields.push(dwscripts.trim(fields[j]));
        var columnName = unwrapNamesWithSpaces(dwscripts.trim(fields[j+1]));
        sbObj.parameters.fields.push(columnName);
        sbObj.parameters.fields.push(fields[j+2] + "," + fields[j+3] + "," + fields[j+4]);
      }
    }
    
    //convert the fieldsStr and columnsStr into an array of values
    if (sbObj.parameters.fieldsStr && sbObj.parameters.columnsStr) {
      if (currServerModel == "Cold Fusion") {
        sbObj.parameters.fieldsStr = sbObj.parameters.fieldsStr.replace(/##/g,"#");
        sbObj.parameters.columnsStr = sbObj.parameters.columnsStr.replace(/##/g,"#");
      }
      var fields = sbObj.parameters.fieldsStr.split("|"); //get comma-separated list of array params
      var columns = sbObj.parameters.columnsStr.split("|"); //get comma-separated list of array params
      sbObj.parameters.fields = new Array();
      for (var j=0; j+1 < fields.length; j+=2) {
        sbObj.parameters.fields.push(dwscripts.trim(fields[j]));
        var columnName = unwrapNamesWithSpaces(dwscripts.trim(columns[j]));
        sbObj.parameters.fields.push(columnName);
        sbObj.parameters.fields.push(columns[j+1]);
      }
    }
    
    //convert old edit ops to the ned parameter name
    if (sbObj.parameters.url && !sbObj.parameters.redirect__url) {
      sbObj.parameters.redirect__url = sbObj.parameters.url;
    } else if (!sbObj.parameters.redirect__url) {
      sbObj.parameters.redirect__url = "";
    }
    
    //check if the table contains a space
    if (sbObj.parameters.table && sbObj.parameters.table.indexOf("[") != -1) {
      sbObj.parameters.table = sbObj.parameters.table.substring(1,sbObj.parameters.table.length-1)
    }
    
    //check if the code is out of date
    if (sbObj.type.indexOf("UD1") != -1) {
      sbObj.title += MM.LABEL_OutOfDate;
      sbObj.outOfDate = true;
    }

    //set the connection name
    if (sbObj.parameters.cname != null) {
      var dom = dw.getDocumentDOM();

			//if the current server model is JSP
			var urlformat = sbObj.parameters.urlformat;
			if (currServerModel == "JSP") 
			{
			  //if the connection relative path begins with '/' it is site relative
				if ((sbObj.parameters.relpath != null) && (sbObj.parameters.relpath[0]=='/'))
				{
					//set the urlformat to virtual
					urlformat = "virtual";
				}
			}

      if (dom && dom.URL && sbObj.parameters.relpath != getConnectionsPath(sbObj.parameters.cname,urlformat)) {
        sbObj.incomplete = true;
        sbObj.errorMsg += "\n"+MM.MSG_ConnectionPathInvalid;
      }
    } else  if (sbObj.parameters.conn) {
      if (currServerModel == "Cold Fusion" && !sbObj.parameters.dataSource) {
        sbObj.parameters.dataSource = sbObj.parameters.conn;
      }
      if (currServerModel == "ASP")
        sbObj.parameters.conn = '"' + sbObj.parameters.conn + '"';

      sbObj.parameters.cname = MMDB.getConnectionName(sbObj.parameters.conn,
                                                  sbObj.parameters.driver,
                                                  sbObj.parameters.dataSource, 
                                                  sbObj.parameters.username, 
                                                  sbObj.parameters.password);
    }

  }

  return sbList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//   Collects values from the form elements in the dialog box and
//   adds the Server Behavior to the user's document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   string - empty upon success, or an error message
//--------------------------------------------------------------------
function applyServerBehavior(sbObj)
{
  var errMsgStr = '';
  
  var cname = (LIST_CONN.object) ? LIST_CONN.get() : '';
  var username = (LIST_CONN.object) ? MMDB.getUserName(LIST_CONN.get()) : '';
  var password = (LIST_CONN.object) ? MMDB.getPassword(LIST_CONN.get()) : '';
  var driver = (LIST_CONN.object) ? MMDB.getDriverName(LIST_CONN.get()) : '';  
  var table = (LIST_TABLE.object) ? LIST_TABLE.getValue() : '';
  var rs = (LIST_RS.object) ? LIST_RS.getValue() : '';
  var col = (LIST_COL.object) ? LIST_COL.getValue() : '';
  var colQuote = "'";
  if (document.theForm.colIsNum && document.theForm.colIsNum.checked) colQuote = "";
  var form = (LIST_FORM.object) ? LIST_FORM.getValue() : '';
  var formName = (form && form.getAttribute("name")) ? form.getAttribute("name") : dwscripts.getUniqueNameForTag("FORM", "form");
  var elements = (LIST_FIELDS.object) ? LIST_FIELDS.valueList : new Array();
  var url = document.theForm.redirectURL.value;
  
  if (LIST_CONN.object && !cname) {
    errMsgStr = MM.MSG_NoConnection;
  } else if (LIST_TABLE.object && !table) {
    errMsgStr = MM.MSG_NoTables;
  } else if (LIST_RS.object && !rs) {
    // handled by can apply
  } else if (LIST_COL.object && !col) {
    errMsgStr = MM.MSG_NoColumn;
  } else if (LIST_FORM.object && !form) {
    // handled by can apply
  } else if (LIST_FIELDS.object && (!elements.length || !elements[0])) {
    errMsgStr = MM.MSG_NoFormFields;
  }
  if (LIST_FIELDS.object && !errMsgStr) {
    for (var i=0; i < elements.length; i++)
      if (elements[i].column != '') break;
    if (i >= elements.length) 
      errMsgStr = MM.MSG_NoFormColumn;
  }
  if (LIST_RS.object && !errMsgStr) {
    // check that the selected column exists in the recordset
    var colList = dwscripts.getFieldNames(LIST_RS.getValue());
    for (var i=0, found=false; !found && i < colList.length; i++)
      found = (colList[i].toLowerCase() == col.toLowerCase());
    if (!found)
	{
      errMsgStr = dwscripts.sprintf(MM.MSG_NoColumnInRS, dwscripts.getRecordsetDisplayName());
     }
  }

  // check that the form does not have other edit op scripts applied
  if (!errMsgStr) {
    var currRec;
    var ssRecs = dw.serverBehaviorInspector.getServerBehaviors();
    for (var i=0, found=false; !found && i < ssRecs.length; i++) {
      currRec = ssRecs[i];
      found = (currRec.type && 
               (currRec.type == "insertRecord" || currRec.type == "deleteRecord" ||
                currRec.type == "updateRecord") &&
                currRec.parameters.formNode == form &&
                currRec != sbObj )
 
    }
    if (found) errMsgStr = MM.MSG_EditOpExists;
  }

  if (!errMsgStr) {
    //convert the elements array into 2 strings
    var fieldsStr = "";
    var columnsStr = "";
    for (var i=0; i < elements.length; i++) {
      if (elements[i].column) {
        if (fieldsStr) {
          fieldsStr += "|";
        }
        if (columnsStr) {
          columnsStr += "|";
        }
        fieldsStr += elements[i].obj.getAttribute("NAME") + "|value";
        columnsStr += wrapNamesWithSpaces(elements[i].column) + "|" + elements[i].type;
                   
      }
    }
    
    if (dw.getDocumentDOM().serverModel.getServerName() == "Cold Fusion") {
      fieldsStr = fieldsStr.replace(/#/g,"##");
      columnsStr = columnsStr.replace(/#/g,"##");      
    }
    
 
    var paramObj = new Object();
    paramObj.cname = cname;
    var currServerModel = dw.getDocumentDOM().serverModel.getServerName();
		if (sbObj != null)
		{
			//get the existing url format from the current server behavior
			paramObj.urlformat = sbObj.parameters.urlformat;
			if (currServerModel == "JSP")
			{
				if ((sbObj.parameters.relpath != null) && (sbObj.parameters.relpath[0]=='/'))
				{
					//set the urlformat to virtual
					paramObj.urlformat = "virtual";
				}
			}
		}
		else
		{
		  //get the default url format
			paramObj.urlformat = getConnectionsUrlFormat(dw.getDocumentDOM());
		}
    paramObj.relpath = getConnectionsPath(paramObj.cname, paramObj.urlformat);
    paramObj.ext = getServerExtension();
		//for JSP file with "/" serves as virtual url prefix, so change the urlformat to "file"
		if ((currServerModel == "JSP") && ((paramObj.urlformat != null) && (paramObj.urlformat == "virtual")))
		{
			paramObj.urlformat = "file";
		}

    
    //special case the update of connection_ref, to prevent multiple
    // connection statements from being created
    if (sbObj && 
        (sbObj.parameters.relpath != paramObj.relpath ||
         sbObj.parameters.ext != paramObj.ext) &&
        sbObj.parameters.cname == paramObj.cname) {
      sbObj.MM_forcePriorUpdate = "connectionref_statement";
    }

    paramObj.table = wrapNamesWithSpaces(table);
    paramObj.rs = rs;
    paramObj.col = col;
    paramObj.colQuote = colQuote;
    paramObj.formNode = form;
    paramObj.formName = formName;
    paramObj.fieldsStr = fieldsStr;
    paramObj.columnsStr = columnsStr;
    paramObj.redirect__url = url;
    
    dwscripts.applySB(paramObj, sbObj);
    
    // TODO: set the FORM METHOD to POST
  }

  return errMsgStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   analyzeServerBehavior
//
// DESCRIPTION:
//   Performs extra checks needed to determine if the Server Behavior
//   is complete
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//   allRecs - JavaScripts Array of ServerBehavior objects - all of the
//             ServerBehavior objects known to Dreamweaver
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function analyzeServerBehavior(sbObj, allRecs)
{
  // find our hidden id node within sbObj
  var hiddenIdNode = null;
  for (var i=0; i < sbObj.types.length; i++) {
    if (sbObj.types[i] == "editOps_hiddenRecordId") {
      hiddenIdNode = sbObj.participants[i];
      break;
    }
  }
    
  // This looks like it should be moved to command.js
  // where we would analyze all SB participants.  If
  // another behavior claims that script, the command
  // should delete itself. -LLT
  for (var i = 0; i < allRecs.length; i++)
  {
    var thisRec = allRecs[i];
    if (thisRec.type == "command") {
      if ((thisRec.cdName == "MM_insertCmd") || 
          (thisRec.cdName == "MM_updateCmd") || 
          (thisRec.cdName == "MM_deleteCmd")) {
        thisRec.deleted = true;
      }
    }
    
    // elminate references to our hidden id node
    if (hiddenIdNode && (thisRec.type == "dynamicBinding" || thisRec.type == "dynamicTextField")) {
      if (thisRec.participants[0] == hiddenIdNode) {
        thisRec.deleted = true;
      }
    }
  }

  
  // check that all form fields referenced in the server code are still in the document
  // if they are not, store the names of the missing ones in a missingFields property
  sbObj.missingFields = "";
  var theForm = sbObj.selectedNode;
  var fieldsArr = sbObj.parameters.fields
  if (fieldsArr && fieldsArr.length) {
    var nItems = fieldsArr.length, i, fieldName; 

    for (i=0;i<(nItems-2);i+=3){
      fieldName = fieldsArr[i];
      if (!theForm || !theForm[fieldName]) {
        sbObj.missingFields += fieldName + ","
        sbObj.incomplete = true;
      } 
    }
    
    if (sbObj.missingFields) {
      sbObj.missingFields = sbObj.missingFields.substring(0,sbObj.missingFields.length-1);
    }
  }
  
  if (sbObj.parameters.rs)
  {
    var rsList = dwscripts.getRecordsetNames();
    var found = false;
    for (var i=0; i < rsList.length; i++)
    {
      if (sbObj.parameters.rs == rsList[i])
      {
        found = true;
        break;
      }
    }
    if (!found)
    {
      sbObj.incomplete = true;
    }
  }
  
  
}


//--------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//   Sets the values of the form elements in the dialog box based
//   on the given ServerBehavior object
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function inspectServerBehavior(sbObj)
{
  var result = false, rsResult = false;

  LIST_FORM.setAll(Array(LIST_FORM.get()),Array(LIST_FORM.getValue())); //restrict formlist to current

  if (LIST_CONN.object) {
    result = LIST_CONN.pickValue(sbObj.parameters.cname);
    if (!result) alert(dwscripts.sprintf(MM.MSG_ConnNotFound, sbObj.parameters.cname));
    updateUI('connectionList');
  }

  if (result && LIST_TABLE.object) {
    result = LIST_TABLE.pickValue(sbObj.parameters.table);
    if (!result) alert(MM.MSG_TableNotFound);
    updateUI('tableList');
  }

  if (LIST_RS.object) {  
    rsResult = LIST_RS.pickValue(sbObj.parameters.rs);
    if (!rsResult)
	{
	  alert(dwscripts.sprintf(MM.MSG_RsNotFound, dwscripts.getRecordsetDisplayName()));
	} 
  }

  if (result && LIST_COL.object) {
    result = LIST_COL.pickValue(sbObj.parameters.col);
    if (!result) alert (MM.MSG_TColNotFound);
  }

  if (document.theForm.colIsNum) {
    document.theForm.colIsNum.checked = (!sbObj.parameters.colQuote);
  }

  if (result && LIST_FIELDS.object && LIST_FIELDS.valueList.length > 0) {
    
    //set up the field mappings
    for (var i=0; i<LIST_FIELDS.getLen(); i++) {
      var fieldObj = LIST_FIELDS.getValue(i);
      if (fieldObj)
      {
        var fieldObjName = fieldObj.obj.getAttribute("NAME");
        fieldObj.column = ''; // clear the current column mapping
        if (fieldObjName) { //search prior list for match
          for (var j=0; j<sbObj.parameters.fields.length-2; j+=3) { //scan field array which is triples: fieldname, colname, type
            if (sbObj.parameters.fields[j] == fieldObjName) {
              fieldObj.column = sbObj.parameters.fields[j+1];
              if (fieldObj.type != sbObj.parameters.fields[j+2])
                fieldObj.type = sbObj.parameters.fields[j+2];
              LIST_FIELDS.setValue(fieldObj,i);
              break;
    } } } } }
    
    //check the column mappings
    var missingCols = "";
    var colsAndTypes = MMDB.getColumnAndTypeOfTable(LIST_CONN.get(),LIST_TABLE.getValue())
    var colList = new Array();
    for (var i=0; i < colsAndTypes.length; i+=2) {
      colList.push(colsAndTypes[i]);
    }
    for (var i=0; i < LIST_FIELDS.getLen(); i++) {
      var value = LIST_FIELDS.getValue(i);
      if (value && value.column) {
        for (var j=0,found=false; !found && j < colList.length; j++)
          found = (value.column == colList[j]);
        if (!found) {
          missingCols += ((missingCols!="")?", ":"") + value.column;
          value.column = '';
    } } }
    if (missingCols != "") {
      alert(MM.MSG_ColNotFound.replace(/%s/g,missingCols));
    }
    var fieldValues = LIST_FIELDS.valueList;
    var fieldNames = getFormFieldNames(fieldValues);     //make nicenames
    if (fieldNames.length > 0) 
      LIST_FIELDS.setAll(fieldNames, fieldValues);
    else
      LIST_FIELDS.setAll(new Array(MM.LABEL_NoFields), EMPTY_LIST);
    updateUI("fieldsList");
  }
  

  
  // check that all form fields referenced in the server code are still in the document
  if (sbObj.missingFields && sbObj.missingFields != "") {
    alert(dwscripts.sprintf(MM.MSG_FormFieldsNotFound,sbObj.missingFields))
  }

  if (document.theForm.redirectURL) document.theForm.redirectURL.value = sbObj.parameters.redirect__url;
  
  if (sbObj.outOfDate) {
    alert(MM.MSG_SBOutOfDate);
  }
  if (sbObj.errorMsg) {
    alert(sbObj.errorMsg);
  }

}


//--------------------------------------------------------------------
// FUNCTION:
//   deleteServerBehavior
//
// DESCRIPTION:
//   Remove the specified Server Behavior from the user's document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function deleteServerBehavior(sbObj)
{
  dwscripts.deleteSB(sbObj);
  return true;
}


//--------------------------------------------------------------------
// FUNCTION:
//   displayHelp
//
// DESCRIPTION:
//   Displays the built-in Dreamweaver help.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function displayHelp()
{
  // Replace the following call if you are modifying this file for your own use.
  dwscripts.displayDWHelp(HELP_DOC);
}


//***************** LOCAL FUNCTIONS  ******************


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

  //build Connection menu
  LIST_CONN = new ListControl("connectionList")
  if (LIST_CONN.object) {
    var connNames = MMDB.getConnectionList();
    connNames.splice(0,0,MM.LABEL_None);
    if (connNames.length > 0) 
      LIST_CONN.setAll(connNames,connNames);
    else
      LIST_CONN.setAll(new Array(MM.LABEL_NoConnections), EMPTY_LIST);
  }
  
  LIST_TABLE = new ListControl("tableList");
  LIST_COL = new Object();
  // LIST_COL not defined for insertRecord
  if (PROP_TYPE.indexOf("insert") == -1)
  {
    LIST_COL = new ListControl("tableColList");
  }

  MAP_COL_TYPES = new Array();
  
  //build Recordset menu
  LIST_RS = new Object();
  // LIST_RS not defined for insertRecord
  if (PROP_TYPE.indexOf("insert") == -1)
  {
    LIST_RS = new ListControl("rsList");
  }
  if (LIST_RS.object) {
    var rsNames = dwscripts.getRecordsetNames();
    if (rsNames) 
    {
	  LIST_RS.setAll(rsNames,rsNames);
    }
	else
	{
      LIST_RS.setAll(new Array(dwscripts.sprintf(MM.LABEL_NoRecordsets, dwscripts.getRecordsetDisplayName())), EMPTY_LIST);
	}
  }
  
  //build Form menu
  LIST_FORM = new ListControl("formList");
  if (LIST_FORM.object) {
    var formValues = findAllForms();
    var formNames = getFormNames(formValues);
    if (formNames) 
      LIST_FORM.setAll(formNames,formValues);
    else
      LIST_FORM.setAll(new Array(MM.LABEL_NoForms), EMPTY_LIST);
  }
  
  LIST_FIELDS = new Object();
  LIST_FCOL   = new Object();
  // LIST_FIELDS & LIST_FCOL not defined for delete record
  if (PROP_TYPE.indexOf("delete") == -1)
  {
    LIST_FIELDS = new ListControl("fieldsList");
    LIST_FCOL   = new ListControl("fieldColList");
  }
  
  if (dwscripts.findDOMObject("fieldColFormat"))
    LIST_FORMAT = new ListControl("fieldColFormat",null,true);  //load from the HTML select
  
  //get the selected form, and set it to selected
  if (LIST_FORM.object) {
    var selection = getSelectedForm();
    if (selection) LIST_FORM.pickValue(selection);
  }
  
  //based on the form, try to get the recordset
  updateUI('formList');  //get the form list
  if (LIST_RS.object) {
    rsValue = getRecordsetFromForm();
    if (rsValue) LIST_RS.pickValue(rsValue);
  }

  //from the recordset, try to get the connection and table
  
  updateUI('connectionList');
  updateUI('rsList');

  elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
}


//Update the UI elements

function updateUI(item)
{
  if (item == "defineConnection" && LIST_CONN.object) {
    var pickedValue = LIST_CONN.getValue();
    MMDB.showConnectionMgrDialog()
    var connNames = MMDB.getConnectionList();
    connNames.unshift(MM.LABEL_None);
    if (connNames.length > 0) 
      LIST_CONN.setAll(connNames,connNames);
    else
      LIST_CONN.setAll(new Array(MM.LABEL_NoConnections), EMPTY_LIST);
    if (pickedValue)
      LIST_CONN.pickValue(pickedValue);
    updateUI('connectionList');
    
  } else if (item == "connectionList" && LIST_TABLE.object) {
    var tableNames = new Array();
    if (LIST_CONN.get() != MM.LABEL_None) {
      var tableObjects = MMDB.getTables(LIST_CONN.get());
      for (var i = 0; i < tableObjects.length; i++) {
        var tableName = "";
        if (tableObjects[i].schema != "") {
          tableName = dwscripts.trim(tableObjects[i].schema) + ".";
        } else if (tableObjects[i].catalog != "") {
          tableName = dwscripts.trim(tableObjects[i].catalog) + ".";
        }
        tableName += tableObjects[i].table;
        if (tableName) {
          tableNames.push(tableName);
        }
      }
    }
    if (tableNames.length > 0) 
      LIST_TABLE.setAll(tableNames,tableNames);
    else
      LIST_TABLE.setAll(new Array(MM.LABEL_NoTables), EMPTY_LIST);
    updateUI('tableList');
    
  } else if (item == "tableList") {
    var colsAndTypes = MMDB.getColumnAndTypeOfTable(LIST_CONN.get(), LIST_TABLE.getValue())
    var colNames = new Array();
    var colTypes = new Array();
    for (var i=0; i < colsAndTypes.length; i+=2) {
      colNames.push(colsAndTypes[i]);
      colTypes[colsAndTypes[i]] = colsAndTypes[i+1];
    }
    MAP_COL_TYPES = colTypes;
    
    if (LIST_COL.object) {//set the table columns list
      if (colNames.length > 0) {
        LIST_COL.setAll(colNames,colNames);
      } else {
        LIST_COL.setAll(new Array(MM.LABEL_NoColumns), EMPTY_LIST);
      }
      
      updateUI("tableColList");
    }
    
    if (LIST_FCOL.object) {
      //create and set the form fields column list (add <ignore> option)
      var fcolNames = new Array();
      var fcolValues = new Array();
      for (i=0; i < colNames.length; i++) {
        fcolNames.push(colNames[i]);
        fcolValues.push(colNames[i]);
      }
      fcolNames.unshift(MM.LABEL_Ignore);
      fcolValues.unshift("");
      if (fcolNames.length > 0) {
        LIST_FCOL.setAll(fcolNames,fcolValues);
      } else {
        LIST_FCOL.setAll(new Array(MM.LABEL_NoColumns), EMPTY_LIST);
      }
    }
    
    //update the fields list based on the newly selected table
    if (LIST_FIELDS.object && LIST_FIELDS.valueList[0]) {
      updateColumnRefs(LIST_FIELDS.valueList,colNames);
      var fieldNames = getFormFieldNames(LIST_FIELDS.valueList);
      if (fieldNames.length > 0) 
        LIST_FIELDS.setAll(fieldNames, LIST_FIELDS.valueList);
      else
        LIST_FIELDS.setAll(new Array(MM.LABEL_NoFields), EMPTY_LIST);
      updateUI("fieldsList");
    }
    
  } else if (item == "tableColList" && LIST_COL.object) {
    var column = LIST_COL.getValue();
    if (MAP_COL_TYPES[column] != null) {
      if (dwscripts.isNumericDBColumnType(MAP_COL_TYPES[column])) {
        document.theForm.colIsNum.checked = true;
      } else {
        document.theForm.colIsNum.checked = false;
      }
    }
      
  } else if (item == "formList" && LIST_FIELDS.object) {
    if (LIST_FORM.getLen()) {
      var fieldValues = findAllFormFields(LIST_FORM.getValue());
      updateColumnRefs(fieldValues, LIST_FCOL.valueList);
      var fieldNames = getFormFieldNames(fieldValues);
      if (fieldValues.length && fieldNames.length) 
        LIST_FIELDS.setAll(fieldNames, fieldValues);
      else {
        LIST_FIELDS.setAll(new Array(MM.LABEL_NoFields), EMPTY_LIST);
      }
      updateUI("fieldsList")
    }
    
  } else if (item == "fieldsList" && LIST_FIELDS.object) {
    currObj = LIST_FIELDS.getValue();
    if (currObj != null) {
      LIST_FCOL.pickValue(currObj.column);
      LIST_FORMAT.pickValue(currObj.type);
    }
    
  }
  else if (item == "fieldColList" && LIST_FIELDS.object)
  {
    currObj = LIST_FIELDS.getValue();
    if (currObj != null)
    {
      currObj.column = LIST_FCOL.getValue();
      if (MAP_COL_TYPES[currObj.column] != null)
      {
        if (dwscripts.isNumericDBColumnType(MAP_COL_TYPES[currObj.column]))
        {
          currObj.type = (currObj.isCheckbox)? FORMAT_FOR_CHECKBOX_NUMBER : FORMAT_FOR_NUMBER;
        } else if (dwscripts.isDateDBColumnType(MAP_COL_TYPES[currObj.column]) &&
                   !currObj.isCheckbox)
        {
          currObj.type = FORMAT_FOR_DATE;
        } 
        else
        {
          currObj.type = (currObj.isCheckbox)? FORMAT_FOR_CHECKBOX_STRING : FORMAT_FOR_STRING;
        }
        
        LIST_FORMAT.pickValue(currObj.type);
      }

      var fieldNames = getFormFieldNames(LIST_FIELDS.valueList);
      if (fieldNames.length > 0) 
        LIST_FIELDS.setAll(fieldNames, LIST_FIELDS.valueList);
      else
        LIST_FIELDS.setAll(new Array(MM.LABEL_NoFields), EMPTY_LIST);        
    }
    
  } else if (item == "fieldColFormat" && LIST_FIELDS.object) {
    currObj = LIST_FIELDS.getValue();
    if (currObj != null) {
      currObj.type = LIST_FORMAT.getValue();
      var fieldNames = getFormFieldNames(LIST_FIELDS.valueList);
      if (fieldNames.length > 0) 
        LIST_FIELDS.setAll(fieldNames, LIST_FIELDS.valueList);
      else
        LIST_FIELDS.setAll(new Array(MM.LABEL_NoFields), EMPTY_LIST);
    }
    
  } else if (item == "browseForFile") {
    
    dwscripts.browseFile(document.theForm.redirectURL);
    
    var currServerModel = dw.getDocumentDOM().serverModel.getServerName();
    if (currServerModel == "ASP" || currServerModel == "JSP")
    {
      var theRedirect_url = document.theForm.redirectURL.value; 

      if (theRedirect_url.length > 0)
      {
        // convert any script blocks to concat values
        theRedirect_url = theRedirect_url.replace(/<%=?\s*/gi, "\" + ");
        theRedirect_url = theRedirect_url.replace(/\s*%>/gi, " + \"");

        document.theForm.redirectURL.value = theRedirect_url;       
      }
    }
  }
}


//Get the list of forms on the page
function findAllForms() {
  var retList = new Array();
  var dom = dw.getDocumentDOM();
  var forms = dom.getElementsByTagName("FORM");
  for (var i=0; i < forms.length; i++) {
    retList.push(forms[i]);
  }
  return retList;
}


//Returns a list of form names
function getFormNames(formList) {
  var retList = new Array();
  for (var i=0; i < formList.length; i++) {
    if (formList[i].getAttribute("NAME") != null && formList[i].getAttribute("NAME") != "")
      retList.push(formList[i].getAttribute("NAME"));
    else
      retList.push(MM.LABEL_Unnamed);
  }
  return retList;
}


//Returns the form which currently contains the cursor
function getSelectedForm() {
  var retVal = '';
  var dom = dw.getDocumentDOM();
  var node = dom.getSelectedNode();
  while (node != null) {
    if (node.nodeType == Node.ELEMENT && node.tagName == "FORM") {
      retVal = node;
      break;
    }
    node = node.parentNode;
  }
  return retVal;
}


//Returns an array of objects which contain:
// obj ref, column binding, is number
function findAllFormFields(formObj) {
  var retList = new Array(), node;
  var tagList = getTagElementsInOrder(new Array("INPUT", "SELECT", "TEXTAREA"), formObj);
  //remove the unneeded form elements
  for (var i=0; i < tagList.length; i++) {
    if(tagList[i].tagName == "INPUT" && tagList[i].type &&
       tagList[i].type.toUpperCase() == "RADIO") {
      for (var j=tagList.length-1; j > i; j--) {
        if(tagList[j].tagName == "INPUT" &&
           tagList[j].type.toUpperCase() == "RADIO" &&
           tagList[j].getAttribute("name") == tagList[i].getAttribute("NAME")) {
          tagList.splice(j,1);
      } }
    } else if (tagList[i].tagName == "INPUT" && tagList[i].type &&
               (tagList[i].type.toUpperCase() == "SUBMIT" ||
                tagList[i].type.toUpperCase() == "BUTTON" ||
                tagList[i].type.toUpperCase() == "RESET")
              ) {
      tagList.splice(i,1);
      i--;
    } else if (tagList[i].tagName == "INPUT" && tagList[i].type &&
               tagList[i].type.toUpperCase() == "HIDDEN" &&
               tagList[i].getAttribute("NAME").indexOf("MM_") != -1) {
      tagList.splice(i,1);
      i--;
    }
  }
  //add valid types to the array of form fields
  for (var i=0; i < tagList.length; i++) {
    node = new Object();
    node.obj = tagList[i];
    node.column = '';
    node.type = FORMAT_FOR_STRING;
    node.isCheckbox = false;
    if (tagList[i].type && tagList[i].type.toUpperCase() == "CHECKBOX") {
      node.type = FORMAT_FOR_CHECKBOX_STRING;
      node.isCheckbox = true;
    }
    retList.push(node);
  }
  return retList;
}


//Returns a list of elements whose tag name matches one of those in tagList
function getTagElementsInOrder(tagList, dom) {
  var retList = new Array();
  if (dom == null) dom = dw.getDocumentDOM();
  for (var i=0; dom.hasChildNodes() && i < dom.childNodes.length; i++) {
    if (dom.childNodes[i].nodeType == Node.ELEMENT) {
      for (j=0; j < tagList.length; j++) {
        if (dom.childNodes[i].tagName == tagList[j]) {
          retList.push(dom.childNodes[i]);
          break;
      } }
      retList = retList.concat(getTagElementsInOrder(tagList,dom.childNodes[i]));
  } }
  return retList;
}


//Removes column mappings which no longer are valid.
// Tries to guess the correct mappings using field names.
// Might also try to check data bindings???
function updateColumnRefs(elemList, columnList) {
  var found = false;
  for (var i=0; i < elemList.length; i++) {
    if (elemList[i].column) { // check if the column exists
      found = false;
      for (var j=0; j < columnList.length; j++) {
        if (elemList[i].column == columnList[j]) {
          found = true;
          break;
      } }
      if (!found) elemList[i].column = '';
    }
    //match by column bindings found in the outerHTML
    if (elemList[i].column == '') { // set non assigned fields
      var match = elemList[i].obj.outerHTML.match(RegExp(getServerData("patt", "BoundAttr")));
      if (match != null)
      {
        for (var j=0; j < columnList.length; j++)
        {
          if (match[1] == columnList[j])
          {
            elemList[i].column = columnList[j];
            if (MAP_COL_TYPES[elemList[i].column] != null)
            {
              if (dwscripts.isNumericDBColumnType(MAP_COL_TYPES[elemList[i].column]))
              {
                elemList[i].type = (elemList[i].isCheckbox)? FORMAT_FOR_CHECKBOX_NUMBER : FORMAT_FOR_NUMBER;
              }
              else if (dwscripts.isDateDBColumnType(MAP_COL_TYPES[elemList[i].column]) &&
                       !elemList[i].isCheckbox)
              {
                elemList[i].type = FORMAT_FOR_DATE;
              }
              else
              {
                elemList[i].type = (elemList[i].isCheckbox)? FORMAT_FOR_CHECKBOX_STRING : FORMAT_FOR_STRING;
              }
            }
            break;
    } } } }
    //match by name
    if (elemList[i].column == '' && elemList[i].obj.getAttribute("NAME") != null) { // set non assigned fields
      for (var j=0; j < columnList.length; j++)
      {
        if (elemList[i].obj.getAttribute("NAME").toUpperCase() == columnList[j].toUpperCase())
        {
          elemList[i].column = columnList[j];
          if (MAP_COL_TYPES[elemList[i].column] != null)
          {
            if (dwscripts.isNumericDBColumnType(MAP_COL_TYPES[elemList[i].column]))
            {
              elemList[i].type = (elemList[i].isCheckbox)? FORMAT_FOR_CHECKBOX_NUMBER : FORMAT_FOR_NUMBER;
            }
            else if (dwscripts.isDateDBColumnType(MAP_COL_TYPES[elemList[i].column]) &&
                     !elemList[i].isCheckbox)
            {
              elemList[i].type = FORMAT_FOR_DATE;
            }
            else
            {
              elemList[i].type = (elemList[i].isCheckbox)? FORMAT_FOR_CHECKBOX_STRING : FORMAT_FOR_STRING;
            }
          }
          break;
    } } }
  }
}


function getRecordsetFromForm() {
  var retVal = '';
  var elemList = LIST_FIELDS.valueList;
  var rsList = LIST_RS.valueList;
  for (var i=0; elemList && elemList.length>1 && i < elemList.length && !retVal; i++) {
    if (elemList[i].obj.value != null) {
      for (var j=0; j < rsList.length && !retVal; j++) {
        if (elemList[i].obj.value.indexOf(rsList[j]) != -1) {
          retVal = rsList[j];
  } } } }
  return retVal;
}


//Returns the list of displayable strings for the field list
function getFormFieldNames(fieldList) {
  var retList = new Array(), displayStr, node;
  for (var i=0;  fieldList.length && i < fieldList.length; i++) {
    node = fieldList[i];
    displayStr = "";
    
    if (node.obj && node.obj.getAttribute("NAME") != null)
      displayStr += node.obj.getAttribute("NAME");
    else
      displayStr += MM.LABEL_Unnamed;
      
    if (node.column) {
      displayStr += getColActionStr() + "\"" + node.column + "\" ";

      for (var j=0; j<LIST_FORMAT.getLen(); j++) {
        if (LIST_FORMAT.getValue(j) == node.type) {
          displayStr += "(" + LIST_FORMAT.get(j) + ")";
          break;
        }
      }

    } else {
      displayStr += " " + MM.LABEL_Ignore;
    }
      
    retList.push(displayStr);
  }
  return retList;
}


function getColActionStr() {
  var actionStr = "";
  if (PROP_TYPE.indexOf("delete")!=-1) actionStr = MM.LABEL_DeleteColAction;
  else if (PROP_TYPE.indexOf("insert")!=-1) actionStr = MM.LABEL_InsertColAction;
  else actionStr = MM.LABEL_UpdateColAction;
  return actionStr;
}


function getNewTitle() {
  var newTitle = "";
  if (PROP_TYPE.indexOf("delete")!=-1) newTitle = MM.LABEL_TitleDeleteRecord;
  else if (PROP_TYPE.indexOf("insert")!=-1) newTitle = MM.LABEL_TitleInsertRecord;
  else if (PROP_TYPE.indexOf("update")!=-1) newTitle = MM.LABEL_TitleUpdateRecord;
  return newTitle;
}


