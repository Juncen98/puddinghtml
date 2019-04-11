// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS  *****************

var helpDoc = MM.HELP_objFireworksHTML;

var OBJECT_TAG = '';
var CMD_PATH = dreamweaver.getConfigurationPath() + "/Commands/Fireworks HTML.htm";

/*
var DOC_NAME = '';
var SITE_NAME = '';
var SAVED = false;
*/


//******************* API **********************

function getObjectTag() {
  return OBJECT_TAG;
}

function commandButtons()
{
   return new Array( MM.BTN_OK,     "setObjectTag()",
                     MM.BTN_Cancel, "cancelObjectTag()",
                     MM.BTN_Help,   "displayHelp()");
}


function setObjectTag() {
  var result, validFWFile=false;
  var fwFile, fwHTML, fwURL, fwSource, fwDOM;
  var docURL, siteURL, parentFile, docRootURL, siteRootURL;

  fwHTML = document.theForm.htmlFile.value;
  if (fwHTML) {
    fwURL = MMNotes.filePathToLocalURL(fwHTML);
    fwFile = new File(fwURL);
  }

  if (!fwHTML) {
    alert(MSG_selectFWFile);
  } else if (!fwFile.exists() || !fwFile.isFile()) {
    alert(printf(MSG_selectValidFile,fwHTML));
  } else {
    fwSource = fwFile.getContents();
    if (!isFireworksHTML(fwSource))
      alert(MSG_notFWFile);
    else if (!isDWStyle(fwSource))
      alert(MSG_notExportedForDW);
    else if (!usesDWBehaviors(fwSource))
      alert(MSG_behNotSupported);
    else
      validFWFile = true;
  }

  if (validFWFile) {
    fwDOM = dreamweaver.getDocumentDOM(fwURL);
    docURL = dreamweaver.getDocumentPath("document");
    siteURL = dreamweaver.getSiteRoot();

    docRootURL = '';
    siteRootURL = '';
    if (docURL) {
      parentFile = new File(docURL);
      docRootURL = parentFile.getAbsoluteParent() + File.separator;
/*
      if (document.theForm.urlRelTo.selectedIndex == 1) {
        parentFile = new File(siteURL);
        siteRootURL = parentFile.getAbsolutePath();
      }
*/
    }

    OBJECT_TAG = insertFireworksHTML(fwDOM, fwURL, docRootURL, siteRootURL);

    dreamweaver.releaseDocument(fwDOM);
    window.close();

    if (document.theForm.delHtml.checked) {
      fwFile = new File(fwURL);
      result = fwFile.remove();
      if (!result)
        alert(printf(MSG_cantRemoveHTML, fwURL));
  } }

  // save current settings to the metafile
  handle = MMNotes.open(CMD_PATH, true);
  if (handle != 0) {
    MMNotes.set(handle, "DeleteOption", document.theForm.delHtml.checked.toString());
/*
    MMNotes.set(handle, "URLOption", document.theForm.urlRelTo.selectedIndex.toString());
*/
    MMNotes.close(handle);
  }

}

function cancelObjectTag() {
  OBJECT_TAG = '';
  window.close();
}

//***************** LOCAL FUNCTIONS  ******************

function initializeUI() {
  var handle, filePath, deleteHTML, urlRel;
  OBJECT_TAG = '';

  document.theForm.delHtml.checked = false;

  // load any previously saved settings from the metafile
  handle = MMNotes.open(CMD_PATH);
  if (handle != 0) {
    deleteHTML = eval(MMNotes.get(handle, "DeleteOption"));
    if (deleteHTML) document.theForm.delHtml.checked = true;
/*
    urlRel = eval(MMNotes.get(handle, "URLOption"));
    if (urlRel) document.theForm.urlRelTo.selectedIndex = urlRel;
*/
    MMNotes.close(handle);
  }

/*
  DOC_NAME = dreamweaver.getDocumentDOM('document').getWindowTitle();
  SITE_NAME = site.getCurrentSite();
  SAVED = (dreamweaver.getDocumentPath('document').length != 0);

  displayURLSelection();
*/

  // set the selection and focus
  document.theForm.htmlFile.select();
  document.theForm.htmlFile.focus();
}


function updateUI(itemName) {
  var result = '';
  if (itemName == "browseHtml") {
    result = dreamweaver.browseForFileURL("open", LABEL_selectFW, false);
    if (result) document.theForm.htmlFile.value = result;
  } else if (itemName == "urlRelTo") {
/*
    displayURLSelection();
*/
  }
}

/*
function displayURLSelection() {
  if (document.theForm.urlRelTo.selectedIndex == 0) {
    if (SAVED)
      document.theForm.linkRelName.innerHTML = DOC_NAME;
    else
      document.theForm.linkRelName.innerHTML = LABEL_noSavedDoc;
  } else if (document.theForm.urlRelTo.selectedIndex == 1) {
    if (SITE_NAME)
      document.theForm.linkRelName.innerHTML = SITE_NAME;
    else
      document.theForm.linkRelName.innerHTML = LABEL_noDefinedSite;
  }
}
*/
