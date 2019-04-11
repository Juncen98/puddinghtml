// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

var PLATFORM = navigator.platform;
var ICON_URL = (PLATFORM == "Win32") ? "../Shared/MM/Images/infoIconWin.gif" : "dwres:2";

function isDOMRequired()
{ 
	// Return false, indicating that this object is available in code view.
	return false;
}

function setMessage(message)
{
  document.msg.innerHTML = message;
}

function setResult(result)
{
  dwscripts.setCommandReturnValue(document.cbDoNotAsk.checked);
  window.close();
}

function initialize()
{    
  // Use the right icon for the platform.
  document.confirmIcon.src = ICON_URL; 

  // set focus to the ok button
  if (document.button)
  {
    document.button.focus();
  }
}