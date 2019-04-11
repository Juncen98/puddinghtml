//SHARE-IN-MEMORY=true
//
// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
//
//file.js
//
//Library of functions pertaining to file functions.
//
//--------------------------------------------------------------
//
//browseFile(fieldToStoreURL){
//getFullPath(filePathURL){
//getSimpleFileName() {
//fixUpPath(docURL,siteURL,savedPath)
//fileIsCurrentlyOpen(absoluteFileURL);


//Invokes dialog to allow user to select filename. Puts value in text input.
// The optional flag stripParameters will remove anything after a question
// mark if it is set to true

function browseFile(fieldToStoreURL, stripParameters) {
  var fileName = "";
  fileName = browseForFileURL();  //returns a local filename
  if (stripParameters) {
    var index = fileName.indexOf("?");
    if (index != -1) {
      fileName = fileName.substring(0,index);
    }
  }
  if (fileName) fieldToStoreURL.value = fileName;
}


//function: getFullPath
//description: converts relative paths into full paths that start with
//file:///
//Why this is important: A user is prompted for a location to save
//a file. Dreamweaver generates a path that is relative to the currently
//opened document. If a developer tries to use this URL in DWfile, it will
//not work because dreamweaver assumes the path to be relative to the 
//extension file. However, full paths will work
//Note that this function sometimes returns a full path that is indirect:
//For instance: file:///C|/MyWebSite/Hobbies/Cooking/.../Hobbies/Images/cake.gif
//However, the user never sees this file path.
//
//Arguments:
//filePathURL - doc-relative,site-relative, or absolute file path

function getFullPath(filePathURL){
   var retVal = (filePathURL)?filePathURL:'';
   var docURL;
   var dotDotSlash;
   var inMiddle;
  
  if (retVal != ''){ 
     //if the document path is relative, for example,My Docs/My Schedule.htm
     //create an absolute path. 
     if (  filePathURL.indexOf("file://")!=0  ){ 
     
       //if doc relative...
       if ( filePathURL.charAt(0)!="/"  ){
         docURL = dreamweaver.getDocumentDOM('document').URL;
         dotDotSlash = filePathURL.indexOf('../');
         while (dotDotSlash == 0){
           docURL = docURL.substring(0,docURL.lastIndexOf("/"));
           filePathURL = filePathURL.substring(3);
           dotDotSlash = filePathURL.indexOf('../');
         } 
         retVal = docURL.substring(0,docURL.lastIndexOf("/")+1) + filePathURL;  
       //else path is site relative...
       } else {
			   //else get a local path from site root relative path
				 retVal = dw.getDocumentDOM().siteRelativeToLocalPath(filePathURL);
       } 
     }
   }
     return retVal;
}


//Returns the simple file name for the current document

function getSimpleFileName() {
  var filePath = dreamweaver.getDocumentPath("document"); //get full path of file
  var lastSlash = filePath.lastIndexOf("/");
  if (lastSlash != -1) filePath = filePath.substring(lastSlash+1);
  return filePath;
}

// fixUpPath()
// Given the location of the current document, the site root, 
// and the path to a file or folder (expressed as a file:// URL), 
// returns one of the following:
// the file:// URL passed in, if the document has not been saved
// the file:// URL passed in, if the document is not in the current site
// a document-relative path, if the document has been saved in the current site
function fixUpPath(docURL,siteURL,savedPath){
	var retVal = "";
	if (docURL == "" || (docURL != "" && savedPath.indexOf(dw.getSiteRoot()) == -1)){
		retVal = savedPath;
	}else{
	  docURL = docURL.substring(0,docURL.lastIndexOf('/')+1);
   	var endStr = (docURL.length > savedPath.length)?savedPath.length:docURL.length;
		var commonStr = "";
	    for (var i=0; i < endStr; i++){
      if (docURL.charAt(i) == savedPath.charAt(i)){
        commonStr += docURL.charAt(i);
      }else{
        break;
      }
    }

    var whatsLeft = docURL.substring(commonStr.length);
    var slashPos = whatsLeft.indexOf('/');
    var slashCount = 0;
    var dotDotSlash = "";

    while (slashPos != -1){
      slashCount++;
      slashPos = whatsLeft.indexOf('/',slashPos+1);
    }
	
    for (var j=1; j <= slashCount; j++){
      dotDotSlash += '../';
    }

    retVal = dotDotSlash + savedPath.substring(commonStr.length);
  }
	return retVal;
}

// function: fileIsCurrentlyOpen
// description: given a file path, determines if the file is currently open
// argument: absoluteFilePath -- an absolute file path
function fileIsCurrentlyOpen(absoluteFilePath) {
  var fileObj = dw.getDocumentDOM(absoluteFilePath);
  var openFilesArr = dw.getDocumentList();
  var fileIsOpen = false, nOpenFiles,i;
  
  // openFilesArr is an array of currently open document objects
  if (openFilesArr.length && openFilesArr.length > 0) {
    nOpenFiles = openFilesArr.length;
    for (i=0;i<nOpenFiles;i++) {
      if (fileObj == openFilesArr[i]) {
        fileIsOpen = true;
        break;
      }
    }
  
  }
  return fileIsOpen;
}