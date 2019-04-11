// Copyright 2004, 2005 Macromedia, Inc. All rights reserved.

//---------------     API FUNCTIONS    ---------------

function canAcceptCommand() {
  var retVal = false;
  if (dw.getDocumentDOM() && dw.getDocumentDOM().getParseMode() == 'html' && (dw.getFocus() == 'document' || dw.getFocus(true) == 'html' || dw.getFocus() == 'textView')){
    retVal = true;
  }
  return retVal;
}

function setMenuText() {
  if (!hasMark())
    return MENU_Insert ;
  else
    return MENU_Remove ;
}


//---------------    LOCAL FUNCTIONS   ---------------

// Return the code to be inserted.
function markCodeToInsert() 
{
  var rtnStr = '';
	if (dwscripts.isXSLTDoc())
	{
		 rtnStr = '<xsl:comment> saved from url=(0014)about:internet </xsl:comment>';
	}
	else
	{
		rtnStr = '<!-- saved from url=(0014)about:internet -->';
	}
  return rtnStr;
}

function hasMark() {
  var retVal = false;
  var curDOM = dw.getActiveWindow();
  var curHTML = curDOM.documentElement.outerHTML;
  var markStr = markCodeToInsert();
  var markLoc = curHTML.indexOf(markStr);
  if (markLoc != -1)
    retVal = true;
  return retVal;
}

function insertOrRemoveMark() {
  if (hasMark())
    removeMark();
  else
    addMark();
}

function addMark() {
  var retVal = false;

  var dom = dw.getActiveWindow();
	if (dwscripts.isXSLTDoc())
	{
	  var docText = dom.documentElement.outerHTML;
		var xslBaseTemplateRegExp = /<\s*xsl:template/ig;
		var xslBaseTemplate = docText.match(xslBaseTemplateRegExp);
		if (xslBaseTemplate != null)
		{
					// xsl:template found.  Insert the MOTW after that.
					var xslBaseTemplateStart = docText.search(xslBaseTemplate);

					// Search for the ending '>' of the xsl:template starting with
					// The beginning of the xsl:template
					var searchString = docText.substr(xslBaseTemplateStart, docText.length - xslBaseTemplateStart);
					var xslBaseTemplateEnd = xslBaseTemplateStart + searchString.search('>');

				  // We now have the end of the <xsl:template> insert MOTW afer that.
					var newDocText = docText.substr(0, xslBaseTemplateEnd + 1) + '\r\n' + markCodeToInsert() + 
										docText.substr(xslBaseTemplateEnd + 1, docText.length);

					//set the contents of the doc
					dom.documentElement.outerHTML = newDocText;
					
					//set the new 
					retVal = true;
		}
		else
		{
			retVal = false;
		}
	}
	else
	{
		var html = dom.getElementsByTagName('html');  
		if (html && html.length > 0) 
		{
			var htmlText = html[0].outerHTML;
			// Look for the start of a <!DOCTYPE> tag
			var dtdRegExp = /<!\s*DOCTYPE/ig;
			var doctype = htmlText.match(dtdRegExp);

			if (doctype != null)
			{
					// DOCTYPE found.  Insert the MOTW after that.
					var doctypeStart = htmlText.search(doctype);

					// Search for the ending '>' of the DOCTYPE starting with
					// The beginning of the "<!DOCTYPE.
					var searchString = htmlText.substr(doctypeStart, htmlText.length - doctypeStart);
					var doctypeEnd = doctypeStart + searchString.search('>');

								// We now have the end of the <!DOCTYPE> insert MOTW afer that.
					html[0].outerHTML = htmlText.substr(0, doctypeEnd + 1) + '\r\n' + markCodeToInsert() + 
										htmlText.substr(doctypeEnd + 1, htmlText.length);
			}	
			else
			{
					// No DOCTYPE tag, insert mark of the web at the top of the document.
					html[0].outerHTML = markCodeToInsert() + '\r\n' + html[0].outerHTML;
			}
			retVal = true;
		}
		else 
		{ 
			retVal = false;
		} // No head, fail to insert.
	}
  return retVal;
}

function removeMark() {
  var curDOM = dw.getActiveWindow();
  var inNode;
  // Look for exactly what we added. If the entire comment is
  // intact then remove it.
  var curHTML = curDOM.documentElement.outerHTML;
  var markStr = markCodeToInsert();
  var markLoc = curHTML.indexOf(markStr);
  if (markLoc != -1) {
    curHTML = curHTML.slice(0,markLoc) + curHTML.slice(markLoc + markStr.length);
    curDOM.documentElement.outerHTML = curHTML;
  }
}
