// Copyright 2005 Macromedia, Inc. All rights reserved.
var HELP_DOC = MM.HELP_newCFC;

var NAME_OBJ;			//theName
var DIRECTORY_OBJ;		//theDirectory

//*************************API**************************

//--------------------------------------------------------------------
// FUNCTION:
//   commandButtons
//
// DESCRIPTION:
//   Returns the array of buttons that should be displayed on the
//   right hand side of the dialog.  The array is comprised
//   of name, handler function name pairs.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   array of strings - name, handler function name pairs
//--------------------------------------------------------------------
function commandButtons() {
	btnArray =  new Array(
	dreamweaver.loadString("button/next"),	"clickedNext()", 
	MM.BTN_Cancel,	"clickedCancel()",
	MM.BTN_Help,	"clickedHelp()");
	return btnArray;
}



//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI()
//
// DESCRIPTION:
//   Initializes the UI controls
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function initializeUI() {
	NAME_OBJ = dwscripts.findDOMObject("theName");
	DIRECTORY_OBJ = dwscripts.findDOMObject("theDirectory");
	
	NAME_OBJ.value = "";
	DIRECTORY_OBJ.value = '/'; //dreamweaver.getSiteRoot();
}

//--------------------------------------------------------------------
// FUNCTION:
//   clickedNext
//
// DESCRIPTION:
//   User defined their CFC and now wants to defined a function for it
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function clickedNext() 
{
	if( !validate() )
		return;
		
	var absoluteDirPath = getAbsolutePath(DIRECTORY_OBJ.value, dreamweaver.getSiteRoot()); //dreamweaver.getSiteRoot() + DIRECTORY_OBJ.value.substr(1);
	if (!absoluteDirPath) {
		alert(MM.MSG_CFCComponentNotInSite);
		document.theForm.theDirectory.focus();
		return;			
	}
	var newCfcUrl = absoluteDirPath + validateFileName(NAME_OBJ.value);
	if (DWfile.exists(absoluteDirPath + newCfcUrl)) {
		alert(MM.MSG_CFCFileExists);
		document.theForm.theName.focus();
		return;			
	}	
	
	var newCfcDom = dreamweaver.getNewDocumentDOM("CFC");
	newCfcDom.documentElement.outerHTML = "<cfcomponent>\n\n</cfcomponent>";
	
	window.close();
	
	insertNewCFCRecordset(newCfcDom, newCfcUrl, DIRECTORY_OBJ.value, NAME_OBJ.value);
}



//--------------------------------------------------------------------
// FUNCTION:
//   clickedCancel
//
// DESCRIPTION:
//   closes this window without makeing any changes
//   side of the dialog
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function clickedCancel() {
	MM.CFCNeedRefresh = false;
	MM.CFCNewName = "";
	MM.CFCSitePath = "";
	window.close();
}



//--------------------------------------------------------------------
// FUNCTION:
//   clickedHelp
//
// DESCRIPTION:
//   Displays the help window for this command
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function clickedHelp() {
	dwscripts.displayDWHelp(HELP_DOC);
}

//--------------------------------------------------------------------
// FUNCTION:
//   clickedBrowse
//
// DESCRIPTION:
//   xxx
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function clickedBrowse() {
	var absolutePath = getAbsolutePath(DIRECTORY_OBJ.value, dreamweaver.getSiteRoot());
	if (!absolutePath) {
		absolutePath = dreamweaver.getSiteRoot();
	}
	var folder = dreamweaver.browseForFolderURL(dreamweaver.loadString("label/selectAFolder"), absolutePath);
	if (folder) {
		if (folder.charAt(folder.length-1) != "/") {
			folder = folder + "/";
		}
		var relativePath = getRelativePath(folder, dreamweaver.getSiteRoot());
		if (relativePath) {
			DIRECTORY_OBJ.value = relativePath;
		} else {
			alert(MM.MSG_CFCComponentNotInSite);
			DIRECTORY_OBJ.value = folder;
			document.theForm.theDirectory.focus();
			return;			
		}
	}
}

//--------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//   This function is called by the UI controls to handle UI updates
//
// ARGUMENTS:
//   control - string - the name of the control sending the event
//   event - string - the event which is being sent
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function updateUI(control, event) {
}



//--------------------------------------------------------------------
// FUNCTION:
//   validateFileName
//
// DESCRIPTION:
//   This function is called by the UI controls to handle UI updates
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function validateFileName(name) {
	if ((name.length)&&(!(name.indexOf('.cfc') >= 0))) {
		return name + '.cfc';
	}
}



//--------------------------------------------------------------------
// FUNCTION:
//   validate
//
// DESCRIPTION:
//   This function is called to validate if the required values are
//   enetered
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function validate() {
	var ret = true;

	if (ret) {
		if (Trim(NAME_OBJ.value) == "") {
			alert(MM.MSG_CFCNameRequired);
			ret = false;
			document.theForm.theName.focus();
			return ret;
		}
/*		var validRegExp = null;
		validRegExp = /[\\:\*\?\<\>\|\/]/gi;
		if(validRegExp.exec(NAME_OBJ.value) != null) {
			alert(MM.MSG_CFCFilenameError);
			ret = false;
			document.theForm.theName.focus();
			return ret;
		}
*/
		if (NAME_OBJ.value.match(/[\\:\*\?\<\>\|\/]/gi) != null) {
			alert(MM.MSG_CFCFilenameError);
			ret = false;
			document.theForm.theName.focus();
			return ret;
		}
	}
	if (ret) {
		if (DIRECTORY_OBJ.value == "") {
			alert(MM.MSG_CFCDirectoryRequired);
			ret = false;
			document.theForm.theDirectory.focus();
			return ret;
		}
	}
	return ret;
}



//--------------------------------------------------------------------
// FUNCTION:
//   getRelativePath
//
// DESCRIPTION:
//   This function return the relative path of a file/folder starting
//   from the site's root folder
//
// ARGUMENTS:
//   filePath - the file's/folder's path which has to be converted
//   siteRoot - the site's root path
//
// RETURNS:
//   a string containing the relative path to the file/folder starting
//   with the site's root folder
//--------------------------------------------------------------------
function getRelativePath(filePath, siteRoot) {
	if (siteRoot) {
//		var relativePath = filePath.substr(siteRoot.length-1);
		return filePath.substr(siteRoot.length-1); //relativePath;
	}
	return;
}



//--------------------------------------------------------------------
// FUNCTION:
//   getAbsolutePath
//
// DESCRIPTION:
//   This function return the absolute path of a file/folder
//
// ARGUMENTS:
//   relativePath - the file's/folder's relative path
//   siteRoot - the site's root path
//
// RETURNS:
//   a string containing the absolute path to the file/folder starting
//   with the site's root folder
//--------------------------------------------------------------------
function getAbsolutePath(relativePath, siteRoot) {
	var subPath = relativePath.substr(0, siteRoot.length).toLowerCase();
	if (subPath == siteRoot.toLowerCase()) {
		DIRECTORY_OBJ.value = getRelativePath(relativePath, siteRoot);
		return relativePath;
	}
	var path = siteRoot;
	if (path.charAt(path.length-1) == '/') {
		path = path.substr(0, path.length-1);
	}
	if (DWfile.exists(path + relativePath)) {
		return path + relativePath;
	}
	return;
}


//--------------------------------------------------------------------
// FUNCTION:
//   checkFolder
//
// DESCRIPTION:
//   This function check wether the last character of the
//   entered directory path is a "/". If not it adds a '/' at the
//   end of the path
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function checkFolder() {
	if (DIRECTORY_OBJ.value[DIRECTORY_OBJ.value.length-1] != '/') {
		DIRECTORY_OBJ.value += '/';
	}
}
