// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//--------- globals -----------

var UI;  //global object to hold class instance


//--------- API -----------

function commandButtons()
{
   return new Array( "OK",     "UI.okClicked()");
}

//--------- class constructor -----------

function UiManager()
{
  this.basePath = dw.getConfigurationPath() + "/";

  //Locate all UI elements
  with (document.theForm)
  {
    this.persona          = persona;

    this.contributorName  = contributorName;
    this.contributorEmail = contributorEmail;

    this.reviewEnabled    = reviewEnabled;
    this.reviewer      = reviewer;

    this.friendlyRootURL  = friendlyRootURL;
    this.siteRoot         = siteRoot;
    this.homePage         = homePage;

    this.sharedSiteRoot   = sharedSiteRoot;
    this.shadowRoot       = shadowRoot;
    this.contributorPrivateSiteRoot = contributorPrivateSiteRoot;
    this.reviewerPrivateSiteRoot    = reviewerPrivateSiteRoot;
  }

  //read design notes to determine which persona we're using, and select in menu
  var profileObj = openProfile();
  this.persona.selectedIndex = parseInt(MMNotes.get(profileObj, "persona"));
  closeProfile(profileObj);

  this.initializeUI();
}


//---------- methods -----------

UiManager.prototype.initializeUI        = UiManager_initializeUI;
UiManager.prototype.changePersona       = UiManager_changePersona;
UiManager.prototype.cancelClicked       = UiManager_cancelClicked;
UiManager.prototype.okClicked           = UiManager_okClicked;
UiManager.prototype.allowReviewSettings = UiManager_allowReviewSettings;


function UiManager_initializeUI()
{
  //Initialize form values;
  this.contributorName.value  = FileStateManager.debugOnlyGetContributorName();
  this.contributorEmail.value = FileStateManager.debugOnlyGetContributorEmail();

  this.reviewEnabled.checked  = FileStateManager.debugOnlyGetReviewEnabled();
  this.reviewer.checked       = FileStateManager.debugOnlyGetReviewer();
  this.allowReviewSettings();

  this.friendlyRootURL.value  = FileStateManager.debugOnlyGetFriendlyRootURL();
  this.siteRoot.value         = stripConfigPath(FileStateManager.debugOnlyGetSiteRoot());
  this.homePage.value         = stripConfigPath(FileStateManager.debugOnlyGetHomePage());

  this.sharedSiteRoot.value   = stripConfigPath(FileStateManager.debugOnlyGetSharedSiteRoot());
  this.shadowRoot.value       = stripConfigPath(FileStateManager.debugOnlyGetShadowRoot());
  this.contributorPrivateSiteRoot.value = stripConfigPath(FileStateManager.debugOnlyGetContributorPrivateSiteRoot());
  this.reviewerPrivateSiteRoot.value    = stripConfigPath(FileStateManager.debugOnlyGetReviewerPrivateSiteRoot());
}


function UiManager_changePersona()
{
  //save settings for current profile
  var profileObj = openProfile();
  var oldPersonaValue = MMNotes.get(profileObj, "persona");
  writeProfileSettings(oldPersonaValue);
  closeProfile(profileObj);

  //write new persona value to design notes, and read new values
  switchToPersona(this.persona.selectedIndex);

  //load new values into UI
  this.initializeUI();
}


function UiManager_cancelClicked()
{
  window.close();
}


function UiManager_okClicked()
{
  FileStateManager.debugOnlySetContributorName(this.contributorName.value);
  FileStateManager.debugOnlySetContributorEmail(this.contributorEmail.value);

  FileStateManager.debugOnlySetReviewEnabled(this.reviewEnabled.checked);
  FileStateManager.debugOnlySetReviewer(this.reviewer.checked);

  FileStateManager.debugOnlySetFriendlyRootURL(this.friendlyRootURL.value);
  FileStateManager.debugOnlySetSiteRoot(this.basePath + this.siteRoot.value);
  FileStateManager.debugOnlySetHomePage(this.basePath + this.homePage.value);

  FileStateManager.debugOnlySetSharedSiteRoot(this.basePath + this.sharedSiteRoot.value);
  FileStateManager.debugOnlySetShadowRoot(this.basePath + this.shadowRoot.value);
  FileStateManager.debugOnlySetContributorPrivateSiteRoot(this.basePath + this.contributorPrivateSiteRoot.value);
  FileStateManager.debugOnlySetReviewerPrivateSiteRoot(this.basePath + this.reviewerPrivateSiteRoot.value);

  dw.getDocumentDOM().refreshPanes();
  writeProfileSettings(this.persona.selectedIndex);

  window.close();
}


function UiManager_allowReviewSettings()
{
  this.reviewer.setAttribute("disabled", !this.reviewEnabled.checked);
}



//---------- local functions -----------

//If path starts with current config path, strip it off before writing

function stripConfigPath(path)
{
  var basePath = dw.getConfigurationPath();
  if (path.indexOf(basePath) == 0) {
    path = path.substring(basePath.length+1);
  }
  return path;
}


//If path is stored as relative (not file: or http:), precede with full local path.

function makeAbsPath(path)
{
  var basePath = dw.getConfigurationPath();
  if (path.indexOf("file:") != 0 && path.indexOf("http:") != 0) {
    path = basePath + "/" + path;
  }
  return path;
}


function openProfile() {
  var profileLoc = dw.getConfigurationPath() + "/Startup/ContributorInit.htm";
  return MMNotes.open(profileLoc, true);  //open, or create metafile
}


function closeProfile(profileObj) {
  MMNotes.close(profileObj);
}

//First writes the persona value (0, 1, or 2), then sets the appropriate design notes
//to the current FileStateManager values.

function writeProfileSettings(p) {  //passed a persona value, appends to key names
  var profileObj = openProfile();

  MMNotes.set(profileObj, "persona", p);

  MMNotes.set(profileObj, "contributorName"+p, FileStateManager.debugOnlyGetContributorName());
  MMNotes.set(profileObj, "contributorEmail"+p, FileStateManager.debugOnlyGetContributorEmail());

  MMNotes.set(profileObj, "reviewEnabled"+p, FileStateManager.debugOnlyGetReviewEnabled());
  MMNotes.set(profileObj, "reviewer"+p, FileStateManager.debugOnlyGetReviewer());

  MMNotes.set(profileObj, "friendlyRootURL"+p, FileStateManager.debugOnlyGetFriendlyRootURL());
  MMNotes.set(profileObj, "siteRoot"+p, stripConfigPath(FileStateManager.debugOnlyGetSiteRoot()));
  MMNotes.set(profileObj, "homePage"+p, stripConfigPath(FileStateManager.debugOnlyGetHomePage()));

  MMNotes.set(profileObj, "sharedSiteRoot"+p, stripConfigPath(FileStateManager.debugOnlyGetSharedSiteRoot()));
  MMNotes.set(profileObj, "shadowRoot"+p, stripConfigPath(FileStateManager.debugOnlyGetShadowRoot()));
  MMNotes.set(profileObj, "contributorPrivateSiteRoot"+p, stripConfigPath(FileStateManager.debugOnlyGetContributorPrivateSiteRoot()));
  MMNotes.set(profileObj, "reviewerPrivateSiteRoot"+p, stripConfigPath(FileStateManager.debugOnlyGetReviewerPrivateSiteRoot()));

  closeProfile(profileObj);
}


//First reads persona value (0, 1, or 2), then reads the appropriate set of design notes
//and sets the FileStateManager settings to those values.

function readProfileSettings() {
  var profileObj = openProfile();

  var p = MMNotes.get(profileObj, "persona");

  FileStateManager.debugOnlySetContributorName(MMNotes.get(profileObj, "contributorName"+p));
  FileStateManager.debugOnlySetContributorEmail(MMNotes.get(profileObj, "contributorEmail"+p));

  FileStateManager.debugOnlySetReviewEnabled(MMNotes.get(profileObj, "reviewEnabled"+p) == "true");
  FileStateManager.debugOnlySetReviewer(MMNotes.get(profileObj, "reviewer"+p) == "true");

  FileStateManager.debugOnlySetFriendlyRootURL(MMNotes.get(profileObj, "friendlyRootURL"+p));
  FileStateManager.debugOnlySetSiteRoot(makeAbsPath(MMNotes.get(profileObj, "siteRoot"+p)));
  FileStateManager.debugOnlySetHomePage(makeAbsPath(MMNotes.get(profileObj, "homePage"+p)));

  FileStateManager.debugOnlySetSharedSiteRoot(makeAbsPath(MMNotes.get(profileObj, "sharedSiteRoot"+p)));
  FileStateManager.debugOnlySetShadowRoot(makeAbsPath(MMNotes.get(profileObj, "shadowRoot"+p)));
  FileStateManager.debugOnlySetContributorPrivateSiteRoot(makeAbsPath(MMNotes.get(profileObj, "contributorPrivateSiteRoot"+p)));
  FileStateManager.debugOnlySetReviewerPrivateSiteRoot(makeAbsPath(MMNotes.get(profileObj, "reviewerPrivateSiteRoot"+p)));

  closeProfile(profileObj);
}


//Given a persona number (0, 1, or 2), loads that persona

function switchToPersona(personaNum)
{
  //write new persona value to design notes, and read new values
  var profileObj = openProfile();
  MMNotes.set(profileObj, "persona", personaNum);
  closeProfile(profileObj);
  readProfileSettings();
  dw.getDocumentDOM().refreshPanes();
}
