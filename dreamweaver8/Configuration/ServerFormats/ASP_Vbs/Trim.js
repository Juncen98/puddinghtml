// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
var DEBUG = false;

function getWholeJSFormatFunc()
{
strRet  = "<SCRIPT RUNAT=SERVER LANGUAGE=VBSCRIPT>					\n"
strRet += "function DoTrim(str, side)							\n"
strRet += "	dim strRet								\n"
strRet += "	strRet = str								\n"
strRet += "										\n"
strRet += "	If (side = 0) Then						\n"
strRet += "		strRet = LTrim(str)						\n"
strRet += "	ElseIf (side = 1) Then						\n"
strRet += "		strRet = RTrim(str)						\n"
strRet += "	Else									\n"
strRet += "		strRet = Trim(str)						\n"
strRet += "	End If									\n"
strRet += "										\n"
strRet += "	DoTrim = strRet								\n"
strRet += "End Function									\n"
strRet += "</SCRIPT>									\n"	

	return strRet
}

var JS_formatFunc = "DoTrim";

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

			// The one and only argument is a boolean indicating end from
			// which whitespace should be trimmed:  left, right, both.

			var func = "LTrim";
			var param = "";
			if (!bIsVB)
			{
				func = JS_formatFunc;
				param = "0";
			}

			if (format.side == "right")
			{
				if (bIsVB)
				{
					func = "RTrim";
				}
				else
				{
					param = "1";
				}
			}
			else if (format.side == "both")
			{
				if (bIsVB)
				{
					func = "Trim";
				}
				else
				{
					param = "2";
				}
			}

			//  We found the equals sign corresponding to a
			//  Response.Write (e.g., "<% =").
			//  This is where we insert our function call to trim the
			//  whitespace.

			ret = str.substring(0, iStart+1) + " " + func + "(" + str.substring(iStart+1, iEnd);

			if (!bIsVB)
			{
				ret = ret + "," + param + "";
			}

			ret = ret + ") " + str.substr(iEnd);
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
	if ((!isVBScript_DocServerLanguage()) && (getFunctionVersion(JS_formatFunc, null) == -1))
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
	if ((!isVBScript_DocServerLanguage()) && (numFormatFunctionInvokations(JS_formatFunc, 1) < 1) && (getFunctionVersion(JS_formatFunc, null) > -1))
	{
		var currSel = dw.getSelection();
		var htmlNode = dw.getDocumentDOM().documentElement;
		var oldHtmlOffsets = dw.nodeToOffsets(htmlNode);

		deleteWholeScriptContainingFunction(JS_formatFunc);

		htmlNode = dreamweaver.getDocumentDOM().documentElement;
		var newHtmlOffsets = dw.nodeToOffsets(htmlNode);
		var delta = newHtmlOffsets[1] - oldHtmlOffsets[1];
		dw.setSelection(currSel[0]+delta, currSel[1]+delta);
	}
}
