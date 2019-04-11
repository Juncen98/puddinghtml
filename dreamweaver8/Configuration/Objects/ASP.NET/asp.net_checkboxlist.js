// Copyright 2002, 2003, 2004 Macromedia, Inc. All rights reserved.
//*************** GLOBAL CONSTANTS *****************
var helpDoc = MM.HELP_objASPNETCheckBoxList;
var gDialogShown = false;

//*************** GLOBAL VARIABLES *****************
// UI Elements
var TEXT_ID, TEXT_TTIP, CBOX_POSTBACK, TEXT_AKEY;
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
  TEXT_TTIP = document.theForm.toolTip;
  TEXT_AKEY = document.theForm.aKey;
  CBOX_POSTBACK = document.theForm.postBack;

  TEXT_ID.value = dotNetUtils.generateUniqueID("CheckBoxList");
  }

  var dom = dw.getDocumentDOM();
  var offsets = dom.getSelection();
	var currSel = dom.offsetsToNode(offsets[0], offsets[1]);
    
  var infoObj = new dotNetUtils.formInfo();
	formNode = dotNetUtils.isInsideForm(currSel);
  dotNetUtils.checkFormTags(MM.LABEL_TitleASPCheckBoxList,infoObj);

	if (!formNode)
	{
      infoObj.addForm = true;
      TAG += dotNetUtils.FORM_OPEN;
	}
   
  TAG += '<asp:CheckBoxList';
  
  if (TEXT_ID.value != "")
    TAG += ' id="'+ TEXT_ID.value+'"';
  else
    TAG += ' id="' + dotNetUtils.generateUniqueID("CheckBoxList") + '"';
    
  if (TEXT_AKEY.value != "")
    TAG += ' AccessKey="'+ TEXT_AKEY.value + '"';
  if (TEXT_TTIP.value != "")
    TAG += ' ToolTip="'+ TEXT_TTIP.value + '"';
  if (CBOX_POSTBACK.checked == true)
    TAG += ' AutoPostBack="true"';
  if (SITE_DEFINED && rsName.getValue() != "" && rsName.getValue() != MENU_None)
    TAG += ' DataSource="<%# ' + rsName.getValue() + '.DefaultView %>"';
  if (SITE_DEFINED && labelColumn.getValue() != "")
    TAG += ' DataTextField="'+ labelColumn.getValue() + '"';
  if (SITE_DEFINED && valueColumn.getValue() != "")
    TAG += ' DataValueField="'+ valueColumn.getValue() + '"';
  TAG += ' runat="server"></asp:CheckBoxList>';
  
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
  TEXT_TTIP = document.theForm.toolTip;
  TEXT_AKEY = document.theForm.aKey;
  CBOX_POSTBACK = document.theForm.postBack;

  if (dw.getSiteRoot() != ""){
    rsName.initializeUI();
    labelColumn.initializeUI();
    valueColumn.initializeUI();
    SITE_DEFINED = true;
  }else{
    document.theForm.rsName.setAttribute("disabled","true");
    document.theForm.labelColumn.setAttribute("disabled","true");
    document.theForm.valueColumn.setAttribute("disabled","true");
    SITE_DEFINED = false;
  }
  
  TEXT_ID.value = dotNetUtils.generateUniqueID("CheckBoxList");
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
  }
}
