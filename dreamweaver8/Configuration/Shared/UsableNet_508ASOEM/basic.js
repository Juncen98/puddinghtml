/*
 * 505/W3C Accessibility Suite OEM V2 for Macromedia Dreamweaver
 * (C) Copyright 2001-2005 UsableNet Inc. All rights reserved.
 */
/* $Id: basic.js,v 1.15 2005/03/23 11:59:07 malex Exp $ */

/*
   Contains definition of infrastructure classes of DWAS this is a
   basic module that needs to be loaded in order to use DWAS.
*/
  
/* flag controlling if error conditions should be notified to user 
*/
_ON_ERROR_BLOCK = true;

function notifyError(msg) {
  if (_ON_ERROR_BLOCK)
    alert(dw.loadString("508asoem/sh/internal_error") + NEWLINE + msg);
}

// constants for problem severity
CaP = 4;
CaP_symbol = 'Severe';
MaP = 3;
MaP_symbol = 'Major';
MiP = 2;
MiP_symbol = 'Minor';
NoP = 0;
NoP_symbol = 'Note';//not a problem

// possible statuses for a problem 
FAILED_STATUS = dw.loadString("508asoem/sh/failed_status");
MANUAL_STATUS = dw.loadString("508asoem/sh/manual_status");
PASSED_STATUS = dw.loadString("508asoem/sh/passed_status");

/* icons to use in report trace window ; see Reports.js */
// [GB: 22Dec01] had to change these to new names adopted in DW5
ICON_FAILED = REP_ICON_X;	// red X 'ERROR'
ICON_MANUAL = REP_ICON_QUESTION;    // question mark 'ALERT'
ICON_PASSED = REP_ICON_NONE;           // document icon

/* function to create a usability problem
   hiding the specific class
*/
function makeUsabPbm(ruleID, fileAttr, offsets, status, message)
{
    var start = offsets[0];
    fileAttr.DOM.source.setSelection(start, start);
    var lineNum = fileAttr.DOM.source.getCurrentLines(start, start)[0];
    // [GB: 22Dec01] there appears to be another API to do it
    // dom.source.getLineFromOffset(iStartSel)
    return new UsabPbm(ruleID, fileAttr.URL, offsets, lineNum, status, message);
}

/**************************************************
 *
 *                UsabPbm
 *
   represent a usability problem found by some rule on some document.
   it is a serializable object (with no in memory
   references to other objects)
	   
   constructor args:
   ruleID: is the internal name of a rule
   fileURL: is file://....
   offsets: is an array of two integers, giving the position
            in chars of the first and last char of the region
	    containing the feature of the document that is a possible
	    cause of the problem
   status: may be FAILED_STATUS, MANUAL_STATUS
   message: null or a string that is to be displayed in the report window
*/

function UsabPbm (ruleID, fileURL, offsets, lineNum, status, message)
{
    if (!ruleID)
        notifyError("while creating UsabPbm no rule was given.");
    this.ruleID = ruleID;
    if (!fileURL)
        notifyError("while creating UsabPbm "+ ruleID + " no fileURL was given.");
    this.fileURL = fileURL;
    if (!offsets)
        notifyError("while creating UsabPbm "+ ruleID + " on "+fileURL+ " no offsets where given.");
    this.offsets = offsets;
    this.lineNum = lineNum;
    this.status = status;
    this.message = (message) ? message : '';

    // Index of this problem inside the file containing the results.
    // This is useful for the construction of the problems-tree to show.
    this.index = -1;  
    // ---------- end of constructor ----------
	
    // ---------- accessors ----------
    this.getRuleID = function()
    {
        return this.ruleID;
    }
    // ------------------------------
    this.getFileURL = function()
    {
        return this.fileURL;
    }
    // ------------------------------ 
    this.getOffsets = function()
    {
        return this.offsets;
    }
    // ------------------------------ 
    this.getLineNum = function()
    {
        return this.lineNum;
    }
    // ------------------------------ 
    this.getStatus = function()
    {
        return this.status;
    }
    // ------------------------------ 
    this.getMessage = function()
    {
        return this.message;
    }
    // ------------------------------ 
    this.updateManualStatus = function(newStatus)
    {
	// Checking the input...
	if((newStatus == PASSED_STATUS) || 
	   (newStatus == "EDITED") || 
	   (newStatus == FAILED_STATUS)) 
	{}
	else return false;
	
	if(this.status == MANUAL_STATUS)
	{
	    // In this case, I only append the new information to the
	    // previous status.
	    this.status += " -- " + newStatus;
	}
	else {
	    // In this case the status could be one of:
	    // "MANUAL -- FAILED" or "MANUAL -- PASSED" or "MANUAL -- EDITED".
	    // I take off the string following " -- " and append newStatus.
	    var index = this.status.indexOf(" -- ");
	    var prefix = this.status.substring(0, index);
	    this.status = prefix + " -- " + newStatus;
	}
	return true;
    }
    // ------------------------------ 
    this.setIndex = function(ind)
    {
	this.index = ind;
    }
    // ------------------------------ 
    this.getIndex = function()
    {
	return this.index;
    }
}

UsabPbm.prototype.setStatus = function(stat)
{
    this.status = stat;
}
  

/**************************************************
 *
 *                ProblemStore
 *
   represent a collection of usability problems

*/

function ProblemStore()
{
    // nothing for the moment
    this.thestore = new Array();
    this.savefile = DWAS_DATA_PATH + REPORTS_RESULTS_FILE;
    this.sfModificationDate = ""; 
    this.allPbmsByPage = new Array();
    this.allFileURLs = new Array();
    this._prevURL = "";

    // Init
    this.init = function()
    {
	this.thestore.length = 0;
	this.allPbmsByPage.length = 0;
	this.allFileURLs.length = 0;
	this._prevURL = "";
	this.setResultsURL();
    }

    // Set Savefile modification date
    this.setResultsModDate = function()
    {
	this.sfModificationDate = DWfile.getModificationDate(this.savefile);
    }

    // Get Savefile last modification date setted
    this.getResultsModDate = function()
    {
	return this.sfModificationDate;
    }

    // Set Savefile URL
    this.setResultsURL = function()
    {
	this.savefile = dw.getSiteRoot();
	if (this.savefile == "")
	    this.savefile = DWAS_DATA_PATH + REPORTS_RESULTS_FILE;
	else {
	    if (!DWfile.exists(this.savefile + "_notes"))
		DWfile.createFolder(this.savefile + "_notes");
	    this.savefile += "_notes" + REPORTS_RESULTS_FILE;
	}
    }
 
    // Get problem by array index.
    this.getPbmByIndex = function(index)
    {
	return this.thestore[index];
    }

    // Get problems by rule.
    this.getPbmsByRule = function(ruleID)
    {
	var pbmsByRule = new Array();  // This is the array to return. It will contain the pbms.
	for (var i = 0; i < this.thestore.length; i++)
	{
	    var thePb = this.thestore[i];
	    if (thePb.getRuleID() == ruleID)
		pbmsByRule.push(phePb);
	}
	return pbmsByRule;
    }

    // Get all FileURL in the problem store (ie, all the pages with almost
    // an error). If the boolean parameter values true, the function
    // prepares an efficient data-structure to make faster the future
    // rule data retrieving.
    this.getAllFileURL = function()
    {
	return this.allFileURLs;
    }

    // Get all problems-reference array, by file URL.
    this.getPbmsByFileURL = function(fileURL)
    {
	return this.allPbmsByPage[fileURL];
    }

    // Add a new problem to the store
    this.addPbm = function(aProblem)
    {
	aProblem.setIndex(this.thestore.length);
	this.thestore.push(aProblem);
	var url = aProblem.getFileURL();
	if (url != this._prevURL)
	{
	    this.allFileURLs.push(url);
	    this.allPbmsByPage[url] = new Array();
	    this._prevURL = url;
	}
	this.allPbmsByPage[url].push(aProblem); 
    }

    // Save on file
    this.saveResults = function()
    {
	this.setResultsURL();
	var ostr = new Array();
	ostr.push("<?xml version=\"1.0\" encoding=\"ISO-8859-1\" standalone=\"yes\" ?>" + NEWLINE);
        ostr.push("<un:pbmstore xmlns:un=\"http://usablenet.com/namespaces/508as_results\">" + NEWLINE);
	this._write(ostr, false);
	ostr.length = 0;
	for (var i = 0; i < this.thestore.length; i++)
        {
	    ostr.push("  <un:pbmitem>" + NEWLINE);
	    var pbm = this.thestore[i];
	    ostr.push("    <un:ruleid>");
	    ostr.push(pbm.getRuleID());
	    ostr.push("</un:ruleid>" + NEWLINE);
	    ostr.push("    <un:fileurl>");
	    ostr.push(pbm.getFileURL());
	    ostr.push("</un:fileurl>" + NEWLINE);
	    ostr.push("    <un:offset1>");
	    ostr.push(pbm.getOffsets()[0]);
	    ostr.push("</un:offset1>" + NEWLINE);
	    ostr.push("    <un:offset2>");
	    ostr.push(pbm.getOffsets()[1]);
	    ostr.push("</un:offset2>" + NEWLINE);
	    ostr.push("    <un:linenum>");
	    ostr.push(pbm.getLineNum());
	    ostr.push("</un:linenum>" + NEWLINE);
	    ostr.push("    <un:status>");
	    ostr.push(pbm.getStatus());
	    ostr.push("</un:status>" + NEWLINE);
	    ostr.push("    <un:message>");
	    ostr.push(pbm.getMessage());
	    ostr.push("</un:message>" + NEWLINE);
	    ostr.push("  </un:pbmitem>" + NEWLINE);
	    this._write(ostr, true);
	    ostr.length = 0;
	}
	ostr.push("</un:pbmstore>" + NEWLINE);
	this._write(ostr, true);
	ostr.length = 0;
    }

    // Wrap function to DWfile.write
    this._write = function(ostr, append)
    {
	var status = 0;
	if (append)
            status = DWfile.write(this.savefile, ostr.join(""), "append");
	else
            status = DWfile.write(this.savefile, ostr.join(""));
	if (! status)
	    alert("Error saving ProblemStore on file \"" + this.savefile + "\"");
    }

    // Test if are there any results file
    this.existsResults = function()
    {
	return DWfile.exists(this.savefile) ? true : false;
    }

    // Test if are the results file is changed
    this.resultsChanged = function()
    {
	var newModDate = DWfile.getModificationDate(this.savefile);
	if(newModDate > this.sfModificationDate) {
	    this.sfModificationDate = newModDate;
	    return true;
	}
	return false;
    }

    // Read last saved results file
    this.loadResults = function()
    {
	this.setResultsURL();
	var ok = true;

	if(this.existsResults()) {	
	    var theDom = dw.getDocumentDOM(this.savefile);
	    var tree = theDom.getElementsByTagName('un:pbmitem');
	    this.thestore.length = 0; // Truncate array
	    for (var i = 0; i < tree.length; i++)
	    {
		var item = new Array();
		var cnodes = tree[i].childNodes;
		for (var j = 0; j < cnodes.length; j++)
		{
		    var myn = cnodes[j];
		    if (myn.nodeType != Node.ELEMENT_NODE)
			continue;
		    item[myn.tagName] = myn.innerHTML;
		}
		var offsets = [item['UN:OFFSET1'], item['UN:OFFSET2']];
		var mypbm = new UsabPbm(item['UN:RULEID'], item['UN:FILEURL'],
					offsets, item['UN:LINENUM'],
					item['UN:STATUS'], item['UN:MESSAGE']);
		this.addPbm(mypbm);
	    }

	    dw.releaseDocument(theDom);

	    // Results correctly loaded.
	    ok = true;
	}
	else {
	    // Results file does not exist.
	    ok = false;
	}
	return ok;
    }

} // End class


/**************************************************
 *
 *                GUIManager
 *
   handle interaction with the GUI
 */
function GUIManager()
{
    this.reportNotify = function(fileURL, rule, pbm)
    {
    	/* pbm: an instance of UsabPbm or NULL (in case rule
           execution did not find any problem)
           fileURL: file://.... of the document in which the problem
           has been found
           rule: the rule object
	   
           Effect:
               print an entry in the report window
           Note:
               fileURL and ruleID are repeated (as args and inside pbm) because
               for PASSED rules, pbm may be NULL.
        */
        var ruleID = rule.getRuleID();
        var msg = rule.getRuleTitle() + "  [" + rule.getGuideline(false) + "]  ";
		var siteRelativePath = dwscripts.getSiteRelativePath(fileURL);
        if (pbm == null)
        {
			msg += " -- " + PASSED_STATUS;
			dw.resultsPalette.siteReports.addResultItem(this,
					fileURL, 5, siteRelativePath, msg,0,0,0,ruleID);
        }
		else 
		{
			// +++++ modify for JIS X 8341-3 checker.
			var strIcon = (pbm.getStatus() == MANUAL_STATUS) ? 7 : 6;
			// +++++
			msg += " -- " + pbm.getStatus();
			// removed since it is the same for all the rules
			//msg += " -- " + rule.getSeverity();
			msg += " -- " + pbm.getMessage();
			var offsets = pbm.getOffsets();
			var lineNum = pbm.getLineNum();
			dw.resultsPalette.siteReports.addResultItem(this,
				fileURL, strIcon, siteRelativePath, msg,
					lineNum, offsets[0], offsets[1], ruleID);
        }
    }
}


/**************************************************
 *
 *                StoredTestsManager
 *
   represent and handle manual tests that have already been performed
   on the current site
 *
*/

function StoredTestsManager ()
{// nop
}
/* return the status of the recorded test corresponding to */
/*   pbm. Return null if no recorded test corresponds to pbm*/
/* A recorded test corresponds to pbm iff: */
/* - it has the same ruleID, fileURL, offset */
StoredTestsManager.prototype.testOutcome = function(pbm)
{
  return null;// temporary implementation
}
  

/**************************************************
 *
 *                Session
 *
   bind together everything is needed to supply a context
   to rule execution
 *
*/
function Session ()
{
    // initialize some attributes
    this.problemStore = new ProblemStore();
    this.GUIManager = new GUIManager();
    this.storedTests = new StoredTestsManager();
    this.ruleSettings = new RuleSettings();
    this.ruleRegistry = new RuleRegistry();
    this.cssCache = new CSSCache();
    // -------------------- end of constructor

    this.init = function() {
	this.cssCache = new CSSCache();
	this.problemStore.init();
    }

    this.initExplainAndFix = function()
    {
	var ok = true;
	this.loadRules();
	if(!this.loadResults()) {
	    alert("There are no results to show." + NEWLINE + "Run the \"Evaluate\" command before!");
	    ok = false;
	}
	if(ok)  //i.e.: if(this.problemStore.existResults())
            this.problemStore.setResultsModDate();
	return ok;
    }

    this.getGUIManager = function()
    {
        return this.GUIManager;
    }
   
    this.getProblemStore = function()
    {
        return this.problemStore;
    }
    
    this.getRuleRegistry = function()
    {
    	return this.ruleRegistry;
    }
    
    this.addPbm = function(aPbm)
    // delegate to the session problem store
    {
        this.problemStore.addPbm(aPbm);
    }
    
    this.reportNotify = function(file, rule, pbm)
    // delegate to the session GUI manager
    {
        this.GUIManager.reportNotify(file, rule, pbm);
    }
    
    this.saveResults = function()
    {
        this.problemStore.saveResults();
    }

    // return true if the results are correctly loaded;
    // false if there is no result file.
    this.loadResults = function()
    {
        return this.problemStore.loadResults();
    }

    this.loadSettings = function()
    {
	this.ruleSettings.loadDefaults();
    }

    this.loadRules = function()
    {
        this.ruleRegistry.loadRules();
    }
    
    this.applyRules = function(fileURL)
    {
        this.ruleRegistry.applyRules(fileURL, this);
    }

    // return the container of manual tests that have already been recorded
    // for the current site
    this.getStoredTests = function()
    {
        return this.storedTests;
    }

    // retrieve the stored test corresponding to thisPbm, if any;
    // if found then update thisPbm.status with the recorded status
    this.checkStoredTests = function(thisPbm)
    {
        storedTests = this.getStoredTests();
        storedOutcome = storedTests.testOutcome(thisPbm);
        if (storedOutcome)
        {
            // update its status
            if (storedOutcome == PASSED_STATUS)
	        thisPbm.setStatus(PASSED_STATUS);
            else if (storedOutcome == FAILED_STATUS)
	        thisPbm.setStatus(FAILED_STATUS);
            else
	        notifyError('IMGwEquivalentALT: unforeseen problem status '+
			    storedOutcome + 'for problem '+  thisPbm);
        }
    }
}


/************************************************************
 *
 *       class Rule
 * 
 * is the base abstract class of all the rules
 * 
 ************************************************************/
function Rule()
{
    this.ruleID = '';
    this.ruleTitle ='';        // name as displayed to users
    this.ruleDescription = ''; // describes what the rule does
    this.pbmDescription = '';  // describes the problem
    this.pbmExplanation = '';  // explains the consequences of the problem
    this.pbmLearnMore = '';    // provides links to relevant material on the web
    this.ruleGuideline = '';   // WAI/WCAG guideline
    this.pbmCorrection = '';   // describes what can be done for solving the problem
    this.severity = -1;        // either CaP, Map, MiP, NoP or -1 if undefined
    this.ruleIsManual = false; // true iff the rule requires manual test
    this.categories = new Array();  // an array of strings, each being the
				    // name of a rule category
    this.pbmMessages = new Object();// hash table: key --> message text
    this.isEnabled = false;         // is enabled?
}

    // RO accessors
Rule.prototype.getRuleID = function()
{
    return this.ruleID;
}

Rule.prototype.getRuleTitle = function()
{
    return (this.ruleTitle != '') ? this.ruleTitle : this.ruleID;
}

Rule.prototype.getRuleDescription = function()
{
    return (this.ruleDescription != '') ? this.ruleDescription : this.getRuleTitle();
}

Rule.prototype.getPbmDescription = function()
{
    return (this.pbmDescription != '') ? this.pbmDescription : this.getRuleTitle();
}

Rule.prototype.getExplanation = function()
{
    return (this.pbmExplanation != '') ? this.pbmExplanation : this.getRuleTitle();
}

Rule.prototype.getLearnMore = function()
{
    return (this.pbmLearnMore != '') ? this.pbmLearnMore : this.getRuleTitle();
}

// Returns the html code [if('html'==true || 'html'==null)] or simply the text (if 'html'=false) of the xml element.
Rule.prototype.getGuideline = function(html)
{
    var guideline = '';
    if(this.ruleGuideline != '') {
	guideline = this.ruleGuideline;
	if(html == null)
	    html = true;
	if(html == false) { //Take off <...> tags from the guideline content...
	    guideline = guideline.replace(/<[^<>]*>/gi, '');
	}
    }
    else {
	guideline = this.getRuleTitle();
    }
    return guideline;
}

Rule.prototype.getCorrection = function()
{
    return (this.pbmCorrection != '') ? this.pbmCorrection : this.getRuleTitle();
}

Rule.prototype.getSeverity = function()
{
    return this.severity;
}

Rule.prototype.isManual = function()
{
    return this.ruleIsManual;
}

Rule.prototype.getCategories = function()
{
    return this.categories;
}

Rule.prototype.getFactoryDefault = function()
{
    return this.isEnabled;
}

// the following function is the same for all the rules
Rule.prototype.check = function (fileAttr, session)
{
    var foundAny = false;
    var wrong = this.findPbms(fileAttr, session);
    for (var i = 0; i < wrong.length; i++) 
    {
        var pbm = wrong[i];
        foundAny = true;
        session.reportNotify(fileAttr.URL, this, pbm);
        session.addPbm(pbm);
    }
    if ((!foundAny) && (session.ruleSettings.showPassed()))
        session.reportNotify(fileAttr.URL, this, null);
}

// isInCategory
Rule.prototype.isInCategory = function(title)
{
    var i;
    for (i = 0; i < this.categories.length; i++) {
        if (title == this.categories[i])
            break;
    }
    return (i < this.categories.length) ? true : false;
}
// return the problem message whose attribute name is key
Rule.prototype.getRuleMessage = function(key)
{
  var res = this.pbmMessages[key];
  return (res) ? res : '';
}


/************************************************************
 *
 *       class Category
 * 
 * is the base abstract class of all the categories
 *   a category is identified by its title
 *   it has to be regsitered in a registry
 *   when a rule is created its categories should be already registered
 ************************************************************/

function RuleCategory()
{
    this.title = '';// name as displayed to users
    this.description = ''; // describes what the category is

    this.getTitle = function()
    {
        return this.title;
    }
    
    this.getDescription = function()
    {
    	return this.description;
    }
}

// ----------------------------------------------------------------------------
// FileAttr
// ----------------------------------------------------------------------------

function FileAttr()
{
    this.URL = null; // fileURL
    this.DOM = null; // the DOM of fileURL
    this.cssa = null;
}

// ----------------------------------------------------------------------------
// RulesRegistry
// ----------------------------------------------------------------------------

function RuleRegistry()
{
    this.rules = new Array(); // all the rules
    this.ruleinfo = new Array(); // rule info loaded from xml file
    this.categories = new Array(); // all the categories
    this.catinfo = new Array; // all the category info loaded from xml file

    // load all the rules
    this.loadRules = function()
    {
        for (i = 0; i < DWAS_RULES_FILES.length; i++)
            this._loadXMLInfo(DWAS_RULES_PATH + DWAS_RULES_FILES[i]);
	for (var i = 0; i < this.catinfo.length; i++)
  	    this._addCategory(this.catinfo[i]);
        for (var i = 0; i < All508Rules.length; i++)
    	    this._addRule(All508Rules[i]);
        for (var i = 0; i < AllWcagP2Rules.length; i++)
    	    this._addRule(AllWcagP2Rules[i]);
    }

    // load all info from XML File
    this._loadXMLInfo = function(xmlurl)
    {
	var xmlparser = new XMLRulesParser(xmlurl);
	// load form XML file the list of all categories...
	this.catinfo = this.catinfo.concat(xmlparser.getCategoryInfo());
	// ... and infos about all rules.
	this.ruleinfo = this.ruleinfo.concat(xmlparser.getRuleInfo());
    }

    // add a Category
    this._addCategory = function(cinfo)
    {
	for (i = 0; i < this.categories.length; i++)
	    if (this.categories[i].title == cinfo.title)
	        // skip categories already defined
	        return;
	var rcat = new RuleCategory();
	rcat.title = cinfo.title;
	rcat.description = cinfo.description;
	this.categories.push(rcat);
    }

    // add a Rule
    this._addRule = function(rule)
    {
	var i;
	for (i = 0; i < this.ruleinfo.length; i++)
	    if (this.ruleinfo[i].id == rule.getRuleID())
	    {
		var ri = this.ruleinfo[i];
		rule.ruleTitle = ri.title;
		rule.severity = ri.severity;
		rule.ruleDescription = ri.description;
		rule.pbmDescription = ri.pbmDescription;
		rule.pbmExplanation = ri.pbmExplanation;
		rule.pbmLearnMore = ri.pbmLearnMore;
		rule.ruleGuideline = ri.ruleGuideline;
		rule.pbmCorrection = ri.pbmCorrection;
		rule.categories = ri.categories;
		rule.pbmMessages = ri.pbmMessages;
		rule.isEnabled = ri.isEnabled;
		// check if it belongs to the manual category 
		// do it case insensitive
		var s = ri.categories.join(',');
		s = s.toLowerCase();
		var manualStr = MM.LABEL_MANUAL;			//manual in English
		rule.ruleIsManual = (s.search(manualStr) == -1) ? false : true;
		break;
	    }
	if (i == this.ruleinfo.length)
	    alert('Cannot find Rule "' + rule.getRuleID() + '" in rules.xml'); 
    	this.rules.push(rule);
    }

    // apply all rules to fileURL
    this.applyRules = function(fileURL, session)
    {
	var fileAttr = new FileAttr();
	fileAttr.URL = fileURL;
	fileAttr.DOM = dw.getDocumentDOM(fileURL);
	fileAttr.cssa = new CSSAnalyzer(fileAttr, session);
    	for (var i = 0; i < this.rules.length; i++)
	{
	    var myrule = this.rules[i];
	    if (session.ruleSettings.isEnabled(myrule.getRuleID())) {
	      // traceString("applying rule " + myrule.getRuleID(), true);
	      myrule.check(fileAttr, session);
	    }
	}
    }

    // get all rules-ID and the flag enabled/disabled for each.
    this.getAllRuleID = function()
    {
	var i, rule, assArray = new Array();
	for(i=0; i<this.rules.length; i++) {
	    rule = this.rules[i];
	    assArray[rule.getRuleID()] = rule.getFactoryDefault();
	}
	return assArray;
    }

    // get a Rule given its ID
    // returns -1 if ruleID doesn't exist
    this.getRuleByID = function(ruleID)
    {
        var i;
        for (i = 0; i < this.rules.length; i++)
	    if (this.rules[i].getRuleID() == ruleID)
	    	break;
	return (i < this.rules.length)?(this.rules[i]):(-1);
    }
    
    // get all categories in Rule Registry
    this.getAllCategories = function()
    {
    	return this.categories;
    }

    // tests if an input category title is valid
    this.isCategoryTitle = function(title)
    {
	for(var i=0; i<this.categories.length; i++)
	{
	    if (this.categories[i].title == title) 
	        return true;
        }
	return false;
    }
    
    // get a category by category title
    this.getCategory = function(title)
    {
	for(var i=0; i<this.categories.length; i++)
	{
	    if (this.categories[i].title == title) 
	        return this.categories[i];
        }
	return null;
    }

    // get all rules in a catetory
    this.getRulesByCategory = function(title)
    {
	var crules = new Array();
        for (var i = 0; i < this.rules.length; i++) {
	    if (this.rules[i].isInCategory(title))
		crules.push(this.rules[i].getRuleID());
	}
	return crules;
    }
}

// basic.js ends here
