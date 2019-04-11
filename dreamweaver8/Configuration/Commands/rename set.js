// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS *****************
var FILE_CONFIG_PATH = dw.getConfigurationPath();
var FILE_CUSTOM_SET = FILE_CONFIG_PATH + "/Menus/Custom Sets";

//******************* API **********************
function commandButtons()
{
   return new Array( MM.BTN_OK,  "cmdOK()"
                   , MM.BTN_Cancel, "cmdCancel()");
}

function cmdOK(){
  var newSetName, newSetFilename, facSetArray = new Array(), custSetArray = new Array();
  var canWrite = true;
  var oldFileName = MM.commandArgument;
  
  if (getExtension(oldFileName) != "xml")
    oldFileName += ".xml";
  newSetName = document.renameSetNameField.value;
  
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
  else if (isSet(newSetFilename, "custom"))
  { 
    if (oldFileName == newSetFilename)
	  {
	    alert(MSG_SetNameIsTheSame);
	    canWrite = false;
	  }
     else if (!confirm(errMsg(MSG_ShortcutSetAlreadyExists,newSetName)))
	     canWrite = false;
  }
  if (canWrite){
    var oldFileContents = DWfile.read(FILE_CUSTOM_SET +"/"+ oldFileName);
    var newFileContents = oldFileContents.replace(/<SHORTCUTSET name="[^"]*">/i,'<SHORTCUTSET name="' + newSetName + '">');
    if (!DWfile.write(FILE_CUSTOM_SET+"/"+newSetFilename,newFileContents)){
  	  alert(errMsg(MSG_InvalidFileNameCannotSave, newSetFilename));
    }else{
	    DWfile.remove(FILE_CUSTOM_SET +"/"+ oldFileName);
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
  var origSetFilename = MM.commandArgument; // orig Set Filename should be passed in 
  var origSetFile = FILE_CUSTOM_SET + "/" + origSetFilename;
  var origSetDOM = dw.getDocumentDOM(origSetFile);
  var origSetName = origSetDOM.getElementsByTagName('SHORTCUTSET')[0].getAttribute('name');
  
  document.renameSetNameField.value = origSetName;
  document.renameSetNameField.focus();
  document.renameSetNameField.select();
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

function getSimpleName(fileName)
{
  var index; retVal = fileName;
  
  index = fileName.lastIndexOf(".");
  if (index != -1)
    retVal = fileName.substring(0,index);
  return retVal;
}