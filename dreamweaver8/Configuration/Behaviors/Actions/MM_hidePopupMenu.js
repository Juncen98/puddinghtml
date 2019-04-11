// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// Starts a timer that calls mmDoHide() in the 
// mm_menu.js file, which in turn hides the pop-up menu. 

// This is the companion Action to Show Pop-Up Menu.

function MM_startTimeout() {
	if( window.ActiveMenu ) {
		mmStart = new Date();
		mmDHFlag = true;
		mmHideMenuTimer = setTimeout("mmDoHide()", window.ActiveMenu.Menu.hideTimeout);
	}
}
