// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var _ConnectionName = new CFDataSourceMenu("Login User.htm", "ConnectionName");
var _UserName = new TextField("Login User.htm", "UserName");
var _Password = new TextField("Login User.htm", "Password");
var _TableName = new ConnectionTableMenu("Login User.htm", "TableName");
var _UsernameCol = new ConnectionColumnMenu("Login User.htm", "UsernameCol", "", false);
var _PasswordCol = new ConnectionColumnMenu("Login User.htm", "PasswordCol", "", false);
var _AuthLevelCol = new ConnectionColumnMenu("Login User.htm", "AuthLevelCol", "", false);

var LIST_FORM;
var LIST_FORMUSERNAME;
var LIST_FORMPASSWORD;

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

  if (success)
  {
    // If we can't retrieve any CF data sources, ask user to create one before
    //   using this behavior.
    var cfDSNList = MMDB.getColdFusionDsnList();
    if (cfDSNList == null || cfDSNList.length == 0)
    {
      alert(MM.MSG_SBCreateCFDataSource);
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
  var paramObj = new Array();
  
  if (TEXTGOTOURLONSUCCESS.value == "" || TEXTGOTOURLONFAILURE.value == "")
  {
    errMsg = MM.MSG_MustSupplyRedirectPages;
  }

  if (errMsg == "")
  {
    errMsg = _ConnectionName.applyServerBehavior(sbObj, paramObj); //connection
  }
  
  if (errMsg == "")
  {
    errMsg = _UserName.applyServerBehavior(sbObj,paramObj);
  }
  
  if (errMsg == "")
  {
    errMsg = _Password.applyServerBehavior(sbObj,paramObj);
  }
  
  if (errMsg == "")
  {
    errMsg = _TableName.applyServerBehavior(sbObj,paramObj); //table
  }
  
  if (errMsg == "")
  {
    errMsg = _UsernameCol.applyServerBehavior(sbObj,paramObj); //fldUsername
  }
  
  if (errMsg == "")
  {
    errMsg = _PasswordCol.applyServerBehavior(sbObj,paramObj); //fldPassword
  }
  
  if (errMsg == "")
  {
    var useAccessList = (RG_SECURITYMETHOD.getSelectedValue() == "securityMethodUPA");
    if (useAccessList)
    {
      errMsg = _AuthLevelCol.applyServerBehavior(sbObj,paramObj); //fldAuthorization
    }
    else
    {
      paramObj.AuthLevelCol = "";
    }
  }
  
  if (errMsg == "")
  {
    paramObj.formNode = LIST_FORM.getValue().formObj;
    paramObj.UsernameField = LIST_FORMUSERNAME.getValue();
    paramObj.PasswordField = LIST_FORMPASSWORD.getValue();
    paramObj.SuccessURL = TEXTGOTOURLONSUCCESS.value;
    paramObj.FailureURL = TEXTGOTOURLONFAILURE.value;
    paramObj.GoToReferrerURL = (CBGOTOREFERRERURL.checked ? "true" : "false");
    
    paramObj.MM_userAuthorization = MM_USERAUTHORIZATION;
    paramObj.MM_username = MM_USERNAME;
    
    dwscripts.applySB(paramObj, sbObj);
    
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
  
  for (var i=0; i < allRecs.length; i++)
  {
    if (allRecs[i].getServerBehaviorFileName &&
        allRecs[i].getServerBehaviorFileName() == "Recordset.htm" &&
        allRecs[i].getRecordsetName &&
        allRecs[i].getRecordsetName() == "MM_rsUser")
    {
      allRecs[i].deleted = true;
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
  _ConnectionName.inspectServerBehavior(sbObj);
  _UserName.inspectServerBehavior(sbObj);
  _Password.inspectServerBehavior(sbObj);
  _TableName.inspectServerBehavior(sbObj);
  _UsernameCol.inspectServerBehavior(sbObj);
  _PasswordCol.inspectServerBehavior(sbObj);
  
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
  updateUI("FormNode");

  LIST_FORMUSERNAME.pickValue(sbObj.getParameter("UsernameField"));
  LIST_FORMPASSWORD.pickValue(sbObj.getParameter("PasswordField"))

  if (sbObj.getParameter("AuthLevelCol") != "")
  {
    _AuthLevelCol.inspectServerBehavior(sbObj);
    RG_SECURITYMETHOD.setSelectedValue("securityMethodUPA");
    updateUI('securityMethod');
  }
  else 
  {
    RG_SECURITYMETHOD.setSelectedValue("securityMethodUP");
    updateUI('securityMethod');
  }

  TEXTGOTOURLONSUCCESS.value = sbObj.getParameter("SuccessURL");
  TEXTGOTOURLONFAILURE.value = sbObj.getParameter("FailureURL");

  CBGOTOREFERRERURL.checked =  (sbObj.getParameter("GoToReferrerURL") == "true");
  
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
  var setConnectionSuccess = true;  // return value from connectionmenu's initializeUI() 
  setConnectionSuccess = _ConnectionName.initializeUI();

  _UserName.initializeUI(); 
  _Password.initializeUI();
  _TableName.initializeUI();
  _UsernameCol.initializeUI();
  _PasswordCol.initializeUI();
  _AuthLevelCol.initializeUI();
  
  LIST_FORM = new ListControl("FormNode");
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


  LIST_FORMUSERNAME = new ListControl("UsernameField");
  LIST_FORMPASSWORD = new ListControl("PasswordField");

  TEXTGOTOURLONSUCCESS = dwscripts.findDOMObject("SuccessURL");
  CBGOTOREFERRERURL = dwscripts.findDOMObject("GoToReferrerURL");
  TEXTGOTOURLONFAILURE = dwscripts.findDOMObject("FailureURL");

  RG_SECURITYMETHOD = new RadioGroup("securityMethod");
  
  _AuthLevelCol.setDisabled(true);

  // All the controls are populated, now set the state by calling onEvent methods
  updateUI("FormNode");

  elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//   This function is called by the UI controls to handle UI updates
//
// ARGUMENTS:
//   control - string - the name of the control sending the event
//   event - string - the event which is being sent
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function updateUI(control, event)
{
  if (control == "ConnectionName")
  {
    // check the connection, and get a username and password if needed
    _ConnectionName.ensureLogin(_UserName.getValue(),
                                _Password.getValue());

    if (event == "onChange")
    {
      // set the username and password for this data source
      _UserName.setValue(_ConnectionName.getUsername());
      _Password.setValue(_ConnectionName.getPassword());
    }
    
    _TableName.updateUI(_ConnectionName, event);
  }
  
  else if (control == "TableName")
  {
    _UsernameCol.updateUI(_TableName, event);
    _PasswordCol.updateUI(_TableName, event);
    _PasswordCol.listControl.setIndex(1);
    _AuthLevelCol.updateUI(_TableName, event); // might need to enable and then disable
  }
  
  else if (control == "securityMethod")
  {
    var value = RG_SECURITYMETHOD.getSelectedValue();
    if (value == "securityMethodUP")
    {
      _AuthLevelCol.setDisabled(true);
    }
    else if (value == "securityMethodUPA")
    {
      _AuthLevelCol.setDisabled(false);
    }
  }
  
  else if (control == "SuccessURL")
  {
    dwscripts.browseFile(TEXTGOTOURLONSUCCESS);
  }
  
  else if (control == "FailureURL")
  {
    dwscripts.browseFile(TEXTGOTOURLONFAILURE);
  }
  
  else if (control == "FormNode")
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
