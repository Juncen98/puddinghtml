//SHARE-IN-MEMORY=true

// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   dwscripts
//
// DESCRIPTION:
//   This class is used to create a namespace for the functions
//   contained within this file.  This namespace will make it
//   easier to identify these functions within the code, and
//   ensure that no other functions exist with these names. This
//   is important when using the SHARE-IN-MEMORY flag.
//
// PUBLIC PROPERTIES:
//
//   dwscripts.IS_MAC
//   dwscripts.IS_WIN
//
//   dwscripts.FILE_SEP
//   dwscripts.ABSOLUTE_FILE_PREFIX
//   dwscripts.PARENT_DIR
//   dwscripts.FILE_EXT_SEP
//   dwscripts.DESIGN_NOTE_DIR
//   dwscripts.DESIGN_NOTE_EXT
//
//
// PUBLIC FUNCTIONS:

//   PROPERTIES
//    dwscripts.getNewline()
//    dwscripts.getNewlineFromString(theStr)
//
//   DOM
//    dwscripts.findDOMObject(objName,  parentObj)
//    dwscripts.getEmptyDOM()
//    dwscripts.getUniqueNameForTag(tagType, baseName)
//    dwscripts.isInsideTag(node, tagTypes)
//    dwscripts.getEnclosingTagNode(node, tagTypes)
//    dwscripts.traverseDOM(startNode, elementHandlerFn, textHandlerFn, commentHandlerFn, userData)
//    dwscripts.getNodeList(startNode)
//
//   ARRAY
//    dwscripts.findInArray(arrayToSearch, searchValue, optionalMatchFn)
//    dwscripts.findNewItemInArray(arrayA, arrayB, optionalMatchFn)
//
//   STRING DISPLAY
//    dwscripts.sprintf(theStr, <optional string aruguments>)
//    dwscripts.wrapTextForDisplay(theText, maxWidth)
//    dwscripts.entityNameEncode(origStr)
//    dwscripts.entityNameDecode(origStr)
//    dwscripts.getHttpStatusMsg(statusCode)
//
//   STRING HANDLING
//    dwscripts.escRegExpChars(regString)
//    dwscripts.replaceString(theStr, oldSub, newSub)
//    dwscripts.stripChars(theStr, theFilter)
//    dwscripts.trim(theStr)
//    dwscripts.isQuoted(theStr)
//    dwscripts.trimQuotes(theStr)
//    dwscripts.escQuotes(theStr)
//    dwscripts.unescQuotes(theStr)
//    dwscripts.isNumber(theStr)
//    dwscripts.getNumber(theStr)
//    dwscripts.isValidVarName(theName)
//    dwscripts.stripInvalidVarChars(theStr)
//    dwscripts.extractArgs(fnCallStr)
//
//   COMMAND
//    dwscripts.callCommand(cmdName, argObject)
//    dwscripts.getCommandArguments()
//    dwscripts.setCommandReturnValue(theValue)
//
//   FILE
//    dwscripts.filePathToLocalURL(filePath)
//    dwscripts.localURLToFilePath(fileURL)
//    dwscripts.getAbsoluteURL(relativeURL, [docURL], [siteURL])
//    dwscripts.getFileName(fileURL)
//	  dwscripts.getSiteRelativePath(fileURL)
//    dwscripts.getSimpleFileName(fileURL)
//    dwscripts.getFileExtension(fileURL)
//    dwscripts.getParentURL(fileURL)
//    dwscripts.getAbsoluteParentURL(fileURL)
//    dwscripts.fileExists(fileURL)
//    dwscripts.isFile(fileURL)
//    dwscripts.isFolder(fileURL)
//    dwscripts.isFileReadable(fileURL)
//    dwscripts.isFileWritable(fileURL)
//    dwscripts.listFolder(fileURL, optionalFilterFn)
//    dwscripts.createFolder(fileURL)
//    dwscripts.getFileContents(fileURL, ignoreNewlines)
//    dwscripts.setFileContents(fileURL, contents, append, ignoreNewlines)
//    dwscripts.copyFileTo(sourceFileURL, targetFileURL, ignoreDesignNote)
//    dwscripts.removeFile(fileURL)
//    dwscripts.fileIsCurrentlyOpen(absoluteFilePath)
//    dwscripts.browseFile(fieldToStore, stripParameters)
//    dwscripts.browseFileWithPath(filePath,fieldToStore, stripParameters)
//    dwscripts.saveExtension(extDOM, fieldsToClear)
//
//   DIALOGS
//    dwscripts.informDontShow()
//	  dwscripts.askYesNo()
//
//   HELP
//    dwscripts.displayDWHelp(helpID)
//
//   SELECTION
//    dwscripts.selectionIsCursor(dom)
//    dwscripts.selectionIsInBody(dom)
//    dwscripts.setCursorToEndOfBody(dom)
//    dwscripts.setCursorOutsideParagraph(dom)
//    dwscripts.adjustCursorForEmptyTableCell(dom)
//
//   NODE INFORMATION
//    dwscripts.getNodeOffsets(node)
//    dwscripts.getOuterHTML(node)
//    dwscripts.getInnerHTML(nodeOrString)
//    dwscripts.getInnerHTMLOffsets(outerHTML)
//    dwscripts.getTagName(nodeOrString)
//
//   NODE DISPLAY
//    dwscripts.displayNode(node, visible)
//
//   DESIGN NOTES
//    dwscripts.getTempURLForDesignNotes()
//    dwscripts.copyDesignNotesFromTempURL()
//    dwscripts.addListValueToNote(noteURL, listPrefix, value)
//    dwscripts.deleteListValueFromNote(noteURL, listPrefix, value)
//    dwscripts.getListValuesFromNote(noteURL, listPrefix)
//
//   .NET 
//    dwscripts.isDotNetCompilerAvailable()
//    dwscripts.getDotNetCompilerFolder()
//    dwscripts.getDotNetCompilerPathCSharp()
//    dwscripts.getDotNetCompilerPathVB()
//
//	 XSLT
//	  dwscripts.isXSLTDoc()
//    dwscripts.isXSLTFile(fileURL)
//--------------------------------------------------------------------

function dwscripts()
{
}

// Static Properties

dwscripts.IS_MAC = (navigator.platform != "Win32");
dwscripts.IS_WIN = (navigator.platform == "Win32");
dwscripts.IS_WIN_98 = (navigator.winOSname == "Win98");
dwscripts.IS_WIN_XP_2K = (navigator.winOSname == "WinXP2K");
dwscripts.IS_WIN_NT = (navigator.winOSname == "WinNT");

dwscripts.FILE_SEP = '/';
dwscripts.ABSOLUTE_FILE_PREFIX = 'file:///';
dwscripts.PARENT_DIR = '/..';
dwscripts.FILE_EXT_SEP = '.';
dwscripts.DESIGN_NOTE_DIR = '_notes';
dwscripts.DESIGN_NOTE_EXT = '.mno';

dwscripts.TEMP_FILE_URL_COUNT = 0;


// Static Methods

//properties
dwscripts.getNewline = dwscripts_getNewline;
dwscripts.getNewlineFromString = dwscripts_getNewlineFromString;

//dom
dwscripts.findDOMObject = dwscripts_findDOMObject;
dwscripts.getEmptyDOM = dwscripts_getEmptyDOM;
dwscripts.getUniqueNameForTag = dwscripts_getUniqueNameForTag;
dwscripts.isInsideTag = dwscripts_isInsideTag;
dwscripts.getEnclosingTagNode = dwscripts_getEnclosingTagNode;
dwscripts.traverseDOM = dwscripts_traverseDOM;
dwscripts.getNodeList = dwscripts_getNodeList;

//array
dwscripts.findInArray = dwscripts_findInArray;
dwscripts.findNewItemInArray = dwscripts_findNewItemInArray;

//string display
dwscripts.sprintf = dwscripts_sprintf;
dwscripts.wrapTextForDisplay = dwscripts_wrapTextForDisplay;
dwscripts.entityNameEncode = dwscripts_entityNameEncode;
dwscripts.entityNameDecode = dwscripts_entityNameDecode;
dwscripts.minEntityNameEncode = dwscripts_minEntityNameEncode;
dwscripts.minEntityNameDecode = dwscripts_minEntityNameDecode;
dwscripts.getHttpStatusMsg = dwscripts_getHttpStatusMsg;

//string handling
dwscripts.escRegExpChars = dwscripts_escRegExpChars;
dwscripts.replaceString = dwscripts_replaceString;
dwscripts.stripChars = dwscripts_stripChars;
dwscripts.trim = dwscripts_trim;
dwscripts.isQuoted = dwscripts_isQuoted;
dwscripts.trimQuotes = dwscripts_trimQuotes;
dwscripts.escQuotes = dwscripts_escQuotes;
dwscripts.unescQuotes = dwscripts_unescQuotes;
dwscripts.isNumber = dwscripts_isNumber;
dwscripts.getNumber = dwscripts_getNumber;
dwscripts.isValidVarName = dwscripts_isValidVarName;
dwscripts.stripInvalidVarChars = dwscripts_stripInvalidVarChars;
dwscripts.extractArgs = dwscripts_extractArgs;

//command
dwscripts.callCommand = dwscripts_callCommand;
dwscripts.getCommandArguments = dwscripts_getCommandArguments;
dwscripts.setCommandReturnValue = dwscripts_setCommandReturnValue;

//file
dwscripts.filePathToLocalURL = dwscripts_filePathToLocalURL;
dwscripts.localURLToFilePath = dwscripts_localURLToFilePath;
dwscripts.getAbsoluteURL = dwscripts_getAbsoluteURL;
dwscripts.getSiteRelativePath = dwscripts_getSiteRelativePath;
dwscripts.getFileName = dwscripts_getFileName;
dwscripts.getSimpleFileName = dwscripts_getSimpleFileName;
dwscripts.getFileExtension = dwscripts_getFileExtension;
dwscripts.getParentURL = dwscripts_getParentURL;
dwscripts.getAbsoluteParentURL = dwscripts_getAbsoluteParentURL;
dwscripts.fileExists = dwscripts_fileExists;
dwscripts.isFile = dwscripts_isFile;
dwscripts.isFolder = dwscripts_isFolder;
dwscripts.isFileReadable = dwscripts_isFileReadable;
dwscripts.isFileWritable = dwscripts_isFileWritable;
dwscripts.listFolder = dwscripts_listFolder;
dwscripts.createFolder = dwscripts_createFolder;
dwscripts.getFileContents = dwscripts_getFileContents;
dwscripts.setFileContents = dwscripts_setFileContents;
dwscripts.copyFileTo = dwscripts_copyFileTo;
dwscripts.removeFile = dwscripts_removeFile;
dwscripts.fileIsCurrentlyOpen = dwscripts_fileIsCurrentlyOpen;
dwscripts.browseFile = dwscripts_browseFile;
dwscripts.browseFileWithPath = dwscripts_browseFileWithPath;
dwscripts.saveExtension = dwscripts_saveExtension;
dwscripts.isXSLTFile = dwscripts_isXSLTFile;
dwscripts.isXSLTDoc = dwscripts_isXSLTDoc;


//dialogs
dwscripts.informDontShow = dwscripts_informDontShow;
dwscripts.askYesNo = dwscripts_askYesNo;

//help
dwscripts.displayDWHelp = dwscripts_displayDWHelp;

//selection
dwscripts.selectionIsCursor = dwscripts_selectionIsCursor;
dwscripts.selectionIsInBody = dwscripts_selectionIsInBody;
dwscripts.setCursorToEndOfBody = dwscripts_setCursorToEndOfBody;
dwscripts.setCursorOutsideParagraph = dwscripts_setCursorOutsideParagraph;
dwscripts.adjustCursorForEmptyTableCell = dwscripts_adjustCursorForEmptyTableCell;

//node info
dwscripts.getNodeOffsets = dwscripts_getNodeOffsets;
dwscripts.getOuterHTML = dwscripts_getOuterHTML;
dwscripts.getInnerHTML = dwscripts_getInnerHTML;
dwscripts.getInnerHTMLOffsets = dwscripts_getInnerHTMLOffsets;
dwscripts.getTagName = dwscripts_getTagName;

//node display
dwscripts.displayNode = dwscripts_displayNode;

//design notes
dwscripts.getTempURLForDesignNotes = dwscripts_getTempURLForDesignNotes;
dwscripts.copyDesignNotesFromTempURL = dwscripts_copyDesignNotesFromTempURL;
dwscripts.addListValueToNote = dwscripts_addListValueToNote;
dwscripts.deleteListValueFromNote = dwscripts_deleteListValueFromNote;
dwscripts.getListValuesFromNote = dwscripts_getListValuesFromNote;

//.NET Compiler 
dwscripts.isDotNetCompilerAvailable = dwscripts_isDotNetCompilerAvailable; 
dwscripts.getDotNetCompilerFolder = dwscripts_getDotNetCompilerFolder; 
dwscripts.getDotNetCompilerPathCSharp = dwscripts_getDotNetCompilerPathCSharp
dwscripts.getDotNetCompilerPathVB = dwscripts_getDotNetCompilerPathVB; 
dwscripts.removeInvalidVBCompilerFlags = dwscripts_removeInvalidVBCompilerFlags; 


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getNewline
//
// DESCRIPTION:
//   Returns the line break type from the registry
//
//   NOTE: Dreamweaver does not write out this preference until the
//     app is closed, so the end-user will need to restart in order
//     to take advantage of the new setting within the JS layer.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - the newline string set in preferences
//--------------------------------------------------------------------

function dwscripts_getNewline()
{
  var retVal = "";

  var newlineInt = dw.getPreferenceInt("Source Format", "Line Break Type", -1);

  if (newlineInt == -1) // if we failed, return the new line based on platform
  {
    retVal = (dwscripts.IS_MAC) ? "\x0D" : "\x0D\x0A";
  }
  else
  {
    retVal = (newlineInt == 0x0d0a) ? "\x0D\x0A" : String.fromCharCode(newlineInt);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getNewlineFromString
//
// DESCRIPTION:
//   Returns the new line used within the given string.
//   Locates the first newline, and returns that value.
//   This function assumes that all newlines within a
//   string are the same.
//
// ARGUMENTS:
//   theStr - string - the string to extract newlines from.
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_getNewlineFromString(theStr)
{
  var retVal= dwscripts.getNewline(); // default

  if (theStr.search(/(\x0D\x0A)|(\x0D)|(\x0A)/) != -1)
  {
    retVal = RegExp.lastMatch;
  }

  return retVal
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.findDOMObject
//
// DESCRIPTION:
//   Given an object name and an optional starting node, this function
//   returns a dom object with that name.  If no starting node is specified,
//   then the current document is used.  For extensions,
//   this means the dom of the extension itself, not the users document.
//
// ARGUMENTS:
//   objName - string - the name of the object to find within the current dom
//   parentObj - dom object - the dom node to begin searching from
//
// RETURNS:
//   dom object
//--------------------------------------------------------------------

function dwscripts_findDOMObject(objName,  parentObj)
{
  var curObj = null;
  var found = false;
  var i,tempObj;

  parentObj = (parentObj != null) ? ( (parentObj.document != null)? parentObj.document : parentObj) : document;
 
  if (parentObj[objName] != null)
  {
    curObj = parentObj[objName]; //at top level
  }
  else
  {
    if (parentObj.forms) //if in form
    {
      for (i=0; i < parentObj.forms.length; i++)   //search level for form object
      {
        if (parentObj.forms[i][objName])
        {
          curObj = parentObj.forms[i][objName];
          found = true;
          break;
        }
      }
    }

    if (!found && parentObj.layers && parentObj.layers.length > 0) //if in layer
    {
      var parentLayers = parentObj.layers;
      for (i=0; i < parentLayers.length; i++)  //else search for child layers
      {
		//don't recurse if this layer doesn't have any children or we'll end up infitly recursing on this node
		var theLayer = parentLayers[i];
		if( theLayer.hasChildNodes() )
		{
          tempObj = this.findDOMObject(objName,theLayer); //recurse
          if (tempObj)
          {
            curObj = tempObj;  //if found, done
            found = true;
            break;
          }
		}
      }
    }
  }

  return curObj;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getEmptyDOM
//
// DESCRIPTION:
//   Returns an empty dom pointer.  This is useful when a temporary
//   DOM is needed to perform some local processing.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   dom pointer or null
//--------------------------------------------------------------------

function dwscripts_getEmptyDOM()
{
  var retVal = dw.getNewDocumentDOM();
  
/*
  var tempURL = dw.getConfigurationPath() + "/Shared/Common/Cache/empty.htm";
  var retVal = null;

  if (DWfile.exists(tempURL))
  {
    retVal = dw.getDocumentDOM(tempURL);
  }
*/

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getUniqueNameForTag
//
// DESCRIPTION:
//   Given a tag type and a base name, checks tags of the same type
//   to determine a unique name.  Unique names are formed by adding a
//   count to the base name.
//
//   For example:
//     the call dwscripts.getUniqueNameForTag("IMG", "Image")
//     might return "Image1", if no images exist on the page.
//
// ARGUMENTS:
//   tagType - string - the type of tags to search for matching names
//   baseName - string - the root variable name, to which the count
//     will be added.
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_getUniqueNameForTag(tagType, baseName)
{
  var dom = dw.getDocumentDOM();
  var tagCounter = 1;
  var possName = baseName + tagCounter;

  var objArray = dom.body.getElementsByTagName(tagType.toUpperCase());
  var objNames = new Array();
  var objName;

  if (objArray.length > 0)
  {
    // create the list of object names
    for (var i=0; i < objArray.length; i++)
    {
      objName = objArray[i].getAttribute("name");
      if (objName)
      {
        objNames.push(objName);
      }

      objName = objArray[i].getAttribute("id");
      if (objName)
      {
        objNames.push(objName);
      }
    }

    while (dwscripts.findInArray(objNames,possName) != -1)
    {
      tagCounter++;
      possName = baseName+tagCounter;
    }
  }

  return possName;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.isInsideTag
//
// DESCRIPTION:
//   Returns true if the given node is located inside one of the tags
//   listed in tagTypes.
//
// ARGUMENTS:
//   node - dom object - the node to check
//   tagTypes - string - comma separated list of tag types to look for
//
// RETURNS:
//   boolean - true if the node is located in one of the tags
//             false otherwise
//--------------------------------------------------------------------

function dwscripts_isInsideTag(node, tagTypes)
{
  var retVal = false;
  var tagList = tagTypes.split(",");
  var currNode = node;
  var tagType;
  
  if (currNode.nodeType == Node.TEXT_NODE){
    currNode = node.parentNode;
  }

  while (currNode != null && currNode.nodeType == Node.ELEMENT_NODE)
  {
    tagType = currNode.tagName.toUpperCase();
    if (dwscripts.findInArray(tagList, tagType) != -1)
    {
      retVal = true;
      break;
    }

    currNode = currNode.parentNode;
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getEnclosingTagNode
//
// DESCRIPTION:
//   Returns a dom object whose tagName matches one of the given
//   tag types and is one of the parent nodes of the given node.
//
// ARGUMENTS:
//   node - dom object - the node to begin searching from
//   tagTypes - string - a comma separated list of tag types to search for
//
// RETURNS:
//   dom pointer
//--------------------------------------------------------------------

function dwscripts_getEnclosingTagNode(node, tagTypes)
{
  var retVal = null;

  var tagList = tagTypes.split(",");

  var currNode = node.parentNode;

  while (currNode != null && currNode.nodeType == Node.ELEMENT_NODE)
  {
    var tagType = currNode.tagName.toUpperCase();
    if (dwscripts.findInArray(tagList, tagType) != -1)
    {
      retVal = currNode;
      break;
    }

    currNode = currNode.parentNode;
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.traverseDOM
//
// DESCRIPTION:
//   Given a starting node, this function traverses the children of that
//   node, calling a handler function for each node type it encounters.
//   This function works by first calling dwscripts.getNodeList, which
//   returns an array of the descendants of the given node.
//
// ARGUMENTS:
//   startNode - dom object - starting point for the traversal.  This
//     node is included in the traversal
//   elementHandlerFn - function pointer - optional function for handling
//     nodes of type element.
//   textHandlerFn - function pointer - optional function for handling nodes
//     of type text.
//   commentHandlerFn -  function pointer - optional function for
//     handling comment nodes.
//   userData - anything - optional parameter which allows the user to pass
//     data between calls to the handler functions.
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function dwscripts_traverseDOM(startNode, elementHandlerFn, textHandlerFn, commentHandlerFn, userData)
{
  if(startNode == null)
  {
    startNode = dw.getDocumentDOM().documentElement;
  }

  var bContinue     = true;  // Return false to halt traverse.
  var current       = null;

  if(elementHandlerFn != null || textHandlerFn != null || commentHandlerFn != null)
  {
    var nodeArr = dwscripts.getNodeList(startNode);

    while(nodeArr.length > 0 && bContinue)
    {
      current = nodeArr.pop();

      // process current node
      switch(current.nodeType)
      {
      case Node.ELEMENT_NODE:
        if(elementHandlerFn != null)
        {
          bContinue = elementHandlerFn(current, userData);
        }
        break;

      case Node.COMMENT_NODE:
        if (commentHandlerFn != null)
        {
          bContinue = commentHandlerFn(current, userData);
        }
        break;

      case Node.TEXT_NODE:
        if (textHandlerFn != null)
        {
          bContinue = textHandlerFn(current, userData);
        }
        break;

      case Node.DOCUMENT_NODE: // Ignores document nodes.
        break;

      default:
        break;
      }
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getNodeList
//
// DESCRIPTION:
//   Creates list of all the child nodes of the specified node.
//   (Used to prevent recursion in traverseDOM function, which was
//    causing memory problems with large documents)
//
// ARGUMENTS:
//   startNode - dom object - the starting point for the traversal
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function dwscripts_getNodeList(startNode)
{
  var retList = new Array();
  var currNode;

  if (startNode)
  {
    retList.push(startNode);
    for (var i=0; i < retList.length; i++)
    {
      currNode = retList[i];
      if (currNode.hasChildNodes)
      {
        for (var j=0; j < currNode.childNodes.length; j++)
        {
          // the following line produces a breadth first traversal
          //retList.push(currNode.childNodes[j]);

          // the following line produces an in order traversal
          retList.splice(i+1, 0, currNode.childNodes[j]);
        }
      }
    }
  }

  return retList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.findInArray
//
// DESCRIPTION:
//   This function finds the given searchValue within the search array,
//   and returns the index of the match location.  -1 is returned if
//   no match is found.  Optionally, a match function can be provided
//   to allow for searches of arrays containing complex objects.
//
//   For example, the following call will search a list of objects,
//   comparing the value property of the object to the searchValue:
//
//     dwscripts.findInArray(arrayOfObjects, "hello",
//       new Function("object,searchValue", "return (object.value == searchValue);"));
//
// ARGUMENTS:
//   arrayToSearch - array - the array to search (ahh, now I see)
//   searchValue - variable - the value to use in comparisons
//   optionalMatchFn - function object - optional function to use in matching
//
// RETURNS:
//   integer - index of match, or -1 if not found
//--------------------------------------------------------------------

function dwscripts_findInArray(arrayToSearch, searchValue, optionalMatchFn)
{
  var retVal = -1;

  for (var i=0; i < arrayToSearch.length; i++)
  {
    if (optionalMatchFn != null)
    {
      if (optionalMatchFn(arrayToSearch[i], searchValue))
      {
        retVal = i;
        break;
      }
    }
    else
    {
      if (arrayToSearch[i] == searchValue)
      {
        retVal = i;
        break;
      }
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.findNewItemInArray
//
// DESCRIPTION:
//   Given two arrays, returns the Index of the first differring element
//   between the two.
//
// ARGUMENTS:
//   arrayA - Array - first array
//   arrayB - Array - second array
//   optionalMatchFn - function object - optional function to use
//     comparisons
//
// RETURNS:
//   integer - index of the new item, -1 if arrays are identical
//--------------------------------------------------------------------

function dwscripts_findNewItemInArray(arrayA, arrayB, optionalMatchFn)
{
  var retVal = -1;

  for (var i=0; i < arrayA.length; i++)
  {
    if (i >= arrayB.length)
    {
      retVal = i;
      break;
    }

    if (optionalMatchFn != null)
    {
      if (!optionalMatchFn(arrayA[i], arrayB[i]))
      {
        retVal = i;
        break;
      }
    }
    else
    {
      if (arrayA[i] != arrayB[i])
      {
        retVal = i;
        break;
      }
    }
  }

  if (retVal == -1 && arrayB.length > arrayA.length)
  {
    retVal = arrayA.length;
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.sprintf
//
// DESCRIPTION:
//   Emulates a poor mans sprintf("blah blah %s blah %s",str1,str2)
//   Used for concatenating error message for easier localization.
//   Returns assembled string.
//
//   The pattern string can use %s for the strings.
//
// ARGUMENTS:
//   theStr - string - the string to replace values in
//
// RETURNS:
//   string with the '%s' replaced
//--------------------------------------------------------------------

function dwscripts_sprintf(theStr)
{
  var retVal = new Array();

  var argc = arguments.length;
  if (argc > 0)
  {
    var nextIndString = 1; // first replacement argument
    var splits = theStr.split(/%[s|d]/);

    for (var i=0; i < splits.length; i++)
    {
      //write out the split itself.
      if (splits[i].length > 0 && dwscripts.isNumber(splits[i].charAt(0)))
      {
        retVal.push(splits[i].substring(1));
      }
      else
      {
        retVal.push(splits[i]);
      }

      //Now write out the next string in the list. 
      if (i < splits.length - 1)
      {
      //Pick the next string out of the array.
      retVal.push(arguments[nextIndString++]);
      }
    }
  }

  return retVal.join("");
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.wrapTextForDisplay
//
// DESCRIPTION:
//   Takes the given string and splits it into lines of a length which
//   does not exceed the given maximum width.  It attempts to split the
//   lines on white space, unless no white space exists within the line.
//
// ARGUMENTS:
//   theText - string - the string to wrap
//   maxWidth - integer - the maximum width for any line
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function dwscripts_wrapTextForDisplay(theText, maxWidth)
{
  var retVal = new Array();

  var start = 0;
  var end = 0;

  while (start < theText.length)
  {
    if (start + maxWidth > theText.length)
    {
      retVal.push(dwscripts.trim(theText.substring(start)));
      start = theText.length;
    }
    else
    {
      end = start + maxWidth;
      for (var i = end; i > start; i--)
      {
        if (theText.charAt(i).search(/\s/) != -1)
        {
          end = i;
          break;
        }
      }

      retVal.push(dwscripts.trim(theText.substring(start, end)));
      start = end + 1;
    }
  }

  return retVal.join("\n");
}


//--------------------------------------------------------------------
// VARIABLE:
//   dwscripts.ENTITY_MAP
//
// DESCRIPTION:
//   This array conatins the entity map encodings for the functions
//   dwscripts.entityNameEncode and dwscripts.entityNamedecode
//--------------------------------------------------------------------

dwscripts.ENTITY_MAP = new Array(
 "\x20", "&nbsp;",
 "\x22", "&quot;",   //Low-ASCII chars that should use entities
 "\x27", "&apos;",
 "\x26", "&amp;",
 "\x3C", "&lt;",
 "\x3E", "&gt;",

 "\x80", "&euro;",   //Hi-ASCII chars
 "\xA1", "&iexcl;",
 "\xA2", "&cent;",
 "\xA3", "&pound;",
 "\xA4", "&curren;",
 "\xA5", "&yen;",
 "\xA6", "&brvbar;",
 "\xA7", "&sect;",
 "\xA8", "&uml;",
 "\xA9", "&copy;",
 "\xAA", "&ordf;",
 "\xAB", "&laquo;",
 "\xAC", "&not;",
 "\xAD", "&shy;",
 "\xAE", "&reg;",
 "\xAF", "&macr;",
 "\xB0", "&deg;",
 "\xB1", "&plusmn;",
 "\xB2", "&sup2;",
 "\xB3", "&sup3;",
 "\xB4", "&acute;",
 "\xB5", "&micro;",
 "\xB6", "&para;",
 "\xB7", "&middot;",
 "\xB8", "&cedil;",
 "\xB9", "&sup1;",
 "\xBA", "&ordm;",
 "\xBB", "&raquo;",
 "\xBC", "&frac14;",
 "\xBD", "&frac12;",
 "\xBE", "&frac34;",
 "\xBF", "&iquest;",
 "\xD7", "&times;",
 "\xF7", "&divide;",
 "\xC6", "&AElig;",
 "\xC1", "&Aacute;",
 "\xC2", "&Acirc;",
 "\xC0", "&Agrave;",
 "\xC5", "&Aring;",
 "\xC3", "&Atilde;",
 "\xC4", "&Auml;",
 "\xC7", "&Ccedil;",
 "\xD0", "&ETH;",
 "\xC9", "&Eacute;",
 "\xCA", "&Ecirc;",
 "\xC8", "&Egrave;",
 "\xCB", "&Euml;",
 "\xCD", "&Iacute;",
 "\xCE", "&Icirc;",
 "\xCC", "&Igrave;",
 "\xCF", "&Iuml;",
 "\xD1", "&Ntilde;",
 "\xD3", "&Oacute;",
 "\xD4", "&Ocirc;",
 "\xD2", "&Ograve;",
 "\xD8", "&Oslash;",
 "\xD5", "&Otilde;",
 "\xD6", "&Ouml;",
 "\xDE", "&THORN;",
 "\xDA", "&Uacute;",
 "\xDB", "&Ucirc;",
 "\xD9", "&Ugrave;",
 "\xDC", "&Uuml;",
 "\xDD", "&Yacute;",
 "\xE1", "&aacute;",
 "\xE2", "&acirc;",
 "\xE6", "&aelig;",
 "\xE0", "&agrave;",
 "\xE5", "&aring;",
 "\xE3", "&atilde;",
 "\xE4", "&auml;",
 "\xE7", "&ccedil;",
 "\xE9", "&eacute;",
 "\xEA", "&ecirc;",
 "\xE8", "&egrave;",
 "\xF0", "&eth;",
 "\xEB", "&euml;",
 "\xED", "&iacute;",
 "\xEE", "&icirc;",
 "\xEC", "&igrave;",
 "\xEF", "&iuml;",
 "\xF1", "&ntilde;",
 "\xF3", "&oacute;",
 "\xF4", "&ocirc;",
 "\xF2", "&ograve;",
 "\xF8", "&oslash;",
 "\xF5", "&otilde;",
 "\xF6", "&ouml;",
 "\xDF", "&szlig;",
 "\xFE", "&thorn;",
 "\xFA", "&uacute;",
 "\xFB", "&ucirc;",
 "\xF9", "&ugrave;",
 "\xFC", "&uuml;",
 "\xFD", "&yacute;",
 "\xFF", "&yuml;");


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.entityNameEncode
//
// DESCRIPTION:
//   If a string has high-ASCII characters or low-ASCII that should
//   be encoded, those characters are converted to entities. For example,
//   and accented "e" will become &egrave;.
//   Note that this does not affect low ascii chars that should be
//   encoded like <>".  Uses the entity map above (ENTITY_MAP). If a
//   high-ASCII char is not found in the map, sets the char to &#nnn;,
//   where nnn is the charCode.
//
//   TODO: This is incredibly inefficient...re-write!!!
//
// ARGUMENTS:
//   origStr - string - the string to encode
//
// RETURNS:
//   encoded string
//--------------------------------------------------------------------

function dwscripts_entityNameEncode(origStr) 
{	
  var i,j;
  var retStr;

  var charCode, hasEntity = false;
  if (origStr)
  {
    retStr = String(origStr); // Make sure we've got a string.
    for (i=0; i < retStr.length && !hasEntity; i++)
    {
      charCode = retStr.charCodeAt(i);
  
      // if  high-ASCII, ", &, <, or >
      //NOTE: for Japanese, don't encode if high-ASCII.
      //For some weird reason, this doesn't work in hex - changed to numeric codes.
      hasEntity = (   (charCode  < 0x0233) 
                   && (charCode > 127 || charCode == 0x22 || charCode == 0x26 || charCode ==0x3C || charCode == 0x3E));
    }
  }

  if (hasEntity)    // iff entity found, entity-encode string
  {
    oldStr = retStr;                     //copy string
    retStr = "";                         //and build new one
    for (i=0; i < oldStr.length; i++)
    {
      charCode = oldStr.charCodeAt(i);
      var theChar = oldStr.charAt(i);
      //see above note...
      if (   (charCode  < 0x0233) 
          && (charCode > 127 || charCode == 0x22 || charCode == 0x26 || charCode ==0x3C || charCode == 0x3E)
         )
      {      	
        for (j=0; j<dwscripts.ENTITY_MAP.length-1; j+=2)   //search map
        {
          if (dwscripts.ENTITY_MAP[j] == theChar)  //if found
          {
            theChar = dwscripts.ENTITY_MAP[j+1];    //set theChar to matching entity
            break;
          }
        }
                
        if (j >= dwscripts.ENTITY_MAP.length)     //if not found in map
        {        
          theChar = '&#' + parseInt(charCode) + ';';  //set to integer
        }
      }
      retStr += theChar;                  //append char to string
    }
  }

  return retStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.entityNameDecode
//
// DESCRIPTION:
//   If a string contains encoded strings like &quot; or &egrave;, they will be converted
//   to their character equivalents for proper display. Returns the decoded string.
//
// ARGUMENTS:
//   origStr - string - the string to decode
//
// RETURNS:
//   decoded string
//--------------------------------------------------------------------

function dwscripts_entityNameDecode(origStr)
{	
  var theEntity, retStr = origStr; 
   
  var entityPattern = /&\w+;/g

  while ((theEntity = entityPattern.exec(origStr)) != null)  //with each entity found
  {
    for (var i=1; i < dwscripts.ENTITY_MAP.length; i+=2)  //look up entity in map
    {
      if (dwscripts.ENTITY_MAP[i] == theEntity)  //when found
      {
        //replace entity with value
        retStr = retStr.replace(RegExp(dwscripts.ENTITY_MAP[i]),(dwscripts.ENTITY_MAP[i-1]));
        break;
      }
    }
  }

  entityPattern = /&#\w+;/g

  while ((theEntity = entityPattern.exec(origStr)) != null)  //with each entity found
  {
    var strEntity = new String(theEntity);
    if (strEntity.charAt(1) == '#')
    {
      var strNum = strEntity.substring(2,strEntity.length-1).toLowerCase();
      if (strNum.charAt(0) == 'x')
      {
        strNum = "0" + strNum;
      }
      var theNum = parseInt(strNum);
      if ((!isNaN(theNum)) && (theNum > 0))
      {
        var theChar = String.fromCharCode(theNum);
        retStr = retStr.replace(RegExp(strEntity),theChar);
      }
    }
  }
  
  return retStr;
}



//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.minEntityNameEncode
//
// DESCRIPTION:
//  This just does entity encoding on the four bad chars: < > & and "
//
//   TODO: This is incredibly inefficient...re-write!!!
//
// ARGUMENTS:
//   origStr - string - the string to encode
//	 bXMLEncode - encode xml characters (default to false)
//
// RETURNS:
//   encoded string
//--------------------------------------------------------------------

function dwscripts_minEntityNameEncode(origStr, bXMLEncode) 
{
  var i,j;
    
  var charCode;
  var oldStr = String(origStr);             //copy string
  var retStr = "";                          //and build new one  
	
  if (oldStr)
  {
    for (i=0; i < oldStr.length; i++)
    {
		charCode = oldStr.charCodeAt(i);
		var theChar = oldStr.charAt(i);
		switch (charCode)
		{
			case 0x22:  retStr += "&quot;"; 		break; 
			case 0x27:  
			{
				//fox xml encode encode ' to &apos;
				if (bXMLEncode)
				{					
					retStr += "&apos;"; 		
				}
				else
				{
					retStr += oldStr.charAt(i);						
				}
				break; 
			}
			case 0x26:  retStr += "&amp;"; 			break; 
			case 0x3C:  retStr += "&lt;"; 			break; 
			case 0x3E:  retStr += "&gt;"; 			break; 
			default: 	retStr += oldStr.charAt(i); break;
		}
  	}
  }
      
 	return retStr;
} //dwscripts_minEntityNameEncode


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.minEntityNameDecode
//
// DESCRIPTION:
//   Only decode strings that have the < > " or & chars encoded, ignore everything else. 
//
// ARGUMENTS:
//   origStr - string - the string to decode
//
// RETURNS:
//   decoded string
//--------------------------------------------------------------------

function dwscripts_minEntityNameDecode(origStr)
	{
 	var retStr = origStr; 
 	retStr = retStr.replace( RegExp("&lt;", "g"), "\x3C"); 
 	retStr = retStr.replace( RegExp("&gt;", "g"), "\x3E"); 
	retStr = retStr.replace( RegExp("&quot;", "g"), "\x22"); 
	retStr = retStr.replace( RegExp("&apos;", "g"), "\x27"); 
 	retStr = retStr.replace( RegExp("&amp;", "g"), "\x26"); 
    return retStr;
	}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getHttpStatusMsg
//
// DESCRIPTION:
//   This function returns a localized string which describes
//   the given http status code.  This string is suitable for
//   display within an alert box.
//
// ARGUMENTS:
//   statusCode - integer - http error code
//
// RETURNS:
//   string with text version of error code
//--------------------------------------------------------------------

function dwscripts_getHttpStatusMsg(statusCode)
{
  var statusMessage = "";

  switch (statusCode)
  {
    case 200:
    {
      statusMessage = MM.MSG_HTTP200;
      break;
    }
    case 400:
    {
      statusMessage = MM.MSG_HTTP400;
      break;
    }
    case 404:
    {
      statusMessage = MM.MSG_HTTP404;
      break;
    }
    case 405:
    {
      statusMessage = MM.MSG_HTTP405;
      break;
    }
    case 500:
    {
      statusMessage = MM.MSG_HTTP500;
      break;
    }
    case 503:
    {
      statusMessage = MM.MSG_HTTP503;
      break;
    }
  }

  return statusMessage;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.escRegExpChars
//
// DESCRIPTION:
//   Given a string, adds escape sequences to characters that have
//   special meaning within regular expressions.  This is useful when
//   you want to use a simple string as a regular expression.
//
// ARGUMENTS:
//   theStr - string - the string to operate on
//
// RETURNS:
//   string with special character escaped
//--------------------------------------------------------------------

function dwscripts_escRegExpChars(regString) {
  var retVal = regString;

  // NOTE: the simple method to do this is below, but the replacement
  //       string doesn't work because the escape characters before
  //       the $1 cause the replacement to be ignored.
  //retVal = retVal.replace(/([\\\/\.\*\+\?\|\$\(\)\[\]\{\}])/g, "\\$1");

  retVal = retVal.replace(/\\/g, "\\\\");
  retVal = retVal.replace(/\//g, "\\/");
  retVal = retVal.replace(/\./g, "\\.");
  retVal = retVal.replace(/\*/g, "\\*");
  retVal = retVal.replace(/\+/g, "\\+");
  retVal = retVal.replace(/\?/g, "\\?");
  retVal = retVal.replace(/\|/g, "\\|");
  retVal = retVal.replace(/\$/g, "\\$");
  retVal = retVal.replace(/\^/g, "\\^");
  retVal = retVal.replace(/\(/g, "\\(");
  retVal = retVal.replace(/\)/g, "\\)");
  retVal = retVal.replace(/\[/g, "\\[");
  retVal = retVal.replace(/\]/g, "\\]");
  retVal = retVal.replace(/\{/g, "\\{");
  retVal = retVal.replace(/\}/g, "\\}");
  retVal = retVal.replace(/\-/g, "\\-");

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.replaceString
//
// DESCRIPTION:
//   Replaces all occurences of a given substring with another substring.
//   This is useful because the standard string replacement function
//   takes a regular expression, which can fail when the substring
//   contains special regular expression characters.
//
// ARGUMENTS:
//   theStr - the string to replace on.
//   oldSub - the substring to search for.
//   newSub - the substring to replace oldSub with.
//
// RETURNS:
//   modified string
//--------------------------------------------------------------------

function dwscripts_replaceString(theStr, oldSub, newSub)
{
  var retVal = theStr;

  if (theStr && theStr.indexOf(oldSub) != -1)
  {
    retVal = theStr.replace(RegExp(dwscripts.escRegExpChars(oldSub), "g"), newSub);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.stripChars
//
// DESCRIPTION:
//   Returns theString with all occurrences of chars in theFilter deleted
//
//   Example:
//     var x = dwscripts.stripChars("lo!", "Hello World!")
//     alert(x) // x is now "He Wrd"
//
// ARGUMENTS:
//   theStr - string - the string to strip characters from
//   theFilter - string - the list of characters to remove from the string
//
// RETURNS:
//   string stripped of all characters in the filter
//--------------------------------------------------------------------

function dwscripts_stripChars(theStr, theFilter)
{
  var retVal = "";

  if (theStr && theFilter)
  {
    retVal = theStr.replace(RegExp("[" + dwscripts.escRegExpChars(theFilter) + "]", "g"), "");
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.trim
//
// DESCRIPTION:
//   Returns theStr with white space trimmed off the front and back.
//
// ARGUMENTS:
//   theStr - string - the string to remove spaces from
//
// RETURNS:
//   string without the white space at the start or end
//--------------------------------------------------------------------

function dwscripts_trim(theStr)
{
  var retVal = "";

  if (typeof theStr == "string")
  {
    var firstNonWhite = theStr.search(/\S/);

    if (firstNonWhite != -1)
    {
      //Count the spaces at the end
      for (var i=theStr.length-1; i >= 0; i--)
      {
        if (theStr.charAt(i).search(/\S/) != -1)
        {
          theStr = theStr.substring(firstNonWhite, i+1);
          break;
        }
      }

      retVal = theStr;
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.isQuoted
//
// DESCRIPTION:
//   Returns true if the given string is quoted
//
// ARGUMENTS:
//   theStr - string - the string to check for quotes
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_isQuoted(theStr)
{
  var retVal = false;
  var theQuote;

  if (theStr && theStr.length > 1)
  {
    var theQuote = theStr.charAt(0);
    if ((theQuote == "'" || theQuote == '"') &&
        theStr.charAt(theStr.length-1) == theQuote)
    {
      retVal = true;
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.trimQuotes
//
// DESCRIPTION:
//   Removes the quotes around the given string if they exist
//
// ARGUMENTS:
//   theStr - string - the string to remove quotes from
//
// RETURNS:
//   modified string
//--------------------------------------------------------------------

function dwscripts_trimQuotes(theStr)
{
  var retVal = theStr;
  var theQuote;

  if (retVal.length > 1)  //if possibly quoted
  {
    theQuote = retVal.charAt(0);
    if ((theQuote == "'" || theQuote == '"') &&       //if theStr started with quote
        retVal.charAt(retVal.length-1) == theQuote)   //and ended with same quote
    {
      retVal = retVal.substring(1,retVal.length-1); //unquote it
    }
  }

  return retVal
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.escQuotes
//
// DESCRIPTION:
//   Passed a string, finds special chars '"\ and escapes them with \
//
// ARGUMENTS:
//   theStr - string - the string to escape quotes within
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_escQuotes(theStr)
{
  var escStr = new Array();
  var theChar;
  var lastMatch = 0;

  for (var i=0; i < theStr.length; i++)
  {
    theChar = theStr.charAt(i);
    if (theChar=='"' || theChar=="'" || theChar=="\\")
    {
      escStr.push(theStr.substring(lastMatch, i) + "\\" + theChar);
      lastMatch = i+1;
    }
  }
  escStr.push(theStr.substring(lastMatch));

  return escStr.join("");
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.unescQuotes
//
// DESCRIPTION:
//   Passed a string, finds any escape chars \ and removes them
//
// ARGUMENTS:
//   theStr - string - the string from which to remove escape chars
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_unescQuotes(theStr)
{
  var unescStr = new Array();
  var theChar;
  var lastMatch = 0;

  var strLen = theStr.length;

  for (i=0; i < strLen; i++)
  {
   theChar = theStr.charAt(i);
    if (theChar == "\\" && i < strLen - 1) //if escape char and not end
    {
      unescStr.push(theStr.substring(lastMatch, i) + theStr.charAt(i+1));
      i++;
      lastMatch = i+1;
    }
  }
  unescStr.push(theStr.substring(lastMatch));

  return unescStr.join("");
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.isNumber
//
// DESCRIPTION:
//   Returns true if the given string is a number.
//   NOTE: this function will return false if a number begins
//         with a zero
//
// ARGUMENTS:
//   theStr - string - the string to check
//
// RETURNS:
//   boolean - true is the string is a number
//--------------------------------------------------------------------

function dwscripts_isNumber(theStr)
{
  var retVal = (parseInt(theStr).toString() == theStr ||
                parseFloat(theStr).toString() == theStr);
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getNumber
//
// DESCRIPTION:
//   Returns the number represented by the string.
//   Returns zero if not a number.
//
// ARGUMENTS:
//   theStr - string - the string to convert to a number
//
// RETURNS:
//   returns a number
//--------------------------------------------------------------------

function dwscripts_getNumber(theStr) {
  var retVal = 0;

  if (parseInt(theStr).toString() == theStr)
  {
    retVal = parseInt(theStr);
  }
  else if (parseFloat(theStr).toString() == theStr)
  {
    retVal = parseFloat(theStr);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.isValidVarName
//
// DESCRIPTION:
//   Returns true if the given name is a valid JavaScript variable name
//
// ARGUMENTS:
//   theName - string - the name to check
//   allowHighAscii - boolean - optional
//		whether to allow high ascii or not -- defaults to false.
//
// RETURNS:
//   boolean - true is the name only contains valid variable characters
//--------------------------------------------------------------------

function dwscripts_isValidVarName(theName, allowHighAscii)
{
  if (allowHighAscii == null)
  {
	allowHighAscii = false;
  }

  var retVal = (theName.length > 0);
  
  if (retVal && theName.search(/\W/) != -1)  // check for any non word chars
  {
    retVal = false;
  }

  if (retVal && theName.charAt(0).search(/\d/) != -1)  // can't start with a number
  {
    retVal = false;
  }

  if (retVal && (theName.charAt(0) == "_" ||
                 theName.charAt(theName.length - 1) == "_"))  // can't start or end with underscore
  {
    retVal = false;
  }

  // check for high ascii
  
  if (retVal && !allowHighAscii)
  {
    for (i = 0; i < theName.length; i++)
    {
      if (theName.charCodeAt(i) > 127)
      {
	    retVal = false;
		break;
	  }
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.stripInvalidVarChars
//
// DESCRIPTION:
//   Returns a string with the characters which are invalid for
//   variable names removed.
//
// ARGUMENTS:
//   theStr - string - the string to remove invalid characters from.
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_stripInvalidVarChars(theStr)
{
  var retVal = dwscripts.stripChars(theStr, " ~!@#$%^&*()+|`-=\\{}[]:\";'<>,./?");

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.extractArgs
//
// DESCRIPTION:
//   Given a function call, extracts the args and returns them in array
//
//   Respects ', skips over stuff between quotes, and returns them dequoted.
//   IMPORTANT: argArray[0] is the function call!!
//              Actual args start at argArray[1].
//
// ARGUMENTS:
//   fnCallStr - string - the function call to pull arguments from
//
// RETURNS:
//   string array of the argument values from the function call
//--------------------------------------------------------------------

function dwscripts_extractArgs(fnCallStr)
{
  var theStr;
  var argArray = getTokens(fnCallStr,"(),");

  for (var i=0; i < argArray.length; i++)
  {
    theStr = argArray[i];
    theStr = dwscripts.unescQuotes(theStr);
    theStr = dwscripts.trim(theStr);
    theStr = dwscripts.trimQuotes(theStr);
    argArray[i] = theStr;
  }

  return argArray;
}



//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.callCommand
//
// DESCRIPTION:
//   Popups up a command. Before popping it up, updates globals.
//   Command can then use these globals to get and receive arguments
//   from the caller.
//
// ARGUMENTS:
//   cmdName - string - the name of the command to display
//   argObject - anything - the arguments to pass to the command
//
// RETURNS:
//   value from called command
//--------------------------------------------------------------------

function dwscripts_callCommand(cmdName, argObject)
{
  var retVal = null;

  // create arrays for the stack
  if (MM.cmdArgument == null || MM.cmdReturnValue == null)
  {
    MM.cmdArgument = new Array();
    MM.cmdReturnValue = new Array();
  }

  // add the call to the stack
  MM.cmdArgument.push(argObject);
  MM.cmdReturnValue.push(null);
  
  // for backward compatibility, set the old values
  MM.commandArgument = argObject;
  MM.commandReturnValue = null;

  dw.runCommand(cmdName, argObject);

  // remove the call from the stack
  retVal = MM.cmdReturnValue.pop();
  MM.cmdArgument.pop();
  
  // check if the command is using the old interface
  if (retVal == null && MM.commandReturnValue != null)
  {
    retVal = MM.commandReturnValue;
  }
  
  // clear the old values
  MM.commandArgument = null;
  MM.commandReturnValue = null;

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getCommandArguments
//
// DESCRIPTION:
//   Returns the last arguments pushed onto the stack by the
//   dwscripts.callCommand function. This should be used by
//   commands which are called from other extensions.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   the value passed into the dwscripts.callCommand function
//--------------------------------------------------------------------

function dwscripts_getCommandArguments()
{
  var retVal = "";

  if (MM.cmdArgument && MM.cmdArgument.length > 0)
  {
    retVal = MM.cmdArgument[MM.cmdArgument.length - 1];
  }
  else
  {
    // the command was called using the old callCommand function
    // get the argument from the old location
    retVal = MM.commandArgument;
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.setCommandReturnValue
//
// DESCRIPTION:
//   Sets the value that will be returned from the dwscripts.callCommand
//   function.
//
// ARGUMENTS:
//   theValue - any value to be returned
//
// RETURNS:
//   boolean - true if successfully set
//--------------------------------------------------------------------

function dwscripts_setCommandReturnValue(theValue)
{
  var retVal = false;

  if (MM.cmdReturnValue && MM.cmdReturnValue.length > 0)
  {
    MM.cmdReturnValue[MM.cmdReturnValue.length - 1] = theValue;
    retVal = true;
  }
  else
  {
    // the command was called using the old callCommand function
    // set the old variable
    MM.commandReturnValue = theValue;
    retVal = true;
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.filePathToLocalURL
//
// DESCRIPTION:
//   Converts a windows or macintosh file path string to a URL.
//   This just calls the function in MMNotes.  It is added here
//   for completeness.
//
// ARGUMENTS:
//   filePath - string - the file path to convert
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_filePathToLocalURL(filePath)
{
  return MMNotes.filePathToLocalURL(filePath);
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.localURLToFilePath
//
// DESCRIPTION:
//   Converts a URL string to a windows or macintosh file path.
//   This just calls the function in MMNotes.  It is added here
//   for completeness.
//
// ARGUMENTS:
//   fileURL - string - the URL to convert
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_localURLToFilePath(fileURL)
{
  return MMNotes.localURLToFilePath(fileURL);
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getSiteRelativePath
//
// DESCRIPTION:
//   Given a file URL, this function returns the site relative path.
//   It returns the local file path if the file doesn't belong to
//	 the current site
//
// ARGUMENTS:
//   fileURL - string - the URL to convert
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_getSiteRelativePath(fileURL)
{
  var nameStr = dwscripts.localURLToFilePath(fileURL);
  
  //see if this file is part of a site and if so, set the nameStr to be the
  //site relative path instead of the full file path
  var siteName = site.getSiteForURL(fileURL);
  if (siteName != "" && siteName == site.getCurrentSite())
  {
	//we have a site, remove the site root from the beginning of the file's path
	nameStr = nameStr.substring(site.getLocalPathToFiles().length);
  }
  return nameStr;
}

//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getAbsoluteURL
//
// DESCRIPTION:
//   Given a relative URL, this function returns an absolute URL path.
//   It returns the empty string if the given URL cannot be converted
//   into an absolute URL.  This would be the case if the URL is site
//   relative, and no site is defined.
//
// ARGUMENTS:
//   relativeURL - string - the URL to convert
//   docURL - string - optional argument which specifies the path
//     of the document that this file is relative to.  This value
//     should be an absolute path.
//   siteURL - string - optional argument which specifies the path
//     of the site that this file is realtive to.  This value
//     should be an absolute path.
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_getAbsoluteURL(relativeURL, docURL, siteURL)
{
  var retVal = relativeURL;

  var siteUrl = (siteURL) ? siteURL : dw.getSiteRoot();
  var docUrl = (docURL) ? docURL : dw.getDocumentPath("document");

  var index, prevIndex;

  if (relativeURL.indexOf(dwscripts.ABSOLUTE_FILE_PREFIX) == -1)
  {
    if (relativeURL.charAt(0) == dwscripts.FILE_SEP) // site relative path
    {
      if (siteUrl)
      {
        if (siteUrl.charAt(siteUrl.length-1) == dwscripts.FILE_SEP)
        {
          retVal = siteUrl.substring(0, siteUrl.length-1) + relativeURL;
        }
        else
        {
          retVal = siteUrl + relativeURL;
        }
      }
      else
      {
        alert(MM.MSG_NoSiteForSiteRelURLs);
      }
    }
    else // doc relative path
    {
      if (docUrl)
      {
        index = docUrl.lastIndexOf(dwscripts.FILE_SEP);
        if (index != -1)
        {
          docUrl = docUrl.substring(0, index);
        }
        retVal = docUrl + dwscripts.FILE_SEP + relativeURL;
      }
      else
      {
        alert(MM.MSG_NotSavedForDocRelURLs);
      }
    }
  }

  //remove relative references from the path
  while (retVal.indexOf(dwscripts.PARENT_DIR) != -1)
  {
    index = retVal.indexOf(dwscripts.PARENT_DIR);
    prevIndex = retVal.lastIndexOf(dwscripts.FILE_SEP, index-1);
    if (prevIndex != -1)
    {
      retVal = retVal.substring(0, prevIndex) + retVal.substring(index + dwscripts.PARENT_DIR.length);
    }
    else
    {
      retVal = "";
    }
  }

  // set retVal to blank if we have removed too much
  if (retVal.indexOf(dwscripts.ABSOLUTE_FILE_PREFIX) == -1)
  {
    retVal = "";
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getFileName
//
// DESCRIPTION:
//   Returns just the file name portion of the given URL.
//
// ARGUMENTS:
//   fileURL - string - the URL to extract the file name from
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_getFileName(fileURL)
{
  var retVal = fileURL;

  if (retVal)
  {
    var index = retVal.lastIndexOf(dwscripts.FILE_SEP);
    if (index != -1)
    {
      retVal = retVal.substring(index + dwscripts.FILE_SEP.length, retVal.length);
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getSimpleFileName
//
// DESCRIPTION:
//   Returns the simple name of the file, with a file extension
//
// ARGUMENTS:
//   fileURL - string - the URL to extract the simple name from
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_getSimpleFileName(fileURL)
{
  var retVal = dwscripts.getFileName(fileURL);

  if (retVal)
  {
    var index = retVal.lastIndexOf(dwscripts.FILE_EXT_SEP);
    if (index != -1)
    {
      retVal = retVal.substring(0, index);
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getFileExtension
//
// DESCRIPTION:
//   Returns the file extension for the given URL.
//   Returns a blank string if no extension exists.
//
// ARGUMENTS:
//   fileURL - string - the URL to extract the extension from
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_getFileExtension(fileURL)
{
  var retVal = "";

  var index = fileURL.lastIndexOf(dwscripts.FILE_EXT_SEP);
  if (index != -1)
  {
    retVal = fileURL.substring(index + 1);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getParentURL
//
// DESCRIPTION:
//   Returns the URL of the parent folder for the given URL.
//   If the given URL is relative, then the returned string will be relative.
//   Returns the empty string if no parent is found.
//
// ARGUMENTS:
//   fileURL - string - the URL to find the parent of
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_getParentURL(fileURL)
{
  var retVal = '';
  
  var isAbsolute = (fileURL.indexOf(dwscripts.ABSOLUTE_FILE_PREFIX) != -1);

  var index = fileURL.lastIndexOf(dwscripts.FILE_SEP);
  if (index != -1)
  {
    retVal = fileURL.substring(0, index);
    
    // check if we have removed too much
    if (isAbsolute && retVal.indexOf(dwscripts.ABSOLUTE_FILE_PREFIX) == -1)
    {
      retVal = '';
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getAbsoluteParentURL
//
// DESCRIPTION:
//   Returns the absolute URL of the parent folder for the given URL.
//   Returns the empty string if no parent is found.
//
// ARGUMENTS:
//   fileURL - string - the URL to find the parent of
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_getAbsoluteParentURL(fileURL)
{
  var retVal = '';
  var fullURL = dwscripts.getAbsoluteURL(fileURL);

  var index = fullURL.lastIndexOf(dwscripts.FILE_SEP);
  if (index != -1)
  {
    retVal = fullURL.substring(0, index);
    
    // check if we have removed too much
    if (retVal.indexOf(dwscripts.ABSOLUTE_FILE_PREFIX) == -1)
    {
      retVal = '';
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.fileExists
//
// DESCRIPTION:
//   Returns true if the specified file exists
//
// ARGUMENTS:
//   fileURL - string - the URL to check for existance
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_fileExists(fileURL)
{
  var retVal = false;

  var fullURL = dwscripts.getAbsoluteURL(fileURL);

  if (fullURL && DWfile.exists(fullURL))
  {
    retVal = true;
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.isFile
//
// DESCRIPTION:
//   Returns true if the specified URL points to a file.  Returns
//   false if the URL does not exist, or if the URL points to a
//   folder.
//
// ARGUMENTS:
//   fileURL - string - the URL to check
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_isFile(fileURL)
{
  var retVal = false;

  var fullURL = dwscripts.getAbsoluteURL(fileURL);

  if (fullURL && DWfile.exists(fullURL))
  {
    var attr = DWfile.getAttributes(fullURL);
    retVal = (attr == '' || attr == 'R');
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.isFolder
//
// DESCRIPTION:
//   Returns true if the specified URL points to a folder.
//
// ARGUMENTS:
//   fileURL - string - the URL to check
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_isFolder(fileURL)
{
  var retVal = false;

  var fullURL = dwscripts.getAbsoluteURL(fileURL);

  if (fullURL && DWfile.exists(fullURL))
  {
    retVal = (DWfile.getAttributes(fullURL).indexOf('D') != -1);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.isFileReadable
//
// DESCRIPTION:
//   Returns true if the file is readable.  This basically just checks
//   to see if the file exists.
//
// ARGUMENTS:
//   fileURL - string - the URL to check
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_isFileReadable(fileURL)
{
  var retVal = false;

  var fullURL = dwscripts.getAbsoluteURL(fileURL);

  if (fullURL && DWfile.exists(fullURL))
  {
    retVal = true;
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.isFileWritable
//
// DESCRIPTION:
//   Returns true if the files permissions allow it to be written to.
//
// ARGUMENTS:
//   fileURL - string - the URL to check
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_isFileWritable(fileURL)
{
  var retVal = false;

  var fullURL = dwscripts.getAbsoluteURL(fileURL);

  if (fullURL && DWfile.exists(fullURL))
  {
    retVal = (DWfile.getAttributes(fullURL).indexOf('R') == -1);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.listFolder
//
// DESCRIPTION:
//   Returns an Array of file names.  Returns all of the files within
//   the specified URL, unless a filter function is supplied.  If
//   a filter function is supplied, then only the files for which this
//   functions returns true are returned.  The filter function takes
//   a single argument, which is the absolute URL of the file to check.
//
// ARGUMENTS:
//   fileURL - string - the URL to get the content of
//   optionalFilterFn - function pointer - the function to use in
//     selecting which file names to return.
//
// RETURNS:
//   array of strings
//--------------------------------------------------------------------

function dwscripts_listFolder(fileURL, optionalFilterFn)
{
  var retList = new Array();

  var fullURL = dwscripts.getAbsoluteURL(fileURL);

  if (fullURL && DWfile.exists(fullURL))
  {
    var fileList = DWfile.listFolder(fullURL);

    // now filter with the filter function
    for (var i=0; i < fileList.length; i++) {
      if (optionalFilterFn != null)
      {
        if (optionalFilterFn(fullURL + dwscripts.FILE_SEP + fileList[i]))
        {
          retList.push(fileList[i]);
        }
      }
      else
      {
        retList.push(fileList[i]);
      }
    }
  }

  return retList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.createFolder
//
// DESCRIPTION:
//   Creates the specified folder.  Returns true if successful, and
//   false otherwise.
//
// ARGUMENTS:
//   fileURL - string - the URL of the folder to create
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_createFolder(fileURL)
{
  var retVal = false;

  var fullURL = dwscripts.getAbsoluteURL(fileURL);

  if (fullURL && !DWfile.exists(fullURL))
  {
    retVal = DWfile.createFolder(fullURL);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getFileContents
//
// DESCRIPTION:
//   Gets the contents of the file specified in the URL.
//   Corrects the newlines within the returned string to match the
//   current document.
//
// ARGUMENTS:
//   fileURL - string - the URL of which to get the contents
//   ignoreNewlines - boolean - if true, indicates that the newlines
//     should not be altered
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_getFileContents(fileURL, ignoreNewlines)
{
  var retVal = "";

  var strNewline, searchPatt;
  var fullURL = dwscripts.getAbsoluteURL(fileURL);

  if (fullURL && DWfile.exists(fullURL) && dwscripts.isFile(fullURL))
  {
    retVal = DWfile.read(fullURL);

    if (!ignoreNewlines)
    {
      var newline = dwscripts.getNewline();
      
      //replace file newlines with current page newlines
      strNewline = dwscripts.getNewlineFromString(retVal);
      if (strNewline != newline)
      {
        searchPatt = new RegExp(strNewline,"g");
        retVal = retVal.replace(searchPatt, newline);
      }
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.setFileContents
//
// DESCRIPTION:
//   Sets the contents of the specified file to the value passed in
//   contents.  Newlines are corrected within the contents string,
//   unless ignoreNewlines is specfied.  The append flag can be set
//   to have the contents string appended to the specified file.
//
// ARGUMENTS:
//   fileURL - string - the URL to set the contents of
//   contents - string - the string to insert in the file
//   append - boolean - indicates that the contents string
//     should be appended to the file.
//   ignoreNewlines - boolean - indicates that the new lines within
//     the contents string should not be touched.
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_setFileContents(fileURL, contents, append, ignoreNewlines)
{
  var retVal = false;

  var fullURL = dwscripts.getAbsoluteURL(fileURL);
  var strNewline;

  if (fullURL && ( !DWfile.exists(fullURL) || (DWfile.exists(fullURL) && dwscripts.isFile(fullURL)) ) )
  {
    if (!ignoreNewlines)
    {
      var newline = dwscripts.getNewline();
      
      // set newlines
      strNewline = dwscripts.getNewlineFromString(contents);
      if (strNewline && strNewline != newline)
      {
        searchPatt = new RegExp(strNewline,"g");
        contents = contents.replace(searchPatt, newline);
      }
    }

    // write the file
    if (append)
    {
      retVal = DWfile.write(fullURL, contents, append);
    }
    else
    {
      retVal = DWfile.write(fullURL, contents);
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.copyFileTo
//
// DESCRIPTION:
//   Copies a file and its design note to a new location.
//   If ignore design note is specified, then only the file is copied.
//   Returns true if successful
//
// ARGUMENTS:
//   sourceFileURL - string - the file to copy from
//   targetFileURL - string - the file to copy to
//   ignoreDesignNote - boolean - if true, the design note is not copied
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_copyFileTo(sourceFileURL, targetFileURL, ignoreDesignNote)
{
  var retVal = false;

  var sourceFullURL = dwscripts.getAbsoluteURL(sourceFileURL);
  var targetFullURL = dwscripts.getAbsoluteURL(targetFileURL);

  var metaObj, toMetaObj, toMetaDir;
  if (sourceFullURL && targetFullURL)
  {
    retVal = DWfile.copy(sourceFullURL, targetFullURL);

    if (retVal && !ignoreDesignNote)
    {

      var metaFullURL = dwscripts.getParentURL(sourceFullURL) + dwscripts.FILE_SEP +
                        dwscripts.DESIGN_NOTE_DIR + dwscripts.FILE_SEP +
                        dwscripts.getFileName(sourceFullURL) + dwscripts.DESIGN_NOTE_EXT;

      if (DWfile.exists(metaFullURL))
      {
        var targetMetaFullURL = dwscripts.getParentURL(targetFullURL) + dwscripts.FILE_SEP +
                                dwscripts.DESIGN_NOTE_DIR + dwscripts.FILE_SEP +
                                dwscripts.getFileName(targetFullURL) + dwscripts.DESIGN_NOTE_EXT;
        var targetMetaDir = dwscripts.getParentURL(targetMetaFullURL);

        if (!DWfile.exists(targetMetaDir))
        {
          retVal = dwscripts.createFolder(targetMetaDir);
        }

        if (retVal)
        {
          retVal = DWfile.copy(metaFullURL, targetMetaFullURL);
        }
      }
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.removeFile
//
// DESCRIPTION:
//   Deletes the given file.  Returns true if the file was successfully
//   removed.  False otherwise.
//
// ARGUMENTS:
//   fileURL - string - the file to delete
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_removeFile(fileURL)
{
  var retVal = false;

  var fullURL = dwscripts.getAbsoluteURL(fileURL);

  if (fullURL && DWfile.exists(fullURL))
  {
    retVal = DWfile.remove(fullURL);
  }

  return retVal;
}

//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.fileIsCurrentlyOpen
//
// DESCRIPTION:
//   Determines if a given file is currently open
//
// ARGUMENTS:
//   absoluteFilePath - string - absolute path to file, includes file name
//
// RETURNS:
//   boolean, true if opened, false if not opened
//--------------------------------------------------------------------

function dwscripts_fileIsCurrentlyOpen(absoluteFilePath)
{
  var fileObj = dw.getDocumentDOM(absoluteFilePath);
  var openFilesArr = dw.getDocumentList(); 
  var fileIsOpen = false;
  var nOpenFiles;
  var i;

  // note: openFilesArr is an array of currently open document objects
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


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.isXSLTFile
//
// DESCRIPTION:
//   Returns true if the specified URL points to a file.  Returns
//   false if the URL does not exist, or if the URL points to a
//   folder.
//
// ARGUMENTS:
//   fileURL - string - the URL to check
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_isXSLTFile(fileURL)
{
  var retVal = false;
	var fileExtIndex = fileURL.lastIndexOf(".");
	if (fileExtIndex != -1)
	{
		var fileExt = fileURL.substring(fileExtIndex+1);
		if ((fileExt == "xslt") || (fileExt == "xsl"))
		{
			retVal = true;
		}
	}
  return retVal;
}



//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts_browseFile
//
// DESCRIPTION:
//   Displays the browse file dialog, and then stores the result in
//   the given field.
//
// ARGUMENTS:
//   fieldToStore - DOM object - the text field object to store the
//     results in.
//   stripParameters - boolean - (optional) set to true if parameters
//     should be removed from the URL before storing it in the field
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function dwscripts_browseFile(fieldToStore, stripParameters)
{
  if (fieldToStore)
  {  
    var fileName = browseForFileURL();

    if (stripParameters)
    {
      var index = fileName.indexOf("?");
      if (index != -1)
      {
        fileName = fileName.substring(0,index);
      }
    }

    if (fileName)
    {
      fieldToStore.value = fileName;
    }
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts_browseFileWithPath
//
// DESCRIPTION:
//   Displays the browse file dialog, and then stores the result in
//   the given field.
//
// ARGUMENTS:
//	 filePath - the filepath of the file to locate
//   fieldToStore - DOM object - the text field object to store the
//     results in.
//   stripParameters - boolean - (optional) set to true if parameters
//     should be removed from the URL before storing it in the field
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function dwscripts_browseFileWithPath(filePath,fieldToStore, stripParameters)
{
	var fileName = "";
	if (filePath != null)
	{
    var fileName = browseForFileURL("select","",false,false,"","",true,filePath);
    if (stripParameters)
    {
      var index = fileName.indexOf("?");
      if (index != -1)
      {
        fileName = fileName.substring(0,index);
      }
    }
		if (fieldToStore)
		{  
      fieldToStore.value = fileName;
		}
	}
	return fileName;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts_saveExtension
//
// DESCRIPTION:
//   Saves the current state of the extension dialog, so that the next
//   time the user opens it, previous values are remembered.
//
// ARGUMENTS:
//   extDOM - document object - the dom of the extension to be saved
//   fieldsToClear - array of field names - (optional) a list of fields
//     whose values should not be remembered
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function dwscripts_saveExtension(extDOM, fieldsToClear) {
  var curHTML = DWfile.read(extDOM.URL);
  var tempFilename = dw.getConfigurationPath() + '/Shared/MM/Cache/empty.htm';
  if (DWfile.exists(tempFilename)) {
    var tempDOM = dw.getDocumentDOM(tempFilename);
    tempDOM.documentElement.outerHTML = curHTML;
	  var atrStr = DWfile.getAttributes(extDOM.URL);
    if (tempDOM.body.outerHTML != extDOM.body.outerHTML && (atrStr.indexOf('R') == -1)){
      tempDOM.body.outerHTML = extDOM.body.outerHTML;
      if (fieldsToClear){
        for (var i=0; i < fieldsToClear.length; i++){
          for (var j=0; j < tempDOM.forms[0].elements.length; j++){
            // Currently clears only text fields, but could be expanded to clear
            // radio buttons, textareas, etc.
            if (tempDOM.forms[0].elements[j].name == fieldsToClear[i] && tempDOM.forms[0].elements[j].type == "text"){
              tempDOM.forms[0].elements[j].value = "";
              break;
            }
          }
        }
      }
      DWfile.write(extDOM.URL, tempDOM.documentElement.outerHTML);
  	}
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.informDontShow
//
// DESCRIPTION:
//   This function displays an informational dialog, with the 
//   "don't show me this again option".  If the user selects this
//   option, then the given preference is set, and the dialog will
//   not be displayed the next time this function is called.
//
//   Example:
//     dwscripts.informDontShow("message",
//       "Extensions\\Objects\\NewThing","SkipNewThingWarning");
//
// ARGUMENTS:
//   message - string - the message to display.  Please note that
//     returns should be included in the message.  This dialog does
//     not automatically wrap.
//   prefSection - string - the section where this preference should
//     be stored
//   prefKey - string - the name of the key in which this preference
//     should be stored
//
// RETURNS:
//   if the user turned off the dialog return false
//   also return false if the user dismisses the dialog
//   otherwise return true
//--------------------------------------------------------------------

function dwscripts_informDontShow(message, prefSection, prefKey)
{
  if (message && prefSection && prefKey)
  {    
    // check if the registryKey is already set
    var retVal = true ;
    var dontShowAgain = dw.getPreferenceString(prefSection, prefKey, -1);

    // if not set, display the alert
    if (dontShowAgain == -1)
    {
      var cmdName = 'informDS.htm';

      var cmdFile = dreamweaver.getConfigurationPath() + '/Commands/' + cmdName;

      var cmdDOM = dreamweaver.getDocumentDOM(cmdFile);

      if (cmdDOM)
      {
        var cmdWin = cmdDOM.parentWindow;
        
        message = message.replace(/(\n|\r|\r\n)/g, "<br>");
        
        // Pass one arg for OK/Cancel, or extra args to define btns
        cmdWin.setMessage(message);

        dontShowAgain = dwscripts.callCommand(cmdName);
        
        // now set the registry key based on the result
        if (dontShowAgain) 
        {
          dw.setPreferenceString(prefSection, prefKey, true);
          retVal = false ;
        }
      }
    }
    else
    {
      retVal = false ;
    }
  }
  
  return retVal ;
}

//*-------------------------------------------------------------------
// FUNCTION:
//   dwscripts.informDontShow
//
// DESCRIPTION:
//
//	Pops up a dialog pops a message and asks Yes/No and returns the 
//	value selected by the user
//
// ARGUMENTS: 
//	 
//	messageString 	:  Message string that would appear in the dialog
//	defaultResult 	:  the default result value  
//
// RETURNS:
//	 integer
//--------------------------------------------------------------------

function dwscripts_askYesNo(messageString, defaultResult)
{
	var retVal = -1;
	var cmdName = 'ConfirmNoDS.htm';
	var cmdFile = dreamweaver.getConfigurationPath() + '/Commands/' + cmdName;

	var cmdDOM = dreamweaver.getDocumentDOM(cmdFile);
	var retVal = defaultResult; 

	if (cmdDOM) 
	{
	  var cmdWin = cmdDOM.parentWindow;
	  cmdWin.render(messageString, MM.BTN_Yes, MM.BTN_No);
	
	  MMNotes.Confirm_RESULT = true;  		 
	  dw.runCommand(cmdName);
	  if (MMNotes.Confirm_RESULT == MM.BTN_Yes)
			retVal = 1; 
	  else if (MMNotes.Confirm_RESULT == MM.BTN_No)
			retVal = 0; 
	  else
			retVal = -1; 
	}

	return retVal; 	
}

//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.displayDWHelp
//
// DESCRIPTION:
//   Given a helpID, displays the given help page within the
//   context of the dreamweaver help system.
//
//   NOTE: this function should only be used by Macromedia
//         extension files.
//
// ARGUMENTS:
//   helpID - string - the id of the help document to displays
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function dwscripts_displayDWHelp(helpID)
{
  if (typeof helpID == 'undefined')
    helpID = MM.HELP_mnuDWUsing; 
  
  if (typeof helpID == 'undefined')
    return; 
    
  var success = dreamweaver.openHelpURL (helpID);

  if (!success)
  {
    alert(MM.HELP_errorViewerNotFound);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.selectionIsCursor
//
// DESCRIPTION:
//   This function returns true if the current selection is a cursor,
//   rather than a range of characters.
//
// ARGUMENTS:
//   dom - DOM object - optional argument which specifies the DOM to check
//
// RETURNS:
//   boolean - true if the selection is a cursor, false otherwise
//--------------------------------------------------------------------

function dwscripts_selectionIsCursor(dom)
{
  var retVal = false;

  dom = (dom != null) ? dom : dw.getDocumentDOM();

  if (dom)
  {
    var currSelection  = dom.getSelection(true);

    retVal = (currSelection && currSelection.length > 1 && currSelection[0] == currSelection[1]);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.selectionIsInBody
//
// DESCRIPTION:
//   This function returns true if the current selection is in the
//   body of the current document.
//
// ARGUMENTS:
//   dom - DOM object - optional argument which specifies the DOM to check
//
// RETURNS:
//   boolean - true if selection is in the body, false otherwise
//--------------------------------------------------------------------

function dwscripts_selectionIsInBody(dom)
{
  var retVal = false;

  dom = (dom != null) ? dom : dw.getDocumentDOM();

  if (dom)
  {
    selObj = dom.getSelectedNode();

    var retVal = (selObj && selObj.tagName && selObj.tagName == "BODY") ? true : false;

    while (selObj && selObj.parentNode && !retVal)
    {
      selObj = selObj.parentNode;

      if (selObj.tagName == "BODY")
      {
        retVal = true;
        break;
      }
      else if (selObj.tagName == "HTML" || selObj.tagName == "HEAD")
      {
        break;
      }
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.setCursorToEndOfBody
//
// DESCRIPTION:
//   This function sets the cursor for the current DOM to the
//   end of the body tag.  This is useful when inserting items
//   at the insertion point which should exist in the body of the document.
//
// ARGUMENTS:
//   dom - DOM object - optional argument which specifies the DOM to check
//
// RETURNS:
//   array of offsets - the new selection
//--------------------------------------------------------------------

function dwscripts_setCursorToEndOfBody(dom)
{
  var retVal = null;

  dom = (dom != null) ? dom : dw.getDocumentDOM();

  if (dom)
  {
    var index = dom.documentElement.outerHTML.search(/(\r\n|\r|\n)\s*<\/body>/i);

    if (index != -1)
    {
      retVal = new Array();
      retVal[0] = index;
      retVal[1] = index;
      dom.setSelection(retVal[0], retVal[1]);
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts_setCursorOutsideParagraph
//
// DESCRIPTION:
//   If the selection is inside of a paragraph tag, then this function
//   moves the cursor to be after the paragraph.  This prevents invalid 
//   HTML when inserting a form, table, or other tags that control the 
//   document flow.
//
//   NOTE: this function does not need to be called when returning
//         text through the objectTag function of an Object. The
//         selection is automatically fixed in this case.
//
// ARGUMENTS:
//   dom - DOM object - optional argument which specifies the DOM to check
//
// RETURNS:
//   array of offsets - the new selection
//--------------------------------------------------------------------

function dwscripts_setCursorOutsideParagraph(dom)
{
  var retVal = null;

  dom = (dom != null) ? dom : dw.getDocumentDOM();

  if (dom)
  {
    selNode = dom.getSelectedNode();

    var pObj = "";
    while (pObj == "" && selNode.parentNode)
    {
      if (selNode.tagName && selNode.tagName == "P")
      {
        pObj = selNode;
      } 
      else 
      {
        selNode = selNode.parentNode;
      }
    }

    if (pObj)
    {
      pOffsets = dom.nodeToOffsets(pObj);
      retVal = new Array();
      retVal[0] = pOffsets[1];
      retVal[1] = pOffsets[1];
      dom.setSelection(retVal[0], retVal[1]);
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.adjustCursorForEmptyTableCell
//
// DESCRIPTION:
//   If "&nbsp;" is manually selected in table cell, then adjust the 
//   insertion point so that it is at the beginning of the table cell
//
// ARGUMENTS: 
//   dom - DOM object - optional argument which specifies the DOM to check
//
// RETURNS:
//   boolean - true if the cursor was adjusted
//--------------------------------------------------------------------

function dwscripts_adjustCursorForEmptyTableCell(dom)
{
  var retVal = false;
  
  dom = (dom != null) ? dom : dw.getDocumentDOM();

  if (dom)
  {
    var offsets = dom.getSelection(true); // gets pairs of offsets if multiple selections
    if( !offsets || offsets.length <= 1 ) {
	  return retVal;
  	}
	var selNode = dom.offsetsToNode(offsets[0],offsets[1]);

    // Previously, innerHTML was "" if only an &nbsp; was in the table cell.
    //   Now, we return "&nbsp;" and not the empty string.
    if (selNode.tagName && 
        (selNode.tagName == "TD" || selNode.tagName == "TH") &&
        selNode.innerHTML == "&nbsp;"
       )
    {
      var nodeOffset = dom.nodeToOffsets(selNode);
      var startOfCellOffset = nodeOffset[0] + selNode.outerHTML.indexOf("&nbsp");

      dom.setSelection(startOfCellOffset,startOfCellOffset);

      retVal = true;
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getNodeOffsets
//
// DESCRIPTION:
//   This function returns the offsets for the given node.  This function
//   should be identical to the dom function "nodeToOffsets", however,
//   it takes into account nodes that might have been translated,
//   which can confuse the original function.
//
// ARGUMENTS:
//   node - DOM node - the node to get the offsets for
//
// RETURNS:
//   2 element array of offset values
//--------------------------------------------------------------------

function dwscripts_getNodeOffsets(node)
{
  var retVal = new Array();
  
  var dom = dw.getDocumentDOM();
  
  if (node && dw.nodeExists(node))
  {  
    if (node.linkedLockOuterHTML)
    {
      retVal = dom.nodeToOffsets(node);
      retVal[1] = retVal[0] + node.linkedLockOuterHTML.length;
    }
    else  // use the standard method
    {
      retVal = dom.nodeToOffsets(node);
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getOuterHTML
//
// DESCRIPTION:
//   This function returns the outer html for the given node.
//   This function handles all node types, and includes the comment
//   markers in the returned string.
//
// ARGUMENTS:
//   node - DOM node - the node to get the outer html for
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_getOuterHTML(node)
{
  retVal = "";
  
  if (node && dw.nodeExists(node))
  {  
    if (node.linkedLockOuterHTML)
    {
      retVal = node.linkedLockOuterHTML;
    }
    else if (node.nodeType == Node.ELEMENT_NODE)
    {
      retVal = node.outerHTML;
    }
    else if (node.nodeType == Node.TEXT_NODE)
    {
      retVal = node.data;
    }
    else if (node.nodeType == Node.COMMENT_NODE)
    {
      // For true comment nodes, we need to add back in the '<!--' and '-->' around
      //   the data. However, PHP directives are currently treated as comment nodes.
      //   So, only add back in the comment delimeters if the data doesn't begin with
      //   a '<', (i.e., it's a php directive).
      if (node.data && node.data.charAt(0) == "<")
      {
        retVal = node.data;
      }
      else
      {
        retVal = "<!--" + node.data + "-->";
      }
    }
   
    // TODO: We should fix the underlying calls to return the correct newlines
    // These calls seem to return the wrong new lines sometimes
    //  The comment node is definitely wrong
    var newLineSetting = dwscripts.getNewline();
    var currNewLine = dwscripts.getNewlineFromString(retVal);

    if (newLineSetting != currNewLine)
    {
      retVal = retVal.replace(new RegExp(dwscripts.escRegExpChars(currNewLine),"ig"), newLineSetting);
    }
 
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getInnerHTML
//
// DESCRIPTION:
//   Returns the innerHTML of the given node.  This function correctly
//   handles locked nodes.
//
// ARGUMENTS:
//   nodeOrString - DOM node or string - the node to get the inner 
//     html for or a string
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_getInnerHTML(nodeOrString)
{
  retVal = "";
  
  var outerHTML = "";
  if (typeof nodeOrString == "string")
  {
    outerHTML = nodeOrString
  }
  else
  {
    outerHTML = dwscripts.getOuterHTML(nodeOrString);
  }

  var callback = new Object();
  callback.tagName = "";
  callback.tagCount = 0;
  callback.innerStart = -1;
  callback.innerEnd = -1;
  // Note: I know the check (this.tagName.toUpperCase() == tag.toUpperCase()) below 
  //   is a little weird. You'd think that by setting this.tagName = tag, we wouldn't
  //   need to make sure the case was the same. Strangely enough, for tags with
  //   namespaces (e.g., MM:If), after assigning this.tagName = tag, this.tagName's
  //   string becomes all lowercase??? No idea why, but that's why we need to make
  //   sure the case is the same.
  callback.openTagBegin = new Function("tag,offset","if (!this.tagName) { this.tagName = tag; } if (this.tagName.toUpperCase() == tag.toUpperCase()) { this.tagCount++; }");
  callback.openTagEnd = new Function("offset","if (this.innerStart == -1) { this.innerStart = offset; }");
  callback.closeTagBegin = new Function("tag,offset","if (this.tagName.toUpperCase() == tag.toUpperCase()) { if (this.tagCount == 1) { this.innerEnd = offset; } this.tagCount--; }");

  dw.scanSourceString(outerHTML, callback);

  if (callback.innerStart >= 0 && callback.innerEnd >= 0)
  {
    retVal = outerHTML.substring(callback.innerStart,callback.innerEnd);
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getInnerHTMLOffsets
//
// DESCRIPTION:
//   Returns the offsets of the innerHTML within the supplied outerHTML.
//
// ARGUMENTS:
//   outerHTML = string
//
// RETURNS:
//   object containing begining/ending offets
//--------------------------------------------------------------------

function dwscripts_getInnerHTMLOffsets(outerHTML)
{
  // Note: This code was copied from the getInnerHTML() function above.
  // That function should really just now call this function. However,
  // in an effort to touch as little as possible, I'm not going to make
  // that change at this time.

  var ret = new Object;
  var callback = new Object();
  callback.tagName = "";
  callback.tagCount = 0;
  callback.innerStart = -1;
  callback.innerEnd = -1;
  // Note: I know the check (this.tagName.toUpperCase() == tag.toUpperCase()) below 
  //   is a little weird. You'd think that by setting this.tagName = tag, we wouldn't
  //   need to make sure the case was the same. Strangely enough, for tags with
  //   namespaces (e.g., MM:If), after assigning this.tagName = tag, this.tagName's
  //   string becomes all lowercase??? No idea why, but that's why we need to make
  //   sure the case is the same.
  callback.openTagBegin = new Function("tag,offset","if (!this.tagName) { this.tagName = tag; } if (this.tagName.toUpperCase() == tag.toUpperCase()) { this.tagCount++; }");
  callback.openTagEnd = new Function("offset","if (this.innerStart == -1) { this.innerStart = offset; }");
  callback.closeTagBegin = new Function("tag,offset","if (this.tagName.toUpperCase() == tag.toUpperCase()) { if (this.tagCount == 1) { this.innerEnd = offset; } this.tagCount--; }");

  dw.scanSourceString(outerHTML, callback);

  ret.innerStart = callback.innerStart;
  ret.innerEnd = callback.innerEnd;
  
  return ret;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getTagName
//
// DESCRIPTION:
//   Returns the tagName of the given node.  This function correctly
//   handles locked nodes.
//
// ARGUMENTS:
//   nodeOrString - DOM node or string - the node to get the tag
//     name of, or a string to extract the tag name from
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function dwscripts_getTagName(nodeOrString)
{
  retVal = "";
  
  if (typeof nodeOrString == "string" ||
      (nodeOrString.tagName && nodeOrString.tagName == "MM:BEGINLOCK"))
  {
    var outerHTML = "";
    if (typeof nodeOrString == "string")
    {
      outerHTML = nodeOrString;
    }
    else
    {
      outerHTML = dwscripts.getOuterHTML(nodeOrString);
    }
    
    var callback = new Object();
    callback.tagName = "";
    callback.openTagBegin = new Function("tag,offset","if (!this.tagName) { this.tagName = tag; }");
    
    dw.scanSourceString(outerHTML, callback);
    
    retVal = callback.tagName;
  }
  else
  {
    retVal = nodeOrString.tagName;
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.displayNode
//
// DESCRIPTION:
//   Toggles the attribute style="display:none" to either show or hide
// 	 the given node
//
// ARGUMENTS:
//   node - DOM node - the node to get the tag to set
//   display - boolean - whether to show this node or not
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function dwscripts_displayNode(node, display)
{
	if( !node ) {
		return;
	}

	if( display ) {
		node.style = node.style.replace(/\w*display:none;?/gi, "");
	} 
	else if( node.style == "" ) {
		 node.style = "display:none";
	} 
	else if( !node.style.match(/display:none/gi) ) {
		node.style = node.style + " display:none;";
	}
}



//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getTempURLForDesignNotes
//
// DESCRIPTION:
//   If the user's document hasn't been saved, we can't use design notes to
//   store meta-information with that file.  Instead, we'll create a 
//   temporary design notes file and store the meta-information there.
//   When the user's document is saved, we'll call 
//   copyDesignNotesFromTempURL (below) to move the info from the temp 
//   file to the document's permanent design notes file.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - a file name to be used as a temporary storage point for
//     design notes associated with an unsaved file
//--------------------------------------------------------------------

function dwscripts_getTempURLForDesignNotes()
{
  var dom = dw.getDocumentDOM();
  var notes, keys;
  
  // check if we have already created a temp file
  if (String(dom.tempURL) == "undefined")
  {
    // Assign a temporary notes file that doesn't conflict with others
    dwscripts.TEMP_FILE_URL_COUNT += 1;
    dom.tempURL = document.URL + String(dwscripts.TEMP_FILE_URL_COUNT);

    // Remove any old notes lying around in that file
    notes = MMNotes.open(dom.tempURL, true);
    if (notes)
    {
      keys = MMNotes.getKeys(notes);
      for (var i=0; i < keys.length; i++)
      {
        MMNotes.remove(notes, keys[i]);
      }
      MMNotes.close(notes);
    }
    else
    {
      // We failed to create the design note, so return ""
      dom.tempURL = "";
    }
  }

  return dom.tempURL;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.copyDesignNotesFromTempURL
//
// DESCRIPTION:
//   This function is called when we detect that the user's document has
//   been saved.  Move the contents of the file's temporary design notes
//   file into its new, permanent design notes file.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function dwscripts_copyDesignNotesFromTempURL()
{
  var dom, tempURL, oldNotes, newNotes, oldKeys, oldValue;

  // Get the location of the temporary design notes file, if there is one
  dom = dw.getDocumentDOM();
  tempURL = String(dom.tempURL);

  // if a temp url was previously assigned
  if (tempURL != "undefined" && tempURL.length)
  {
    oldNotes = MMNotes.open(tempURL, true);
    newNotes = MMNotes.open(dom.URL);
    if (oldNotes != 0 && newNotes != 0)
    {
      oldKeys = MMNotes.getKeys(oldNotes);
      for (var i=0; i < oldKeys.length; i++)
      {
        oldValue = MMNotes.get(oldNotes, oldKeys[i]);
        MMNotes.remove(oldNotes, oldKeys[i]);
        MMNotes.set(newNotes, oldKeys[i], oldValue);
      }
    }

    if (oldNotes != 0)
    {
      MMNotes.close(oldNotes);
    }
    if (newNotes != 0)
    {
      MMNotes.close(newNotes);
    }

    // Delete records of the temp file, so we don't do this again
    dom.tempURL = "";
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.addListValueToNote
//
// DESCRIPTION:
//   Adds the given value to a list within a design note.
//
// ARGUMENTS:
//   noteURL - the design note to add the value to
//   listPrefix - the prefix for the list of items
//   value - the value to add to the list
//   dontCheckValidVarNames - boolean - true to ignore the check
//    for valid variable names
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function dwscripts_addListValueToNote(noteURL, listPrefix, value, dontCheckValidVarName)
{
  var retVal = false;
  
  if (noteURL.length && listPrefix.length)
  {
    // Make sure the variable names begin with "MM_"
    if (listPrefix.length < 3 || listPrefix.substr(0, 3) != "MM_")
    {
      listPrefix = "MM_" + listPrefix;
    }

    var countVar = listPrefix + "_Count";

    var noteHandle = MMNotes.open(noteURL, true);

    if (noteHandle) 
    {
      var count = MMNotes.get(noteHandle, countVar);
      if (parseInt(count) != count)
      {
        count = 0;  
      }
      count = parseInt(count);

      var bFound = false;
      for (var i=1; i <= count; i++)
      {
        var reqvalue = MMNotes.get(noteHandle, listPrefix+i);  
        if (reqvalue == value)
        {
          bFound = true;  
          break;
        }
      }
    
      if (!bFound)
      {
        if (dontCheckValidVarName || dwscripts.isValidVarName(value))
        {
          count++;
          MMNotes.set(noteHandle, listPrefix+count, value); 
          MMNotes.set(noteHandle, countVar, count);
          retVal = true;
        } 
        else 
        {
         alert(value + " " + MM.MSG_InvalidParamName);
        }
      } 
      else 
      {
        alert(dwscripts.sprintf(MM.MSG_ParamNameAlreadyExists, value));
      }
      MMNotes.close(noteHandle);
    }
    
    // Clear the cache (see code in getListValuesFromNote)
    MMNotes["cache|" + noteURL + "|" + listPrefix] = null;
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.deleteListValueFromNote
//
// DESCRIPTION:
//   removes the given value from a list within a design note.
//
// ARGUMENTS:
//   noteURL - the design note to remove the value from
//   listPrefix - the prefix for the list of items
//   value - the value to remove from the list
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function dwscripts_deleteListValueFromNote(noteURL, listPrefix, value)
{
  if (noteURL.length && listPrefix.length)
  {
    // Make sure the variable names begin with "MM_"
    if (listPrefix.length < 3 || listPrefix.substr(0, 3) != "MM_")
    {
      listPrefix = "MM_" + listPrefix;
    }

    var countVar = listPrefix + "_Count";

    var noteHandle = MMNotes.open(noteURL, true);

    if (noteHandle) 
    {
      var count = MMNotes.get(noteHandle, countVar);
      count = parseInt(count);

      // remove all the values
      var tempArray = new Array();
      for (var i=1; i <= count; i++)
      {
        tempArray[i-1] = MMNotes.get(noteHandle, listPrefix+i);
      }
      MMNotes.remove(noteHandle, listPrefix+count);

      // add back the values which do not match the given value
      count=0;
      for (var i=0; i < tempArray.length ;i++)
      {
        if (tempArray[i] != value)
        {
          count++;
          MMNotes.set(noteHandle, listPrefix+count, tempArray[i]);
        }
      }
      MMNotes.set(noteHandle, countVar, count); 
      MMNotes.close(noteHandle);
    } 
    
    // Clear the cache (see code in getListValuesFromNote)
    MMNotes["cache|" + noteURL + "|" + listPrefix] = null;
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getListValuesFromNote
//
// DESCRIPTION:
//   gets an array of values from within a design note.
//
//   NOTE:
//    Once we've gotten the array of values from disk once,
//    we store them as a property of the MMNotes object.
//    That way, we don't hit the disk every time that this
//    function is called.
// 
// ARGUMENTS:
//   noteURL - the design note to get the values from
//   listPrefix - the prefix for the list of items
//
// RETURNS:
//   Array of strings - the values for the given name prefix
//--------------------------------------------------------------------

function dwscripts_getListValuesFromNote(noteURL, listPrefix)
{
  var retVal = new Array();

  if (noteURL.length && listPrefix.length)
  {
    // Make sure the variable names begin with "MM_"
    if (listPrefix.length < 3 || listPrefix.substr(0, 3) != "MM_")
    {
      listPrefix = "MM_" + listPrefix;
    }

    var countVar = listPrefix + "_Count";

    // If we've stored a cached array, copy cached values into retVal
    var cacheKey = "cache|" + noteURL + "|" + listPrefix;
    
    var cachedArray = MMNotes[cacheKey];
    if (cachedArray != null)
    {
      count = cachedArray.length;
      for (var i=0; i < count; i++)
      {
        retVal[i] = cachedArray[i];
      }
    }
    else
    {
      var noteHandle = MMNotes.open(noteURL, true);

      if (noteHandle)
      {
        var count = MMNotes.get(noteHandle, countVar);
        if (parseInt(count) != count)
        {
          count=0;  
        }
        count = parseInt(count);

        for (var i=1; i <= count; i++) 
        {
          var reqvalue = MMNotes.get(noteHandle, listPrefix+i);  
          retVal[i-1] = reqvalue;
        }
        MMNotes.close(noteHandle);
      }

      // Cache this array for next time
      MMNotes[cacheKey] = retVal;
    }

  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.isDotNetCompilerAvailable
//
// DESCRIPTION:
//   detects whether the Microsoft CSharp compiler is available on the current machine
// 
// ARGUMENTS:
//   none 
//
// RETURNS:
//   Boolean - true if .NET compiler is available. False otherwise. 
//--------------------------------------------------------------------

function dwscripts_isDotNetCompilerAvailable()
{
	// If we're calling from the Mac, return false since the .NET SDK is not available on the Mac platform 
	if(!dwscripts.IS_WIN)
	{
		return false;
	}
	
	// Get the the registry vale for the 'sdkInstallRoot' key 
	var anSDKLocation = MM.regGetValue("HKEY_LOCAL_MACHINE", "SOFTWARE\\Microsoft\\.NETFramework", "InstallRoot");
 
    // If this key wasn't found, then return false 
	if(!anSDKLocation || !anSDKLocation.length)
	{
		return false;
	}
	
	if (!DWfile.exists(anSDKLocation))
	{
	  return false; 
	}
	
	var aFolderItemsArray = DWfile.listFolder(anSDKLocation, "directories"); 
	
	if (!aFolderItemsArray || !aFolderItemsArray.length || aFolderItemsArray.length == 0)
	{
	  return false; 
	}
	
	if (aFolderItemsArray[0].substring(0,1).toLowerCase() != "v")
	{
	  return false
	}

	var aCompilerPath = anSDKLocation + aFolderItemsArray[0] + "\\"; 

	if(!MM.createProcess(aCompilerPath + "\csc.exe",	// application
			"",
			"-1",							// timeout
			true))							// bCreateNoWindow
	{
		return false;
	}
	
	return true;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getDotNetCompilerFolder
//
// DESCRIPTION:
//   gets the folder path for the Dot Net compiler by examining a key in the registry 
//   and then determining the current version number by examining a subfolder
// 
// ARGUMENTS:
//   none 
//
// RETURNS:
//   String - .NET Compiler path (i.e., C:\WINDOWS\Microsoft.NET\Framework\v1.0.3705) 
//--------------------------------------------------------------------

function dwscripts_getDotNetCompilerFolder()
{
	// If we're calling from the Mac, return false since the .NET SDK is not available on the Mac platform 
	if(!dwscripts.IS_WIN)
	{
		return false;
	}
	
	// Get the the registry vale for the 'sdkInstallRoot' key 
	var anSDKLocation = MM.regGetValue("HKEY_LOCAL_MACHINE", "SOFTWARE\\Microsoft\\.NETFramework", "InstallRoot");
 
    // If this key wasn't found, then return false 
	if(!anSDKLocation || !anSDKLocation.length)
	{
		return false;
	}
	
	if (!DWfile.exists(anSDKLocation))
	{
	  return false; 
	}
	
	var aFolderItemsArray = DWfile.listFolder(anSDKLocation, "directories"); 
	
	if (!aFolderItemsArray || !aFolderItemsArray.length || aFolderItemsArray.length == 0)
	{
	  return false; 
	}
	
	if (aFolderItemsArray[0].substring(0,1).toLowerCase() != "v")
	{
	  return false
	}

	var aCompilerPath = anSDKLocation + aFolderItemsArray[0] + "\\"; 

	if(!MM.createProcess(aCompilerPath + "\csc.exe",	// application
			"",
			"-1",							// timeout
			true))							// bCreateNoWindow
	{
		return false;
	}
	
	return aCompilerPath;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getDotNetCompilerPathCSharp
//
// DESCRIPTION:
//   returns a path to the local machines CSharp Compiler 
//   such as C:\WINDOWS\Microsoft.NET\Framework\v1.0.3705\csc.exe
// 
// ARGUMENTS:
//   none 
//
// RETURNS:
//   String - returns the path to the Dot Net Compiler folder 
//--------------------------------------------------------------------

function dwscripts_getDotNetCompilerPathCSharp()
{
	var aCompilerRootPath = dwscripts.getDotNetCompilerFolder(); 
	
	if (!aCompilerRootPath || !aCompilerRootPath.length) 
	{
	  return false; 
	}
	
	var aCSharpCompilerPath = aCompilerRootPath + "\\csc.exe"; 

	if(!MM.createProcess(aCSharpCompilerPath,	// application
			"",
			"-1",							// timeout
			true))							// bCreateNoWindow
	{
		return false;
	}
	
	return aCSharpCompilerPath;
}




//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getDotNetCompilerPathVB
//
// DESCRIPTION:
//   returns a path to the local machines CSharp Compiler 
//   such as C:\WINDOWS\Microsoft.NET\Framework\v1.0.3705\vbc.exe
// 
// ARGUMENTS:
//   none 
//
// RETURNS:
//   String - returns the path to the Dot Net Compiler folder 
//--------------------------------------------------------------------

function dwscripts_getDotNetCompilerPathVB()
{
	var aCompilerRootPath = dwscripts.getDotNetCompilerFolder(); 
	
	if (!aCompilerRootPath || !aCompilerRootPath.length) 
	{
	  return false; 
	}
	
	var aVBCompilerPath = aCompilerRootPath + "\\vbc.exe"; 

	if(!MM.createProcess(aVBCompilerPath,	// application
			"",
			"-1",							// timeout
			true))							// bCreateNoWindow
	{
		return false;
	}
	
	return aVBCompilerPath;
}

//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.removeInvalidVBCompilerFlags
//
// DESCRIPTION:
//   Removes invalid VB.NET compiler switches that might surface 
//   when a user switches their server from ASP.NET C# to VB.NET 
//
// ARGUMENTS:
//   text - a string 
//
// RETURNS:
//   text
//--------------------------------------------------------------------

function dwscripts_removeInvalidVBCompilerFlags(text)
{  
  if (text && text.length & text != "")
  {
    text = text.replace(/\/doc/gi, ""); 
    text = text.replace(/\/incremental/gi, "");     
    text = text.replace(/\/w:[0-9]/gi, "");     
    text = text.replace(/\/warning:[0-9]/gi, "");     
    text = text.replace(/\/warn:[0-9]/gi, "");     
  }
  
  return text; 
}

//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts_isXSLTDoc
//
// DESCRIPTION:
//		checks if the given document is an xsl doc
// 
// ARGUMENTS:
//   aDoc 
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function dwscripts_isXSLTDoc(aDoc)
{
  var currDoc = aDoc;
	var bIsXSLTDoc = false;
	if (currDoc == null)
	{
	  //get the current document
	  currDoc = dw.getDocumentDOM();
	}
	if (currDoc != null)
	{
		var currDocType = currDoc.documentType;
		if (currDocType == "XSLT" || currDocType == "XSLT-fragment")
		{
			bIsXSLTDoc = true;
		}
	}
	return bIsXSLTDoc;
}

