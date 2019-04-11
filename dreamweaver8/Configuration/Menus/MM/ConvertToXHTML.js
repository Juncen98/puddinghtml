// Copyright 2005 Macromedia, Inc. All rights reserved.

function receiveArguments()
{
	var dtdId = arguments[0];
	
	var dom = dreamweaver.getDocumentDOM();

	if (!dom)
		return;

  if (dtdId == "mm_xslt_10")
	{
	    //handle conversion to xslt
	    return convertToXSLT();
	}
	
	var dtdArray = dom.getAvailableDtdProfiles();
	
	if( !dtdArray[dtdId] )
		return;


	arrXHTMLresults = dom.setDtdProfile(dtdArray[dtdId]);

	if ((arrXHTMLresults.missingMapID > 0) ||
		(arrXHTMLresults.missingScriptType > 0) ||
		(arrXHTMLresults.missingStyleType > 0) ||
		(arrXHTMLresults.missingImgAlt > 0) ||
		(arrXHTMLresults.missingAreaAlt > 0) )
	{
		MM_clearLog();
		if ( arrXHTMLresults.missingMapID > 0)
			MM_note( dw.loadString("xhtml/cleanup/missing_map_id"), arrXHTMLresults.missingMapID);
		if ( arrXHTMLresults.missingScriptType > 0)
			MM_note( dw.loadString("xhtml/cleanup/missing_script_type"), arrXHTMLresults.missingScriptType );
		if ( arrXHTMLresults.missingStyleType > 0)
			MM_note( dw.loadString("xhtml/cleanup/missing_style_type"), arrXHTMLresults.missingStyleType );
		if ( arrXHTMLresults.missingImgAlt > 0)
			MM_note( dw.loadString("xhtml/cleanup/missing_img_alt"), arrXHTMLresults.missingImgAlt );
		if ( arrXHTMLresults.missingAreaAlt > 0)
			MM_note( dw.loadString("xhtml/cleanup/missing_area_alt"), arrXHTMLresults.missingAreaAlt );
		MM_showLog();
	}
}

function canAcceptCommand()
{
   var dom = dreamweaver.getDocumentDOM();
	if ((dw.getFocus() == 'document' || dw.getFocus() == 'textView' || dw.getFocus(true) == 'html') &&
		dom &&
		!dom.getIsLibraryDocument() &&
		dom.getAvailableDtdProfiles().length > 0 )
		return true;
	else
		return false
}

// getDynamicContent returns the contents of a dynamically generated menu.
// returns an array of strings to be placed in the menu, with a unique
// identifier for each item separated from the menu string by a semicolon.
//
// return null from this routine to indicate that you are not adding any
// items to the menu
function getDynamicContent(itemID)
{
	var retArray = null;
	
	var dom = dreamweaver.getDocumentDOM();

	if (dom)
	{
		retArray = new Array();
		
		var dtdArray = dom.getAvailableDtdProfiles();
		for (var i=0; i<dtdArray.length; i++)
		{
			retArray[i] = new String(dtdArray[i].title);
			retArray[i] += ";id='"+dtdArray[i].id+"'"; // each item needs an ID
		}

		//add xslt doc type
		if (dwscripts.isXSLTDoc() == false && canAcceptCommand())
		{
		  //add the option to convert to XSLT
			if (dom.getFocus() != 'frameset')
			{
 			  //don't add this option for a frameset doc
				retArray[i] = new String("XSLT 1.0");
				retArray[i] += ";id='"+"mm_xslt_10"+"'"; // each item needs an ID
			}
		}
	}
	
	return retArray;
}

//converts a document to xslt
// - by adding xsl:stylesheet node
// - by adding xsl:template node
// - by adding/changing a doc type xhtml transitional
function convertToXSLT()
{
	var dom = dw.getDocumentDOM();
	if (dom != null)
	{
		var domXSLT;
		var docType;
		var strStyleSheetBegin = '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">\n<xsl:output method="html"/>\n<xsl:template match="/">\n';
		var strStyleSheetEnd = '\n</xsl:template>\n</xsl:stylesheet>';

		var outerHTML = dom.documentElement.outerHTML;
		var innerHTML = dom.documentElement.innerHTML;
		if(outerHTML == innerHTML)
		{
			// creating a fragment
			// merge the xsl:stylesheet, xsl:output, xsl:template tags
			outerHTML = strStyleSheetBegin + innerHTML + strStyleSheetEnd;
			docType = "XSLT-fragment";
		}
		else
		{
			// creating a full page
			var outerHTMLlower = outerHTML.toLowerCase();
			var strBeginHTML = "<html";
			var strEndHTML = "</html>";

			var indexStartBeforeHTML = 0;
			var indexEndBeforeHTML = outerHTMLlower.indexOf(strBeginHTML);
			var strBeforeHTML = "";
			if(indexStartBeforeHTML >= 0 && indexEndBeforeHTML >= 0 && indexStartBeforeHTML <= indexEndBeforeHTML)
			{
				strBeforeHTML = outerHTML.substring(indexStartBeforeHTML, indexEndBeforeHTML);
			}
			var indexStartHTML = indexEndBeforeHTML;
			var indexEndHTML = outerHTML.indexOf(innerHTML);
			var strHTML = "";
			if(indexStartHTML >= 0 && indexEndHTML >= 0 && indexStartHTML <= indexEndHTML)
			{
				strHTML = outerHTML.substring(indexStartHTML, indexEndHTML);
			}
			var indexStartAfterHTML = outerHTMLlower.indexOf(strEndHTML) + strEndHTML.length;
			var indexEndAfterHTML = outerHTML.length;
			var strAfterHTML = "";
			if(indexStartAfterHTML >= 0 && indexEndAfterHTML >= 0 && indexStartAfterHTML <= indexEndAfterHTML)
			{
				strAfterHTML = outerHTML.substring(indexStartAfterHTML, indexEndAfterHTML);
			}

			// merge the xsl:stylesheet, xsl:output, xsl:template tags
			outerHTML = strBeforeHTML + strStyleSheetBegin + strHTML + innerHTML + strEndHTML + strStyleSheetEnd + strAfterHTML;
			docType = "XSLT";
		}

		// create new XSLT document with old converted content
		domXSLT = dw.createDocument(false, docType);
		domXSLT.setCharSet(dom.getCharSet());
		domXSLT.documentElement.outerHTML = outerHTML;
		var arrXSLTresults = domXSLT.convertToXSLT();

		// save the file next to our original file with a .xsl file extension
		var strFileName = dom.URL;
		if(strFileName.length)
		{
			var nTempDotPosition = strFileName.indexOf('.');
			var nDotPosition = strFileName.length;
			while(nTempDotPosition != -1)
			{
				nDotPosition = nTempDotPosition;
				nTempDotPosition = strFileName.indexOf('.', nTempDotPosition+1);
			}
			if(DWfile.exists(strFileName.substr(0, nDotPosition) + ".xsl"))
			{
				// find an appropriate file name to save as
				// using a counter
				var nCount = 1;
				while(DWfile.exists(strFileName.substr(0, nDotPosition) + "_" + nCount.toString() + ".xsl"))
				{
					nCount++;
				}
				strFileName = strFileName.substr(0, nDotPosition) + "_" + nCount.toString() + ".xsl";
			}
			else
			{
				strFileName = strFileName.substr(0, nDotPosition) + ".xsl";
			}
			dw.saveDocument(domXSLT, strFileName);
		}

		// refresh view so that the CSS renders
		domXSLT.refreshViews()
		
		if ((arrXSLTresults.missingMapID > 0) ||
			(arrXSLTresults.missingScriptType > 0) ||
			(arrXSLTresults.missingStyleType > 0) ||
			(arrXSLTresults.missingImgAlt > 0) ||
			(arrXSLTresults.missingAreaAlt > 0) )
		{
			MM_clearLog();
			if ( arrXSLTresults.missingMapID > 0)
				MM_note( dw.loadString("xhtml/cleanup/missing_map_id"), arrXSLTresults.missingMapID);
			if ( arrXSLTresults.missingScriptType > 0)
				MM_note( dw.loadString("xhtml/cleanup/missing_script_type"), arrXSLTresults.missingScriptType );
			if ( arrXSLTresults.missingStyleType > 0)
				MM_note( dw.loadString("xhtml/cleanup/missing_style_type"), arrXSLTresults.missingStyleType );
			if ( arrXSLTresults.missingImgAlt > 0)
				MM_note( dw.loadString("xhtml/cleanup/missing_img_alt"), arrXSLTresults.missingImgAlt );
			if ( arrXSLTresults.missingAreaAlt > 0)
				MM_note( dw.loadString("xhtml/cleanup/missing_area_alt"), arrXSLTresults.missingAreaAlt );
			MM_showLog();
		}
	}
}
