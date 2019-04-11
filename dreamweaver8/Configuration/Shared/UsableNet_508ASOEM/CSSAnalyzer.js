/*
 * 505/W3C Accessibility Suite OEM V2 for Macromedia Dreamweaver
 * (C) Copyright 2005 UsableNet Inc. All rights reserved.
 */
/* $Id: CSSAnalyzer.js,v 1.5 2005/03/31 15:18:20 malex Exp $ */

// ============================================================================
// The CSSAnalyzer class
// ============================================================================

// Constructor
function CSSAnalyzer(fileAttr, session)
{
    this._doc = fileAttr;   
    this._session = session;
    this._initialized = false;
    this._blocks = null;
}

// costruct all the internal data structures
CSSAnalyzer.prototype._init = CSSAnalyzer_init;
function CSSAnalyzer_init()
{
    this._initialized = true;
    this._blocks = new Array();
    var ddom = this._doc.DOM;	
    var styles = ddom.getElementsByTagName('style');
    for (var j=0; j<styles.length; j++) {
	if (stripString(styles[j].innerHTML)) {
	    var block = new CSSBlock(this._session, styles[j], this._doc.URL);
	    this._blocks.push(block);
	}
    }
    var links = ddom.getElementsByTagName('link');
    for (var j=0; j<links.length; j++) {
	link = links[j];
	var rel = link.getAttribute("REL");
	if (! isDefinedAttr(rel) || (rel.toLowerCase().indexOf('stylesheet') == -1))
	    continue;
	var uri = link.getAttribute('HREF');
	var block = null;
	// detect uri
	if (isDefinedAttr(uri)) {
	    uri = makeAbsoluteURL(uri, this._doc.URL);
	    uri = removeURLFragments(uri);
	} else
	    uri = "";
	// check the cache
	block = this._session.cssCache.getBlock(uri);
	if (! block) {
	    block = new CSSBlock(this._session, link, this._doc.URL);
	    this._session.cssCache.insertBlock(uri, block);
	} else
	  block.setElt(link);
	this._blocks.push(block);
    }
    // var elts = ddom.getElementsByTagName('*');
    var elts = getDescendants(ddom.documentElement, '*');
    for (var j=0; j<elts.length; j++) {
	style = elts[j].getAttribute('STYLE');
	if (isDefinedAttr(style) && stripString(style)) {
	    var block = new CSSBlock(this._session, elts[j], this._doc.URL);
	    this._blocks.push(block);
	}
    }
}

// take all properties and filter them by tag name of selector and a
// list of property names.
// If tagName is '*' take all selectors; if propList is empty take all properties
// Result is a vector of (property, value, element) where element is the element containing style rules
CSSAnalyzer.prototype.filterProperties = CSSAnalyzer_filterProperties;
function CSSAnalyzer_filterProperties(tagName, propList)
{
    var tag = tagName.toUpperCase();
    var expr = null;
    if (tagName != '*')
        expr = new RegExp('^(\\*|' + tagName + ')((:|\\.).*)?', 'i');
    if (!this._initialized)
	this._init();
    var res = new Array();
    for (var i=0; i<this._blocks.length; i++) {
	var block = this._blocks[i];
	var rules = block.getRules();
	for (var j=0; j<rules.length; j++) {
	    var selectors = rules[j].getSelectors();
	    var found = false;
	    for (var k=0; k<selectors.length; k++) {
		if ((tagName == '*') || expr.test(selectors[k])) 
		    found = true;
	    }
	    if (!found)
		continue;
	    var props = rules[j].getProperties();
	    for (var k=0; k<props.length; k+=2) {
		var p = props[k].toLowerCase();
		var prop_found = (propList.length == 0);
		for (var l=0; l<propList.length; l++) {
		    if (propList[l].toLowerCase() == p) {
			prop_found = true;
			break;
		    }
		}
		if (prop_found) {
		    var pv = new Array();
		    pv[0] = p;
		    pv[1] = props[k+1];
		    pv[2] = block.getElt();
		    res.push(pv);
		}
	    }
	}
    }
    return res;
}

// ============================================================================
// The CSSBlock class
// ============================================================================

// Constructor
function CSSBlock(session, elt, cssBaseUrl, url)
{
    this._cssBaseUrl = cssBaseUrl;
    this._session = session;

    this._rawHTML = "";
    this._elt = elt;
    this._rules = new Array();
    if (url) { // special case: import @ rule
	this._loadStyle(url);
    } else if (elt.tagName == "STYLE") {
	this._rawHTML = elt.innerHTML;
	this._parse();
    } else if (elt.tagName == "LINK") {
	var uri = elt.getAttribute('HREF');
	if (! isDefinedAttr(uri))
	    uri = "";
	this._loadStyle(uri);
    } else {
	this._rawHTML = elt.getAttribute('STYLE');
	var rule = new CSSRule(elt.tagName, this._rawHTML);
	this._rules.push(rule);
    }	
}

CSSBlock.prototype.getRules = CSSBlock_getRules;
function CSSBlock_getRules()
{
    return this._rules;
}

CSSBlock.prototype.setElt = CSSBlock_setElt;
function CSSBlock_setElt(elt)
{
    this._elt = elt;
}

CSSBlock.prototype.getElt = CSSBlock_getElt;
function CSSBlock_getElt()
{
    return this._elt;
}

CSSBlock.prototype._loadStyle = CSSBlock_loadStyle;
function CSSBlock_loadStyle(l_url)
{ 
    var res = "";
    if (l_url) {
	var url = makeAbsoluteURL(l_url, this._cssBaseUrl);
	url = removeURLFragments(url);
	this._cssBaseUrl = url;
	if ((getProtocol(url) == 'file') && DWfile.exists(url))
	    res = DWfile.read(url);
    }
    this._rawHTML = res;
    this._parse();
}

CSSBlock.prototype._parse = CSSBlock_parse;
function CSSBlock_parse()
{
    var text = this._rawHTML;
    if ((text.indexOf("<") != -1) || (text.indexOf("/") != -1))
	text = text.replace(/(\/\*.*?\*\/)|(<!--)|(-->)/gi, "");
    // first handle import @ rules
    if (text.indexOf("@") != -1) {
	var r_imports = new RegExp('@import\\s*(url\\()?\\s*(\'|")?\\s*(([^;\\)\'"\\\\]|\\\\\'|\\\\")+)\\s*(\'|")?\\s*\\)?\\s*;', 'gi');
	var imports = r_imports.exec(text);
	while (imports) {
	    // check the cache
	    var uri = makeAbsoluteURL(imports[3], this._cssBaseUrl);
	    uri = removeURLFragments(uri);
	    var block = this._session.cssCache.getBlock(uri);
	    if (! block) {
		block = new CSSBlock(this._session, this._elt, this._cssBaseUrl, uri);
		this._session.cssCache.insertBlock(uri, block);
	    }
	    var rules = block.getRules();
	    for (var i=0; i<rules.length; i++)
		this._rules.push(rules[i]);
	    imports = r_imports.exec(text);
	}
    }
    // now rulesets
    var r_rules = new RegExp('([^\\{\\};]+)\\{([^\\{\\}]+)\\}', 'gi'); 
    var css_rule = r_rules.exec(text);
    while (css_rule) {
	var raw_selectors = css_rule[1];
	var raw_properties = css_rule[2];
	if (stripString(raw_selectors) && (raw_selectors.indexOf('@') == -1)) {
	    var rule = new CSSRule(raw_selectors, raw_properties);
	    this._rules.push(rule);
	}
	css_rule = r_rules.exec(text);
    }
}

// ============================================================================
// The CSSRule class
// ============================================================================

// Constructor
function CSSRule(raw_sel, raw_prop)
{
    this._selectors = new Array();
    var list = raw_sel.split(',');
    for (var i=0; i<list.length; i++) {
	// take only element (not its parent, ancestor or sibling)
	sel = stripString(list[i]);
	var last_sel = sel.split(/(\s|>|\+)+/);
	if (last_sel.length > 0)
	    this._selectors.push(last_sel[last_sel.length-1]);
    }
    this._properties = new Array();
    var prop_list = raw_prop.split(';');
    for (var j=0; j<prop_list.length; j++) {
	var res = prop_list[j].split(':');
	if (res.length == 2) {
	    this._properties.push(stripString(res[0]));
	    this._properties.push(res[1]);
	}   
    }
}

CSSRule.prototype.getSelectors = CSSRule_getSelectors;
function CSSRule_getSelectors()
{
    return this._selectors;
}

CSSRule.prototype.getProperties = CSSRule_getProperties;
function CSSRule_getProperties()
{
    return this._properties;
}

// ============================================================================
// The CSSCache class
// ============================================================================

// Constructor
function CSSCache()
{
    this._blocks = new Object(); // hash table url -> CSSBlock
    this._dates  = new Object(); // hash table url -> modification date 
}

// insert a CSSBlock inside the cache
CSSCache.prototype.insertBlock = CSSCache_insertBlock;
function CSSCache_insertBlock(url, block)
{
    if (DWfile.exists(url)) {
        this._blocks[url] = block;
        this._dates[url] = DWfile.getModificationDate(url);
    }
}

// return the cached CSSBlock if its file is up to date, null otherwise
CSSCache.prototype.getBlock = CSSCache_getBlock;
function CSSCache_getBlock(url)
{
    var block = this._blocks[url];
    if (block) {
	if (DWfile.getModificationDate(url) != this._dates[url])
	    block = null;
    }
    return block;
}

// CSSAnalyzer.js ends here
