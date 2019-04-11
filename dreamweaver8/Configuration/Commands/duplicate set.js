// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS *****************
var FILE_CONFIG_PATH = dw.getConfigurationPath();
var FILE_CUSTOM_SET = FILE_CONFIG_PATH + "/Menus/Custom Sets";
var PLATFORM = navigator.platform;
//******************* API **********************
function commandButtons()
{
   return new Array( MM.BTN_OK,  "cmdOK()"
                   , MM.BTN_Cancel, "cmdCancel()");
}

function cmdOK()
{
  var newSetName, facSetArray = new Array(), custSetArray = new Array();
  var canWrite = true,fileCopied;
  var oldFileName = MM.commandArgument[0];
  var currentShortcutList = MM.commandArgument[1];
  var oldName = currentShortcutList.shortcutListName;
  
  if (getExtension(oldFileName) != "xml")
    oldFileName += ".xml";
  
  newSetName = document.duplicateSetNameField.value;
  
  if (newSetName.lastIndexOf(".xml") != newSetName.length-4){
    newSetFilename = newSetName + ".xml";
  }else{
    newSetFilename = newSetName;
  }

  if (isSet(newSetName, "factory"))   // check to see if name used by factory set
  {
    alert(errMsg(MSG_NameUsedByFactorySet, newSetName));
    canWrite = false;
  }
  else if (isSet(newSetName, "custom"))
  {
    if (oldFileName == newSetFilename)
  {
    alert(MSG_SetNameIsTheSame);
    canWrite = false;
  }
    if (!confirm(errMsg(MSG_ShortcutSetAlreadyExists,newSetName)))
    canWrite = false;
  }
  if (canWrite)
  {
    fileCopied = currentShortcutList.writeToShortcutXML(FILE_CUSTOM_SET+"/"+newSetFilename,newSetName);
    currentShortcutList.shortcutListName = oldName;
    if (!fileCopied)
      alert(errMsg(MSG_InvalidFileNameCannotSave, newSetFilename));
    else
    {
      MM.commandReturnValue = newSetName;
      window.close();
    }
  }
}

function cmdCancel()
{
  window.close();
}
//***************** LOCAL FUNCTIONS  ******************

function initializeUI()
{
  var origSetFilename = MM.commandArgument[0]; // orig Set Name should be passed in
  var origSetFile = FILE_CUSTOM_SET + "/" + origSetFilename;
  var origSetDOM = dw.getDocumentDOM(origSetFile);
  var origSetName = origSetDOM.getElementsByTagName('SHORTCUTSET')[0].getAttribute('name');
  
  var newSetName = origSetName + " "+LABEL_Copy;
  document.duplicateSetNameField.value = newSetName;
  document.duplicateSetNameField.focus();
  document.duplicateSetNameField.select();
}

function getCustomSetList(setType)
{
  var fileObj, filterFunction;
  fileObj = new File(FILE_CUSTOM_SET);
  if (setType == "factory")
    filterFunction =  new Function("x", "return (x.isFile()) && (x.getAttributes() == 'R') && (x.getExtension()== 'xml');");
  else
    filterFunction =  new Function("x", "return (x.isFile()) && (x.getAttributes() != 'R') && (x.getExtension()== 'xml');");
  return fileObj.listFolder(filterFunction);
}

function isSet(setName, setType)
{
  var facSetArray = new Array(), i, retVal = false;
  facSetArray = getCustomSetList(setType);
  for (i=0; i<facSetArray.length; i++)
  {
    if (facSetArray[i] == setName)
  {
    retVal = true;
    break;
  }
  }
  return retVal;
}

function getExtension(fileName)
{
  var retVal = "", index;

  index = fileName.lastIndexOf(".");
  if (index != -1)
    retVal = fileName.substring(index+1);
  return retVal;
}


function createUniqueFilename(baseName, fileDirectory, maxLength)
{
  var dupe=true,counter=1, fileObj, filterFunction, filesArray, i, fileName;
  var fileName;
  fileName = createFileName(baseName, maxLength, counter);
  fileObj = new File(fileDirectory);
  filterFunction =  new Function("x", "return (x.isFile()) && (x.getExtension().toLowerCase()=='xml');");
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

function createFileName(baseName, maxLength, counter)
{
  var fileName;
  if (baseName.length >= maxLength)
    fileName = baseName.substring(0,maxLength-counter.toString().length-1)+"~"+counter+".xml";
  else
    fileName = baseName + counter + ".xml";
  return fileName;
}