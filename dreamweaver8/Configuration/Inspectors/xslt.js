// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
//form field names:
//label - text field

// *********** GLOBAL VARS *****************************

var xslForEachHelpDoc = MM.HELP_inspXSLForEach;
var xslIfHelpDoc = MM.HELP_inspXSLIf;
var xslChooseHelpDoc = MM.HELP_inspXSLChoose;

var entryText = null; 
var lastErrorText = null; 

// ******************** API ****************************
function canInspectSelection()
{
    	var dom = dw.getDocumentDOM();
  	var templateObj = dom.getSelectedNode();

  	if (templateObj == null || typeof templateObj["nodeType"] == "undefined")
  		return false; 
  		
  	//accept if the selected node is text or if it is the title tag 
  	if ( templateObj.nodeType == Node.ELEMENT_NODE && 
  		(templateObj.tagName == "XSL:FOR-EACH"	||
		 templateObj.tagName == "XSL:IF"	||
           	 templateObj.tagName == "XSL:WHEN"       ) )
  	{
  		return true;   		
  	}
  	
  	return false; 
} //canInspectSelection


function inspectSelection()
{    
  	var templateObj = dw.getDocumentDOM('document').getSelectedNode();		
		var staticLabel = findObject("tagLabel"); 
		var editObj = findObject("nameText"); 

	entryText = null; 
	lastErrorText = null; 
	
	switch (templateObj.tagName)
	{
  	case "XSL:FOR-EACH":
		{

			if (typeof templateObj.select != "undefined")
			{
				editObj.value = dwscripts.minEntityNameDecode(templateObj.select);
			}
			else
			{
				editObj.value = "";
			}

			entryText = editObj.value; 
			break; 
		}
  	case "XSL:IF":
		{
			if (typeof templateObj.test != "undefined")
			{
				editObj.value = dwscripts.minEntityNameDecode(templateObj.test);
			}
			else
			{
				editObj.value = "";
			}

			entryText = editObj.value; 
			break; 
		}
  	case "XSL:WHEN":
		{
			if (typeof templateObj.test != "undefined")
			{
				editObj.value = dwscripts.minEntityNameDecode(templateObj.test);
			}
			else
			{
				editObj.value = "";
			}

			entryText = editObj.value; 
			break; 
		}
	} //switch
  	
} //inspectSelection


// ******************** LOCAL FUNCTIONS ****************************
	
function doTextEdit()
{
	var dom = dw.getDocumentDOM();
 	var templateObj = dom.getSelectedNode();
 	var newString = findObject("nameText").value;
	newString = dwscripts.minEntityNameDecode(newString);
	newString = dwscripts.minEntityNameEncode(newString,true); //pass true for bXMLEncode

	switch (templateObj.tagName)
	{
  		case "XSL:FOR-EACH":
  		{
  			templateObj.select = newString;
				break; 
			}	
  		case "XSL:IF":
  		{
  			templateObj.test = newString;
				break; 
			}
  		case "XSL:WHEN":
  		{
  			templateObj.test = newString;
				break; 
			}
	} //switch
} //doTextEdit

function updateData(stringID)
{
	var currXPATHExpr = findObject("nameText").value;
	var retValue = dreamweaver.showDynamicDataDialog(currXPATHExpr, dw.loadString(stringID))
	// update the field

	if (retValue.length != 0)
	{
		findObject("nameText").value = retValue;
		// update the template object attribute
		doTextEdit();
	}
}

function displayHelp()
{
	var dom = dw.getDocumentDOM();
 	var templateObj = dom.getSelectedNode();
	//display help for xsl object since this is shared pi
	switch (templateObj.tagName)
	{
  		case "XSL:FOR-EACH":
  		{
				dwscripts.displayDWHelp(xslForEachHelpDoc);
				break; 
		}	
  		case "XSL:IF":
  		{
				dwscripts.displayDWHelp(xslIfHelpDoc);
				break; 
		}
  		case "XSL:WHEN":
  		{
				dwscripts.displayDWHelp(xslChooseHelpDoc);
				break; 
		}
	} //switch
}
