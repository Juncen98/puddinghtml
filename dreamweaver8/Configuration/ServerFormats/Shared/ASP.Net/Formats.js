// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//--------------------------------------------------------------------
// FUNCTION:
//   formatDynamicDataRef
//
// DESCRIPTION:
//   Adds the format function call to the given dynamic data string.
//   Returns the new dynamic data reference with the format function
//   added.
//
// ARGUMENTS:
//   str - string - the dynamic data string to format
//   format - Object - the format to be applied.  This object
//     represents the format tag that was selected in Formats.xml
//
// RETURNS:
//   string - the new dynamic data reference
//--------------------------------------------------------------------

function formatDynamicDataRef(str, format)
{
  var ret = str;
  var iStart = str.indexOf("<%#", 0);

  if (iStart > -1)
  {
    var iEnd = str.indexOf("%>", iStart+1);
    
	if (iEnd > -1)
    {
 	  var dataRef = dwscripts.trim(str.substring(iStart+3, iEnd));
      
	  // Replace ([\s\S]+) with dataRef
	  // Replace \s* with a space
	  // Replace single quotes with double quotes
	  // Remove rest of backslashes

	  ret = format.expression;

	  ret = ret.replace(/\(\[\\s\\S\]\+\)/g, dataRef);
	  ret = ret.replace(/\\s\*/g, " ");
	  ret = ret.replace(/&quot;/g, "\"");
	  ret = ret.replace(/\\/g, "");
    }
    else
    {
      //  Error:  no termination of the ASP.Net block.
    }
  }
  else
  {
    //  Error:  no start of ASP.Net block.
  }
 
  return ret;
}

//--------------------------------------------------------------------
// FUNCTION:
//   applyFormat
//
// DESCRIPTION:
//   Adds a format function declaration to the user's document
//
// ARGUMENTS:
//   format - Object - the format to be applied.  This object
//     represents the format tag that was selected in Formats.xml
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function applyFormat(format)
{
}

//--------------------------------------------------------------------
// FUNCTION:
//   deleteFormat
//
// DESCRIPTION:
//   Removes the format function declaration from the top of the 
//   user's document.
//
// ARGUMENTS:
//   format - Object - the format to be applied.  This object
//     represents the format tag that was selected in Formats.xml
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function deleteFormat(format)
{
}
