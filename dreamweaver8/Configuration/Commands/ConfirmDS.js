// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
var PLATFORM = navigator.platform;
var ICON_URL = (PLATFORM == "Win32") ? "../Shared/MM/Images/alertIconWin.gif" : "../Shared/MM/Images/yield28x28.gif";
var FBUTTON = null;

function isDOMRequired() {
	// Return false, indicating that this object is available in code view.
	return false;
}

function hideDSCheck()
	{
	document.dsCheck.innerHTML = "";
	}
	
function setIcon(newIcon)
	{
	ICON_URL = newIcon;
	}
	
function render() {
   var btnList="", i;
   document.msg.innerHTML = arguments[0]; //Insert the question
   var b1 = document.theForm.button;
   var b2 = document.theForm.button2;
   if (arguments.length == 3){
     b1.value = arguments[1];
     b1.setAttribute("onClick","setResult('" + arguments[1] + "')");
     b2.value = arguments[2];
     b2.setAttribute("onClick","setResult('" + arguments[2] + "')");
     if (arguments[1] == MM.BTN_Yes || arguments[1] == MM.BTN_OK){
       b1.setAttribute("accessKey", "y");
       b2.setAttribute("accessKey", "n");
       b1.focus();
       FBUTTON = b1;
     }else if (arguments[2] == MM.BTN_Yes || arguments[2] == MM.BTN_OK){
       b1.setAttribute("accessKey", "n");
       b2.setAttribute("accessKey", "y");
       b2.focus();
       FBUTTON = b2;
     }else{
       b1.removeAttribute("accessKey");
       b2.removeAttribute("accessKey");
     }
   }
   else if (arguments.length > 1) {
     for (i=1; i<arguments.length; i++){
       btnList += "<input type='button' value='"+arguments[i]+"' onClick='setResult(\""+arguments[i]+"\")'> ";
     }
     document.btns.innerHTML = btnList;
   }
}

function render_array(message, buttons) {
   var btnList="", i;
   document.msg.innerHTML = message; //Insert the question
     for (i=0; i<buttons.length; i++)
       btnList += "<input type='button' value='"+buttons[i]+"' onClick='setResult(\""+buttons[i]+"\")'> ";
     
     document.btns.innerHTML = btnList;
}

function setResult(result) {	
   if (typeof MMNotes != 'undefined') { // Set values off of MMNotes object if it exists.
     MMNotes.Confirm_RESULT = result;
     if (typeof(document.cbDoNotAsk) != 'undefined')
     		MMNotes.Confirm_DONOTSHOW = document.cbDoNotAsk.checked;
     else
	     	MMNotes.Confirm_DONOTSHOW = false; 
   }
   window.close();
}

function initialize()
{
     // Use the right icon for the platform.
     document.confirmIcon.src = ICON_URL;
     if (FBUTTON){
       FBUTTON.focus();
     }
}
