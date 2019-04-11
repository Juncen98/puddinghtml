//=========================================================================================================
//
// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
//
// Feature: Paste Fix
// Author:  JDH
// Module:  PasteManager.js
// Purpose:	Main Paste Manager class (and entry points).
// Updates:
//	5/17/02 - Started file control
//	5/31/02 - Added more comments
//
//=========================================================================================================

//  The paste manager which handles the entire clipboard conversion process

function PasteManager()
{
	// Initialize the phases array

	this.phases = new Array();

	// Put together the initial list of content handlers

	var handlers = new Array();
	handlers.push( new ParseMetaTags );
	handlers.push( new IdentifyMSApplications );
	handlers.push( new FixupMSGarbage );
	handlers.push( new RetainStructure );
	handlers.push( new FixWordParagraphSpacing );
	handlers.push( new DecomposeClasses );
	handlers.push( new RemoveUnsupportedAttributes );
	handlers.push( new RemoveParsingRequiredStructuralTags );
	handlers.push( new RemoveCSSClasses );
	handlers.push( new CleanupClasses );
	handlers.push( new DemoteToParagraphs );
	handlers.push( new SingleSpaceParagraphs );
	handlers.push( new MergeRedundantFontTags );
	handlers.push( new ChangeToStrongAndEm );

	// Iterate through the content handlers and put organize them by
	// priority number into the phases member.

	for( index in handlers )
	{
		// Get the phase descriptor from the handler

		var phase_desc = handlers[ index ].getPhase();
	
		// Get the phase priority

		var phase = phase_desc.priority;

		// If the phase is currently empty then create the array to put the
		// handlers into

		if ( this.phases[ phase ] == null )
		{
			this.phases[ phase ] = new Array();
			this.phases[ phase ].name = phase_desc.name;
			this.phases[ phase ].elements = new Array();
		}

		// Push the handler into the handlers list for this phase number

		this.phases[ phase ].elements.push( handlers[ index ] );
	}
}

PasteManager.prototype.run = PasteManager_run;
PasteManager.prototype.getClipHTML = PasteManager_getClipHTML;
PasteManager.prototype.getDebugText = PasteManager_getDebugText;
PasteManager.prototype.getDebugHTML = PasteManager_getDebugHTML;
PasteManager.prototype.getUsedStyles = PasteManager_getUsedStyles;

function PasteManager_run( clipDOM, clipCSS, targetDOM, targetCSS, targetIDs, settings )
{
	// Put together the new context

	this.pasteContext = new PasteContext( clipDOM, clipCSS, targetDOM, targetCSS, targetIDs, settings );

	// Start the debug trace

	for( var setting in settings )
		this.pasteContext.debugInformation( "PasteManager", "Setting : " + setting );
	this.pasteContext.debugInformation( "PasteManager", "Start run" );

	// Iterate through the phases

	for ( var phase_index = 0; phase_index < PHASE_MAX; phase_index++ )
	{
		// If we have elements in this phase then iterate through them

		if ( this.phases[ phase_index ] )
		{
			// Put out the debugging information

			this.pasteContext.debugInformation( "PasteManager", "Phase: " + this.phases[ phase_index ].name );

			// Get the phase elements and interate through them and run each one

			var phase = this.phases[ phase_index ].elements;
			for( handler_index in phase )
			{
				var handler = phase[ handler_index ];
				handler.run( this.pasteContext );
			}
		}
	}

	// Finish the debug trace

	this.pasteContext.debugInformation( "PasteManager", "End run" );
	this.pasteContext.updateClipDOM();

	if ( this.pasteContext.settingDefined( SETTINGS_NO_FILTER ) )
		return false;
	return true;
}

function PasteManager_getDebugText( ) { return this.pasteContext.getDebugText(); }

function PasteManager_getDebugHTML( ) { return this.pasteContext.getDebugHTML(); }

function PasteManager_getClipHTML( )
{
	// JDH: This is pretty brute force.  First we turn the whole document into text, then we 
	// find the start and end of the fragment, suck it out, and then remove the markers from the
	// finished piece.

	var full_html = this.pasteContext.getClipText();

	full_html = full_html.replace( /[\r\n]/g, " " );

	var out_html = full_html.match( /\<body(.*?)\<\/body\>/g );
	out_html = out_html.toString();

	out_html = out_html.replace( /\<body[^>]*\>/, "" );
	out_html = out_html.replace( /\<\/body\>/, "" );
	out_html = out_html.replace( /\<\!\-\-(\s*)StartFragment(\s*)\-\-\>/, "" );
	out_html = out_html.replace( /\<\!\-\-(\s*)EndFragment(\s*)\-\-\>/, "" );

	return out_html;
}

function PasteManager_getUsedStyles( )
{
	return this.pasteContext.getUsedStyles();
}


function smartPaste( bSilent, inputDOM, returnValue )
{
	// Check to make sure we aren't trying to paste in something huge
	if ( bSilent == false )
	{
		var text = inputDOM.documentElement.outerHTML;
		if ( text.length > MM.od_MaxThreshold)
		{
			alert( MM.MSG_odStop );
			returnValue[ 0 ] = true;
			return;
		}
		if ( text.length > MM.od_WarnThreshold )
		{
			if ( ! confirm( MM.MSG_odWarn ) )
			{
				returnValue[ 0 ] = true;
				return;
			}
		}
	}

	try {


		// Put together a new paste manager

		var mgr = new PasteManager();

		// Define the settings for the paste

		var settings = {};

		// Look for Contribute specific settings
		
		if ( dreamweaver.appName == "Contribute" )
		{
			settings[ SETTINGS_CONTRIBUTE ] = 1;
			
			if ( dreamweaver.getDocumentDOM().getCCSharedSetting_TextOnlyInNonTemplates() )
				settings[ SETTINGS_ETO ] = 1;

			if ( dreamweaver.getDocumentDOM().getCCSharedSetting_FontsEmitFontOrSpan() == "font" )
				settings[ SETTINGS_CHANGE_SPAN_TO_FONT ] = 1;

			if ( ! dreamweaver.getDocumentDOM().getCCSharedSetting_FontsLetUserChange() )
				settings[ SETTINGS_NO_CSS ] = 1;
			else if ( ! dreamweaver.getDocumentDOM().getCCSharedSetting_StyleCSS() )
				settings[ SETTINGS_NO_CSS ] = 1;

			if ( ! dreamweaver.getDocumentDOM().getCCSharedSetting_StyleHTMLHeadings() )
				settings[ SETTINGS_DEMOTE_TO_PARAGRAPHS ] = 1;


			if ( dreamweaver.getDocumentDOM().getCCSharedSetting_SingleSpaceParagraphsCSS() )
				settings[ SETTINGS_SINGLE_SPACE_P ] = 1;
		}

		else if ( dreamweaver.appName.match( /dreamweaver/i ) )
		{
			if ( dw.getPasteSettings().match( /text/ ) )
			{
				settings[ SETTINGS_TEXT ] = 1;
				settings[ SETTINGS_NO_CSS ] = 1;
			}
			else if ( dw.getPasteSettings().match( /paragraphs/ ) )
			{
				// this is an extra one --- just blocks, but demote all blocks to paragraphs, too
				settings[ SETTINGS_DEMOTE_TO_PARAGRAPHS ] = 1;
				settings[ SETTINGS_NO_CSS ] = 1;
				settings[ SETTINGS_LOW ] = 1;
			}
			else if ( dw.getPasteSettings().match( /structure/ ) )
			{
				settings[ SETTINGS_NO_CSS ] = 1;
				settings[ SETTINGS_STRUCTURE ] = 1;
			}
			else if ( dw.getPasteSettings().match( /basic/ ) )
			{
				settings[ SETTINGS_NO_CSS ] = 1;
				settings[ SETTINGS_BASIC ] = 1;
			}
			else if ( dw.getPasteSettings().match( /full/ ) || dw.getPasteSettings().match( /high/ ) )
			{
				settings[ SETTINGS_CREATE_CLASSES ] = 1;
				settings[ SETTINGS_NO_FONT_MAP ] = 1;
				settings[ SETTINGS_FULL ] = 1;
			}

			
			else // OLD NORMAL
			{
				settings[ SETTINGS_NO_CSS ] = 1;
				settings[ SETTINGS_LOW ] = 1;
			}
		}

		if ( dw.getPasteRetainBrTags() )
			settings[ SETTINGS_RETAIN_BRS ] = 1;

		if ( dw.getPasteCleanupWordPars() )
			settings[ SETTINGS_CLEANUP_WORD_PARS ] = 1;
			
		if ( dw.clipboardHasDWHTML() )
		{
			settings[ SETTINGS_DW_HTML ] = 1;
		}
		else
		{
			//we don't convert <b> and <i> to <strong> and <em> when pasting within DW
			if ( dw.getPreferenceString("General Preferences", "Avoid Bold and Italic", 'TRUE') == 'TRUE')
				settings[ SETTINGS_USE_EMPHASIS ] = 1;
				
			if ( dw.getPreferenceString("General", "Use <strong> and <em> in place of <b> and <i>", "") )
				settings[ SETTINGS_USE_EMPHASIS ] = 1;
		}

		//if document is xhmtl, convert <b> and <i> to <strong> and <em>
		if (dw.getDocumentDOM() && dw.getDocumentDOM().getIsXHTMLDocument())
			settings[ SETTINGS_USE_EMPHASIS ] = 1;

		// Get the names of the classes in the target

		var targetCSS = new CSSReferenceClassCollection();
		var targetIDs = new CSSReferenceClassCollection();

		// Here we add referenced classes to the target CSS representative.  All that we
		// use is the class name.
		var styles = dreamweaver.cssStylePalette.getStyles(false, true);
		for ( var index in styles )
		{
			targetCSS.add( styles[ index ] );
		}

		var idRules = dreamweaver.cssStylePalette.getStyles(true, true);
		for ( var index in idRules )
		{
			targetIDs.add( idRules[ index ] );
		}

		// Get the CSS definitions from the clipboard

		var clipCSS = new CSSClassCollection( targetCSS );

		Utils_LoadCSSFromDOM( inputDOM, clipCSS );

		var filtered = mgr.run( inputDOM, clipCSS, null, targetCSS, targetIDs, settings );

		if ( filtered )
		{
			var used_styles = mgr.getUsedStyles();

			var out = mgr.getClipHTML();
			var htmlOut = "";
			htmlOut += "<html>\n";
			var anyStyles = false;
			if (used_styles.length > 0)
				anyStyles = true;

			if ( anyStyles )
			{
				htmlOut += "<!--StartFragment-->";
				htmlOut += "<head>";
				htmlOut += "<style type=\"text/css\"><!--\n" + used_styles + "--></style>";
				htmlOut += "</head>";
				htmlOut += "<body>";
			}
			else
			{
				htmlOut += "<body>";
				htmlOut += "<!--StartFragment-->";
			}
			
			htmlOut += out;

			if ( anyStyles )
			{
				htmlOut += "</body>\n";
				htmlOut += "<!--EndFragment-->\n";
			}
			else
			{
				htmlOut += "<!--EndFragment-->\n";
				htmlOut += "</body>\n";
			}
			htmlOut += "</html>\n";
			inputDOM.documentElement.outerHTML = htmlOut;
		}

		dw.forceGarbageCollection();
	}
	catch( e )
	{
		alert( MM.MSG_odProblem );
		dw.getDocumentDOM().clipPasteText();
		returnValue[ 0 ] = true;
	}

	return true;
}
