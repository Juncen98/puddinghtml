// Copyright 2000, 2001, 2002, 2003, 2004 Macromedia, Inc. All rights reserved.
function updateColorPicker(controlType, buttonControl, textControl)
{
  var colorCP, colorF;
  if (controlType == "colorPicker")
  {
  colorCP = buttonControl.value;
  textControl.value = colorCP;
  }
  else if (controlType == "colorField")
  {
  colorCP = buttonControl.value;
  colorF = textControl.value;
  if (colorF && isHexColor(colorF))
  {
    colorF = "#"+colorF;
    textControl.value = colorF;
  }
  if (colorCP != colorF)
  {
    buttonControl.value =  colorF;   // this line does not always work (bug in colorpicker, does not update "")
//      buttonControl.setAttribute("value",colorF);
    if (buttonControl.value != colorF)
    {
      alert(dwscripts.sprintf(MM.MSG_InvalidColor,colorF));
      textControl.value = "";
    }
  }
  }
}

// checks to see if "theColor" is a hex color with no # sign in front
function isHexColor (theColor)
{
  var pattern = new RegExp("\[a-fA-F0-9\]\{"+theColor.length+"\}");
  var retVal = false;
  if (theColor.length==6 && theColor.search(pattern)!=-1)
    retVal = true;
  return retVal;
}

// updates the style attribute for the given control
function updateStyle(control,pattn,replacemt)
{
  var styleAttribute;
  styleAttribute = control.getAttribute("style");
  styleAttribute = styleAttribute.replace(pattn,replacemt)
  control.setAttribute("style", styleAttribute);
}

function convertPtToTwip(point)
{
  //return (point*72);
  return (point*20);
}

function createWarningMsgHTML(msg, imagePath)
{
  var retVal = new Array();
  if (imagePath)
    retVal.push('<img src="'+ imagePath + '" width="12" height="12" > ');
  retVal.push(msg);
  return retVal.join("");
}

// function returns true if link is absolute
function isAbsLink(url)
{
  var retVal = false;
  if (url.length > 0 && (url.substring(0,7).toLowerCase()=="http://" || url.substring(0,8).toLowerCase()=="https://")){
    retVal=true;
  }
  return retVal;
}

function isSiteRelative(url)
{
  var retVal = false;
  if (url.length > 0 && url.charAt(0)=='/')
    retVal = true;
  return retVal;
}

function addExtention(filename, extension)
{
  var retVal;
  lowercaseFN = filename.toLowerCase();
  if (lowercaseFN.lastIndexOf("."+extension.toLowerCase())!= filename.length-4)
    retVal=filename + "." + extension;
  else
    retVal = filename;
  return retVal;
}

// returns the directory for the given filepath
function getDocumentDir(theUrl)
{
  var retVal,index;
  retVal = theUrl;
  index = retVal.lastIndexOf("/");
  retVal = retVal.substring(0,index);
  return retVal;
}

function isDocRel(url)
{
  return (
         !isSiteRelative(url) &&
         !isAbsLink(url) &&
         url!="" &&
         url.toLowerCase().indexOf("mailto:")==-1 &&
         url.toLowerCase().indexOf("file:///")==-1 &&
         url.toLowerCase().indexOf("javascript:")==-1 &&
         url.charAt(0)!= "#"
         )
}

function generatorErrorMsg(createFileMsg,fileName)
{
  var generatorMsgArray = new Array("invalidData","initGeneratorFailed","outOfMemory","unknownError");
  var returnMsgArray;
  if ( "macos" == DWfile.getPlatform() )
    returnMsgArray = new Array(MSG_InvalidData,MSG_InitGeneratorFailedMac,MSG_OutOfMemory,MSG_UnknownError);
  else
    returnMsgArray = new Array(MSG_InvalidData,MSG_InitGeneratorFailed,MSG_OutOfMemory,MSG_UnknownError);
  var retVal = "";
  if (createFileMsg == "invalidTemplateFile")
//    retVal = dwscripts.sprintf(MSG_InvalidTemplate);
    retVal =  dwscripts.sprintf(MSG_InitGeneratorFailed);
  else if (createFileMsg == "invalidOutputFile")
    retVal = dwscripts.sprintf(MSG_InvalidFileName,fileName);
  else
  {
    for (var i=0;i<generatorMsgArray.length;i++)
    {
      if (createFileMsg == generatorMsgArray[i])
    {
      retVal = returnMsgArray[i];
      break;
    }
    }
  }
  return retVal;
}

function createFileName(baseName, maxLength, counter)
{
  var fileName;
  if (baseName.length >= maxLength)
    fileName = baseName.substring(0,maxLength-counter.toString().length-1)+"~"+counter+".swf";
  else
    fileName = baseName + counter + ".swf";
  return fileName;
}

function createUniqueFilename(baseName, fileDirectory, maxLength)
{
  var dupe=true,counter=1, fileObj, filterFunction, filesArray, i, fileName;
  var fileName;
  fileName = createFileName(baseName, maxLength, counter);
  fileObj = new File(fileDirectory);
  filterFunction =  new Function("x", "return (x.isFile()) && (x.getExtension().toLowerCase()=='swf');");
  filesArray = fileObj.listFolder(filterFunction);
  while (dupe==true)
  {
    dupe=false;
    fileName = createFileName(baseName, maxLength, counter++)
    for (i=0;dupe==false && i<filesArray.length;i++)
    {
      if (filesArray[i].toLowerCase()== fileName.toLowerCase())
        dupe=true;
    }
  }
  return fileName;
}

function getValueFromParameters(name, paramArray)
{
  var retVal, found = false;
  for (var i=0; i<paramArray.length; i+=2)
  {
    if (paramArray[i] == name)
  {
    retVal = paramArray[i+1];
    found = true;
    break;
  }
  }
  return (found) ? retVal : null;
}

function setFlashAttribute(tagType,attr,value,selection,tagToAdd,deleteNode)
{
  var paramNodeArray = new Array();
  var embedNodeArray = new Array();
  var objectNode;
  var found=false;
  var paramTag="";
  if (selection.tagName == "OBJECT")
    objectNode = selection;
  else if (selection.tagName == "EMBED")
    embedNodeArray.push(selection);
  if (objectNode && objectNode.hasChildNodes())
  {
    paramNodeArray = selection.getElementsByTagName("PARAM");
    embedNodeArray = selection.getElementsByTagName("EMBED");
  }
  if (tagType=="EMBED" || tagType=="OBJECT")
  {
    if (tagType=="EMBED" && (embedNodeArray[0] && embedNodeArray[0].nodeType==Node.ELEMENT_NODE))
      embedNodeArray[0].setAttribute(attr,value);
    else if (objectNode && objectNode.nodeType==Node.ELEMENT_NODE && tagType=="OBJECT")
      objectNode.setAttribute(attr,value);
  }
  else   // parameter tag
  {
    for(var i=0; i < paramNodeArray.length; i++)
    {
      if (paramNodeArray[i].getAttribute("NAME").toLowerCase()==attr.toLowerCase())
      {
        if (deleteNode)
          paramNodeArray[i].outerHTML = "";
        else
          paramNodeArray[i].setAttribute("VALUE",value);
        found=true;
        break;
      }
    }
    if (!found && objectNode && (deleteNode != true))
    {
      paramTag = '\n<param name="'+attr+ '" value="'+value+'">\n';
      tagToAdd.push(paramTag);
    }
  }
}

function absoluteToRelativeURL(absURL, docURL,check)
{
  var newRef, fullURL, index, filePath, docPath;
    if ((!check || DWfile.exists(absURL)) && absURL)
  {
      newRef = '';
      fullURL = absURL;
      if (docURL && fullURL.indexOf(docURL) == 0)
        newRef = fullURL.substring(docURL.length); // doc relative, below doc
      else if (docURL) {  // doc relative, above doc
        for (index=0; index < fullURL.length && index < docURL.length; index++)
          if (fullURL.charAt(index) != docURL.charAt(index)) break;
        index = fullURL.substring(0, index).lastIndexOf(File.separator)+1; // backup to last directory
        filePath = fullURL.substring(index);
        docPath = docURL.substring(index);
        if (docPath && docPath.indexOf('|') == -1) {  // image on a separate drive
          for (var j=0; j < docPath.length; j++)
            if (docPath.charAt(j) == File.separator) newRef += "../";
          newRef += filePath;
      } }
      if (!newRef) newRef = fullURL;  // local file ref

    }
  return newRef;
}

// return true if links are valid for Flash object
function checkLink(theLink,swfUrl,docUrl)
{
  if (isSiteRelative(theLink))
  {
    alert(dwscripts.sprintf(MSG_InvalidLink,theLink,LABEL_SiteRelativeLink));
    return false;
  }
  else if (theLink.toLowerCase().indexOf("file:///") != -1)
  {
    alert(dwscripts.sprintf(MSG_InvalidLink,theLink,LABEL_LocalFileURL));
  return false;
  }
  if (isDocRel(theLink) && isFromDiffFolder(docUrl,swfUrl))
  {
    alert(MSG_NoFlashTextDocRelLinkDiffFolder);
  return false;
  }
  else
    return true;
}

function isFromDiffFolder(urlOne,urlTwo)
{
  return (getDocumentDir(urlOne) != getDocumentDir(urlTwo))
}

// resolvesFilePath to absolute url and adds given extension. returns "" is url can't be resolved
function resolveFilePath(origURL,docURL,extension)
{
  var retVal;
  var theFile;
  if (origURL && origURL.charAt(0) != " ")
    retVal = addExtention(origURL,extension);
  theFile  = new File(retVal,docURL);
  if (!theFile.isAbsolute())
    retVal = theFile.getAbsolutePath();
  return retVal;
}

function getSelectedNodeAttr(attr, docDOM)   // only goes two levels deep
{
  var selectedNode, retVal,fileURL, childNodes;
  var found = false ;
  if (docDOM)
  {
    selectedNode = docDOM.getSelectedNode();
    childNodes = selectedNode.childNodes;
    retVal = selectedNode.getAttribute(attr);
    if (retVal)
      found = true
    else
    {
      for (var i=0; i<childNodes.length;i++)
      {
        if (childNodes[i].tagName == "PARAM")
        {
          var name = childNodes[i].getAttribute("NAME");
          if (name != null && name.toLowerCase()==attr.toLowerCase())
            retVal = childNodes[i].getAttribute("VALUE");
        }
        else
          retVal = childNodes[i].getAttribute(attr);
        if (retVal)
          found = true;
      }
    }
  }
  return (found) ? retVal : null;
}

function isInteger(number)
{
  return (parseInt(number)==number && number!="");
}

function getSimpleName(filenameArray)
{
  var i, extStr, extIndex, retVal = new Array();
//  extStr="."+extension;
  extStr = ".";
  for (i=0;i<filenameArray.length;i++)
  {
    extIndex=filenameArray[i].lastIndexOf(extStr);
    if (extIndex == filenameArray[i].length-4)
    retVal[i] = filenameArray[i].substring(0,extIndex);
  }
  return retVal;
}

function truncateFileName(maxLength, fullFilePath)
{
  var startIndex,endIndex,fileDirectoryPath,fullFilePathNE;
  startIndex = fullFilePath.lastIndexOf("/");
  if (startIndex == -1)
    startIndex = 0;
  endIndex = fullFilePath.toLowerCase().lastIndexOf(".swf");
  if (endIndex != -1)
  fullFilePathNE = fullFilePath.substring(0,endIndex);
  else
    fullFilePathNE = fullFilePath;
  if (fullFilePathNE.substring(startIndex+1).length > maxLength)
  {
    fullFilePath = addExtention(fullFilePath.substring(0,startIndex+maxLength+1),"swf");
    if (DWfile.exists(fullFilePath))
    {
      fileDirectoryPath = getDocumentDir(fullFilePath);
      fileName = fullFilePath.substring(startIndex+1);
      fileName = createUniqueFilename(fileName.substring(0,fileName.length-4), fileDirectoryPath,maxLength);
      fullFilePath = fileDirectoryPath + "/" + fileName;
    }
  }
  return fullFilePath;
}

// filters out all the vertical double byte fonts and double byte fonts
// without outline info (Chu Gothic,Narrow Mincho) mac only bug
function filterFonts(fontArray)
{
  var vertFont = "@";
  var retVal = new Array();
  var excludeFont;
  var excludeFonts = new Array("%8D%D7%96%BE%92%A9%91%CC", "%92%86%83S%83V%83b%83N%91%CC", "AppleMyungjo", "Apple%20LiSung%20Light", "Apple%20LiGothic%20Medium", "AppleGothic", "BiauKai", "Fang%20Song","Hei", "Kai","Song");

  var bIsDoubleByteVersion = false;
  if (dreamweaver.appVersion && ( dreamweaver.appVersion.indexOf('ja') != -1 ||
           dreamweaver.appVersion.indexOf('ko') != -1 || 
           dreamweaver.appVersion.indexOf('zh') != -1))
     bIsDoubleByteVersion = true;
     
  for (var i=0; i<fontArray.length;i++){
  excludeFont = false;
  if (navigator.platform.indexOf("W") == -1){
    for (var j=0;j<excludeFonts.length;j++){
        if (escape(fontArray[i])==excludeFonts[j]){
          excludeFont=true;
          break;
        }
      }
    }
    if (fontArray[i].charAt(0) != vertFont && !excludeFont)
    {
      if  (bIsDoubleByteVersion || !hasDoubleByteChar(fontArray[i]) )
        retVal.push(fontArray[i])
    }
  }
  return retVal;
}

function isDoubleByteChar(theChar)
{
  var charNum = theChar.charCodeAt(0); //convert to number
  return (charNum>0xFF);
}

function hasDoubleByteChar(theStr){
  var retVal=false;
  for (var i=0; i< theStr.length; i++){
    if (isDoubleByteChar(theStr.charAt(i))){
      retVal=true;
      break
    }
  }
  return retVal;
}

// Resolves the path. Returns user config path if the file exists
function resolveConfigPath(filePath)
{
  resolvedPath = dw.getTempFolderPath();
  resolvedPath = resolvedPath.substring(0,resolvedPath.lastIndexOf("/"));
 
  index = filePath.lastIndexOf("Configuration");
  if (index > -1)
  {
    resolvedPath += filePath.substring(index+13, filePath.length);
    if (!DWfile.exists(resolvedPath))
      resolvedPath = filePath;
  }
  else
    resolvedPath = filePath;

  return resolvedPath;
}
