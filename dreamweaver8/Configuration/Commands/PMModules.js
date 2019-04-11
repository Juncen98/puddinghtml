//=========================================================================================================
//
// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
//
// Feature: Paste Fix
// Author:  JDH
// Module:  PMModules.js
// Purpose:	The modules for the Paste Fix pipeline.
// Updates:
//	5/17/02 - Started file control
//  5/30/02 - Added performance upgrade enhancements
//  5/31/02 - Added extensive comments
//  6/3/02 - Added support for STRONG and EM, as well as more comments
//
//=========================================================================================================


// The main purpose of the the Paste Fix system is to provide an adaptable filter to take vendor specific
// HTML and massage it into HTML that is reasonable, readable, effecient, and very importantly, editable in
// the host MM application.  To that end we apply a series of scanners and filter to the HTML in a specific
// series. The scanners analyze the document, looking for signatures, so that the filters can act more
// specifically.  The filters both remove and alter the HTML to match needs of the application, and the current
// security settings.

// Filters come in two main flavors; cleaning filters, and conversion filters.  Cleaning filters simply remove
// tags, attributes, styles, directives, and content that is not editable, or required by, the host application.
// Conversion filters analyze the tags and attempt to recreate the same effect as the vendor specific tag with
// standard HTML.  For example, if a TD tag references a class, we look at the tag and the class, and create a
// series of font, bold, italic, etc. tags to recreate the effect of the class. This makes the document more easily
// editable by standard HTML editors.

// The key point here is that the whole system is designed to remove what it doesn't understand.  So to add new
// items that the system will understand you will most likely have to add support in several places.  For example,
// to add support for borders around tables you will need to make sure the style filter (if you implement the
// borders as styles) does not filter out the styles you have just added.  To do this you add style specifications
// to some of the global tables below.

// If your intent is to add a new security mode then you will most likely have to touch the run method of
// every filter to either bring it into the stream when your mode is ON, or remove it from the stream when
// your mode is on.  In addition you may have to create new sets of tag, attribute or style filters like those
// in the globals section. The ETO mode is an example here.  In the basic case the 'NORMAL' tag retention
// settings are used, and in ETO mode the ETO tag retention set is used.


//=========================================================================================================
// Globals
//=========================================================================================================

// Listed below are sets of tag, attributes and styles that are either to be remove or retained through
// the operation of the filter.  Each associative array, or nested set of associative array, is used to
// configure a filter.

// NOTE: Associative arrays were used here to speed up access in the filters.  The value of '1' is used
// simply as a placeholder and has no semantic value in any case.


// The list of tags that will be retained in the normal operating mode of the filter
var RETAIN_TAGS_NORMAL = {
	html: 1, body: 1,
	table: 1, caption: 1, td: 1, tr: 1, thead: 1, tfoot: 1, tbody: 1,
	span: 1, b: 1, i: 1, p: 1,
	ul: 1, li: 1, ol: 1, div: 1,
	h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1,
	img: 1, a: 1, br: 1
};

// The list of tags that will be retained in the low operating mode of the filter
var RETAIN_TAGS_LOW = {
	html: 1, body: 1,
	table: 1, caption: 1, td: 1, tr: 1, thead: 1, tfoot: 1, tbody: 1,
	b: 1, i: 1, p: 1, div: 1,
	ul: 1, li: 1, ol: 1,
	h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1,
	img: 1, a: 1, br: 1
};

// The list of tags that will be retained in the "text with structure" mode of the filter
var RETAIN_TAGS_STRUCTURE = {
	html: 1, body: 1,
	p: 1, address: 1, h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1,
	table: 1, caption: 1, tr: 1, td: 1, th: 1, tbody: 1, thead: 1, tfoot: 1, col: 1, colgroup: 1,
	ol: 1, ul: 1, li: 1, dl: 1, dt: 1, dd: 1, dir: 1, menu: 1,
	div: 1, center: 1, bdo: 1, blockquote: 1, pre: 1,
	a: 1
};

// The list of tags that will be retained in the "basic formatting" mode of the filter
var RETAIN_TAGS_BASIC = {
	html: 1, body: 1,
	p: 1, address: 1, h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1,
	table: 1, caption: 1, tr: 1, td: 1, th: 1, tbody: 1, thead: 1, tfoot: 1, col: 1, colgroup: 1,
	ol: 1, ul: 1, li: 1, dl: 1, dt: 1, dd: 1, dir: 1, menu: 1,
	div: 1, center: 1, bdo: 1, blockquote: 1, pre: 1,
	a: 1,
	applet: 1, iframe: 1, img: 1, object: 1, param: 1, embed: 1,
	map: 1, area: 1,
	form: 1, input: 1, button: 1, select: 1, optgroup: 1, option: 1,
	textarea: 1, isindex: 1, label: 1, fieldset: 1, legend: 1,
	b: 1, i: 1, u: 1, strong: 1, em: 1,
	abbr: 1, acronym: 1, hr: 1, span: 1
};

// The list of tags that will be retained in the "full formatting" mode of the filter
var RETAIN_TAGS_FULL = {
	html: 1, body: 1,
	p: 1, address: 1, h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1,
	table: 1, caption: 1, tr: 1, td: 1, th: 1, tbody: 1, thead: 1, tfoot: 1, col: 1, colgroup: 1,
	ol: 1, ul: 1, li: 1, dl: 1, dt: 1, dd: 1, dir: 1, menu: 1,
	div: 1, center: 1, bdo: 1, blockquote: 1, pre: 1,
	a: 1,
	applet: 1, iframe: 1, img: 1, object: 1, param: 1, embed: 1,
	map: 1, area: 1,
	form: 1, input: 1, button: 1, select: 1, optgroup: 1, option: 1,
	textarea: 1, isindex: 1, label: 1, fieldset: 1, legend: 1,
	b: 1, i: 1, u: 1, strong: 1, em: 1,
	abbr: 1, acronym: 1, hr: 1, span: 1,
	big: 1, small: 1, del: 1, ins: 1,
	s: 1, strike: 1, q: 1, tt: 1, cite: 1, code: 1,
	dfn: 1, kbd: 1, samp: 1, 'var': 1, sub: 1, sup: 1,
	basefont: 1, font: 1
};

// The list of tags that will be retained in the ETO mode of the filter
var RETAIN_TAGS_ETO = {
	html: 1, body: 1, p: 1
};

// The list of tags that will be retained in the TEXT mode of the filter
var RETAIN_TAGS_TEXT = {
	html: 1, body: 1
};

// The list of tags for various server models, that don't start with predictable prefices (like cf*, asp:* etc)
var RETAIN_TAGS_SERVER = {
	alternatingitemstyle : 1,
	alternatingitemtemplate : 1,
	columns : 1,
	contentstemplate : 1,
	edititemstyle : 1,
	edititemtemplate : 1,
	editops : 1,
	editopstable : 1,
	failuretemplate : 1,
	footerstyle : 1,
	footertemplate : 1,
	headerstyle : 1,
	headertemplate : 1,
	itemstyle : 1,
	itemtemplate : 1,
	pagerstyle : 1,
	parameter : 1,
	parameters : 1,
	selecteditemstyle : 1,
	selecteditemtemplate : 1,
	separatortemplate : 1,
	successtemplate : 1,
	tableitemstyle : 1,
	tablestyle : 1,
};

// Some tags will want to be retained through the midsection of the filter, but removed at the end.
// Those tags are listed here.

// For content from word, remove thead tags
var PRS_REMOVE_TAGS_WORD = {
	thead: 1
};

// These tags are to removed if they have no attributes.

var PRS_REMOVE_IF_NO_ATTRIBUTES = {
	span: 1, font: 1, 'a': 1
};

// Tags listed here are supposed to be removed if they contain no interior.

var PRS_REMOVE_IF_EMPTY = {
	p: 1, em: 1, i: 1, strong: 1, bold: 1
};

// The tags that the Decomposer should not inspect

var DC_IGNORE_TAGS = { img: 1, col: 1, br: 1 };


// These are the attributes to be retained for each type of tag.  The primary key is the tag name
// (coerced to lower case), then within that entry there should be an associative array where the
// keys are the attributes to be retained.

var RUA_TAG_SPECIFIC_ATTRIBUTES = {
	span: { style: 1 },
	font: { style: 1, face: 1, size: 1 },
	ul: { style: 1 },
	ol: { style: 1 },
	li: { },
	td: { 'width': 1, 'bgcolor': 1, 'align': 1, 'valign': 1, 'colspan': 1, 'rowspan': 1 },
	th: { 'width': 1, 'bgcolor': 1, 'align': 1, 'valign': 1, 'scope': 1 },
	table: { cellspacing: 1, cellpadding: 1 },
	p: { align: 1, 'class': 1, style: 1 },
	img: { src: 1, height: 1, width: 1, alt: 1 },
	a: { href: 1, name: 1 }
};

// Within the style attribute of any tag you can specify what values are to be retained through the
// filter.  If your attribute isn't listed here then it will be stripped by the filter, so you will
// want to add an entry here for the tag and for the specific style attribute.

var RUA_TAG_SPECIFIC_STYLES = {
	font: { "font-family": 1, "font-size": 1, "color": 1 },
	span: { "font-family": 1, "font-size": 1, "color": 1 },
	p: { }
};

// These are Microsoft Office css properties that aren't generally supported.
var MSO_CSS_PROPERTIES = {
	"tab-stops":1
};

// These are for removing the "magic" comments that Dreamweaver inserts for templates, etc.
 
var DW_MAGIC_COMMENTS = {
	templatebegineditable: 1,
	templateendeditable: 1,
	templateparam: 1,
	templatebeginrepeat: 1,
	templateendrepeat: 1,
	templatebeginpassthroughrepeat: 1,
	templateendpassthroughrepeat: 1,
	templatebeginif: 1,
	templateendif: 1,
	templatebeginpassthroughif: 1,
	templateendpassthroughif: 1,
	templatebeginmultipleif: 1,
	templateendmultipleif: 1,
	templatebeginpassthroughmultipleif: 1,
	templateendpassthroughmultipleif: 1,
	templatebeginifclause: 1,
	templateendifclause: 1,
	templatebeginpassthroughifclause: 1,
	templateendpassthroughifclause: 1,
	templateexpr: 1,
	templatepassthroughexpr: 1,
	templateinfo: 1,
	instancebegineditable: 1,
	instanceendeditable: 1,
	instanceparam: 1,
	instancebeginrepeat: 1,
	instanceendrepeat: 1,
	instancebeginrepeatentry: 1,
	instanceendrepeatentry: 1,
	instancebegin: 1,
	instanceend: 1,
	"#beginvariablelibraryitem": 1,
	"#beginlibraryitem": 1,
	"#endvariablelibraryitem": 1,
	"#endlibraryitem": 1,
	"#begindate": 1,
	"#enddate": 1
};

//=========================================================================================================
// Filter modules
//=========================================================================================================


//---------------------------------------------------------------------------------------------------------
// ParseMetaTags
//---------------------------------------------------------------------------------------------------------

// The ParseMetaTags module finds all of the meta tags and puts that information
// into the context.

function ParseMetaTags() { }

// The module API

ParseMetaTags.prototype.run = ParseMetaTags_run;
ParseMetaTags.prototype.getPhase = ParseMetaTags_getPhase;

function ParseMetaTags_run( context )
{
	// Ignore non-HTML content
	
	if ( context.getContentType() != CONTENT_TYPE_HTML )
		return true;

	context.debugInformation( "ParseMetaTags", ">> run" );

	// Build the meta tag scanner

	var metaParser = new GetMetaTagsScanner();

	var metaTags = metaParser.scan( context.getClipText() );

	// Set the context with the current value of the meta tags

	for( var key in metaTags )
	{
		context.setMeta( key, metaTags[ key ] );
	}

	context.debugInformation( "ParseMetaTags", "<< run" );

	return true;
}

function ParseMetaTags_getPhase() { return PHASE_PARSE_META_TAGS; }


//---------------------------------------------------------------------------------------------------------
// FixupMSGarbage
//---------------------------------------------------------------------------------------------------------

// FixupMSGarbage fixes various problems with the HTML generated by the MSWordProcessingApplication
// and the MSSpreadsheetApplication.

function FixupMSGarbage() { }

// The module API

FixupMSGarbage.prototype.run = FixupMSGarbage_run;
FixupMSGarbage.prototype.getPhase = FixupMSGarbage_getPhase;

function FixupMSGarbage_run( context )
{
	// Dump out if we are not filter
	if ( context.settingDefined( SETTINGS_NO_FILTER ) )
		return true;

	// If we have content from word, force "retain line breaks", unless textonly
	if ( context.getOriginApplication() == "word" && !context.settingDefined(SETTINGS_TEXT))
		context.setSetting( SETTINGS_RETAIN_BRS, 1 );

var debugStr = "in FixupMSGarbage - pasteSettings: " + dw.getPasteSettings();
if ( context.settingDefined(SETTINGS_RETAIN_BRS) ) debugStr += "\nretain line breaks"; else debugStr += "\nDO NOT retain line breaks";
if ( context.settingDefined(SETTINGS_CLEANUP_WORD_PARS) ) debugStr += "\ncleanup word paragraphs"; else debugStr += "\nDO NOT cleanup word paragraphs";
//alert(debugStr);

	
	// Ignore non-HTML content
	
	if ( context.getContentType() != CONTENT_TYPE_HTML )
		return true;

	context.debugInformation( "FixupMSGarbage", ">> run" );

	// Get the document

	var html = context.getClipText();
	// Turn MS specific list items into reasonable plain text with paragraph
	// markup

	var listScanner = new ParseSupportListsScanner();
	html = listScanner.scan( html, context );

	// Remove everything from the HTML except the section within the fragment

	var findClippingScanner = new FindClippingScanner();
	html = findClippingScanner.scan( html, context );

	if ( context.getOriginOffice() )
	{
		// Remove any conditionals, but retain images within the conditionals
		var conditionalScanner = new RemoveConditionalsScanner( { img: 1 } );
		html = conditionalScanner.scan( html, context );

		// Remove more office stuff
		var remHiddenSpansScanner = new RemoveHiddenSpansScanner( );
		html = remHiddenSpansScanner.scan( html, context );
	}
	else if (! context.settingDefined( SETTINGS_DW_HTML ) )
	{
		// Else if NOT from dreamweaver, remove *DW* comments
		// This way we won't get messed up from, e.g. template comments copied
		// from another DW document in a browser.
		var commentScanner = new RemoveDWCommentsScanner( DW_MAGIC_COMMENTS );
		html = commentScanner.scan( html, context );
	}
	
	// In the case of an MSSpreadSheetApplication add the table element into the HTML

	var fixTable = false;

	if ( html.match( /\<\!\-\-(\s*)StartFragment(\s*)\-\-\>(\s*)<tr/i ) )
		fixTable = true;

	else if ( context.getOriginApplication() == "excel" )
	{
		if ( ! html.match( /\<\!\-\-(\s*)StartFragment(\s*?)\-\-\>(\s|(&nbsp;))*?<div/i ) )
		{
			fixTable = true;
		}
	}

	if ( fixTable )
	{
		var startFrag = "<!--StartFragment--><table cellspacing=0 cellpadding=0 class=\"";
		startFrag += context.getOriginClasses().getTDClassName();
		startFrag += "\">";

		html = html.replace( /\<\!\-\-(\s*)StartFragment(\s*)\-\-\>/, startFrag );
		html = html.replace( /\<\!\-\-(\s*)EndFragment(\s*)\-\-\>/, "</table><!--EndFragment-->" );
	}
	
	// klo - Fix for #149440, we need to parse out Hangul Wordian's anchor tag which specifies,
	// in Korean, the start of the document.
	if ( html.match( /\<A NAME\=\"\[\uBB38\uC11C\uC758 \uCC98\uC74C\]\"\>\<\/a\>/i ) )
		html = html.replace( /\<A NAME\=\"\[\uBB38\uC11C\uC758 \uCC98\uC74C\]\"\>\<\/a\>/, "" );
	
	context.setClipText( html );

	context.debugInformation( "FixupMSGarbage", "<< run" );

	return true;
}

function FixupMSGarbage_getPhase() { return PHASE_FIXUP_MS_GARBAGE; }


//---------------------------------------------------------------------------------------------------------
// IdentifyMSApplications
//---------------------------------------------------------------------------------------------------------

// IdentifyMSApplications looks at the meta tag information and parses out where the information
// came from.

function IdentifyMSApplications() { }

// The module API

IdentifyMSApplications.prototype.run = IdentifyMSApplications_run;
IdentifyMSApplications.prototype.getPhase = IdentifyMSApplications_getPhase;

function IdentifyMSApplications_run( context )
{
	context.debugInformation( "IdentifyMSApplications", ">> run" );

	// Look for the generator meta tag

	var foundMSHTML = false;

	var name = context.getMeta( "generator" );
	if ( name != null )
	{
		// Store the full application name

		context.setOriginApplicationFull( name );

		// Parse MSWordProcessingApplication signatures
		if ( name.match( /microsoft word/i ) )
		{
			context.setOriginApplication( "word" );
			context.setOriginApplicationVersion( name.split( " " )[ 2 ] );
			foundMSHTML = true;
		}

		// Parse MSSpreadSheetApplication signatures
		else if ( name.match( /microsoft excel/i ) )
		{
			context.setOriginApplication( "excel" );
			context.setOriginApplicationVersion( name.split( " " )[ 2 ] );
			foundMSHTML = true;
		}

		// Parse powerpoint signatures
		else if ( name.match( /microsoft powerpoint/i ) )
		{
			context.setOriginApplication( "powerpoint" );
			context.setOriginApplicationVersion( name.split( " " )[ 2 ] );
			foundMSHTML = true;
		}

		context.debugInformation( "IDMS", "Origin Application: " + context.getOriginApplication() );
		context.debugInformation( "IDMS", "Origin Application Version: " + context.getOriginApplicationVersion() );
	}

	context.debugInformation( "IdentifyMSApplications", "<< run" );

	return true;
}

function IdentifyMSApplications_getPhase() { return PHASE_ID_MS_APPS; }



//---------------------------------------------------------------------------------------------------------
// RetainStructure
//---------------------------------------------------------------------------------------------------------

// RetainStructure removes any tags from the HTML stream that are not required by the host
// application.

function RetainStructure() { }

// The module API

RetainStructure.prototype.run = RetainStructure_run;
RetainStructure.prototype.getPhase = RetainStructure_getPhase;

function RetainStructure_run( context )
{
	// Dump out if we are not filter

	if ( context.settingDefined( SETTINGS_NO_FILTER ) )
		return true;

	// Ignore non-HTML content

	if ( context.getContentType() != CONTENT_TYPE_HTML )
		return true;

	context.debugInformation( "RetainStructure", ">> run" );

	var alsoServerTags = false;
	
	// Store a reference to the appropriate tag set
	var retainSet = RETAIN_TAGS_NORMAL;

	if (context.settingDefined (SETTINGS_TEXT ) )
	{
		context.debugInformation( "RetainStructure", "Using text tag set" );
		retainSet = RETAIN_TAGS_TEXT;
	}
	else if ( context.settingDefined (SETTINGS_STRUCTURE ) )
	{
		context.debugInformation( "RetainStructure", "Using structure tag set" );
		retainSet = RETAIN_TAGS_STRUCTURE;
		alsoServerTags = true;
	}
	else if ( context.settingDefined (SETTINGS_BASIC) )
	{
		context.debugInformation( "RetainStructure", "Using basic tag set" );
		retainSet = RETAIN_TAGS_BASIC;
		alsoServerTags = true;
	}
	else if ( context.settingDefined (SETTINGS_FULL) )
	{
		context.debugInformation( "RetainStructure", "Using full tag set" );
		retainSet = RETAIN_TAGS_FULL;
		alsoServerTags = true;
	}

	else if ( context.settingDefined( SETTINGS_LOW ) )
	{
		context.debugInformation( "RetainStructure", "Using low tag set" );
		retainSet = RETAIN_TAGS_LOW;
	}
	else if ( context.settingDefined( SETTINGS_ETO ) )
	{
		context.debugInformation( "RetainStructure", "Using ETO tag set" );
		retainSet = RETAIN_TAGS_ETO;
	}

	if ( context.settingDefined( SETTINGS_RETAIN_BRS ) )
	{
		retainSet["br"] = 1;
	}
	else
	{
		// make sure it's not in the retain set
		retainSet["br"] = 0;
	}
	

	// if we want to include server tags, add those to whichever set we chose
	if ( alsoServerTags )
	{
		for ( var t in RETAIN_TAGS_SERVER )
			retainSet[ t ] = 1;
	}

	// Get the clipboard

	var html = context.getClipText();
	// Run the remove tag scanner with our set of tags to retain
	var remTags = new RemoveTagsScanner( retainSet, context );
	html = remTags.scan( html, context );

	// Send the output back to the context

	context.setClipText( html );

	context.debugInformation( "RetainStructure", "<< run" );

	return true;
}

function RetainStructure_getPhase() { return PHASE_RETAIN_STRUCTURE; }

//---------------------------------------------------------------------------------------------------------
// FixWordParagraphSpacing
//---------------------------------------------------------------------------------------------------------

// FixWordParagraphSpacing cleans up "paragraph" vs "line break" confusion in some word documents
// (for authors that hit one return to get a line break, and two returns to get a new paragraph).
// A new non-empty paragraph turns into a line break, and a single empty paragraph is removed.

function FixWordParagraphSpacing() { }

// The module API

FixWordParagraphSpacing.prototype.run = FixWordParagraphSpacing_run;
FixWordParagraphSpacing.prototype.getPhase = FixWordParagraphSpacing_getPhase;

function FixWordParagraphSpacing_run( context )
{
	// Dump out if we are not filter
	if ( context.settingDefined( SETTINGS_NO_FILTER ) )
		return true;

	// shouldn't be here if not from word
	if ( context.getOriginApplication() != "word" )
		return true;

	// Dump out if setting is turned off
	if ( ! context.settingDefined( SETTINGS_CLEANUP_WORD_PARS ) )
		return true;

	// Ignore non-HTML content
	if ( context.getContentType() != CONTENT_TYPE_HTML )
		return true;

	context.debugInformation( "FixWordParagraphSpacing", ">> run" );
	
	// Get the clipboard

	var html = context.getClipText();

	// Run the remove tag scanner with our set of tags to retain
	var fixPars = new FixWordParagraphSpacingScanner( context );
	html = fixPars.scan( html, context );

	// Send the output back to the context
	context.setClipText( html );

	context.debugInformation( "FixWordParagraphSpacing", "<< run" );
	
	return true;
}

function FixWordParagraphSpacing_getPhase() { return PHASE_FIX_WORD_PARA_SPACING; }


//---------------------------------------------------------------------------------------------------------
// RemoveUnsupportedAttributes
//---------------------------------------------------------------------------------------------------------

// RemoveUnsupportedAttributes removes unwanted attributes and styles from the HTML
// stream. 

function RemoveUnsupportedAttributes() { }

// The module API

RemoveUnsupportedAttributes.prototype.run = RemoveUnsupportedAttributes_run;
RemoveUnsupportedAttributes.prototype.getPhase = RemoveUnsupportedAttributes_getPhase;

function RemoveUnsupportedAttributes_run( context )
{
	// Dump out if we are not filter

	if ( context.settingDefined( SETTINGS_NO_FILTER ) )
		return true;

	// Ignore the content if it's not HTML

	if ( context.getContentType() != CONTENT_TYPE_HTML )
		return true;

	var attributeRemover;

	if ( context.settingDefined( SETTINGS_CONTRIBUTE ) )
	{
		// for contribute, remove all attributes & style properties
		// except what we list as supported.

		var attributes = RUA_TAG_SPECIFIC_ATTRIBUTES;
		if ( context.settingDefined( SETTINGS_CREATE_CLASSES ) &&
		     ! context.settingDefined( SETTINGS_LOW ) )
		{
			attributes[ 'span' ][ 'class' ] = 1;
			attributes[ 'p' ][ 'class' ] = 1;
			attributes[ 'td' ][ 'class' ] = 1;
			attributes[ 'th' ][ 'class' ] = 1;
			attributes[ 'table' ][ 'class' ] = 1;
			attributes[ 'li' ][ 'class' ] = 1;
		}
		else if (  context.settingDefined( SETTINGS_LOW ) )
		{
			attributes[ 'span' ][ 'class' ] = 0;
			attributes[ 'p' ][ 'class' ] = 0;
			attributes[ 'td' ][ 'class' ] = 0;
			attributes[ 'th' ][ 'class' ] = 0;
			attributes[ 'table' ][ 'class' ] = 0;
			attributes[ 'li' ][ 'class' ] = 0;
		}

		// Set up the attribute remove scanner with our set of attributes and styles to retain
		attributeRemover = new RemoveAttributesScanner( false, attributes, RUA_TAG_SPECIFIC_STYLES, "" );
	}
	else
	{
		// for dreamweaver, only do it for office content
		// only run this filter if office content
		if ( !context.getOriginOffice() )
			return true;

		// and even if office, *remove* special office style properties,
		// rather than removing everything except what's on our list.
		// Set up the attribute remove scanner to just remove "mso-" properties.

		attributeRemover = new RemoveAttributesScanner( true, "", "", MSO_CSS_PROPERTIES );
	}

	context.debugInformation( "RemoveUnsupportedAttributes", ">> run" );

	// Get the clipboard text context

	var html = context.getClipText();

	// Run the attribute remove scanner
	html = attributeRemover.scan( html, context );

	// Send the text back to the clipboard

	context.setClipText( html );

	context.debugInformation( "RemoveUnsupportedAttributes", "<< run" );

	return true;
}

function RemoveUnsupportedAttributes_getPhase() { return PHASE_REMOVE_UNSUPPORTED_ATTRS; }


//---------------------------------------------------------------------------------------------------------
// RemoveCSSClasses
//---------------------------------------------------------------------------------------------------------

// RemoveCSSClasses removes class attributes from all tags if we are runing without CSS
// or running in ETO mode.

function RemoveCSSClasses() { }

// The module API

RemoveCSSClasses.prototype.run = RemoveCSSClasses_run;
RemoveCSSClasses.prototype.getPhase = RemoveCSSClasses_getPhase;

function RemoveCSSClasses_run( context )
{
	// Dump out if we are not filter

	if ( context.settingDefined( SETTINGS_NO_FILTER ) )
		return true;

	// Ignore non-HTML content

	if ( context.getContentType() != CONTENT_TYPE_HTML )
		return true;

	// Ignore this filter if we are using CSS

	if ( context.settingDefined( SETTINGS_ETO ) == false &&
	     context.settingDefined( SETTINGS_LOW ) == false &&
	     context.settingDefined( SETTINGS_NO_CSS ) == false)
	{
		return true;
	}
	context.debugInformation( "RemoveCSSClasses", ">> run" );

	// Get the clipboard HTML

	var html = context.getClipText();

	// Run the scanner that removes specific attributes.  In this case, remove the
	// class and style attributes.

	var attributeRemover = new RemoveOnlyTheseAttributesScanner( { 'class': 1, 'style': 1 } );
	html = attributeRemover.scan( html, context );

	// Put back the HTML

	context.setClipText( html );

	context.debugInformation( "RemoveCSSClasses", "<< run" );

	return true;
}

function RemoveCSSClasses_getPhase() { return PHASE_REMOVE_CSS_CLASSES; }



//---------------------------------------------------------------------------------------------------------
// CleanupClasses
//---------------------------------------------------------------------------------------------------------

// CleanupClasses generates the string of used classes, removing empty classes as it does so.
// Then it goes through the HTML and removes any references to those removed classes

function CleanupClasses() { }
CleanupClasses.prototype.run = CleanupClasses_run;
CleanupClasses.prototype.getPhase = CleanupClasses_getPhase;

function CleanupClasses_run ( context )
{
	// Dump out if we are not filter
	if ( context.settingDefined( SETTINGS_NO_FILTER ) )
		return true;

	// Ignore non-HTML content
	if ( context.getContentType() != CONTENT_TYPE_HTML )
		return true;

	// generate the used classes string
	var usedStyles = context.generateUsedStyles();

	var removedClasses = context.getRemovedClasses();

	// now clean up references to anything in removed_styles

	var html = context.getClipText();

	var classRefRemover = new RemoveObsoleteClassRefsScanner( removedClasses );
	html = classRefRemover.scan( html, context );

	context.setClipText( html );

	return true;	
}

function CleanupClasses_getPhase() { return PHASE_CLEANUP_CSS_CLASSES; }


//---------------------------------------------------------------------------------------------------------
// RemoveParsingRequiredStructuralTags
//---------------------------------------------------------------------------------------------------------

// RemoveParsingRequiredStructuralTags removes any tags from the HTML stream that were required
// during the parsing (like THEAD) but are not required by the host application.

function RemoveParsingRequiredStructuralTags() {}

RemoveParsingRequiredStructuralTags.prototype = new StructureScanner();

// The module API

RemoveParsingRequiredStructuralTags.prototype.run = RemoveParsingRequiredStructuralTags_run;
RemoveParsingRequiredStructuralTags.prototype.getPhase = RemoveParsingRequiredStructuralTags_getPhase;

// The structure scanner override methods

RemoveParsingRequiredStructuralTags.prototype.createTag = RemoveParsingRequiredStructuralTags_createTag;
RemoveParsingRequiredStructuralTags.prototype.finalizeTag = RemoveParsingRequiredStructuralTags_finalizeTag;

function RemoveParsingRequiredStructuralTags_run( context )
{
	// Dump out if we are not filter

	if ( context.settingDefined( SETTINGS_NO_FILTER ) )
		return true;

	// Ignore non-HTML content

	if ( context.getContentType() != CONTENT_TYPE_HTML )
		return true;

	context.debugInformation( "RemoveParsingRequiredStructuralTags", ">> run" );

	// Get the clipboard HTML

	var html = context.getClipText();

	this._justSawOfficeBody = false;
	this._fromOffice = false;
	
	// Remove specific tags from the HTML
	// Word adds THEAD, and we convert contained TD tags to TH, so for Word content, remove those

	if ( context.getOriginApplication() == "word" )
	{
		this._fromOffice = true;
		var remTags = new RemoveOnlyTheseTagsScanner( PRS_REMOVE_TAGS_WORD );
		html = remTags.scan( html, context );
	}
	else if ( context.getOriginApplication() == "excel" )
	{
		this._fromOffice = true;
	}

	// currently, there are no tags to similarly remove if not coming from word.
	// If we add some, create PRS_REMOVE_TAGS_NON_WORD and use it here.

	// Now use ourselves to remove specific tags that have specific problems,
	// like no content or no attributes.

	html = this.scan( html );

	// Set the clipboard HTML

	context.setClipText( html );

	context.debugInformation( "RemoveParsingRequiredStructuralTags", "<< run" );

	return true;
}

function RemoveParsingRequiredStructuralTags_getPhase() { return PHASE_REMOVE_PARSING_REQD_STRUCT_TAGS; }

function RemoveParsingRequiredStructuralTags_createTag( tag, attributes, closed, openTrailingFormat )
{
	// If you look at this method and the method below you will think to yourself,
	// "Why not merge the two?"  Well, the requirements are different.  In the case
	// of no attributes you just want to remove the tag, not the interior of the tag.
	// For example, this:
	//
	//    <p><font>My Text</font></p>
	//
	// Should become:
	//
	//    <p>My Text</p>
	//
	// In the case of removing empty tags we are looking to do this:
	//
	//    <p>Some text</p><p></p><p>Some more text</p> 
	//
	// Should become:
	//
	//    <p>Some text</p><p>Some more text</p>
	//
	// But you can only do that if you know what the child HTML is, and you only
	// know that in the finalize phase.

	var lowerTag = tag.toLowerCase();
	
	if ( this._fromOffice )
	{
		if (lowerTag == "body" )
		{
			this._justSawOfficeBody = true;
		}
		else if ( this._justSawOfficeBody && lowerTag == "div" )
		{
			this._justSawOfficeBody = false;
			return { postfix: "", prefix: "" };
		}
		else
		{
			this._justSawOfficeBody = false;
		}
	}


	// If this tag is on the check list then run the check

	if ( PRS_REMOVE_IF_NO_ATTRIBUTES[ lowerTag ] > 0 )
	{
		// Create a 0 or 1 count of attributes
		var count = 0;
		for( var key in attributes )
		{
			count = 1;
			break;
		}

		// If the count is zero then return a blank tag text output
		if ( count == 0 )
			return { postfix: "", prefix: "" };
	}

	// Otherwise, let the base class handle it

	return StructureScanner_createTag( tag, attributes, closed, openTrailingFormat );
}

function RemoveParsingRequiredStructuralTags_finalizeTag( tag, attributes, closed, childHTML )
{
	// If this tag is in the remove list then check it

	if ( PRS_REMOVE_IF_EMPTY[ tag ] > 0 )
	{
		// If there is no interior, then kill the tag.
		
		// For P tags, if there's space inside the P, don't strip it
		if (!(tag.toLowerCase() == "p" && childHTML.length > 0))
			if ( Utils_StripWhitespace( childHTML ).length < 1 )
				return false;
	}
	
	// for <a> tags that *don't have name or id*, and no interior. (If have name or id, they can be anchor even without content).
	if (tag == "a" && Utils_StripWhitespace( childHTML ).length < 1 )
	{
		var isAnchor = false;
		for( var key in attributes )
		{
			if ( attributes[ key ] )
			{
				var lowerKey = key.toLowerCase();
				if ( lowerKey == "id" || lowerKey == "name" )
				{
					isAnchor = true;
				}
			}
		}
		if (!isAnchor)
			return false;
	}

	return true;
}




//---------------------------------------------------------------------------------------------------------
// DecomposeClasses
//---------------------------------------------------------------------------------------------------------

// DecomposeClasses turns CSS style information into inline HTML formatting.  For example, the
// HTML:
//
//   <html><head><style><!-- MsoNormal { font-family: Arial } --></style>
//   <body><p class=MsoNormal>Hello</p></body></html>
//
// Should become:
//
//   <html><head><style><!-- MsoNormal { font-family: Arial } --></style>
//   <body><p><font face="Arial">Hello</p></body></html>
//
// This allows Contribute users to edit the HTML using Contribute.

function DecomposeClasses() {}

DecomposeClasses.prototype = new StructureScanner ();

// Methods to make use a filter component

DecomposeClasses.prototype.run = DecomposeClasses_run;
DecomposeClasses.prototype.getPhase = DecomposeClasses_getPhase;

// Local methods

DecomposeClasses.prototype.parseClass = DecomposeClasses_parseClass;
DecomposeClasses.prototype.buildNewTags = DecomposeClasses_buildNewTags;
DecomposeClasses.prototype.buildTagSpecifications = DecomposeClasses_buildTagSpecifications;
DecomposeClasses.prototype.shouldUseTargetClass = DecomposeClasses_shouldUseTargetClass;

// StructureScanner overrides

DecomposeClasses.prototype.startTag = DecomposeClasses_startTag;
DecomposeClasses.prototype.endTag = DecomposeClasses_endTag;
DecomposeClasses.prototype.createTag = DecomposeClasses_createTag;

function DecomposeClasses_run( context )
{
	// Dump out if we are not filter
	if ( context.settingDefined( SETTINGS_NO_FILTER ) )
		return true;

	// we need to run this even if not coming from office, to get the embedded classes

	// Initialize the decomposition class and the other member variables

	this._cache = {};
	this._isHeader = false;

	// Ignore this if the content is not HTML

	if ( context.getContentType() != CONTENT_TYPE_HTML )
		return true;

	// Ignore this filter if we are in ETO mode
	if ( context.settingDefined( SETTINGS_ETO ) )
		return true;

	// Ignore this filter if we are in LOW, STRUCTURE or BASIC modes
	if ( context.settingDefined( SETTINGS_LOW ) ||
		 context.settingDefined( SETTINGS_STRUCTURE ) ||
		 context.settingDefined( SETTINGS_BASIC ) )
		return true;

	context.debugInformation( "DecomposeClasses", ">> run" );

	this._context = context;

	// Decide on whether we are building fonts or spans

	if ( context.settingDefined( SETTINGS_CHANGE_SPAN_TO_FONT ) )
		this._buildingFonts = true;
	else
		this._buildingFonts = false;

	// Get the HTML

	var html = context.getClipText();

	// Use ourselves to scan
	html = this.scan( html );

	// Set the HTML
	context.setClipText( html );

	context.debugInformation( "DecomposeClasses", "<< run" );

	return true;
}

function DecomposeClasses_getPhase() { return PHASE_DECOMPOSE_CLASSES; }

function DecomposeClasses_parseClass( classDef, tagStruct )
{
	var styleAttribute = "";
	
	// Handle the different CSS style elements and stuff them into the
	// right tagStruct item.
	for ( var prop in classDef )
	{
		if ( prop == "font-size" )
			tagStruct.fontSize = classDef[ "font-size" ];

		else if ( prop == "font-family" )
		{
			if ( this._context.settingDefined( SETTINGS_NO_FONT_MAP ) )
				tagStruct.fontName = classDef[ "font-family" ];
			else
				tagStruct.fontName = Utils_MapFont( classDef[ "font-family" ] );
		}

		else if ( prop == "font-style" )
		{
			if ( this._buildingFonts ) 
			{
				if (classDef[ "font-style" ] == "italic" )
					tagStruct.isItalic = true;
			}
			else
				tagStruct.fontStyle = classDef[ "font-style" ];
		}
		
		else if ( prop == "font-weight" )
		{
			if ( this._buildingFonts ) 
			{
				if ( classDef[ "font-weight" ] > 400 )
					tagStruct.isBold = true;
				if ( classDef[ "font-weight" ] == "bold" )
					tagStruct.isBold = true;
			}
			else
				tagStruct.fontWeight = classDef[ "font-weight" ];
		}
		
		else if ( prop == "text-decoration" )
		{
			if ( this._buildingFonts ) 
			{
				if ( classDef[ "text-decoration" ] == "underline" )
					tagStruct.isUnderline = true;
			}
			else
				tagStruct.textDecoration = classDef[ "text-decoration" ];
		}
		
		else if ( ( prop == "text-align" ) &&
				  ( classDef[ "text-align" ] == "right" || classDef[ "text-align" ] == "center" ) )
		{
			tagStruct.textAlign = classDef[ "text-align" ];
		}

		// For indents we give one indent for every half inch of margin

		else if ( prop == "mso-tab-count" && classDef[ "mso-tab-count" ] != null )
			tagStruct.tabCount = classDef[ "mso-tab-count" ];

		
		else if ( prop == "margin-left" && classDef[ "margin-left" ] != null )
		{
			tagStruct.marginLeft = classDef[ "margin-left" ];
		}
		
		// Parse the colors, but don't allow vendor specific colors.
		else if ( prop == "color" && classDef[ "color" ] != null )
		{
			tagStruct.textColor = classDef[ "color" ];
		}

		else if ( prop == "background" && classDef[ "background" ] != null )
		{
			tagStruct.bgColor = classDef[ "background" ];
		}
		
		else
		{
			styleAttribute += prop + ":" + classDef[ prop ] + "; ";	
		}
	}

	return styleAttribute;
}

function DecomposeClasses_buildNewTags( tag, attributes, tagStruct, styleAttribute, openTrailingFormat )
{
	// The various attributes of the font/span tag

	var faceAttribute = "";
	var sizeAttribute = "";

	// Initialize the starting and ending tag

	var startTag = "";
	var endTag = "";
	var replaceTag = false;

	// Setup the FACE, STYLE and SIZE attributes of the font/span
	// tag depending on the fontName, fontSize, and textColor attributes
	// in the tagStruct.

	if ( tagStruct.fontName && tagStruct.fontName.length > 1 )
	{
		tagStruct.fontName = tagStruct.fontName.replace( /\"/g, "" );
		if ( this._buildingFonts )
			faceAttribute = tagStruct.fontName;
		else
			styleAttribute += "font-family:" + tagStruct.fontName + "; ";
	}
	if ( tagStruct.fontSize != null )
	{
		if ( this._buildingFonts )
			sizeAttribute += Utils_ConvertPointsToFontSizes( tagStruct.fontSize );
		else
			styleAttribute += "font-size:" + tagStruct.fontSize + "; ";
	}
	if ( tagStruct.textColor != null )
		styleAttribute += "color:" + tagStruct.textColor + "; ";

	if ( tagStruct.bgColor != null )
		styleAttribute += "background:" + tagStruct.bgColor + "; ";

	if ( ! this._buildingFonts )
	{
		if ( tagStruct.fontStyle != "" )
			styleAttribute += "font-style:" + tagStruct.fontStyle + "; ";
		if (tagStruct.fontWeight != "" )
			styleAttribute += "font-weight:" + tagStruct.fontWeight + "; ";
		if (tagStruct.textDecoration != "" )
			styleAttribute += "text-decoration:" + tagStruct.textDecoration + "; ";
	}

	if ( tag == "p" && tagStruct.textAlign != null )
	{
		startTag = "<p style=\"text-align:" + tagStruct.textAlign + ";\">";
		endTag = "</p>";
		replaceTag = true;
	}
			
	// Build the font/span tag
	if ( faceAttribute.length > 0 || styleAttribute.length > 0 || sizeAttribute.length > 0 )
	{
		var baseTagType = "font";
		
		//disabling this code for creating new spans when we're using styles since Jack noted it was written for Contribute when they didn't use styles
		if ( !this._buildingFonts && tag == "span" )	//if we're regenerating existing spans, that's fines
			baseTagType = "span";
		
		if ( this._buildingFonts || tag == "span" )
		{
			startTag += "<" + baseTagType;
		
			if ( faceAttribute.length > 0 )
				startTag += " face=\"" + faceAttribute + "\"";

			if ( sizeAttribute.length > 0 )
				startTag += " size=\"" + sizeAttribute + "\"";

			if ( styleAttribute.length > 0 )
				startTag += " style=\"" + styleAttribute + "\"";
		
			startTag += openTrailingFormat + ">";
		
			endTag = "</" + baseTagType + ">" + endTag;
		}
	}

	// Add in italics and bolding
	if ( this._buildingFonts )
	{
		if ( tagStruct.isItalic ) { startTag += "<i>"; endTag = "</i>" + endTag; }
		if ( tagStruct.isBold ) { startTag += "<b>"; endTag = "</b>" + endTag; }
		if ( tagStruct.isUnderline ) { startTag += "<u>"; endTag = "</u>" + endTag; }
	}
	
	// Add in any tabs

	if ( tagStruct.tabCount != null )
	{
		for( var tab = 0; tab < parseInt( tagStruct.tabCount ); tab++ )
			startTag += "&nbsp;&nbsp;";
	}

	// If this is a span tag then we are replacing it because we are
	// creating the font/span tag.

	if ( tag == "span" )
		replaceTag = true;

	// Check for text alignment

	if ( tag == "td" && tagStruct.textAlign != null )
		attributes[ "align" ] = tagStruct.textAlign;

	// Turn TDs into THs if this TD is in the THEAD section, *if* this is from word content

	if ( tag == "td" && this._isHeader && this._context.getOriginApplication() == "word" )
	{
		// We need to copy the attributes

		var attributeStr = "";

		for ( var key in attributes )
		{
			if ( attributes[ key ] )
				attributeStr += " " + key + "=\"" + attributes[ key ] + "\"";
		}

		// BGCOLOR is special because it doesn't exist yet, so we need to add it

		if ( tagStruct.bgColor != null )
			attributeStr += " bgcolor=\"" + tagStruct.bgColor + "\"";

		// This is hard wired for accesibility.  No Word version that I know of allows you
		// to turn columns into headers.  So we are assuming that rows are always the header
		// and thus the scope of the header is the column.
		//
		// This assumption should be checked against new versions of Word as they are released.
	
		attributeStr += ' scope="col"';

		// Put together the new TH tag

		startTag = "<th" + attributeStr + ">" + startTag;
		endTag = "</th>" + endTag;
		replaceTag = true;
	}

	// Return the fixup structure if we are fixing something up
	return { tag: tag, prefix: startTag, postfix: endTag, replace: replaceTag };
}

function DecomposeClasses_buildTagSpecifications( tag, attributes, tagStruct )
{
	var styleAttribute = "";

	// It takes a while to figure out just what font, italic, etc. combination maps to
	// any combination of tag name, class and style attributes.  On the assumption that
	// most people use the same combination over and over we cache the result of the
	// combination of tag name, class name and style text.


	// Create the cache names for the class and style.  Since it's a lookup we need
	// to actually have a value, so we replace null with an empty string

	var cacheClassName = new String( attributes[ 'class' ] );
	if ( cacheClassName == null )
		cacheClassName = "";

	var cacheStyleName = new String( attributes[ 'style' ] );
	if ( cacheStyleName == null )
		cacheStyleName = "";

	// Make sure that the cache hierachy exists for the tag and the class name

	if ( this._cache[ tag ] == null )
		this._cache[ tag ] = {};
	if ( this._cache[ tag ][ cacheClassName ] == null )
		this._cache[ tag ][ cacheClassName ] = {}

	// Get value of the cache for this combination of tag, clas name and style
	// name

	var cacheValue = this._cache[ tag ][ cacheClassName ][ cacheStyleName ];
	if ( cacheValue )
	{
		attributes[ 'class' ] = null;
		for( var key in cacheValue )
			tagStruct[ key ] = cacheValue[ key ];
		return styleAttribute;
	}

	// Here we are populating the tagStruct from the CSS stuff. This is really in three sections;
	// first we look at the class for the tag.  Then we look at the class specified by the this tag
	// in particular. Then we look at the style data.  We do it in that order because that is the 
	// order in which CSS cascades.  If you change the ordering then you will be altering the
	// cascading behaviour of CSS.


	// First look to see if this tag has an associated class.  For example, if this
	// is a TD tag then this looks for a TD class.

	if ( this._context.getOriginClasses().get( tag ) )
		this.parseClass( this._context.getOriginClasses().get( tag ), tagStruct );

	// Now we look for the specific CLASS specified in the attribute, maybe

	var tagClassName = attributes[ 'class' ];
	if ( tagClassName )
	{
		var classDef = null;

		// First look for <tagName>.<className>

		var className = tag.toLowerCase() + "." + tagClassName;
		if ( this._context.getOriginClasses().get( className ) )
			classDef = this._context.getOriginClasses().get( className );

		// Then look for .<className>

		if ( classDef == null )
		{
			className = "." + tagClassName;
			if ( this._context.getOriginClasses().get( className ) )
				classDef = this._context.getOriginClasses().get( className );
		}

		// If we find it then parse it

		if ( classDef )
			this.parseClass( classDef, tagStruct );

		attributes[ 'class' ] = null;
	}

	// Last, bring in the STYLE data

	if ( attributes.style )
	{
		styleAttribute = this.parseClass( Utils_ParseStyle( attributes.style ), tagStruct );
	}

	var cacheValue = {};
	for( var key in tagStruct )
		cacheValue[ key ] = tagStruct[ key ];
	this._cache[ tag ][ cacheClassName ][ cacheStyleName ] = cacheValue;

	return styleAttribute;
}

function DecomposeClasses_shouldUseTargetClass( tag, attributes )
{
	// If we aren't allowing CSS then don't allow the user to reuse target
	// document classes
	
	if ( this._context.settingDefined( SETTINGS_NO_CSS ) )
		return false;

	// Check to see if we have a class that is defined by the target document.
	if ( attributes[ 'class' ] )
	{
		var classAttr = Utils_StripWhitespace( attributes[ 'class' ] );

		var spaceIndex = classAttr.indexOf(" ");
		var nextNameIndex = 0;
		var oneClassName;
		var newClassAttr = "";
		while (true) {
			if (spaceIndex == -1)
				oneClassName = classAttr.substring(nextNameIndex);
			else
				oneClassName = classAttr.substring(nextNameIndex, spaceIndex);

			var name = this._context.checkClasses( tag, oneClassName );
			if ( name != null )
			{
				if (newClassAttr != "")
					newClassAttr += " ";
				newClassAttr += name;
			}

			if (spaceIndex == -1)
				break;
			else
				nextNameIndex = spaceIndex + 1;

		    spaceIndex = classAttr.indexOf(" ", nextNameIndex);
		    while (spaceIndex == nextNameIndex)
		    {
				nextNameIndex += 1;
			    spaceIndex = classAttr.indexOf(" ", nextNameIndex);    
		    }
		}

		if (newClassAttr != "")		
		{
			attributes[ 'class' ] = newClassAttr;
			return true;
		}
	}

	if ( attributes[ 'id' ] )
	{
		var id = this._context.checkIDs( tag, attributes[ 'id' ] );
		if ( id != null )
		{
			attributes[ 'id' ] = id;
			return true;
		}
	}
	return false;
}

function DecomposeClasses_startTag( tag )
{
	// Mark if we are in a header

	if ( tag.tag == "thead" )
		this._isHeader = true;
}

function DecomposeClasses_endTag( tag )
{
	// Mark when we leave a table header

	if ( tag.tag == "thead" )
		this._isHeader = false;
}

function DecomposeClasses_createTag( tag, attributes, closed, openTrailingFormat )
{
	// Ignore this tag if it is in the ignore list

	if ( DC_IGNORE_TAGS[ tag ] > 0 )
		return null;

	var classAttrib = attributes[ 'class' ];
	var idAttrib = attributes[ 'id' ];
	
	if ( ! this.shouldUseTargetClass( tag, attributes ) )
	{

		// This is the finalized structure that should be populated after the class
		// and style attributes are analyzed.

		var tagStruct = {
			fontName: "",
			fontStyle: "",
			fontWeight: "",
			textDecoration: "",
			isItalic: false,
			isBold: false,
			tabCount: null,
			marginLeft: null,
			isUnderline: false,
			textAlign: null,
			fontSize: null,
			indent: null,
			textColor: null,
			bgColor: null
		};

		// Analyze the tag and populate the tag specifications structures
		var styleAttribute = this.buildTagSpecifications( tag, attributes, tagStruct );
		// Build a set of tags that represent the specification structure

		outStruct = this.buildNewTags( tag, attributes, tagStruct, styleAttribute, openTrailingFormat );

		// If we aren't replacing the current tag then look for any alterations
		// to the tag itself.

		var prefix = "";
		var postfix = "";

		// So there are two ways to handle a tag, we either add onto it, or replace it.
		// For example, here is an add to:
		//
		//    <p class=MsoNormal>text</p>
		//
		// Becomes:
		//
		//    <p><font face="Times New Roman">text</font></p>
		//
		// Or replacing, like:
		//
		//    <p style="mso-indent-level:2>text</p>
		//
		// Is replaced by:
		//
		//    <blockquote><blockquote>text</blockquote></blockquote>
		//
		// Another case is replacing <span> tags with <font> tags.

		if ( outStruct.replace )
		{
			prefix = outStruct.prefix;
			postfix = outStruct.postfix;
		}
		else
		{
			if ( tagStruct.bgColor != null )
				attributes.bgcolor = tagStruct.bgColor;

			var retVal = StructureScanner_createTag( tag, attributes, closed, openTrailingFormat );

			prefix = retVal.prefix + outStruct.prefix;
			postfix = outStruct.postfix + retVal.postfix;
		}

		return { prefix: prefix, postfix: postfix };
	}

	return null;
}



//---------------------------------------------------------------------------------------------------------
// DemoteToParagraphs
//---------------------------------------------------------------------------------------------------------

// DemoteToParagraphs turns and <H1>, <H2>, <H3>, etc. tag into a 
// <P> tag if the SETTINGS_DEMOTE_TO_PARAGRAPHS setting is on.

function DemoteToParagraphs() { }

// The module API

DemoteToParagraphs.prototype.run = DemoteToParagraphs_run;
DemoteToParagraphs.prototype.getPhase = DemoteToParagraphs_getPhase;

function DemoteToParagraphs_run( context )
{
	// Dump out if we are not filter

	if ( context.settingDefined( SETTINGS_NO_FILTER ) )
		return true;

	// Ignore non-HTML content

	if ( context.getContentType() != CONTENT_TYPE_HTML )
		return true;

	// Ignore this filter if we are not in demoting to paragraphs

	if ( ! context.settingDefined( SETTINGS_DEMOTE_TO_PARAGRAPHS ) )
		return true;

	context.debugInformation( "DemoteToParagraphs", ">> run" );

	// Get the HTML

	var html = context.getClipText();

	// Put together the regular expression of what to find

	var mapRE = /^h[123456]$/i;

	// And then send it in with what we want it replaced with

	var tagNameMapper = new MapTagNamesScanner( mapRE, "p" );

	// Run the scanner

	html = tagNameMapper.scan( html, context );

	// Replace the HTML

	context.setClipText( html );

	context.debugInformation( "DemoteToParagraphs", "<< run" );

	return true;
}

function DemoteToParagraphs_getPhase() { return PHASE_DEMOTE_TO_PARAGRAPHS; }



//---------------------------------------------------------------------------------------------------------
// SingleSpaceParagraphs
//---------------------------------------------------------------------------------------------------------

// If the SETTINGS_SINGLE_SPACE_P setting is on then SingleSpaceParagraphs adds
// the margin-top:0 and margin-bottom:0 style attributes to each paragraph.

function SingleSpaceParagraphs() { }

// The module API

SingleSpaceParagraphs.prototype.run = SingleSpaceParagraphs_run;
SingleSpaceParagraphs.prototype.getPhase = SingleSpaceParagraphs_getPhase;

function SingleSpaceParagraphs_run( context )
{
	// Dump out if we are not filter

	if ( context.settingDefined( SETTINGS_NO_FILTER ) )
		return true;

	// Ignore non-HTML content

	if ( context.getContentType() != CONTENT_TYPE_HTML )
		return true;

	// Ignore this filter if we are not single spacing paragraphs

	if ( ! context.settingDefined( SETTINGS_SINGLE_SPACE_P ) )
		return true;

	context.debugInformation( "SingleSpaceParagraphs", ">> run" );


	var html = context.getClipText();

	var styleAdder = new AddStylesScanner( "p", { 'margin-top': 0, 'margin-bottom': 0 } );
	html = styleAdder.scan( html, context );

	context.setClipText( html );


	context.debugInformation( "SingleSpaceParagraphs", "<< run" );

	return true;
}

function SingleSpaceParagraphs_getPhase() { return PHASE_SINGLE_SPACE_PARAGRAPHS; }


//---------------------------------------------------------------------------------------------------------
// MergeRedundantFontTags
//---------------------------------------------------------------------------------------------------------

// This handler fixes a problem where the system creates font tags within font tags.  For
// example:
//
//     <font name="Times New Roman" size="7"><b><font size="3">Example</font></b></font>
//
// Should become:
//
//     <font name="Times New Roman" size="3"><b>Example</b></font>
//
// What actually happens is that the tags become:
//
//     <font name="Times New Roman" size="7"><b><font>Example</font></b></font>
//
// And the empty font tags are removed in the finalization process.

function MergeRedundantFontTags() {}

MergeRedundantFontTags.prototype = new StructureScanner ();

// The module API

MergeRedundantFontTags.prototype.run = MergeRedundantFontTags_run;
MergeRedundantFontTags.prototype.getPhase = MergeRedundantFontTags_getPhase;

// The structure scanner override methods

MergeRedundantFontTags.prototype.inspectTag = MergeRedundantFontTags_inspectTag;
MergeRedundantFontTags.prototype.findFontTag = MergeRedundantFontTags_findFontTag;

function MergeRedundantFontTags_run( context )
{
	// Dump out if we are not filter

	if ( context.settingDefined( SETTINGS_NO_FILTER ) )
		return true;

	// Ignore non-HTML content

	if ( context.getContentType() != CONTENT_TYPE_HTML )
		return true;

	context.debugInformation( "MergeRedundantFontTags", ">> run" );

	// Get the HTML

	var html = context.getClipText();

	// Use ourselves to scan the HTML

	html = this.scan( html );

	// Replace the HTML

	context.setClipText( html );

	context.debugInformation( "MergeRedundantFontTags", "<< run" );

	return true;
}

function MergeRedundantFontTags_getPhase() { return PHASE_MERGE_REDUNDANT_FONTS; }

function MergeRedundantFontTags_findFontTag( tag )
{
	// We ignore interior text

	if ( tag.type == "text" )
		return null;

	// We check to see if there are children, there must be only one child
	// at each level

	if ( tag.children.length == 1 )
	{
		// If the child is a font tag, then we have a qualifying tag/subTag
		// combination.  Otherwise we delve further.

		if ( tag.children[ 0 ].tag == "font" )
			return tag.children[ 0 ];
		else
			return this.findFontTag( tag.children[ 0 ] );
	}

	return null;
}

function MergeRedundantFontTags_inspectTag( tag )
{
	// In the inspection phase of the StructureScanner process we can actually alter the
	// tag before it's output.  In this case we want to take interior font tags and merge
	// them into the parent font tag.

	// Just to make things more clear, in the example above:
	//
	//     <font name="Times New Roman" size="7"><b><font size="3">Example</font></b></font>
	//
	// At the point we find them:
	//
	// 'tag' = <font name="Times New Roman" size="7">
	// 'subTag' = <font size="3">
	//
	// Then after we filter it:
	//
	// 'tag' = <font name="Times New Roman" size="3">
	// 'subTag' = <font>
	//


	if ( tag.tag == "font" && tag.children.length > 0 )
	{
		// Find a qualifying interior font tag

		var subTag = this.findFontTag( tag );

		// If we found one then migrate all of the attributes from that tag into the parent
		// tag and mark them as null in the sub tag.

		if ( subTag )
		{
			for ( var key in subTag.attributes )
			{
				tag.attributes[ key ] = subTag.attributes[ key ];
				subTag.attributes[ key ] = null;
			}
		}
	}

	return tag;
}


//---------------------------------------------------------------------------------------------------------
// ChangeToStrongAndEm
//---------------------------------------------------------------------------------------------------------

// ChangeToStrongAndEm changes <b> tags to <strong> tags, and <i> tags to <em>
// tags if the SETTINGS_USE_EMPHASIS setting is on.

function ChangeToStrongAndEm() { }

// The module API

ChangeToStrongAndEm.prototype.run = ChangeToStrongAndEm_run;
ChangeToStrongAndEm.prototype.getPhase = ChangeToStrongAndEm_getPhase;

function ChangeToStrongAndEm_run( context )
{
	// Dump out if we are not filter

	if ( context.settingDefined( SETTINGS_NO_FILTER ) )
		return true;

	// Ignore non-HTML content

	if ( context.getContentType() != CONTENT_TYPE_HTML )
		return true;

	// Ignore this filter if we are not changing to <strong> and <em>

	if ( ! context.settingDefined( SETTINGS_USE_EMPHASIS ) )
		return true;

	context.debugInformation( "ChangeToStrongAndEm", ">> run" );

	// Get the HTML

	var html = context.getClipText();

	// Setup regexps for <b> and <i> and turn them into <strong>
	// and <em>.

	var mapB = /^b$/i;
	var tagNameMapperB = new MapTagNamesScanner( mapB, "strong" );
	html = tagNameMapperB.scan( html, context );

	var mapI = /^i$/i;
	var tagNameMapperI = new MapTagNamesScanner( mapI, "em" );
	html = tagNameMapperI.scan( html, context );

	// Replace the HTML

	context.setClipText( html );

	context.debugInformation( "ChangeToStrongAndEm", "<< run" );

	return true;
}

function ChangeToStrongAndEm_getPhase() { return PHASE_CHANGE_TO_STRONG_EMS; }



