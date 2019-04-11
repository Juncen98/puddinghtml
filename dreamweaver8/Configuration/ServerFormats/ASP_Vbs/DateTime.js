// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
var DEBUG = false;

function getWholeJSFormatFunc()
{
strRet  = "<SCRIPT RUNAT=SERVER LANGUAGE=VBSCRIPT>					\n"
strRet += "function DoDateTime(str, nNamedFormat, nLCID)				\n"
strRet += "	dim strRet								\n"
strRet += "	dim nOldLCID								\n"
strRet += "										\n"
strRet += "	strRet = str								\n"
strRet += "	If (nLCID > -1) Then							\n"
strRet += "		oldLCID = Session.LCID						\n"
strRet += "	End If									\n"
strRet += "										\n"
strRet += "	On Error Resume Next							\n"
strRet += "										\n"
strRet += "	If (nLCID > -1) Then							\n"
strRet += "		Session.LCID = nLCID						\n"
strRet += "	End If									\n"
strRet += "										\n"
strRet += "	If ((nLCID < 0) Or (Session.LCID = nLCID)) Then				\n"
strRet += "		strRet = FormatDateTime(str, nNamedFormat)			\n"
strRet += "	End If									\n"
strRet += "										\n"
strRet += "	If (nLCID > -1) Then							\n"
strRet += "		Session.LCID = oldLCID						\n"
strRet += "	End If									\n"
strRet += "										\n"
strRet += "	DoDateTime = strRet							\n"
strRet += "End Function									\n"
strRet += "</SCRIPT>									\n"	

	return strRet;
}

var formatFunc = "DoDateTime";

function formatDynamicDataRef(str, format)
{
	var ret = str;
	var iStart = getIndexOfEqualsForResponseWrite(str);
	if (iStart > -1)
	{
		var iEnd = str.indexOf("%>", iStart+1);
		if (iEnd > -1)
		{
			// The arguments are:
			//     strNamedFormat = string code for format of date/time
			//       (if empty -- "" -- then a 'general' format is used)
			//     nLCID = locale ID (helps specify the output format)
			//       (if -1 then the locale of the session or server is used)

			var nNamedFormat = 0; // generalDate
			if (format.strNamedFormat == "longDate")
			{
				nNamedFormat = 1;
			}
			else if (format.strNamedFormat == "shortDate")
			{
				nNamedFormat = 2;
			}
			else if (format.strNamedFormat == "longTime")
			{
				nNamedFormat = 3;
			}
			else if (format.strNamedFormat == "shortTime")
			{
				nNamedFormat = 4;
			}

			//  We found the equals sign corresponding to a
			//  Response.Write (e.g., "<% =").
			//  This is where we insert our function call to do the formatting.

			ret = str.substring(0, iStart+1) + " " + formatFunc + "(" + str.substring(iStart+1, iEnd) + ", " + nNamedFormat + ", " + format.nLCID + ") " + str.substr(iEnd);
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

function applyFormat()
{
	if (getFunctionVersion(formatFunc, null) == -1)
	{
		var currSel = dw.getSelection();
		var htmlNode = dw.getDocumentDOM().documentElement;
		var oldHtmlOffsets = dw.nodeToOffsets(htmlNode);
		var wholeFunc = getWholeJSFormatFunc();

		insertBeforeHTMLTag(wholeFunc);

		htmlNode = dreamweaver.getDocumentDOM().documentElement;
		var newHtmlOffsets = dw.nodeToOffsets(htmlNode);
		var delta = newHtmlOffsets[1] - oldHtmlOffsets[1];
		dw.setSelection(currSel[0]+delta, currSel[1]+delta);
	}
}

function deleteFormat()
{
	if ((numFormatFunctionInvokations(formatFunc, 1) < 1) && (getFunctionVersion(formatFunc, null) > -1))
	{
		var currSel = dw.getSelection();
		var htmlNode = dw.getDocumentDOM().documentElement;
		var oldHtmlOffsets = dw.nodeToOffsets(htmlNode);

		deleteWholeScriptContainingFunction(formatFunc);

		htmlNode = dreamweaver.getDocumentDOM().documentElement;
		var newHtmlOffsets = dw.nodeToOffsets(htmlNode);
		var delta = newHtmlOffsets[1] - oldHtmlOffsets[1];
		dw.setSelection(currSel[0]+delta, currSel[1]+delta);

	}
}
