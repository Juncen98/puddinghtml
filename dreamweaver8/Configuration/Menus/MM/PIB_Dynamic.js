// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
var scope;

function havePreviewTarget()
{
	var bHavePreviewTarget = false;
	
	if ((dw.getFocus(true) == 'site') || 
			((scope == "DWSitePseudoMenFile_PIB_Default") && (site.isExpanded())))
	{
		if (site.getFocus() == 'remote') 
		{
			bHavePreviewTarget = site.getRemoteSelection().length > 0 &&
										site.canBrowseDocument();

			//disable preview of xsl file in remote file view
			if (bHavePreviewTarget)
			{
				var fileList = site.getRemoteSelection();
				if (fileList.length == 1)
				{
					//check if the file extension is xslt doc
					if (dwscripts.isXSLTFile(fileList[0]))
					{
							bHavePreviewTarget = false;
					}
				}
			}
		}
		else if (site.getFocus() != 'none')
		{
			var selFiles = site.getSelection();
			
			if (selFiles.length > 0)
			{
				var i;
				
				bHavePreviewTarget = true;
				
				for (i = 0; i < selFiles.length; i++)
				{
					var selFile = selFiles[i];
					var urlPrefix = "file:///";
          var strTemp = selFile.substr(urlPrefix.length);

          // If this is an FTP/RDS site, we have a target.
          if (selFile.indexOf("%%SERVER%%") != -1)
            bHavePreviewTarget = true;

          // otherwise...
          else if (selFile.indexOf(urlPrefix) == -1)
            bHavePreviewTarget = false;
          else if (strTemp.indexOf("/") == -1)
            bHavePreviewTarget = false;
          else if (!DWfile.exists(selFile))
            bHavePreviewTarget = false;
          else if (DWfile.getAttributes(selFile) == null)
            bHavePreviewTarget = true;
          else if (DWfile.getAttributes(selFile).indexOf("D") != -1)
            bHavePreviewTarget = false;
				}
			}
		}
	}
	else if (dw.getFocus() == 'document' ||
		dw.getFocus() == 'textView' || dw.getFocus("true") == 'html' )
	{
		var dom = dw.getDocumentDOM('document');
		if (dom != null)
		{
			var parseMode = dom.getParseMode();
			if (parseMode == 'html' || parseMode == 'xml')
				bHavePreviewTarget = true;
		}
	}
	
	return bHavePreviewTarget;
}

function receiveArguments()
{
	var whichBrowser = arguments[0];
	var theBrowser = null;
	var i=0;
	var browserList = null;
	var result = false;

	if (havePreviewTarget())
	{
		// Code to check if we were called from a shortcut key
		if (whichBrowser == 'primary' || whichBrowser == 'secondary')
		{
			// get the path of the selected browser
			if (whichBrowser == 'primary')
			{
				theBrowser = dw.getPrimaryBrowser();
			}
			else if (whichBrowser == 'secondary')
			{
				theBrowser = dw.getSecondaryBrowser();
			}

			// match up the path with the name of the corresponding browser
			// that appears in the menu
			browserList = dw.getBrowserList();
			while (i < browserList.length)
			{
				if (browserList[i+1] == theBrowser)
					theBrowser = browserList[i];
				i+=2;
			}
		}
		else
			theBrowser = whichBrowser;

		// Only launch the browser if we have a valid browser selected
		if (theBrowser != "file:///" && typeof(theBrowser) != "undefined" && theBrowser.length > 0)
		{
			
			//check if it xslt document
			var bIsXSLTDoc = false;
			var currDoc = dw.getDocumentDOM();
			if (currDoc != null)
			{
				var currDocType = currDoc.documentType;
				if (currDocType == "XSLT" || currDocType == "XSLT-fragment")
				{
					bIsXSLTDoc = true;
				}
			}

			if ((dw.getFocus(true) == 'site') || 
				((scope == "DWSitePseudoMenFile_PIB_Default") && (site.isExpanded())))
			{
				// Only get the first item of the selection because
				// browseDocument() can't take an array.
				//dw.browseDocument(site.getSelection()[0],theBrowser);
				var fileList = site.getSelection();
				if (fileList.length == 1)
				{
					//check if the file extension is xslt doc
					if (dwscripts.isXSLTFile(fileList[0]))
					{
						//get the xml source document
						var xsltdocPath  =  fileList[0];
						var xmlsourceURI = MMXSLT.getXMLSourceURI(xsltdocPath);
						//to handle case when the browser cache clears the file
						var xmlSourceContents = MMXSLT.getXMLSource(xsltdocPath);
						if (xmlsourceURI.length )
						{
							var xsltSourceContents = DWfile.read(xsltdocPath);
							previewTransformInBrowser(xsltdocPath,xsltSourceContents,xmlsourceURI,xmlSourceContents,theBrowser);
						}
						else
						{
							//prompt the user to associate an xml with the xslt dialog.
							result = window.confirm(MSG_NoXMLSourceURIAssociated);
							// If they clicked OK, show the dialog which prompts for the 
							// xml source uri
							if (result)
							{
								//launch the xml source dialog for xsltdocPath
								xmlsourceURI = MMXSLT.launchXMLSourceDialog(xsltdocPath);
								var xmlSourceContents = MMXSLT.getXMLSource(xsltdocPath);
								if (xmlsourceURI.length)
								{
									var xsltSourceContents = DWfile.read(xsltdocPath);
									previewTransformInBrowser(xsltdocPath,xsltSourceContents,xmlsourceURI,xmlSourceContents,theBrowser);
								}
							}
						}
					}
					else
					{
						site.browseDocument(theBrowser);
					}
				}
				else
				{
					site.browseDocument(theBrowser);
				}
			}
			else
			{
				if (bIsXSLTDoc)
				{
					//if an xslt doc do the transformation and save the transformation
					//as temp file and display the transformed output
					var xsltdocPath  =  dw.getDocumentPath('document');
					var bDocSaved = false;
					//check if the doc is saved since last modified
					if (xsltdocPath.length)
					{
					   bDocSaved = true;
					}

					if (bDocSaved == false)
					{
						//ask the app to do the file save
						 dw.saveDocument(dw.getDocumentDOM());
						 xsltdocPath  =  dw.getDocumentPath('document');
						 if (xsltdocPath.length)
						 {
							bDocSaved = true;
						 }
					}
					/*else
					{
						//if the doc is modified since last save, save it
						var currDoc = dw.getDocumentDOM();
						if (dw.canSaveDocument(currDoc))
						{	
						   //if the current doc can be saved
							 if (currDoc.saveModified())
							 {
								 bDocSaved = true;
							 }
							 else
							 {
								 bDocSaved = false;
							 }
						}
					}*/
										
					if (bDocSaved)
					{				
						var xmlsourceURI = MMXSLT.getXMLSourceURI(xsltdocPath);
						var xmlSourceContents = MMXSLT.getXMLSource(xsltdocPath);
						if (xmlsourceURI.length )
						{
						  //get the outer html contents
						  var xsltSourceContents = null;
							if (currDoc != null)
							{
								xsltSourceContents = currDoc.documentElement.outerHTML;
							}
							previewTransformInBrowser(xsltdocPath,xsltSourceContents,xmlsourceURI,xmlSourceContents,theBrowser);
						}
						else
						{
							//prompt the user to associate an xml with the xslt dialog.
							result = window.confirm(MSG_NoXMLSourceURIAssociated);
							// If they clicked OK, show the dialog which prompts for the 
							// xml source uri
							if (result)
							{
									//launch the xml source dialog for the current doc
									//add comment to the current doc
									xmlsourceURI = MMXSLT.launchXMLSourceDialog(xsltdocPath);
									var xmlSourceContents = MMXSLT.getXMLSource(xsltdocPath);
									if (xmlsourceURI.length)
									{
										var xsltSourceContents = null;
										if (currDoc != null)
										{
											xsltSourceContents = currDoc.documentElement.outerHTML;
										}
										previewTransformInBrowser(xsltdocPath,xsltSourceContents,xmlsourceURI,xmlSourceContents,theBrowser);
									}
							}
						}
					}
				}
				else
				{
					dw.browseDocument(dw.getDocumentPath('document'),theBrowser);
				}
			}
		}
		else
		{
			// otherwise, if the user hit the F12 or Ctrl+F12 keys,
			// ask if they want to specify a primary or secondary browser now.
			if (whichBrowser == 'primary')
			{
				result = window.confirm(MSG_NoPrimaryBrowserDefined);
			}
			else if (whichBrowser == 'secondary')
			{
				result = window.confirm(MSG_NoSecondaryBrowserDefined);
			}

			// If they clicked OK, show the prefs dialog with the browser panel
			if (result)
				dw.showPreferencesDialog('browsers');
		}
	}
}

function canAcceptCommand()
{
	var PIB = dw.getBrowserList();

	if (arguments[0] == 'primary' || arguments[0] == 'secondary')
		return havePreviewTarget();

	return havePreviewTarget() && (PIB.length > 0);
}

// getDynamicContent returns the contents of a dynamically generated menu.
// returns an array of strings to be placed in the menu, with a unique
// identifier for each item separated from the menu string by a semicolon.
//
// return null from this routine to indicate that you are not adding any
// items to the menu
function getDynamicContent(itemID)
{
	var browsers = null;
	var PIB = null;
	var i;
	var j=0;

	scope = itemID;

	browsers = new Array();
	PIB = dw.getBrowserList();
	// each browser pair has the name of the browser and the path that leads
	// to the application on disk. We only put the names in the menus

	for (i=0; i<PIB.length; i=i+2)
	{
		browsers[j] = new String(PIB[i]);

		if (dw.getPrimaryBrowser() == PIB[i+1]) {
			if (navigator.platform.charAt(0)=="M") // Mac OS 10.3 uses F12 for expose, so use Opt+F12 instead
				browsers[j] += "\tOpt+F12";
			else
				browsers[j] += "\tF12";
		}
		else if (dw.getSecondaryBrowser() == PIB[i+1])
		  browsers[j] += "\tCmd+F12";

		browsers[j] += ";id='"+escQuotes(PIB[i])+"'";

		if (itemID == "DWPopup_PIB_Default")
		{
				browsers[j] = MENU_strPreviewIn + browsers[j];
		}		
		j = j+1;
	}
	return browsers;
}

//preview the transformed o/p in the browser
function previewTransformInBrowser(xsltdocPath, xsltSourceContents, xmlsourceURI, xmlSourceContents,theBrowser)
{
	if ((xsltdocPath != null) && (xsltSourceContents != null) && (xmlsourceURI != null) && (xmlSourceContents != null) && (xsltdocPath.length > 0) && (xmlsourceURI.length > 0) && (xmlSourceContents.length > 0))
	{
		//get the and xml xslt source code
		//TODO: check for the case when the xmldocPath is remote URI	
		var xmlsource = xmlSourceContents;

		//trim to remove spaces around the xmlsource
		xmlsource  = dwscripts.trim(xmlsource);

		//remove any xml comments in the end of the document

		//[akishnani 08/17/05] bug fix for bug 199316:crash log and then JS error when PIB a page with yahoo news rss feed  
		// had a trailing xml comment(s) after the root node and xalan was tripping over it.
		var xmlCommentRegExp = /(<!--.*-->$)/i;
		while (xmlsource.match(xmlCommentRegExp) != null)
		{			
			//get the last index of the string
			var xmlCommentIndex = xmlsource.lastIndexOf(RegExp.$1);
			if (xmlCommentIndex != -1)
			{
				//remove the trailing xml comment
				xmlsource = xmlsource.substring(0,xmlCommentIndex);
				//trim to remove spaces around the xmlsource after removing the trailing xml comment
				xmlsource  = dwscripts.trim(xmlsource);
			}
		}



		//fix the dtd or schema reference if present
		xmlsource = fixDTDSchemaPathReference(xmlsourceURI,xmlsource);

		/*if (dwscripts.fileExists(xmlsourceURI))
		{
			xmlsource  = DWfile.read(xmlsourceURI);		
		}*/

		var xsltsource = xsltSourceContents;
		//we no longer need this since we don't replace remote dtds with local dtds
		//xsltsource = fixRemoteDTDWithLocal(xsltsource);

		//remove the xmlns attribute from the html tag
		xsltsource = fixXHTMLNSAttr(xsltsource);

		//replace encoding to be utf-8
		xsltsource = replaceEncodingToUTF8(xsltsource);

		var theHtmlTransformCode = XSLT.transform(xmlsource, xsltsource, null);
		var slashIndex = xsltdocPath.lastIndexOf("/");
		if (slashIndex != -1)
		{
			var docFolder  = xsltdocPath.substring(0,slashIndex+1);			
			docFolder = dwscripts.localURLToFilePath(docFolder);
			var tempFileLocation = dw.createTempFile(docFolder,"htm");
			tempFileLocation = dwscripts.filePathToLocalURL(tempFileLocation);
			//if we have an error expression replace the "foo" node with the file name
			var errRegExp = /\(\s*([\w\.]*)\s*\,\s*line.*\,\s*column.*\)/ig;
			var errRegExpArray = theHtmlTransformCode.match(errRegExp);
			var bIsEntityError = false;
			var entityErrRegExp = /SAXParseException\s*:\s*Entity\s*([\w']+)/ig;									 				
			if (errRegExpArray != null)
			{
				//replace the regular expression "foo" with the real file name
				var xslFileName = "";
				var lastSlashIndex = xsltdocPath.lastIndexOf("/");
				if (lastSlashIndex != -1)
				{
					xslFileName = xsltdocPath.substring(lastSlashIndex+1);
				}
				if (xslFileName.length)
				{
					var strToReplace =  "" + RegExp.$1;
					if (strToReplace.length)
					{
						theHtmlTransformCode = theHtmlTransformCode.replace(strToReplace,xslFileName);
					}
					else
					{
						//append the name of the xml if missing from the error message 
						//since there could be error in the xml file name
						var xmlFileName = "";
						var lastSlashIndex = xmlsourceURI.lastIndexOf("/");
						if (lastSlashIndex != -1)
						{
							xmlFileName = xmlsourceURI.substring(lastSlashIndex+1);
						}
						theHtmlTransformCode = theHtmlTransformCode.replace(/\,\s*line/ig, xmlFileName + ",line");
					}
				}
				
				var entityErrRegExpArray = theHtmlTransformCode.match(entityErrRegExp);
				if (entityErrRegExpArray != null)
				{
						var missingEntityName = RegExp.$1;
						if ((missingEntityName != null) && (missingEntityName.length > 0))
						{ 
							bIsEntityError = true;
							MM.missingEntityName = missingEntityName;
							MM.xsltFileName = xslFileName;
							dw.runCommand('XSLT_EntityDecl.htm', null);
						}
				}
			}

			//save the output into the xslt file
			//fix for bug 194532:cannot open linked file from the temp html file when PIB an xsl file  				
			/*if (dwscripts.IS_WIN)
			{
				//add the mark of the web comment before PIB					
				var mowComment = "<!-- saved from url=(0014)about:internet -->";													  
				theHtmlTransformCode = mowComment + "\r\n" + theHtmlTransformCode;
			}*/ 

			if (bIsEntityError == false)
			{
				DWfile.write(tempFileLocation,theHtmlTransformCode);
				//convert site relative links to doc relative links
				dw.convertSiteRelativeToDocRelative(tempFileLocation,false,true/*bReplaceLinkedStyle*/, true /*bParserNeverRewrite*/);
				dw.browseDocument(tempFileLocation,theBrowser,"-1"/*help argument*/,true /*use temp doc*/);
			}
		}
	}
	else
	{
			if ((xmlSourceContents == null) || ((xmlSourceContents != null) && (xmlSourceContents.length == 0)))
			{
				var unableToReadXMLErrorMsg = dwscripts.sprintf(MSG_NoLocalXmlDoc,xmlsourceURI);
				alert(unableToReadXMLErrorMsg);
			}
	}
}

//fix for bug#188021 empty text area displays as containing source code after it when PIB  
//please the bug for more information about the different HTML browsers and the transformation
//engines having problems with tags with NOT empty content model.
function fixXHTMLNSAttr(xsltsource)
{
  if ((xsltsource != null) && (xsltsource.length > 0))
	{
	  var htmlRegExp = /<\s*html\s*(.*)\s*(xmlns\s*=\s*\"(.*?)\")(.*)>/ig;
		if (xsltsource.match(htmlRegExp) != null)
		{
			var origHTMLTag = RegExp.lastMatch;
			var xmlnsAttr = RegExp.$2;
			var xmlnsAttrValue = RegExp.$3;
			if ((xmlnsAttrValue!=null) && (xmlnsAttrValue.length > 0 ))
			{
			   //remove the xmlns attribute before doing the transformation
				 xmlnsAttrValue = xmlnsAttrValue.toLowerCase();
				 //xmlnsAttrValue is XHTML, remove it
				 if (xmlnsAttrValue == "http://www.w3.org/1999/xhtml")
				 {
					 //replace it in the xslt source
 					 var newHTMLTag = origHTMLTag.replace(xmlnsAttr,""); 
					 xsltsource = xsltsource.replace(origHTMLTag,newHTMLTag);
				 }
			}
		}
	}
	return xsltsource;
}



//replace output encoding to be utf-8
function replaceEncodingToUTF8(xsltsource)
{
  var xmlDeclarationRegExp = /<\?\s*xml\s*(.*)\s*encoding\s*=\s*\"(.*?)\"(.*)\?>/ig;
	if (xsltsource.match(xmlDeclarationRegExp) != null)
	{
		  var origXMLDeclaration  = RegExp.lastMatch;
			var currentEncoding = RegExp.$2;
			//convert it to lowercase
			//currentEncoding = currentEncoding.toLowerCase();
			if ((currentEncoding != "utf-8") || (currentEncoding != "UTF-8"))
			{
				 //change the encoding to be utf-8
				 var newXMLDeclaration = origXMLDeclaration.replace(currentEncoding,"utf-8"); 
				 //replace it in the xslt source
				 xsltsource = xsltsource.replace(origXMLDeclaration,newXMLDeclaration);
			}
	}

  var xslOutputRegExp = /<\s*xsl:output\s*(.*)\s*encoding\s*=\s*\"(.*?)\"(.*)>/ig;
	if (xsltsource.match(xslOutputRegExp) != null)
	{
		  var origXSLTOutput  = RegExp.lastMatch;
			var currentEncoding = RegExp.$2;
			//convert it to lowercase
			//currentEncoding = currentEncoding.toLowerCase();
			if ((currentEncoding != "utf-8") || (currentEncoding != "UTF-8"))
			{
				 //change the encoding to be utf-8
				 var newXSLTOutput = origXSLTOutput.replace(currentEncoding,"utf-8"); 
				 //replace it in the xslt source
				 xsltsource = xsltsource.replace(origXSLTOutput,newXSLTOutput);
			}
	}

  var metaRegExp = /<\s*meta\s*(.*)\s*content\s*=\s*\"(.*)charset\s*=\s*(.*?)\"(.*)>/ig;
	if (xsltsource.match(metaRegExp) != null)
	{
		  var origMetaTag  = RegExp.lastMatch;
			var currentEncoding = RegExp.$3;
			//convert it to lowercase
			//currentEncoding = currentEncoding.toLowerCase();
			if ((currentEncoding != "utf-8") || (currentEncoding != "UTF-8"))
			{
				 //change the encoding to be utf-8
				 var newMetaTag = origMetaTag.replace(currentEncoding,"utf-8"); 
				 //replace it in the xslt source
				 xsltsource = xsltsource.replace(origMetaTag,newMetaTag);
			}
	}
	return xsltsource;
}

function fixRemoteDTDWithLocal(xsltsource)
{
  if ((xsltsource != null) && (xsltsource.length > 0))
	{

		var entityRegExp = /<!\s*ENTITY\s*(.*)\s*\"(.*?)">/ig;
		var origSource = xsltsource;
		var baseConfigPath = dw.getConfigurationPath();
		var baseMacConfigPath = "";
		if (dwscripts.IS_MAC)
		{
		    //get unix config path
		    baseMacConfigPath = dw.getPosixConfigurationPath();
		}

		baseConfigPath += "/Shared/XHTMLDTD/";
		baseMacConfigPath+="/Shared/XHTMLDTD/";
		while (entityRegExp.exec(origSource) != null)
		{
			var entFileName = "";
		  var origEntityRef = RegExp.lastMatch;
			var httpRemoteEntityRef = RegExp.$2;

			//check if we have xhtml11 in uri path else default to xhtml 1.0 folder
			//note for xhtml 2.0 we need to have a different set since certain files
			//though named similiarly differ across versions (e.g xhtml-lat1.ent)		
			var configPath = "";
			var macConfigPath = "";
			if (((httpRemoteEntityRef !=null) && (httpRemoteEntityRef.length) && ((httpRemoteEntityRef.indexOf("xhtml11") != -1) || (httpRemoteEntityRef.indexOf("xhtml-modularization") != -1))) ||
			    ((origEntityRef !=null) && (origEntityRef.length) && (origEntityRef.indexOf("XHTML 1.1") != -1)))
			{
				configPath = baseConfigPath + "xhtml11/";
				macConfigPath = baseMacConfigPath + "xhtml11/";
			}
			else
			{ 
			  //default to 1.0
				configPath = baseConfigPath + "xhtml10/";
				macConfigPath = baseMacConfigPath + "xhtml10/";
			}

			//get the entity file name
			var slashIndex = httpRemoteEntityRef.lastIndexOf("/");
			if (slashIndex != -1)
			{
				entFileName = httpRemoteEntityRef.substring(slashIndex +1,httpRemoteEntityRef.length);
			}
			else
			{
				entFileName	 = httpRemoteEntityRef;
			}

			//append the file name
			if ((entFileName != null) && (entFileName.length))
			{
				var localEntityRef = configPath + entFileName;
				if (DWfile.exists(localEntityRef))
				{	
				    if (dwscripts.IS_MAC)
				    {
				      localEntityRef = macConfigPath + entFileName;
				    }			    
					localEntityRef = localEntityRef.replace("|",":");
					entityRef = origEntityRef;
					//replace it in the entity refernece path				
					entityRef = entityRef.replace(httpRemoteEntityRef,localEntityRef);
					//replace in the source
					xsltsource = xsltsource.replace(origEntityRef,entityRef);
				}
			}
		}		
	}
	return xsltsource;
}

function fixDTDSchemaPathReference(xmlsourceURI,xmlsource)
{
	var dtdRegExp = /<!\s*DOCTYPE\s*(.*)(SYSTEM|PUBLIC)\s*"(.*)"\s*>/ig;
	//var schemaRegExp = /xmlns\s*=\s*"(.*)"/ig //default namespace
	var isDTD = false;
	var isSchema = false;
	var schemaFilePath = null;
	if (xmlsource.match(dtdRegExp) != null)
	{
		isDTD = true;
		schemaFilePath = RegExp.$3;
	}
	/*else if (xmlsource.match(schemaRegExp) != null)
	{
		isSchema = true;
		schemaFilePath = RegExp.$1;
	}*/

	/*if (schemaFilePath != null)
	{
		var isHTTPReference = ((schemaFilePath.indexOf("http://") != -1) || (schemaFilePath.indexOf("https://") != -1));
		if (!isHTTPReference)
		{
				//check if it is valid abs file path
				var absSchemaFilePath = dwscripts.filePathToLocalURL(schemaFilePath);
				var bIsValidAbsPath = DWfile.exists(absSchemaFilePath);

				if (bIsValidAbsPath == false)
				{
					if (schemaFilePath.charAt(0) == '/')
					{
						 //check for site relative path and map them to absolute path
							schemaFilePath = site.siteRelativeToLocalPath(schemaFilePath);										
					}
					else
					{
							//make it relative to the xml document 
							var slashIndex = xmlsourceURI.lastIndexOf("/");
							if (slashIndex != -1)
							{
								xmlsourceURI = xmlsourceURI.substring(0,slashIndex);
								schemaFilePath = xmlsourceURI + "/" + schemaFilePath;
							}
					}
				}
		}
	}*/

	if (isDTD)
	{
		//replace the dtd string with an empty string for temp PIB since we are not validating
		//schemaFilePath = dwscripts.localURLToFilePath(schemaFilePath);
		var dtdString = "";
		xmlsource = xmlsource.replace(dtdRegExp,dtdString);
	}
	/*else if (isSchema)
	{
		//replace the default namespace schema with an empty string for temp PIB since we are not validating
		//schemaFilePath = dwscripts.localURLToFilePath(schemaFilePath);
		var defaultNameSpaceString = "";
		xmlsource = xmlsource.replace(schemaRegExp,defaultNameSpaceString);
	}*/

	return xmlsource;
}
