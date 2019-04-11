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
			var bIsVB = isVBScript_DocServerLanguage();

			// The one and only argument is a string indicating which
			// math function to use: abc, round, ...

			var func = "Abs";
			if (!bIsVB)
			{
				func = "Math.abs";
			}

			if (format.func == "round")
			{
				func = "Round";
				if (!bIsVB)
				{
					func = "Math.round";
				}
			}

			ret = str.substring(0, iStart+1) + " " + func + "(" + str.substring(iStart+1, iEnd) + ") " + str.substr(iEnd);
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
