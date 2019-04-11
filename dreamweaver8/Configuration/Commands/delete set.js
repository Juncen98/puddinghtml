// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS *****************
var FILE_CONFIG_PATH = dw.getConfigurationPath();
var FILE_CUSTOM_SET = FILE_CONFIG_PATH + "/Menus/Custom Sets";

//******************* API **********************
function commandButtons()
{
   return new Array( BTN_Delete,  "cmdDelete()"
                   , MM.BTN_Cancel, "cmdCancel()");
}

function cmdDelete()
{
  var deleteSetName;
  deleteSetName = LIST_SETS.get();
  // check to see if it is the active set : argument passed by callCommand
  if (deleteSetName.indexOf(LABEL_ActiveSet) == -1)
  {
    if (DWfile.remove(FILE_CUSTOM_SET + "/" + deleteSetName + ".xml"));
      MM.commandReturnValue = true;
    window.close();
  }
  else
    alert(MSG_CannotDeleteActiveSet);
}

function cmdCancel()
{
  window.close();
}
//***************** LOCAL FUNCTIONS  ******************

function initializeUI()
{ 
  var setArray = new Array(), activeSetName,i;  
  activeSetName = MM.commandArgument;
  LIST_SETS = new ListControl("customSetsList");
  
  setArray = getSimpleName(getCustomSetList("custom"));
  // find the active set and change label (active set)
  for (i=0; i<setArray.length;i++)
  {
    if (setArray[i] == activeSetName)
	  setArray[i] += " "+LABEL_ActiveSet;
  }
  LIST_SETS.setAll(setArray);
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

function getSimpleName(filenameArray)
{
  var i;
  for (i=0;i<filenameArray.length;i++)
  {
    if (filenameArray[i].lastIndexOf(".xml") == filenameArray[i].length-4) 
	  filenameArray[i] = filenameArray[i].replace(/.xml/,""); 
  }
  return filenameArray;
}
