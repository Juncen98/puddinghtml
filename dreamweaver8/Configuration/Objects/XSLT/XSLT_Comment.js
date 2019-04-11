// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------


//---------------     API FUNCTIONS    ---------------

function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	return false;
}

function objectTag() {
  var retVal = "";
	var dom = dw.getDocumentDOM();
  
  if (dom.getView() == 'design' || (dom.getView() == 'split' && dw.getFocus(true) != 'textView')){
	   var cmdFile = dw.getConfigurationPath() + "/Commands/Comment_XSL_DesignView.htm";
	   var cmdDOM = dw.getDocumentDOM(cmdFile);
   
	   dw.runCommand("Comment_XSL_DesignView.htm");
	   retVal = (cmdDOM.parentWindow.getCommentStr());
  }else{
    // Manually wrap comment markers around selection.
		var commentStart = "<xsl:comment>";
		var commentEnd = "</xsl:comment>";	
	  dom.source.wrapSelection(commentStart,commentEnd);
  }
  
  return retVal;
}
