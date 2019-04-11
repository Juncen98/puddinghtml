// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//---------------     API FUNCTIONS    ---------------

function isDOMRequired() { 
  // return true.  This will insert the object into the design view.
  return true;
}

function isAsset() {
  return true;
}

function objectTag(assetArgs) {
  var dom = dw.getDocumentDOM();
  if (!dom)
  {
    return '';
  }
  
  var bDialogState = dw.getShowDialogsOnInsert(); // Was dialog shown?
  var newURL = dw.doURLEncoding(browseForFileURL());
  
  if (assetArgs)
    newURL  = assetArgs;
  if ((newURL == '')  && bDialogState) {  return ''; }

  // tell dw to prepend a browser-safe script if the preference is turned on
  // (see Code Rewriting preferences)
  if (dom.convertNextActiveContent) // if the function doesn't exist, don't call it
    dom.convertNextActiveContent();

  // Return the html tag that should be inserted
  return '<EMBED SRC="' + newURL + '" WIDTH="32" HEIGHT="32"></EMBED>';
}
