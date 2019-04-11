// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

function isDOMRequired() { // Return false, indicating that this object is available in code view.
  // return true.  This will insert the object into the design view.
  return true;
}

function objectTag() {  // Return the html tag that should be inserted
  var dom = dw.getDocumentDOM();
  if (!dom)
  {
    return '';
  }

  var breakpoint, classname, newpath, retStr, path;
  var bDialogState = dw.getShowDialogsOnInsert(); // Was dialog shown?
  
  path = dw.doURLEncoding(browseForFileURL());

  if ((path == '')  && bDialogState) {  return ''; }

  breakpoint = path.lastIndexOf("/");
  if (breakpoint > 0) {
    newpath = path.substring(0,breakpoint);
    classname = path.substring(breakpoint + 1,path.length);
    retStr = '<applet code="' + classname + '" codebase = "' + newpath + '" width="32" height="32"></applet>';
  } else retStr = '<applet code="' + path + '" width="32" height="32"></applet>';

  prefsAccessibilityOption = dw.getPreferenceString("Accessibility", "Accessibility Media Options", "");
  if (prefsAccessibilityOption == 'TRUE')  {retStr = addAccessibility(retStr);}

  // tell dw to prepend a browser-safe script if the preference is turned on
  // (see Code Rewriting preferences)
  if (dom.convertNextActiveContent) // if the function doesn't exist, don't call it
    dom.convertNextActiveContent();

  return retStr;
}

function addAccessibility(retStr) {
   var cmdFile = dreamweaver.getConfigurationPath() + "/Commands/AppletOptions.htm";
   var cmdDOM = dreamweaver.getDocumentDOM(cmdFile);
   
   cmdDOM.parentWindow.setFormItem(retStr);
   dreamweaver.popupCommand("AppletOptions.htm");
   return (cmdDOM.parentWindow.returnAccessibilityStr(retStr));
}
