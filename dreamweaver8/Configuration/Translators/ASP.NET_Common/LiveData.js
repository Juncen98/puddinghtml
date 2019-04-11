// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

var liveDebugTranslator		= false;
var liveMacBeforeFileName	= "Desktop:LiveBeforeTranslation.txt";
var liveMacAfterFileName	= "Desktop:LiveAfterTranslation.txt";
var liveWinBeforeFileName	= "C:\\LiveBeforeTranslation.txt";
var liveWinAfterFileName	= "C:\\LiveAfterTranslation.txt";

var beginLock			= "<mm:beginlock translatorClass=\"MM_LIVE_DATA\" type=\"MM_ASPNETSCRIPT\" orig=\"%s\">";
var endLock				= "<mm:endlock>";
var translatedAttr		= "mmvisible=false";
var FIRST_MARKER        = "<!--MMDW 0 -->";



//--------------------------------------------------------------------
// FUNCTION:
//   stripLeadingMarkers
//
// DESCRIPTION:
//   Remove all "MMDW" comments that occur prior to any static HTML.
//   If we leave these markers in the code, and if they happen to
//   fall before a directive that includes the line
//
//     Response.Buffer=true
//
//   then the presence of the HTML comment will cause the page
//   to fail to execute.
//
// ARGUMENTS:
//   code - string - the string to strip
//
// RETURNS:
//   string - the same string, with the markers stripped
//--------------------------------------------------------------------

function stripLeadingMarkers(str)
{
  var i;
 
  // If "MMDW 0" is at the very beginning of the document, then there
  // is no static HTML before the first server markup
  if (str.indexOf(FIRST_MARKER) == 0)
    str = str.substr(FIRST_MARKER.length);

  // If the comment indicating the end of a block of server markup
  // is followed by whitepsace and then a comment indicating the start
  // of another block of server markup, then continue to strip the
  // comments, because we still haven't encountered any static HTML
  i = 1;
  while (true)
  {
    var startMarker = "<!--MMDW " + (i++) + " -->";
    var endMarker   = "<!--MMDW " + (i++) + " -->";
    
    var startIndex = str.indexOf(startMarker);
    var endIndex =   str.indexOf(endMarker);
    if (startIndex == -1 || endIndex == -1)
      break;

    var afterMarkerIndex = startIndex + startMarker.length;
    var betweenMarkers = str.substr(afterMarkerIndex, endIndex - afterMarkerIndex);
    if (betweenMarkers.search(/\S/) != -1)
      break;

    afterMarkerIndex = endIndex + endMarker.length;
    str = str.substr(0, startIndex) + str.substr(afterMarkerIndex);
  }

  return str;
}



function liveDataTranslateMarkup( docNameStr, siteRootStr, inStr )
{
	var labels, translated, outStr, index, initTags;
	var labelsAndMarker;

	if (liveDebugTranslator)
	{
		if ( "macos" == DWfile.getPlatform() )
			DWfile.write( liveMacBeforeFileName, inStr );
		else
			DWfile.write( liveWinBeforeFileName, inStr );
	}

	// Refuse to translate if the document's server model is not ASP.NET
	if (dw.getDocumentDOM().serverModel.getServerName() != "ASP.NET")
		return "";

	// Refuse to translate if we're not inside a site
	if (siteRootStr.length == 0)
		return "";

	// Don't try to translate an empty document
	if (inStr.length == 0)
		return "";

	// Send init tags to the server and request requst them
	initTags = dreamweaver.getLiveDataInitTags();
	if (initTags.length > 0)
	{
		// Add a marker at the end so we can check for successful completion
		initTags = initTags + "<!-- MMDW:success -->";

		// Send file to server and get the response
		translated = dreamweaver.liveDataTranslate(docNameStr, initTags);

		// If we can't find our marker, report that an error occurred
		if (translated.data.lastIndexOf("<!-- MMDW:success -->") == -1)
		{
			dreamweaver.setLiveDataError(translated.data);
			return "";
		}
	}


    attrsForServerTags = new Array(1);
    attrsForServerTags[0] = "runat";

    attrValuesForServerTags = new Array(1);
    attrValuesForServerTags[0] = "server";

	attrsDenoteNonHtml = new Array(1);
	attrsDenoteNonHtml[0] = 1;

	// Wrap labels around the server directives
	LiveDataTranslator.initialize();
	LiveDataTranslator.beginPreTranslate("<%", "%>", null, null,
										 attrsForServerTags,
										 attrValuesForServerTags,
										 attrsDenoteNonHtml);
	dreamweaver.scanSourceString(inStr, LiveDataTranslator);
	labels = LiveDataTranslator.endPreTranslate(inStr);

	// Add a marker at the end so we can check for successful completion
	labelsAndMarker = labels + "<!-- MMDW:success -->";

    // If the document begins with server markup, strip off the "MMDW"
    // comments that appear before the first static HTML.  We'll add them
    // back in later.  If these comments aren't stripped, then a 
    // Response.Buffer=true directive will fail, because that directive
    // must appear before any static HTML.
    labelsAndMarker = stripLeadingMarkers(labelsAndMarker);

    // If we send a file with Mac-style "\r" line endings to a Unix server,
    // the server will ignore the "\r" characters (line ending is "\n" on 
    // Unix) and send back a file with no line endings.  Instead, we'll 
    // convert line endings to "\r\n" before sending to the server.
    labelsAndMarker = LiveDataTranslator.setLineEndingsToMatch("\r\n",
		labelsAndMarker);

	// Send file to server and get the response
	translated = dreamweaver.liveDataTranslate(docNameStr, labelsAndMarker);

	// If we can't find our marker, report that an error occurred
	index = translated.data.lastIndexOf("<!-- MMDW:success -->");
	if (index == -1)
	{
		// Request page without the labels, so we get the right line numbers
        inStr = inStr + "<!-- MMDW:success -->";
		translated = dreamweaver.liveDataTranslate(docNameStr, inStr);

		// Tell Dreamweaver to display an error
		dreamweaver.setLiveDataError(translated.data);

		LiveDataTranslator.cleanup();
		return "";
	}
	translated.data = translated.data.substr(0, index);

    // Add back the leading markers that were stripped earlier
    if (translated.data.indexOf(FIRST_MARKER) == -1)
      translated.data = FIRST_MARKER + translated.data;

	// Some HTTP servers change the line endings in the file
	translated.data = LiveDataTranslator.setLineEndingsToMatch(inStr,
		translated.data);

	// If the scripts on the page were not executed or there are no scripts
	// on the page, then just abort
	if (translated.data == labels)
		return "";

	// Remove the labels and add lock tags
	LiveDataTranslator.beginPostTranslate();
	dreamweaver.scanSourceString(translated.data, LiveDataTranslator);
	outStr = LiveDataTranslator.endPostTranslate(inStr, translated.data,
		beginLock, endLock, translatedAttr, true);

	LiveDataTranslator.cleanup();

	if (liveDebugTranslator)
	{
		if ( "macos" == DWfile.getPlatform() )
			DWfile.write( liveMacAfterFileName, outStr );
		else
			DWfile.write( liveWinAfterFileName, outStr );
	}

	return outStr;
}
