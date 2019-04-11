// Copyright 2005 Macromedia, Inc. All rights reserved.

function receiveArguments()
{
	var dom = dw.getDocumentDOM();
	var serverModel = "";
	var serverLanguage = "";

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
  
	switch (serverModel) 
	{
		case "ASP": if (serverLanguage == "JavaScript")
						dom.source.applyComment('<%/*%>', '<%*/%>');
					else
						dom.source.applyComment('\'', '');
					break;
		case "ASP.NET": dom.source.applyComment('<%--', '--%>'); break;
		case "JSP": dom.source.applyComment('<%--', '--%>'); break;
		case "Cold Fusion": dom.source.applyComment('<!---', '--->'); break;
		case "PHP": dom.source.applyComment('<?php /*?>', '<?php */?>'); break;
		case "XSLT":
		case "XSLT-fragment" : dom.source.applyComment('<xsl:comment>', '</xsl:comment>');
	}
}

function isDOMRequired()
{
	return false;
}

function setMenuText()
{
	var dom = dw.getDocumentDOM();
	var serverModel = "";
	var serverLanguage = "";

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
  
	switch (serverModel) 
	{
		case "ASP": if (serverLanguage == "JavaScript")
						return MENU_ASP_JS_COMMENT;
					else
						return MENU_Default;
		case "ASP.NET": 
		case "JSP": return MENU_DOTNET_JSP_COMMENT;
		case "Cold Fusion": return MENU_CF_COMMENT;
		case "PHP": return MENU_PHP_COMMENT;
		case "XSLT":
		case "XSLT-fragment" : return MENU_XSLT_COMMENT;
	}
	return MENU_Default;
}

function canAcceptCommand()
{
	var dom = dw.getDocumentDOM();
	var serverModel = "";
	var serverLanguage = "";

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

	var enabled = dw.getFocus(true) != 'document';

	return (serverModel != "" && !(serverModel == "ASP" && serverLanguage != "JavaScript") && enabled);
}
