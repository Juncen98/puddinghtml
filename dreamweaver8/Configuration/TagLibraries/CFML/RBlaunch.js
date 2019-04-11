// Copyright 2005 Macromedia, Inc. All rights reserved.

function launchRB(templatePath) 
{
	var editorArray = dw.getPrimaryExtensionEditor('.cfr');
	var appPath = null;
	var appPathUrl = null;
	
	if (editorArray.length >= 2) 
		appPathUrl = editorArray[1];
		
	if( !appPathUrl || !dwscripts.fileExists(appPathUrl) )
	{
		var msg = dw.loadString("alert/FeatureRequiresReportBuilder");
		alert(msg);
		return;
	}
	
	appPath = dwscripts.localURLToFilePath(editorArray[1]);
	var workingDir = appPath.substring(0, appPath.lastIndexOf('\\'));
	var rbTemplate = dwscripts.getAbsoluteURL(templatePath);
	var getLocalFilePath = dwscripts.localURLToFilePath(rbTemplate);
	MM.createProcess('', appPath + ' "' + getLocalFilePath + '"', 1, false, workingDir);
}

function newTemplate () {
	var editorArray = dw.getPrimaryExtensionEditor('.cfr');
	var appPath = null;
	var appPathUrl = null;
	
	if (editorArray.length >= 2) 
		appPathUrl = editorArray[1];
	
	if( !appPathUrl || !dwscripts.fileExists(appPathUrl) )
	{
		var msg = dw.loadString("alert/FeatureRequiresReportBuilder");
		alert(msg);
		return;
	}

	var appPath = dwscripts.localURLToFilePath(editorArray[1]);
	var workingDir = appPath.substring(0, appPath.lastIndexOf('\\'));
	var appArgs = "NewColdFusionReport";
	MM.createProcess('', appPath + ' ' + appArgs, 1, false, workingDir);
}
