//Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

function canInspectSelection(){
  var dom = dw.getDocumentDOM();  
	var theObj = dom.getSelectedNode();
	var translatorClass;
	var lockType;

	if ( theObj.nodeType != Node.ELEMENT_NODE )
	{
		return false; 
	}

	translatorClass = theObj.getAttribute("translatorClass");
	if ( translatorClass != "MM_SSI" )
	{
		return false;
	}

	lockType = theObj.getAttribute("type");
	if ( lockType != "ssi")
	{
		return false;
	}

	return true;
} // function canInspectSelection()

function inspectSelection() 
{
	var editFieldStr;
	var fileRadObj;
	var fileStr;
	var includeStr;
	var	origAttr;
	var quoteStr;
	var quoteStrLast;
	var dom = dw.getDocumentDOM();

	//	Get the selection and the data from the selection
	var theObj = dom.getSelectedNode();

 	if (theObj.nodeType != Node.ELEMENT_NODE) 
	{
		return;
	}

/***	
	origAttr		= theObj.getAttribute("ORIG");
	ssiStr			= unescape( origAttr );

	quoteStr		= ssiStr.indexOf('"');
	quoteStrLast	= ssiStr.lastIndexOf('"');
	editFieldStr	= ssiStr.substring(quoteStr+1,quoteStrLast);
	gOrignalURL		= editFieldStr;
***/
	editFieldStr	= theObj.getAttribute("fileRef");
	gOrignalURL		= editFieldStr;
	findObject("editField").value = editFieldStr;

} // function inspectSelection() 
	
function setFile()
{
	var dom = dw.getDocumentDOM();
	var curSelection = dom.getSelection();
	var theObj = dom.getSelectedNode();

	if (theObj.nodeType == Node.ELEMENT_NODE) 
	{
		var newURL	 = findObject("editField").value;
		var oldURL	 = theObj.getAttribute("fileRef");
		var origAttr = theObj.getAttribute("ORIG");
		var oldSSI	 = unescape( origAttr );
		var newSSI	 = oldSSI.replace(oldURL, newURL);
		var docSrc	 = dom.documentElement.outerHTML;

		var beforeSelStr = docSrc.substring(0, curSelection[0] );
		var afterSelStr  = docSrc.substring(curSelection[1]);
		var fixedSSI = fixSSIPathForSiteRelativeIncludes(newSSI,newURL);
		var docSrc		 = beforeSelStr + fixedSSI + afterSelStr;

		dom.documentElement.outerHTML = docSrc;
		dom.setSelection(curSelection[0], curSelection[0]+1)	
	}
}

function ssiBrowseFile()
{
	fileName = browseForFileURL();  //returns a local filename
	if (fileName != "") 
	{
		findObject("editField").value = fileName;
	}

	setFile();
}
