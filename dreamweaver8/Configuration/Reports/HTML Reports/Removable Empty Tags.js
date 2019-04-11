// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// include ../reports.js

//***************        GLOBALS       ***************

var helpDoc = MM.HELP_cmdMyExtension;

var CUR_URL = '';

var   strClassAttrib       = "CLASS";
var   strStyleAttrib       = "STYLE";


var emptyRemovalCandidates = new Array ( 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'
                               , 'TT', 'I', 'B', 'U', 'STRIKE', 'BIG'
                               , 'SMALL', 'SUB', 'SUP', 'EM', 'STRONG', 'STRIKE'
                               , 'DFN', 'CODE', 'SAMP', 'KBD', 'VAR'
                               , 'CITE', 'XMP', 'BLINK'
                               , 'ADDRESS'
                               , 'A'
                               , 'FONT'
                               , 'SPAN'
                               , 'TABLE'
                               , 'BLOCKQUOTE'
                               , 'LI', 'OL', 'UL'
                               , 'DD', 'DT', 'DL'
                               , 'DIR', 'MENU'
                               , 'DIV', 'CENTER','S' );



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
// arrayContains()
//
// Simple array content check, returns true if exact match in array.
//
function arrayContains( curArr, item )
{
   var nElements = curArr.length;
   for( var i = 0; i < nElements; i++ )
      if ( curArr[i] == item )
         return true;

   return false;
}


//---------------
// hasClassAttribute()
//
// Return true if the given ELEMENT tag has a CLASSID set
//
function hasClassAttribute( tagNode )
{
   return( tagNode.getAttribute( strClassAttrib ) != null );
}


//---------------
// hasStyleAttribute()
//
// Return true if the given ELEMENT tag has a STYLE set
//
function hasStyleAttribute( tagNode )
{
   return( tagNode.getAttribute( strStyleAttrib ) != null );
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



//---------------
// Note that '>' should be ignored within quotes inside tag brackets
function isTagEnd( c )
{
   return( c == '>' );
}



//---------------
//
function isWhite( c )
{
   return( c == ' ' || c == '\t' || c == '\n' || c == '\r' );
}


//---------------
//
function isAllWhite( str )
{
   for( var i = 0; i < str.length; i++ )
   {
      if ( !isWhite( str.charAt( i ) ) )
         return( false );
   }

   return( true );
}



//---------------
// isAllWhiteNodeSignificant()
//
// Given a node whose inner html is all white, this
// routine examines the node's siblings and returns
// true if the whitespace is significant and false
// otherwise.
//
function isAllWhiteNodeSignificant( node )
{
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



//---------------
// isRemovableEmptyTag()
//
// Return true if this tag can be safely removed from the
// document, false otherwise.
//
function isRemovableEmptyTag( tagNode )
{
  // The following tags can be harmlessly removed from the user's
  // document if they're empty.  Note that the Heading tags are
  // not always safe and require special further handling; see
  // isEmptyRemoveableTag().
  //

  // First this tag must be an empty removal candidate with no class info
  //
  if ( arrayContains(emptyRemovalCandidates,  tagNode.tagName ) && !hasClassAttribute( tagNode ) )
  {
    // Short-circuit for named anchor tags; empty named anchors
    // should be left alone
    if ( 'A' == tagNode.tagName && (null != tagNode.getAttribute( 'NAME' )) )
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
       // that begins with whitespace.
       return true;
    }
  }

  return false;
}



//---------------
// processElement()
//
// Process a node of ELEMENT type within the user's document
// This is a callback from traverse() used during the main
// removal traversal.
//
function processElement( elementNode, root )
{
  // Don't report tags with style information
  if ( !hasStyleAttribute( elementNode ) )
  {
    // Empty tag check
    if (isRemovableEmptyTag( elementNode ))
    {
      reportItem(REP_ITEM_WARNING, CUR_URL,
        printString(REPORT_EMPTY_TAG, elementNode.tagName),
        root.nodeToSourceViewOffsets(elementNode)
        );
    }
  }

   return true; // continue traverse
}



//---------------
// scanDocument
function scanDocument(fileURL) {
  // Traverse document, processing nodes
  var root = dw.getDocumentDOM(fileURL);
  CUR_URL = fileURL;

  if ( root != null && root.hasChildNodes() )
  {
    traverse(root
      , processElement // element handler
      , null // no text handler
      , null // no comment hander for this pass
      , root // user data - passing document root to compute offsets.
    );
  }
}
