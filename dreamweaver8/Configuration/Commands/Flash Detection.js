// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved

function canAcceptCommand() {
  var retVal = false;
  var dom = dw.getDocumentDOM();
  if (dom && dom.getParseMode() == 'html' && (dw.getFocus() == 'document' || dw.getFocus(true) == 'html' || dw.getFocus() == 'textView') && hasFunctionCall('MM_CheckFlashVersion', dom)){
    retVal = true;
  }
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   addDetectionScript()
//
// DESCRIPTION:
//   inserts a script that detects whether the end user has the correct
//   version of Flash to view the video
//   NOTE: This function's only in here in case we decide to put in an
//   Add option and corresponding UI. Currently, it's not called.
//   TO DO: Modify so that the automatic checking for latest version in
//   the page is done in initUI() rather than here.
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
    if (scriptTags && scriptTags.length > 0){
      var scriptStr = scriptTags[0].innerHTML;
      var endCommentIndex = scriptStr.lastIndexOf('//-->');
      if (endCommentIndex == -1)
        scriptTags[0].innerHTML = scriptStr + "\n\n" + unescape(fnStr); 
      else
        scriptTags[0].innerHTML = scriptStr.substring(0, endCommentIndex) + "\n" + unescape(fnStr) + scriptStr.substr(endCommentIndex); 
    }
    else
      // wrap the fn in script tags
      theHead.innerHTML = theHead.innerHTML + '\n<script type="text/javascript">\n' +  unescape(fnStr) + '\n<' + '/script>';
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
//   removeDetectionScript()
//
// DESCRIPTION:
//   deletes the script that detects whether the end user has the correct
//   version of Flash to view the video, and the event handler that calls it
//
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing.
//             
//--------------------------------------------------------------------
function removeDetectionScript(){
  var dom = dw.getDocumentDOM();
  var selArr,bodyArr,newBodyArr;
  
  // get current selection and remember the whole body offset
  selArr = dom.getSelection();
  bodyArr = dom.nodeToOffsets(dom.body);
      
  // deleteFunction() is defined in Shared/CMN/Scripts/DOM.js
  deleteFunction('MM_CheckFlashVersion', dom, true);
  var bodyTag = dom.body;
  var handler = bodyTag.getAttribute("onload");
  if (handler){
    var fnIndex = handler.indexOf('MM_CheckFlashVersion');
    if (fnIndex > -1){
      var endFn = handler.indexOf(');',fnIndex);
      var fnStr = handler.substring(fnIndex,endFn+2);
      // if the only thing in the onload handler is our function call
      if (handler.length == fnStr.length)
        bodyTag.removeAttribute("onLoad");
      else {
        handler = handler.substring(0,fnIndex) + handler.substring(endFn+2);
        bodyTag.setAttribute("onLoad",handler);
      }
    }
  } 

  // Adjust the original selection by offsetting with deleted code before restoring the selection 
  if (selArr && selArr.length > 1)
  {
    newBodyArr = dom.nodeToOffsets(dom.body);
    var shift = bodyArr[1]-newBodyArr[1];
    dom.setSelection(selArr[0]-shift,selArr[1]-shift);
  }
}
