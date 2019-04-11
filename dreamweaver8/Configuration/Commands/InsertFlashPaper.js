// ----------------------------------------------------
//
// Copyright 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
// ----------------------------------------------------
//
// InsertFlashPaper.js
//
// ----------------------------------------------------

// ----------------------------------------------------
// private constants
// ----------------------------------------------------

/*const*/ var CONVERSION_CHECK_RATE = 200;	// in milliseconds

/*const*/ var FPC_SUCCESS = 0;
/*const*/ var FPC_FAILURE = -1;
/*const*/ var FPC_NO_DOCUMENT_HANDLER = -2;
/*const*/ var FPC_DISK_FULL = -3;
/*const*/ var FPC_DISK_WRITE_ERROR = -4;
/*const*/ var FPC_CANCELED = -5;
/*const*/ var FPC_BAD_ARGS = -6;
/*const*/ var FPC_NO_DRIVER = -7;
/*const*/ var FPC_NO_CONVERSION_BEGUN = -8;
/*const*/ var FPC_CONVERSION_IN_PROGRESS = -9;
/*const*/ var FPC_WAITING_FOR_CONNECTION = -10;

function isFpcError(result)
{
	return (result < 0);
}

// ----------------------------------------------------
// globals
// ----------------------------------------------------

var g_file = null;
var g_retVal = null;
var g_paperSizeInfo = null;

// ----------------------------------------------------
// public functions
// ----------------------------------------------------

function receiveArguments()
{
	g_file = arguments[0];
	g_retVal = arguments[1];
	g_paperSizeInfo = arguments[2];
}

function run()
{
	var result = insertFlashPaper( g_file, g_paperSizeInfo );
	if (g_retVal != null)
		g_retVal[0] = result;
}

function isFlashPaperAvailable(warnUserIfNotAvailable)
{
	var status = FPC_NO_DRIVER;
	if (typeof(FlashPaperConnect) != "undefined")
	{
		status = FlashPaperConnect.isAvailable();
	}
	
	if (status == FPC_SUCCESS)
	{
		return true;
	}
	else
	{
		if (warnUserIfNotAvailable)
		{
			if (status == FPC_NO_DRIVER)
			{
				alert(dw.loadString("flashpaper/flash paper install error"));
			}
			else
			{
				alert(dw.loadString("flashpaper/flash paper wrong os error"));
			}
		}
		return false;
	}
}

function insertFlashPaper(sourceURL, paperSizeInfo)
{
	/*const*/ var warnUserIfNotAvailable = true;
	if (!isFlashPaperAvailable(warnUserIfNotAvailable))
	{
		return false;
	}

	if (sourceURL == null || sourceURL == "") 
	{
		return false;
	}

	var prefsAccessibilityOption;
	if (dw.appName == "Contribute")
	{
		prefsAccessibilityOption = dw.getAdminEnforceAccessibilityPref();
	}
	else
	{
		prefsAccessibilityOption = dw.getPreferenceString("Accessibility", "Accessibility Image Options", "");
	}
	if (prefsAccessibilityOption)
	{
		var ok = dw.displayOptionalDialog("Flash Accessibility Warning Dialog", 
										dw.loadString("insert doc dialog/flash accessibility warning"), 
										true);
		if (!ok)
		{
			return false;
		}
	}

	// FlashPaperConnect expects a "real" pathname, not a fileURL
	var sourceFile = MMNotes.localURLToFilePath(dw.doURLDecoding(sourceURL));
	if (isFpcError(FlashPaperConnect.canDoConversion(sourceFile)))
	{
		alert(dw.loadString("flashpaper/flash paper conversion error"));
		return false;
	}

	var destURL = dw.doURLEncoding(calcUniqueDestURL(sourceURL));
	if (destURL == null || destURL == "")
	{
		alert(dw.loadString("flashpaper/flash paper conversion error"));
		return false;
	}

	// package up the info we need to save in the progress callback.
	var destFile = MMNotes.localURLToFilePath(dw.doURLDecoding(destURL));
	var conversionInfo = 
	{
		sourceFile: sourceFile,
		destFile: destFile,
		paperSize: paperSizeInfo,
		sessionID: 0
	};
	var titleString = dw.loadString("flashpaper/flash paper waiting title");
	var waitString = dw.loadString("flashpaper/flash paper waiting message");
	var result = callViaProgressDialog(titleString, waitString, CONVERSION_CHECK_RATE, waitForFlashPrinter, conversionInfo);

	// we're done. Tell FPC we're no longer interested in this session,
	// regardless of success, failure, or cancellation. (Ignore any error.)
	// pass 1 for the second argument to force us back into the foreground.
	FlashPaperConnect.endConversion(conversionInfo.sessionID, 1);

	if (result == null || result == FPC_CANCELED)
	{
		// user canceled.
		return false;
	}

	if (result != FPC_SUCCESS)
	{
		alert(dw.loadString("flashpaper/flash paper conversion error"));
		return false;
	}

	var widthAndHeight = dw.extractWidthAndHeightFromSWF(destFile);
	var width = (widthAndHeight != null) ? widthAndHeight[0] : 32;
	var height = (widthAndHeight != null) ? widthAndHeight[1] : 32;

	var winWidth = dw.getDocumentDOM().parentWindow.innerWidth;
	if (width > 0 && height > 0 && winWidth > 0)
	{
		/*const*/ var PERCENT_OF_WIDTH = 0.90;
		var aspectRatio = height / width;
		width = Math.round(winWidth * PERCENT_OF_WIDTH);
		height = Math.round(width * aspectRatio);
	}

	var rtnStr = '<OBJECT CLASSID="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" ' + 
				'CODEBASE="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,29,0" ' +
				'WIDTH="' + width.toString() + '" HEIGHT="' + height.toString() + '" BORDER="1">\n' + 
				'<PARAM NAME="movie" VALUE="' + destURL + '?POPUP_ENABLED=true"> ' +
				'<PARAM NAME="menu" VALUE="false"> ' +
				'<PARAM NAME="quality" VALUE="high">\n' +
				'<EMBED SRC="' + destURL + '?POPUP_ENABLED=true" ' +
				'quality="high" menu="false" PLUGINSPAGE="http://www.macromedia.com/go/getflashplayer" ' +
				'TYPE="application/x-shockwave-flash" WIDTH="' + width.toString() + '" HEIGHT="' + height.toString() + '">'+
				'</EMBED></OBJECT>';

	prefsAccessibilityOption = dw.getPreferenceString("Accessibility", "Accessibility Media Options", "");

	if (prefsAccessibilityOption == 'TRUE')
	{
		rtnStr = addAccessibility(rtnStr);
	}

	/*const*/ var bReplaceCurrentSelection = true;
	/*const*/ var bAutoSetEmbeddedItemsWidthAndHeight = false;
	dw.getDocumentDOM().insertHTML(rtnStr, bReplaceCurrentSelection, bAutoSetEmbeddedItemsWidthAndHeight);
	return true;
}

// ----------------------------------------------------
// ProgressDialog wrapper functions
// ----------------------------------------------------

var g_percentage = -1;
var g_msgString = null;

function callViaProgressDialog(title, message, howFrequentlyToCall, callbackFunction, callbackFunctionArg)
{
	var progress = null;
	var response = null;
	try
	{
		progress = dw.openProgressDialog(title, message, 0);
		if (progress != null)
		{
			var lastCall = 0;
			while (true)
			{
				var now = MM.getTickCount();
				if (now < lastCall + howFrequentlyToCall)
					continue;

				lastCall = now;

				if (callbackFunction != null)
					response = callbackFunction(updatePercentageFunc, callbackFunctionArg);
				
				if (g_msgString != null)
				{
					progress.setMessage(g_msgString.toString());
					g_msgString = null;
				}

				var canceled = progress.update(g_percentage, 100);
				if (canceled)
				{
					response = null;
					break;
				}

 				if (response != null) 
				{
					break;
 				}
			}		
			
			progress.close();
			progress = null;
		}
	} 
	catch( e ) 
	{
		// just in case.
		if (progress != null)
		{
			progress.close();
			progress = null;
		}
	}
	return response;
}


function updatePercentageFunc(percentage, msgString)
{
	g_percentage = percentage;
	g_msgString = msgString;
}

// ----------------------------------------------------
// private functions
// ----------------------------------------------------

function getLeafName(url)
{
	if (url.length > 0 && url[url.length-1] == '/')
		url = url.substr(0, url.length-1);

	var lastSlash = url.lastIndexOf("/");
	if (lastSlash != -1)
		return url.substr(lastSlash+1);
	else
		return url;
}

function stripExtension(url)
{
	var lastDot = url.lastIndexOf(".");
	if (lastDot >= 1)
		return url.slice(0, lastDot);
	else
		return url;
}

function calcUniqueDestURL(sourceURL)
{	
	if (typeof(FileStateManager.getLocalAssetsDirURLForSite) == "undefined")
	{
		return "";
	}

	var destDir = FileStateManager.getLocalAssetsDirURLForSite("");
	if (destDir[destDir.length-1] != "/")
		destDir += "/";
	var destLeafName = stripExtension(getLeafName(sourceURL));

	// if there are any double-byte chars, make up a new name.
	// we can do this quietly (and sloppily) since the filename
	// doesn't really have to be user-friendly, just unique.
	var tester = dw.doURLDecoding(destLeafName);
	for (i = 0; i < tester.length; i++) 
	{
		var charCode = tester.charCodeAt(i);
		if (charCode > 255) 
		{
			// it's a doublebyte char. 
			// since we're going to uniquify the name below, just
			// give it a bland base name.
			destLeafName = "untitled";
			break;
		}
	}

	var destURL = "";
	for (var i = 0; i < 99999; ++i)
	{
		destURL = destDir;
		destURL += destLeafName;
		if (i != 0)
			destURL += i.toString();
		destURL += ".swf";
		// strangely, DWfile.exists() doesn't decode urls (eg, %20->space), 
		// so we must do that ourselves.
		destURL = dw.doURLDecoding(destURL);
		if (!DWfile.exists(destURL))
		{
			return destURL;
		}
	}

	return "";
}

function waitForFlashPrinter(updatePercentageFunc, conversionInfo)
{
	if (conversionInfo.sessionID == 0)
	{
		var status = FlashPaperConnect.beginConversion(conversionInfo.sourceFile, 
														conversionInfo.destFile, 
														conversionInfo.paperSize);
		if (isFpcError(conversionInfo.sessionID))
		{
			// doh. bail now.
			return status;
		}
		else
		{
			// we're good; save the status as our sessionID and return null to continue waiting.
			conversionInfo.sessionID = status;
			updatePercentageFunc(-1, null);
			return null;
		}
	}
	else
	{
		var howLongToSleep = CONVERSION_CHECK_RATE / 2;
		var status = FlashPaperConnect.getConversionStatus(conversionInfo.sessionID, howLongToSleep);
		if (status == FPC_WAITING_FOR_CONNECTION)
		{
			// we're waiting for the FlashPrinter to respond.
			updatePercentageFunc(-1, null);
			return null;
		}
		else if (status == FPC_CONVERSION_IN_PROGRESS)
		{
			var percentageDone = FlashPaperConnect.getConversionPercentComplete(conversionInfo.sessionID);
			var pageBeingProcessed = FlashPaperConnect.getConversionPageBeingProcessed(conversionInfo.sessionID);

			var msgString = null;
			if (percentageDone < 0)
			{
				msgString = dw.loadString("flashpaper/flash paper receiving message");

				// in odd situations, we can get "Receiving page 0". Quietly check and fix.
				if (pageBeingProcessed == 0) 
				{
					msgString = dw.loadString("flashpaper/flash paper waiting message");
				}
			}
			else
			{
				msgString = dw.loadString("flashpaper/flash paper converting message");
				
				// ideally we would have messages like this, but it's too late to add specific UI
				// string for this. we'll just use a generic message.
				//
				//if (pageBeingProcessed == 0) 
				//	msgString = "Optimizing...";
				//else if (percentageDone >= 100) 
				//	msgString = "Compressing...";

				if (pageBeingProcessed == 0 || percentageDone >= 100) 
					msgString = dw.loadString("flashpaper/flash paper waiting message");
			}

			var re = /%d/;
			msgString = msgString.replace(re, pageBeingProcessed.toString());

			updatePercentageFunc(percentageDone, msgString);

			// we're still waiting.
			return null;
		}
		else
		{
			return status;
		}
	}
}

function addAccessibility(rtnStr) 
{
   var cmdFile = dreamweaver.getConfigurationPath() + "/Commands/Object Options.htm";
   var cmdDOM = dreamweaver.getDocumentDOM(cmdFile);
 
   cmdDOM.parentWindow.setFormItem(rtnStr);
   dreamweaver.popupCommand("Object Options.htm");
   return (cmdDOM.parentWindow.returnAccessibilityStr(rtnStr));	
}

