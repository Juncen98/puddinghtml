/*
 * 505/W3C Accessibility Suite OEM V2 for Macromedia Dreamweaver
 * (C) Copyright 2001-2005 UsableNet Inc. All rights reserved.
 */
/* $Id: xmlparse.js,v 1.8 2005/03/17 15:56:30 malex Exp $ */

/* 
   Contains classes for XML parsing.
*/
       
// ----------------------------------------------------------------------------
// CategoryInfo
// ----------------------------------------------------------------------------

function CategoryInfo()
{
    this.title = '';
    this.description = '';
}

// ----------------------------------------------------------------------------
// RuleInfo
// ----------------------------------------------------------------------------

function RuleInfo()
{
    this.title = '';
    this.id = '';
    this.severity = '';
    this.description = '';
    this.categories = new Array();
    this.pbmDescription = '';
    this.pbmExplanation = '';
    this.pbmLearnMore = '';
    this.pbmCorrection = '';
    this.pbmMessages = new Object(); /* a hash table of messages */
    this.isManual = false;
    this.isEnabled = false;
}

// ----------------------------------------------------------------------------
// XMLRulesParse
// ----------------------------------------------------------------------------

function XMLRulesParser(xmlurl)
{
    this.theDom = dw.getDocumentDOM(xmlurl);
    
    // get the RuleCategory list
    this.getCategoryInfo = function()
    {
	var tree = this.theDom.getElementsByTagName('un:category');
	var rcats = new Array();
	for (var i = 0; i < tree.length; i++)
	{
	    var mycat = new CategoryInfo();
	    var cnodes = tree[i].childNodes;
	    for (var j = 0; j < cnodes.length; j++)
	    {
		var myn = cnodes[j];
		if (myn.nodeType != Node.ELEMENT_NODE)
		    continue;
		if (myn.tagName == 'UN:CATEGORYTITLE')
		    mycat.title = stripString(myn.innerHTML);
		else if (myn.tagName == 'UN:CATEGORYDESCRIPTION')
		    mycat.description = stripString(myn.innerHTML);
		else
		    alert('unexpected XML Tag "' + myn.tagName + '"');
	    }
	    rcats.push(mycat);
	}
	return rcats;
    }

    // get the Rule Info 
    this.getRuleInfo = function()
    {
	var tree = this.theDom.getElementsByTagName('un:rule');
	var rules = new Array();
	for (var i = 0; i < tree.length; i++)
	{
	    var myrule = new RuleInfo();

	    // Loading rule attributes
	    var rulenode = tree[i];
	    if (rulenode.getAttribute("enabled") == "true")
		myrule.isEnabled = true;

	    // Loading rule elements
	    var cnodes = rulenode.childNodes;
	    var dummy = '';
	    for (var j = 0; j < cnodes.length; j++)
	    {
		var myn = cnodes[j];
		if (myn.nodeType != Node.ELEMENT_NODE)
		    continue;
		if (myn.tagName == 'UN:RULETITLE')
		    myrule.title = stripString(myn.innerHTML);
		else if (myn.tagName == 'UN:RULEID')
		    myrule.id = stripString(myn.innerHTML);
		else if (myn.tagName == 'UN:SEVERITY')
		  {
		    var sev = stripString(myn.innerHTML);
		    var sev2 = parseInt(sev);
		    if (isNaN(sev2)){
		      notifyError('severity is not a number: '+
				  myn.outerHTML);
		      sev2 = 4;
		    }
		    if (sev2 < 0 || sev2 > 4){
		      notifyError('severity has to be in {0,4}: '+
				  myn.outerHTML);
		      sev2 = 4;
		    }
		    myrule.severity = sev2;
		  }
		else if (myn.tagName == 'UN:RULEDESCRIPTION')
		    myrule.description = stripString(myn.innerHTML);
		else if (myn.tagName == 'UN:RULECATEGORY')
		{
		    var thiscat = stripString(myn.innerHTML);
		    myrule.categories.push(thiscat);
		}
		else if (myn.tagName == 'UN:PBMDESCRIPTION')
		    myrule.pbmDescription = stripString(myn.innerHTML);
		else if (myn.tagName == 'UN:PBMEXPLANATION')
		    myrule.pbmExplanation = stripString(myn.innerHTML);
		else if (myn.tagName == 'UN:PBMLEARNMORE')
		    myrule.pbmLearnMore = stripString(myn.innerHTML);
		else if (myn.tagName == 'UN:GUIDELINE') {
		    var guidabbr  = myn.getAttribute('abbr');
		    if (! guidabbr)
		      alert('undefined "abbr" attribute for '+ myn.outerHTML);
		    myrule.ruleGuideline = stripString(guidabbr);
		}
		else if (myn.tagName == 'UN:PBMCORRECTION')
		    myrule.pbmCorrection = stripString(myn.innerHTML);
		else if (myn.tagName == 'UN:PBMMESSAGE')
		  {
		    var msgText = stripString(myn.innerHTML);
		    var msgKey  = myn.getAttribute('name');
		    if (!msgKey)
		      alert('undefined "name" attribute for '+ myn.outerHTML);
		    if (!msgText)
		      alert('undefined message for '+myn.outerHTML);
		    if (myrule.pbmMessages[msgKey])
		      alert('redefining message for '+ msgKey+
			    ' with '+myn.outerHTML);
		    myrule.pbmMessages[msgKey] = msgText;
		  }
		else
		    alert('unexpected XML Tag "' + myn.tagName + '"');
	    }
	    rules.push(myrule);
	}
	return rules;
    }


}

// xmlparse.js ends here
