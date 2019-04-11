// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved

var helpDoc = MM.HELP_objHyperlink;

//---------------   GLOBAL CONSTANTS   ---------------

var DEFAULT_TARGETS = new Array("","_blank","_parent","_self","_top");
var SCHEMES = new Array("http://","https://", "file://", "ftp://", "gopher://", "mailto://", "news://", "nntp://", "rlogin://", "telnet://", "tn3270://", "wais://");


//---------------   GLOBAL VARIABLES   ---------------

var LIST_LINKS;
var LIST_TARGETS;
var TEXT_TEXT;
var TEXT_TITLE;
var TEXT_AKEY;
var TEXT_TABIX;
var DOC_TARGETS = new Array(); // Targets gathered from document. 

//---------------     API FUNCTIONS    ---------------

function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	return false;
}

function getNamedAnchors(){
	var dom = dw.getDocumentDOM();
	var allAnchors = dom.getElementsByTagName("A");
	var anchorName;
	for (var i=0; i < allAnchors.length; i++){
		if (allAnchors[i]){
			anchorName = allAnchors[i].getAttribute("NAME");
			if (anchorName){
				LIST_LINKS.append("#" + anchorName,"#" + anchorName);
			}
		}else{
			break;
		}
	}
}

function getTargets(){
	var dom = dw.getDocumentDOM();
	// If document is within frameset, add frame names
	// to target list
	var frameNames = dom.getFrameNames();
	for (var i=0; i < frameNames.length; i++){
	  LIST_TARGETS.append(frameNames[i],frameNames[i]);
	}
      
	// Check document for additional targets
  var links = dom.getElementsByTagName('A');
  for (var q=0; q < links.length; q++){
  	if (links[q]){
			if (links[q].getAttribute("target")){
    		add = true;
      	for (var y=0; y < DOC_TARGETS.length; y++){
      		if (DOC_TARGETS[y] == links[q].getAttribute("target")){
        		add = false;
          	break;
        	}
      	}
      	if (add){
        	DOC_TARGETS.push(links[q].getAttribute("target"));
      	}
			}
		}else{
			break;
		}
	}
          
  var allTargets = LIST_TARGETS.getValue('all');
  for (var p=0; p < DOC_TARGETS.length; p++){
    var addTarget = true;
    for (var x=0; x < allTargets.length; x++){
      if (allTargets[x] == DOC_TARGETS[p]){
        addTarget = false;
        break;
      }
    }
    if (addTarget){
      LIST_TARGETS.append(DOC_TARGETS[p],DOC_TARGETS[p]);
    }
  }
	// set selectedIndex to edit field
	LIST_TARGETS.setIndex(-1);
}

function objectTag(){
	var dom = dw.getDocumentDOM();
  var linkStr = '<a href=';
  if (LIST_LINKS && LIST_LINKS.get()  != ""){
	  linkStr += '"' + LIST_LINKS.get() + '"';
  }else{
    linkStr += '"#"';
  }
	if (TEXT_TABIX && TEXT_TABIX.value != ""){
		linkStr += ' tabindex="' + TEXT_TABIX.value + '"';
	}
	if (TEXT_TITLE && TEXT_TITLE.value != ""){
		linkStr += ' title="' + TEXT_TITLE.value + '"';
	}
	if (TEXT_AKEY && TEXT_AKEY.value != ""){
		linkStr += ' accesskey="' + TEXT_AKEY.value + '"';
	}
	if (LIST_TARGETS && LIST_TARGETS.get() != ""){
		linkStr += ' target="' + LIST_TARGETS.get() + '"';
	}
  if (TEXT_TEXT && TEXT_TEXT.value != ""){
  	linkStr += '>' + TEXT_TEXT.value + '</a>';
  }else if (LIST_LINKS && LIST_LINKS.get()  != ""){
    linkStr += '>' + LIST_LINKS.get() + '</a>';
  }else{
    linkStr += '>#</a>';
  }
	  
	if (dw.getFocus() == 'html' || dw.getFocus() == 'textView'){
		var range = dom.source.getSelection();
		dom.source.replaceRange(range[0],range[1],linkStr);
	}else if ((dom.getSelection()[0] != dom.getSelection()[1]) && isCurSelectionTextOnly(dom)){
    dom.insertHTML(linkStr,true);  
	}else if ((dom.getSelection()[0] != dom.getSelection()[1]) && isCurTagXSLValueOf(dom)){
		dom.insertHTML(linkStr,true);  
  }else{
		dom.insertHTML(linkStr,false);
	}
	
	return;
}

//---------------    LOCAL FUNCTIONS   ---------------
function initUI() {
	var dom = dw.getDocumentDOM();
	LIST_LINKS = new ListControl('linkPath');
	getNamedAnchors();
  LIST_LINKS.set("",-1);
	
	LIST_TARGETS = new ListControl('linkTarget');
	// Initialize target list
	LIST_TARGETS.setAll(DEFAULT_TARGETS,DEFAULT_TARGETS);
	// Add targets found in current document and framset
	getTargets();
  LIST_TARGETS.set("",-1);

	
	TEXT_TEXT = document.theForm.linkText;
	TEXT_TITLE = document.theForm.linkTitle;
	TEXT_AKEY = document.theForm.accessKey;
	TEXT_TABIX = document.theForm.tabIndex;
	
	
	// If we're in code view, automatically populate the
	// Text field with the selected text, and the link field
	// with the selected text if it appears to be a link.
	if (dw.getFocus() == 'html' || dw.getFocus() == 'textView'){
		// populate Text field with selection even if it includes
		// tags
		var theSel = dom.source.getSelection();
		var theText = dom.source.getText(theSel[0],theSel[1]);
		TEXT_TEXT.value = theText;
		
		// populate Link field
		LIST_LINKS.set(getLinkText(theText),-1);
		LIST_LINKS.setValue(getLinkText(theText),-1);
	}
  else{
    if (isCurSelectionTextOnly(dom)) {
      var curSel = dom.getSelection();
      var selText = dom.documentElement.outerHTML.slice(curSel[0],curSel[1]);
      if (curSel[0] != curSel[1]){
        // replace carriage returns (and the space on either side of any carriage returns, 
        // if one exists) with a single space.
        selText = selText.replace(/\s*[\n\r]+\s*/g, ' ');
        TEXT_TEXT.value = dwscripts.entityNameDecode(selText);
  		  LIST_LINKS.set(getLinkText(selText),-1);
	  	  LIST_LINKS.setValue(getLinkText(selText),-1);
      }
    }
		//check if the current tag is xsl:value-of
		if (isCurTagXSLValueOf(dom))
		{
	    var curNode = dom.getSelectedNode();
			selText = curNode.outerHTML; 			
			TEXT_TEXT.value = selText;
  		LIST_LINKS.set(getLinkText(selText),-1);
	  	LIST_LINKS.setValue(getLinkText(selText),-1);
		}
  }
	
	TEXT_TEXT.focus(); // give focus to list
}

function getLinkText(theText){
	var linkText = "";
	for (var i=0; i < SCHEMES.length; i++){
		if (theText.indexOf(SCHEMES[i]) == 0){
			linkText = theText;
			break;
		}
	}
	if (linkText == ""){
		if (theText.toLowerCase().indexOf('www.') == 0){
			linkText = "http://" + theText;
		}
	}
	return linkText;
}

// Description: Determines if the current selection is contained within a text node.
// Parameters:  DOM - checked for valid, returns false if no DOM.
function isCurSelectionTextOnly(curDOM) {
  var rtnBool = false;
  if (curDOM != null) {
    var curNode = curDOM.getSelectedNode();
    if (curNode.nodeType == Node.TEXT_NODE) { // Return true if we are a text node.
      rtnBool = true;
    } else { // Return true if the selection contains a single text node.
      if (curNode.hasChildNodes() && curNode.childNodes[0].nodeType == Node.TEXT_NODE) {
        var curSel = curDOM.getSelection();
        var nodeOffset = dw.nodeToOffsets(curNode.childNodes[0]);
        if  ((nodeOffset[0] <= curSel[0]) && (curSel[1] <= nodeOffset[1])) {
          rtnBool = true;
  } } } }
  return rtnBool;
}

//is the cur tag xsl:value-of
function isCurTagXSLValueOf(curDOM)
{
  var rtnBool = false;
  if (curDOM != null) 
	{
    var curNode = curDOM.getSelectedNode();
		if ((curNode != null) && (curNode.nodeType == Node.ELEMENT_NODE))
		{
				var curTagName = curNode.tagName;
				curTagName = curTagName.toLowerCase();
				if (curTagName == "xsl:value-of")
				{
					rtnBool = true;
				}
		}
	}
	return rtnBool;
}

