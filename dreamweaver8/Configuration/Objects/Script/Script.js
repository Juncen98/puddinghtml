// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------

var helpDoc = MM.HELP_objScript;
var TEXT_SCRIPT;
var TEXT_NOSCRIPT;
var LIST_LANG;
var TEXT_SRC;

//---------------     API FUNCTIONS    ---------------

function initUI(){
  TEXT_SCRIPT = document.theform.scriptContents;
  TEXT_NOSCRIPT = document.theform.noscript;
  LIST_LANG = new ListControl('Language');
  LIST_LANG.init();
  TEXT_SRC = document.theform.externalSrc;
}

function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	return false;
}

function isAsset() {
	return true;
}

function objectTag(assetArgs) {
	var rtnStr="";
// If we're an asset tag, then just set the src of the script tag
// to the parameter passed in and return

	var prefixScriptStr = "";
	var postScriptStr = "";

	if (dwscripts.isXSLTDoc())
	{
		//add CDATA to pre , post parts
		prefixScriptStr = "<![CDATA[\n";
		postScriptStr = "]]>\n";
	}

  if (assetArgs)
  {
    var	dotIndex = assetArgs.lastIndexOf('.');
    var ext;
    if (dotIndex != -1)
    {
  	ext = assetArgs.substr(dotIndex+1);
  	ext = ext.toLowerCase();
    }
    if (ext && ext == "js")
      rtnStr = '<script type="text/JavaScript" src="' + assetArgs + '">' + prefixScriptStr + postScriptStr + '<\/script>';
    else
      rtnStr = '<script src="' + assetArgs + '">' + prefixScriptStr +  postScriptStr + '<\/script>';
    
    return rtnStr;
    
   }

// Return the html tag that should be inserted
  var scriptVal = TEXT_SCRIPT.value;
  var noScriptVal = TEXT_NOSCRIPT.value;
  var scriptLang = LIST_LANG.getValue();
  var extSrc = TEXT_SRC.value;
  var scriptType = scriptLang;
  
  if( scriptType.indexOf( "JavaScript" ) != -1 )
    scriptType = "javascript";

  // if an external source file has been specified, insert an empty script tag
  // with a src attribute.
  if (extSrc != ""){
	  rtnStr = '<script language="' + scriptLang + '" type="text/' + scriptType + '" src="' + extSrc + '"><\/script>';
  }

  // otherwise, insert a regular script tag (even if the Contents field is empty).
  else {
    if (scriptVal.charAt(scriptVal.length - 1) != '\n'){
		  scriptVal = scriptVal + '\n';
    }
		rtnStr = '<script language="' + scriptLang + '" type="text/' + scriptType + '">\n' + prefixScriptStr + scriptVal + postScriptStr + '<\/script>';
  }

  if (noScriptVal.length > 0){
    if (noScriptVal.charAt(noScriptVal.length - 1) != '\n'){
      noScriptVal = noScriptVal + '\n';
    }
   	rtnStr = rtnStr + '\n'+ '<noscript>' + '\n' + prefixScriptStr + noScriptVal + postScriptStr + '<\/noscript>';
  }
  
  return rtnStr;
}
