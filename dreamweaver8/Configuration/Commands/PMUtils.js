//=========================================================================================================
//
// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
//
// Feature: Paste Fix
// Author:  JDH
// Module:  PMUtils.js
// Purpose:	Utility functions for Paste Fix.
// Updates:
//	5/17/02 - Started file control
//
//=========================================================================================================

// The map of font names to Contribute font names

var FONT_MAP = {
  "arial": "Arial",
  "arial black": "Arial",
  "arial narrow": "Arial",
  "arial unicode ms": "Arial",
  "batang": "Times New Roman",
  "book antiqua": "Georgia",
  "bookman old style": "Georgia",
  "century": "Georgia",
  "century gothic": "Times New Roman",
  "comic sans ms": "Times New Roman",
  "courier new": "Courier New",
  "estrangelo edessa": "Times New Roman",
  "franklin gothic medium": "Verdana",
  "garamond": "Georgia",
  "gautami": "Times New Roman",
  "georgia": "Georgia",
  "haettenschweiler": "Verdana",
  "impact": "Verdana",
  "latha": "Times New Roman",
  "lucida console": "Courier New",
  "lucida sans unicode": "Verdana",
  "ms mincho": "Courier New",
  "ms outlook": "Times New Roman",
  "mt extra": "Times New Roman",
  "mv boli": "Times New Roman",
  "mangal": "Times New Roman",
  "marlett": "Times New Roman",
  "microsoft sans serif": "Verdana",
  "monotype corsiva": "Times New Roman",
  "palatino linotype": "Times New Roman",
  "raavi": "Verdana",
  "shruti": "Times New Roman",
  "simsun": "Georgia",
  "sylfaen": "Times New Roman",
  "symbol": "Times New Roman",
  "tahoma": "Verdana",
  "times new roman": "Times New Roman",
  "trebuchet ms": "Verdana",
  "tunga": "Times New Roman",
  "verdana": "Verdana",
  "webdings": "Times New Roman",
  "wingdings": "Times New Roman",
  "wingdings 2": "Times New Roman",
  "wingdings 3": "Times New Roman"
};

// The point values for mapping into font size values

var FONT_VALUES = new Array(8,10,12,14,18,24,36);

// Maps a font name into a Contribute font

function Utils_MapFont( fontName )
{
	// Massage the font name

	fontNames = fontName.split( "," );
	if ( fontNames )
		fontName = fontNames[ 0 ];

	fontName = fontName.replace( /\"/g, "" );
	fontName = Utils_StripWhitespace( fontName );
	fontName = fontName.toLowerCase();

	// Find the font in the font map

	if( FONT_MAP[ fontName ] != null )
		return FONT_MAP[ fontName ];
	else 
	{
		// If no font is found in the font map, check Asian system font list
		// This font list is UTF-8 so J, K, TC & SC fonts are in the one list so we don't need
		// to check encoding or system script
		for ( var i = 0; i < ASIAN_SYSTEM_FONTS_LIST.length; i++ ) {
			if ( fontName == ASIAN_SYSTEM_FONTS_LIST[i].toLowerCase() )
				// If font found in the Asian system font list, use it
				return ASIAN_SYSTEM_FONTS_LIST[ i ];
		}
	}

	// Return the default value for each encoding and platform if no font is found

	var charSet = dw.getDocumentDOM().getCharSet().toLowerCase();

	if (charSet == "shift_jis" || charSet == "x-sjis" || charSet == "euc-jp" || charSet == "iso-2022-jp")
	{
		if ( navigator.platform.charAt( 0 ) == "M" ) 
			return JAPANESE_SYSTEM_FONTS_MAC_LIST[ 0 ];
		else
			return JAPANESE_SYSTEM_FONTS_WIN_LIST[ 0 ];
	}
	else if ( charSet == "euc-kr" ) 
	{
		if ( navigator.platform.charAt( 0 ) == "M" ) 
			return KOREAN_SYSTEM_FONTS_MAC_LIST[ 0 ];
		else
			return KOREAN_SYSTEM_FONTS_WIN_LIST[ 0 ];
	}
	else if ( charSet == "big5" ) 
	{
		if ( navigator.platform.charAt( 0 ) == "M" ) 
			return TCHINESE_SYSTEM_FONTS_MAC_LIST[ 0 ];
		else
			return TCHINESE_SYSTEM_FONTS_WIN_LIST[ 0 ];
	}
	else if ( charSet == "gb2312" ) 
	{
		if ( navigator.platform.charAt( 0 ) == "M" ) 
			return SCHINESE_SYSTEM_FONTS_MAC_LIST[ 0 ];
		else
			return SCHINESE_SYSTEM_FONTS_WIN_LIST[ 0 ];
	}
	else
		return "Times New Roman";

}

// Convert a point size to a font size value

function Utils_ConvertPointsToFontSizes( pointSize )
{
	// Remove any point value and convert to a number

	pointSize = pointSize.replace( /pt/, "" );
	pointSize = parseFloat( pointSize );

  if (isNaN(pointSize)) pointSize = 10; //If not a number, set default to 10 pt

	// Look through the font values 

	for ( var index = 0; index < FONT_VALUES.length; index++ )
	{
		if ( FONT_VALUES[ index ] >= pointSize )
			return index + 1;
	}

	return FONT_VALUES.length;
}

function Utils_DeleteArrayItem( find_key, in_array )
{
	// Create the output array

	var out_array = {};

	// Iterate through the values and only add those items that
	// don't match the find key
	
	for( var key in in_array )
	{
		if ( key.toString() != find_key.toString() )
			out_array[ key ] = in_array[ key ];
	}

	// Return the finished new array

	return out_array;
}

function Utils_ReplaceArrayItem( find_key, in_array, new_value )
{
	// Create the output array

	var out_array = {};

	// Iterate through the values and only add those items that
	// don't match the find key
	
	for( var key in in_array )
	{
		if ( key.toString() == find_key.toString() )
			out_array[ key ] = new_value;
		else
			out_array[ key ] = in_array[ key ];		
	}

	// Return the finished new array

	return out_array;
}

// Strip the whitespace from a string

function Utils_StripWhitespace( str )
{
	str = str.replace( /^\s+/, "" );
	str = str.replace( /\s+$/, "" );
	return str;
}

// Build a string for the style attribute

function Utils_BuildStyle( styleHash )
{
	var styleText = "";

	for( var styleName in styleHash )
	{
		var styleValue = styleHash[ styleName ];
		styleText += styleName + ":" + styleValue + ";";
	}
	
	return styleText;
}

// Build a string for the interior of a class

function Utils_BuildClass( styleHash )
{
	var styleText = "";

	for( var styleName in styleHash )
	{
		var ignore = false;
		// ignore mso and page 
		if ( styleName.match( /^mso/ )  || styleName.match( /^page/) )
		{
			ignore = true;
		}
		if ( !ignore )
		{
			var styleValue = styleHash[ styleName ];			
			styleText += styleName + ":" + styleValue + ";\n";
		}
	}

	return styleText;
}

// Split up a style string into an associative array

function Utils_ParseStyle( styleText )
{
	var outItems = new Array();

	var items = dw.parseStylesFromString(styleText);

	// Iterate through the items

	for( var item_index in items )
	{
		var styleItem = items[ item_index ];
		
		// Split the name and value on the ':' delimiter

		var values = styleItem.split( ":" );

		if ( values[ 0 ] && values[ 0 ].length > 0 )
		{
			if ( values[ 1 ] == null )
				values[ 1 ] = "";

			// Turn those into the key and values by stripping the whitespace
			var key = Utils_StripWhitespace( values[ 0 ] );
			var value = Utils_StripWhitespace( values[ 1 ] );

			// Store the key/value pair

			outItems[ key.toLowerCase() ] = value;
		}
	}

	return outItems;
}

// Parse the contents of a <style> tag into an associative array of
// class name and their associated definitions

function Utils_ParseClasses( classText )
{
	// Remove any <!-- --> comments, or /* */ comments

	classText = classText.replace( /\<\!\-\-/g, "" );
	classText = classText.replace( /\-\-\>/g, "" );
	classText = classText.replace( /\/\*(.*?)\*\//g, "" );

	// Put together an associative array of clsases

	var classes = new Array();

	// Find the classes in the string

	class_matches = classText.match( /([^{]*?)\{([^}]*?)\}/g );

	// Iterate through the class names

	for( var cm_index in class_matches )
	{
		var cm = class_matches[ cm_index ];

		// Pull out the carriage returns

		cm = cm.replace( /[\n\r]/g, " " );

		// Split the string on the { } so that the name will be in the
		// first index and the class definition in the second index

		var classDataArray = cm.split( /[{}]/ );

		// Formalize the name and data strings

		var classNamesStr = Utils_StripWhitespace( classDataArray[ 0 ] );
		
		// don't do at-rules for page or list
		// don't add at-rules for page or list
		if ( !classNamesStr.match( /^@page/ ) && !classNamesStr.match( /^@list/ ) )
		{
			var classData = Utils_StripWhitespace( classDataArray[ 1 ] );

			// Parse up the data

			var stylesData = Utils_ParseStyle( classData );

			// Go through the class names and add each class to the
			// class list
			var classNames;
			
			// if starts with at-rule, don't split the names
			if ( classNamesStr.match( /^@/ ) )
				classNames = { 0: classNamesStr };
			else
				classNames = classNamesStr.split( "," );
			for( var cn_index in classNames )
			{
			// Clean up the class name
				var className = Utils_StripWhitespace( classNames[ cn_index ] );
				className = className.replace( /,/, "" );

			// If there is a class name after all that then add it to the list

				if ( className.length > 0 )
				{
					if ( classes [ className ] == undefined )
					{
						classes[ className ] = stylesData;
					}
					else
					{
						//already exists, let's add the new styles
						for( var tempKey in stylesData )
						{
							classes [ className ][ tempKey ] = stylesData[ tempKey ];
						}
					}
				}
			}
		}
	}

	return classes;
}

// Tag handler for the comment finder

function findCommentHelper( tag, findData )
{
	if ( tag.data == findData.comment )
	{
		findData.node = tag;
		return false;
	}
	return true;
}

// Finds a particular comment within the document.  Most likely either
// <!--StartFragment--> or <!--EndFragment-->

function Utils_FindComment( root, comment )
{
	var findData = { comment: comment, node: null };
	traverse( root, null, null, findCommentHelper, findData );
	return findData.node;
}

// This finds all of the <style> tags in the passed in DOM and calls the
// appropriate add method in the passed in class collection object

function Utils_LoadCSSFromDOM( dom, classes )
{
	var mediaTypes = [ "all", "screen", "" ];
	var scanner = new GetContentScanner( [ "style" ], "media", mediaTypes );
	var styles = scanner.scan( dom.documentElement.outerHTML );
	
	if ( styles != null )
	{
		for( var st_index in styles )
		{
			var styleText = styles[ st_index ];

			styleText = styleText.replace( /\/\*([^*]*)\*\//g, "" );
			styleText = styleText.replace( /\<\!\-\-/g, "" );
			styleText = styleText.replace( /\-\-\>/g, "" );

			// Parse the classes and get the classes back from each style tag
			var classHash = Utils_ParseClasses( styleText );

			// Add each class to the class container

			for( var className in classHash )
			{
				if ( className.indexOf("#") >= 0 )
				{
					classes.addID( className, classHash[ className ] );
				}
				else
				{
					classes.add( className, classHash[ className ] );
				}

			}
		}
	}
}


//function: lead
//description: given a number, and the number of digits
//adds a leading 0 number is less digits than the number of digits
//ex if you call lead(3,2), it'll return "03".  if you call lead(15,5), it'll return "00015"

function lead(num, digits){
   var retStr = num.toString();
   while (retStr.length < digits)
      retStr =  "0" + retStr;
   return ( retStr);
}

//function: Utils_GetTime
//description: given a caption,writes the date and time followed by the caption to the trace output
function Utils_GetTime(caption)
{
   var dateObj = new Date();
   var date = dateObj.getDate();
   var month = dateObj.getMonth()+1;
   var year = dateObj.getFullYear();
   var hours = dateObj.getHours();
   var minutes = dateObj.getMinutes();
   var seconds = dateObj.getSeconds();
   var milliseconds = dateObj.getMilliseconds();
   dw.trace(lead(month,2) + "/" + lead(date,2) + "/" + year + "  " + lead(hours,2) + ":" + lead(minutes,2) + ":" + lead(seconds,2) + ":" + lead(milliseconds,3) + "  " + caption + "\n");
 }
