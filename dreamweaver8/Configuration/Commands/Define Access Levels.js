// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//****************** GLOBALS VARS ********************

var TEXT_ACCESSLEVEL;
var LIST_ACCESSLEVELS;

//********************** API **************************

function commandButtons() {
  return new Array(MM.BTN_OK,"okClicked()",MM.BTN_Cancel,"window.close()",MM.BTN_Help,"displayHelp()");
}

//***************** LOCAL FUNCTIONS  ******************

function initializeUI() {
  MM.retVal = "";
  TEXT_ACCESSLEVEL = findObject("textAccessLevel");
  LIST_ACCESSLEVELS = new ListControl("listAccessLevels");
  LIST_ACCESSLEVELS.setAll(getAccessLevelsFromNotes());
  onChangeAccessLevels();
}

function okClicked(){
  MM.retVal = "OK";
  deleteBlankLevel();
  putAccessLevelsToNotes(LIST_ACCESSLEVELS.get("all"));
  window.close();
}

function onClickAddAccessLevel() {
  deleteBlankLevel();
  TEXT_ACCESSLEVEL.value = getUniqueAccessLevelName();
  LIST_ACCESSLEVELS.append(TEXT_ACCESSLEVEL.value);
  TEXT_ACCESSLEVEL.focus();
  TEXT_ACCESSLEVEL.select();
}

function onClickDeleteAccessLevel() {
  LIST_ACCESSLEVELS.del();
  TEXT_ACCESSLEVEL.value = LIST_ACCESSLEVELS.get();
  TEXT_ACCESSLEVEL.focus();
  TEXT_ACCESSLEVEL.select();
}

function onChangeAccessLevels() {
  TEXT_ACCESSLEVEL.value = LIST_ACCESSLEVELS.get();
  TEXT_ACCESSLEVEL.focus();
  TEXT_ACCESSLEVEL.select();
}

function onBlurAccessLevel() {
  var level = Trim(TEXT_ACCESSLEVEL.value);
  if (level.length > 0) {
    if (LIST_ACCESSLEVELS.get('all').length == 0) {
      LIST_ACCESSLEVELS.append(level);
    } else {
      // if this access level is the same as the selected one do nothing
      if (LIST_ACCESSLEVELS.get() != level) {
        var idx=findAccessLevelIndex(level);
        if (idx < 0) {
          LIST_ACCESSLEVELS.set(level);
        } else {
          LIST_ACCESSLEVELS.setIndex(idx);
        }
      }
    }
  }
}

//**************** SUPPORT FUNCTIONS  ******************

function findAccessLevelIndex(level) {
  var retIndex=-1;
  var listAccessLevels = LIST_ACCESSLEVELS.get("all");
  for (i=0; i<listAccessLevels.length; i++) {
    if (listAccessLevels[i] == level) {
      retIndex=i;
      break;
    }
  }
  return retIndex;
}

function getUniqueAccessLevelName() {
/*  Removed to try to make it look more like design notes dialog.
  var proposedAccessLevel = "Access Level";
  if (findAccessLevelIndex(proposedAccessLevel) >= 0) {
    var accessLevelTemplate = proposedAccessLevel + " @@accessLevelNumber@@";
    for (i=1; i<999; i++) {  // 999 is to prevent an infinite loop
      proposedAccessLevel = accessLevelTemplate.replace(/@@accessLevelNumber@@/, i.toString());
      if (findAccessLevelIndex(proposedAccessLevel) < 0) {
        break;
  } } }
  return proposedAccessLevel;  
*/
  return "";
}

function deleteBlankLevel() {
  var listAccessLevels = LIST_ACCESSLEVELS.get("all");
  if (listAccessLevels[listAccessLevels.length -1] == "") {
    listAccessLevels.splice(listAccessLevels.length -1);
    LIST_ACCESSLEVELS.setAll(listAccessLevels);
  }
}
