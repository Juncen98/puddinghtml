/*
 * 505/W3C Accessibility Suite OEM V2 for Macromedia Dreamweaver
 * (C) Copyright 2001-2005 UsableNet Inc. All rights reserved.
 */
/* $Id: utilities.js,v 1.11 2005/04/13 12:59:16 malex Exp $ */


/***********************************************************
 *
       isDefinedAttr()
 * getAttribute() may return also "undefined", which is
 * not documented in the DW manual
 *
 * Use this function to test an attribute
 *
 **********************************************************/

function isDefinedAttr(value) {
  // return true if value is not NULL and not 'undefined'
  return ((value != null) && (value != 'undefined'));
}


/***********************************************************
 *
       getUrlType()
 *
 **********************************************************/

AUDIO_FILE_EXTENSIONS = [/\.wav\s*$/i, /\.au\s*$/i, /\.snd\s*$/i, /\.dwd\s*$/i, /\.iff\s*$/i,
                         /\.svx\s*$/i, /\.sam\s*$/i, /\.smp\s*$/i, /\.vce\s*$/i, /\.voc\s*$/i,
                         /\.pcm\s*$/i, /\.aif\s*$/i, /\.mp3\s*$/i, /\.mp2\s*$/i, /\.mpa\s*$/i, /\.abs\s*$/i, /\.mpega\s*$/i, /\.wma\s*$/i, /\.vqf\s*$/i];

IMGS_FILE_EXTENSIONS  = [/\.gif\s*$/i, /\.jpg\s*$/i, /\.png\s*$/i, /\.jpeg\s*$/i, /\.jpe\s*$/i];

VIDEO_FILE_EXTENSIONS = [/\.mpeg\s*$/i, /\.mpg\s*$/i, /\.mpe\s*$/i, /\.mpv\s*$/i, /\.vbs\s*$/i,
                         /\.mpegv\s*$/i, /\.mpv2\s*$/i, /\.mp2v\s*$/i, /\.qt\s*$/i, /\.mov\s*$/i,
                         /\.moov\s*$/i, /\.avi\s*$/i, /\.flc\s*$/i, /\.fli\s*$/i,
                         /\.vfw\s*$/i, /\.qtc\s*$/i];
MM_FILE_EXTENSIONS    = [/\.swf\s*$/i, /\.spl\s*$/i, /\.scm\s*$/i, /\.ppt\s*$/i, /\.pot\s*$/i, /\.ppa\s*$/i,
                         /\.pps\s*$/i, /\.pwz\s*$/i, /\.exe\s*$/i, /\.bin\s*$/i, /\.jar\s*$/i, /\.ra\s*$/i,
                         /\.ram\s*$/i, /\.rpm\s*$/i, /\.xls\s*$/i, /\.spl\s*$/i, /\.dcr\s*$/i, /\.dir\s*$/i,
                         /\.dxr\s*$/i, /\.m15\s*$/i, /\.m75\s*$/i, /\.mpa\s*$/i, /\.m1a\s*$/i, /\.m1v\s*$/i, /\.mpm\s*$/i];

function getUrlType(url) {
  if ((url == null) || (url == "undefined"))
    return 'unknown/';
  for (var i=0;i<AUDIO_FILE_EXTENSIONS.length; i++) {
      var ext = AUDIO_FILE_EXTENSIONS[i];
      if (ext.exec(url))
  return 'audio/';
  }
  for (var i=0;i<IMGS_FILE_EXTENSIONS.length; i++) {
      var ext = IMGS_FILE_EXTENSIONS[i];
      if (ext.exec(url))
  return 'image/';
  }
  for (var i=0;i<VIDEO_FILE_EXTENSIONS.length; i++) {
      var ext = VIDEO_FILE_EXTENSIONS[i];
      if (ext.exec(url))
  return 'video/';
  }
  for (var i=0;i<MM_FILE_EXTENSIONS.length; i++) {
      var ext = MM_FILE_EXTENSIONS[i];
      if (ext.exec(url))
  return 'application/';
  }
  return 'unknown/';
}

/***********************************************************
 *
       getEmbedMime()
 *
 **********************************************************/

function getEmbedMime(elt) {
  var type = elt.getAttribute('type');
  if (type != null) return type;
  var src = elt.getAttribute('src');
  return getUrlType(src);
}

/***********************************************************
 *
       getObjectMime()
 *
 **********************************************************/

function getObjectMime(elt) {
  var type = elt.getAttribute('type');
  if (type != null) return type;
  var data = elt.getAttribute('data');
  type =  getUrlType(data);
  if (type != 'unknown/')
    return type;
  var classid = elt.getAttribute('classid');
  if (classid != null) return 'applet/';
  return 'unknown/';
}

/***********************************************************
 *
       hasValidALT()
 *
   given a string and an element check if is a valid ALT
   descriptor for the element;
   return a boolean
   type is 'spacer' | 'nonspacer'
   a valid ALT for nonspacer is such that:
   - not null;
   - not the empty string
   - not the blank string (except if img is within the A element)
   - not longer than 150 chars
   - not the "NNN bytes" string
   - not ending with a file name XXXXX.YYY where YYY is an image file extension
   - not containing placeholder text
   a valid ALT for spacer is such that:
   - not null;
   - blank;
   - empty;

   See below an extended version of this function.
   */
MAX_ALT_LENGTH = 150;
        /* the following are trivial regexp */
IMAGE_FILE_EXTENSIONS  = [/\w+\.gif/i, /\w+\.jpg/i, /\w+\.png/i, /\w+\.jpeg/i, /\w+\.jpe/i];
APPLET_FILE_EXTENSIONS = [/\w+\.class/i, /\w+\.java/i, /\w+\.jar/i, /\w+\.zip/i];

IMAGE_PLACE_HOLDERS = [/photo.?$/i, /image.?$/i];


function hasValidALTxxx(imgElt,type)
  // [GB: 26May01]
  // OBSOLETE: use hasValidALT2()
{
  var alt = imgElt.getAttribute('alt');
  var file = imgElt.getAttribute('src');
  if (alt == null) return false;
  if (type == 'spacer'){
    if (alt == "") return true;
    /* remove white spaces */
    if (/\S+/g.exec(alt)) /* some non space */
      return false;
    return true;
  }
  if (type == 'nonspacer'){
    if (alt == "") return false;
    if (alt.length > MAX_ALT_LENGTH) return false;
    if (/<.+>/.exec(alt)) return false; // HTML tags inside
    var pattern = /\d+\s+bytes/i ; /* eg. 130 Bytes */
    if (pattern.exec(alt)) return false;
    for (i=0;i<IMAGE_FILE_EXTENSIONS.length; i++) {
      var ext = IMAGE_FILE_EXTENSIONS[i];
      if (ext.exec(alt)) {
  return false;
      }}
    for (i=0; i< IMAGE_PLACE_HOLDERS.length; i++) {
      var ph = IMAGE_PLACE_HOLDERS[i];
      if (ph.exec(alt)) {
  return false;
      }}
    /* remove white spaces */
    alt.replace(/\s+/g, "");
    if (alt == "")    /* it was the blank string */
      {
  if (hasAncestor('A', imgElt))
    return true;
  else return false;
      }
    else
      return true;
  }
  else        /* wrong type */
    return false;
}

/***********************************************************
 *
       hasValidALT2()
 *
 **********************************************************/

function hasValidALT2(imgElt,type)
     /* same as hasValidALT but it returns true or a string that */
     /* represents the reason why it is not valid */
     /* returned strings are: */
     /* - none: alt is not defined */
     /* - html: alt contains tags */
     /* - nonempty: alt should be empty or blank and isn't */
     /* - empty: alt should be non empty and it is so */
     /* - toolong: too many chars */
     /* - size: it says only what is the size of the file */
     /* - filename: it is the filename only */
     /* - placeholder: it is placeholder text only */
     /* - blank: it is a blank string */
{
  var alt = imgElt.getAttribute('alt');
  var file = imgElt.getAttribute('src');
  if (alt == null) return 'none';
  if (type == 'spacer'){
    if (alt == "") return true;
    /* remove white spaces */
    if (/\S+/.exec(alt))  /* some non space */
      return 'nonempty';
    return true;
  }
  if (type == 'nonspacer'){
    if (alt == "") return 'empty';
    if (alt.length > MAX_ALT_LENGTH) return 'toolong';
    if (/<.+>/.exec(alt)) {
      return 'html'; // HTML tags inside the ALT
    }
    var pattern = /\d+\s+bytes/i ; /* eg. 130 Bytes */
    if (pattern.exec(alt)) return 'size';
    for (i=0;i<IMAGE_FILE_EXTENSIONS.length; i++) {
      var ext = IMAGE_FILE_EXTENSIONS[i];
      if (ext.exec(alt)) {
  return 'filename';
      }}
    for (i=0; i< IMAGE_PLACE_HOLDERS.length; i++) {
      var ph = IMAGE_PLACE_HOLDERS[i];
      if (ph.exec(alt)) {
  return 'placeholder';
      }}
    /* remove white spaces */
    alt = alt.replace(/\s+/g, "");
    if (alt == "")    /* it was the blank string */
      {
  var ancestor = hasAncestor('A', imgElt);
  if (ancestor) {
    var content = getNodeText(ancestor);
    content = content.replace(/\s+/g, "");
    if (content.length)
      return true;
  }
  return 'blank';
      }
    else
      return true;
  }
  else        /* wrong 'type' */
    return null;
}


function hasValidTitle(frame)
     /* return true if the frametitle is valid */
     /* return 'missing' if title=null */
     /* return 'empty' if title = '' */
     /* return 'blank' if title=' ' */
     /* return 'html' if title contains html tags */
{
  var title = frame.getAttribute('title');
  if (title == null) return 'missing';
  if (title == '') return 'empty';
  if (/<.+>/.exec(title)) return 'html'; // HTML tags inside
  if (title.search(/\S+/g) == -1) /* no non-space present */
    return 'blank';
  return true;
}



/***********************************************************
 *
       isValidAppletContent()
 *
 **********************************************************/

function isValidAppletContent(content)
     /* it returns true or a string that */
     /* represents the reason why it is not valid */
     /* returned strings are: */
     /* - none: alt is not defined */
     /* - empty: alt should be non empty and it is so */
     /* - size: it says only what is the size of the file */
     /* - imgfilesuffix: it is an image filename only */
     /* - appletfilesuffix: it is an applet filename only */
     /* - placeholder: it is placeholder text only */
     /* - blank: it is a blank string */
{
  if (content == null) return 'none';
  if (content == "") return 'empty';

  var pattern = /\d+\s+bytes/i ; /* eg. 130 Bytes */
  if (pattern.exec(content)) return 'size';
  for (i=0;i<IMAGE_FILE_EXTENSIONS.length; i++) {
    var ext = IMAGE_FILE_EXTENSIONS[i];
    if (ext.exec(content)) {
      return 'imgfilesuffix';
      }
  }
  for (i=0;i<APPLET_FILE_EXTENSIONS.length; i++) {
    var ext = APPLET_FILE_EXTENSIONS[i];
    if (ext.exec(content)) {
      return 'appletfilesuffix';
      }
  }
  for (i=0; i<IMAGE_PLACE_HOLDERS.length; i++) {
    var ph = IMAGE_PLACE_HOLDERS[i];
    if (ph.exec(content)) {
      return 'placeholder';
    }
  }
  /* remove white spaces */
  content.replace(/\s+/g, "");
  if (content == "")    /* it was the blank string */
    return 'blank';
  else
    return true;
}



/***********************************************************
 *
       isPlaceholder()
 *
 **********************************************************/

function isPlaceholder(text, place_holders, fraction)
{
    var res = false;
    var content = this.stripString(text, 'both');
    var words = content.split(/\s+/);
    for (var i = 0; i < place_holders.length; i++) {
  var ph = new RegExp('^(\\s*|.*\\s+)' + place_holders[i] + '\\w*', 'ig');
  var old = content;
  content = content.replace(ph, '$1');
  while (old != content) {
      old = content;
      content = content.replace(ph, '$1');
  }
    }
    content = this.stripString(content, 'both');
    var remaining = content.split(/\s+/);
    if (remaining.length <= words.length * fraction)
  res = true;
    return res;
}



/***********************************************************
 *
       isValidObjectContent()
 *
 **********************************************************/

OBJECT_PLACE_HOLDERS = [/^(\s*|.*\s+)photo\w*/i, /^(\s*|.*\s+)image\w*/ig, /^(\s*|.*\s+)download\w*/i,
                        /^(\s*|.*\s+)load\w*/i, /^(\s*|.*\s+)picture\w*/i, /^(\s*|.*\s+)graphic\w*/i,
                        /^(\s*|.*\s+)click\w*/i, /^(\s*|.*\s+)ball\w*/i,
                        /^(\s*|.*\s+)large\w*/i, /^(\s*|.*\s+)bullet\w*/i, /^(\s*|.*\s+)line\w*/i, /^(\s*|.*\s+)space\w*/i,
                        /^(\s*|.*\s+)small\w*/i, /^(\s*|.*\s+)bytes\w*/i, /^(\s*|.*\s+)video\w*/i, /^(\s*|.*\s+)audio\w*/i,
                        /\{/i, /^(\s*|.*\s+)object\w*/i, /^(\s*|.*\s+)text\w*/i, /^(\s*|.*\s+)goes\w*/i, /^(\s*|.*\s+)here\w*/i, /\}/i];

FRACTION = 0.3;

function isValidObjectContent(obj)
     /* it returns true or a string that */
     /* represents the reason why it is not valid */
     /* returned strings are: */
     /* - empty: alt should be non empty and it is so */
     /* - size: it says only what is the size of the file */
     /* - filename: it is an image filename only */
     /* - placeholder: it is placeholder text only */
     /* - blank: it is a blank string */
{
  var content = getNodeText(obj);
  content.toLowerCase();
  content = content.replace(/[\f\n\r]+/g, ' ');
  if (content == "") return 'empty';
  /* remove white spaces */
  content.replace(/\s+/g, "");
  if (content == "")    /* it was the blank string */
    return 'blank';
  // length
  var pattern = /\d+\s+bytes/i ; /* eg. 130 Bytes */
  if (pattern.exec(content))
    return 'size';
  // find filename
  data = obj.getAttribute('data');
  if (isDefinedAttr(data))
     {
      data.toLowerCase();
      pos = data.lastIndexOf('/');
      if ((pos != -1) && (pos < (data.length - 1)))
          data = data.substring(pos + 1);
      if (content.indexOf(data) != -1)
          return 'filename';
     }
  // placeholder
  content = stripString(content, 'both');
  var words = content.split(/\s+/);
  for (i=0; i<OBJECT_PLACE_HOLDERS.length; i++) {
    var ph = OBJECT_PLACE_HOLDERS[i];
    var old = content;
    content = content.replace(ph, '$1');
    while (old != content) {
  old = content;
  content = content.replace(ph, '$1');
    }
  }
  content = stripString(content, 'both');
  var remaining = content.split(/\s+/);
  if (remaining.length <= words.length * FRACTION)
    return 'placeholder';
  else
    return true;
}


/***********************************************************
 *
       containsValidAttribute()
 *
 **********************************************************/
function containsValidAttribute(collection, attrName) {
    /* returns true if there is at least one element in collection
     * whose attribute 'attrName' is defined and is not null and
     * is not the empty string nor the blank string.
     */

  for (var i=0; i < collection.length; i++) {
    var elt  = collection[i];
    var attr = elt.getAttribute(attrName);
    if ((attr == null) || (attr == "undefined"))
      continue;
    attr.replace(/\s+/g, "");
    if (attr != "")
      return true;
  }
  return false;
}


/***********************************************************
 *
       getAllNodeElements(node)
 *
 **********************************************************/
function getAllNodeElements(node)
    /* given a node element, it finds recursively all the nodes
     * (except TEXT nodes and COMMENT nodes) contained in it;
     * returns an array of these nodes. */
{
    var toReturn = new Array;
    var children;

    if(node.nodeType == Node.TEXT_NODE)
  return toReturn;

    // Comments have tag == "undefined": skip them.
    if(node.nodeType != Node.COMMENT_NODE)
  toReturn.push(node);

    if(node.hasChildNodes()) {
  children = node.childNodes;
  for(var i=0; i<children.length; i++)
      toReturn = toReturn.concat(getAllNodeElements(children[i]));
    }
    return toReturn;
}


/***********************************************************
 *
       getNodeText()
 *
 **********************************************************/
function getNodeText(node)
    /* given a node, it finds recursively all the text
     * contained in it. */
{
    var strToReturn = "";
    var children;

    if(node.nodeType == Node.TEXT_NODE)
  strToReturn = node.data;
    else {
  children = node.childNodes;
  for(var i=0; i<children.length; i++)
      strToReturn = strToReturn + getNodeText(children[i]);
    }
    return strToReturn;
}


/***********************************************************
 *
       hasAncestor()
 *
 **********************************************************/
function hasAncestor(tagName, Elt)
     /* given a tag name and an Element, check if Elt */
     /* appears within an element with that tag name */
     /* Return the ancestor element if found, null otherwise */
     /* for example: */
     /* in <a ...><font ...>...</font></a> */
     /* hasAncestor('A', fontElement) ==> AElement */
{
  if (!Elt) return null;
  if (Elt.nodeType != Node.ELEMENT_NODE) return null; /* reached the top  */
  if (Elt.tagName == tagName) return Elt;
  var parent = Elt.parentNode;
  return hasAncestor(tagName, parent);
}


/***********************************************************
 *
       getDescendants()
 *
 **********************************************************/
function getDescendants(node, tagName)
  /* return all elements descending from node and having tag tagName */
{
  var collection = new Array();
  var children = node.childNodes;
  for(var i=0; i<children.length; i++) {
    var child = children[i];
    if(child.nodeType == Node.ELEMENT_NODE) {
      if (tagName == '*' || child.tagName == tagName) {
  collection.push(child);
      }
      collection = collection.concat(getDescendants(child, tagName));
    }
  }
  return collection;
}

/***********************************************************
 *
       isEditable()
 *

   given a node, return true iff node is editable.
*/
function isEditable(dom, node)
{
    var res = true;
    if (hasAncestor("{#LIBITEM}", node))
  res = false;
    if (stripString(dom.getAttachedTemplate()) != "")
  if (! (hasAncestor("MM:EDITABLE", node) || hasAncestor("MMTINSTANCE:EDITABLE", node)))
      res = false;
    return res;
}

/***********************************************************
 *
       isSpacer()
 *
   given an IMGtag check if the image can be used as a spacer;
   return a boolean
   a spacer is an img tag such that:
   - either its height or width attributes are equal to 1
   - or it is a gif and one of its size is 1
   - or its filename contains 'spacer', 'bullet' or the provided RegExp
   - it is NOT a spacer regardless of sizes or names
     if img is a child of an A (because
     <a href=... ><img src=... alt="...."></a>
     with a transparent gif is a trick used to skip repetitive links)
   */

function isSpacer(fileAttr, imgTag, strict)
{
  if (!imgTag)
    notifyError(printString("isSpacer: %s is not an element", imgTag));

  var spacerRegExp;
  if (strict)
    spacerRegExp = /spacer/gi;
  else
    spacerRegExp = /(spacer)|(bullet)|(shim\.)/gi;

  var h = imgTag.getAttribute('height');
  var w = imgTag.getAttribute('width');
  if (isDefinedAttr(h))
    h = parseInt(h);
  if (isDefinedAttr(w))
    w = parseInt(w);
  var result = false;

  if ( ( (h!=null) && ((h==0)||(h==1)) ) || ( (w!=null) && ((w==0)||(w==1)) ) ) {
    result = true;
  }

  if (! result)
  {
    var URL = imgTag.getAttribute('src');
    if (URL && isDefinedAttr(URL))
    {
      if (dw.getNaturalSize)
      {
        // dw.getNaturalSize is available in DW 4.01 and later
        var siteRoot = dw.getSiteRoot();
        var fullURL = dw.relativeToAbsoluteURL(fileAttr.URL, siteRoot, URL);
        var dims = dw.getNaturalSize(fullURL);
        if (dims && (dims[0]==1 || dims[1]==1 || dims[0]==0 || dims[1]==0))
        result = true;
      }
      if (! result)
        if (URL.search(spacerRegExp) != -1)
          result = true;
    }
  }
  return result;
}


/***********************************************************
 *
       isHiddenLink()
 *
   Given an IMGtag check if the image is a label for an hidden tag.
   Return a boolean.
   An hidden tag is a link such that:
   - its label is an image spacer and
   - the link contains a non null fragment.

 */
function isHiddenLink(fileAttr, imgTag)
{
    if(! isSpacer(fileAttr, imgTag))
  return false;
    var parent = imgTag.parentNode;
    if(parent == null)
  return false;
    if(parent.tagName == 'A') {
  if(getNodeText(parent).length)
      return false;
  if(parent.childNodes.length > 1)
      return false;
  var href = parent.getAttribute('HREF');
  if (isDefinedAttr(href)) {
      var pos = href.lastIndexOf('#');
      if (pos == -1)
          return false;
      var fragment = href.substr(href.lastIndexOf('#')+1, href.length);
      fragment = stripString(fragment, null);
      if (! fragment.length)
          return false;
      return true;
  }
    }
    return false;
}


/***********************************************************
 *
 *         isValidURL()
 *
   check if URL has a resource associated to it
   - if it is file://... then check if the file exists and is not empty
   - if it is http://... then check if the server responds positively
   If URL is a relative URL then try to complete using fromURL for missing
   items.
   'type' is either 'html' or undefined; if 'html' then check that
   the obtained file contains [x]html tags.
   Return true or a string that represents an invalidity code.

*/
function isValidURL(URL, fromURL, type)
{
  if (isRelativeURL(URL)){
    var url1 = URL;
    URL = makeAbsoluteURL(URL,fromURL);
    //    alert(url1 + ' is relative; \n'+
    //          'its absolute is: '+URL);
  }
  var res = true;
  var pattern = /\d+\s+bytes/i;
  if (/^file:/i.exec(URL)){
    if (!DWfile.exists(URL)) return 'nofile';
    if (type == 'html') {
      var filename = getFileName(URL);
      if (!filename) return false;
      if (!isHTMLType(filename)) return 'nohtml';
    }
    var content = DWfile.read(URL);
    if (!content) return 'empty';
    return true;
  }
  else if (/^http:/i.exec(URL)){
    var response = MMHttp.getText(URL);
    if (!response) return 'noresponse';
    if (response.statusCode != 200) return 'badresponse';
    if (type == 'html' && !response.data) return 'empty';
    /* >>>>>> TO DO >>> test also that the content is HTML */
    return true;
  }
  else return 'badproto';
}

/***********************************************************
 *
       isRelativeURL()
 *
 **********************************************************/
function isRelativeURL(URL)
     /* check if the URL denotes a local file with a relative path */
     /* i.e. */
     /* - it does not begin with a protocol */
     /* - it does not begin with a / */
     /* return true or false */
{
  if (/^(http:|https:|ftp:|file:)/i.exec(URL))
    return false;
  if (URL.indexOf('/') == 0)
    return false;
  return true;
}

/***********************************************************
 *
       makeAbsoluteURL()
 *
 **********************************************************/
function makeAbsoluteURL(rel_url, fromURL)
  /* make an absolute path from a relative path (mantaining fragments)      */
    /* try to normalize the resulting path (i.e. transform x/y/../z into x/z) */
    /* 'fromURL' is a well formed complete (local or remote) URL              */
    /* return null, if mormalization fails                                    */
{
    var url;
    if (stripString(rel_url) == "")
  return "";
    var root = dw.getSiteRoot();
    var proto = getProtocol(rel_url);
    // remove fragments
    var fragments = getURLFragments(rel_url);
    rel_url = removeURLFragments(rel_url);
    // construct absolute
    if (! proto) {
  // construct absolute url
  if (stripString(rel_url))
      url = dw.relativeToAbsoluteURL(fromURL, root, rel_url);
  else
      url = fromURL;
  proto = getProtocol(url);
    } else
  url = rel_url;
    url += fragments;
    url = normalizeURL(url);
    return url;
}


/***********************************************************
 *
       getProtocol()
 *
 **********************************************************/
// Extract the protocol component of the given URL
// Return a string like 'mailto', 'https', ....
// (in lowercase)
// return '' if no protocol is present
// Return null if no URL is given (or if null is given).

function getProtocol(URL)
{
  if (! URL) return null;
  var splits = URL.split(':');
  if (splits.length > 1)
    return splits[0].toLowerCase();
  else
    return '';
}



/***********************************************************
 *
       getBasename()
 *
 **********************************************************/
function getBasename(URL)
     /* return the part of the url preceding the last '/' */
     /* exclude the '/'; */
     /* if no '/' is present return the empty string '' */
{
  var index = URL.lastIndexOf('/');
  return (index == -1) ? '' : URL.substring(0,index);
}

/***********************************************************
 *
       getOnlyFileName()
 *
 **********************************************************/
function getOnlyFileName(URL)
     /* return the part of the url following the last '/' */
     /* exclude the '/'; */
     /* if no '/' is present returns URL. */
{
  var index = URL.lastIndexOf('/');
  return (index == -1) ? URL : URL.substring((index + 1),URL.length);
}


/***********************************************************
 *
       normalizeURL()
 *
 **********************************************************/
function normalizeURL(URL)
     /* return a normalized URL, that is: */
     /* - merge x/y/../z into x/z */
     /* - merge x/y/./z into x/y/z */
     /* Assume that the URL is complete and correct */
     /* if the ../ cannot be merged then return URL */
{
  var re = /(\w+)\/\.\.\//; /* match xxxxx/../ */
  var res = URL;
  while (res.search(re) != -1){
    res = res.replace(re, "");
  }
  return res;
}



/***********************************************************
 *
       getURLFragments()
 *
 **********************************************************/
function getURLFragments(URL)
/*
  get fragments part of an url:
  - '' if not defined;
  - a string starting with '#' otherwise.
*/
{
    var fragments = '';
    var pos = URL.lastIndexOf('#');
    if (pos != -1)
  fragments = URL.substring(pos, URL.length);
    return fragments;
}



/***********************************************************
 *
       removeURLFragments()
 *
 **********************************************************/
function removeURLFragments(URL, fromURL)
/*
  get fragments part of an url:
  - '' if not defined;
  - a string starting with '#' otherwise.
*/
{
    var url = URL;
    var pos = url.lastIndexOf('#');
    if (pos != -1)
  if (pos > 0)
      url = url.substring(0, pos);
  else
      url = '';
    return url;
}



function isGIFURL(URL) {
  /* return true if URL ends with .gif */
  if (URL == null) return false;// to be on the safe side
  if (URL.search(/\.gif/i) != -1)
    return true;
  return false;
}


function stripString(strg, direction)
{
  /* if direction is "both" or is null: */
  /*   return a string where left and righthand spaces are removed */
  /*   and sequences of spaces are collapsed into a single space */
  /* if direction is "left" */
  /*   remove only left spaces */
  /* if direction is "right" */
  /*   remove only right spaces*/
  var lftpat = /^\s+/g;
  var rgtpat = /\s+$/g;
  var inpat = /(\s)\s+/g;
  if (direction == 'left')
    strg = strg.replace(lftpat,""); /* remove */
  else if (direction == 'right')
    strg = strg.replace(rgtpat,""); /* remove */
  else {
    strg = strg.replace(lftpat,""); /* remove */
    strg = strg.replace(rgtpat,""); /* remove */
    strg = strg.replace(inpat,"$1"); /* remove most but one*/
    strg = strg.replace(/[\n\r]+/g, ""); /* remove new lines and line feeds */
  }
    if (dreamweaver.appVersion.indexOf('[fr]') != -1 ||  dreamweaver.appVersion.indexOf('[de]') != -1)
   {
        strg = dwscripts.entityNameDecode(strg);
  }
  return strg;
}


function findFollowingElement(fromElt, tag)
     /* return the element with tag "tag" that directly follows */
     /* in the DOM "fromElt", i.e. it is an adjacent sibling at the */
     /* same level in the tree. */
     /* If it cannot be found return null */
{
  if (!fromElt) return null;
  if (fromElt.nodeType != Node.ELEMENT_NODE) return null;
  var parent = fromElt.parentNode;
  if (!parent) return null;
  var children = parent.childNodes;
  tag = tag.toUpperCase();
        /* locate the position of fromElt */
  var pos = children.length;  /* sentinel */
  for (var i =0; i < children.length; i++){
    var elt = children[i];
    if (elt == fromElt) pos = i;
  }
  if (pos >= children.length-1) return null; /* no following element */
  elt = children[pos+1];  /* elt is the following element */
  if (!elt.tagName) return null;  /* a text node? */
  if (elt.tagName != tag) return null; /* something else? */
  return elt;
}

function hasImageType(input_elt) {
  /* input_elt is an INPUT node */
  /* return true if it has the attribute 'type="image"' */
  /* return null if the argument is not an input element */
  if ((input_elt.nodeType != Node.ELEMENT_NODE) ||
      (input_elt.tagName != 'INPUT'))
    return null;
  var type = input_elt.getAttribute('type');
  var re = /^\s*(image)\s*$/i;  /* match "image", " iMaGe  ", ... */
  if (type && (type != 'undefined') && (type.search(re) != -1)) {
    return true;
  } else {
    return false;
  }
}

function hasChildWithTag(table,tag) {
  /* check if table node has a subnode with given tag */
  /* do not explore children that are themselves tables */
  /* return the first element found, if any, or null */
  /* proceed depth-first */
  var children = table.childNodes;
  for (var i=0; i<children.length; i++){
    var node = children[i];
    if (node.nodeType != Node.ELEMENT_NODE)
      continue;
    if (node.tagName == 'TABLE') /* it's a subtable */
      continue;
    if (node.tagName == tag.toUpperCase())
      return node;
    var res = hasChildWithTag(node, tag);
    if (res == null)
      continue;
    return res;     /* else */
  }
  return null;      /* unsuccessfully scanned all children */
}


function collectChildrenWithTag(table,tag,accum) {
  /* check if table node has a subnode with given tag */
  /* do not explore children that are themselves tables */
  /* use the accumulator to accumulate results in an array */
  /* proceed depth-first */
  var children = table.childNodes;
  for (var i=0; i<children.length; i++){
    var node = children[i];
    if (node.nodeType != Node.ELEMENT_NODE)
      continue;
    if (node.tagName == 'TABLE') /* it's a subtable */
      continue;
    if (node.tagName == tag.toUpperCase()){
      accum.push(node);
      continue;
    }
    collectChildrenWithTag(node, tag, accum);
  }
}


function refersToFileWithExtension(node, extension) {
  /* node is assumed to be an A with href */
  /* check if url mentioned in href is a file that ends */
  /* with given extension (case insensitive comparison) */
  /* NOTE: no URL parsing is needed as for PDF files there are */
  /* no queries, parameters or fragments available */
  /* return true or false */
  var re = new RegExp('\.'+extension+"$", "i");
  var url = (node.tagName == 'A')? node.getAttribute('href') : '';
  if (url && (url.search(re) != -1)) {
    return true;
  }
  return false;
}

// ******************************************************
// ******************************************************
//         Functions to construct a tree
// They suppose that the global variable "TreeInConstruction"
// array is already declared.
// ******************************************************

// ******************************************************
// This function must be called immediatly before the
// construction of the tree to show in "Fix Accessibility" or
// in "Rule Settings".
// It clears the (eventually existing) property of the
// "TreeInConstruction".
//
// The right order of the calls is:
// 1) once, initTreeSaving();
// 2) once or more, saveNewTreeNode();
// 3) once or more, saveEndTreeNode();
// 4) once, endTreeSaving().
function initTreeSaving()
{
    // If necessary, I empty the array.
    // (It is enough: see the comment in FixAccessibility.js).
    if(TreeInConstruction.value != null) {
  if(TreeInConstruction.value.length)
      TreeInConstruction.value.length = 0;
    }
    else
  return false;
    return true;
}
// ******************************************************
// Adds a new node (a tree row) to the tree.
// It stores the constructed string into the global array
// "TreeInConstruction".
// Parameters:
// - where              where i have to store the results of
//                      this function. It must be one of:
//                      "global": if in "TreeInConstruction";
//                      "return": if the results must be returned.
// - name:    The name of the node to add.
// - value:   The value of the node to add.
// - isExpanded:  boolean.
//                      * true if the node has state attribute set to "expanded";
//                      * false else (state = "collapsed").
// - leaveOpen:   boolean.
//                      * true if the node has to be kept open;
//      * false else (we do not write the final tag </mm:treenode>).
// - isSelected:        boolean.
//                      * true if the row must be selected;
//                      * false else (default is false).
function saveNewTreeNode(where, name, value, isExpanded, leaveOpen, isSelected)
{
    var theArray;

    // -------------------
    switch(where) {
    case "global":
  theArray = TreeInConstruction.value;
  break;
    case "return":
  theArray = new Array();
  break;
    default:
  return false;
    }

    // -------------------
    theArray.push(" <mm:treenode");
    if(name != "") {
  theArray.push(" name=\"");
  theArray.push(name);
  theArray.push("\"");
    }
    theArray.push(" value=\"");
    theArray.push(value);
    theArray.push("\"");
    if(isExpanded) {
  theArray.push(" state=\"expanded\"");
    }
    if(isSelected) {
  theArray.push(" selected");
    }
    if(leaveOpen) {
  theArray.push(">" + NEWLINE);
    }
    else {
  theArray.push("></mm:treenode>" + NEWLINE);
    }

    // -------------------
    switch(where) {
    case "global":
  return true;
  break;
    case "return":
  return theArray.join("");
  break;
    }

    return true;
}
// ******************************************************
// Closes a previous opened node.
// This is used for category nodes, that are closed only after
// their children nodes are added.
// See the description of: saveNewTreeNode().
function saveEndTreeNode()
{
    TreeInConstruction.value.push(NEWLINE + "</mm:treenode>" + NEWLINE);
}
// ******************************************************
// Function to transfer the temporary contents of the global
// array, into the innerHTML property of the tree.
function endTreeSaving(objectName)
{
    // Assert...
    if((objectName == null) || (objectName == ""))
  return false;
    var theParent = findObject(objectName);

    // Clear the temporary node...
    var allChildren = theParent.childNodes;
    for(var i=0; i<allChildren.length; i++)
    {
  if(allChildren[i].getAttribute("name") == "LoadingNode")
      allChildren[i].outerHTML = "";
    }

    // Add the definitive tree...
    var tv = TreeInConstruction.value;
    var chunks = tv.length / 10000;
    for (var i = 0; i < tv.length; i += 10000)
    {
  var ctv = tv.slice(i, i + 10000);
  var myinner = ctv.join("");
  theParent.innerHTML += myinner;
    }

    return true;
}


// ******************************************************
// ******************************************************
//        Functions to manage an existing tree
// ******************************************************

// ******************************************************
// Returns the tree-nodes selected.
function getSelectedNodes(objectName) {
    var selected = findObject(objectName).selectedNodes;
    return selected;
}


// ******************************************************
// ******************************************************
//        Functions to file management
// ******************************************************
// ******************************************************
// This function deletes all previous temporary file
// eventually existing.
// "fileType" is one of:
// - "rule"
// - "settings"
// - "bugReporting"
// Returns:
// - true     if the file is correctly removed.
// - false    else.
function deleteTmpFile(fileType)
{
    var fileName = "";

    switch(fileType) {
    case "rule":
  fileName = TMP_RULE_FILE_NAME;
  break;
    case "settings":
  fileName = TMP_SETTINGS_FILE_NAME;
  break;
    case "bugReporting":
  fileName = TMP_BUG_REPORTING_FILE_NAME;
  break;
    } // End switch

    // If the file exists, remove it.
    if(DWfile.exists(fileName)) {
  if(DWfile.remove(fileName))
      return true;
  else
      return false;
    } // End if
    return true;
}


// ******************************************************
// Display help pages
// ******************************************************

function dwasDisplayHelp(page)
{
    dw.browseDocument(DWAS_HELP_PATH + "/" + page);
}

// utilities.js ends here
