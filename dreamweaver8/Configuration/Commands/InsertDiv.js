// Copyright 2003, 204, 2005 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------
var helpDoc = MM.HELP_objDiv;
var LIST_CLASSES;
var LIST_IDS;
var allClasses;
var allUnusedIDs;
var classesPopulated = false;
var idsPopulated = false;

//---------------     API FUNCTIONS    ---------------

function isDOMRequired()
{
	// TODO: is this kosher? We need to do this to get the list of
	// existing classes/ids.
	return true;
}

function commandButtons()
{
   return new Array( MM.BTN_OK,     "doInsertDiv()",
                     MM.BTN_Cancel, "window.close()",
                     MM.BTN_Help,   "displayHelp()");
}

//---------------    LOCAL FUNCTIONS   ---------------

function populateClassList()
{
	if (classesPopulated)
		return;

	var dom = dw.getDocumentDOM();
	if (dom)
	{
		allClasses = dom.getSelectorsDefinedInStylesheet('class');
		for (i = 0; i < allClasses.length; i++)
		{
			if (allClasses[i][0] == '.')
				allClasses[i] = allClasses[i].slice(1);
		}
		LIST_CLASSES.setAll(allClasses);
	}

	classesPopulated = true;
}

function populateIDList()
{
	if (idsPopulated)
		return;

	var dom = dw.getDocumentDOM();
	if (dom)
	{
		var ids = dom.getSelectorsDefinedInStylesheet('id');
		allUnusedIDs = new Array();
		for (i = 0; i < ids.length; i++)
		{
			if (ids[i][0] == '#')
				ids[i] = ids[i].slice(1);
			if (!isIDInUse(ids[i]))
				allUnusedIDs.push(ids[i]);
		}
		LIST_IDS.setAll(allUnusedIDs);
	}
	idsPopulated = true;
}

function initializeUI()
{
	var i;
	var dom = dw.getDocumentDOM();

	LIST_CLASSES = new ListControl('divClass');
	LIST_IDS = new ListControl('divID');

	LIST_CLASSES.setIndex(-1);
	LIST_IDS.setIndex(-1);

	populateClassList();
	populateIDList();

	document.theForm.divClass.focus();

	// If the selection is a range, show the "wrap around selection" text.
	var selection = dom.getSelection();
	if (selection[0] != selection[1])
		document.theForm.divInsertWhere.options[0].innerHTML = dw.loadString("insertbar/div/wraparound");

	// If there's no tags with IDs, hide the before/after tag options.
	var idNodeList = dom.getElementsByAttributeName("id");
	if (!idNodeList || idNodeList.length == 0)
	{
		// Should really rewrite this in terms of the ListControl class.
		var beforeOption = null;
		var afterOption = null;
		for (i = 0; i < document.theForm.divInsertWhere.options.length; i++)
		{
			var optionNode = document.theForm.divInsertWhere.options[i];
			if (optionNode.value == 'before')
				beforeOption = optionNode;
			else if (optionNode.value == 'after')
				afterOption = optionNode;
		}
		if (beforeOption)
			beforeOption.outerHTML = '';
		if (afterOption)
			afterOption.outerHTML = '';
	}
}

function updateInsertDropdown()
{
	var selOption = document.theForm.divInsertWhere.options[document.theForm.divInsertWhere.selectedIndex];
	if (selOption == null || selOption.value == "cursel")
	{
		// "Insert at IP" or "Wrap around selection" is selected.
		document.theForm.divInsertAtTag.setAttribute("disabled", "disabled");
		document.theForm.divInsertAtTag.innerHTML = "";
	}
	else
	{
		// Reset the list of tags in the dropdown based on the selection.
		var tagList = "";
		if (selOption.value == "insideStart" || selOption.value == "insideEnd")
			tagList += '<option value="!body" name="body">&lt;body&gt;</option>';
		
		var dom = dw.getDocumentDOM();
		if (dom)
		{
			var nodeList = dom.getElementsByAttributeName("id");
			if (nodeList)
			{
				for (var i = 0; i < nodeList.length; i++)
				{
					tagList += '<option value="' + nodeList[i].id + '" name="' + nodeList[i].id + '">&lt;' + nodeList[i].tagName.toLowerCase() + ' id="' + nodeList[i].id + '"&gt;</option>';
				}
			}
		}
		
		document.theForm.divInsertAtTag.removeAttribute("disabled");
		document.theForm.divInsertAtTag.innerHTML = tagList;
		document.theForm.divInsertAtTag.selectedIndex = 0;
	}
	document.theForm.divInsertWhere.focus();
}

function isIDInUse(idStr)
{
	var dom = dw.getDocumentDOM();
	if (dom)
	{	
		var nodeList = dom.getElementsByAttributeName('id');
		if (nodeList)
		{
			for (var i = 0; i < nodeList.length; i++)
			{
				if (nodeList[i].id.toLowerCase() == idStr.toLowerCase())
					return true;
			}
		}
	}
	return false;
}

function buttonClicked()
{
	var dom = dw.getDocumentDOM();
	var selection;
	var oldLength = 0;
	var mustAdjust = false;
	
	// if we're going to insert at the current selection, need to adjust the selection to account for the added style
	var selOption = document.theForm.divInsertWhere.options[document.theForm.divInsertWhere.selectedIndex];
	if (selOption == null || selOption.value == 'cursel')
		mustAdjust = true;
		
	if (dom && mustAdjust)
	{
		selection = dom.getSelection();
		oldLength = dom.documentElement.outerHTML.length;
	}

	classesPopulated = false;
	idsPopulated = false;

	var origClasses = allClasses;
	var origUnusedIDs = allUnusedIDs;
	
	dreamweaver.cssStylePalette.newStyle();

	if (dom && mustAdjust)
	{
		var lengthDiff = dom.documentElement.outerHTML.length - oldLength;
		if (lengthDiff > 0)
		{
			selection[0] += lengthDiff;
			selection[1] += lengthDiff;
		}
		dom.setSelection(selection[0], selection[1]);
	}

	populateClassList();
	populateIDList();

	// again, get lists of classes, unused IDS; see what's new, select that
	var foundNew = false;
	for (var i = 0; i < allClasses.length; i++)
	{
		if (origClasses[i] == null || allClasses[i] != origClasses[i])
		{
			LIST_CLASSES.setIndex(i);
			foundnew = true;
			break;
		}
	}
	if (!foundNew)
	{
		for (i = 0; i < allUnusedIDs.length; i++)
		{
			if (origUnusedIDs[i] == null || allUnusedIDs[i] != origUnusedIDs[i])
			{
				LIST_IDS.setIndex(i);
				break;
			}
		}
	}

}
	
function doInsertDiv()
{
	// make sure we insert into the html, not the css file
	var dom = dw.getActiveWindow();
	if (dom)
	{
		var newDivID = LIST_IDS.get();
		if (newDivID != '')
		{
			if (isIDInUse(newDivID))
			{
				if (!confirm(dw.loadString("insertbar/div/dupID")))
					return;
			}
		}

		var newTag = '<div';
		var contentDesc = '';
		if (LIST_CLASSES.get() != '')
		{
			newTag += ' class="' + LIST_CLASSES.get() + '"';
			contentDesc += ' class "' + LIST_CLASSES.get() + '"';
		}
		if (newDivID != '')
		{
			newTag += ' id="' + newDivID + '"';
			contentDesc += ' id "' + newDivID + '"';
		}
		newTag += '>';

		var content;
		if (contentDesc == '')
		{
			content = dw.loadString("insertbar/div/divContentNoID");
		}
		else
		{
			content = dw.loadString("insertbar/div/divContent");
			content = content.replace(/%1/, contentDesc);
		}

		var closeTag = '</div>';
		var newTagWithContent = newTag + content + closeTag;

		var startOffset = newTag.length;
		var endOffset = closeTag.length;

		var selOption = document.theForm.divInsertWhere.options[document.theForm.divInsertWhere.selectedIndex];
		if (selOption == null || selOption.value == 'cursel')
		{
			var selection = dw.getSelection();
			if (selection[0] == selection[1])
				dom.insertHTML(newTagWithContent);
			else
				dom.wrapTag(newTag + closeTag, true, true);
		}
		else
		{
			var tagNode = null;
			var tagID = document.theForm.divInsertAtTag.options[document.theForm.divInsertAtTag.selectedIndex].value;
			if (tagID == '!body')
				tagNode = dom.body;
			else
			{
				var nodeList = dom.getElementsByAttributeName('id');
				for (var i = 0; i < nodeList.length; i++)
				{
					if (nodeList[i].id == tagID)
					{
						tagNode = nodeList[i];
						break;
					}
				}
			}
			if (tagNode != null)
			{
				if (selOption.value == 'before')
				{
					endOffset += tagNode.outerHTML.length;
					tagNode.outerHTML = newTagWithContent + tagNode.outerHTML;
				}
				else if (selOption.value == 'after')
				{
					startOffset += tagNode.outerHTML.length;
					tagNode.outerHTML = tagNode.outerHTML + newTagWithContent;
				}
				else if (selOption.value == 'insideStart')
				{
					endOffset += tagNode.innerHTML.length;
					tagNode.innerHTML = newTagWithContent + tagNode.innerHTML;
				}
				else if (selOption.value == 'insideEnd')
				{
					startOffset += tagNode.innerHTML.length;
					tagNode.innerHTML = tagNode.innerHTML + newTagWithContent;
				}
			}
		}

		// At this point, the <div> should be selected.  Move the
		// selection within the <div>.
		var newSelection = dw.getSelection();
		newSelection[0] += startOffset;
		newSelection[1] -= endOffset;
		if ((newSelection[1] > newSelection[0]) &&
			(!dw.getDocumentDOM().rangeContainsLockedRegion(newSelection[0], newSelection[1])))
		{
			dw.setSelection(newSelection[0], newSelection[1]);
		}
	}

	window.close();
}
