// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

var outlineId = 1000;

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



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function : getAttributeValue
// Purpose  : pull the ID attribute for the current tag
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function getAttributeValue(argNode, attrName)
{
  var attrValue;
    attrValue = argNode.getAttribute(attrName);
  if (!attrValue)
  {
		attrValue = "";	
  }
  return attrValue;
}


var configPath = null;
function getImage(name)
{
	if (configPath == null)
		configPath = dw.getConfigurationPath();
	return "<img src=\"" + configPath +
		"/ThirdPartyTags/ASPNetTags/" + name + "\">";
}


function getSubtag(node, subTagName, contentsOnly)
{
	var subTagContents="";
	if (node)
	{
		var childNodes = node.childNodes;
		for (var i= 0; i < childNodes.length;i++)
		{
			if (childNodes[i].tagName && 
				childNodes[i].tagName.toLowerCase() == subTagName)
			{
				if (contentsOnly)
				{
					subTagContents = childNodes[i].innerHTML;
				}
				else
				{
					subTagContents = childNodes[i].outerHTML;
				}
				break;
			}				
		}
	}
	return subTagContents;
}




// ===========================================================================
// BASIC CONTROLS
// ===========================================================================


// ----
// ASP:HyperLink
// ----
function translateHyperLink(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
		{
			var text = getAttributeValue(node, "text");
			if (text != "")
				translation.string = "<a href=\"\">" + text + "</a>";
			else
			{
				var imageUrl = getAttributeValue(node, "imageurl");
				if (imageUrl != "")
					translation.string = "<a href=\"\"><img src=\"" + imageUrl + "\"/></a>";
				else
					translation.string = "<a href=\"\">[ASP:HYPERLINK]</a>";
			}
		}
		renderStr = translation.string;
	}
	return renderStr;
}



// ----
// ASP:Image
// ----
function translateImage(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
		{
			var imageUrl = getAttributeValue(node, "imageurl");
			if (imageUrl != "")
				translation.string = "<img src=\"" + imageUrl + "\"/>";
			else
				translation.string = "[ASP:IMAGE]";
		}
		renderStr = translation.string;
	}
	return renderStr;
}

// ----
// ASP:Label
// ----
function translateLabel(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
		{
			// Perform manual translation
			var text = getAttributeValue(node, "text");
			if (text == "")
				text = "[ASP:LABEL]";
			translation.string = "<span>" + text + "</span>";
		}
		renderStr = translation.string;
	}
	return renderStr;
}


// ----
// ASP:Table
// ----
function translateTable(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
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
		renderStr = translation.string;
	}
	return renderStr;
}

// ----
// ASP:AdRotator
// ----
function translateAdRotator(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
			translation.string = getImage("AdRotator.gif");
		renderStr = translation.string;
	}
	return renderStr;
}

// ----
// ASP:Calendar
// ----
function translateCalendar(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
			translation.string = getImage("Calendar.gif");
		renderStr = translation.string;
	}
	return renderStr;
}

// ----
// ASP:Literal
// ----
function translateLiteral(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
		{
			var text = getAttributeValue(node, "text");
			if (text != "")
				translation.string = text;
			else
				translation.string = "[ASP:Literal]";
		}
		renderStr = translation.string;
	}
	return renderStr;
}

// ----
// ASP:Panel
// ----
function translatePanel(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
		{
			var contents = node.innerHTML;
			if (contents != "")
				translation.string = "<div>" + contents + "</div>";
			else
				translation.string = "[ASP:Panel]";
		}
		renderStr = translation.string;
	}
	return renderStr;
}

// ----
// ASP:PlaceHolder
// ----
function translatePlaceHolder(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
			translation.string = "[ASP:PlaceHolder]";
		renderStr = translation.string;
	}
	return renderStr;
}

// ----
// ASP:Xml
// ----
function translateXml(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, false);
		// There's a problem with the designer class for Xml
		// If the designer rejects the control, we'll just use the Mac-style
		// rendering.
		if (translation.useMacRendering || translation.string == "")
			translation.string = "[ASP:XML]";
		renderStr = translation.string;
	}
	return renderStr;
}

// ===========================================================================
// VALIDATORS
// ===========================================================================

// ----
// ASP:CompareValidator
// ----
function translateCompareValidator(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
		{
			var text = getAttributeValue(node, "text");
			if (text == "")
				text = getAttributeValue(node, "errormessage");
			if (text == "")
				text = "[ASP:COMPAREVALIDATOR]";
			translation.string = text;
		}
		renderStr = translation.string;
	}
	return renderStr;
}

// ----
// ASP:CustomValidator
// ----
function translateCustomValidator(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
		{
			var text = getAttributeValue(node, "text");
			if (text == "")
				text = getAttributeValue(node, "errormessage");
			if (text == "")
				text = "[ASP:CUSTOMVALIDATOR]";
			translation.string = text;
		}
		renderStr = translation.string;
	}
	return renderStr;
}


// ----
// ASP:RangeValidator
// ----
function translateRangeValidator(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
		{
			var text = getAttributeValue(node, "text");
			if (text == "")
				text = getAttributeValue(node, "errormessage");
			if (text == "")
				text = "[ASP:RANGEVALIDATOR]";
			translation.string = text;
		}
		renderStr = translation.string;
	}
	return renderStr;
}


// ----
// ASP:RegularExpressionValidator
// ----
function translateRegularExpressionValidator(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
		{
			var text = getAttributeValue(node, "text");
			if (text == "")
				text = getAttributeValue(node, "errormessage");
			if (text == "")
				text = "[ASP:REGULAREXPRESSIONVALIDATOR]";
			translation.string = text;
		}
		renderStr = translation.string;
	}
	return renderStr;
}


// ----
// ASP:RequiredFieldValidator
// ----
function translateRequiredFieldValidator(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
		{
			var text = getAttributeValue(node, "text");
			if (text == "")
				text = getAttributeValue(node, "errormessage");
			if (text == "")
				text = "[ASP:REQUIREDFIELDVALIDATOR]";
			translation.string = text;
		}
		renderStr = translation.string;
	}
	return renderStr;
}


// ----
// ASP:ValidationSummary
// ----
function translateValidationSummary(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, false);
		// There's a problem with the designer class for ValidationSummary.
		// If the designer rejects the control, we'll just use the Mac-style
		// rendering.
		if (translation.useMacRendering || translation.string == "")
			translation.string = "[ASP:VALIDATIONSUMMARY]";
		renderStr = translation.string;
	}
	return renderStr;
}




// ===========================================================================
// BASIC FORM ELEMENTS
// ===========================================================================

// ----
// ASP:Button
// ----

function translateButton(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
		{
			var text = getAttributeValue(node, "text");
			if (text != "")
				translation.string = "<input type=\"submit\" value=\"" + text + "\">";
			else
				translation.string = "<input type=\"submit\" value=\"[ASP:BUTTON]\">";
		}
		renderStr = translation.string;
	}
	return renderStr;
}


// ----
// ASP:CheckBox
// ----
function translateCheckBox(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
		{
			var text = getAttributeValue(node, "text");
			var checkedAttr = "";
			if (getAttributeValue(node, "checked") == "true")
				checkedAttr = "checked";
			if (text == "" || text == "\"\"")
				text = "[ASP:CHECKBOX]";
			if (getAttributeValue(node, "textalign") == "left")
				translation.string = text + " <input type=\"checkbox\" " + checkedAttr + "/>";
			else
				translation.string = "<input type=\"checkbox\" " + checkedAttr + "/> " + text;
		}
		renderStr = translation.string;
	}
	return renderStr;
}

// ----
// ASP:ImageButton
// ----
function translateImageButton(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
		{
			var imageUrl = getAttributeValue(node, "imageurl");
			if (imageUrl != "")
				translation.string = "<input type=\"image\" border=\"0\" src=\"" + imageUrl + "\"/>";
			else
				translation.string = "[ASP:IMAGEBUTTON]";
		}
		renderStr = translation.string;
	}
	return renderStr;
}

// ----
// ASP:LinkButton
// ----
function translateLinkButton(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
		{
			var text = getAttributeValue(node, "text");
			if (text == "")
				text = "[ASP:LINKBUTTON]";
			translation.string = "<a href=\"\">" + text + "</a>";
		}
		renderStr = translation.string;

		if ((renderStr.search(/href/i) == -1) && (renderStr.substr(0, 3).toLowerCase() == "<a "))
		{
			renderStr = renderStr.substr(0, 3) + "href=\"\" " + renderStr.substr(3);
		}
	}
	
	return renderStr;
}

// ----
// ASP:RadioButton
// ----
function translateRadioButton(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
		{
			var text = getAttributeValue(node, "text");
			if (text == "")
				text = "[ASP:RADIOBUTTON]";
			var checkedAttr = "";
			if (getAttributeValue(node, "checked") == "true")
				checkedAttr = "checked";
			if (getAttributeValue(node, "textalign") == "left")
				translation.string = text + " <input type=\"radio\" " + checkedAttr + "/>";
			else
				translation.string = "<input type=\"radio\" " + checkedAttr + "/> " + text;
		}
		renderStr = translation.string;
	}
	return renderStr;
}

// ----
// ASP:TextBox
// ----
function translateTextBox(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
		{
			var text = getAttributeValue(node, "text");
			if (text == "")
				text = "[ASP:TEXTBOX]";

			var textMode = getAttributeValue(node, "TextMode"); 
			if(textMode.toLowerCase() != "multiline") 
			{
				translation.string = "<input type=\"text\" value=\"" + text + "\"/>"; 
			}
			else 
			{
				translation.string = "<textarea>" + text + "</textarea>"; 
			}

		}
		renderStr = translation.string;
	}
	return renderStr;
}


// ===========================================================================
// DATABOUND FORM CONTROLS
// ===========================================================================

// ----
// ASP:CheckBoxList
// ----
function translateCheckBoxList(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
		{
			translation.string = "<table>" +
						"<tr><td width=50><input type=\"checkbox\">&nbsp;abc</td></tr>" +
						"<tr><td><input type=\"checkbox\"> abc</td></tr>" +
						"<tr><td><input type=\"checkbox\"> abc</td></tr>" +
						"</table>";
		}
		renderStr = translation.string;
	}
	return renderStr;
}

// ----
// ASP:DropDownList
// ----
function translateDropDownList(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
		{
			translation.string = "<select>" +
						"<option selected>abc</option>" + 
						"</select>";
		}
		renderStr = translation.string;
	}
	return renderStr;
}

// ----
// ASP:ListBox
// ----
function translateListBox(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
		{
			translation.string = "<select size=\"3\">" +
						"<option>abc</option>" + 
						"<option>abc</option>" + 
						"<option>abc</option>" + 
						"</select>";
		}
		renderStr = translation.string;
	}
	return renderStr;
}

// ----
// ASP:RadioButtonList
// ----
function translateRadioButtonList(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
		{
			translation.string = "<table>" +
						"<tr><td width=50><input type=\"radio\"/> abc</td></tr>" +
						"<tr><td><input type=\"radio\"/> abc</td></tr>" +
						"<tr><td><input type=\"radio\"/> abc</td></tr>" +
						"</table>";
		}
		renderStr = translation.string;
	}
	return renderStr;
}

// ===========================================================================
// DATABOUND CONTROLS
// ===========================================================================

// ----
// ASP:Repeater
// ----
function translateRepeater(node)
{
	var renderStr = "";
	return renderStr;
}

// ----
// ASP:DataGrid
// ----
function translateDataGrid(node)
{
	var renderStr="";
	if (node)
	{
		var code = node.outerHTML;
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
		var firstTable = new RegExp("^<table", "i");
		transString = transString.toString().replace(firstTable, "<table mmTranslatedValueOutlineId=\"OUTLINEID=" + outlineId + "\" mmTranslatedValueOutline=\"OUTLINE=ASP:DataGrid\"");
		outlineId++;
		renderStr = transString;
	}
	return renderStr;
}


// ----
// ASP:DataList
// ----
function translateDataList(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", true, true);
		var transString = new QuickString(translation.string);
		if (translation.useMacRendering)
		{
			var item = getSubtag(node, "itemtemplate", true);
			if (item != "")
				item = "<tr><td>" + item + "</td></tr>";
			var header = getSubtag(node, "headertemplate", true);
			if (header != "")
				header = "<tr><td>" + header + "</td></tr>";
			var	footer = getSubtag(node, "footertemplate", true);
			if (footer != "")
				footer = "<tr><td>" + footer + "</td></tr>";
			var altItem = getSubtag(node, "alternatingitemtemplate", true);
			if (altItem != "")
				altItem = "<tr><td>" + altItem + "</td></tr>";
			var separator = getSubtag(node, "separatortemplate", true);
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
		var firstTable = new RegExp("^<table", "i");
		transString = transString.toString();
		if (transString.search(firstTable) != -1)
			transString = transString.replace(firstTable, "<table mmTranslatedValueOutlineId=\"OUTLINEID=" + outlineId + "\" mmTranslatedValueOutline=\"OUTLINE=ASP:DataList\"");
		else
			transString = "<table mmTranslatedValueOutlineId=\"OUTLINEID=" + outlineId + "\" mmTranslatedValueOutline=\"OUTLINE=ASP:DataList\"><tr><td>" + transString + "</td></tr></table>";
		outlineId++;
		renderStr = transString;
	}

	return renderStr;
}


// ===========================================================================
// GENERIC .NET CONTROL TRANSLATION
// ===========================================================================

function translateASPControl(node)
{
	var renderStr = "";
	if (node)
	{
		var code = node.outerHTML;
		var translation = designerMgrTranslate(code, "", false, true);
		if (translation.useMacRendering)
			translation.string = "<MM_ASPNETUNKNOWNTAG>";
		renderStr = translation.string;
	}
	return renderStr;
}

var strTranslation = "";
var ascxDOM = null;
var ascxCode = "";
var skipStartOffset = -1;
var skipEndOffset = -1;
var offsetToBeginOfOpen = -1;

function scannerOpenTagBegin(tag, offset)
{
	offsetToBeginOfOpen = -1;
	var node = ascxDOM.offsetsToNode(offset, offset+1, false);
	if (node && (offset > skipEndOffset))
	{
		var offsets = dwscripts.getNodeOffsets(node);
		skipStartOffset = offsets[0];
		skipEndOffset = offsets[1];

		switch (tag.toUpperCase())
		{
			case "ASP:HYPERLINK":
				strTranslation = strTranslation + translateHyperLink(node);
				break;
			case "ASP:IMAGE":
				strTranslation = strTranslation + translateImage(node);
				break;
			case "ASP:LABEL":
				strTranslation = strTranslation + translateLabel(node);
				break;
			case "ASP:TABLE":
				strTranslation = strTranslation + translateTable(node);
				break;
			case "ASP:ADROTATOR":
				strTranslation = strTranslation + translateAdRotator(node);
				break;
			case "ASP:CALENDAR":
				strTranslation = strTranslation + translateCalendar(node);
				break;
			case "ASP:LITERAL":
				strTranslation = strTranslation + translateLiteral(node);
				break;
			case "ASP:PANEL":
				strTranslation = strTranslation + translatePanel(node);
				break;
			case "ASP:PLACEHOLDER":
				strTranslation = strTranslation + translatePlaceHolder(node);
				break;
			case "ASP:XML":
				strTranslation = strTranslation + translateXml(node);
				break;
			case "ASP:COMPAREVALIDATOR":
				strTranslation = strTranslation + translateCompareValidator(node);
				break;
			case "ASP:CUSTOMVALIDATOR":
				strTranslation = strTranslation + translateCustomValidator(node);
				break;
			case "ASP:RANGEVALIDATOR":
				strTranslation = strTranslation + translateRangeValidator(node);
				break;
			case "ASP:REGULAREXPRESSIONVALIDATOR":
				strTranslation = strTranslation + translateRegularExpressionValidator(node);
				break;
			case "ASP:REQUIREDFIELDVALIDATOR":
				strTranslation = strTranslation + translateRequiredFieldValidator(node);
				break;
			case "ASP:VALIDATIONSUMMARY":
				strTranslation = strTranslation + translateValidationSummary(node);
				break;
			case "ASP:BUTTON":
				strTranslation = strTranslation + translateButton(node);
				break;
			case "ASP:CHECKBOX":
				strTranslation = strTranslation + translateCheckBox(node);
				break;
			case "ASP:IMAGEBUTTON":
				strTranslation = strTranslation + translateImageButton(node);
				break;
			case "ASP:LINKBUTTON":
				strTranslation = strTranslation + translateLinkButton(node);
				break;
			case "ASP:RADIOBUTTON":
				strTranslation = strTranslation + translateRadioButton(node);
				break;
			case "ASP:TEXTBOX":
				strTranslation = strTranslation + translateTextBox(node);
				break;
			case "ASP:CHECKBOXLIST":
				strTranslation = strTranslation + translateCheckBoxList(node);
				break;
			case "ASP:DROPDOWNLIST":
				strTranslation = strTranslation + translateDropDownList(node);
				break;
			case "ASP:LISTBOX":
				strTranslation = strTranslation + translateListBox(node);
				break;
			case "ASP:RADIOBUTTONLIST":
				strTranslation = strTranslation + translateRadioButtonList(node);
				break;
			case "ASP:REPEATER":
				strTranslation = strTranslation + translateRepeater(node);
				break;
			case "ASP:DATAGRID":
				strTranslation = strTranslation + translateDataGrid(node);
				break;
			case "ASP:DATALIST":
				strTranslation = strTranslation + translateDataList(node);
				break;
			default:
				skipStartOffset = -1;
				skipEndOffset = -1;
				offsetToBeginOfOpen = offset;
				break;
		}
	}
}

function scannerOpenTagEnd(offset, trailingFormat)
{
	if (offsetToBeginOfOpen > -1)
	{
		strTranslation = strTranslation + ascxCode.substring(offsetToBeginOfOpen, offset);
		offsetToBeginOfOpen = -1;
	}
}

function scannerCloseTag(tag, offset)
{
	if (offset > skipEndOffset)
	{
		strTranslation = strTranslation + "</" + tag + ">";
	}
}

function scannerText(text, offset)
{
	if (offset > skipEndOffset)
	{
		strTranslation = strTranslation + text;
	}
}

function scannerDirective(code, offset)
{
	if (offset > skipEndOffset)
	{
		if (code.search(/^<%#/) == 0 ||
			code.search(/^<%=/) == 0)
		{
			strTranslation = strTranslation + "<MM:DECORATION HILITECOLOR=\"Dyn Untranslated Color\">{text}</MM:DECORATION>";
		}
	}
}

function translateCustomControl(node)
{
	ascxCode = "";
	
	// Ignore syntax errors for custom controls... it may be that the
	// control is valid, but doesn't have a designer.
	var renderStr = "";
	var dom = dw.getDocumentDOM();
	if (dom && node)
	{
		var code = node.outerHTML;
		var documentStr = dom.documentElement.outerHTML;
		var registerRE = /<%@\s*register\s*[^>]*%>/ig;
		var registers = documentStr.match(registerRE);
		var directives = (registers && registers.length > 0) ? registers.join('') : "";

		var translation = designerMgrTranslate(code, directives, false, false);
		if (translation.useMacRendering && registers)
		{
			var fullTagName = new String(node.tagName.toLowerCase());
			var prefixName = (fullTagName.indexOf(":") != -1) ? fullTagName.substr(0, fullTagName.indexOf(":")) : "";
			var tagName = (fullTagName.indexOf(":") != -1) ? fullTagName.substr(fullTagName.indexOf(":") + 1) : fullTagName;

			for(var i=0; i<registers.length; i++)
			{
				var prefixRE = new RegExp("tagprefix\\s*=\\s*[\'\"]" + prefixName + "[\'\"]", "ig");
				var tagNameRE = new RegExp("tagname\\s*=\\s*[\'\"]" + tagName + "[\'\"]", "ig");
				var srcRE = new RegExp("src\\s*=\\s*[\'\"]([^\'\"]*)[\'\"]", "ig");

				var prefixResult = prefixRE.exec(registers[i]);
				var tagNameResult = tagNameRE.exec(registers[i]);
				var srcResult = srcRE.exec(registers[i]);

				if(prefixResult && tagNameResult && srcResult)
				{
					var path = srcResult[1].replace(/\\/i, "/");
					path = path.replace("~", "");  // tilde is the application root
					var ascxURL = dw.getSiteRoot() ? (dw.relativeToAbsoluteURL(dw.getDocumentPath("document") ? dw.getDocumentPath("document") : dw.getSiteRoot(), dw.getSiteRoot(), path)) : "";
					
					//  Don't attempt to do things like calling getDocumentDOM if we can't
					//  really locate the ASCX file.  See:
					//  http://bugapp/bugapp/detail.asp?ID=159423
					if ((ascxURL != "") && DWfile.exists(ascxURL))
					{
						ascxDOM = null;
						var tempFilename = dw.getConfigurationPath() + '/Shared/MM/Cache/empty.htm';
						if (DWfile.exists(tempFilename)) 
						{
							ascxDOM = dw.getDocumentDOM(tempFilename);
						}
						
						if (ascxDOM)
						{
							var callback = new Object();
							strTranslation = "";
							callback.openTagBegin = scannerOpenTagBegin;
							callback.openTagEnd = scannerOpenTagEnd;
							callback.text = scannerText;
							callback.directive = scannerDirective;
							callback.closeTagBegin = scannerCloseTag

							ascxCode = DWfile.read(ascxURL);

							//  URIs within tags inside the ASCX file are relative to the
							//  location of the ASCX file, not the ASPX file that uses this
							//  ASCX file.  So, we need to fix them up.  From a pragmatic
							//  standpoint, we are only going to fix up those attributes
							//  that have a visual manifestation.  This includes the SRC
							//  attribute (most notably, but not necessarily exclusively)
							//  when used on an IMG tag.  Refer to bug report:
							//  http://bugapp/bugapp/detail.asp?ID=159055
							//
							//  Note the following call to String.replace uses a function
							//  to replace the value of the parenthesized parameter within
							//  the regular expression.  You can read about that technique
							//  here:
							//  http://devedge.netscape.com/library/manuals/2000/javascript/1.5/reference/string.html#1194258
							
							ascxCode = ascxCode.replace(
								/\s+src\s*=\s*(['"])([^\1]*?)\1/ig,
								function (str, p1, p2, offset, s) { return " src=" + p1 + dw.relativeToAbsoluteURL(ascxURL, dw.getSiteRoot(), p2) + p1; }
							);
							
							ascxDOM.documentElement.outerHTML = ascxCode;
							
							strTranslation = "";
							skipStartOffset = -1;
							skipEndOffset = -1;
							offsetToBeginOfOpen = -1;
							dw.scanSourceString(ascxCode, callback);
							
							translation.string = strTranslation;
						}
						else
						{
							//  We can't find the empty doc to make a temporary DOM.
							//  We'll probably never hit this... but just in case...
													
							translation.string = "[" + fullTagName + "]";
						}
					}
					else
					{
						//  We can't find the ASCX file for this user control.
						//  Give the user a clue about that.
												
						translation.string = "[" + fullTagName + "]";
					}
				}
			}
		}
		renderStr = translation.string;
	}
	return renderStr;
}
