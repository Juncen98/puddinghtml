//  Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//form fields:
//Background - multiple list listing background colors
//Text - multiple list listing text colors. Contents change when new Background item picked.

// ******************* GLOBALS **********************

var helpDoc = MM.HELP_orphanedTemplateContent;

//WARNING THESE ARE ALSO DEFINED IN DialogOrphanedContent.cpp
var const_choose = "_MM:choose"; 
var const_nowhere = "_MM:nowhere"; 

var orphanNames = null;

//This is the data passed into the dialog, and this is used to return data as well. If declared in C, this 
//object would look something like this: 
//struct { 
//		params; 						//Object representing the orphaned params, filled with destination data. 
//										//This is an object where the attribute names are the names of the orphaned 
//										//fields, and the values are the destination fields ("" to start)
//		editable; 						//same for editable regions
//		repeats;  						//same for repeats; 
//		
//		const destParams; 				//array of field names for destination parameters
//		const destEditable; 			//same for editable
//		const destRepeats; 				//same for repeats
//
//		const repeatScope; 				//if non-null, this is the name of the repeat in which we are resolving fields 
//										//recursively. This is used in the dialog text only. If null, we're at the root of the 
//										//template. 
//		const docFilePath;		//full path of the instance file we are running this dialog for.
//		returnValue;					//passed in as -1, set to 1 for success, 0 for cancel. 
//		};

var dialogData = null;
var PLATFORM = navigator.platform;
var itemListMgr = null; //ListControlClass controlling the 'resolve' control at the bottom of the dialog. 

//******************* API **********************


//Just grab the first argument and stuff it into a global. 
function receiveArguments()
	{	
	if (false)
		{
		dialogData = new Object();
		dialogData.params = new Object();
		dialogData.params.param1 = ""; 
		dialogData.params.param2 = ""; 
		dialogData.params.param3 = ""; 
					
		dialogData.editable = new Object();
		dialogData.editable.editable1 = ""; 
		dialogData.editable.editable2 = ""; 
		dialogData.editable.editable3 = ""; 

		dialogData.repeats = new Object();
		dialogData.repeats.repeats1 = ""; 
		dialogData.repeats.repeats2 = ""; 
		dialogData.repeats.repeats3 = "";
		
		dialogData.destParams = ["paramDest1", "paramDest2", "paramDest3"]; 
		dialogData.destEditable = ["editableDest1", "editableDest2", "editableDest3"]; 
		dialogData.destRepeats = ["repeatDest1", "repeatDest2", "repeatDest3"]; 
		
		dialogData.repeatScope = null; 
		docFilePath.docFilePath = "Some Path"; 
		
		dialogData.returnValue = -1; 
		}	
	else
		{
		dialogData = arguments[0];
		dialogData.destParams.sort();
		dialogData.destEditable.sort();
		dialogData.destRepeats.sort();
		}
	}


function countOrphans()
	{
	if (dialogData == null)
		receiveArguments();
		
	var myCount = 0; 
	
	for (param in dialogData.params)
		myCount = myCount + 1;
		
	for (editable in dialogData.editable)
		myCount = myCount + 1;
		
	for (repeat in dialogData.repeats)
		myCount = myCount + 1;
	
	return myCount;
	} //countOrphans


//Called when the 'set all' button is clicked - this places all orphaned content in the currently selected field. 

function setAllForNode(node, category)
	{
	if (category == "" || (typeof node["category"] != 'undefined' && node.category == category) )
		StoreCurValuesInNode(node);

	for (var i=0;i<node.childNodes.length; i++)
		setAllForNode(node.childNodes[i], category);
	} //setAllForNode
	
function setAll()
	{	
	var selectedTreeNode = findObject("theTreeControl").selectedNodes[0];
	var category = selectedTreeNode.category; 

	var curValue = itemListMgr.getValue(); 
	
	if (curValue == const_nowhere || curValue == const_choose ) 
		category = ""; 

	setAllForNode(findObject("theTreeControl"), category);
	} //setAll
	
	
function cmdOK()
	{
	if (packageFormData())
		{
		dialogData.returnValue = 1; 
		window.close();
		}
	} //cmdOK


function cmdCancel()
{
  dialogData.returnValue = 0; 
  window.close();
}

	

//***************** LOCAL FUNCTIONS  ******************

//Load localizable text into the named span object at boot time. 
function LoadLocalizedText(spanName, contentString)
	{
	var theObj = findObject(spanName); 
	if (theObj)
		theObj.innerHTML = contentString; 
	} //LoadLocalizedText
	
function initializeUI()
	{
	if (dialogData == null)
		{
		alert("missing data!"); 
		window.close();
		return; 
		}

	LoadLocalizedText("popupLabel", LABEL_Popup);
		
	if (typeof dialogData.repeatScope == 'undefined' || dialogData.repeatScope == null || dialogData.repeatScope == "")
		LoadLocalizedText("dialogMessage", dwscripts.sprintf(LABEL_DialogMessage, dialogData.docFilePath));
	else 	
		{
		LoadLocalizedText("dialogMessage", dwscripts.sprintf(LABEL_nestingMessage, dialogData.repeatScope));
		}
		
	if (itemListMgr == null)
		itemListMgr =  new ListControl('itemList', null, false);

	itemListMgr.disable();
	
  	SetupTree();
  	SetResolveControls();
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
	theStream.push("<mm:treecolumn name='", LABEL_ResolvedCol, "' value='", LABEL_ResolvedCol, "'  width='230' />"); 
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
	
//Add the string for a single node in the tree. Should look something like: 
//<mm:treenode  value = "Conditional 1|<Not Resolved>" id=0 category="params" ></mm:treenode> 
function AddParamNode(paramString, catString, theStream, labelString)
	{	
	var theString = "<mm:treenode  value = '" + paramString + "|" + labelString + "' id='" + paramString  + "' category='" + catString + "' ></mm:treenode>"; 
	theStream.push(theString); 
	} //AddParamNode
	
		
	
//Build and insert the inner HTML for the tree control
function SetupTree()
	{	
	var theStream = new Array();
	theStream.push("");
	 
	AddCategoriesToTreeStream(theStream);
	
	var labelString; 
	
	var i; 
	var count = 0; 
	var temp = new Array(); 
	for (i in dialogData.params)
		{		
		temp.push(i);
		} 
	temp.sort(); 
	
	var tempValue; 
	
	for (i in temp)	
		{
		if (count == 0)
			OpenCatNode(LABEL_OptionalContent, theStream); 
		
		tempValue = dialogData.params[temp[i]]; 
		labelString = (tempValue == null || tempValue == "") ? LABEL_NotResolved : tempValue;
		
		AddParamNode(temp[i], "params", theStream, labelString);	
		count++;
		}
	if (count > 0)
		CloseCatNode(theStream);
	
	count = 0;
	temp = new Array(); 
	for (i in dialogData.repeats)
		temp.push(i); 
	temp.sort(); 
	
	for (i in temp)	
		{
		if (count == 0)
			OpenCatNode(LABEL_RepeatingContent, theStream); 

		tempValue = dialogData.repeats[temp[i]]; 
		labelString = (tempValue == null || tempValue == "") ? LABEL_NotResolved : tempValue;
		AddParamNode(temp[i], "repeats", theStream, labelString);	
		count++;
		}
	if (count > 0)
		CloseCatNode(theStream);
	
	count = 0; 
	count = 0;
	temp = new Array(); 
	
	for (i in dialogData.editable)
		temp.push(i); 
	temp.sort(); 
	
	for (i in temp)	
		{
		if (count == 0)
			OpenCatNode(LABEL_EditableRegions, theStream); 
			
		tempValue = dialogData.editable[temp[i]]; 
		labelString = (tempValue == null || tempValue == "") ? LABEL_NotResolved : tempValue;

		AddParamNode(temp[i], "editable", theStream, labelString);	
		count++;
		}
	if (count > 0)
		CloseCatNode(theStream);
			
	findObject("theTreeControl").innerHTML = theStream.join(""); 	
	} //SetupTree
	

function PopulatePopup(destNames)
	{
	var defaultNames = [MSG_choose, MSG_delete]; 
	var defaultValues = [const_choose, const_nowhere]; 

	var popupNames = defaultNames.concat(destNames); 
	var popupValues = defaultValues.concat(destNames); 
	itemListMgr.setAll(popupNames, popupValues);
	} //SetResolveOptionForField
	
	
// changes the 'resolve' popup to show the possibilities for the current node
function SetResolveControls()
	{
	var selectedNodes = findObject("theTreeControl").selectedNodes; 
	var selectedTreeNode = null; 
	if (selectedNodes && selectedNodes.length > 0)
		 selectedTreeNode = selectedNodes[0];
	
	if (!selectedTreeNode || selectedTreeNode.id == -1)
		{
		//DISABLE THE SELECT
		itemListMgr.disable();

		return; 
		}
			
	//POPULATE THE SELECT POPUP
	var destNames = null; 
	if (selectedTreeNode.category == "params")
		destNames = dialogData.destParams; 
	else if (selectedTreeNode.category == "repeats")
		destNames = dialogData.destRepeats; 
	else if (selectedTreeNode.category == "editable")
		destNames = dialogData.destEditable; 
	
	PopulatePopup(destNames);	
	itemListMgr.enable();
	
	//Code here for setting the control to the selected value. 
	var theSplit = selectedTreeNode.getAttribute("value").split("|"); 
	
	itemListMgr.setIndex(0);
	
	//Select the item with the same visible value as this tree node. 
	var len = itemListMgr.getLen(); 
	for (var i=0;i<len;i++)
		if (itemListMgr.get(i) == theSplit[1])
			{
			itemListMgr.setIndex(i); 
			break; 
			}
	} //SetResolveControls


//Once the user picks an entry from the list, store it back in the dialogData object
function StoreNodeValue(nodeID, nodeCategory, resolveString)
	{
	dialogData[nodeCategory][nodeID] = resolveString; 
	} //StoreNodeValue
	

function StoreCurValuesInNode(node)
	{
	if (!node || node.id == -1)
		return; 
	
	if (node.tagName != "MM:TREENODE")
		return; 
		
	//Store the value selected
	StoreNodeValue(node.id, node.category, itemListMgr.getValue());
	
	//Show the visible value in the tree control.
	var resolvedString = itemListMgr.get(); //Get the visible value here, so it's clear to the user. 
	
	//Update the visible string of this item. 
	var splitArray = node.getAttribute("value").split("|"); 
	var newString = splitArray[0] + "|" + resolvedString; 
	node.setAttribute("value",newString);
	}
		
// store the current setting of the popup in the selected tree control 
function ResolveCurrentNode()
	{
	var selectedTreeNode = findObject("theTreeControl").selectedNodes[0];

	StoreCurValuesInNode(selectedTreeNode);
	} //ResolveCurrentNode


//Called when one of the controls changes, this either resets the popup menu to reflect the current 
//selected node, or stores the resolution in the tree and data store
function updateUI(itemName)
	{
  	switch(itemName)
  		{
	  	case "theTreeControl":
	  		{
			SetResolveControls();

	    	break;
	  		}
	  		
	  	case "itemList":
	  		{
	  		ResolveCurrentNode();
	    	break;
	  		}
	  		
	  	} //switch
	} //updateUI


//Check to see if any of the attributes of this object contain an empty 
//string, if so, return false (we're not ready to return) otherwise return true. 
function CheckResultObj(theObject)
	{
	var i; 
	
	for (i in theObject)
		{
		if (theObject[i] == null || theObject[i] == "" || theObject[i] == const_choose )
			{
			alert(MSG_mustChoose);
			return false;
			}
		}
		
	return true; 
	} //CheckResultObj
	
	
//Check to see if we can exit. 
function packageFormData()
	{
	return (	CheckResultObj(dialogData.params) && 
		 		CheckResultObj(dialogData.editable) &&
		 		CheckResultObj(dialogData.repeats)); 		
	} //packageFormData
	


