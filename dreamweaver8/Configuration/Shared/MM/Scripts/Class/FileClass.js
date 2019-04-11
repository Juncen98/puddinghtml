//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

/* ----------------------------------------------------------------------*/
//File Class

// This class represents a file in the file system.
// The paths are represented by URL's for cross platform compatibility.

//INTERFACE
//
//File methods:
//
//  toString() returns string
//    - returns the string representation of the file (value passed to constructor)
//
//  getName() return string
//    - returns the name of the file
//
//  getSimpleName() return string
//    - returns the name of the file without the extension
//
//  getExtension() return string
//    - returns the file extension
//
//  getPath() return string
//    - returns the full path of the file (value passed to constructor)
//
//  setPath() return boolean
//    - sets the path for the file object  (returns true if successful)
//
//  isAbsolute() return boolean
//    - returns true if the file path is absolute
//
//  getAbsolutePath() return string
//    - returns the absolute path name of the file
//
//  getParent() return string
//    - returns the path name of the enclosing folder
//
//  getAbsoluteParent() return string
//    - returns the absolute path name of the enclosing folder
//
//  exists() return boolean
//    - returns true if the file exists in the file system
//
//  getAttributes() return string
//    - gets the attributes of the file (returns false if file doesn't exist)
//      D = directory, R = read-only, H = hidden, S = system
//
//  canRead() return boolean
//    - returns true if the file is readable
//
//  canWrite() return boolean
//    - returns true if the file is writeable
//
//  isFile() return boolean
//    - returns true if the file is a standard file
//
//  isFolder() return boolean
//    - returns true if the file is a folder
//
//  listFolder(filterFunction) return Array
//    - lists the contents of the file, if it is a folder
//    - existing filter functions: File.selectFolders, File.selectFiles
//
//  createFolder() return boolean
//    - creates a folder with the given path
//
//  getContents() return string
//    - returns a string containing the contents of the file
//
//  setContents(contents, append) return boolean
//    - sets the contents of the file
//
//  copyTo(newPath, noMetafile) return boolean
//    - copies the file and its metafile to the new location (returns true if successful)
//
//  remove() return boolean
//    - removes the file (returns true if successful)
//


//Constructor function
//
function File(theUrl, theDocUrl) {
  // properties
  this.url = '';
  this.fullUrl = '';
  // initialization
  this.setPath(theUrl, theDocUrl);
}

// static properties
File.separator = '/';
File.absolutePrefix = 'file:///';
File.parentDir = '/..';
File.extensionSep = '.';
File.metafileDir = '_notes';
File.metafileExt = '.mno';

// static methods
File.getFullUrl = File_getFullUrl;
File.getNewlineFromString = File_getNewlineFromString;

// methods
File.prototype.toString = File_toString;
File.prototype.getName = File_getName;
File.prototype.getSimpleName = File_getSimpleName;
File.prototype.getExtension = File_getExtension;
File.prototype.getPath = File_getPath;
File.prototype.setPath = File_setPath;
File.prototype.isAbsolute = File_isAbsolute;
File.prototype.getAbsolutePath = File_getAbsolutePath;
File.prototype.getParent = File_getParent;
File.prototype.getAbsoluteParent = File_getAbsoluteParent;
File.prototype.exists = File_exists;
File.prototype.getAttributes = File_getAttributes;
File.prototype.canRead = File_canRead;
File.prototype.canWrite = File_canWrite;
File.prototype.isFile = File_isFile;
File.prototype.isFolder = File_isFolder;
File.prototype.listFolder = File_listFolder;
File.prototype.createFolder = File_createFolder;
File.prototype.getContents = File_getContents;
File.prototype.setContents = File_setContents;
File.prototype.copyTo = File_copyTo;
File.prototype.remove = File_remove;

// static filter functions for listFolder
File.selectFolders = File_selectFolders;
File.selectFiles = File_selectFiles;



function File_toString() {
  return this.url;
}

function File_getName() {
  var retVal = '';
  with (this) {
    retVal = url;
    var index = retVal.lastIndexOf(File.separator);
    if (index != -1) retVal = retVal.substring(index + File.separator.length, retVal.length);
    return retVal;
  }
}

function File_getSimpleName() {
  var retVal = this.getName();
  var index = retVal.lastIndexOf(File.extensionSep);
  if (index != -1)
    retVal = retVal.substring(0, index);
  return retVal;
}

function File_getExtension() {
  var retVal = '';
  var index = this.fullUrl.lastIndexOf(File.extensionSep);
  if (index != -1)
    retVal = this.fullUrl.substring(index+1);
  return retVal;
}

function File_getPath() {
  return this.url;
}

function File_setPath(theNewUrl, theDocUrl) {
  this.url = (theNewUrl == null) ? "" : theNewUrl;
  if (this.url.charAt(this.url.length-1) == File.separator)
    this.url = this.url.substring(0,this.url.length-1);
  this.fullUrl = File.getFullUrl(this.url, theDocUrl);
  if (!this.fullUrl) this.url = '';
}

function File_isAbsolute() {
  return (this.url.indexOf(File.absolutePrefix) == 0);
}

function File_getAbsolutePath(theDocUrl) {
  return this.fullUrl;
}

function File_getParent() {
  var retVal = '';
  with (this) {
    var index = url.lastIndexOf(File.separator);
    if (index != -1) retVal = url.substring(0, index);
    return retVal;
  }
}

function File_getAbsoluteParent() {
  var retVal = '';
  with (this) {
    var index = fullUrl.lastIndexOf(File.separator);
    if (index != -1) retVal = fullUrl.substring(0, index);
  }
  return retVal;
}

function File_exists() {
  var retVal = false;
  if (this.fullUrl)
  {
    retVal = (DWfile.exists(this.fullUrl)) ? true : false;
	if (!retVal)
	  retVal = (DWfile.exists(this.fullUrl+"/")) ? true : false;
  }
  return retVal;
}

function File_getAttributes() {
  var retVal = false;
  if (this.fullUrl && this.exists())
    retVal = DWfile.getAttributes(this.fullUrl);
  return retVal;
}

function File_canRead() {
  var retVal = false;
  if (this.fullUrl && this.exists())
    retVal = true;
  return retVal;
}

function File_canWrite() {
  var retVal = false;
  if (this.fullUrl && this.exists())
    retVal = (DWfile.getAttributes(this.fullUrl).indexOf('R') == -1);
  return retVal;
}

function File_isFile() {
  var attr, retVal = false;
  if (this.fullUrl && this.exists()) {
    attr = DWfile.getAttributes(this.fullUrl);
    retVal = (attr == null || attr == '' || attr == 'R');
  }
  return retVal;
}

function File_isFolder() {
  var retVal = false;
  if (this.fullUrl && this.exists())
    retVal = (DWfile.getAttributes(this.fullUrl).indexOf('D') != -1);
  return retVal;
}


function File_listFolder(filterFunction) {
  var retList = new Array();
  var fileList, fileObj = new File();
  with (this) {
    if (fullUrl && exists()) {
      fileList = DWfile.listFolder(fullUrl);
      // now filter with the filter function
      for (var i=0; i < fileList.length; i++) {
        if (filterFunction != null) {
          fileObj.setPath(fullUrl + File.separator + fileList[i]);
          if (filterFunction(fileObj)) retList.push(fileList[i]);
        } else {
          retList.push(fileList[i]);
  } } } }
  return retList;
}

function File_selectFolders(fileObj) {
  return fileObj.isFolder();
}

function File_selectFiles(fileObj) {
  return fileObj.isFile();
}


function File_createFolder() {
  var retVal = false;
  if (this.fullUrl && !this.exists())
    retVal = DWfile.createFolder(this.fullUrl);
  return retVal;
}


function File_getContents() {
  var strNewline, platformNewline, searchPatt, retVal = '';
  if (this.fullUrl && this.exists() && this.isFile()) {
    retVal = DWfile.read(this.fullUrl);
    //replace file newlines with current page newlines
    strNewline = File.getNewlineFromString(retVal);
    platformNewline = (navigator.platform != "Win32") ? "\x0D":"\x0D\x0A";
    if (strNewline != platformNewline) {
      searchPatt = new RegExp(strNewline,"g");
      retVal = retVal.replace(searchPatt, platformNewline);
  } }
  return retVal;
}

function File_setContents(theContents, append) {
  var strNewline, platformNewline, retVal = false;
  if (this.fullUrl && ( !this.exists() || (this.exists() && this.isFile()) ) ) {
    // set newlines
    strNewline = File.getNewlineFromString(theContents);
    platformNewline = (navigator.platform != "Win32") ? "\x0D":"\x0D\x0A";
    if (strNewline != platformNewline) {
      searchPatt = new RegExp(strNewline,"g");
      theContents = theContents.replace(searchPatt, platformNewline);
    }
    // write the file
    if (append)
      retVal = DWfile.write(this.fullUrl, theContents, append);
    else
      retVal = DWfile.write(this.fullUrl, theContents);
  }
  return retVal;
}


function File_copyTo(theCopyName, noMetafile) {
  var toObj, metaObj, toMetaObj, toMetaDir, retVal = false;
  toObj = new File(theCopyName);
  if (this.fullUrl) {
    retVal = DWfile.copy(this.fullUrl, toObj.getAbsolutePath());
    if (retVal && !noMetafile) {
      metaObj = new File(this.getAbsoluteParent() + File.separator + File.metafileDir + File.separator + this.getName() + File.metafileExt);
      if (metaObj.exists()) {
        toMetaObj = new File(toObj.getAbsoluteParent() + File.separator + File.metafileDir + File.separator + toObj.getName() + File.metafileExt);
        toMetaDir = new File(toMetaObj.getAbsoluteParent());
        if (!toMetaDir.exists())
          retVal = toMetaDir.createFolder();
        if (retVal)
          retVal = DWfile.copy(metaObj.getAbsolutePath(), toMetaObj.getAbsolutePath());
  } } }
  return retVal;
}

function File_remove() {
  var retVal = false;
  if (this.fullUrl) retVal = DWfile.remove(this.fullUrl);
  return retVal;
}


function File_getFullUrl(theUrl, theDocUrl) {
  var retVal = '';
  var siteUrl, docUrl, index, prevIndex;
  retVal = theUrl;
  if (theUrl.indexOf(File.absolutePrefix) == -1) {
    if (theUrl.charAt(0) == File.separator) 
		{  // site relative path
			//get the site for a docURL
		  var siteName = site.getSiteForURL(theDocUrl);
			if (siteName.length == 0)
			{
			  //if the doc is unsaved or the site cannot be located get the current site name
				siteName = site.getCurrentSite();
			}
			if (siteName && siteName.length)
			{
				 //map the site relative url to localPath
				 retVal = site.siteRelativeToLocalPath(theUrl,siteName);
				 if ((retVal != null) && (retVal.length > 0))
				 {
					retVal = dwscripts.filePathToLocalURL(retVal);
				 }
			}
			else
			{
        //alert("Error: No site root defined. Cannot create File object (" + theUrl + ")");
        retVal = '';
			}
      /*siteUrl = dreamweaver.getSiteRoot();
      if (siteUrl) {
        if (siteUrl.charAt(siteUrl.length-1) == File.separator)
          retVal = siteUrl.substring(0, siteUrl.length-1) + theUrl;
        else
          retVal = siteUrl + theUrl;
      } else {
        //alert("Error: No site root defined. Cannot create File object (" + theUrl + ")");
        retVal = '';
      }*/
    } 
		else {  // doc relative path
       // skip past "://"
       var i = theUrl.indexOf("://");
       if (i == -1)
       {
	     i = 0;
       }
       else
       {
	     i += 3;
	     theUrl = theUrl.substring(i);
       }
       // remove "/./" and "//"
	   var theFixedUrl = "";
       for (i=0; i < theUrl.length; i++)
       {
	    if (theUrl[i] == '.' &&
		 (i == 0 || theUrl[i-1] == '/') &&
		 (i == theUrl.length - 1 || theUrl[i+1] == '/'))
	     {
		  // skip this character ('.') and the next ('/')
		   i++;
	     }
	     else if (theUrl[i] == '/' &&
			 i < theUrl.length - 1 &&
			 theUrl[i+1] == '/')
	     {
		   // skip this extra '/'
	     }
	     else
	     {
		  theFixedUrl += theUrl[i];
	     }
       }
      docUrl = (theDocUrl) ? theDocUrl : dreamweaver.getDocumentPath("document");
      if (docUrl) {
        index = docUrl.lastIndexOf(File.separator);
        if (index != -1) docUrl = docUrl.substring(0, index);
        retVal = docUrl + File.separator + theFixedUrl;
      } else {
        //alert("Error: Current document not saved. Cannot create File object (" + theFixedUrl + ")");
        retVal = '';
  } } }
  //remove relative references from the path
  while (retVal.indexOf(File.parentDir) != -1) {
    index = retVal.indexOf(File.parentDir);
    prevIndex = retVal.lastIndexOf(File.separator, index-1);
    if (prevIndex != -1)
      retVal = retVal.substring(0, prevIndex) + retVal.substring(index+File.parentDir.length);
    else
      retVal = '';
  }
  return retVal;
}

function File_getNewlineFromString(theStr) {
  var retVal="\x0D\x0A";	// default
	if ((theStr != null) && (theStr.length > 0))
	{
	  if (theStr.search(/(\x0D\x0A)|(\x0D)|(\x0A)/) != -1) retVal = RegExp.lastMatch;
	}
  return retVal
}
