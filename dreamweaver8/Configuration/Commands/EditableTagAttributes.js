//  Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved. 
 
//This is the code for the "Editable Tag Attributes" dialog 
 
// ******************* GLOBALS ********************** 
 
var helpDoc = MM.HELP_editableTagAttributes; 
 
 
//I cache the DOM objects for the layers, so I don't have to search for them all the time.  
// var editControlsHTML = null;  
var noControlsLayer = null;  
var noControlsHTML = null; 

//The layer we manipulate when the controls change - cached here so we don't have to find it each time.  
// var targetLayer = null;  
 
//This is the currently visible control layer.  
var editControlsVisible = true; 
 
//Grab the selected tag when we are launched. The dialog effects this tag.  
var selectedTag = null;  
 
//Store a list of the attribute names for the tag. This is separate from the tag because we  
//may add new names as part of this dialog.  
var attrNames = null;  
 
//List controller for the list of attributes popup 
var attrListController = null; 
 
//the name of the attribute the dialog is currently focused on. All changes go to this attribute 
var curSelectedAttr = "";  
 
//This object stores information about how the tag should be changed.  
//each attribute to change has a corresponding attribute here, which contains  
//an object that looks like:  
//		label - the new label 
//		attr_type  - the new type 
//		defaultValue  - the new default 
//		editable - booleanm set to false if the attribute isn't editable  
//		touched - if we have made a change to this attribute 
var edits = null;  
 
var abortCommand = false;  
var abortMessage = ""; 

//******************* API ********************** 
 
function commandButtons() 
	{ 
  	return new Array( 
  					MM.BTN_OK,"okClicked()", 
  					MM.BTN_Cancel,"window.close()", 
  					MM.BTN_Help,"displayHelp()"); 
	} 
 
 
function isDOMRequired() { 
	return true; 
} 
 
function canAcceptCommand()	 
	{ 
	var curDOM = dw.getDocumentDOM();  
	if (curDOM == null || !dw.canSaveDocumentAsTemplate(curDOM)) 
		return false;  
    
  if (dw.getDocumentDOM().getIsLibraryDocument() || dw.getDocumentDOM().getParseMode() != 'html'){
    return false;
  }
	 
	var selNode = dw.getDocumentDOM().getTagSelectorTag();  
	if (selNode == null)  
		{ 
		var sels = dw.getDocumentDOM().getSelection(false, false); 
		if (sels.length >= 2) 
			selNode = dw.getDocumentDOM().offsetsToNode(sels[0], sels[1], false); 
		} 
		 
	var isLegalNode = ( selNode != null &&  
						selNode.tagName != "MMTEMPLATE:EDITABLE" 	&&  
						selNode.tagName != "MMTEMPLATE:IF" 		&&  
						selNode.tagName != "MMTEMPLATE:REPEAT" 	&&  
						selNode.tagName != "MMTEMPLATE:EXPR" 	&&  
						selNode.tagName != "MMTEMPLATE:PARAM" 	&&  
						selNode.tagName != "MMTINSTANCE:PARAM" 	&&  
						selNode.tagName != "MMTINSTANCE:EDITABLE" 	&&  
						selNode.tagName != "MMTINSTANCE:REPEATENTRY" );	 
	 
	if (selNode != null && !isLegalNode) 
		return false;   
 
	//Always return true if this isn't explicitly bad - we will apply it to the body tag if nothing else.  
	return (dw.getFocus() != 'browser');  
	} //canAcceptCommand 
	 
function nodeIsContainedInTagOfType(node, tagType)
	{
	var curNode = node; 
	
	while (curNode != null)
		{
		var curName = curNode.tagName;
		if (curNode.tagName == "BODY" || curNode.tagName == "HTML")
			return false; 
			
		if (curNode.tagName == tagType)
			return true; 
		
		curNode = curNode.parentNode;
		}
	
	return false; 
	} //nodeIsContainedInTagOfType
		

	 
//Just grab the first argument and stuff it into a global.  
function receiveArguments() 
	{	 	
	abortCommand = false;  
		 
	if (!CheckWarnNoTemplate( dw.getDocumentDOM())) 
		{
		abortCommand = true; 
		alert(MM.MSG_EditAttrNoTemplate);
 		return "abort"; 
 		}
 		
	selectedTag =  dw.getDocumentDOM().getTagSelectorTag();  
	if (selectedTag == null)  
		{ 
		var sels = dw.getDocumentDOM().getSelection(false, false); 
		selectedTag = dw.getDocumentDOM().offsetsToNode(sels[0], sels[1], false); 
		} 
		 
	if (selectedTag == null || selectedTag.nodeType != Node.ELEMENT_NODE) 
		selectedTag = dw.getDocumentDOM().getElementsByTagName("BODY").item(0); 
	 
	if (selectedTag == null || typeof selectedTag == "undefined" || selectedTag.nodeType != Node.ELEMENT_NODE) 
		{
		abortCommand = true;  
		return "abort"; 
		}
		 
	var isInEditable = 	(nodeIsContainedInTagOfType(selectedTag, "MMTEMPLATE:EDITABLE") ||  
    				 nodeIsContainedInTagOfType(selectedTag, "MM:EDITABLE"));  
 
	if (isInEditable) 
		{
		abortCommand = true;  
		alert(MM.MSG_InEdit);
		return "abort";
		}
		
	//Make sure that the range we're going to edit isn't locked (which it will be if we are in a template instance or nested template, or 
	//library item). 
	if (!abortCommand)
		{
		var offsets = dw.getDocumentDOM().nodeToOffsets(selectedTag);

		// If selectedTag is a non-empty tag, it's okay to have locked regions
		// (such as dynamic text) inside the tag.
		if (selectedTag.hasChildNodes)
			{
			var childNodes = selectedTag.childNodes;
			if (childNodes.length > 0)
				{
				var childOffsets = dw.getDocumentDOM().nodeToOffsets(childNodes[0]);
				offsets[1] = childOffsets[0];
				}
			}
		
		if (dw.getDocumentDOM().rangeContainsLockedRegion(offsets[0], offsets[1]))
			{
			abortCommand=true;
			 
			alert(MM.MSG_EditAttrLocked); 
			return "abort"; 
			}
		}
		
	edits = new Object(); 
	} //receiveArguments 
	 
 
 
	 
	 
//When the OK button is clicked, look for attributes we've touched and update them. 	 
function okClicked() 
	{ 
	var curEdit;  
	var curDOM = dw.getDocumentDOM(); 
		 
	//clear the don't show flag - it's only local to one run of the dialog.  
 
	if (nodeIsContainedInTagOfType(selectedTag, "MMTEMPLATE:EDITABLE") ||  
	    nodeIsContainedInTagOfType(selectedTag, "MM:EDITABLE") )  
		{ 
		alert(MSG_cantMakeEditableAttrHere);  
		window.close(); 
		return; 		 
		} 
 
 
	//make sure everything is cool, first 
	for (i in edits) 
		{ 
		curEdit = edits[i];  
		 
		if (curEdit.touched &&  
			curEdit.editable) 
			{ 
			var isExpression = isExpressionString(curEdit.label, false);		 
			if (isExpression && !RunDSConfirmDialog(dwscripts.sprintf(MSG_exprWarning, curEdit.label), "editableAttributeExprWarning", true)) 
				return; 
			 
			if (!checkInsertTemplateParam(dw.getDocumentDOM())) 
				{ 
				window.close(); 
				return; 
				} 
				 
			if (!checkLegalTemplateName(curEdit.label)) 
				{ 
				//Don't close the window - let the user fix the name. 
				return;  
				} 
			} 
		} 
		 
	 
	//OK, go ahead and do it all.  
	for (i in edits) 
		{ 
		curEdit = edits[i];  
		 
		if (curEdit.touched) 
			{ 
			if (curEdit.editable) 
				{ 
				//Write out a parameter tag.  
				var useExistingParam = false;  
				 
				var existingParam = getTemplateParamTag(curEdit.label, dw.getDocumentDOM()); 				 
				if (existingParam != null /* && existingParam.type != curEdit.attr_type */) 
					{ 
					var messageString = dwscripts.sprintf(MSG_paramExists, curEdit.label, existingParam.type);  
					useExistingParam = RunDSConfirmDialog_YesNoCancel(messageString, "existingParamWarning_" + curEdit.label, 1); 
					if (useExistingParam == -1) 
						return; //Cancel out, let them finish the dialog, change the name of the param.  
					} 
				 
				if (!useExistingParam) 
					insertTemplateParam(	curEdit.label,  
											curEdit.attr_type,  
											curEdit.defaultValue,  
											dw.getDocumentDOM()); 
					 
				dw.getDocumentDOM().synchronizeDocument(); 
				dw.getDocumentDOM().disableLocking(); 
				selectedTag.setAttribute(i,"@@(" + encodeTemplateParam(curEdit.label, true) + ")@@");  
				dw.getDocumentDOM().enableLocking(); 
				dw.getDocumentDOM().synchronizeDocument(); 
				} 
			else 
				{ 
				if (typeof curEdit["defaultValue"] != 'undefined') 
					selectedTag[i] = curEdit["defaultValue"]; 
				else 
					selectedTag[i] = ""; 
				} 
			} 
		} 
	window.close(); 
	} //cmdOK 
 
 
	 
 
//***************** LOCAL FUNCTIONS  ****************** 

 
//Init the UI - load the layer objects, build the popups and move the values of the current attribute into the controls.  
function initializeUI() 
	{		 
	if (abortCommand)  
		{ 
		window.close(); 
		dw.beep(); 
		
		if (abortMessage != "")
			alert(abortMessage); 
			
		abortMessage = "";
		abortCommand = false; 
		return; 
		}
	
	//We can get called here without having receiveArguments get called, if the command 
	//is replayed from the history panel. 	
	if (selectedTag == null)
		{
		receiveArguments(); 
		
		if (selectedTag.attributes == null || abortCommand)
			{
			window.close(); 
			return;
			}
		}
 
	//Find the layer objects.  
	// var editControlsLayer = findObject("editableControls"); 	 
	// editControlsHTML = editControlsLayer.innerHTML;  
	// noControlsLayer = findObject("hiddenControls");  
	
	
	noControlsHTML = 	"<TABLE border=0>\n" 	+ 
    				  	"	<TR>\n" 			+
      				 	"	<TD colspan=2>\n" 	+ 
      				 	MSG_notEditableMessage 	+ 
      					"	</TD>\n" 			+ 
   						"	</TR>\n" 			+ 
   						"<TR><TD colspan=2><BR><BR></TD></TR>" +
						"	</TABLE>"; 
	
	
	// targetLayer = findObject("editableControls"); 
	attrListController = new ListControl("tagAttr"); 
	ReadAttrNamesAndValues(); 
	PopulatePopup(); 
	document.theForm.editCheck.checked = true;  
	 
	var messageSpan = findObject("messageSpan");  
	messageSpan.innerHTML = errMsg(messageSpan.innerHTML, selectedTag.tagName); 
	 
	curSelectedAttr = "";  
	if (attrListController.getLen() > 0)  
		{ 
		curSelectedAttr = attrListController.get(0); 
		attrListController.setIndex(0); 
		} 
		 
	if (curSelectedAttr == "") 
		{ 
		document.theForm.editCheck.checked = false;  
		FixControlLayers(); 
		document.theForm.editCheck.disabled = true;  
		} 
		 
  	MoveValuesToControls(); 
	} //initializeUI 
 
 
//Return true if this string begins with @@( and ends with )@@.
function ValueHasEditAnnotation(attrValue) 
	{ 
	if (attrValue.length < 6) 
		return false;  
		 
	return (attrValue.indexOf("@@(") == 0 && 
			attrValue.lastIndexOf(")@@") == attrValue.length - 3);
	 
	} //valueHasEditAnnotation 
	 
	 
//Return the value stripped of it's expression annotation, if any.  
function StripEditAnnotation(attrValue) 
	{ 
	if (!ValueHasEditAnnotation(attrValue)) 
		return attrValue;  
	
	var bumperLen = "@@(".length;
	return attrValue.substring(bumperLen,attrValue.length-bumperLen); 
	} //StripEditAnnotation 
	 
	 
//scan the tag, read out the attrs it has currently, and also read whether they are currently editable. 
function ReadAttrNamesAndValues() 
	{
	attrNames = new Array(); 
	
	var attrs = selectedTag.attributes;  
	if (typeof attrs == 'undefined') 
		return;  
	 
	for (i=0; i < attrs.length; i++) 
		{ 
		var curString = attrs[i].name; 
		attrNames.push(curString.toUpperCase());  
		 
		//Load the current values for this attribute from the document. 
		var curEdit = GetEditForAttr(curString.toUpperCase()); 
		if (curEdit == null)
			continue; 
			
		curEdit.editable = ValueHasEditAnnotation(attrs[i].value);  
		 
		var valueHasEdit = ValueHasEditAnnotation(attrs[i].value);  
		 
		if (valueHasEdit) 
			{ 
			var paramName = StripEditAnnotation(attrs[i].value); 
			curEdit.label = decodeTemplateParam(paramName);  
			} 
		else 
			{ 
			curEdit.label = attrs[i].name;  
			curEdit.defaultValue = attrs[i].value;  
			curEdit.attr_type = "text"; 
			} 
			 
		curEdit.touched = false;  
		 
		var paramTag = null;  
		 
		if (valueHasEdit && !isExpressionString(curEdit.label, false)) 
			paramTag = getTemplateParamTag(curEdit.label, null);  
		 
		if (paramTag != null) 
			{ 
			curEdit.attr_type = paramTag["type"];  
			curEdit.defaultValue = paramTag.value; 			 
			} 
			 
		} 
		 
	} //ReadAttrNamesAndValues 
	 
	 
//Select the given Attr in the attributes popup 
function SelectAttr(newAttr) 
	{ 
	curSelectedAttr = newAttr;  
	attrListController.pickValue(newAttr); 
	} //SelectAttr 
	 
	 
//Populate the attributes popup with the current list of names. 
function PopulatePopup() 
	{ 
	attrListController.setAll(attrNames, attrNames); 
	} //PopulatePopup 
 
 
	 
//Turn the appropriate control layer on, based on the edit Check.  
function FixControlLayers() 
	{	
	
	if (!document.theForm.editCheck.checked) 
		{					 
		//targetLayer.innerHTML = noControlsLayer.innerHTML; 
		//targetLayer.innerHTML = noControlsHTML;
		 
		editControlsVisible = false; 
		
		document.theForm.attrType.disabled = true; 
		document.theForm.defaultValue.disabled = true; 
		document.theForm.label.disabled = true; 
		
		return; 	 
		} 
	else 
		{ 
		//targetLayer.innerHTML = editControlsHTML;  
		editControlsVisible = true;  
		document.theForm.attrType.removeAttribute("disabled"); 
		document.theForm.defaultValue.removeAttribute("disabled"); 
		document.theForm.label.removeAttribute("disabled"); 
		
		return;  	 
		} 
	} //FixControlLayers 
		 
 
 
//Move the values currently stored in this parameter into the controls.  
function MoveValuesToControls() 
	{ 
 
	var curAttrName = curSelectedAttr;  
	var canEdit = false;  
	var attrLabel = "";  
	var defaultValue = "";  
	var attrType = "text";  
								 
	if (typeof edits[curAttrName] != 'undefined') 
		{ 
		//Load whatever we have stored.  
		canEdit = edits[curAttrName].editable;  
		attrLabel = edits[curAttrName].label;  
		defaultValue = edits[curAttrName].defaultValue;  
		attrType = edits[curAttrName].attr_type;  
		} 
	else if (curAttrName != "") 
		{ 
		//default based on the attr name and tag name.  
		canEdit = true;  
		attrType = GetDefaultAttrType(curAttrName, selectedTag.tagName);  
		} 
		 
	document.theForm.editCheck.checked = canEdit;  
	FixControlLayers();  
	 
	if (canEdit) 
		{ 
		var controller = new ListControl("attrType", null, true);  
		controller.pickValue(attrType);  
		if (typeof document.theForm.defaultValue != undefined && document.theForm.defaultValue != null)
			document.theForm.defaultValue.value = defaultValue;  
			
		if (typeof document.theForm.label != undefined && document.theForm.label != null)
			{
			document.theForm.label.value = attrLabel;  
			 
		  	document.theForm.label.focus(); //set focus on textbox 
		  	document.theForm.label.select(); //set insertion point into textbox 
	  		}
		} 
	} //MoveValuesToControls 
	 
	 
//Given an attribute and a tag, return the default type for it. 	 
function GetDefaultAttrType(attrName, tagName) 
	{ 
	switch (attrName) 
		{ 
		case "bgColor":  
		case "background":  
			return "color";  
		 
		default:  
			return "text"; 		 
		} 
	} //GetDefaultAttrType 
	 
 
//Return the edit record for the attr of this name.  
function GetEditForAttr(attrName) 
	{ 
	if (attrName == "") 
		return null;  
		 
	if (typeof edits[attrName] == 'undefined') 
		edits[attrName] = new Object();  
		 
	return edits[attrName];	 
	} //GetEditForAttr 
	 
 
 
//Store the current control settings into the current attribute. 
function StoreAttrValue() 
	{ 
	if (curSelectedAttr == "" || !document.theForm.editCheck.checked) 
		return;  
		 
	var curEdit = GetEditForAttr(curSelectedAttr); 
	if (curEdit == null)
		return; 
		
	curEdit.editable = document.theForm.editCheck.checked;  
 
 
	var typePopup = findObject("attrType");  
	var selectedIndex = typePopup.selectedIndex;  
 
	var newType = "text";  
	 
	if (selectedIndex != -1) 
		newType= typePopup.options[selectedIndex].value;  
	 
	if (curEdit.label != document.theForm.label.value ||  
		curEdit.attr_type != newType ||  
		curEdit.defaultValue != document.theForm.defaultValue.value) 
		{ 
		curEdit.label = document.theForm.label.value; 
		curEdit.attr_type = newType;  
		curEdit.defaultValue = document.theForm.defaultValue.value; 
		curEdit.touched = true;  
		} 
		 
	} //StoreAttrValue 
	 
	 
	 
//Called when one of the controls changes, this will store the data, or change the control layers, etc. 
function updateUI(itemName) 
	{	 
  	switch(itemName) 
  		{ 
		case "tagAttr":  
			{	 
			curSelectedAttr = attrListController.getValue(); 			//switch to the new attr 
			//curSelectedAttr = attrListController.object.options[attrListController.object.selectedIndex].value;  
			 
			MoveValuesToControls(); 									//Show the values for the new attr 
			break; 
			} 
  		 
  		case "editCheck":  
			{ 
			var curEdit = GetEditForAttr(curSelectedAttr);  
			if (curEdit == null)
				return; 
				
			curEdit.editable = document.theForm.editCheck.checked;  
			curEdit.touched = true;  
			 
			FixControlLayers(); 		//Update the visible controls 
			 
			if (curEdit.editable) 
				MoveValuesToControls(); //Display the current state, if needed 
			break; 
			} 
 
		case "attrType":  
		case "label":  
		case "defaultValue":  
			{			 
			StoreAttrValue(); 
			break; 
			} 
					 
	  	} //switch 
	} //updateUI 
 
 
//Called when the "Add Attribute" button is clicked on, this runs a getString dialog, adds the attribute name 
//to the local cache, and sets the controls to this attribute - this won't change the tag until the OK button is clicked 
//in the main dialog. 
function addAttribute() 
	{ 
	var result = new Object();  
	result.returnValue = null;  
	 
	dw.runCommand("GetString.htm", errMsg(MSG_newAttr, selectedTag.tagName), "", MSG_newAttrTitle, result);  
	 	
	if (result.returnValue != null && result.returnValue != "") 
		{ 
		StoreAttrValue(); //Store the old values before we switch the dialog 
		 
		var newAttr = result.returnValue.toUpperCase(); 
		var found = false;  
		 
		for (i=0; i<attrNames;i++) 
			if (attrNames[i] == newAttr) 
				{ 
				found = true;  
				break; 
				} 
		 
		if (!found) 
			{ 
			attrNames.push(newAttr);  
			PopulatePopup(newAttr); 
			} 
		 
		//make sure the check is checked, and fix the control layers. 
		document.theForm.editCheck.checked = true;  
		document.theForm.editCheck.removeAttribute("disabled");  
		SelectAttr(newAttr);  
		MoveValuesToControls(); 
		} 
	} //AddAttribute