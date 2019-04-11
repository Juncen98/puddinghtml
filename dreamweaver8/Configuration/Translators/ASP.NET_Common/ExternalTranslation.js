//SHARE-IN-MEMORY=true
// Copyright 2001, 2002, 2003, 2004 Macromedia, Inc. All rights reserved.


// ===========================================================================
// HELPER FUNCTIONS
// ===========================================================================

// ----
// Function: getAttributeValueBoolean
// Purpose: Looks for tag attribute values, converts to true or false
// Arguments: code = whole tag/tag span
//    attrName = name of attribute to search for
// Return value: true if attribute is "true", false otherwise
// ----
function getAttributeValueBoolean(code, attrName)
{
	var value = TranslationManager.getAttributeValue(code, attrName).toLowerCase();
	if (value == "true")
		return true;
	else
		return false;
}

function getContents(code, tagName)
{
	var tagLength = TranslationManager.findTagLength(code);
	code = code.substr(tagLength);
	var closeExp = new RegExp("</" + tagName + ">", "i");
	var closeIndex = code.search(closeExp);
	return code.substr(0, closeIndex);
}

function getSubtag(code, subTagName, contentsOnly)
{
	var openExp = new RegExp("<" + subTagName, "i");
	var closeExp = new RegExp("</" + subTagName, "i");

	var openIndex = code.search(openExp);
	if (openIndex == -1)
	{
		// No subtag found
		return "";
	}

	var subtagPlus = code.substr(openIndex);
	var openTagLength = TranslationManager.findTagLength(subtagPlus);
	if (openTagLength == -1)
	{
		// <subtag found, with no end
		return "";
	}

	var subtag = code.substr(openIndex, openTagLength);
	if (subtag.search(/\/>$/) != -1)
	{
		// <subtag/> found
		return contentsOnly ? "" : subtag;
	}

	closeIndex = subtagPlus.search(closeExp);
	if (closeIndex == -1)
	{
		// <subtag> found, but no </subtag>
		return contentsOnly ? "" : subtag;
	}

	closeTagLength = TranslationManager.findTagLength(subtagPlus.substr(closeIndex));
	if (closeTagLength == -1)
	{
		// <subtag>...</subtag found, with no end
		return contentsOnly ? "" : subtag;
	}

	// <subtag>...</subtag> found
	return contentsOnly ? subtagPlus.substr(openTagLength, closeIndex-openTagLength) : subtagPlus.substr(0, closeIndex + closeTagLength);
}

var configPath = null;
function getImage(name)
{
	if (configPath == null)
		configPath = dw.getConfigurationPath();
	return "<img src=\"" + configPath +
		"/ThirdPartyTags/ASPNetTags/" + name + "\">";
}

function makeAsIsTranslation(displayString)
{
	return new transData("", "as is", "", "", "", displayString, "", "", false, false, false);
}

function designerMgrTranslate(code, directives, useTable, displaySyntaxErrors)
{
	var translation = new Object();
	translation.string = "";
	translation.useMacRendering = 0;

	var result = ASPNetDesignerMgr.translate(code, directives);

	if (result[1]) // designer isn't available
	{
		translation.useMacRendering = 1;
	}
	else if (!result[1] && result[2]) // designer is available, but rejected this control
	{
		if (displaySyntaxErrors)
		{
			if (useTable)
				translation.string =
					"<table border=\"1\"><tr><td><MM_ASPNETSYNTAXERROR></td></tr></table>";
			else
				translation.string = "<MM_ASPNETSYNTAXERROR>";
		}
		else
		{
			translation.useMacRendering = 1;
		}
	}
	else
	{
		translation.string = result[0];
	}

	return translation;
}

// ===========================================================================
// BASIC CONTROLS
// ===========================================================================

// ----
// ASP:HyperLink
// ----
function translateHyperLink(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, true);
	if (translation.useMacRendering)
	{
		var text = TranslationManager.getAttributeValue(code, "text");
		if (text != "")
			translation.string = "<a href=\"\">" + text + "</a>";
		else
		{
			var imageUrl = TranslationManager.getAttributeValue(code, "imageurl");
			if (imageUrl != "")
				translation.string = "<a href=\"\"><img src=\"" + imageUrl + "\"/></a>";
			else
				translation.string = "<a href=\"\">[ASP:HYPERLINK]</a>";
		}
	}
	return makeAsIsTranslation(translation.string);
}

// ----
// ASP:Image
// ----
function translateImage(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, true);
	if (translation.useMacRendering)
	{
		var imageUrl = TranslationManager.getAttributeValue(code, "imageurl");
		if (imageUrl != "")
			translation.string = "<img src=\"" + imageUrl + "\"/>";
		else
			translation.string = "[ASP:IMAGE]";
	}
	return makeAsIsTranslation(translation.string);
}

// ----
// ASP:Label
// ----
function translateLabel(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, true);
	if (translation.useMacRendering)
	{
		// Perform manual translation
		var text = TranslationManager.getAttributeValue(code, "text");
		if (text == "")
			text = "[ASP:LABEL]";
		translation.string = "<span>" + text + "</span>";
	}
	return makeAsIsTranslation(translation.string);
}

// ----
// ASP:Table
// ----
function translateTable(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, true);
	if (translation.useMacRendering)
	{
		translation.string =
			"<table border=1>" +
			"<tr><td>&nbsp; &nbsp;</td><td>&nbsp; &nbsp;</td><td>&nbsp; &nbsp;</td></tr>" +
			"<tr><td>&nbsp; &nbsp;</td><td>&nbsp; &nbsp;</td><td>&nbsp; &nbsp;</td></tr>" +
			"<tr><td>&nbsp; &nbsp;</td><td>&nbsp; &nbsp;</td><td>&nbsp; &nbsp;</td></tr>" +
			"</table>";
	}
	return makeAsIsTranslation(translation.string);
}

// ----
// ASP:AdRotator
// ----
function translateAdRotator(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, true);
	if (translation.useMacRendering)
		translation.string = getImage("AdRotator.gif");
	return makeAsIsTranslation(translation.string);
}

// ----
// ASP:Calendar
// ----
function translateCalendar(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, true);
	if (translation.useMacRendering)
		translation.string = getImage("Calendar.gif");
	return makeAsIsTranslation(translation.string);
}

// ----
// ASP:Literal
// ----
function translateLiteral(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, true);
	if (translation.useMacRendering)
	{
		var text = TranslationManager.getAttributeValue(code, "text");
		if (text != "")
			translation.string = text;
		else
			translation.string = "[ASP:Literal]";
	}
	return makeAsIsTranslation(translation.string);
}

// ----
// ASP:Panel
// ----
function translatePanelRealDom(code, transMgr)
{
	if (code.search(/^<\/asp:panel/i) != -1)
	{
		// </asp:panel>

		// Translate to </div>
		return makeAsIsTranslation("</div>");
	}
	else if (code.search(/^<asp:panel[\s\/>]/i) != -1)
	{
		// <asp:panel ...> or <asp:panel .../>

		// Add close tag if it's not an empty tag
		var strForDesigner = code;
		if (code.search(/\/\s*>$/) == -1)
		{
			strForDesigner = strForDesigner + "</asp:panel>";
		}
	
		// Translate using the panel designer and attempt to find the style attribute it generates
		var panelStyle = "";
		var translation = designerMgrTranslate(strForDesigner, "", false, false);
		if (!translation.useMacRendering)
		{
			var strTranslation = new String(translation.string);
			var re = /\s*<div\s*[^>]*style=(['"])([^'"]*)\1[^>]*>/ig;
			var theMatch = strTranslation.match(re);
			if (theMatch && (theMatch.length > 0))
			{
				panelStyle = "style=" + RegExp.$1 + RegExp.$2 + RegExp.$1 + " ";
			}
		}

		// Translate as <div>
		var strForTransData = code.replace(/^<asp:panel/i, "<div " + panelStyle);
		return makeAsIsTranslation(strForTransData);
	}
	else
	{
		// We should really only get to this function if the tag matches one of the two regular expressions above
		return makeAsIsTranslation("");
	}
}

// ----
// ASP:Xml
// ----
function translateXml(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, false);
	// There's a problem with the designer class for Xml
	// If the designer rejects the control, we'll just use the Mac-style
	// rendering.
	if (translation.useMacRendering || translation.string == "")
		translation.string = "[ASP:XML]";
	return makeAsIsTranslation(translation.string);
}


// ===========================================================================
// VALIDATORS
// ===========================================================================

// ----
// ASP:CompareValidator
// ----
function translateCompareValidator(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, true);
	if (translation.useMacRendering)
	{
		var text = TranslationManager.getAttributeValue(code, "text");
		if (text == "")
			text = TranslationManager.getAttributeValue(code, "errormessage");
		if (text == "")
			text = "[ASP:COMPAREVALIDATOR]";
		translation.string = text;
	}
	return makeAsIsTranslation(translation.string);
}

// ----
// ASP:CustomValidator
// ----
function translateCustomValidator(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, true);
	if (translation.useMacRendering)
	{
		var text = TranslationManager.getAttributeValue(code, "text");
		if (text == "")
			text = TranslationManager.getAttributeValue(code, "errormessage");
		if (text == "")
			text = "[ASP:CUSTOMVALIDATOR]";
		translation.string = text;
	}
	return makeAsIsTranslation(translation.string);
}

// ----
// ASP:RangeValidator
// ----
function translateRangeValidator(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, true);
	if (translation.useMacRendering)
	{
		var text = TranslationManager.getAttributeValue(code, "text");
		if (text == "")
			text = TranslationManager.getAttributeValue(code, "errormessage");
		if (text == "")
			text = "[ASP:RANGEVALIDATOR]";
		translation.string = text;
	}
	return makeAsIsTranslation(translation.string);
}


// ----
// ASP:RegularExpressionValidator
// ----
function translateRegularExpressionValidator(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, true);
	if (translation.useMacRendering)
	{
		var text = TranslationManager.getAttributeValue(code, "text");
		if (text == "")
			text = TranslationManager.getAttributeValue(code, "errormessage");
		if (text == "")
			text = "[ASP:REGULAREXPRESSIONVALIDATOR]";
		translation.string = text;
	}
	return makeAsIsTranslation(translation.string);
}


// ----
// ASP:RequiredFieldValidator
// ----
function translateRequiredFieldValidator(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, true);
	if (translation.useMacRendering)
	{
		var text = TranslationManager.getAttributeValue(code, "text");
		if (text == "")
			text = TranslationManager.getAttributeValue(code, "errormessage");
		if (text == "")
			text = "[ASP:REQUIREDFIELDVALIDATOR]";
		translation.string = text;
	}
	return makeAsIsTranslation(translation.string);
}


// ----
// ASP:ValidationSummary
// ----
function translateValidationSummary(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, false);
	// There's a problem with the designer class for ValidationSummary.
	// If the designer rejects the control, we'll just use the Mac-style
	// rendering.
	if (translation.useMacRendering || translation.string == "")
		translation.string = "[ASP:VALIDATIONSUMMARY]";
	return makeAsIsTranslation(translation.string);
}



// ===========================================================================
// BASIC FORM ELEMENTS
// ===========================================================================

// ----
// ASP:Button
// ----
function translateButton(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, true);
	if (translation.useMacRendering)
	{
		var text = TranslationManager.getAttributeValue(code, "text");
		if (text != "")
			translation.string = "<input type=\"submit\" value=\"" + text + "\">";
		else
			translation.string = "<input type=\"submit\" value=\"[ASP:BUTTON]\">";
	}
	return makeAsIsTranslation(translation.string);
}

// ----
// ASP:CheckBox
// ----
function translateCheckBox(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, true);
	if (translation.useMacRendering)
	{
		var text = TranslationManager.getAttributeValue(code, "text");
		var checkedAttr = "";

		if (getAttributeValueBoolean(code, "checked"))
			checkedAttr = "checked";
		if (text == "" || text == "\"\"")
			text = "[ASP:CHECKBOX]";
		translation.string = "<input type=\"checkbox\" " + checkedAttr + "/> " + text;
	}
	return makeAsIsTranslation(translation.string);
}

// ----
// ASP:ImageButton
// ----
function translateImageButton(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, true);
	if (translation.useMacRendering)
	{
		var imageUrl = TranslationManager.getAttributeValue(code, "imageurl");
		if (imageUrl != "")
			translation.string = "<input type=\"image\" border=\"0\" src=\"" + imageUrl + "\"/>";
		else
			translation.string = "[ASP:IMAGEBUTTON]";
	}
	return makeAsIsTranslation(translation.string);
}

// ----
// ASP:LinkButton
// ----
function translateLinkButton(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, true);
	if (translation.useMacRendering)
	{
		var text = TranslationManager.getAttributeValue(code, "text");
		if (text == "")
			text = "[ASP:LINKBUTTON]";
		translation.string = "<a href=\"\">" + text + "</a>";
	}
	return makeAsIsTranslation(translation.string);
}

// ----
// ASP:RadioButton
// ----
function translateRadioButton(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, true);
	if (translation.useMacRendering)
	{
		var text = TranslationManager.getAttributeValue(code, "text");
		if (text == "")
			text = "[ASP:RADIOBUTTON]";
		var checkedAttr = "";
		if (getAttributeValueBoolean(code, "checked"))
			checkedAttr = "checked";
		translation.string = "<input type=\"radio\" " + checkedAttr + "/>" + text;
	}
	return makeAsIsTranslation(translation.string);
}

// ----
// ASP:TextBox
// ----
function translateTextBox(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, true);
	if (translation.useMacRendering)
	{
		var text = TranslationManager.getAttributeValue(code, "text");
		if (text == "")
			text = "[ASP:TEXTBOX]";

		var textMode = TranslationManager.getAttributeValue(code, "TextMode");  
		if(textMode.toLowerCase() != "multiline") 
		{
			translation.string = "<input type=\"text\" value=\"" + text + "\"/>"; 
		}
		else 
		{
			translation.string = "<textarea>" + text + "</textarea>"; 
		}
	}
	return makeAsIsTranslation(translation.string);
}

// ===========================================================================
// DATABOUND FORM CONTROLS
// ===========================================================================

// ----
// ASP:CheckBoxList
// ----
function translateCheckBoxList(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, true);
	if (translation.useMacRendering)
	{
		translation.string = "<table>" +
					"<tr><td width=50><input type=\"checkbox\">&nbsp;abc</td></tr>" +
					"<tr><td><input type=\"checkbox\"> abc</td></tr>" +
					"<tr><td><input type=\"checkbox\"> abc</td></tr>" +
					"</table>";
	}
	return makeAsIsTranslation(translation.string);
}

// ----
// ASP:DropDownList
// ----
function translateDropDownList(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, true);
	if (translation.useMacRendering)
	{
		translation.string = "<select>" +
					"<option selected>abc</option>" + 
					"</select>";
	}
	return makeAsIsTranslation(translation.string);
}

// ----
// ASP:ListBox
// ----
function translateListBox(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, true);
	if (translation.useMacRendering)
	{
		translation.string = "<select size=\"3\">" +
					"<option>abc</option>" + 
					"<option>abc</option>" + 
					"<option>abc</option>" + 
					"</select>";
	}
	return makeAsIsTranslation(translation.string);
}

// ----
// ASP:RadioButtonList
// ----
function translateRadioButtonList(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, true);
	if (translation.useMacRendering)
	{
		translation.string = "<table>" +
					"<tr><td width=50><input type=\"radio\"/> abc</td></tr>" +
					"<tr><td><input type=\"radio\"/> abc</td></tr>" +
					"<tr><td><input type=\"radio\"/> abc</td></tr>" +
					"</table>";
	}
	return makeAsIsTranslation(translation.string);
}

// ===========================================================================
// DATABOUND CONTROLS
// ===========================================================================

// ----
// ASP:Repeater
// ----
function translateRepeater(code, transMgr)
{
	return null;
}

// ----
// ASP:DataGrid
// ----
function translateDataGrid(code, transMgr)
{
	if (transMgr.inEditMode)
		return null;

	var translation = designerMgrTranslate(code, "", true, true);
	var transString = new QuickString(translation.string);
	if (translation.useMacRendering)
	{
		transString.add("<table width=\"175\" border=\"1\">");
		transString.add("<tr>");
		transString.add("<td>Column0</td>");
		transString.add("<td>Column1</td>");
		transString.add("<td>Column2</td>");
		transString.add("</tr>");

		for (var i = 0; i < 6; i++)
		{
			transString.add("<tr><td>abc</td><td>abc</td><td>abc</td></tr>");
		}
		transString.add("</table>");
	}

	var outlineId = transMgr.translator.getOutlineId();
	var firstTable = new RegExp("^<table", "i");
	transString = transString.toString().replace(firstTable, "<table mmTranslatedValueShowEditButton=\"SHOWEDITBUTTON=up\" mmTranslatedValueOutline=\"OUTLINE=%22ASP:DataGrid%22\" mmTranslatedValueOutlineID=\"OUTLINEID=" + outlineId + "\"");

	var trans = makeAsIsTranslation(transString.toString());
	trans.type = "raw";
	trans.lockAttributes = "tag=asp:datagrid";

	trans.display = "<mm:toggleVisibility mode=preview select=all owner=asp:datagrid>" + 
		trans.display + 
		"<mm:toggleVisibility mode=edit owner=asp:datagrid>";
	trans.reparse = true;
	trans.useEditMode = true;
	return trans;
}

// ----
// ASP:DataList
// ----
function translateDataList(code, transMgr)
{
	if (transMgr.inEditMode)
		return null;

	var translation = designerMgrTranslate(code, "", true, true);
	var transString = new QuickString(translation.string);
	if (translation.useMacRendering)
	{
		var item = getSubtag(code, "itemtemplate", true);
		if (item != "")
			item = "<tr><td>" + item + "</td></tr>";
		var header = getSubtag(code, "headertemplate", true);
		if (header != "")
			header = "<tr><td>" + header + "</td></tr>";
		var	footer = getSubtag(code, "footertemplate", true);
		if (footer != "")
			footer = "<tr><td>" + footer + "</td></tr>";
		var altItem = getSubtag(code, "alternatingitemtemplate", true);
		if (altItem != "")
			altItem = "<tr><td>" + altItem + "</td></tr>";
		var separator = getSubtag(code, "separatortemplate", true);
		if (separator != "")
			separator = "<tr><td>" + separator + "</td></tr>";

		transString.add("<table>");
		transString.add(header);

		if (separator != "" && altItem != "")
		{
			transString.add(item);
			transString.add(separator);
			transString.add(altItem);
			transString.add(separator);
			transString.add(item);
		}
		else if (separator != "")
		{
			transString.add(item);
			transString.add(separator);
			transString.add(item);
			transString.add(separator);
			transString.add(item);
		}
		else if (altItem != "")
		{
			transString.add(item);
			transString.add(altItem);
			transString.add(item);
			transString.add(altItem);
			transString.add(item);
		}
		else
		{
			transString.add(item);
			transString.add(item);
			transString.add(item);
			transString.add(item);
			transString.add(item);
		}

		if (footer != "")
		{
		  transString.add(footer);
		}
		
		transString.add("</table>");
	}

	var outlineId = transMgr.translator.getOutlineId();
	var firstTable = new RegExp("^<table", "i");
	transString = transString.toString();

	if (transString.search(firstTable) != -1)
		transString = transString.replace(firstTable, "<table mmTranslatedValueShowEditButton=\"SHOWEDITBUTTON=up\" mmTranslatedValueOutline=\"OUTLINE=%22ASP:DataList%22\" mmTranslatedValueOutlineID=\"OUTLINEID=" + outlineId + "\"");
	else
		transString = "<table mmTranslatedValueShowEditButton=\"SHOWEDITBUTTON=up\" mmTranslatedValueOutline=\"OUTLINE=%22ASP:DataList%22\" mmTranslatedValueOutlineID=\"OUTLINEID=" + outlineId + "\"><tr><td>" + transString + "</td></tr></table>";

	var trans = makeAsIsTranslation(transString);
	trans.type = "raw";
	trans.lockAttributes = "tag=asp:datalist";
	trans.display = "<mm:toggleVisibility mode=preview select=all owner=asp:datalist>" + 
		trans.display + 
		"<mm:toggleVisibility mode=edit owner=asp:datalist>";
	trans.reparse = true;
	trans.useEditMode = true;
	return trans;
}

// ===========================================================================
// GENERIC .NET CONTROL TRANSLATION
// ===========================================================================

function translateASPControl(code, transMgr)
{
	var translation = designerMgrTranslate(code, "", false, true);
	if (translation.useMacRendering)
		translation.string = "<MM_ASPNETUNKNOWNTAG>";
	return makeAsIsTranslation(translation.string);
}

function translateCustomControl(code, transMgr)
{
	// Ignore syntax errors for custom controls... it may be that the
	// control is valid, but doesn't have a designer.
	var translation = designerMgrTranslate(code, transMgr.directives, false, false);
	if (translation.useMacRendering)
		translation.string = "<MM_ASPNETUNKNOWNTAG>";
	return makeAsIsTranslation(translation.string);
}
