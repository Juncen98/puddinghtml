//  Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//form fields:
//Background - multiple list listing background colors
//Text - multiple list listing text colors. Contents change when new Background item picked.

// ******************* GLOBALS **********************

var helpDoc = MM.HELP_templateProperties;

//This is the data passed into the dialog, and this is used to return data as well. If declared in C, this 
//object would look something like this: 
//struct { 
//		values; 						//Set of all the template parameters that can be changed 
//										//in this dialog. This is an object where the attributes
//										//are the names of the params, and the values 
//										//are the param values.
//		types;							//The types for all the params in the dialog. This is an
//										//object, the attributes are the template attributes, and 
//										//the values are either "boolean", "number", "color" , "text", "URL"
//										// NOTE: 'CHOICES' IS NOT CURRENTLY SUPPORTED
//		passthrough;					//object containing a boolean for each attribute, whether it is passthrough or not.
//		returnValue;					//passed in as -1, set to 1 for success, 0 for cancel. 
//		};

var dialogData = null;
var isFake = false; //Used for debugging 

var PLATFORM = navigator.platform;

//I cache the DOM objects for the layers, so I don't have to search for them all the time. 
var boolControlLayer = null; 
var numberControlLayer = null; 
var colorControlLayer = null; 
var textControlLayer = null; 
var linkControlLayer = null; 
var noControlLayer = null; 
var passthroughSpan = null; 
var passthroughSpanHTML = null; 


var targetLayer = null; 

//This is the currently visible control layer. 
var curVisibleLayer = null;

var errorPending = false; 


// ******************* API **********************

//--------------------------------------------------------------------
// FUNCTION:
//   commandButtons
//
// DESCRIPTION:
//   The list of buttons to display on the right of the dialog,
//   along with the functions to call when they are pressed.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   javascript array
//--------------------------------------------------------------------

function commandButtons()
{
  if (dw.appName == "Contribute")
  {
    return new Array( "PutButtonsOnBottom",
                      "OkButton",        MM.BTN_OK,     "cmdOK()",
                      "CancelButton",    MM.BTN_Cancel, "cmdCancel()",
                      "ApplyButton",     MM.BTN_Apply,  "cmdApply()",
                      "PutButtonOnLeft", MM.BTN_Help,   "displayHelp()" );
  }
  else
  {
    return new Array( MM.BTN_OK,     "cmdOK()",
                      MM.BTN_Cancel, "cmdCancel()",
                      MM.BTN_Help,   "displayHelp()" );
  }
}



function isDomRequired() {return true;} 

//Just grab the first argument and stuff it into a global. 
function receiveArguments()
	{		
		dialogData = dw.getDocumentDOM().getTemplateParameters();
		if (dialogData == null)
		{
			alert(MSG_CantRun); 
			return "abort";
		}
	}


function canAcceptCommand()
	{	
		var curDOM = dw.getDocumentDOM(); 	
		if (curDOM == null)
			return false; 

		//dialogData = dw.getDocumentDOM().getTemplateParameters();
		//if (dialogData == null)
		//	return false;
			
		return (curDOM.getAttachedTemplate().length > 0);
	} //canAcceptCommand
	
function cmdOK()
	{
	if (!isFake)
		{
		var curDOM = dw.getDocumentDOM();
		curDOM.disableLocking();
		if (!curDOM.setTemplateParameters(dialogData))
			return; 
		}
		
	if (errorPending)
		return; 
		
	dialogData.returnValue = 1; 
	window.close();
	} //cmdOK

function cmdApply ()
	{
	if (!isFake)
		{
		var curDOM = dw.getDocumentDOM();
		curDOM.disableLocking();
		if (!curDOM.setTemplateParameters(dialogData))
			return; 
		}
		
	if (errorPending)
		return; 
		
	dialogData.returnValue = 1; 
 
}

function cmdCancel()
	{
  	dialogData.returnValue = 0; 
  	window.close();
	} //cmdCancel

	

//***************** LOCAL FUNCTIONS  ******************
	
function initializeUI()
	{
	errorPending = false; 
	if (dialogData == null)
		{
		window.close(); 
		//alert(MSG_CantRun); 
		return; 
		}
		
	//Find the layer objects. 
	boolControlLayer = findObject("booleanControls", null); 	
	numberControlLayer = findObject("numberControls", null); 
	colorControlLayer = findObject("colorControls", null); 
	textControlLayer = findObject("textControls", null); 
	linkControlLayer = findObject("linkControls", null); 
	noControlLayer = findObject("noControls", null); 

	passthroughSpan = findObject("passthroughSpan", null); 
  
  // find the table
  var tableObj = findObject("mainTable");
  if (dw.isOSX()){
    tableObj.setAttribute("height","300");
  }
	
	if (passthroughSpanHTML == null) 
		passthroughSpanHTML = passthroughSpan.innerHTML; 
	
	targetLayer = findObject("visibleSpan", null);
	curVisibleLayer = noControlLayer; 
	
  	SetupTree();
  	SetupControls();
  window.resizeToContents(); 
  	//FixControlLayers(null);
	} //initializeUI


function adjustButtons()
{
  var theStyle;
  if (PLATFORM=="Win32")
  {
    theStyle=document.okLayer.getAttribute("STYLE");
    theStyle=theStyle.replace(/left:\w*;/,LEFT_LAYER).replace(/top:\w*;/,TOP_LAYER);
    document.okLayer.setAttribute("STYLE", theStyle);
    theStyle=document.cancelLayer.getAttribute("STYLE");
    theStyle=theStyle.replace(/left:\w*;/,RIGHT_LAYER).replace(/top:\w*;/,TOP_LAYER);
    document.cancelLayer.setAttribute("STYLE", theStyle);
  }
}

//Add the 'categories' tag to the string stream
function AddCategoriesToTreeStream(theStream)
	{
	theStream.push("<mm:treecolumn name='", LABEL_NameCol, "' value='", LABEL_NameCol, "'  width='200'/>"); 
	theStream.push("<mm:treecolumn name='", LABEL_ValueCol, "' value='", LABEL_ValueCol, "' width='130'/>"); 
	} //AddCategoriesToTreeString
	
	
//Add the treenode for this category to the innerHTML string for the tree node
function OpenCatNode(labelString, theStream)
	{
	theStream.push("<mm:treenode selected value = '",labelString,"' id=-1 state='expanded'>");
	} //AddCatNodeToString
	
function CloseCatNode(theStream)
	{
	theStream.push("</mm:treenode>");
	}

function GetVisibleValueString(paramName)
	{
	if (dialogData == null)
		return "";

	if (dw.appName != "Contribute")
		{
		if (dialogData.passthrough[paramName])
			return LABEL_Passthrough;
		}
		
	if (dialogData.types[paramName] == "boolean")
		{
		var paramValue = dialogData.values[paramName]; 
		return (paramValue == "true") ? LABEL_TRUE : LABEL_FALSE; 
		}
		
	return dialogData.values[paramName];
	} //GetVisibleValueString
	
	
//Add the string for a single node in the tree. Should look something like: 
//<mm:treenode  value = "Conditional 1|<Not Resolved>" paramName="some name" valueType="number" ></mm:treenode> 
function AddParamNode(paramName, theStream, selected)
	{	
	//var selectedString = selected ? "selected" : ""; 
	var selectedString = ""; 
	
	theStream.push("<mm:treenode  value = '", paramName,  "|", GetVisibleValueString(paramName),  
					  "' paramName='", paramName, "' valueType='", dialogData.types[paramName], "' ", selectedString , " ></mm:treenode>"); 
	} //AddParamNode
	
	
//Build and insert the inner HTML for the tree control
function SetupTree()
	{	
	var theStream = new Array();
	theStream.push("");
	 
	AddCategoriesToTreeStream(theStream);
	
	var i; 
	var count = 0; 
	
	//Sort the list of params alphabetically. 
	var paramNames = new Array(); 
	for (i in dialogData.values)
		paramNames.push(i); 
	paramNames.sort();
	
	//Add them to the tree
	for (i=0; i<paramNames.length; i++)
		{
		AddParamNode(paramNames[i], theStream, count==0);	
		count++;
		}
	
	if (count == 0)
		theStream.push("<mm:treenode  value = '" + LABEL_NoParams + " | ' 	paramName='bar' valueType='none' ></mm:treenode>");
			
	//var theTree = findObject("theTreeControl", null); 
	var theTree = dwscripts.findDOMObject("theTreeControl", null); 
	theTree.innerHTML = theStream.join(""); 
  	if (theTree.treeNodes.length > 0){
    	theTree.treeNodes[0].selected = true;
  	}
	} //SetupTree
	

	
//Everything is off unless on
function FixControlLayers(selectedTreeNode)
	{		
	if (selectedTreeNode == null || selectedTreeNode.valueType == 'none')
		{					
		targetLayer.innerHTML = noControlLayer.innerHTML; 
		curVisibleLayer = noControlLayer; 	
		passthroughSpan.innerHTML = ""; 
		return; 	
		}
	
	// In Ringo, don't show the "pass through" checkbox, because it
	// only makes sense when authoring nested templates.
	if (dw.appName == "Contribute")
		{
		passthroughSpan.innerHTML = "";
		}
	else
		{
		passthroughSpan.innerHTML = passthroughSpanHTML;

		if (dialogData.passthrough[selectedTreeNode.paramName])
			{
			targetLayer.innerHTML = LABEL_Passthrough; 
			document.theForm.passthroughCheck.checked = true; 
			curVisibleLayer = noControlLayer;
			return;  	
			}
		
		document.theForm.passthroughCheck.checked = false;
		}

	var newActiveLayer = noControlLayer; 

	switch (selectedTreeNode.valueType)
		{
		case "boolean":
			newActiveLayer = boolControlLayer;  break;
		case "number":
			newActiveLayer = numberControlLayer;  break;
		case "color":
			newActiveLayer = colorControlLayer; break;
		case "text":
			newActiveLayer = textControlLayer;  break;
		case "link":
		case "URL":
			newActiveLayer = linkControlLayer; break;
		}
		
	if (curVisibleLayer != newActiveLayer)
		{
		targetLayer.innerHTML = newActiveLayer.innerHTML; 
		curVisibleLayer = newActiveLayer; 
		}		
	
	//Customize the string for the selected value
	var showString = selectedTreeNode.paramName; 
	if (selectedTreeNode.valueType == "boolean")
		showString = errMsg(LABEL_Show, selectedTreeNode.paramName);
		
	var labelSpan = findObject("propLabel", null); 
	if (labelSpan != null)
		labelSpan.innerHTML = showString; 
} //FixControlLayers
		

//Move the values currently stored in this parameter into the controls for it's type. 
function MoveValuesToControl(selectedNode)
	{
	if (selectedNode == null || selectedNode.valueType == 'none')
		return; 
	
	var attrName = selectedNode.paramName; 
	if (dialogData.passthrough[attrName])
		return; //No controls in this case 
		
	var controlName = ""; 
	var controlObj = null;
	switch (selectedNode.valueType)
		{
		case "boolean": controlName = "booleanCheck"; 	break;
		case "number": 	controlName = "numberField"; 	break; 
		case "color": 	controlName = "colorField";  	break;
		case "text": 	controlName = "textField"; 	 	break;	
		
		case "link": 	
		case "URL": 	
			controlName = "linkField";  	break;
		}
	
	if (controlName == "")
		return; 
		
	//Select the control...
	var controlObj = findObject(controlName, null); 
	
	if (controlObj != null)
		{
		
		//If this is a text control, move the focus into it. 
		if (controlName == "booleanCheck")	
			controlObj.checked = (dialogData.values[attrName] == "true");
		else
			{
			controlObj.value = dialogData.values[attrName];
			if (typeof controlObj["focus"] != "undefined")
	  			controlObj.focus(); //set focus on textbox
	  			
			if (typeof controlObj["select"] != "undefined")
	  			controlObj.select(); //set insertion point into textbox
			}
			
		if (selectedNode.valueType == "color")
			{
			controlObj = findObject("colorPicker", null); 
			if (controlObj != null)
				controlObj.value = dialogData.values[attrName];
			}
		}

	} //MoveValuesToControl
	
		
	
// changes the 'resolve' popup to show the possibilities for the current node
function SetupControls()
	{
	var theTree = findObject("theTreeControl", null); 
	
	var selectedTreeNode = theTree.selectedNodes[0];	
	FixControlLayers(selectedTreeNode);
	MoveValuesToControl(selectedTreeNode);
	
	if (selectedTreeNode)
		selectedTreeNode.selected = true; //some bug in the tree control...
	} //SetupControls


//Once the user picks an entry from the list, store it back in the dialogData object
function StoreNodeValue()
	{
	var selectedNode = findObject("theTreeControl", null).selectedNodes[0];
	if (selectedNode == null)
		return false; 
		
	var controlObj = null; 
	var attrName = selectedNode.paramName; 
	
	switch (selectedNode.valueType)
		{
		case "boolean":
			{
			controlObj = findObject("booleanCheck", null); 		
			var isChecked = false; 
			if (typeof	controlObj.checked == "string")
				isChecked = (controlObj.checked == "true"); 
			else
				isChecked = controlObj.checked; 
				
			if (controlObj != null)
				dialogData.values[attrName] = isChecked ? "true" :  "false";
			break;
			}
			
		case "number":
			{
			controlObj = findObject("numberField", null); 
			if (controlObj != null)
				{
				var controlValue = controlObj.value; 
				if (isNaN(controlValue))
					{
					if (errorPending)
						return false;  

					alert(MSG_isNAN);
					errorPending = true; 
 
					return false; 
					}
				dialogData.values[attrName] = controlObj.value;
				}
				
			break;
			}

		case "color":
			{
			controlObj = findObject("colorField", null); 
			if (controlObj != null)
				dialogData.values[attrName] = controlObj.value;
			break;
			}
			
		case "text":
			{
			controlObj = findObject("textField", null); 
			if (controlObj != null)
				dialogData.values[attrName] = controlObj.value;
			break;
			}
			
		case "URL":
		case "link":
			{
			controlObj = findObject("linkField", null); 
			if (controlObj != null)
				dialogData.values[attrName] = controlObj.value;
			break;
			}
		}
		
	errorPending = false;
	if (dw.appName == "Contribute")
		dialogData.passthrough[attrName] = false;
	else
		dialogData.passthrough[attrName] = document.theForm.passthroughCheck.checked;
	
	var newNodeString = attrName + "|" + GetVisibleValueString(attrName); 
	selectedNode.value = newNodeString; 
	return true; 
	} //StoreNodeValue
	
	
	
//Called when one of the controls changes, this either resets the popup menu to reflect the current 
//selected node, or stores the resolution in the tree and data store
function updateUI(itemName)
	{
  	switch(itemName)
  		{
	  	case "theTreeControl":
	  		{
			SetupControls();

	    	break;
	  		}
	  		
		case "colorField": 
	  	case "colorPicker":
	  		{	  		
	  		//If the user types into the color field, move the data into the colorPicker field, 
	  		//and then store the value. 
			var fieldObj = findObject("colorField", null); 
			var pickerObj = findObject("colorPicker", null); 
			
			if (fieldObj != null && pickerObj != null)
				{
				if (itemName == "colorField")
					pickerObj.value = fieldObj.value; 
				else
					{
					//alert("setting field to " + pickerObj.value);
					fieldObj.value = pickerObj.value; 
					}
				}
				
			StoreNodeValue();
			break; 
	  		}
	  	
	  	case "boolCheck":
	  	case "textField":
	  	case "linkField": 
	  	case "numberField": 
	  		{
	  		StoreNodeValue();
	    	break;
	  		}
		
		case "passthroughCheck": 
			{
			if (dw.appName != "Contribute")
				{
				var selectedNode = findObject("theTreeControl", null).selectedNodes[0];
				if (selectedNode == null)
					return; 
								
				var attrName = selectedNode.paramName; 
				var isPassthrough = document.theForm.passthroughCheck.checked; 
				dialogData.passthrough[attrName] = isPassthrough;
			
				var newNodeString = attrName + "|" + GetVisibleValueString(attrName); 
				selectedNode.value = newNodeString; 

				FixControlLayers(selectedNode);
						
				//Pull the old values out.
				if (!isPassthrough)
					MoveValuesToControl(selectedNode);
				}
			break; 
			}
				
	  	} //switch
	} //updateUI


