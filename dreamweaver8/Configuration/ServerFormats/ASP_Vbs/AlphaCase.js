// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
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
			// The one and only argument is a boolean indicating case:
			//	true  = UPPER
			//	false = lower

			var vbFunction = "UCase";
			var jsFunction = ".toUpperCase()";
			if (format.uppercase == "false")
			{
				vbFunction = "LCase";
				jsFunction = ".toLowerCase()";
			}

			ret = str.substring(0, iStart+1);
			ret = ret + " ";

			//  We found the equals sign corresponding to a
			//  Response.Write (e.g., "<% =").
			//  This is where we insert our function call to change the
			//  case of the letters.

			if (isVBScript_DocServerLanguage())
			{
				//  ********
				//  VBSCript
				//  ********

				ret = ret + vbFunction + "(" + str.substring(iStart+1, iEnd) + ") " + str.substr(iEnd);
			}
			else
			{
				//  Assume that if we are not VBScript we are JScript.
				//
				//  ********
				//  JCript
				//  ********

				ret = ret + str.substring(iStart+1, iEnd) + jsFunction + " " + str.substr(iEnd);
			}
		}
		else
		{
			//  Error:  no termination of the ASP block.
			//  alert("no end to ASP");
		}
	}
	else
	{
		//  Error:  no start of ASP block.
		//  alert("no equals");
	}

	return ret;
}
