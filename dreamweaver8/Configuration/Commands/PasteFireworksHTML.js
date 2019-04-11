// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS  *****************

var USE_SITE_RELATIVE = false;


//******************* LOCAL FUNCTIONS **********************

function isDOMRequired() {
  // Return false, indicating that this object is available in code view.
  // This will prevent the document from syncing with design view on every
  // paste in code view.  This command actually does require that the DOM
  // be synchronized, but we'll postpone that until we're sure that we're
  // actually pasting Fireworks HTML.
  return false;
}

function initialize() {
var validFWFile = false;
var fwSource = dw.getClipboardText();
  if (fwSource && isFireworksHTML(fwSource)) {
    validFWFile = true;
      MM.event.handled = pasteFWHTML();
  }else{
    MM.event.handled = false;
  }
}


function pasteFWHTML() {
  var result, validFWFile=false;
  var fwURL, fwSource, fwDOM;
  var docURL, docDOM, siteURL, parentFile, docRootURL, siteRootURL;

  // Force a sync... we have postponed this until we are certain that we're
  // actually pasting Fireworks HTML.
  if (!dw.getDocumentDOM().isDesignViewUpdated())
	  dw.getDocumentDOM().synchronizeDocument();

  fwSource = dw.getClipboardText();

  if (fwSource && isFireworksHTML(fwSource)) {
    validFWFile = true;
    if (!isDWStyle(fwSource))
      alert(MSG_notExportedForDW);
    else if (!usesDWBehaviors(fwSource))
      alert(MSG_behNotSupported);
  }

  if (validFWFile) {
    fwURL = dw.getConfigurationPath() + "/Shared/MM/Cache/empty.htm";
    DWfile.write(fwURL,'');
    fwDOM = dw.getDocumentDOM(fwURL);
    
    //for i18n, we need to make sure the fwDOM matches the encoding of the users dom
  	fwDOM.setCharSet( dw.getDocumentDOM('document').getCharSet() );
  
    // remove Content-Type metas from fwSource before sticking source in fwDOM
    // (there should already be a meta in Dreamweaver, so removing this one will
    // prevent a duplicate meta being added).
    fwSource = fwSource.replace(/<meta\s+http-equiv="Content-Type[^>]*>[\r\n\s]*/i,'');
    
    fwDOM.documentElement.outerHTML = fwSource;
        
    docURL = dw.getDocumentPath("document");
    siteURL = dw.getSiteRoot();

    docRootURL = '';
    siteRootURL = '';
    if (docURL) {
      parentFile = new File(docURL);
      docRootURL = parentFile.getAbsoluteParent() + File.separator;
      if (USE_SITE_RELATIVE) {
        parentFile = new File(siteURL);
        siteRootURL = parentFile.getAbsolutePath();
      }
    }
    
    docDOM = dw.getDocumentDOM('document');

    // The Insert FWHTML Object fixes up the caret to make sure it's
    // in the body before inserting the HTML returned by insertFireworksHTML.
    // Paste doesn't do this, so we're going to do it manually. We
    // start by checking to make sure the IP is in the body. If it isn't,
    // we move it to the body.
    if (!dwscripts.isInsideTag(docDOM.getSelectedNode(),"BODY")){
      var bodyNode = docDOM.body;
      var bodyOffsets = docDOM.nodeToOffsets(bodyNode);
      docDOM.setSelection(bodyOffsets[1]+1,bodyOffsets[1]+1);
    }
    
    // Next we save the current selection relative to the body tag.
    saveBodyRelativeSelection();

    theHTML = insertFireworksHTML(fwDOM, fwURL, docRootURL, siteRootURL);
  
    // We're done with the fwDOM. Release it.
    dw.releaseDocument(fwDOM);

    // Now restore the selection to the body before doing the insert.
    restoreBodyRelativeSelection();
    docDOM.insertHTML(theHTML, true);
  }

  return validFWFile;
}

// These functions were copied from Objects/Server/serverObjectsCommon.js
// because it didn't make sense to include that file here.
//
//--------------------------------------------------------------------
// FUNCTION:
//   saveBodyRelativeSelection
//
// DESCRIPTION:
//   Stores the body tag relative location of the current selection
//   in the global variable CURRENT_SEL.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

var CURRENT_SEL = null;

function saveBodyRelativeSelection()
{
  var dom = dw.getDocumentDOM();
  
  var sel = dom.getSelection();
  
  if (sel && sel.length > 1)
  {
    var bodyOffset = dom.nodeToOffsets(dom.body);

    sel[0] = sel[0] - bodyOffset[0];
    sel[1] = sel[1] - bodyOffset[0];
    
    CURRENT_SEL = sel;
  }  
}


//--------------------------------------------------------------------
// FUNCTION:
//   restoreBodyRelativeSelection
//
// DESCRIPTION:
//   Sets the selection back to its original location, before any
//   head edits were made.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function restoreBodyRelativeSelection()
{
  var sel = CURRENT_SEL;
  CURRENT_SEL = null;
  
  if (sel)
  {
    var dom = dw.getDocumentDOM();
    
    var bodyOffset = dom.nodeToOffsets(dom.body);
    
    sel[0] = sel[0] + bodyOffset[0];
    sel[1] = sel[1] + bodyOffset[0];
    
    dom.setSelection(sel[0], sel[1]);
  }
}

