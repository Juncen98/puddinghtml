//  Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//This is the code for the "Editable Tag Attributes" dialog
// ******************* GLOBALS **********************

var helpDoc = MM.HELP_extractTemplateXML;
var curSiteRootFolder = ""; 

//******************* API **********************
function commandButtons()
	{
  	return new Array(
  					MM.BTN_OK,"okClicked()",
  					MM.BTN_Cancel,"window.close()",
  					MM.BTN_Help,"displayHelp()");
	}

function isDOMRequired() {
	return false;
}
	
function canAcceptCommand()
	{			
	return (dw.getDocumentDOM() != null && dw.getFocus() != 'browser' && dw.getDocumentDOM().getParseMode() == 'html');
	} //canAcceptCommand
	
function receiveArguments()
	{	
	curSiteRootFolder = "";
	} //receiveArguments
	
	
//When the OK button is clicked, look for attributes we've touched and update them. 	
function okClicked()
	{
	var pathToExportTo = findObject("destinationFolder").value; 
	
	if (pathToExportTo == "")
		{
		alert(MSG_No_Dir); 
		return; 		
		}
		
	//display message if the path doesn't exist. 
	if (!DWfile.exists(pathToExportTo))
		{
		alert(MSG_Does_Not_exist); 
		return;		
		}
		
	//display message if it's the same as the site folder. 
	if (pathToExportTo == curSiteRootFolder)
		{
		alert(MSG_sameAsRoot); 
		return; 		
		}
	
	//Also display message if the new folder is inside the site root folder. 
	if (pathToExportTo.indexOf(curSiteRootFolder) != -1)
		{
		alert(MSG_insideRoot); 
		return; 		
		}
		
	var wantXMLFiles = findObject("wantXMLFiles").checked;
	var changedFilesOnly = findObject("changedFilesOnly").checked;
	
	//Save the preferences. 
	var notesFile = MMNotes.open(curSiteRootFolder, true); 	
	if (notesFile)
		{
		MMNotes.set(notesFile, "exportXMLFolder", findObject("destinationFolder").value); 
		MMNotes.set(notesFile, "wantXMLFiles", wantXMLFiles ? "TRUE" : "FALSE"); 
		MMNotes.set(notesFile, "changedFilesOnly", changedFilesOnly ? "TRUE" : "FALSE"); 
		}
	MMNotes.close(notesFile);	
	
		//Call the native
	dw.extractTemplateXML(site.getCurrentSite(), pathToExportTo, wantXMLFiles, changedFilesOnly);
	//close the window
	window.close(); 
	} //okClicked

	
//***************** LOCAL FUNCTIONS  ******************
	
//Init the UI - load the layer objects, build the popups and move the values of the current attribute into the controls. 
function initializeUI()
	{		
	//look for a prefs string for this site and pre-load it. Pre-set the checkboxes. 
	curSiteRootFolder = site.getLocalRootURL(site.getCurrentSite()); 
	
	if (curSiteRootFolder == null || curSiteRootFolder == "")
		{
		alert(MSG_NoSiteSelected); 
		window.close();
		return; 		
		}
	
	var wantXMLFiles = true; 
	var changedFilesOnly = true; 
	var exportXMLFolder = ""; 
		
	var notesFile = MMNotes.open(curSiteRootFolder, true); 
	if (notesFile)
		{
		var temp = MMNotes.get(notesFile, "exportXMLFolder"); 
		
		if (temp != null && temp != "")
			exportXMLFolder = temp; 
			
		wantXMLFiles = (MMNotes.get(notesFile, "wantXMLFiles") != "FALSE"); 
		changedFilesOnly = (MMNotes.get(notesFile, "changedFilesOnly") != "FALSE"); 
		}
	MMNotes.close(notesFile);	
	
	findObject("destinationFolder").value = exportXMLFolder; 
	
	var xmlBox = findObject("wantXMLFiles");
	xmlBox.checked = wantXMLFiles; 
	
	var changedBox = findObject("changedFilesOnly");
	changedBox.checked = changedFilesOnly; 
	} //initializeUI

//Browse for the folder to extract to, set the text field accordingly. 
function browseForFolder()
	{
	var newDirectory = dreamweaver.browseForFolderURL(MSG_PickFolder, findObject("destinationFolder").value);
	if (newDirectory.length > 0 && newDirectory.charAt(newDirectory.length-1) != '/')
		newDirectory += '/';
	if (newDirectory != null && newDirectory != "") 
		findObject("destinationFolder").value = newDirectory; 
	} //browseForFolder