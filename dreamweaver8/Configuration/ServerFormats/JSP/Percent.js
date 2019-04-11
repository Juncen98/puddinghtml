// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
var DEBUG = false;

function getWholeFormatFunc()
{
strRet = "<%!\n" + 
"public String DoFormatPercent(java.lang.Object aObject,int NumDigitsAfterDecimal,int UseParensForNegativeNumbers,int GroupDigits) \n" + 
"{\n" + 
"\n" + 
"	java.text.NumberFormat form;\n" + 
"	form = java.text.NumberFormat.getPercentInstance();\n" + 
"	if (NumDigitsAfterDecimal != -1) \n" + 
"		form.setMaximumFractionDigits(NumDigitsAfterDecimal);\n" + 
"\n" + 
"	if (UseParensForNegativeNumbers == -1) {\n" + 
"		((java.text.DecimalFormat)form).setNegativePrefix(\"(\");\n" + 
"		((java.text.DecimalFormat)form).setNegativeSuffix(\")%\");\n" + 
"	}\n" + 
"	else if (UseParensForNegativeNumbers == 0) {\n" + 
"		((java.text.DecimalFormat)form).setNegativePrefix(\"-\");\n" + 
"		((java.text.DecimalFormat)form).setNegativeSuffix(\"%\");\n" + 
"	}\n" + 
"\n" + 
"	if (GroupDigits == -1) {\n" + 
"		form.setGroupingUsed(true);\n" + 
"	}\n" + 
"	else if (GroupDigits == 0) {\n" + 
"		form.setGroupingUsed(false);\n" + 
"	}\n" + 
"\n" + 
"	return form.format(aObject);\n" + 
"}\n" + 
"%>\n";
return strRet;
}

var JS_formatFunc = "DoFormatPercent";
