//SHARE-IN-MEMORY=true
//
// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
//Template utility functions for DW5 templates

//INCLUDES
//This file uses other JS files. You must include them first, before including this one.
//All paths are relative to this file.  



var deferredSelStart = -1; 
var deferredSelEnd = -1; 

function doSync(onDom)
	{	
	if (typeof onDom["synchronizeDocument"] != 'undefined')
		onDom.synchronizeDocument();
	}
	
//A general note on entity encoding: nothing here is encoded, except the code that goes between "@@(...)@@" strings in 
//an expression. That code is entity encoded. 

//Return the selected node, without a fixup to deal with locking. If you pass wantMultiple, this 
//will just return the first node in the selection list. 
function getUnlockedSelNode(curDOM, wantMultiple)
	{
	var curSelection = curDOM.getSelection(wantMultiple, false); 
	if (curSelection.length < 2)
		return null; 
		
	return curDOM.offsetsToNode(curSelection[0], curSelection[1], false); 
	} //getUnlockedSelNode
	

function focusIsLegalForTemplateMods()
	{
	/* fix for bug 58728 - on windows, sometimes the site window has the focus even when there's a document open - so look for site as well  */	
	var curFocus = dw.getFocus(); 
	return (curFocus == 'document' || curFocus == 'textView' || curFocus == 'html' || curFocus == 'site');
	}
	
//Insert optional content into the active document. Make the current selection 
//optional if it is a simple selection, otherwise insert the conditional tag. 
//paramName is the name of the parameter controlling the content, this may or 
//may not be a new parameter. ShowByDefault is the default value if it is. 
//If conditionalExpr is non-empty, the first two params are ignored, and we
//use this string as the expression to evaluate for the conditional. In this 
//case no parameter tag is written out, otherwise we write one. 

function doInsertConditional(paramName, showByDefault, conditionalExpr, targetDom, encodeExpressions, addEditableRegion) 
{
	if ((conditionalExpr == null || conditionalExpr.length == 0) && !checkLegalTemplateName(paramName))
		return false; 
			
	if (!checkInsertTemplateParam(targetDom))
		return false; 

   var condString;
   
   var encodedParam = encodeTemplateParam(paramName, encodeExpressions);
      
   var effectiveCond;
   var justTheCondition;
   if (conditionalExpr == null || conditionalExpr.length == 0)
 	{
	   effectiveCond = encodedParam;
	   justTheCondition = dwscripts.minEntityNameEncode(effectiveCond);
	   condString = "cond=\"" + justTheCondition + "\"";
	}
   else
	{
	   effectiveCond = conditionalExpr;
	   justTheCondition = dwscripts.minEntityNameEncode(effectiveCond);
	   condString = "cond=\"" + justTheCondition + "\"";
	}
	
	var frag1; 
	var frag2;
	
	if (dw.generateTemplateTagSyntax())
	{
		frag1 = "<MMTemplate:If " + condString + ">"		
		frag2 = "</MMTemplate:If>";
	}
	else
	{
		frag1 = "<!-- TemplateBeginIf " + condString + " -->"		
		frag2 = "<!-- TemplateEndIf -->";
	}

	var curSel = targetDom.getSelection(true);
	
	insertBlockTemplateTag(frag1, frag2, targetDom, paramName, "conditional", effectiveCond, false);

	//Don't insert a parameter if a condition was passed. 
	var insertParameter = true;
	if (conditionalExpr != null && conditionalExpr.length != 0)
		insertParameter = false;
	
	if( insertParameter )
	{
		var oldParamNode = getTemplateParamTag(paramName, targetDom); 
		if (oldParamNode != null)
			insertParameter = false;
	}
	
	if( insertParameter )
		insertTemplateParam(paramName, "boolean", showByDefault ? "true" : "false", targetDom);
	
	targetDom.selectTemplateRegion("conditional", justTheCondition, curSel[0]);
	
	if (addEditableRegion)
	{
		// The selectionTemplateRegion() above should have just selected the contents
		//	of the conditional region. So performing a doInsertEditable() right now
		//	should wrap the content with an editable region (inside the conditional region)
		var editName = getUniqueRegionName(MM.EditAutonamePreamble, "MMTemplate:Editable", targetDom);
		doInsertEditable(editName, targetDom);
	}
	
	return true; 
} //doInsertConditional
	

//Check to see if the selection range passed in overlaps an editable region, and 
//return true if it does. 
function checkForTemplateMarkupOverlap(curSel, targetDom)
	{	
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	
	for (i=0;i<curSel.length-1;i+=2)
		if (curDOM.rangeContainsTemplateMarkup(curSel[i], curSel[i+1]))
			return true; 
			
	return false; 
	}  //checkForTemplateMarkupOverlap


//Insert a new style editable region into the active document. Make the current selection 
//editable if it is a simple selection, otherwise insert the editable tag. 
//region is the name of the editable region, this may or 
//may not be a new parameter.

//Returns true for success, false if there was already
//a region of this name.
function doInsertEditable(regionName, targetDom) 
	{
	if (!checkLegalTemplateName(regionName))
		return false; 
	
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return false; 
		
	var scopeNode = findTemplateScopeNode(targetDom); 
	if (findNamedEditableRegion(regionName, curDOM, null, false, scopeNode) != null)	
		{
		alert(MM.TEMPLATE_UTILS_AlreadyExists);
		return false; 
		}
		
   var condString;   
   var justTheName = dwscripts.minEntityNameEncode(regionName);
   var nameString = "name=\"" + justTheName + "\"";
 	var curSel = curDOM.getSelection(true, false);
	if (checkForTemplateMarkupOverlap(curSel, targetDom))
		{
		alert(MM.TEMPLATE_UTILS_EditOverlap); 
		return false;  
		}
			
	var frag1; 
	var frag2;
	
	if (dw.generateTemplateTagSyntax())
		{
		frag1 = "<MMTemplate:Editable " + nameString + ">"; 
		frag2 = "</MMTemplate:Editable>";
		}
	else
		{
		frag1 = "<!-- TemplateBeginEditable " + nameString + " -->"; 
		frag2 = "<!-- TemplateEndEditable -->";
		}
		
	insertBlockTemplateTag(frag1, frag2, targetDom, regionName, "editable", regionName, false);
	
	targetDom.selectTemplateRegion("editable", justTheName);

	return true; 
	} //doInsertEditable
	
	
//Insert a repeating region into the document, containing the current selection if possible.
//If it is not possible to insert, return the tag to be inserted instead, otherwise return the 
//empty  string. 
//Repeat name is not encoded here. Return true if this worked, false if there was a problem.
function doInsertRepeat(repeatName, targetDom)
	{	
	if (!checkLegalTemplateName(repeatName))
		return false; 

	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return false; 
	
	if (findNamedRepeatingRegion(repeatName, curDOM) != null)	
		{
		alert(MM.TEMPLATE_UTILS_AlreadyExists_Repeat);
		return false; 
		}

	var frag1; 
	var frag2;

	var justTheName = dwscripts.minEntityNameEncode(repeatName);
	if (dw.generateTemplateTagSyntax())
		{
		frag1 = "<MMTemplate:Repeat name=\"" + justTheName  + "\">"; 
		frag2 = "</MMTemplate:Repeat>";
		}
	else
		{
		frag1 = "<!-- TemplateBeginRepeat name=\"" +  justTheName + "\" -->"; 
		frag2 = "<!-- TemplateEndRepeat -->";
		}
		
	var curSel = curDOM.getSelection(true);
	
	var selIsBogusTD = false; 
	var selNode = null; 
	var selIsTableCells = false; 
	
	if (curSel != null && curSel.length >= 2)
		{
		selNode = curDOM.offsetsToNode(curSel[0], curSel[1]); 
		if (curSel.length == 2 && (selNode.tagName == "TD" || selNode.tagName == "TH"))
			selIsBogusTD = !selectionIsTrueTD(curDOM, curSel[0], curSel[1], selNode); 		
		
		if (!selIsBogusTD)
			selIsTableCells = ( 	selNode.tagName == "TD" || 
										selNode.tagName == "TR" || 
										selNode.tagName == "TH" || 
										selNode.tagName == "TABLE");
		}
	
	var selHasTemplateMarkup = 	selectionContainsTemplateMarkup(curDOM, curSel);
	
	//No selection or a simple one, add an edit inside the repeat, unless there is already template markup there.     	   
	
	//SES - this got really tangled, so we decided to basically always do this, except if there
	//is template markup. Here's the old code in case we want to back up: 
	/*
	if ( !selHasTemplateMarkup && 
			 (	selIsBogusTD ||  
			 	curSel.length <= 2 || 
			 	selIsTableCells) ) 
	*/
	
	/* OK, take two: we're ripping it out until beta, or later 
	if ( !selHasTemplateMarkup ) 
		{			
		var nameString = "name='" + dwscripts.minEntityNameEncode(repeatName + MM.TEMPLATE_UTILS_LocalEdit_Suffix) + "' ";

		if (dw.generateTemplateTagSyntax())
			{
			frag1 += "<MMTemplate:Editable " + nameString + ">"; 
			frag2 = "</MMTemplate:Editable>" + frag2;
			}
		else
			{
			frag1 += "<!-- TemplateBeginEditable " + nameString + " -->"; 
			frag2 = "<!-- TemplateEndEditable -->" + frag2;
			}
		}
	*/ 
	
	insertBlockTemplateTag(frag1, frag2, targetDom, repeatName, "repeating", repeatName, true);
	
	//There is a really weird bug involving PIs here - the node is selected, but something about the selection is not right, 
	//and clicking on the PI will make it crash. Just sort of 'normalizing' the selection here seems to make 
	//this go away. 
	//doSync(curDOM); 
	
	if (deferredSelStart != -1 && deferredSelEnd != -1)
		{
		curDOM.setSelection(deferredSelStart, deferredSelEnd, false);
		deferredSelStart = -1; 
		deferredSelEnd = -1; 
		}
		
	curDOM.setSelectedNode(curDOM.getSelectedNode(true));
	
	targetDom.selectTemplateRegion("repeat", justTheName);

	return true;
	} //doInsertRepeat

	
	
//Return the node that represents the current scope for the current selection. If there is no
//selection return the HTML tag, otherwise walk up the node tree until we find a repeat, or 
//the root. 
function findTemplateScopeNode(targetDom)
	{
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return null; 
	
	if (typeof curDOM["getSelectedNode"] == "undefined")
		return curDOM; //Not a document node, just return it. 
				
	var curNode = getUnlockedSelNode(curDOM, true); 
	if (curNode == null)
		return curDOM; //Just return the document node. 
	
	while (curNode != null)
		{
		if (curNode.tagName == "BODY" || curNode.tagName == "HTML")
			return curDOM; 
			
		if (curNode.tagName == "MMTEMPLATE:REPEAT")
			return curNode; 
		
		curNode = curNode.parentNode;
		}
		
	return curDOM; 
	} //findTemplateScopeNode
	
function nodesMatch(curDOM, node1, node2)
	{
	if (node1 == null || node2 == null)
		return node1 == node2; 
		
	var offsets1 = curDOM.nodeToOffsets(node1); 
	var offsets2 = curDOM.nodeToOffsets(node2); 
	
	return (offsets1[0] == offsets2[0] && offsets1[1] == offsets2[1]);
	}

//Find the template scope tag containing this node - that's the nearest containing MMTRepeat tag. Return null if we aren't in a 
//repeat (this could mean we're in the body or the head). 
function findTemplateScope(node)
	{
	var curParent = node.parentNode; 
	
	while (curParent != null)
		{
		if (curParent.tagName == "MMTEMPLATE:REPEAT")
			return curParent; 
			
		curParent = curParent.parentNode; 
		}
		
	return null;
	} //findTemplateScope

//Return true if these two nodes are in the same scope - either in the same repeat, or in no repeat. 
function templateScopesMatch(curDOM, node1, node2)
	{
	return nodesMatch(curDOM, findTemplateScope(node1), findTemplateScope(node2)); 
	} //templateScopesMatch
		
//Scan the current scope for editable regions of this name and return the first one found. 
//If wantInstanceTags is true, look for MMTInstance:Editable tags (and mm:editable tags if 
//the targetDOM is a non-nested template instance). If it is false, look for MMTemplate:Editable tags, 
//or mm:editable tags if this is a template. 
function findNamedEditableRegion(regionName, targetDom, excludeNode, wantInstanceTags, sameScopeAsNode)
	{
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	var scopeNode = findTemplateScopeNode(curDOM);
	
	if (scopeNode == null)
		return null; 
		
	var params; 
	var curTag; 
	
	if (!wantInstanceTags)
		{
		params = scopeNode.getElementsByTagName("MMTemplate:Editable");
		
		for (i=0;i<params.length;i++)
			{	
			curTag = params.item(i); 
				
			if (dwscripts.minEntityNameDecode(curTag.name) == regionName && 
				 !nodesMatch(curDOM, excludeNode, curTag) && 
			 	 (sameScopeAsNode == null || templateScopesMatch(curDOM, sameScopeAsNode, params.item(i)))	 )
				return params.item(i);	
			}	
		}
		
	//We always have to loop over the MMTInstance:Editable tags, since 
	//passthroughs here ought to be treated as non-instance tags for 
	//the sake of this call - so either way we have to look at all the 
	//nodes in the list. 	
	params = scopeNode.getElementsByTagName("MMTInstance:Editable");
	for (i=0;i<params.length;i++)
		{
		if (dwscripts.minEntityNameDecode(params.item(i).name) == regionName && 
			  !nodesMatch(curDOM, excludeNode,params.item(i)) && 
			  (sameScopeAsNode == null || templateScopesMatch(curDOM, sameScopeAsNode, params.item(i)))	 )
			{
			if (wantInstanceTags || curDOM.editIsPassthrough(params.item(i)))
				return params.item(i);	
			}
		}	
	
	var isInstance = curDOM.getAttachedTemplate().length > 0; 
	var isTemplate = curDOM.getIsTemplateDocument(); 

	//We look for old-style tags in the following cases: 
	//	1. In a template (nested or otherwise), these act like MMTemplate:Editable.
	//
	//	2. In an instance that is not a nested template, they act like MMTInstance:Editable.
	//
	//	3. In a file that is neither a template or an instance, it's not defined what these do, 
	// so we treat them like MMTemplate:Editable.
	//

	var wantOldStyle = (!wantInstanceTags && 	isTemplate) || 
							 (wantInstanceTags && isInstance && !isTemplate) || //instance that is not a nested template
							 (!isTemplate && !isInstance && !wantInstanceTags); 
							 
	if (wantOldStyle)
		{						 
		//Finally, look for old-style editable regions.
		params = scopeNode.getElementsByTagName("mm:editable");
		for (i=0;i<params.length;i++)
			{
			if (dwscripts.minEntityNameDecode(params.item(i).name) == regionName && 
				 !nodesMatch(curDOM, excludeNode, params.item(i)) && 
				(sameScopeAsNode == null || templateScopesMatch(curDOM, sameScopeAsNode, params.item(i)))	 )
				return params.item(i);	
			}	
		}
		
	return null;
	} //findNamedEditableRegion
	
function stringIsAllDigits(theString)
	{
	theString = trimWhitespace(theString); 
	//return theString.search(/\D/) != -1;
	
	if (theString.length == 0)
		return false; 
		
	var digits = "0123456789"; 
	for (var i=0;i<theString.length;i++)
		if (digits.indexOf(theString.charAt(i)) == -1)
			return false; 
			
	return true; 
	} //stringIsAllDigits
	
	
//Scan the document for editable regions of this name and return the first one found. 
function findNamedRepeatingRegion(regionName, targetDom)
	{
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	var scopeNode = findTemplateScopeNode(curDOM);
	
	if (scopeNode == null)
		return null; 
		
	//For some reason, this seems to be case sensitive when looking for XML style tags.
	var params = scopeNode.getElementsByTagName("MMTemplate:Repeat");
	
	for (i=0;i<params.length;i++)
		{
		if (dwscripts.minEntityNameDecode(params.item(i).name) == regionName)
			return params.item(i);	
		}	
		
	return null;
	} //findNamedRepeatingRegion
	

//This routine examines the selected offset array, to see if some of a table row or rows has been selected. 
//It decides this by looking for selected TD tags in the array, and then looking at whether all of the TR 
//parent tags are in the array as well. It then expands the selection so that only whole rows are selected. 

//This routine will return either the original array (no fixup) or a new selection array containing the TRs. 
//If we encounter anything but a TD in the sel, return selOffsetArray. 
function normalizeSelectionForTables(selOffsetArray, targetDom, isTableSelObj)
	{
	isTableSelObj.value = false; 
	
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return selOffsetArray; 

	//Entries in this array are objects that contain a reference to the TR, an a count of 'spotted' 
	//TDs in the selection. 
	
	var selectCounts = new Array(); 
		
	for (var i=0; i<selOffsetArray.length;i=i+2)
		{
		var selectedNode = curDOM.offsetsToNode(selOffsetArray[i], selOffsetArray[i+1], false);
		
		var tagName = selectedNode.tagName; 
		
		//If a table cell is selected (as opposed to the contents of a cell), then record the row 
		//it was selected on. 
		if (selectedNode.nodeType == Node.ELEMENT_NODE && 
			(selectedNode.tagName == 'TD' || selectedNode.tagName == 'TH') && 
			selectionIsTrueTD(curDOM, selOffsetArray[i], selOffsetArray[i+1], selectedNode))
			{			
			private_pushSelectedTR(selectCounts, getNodeAncestorOfType(selectedNode, "TR"));
			isTableSelObj.value = true; 
			}
		else 
			{
			if (selectedNode.tagName == "TR") 
				isTableSelObj.value = true; 
			
			return selOffsetArray; 
			}
		}
		
	//If we didn't find any table selection at all, just return the original selection
	if (selectCounts.length == 0)
		return selOffsetArray; 
			
	//if we get to here, the selection is some part of a number of rows. 
	//Return an array of just two offsets, the first before the TR of the first row with any selection, the last after the 
	// /TR of any row with some selection. 
	var startOffset = -1; 
	var endOffset = -1; 
	for (i=0;i<selectCounts.length;i++)
		{
		var curOffsets = curDOM.nodeToOffsets(selectCounts[i].trTag); 

		if (startOffset == -1 || startOffset > curOffsets[0])
			startOffset = curOffsets[0]; 
		if (endOffset == -1 || endOffset < curOffsets[1])
			endOffset = curOffsets[1]; 
		}
		
	//return the array. 
	var result = new Array(); 
	result.push(startOffset);
	result.push(endOffset);
	
	return result;
	} //normalizeSelectionForTables
	
	
	
//Private function to normalizeTableSelection
function private_pushSelectedTR(selectCountsArray, selTR)
	{
	for (var i=0; i<selectCountsArray.length; i++)
		if (selectCountsArray[i].trTag == selTR)	
			{
			selectCountsArray[i].actualSelCount++; 
			return;
			}
			
	var newCount = new Object();
	newCount.trTag = selTR; 
	newCount.actualSelCount = 1; 
	selectCountsArray.push(newCount);	
	} //private_pushSelectedTR
	
	
function findPTagContainingOffset(offset, targetDom)
	{
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return null; 

	var curNode = curDOM.offsetsToNode(offset, offset, false); 
	
	if (curNode == null)
		return null; 
			
	//Check to see if the offset is really inside the node or just on the border. 
	var nodeOffsets = curDOM.nodeToOffsets(curNode); 
	if (nodeOffsets[0] == offset || nodeOffsets[1] == offset)
		return null; 	
	
	if (curNode.tagName == "P")
		return curNode; 

	while (curNode != null)
		{
		if (curNode.tagName == "BODY" || curNode.tagName == "HTML")
			return null; 
			
		if (curNode.tagName == "P")
			return curNode; 
		
		curNode = curNode.parentNode;
		}
	
	return null; 
	} //findPTagContainingOffset



//Look at the current selection. If it is all of a single paragraph, 
//then move it to include the P tag itself. Otherwise do nothing. 
function normalizeSelectionForParagraphs(selectedNodeArray, targetDOM, replaceSelection)
	{ 	
	if (selectedNodeArray.length > 2) 
		return selectedNodeArray; 
	
	var curDOM = (targetDOM == null) ? dw.getDocumentDOM('document') : targetDOM; 
	if (curDOM == null)
		return selectedNodeArray; 

	var selectedNode = curDOM.offsetsToNode(selectedNodeArray[0], selectedNodeArray[1], false)
			
	if (selectedNode.tagName == "P")
		{
		//If the paragraph is just a nbsp, or the whole paragraph is selected, move the sel outside it. 
		if (selectedNode.innerHTML == "&nbsp;" || selectedNode.innerHTML.length == (selectedNodeArray[1] - selectedNodeArray[0]))
			{			
			if (selectedNode.innerHTML == "&nbsp;")
				replaceSelection.value = true; 

			var parentNodeOffsets = curDOM.nodeToOffsets(selectedNode); 
			selectedNodeArray[0] = parentNodeOffsets[0]; 
			selectedNodeArray[1] = parentNodeOffsets[1]; 
			}
		}
	else	
		{		
		var startNode = findPTagContainingOffset(selectedNodeArray[0], curDOM); 
		var endNode = findPTagContainingOffset(selectedNodeArray[1], curDOM); 
		
		//var startNode = curDOM.offsetsToNode(selectedNodeArray[0], selectedNodeArray[0], false);
		//var endNode = curDOM.offsetsToNode(selectedNodeArray[1], selectedNodeArray[1], false);
			
		//Make sure the endpoints of the selection do not span a paragraph.
		if (startNode != null) 
			{
			var startNodeOffsets = curDOM.nodeToOffsets(startNode);
			if (selectedNodeArray[1] >= startNodeOffsets[1])
				 selectedNodeArray[0] = startNodeOffsets[0];
			}
		
		if (endNode != null)
			{
			var endNodeOffsets = curDOM.nodeToOffsets(endNode);
			if (selectedNodeArray[0] <= endNodeOffsets[0])
				 selectedNodeArray[1] = endNodeOffsets[1];
			}
		}
		
	return selectedNodeArray; 
	} //normalizeSelectionForParagraphs
	

// If the selection starts just after a <li> and ends just after the corresponding </li>,
// expand it to include the whole list item.  This is the selection you get when you select
// the first li tag in a list through the tag selector.

function normalizeSelectionForLists(selectedNodeArray, targetDOM, replaceSelection)
{
	var curDOM = (targetDOM == null) ? dw.getDocumentDOM('document') : targetDOM;
	if (curDOM == null)
		return selectedNodeArray;

	var startNode = curDOM.offsetsToNode(selectedNodeArray[0], selectedNodeArray[0], false);
	if (startNode)
	{
		var parentNode = startNode.parentNode;
		if (parentNode && parentNode.tagName == "LI")
		{
			var outerOffsets = curDOM.nodeToOffsets(parentNode, false);
			var innerOffsets = curDOM.nodeToOffsets(parentNode, true);
			if (selectedNodeArray[0] == innerOffsets[0] &&
				selectedNodeArray[1] == outerOffsets[1])
			{
				selectedNodeArray[0] = outerOffsets[0];
			}
		}
	}

	return selectedNodeArray;
	} //normalizeSelectionForLists
	
// Look at the current selection. If it is wrapped in anchor tags,
// select them too. Otherwise do nothing. 

function normalizeSelectionForAnchors(selectedNodeArray, targetDOM, replaceSelection)
{ 
	var curDOM = (targetDOM == null) ? dw.getDocumentDOM('document') : targetDOM; 
	if (curDOM == null)
		return selectedNodeArray; 

	var selectedNode = curDOM.offsetsToNode(selectedNodeArray[0], selectedNodeArray[1], false)
	var parentNode = selectedNode.parentNode;

	// Is the parent node an anchor tag?

	if (parentNode.tagName == "A")
	{
		// Select the anchor tags too, but only if the
		// selection is the only thing (ignoring whitespace)
		// within the anchor tags

		var selectAnchorTags = false;
		var parentNodeOffsets = curDOM.nodeToOffsets(parentNode); 
		var outerOffsets = curDOM.nodeToOffsets(parentNode); 
		var outerHTML = parentNode.outerHTML;
		var innerOffsets = dwscripts.getInnerHTMLOffsets(outerHTML);

		// If the length of the innerHTML is less than or equal to the
		// length of the selection, then there's nothing else in the tag

		var selectionLength = (selectedNodeArray[1] - selectedNodeArray[0]);
		var innerHTMLLength = (innerOffsets.innerEnd - innerOffsets.innerStart);

		if (innerHTMLLength <= selectionLength)
		{
			selectAnchorTags = true;
		}
		else
		{
			// There's something else in the tag.
			// Extract the strings before and after the selection
			// and see if they're just whitespace

			var beforeStart = innerOffsets.innerStart;
			var beforeEnd = (selectedNodeArray[0] - parentNodeOffsets[0]);
			var afterStart = (selectedNodeArray[1] - parentNodeOffsets[0]);
			var afterEnd = innerOffsets.innerEnd;

			var before = dwscripts.trim(outerHTML.substring(beforeStart, beforeEnd));
			var after = dwscripts.trim(outerHTML.substring(afterStart, afterEnd));

			selectAnchorTags = ((before.length + after.length) == 0);
		}

		if (selectAnchorTags)
		{
			selectedNodeArray[0] = parentNodeOffsets[0];
			selectedNodeArray[1] = parentNodeOffsets[1];
		}
	}

	return selectedNodeArray; 
}

// Look at the current selection. If it is a table cell, select
// just the contents of the cell. Otherwise do nothing. 

function normalizeSelectionForTableCell(selectedNodeArray, targetDOM, replaceSelection)
{ 
	var curDOM = (targetDOM == null) ? dw.getDocumentDOM('document') : targetDOM; 
	if (curDOM == null)
		return selectedNodeArray; 

	var selectedNode = curDOM.offsetsToNode(selectedNodeArray[0], selectedNodeArray[1], false)

	if (selectionIsTrueTD(curDOM, selectedNodeArray[0], selectedNodeArray[1], selectedNode))
	{
		var outerHTML = selectedNode.outerHTML;
		var offsets = dwscripts.getInnerHTMLOffsets(outerHTML);

		if ((offsets.innerStart >= 0) && (offsets.innerEnd >= 0))
		{
			selectedNodeArray[0] += offsets.innerStart;
			selectedNodeArray[1] = selectedNodeArray[0] + (offsets.innerEnd - offsets.innerStart);
		}
	}
	return selectedNodeArray; 
}


//For some reason, the selection code really likes to give back table cells when, in fact, the contents are selected, 
//not the cell. So, if you give this routine a pair of offsets and the node that offsetsToNode claims to 
//correspond, and it's a TD node, this will tell you if the selection is really the TD or not. 	
function selectionIsTrueTD(curDOM, selStart, selEnd, selectedNode)
	{
	if (selectedNode.tagName != "TD" && selectedNode.tagName != 'TH')
		return false; 
		
	var realOffsets = curDOM.nodeToOffsets(selectedNode);
		
	if (selStart > realOffsets[0] || selEnd < realOffsets[1])
		return false; 
	
	return true; 
	} //selectionIsTrueTD

//When the selection is inside a node, and offsetsToNode is returning the node itself, you can use
//this routine to get the real selected contents of the node - this takes the selStart and selEnd, gets the 
//nodes offsets, and then does some math and returns a substring of the outerHTML of the node. 
function getNodeSelContents(curDOM, selStart, selEnd, selectedNode)
	{
	var realOffsets = curDOM.nodeToOffsets(selectedNode);
	
	var substringStart = selStart - realOffsets[0]; 
	var substringEnd = selEnd - realOffsets[0]; 
	
	if (substringStart < 0 || substringEnd > selectedNode.outerHTML.length - 1)
		return selectedNode.outerHTML; 
	
	return selectedNode.outerHTML(substringStart, substringEnd);
	} //getNodeSelContents


//Return true if the selection is exactly all of one node. 
function selectionIsExactlyOneNode(curSel, curDOM)
	{
	if (curSel.length != 2) 
		return false; 
		
	var theNode = curDOM.offsetsToNode(curSel[0], curSel[1], false); 
	if (theNode == null)
		return false; 
	
	if (theNode.nodeType != Node.ELEMENT_NODE)
		return false; 
	
	var nodeOffsets = curDOM.nodeToOffsets(theNode); 

	return (nodeOffsets[0] == curSel[0] && nodeOffsets[1] == curSel[1]); 
	} //selectionIsExactlyOneNode
			


//Return true if number is between a and b, or equal one of them. 
//A should be less than or equal to b.
function isBetween(number, a, b)
	{
	return (number >= a && number <= b); 
	}
	
//If the given offsets bracket children of this node perfectly, do nothing, if not make it so they do. (that is, they are not contained
//in either kid, and are contained in the node itself). Recurse if needed.  
//If either endpoint is a text node, don't adjust the selection at that point. 
function makeOffsetsBracketNodeSet(curDOM, parentNode, selArray, index)
	{
	var startOffset = selArray[index];
	var endOffset = selArray[index+1];
		
	var parentOffsets = curDOM.nodeToOffsets(parentNode); 
	
	if (startOffset == parentOffsets[0] && endOffset == parentOffsets[1])
		return; //Done, the offsets bracket this node
	
	if (startOffset < parentOffsets[0] || endOffset > parentOffsets[1])
		return; //One of the offsets is outside this tag, so they won't be bracketing any kids 
	
	var kidIndex; 
	var foundEnd = false; 
	var foundStart = false; 
	var kidIndex; 
				
	var parentNodeName = parentNode.tagName; 
	var nextOffsets = null; 
	
	var allKidOffsets = new Array();
			
	for (kidIndex1 = 0; kidIndex1 < parentNode.childNodes.length; kidIndex1++)
		allKidOffsets[kidIndex1] = curDOM.nodeToOffsets(parentNode.childNodes[kidIndex1]);
	
	var startIsText = false; 
				
	for (kidIndex=0; kidIndex < parentNode.childNodes.length; kidIndex++)
		{
		var kidOffsets = allKidOffsets[kidIndex]; 		
		
		var prevKidEnd = parentOffsets[0]; 
		var nextKidStart = parentOffsets[1]; 
		
		if (kidIndex != 0)
			prevKidEnd = allKidOffsets[kidIndex - 1][1]; 
		
		if (kidIndex < parentNode.childNodes.length - 1)
			nextKidStart = allKidOffsets[kidIndex + 1][0];
			
		if ( isBetween(startOffset, prevKidEnd, kidOffsets[0]) || isBetween(startOffset , kidOffsets[1], nextKidStart))
			{
			// *** THE SELECTION STARTS NEXT TO THIS KID, EITHER THE BEGINNING OR THE END ***
			
			foundStart = true; //cool...see what we can tell about the end
			startIsText = parentNode.childNodes[kidIndex].nodeType == Node.TEXT_NODE;
			
			if (isBetween(endOffset, kidOffsets[1], nextKidStart))
				return; //Done, they bracket this kid
			
			if (endOffset < kidOffsets[1])
				{
				
				//Start is at an endpoint, end is inside. Move
				//end to the start of this tag (or fix start) and return... 
				
				//...but, if this is a text node, don't do anything at all, just leave the selection alone and return.
				if (startIsText)
					return; 

				if (isBetween(startOffset, prevKidEnd, kidOffsets[0]))
					selArray[index+1] = kidOffsets[1]; 
				else
					selArray[index] = kidOffsets[0]; 
					
				return; 				
				}
			}
		else if (startOffset > kidOffsets[0] && startOffset < kidOffsets[1])
			{
			// *** THE SELECTION STARTS *INSIDE* THIS KID *** 
			startIsText = parentNode.childNodes[kidIndex].nodeType == Node.TEXT_NODE;

			if (isBetween(endOffset, kidOffsets[1], nextKidStart))
				{
				//The sel ends next to this kid, pull start out to the root of this tag. 
				if (!startIsText)
					selArray[index] = kidOffsets[0];
				
				return; 				
				}
			else if (endOffset < kidOffsets[1])	
				{
				//recurse - they're both inside, unless the kid is not an element, in
				//which case, just return - it's OK. 
				if (startIsText)
					return; 
					
				makeOffsetsBracketNodeSet(curDOM, parentNode.childNodes[kidIndex], selArray, index);
				return;				
				}
			else
				{
				//Start is inside this kid, but end is elsewhere. Move the start of the range to 
				//include the kid, and mark foundStart as true. 
				//Move the start of the sel to the start of the kid.
				if (!startIsText)
					selArray[index] = kidOffsets[0];
				foundStart=true;
				}
			}	
		else if (isBetween(endOffset, prevKidEnd, kidOffsets[0]) || isBetween(endOffset, kidOffsets[1], nextKidStart) )
			{
			// *** THE SELECTION ENDS NEXT TO THIS KID ***
			
			/*
			
			bug 50874 makes this fire, though I can't tell why (maybe we're getting a bogus offset for a kid?), and 
			then the insert happens fine anyway, so I'm commenting it out in puzzlement - sam. 
			
			if (!foundStart)
				alert("end but no start in makeOffsetsBracketNodeSet"); 
			*/
			return; //Done, they bracket some set of kids. 
			}	
		else if (endOffset > kidOffsets[0] && endOffset < kidOffsets[1])
			{
			// *** THE SELECTION ENDS *INSIDE* THIS KID ***
			
			if (!foundStart)
				break; //Don't know what's going on, bail out and let offsetsToNode deal with it. 
				
			if (foundStart)
				{
				//start is somewhere else, end is in this node. Move the end to the edge of the node, unless the node is a text node. 
				if (parentNode.childNodes[kidIndex].nodeType != Node.TEXT_NODE)
					selArray[index+1] = kidOffsets[1]; 
				return; 				
				}
			}
		/*
		else if (kidIndex  ==  parentNode.childNodes.length - 1 && isBetween(endOffset, kidOffsets[1], parentOffsets[1]))
			{
			// *** SPECIAL CASE, THE SELECTION
			//If we are at the last kid, and the end offset is past the end of the kid, but not past the end 
			//of the parent node, it's in some whitespace at the end of the child list. Annoyingly, there's no 
			//run for this, so we don't see it in the kid list. Behave as though we were at the end 
			//of the kid list, and just bail out (since the selection is whole tags). 
			return; 			
			}
		*/
		
		}
	

	if (!foundStart || !foundEnd)
		{
		//oops, totally outside the tag. Let offsetsToNode fix it. 
					
		var ancestor = curDOM.offsetsToNode(startOffset, endOffset); 
		var ancestorOffsets = curDOM.nodeToOffsets(ancestor); 
		selArray[index] = ancestorOffsets[0]; 
		selArray[index+1] = ancestorOffsets[1]; 		
		}
	} //makeOffsetsBracketNodeSet
	

//If the current file is a template, and contains an edit region inside a P, B or TT tag, 
//throw up the funky nesting warning. 
function CheckFunkyTemplateNesting()
	{
	var curDOM =  dw.getDocumentDOM('document'); 
	if (curDOM == null)
		return false; 
	
	// Before we do anything we have to do a sync. Otherwise we might
	//	be telling the user they've wrapped tags they ain't got.
	//	We might need to revisit this if the performance hit is too much.
	//	File_Save.js has some code that sniffs for template like things
	//	first that might be reusable.
	//	Bug #160873.
	doSync(curDOM);
	
	var tags = new Array(); 
	
	tags  = tags.concat(curDOM.getElementsByTagName("MMTemplate:Editable")); 
	tags  = tags.concat(curDOM.getElementsByTagName("MMTInstance:Editable"));
	tags  = tags.concat(curDOM.getElementsByTagName("mm:editable"));

	for (var i=0; i<tags.length; i++)
		{
		var curParent = tags[i].parentNode; 
		if (curParent.tagName == "P"  || 
			curParent.tagName == "B"  || 
			curParent.tagName == "LI" || 
			curParent.tagName == "I"  || 
			curParent.tagName == "H1" || 
			curParent.tagName == "H2" || 
			curParent.tagName == "H3" || 
			curParent.tagName == "H4" || 
			curParent.tagName == "H5" || 
			curParent.tagName == "H6" || 
			curParent.tagName == "TT")
			{
			var funkyString = dwscripts.sprintf(MM.FunkyNestingWarning , tags[i].name);
			
			dw.optionalAlert("templateFunkyNesting", funkyString);
			return true;			
			}	
		}
	return false; 
	}	//CheckFunkyTemplateNesting
	
	
//Adjust the selection so that all pairs of offsets are either at the same level in the tree, or select
//exactly the least common ancestor tag that contains the original pair. 
function makeSelectionBeWholeTags(selArray, targetDom)
	{
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return; 

	for (var i=0; i<selArray.length-1; i+=2)
		{
		if (selArray[i] == selArray[i+1])
			continue; 

		makeOffsetsBracketNodeSet(curDOM, curDOM.documentElement, selArray, i);
		}		
	} //makeSelectionBeWholeTags


//This is like insertBlockTemplateTag below, except that it doesn't really do anything with the selection, 
//it just inserts the two fragments at the end of the current selection, and then puts the IP in between 
//them. It's used for objects that don't manipulate the selection. 
function simpleBlockInsert( startFrag, endFrag, targetDom, deferSelection )	
	{
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return; 

	doSync(curDOM); 

	var curSel = curDOM.getSelection(true);

	curDOM.disableLocking();
	//curDOM.source.replaceRange(curSel[0], curSel[curSel.length-1], startFrag + endFrag);
	curDOM.insertHTML( startFrag + endFrag, false);
	
	curDOM.enableLocking();

	var newSelStart = curSel[curSel.length-1]; 
	var newSelEnd = newSelStart + startFrag.length + endFrag.length; 
	
	if (deferSelection)	
		{
		deferredSelStart = newSelStart; 
		deferredSelEnd = newSelEnd; 
		}
	else
		curDOM.setSelection(newSelStart, newSelEnd, false);
		
	curDOM.disableLocking();	
	} //simpleBlockInsert
	 

//Given a set of selection offsets into the document, adjust them prior to doing a template object insert. This 
//will do things like normalize selections in tables, so that a collection of table cells turns into a whole row, 
//fix split paragraphs, etc. This can also be used to see what part of the document will be changed by 
//a template modification - it doesn't change the document directly, or the current selection, it only 
//adjusts the list of offsets passed in. 	 
function adjustSelectionForTemplateInsert(curSel, curDOM, contentType, resultsObj)
	{
	resultsObj.replaceSel = false; 
	resultsObj.isTableSel = false; 
	
	if (curSel.length == 0)
		return curSel; 
		
	var replaceSelection = new Object(); 
	replaceSelection.value = false; 
			
	//If all of a P tag is selected, select the P tag too. 
	curSel = normalizeSelectionForParagraphs(curSel, curDOM, replaceSelection); 
	resultsObj.replaceSel = replaceSelection.value;

	//Normalize for table selections, make entire rows selected if needed.
	var isTableSelObj = new Object(); 
	isTableSelObj.value = false; 
										
	if (contentType == "repeating" || contentType == "conditional" || curSel.length > 2)
	{		
		curSel = normalizeSelectionForTables(curSel, curDOM, isTableSelObj);
		resultsObj.isTableSel = isTableSelObj.value;
	}
	else
	{
		// If selection is a single table cell, select just the contents of the cell
		curSel = normalizeSelectionForTableCell(curSel, curDOM, replaceSelection);
		resultsObj.replaceSel = replaceSelection.value;
	}

	// If selection is surrounded by anchor tags, select them too.
	curSel = normalizeSelectionForAnchors(curSel, curDOM, replaceSelection);
	resultsObj.replaceSel = replaceSelection.value;

	// Add <li> tags where appropriate
	curSel = normalizeSelectionForLists(curSel, curDOM, replaceSelection);
	resultsObj.replaceSel = replaceSelection.value;

	return curSel; 
	} //adjustSelectionForTemplateInsert
	
// used for both the conditional and repeat tag cases, this inserts a tag 
// around the current selection. 
// startFrag should be the start tag plus any parameters. endFrag is the ending tag 
//
//
// Note - this is the one exception to the entity encoding rule above - usually callers 
// to this routine need to build a fragment that contains the 'cond' or 'name' attribute, 
// and the value of that attribute needs to be encoded, so they do it before calling - this 
// routine can't separate out the values from the HTML part of the fragment, so it can't do any 
// encoding. 
//
//
function insertBlockTemplateTag( startFrag, endFrag, targetDom, optionalContent, contentType,
								 regionName, deferSelection )	
	{		
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return; 
	
	//Make sure we sync before getting the selection, otherwise we may get the wrong selection if we are working 
	//in codeview. 
	doSync(curDOM); 
	
	var curSel = curDOM.getSelection(true);
	var selectedText = "";

	if (curSel.length == 0) //No Selection, just insert
		{		
		curDOM.disableLocking();
		curDOM.insertHTML(startFrag + dwscripts.minEntityNameEncode(optionalContent) + endFrag, false); 
		//curDOM.enableLocking();
		return;
		}
	
	var resultObj = new Object(); 
	curSel = adjustSelectionForTemplateInsert(curSel, curDOM, contentType, resultObj);
		
	if (curSel.length == 2) 
		{
		//If the selected node is a TD, we want to wrap the editable around it's contents, if they are entirely selected.  
		var selectedNode = curDOM.offsetsToNode(curSel[0], curSel[1], false);
		if (selectedNode.tagName == "TD" && (curSel[1] - curSel[0] == selectedNode.innerHTML.length) )
			{
			curDOM.disableLocking();
			
			//This weird bit of code is here because the selection code will tell me a TD is selected when, in
			//fact, the IP is just inside it. In this case, I'll just use the optional content to 
			//fill the edit region, so we don't insert an empty one. 
			var codeToInsert = selectedNode.innerHTML; 
			if (codeToInsert.length == 0)
				codeToInsert = dwscripts.minEntityNameEncode(optionalContent);
							
			selectedNode.innerHTML = startFrag + codeToInsert + endFrag;
			//curDOM.enableLocking();
			return;
			}
		else
			{
			//SES 11/9/01 - this line was commented out, because it was causing bug 49160. 
			// If you comment it out, then 45611 comes back. I've modified the 
			//call itself to be more careful about when it adjusts the selection - I think both bugs are quiescent for now.
			makeSelectionBeWholeTags(curSel, curDOM); 
			}
		}

	//The selection is either a) a complex selection that isn't a table b) a number of table cells, or c) 
	//just a simple text selection. In any event, wrap the the entire selection with the tag fragments.
		 
	var selSpansTableCells = selectionSpansTableCells(curSel, curDOM); 
	if ( selSpansTableCells )
		{
		alert(MM.TEMPLATE_UTILS_MultipleCellsNotAllowed);
		return;
		}
		
	// If the selection was empty, or it's just an empty paragraph that we're
	// going to replace, then use the old JavaScript implementation.  Otherwise,
	// call through to C++ code to properly handle unbalanced selection ranges.
	if ( resultObj.replaceSel || 
		 curSel[0] >= curSel[curSel.length-1] || 
		 resultObj.isTableSel || 
		 selectionIsExactlyOneNode(curSel, curDOM) || 
		 selSpansTableCells )
		{	
//		doSync(curDOM);

		if ( contentType == "editable" && checkForTemplateMarkupOverlap(curSel, curDOM))
			{
			alert(MM.MSG_AlreadyEdit);
			return;
			}
			
		var selectedText = curDOM.documentElement.outerHTML.slice(curSel[0],curSel[curSel.length-1]);
		//if the selection was in an empty paragraph, we will just replace the entire paragraph with 
		//the new code - so pretend the sel string is empty, but don't change the sel range, so it gets replaced.
		if (resultObj.replaceSel)
			selectedText = ""; 
			
		//If there is no selection, use the 'optional content' passed in - typically the name of the 
		//region being created. 	
		if (selectedText.length == 0)
			selectedText = dwscripts.minEntityNameEncode(optionalContent); 
				
		curDOM.disableLocking();
		// jschang 2/21/02 - I changed this to insertHTML after fixing the C++ in 
		// DocSpliceRange.cpp to treat template tags as invisible instead of 
		// forcing them to the body root, thus splitting any parent tag they 
		// may be inside
		//curDOM.source.replaceRange(curSel[0], curSel[curSel.length-1], startFrag + selectedText + endFrag);
		curDOM.setSelection(curSel[0],curSel[curSel.length-1], false);		
		curDOM.insertHTML(startFrag + selectedText + endFrag, true);
		curDOM.enableLocking();
		
		//var newSelStart = curSel[0] + startFrag.length; 
		
		//What is all this nonsense with newSelStart? Well, something is inserting whitespace during the insertHTML call above, so 
		//sometimes the selection range here is wrong. So...we have to look for the string we just inserted. To be (moderately) 
		//efficient about this, we do the search starting near where we inserted it. 
		//Finally, to make all this even sillier, if we can't get a match, we have to give up, and not fix the selection. Whee! 
		//SES 3.27.02
				
		var newSelStart = -1; 
		var newDocSource = curDOM.documentElement.outerHTML; 
				
		for (var count = 1; count < 10 ; count++)
			{
			if (10*count > curSel[0])
				break; //Off the beginning of the doc
				
			newSelStart = newDocSource.indexOf(startFrag, curSel[0] - 10*count); 
			if (newSelStart != -1)
				{
				newSelStart += startFrag.length;
				break;
				} 
			}
			
			
		if (newSelStart != -1)
			{
			if (deferSelection)	
				{
				deferredSelStart = newSelStart; 
				
				//If the sel spans table cells, don't select them, just make the sel be an IP.
				if (selSpansTableCells || resultObj.isTableSel)
					deferredSelEnd = deferredSelStart;
				else
					deferredSelEnd = newSelStart + selectedText.length; 
				}
			else
				{
				//Don't do the selection if the sel spans table cells, it causes the paginator to choke. 
				if (!selSpansTableCells && !resultObj.isTableSel)
					curDOM.setSelection(newSelStart, newSelStart + selectedText.length, false);
				else
					curDOM.setSelection(newSelStart, newSelStart, false);
				}
			}
		
		
		curDOM.disableLocking();
		}
	else
		{
		curDOM.createTemplateRegion( curSel[0], curSel[curSel.length-1], contentType, regionName );
		}
	} //insertBlockTemplateTag


//Return an edit region that is legal to insert into. This should only be used for nested templates. 
function getLegalHeadInsertNode(curDOM)
	{
	var headNode = curDOM.getElementsByTagName("HEAD").item(0);

	if (headNode == null)
		return null; 
		
	// Find an editable region in the head we can insert into, if we are a template.
	// Try to avoid using the "doctitle" region if we can help it, since it looks
	// wierd to dump other stuff in there.
	var headInsertNode = null; 
	var edits = headNode.getElementsByTagName("MMTInstance:Editable"); 
	
	var doctitleRegion = null;
	for (var i=0; i<edits.length;i++) 
		if (edits.item(i).name != "doctitle")
			return edits.item(i);
		else
			doctitleRegion = edits.item(i); 
	
	return doctitleRegion;
	} //getLegalHeadInsertNode
	

//check to see if we can insert a template parameter in this document. The only interesting case is if 
//the document is a nested template. In this case, we need to look for an editable region in the head, to insert
//the param into. If we can't find such a region, warn the user and return false, otherwise return true. 
function checkInsertTemplateParam(targetDom)
	{
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return false; 
	
	if (curDOM.getAttachedTemplate() == "")
		return true; //We're not a nested template, just insert anywhere in the head. 
	
	if (getLegalHeadInsertNode(curDOM) == null)
		{
		alert(MM.TEMPLATE_UTILS_FeedYourHead); 
		return false;
		}
		
	return true; 
	} //checkInsertTemplateParam
	
//Insert a parameter of this name, value, type. Fail if there is already a param of this name. 
//Type must be one of "boolean", "number", "color", "text", or "link". 

//The param name is not encoded. 
function insertTemplateParam(paramName, paramType, defaultValue, targetDom)
	{
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return false; 
	
	var paramTag = getTemplateParamTag(paramName, curDOM); 
	if (paramTag != null)
		{
		curDOM.disableLocking();
		doSync(curDOM);
		paramTag.name = paramName; 
		paramTag.type = paramType;
		paramTag.value = defaultValue; 
		doSync(curDOM);
	//	curDOM.enableLocking();
		return true;
		}
	
	doSync(curDOM);
	var headNode = curDOM.getElementsByTagName("HEAD").item(0);
	
	var paramHTML; 
	
	if (dw.generateTemplateTagSyntax())
		paramHTML = "<MMTemplate:Param name=\"" + paramName + "\" type=\"" + paramType + "\" value=\"" + defaultValue + "\"/>";
	else
		paramHTML = "<!-- TemplateParam name=\"" + paramName + "\" type=\"" + paramType + "\" value=\"" + defaultValue + "\" -->"; 
	
	var insertNode = headNode; 
		
	//If we're a template, make sure to insert the param into an editable region in the head node. 
	if (curDOM.getAttachedTemplate() != "")
		{		
		insertNode = getLegalHeadInsertNode(curDOM);
		if (insertNode == null)
			return false; 
		
		}
	
	var newHTML = insertNode.innerHTML; 
	newHTML += paramHTML;
	
	curDOM.disableLocking();
	insertNode.innerHTML = newHTML; 
	//curDOM.enableLocking();

	return true;
	} //insertTemplateParam
	

//Pass this function an MMTInstance tag, and it will return true if it's a passthrough. 
function IsPassthroughParam(paramTag)
	{
	return (typeof paramTag.passthrough != "undefined" && paramTag.passthrough == "true");	
	} //IsPassthroughParam
	

//returns the node for the MMTemplate::Parameter tag of this name, if there is one. 
function getTemplateParamTag(paramName, targetDom)
	{
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return null; 

	var params = curDOM.getElementsByTagName("MMTemplate:Param");
	
	//Check for normal params...
	var i; 
	var curParam; 
	for (i = 0; i < params.length; i++)
		{
		if (dwscripts.minEntityNameDecode(params.item(i).name) == paramName)
			return params.item(i);
		}
		
	//check for passthrough params in templates...
	var passthroughs = curDOM.getElementsByTagName("MMTInstance:Param");
	for (i = 0; i < passthroughs.length; i++)
		{
		if (dwscripts.minEntityNameDecode(passthroughs.item(i).name) == paramName && passthroughs.item(i).passthrough == "true")
			return passthroughs.item(i);
		}

	return null;	
	} //getTemplateParamTag
	
	
	
//Return a set of the param tags for the selected document, or the doc passed in.
//if filter is non-null, only return params who's 'type' field matches.  	
function getTemplateParams(filter, targetDom)
	{
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return null; 

	var allParams; 
	allParams = curDOM.getElementsByTagName("MMTemplate:Param");

	//Check for normal params..."
		
	if (filter == null)
		return allParams; 	
		
	var filteredParams = new Array(); 
	for (i=0;i<allParams.length; i++)
		{		
		if (allParams.item(i).type == filter)
			filteredParams.push(allParams.item(i));
		}
	return filteredParams;
	} //getTemplateParams
	
	
	
	
//Walk up the tree from the selected node and look for a parent tag of this type. 
function selectionIsContainedInTagOfType(curSel, tagType, targetDom, wantExactMatch)
	{		
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return false; 
	
	
	/* 
	If this code is in, when a row is selected, this transforms the sel into the whole table. 
	If the row contained an editable region, this becomes illegal - we'll allow
	a repeating region inside the edit. 
	if (curSel.length > 2)
		curSel = curDOM.getSelection(false, false);
	*/ 	
	
	
	//Scan all the endpoints, make sure none of them are inside a tag of this type. 
	for (i=0;i<curSel.length;i++)
		{
		var curNode = curDOM.offsetsToNode(curSel[i], curSel[i], false); 

		if (curNode == null)
			return false; 
				
		var temp = curNode.tagName; 		
		if (curNode.tagName == tagType)
			{
			//There's a weird bug in the selection code - if the sel is an IP, right next to an edit, it will 
			//return the edit as the selected node, not a text range. Check for that here. 
			var isFake = false; 
			
			var selStart, selEnd; 
			if (i % 2 == 0)
				{
				selStart = curSel[i]; 
				selEnd = curSel[i+1]; 
				}
			else
				{
				selStart = curSel[i-1]; 
				selEnd = curSel[i];
				}
			
			var matchOffsets = curDOM.nodeToOffsets(curNode); 

			if (i < curSel.length-1 && selStart == selEnd) 
				{
				if (selStart <= matchOffsets[0] || selEnd >= matchOffsets[1])
					isFake = true; 
				}
			
			var isExactMatch = (matchOffsets[0] == selStart && matchOffsets[1] == selEnd); 

			if (!isFake)
				{
				if ( (isExactMatch && wantExactMatch) || !isExactMatch)
					return true; 
				}
			curNode = curNode.parentNode; //Go up to the next level, we've made our decision about this one, 
													//and it will confuse the upcoming loop if we leave this here. 
			}
					
		while (curNode != null)
			{
			var curName = curNode.tagName;
			if (curNode.tagName == "BODY" || curNode.tagName == "HTML")
				return false; 
				
			if (curNode.tagName == tagType)
				return true; 
			
			curNode = curNode.parentNode;
			}
		}
					
	return false; 
	} //selectionIsContainedInTagOfType
	
	
//given a node in the DOM, return the first ancestor (parent, grandparent, etc) of the passed nodeType. 
function getNodeAncestorOfType(node, ancestorType)	
	{
	var curNode = node.parentNode; 
	while (curNode != null)
		{
		if (curNode.tagName == ancestorType)
			return curNode; 
			
		curNode = curNode.parentNode; 
		}
	
	return null; 
	} //getNodeAncestorOfType
		
function selectionContainsTemplateMarkup(curDOM, selArray)
	{
	var selections = curDOM.getSelection(true, false); 
	if (selections.length == 0)
		return false; 
		
	var min = selections[0]; 
	var max = selections[1]; 

	for (i = 2; i<selections.length-1;i = i+2)
		{
		if (selections[i] < min)
			min = selections[i]; 
		
		if (selections[i+1] > max)
			max = selections[i+1];
		}
	var selectedText = curDOM.documentElement.outerHTML.slice(min,max);
	
	return (selectedText.indexOf("<MMTemplate:") != -1 || selectedText.indexOf("<mm:editable") != -1); 
	} //selectionContainsTemplateMarkup
		
		
//Return true if the selection is more than 1 table cell.
function selectionSpansTableCells(curSel, targetDom)
	{	
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curSel == null)
		curSel = curDOM.getSelection(true, false);

	var tableCellCount = 0; 
	
	for (var i=0; i<curSel.length;i=i+2)
		{
		var selectedNode = curDOM.offsetsToNode(curSel[i], curSel[i+1], false);
		
		if (selectedNode.nodeType == Node.ELEMENT_NODE && 
			selectedNode.tagName == 'TD')
			{
			tableCellCount++; 
			
			if (tableCellCount > 1)
				return true; 
			}
		}

	return false; 
	} //selectionSpansTableCells
	
	
function isTDinTRNodeSelected(theNode, curSel, targetDom)
	{
	if (theNode == null || theNode == 0)
		return true;
	
	var theNodeOffsets = targetDom.nodeToOffsets(theNode);

	for (var i=0; i<curSel.length;i=i+2)
		{
		if( (curSel[i] == theNodeOffsets[0]) && (curSel[i+1] == theNodeOffsets[1]) )
			return true;
		}
	
	return false;
	}
	
function checkSelectedTDForSelectedSiblings(theNode, curSel, targetDom)
	{
	if (theNode == null )
		return false;
		
	if (theNode.nodeType == Node.ELEMENT_NODE && 
		theNode.tagName == 'TD')
		{
		var trNode = getNodeAncestorOfType(theNode, 'TR');	
		if (trNode != null)
			{
			var childNode = null;
			for(childNode in trNode.childNodes)
				{
				if ( !isTDinTRNodeSelected(trNode.childNodes[childNode], curSel, targetDom) )
					return true;
				}
			}
		}
		
	return false;
	}
	
function checkSelectionSpansTableCellsButNotTableRow(curSel, targetDom)
	{	
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curSel == null)
		curSel = curDOM.getSelection(true, false);

	// Check the first and last selected nodes. If either are TD's
	//	then its possible we have a few TD's selected, but not all
	//	of them.
	var startNode = null;
	if( curSel.length >= 2 )
		startNode = curDOM.offsetsToNode(curSel[0], curSel[1], false);
	var endNode = null;
	if( curSel.length >= 4 )
		endNode = curDOM.offsetsToNode(curSel[curSel.length-2], curSel[curSel.length-1], false);
		
	var onlyOneTDSelected = endNode == null;
	
	// If either the start or end are TD's, ensure all their sibling TD's are selected as well
	return !onlyOneTDSelected && (checkSelectedTDForSelectedSiblings(startNode, curSel, targetDom) 
									|| checkSelectedTDForSelectedSiblings(endNode, curSel, targetDom));
						
	}
	
//Return true if the selection is more than 1 table cell in more than one row
function selectionSpansTableRows(curSel, targetDom)
	{	
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curSel == null)
		curSel = curDOM.getSelection(true, false);

	var tableCellCount = 0; 
	var lastRow = null; 
	
	for (var i=0; i<curSel.length;i=i+2)
		{
		var selectedNode = curDOM.offsetsToNode(curSel[i], curSel[i+1], false);
		
		if (selectedNode.nodeType == Node.ELEMENT_NODE && 
			selectedNode.tagName == 'TD')
			{
			tableCellCount++; 
			var curRow = selectedNode.parentNode; 
			
			if (tableCellCount > 1 && lastRow != null && lastRow != curRow)
				return true; 
			
			lastRow = curRow; 
			}
		}

	return false; 
	} //selectionSpansTableRows

	
//Return true if we can insert or make the selection in to the named content type. contentType should be "editable", "repeating" 
//or "optional". targetDom can be null. 
function canMakeTemplateContent(contentType, targetDom, result)
	{			
	result.status = "OK"; 
	
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		{
		result.status = "no doc"; 
		return false; 
		}
	
	/* fix for bug 58728 - on windows, sometimes the site window has the focus even when there's a document open - so look for site as well  */	
	if (!focusIsLegalForTemplateMods())
		{
		result.status = "focus"; 
		return false; 
		}
	
				
	//Check the selection...need to make sure we're not inside a library item, and rule out other 
	//illegal template nestings, like editable inside editable.
	
	if (curDOM.getIsLibraryDocument())
		{
		result.status = "libraryDoc"; 
		return false; 
		}
		
	var curSel = curDOM.getSelection(true); 

	// Before we muck with the selection, make sure the initial one is kosher
	if( checkSelectionSpansTableCellsButNotTableRow(curSel, curDOM) )
		{
		result.status = "tableCells";
		return false;
		}
		
	//Adjust the selection so that it matches what the insert code will do, exactly. 
	var dontCare = new Object(); 
	curSel = adjustSelectionForTemplateInsert(curSel, curDOM, contentType, dontCare);
	
	var attachedTemplate = curDOM.getAttachedTemplate();
	if (attachedTemplate != null && attachedTemplate != "")
		{		
		var one = selectionIsContainedInTagOfType(curSel, "MMTEMPLATE:EDITABLE", curDOM, false); 
		var two = selectionIsContainedInTagOfType(curSel, "MMTINSTANCE:EDITABLE", curDOM, false); 
		var three = selectionIsContainedInTagOfType(curSel, "MM:EDITABLE", curDOM, false); 

		//We're in a template instance. Can only make new template content if we are inside an editable region. 
		if (!selectionIsContainedInTagOfType(curSel, "MMTEMPLATE:EDITABLE", curDOM, false)  && 
			!selectionIsContainedInTagOfType(curSel, "MMTINSTANCE:EDITABLE", curDOM, false) &&
			!selectionIsContainedInTagOfType(curSel, "MM:EDITABLE", curDOM, false) )
			{
			result.status = "locked"; 
			return false; 
			}
				
		//Weird edge case - in a template with no editable regions, the selection will be in the head, and bad things will happen. 
		//Disallow this case. This is related to bug 63178
		var bodyTag =	curDOM.getElementsByTagName("BODY")[0]; 
		var bodyOffsets = curDOM.nodeToOffsets(bodyTag); 
		
		for (var selIndex = 0; selIndex < curSel.length; selIndex++)
			if (curSel[selIndex] <= bodyOffsets[0])
				{
				result.status = "locked"; 
				return false;			
				}
		}
	
	
	//If we are asking about an editable region, we can't be inside an edit tag, or have an edit tag selected. 
	//The other kinds of content are only disallowed inside an editable region. 
	var wantExactMatch = (contentType == "editable"); 
		
	if ( selectionIsContainedInTagOfType(curSel, "MMTEMPLATE:EDITABLE", curDOM, wantExactMatch))
		{
		result.status = "contained in edit";
		return false; 
		}
		 
	if (selectionIsContainedInTagOfType(curSel, "MM:EDITABLE", curDOM, wantExactMatch))
		{
		result.status = "contained in DW4 edit"; 
		return false; 
		}
		   
	if ( contentType == "editable" && 
		  (/* selectionSpansTableCells(null, curDOM)   || */
		   /* selectionSpansTableRows(null, curDOM) || commented out to fix bug 49159 */ 
		   checkForTemplateMarkupOverlap(curSel, curDOM) ) )
		{
		result.status = "markup overlap";
		return false; 
		}
					
	return true; 	
	}//canMakeTemplateContent
	

//Return true if this string is legal to use as an editable region name, a repeat region name, or a parameter name. 
function checkLegalTemplateName(theName)
	{
	if (theName.length ==  0)
		{
		alert(MM.TEMPLATE_UTILS_EmptyName); 
		return false;
		}
	else if (theName.search(/[<>&"']/) != -1)
		{
		alert(MM.TEMPLATE_UTILS_IllegalName);
		return false; 
		}
		 	
	return true; 
	} //checkLegalTemplateName


//Store a global preference flag for the templates feature in the design notes file for this file. 	
function setGlobalTemplatePref(prefName, prefValue)
	{	
	var path = dreamweaver.getConfigurationPath() + '/Shared/MM/Scripts/CMN/TemplateUtils.js';
	
	var metaFile;

	metaFile = MMNotes.open(path, true); // Force create the note file.
	if (metaFile) 
		{
	 	MMNotes.set(metaFile, prefName, prefValue);
	 	MMNotes.close(metaFile);
		}
	} //setGlobalTemplatePref
	
	
//Retrive a global preference flag for this feature. 
function getGlobalTemplatePref(prefName, defaultValue)
	{
	var autoAdd, rtnValue = defaultValue;
	var path = dreamweaver.getConfigurationPath() + '/Shared/MM/Scripts/CMN/TemplateUtils.js';
	var metaFile;
	metaFile = MMNotes.open(path, false);
	if (metaFile)
		{
	 	autoAdd = MMNotes.get(metaFile, prefName);
	 	if (autoAdd) 
	 		rtnValue = autoAdd;
	 	MMNotes.close(metaFile);
		}

	return rtnValue;
	} //getGlobalTemplatePref


//Call this if you want to confirm with the user that a new param should be created. 
//Return true if they want to create, false if not. 
function CheckWarnCreateAttribute(paramName)
	{
	var curDOM = dw.getDocumentDOM('document'); 
	return RunDSConfirmDialog(MM.TEMPLATE_UTILS_DoCreateParam, "showCreateAttrWarning", true); 
	} //CheckWarnCreateAttribute
	
	
//Check to see if this document is a template document, and warn the user if not. 
function CheckWarnNoTemplate(targetDom)
	{
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	
	if (curDOM == null)
		return true; 
		
	if (curDOM.getIsTemplateDocument() )
		return true; 
				
	return RunInfoDSDialog(MM.NewTemplateWarning, "showCreateWarning", true); 
	} //CheckWarnNoTemplate
	
	
	
//Return the a number that will yield a uniquely named region with the given tag and preamble.
function getUniqueRegionCount(preamble, regionTag, curDOM)
	{
	var elements = curDOM.getElementsByTagName(regionTag);
	for (var i=0;i<100; i++) 
		{
		var curString = preamble + (elements.length + i + 1); 
		var foundMatch = false; 
		for (var j=0; j<elements.length;j++)
			{
			if (elements[j].name == curString)
				{
				foundMatch = true; 
				break; 
				}		
			}
			
		if (!foundMatch)
			return elements.length + i + 1; 
		}
		
	return -1; //Give up, just return the preamble and let the user deal with it. 
	} //getUniqueRegionCount
	
//Find a unique name for a template region that uses the given tag. Use preamble as the preamble for the name, plus 
//the first integer after the current tag count that makes it unique. 
function getUniqueRegionName(preamble, regionTag, curDOM)
	{
	var index = getUniqueRegionCount(preamble, regionTag, curDOM); 
	
	if (index == -1)
		return preamble; 
	
	return preamble + index; 
	} //getUniqueRegionName
	
	
//If the given document has template tags in it (MMTemplate:Editable, MMTemplate:If, MMTemplate:Expr
// or MMTemplate:Repeat) return true, otherwise return false; 
function documentHasTemplateFeatures(targetDOM)
	{
	var curDOM = (targetDOM == null) ? dw.getDocumentDOM('document') : targetDOM; 
	if (curDOM == null)
		return false; 

	return ( curDOM.getElementsByTagName("MMTemplate:Editable").length != 0 || 
			 	curDOM.getElementsByTagName("MMTemplate:If").length != 0 		|| 
			 	curDOM.getElementsByTagName("MMTemplate:Expr").length != 0 	|| 
			 	curDOM.getElementsByTagName("MMTemplate:Repeat").length != 0 	);	
	} //documentHasTemplateFeatures
	
//Return true if there are any editable regions in this document. 
function documentHasEditAreas(targetDOM)
	{
	var curDOM = (targetDOM == null) ? dw.getDocumentDOM('document') : targetDOM; 
	if (curDOM == null)
		return false; 

	if ( curDOM.getElementsByTagName("MMTemplate:Editable").length != 0 || 
		  curDOM.getElementsByTagName("mm:editable").length != 0 		) 
		return true; 
		
	var instanceEdits = curDOM.getElementsByTagName("MMTInstance:Editable");
	
	if (instanceEdits.length > 0) 
		{
		//return false if these are all non-passthrough. 
		for (var i=0; i<instanceEdits.length;i++) 
			if (curDOM.editIsPassthrough(instanceEdits.item(i)))
				return true; 
		} 
		
	return false; 
	} //documentHasEditAreas


//Run a Confirm/Don't show dialog, using messageString as the message. Store the "don't show again" 
//setting in the preference under preferenceName. If the value in the preference is already 
//set to false, just return the defaultResult value, otherwise run the dialog, and return whatever was clicked
//on, true for OK, false for cancel.	
function RunDSConfirmDialog(messageString, preferenceName, defaultResult)
	{
	if (getGlobalTemplatePref(preferenceName, "TRUE") == "FALSE")
		return defaultResult; 

	var retVal = false;
	var cmdName = 'ConfirmDSStandardButtons.htm';
	var cmdFile = dreamweaver.getConfigurationPath() + '/Commands/' + cmdName;

	var cmdDOM = dreamweaver.getDocumentDOM(cmdFile);
	var retVal = defaultResult; 
	
	if (cmdDOM) 
		{		
		MMNotes.Confirm_RESULT = true;  		 
		dw.runCommand(cmdName, messageString);
		retVal = MMNotes.Confirm_RESULT; // Reference to confirm global result.
		
		if (MMNotes.Confirm_DONOTSHOW) 
			setGlobalTemplatePref(preferenceName, 'FALSE');
		}
	
	return retVal; 	
	} //RunDSConfirmDialog
	
function RunInfoDSDialog(messageString, preferenceName, defaultResult)
	{
	if (getGlobalTemplatePref(preferenceName, "TRUE") == "FALSE")
		return defaultResult; 

	var retVal = false;
	var cmdName = 'ConfirmDS.htm';
	var cmdFile = dreamweaver.getConfigurationPath() + '/Commands/' + cmdName;

	var cmdDOM = dreamweaver.getDocumentDOM(cmdFile);
	var retVal = defaultResult; 
	
	if (cmdDOM) 
		{		
		var cmdWin = cmdDOM.parentWindow;		
		cmdWin.render(messageString, MM.TEMPLATE_UTILS_Label_OK);
		cmdWin.setIcon("../Shared/MM/Images/infoIconWin.gif"); 

		MMNotes.Confirm_RESULT = true;  		 
		dw.runCommand(cmdName, messageString);

		retVal = MMNotes.Confirm_RESULT; // Reference to confirm global result.
		
		if (MMNotes.Confirm_DONOTSHOW) 
			setGlobalTemplatePref(preferenceName, 'FALSE');
		}
	
	return retVal; 	
	} //RunInfoDSDialog
	

	
//Same as RunDSConfirmDialog, except just one button, and it says  
function RunInfoDialog(messageString)
	{
	var cmdName = 'ConfirmDS.htm';
	var cmdFile = dreamweaver.getConfigurationPath() + '/Commands/' + cmdName;

	var cmdDOM = dreamweaver.getDocumentDOM(cmdFile);
	
	if (cmdDOM) 
		{
		var cmdWin = cmdDOM.parentWindow;		
		cmdWin.render(messageString, MM.TEMPLATE_UTILS_Label_OK);
		cmdWin.hideDSCheck(); 
		cmdWin.setIcon("../Shared/MM/Images/infoIconWin.gif"); 
		
		MMNotes.Confirm_RESULT = true;  		 
		dw.runCommand(cmdName);
		}
	
	} //RunInfoDialog


//Same as RunDSConfirmDialog, except the buttons say "Yes" and "No" and cancel. Yes is 1, no is 0, cancel is -1. 
function RunDSConfirmDialog_YesNoCancel(messageString, preferenceName, defaultResult)
	{
	if (getGlobalTemplatePref(preferenceName, "TRUE") == "FALSE")
		return defaultResult; 

	var retVal = false;
	var cmdName = 'ConfirmDS.htm';
	var cmdFile = dreamweaver.getConfigurationPath() + '/Commands/' + cmdName;

	var cmdDOM = dreamweaver.getDocumentDOM(cmdFile);
	var retVal = defaultResult; 
	
	if (cmdDOM) 
		{
		var cmdWin = cmdDOM.parentWindow;
		cmdWin.render(messageString, MM.TEMPLATE_UTILS_Label_Yes, MM.TEMPLATE_UTILS_Label_No, MM.TEMPLATE_UTILS_Label_Cancel);
		
		MMNotes.Confirm_RESULT = true;  		 
		dw.runCommand(cmdName);
		if (MMNotes.Confirm_RESULT == MM.TEMPLATE_UTILS_Label_Yes)
			retVal = 1; 
		else if (MMNotes.Confirm_RESULT == MM.TEMPLATE_UTILS_Label_No)
			retVal = 0; 
		else
			retVal = -1; 
		
		if (MMNotes.Confirm_DONOTSHOW) 
			setGlobalTemplatePref(preferenceName, 'FALSE');
		}
	
	return retVal; 	
	} //RunDSConfirmDialog_YesNo


//Same as RunDSConfirmDialog, except the buttons say "Yes" and "No". 
function RunDSConfirmDialog_YesNo(messageString, preferenceName, defaultResult)
	{
	if (getGlobalTemplatePref(preferenceName, "TRUE") == "FALSE")
		return defaultResult; 

	var retVal = false;
	var cmdName = 'ConfirmDS.htm';
	var cmdFile = dreamweaver.getConfigurationPath() + '/Commands/' + cmdName;

	var cmdDOM = dreamweaver.getDocumentDOM(cmdFile);
	var retVal = defaultResult; 
	
	if (cmdDOM) 
		{
		var cmdWin = cmdDOM.parentWindow;		
		cmdWin.render(messageString, MM.TEMPLATE_UTILS_Label_Yes, MM.TEMPLATE_UTILS_Label_No);
		
		MMNotes.Confirm_RESULT = true;  		 
		dw.runCommand(cmdName);
		retVal = (MMNotes.Confirm_RESULT == MM.TEMPLATE_UTILS_Label_Yes); // Reference to confirm global result.
		
		if (MMNotes.Confirm_DONOTSHOW) 
			setGlobalTemplatePref(preferenceName, 'FALSE');
		}
	
	return retVal; 	
	} //RunDSConfirmDialog_YesNo
	


//if this document is not already a template, if it has template features in it (editable regions, conditionals, or repeats)
//ask the user if they want to save it as a template, and, if so, return true. If they don't want to save it as a template,
//or it doesn't have template features, or it is already a template, return false. 
function AskSaveAsTemplate(targetDom)
	{
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return false; 

	if (getGlobalTemplatePref("showSaveAsTemplateWarning", "TRUE") == "FALSE")
		return false; 
	
	if (curDOM.getIsTemplateDocument() || !dw.canSaveDocumentAsTemplate(curDOM))
		return false; 
		
	if (documentHasTemplateFeatures(curDOM))
		return RunDSConfirmDialog_YesNo(MM.TEMPLATE_UTILS_DoSaveAsTemplate, "showSaveAsTemplateWarning", true); 
		
	return false; 
	} //AskSaveAsTemplate
	
	
//Check to see if this document has any editable areas in it. If not, ask the user if they really want to save
//it as a template. 
function AskIfNoEditableAreas(targetDom)
	{
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return false; 

	if (!documentHasEditAreas(curDOM))
		return RunInfoDialog(MM.TEMPLATE_UTILS_NoEditAreas); 
	
	return true; //Do the save - it has editable areas.
	} //AskIfNoEditableAreas
		

//see if curSelNode is inside a repeat entry inside the given targetRegion. Return the 
//entry it's inside of, if so, otherwise return null. If it's in a repeat entry and the entry is 
//not in the targetRegion, also return null. Pass null for targetRegion to match any region. 
function findContainingRepeatEntry(curDOM, targetRegion, curSelNode)
	{
	while (curSelNode != null && curSelNode.tagName != "BODY")	
		{
		var curSelNodeTagName = curSelNode.tagName; 
		
		if (curSelNode.tagName == "MMTINSTANCE:REPEATENTRY" && (targetRegion == null || getRepeatEntryParentRegion(curSelNode) == targetRegion))
			return curSelNode; 
		
		curSelNode = curSelNode.parentNode; 
		}
		
	return null; 
	} //findContainingRepeatEntry
	
	
function nodeIsInRepeatingRegion(curDOM, targetRegion, curSelNode)
	{
	return findContainingRepeatEntry(curDOM, targetRegion, curSelNode) != null;
	} //nodeIsInRepeatingRegion
	
//The routine below, getSelectedRepeatEntry, is too slow to use for things like context menus. If the 
//selection is large (like a lot of cells in a table), it really bogs down. This routine 
//will occasionally return a false positive, but is much faster - it just checks the endpoints. 
function fastCheckForSelectedRepeatEntry(targetDom, targetRegion)
	{
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return null; 
			
	var curSel = curDOM.getSelection(true, false); 

	if (curSel.length < 2 || curSel[0] == -1) 
		return null; 

	var startNode = curDOM.offsetsToNode(curSel[0], curSel[0], false); 
	var endNode = curDOM.offsetsToNode(curSel[curSel.length-1], curSel[curSel.length-1], false); 
	
	if (nodeIsInRepeatingRegion(curDOM, targetRegion, startNode))
		return true; 
	else if (endNode != startNode && nodeIsInRepeatingRegion(curDOM, targetRegion, endNode))
		return true; 
		
	return false; 
	} //fastCheckForSelectedRepeatEntry
	
	
/* Return true if the selection is inside a repeated entry node, or if the
 * entire node is selected. If targetRegion isn't null, keep walking up the tree until 
 * we are in a child of this region, or get to the root of the document.
 */
function getSelectedRepeatEntry(targetDom, targetRegion)
	{			
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return null; 
			
	var curSel = curDOM.getSelection(true, false); 

	if (curSel.length < 2 || curSel[0] == -1) 
		return null; 

	for (i = 0; i < curSel.length-1; i=i+2)
		{
		var curSelNode = curDOM.offsetsToNode(curSel[i], curSel[i+1], false); 
		var repeatEntryParent = findContainingRepeatEntry(curDOM, targetRegion, curSelNode);
		if (repeatEntryParent != null)
			return repeatEntryParent; 
		}
		
	return null; 
	} //getSelectedRepeatEntry


//Scan the document for MMTInstance:Repeat tags. If there is exactly 1, return it. 
function findSingleRepeatRegion(targetDom)
	{	
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return null; 
	
	var repeats = curDOM.getElementsByTagName("MMTInstance:Repeat");
	
	if (repeats != null && repeats.length == 1)
		return repeats.item(0); 
	
	return null;
	} //findSingleRepeatRegion


//Get the selected repeating region, or the repeating region containing the IP. 
//If targetRegion isn't null, keep going until we get to it, or the root. 
function getSelectedRepeatRegion(targetDom, targetRegion)
	{
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return null; 
	if (typeof dw["debugCount"] == "undefined")
		dw.debugCount = 0; 
		
	var curSelection = curDOM.getSelection(true, false); 
	if (curSelection.length < 2)
		return null; 
	
	for (i=0;i<curSelection.length-1;i+=2)
		{	
		var curSelNode = curDOM.offsetsToNode(curSelection[i], curSelection[i+1], false); 
		
		while (curSelNode != null && curSelNode.tagName != "BODY")	
			{
			if (curSelNode.nodeType != Node.TEXT_NODE && curSelNode.tagName == "MMTINSTANCE:REPEAT" && 
				(targetRegion == null || targetRegion == curSelNode) )
				return curSelNode; 
				
			curSelNode = curSelNode.parentNode; 
			}
		}
		
	return null; 
	} //getSelectedRepeatRegion
	
	
//Given a node for a repeat entry, return the node for the parent. 
function getRepeatEntryParentRegion(repeatEntryNode)
	{
	if (repeatEntryNode == null)
		return null; 
		
	var curNode = repeatEntryNode; 
	
	while (curNode != null && curNode.tagName != "BODY")	
		{
		if (curNode.tagName == "MMTINSTANCE:REPEAT")
			return curNode; 
		
		curNode = curNode.parentNode; 
		}
	
	return null;
	} //getRepeatEntryParentRegion
	

//If the selection is contained in, or is, a template markup node, return it. 	
function findSelectedTemplateMarkup(targetDom)
	{
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return null; 

	var curSel = curDOM.getSelection(true, false); 
	if (curSel.length != 2)
		return null; 
		
	for (i=0;i<curSel.length-1;i+=2)
		{
		var curSelNode = curDOM.offsetsToNode(curSel[i], curSel[i+1], false); 
		while (curSelNode != null && 	curSelNode.tagName != "BODY")
			{
			if (	curSelNode.tagName == "MMTEMPLATE:REPEAT" || 
					curSelNode.tagName == "MMTEMPLATE:IF" || 
					curSelNode.tagName == "MM:EDITABLE" ||
					curSelNode.tagName == "MMTEMPLATE:EDITABLE" ||
					curSelNode.tagName == "MMTEMPLATE:EXPR")
				return curSelNode;
				
			curSelNode = curSelNode.parentNode;		
			}
		}
		
	return null;	
	} //findSelectedTemplateMarkup
	
	
//Return true if it's OK to call doDeleteTemplateContent - the selection is a template markup node, or is inside one. 
function canDeleteTemplateMarkup(targetDom)
	{
	return findSelectedTemplateMarkup(targetDom) != null;	
	} //canDeleteTemplateMarkup
	
//If the selection is a template 	
function doDeleteTemplateMarkup(targetDom)
	{
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return null; 
	var targetNode = findSelectedTemplateMarkup(curDOM);	
	
	if (targetNode == null)
		return; 
			
	//If this is old-style syntax, we're in an instance, and the instance is not also a
	//template, display appropriate message and bail out. 
	if (targetNode.tagName == "MM:EDITABLE" && 
			curDOM.getAttachedTemplate() != "" && 
			!curDOM.getIsTemplateDocument())
		{
		alert(MM.TEMPLATE_UTILS_CantRemoveDW4TemplateContent); 
		return; 
		}
		
	targetNode.outerHTML = targetNode.innerHTML; 
	} //doDeleteTemplateMarkup


function canDeleteRepeatEntry(targetDom,targetRegion)
	{
	if (!focusIsLegalForTemplateMods())
		return false;
		
	return (getSelectedRepeatEntry(targetDom, targetRegion) != null); 
	} //canDeleteRepeatEntry
	
	
//Return the selected editable region, or the region containing the IP, or null
function findSelectedEditableRegion(targetDom, wantInstances)
	{
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return null; 
	
	var curSel = curDOM.getSelection(true, false); 
	for (i=0;i<curSel.length;i++)
		{
		var curSelNode = curDOM.offsetsToNode(curSel[i], curSel[i], false);
		
		if (!wantInstances)
			if (curSelNode != null && typeof curSelNode["getElementsByTagName"] != 'undefined')
				{
				var edits = curSelNode.getElementsByTagName("MMTInstance:Editable");
				if (edits.length > 0)
					return edits[0];
				}
			
		while (curSelNode != null && curSelNode.tagName != "BODY")	
			{
			var tagName = curSelNode.tagName;
			if (tagName == "MM:EDITABLE")
				if ( curDOM.getAttachedTemplate() != "" &&
					 !curDOM.getIsTemplateDocument )
					tagName = "MMTINSTANCE:EDITABLE";
				else
					tagName = "MMTEMPLATE:EDITABLE";
			
			if (wantInstances)
				{
				if (curSelNode.tagName == "MMTINSTANCE:EDITABLE")
					return curSelNode; 
				}
			else
				{
				if (curSelNode.tagName == "MMTEMPLATE:EDITABLE")
					return curSelNode; 
				}
			
			curSelNode = curSelNode.parentNode; 
			}
		}
		
	return null; 	
	} //findSelectedEditableRegion
	
	
	
function canDeleteEditableRegion(targetDom)
	{
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return false; 

	return findSelectedEditableRegion(targetDom, false) != null;
	} //canDeleteEditableRegion
	
	
	
function deleteSelectedEditableRegion(targetDom)
	{
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return false; 
	
	doSync(curDOM);
	var curEdit = findSelectedEditableRegion(curDOM, false);
	if (curEdit == null)
		return; 

	curEdit.outerHTML = ""; 
	} //deleteSelectedEditableRegion
	
//Return true if we are inside a repeat region and can insert a new repeat entry. 
function canInsertRepeatEntry(targetDom, insertLocation, targetRegion)
	{	
	if (!focusIsLegalForTemplateMods())
		return false;

	if (targetRegion != null)
		return true; 
		
	var selectedRegion = targetRegion; 
	
	if (selectedRegion == null) 
		selectedRegion = getSelectedRepeatRegion(targetDom, targetRegion); 
			
	if (selectedRegion == null)
		return false; 
		
	if (insertLocation == "listBegin" || insertLocation == "listEnd")
		return (selectedRegion != null);
			
	if ( getSelectedRepeatEntry(targetDom, targetRegion) != null )
		{
		if (targetRegion)
			return (selectedRegion == targetRegion); 
		
		return true; 
		}
	
	return false; 
	} //canInsertRepeatEntry

function trimWhitespace(theStr)
{
  var retVal = "";
  
  var firstNonWhite = theStr.search(/\S/);

  if (firstNonWhite != -1)
  {
    //Count the spaces and zeros at the end
    for (var i=theStr.length-1; i >= 0; i--)
    {
      if (theStr.charAt(i).search(/\S/) != -1 && theStr.charCodeAt(i) != 0)
      {
        theStr = theStr.substring(firstNonWhite, i+1);
        break;
      }
    }
    
    retVal = theStr;
  }

  return retVal;
} //trimWhitespace

	
function ClipTextIsBoundedByStrings(clipText, openString, closeString)
	{
	var openIndex = clipText.indexOf(openString); 
	var closedIndex = clipText.lastIndexOf(closeString); 
		
	var clipLength = clipText.length; 
	var closeLength = closeString.length; 

	if (openIndex != 0)
		return false; //Must start with a repeat entry. 
			
	if (closedIndex != clipLength - closeLength)
		return false; 
		
	//So, we start and end with a repeat entry. Now we need to make sure we don't 
	//close the tag in the middle somewhere (and have other text outside the tag). 
	return true; 
	}
	
	
//Return true if the clip starts with a repeat entry. 
function clipIsRepeatEntry(targetDom)
	{
	var clipText = dw.getClipboardText(false);
	if (typeof clipText == "undefined")
		return false; 
		
	clipText = trimWhitespace(clipText); 
	
	var openString = "<!-- InstanceBeginRepeatEntry -->";
	var closeString = "<!-- InstanceEndRepeatEntry -->"; 
	
	if (ClipTextIsBoundedByStrings(clipText, openString, closeString))
		return true; 
		
	//Check the old style syntax too
	openString = "<!-- #InstanceBeginRepeatEntry -->";
	closeString = "<!-- #InstanceEndRepeatEntry -->"; 
	
	return ClipTextIsBoundedByStrings(clipText, openString, closeString); 
	} //clipIsRepeatEntry
	
//Return true if we can paste a clipboard containing a repeat entry here. 
function canPasteRepeatEntry(targetDom)
	{
	var selectedRepeat = getSelectedRepeatRegion(targetDom, null); 
	
	return (  selectedRepeat != null ||  findSingleRepeatRegion(targetDom) != null );
	} //canPasteRepeatEntry
	
	
function doPasteRepeatEntry(targetDom, beforeEntry)
	{	
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return false; 

	if (!clipIsRepeatEntry(curDOM))
		return false; 
		
	var selEntry = getSelectedRepeatEntry(curDOM, null); 
	var clipText = dw.getClipboardText(false);
	
	curDOM.disableLocking();
	
	var replaceRange;
	if (selEntry != null)
		{
		replaceRange = curDOM.nodeToOffsets(selEntry);
		if (beforeEntry)
			replaceRange[1] = replaceRange[0]; 
		else
			replaceRange[0] = replaceRange[1]; 
		}
	else
		{
		var repeatRegion = getSelectedRepeatRegion(curDOM, null); 
		if (repeatRegion == null)
			repeatRegion = findSingleRepeatRegion(curDOM); 
			
		if (repeatRegion == null)
			{
			// curDOM.enableLocking();
			return; 
			}
		
		replaceRange = curDOM.nodeToOffsets(repeatRegion, true);
		if (beforeEntry)
			replaceRange[1] = replaceRange[0]; 
		else
			replaceRange[0] = replaceRange[1]; 
		}
	
	curDOM.editDocAndUpdateFromTemplate( replaceRange[0], replaceRange[1],
										 clipText,
										 -1, -1, "" );
	
	// curDOM.enableLocking();
	} //doPasteRepeatEntry
	
	
	
//Insert a repeating entry into the selected list, if any. insertLocation may be 
//one of "listBegin", "listEnd", "beforeEntry" or "afterEntry" - to determine where the 
//new entry goes. 

//If "beforeEntry" or "afterEntry" is passed, and there is no selected 
//entry, the new entry will be placed at the beginning or end of the list. 
//If insert region is non-null, use this region for the insert. 
function doInsertRepeatEntry(targetDom, insertRegion, insertLocation)
	{
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return; 
		
	var insertOffset = -1; 
			
	doSync(curDOM);
	curDOM.disableLocking();

	var curSelEntry = getSelectedRepeatEntry(targetDom, insertRegion); 
	var selEntryParent = null; 
	
	if (curSelEntry != null) 
		selEntryParent = getRepeatEntryParentRegion(curSelEntry); 

	var HTMLToInsert;
	if (dw.generateTemplateTagSyntax())
		HTMLToInsert =  "<MMTInstance:RepeatEntry name=\"MM_RESERVED_UNINITIALIZED\" ></MMTInstance:RepeatEntry>";
	else
		HTMLToInsert = "<!-- InstanceBeginRepeatEntry  name=\"MM_RESERVED_UNINITIALIZED\" --><!-- InstanceEndRepeatEntry -->";

	var newSelNodeIndex = 0; 
						
	//Make sure the selected entry is inside the region we want to insert into. 	
	if (curSelEntry != null && 
		 selEntryParent != null && 
		 (insertRegion == null || selEntryParent == insertRegion) && 
		 (insertLocation == "beforeEntry" ||
		 insertLocation == "afterEntry" ) )
		{
		var curEntryIndex = findRepeatEntryIndex(curSelEntry, selEntryParent); 
		
		if (insertLocation == "beforeEntry") 	
			{
			insertOffset = curDOM.nodeToOffsets(curSelEntry)[0];
			newSelNodeIndex = curEntryIndex;
			}
		else
			{
			insertOffset = curDOM.nodeToOffsets(curSelEntry)[1];
			newSelNodeIndex = curEntryIndex + 1;
			}
		}
	else
		{		
		//If we get to here, there was no entry selected in the target region - insert this at the beginning or end of the region. 
		var repeatRegion = insertRegion; 
		if (repeatRegion == null)		
			repeatRegion = getSelectedRepeatRegion(targetDom, insertRegion); 
		
		if (repeatRegion == null)
			repeatRegion = findSingleRepeatRegion(curDOM); 
		
		if (repeatRegion == null)
			{	
			//I give up. 
			//curDOM.enableLocking();
			return; 
			}
		
		var childNode = null;
			
		if (repeatRegion.childNodes.length == 0)
			{
			//Figure out where the inside of the repeat is. There's no good way to do 
			// it in the extension layer, so we just subtract off the number of bytes 
			// of the close tag from the ending offset. 
			var endString; 
			
			if (dw.generateTemplateTagSyntax())
			 	endString = "</MMTInstance:Repeat>";
			else
			 	endString = "<!-- InstanceEndRepeat -->";

			insertOffset = curDOM.nodeToOffsets(repeatRegion)[1] - endString.length;
			newSelNodeIndex = 0;
			}
		else
			{
			if (insertLocation == "listBegin" || insertLocation == "beforeEntry")
				{
				childNode = repeatRegion.childNodes[0]; 
				insertOffset = curDOM.nodeToOffsets(childNode)[0];
				newSelNodeIndex = 0;
				}
			else
				{
				childNode = repeatRegion.childNodes[repeatRegion.childNodes.length-1]; 
				
				insertOffset = curDOM.nodeToOffsets(childNode)[1];
				newSelNodeIndex = repeatRegion.childNodes.length-1;
				}
			}
		}
	
	
	//Update the template 
	if (!curDOM.editDocAndUpdateFromTemplate(insertOffset, insertOffset, HTMLToInsert, -1, -1, ""))
		{
		var repeatEntries = curDOM.getElementsByTagName("MMTInstance:RepeatEntry"); 
		for (var i=0; i<repeatEntries.length;i++)
			{
			if (repeatEntries[i].name == "MM_RESERVED_UNINITIALIZED")
				repeatEntries[i].outerHTML = "";
			}
		}
		
	curDOM.enableLocking();
	
	//Select the newly created node. 
	var selRepeat = getSelectedRepeatRegion(targetDom, insertRegion); 
	var newSelNode = findIndRepeatingEntry(	selRepeat, newSelNodeIndex);
		
	if (newSelNode != null)
		curDOM.setSelectedNode(newSelNode, false, false); 
	
	guaranteeEditableSelection(curDOM); 
	curDOM.disableLocking();
	} //doInsertRepeatEntry


//I give up. There are too many bugs in the locker selection code. This routine will check the current selection, 
//see if it's in an editable region, and if not, find one. 	
function guaranteeEditableSelection(targetDom)
	{
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	var curEditable = findSelectedEditableRegion(curDOM, true); 
	if (curEditable != null)
		return; 
		
	//See if there's one inside the selected node...
	var selectedNode = getUnlockedSelNode(curDOM, false); 
	var edits; 
		
	if (selectedNode != null && selectedNode.nodeType == Node.TEXT_NODE)
		selectedNode = selectedNode.parentNode; 
	
	while (selectedNode != null && selectedNode.tagName != "BODY" && selectedNode.tagName != "HTML" )
		{
		edits =  selectedNode.getElementsByTagName("MMTInstance:Editable");
		if (edits.length > 0)
			{
			if (edits[0].childNodes.length > 0)
				curDOM.setSelectedNode(edits[0].childNodes[0]);
			else 
				curDOM.setSelectedNode(edits[0]); 
			return;
			}
			
		//Expand out one level.
		selectedNode = selectedNode.parentNode; 
		}
		
	//Just look in the document itself. 
	edits =  curDOM.getElementsByTagName("MMTInstance:Editable");
	if (edits.length > 0)
		curDOM.setSelectedNode(edits[0]); 
	
	} //guaranteeEditableSelection
	
//Given a repeatEntry node and the repeat region parent, return the index into the parents childNodes list. 
function findRepeatEntryIndex(theEntry, theParent)
	{
	var entryIndex = -1; 
	for (var i=0; i<theParent.childNodes.length; i++)	
		if (theParent.childNodes[i] == theEntry)
			return i; 
			
	return -1; 			
	} //findRepeatEntryIndex


//Return the node for the indexed repeating entry in this region, 0 based. If a number larger than the number of entries minus 1
//is passed, this will return the last entry in the list. 
function findIndRepeatingEntry(theRepeatRegion, ind)
	{
	if (theRepeatRegion == null)
		return null; 
		
	var entries = theRepeatRegion.getElementsByTagName("MMTInstance:RepeatEntry");

	if (entries.length == 0)
		return null; 
		
	if (ind > entries.length) 
		return entries.item(entries.length - 1); 
		
	return entries.item(ind); 
	} //findIndRepeatingEntry
	
	
	
//determines whether moveSelectedRepeatEntry will do anything. 
function canMoveRepeatEntry(targetDom, direction, targetRegion)
	{
	if (!focusIsLegalForTemplateMods())
		return false;
	
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return false; 

	var theEntry = getSelectedRepeatEntry(curDOM, targetRegion);
	
	if (theEntry == null)
		return false; 
		
	var parentNode = getRepeatEntryParentRegion(theEntry); 
	if (parentNode == null)
		return false;
		 	
	if (targetRegion != null && parentNode != targetRegion)
		return false; 
			
	var entryIndex = findRepeatEntryIndex(theEntry, parentNode); 
	if (entryIndex == -1)
		return false; 
	
	switch (direction)
		{
		case "up":  		return (entryIndex > 0);
		case "down":  	 	return (entryIndex < parentNode.childNodes.length-1);
		case "listBegin": 	return (entryIndex != 0);
		case "listEnd": 	return (entryIndex != parentNode.childNodes.length - 1); 
		}

	return false; 
	} //canMoveRepeatEntry
	

//Return the first editable region inside this node, if there is one, or null. 		
function findChildEditableRegion(node)
	{
	var childNodes = node.getElementsByTagName("MMTInstance:Editable");
	
	if (childNodes != null)
		return childNodes[0]; 
		
	childNodes =  node.getElementsByTagName("MMTemplate:Editable"); 
	if (childNodes != null)
		return childNodes[0]; 
	
	return null;
	}
	
//Move the selected repeating entry up or down in the list of entries. direction may be one of 
//"up", "down", "listBegin" or "listEnd". 
//This routine does nothing if the IP isn't inside a repeated entry. 		
function moveSelectedRepeatEntry(targetDom, direction, targetRegion)
	{	
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return false; 
	
	if (!canMoveRepeatEntry(targetDom, direction, targetRegion))
		return false; 
		
	var theEntry = getSelectedRepeatEntry(curDOM, targetRegion);
	
	if (theEntry == null)
		return false; 
		
	var parentNode = getRepeatEntryParentRegion(theEntry); 
	if (parentNode == null)
		return false; 
		
	if (targetRegion != null && parentNode != targetRegion)
		return false; 

	var entryIndex = findRepeatEntryIndex(theEntry, parentNode); 
	if (entryIndex == -1)
		return false; 
	
	var targetNode = null; 
	var targetOffset = -1; 	
	var destinationChildIndex = -1; 
	curDOM.disableLocking();
	var oldHTML = theEntry.outerHTML; 

	var indexToDelete = entryIndex; 
	
	var insPos, delRange;
	
	switch (direction)
		{
		case "up": 
			{
			if (entryIndex > 0)
				{
				targetNode = parentNode.childNodes[entryIndex-1];
				insPos = curDOM.nodeToOffsets(targetNode)[0];
				destinationChildIndex = entryIndex-1;
				}
			break; 	
			}
			
		case "down": 
			{
			if (entryIndex < parentNode.childNodes.length-1)
				{
				targetNode = parentNode.childNodes[entryIndex+1]; 
				insPos = curDOM.nodeToOffsets(targetNode)[1];
				destinationChildIndex = entryIndex+1;
				}
			break; 	
			}
			
		case "listBegin": 
			{
			if (entryIndex == 0)
				return false; 
				
			insPos = curDOM.nodeToOffsets(parentNode, true)[0];
			
			destinationChildIndex = 0;
			break; 
			}
		
		case "listEnd": 
			{
			if (entryIndex == parentNode.childNodes.length - 1)
				return false; 
				
			targetNode = parentNode.childNodes[parentNode.childNodes.length - 1]; 
			destinationChildIndex = parentNode.childNodes.length - 1;
			
			insPos = curDOM.nodeToOffsets(parentNode, true)[1];
			
			break; 
			}
		}
		
	var delRange = curDOM.nodeToOffsets(parentNode.childNodes[indexToDelete]);
	
	// If necessary, offset delRange to reflect the fact that this edit
	// will occur after the first edit.
	if (delRange[0] >= insPos)
		{
		delRange[0] += oldHTML.length;
		delRange[1] += oldHTML.length;
		}
	
	// Perform the edit, and update the template so calculated values will refresh.
	curDOM.editDocAndUpdateFromTemplate( insPos, insPos, oldHTML,
										 delRange[0], delRange[1], "" );

	//Fix the selection, make sure it's legal. 
	theEntry = getSelectedRepeatEntry(curDOM, targetRegion);
	parentNode = getRepeatEntryParentRegion(theEntry); 
	
	//Start fix for 54799
	var selParent; 
	
	if (theEntry != null && parentNode != null)
		selParent = parentNode.childNodes[destinationChildIndex]; 
	else
		selParent = getUnlockedSelNode(curDOM, true); 
		
	if (selParent != null)
		{
		var nodeToSelect = findChildEditableRegion(selParent); 
				
		if (nodeToSelect == null)
			nodeToSelect = selParent; 
		else
			nodeToSelect = nodeToSelect.childNodes[0]; //the text inside. 
		
		curDOM.setSelectedNode(nodeToSelect);
		}
	//End fix for 54799
		
	/* Commented this out for the fix to 54799, put in the above code instead. 
	if (theEntry != null && parentNode != null)
		curDOM.setSelectedNode(parentNode.childNodes[destinationChildIndex], false, false);
	else
		curDOM.setSelectedNode(getUnlockedSelNode(curDOM, true));
	*/	
	return true;
	} //moveSelectedRepeatEntry
	
	
	
//Delete the repeat entry that the IP is in. 
function doDeleteRepeatEntry(targetDom, targetRegion)
	{	
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null)
		return false; 

	var curSelEntry = getSelectedRepeatEntry(targetDom, targetRegion); 
	
	if (curSelEntry == null)
		return false; 
		
	var selEntryParent = getRepeatEntryParentRegion(curSelEntry); 

	if ((targetRegion != null) && (selEntryParent != targetRegion))
		return false;
		
	var entryIndex = findRepeatEntryIndex(curSelEntry, selEntryParent);
	var entryCount = 0;
	
	if (selEntryParent && selEntryParent.childNodes)
	{
		entryCount = selEntryParent.childNodes.length;
	}

	curDOM.disableLocking();
	var replaceRange = curDOM.nodeToOffsets(curSelEntry);
	
	//Update the template 
	curDOM.editDocAndUpdateFromTemplate( replaceRange[0], replaceRange[1],
										 "",
										 -1, -1, "" );
	curDOM.enableLocking();
	
	// jalbano 10-10-02: Fix 76945
	// Attempt to select the same "row". If we deleted
	// the last row, select the new last row.
	// If we deleted the last-and-only row, resort to old logic.

	if ((--entryCount > 0) && selEntryParent)
	{
		var nodeToSelect = selEntryParent; 

		if (entryIndex > (entryCount - 1))
		{
			entryIndex = (entryCount - 1);
		}

		if (selEntryParent.childNodes &&
			(selEntryParent.childNodes.length > entryIndex))
		{
			nodeToSelect = selEntryParent.childNodes[entryIndex];
		}

		curDOM.setSelectedNode(nodeToSelect);
	}
	else
	{
		guaranteeEditableSelection(curDOM);
	}
 
	curDOM.disableLocking();
	return true;
	} //doDeleteRepeatEntry


//return true if this is a template instance and the IP is inside a repeat entry. 
function canCutCopyRepeatEntry(targetDom)
	{	
	if (!focusIsLegalForTemplateMods())
		return false;
	
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 	
	if (curDOM == null || curDOM.getAttachedTemplate() == "")
		return false; 
			
	return getSelectedRepeatEntry(curDOM, null) != null;
	} //canCutCopyRepeatEntry
	
	
//Cut or copy the selected repeating entry, if any. 	
function doCutCopyRepeatEntry(targetDom, doCut)
	{		
	var curDOM = (targetDom == null) ? dw.getDocumentDOM('document') : targetDom; 
	if (curDOM == null || curDOM.getAttachedTemplate() == "")
		return; 
	
		
	doSync(curDOM);
	curDOM.disableLocking();
	var selNode = getSelectedRepeatEntry(curDOM, null);
	if (selNode == null)
		{
		//curDOM.enableLocking();
		return; 
		}
	
	var range = curDOM.nodeToOffsets(selNode); 
	curDOM.setSelection(range[0], range[1], false); 	
		
	curDOM.clipCopy();
	
	//doSync(curDOM);

	//Update the template 
	if (doCut)
		curDOM.editDocAndUpdateFromTemplate( range[0], range[1],
											 "",
											 -1, -1, "" );
	
	//curDOM.enableLocking();
	} //doCutCopyRepeatEntry
	
	
//return true if this string needs to be wrapped in a "_document[]" expression to be syntactically correct. 	
function paramNeedsEncoding(expressionString)
	{	
	if (expressionString.length == 0)
		return false; //Don't know what you're going to do with this, but encoding isn't going to make it better. 
		
	//Check to see if it start with a char or underscore. 
	var lowerCaseExpr = expressionString.toLowerCase(); 
	var legalStartChar = "_abcdefghijklmnopqrstuvwxyz"; 
	
	if (legalStartChar.indexOf(lowerCaseExpr.charAt(0)) == -1)
		return true; 
	
	//Check for reserved words. 		
	var bigBadString = "break case continue default do else export for if return switch var while with abstract boolean byte char class double extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile enum debugger instanceof try catch finally throw const void this true false function typeof in new null delete";
	
	var splits = bigBadString.split(" "); 
	for (var j=0; j<splits.length;j++)
		if (lowerCaseExpr.indexOf(splits[j]) != -1)
			return true; 
	
	//Last thing to check for - match anything that isn't a letter, 
	//char or underscore. 
	//PERFORMANCE ALERT - the regexp isn't working, check by hand. 
	//return lowerCaseExpr.search(/\W/) != -1;
	
	var legalChars = 'abcdefghijklmnopqrstuvwxyz_1234567890'; 
	for (var i=0; i<lowerCaseExpr.length; i++)
		if (legalChars.indexOf(lowerCaseExpr.charAt(i)) == -1)
			return true; 
			
	return false; 
	} //paramNeedsEncoding
	

//Given an attribute name, encode it in the form "_document['attrName']" and return 
//the result. If the string passed in is an expression and not an attribute name, 
//this will just return the string itself. If the string passed in 
//is already of the form above, it will also just return it unchanged. 	
//Note that, if the param does not need encoding, that is, it's a legal name with no weird chars,
//this will just return it unchanged. 
//If encodeExpressions is passed true, this will encode anything that looks like an expression - anything
//with a dash, etc. 
function encodeTemplateParam(expressionString, encodeExpressions)
	{	
	//If this is already an expression, don't encode it. Note that this will implicitly check
	//for whether the string is already encoded, since that is also an expression. 
	if (!encodeExpressions && isExpressionString(expressionString, false))
		return expressionString; 
		
	//Check to see if we need to wrap this in an expression. 
	if (!paramNeedsEncoding(expressionString))
		return expressionString; 
		
	return "_document['" + expressionString + "']"; 
	} //encodeTemplateParam
	


//take a string of the form "_document['attrName']" and extract the attribute name. 
//if the string is not of that form, just return it .	
function decodeTemplateParam(expressionString)
	{
	var firstFragString = "_document['";
	var firstFrag = expressionString.indexOf(firstFragString); 
	
	if (firstFrag != 0)	
		return expressionString; 
	
	var lastFrag = expressionString.lastIndexOf("']"); 
	
	if (lastFrag == -1)
		return expressionString; 
		
	return expressionString.substring(firstFragString.length, lastFrag);
	} //decodeTemplateParam
	
	

//Return true if this string contains expression markup: 
//unary operators: +, -, ~, !
//binary operators: +, -, *, /, %, &, |, ^, &&, ||, <, <=, >, >=, ==, !=, <<, >>
//conditional operator: ?:
//parentheses: ()
//If ignoreStandardExpression is passed true, this will look for the pattern "_document['attrName']" and 
//return FALSE if found, if attrName is a name and not an expression.  
function isExpressionString(theString, ignoreStandardExpression)
	{
	var temp ; 
	
	if (ignoreStandardExpression) 
		temp = decodeTemplateParam(theString); 
	else
		temp = theString; 
		
	if ( temp.search(/[-~!%&|<=>:()]/) != -1)
		return true; 
	
	//PERFORMANCE ALERT FINISH THIS, fold these into the exp above SES 6.6.01
	
	return (temp.indexOf("+") != -1 || 
			temp.indexOf("^") != -1 ||
			temp.indexOf("*") != -1 ||
			temp.indexOf("/") != -1 ||
			temp.indexOf(".") != -1);
	} //isExpressionString

	

