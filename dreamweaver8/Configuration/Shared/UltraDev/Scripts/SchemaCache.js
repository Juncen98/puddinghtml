//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.



////////////////////////////////////////////////////////////////////////////////
// Function: getCachedSchemaInfo(fileURL,key)
////////////////////////////////////////////////////////////////////////////////
function getCachedSchemaInfo(fileURL,key)
{
	var notes, keys,i;
	var CachedString=null;

    // Make sure the fileURL is valid
	if (!fileURL || !fileURL.length)
        return null;

    // Make sure the key has the UltraDev prefix
    if (key.length < 3 || key.substr(0, 3) != "UD_")
        key = "UD_" + key;

    // If the design note values are not cached in memory, read them from disk
    notesCache = dw.getDocumentDOM().MM_notesCache;
    if (!notesCache || !notesCache.fileURL || notesCache.fileURL != fileURL)
    {
        notesCache = new Object();
        dw.getDocumentDOM().MM_notesCache = notesCache;
        notesCache.fileURL = fileURL;

        // Open the design notes file
	    notes = MMNotes.open(fileURL, true);
        if (notes == 0)
            return null;

        // Copy all the UltraDev design notes to the notesCache object
	    keys = MMNotes.getKeys(notes);
	    for (i = 0; i < keys.length; i++)
	    {
		    if (keys[i].substr(0, 3) == "UD_")
                notesCache[keys[i]] = MMNotes.get(notes, keys[i]);
        }

        MMNotes.close(notes);
    }

    // Get the design note value that's cached in memory
    CachedString = notesCache[key];
    return (CachedString && CachedString.length) ? CachedString : null;
}



////////////////////////////////////////////////////////////////////////////////
// Function: getCachedSchemaKeyInfo(key)
////////////////////////////////////////////////////////////////////////////////
function getCachedSchemaKeyInfo(key)
{
    return getCachedSchemaInfo(getCacheURL(), key)
}



////////////////////////////////////////////////////////////////////////////////
// Function: removeCachedSchemaInfo(fileURL,key)
////////////////////////////////////////////////////////////////////////////////
function removeCachedSchemaInfo(key)
{
    if (key.length < 3 || key.substr(0, 3) != "UD_") {
      key = "UD_" + key;
    }

	var fileURL = getCacheURL();
	if (fileURL && fileURL.length)
	{
		var notes;
		notes = MMNotes.open(fileURL);
		if (notes != 0)
		{
		  MMNotes.remove(notes,key);
		  MMNotes.close(notes);
		}
	}

    // Next time we do a get, re-read the Design Notes file
    dw.getDocumentDOM().MM_notesCache = null;
}



////////////////////////////////////////////////////////////////////////////////
// Function: writeCachedStringForKey
// This function writes the Cached String for particular key.
////////////////////////////////////////////////////////////////////////////////
function writeCachedString(fileURL,key,value)
{
    if (key.length < 3 || key.substr(0, 3) != "UD_") {
      key = "UD_" + key;
    }

	var notes;

	if (fileURL.length)
	{
		notes = MMNotes.open(fileURL, true);
        	//make sure we actually opened the file
		if( notes > 0 )
		{
			MMNotes.set(notes, key, value);
			MMNotes.close(notes);
		}
	}

    if (notes != 0)
      MMNotes.close(notes);

    // Next time we do a get, re-read the Design Notes file
    dw.getDocumentDOM().MM_notesCache = null;
}



////////////////////////////////////////////////////////////////////////////////
// Function: getCacheURL
// Returns the URL of the document if saved or ...(what about unsaved document).
////////////////////////////////////////////////////////////////////////////////
function getCacheURL()
{
	var fileURL = null;
	var dom = dw.getDocumentDOM();

	if (dom) 
	{
		fileURL = dom.URL;
	}

	if (fileURL && !fileURL.length)
	{
    	fileURL = dwscripts.getTempURLForDesignNotes();
	}

	return fileURL;
}



////////////////////////////////////////////////////////////////////////////////
//
//	Function: getColumnAndTypeArray
//
//	get the list of Columns and Type of particular data source.
////////////////////////////////////////////////////////////////////////////////
function getCachedColumnAndTypeArray(key)
{
    var i, elt, index;

    // If the cache is not valid, return an empty array
	if (!MMDB.supportsCache() || MMDB.refreshCache())
        return new Array();

    // Get the name/datatype string out of the cache
	var CachedString = getCachedSchemaInfo(getCacheURL(),key);
    if (!CachedString || !CachedString.length)
        return new Array();

    // If the string is an error message, just return it
    if (CachedString.substr(0, 8) == "MM_ERROR")
        return new Array();

    // Split the string into an array
    var CachedArray = dreamweaver.getTokens(CachedString, ",;");

    // Remove the "name" and "datatype" labels from the array
    for (i = 0; i < CachedArray.length; i++)
    {
        elt = CachedArray[i];
        index = elt.indexOf(":");
        if (index != -1)
            CachedArray[i] = elt.substr(index+1);
    }

	return CachedArray;
}



////////////////////////////////////////////////////////////////////////////////
//
//	Function: SaveColumnAndTypeArrayForCache
//
//	Deletes a dynamic source from the document.
////////////////////////////////////////////////////////////////////////////////
function SaveColumnAndTypeArrayForCache(key,ColumnsAndTypeArray)
{
    if (key.length < 3 || key.substr(0, 3) != "UD_") {
      key = "UD_" + key;
    }

	fileURL = getCacheURL();

	if (fileURL && fileURL.length)
	{
		var CachedString = "";

		if ((ColumnsAndTypeArray!=null)  && ColumnsAndTypeArray.length)
		{
			for (var i =0 ; i < ColumnsAndTypeArray.length ;i+=2)
			{
				if (i > 0)
				{
					CachedString = CachedString +  ",";
				}

				CachedString = CachedString +  "name:";
				CachedString = CachedString +  ColumnsAndTypeArray[i];
				CachedString = CachedString +  ";datatype:";
				CachedString = CachedString +  ColumnsAndTypeArray[i+1];
			}
		}
	}

	if (CachedString && CachedString.length)
	{
		if (CachedString.indexOf("name:MM_ERROR") != -1)
		{
			//We don't make to save anything...
			removeCachedSchemaInfo(key);
		}
		else
		{
			writeCachedString(fileURL,key,CachedString);
		}
	}

	return CachedString;
}



////////////////////////////////////////////////////////////////////////////////
//
//	Function: getCachedParameters
//
//	get the list of Parameters for Stored Procedure
////////////////////////////////////////////////////////////////////////////////
function getCachedParametersArray(key)
{
    return getCachedColumnAndTypeArray(key)
}



////////////////////////////////////////////////////////////////////////////////
//
//	Function: SaveParametersForCache
//
//	Saves Parameters for Stored Procedure Access
////////////////////////////////////////////////////////////////////////////////
function SaveParametersForCache(key,ParamString)
{

    if (key.length < 3 || key.substr(0, 3) != "UD_") {
      key = "UD_" + key;
    }

	fileURL = getCacheURL();

	if (fileURL && fileURL.length)
	{
	    if (ParamString.indexOf("name:MM_ERROR") != -1)
		{
			//We don't make to save anything...
			removeCachedSchemaInfo(key);
		}
		else
		{
			writeCachedString(fileURL,key,ParamString);
		}
	}
}


