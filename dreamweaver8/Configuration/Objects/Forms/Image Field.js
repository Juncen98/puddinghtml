// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//---------------     API FUNCTIONS    ---------------

function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	return false;
}

function objectTag() {
  var bDialogState = dw.getShowDialogsOnInsert(); // Was dialog shown?
  var newURL = dw.doURLEncoding(browseForFileURL("select", "", true));

  if ((newURL == '')  && bDialogState) {  return ''; }

  return returnFormTag('<INPUT TYPE="image" name="imageField" SRC="' + newURL + '">');
}
