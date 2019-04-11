// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var LIST_FORM;
var LIST_CONNECTION;
var LIST_TABLE;

var LIST_FORMUSERNAME;
var LIST_RSUSERNAME;

var LIST_FORMPASSWORD;
var LIST_RSPASSWORD;

var LIST_RSAUTHORIZATION;
var TEXTGOTOURLONSUCCESS;
var CBGOTOREFERRERURL;
var TEXTGOTOURLONFAILURE;

var RG_SECURITYMETHOD;

var EMPTY_LIST = new Array("");




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
  var success = true;


  if (!sbObj)
  {
    // attempting to add the behavior - check to see if one already exists on the page
    var ourSBs = dwscripts.getServerBehaviorsByFileName("Login User.htm");
    if (ourSBs.length != 0)
    {
      alert(MM.MSG_OnlyOneInstanceAllowed);
      success=false;
    }
  }

    
  if (success)
  {
    var dom = dw.getDocumentDOM();
    var allForms = dom.getElementsByTagName("FORM");
    if (allForms.length==0)
    {
      alert(MM.MSG_LoginUserNoFormOnPage);
      success = false;
    }
  }
  
  if (success)
  {
    var restrictSBs = dwscripts.getServerBehaviorsByFileName("Restrict Access To Page.htm");
    if (restrictSBs.length != 0)
    {
      alert(MM.MSG_LoginUserPageRestricted);
    }
    
    // search each form element for the requisit number and type of controls
    if (getUPFormObjects().length == 0)
    {
      alert(MM.MSG_LoginUserNoValidForms);
      success = false;
    }
  }

  return success;
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


  sbArray = dwscripts.findSBs(MM.LABEL_TitleLoginUser);

  for (var i=0; i < sbArray.length; i++)
  {
    if (sbArray[i].parameters.cname != null)
    {
      var dom = dw.getDocumentDOM();
      if (dom && dom.URL && sbArray[i].parameters.relpath != getConnectionsPath(sbArray[i].parameters.cname,sbArray[i].parameters.UrlFormat))
      {
        sbArray[i].incomplete = true;
        sbArray[i].errorMsg += "\n"+MM.MSG_ConnectionPathInvalid;
      }
    }
  }
  
  return sbArray;
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
 

  var errMsg = "";
 
   if (TEXTGOTOURLONSUCCESS.value == "" || TEXTGOTOURLONFAILURE.value == "" || TEXTGOTOURLONSUCCESS.value == " " || TEXTGOTOURLONFAILURE.value == " " )
  {
   
    errMsg = MM.MSG_MustSupplyRedirectPages;
  }
  var validReg = /\s/;
  var validwordReg = /\w/;
  var  validSuccessIdx = (TEXTGOTOURLONSUCCESS.value).search(validReg);
  var validFailureIdx =  (TEXTGOTOURLONFAILURE.value).search(validReg);
   if ( validSuccessIdx >= 0)  
  {
    validSuccessIdx=(TEXTGOTOURLONSUCCESS.value).search(validwordReg);
	if( validSuccessIdx == -1)
    errMsg = MM.MSG_MustSupplyRedirectPages;
  }
     if ( validFailureIdx >= 0)  
  {
    validFailureIdx=(TEXTGOTOURLONFAILURE.value).search(validwordReg);
	if( validFailureIdx == -1)
    errMsg = MM.MSG_MustSupplyRedirectPages;
  }
  if (errMsg == "")
  {
    if (LIST_CONNECTION.get() == MM.LABEL_None)
    {
      errMsg = MM.MSG_MustSelectConnection;
    }
  }

  if (errMsg == "")
  {
    if (LIST_TABLE.get() == MM.LABEL_NoTables)
    {
      errMsg = MM.MSG_MustSelectTable;
    }
  }
  
  if (errMsg == "")
  {
    var useAccessList = (RG_SECURITYMETHOD.getSelectedValue() == "securityMethodUPA");
    var fldAuthorization = useAccessList ? LIST_RSAUTHORIZATION.getValue() : "";
    var connName   = LIST_CONNECTION.get();

    var paramObj = new Array();
    paramObj.formNode = LIST_FORM.getValue().formObj;
    paramObj.frmUsername = LIST_FORMUSERNAME.getValue();
    paramObj.fldAuthorization = fldAuthorization;
    paramObj.redirectSuccess = TEXTGOTOURLONSUCCESS.value;
    paramObj.redirectFailed = TEXTGOTOURLONFAILURE.value;
    paramObj.connection = connName;
    paramObj.fldUsername = LIST_RSUSERNAME.getValue();
    paramObj.fldPassword = LIST_RSPASSWORD.getValue();
    paramObj.table = LIST_TABLE.getValue();
    paramObj.frmPassword = LIST_FORMPASSWORD.getValue();
    paramObj.redirectToReferrer = (CBGOTOREFERRERURL.checked ? "true" : "false");
    paramObj.MM_userAuthorization = "MM_UserGroup";
    paramObj.MM_username = MM_USERNAME;
    
    // parameters for connection include
    paramObj.cname = connName;  
		paramObj.ConnectionName = connName;  
		if (sbObj != null)
		{
			var bIsSiteRelative = IsConnectionSiteRelative(sbObj.parameters.relpath); 
			if (bIsSiteRelative)
			{
				paramObj.UrlFormat = "virtual";
			}
			else
			{
				paramObj.UrlFormat = "require_once";
			}
		}
		else
		{
			//get a default url format
			var urlformat = getConnectionsUrlFormat(dw.getDocumentDOM());
			if (urlformat == "file")
			{
				urlformat = "require_once";
			}
			paramObj.UrlFormat = urlformat;
		}		
    paramObj.relpath = getConnectionsPath(connName,paramObj.UrlFormat);
    paramObj.ext = getServerExtension();
    paramObj.ConnectionPath=paramObj.relpath+"Connections/"+paramObj.cname+"."+paramObj.ext; 
    //special case the update of connection_ref, to prevent multiple
    // connection statements from being created
    if (sbObj && 
        (sbObj.parameters.relpath != paramObj.relpath ||
         sbObj.parameters.ext != paramObj.ext) &&
        sbObj.parameters.cname == paramObj.cname) {
		  sbObj.MM_forcePriorUpdate = "Connection_include";
    }
    
    dwscripts.applySB(paramObj, sbObj);
    MMDB.refreshCache(true);
    
    // Set the security method in a design note for other behaviors to use
    var securityMethod = useAccessList ? "useAccessList" : "dontUseAccessList";
    putSecurityMethodToNotes(securityMethod);
  }
  
  return errMsg;
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
  formNode = sbObj.selectedNode;
  if (formNode == null)
  {
    sbObj.incomplete = true;
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

  // select form in form list
  var formNode = sbObj.selectedNode;
  if (formNode != null)
  {
    var myFormName = formNode.getAttribute("NAME");
    var formNames = LIST_FORM.get('all');
    var idx = -1;
    for (i=0; i<formNames.length; i++)
    {
      if (myFormName == formNames[i])
      {
        idx = i;
        break;
      }
    }
    if (idx >= 0)
    {
      LIST_FORM.setIndex(idx);
      LIST_FORM.disable();
    }
  }  
  onChangeForm();

  var connName = sbObj.getParameter("ConnectionPath");
  
  connName=connName.substring(connName.lastIndexOf("/")+1,connName.lastIndexOf("."));
  var fldchangeusername=   LIST_RSUSERNAME.pickValue(sbObj.getParameter("fldUsername"));
  LIST_CONNECTION.pickValue(connName);
  if (LIST_CONNECTION.getIndex() == 0)
  {
    alert(dwscripts.sprintf(MM.MSG_ConnNotFound, connName));
  }
  onChangeConnection();
  
  LIST_TABLE.pickValue(sbObj.getParameter("table"));
  onChangeTable();
  
  LIST_FORMUSERNAME.pickValue(sbObj.getParameter("frmUsername"));
  LIST_RSUSERNAME.pickValue(sbObj.getParameter("fldUsername"));
  var fldchangeusername=   LIST_RSUSERNAME.pickValue(sbObj.getParameter("fldUsername"));
  LIST_FORMPASSWORD.pickValue(sbObj.getParameter("frmPassword"))
  LIST_RSPASSWORD.pickValue(sbObj.getParameter("fldPassword"));
  if (sbObj.getParameter("fldAuthorization") != "")
  {
    LIST_RSAUTHORIZATION.pickValue(sbObj.getParameter("fldAuthorization"));
    RG_SECURITYMETHOD.setSelectedValue("securityMethodUPA");
    onClickSecurityMethodUPA();
  }
  else 
  {
    RG_SECURITYMETHOD.setSelectedValue("securityMethodUP");
    onClickSecurityMethodUP();
  }

  TEXTGOTOURLONSUCCESS.value = sbObj.getParameter("redirectSuccess");
  TEXTGOTOURLONFAILURE.value = sbObj.getParameter("redirectFailed");
  CBGOTOREFERRERURL.checked =  (sbObj.getParameter("redirectToReferrer") == "true;");
  if (sbObj.errorMsg != "")
  {
    alert(sbObj.errorMsg)
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
  MMDB.refreshCache(true);
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

  LIST_FORM = new ListControl("listForm");
  var upFormObjects = getUPFormObjects();
  var formNames  = getUPFormNames(upFormObjects);
  

  if (formNames) 
  {
    LIST_FORM.setAll(formNames,upFormObjects);
  } 
  else 
  {
    LIST_FORM.setAll(new Array(MM.LABEL_NoForms), EMPTY_LIST);
  }
  LIST_FORM.object.focus();

  LIST_CONNECTION = new ListControl("listConnection")
  var connNames = MMDB.getConnectionList();
  connNames.splice(0,0,MM.LABEL_None);
  if (connNames.length > 0)
  {
    LIST_CONNECTION.setAll(connNames,connNames);
  }

  LIST_TABLE = new ListControl("listTable");

  LIST_FORMUSERNAME = new ListControl("listFormUsername");
  LIST_RSUSERNAME = new ListControl("listRsUsername");

  LIST_FORMPASSWORD = new ListControl("listFormPassword");
  LIST_RSPASSWORD = new ListControl("listRsPassword");

  LIST_RSAUTHORIZATION = new ListControl("listRsAuthorization");
  TEXTGOTOURLONSUCCESS = dwscripts.findDOMObject("textGoToURLOnSuccess");
  CBGOTOREFERRERURL = dwscripts.findDOMObject("cbGoToReferrerURL");
  TEXTGOTOURLONFAILURE = dwscripts.findDOMObject("textGoToURLOnFailure");

  RG_SECURITYMETHOD = new RadioGroup("securityMethod");
  LIST_RSAUTHORIZATION.disable();

  // All the controls are populated, now set the state by calling onEvent methods
  onChangeForm();
  onChangeConnection();

  elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
}


//--------------------------------------------------------------------
// FUNCTION:
//   onChangeForm
//
// DESCRIPTION:
//   Called when the form changes to update the UI
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function onChangeForm()
{
  var upFormObject = LIST_FORM.getValue()
  var controlNames = getUPFormControlNames(upFormObject);
  if (controlNames.length)
  {
    LIST_FORMUSERNAME.setAll(controlNames, controlNames);
    LIST_FORMPASSWORD.setAll(controlNames, controlNames);

    // try to match existing form fields to username & password
    for (i=0; i<controlNames.length; i++)
    {
      if (controlNames[i].toUpperCase().search("USERNAME") >= 0)
      {
        LIST_FORMUSERNAME.setIndex(i);
      }
      if (controlNames[i].toUpperCase().search("PASSWORD") >= 0)
      {
        LIST_FORMPASSWORD.setIndex(i);
      }
    }
    if (LIST_FORMUSERNAME.getIndex() == LIST_FORMPASSWORD.getIndex())
    {
      if (LIST_FORMUSERNAME.getIndex() == 0)
      {
        LIST_FORMPASSWORD.setIndex(1)
      }
      else
      {
        LIST_FORMPASSWORD.setIndex(0)
      }
    }
  } 
  else 
  {
    LIST_FORMUSERNAME.setAll(new Array(MM.LABEL_NoFields), EMPTY_LIST);
    LIST_FORMPASSWORD.setAll(new Array(MM.LABEL_NoFields), EMPTY_LIST);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   onChangeConnection
//
// DESCRIPTION:
//   Called when the connection changes to update the UI
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function onChangeConnection()
{
  var tableNames = new Array();
  if (LIST_CONNECTION.get() != MM.LABEL_None)
  {
    var tableObjects = MMDB.getTables(LIST_CONNECTION.get());
    if (tableObjects.length==0) 
    {
      alert(MM.MSG_LoginUserNoTablesFound);
    }
    else 
    {
      for (i = 0; i < tableObjects.length; i++)
      {
        var thisTable = tableObjects[i]
        thisSchema =  dwscripts.trim(thisTable.schema)
        if (thisSchema.length == 0)
        {
          thisSchema = dwscripts.trim(thisTable.catalog)
        }
        if (thisSchema.length > 0)
        {
          thisSchema += "."
        }
        tableNames.push(String(thisSchema + thisTable.table))
      }
    }
  }
  if (tableNames.length > 0)
  {
    LIST_TABLE.setAll(tableNames,tableNames);
  } 
  else 
  {
    LIST_TABLE.setAll(new Array(MM.LABEL_NoTables), EMPTY_LIST);
  }
  onChangeTable();
}


//--------------------------------------------------------------------
// FUNCTION:
//   onChangeTable
//
// DESCRIPTION:
//   Called when the table changes to update the UI
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function onChangeTable()
{
  var conn  = LIST_CONNECTION.get();
  var table = LIST_TABLE.get();
  if (table != MM.LABEL_NoTables)
  {
    var colsAndTypes = MMDB.getColumnAndTypeOfTable(conn,table)
    var colNames  = new Array();

    for (var i=0; i < colsAndTypes.length; i+=2)
    {
      colNames.push (colsAndTypes[i]);

    }
    if (colNames && colNames.length > 0)
    {
      LIST_RSUSERNAME.setAll(colNames, colNames);
      LIST_RSPASSWORD.setAll(colNames, colNames);
      LIST_RSPASSWORD.setIndex(1);
      LIST_RSAUTHORIZATION.setAll(colNames, colNames);
    } 
    else
    {
      LIST_RSUSERNAME.setAll(Array(MM.LABEL_NoRecordsetFieldsFound), Array());
      LIST_RSPASSWORD.setAll(Array(MM.LABEL_NoRecordsetFieldsFound), Array());
      LIST_RSAUTHORIZATION.setAll(Array(MM.LABEL_NoRecordsetFieldsFound), Array());
    }
  } 
  else 
  {
    LIST_RSUSERNAME.setAll(EMPTY_LIST,EMPTY_LIST);
    LIST_RSPASSWORD.setAll(EMPTY_LIST,EMPTY_LIST);
    LIST_RSAUTHORIZATION.setAll(EMPTY_LIST,EMPTY_LIST);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   onClickSecurityMethodUP
//
// DESCRIPTION:
//   Disables the authorization field
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function onClickSecurityMethodUP()
{
  LIST_RSAUTHORIZATION.disable();
}


//--------------------------------------------------------------------
// FUNCTION:
//   onClickSecurityMethodUPA
//
// DESCRIPTION:
//   Enables the authorization field
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function onClickSecurityMethodUPA()
{
  LIST_RSAUTHORIZATION.enable();
}


//--------------------------------------------------------------------
// FUNCTION:
//   onClickBtnFileBrowserOnSuccess
//
// DESCRIPTION:
//   Browses for a success URL
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function onClickBtnFileBrowserOnSuccess()
{
  var fileName = browseForFileURL();  //returns a local filename
  if (fileName)
  {
    TEXTGOTOURLONSUCCESS.value = fileName;
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   onClickBtnFileBrowserOnFailure
//
// DESCRIPTION:
//   Browses for a failure URL
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function onClickBtnFileBrowserOnFailure()
{
  var fileName = browseForFileURL();  //returns a local filename
  if (fileName)
  {
    TEXTGOTOURLONFAILURE.value = fileName;
  }
}


// ******************************************************************
//
//  Form and form control handling routines
//

//--------------------------------------------------------------------
// FUNCTION:
//   getUPFormObjects
//
// DESCRIPTION:
//   Returns a list of form objects
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   array of form nodes
//--------------------------------------------------------------------
function getUPFormObjects()
{
  var obj;
  var retList = new Array();
  var dom = dw.getDocumentDOM();
  var forms = dom.getElementsByTagName("FORM");
  for (var i=0; i < forms.length; i++)
  {
    formControls = findUsernamePasswordFormFields(forms[i]);
    if (formControls.length >= 1)
    {
      obj = new Object();
      obj.formObj = forms[i];
      if (forms[i].getAttribute("NAME") != null && forms[i].getAttribute("NAME") != "")
      {
        obj.name = forms[i].getAttribute("NAME");
      } 
      else 
      {
        obj.name = MM.LABEL_Unnamed;
      }
      obj.formControls = formControls;
      retList.push(obj);
    }
  }
  return retList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getUPFormNames
//
// DESCRIPTION:
//   Returns a list of form names
//
// ARGUMENTS:
//   upFormList - array of objects - an array of form objects to get
//     the names for.
//
// RETURNS:
//   array of strings
//--------------------------------------------------------------------
function getUPFormNames(upFormList)
{
  var retList = new Array();
  for (i=0; i<upFormList.length; i++)
  {
    retList.push(upFormList[i].name);
  }
  return retList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getUPFormControlNames
//
// DESCRIPTION:
//   Returns the names of the form elements within a given form object
//
// ARGUMENTS:
//   formObject - object - the form object to get controls from
//
// RETURNS:
//   array of string
//--------------------------------------------------------------------
function getUPFormControlNames(formObject)
{
  var retList = new Array(), displayStr, node;
  fieldList = formObject.formControls;
  for (var i=0;  fieldList.length && i < fieldList.length; i++) 
  {
    node = fieldList[i];
    displayStr = "";
    if (node.obj && node.obj.getAttribute("NAME") != null)
    {
      displayStr = node.obj.getAttribute("NAME");
    } 
    else 
    {
      displayStr = MM.LABEL_Unnamed;
    }
    retList.push(displayStr);
  }
  return retList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   findUsernamePasswordFormFields
//
// DESCRIPTION:
//   Returns an array of objects which contain:
//    obj ref, column binding, is number
//
// ARGUMENTS:
//   formObj - object - the form object to get controls from
//
// RETURNS:
//   array of objects
//--------------------------------------------------------------------

function findUsernamePasswordFormFields(formObj)
{
  var retList = new Array(), node;
  var tagList = getTagElementsInOrder(new Array("INPUT", "SELECT"), formObj);
  //remove the unneeded form elements
  for (var i=0; i < tagList.length; i++)
  {
    if (tagList[i].tagName == "INPUT" && tagList[i].type &&
        (tagList[i].type.toUpperCase() == "SUBMIT" ||
         tagList[i].type.toUpperCase() == "BUTTON" ||
         tagList[i].type.toUpperCase() == "RADIO"  ||
         tagList[i].type.toUpperCase() == "CHECKBOX" ||
         tagList[i].type.toUpperCase() == "FILE" ||
         tagList[i].type.toUpperCase() == "IMAGE" ||
         tagList[i].type.toUpperCase() == "RESET"))
    {
      tagList.splice(i,1);
      i--;
    } 
    else if (tagList[i].tagName == "INPUT" && tagList[i].type &&
             tagList[i].type.toUpperCase() == "HIDDEN" &&
             tagList[i].getAttribute("NAME").indexOf("MM_") != -1)
    {
      tagList.splice(i,1);
      i--;
    }
  }
  //add valid types to the array of form fields
  for (var i=0; i < tagList.length; i++)
  {
    node = new Object();
    node.obj = tagList[i];
    node.column = '';
    node.type = 'str';
    retList.push(node);
  }
  
  return retList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getTagElementsInOrder
//
// DESCRIPTION:
//   Returns a list of elements whose tag name matches 
//   one of those in tagList
//
// ARGUMENTS:
//   tagList - array of strings - the list of tag names to match
//   dom - DOM object - (optional) the dom to search
//
// RETURNS:
//   array of tag objects
//--------------------------------------------------------------------
function getTagElementsInOrder(tagList, dom)
{
  var retList = new Array();
  if (dom == null)
  {
    dom = dw.getDocumentDOM();
  }
  
  // **** modified this from the original in editOperations.js ****
  //for (var i=0; dom.hasChildNodes() && i < dom.childNodes.length; i++) {
  for (var i=0; dom.hasChildNodes!=null && dom.hasChildNodes() && i < dom.childNodes.length; i++)
  {
    if (dom.childNodes[i].nodeType == Node.ELEMENT)
    {
      for (j=0; j < tagList.length; j++)
      {
        if (dom.childNodes[i].tagName == tagList[j])
        {
          retList.push(dom.childNodes[i]);
          break;
        }
      }
      retList = retList.concat(getTagElementsInOrder(tagList,dom.childNodes[i]));
    }
  }
  
  return retList;
}
