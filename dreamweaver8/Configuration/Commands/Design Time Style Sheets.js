// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
/***************** GLOBAL VARIABLES *****************/
	
var LIST_INCLUDED;
var LIST_EXCLUDED;

var helpDoc = MM.HELP_cmdDesignTimeCSS;
	
/******************* API FUNCTIONS ******************/

function canAcceptCommand()
{
	// enable the menu item only if the document has been saved
	
	var filePath = dreamweaver.getDocumentPath("document");
	
	// also check if to see if the file is saved and there is a dom
	var retVal = ((filePath!=null && filePath.length > 0) 
					&& (dw.getFocus() == 'document' || dw.getFocus() == 'textView' || dw.getFocus(true) == 'html') 
					&& dw.getDocumentDOM()!=null);
	return retVal;
	
}

function commandButtons(){
  return new Array(MM.BTN_OK,"doCommand()",MM.BTN_Cancel,"window.close()",MM.BTN_Help,"displayHelp()");
}


/****************** LOCAL FUNCTIONS *****************/

function initUI(){
	// initialize form fields
	LIST_INCLUDED = new ListControl("included");
	LIST_EXCLUDED = new ListControl("excluded");

	// Initialize from the design notes
	var foundNotes = false;
	var filePath = dreamweaver.getDocumentPath("document");
	if (filePath) {
		var metaFile;
		metaFile = MMNotes.open(filePath, false);
		if (metaFile) {
			foundNotes = true;
			
			var includeString = MMNotes.get(metaFile, 'MM_css_include');
			var includes = (includeString == "")?new Array(0):includeString.split(',');
			for (var i=0; i < includes.length; i++){
				LIST_INCLUDED.append(includes[i],includes[i]);
				LIST_INCLUDED.setIndex(0);
			}

			if (LIST_INCLUDED.getLen() > 0){
				LIST_INCLUDED.setIndex(0);
			}

			var excludeString = MMNotes.get(metaFile, 'MM_css_exclude');
			var excludes = (excludeString == "")?new Array(0):excludeString.split(',');
			for (var i=0; i < excludes.length; i++){
				LIST_EXCLUDED.append(excludes[i],excludes[i]);
			}

			if (LIST_EXCLUDED.getLen() > 0){
				LIST_EXCLUDED.setIndex(0);
			}


			MMNotes.close(metaFile);
		}
	}
}

//*********************************************************************************
// doCommand()
//
// Called when user clicks the OK button. Updates the design note with the lists
// of included and excluded style sheets.
//
//*********************************************************************************
function doCommand(){

	// if we were called from the UI (rather than arguments passed to 
	// runCommand), then save includes and excludes text for next call to the command
	var path = dw.getDocumentDOM().URL;
	var metaFile;
	metaFile = MMNotes.open(path, true);
	if (metaFile) {
		if (LIST_INCLUDED.getLen() > 0){
			MMNotes.set(metaFile, 'MM_css_include', LIST_INCLUDED.getValue('all'));
		}else{
			MMNotes.set(metaFile, 'MM_css_include', "");
		}
		
		if (LIST_EXCLUDED.getLen() > 0){
			MMNotes.set(metaFile, 'MM_css_exclude', LIST_EXCLUDED.getValue('all'));
		}else{
			MMNotes.set(metaFile, 'MM_css_exclude', "");
		}
		
		MMNotes.close(metaFile);
	}

	// reload the document to fresh styles
	dw.getDocumentDOM().refreshViews();

	window.close();
}

//*********************************************************************************
// addSS()
//
// Called when user clicks the + button. Opens a Browse dialog box that lets the
// user choose a stylesheet; when the OK button in that dialog box is clicked,
// the selected stylesheet is added to the list.
//
// arguments:
// -	theList is the ListControl object that should be updated.
//
//*********************************************************************************
function addSS(theList){
	var newStyleSheet = dw.browseForFileURL();
	if (!theList.pickValue(newStyleSheet)){
		if (newStyleSheet != ""){
			theList.append(newStyleSheet,newStyleSheet);
		}
	}else{
		alert(MSG_ALREADY_THERE);
	}
}

//*********************************************************************************
// removeSS()
//
// Called when user clicks the + button. Opens a Browse dialog box that lets the
// user choose a stylesheet; when the OK button in that dialog box is clicked,
// the selected stylesheet is added to the list.
//
// arguments:
// -	theList is the ListControl object that should be updated.
//
//*********************************************************************************
function removeSS(theList){
	theList.del();
}
