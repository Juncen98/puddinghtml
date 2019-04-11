
//
// Copyright 2004, 2005 Macromedia, Inc. All rights reserved.
//
// ----------------------------------------------------
//
// FlashPaper.js
//
//This object inserts any ole .swf file and has optional parameters for width and height.
//



//*********************GLOBAL VARIABLES***********************

//see initGlobals for info on global vars

var helpDoc = MM.HELP_objFlashPaper;

//*********************** API ***********************

function isDOMRequired()
{ 
	// Return false, indicating that this command is available in code view.
	return false;
}

//function: commandButtons
//description: generic API function, returns string to be inserted at IP

function commandButtons()
{
   return new Array(MM.BTN_OK,         "writeOutTag();window.close()",
                    MM.BTN_Cancel,     "window.close()",
					MM.BTN_Help,		"displayHelp()");
}


//function: initializeUI
//description: 

function initializeUI()
{
    MM.commandReturnValue = "";
}


function createFlashHTML()
{
  var swfURL = document.flashPaperForm.tbSource.value;
  if (swfURL)
    swfURL = dw.doURLEncoding(swfURL);
  else
    return "";
  var sizeArray = SWFFile.getNaturalSize(swfURL);
  var width, height;
  var userEnteredWidth = document.flashPaperForm.tbWidth.value;
  var userEnteredHeight = document.flashPaperForm.tbHeight.value;
  var retVal= new Array();
  
  if (userEnteredWidth)
    width = userEnteredWidth;
  else if (sizeArray)
    width = sizeArray[0];
  else
    width = 32;
	
  if (userEnteredHeight)
    height = userEnteredHeight
  else if (sizeArray)
    height = sizeArray[1];
  else
    height = 32;

  retVal.push('<OBJECT CLASSID="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"');
  retVal.push(' CODEBASE="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,19,0"');
  retVal.push(' WIDTH="' + width + '" HEIGHT="'+ height + '">\n');
  retVal.push('<PARAM NAME="movie" VALUE="' + swfURL + '"> <PARAM NAME="quality" VALUE="high">\n' );
  retVal.push('<EMBED SRC="' + swfURL +'"');
  retVal.push(   ' QUALITY="high" PLUGINSPAGE="http://www.macromedia.com/go/getflashplayer" ' +
         'TYPE="application/x-shockwave-flash" ');
  retVal.push('WIDTH="' + width + '" HEIGHT="'+ height +'" ');
  retVal.push('>'+'</EMBED>\n' + '</OBJECT>');
  return  retVal.join("");
}


function addAccessibility(rtnStr) {
   var cmdFile = dreamweaver.getConfigurationPath() + "/Commands/Object Options.htm";
   var cmdDOM = dreamweaver.getDocumentDOM(cmdFile);
 
   cmdDOM.parentWindow.setFormItem(rtnStr);
   dreamweaver.popupCommand("Object Options.htm");
   return (cmdDOM.parentWindow.returnAccessibilityStr(rtnStr));	
}

function writeOutTag()
{
  var userEnteredWidth = document.flashPaperForm.tbWidth.value;
  var userEnteredHeight = document.flashPaperForm.tbHeight.value;
  var flashTag= createFlashHTML();
 
  var prefsAccessibilityOption = dw.getPreferenceString("Accessibility", "Accessibility Media Options", "");

  if (prefsAccessibilityOption == 'TRUE')
  {
	flashTag = addAccessibility(flashTag);
  }

  // tell dw to prepend a browser-safe script if the preference is turned on
  // (see Code Rewriting preferences)
  var dom = dw.getDocumentDOM();
  if (dom.convertNextActiveContent) // if the function doesn't exist, don't call it
    dom.convertNextActiveContent();

  if (userEnteredWidth || userEnteredHeight)
  {
    //we need to insert the HTML code ourselves since if it goes
    //through the normal object insert process, the C code will
    //overwrite the width and height
    var dom = dw.getDocumentDOM();
    var wasPlaying = false;
    if (dom.canStopPlugin())
    {
      dom.stopPlugin();
      wasPlaying = true;
    }
    dom.insertHTML(flashTag);
    if (wasPlaying)
      dom.startPlugin();
    MM.commandReturnValue = "";
  }
  else
  {
    //just return the tag and let the C code extract the width and height
    MM.commandReturnValue = flashTag;
  }
}
