// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//---------------     API FUNCTIONS    ---------------

function isDOMRequired() {
  // Return true, so that an active-content script will be inserted before
  // the shockwave object if necessary.
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

  // Return the html tag that should be inserted
  var bDialogState = dw.getShowDialogsOnInsert(); // Was dialog shown?
  var theMovie = dw.doURLEncoding(browseForFileURL());

  if (assetArgs)
    theMovie = assetArgs;
  if ((theMovie == '')  && bDialogState) {  return ''; }

  if (!theMovie) theMovie = '.dcr';

  rtnStr= '<OBJECT CLASSID="clsid:166B1BCA-3F9C-11CF-8075-444553540000"' +
           ' CODEBASE="http://download.macromedia.com/pub/shockwave/cabs/director/sw.cab#version=8,5,0,0" WIDTH="32" HEIGHT="32">\n' +
           '<PARAM NAME="src" VALUE="' + theMovie + '">\n' +
           '<EMBED SRC="' + theMovie +
           '" PLUGINSPAGE="http://www.macromedia.com/shockwave/download/" ' +
           'WIDTH="32" HEIGHT="32">' +
           '</EMBED></OBJECT>';

  // add accessibility attributes if preferences option is checked.
  prefsAccessibilityOption = dw.getPreferenceString("Accessibility", "Accessibility Media Options", "");
  if (prefsAccessibilityOption=='TRUE')  {rtnStr= addAccessibility(rtnStr);}

  // tell dw to prepend a browser-safe script if the preference is turned on
  // (see Code Rewriting preferences)
  if (dom.convertNextActiveContent) // if the function doesn't exist, don't call it
    dom.convertNextActiveContent();

  return rtnStr;
}

function addAccessibility(rtnStr) {
   var cmdFile = dreamweaver.getConfigurationPath() + "/Commands/Object Options.htm";
   var cmdDOM = dreamweaver.getDocumentDOM(cmdFile);
 
   cmdDOM.parentWindow.setFormItem(rtnStr);
   dreamweaver.popupCommand("Object Options.htm");
   return (cmdDOM.parentWindow.returnAccessibilityStr());
}
