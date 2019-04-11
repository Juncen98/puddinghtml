//=========================================================================================================
//
// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
//
// Feature: Paste Fix
// Author:  JDH
// Module:  PMScanners.js
// Purpose: HTML Scanning classes.
// Updates:
//	5/31/02 - Started file control
//
//=========================================================================================================


// This source file contains a number of generic helper classes that parse or alter a stream of HTML using
// the scanSourceString functionality in the Dreamweaver class.  The pattern for the use of all of these 
// classes is:
//
// var scanner = new <scanner_name>( <args> );
// var retVal = scanner.scan( html );
//
// Where the retVal is either the altered HTML (for a scanner that alters HTML), or an array (or associative
// array) for scanners that parse the HTML looking for specific tags.
//
// These classes are essentially unrolled, by which I mean that, while there are more elegant multi-level
// hierachal solutions to the problems solved by these scanners, I took a more lightweight approach and made
// more scanners that had lower levels of functionality, and did not descend from a large hierarchy.  The
// reason was mainly effeciency and simplicity.  Only the StructureScanner class is meant to be derived from
// during use.

// Some thoughts on scanSourceString:
//
// 1) Only implement the methods in the class that you need to get your job done.  Don't implement closeTagBegin
// if you don't need it.  scanSourceString looks for the existence of these methods at the beginning of the parse
// and will short-curcuit the call if you haven't defined a method, and that will save you some time.  It also
// makes the intention of your code more clear.
//
// 2) Don't return anything from the scanSourceString methods.  scanSourceString isn't looking for a return value
// so don't give it one.
//
// 3) I've seen a pattern in other code where you create an object with new Object and then add methods in 
// on slots using new Function.  I think the code is hard to read and hard to maintain, without performance benefit.
// I would avoid this pattern and I have not used it here.


// The list of tags that constitute "content"; that is, if a paragraph has one of these, it isn't empty.
// It contains tags that shouldn't actually be in a paragraph, just to be safe.
var CONTENT_TAGS = {
	p: 1, address: 1, h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1,
	table: 1, caption: 1, tr: 1, td: 1, th: 1,
	ol: 1, ul: 1, li: 1, dl: 1, dt: 1, dd: 1, dir: 1, menu: 1,
	div: 1, center: 1, blockquote: 1, pre: 1,
	applet: 1, iframe: 1, img: 1, object: 1,
	form: 1, input: 1, button: 1, select: 1, optgroup: 1, option: 1,
	textarea: 1, isindex: 1, label: 1, fieldset: 1, legend: 1,
	hr: 1
	};


function handleAttributeText( str, fromDW )
{
	// If we're coming from dreamweaver, and 
	// the string has server markup, don't do anything.
	// Otherwise, replace double quotes with single quotes
	
	// Also, apply single or double quotes around the string, as appropriate
	var strHasDouble = false;
	if ( fromDW && (str.match(/<%/) || str.match(/<cf/) || str.match(/<?php/) ) )
	{
		if ( str.match(/"/) )
			strHasDouble = true;
	}
	else
		str = str.replace( /\"/g, "'" );

	if (strHasDouble)
		return "'" + str + "'";
	else
		return '"' + str + '"';
}


//---------------------------------------------------------------------------------------------------------
//  GetContentScanner
//---------------------------------------------------------------------------------------------------------

// The GetContentScanner class gets the contents of any tags in the array of tags
// specified in the input array. For example, specifying:  [ "p" ] and then scanning
// this:
//
// <html><body><p>This</p><p>is</p><p>a</p><p>test</p></body></html>
//
// Would return an array like, [ "This", "is", "a", "test" ].
//
// If optionalAttribName and  attribValueArray are non-null, it only matches tags which,
// if they have an attrib matching optionalAttribName, have an attrib value in the array attribValueArray.
// (So if the attrib isn't present, that's ok, but if it *is* present, it must have one of
// the listed values.)
// Please note that this code was specifically designed to ignore directives and to get the
// contents within directives.
//
// This scanner does not alter the HTML in any way.

function GetContentScanner( tagNameArray, optionalAttribName, attribValueArray )
{
	this._optionalAttribName = optionalAttribName;
	this._attribValueArray = {};
	this._findLookup = {};
	var index;
	for( index in tagNameArray )
		this._findLookup[ tagNameArray[ index ] ] = 1;
	for( index in attribValueArray )
		this._attribValueArray[ attribValueArray[ index ] ] = 1;
}

// External methods

GetContentScanner.prototype.scan = GetContentScanner_scan;

// scanSourceString specific methods

GetContentScanner.prototype.directive = GetContentScanner_directive;
GetContentScanner.prototype.text = GetContentScanner_text;
GetContentScanner.prototype.openTagBegin = GetContentScanner_openTagBegin;
GetContentScanner.prototype.attribute = GetContentScanner_attribute;
GetContentScanner.prototype.closeTagBegin = GetContentScanner_closeTagBegin;

function GetContentScanner_scan( source )
{
	this._found = [];
	this._inTag = false;
	this._directives = [];
	this._scan_error = false;

	dw.scanSourceString( source, this, false );

	if ( this._scan_error )
		throw( "GetContentScanner bad scan" );

	for( var dir_index in this._directives )
		dw.scanSourceString( this._directives[ dir_index ], this, false );

	return this._found;
}

function GetContentScanner_directive( code, offset )
{
	try {

		code = code.replace( /^\<([^>]*)>/, "" );
		code = code.replace( /\<([^>]*)>$/, "" );

		this._directives.push( code );

	} catch(e) {

		this._scan_error = false;
		return false;

	}

	return true;
}

function GetContentScanner_text( code, offset )
{
	try {

		if ( this._inTag )
			this._found.push( code );

	} catch(e) {

		this._scan_error = false;
		return false;

	}

	return true;
}

function GetContentScanner_openTagBegin( tag, offset )
{
	try {

		if ( this._findLookup[ tag.toLowerCase() ] )
			this._inTag = true;

	} catch(e) {

		this._scan_error = false;
		return false;

	}

	return true;
}

// If the name matches _optionalAttribName, and the value is *not* in _attribValueArray,
// we don't care about the contents of this tag.
function GetContentScanner_attribute( name, code )
{
	if ( this._inTag && this._optionalAttribName == name.toLowerCase() )
	{
		if ( this._attribValueArray[ code.toLowerCase() ] == null )
			this._inTag = false;
	}
}

function GetContentScanner_closeTagBegin( tag, offset )
{
	try {

		if ( this._findLookup[ tag.toLowerCase() ] )
			this._inTag = false;

	} catch(e) {

		this._scan_error = false;
		return false;

	}

	return true;
}




//---------------------------------------------------------------------------------------------------------
//  FindDirectiveScanner
//---------------------------------------------------------------------------------------------------------

// The FindDirectiveScanner class gets the contents of any tags in the array of tags
// specified in the input array. For example, specifying:  [ "p" ] and then scanning
// this:
//
// <html><body><p>This</p><p>is</p><p>a</p><p>test</p></body></html>
//
// Would return an array like, [ "This", "is", "a", "test" ].
//
// Please note that this code was specifically designed to ignore directives and to get the
// contents within directives.
//
// This scanner does not alter the HTML in any way.

function FindDirectiveScanner( directive )
{
	this._directive = directive;
}

// External methods

FindDirectiveScanner.prototype.scan = FindDirectiveScanner_scan;

// scanSourceString specific methods

FindDirectiveScanner.prototype.directive = FindDirectiveScanner_directive;

function FindDirectiveScanner_scan( source )
{
	this._found = false;
	this._scan_error = false;

	dw.scanSourceString( source, this, false );

	if ( this._scan_error )
		throw( "FindDirectiveScanner bad scan" );

	return this._found;
}

function FindDirectiveScanner_directive( code, offset )
{
	try {

		if ( code == this._directive )
			this._found = true;

		return true;

	} catch(e) {

		this._scan_error = false;
		return false;

	}

	return true;
}


//---------------------------------------------------------------------------------------------------------
//  GetMetaTagsScanner
//---------------------------------------------------------------------------------------------------------

// Scans the source string for meta tags and returns an associative array
// of name value pairs.  For example, scanning this HTML:
//
// <html><head>
// <meta name="key1" content="value1">
// <meta name="key2" content="value2">
// </head></html>
//
// Will return { key1: "value1", key2: "value2" }
//
// This scanner does not alter the HTML in any way.

function GetMetaTagsScanner( ) { }

// External methods

GetMetaTagsScanner.prototype.scan = GetMetaTagsScanner_scan;

// scanSourceString specific methods

GetMetaTagsScanner.prototype.openTagBegin = GetMetaTagsScanner_openTagBegin;
GetMetaTagsScanner.prototype.closeTagBegin = GetMetaTagsScanner_closeTagBegin;
GetMetaTagsScanner.prototype.attribute = GetMetaTagsScanner_attribute;

function GetMetaTagsScanner_scan( source )
{
	this._found = {};
	this._inMeta = false;
	this._name = null;
	this._content = null;
	this._scan_error = false;

	dw.scanSourceString( source, this, false );

	if ( this._scan_error )
		throw( "GetMetaTagsScanner bad scan" );

	return this._found;
}

function GetMetaTagsScanner_openTagBegin( tag, offset )
{
	try {

		if ( tag.toLowerCase() == "meta" )
		{
			this._inMeta = true;
			this._name = null;
			this._content = null;
		}

	} catch( e ) {

		this._scan_error = true;
		return false;

	}
}

function GetMetaTagsScanner_closeTagBegin( tag, offset )
{
	try {

		if ( this._inMeta )
			this._inMeta = false;

	} catch( e ) {

		this._scan_error = true;
		return false;

	}
}

function GetMetaTagsScanner_attribute( name, code )
{
	try {

		if ( this._inMeta )
		{
			if ( name.toLowerCase() == "name" )
				this._name = code;
			if ( name.toLowerCase() == "content" )
				this._content = code;

			if ( this._name != null && this._content != null )
			{
				this._found[ this._name.toLowerCase() ] = this._content;
				this._name = null;
				this._content = null;
			}
		}

	} catch( e ) {

		this._scan_error = true;
		return false;

	}
}



//---------------------------------------------------------------------------------------------------------
//  ParseSupportListsScanner
//---------------------------------------------------------------------------------------------------------

// The ParseSupportListsScanner was specifically written with word in mind.  Word has some fairly
// interesting directive laced HTML that sits around hierarchal list items.  This does not apply to single
// level numeric or bulleted lists, which are implemented with <LI> tags.  This only applies to multi-level
// hierarchal lists, like:
//
// 1. First level
//     1.1  Sub level 1
//          1.1.1  Something reminiscent of the military
//     1.2  Sub level 2
//
// The Word format puts in a directive around supporting lists, this parser removes only the
// sections we want from it.  As an example:
// 
// <![if !supportLists]><span style='mso-list:Ignore'>I.<span
// style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nb
// sp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
// </span></span><![endif]>
//
// Becomes, just:
//
// I.
//
// The enclosing <P> tag has the indent level in the style attribute.

function ParseSupportListsScanner( ) { }

// Local methods

ParseSupportListsScanner.prototype.scan = ParseSupportListsScanner_scan;

// scanSourceString specific methods

ParseSupportListsScanner.prototype.directive = ParseSupportListsScanner_directive;
ParseSupportListsScanner.prototype.text = ParseSupportListsScanner_text;
ParseSupportListsScanner.prototype.openTagBegin = ParseSupportListsScanner_openTagBegin;
ParseSupportListsScanner.prototype.openTagEnd = ParseSupportListsScanner_openTagEnd;
ParseSupportListsScanner.prototype.closeTagBegin = ParseSupportListsScanner_closeTagBegin;
ParseSupportListsScanner.prototype.attribute = ParseSupportListsScanner_attribute;

function ParseSupportListsScanner_scan( source, context )
{
	this._sb = context.createStringBuffer();
	this._inSupportLists = false;
	this._scan_error = false;
	this._in_paragraph = false;
	this._in_list = false;
	this._p_attributes = {};
	this._item_level = 0;
	this._cur_item_level = 0;
	this._orderedList = true;
	this._fromDW = context.settingDefined( SETTINGS_DW_HTML );

	if (source.indexOf("font-family") >= 0 && source.indexOf("Symbol") >= 0)
		this._orderedList = false;

	dw.scanSourceString( source, this, false );

	if ( this._scan_error )
		throw( "ParseSupportListsScanner bad scan" );

	return this._sb.get();
}

function ParseSupportListsScanner_directive( code, offset )
{
	try {
		var testCode = code.toLowerCase();
		if( code.match( /^\<\!\[if \!supportLists\]>/ ) )
		{
			this._inSupportLists = true;
		}
		else if ( this._inSupportLists )
		{
			if ( code.match( /^\<\!\[endif\]\>/ ) )
				this._inSupportLists = false;
		}
		else
		{
			this._sb.append( code );
		}

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function ParseSupportListsScanner_text( code, offset )
{
	try {

		if ( ! this._inSupportLists )
		{
			if ( code.length > 0 )
				this._sb.append( code );
		}

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function ParseSupportListsScanner_openTagBegin( tag, offset )
{
	try {

		if ( tag.toString().toLowerCase() == "p" )
		{
			this._in_paragraph = true;
			this._p_attributes = {};
			this._in_list = false;
		}
		else if ( ! this._inSupportLists )
		{
			if ( ! this._in_list && ! this._in_paragraph )
			{
				if ( this._cur_item_level )
				{
					var listend = "</ul>";
					if (this._orderedList)
						listend = "</ol>";
						
					for( var rep = 0; rep < this._cur_item_level; rep++ )
						this._sb.append( listend );
					this._cur_item_level = 0;
				}
			}

			this._sb.append( "<" + tag );
		}

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function ParseSupportListsScanner_openTagEnd( offset, trailingFormat )
{
	try {

		var listbegin = "<ul>";
		if (this._orderedList)
			listbegin = "<ol>";
		var listend = "</ul>";
		if (this._orderedList)
			listend = "</ol>";

		if ( this._in_paragraph )
		{
			if ( this._in_list )
			{
				if ( this._item_level > this._cur_item_level )
				{
					var delta = this._item_level - this._cur_item_level;
					for( var rep = 0; rep < delta; rep++ )
						this._sb.append( listbegin );
				}

				if ( this._item_level < this._cur_item_level )
				{
					var delta = this._cur_item_level - this._item_level;
					for( var rep = 0; rep < delta; rep++ )
						this._sb.append( listend );
				}

				this._cur_item_level = this._item_level;
				this._sb.append( "<li>" );
			}
			else
			{
				if ( this._cur_item_level )
				{
					for( var rep = 0; rep < this._cur_item_level; rep++ )
						this._sb.append( listend );
					this._cur_item_level = 0;
				}
			
				var code = "<p";
				for( var key in this._p_attributes )
				{
					if ( this._p_attributes[ key ] != null )
						code += " " + key + "=" + handleAttributeText(this._p_attributes[ key ], this._fromDW);
				}
				code += trailingFormat + ">";
				this._sb.append( code );
			}
			this._in_paragraph = false;
		}
		else if ( ! this._inSupportLists )
		{
			this._sb.append( trailingFormat + ">" );

			if ( this._cur_item_level && ! this._in_list )
			{
				for( var rep = 0; rep < this._cur_item_level; rep++ )
					this._sb.append( listend );
				this._cur_item_level = 0;
			}
		}

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function ParseSupportListsScanner_closeTagBegin( tag, offset )
{
	try {

		var listend = "</ul>";
		if (this._orderedList)
			listend = "</ol>";

		if ( tag.toLowerCase() == "p" && this._in_list )
		{
			this._sb.append( "</li>" );
			this._in_list = false;
		}
		else if ( ! this._inSupportLists )
		{
			if ( this._cur_item_level && ! this._in_list )
			{
				for( var rep = 0; rep < this._cur_item_level; rep++ )
					this._sb.append( listend );
				this._cur_item_level = 0;
			}

			this._sb.append( "</" + tag + ">" );
		}

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function ParseSupportListsScanner_attribute( name, code )
{
	try {

		if ( this._in_paragraph )
		{
			this._p_attributes[ name ] = code;
			if ( name.toString().toLowerCase() == "style" )
			{
				if ( code.match( /mso\-list/im ) )
				{
					var levelnum = code.match( /level(\d+)\s/ );
					
					this._item_level = 1;
					if ( levelnum )
						this._item_level = parseInt( levelnum[1] );

					this._in_list = true;
				}
			}
		}
		else if ( ! this._inSupportLists )
		{
			if ( name.length > 0 )
			{
				this._sb.append( " " + name + "=" + handleAttributeText(code, this._fromDW) );
			}
			else
			{
				this._sb.append( " " + code );
			}
		}
	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}



//---------------------------------------------------------------------------------------------------------
//  RemoveConditionalsScanner
//---------------------------------------------------------------------------------------------------------

// This scanner is specific to MS products.  The MS HTML output format is laced with 
// directives throughout.  What this scanner does is find the directives and remove them.  Additionally, if some
// interesting tags are within the directive then it will keep just that tag and remove the surrounding directive.
// It is important to note that there are often nested directives with MS documents.
//
// An example of the directives you might see is:
//
//  <![if !vml]><span style='mso-ignore:vglayout'><table cellpadding=0 cellspacing=0>
//   <tr><td width=63 height=0></td></tr>
//   <tr><td></td>
//    <td><![endif]><![if !excel]><img width=482 height=247 src="file:some_temp_file.gif">
//    <![endif]><![if !vml]></td>
//    <td width=31></td>
//   </tr>
//   <tr><td height=8></td></tr></table></span><![endif]>
// 
// When all we really want is:
//
// <img width=482 height=247 src="file:some_temp_file.gif">
//
// Passing allowTags = { img: 1 } will do that for you.
//
// One note on RemoveConditionalsScanner. The tags you specify with allowTags should be tags that have opens with
// no closes, like <img> or <br>.  The code is not built generically enough to handle open and close pairs.  If that
// is required then the class will need some redesigning.

function RemoveConditionalsScanner( allowTags )
{
	this._allowTags = allowTags;
}

// External methods

RemoveConditionalsScanner.prototype.scan = RemoveConditionalsScanner_scan;

// scanSourceString specific methods

RemoveConditionalsScanner.prototype.directive = RemoveConditionalsScanner_directive;
RemoveConditionalsScanner.prototype.text = RemoveConditionalsScanner_text;
RemoveConditionalsScanner.prototype.openTagBegin = RemoveConditionalsScanner_openTagBegin;
RemoveConditionalsScanner.prototype.openTagEnd = RemoveConditionalsScanner_openTagEnd;
RemoveConditionalsScanner.prototype.closeTagBegin = RemoveConditionalsScanner_closeTagBegin;
RemoveConditionalsScanner.prototype.attribute = RemoveConditionalsScanner_attribute;

function RemoveConditionalsScanner_scan( source, context )
{
	this._sb = context.createStringBuffer();
	this._inDirective = 0;
	this._exceptionTag = false;
	this._scan_error = false;
	this._fromDW = context.settingDefined( SETTINGS_DW_HTML );

	dw.scanSourceString( source, this, false );

	if ( this._scan_error )
		throw( "RemoveConditionalsScanner bad scan" );

	return this._sb.get();
}

function RemoveConditionalsScanner_directive( code, offset )
{
	try {
		var testCode = code.toLowerCase();
		if( testCode.match( /^\<\!\[if/ ) )
		{
			// might be closed here, too
			if (! testCode.match( /\<\!\[endif\]\>$/ ) )
			{
				this._inDirective++;
			}
		}
		else if ( testCode.match( /^\<\!\-\-\[if/ ) )
		{
			;
		}
		else if ( this._inDirective )
		{
			if ( testCode.match( /^\<\!\[endif\]/ ) )
				this._inDirective--;
		}
		else
		{
			if ( code.match( /\<\!\-\-(\s*)startfragment(\s*)\-\->/i ) || code.match( /\<\!\-\-(\s*)endfragment(\s*)\-\->/i ) )
				this._sb.append( code );
		}

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

// remove code inside condition directive, *except* keep "&nbsp;"
function RemoveConditionalsScanner_text( code, offset )
{
	try {
		if ( this._inDirective == 0 )
			this._sb.append( code );
		else if ( code.match(/&nbsp;/) )
			this._sb.append( code );
	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveConditionalsScanner_openTagBegin( tag, offset )
{
	try {

		if ( this._allowTags[ tag.toLowerCase() ] )
			this._exceptionTag = true;

		if ( this._inDirective == 0 || this._exceptionTag )
			this._sb.append( "<" + tag );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveConditionalsScanner_openTagEnd( offset, trailingFormat )
{
	try {

		if ( this._inDirective == 0 || this._exceptionTag )
			this._sb.append( trailingFormat + ">" );

		this._exceptionTag = false;

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveConditionalsScanner_closeTagBegin( tag, offset )
{
	try {

		if ( this._inDirective == 0 || this._exceptionTag )
			this._sb.append( "</" + tag + ">" );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveConditionalsScanner_attribute( name, code )
{
	try {

		if ( this._inDirective == 0 || this._exceptionTag )
		{
			if ( name.length > 0 )
				this._sb.append( " " + name + "=" + handleAttributeText(code, this._fromDW) );
			else
				this._sb.append( " " + code );
		}
	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}


//---------------------------------------------------------------------------------------------------------
//  RemoveDWCommentsScanner
//---------------------------------------------------------------------------------------------------------

// This scanner removes special Dreamweaver comments used to mark template regions, library items, etc.
//
function RemoveDWCommentsScanner( dwComments )
{
	this._dwComments = dwComments;
}

// External methods

RemoveDWCommentsScanner.prototype.scan = RemoveDWCommentsScanner_scan;

// scanSourceString specific methods
RemoveDWCommentsScanner.prototype.directive = RemoveDWCommentsScanner_directive;
RemoveDWCommentsScanner.prototype.text = RemoveDWCommentsScanner_text;
RemoveDWCommentsScanner.prototype.openTagBegin = RemoveDWCommentsScanner_openTagBegin;
RemoveDWCommentsScanner.prototype.openTagEnd = RemoveDWCommentsScanner_openTagEnd;
RemoveDWCommentsScanner.prototype.closeTagBegin = RemoveDWCommentsScanner_closeTagBegin;
RemoveDWCommentsScanner.prototype.attribute = RemoveDWCommentsScanner_attribute;

function RemoveDWCommentsScanner_scan( source, context )
{
	this._sb = context.createStringBuffer();
	this._scan_error = false;
	this._fromDW = context.settingDefined( SETTINGS_DW_HTML );

	dw.scanSourceString( source, this, false );

	if ( this._scan_error )
		throw( "RemoveDWCommentsScanner bad scan" );

	return this._sb.get();
}

function RemoveDWCommentsScanner_directive( code, offset )
{
	try {
		var testCode = code.toLowerCase();
		if( testCode.match( /^\<\!\[if/ ) )
		{
			this._inDirective++;
		}
		if ( ! testCode.match( /^\<\!\-\-/ ) )
		{
			// not a comment at all, keep it
			this._sb.append( code );
		}
		else
		{
			// we have a comment
			// find the next word (space delimited)
			var pattern = /\s+/;
			var words = testCode.split(pattern);

			// if that word is not in the _dwComments list, keep the comment
			if ( ! this._dwComments[ words[1] ] )
			{
				this._sb.append( code );
			}
		}

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveDWCommentsScanner_text( code, offset )
{
	try {
		this._sb.append( code );
	} catch( e ) {
		this._scan_error = true;
		return false;
	}
	return true;
}

function RemoveDWCommentsScanner_openTagBegin( tag, offset )
{
	try {
		this._sb.append( "<" + tag );
	} catch( e ) {
		this._scan_error = true;
		return false;
	}
	return true;
}

function RemoveDWCommentsScanner_openTagEnd( offset, trailingFormat )
{
	try {
		this._sb.append( trailingFormat + ">" );
	} catch( e ) {
		this._scan_error = true;
		return false;
	}
	return true;
}

function RemoveDWCommentsScanner_closeTagBegin( tag, offset )
{
	try {
		this._sb.append( "</" + tag + ">" );
	} catch( e ) {
		this._scan_error = true;
		return false;
	}
	return true;
}

function RemoveDWCommentsScanner_attribute( name, code )
{
	try {
		if ( name.length > 0 )
			this._sb.append( " " + name + "=" + handleAttributeText(code, this._fromDW) );
		else
			this._sb.append( " " + code );
	} catch( e ) {
		this._scan_error = true;
		return false;
	}
	return true;
}


//---------------------------------------------------------------------------------------------------------
//  FindClippingScanner
//---------------------------------------------------------------------------------------------------------

// FindClippingScanner is designed to find the fragment of the clipboard in the HTML and return just that
// fragment with the minimum amount of support HTML around it.  As an example:
//
// <html><head>.... Cruft...</head><body>... More cruft ...
// <!---StartFragment---><p>Some small text</p><!---EndFragment--->... More cruft ...</body></html>
//
// Becomes:
//
// <html><body><!---StartFragment---><p>Some small text</p><!---EndFragment---></body></html>
//
// The idea is that removing all of the header, body pre, and body post information.
//
// In the case where there is no <!--StartFragment--> (where we are importing the contents of a file) then
// we look for the start and end <body> tags.

function FindClippingScanner( ) { }

// External methods

FindClippingScanner.prototype.scan = FindClippingScanner_scan;

// scanSourceString specific methods

FindClippingScanner.prototype.directive = FindClippingScanner_directive;
FindClippingScanner.prototype.text = FindClippingScanner_text;
FindClippingScanner.prototype.openTagBegin = FindClippingScanner_openTagBegin;
FindClippingScanner.prototype.openTagEnd = FindClippingScanner_openTagEnd;
FindClippingScanner.prototype.closeTagBegin = FindClippingScanner_closeTagBegin;
FindClippingScanner.prototype.attribute = FindClippingScanner_attribute;

function FindClippingScanner_scan( source, context )
{
	this._inClipping = false;
	this._firstTagException = false;
	this._findComment = false;
	this._clipTag = "";
	this._frag = "";
	this._scan_error = false;
	this._fromDW = context.settingDefined( SETTINGS_DW_HTML );

	this._sb = context.createStringBuffer();

	if( source.match( /\<\!\-\-(\s*)startfragment(\s*)\-\->/i ) )
	{
		this._findComment = true;
		this._startText = /\<\!\-\-(\s*)startfragment(\s*)\-\->/i;
		this._endText = /\<\!\-\-(\s*)endfragment(\s*)\-\->/i;
	}
	else if( source.match( /\<\!\-\-(\s*)document start(\s*)\-\->/i ) )
	{
		// klo - Fix for #149440, copying and pasting from Hangul Wordian word processor.
		// They use a different comment to note the text fragment to copy:
		// <!-- Document Start -->
		// <!-- Document End -->
		this._findComment = true;
		this._startText = /\<\!\-\-(\s*)document start(\s*)\-\->/i;
		this._endText = /\<\!\-\-(\s*)document end(\s*)\-\->/i;
	}
	else if( source.match( /\<body(\s*)>/i ) )
	{
		// if there's a body tag, take what's inside it
	}
	else
	{
		// if not even a body tag in source, take the whole thing
		this._inClipping = "true";
	}
	
	dw.scanSourceString( source, this, false );

	if ( this._scan_error )
		throw( "FindClippingScanner bad scan" );

	var text = this._sb.get();

	return "<html><body>" + text + "</body></html>";
}

function FindClippingScanner_directive( code, offset )
{
	try {

		var testCode = code.toLowerCase();

		if( this._findComment && this._startText.exec( testCode ) )
		{
			code = "<!--StartFragment-->";
			this._inClipping = true;
		}

		if( this._findComment && this._endText.exec( testCode ) )
		{
			code = "<!--EndFragment-->";
			this._sb.append( code );
			this._inClipping = false;
		}
		else if ( this._inClipping )
			this._sb.append( code );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function FindClippingScanner_text( code, offset )
{
	try {

		if ( this._inClipping )
			this._sb.append( code );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function FindClippingScanner_openTagBegin( tag, offset )
{
	try {

		if ( this._inClipping )
			this._frag = "<" + tag;

		if ( this._clipTag == tag && this._findComment == false )
		{
			this._inClipping = true;
			this._firstTagException = true;
		}

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function FindClippingScanner_openTagEnd( offset, trailingFormat )
{
	try {

		if ( this._inClipping && this._firstTagException == false )
		{
			this._frag += trailingFormat + ">";
			this._sb.append( this._frag );
		}

		this._firstTagException = false;

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function FindClippingScanner_closeTagBegin( tag, offset )
{
	try {

		if ( this._clipTag == tag && this._findComment == false )
			this._inClipping = false;

		if ( this._inClipping )
			this._sb.append( "</" + tag + ">" );

		this._exceptionTag = false;

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function FindClippingScanner_attribute( name, code )
{
	try {

		if ( this._inClipping && this._firstTagException == false )
		{
			if ( name.length > 0 )
				this._frag += " " + name + "=" + handleAttributeText(code, this._fromDW);
			else
				this._frag += " " + code;
		}
		
	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}



//---------------------------------------------------------------------------------------------------------
//  RemoveTagsScanner
//---------------------------------------------------------------------------------------------------------

// The RemoveTagScanner removes any tag listed in the associative array passed
// in with the constructor.  For example, to remove every <P> tag from the 
// following HTML:
//
//    <html><body><p>This</p><ul><li>is<li>a<li>test</ul></body><html>
//
// You would pass { p: 1 } into the constructor and invoke scan with the HTML.
// The return value would be:
//
//    <html><body><ul><li>is<li>a<li>test</ul></body><html>

// The list of illegal close tags that sometimes end up on the clipboard, and we have to
// remove them to avoid problems.  (Ex: IE puts a (badly nested) </basefont> on the clipboard,
// and the close basefont tag is illegal even if properly nested.
var BAD_CLOSE_TAGS = {
	basefont: 1
};

// The "tagLookup" lists only list HTML tags to retain.
// In addition, we need to keep all server-language tags, such as cf* for ColdFusion, etc.
// This is an array of tag prefices for those; we'll retain any tags that begin with any of these.
var SERVER_TAG_PREF = {
	"^asp:(.*?)" : 1,
	"^cf(.*?)" : 1,
	"^jrun:(.*?)" : 1,
	"^jsp:(.*?)" : 1,
	"^mm:(.*?)" : 1,
	"^xsl:(.*?)" : 1,
};

// When we're removing tags, there are some for which we also need to remove their content
var CONTENT_REMOVE_TAGS = {
	del: 1
};

function RemoveTagsScanner( tagLookup )
{
	this._tagLookup = tagLookup;
	this._badCloseTags = BAD_CLOSE_TAGS;
	this._otherTagPrefices = SERVER_TAG_PREF;
	this._contentRemoveTags = CONTENT_REMOVE_TAGS;
}

// External methods

RemoveTagsScanner.prototype.scan = RemoveTagsScanner_scan;

// scanSourceString specific methods

RemoveTagsScanner.prototype.directive = RemoveTagsScanner_directive;
RemoveTagsScanner.prototype.text = RemoveTagsScanner_text;
RemoveTagsScanner.prototype.openTagBegin = RemoveTagsScanner_openTagBegin;
RemoveTagsScanner.prototype.openTagEnd = RemoveTagsScanner_openTagEnd;
RemoveTagsScanner.prototype.closeTagBegin = RemoveTagsScanner_closeTagBegin;
RemoveTagsScanner.prototype.attribute = RemoveTagsScanner_attribute;

function RemoveTagsScanner_scan( source, context )
{
	this._sb = context.createStringBuffer();
	this._inGoodTag = true;
	this._inRemoveContentTags = 0;
	this._scan_error = false;
	this._fromDW = context.settingDefined( SETTINGS_DW_HTML );
	this._fromOffice = context.getOriginOffice();

	// do the scan, and tell the scanner we don't want it to ignore text that's all whitespace
	dw.scanSourceString( source, this, false );

	if ( this._scan_error )
		throw( "RemoveTagsScanner bad scan" );

	return this._sb.get();
}

function RemoveTagsScanner_directive( code, offset )
{
	try {

		this._sb.append( code );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveTagsScanner_text( code, offset )
{
	try {

		if (this._inRemoveContentTags == 0)
			this._sb.append( code );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveTagsScanner_openTagBegin( tag, offset )
{
	try {
		var lowerTag = tag.toLowerCase();
		var removeFromOffice = false;

		// if we're coming from msoffice, always remove tags in _contentRemoveTags, as well as their content
		if (this._fromOffice)
		{
			for ( p in this._contentRemoveTags)
			{
				if ( lowerTag.match( p ) )
				{
					removeFromOffice = true;
					// remove the tag's content, too
					this._inRemoveContentTags += 1;
					break;
				}
			}
		}

		if (removeFromOffice)
			this._inGoodTag = false;
		else if ( this._tagLookup[ lowerTag ] )
			this._inGoodTag = true;
		else
		{
			this._inGoodTag = false;
			// check against _otherTagPrefices
			for ( p in this._otherTagPrefices)
			{
				if ( lowerTag.match( p ) )
				{
					this._inGoodTag = true;
					break;
				}
			}
		}
		if ( this._inGoodTag )
			this._sb.append( "<" + tag );
		else if (lowerTag == "br")	//replace <br> with space if not retaining line breaks
			this._sb.append( " " );
	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveTagsScanner_openTagEnd( offset, trailingFormat )
{
	try {

		if ( this._inGoodTag )
			this._sb.append( trailingFormat + ">" );

		this._inGoodTag = true;

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveTagsScanner_closeTagBegin( tag, offset )
{
	try {
		var lowerTag = tag.toLowerCase();

		if ( this._inGoodTag && ! this._badCloseTags[ lowerTag ] && this._inRemoveContentTags == 0)
		{
			this._sb.append( "</" + tag + ">" );
		}
		else
		{
			if (this._fromOffice)
			{
				for ( p in this._contentRemoveTags)
				{
					if ( lowerTag.match( p ) )
					{
						if (this._inRemoveContentTags > 0)
							this._inRemoveContentTags -= 1;
						break;
					}
				}
			}
		}

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveTagsScanner_attribute( name, code )
{
	try {

		if ( this._inGoodTag )
		{
			if ( name.length > 0 )
				this._sb.append( " " + name + "=" + handleAttributeText(code, this._fromDW) );
			else
				this._sb.append( " " + code );
		}
	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}



//---------------------------------------------------------------------------------------------------------
//  RemoveAttributesScanner
//---------------------------------------------------------------------------------------------------------

// The RemoveAttributesScanner removes attributes and styles that are NOT
// listed in the constructor.  For example with the HTML:
//
//    <html><body><p>This</p><ul><li>is<li>a<li>test</ul></body><html>
//
// Passing in { html: 1, body: 1, p: 1 } as the attributes would get you:
//
//    <html><body><p>This</p> is a test </body><html>
//
// The same thing applies to the attributes.  So on this html:
//
//     <p style="mso-reject: 1; font-family: Arial">
//
// Passing in { "font-family": 1 } as the style filter would get you:
//
//     <p style="font-family: Arial;">
//
// If  "onlyRemoveMSO" is true, then this will instead only remove
// style properties beginning with "mso-" and other props listed in msoProperties,
// and leave all other attribs and styles.
 
function RemoveAttributesScanner( onlyRemoveMSO , attributeLookup, styleLookup, msoProperties )
{
	this._onlyRemoveMSO = onlyRemoveMSO;
	this._attributeLookupMaster = attributeLookup;
	this._styleLookupMaster = styleLookup;
	this._msoProperties = msoProperties;
}

// External methods

RemoveAttributesScanner.prototype.scan = RemoveAttributesScanner_scan;

// scanSourceString specific methods

RemoveAttributesScanner.prototype.directive = RemoveAttributesScanner_directive;
RemoveAttributesScanner.prototype.text = RemoveAttributesScanner_text;
RemoveAttributesScanner.prototype.openTagBegin = RemoveAttributesScanner_openTagBegin;
RemoveAttributesScanner.prototype.openTagEnd = RemoveAttributesScanner_openTagEnd;
RemoveAttributesScanner.prototype.closeTagBegin = RemoveAttributesScanner_closeTagBegin;
RemoveAttributesScanner.prototype.attribute = RemoveAttributesScanner_attribute;

function RemoveAttributesScanner_scan( source, context )
{
	this._sb = context.createStringBuffer();
	this._tagName = null;
	this._scan_error = false;
	this._fromDW = context.settingDefined( SETTINGS_DW_HTML );

	dw.scanSourceString( source, this, false );

	if ( this._scan_error )
		throw( "RemoveAttributesScanner bad scan" );

	return this._sb.get();
}

function RemoveAttributesScanner_directive( code, offset )
{
	try {

		this._sb.append( code );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveAttributesScanner_text( code, offset )
{
	try {

		this._sb.append( code );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveAttributesScanner_openTagBegin( tag, offset )
{
	try {

		this._tagName = tag;// tag.toLowerCase();

		this._attributeLookup = this._attributeLookupMaster[ this._tagName ];
		this._styleLookup = this._styleLookupMaster[ this._tagName ];

		if ( this._attributeLookup == null )
			this._attributeLookup = {};
		if ( this._styleLookup == null )
			this._styleLookup = {};

		this._sb.append( "<" + tag );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveAttributesScanner_openTagEnd( offset, trailingFormat )
{
	try {

		this._sb.append( trailingFormat + ">" );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveAttributesScanner_closeTagBegin( tag, offset )
{
	try {

		this._sb.append( "</" + tag + ">" );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveAttributesScanner_attribute( name, code )
{
	var keepIt = true;
	try {
		var lowerName = name.toLowerCase();
		
		if ( this._onlyRemoveMSO || this._attributeLookup[ lowerName ] )
		{
			if ( lowerName == "style" )
			{
				var styles = Utils_ParseStyle( code );

				for( var style in styles )
				{
					if ( this._onlyRemoveMSO )
					{
						if (this._msoProperties[ style.toLowerCase() ] ||
							style.match( /^mso\-(.*?)/ ) ||
							style.match( /table-layout/ ) )
						{
							styles = Utils_DeleteArrayItem( style, styles );
						}
					}
					else if ( this._styleLookup[ style.toLowerCase() ] == null )
						styles = Utils_DeleteArrayItem( style, styles );
				}

				// Rebuild the style text

				code = Utils_BuildStyle( styles );
				if ( code.length == 0 )
					keepIt = false;
			}
			else if ( this._onlyRemoveMSO )
			{
				if ( lowerName.match( /^x:(.*?)/ ) || ( lowerName == "" && code.match( /^x:(.*?)/ ) ) )
				{
					// special Excel attribute; don't take it
					keepIt = false;
				}
				if ( lowerName.match( /^v:(.*?)/ ) )
				{
					// special powerpoint attribute; don't take it
					keepIt = false;
				}
				if ( this._tagName.toLowerCase() == "span" && lowerName.match( /lang/ ) )
				{
					// mac word sometimes puts extra span tags with unnecessary lang attribs
					keepIt = false;
				} 

			}

			if ( keepIt )
			{
				if ( name.length > 0 )
					this._sb.append( " " + name + "=" + handleAttributeText(code, this._fromDW) );
				else
					this._sb.append( " " + code );
			}
		}

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}


//---------------------------------------------------------------------------------------------------------
//  RemoveOnlyTheseTagsScanner
//---------------------------------------------------------------------------------------------------------

// The RemoveOnlyTheseTagsScanner removes only the specified tags from the given HTML stream.
// So given this HTML:
//
//    <html><body><p>This is <b>bold</b> and <i>italic</i></p></body></html>
//
// With a filter of { b: 1, i: 1 }, you would get:
//
//    <html><body><p>This is bold  and italic </p></body></html>

function RemoveOnlyTheseTagsScanner( tagLookup )
{
	this._tagLookup = tagLookup;
}

// External methods

RemoveOnlyTheseTagsScanner.prototype.scan = RemoveOnlyTheseTagsScanner_scan;

// scanSourceString specific methods

RemoveOnlyTheseTagsScanner.prototype.directive = RemoveOnlyTheseTagsScanner_directive;
RemoveOnlyTheseTagsScanner.prototype.text = RemoveOnlyTheseTagsScanner_text;
RemoveOnlyTheseTagsScanner.prototype.openTagBegin = RemoveOnlyTheseTagsScanner_openTagBegin;
RemoveOnlyTheseTagsScanner.prototype.openTagEnd = RemoveOnlyTheseTagsScanner_openTagEnd;
RemoveOnlyTheseTagsScanner.prototype.closeTagBegin = RemoveOnlyTheseTagsScanner_closeTagBegin;
RemoveOnlyTheseTagsScanner.prototype.attribute = RemoveOnlyTheseTagsScanner_attribute;

function RemoveOnlyTheseTagsScanner_scan( source, context )
{
	this._sb = context.createStringBuffer();
	this._inGoodTag = true;
	this._scan_error = false;
	this._fromDW = context.settingDefined( SETTINGS_DW_HTML );

	dw.scanSourceString( source, this, false );

	if ( this._scan_error )
		throw( "RemoveOnlyTheseTagsScanner bad scan" );

	return this._sb.get();
}

function RemoveOnlyTheseTagsScanner_directive( code, offset )
{
	try {

		this._sb.append( code );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveOnlyTheseTagsScanner_text( code, offset )
{
	try {
	
		this._sb.append( code );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveOnlyTheseTagsScanner_openTagBegin( tag, offset )
{
	try {

		if ( this._tagLookup[ tag.toLowerCase() ] )
			this._inGoodTag = false;
		else
			this._inGoodTag = true;

		if ( this._inGoodTag )
			this._sb.append( "<" + tag );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveOnlyTheseTagsScanner_openTagEnd( offset, trailingFormat )
{
	try {

		if ( this._inGoodTag )
			this._sb.append( trailingFormat + ">" );

		this._inGoodTag = true;

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveOnlyTheseTagsScanner_closeTagBegin( tag, offset )
{
	try {

		if ( this._tagLookup[ tag.toLowerCase() ] == null )
			this._sb.append( "</" + tag + ">" );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveOnlyTheseTagsScanner_attribute( name, code )
{
	try {

		if ( this._inGoodTag )
		{
			if ( name.length > 0 )
				this._sb.append( " " + name + "=" + handleAttributeText(code, this._fromDW) );
			else
				this._sb.append( " " + code );
		}
	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}



//---------------------------------------------------------------------------------------------------------
//  RemoveOnlyTheseAttributesScanner
//---------------------------------------------------------------------------------------------------------

// The RemoveOnlyTheseAttributesScanner removes just the specified attributes from ANY
// tag in the provided HTML string.  As an example, this HTML:
//
//    <html><body><p class=MsoNormal>Hello</p></body></html>
//
// With a filter of { 'class': 1 } would result in this HTML:
//
//    <html><body><p>Hello </p></body></html>

function RemoveOnlyTheseAttributesScanner( attributeLookup )
{
	this._attributeLookup = attributeLookup;
}

// External methods

RemoveOnlyTheseAttributesScanner.prototype.scan = RemoveOnlyTheseAttributesScanner_scan;

// scanSourceString specific methods

RemoveOnlyTheseAttributesScanner.prototype.directive = RemoveOnlyTheseAttributesScanner_directive;
RemoveOnlyTheseAttributesScanner.prototype.text = RemoveOnlyTheseAttributesScanner_text;
RemoveOnlyTheseAttributesScanner.prototype.openTagBegin = RemoveOnlyTheseAttributesScanner_openTagBegin;
RemoveOnlyTheseAttributesScanner.prototype.openTagEnd = RemoveOnlyTheseAttributesScanner_openTagEnd;
RemoveOnlyTheseAttributesScanner.prototype.closeTagBegin = RemoveOnlyTheseAttributesScanner_closeTagBegin;
RemoveOnlyTheseAttributesScanner.prototype.attribute = RemoveOnlyTheseAttributesScanner_attribute;

function RemoveOnlyTheseAttributesScanner_scan( source, context )
{
	this._sb = context.createStringBuffer();
	this._scan_error = false;
	this._fromDW = context.settingDefined( SETTINGS_DW_HTML );

	dw.scanSourceString( source, this, false );

	if ( this._scan_error )
		throw( "RemoveOnlyTheseAttributesScanner bad scan" );

	return this._sb.get();
}

function RemoveOnlyTheseAttributesScanner_directive( code, offset )
{
	try {

		this._sb.append( code );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveOnlyTheseAttributesScanner_text( code, offset )
{
	try {

		this._sb.append( code );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveOnlyTheseAttributesScanner_openTagBegin( tag, offset )
{
	try {

		this._sb.append( "<" + tag );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveOnlyTheseAttributesScanner_openTagEnd( offset, trailingFormat )
{
	try {

		this._sb.append( trailingFormat + ">" );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveOnlyTheseAttributesScanner_closeTagBegin( tag, offset )
{
	try {

		this._sb.append( "</" + tag + ">" );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveOnlyTheseAttributesScanner_attribute( name, code )
{
	if (this._onlyRemoveMSO)
		return true;

	try {

		if ( this._attributeLookup[ name.toLowerCase() ] == null )
		{
			if ( name.length > 0 )
				this._sb.append( " " + name + "=" + handleAttributeText(code, this._fromDW) );
			else
				this._sb.append( " " + code );
		}

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}



//---------------------------------------------------------------------------------------------------------
//  MapTagNamesScanner
//---------------------------------------------------------------------------------------------------------

// The MapTagNamesScanner is a very specialized scanner.  It takes a regular expression
// and maps any tag name that matches that expression to the given name.  For example,
// given this HTML:
//
// <html><body><h1>Level One</h1><h2>Level Two</h2></body></html>
//
// With matchCriteria = new Regexp( /h[12]/ ) and outName = "p", you would get:
//
// <html><body><p>Level One </p><p>Level Two </p></body></html>
//

function MapTagNamesScanner( matchCriteria, outName )
{
	this._matchCriteria = matchCriteria;
	this._outName = outName;
}

// External methods

MapTagNamesScanner.prototype.scan = MapTagNamesScanner_scan;

// scanSourceString specific methods

MapTagNamesScanner.prototype.directive = MapTagNamesScanner_directive;
MapTagNamesScanner.prototype.text = MapTagNamesScanner_text;
MapTagNamesScanner.prototype.openTagBegin = MapTagNamesScanner_openTagBegin;
MapTagNamesScanner.prototype.openTagEnd = MapTagNamesScanner_openTagEnd;
MapTagNamesScanner.prototype.closeTagBegin = MapTagNamesScanner_closeTagBegin;
MapTagNamesScanner.prototype.attribute = MapTagNamesScanner_attribute;

function MapTagNamesScanner_scan( source, context )
{
	this._sb = context.createStringBuffer();
	this._scan_error = false;
	this._fromDW = context.settingDefined( SETTINGS_DW_HTML );

	dw.scanSourceString( source, this, false );

	if ( this._scan_error )
		throw( "MapTagNamesScanner bad scan" );

	return this._sb.get();
}

function MapTagNamesScanner_directive( code, offset )
{
	try {

		this._sb.append( code );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function MapTagNamesScanner_text( code, offset )
{
	try {

		this._sb.append( code );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function MapTagNamesScanner_openTagBegin( tag, offset )
{
	try {

		if ( this._matchCriteria.exec( tag ) )
			tag = this._outName;
		this._sb.append( "<" + tag );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function MapTagNamesScanner_openTagEnd( offset, trailingFormat )
{
	try {

		this._sb.append( trailingFormat + ">" );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function MapTagNamesScanner_closeTagBegin( tag, offset )
{
	try {

		if ( this._matchCriteria.exec( tag ) )
			tag = this._outName;
		this._sb.append( "</" + tag + ">" );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function MapTagNamesScanner_attribute( name, code )
{
	try {
		if ( name.length > 0 )
			this._sb.append( " " + name + "=" + handleAttributeText(code, this._fromDW) );
		else
			this._sb.append( " " + code );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}


//---------------------------------------------------------------------------------------------------------
//  AddStylesScanner
//---------------------------------------------------------------------------------------------------------

// The AddStylesScanner is meant to do just that, add the specified styles to the tags
// of the type specified.  For example, with the following HTML:
//
// <html><body><p>Level One</p></body></html>
//
// Passing tagName = "p" and styles = { 'margin-top':0, 'margin-bottom':0 } you would get:
//
// <html><body><p style="margin-top:0;margin-bottom:0">Level One </p></body></html>
//

function AddStylesScanner( tagName, styles )
{
	this._tagName = tagName.toLowerCase();
	this._styles = styles;
}

// External methods

AddStylesScanner.prototype.scan = AddStylesScanner_scan;

// scanSourceString specific methods

AddStylesScanner.prototype.directive = AddStylesScanner_directive;
AddStylesScanner.prototype.text = AddStylesScanner_text;
AddStylesScanner.prototype.openTagBegin = AddStylesScanner_openTagBegin;
AddStylesScanner.prototype.openTagEnd = AddStylesScanner_openTagEnd;
AddStylesScanner.prototype.closeTagBegin = AddStylesScanner_closeTagBegin;
AddStylesScanner.prototype.attribute = AddStylesScanner_attribute;

function AddStylesScanner_scan( source, context )
{
	this._sb = context.createStringBuffer();
	this._fixup = false;
	this._foundStyle = false;
	this._scan_error = false;
	this._fromDW = context.settingDefined( SETTINGS_DW_HTML );

	dw.scanSourceString( source, this, false );

	if ( this._scan_error )
		throw( "AddStylesScanner bad scan" );

	return this._sb.get();
}

function AddStylesScanner_directive( code, offset )
{
	try {

		this._sb.append( code );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function AddStylesScanner_text( code, offset )
{
	try {

		this._sb.append( code );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function AddStylesScanner_openTagBegin( tag, offset )
{
	try {

		if ( this._tagName == tag.toLowerCase() )
			this._fixup = true;

		this._foundStyle = false;

		this._sb.append( "<" + tag );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function AddStylesScanner_openTagEnd( offset, trailingFormat )
{
	try {

		if ( this._fixup == true && this._foundStyle == false )
		{
			var code = Utils_BuildStyle( this._styles );

			this._sb.append( " style=\"" + code + "\"" );
		}

		this._sb.append( trailingFormat + ">" );

		this._fixup = false;

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function AddStylesScanner_closeTagBegin( tag, offset )
{
	try {

		this._sb.append( "</" + tag + ">" );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function AddStylesScanner_attribute( name, code )
{
	try {

		if ( this._fixup && name.toLowerCase() == "style" )
		{
			var styles = Utils_ParseStyle( code );

			for( var style in this._styles )
				styles[ style ] = this._styles[ style ];

			code = Utils_BuildStyle( styles );

			this._foundStyle = true;
		}

		if ( name.length > 0 )
			this._sb.append( " " + name + "=" + handleAttributeText(code, this._fromDW) );
		else
			this._sb.append( " " + code );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}




//---------------------------------------------------------------------------------------------------------
//  StructureScanner
//---------------------------------------------------------------------------------------------------------

// The StructureScanner is the most complex of all of the scanners.  Given proper HTML it will create an
// internal representation of the HTML using associative arrays and arrays, and then reconstruct the HTML
// while calling member functions (which can be overidden) at key points.
//
// Given this HTML:
//
// <html><body><p>This is a test</p></body></html>
//
// The internal representation would be:
//
// { type: 'root',
//   children: [
//     { type: 'tag',
//       tag: 'html',
//       attributes: {},
//       children: [
//         { type: 'tag',
//           tag: 'body',
//           attributes: {},
//           children: [
//             { type: 'tag',
//               tag: 'p',
//               attributes: {},
//               children: [
//                 { type: 'text',
//                   text: 'This is a test'
//                 }
//             }
//         }
//     }
// }

// The overide methods descibed below are called after the structure has been created, during
// the phase where the new HTML text is created.

// -- StructureScanner.prototype.inspectTag( tag )
//
//    tag - The root of this tag structure
//
// This is called first time the tag is seen during the creation phase.  Here you can alter
// the tag before it is sent to the output.  You can change the tag name, remove or add attributes,
// and alter the children from here on down.

// -- StructureScanner.prototype.startTag( tag )
//
//    tag - The root of this tag structure
//
// For tags (not text) start tag is created before the child nodes are turned into HTML.

// -- StructureScanner.prototype.createTag( tag, attributes, closed, openTrailingFormat )
//
//    tag - The tag name
//    attributes - The associative array of attributes
//    closed - true if the tag was both opened and closed officially (e.g. <p> and </p>)
//    openTrailingFormat - trailing format of the open tag (e.g. <p> has "", <img /> has " /")
//
// This is called to create the HTML for the tag.  This method does not need to handle the child
// nodes, those are handled by the structure parser (if you want to alter those see inspectTag.)
// The output from this should either be null (which means that StructureScanner should handle
// the tag) or an associative array with postfix and prefix attributes.  The postfix is how the
// tag should end and prefix is how the tag should start.

// -- StructureScanner.prototype.endTag( tag )
//
//    tag - The root of this tag structure
//
// The opposite number of start tag.

// -- StructureScanner.prototype.finalizeTag( tag, attributes, closed, childHTML )
//
//    tag - The tag name
//    attributes - The associative array of attributes
//    closed - true if the tag was both opened and closed officially (e.g. <p> and </p>)
//    childHTML - The finalized HTML of all of the children
//
// This is called as a final approval of the tag.  If false is returned then the tag (and all of
// it's children) are not added into the HTML stream.

function StructureScanner( ) { }

// External methods

StructureScanner.prototype.scan = StructureScanner_scan;

// scanSourceString methods

StructureScanner.prototype.directive = StructureScanner_directive;
StructureScanner.prototype.text = StructureScanner_text;
StructureScanner.prototype.openTagBegin = StructureScanner_openTagBegin;
StructureScanner.prototype.openTagEnd = StructureScanner_openTagEnd;
StructureScanner.prototype.closeTagBegin = StructureScanner_closeTagBegin;
StructureScanner.prototype.attribute = StructureScanner_attribute;

// Internal methods to build the structure

StructureScanner.prototype.addTextChild = StructureScanner_addTextChild;
StructureScanner.prototype.addTagChild = StructureScanner_addTagChild;
StructureScanner.prototype.addAttribute = StructureScanner_addAttribute;
StructureScanner.prototype.finishTag = StructureScanner_finishTag;
StructureScanner.prototype.buildHTML = StructureScanner_buildHTML;

// Methods to overide

StructureScanner.prototype.inspectTag = StructureScanner_inspectTag;
StructureScanner.prototype.startTag = StructureScanner_startTag;
StructureScanner.prototype.createTag = StructureScanner_createTag;
StructureScanner.prototype.finalizeTag = StructureScanner_finalizeTag;
StructureScanner.prototype.endTag = StructureScanner_endTag;

function StructureScanner_addTextChild( text )
{
	if (this._curTag)
		this._curTag.children.push( { type: "text", text: text } );
}

function StructureScanner_addTagChild( tag )
{
	var node = { type: "tag", tag: tag, attributes: {}, children: [], closed: false, openTrailingFormat: "" };
	this._curTag.children.push( node );
	this._curTag = node;
	this._opStack.push( node );
}

function StructureScanner_addAttribute( name, value )
{
	this._curTag.attributes[ name ] = value;
}

function StructureScanner_finishTag( tag )
{
	var lowerTag = tag.toLowerCase();

	// first see if there's a matching tag on the stack
	var stackIndex = this._opStack.length - 1;
	var stackTag;
	var foundMatch = false;

	while ( stackIndex >= 0 )
	{
		stackTag = this._opStack[ stackIndex ];
		if (stackTag == null || stackTag.tag == null)
		{
			break;
		}
		else
		{
			if ( stackTag.tag.toLowerCase() == lowerTag )
			{
				foundMatch = true;
				break;
			}
			stackIndex--;
		}
	}

	if (foundMatch)
	{
		this._curTag = this._opStack[ stackIndex - 1 ];
		this._opStack.length = stackIndex;
		stackTag.closed = true; // how can this matter???
	}
}

function StructureScanner_buildHTML( tag )
{
	this.inspectTag( tag );

	var prefix = "";
	var postfix = "";
	var childHTML = "";

	if ( tag.type == "text" )
	{
		prefix = tag.text;
	}
	else
	{
		this.startTag( tag );
	
		if ( tag.type == "tag" )
		{
			if ( tag.tag == "span" && tag.children.length == 0 )
			{
				tag.children.push( { type: "text", text: " " } );
			}

			var retVal = this.createTag( tag.tag, tag.attributes, tag.closed, tag.openTrailingFormat );

			if ( retVal == null )
				retVal = StructureScanner_createTag( tag.tag, tag.attributes, tag.closed, tag.openTrailingFormat );

			prefix = retVal.prefix;
			postfix = retVal.postfix;
		}

		for( var index in tag.children )
			childHTML += this.buildHTML( tag.children[ index ] );
			
		this.endTag( tag );

		if ( this.finalizeTag( tag.tag, tag.attributes, tag.closed, childHTML ) == false )
		{
			prefix = "";
			childHTML = "";
			postfix = "";
		}
	}

	return prefix + childHTML + postfix;
}

function StructureScanner_finalizeTag( tag ) { return true; }

function StructureScanner_startTag( tag ) { }

function StructureScanner_endTag( tag ) { }

function StructureScanner_inspectTag( tag ) { return tag; }

function StructureScanner_createTag( tag, attributes, closed, openTrailingFormat )
{
	var prefix = "";
	var postfix = "";

	prefix = "<" + tag;
	for( var key in attributes )
	{
		if ( attributes[ key ] != null )
		{
			if (key.length == 0)
				prefix += " " + attributes[ key ];
			else
				prefix += " " + key + "=" + handleAttributeText(attributes[ key ], true);
		}
	}
	prefix += openTrailingFormat + ">";

	if ( closed )
	{
		postfix = "</" + tag + ">";
	}

	return { prefix: prefix, postfix: postfix };
}

function StructureScanner_scan( source )
{
	var rootTag = { type: "root", children: [] };
	this._curTag = rootTag;
	this._opStack = [ this._curTag ];
	this._scan_error = false;

	dw.scanSourceString( source, this, false );

	if ( this._scan_error )
		throw( "StructureScanner bad scan" );

	var html = "";

	html = this.buildHTML( rootTag );

	return html;
}

function StructureScanner_directive( code, offset )
{
	try {

		this.addTextChild( code );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function StructureScanner_text( code, offset )
{
	try {

		this.addTextChild( code );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function StructureScanner_openTagBegin( tag, offset )
{
	try {

		this.addTagChild( tag );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function StructureScanner_openTagEnd( offset, trailingFormat )
{
	try {
		this._curTag.openTrailingFormat = trailingFormat;

	} catch( e ) {
		this._scan_error = true;
		return false;
	}

	return true;
}

function StructureScanner_closeTagBegin( tag, offset )
{
	try {

		this.finishTag( tag );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function StructureScanner_attribute( name, code )
{
	try {

		this.addAttribute( name, code );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}




//---------------------------------------------------------------------------------------------------------
//  RemoveHiddenSpansScanner
//---------------------------------------------------------------------------------------------------------

// This scanner is specific to MS products.  This removes any DIV tags within the document.

function RemoveHiddenSpansScanner( )
{
}

// External methods

RemoveHiddenSpansScanner.prototype.scan = RemoveHiddenSpansScanner_scan;

// scanSourceString specific methods

RemoveHiddenSpansScanner.prototype.directive = RemoveHiddenSpansScanner_directive;
RemoveHiddenSpansScanner.prototype.text = RemoveHiddenSpansScanner_text;
RemoveHiddenSpansScanner.prototype.openTagBegin = RemoveHiddenSpansScanner_openTagBegin;
RemoveHiddenSpansScanner.prototype.openTagEnd = RemoveHiddenSpansScanner_openTagEnd;
RemoveHiddenSpansScanner.prototype.closeTagBegin = RemoveHiddenSpansScanner_closeTagBegin;
RemoveHiddenSpansScanner.prototype.attribute = RemoveHiddenSpansScanner_attribute;

function RemoveHiddenSpansScanner_scan( source, context )
{
	this._sb = context.createStringBuffer();
	this._attributes = [];
	this._hiddenSpanDepth = 0;
	this._tag = "";
	this._scan_error = false;
	this._fromDW = context.settingDefined( SETTINGS_DW_HTML );

	dw.scanSourceString( source, this, false );

	if ( this._scan_error )
		throw( "RemoveHiddenSpansScanner bad scan" );

	return this._sb.get();
}

function RemoveHiddenSpansScanner_directive( code, offset )
{
	try {

		if ( this._hiddenSpanDepth == 0 )
			this._sb.append( code );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveHiddenSpansScanner_text( code, offset )
{
	try {

		if ( this._hiddenSpanDepth == 0 )
			this._sb.append( code );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveHiddenSpansScanner_openTagBegin( tag, offset )
{
	try {

		this._tag = tag;
		this._attributes = [];

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveHiddenSpansScanner_openTagEnd( offset, trailingFormat )
{
	try {

		if ( this._hiddenSpanDepth == 0 )
		{
			if ( ( this._tag == "span" && this._attributes[ "style" ] ) )
			{
				if ( this._attributes[ "style" ].match( /display:none/ ) )
				{
					this._hiddenSpanDepth = 1;
				}
			}

			if ( ( this._tag == "p" && this._attributes[ "class" ] ) )
			{
				if ( this._attributes[ "class" ].match( /MsoCommentText/ ) )
				{
					this._hiddenSpanDepth = 1;
				}
			}
			
			if ( ( this._tag == "span" && this._attributes[ "class" ] ) )
			{
				if ( this._attributes[ "class" ].match( /MsoCommentReference/ ) )
				{
					this._hiddenSpanDepth = 1;
				}
			}

			if ( this._hiddenSpanDepth == 0 )
			{
				this._sb.append( "<" + this._tag );
				for( key in this._attributes )
				{
					if ( key.length > 0 )
					{
						this._sb.append( " " + key + "=" + handleAttributeText(this._attributes[ key ], this._fromDW) );
					}
					else
					{
						this._sb.append( " " + this._attributes[ key ] );
					}
				}
				this._sb.append( trailingFormat + ">" );
			}
		}
		else
			this._hiddenSpanDepth++;


	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveHiddenSpansScanner_attribute( name, code )
{
	try {

		if ( this._hiddenSpanDepth == 0 )
			this._attributes[ name ] = code;

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function RemoveHiddenSpansScanner_closeTagBegin( tag, offset )
{
	try {

		if ( this._hiddenSpanDepth == 0 )
		{
			this._sb.append( "</" + tag + ">" );
		}
		else
		{
			this._hiddenSpanDepth--;
		}

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}



//---------------------------------------------------------------------------------------------------------
//  RemoveObsoleteClassRefsScanner
//
//---------------------------------------------------------------------------------------------------------

// This scanner removes references (class attributes) to classes that are obsolete
// (because they have been removed).

function RemoveObsoleteClassRefsScanner( obsoleteClasses )
{
	this.obsoleteClasses = obsoleteClasses;
}

// scanSourceString specific methods

RemoveObsoleteClassRefsScanner.prototype.scan = RemoveObsoleteClassRefsScanner_scan;
RemoveObsoleteClassRefsScanner.prototype.directive = RemoveObsoleteClassRefsScanner_directive;
RemoveObsoleteClassRefsScanner.prototype.text = RemoveObsoleteClassRefsScanner_text;
RemoveObsoleteClassRefsScanner.prototype.openTagBegin = RemoveObsoleteClassRefsScanner_openTagBegin;
RemoveObsoleteClassRefsScanner.prototype.openTagEnd = RemoveObsoleteClassRefsScanner_openTagEnd;
RemoveObsoleteClassRefsScanner.prototype.closeTagBegin = RemoveObsoleteClassRefsScanner_closeTagBegin;
RemoveObsoleteClassRefsScanner.prototype.attribute = RemoveObsoleteClassRefsScanner_attribute;

function RemoveObsoleteClassRefsScanner_scan( source, context )
{
	this._sb = context.createStringBuffer();
	this._fromDW = context.settingDefined( SETTINGS_DW_HTML );

	dw.scanSourceString( source, this, false );
	
	if ( this._scan_error )
		throw( "RemoveObsoleteClassRefsScanner_scan bad scan" );

	return this._sb.get();
}

function RemoveObsoleteClassRefsScanner_directive( code, offset )
{
	try {
		this._sb.append( code );
	} catch( e ) {
		this._scan_error = true;
		return false;
	}

	return true;
}

function RemoveObsoleteClassRefsScanner_text( code, offset )
{
	try {
		this._sb.append( code );
	} catch( e ) {
		this._scan_error = true;
		return false;
	}

	return true;
}

function RemoveObsoleteClassRefsScanner_openTagBegin( tag, offset )
{
	try {
		this._sb.append( "<" + tag );
	} catch( e ) {
		this._scan_error = true;
		return false;
	}

	return true;
}

function RemoveObsoleteClassRefsScanner_openTagEnd( offset, trailingFormat )
{
	try {
		this._sb.append( trailingFormat + ">" );
	} catch( e ) {
		this._scan_error = true;
		return false;
	}

	return true;
}

function RemoveObsoleteClassRefsScanner_closeTagBegin( tag, offset )
{
	try {
		this._sb.append( "</" + tag + ">" );
	} catch( e ) {
		this._scan_error = true;
		return false;
	}

	return true;
}

function RemoveObsoleteClassRefsScanner_attribute( name, code )
{
	var keepIt = true;
	try {
		var lowerName = name.toLowerCase();
				
		if ( lowerName == "class" )
		{
			// find the next word (space delimited)
			var pattern = /\s+/;
			var classes = code.split(pattern);
			code = "";
			keepIt = false;
			var firstClass = true;
			for ( var c in classes )
			{
				if ( this.obsoleteClasses[ classes[c] ] == null )
				{
					if (firstClass)
						firstClass = false;
					else
						code += " ";
					code += classes[c];
					keepIt = true;
				}
			}
		}

		if ( keepIt )
		{
			if ( name.length > 0 )
				this._sb.append( " " + name + "=" + handleAttributeText(code, this._fromDW) );
			else
				this._sb.append( " " + code );
		}

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

//---------------------------------------------------------------------------------------------------------
//  FixWordParagraphSpacingScanner
//---------------------------------------------------------------------------------------------------------

function FixWordParagraphSpacingScanner( ) { }

FixWordParagraphSpacingScanner.prototype.scan = FixWordParagraphSpacingScanner_scan;

// scanSourceString specific methods

FixWordParagraphSpacingScanner.prototype.directive = FixWordParagraphSpacingScanner_directive;
FixWordParagraphSpacingScanner.prototype.text = FixWordParagraphSpacingScanner_text;
FixWordParagraphSpacingScanner.prototype.openTagBegin = FixWordParagraphSpacingScanner_openTagBegin;
FixWordParagraphSpacingScanner.prototype.openTagEnd = FixWordParagraphSpacingScanner_openTagEnd;
FixWordParagraphSpacingScanner.prototype.closeTagBegin = FixWordParagraphSpacingScanner_closeTagBegin;
FixWordParagraphSpacingScanner.prototype.attribute = FixWordParagraphSpacingScanner_attribute;
FixWordParagraphSpacingScanner.prototype.debug = FixWordParagraphSpacingScanner_debug;
FixWordParagraphSpacingScanner.prototype.noLongerEmpty = FixWordparagraphSpacingScanner_noLongerEmpty;

function FixWordParagraphSpacingScanner_debug()
{
	dw.trace("openParTag:\t\t" + this.openParTag + "\ntextInsidePar:\t" + this.textInsidePar + "\ncloseParTag:\t" + this.closeParTag + "\ntextAfterClosePar:\t|" + this.textAfterClosePar + "|\n\n");
}

function FixWordParagraphSpacingScanner_scan( source, context )
{
	this.removedLastPar = false;
	this.haveEmptyPar = false;
	this.openParTag = "";
	this.closeParTag = "";
	this.afterClosePar = false;
	this.textAfterClosePar = "";
	this.textInsidePar = "";
	this._fromDW = context.settingDefined( SETTINGS_DW_HTML );
	this._sb = context.createStringBuffer();

	dw.scanSourceString( source, this, false );
	
	if ( this._scan_error )
		throw( "FixWordParagraphSpacingScanner_scan bad scan" );

	return this._sb.get();
}

function FixWordparagraphSpacingScanner_noLongerEmpty( code )
{
	this.haveEmptyPar = false;
	var codeToAppend = "";
	
	if (this.afterClosePar)
	{
		// we're in a non-empty P immediately after another P; merge them with a BR
		codeToAppend = "<br>" + this.textAfterClosePar + this.textInsidePar + code;
		this.afterClosePar = false;
	}
	else
	{
		// we're in a non-empty P that really is a new P; close the previous one, etc.
		codeToAppend = this.closeParTag + this.textAfterClosePar + this.openParTag + this.textInsidePar + code;
	}

	this.closeParTag = "";
	this.textAfterClosePar = "";
	this.openParTag = "";
	this.textInsidePar = "";

	try {
		this._sb.append( codeToAppend );
	} catch( e ) {
		this._scan_error = true;
		return false;
	}

	return true;
}

function FixWordParagraphSpacingScanner_directive( code, offset )
{
	if (this.afterClosePar)
	{
		this.textAfterClosePar += code;
		return true;
	}
	try {
		this._sb.append( code );
	} catch( e ) {
		this._scan_error = true;
		return false;
	}

	return true;
}

function FixWordParagraphSpacingScanner_text( code, offset )
{
	var codeToAppend = "";

	// If have non-empty text and haven't appended P tag yet, do that.
	// If in paragraph and this *is* empty text, keep track
	if (this.haveEmptyPar)
	{
		if (code.toLowerCase() == "&nbsp;")
		{
			this.textInsidePar += code;
			return true;
		}
		else 
		{
			return this.noLongerEmpty( code );
		}
	}
	else if (this.afterClosePar)
	{
		// If the text is just whitespace, keep track, in case we merge the previous paragraph with the next one.
		var nonWhiteText = Utils_StripWhitespace( code );
		if (nonWhiteText.length == 0)
		{
			this.textAfterClosePar += code;
			return true;
		}
		else
		{
			// otherwise, go ahead and close the P, and proceed normally
			codeToAppend = this.closeParTag + code;
			this.closeParTag = "";
			this.afterClosePar = false;
			this.textAfterClosePar = "";
		}
	}
	else
		codeToAppend = code;

	try {
		this._sb.append( codeToAppend );
	} catch( e ) {
		this._scan_error = true;
		return false;
	}

	return true;
}

function FixWordParagraphSpacingScanner_openTagBegin( tag, offset )
{
	var codeToAppend = "";
	var lowerTag = tag.toLowerCase();

	if ( lowerTag == "p" )
	{
		this.haveEmptyPar = true;
		this.openParTag += "<" + tag;
		return true;
	}
	else if ( this.haveEmptyPar )
	{
		if ( CONTENT_TAGS [ lowerTag ] > 0 )
			return this.noLongerEmpty("<" + tag);
		else
		{
			this.textInsidePar += "<" + tag;
			return true;
		}
	}
	else
	{
		if (lowerTag == "td" || lowerTag == "th" )
			this.removedLastPar = true; // so don't remove single empty P in every other cell
		if ( this.closeParTag.length > 0)
			codeToAppend += this.closeParTag;
		if ( this.textAfterClosePar.length > 0)
			codeToAppend += this.textAfterClosePar;
		codeToAppend += "<" + tag;
		this.closeParTag = "";
		this.textAfterClosePar = "";
	}
	
	this.openParTag = "";
	try {
		this._sb.append( codeToAppend );
	} catch( e ) {
		this._scan_error = true;
		return false;
	}

	return true;
}

function FixWordParagraphSpacingScanner_openTagEnd( offset, trailingFormat )
{
//this.debug();

	if (this.openParTag.length > 0)
	{
		if (this.textInsidePar.length == 0)
		{
			this.openParTag += trailingFormat + ">";
		}
		else
		{
			this.textInsidePar += trailingFormat + ">";	
		}
		return true;
	}

	try {
		this._sb.append( trailingFormat + ">" );
	} catch( e ) {
		this._scan_error = true;
		return false;
	}

	return true;
}

function FixWordParagraphSpacingScanner_closeTagBegin( tag, offset )
{
	var thisCloseTag = "</" + tag + ">";
	var codeToAppend = thisCloseTag;
	var lowerTag = tag.toLowerCase();

	// if we're closing
	if ( this.haveEmptyPar && !this.removedLastPar )
	{
		if ( lowerTag == "p" )
		{
			this.afterClosePar = false;
			this.haveEmptyPar = false;
			this.removedLastPar = true;
			this.openParTag = "";
			this.textInsidePar = "";

			if ( this.closeParTag.length > 0)
			{
				// if we didn't yet close the *previous* p tag, do it now
				codeToAppend = this.closeParTag;
				codeToAppend += this.textAfterClosePar;
				this.closeParTag = "";
				this.textAfterClosePar = "";
				this.afterClosePar = false;
			}
			else
				return true;
		}
		else
		{
			this.textInsidePar += codeToAppend;
			return true;
		}
	}
	else if (lowerTag == "p" )
	{
		if ( this.haveEmptyPar )
		{
			// we need to keep this empty one, because we removed the one before			
			codeToAppend = this.closeParTag + this.textAfterClosePar + this.openParTag + this.textInsidePar;
			this.removedLastPar = false;
			this.closeParTag = "";
			this.textAfterClosePar = "";
			this.openParTag = "";
			this.textInsidePar = "";
			this.haveEmptyPar = false;
			this.afterClosePar = false;

			codeToAppend += thisCloseTag;
		}
		else
		{
			// don't close the P right away; wait to see what's next
			this.removedLastPar = false;
			this.afterClosePar = true;
			this.textAfterClosePar = "";
			this.closeParTag = codeToAppend;
			return true;
		}
	}
	else
	{
		// we're closing something other than a P tag, so clean up any unclosed P first
		if ( this.openParTag.length > 0)
		{
			this.textInsidePar += thisCloseTag;
			return true;
		}
		else if ( this.afterClosePar )
		{
			codeToAppend = this.closeParTag + this.textAfterClosePar;
			codeToAppend += thisCloseTag;
			this.afterClosePar = false;
			this.closeParTag = "";
			this.textAfterClosePar = "";
		}
	}
		
	try {
		this._sb.append( codeToAppend );
	} catch( e ) {
		this._scan_error = true;
		return false;
	}

	return true;
}

function FixWordParagraphSpacingScanner_attribute( name, code )
{
	var attribStr = "";
	
	if ( name.length > 0 )
		attribStr = " " + name + "=" + handleAttributeText(code, this._fromDW);
	else
		attribStr = " " + code;

	if (this.openParTag.length > 0)
	{
		if ( this.textInsidePar.length == 0 )
			this.openParTag += attribStr;
		else
			this.textInsidePar += attribStr;

		return true;
	}

	try {
		if ( name.length > 0 )
			this._sb.append(attribStr);
		else
			this._sb.append(attribStr);
	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}




//---------------------------------------------------------------------------------------------------------
//  DebugScanner
//---------------------------------------------------------------------------------------------------------

function DebugScanner( )
{
}

// External methods

DebugScanner.prototype.scan = DebugScanner_scan;

// scanSourceString specific methods

DebugScanner.prototype.directive = DebugScanner_directive;
DebugScanner.prototype.text = DebugScanner_text;
DebugScanner.prototype.openTagBegin = DebugScanner_openTagBegin;
DebugScanner.prototype.openTagEnd = DebugScanner_openTagEnd;
DebugScanner.prototype.closeTagBegin = DebugScanner_closeTagBegin;
DebugScanner.prototype.attribute = DebugScanner_attribute;

function DebugScanner_scan( source )
{
	this._exceptionTag = false;
	this._scan_error = false;

	dw.scanSourceString( source, this, false );

	if ( this._scan_error )
		throw( "DebugScanner bad scan" );
}

function DebugScanner_directive( code, offset )
{
	try {

		alert( "directive( " + code + ", " + offset + " )" );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function DebugScanner_text( code, offset )
{
	try {

		alert( "text( " + code + ", " + offset + " )" );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function DebugScanner_openTagBegin( tag, offset )
{
	try {

		alert( "openTagBegin( " + tag + ", " + offset + " )" );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function DebugScanner_openTagEnd( offset, trailingFormat )
{
	try {

		alert( "openTagEnd( " + offset + ", " + trailingFormat + " )" );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function DebugScanner_closeTagBegin( tag, offset )
{
	try {

		alert( "closeTagBegin( " + tag + ", " + offset + " )" );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

function DebugScanner_attribute( name, code )
{
	try {
	
		alert( "attribute( " + name + ", " + handleAttributeText(code, true) + " )" );

	} catch( e ) {

		this._scan_error = true;
		return false;

	}

	return true;
}

