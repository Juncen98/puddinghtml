// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
var DEBUG = false;

function getWholeFormatFunc()
{
strRet  = "<%!\n" 
strRet += "public String DoDateTime(java.lang.Object aObject,int nNamedFormat,java.util.Locale aLocale) throws Exception{	\n"
strRet += "if ((aObject != null) && (aObject instanceof java.util.Date)){\n"
strRet += "   if (aLocale!=null){\n"
strRet += "		java.text.DateFormat df = java.text.DateFormat.getDateInstance(nNamedFormat,aLocale);\n"
strRet += "			return df.format(aObject);\n"
strRet += "	}\n"
strRet += "	else{\n"
strRet += "		java.text.DateFormat df = java.text.DateFormat.getDateInstance(nNamedFormat);\n"
strRet += "			return df.format(aObject);\n"
strRet += "	 }\n"
strRet += " }\n"
strRet += "return \"\";\n"
strRet += "}\n"
strRet += "%>\n"
return strRet
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

			var nNamedFormat = "java.text.DateFormat.MEDIUM"; // generalDate
			if (format.strNamedFormat == "short")
			{
				nNamedFormat = "java.text.DateFormat.SHORT";
			}
			else if (format.strNamedFormat == "medium")
			{
				nNamedFormat = "java.text.DateFormat.MEDIUM";
			}
			else if (format.strNamedFormat == "long")
			{
				nNamedFormat = "java.text.DateFormat.LONG";
			}
			else if (format.strNamedFormat == "full")
			{
				nNamedFormat = "java.text.DateFormat.FULL";
			}
			else {
				nNamedFormat = "java.text.DateFormat.MEDIUM";
			}


			var nLCID = "null"; // generalDate
			if (format.nLCID && format.nLCID.length) 
			{
				nLCID = "java.util.Locale." + format.nLCID;
			}

			//  We found the equals sign corresponding to a
			//  Response.Write (e.g., "<% =").
			//  This is where we insert our function call to do the formatting.

			ret = str.substring(0, iStart+1) + " " + formatFunc + "(" + str.substring(iStart+1, iEnd) + ", " + nNamedFormat + ", " + nLCID + ") " + str.substr(iEnd);
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

function applyFormat()
{
	if (getServerFunctionVersion(formatFunc) == -1)
	{
		var currSel = dw.getSelection();
		var htmlNode = dw.getDocumentDOM().documentElement;
		var oldHtmlOffsets = dw.nodeToOffsets(htmlNode);
		var wholeFunc = getWholeFormatFunc();

		insertBeforeHTMLTag(wholeFunc);

		htmlNode = dreamweaver.getDocumentDOM().documentElement;
		var newHtmlOffsets = dw.nodeToOffsets(htmlNode);
		var delta = newHtmlOffsets[1] - oldHtmlOffsets[1];
		dw.setSelection(currSel[0]+delta, currSel[1]+delta);
	}
}

function deleteFormat()
{
	if ((numFormatFunctionInvokations(formatFunc, 1) < 1) && (getServerFunctionVersion(formatFunc) != -1))
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
