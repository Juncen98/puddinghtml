//SHARE-IN-MEMORY=true
//
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//
// ErrMsg.js
//
// Logging functions for accumulating tracing output into
// an array of "log pages" for eventual display in a
// dialog box.
//
// MM_enableLogging()
// MM_disableLogging()
// MM_note()
// MM_error()
// MM_assert()
// MM_showLog()
// MM_clearLog()
// MM_newLogPage()
//
// MM_format()
//
// ------------ Package variables -------------
//
var _ErrMsg_bInitialized;

var _ErrMsg_bLogEnabled;
var _ErrMsg_dtToday;
var _ErrMsg_logPage;
var _ErrMsg_logPageLines;
var _ErrMsg_arrLogPages;
var _ErrMsg_linesPerPage;
var _ErrMsg_logPageHeader;
var _ErrMsg_logPageHeaderLines;

var _ErrMsg_ErrorPrefix;
var _ErrMsg_AssertPrefix;

// Initialize package variables here
//
function _ErrMsg_Initialize()
{
   if ( _ErrMsg_bInitialized == null )
   {
      // alert( "ErrMsg.js initializing" );

      _ErrMsg_bLogEnabled         = true;
      _ErrMsg_ErrorPrefix         = "*E-: ";
      _ErrMsg_AssertPrefix        = "*Assertion failure: ";
      _ErrMsg_logPageHeader       = "Log page ";
      _ErrMsg_logPageHeaderLines  = 3;
      _ErrMsg_linesPerPage        = 25;

      _ErrMsg_initializeLog();

      _ErrMsg_bInitialized        = true;
   }
}

// ------------ External functions ------------
//
// Note: all external functions must call _ErrMsg_Initialize()
// to initialize the package before using any package
// global variables!
//

function MM_enableLogging()
{
    _ErrMsg_Initialize();
    _ErrMsg_bLogEnabled = true;
}

function MM_disableLogging()
{
    _ErrMsg_Initialize();
    _ErrMsg_bLogEnabled = false;
}

// MM_note( str )
//
// Output an informational line to the log; at least one
// string argument is required; optional arguments with
// an initial format string containing '%s' tokens ala
// printf:
//
//       MM_note( "etc %s etc %s", str1, str2 )
//
// are also allowed
//
function MM_note( str )    // [, ...]
{
   _ErrMsg_Initialize();
   if ( _ErrMsg_bLogEnabled )
   {
      if ( MM_note.arguments.length > 1 )
         _ErrMsg_logPage += _ErrMsg_format( MM_note.arguments ) + "\n";
      else
         _ErrMsg_logPage += str + "\n";

      if ( ++_ErrMsg_logPageLines > _ErrMsg_linesPerPage )
         _ErrMsg_advanceLogPage();
   }
}

// MM_error( str )
//
// Output an error to the log; can take format string and
// optional arguments like MM_note; see MM_note.
//
function MM_error( str )   // [, ...]
{
   _ErrMsg_Initialize();

   if ( MM_error.arguments.length > 1 )
      MM_note( _ErrMsg_ErrorPrefix + _ErrMsg_format( MM_error.arguments ) );
   else
      MM_note( _ErrMsg_ErrorPrefix + str );
}

// MM_assert()
//
// Debugging aid; failed assertions are noted in the log
//
function MM_assert( b, explanation )
{
   if ( !b )
   {
      _ErrMsg_Initialize();
      MM_note( _ErrMsg_AssertPrefix + explanation );
   }
}

// MM_format()
//
// Return a formated string; arguments are printf-like,
// e.g.:
//       MM_format( "etc %s etc %s", str1, str2 )
//
function MM_format()
{
   _ErrMsg_Initialize();
   return( _ErrMsg_format( MM_format.arguments ) );
}

// MM_showLog()
//
// Display log pages in a pop-up dialog
//
function MM_showLog()
{
   // To do: A dismissible dialog box (ala confirm() ) would
   // be nice to allow the cancelling of stepping through log
   // output at any page.
   //
   _ErrMsg_Initialize();
   if ( _ErrMsg_bLogEnabled )
   {
      if ( _ErrMsg_logPageLines > _ErrMsg_logPageHeaderLines )
         _ErrMsg_advanceLogPage();

      var nPages = _ErrMsg_arrLogPages.length;
      for( var i = 0; i < nPages; i++ )
         if ( alert( _ErrMsg_arrLogPages[i] ) )  // this doesn't work; alert always returns false
            break;
   }
}

// MM_clearLog()
//
// Throw away existing log and start a new one
//
function MM_clearLog()
{
   _ErrMsg_Initialize();
   _ErrMsg_initializeLog();
}

// MM_newLogPage()
//
// Advance the log page
//
function MM_newLogPage()
{
   _ErrMsg_Initialize();
   _ErrMsg_advanceLogPage();
}

//
// ------------ Internal functions ------------
//

// Push the current log page on the log page array
// and initialize a new current log page
//
function _ErrMsg_advanceLogPage()
{
   _ErrMsg_logPage      = _ErrMsg_arrLogPages.push( _ErrMsg_logPage );
   _ErrMsg_logPage      = _ErrMsg_logPageHeader + (_ErrMsg_arrLogPages.length + 1 ) + "\n\n";
   _ErrMsg_logPageLines = _ErrMsg_logPageHeaderLines;
}

function _ErrMsg_initializeLog()
{
   _ErrMsg_arrLogPages  = new Array();
   _ErrMsg_logPage      = "";
   _ErrMsg_logPageLines = _ErrMsg_logPageHeaderLines;
}

// Assemble an array of string arguments into a single
// string to return.  The first string is should be
// the format string with %s for string substitution
// with the other elements of the array, e.g. like
// printf arguments collapsed into an array:
//       [ "blah blah %s blah %s", str1, str2 ]
//
function _ErrMsg_format( strArray )
{
   var nElements = strArray.length;

   if ( !nElements )
      return "";

   if ( nElements == 1 )
      return strArray[0];

   // Otherwise there's some formatting to do
   //
   var strResult = "";
   var arrIdx    = 0;
   var startPos  = 0;
   var strFormat = strArray[ arrIdx++ ];
   var endPos    = strFormat.indexOf( "%s", startPos );

   if ( endPos == -1 )
      return strFormat;

   while( startPos < strFormat.length )
   {
      strResult += strFormat.substring( startPos, endPos );
      if ( arrIdx < nElements )
         strResult += strArray[ arrIdx++ ];

      startPos = endPos + 2;
      endPos   = strFormat.indexOf( "%s", startPos );

      if ( endPos == -1 )
         endPos = strFormat.length;
   }

   return strResult;
}
