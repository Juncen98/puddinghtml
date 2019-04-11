// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------

var helpDoc = MM.HELP_newTags;

//---------------     API FUNCTIONS    ---------------

function canImportTags()
{
  var dom = dw.tagLibrary.getTagLibraryDOM("TagLibraries.vtm");
  var libraryTags = dom.getElementsByTagName("taglibrary");

  if (libraryTags.length == 0)
  {
    alert(MM.MSG_tagLibraryBeforeTag);
    return false;
  }

  return true;
}

function importTags()
{
  var libraryIndex = document.theForm.library.selectedIndex 
  var libraryName = document.theForm.library.options[libraryIndex].value;
  var tagNameList = document.theForm.tagNames.value;
  var endTag = document.theForm.endtag.checked;
  var tagNameArray = tagNameList.split(/\s*,\s*/);
  var dom = dw.tagLibrary.getTagLibraryDOM("TagLibraries.vtm");
  var libraryTagArray = dom.getElementsByTagName("taglibrary");
  var tagsInLibrary;
  var libraryTag;
  var tagAlreadyExists;
  var tagPath, tagName, tagNameLower, tagFile, tagStr, tagsToAddStr;
  var i, j;
  var tagDom;

  // Get the <taglibrary> node in the TagLibraries.vtm file that corresponds
  // to the selected library.
  libraryTag = null;
  for (i = 0; i < libraryTagArray.length; i++)
  {
    if (libraryTagArray[i].name == libraryName)
    {
      libraryTag = libraryTagArray[i];
      break;
    }
  }

  // A <taglibrary> node should always be found.  If it's missing, bail.
  if (libraryTag == null)
    return false;

  // Get all the <tagref> nodes in the selected library
  tagsInLibrary = libraryTag.getElementsByTagName("tagref");

  // Using the first <tagref> node as an example, construct a path to
  // the directory that will contain the new tags' VTML files.  If this
  // library doesn't have any tags yet, construct a path using the library
  // name.
  if (tagsInLibrary.length > 0)
  {
    tagPath = tagsInLibrary[0].file;
    indexSlash = tagPath.lastIndexOf("/");
    tagPath = tagPath.substr(0, indexSlash + 1);
  }
  else
  {
    tagPath = libraryName.toLowerCase();
    tagPath += "/";
  }
 
  // Iterate through the comma-separated list of attrs that the user supplied.
  // Make sure all the names are valid.
  if (tagNameArray.length == 0 ||
      (tagNameArray.length == 1 && tagNameArray[0].length == 0))
  {
    alert(MM.MSG_missingTagName);
    return false;
  }
  for (i = 0; i < tagNameArray.length; i++)
  {
    tagName = tagNameArray[i];
    if (tagName.match("[:.\\-\\w]*") != tagName)
    {
      alert(MM.MSG_legalTagName);
      return false;
    }
  }

  // Now add the tags to the tag database
  tagsToAddStr = "";
  for (i = 0; i < tagNameArray.length; i++)
  {
    tagName = tagNameArray[i];
    tagNameLower = tagName.toLowerCase();
    if (tagName.length == 0)
      continue;

    // If the tag already exists, don't overwrite it
    tagAlreadyExists = false;
    for (j = 0; j < tagsInLibrary.length; j++)
    {
      if (tagsInLibrary[j].name.toLowerCase() == tagNameLower)
      {
        tagAlreadyExists = true;
        break;
      }
    }
    if (tagAlreadyExists)
    {
      alert(errMsg(MM.MSG_tagAlreadyExists, tagName));
      continue;
    }

    // If the tag is listed twice in the array, add it only once
    for (j = 0; j < i; j++)
    {
      if (tagNameArray[i].toLowerCase() == tagNameArray[j].toLowerCase())
      {
        tagAlreadyExists = true;
        break;
      }
    }
    if (tagAlreadyExists)
      continue;

    // Check to see if the tag's name is too long for the MacOS file system
    if (tagName.length > 27)
    {
      alert(MM.MSG_tagNameTooLong);
      continue;
    }

    // Build an empty VTML file for the new tag
    tagStr = "<tag name=\"";
    tagStr += tagName;
    tagStr += "\"";
    if (endTag)
      tagStr += " endtag=\"yes\" tagtype=\"nonempty\"";
    else
      tagStr += " endtag=\"no\" tagtype=\"empty\"";

    tagStr += ">\n  <attributes>\n  </attributes>\n</tag>";

    // Save the gchanges to the VTML file
    tagFile = tagPath + tagName + ".vtm";
    tagDom = dw.tagLibrary.getTagLibraryDOM(tagFile);
    tagDom.documentElement.outerHTML = tagStr;

    // This triggers the source formatting code to run
    rootTags = tagDom.getElementsByTagName("tag");
    rootTags[0].innerHTML = rootTags[0].innerHTML + "";

    // Build the <tagref> tag for the new tag
    tagsToAddStr += "<tagref name=\"";
    tagsToAddStr += tagName;
    tagsToAddStr += "\" file=\"";
    tagsToAddStr += tagFile;
    tagsToAddStr += "\"/>\n";
  }

  // Add all the tagrefs to the TagLibraries.vtm file
  libraryTag.innerHTML = libraryTag.innerHTML + tagsToAddStr;

  return true;
}

//---------------    LOCAL FUNCTIONS   ---------------

function initializeUI()
{
  var dom = dw.tagLibrary.getTagLibraryDOM("TagLibraries.vtm");
  var libraryTags = dom.getElementsByTagName("taglibrary");
  var optionArr = new Array();
  var selLibrary = dw.tagLibrary.getSelectedLibrary();
  var i;

  // Populate the drop-down menu with all the <taglibrary> tags found
  // in TagLibraries.vtm.  
  for (i = 0; i < libraryTags.length; i++)
  {
    libraryName = libraryTags[i].name;

    optionArr.push("<option value=\"");
    optionArr.push(libraryName);
    optionArr.push("\"");

    // If a library is currently selected in the Tag Library Editor, then
    // select it in this list
    if (selLibrary == libraryName)
      optionArr.push(" selected");

    optionArr.push(">");
    optionArr.push(libraryName);
    optionArr.push("</option>");
  }

  document.theForm.library.innerHTML = optionArr.join("");
  document.theForm.library.focus();
}
