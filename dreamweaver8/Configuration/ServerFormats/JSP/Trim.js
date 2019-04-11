// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
var DEBUG = false;


function formatDynamicDataRef(str, format)
{
	var ret = str;
	var iStart = getIndexOfEqualsForResponseWrite(str);

	if (iStart > -1)
	{
		var iEnd = str.indexOf("%>", iStart+1);
		if (iEnd > -1)
		{
			if (format.side == "both")
			{
				jsFunction = ".toString().trim()";
			}
			ret = str.substring(0, iStart+1);
			ret = ret + " ";

			//  We found the equals sign corresponding to a
			//  Response.Write (e.g., "<% =").
			//  This is where we insert our function call to change the
			//  case of the letters.

				//  Assume that if we are not VBScript we are JScript.
				//
				//  ********
				//  JCript
				//  ********

				ret = ret + str.substring(iStart+1, iEnd) + jsFunction + " " + str.substr(iEnd);
		}
		else
		{
			//  Error:  no termination of the JSP block.
			//  alert("no end to JSP");
		}
	}
	else
	{
		//  Error:  no start of JSP block.
		//  alert("no equals");
	}

	return ret;
}
