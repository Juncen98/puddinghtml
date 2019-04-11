/*
 * 505/W3C Accessibility Suite OEM V2 for Macromedia Dreamweaver
 * (C) Copyright 2005 UsableNet Inc. All rights reserved.
 */
/* $Id: wcagp2_rules.js,v 1.34 2005/04/14 11:05:33 malex Exp $ */

/* Contains definition of rules for the WCAG 1.0 Priority 2 */


// Array with all WCAG 1.0 priority 2 rules
AllWcagP2Rules = Array();
function registerRule(rule)
{
    AllWcagP2Rules.push(rule);
}



/******************************************************************************
 *
 *       rule fgColOverBgCol    (WCAG 2.2 - Manual)
 *
 *****************************************************************************/
// Ensure that foreground and background color combinations provide sufficient
// contrast when viewed by someone having color deficits or when viewed on a
// black and white screen.

function fgColOverBgCol()
 {
  this.ruleID = 'fgColOverBgCol';
 }

fgColOverBgCol.prototype = new Rule();

fgColOverBgCol.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, images, img, allObjects, objects,
      embeds, obj, i, audioMime, mime, inputs, inp, attr;
  var wrong = new Array();

  ddom = fileAttr.DOM;
  audioMime = new RegExp("^audio\/", "i");
  // Get all images from document
  images = ddom.getElementsByTagName('IMG');
  for (i = 0; i < images.length; i++)
      {
       img = images[i];
       // Check if current image is a spacer or an hidden link
       if (isSpacer(fileAttr, img) || isHiddenLink(fileAttr, img))
           continue;
       offsets = ddom.nodeToSourceViewOffsets(img);
       thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
       if (isEditable(ddom, img))
     wrong.push(thisPbm);
      }

  // Get all INPUT elements with TYPE = Image
  inputs = ddom.getElementsByTagName('INPUT');
  for (i = 0; i < inputs.length; i++)
      {
       inp = inputs[i];
       attr = inp.getAttribute('TYPE');
       if (isDefinedAttr(attr))
          {
           if (attr.toUpperCase() == 'IMAGE')
              {
               offsets = ddom.nodeToSourceViewOffsets(inp);
               thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
         if (isEditable(ddom, inp))
       wrong.push(thisPbm);
              }
          }
      }

  // Get all document objects, but audio objects and audio embeds
  allObjects = ddom.getElementsByTagName('APPLET');
  embeds = ddom.getElementsByTagName('EMBED');
  for (i = 0; i < embeds.length; i++)
      {
       obj = embeds[i];
       mime = getEmbedMime(obj);
       if (mime.search(audioMime) == -1)
           allObjects.push(obj);
      }
  objects = ddom.getElementsByTagName('OBJECT');
  for (i = 0; i < objects.length; i++)
      {
       obj = objects[i];
       mime = getObjectMime(obj);
       if (mime.search(audioMime) == -1)
           allObjects.push(obj);
      }

  // Update Problems with selected objects
  for (i = 0; i < allObjects.length; i++)
      {
       offsets = ddom.nodeToSourceViewOffsets(allObjects[i]);
       thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
       if (isEditable(ddom, allObjects[i]))
           wrong.push(thisPbm);
      }

  // Check for CSS with color attributes or background images
  var colors = new Array('background', 'background-color',
       'background-image', 'color');
  if (fileAttr.cssa.filterProperties('*', colors).length) {
      offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
      thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
      wrong.push(thisPbm);
  }

  return wrong;
 }

registerRule(new fgColOverBgCol());



/******************************************************************************
 *
 *       rule mrkpRtImg     (WCAG 3.1 - Manual)
 *
 *****************************************************************************/
// When an appropriate markup language exists, use markup rather than images
// to convey information.

function mrkpRtImg()
 {
  this.ruleID = 'mrkpRtImg';
 }

mrkpRtImg.prototype = new Rule();

mrkpRtImg.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, images, img, i, inputs, inp, attr;
  var wrong = new Array();

  ddom = fileAttr.DOM;
  // Get all images from document
  images = ddom.getElementsByTagName('IMG');
  for (i = 0; i < images.length; i++)
      {
       img = images[i];
       // Check if current image is a spacer or an hidden link
       if (isSpacer(fileAttr, img, true) || isHiddenLink(fileAttr, img))
           continue;
       offsets = ddom.nodeToSourceViewOffsets(img);
       thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
       if (isEditable(ddom, img))
     wrong.push(thisPbm);
      }

  // Get all INPUT elements with TYPE = Image
  inputs = ddom.getElementsByTagName('INPUT');
  for (i = 0; i < inputs.length; i++)
      {
       inp = inputs[i];
       attr = inp.getAttribute('TYPE');
       if (isDefinedAttr(attr))
          {
           if (attr.toUpperCase() == 'IMAGE')
              {
               offsets = ddom.nodeToSourceViewOffsets(inp);
               thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
         if (isEditable(ddom, inp))
       wrong.push(thisPbm);
              }
          }
      }

  // Check for CSS with color attributes or background images
  var colors = new Array('background', 'background-image');
  var cssattrs = fileAttr.cssa.filterProperties('*', colors);
  var urlRE = new RegExp("url\\(", "i");
  for (var i = 0; i < cssattrs.length; i++) {
      var attr = cssattrs[i];
      if (attr[0] == 'background-image' ||
    (attr[0] == 'background' && urlRE.test(attr[1])))  {
    offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
    thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
    wrong.push(thisPbm);
    break;
      }
  }

  return wrong;
 }

registerRule(new mrkpRtImg());



/******************************************************************************
 *
 *       rule docValFrmGrm     (WCAG 3.2 - Manual)
 *
 *****************************************************************************/
// Create documents that validate to published formal grammars.

function docValFrmGrm() {
    this.ruleID = 'docValFrmGrm';
}

docValFrmGrm.prototype = new Rule();

docValFrmGrm.prototype.findPbms = function (fileAttr, session) {
    var problems = new Array();
    // html
    var ddom = fileAttr.DOM;
    var props = new Array();
    var s = ddom.documentElement.outerHTML.toLowerCase();
    s = stripString(s);
    if (s.indexOf('<?xml') != -1) {
  var r = new RegExp('<!doctype[^>]+xhtml[^>]+>', 'i');
  if (r.test(s)) { // xhtml
      problems.push('xhtml');
      if (fileAttr.cssa.filterProperties('*', props).length)
    problems.push('css');
  } else { // xml
      problems.push('xml');
      var css = new RegExp('<?xml-stylesheet[^>]+type\\s*=\\s*"text/css"[^>]+?>','i');
      if (css.test(s))
    problems.push('css');
      var xsl = new RegExp('<?xml-stylesheet[^>]+type\\s*=\\s*"text/xsl"[^>]+?>','i');
      if (xsl.test(s))
    problems.push('xsl');
  }
    } else { // html
  problems.push('html');
  if (fileAttr.cssa.filterProperties('*', props).length)
      problems.push('css');
    }

    var wrong = new Array();
    if (problems.length > 0) {
  offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
  for (var i = 0; i < problems.length; i++) {
      var msg = this.getRuleMessage(problems[i]);
            var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS, msg);
      wrong.push(thisPbm);
  }
    }
    return wrong;
}

registerRule(new docValFrmGrm());



/******************************************************************************
 *
 *       rule publicDoctype     (WCAG 3.2 - Automatic)
 *
 *****************************************************************************/
// Ensure that documents contain valid DOCTYPE declaration.

function publicDoctype()
{
    this.ruleID = 'publicDoctype';
}

publicDoctype.prototype = new Rule();

publicDoctype.prototype.findPbms = function (fileAttr, session)
{
    var problem = null;
    var ddom = fileAttr.DOM;
    var doctype_pattern = /<!doctype[^>]*>/gi;
    var document_text = ddom.documentElement.outerHTML;
    var all_doctypes = new Array();
    var tmp = null;
    while((tmp = doctype_pattern.exec(document_text)) != null) {
        all_doctypes.push(tmp[0]);
    }

    if (all_doctypes.length > 1) {
  problem = 'toomany';
    } else if (all_doctypes.length == 1) {
        var doctype_text = all_doctypes[0];
  var good_pattern = new RegExp("<!doctype\\s+[^>]*\\s+public\\s+", "i");
  if (! good_pattern.exec(doctype_text)) {
      var sys_pattern = new RegExp("<!doctype\\s+[^>]*\\s+system\\s+", "i");
      if (sys_pattern.exec(doctype_text))
    problem = 'notpublished';
      else
          problem = 'badformed';
  }
    } else {
        problem = 'none';
    }

    var wrong = new Array();
    if (problem) {
  offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
  msg = this.getRuleMessage(problem);
  thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
  wrong.push(thisPbm);
    }

    return wrong;
}

registerRule(new publicDoctype());



/******************************************************************************
 *
 *       rule SSCtrlLyPr     (WCAG 3.3 - Auto)
 *
 *****************************************************************************/
// Use style sheets to control layout and presentation.

function SSCtrlLyPr() {
    this.ruleID = 'SSCtrlLyPr';
}

SSCtrlLyPr.prototype = new Rule();

SSCtrlLyPr.prototype.findPbms = function (fileAttr, session) {
    var wrong = new Array();
    var lnk, attr, vect, deprElems, deprAttrs, elts, isDepr;
    // check if document has stylesheets
    var props = new Array();
    if (fileAttr.cssa.filterProperties('*', props).length)
        return wrong; // PASSED

    var ddom = fileAttr.DOM;
    elts = getAllNodeElements(ddom.documentElement);
    deprElems = getDeprStyleElems();
    deprAttrs = getDeprStyleAttrs();
    for (var i = 0; i < elts.length; i++) {
  isDepr = false;
  // Check if element is deprecated
  for (var j = 0; j < deprElems.length; j++)
            if (elts[i].tagName.toUpperCase() == deprElems[j]) {
    if (isEditable(ddom, elts[i])) {
        var offsets = ddom.nodeToSourceViewOffsets(elts[i]);
        var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS);
        wrong.push(thisPbm);
        isDepr = true;
        break;
    }
      }

  if (isDepr)
      break;  // Check next element

  // Check if element has deprecated attributes
  vect = deprAttrs[elts[i].tagName.toUpperCase()];
  if ((vect != null) && (vect != 'undefined')) {
      // Compare deprecated attributes of current element
      for (var j = 0; j < vect.length; j++) {
                attr = elts[i].getAttribute(vect[j]);
                if (isDefinedAttr(attr)) {
        if (isEditable(ddom, elts[i])) {
      var offsets = ddom.nodeToSourceViewOffsets(elts[i]);
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS);
      wrong.push(thisPbm);
      break;
        }
    }
      }
  }
    }

    return wrong;
}

registerRule(new SSCtrlLyPr());

//////////////////////////////////////////////
// Definition of functions used by this rule
//////////////////////////////////////////////

function getDeprStyleElems()
{
 // Structure of HTML 4.01 layout elements deprecated
 var deprElems = new Array("BASEFONT", "CENTER", "FONT", "S", "STRIKE", "U");
 return deprElems;
}


function getDeprStyleAttrs()
{
 // Structure of HTML 4.01 layout attributes deprecated
 var deprAttrs = new Array();

 var depat_caption = new Array("ALIGN");
 deprAttrs["CAPTION"] = depat_caption;
 var depat_iframe = new Array("ALIGN");
 deprAttrs["IFRAME"] = depat_iframe;
 var depat_img = new Array("ALIGN", "BORDER", "HSPACE", "VSPACE");
 deprAttrs["IMG"] = depat_img;
 var depat_input = new Array("ALIGN");
 deprAttrs["INPUT"] = depat_input;
 var depat_object = new Array("ALIGN", "BORDER", "HSPACE", "VSPACE");
 deprAttrs["OBJECT"] = depat_object;
 var depat_legend = new Array("ALIGN");
 deprAttrs["LEGEND"] = depat_legend;
 var depat_table = new Array("ALIGN", "BGCOLOR");
 deprAttrs["TABLE"] = depat_table;
 var depat_hr = new Array("ALIGN", "NOSHADE", "SIZE", "WIDTH");
 deprAttrs["HR"] = depat_hr;
 var depat_div = new Array("ALIGN");
 deprAttrs["DIV"] = depat_div;
 var depat_h1 = new Array("ALIGN");
 deprAttrs["H1"] = depat_h1;
 var depat_h2 = new Array("ALIGN");
 deprAttrs["H2"] = depat_h2;
 var depat_h3 = new Array("ALIGN");
 deprAttrs["H3"] = depat_h3;
 var depat_h4 = new Array("ALIGN");
 deprAttrs["H4"] = depat_h4;
 var depat_h5 = new Array("ALIGN");
 deprAttrs["H5"] = depat_h5;
 var depat_h6 = new Array("ALIGN");
 deprAttrs["H6"] = depat_h6;
 var depat_p = new Array("ALIGN");
 deprAttrs["P"] = depat_p;
 var depat_body = new Array("ALINK", "BACKGROUND", "BGCOLOR", "LINK", "TEXT", "VLINK");
 deprAttrs["BODY"] = depat_body;
 var depat_tr = new Array("BGCOLOR");
 deprAttrs["TR"] = depat_tr;
 var depat_td = new Array("BGCOLOR", "HEIGHT", "NOWRAP", "WIDTH");
 deprAttrs["TD"] = depat_td;
 var depat_th = new Array("BGCOLOR", "HEIGHT", "NOWRAP", "WIDTH");
 deprAttrs["TH"] = depat_th;
 var depat_br = new Array("CLEAR");
 deprAttrs["BR"] = depat_br;
 var depat_ol = new Array("START", "TYPE");
 deprAttrs["OL"] = depat_ol;
 var depat_ul = new Array("TYPE");
 deprAttrs["UL"] = depat_ul;
 var depat_li = new Array("TYPE", "VALUE");
 deprAttrs["LI"] = depat_li;
 var depat_pre = new Array("WIDTH");
 deprAttrs["PRE"] = depat_pre;
 return deprAttrs;
}



/******************************************************************************
 *
 *       rule frameSize   (WCAG 3.4 - Auto - First)
 *
 *****************************************************************************/
// Use relative than absolute units in markup and style sheet values.

function frameSize()
 {
  this.ruleID = 'frameSize';
 }

frameSize.prototype = new Rule();

frameSize.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, framesets, i, j, msg, fs, cols, v, s, rows;
  var wrong = new Array();

  ddom = fileAttr.DOM ;
  framesets = ddom.getElementsByTagName('FRAMESET');
  for (i = 0; i < framesets.length; i++)
      {
       fs = framesets[i];
       cols = fs.getAttribute('COLS');
       if (isDefinedAttr(cols))
          {
     v = cols.split(',');
     for (j = 0; j < v.length; j++)
               {
    s = stripString(v[j]);
    if (s.length && (s != '*') && (s.indexOf('%') == -1))
       {
                    offsets = ddom.nodeToSourceViewOffsets(fs);
                    msg = this.getRuleMessage('cols');
                    thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
        if (isEditable(ddom, fs))
      wrong.push(thisPbm);
       }
         }
           }
  rows = fs.getAttribute('ROWS');
  if (isDefinedAttr(rows))
           {
      v = rows.split(',');
      for (j = 0; j < v.length; j++)
                {
     s = stripString(v[j]);
     if (s.length && (s != '*') && (s.indexOf('%') == -1))
        {
                     offsets = ddom.nodeToSourceViewOffsets(fs);
                     msg = this.getRuleMessage('rows');
                     thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
         if (isEditable(ddom, fs))
       wrong.push(thisPbm);
        }
          }
     }
      }
  return wrong;
 }

registerRule(new frameSize());



/******************************************************************************
 *
 *       rule tableSize   (WCAG 3.4 - Auto - Second)
 *
 *****************************************************************************/
// Use relative than absolute units in markup and style sheet values.

function tableSize()
 {
  this.ruleID = 'tableSize';
 }

tableSize.prototype = new Rule();

tableSize.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, tables, table, inside, block_threhsold, ancestor,
      width, height, cells, cell, i, j, msg;
  var wrong = new Array();

  block_threhsold = 50;
  ddom = fileAttr.DOM ;
  tables = ddom.getElementsByTagName('TABLE');
  for (i = 0; i < tables.length; i++)
      {
  table = tables[i];
  inside = getNodeText(table);
        if (inside.length < block_threhsold)
      continue;  // There isn't a text block inside
  // check table width
  width = table.getAttribute('WIDTH');
  if (isDefinedAttr(width))
           {
      width = stripString(width);
      if (width.length && (width.indexOf('%') == -1))
               {
                offsets = ddom.nodeToSourceViewOffsets(table);
                msg = this.getRuleMessage('table');
                thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
    if (isEditable(ddom, table))
        wrong.push(thisPbm);
    continue;
         }
     }
  // now all its cells
        cells = table.getElementsByTagName('TH');
  cells = cells.concat(table.getElementsByTagName('TD'));
  for (j = 0; j < cells.length; j++)
            {
             cell = cells[j];
             // Data cell must belong only to the current table
             ancestor = hasAncestor('TABLE', cell);
             if ((ancestor == null) || (ancestor != table))
                 continue;
       width = cell.getAttribute('WIDTH');
       if (isDefinedAttr(width))
                {
                 width = stripString(width);
     if (width.length && (width.indexOf('%') == -1))
        {
                     offsets = ddom.nodeToSourceViewOffsets(cell);
                     msg = this.getRuleMessage('cell-width');
                     thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
         if (isEditable(ddom, cell))
       wrong.push(thisPbm);
        }
          }
       height = cell.getAttribute('HEIGHT');
       if (isDefinedAttr(height))
                {
     height = stripString(height);
     if (height.length && (height.indexOf('%') == -1))
        {
                     offsets = ddom.nodeToSourceViewOffsets(cell);
                     msg = this.getRuleMessage('cell-height');
                     thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
         if (isEditable(ddom, cell))
       wrong.push(thisPbm);
        }
          }
      }
      }
  return wrong;
 }

registerRule(new tableSize());



/******************************************************************************
 *
 *       rule relThAbsUnitMrkpSS  (WCAG 3.4 - Automatic - Third)
 *
 *****************************************************************************/
// Use relative than absolute units in markup and style sheet values.

function relThAbsUnitMrkpSS() {
    this.ruleID = 'relThAbsUnitMrkpSS';
}

relThAbsUnitMrkpSS.prototype = new Rule();
relThAbsUnitMrkpSS.prototype.findPbms = function (fileAttr, session) {

  var ddom = fileAttr.DOM;
  var wrong = new Array();
  var props = new Array('font', 'font-size');

  var elts = searchForNodesUsingStyleUnits(fileAttr, props);
  for (var j = 0; j < elts.length; j++) {
    if (isEditable(ddom, elts[j])) {
      var msg = this.getRuleMessage('font');
      var offsets = ddom.nodeToSourceViewOffsets(elts[j]);
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
      wrong.push(thisPbm);
    }
  }

  props = new Array('background-position', 'top', 'right',
                    'bottom', 'left', 'caption-size', 'clip',
                    'height', 'letter-spacing', 'line-height', 'marker-offset',
                    'max-height', 'max-width',
                    'min-height', 'min-width',
                    'outline', 'outline-width',
                    'vertical-align', 'width', 'word-spacing');

  elts = searchForNodesUsingStyleUnits(fileAttr, props);
  for (var j = 0; j < elts.length; j++) {
    if (isEditable(ddom, elts[j])) {
      var msg = this.getRuleMessage('nofont');
      var offsets = ddom.nodeToSourceViewOffsets(elts[j]);
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS, msg);
      wrong.push(thisPbm);
    }
  }
  return wrong;
}
registerRule(new relThAbsUnitMrkpSS());

function searchForNodesUsingStyleUnits(fileAttr, props) {
  var expr = new RegExp('\\d*(\\.\\d+)?(cm|mm|in|px|pt|pc)', 'i');
  var expr_ok = new RegExp('^0*(\\.0+)?(cm|mm|in|px|pt|pc)$', 'i');
  var styles = fileAttr.cssa.filterProperties('*', props);
  var elts = new Array();

  for (var i = 0; i < styles.length; i++) {
    var fragment = stripString(styles[i][1]);

    if (expr.test(fragment)) {
      var found = false;

      // Fragments like: "0px" or "0.0px" are correct.
      // Check for bad composite fragments like: "2px 0px".
      var sub_frags = fragment.split(' ');
      for (var j = 0; j < sub_frags.length; j++) {
        if (! expr_ok.test(sub_frags[j])) {
          found = true;
          break;
        }
      }
      if (! found)
        continue;

      // Only one issue for each element
      var elt = styles[i][2];
      found = false;
      for (var j = 0; j < elts.length; j++)
        if (elts[j] == elt) {
          found = true;
          break;
        }
    if (! found)
      elts.push(elt);
    }
  }
  return elts;
}

/******************************************************************************
 *
 *       rule relThAbsUnitMrkpSSBox  (WCAG 3.4 - Manual - Forth)
 *
 *****************************************************************************/
// Use relative than absolute units in markup and style sheet values.

function relThAbsUnitMrkpSSBox() {
    this.ruleID = 'relThAbsUnitMrkpSSBox';
}

relThAbsUnitMrkpSSBox.prototype = new Rule();

relThAbsUnitMrkpSSBox.prototype.findPbms = function (fileAttr, session) {
    var props = new Array('padding', 'padding-top', 'padding-right',
        'padding-bottom', 'padding-left', 'border',
        'border-top', 'border-right', 'border-bottom',
        'border-left', 'border-width', 'border-top-width',
        'border-right-width', 'border-bottom-width',
        'border-left-width', 'border-spacing', 'margin',
        'margin-top', 'margin-right', 'margin-bottom',
        'margin-left');
    var elts = searchForNodesUsingStyleUnits(fileAttr, props);
    var ddom = fileAttr.DOM;
    var wrong = new Array();
    for (var j = 0; j < elts.length; j++) {
  if (isEditable(ddom, elts[j])) {
      var offsets = ddom.nodeToSourceViewOffsets(elts[j]);
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
      wrong.push(thisPbm);
  }
    }
    return wrong;
}

registerRule(new relThAbsUnitMrkpSSBox());


/******************************************************************************
 *
 *       rule useHeaders     (WCAG 3.5 - Auto)
 *
 *****************************************************************************/
// Use header elements to convey document structure and use them according to
// specification.

function useHeaders() {
    this.ruleID = 'useHeaders';
}

useHeaders.prototype = new Rule();

useHeaders.prototype.findPbms = function (fileAttr, session) {
    var wrong = new Array();
    if (! documentHasHeaders(fileAttr)) {
  // No HEADERS in the document
  var ddom  = fileAttr.DOM;
  var offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
  var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS);
  wrong.push(thisPbm);
    }
    return wrong;
}

registerRule(new useHeaders());

function documentHasHeaders(fileAttr) {
    var hasHeaders = false;
    var ddom = fileAttr.DOM;
    for (var ndx = 1; ndx < 7; ndx++) {
  var headers = ddom.getElementsByTagName("H" + ndx.toString());
  if (headers.length > 0) {
      hasHeaders = true;
      break;
  }
    }
    return hasHeaders;
}

/******************************************************************************
 *
 *       rule hdElAccSpec     (WCAG 3.5 - Manual)
 *
 *****************************************************************************/
// Use header elements to convey document structure and use them according to
// specification.

function hdElAccSpec() {
    this.ruleID = 'hdElAccSpec';
}

hdElAccSpec.prototype = new Rule();

hdElAccSpec.prototype.findPbms = function (fileAttr, session)  {
    var wrong = new Array();
    if (documentHasHeaders(fileAttr)) {
  var ddom  = fileAttr.DOM;
  var offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
  var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
  wrong.push(thisPbm);
    }
    return wrong;
}

registerRule(new hdElAccSpec());



function getBlockTextUnderNode(node)
{
 var children, isBlock, tag;
 var text = "";
 var notBlocks = getTextBlockNames();
 notBlocks.push("SELECT");
 notBlocks.push("SCRIPT");
 notBlocks.push("STYLE");
 notBlocks.push("TEXTAREA");

 if (node.nodeType == Node.TEXT_NODE)
     text = node.data;
 else {
       children = node.childNodes;
       for (var i = 0; i < children.length; i++)
           {
            if (children[i].nodeType == Node.ELEMENT_NODE)
               {
                tag = children[i].tagName.toUpperCase();
                isBlock = true;
                for (var j = 0; j < notBlocks.length; j++)
                    {
                     if (tag == notBlocks[j])
                        {
                         isBlock = false;
                         break;
                        }
                    }
                if (isBlock)
                    text = text + getBlockTextUnderNode(children[i]);
         }
            else text = text + getBlockTextUnderNode(children[i]);
           }
      }
 return text;
}



function getTextBlockNames()
{
 var tBlocks = new Array("BLOCKQUOTE", "BODY", "CAPTION", "CENTER", "DD", "DIV",
                         "DT", "FIELDSET", "H1", "H2", "H3", "H4", "H5", "H6",
                         "LI", "NOFRAMES", "P", "PRE", "TD", "TH");
 return tBlocks;
}



/******************************************************************************
 *
 *       rule mrkLstItmPrp     (WCAG 3.6 - Manual)
 *
 *****************************************************************************/
// Mark up lists and list items properly.

function mrkLstItmPrp() {
    this.ruleID = 'mrkLstItmPrp';
}

mrkLstItmPrp.prototype = new Rule();

mrkLstItmPrp.prototype.findPbms = function (fileAttr, session) {
    var wrong = new Array();
    var ddom  = fileAttr.DOM;
    var base_url = fileAttr.URL;
    var images = ddom.getElementsByTagName('IMG');
    var maybeBullet = false;
    var imagesFound = new Object();
    for (var i = 0; i < images.length; i++) {
  var img = images[i];
  // Check if current image is a spacer or an hidden link
  if (isSpacer(fileAttr, img) || isHiddenLink(fileAttr, img))
      continue;
  var src = img.getAttribute('SRC');
  if (! isDefinedAttr(src))
      continue;
  var width = img.getAttribute('WIDTH');
  if (! isDefinedAttr(width))
      width = 'unknown';
  var height = img.getAttribute('HEIGHT');
  if (! isDefinedAttr(width))
      height = 'unknown';
  var key = makeAbsoluteURL(src, base_url) + '/' + width + '/' + height;
  if (imagesFound[key] != null && imagesFound[key] != 'undefined') {
      maybeBullet = true;
      break;
  }
  imagesFound[key] = true;
    }

    if (maybeBullet) {
  // MANUAL on entire document (HTML element)
  var offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
  var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
  wrong.push(thisPbm);
    }
    return wrong;
}

registerRule(new mrkLstItmPrp());



/******************************************************************************
 *
 *       rule mrkpQuot     (WCAG 3.7 - First - Manual)
 *
 *****************************************************************************/
 // Mark up quotations.

function mrkpQuot()
 {
  this.ruleID = 'mrkpQuot';
 }

mrkpQuot.prototype = new Rule();

mrkpQuot.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom;
  var wrong = new Array();

  ddom  = fileAttr.DOM;
  // MANUAL on entire document (HTML element)
  offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
  thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
  wrong.push(thisPbm);
  return wrong;
 }

registerRule(new mrkpQuot());



/******************************************************************************
 *
 *       rule noQtMrkpFrmEff     (WCAG 3.7 - Second - Manual)
 *
 *****************************************************************************/
// Do not use quotation markup for formatting effects such as indentation.

function noQtMrkpFrmEff()
 {
  this.ruleID = 'noQtMrkpFrmEff';
 }

noQtMrkpFrmEff.prototype = new Rule();

noQtMrkpFrmEff.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, eltsBCK, eltsQ;
  var wrong = new Array();

  ddom  = fileAttr.DOM;
  // Check if document has Q or BLOCKQUOTE elements
  eltsBCK = ddom.getElementsByTagName('BLOCKQUOTE');
  if (eltsBCK.length > 0)
     {
      // MANUAL on entire document (HTML element)
      offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
      thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
      wrong.push(thisPbm);
      return wrong;
     }
  eltsQ = ddom.getElementsByTagName('Q');
  if (eltsQ.length > 0)
     {
      // MANUAL on entire document (HTML element)
      offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
      thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
      wrong.push(thisPbm);
      return wrong;
     }
  return wrong;
 }

registerRule(new noQtMrkpFrmEff());



/******************************************************************************
 *
 *       rule linTbUseLyNoSs     (WCAG 5.3 - Manual)
 *
 *****************************************************************************/
// Do not use tables for layout unless the table makes sense when linearized.
// Otherwise, if the table does not make sense, provide an alternative
// equivalent (which may be a linearized version).

function linTbUseLyNoSs() {
    this.ruleID = 'linTbUseLyNoSs';
}

linTbUseLyNoSs.prototype = new Rule();

linTbUseLyNoSs.prototype.findPbms = function (fileAttr, session) {
    var wrong = new Array();
    var ddom  = fileAttr.DOM;
    var tElts = ddom.getElementsByTagName('TABLE');
    for (var i = 0; i < tElts.length; i++) {
  table = tElts[i];
  if (isEditable(ddom, table) && ! isADataTable(table)) {
      var offsets = ddom.nodeToSourceViewOffsets(table);
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
      wrong.push(thisPbm);
  }
    }
    return wrong;
}

registerRule(new linTbUseLyNoSs());

function isADataTable(table) {
    var subtags = [ 'THEAD', 'TFOOT', 'CAPTION', 'TH' ];
    for (var i = 0; i < subtags.length; i++) {
  var subElts = table.getElementsByTagName(subtags[i]);
        for (var j = 0; j < subElts.length; j++) {
      var ancestor = hasAncestor('TABLE', subElts[j]);
            if (ancestor != null && ancestor == table)
    return true;
  }
    }
    return false;
}




/******************************************************************************
 *
 *       rule noStrMrkpVslFrmTbLy     (WCAG 5.4 - Manual)
 *
 *****************************************************************************/
// If a table is used for layout, do not use any structural markup for the
// purpose of visual formatting.

function noStrMrkpVslFrmTbLy() {
    this.ruleID = 'noStrMrkpVslFrmTbLy';
}

noStrMrkpVslFrmTbLy.prototype = new Rule();

noStrMrkpVslFrmTbLy.prototype.findPbms = function (fileAttr, session) {
    var wrong = new Array();
    var ddom  = fileAttr.DOM;
    var tElts = ddom.getElementsByTagName('TABLE');
    // Check if TABLE elements contain almost one of these
    // sub-elements:
    for (var i = 0; i < tElts.length; i++) {
  table = tElts[i];
  if (isEditable(ddom, table) && isADataTable(table)) {
      var offsets = ddom.nodeToSourceViewOffsets(table);
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
      wrong.push(thisPbm);
  }
    }
    return wrong;
}

registerRule(new noStrMrkpVslFrmTbLy());

/******************************************************************************
 *
 *       rule inptDevIndEvHndScrApl     (WCAG 6.4 - Auto)
 *
 *****************************************************************************/
// For scripts and applets, ensure that event handlers are input
// device-independent.

function inptDevIndEvHndScrApl()
 {
  this.ruleID = 'inptDevIndEvHndScrApl';
 }

inptDevIndEvHndScrApl.prototype = new Rule();

inptDevIndEvHndScrApl.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, bElts, subEls, elt, attr1, attr2, i, j, msg;
  var wrong = new Array();

  ddom  = fileAttr.DOM;
  bElts = ddom.getElementsByTagName('BODY');
  if (bElts.length == 0)
     return wrong;

  // Get all elements contained into BODY
  for (i = 0; i < bElts.length; i++)
      {
       subEls = getAllNodeElements(bElts[i]);
       // Check script event attributes of these elements
       for (j = 0; j < subEls.length; j++)
           {
            elt = subEls[j];
            // Both attributes should be present
            attr1 = elt.getAttribute('ONMOUSEUP');
            attr2 = elt.getAttribute('ONKEYUP');
            if ((isDefinedAttr(attr1) && (! isDefinedAttr(attr2))) ||
                ((! isDefinedAttr(attr1)) && isDefinedAttr(attr2)))
                {
                 // FAILED
                 offsets = ddom.nodeToSourceViewOffsets(elt);
                 msg = this.getRuleMessage('no_both');
                 thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
     if (isEditable(ddom, elt))
         wrong.push(thisPbm);
                }
            // Both attributes should be present
            attr1 = elt.getAttribute('ONMOUSEDOWN');
            attr2 = elt.getAttribute('ONKEYDOWN');
            if ((isDefinedAttr(attr1) && (! isDefinedAttr(attr2))) ||
                ((! isDefinedAttr(attr1)) && isDefinedAttr(attr2)))
                {
                 // FAILED
                 offsets = ddom.nodeToSourceViewOffsets(elt);
                 msg = this.getRuleMessage('no_both');
                 thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
     if (isEditable(ddom, elt))
         wrong.push(thisPbm);
                }
            // Both attributes should be present
            attr1 = elt.getAttribute('ONCLICK');
            attr2 = elt.getAttribute('ONKEYPRESS');
            if ((isDefinedAttr(attr1) && (! isDefinedAttr(attr2))) ||
                ((! isDefinedAttr(attr1)) && isDefinedAttr(attr2)))
                {
                 // FAILED
                 offsets = ddom.nodeToSourceViewOffsets(elt);
                 msg = this.getRuleMessage('no_both');
                 thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
     if (isEditable(ddom, elt))
         wrong.push(thisPbm);
                }
            // Both attributes should be present
            attr1 = elt.getAttribute('ONMOUSEOUT');
            attr2 = elt.getAttribute('ONBLUR');
            if ((isDefinedAttr(attr1) && (! isDefinedAttr(attr2))) ||
                ((! isDefinedAttr(attr1)) && isDefinedAttr(attr2)))
                {
                 // FAILED
                 offsets = ddom.nodeToSourceViewOffsets(elt);
                 msg = this.getRuleMessage('no_both');
                 thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
     if (isEditable(ddom, elt))
         wrong.push(thisPbm);
                }
            // Both attributes should be present
            attr1 = elt.getAttribute('ONMOUSEOVER');
            attr2 = elt.getAttribute('ONFOCUS');
            if ((isDefinedAttr(attr1) && (! isDefinedAttr(attr2))) ||
                ((! isDefinedAttr(attr1)) && isDefinedAttr(attr2)))
                {
                 // FAILED
                 offsets = ddom.nodeToSourceViewOffsets(elt);
                 msg = this.getRuleMessage('no_both');
                 thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
     if (isEditable(ddom, elt))
         wrong.push(thisPbm);
                }
            // This attribute should not be used
            attr1 = elt.getAttribute('ONDBLCLICK');
            if (isDefinedAttr(attr1))
               {
                // FAILED
                offsets = ddom.nodeToSourceViewOffsets(elt);
                msg = this.getRuleMessage('bad_attr');
                thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
    if (isEditable(ddom, elt))
        wrong.push(thisPbm);
               }
           }
      }
  return wrong;
 }

registerRule(new inptDevIndEvHndScrApl());



/******************************************************************************
 *
 *       rule noJSLinks     (WCAG 6.5 - First - Auto)
 *
 *****************************************************************************/
// Ensure that dynamic content is accessible or provide an alternative
// presentation or page.

function noJSLinks()
 {
  this.ruleID = 'noJSLinks';
 }

noJSLinks.prototype = new Rule();

noJSLinks.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, aLinks, the_link, href, re;
  var wrong = new Array();

  ddom  = fileAttr.DOM;
  // Get all link elements (A)
  aLinks = ddom.getElementsByTagName('A');
  if (aLinks.length == 0)
      return wrong;

  re = /^javascript:/i;
  for (var i = 0; i < aLinks.length; i++)
      {
       the_link = aLinks[i];
       // a patch for PR#420
       if (! the_link)
           continue;
       href = the_link.getAttribute('HREF');
       if (! isDefinedAttr(href))
           continue;      /* skip it */
       if (href.search(re) == -1)
     continue;      /* it's a good one */
       offsets = ddom.nodeToSourceViewOffsets(the_link);
       thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS);
       if (isEditable(ddom, the_link))
     wrong.push(thisPbm);
      }
  return wrong;
 }

registerRule(new noJSLinks());



/******************************************************************************
 *
 *       rule validNOFRAMES     (WCAG 6.5 - Second - Auto)
 *
 *****************************************************************************/
// Ensure that dynamic content is accessible or provide an alternative
// presentation or page.

function validNOFRAMES()
 {
  this.ruleID = 'validNOFRAMES';
 }

validNOFRAMES.prototype = new Rule();

validNOFRAMES.prototype.findPbms = function (fileAttr, session)
 {
  var EMPTY_WORDS = ['browser', 'enable', 'frame', 'does', 'not', 'support',
                     'version', 'upgrade', 'please', 'latest',
                     'view','recent', 'missing'];
  var FRACTION = 0.3;
  var thisPbm, offsets, ddom, nf_elts, nf, nt_text, desc, has_children, msg;
  var wrong = new Array();

  ddom = fileAttr.DOM;
  if (ddom.getElementsByTagName('FRAMESET').length == 0)
      return wrong;   // No FRAMESET elements

  // Check if there is a NOFRAMES section
  nf_elts = ddom.getElementsByTagName('NOFRAMES');
  if (nf_elts.length == 0)
     {
      offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
      msg = this.getRuleMessage('none');
      thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
      wrong.push(thisPbm);
      return wrong;
     }

  nf = nf_elts[0];
  // Check if content is empty
  var nf_text = getNodeText(nf);
  nf_text = stripString(nf_text);
  // Must remove BODY element because it is added by Dreamweaver
  desc = getDescendants(nf, '*');
  has_children = false;
  for (var i = 0; i < desc.length; i++)
       if (desc[i].tagName != 'BODY')
    {
     has_children = true;
           break;
    }
  if (! nf_text.length && ! has_children)
     {
      offsets = ddom.nodeToSourceViewOffsets(nf);
      msg = this.getRuleMessage('empty');
      thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
      if (isEditable(ddom, nf)) {
    wrong.push(thisPbm);
    return wrong;
      }
     }
  //check if NOFRAMES contains only placeholder text
  if (isPlaceholder(nf_text, EMPTY_WORDS, FRACTION))
     {
      offsets = ddom.nodeToSourceViewOffsets(nf);
      msg = this.getRuleMessage('placeholder');
      thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
      if (isEditable(ddom, nf)) {
    wrong.push(thisPbm);
    return wrong;
      }
     }

  // check if there are local links
  var base_url, found, links, link, href, url;
  base_url = ddom.URL;
  found = false;
  links = nf.getElementsByTagName('A');
  for (var i = 0; i < links.length; i++)
      {
       link = links[i];
       if (! link)
           continue;
       href = link.getAttribute('HREF');
       if (isDefinedAttr(href))
          {
           href = stripString(href);
     url = makeAbsoluteURL(href, base_url);
     // if protocol is file, it is a local url (because base_url is surely file:/)
     if (getProtocol(url) == 'file')
         found = true;
    }
      }
  if (! found)
     {
      offsets = ddom.nodeToSourceViewOffsets(nf);
      msg = this.getRuleMessage('link');
      thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
      if (isEditable(ddom, nf)) {
    wrong.push(thisPbm);
    return wrong;
      }
     }
  return wrong;
 }

registerRule(new validNOFRAMES());



/******************************************************************************
 *
 *       rule dynCntAcc     (WCAG 6.5 - Third - Manual)
 *
 *****************************************************************************/
// Ensure that dynamic content is accessible or provide an alternative
// presentation or page.

function dynCntAcc()
 {
  this.ruleID = 'dynCntAcc';
 }

dynCntAcc.prototype = new Rule();

dynCntAcc.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, bad_calls, bad, scripts, script, scrText,
      i, allMainElements, msg;
  var wrong = new Array();

  ddom  = fileAttr.DOM;
  // javascript
  bad_calls = 'document\\.write\\(|\\.src\\s*=|';
  // Explorer
  bad_calls += 'innerHTML\\s*=|outerHTML\\s=|';
  // Dom Level 2
  bad_calls += '\\.appendChild\\(|\\.removeChild\\(|\\.replaceChild\\(|\\.insertBefore\\(|\\.setAttribute\\(';
  bad = new RegExp(bad_calls, 'ig');

  // Check SCRIPT tags: loop on every script
  scripts = ddom.getElementsByTagName('SCRIPT')
  for(i = 0; i < scripts.length; i++)
     {
      script = scripts[i];
      scrText = getNodeText(script);
      if (scrText.search(bad) != -1)
         {
          // MANUAL on entire document
          offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
          msg = this.getRuleMessage('globals');
          thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS, msg);
          wrong.push(thisPbm);
          break;
         }
     }

  var elNode, url, events, event, attr, k;
  // Check all document elements
  allMainElements = getAllNodeElements(ddom.documentElement);
  for (i = 0; i < allMainElements.length; i++)
      {
       elNode = allMainElements[i];
       tag = elNode.tagName.toUpperCase();
       if ((tag != 'SCRIPT') && (tag != 'OBJECT') &&
     (tag != 'APPLET') && (tag != 'EMBED'))
          {
     // Check url
     url = get_url(elNode).toLowerCase();
     if (url.indexOf('javascript:') == 0)
              {
               if (url.search(bad) != -1)
                  {
                   // MANUAL on main element
                   offsets = ddom.nodeToSourceViewOffsets(elNode);
                   msg = this.getRuleMessage('link');
                   thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS, msg);
       if (isEditable(ddom, elNode)) {
           wrong.push(thisPbm);
           break;
       }
      }
        }
           // check events
     events = UN_ELT_EVENTS[tag];
     if (events == null)
         events = UN_EVENTS;
     for (k = 0; k < events.length; k++)
               {
    event = events[k];
    attr = elNode.getAttribute(event);
    if (isDefinedAttr(attr))
                   {
                    if (attr.search(bad) != -1)
                       {
                        // MANUAL on main element
                        offsets = ddom.nodeToSourceViewOffsets(elNode);
                        msg = this.getRuleMessage('event');
                        thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS, msg);
      if (isEditable(ddom, elNode)) {
          wrong.push(thisPbm);
          break;
      }
           }
       }
               }
  }
    }
  return wrong;
 }

registerRule(new dynCntAcc());



// return relevant url for one of LINK|A|AREA|FORM
// empty string if it is not defined
function get_url(elt)
{
 var url, tag;

 url = '';
 tag = elt.tagName.toUpperCase();
 if (tag == 'A' || tag == 'AREA' || tag == 'LINK')
     url = elt.getAttribute('HREF');
 if (tag == 'FORM')
     url = elt.getAttribute('ACTION');
 if (! isDefinedAttr(url))
     url = '';
 return stripString(url);
}

UN_ELT_EVENTS = {
  'BODY' :    ['ONCLICK','ONDBLCLICK','ONKEYDOWN','ONKEYPRESS','ONKEYUP','ONLOAD',
         'ONMOUSEDOWN','ONMOUSEMOVE','ONMOUSEOUT','ONMOUSEOVER','ONMOUSEUP','ONUNLOAD'],
  'FRAMESET': ['ONLOAD','ONUNLOAD'],
  'FORM':     ['ONCLICK','ONDBLCLICK','ONKEYDOWN','ONKEYPRESS','ONKEYUP','ONMOUSEDOWN',
         'ONMOUSEMOVE','ONMOUSEOUT','ONMOUSEOVER','ONMOUSEUP','ONRESET', 'ONSUBMIT'],
  'INPUT':    ['ONBLUR','ONCHANGE','ONCLICK','ONDBLCLICK','ONFOCUS','ONKEYDOWN',
         'ONKEYPRESS','ONKEYUP','ONMOUSEDOWN','ONMOUSEMOVE','ONMOUSEOUT','ONMOUSEOVER',
         'ONMOUSEUP', 'ONSELECT'],
  'TEXTAREA': ['ONBLUR','ONCHANGE','ONCLICK','ONDBLCLICK','ONFOCUS','ONKEYDOWN',
         'ONKEYPRESS','ONKEYUP','ONMOUSEDOWN','ONMOUSEMOVE','ONMOUSEOUT','ONMOUSEOVER',
         'ONMOUSEUP','ONSELECT'],
  'SELECT':   ['ONBLUR','ONCHANGE','ONCLICK','ONDBLCLICK','ONFOCUS','ONKEYDOWN',
         'ONKEYPRESS','ONKEYUP','ONMOUSEDOWN','ONMOUSEMOVE','ONMOUSEOUT','ONMOUSEOVER',
         'ONMOUSEUP'],
  'A':        ['ONBLUR','ONCLICK','ONDBLCLICK','ONFOCUS','ONKEYDOWN','ONKEYPRESS',
         'ONKEYUP','ONMOUSEDOWN','ONMOUSEMOVE','ONMOUSEOUT','ONMOUSEOVER','ONMOUSEUP'],
  'AREA':     ['ONBLUR','ONCLICK','ONDBLCLICK','ONFOCUS','ONKEYDOWN','ONKEYPRESS',
         'ONKEYUP','ONMOUSEDOWN','ONMOUSEMOVE','ONMOUSEOUT','ONMOUSEOVER','ONMOUSEUP'],
  'BUTTON':   ['ONBLUR','ONCLICK','ONDBLCLICK','ONFOCUS','ONKEYDOWN','ONKEYPRESS',
         'ONKEYUP','ONMOUSEDOWN','ONMOUSEMOVE','ONMOUSEOUT','ONMOUSEOVER','ONMOUSEUP'],
  'LABEL':    ['ONBLUR','ONCLICK','ONDBLCLICK','ONFOCUS','ONKEYDOWN','ONKEYPRESS',
         'ONKEYUP','ONMOUSEDOWN','ONMOUSEMOVE','ONMOUSEOUT','ONMOUSEOVER','ONMOUSEUP'],
};

UN_EVENTS = ['ONCLICK','ONDBLCLICK','ONKEYDOWN','ONKEYPRESS','ONKEYUP',
       'ONMOUSEDOWN','ONMOUSEMOVE','ONMOUSEOUT','ONMOUSEOVER','ONMOUSEUP'];



/******************************************************************************
 *
 *       rule avdCsgCntBlk         (WCAG 7.2 - first - Auto)
 *
 *****************************************************************************/
// Until user agents allow users to control blinking, avoid causing content to
// blink (i.e., change presentation at a regular rate, such as turning on and
// off).

function avdCsgCntBlk()
 {
  this.ruleID = 'avdCsgCntBlk';
 }

avdCsgCntBlk.prototype = new Rule();

avdCsgCntBlk.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, blinks;
  var wrong = new Array();

  ddom  = fileAttr.DOM;
  blinks  = ddom.getElementsByTagName('BLINK');
  // Check for LINK elements
  for (var i = 0; i < blinks.length; i++)
      {
       // FAILED
       offsets = ddom.nodeToSourceViewOffsets(blinks[i]);
       thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS);
       if (isEditable(ddom, blinks[i]))
     wrong.push(thisPbm);
      }

  // Check for CSS with "text-decoration: blink"
  var reqprops = new Array('text-decoration');
  var props = fileAttr.cssa.filterProperties('*', reqprops);
  for (var i = 0; i < props.length; i++) {
      if (props[i][1] == 'blink') {
          offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
          thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
          wrong.push(thisPbm);
          break;
      }
  }

  return wrong;
}

registerRule(new avdCsgCntBlk());



/******************************************************************************
 *
 *       rule avdElmScrBlk         (WCAG 7.2 - second - Manual)
 *
 *****************************************************************************/
// Until user agents allow users to control blinking, avoid causing content to
// blink (i.e., change presentation at a regular rate, such as turning on and
// off).

function avdElmScrBlk()
 {
  this.ruleID = 'avdElmScrBlk';
 }

avdElmScrBlk.prototype = new Rule();

avdElmScrBlk.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, collection, object,
      type, mime, elt, i, j, msg;
  var wrong = new Array();
  var UN_FLICKER_MIME = new Array();
  UN_FLICKER_MIME.push(new RegExp("^image\/gif","i"));
  UN_FLICKER_MIME.push(new RegExp("^video\/","i"));
  UN_FLICKER_MIME.push(new RegExp("^application\/","i"));
  UN_FLICKER_MIME.push(new RegExp("^applet\/","i"));
  UN_FLICKER_MIME.push(new RegExp("^unknown\/","i"));

  // Get elements related to flickering
  ddom  = fileAttr.DOM;
  var scripts = ddom.getElementsByTagName('SCRIPT');
  var objects = ddom.getElementsByTagName('OBJECT');
  var embeds  = ddom.getElementsByTagName('EMBED');
  var applets = ddom.getElementsByTagName('APPLET');

  collection = scripts.concat(applets);
  // Check for other object elements
  for (i = 0; i < objects.length; i++)
      {
       object = objects[i];
       type = getObjectMime(object);
       for (j = 0; j < UN_FLICKER_MIME.length; j++)
           {
            mime = UN_FLICKER_MIME[j];
            if (type.search(mime) != -1)
               {
            collection.push(object);
                break;
               }
           }
      }
  // Check for other embed elements
  for (i = 0; i < embeds.length; i++)
      {
       object = embeds[i];
       type = getEmbedMime(object);
       for (j = 0; j < UN_FLICKER_MIME.length; j++)
           {
            mime = UN_FLICKER_MIME[j];
            if (type.search(mime) != -1)
               {
            collection.push(object);
                break;
               }
           }
      }

  if (collection.length == 0)
      return wrong;

  // Push all wrongs
  for (i = 0; i < collection.length; i++)
      {
       elt = collection[i];
       offsets = ddom.nodeToSourceViewOffsets(elt);
       msg = this.getRuleMessage(elt.tagName);                        // MANUAL
       thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS, msg);
       if (isEditable(ddom, elt))
     wrong.push(thisPbm);
      }
  return wrong;
 }

registerRule(new avdElmScrBlk());



/******************************************************************************
 *
 *       rule gifNoScrBlk         (WCAG 7.2 - third - Manual)
 *
 *****************************************************************************/
// Until user agents allow users to control blinking, avoid causing content to
// blink (i.e., change presentation at a regular rate, such as turning on and
// off).

function gifNoScrBlk()
 {
  this.ruleID = 'gifNoScrBlk';
 }

gifNoScrBlk.prototype = new Rule();

gifNoScrBlk.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, i, img, src, gifs, found, regexp;
  var wrong = new Array();
  ddom  = fileAttr.DOM;
  var images = ddom.getElementsByTagName('IMG');
  var inputs = ddom.getElementsByTagName('INPUT');
  var bodies = ddom.getElementsByTagName('BODY');

  gifs = bodies.concat(inputs.concat(images));
  regexp = new RegExp("\.gif\s*$", "i");
  found = false;
  for (i = 0; i < gifs.length; i++)
      {
       img = gifs[i];
       // let's skip following types
       if (isSpacer(fileAttr, img) || isHiddenLink(fileAttr, img))
           continue;
       if (img.tagName.toUpperCase() == 'BODY')
           src = img.getAttribute('BACKGROUND');
       else src = img.getAttribute('SRC');
       if (! isDefinedAttr(src))
           continue;
       if (src.search(regexp) != -1)
          {
           found = true;
           break;
          }
      }
 if (found)        // Generate only one issue for all the GIFs
    {
     offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
     thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
     wrong.push(thisPbm);
    }
  return wrong;
 }

registerRule(new gifNoScrBlk());



/******************************************************************************
 *
 *       rule gifNoMvmPg     (WCAG 7.3 - First - Manual)
 *
 *****************************************************************************/
// Until user agents allow users to freeze moving content, avoid movement in
// pages.
//
// [GB:  5Dec01] TO FIX: we should rewrite it to take advantage of the
// new GIF decoder and make it automatic.

function gifNoMvmPg()
 {
  this.ruleID = 'gifNoMvmPg';
 }

gifNoMvmPg.prototype = new Rule();

gifNoMvmPg.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, i, img, src, value, gifs, found, regexp;
  var wrong = new Array();

  ddom  = fileAttr.DOM;
  var images = ddom.getElementsByTagName('IMG');
  var inputs = ddom.getElementsByTagName('INPUT');
  var bodies = ddom.getElementsByTagName('BODY');

  found = false;
  gifs = bodies.concat(inputs.concat(images));
  regexp = new RegExp("\.gif\s*$", "i");
  for (i = 0; i < gifs.length; i++)
      {
       img = gifs[i];
       // let's skip following types
       if (isSpacer(fileAttr, img) || isHiddenLink(fileAttr, img))
           continue;
       if (img.tagName.toUpperCase() == 'BODY')
           src = img.getAttribute('BACKGROUND');
       else src = img.getAttribute('SRC');
       if (! isDefinedAttr(src))
           continue;
       if (src.search(regexp) != -1)
          {
           found = true;
           break;
          }
      }
 if (found)        // generate only one issue for all the GIFs
    {
     offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
     thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
     wrong.push(thisPbm);
    }
  return wrong;
 }

registerRule(new gifNoMvmPg());



/******************************************************************************
 *
 *       rule objNoMvmPg     (WCAG 7.3 - Second - Manual)
 *
 *****************************************************************************/
// Until user agents allow users to freeze moving content, avoid movement in
// pages.

function objNoMvmPg()
 {
  this.ruleID = 'objNoMvmPg';
 }

objNoMvmPg.prototype = new Rule();

objNoMvmPg.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, collection, object, type, mime, elt, i, j, msg;
  var UN_FLICKER_MIME = new Array();
  var wrong = new Array();

  UN_FLICKER_MIME.push(new RegExp("^image\/gif","i"));
  UN_FLICKER_MIME.push(new RegExp("^video\/","i"));
  UN_FLICKER_MIME.push(new RegExp("^application\/","i"));
  UN_FLICKER_MIME.push(new RegExp("^applet\/","i"));
  UN_FLICKER_MIME.push(new RegExp("^unknown\/","i"));
  ddom  = fileAttr.DOM;
  // Get elements related to flickering
  var scripts = ddom.getElementsByTagName('SCRIPT');
  var objects = ddom.getElementsByTagName('OBJECT');
  var embeds  = ddom.getElementsByTagName('EMBED');
  var applets = ddom.getElementsByTagName('APPLET');
  collection = scripts.concat(applets);

  // Check for other object elements
  for (i = 0; i < objects.length; i++)
      {
       object = objects[i];
       type = getObjectMime(object);
       for (j = 0; j < UN_FLICKER_MIME.length; j++)
          {
           mime = UN_FLICKER_MIME[j];
           if (type.search(mime) != -1)
              {
           collection.push(object);
               break;
              }
          }
      }
  // Check for other embed elements
  for (i = 0; i < embeds.length; i++)
      {
       object = embeds[i];
       type = getEmbedMime(object);
       for (j = 0; j < UN_FLICKER_MIME.length; j++)
          {
           mime = UN_FLICKER_MIME[j];
           if (type.search(mime) != -1)
              {
           collection.push(object);
               break;
              }
          }
      }

  if (collection.length == 0)
      return wrong;
  // Push all wrongs
  for (var i = 0; i < collection.length; i++)
     {
      elt = collection[i];
      offsets = ddom.nodeToSourceViewOffsets(elt);
      msg = this.getRuleMessage(elt.tagName);                        // MANUAL
      thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS, msg);
      if (isEditable(ddom, elt))
    wrong.push(thisPbm);
     }
  return wrong;
 }

registerRule(new objNoMvmPg());



/******************************************************************************
 *
 *       rule avoidMarquee     (WCAG 7.3 - Third - Automatic)
 *
 *****************************************************************************/
// Until user agents allow users to freeze moving content, avoid movement in
// pages.

function avoidMarquee() {
    this.ruleID = 'avoidMarquee';
}

avoidMarquee.prototype = new Rule();

avoidMarquee.prototype.findPbms = function (fileAttr, session) {
    var wrong = new Array();
    var ddom  = fileAttr.DOM;
    var elts = ddom.getElementsByTagName('MARQUEE');
    for (var i = 0; i < elts.length; i++) {
  if (isEditable(ddom, elts[i])) {
      var offsets = ddom.nodeToSourceViewOffsets(elts[i]);
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
      wrong.push(thisPbm);
  }
    }
    return wrong;
}

registerRule(new avoidMarquee());



/******************************************************************************
 *
 *       rule avdAutRfrPg     (WCAG 7.4 - Auto)
 *
 *****************************************************************************/
// Until user agents provide the ability to stop the refresh, do not create
// periodically auto-refreshing pages.
//
// Note: The rule checks if the page contains a META element with attributes
// HTTP-EQUIV="refresh" content=NUMBER. If so it suggests to the user to
// remove that feature.

function avdAutRfrPg()
 {
  this.ruleID = 'avdAutRfrPg';
 }

avdAutRfrPg.prototype = new Rule();

avdAutRfrPg.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, metas, the_meta, http_equiv, content;
  var wrong = new Array();

  var re = /\d+;\s*url\s*=.+/i;   /* a number followed by ";" and an URL */
  ddom  = fileAttr.DOM;
  metas = ddom.getElementsByTagName('META');
  if (metas.length == 0)
      return wrong;

  for (var i = 0; i < metas.length; i++)
      {
       the_meta = metas[i];
       http_equiv = the_meta.getAttribute('HTTP-EQUIV');
       if (!(isDefinedAttr(http_equiv) && http_equiv &&
            (http_equiv.toUpperCase() == 'REFRESH')))
           continue;  // it is an auto refresh
       content = the_meta.getAttribute('CONTENT');
       if (isDefinedAttr(content) && content && (content.search(re) != -1))
           continue;  // it is a redirect
       offsets = ddom.nodeToSourceViewOffsets(the_meta);
       thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS);
       if (isEditable(ddom, the_meta))
     wrong.push(thisPbm);
      }
  return wrong;
 }

registerRule(new avdAutRfrPg());



/******************************************************************************
 *
 *       rule avdRedPgMarkp     (WCAG 7.5 - Auto)
 *
 *****************************************************************************/
// Until user agents provide the ability to stop auto-redirect, do not use
// markup to redirect pages automatically. Instead, configure the server to
// perform redirects.
//
// Note: The rule checks if the page contains a META element with attributes
// HTTP-EQUIV="refresh" content="NUMBER; URL". If so it suggests to the user to
// remove that feature or at least to add links and content to the first and
// second page as well.

function avdRedPgMarkp()
 {
  this.ruleID = 'avdRedPgMarkp';
 }

avdRedPgMarkp.prototype = new Rule();

avdRedPgMarkp.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, the_meta, http_equiv, content, metas;
  var wrong = new Array();

  var re = /\d+;\s*url\s*=.+/i;   /* a number followed by ";" and an URL*/
  ddom  = fileAttr.DOM;
  metas = ddom.getElementsByTagName('META');
  if (metas.length == 0)
      return wrong;

  for (var i = 0; i < metas.length; i++)
      {
       the_meta = metas[i];
       http_equiv = the_meta.getAttribute('HTTP-EQUIV');
       if (!(isDefinedAttr(http_equiv) && http_equiv &&
           (http_equiv.toUpperCase() == 'REFRESH')))
           continue;  // it is an auto refresh
       content = the_meta.getAttribute('CONTENT');
       if (isDefinedAttr(content) && content && (content.search(re) != -1))
          {
           // it's a redirect
           offsets = ddom.nodeToSourceViewOffsets(the_meta);
           thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS);
     if (isEditable(ddom, the_meta))
         wrong.push(thisPbm);
          }
      }
  return wrong;
 }

registerRule(new avdRedPgMarkp());



/******************************************************************************
 *
 *       rule JmpMenu     (WCAG 9.2 - First - Auto)
 *
 *****************************************************************************/
// Ensure that any element that has its own interface can be operated in a
// device-independent manner.

function JmpMenu()
 {
  this.ruleID = 'JmpMenu';
 }

JmpMenu.prototype = new Rule();

JmpMenu.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, select_elts, expr1, expr2, select_elt,
      onchange, msg;
  var wrong = new Array();

  ddom  = fileAttr.DOM;
  select_elts = ddom.getElementsByTagName('SELECT');
  if (select_elts.length == 0)
      return wrong;

  // starting with any instruction followed by a space or ;, followed by MM_jumpMenu('this' or 'window' or 'parent'.
  expr1 = RegExp('^(.+(;|\\s))*MM_jumpMenu\\(\'(window|parent|this)\'','g');
  // starting with any instruction followed by a space or ; or ( : this is the case of eval.
  expr2 = RegExp("^(.+(\\(|;|\\s))*((parent|this|window)\.location|location)\\s*=",'g');

  for (var i = 0; i < select_elts.length; i++)
      {
       select_elt = select_elts[i];
       onchange = select_elt.getAttribute('ONCHANGE');
       if (isDefinedAttr(onchange))
    {
     if (onchange.search(expr1) != -1)
        {
               offsets = ddom.nodeToSourceViewOffsets(select_elt);
               msg = this.getRuleMessage('mm_jump');
               thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
         if (isEditable(ddom, select_elt))
       wrong.push(thisPbm);
        }
           if (onchange.search(expr2) != -1)
        {
               offsets = ddom.nodeToSourceViewOffsets(select_elt);
               msg = this.getRuleMessage('self_jump');
               thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
         if (isEditable(ddom, select_elt))
       wrong.push(thisPbm);
        }
    }
      }
  return wrong;
 }

registerRule(new JmpMenu());


/******************************************************************************
 *
 *       rule elmOwnIntfDecIndp     (WCAG 9.2 - Second - Manual)
 *
 *****************************************************************************/
// Ensure that any element that has its own interface can be operated in a
// device-independent manner.

function elmOwnIntfDecIndp()
 {
  this.ruleID = 'elmOwnIntfDecIndp';
 }

elmOwnIntfDecIndp.prototype = new Rule();

elmOwnIntfDecIndp.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, tag, msg, offsets, thisPbm, elt,
      allMainElements, elNode, events, event, attr, msg;
  var wrong = new Array();
  var collection = new Array();

  ddom  = fileAttr.DOM;
  collection = collection.concat(ddom.getElementsByTagName('OBJECT'));
  collection = collection.concat(ddom.getElementsByTagName('APPLET'));
  collection = collection.concat(ddom.getElementsByTagName('EMBED'));
  found = (collection.length > 0);
  for (var i = 0; i < collection.length; i++)
      {
       elt = collection[i];
       tag = elt.tagName;
       offsets = ddom.nodeToSourceViewOffsets(elt);
       msg = this.getRuleMessage(tag);
       thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS, msg);
       if (isEditable(ddom, elt))
     wrong.push(thisPbm);
      }

  // Get all document elements
  allMainElements = getAllNodeElements(ddom.documentElement);
  for (var i = 0; i < allMainElements.length; i++)
      {
       elNode = allMainElements[i];
       tag = elNode.tagName.toUpperCase();
       if ((tag != 'SCRIPT') && (tag != 'OBJECT') &&
           (tag != 'APPLET') && (tag != 'EMBED'))
          {
           events = UN_DEP_ELT_EVENTS[tag];
           if (events == null)
               events = UN_DEP_EVENTS;
           for (var k = 0; k < events.length; k++)
               {
                event = events[k];
          attr  = elNode.getAttribute(event);
          if (isDefinedAttr(attr))
                   {
        attr = attr.replace(/\s+/g, "");
        if (attr)
                       {
                        offsets = ddom.nodeToSourceViewOffsets(elNode);
                        msg = this.getRuleMessage('javascript');
                        thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS, msg);
      if (isEditable(ddom, elNode)) {
          wrong.push(thisPbm);
          break;
      }
                 }
                   }
                }
           }
        }
  return wrong;
 }

registerRule(new elmOwnIntfDecIndp());


UN_DEP_ELT_EVENTS = {
  'BODY' :    ['ONCLICK','ONDBLCLICK','ONKEYDOWN','ONKEYPRESS','ONKEYUP',
         'ONMOUSEDOWN','ONMOUSEMOVE','ONMOUSEOUT','ONMOUSEOVER','ONMOUSEUP'],
  'FORM':     ['ONCLICK','ONDBLCLICK','ONKEYDOWN','ONKEYPRESS','ONKEYUP','ONMOUSEDOWN',
         'ONMOUSEMOVE','ONMOUSEOUT','ONMOUSEOVER','ONMOUSEUP'],
  'INPUT':    ['ONCLICK','ONDBLCLICK','ONKEYDOWN', 'ONKEYPRESS','ONKEYUP',
         'ONMOUSEDOWN','ONMOUSEMOVE','ONMOUSEOUT','ONMOUSEOVER', 'ONMOUSEUP'],
  'TEXTAREA': ['ONCLICK','ONDBLCLICK','ONKEYDOWN','ONKEYPRESS','ONKEYUP',
         'ONMOUSEDOWN','ONMOUSEMOVE','ONMOUSEOUT','ONMOUSEOVER', 'ONMOUSEUP'],
  'SELECT':   ['ONCLICK','ONDBLCLICK','ONKEYDOWN', 'ONKEYPRESS','ONKEYUP','ONMOUSEDOWN',
               'ONMOUSEMOVE','ONMOUSEOUT','ONMOUSEOVER','ONMOUSEUP'],
  'A':        ['ONCLICK','ONDBLCLICK','ONKEYDOWN','ONKEYPRESS',
         'ONKEYUP','ONMOUSEDOWN','ONMOUSEMOVE','ONMOUSEOUT','ONMOUSEOVER','ONMOUSEUP'],
  'AREA':     ['ONCLICK','ONDBLCLICK','ONKEYDOWN','ONKEYPRESS',
         'ONKEYUP','ONMOUSEDOWN','ONMOUSEMOVE','ONMOUSEOUT','ONMOUSEOVER','ONMOUSEUP'],
  'BUTTON':   ['ONCLICK','ONDBLCLICK','ONKEYDOWN','ONKEYPRESS',
         'ONKEYUP','ONMOUSEDOWN','ONMOUSEMOVE','ONMOUSEOUT','ONMOUSEOVER','ONMOUSEUP'],
  'LABEL':    ['ONCLICK','ONDBLCLICK','ONKEYDOWN','ONKEYPRESS',
         'ONKEYUP','ONMOUSEDOWN','ONMOUSEMOVE','ONMOUSEOUT','ONMOUSEOVER','ONMOUSEUP'],
};


UN_DEP_EVENTS = ['ONCLICK','ONDBLCLICK','ONKEYDOWN','ONKEYPRESS','ONKEYUP',
           'ONMOUSEDOWN','ONMOUSEMOVE','ONMOUSEOUT','ONMOUSEOVER','ONMOUSEUP'];



/******************************************************************************
 *
 *       rule spcLgcRtDDEvHndScr     (WCAG 9.3 - Auto)
 *
 *****************************************************************************/
// For scripts, specify logical event handlers rather than device-dependent
// event handlers.

function spcLgcRtDDEvHndScr()
 {
  this.ruleID = 'spcLgcRtDDEvHndScr';
 }

spcLgcRtDDEvHndScr.prototype = new Rule();

spcLgcRtDDEvHndScr.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, allMainElements, elt, tag, type, msg;
  var wrong = new Array();

  ddom  = fileAttr.DOM;
  allMainElements = getAllNodeElements(ddom.documentElement);
  for (var i = 0; i < allMainElements.length; i++)
      {
       elt = allMainElements[i];
       tag = elt.tagName;
       if ((tag == 'INPUT') || (tag == 'BUTTON'))
          {
     type = elt.getAttribute('type');
     if (! isDefinedAttr(type))
        {
         if (tag == 'INPUT')
             type = 'text';
         else type = 'submit';
        }
     type = stripString(type.toLowerCase());
     if ((tag == 'INPUT') && (type == 'image'))
         type = 'submit';
     if (((type == 'reset') || (type == 'submit')) && eltWithPressEvent(elt))
        {
               offsets = ddom.nodeToSourceViewOffsets(elt);
               msg = this.getRuleMessage(type);
               thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
         if (isEditable(ddom, elt))
       wrong.push(thisPbm);
        }
     if ((tag == 'INPUT') && ((type == 'checkbox') || (type == 'radio')) && eltWithPressEvent(elt))
        {
               offsets = ddom.nodeToSourceViewOffsets(elt);
               msg = this.getRuleMessage('onchange');
               thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
         if (isEditable(ddom, elt))
       wrong.push(thisPbm);
        }
     if ((tag == 'INPUT') && (type == 'text') && eltWithPressEvent(elt, 'mouse'))
              {
               offsets = ddom.nodeToSourceViewOffsets(elt);
               msg = this.getRuleMessage('focus');
               thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
         if (isEditable(ddom, elt))
       wrong.push(thisPbm);
              }
     continue;
    }
       if ((tag == 'TEXTAREA') && eltWithPressEvent(elt, 'mouse'))
          {
           offsets = ddom.nodeToSourceViewOffsets(elt);
           msg = this.getRuleMessage('focus');
           thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
     if (isEditable(ddom, elt)) {
         wrong.push(thisPbm);
         continue;
     }
      }
       if ((tag == 'SELECT') && eltWithPressEvent(elt, 'mouse'))
          {
           offsets = ddom.nodeToSourceViewOffsets(elt);
           msg = this.getRuleMessage('select');
           thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
     if (isEditable(ddom, elt)) {
         wrong.push(thisPbm);
         continue;
     }
    }
      }
  return wrong;
 }

registerRule(new spcLgcRtDDEvHndScr());



// return true if elt has one of key or mouse press event handlers as attribute
// who = keyboard : keyboard event handlers
// who = mouse : mouse event handlers
// who = both : both keyboard and mouse event handlers
function eltWithPressEvent(elt, who)
 {
  var m_e, attr;
  var events = new Array();
  var res = false;

  if (! who)
      who = 'both';
  if (who == 'keyboard' || who == 'both')
      events = new Array('ONKEYPRESS','ONKEYDOWN','ONKEYUP');
  if (who == 'mouse' || who == 'both')
     {
      m_e = new Array('ONCLICK','ONDBLCLICK','ONMOUSEDOWN','ONMOUSEUP');
      events = events.concat(m_e);
     }

  for (var i = 0; i < events.length; i++)
      {
       attr = elt.getAttribute(events[i]);
       if (isDefinedAttr(attr))
          {
     res = true;
     break;
          }
      }
  return res;
 }



/******************************************************************************
 *
 *       rule winAppWttInfUsr     (WCAG 10.1 - First - Auto)
 *
 *****************************************************************************/
// Until user agents allow users to turn off spawned windows, do not cause
// pop-ups or other windows to appear and do not change the current window
// without informing the user.

function winAppWttInfUsr()
 {
  this.ruleID = 'winAppWttInfUsr';
 }

winAppWttInfUsr.prototype = new Rule();

winAppWttInfUsr.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, link;
  var wrong = new Array();
  var links = new Array();

  ddom  = fileAttr.DOM;
  links = links.concat(ddom.getElementsByTagName('A'));
  links = links.concat(ddom.getElementsByTagName('AREA'));
  links = links.concat(ddom.getElementsByTagName('FORM'));
  links = links.concat(ddom.getElementsByTagName('INPUT'));

  for (var i = 0; i < links.length; i++)
      {
       link = links[i];
       if (! link)
           continue;
       if (link_hasWrongTarget(link))
          {
           // FAILED
           offsets = ddom.nodeToSourceViewOffsets(link);
           thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
     if (isEditable(ddom, link))
         wrong.push(thisPbm);
          }
       if (link_javascriptWithOpen(ddom, link) || hasOnclickWithOpen(ddom, link))
          {
           // FAILED
           offsets = ddom.nodeToSourceViewOffsets(link);
           thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
     if (isEditable(ddom, link))
         wrong.push(thisPbm);
          }
      }
  return wrong;
 }

registerRule(new winAppWttInfUsr());


// --------------------------------------------------
// Functions to test if browser opens new window
// --------------------------------------------------

// return 1 iff elt (a LINK|A|AREA|FORM) has target=_blank or target=NAME
function link_hasWrongTarget(elt)
{
 var res, tgt;

 var goodnames = {_self: true, _top: true, _parent: true};
 res = false;
 tgt = elt.getAttribute('TARGET');
 if (! isDefinedAttr(tgt) || ! tgt)
     return res;
 if (! goodnames[tgt.toLowerCase()])
     res = true;
 return res;
}


// return 1 iff elt (a LINK|A|AREA|FORM) has a href|src with javascript:open(...)
function link_javascriptWithOpen(doc, elt)
{
 var bad, res, url;

 bad = new RegExp('window\\.open\\(','ig');
 res = false;
 url = get_url(elt).toLowerCase();
 if (url.indexOf('javascript:') == 0)
    {
     if (url.search(bad) != -1)
         res = true;
     else res = false;
    }
 return res;
}


// return 1 iff elt has an onclick or onkeypress attribute that contains open()
function hasOnclickWithOpen(doc, elt)
{
 var bad, res, onclick, onkeypress;

 bad = new RegExp('window\\.open\\(','ig');
 res = false;
 onclick = elt.getAttribute('ONCLICK');
 if (isDefinedAttr(onclick))
    {
     if (onclick.search(bad) != -1)
         res = true;
     else res = false;
    }
 onkeypress = elt.getAttribute('ONKEYPRESS');
 if (isDefinedAttr(onkeypress))
    {
     if (onkeypress.search(bad) != -1)
         res = res || true;
     else res = res || false;
    }
 return res;
}



/******************************************************************************
 *
 *       rule popAppWttInfUsr     (WCAG 10.1 - Second - Auto)
 *
 *****************************************************************************/
// Until user agents allow users to turn off spawned windows, do not cause
// pop-ups or other windows to appear and do not change the current window
// without informing the user.

function popAppWttInfUsr()
 {
  this.ruleID = 'popAppWttInfUsr';
 }

popAppWttInfUsr.prototype = new Rule();

popAppWttInfUsr.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, bad, ddom, bodies, scripts, scrText, onload, msg;
  var wrong = new Array();

  ddom  = fileAttr.DOM;
  bad = new RegExp("window\\.open\\(", "i");
  bodies = ddom.getElementsByTagName('BODY');
  if (bodies.length)
     {
      onload = bodies[0].getAttribute('ONLOAD');
      if (isDefinedAttr(onload))
         {
          if (onload.search(bad) != -1)
             {
              offsets = ddom.nodeToSourceViewOffsets(bodies[0]);
              msg = this.getRuleMessage('body');                             // FAILED
              thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
        if (isEditable(ddom, bodies[0]))
      wrong.push(thisPbm);
             }
   }
    }

 // Get all script elements
 scripts = ddom.getElementsByTagName('SCRIPT')
 for (var i = 0; i < scripts.length; i++)
     {
      scrText = getNodeText(scripts[i]);
      if (scrText.search(bad) != -1)
         {
          offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
          msg = this.getRuleMessage('page');                             // FAILED
          thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
          wrong.push(thisPbm);
          break;
         }
     }
  return wrong;
 }

registerRule(new popAppWttInfUsr());



/******************************************************************************
 *
 *       rule implAssLblFrmCtrlPrPos     (WCAG 10.2 - Manual)
 *
 *****************************************************************************/
// Until user agents support explicit associations between labels and form
// controls, for all form controls with implicitly associated labels, ensure
// that the label is properly positioned.
//
// Note: The test checks if FORM controls (text fields, menus, radio buttons
//       contain any sub element (like INPUT, LABEL, TEXTAREA, SELECT).

function implAssLblFrmCtrlPrPos()
 {
  this.ruleID = 'implAssLblFrmCtrlPrPos';
 }

implAssLblFrmCtrlPrPos.prototype = new Rule();

implAssLblFrmCtrlPrPos.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, frms, frm, numEls, descends, i, j, type;
  var wrong = new Array();

  ddom  = fileAttr.DOM;
  frms = ddom.getElementsByTagName('FORM');
  if (frms.length == 0)
      return wrong;

  // Check every form control for internal sub elements
  for (i = 0; i < frms.length; i++)
      {
       frm = frms[i];
       numEls = 0;
       // Find INPUT subelements related to LABELs
       descends = getDescendants(frm, 'INPUT');
       for (j = 0; j < descends.length; j++)
           {
            type = descends[j].getAttribute('TYPE');
            if (isDefinedAttr(type))
               {
                type = type.toUpperCase();
                if ((type != 'HIDDEN') && (type != 'BUTTON') && (type != 'IMAGE') &&
                    (type != 'SUBMIT') && (type != 'RESET'))
                   {
                    numEls++;
                    break;
                   }
               }
           }
       if (numEls == 0)
          {
           // Find other subelements related to LABELs
           descends = getDescendants(frm, 'SELECT');
           numEls = descends.length;
           descends = getDescendants(frm, 'TEXTAREA');
           numEls += descends.length;
          }
       if (numEls > 0)
          {
           // MANUAL: some sub elements found
           offsets = ddom.nodeToSourceViewOffsets(frm);
           thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
     if (isEditable(ddom, frm))
         wrong.push(thisPbm);
          }
      }
  return wrong;
 }

registerRule(new implAssLblFrmCtrlPrPos());



/******************************************************************************
 *
 *       rule useLstW3CTch     (WCAG 11.1 - Manual)
 *
 *****************************************************************************/
// Use W3C technologies when they are available and appropriate for a task and
// use the latest versions when supported.

function useLstW3CTch()
 {
  this.ruleID = 'useLstW3CTch';
 }

useLstW3CTch.prototype = new Rule();

useLstW3CTch.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom;
  var wrong = new Array();

  ddom  = fileAttr.DOM;
   // Alwais MANUAL
  offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
  thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
  wrong.push(thisPbm);
  return wrong;
 }

registerRule(new useLstW3CTch());



/******************************************************************************
 *
 *       rule avdDepFtW3CTch     (WCAG 11.2 - Auto)
 *
 *****************************************************************************/
// Avoid deprecated features of W3C technologies.

function avdDepFtW3CTch()
 {
  this.ruleID = 'avdDepFtW3CTch';
 }

avdDepFtW3CTch.prototype = new Rule();

avdDepFtW3CTch.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, attr, vect, deprElems, deprAttrs, elts, i, j;
  var wrong = new Array();

  ddom  = fileAttr.DOM;
  elts = getAllNodeElements(ddom.documentElement);
  deprElems = getDeprElems();
  deprAttrs = getDeprAttrs();
  for (i = 0; i < elts.length; i++)
      {
       // Check if current element is deprecated
       for (j = 0; j < deprElems.length; j++)
            if (elts[i].tagName.toUpperCase() == deprElems[j])
               {
                // FAILED
                offsets = ddom.nodeToSourceViewOffsets(elts[i]);
                thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS);
    if (isEditable(ddom, elts[i])) {
        wrong.push(thisPbm);
        return wrong;
    }
               }
       // Compare deprecated attributes of current element
       vect = deprAttrs[elts[i].tagName.toUpperCase()];
       if ((vect != null) && (vect != 'undefined'))
          {
           for (j = 0; j < vect.length; j++)
               {
                attr = elts[i].getAttribute(vect[j]);
                if (isDefinedAttr(attr))
                   {
                    // FAILED
                    offsets = ddom.nodeToSourceViewOffsets(elts[i]);
                    thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS);
        if (isEditable(ddom, elts[i])) {
      wrong.push(thisPbm);
      return wrong;
        }
       }
               }
          }
      }
  return wrong;
 }

registerRule(new avdDepFtW3CTch());


//////////////////////////////////////////////
// Definition of functions used by this rule
//////////////////////////////////////////////

function getDeprElems()
{
 // Structure of HTML 4.01 elements deprecated
 var deprElems = new Array("APPLET", "BASEFONT", "CENTER", "DIR", "FONT", "ISINDEX", "MENU",
                           "S", "STRIKE", "U", "LISTING", "PLAINTEXT", "XMP");
 return deprElems;
}


function getDeprAttrs()
{
 // Structure of HTML 4.01 attributes deprecated
 var elem, attr;

 // Get structure of layout elements deprecated
 var deprAttrs = getDeprStyleAttrs();
 // Add other elements deprecated
 var depat_dl = new Array("COMPACT");
 deprAttrs["DL"] = depat_dl;
 elem = deprAttrs["OL"];
 elem.push("COMPACT");
 elem = deprAttrs["UL"];
 elem.push("COMPACT");
 var depat_script = new Array("LANGUAGE");
 deprAttrs["SCRIPT"] = depat_script;
 var depat_html = new Array("VERSION");
 deprAttrs["HTML"] = depat_html;
 return deprAttrs;
}



/******************************************************************************
 *
 *       rule dscFrmRlshTtNoClr     (WCAG 12.2 - First - Manual)
 *
 *****************************************************************************/
// Describe the purpose of frames and how frames relate to each other if it is
// not obvious by frame titles alone.

function dscFrmRlshTtNoClr() {
    this.ruleID = 'dscFrmRlshTtNoClr';
}

dscFrmRlshTtNoClr.prototype = new Rule();

dscFrmRlshTtNoClr.prototype.findPbms = function (fileAttr, session) {
    var wrong = new Array();
    var ddom = fileAttr.DOM;
    var frames = ddom.getElementsByTagName('FRAME');
    for (var i = 0; i < frames.length; i++) {
        var frame = frames[i];
        var res = hasValidTitle(frame);
        if (res == true) {
      var longdescURL = frame.getAttribute('longdesc');
      if (! isDefinedAttr(longdescURL)) {
          if (! isEditable(ddom, frame))
        continue;
    var offsets = ddom.nodeToSourceViewOffsets(frame);
    var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
    wrong.push(thisPbm);
      }
  }
    }
    return wrong;
}

registerRule(new dscFrmRlshTtNoClr());



/******************************************************************************
 *
 *       rule FRAME_vLDESC     (WCAG 12.2 - Second - Automatic)
 *
 *****************************************************************************/
// Describe the purpose of frames and how frames relate to each other if it is
// not obvious by frame titles alone.

function FRAME_vLDESC() {
    this.ruleID = 'FRAME_vLDESC';
}

FRAME_vLDESC.prototype = new Rule();

FRAME_vLDESC.prototype.findPbms = function (fileAttr, session) {
    var wrong = new Array();
    var ddom = fileAttr.DOM;
    var frames = ddom.getElementsByTagName('FRAME');
    for (var i = 0; i < frames.length; i++) {
        var frame = frames[i];
        var res = hasValidTitle(frame);
        if (res != true)
      continue;
  var longdescURL = frame.getAttribute('longdesc');
  if (! isDefinedAttr(longdescURL))
      continue;
  if (! isEditable(ddom, frame))
      continue;
  if (! longdescURL) {
      var offsets = ddom.nodeToSourceViewOffsets(frame);
      var msg = this.getRuleMessage('LD_attr_empty');
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
      wrong.push(thisPbm);
  } else if (! stripString(longdescURL)) {
      var offsets = ddom.nodeToSourceViewOffsets(frame);
      var msg = this.getRuleMessage('LD_attr_blank');
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
      wrong.push(thisPbm);
  } else {
            res = isValidURL(longdescURL, fileAttr.URL, 'html');
            if (res != true) {
    var offsets = ddom.nodeToSourceViewOffsets(frame);
    var msg = this.getRuleMessage('LD_url_' + res);
    var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
    wrong.push(thisPbm);
      }
  }
    }

    return wrong;
}

registerRule(new FRAME_vLDESC());



/******************************************************************************
 *
 *       rule dvdInfAppMngGrp     (WCAG 12.3 - Manual)
 *
 *****************************************************************************/
// Divide large blocks of information into more manageable groups where natural
// and appropriate.

function dvdInfAppMngGrp() {
    this.ruleID = 'dvdInfAppMngGrp';
}

dvdInfAppMngGrp.prototype = new Rule();

dvdInfAppMngGrp.prototype.findPbms = function (fileAttr, session) {
    var thisPbm, offsets, ddom;
    var wrong = new Array();

    ddom  = fileAttr.DOM;
    // MANUAL on entire document (HTML element)
    offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
    thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
    wrong.push(thisPbm);
    return wrong;
}

registerRule(new dvdInfAppMngGrp());



/******************************************************************************
 *
 *       rule assLblExpCtrl     (WCAG 12.4 - Auto)
 *
 *****************************************************************************/
// Associate labels explicitly with their controls.
//
// Note: The test checks if the FORM controls (text fields, menus, radio
//       buttons) are explicitly associated with a LABEL element.

function assLblExpCtrl()
 {
  this.ruleID = 'assLblExpCtrl';
 }

assLblExpCtrl.prototype = new Rule();

assLblExpCtrl.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, labels, for_id, control, id, type,
      frms, frm, i, j, descends, msg;
  var wrong = new Array();
  var for_ids = new Array();
  var controls = new Array();

  ddom  = fileAttr.DOM;
  frms = ddom.getElementsByTagName('FORM');
  if (frms.length == 0)
      return wrong;
  // Get for every form control its internal sub elements
  for (i = 0; i < frms.length; i++)
      {
       frm = frms[i];
       // Get INPUT subelements related to LABELs
       descends = getDescendants(frm, 'INPUT');
       for (j = 0; j < descends.length; j++)
           {
            type = descends[j].getAttribute('TYPE');
            if (isDefinedAttr(type))
               {
                type = type.toUpperCase();
                if ((type != 'HIDDEN') && (type != 'BUTTON') && (type != 'IMAGE') &&
                    (type != 'SUBMIT') && (type != 'RESET'))
                    controls.push(descends[j]);
               }
      else
    // INPUT of implicit type TEXT
    controls.push(descends[j]);
           }
       // Get other subelements related to LABELs
       descends = getDescendants(frm, 'SELECT');
       controls = controls.concat(descends);
       descends = getDescendants(frm, 'TEXTAREA');
       controls = controls.concat(descends);
      }
  if (controls.length == 0)
      return wrong;

  // values of all LABELs FOR attributes
  labels = ddom.getElementsByTagName('LABEL');
  for (i = 0; i < labels.length; i++)
      {
       for_id = labels[i].getAttribute('FOR');
       if (isDefinedAttr(for_id))
           for_ids.push(stripString(for_id));
      }
  // check each control
  for (i = 0; i < controls.length; i++)
      {
       response = '_nolabel';
       control = controls[i];
       id = control.getAttribute('ID');
       if (isDefinedAttr(id))
      {
     id = stripString(id);
     // ID is alwais considered as valid in UNWCAGP2
           for (j = 0; j < for_ids.length; j++)
         {
          if (for_ids[j] == id)
             {
              response = 'found';
              break;
             }
         }
    }
       // a label was found
       if (response == 'found')
           continue;
       // maybe it is implicit association ?
       if ((response == '_nolabel') &&  hasAncestor('LABEL', control))
           continue;
       // now understant what type of control it is
       if (control.tagName.toUpperCase() == 'INPUT')
    {
     type = control.getAttribute('TYPE');
     if (! isDefinedAttr(type))
         type = 'text';
     response = type.toLowerCase() + response;
    }
       else response = control.tagName.toLowerCase() + response;
       offsets = ddom.nodeToSourceViewOffsets(control);
       msg = this.getRuleMessage(response);
       thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
       if (isEditable(ddom, control))
           wrong.push(thisPbm);
      }
  return wrong;
 }

registerRule(new assLblExpCtrl());



/******************************************************************************
 *
 *       rule clrIdtTrgLnk     (WCAG 13.1 - First - Manual)
 *
 *****************************************************************************/
// Clearly identify the target of each link.

function clrIdtTrgLnk()
 {
  this.ruleID = 'clrIdtTrgLnk';
 }

clrIdtTrgLnk.prototype = new Rule();

clrIdtTrgLnk.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, AElts, AElt, href, title, imgElts,
      A_Textual, msg;
  var wrong = new Array();

  ddom  = fileAttr.DOM;
  // Check if document contains A elements with a definite HREF attribute, but
  // without any images (except spacers)
  AElts = ddom.getElementsByTagName('A');
  for (var i = 0; i < AElts.length; i++)
      {
       AElt = AElts[i];
       href = AElt.getAttribute('HREF');
       if (isDefinedAttr(href))
          {
           imgElts = AElt.getElementsByTagName('IMG');
           A_Textual = true;
           if (imgElts.length > 0)
              {
               for (var j = 0; j < imgElts.length; j++)
                   {
                    if (! isSpacer(fileAttr, imgElts[j]))
                       {
                        A_Textual = false;
                        break;
                       }
                   }
              }
           // If the document contains required elements, then MANUAL occurs
           // only if TITLE attribute is not defined or is empty/blank
           if (A_Textual)
              {
               title = AElt.getAttribute('TITLE');
               if (! isDefinedAttr(title))
                  {
                   offsets = ddom.nodeToSourceViewOffsets(AElt);
                   msg = this.getRuleMessage('no_title');
                   thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS, msg);
       if (isEditable(ddom, AElt))
           wrong.push(thisPbm);
                  }
               else {
                     title = stripString(title);
                     if ((title == "") || (title == " "))
                        {
                         offsets = ddom.nodeToSourceViewOffsets(AElt);
                         msg = this.getRuleMessage('not_mean');
                         thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS, msg);
       if (isEditable(ddom, AElt))
           wrong.push(thisPbm);
                        }
                    }
              }
          }
      }
  return wrong;
 }

registerRule(new clrIdtTrgLnk());



/******************************************************************************
 *
 *       rule useMngLblLnk     (WCAG 13.1 - Second - Auto)
 *
 *****************************************************************************/
// Use meaningful labels for links. Avoid generic poor labels for the target
// of each link.

function useMngLblLnk()
 {
  this.ruleID = 'useMngLblLnk';
 }

useMngLblLnk.prototype = new Rule();

useMngLblLnk.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, AElts, href, title, imgElts, A_Textual,
      nAText, text, AElt, re, msg;
  var wrong = new Array();

  ddom  = fileAttr.DOM;
  // Check if document contains A elements with a definite HREF attribute, but
  // without any images (except spacers)
  AElts = ddom.getElementsByTagName('A');
  // String "click here" or "click" or "here" or "go"
  var re = new RegExp("^\\s*(" + dw.loadString("508asoem/r/link_titles") + ")\\s*$", "i");
  nAText = 0;
  for (var i = 0; i < AElts.length; i++)
      {
       AElt = AElts[i];
       href = AElt.getAttribute('HREF');
       if (isDefinedAttr(href))
          {
           imgElts = AElt.getElementsByTagName('IMG');
           A_Textual = true;
           if (imgElts.length > 0)
              {
               for (var j = 0; j < imgElts.length; j++)
                   {
                    if (! isSpacer(fileAttr, imgElts[j]))
                       {
                        A_Textual = false;
                        break;
                       }
                   }
              }
           // If the document contains required elements, we check their content
           if (A_Textual)
              {
               nAText++;
               text = getNodeText(AElt);
               if (text && (text.search(re) != -1))
                  {
                   // FAILED if A content is similar to "click here"
                   // or "click" or "here" or "go"
                   offsets = ddom.nodeToSourceViewOffsets(AElt);
                   msg = this.getRuleMessage('content');
                   thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
       if (isEditable(ddom, AElt))
           wrong.push(thisPbm);
                  }
               title = AElt.getAttribute('TITLE');
               if (isDefinedAttr(title) && (title.search(re) != -1))
                  {
                   // FAILED if TITLE attribute content is similar to "click here"
                   // or "click" or "here" or "go"
                   offsets = ddom.nodeToSourceViewOffsets(AElt);
                   msg = this.getRuleMessage('title');
                   thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
       if (isEditable(ddom, AElt))
           wrong.push(thisPbm);
                  }
              }
          }
      }
  return wrong;
 }

registerRule(new useMngLblLnk());



/******************************************************************************
 *
 *       rule sameLnkDiffUrls     (WCAG 13.1 - Third - Auto)
 *
 *****************************************************************************/
// Use meaningful labels for links. Avoid generic poor labels for the target
// of each link.

function sameLnkDiffUrls() {
    this.ruleID = 'sameLnkDiffUrls';
}

sameLnkDiffUrls.prototype = new Rule();

sameLnkDiffUrls.prototype.findPbms = function (fileAttr, session) {
    var wrong = new Array();

    var ddom = fileAttr.DOM;
    var links_dict = new Array();

    // Check if document contains links with the same phrase that points
    // to different urls
    var Aelts = ddom.getElementsByTagName('A');
    var base_url = fileAttr.URL;
    for (var i=0; i<Aelts.length; i++) {
        var Aelt = Aelts[i];

  var Aelt_href = Aelt.getAttribute('HREF');
  if (isDefinedAttr(Aelt_href)) {
      Aelt_href = stripString(Aelt_href, "left");
      Aelt_href = stripString(Aelt_href, "right");
      var text = stripString(_getLinkEquivText(Aelt));
      text = text.toLowerCase();
      var title = Aelt.getAttribute('TITLE');
      if (isDefinedAttr(title)) {
    title = stripString(title.toLowerCase());
      } else
          title= '';
      var key = text + ' ' + title;
      if (key) {
          if (! links_dict[key])
        links_dict[key] = Aelt;
    else {
        var Aelt2 = links_dict[key];
        var Aelt2_href = Aelt2.getAttribute('HREF');
        if (isDefinedAttr(Aelt2_href)) {
            Aelt2_href = stripString(Aelt2_href, "left");
            Aelt2_href = stripString(Aelt2_href, "right");
        } else Aelt2_href = "";
        var absLinkURL = makeAbsoluteURL(Aelt_href, base_url);
        var absLinkURL2 = makeAbsoluteURL(Aelt2_href, base_url);
        var title2 = Aelt2.getAttribute('TITLE');
        if (isDefinedAttr(title2)) {
            title2 = stripString(title2.toLowerCase());
        } else
            title2 = '';
        if ((absLinkURL != absLinkURL2) && (title == title2)) {
      if (isEditable(ddom, Aelt)) {
          var offsets = ddom.nodeToSourceViewOffsets(Aelt);
          thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS);
          wrong.push(thisPbm);
      }
        }
    }
      }
  }
    }

    return wrong;
}

registerRule(new sameLnkDiffUrls());


// Return all text and image ALT attributes inside a link.
function _getLinkEquivText(Aelt) {
    var text = '';
    var nodes = Aelt.childNodes;
    for (var i=0; i<nodes.length; i++) {
        var node = nodes[i];
        if (node.nodeType == Node.TEXT_NODE) {
            text += stripString(node.data);
  } else if (node.tagName == 'IMG') {
      var img_alt = node.getAttribute('alt');
      if (isDefinedAttr(img_alt)) {
               img_alt = stripString(img_alt);
               text += img_alt;
      }
        } else
      text += _getLinkEquivText(node);
    }
    return text;
}


/******************************************************************************
 *
 *       rule prvMtdtPgSt     (WCAG 13.2 - First - Auto)
 *
 *****************************************************************************/
// Provide metadata to add semantic information to pages and sites.

function prvMtdtPgSt()
 {
  this.ruleID = 'prvMtdtPgSt';
 }

prvMtdtPgSt.prototype = new Rule();

prvMtdtPgSt.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, elts, rev, rel, found, i, j;
  var wrong = new Array();
  // LINK Types
  var relAttrLink = new Array("ALTERNATE", "START", "NEXT", "PREV", "CONTENTS",
                              "INDEX", "GLOSSARY", "COPYRIGHT", "CHAPTER",
                              "SECTION", "SUBSECTION", "APPENDIX", "HELP",
                              "BOOKMARK", "HOME", "TOP", "ORIGIN", "PARENT",
                              "UP", "BEGIN", "FIRST", "CHILD", "PREVIOUS",
                              "END", "LAST", "AUTHOR", "MADE", "TOC");

  ddom  = fileAttr.DOM;
  // Check if document contains LINK elements with a definite REL attribute
  elts = ddom.getElementsByTagName('LINK');
  found = false;
  for (i = 0; i < elts.length; i++)
      {
       // Check REL attribute
       rel = elts[i].getAttribute('REL');
       if (isDefinedAttr(rel))
          {
           rel = rel.toUpperCase();
           for (j = 0; j < relAttrLink.length; j++)
                if (rel == relAttrLink[j])
                    {
                     found = true;
                     break;
                    }
           if (found) break;
          }
       // Check REV attribute
       rev = elts[i].getAttribute('REV');
       if (isDefinedAttr(rev))
          {
           rev = rev.toUpperCase();
           for (j = 0; j < relAttrLink.length; j++)
                if (rev == relAttrLink[j])
                   {
                    found = true;
                    break;
                   }
           if (found) break;
          }
      }
  if (! found)
      // No valid REL/REV attributes for LINK elements: FAILED
     {
      offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
      thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS);
      wrong.push(thisPbm);
     }
  return wrong;
 }

registerRule(new prvMtdtPgSt());



/******************************************************************************
 *
 *       rule validPageTitle     (WCAG 13.2 - Second - Auto)
 *
 *****************************************************************************/
// Provide metadata to add semantic information to pages and sites.

function validPageTitle() {
    this.ruleID = 'validPageTitle';
}

validPageTitle.prototype = new Rule();

validPageTitle.prototype.findPbms = function (fileAttr, session) {
    var wrong = new Array();
    var max_title_length = 64;
    var ddom = fileAttr.DOM;
    var TITLEs = ddom.getElementsByTagName('TITLE');
    if (TITLEs.length == 0) {
  var offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
  var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS);
  wrong.push(thisPbm);
  return wrong;
    }
    if (TITLEs.length > 1){
  var issueAdded = false;
  for (var i=1; i<TITLEs.length; i++) { // skip first one
      var title = TITLEs[i];
      if (isEditable(ddom, title)) {
    var offsets = ddom.nodeToSourceViewOffsets(title);
    var msg = this.getRuleMessage('toomany');
    var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
    wrong.push(thisPbm);
    issueAdded = true;
      }
  }
  if ((! issueAdded) && isEditable(ddom, TITLEs[0])) {
      var offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
      var msg = this.getRuleMessage('toomany');
      var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
      wrong.push(thisPbm);
  }
    }
    var html_regexp = new RegExp('<.+>','g');
    // let's work on first one
    var title = TITLEs[0];
    if (! title){ //weird situation
  var offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
  var msg = this.getRuleMessage('none');
  var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
  wrong.push(thisPbm);
  return wrong;
    }
    if (! isEditable(ddom, title)) {
  return wrong;
    }
    if (! hasAncestor('HEAD', title)) {
  var offsets = ddom.nodeToSourceViewOffsets(title);
  var msg = this.getRuleMessage('nothead');
  var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
  wrong.push(thisPbm);
    }
    var text = getNodeText(title);
    if (stripString(text) != '' && isPoorText_validPageTitle(text)) {
  var offsets = ddom.nodeToSourceViewOffsets(title);
  var msg = this.getRuleMessage('placeholder');
  var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
  wrong.push(thisPbm);
  return wrong;
    }
    if (stripString(text).length > max_title_length) {
  var offsets = ddom.nodeToSourceViewOffsets(title);
  var msg = this.getRuleMessage('toolong');
  var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
  wrong.push(thisPbm);
    }
    if (text.search(html_regexp) != -1) {
        /* Never triggered: in fact in this case TITLEs is empty :-( */
  var offsets = ddom.nodeToSourceViewOffsets(title);
  var msg = this.getRuleMessage('html');
  var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
  wrong.push(thisPbm);
    }
    if (stripString(text) == '') {
  var offsets = ddom.nodeToSourceViewOffsets(title);
  var msg = this.getRuleMessage('empty');
  var thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, FAILED_STATUS, msg);
  wrong.push(thisPbm);
    }

    return wrong;
}

registerRule(new validPageTitle());


// Evaluates parameter 'text'. If it is empty, or it contains one of following
// specified words, it judges the string as poor.
function isPoorText_validPageTitle(text)
{
    // The strings below are defined in 508ASOEMStrings.xml
    var re = new RegExp('^\\s*(' + dw.loadString('508asoem/r/page_titles') + ')\\s*$', 'i');
    var isPoor = true;

    text = stripString(text);
    if (text) {
      isPoor = re.test(text);
    }
    return isPoor;
}

/******************************************************************************
 *
 *       rule prvInfGnrLytSt     (WCAG 13.3 - Manual)
 *
 *****************************************************************************/
// Provide information about the general layout of a site (e.g., a site map or
// table of contents).

function prvInfGnrLytSt()
 {
  this.ruleID = 'prvInfGnrLytSt';
 }

prvInfGnrLytSt.prototype = new Rule();

prvInfGnrLytSt.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom;
  var wrong = new Array();

  ddom  = fileAttr.DOM;
  // Blind rule: MANUAL
  offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
  thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
  wrong.push(thisPbm);
  return wrong;
 }

registerRule(new prvInfGnrLytSt());



/******************************************************************************
 *
 *       rule useNvgMchApp     (WCAG 13.4 - Manual)
 *
 *****************************************************************************/
// Use navigation mechanisms in a consistent manner.

function useNvgMchApp()
 {
  this.ruleID = 'useNvgMchApp';
 }

useNvgMchApp.prototype = new Rule();

useNvgMchApp.prototype.findPbms = function (fileAttr, session)
 {
  var thisPbm, offsets, ddom, links, link, href, nlk;
  var wrong = new Array();

  ddom  = fileAttr.DOM;
  nlk = 0;
  links = ddom.getElementsByTagName('A');
  // Search for a navigation bar on document (ie, for UNWCAGP2, more than 3 links)
  for (var i = 0; i < links.length; i++)
      {
       link = links[i];
       href = link.getAttribute('HREF');
       if (isDefinedAttr(href))
          {
           nlk++;
           if (nlk > 3) break;
          }
      }
  if (nlk > 3)
     {
      // Probably found a navigation bar: MANUAL
      offsets = ddom.nodeToSourceViewOffsets(ddom.documentElement);
      thisPbm = makeUsabPbm(this.ruleID, fileAttr, offsets, MANUAL_STATUS);
      wrong.push(thisPbm);
     }
  return wrong;
 }

registerRule(new useNvgMchApp());


/* end of wcagp2_rules.js */
