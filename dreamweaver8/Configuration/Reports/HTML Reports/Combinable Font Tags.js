// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
// include ../reports.js
//***************        GLOBALS       ***************

var helpDoc = MM.HELP_cmdMyExtension;

var CUR_URL = '';

var bPreserveEmptyHeader;

var   strClassAttrib       = "CLASS";
var   strStyleAttrib       = "STYLE";

var combinableTagCandidates = new Array("FONT");



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
//
function isQuote( c )
{
   return( c == '\"' || c == '\'' );
}

//---------------
//
function isAlpha( c )
{
   var isoval = c.charCodeAt(0);
   return( (isoval >= "A".charCodeAt(0) && isoval <= "Z".charCodeAt(0)) ||
           (isoval >= "a".charCodeAt(0) && isoval <= "z".charCodeAt(0)));
}              

//---------------
//
// Match a <xxx or </xxx tag; note that xxx must be alphabetical
function isTagBegin( currentchar, nextchar )
{
   return( currentchar == '<' && (isAlpha( nextchar ) || nextchar == '/') );
}

//---------------
//
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
function arrayContains( curArr, item )
{
   var nElements = curArr.length;
   for( var i = 0; i < nElements; i++ )
      if ( curArr[i] == item )
         return true;

   return false;   
}


//---------------
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
   var rtnNode = null;
   
   while ( (node.parentNode != null)    &&
        (node.parentNode.childNodes.length == 1) )
   {
      if ( combineTagName == node.parentNode.tagName ) {
         rtnNode = node.parentNode;
         break;
      }
      if ( node.parentNode.innerHTML == node.outerHTML ) {// parent contains only this child tree
         node = node.parentNode;
      } else {
         break;
      }
   }

   return rtnNode;
}


//---------------
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


//---------------
// processElement()
//
// Process a node of ELEMENT type within the user's document
// This is a callback from traverse() used during the main 
// removal traversal.
//
function processElement(elementNode, root)
{
  if ( arrayContains(combinableTagCandidates,  elementNode.tagName ) )
  {
     var parent  = findCombinableParent( elementNode, elementNode.tagName );
     if ( parent != null )
     {
        reportItem(REP_ITEM_WARNING, CUR_URL, 
          printString(REPORT_COMBINABLE_TAG, elementNode.tagName),
          root.nodeToSourceViewOffsets(elementNode));
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
    traverse( root
            , processElement 
            , emptyHeaderStateTextHandler
            , null // no comment hander for this pass
            , root // user data - passing document root to compute offsets.
            );
  }
}
