// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
var PLATFORM = navigator.platform;
var ICON_URL = (PLATFORM == "Win32") ? "../Shared/MM/Images/alertIconWin.gif" : "../Shared/MM/Images/yield28x28.gif";

function isDOMRequired() {
	// Return false, indicating that this object is available in code view.
	return false;
}

function render() {
   var btnList="", i;
   document.msg.innerHTML = arguments[0]; //Insert the question
   if (arguments.length > 1) {
     for (i=1; i<arguments.length; i++)
       btnList += "<input type='button' value='"+arguments[i]+"' onClick='setResult(\""+arguments[i]+"\")'>";
     document.btns.innerHTML = btnList;
   }
}

function setResult(result) {	
   if (typeof MMNotes != 'undefined') { // Set values off of MMNotes object if it exists.
     MMNotes.Confirm_RESULT = result;
   }
   window.close();
}

function initialize()
{
     // Use the right icon for the platform.
     document.confirmIcon.src = ICON_URL;
}