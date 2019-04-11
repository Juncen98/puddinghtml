// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

var PLATFORM = navigator.platform;
var CTRL_STR = (PLATFORM == "Win32") ? "Ctrl" : "Cmd";
var ICON_URL = (PLATFORM == "Win32") ? "../Shared/MM/Images/infoIconWin.gif" : "dwres:1";
var helpDoc = MM.HELP_mnuExplodedModeIntro;

function commandButtons()
{
   return new Array("PutButtonsOnBottom", "OkButton defaultButton", MM.BTN_OK, "onOK()",
                    "PutButtonOnLeft", MM.BTN_Help, "displayHelp()");
}

// Set up platform-specific items in the Exploded Mode intro dialog.
function initialize()
{
    // Use the right icon for the platform.
    document.img_DialogIcon.src = ICON_URL;
}

// Detect if the user checked the "Don't show me again" checkbox
// when the user hits "OK".
function onOK()
{
    if (document.cbForm.check_DontShowAgain.checked)
    {
        MM.ExplodedModeIntro_DontShowAgain = true;
    }
    window.close();
}
