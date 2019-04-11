// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************


var HELP_DOC = MM.HELP_cmdCreateComponent;

var SECTION_LIST = "";
var LABEL_ACCESSES = new Array ("private", "package", "public", "remote");
var DEFAULT_ACCESS = "public";
var LABEL_TYPES =  new Array(
  "any","array","binary","boolean","date","GUID","numeric",
  "query","string","struct","UUID","variableName");
  
var LABEL_PARENT_CFCS = new Array();
var LABEL_CFC_ROOTS = new Array();
  
var COMPONENT_INFO = "";
var FILE_DIR = "";

var TEMPLATE_URL = dw.getConfigurationPath() + "/CFComponentTemplate.cfc"
var errorCount = 0;

var FORWARD_SLASH = "/";
var BACK_SLASH = "\\"


// TODO:
//   Implement validation
//   Remove localizable strings


// ******************* API **********************

//--------------------------------------------------------------------
// FUNCTION:
//   commandButtons
//
// DESCRIPTION:
//   The list of buttons to display on the right of the dialog,
//   along with the functions to call when they are pressed.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   javascript array
//--------------------------------------------------------------------

function commandButtons()
{
	return new Array(MM.BTN_OK,     "okClicked();",
                   MM.BTN_Cancel, "cancelClicked()",
                   MM.BTN_Help,   "displayHelp();");
}


//--------------------------------------------------------------------
// FUNCTION:
//   canAcceptCommand
//
// DESCRIPTION:
//   Called to determine if the command can be displayed.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean - true if the dialog can be launched
//--------------------------------------------------------------------

function canAcceptCommand()
{
  return ((dw.getDocumentDOM() && dw.getDocumentDOM().getParseMode() == 'html') &&
 (((dw.getFocus() == 'document') 
    && (dreamweaver.getDocumentDOM("document").body)) ||
    (dw.getFocus(true) == 'html' || dw.getFocus() == 'textView')) );
}


//--------------------------------------------------------------------
// FUNCTION:
//   okClicked
//
// DESCRIPTION:
//   Called when the OK button is pressed.  Saves the Component.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function okClicked()
{
  T.finish();
  
  var errMsg = COMPONENT_INFO.validate();
  
  if (!errMsg)
  {
    errMsg = saveToFile();
  }
  
  if (errMsg)
  {
    var fullMsg = MSG_Error_Header + "\r\n" +
      "==================================================\r\n\r\n" +
        errMsg;
    // reset the _errorCount
    errorCount = 0;
    alert(fullMsg);
    //alert(errMsg);
  }
  else if( errMsg == "" )
  { // null == declined creating subdirectory    
    window.close();
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   cancelClicked
//
// DESCRIPTION:
//   Called when the Cancel button is pressed.  Dismiss the dialog.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function cancelClicked()
{
  window.close();    
}


//--------------------------------------------------------------------
// FUNCTION:
//   displayHelp
//
// DESCRIPTION:
//   Displays the built-in Dreamweaver help.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function displayHelp()
{
  // Replace the following call if you are modifying this file for your own use.
  dwscripts.displayDWHelp(HELP_DOC);
}


// ***************** LOCAL FUNCTIONS  ******************

//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//   Prepare the dialog and controls for user input
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function initializeUI()
{
  // fill the array before the component section is initialized
  LABEL_PARENT_CFCS = getParentCfcs();

  LABEL_CFC_ROOTS = getCfcRoots();
  COMPONENT_INFO = new ComponentInfo();

  SECTION_LIST = new ListControl("section");  
  SECTION_LIST.setAll(LABEL_SECTIONS, VALUE_SECTIONS);  
  SECTION_LIST.setIndex(0);

  //Initialize the TabControl.  (Pass in the prefix used for the tab layers)
  T = new TabControl('Tab');
  //Add tab pages.   (Pass the layer name, and the page object)
  T.addPage("componentSection", new ComponentsPage());
  T.addPage("propertiesSection", new PropertiesPage());
  T.addPage("methodsSection", new MethodsPage());
  T.addPage("parametersSection", new ParametersPage());

  //Initialize the display.  Start with the selected page
  T.start(SECTION_LIST.getValue());

  MM.CFCfileToOpen = "";
}

//--------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//   Called by the main UI components to respond to events
//
// ARGUMENTS:
//   theItemName - string - the name of the form control which
//     generated the event
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function updateUI(theItemName)
{
  if (theItemName == "section")
  {
    T.showPage(SECTION_LIST.getValue())
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   saveToFile
//
// DESCRIPTION:
//   Saves the current settings to the component file
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - error message if any
//--------------------------------------------------------------------

function saveToFile()
{
  var errMsg = "";
  
  // Get the file name
  fileURL = getFileURL();

  // fileExists returns true for ""?
  if ("" != fileURL)
  {
    if ( dwscripts.fileExists(fileURL))
      {
      // display confirmation message
      if (!confirm(MSG_OverwriteExisting))
      {
        //return MSG_DeclinedOverwrite;
        return null; // do not show error message if user doesn't want to overwrite
      }
    }
  } else {
    return null; // user declined creating subfolders?
  }

  var fileOutput = new Array();
  fileOutput.push( dwscripts.sprintf(LABEL_FileGeneratedBy, dw.appName, dw.appVersion, new Date()) );
  fileOutput.push(COMPONENT_INFO.serialize());
  
  //alert(fileOutput.join(""));

  if (!dwscripts.setFileContents(fileURL, fileOutput.join("")))
  {
    errMsg = dwscripts.sprintf(MSG_FileWriteError,fileURL);
  }
  else
  {
 	//  We don't want to actually open the CFC file here.  At first blush this might seem
 	//  like the right thing to do.  However, there is a problem if we try to do so.  That
 	//  problem concerns some very complicated stuff regarding edit ops and when to
 	//  suspend/continue them.  It is too complicated to explain here.  Suffice it to say
 	//  that the better way to do this is to set a variable here and let the caller
 	//  (in CFCs.js) do the actual opening of the document.
 
 	MM.CFCfileToOpen = fileURL;
  }
  
  return errMsg;
}


//--------------------------------------------------------------------
// FUNCTION:
//   saveToTemplate
//
// DESCRIPTION:
//   Saves the current settings to a template
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - error message if any
//--------------------------------------------------------------------

function saveToTemplate()
{
  var errMsg = "";
  
  var fileOutput = new Array();
  fileOutput.push( dwscripts.sprintf(LABEL_FileGeneratedBy, dw.appName, dw.appVersion, new Date()) );
  fileOutput.push(COMPONENT_INFO.serialize());

  //alert(fileOutput.join(""));

  if (!dwscripts.setFileContents(TEMPLATE_URL, fileOutput.join("")))
  {
   errMsg = dwscripts.sprintf(MSG_FileWriteError,TEMPLATE_URL);
  }
  else
  {
    alert(MSG_TemplateSaved);
  }
  
  return errMsg;
}


//--------------------------------------------------------------------
// FUNCTION:
//   loadFromTemplate
//
// DESCRIPTION:
//   Reads in the component setting from a template
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function loadFromTemplate()
{
  var retVal = false;
  
  if (dwscripts.fileExists(TEMPLATE_URL))
  {  
    var fileContents = dwscripts.getFileContents(TEMPLATE_URL);

    if (fileContents)
    {
      var retVal = COMPONENT_INFO.deserialize(fileContents);
    }

    if (!retVal)
    {
      alert("ERROR parsing template file");
    }
  }
  else
  {
    // alert template does not exist
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getFileURL
//
// DESCRIPTION:
//   Returns the full URL for the current component file
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function getFileURL()
{
  var retVal = "";
  
  if (FILE_DIR && COMPONENT_INFO.name)
  {
    if( normalizedDirectory() )
    {
      retVal = FILE_DIR + COMPONENT_INFO.name + ".cfc";
    }
    
  }
  
  return retVal;
}

//--------------------------------------------------------------------
// FUNCTION:
//   normalizedDirectory
//
// DESCRIPTION:
//   - converts the FILE_DIR to Local URL
//   - appends BACK_SLASH or FORWARD_SLASH as necessary
//   - confirms creation of non-existent subdirectories
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean if nothing went wrong
//--------------------------------------------------------------------

function normalizedDirectory() {
  var originalDirectory = FILE_DIR;
  var directory = dwscripts.filePathToLocalURL(FILE_DIR);
  var lastChar = directory.charAt(directory.length-1);

  if( lastChar != FORWARD_SLASH && lastChar != BACK_SLASH )
  {
    // attempt to find the appropriate slash to use
    if( directory.indexOf(BACK_SLASH) > -1 )
    {
      directory += BACK_SLASH;
    } 
    else
    {
      directory += FORWARD_SLASH;
    }
  }
  FILE_DIR = directory;

  // confirm with the user to create non-existent directories
  if( !DWfile.exists(directory) )
  {
    if( confirm( dwscripts.sprintf(MSG_CreateDirectory, originalDirectory) ) )
    {
     //DWfile.createFolder(compFileDir);
      return createFolder(directory);
    }
    else
    {
      return false;
    }
  }
  return true;
}

//--------------------------------------------------------------------
// FUNCTION:
//   createFolder
//
// DESCRIPTION:
//   - cut and pasted from Configuration/WebServices/ProxyGenerators/DefaultProxyGen.js
//   - doesn't work with multiple subdirectories when using UNC path of \\compname\compdir
//
// ARGUMENTS:
//   folderURL - the full folder URL
//
// RETURNS:
//   boolean if nothing went wrong
//--------------------------------------------------------------------
function createFolder(folderURL)
{
  var fileFolderURL = MMNotes.localURLToFilePath(folderURL);
  if (fileFolderURL)
  {
    var start = 0, index = -1, nextindex = -1, folder;
    while (index < fileFolderURL.length)
    {
      index = ((fileFolderURL.indexOf("\\", start)) || (fileFolderURL.indexOf("/", start)));
      if (index != -1)
      {
        folder = fileFolderURL.substr(0, index);
        if (!DWfile.exists(MMNotes.filePathToLocalURL(folder)))
        {
          if (DWfile.createFolder(MMNotes.filePathToLocalURL(folder)))
          {
            start = index + 1;
          }
          else  
            return false;
        }
        else
        {
          start = index + 1;
        }
      } // index != -1
      else
      {
        folder = fileFolderURL;
        if (!DWfile.exists(MMNotes.filePathToLocalURL(folder)))
        {
          if (!DWfile.createFolder(MMNotes.filePathToLocalURL(folder)))
            return false;
          else
            return true;  
        }
        else
          break;  
      }
    } // while
  }
  return true;
}

//--------------------------------------------------------------------
// FUNCTION:
//   getUniqueName
//
// DESCRIPTION:
//   Returns a unique name based on the given prefix, and an array
//   of names that already exist.
//
//   If the label is unique, then it is returned with no suffix.
//   If it is not unique, then the next unique name is found.
//
// ARGUMENTS:
//   prefix - string - the base name to use
//   arrayToSearch - array of objects with name property - the array
//     of objects to search for duplicate names
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function getUniqueName(prefix, arrayToSearch)
{
  var retVal = prefix;
  var count = 0;
  
  if (arrayToSearch != null && arrayToSearch.length > 0)
  {
    var matchFn = new Function("object,searchValue", "return (object.name == searchValue);");

    while (dwscripts.findInArray(arrayToSearch,retVal,matchFn) != -1)
    {
      count++;
      retVal = prefix + count.toString();
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   containsInvalidChars
//
// DESCRIPTION:
//   Returns true if the given string contains invalid characters
//
// ARGUMENTS:
//   str - string - the string to check
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function containsInvalidChars(str)
{
  var retVal = false;
  
  if (str) 
  {
    var regExp = /[^\w\d]/g; // new in JS 1.5, \w will support special characters 
    
    retVal = (str.search(regExp) != -1);
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   createFolders
//
// DESCRIPTION:
//   Recursively creates folders for the given file URL
//
// ARGUMENTS:
//   fileURL - string - the URL path of the folder to create
//
// RETURNS:
//   boolean - true if successfull
//--------------------------------------------------------------------

function createFolders(fileURL)
{
  var retVal = true;
  
  if (!dwscripts.fileExists(fileURL))
  {
    var parentURL = dwscripts.getAbsoluteParentURL();
    
    if (createFolders(parentURL))
    {
      retVal = dwscripts.createFolder(fileURL);
    }
    else
    {
      retVal = false;
    }
  }
  
  return retVal;
}



//--------------------------------------------------------------------
// CLASS:
//   ComponentInfo
//
// DESCRIPTION:
//   This class represents the information about a component
//
// PUBLIC PROPERTIES:
//
//   name
//   displayName
//   description
//   parent
//     
//   properties
//   methods
//
//   fileDir    
//
// PUBLIC FUNCTIONS:
//
//   serialize()
//   validate()
//   getFileURL()
//
//--------------------------------------------------------------------

function ComponentInfo()
{
  this.name = "";
  this.displayName = "";
  this.description = "";
  this.parent = "";
  
  this.properties = new Array();  // array of property info
  
  this.methods = new Array();
}

ComponentInfo.prototype.serialize = ComponentInfo_serialize;
ComponentInfo.prototype.serializeToTagEdit = ComponentInfo_serializeToTagEdit;
ComponentInfo.prototype.deserialize = ComponentInfo_deserialize;
ComponentInfo.prototype.validate = ComponentInfo_validate;


function ComponentInfo_serialize()
{
  var componentTag = this.serializeToTagEdit();
  
  componentTag.format("\t");
  
  return componentTag.getOuterHTML();
}


function ComponentInfo_serializeToTagEdit(tagToSet)
{
  var componentTag = null;
  if (tagToSet)
  {
    componentTag = tagToSet;
  }
  else
  {    
    componentTag = new TagEdit("<cfcomponent></cfcomponent>");
  }
  
  // componentTag.setAttribute("name", this.name);
  if (this.displayName)
  {
    componentTag.setAttribute("displayName", this.displayName);
  }
  if (this.description)
  {
    componentTag.setAttribute("hint", this.description);
  }
  if (this.parent)
  {
    componentTag.setAttribute("extends", this.parent);
  }
  
  var childNodes = new Array();
  
  for (var i=0; i < this.properties.length; i++)
  {
    childNodes.push(this.properties[i].serializeToTagEdit());
  }
  
  for (var i=0; i < this.methods.length; i++)
  {
    childNodes.push(this.methods[i].serializeToTagEdit());
  }

  componentTag.setChildNodes(childNodes);

  return componentTag;  
}


function ComponentInfo_deserialize(tagSource)
{
  var retVal = false;

  var componentTag = null;
  
  if (typeof tagSource == "string")
  {
    // use the tag edit class to read out the properties
    var tagList = TagEdit.parseString(tagSource);

    // set the componentTag
    var componentTag = null;
    if (tagList)
    {
      for (var i=0; i < tagList.length; i++)
      {
        if (tagList[i].getTagName() == "CFCOMPONENT")
        {
          componentTag = tagList[i];
          break;
        }
      }
    }
  }
  else
  {
    componentTag = tagSource;
  }
  
  
    
  if (componentTag)
  {
    retVal = true;
    
    this.name = componentTag.getAttribute("name");
    this.displayName = componentTag.getAttribute("displayName");
    this.description = componentTag.getAttribute("hint");
    this.parent = componentTag.getAttribute("parentDescriptor");
    
    var childNodes = componentTag.getChildNodes();
    
    this.properties = new Array();
    this.methods = new Array();
    
    // get the properties and methods
    for (var i=0; i < childNodes.length; i++)
    {
      if (childNodes[i].getTagName() == "CFPROPERTY")
      {
        var node = new PropertyInfo();
        var result = node.deserialize(childNodes[i]);
        if (result)
        {
          this.properties.push(node);
        }
        else
        {
          alert("ERROR parsing property:\n" +  childNodes[i].toString());
          retVal = false;
        }
      }
      else if (childNodes[i].getTagName() == "CFFUNCTION")
      {
        var node = new MethodInfo();
        var result = node.deserialize(childNodes[i]);
        if (result)
        {
          this.methods.push(node);
        }
        else
        {
          alert("ERROR parsing method:\n" +  childNodes[i].toString());
          retVal = false;
        }
      }
    }
    
    this.name = (this.name != null) ? this.name : "";
    this.displayName = (this.displayName != null) ? this.displayName : "";
    this.description = (this.description != null) ? this.description : "";
    this.parent = (this.parent != null) ? this.parent : "";
  }
  else
  {
    alert("Error: Component tag not found");
  }

  return retVal;
}


function ComponentInfo_validate()
{
  var retVal = new Array();  // use arrays for string concatenation, not +=
  if( "" == this.name  || containsInvalidChars(this.name) ) {
    retVal.push(++errorCount + ". " + dwscripts.sprintf(MSG_Error_BlankName, LABEL_Component));
  }
  if( "" == FILE_DIR ) {
    retVal.push(++errorCount + MSG_Error_CompFileOutputDir);
  }
    
  for (var i=0; i < this.properties.length; i++)
  {
    retVal.push(this.properties[i].validate());
  }
  
  for (var i=0; i < this.methods.length; i++)
  {
    retVal.push(this.methods[i].validate());
  }

  return retVal.join("");
}


//--------------------------------------------------------------------
// CLASS:
//   PropertyInfo
//
// DESCRIPTION:
//   This class represents the information about a property
//
// PUBLIC PROPERTIES:
//
//   name
//   displayName
//   access
//   type
//   isArray
//   description
//   defaultValue
//   required
//   searchable
//   fullText
//
// PUBLIC FUNCTIONS:
//
//   serialize()
//   validate()
//
//--------------------------------------------------------------------

function PropertyInfo()
{
  this.name = "";
  this.displayName = "";
  this.access = "public";
  this.type = "string";
  this.isArray = false;
  this.description = "";
  this.defaultValue = "";
  this.required = false;
  this.searchable = false;
  this.fullText = false;
}

PropertyInfo.prototype.serialize = PropertyInfo_serialize;
PropertyInfo.prototype.serializeToTagEdit = PropertyInfo_serializeToTagEdit;
PropertyInfo.prototype.deserialize = PropertyInfo_deserialize;
PropertyInfo.prototype.validate = PropertyInfo_validate;


function PropertyInfo_serialize()
{
  var propertyTag = this.serializeToTagEdit();
  
  propertyTag.format("\t");
  
  return propertyTag.getOuterHTML();
}


function PropertyInfo_serializeToTagEdit(tagToSet)
{
  var propertyTag = null
  if (tagToSet)
  {
    propertyTag = tagToSet;
  }
  else
  {
    propertyTag = new TagEdit("<cfproperty>");
  }
  
  propertyTag.setAttribute("name", this.name);
  if (this.displayName)
  {
    propertyTag.setAttribute("displayName", this.displayName);
  }
  if  (this.description)
  {
    propertyTag.setAttribute("hint", this.description);
  }
  //propertyTag.setAttribute("access", this.access);

  if (this.type)
  {
    var trimmedType = this.type;
    trimmedType = dwscripts.trim(trimmedType);
    if (trimmedType.length > 0)
    {
      propertyTag.setAttribute("type" , trimmedType);
    }
  }

  if (this.defaultValue)
  {
    propertyTag.setAttribute("default" , this.defaultValue);
  }
  if (this.required)
  {
    propertyTag.setAttribute("required" , this.required);
  }
  if (this.searchable)
  {
    propertyTag.setAttribute("searchable" , this.searchable);
  }
  if (this.fullText)
  {
    propertyTag.setAttribute("fullText" , this.fullText);
  }
  
  return propertyTag;
}


function PropertyInfo_deserialize(tagSource)
{
  var retVal = false;
  
  var propertyTag = null;
  
  if (typeof tagSource == "string")
  {
    // use the tag edit class to read out the properties
    var tagList = TagEdit.parseString(tagSource);

    // set the propertyTag
    if (tagList)
    {
      for (var i=0; i < tagList.length; i++)
      {
        if (tagList[i].getTagName() == "CFPROPERTY")
        {
          propertyTag = tagList[i];
          break;
        }
      }
    }
  }
  else
  {
    propertyTag = tagSource;
  }
  
  if (propertyTag)
  {
    retVal = true;

    this.name = propertyTag.getAttribute("name");
    this.displayName = propertyTag.getAttribute("displayName");
    this.description = propertyTag.getAttribute("hint");
    this.access = propertyTag.getAttribute("access");
    this.type = propertyTag.getAttribute("type");
    this.defaultValue = propertyTag.getAttribute("default");
    this.required = (propertyTag.getAttribute("required") == "true");
    this.searchable = (propertyTag.getAttribute("searchable") == "true");
    this.fullText = propertyTag.getAttribute("fullText");
    
    this.name = (this.name != null) ? this.name : "";
    this.displayName = (this.displayName != null) ? this.displayName : "";
    this.description = (this.description != null) ? this.description : "";
    this.access = (this.access != null) ? this.access : "public";
    this.type = (this.type != null) ? this.type : "string";
    this.defaultValue = (this.defaultValue != null) ? this.defaultValue : "";
    this.fullText = (this.fullText != null) ? this.fullText : "";
  }
  
  return retVal;
}


function PropertyInfo_validate()
{
  var retVal = new Array();  // use arrays for string concatenation, not +=
  
  return retVal.join("");
}


//--------------------------------------------------------------------
// CLASS:
//   MethodInfo
//
// DESCRIPTION:
//   This class represents information about a method
//
// PUBLIC PROPERTIES:
//
//   name
//   displayName
//   description
//   access
//   isStatic
//   resultType
//   output
//     
//   parameters
//
// PUBLIC FUNCTIONS:
//   
//   serialize()
//   validate()
//
//--------------------------------------------------------------------

function MethodInfo()
{
  this.name = "";
  this.displayName = "";
  this.description = "";
  this.access = "public";
  this.roles = "";
  this.isStatic = false;
  this.resultType = "";
  this.output = false;
  
  this.parameters = new Array(); // array of parameter info
}

MethodInfo.prototype.serialize = MethodInfo_serialize;
MethodInfo.prototype.serializeToTagEdit = MethodInfo_serializeToTagEdit;
MethodInfo.prototype.deserialize = MethodInfo_deserialize;
MethodInfo.prototype.validate = MethodInfo_validate;


function MethodInfo_serialize()
{
  var methodTag = this.serializeToTagEdit();
  
  methodTag.format("\t");
  
  return methodTag.getOuterHTML();
}


function MethodInfo_serializeToTagEdit(tagToSet)
{
  var methodTag = null;
  if (tagToSet)
  {
    methodTag = tagToSet;
  }
  else
  {
    methodTag = new TagEdit("<cffunction></cffunction>");
  }
  
  methodTag.setAttribute("name", this.name);
  var retVal = new Array();  
  if (this.displayName)
  {
    methodTag.setAttribute("displayName", this.displayName);
  }
  if (this.description)
  {
    methodTag.setAttribute("hint", this.description);
  }
  methodTag.setAttribute("access", this.access);
  //methodTag.setAttribute("static", this.isStatic);
  if (this.roles)
  {
    methodTag.setAttribute("roles", this.roles);
  }

  if (this.resultType)
  {
    var trimmedType = this.resultType;
    trimmedType = dwscripts.trim(trimmedType);
    if (trimmedType.length > 0)
    {
      methodTag.setAttribute("returnType", trimmedType);
    }
  }

  methodTag.setAttribute("output", this.output.toString());
  
  var paramNodes = new Array();
  for (var i=0; i < this.parameters.length; i++)
  {
    paramNodes.push(this.parameters[i].serializeToTagEdit());
  }
  var childNodes = paramNodes;  
  var cffunctionComment = new TagEdit("\r\n\r\n<!--- " + this.name + " body --->");
  childNodes.push(cffunctionComment);

  if (this.resultType && "none" != this.resultType)
  {
    var cfreturnNode = new TagEdit("\r\n\r\n<cfreturn >");
    childNodes.push(cfreturnNode);
  }

  methodTag.setChildNodes(childNodes);
  
  return methodTag;
}


function MethodInfo_deserialize(tagSource)
{
  var retVal = false;
  
  var methodTag = null;
  
  if (typeof tagSource == "string")
  {
    // use the tag edit class to read out the properties
    var tagList = TagEdit.parseString(tagSource);

    // set the propertyTag
    if (tagList)
    {
      for (var i=0; i < tagList.length; i++)
      {
        if (tagList[i].getTagName() == "CFFUNCTION")
        {
          methodTag = tagList[i];
          break;
        }
      }
    }
  }
  else
  {
    methodTag = tagSource;
  }
  
  if (methodTag)
  {
    retVal = true;
    
    this.name = methodTag.getAttribute("name");
    this.displayName = methodTag.getAttribute("displayName");
    this.description = methodTag.getAttribute("hint");
    this.access = methodTag.getAttribute("access");
    this.roles = methodTag.getAttribute("roles");
    //this.isStatic = (methodTag.getAttribute("static") == "true");
    this.resultType = methodTag.getAttribute("returnType");
    this.output = (methodTag.getAttribute("output") == "true");
    
    var childNodes = methodTag.getChildNodes();

    this.parameters = new Array();
    
    // get the parameters
    for (var i=0; i < childNodes.length; i++)
    {
      if (childNodes[i].getTagName() == "CFARGUMENT")
      {
        var node = new ParameterInfo();
        var result = node.deserialize(childNodes[i]);
        if (result)
        {
          this.parameters.push(node);
        }
        else
        {
          retVal = false;
        }
      }
    }

    this.name = (this.name != null) ? this.name : "";
    this.displayName = (this.displayName != null) ? this.displayName : "";
    this.description = (this.description != null) ? this.description : "";
    this.access = (this.access != null) ? this.access : "";
    this.roles = (this.roles != null) ? this.roles : "";
    this.resultType = (this.resultType != null) ? this.resultType : "";
  }
  
  return retVal;
}


function MethodInfo_validate()
{
  var retVal = new Array();  // use arrays for string concatenation, not +=
  
  for (var i=0; i < this.parameters.length; i++)
  {
    retVal.push(this.parameters[i].validate());
  }
  
  return retVal.join("");
}


//--------------------------------------------------------------------
// CLASS:
//   ParameterInfo
//
// DESCRIPTION:
//   This class represent information about a parameter
//
// PUBLIC PROPERTIES:
//
//   name
//   displayName
//   description
//   type
//   required
//   defaultValue
//
// PUBLIC FUNCTIONS:
//
//   serialize()
//   validate()
//
//--------------------------------------------------------------------

function ParameterInfo()
{
  this.name = "";
  this.displayName = "";
  this.description = "";
  this.type = "string";
  this.required = false;
  this.defaultValue = "";
}

ParameterInfo.prototype.serialize = ParameterInfo_serialize;
ParameterInfo.prototype.serializeToTagEdit = ParameterInfo_serializeToTagEdit;
ParameterInfo.prototype.deserialize = ParameterInfo_deserialize;
ParameterInfo.prototype.validate = ParameterInfo_validate;


function ParameterInfo_serialize()
{
  var parameterTag = this.serializeToTagEdit();
  
  parameterTag.format("\t");
  
  return parameterTag.getOuterHTML();
}


function ParameterInfo_serializeToTagEdit(tagToSet)
{
  var parameterTag = null;
  if (tagToSet)
  {
    parameterTag = tagToSet;
  }
  else
  {
    parameterTag = new TagEdit("<cfargument>");
  }
  
  parameterTag.setAttribute("name", this.name);
  if (this.displayName)
  {
    parameterTag.setAttribute("displayName", this.displayName);
  }
  if (this.description)
  {
    parameterTag.setAttribute("hint", this.description);
  }

  if (this.type)
  {
    var trimmedType = this.type;
    trimmedType = dwscripts.trim(trimmedType);
    if (trimmedType.length > 0)
    {
      parameterTag.setAttribute("type", trimmedType + ((this.isArray) ? '[]' : ''));
    }
  }

  if (this.required)
  {
    parameterTag.setAttribute("required", this.required);
  }
  if (this.defaultValue)
  {
    parameterTag.setAttribute("default", this.defaultValue);
  }
  
  return parameterTag;
}

function ParameterInfo_deserialize(tagSource)
{
  var retVal = false;
  
  var parameterTag = null;
  
  if (typeof tagSource == "string")
  {
    // use the tag edit class to read out the properties
    var tagList = TagEdit.parseString(tagSource);

    // set the parameterTag
    if (tagList)
    {
      for (var i=0; i < tagList.length; i++)
      {
        if (tagList[i].getTagName() == "CFARGUMENT")
        {
          parameterTag = tagList[i];
          break;
        }
      }
    }
  }
  else
  {
    parameterTag = tagSource;
  }
  
  if (parameterTag)
  {
    retVal = true;
    
    this.name = parameterTag.getAttribute("name");
    this.displayName = parameterTag.getAttribute("displayName");
    this.description = parameterTag.getAttribute("hint");
    this.type = parameterTag.getAttribute("type");
    this.required = (parameterTag.getAttribute("required") == "true");
    this.defaultValue = parameterTag.getAttribute("default");
    
    this.name = (this.name != null) ? this.name : "";
    this.displayName = (this.displayName != null) ? this.displayName : "";
    this.description = (this.description != null) ? this.description : "";
    this.type = (this.type != null) ? this.type : "string";
    this.defaultValue = (this.defaultValue != null) ? this.defaultValue : "";
  }
  
  return retVal;
}


function ParameterInfo_validate()
{
  var retVal = new Array();  // use arrays for string concatenation, not +=
  
  return retVal.join("");
}



//--------------------------------------------------------------------
// Page Classes
// 
//  Please see the TabControlClass.js file in Shared/MM/Scripts/Class
//  for more information on the functions defined within these classes
//
//--------------------------------------------------------------------




//--------------------------------------------------------------------
// CLASS:
//   ComponentsPage
//
// DESCRIPTION:
//   This class handles the display and update of the component page
//
// PUBLIC PROPERTIES:
//   NONE
//
// PUBLIC FUNCTIONS:
//   NONE
//
//--------------------------------------------------------------------

function ComponentsPage(theTabLabel)
{
  this.tabLabel = theTabLabel;
  
  // controls
  this.compName = "";
  this.compDisplayName = "";
  this.compDescription = "";
  this.compParent = "";
  this.compFileOutputDir = "";
}

ComponentsPage.prototype.getTabLabel = ComponentsPage_getTabLabel;
ComponentsPage.prototype.canLoad = ComponentsPage_canLoad;
ComponentsPage.prototype.load = ComponentsPage_load;
ComponentsPage.prototype.update = ComponentsPage_update;
ComponentsPage.prototype.unload = ComponentsPage_unload;
ComponentsPage.prototype.lastUnload = ComponentsPage_lastUnload;

function ComponentsPage_getTabLabel()
{
  return this.tabLabel;
}

//Called to check if a page can be loaded
//
function ComponentsPage_canLoad()
{
  //alert("canLoad() called " + this.tabLabel);
  return true;
}

//Called when the layer for this page is displayed.
// Use this call to initialize controls.
//
function ComponentsPage_load()
{
  //alert("load() called " + this.tabLabel + " (loaded = " + this.loaded + ")");
  this.compName = dwscripts.findDOMObject("compName");
  this.compDisplayName = dwscripts.findDOMObject("compDisplayName");
  this.compDescription = dwscripts.findDOMObject("compDescription");
  this.compParent = new ListControl("compParent");
  this.compFileOutputDir = new ListControl("compFileOutputDir");

  this.compParent.setAll(LABEL_PARENT_CFCS,LABEL_PARENT_CFCS);
  this.compFileOutputDir.setAll(LABEL_CFC_ROOTS,LABEL_CFC_ROOTS);

  this.update("refresh");
}

//Called when one of the page controls calls the tabControl update function.
// Use this call to respond to user input.
//
function ComponentsPage_update(theItemName)
{
  //alert("update() called for " + theItemName + " on " + this.tabLabel);
  
  if (theItemName == "refresh")
  {
    this.compName.value = COMPONENT_INFO.name;
    this.compDisplayName.value = COMPONENT_INFO.displayName;
    this.compDescription.value = COMPONENT_INFO.description;
    this.compParent.pick(COMPONENT_INFO.parent);
    this.compFileOutputDir.set(FILE_DIR,-1);
  }

  if (theItemName == "compName")
  {
    COMPONENT_INFO.name = this.compName.value;
  }
  else if (theItemName == "compDisplayName")
  {
    COMPONENT_INFO.displayName = this.compDisplayName.value;
  }
  else if (theItemName == "compDescription")
  {
    COMPONENT_INFO.description = this.compDescription.value;
  } 
  else if (theItemName == "compParent")
  {
    COMPONENT_INFO.parent = this.compParent.getValue();
  } 
  else if (theItemName == "FolderBrowse")
  {
    retVal = dwscripts.localURLToFilePath(dreamweaver.browseForFolderURL(LABEL_DirBrowse));
    if (retVal)
    {
      // need the optional index of -1 so it doesn't override the selectedIndex
      this.compFileOutputDir.set(retVal,-1);
    }
  }
  else if (theItemName == "saveToTemplate")
  {
    saveToTemplate();
  }
  else if (theItemName == "loadFromTemplate")
  {
    loadFromTemplate();
    this.update("refresh");
  }
}

//Called when another page is about to be shown, or finish() is called on
// the tabControl.  Use this call to perform any finishing tasks.
//
function ComponentsPage_unload()
{
  //alert("unload() called " + this.tabLabel);
  
  COMPONENT_INFO.name = this.compName.value;
  COMPONENT_INFO.displayName = this.compDisplayName.value;
  COMPONENT_INFO.description = this.compDescription.value;
  COMPONENT_INFO.parent = this.compParent.get();
  FILE_DIR = this.compFileOutputDir.get();
  
  // do any checking needed while changing pages.
  // return false if we should remain on this page.

  // hack to make sure that controls disappear correctly
  T.obj.visibility = "hidden";
  T.obj.visibility = "visible";
    
  return true;
}

//Called when finish() is called on the tabControl.
// Use this call to perform any last minute page updates.
//
function ComponentsPage_lastUnload()
{
  //alert("lastUnload() called " + this.tabLabel);
  return true;
}




//--------------------------------------------------------------------
// CLASS:
//   PropertiesPage
//
// DESCRIPTION:
//   This class handles the display and update of the properties page
//
// PUBLIC PROPERTIES:
//   NONE
//
// PUBLIC FUNCTIONS:
//   NONE
//
//--------------------------------------------------------------------

function PropertiesPage(theTabLabel)
{
  this.tabLabel = theTabLabel;
  
  this.properties = "";
  this.propName = "";
  this.propDisplayName = "";
  this.propDescription = "";
  //this.propAccess = "";
  this.propType = "";
  this.propArray = ""; 
  //this.propDefaultValue = "";
  //this.propRequired = "";
  this.propSearchable = "";
  this.propFullText = "";
 
  this.selectedProperty = -1;
  
  this.pageIsEnabled = true;
}

PropertiesPage.prototype.getTabLabel = PropertiesPage_getTabLabel;
PropertiesPage.prototype.canLoad = PropertiesPage_canLoad;
PropertiesPage.prototype.load = PropertiesPage_load;
PropertiesPage.prototype.update = PropertiesPage_update;
PropertiesPage.prototype.unload = PropertiesPage_unload;
PropertiesPage.prototype.lastUnload = PropertiesPage_lastUnload;

PropertiesPage.prototype.enable = PropertiesPage_enable;
PropertiesPage.prototype.disable = PropertiesPage_disable;

function PropertiesPage_getTabLabel()
{
  return this.tabLabel;
}

//Called to check if a page can be loaded
//
function PropertiesPage_canLoad()
{
  //alert("canLoad() called " + this.tabLabel);
  return true;
}

//Called when the layer for this page is displayed.
// Use this call to initialize controls.
//
function PropertiesPage_load()
{
  //alert("load() called " + this.tabLabel + " (loaded = " + this.loaded + ")");
  
  this.properties = new ListControl("properties");
  this.propName = dwscripts.findDOMObject("propName");
  this.propDisplayName = dwscripts.findDOMObject("propDisplayName");
  this.propDescription = dwscripts.findDOMObject("propDescription");
  //this.propAccess = new ListControl("propAccess");
  this.propType = new ListControl("propType");
  //this.propArray = dwscripts.findDOMObject("propArray");
  //this.propDefaultValue = dwscripts.findDOMObject("propDefaultValue");
  //this.propRequired = dwscripts.findDOMObject("propRequired");
  //this.propSearchable = dwscripts.findDOMObject("propSearchable");
  //this.propFullText = dwscripts.findDOMObject("propFullText");
  
  // populate access list
  //this.propAccess.setAll(LABEL_ACCESSES,LABEL_ACCESSES);
  //this.propAccess.pickValue(DEFAULT_ACCESS);
  
  // populate the type list
  this.propType.setAll(LABEL_TYPES,LABEL_TYPES);
  
  this.update('refresh');
}

//Called when one of the page controls calls the tabControl update function.
// Use this call to respond to user input.
//
function PropertiesPage_update(theItemName)
{
  //alert("update() called for " + theItemName + " on " + this.tabLabel);
  
  if (theItemName == "refresh")
  {
    // populate the properties array
    var nameArray = new Array();
    for (var i=0; i < COMPONENT_INFO.properties.length; i++)
    {
      nameArray.push(COMPONENT_INFO.properties[i].name); // function call?
    }
    this.properties.setAll(nameArray);

    if (this.selectedProperty != -1)
    {
      this.properties.setIndex(this.selectedProperty);
    }

    // now update the rest of the display
    this.update('properties');
  }
  else if (theItemName == "btn_propPlus")
  {
    var property = new PropertyInfo();
    property.name = getUniqueName(LABEL_Property, COMPONENT_INFO.properties);
    COMPONENT_INFO.properties.push(property);  // should we insert this after selection?
    
    this.properties.append(property.name);
    this.properties.setIndex(COMPONENT_INFO.properties.length);
    
    this.update("properties");
  }
  else if (theItemName == "btn_propMinus")
  {
    var index = this.properties.getIndex();
    
    this.properties.del();
    
    // delete this property
    COMPONENT_INFO.properties.splice(index,1);
    
    this.update("properties");
  }
  else
  {
    var index = this.properties.getIndex();
    var property = null;
    if (index >= 0)
    {
      property = COMPONENT_INFO.properties[index];
    }
    
    if (property)
    {  
      this.enable();
      
      if (theItemName == "properties")
      {
        // update the other fields to display the currently
        //  selected item
        this.propName.value = property.name;
        this.propDisplayName.value = property.displayName;
        //this.propAccess.pickValue(property.access);
        this.propType.pickValue(property.type);
        //this.propArray.checked = property.isArray;
        this.propDescription.value = property.description;
        //this.propDefaultValue.value = property.defaultValue;
        //this.propRequired.checked = property.required;
        //this.propSearchable.checked = property.searchable;
        //this.propFullText.checked = property.fullText;
      }
      else if (theItemName == "propName")
      {
        if( "" == this.propName.value  || containsInvalidChars(this.propName.value) ) {
          alert(dwscripts.sprintf(MSG_Error_BlankName,LABEL_Property));
					//bug fix for #149998:Error message for incorrect property name doesnt go away  
					//don't set the focus back since we are notify the user once
					//it should be sufficient
          //dwscripts.findDOMObject("propName").focus();
        }
        else if ( nameExists(this.propName.value, this.properties) )
        {
          alert(dwscripts.sprintf(MSG_Error_NameExists, this.propName.value, LABEL_Property));
					//bug fix for #149998:Error message for incorrect property name doesnt go away  
					//don't set the focus back since we are notify the user once
					//it should be sufficient
          //dwscripts.findDOMObject("propName").focus();
        }
        else
        {
          property.name = this.propName.value;
          this.properties.set(property.name);
        }
      }
      else if (theItemName == "propDisplayName")
      {
        property.displayName = this.propDisplayName.value;
      }
      else if (theItemName == "propAccess")
      {
        //property.access = this.propAccess.getValue();
      }
      else if (theItemName == "propType")
      {
        var newValue = this.propType.getValue();
        if (property.type != newValue)
        {
          property.type = newValue;
          // need to repick the value to work around a bug
          this.propType.pickValue(property.type);
        }
      }
      else if (theItemName == "propDescription")
      {
        property.description = this.propDescription.value;
      }
      else if (theItemName == "propDefaultValue")
      {
        //property.defaultValue = this.propDefaultValue.value;
      }
      else if (theItemName == "propRequired")
      {
        //property.required = this.propRequired.checked;
      }
    }
    else
    {
      // clear items
      this.propName.value = "";
      this.propDisplayName.value = "";
      //this.propAccess.pickValue("public");
      this.propType.pickValue("string");
      //this.propArray.checked = false;
      this.propDescription.value = "";
      //this.propDefaultValue.value = "";
      //this.propRequired.checked = false;
      //this.propSearchable.checked = false;
      //this.propFullText.checked = false;
      
      // disable form
      this.disable();
    }
  }
}

//Called when another page is about to be shown, or finish() is called on
// the tabControl.  Use this call to perform any finishing tasks.
//
function PropertiesPage_unload()
{
  //alert("unload() called " + this.tabLabel);
  
  this.selectedProperty = this.properties.getIndex();
  
  // hack to make sure that controls disappear correctly
  T.obj.visibility = "hidden";
  T.obj.visibility = "visible";
  
  return true;
}

//Called when finish() is called on the tabControl.
// Use this call to perform any last minute page updates.
//
function PropertiesPage_lastUnload()
{
  //alert("lastUnload() called " + this.tabLabel);
  return true;
}


function PropertiesPage_enable()
{
  if (!this.pageIsEnabled)
  {
    this.pageIsEnabled = true;
    this.propName.removeAttribute("disabled");
    this.propDisplayName.removeAttribute("disabled");
    //this.propAccess.enable();
    this.propType.enable();
    //this.propArray.removeAttribute("disabled");
    this.propDescription.removeAttribute("disabled");
    //this.propDefaultValue.removeAttribute("disabled");
    //this.propRequired.removeAttribute("disabled");
    //this.propSearchable.removeAttribute("disabled");
    //this.propFullText.removeAttribute("disabled");
  }
}

function PropertiesPage_disable()
{
  if (this.pageIsEnabled)
  {
    this.pageIsEnabled = false;
    this.propName.setAttribute("disabled","true");
    this.propDisplayName.setAttribute("disabled","true");
    //this.propAccess.disable();
    this.propType.disable();
    //this.propArray.setAttribute("disabled","true");
    this.propDescription.setAttribute("disabled","true");
    //this.propDefaultValue.setAttribute("disabled","true");
    //this.propRequired.setAttribute("disabled","true");
    //this.propSearchable.setAttribute("disabled","true");
    //this.propFullText.setAttribute("disabled","true");
  }
}



//--------------------------------------------------------------------
// CLASS:
//   MethodsPage
//
// DESCRIPTION:
//   This class handles the display and update of the methods page
//
// PUBLIC PROPERTIES:
//   NONE
//
// PUBLIC FUNCTIONS:
//   NONE
//
//--------------------------------------------------------------------

function MethodsPage(theTabLabel)
{
  this.tabLabel = theTabLabel;
  
  this.methods = "";
  this.methodName = "";
  this.methodDisplayName = "";
  this.methodDescription = "";
  this.methodAccess = "";
  this.methodRoles = "";
  //this.methodStatic1 = "";
  this.methodResultType = "";
  this.methodOutput = "";
  
  this.selectedMethod = -1;
  
  this.pageIsEnabled = true;
}

MethodsPage.prototype.getTabLabel = MethodsPage_getTabLabel;
MethodsPage.prototype.canLoad = MethodsPage_canLoad;
MethodsPage.prototype.load = MethodsPage_load;
MethodsPage.prototype.update = MethodsPage_update;
MethodsPage.prototype.unload = MethodsPage_unload;
MethodsPage.prototype.lastUnload = MethodsPage_lastUnload;

MethodsPage.prototype.enable = MethodsPage_enable;
MethodsPage.prototype.disable = MethodsPage_disable;

function MethodsPage_getTabLabel()
{
  return this.tabLabel;
}

//Called to check if a page can be loaded
//
function MethodsPage_canLoad()
{
  //alert("canLoad() called " + this.tabLabel);
  return true;
}

//Called when the layer for this page is displayed.
// Use this call to initialize controls.
//
function MethodsPage_load()
{
  //alert("load() called " + this.tabLabel + " (loaded = " + this.loaded + ")");
  
  this.methods = new ListControl("methods");
  
  this.methodName = dwscripts.findDOMObject("methodName");
  this.methodDisplayName = dwscripts.findDOMObject("methodDisplayName");
  this.methodDescription = dwscripts.findDOMObject("methodDescription");
  this.methodAccess = new ListControl("methodAccess");
  this.methodRoles = dwscripts.findDOMObject("methodRoles");
  //this.methodStatic1 = dwscripts.findDOMObject("methodStatic1");
  this.methodResultType = new ListControl("methodResultType");
  this.methodOutput = dwscripts.findDOMObject("methodOutput");
  
  // populate the access list
  this.methodAccess.setAll(LABEL_ACCESSES,LABEL_ACCESSES);
  this.methodAccess.pickValue(DEFAULT_ACCESS);
  
  // populate the result type list
  var newList = new Array();
  var completeList = newList.concat(LABEL_TYPES);
  this.methodResultType.setAll(completeList,completeList);

  this.update("refresh");
}

//Called when one of the page controls calls the tabControl update function.
// Use this call to respond to user input.
//
function MethodsPage_update(theItemName)
{
  //alert("update() called for " + theItemName + " on " + this.tabLabel);

  if (theItemName == "refresh")
  {
    // populate the methods array
    var nameArray = new Array();
    for (var i=0; i < COMPONENT_INFO.methods.length; i++)
    {
      nameArray.push(COMPONENT_INFO.methods[i].name); // function call?
    }
    this.methods.setAll(nameArray);

    if (this.selectedMethod != -1)
    {
      this.methods.setIndex(this.selectedMethod);
    }

    // now update the rest of the display
    this.update('methods');
  }
  else if (theItemName == "btn_methodPlus")
  {
    var method = new MethodInfo();
    method.name = getUniqueName(LABEL_Method, COMPONENT_INFO.methods);
    COMPONENT_INFO.methods.push(method);  // should we insert this after selection?
    
    this.methods.append(method.name);
    this.methods.setIndex(COMPONENT_INFO.methods.length);
    
    this.update("methods");
  }
  else if (theItemName == "btn_methodMinus")
  {
    var index = this.methods.getIndex();
    
    this.methods.del();
    
    // delete this property
    COMPONENT_INFO.methods.splice(index,1);
    
    this.update("methods");
  }
  else
  {
    var index = this.methods.getIndex();
    var method = null;
    if (index >= 0)
    {
      method = COMPONENT_INFO.methods[index];
    }
    
    if (method)
    {
      this.enable();
      
      if (theItemName == "methods")
      {
        // update the other fields to display the currently
        //  selected item
        this.methodName.value = method.name;
        this.methodDisplayName.value = method.displayName;
        this.methodDescription.value = method.description;
        this.methodAccess.pickValue(method.access);
        this.methodRoles.value = method.roles;
        //this.methodStatic1.checked = method.isStatic;
        this.methodResultType.pickValue(method.resultType);
        this.methodOutput.checked = method.output;
      }
      else if (theItemName == "methodName")
      {
        if( "" == this.methodName.value  || containsInvalidChars(this.methodName.value) ) {
          alert(dwscripts.sprintf(MSG_Error_BlankName,LABEL_Method));
					//bug fix for #149998:Error message for incorrect property name doesnt go away  
					//don't set the focus back since we are notify the user once
					//it should be sufficient
          //dwscripts.findDOMObject("methodName").focus();
        }
        else if ( nameExists(this.methodName.value, this.methods) )
        {
          alert(dwscripts.sprintf(MSG_Error_NameExists, this.methodName.value, LABEL_Method));
					//bug fix for #149998:Error message for incorrect property name doesnt go away  
					//don't set the focus back since we are notify the user once
					//it should be sufficient
          //dwscripts.findDOMObject("methodName").focus();
        }
        else
        {
          method.name = this.methodName.value;
          this.methods.set(method.name);
        }
      }
      else if (theItemName == "methodDisplayName")
      {
        method.displayName = this.methodDisplayName.value;
      }
      else if (theItemName == "methodDescription")
      {
        method.description = this.methodDescription.value;
      }
      else if (theItemName == "methodAccess")
      {
        method.access = this.methodAccess.getValue();
      }
      else if (theItemName == "methodRoles")
      {
        method.roles = this.methodRoles.value;
      }
      //else if (theItemName == "methodStatic1")
      //{
        //method.isStatic = this.methodStatic1.checked;
      //}
      else if (theItemName == "methodResultType")
      {
        var newValue = this.methodResultType.getValue();
        if (method.resultType != newValue)
        {
          method.resultType = newValue;
          // need to repick the value to work around a bug
          this.methodResultType.pickValue(method.resultType);
        }
      }
      else if (theItemName == "methodOutput")
      {
        method.output = this.methodOutput.checked;
      }
    }
    else
    {
      // clear items
      this.methodName.value = "";
      this.methodDisplayName.value = "";
      this.methodDescription.value = "";
      this.methodAccess.pickValue("public");
      this.methodRoles.value = "";
      //this.methodStatic1.checked = false;
      this.methodResultType.pickValue("");
      this.methodOutput.checked = false;
      
      // disable form
      this.disable();
    }
  }
}

//Called when another page is about to be shown, or finish() is called on
// the tabControl.  Use this call to perform any finishing tasks.
//
function MethodsPage_unload()
{
  //alert("unload() called " + this.tabLabel);

  this.selectedMethod = this.methods.getIndex();
  
  // hack to make sure that controls disappear correctly
  T.obj.visibility = "hidden";
  T.obj.visibility = "visible";
  
  return true;
}

//Called when finish() is called on the tabControl.
// Use this call to perform any last minute page updates.
//
function MethodsPage_lastUnload()
{
  //alert("lastUnload() called " + this.tabLabel);
  return true;
}


function MethodsPage_enable()
{
  if (!this.pageIsEnabled)
  {
    this.pageIsEnabled = true;
    this.methodName.removeAttribute("disabled");
    this.methodDisplayName.removeAttribute("disabled");
    this.methodDescription.removeAttribute("disabled");
    this.methodAccess.enable();
    this.methodRoles.removeAttribute("disabled");
    //this.methodStatic1.removeAttribute("disabled");
    this.methodResultType.enable();
    this.methodOutput.removeAttribute("disabled");
  }
}

function MethodsPage_disable()
{
  if (this.pageIsEnabled)
  {
    this.pageIsEnabled = false;
    this.methodName.setAttribute("disabled","true");
    this.methodDisplayName.setAttribute("disabled","true");
    this.methodDescription.setAttribute("disabled","true");
    this.methodAccess.disable();
    this.methodRoles.setAttribute("disabled","true");
    //this.methodStatic1.setAttribute("disabled","true");
    this.methodResultType.disable();
    this.methodOutput.setAttribute("disabled","true");
  }
}



//--------------------------------------------------------------------
// CLASS:
//   ParametersPage
//
// DESCRIPTION:
//   This class handles the display and update of the parameters page
//
// PUBLIC PROPERTIES:
//   NONE
//
// PUBLIC FUNCTIONS:
//   NONE
//
//--------------------------------------------------------------------

function ParametersPage(theTabLabel)
{
  this.tabLabel = theTabLabel;
  
  this.readOnlyMethods = "";
  
  this.parameters = "";
  this.parameterName = "";
  this.parameterDisplayName = "";
  this.parameterDescription = "";
  this.parameterType = "";
  //this.parameterArray = "";
  this.parameterRequired = "";
  this.parameterDefaultValue = "";
  
  
  this.selectedMethod = -1;
  this.selectedParameter = -1;
  
  this.paramsEnabled = true;
  this.pageIsEnabled = true;
}

ParametersPage.prototype.getTabLabel = ParametersPage_getTabLabel;
ParametersPage.prototype.canLoad = ParametersPage_canLoad;
ParametersPage.prototype.load = ParametersPage_load;
ParametersPage.prototype.update = ParametersPage_update;
ParametersPage.prototype.unload = ParametersPage_unload;
ParametersPage.prototype.lastUnload = ParametersPage_lastUnload;

ParametersPage.prototype.enable = ParametersPage_enable;
ParametersPage.prototype.disable = ParametersPage_disable;

function ParametersPage_getTabLabel()
{
  return this.tabLabel;
}

//Called to check if a page can be loaded
//
function ParametersPage_canLoad()
{
  //alert("canLoad() called " + this.tabLabel);
  return true;
}

//Called when the layer for this page is displayed.
// Use this call to initialize controls.
//
function ParametersPage_load()
{
  //alert("load() called " + this.tabLabel + " (loaded = " + this.loaded + ")");
  
  this.readOnlyMethods = new ListControl("readOnlyMethods");
  this.parameters = new ListControl("parameters");
  this.parameterName = dwscripts.findDOMObject("parameterName");
  this.parameterDisplayName = dwscripts.findDOMObject("parameterDisplayName");
  this.parameterDescription = dwscripts.findDOMObject("parameterDescription");
  this.parameterType = new ListControl("parameterType");
  //this.parameterArray = dwscripts.findDOMObject("parameterArray");
  this.parameterRequired = dwscripts.findDOMObject("parameterRequired");
  this.parameterDefaultValue = dwscripts.findDOMObject("parameterDefaultValue");
  
  // populate the parameter type array
  this.parameterType.setAll(LABEL_TYPES,LABEL_TYPES);
  
  this.update("refresh");
}

//Called when one of the page controls calls the tabControl update function.
// Use this call to respond to user input.
//
function ParametersPage_update(theItemName)
{
  //alert("update() called for " + theItemName + " on " + this.tabLabel);
  
  if (theItemName == "refresh")
  {
    // populate the methods array
    var nameArray = new Array();
    for (var i=0; i < COMPONENT_INFO.methods.length; i++)
    {
      nameArray.push(COMPONENT_INFO.methods[i].name); // function call?
    }
    this.readOnlyMethods.setAll(nameArray,nameArray);

    if (this.selectedMethod != -1)
    {
      this.readOnlyMethods.setIndex(this.selectedMethod);
    }

    // now update the rest of the display
    this.update('readOnlyMethods');    
  }
  else
  {
    var index = this.readOnlyMethods.getIndex();
    var method = null;
    if (index >= 0)
    {
      method = COMPONENT_INFO.methods[index];
    }

    if (method)
    {
      if (!this.paramsEnabled)
      {
        this.parameters.enable();
        this.paramsEnabled = true;
        var plusButton = dwscripts.findDOMObject("btn_parameterPlus");
        plusButton.src = "../Shared/UltraDev/Images/PlusButton.gif";
        var minusButton = dwscripts.findDOMObject("btn_parameterMinus");
        minusButton.src = "../Shared/UltraDev/Images/MinusButtonEnabled.gif";
      }

      if (theItemName == "readOnlyMethods")
      {
        // populate the parameters array
        var nameArray = new Array();
        for (var i=0; i < method.parameters.length; i++)
        {
          nameArray.push(method.parameters[i].name); // function call?
        }
        this.parameters.setAll(nameArray,nameArray);

        if (this.selectedParameter != -1)
        {
          this.parameters.setIndex(this.selectedParameter);
          this.selectedParameter = -1;  // only select this the first time the page is visited
        }
        this.update("parameters");
      }
      if (theItemName == "btn_parameterPlus")
      {
        var parameter = new ParameterInfo();
        parameter.name = getUniqueName(LABEL_Parameter, method.parameters);
        method.parameters.push(parameter);  // should we insert this after selection?

        this.parameters.append(parameter.name);
        this.parameters.setIndex(method.parameters.length);

        this.update("parameters");
      }
      else if (theItemName == "btn_parameterMinus")
      {
        var paramIndex = this.parameters.getIndex();

        this.parameters.del();

        // delete this property
        method.parameters.splice(paramIndex,1);

        this.update("parameters");
      }
      else
      {
        var paramIndex = this.parameters.getIndex();
        var parameter = null;
        if (paramIndex >= 0)
        {
          parameter = method.parameters[paramIndex];
        }

        if (parameter)
        {
          this.enable();

          if (theItemName == "parameters")
          {
            // update the other fields to display the currently
            //  selected item
            this.parameterName.value = parameter.name;
            this.parameterDisplayName.value = parameter.displayName;
            this.parameterDescription.value = parameter.description;
            this.parameterType.pickValue(parameter.type);
            this.parameterRequired.checked = parameter.required;
            this.parameterDefaultValue.value = parameter.defaultValue;
          }
          else if (theItemName == "parameterName")
          {
            if( "" == this.parameterName.value  || containsInvalidChars(this.parameterName.value) ) {
              alert(dwscripts.sprintf(MSG_Error_BlankName,LABEL_Parameter));
							//bug fix for #149998:Error message for incorrect property name doesnt go away  
							//don't set the focus back since we are notify the user once
							//it should be sufficient
              //dwscripts.findDOMObject("parameterName").focus();
            }
            else if ( nameExists(this.parameterName.value, this.parameters) )
            {
              alert(dwscripts.sprintf(MSG_Error_NameExists, this.parameterName.value, LABEL_Parameter));
							//bug fix for #149998:Error message for incorrect property name doesnt go away  
							//don't set the focus back since we are notify the user once
							//it should be sufficient
              //dwscripts.findDOMObject("parameterName").focus();
            }
            else
            {
              parameter.name = this.parameterName.value;
              this.parameters.set(parameter.name);
            }
          }
          else if (theItemName == "parameterDisplayName")
          {
            parameter.displayName = this.parameterDisplayName.value;
          }
          else if (theItemName == "parameterDescription")
          {
            parameter.description = this.parameterDescription.value;
          }
          else if (theItemName == "parameterType")
          {
            var newValue = this.parameterType.getValue();
            if (parameter.type != newValue)
            {
              parameter.type = newValue;
              // need to repick the value to work around a bug
              this.parameterType.pickValue(parameter.type);
            }
          }
          else if (theItemName == "parameterRequired")
          {
            parameter.required = this.parameterRequired.checked;
          }
          else if (theItemName == "parameterDefaultValue")
          {
            parameter.defaultValue = this.parameterDefaultValue.value;
          }
        }
        else
        {
          // disable form
          this.disable();
        }
      }
    }
    else
    {
      if (this.paramsEnabled)
      {
        this.parameters.setAll(new Array());
        this.parameters.disable();
        this.paramsEnabled = false;
        var plusButton = dwscripts.findDOMObject("btn_parameterPlus");
        plusButton.src = "../Shared/UltraDev/Images/PlusButtonDisabled.gif";
        var minusButton = dwscripts.findDOMObject("btn_parameterMinus");
        minusButton.src = "../Shared/UltraDev/Images/MinusButtonDisabled.gif";
      }
      this.disable();
    }
  }
}

//Called when another page is about to be shown, or finish() is called on
// the tabControl.  Use this call to perform any finishing tasks.
//
function ParametersPage_unload()
{
  //alert("unload() called " + this.tabLabel);

  // hack to make sure that controls disappear correctly
  T.obj.visibility = "hidden";
  T.obj.visibility = "visible";
  
  return true;
}

//Called when finish() is called on the tabControl.
// Use this call to perform any last minute page updates.
//
function ParametersPage_lastUnload()
{
  //alert("lastUnload() called " + this.tabLabel);
  return true;
}


function ParametersPage_enable()
{
  if (!this.pageIsEnabled)
  {
    this.pageIsEnabled = true;
    this.parameterName.removeAttribute("disabled");
    this.parameterDisplayName.removeAttribute("disabled");
    this.parameterDescription.removeAttribute("disabled");
    this.parameterType.enable();
    this.parameterRequired.removeAttribute("disabled");
    this.parameterDefaultValue.removeAttribute("disabled");
  }
}

function ParametersPage_disable()
{
  if (this.pageIsEnabled)
  {
    this.pageIsEnabled = false;

    // clear items
    this.parameterName.value = "";
    this.parameterDisplayName.value = "";
    this.parameterDescription.value = "";
    this.parameterType.pickValue("string");
    this.parameterRequired.checked = false;
    this.parameterDefaultValue.value = "";

    // now disable
    this.parameterName.setAttribute("disabled","true");
    this.parameterDisplayName.setAttribute("disabled","true");
    this.parameterDescription.setAttribute("disabled","true");
    this.parameterType.disable();
    this.parameterRequired.setAttribute("disabled","true");
    this.parameterDefaultValue.setAttribute("disabled","true");
  }
}

// =================================================================================================
//--------------------------------------------------------------------
// FUNCTION:
//   getParentCfcs
//
// DESCRIPTION:
//   Makes an http request to the CFCExplorer to return and array of
//     CFC names
//
// ARGUMENTS:
//   refreshCache - determines whether to get a fresh list of CFCs or not
//
// RETURNS:
//   array containing the name of available CFCs
//--------------------------------------------------------------------
function getParentCfcs( refreshCache ) {
  if (refreshCache == null ) {
    refreshCache = "no";
  }
  var root = new Array();
  var cfcNames =  new Array();
  // first item will be "" so that it doesn't look like a parent is automatically selected
  cfcNames[0] = "";
  var cfcNamesLen = cfcNames.length;
  var wddxParentCfcs = "";

  var introspectionURL = getIntrospectionUrl();
  if (introspectionURL != "")
  {

    MM.setBusyCursor(); 
    var pwdBase64 = MMToBase64(MMDB.getRDSUserName() + ":" + MMDB.getRDSPassword());
    var strHeader = "Authorization-MX: Basic " + pwdBase64 + "\r\n";
    var httpReply = MMHttp.postText(introspectionURL + "?method=getcfcs&refreshcache=" + refreshCache, "", "", strHeader); 

    // only process WDDX if reply successful, else just return new Array()
    if (httpReply.statusCode == 200) {
      wddxParentCfcs = httpReply.data;
      //alert("raw WDDX packet\n\n" + wddxParentCfcs);
      var des = new WddxDeserializer();
      root = des.deserialize(wddxParentCfcs);
  	  // this happens to be null sometimes, ignore that it's null and just bring up the dialog
  	  if( root != null ) {
        for( var i=0; i<root.length; i++ ) {
          cfcNames[i+cfcNamesLen] = root[i].NAME;
        }
      }  
      // sorting and empty array seems to make it null and was throwing errors in  ListControlClass's setAll
      if( cfcNames.length >  0 ) {
        cfcNames = cfcNames.sort();
      }
    }
    MM.clearBusyCursor();       
  } else {
    //alert('no url prefix???');
  }
  return cfcNames;
}

//--------------------------------------------------------------------
// FUNCTION:
//   repopulateCompParent
//
// DESCRIPTION:
//   - calls methods to retrieve a fresh the list of available components
//
// ARGUMENTS:
//   NONE
//
// RETURNS:
//   NONE
//--------------------------------------------------------------------
function repopulateCompParent() {
    LABEL_PARENT_CFCS = getParentCfcs("yes");
    T.getPageObject("componentSection").compParent.setAll(LABEL_PARENT_CFCS,LABEL_PARENT_CFCS);
}

//--------------------------------------------------------------------
// FUNCTION:
//   getCfcRoots
//
// DESCRIPTION:
//   Makes an http request to the CFCExplorer to return and array of
//     CFC names
//
// ARGUMENTS:
//   refreshCache - determines whether to get a fresh list of CFCs or not
//
// RETURNS:
//   array containing the name of available CFCs
//--------------------------------------------------------------------
function getCfcRoots( refreshCache ) {
  if (refreshCache == null ) {
    refreshCache = "no";
  }
  var root = new Array();
  var cfcRoots =  new Array();
  // first item will be "" so that it doesn't look like a parent is automatically selected
  cfcRoots[0] = "";
  var cfcRootsLen = cfcRoots.length;
  var wddxCfcRoots = "";

  var introspectionURL = getIntrospectionUrl();
  if (introspectionURL != "")
  {
    MM.setBusyCursor(); 
    var pwdBase64 = MMToBase64(MMDB.getRDSUserName() + ":" + MMDB.getRDSPassword());
    var strHeader = "Authorization-MX: Basic " + pwdBase64 + "\r\n";
    var httpReply = MMHttp.postText(introspectionURL + "?method=getcomponentroots&refreshcache=" + refreshCache, "", "", strHeader); 

    // only process WDDX if reply successful, else just return new Array()
    if (httpReply.statusCode == 200) {
      wddxCfcRoots = httpReply.data;
      //alert("raw WDDX packet\n\n" + wddxCfcRoots);
      var des = new WddxDeserializer();
      root = des.deserialize(wddxCfcRoots);
      // this happens to be null sometimes, ignore that it's null and just bring up the dialog
  	  if( root != null ) {
        for( var i=0; i<root.length; i++ ) {
          cfcRoots[i+cfcRootsLen] = root[i].PHYSICALPATH;
        }
      }	
      // sorting and empty array seems to make it null and was throwing errors in  ListControlClass's setAll
      if( cfcRoots.length >  0 ) {
        cfcRoots = cfcRoots.sort();
      }
    }
    MM.clearBusyCursor();       
  } else {
    //alert('no url prefix???');
  }
  return cfcRoots;
}
    
function nameExists(name, listToSearch) {
  if( name != null ) {
    for ( var i=0; i<listToSearch.getLen(); i++ ) {
      // need to check that it's not being compared against the current index that it's 
      // trying to update! should the user not change the name
      if( name == listToSearch.get(i) && i != listToSearch.getIndex()) {
        return true;
      }
    }
  }
  return false;
}

