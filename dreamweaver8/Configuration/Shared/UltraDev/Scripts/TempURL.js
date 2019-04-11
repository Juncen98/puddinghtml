//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//*************************************************************
//*************************************************************
//
// DO NOT USE THESE FUNCTIONS
//
//   Please use the newer versions which live in:
//     Configuration/Shared/Common/Scripts/dwscripts.js
//
//*************************************************************
//*************************************************************




var GET_TEMP_FILE_URL_COUNT = 0;



////////////////////////////////////////////////////////////////////////////////
//
// Function: getTempFileURL
//
// If the user's document hasn't been saved, we can't use design notes to
// store meta-information with that file.  Instead, we'll create a 
// temporary design notes file and store the meta-information there.
// When the user's document is saved, we'll call copyFromTempURL (below)
// to move the info from the temp file to the document's permanent design
// notes file.
//
////////////////////////////////////////////////////////////////////////////////
function getTempFileURL()
{
  var dom = dw.getDocumentDOM();
  var notes, keys, i;
  
  if (String(dom.tempURL) == "undefined")
  {
    // Assign a temporary notes file that doesn't conflict with others
    GET_TEMP_FILE_URL_COUNT += 1;
    dom.tempURL = document.URL + String(GET_TEMP_FILE_URL_COUNT);

    // Remove any old notes lying around in that file
    notes = MMNotes.open(dom.tempURL, true);
    keys = MMNotes.getKeys(notes);
    for (i = 0; i < keys.length; i++)
      MMNotes.remove(notes, keys[i]);
    MMNotes.close(notes);
  }

  return dom.tempURL;
}



////////////////////////////////////////////////////////////////////////////////
//
// Function: copyFromTempURL
//
// This function is called when we detect that the user's document has
// been saved.  Move the contents of the file's temporary design notes
// file into its new, permanent design notes file.
//
////////////////////////////////////////////////////////////////////////////////
function copyFromTempURL()
{
  var dom, tempURL, oldNotes, newNotes, oldKeys, i, oldValue;

  // Get the location of the temporary design notes file, if there is one
  dom = dw.getDocumentDOM();
  tempURL = String(dom.tempURL);

  if (tempURL != "undefined" && tempURL.length)
  {
    oldNotes = MMNotes.open(tempURL, true);
    newNotes = MMNotes.open(dom.URL);
    if (oldNotes != 0 && newNotes != 0)
    {
      oldKeys = MMNotes.getKeys(oldNotes);
      for (i = 0; i < oldKeys.length; i++)
      {
        oldValue = MMNotes.get(oldNotes, oldKeys[i]);
        MMNotes.remove(oldNotes, oldKeys[i]);
        MMNotes.set(newNotes, oldKeys[i], oldValue);
      }
    }

    if (oldNotes != 0)
      MMNotes.close(oldNotes);
    if (newNotes != 0)
      MMNotes.close(newNotes);

    // Delete records of the temp file, so we don't do this again
    dom.tempURL = "";
  }
}
