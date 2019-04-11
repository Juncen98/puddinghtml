//=========================================================================================================
//
// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
//
// Feature: Paste Fix
// Author:  JDH
// Module:  PMGlobals.js
// Purpose:	The globals for the Paste Fix pipeline.
// Updates:
//	5/17/02 - Started file control
//
//=========================================================================================================

// The different types of content in the paste system

var CONTENT_TYPE_HTML = 1;
var CONTENT_TYPE_TEXT = 2;

// Definitions for the phases of content filtering

	// Preliminary and overall sections to the filter

var PHASE_ANALYZE                   = { priority:  1, name: "Analyze" };
var PHASE_IDENTIFICATION            = { priority:  2, name: "Identification" };
var PHASE_CONVERSION                = { priority:  3, name: "Conversion" };
var PHASE_REMOVE_NON_STANDARD_PRE   = { priority:  4, name: "Remove Non-Standard - Pre" };
var PHASE_REMOVE_NON_STANDARD       = { priority:  5, name: "Remove Non-Standard" };
var PHASE_REMOVE_NON_STANDARD_POST  = { priority:  6, name: "Remove Non-Standard - Post" };
var PHASE_SCAN                      = { priority:  7, name: "Scan" };
var PHASE_FIXUP                     = { priority:  8, name: "Fixup" };

	// Phases to work with particular pieces of the document

	// Work on the structure of the document

var PHASE_CONFORM_STRUCTURE_PRE     = { priority: 10, name: "Conform Structure - Pre" };
var PHASE_CONFORM_STRUCTURE         = { priority: 15, name: "Conform Structure" };
var PHASE_CONFORM_STRUCTURE_POST    = { priority: 19, name: "Conform Structure - Post" };

	// Work on the URLs

var PHASE_CONFORM_URLS_PRE          = { priority: 20, name: "Conform URLs - Pre" };
var PHASE_CONFORM_URLS              = { priority: 25, name: "Conform URLs" };
var PHASE_CONFORM_URLS_POST         = { priority: 29, name: "Conform URLs - Post" };

	// Work on the Javascript

var PHASE_CONFORM_JAVASCRIPT_PRE    = { priority: 30, name: "Conform JavaScript - Pre" };
var PHASE_CONFORM_JAVASCRIPT        = { priority: 35, name: "Conform JavaScript" };
var PHASE_CONFORM_JAVASCRIPT_POST   = { priority: 39, name: "Conform JavaScript - Post" };

	// Work on the fonts

var PHASE_CONFORM_FONTS_PRE         = { priority: 40, name: "Conform Fonts - Pre" };
var PHASE_CONFORM_FONTS             = { priority: 45, name: "Conform Fonts" };
var PHASE_CONFORM_FONTS_POST        = { priority: 49, name: "Conform Fonts - Post" };

	// Work on CSS styles

var PHASE_CONFORM_CSS_STYLES_PRE    = { priority: 50, name: "Conform CSS Styles - Pre" };
var PHASE_CONFORM_CSS_STYLES        = { priority: 55, name: "Conform CSS Styles" };
var PHASE_CONFORM_CSS_STYLES_POST   = { priority: 59, name: "Conform CSS Styles - Post" };

	// Work on CSS classes

var PHASE_CONFORM_CSS_CLASSES_PRE   = { priority: 60, name: "Conform CSS Styles - Pre" };
var PHASE_CONFORM_CSS_CLASSES_ADD   = { priority: 62, name: "Conform CSS Styles - Add Classes" };
var PHASE_CONFORM_CSS_CLASSES_MERGE = { priority: 66, name: "Conform CSS Styles - Merge Classes" };
var PHASE_CONFORM_CSS_CLASSES_POST  = { priority: 69, name: "Conform CSS Styles - Post" };

	// Work on any other aspects of the body

var PHASE_CONFORM_OTHER_PRE         = { priority: 70, name: "Conform Other - Pre" };
var PHASE_CONFORM_OTHER             = { priority: 75, name: "Conform Other" };
var PHASE_CONFORM_OTHER_POST        = { priority: 79, name: "Conform Other - Post" };

//more meaningfull names for debugging
var PHASE_PARSE_META_TAGS			= { priority: 1, name: "Parse Meta Tags"};
var PHASE_FIXUP_MS_GARBAGE			= { priority: 8, name: "Fixup MS Garbage"};
var PHASE_ID_MS_APPS				= { priority: 2, name: "Identify MS Applications"};
var PHASE_RETAIN_STRUCTURE			= { priority: 15, name: "Retain Structure"};
var PHASE_FIX_WORD_PARA_SPACING		= { priority: 19, name: "Fix Word Paragraph Spacing"};
var PHASE_REMOVE_UNSUPPORTED_ATTRS	= { priority: 75, name: "Remove Unsupported Attributes"};
var PHASE_REMOVE_CSS_CLASSES		= { priority: 9, name: "Remove CSS Classes"};
var PHASE_CLEANUP_CSS_CLASSES		= { priority: 79, name: "Cleanup CSS Classes"};
var PHASE_REMOVE_PARSING_REQD_STRUCT_TAGS = { priority: 98, name: "Remove Parsing Required Structure Tags"};
var PHASE_DECOMPOSE_CLASSES			= { priority: 76, name: "Decompose Classes"};
var PHASE_DEMOTE_TO_PARAGRAPHS		= { priority: 10, name: "Demote to Paragraphs"};
var PHASE_SINGLE_SPACE_PARAGRAPHS	= { priority: 99, name: "Single Space Paragraphs"};
var PHASE_MERGE_REDUNDANT_FONTS		= { priority: 90, name: "Merge Redundant Font Tags"};
var PHASE_CHANGE_TO_STRONG_EMS		= { priority: 100, name: "Change to Strong and Ems"};

	// Alter the document based on context

var PHASE_CONTEXTUALIZE             = { priority: 80, name: "Contextualize" };

	// Optimize the HTML

var	PHASE_OPTIMIZE                  = { priority: 90, name: "Optimize" };

	// Finalize changes to the document

var PHASE_FINALIZE			        = { priority: 100, name: "Finalize" };

	// The maximum phase priority number

var PHASE_MAX = 110;

	// Debug constants that indicate a severity of the message

var DEBUG_CRITICAL    = 1;
var DEBUG_WARNING     = 2;
var DEBUG_INFORMATION = 3;

	// The different settings 

var SETTINGS_CHANGE_SPAN_TO_FONT       = "CHANGE_SPAN_TO_FONT";
var SETTINGS_CONTRIBUTE                = "CONTRIBUTE";
var SETTINGS_ETO                       = "ETO";
var SETTINGS_LOW                       = "LOW";
var SETTINGS_TEXT                      = "TEXT";
var SETTINGS_STRUCTURE                 = "STRUCTURE";
var SETTINGS_BASIC                     = "BASIC";
var SETTINGS_FULL                      = "FULL";
var SETTINGS_RETAIN_BRS                = "RETAIN_BRS";
var SETTINGS_CLEANUP_WORD_PARS         = "CLEAN_WORD_PS";
var SETTINGS_NO_CSS                    = "NO_CSS";
var SETTINGS_DEMOTE_TO_PARAGRAPHS      = "DEMOTE_TO_P";
var SETTINGS_SINGLE_SPACE_P            = "SINGLE_SPACE_P";
var SETTINGS_USE_EMPHASIS              = "USE_EMPHASIS";
var SETTINGS_NO_FILTER                 = "NO_FILTER";
var SETTINGS_CREATE_CLASSES            = "CREATE_CLASSES";
var SETTINGS_NO_FONT_MAP               = "NO_FONT_MAP";
var SETTINGS_DW_HTML                   = "DW_HTML";
