//
// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
// ----------------------------------------------------
//
// Clean Up HTML.js
//
// This command cleans up certain categories of superfluous
// HTML within the user document without effecting document
// layout.  This command makes two passes over the users
// document depending on the options selected; see
// cleanUpDocument() for more details.
//
// Version 3.0
// Added new array class for cleanup HTML contains function.
// ----------------------------------------------------

//
// Global variables -- see initialize() for more comments.
// Dreamweaver doesn't currently initialize any globals
// loaded in auxilliary scripts through <SCRIPT SRC=..>,
// so we explicitly initialize these initialize().
//
var helpDoc = MM.HELP_cmdCleanUpHTML;

var cbRemoveEmptyTags;
var cbRemoveRedundant;
var cbCombineFonts;
var cbRemoveTags;
var cbRemoveComments;
var cbRemoveDWComments;
var cbShowLog;
var tbTagsToRemove;
var numEmptyRemoved;
var numRedundantRemoved;
var numTagsRemoved;
var numCommentsRemoved;
var numFontsCombined;
var arrTagsToRemove = new Array(); // Array
var strClassAttrib;
var strStyleAttrib;
var arrDWCommentTags = new Array();
var arrDWCommentNonTags = new Array();
var arrDWTagPrefixes = new Array();
var emptyRemovalCandidates = new Array();
var redundantTagCandidates = new Array();
var combinableTagCandidates = new Array();
var bPreserveEmptyHeader;
var bRemovedTracing;
var arrXHTMLresults;
var traverseLevel = 0;

//------------------ Commands API --------------------

function commandButtons()
{
   return new Array( MM.BTN_OK,     "cleanUpDocument()"  // main entry point
                   , MM.BTN_Cancel, "window.close()"
                   , MM.BTN_Help,   "displayHelp()");
}

function canAcceptCommand()
{
  var retVal = false;
  if (dw.getDocumentDOM() && dw.getDocumentDOM().getParseMode() == 'html' && (dw.getFocus() == 'document' || dw.getFocus(true) == 'html' || dw.getFocus() == 'textView')){
    retVal = true;
  }
  return retVal;
}

//
// ------- Local Clean Up command functions ----------
//

// Return true if curArr contains an entry equal to item.
function arrayContains( curArr, item )
{
   var nElements = curArr.length;
   for( var i = 0; i < nElements; i++ )
      if ( curArr[i] == item )
         return true;

   return false;
}

// Return true if curArr contains an entry that is a string prefix of item.
function arrayContainsPrefix( curArr, item )
{
   var itemLength = item.length;
   var nElements = curArr.length;
   for( var i = 0; i < nElements; i++ )
   {
      var curItem = curArr[i];
      if ( curItem.length <= itemLength &&
         curItem == item.substring(0, curItem.length) )
         return true;
   }

   return false;
}

function isQuote( c )
{
   return( c == '\"' || c == '\'' );
}

function isAlpha( c )
{
   var isoval = c.charCodeAt(0);
   return( (isoval >= "A".charCodeAt(0) && isoval <= "Z".charCodeAt(0)) ||
           (isoval >= "a".charCodeAt(0) && isoval <= "z".charCodeAt(0)));
}

// Match a <xxx or </xxx tag; note that xxx must be alphabetical
function isTagBegin( currentchar, nextchar )
{
   return( currentchar == '<' && (isAlpha( nextchar ) || nextchar == '/') );
}

// Note that '>' should be ignored within quotes inside tag brackets
function isTagEnd( c )
{
   return( c == '>' );
}

function isWhite( c )
{
   return( c == ' ' || c == '\t' || c == '\n' || c == '\r' );
}

function isAllWhite( str )
{
   for( var i = 0; i < str.length; i++ )
   {
      if ( !isWhite( str.charAt( i ) ) )
         return( false );
   }

   return( true );
}

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
                  MM_assert( bAccumValue, MSG_ParseErrEndQuote );
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
               MM_assert( bAttribReady, MSG_ParseErrUnexpectedEQU );
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
         MM_assert( bAttribReady, MSG_ParseErrUnexpectedEQU );

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
   MM_assert( !bAccumValue, MSG_ParseErrValue );
   return new Array( arrAttribs, arrValues );
}

// findCombinableParent()
//
// Return a parent node with which the given node may have
// its attributes combined with.  This routine trusts that
// caller has verified that the combineTagName is a member
// of combinableTagCandidates!  A combinable parent is
// a direct parent up the tree who is the parent of no
// other children (which would not want to inherit the
// characteristics of the given child whose attributes
// will migrate up), e.g.:
//
// <FONT face="arial"><FONT color="blue">text</FONT></FONT>
//
// and
//
// <FONT face="arial"><B><FONT color="blue">text</FONT></B></FONT>
//
// are combinable, but
//
// <FONT face="arial"><B>x<FONT color"blue">text</FONT></B></FONT>
//
// is not as the 'x' textual child should not inherit the
// blue characteristic.  This routine walks the "direct"
// (childNodes.length == 1) parent chain.
//
function findCombinableParent( node, combineTagName )
{
   MM_assert( arrayContains(combinableTagCandidates, combineTagName ) );

   var rtnNode = null;

   while ( (node.parentNode != null)    &&
        (node.parentNode.childNodes.length == 1) )
   {
      if ( combineTagName == node.parentNode.tagName ) {
         rtnNode = node.parentNode;
         break;
      }
      if (node.parentNode.innerHTML.length == node.outerHTML.length && node.parentNode.innerHTML == node.outerHTML ) {// parent contains only this child tree
         node = node.parentNode;
      } else {
         break;
      }
   }

   return rtnNode;
}

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

// isAllWhiteNodeSignificant()
//
// Given a node whose inner html is all white, this
// routine examines the node's siblings and returns
// true if the whitespace is significant and false
// otherwise.
//
function isAllWhiteNodeSignificant( node )
{

   if (!node.parentNode) return false;

   var siblings   = node.parentNode.childNodes;
   var nSiblings  = siblings.length;
   var siblingIdx = 0;

   // If we're an only child, then we really need
   // to look at uncles and aunts.
   if ( (nSiblings == 1) && (node.parentNode != null) && (node.parentNode.nodeType != Node.DOCUMENT_NODE) )
      return( isAllWhiteNodeSignificant( node.parentNode ) );

   // Find self as parent's child first
   for( ; siblingIdx < nSiblings; siblingIdx++ )
      if ( siblings.item( siblingIdx ) == node )
         break;

   MM_assert( siblingIdx < nSiblings, MSG_ErrParentChild );

   // If sibling to the left has trailing whitespace,
   // our current all white node isn't significant.  Note
   // we can just look to our immediate left rather than go
   // to zero because any empty siblings to the left will
   // have already been gobbled.
   //
   var lSibling = siblingIdx > 0 ? siblings.item( siblingIdx - 1) : null;
   if ( lSibling != null )
   {
      if ( lSibling.nodeType == Node.TEXT_NODE )
      {
         if ( (lSibling.data.length > 0) &&
              isWhite( lSibling.data[ lSibling.data.length - 1 ] ) )
            return false;
      }
      else
      if ( lSibling.nodeType == Node.ELEMENT_NODE )
      {
         // non text left sibling
         if ( (lSibling.innerHTML.length > 0) &&
              isWhite( lSibling.innerHTML[ lSibling.innerHTML.length - 1 ] ) )
            return false;
      }
      // else go on to our right to determine our significance
   }

   // Now see if there's significant leading whitespace to
   // the immediate right that might render our all white
   // current node insignificant
   //
   var rSibling = null;
   siblingIdx++;
   while( siblingIdx < nSiblings )
   {
      rSibling = siblings.item( siblingIdx );

      if ( rSibling.nodeType == Node.TEXT_NODE )
      {
         // We have a textual sibling to the right; if
         // this guy doesn't have leading whitespace,
         // we're significant, otherwise we're not.
         if ( rSibling.data.length > 0 )
            return( !isWhite( rSibling.data[0] ) );

         // else empty text node
      }
      else
      if ( rSibling.nodeType == Node.ELEMENT_NODE )
      {
         // We have a non-empty non-text node to the
         // right; if this guy doesn't have leading
         // whitespace we're significant, otherwise not
         if ( rSibling.innerHTML.length > 0 )
            return( !isWhite( rSibling.innerHTML[0] ) );

         // else empty non-text node...
      }

      siblingIdx++;
   }

   // If we got here there's nothing interesting to the
   // right of this all white node, so it's as if we're
   // an only child.  The DOCUMENT_NODE check is just for
   // safety; there shouldn't be a way to get that high on
   // empty markup node removal...

   if ( node.parentNode != null && node.nodeType != Node.DOCUMENT_NODE )
      return( isAllWhiteNodeSignificant( node.parentNode ) );

   // otherwise nothing left -- we really are insignificant...
   return false;
}

// isRemovableEmptyTag()
//
// Return true if this tag can be safely removed from the
// document, false otherwise.
//
function isRemovableEmptyTag( tagNode )
{
   // First this tag must be an empty removal candidate with no class info
   //
   if ( arrayContains(emptyRemovalCandidates,  tagNode.tagName ) && !hasClassAttribute( tagNode ) )
   {
      // Short-circuit for named anchor tags; empty named anchors
      // should be left alone
      if ( "A" == tagNode.tagName && (null != tagNode.getAttribute( "NAME" )) )
         return false;

      // If the innerHTML length is zero, it's empty and
      // can be safely removed *unless* it's a heading
      // tag -- the first empty heading tag after text
      // forces a carriage return.
      //
      if ( tagNode.innerHTML.length == 0 )
      {
         return true;
      }
      else
      if ( isAllWhite( tagNode.innerHTML ) && !isAllWhiteNodeSignificant( tagNode ) )
      {
         // All empty tag candidates (generally character markup)
         // spanning only whitespace can also be removed if the
         // tag is not within text, or if the tag to the right of
         // text that ends in whitespace or to the left of text
         // that begins with whitespace....
         return true;
      }
   }

   return false;
}

// Using a tracing image in Dreamweaver attaches up to four proprietary
// attributes to the body tag. We want to remove these attributes if Remove
// Dreamweaver Comments is checked.
//
function removeTracingAttrs()
{
  var bodyNode = dreamweaver.getDocumentDOM('document').body;

  //look for tracing attributes - if any are found, toggle
  //the global boolean to true and remove all attributes
  if (cbRemoveDWComments.checked){
    if (bodyNode.getAttribute("tracingsrc") ||
        bodyNode.getAttribute("tracingopacity") ||
        bodyNode.getAttribute("tracingx") ||
        bodyNode.getAttribute("tracingy"))
   {
     //remove all tracing image attributes
     bodyNode.removeAttribute("tracingsrc");
     bodyNode.removeAttribute("tracingopacity");
     bodyNode.removeAttribute("tracingx");
     bodyNode.removeAttribute("tracingy");
     bRemovedTracing=true;
   }
  }
}

// hasStyleAttribute()
//
// Return true if the given ELEMENT tag has a STYLE set
//
function hasStyleAttribute( tagNode )
{
   return( tagNode.getAttribute( strStyleAttrib ) != null );
}

// hasClassAttribute()
//
// Return true if the given ELEMENT tag has a CLASSID set
//
function hasClassAttribute( tagNode )
{
   return( tagNode.getAttribute( strClassAttrib ) != null );
}

// loadCommentOffsets()
//
// This callback is used by the comment removal traversal
// to push offsets of comment nodes into the userData variable
// passed by the comment removal pass.  Depending on the
// user's options, we might be deleting non-Dreamweaver comments,
// or DW comments that are actually represented as comments.
//
function loadCommentOffsets( commentNode, userData )
{
   // MM_note( "Processing NDW comment:" + commentNode.data );

   // Server-side include comments of the form "<!-- #include... -->"
   // should always be left alone!

   // eat up any leading white in comment data
   var i;
   for( i = 0; i < commentNode.data.length; i++ )
      if ( !isWhite( commentNode.data.charAt( i ) ) )
         break;

   var bIsDWComment = arrayContains(arrDWCommentNonTags, commentNode.data);

   if (cbRemoveComments.checked)
   {
      // if we have a #include skip it, otherwise push offsets for
      // removal
      //
      var bSkipSSIinclude = (commentNode.data.substr( i, 8 ).toLowerCase() == "#include");
      var bSkipSSIecho = commentNode.data.substr( i, 5 ).toLowerCase() == "#echo";
      var bSkipFWtable = commentNode.data.substr( i, 7 ).toLowerCase() == "fwtable";
      var bSkipXML = commentNode.data.substr( i, 3 ).toLowerCase() == "xml";
      var bSkipDoctype = commentNode.data.substr( i, 7 ).toLowerCase() == "doctype";
      var bSkipFWBeginCopy = (commentNode.data.indexOf("BEGIN COPYING THE HTML") != -1);
      var bSkipFWEndCopy = (commentNode.data.indexOf("STOP COPYING THE HTML HERE") != -1);
      var isComment = commentNode.data.charAt(0) != "<";
      
      if ( !bSkipSSIinclude && !bSkipSSIecho && !bSkipDoctype && !bSkipXML && isComment && !bSkipFWtable && !bSkipFWBeginCopy && !bSkipFWEndCopy && !bIsDWComment){
        // This is a not-very-elegant way of checking whether we've found a comment in
        // the current document, or one inside an included file. It won't work if the
        // comment in the included file happens to be the exact same length as the
        // include statement, but it's a start.
        var inCurrentDoc = true;
        var nodeOffsets = dw.getDocumentDOM().nodeToOffsets(commentNode);
        // +7 is the "<!--" and "-->" parts
        if ((commentNode.data.length + 7) != (nodeOffsets[1] - nodeOffsets[0]))
          inCurrentDoc = false;
          
        if (inCurrentDoc)
          userData.push( dreamweaver.nodeToOffsets( commentNode ) );
      }
   }

   if (cbRemoveDWComments.checked && bIsDWComment)
   {
         userData.push( dreamweaver.nodeToOffsets( commentNode ) );
   }

   return true;
}

// processElement()
//
// Process a node of ELEMENT type within the user's document
// This is a callback from traverse() used during the main
// removal traversal.
//
function processElement( elementNode )
{
   // MM_note( "Processing element: " + elementNode.tagName );
   // Remove specific tag(s) check
   //
   if ( cbRemoveTags.checked &&
        arrayContains(arrTagsToRemove,  elementNode.tagName ) )
   {
      // MM_note( "* Removing specified tag " + elementNode.outerHTML );
      if ( elementNode.outerHTML == elementNode.innerHTML )
         elementNode.outerHTML = "";
      else
         elementNode.outerHTML = elementNode.innerHTML;

      numTagsRemoved++;
   }
   else
   {
      // Don't touch tags with style information
      //
      if ( !hasStyleAttribute( elementNode ) )
      {
         // Empty tag check
         //

         if ( cbRemoveEmptyTags.checked &&
         (isRemovableEmptyTag( elementNode )))
         {
            var parent = elementNode.parentNode;

            // MM_note( "* Removing empty tag: " + elementNode.outerHTML );
            elementNode.outerHTML = "";
            numEmptyRemoved++;

            // Small work around DW behavior -- paragraph tags with
            // children are considered "not collapsable" even if the
            // children are empty.  When we remove all empty children
            // of a p tag then, DW sticks in a &nbsp; to keep the
            // remaining <p> from being collapsed -- this makes the <p>
            // then come alive in the browser layout.  So if we've just
            // zapped the last child of a p tag, rewrite the P tag without
            // the &nbsp; so it remains collapsed in the browser layout.
            // Note that if the p tag originally had text or an &nbsp;
            // it would still have textual children after the empty tag
            // removal and would be untouched.
            //
            if ( parent.tagName == "P" && !(parent.hasChildNodes()) )
               parent.outerHTML = "<p>";
         }
         // Redundant child check
         //
         else
         if ( cbRemoveRedundant.checked &&
              hasRedundantParent( elementNode ) )
         {
            // MM_note( "* Removing redundant tag: " + elementNode.outerHTML );
            elementNode.outerHTML = elementNode.innerHTML;
            numRedundantRemoved++;
         }
         // Child/parent coalesce check
         //
         else
         if ( cbCombineFonts.checked &&
              arrayContains(combinableTagCandidates,  elementNode.tagName ) )
         {
            var parent  = findCombinableParent( elementNode, elementNode.tagName );
            if ( parent != null )
            {
               // MM_note( "* Combining font tags: " + elementNode.outerHTML );

               // Set all child attributes on parent and remove child
               //
               var arrs    = parseAttributes( elementNode, true, false );
               var attribs = arrs[0];
               var values  = arrs[1];

               for( var i = 0; i < attribs.length; i++ )
                  parent.setAttribute( attribs[i], values[i] ); // The value part
                                                                // here may be null
               elementNode.outerHTML = elementNode.innerHTML;
               numFontsCombined++;
            }
         }
         // Dreamweaver comment check -- dreamweaver comments
         // come back to us as element nodes rather than comment nodes
         else
         if ( cbRemoveDWComments.checked &&
              arrayContains(arrDWCommentTags, elementNode.tagName ) )
         {
            // MM_note( "Removing DW comment: " + elementNode.tagName );
            dreamweaver.editLockedRegions(true);
            elementNode.outerHTML = elementNode.innerHTML;
            numCommentsRemoved++;
         }
         else
         if ( cbRemoveDWComments.checked &&
              arrayContainsPrefix(arrDWTagPrefixes, elementNode.tagName ) )
         {
            // MM_note( "Removing DW tag: " + elementNode.tagName );
            dreamweaver.editLockedRegions(true);

      // sn 8/6/01: for some reason, for empty tags, innerHTML
      // returns the entire tag instead of the empty string.  (Anyway,
      // this is what I observed for MMTInstance:Param tags.)  Tweaking
      // to use "" instead of elementNode.innerHTML for such tags.
      if ( elementNode.tagName == "MMTEMPLATE:EXPR"            ||
         elementNode.tagName == "MMTEMPLATE:PARAM"           ||
         elementNode.tagName == "MMTEMPLATE:PASSTHROUGHEXPR" ||
         elementNode.tagName == "MMTINSTANCE:PARAM"          )
        elementNode.outerHTML = "";
      else
        elementNode.outerHTML = elementNode.innerHTML;
            numTagsRemoved++;
         }
      }
   }

   return true; // continue traverse
}

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

// traverse()
//
// Do a recursive depth-first traversal of the user's
// document starting from the given node.
//
// Callers provide up to three callback functions which
// accept a node argument, one each (or the same one)
// to process nodes of ELEMENT, TEXT, or COMMENT type.
// At least one callback function is required.
//
// The handlers may stop the traversal by returning false;
// returning true will continue the traversal to its
// completion.
//
// A fourth argument, a handle to a some user variable to
// be passed on to each callback, may also be provided.
//
function traverse( node, fElementHandler ) // optional: fTextHandler, fCommentHandler, userData )
{
   var fTextHandler  = traverse.arguments.length >= 3 ? traverse.arguments[2] : null;
   var fCmmtHandler  = traverse.arguments.length >= 4 ? traverse.arguments[3] : null;
   var userData      = traverse.arguments.length >= 5 ? traverse.arguments[4] : null;
   var children      = node.childNodes;
   var nChildren     = children.length;
   var bContinue     = true;
   var current       = null;
   if ( node.tagName == "MM:BEGINLOCK" || node.tagName == "MM:ENDBLOCK" )
      return true;

   traverseLevel++;

   if (traverseLevel > 100)
   {
      traverseLevel = 0;
      alert( MSG_ErrDeepNesting );
      return false;
   }

   var inLocked = 0;
   for( var i = 0; bContinue && (i < nChildren); i++ )
   {
      current = children.item( i );

      if ( current.tagName == "MM:BEGINLOCK" )
         inLocked++;
      else if ( current.tagName == "MM:ENDLOCK" )
         inLocked--;
      else if ( inLocked == 0 )
      {
         // descend to any children first
         if ( current.hasChildNodes() )
         {
            var retVal = traverse( current, fElementHandler, fTextHandler, fCmmtHandler, userData );
            if (retVal == false)
               return retVal;
         }
         // process current node
         switch( current.nodeType )
         {
            case Node.ELEMENT_NODE:
               if ( userData != null )
                  bContinue = fElementHandler( current, userData );
               else
                  bContinue = fElementHandler( current );
               break;
   
            case Node.COMMENT_NODE:
               if ( fCmmtHandler != null )
                  if ( userData != null )
                     bContinue = fCmmtHandler( current, userData );
                  else
                     bContinue = fCmmtHandler( current );
               break;
   
            case Node.TEXT_NODE:
               if ( fTextHandler != null )
                  if ( userData != null )
                     bContinue = fTextHandler( current, userData )
                  else
                     bContinue = fTextHandler( current )
               break;
   
               case Node.DOCUMENT_NODE:
            default:
                MM_error( MSG_UnknownNodeType, current.nodeType );
         }
      }
   }
   traverseLevel--;
   return true;
}

// doPassZero()
//
// Pass zero goes through the document, and makes sure that tags
// aren't nested too deeply for us to handle
// Returns true if ok, false if nesting is too deep
//
function doPassZero()
{
   var root         = dreamweaver.getDocumentDOM('document');
   var stubCallback = new Function( "node", "userData", "return true;" );
   var retVal       = true;

   if ( root != null && root.hasChildNodes() )
   {
      retVal = traverse( root, stubCallback);
      if (retVal == false)
         return false;
   }

   return retVal;

}

// doPassOne()
//
// Pass one does cleanup based on the HTML source string for
// the user's document; currently that means comment and extra
// whitespace removal.  Note that most DW comments are not handled
// here (since they're internally represented as tags), but some
// are.
//
// BW 8/17/98 Removed "remove extra whitespace" option for
//            performance reasons
//
function doPassOne()
{
   if ( cbRemoveComments.checked || cbRemoveDWComments.checked )  // pass one options
   {
      var htmlstr = dreamweaver.getDocumentDOM( 'document' ).documentElement.outerHTML;
      var htmlpos = 0;
      var htmlarr = new Array(); // array to save newing of intermediate
                                 // string copies of doc

      // To remove comments, traverse over the entire DOM gathering
      // offsets into the HTML source of the comments to be removed,
      // then remove those comments from the HTML source string.
      //
      var root           = dreamweaver.getDocumentDOM('document');
      var commentOffsets = new Array();
      var stubCallback   = new Function( "node", "userData", "return true;" );

      if ( root != null && root.hasChildNodes() )
      {
         var retVal = traverse( root
                 , stubCallback
                 , stubCallback
                 , loadCommentOffsets
                 , commentOffsets );
         if (retVal == false)
            return false;
      }

      // Now use offsets to delete sections of text from
      // within the document source string.
      //
      if ( commentOffsets.length > 0 )
      {
         var lastpos = 0;
         for( var i = 0; i < commentOffsets.length; i++ )
         {
            htmlarr[htmlpos++] = htmlstr.substring( lastpos
                                                  , commentOffsets[i][0] );
            lastpos = commentOffsets[i][1];
            numCommentsRemoved++;
         }

         htmlarr[htmlpos++] = htmlstr.substring( lastpos );
      }

      if ( htmlarr.length > 0 )
         dreamweaver.getDocumentDOM( 'document' ).documentElement.outerHTML = htmlarr.join("");
   }
   return true;
}

// doPassTwo()
//
// Pass two does cleanup on DOM objects as appropriate over the
// course of traversing the DOM heirarchy.  The actual work in this
// pass is done in the processElement() callback.
//
function doPassTwo()
{
   var retVal = true;
   // Load up comma-separated list of tags to remove if any; warn
   // if option is checked but no tags specified
   //
   arrTagsToRemove = dreamweaver.getTokens( tbTagsToRemove.value.toUpperCase(), ", " );
   if ( cbRemoveTags.checked && arrTagsToRemove.length == 0 )
      MM_error( MSG_NoTagsToRemove );

   // Traverse document, processing leaves
   //
   var root = dreamweaver.getDocumentDOM('document');

   if ( root != null && root.hasChildNodes() )
   {
      retVal = traverse( root
              , processElement
              , emptyHeaderStateTextHandler )

      // and finally attempt to remove tracingsrc attributes
      // in body tag
      //
      removeTracingAttrs();
   }
   else
      MM_error( MSG_ErrEmptyDoc );

   return retVal;
}

// cleanUpDocument()
//
// Main routine for performing clean up when user hits OK.
// Clean up is done in three passes:
//
// Pass 1: Clean up certain items based on the entire HTML
//         document as a string
// Pass 2: Clean up certain items while traversing the DOM
//
function cleanUpDocument()
{
   // Set up logging particulars
   //
   if ( cbShowLog.checked )
   {
      MM_enableLogging();
      MM_clearLog();
   }
   else {
      MM_disableLogging();
   }

   // Do cleanup in two passes -- the first pass , the second pass
   // cleans up certain items based on a hierarchy traversal of the DOM.
   // Then, if the doc is XHTML, call the cleanupXHTML function.
   //
   MM.setBusyCursor();
   var retVal = doPassZero();
   if (retVal)
      retVal = doPassOne();
   if (retVal)
      retVal = doPassTwo();
   if (retVal && dw.getDocumentDOM().getIsXHTMLDocument())
      arrXHTMLresults = dw.getDocumentDOM().cleanupXHTML(true);
   else
      arrXHTMLresults = 0;
   MM.clearBusyCursor();
   // don't show log if we bailed out
   if (retVal)
      finalize();
   window.close();
}

// initialize()
//
// This is called on BODY onLoad; initialize all script globals
//
function initialize()
{
   // Counters for logging output
   //
   numEmptyRemoved      = 0;
   numRedundantRemoved  = 0;
   numTagsRemoved       = 0;
   numCommentsRemoved   = 0;
   numFontsCombined     = 0;
   bRemovedTracing      = false;

   arrTagsToRemove.length = 0; // Empty array

   strClassAttrib       = "CLASS";
   strStyleAttrib       = "STYLE";

   // The following tags represent the tag names of Dreamweaver-
   // specific comments, which are processed through the Dreamweaver
   // JS API/DOM as named element nodes rather than comment nodes
   //
   arrDWCommentTags.push ( "MM:EDITABLE"
                         , "MM:LIBITEM"       // variable library item (currently unused)
                         , "MM:TEMPLATE"
                         , "{#CUSTOMOBJ}"
                         , "{#IMEINLINE}"      // used by Japanese DW
                         , "{#LIBITEM}" );

   // The following strings are prefixes; any tag beginning with one of
   // these prefixes is Dreamweaver-specific markup.  (These represent
   // tags, not comments, but we still remove them when removing Dreamweaver-
   // specific comments.)
   //
   // NOTE (sn 6/22/01): by the time we get a tag name to compare with,
   // it's been converted to uppercase.  So, I'm including uppercase versions
   // of these strings.  However, I'm leaving the mixed-case versions in as
   // well, in case this ever changes.
   arrDWTagPrefixes.push ( "MMTemplate:", "MMTInstance:",
                 "MMTEMPLATE:", "MMTINSTANCE:" );

   // This array contains Dreamweaver comments that are actually
   // internally stored as comments (i.e., they aren't magically
   // transformed into tags the way the above tags are).
   arrDWCommentNonTags.push ( "#DefaultLayoutTable","DWLayoutDefaultTable","DWLayoutEmptyCell","DWLayoutTable" );

   // The following tags can be harmlessly removed from the user's
   // document if they're empty.  Note that the Heading tags are
   // not always safe and require special further handling; see
   // isEmptyRemoveableTag().
   //
   emptyRemovalCandidates.push ( "H1", "H2", "H3", "H4", "H5", "H6"
                               , "TT", "I", "B", "U", "STRIKE", "BIG"
                               , "SMALL", "SUB", "SUP", "EM", "STRONG"
                               , "DFN", "CODE", "SAMP", "KBD", "VAR"
                               , "CITE", "XMP", "BLINK"
                               , "ADDRESS"
                               , "A"
                               , "FONT"
                               , "SPAN"
                               , "TABLE"
                               , "BLOCKQUOTE"
                               , "LI", "OL", "UL"
                               , "DD", "DT", "DL"
                               , "DIR", "MENU"
                               , "DIV", "CENTER" );

   // These tags can be safely removed if they're redundant
   // with their immediate parent, i.e., this tags have
   // no nesting semantics.
   //
   redundantTagCandidates.push( "TT", "I", "B", "U", "S", "STRIKE", "BIG"
                              , "SMALL", "SUB", "SUP", "EM", "STRONG"
                              , "DFN", "CODE", "SAMP", "KBD", "VAR"
                              , "CITE", "XMP"
                              , "FONT"
                              , "CENTER"
                              , "SPAN" );

   // These tags can be safely coalesced with parents with identical
   // regions of influence.  Currently this is only done for FONT tags.
   //
   combinableTagCandidates.push( "FONT" );


   // Global used by pass two to indicate if the next empty
   // header we encounter should be preserved -- the first
   // empty header after text is significant as a carriage
   // return is forced; after that they can be gobbled until
   // there's more text.
   //
   bPreserveEmptyHeader = false;


   // And finally reference actual form element names
   // here once
   //
   with( document.optionsForm )
   {
      cbRemoveEmptyTags       = removeEmptyTags;
      cbRemoveRedundant       = removeRedundantChildren;
      cbRemoveComments        = removeNDWComments;
      cbRemoveDWComments      = removeDWComments;
      cbRemoveTags            = removeTag;
      cbCombineFonts          = combineFonts;
      cbShowLog               = showLog;
      tbTagsToRemove          = tagsToRemove;
   }
}



function finalize()
{
   // Show what we did if show log is enabled
   //
   if ( cbShowLog.checked )
   {
      MM_note( MSG_TrcSummaryHeader );
      var bLeftSomethingUnfixed =

          (arrXHTMLresults.length > 0) &&
          (
              (arrXHTMLresults[1] > 0)   ||
              (arrXHTMLresults[2] > 0)   ||
              (arrXHTMLresults[3] > 0)   ||
              (arrXHTMLresults[4] > 0)   ||
              (arrXHTMLresults[5] > 0)
		   );

      var bDidSomething = (numEmptyRemoved > 0)      ||
                          (numRedundantRemoved > 0)  ||
                          (numTagsRemoved > 0)       ||
                          (numCommentsRemoved > 0)   ||
                          (numFontsCombined > 0)     ||
                          (arrXHTMLresults[0] > 0)   ||
                          (bRemovedTracing);

      if ( bDidSomething || bLeftSomethingUnfixed )
      {
         if ( numEmptyRemoved > 0 )
            MM_note( MSG_TrcEmptyRemoved, numEmptyRemoved );
         if ( numRedundantRemoved > 0 )
            MM_note( MSG_TrcRedundantRemoved, numRedundantRemoved );
         if ( numTagsRemoved > 0 )
            MM_note( MSG_TrcTagsRemoved, numTagsRemoved );
         if ( numCommentsRemoved > 0 )
            MM_note( MSG_TrcCommentsRemoved, numCommentsRemoved );
         if ( numFontsCombined > 0 )
            MM_note( MSG_TrcFontsCombined, numFontsCombined );
         if ( bRemovedTracing )
            MM_note( MSG_TracingAttrsRemoved );
         if ( arrXHTMLresults[0] > 0)
            MM_note( MSG_XHTMLFixed );
         if ( arrXHTMLresults[6] > 0)
            MM_note( MSG_XHTMLChangedCase, arrXHTMLresults[6] );
         if ( arrXHTMLresults[7] > 0)
            MM_note( MSG_XHTMLAddedScriptType, arrXHTMLresults[7] );
		 if ( arrXHTMLresults[8] > 0)
		 	MM_note( MSG_XHTMLAddedMissingID, arrXHTMLresults[8] );
			
         if ( bDidSomething && bLeftSomethingUnfixed )
            MM_note( "\n" );
  		 if ( arrXHTMLresults[1] > 0)
            MM_note( MSG_XHTMLMissingMapID, arrXHTMLresults[1]);
         if ( arrXHTMLresults[2] > 0)
            MM_note( MSG_XHTMLMissingScriptType, arrXHTMLresults[2] );
         if ( arrXHTMLresults[3] > 0)
            MM_note( MSG_XHTMLMissingStyleType, arrXHTMLresults[3] );
         if ( arrXHTMLresults[4] > 0)
            MM_note( MSG_XHTMLMissingImgAlt, arrXHTMLresults[4] );
         if ( arrXHTMLresults[5] > 0)
            MM_note( MSG_XHTMLMissingAreaAlt, arrXHTMLresults[5] );
	  }
      else {
         MM_note( MSG_TrcDidNothing );
      }
      MM_showLog();
   }
}


function setMenuText()
{
  if (dw.getDocumentDOM() && dw.getDocumentDOM().getIsXHTMLDocument())
    return MENU_CleanupXHTML;
  else
    return MENU_CleanupHTML;
}
