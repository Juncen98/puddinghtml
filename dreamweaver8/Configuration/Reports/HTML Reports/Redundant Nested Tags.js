// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// include ../reports.js

//***************        GLOBALS       ***************

var helpDoc = MM.HELP_cmdMyExtension;

var CUR_URL = '';

var bPreserveEmptyHeader;

var   strClassAttrib       = "CLASS";
var   strStyleAttrib       = "STYLE";

var redundantTagCandidates = new Array( "TT", "I", "B", "U", "S", "STRIKE", "BIG"
                              , "SMALL", "SUB", "SUP", "EM", "STRONG"
                              , "DFN", "CODE", "SAMP", "KBD", "VAR"
                              , "CITE", "XMP"
                              , "FONT"
                              , "CENTER"
                              , "SPAN" );


//***************          API         ***************

//---------------
// Function: configureSettings
// Description: Standard report API, used to initialize and load
//  the default values. Does not initialize the UI.
//
function configureSettings() {
  return false;
}

//---------------
// Function: commandButtons
// Description: Standard report API, like commands the return value
//  controls the display of command buttons in the settings dialog.
//
function commandButtons() {
  return new Array(
        MM.BTN_Process,  "processFile(dw.getDocumentDOM().URL)", //???
        MM.BTN_Cancel,   "cleanupUI()"
    );
}


//---------------
// Function: processFile
// Description: Report command api called during file processing.
//
function processFile (fileURL) {
  if (!isHTMLType(fileURL))
    return;
  scanDocument(fileURL);
}


//***************    LOCAL FUNCTIONS   ***************


//--------------
//
function cleanupUI() { //??? temporary for development
  window.close();
}

//--------------
//
function applyParams() { //??? temporary for development

}

//--------------
//
function isQuote( c )
{
   return( c == '\"' || c == '\'' );
}

//--------------
//
function isAlpha( c )
{
   var isoval = c.charCodeAt(0);
   return( (isoval >= "A".charCodeAt(0) && isoval <= "Z".charCodeAt(0)) ||
           (isoval >= "a".charCodeAt(0) && isoval <= "z".charCodeAt(0)));
}

//--------------
//
// Match a <xxx or </xxx tag; note that xxx must be alphabetical
function isTagBegin( currentchar, nextchar )
{
   return( currentchar == '<' && (isAlpha( nextchar ) || nextchar == '/') );
}

//--------------
//
// Note that '>' should be ignored within quotes inside tag brackets
function isTagEnd( c )
{
   return( c == '>' );
}

//--------------
//
function isWhite( c )
{
   return( c == ' ' || c == '\t' || c == '\n' || c == '\r' );
}

//--------------
//
function arrayContains( curArr, item )
{
   var nElements = curArr.length;
   for( var i = 0; i < nElements; i++ )
      if ( curArr[i] == item )
         return true;

   return false;
}


//--------------
// parseAttributes()
//
// Parse the attributes from within the start tag of a given
// node per the rules found here: http://www.w3.org/TR/WD-html-lex/
//
// Return an array of arrays (unfortunately; the associative
// aspect of arrays is overloaded with "instance properties",
// so arrays already contain prototype methods/properties
// value pairs):
//
//          arr[0] --> attributes array
//          arr[1] --> values array
//
// The value for a given attribute are in the same position
// at the attribute within the values array.  Singleton name
// tokens have an empty ("") or undefined value.
//
// If bStripQuotes is true, then any "outer" quotes around an
// attribute value are stripped, e.g., the value in
//
//    NAME="bob's name"
//
// is returned as: bob's name.  If bStripQuotes is false, that
// value is returned as "bob's name"
//
// If bMakeUpper is true, all attribute/value strings are normalized
// to upper case
//
function parseAttributes( node, bStripQuotes, bMakeUpper )
{
   var   tagstr         = node.outerHTML;
   var   pos            = 0;
   var   prevChar       = null;
   var   currentChar    = null;
   var   currentQuote   = null;
   var   arrAttribs     = new Array();
   var   arrValues      = new Array();
   var   arrIdx         = 0;
   var   attrib         = "";
   var   value          = "";
   var   bValueIsEmpty  = false;
   var   bInsideQuote   = false;
   var   bAccumValue    = false;
   var   bAttribReady   = false;
   var   bSkipToWhite   = true;  // initially true to skip "<tag "

   while( pos < node.outerHTML.length )
   {
      prevChar     = currentChar;
      currentChar  = tagstr.charAt( pos++ );

      // Handle quote state; remember actual quote that
      // flipped the state so we match ' and " right
      //
      if ( isQuote( currentChar ) )
      {
         if ( bInsideQuote )
         {
            if ( currentChar == currentQuote )
            {
               // Coming out of quoted region; turn quotes off
               bInsideQuote = false;
               currentQuote = null;
               if ( bStripQuotes )
               {
                  // Careful; make sure ATTR="" works even when we're
                  // stripping quotes off values
                  bValueIsEmpty = true;
                  continue;
               }
            }
         }
         else
         if ( bAccumValue && value == "" ) // only turn quotes on after '=' and
         {                                 // before accumulating anything; e.g.,
            // Turn quotes on              // ignore the quote in ATTR=xxx"xxx
            bInsideQuote = true;
            currentQuote = currentChar;
            if ( bStripQuotes )
               continue;
         }
      }

      // Handle the terminating character; write any attribute/value
      // we may have been accumulating and we're done.
      //
      if ( !bInsideQuote && isTagEnd( currentChar ) )
      {
         if ( attrib != "" )
         {
            arrAttribs[ arrIdx ]  = bMakeUpper ? attrib.toUpperCase() : attrib;
            arrValues[ arrIdx++ ] = bMakeUpper ? value.toUpperCase() : value;
            attrib = "";
            value  = "";
            bAttribReady = false;
            bAccumValue  = false;
         }
         break;
      }

      // Accumulate characters; if bAccumValue is true, we're on the
      // right side of an "=", otherwise we're on the left side or accumulating
      // a singleton name token.  I don't think quoted regions make sense
      // on the left side either.
      //
      if ( !bInsideQuote && !bAccumValue )
      {
         // first skip to white after tag name <xxxx
         if ( bSkipToWhite && !isWhite( currentChar ) )
            continue;

         bSkipToWhite = false;

         // Whitespace not inside quotes; if we're accumulating
         // an attribute, it's ready (the whitespace terminates it);
         if ( isWhite( currentChar ) )
         {
            bAttribReady = attrib != "";
         }
         else
         {
            // Non-white space; if we have an equals sign, switch
            // over to accumulate the value
            if ( currentChar == '=' )
            {
               bAttribReady = attrib != "";
               bAccumValue  = true;
            }
            else
            {
               // Unquoted non-white non-value -- accumulate
               // as name token.  If there's a name token ready,
               // save it as a singleton first.
               //
               if ( bAttribReady )
               {
                  arrAttribs[ arrIdx++ ] = bMakeUpper ? attrib.toUpperCase() : attrib;
                  attrib = "";
                  bAttribReady = false;
               }

               attrib += currentChar;
            }
         }
      }
      else
      {
         // We're accumulating a value
         //

         if ( !bInsideQuote && isWhite( currentChar ) )
         {
            // Swallow whitespace until we either get a value
            // or we terminate

            if ( value != "" || bValueIsEmpty )
            {
               arrAttribs[ arrIdx ]  = bMakeUpper ? attrib.toUpperCase() : attrib;
               arrValues[ arrIdx++ ] = bMakeUpper ? value.toUpperCase() : value;
               attrib = "";
               value  = "";
               bAttribReady  = false;
               bAccumValue   = false;
               bValueIsEmpty = false;
            }
         }
         else
         {
            // We're inside a quote, or we're not terminated -- keep
            // accumulating
            //
            value += currentChar;
         }
      }
   }

   // We're done; package up our arrays and return them
   //
   return new Array( arrAttribs, arrValues );
}



//--------------
// hasRedundantParent()
//
// Return true if the given node is redundant with a
// controlling parent.  Redundant parent/children must
// have identical attribute/value sets.
//
function hasRedundantParent( node )
{
   var rc = false;

   if ( arrayContains(redundantTagCandidates,  node.tagName ) )
   {
      var parent  = node.parentNode;

      // Find controlling parent
      while( parent != null )
      {
         if ( node.tagName == parent.tagName )
         {
            // Compare parent and child attribute name/value pairs
            var cArrs   = parseAttributes( node, true, true );
            var pArrs   = parseAttributes( parent, true, true );
            var cNames  = cArrs[0];
            var cValues = cArrs[1];
            var pNames  = pArrs[0];
            var pValues = pArrs[1];

            if ( cNames.length == pNames.length && cValues.length == pValues.length )
            {
               cNames.sort();
               pNames.sort();
               cValues.sort();
               pValues.sort();

               var len = cNames.length;
               for( var i = 0; i < len; i++ )
               {
                  // note in js: undefined == undefined is true
                  if ( pNames[i]  != cNames[i] || cValues[i] != pValues[i] )
                     break;
               }

               rc = (i == len); // if we got through everything they're the same
            }

            if ( rc )  // if we're redundant, we're done
               break;

            // Otherwise, if we're not actually overriding anything on this
            // parent, we may still be redundant with an uber parent.  Cycle through
            // the child's attributes and if none are present on parent keep going
            //
            var bKeepGoing = true;
            for( var i = 0; i < cNames.length; i++ )
            {
               if ( arrayContains(pNames,  cNames[i] ) )
               {
                  bKeepGoing = false;
                  break;
               }
            }

            if ( !bKeepGoing )
               break;
         } else if ( node.tagName == 'TABLE' || parent.tagName == 'TABLE') {
            break;
         }

         parent = parent.parentNode;
      }
   }

   return rc;
}


//--------------
// emptyHeaderStateTextHandler()
//
// This text node callback is used by pass two to flip
// the global bPreserveEmptyHeader state to true -- we
// just encountered text, so the next empty header
// found will force a carriage return and thus can't
// be removed.  Empty headers after that however can
// be removed until the next piece of text is encountered...
//
function emptyHeaderStateTextHandler( node )
{
   bPreserveEmptyHeader = true;
   return true;
}


//--------------
// processElement()
//
// Process a node of ELEMENT type within the user's document
// This is a callback from traverse() used during the main
// removal traversal.
//
function processElement(elementNode, root)
{
  // Don't report tags with style information
  if ( hasRedundantParent( elementNode ) )
  {
    reportItem(REP_ITEM_WARNING, CUR_URL,
      printString(REPORT_EMPTY_TAG, elementNode.tagName),
      root.nodeToSourceViewOffsets(elementNode));
  }

   return true; // continue traverse
}

//--------------
// scanDocument
function scanDocument(fileURL) {
  // Traverse document, processing nodes
  var root = dw.getDocumentDOM(fileURL);
  CUR_URL = fileURL;

  if ( root != null && root.hasChildNodes() )
  {
    traverse( root
            , processElement
            , emptyHeaderStateTextHandler
            , null // no comment hander for this pass
            , root // user data - passing document root to compute offsets.
             );

  }
}

