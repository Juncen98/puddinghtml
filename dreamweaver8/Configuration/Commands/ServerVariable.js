// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved

var helpDoc;

//---------------   GLOBAL VARIABLES   ---------------

var OBJECT_FILE = dw.getConfigurationPath() + '/Objects/Server/ServerVariables.htm';
var LIST_VARS;
var CKBOX_WRAP = null;
var VARIABLE_NAMES = new Array('ALL_HTTP', 'AUTH_PASS', 'AUTH_TYPE', 'CONTENT_LENGTH', 'CONTENT_TYPE', 'GATEWAY_INTERFACE', 'PATH_INFO', 'PATH_TRANSLATED', 'QUERY_STRING', 'REMOTE_ADDR', 'REMOTE_HOST', 'REMOTE_IDENT', 'REMOTE_USER', 'REQUEST_BODY', 'REQUEST_METHOD', 'SCRIPT_NAME', 'SERVER_NAME', 'SERVER_PORT', 'SERVER_PROTOCOL', 'SERVER_SOFTWARE');
var ASP_VALUES = new Array('Request.ServerVariables("ALL_HTTP")\n','Request.ServerVariables("AUTH_PASS")\n','Request.ServerVariables("AUTH_TYPE")\n','Request.ServerVariables("CONTENT_LENGTH")\n','Request.ServerVariables("CONTENT_TYPE")\n','Request.ServerVariables("GATEWAY_INTERFACE")\n','Request.ServerVariables("PATH_INFO")\n','Request.ServerVariables("PATH_TRANSLATED")\n','Request.ServerVariables("QUERY_STRING")\n','Request.ServerVariables("REMOTE_ADDR")\n','Request.ServerVariables("REMOTE_HOST")\n','Request.ServerVariables("REMOTE_IDENT")\n','Request.ServerVariables("REMOTE_USER")\n','Request.ServerVariables("REQUEST_BODY")\n','Request.ServerVariables("REQUEST_METHOD")\n','Request.ServerVariables("SCRIPT_NAME")\n','Request.ServerVariables("SERVER_NAME")\n','Request.ServerVariables("SERVER_PORT")\n','Request.ServerVariables("SERVER_PROTOCOL")\n','Request.ServerVariables("SERVER_SOFTWARE")\n');
var CFML_VALUES = new Array('#CGI.ALL_HTTP#\n','#CGI.AUTH_PASS#\n','#CGI.AUTH_TYPE#\n','#CGI.CONTENT_LENGTH#\n','#CGI.CONTENT_TYPE#\n','#CGI.GATEWAY_INTERFACE#\n','#CGI.PATH_INFO#\n','#CGI.PATH_TRANSLATED#\n','#CGI.QUERY_STRING#\n','#CGI.REMOTE_ADDR#\n','#CGI.REMOTE_HOST#\n','#CGI.REMOTE_IDENT#\n','#CGI.REMOTE_USER#\n','#CGI.REQUEST_BODY#\n','#CGI.REQUEST_METHOD#\n','#CGI.SCRIPT_NAME#\n','#CGI.SERVER_NAME#\n','#CGI.SERVER_PORT#\n','#CGI.SERVER_PROTOCOL#\n','#CGI.SERVER_SOFTWARE#\n');
var gVarStr = '';

//---------------     API FUNCTIONS    ---------------

function isDOMRequired()
{
	// Return false, indicating that this object is available in code view.
	return false;
}

function commandButtons()
{
   return new Array(MM.BTN_OK,		"setVarStr(); window.close()",
                    MM.BTN_Cancel,	"window.close()" );
}

function getVarStr()
{
	return gVarStr;
}

function setVarStr()
{
	// Do manual insertion to ensure line break gets inserted
	// after code. Replace selection if there is one.

	var before = '';
	var after = ''
	
	if (CKBOX_WRAP)
	{
		if (document.theForm.wrapTags.checked == true)
		{
			before = '<%= ';
			after = ' %>';
		}
		
		// save checkbox state
		
		var theFile = MMNotes.open(OBJECT_FILE, true);
		
		if (theFile)
		{
			MMNotes.set(theFile,"checkBoxOn",document.theForm.wrapTags.checked);
			MMNotes.close(theFile);
		}
	}

	gVarStr = before + LIST_VARS.getValue() + after;
	
	return;
}

//---------------    LOCAL FUNCTIONS   ---------------

function initUI()
{
	var dom = dw.getDocumentDOM();	
	var model = dom.serverModel.getServerName();
	var checkedState = '';
	
	LIST_VARS = new ListControl('varName');

	var theFile = MMNotes.open(OBJECT_FILE, false);
	
	if (theFile)
	{
		if (!MMNotes.get(theFile,"checkBoxOn") || (MMNotes.get(theFile,"checkBoxOn") && MMNotes.get(theFile,"checkBoxOn") == "true"))
		{
			checkedState = ' checked';
		}
		
		MMNotes.close(theFile);
	}
		
	if (model == "ASP")
	{
		dwscripts.findDOMObject("wrapWithTags").innerHTML = '<input type="checkbox" name="wrapTags"' + checkedState + '> <label for="wrapTags">' + LABEL_WRAP + '</label>';
		CKBOX_WRAP = document.theForm.wrapTags;
		LIST_VARS.setAll(VARIABLE_NAMES,ASP_VALUES);
	}
	else
	{
		LIST_VARS.setAll(VARIABLE_NAMES,CFML_VALUES);
	}
	
	document.theForm.varName.focus(); // give focus to list
}
