// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------

var helpDoc = MM.HELP_newAttributes;

//---------------     API FUNCTIONS    ---------------

function canImportTags()
{
  var dom = dw.tagLibrary.getTagLibraryDOM("TagLibraries.vtm");
  var libraryTags = dom.getElementsByTagName("taglibrary");
  var refTags = dom.getElementsByTagName("tagref");

  if (libraryTags.length == 0)
  {
    alert(MM.MSG_tagLibraryBeforeAttribute);
    return false;
  }

  if (refTags.length == 0)
  {
    alert(MM.MSG_tagBeforeAttribute);
    return false;
  }

  return true;
}

function importTags()
{
  var dom = dw.tagLibrary.getTagLibraryDOM("TagLibraries.vtm");
  var libraryIndex = document.theForm.library.selectedIndex 
  var libraryName = document.theForm.library.options[libraryIndex].value;
  var tagIndex = document.theForm.tag.selectedIndex 
  var tagName;
  var attrsToAddStr;
  
  if (tagIndex == -1)
  {
    alert(MM.MSG_noTagSpecified);
    return false;
  }

  tagName = document.theForm.tag.options[tagIndex].value;

  // Get the <taglibrary> node in the TagLibraries.vtm file that corresponds
  // to the selected library.
  libraryTagArray = dom.getElementsByTagName("taglibrary");
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

  // Get the <tagref> node in that corresponds to the selected tag
  refTagArray = libraryTag.getElementsByTagName("tagref");
  refTag = null;
  for (i = 0; i < refTagArray.length; i++)
  {
    if (refTagArray[i].name == tagName)
    {
      refTag = refTagArray[i];
      break;
    }
  }

  // A <tagref> node should always be found.  If it's missing, bail.
  if (refTag == null)
    return false;

  // Open the tag's VTML document
  dom = dw.tagLibrary.getTagLibraryDOM(refTag.file);
  if (!dom)
    return false;

  // Get the <attributes> tag (there should be exactly one)
  attributesTags = dom.getElementsByTagName("attributes");
  if (attributesTags.length < 1)
    return false;
  attributesTag = attributesTags[0];

  // Get all the existing attrib tags
  attribTags = attributesTag.getElementsByTagName("attrib");

  // Iterate through the comma-separated list of attrs that the user supplied.
  // Make sure all the names are valid.
  attrNameList = document.theForm.attrs.value;
  attrNameArray = attrNameList.split(/\s*,\s*/);
  if (attrNameArray.length == 0 ||
      (attrNameArray.length == 1 && attrNameArray[0].length == 0))
  {
    alert(MM.MSG_missingAttributeName);
    return false;
  }
  for (i = 0; i < attrNameArray.length; i++)
  {
    attrName = attrNameArray[i];
    if (attrName.match("[:.\\-\\w]*") != attrName)
    {
      alert(MM.MSG_legalAttributeName);
      return false;
    }
  }

  // Now add the attributes to the tag database
  attrsToAddStr = "";
  for (i = 0; i < attrNameArray.length; i++)
  {
    attrName = attrNameArray[i];
    attrNameLower = attrName.toLowerCase();
    if (attrName.length == 0)
      continue;

    // If the attr already exists, don't overwrite it
    attrAlreadyExists = false;
    for (j = 0; j < attribTags.length; j++)
    {
      if (attribTags[j].name.toLowerCase() == attrNameLower)
      {
        attrAlreadyExists = true;
        break;
      }
    }
    if (attrAlreadyExists)
    {
      alert(errMsg(MM.MSG_attributeAlreadyExists, attrName));
      continue;
    }

    // If the attr is listed twice in the array, add it only once
    for (j = 0; j < i; j++)
    {
      if (attrNameArray[i].toLowerCase() == attrNameArray[j].toLowerCase())
      {
        attrAlreadyExists = true;
        break;
      }
    }
    if (attrAlreadyExists)
      continue;

    // Add the new attribute to the end of the list
    attrsToAddStr += "<attrib name=\"" + attrName + "\"/>";
  }

  attributesTag.innerHTML = attributesTag.innerHTML + attrsToAddStr;

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
  document.theForm.attrs.focus();

  initializeTags();
}



function initializeTags()
{
  var dom = dw.tagLibrary.getTagLibraryDOM("TagLibraries.vtm");
  var libraryTags = dom.getElementsByTagName("taglibrary");
  var libraryIndex = document.theForm.library.selectedIndex 
  var libraryName = document.theForm.library.options[libraryIndex].value;
  var optionArr = new Array();
  var i, refTags, tagName, tagNames;

  // Get the taglibrary tag matching the current selection
  libraryTag = null;
  for (i = 0; i < libraryTags.length; i++)
  {
    if (libraryTags[i].name == libraryName)
    {
      libraryTag = libraryTags[i];
      break;
    }
  }

  // Should always be found.  If not, bail.
  if (libraryTag == null)
    return;

  // Get all the tag names and sort them
  refTags = libraryTag.getElementsByTagName("tagref");
  tagNames = new Array();
  for (i = 0; i < refTags.length; i++)
    tagNames[i] = refTags[i].name;
  tagNames.sort();

  // Populate the drop-down menu with all the <tagref> tags found
  // in the tagLibary tag.
  selTag = dw.tagLibrary.getSelectedTag().toLowerCase();
  for (i = 0; i < tagNames.length; i++)
  {
    tagName = tagNames[i];

    optionArr.push("<option value=\"");
    optionArr.push(tagName);
    optionArr.push("\"");

    if (selTag == tagName.toLowerCase())
      optionArr.push(" selected");

    optionArr.push(">");
    optionArr.push(tagName);
    optionArr.push("</option>");
  }

  document.theForm.tag.innerHTML = optionArr.join("");
}

