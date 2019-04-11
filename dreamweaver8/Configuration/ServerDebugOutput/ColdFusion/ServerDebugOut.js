// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var DEBUG = false;
var temp_file_name = null;
var real_file_name = null;

//*******************  COMPONENT API **********************
//*-------------------------------------------------------------------
// FUNCTION:
//   onLiveDebugToggledOn
//
// DESCRIPTION:
//	 This function is called when live debug is toggled on. It 
//	 gives the this debug file an opportunity intialize anything
//	 needed for debugging
//
// ARGUMENTS:
//
//	 none.
//	
// RETURNS:
//   none.
//   
//--------------------------------------------------------------------
function onLiveDebugToggledOn() 
{
	//check to see if this is a blackstone server of not
	var dom = dreamweaver.getDocumentDOM();
	if( !dom || dom.serverModel.getServerVersion("Server.ColdFusion.ProductVersion.Major") < 7 ) {
		return;
	}
	
	enableRemoteDebuggingSettings();
}

//*-------------------------------------------------------------------
// FUNCTION:
//   onLiveDebugToggledOff
//
// DESCRIPTION:
//	 This function is called when live debug is toggled off. It 
//	 gives the this debug file an opportunity to clean up after 
//	 debugging
//
// ARGUMENTS:
//
//	 none.
//	
// RETURNS:
//   none.
//   
//--------------------------------------------------------------------
function onLiveDebugToggledOff() 
{
	//check to see if this is a blackstone server of not
	var dom = dreamweaver.getDocumentDOM();
	if( !dom || dom.serverModel.getServerVersion("Server.ColdFusion.ProductVersion.Major") < 7 ) {
		return;
	}
	
	restoreRemoteDebuggingSettings();
}


//*-------------------------------------------------------------------
// FUNCTION:
//   findServerDebugInfo
//
// DESCRIPTION:
//	 this functions finds the debug data islands embedded in http respone
//	 The debug data is format is document
//	 http://developer.macromedia.com/ud/dtds/ultradev-debug-1.0.dtd
//
// ARGUMENTS:
//
//	 source(browsed document source)
//	 filename(the name of the file)
//	 tempfilename(the temporary name of the file , if PIB using temp is enabled)
//	
// RETURNS:
//   none.
//   
//--------------------------------------------------------------------
function findServerDebugInfo(source, filename, tempfilename)
{
	var aCallbackObj = new Object();
	aCallbackObj.directive  = findCFDebugOutput;
	temp_file_name = tempfilename;
	real_file_name = filename;
	dreamweaver.scanSourceString(source, aCallbackObj);
}

function findCFDebugOutput(code)
{
	// find start of comment
	var aBeginIndex = code.indexOf("<!--");
	if(aBeginIndex != -1)
	{
		// don't search whole string for our signature, just 1st few characters
		var aCommentSlice = code.slice(aBeginIndex, code.length > 20 ? 20 : code.length - 1);
		if (aCommentSlice.indexOf("cf_debug_start") != -1)
		{
			// create relative path to my folder
			var aPath = "ServerDebugOutput" + dwscripts.FILE_SEP + "ColdFusion" + dwscripts.FILE_SEP;

			// create absolute path to XSLT file
			var anXSLTPath = dw.getConfigurationPath() + dwscripts.FILE_SEP + aPath + "cfdebugout.xsl";

			// read the xslt file
//
// disable XSL cache for the time being
//			if(MM.CFDebugXSLT == null)
//			{
//				MM.CFDebugXSLT = DWfile.read(anXSLTPath);
//			}
//
			var MMCFDebugXSLT = DWfile.read(anXSLTPath);

			// create parameters array for the xslt engine
			var someParams = new Array();
			someParams[0] = "config_folder";
			someParams[1] = "'" + aPath + "'";
			if(temp_file_name != null)
			{
				someParams[2] = "temp_file_name";
				someParams[3] = "'" + temp_file_name + "'";
				someParams[4] = "real_file_name";
				someParams[5] = "'" + real_file_name + "'";
			}

			// extract XML from comment tag
			var aStartBracketIndex = code.indexOf("<", aBeginIndex + 1);
			if(aStartBracketIndex != -1)
			{
				var anEndBracketIndex = code.lastIndexOf(">");
				if(anEndBracketIndex != -1)
				{
					anEndBracketIndex = code.lastIndexOf(">", anEndBracketIndex - 1);
					if(anEndBracketIndex != -1)
					{
						code = code.slice(aStartBracketIndex, anEndBracketIndex + 1);

						// extract XML from comment tag and transform it
						var theNewXML = XSLT.transform(code, MMCFDebugXSLT, someParams);
						dw.resultsPalette.debugWindow.addDebugContextData(theNewXML);
					}
				}
			}
		}
	}
}

//*-------------------------------------------------------------------
// FUNCTION:
//   OnHelp
//
// DESCRIPTION:
//	 this functions finds the debug data islands embedded in http respone
//	 The debug data is format is document
//	 http://developer.macromedia.com/ud/dtds/ultradev-debug-1.0.dtd
//
// ARGUMENTS:
//	 none.
//	
// RETURNS:
//   none.
//   
//--------------------------------------------------------------------
function OnEnableDebuggingHelp()
{
	var adminurl = "/cfide/administrator/debugging/index.cfm";
	var servername = "";
	if (dw.getDocumentDOM())
	{
			servername = dw.getDocumentDOM().serverModel.getAppURLPrefix();
	}
	if (servername.length)
	{
		var slashIndex = servername.indexOf("/",7);
		servername		 = servername.substring(0,slashIndex);
	}
	servername += adminurl;
	dw.browseDocument(servername);
}

//*-------------------------------------------------------------------
// FUNCTION:
//   OnHelp
//
// DESCRIPTION:
//	 this functions finds the debug data islands embedded in http respone
//	 The debug data is format is document
//	 http://developer.macromedia.com/ud/dtds/ultradev-debug-1.0.dtd
//
// ARGUMENTS:
//	 none.
//	
// RETURNS:
//   none.
//   
//--------------------------------------------------------------------
function OnSelectIPDebuggingHelp()
{
	var adminurl = "/cfide/administrator/debugging/iplist.cfm";
	var servername = "";
	if (dw.getDocumentDOM())
	{
			servername = dw.getDocumentDOM().serverModel.getAppURLPrefix();
	}
	if (servername.length)
	{
		var slashIndex = servername.indexOf("/",7);
		servername		 = servername.substring(0,slashIndex);
	}
	servername += adminurl;
	dw.browseDocument(servername);
}


// TODO: Remove the following:
// 1. displayInstructions() API is no longer necessary.
// 2. cleanup code and strings
//
// Specify list of steps that user must complete to get useful information
// in this panel. Note that we display previous steps (1-4) so that we present
// user with a single dynamic list (not 2 static list)
//
// TODO: do we want to implement the "events" from previous list for consistency?

function getSetupSteps()
{
  var dom = null;
  var url = "";
  var curSite = null;

  // Try to get the site for the currently selected document
  dom = dw.getDocumentDOM();
  if (dom != null)
    url = dom.URL;
  if (url.length > 0)
    curSite = site.getSiteForURL(url);
  else
    curSite = site.getCurrentSite(); 
  if (curSite.length == 0)
	curSite = site.getCurrentServerSite();
	
  var title = MM.MSG_Dynamic_InstructionsTitle;
  var step1 = MM.MSG_Dynamic_InstructionsStep1;
  if (curSite.length != 0 && site.getIsServerSite(curSite))
    step1 = MM.MSG_Dynamic_InstructionsStep1A;
  var step2 = MM.MSG_Dynamic_InstructionsStep2;
  var step3 = MM.MSG_ServerDebug_InstructionsStep3;
  if (curSite.length != 0 && site.getIsServerSite(curSite))
	step3 = MM.MSG_Dynamic_InstructionsStep3A;

  return new Array(title, step1, step2, step3);
}


function setupStepsCompleted()
{
  var stepsCompleted = -1;	// all steps complete
  var dom = null;
  var serverModel = "";
  var url = "";
  var curSite = null;

  // Try to get the site for the currently selected document
  dom = dw.getDocumentDOM();
  if (dom != null)
    url = dom.URL;
  if (url.length > 0)
    curSite = site.getSiteForURL(url);
  else
    curSite = site.getCurrentSite();
  if (curSite.length == 0)
	curSite = site.getCurrentServerSite();

  // If no site defined, prompt user to create one
  if (curSite.length == 0)
    return 0;

  // Try to get the server model of the currently selected document
  // If no document is open, get the default server model for cur site.
  if (dom == null)
    dom = dw.getNewDocumentDOM();
  if (dom && dom.serverModel)
    serverModel = dom.serverModel.getFolderName();

  // If doc type does not support server markup, prompt user
  // to choose dynamic doc type
  if (serverModel.length == 0)
    return 1;

  // If no app server is defined, prompt user to specify one
  if (dom == null || dom.serverModel.testAppServer() == false)
    return 2;

  return 3;
}
