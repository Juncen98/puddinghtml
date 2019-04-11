// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//---------------     API FUNCTIONS    ---------------

function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	return false;
}

function isAsset() {
	return true;
}

function objectTag(assetArgs) {
  var rtnStr = "";
  var bDialogState = dw.getShowDialogsOnInsert(); // Was dialog shown?
  var prefsAccessibilityOption = null;

  var newURL;

if (dw.appName == "Contribute")
{
	if (MM.insertImgType == "file")
		newURL = dw.doURLEncoding(dw.browseForFileURL("select", "", true, "","","", "", "desktop"));
	else if (MM.insertImgType == "website")
		newURL = dw.doURLEncoding (dw.browseForImage ());
}

else
{
  var newURL = dw.doURLEncoding(dw.browseForFileURL("select", "", true));
}
  var imgDim = dw.getNaturalSize(newURL);

  if (assetArgs)
  {
  	newURL = assetArgs;
    imgDim = dw.getNaturalSize(newURL);
  }
  if ((newURL == '')  && bDialogState) {  return ''; }
  
  var thisDOM = dw.getDocumentDOM();

  if (imgDim){
    rtnStr= '<img src="' + newURL + '" width="' + imgDim[0] +'" height="' + imgDim[1] + '">';
  }else{
    rtnStr= '<img src="' + newURL + '">';
  }    

  if (dw.appName == "Contribute")
  {
    prefsAccessibilityOption = dw.getAdminEnforceAccessibilityPref();
  }
  else
  {
    prefsAccessibilityOption = dw.getPreferenceString("Accessibility", "Accessibility Image Options", "");
  }

  // the Option is a *string*, not a boolean!
  if (prefsAccessibilityOption == "TRUE")  { rtnStr= addAccessibility(rtnStr);}
 
  if (thisDOM != null)
  {
	  //xhtml strict requires alt attribute
	  if(thisDOM.getIsXHTMLStrictDocument() && 0 > rtnStr.indexOf(" alt=") )
	  {
		  var insertIndex = rtnStr.indexOf(" width=");
		  if( insertIndex < 0 )
		  	insertIndex = rtnStr.length -1;
		  
		  rtnStr = (rtnStr.substr(0, insertIndex) + ' alt=""' + rtnStr.substr(insertIndex));
	  }
	  
	var siteName = site.getSiteForURL(dw.getDocumentDOM().URL);
	if( siteName != '' && site.getIsServerSite(siteName) )
	{
		var fullURL;
		if( newURL[0] == "/" )
		fullURL = dw.relativeToAbsoluteURL(dw.getDocumentDOM().URL, dw.getSiteRoot(), newURL);
		else
		fullURL = dw.relativeToAbsoluteURL(dw.getDocumentDOM().URL, "", newURL);
	    
		site.get(fullURL);
	}
  }
    
  return rtnStr
}

function addAccessibility(rtnStr) {

	if (dw.appName == "Contribute")
	{
		var cmdFile = dreamweaver.getConfigurationPath() + "/Commands/ccImageOptions.htm";
	}
	else 
	{
		var cmdFile = dreamweaver.getConfigurationPath() + "/Commands/ImageOptions.htm";
	}
   var cmdDOM = dreamweaver.getDocumentDOM(cmdFile);
   
   cmdDOM.parentWindow.setFormItem(rtnStr);
   if (dw.appName == "Contribute")
   {
	dreamweaver.popupCommand("ccImageOptions.htm");
   }
   else
   {
	dreamweaver.popupCommand("ImageOptions.htm");
	}
   return (cmdDOM.parentWindow.returnAccessibilityStr(rtnStr));	
}


