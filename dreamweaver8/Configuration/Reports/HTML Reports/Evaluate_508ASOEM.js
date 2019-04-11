// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
/*
 * 508 Accessibility Suite for Dreamweaver and UltraDev
 * Copyright (C) 2001-2005 UsableNet, Inc. All rights reserved.
 */
/* $Id: Evaluate_508ASOEM.js,v 1.9 2005/03/23 11:59:07 malex Exp $ */

// Values for strings below are saved in Strings/508ASOEMStrings.xml

// buttons names
var OK_button = dw.loadString("508asoem/ev/ok");
var Cancel_button = dw.loadString("508asoem/ev/cancel");
var Enable_button = dw.loadString("508asoem/ev/enable");
var Disable_button = dw.loadString("508asoem/ev/disable");
var Save_button = dw.loadString("508asoem/ev/save");

// Messages to user
var TOUSER_SELECT_A_ROW = dw.loadString("508asoem/ev/select_a_row");
var RULE_BELONGS = dw.loadString("508asoem/ev/rule_belongs");
var ERROR_IN_FUNCTION = dw.loadString("508asoem/ev/error_in_function");

// the statuses of categories and rules
var Status_yes = dw.loadString("508asoem/ev/status_yes");
var Status_no = dw.loadString("508asoem/ev/status_no");
var Status_some = dw.loadString("508asoem/ev/status_some");
var Status_none = dw.loadString("508asoem/ev/status_none");
var Status_all = dw.loadString("508asoem/ev/status_all");

// this has to be the same as the one used in the Reference pages
var DWAS_REFERENCE_BOOK = dw.loadString("508asoem/reference_book");

// +++++ added for JIS X 8341-3 checker.
// alert to user if user duplicate select accessiblity checker. JIS and 508/WCAG.
var DUPLICATE_SELECTING = dw.loadString("JISX83413/duplicate_select");
// +++++

// ******************************************************
// ***************        API       *********************

function onDetailedInfo(description,ruleID, filepath,lineNum,startSel,endSel)
{
  if (App.constructor.un508asoem == null)
    {
	App.constructor.un508asoem = new Session();
	App.constructor.un508asoem.loadRules();
    }
  var rr = App.constructor.un508asoem.getRuleRegistry();
  if (rr == null) return;
  var rule = rr.getRuleByID(ruleID);
  if ((rule == null) || (rule == -1))
    return;
  var title = rule.getRuleTitle();
  book = new Array(DWAS_REFERENCE_BOOK,title);
  dw.referencePalette.setReference(book)
}



function beginReporting()
{
	// +++++ added for JIS X 8341-3 checker.
	if (App.constructor.JISX83413 != null)
		App.constructor.JISX83413 = null;

	if (App.constructor.status == "on") {
		alert(DUPLICATE_SELECTING);
		return false;
	}
	// +++++

    if (App.constructor.un508asoem == null)
    {
	App.constructor.un508asoem = new Session();
	App.constructor.un508asoem.loadRules();
	App.constructor.un508asoem.loadSettings();
    }
    App.constructor.un508asoem.init();
	dw.resultsPalette.siteReports.startProcessing();
    return true;
}

function configureSettings()
{
    return true;
}

function processFile (fileURL)
{
  if (!isHTMLType(fileURL))
        return;
    // Do not evaluate the results file!
    var re = /.*Results\.xml$/;
    if(re.test(fileURL)) {
	return;
    }
    App.constructor.un508asoem.applyRules(fileURL);
}

function endReporting()
{
  //    App.constructor.un508asoem.saveResults();
	dw.resultsPalette.siteReports.stopProcessing();
}


// ******************************************************
// All the buttons on the top/right side.
function commandButtons()
{
    return new Array(OK_button, "cmdOK()",
		     Cancel_button, "cmdCancel()",
		     Save_button, "cmdSaveSettings()");
}



// ******************************************************
// Called at the onLoad event of the BODY tag.
function onLoad()
{
    MM.setBusyCursor();
    clearTree();
    if (App.constructor.un508asoem == null) {
	// I do these initializations ONLY if this is the first time
	// this window is opened, AFTER the LAST open of her parent
	// window.
	//
	// Situation in which this is useful:
	// 1) Open RuleSettings and choosing a setting;
	// 2) Close with OK button (e.g., I want the current setting only for the current execution);
	// 3) Re-open RuleSetting (e.g., I want to control what I have just set, for the current execution).
	App.constructor.un508asoem = new Session();
	App.constructor.un508asoem.loadRules();
	App.constructor.un508asoem.loadSettings();
    }
    initTmpRuleSettings();
    createHtmlBody();
    MM.clearBusyCursor();
}


// ******************************************************
// *************** Setting Commands *********************
// *********** and accessory functions  *****************

// File that shows the category/rule settings
TMP_SETTINGS_FILE_NAME = DWAS_DATA_PATH + "/tmpSettingsFile.htm";

// ******************************************************
// Removes every node in the tree, whose name is not one of: "Category",
// "Rule", "Status", from the shown rule-setting-tree.
function clearTree()
{
    // Find the tree node object...
    var mytree = findObject("mytree");
    if(mytree == null)
	return true;

    if(mytree.hasChildNodes()) {
       var children = mytree.childNodes;
       for(var i=0; i<children.length; i++) {
          var child = children[i];
	  var name = child.getAttribute("name");
          if((name == "Category-Rule") || (name == "Status")) {
	      // Do not modify the main nodes...
	      continue;
	  }
	  else {
	      // Clears the tree node...
	      child.outerHTML = "";
	  }
       }
    }

    // Clear, if necessary, the global array...
    if(TreeInConstruction.value.length) {
	TreeInConstruction.value.length = 0;
    }
    return true;
}



// ******************************************************
// Clear the value of the temporarily object.
// In particular, it init his status with a copy of the status of
// the global object RuleSettings.
function initTmpRuleSettings()
{
    TmpRuleSettings.value = new RuleSettings();
    TmpRuleSettings.value.setRSList(App.constructor.un508asoem.ruleSettings.getRSList());
}


// ******************************************************
// Get the status of a row into the settings form.
// It could be "YES" or "NO".
//
// Parameter:
// "node"    the row node.
function getRowStatus(node)
{
    var value  = node.value;
    //var re = /NO$/;
    var re = new RegExp(Status_no+'$','');
    if(re.test(value))
	return Status_no;
    else
	return Status_yes;
}


// ******************************************************
// This function creates the clou part of the body of the html page
// that represents the rule settings.
// It constructs the tree control.
//
// Parameters:
// openCategories       an array containing all the categories that
//                      must be keep open in the construction of the tree.
//                      Associative array: the index is the category name,
//                      and the value is a boolean (true means expanded node).
//                      If it is the null value, no category is expanded.
// currentSelections    the row(s) that I must keep as selected.
//                      Associative array: the index is the category/rule name,
//                      and (if the index is a rule name) the value is a the
//                      related category.
//                      If it is the null value, the first category is selected.
//
// Returns:
// true                 if the is correctly created;
// false                else.
function buildTree(openCategories, currentSelections)
{
    var description="", ruleID="", selection=true, state=true, howIsEnabled="", catCode;
    var allOK = true, i=0;

    // Get an array of RuleCategory objects...
    var categories = App.constructor.un508asoem.ruleRegistry.getAllCategories();
    // Init the global array that will contain the html code of the tree...
    initTreeSaving();

    for(i=0; i<categories.length; i++) {
	// Check all the properties of the category line:

	// *** his name:
	catCode   = categories[i].getTitle();
	// *** how the category is enabled ("ALL", "NONE" or "SOME"):
	howIsEnabled = isCategoryEnabled(catCode);
	// *** if his node is expanded or not:
	if(openCategories == null)         { state = false; }
	else {
	    // Now I verify if it is 'undefined'...
	    if(openCategories[catCode])    { state = true; }
	    else                           { state = false; }
	}
	// *** if this category row is selected:
	if(currentSelections == null)      { selection = (i == 0) ? (true) : (false); }
	else {
	    if(currentSelections[catCode]) { selection = true; }
	    else                           { selection = false; }
	}

        // Add the CATEGORY line to the tree...
	allOK = allOK && addCategoryRow(catCode, howIsEnabled, state, selection);

	// Get an array of all rule-IDs (strings) pertaining to the current category:
	var rulesID = App.constructor.un508asoem.ruleRegistry.getRulesByCategory(catCode);
	for(var j=0; j<rulesID.length; j++) {
	    ruleID = rulesID[j];

	    if(TmpRuleSettings.value.isEnabled(ruleID))
	    { howIsEnabled = Status_yes;
	    }
	    else
	    { howIsEnabled = Status_no;
	    }

	    description  = App.constructor.un508asoem.ruleSettings.getDescription(ruleID);

	    // I verify if this rule row is selected...
	    if(currentSelections == null)                    { selection = false; }
	    else {
		if(currentSelections[ruleID]) { //If it is not 'undefined'...
		    // If the rule is selected IN THE CURRENT CATEGORY!
		    // Remember that a rule may belong to more than one category...
		    if(currentSelections[ruleID] == catCode) { selection = true; }
		    else                                     { selection = false; }
		}
		else                                         { selection = false; }
	    }

	    // Add the RULE line to the tree...
	    allOK = allOK && addRuleRow(ruleID, description, howIsEnabled, selection);
	}
	// Closes a category node.
	saveEndTreeNode();
    }

    // Moves the html code from the temporary global array to the
    // innerHTML property of the tree.
    endTreeSaving("mytree");

    return allOK;
}



// ******************************************************
// Enables/Disables the selected row: this could be a rule
// row or a category row. The function must update also
// all the remainig tree.
function enableOrDisable(what)
{
    var nodes = getSelectedNodes("mytree");
    var rules, id, theParent, name;
    var allOK = true;

    // There is not any row selected...
    if(nodes[0] == null) {
	alert(TOUSER_SELECT_A_ROW);
	return false;
    }

    // NOTE!
    // Currently it doesn't manage the situation in which exists more than one selected-row
    // in the tree (even if there's a for loop here...).
    // Anyway, this is always possible adding the "multiple" attribute to the TREECONTROL tag.
    for(var i=0; i<nodes.length; i++) {
	id = nodes[i].getAttribute("name");
	if(App.constructor.un508asoem.ruleRegistry.isCategoryTitle(id)) {   //IT IS A CATEGORY ROW.

	    // The subsequent for-loop enables all the rules of the just
	    // enabled category. It updates the temporary object; not the global one,
	    // nor the window.
	    rules = nodes[i].childNodes;
	    for(var j=0; j<rules.length; j++) {
		name = rules[j].getAttribute("name");

		if(what == "enable") { allOK = allOK && TmpRuleSettings.value.enable(name); }
		else                 { allOK = allOK && TmpRuleSettings.value.disable(name); }
	    }
	}
	else {					            //IT IS A RULE ROW.
	    name = nodes[i].name;
	    // Update rule on temporarily object...
	    if(what == "enable") { allOK = allOK && TmpRuleSettings.value.enable(name); }
	    else                 { allOK = allOK && TmpRuleSettings.value.disable(name); }
	}
    }

    // Now I save the IDs of all the open categories...
    var expandedCategories = new Array();
    var mytree = findObject("mytree");     //This is the tree-node.
    var treeChildren = mytree.childNodes;  //These are all the category-nodes.
    for(var k=0; k<treeChildren.length; k++) {
	var theChild  = treeChildren[k];
	var childName = theChild.getAttribute("name");
	// I do not consider headers....
	if((childName != "Category-Rule") && (childName != "Enabled")) {
	    // If the category is an expanded row, i remember it...
	    if(theChild.getAttribute("state") == "expanded") {
		expandedCategories[childName] = true;
	    }
	}
    }
    // Now I save the IDs of all the currently selected rows...
    var rowsSelected = new Array();
    for(k=0; k<nodes.length; k++) {
	var one = nodes[k];
	// In the following, it is interesting the content only if the "one" is a
	// rule row; if it is a category row, the content is ignored/useless.
	rowsSelected[one.getAttribute("name")] = one.parentNode.getAttribute("name");
    }

    // a) Clear the tree...
    clearTree();
    // b) Rebuild it...
    buildTree(expandedCategories, rowsSelected);

    return allOK;
}




// ******************************************************
// Class variable (or static variable).
// It stores the string that represents the html code for
// the tree to show.
function TreeInConstruction() {}
TreeInConstruction.value = new Array("");
// ******************************************************
// Class variable (or static variable).
// It is a temporarily RuleSettings object.
// It is created (ex-novo) every time the "onLoad()" method
// is called; it stores the information till the "OK" or the
// "Save Settings" button is pressed; in that moment, its
// state is saved into the (same but) global object.
// If another button is pressed ("Cancel" or "X"), its state
// is losed, and the global object is unchanged.
function TmpRuleSettings() {}
TmpRuleSettings.value = new RuleSettings();



// ******************************************************
// Construct the right parameters for a call to the
// function "saveNewTreeNode()".
function addCategoryRow(categCode, isEnabled, isExpanded, isSelected)
{
    if(isSelected == null)
	isSelected = false;
    var theNodeValue = new Array(categCode);
    theNodeValue.push("|");
    theNodeValue.push(isEnabled);
    return saveNewTreeNode("global", categCode, theNodeValue.join(""),
			   isExpanded, true, isSelected);
}


// ******************************************************
// Construct the right parameters for a call to the
// function "saveNewTreeNode()".
function addRuleRow(ruleID, description, isEnabled, isSelected)
{
    var theNodeValue = new Array(description);
    theNodeValue.push("|");
    theNodeValue.push(isEnabled);
    return saveNewTreeNode("global", ruleID, theNodeValue.join(""),
			   "", false, isSelected);
}


// ******************************************************
// Get the state of the category ("title" is the category ID).
// Returns:
// "ALL"    if all rules for the category are enabled;
// "NONE"   if none of the rules for the category are enabled;
// "SOME"   if some but not all the rules for the category are enabled.
function isCategoryEnabled(title)
{
    // Get an array of strings (array of rule ID).
    var allRules = App.constructor.un508asoem.ruleRegistry.getRulesByCategory(title);

    var howMany = 0;
    for(var i=0; i<allRules.length; i++) {
	if(TmpRuleSettings.value.isEnabled(allRules[i])) { howMany++; }
    }

    if(allRules.length == howMany)
	return Status_all;
    if(howMany == 0)
	return Status_none;
    else
	return Status_some;
}


// ******************************************************
// It constructs the html BODY of the rule-setting window.
function createHtmlBody()
{
    // Set all the options...
    var mycheckbox = findObject("dontShowPassed");
    if(App.constructor.un508asoem.ruleSettings.showPassed()) {
	// I check the box...
	mycheckbox.setAttribute("CHECKED", "CHECKED");
    }
    else {
	// I clear the box...
	if(mycheckbox.getAttribute("CHECKED")) {
	    mycheckbox.removeAttribute("CHECKED");
	}
    }

    // This constructs the tree. Input parameters:
    // * the first represents the list of categories that must be expanded
    //   (no-one in this case);
    // * the second is the list of currently selected rows (only the first
    //   in this case; a null array has the same meaning);
    buildTree(null, null);

    return true;
}



// ******************************************************
// Save in the global object, the current (temporary) rule
// settings and the options...
function saveCurrentSettings()
{
    // Save the ***options*** into the global object...
    // (I fetch them directly from the window).
    var mycheckbox = findObject("dontShowPassed");
    var isChecked  = mycheckbox.getAttribute("CHECKED");
    if((isChecked == "CHECKED") || (isChecked == "checked")) {
	App.constructor.un508asoem.ruleSettings.setShowPassed(true);
    }
    else {
	App.constructor.un508asoem.ruleSettings.setShowPassed(false);
    }

    // Save the ***rule settings*** into the global object...
    // (I fetch them from the temporary object).
    App.constructor.un508asoem.ruleSettings.setRSList(TmpRuleSettings.value.getRSList());

    return true;
}



// ******************************************************
// This function crates the temporary file that is shown
// after the user pushed the button "View Description".
//
// Input:
// - type     "category" or "rule".
// - rule     the rule object, if type="rule"; null else.
// - title
// - description
// Returns:
// - true     if the file is correctly created.
// - false    else.
function createTmpSettingsFile(type, rule, title, description)
{
    // 1) Get document dom of the template file.
    var theDom = dreamweaver.getDocumentDOM(DWAS_SHARED_PATH + "/html/RuleOrCategoryDescTemp.htm");

    // 2) Modify the document dom.
    var bNodes = theDom.getElementsByTagName("b");
    var tmpString = "", ok=true;
    for(var i=0; i<bNodes.length; i++) {
	var bName = bNodes[i].getAttribute("name");

	if(bName == "ruleOrCatName") {
	    tmpString = "";
	    if(type == "category")  { tmpString = "Category: "; }
	    else                    { tmpString = "Rule: "; }
	    bNodes[i].innerHTML = tmpString;
	    continue;
	}
	if(bName == "ruleOrCatTitle") {
	    bNodes[i].innerHTML =  title;
	    continue;
	}
    }
    var tdNodes = theDom.getElementsByTagName("td");
    var tmpString = "", ok=true;
    for(var i=0; i<tdNodes.length; i++) {
	var tdName = tdNodes[i].getAttribute("name");

	if(tdName == "description") {
	    //Get the child (a FONT tag) and write inside his innerHTML property.
	    var childNode = tdNodes[i].childNodes[0];
	    childNode.innerHTML = description;
	    continue;
	}
    }
    var trNodes = theDom.getElementsByTagName("tr");
    for(var i=0; i<trNodes.length; i++)
    {
	var trName = trNodes[i].getAttribute("name");

	if(trName == "belongsToCategories1") {
	    if(type == "category")  { trNodes[i].outerHTML = ""; }
	    else                    {
		trNodes[i].childNodes[0].childNodes[0].innerHTML = "<b>Categories</b>";
	    }
	    continue;
	}
	if(trName == "belongsToCategories2") {
	    if(type == "category")  { trNodes[i].outerHTML = ""; }
	    else                    {
		trNodes[i].childNodes[0].childNodes[0].innerHTML = "&nbsp;";
	    }
	    continue;
	}
	if(trName == "belongsToCategories3") {
	    if(type == "category")  { trNodes[i].outerHTML = ""; }
	    else
	    {
		trNodes[i].childNodes[0].childNodes[0].innerHTML = RULE_BELONGS + rule.getCategories().join(", ") + ".";
	    }
	    continue;
	}
    }

    // 3) Get its outerHTML and Write it into tmp file.
    ok = true;
    if(DWfile.write(TMP_SETTINGS_FILE_NAME, theDom.documentElement.outerHTML))
	ok = true;
    else
	ok = false;

    // 4) Release memory.
    dreamweaver.releaseDocument(theDom);
    return ok;
}



// ****************************************************
// ****************************************************
//                     API COMMANDS
// ****************************************************


// ******************* OK *******************************
// Saves settings for the current session.
function cmdOK()
{
    MM.setBusyCursor();
    // Saves in the global object, the rule settings and the options...
    var ok = saveCurrentSettings();
    MM.clearBusyCursor();

    window.close();

    return ok;
}


// *******************  Cancel **************************
// Closes the window losing unsaved changes to the settings.
function cmdCancel()
{
    window.close();
    return true;
}


// ******************* Enable ***************************
// Enables the (single) selected row.
function cmdEnable() {
    MM.setBusyCursor();
    var ok = enableOrDisable("enable");
    MM.clearBusyCursor();

    return ok;
}


// ******************* Disable **************************
// Disable the (single) selected row.
function cmdDisable()
{
    MM.setBusyCursor();
    var ok = enableOrDisable("disable");
    MM.clearBusyCursor();

    return ok;
}


// ******************* SaveSettings *******************
// First, it saves the current settings from the temporary
// object to the global one.
//
// Second, it saves the settings stored into the global object
// ('ruleSettings') into the file.
function cmdSaveSettings()
{
    MM.setBusyCursor();

    // Save in the global object, the current (temporary)
    // rule settings and the options...
    var ok = saveCurrentSettings();

    // Save in the user's default file all the settings...
    ok = App.constructor.un508asoem.ruleSettings.saveDefaults();

    MM.clearBusyCursor();

    return ok;
}


// ******************* ViewDescription ******************
// Show the current selected rule/category description.
function cmdViewDescription()
{
    var nodes = getSelectedNodes("mytree");
    var id, category = null, rule = null, title = "", description = "";
    var what = null;

    // There is not any row selected...
    if(nodes[0] == null) {
	alert(TOUSER_SELECT_A_ROW);
	return false;
    }

    // Start computing...
    MM.setBusyCursor();

    deleteTmpFile("settings");

    id = nodes[0].getAttribute("name");
    if(App.constructor.un508asoem.ruleRegistry.isCategoryTitle(id)) {   //It is a CATEGORY row.
	category = App.constructor.un508asoem.ruleRegistry.getCategory(id);
	title = category.getTitle();
	description = category.getDescription();
    }
    else {				               //It is a RULE row.
	rule = App.constructor.un508asoem.ruleRegistry.getRuleByID(id);
	title = rule.getRuleTitle();
	description = rule.getRuleDescription();
    }
    what = (category != null)?("category"):("rule");
    createTmpSettingsFile(what, (what == "rule")?(rule):(null),
			  title, description);
    dreamweaver.browseDocument(TMP_SETTINGS_FILE_NAME);

    // End computation...
    MM.clearBusyCursor();

    return true;
}


// ******************* Help *****************************
function cmdHelp()
{
    MM.setBusyCursor();

    // TODO: '#' should be used!
    //dwasDisplayHelp("Help.htm#report_settings");
    dwasDisplayHelp("Help.htm");

    MM.clearBusyCursor();
}


// Evaluate.js ends here
