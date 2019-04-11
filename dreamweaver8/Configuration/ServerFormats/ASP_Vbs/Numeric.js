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

			//  The inputs are:
			//	NumDigitsAfterDecimal
			//		Numeric value indicating how many places to the
			//		right of the decimal are displayed. If -1, the
			//		computer's regional settings are used.
			//	IncludeLeadingDigit
			//		Indicates whether or not a leading zero is
			//		displayed for fractional values.
			//			-1 = true
			//			 0 = false
			//			-2 = server's or session's regional settings are used
			//	UseParensForNegativeNumbers
			//		Indicates whether or not to place negative values
			//		within parentheses. Same choices as for IncludeLeadingDigit.
			//	GroupDigits
			//		Indicates whether or not numbers are grouped using
			//		the group delimiter.

			var func = "FormatNumber";
			var nType = 0;
			
			if (format.file == CURRENCY)
			{
				func = "FormatCurrency";
				nType = 1;
			}
			else if (format.file == PERCENT)
			{
				func = "FormatPercent";
				nType = 2;
			}

			if (!bIsVB)
			{
				func = JS_formatFunc;
			}

			//  We found the equals sign corresponding to a
			//  Response.Write (e.g., "<% =").
			//  This is where we insert our function call to format the
			//  currency.

			ret = str.substring(0, iStart+1) + " " + func + "(" + str.substring(iStart+1, iEnd)
			ret = ret + ", " + format.NumDigitsAfterDecimal;
			ret = ret + ", " + format.IncludeLeadingDigit;
			ret = ret + ", " + format.UseParensForNegativeNumbers;
			ret = ret + ", " + format.GroupDigits;
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

// This function is called when the user hits the "okay" button on
// the parameters dialog.
//
// Verify that the user has supplied valid values in the form
// elements.  If you return a string, it is displayed to the user
// as an error message, and the dialog remains up.  If you return
// the format object, that indicates success.  If you return an
// empty string, we behave the same as if the user had hit "cancel".
//
// Set the expression attribute.  Also set any other attributes
// that will make my job easier in inspectFormatDefinition.

function applyFormatDefinition(format)
{
	format.NumDigitsAfterDecimal = document.forms[0].NumDigitsAfterDecimal.options[document.forms[0].NumDigitsAfterDecimal.selectedIndex].value;
	format.IncludeLeadingDigit = document.forms[0].IncludeLeadingDigit.options[document.forms[0].IncludeLeadingDigit.selectedIndex].value;
	format.UseParensForNegativeNumbers = document.forms[0].UseParensForNegativeNumbers.options[document.forms[0].UseParensForNegativeNumbers.selectedIndex].value;
	format.GroupDigits = document.forms[0].GroupDigits.options[document.forms[0].GroupDigits.selectedIndex].value;

	var strParams = format.NumDigitsAfterDecimal + ", " + format.IncludeLeadingDigit + ", " + format.UseParensForNegativeNumbers + ", " + format.GroupDigits;

	var func = "FormatNumber";

	if (format.file == CURRENCY)
	{
		func = "FormatCurrency";
	}
	else if (format.file == PERCENT)
	{
		func = "FormatPercent";
	}

	format.expression = "<%\\s*=\\s*" + func + "\\(.*, " + strParams + "\\)\\s*%>|<%\\s*=\\s*" + JS_formatFunc + "\\(.*, " + strParams + "\\)\\s*%>";

	return format;
}

// This function is called when the user pops up an existing format
// in order to edit its parameters.  Use the properties on the format
// object to set the initial values of HTML form elements, so that
// they match the user's current settings.

function inspectFormatDefinition(format)
{
	selectOption(document.forms[0].NumDigitsAfterDecimal, format.NumDigitsAfterDecimal);
	selectOption(document.forms[0].IncludeLeadingDigit, format.IncludeLeadingDigit);
	selectOption(document.forms[0].UseParensForNegativeNumbers, format.UseParensForNegativeNumbers);
	selectOption(document.forms[0].GroupDigits, format.GroupDigits);
}
