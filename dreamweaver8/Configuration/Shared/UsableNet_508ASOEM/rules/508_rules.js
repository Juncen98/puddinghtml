/*
 * 505/W3C Accessibility Suite OEM V2 for Macromedia Dreamweaver
 * (C) Copyright 2001-2005 UsableNet Inc. All rights reserved.
 */
/* $Id: 508_rules.js,v 1.6 2005/03/17 14:47:59 malex Exp $ */

/* Contains definition of rules for the 508 standard. */


// Array with all 508 rules
All508Rules = Array();
function registerRule(rule)
{
    All508Rules.push(rule);
}

/************************************************************
 *
 *       rule nspIMGwValidALT
 *
 ************************************************************/

function nspIMGwValidALT() {
  this.ruleID = 'nspIMGwValidALT';
}

// inherit from Rule
nspIMGwValidALT.prototype = new Rule();

nspIMGwValidALT.prototype.findPbms = function (fileAttr, session) {
  /* return an array of UsabPbm, (the empty array if none has been found)
     this is a function with no side effects
  */
  var wrong = new Array();
  var doc = fileAttr.DOM;

  var collection = doc.images;
  for (var i=0; i < collection.length; i++) {
    var img = collection[i];
    if (isSpacer(fileAttr, img))
      continue; // there's another rule for this case

    var res = hasValidALT2(img,'nonspacer');
    if (res == null){
      notifyError('in nspIMGwValidALT.findPbms encountered unexpected error');
      return null;
    }
    if (res == true)    /* it's OK */
      continue;

    var msg = this.getRuleMessage(res);
    var offsets = doc.nodeToSourceViewOffsets(img);

    if (isEditable(doc, img)) {
      if (res == "empty" || res == "blank")
        wrong.push(makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS, msg));
      else
        wrong.push(makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg));
    }
  }
  return wrong;
}

registerRule(new nspIMGwValidALT());  /* create the rule */




/************************************************************
 *
 *       rule spIMGwValidALT
 *
 ************************************************************/

function spIMGwValidALT() {
  this.ruleID = 'spIMGwValidALT';
}
spIMGwValidALT.prototype = new Rule();

spIMGwValidALT.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM;

  var collection = doc.images;
  for (var i=0; i < collection.length; i++) {
    var img = collection[i];
    if (!isSpacer(fileAttr, img))
      continue;

    if(isHiddenLink(fileAttr, img))
      continue;

    var res = hasValidALT2(img,'spacer');
    if (res == null) {
      notifyError('in spIMGwValidALT.findPbms encountered unexpected error');
      return null;
    }
    if (res == true)    /* it's OK */
      continue;

    var msg = this.getRuleMessage(res);
    var offsets = doc.nodeToSourceViewOffsets(img);
    if (isEditable(doc, img)) {
      if (res == "nonempty")
        wrong.push(makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS, msg));
      else
        wrong.push(makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg));
    }
  }
  return wrong;
}

registerRule(new spIMGwValidALT());


/************************************************************
 *
 *       rule nspIMGwEquivalentALT
 *
 ************************************************************/

function nspIMGwEquivalentALT() {
  this.ruleID = 'nspIMGwEquivalentALT';
}
nspIMGwEquivalentALT.prototype = new Rule();

nspIMGwEquivalentALT.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM;

  var collection = doc.images;
  for (var i=0; i < collection.length; i++) {
    var img = collection[i];
    if (isSpacer(fileAttr, img))
      continue;     /* skip these */
    var res = hasValidALT2(img,'nonspacer');
    if (res == null) {
      notifyError('in nspIMGwEquivalentALT.findPbms encountered unexpected error');
      return null;
    }
    if (res != true)
  continue;
    var alt = img.getAttribute("alt");
    alt = alt.replace(/\s+/g, "");
    var selected = img;
    if(alt == "") {
  var ancestor = hasAncestor('A', img);
  var childs = ancestor.childNodes;
  var count = 0;
  for(var j=0; j<childs.length; j++) {
      if(childs[j].nodeType == Node.TEXT_NODE) {
    count++;
    selected = childs[j];
      }
  }
  if(count != 1)
      selected = ancestor;
    }
    var offsets = doc.nodeToSourceViewOffsets(selected);
    thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
        MANUAL_STATUS);
    /* check if test outcome is stored */
    session.checkStoredTests(thisPbm);
    if (isEditable(doc, selected))
  wrong.push(thisPbm);
  }
  return wrong;
}

registerRule(new nspIMGwEquivalentALT());


/************************************************************
 *
 *       rule nspIMGwValidLongdesc
 *
 ************************************************************/

function nspIMGwValidLongdesc() {
  this.ruleID = 'nspIMGwValidLongdesc';
}
nspIMGwValidLongdesc.prototype = new Rule();

nspIMGwValidLongdesc.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM;

  var collection = doc.images;
  for (var i=0; i < collection.length; i++) {
    var img = collection[i];
    var longdescURL = img.getAttribute('longdesc');
    if (!isDefinedAttr(longdescURL))
      continue;     /* skip img w/o longdesc */
    if (isSpacer(fileAttr, img))
      continue;     /* skip spacers */
    var res = isValidURL(longdescURL,fileAttr.URL, 'html');
    if (res == true)
      continue;
    /* we have a problem ; res is 'nofile'|'nohtml'|'empty'|'noresponse' */
    /* 'badresponse'|'badproto'*/
    var msg;
    if (res)
      msg = this.getRuleMessage(res);
    var offsets = doc.nodeToSourceViewOffsets(img);
    thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
        FAILED_STATUS, msg);
    if (isEditable(doc, img))
  wrong.push(thisPbm);
  }
  return wrong;
}
registerRule(new nspIMGwValidLongdesc());



/************************************************************
 *
 *       rule spIMGwNoLongdesc
 *
 ************************************************************/

function spIMGwNoLongdesc() {
  this.ruleID = 'spIMGwNoLongdesc';
}
spIMGwNoLongdesc.prototype = new Rule();

spIMGwNoLongdesc.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM;

  var collection = doc.images;
  for (var i=0; i < collection.length; i++) {
    var img = collection[i];
    var longdescURL = img.getAttribute('longdesc');
    if (!isSpacer(fileAttr, img))
      continue;     /* skip non spacers */
    if (longdescURL == null)
      continue;     /* it's OK: spacers should not have longdesc */
    var msg = this.getRuleMessage('msg');
    var offsets = doc.nodeToSourceViewOffsets(img);
    thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
        FAILED_STATUS, msg);
    if (isEditable(doc, img))
  wrong.push(thisPbm);
  }
  return wrong;
}
registerRule(new spIMGwNoLongdesc());


/************************************************************
 *
 *       rule nspIMGneedsLongdesc
 *
 ************************************************************/

function nspIMGneedsLongdesc() {
  this.ruleID = 'nspIMGneedsLongdesc'; }

nspIMGneedsLongdesc.prototype = new Rule();

nspIMGneedsLongdesc.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM;

  var collection = doc.images;
  for (var i=0; i < collection.length; i++) {
    var img = collection[i];
    var longdescURL = img.getAttribute('longdesc');
    if (isSpacer(fileAttr, img))
      continue;     /* skip spacers */
    if (isDefinedAttr(longdescURL))
      continue;     /* skip defined longdescs */
    var msg = this.getRuleMessage('msg');
    var offsets = doc.nodeToSourceViewOffsets(img);
    thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
        MANUAL_STATUS, msg);
    if (isEditable(doc, img))
  wrong.push(thisPbm);
  }
  return wrong;
}
registerRule(new nspIMGneedsLongdesc());



/************************************************************
 *
 *       rule INPUTwValidALT
 *
 ************************************************************/

function INPUTwValidALT() {
  this.ruleID = 'INPUTwValidALT'; }

INPUTwValidALT.prototype = new Rule();

INPUTwValidALT.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM;

  var collection = doc.getElementsByTagName('input');
  for (var i=0; i < collection.length; i++) {
    var inp = collection[i];
    if (!hasImageType(inp))
  continue;   /* INPUT/type is not image: skip it */
    var res = hasValidALT2(inp,'nonspacer');
    if (res == null){
      notifyError('in INPUTwValidALT.findPbms encountered unexpected error');
      return null;
    }
    if (res == true)    /* it's OK */
      continue;
    {       /* we found a problem */
      var msg = this.getRuleMessage(res);
      var offsets = doc.nodeToSourceViewOffsets(inp);
      thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
          FAILED_STATUS, msg);
      if (isEditable(doc, inp))
    wrong.push(thisPbm);
    }
  }
  return wrong;
}
registerRule(new INPUTwValidALT());



/************************************************************
 *
 *       rule INPUTwEquivalentALT
 *
 ************************************************************/

function INPUTwEquivalentALT() {
  this.ruleID = 'INPUTwEquivalentALT'; }

INPUTwEquivalentALT.prototype = new Rule();

INPUTwEquivalentALT.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM;

  var collection = doc.getElementsByTagName('input');
  for (var i=0; i < collection.length; i++) {
    var inp = collection[i];
    if (!hasImageType(inp))
  continue;   /* INPUT/type is not image: skip it */
    var res = hasValidALT2(inp,'nonspacer');
    if (res == null) {
      notifyError('in INPUTwEquivalentALT.findPbms encountered unexpected error');
      return null;
    }
    if (res != true)
  continue;
    var offsets = doc.nodeToSourceViewOffsets(inp);
    thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
        MANUAL_STATUS);
    session.checkStoredTests(thisPbm);
    if (isEditable(doc, inp))
  wrong.push(thisPbm);
  }
  return wrong;
}
registerRule(new INPUTwEquivalentALT());




/************************************************************
 *
 *       rule SCRIPTwValidNOSCRIPT
 *
 ************************************************************/

function SCRIPTwValidNOSCRIPT() {
  this.ruleID = 'SCRIPTwValidNOSCRIPT';
}

SCRIPTwValidNOSCRIPT.prototype = new Rule();


SCRIPTwValidNOSCRIPT.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM;

  var scripts = doc.getElementsByTagName('script');
  for (var i=0; i < scripts.length; i++) {
    var script = scripts[i];
    if (hasAncestor('HEAD', script)) /* SCRIPT is within HEAD; there should */
             /* not be any NOSCRIPT */
      continue;
    var noscript = findFollowingElement(script, 'noscript');
    var msg = '';
    var offsets = null;
    var found = false;
    if (noscript == null){
      msg = this.getRuleMessage('missing');
      offsets = doc.nodeToSourceViewOffsets(script);
      if (isEditable(doc, script))
    found = true;
    }
    else {
      if (!noscript.hasChildNodes()){
  msg = this.getRuleMessage('empty');
  offsets = doc.nodeToSourceViewOffsets(noscript);
  if (isEditable(doc, noscript))
      found = true;
      }
    }
    if (found){
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
        FAILED_STATUS, msg);
      wrong.push(thisPbm);
    }
  }
  return wrong;
}
registerRule(new SCRIPTwValidNOSCRIPT());



/************************************************************
 *
 *       rule SCRIPTwEquivalentNOSCRIPT
 *
 ************************************************************/

function SCRIPTwEquivalentNOSCRIPT() {
  this.ruleID = 'SCRIPTwEquivalentNOSCRIPT';
}

SCRIPTwEquivalentNOSCRIPT.prototype = new Rule();


SCRIPTwEquivalentNOSCRIPT.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM;

  var scripts = doc.getElementsByTagName('script');
  for (var i=0; i < scripts.length; i++) {
    var script = scripts[i];
    var noscript = findFollowingElement(script, 'noscript');
    if (noscript == null)
      continue;     /* skip invalid noscripts */
    if (!noscript.hasChildNodes())
      continue;     /* skip invalid noscripts */
    var msg = this.getRuleMessage('msg');
    var offsets = doc.nodeToSourceViewOffsets(noscript);
    var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
            MANUAL_STATUS, msg);
    if (isEditable(doc, noscript))
  wrong.push(thisPbm);
  }
  return wrong;
}
registerRule(new SCRIPTwEquivalentNOSCRIPT());





/************************************************************
 *
 *       rule AREAwValidALT
 *
 ************************************************************/

function AREAwValidALT() {
  this.ruleID = 'AREAwValidALT';
}

AREAwValidALT.prototype = new Rule();

AREAwValidALT.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM;
  var collection = doc.getElementsByTagName('area');
  for (var i=0; i < collection.length; i++) {
    var area = collection[i];
    var href = area.getAttribute("href");
    if (!href)
      continue;     /* skip areas with no links */
    var res = hasValidALT2(area,'nonspacer');
    if (res == true)
      continue;
    var msg = this.getRuleMessage(res);
    var offsets = doc.nodeToSourceViewOffsets(area);
    var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
            FAILED_STATUS, msg);
    if (isEditable(doc, area))
  wrong.push(thisPbm);
  }
  return wrong;
}
registerRule(new AREAwValidALT());



/************************************************************
 *
 *       rule AREAwEquivalentALT
 *
 ************************************************************/

function AREAwEquivalentALT() {
  this.ruleID = 'AREAwEquivalentALT';
}

AREAwEquivalentALT.prototype = new Rule();

AREAwEquivalentALT.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM;
  var collection = doc.getElementsByTagName('area');
  for (var i=0; i < collection.length; i++) {
    var area = collection[i];
    var href = area.getAttribute("href");

    if (!href)
  continue; /* skip areas with no links */
    var res = hasValidALT2(area,'nonspacer');
    if (res != true)
      continue;
    var offsets = doc.nodeToSourceViewOffsets(area);
    var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
            MANUAL_STATUS);
    session.checkStoredTests(thisPbm);
    if (isEditable(doc, area))
  wrong.push(thisPbm);
  }
  return wrong;
}
registerRule(new AREAwEquivalentALT());




/************************************************************
 *
 *       rule DontRelyOnColorAlone
 *
 ************************************************************/

function DontRelyOnColorAlone() {
  this.ruleID = 'DontRelyOnColorAlone';
}

DontRelyOnColorAlone.prototype = new Rule();

DontRelyOnColorAlone.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM ;
  var elt = specifiesColor(doc,'fg');
  if (elt == null) {
    elt = specifiesColor(doc,'bg');
  }
  if (elt == null) {
    return wrong;
  }
  var offsets = doc.nodeToSourceViewOffsets(doc.documentElement);
  var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
          MANUAL_STATUS);
  wrong.push(thisPbm);
  return wrong;
}
registerRule(new DontRelyOnColorAlone());



colorBgAttributesTable = new Array (
          "BODY", "bgcolor", "",
          "BODY", "background","",
          "TABLE", "bgcolor","",
          "TD", "bgcolor","",
          "TH", "bgcolor","",
          "STYLE", "background-color","",
          "STYLE", "background-image","",
          "STYLE", "background",""
          );
colorFgAttributesTable = new Array (
          "IMG", "", "",
          "APPLET", "", "",
          "OBJECT", "", "",
          "SCRIPT", "", "",
          "INPUT", "type", "image",
          "BODY", "text","",
          "BODY", "alink","",
          "BODY", "vlink","",
          "BODY", "link","",
          "FONT", "color", "",
          "TABLE", "bordercolor","",
          "TD", "bordercolor","",
          "TH", "bordercolor","",
          "HR", "color","",
          "STYLE", "color",""
          );


function specifiesColor(doc,where)
{
  /* return the element containing a color */
  /* if the document */
  /* specifies some color in foreground (where='fg') */
  /* or background (where='bg') */
  /* DO NOT consider style attributes of arbitrary elements */
  var table;
  if (where == 'bg') {
    table = colorBgAttributesTable;
  } else {
    table = colorFgAttributesTable;
  }
  for (var i = 0; i < table.length; i = i+3) {
    var tag = table[i];
    var attr = table[i+1];
    var val = table[i+2];
    var elts = doc.getElementsByTagName(tag);
    for (var j=0; j < elts.length; j++) {

      var elt = elts[j];
      if (attr){    /* check if attribute exists */
  var attr_val = elt.getAttribute(attr);
  if (attr_val && (! val)) { /* elt specifies a b|fg color */
    return elt;
  } else if (attr_val && val && (val == attr_val)){ /* elt specifies a color */
    return elt;
  } else if (attr_val) {  /* they were different values */
    continue;   /* move to next element */
  } else      /* no attribute found */
    continue;
      } else {    /* no attribute specified in table */
  return elt;
      }
    }
  }
  return null;      /* no color tag was found */
}



/************************************************************
 *
 *       rule ColorsAreVisible
 *
 ************************************************************/

function ColorsAreVisible() {
  this.ruleID = 'ColorsAreVisible';
}

ColorsAreVisible.prototype = new Rule();

ColorsAreVisible.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM ;
  var elt = specifiesColor(doc,'fg');
  if (elt == null) {
    elt = specifiesColor(doc,'bg');
  }
  if (elt == null) {
    return wrong;
  }
  var offsets = doc.nodeToSourceViewOffsets(doc.documentElement);
  var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
          MANUAL_STATUS);
  wrong.push(thisPbm);
  return wrong;
}
registerRule(new ColorsAreVisible());







/************************************************************
 *
 *       rule StyleSheetsNotNecessary
 *
 ************************************************************/

function StyleSheetsNotNecessary() {
  this.ruleID = 'StyleSheetsNotNecessary';
}

StyleSheetsNotNecessary.prototype = new Rule();

StyleSheetsNotNecessary.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM ;
  // collect all LINK/rel="stylesheet";
  // set to null those that don't have that attribute
  var link_elts_all = doc.getElementsByTagName('LINK');
  var link_elts = new Array();
  for (var i=0; i<link_elts_all.length; i++){
    var attr = link_elts_all[i].getAttribute('rel');
    // we have to filter out those without rel='stylesheet'
    if (isDefinedAttr(attr) && (attr.toLowerCase() == "stylesheet"))
  link_elts.push(link_elts_all[i]);
  }
  // collect STYLE elements
  var style_elts = doc.getElementsByTagName('STYLE');
    // collect elements with style attribute
  var style_attr_elts = new Array();
  collectElementsWithStyleAttribute(doc.documentElement,style_attr_elts);
  // now merge lists
  var collection = style_attr_elts.concat(link_elts).concat(style_elts);
    for (var i=0; i < collection.length; i++) {
    var elt = collection[i];
    var msg = this.getRuleMessage('msg');
    var offsets = doc.nodeToSourceViewOffsets(elt);
    var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
            MANUAL_STATUS, msg);
    if (isEditable(doc, elt))
  wrong.push(thisPbm);
  }
  return wrong;
}
registerRule(new StyleSheetsNotNecessary());


function collectElementsWithStyleAttribute(node,accumulator){
  /* scan the tree, depth first, of children of node and collect */
  /* all elements that have a style attribute (including node if the case) */
  /* accumulator is the array where to collect results */
  /* modify the accumulator; don't return anything */
  if (node.nodeType != Node.ELEMENT_NODE)
    return null;
  var attr = node.getAttribute('style');
  if (isDefinedAttr(attr)) {
    accumulator.push(node); /* modify by side-effect */
  }
  var children = node.childNodes; // this returns also "undefined"!!!
  for (var i=0; i<children.length; i++){
    collectElementsWithStyleAttribute(children[i], accumulator);
  }
  return accumulator;
}



/************************************************************
 *
 *       rule RdndtLnksSSimagemap
 *
 ************************************************************/

function RdndtLnksSSimagemap() {
  this.ruleID = 'RdndtLnksSSimagemap';
}

RdndtLnksSSimagemap.prototype = new Rule();

RdndtLnksSSimagemap.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM ;
  // collect all IMG embedded in A with ismap attribute
  var all_IMG_elts = doc.getElementsByTagName('IMG');
  var A_IMG_elts = new Array();
  for (var i=0; i< all_IMG_elts.length; i++) {
    var img = all_IMG_elts[i];
    if (hasAncestor('A',img)) {
        A_IMG_elts.push(img);
    }
  }
  // collect all INPUT/type=image
  var all_INPUT_elts = doc.getElementsByTagName('INPUT');
  var INPUT_elts = new Array();
  for (var i=0; i<all_INPUT_elts.length; i++){
    var input = all_INPUT_elts[i];
    if (hasImageType(input)){
      INPUT_elts.push(input);
    }
  }
  // now merge lists
  var collection = A_IMG_elts.concat(INPUT_elts);
  for (var i=0; i < collection.length; i++) {
    var elt = collection[i];
    var ismap = elt.getAttribute('ismap');
    if (isDefinedAttr(ismap)) {
      var msg = this.getRuleMessage('msg');
      var offsets = doc.nodeToSourceViewOffsets(elt);
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
        MANUAL_STATUS, msg);
      if (isEditable(doc, elt))
    wrong.push(thisPbm);
    }
  }
  return wrong;
}
registerRule(new RdndtLnksSSimagemap());




/************************************************************
 *
 *       rule NoServerSideImageMaps
 *
 ************************************************************/

function NoServerSideImageMaps() {
  this.ruleID = 'NoServerSideImageMaps';
}

NoServerSideImageMaps.prototype = new Rule();

NoServerSideImageMaps.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM ;
  // collect all IMG embedded in A with ismap attribute
  var all_IMG_elts = doc.getElementsByTagName('IMG');
  var A_IMG_elts = new Array();
  for (var i=0; i< all_IMG_elts.length; i++) {
    var img = all_IMG_elts[i];
    if (hasAncestor('A',img)) {
  A_IMG_elts.push(img);
    }
  }
  // collect all INPUT/type=image
  var all_INPUT_elts = doc.getElementsByTagName('INPUT');
  var INPUT_elts = new Array();
  for (var i=0; i<all_INPUT_elts.length; i++){
    var input = all_INPUT_elts[i];
    if (hasImageType(input)){
      INPUT_elts.push(input);
    }
  }
  // now merge lists
  var collection = A_IMG_elts.concat(INPUT_elts);
  for (var i=0; i < collection.length; i++) {
    var elt = collection[i];
    var ismap = elt.getAttribute('ismap');
    if (isDefinedAttr(ismap)) {
      var msg = this.getRuleMessage('msg');
      var offsets = doc.nodeToSourceViewOffsets(elt);
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
        MANUAL_STATUS, msg);
      if (isEditable(doc, elt))
    wrong.push(thisPbm);
    }
  }
  return wrong;
}
registerRule(new NoServerSideImageMaps());





/************************************************************
 *
 *       rule TableWithHeaders
 *
 ************************************************************/

function TableWithHeaders() {
  this.ruleID = 'TableWithHeaders';
}

TableWithHeaders.prototype = new Rule();

TableWithHeaders.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM ;
  var tables = doc.getElementsByTagName('TABLE');
  for (var i = 0; i < tables.length; i++) {
    var table = tables[i];
    if (isNotDataTable(table))
      continue;
    var ch = hasChildWithTag(table,'TH');
    if (ch == null) {
      var msg = this.getRuleMessage('msg');
      var offsets = doc.nodeToSourceViewOffsets(table);
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
        MANUAL_STATUS, msg);
      if (isEditable(doc, table))
    wrong.push(thisPbm);
    }
  }
  return wrong;
}
registerRule(new TableWithHeaders());

function isNotDataTable(table){
  /* return true if the table purpose is to layout a page */
  /* false if it is used for data presentation */
  /* NOTE: in general this requires human judgment */
  /*       the function thus is a stub that returns by default FALSE */
  /*       meaning that any table is potentially presenting data */
  return false;
}




/************************************************************
 *
 *       rule CellsReferToHeaders
 *
 ************************************************************/

function CellsReferToHeaders() {
  this.ruleID = 'CellsReferToHeaders';
}

CellsReferToHeaders.prototype = new Rule();

CellsReferToHeaders.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM ;
  var tables = doc.getElementsByTagName('TABLE');
  for (var i = 0; i < tables.length; i++) {
    var table = tables[i];
    var THs = new Array();
    collectChildrenWithTag(table,'TH',THs);
    for (var j=0; j<THs.length; j++){
      var the_TH = THs[j];
      var scop = the_TH.getAttribute('scope');
      var id = the_TH.getAttribute('id');
      if (!(isDefinedAttr(scop))
    &&
    !(isDefinedAttr(id))) {
  var msg = this.getRuleMessage('msg');
  var offsets = doc.nodeToSourceViewOffsets(the_TH);
  var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
          MANUAL_STATUS, msg);
  if (isEditable(doc, the_TH))
      wrong.push(thisPbm);
      }
    }
  }
  return wrong;
}
registerRule(new CellsReferToHeaders());



/************************************************************
 *
 *       rule PREisNotATable
 *
 ************************************************************/

function PREisNotATable() {
  this.ruleID = 'PREisNotATable';
}

PREisNotATable.prototype = new Rule();

PREisNotATable.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM ;
  var PREs = doc.getElementsByTagName('PRE');
  for (var i = 0; i < PREs.length; i++) {
    var the_PRE = PREs[i];
    var msg = this.getRuleMessage('msg');
    var offsets = doc.nodeToSourceViewOffsets(the_PRE);
    var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
            MANUAL_STATUS, msg);
    if (isEditable(doc, the_PRE))
  wrong.push(thisPbm);
  }
  return wrong;
}
registerRule(new PREisNotATable());



/************************************************************
 *
 *       rule TABLEwithMultipleLevels
 *
 ************************************************************/

function TABLEwithMultipleLevels() {
  this.ruleID = 'TABLEwithMultipleLevels';
}

TABLEwithMultipleLevels.prototype = new Rule();

TABLEwithMultipleLevels.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM ;
  var tables = doc.getElementsByTagName('TABLE');
  for (var i = 0; i < tables.length; i++) {
    var table = tables[i];
    if (isNotDataTable(table))
      continue;
    if (!hasChildWithTag(table,'TH'))
      continue;
    if (hasChildWithTag(table, 'THEAD') ||
  hasChildWithTag(table, 'TFOOT') ||
  hasChildWithTag(table, 'TBODY'))
      continue;
    var msg = this.getRuleMessage('msg');
    var offsets = doc.nodeToSourceViewOffsets(table);
    var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
            MANUAL_STATUS, msg);
    if (isEditable(doc, table))
  wrong.push(thisPbm);
  }
  return wrong;
}
registerRule(new TABLEwithMultipleLevels());




/************************************************************
 *
 *       rule FRAMEwValidTitle
 *
 ************************************************************/

function FRAMEwValidTitle() {
  this.ruleID = 'FRAMEwValidTitle';
}

FRAMEwValidTitle.prototype = new Rule();


FRAMEwValidTitle.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM;
  var collection = doc.getElementsByTagName('frame');
  for (var i=0; i < collection.length; i++) {
    var frame = collection[i];
    var res = hasValidTitle(frame);
    if (res == true)
      continue;     /* skip it */
    var msg = this.getRuleMessage(res);
    var offsets = doc.nodeToSourceViewOffsets(frame);
    var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
            FAILED_STATUS, msg);
    if (isEditable(doc, frame))
  wrong.push(thisPbm);
  }
  return wrong;
}
registerRule(new FRAMEwValidTitle());



function hasValidTitle(frame)
     /* return true if the frametitle is valid */
     /* return 'missing' if title=null */
     /* return 'empty' if title = '' */
     /* return 'blank' if title=' ' */
{
  var title = frame.getAttribute('title');
  if (title == null) return 'missing';
  if (title == '') return 'empty';
  if (/<\.+>/.exec(title)) return 'html'; // HTML tags inside
  if (title.search(/\S+/g) == -1) /* some non space is present */
    return 'blank';
  return true;
}



/************************************************************
 *
 *       rule IFRAMEwValidTitle
 *
 ************************************************************/

function IFRAMEwValidTitle() {
  this.ruleID = 'IFRAMEwValidTitle';
}

IFRAMEwValidTitle.prototype = new Rule();


IFRAMEwValidTitle.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM;
  var collection = doc.getElementsByTagName('IFRAME');
  for (var i=0; i < collection.length; i++) {
    var frame = collection[i];
    var res = hasValidTitle(frame);
    if (res == true)
      continue;     /* skip it */
    var msg = this.getRuleMessage(res);
    var offsets = doc.nodeToSourceViewOffsets(frame);
    var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
            FAILED_STATUS, msg);
    if (isEditable(doc, frame))
  wrong.push(thisPbm);
  }
  return wrong;
}
registerRule(new IFRAMEwValidTitle());


/************************************************************
 *
 *       rule TextOnlyEquivPage
 *
 ************************************************************/

function TextOnlyEquivPage() {
  this.ruleID = 'TextOnlyEquivPage';
}

TextOnlyEquivPage.prototype = new Rule();


TextOnlyEquivPage.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM;
  var scripts = doc.getElementsByTagName('SCRIPT');
  var objects = doc.getElementsByTagName('OBJECT');
  var applets = doc.getElementsByTagName('APPLET');
  var collection = scripts.concat(objects);
  collection = collection.concat(applets);
  if (collection.length) {
    var elt = collection[0];
    var offsets = doc.nodeToSourceViewOffsets(elt);
    var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
            MANUAL_STATUS);
    session.checkStoredTests(thisPbm);
    if (isEditable(doc, elt))
  wrong.push(thisPbm);
  }
  return wrong;
}
registerRule(new TextOnlyEquivPage());

/************************************************************
 *
 *       rule AccessibleScripts
 *
 ************************************************************/

function AccessibleScripts() {
  this.ruleID = 'AccessibleScripts';
}

AccessibleScripts.prototype = new Rule();

AccessibleScripts.prototype.findPbms = function (fileAttr, session) {
  var ELT_EVENTS = {
  'BODY' :    ['ONCLICK', 'ONDBLCLICK', 'ONKEYDOWN', 'ONKEYPRESS',
        'ONKEYUP', 'ONLOAD', 'ONMOUSEDOWN', 'ONMOUSEMOVE',
        'ONMOUSEOUT', 'ONMOUSEOVER', 'ONMOUSEUP', 'ONUNLOAD'],
  'FRAMESET': ['ONLOAD', 'ONUNLOAD'],
  'FORM':     ['ONCLICK', 'ONDBLCLICK', 'ONKEYDOWN', 'ONKEYPRESS',
        'ONKEYUP', 'ONMOUSEDOWN', 'ONMOUSEMOVE', 'ONMOUSEOUT',
        'ONMOUSEOVER', 'ONMOUSEUP', 'ONRESET', 'ONSUBMIT'],
  'INPUT':    ['ONBLUR', 'ONCHANGE', 'ONCLICK', 'ONDBLCLICK', 'ONFOCUS',
        'ONKEYDOWN', 'ONKEYPRESS', 'ONKEYUP', 'ONMOUSEDOWN',
        'ONMOUSEMOVE', 'ONMOUSEOUT', 'ONMOUSEOVER', 'ONMOUSEUP', 'ONSELECT'],
  'TEXTAREA': ['ONBLUR', 'ONCHANGE', 'ONCLICK', 'ONDBLCLICK', 'ONFOCUS',
        'ONKEYDOWN', 'ONKEYPRESS', 'ONKEYUP', 'ONMOUSEDOWN',
        'ONMOUSEMOVE', 'ONMOUSEOUT', 'ONMOUSEOVER', 'ONMOUSEUP', 'ONSELECT'],
  'SELECT':   ['ONBLUR', 'ONCHANGE', 'ONCLICK', 'ONDBLCLICK', 'ONFOCUS',
        'ONKEYDOWN', 'ONKEYPRESS', 'ONKEYUP', 'ONMOUSEDOWN',
        'ONMOUSEMOVE', 'ONMOUSEOUT', 'ONMOUSEOVER', 'ONMOUSEUP'],
  'A':        ['ONBLUR', 'ONCLICK', 'ONDBLCLICK', 'ONFOCUS',
        'ONKEYDOWN', 'ONKEYPRESS', 'ONKEYUP', 'ONMOUSEDOWN',
        'ONMOUSEMOVE', 'ONMOUSEOUT', 'ONMOUSEOVER', 'ONMOUSEUP'],
  'AREA':     ['ONBLUR', 'ONCLICK', 'ONDBLCLICK', 'ONFOCUS',
        'ONKEYDOWN', 'ONKEYPRESS', 'ONKEYUP', 'ONMOUSEDOWN',
        'ONMOUSEMOVE', 'ONMOUSEOUT', 'ONMOUSEOVER', 'ONMOUSEUP'],
  'BUTTON':   ['ONBLUR', 'ONCLICK', 'ONDBLCLICK', 'ONFOCUS',
        'ONKEYDOWN', 'ONKEYPRESS', 'ONKEYUP', 'ONMOUSEDOWN',
        'ONMOUSEMOVE', 'ONMOUSEOUT', 'ONMOUSEOVER', 'ONMOUSEUP'],
  'LABEL':    ['ONBLUR', 'ONCLICK', 'ONDBLCLICK', 'ONFOCUS',
        'ONKEYDOWN', 'ONKEYPRESS', 'ONKEYUP', 'ONMOUSEDOWN',
        'ONMOUSEMOVE', 'ONMOUSEOUT', 'ONMOUSEOVER', 'ONMOUSEUP'],
    };
  var EVENTS = ['ONCLICK', 'ONDBLCLICK', 'ONKEYDOWN', 'ONKEYPRESS', 'ONKEYUP',
         'ONMOUSEDOWN', 'ONMOUSEMOVE', 'ONMOUSEOUT', 'ONMOUSEOVER', 'ONMOUSEUP'];

  var wrong = new Array();
  var doc = fileAttr.DOM;

  var tag, msg, offsets, thisPbm;

  var objects = doc.getElementsByTagName('OBJECT');
  var applets = doc.getElementsByTagName('APPLET');
  var embeds = doc.getElementsByTagName('EMBED');
  var collection = objects.concat(applets).concat(embeds);
  for (var i=0; i < collection.length; i++) {
    var elt = collection[i];
    tag = elt.tagName;
    msg = this.getRuleMessage(tag);
    offsets = doc.nodeToSourceViewOffsets(elt);
    thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
        MANUAL_STATUS, msg);
    if (isEditable(doc, elt))
  wrong.push(thisPbm);
  }

  var allBodyElements = getAllNodeElements(doc.body);
  for(var h=0; h<allBodyElements.length; h++) {
      var elNode = allBodyElements[h];
      tag = elNode.tagName;

      if((tag != 'OBJECT') && (tag != 'APPLET') && (tag != 'EMBED')) {
    var events, event, attr;
    events = ELT_EVENTS[tag];
    if(events == null) { events = EVENTS; }

    for(var k=0; k<events.length; k++) {
        event = events[k];
        attr  = elNode.getAttribute(event);
        if(attr) {
      attr = attr.replace(/\s+/g, "");
      if(attr) {
          msg = "The '" + tag + "' element has an event attribute ('" +
        event + "'): check its accessibility.";
          offsets = doc.nodeToSourceViewOffsets(elNode);
          thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
              MANUAL_STATUS, msg);
          if (isEditable(doc, elNode))
        wrong.push(thisPbm);
      }
        }
    }
      }
  }

  return wrong;
}
registerRule(new AccessibleScripts());




/************************************************************
 *
 *       rule LinkToPluginIsPresent
 *
 ************************************************************/

function LinkToPluginIsPresent() {
  this.ruleID = 'LinkToPluginIsPresent';
}

LinkToPluginIsPresent.prototype = new Rule();


LinkToPluginIsPresent.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM;
  var links = doc.getElementsByTagName('A');
  // let's filter out links not pointing to pdf files
  var pdfLinks = new Array();
  for (var i=0; i<links.length; i++){
    if (refersToFileWithExtension(links[i],'PDF')){
      pdfLinks.push(links[i]);
    }
  }
  var objects = doc.getElementsByTagName('OBJECT');
  var applets = doc.getElementsByTagName('APPLET');
  var embeds = doc.getElementsByTagName('EMBED');
  var wrongEmbeds =  new Array();
  for (var i=0; i<embeds.length; i++){
    var embed = embeds[i];
    var pluginspace = embed.getAttribute('PLUGINSPACE');
    var pluginurl = embed.getAttribute('PLUGINURL');
    if (isDefinedAttr(pluginspace) && (/\S+/g.exec(pluginspace))) {
  continue;
    } else if (isDefinedAttr(pluginurl) && (/\S+/g.exec(pluginurl))) {
  continue;
    }
    wrongEmbeds.push(embed);
  }
  var collection = pdfLinks.concat(objects).concat(applets).concat(wrongEmbeds);
  for (var i=0; i < collection.length; i++) {
    var elt = collection[i];
    var tag = (elt.tagName == 'A') ? 'pdf' : elt.tagName;
    var msg = this.getRuleMessage(tag);
    var offsets = doc.nodeToSourceViewOffsets(elt);
    var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
            MANUAL_STATUS, msg);
    if (isEditable(doc, elt))
  wrong.push(thisPbm);
  }
  return wrong;
}

registerRule(new LinkToPluginIsPresent());


/************************************************************
 *
 *       rule APPLETwValidALT
 *
 ************************************************************/

function APPLETwValidALT() {
  this.ruleID = 'APPLETwValidALT';
}

// inherit from Rule
APPLETwValidALT.prototype = new Rule();

APPLETwValidALT.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM;
  var applets = doc.getElementsByTagName('APPLET');

  for (var i=0; i < applets.length; i++) {
    var applet = applets[i];
    var alt    = applet.getAttribute('alt');
    var res    = isValidAppletContent(alt);
    if (res == true)    /* it's OK */
      continue;
    var msg = this.getRuleMessage(res);
    var offsets = doc.nodeToSourceViewOffsets(applet);
    if (isEditable(doc, applet))
  wrong.push(makeUsabPbm(this.ruleID, fileAttr, offsets,
             FAILED_STATUS,msg));
  }
  return wrong;
}

registerRule(new APPLETwValidALT());  /* create the rule */


/************************************************************
 *
 *       rule APPLETwValidCONTENT
 *
 ************************************************************/

function APPLETwValidCONTENT() {
  this.ruleID = 'APPLETwValidCONTENT';
}

// inherit from Rule
APPLETwValidCONTENT.prototype = new Rule();

APPLETwValidCONTENT.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM;
  var applets = doc.getElementsByTagName('APPLET');

  for (var i=0; i < applets.length; i++) {
    var applet  = applets[i];
    var content = getNodeText(applet);
    var res     = isValidAppletContent(content);
    if (res == true)    /* it's OK */
      continue;
    var msg = this.getRuleMessage(res);
    var offsets = doc.nodeToSourceViewOffsets(applet);
    if (isEditable(doc, applet))
  wrong.push(makeUsabPbm(this.ruleID, fileAttr, offsets,
             FAILED_STATUS,msg));

  }
  return wrong;
}

registerRule(new APPLETwValidCONTENT());  /* create the rule */


/************************************************************
 *
 *       rule APPLETwEquivalentALT
 *
 ************************************************************/

function APPLETwEquivalentALT() {
  this.ruleID = 'APPLETwEquivalentALT';
}
APPLETwEquivalentALT.prototype = new Rule();

APPLETwEquivalentALT.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM;
  var applets = doc.getElementsByTagName('APPLET');

  for (var i=0; i < applets.length; i++) {
    var applet  = applets[i];

    // ALT and CONTENT must both be valid.
    var alt     = applet.getAttribute('alt');
    var resAlt  = isValidAppletContent(alt);
    var content = getNodeText(applet);
    var resCon  = isValidAppletContent(content);

    if ((resAlt == true) && (resCon == true)) {

  var offsets = doc.nodeToSourceViewOffsets(applet);
  var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
          MANUAL_STATUS);
  session.checkStoredTests(thisPbm);
  if (isEditable(doc, applet))
      wrong.push(thisPbm);
    }
  }
  return wrong;
}

registerRule(new APPLETwEquivalentALT());


/************************************************************
 *
 *       rule FormIsAccessible
 *
 ************************************************************/

function FormIsAccessible() {
  this.ruleID = 'FormIsAccessible';
}

FormIsAccessible.prototype = new Rule();


FormIsAccessible.prototype.findPbms = function (fileAttr, session) {
    var FORM_ELTS = ['INPUT', 'BUTTON', 'TEXTAREA', 'SELECT', 'OPTION',
        'OPTGROUP', 'FIELDSET', 'LEGEND', 'LABEL', 'ISINDEX'];
    var wrong = new Array();
    var collection = new Array();
    var doc = fileAttr.DOM;
    var ok;
    var forms = doc.getElementsByTagName('FORM');
    for (var i=0; i < forms.length; i++){
  var form = forms[i];
  var tables = getDescendants(form, 'TABLE');
  if (tables.length) {
      ok = false;
      for (var j=0; (! ok) && (j<tables.length); j++) {
    var table = tables[j];
    for (var k=0; (! ok) && (k<FORM_ELTS.length); k++) {
        if (getDescendants(table, FORM_ELTS[k]).length) {
      collection.push(form);
      ok = true;
        }
    }
      }
  }
    }
    // collection is the array of forms containing a table containg form elements
    for (var i=0; i < collection.length; i++) {
  var elt = collection[i];
  var msg = this.getRuleMessage('msg');
  var offsets = doc.nodeToSourceViewOffsets(elt);
  var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
          MANUAL_STATUS, msg);
  if (isEditable(doc, elt))
      wrong.push(thisPbm);
    }
    return wrong;
}

registerRule(new FormIsAccessible());


/************************************************************
 *
 *       rule SkipRepetitiveLinks
 *
 ************************************************************/

function SkipRepetitiveLinks() {
  this.ruleID = 'SkipRepetitiveLinks';
}

SkipRepetitiveLinks.prototype = new Rule();


SkipRepetitiveLinks.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM;
  var links = doc.getElementsByTagName('A');
  links = links.concat(doc.getElementsByTagName('AREA'));
  if (links.length <= 1) {
      return wrong;             /* no sequence of links */
  }
  var framesets = doc.getElementsByTagName('frameset');
  if (framesets.length > 0){
    return wrong;   /* no problem found */
  }
  var bodies = doc.getElementsByTagName('body');
  if (bodies.length == 0) {
    return wrong;   /* that's weird, but let's be safe */
  }
  var offsets = doc.nodeToSourceViewOffsets(bodies[0]);
  var msg = this.getRuleMessage('msg');
  var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
            MANUAL_STATUS,msg);
  if (isEditable(doc, bodies[0]))
      wrong.push(thisPbm);
  return wrong;
}

registerRule(new SkipRepetitiveLinks());



/************************************************************
 *
 *       rule NoJavascriptLinks
 *
 ************************************************************/

function NoJavascriptLinks() {
  this.ruleID = 'NoJavascriptLinks';
}

NoJavascriptLinks.prototype = new Rule();


NoJavascriptLinks.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM;
  var aLinks = doc.getElementsByTagName('A');
  var re = /^javascript:/i;
  for (var i = 0; i< aLinks.length; i++){
    var the_link = aLinks[i];
    var href = the_link.getAttribute('href');
    if (! isDefinedAttr(href))
      continue;     /* skip it */
    if (href.search(re) == -1)
      continue;     /* it's a good one */
    var offsets = doc.nodeToSourceViewOffsets(the_link);
    var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
            FAILED_STATUS);
    if (isEditable(doc, the_link))
      wrong.push(thisPbm);
  }
  return wrong;
}

registerRule(new NoJavascriptLinks());


/************************************************************
 *
 *       rule NoRefreshIsUsed
 *
 ************************************************************/

function NoRefreshIsUsed() {
  this.ruleID = 'NoRefreshIsUsed';
}

NoRefreshIsUsed.prototype = new Rule();


NoRefreshIsUsed.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM;
  var metas = doc.getElementsByTagName('META');
  var re = /\d+;\s*url\s*=.+/;    /* a number followed by ";" and an URL*/
  for (var i = 0; i< metas.length; i++){
    var the_meta = metas[i];
    var http_equiv = the_meta.getAttribute('http-equiv');
    if (!(http_equiv && (http_equiv.toLowerCase() == 'refresh')))
      continue;
    /* it is a auto refresh */
    var content = the_meta.getAttribute('content');
    if (content && (content.search(re) != -1))
      continue; // it is a redirect
    var offsets = doc.nodeToSourceViewOffsets(the_meta);
    var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
            FAILED_STATUS);
    if (isEditable(doc, the_meta))
  wrong.push(thisPbm);
  }
  return wrong;
}

registerRule(new NoRefreshIsUsed());


/************************************************************
 *
 *       rule NoRedirectIsUsed
 *
 ************************************************************/

function NoRedirectIsUsed() {
  this.ruleID = 'NoRedirectIsUsed';
}

NoRedirectIsUsed.prototype = new Rule();


NoRedirectIsUsed.prototype.findPbms = function (fileAttr, session) {
  var wrong = new Array();
  var doc = fileAttr.DOM;
  var metas = doc.getElementsByTagName('META');
  var re = /\d+;\s*url\s*=.+/;    /* a number followed by ";" and an URL*/
  for (var i = 0; i< metas.length; i++){
    var the_meta = metas[i];
    var http_equiv = the_meta.getAttribute('http-equiv');
    if (!(http_equiv && (http_equiv.toLowerCase() == 'refresh')))
      continue;
    /* it is a auto refresh */
    var content = the_meta.getAttribute('content');
    if (content && (content.search(re) != -1)) {
      /* it's a redirect */
      var offsets = doc.nodeToSourceViewOffsets(the_meta);
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
        FAILED_STATUS);
      if (isEditable(doc, the_meta))
    wrong.push(thisPbm);
    }
  }
  return wrong;
}

registerRule(new NoRedirectIsUsed());



/************************************************************
 *
 *       rule NoFlickeringGIFs
 *
 ************************************************************/

function NoFlickeringGIFs() {
  this.ruleID = 'NoFlickeringGIFs';
}

NoFlickeringGIFs.prototype = new Rule();

FLICKER_MIME = [/^image\/gif/i, /^video\//i, /^application\//i, /^applet\//i, /^unknown\//i];

NoFlickeringGIFs.prototype.findPbms = function (fileAttr, session) {
  var wrong   = new Array();
  var doc     = fileAttr.DOM;
  var elt;
  var imgs    = doc.getElementsByTagName('IMG');
  var inputs  = doc.getElementsByTagName('INPUT');
  var bodies  = doc.getElementsByTagName('BODY');

  var gifs = bodies.concat(imgs.concat(inputs));
  // select only GIF IMGs
  for (var i=0; i < gifs.length; i++) {
    var img = gifs[i];
    var src;
    if (img.tagName == 'BODY')
  src = img.getAttribute('background');
    else
      src = img.getAttribute('src');
    if (/\.gif\s*$/i.exec(src)) {
      var msg = this.getRuleMessage('msg');
      if (bodies.length > 0) {
  elt = bodies[0];
      } else {
  var noframes = doc.getElementsByTagName('NOFRAMES');
  if (noframes.length > 0)
    elt = noframes[0];
  else
    elt = doc.documentElement;
      }
      var offsets = doc.nodeToSourceViewOffsets(elt);
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
        MANUAL_STATUS, msg);
      /* check if test outcome is stored */
      session.checkStoredTests(thisPbm);
      if (isEditable(doc, elt))
    wrong.push(thisPbm);
      break;
    }
  }
  return wrong;

}

registerRule(new NoFlickeringGIFs());



/************************************************************
 *
 *       rule NoFlickeringObjects
 *
 ************************************************************/

function NoFlickeringObjects() {
  this.ruleID = 'NoFlickeringObjects';
}

NoFlickeringObjects.prototype = new Rule();

FLICKER_MIME = [/^image\/gif/i, /^video\//i, /^application\//i, /^applet\//i, /^unknown\//i];

NoFlickeringObjects.prototype.findPbms = function (fileAttr, session) {
  var wrong   = new Array();
  var doc     = fileAttr.DOM;
  var scripts = doc.getElementsByTagName('SCRIPT');
  var objects = doc.getElementsByTagName('OBJECT');
  var embeds  = doc.getElementsByTagName('EMBED');
  var applets = doc.getElementsByTagName('APPLET');

  var collection = scripts.concat(applets);
  // don't select embedded audio
  for (var i=0; i < embeds.length; i++) {
    var embed = embeds[i];
    if (getEmbedMime(embed) != 'audio/')
      collection.push(embed);
  }
  for (var i=0; i < objects.length; i++) { // check objects
    var object  = objects[i];
    var type = getObjectMime(object);
    for (var j=0;j<FLICKER_MIME.length; j++) {
      var mime = FLICKER_MIME[j];
      if (mime.exec(type)) {
  collection.push(object);
        break;
      }
    }
  }
  // push all wrongs
  for (var i=0; i < collection.length; i++) {
    var elt  = collection[i];
    var msg = this.getRuleMessage(elt.tagName);
    var offsets = doc.nodeToSourceViewOffsets(elt);
    var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
            MANUAL_STATUS, msg);
    /* check if test outcome is stored */
    session.checkStoredTests(thisPbm);
    if (isEditable(doc, elt))
        wrong.push(thisPbm);

  }
  return wrong;

}

registerRule(new NoFlickeringObjects());



/************************************************************
 *
 *       rule imgOBJECTwValidContent
 *
 ************************************************************/


function imgOBJECTwValidContent() {
  this.ruleID = 'imgOBJECTwValidContent';
}

imgOBJECTwValidContent.prototype = new Rule();

imgOBJECTwValidContent.prototype.findPbms = function (fileAttr, session) {
  var wrong   = new Array();
  var doc     = fileAttr.DOM;
  var objects = doc.getElementsByTagName('OBJECT');
  var children;

  for (var i=0; i < objects.length; i++) {
    var object  = objects[i];
    var type = getObjectMime(object);
    if (/^image\//i.exec(type)) {
      children = getDescendants(object, 'A');
      if (containsValidAttribute(children, 'href'))
  continue;
      children = getDescendants(object, 'AREA');
      if (containsValidAttribute(children, 'href'))
  continue;
      children = getDescendants(object, 'IMG');
      if (containsValidAttribute(children, 'src'))
  continue;
      children = getDescendants(object, 'OBJECT');
      if (children.length > 0)
  continue;
      var res = isValidObjectContent(object);
      if (res == true)
        continue;
      // Not valid !
      var msg = this.getRuleMessage(res);
      var offsets = doc.nodeToSourceViewOffsets(object);
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
        FAILED_STATUS, msg);
      if (isEditable(doc, object))
    wrong.push(thisPbm);
    }
  }
  return wrong;

}

registerRule(new imgOBJECTwValidContent());


/************************************************************
 *
 *       rule imgOBJwEquivCont
 *
 ************************************************************/


function imgOBJwEquivCont() {
  this.ruleID = 'imgOBJwEquivCont';
}

imgOBJwEquivCont.prototype = new Rule();

imgOBJwEquivCont.prototype.findPbms = function (fileAttr, session) {
  var wrong      = new Array();
  var collection = new Array();
  var doc        = fileAttr.DOM;
  var objects    = doc.getElementsByTagName('OBJECT');
  var children;

  for (var i=0; i < objects.length; i++) {
    var object  = objects[i];
    var type = getObjectMime(object);
    if (/^image\//i.exec(type)) {
      children = getDescendants(object, 'IMG');
      if (containsValidAttribute(children, 'src')) {
    continue;
      }
      children = getDescendants(object, 'A');
      if (containsValidAttribute(children, 'href')) {
    collection.push(object);
    continue;
      }
      children = getDescendants(object, 'AREA');
      if (containsValidAttribute(children, 'href')) {
    collection.push(object);
    continue;
      }
      if (getDescendants(object, 'OBJECT').length) {
    collection.push(object);
    continue;
      }
      if (isValidObjectContent(object) == true) {
      collection.push(object);
      }
    }
  }
  for (var i=0; i < collection.length; i++) {
      var elt = collection[i];
      var offsets = doc.nodeToSourceViewOffsets(elt);
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
        MANUAL_STATUS);
      session.checkStoredTests(thisPbm);
      if (isEditable(doc, elt))
          wrong.push(thisPbm);
  }
  return wrong;
}

registerRule(new imgOBJwEquivCont());



/************************************************************
 *
 *       rule avOBJECTwValidContent
 *
 ************************************************************/

function avOBJECTwValidContent() {
  this.ruleID = 'avOBJECTwValidContent';
}

avOBJECTwValidContent.prototype = new Rule();

avOBJECTwValidContent.prototype.findPbms = function (fileAttr, session) {
  var wrong   = new Array();
  var doc     = fileAttr.DOM;
  var objects = doc.getElementsByTagName('OBJECT');
  var children;

  for (var i=0; i < objects.length; i++) {
    var object  = objects[i];
    var type = getObjectMime(object);
    if (/^(audio|video)\//i.exec(type)) {
      children = getDescendants(object, 'A');
      if (containsValidAttribute(children, 'href'))
  continue;
      children = getDescendants(object, 'AREA');
      if (containsValidAttribute(children, 'href'))
  continue;
      children = getDescendants(object, 'OBJECT');
      if (children.length > 0)
  continue;
      var res = isValidObjectContent(object);
      if (res == true)
        continue;
      // Not valid !
      var msg = this.getRuleMessage(res);
      var offsets = doc.nodeToSourceViewOffsets(object);
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
        FAILED_STATUS, msg);
      if (isEditable(doc, object))
    wrong.push(thisPbm);
    }
  }
  return wrong;

}

registerRule(new avOBJECTwValidContent());


/************************************************************
 *
 *       rule avOBJwEquivContent
 *
 ************************************************************/

function avOBJwEquivContent() {
  this.ruleID = 'avOBJwEquivContent';
}

avOBJwEquivContent.prototype = new Rule();

avOBJwEquivContent.prototype.findPbms = function (fileAttr, session) {
  var wrong      = new Array();
  var collection = new Array();
  var doc        = fileAttr.DOM;
  var objects    = doc.getElementsByTagName('OBJECT');
  var children;

  for (var i=0; i < objects.length; i++) {
    var object  = objects[i];
    var type = getObjectMime(object);
    if (/^(audio|video)\//i.exec(type)) {
  children = getDescendants(object, 'A');
  if (containsValidAttribute(children, 'href')) {
      collection.push(object);
      continue;
  }
  children = getDescendants(object, 'AREA');
  if (containsValidAttribute(children, 'href')) {
      collection.push(object);
      continue;
  }
  if (getDescendants(object, 'OBJECT').length) {
      collection.push(object);
      continue;
  }
  if (isValidObjectContent(object) == true)
      collection.push(object);
    }
  }
  for (var i=0; i < collection.length; i++) {
      var elt = collection[i];
      var offsets = doc.nodeToSourceViewOffsets(elt);
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
        MANUAL_STATUS);
      session.checkStoredTests(thisPbm);
      if (isEditable(doc, elt))
          wrong.push(thisPbm);
  }
  return wrong;
}

registerRule(new avOBJwEquivContent());




/************************************************************
 *
 *       rule OBJECTwValidContent
 *
 ************************************************************/

function OBJECTwValidContent() {
  this.ruleID = 'OBJECTwValidContent';
}

OBJECTwValidContent.prototype = new Rule();

OBJECTwValidContent.prototype.findPbms = function (fileAttr, session) {
  var wrong   = new Array();
  var doc     = fileAttr.DOM;
  var objects = doc.getElementsByTagName('OBJECT');
  var children;

  for (var i=0; i < objects.length; i++) {
    var object  = objects[i];
    var type = getObjectMime(object);
    if (/^(audio|video|image)\//i.exec(type))
      continue;
    children = getDescendants(object, 'A');
    if (containsValidAttribute(children, 'href'))
      continue;
    children = getDescendants(object, 'AREA');
    if (containsValidAttribute(children, 'href'))
      continue;
    children = getDescendants(object, 'OBJECT');
    if (children.length > 0)
      continue;
    var res = isValidObjectContent(object);
    if (res == true)
      continue;
    // Not valid !
    var msg = this.getRuleMessage(res);
    var offsets = doc.nodeToSourceViewOffsets(object);
    var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
        FAILED_STATUS, msg);
    if (isEditable(doc, object))
  wrong.push(thisPbm);
  }
  return wrong;

}

registerRule(new OBJECTwValidContent());



/************************************************************
 *
 *       rule OBJECTwEquivalentContent
 *
 ************************************************************/

function OBJECTwEquivalentContent() {
  this.ruleID = 'OBJECTwEquivalentContent';
}

OBJECTwEquivalentContent.prototype = new Rule();

OBJECTwEquivalentContent.prototype.findPbms = function (fileAttr, session) {
  var wrong      = new Array();
  var collection = new Array();
  var doc        = fileAttr.DOM;
  var objects    = doc.getElementsByTagName('OBJECT');
  var children;

  for (var i=0; i < objects.length; i++) {
      var object  = objects[i];
      var type = getObjectMime(object);
      if (/^(audio|video|image)\//i.exec(type))
    continue;
      children = getDescendants(object, 'A');
      if (containsValidAttribute(children, 'href')) {
    collection.push(object);
    continue;
      }
      children = getDescendants(object, 'AREA');
      if (containsValidAttribute(children, 'href')) {
    collection.push(object);
    continue;
      }
      if (getDescendants(object, 'OBJECT').length > 0) {
    collection.push(object);
    continue;
      }
      if (isValidObjectContent(object) == true) {
    collection.push(object);
    continue;
      }
  }
  for (var i=0; i < collection.length; i++) {
      var elt = collection[i];
      var offsets = doc.nodeToSourceViewOffsets(elt);
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
        MANUAL_STATUS);
      session.checkStoredTests(thisPbm);
      if (isEditable(doc, elt))
          wrong.push(thisPbm);
  }
  return wrong;
}

registerRule(new OBJECTwEquivalentContent());



/************************************************************
 *
 *       rule MuMediawSynchAlt
 *
 ************************************************************/

function MuMediawSynchAlt() {
  this.ruleID = 'MuMediawSynchAlt';
}

MuMediawSynchAlt.prototype = new Rule();

MuMediawSynchAlt.prototype.findPbms = function (fileAttr, session) {
  var wrong   = new Array();
  var collection = new Array();
  var doc     = fileAttr.DOM;
  var objects = doc.getElementsByTagName('OBJECT');
  var embeds  = doc.getElementsByTagName('EMBED');
  var links   = doc.getElementsByTagName('A');

  links = links.concat(doc.getElementsByTagName('AREA'));
  for (var i=0; i < links.length; i++) { // direct links
    var link = links[i];
    var type  = getUrlType(link.getAttribute('href'));
    if (/^(video|application|applet)\//i.exec(type))
      collection.push(link);
  }
  for (var i=0; i < objects.length; i++) { // objects
    var object = objects[i];
    var type   = getObjectMime(object);
    if (/^(video|application|applet)\//i.exec(type))
      collection.push(object);
  }
  for (var i=0; i < embeds.length; i++) { // embed
    var embed = embeds[i];
    var type  = getEmbedMime(embed);
    if (/^(video|application|applet)\//i.exec(type))
      collection.push(embed);
  }
  for (var i=0; i < collection.length; i++) {
    var elt = collection[i];
    var msg = this.getRuleMessage(elt.tagName);
    var offsets = doc.nodeToSourceViewOffsets(elt);
    var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
        MANUAL_STATUS, msg);
    if (isEditable(doc, elt))
        wrong.push(thisPbm);
  }
  return wrong;

}

registerRule(new MuMediawSynchAlt());



/************************************************************
 *
 *       rule MmediaEquivAuDescr
 *
 ************************************************************/

function MmediaEquivAuDescr() {
  this.ruleID = 'MmediaEquivAuDescr';
}

MmediaEquivAuDescr.prototype = new Rule();

MmediaEquivAuDescr.prototype.findPbms = function (fileAttr, session) {
  var wrong   = new Array();
  var collection = new Array();
  var doc     = fileAttr.DOM;
  var objects = doc.getElementsByTagName('OBJECT');
  var embeds  = doc.getElementsByTagName('EMBED');
  var links   = doc.getElementsByTagName('A');

  links = links.concat(doc.getElementsByTagName('AREA'));
  for (var i=0; i < links.length; i++) { // direct links
    var link = links[i];
    var type  = getUrlType(link.getAttribute('href'));
    if (/^(video|application|applet)\//i.exec(type))
      collection.push(link);
  }
  for (var i=0; i < objects.length; i++) { // objects
    var object = objects[i];
    var type   = getObjectMime(object);
    if (/^(video|application|applet)\//i.exec(type))
      collection.push(object);
  }
  for (var i=0; i < embeds.length; i++) { // embed
    var embed = embeds[i];
    var type  = getEmbedMime(embed);
    if (/^(video|application|applet)\//i.exec(type))
      collection.push(embed);
  }
  for (var i=0; i < collection.length; i++) {
    var elt = collection[i];
    var msg = this.getRuleMessage(elt.tagName);
    var offsets = doc.nodeToSourceViewOffsets(elt);
    var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
            MANUAL_STATUS, msg);
    if (isEditable(doc, elt))
        wrong.push(thisPbm);
  }
  return wrong;
}

registerRule(new MmediaEquivAuDescr());



/************************************************************
 *
 *       rule ClearLangForSite
 *
 ************************************************************/

function ClearLangForSite() {
  this.ruleID = 'ClearLangForSite';
}

ClearLangForSite.prototype = new Rule();

ClearLangForSite.prototype.findPbms = function (fileAttr, session) {
  var wrong      = new Array();
  var collection = new Array();
  var doc        = fileAttr.DOM;
  var children   = doc.getElementsByTagName('BODY');
  children = children.concat(doc.getElementsByTagName('NOFRAMES'));

  for(var i=0; i<children.length; i++) {
      var child  = children[i];
      var inside = getNodeText(child);
      if (inside != "") {
    collection.push(child);
    break;
      }
  }
  if (collection.length) {
      var offsets = doc.nodeToSourceViewOffsets(collection[0]);
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
        MANUAL_STATUS);
      session.checkStoredTests(thisPbm);
      if (isEditable(doc, collection[0]))
          wrong.push(thisPbm);
  }
  return wrong;
}

registerRule(new ClearLangForSite());




/************************************************************
 *
 *       rule ClarifyNatLangUsage
 *
 ************************************************************/

function  ClarifyNatLangUsage() {
  this.ruleID = 'ClarifyNatLangUsage';
}

ClarifyNatLangUsage.prototype = new Rule();

ClarifyNatLangUsage.prototype.findPbms = function (fileAttr, session) {
  var wrong      = new Array();
  var collection = new Array();
  var doc        = fileAttr.DOM;
  var children   = doc.getElementsByTagName('BODY');
  children = children.concat(doc.getElementsByTagName('NOFRAMES'));

  for(var i=0; i<children.length; i++) {
      var child  = children[i];
      var inside = getNodeText(child);
      if (inside != "") {
    collection.push(child);
    break;
      }
  }
  if (collection.length) {
      var offsets = doc.nodeToSourceViewOffsets(collection[0]);
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
        MANUAL_STATUS);
      session.checkStoredTests(thisPbm);
      if (isEditable(doc, collection[0]))
          wrong.push(thisPbm);
  }
  return wrong;
}

registerRule(new ClarifyNatLangUsage());



/************************************************************
 *
 *       rule linkedAUDIOwEquivContent
 *
 ************************************************************/

function  linkedAUDIOwEquivContent() {
  this.ruleID = 'linkedAUDIOwEquivContent';
}

linkedAUDIOwEquivContent.prototype = new Rule();

linkedAUDIOwEquivContent.prototype.findPbms = function (fileAttr, session) {
  var wrong      = new Array();
  var collection = new Array();
  var doc        = fileAttr.DOM;
  var links      = doc.getElementsByTagName('A');
  links = links.concat(doc.getElementsByTagName('AREA'));

  for(var i=0; i<links.length; i++) {
      var link  = links[i];
      var type  = getUrlType(link.getAttribute('href'));
      if (/^(audio)\//i.exec(type))
  collection.push(link);
  }
  for(var i=0; i<collection.length; i++) {
      elt = collection[i];
      var offsets = doc.nodeToSourceViewOffsets(elt);
      var msg = this.getRuleMessage(elt.tagName);
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
        MANUAL_STATUS, msg);
      session.checkStoredTests(thisPbm);
      if (isEditable(doc, elt))
          wrong.push(thisPbm);
  }
  return wrong;
}

registerRule(new linkedAUDIOwEquivContent());



/************************************************************
 *
 *       rule proprietaryTagsAreUsed
 *
 ************************************************************/

function  proprietaryTagsAreUsed() {
  this.ruleID = 'proprietaryTagsAreUsed';
}

proprietaryTagsAreUsed.prototype = new Rule();

proprietaryTagsAreUsed.prototype.findPbms = function (fileAttr, session) {
  var wrong      = new Array();
  var collection = new Array();
  var doc        = fileAttr.DOM;
  var propTags   = ['jsp:useBean', 'jsp:setProperty', 'jsp:getProperty', 'CFQUERY', 'CFOUTPUT', 'CFPOP', 'CFMAIL', 'CFINCLUDE', 'CFFORM', "@VAR", "@ASSIGN","@ROWS","@CALC","@IF","@ELSEIF"];
  for (var i=0; i< propTags.length; i++){
    var tag = propTags[i];
    elts = doc.getElementsByTagName(tag);
    if (elts.length > 0) {
      var offsets = doc.nodeToSourceViewOffsets(elts[0]);
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets,
        MANUAL_STATUS);
      if (isEditable(doc, elts[0]))
          wrong.push(thisPbm);
    }
  }
  return wrong;
}

registerRule(new proprietaryTagsAreUsed());




/* end of 508_rules.js */



