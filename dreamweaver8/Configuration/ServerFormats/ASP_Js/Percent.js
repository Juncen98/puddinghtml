// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
var DEBUG = false;

function getWholeJSFormatFunc()
{
strRet  = "<SCRIPT RUNAT=SERVER LANGUAGE=VBSCRIPT>										\n"
strRet += "function DoPercent(str, nDigitsAfterDecimal, nLeadingDigit, nUseParensForNeg, nGroupDigits)				\n"
strRet += "	DoPercent = FormatPercent(str, nDigitsAfterDecimal, nLeadingDigit, nUseParensForNeg, nGroupDigits)		\n"
strRet += "End Function														\n"
strRet += "</SCRIPT>														\n"	

	return strRet;
}

var JS_formatFunc = "DoPercent";
