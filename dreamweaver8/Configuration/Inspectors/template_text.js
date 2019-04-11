// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//form field names:
//label - text field
//button - advanced button

// *********** GLOBAL VARS *****************************

var helpDoc = MM.HELP_inspEditableContent;

var entryText = null; 
var lastErrorText = null; 

// ******************** API ****************************
function canInspectSelection()
	{
    var dom = dw.getDocumentDOM();
  	var templateObj = dom.getSelectedNode();

	if (!dom.getIsTemplateDocument())
		return false;
 
  	if (templateObj == null || typeof templateObj["nodeType"] == "undefined")
  		return false; 
  		
  	//accept if the selected node is text or if it is the title tag 
  	if ( templateObj.nodeType == Node.ELEMENT_NODE && 
  		 (templateObj.tagName == "MMTEMPLATE:EDITABLE" 	|| 
  		  templateObj.tagName == "MM:EDITABLE" 	|| 
  		  templateObj.tagName == "MMTEMPLATE:REPEAT" 	|| 
  		  templateObj.tagName == "MMTEMPLATE:EXPR" 		|| 
  		  templateObj.tagName == "MMTEMPLATE:PASSTHROUGHREPEAT" ) )
  		{
  		return true;   		
  		}
  	
  	//Tags we can't inspect but wish we could - mostly because we don't have a dialog for them.  
  	//titleObj.tagName=="MMTEMPLATE:PARAM" 

  	return false; 
	} //canInspectSelection

function inspectSelection()
	{
  	var templateObj = dw.getDocumentDOM('document').getSelectedNode();
	
	var titleNode = dw.getDocumentDOM().getElementsByTagName("TITLE"); 
	var staticLabel = findObject("tagLabel"); 
	var editObj = findObject("nameText"); 
  var icon = findObject("temp_icon");
	entryText = null; 
	lastErrorText = null; 
	
	switch (templateObj.tagName)
		{
		case "MMTEMPLATE:EDITABLE": 
		case "MM:EDITABLE": 
			{
			titleNode.innerHTML = TITLE_Editable;
			staticLabel.innerHTML = LABEL_Editable; 
      icon.src = "template_editable.gif";
			if (typeof templateObj.name != "undefined")
				editObj.value = dwscripts.minEntityNameDecode(templateObj.name);
			entryText = editObj.value; 
			break; 
			}
			
  		case "MMTEMPLATE:PASSTHROUGHREPEAT":
  		case "MMTEMPLATE:REPEAT":
			{
			titleNode.innerHTML = TITLE_Repeat;
			staticLabel.innerHTML = LABEL_Repeat; 
      icon.src = "template_repeating.gif";
			if (typeof templateObj.name != "undefined")
				editObj.value = dwscripts.minEntityNameDecode(templateObj.name);
			entryText = editObj.value; 
			break; 
			}
			
		case "MMTEMPLATE:EXPR":
			{
			titleNode.innerHTML = TITLE_Expr;
			staticLabel.innerHTML = LABEL_Expr; 
			if (typeof templateObj.expr != "undefined")
				editObj.value = dwscripts.minEntityNameDecode(templateObj.expr);
			entryText = editObj.value; 
			break; 
			}	
		} //switch
  	
  	showHideTranslated();
	} //inspectSelection

// ******************** LOCAL FUNCTIONS ****************************

	
	
function doTextEdit()
{
  var dom = dw.getDocumentDOM();
 	var templateObj = dom.getSelectedNode();
 	var newString = findObject("nameText").value; 
      
	switch (templateObj.tagName)
		{
		case "MMTEMPLATE:EDITABLE": 	
		case "MM:EDITABLE": 	
			{
			if (!checkLegalTemplateName(newString) && lastErrorText != newString && entryText != newString)
				{
				lastErrorText = newString; 
				findObject("nameText").focus(); 
				findObject("nameText").select(); 
				return; 
				}
				
			if (findNamedEditableRegion(newString, null, templateObj, false, templateObj))
				{
				//If they touched it, and we haven't warned them about it, display message. 
				//This is to patch an infinite loop involving the selection code. 
				if (entryText != newString && lastErrorText != newString)
					{
					lastErrorText = newString; 
					
					alert(MSG_alreadyExists);
					findObject("nameText").focus(); 
					findObject("nameText").select(); 
					}
				}
			else
				templateObj.name = newString;
			break; 
			}
			
  		case "MMTEMPLATE:PASSTHROUGHREPEAT":
  		case "MMTEMPLATE:REPEAT":
  			{
			if (!checkLegalTemplateName(newString) && lastErrorText != newString && entryText != newString)
				{
				lastErrorText = newString; 
				findObject("nameText").focus(); 
				findObject("nameText").select(); 
				return; 
				}

  			templateObj.name = newString;
			break; 
			}
			
  		case "MMTEMPLATE:EXPR":
			templateObj.expr = newString;
			break; 
				
		} //switch
	} //doTextEdit

