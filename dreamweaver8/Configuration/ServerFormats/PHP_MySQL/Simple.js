// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


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
  // Replace &lt; and &gt; with < and >

  str = str.replace(/&lt;/g, "<");
  str = str.replace(/&gt;/g, ">");

  var ret = str;
  var iStart = getIndexOfEchoForResponseWrite(str);

  if (iStart > -1)
  {
    var iEnd = str.search(/;\s*\?>/);
    if (iEnd == -1)
    {
      iEnd = str.search(/\s*\?>/);
    }
    
    if (iEnd > -1)
    {
      // The one and only argument is the function to ASP function to call.
      
      ret = str.substring(0, iStart) + 
            ((str.charAt(iStart-1) != " ")? " " : "") + 
            format.func + "(" + str.substring(iStart, iEnd) + ")" + 
            str.substr(iEnd);
    }
    else
    {
      //  Error:  no termination of the PHP block.
      //  alert("no end to PHP");
    }
  }
  else
  {
    //  Error:  no start of PHP block.
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



function getIndexOfEchoForResponseWrite(str)
{
  var retVal = -1;
  var fnPatt = new RegExp("<?\\s*(php)?\\s*echo\\s*");
  var match = str.match(fnPatt);
  if (match)
  {
     retVal = str.indexOf(match[0]) + match[0].length;
  }

  return retVal;
}

