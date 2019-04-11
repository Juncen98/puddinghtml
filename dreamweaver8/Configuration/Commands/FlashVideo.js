// Copyright 2005 Macromedia, Inc. All rights reserved.

var HELP_DOC = MM.HELP_objFlashVideo;
var COMMAND_FILE = dw.getConfigurationPath() + '/Commands/FlashVideo.htm';

//js objects for Progressive Download Video Controls
var PROG_TF_URL = new URLTextField("", "theprogDownloadVideo.url");
var PROG_LIST_SKIN_NAMES = new ListControl("theprogDownloadVideo.skinName");
var PROG_TF_WIDTH = dwscripts.findDOMObject("theprogDownloadVideo.width");
var PROG_TF_HEIGHT = dwscripts.findDOMObject("theprogDownloadVideo.height");
var PROG_CB_AUTO_PLAY = new CheckBox("","theprogDownloadVideo.autoPlay");
var PROG_CB_AUTO_REWIND = new CheckBox("","theprogDownloadVideo.autoRewind");
var PROG_CB_CONSTRAIN = new CheckBox("","theprogDownloadVideo.constrain");
var PROG_VIDEO_TOTAL = dwscripts.findDOMObject("theprogDownloadVideo.videoTotalDim");
var PROG_BTN_VIDEO_SIZE = dwscripts.findDOMObject("theprogDownloadVideo.videoDetectSize");
var PROG_CB_ADD_DET = new CheckBox("","theprogDownloadVideo.addDetection");
var PROG_TEXT_DET_MSG = dwscripts.findDOMObject("theprogDownloadVideo.detectionMsg");

//js objects for Streaming Video Controls
var STREAM_TF_SERVER_URI = new URLTextField("", "thestreamingVideo.serverURI");
var STREAM_TF_STREAM_NAME = dwscripts.findDOMObject("thestreamingVideo.streamName");
var STREAM_LIST_SKIN_NAMES = new ListControl("thestreamingVideo.skinName");
var STREAM_TF_WIDTH = dwscripts.findDOMObject("thestreamingVideo.width");
var STREAM_TF_HEIGHT = dwscripts.findDOMObject("thestreamingVideo.height");
var STREAM_TF_BUFFER_TIME = dwscripts.findDOMObject("thestreamingVideo.tf_bufferTime");
var STREAM_CB_IS_LIVE = new CheckBox("","thestreamingVideo.isLive");
var STREAM_CB_AUTO_PLAY = new CheckBox("","thestreamingVideo.autoPlay");
var STREAM_CB_AUTO_REWIND = new CheckBox("","thestreamingVideo.autoRewind");
var STREAM_CB_CONSTRAIN = new CheckBox("","thestreamingVideo.constrain");
var STREAM_VIDEO_TOTAL = dwscripts.findDOMObject("thestreamingVideo.videoTotalDim");
var STREAM_BTN_VIDEO_SIZE = dwscripts.findDOMObject("thestreamingVideo.videoDetectSize");
var STREAM_CB_ADD_DET = new CheckBox("","thestreamingVideo.addDetection");
var STREAM_TEXT_DET_MSG = dwscripts.findDOMObject("thestreamingVideo.detectionMsg");

//jsObject for Flash Video Streaming Service Lite
var FVSS_TA_CODE =  dwscripts.findDOMObject("theflaVideoStreamServiceLite.code");

var INFO_ICON = dwscripts.findDOMObject("infoIcon");
var REQUIRED_FILES = dwscripts.findDOMObject("requiredFiles");

var SELECTORLIST = new ListControl("theselector");
var videoTypeValues = new Array("progDownloadVideo", "streamingVideo");

var videoControlSourceFolder = dwscripts.filePathToLocalURL(dw.getConfigurationPath()
                    + dwscripts.FILE_SEP + "Templates" + dwscripts.FILE_SEP + "Video_Controls");

var _HALO_SKIN_HEIGHT = 51;//pixel
var _HALO_SKIN_WIDTH = 22;//pixel

var _DETECT_SIZE_LOOP = 30; //times
var codecID = -1;
var droppedFileURL = "";
var videoDim = null;
var lastVideoLoaded = "";

//-------------------------------------------------------------------
// FUNCTION:
//   canAcceptCommand()
//
// DESCRIPTION:
//   Determines whether the menu item should be active or dimmed.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   Boolean value that indicates whether the item should be enabled.
//--------------------------------------------------------------------

function canAcceptCommand()
{
    return true;
}

//--------------------------------------------------------------------
// FUNCTION:
//   commandButtons
//
// DESCRIPTION:
//   API function for commands. Controls dialog buttons.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   an array of button names and function calls
//--------------------------------------------------------------------

function commandButtons()
{
  return new Array(MM.BTN_OK,      "clickedOK()",
                   MM.BTN_Cancel,  "unloadPlayer(true);",
                   MM.BTN_Help,    "displayHelp()");
}

//-------------------------------------------------------------------
// FUNCTION:
//   receiveArguments()
//
// DESCRIPTION:
//   open the Flash Video command dialog with the passed in flv file as selected
//
// ARGUMENTS:
//   the flv file path
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function receiveArguments()
{
	droppedFileURL = arguments[0];
}

//-------------------------------------------------------------------
// FUNCTION:
//   displayHelp
//
// DESCRIPTION:
//   displays appropriate help file
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function displayHelp()
{
  dwscripts.displayDWHelp(HELP_DOC); 
}

//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//   initializes the UI
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function initializeUI()
{
  // If we are called from Flash Video Streaming service lite
  // update... case we need to replace the code instead of inserting new code
  if (MM.CalledFromFVSSLPI)
  {
    SELECTORLIST.setAll(LABEL_VIDEO_TYPE_SSL, new Array("flaVideoStreamServiceLite"));
    SELECTORLIST.setIndex(0);
    updateUI('videoType');
    if (dwscripts.IS_MAC)
      INFO_ICON.innerHTML = '<img src="../Shared/MM/Images/P_InfoMac_Lg_N.png">';
    document.layers["information"].top = "345";
    window.resizeToContents();
    startUpPlayer();
    return;
  }  

  var fileMask = "*.swf";
  var skinValues = DWfile.listFolder(videoControlSourceFolder + "/" + fileMask,"files");
  var skinNames = new Array();
  var minWidths = new Array("Clear Skin 1",140,"Clear Skin 2",160,"Clear Skin 3",260,"Halo Skin 1",180,"Halo Skin 2",180,"Halo Skin 3",280,"Corona Skin 1",130,"Corona Skin 2",141,"Corona Skin 3",258);

  for (var i=0; i < skinValues.length; i++)
  {
    var skinName = skinValues[i];
    skinName = skinName.replace(/_/g, " ");
    skinName = skinName.replace(/\.swf/, "");
    for (var w=0; w < minWidths.length; w=w+2){
      if (minWidths[w] == skinName){
        var minWidth = MIN_WIDTH.replace(/%d/,minWidths[w+1]);
        skinName += "   (" + minWidth + ")";
        break;
       }
    }
    skinNames.push(skinName);
  }
  
  //initialize Progressive download UI controls.
  
  SELECTORLIST.setAll(LABEL_VIDEO_TYPE,videoTypeValues);
  PROG_TF_URL.initializeUI();  
  PROG_LIST_SKIN_NAMES.setAll(skinNames,skinValues); 
  PROG_CB_AUTO_PLAY.initializeUI();
  PROG_CB_AUTO_REWIND.initializeUI();
  PROG_CB_CONSTRAIN.initializeUI();
  PROG_CB_ADD_DET.initializeUI();
  
  // If the detection script already exists in the document,
  // disable the Prompt user checkbox (but leave it checked).
  // Also, extract the existing message so we can repopulate
  // the message box with it.
  var dom = dw.getDocumentDOM();
  var existingMsg = "";
  var theHead = dom.getElementsByTagName('head')[0];
  if (theHead.innerHTML.indexOf('MM_CheckFlashVersion') != -1){
    PROG_CB_ADD_DET.enable(false);
    STREAM_CB_ADD_DET.enable(false);
    var handler = dom.body.getAttribute("onload");
    var fnPatt = /MM_CheckFlashVersion\('\d+,\d+,\d+,\d+','(.+)'\)/;
    if (handler && handler.search(fnPatt) != -1){
      var res = handler.match(fnPatt);
      if (res.length > 1)
        existingMsg = res[1];
    }
  }
  
  // If there's an existing message in the document, use that
  // to populate the message box
  if (existingMsg)
    PROG_TEXT_DET_MSG.value = existingMsg;

  // Otherwise, if the user entered a detection message previously, 
  // recall it
  else{
    var notesFile = MMNotes.open(COMMAND_FILE, true);
    if (notesFile){
      if (MMNotes.get(notesFile,"detectionMsg"))
        PROG_TEXT_DET_MSG.value = MMNotes.get(notesFile,"detectionMsg");
      MMNotes.close(notesFile);
    }
  }

  //initialize Streaming Video UI controls.
  STREAM_TF_SERVER_URI.initializeUI();
  STREAM_LIST_SKIN_NAMES.setAll(skinNames,skinValues); 
  STREAM_CB_IS_LIVE.initializeUI();
  STREAM_CB_AUTO_PLAY.initializeUI();
  STREAM_CB_AUTO_REWIND.initializeUI();
  STREAM_CB_CONSTRAIN.initializeUI();
  STREAM_CB_ADD_DET.initializeUI();

  // XSLT-fragment document does not have body tag and we should prevent users from
  // adding Flash Player version detection code.
  if (dom.documentType == "XSLT-fragment"){
    PROG_CB_ADD_DET.setCheckedState(false);
    STREAM_CB_ADD_DET.setCheckedState(false);
    PROG_CB_ADD_DET.enable(false);
    STREAM_CB_ADD_DET.enable(false);
    setFieldState(PROG_CB_ADD_DET,PROG_TEXT_DET_MSG);
    setFieldState(STREAM_CB_ADD_DET,STREAM_TEXT_DET_MSG);
  }

  // If there's an existing message in the document, use that
  // to populate the message box
  if (existingMsg)
    STREAM_TEXT_DET_MSG.value = existingMsg;

  // Otherwise, if the user entered a detection message previously, 
  // recall it
  else{
    // If the user entered a detection message previously, recall it
    var notesFile = MMNotes.open(COMMAND_FILE, true);
    if (notesFile){
      if (MMNotes.get(notesFile,"detectionMsg"))
        STREAM_TEXT_DET_MSG.value = MMNotes.get(notesFile,"detectionMsg");
      MMNotes.close(notesFile);
    }
  }

	//default to -1 since we remove the default width and height
  MM.PROG_VIDEO_AR = -1;
  MM.STREAM_VIDEO_AR = -1;

  if (dwscripts.IS_MAC) // use a different info icon on Mac
  {
    INFO_ICON.innerHTML = '<img src="../Shared/MM/Images/P_InfoMac_Lg_N.png">';
  }
  
  startUpPlayer();
  
  if (droppedFileURL && droppedFileURL != "")
  {
	PROG_TF_URL.setValue(droppedFileURL);
	droppedFileURL = "";
	detectVideoInfoForProgressive();
  }
}
//-------------------------------------------------------------------
// FUNCTION:
//   clickedOK
//
// DESCRIPTION:
//   copies relevent files and inserts HTML code for selected flash player type in the current page.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//
//--------------------------------------------------------------------

function clickedOK()
{
  var str = getHTMLCode();
  var dom = dw.getDocumentDOM();
  saveBodyRelativeSelection();
 
  if (!MM.CalledFromFVSSLPI && (SELECTORLIST.getIndex() == 0 || SELECTORLIST.getIndex() == 1))
  {
    //Folder path of source files
    var videoPlayerFileSourceFolder = dwscripts.filePathToLocalURL(dw.getConfigurationPath()
                    + dwscripts.FILE_SEP + "Templates" + dwscripts.FILE_SEP + "Video_Player");
    var videoControlsFileSourceFolder = dwscripts.filePathToLocalURL(dw.getConfigurationPath()
                    + dwscripts.FILE_SEP + "Templates" + dwscripts.FILE_SEP + "Video_Controls");

    var videoPlayerFileDestFolder;
    var videoControlsFileDestFolder;
    
    var url;
    var curSite;
    var fileListArr;
    var swfPath;
    var sourceURL;
    var serverName;
    var appName;
    var streamName;
    var skinName;
    var bufferTime;
    var isLive;
    var isAutoPlay;
    var isAutoRewind;
    var width;
    var height;
    var skinText;
    var insertDetection = true;
    var detectionMsg = "";

    if(SELECTORLIST.getIndex() == 0)
    {
      //extract the parameter values for Progressive download video from the UI.
      swfPath = "FLVPlayer_Progressive.swf";
      sourceURL = PROG_TF_URL.getValue();
      if(!sourceURL || !trimString(sourceURL))
      {        
        PROG_TF_URL.setValue("");
        alert(MSG_EnterValidURL);
        PROG_TF_URL.textControl.focus();
        return;
      }
      sourceURL = trimString(sourceURL);
      var index = -1;  
      if(/^(\.flv)/i.test(sourceURL) || !(/(\.flv)$/i.test(sourceURL)) || 
        (sourceURL.indexOf("*") != -1) || (sourceURL.indexOf("?") != -1) || 
        (sourceURL.indexOf("<") != -1) || (sourceURL.indexOf(">") != -1) || 
        ((index = sourceURL.lastIndexOf("|")) != -1 && sourceURL.indexOf("file:///") == -1 && index > 9) || 
        (sourceURL.indexOf("\"") != -1) || (sourceURL.indexOf(" ") != -1))
      {
        alert(MSG_SelectValidFile);        
        return;
      }      
      if(/\\/g.test(sourceURL))
        sourceURL = sourceURL.replace(/\\/g,"/");
        
      if(/\.flv$/i.test(sourceURL))
        streamName = trimString(sourceURL.replace(/\.flv$/i,""));
      else
        streamName = trimString(sourceURL);
      
      //URL encode parameters
      streamName = escape(streamName);
      streamName = encodeURL(streamName);

        
      skinName = PROG_LIST_SKIN_NAMES.getValue();
      skinText = PROG_LIST_SKIN_NAMES.get();
      width = PROG_TF_WIDTH.value;
      height = PROG_TF_HEIGHT.value;
      isAutoPlay = PROG_CB_AUTO_PLAY.getCheckedState() ? "true" : "false";
      isAutoRewind = PROG_CB_AUTO_REWIND.getCheckedState() ? "true" : "false";
      insertDetection = PROG_CB_ADD_DET.getCheckedState();
      detectionMsg = PROG_TEXT_DET_MSG.value;
            
    }
    else
    {
      //extract the parameter values for Streaming video from the UI.
      swfPath = "FLVPlayer_Streaming.swf";
      sourceURL = STREAM_TF_SERVER_URI.getValue();      

      if(/\s*rtmp:\/\/([^\/]+)\/([^\/]+\/[^\/]+)/i.test(sourceURL) && 
         !((sourceURL.indexOf("*") != -1) || (sourceURL.indexOf("?") != -1) || 
         (sourceURL.indexOf("<") != -1) || (sourceURL.indexOf(">") != -1) || 
         (sourceURL.indexOf("|") != -1) || (sourceURL.indexOf("\"") != -1) || 
         (sourceURL.indexOf("*") != -1)))
      {
        serverName=RegExp.$1;
        appName=RegExp.$2;      
      }
      else
      {
        alert(MSG_EnterValidServerURI);
        STREAM_TF_SERVER_URI.textControl.focus();
        return;
      }
      
      streamName = trimString(STREAM_TF_STREAM_NAME.value);  
      
      if(/\.flv$/i.test(streamName))
        streamName = streamName.replace(/\.flv$/i,"");
        
      
      //URL encode parameters
      serverName = escape(serverName);
      serverName = encodeURL(serverName);
      
      appName = escape(appName);
      appName = encodeURL(appName);
      
      if(!streamName || (streamName.indexOf("/") != -1)
        || (streamName.indexOf(".") == 0) 
        || (streamName.indexOf("*") != -1)
        || (streamName.indexOf("?") != -1)
        || (streamName.indexOf(":") != -1)
        || (streamName.indexOf("\"") != -1)
        || (streamName.indexOf("\\") != -1)
        || (streamName.indexOf("<") != -1)
        || (streamName.indexOf(">") != -1)
        || (streamName.indexOf("|") != -1)
        || (streamName.indexOf(" ") != -1))
      {
        alert(MSG_EnterStreamName);
        STREAM_TF_STREAM_NAME.focus();
        return;
      }  

      streamName = escape(streamName);
      streamName = encodeURL(streamName);
        
      bufferTime = trimString(STREAM_TF_BUFFER_TIME.value);
      skinName = STREAM_LIST_SKIN_NAMES.getValue();
      skinText = STREAM_LIST_SKIN_NAMES.get();

      width = STREAM_TF_WIDTH.value;
      height = STREAM_TF_HEIGHT.value;
      
      isLive = STREAM_CB_IS_LIVE.getCheckedState() ? "true" : "false";
      isAutoPlay = STREAM_CB_AUTO_PLAY.getCheckedState() ? "true" : "false";
      isAutoRewind = STREAM_CB_AUTO_REWIND.getCheckedState() ? "true" : "false";
      insertDetection = STREAM_CB_ADD_DET.getCheckedState();
      detectionMsg = STREAM_TEXT_DET_MSG.value;
          
      if(!bufferTime || isNaN(bufferTime))
      {
        alert(MSG_EnterNumericValue);
        STREAM_TF_BUFFER_TIME.focus();
        return;
      }else if(bufferTime < 0 || bufferTime.indexOf(".") != -1)
      {
        alert(MSG_EnterValidBufferTime);
        STREAM_TF_BUFFER_TIME.focus();
        return;
      }
      
      if(!isValidSkin('isLive'))
        return;
    }
    
    if(!width || !trimString(width))
    {
      alert(MSG_EnterNumericWidth);
      return;
    }
     
    width =  trimString(width);
    
    if(isNaN(width))
    {
      alert(MSG_EnterNumericWidth); 
      return;
    }
    else if(width < 0 || width.indexOf(".") != -1)
    {
      alert(MSG_EnterValidWidth);
      return;
    }

    if(!height || !trimString(height))
    {
      alert(MSG_EnterNumericHeight);
      return;
    }
      
    height =  trimString(height);
    
    if(isNaN(height))
    {
      alert(MSG_EnterNumericHeight);
      return;
    }
    else if(height < 0 || height.indexOf(".") != -1)
    {
      alert(MSG_EnterValidHeight);
      return;
    }
    
    if(width > 8192)
    {
      alert(MSG_MaxWidth);
      return;      
    }    
    else if(height > 8192)
    {
      alert(MSG_MaxHeight);
      return;      
    }

    skinName = skinName.replace(/\.swf/, "");
	
    if(skinName.indexOf("Halo") == 0)
    {
      width = parseInt(width) + _HALO_SKIN_WIDTH;
      height = parseInt(height) + _HALO_SKIN_HEIGHT;
    }   

    //copy the Flash Player and skin at the same level as that of HTML 
    videoPlayerFileDestFolder = dwscripts.getParentURL(dw.getDocumentPath("document")) + dwscripts.FILE_SEP;
    videoControlsFileDestFolder = dwscripts.getParentURL(dw.getDocumentPath("document")) + dwscripts.FILE_SEP;
    
    fileListArr = DWfile.listFolder(videoPlayerFileSourceFolder,"files");
    for(var i=0; i < fileListArr.length; i++)
    {
      if((SELECTORLIST.getIndex() == 0 && 
         (fileListArr[i] == "FLVPlayer_Streaming.swf" || fileListArr[i] == "main.asc")) || 
         (SELECTORLIST.getIndex() == 1 && fileListArr[i] == "FLVPlayer_Progressive.swf"))
        continue;
      dwscripts.copyFileTo(videoPlayerFileSourceFolder + dwscripts.FILE_SEP + fileListArr[i], videoPlayerFileDestFolder + fileListArr[i], true);
    }
  
    if(SELECTORLIST.getIndex() == 0)
      dwscripts.copyFileTo(videoControlsFileSourceFolder + dwscripts.FILE_SEP + PROG_LIST_SKIN_NAMES.getValue(), videoControlsFileDestFolder + PROG_LIST_SKIN_NAMES.getValue(), true);
    else
      dwscripts.copyFileTo(videoControlsFileSourceFolder + dwscripts.FILE_SEP + STREAM_LIST_SKIN_NAMES.getValue(), videoControlsFileDestFolder + STREAM_LIST_SKIN_NAMES.getValue(), true);


    // replace tokens with their values (and set reqVerStr for 
    // Flash detection at the same time)
    var reqVerStr = "";
    if (codecID == 4 || codecID == 5)
      reqVerStr = "8,0,0,0";
	  else if (SELECTORLIST.getIndex() == 1)
		  reqVerStr = "6,0,79,0";
    else
		  reqVerStr = "7,0,0,0";
		  
    str = str.replace(/\$PLAYERVERSION\$/, reqVerStr);
    str = str.replace(/\$SWFPATH\$/g,swfPath);    
    str = str.replace(/\$SKIN_NAME\$/g,skinName);
    str = str.replace(/\$AUTO_PLAY\$/g,isAutoPlay);
    str = str.replace(/\$AUTO_REWIND\$/g,isAutoRewind);
    str = str.replace(/\$STREAM_NAME\$/g,streamName);
    str = str.replace(/\$WIDTH\$/g,width);
    str = str.replace(/\$HEIGHT\$/g,height);
    if(SELECTORLIST.getIndex() == 1)    
    {
      str = str.replace(/\$SERVER_NAME\$/g,serverName);
      str = str.replace(/\$APP_NAME\$/g,appName);
      str = str.replace(/\$IS_LIVE\$/g,isLive);
      str = str.replace(/\$BUFFER_TIME\$/g,bufferTime);            
    }
  }
  
	//unload player and close window
  unloadPlayer(true);
    
  restoreBodyRelativeSelection();

  //in case we are called from Flash Video Streaming service lite
  //update case we need to replace the code instead of inserting new code
  if (MM.CalledFromFVSSLPI)
  {
    //replace the selection with new FVSSL lite code
    replaceSel(str);
  }
  else
  {
    dom.insertHTML(str,false);  
  }
  
  // Remember what was selected (i.e., the FV object we just inserted)
  // before making a bunch of edits to the head and body
  var selNode = dom.getSelectedNode();
  
  // Save detection message for next time
  var notesFile = MMNotes.open(COMMAND_FILE, true);
  if (notesFile){
    MMNotes.set(notesFile,"detectionMsg",detectionMsg);
    MMNotes.close(notesFile);
  }

  // Now add the detection, if necessary
  if (insertDetection)
    addDetectionScript(reqVerStr, detectionMsg);
    
  // Re-select the FV object
  dom.setSelectedNode(selNode, false, true);
}

//-------------------------------------------------------------------
// FUNCTION:
//   trimString
//
// DESCRIPTION:
//   trims the string.
//
// ARGUMENTS:
//   str - the string
//
// RETURNS:
//   return - trimmed string.
//
//--------------------------------------------------------------------

function trimString(str)
{
  var regExpBeginSpaces = /^\s*/
  var regExpEndSpaces = /\s*$/;
  str = str.replace(regExpBeginSpaces,"");
  str = str.replace(regExpEndSpaces,"");
  return str;
}

//-------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//   updates lower half of the dialog based on selected player type.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing.
//
//--------------------------------------------------------------------

function updateUI(element)
{
  switch(element)
  {
    case 'videoType':
      var curDiv = SELECTORLIST.getValue();
      if(SELECTORLIST.getIndex() == 1)
        REQUIRED_FILES.innerHTML = MSG_RequiredFiles;
      else
        REQUIRED_FILES.innerHTML = '&nbsp;';
      showOnlyThisLayer(curDiv);
    break;
    case 'theprogDownloadVideo.previewSkin':
      var previewImgSrc = "../Templates/images/" + PROG_LIST_SKIN_NAMES.getValue();
      previewImgSrc = previewImgSrc.replace(/\.swf/, ".png");
      var previewImgObj = dwscripts.findDOMObject("theprogDownloadVideo.skinPreview");      
      previewImgObj.src = previewImgSrc;
      PROG_VIDEO_TOTAL.innerHTML = computeVideoTotal(PROG_TF_WIDTH.value,PROG_TF_HEIGHT.value,PROG_LIST_SKIN_NAMES.getValue());
    break;
    case 'thestreamingVideo.previewSkin':
      var previewImgSrc = "../Templates/images/" + STREAM_LIST_SKIN_NAMES.getValue();
      previewImgSrc = previewImgSrc.replace(/\.swf/, ".png");
      var previewImgObj = dwscripts.findDOMObject("thestreamingVideo.skinPreview");      
      previewImgObj.src = previewImgSrc;
      STREAM_VIDEO_TOTAL.innerHTML = computeVideoTotal(STREAM_TF_WIDTH.value,STREAM_TF_HEIGHT.value,STREAM_LIST_SKIN_NAMES.getValue());
    break;
    //set the videoWidth
    case "theprogDownloadVideo.videoWidth":
      //apply the videoWidth function
      applyVideoWidth(PROG_CB_CONSTRAIN,PROG_TF_WIDTH,PROG_TF_HEIGHT,PROG_LIST_SKIN_NAMES,MM.PROG_VIDEO_AR,PROG_VIDEO_TOTAL);
    break;			
      //set the videoHeight
    case "theprogDownloadVideo.videoHeight":    
      //apply the videoHeight function
      applyVideoHeight(PROG_CB_CONSTRAIN,PROG_TF_HEIGHT,PROG_TF_WIDTH,PROG_LIST_SKIN_NAMES,MM.PROG_VIDEO_AR,PROG_VIDEO_TOTAL);
    break;			    
    //set the videoWidth
    case "thestreamingVideo.videoWidth":
      //apply the videoWidth function
      applyVideoWidth(STREAM_CB_CONSTRAIN,STREAM_TF_WIDTH,STREAM_TF_HEIGHT,STREAM_LIST_SKIN_NAMES,MM.STREAM_VIDEO_AR,STREAM_VIDEO_TOTAL);
    break;			
      //set the videoHeight
    case "thestreamingVideo.videoHeight":    
      //apply the videoHeight function
      applyVideoHeight(STREAM_CB_CONSTRAIN,STREAM_TF_HEIGHT,STREAM_TF_WIDTH,STREAM_LIST_SKIN_NAMES,MM.STREAM_VIDEO_AR,STREAM_VIDEO_TOTAL);    
    break;
    case "theprogDownloadVideo.videoMaintainAR":
      if(PROG_CB_CONSTRAIN.getCheckedState())
        MM.PROG_VIDEO_AR = PROG_TF_WIDTH.value/PROG_TF_HEIGHT.value;
    break;
    case "thestreamingVideo.videoMaintainAR":
      if(STREAM_CB_CONSTRAIN.getCheckedState())
        MM.STREAM_VIDEO_AR = STREAM_TF_WIDTH.value/STREAM_TF_HEIGHT.value;        
    break;
  }
}

//-------------------------------------------------------------------
// FUNCTION:
//   showOnlyThisLayer
//
// DESCRIPTION:
//   displays the layer corresponding to the selected player type.
//
// ARGUMENTS:
//   showThisLayerName - layer to be displayed.
//
// RETURNS:
//   nothing.
//
//--------------------------------------------------------------------

function showOnlyThisLayer(showThisLayerName)
{
  var parent = document;

  var allDivTags = parent.getElementsByTagName("div"); 
  showThisLayerName = "the" + showThisLayerName; 

  // for every div tag found
  for (var i=0;i<allDivTags.length;++i)
  {
    // if the id doesn't match the layer name to show and the name attribute is not defined
    if (allDivTags[i].id != showThisLayerName && !allDivTags[i].name)
    {
      // hide this layer
      allDivTags[i].visibility = "hidden"; 
    }
    // otherwise, show it
    else
    {
	  allDivTags[i].visibility = "inherit"; 
	  if (allDivTags[i].id == "theprogDownloadVideo")
	  {
	    allDivTags[i].height = POS_progDownloadVideo_Layer_Height;
	    document.layers["information"].top = POS_information_Layer_Top1;
	    window.resizeToContents();
	  }
	  else if (allDivTags[i].id == "thestreamingVideo")
	  {
	    allDivTags[i].height = POS_streamingVideo_Layer_Height;
	    document.layers["information"].top = POS_information_Layer_Top2;
	    window.resizeToContents();
	  }
    }     
    // refresh the current div tag so that the UI is updated (hack) 
    allDivTags[i].innerHTML = allDivTags[i].innerHTML; 
  }

  //turn on information icon
  document.layers["information"].visibility = "inherit";
}

//-------------------------------------------------------------------
// FUNCTION:
//   getHTMLCode
//
// DESCRIPTION:
//   returns HTML code correponding to the video type selected.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   return - HTML code correponding to the video type selected.
//
//--------------------------------------------------------------------

function getHTMLCode()
{
  if (MM.CalledFromFVSSLPI)
    return FVSS_TA_CODE.value;

  var str;
  var uniqueIndex;
  var uniqueFlashPlayerID;
    
  uniqueIndex = generateUniqueIndex();
  if(uniqueIndex == 0)
    uniqueFlashPlayerID = "FLVPlayer";
  else
    uniqueFlashPlayerID = "FLVPlayer" + uniqueIndex;
      
  switch(SELECTORLIST.getIndex())
  {
    case 0:
	  //add the video comment and mark of the web comment
			        
      str = "<object classid=\"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000\" codebase=\"http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=$PLAYERVERSION$\" width=\"$WIDTH$\" height=\"$HEIGHT$\" id=\"" + uniqueFlashPlayerID +"\">" + "\n"
          + "<param name=\"movie\" value=\"$SWFPATH$\" />" + "\n"
          + "<param name=\"salign\" value=\"lt\" />" + "\n"
          + "<param name=\"quality\" value=\"high\" />" + "\n"
          + "<param name=\"scale\" value=\"noscale\" />" + "\n"
	  + "<param name=\"FlashVars\" value=\"&MM_ComponentVersion=1&skinName=$SKIN_NAME$&streamName=$STREAM_NAME$&autoPlay=$AUTO_PLAY$&autoRewind=$AUTO_REWIND$\" />" + "\n"
          + "<embed src=\"$SWFPATH$\" FlashVars=\"&MM_ComponentVersion=1&skinName=$SKIN_NAME$&streamName=$STREAM_NAME$&autoPlay=$AUTO_PLAY$&autoRewind=$AUTO_REWIND$\" quality=\"high\" scale=\"noscale\" width=\"$WIDTH$\" height=\"$HEIGHT$\" name=\"" + uniqueFlashPlayerID +"\" salign=\"LT\" type=\"application/x-shockwave-flash\" pluginspage=\"http://www.macromedia.com/go/getflashplayer\" />" + "\n"
          + "</object>";   

    break;
    case 1:
	  //add the video comment and mark of the web comment 
			       
      str = "<object classid=\"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000\" codebase=\"http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=$PLAYERVERSION$\" width=\"$WIDTH$\" height=\"$HEIGHT$\" id=\"" + uniqueFlashPlayerID +"\">" + "\n"
          + "<param name=\"movie\" value=\"$SWFPATH$\" />" + "\n"
          + "<param name=\"salign\" value=\"lt\" />" + "\n"
          + "<param name=\"quality\" value=\"high\" />" + "\n"
          + "<param name=\"scale\" value=\"noscale\" />" + "\n"
	  + "<param name=\"FlashVars\" value=\"&MM_ComponentVersion=1&serverName=$SERVER_NAME$&skinName=$SKIN_NAME$&appName=$APP_NAME$&streamName=$STREAM_NAME$&isLive=$IS_LIVE$&bufferTime=$BUFFER_TIME$&autoPlay=$AUTO_PLAY$&autoRewind=$AUTO_REWIND$\" />" + "\n"
          + "<embed src=\"$SWFPATH$\" FlashVars=\"&MM_ComponentVersion=1&serverName=$SERVER_NAME$&skinName=$SKIN_NAME$&appName=$APP_NAME$&streamName=$STREAM_NAME$&isLive=$IS_LIVE$&bufferTime=$BUFFER_TIME$&autoPlay=$AUTO_PLAY$&autoRewind=$AUTO_REWIND$\" quality=\"high\" scale=\"noscale\" width=\"$WIDTH$\" height=\"$HEIGHT$\" name=\"" + uniqueFlashPlayerID +"\" salign=\"LT\" type=\"application/x-shockwave-flash\" pluginspage=\"http://www.macromedia.com/go/getflashplayer\" />" + "\n"
          + "</object>";
      break;
  }

  // we need to encode '&' for xslt doc.
  if (dwscripts.isXSLTDoc())
    str = str.replace(/\&/g, "&amp;");
    
  return str;
}

//-------------------------------------------------------------------
// FUNCTION:
//   generateUniqueIndex
//
// DESCRIPTION:
//   returns unique index for Flash Object.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   return - unique index for Flash Object.
//
//--------------------------------------------------------------------

function generateUniqueIndex()
{
  var FLV_PLAYER_ID = "FLVPlayer";
  var uniqueId = FLV_PLAYER_ID;
  var ctr=0;
  var dom = dw.getDocumentDOM();
  var nodeArr;
  if(dom)
  {
    nodeArr = dom.getElementsByTagName("object");    
    while(isIdExists(uniqueId, nodeArr))
    {
      uniqueId = FLV_PLAYER_ID + ++ctr;
    }
  }
  return ctr;
}

//-------------------------------------------------------------------
// FUNCTION:
//   isIdExists
//
// DESCRIPTION:
//   returns true if initFLVPlayerID already exists on the page.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   return - true if initFLVPlayerID already exists on the page.
//
//--------------------------------------------------------------------

function isIdExists(initFLVPlayerID, nodeArr)
{
  var flvPlayerID;
  for(var i=0; i<nodeArr.length; i++)
  {
    if(nodeArr[i].getAttribute("id"))
      flvPlayerID = nodeArr[i].getAttribute("id");
    else
      continue;
      
    if(flvPlayerID && flvPlayerID == initFLVPlayerID)         
      return true;    
  }
  return false;
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
    if(STREAM_CB_IS_LIVE.getCheckedState())
    {
      if(STREAM_LIST_SKIN_NAMES.getValue().indexOf("Halo") == -1)
      {
        alert(MSG_SelectHaloSkinForVCS);
        return false;
      }
    }
  }
  return true;
}

//-------------------------------------------------------------------
// FUNCTION:
//   encodeURL
//
// DESCRIPTION:
//   Encodes the characters not encoded by escape().
//
// ARGUMENTS:
//   str - the string
//
// RETURNS:
//   return - encoded string.
//
//--------------------------------------------------------------------

function encodeURL(str)
{
  var charArray = new Array();
  var encodedValueArray = new Array();
  
  charArray[0] = "!";
  encodedValueArray[0] = "%21";
  charArray[1] = "#";
  encodedValueArray[1] = "%23";
  charArray[2] = "$";
  encodedValueArray[2] = "%24";
  charArray[3] = "&";
  encodedValueArray[3] = "%26";
  charArray[4] = "(";
  encodedValueArray[4] = "%28";
  charArray[5] = ")";
  encodedValueArray[5] = "%29";
  charArray[6] = ",";
  encodedValueArray[6] = "%2C";
  charArray[7] = " ";
  encodedValueArray[7] = "%20";
  charArray[8] = ";";
  encodedValueArray[8] = "%3B";
  charArray[9] = "=";
  encodedValueArray[9] = "%3D";
  charArray[10] = "?";
  encodedValueArray[10] = "%3F";
  charArray[11] = "@";
  encodedValueArray[11] = "%40";
  charArray[12] = "\\";
  encodedValueArray[12] = "%5C";
  charArray[13] = "|";
  encodedValueArray[13] = "%7C";  
  for(var i = 0; i < charArray.length; i++)
  {
    //replace the characters with encoded strings.
    while(str.indexOf(charArray[i]) != -1)
      str = str.substring(0,str.indexOf(charArray[i])) + encodedValueArray[i] + str.substr(str.indexOf(charArray[i]) + 1);
  }
  return str;
}


//--------------------------------------------------------------------
// FUNCTION:
//   saveBodyRelativeSelection
//
// DESCRIPTION:
//   Stores the body tag relative location of the current selection
//   in the global variable CURRENT_SEL.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

var CURRENT_SEL = null;

function saveBodyRelativeSelection()
{
  var dom = dw.getDocumentDOM();
  
  var sel;
  
  if(dom.getView('code'))
    sel = dom.source.getSelection();
  else
    sel = dom.getSelection();
  
  if (sel && sel.length > 1)
  {
    var bodyOffset = dom.nodeToOffsets(dom.body);

    sel[0] = sel[0] - bodyOffset[0];
    sel[1] = sel[1] - bodyOffset[0];
    
    CURRENT_SEL = sel;
  }  
}


//--------------------------------------------------------------------
// FUNCTION:
//   restoreBodyRelativeSelection
//
// DESCRIPTION:
//   Sets the selection back to it's original location, before the
//   Flash Video is inserted.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function restoreBodyRelativeSelection()
{
  var sel = CURRENT_SEL;
  CURRENT_SEL = null;
  
  if (sel)
  {
    var dom = dw.getDocumentDOM();
    
    var bodyOffset = dom.nodeToOffsets(dom.body);
    
    sel[0] = sel[0] + bodyOffset[0];
    sel[1] = sel[1] + bodyOffset[0];
    
    if(dom.getView('code'))
      dom.source.setSelection(sel[0], sel[1]);
    else
      dom.setSelection(sel[0], sel[1]);
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   applyVideoWidth
//
// DESCRIPTION:
//   applies the video Width attr change
//
// ARGUMENTS:
//    none
//
// RETURNS:
//   void
//--------------------------------------------------------------------
function applyVideoWidth(checkBoxObj,widthTFObj,heightTFObj,skinListObj,ar,totalSpanObj)
{
    var videoWidth = widthTFObj.value;
    var width;
    var totalSize = totalSpanObj.innerHTML;
    var regExp = /(\d+)x(\d+)/;
    
    //validate width
    if(!videoWidth || !trimString(videoWidth))
    {
      alert(MSG_EnterNumericWidth);
      return;
    }
    if(isNaN(videoWidth))
    {
      alert(MSG_EnterNumericWidth);
      return;
    }
    else if(videoWidth < 0 || videoWidth.indexOf(".") != -1)
    {
      alert(MSG_EnterValidWidth);
      return;
    }
    
    if(skinListObj.getValue().indexOf("Halo") == 0)      
      width = parseInt(videoWidth) + _HALO_SKIN_WIDTH;
    else
      width = parseInt(videoWidth);      
 
    //get the height
    var videoHeight = heightTFObj.value;
    if (checkBoxObj.getCheckedState())
    {
      if(ar == -1)
      {
        if(videoWidth && videoHeight && !isNaN(videoWidth) && !isNaN(videoHeight) && videoWidth > 0 && videoHeight > 0)
        {
          if(SELECTORLIST.getIndex() == 0)
            MM.PROG_VIDEO_AR = parseInt(videoWidth)/parseInt(videoHeight);
          else if(SELECTORLIST.getIndex() == 1)
            MM.STREAM_VIDEO_AR = parseInt(videoWidth)/parseInt(videoHeight);
        }
      }
      //maintain aspect ratio
      if ((ar != -1) && !isNaN(ar))
      {
        videoHeight = computeHeightAR(videoWidth,ar);
        heightTFObj.value = videoHeight;
      }
    }
    totalSpanObj.innerHTML = computeVideoTotal(videoWidth,videoHeight,skinListObj.getValue());
}

//--------------------------------------------------------------------
// FUNCTION:
//   applyVideoHeight
//
// DESCRIPTION:
//   applies the video Height attr change
//
// ARGUMENTS:
//    none
//
// RETURNS:
//   void
//--------------------------------------------------------------------
function applyVideoHeight(checkBoxObj,heightTFObj,widthTFObj,skinListObj,ar,totalSpanObj)
{
    var videoHeight = heightTFObj.value;
    var height;
    var totalSize = totalSpanObj.innerHTML;
    var regExp = /(\d+)x(\d+)/;
    
    //validate height
    if(!videoHeight || !trimString(videoHeight))
    {
      alert(MSG_EnterNumericHeight);
      return;
    }
  
    videoHeight =  trimString(videoHeight);

    if(isNaN(videoHeight))
    {
      alert(MSG_EnterNumericHeight);
      return;
    }
    else if(videoHeight < 0 || videoHeight.indexOf(".") != -1)
    {
      alert(MSG_EnterValidHeight);
      return;
    }
    
    if(skinListObj.getValue().indexOf("Halo") == 0)      
      height = parseInt(videoHeight) + _HALO_SKIN_HEIGHT;      
    else
      height = parseInt(videoHeight);
    
    var videoWidth = widthTFObj.value;
    if (checkBoxObj.getCheckedState())
    {
      if(ar == -1)
      {
        if(videoWidth && videoHeight && !isNaN(videoWidth) && !isNaN(videoHeight) && videoWidth > 0 && videoHeight > 0)
        {
          if(SELECTORLIST.getIndex() == 0)
            MM.PROG_VIDEO_AR = parseInt(videoWidth)/parseInt(videoHeight);
          else if(SELECTORLIST.getIndex() == 1)
            MM.STREAM_VIDEO_AR = parseInt(videoWidth)/parseInt(videoHeight);
        }
      }
      if ((ar != -1) && !isNaN(ar))
      {
        videoWidth = computeWidthAR(videoHeight,ar);
        widthTFObj.value = videoWidth;
      }
    }
    totalSpanObj.innerHTML = computeVideoTotal(videoWidth,videoHeight,skinListObj.getValue());
}

//--------------------------------------------------------------------
// FUNCTION:
//   computeWidthAR()
//
// DESCRIPTION:
//   compute the width while maintaining the aspect ratio
//
//
// ARGUMENTS:
//   the height 
//   the aspect ratio
//
// RETURNS:
//   returns the width.
//             
//--------------------------------------------------------------------
function computeWidthAR(height , ar)
{
  var widthAR = -1;
  if (ar != null)
  {
    var arFloat = parseFloat(ar);
    var iHeight = parseInt(height);
    if (iHeight != null)
    {
      widthAR = Math.ceil(arFloat*iHeight);
    }
  }
  return widthAR;
}

//--------------------------------------------------------------------
// FUNCTION:
//   computeHeightAR()
//
// DESCRIPTION:
//   compute the height while maintaining the aspect ratio
//
//
// ARGUMENTS:
//   the width 
//   the aspect ratio
//
// RETURNS:
//   returns the width.
//             
//--------------------------------------------------------------------
function computeHeightAR(width , ar)
{
  var heightAR = -1;
  if (ar != null)
  {
    var arFloat = parseFloat(ar);
    var iWidth = parseInt(width);
    if (iWidth != null)
    {
      heightAR = Math.ceil(iWidth/arFloat);
    }
  }
  return heightAR;
}

//--------------------------------------------------------------------
// FUNCTION:
//   computeVideoTotal()
//
// DESCRIPTION:
//   compute the total size of video taking into a/c the height for skin
//
//
// ARGUMENTS:
//   newHTML - the new HTML to insert in place of the current selection.
//
// RETURNS:
//   nothing.
//             
//--------------------------------------------------------------------
function computeVideoTotal(width , height , skinName)
{
  var totalStr = "";
  
  if(width && height)
  {
    var iHeight = parseInt(height);
    var iWidth = parseInt(width);
  
    if (skinName.indexOf("Halo") != -1)
    {
      iHeight = iHeight + _HALO_SKIN_HEIGHT;
      iWidth = iWidth + _HALO_SKIN_WIDTH;
    }
   
    totalStr +=iWidth;
    totalStr +="x";   
    totalStr +=iHeight;
  }
  return totalStr;
}

//--------------------------------------------------------------------
// FUNCTION:
//   replaceSel()
//
// DESCRIPTION:
//   Replaces the current selection with the supplied HTML. 
//
//
// ARGUMENTS:
//   newHTML - the new HTML to insert in place of the current selection.
//
// RETURNS:
//   nothing.
//             
//--------------------------------------------------------------------

function replaceSel(objectCode)
{
  var dom = dw.getDocumentDOM();
  var theObjOffsets = dom.getSelection();
  var documentContents = dom.documentElement.outerHTML;
  var newDocumentContents = documentContents.substr(0, theObjOffsets[0]);
  newDocumentContents += objectCode;
  newDocumentContents += documentContents.substr(theObjOffsets[1]);
  dom.documentElement.outerHTML = newDocumentContents;
}



//-------------------------------------------------------------------
// FUNCTION:
//   requiredFiles
//
// DESCRIPTION:
//   Shows an alert box listing files to be uploaded.
//
// ARGUMENTS:
//   videoType - Video type
//
// RETURNS:
//   nothing.
//
//--------------------------------------------------------------------

function requiredFiles()
{
  var reqMsg = "";
  if(SELECTORLIST.getIndex() == 0)
	{
		reqMsg = MSG_CopyProgDwnladFiles + "\n\n" + MSG_CopyProgDwnladFiles1;
	 //get the flv file name
 	 var videoURL = PROG_TF_URL.getValue();
	 if ((videoURL != null) && (videoURL.length > 0))
	 {
		 if (isFileURL(videoURL))
		 {
			  reqMsg +=videoURL;
				reqMsg += "\n";
				reqMsg += " ";
		 }
	 }			
	 reqMsg += PROG_LIST_SKIN_NAMES.getValue();
	}
  if(SELECTORLIST.getIndex() == 1)
	{
		var reqMsg = MSG_CopyStreamingFiles + "\n\n" + MSG_CopyStreamingFiles1;
		reqMsg+= STREAM_LIST_SKIN_NAMES.getValue();
		reqMsg+= MSG_CopyStreamingFiles2;
		var videoStreamName = trimString(STREAM_TF_STREAM_NAME.value);        
		if ((videoStreamName != null) && (videoStreamName.length > 0))
		{	
			//for streaming , if live feed is not checked , append the .flv name		
			if (STREAM_CB_IS_LIVE.getCheckedState() == false)
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
	}
	alert(reqMsg);
}


//-------------------------------------------------------------------
// FUNCTION:
//   isFileURL
//
// DESCRIPTION:
//   checks if it fileURL
//
// ARGUMENTS:
//   aFileURL
//
// RETURNS:
//   nothing.
//
//--------------------------------------------------------------------
function isFileURL(aURL)
{
	var bIsFileURL = true;
	if ((aURL != null) && (aURL.length))
	{
		if ((aURL.indexOf("http://") == 0) || (aURL.indexOf("rtmp://") == 0))
		{
			bIsFileURL = false;
		}
	}
	return bIsFileURL;
}


//--------------------------------------------------------------------
// FUNCTION:
//   isDetectSizeDoneForProgressive()
//
// DESCRIPTION:
//   checks if detect size is done
//
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing.
//             
//--------------------------------------------------------------------
function isDetectSizeDoneForProgressive()
{
	//check if we are not yet done detecting		
	var videoDim = getVideoProps();
	if ((videoDim != null) && (videoDim.length > 0))
	{
		if ((videoDim[0] != null) && (videoDim[1] != null))
		{
			if ((videoDim[0] != 0) && (videoDim[1] != 0))
			{					
				//turn on the flag when we have successfully detected the size
				MM._DETECTED_SIZE = true;
				PROG_TF_WIDTH.value = videoDim[0];
				PROG_TF_HEIGHT.value = videoDim[1];
				PROG_VIDEO_TOTAL.innerHTML = computeVideoTotal(videoDim[0],videoDim[1],PROG_LIST_SKIN_NAMES.getValue());
				MM.PROG_VIDEO_AR = videoDim[0]/videoDim[1];
				PROG_BTN_VIDEO_SIZE.setAttribute("disabled","false");
				MM.clearBusyCursor();
			}
			else
			{		
				if (MM._LOOPCOUNTER == _DETECT_SIZE_LOOP - 1)
				{
					MM.clearBusyCursor();
					//alert the user to detect size
					alert(MSG_UnableToDetectSize);			
					PROG_BTN_VIDEO_SIZE.setAttribute("disabled","false");
					if (PROG_TF_WIDTH.value && PROG_TF_HEIGHT.value)
						PROG_VIDEO_TOTAL.innerHTML = computeVideoTotal(PROG_TF_WIDTH.value,PROG_TF_HEIGHT.value,PROG_LIST_SKIN_NAMES.getValue());
					else
						PROG_VIDEO_TOTAL.innerHTML = "";
				}
				else
				{
					//increament the loop counter and set a time out recursively
					MM._LOOPCOUNTER++;
					//set the call back
					var funCallBack = "isDetectSizeDoneForProgressive()";
					
					setTimeout(funCallBack,500);
				}
			}
		}
	}		
}


//--------------------------------------------------------------------
// FUNCTION:
//   isDetectSizeDoneForStreaming()
//
// DESCRIPTION:
//   checks if detect size is done
//
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing.
//             
//--------------------------------------------------------------------
function isDetectSizeDoneForStreaming()
{
	//check if we are not yet done detecting
	var videoDim = getVideoProps();
	if ((videoDim != null) && (videoDim.length > 0))
	{
		if ((videoDim[0] != null) && (videoDim[1] != null))
		{
			if ((videoDim[0] != 0) && (videoDim[1] != 0))
			{					
				//turn on the flag when we have successfully detected the size
				MM._DETECTED_SIZE = true;
				STREAM_TF_WIDTH.value = videoDim[0];
				STREAM_TF_HEIGHT.value = videoDim[1];
				STREAM_VIDEO_TOTAL.innerHTML = computeVideoTotal(videoDim[0],videoDim[1],STREAM_LIST_SKIN_NAMES.getValue());
				MM.STREAM_VIDEO_AR = videoDim[0]/videoDim[1];
				STREAM_BTN_VIDEO_SIZE.setAttribute("disabled","false");
				MM.clearBusyCursor();
			}
			else
			{						
				if (MM._LOOPCOUNTER == _DETECT_SIZE_LOOP - 1)
				{
					MM.clearBusyCursor();
					//alert the user to detect size
					alert(MSG_UnableToDetectSize);
					STREAM_BTN_VIDEO_SIZE.setAttribute("disabled","false");
					if (STREAM_TF_WIDTH.value && STREAM_TF_HEIGHT.value)
						STREAM_VIDEO_TOTAL.innerHTML = computeVideoTotal(STREAM_TF_WIDTH.value,STREAM_TF_HEIGHT.value,STREAM_LIST_SKIN_NAMES.getValue());
					else
						STREAM_VIDEO_TOTAL.innerHTML = "";
				}
				else
				{
					//increament the loop counter and set a time out recursively
					MM._LOOPCOUNTER++;
					//set the call back
					var funCallBack = "isDetectSizeDoneForStreaming()";
					setTimeout(funCallBack,500);
				}
			}
		}
	}
}

//--------------------------------------------------------------------
// FUNCTION:
//   detectSizeForProgressive()
//
// DESCRIPTION:
//   detect the size for .flv (file , http) and initialize the width and height
//
//
// ARGUMENTS:
//   the url (file or http)
//
// RETURNS:
//   nothing.
//             
//--------------------------------------------------------------------
function detectSizeForProgressive()
{
	var videoURL = PROG_TF_URL.getValue();
	if((videoURL != null) && (videoURL.length > 0))
	{
		videoURL = trimString(videoURL);
		if (isFileURL(videoURL))
		{
			//form a file:///url if not http
			videoURL = getFullURL(videoURL);
		}
		//load the video URL to get the auto detect the video dimension
		loadVideo(videoURL);
		//start the detect poll
		//we need the below flag to track when the auto detect from
		//swfloader extension is completed.
		//we loop 30 times x 500ms (1/2 second)15 seconds
		MM._LOOPCOUNTER = 0;
		// disable the control
		PROG_BTN_VIDEO_SIZE.setAttribute("disabled","true");
		PROG_VIDEO_TOTAL.innerHTML = MSG_Detecting;
		MM.setBusyCursor();
		//first call back
		var funCallBack = "isDetectSizeDoneForProgressive()";
		setTimeout(funCallBack,500);
	}
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
	var sourceURL = STREAM_TF_SERVER_URI.getValue();      
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
		STREAM_TF_SERVER_URI.textControl.focus();
		return;
	}
	var streamName = trimString(STREAM_TF_STREAM_NAME.value);  

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
		//disable the control
		STREAM_BTN_VIDEO_SIZE.setAttribute("disabled","true");
		STREAM_VIDEO_TOTAL.innerHTML = MSG_Detecting;
		MM.setBusyCursor();
		//first call back
		var funCallBack = "isDetectSizeDoneForStreaming(" + i + ")";
		setTimeout(funCallBack,500);
	}
}


//--------------------------------------------------------------------
// FUNCTION:
//   getFullURL()
//
// DESCRIPTION:
//   get the full url specified the url , w.r.t to either doc relative 
//   or site relative.
//
// ARGUMENTS:
//   the url (rtmp)
//
// RETURNS:
//   nothing.
//             
//--------------------------------------------------------------------
function getFullURL(aURL)
{
	var absoluteURL = aURL;
	if ((aURL != null) && (aURL.length))
	{
		//get docPath URL
		var docPath = dw.getDocumentPath("document");
		var siteRoot = dw.getSiteRoot();
		//get absolute URL from relative URL
		absoluteURL = dw.relativeToAbsoluteURL(docPath,siteRoot,aURL);
		if (absoluteURL.indexOf("file:////") == 0)
		{
			absoluteURL = absoluteURL.substring(8,absoluteURL.length);
		}
	}
	return absoluteURL;
}



//+-------------------------------------------------------------------+
// jvillegas: helper functions to call the Flash Player dll 

var bFlashInit = false;
// call startUpPlayer() when the HTML dialog is initialized
// be sure the SWF file below exists in the specified directory
function startUpPlayer()
{
  var flvPlayerFileURL= dwscripts.filePathToLocalURL(dw.getConfigurationPath()
    + dwscripts.FILE_SEP + "Commands"
    + dwscripts.FILE_SEP + "FLVFileLoader.swf");

	if(swfloader && !bFlashInit)
	{
		bFlashInit = true;
		swfloader.loadMovie(flvPlayerFileURL);
	}
}

// loadVideo must be called to initialize the FLV file before 
// calling getVideoProps()
function loadVideo(videoURL)
{
	if(bFlashInit)
	{ // call this function in the stub movie
		if((videoURL != null) && (videoURL.length > 0) && (lastVideoLoaded != videoURL))
		{
			lastVideoLoaded = videoURL;
			swfloader.setVariable("fileToLoad", videoURL);
			swfloader.callFunction("reload");
		}
	}
}

// getVideoProps() sniffs the FLV file for the width/height info
// this should be called on a separate event from loadVideo to give the player
// some cycles to actualy load the FLV buffer
function getVideoProps()
{
	videoDim = new Array();
	if (bFlashInit)
	{ // call this function in the stub movie
		swfloader.callFunction("update");
		//add the width
		videoDim[0] = swfloader.getVariable("mediaWidth");
		videoDim[1] = swfloader.getVariable("mediaHeight");
		videoDim[2] = swfloader.getVariable("videocodecid");
	}		
	return videoDim;
}

// unloadPlayer() unloads any SWF file currently playing in the Flash player
// and closes the dialog window
function unloadPlayer(closeWindow)
{  
	if (bFlashInit)
	{	
		swfloader.loadMovie("");
		bFlashInit = false;
	}

	if (closeWindow)
	{
  		window.close();
	}
}

//--------------------------------------------------------------------
// FUNCTION:
//   detectVideoInfoForProgressive()
//
// DESCRIPTION:
//   detect the size for .flv (file , http) and initialize the width and height
//
//
// ARGUMENTS:
//   the url (file or http)
//
// RETURNS:
//   nothing.
//             
//--------------------------------------------------------------------
function detectVideoInfoForProgressive()
{
	videoDim = null;
	var videoURL = PROG_TF_URL.getValue();
	if ((videoURL != null) && (videoURL.length > 0))
	{
		codecID = -1;
		videoURL = trimString(videoURL);
		if (isFileURL(videoURL))
		{
			//form a file:///url if not http
			videoURL = getFullURL(videoURL);

			// if the flv file does not exists, don't try to detect codec ID. 
			if (!DWfile.exists(videoURL))
			{
				return;
			}
		}
		//load the video URL to get the auto detect the video dimension
		loadVideo(videoURL);
		//start the detect poll
		//we need the below flag to track when the auto detect from
		//swfloader extension is completed.
		//we loop 30 times x 500ms (1/2 second)15 seconds
		MM._LOOPCOUNTER = 0;
		var funCallBack = "isDetectCodecIDDone()";
		setTimeout(funCallBack,500);
	}
}

//--------------------------------------------------------------------
// FUNCTION:
//   isDetectCodecIDDone()
//
// DESCRIPTION:
//   checks if detect size is done
//
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing.
//             
//--------------------------------------------------------------------
function isDetectCodecIDDone()
{
	//check if we are not yet done detecting		
	var videoDim = getVideoProps();
	if ((videoDim != null) && (videoDim.length > 0))
	{
		if (videoDim[2] != null && (videoDim[0] != 0) && (videoDim[1] != 0))
		{
			codecID = videoDim[2];
		}
		else
		{		
			if (MM._LOOPCOUNTER == _DETECT_SIZE_LOOP - 1)
			{
				// TODO : show a warning
				codecID = -1;
			}
			else
			{
				//increament the loop counter and set a time out recursively
				MM._LOOPCOUNTER++;
				//set the call back
				var funCallBack = "isDetectCodecIDDone()";
				setTimeout(funCallBack,500);
			}
		}
	}		
}

//--------------------------------------------------------------------
// FUNCTION:
//   detectVideoInfoForStreaming()
//
// DESCRIPTION:
//   detect the size for .flv (file , http) and initialize the width and height
//
//
// ARGUMENTS:
//   the url (file or http)
//
// RETURNS:
//   nothing.
//             
//--------------------------------------------------------------------
function detectVideoInfoForStreaming()
{
	videoDim = null;
	var sourceURL = STREAM_TF_SERVER_URI.getValue();      
	if (/\s*rtmp:\/\/([^\/]+)\/([^\/]+\/[^\/]+)/i.test(sourceURL) && 
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
		STREAM_TF_SERVER_URI.textControl.focus();
		return;
	}
	var streamName = trimString(STREAM_TF_STREAM_NAME.value);  

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
		codecID = -1;
		var funCallBack = "isDetectCodecIDDone()";
		setTimeout(funCallBack,500);
	}
}

//--------------------------------------------------------------------
// FUNCTION:
//   addDetectionScript()
//
// DESCRIPTION:
//   inserts a script that detects whether the end user has the correct
//   version of Flash to view the video
//
//
// ARGUMENTS:
//   reqVerStr - the version of Flash player required to view the video
//   msg - message to show the end user if they need to download a
//         new version of Flash Player
//
// RETURNS:
//   nothing.
//             
//--------------------------------------------------------------------
function addDetectionScript(reqVerStr, msg){
  // Determine whether reqVerStr is the latest version required
  // by all Flash movies on the page
  var dom = dw.getDocumentDOM();
  var reqVerArr = reqVerStr.split(",");
  var requiredVersion = parseFloat(reqVerArr[0] + "." + reqVerArr[2]);
  var allObjects = new Array(); 
  allObjects = dom.getElementsByAttributeName("classid");
  for (var i=0;i<allObjects.length;i++){
    var codeBase = allObjects[i].getAttribute("codebase");
    var swflashStart = codeBase.indexOf("swflash.cab#version=");
    if (codeBase && swflashStart != -1){
      var versionStr = codeBase.substr(swflashStart+20);
      var verArr = versionStr.split(",");
      var version = parseFloat(verArr[0] + "." + verArr[2]);
      if (version > requiredVersion){
        requiredVersion = version;
      }
    }
  }
  // Convert requiredVersion back to a string
  requiredVersion = requiredVersion.toString();
  // Fix problem where parseFloat is dropping trailing zeros
  if (requiredVersion == parseInt(requiredVersion))
    requiredVersion += ".0";
  reqVerArr = requiredVersion.split(".");
  reqVerArr.splice(1,0,0);
  reqVerArr.splice(3,0,0);
  requiredVersion = reqVerArr.join(",");
  
  // Function to be inserted in the head of the document
  // (one giant string with curly braces and linebreaks URL-encoded)
  var fnStr = 'function MM_CheckFlashVersion(reqVerStr,msg)%7B%0D  with(navigator)%7B%0D    var isIE  = (appVersion.indexOf("MSIE") != -1 && userAgent.indexOf("Opera") == -1);%0D    var isWin = (appVersion.toLowerCase().indexOf("win") != -1);%0D    if (!isIE %7C%7C !isWin)%7B  %0D      var flashVer = -1;%0D      if (plugins && plugins.length > 0)%7B%0D        var desc = plugins["Shockwave Flash"] ? plugins["Shockwave Flash"].description : "";%0D        desc = plugins["Shockwave Flash 2.0"] ? plugins["Shockwave Flash 2.0"].description : desc;%0D        if (desc == "") flashVer = -1;%0D        else%7B%0D          var descArr = desc.split(" ");%0D          var tempArrMajor = descArr[2].split(".");%0D          var verMajor = tempArrMajor[0];%0D          var tempArrMinor = (descArr[3] != "") ? descArr[3].split("r") : descArr[4].split("r");%0D          var verMinor = (tempArrMinor[1] > 0) ? tempArrMinor[1] : 0;%0D          flashVer =  parseFloat(verMajor + "." + verMinor);%0D        %7D%0D      %7D%0D      // WebTV has Flash Player 4 or lower -- too low for video%0D      else if (userAgent.toLowerCase().indexOf("webtv") != -1) flashVer = 4.0;%0D%0D      var verArr = reqVerStr.split(",");%0D      var reqVer = parseFloat(verArr[0] + "." + verArr[2]);%0D  %0D      if (flashVer < reqVer)%7B%0D        if (confirm(msg))%0D          window.location = "http://www.macromedia.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash";%0D      %7D%0D    %7D%0D  %7D %0D%7D%0D';
  
  var fnCall = "MM_CheckFlashVersion('" + reqVerStr + "','" + msg + "')";
  
  // First check whether the function's already in the head.
  // If not, see if there's an existing script tag into which we
  // can insert it.
  var theHead = dom.getElementsByTagName('head')[0];
  if (theHead.innerHTML.indexOf('MM_CheckFlashVersion') == -1){
    var scriptTags = theHead.getElementsByTagName('script');
    var isXSLTDoc = dwscripts.isXSLTDoc();
    if (scriptTags && scriptTags.length > 0){
      var scriptStr = scriptTags[0].innerHTML;
      if (isXSLTDoc){
        var CDataEndIndex = scriptStr.lastIndexOf(']]>');
        if (CDataEndIndex != -1)
          scriptTags[0].innerHTML = scriptStr.substring(0, CDataEndIndex) + "\n" + unescape(fnStr) + scriptStr.substr(CDataEndIndex);
      }
      else{
        var endCommentIndex = scriptStr.lastIndexOf('//-->');     
        if (endCommentIndex == -1)
          scriptTags[0].innerHTML = scriptStr + "\n\n" + unescape(fnStr); 
        else
          scriptTags[0].innerHTML = scriptStr.substring(0, endCommentIndex) + "\n" + unescape(fnStr) + scriptStr.substr(endCommentIndex); 
      }
    }
    else
    {
      // wrap the fn in script tags
      var newHead = theHead.innerHTML + '\n<script type="text/javascript">\n';

      if(isXSLTDoc)
      {
        newHead += '\n<xsl:text disable-output-escaping="yes">\n<![CDATA[';
      }
      newHead +=  unescape(fnStr);
      if(isXSLTDoc)
      {
        newHead += ']]>\n</xsl:text>\n';
      }
      newHead += '\n<' + '/script>';
      theHead.innerHTML = newHead;
    }
  }    
  // Now add or update the function call
  var bodyTag = dom.body;
  var handler = bodyTag.getAttribute("onload");
  if (handler){
    var fnIndex = handler.indexOf('MM_CheckFlashVersion');
    if (fnIndex == -1)
      bodyTag.setAttribute("onLoad", handler + ";MM_CheckFlashVersion('" + requiredVersion + "','" + dwscripts.escQuotes(msg) + "');");
    else{
      var endFn = handler.indexOf(')',fnIndex);
      bodyTag.setAttribute("onLoad", handler.substring(0,fnIndex) + "MM_CheckFlashVersion('" + requiredVersion + "','" + dwscripts.escQuotes(msg) + "'" + handler.substring(endFn));
    }
  }
  else
    bodyTag.setAttribute("onLoad", "MM_CheckFlashVersion('" + requiredVersion + "','" + dwscripts.escQuotes(msg) + "');");
}

//--------------------------------------------------------------------
// FUNCTION:
//   setFieldState()
//
// DESCRIPTION:
//   enables or disables the Message field when the Flash detection
//   option is selected/deselected
//
//
// ARGUMENTS:
//   ckBox - the object reference of the Prompt checkbox
//   msgField - the object reference of the Message field
//
// RETURNS:
//   nothing.
//             
//--------------------------------------------------------------------
function setFieldState(ckBox, msgField){
  if (ckBox.getCheckedState())
    msgField.removeAttribute("disabled");
  else
    msgField.setAttribute("disabled","true");
}
