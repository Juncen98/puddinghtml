// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//form field names:
//label - text field
//button - advanced button

// *********** GLOBAL VARS *****************************

var helpDoc = MM.HELP_inspOptionalContent;
var inspectedNode = null; 

// ******************** API ****************************
function canInspectSelection()
	{
    var dom = dw.getDocumentDOM();
  	var templateObj = dom.getSelectedNode();
  	
  	//accept if the selected node is text or if it is the title tag 
  	if (templateObj && templateObj.nodeType == Node.ELEMENT_NODE && 
  		  templateObj.tagName == "MMTEMPLATE:IF" )
  		{
  	
  		return true;   		
  		}
  	
  	return false; 
	} //canInspectSelection


function inspectSelection()
	{
  	inspectedNode =  dw.getDocumentDOM('document').getSelectedNode();
  	
	if (inspectedNode != null && typeof inspectedNode["cond"] != "undefined")
		{
		var myString = decodeTemplateParam(dwscripts.minEntityNameDecode(inspectedNode.cond) ); 
		myString = dwscripts.minEntityNameEncode(myString); 
		findObject("textLabel").innerHTML =  dwscripts.sprintf(LABEL_cond, myString); 
		}

  	showHideTranslated();
	} //inspectSelection


// ******************** LOCAL FUNCTIONS ****************************

function doButtonClick()
	{
	dw.runCommand("InsertConditionalContent.htm", null, "useSelectedNode", inspectedNode);	
	} //doButtonClick
	
	