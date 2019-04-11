// Copyright 2002, 2003, 2004 Macromedia, Inc. All rights reserved.
//*************** GLOBAL CONSTANTS *****************
var helpDoc = MM.HELP_objASPNETDropDownList;
var gDialogShown = false;

//*************** GLOBAL VARIABLES *****************
// UI Elements
var TEXT_ID, CBOX_POSTBACK, TEXT_AKEY, TEXT_SELVAL, IMG_CKBOLT;
var rsName = new RecordsetMenu("", "rsName", true);
var labelColumn = new RecordsetColumnMenu("", "labelColumn", null, "rsName", true);
var valueColumn = new RecordsetColumnMenu("", "valueColumn", null, "rsName", true);
var SITE_DEFINED;

var LAST_ID = "";

var formNode = null;
var TAG = "";


//---------------     API FUNCTIONS    ---------------

function isDOMRequired() {
  return false;
}

function objectTag() {
  if (!gDialogShown)
  {
  TEXT_ID = document.theForm.idField;
  TEXT_AKEY = document.theForm.aKey;
  CBOX_POSTBACK = document.theForm.postBack;
  TEXT_SELVAL = document.theForm.selValue;
  IMG_CKBOLT = document.theForm.ckbolt;
  TEXT_ID.value = dotNetUtils.generateUniqueID("DropDownList");
  }

  var dom = dw.getDocumentDOM();
  var offsets = dom.getSelection();
	var currSel = dom.offsetsToNode(offsets[0], offsets[1]);
    
  var infoObj = new dotNetUtils.formInfo();
	formNode = dotNetUtils.isInsideForm(currSel);
  dotNetUtils.checkFormTags(MM.LABEL_TitleASPDropDownList,infoObj);
  
  LAST_ID = (TEXT_ID.value != "")?TEXT_ID.value:dotNetUtils.generateUniqueID("DropDownList");

	if (!formNode)
	{
      infoObj.addForm = true;
      TAG += dotNetUtils.FORM_OPEN;
	}
  
  // Add code to put selected value <%# %> here, before
  // opening tag.
  if (TEXT_SELVAL.value != ""){
    var mExp = /<%#\s*([^\.]+).FieldValue\(([^,]+), Container\)\s*%>/;
    var data = TEXT_SELVAL.value.match(mExp);
    var semiColon = (dom.documentType == "ASP.NET_CSharp")?";":"";
    if (data)
      TAG += '<% ' + LAST_ID + '.SelectedIndex = ' + LAST_ID + '.Items.IndexOf(' + LAST_ID + '.Items.FindByValue(' + data[1] + '.FieldValue(' + data[2] + ', ' + dwscripts.getNullToken() + ') ))' + semiColon + ' %>';
    else
      TAG += '<% ' + LAST_ID + '.SelectedIndex = ' + LAST_ID + '.Items.IndexOf(' + LAST_ID + '.Items.FindByValue("' + TEXT_SELVAL.value + '"))' + semiColon + ' %>';
  }
  
  TAG += '<asp:DropDownList';
  TAG += ' id="' + LAST_ID + '"';
    
  if (TEXT_AKEY.value != "")
    TAG += ' AccessKey="'+ TEXT_AKEY.value + '"';
  if (CBOX_POSTBACK.checked == true)
    TAG += ' AutoPostBack="true"';
  if (SITE_DEFINED && rsName.getValue() != "" && rsName.getValue() != MENU_None)
    TAG += ' DataSource="<%# ' + rsName.getValue() + '.DefaultView %>"';
  if (SITE_DEFINED && labelColumn.getValue() != "")
    TAG += ' DataTextField="'+ labelColumn.getValue() + '"';
  if (SITE_DEFINED && valueColumn.getValue() != "")
    TAG += ' DataValueField="'+ valueColumn.getValue() + '"';
  TAG += ' runat="server"></asp:DropDownList>';
  
  if (infoObj.addForm)
    TAG += dotNetUtils.FORM_CLOSE;
  else if (infoObj.setRunat)
    formNode.setAttribute("runat", "server");

  gDialogShown = false; // Reset show dialog global.

  return TAG;
}

//---------------    LOCAL FUNCTIONS   ---------------



function initializeUI()
{
  // set UI Globals
  TEXT_ID = document.theForm.idField;
  TEXT_AKEY = document.theForm.aKey;
  CBOX_POSTBACK = document.theForm.postBack;
  TEXT_SELVAL = document.theForm.selValue;
  IMG_CKBOLT = document.theForm.ckbolt;

  if (dw.getSiteRoot() != ""){
    rsName.initializeUI();
    labelColumn.initializeUI();
    valueColumn.initializeUI();
    SITE_DEFINED = true;
    updateUI('rs');
  }else{
    document.theForm.rsName.setAttribute("disabled","true");
    document.theForm.labelColumn.setAttribute("disabled","true");
    document.theForm.valueColumn.setAttribute("disabled","true");
    SITE_DEFINED = false;
    updateUI('rs');
  }
  
  TEXT_ID.value = dotNetUtils.generateUniqueID("DropDownList");
  LAST_ID = TEXT_ID.value;
  TEXT_ID.focus();
  TEXT_ID.select();

  gDialogShown = true;
}


function updateUI(itemName){
  switch(itemName){
    case "idField":
      if (TEXT_ID && TEXT_ID.value != "" && !dotNetUtils.isUniqueID(TEXT_ID.value)){
        var msg = MM.MSG_NeedUniqueID;
        msg = msg.replace(/%s/,TEXT_ID.value);
        alert(msg);
        TEXT_ID.value = LAST_ID;
      }else if (TEXT_ID && TEXT_ID.value != "" && !dwscripts.isValidVarName(TEXT_ID.value)){
        alert(MM.MSG_InvalidIDAutoFix);
        TEXT_ID.value = LAST_ID;
      }else if (TEXT_ID){ 
        LAST_ID = TEXT_ID.value;
      }
      break;

    case "rs":
      if (SITE_DEFINED && rsName.getValue() != "" && rsName.getValue() != MENU_None){
        TEXT_SELVAL.removeAttribute("disabled");
        IMG_CKBOLT.removeAttribute("disabled");
        IMG_CKBOLT.src = "../../Shared/MM/Images/Bolt.gif";
      }else{ 
        TEXT_SELVAL.value = "";
        TEXT_SELVAL.setAttribute("disabled","true");
        IMG_CKBOLT.setAttribute("disabled","true");
        IMG_CKBOLT.src = "../../Shared/MM/Images/Bolt_dis.gif";
      }
      break;
  }
}
