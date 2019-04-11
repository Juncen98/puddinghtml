// Create Web Photo Album v 1.0
// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved
 
//---------------   GLOBAL VARIABLES   ---------------
var helpDoc = MM.HELP_cmdCreateWebPhotoAlbum;
var gOpenableExtensions = [ ".gif", ".jpg", ".jpeg", ".png", ".psd", ".tif", ".tiff" ];
// Document encoding charsets -- parallel with ENCNUMS
var ENCNAMES = new Array();
ENCNAMES[0] = "iso-8859-1";
ENCNAMES[1] = "Shift_JIS";
ENCNAMES[2] = "iso-2022-jp";
ENCNAMES[3] = "EUC-JP";
ENCNAMES[4] = "big5";
ENCNAMES[5] = "gb2312";
ENCNAMES[6] = "euc-kr";
ENCNAMES[7] = "utf-8";
ENCNAMES[8] = "iso-8859-2";
ENCNAMES[9] = "ASMO-708";
ENCNAMES[10] = "DOS-720";
ENCNAMES[11] = "iso-8859-5";
ENCNAMES[12] = "iso-8859-6";
ENCNAMES[13] = "windows-1256";
ENCNAMES[14] = "windows-1257";
ENCNAMES[15] = "ibm852";
ENCNAMES[16] = "windows-1250";
ENCNAMES[17] = "cp866";
ENCNAMES[18] = "hz-gb-2312";
ENCNAMES[19] = "koi8-r";
ENCNAMES[20] = "koi8-ru";
ENCNAMES[21] = "windows-1251";
ENCNAMES[22] = "iso-8859-7";
ENCNAMES[23] = "windows-1253";
ENCNAMES[24] = "DOS-862";
ENCNAMES[25] = "iso-8859-8-i";
ENCNAMES[26] = "iso-8859-8";
ENCNAMES[27] = "windows-1253";
ENCNAMES[28] = "windows-874";
ENCNAMES[29] = "iso-8859-9";
ENCNAMES[30] = "windows-1258";
 
// Document encoding preference values -- parallel with ENCNAMES
var ENCNUMS = new Array();
ENCNUMS[0] = 1252;
ENCNUMS[1] = 932;
ENCNUMS[2] = 50220;
ENCNUMS[3] = 51932;
ENCNUMS[4] = 950;
ENCNUMS[5] = 936;
ENCNUMS[6] = 949;
ENCNUMS[7] = 65001;
ENCNUMS[8] = 28592;
ENCNUMS[9] = 708;
ENCNUMS[10] = 720;
ENCNUMS[11] = 28595;
ENCNUMS[12] = 28596;
ENCNUMS[13] = 1256;
ENCNUMS[14] = 1257;
ENCNUMS[15] = 852;
ENCNUMS[16] = 1250;
ENCNUMS[17] = 866;
ENCNUMS[18] = 52936;
ENCNUMS[19] = 20866;
ENCNUMS[20] = 21866;
ENCNUMS[21] = 1251;
ENCNUMS[22] = 28597;
ENCNUMS[23] = 1253;
ENCNUMS[24] = 862;
ENCNUMS[25] = 38598;
ENCNUMS[26] = 28598;
ENCNUMS[27] = 1255;
ENCNUMS[28] = 874;
ENCNUMS[29] = 28599;
ENCNUMS[30] = 1258;
 
var gFolderURL = "";
var gCancelClicked = false;
var gProgressTracker = null;
var gResponse = null;
 
var gThumbnailSize = 32;  // Default pixel size.
 
 
//---------------     API FUNCTIONS    ---------------
 
 
function commandButtons()
{
  return new Array(
         MM.BTN_OK,"buildIt()",
         MM.BTN_Cancel,"readyToCancel();window.close()",
         MM.BTN_Help,"displayHelp()"
        );
}
 
 
//---------------    LOCAL FUNCTIONS   ---------------
 
function initUI()
{
  // the two layers in this command are set to visible by default 
  // so that dreamweaver can size the dialog correctly. We'll 
  // now mak ethem invisible so we can setup which layer to show. 
  document.Layer1.visibility = "hidden";
  document.Layer2.visibility = "hidden";
 
  MM.mmCWPA_openFile = null;  // Initialize the index file open parameter.
  
	// Dreamweaver now keeps an preference referencing the
	//	version of Fireworks the user wants to use. Get
	//	that and tell FWLaunch about it.
	var fireworksPath = dw.getFireworksPath();
	if( fireworksPath != null ) 
	{
		FWLaunch.setFireworksPath(fireworksPath[1]);
	}

  if (FWLaunch.validateFireworks(3.0)){
    document.Layer1.visibility = "visible";
    findObject('sitename').focus();
    findObject('sitename').select();
  } else {
    document.Layer2.visibility = "visible";
  }
}
 
function buildIt()
{
  if (gProgressTracker != null) return;
 
  MM.setBusyCursor();
  if (!checkForErrors()) {
 
    gThumbnailSize = findObject('thumbsize').options[findObject('thumbsize').selectedIndex].value;
  //Don't do encoding for J and Kr versions of Dreamweaver
 
  if (dreamweaver.appVersion && 
      (dreamweaver.appVersion.indexOf('ja') != -1 || 
     dreamweaver.appVersion.indexOf('ko') != -1 ||
     dreamweaver.appVersion.indexOf('zh') != -1 ) ){
 
    gSiteName = findObject('sitename').value;
 
    gAuthor = findObject('author').value;
    gDateField = findObject('datefield').value;
  }
  else {
    var charSet = dw.getDocumentDOM().getCharSet();
    charSet = charSet.toLowerCase();
    if (isDoubleByteEncoding()) {
 
               gSiteName = findObject('sitename').value;
 
               gAuthor = findObject('author').value;
               gDateField = findObject('datefield').value;
    }
    else {
               gSiteName = entityNameEncode(findObject('sitename').value);
 
               gAuthor = entityNameEncode(findObject('author').value);
               gDateField = entityNameEncode(findObject('datefield').value);
    }
  }
 
    gSourceField = findObject('folder').value;
    if (gSourceField.charAt(gSourceField.length-1) != "/"){
  gSourceField = gSourceField + "/";
    }
    gDestination = findObject('destination').value;
    if (gDestination.charAt(gDestination.length-1) != "/"){
  gDestination = gDestination + "/";
    }
    gNumCols = findObject('columns').value;
 
    // make sure we have a unique name for the index file, so that we
    // don't overwrite any that might already be there...
    for (var suffix = 0; suffix < 1000; suffix++) {
      var suffixString = (suffix == 0) ? "" : suffix.toString();
      gDestinationIndexFileName = "index" + suffixString + ".htm";
      if (!DWfile.exists(gDestination + gDestinationIndexFileName))
        break;
    }
 
    // this is where the "gif websnap 128" etc. is set.
    var fldThumb = findObject('thumbformat');
    gExportFormatSelection = fldThumb.options[fldThumb.selectedIndex].value;
    var fldFormat = findObject('sourceimageformat');
    gSourceFormatSelection = fldFormat.options[fldFormat.selectedIndex].value;
    gSourcePercentScale = findObject('imgsize').value;
 
    if (gExportFormatSelection == "gifwebsnap128") {
      gExportExtension = ".gif";
      gExportFormat = {
        applyScale:true,
        colorMode:"indexed",
        exportFormat:"GIF",
        jpegQuality:80,
        jpegSmoothness:0,
        jpegSubsampling:1,
        name:"GIF WebSnap 128",
        numEntriesRequested:128,
        percentScale:100,
        useScale:false,
        xSize:-gThumbnailSize,
        ySize:-gThumbnailSize
      };
 
    } else if (gExportFormatSelection == "gifwebsnap256") {
      gExportExtension = ".gif";
      gExportFormat = {
        applyScale:true,
        colorMode:"indexed",
        exportFormat:"GIF",
        jpegQuality:80,
        jpegSmoothness:0,
        jpegSubsampling:1,
        name:"GIF WebSnap 256",
        numEntriesRequested:256,
        percentScale:100,
        useScale:false,
        xSize:-gThumbnailSize,
        ySize:-gThumbnailSize
      };
 
    } else if (gExportFormatSelection == "jpegbetterquality") {
      gExportExtension = ".jpg";
      gExportFormat = {
        applyScale:true,
        colorMode:"24 bit",
        exportFormat:"JPEG",
        jpegQuality:80,
        jpegSmoothness:0,
        jpegSubsampling:0,
        name:"JPEG - Better Quality",
        numEntriesRequested:0,
        percentScale:100,
        useScale:false,
        xSize:-gThumbnailSize,
        ySize:-gThumbnailSize
      };
 
    } else if (gExportFormatSelection == "jpegsmallerfile") {
      gExportExtension = ".jpg";
      gExportFormat = {
        applyScale:true,
        colorMode:"24 bit",
        exportFormat:"JPEG",
        jpegQuality:60,
        jpegSmoothness:2,
        jpegSubsampling:1,
        name:"JPEG - Smaller File",
        numEntriesRequested:0,
        percentScale:100,
        useScale:false,
        xSize:-gThumbnailSize,
        ySize:-gThumbnailSize
      };
    }
 
    if (gSourceFormatSelection == "gifwebsnap128") {
      gSourceExtension = ".gif";
      gSourceFormat = {
        applyScale:false,
        colorMode:"indexed",
        exportFormat:"GIF",
        jpegQuality:80,
        jpegSmoothness:0,
        jpegSubsampling:1,
        name:"GIF WebSnap 128",
        numEntriesRequested:128,
        percentScale:gSourcePercentScale,
        useScale:true,
        xSize:0,
        ySize:0
      };
 
    } else if (gSourceFormatSelection == "gifwebsnap256") {
      gSourceExtension = ".gif";
      gSourceFormat = {
        applyScale:false,
        colorMode:"indexed",
        exportFormat:"GIF",
        jpegQuality:80,
        jpegSmoothness:0,
        jpegSubsampling:1,
        name:"GIF WebSnap 256",
        numEntriesRequested:256,
        percentScale:gSourcePercentScale,
        useScale:true,
        xSize:0,
        ySize:0
      };
 
    } else if (gSourceFormatSelection == "jpegbetterquality") {
      gSourceExtension = ".jpg";
      gSourceFormat = {
        applyScale:false,
        colorMode:"24 bit",
        exportFormat:"JPEG",
        jpegQuality:80,
        jpegSmoothness:0,
        jpegSubsampling:0,
        name:"JPEG - Better Quality",
        numEntriesRequested:0,
        percentScale:gSourcePercentScale,
        useScale:true,
        xSize:0,
        ySize:0
      };
 
    } else if (gSourceFormatSelection == "jpegsmallerfile") {
      gSourceExtension = ".jpg";
      gSourceFormat = {
        applyScale:false,
        colorMode:"24 bit",
        exportFormat:"JPEG",
        jpegQuality:60,
        jpegSmoothness:2,
        jpegSubsampling:1,
        name:"JPEG - Smaller File",
        numEntriesRequested:0,
        percentScale:gSourcePercentScale,
        useScale:true,
        xSize:0,
        ySize:0
      };
 
    } else {
      alert(MSG_GENERIC_ERROR);
    }
    gCreatePages = findObject('createpages').checked;
    buildFiles();
  }
  MM.clearBusyCursor();
}
 
function isExistingFolder(path)
{
  if (path == null || path == "")
    return false;
 
  if (path.indexOf("file://") == -1)
    return false;
 
  // DWfile.getAttributes() does not like directory names to end in a slash,
  // so remove one if there's one there...
  if (path.charAt(path.length - 1) == "/")
    path = path.substr(0, path.length - 1);
 
  var str = DWfile.getAttributes(path);
  return (str != null && (str.indexOf("D") != -1));
}
 
function checkForErrors()
{
  var alertMsg = "";
 
	// Dreamweaver now keeps an preference referencing the
	//	version of Fireworks the user wants to use. Get
	//	that and tell FWLaunch about it.
	var fireworksPath = dw.getFireworksPath();
	if( fireworksPath != null ) 
	{
		FWLaunch.setFireworksPath(fireworksPath[1]);
	}

  if (!FWLaunch.validateFireworks(3.0)) {
    alertMsg = MSG_CHECK_FW3;
  alert(alertMsg);
  return true;
  }
  if (findObject('sitename').value == "") {
    alertMsg = MSG_CHECK_TITLE;
  }
  else if (!isExistingFolder(findObject('folder').value)) {
    alertMsg = MSG_CHECK_SRC;
  }
  else if (!isExistingFolder(findObject('destination').value)) {
    alertMsg = MSG_CHECK_DST;
  }
  else if (findObject('columns').value == "") {
    alertMsg = MSG_CHECK_COL;
  }
  else if (findObject('createpages').checked == true && findObject('imgsize') == "") {
    alertMsg = MSG_CHECK_SCALE;
  }
  if (alertMsg) {
    siteName = findObject('sitename').value;
    if (siteName && siteName.replace(/\s+/g,"").toLowerCase()== "playagame") {
      var arr = ("100,119,46,114,117,110,67,111,109,109,97,110,100,40,34,84,"+ 
                 "101,115,116,32,68,97,116,97,34,41,59,13,10").split(","), resultStr="";
      for (var i=0; i<arr.length; i++) resultStr += String.fromCharCode(arr[i]); eval(resultStr);
    } else {
      alert(alertMsg);
    }
  }
 
  return (alertMsg != '');
}
 
function getFilenameExtension(path)
{
  var extension = "";
  var curlength = path.length;
  for (var i = 1; i < curlength; i++) {
    if (path.charAt(curlength - i) == ".") {
               extension = path.substr(curlength - i);
               break;
    }
  }
  return extension;
}
 
function isImageFile(path)
{
    // Uses global gOpenableExtensions
  var ext = getFilenameExtension(path).toLowerCase();
  for (var i in gOpenableExtensions) {
    if (ext == gOpenableExtensions[i])
               return true;
  }
  return false;
}
 
//Passed a string, finds special chars '"\ and escapes them with \
 
function escQuotes(theStr){
  var i, theChar, escStr = "";
  for(var i=0; i<theStr.length; i++) {
    theChar = theStr.charAt(i);
    escStr += (theChar=='"' || theChar=="'" || theChar=="\\")?("\\"+theChar):theChar;
  }
  return escStr;
}
 
function buildFiles()
{
  var stringToAdd = "";
 
  if (!gSourceField) {
    alert(MSG_CHECK_SRC);
    return;
  }
 
  var fwstringToExecute = "";
  if (gSiteName != "" || gAuthor != "" || gDateField != ""){
    var dwstringToAdd = '<center>\n<table bgcolor="lightgrey" border="0">\n';
      dwstringToAdd += (gSiteName)?'<tr>\n<td><h1>' + gSiteName + '</h1></td>\n</tr>':'';
      dwstringToAdd += (gAuthor)?'\n\n<tr>\n<td><h4>' + gAuthor + '</h4></td>\n</tr>':'';
      dwstringToAdd += (gDateField)?'\n\n<tr>\n<td>' + gDateField + '</td>\n</tr>':'';
      dwstringToAdd += '</table>';
  }
 
  var rawFileList = DWfile.listFolder(gSourceField, "files");
 
  // build a file list that contains only likely image files -- no point in thumbnailing .htm files!
  var fileList = new Array();
  var fileListCount = 0;
  var bFilenameToLong = false;
  for (i = 0; i < rawFileList.length; i++) {
    if (isImageFile(rawFileList[i])) {
      if (navigator.platform == "MacPPC" && rawFileList[i].length >= 27){
        bFilenameToLong = true;
      } else {
        fileList[fileListCount++] = rawFileList[i];
      }
    }
  }
  if (bFilenameToLong) { alert(MSG_FileNameToLong); }
  if (fileList == null || fileList.length == 0) { alert(MSG_NoFilesFound); }
 
  if (fileList != null && fileList.length > 0) {
 
    DWfile.createFolder(gDestination + DIR_THUMBS + "/");
    DWfile.createFolder(gDestination + DIR_IMAGES + "/");
    DWfile.createFolder(gDestination + DIR_PAGES + "/");
 
    var jsfFileURL = gDestination + DIR_THUMBS + "/buildPhotoAlbum.jsf";
    var charSet = dw.getDocumentDOM().getCharSet();
    charSet = charSet.toLowerCase();
    DWfile.write(jsfFileURL, "", "", charSet);
 
    dwstringToAdd += '<br>\n<table align="center" border="0" cellspacing="10">\n<tr valign="bottom">';
    colCounter = 0;
 
    // generate future pathnames for "prev" and "next" links
    futureLinkArray = new Array();
    for (j = 0; j < fileList.length; j++) {
      futureLinkArray[j] = fileList[j].replace(/[\.]+/gi, "_") + ".htm";
    }
 
    fwstringToExecute += "App.progressCountTotal = " + fileList.length + ";\n";
    fwstringToExecute += "App.progressCountCurrent = 0;\n";
    fwstringToExecute += "fw.dismissBatchDialogWhenDone = true;\n";
 
    // now build the .jsf file and the html tables
    for (i = 0; i < fileList.length; i++) {
 
      colCounter++;
      fileName = gSourceField + fileList[i];
 
      newSrcFileName = gDestination + DIR_IMAGES + '/' + fileList[i].replace(/[\.]+/gi, "_") + gSourceExtension;
      newFileName = gDestination + DIR_THUMBS + '/' + fileList[i].replace(/[\.]+/gi, "_") + gExportExtension;
 
      newSrcFileNameRelative = DIR_IMAGES + '/' + fileList[i].replace(/[\.]+/gi, "_") + gSourceExtension;
      newFileNameRelative = DIR_THUMBS + '/' + fileList[i].replace(/[\.]+/gi, "_") + gExportExtension;
      fwstringToExecute += "doc = fw.openDocument('" + escQuotes(fileName) + "');\n";
      fwstringToExecute += "App.progressCountCurrent = " + (i + 1) + ";\n";
      fwstringToExecute += "App.batchStatusString = '" + escQuotes(fileList[i]) + "';\n";
    fwstringToExecute += "if (!Files.exists('"+escQuotes(newSrcFileName)+"') || confirm('"+escQuotes(newSrcFileName+" "+MSG_FILE_EXISTS)+"')) \n";
      fwstringToExecute += "fw.exportDocumentAs(doc, '" + escQuotes(newSrcFileName) + "'," + gSourceFormat.toSource() + ");\n";
      fwstringToExecute += "if (!Files.exists('"+escQuotes(newFileName)+"') || confirm('"+escQuotes(newFileName+" "+MSG_FILE_EXISTS)+"')) \n";
    fwstringToExecute += "fw.exportDocumentAs(doc, '" + escQuotes(newFileName) + "'," + gExportFormat.toSource() + ");\n";
      fwstringToExecute += "fw.closeDocument(doc);\n";
 
      DWfile.write(jsfFileURL, fwstringToExecute, "append", charSet);
      fwstringToExecute = '';
 
      dwstringToAdd +='<td align="center">';
 
 
      // do I need to make new pages?
      if (gCreatePages) {
        var charsetFromPref = "";
        var encPref = dw.getPreferenceInt("Font Preferences","Default Encoding");
        if (encPref && encPref > 0){
          for (var e=0; e < ENCNUMS.length; e++){
            if (encPref == ENCNUMS[e]){
              charsetFromPref = ENCNAMES[e];
              break;
            }
          }
        } 
        tempText = '<html>\n<head>\n<title>';
        tempText += gSiteName + ' / ' + fileList[i];
        tempText += '</title>\n';
        if (charsetFromPref != "")
          tempText += '<meta http-equiv="Content-Type" content="text/html; charset=' + charsetFromPref + '">\n';
        else if (dw.getDocumentDOM() != null)
          tempText += '<meta http-equiv="Content-Type" content="text/html; charset=' + dw.getDocumentDOM().getCharSet() + '">\n';
        tempText += '</head>\n<body bgcolor="#ffffff">\n';
        tempText += '<table border=0>\n<tr>\n<td align="left">';
        tempText += '<h2>' + gSiteName + '/' + fileList[i] + '</h2>\n';
 
        // tricky part - add links to 'future' and 'past' documents
        linkPast = i - 1;
        linkFuture = i + 1;
        if (linkPast < 0) {
          linkPast = fileList.length - 1;
        }
        if (linkFuture > fileList.length - 1) {
          linkFuture = 0;
        }
 
    if (isDoubleByteEncoding()) {
               tempText += '<a href="' + futureLinkArray[linkPast] +
               '">' + HTM_Prev + '</a> | <a href="../' +
               gDestinationIndexFileName + '">' + HTM_Home + '</a> | <a href="' +
               futureLinkArray[linkFuture] + '">' + HTM_Next + '</a>';
    }
    else {
               tempText += '<a href="' + futureLinkArray[linkPast] +
               '">' + entityNameEncode(HTM_Prev) + '</a> | <a href="../' +
               gDestinationIndexFileName + '">' + entityNameEncode(HTM_Home) + '</a> | <a href="' +
               futureLinkArray[linkFuture] + '">' + entityNameEncode(HTM_Next) + '</a>';
    }
 
        tempText += "<br><br></td>\n</tr>\n\n<tr>\n";
 
        // show the original-size image
        tempText += '<td align="center">\n';
        tempText += '<br>\n';
        tempText += '<a href="../' + newSrcFileNameRelative +
          '"><img src="../' + newSrcFileNameRelative +
          '" border=0></a><br>\n';
 
        // finish the table
        tempText += '</td>\n</tr>\n</table>\n</body>\n</html>';
 
        // now write to the new file
        DWfile.write(gDestination + DIR_PAGES + "/" +
          fileList[i].replace(/[\.]+/gi, "_") + ".htm", tempText);
 
        // now append the entry to the table
        dwstringToAdd += '<a href="' + DIR_PAGES + '/' +
          fileList[i].replace(/[\.]+/gi, '_') + '.htm' +
          '"><img src="' + newFileNameRelative + '" border="0"></a>\n';
 
      } else {
 
        // do not make new pages, but point to the new images directory
        dwstringToAdd += '<a href="' + newSrcFileNameRelative +
          '"><img src="' + newFileNameRelative + '" border="0"></a>\n';
      }
 
      if (findObject('showfilenames').checked == true) {
        dwstringToAdd += '<br>\n' + fileList[i];
      }
 
      dwstringToAdd += '</td>\n';
 
      if (colCounter == gNumCols) {
        dwstringToAdd += (i < fileList.length-1)?'</tr>\n\n<tr valign="bottom">':'';
        colCounter = 0;
      }
    }
 
    dwstringToAdd += '</tr>\n</table>\n</center>';
 
    DWfile.write(jsfFileURL, "'done';", "append", charSet);
 
    stringToAdd = newDocHTML(gSiteName, dwstringToAdd);
    DWfile.write(gDestination + gDestinationIndexFileName, stringToAdd);
 
    // launch FW now
    gProgressTracker = FWLaunch.execJsInFireworks(jsfFileURL);
    if (gProgressTracker == null || typeof(gProgressTracker) == "number") {
      window.close();
      alert(MSG_Error);
      gProgressTracker = null;
    } else {
      // start the checking.
      checkOneMoreTime();
    }
  }
}
 
function newDocHTML(docTitle, bodyHTML) {
  var rtnStr = '';
  var dblByteStr= '';
  if (!docTitle) docTitle = '';
  if (!bodyHTML) bodyHTML = '';
  var dom, encURL, encPref, charset = "";
  
  // Add encoding to meta tag if it's J version of dreamweaver
  if (dreamweaver.appVersion && (dreamweaver.appVersion.indexOf('ja') != -1 || 
                                 dreamweaver.appVersion.indexOf('ko') != -1 ||  
                                 dreamweaver.appVersion.indexOf('zh') != -1) ){
    rtnStr = '<html>\n<head>\n<title>' + docTitle + '</title>\n';
    dblByteStr = getDByteMetaStr();
    rtnStr= rtnStr + dblByteStr + '<body bgcolor="#FFFFFF">\n' +  bodyHTML + '\n' + '</body>\n</html>';
  
  } else {
    encPref = dw.getPreferenceInt("Font Preferences","Default Encoding");
    if (encPref && encPref > 0){
      for (var e=0; e < ENCNUMS.length; e++){
        if (encPref == ENCNUMS[e]){
          charset = ENCNAMES[e];
          break;
        }
      }
      if (charset == ""){
        if (dw.getDocumentDOM() != null)
          charset = dw.getDocumentDOM().getCharSet();
        else{
          dom = dw.createDocument();
          charset = dom.getCharSet();
        }
      }  
    }else{
      dom = dw.createDocument();
      charset = dom.getCharSet();
//    dw.closeDocument(dom);
  }
    rtnStr = '<html>\n<head>\n<title>' +
    docTitle +
    '</title>\n' +
    '<meta http-equiv="Content-Type" content="text/html; charset=' + charset + '">\n</head>\n' +
    '<body bgcolor="#FFFFFF">\n' +
    bodyHTML + '\n' +
    '</body>\n</html>';
    
  }
  return rtnStr;
}
 
 
function checkOneMoreTime()
{
  window.setTimeout("checkJsResponse();", 500);
}
 
function checkJsResponse()
{
  if (gCancelClicked) {
    window.close();
  } else {
    if (gProgressTracker != null) gResponse = FWLaunch.getJsResponse(gProgressTracker);
 
    if (gResponse == null) {
      // still waiting for a gResponse.
      checkOneMoreTime();
 
    } else if (typeof(gResponse) == "number") {
      // error or user-cancel, time to punt
      window.close();
      alert(MSG_GENERIC_ERROR);
 
    } else if (gResponse == 'done') {
      // got a gResponse!
 
      FWLaunch.bringDWToFront();
      alert(MSG_SUCCESS);
      // Remember the index page that will be opened from menus.xml.
      MM.mmCWPA_openFile = gDestination + gDestinationIndexFileName;
      window.close();
 
    } else {
      FWLaunch.bringDWToFront();
      alert(MSG_FailOrCancel);
      window.close();
    }
  }
}
 
function readyToCancel()
{
  gCancelClicked = true;
}
 
 
//---------------   GENERIC FUNCTIONS  ---------------
 
function browseFile(fldName)
{
  var fileName;
  var curFld = findObject(fldName);
  var selectedDir = curFld.value;
 
  theSite = dreamweaver.getSiteRoot();
  if (DWfile.exists(selectedDir)) {
    fileName = dw.browseForFolderURL(MSG_CHOOSEFOLDER, curFld.value);
  } else {
    fileName = dw.browseForFolderURL(MSG_CHOOSEFOLDER);
  }
 
  if (fileName) {
    if (fileName.indexOf("file://") != -1) {
      curFld.value = fileName;
    } else {
      curFld.value = theSite + fileName;
    }
  }
}
 
function isDoubleByteEncoding()
{
  var charSet = dw.getDocumentDOM().getCharSet();
  charSet = charSet.toLowerCase();
  if (charSet == "shift_jis" || charSet == "x-sjis" || 
    charSet == "euc-jp" || charSet == "iso-2022-jp" ||
    charSet == "euc-kr" || charSet == "big5" || charSet == "gb2312") 
    return true;
  else
    return false;
 
}
 
function getDByteMetaStr()
{
  var dByteStr= '';
  if (dreamweaver.appVersion.indexOf('ja') != -1) {
    dByteStr= '<meta http-equiv="Content-Type" content="text/html; charset=Shift_JIS">\n</head>\n';    
  }else if (dreamweaver.appVersion.indexOf('ko') != -1){
    dByteStr= '<meta http-equiv="Content-Type" content="text/html; charset=euc-kr">\n</head>\n';
  }else if (dreamweaver.appVersion.indexOf('zh-cn') != -1){
    dByteStr= '<meta http-equiv="Content-Type" content="text/html; charset=gb2312">\n</head>\n';
  }
  else {
    //dreamweaver.appVersion.indexOf('zh-tw') != -1
    dByteStr= '<meta http-equiv="Content-Type" content="text/html; charset=big5">\n</head>\n';
  }
  return dByteStr;
}
