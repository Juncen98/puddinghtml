// Copyright 2005 Macromedia, Inc. All rights reserved.


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
	ret = format.func + "(" + str +  ")";
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
