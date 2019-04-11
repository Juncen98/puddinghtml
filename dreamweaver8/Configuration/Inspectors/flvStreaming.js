//Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

// *********** GLOBAL VARS *****************************
var HELP_DOC = MM.HELP_FlashVideo_PI;
var flvType = "streaming";

// UI elements
var VIDEO_SERVER_URI;
var VIDEO_SERVER_STREAM;
var VIDEO_LIVE_FEED;
var VIDEO_BUFFER_TIME;

function displayHelp()
{
  dwscripts.displayDWHelp(HELP_DOC); 
}

// ******************** API ****************************
function canInspectSelection()
{
  var dom = dw.getDocumentDOM();
  var theObj = dom.getSelectedNode();
  
  if (!theObj) 
    return false;
  
  var children   = theObj.childNodes;
  var nChildren  = children.length;

  for( var i = 0; i < nChildren; i++ )
  {
    var currentChild = children.item(i);
    
    if (currentChild.nodeType == Node.ELEMENT_NODE && 
        currentChild.tagName=="PARAM" &&
        currentChild.getAttribute("name") == "FlashVars")
    {
        var flashVars = currentChild.getAttribute("value");
        return (flashVars.indexOf("&streamName") != -1 &&
                flashVars.indexOf("&serverName") != -1 &&
                flashVars.indexOf("vitalstreamfvsslite") == -1);
    }
  }
  
  return false;
}


function initializeUI() 
{
  // Store references to form elements in global variables.
  //initialize the common controls
  initializeUICommon();
  //initialize the server URI
  VIDEO_SERVER_URI = dwscripts.findDOMObject("videoServerURI");  
  VIDEO_STREAM = dwscripts.findDOMObject("videoStream");  
  VIDEO_LIVE_FEED = new CheckBox("","videoLiveFeed");
  VIDEO_LIVE_FEED.initializeUI();
  VIDEO_BUFFER_TIME = dwscripts.findDOMObject("videoBufferTime");  

	//for mac-adjust the position of bottom layer
  if (dwscripts.IS_MAC && findObject("bottomLayer")) 
  {
    document.layers["bottomLayer"].left = 52;
  }
  
  if(dwscripts.IS_WIN)
  {
    VIDEO_SERVER_URI.setAttribute("style","width:202px;height:16px");
    VIDEO_STREAM.setAttribute("style","width:202px;height:16px");
    VIDEO_BUFFER_TIME.setAttribute("style","width:45px;height:16px");
  }
}


function inspectSelection()
{
  // Call initializeUI() here; it's how the global variables get
  // initialized. The onLoad event on the body tag is never triggered
  // in inspectors.
  initializeUI();

  //get the original code
  var dom = dw.getDocumentDOM();
  var theObj = dom.getSelectedNode();
  
  if (!dom || !theObj) 
    return;
    
  var objectCode = theObj.outerHTML;

  if (dwscripts.isXSLTDoc())
    objectCode = objectCode.replace(/\&amp;/g, "&");
  
  //setValues for common controls
  setValuesForCommonControls(objectCode);
  //set the server URI
  var serverName = getFLVAttrs(objectCode,"serverName");
  var appName = getFLVAttrs(objectCode,"appName");
  var serverURI = "rtmp://" + serverName + "/" + appName;
  VIDEO_SERVER_URI.value = serverURI;
  var streamName = getFLVAttrs(objectCode,"streamName");
  VIDEO_STREAM.value = streamName;
  var videoIsLive = getFLVAttrs(objectCode,"isLive");
  if (videoIsLive == "true")
  {
    //set the checked state
    VIDEO_LIVE_FEED.setCheckedState(true);
  }
  VIDEO_BUFFER_TIME.value = getFLVAttrs(objectCode,"bufferTime");
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//   update the attribute name
//
// ARGUMENTS:
//	 the name of the attribute which changed
//
// RETURNS:
//   void
//--------------------------------------------------------------------
function updateUI(attrName)
{
  if (attrName) 
  {
    switch (attrName)
    {
      //set the videoId
      case "videoID":
      {
        var videoPlayerID = VIDEO_PLAYER_ID.value;
        applyFlashAttr("id",videoPlayerID);
      }
      break;
      //set the videoWidth
      case "videoWidth":
      {
        //apply the videoWidth function
        applyVideoWidth(true);
      }
      break;      
      //set the videoHeight
      case "videoHeight":
      {
        //apply the videoHeight function
        applyVideoHeight(true);
      }
      break;      
      case "videoServerURI":
      {
        var sourceURL = VIDEO_SERVER_URI.value;
        if(/\s*rtmp:\/\/([^\/]+)\/([^\/]+\/[^\/]+)/i.test(sourceURL) && 
           !((sourceURL.indexOf("*") != -1) || (sourceURL.indexOf("?") != -1) || 
           (sourceURL.indexOf("<") != -1) || (sourceURL.indexOf(">") != -1) || 
           (sourceURL.indexOf("|") != -1) || (sourceURL.indexOf("\"") != -1)))
        {
          serverName=RegExp.$1;
          appName=RegExp.$2;      
        }
        else
        {
          alert(MSG_EnterValidServerURI);
          return;
        }

        //URL encode parameters
        serverName = escape(serverName);
        serverName = encodeURL(serverName);

        appName = escape(appName);
        appName = encodeURL(appName);

        //apply the server name and appName
        applyFLVServerAttr(serverName,appName);
      } 
      break;
      case "videoStream":
      {
        videoStreamName = trimString(VIDEO_STREAM.value);        
        if(/\.flv$/i.test(videoStreamName))
          videoStreamName = videoStreamName.replace(/\.flv$/i,"");
      
        if(!videoStreamName || (videoStreamName.indexOf("/") != -1)
          || (videoStreamName.indexOf(".") == 0) 
          || (videoStreamName.indexOf("*") != -1)
          || (videoStreamName.indexOf("?") != -1)
          || (videoStreamName.indexOf(":") != -1)
          || (videoStreamName.indexOf("\"") != -1)
          || (videoStreamName.indexOf("\\") != -1)
          || (videoStreamName.indexOf("<") != -1)
          || (videoStreamName.indexOf(">") != -1)
          || (videoStreamName.indexOf("|") != -1)
          || (videoStreamName.indexOf(" ") != -1))
        {
          alert(MSG_EnterStreamName);
          return;
        }  
        
        videoStreamName = escape(videoStreamName);
        videoStreamName = encodeURL(videoStreamName);
		detectCodecIDForStreaming();		
      }
      break;
      case "videoSkinName":
      {
        //apply the video skin name
        var videoSkinName = VIDEO_SKIN_NAMES.getValue();
        //copy the skin
        copyVideoControl(videoSkinName);
		applySkinName(videoSkinName);
      }
      break;
      case "videoAutoPlay":
      {
        var videoAutoPlay = VIDEO_AUTO_PLAY.getCheckedState() ? "true" : "false";
        applyFLVAttr("autoPlay",videoAutoPlay);
      }
      break;
      case "videoAutoRewind":
      {
        var videoAutoRewind = VIDEO_AUTO_REWIND.getCheckedState() ? "true" : "false";
        applyFLVAttr("autoRewind",videoAutoRewind);
      }
      break;
      case "videoLiveFeed":
      {
        if(!isValidSkin('isLive'))
          return;

        //else apply the value
        var videoLiveFeed = VIDEO_LIVE_FEED.getCheckedState() ? "true" : "false";
        applyFLVAttr("isLive",videoLiveFeed);
      }
      break;
      case "videoBufferTime":
      {
        var videoBufferTime = VIDEO_BUFFER_TIME.value;
        
        if(!videoBufferTime || isNaN(videoBufferTime))
        {
          alert(MSG_EnterNumericValue);
          return;
        }
        else if(videoBufferTime < 0 || videoBufferTime.indexOf(".") != -1)
        {
          alert(MSG_EnterValidBufferTime);
          return;
        }
        applyFLVAttr("bufferTime",videoBufferTime);
      }
      break;
    }    
  }
}


//-------------------------------------------------------------------
// FUNCTION:
//   isValidSkin
//
// DESCRIPTION:
//   returns true when valid skin for live streaming is selected.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   return - true when valid skin for live streaming is selected
//
//--------------------------------------------------------------------

function isValidSkin(attr)
{  
  if (attr == 'isLive')
  {
    if(VIDEO_LIVE_FEED.getCheckedState())
    {
      if(VIDEO_SKIN_NAMES.getValue().indexOf("Halo") == -1)
      {
        alert(MSG_SelectHaloSkinForVCS);
        return false;
      }
    }
  }
  return true;
}


//--------------------------------------------------------------------
// FUNCTION:
//   uploadMedia
//
// DESCRIPTION:
//   uploadMedia on the server
//
// ARGUMENTS:
//	 uploadMedia files (e.g moviename, skinName)
//
// RETURNS:
//   void
//--------------------------------------------------------------------
function uploadMedia()
{
  //get the videoStreamName
  var videoStreamName = trimString(VIDEO_STREAM.value);        
  if(/\.flv$/i.test(videoStreamName) == false)
	{
    videoStreamName += ".flv";
	}
	//get the skin name
	var videoSkinName = VIDEO_SKIN_NAMES.getValue();
	//upload the media on the server
	uploadFLVMedia(videoStreamName,videoSkinName,true);
}


//-------------------------------------------------------------------
// FUNCTION:
//   requiredFiles
//
// DESCRIPTION:
//   Shows an alert box listing files to be uploaded.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing.
//
//--------------------------------------------------------------------
function requiredFiles()
{   
	var reqMsg = MSG_CopyStreamingFiles + "\n\n" + MSG_CopyStreamingFiles1;
	reqMsg+= VIDEO_SKIN_NAMES.getValue();
	reqMsg+= MSG_CopyStreamingFiles2;
	var videoStreamName = trimString(VIDEO_STREAM.value);        
	if ((videoStreamName != null) && (videoStreamName.length > 0))
	{
		//for streaming , if live feed is not checked , append the .flv name		
		if (VIDEO_LIVE_FEED.getCheckedState() == false)
		{
			if(/\.flv$/i.test(videoStreamName) == false)
			{
				videoStreamName += ".flv";
			}	
			reqMsg += "\n";
			reqMsg += " ";		 
			reqMsg+=videoStreamName;
		}
	}
	alert(reqMsg);
}

//--------------------------------------------------------------------
// FUNCTION:
//   detectSizeForStreaming()
//
// DESCRIPTION:
//   detect the size for .flv (rtmp) and initialize the width and height
//
//
// ARGUMENTS:
//   the url (rtmp)
//
// RETURNS:
//   nothing.
//             
//--------------------------------------------------------------------
function detectSizeForStreaming()
{
	//start the player if not already started
	startUpPlayer();

	var sourceURL = VIDEO_SERVER_URI.value;      
	if(/\s*rtmp:\/\/([^\/]+)\/([^\/]+\/[^\/]+)/i.test(sourceURL) && !((sourceURL.indexOf("*") != -1) || (sourceURL.indexOf("?") != -1) || (sourceURL.indexOf("<") != -1) || (sourceURL.indexOf(">") != -1) || (sourceURL.indexOf("|") != -1) || (sourceURL.indexOf("\"") != -1)))
	{
		serverName=RegExp.$1;
		appName=RegExp.$2;      
	}
	else
	{
		alert(MSG_EnterValidServerURI);
		VIDEO_SERVER_URI.textControl.focus();
		return;
	}
	var streamName = trimString(VIDEO_STREAM.value);  

	//form the video URL from sourceURL + "/" + streamName
	if (sourceURL.length > 0)
	{
			//if the last character is not a slash then append 
			//a slash to it
		 if (sourceURL[sourceURL.length - 1] != '/')
		 {
				sourceURL += "/";
		 }
	}

	//append the .flv if missing
	if (VIDEO_LIVE_FEED.getCheckedState() == false)
	{
		if(/\.flv$/i.test(streamName) == false)
		{
			streamName += ".flv";
		}	
	}

	//form the video URL from sourceURL + streamName
	var videoURL = sourceURL + streamName;
	if((videoURL != null) && (videoURL.length > 0))
	{
		//load the video URL to get the auto detect the video dimension
		loadVideo(videoURL);
		//start the detect poll
		//we need the below flag to track when the auto detect from
		//swfloader extension is completed.
		//we loop 30 times x 500ms (1/2 second)15 seconds
		MM._LOOPCOUNTER = 0;
		MM.setBusyCursor();

		VIDEO_SIZE_BTN.setAttribute("disabled","true");
		VIDEO_TOTAL.innerHTML = MSG_Detecting;

		//first call back
		var funCallBack = "isDetectSizeDone()";
		setTimeout(funCallBack,500);
	}
}

//--------------------------------------------------------------------
// FUNCTION:
//   detectCodecIDForStreaming()
//
// DESCRIPTION:
//   detect the size for .flv (rtmp) and initialize the width and height
//
//
// ARGUMENTS:
//   the url (rtmp)
//
// RETURNS:
//   nothing.
//             
//--------------------------------------------------------------------
function detectCodecIDForStreaming()
{
	var dom = dw.getDocumentDOM();
	videoObj = dom.getSelectedNode();
	
	//start the player if not already started
	startUpPlayer();

	var sourceURL = VIDEO_SERVER_URI.value;      
	if(/\s*rtmp:\/\/([^\/]+)\/([^\/]+\/[^\/]+)/i.test(sourceURL) && !((sourceURL.indexOf("*") != -1) || (sourceURL.indexOf("?") != -1) || (sourceURL.indexOf("<") != -1) || (sourceURL.indexOf(">") != -1) || (sourceURL.indexOf("|") != -1) || (sourceURL.indexOf("\"") != -1)))
	{
		serverName=RegExp.$1;
		appName=RegExp.$2;      
	}
	else
	{
		alert(MSG_EnterValidServerURI);
		VIDEO_SERVER_URI.textControl.focus();
		return;
	}
	var streamName = trimString(VIDEO_STREAM.value);  

	//form the video URL from sourceURL + "/" + streamName
	if (sourceURL.length > 0)
	{
			//if the last character is not a slash then append 
			//a slash to it
		 if (sourceURL[sourceURL.length - 1] != '/')
		 {
				sourceURL += "/";
		 }
	}

	//append the .flv if missing
	if (VIDEO_LIVE_FEED.getCheckedState() == false)
	{
		if(/\.flv$/i.test(streamName) == false)
		{
			streamName += ".flv";
		}	
	}

	//form the video URL from sourceURL + streamName
	var videoURL = sourceURL + streamName;
	if((videoURL != null) && (videoURL.length > 0))
	{
		//load the video URL to get the auto detect the video dimension
		loadVideo(videoURL);
		//start the detect poll
		//we need the below flag to track when the auto detect from
		//swfloader extension is completed.
		//we loop 30 times x 500ms (1/2 second)15 seconds
		MM._LOOPCOUNTER = 0;
		VIDEO_SIZE_BTN.setAttribute("disabled","true");

		//first call back
		var funCallBack = "isDetectCodecIDDone()";
		setTimeout(funCallBack,500);
	}
}
