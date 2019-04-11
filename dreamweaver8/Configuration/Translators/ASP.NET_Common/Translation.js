// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
// *************** GLOBAL VARS *****************

var debugTranslator		= false;
var macBeforeFileName	= "Desktop:BeforeTranslation.txt";
var macAfterFileName	= "Desktop:AfterTranslation.txt";
var winBeforeFileName	= "C:\\BeforeTranslation.txt";
var winAfterFileName	= "C:\\AfterTranslation.txt";
var designerMgrInitialized = false;

function myAlwaysCheckTag(tagName)
{
  return (tagName.substr(0, 4) == "asp:" ||
		  tagName.substr(0, 3) == "mm:");
}

function myAlwaysCheckAttribute(code)
{
  var result = (code.indexOf("<%") != -1);
  return result;
}

function translateMarkup(docNameStr, siteRootStr, inStr)
{
	if (debugTranslator)
	{
		if ( "macos" == DWfile.getPlatform() )
			DWfile.write( macBeforeFileName, inStr );
		else
			DWfile.write( winBeforeFileName, inStr );
	}
	var outStr = miniTranslateMarkup(docNameStr, siteRootStr, inStr, true);
	if (debugTranslator)
	{
		if ( "macos" == DWfile.getPlatform() )
			DWfile.write( macAfterFileName, outStr );
		else
			DWfile.write( winAfterFileName, outStr );
	}

	return outStr;
}

function miniTranslateMarkup(docNameStr, siteRootStr, inStr, findAllServerBehaviors)
{
	var outStr = "";
	var serverModel = "";
	var serverLanguage = "";
	var dom = dw.getDocumentDOM();

	if (dom)
	{
		serverModel = dom.serverModel.getServerName();
		serverLanguage = dw.getDocumentDOM().serverModel.getServerLanguage();
		if (serverModel == "")
		{
			serverModel = dw.getDocumentDOM().getServerNameFromDoc();
			serverLanguage = dw.getDocumentDOM().getServerLanguageFromDoc();
		}
	}

	if ((inStr.length > 0) && (serverModel == "ASP.NET"))
	{
		if ((inStr.indexOf("<%") != (-1)) ||
			(inStr.search(/runat/i) != (-1)))
		{
			if (!designerMgrInitialized)
			{
				designerMgrInitialized =
					ASPNetDesignerMgr.initialize(dw.getRootDirectory());
			}

			var TM = new TranslationManager(TRANSLATOR_CLASS, serverModel, serverLanguage);
			TM.serverModelAlwaysCheckTag = myAlwaysCheckTag;
			TM.serverModelAlwaysCheckAttribute = myAlwaysCheckAttribute;
			TM.tagSpanCache = ASPNetDesignerMgr;
			
			var registerRE = /<%@\s*register\s*[^>]*%>/ig;
			var registers = inStr.match(registerRE);
			var directives = "";
			if (registers && registers.length > 0)
				directives = registers.join('');
			TM.directives = directives;

			var split = TranslationManager.splitBody(inStr);
			outStr = TM.translate(split.inStr);
			if (outStr != "")
				outStr = split.preInStr + outStr + split.postInStr;
			//ASPNetDesignerMgr.uninitialize();
		}
		// Tell Server Behavior Inspector to update its list
		if (findAllServerBehaviors)
		{
			dw.serverBehaviorInspector.findAllServerBehaviors();
		}
	}

	return outStr;
}

