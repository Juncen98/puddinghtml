// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


var formatFunc = "LSNumberFormat";

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
	var iStart = str.indexOf("#", 0);
	if (iStart > -1)
	{
		var iEnd = str.indexOf("#", iStart+1);
		if (iEnd > -1)
		{
			// The arguments are:
			//     strNamedFormat = string code for format of date/time

			if (format.strNamedFormat.length) 
			{
				ret = str.substring(0, iStart+1) + formatFunc + "(" + str.substring(iStart+1, iEnd) + ",'" + format.strNamedFormat + "')" + str.substr(iEnd);
			}
			else
			{
				ret = str.substring(0, iStart+1) + formatFunc + "(" + str.substring(iStart+1, iEnd) +  ")" + str.substr(iEnd);
			}
		}
		else
		{
			//  Error:  no termination of the CF block.
			//  alert("no end to CF");
		}
	}
	else
	{
		//  Error:  no start of CF block.
		//  alert("no equals");
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
