//Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

var helpDoc = MM.HELP_piASPNETRadioButton;

var CBOX_AUTOPOST;
var CBOX_ENABLED;
var RADIO_CHECKED;
var RADIO_UNCHEDKED;
var RADIO_DYNCHECKED;
var TEXT_ID;
var TEXT_TTIP;
var TEXT_TEXT;
var TEXT_AKEY;
var TEXT_GROUP;
var LIST_ALIGN;
var IMG_CKBOLT;

var LAST_ID = "";

var textAlignLabels = theAlignmentsLRCap;
var textAlignValues = theAlignmentsLRVal;
textAlignLabels.unshift("");
textAlignValues.unshift("");

// ********************* API FUNCTIONS ***************************


function canInspectSelection() {
  return true; //comments in html file limit us to just one tag
}


function initializeUI() {
  TEXT_ID = dwscripts.findDOMObject("radioID");
  CBOX_ENABLED = dwscripts.findDOMObject("enabled");
  CBOX_AUTOPOST = dwscripts.findDOMObject("autopost");
  RADIO_CHECKED = dwscripts.findDOMObject("isChecked");
  RADIO_UNCHECKED = dwscripts.findDOMObject("notChecked");
  RADIO_DYNCHECKED = dwscripts.findDOMObject("dynamicChecked");
  TEXT_TTIP = dwscripts.findDOMObject("tooltip");
  TEXT_TEXT = dwscripts.findDOMObject("text");
  TEXT_AKEY = dwscripts.findDOMObject("akey");
  TEXT_GROUP = dwscripts.findDOMObject("groupName");
  IMG_CKBOLT = dwscripts.findDOMObject("checkedBolt");
  
  LIST_ALIGN = new ListControl("textAlign");
  LIST_ALIGN.setAll(textAlignLabels,textAlignValues);
  LIST_ALIGN.pickValue("");
      
  // reposition form elements for Windows
  if (navigator.platform.charAt(0)=="W"){
    // Move icon into position
    document.layers["image"].top = 2;
    document.layers["image"].left = 4;
    document.layers["idBoxLayer"].top = 2;
    document.layers["idBoxLayer"].left = 43;
  }

  TEXT_ID.value = "";
  TEXT_TEXT.value = "";
  CBOX_ENABLED.checked = false;
  CBOX_AUTOPOST.checked = false;
  RADIO_CHECKED.checked = false;
  RADIO_UNCHECKED.checked = false;
  RADIO_DYNCHECKED.checked = false;
  TEXT_GROUP.value = "";
  TEXT_AKEY.value = "";
  TEXT_TTIP.value = "";
}


function inspectSelection() {
  var dom = dw.getDocumentDOM();
  var theObj = new TagEdit(dom.getSelectedNode().outerHTML);
  // Call initializeUI() here; it's how the global variables get
  // initialized. The onLoad event on the body tag is never triggered
  // in inspectors.
  initializeUI();
    
  if (theObj.getAttribute("ID")){
    TEXT_ID.value = theObj.getAttribute("ID");
    LAST_ID = TEXT_ID.value;
  }  
  if (theObj.getAttribute("ToolTip")){
    TEXT_TTIP.value = theObj.getAttribute("ToolTip");
  }
  if (theObj.getAttribute("Text")){
    TEXT_TEXT.value = theObj.getAttribute("Text");
  }
  if (theObj.getAttribute("GroupName")){
    TEXT_GROUP.value = theObj.getAttribute("GroupName");
  }
  if (theObj.getAttribute("AccessKey")){
    TEXT_AKEY.value = theObj.getAttribute("AccessKey");
  }
  if (theObj.getAttribute("AutoPostBack")){
    CBOX_AUTOPOST.checked = (theObj.getAttribute("AutoPostBack").toLowerCase() == "true")?true:false;
  }
  if (theObj.getAttribute("Enabled")){
    CBOX_ENABLED.checked = (theObj.getAttribute("Enabled").toLowerCase() == "true")?true:false;
  }
  if (theObj.getAttribute("Checked")){
    if (theObj.getAttribute("Checked").toLowerCase() == "true"){
      RADIO_CHECKED.checked = true;
      RADIO_UNCHECKED.checked = false;
      RADIO_DYNCHECKED.checked = false;
      IMG_CKBOLT.src = "../Shared/MM/Images/Bolt_dis.gif";
    }else if (theObj.getAttribute("Checked").toLowerCase() == "false"){
      RADIO_CHECKED.checked = false;
      RADIO_UNCHECKED.checked = true;
      RADIO_DYNCHECKED.checked = false;
      IMG_CKBOLT.src = "../Shared/MM/Images/Bolt_dis.gif";
    }else if (theObj.getAttribute("Checked").indexOf('<') != -1){
      RADIO_CHECKED.checked = false;
      RADIO_UNCHECKED.checked = false;
      RADIO_DYNCHECKED.checked = true;
      IMG_CKBOLT.src = "../Shared/MM/Images/Bolt.gif";
    }
  }else{
    RADIO_CHECKED.checked = false;
    RADIO_UNCHECKED.checked = true;
    RADIO_DYNCHECKED.checked = false;
    IMG_CKBOLT.src = "../Shared/MM/Images/Bolt_dis.gif";
  }    
  if (theObj.getAttribute("TextAlign")){
    LIST_ALIGN.pickValue(theObj.getAttribute("TextAlign"), new Function("a,b", "return (a.toLowerCase() == b.toLowerCase());"));
  }
}

function updateTag(attrib){
  var dom = dw.getDocumentDOM();
  var theObj = new TagEdit(dom.getSelectedNode().outerHTML);
  var editOccurred = false;
  
  if (attrib) {
    switch (attrib){
      case "id":
        if (theObj.getAttribute("id") != TEXT_ID.value){
          // If the ID value is not unique, warn the user and then revert
          // to the last known unique ID.
          if (TEXT_ID.value != "" && !dotNetUtils.isUniqueID(TEXT_ID.value)){
            var msg = MM.MSG_NeedUniqueID;
            msg = msg.replace(/%s/,TEXT_ID.value);
            alert(msg);
            TEXT_ID.value = LAST_ID;
          // Otherwise, if the ID value is not a valid variable name, warn the
          // user and then revert to the last known valid ID.
          }else if (TEXT_ID.value != "" && !dwscripts.isValidVarName(TEXT_ID.value)){
            alert(MM.MSG_InvalidIDAutoFix);
            TEXT_ID.value = LAST_ID;
          }else{ 
            theObj.setAttribute("id",TEXT_ID.value);
            editOccurred = true;
            LAST_ID = TEXT_ID.value;
          }
        }
        break;
    
      case "autoPost":
        if (theObj.getAttribute("AutoPostBack") && CBOX_AUTOPOST.checked == false){
          theObj.removeAttribute("AutoPostBack");
          editOccurred = true;
        }else if (CBOX_AUTOPOST.checked == true){
          theObj.setAttribute("AutoPostBack","true");
          editOccurred = true;
        }
        break;
        
      case "enabled":
        if (theObj.getAttribute("Enabled") && CBOX_ENABLED.checked == false){
          theObj.removeAttribute("Enabled");
          editOccurred = true;
        }else if (CBOX_ENABLED.checked == true){
          theObj.setAttribute("Enabled","true");
          editOccurred = true;
        }
        break;

      case "isChecked":
        var sbObj = getSBObj(theObj);
        if (sbObj){
          var msg = MM.MSG_UseMinusButton;
          msg = msg.replace(/%s/,MM.LABEL_DynamicRadioGroupTitle);
          msg = msg.replace(/%s/,sbObj.getTitle());
          alert(msg);
        }
        RADIO_UNCHECKED.checked = false;
        RADIO_DYNCHECKED.checked = false;
        IMG_CKBOLT.src = "../Shared/MM/Images/Bolt_dis.gif";
        IMG_CKBOLT.setAttribute("disabled","true");
        theObj.setAttribute("Checked","true");
        editOccurred = true;
        break;
        
      case "notChecked":
        var sbObj = getSBObj(theObj);
        if (sbObj){
            dwscripts.deleteSB(sbObj);
        }else{
  	      if (theObj.getAttribute("Checked")){
            theObj.removeAttribute("Checked");
        	  editOccurred = true;
		      }
        }
        RADIO_CHECKED.checked = false;
        RADIO_DYNCHECKED.checked = false;
        IMG_CKBOLT.src = "../Shared/MM/Images/Bolt_dis.gif";
        IMG_CKBOLT.setAttribute("disabled","true");
        break;
        
      case "dynamicChecked":
        RADIO_UNCHECKED.checked = false;
        RADIO_CHECKED.checked = false;
        RADIO_DYNCHECKED.checked = true;
        IMG_CKBOLT.src = "../Shared/MM/Images/Bolt.gif";
        IMG_CKBOLT.removeAttribute("disabled");
        /* this is where the server behavior gets called. */
        var sbObj = getSBObj(theObj);
        if (sbObj){
          dw.popupServerBehavior(sbObj);
        }else{
          dw.popupServerBehavior("DynRadioGroup.htm");
        }
        break;

      case "groupName":
        if (theObj.getAttribute("GroupName") != TEXT_GROUP.value && TEXT_GROUP.value != ""){
          theObj.setAttribute("GroupName",TEXT_GROUP.value);
          editOccurred = true;
        }else if (theObj.getAttribute("GroupName") && TEXT_GROUP.value == ""){
  		    theObj.removeAttribute("GroupName");
          editOccurred = true;
        }
        break;
        
      case "akey":
        if (theObj.getAttribute("AccessKey") != TEXT_AKEY.value && TEXT_AKEY.value != ""){
          theObj.setAttribute("AccessKey",TEXT_AKEY.value);
          editOccurred = true;
        }else if (theObj.getAttribute("AccessKey") && TEXT_AKEY.value == ""){
          theObj.removeAttribute("AccessKey");
          editOccurred = true;
        }
        break;
        
      case "toolTip":
        if (theObj.getAttribute("tooltip") != TEXT_TTIP.value && TEXT_TTIP.value != ""){
          theObj.setAttribute("ToolTip",TEXT_TTIP.value);
          editOccurred = true;
        }else if (theObj.getAttribute("tooltip") && TEXT_TTIP.value == ""){
          theObj.removeAttribute("tooltip");
          editOccurred = true;
        }
        break;
                
      case "text":
        if (theObj.getAttribute("Text") != TEXT_TEXT.value && TEXT_TEXT.value != ""){
          theObj.setAttribute("Text",TEXT_TEXT.value,true);
          editOccurred = true;
        }else if (theObj.getAttribute("Text") && TEXT_TEXT.value == ""){
          theObj.removeAttribute("Text");
          editOccurred = true;
        }
        break;

      case "textAlign":
        if (theObj.getAttribute("TextAlign") != LIST_ALIGN.getValue() && LIST_ALIGN.getValue() != ""){
         theObj.setAttribute("TextAlign",LIST_ALIGN.getValue());
          editOccurred = true;
		    }else if (theObj.getAttribute("TextAlign") && LIST_ALIGN.getValue() == ""){
		      theObj.removeAttribute("TextAlign");  
          editOccurred = true;
        }
        break;
    }

    // Only change the document if the editOccurred flag has been set (which we
    // set if a change to the TagEdit object occurred).
    if (editOccurred){
      theObj.setAttribute("runat","server");
      dotNetUtils.replaceSel(theObj.getOuterHTML());
    }
  }  
}

// Checks to see if this object already has a server behavior applied
// to it; if so, returns the object representing the server behavior.
function getSBObj(theTagObj){
  var sbObjs = dw.sbi.getServerBehaviors();
  var sbObj = null;
  var theName = (theTagObj.getAttribute("groupname"))?theTagObj.getAttribute("groupname"):theTagObj.getAttribute("id");
  for (var i=0; i < sbObjs.length; i++){
    if (sbObjs[i].getTitle() == MM.LABEL_DynamicRadioGroupTitle + " (" + theName + ")"){
      sbObj = sbObjs[i];
      break;
    }
  }
  return sbObj; 
}
