// Copyright 2005 Macromedia, Inc. All rights reserved.
var DEBUG = false;

//default decimal format
var DEFAULT_NUMERIC_CHAR = "#";
var DEFAULT_ZERO_CHAR = "0";
var DEFAULT_GROUP_SEP_CHAR = ",";
var DEFAULT_PATT_SEP_CHAR = ";";
var DEFAULT_DEC_SEP_CHAR = ".";



function formatDynamicDataRef(str, format)
{
	var ret = str;
	// The arguments are:
	//     strNamedFormat = string code for format of date/time
	if (format) 
	{
		ret = formatFunc + "(" + str + ",'" + format.strNamedFormat + "')";
	}
	else
	{
		ret = formatFunc + "(" + str +  ")";
	}
	return ret;
}

function applyFormat()
{
}

function deleteFormat()
{
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

	var strFormat="";
	var iNoOfDigitsAfterDecimal = 0;
	var iNoOfGroupingDigits = -2;

	//initialize the format object
	format.NumDigitsAfterDecimal = document.forms[0].NumDigitsAfterDecimal.options[document.forms[0].NumDigitsAfterDecimal.selectedIndex].value;
	format.UseParensForNegativeNumbers = document.forms[0].UseParensForNegativeNumbers.options[document.forms[0].UseParensForNegativeNumbers.selectedIndex].value;
	format.GroupDigits = document.forms[0].GroupDigits.options[document.forms[0].GroupDigits.selectedIndex].value;

	if ((document.forms[0].CurrencyFormat) && (format.file == "Currency"))
	{
		//add the currency format if the file is currency
		var strCurrencyFormat = document.forms[0].CurrencyFormat.value;
		if (strCurrencyFormat && strCurrencyFormat.length)
		{
			strFormat = strCurrencyFormat;
			format.CurrencyFormat = strCurrencyFormat;
		}
	}

	//part before decimal
	var partBeforeDecimal = "";
	if (format.GroupDigits != -2)
	{
		//then construct a string with grouping-separator
		iNoOfGroupingDigits = parseInt(format.GroupDigits);
		if (isNaN(iNoOfGroupingDigits) == false)
		{
			for (var i=0; i < iNoOfGroupingDigits ; i++)
			{
				partBeforeDecimal+=DEFAULT_NUMERIC_CHAR;
			}
			partBeforeDecimal=DEFAULT_NUMERIC_CHAR + DEFAULT_GROUP_SEP_CHAR + partBeforeDecimal;
		}
	}
	else
	{
		partBeforeDecimal = DEFAULT_NUMERIC_CHAR;		
	}

	
	//part after decimal
	var partAfterDecimal = "";
	if (format.NumDigitsAfterDecimal == -1)
	{
		partAfterDecimal = DEFAULT_NUMERIC_CHAR;		
		partAfterDecimal += DEFAULT_NUMERIC_CHAR;		
	}
	else
	{
		iNoOfDigitsAfterDecimal = parseInt(format.NumDigitsAfterDecimal);
		if (isNaN(iNoOfDigitsAfterDecimal) == false)
		{
			for (var i=0; i < iNoOfDigitsAfterDecimal ; i++)
			{
				partAfterDecimal+=DEFAULT_ZERO_CHAR;
			}
		}
	}

	if (partAfterDecimal.length)
	{
		 strFormat = strFormat + partBeforeDecimal +  DEFAULT_DEC_SEP_CHAR + partAfterDecimal;
	}
	else
	{
		 strFormat = strFormat + partBeforeDecimal;
	}

	if (format.UseParensForNegativeNumbers == -1)
	{
		var strMinusFormat = "(" + strFormat + ")";
		strFormat += DEFAULT_PATT_SEP_CHAR;
		strFormat += strMinusFormat;
	}
	else if (format.UseParensForNegativeNumbers == 0)
	{
		var strMinusFormat = "-" + strFormat;
		strFormat += DEFAULT_PATT_SEP_CHAR;
		strFormat += strMinusFormat;
	}

	format.strNamedFormat = strFormat;
	if (strFormat.length)
	{
		//replace "(" by "\("
		strFormat = strFormat.replace("(","\\("); 
		//replace ")" by "\)"
		strFormat = strFormat.replace(")","\\)"); 
		//escape the $
		if (format.CurrencyFormat != null)
		{
			if (format.CurrencyFormat == "$")
			{
				strFormat = strFormat.replace("$","\\$"); 
			}
		}
	}
	format.expression = "\\s*format-number\\(.*,\\s*\\'" + strFormat  + "\\'\\)\\s*";

	return format;
}

// This function is called when the user pops up an existing format
// in order to edit its parameters.  Use the properties on the format
// object to set the initial values of HTML form elements, so that
// they match the user's current settings.
function inspectFormatDefinition(format)
{
	selectOption(document.forms[0].NumDigitsAfterDecimal, format.NumDigitsAfterDecimal);
	selectOption(document.forms[0].UseParensForNegativeNumbers, format.UseParensForNegativeNumbers);
	selectOption(document.forms[0].GroupDigits, format.GroupDigits);
	if (format.file == "Currency")
	{
	  document.forms[0].CurrencyFormat.value = format.CurrencyFormat;
	}
}
