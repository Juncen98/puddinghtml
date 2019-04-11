// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------

var helpDoc = MM.HELP_newTagLibrary;

//---------------     API FUNCTIONS    ---------------

function importTags()
{
  var dom = dw.tagLibrary.getTagLibraryDOM("TagLibraries.vtm");
  var libraryTagArray = dom.getElementsByTagName("taglibrary");
  var libraryName = document.theForm.library.value;
  var i, tagStr;

  // Make sure user supplied a valid name
  if (libraryName.length == 0)
  {
    alert(MM.MSG_missingTagLibraryName);
    return false;
  }
  if (libraryName.match("[A-Za-z0-9 _\-]*") != libraryName)
  {
    alert(MM.MSG_legalTagLibraryName);
    return false;
  }

  // Check to see if the name is too long for the MacOS file system
  if (libraryName.length > 30)
  {
    alert(MM.MSG_libraryNameTooLong);
    return false;
  }

  // Look to see if this taglibrary already exists.  If it does,
  // do nothing.
  for (i = 0; i < libraryTagArray.length; i++)
    if (libraryTagArray[i].name == libraryName)
    {
      alert(errMsg(MM.MSG_tagLibraryAlreadyExists, libraryName));
      return true;
    }

  // Construct the taglibrary tag
  tagStr = "<taglibrary name=\"";
  tagStr += libraryName;
  tagStr += "\" doctypes=\"HTML\" id=\"DWTagLibrary_";
  tagStr += libraryName.replace(/\s/g, "_");
  tagStr += "\"></taglibrary>";

  // Insert the new tag just before the </taglibraries>
  libraryTagArray = dom.getElementsByTagName("taglibraries");
  if (libraryTagArray.length > 0)
    libraryTagArray[0].innerHTML = libraryTagArray[0].innerHTML + tagStr;

  return true;
}

//---------------    LOCAL FUNCTIONS   ---------------

function initializeUI()
{
}
