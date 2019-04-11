/*
 * 505/W3C Accessibility Suite OEM V2 for Macromedia Dreamweaver
 * (C) Copyright 2001-2005 UsableNet Inc. All rights reserved.
 */
/* $Id: RuleSettings.js,v 1.4 2005/03/17 14:47:59 malex Exp $ */





// ***********************************************************
// ***********************************************************
//                   CLASS "SingleSetting" 
//
// ***********************************************************
// It remembers the content of one, single default RULE setting. 
// It contains the following properties: 
// 1) the identificator of the rule ("ruleID");
// 2) if this rule is set or not ("enabled").
function SingleSetting(id, enabled)
{
    // Object's properties:
    this.ruleID  = id;       // ::string.
    this.enabled = enabled;  // ::boolean.

    // Object's methods:
    this.setRuleID = function(ruleID) {
	this.ruleID = ruleID;
    }
    this.getRuleID = function() {
	return this.ruleID;
    }

    this.setEnabled = function(isEnabled) {
	this.enabled = isEnabled;
    }
    this.isEnabled = function() {
	return this.enabled;
    }
} // End class SingleSetting



// ***********************************************************
// ***********************************************************
//                CLASS "XmlFileConstruction" 
//
// ***********************************************************
// Related to all the operations for the xml file construction.
function XmlFileConstruction(fileURL)
{
    // Object's properties:

    this.fileURL = fileURL;
    this.head = '<?xml version="1.0" encoding="ISO-8859-1" standalone="yes"?>' + NEWLINE;
    this.un_settings = '<un:settings xmlns:un="http://usablenet.com/namespaces/508as_settings">' + NEWLINE;

    // Object's methods:

    this.saveSettingsHead = function() {
	/* 
	   Saves into this.fileURL the INITIAL part of the xml file
	   containing the rule settings.
        
	   The xml file will have the following external skin:
	   <?xml version="" encoding="" standalone=""?>
	   <un:settings xmlns:un="">
	   ...
	   </un:settings>
         
	   Returns:
	   * true        if the creation of the file will success.
	   * false       else.  
	*/
	var fileContent = new Array();

	fileContent.push(this.head);
	fileContent.push(this.un_settings);
	return DWfile.write(this.fileURL, fileContent.join(""));
    }

    this.saveRuleSettingItem = function(ruleID, isEnabled) {
	/* Saves into this.fileURL a single INTERNAL BLOCK of the xml file
           containing the rule settings; in particular, all the properties
           of a rule.

           Structure of the block:
           <un:rulesettings>
              <un:ruleid>  ... </un:ruleid>
              <un:enabled> ... </un:enabled>
           </un:rulesettings>

           Returns:
           * true        if the append to the file will success.
           * false       else.
	*/
	var fileContent = new Array();

	fileContent.push("<un:rulesettings>" + NEWLINE + "  <un:ruleid>");
	fileContent.push(ruleID);
	fileContent.push("</un:ruleid>" + NEWLINE + "  <un:enabled>");
	fileContent.push((isEnabled)?("yes"):("no"));
	fileContent.push("</un:enabled>" + NEWLINE + "</un:rulesettings>" + NEWLINE);
	return  DWfile.write(this.fileURL, fileContent.join(""), "append");
    }

    this.saveOptionsItem = function(showPassed) {
	/* Saves into this.fileURL a single INTERNAL BLOCK of the xml file
           containing the options settings.
	   In particular:
	   * if the passed-test are to be shown or not.

           Structure of the block:
           <un:options>
              <un:showpassed>  ... </un:showpassed>
           </un:options>

           Returns:
           * true        if the append to the file will success.
           * false       else.
	*/
	var fileContent = new Array();

	fileContent.push("<un:options>" + NEWLINE + "  <un:showpassed>");
	fileContent.push((showPassed)?("yes"):("no"));
	fileContent.push("</un:showpassed>" + NEWLINE + "</un:options>" + NEWLINE);
	return  DWfile.write(this.fileURL, fileContent.join(""), "append");
    }

    this.saveSettingsEnd = function() {
	/* Saves into this.fileURL the FINAL part of the xml file
           containing the rule settings.
  
           Returns:
           * true        if the append to the file will success.
           * false       else.
	*/
	return DWfile.write(this.fileURL, '</un:settings>' + NEWLINE, "append");
    }

} // End class XmlFileConstruction





// ***********************************************************
// ***********************************************************
//                   CLASS "RuleSettings"
//
// ***********************************************************
// ****** CLASS "RuleSettings": _findIndexFromID method ******
// Function that will be a method of RuleSettings.
// This function scans rsList and search for the input parameter
// "id". 
//
// Parameter:
// - id      string: the rule id.
// Returns:
// - the index of the array where "id" was found;
// - (-1) if "id" was not found into rsList.
function _findIndexFromID(id) 
{
    var len=this.rsList.length, i=0;

    for(i=0; i<len; i++) {
	if(id == this.rsList[i].ruleID)
	    break;
    }
    if(i == len)
	return -1;
    else
	return i;
}
// ***********************************************************
// ********* CLASS "RuleSettings": _checkID method ***********
// Function that will be a method of RuleSettings.
// This function checks the validity of a rule's id.
//
// Parameter:
// - id      string: the rule id.
// Returns: 
// - true    if the id is a valid number;
// - false   else.
function _checkID(id)
{
    var len=this.rsList.length, found=false;

    for(var i=0; i<len; i++) {
	if(id == this.rsList[i].ruleID) {
	    found = true;
	    break;
	}
    }
    return found;
}



// ***********************************************************
// The following functions relates to the defaults saving.
// ***********************************************************
// *** CLASS "RuleSettings": "_saveUsersSettings()" method ***
// Saves the user's defaults (into this.fileURL) taking them from
// the present global object (this).
function _saveUsersSettings()
{
    //DEBUG(0, "_saveUsersSettings()");
    var ok=true, oneitem, fileContent="";

    // The head of the xml file...
    ok = ok && this.xmlFile.saveSettingsHead();

    // The general options...
    ok = ok && this.xmlFile.saveOptionsItem(this.showPassedEvaluations);

    // All the settings for each rule...
    for(var i=0; i<this.rsList.length; i++) {
	var rule = this.rsList[i];
	ok = ok && this.xmlFile.saveRuleSettingItem(rule.getRuleID(), 
						    rule.isEnabled());
    }

    // The end of the xml file...
    ok = ok && this.xmlFile.saveSettingsEnd();
    
    return ok;
}
// ***********************************************************
// ***** CLASS "RuleSettings": "SaveDefaults()" method *******
// Function that will be a method of RuleSettings.
// It saves the current settings (into the file DEFAULT_RULES_URL); 
// these settings will be the default settings for the next session.
// Returns: 
// - true    if all went ok;
// - false   else.
function saveDefaults() 
{
    //DEBUG(0, "saveDefaults()");
    var len = this.rsList.length;
    var toWrite = "";
    var allOK = true;

    // Test if the file is read-only, to prevent the failure of
    // the subsequent writing.
    if(DWfile.exists(this.fileURL))
    {
	var attributes = DWfile.getAttributes(this.fileURL);
	var re = /R/;
	if(re.test(attributes))
	{
	    alert("The file:" + NEWLINE + this.fileURL + NEWLINE +
		  "containing the default settings, is read only." + NEWLINE + 
		  "Please, change this property to save the rule settings.");
	    return false;
	}
    }

    // Construction/Writing of the file...
    allOK = this._saveUsersSettings();

    if(!allOK) {
	alert(ERROR_IN_FUNCTION + "saving defaults.");
    }
    return allOK;
}



// ***********************************************************
// The following functions relates to the defaults loading.
// ***********************************************************
// ** CLASS "RuleSettings": "_loadFactoryDefaults()" method **
// Reads the factory defaults from the rule-registry.
// Then, it saves them into the present object.
function _loadFactoryDefaults()
{
    //DEBUG(0, "_loadFactoryDefaults()");
    var ok=true, ruleID="", fileContent="";
    var allRules = App.constructor.un508asoem.ruleRegistry.getAllRuleID();

    // ** Factory options **
    // These are not get from the rule-registry, but are
    // fixed in the code of this object, at construction time.
    // Thus, I need to do nothing here.


    // ** Rule options **
    // Taken from the rule-registry; i fill the local object.

    // A) Test if the private object this.rsList is already
    // filled; in this case, I empty it.
    if(this.rsList) {
	if(this.rsList.length) {
	    this.rsList.length = 0;
	}
    }

    // B) Load the factory defaults...
    for(ruleID in allRules) {
	var oneitem = new SingleSetting(ruleID, allRules[ruleID]);
	this.rsList.push(oneitem);
    }
    
    return true;
}
// ***********************************************************
// *** CLASS "RuleSettings": "_loadUsersDefaults()" method ***
// Reads the user's defaults (from this.fileURL) and remembers
// them into the present global object (this).
function _loadUsersDefaults()
{
    //DEBUG(0, "_loadUsersDefaults()");
    // Reads the user's settings file...
    var theDom          = dw.getDocumentDOM(this.fileURL);
    var ruleSettings    = theDom.getElementsByTagName("UN:RULESETTINGS");
    var optionsSettings = theDom.getElementsByTagName("UN:OPTIONS");

    // Rule settings...
    for(var i=0; i<ruleSettings.length; i++) {
	var ruleSets = ruleSettings[i];
	var cnodes   = ruleSets.childNodes;
	var oneitem  = new SingleSetting("", false);

	for (var j=0; j<cnodes.length; j++) {
	    var node = cnodes[j];
	    var tagName = node.tagName;
	    if(tagName == "UN:RULEID") {          //Important: UPPER CASE!
		oneitem.setRuleID(node.innerHTML);
	    }
	    else if(tagName == "UN:ENABLED") {
		oneitem.setEnabled((node.innerHTML == "yes")?(true):(false));
	    }
	}
	this.rsList.push(oneitem);	
    }

    // Option settings...
    if(optionsSettings) {
	var optSets = optionsSettings[0];
	cnodes      = optSets.childNodes;
	for (j=0; j<cnodes.length; j++) {
	    node = cnodes[j];
	    tagName = node.tagName;
	    if(tagName == "UN:SHOWPASSED") {         
		this.showPassedEvaluations = (node.innerHTML == "yes")?(true):(false);
	    }
	}
    }

    // The following is necessary for [PR#276]!
    dreamweaver.releaseDocument(theDom);
}
// ***********************************************************
// ****** CLASS "RuleSettings": "LoadDefaults()" method ******
// Function that will be a method of RuleSettings.
// It loads the default values (enabled/disabled) for each
// rule, and the general options for all rules; the defaults are 
// stored into the file DEFAULT_RULES_URL.
// If this file doesn't exist -i.e. the extension is
// just installed- this method takes the factory defaults from
// the rule-registry.
//
// Returns: 
// - true    if all went ok;
// - false   else.
function loadDefaults() 
{	
    var msg="", fileContent="", exists=true, isEmpty=false, ok=true;

    // Test if the private object this.rsList is already
    // filled; in this case, I empty it.
    if(this.rsList) {
	if(this.rsList.length) {
	    this.rsList.length = 0;
	}
    }

    // Test if the file containing the user defaults 
    // exists and it is empty...
    if(DWfile.exists(this.fileURL)) {
	fileContent = DWfile.read(this.fileURL);
	if(/^\s*$/g.test(fileContent)) {  
	    // The file is empty: this means that the extension
	    // is just installed. I have to re-fill the file.
	    isEmpty = true;
	}
    }
    else {
	exists = false;
    }

    // Tests if (the file doesn't exists) OR (the file exists but it is empty).
    // If YES, i create/fill it, taking the factory defaults
    //         from the rule's description file.
    // If NO,  i load from it the defaults.
    if((!exists) || (isEmpty)) 
    {
	// Load information into the local object, from the rule-registry...
	ok = ok && this._loadFactoryDefaults();
	// Create the user's settings file...
	ok = ok && this._saveUsersSettings();
    }
    else {
	// Load information into the local object, from the user's settings file...
	this._loadUsersDefaults();
    }

    if(!ok) {
	alert(ERROR_IN_FUNCTION + "loading defaults.");
    }
    return ok;
}




// ***********************************************************
// The following functions relates to the state of the rules
// (setting / getting it).
// ***********************************************************
// ******** CLASS "RuleSettings":  GetRulesID method *********
// Function that will be a method of RuleSettings.
// It returns the list of all rule's ID stored into the object.
function getRulesID() 
{
	var len = this.rsList.length;
	var vect = new Array(len);
	
	for(var i=0; i<len; i++) {
		vect[i] = this.rsList[i].ruleID;
	}

	return vect;
}
// ***********************************************************
// ******** CLASS "RuleSettings": GetEnabled method *********
// Function that will be a method of RuleSettings.
// It returns the list of all enabled-rule's ID.
function getEnabled() 
{
	var len = this.rsList.length;
	var vect = new Array();
	var v = 0;
	for(var rs=0; rs<len; rs++) {
		if(this.rsList[rs].enabled == true)
			vect[v++] = this.rsList[rs].ruleID;
	}

	return vect;
}
// ***********************************************************
// ***** CLASS "RuleSettings": GetDescription method *********
// Function that will be a method of RuleSettings.
// It returns the id's brief description (a string), where
// the id is the input parameter identifying a rule.
// Returns the empty string if something went wrong.
//
// Parameter:
// - id      string: the rule id.
function getDescription(id) 
{
    if (!this._checkID(id))
	return "";

    var rule = App.constructor.un508asoem.ruleRegistry.getRuleByID(id);
    return rule.getRuleTitle();
}
// ***********************************************************
// ******** CLASS "RuleSettings": IsEnabled method ***********
// Function that will be a method of RuleSettings.
// It returns true/false if the rule's id (the input
// parameter) correspond to an enabled/disabled rule.
// Also returns false if the id is invalid.
//
// Parameter:
// - id      string: the rule id.
function isEnabled(id) 
{
    var i = this._findIndexFromID(id);
    if(i == -1)
	return false;

    if(this.rsList[i].enabled == true)	
	return true;
    else
	return false;
}
// ***********************************************************
// ******** CLASS "RuleSettings": IsDisabled method **********
// Function that will be a method of RuleSettings.
// It returns true/false if the rule's id (the input
// parameter) correspond to an disabled/enabled rule.
// Also returns true if the id is invalid.
//
// Parameter:
// - id      string: the rule id.
function isDisabled(id) 
{
    var i = this._findIndexFromID(id);
    if(i == -1)
	return false;

    if(this.rsList[i].enabled == false)	
	return true;
    else
	return false;
}




// ***********************************************************
// ********* CLASS "RuleSettings": Enable method *************
// Function that will be a method of RuleSettings.
// Enables the rule identified by the id input parameter.
//
// Parameter:
// - id      string: the rule id.
// Returns: 
// - true    if all went ok;
// - false   else.
function enable(id) 
{
    var i = this._findIndexFromID(id);
    if(i == -1)
	return false;

    this.rsList[i].enabled = true;	

    return true;
}
// ***********************************************************
// ********* CLASS "RuleSettings": Disable method ************
// Function that will be a method of RuleSettings.
// Disables the rule identified by the id input parameter.
//
// Parameter:
// - id      string: the rule id.
// Returns: 
// - true    if all went ok;
// - false   else.
function disable(id) 
{
    var i = this._findIndexFromID(id);
    if(i == -1)
	return false;

    this.rsList[i].enabled = false;	

    return true;
}



// ***********************************************************
// ********* CLASS "RuleSettings": setShowPassed *************
// Function that will be a method of RuleSettings.
// Saves the information about the rule settings check box.
// It establish if we have/NOT have to show "PASSED" rows in the 
// report window.
//
// Parameter:
// show:      boolean.
function setShowPassed(show)
{
    this.showPassedEvaluations = show;
}
// ***********************************************************
// ********* CLASS "RuleSettings": showPassed ****************
// Function that will be a method of RuleSettings.
// Returns:
// true     if we have to show "PASSED" rows in report window.
// false    else.
function showPassed()
{
    return this.showPassedEvaluations;
}


// ***********************************************************
// ********* CLASS "RuleSettings": getRSList *****************
// Constructs and return a copy of the private property this.rsList.
function getRSList() 
{
    var toReturn = new Array();

    for(var i=0; i<this.rsList.length; i++) {
	var ruleSet = this.rsList[i];
	var oneRuleSet = new SingleSetting(ruleSet.getRuleID(),
					   ruleSet.isEnabled());
	toReturn.push(oneRuleSet);
    }
    
    return toReturn;
}
// ***********************************************************
// ********* CLASS "RuleSettings": setRSList *****************
// Saves into the private property this.rsList, the information
// contained into the input parameter.
//
// This function loses the previously stored settings!
function setRSList(rsList) 
{
    this.rsList = rsList;
}



// ***********************************************************
// *********** CLASS "RuleSettings": constructor *************
function RuleSettings()
{
    // ----------------
    // Object's properties:

    this.rsList   = new Array();
    this.fileURL  = DEFAULT_RULES_URL;
    this.showPassedEvaluations = false;
    this.xmlFile  = new XmlFileConstruction(this.fileURL);

    // ----------------
    // Object's methods:

    // For the UI button 'Save as Default'...
    this._saveUsersSettings  = _saveUsersSettings;
    this.saveDefaults        = saveDefaults;

    // For the defaults loading...
    this._loadFactoryDefaults = _loadFactoryDefaults;
    this._loadUsersDefaults   = _loadUsersDefaults;
    this.loadDefaults         = loadDefaults;

    // For the state of the rules...
    this.getRulesID       = getRulesID;
    this.getEnabled       = getEnabled;
    this.getDescription   = getDescription;
    this.isEnabled        = isEnabled;
    this.isDisabled       = isDisabled;

    this.enable           = enable;
    this.disable          = disable;

    this.setShowPassed    = setShowPassed;
    this.showPassed       = showPassed;

    // For the object copy...
    this.getRSList        = getRSList;
    this.setRSList        = setRSList;

    this._checkID         = _checkID;
    this._findIndexFromID = _findIndexFromID;
}

// RuleSettings.js ends here


