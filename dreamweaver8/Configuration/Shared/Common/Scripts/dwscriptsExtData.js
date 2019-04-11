//SHARE-IN-MEMORY=true

// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   dwscripts (Extension Data specific functions)
//
// DESCRIPTION:
//   This file is a continuation of the dwscripts namespace, with
//   functions specific to the Extenstion Data mechanism.
//
// PUBLIC PROPERTIES:
//
//   NONE
//
// PUBLIC FUNCTIONS:
//
//   SERVER BEHAVIOR
//    dwscripts.findSBs(title, sbConstructor)
//    dwscripts.applySB(paramObj, sbObj, sbName)
//    dwscripts.deleteSB(sbObj)
//    dwscripts.canApplySB(sbObject, preventNesting, selectionNotRequired)
//
//   GROUP
//    dwscripts.findGroup(groupName, title, sbConstructor)
//    dwscripts.applyGroup(groupName, paramObj)
//
//   DOCUMENT EDITS
//    dwscripts.queueDocEditsForGroup(groupName, paramObj, sbObj)
//    dwscripts.queueDocEditsForParticipant(partName, paramObj)
//    dwscripts.queueParticipantInfo(partName, node)
//
//    dwscripts.queueDocEdit(text, weight, optionalRelNode, dontPreprocessText, dontFormatForMerge)
//    dwscripts.queueNodeEdit(text, node, replaceRangeStart, replaceRangeEnd, dontFormatForMerge)
//
//    dwscripts.applyDocEdits(maintainSelection)
//    dwscripts.clearDocEdits()
//
//   SERVER BEHAVIOR GROUPS
//    dwscripts.getSBFileName()
//    dwscripts.getSBGroupNames(serverBehaviorName)
//    dwscripts.getUniqueSBGroupName(paramObj, serverBehaviorName)
//
//   SELECTION
//    dwscripts.fixUpSelection(dom, bLeaveHeadSelection, bCollapseParagraphs)
//    dwscripts.getBalancedSelection(dom, balanceInward)


//--------------------------------------------------------------------

// Public Methods

//server behavior
dwscripts.findSBs = dwscripts_findSBs;
dwscripts.applySB = dwscripts_applySB;
dwscripts.deleteSB = dwscripts_deleteSB;
dwscripts.canApplySB = dwscripts_canApplySB;

//group
dwscripts.findGroup = dwscripts_findGroup;
dwscripts.applyGroup = dwscripts_applyGroup;

//doc edits
dwscripts.queueDocEditsForGroup = dwscripts_queueDocEditsForGroup;
dwscripts.queueDocEditsForParticipant = dwscripts_queueDocEditsForParticipant;
dwscripts.queueParticipantInfo = dwscripts_queueParticipantInfo;
dwscripts.queueDocEdit = dwscripts_queueDocEdit;
dwscripts.queueNodeEdit = dwscripts_queueNodeEdit;
dwscripts.applyDocEdits = dwscripts_applyDocEdits;
dwscripts.clearDocEdits = dwscripts_clearDocEdits;

//server behavior groups
dwscripts.getSBFileName = dwscripts_getSBFileName;
dwscripts.getSBGroupNames = dwscripts_getSBGroupNames;
dwscripts.getUniqueSBGroupName = dwscripts_getUniqueSBGroupName;

//selection
dwscripts.fixUpSelection = dwscripts_fixUpSelection;
dwscripts.getBalancedSelection = dwscripts_getBalancedSelection;


// Private Methods
dwscripts.preprocessDocEditInsertText = dwscripts_preprocessDocEditInsertText;


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.findSBs
//
// DESCRIPTION:
//   This function searches the current document for all instances of
//   a server behavior, and returns an array of ServerBehavior objects.
//
//   Please see Configuration/Shared/Common/Scripts/ServerBehaviorClass.js
//   for a complete description of the objects that are returned.
//
//   NOTE: this function will only work when called from within a
//     server behavior
//
// ARGUMENTS:
//   title (optional) - parameter for the title of the server behavior
//   sbConstructor (optional) - parameter which indicates the constructor
//     function to use when creating the returned objects. If no value
//     is specified, then the ServerBehavior class is used.
//     This is useful for creating derived classes from the base
//     server behavior class.
//
// RETURNS:
//   array of ServerBehavior objects (or derived SB objects if the
//     sbConstructor is specified)
//--------------------------------------------------------------------

function dwscripts_findSBs(title, sbConstructor)
{
  var serverBehaviors = new Array();

  var groupNames = dwscripts.getSBGroupNames(dwscripts.getSBFileName());

  for (var i=0; i < groupNames.length; i++)
  {
    serverBehaviors = serverBehaviors.concat(dwscripts.findGroup(groupNames[i], title, sbConstructor));
  }

  return serverBehaviors;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.applySB
//
// DESCRIPTION:
//   This function inserts or updates a server behavior.
//   It is typically called by applyServerBehavior.
//
//   function applyServerBehavior(sbObj) {
//     var paramObj = new Object();
//     paramObj.param1 = ~get value from UI
//     paramObj.param2 = ~get value from UI
//     paramObj.param3 = ~get value from UI
//     applySB(paramObj, sbObj);
//   }
//
// ARGUMENTS:
//   paramObj - simple Object with a property for each param to pass in
//   sbObj    - prior ServerBehavior instance (if editing existing instance)
//   sbName (optional) - the name of a Server Behavior such as foo.htm
//                      (only use if *not* calling from a Server Behavior).
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function dwscripts_applySB(paramObj, sbObj, sbName, dontReformatHTML)
{
  sbName = (sbName != null) ? sbName : dwscripts.getSBFileName();
  
  var groupName = dwscripts.getUniqueSBGroupName(paramObj, sbName);

  try
  {
    if (groupName)
    {
      // add the group changes to the docEdits queue
      dwscripts.queueDocEditsForGroup(groupName, paramObj, sbObj);

      // Commit all scheduled edits
      dwscripts.applyDocEdits(false /* maintainSelection */, dontReformatHTML);
    }
    else
    {
      alert(MM.MSG_NoXmlFile);
    }
  }
  catch(e)
  {
    // Catch and alert exceptions applying the SB
    alert(e);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.deleteSB
//
// DESCRIPTION:
//   Deletes all participants that are not currently being shared.
//   Calls deleteSB() method of ServerBehavior class which does all the work.
//
// ARGUMENTS:
//   sbObj   - prior ServerBehavior instance
//
// RETURNS:
//   boolean - true if delete was successful.
//--------------------------------------------------------------------

function dwscripts_deleteSB(sbObj)
{
  var retVal = true;
  try
  {
    // add the delete edits to the docEdits queue
    if (sbObj.queueDocEditsForDelete())
    {
      // Commit all scheduled edits
      dwscripts.applyDocEdits();
    }
    else
    {
      retVal = false;
    }
  }
  catch(e)
  {
    // Catch and alert exceptions applying the SB
    alert(e);
    retVal = false;
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.canApplySB
//
// DESCRIPTION:
//   Does some basic checks to see if the selected range is correct
//   for the current server behavior.  Displays alert messages if
//   problems are found.
//
// ARGUMENTS:
//   sbObject - ServerBehavior object - (optional) the SB instance,
//     if we are checking an existing SB.
//   preventNesting - boolean - (optional) true if this SB cannot
//     be nested in SB's of the same type.
//   selectionNotRequired - (optional) set to true if no selection is required,
//     for instance, when calling from an object in which content will be added
//     and selected before applying the server behavior.
//
// RETURNS:
//   boolean - true if the SB can be applied, false otherwise
//--------------------------------------------------------------------

function dwscripts_canApplySB(sbObject, preventNesting, selectionNotRequired)
{
  var retVal = true;

  var sbFileName = dwscripts.getSBFileName();
  var groupName = dwscripts.getUniqueSBGroupName(null, sbFileName);
  var selectionIsRequired = !selectionNotRequired; // declared for easier readability below

  // if we are applying a new server behavior, and that behavior
  // will wrap the selected region, then do some special checks
  if (!sbObject && extGroup.getWrapsSelection(groupName))
  {
    // make sure a region has been selected
    if (selectionIsRequired && (dwscripts.selectionIsCursor() || !dwscripts.selectionIsInBody()))
    {
      alert(MM.MSG_RequiresSelection);
      retVal = false;
    }
    else
    {
      var dom = dw.getDocumentDOM();
      var currOffsets = dom.source.getSelection();

      var sbObjs = dw.serverBehaviorInspector.getServerBehaviors();

      for (var i=0; i < sbObjs.length; i++)
      {
        if (sbObjs[i].getWrapSelectionOffsets != null)
        {
          var sbOffsets = sbObjs[i].getWrapSelectionOffsets();

          if (sbOffsets != null)
          {
            // check for nesting if the flag is set, and the items being compared
            //  are of the same type.
            if (preventNesting && sbFileName == sbObjs[i].getServerBehaviorFileName())
            {
              // check if the selection is inside or around another region
              if ( (sbOffsets[0] < currOffsets[0] && sbOffsets[1] > currOffsets[1]) ||
                   (sbOffsets[0] > currOffsets[0] && sbOffsets[1] < currOffsets[1]) )
              {
                alert(MM.MSG_NoNestedRegions);
                retVal = false;
                break;
              }
            }

            // check if the selection stradles another region
            if ( !((sbOffsets[0] <= currOffsets[0] && sbOffsets[1] <= currOffsets[0]) ||
                   (sbOffsets[0] >= currOffsets[1] && sbOffsets[1] >= currOffsets[1]) ||
                   (sbOffsets[0] >= currOffsets[0] && sbOffsets[1] <= currOffsets[1]) ||
                   (sbOffsets[0] <= currOffsets[0] && sbOffsets[1] >= currOffsets[1])) )
            {
              alert(MM.MSG_NoOverlappingRegions);
              retVal = false;
              break;
            }

          }
        }
      }
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.findGroup
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function dwscripts_findGroup(groupName, title, sbConstructor)
{
  // get the list of server behavior objects
  var sbObjList = extGroup.find(groupName, title, sbConstructor);

  return sbObjList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.applyGroup
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function dwscripts_applyGroup(groupName, paramObj)
{
  // queue the group edits
  dwscripts.queueDocEditsForGroup(groupName, paramObj);

  // Commit all scheduled edits
  dwscripts.applyDocEdits();
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.queueDocEditsForGroup
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function dwscripts_queueDocEditsForGroup(groupName, paramObj, sbObj)
{
  // queue the group edits
  extGroup.queueDocEdits(groupName, paramObj, sbObj);
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.queueDocEditsForParticipant
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function dwscripts_queueDocEditsForParticipant(partName, paramObj)
{
  extPart.queueDocEdits("", partName, paramObj, null);  // no group name or sbObj
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts_queueParticipantInfo
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function dwscripts_queueParticipantInfo(partName, node, partRangeStart, partRangeEnd)
{
  var nodeSeg = new NodeSegment(node, partRangeStart, partRangeEnd);
  docEdits.queue(null, nodeSeg, extPart.getLocation(partName));
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.queueDocEdit
//
// DESCRIPTION:
//   Valid Weight Values:
//    aboveHTML[+nn], belowHTML[+nn],
//    beforeSelection, afterSelection, replaceSelection,
//    beforeNode, afterNode, replaceNode,
//    nodeAttribute[+attribname]
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function dwscripts_queueDocEdit(text, weight, optionalRelNode, dontPreprocessText, dontFormatForMerge)
{
  var optionFlags = 0;
  if (dontPreprocessText)
  {
    optionFlags |= docEdits.QUEUE_DONT_PREPROCESS_TEXT;
  }
  if (dontFormatForMerge)
  {
    optionFlags |= docEdits.QUEUE_DONT_FORMAT_FOR_MERGE;
  }

  docEdits.queue(text, null, weight, optionalRelNode, optionFlags);
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.queueNodeEdit
//
// DESCRIPTION:
//   Queues an edit to a document node.
//
// ARGUMENTS:
//   text - string. Text used to update the node.
//   node - dom node pointer. Node to update.
//   replaceRangeStart - number. (optional) Node relative offset for the beginning
//     of the edit. Defaults to the beginning of the node's outerHTML.
//   replaceRangeEnd - number. (optional) Node relative offset for the end of
//     the edit. Defaults to the end of the node's outerhtml.
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function dwscripts_queueNodeEdit(text, node, replaceRangeStart, replaceRangeEnd, dontFormatForMerge)
{
  var optionFlags = 0;
  if (dontFormatForMerge)
  {
    optionFlags |= docEdits.QUEUE_DONT_FORMAT_FOR_MERGE;
  }

  var nodeSeg = new NodeSegment(node, replaceRangeStart, replaceRangeEnd);

  docEdits.queue(text, nodeSeg, "", null, optionFlags);
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.apppyDocEdits
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function dwscripts_applyDocEdits(maintainSelection, dontReformatHTML)
{
  // add any server model default doc edits
  var serverObj = dwscripts.getServerImplObject();
  
  if (serverObj != null && serverObj.queueDefaultDocEdits != null)
  {
    serverObj.queueDefaultDocEdits();
  }

  // commit all scheduled edits
  docEdits.apply(maintainSelection, dontReformatHTML);
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.clearDocEdits
//
// DESCRIPTION:
//   Empties the list of doc edits. When queueing up doc edits, use this
//   function to clear the doc edit list when an error occurs or to reset
//   the edit list when starting on a new set of edits. Note: the doc
//   edit list is automatically cleared on apply.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function dwscripts_clearDocEdits()
{
  docEdits.clearAll();
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.preprocessDocEditInsertText
//
// DESCRIPTION:
//   This function is called during dwscripts.applyDocEdits(), to
//   allow the Server Models to pre-process the inserted text.
//   It returns he processed string which should be inserted into
//   the document.
//
// ARGUMENTS:
//   insertText - string - the text that will be inserted
//   editNode - DOM node - the location where this text will be inserted
//   isUpdate - boolean - indicates that we are updating the node,
//     versus inserting
//
// RETURNS:
//   string - the new insert text
//--------------------------------------------------------------------

function dwscripts_preprocessDocEditInsertText(insertText, editNode, isUpdate)
{
  var retVal = insertText;

  var serverObj = dwscripts.getServerImplObject();
  
  if (serverObj != null && serverObj.preprocessDocEditInsertText != null)
  {
    retVal = serverObj.preprocessDocEditInsertText(insertText, editNode, isUpdate);
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getSBFileName
//
// DESCRIPTION:
//   This function returns the simple file name of the current server behavior.
//   This information is used to select the correct group name.
//
//   NOTE: this function should only be called from within a server behavior
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - simple file name of current server behavior
//--------------------------------------------------------------------
function dwscripts_getSBFileName()
{
  var sbName = document.URL;
  var lastSlash = sbName.lastIndexOf("/");

  if (lastSlash != -1)
  {
    sbName = sbName.substring(lastSlash+1);
  }

  return sbName;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getSBGroupNames
//
// DESCRIPTION:
//   This function determines which group XML files refer to the given
//   server behavior. If the server behavior name is "foo.htm", returns
//   the names of all groups files with <group serverBehavior="foo.htm">.
//
// ARGUMENTS:
//   serverBehaviorName - the name of a Server Behavior (such as foo.htm)
//
// RETURNS:
//   an array of group names
//--------------------------------------------------------------------
function dwscripts_getSBGroupNames(serverBehaviorName)
{
  //get the group ids matcing that name
  var groupNames = dw.getExtGroups(serverBehaviorName,"serverBehavior");

  //walk the list of groupNames, and eliminate groups that do not
  // define any information for the current server model
  for (var i=groupNames.length-1; i >= 0; i--)   //walk the list backward for removals
  {
    var hasData = false;
    var partNames = dw.getExtDataArray(groupNames[i],"groupParticipants");

    for (var j=0; j < partNames.length; j++)
    {
      if (dw.getExtDataValue(partNames[j], "insertText"))
      {
        hasData = true;
        break;
      }
    }
    if (!hasData)
    {
      groupNames.splice(i,1);  // remove this item from the array
    }
  }

  return groupNames;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getUniqueSBGroupName
//
// DESCRIPTION:
//   This function uses the information passed in the parameter object
//   to determine a unique reference to a group name.
//
//   The parameter object can contain the following filter params:
//     paramObj.MM_dataSource
//        only consider groups where dataSource matches this value
//     paramObj.MM_subTypes
//        only consider groups where subTypes matches this value
//
//   For each of these filters, group files without a dataSource or a
//   subType attribute are considered to be the default group,
//   if a more specific match cannot be found.
//
// ARGUMENTS:
//   paramObj - an Object with parameter properties
//   serverBehaviorName - the name of a Server Behavior (such as foo.htm)
//
// RETURNS:
//   a single group name, if a match was found
//--------------------------------------------------------------------
function dwscripts_getUniqueSBGroupName(paramObj, serverBehaviorName)
{
  var groupName = "";
  var groupNames = dwscripts.getSBGroupNames(serverBehaviorName);

  if (groupNames.length)
  {
    if (groupNames.length == 1)
    {
      groupName = groupNames[0];
    }
    else
    {
      //if subType or dataSource given, resolve ties by filtering using them
      if (paramObj)
      {
        var matchGroups = new Array();
        for (var i=0; i<groupNames.length; i++)
        {
          //if no dataSource or it matches, and no subType or it matches, keep groupName
          if (
              (
               (!paramObj.MM_dataSource && !dw.getExtDataValue(groupNames[i],"dataSource")) ||
               (paramObj.MM_dataSource && dw.getExtDataValue(groupNames[i],"dataSource") == paramObj.MM_dataSource)
              )
              &&
              (
               (!paramObj.MM_subType  && !dw.getExtDataValue(groupNames[i],"subType")) ||
               (paramObj.MM_subType && dw.getExtDataValue(groupNames[i],"subType") == paramObj.MM_subType)
              )
             )
          {
            matchGroups.push(groupNames[i]);
          }
        }

        if (!matchGroups.length && paramObj.MM_subType)
        {
          for (var i=0; i<groupNames.length; i++)
          {
            //if no dataSource or it matches, and no subType, keep groupName
            if (
                (
                 (!paramObj.MM_dataSource && !dw.getExtDataValue(groupNames[i],"dataSource")) ||
                 (paramObj.MM_dataSource && dw.getExtDataValue(groupNames[i],"dataSource") == paramObj.MM_dataSource)
                )
                && !dw.getExtDataValue(groupNames[i],"subType")
               )
            {
              matchGroups.push(groupNames[i]);
              break;
            }
          }
        }

        if (!matchGroups.length && paramObj.MM_dataSource)
        {
          //if no dataSource, keep groupName
          for (var i=0; i<groupNames.length; i++)
          {
            if (!dw.getExtDataValue(groupNames[i],"dataSource"))
            {
              matchGroups.push(groupNames[i]);
              break;
            }
          }
        }

        //if anything left after filtering, use that
        if (matchGroups.length)
        {
          groupName = matchGroups[0];
        }
      }
    }
  }

  return groupName;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.fixUpSelection
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function dwscripts_fixUpSelection(dom, bLeaveHeadSelection, bCollapseParagraphs)
{
	try{
		var retVal = null;
		
		dom = (dom == null) ? dw.getDocumentDOM() : dom;
		
		var offsets = null;
		
		if (!bLeaveHeadSelection && !dwscripts.selectionIsInBody(dom))
		{
		offsets = dwscripts.setCursorToEndOfBody(dom);
		}
		else
		{
		offsets = dwscripts.getBalancedSelection(dom, bCollapseParagraphs);
		}
		
		if (offsets)
		{
		retVal = dom.documentElement.outerHTML.substring(offsets[0], offsets[1]);
		}
	}
	catch(e)
	{
		//if we can't fix up the selection, just eat the exception at least the edit will go on
	}

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dwscripts.getBalancedSelection
//
// DESCRIPTION:
//   Balances the selection, by expanding the selected range until
//   only entire tags are selected.  However, if balanceInward is
//   true, then the selection range is reduced, until entire
//   tags are selected.
//
//   This function also fixes several special case selection problems.
//
//   This function should be called by all Server Behaviors before
//   calling applySB.  It is a separate function call so that
//   the balanceInward flag can be set accordingly.
//
// ARGUMENTS:
//   dom - DOM object - the DOM to get the selection from, or the DOM
//         of the current document will be used if this is null
//   balanceInward - boolean - reduce the selected range to balance
//
// RETURNS:
//   offsets array - the offsets of the new selection
//--------------------------------------------------------------------

function dwscripts_getBalancedSelection(dom, balanceInward)
{
  var retVal = null;

  dom = (dom == null) ? dw.getDocumentDOM() : dom;

  if (balanceInward)
  {
    dwscripts.adjustCursorForEmptyTableCell(dom);
  }

  var allText = dom.documentElement.outerHTML;
  var offsets = dw.getSelection(false);
  
  if( !offsets || offsets.length <= 1 ) {
	  return retVal;
  }
  
  if (offsets[0] != offsets[1]) // if there is a selection instead of a cursor
  {
    var selectionIsBalanced = false;

    // shortcut: if selecting for a link, and selection is only text,
    // set selectionIsBalanced to true
    if (balanceInward)
    {
      var selStr = allText.substring(offsets[0],offsets[1]);
      if (selStr.indexOf("<") == -1)
      {
        selectionIsBalanced = true;
      }
    }

    // special case table check - if more than one cell in a row is selected,
    // expand selection to be the table row
    if (!selectionIsBalanced && !balanceInward)
    {
      var newOffsets = extUtils.getSelTableRowOffsets();
      if (newOffsets)
      {
        offsets = newOffsets;
      }
    }

    // balance the selection - don't bother if its a table tag because we know
    // that it is already balanced

    var selNode = dom.getSelectedNode();
    if (!selectionIsBalanced &&
        selNode.tagName &&
        !extUtils.selectedNodeIsATableNode(dom, offsets, selNode)
       )
    {
      // account for simple case where cursor is put to the left of one
      // line; the actual selection is inside of any block tags and needs
      // to be expanded to include the block tags
      var selText = allText.substring(offsets[0],offsets[1]);
      if (!balanceInward &&
          (extUtils.stripWhiteSpace(selText) == extUtils.stripWhiteSpace(selNode.innerHTML))
         )
      {
        // expand selection to include any block tags
        // -- otherwise known as "container tags" -- that surround it
        if (extUtils.isOKToBubbleThroughTag(selNode.tagName))
        {
          offsets = extUtils.getOffsetsAfterBubblingUpTree(selNode);
        }
        selectionIsBalanced = true;
      }

      // account for some special selection cases (as the function name suggests ;-)
      if (!selectionIsBalanced) // the selection hasn't been balanced yet
      {
        offsets = extUtils.getOffsetsAfterAccountingForSomeSpecialSelectionCases(allText,offsets);
      }

      // start balancing selection
      dw.setSelection(offsets[0],offsets[1]); // needed to get selNode var

      // get currently selected node. Note that this method returns a node that contains
      // the complete selection. Therefore the outerHTML of selNode is often greater
      // than the actual selection.

      selNode = dom.getSelectedNode();

      var nodeText = selNode.outerHTML ? selNode.outerHTML : selNode.data;
      var currText = allText.substring(offsets[0],offsets[1]);

      if (extUtils.stripWhiteSpace(nodeText) == extUtils.stripWhiteSpace(currText) ||
          currText.indexOf("<") == -1)
      {
        if (!balanceInward &&
            extUtils.isOKToBubbleThroughTag(selNode.tagName) &&
            extUtils.stripWhiteSpace(nodeText) == extUtils.stripWhiteSpace(currText))
        {
          offsets = extUtils.getOffsetsAfterBubblingUpTree(selNode);
        }
        selectionIsBalanced = true;
      }

      if (!selectionIsBalanced) // selection is not balanced so balance it
      {
        //first, look for a simple common case where only one endtag is selected, e.g.:
        // |<a>text|</a>, or
        // <a>|text</a>|,
        // Select the end tag, opening or closing, that is not yet selected

        var bracketMatch = /</g;
        if (currText.match(bracketMatch).length == 1)
        {
          if (currText.indexOf("<") == 0)
          {
            currText = currText.substring(currText.indexOf(">")+1);
          }
          else if (currText.indexOf(">") == (currText.length-1))
          {
            currText = currText.substring(0,currText.indexOf("<"));
          }

          if (currText == selNode.innerHTML)
          {
            offsets = dw.nodeToOffsets(selNode)
            selectionIsBalanced = true;
          }
        }
      }

      if (!selectionIsBalanced)
      {
        // the simple cases didn't work out, so we are expanding the selection
        // in a more involved fashion - get the objects represented by the first
        // and last offsets. Then expand selection from first offset of first
        // object to last offset of second object.

        var offset1Obj = dw.offsetsToNode(offsets[0],offsets[0]);
        var offset2Obj = dw.offsetsToNode(offsets[1]-1,offsets[1]-1);

        // expand selection so that it is balanced

        obj1Offsets = extUtils.getOffsetsAfterClimbingTree(offset1Obj,offsets);
        obj2Offsets = extUtils.getOffsetsAfterClimbingTree(offset2Obj,offsets);

        // check that the second offset of the first node is less than or
        // equal to the second offset of the second node, and that the
        // first offset of first node is less than or equal to the first offset
        // of the second node.
        // It is unlikely that this would occur, but altogether possible, and if it
        // does, the selection is expanded so that invalid html will not occur
        // (while this may not be ideal solution and the user may wish the selection
        // was not expected, it is a rare case and better than creating invalid HTML).

        var newOffsetStart = Math.min(obj1Offsets[0],obj2Offsets[0]);
        var newOffsetEnd   = Math.max(obj2Offsets[1],obj2Offsets[1]);
        offsets = new Array(newOffsetStart,newOffsetEnd);
      }

      //if selecting for links,remove outer tags if they exist.
      // Examples: <a>one</a>         --> one
      //           <a><b>two</b></a>  --> two
      //           <p>three</p>       --> three

      if (balanceInward)
      {
        offsets = extUtils.getOffsetsAfterStrippingWhiteSpace(allText,offsets[0],offsets[1]);
        selStr = allText.substring(offsets[0],offsets[1]);
        if (selStr.indexOf("<") == 0 && selStr.lastIndexOf(">") == (selStr.length-1))
        {
          var openPattern = /^<([^>]*)>/;
          var closePattern = /<\/([^>]*)>$/;
          var openResult = selStr.match(openPattern);
          var closeResult = selStr.match(closePattern);

          if (openResult != null && closeResult !=null &&
              openResult[1].toUpperCase() == closeResult[1].toUpperCase() &&
              openResult[1].toUpperCase().indexOf("CF") != 0  //don't collapse Cold Fusion tags
             )
          {
            offsets[0] +=  openResult[0].length;
            offsets[1] -=  closeResult[0].length;
          }
        }
      }
      // check for cases where for whatever reason, the entire body got selected
      offsets = extUtils.getOffsetsAfterCheckingForBodySelection(allText,offsets);

      // set selection based on new offsets
      dw.setSelection(offsets[0],offsets[1]);
    }
  }

  retVal = offsets;

  return retVal;
}





//********************************************************************//
//********************************************************************//
//********************************************************************//
//*                                                                  */
//*   WARNING!    WARNING!    WARNING!    WARNING!                   *//
//*                                                                  */
//*   Please DO NOT call the functions and classes below.            *//
//*   This code is used to implement the API functions above, but    *//
//*   cannot be relied upon to not change with new releases.         *//
//*                                                                  */
//********************************************************************//
//********************************************************************//
//********************************************************************//




//--------------------------------------------------------------------
// CLASS:
//   extGroup
//
// DESCRIPTION:
//   Static class wrapping access to extension data group.
//
// PUBLIC PROPERTIES:
//   DEBUG - true if in debug mode.
//
// PUBLIC FUNCTIONS:
//   getTitle(groupName)
//   getVersion(groupName)
//   getServerBehaviorFileName(groupName)
//   getDataSourceFileName(groupName)
//   getSubType(groupName)
//   getParticipantNames(groupName, insertLocation)
//   getSelectParticipant(groupName)
//   getInsertStrings(groupName, paramObj, searchLocation)
//   find(groupName, title)
//   queueDocEdits(groupName, paramObj, sbObj)
//   getWrapsSelection()
//
//--------------------------------------------------------------------
function extGroup()
{
  // extGroup is a static class and has no state.
  throw dwscripts.sprintf(MM.MSG_createStaticClass, "extGroup");
}

extGroup.DEBUG = false; // set debug

// class public methods
extGroup.getTitle = extGroup_getTitle;
extGroup.getVersion = extGroup_getVersion;
extGroup.getServerBehaviorFileName = extGroup_getServerBehaviorFileName;
extGroup.getDataSourceFileName = extGroup_getDataSourceFileName;
extGroup.getSubType = extGroup_getSubType;
extGroup.getFamily = extGroup_getFamily;
extGroup.getParticipantNames = extGroup_getParticipantNames;
extGroup.getSelectParticipant = extGroup_getSelectParticipant;
extGroup.getInsertStrings = extGroup_getInsertStrings;
extGroup.find = extGroup_find;
extGroup.findInString = extGroup_findInString;
extGroup.queueDocEdits = extGroup_queueDocEdits;
extGroup.queueDocEditsForDelete = extGroup_queueDocEditsForDelete;
extGroup.getWrapsSelection = extGroup_getWrapsSelection;

// class private methods
extGroup.addPartToGroups = extGroup_addPartToGroups;
extGroup.canAddPartToGroup = extGroup_canAddPartToGroup;
extGroup.partParametersMatchGroup = extGroup_partParametersMatchGroup;
extGroup.partPositionMatchesGroup = extGroup_partPositionMatchesGroup;
extGroup.matchParts = extGroup_matchParts;
extGroup.queueDocEditsForGroupChange = extGroup_queueDocEditsForGroupChange;
extGroup.participantCompare = extGroup_participantCompare;

//--------------------------------------------------------------------
// FUNCTION:
//   extGroup.getTitle
//
// DESCRIPTION:
//   get ext data group title
//
// ARGUMENTS:
//   groupName - extension data group file name
//
// RETURNS:
//   group title
//--------------------------------------------------------------------
function extGroup_getTitle(groupName)
{
  return dw.getExtDataValue(groupName, "title");
}


//--------------------------------------------------------------------
// FUNCTION:
//   extGroup.getVersion
//
// DESCRIPTION:
//   get ext data group version. Version is the UD version the group
//   was built for.
//
// ARGUMENTS:
//   groupName - extension data group file name
//
// RETURNS:
//   number - version number. 0 if bad format or no version attribute.
//--------------------------------------------------------------------
function extGroup_getVersion(groupName)
{
  var retrievedVersion = parseFloat(dw.getExtDataValue(groupName, "version"));
  if (isNaN(retrievedVersion))
    retrievedVersion = 0;
  return retrievedVersion;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extGroup.getServerBehaviorFileName
//
// DESCRIPTION:
//   get ext data server behavior file name
//
// ARGUMENTS:
//   groupName - extension data group file name
//
// RETURNS:
//   string - server behavior filename
//--------------------------------------------------------------------
function extGroup_getServerBehaviorFileName(groupName)
{
  return dw.getExtDataValue(groupName, "serverBehavior");
}


//--------------------------------------------------------------------
// FUNCTION:
//   extGroup.getDataSourceFileName
//
// DESCRIPTION:
//   get ext data datasource file name
//
// ARGUMENTS:
//   groupName - extension data group file name
//
// RETURNS:
//   string - datasource file name
//--------------------------------------------------------------------
function extGroup_getDataSourceFileName(groupName)
{
  return dw.getExtDataValue(groupName, "dataSource");
}


//--------------------------------------------------------------------
// FUNCTION:
//   extGroup.getSubType
//
// DESCRIPTION:
//   get ext data subtype
//
// ARGUMENTS:
//   groupName - extension data group file name
//
// RETURNS:
//   string - subType
//--------------------------------------------------------------------
function extGroup_getSubType(groupName)
{
  return dw.getExtDataValue(groupName, "subType");
}


//--------------------------------------------------------------------
// FUNCTION:
//   extGroup.getFamily
//
// DESCRIPTION:
//   get ext data family
//
// ARGUMENTS:
//   groupName - extension data group file name
//   paramObj - (optional)
//
// RETURNS:
//   string - family name
//--------------------------------------------------------------------
function extGroup_getFamily(groupName, paramObj)
{
  var retVal = dw.getExtDataValue(groupName, "family");

  if (paramObj)
  {
    retVal = extUtils.replaceParamsInStr(retVal, paramObj);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extGroup.getParticipantNames
//
// DESCRIPTION:
//   Gets a list of participant names for an extGroup. If a searchLocation
//   is given, only returns participant names that use that location.
//
// ARGUMENTS:
//   groupName - ext dat group file name
//   insertLocation (optional) - ext data participant location
//
// RETURNS:
//   array of Participant names
//--------------------------------------------------------------------
function extGroup_getParticipantNames(groupName, insertLocation)
{
  var partNames = dw.getExtDataArray(groupName, "groupParticipants");
  var retPartNames = new Array();

  for (var i=0; i < partNames.length; i++)
  {
    if (!insertLocation || extPart.getLocation(partNames[i]).indexOf(insertLocation) == 0)
    {
      retPartNames.push(partNames[i]);
    }
  }
  return retPartNames;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extGroup.getSelectParticipant
//
// DESCRIPTION:
//   get the name of the participant to select
//
// ARGUMENTS:
//   groupName - ext data group file name
//
// RETURNS:
//   string - participant name
//--------------------------------------------------------------------
function extGroup_getSelectParticipant(groupName)
{
  return dw.getExtDataValue(groupName, "groupParticipants", "selectParticipant");
}


//--------------------------------------------------------------------
// FUNCTION:
//   extGroup.participantCompare
//
// DESCRIPTION:
//   Comparison function used to sort participants into page order
//
// ARGUMENTS:
//   a, b - two participants to be compared
//
// RETURNS:
//   (analagous to strcmp())
//   <0 a comes before b in the page
//   0  a == b
//   >0 a comes after b in the page
//--------------------------------------------------------------------
function extGroup_participantCompare(a,b)
{
  var retVal = false;

  if (a && b)
  {
    a.matchRangeMin = (a.matchRangeMin != null) ? a.matchRangeMin : 0;
    b.matchRangeMin = (b.matchRangeMin != null) ? b.matchRangeMin : 0;

    if (a.participantNode == b.participantNode)
    {
      retVal =  a.matchRangeMin - b.matchRangeMin;
    }
	else
	{
		//see which node opens first in the document
		retVal = a.openNodeBeginOffset - b.openNodeBeginOffset;
	}
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extGroup.find
//
// DESCRIPTION:
//   Locates the Behaviors which match this group
//
// ARGUMENTS:
//   groupName - ext data group file name
//   title (optional) - title to use only if the group does not have a title
//   sbConstructor (optional) - parameter which indicates the constructor
//     function to use when creating the returned objects. If no value
//     is specified, then the ServerBehavior class is used.
//     This is useful for creating derived classes from the base
//     server behavior class.
//   participantList (optional) - if this parameter is not passed, the
//     function dw.getParticipants() is called.  This parameter allows
//     some pre-processing to be done to the list before matching
//     is attempted.
//
// RETURNS:
//   array of ServerBehavior objects (or derived SB objects if the
//     sbConstructor is specified)
//--------------------------------------------------------------------
function extGroup_find(groupName, title, sbConstructor, participantList)
{
  var sbList = new Array();    //array of ServerBehaviors

  var partList = (participantList) ? participantList : dw.getParticipants(groupName);

  if (extGroup.DEBUG) {
    if (partList) {
      for (var i=0; i < partList.length; i++) {
        var msg = new Array();
        msg.push("Participant " + i);
        msg.push("");
        msg.push("participantName = " + partList[i].participantName);
        msg.push("");
        msg.push("parameters = ");
        for (var j in partList[i].parameters) {
          msg.push("  " + j + " = " + partList[i].parameters[j] + " (typeof " + typeof partList[i].parameters[j] + ")");
        }
        msg.push("");
        msg.push("participantText = ");
        if (partList[i].participantNode)
        {
          var nodeHTML = dwscripts.getOuterHTML(partList[i].participantNode);
          msg.push(nodeHTML.substring(partList[i].matchRangeMin,partList[i].matchRangeMax));
        }
        else
        {
          msg.push("ERROR: null participantNode");
        }

        alert(msg.join("\n"));
      }
    } else {
      alert("no participants found for group: " + this.name);
    }
  }

  // Get group title. If no title is defined in the extension data, use the passed
  //   in title. If, in addition, no title is passed in, use the groupName.
  var groupTitle = extGroup.getTitle(groupName);
  if (!groupTitle)
  {
    if (title)
    {
      groupTitle = title;
    }
    else
    {
      groupTitle = groupName;
    }
  }

  if (partList)
  {
    //sort participants for correct matching into groups later
    partList.sort( extGroup_participantCompare );

    //pull out extra information for each part
    for (var i=0; i < partList.length; i++)
    {
      //set the parts position within the master partList
      partList[i].position = i;

      //extract node parameter information
      extPart.extractNodeParam(partList[i].participantName, partList[i].parameters,
                               partList[i].participantNode);

    }

    //now match up the found parts to create a list of part groups
    var partGroupList = extGroup.matchParts(groupName, partList);

    //now walk the partGroupList and create ServerBehaviors
    for (var i=0; i < partGroupList.length; i++)
    {
      var partGroup = partGroupList[i];

      // create a ServerBehavior
      var serverBehavior = null;
      if (sbConstructor == null)
      {
        serverBehavior = new ServerBehavior(groupName);
      }
      else
      {
        serverBehavior = new sbConstructor(groupName);
      }

      //sort the partGroup, so that the insert code finds the participant nodes
      // in the correct document order
      partGroup.sort(new Function("a", "b", "return a.position - b.position"));

      //add the participant information to the ServerBehavior
      for (var j=0; j < partGroup.length; j++)
      {
        if (extPart.getVersion(partGroup[j].participantName) >= 5.0)
        {
          //add the information to the ServerBehavior
          var sbPart = new SBParticipant(partGroup[j].participantName, partGroup[j].participantNode,
                                         partGroup[j].matchRangeMin, partGroup[j].matchRangeMax,
                                         partGroup[j].parameters);
        }
        else
        {
          //add the information to the ServerBehavior
          var sbPart = new SBParticipant(partGroup[j].participantName, partGroup[j].participantNode,
                                         0, 0,
                                         partGroup[j].parameters);
        }
        serverBehavior.addParticipant(sbPart);

        //set the selected node
        if (partGroup[j].participantName == extGroup.getSelectParticipant(groupName))
        {
          serverBehavior.setSelectedNode(partGroup[j].participantNode);
        }
      }

      //set the title
      serverBehavior.setTitle(extUtils.replaceParamsInStr(groupTitle,
                                                    serverBehavior.getParameters(false)));

      //set the family
      serverBehavior.setFamily(extGroup.getFamily(groupName, serverBehavior.getParameters(false)));

      //check the ServerBehavior for completeness
      var partNames = extGroup.getParticipantNames(groupName);
      for (var j=0; j < partNames.length; j++)
      {
        var isOptional = extPart.getIsOptional(groupName, partNames[j]);
        sbPart = serverBehavior.getNamedSBPart(partNames[j]);
        var partNode = null;
        if (sbPart)
        {
          partNode = sbPart.getNodeSegment().node;
        }

        //if this is not an optional participant, check the ServerBehavior for completeness
        if (!isOptional && extPart.getWhereToSearch(partNames[j]) && partNode == null)
        {
          serverBehavior.setIsIncomplete(true);

          if (extGroup.DEBUG)
          {
            alert("setting record #" + i + " to incomplete: missing part: " + partNames[j]);
          }
        }
      }

      // Make the sb object backward compatible with the UD4 sb object.
      serverBehavior.makeUD4Compatible();

      //add it to the list of ServerBehaviors
      sbList.push(serverBehavior);
    }
  }

  return sbList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extGroup.matchParts
//
// DESCRIPTION:
//   Processes the list of found parts.
//   These records contain pointers to the participant information.
//
//   NOTE: need to check for broken server behaviors which might be merged.
//   walk the sbList and locate records which are missing complementary
//   participants.
//
// ARGUMENTS:
//   groupName - ext data group filename
//   partList - list of existing participants returned by UD
//
// RETURNS:
//   an array of participant arrays
//--------------------------------------------------------------------
function extGroup_matchParts(groupName, partList)
{
  var partGroupList = new Array();
  var participantNames = extGroup.getParticipantNames(groupName);
  //first, go through the identifier parts, and create group nodes
  for (var i=0; i < participantNames.length; i++)
  {
    for (var partNum=0; partNum < partList.length; partNum++)
    {
      if (partList[partNum].participantName == participantNames[i])
      {
        var part = partList[partNum];

        //check each identifier to see if we need to create a new group
        if (extPart.getIsIdentifier(groupName, part.participantName))
        {
          var added = extGroup.addPartToGroups(groupName, partGroupList, part, partList);

          if (!added)
          {
            //create a new record and add the part
            var newGroup = new Array();
            newGroup.push(part);
            partGroupList.push(newGroup);
          }
        }
      }
    }
  }

  //now try add all the parts to an exisiting part group
  // in the order which they are listed in the xml file
  // (NOTE: this works for multiples, because they will not have been added above)
  for (var i=0; i < participantNames.length; i++)
  {
    for (var partNum=0; partNum < partList.length; partNum++)
    {
      if (partList[partNum].participantName == participantNames[i])
      {
        var part = partList[partNum];
        var added = extGroup.addPartToGroups(groupName, partGroupList, part, partList);
      }
    }
  }

  return partGroupList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extGroup.addPartToGroups
//
// DESCRIPTION:
//   This function adds the given part to all matching partGroups.
//   It skips group which already contain a part of the same type,
//   unless the participant is of part type "multiple".
//
// ARGUMENTS:
//   groupName - ext data group filename
//   partGroupList - list of lists of participants. elements are groups being built up.
//   part - participant to add
//   partList - participant list found by UD
//
// RETURNS:
//   boolean - true if the part was added to an existing partGroup.
//--------------------------------------------------------------------
function extGroup_addPartToGroups(groupName, partGroupList, part, partList)
{
  var retVal = false;

  //see if we can add this part to any of the existing groups
  for (var i=0; i < partGroupList.length; i++) {

    var partGroup = partGroupList[i];

    var groupHasPart = false;
    if (extPart.getPartType(groupName, part.participantName) != "multiple")
    {
      for (var j=0; !groupHasPart && j < partGroup.length; j++)
      {
        groupHasPart = (partGroup[j].participantName == part.participantName);
      }
    }

    if (!groupHasPart && extGroup.canAddPartToGroup(groupName, partGroup, part, partList))
    {
      //add to the group
      partGroup.push(part);
      retVal = true;
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extGroup.canAddPartToGroup
//
// DESCRIPTION:
//   Returns true if the part indicated by partNum, in the partList,
//   can be added to the given partGroup.
//
// ARGUMENTS:
//   groupName - ext data group filename
//   partGroup - list of participants which comprise a possible group
//   part - participant being considered for add
//   partList - participant list returned by UD
//
// RETURNS:
//   boolean - true if can be added
//--------------------------------------------------------------------
function extGroup_canAddPartToGroup(groupName, partGroup, part, partList)
{
  var result = null;

  //check if the user has defined a matching function
  if (result == null && window.canAddPartToGroup != null) {
    result = window.canAddPartToGroup(partGroup, part, partList);
  }

  //check if the parameters match and the position is correct
  if (result == null) 
  {
    result = ( extGroup.partParametersMatchGroup(partGroup, part, partList) &&
               extGroup.partPositionMatchesGroup(groupName, partGroup, part, partList) );
  }

  return result;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extGroup.partParametersMatchGroup
//
// DESCRIPTION:
//   Returns true if all common parameters between the given part, and
//   the parts in the partGroup match.  It does not check against parts
//   with the same name, to handle parts of type "multiple".
//
// ARGUMENTS:
//   partGroup - list of participants which comprise a possible group
//   part - participant being considered
//   partList - list of existing participants returned by UD
//
// RETURNS:
//   boolean - true if parameters match
//--------------------------------------------------------------------
function extGroup_partParametersMatchGroup(partGroup, part, partList)
{
  var retVal = true;

  for (var i=0; retVal && i < partGroup.length; i++)
  {
    //for multiples, only check the parts which do not
    // have the same name as the given part
    if (partGroup[i].participantName != part.participantName)
    {
      //check if the parameters match
      retVal = extUtils.parametersMatch(part.parameters, partGroup[i].parameters);
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extGroup.partPostionMatchesGroup
//
// DESCRIPTION:
//   Returns true if the given part is in the correct location, relative
//   to the other parts in this group.
//
// ARGUMENTS:
//   groupName - ext data group filename
//   partGroup - list of participants which comprise a possible group
//   part - participant under consideration for add
//   partList - list of existing participants returned by UD
//
// RETURNS:
//   boolean - true if correct position
//--------------------------------------------------------------------
function extGroup_partPositionMatchesGroup(groupName, partGroup, part, partList)
{
  var retVal = true;

  for (var i=0; retVal && i < partGroup.length; i++)
  {
    var groupPart = partGroup[i];

    //only check parts which are both selection relative inserts or aboveHTML and
    // whose search locations match (so we can use the nodeNumber property)
    // Note that for 'aboveHTML' insert locations, we ONLY care if the location weights
    //   are the same too.
    if (   (extPart.getIsSelectionRel(part.participantName) && extPart.getIsSelectionRel(groupPart.participantName))
        || (extPart.getIsAroundNode(part.participantName) && extPart.getIsAroundNode(groupPart.participantName))
        || (   extPart.getLocation(part.participantName).indexOf("aboveHTML") != -1
            && extPart.getLocation(part.participantName) == extPart.getLocation(groupPart.participantName)
           )
       )
    {
      //assign the partBefore to the groupPart.  This function is probably
      //being called in the group file order, which means the new part
      //would be after any previous parts most of the time.
      var partBefore = groupPart;
      var partAfter  = part;

      // if they have the same insert location, check their order in the file
      var groupPartLoc = extPart.getLocation(groupPart.participantName);
      var partLoc = extPart.getLocation(part.participantName);
      if (partLoc == groupPartLoc)
      {
        var names = extGroup.getParticipantNames(groupName);
        for (var j=0; j < names.length; j++)
        {
          if (names[j] == groupPart.participantName)
          {
            break;
          }
          else if (names[j] == part.participantName)
          { //swap the order
            partBefore = part;
            partAfter = groupPart;
            break;
          }
        }
      }
      else
      {
        //because the locations are different,
        // use [before, replace, after] as the order.
        if (groupPartLoc.indexOf("after") != -1 ||
            (groupPartLoc.indexOf("replace") != -1 &&
             partLoc.indexOf("before") != -1) )
        {
          partBefore = part;
          partAfter  = groupPart;
        }
      }

      //check to see if partBefore is between partAfter and the node before it,
      // and partAfter is between partBefore and the node after it
      if (   partBefore.position != null && partAfter.position != null
          && partBefore.position < partAfter.position
         )
      {
        //now check that if parts of the same kind are between them, they are paired
        var count = 0;
        for (var j=partBefore.position + 1; j < partAfter.position; j++)
        {
          if (partList[j].participantName == partBefore.participantName)
          {
            count++;
          }
          if (partList[j].participantName == partAfter.participantName)
          {
            count--;
          }
          if (count < 0)
          { //found partAfter first, bad position
            retVal = false;
            break;
          }
        }
        if (retVal && count != 0)
        { //parts did not match, bad position
          retVal = false;
        }

      }
      else
      {
        retVal = false;
      }
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extGroup.getInsertStrings
//
// DESCRIPTION:
//   Gets the text to be inserted for at a given location
//
// ARGUMENTS:
//   groupName - ext data group filename
//   paramObj - parameter object
//   insertLocation -
//
// RETURNS:
//   array of strings to be inserted at the given location
//--------------------------------------------------------------------
function extGroup_getInsertStrings(groupName, paramObj, insertLocation)
{
  var retVal = new Array();
  var partNames = extGroup.getParticipantNames(groupName);
  for (var i=0; i < partNames.length; i++)
  {
    theStr = extPart.getInsertString(groupName, partNames[i], paramObj, insertLocation);
    if (theStr)
    {
      retVal.push(theStr);
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extGroup.findInString
//
// DESCRIPTION:
//   Locates the Behaviors which match this group
//
// ARGUMENTS:
//   groupName - ext data group filename
//   theStr - string to search in
//
// RETURNS:
//   list of ServerBehaviors (at most one ServerBehavior, for the given text)
//--------------------------------------------------------------------
function extGroup_findInString(groupName, theStr)
{
  var sbList = new Array();

  var foundMatch = false;
  var serverBehavior = new ServerBehavior(groupName);

  var partNames = extGroup.getParticipantNames(groupName);
  for (var i=0; i < partNames.length; i++)
  {
    var parameters = extPart.findInString(partNames[i], theStr);
    if (parameters != null)
    {
      serverBehavior.setParameters(parameters);
      foundMatch = true;
    }
  }

  if (foundMatch)
    sbList.push(serverBehavior);

  return sbList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extGroup.queueDocEdits
//
// DESCRIPTION:
//   schedule the group edits for application to the document. do not commit
//   the scheduled edits.
//
// ARGUMENTS:
//   groupName - ext data group filename
//   paramObj - parameter object
//   sbObj - prior ServerBehavior
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function extGroup_queueDocEdits(groupName, paramObj, sbObj)
{
  //fix up the selection
  //if (!sbObj && paramObj.MM_selection == null)
  //{
  //  paramObj.MM_selection = dwscripts.fixUpSelection(dw.getDocumentDOM(), false, false);
  //}

  //process any family parameter default values
  var familyName = extGroup.getFamily(groupName, paramObj);
  if (familyName && paramObj.MM_familyDefaults)
  {
    // look for other SBs in the family
    var familyMember = null;
    var allSBs = dw.serverBehaviorInspector.getServerBehaviors();
    for (var i=0; i < allSBs.length; i++)
    {
      if (allSBs[i].getFamily() == familyName)
      {
        familyMember = allSBs[i];
        break;
      }
    }

    for (var param in paramObj.MM_familyDefaults)
    {
      if (familyMember && familyMember.getParameter(param) != null)
      {
        paramObj[param] = familyMember.getParameter(param);
      }
      else
      {
        paramObj[param] = paramObj.MM_familyDefaults[param];
      }
    }
  }

  //we are changing groups, delete the old, and apply the new
  if (sbObj && sbObj.getName() != groupName)
  {
    extGroup.queueDocEditsForGroupChange(groupName, paramObj, sbObj);
  }
  else
  {
    //walk the list of participants
    var partNames = extGroup.getParticipantNames(groupName);
    for (var i=0; i < partNames.length; i++)
    {
      //schedule each participant edit to the document
      extPart.queueDocEdits(groupName, partNames[i], paramObj, sbObj);
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   extGroup.queueDocEditsForGroupChange
//
// DESCRIPTION:
//   Converts the sb from one group type to another
//
// ARGUMENTS:
//   groupName - ext data group filename
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function extGroup_queueDocEditsForGroupChange(groupName, paramObj, sbObj)
{
  var oldGroupName = sbObj.getName();
  var sbPartList = sbObj.getParticipants(); // SBParticipant list
  var usedNodeSegments = new Array();
  var nodeSegment;

  //walk the list of participants
  var partNames = extGroup.getParticipantNames(groupName);
  for (var i=0; i < partNames.length; i++)
  {
    //check if the participant exists in the previous group
    var oldPartNames = extGroup.getParticipantNames(oldGroupName);
    if (dwscripts.findInArray(oldPartNames, partNames[i]) != -1)
    {
      //apply as normal
      extPart.queueDocEdits(groupName, partNames[i], paramObj, sbObj);

      //add the participants with this name to the used list
      for (var j=0; j < sbPartList.length; j++)
      {
        if (sbPartList[j].getName() == partNames[i])
        {
          usedNodeSegments.push(sbPartList[j].getNodeSegment());
        }
      }

    }
    else
    { //participant not found in the previous record
      //need to find where to insert
      var foundInsert = false;
      for (var j=0; !foundInsert && j < sbPartList.length; j++) {

        nodeSegment = sbPartList[j].getNodeSegment();

        //found a matching location
        if (   sbPartList[j].getWeight().indexOf(extPart.getLocation(partNames[i])) == 0
            && !extUtils.isDependentNodeSegment(nodeSegment,true)
           )
        {
          //make sure it is not already in the used node list
          var found = false;
          for (var k=0; !found && k < usedNodeSegments.length; k++)
          {
            if (nodeSegment.equals(usedNodeSegments[k]))
            {
              found = true;
            }
          }

          if (!found)
          {
            //get text to insert and replace all parameters
            var insertText = extPart.getInsertText(partNames[i], paramObj);

            if (insertText)
            {
              var optionFlags = 0;
              if (extPart.getVersion(partNames[i]) < 5.0)
              {
                optionFlags = docEdits.QUEUE_DONT_MERGE;
              }

              //add edit to docEdits
              extPart.queueDocEdit(partNames[i], insertText, nodeSegment, sbPartList[j].getWeight(), null, optionFlags);
              
              //add this node to the used node list
              usedNodeSegments.push(nodeSegment);

              foundInsert = true;

            }
          }
        }
      }

      //if no previous insert location found, apply as normal
      if (!foundInsert)
      {
        extPart.queueDocEdits(groupName, partNames[i], paramObj, sbObj);
      }
    }

  }

  //now, delete the participants that were not used
  for (var j=0; j < sbPartList.length; j++)
  {
    nodeSegment = sbPartList[j].getNodeSegment();
    var found = false;
    for (var k=0; !found && k < usedNodeSegments.length; k++)
    {
      if (nodeSegment.equals(usedNodeSegments[k]))
      {
        found = true;
      }
    }

    if (!found && !extUtils.isDependentNodeSegment(nodeSegment,true))
    {
      extPart.queueDocEditsForDelete(sbPartList[j]);
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   extGroup.queueDocEditsForDelete
//
// DESCRIPTION:
//   This function queues the document edits that are need to delete
//   the given server behavior.  This function calls extPart to queue
//   the edits for each participant.
//
// ARGUMENTS:
//   groupName - string - the name of the group file to queue delete
//     edits for
//   sbObj - ServerBehavior object - the server behavior object for
//     the server behavior the user wishes to delete
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function extGroup_queueDocEditsForDelete(sbObj)
{
  //walk the list of participants
  var parts = sbObj.getParticipants();
  for (var i=0; i < parts.length; i++)
  {
    //schedule each participant edit to the document
    extPart.queueDocEditsForDelete(parts[i]);
  }
}



//--------------------------------------------------------------------
// FUNCTION:
//   extGroup.getWrapsSelection
//
// DESCRIPTION:
//   This function returns true if the given group wraps the selection.
//   This is the case if the group contains a participant with a weight
//   of wrapSelection, or if the group contains a participant with a
//   weight of beforeSelection and another participant with a weight of
//   afterSelection.
//
// ARGUMENTS:
//   groupName - string - the name of the group file to check
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function extGroup_getWrapsSelection(groupName)
{
  var retVal = false;

  var foundStart = false;

  //walk the list of participants
  var partNames = extGroup.getParticipantNames(groupName);
  for (var i=0; i < partNames.length; i++)
  {
    var partWeight = extPart.getWeight(partNames[i]);

    if (partWeight == "wrapSelection")
    {
      retVal = true;
      break;
    }
    else if (partWeight == "beforeSelection")
    {
      foundStart = true;
    }
    else if (partWeight == "afterSelection")
    {
      if (foundStart)
      {
        retVal = true;
        break;
      }
    }
  }

  return retVal;
}



//--------------------------------------------------------------------
// CLASS:
//   extPart
//
// DESCRIPTION:
//   Static class wrapping access to extension data participant.
//
// PUBLIC PROPERTIES:
//   DEBUG - true if in debug mode
//
// PUBLIC FUNCTIONS:
//   getDeleteType(partName)
//   getVersion(partName)
//   getLocation(partName)
//   getQuickSearch(partName)
//   getRawInsertText(partName)
//   getSearchPatterns(partName)
//   getWhereToSearch(partName)
//   getNodeParamName(partName)
//   getUpdatePatterns(partName)
//   getPartType(groupName, partName)
//   getIsIdentifier(groupName, partName)
//   getIsOptional(groupName, partName)
//   getInsertString(groupName, partName, paramObj, searchLocation)
//   queueDocEdits(groupName, partName, paramObj, sbObj)
//   getIsSelectionRel(partName)
//   getIsNodeRel(partName)
//   getIsAroundNode(partName)
//   extractNodeParam(partName, parameters, node)
//
//--------------------------------------------------------------------
function extPart()
{
  // extPart is a static class and has no state.
  throw dwscripts.sprintf(MM.MSG_createStaticClass, "extPart");
}

// class public properties
extPart.DEBUG = false;

// class public methods
extPart.getDeleteType = extPart_getDeleteType;
extPart.getVersion = extPart_getVersion;
extPart.getLocation = extPart_getLocation;
extPart.getQuickSearch = extPart_getQuickSearch;
extPart.getRawInsertText = extPart_getRawInsertText;
extPart.getSearchPatterns = extPart_getSearchPatterns;
extPart.getWhereToSearch = extPart_getWhereToSearch;
extPart.getNodeParamName = extPart_getNodeParamName;
extPart.getUpdatePatterns = extPart_getUpdatePatterns;
extPart.getPartType = extPart_getPartType;
extPart.getIsIdentifier = extPart_getIsIdentifier;
extPart.getIsOptional = extPart_getIsOptional;
extPart.getInsertString  = extPart_getInsertString;
extPart.findInString     = extPart_findInString;
extPart.queueDocEdits    = extPart_queueDocEdits;
extPart.queueDocEdit = extPart_queueDocEdit;
extPart.queueDocEditsForDelete = extPart_queueDocEditsForDelete;
extPart.getIsSelectionRel = extPart_getIsSelectionRel;
extPart.getIsNodeRel = extPart_getIsNodeRel;
extPart.getIsAroundNode = extPart_getIsAroundNode;
extPart.extractNodeParam = extPart_extractNodeParam;
extPart.getInnerHTML = extPart_getInnerHTML;
extPart.getInnerHTMLOffsets = extPart_getInnerHTMLOffsets;

// private methods
extPart.expandParameterObject = extPart_expandParameterObject;
extPart.getWeight = extPart_getWeight;
extPart.getInsertNode = extPart_getInsertNode;
extPart.getInsertText = extPart_getInsertText;
extPart.parametersMatch = extPart_parametersMatch;
extPart.updateExistingNodeSegment = extPart_updateExistingNodeSegment;
extPart.hasLimitedUpdates = extPart_hasLimitedUpdates;


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.queueDocEdit()
//
// DESCRIPTION:
//   This is a small wrapper for DocEdits_queue() that performs some
//   part-specific logic.
//
// ARGUMENTS:
//   See DocEdits_queue().
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function extPart_queueDocEdit(partName, text, priorNodeSegment, weight, relativeNode, optionFlags)
{
  var obj = new DocEdit(text, priorNodeSegment, weight, relativeNode, optionFlags);

  if (obj.priorNode)
  {
    var offsets = dwscripts.getNodeOffsets(obj.priorNode);

    obj.insertPos = offsets[0];
    offsets = extPart_getInnerHTMLOffsets(partName, obj.priorNode);
    obj.replacePos =  obj.insertPos + offsets.begin;
  }

  docEdits.editList.push(obj);
}

//--------------------------------------------------------------------
// FUNCTION:
//   extPart.getDeleteType
//
// DESCRIPTION:
//   get delete type from ext data
//
// ARGUMENTS:
//   partName - ext data participant filename
//
// RETURNS:
//   delete type
//--------------------------------------------------------------------
function extPart_getDeleteType(partName)
{
  return dw.getExtDataValue(partName, "delete", "deleteType");
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.getVersion
//
// DESCRIPTION:
//   get version from ext data
//
// ARGUMENTS:
//   partName - ext data participant filename
//
// RETURNS:
//   version number. 0 if bad format or no version attribute.
//--------------------------------------------------------------------
function extPart_getVersion(partName)
{
  var retrievedVersion = parseFloat(dw.getExtDataValue(partName, "version"));
  if (isNaN(retrievedVersion))
    retrievedVersion = 0;
  return retrievedVersion;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.getLocation
//
// DESCRIPTION:
//   get location from ext data
//
// ARGUMENTS:
//   partName - ext data participant filename
//
// RETURNS:
//   location string
//--------------------------------------------------------------------
function extPart_getLocation(partName)
{
  return dw.getExtDataValue(partName, "insertText", "location");
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.getQuickSearch
//
// DESCRIPTION:
//   get quicksearch from ext data
//
// ARGUMENTS:
//   partName - ext data participant filename
//
// RETURNS:
//   quickSearch string
//--------------------------------------------------------------------
function extPart_getQuickSearch(partName)
{
  return dw.getExtDataValue(partName, "quickSearch");
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.getRawInsertText
//
// DESCRIPTION:
//   get insert text from ext data
//
// ARGUMENTS:
//   partName - ext data participant filename
//
// RETURNS:
//   insert text
//--------------------------------------------------------------------
function extPart_getRawInsertText(partName)
{
  return dw.getExtDataValue(partName, "insertText");
}

//--------------------------------------------------------------------
// FUNCTION:
//   extPart.getInnerHTMLOffsets
//
// DESCRIPTION:
//   Returns the beginning and ending offsets of the innerHTML
//   for the given node.
//
// ARGUMENTS:
//   partName - ext data participant filename
//   node - DOM node - the node to get the inner html for
//
// RETURNS:
//   string
//--------------------------------------------------------------------
function extPart_getInnerHTMLOffsets(partName, node)
{
  var ret = new Object();
  ret.begin = -1;
  ret.end = -1;
  
  // The old call to dwscipts.getInnerHTML() doesn't work for
  // parts that insert nested tags like
  // <ASP:Repeater><ItemTemplate> because it only looks
  // for the first begin/end tag pair. Now, we call
  // extPart.getInnerHTMLPos(), which knows exactly how
  // many tags were inserted. We only care about this logic
  // for "wrapSelection" parts.

  if (partName && (extPart.getLocation(partName).indexOf("wrapSelection") != -1))
  {
    var rawText = extPart.getRawInsertText(partName);

    // Count the open tags that aren't inside quotes
    // TODO: We should just do this once at startup

    var tagCount = 0;
    var inQuotes = false;
    var innerHtmlBegin = 0;
    var c;

    for (var i = 0; i < rawText.length; i++)
    {
      c = rawText[i];

      if ((c == '"') || (c == '\''))
      {
        inQuotes = !inQuotes;
      }
      else if ((c == '<') && !inQuotes)
      {
        tagCount++;
      }
    }

    var outerHTML = dwscripts.getOuterHTML(node);

    var callback = new Object();
    callback.tagName = "";
    callback.tagCount = tagCount;
    callback.tagNameCount = 0;
    callback.innerStart = -1;
    callback.innerEnd = -1;
    callback.openTagBegin = new Function("tag,offset","this.tagCount--; if (this.tagCount == 0 && !this.tagName) { this.tagName = tag; } if (this.tagName.toUpperCase() == tag.toUpperCase()) { ++this.tagNameCount; }");
    callback.openTagEnd = new Function("offset","if (this.tagCount == 0) { this.innerStart = offset; }");
    callback.closeTagBegin = new Function("tag,offset","if (this.tagName.toUpperCase() == tag.toUpperCase()) { --this.tagNameCount; if (this.tagNameCount == 0) { this.innerEnd = offset; this.tagName = ''; } }");

    dw.scanSourceString(outerHTML, callback);

    ret.begin = callback.innerStart;
    ret.end = callback.innerEnd;
  }

  if (ret.begin < 0 || ret.end < 0)
  {
    var lastTagPos = dwscripts.getOuterHTML(node).lastIndexOf("</");

    ret.begin = (lastTagPos - dwscripts.getInnerHTML(node).length);
    ret.end = lastTagPos;
  }

  return ret;
}

//--------------------------------------------------------------------
// FUNCTION:
//   extPart.getInnerHTML
//
// DESCRIPTION:
//   Returns the innerHTML of the given node.  This function correctly
//   handles locked nodes.
//
// ARGUMENTS:
//   partName - ext data participant filename
//   node - DOM node - the node to get the inner html for
//
// RETURNS:
//   string
//--------------------------------------------------------------------
function extPart_getInnerHTML(partName, node)
{
  var ret = "";
  var offsets = extPart_getInnerHTMLOffsets(partName, node);

  if ((offsets.begin >= 0) && (offsets.end >= 0))
  {
    ret = dwscripts.getOuterHTML(node).substring(offsets.begin, offsets.end);
  }

  return ret;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.getWhereToSearch
//
// DESCRIPTION:
//   get whereToSearch value from ext data
//
// ARGUMENTS:
//   partName - ext data participant filename
//
// RETURNS:
//   whereToSearch string
//--------------------------------------------------------------------
function extPart_getWhereToSearch(partName)
{
  return dw.getExtDataValue(partName, "searchPatterns", "whereToSearch");
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.getSearchPatterns
//
// DESCRIPTION:
//   get search patterns from ext data
//
// ARGUMENTS:
//   partName - ext data participant filename
//
// RETURNS:
//   array of SearchPattInfo objects
//--------------------------------------------------------------------
function extPart_getSearchPatterns(partName)
{
  var paramNames, isOptional, limitSearch, pattern, match; //SearchPattInfo props
  var searchPatterns = new Array(); // List of SearchPattInfo objects
  var searchPattList = dw.getExtDataArray(partName, "searchPatterns");
  for (var i=0; searchPattList && i < searchPattList.length; i++)
  {
    if (searchPattList[i] != "whereToSearch")
    {
      paramNames = dw.getExtDataValue(partName, "searchPatterns", searchPattList[i], "paramNames");
      isOptional = dw.getExtDataValue(partName, "searchPatterns", searchPattList[i], "isOptional");
      limitSearch = dw.getExtDataValue(partName, "searchPatterns", searchPattList[i], "limitSearch");
      pattern = dw.getExtDataValue(partName, "searchPatterns", searchPattList[i]);
      match = '';
      searchPatterns.push(new SearchPattInfo(paramNames, isOptional, limitSearch, pattern, match));
    }
  }
  return searchPatterns;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.getNodeParamName
//
// DESCRIPTION:
//   get node param name from ext data
//
// ARGUMENTS:
//   partName - ext data participant filename
//
// RETURNS:
//   node param name
//--------------------------------------------------------------------
function extPart_getNodeParamName(partName)
{
  return dw.getExtDataValue(partName, "insertText", "nodeParamName");
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.getUpdatePatterns
//
// DESCRIPTION:
//   get update patterns from ext data
//
// ARGUMENTS:
//   partName - ext data participant filename
//
// RETURNS:
//   array of UpdatePattInfo objs or null if none
//--------------------------------------------------------------------
function extPart_getUpdatePatterns(partName)
{
  var updatePatterns = new Array(); // UpdatePattInfo List
  var paramName, limitSearch, pattern; // UpdatePattInfo props
  var updatePattList = dw.getExtDataArray(partName, "updatePatterns");
  for (var i=0; updatePattList && i < updatePattList.length; i++)
  {
    if (updatePattList[i] != "whereToSearch")
    {
      paramName   = dw.getExtDataValue(partName, "updatePatterns", updatePattList[i], "paramName");
      limitSearch = dw.getExtDataValue(partName, "updatePatterns", updatePattList[i], "limitSearch");
      pattern     = dw.getExtDataValue(partName, "updatePatterns", updatePattList[i]);
      updatePatterns.push(new UpdatePattInfo(paramName, limitSearch, pattern));
    }
  }
  return updatePatterns;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.getPartType
//
// DESCRIPTION:
//   get participation type of participant for group
//
// ARGUMENTS:
//   groupName - ext data group filename
//   partName - ext data participant filename
//
// RETURNS:
//   participant type
//--------------------------------------------------------------------
function extPart_getPartType(groupName, partName)
{
  var retVal = "";

  if (groupName)
  {
    retVal = dw.getExtDataValue(groupName, "groupParticipants", partName, "partType");
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.getIsIdentifier
//
// DESCRIPTION:
//   determine if participant is identifier for the group
//
// ARGUMENTS:
//   groupName - ext data group filename
//   partName - ext data participant filename
//
// RETURNS:
//   true if identifier or if no partType (defaults to identifier)
//--------------------------------------------------------------------
function extPart_getIsIdentifier(groupName, partName)
{
  var partType = extPart.getPartType(groupName, partName);
  return (!partType || partType == "identifier");
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.getIsOptional
//
// DESCRIPTION:
//   determine if participant is optional for the group
//
// ARGUMENTS:
//   groupName - ext data group filename
//   partName - ext data participant filename
//
// RETURNS:
//   true if optional participant
//--------------------------------------------------------------------
function extPart_getIsOptional(groupName, partName)
{
  var partType = extPart.getPartType(groupName, partName);
  return (partType == "option" || partType == "multiple");
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.hasLimitedUpdates
//
// DESCRIPTION:
//   determine if any of the update patterns have a limited search
//
// ARGUMENTS:
//   partName - ext data participant file name
//
// RETURNS:
//   true if limited udpates
//--------------------------------------------------------------------
function extPart_hasLimitedUpdates(partName)
{
  var hasLimitedUpdates = false;
  var updatePatterns = extPart.getUpdatePatterns(partName);
  for (var i=0; !hasLimitedUpdates && i < updatePatterns.length; i++)
  {
    if (updatePatterns[i].limitSearch)
      hasLimitedUpdates = true;
  }
  return hasLimitedUpdates;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.getIsSelectionRel
//
// DESCRIPTION:
//   determine if insert location is selection relative
//
// ARGUMENTS:
//   partName - ext data participant filename
//
// RETURNS:
//   true if selection relative
//--------------------------------------------------------------------
function extPart_getIsSelectionRel(partName)
{
  return (String(extPart.getLocation(partName)).search(/selection/i) != -1);
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.getIsNodeRel
//
// DESCRIPTION:
//   determine if insert location is node relative
//
// ARGUMENTS:
//   partName - ext data participant filename
//
// RETURNS:
//   true if node relative
//--------------------------------------------------------------------
function extPart_getIsNodeRel(partName)
{
  return (String(extPart.getLocation(partName)).search(/node/i) != -1);
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.getIsAroundNode
//
// DESCRIPTION:
//   determines if insert location is around a node
//
// ARGUMENTS:
//   partName - ext data participant filename
//
// RETURNS:
//   true if around a node
//--------------------------------------------------------------------
function extPart_getIsAroundNode(partName)
{
  return    extPart.getIsNodeRel(partName)
         && (   (String(extPart.getLocation(partName)).search(/before/i) != -1)
             || (String(extPart.getLocation(partName)).search(/after/i) != -1)
            );
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.queueDocEdits
//
// DESCRIPTION:
//   adds the information for the participant to the edit list
//
// ARGUMENTS:
//   groupName - ext data group filename
//   partName - ext data participant filename
//   paramObj - parameter object
//   sbObj - prior ServerBehavior object
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function extPart_queueDocEdits(groupName, partName, paramObj, sbObj)
{
  var location = extPart.getLocation(partName);
  
  // NOTE: This only updates the location for insertion.
  //       Finds will need to be done separately, if they
  //       rely on this new location.
  if (paramObj.MM_location != null)
  {
    location = paramObj.MM_location;
  }

  // Check that we have an insert location and insert text. Also check that we
  //   have a prior node, or we have insert text. If we do not have a prior node
  //   and have no insert text, the participant should be ignored. This may happen
  //   if the entire participant is conditional and the condition fails.
  if (   location && extPart.getRawInsertText(partName)
      && (   (sbObj && sbObj.getNamedSBPart(partName))
          || extPart.getInsertText(partName, paramObj)
         )
     )
  {
    var sbPartList = (sbObj) ? sbObj.getParticipants() : new Array(); // existing SBParticipants
    var sbPart = null; // SBParticipant

    var paramArray = extPart.expandParameterObject(groupName, partName, paramObj);

    if (extPart.DEBUG && paramArray.length == 0) {
      alert("skipping participant " + partName + ", with empty parameter");
    }

    var priorNodeSegmentArray = null;
    var deleteNodeSegmentArray = null;
    if (extPart.getPartType(groupName, partName) == "multiple") {

      priorNodeSegmentArray = new Array();
      deleteNodeSegmentArray = new Array();

      //find the priorNodeSegments for each parameter object

      var partList = dw.getParticipants(partName);
      for (var j=0; partList && j < partList.length; j++) {
        //get the node information
        extPart.extractNodeParam(partName, partList[j].parameters, partList[j].participantNode);
      }

      for (var i=0; i < paramArray.length; i++) {
        if (sbObj && !sbObj.getForceMultipleUpdate())
        {
          for (var j=0; j < sbPartList.length; j++)
          {
            if (   sbPartList[j].getName() == partName
                && extPart.parametersMatch(partName, paramArray[i], sbPartList[j].getParameters())
               )
            {
              priorNodeSegmentArray.push(sbPartList[j].getNodeSegment());
              break;
            }
          }
        }

        if (!sbObj || j == sbPartList.length) {

          var existingNodeSegment = null;

          //look for an existing match on the page,
          //if the insert location is aboveHTML, belowHTML, or the child of a node
          if ((!sbObj || !sbObj.getForceMultipleUpdate()) &&
              (location.indexOf("aboveHTML") != -1 ||
               location.indexOf("belowHTML") != -1 ||
               location.indexOf("firstChildOfNode") != -1 ||
               location.indexOf("lastChildOfNode") != -1))
          {
            if (partList)
            {
              //select the correct match and assign it to existingNode
              for (var j=0; j < partList.length; j++)
              {
                //if we have a match, set existingNode and break
                if (extPart.parametersMatch(partName, paramArray[i], partList[j].parameters))
                {
                  if (extPart.getVersion(partName) >= 5.0)
                  {
                    existingNodeSegment = new NodeSegment(partList[j].participantNode, partList[j].matchRangeMin, partList[j].matchRangeMax);
                  }
                  else
                  {
                    existingNodeSegment = new NodeSegment(partList[j].participantNode);
                  }
                  break;
                }
              }
            }
          }

          priorNodeSegmentArray.push(existingNodeSegment);
        }
      }

      //identify the prior nodes which need to be deleted
      //(no need to delete attributes because their values get replaced anyhow
      if (sbObj && location.indexOf("nodeAttribute+") == -1) {
        for (var i=0; i < sbPartList.length; i++) {
          var nodeSegment = sbPartList[i].getNodeSegment();
          if (sbPartList[i].getName() == partName) {
            for (var j=0; j < priorNodeSegmentArray.length; j++) {
              if (priorNodeSegmentArray[j] != null &&
                  nodeSegment.equals(priorNodeSegmentArray[j])) {
                break;
              }
            }
            if (j == priorNodeSegmentArray.length) {
              deleteNodeSegmentArray.push(nodeSegment);
            }
          }
        }
      }
    }


    //delete the extra multiple parameters
    if (deleteNodeSegmentArray != null) {
      for (var i=0; i < deleteNodeSegmentArray.length; i++) {
        var priorNodeSegment = deleteNodeSegmentArray[i];
        if (priorNodeSegment && !extUtils.isDependentNodeSegment(priorNodeSegment, true)) {

          if (extPart.DEBUG) alert("deleting the existing node: " + partName);

          //delete the existing node
          sbPart = sbObj.getNamedSBPart(partName, priorNodeSegment.node);
          var weight = sbPart.getWeight();

          var optionFlags = 0;
          if (sbPart.getVersion() < 5.0)
          {
            optionFlags = docEdits.QUEUE_DONT_MERGE;
          }

          extPart.queueDocEdit(partName, "", priorNodeSegment, weight, null, optionFlags);
        }
      }
    }

    var optionFlags = 0;
    if (extPart.getVersion(partName) < 5.0)
    {
      optionFlags = docEdits.QUEUE_DONT_MERGE;
    }

    //now insert the new edits
    for (var index=0; index < paramArray.length; index++) {

      paramObj = paramArray[index];

      if (extPart.DEBUG) alert("adding edits for participant: " + partName + " ["+ index + "]");

      var insertNode = extPart.getInsertNode(partName, paramObj);

      //handle the create link insert node
      if (typeof insertNode  == "string" &&
          insertNode.indexOf("createAtSelection") == 0)
      {
        if (location.indexOf("nodeAttribute") == 0)
        {
          //get the tag and attribute names

          var whereToSearch = extPart.getWhereToSearch(partName);
          var tagName = whereToSearch.substring(whereToSearch.indexOf("+") + 1);
          var attrName = location.substring(location.indexOf("+") + 1);

          //get the text to insert within the tag from the insert node info
          var tagText = "";
          if (insertNode.indexOf("+") != -1) {
            tagText = insertNode.substring(insertNode.indexOf("+") + 1);
          }

          //create the insertion string
          insertText = extPart.getInsertText(partName, paramObj);
          insertText = "<" + tagName + " " + attrName + "=\"" + insertText + "\">"+ tagText + "</" + tagName + ">";

          if (extPart.DEBUG) alert("adding new tag at selection for part: " + partName);

          //add to the docEdits
          docEdits.queue(insertText,false,"replaceSelection", null, optionFlags);

          break;
        }
        else
        {
          // We are creating the node which these are relative to,
          // so change the weight to selection relative.
          if (location.indexOf("beforeNode") == 0)
          {
            location = "beforeSelection";
          }
          else if (location.indexOf("afterNode") == 0)
          {
            location = "afterSelection";
          }
          else if (location.indexOf("replaceNode") == 0)
          {
            location = "replaceSelection";
          }
        }
      }


      //handle the wrapSelection location
      if (location.indexOf("wrapSelection") == 0)
      {
        var insertText = extPart.getInsertText(partName, paramObj);

        if (!sbObj) {

          if (paramObj.MM_selection != null) {
            tagText = paramObj.MM_selection;
          } 
          else 
          {
            tagText = dwscripts.fixUpSelection(dw.getDocumentDOM(), false, false);
          }

          var match = insertText.match(/<([^<>%\s]+)/g);

          if (match && (match.length > 0))
          {
            for (var i = 0; i < match.length; i ++)
            {
              match[i] = match[i].substring(1);
            }

            // check if insert text already has a close tag, and remove it if found

            var closeTagPos = insertText.search(RegExp("<\\/"+ match[match.length-1], "i"));

            if (closeTagPos != -1)
            {
              insertText = insertText.substring(0, closeTagPos);
            }

            // now create the full string
            // closing tags go on in reverse order

            insertText = insertText + tagText;

            for (var i = (match.length - 1); i >= 0; i--)
            {
              insertText += "</" + match[i] + ">";
            }
          }

          if (extPart.DEBUG) alert("wrapping tag around selection for part: " + partName);

          //add to the docEdits
          docEdits.queue(insertText, false, "replaceSelection", null, optionFlags);
        }
        else
        {
          var priorSBPart = sbObj.getNamedSBPart(partName);
          var priorNodeSegment = (priorSBPart) ? priorSBPart.getNodeSegment() : null;

          if (priorNodeSegment != null) {

            if (extPart.DEBUG) alert("wrapping tag around selection for part: " + partName);

            //add to the docEdits
            extPart.updateExistingNodeSegment(partName, priorNodeSegment, paramObj, "replaceSelection");

          }
        }

        break;
      }


      var priorNodeSegment = null;
      var existingNodeSegment = null;
      var updateNodeSegment = null;

      if (priorNodeSegmentArray != null)
      {
        //if we already identified the existing node, just set it
        existingNodeSegment = priorNodeSegmentArray[index];
      }
      else
      {
        //try and find the prior node
        //if re-edit, set the priorNode
        if (sbObj)
        {
          var priorSBPart = sbObj.getNamedSBPart(partName);
          priorNodeSegment = (priorSBPart) ? priorSBPart.getNodeSegment() : null;

          if (sbObj.getForcePriorUpdate() &&
              sbObj.getForcePriorUpdate().indexOf(partName) != -1)
          {
            updateNodeSegment = priorNodeSegment;
          }
        }

        //look for an existing match on the page,
        //if the insert location is aboveHTML, belowHTML, or the child of a node
        if ((!updateNodeSegment && !existingNodeSegment) &&
            (location.indexOf("aboveHTML") != -1 ||
             location.indexOf("belowHTML") != -1 ||
             location.indexOf("firstChildOfNode") != -1 ||
             location.indexOf("lastChildOfNode") != -1))
        {
          var partList = dw.getParticipants(partName);
          if (partList)
          {
            //get possible family name
            var familyName = extGroup.getFamily(groupName,paramObj);

            var ignoreFamily = false;
            if (paramObj.MM_ignoreFamily && paramObj.MM_ignoreFamily.indexOf(partName) != -1)
            {
              ignoreFamily = true;
            }

            //select the correct match and assign it to existingNode
            for (var j=0; j < partList.length; j++)
            {
              //get the node information
              extPart.extractNodeParam(partName, partList[j].parameters, partList[j].participantNode);
              if (extPart.getVersion(partName) >= 5.0)
              {
                var nodeSeg = new NodeSegment(partList[j].participantNode, partList[j].matchRangeMin, partList[j].matchRangeMax);
              }
              else
              {
                var nodeSeg = new NodeSegment(partList[j].participantNode);
              }
              
              // Check to make sure we have a valid node segment
              if (nodeSeg.node == null)
              {
                nodeSeg = null;
              }
              
              //if we have a match, set existingNode and break
              if (extPart.parametersMatch(partName, partList[j].parameters, paramObj))
              {
                existingNodeSegment = nodeSeg;
                break;
              }
              else if (!ignoreFamily && location.indexOf("HTML")!=-1 && extUtils.onlyFamilyReferences(nodeSeg, familyName))
              {
                //if aboveHTML or belowHTML, check for family references, and may re-use an orphaned node
                updateNodeSegment = nodeSeg;
                //don't break, continue looking, in case there is an exact match
              }
            }
          }

        }

        //if we found both an existingNode and a node to update, choose the exact match
        if (existingNodeSegment && updateNodeSegment) {
          updateNodeSegment = null;
        }

        //if we did not find and existing or update segment, check if we can update
        // the prior node.  This is possible if no other server behaviors depend
        // on the node.
        if (priorNodeSegment && !existingNodeSegment && !updateNodeSegment && !extUtils.isDependentNodeSegment(priorNodeSegment,!ignoreFamily)) {
          updateNodeSegment = priorNodeSegment;
        }

      }

      if (updateNodeSegment != null)
      {
        //change the existing node to match the new parameters
        //if prior object being updated, pass that weight. Otherwise, pass new location weight
        if (sbObj) {
          extPart.updateExistingNodeSegment(partName, updateNodeSegment, paramObj,
                                            sbObj.getNamedSBPart(partName, updateNodeSegment.node).getWeight()
                                           );
        } else {
          extPart.updateExistingNodeSegment(partName, updateNodeSegment, paramObj, location);
        }

        if (priorNodeSegment && !updateNodeSegment.equals(priorNodeSegment) &&
            !extUtils.isDependentNodeSegment(priorNodeSegment, true)) {

          if (extPart.DEBUG) alert("deleting the existing node: " + partName);

          //delete the existing node
          extPart.queueDocEdit(partName, "", priorNodeSegment,
                               sbObj.getNamedSBPart(partName, priorNodeSegment.node).getWeight(),
                               null, optionFlags);
        }
      }
      else if (existingNodeSegment != null)
      {
        //correct node was found, possibly delete prior
        if (extPart.DEBUG) alert("correct node found, no change needed: " + partName);

        //can we delete the existing one.
        if (   priorNodeSegment && !existingNodeSegment.equals(priorNodeSegment)
            && !extUtils.isDependentNodeSegment(priorNodeSegment,true)
           )
        {
          //delete the existing node
          extPart.queueDocEdit(partName, "", priorNodeSegment,
                                sbObj.getNamedSBPart(partName, priorNodeSegment.node).getWeight(),
                                null, optionFlags);
        }

        //add no-op node as positional placeholder so docEdits class knows how to order same-weight inserts
        docEdits.queue(null, existingNodeSegment, location);

      }
      else if (!sbObj || extPart.getSearchPatterns(partName).length)
      { //add node for first time
        if (extPart.DEBUG) alert("inserting new node: " + partName + " with weight " + location);

        var insertText = extPart.getInsertText(partName, paramObj);

        docEdits.queue(insertText, false, location, insertNode, optionFlags);
      }
      //else
      //{
      //  if (extPart.DEBUG) alert("skipping re-add of removed node: " + partName + " with weight " + location);
      //}
    }
  } else {
    if (extPart.DEBUG) alert("skipping apply of empty participant: " + partName);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.expandParameterObject
//
// DESCRIPTION:
//   This function is used to handle parameter objects which have a value
//   passed as an array.  These array values are expanded into multiple
//   parameter objects which can be handled individually, if the value
//   is used in the current participant. However, this is only done if
//   the participant is of type multiple.
//
// ARGUMENTS:
//   groupName - ext data group filename
//   partName - ext data participant filename
//   paramObj - parameter object
//
// RETURNS:
//   Returns an array of parameter objects
//--------------------------------------------------------------------
function extPart_expandParameterObject(groupName, partName, paramObj)
{
  var retList = new Array();

  //find the parameter with the shortest length array.
  // We will use this parameter to iterate.
  var loopVar = '';

  var nodeParamValue = paramObj[extPart.getNodeParamName(partName)];

  // Only search for array parameters if type multiple
  if (extPart.getPartType(groupName, partName) == "multiple" ||
      (nodeParamValue != null && typeof nodeParamValue == "object" &&
       nodeParamValue.length != null)
     )
  {
    for (var j in paramObj)
    {
      //is this an array parameter and is it used in the current participant
      if (   typeof paramObj[j] == "object" && paramObj[j].length != null
          && (extPart.getRawInsertText(partName).indexOf("@@"+j+"@@") != -1 ||
              extPart.getNodeParamName(partName) == j)
         )
      {
        if (!loopVar)
        {
          //we found the first parameter array
          loopVar = j;
        }
        else
        {
          //select the parameter array with the shortest length
          if (paramObj[j].length < paramObj[loopVar].length)
          {
            loopVar = j;
          }
        }
      }
    }
  }
  //if we found an array parameter, expand it into a list of parameter objects
  // otherwise just add the current parameter object
  if (loopVar)
  {
    if (extPart.DEBUG) alert("creating " + paramObj[loopVar].length + " copies of paramObj for " + partName);

    // create a new parameter object for each array value
    for (var k=0; k < paramObj[loopVar].length; k++)
    {
      var tempParams = new Object();
      for (var j in paramObj)
      {
        if (typeof paramObj[j] == "object" && paramObj[j].length != null)
        {
          tempParams[j] = paramObj[j][k]; // add array parameters
        }
        else
        {
          tempParams[j] = paramObj[j];    // add normal parameters
        }
      }

      //add the new parameter object
      retList.push(tempParams);
    }

  }
  else
  {
    //add a single parameter object
    retList.push(paramObj);
  }

  return retList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.getInsertString
//
// DESCRIPTION:
//   Get the text to be inserted for at a given location
//
// ARGUMENTS:
//   groupName - ext data group filename
//   partName - ext data participant filename
//   paramObj -
//   insertLocation -
//
// RETURNS:
//   array of strings to be inserted at the given location
//--------------------------------------------------------------------
function extPart_getInsertString(groupName, partName, paramObj, insertLocation)
{
  var retVal = "";

  if (!insertLocation || extPart.getLocation(partName).indexOf(insertLocation) == 0) {

    var paramArray = extPart.expandParameterObject(groupName, partName, paramObj);
    for (var i=0; i < paramArray.length; i++) {
      retVal += extUtils.replaceParamsInStr(extPart.getRawInsertText(partName), paramArray[i]);
      //DEBUG alert("extPart.getRawInsertText(partName) = " + extPart.getRawInsertText(partName) + "\nparamArray[i] = " + paramArray[i] + "\nretVal = " + retVal);
    }

  } else if (extPart.getLocation(partName).indexOf("wrapSelection") == 0) {

    if (insertLocation == "beforeSelection" || insertLocation == "afterSelection") {

      var paramArray = extPart.expandParameterObject(groupName, partName, paramObj);

      for (var i=0; i < paramArray.length; i++) {

        //get the insert text
        var insertText = extUtils.replaceParamsInStr(extPart.getRawInsertText(partName), paramArray[i]);

        //search for the tag name within the insertText

        var match = insertText.match(/<([^<>%\s]+)/g);

        if (match && (match.length > 0))
        {
          for (var i = 0; i < match.length; i ++)
          {
            match[i] = match[i].substring(1);
          }

          if (insertLocation == "beforeSelection")
          {
            // check if insert text already has a close tag, and remove it if found

            var closeTagPos = insertText.search(RegExp("<\\/"+ match[match.length-1], "i"));

            if (closeTagPos != -1)
            {
              insertText = insertText.substring(0, closeTagPos);
            }

            retVal += insertText;
          }
          else if (insertLocation == "afterSelection")
          {
            // Closing tags go on in reverse order

            for (var i = (match.length - 1); i >= 0; i--)
            {
              retVal += "</" + match[i] + ">";
            }
          }
        }
      }
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.findInString
//
// DESCRIPTION:
//   Construct parameter object with the extracted parameters for
//   participant in string.
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   If the patterns match, a parameter object.  Otherwise, null.
//--------------------------------------------------------------------
function extPart_findInString(partName, theStr, findMultiple)
{
  var retVal = null;
  var searchPatts = extPart.getSearchPatterns(partName);
  var quickSearch = extPart.getQuickSearch(partName);
  if (extUtils.findPatternsInString(theStr, quickSearch, searchPatts, findMultiple))
  {
    retVal = extUtils.extractParameters(searchPatts);
  }
  else if (extPart.DEBUG)
  {
    var MSG = new Array();
    MSG.push("match failed for participant: " + partName);
    MSG.push("");
    MSG.push("against string:");
    MSG.push(theStr);
    MSG.push("");
    MSG.push("using pattern:");
    if (quickSearch && theStr.indexOf(quickSearch) == -1) {
      MSG.push(quickSearch);
    }
    else
    {
      for (var j=0; j < searchPatts.length; j++) {
        if (!searchPatts[j].match || !searchPatts[j].match.length) {
          MSG.push(searchPatts[j].pattern);
        }
      }
    }
    alert(MSG.join("\n"));
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.getWeight
//
// DESCRIPTION:
//   Given a participant node, it returns the weight value to be stored
//   in the ServerBehavior
//
// ARGUMENTS:
//   partName - ext data participant filename
//   theNode - document node ptr
//
// RETURNS:
//   string - weight
//--------------------------------------------------------------------
function extPart_getWeight(partName, theNode)
{
  //get the weight information
  var retVal = extPart.getLocation(partName);

  //if the insert weight is nodeAttribute, add the position of the matched string
  if (retVal == "nodeAttribute")
  {
    //get the node string
    var nodeStr = extUtils.convertNodeToString(theNode);

    var foundPos = extUtils.findPatternsInString(nodeStr, extPart.getQuickSearch(partName),
                                           extPart.getSearchPatterns(partName));

    if (foundPos)
    {
      retVal += "+" + foundPos[0] + "," + foundPos[1];
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.getInsertNode
//
// DESCRIPTION:
//   Return the insert node object that was passed in by the user.
//
// ARGUMENTS:
//   partName - ext data participant filename
//   paramObj - parameter object
//
// RETURNS:
//   document node ptr
//--------------------------------------------------------------------
function extPart_getInsertNode(partName, paramObj)
{
  var retVal = '';
  var nodeParamName = extPart.getNodeParamName(partName);
  if (extPart.getIsNodeRel(partName)) {
    if (nodeParamName) {
      retVal = paramObj[nodeParamName]; //get node from paramObj.prop
    } else {
      alert(MM.MSG_NoNodeSpecForRelInsert);
    }
  }
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.getInsertText
//
// DESCRIPTION:
//   Return the insert text, with the parameters replaced
//
// ARGUMENTS:
//   partName - ext data participant filename
//   paramObj - parameter object
//
// RETURNS:
//   string - insert text
//--------------------------------------------------------------------
function extPart_getInsertText(partName, paramObj)
{
  var retVal = extPart.getRawInsertText(partName);
  retVal = extUtils.replaceParamsInStr(retVal, paramObj); //replace any parameters in text

  //remove new lines from attributes.
  if (extPart.getLocation(partName).indexOf("nodeAttribute") == 0)
  {
    retVal = retVal.replace(/[\f\n\r]\s*$/,"");
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.extractNodeParam
//
// DESCRIPTION:
//   Extracts the value of the node parameter, and adds it to the
//   list of parameters
//
// ARGUMENTS:
//   partName - ext data participant filename
//   parameters - parameter object. updated through pass by reference.
//   node - document node ptr
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function extPart_extractNodeParam(partName, parameters, node)
{
  if (extPart.getIsNodeRel(partName))
  {
    var nodeParam = extPart.getNodeParamName(partName);

    if (parameters[nodeParam] == null)
    {
      var location = extPart.getLocation(partName);
      if ((location.indexOf("firstChildOfNode") == 0 ||
           location.indexOf("lastChildOfNode") == 0) && nodeParam)
      {
        parameters[nodeParam] = node.parentNode;

        //The current parent may not be the right one. Check if nodeParamName is
        //name__tag, name__node, nameTag, or nameNode, and if there is a parent node using that
        //exact name. If so, it's probably a better parent node to use for matching.
        if (parameters[nodeParam] && (nodeParam.search(/tag/i) > 0 || nodeParam.search(/node/i) > 0)) {
          var          theTag = nodeParam.substring(0,nodeParam.search(/__tag/i)); //extract tag name from nodeParam
          if (!theTag) theTag = nodeParam.substring(0,nodeParam.search(/__node/i));
          if (!theTag) theTag = nodeParam.substring(0,nodeParam.search(/tag/i));
          if (!theTag) theTag = nodeParam.substring(0,nodeParam.search(/node/i));
          if (theTag) {
            theTag = theTag.toUpperCase();
            if (parameters[nodeParam].tagName && parameters[nodeParam].tagName.toUpperCase() != theTag) { //if current node doesn't match
              var curNode = parameters[nodeParam];
              //ripple upward looking for a parent tag with that exact name
              while (curNode.tagName.toUpperCase() != theTag && curNode.parentNode.nodeType == Node.ELEMENT_NODE) {
                curNode = curNode.parentNode;
              }
              //if exact match was found, switch to using that node
              if (curNode.tagName.toUpperCase() == theTag) {
                //DEBUG alert("parent tag "+(parameters[nodeParam].tagName.toUpperCase())+" changed to "+theTag);
                parameters[nodeParam] = curNode;
              }
            }
          }
        }

      }
      else if (location.indexOf("nodeAttribute") == 0)
      {
        parameters[nodeParam] = node;
      }
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.parametersMatch
//
// DESCRIPTION:
//   Returns true if the two part lists contain identical values for
//   the parameters of this server behavior
//
// ARGUMENTS:
//   partName - ext data participant filename
//   partListA -
//   partListB -
//
// RETURNS:
//   boolean -
//--------------------------------------------------------------------
function extPart_parametersMatch(partName, partListA, partListB)
{
  var retVal = true;

  // walk the list of search patterns to determine the parameter names
  var paramNames = new Array();
  var searchPatterns = extPart.getSearchPatterns(partName);
  for (var i=0; i < searchPatterns.length; i++)
  {
    if (searchPatterns[i].paramNames)
    {
      var newParams = searchPatterns[i].paramNames.split(",");
      paramNames = paramNames.concat(newParams);
    }
  }
  
  // also need to add the node param if it exists
  var nodeParamName = extPart.getNodeParamName(partName);
  if (nodeParamName)
  {
    paramNames.push(nodeParamName);
  }  

  // call extUtils.parametersMatch with the specific list of parameter names to check

	//HACK : to match site relative connection path to doc-relative connection path
	//the following parameters"cname,ext" are sufficient in the
	//match list since in a given site the user tend to use the same connection include file("cname.ext) in majority of cases
	if ((partName == "connectionref_statement") || (partName == "Connection_include"))
	{
	  var tempParamNames = paramNames;
		paramNames = new Array();
		for (var i =0 ; i < tempParamNames.length ; i++)
		{
			var bIgnoreConnectionParam =  ((tempParamNames[i] == "urlformat") || (tempParamNames[i] == "UrlFormat") || (tempParamNames[i] == "relpath") || (tempParamNames[i] == "ConnectionPath"));
			if (!bIgnoreConnectionParam)
			{
				paramNames.push(tempParamNames[i]);
			}
		}
	}
  retVal = extUtils.parametersMatch(partListA, partListB, paramNames);

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.updateExistingNodeSegment
//
// DESCRIPTION:
//   Update or replace an existing node segment
//
// ARGUMENTS:
//   partName - ext data participant filename
//   existingNodeSegment
//   paramObj
//   foundWeight
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function extPart_updateExistingNodeSegment(partName, existingNodeSegment, paramObj, foundWeight)
{
  if (existingNodeSegment) {

    var optionFlags = 0;
    if (extPart.getVersion(partName) < 5.0)
    {
      optionFlags = docEdits.QUEUE_DONT_MERGE;
    }

    var existingNode = existingNodeSegment.node;
    var updateText;
    var updatePatterns = extPart.getUpdatePatterns(partName);
    if (updatePatterns.length > 0) {  //update the existing node

      if (extPart.DEBUG) alert("updating existing node: " + partName);

      if (extPart.hasLimitedUpdates(partName) && !existingNode.orig && existingNode.outerHTML) {
        //do a limited update using limitSearch attribute (only called if limitSearch == "innerOnly")
        updateText = extUtils.replaceValuesInNodeSegment(existingNodeSegment, updatePatterns, paramObj);
      } else {
        //use the insertParams to update the text
        var nodeString = extUtils.convertNodeToString(existingNode);
        var localBeginOffset = existingNodeSegment.matchRangeMin;
        var localEndOffset = existingNodeSegment.matchRangeMax;
        if (localBeginOffset >=0 && localBeginOffset < localEndOffset && localEndOffset < nodeString.length) {
          var tinyString = nodeString.substring(localBeginOffset, localEndOffset);
          tinyString = extUtils.replaceValuesInString(tinyString, updatePatterns, paramObj);
          updateText = nodeString.substring(0, localBeginOffset) + tinyString + nodeString.substring(localEndOffset);
        } else {
          updateText = extUtils.replaceValuesInString(nodeString, updatePatterns, paramObj);
        }
      }

      //add edit to docEdits
      extPart.queueDocEdit(partName, updateText, existingNodeSegment, foundWeight, null, optionFlags);
    } else { //replace the existing node

      if (extPart.DEBUG) alert("replacing existing node: " + partName);

      //get text to insert and replace all parameters
      var insertText = extPart.getInsertText(partName, paramObj);

      //add edit to docEdits
      docEdits.queue(insertText, existingNodeSegment, foundWeight, null, optionFlags);
    }

  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   extPart.queueDocEditsForDelete
//
// DESCRIPTION:
//   This function adds to the docEdits queue, the document edits
//   need to delete the given participant.
//
// ARGUMENTS:
//   partObj - SBParticipant object - the participant that should
//     be scheduled for deletion
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function extPart_queueDocEditsForDelete(partObj)
{
  var partName = partObj.getName();
  var nodeSeg = partObj.getNodeSegment();
  var version = partObj.getVersion();

  var optionFlags = 0;
  if (version < 5.0)
  {
    optionFlags = docEdits.QUEUE_DONT_MERGE;
  }

  if (extPart.DEBUG) alert("deleting " + partName + ":\n" + nodeSeg.toString());

  // TODO: This is a HACK.  It is here to fix up the node offset
  // ranges for certain found nodes.  For some reason,
  // these ranges can be off by a few characters.
  if (nodeSeg.matchRangeMin == null || nodeSeg.matchRangeMin == 0)
  {
    var outerLength = dwscripts.getOuterHTML(nodeSeg.node).length;
    var matchRange = nodeSeg.matchRangeMax - nodeSeg.matchRangeMin;
    if (Math.abs(outerLength - matchRange) <= 3)
    {
      nodeSeg.matchRangeMax = outerLength;
    }
  }

  // Check if other SBs depend on this node
  if (!extUtils.isDependentNodeSegment(nodeSeg, false))
  {
    var deleteType = extPart.getDeleteType(partName);
    var weight = extPart.getWeight(partName);

    if (deleteType == "none")
    {
      // do nothing
      if (extPart.DEBUG) alert("delete type set to none. nothing will be removed");
    }
    else if (deleteType == "tagOnly" ||
             (!deleteType && weight == "wrapSelection"))
    {
      if (extUtils.isBlockTag(nodeSeg.node))
      {
        // preserve the innerHTML

        // The old call to dwscipts.getInnerHTML() didn't work for
        // parts that inserted nested tags like
        // <ASP:Repeater><ItemTemplate> because it only looks
        // for the first begin/end tag pair. Now, we call
        // extPart.getInnerHTML(), which knows exactly how
        // many tags were inserted.

        var newInnerHTML = extPart.getInnerHTML(partName, nodeSeg.node);

        // change the whole node
        nodeSeg = new NodeSegment(nodeSeg.node);

        if (extPart.DEBUG) alert("replacing:\n" + nodeSeg.toString() + "\n\nwith:\n" + newInnerHTML);

        docEdits.queue(newInnerHTML, nodeSeg, null, null, optionFlags);
      }
      else
      {
        // do nothing, tagOnly delete type specified for non-block tag
      }
    }
    else if (deleteType == "innerOnly")
    {
      if (weight.indexOf("nodeAttribute") != -1)
      {
        // just remove the value, leave the attribute
        var delInfo = weight.substring(weight.indexOf("+")+1);
        var delRange = extUtils.findAttributePosition(nodeSeg.node,delInfo,false, true);

        // set the node relative segment range
        nodeSeg.matchRangeMin = delRange[0];
        nodeSeg.matchRangeMax = delRange[1];

        if (extPart.DEBUG) alert("deleting:\n" + nodeSeg.toString());

        extPart.queueDocEdit(partName, "", nodeSeg, null, null, optionFlags);
      }
      else
      {
        // remove the innerHTML of this node

        //has a child, so use that to add back all before the child,
        // and after the innerHTML
        var node = nodeSeg.node;
        if (node.hasChildNodes() && node.childNodes.length)
        {
          var outerHTML = dwscripts.getOuterHTML(node);
          var offsets = extPart_getInnerHTMLOffsets(partName, node);
          var newOuterHTML = outerHTML.substring(0, offsets.begin - 1) +
                             outerHTML.substring(offsets.end + 1);

          if (extPart.DEBUG) alert("replacing:\n" + nodeSeg.toString() + "\n\nwith:\n" + newOuterHTML);

          extPart.queueDocEdit(partName, newOuterHTML, nodeSeg, null, null, optionFlags);
        }
        else
        {
          //nothing in it, so don't delete anything
        }
      }
    }
    else if (deleteType.indexOf("attribute+") == 0)
    {
      var delInfo = deleteType.substring(deleteType.indexOf("+")+1);
      // check if a parameter was passed
      if (delInfo.indexOf("@@") == 0)
      {
        var paramName = delInfo.replace(/@/g, "");
        var parameters = partObj.getParameters();
        delInfo = parameters[paramName];
      }
      var delRange = extUtils.findAttributePosition(nodeSeg.node,delInfo,true, true);

      // set the node relative segment range
      nodeSeg.matchRangeMin = delRange[0];
      nodeSeg.matchRangeMax = delRange[1];

      if (extPart.DEBUG) alert("deleting:\n" + nodeSeg.toString());

      extPart.queueDocEdit(partName, "", nodeSeg, null, null, optionFlags);
    }
    else
    {
      if (weight.indexOf("nodeAttribute+") != -1)
      {
        var delInfo = weight.substring(weight.indexOf("+")+1);

        var delRange = extUtils.findAttributePosition(nodeSeg.node,delInfo,true, true);

        // set the node relative segment range
        nodeSeg.matchRangeMin = delRange[0];
        nodeSeg.matchRangeMax = delRange[1];
      }

      if (extPart.DEBUG) alert("deleting:\n" + nodeSeg.toString());

      extPart.queueDocEdit(partName, "", nodeSeg, null, null, optionFlags);
    }
  }
}





//--------------------------------------------------------------------
// CLASS:
//   SearchPattInfo
//
// DESCRIPTION:
//   Helper class to describe a search pattern ext data item
//
// PUBLIC PROPERTIES:
//   paramNames -
//   isOptional -
//   limitSearch -
//   pattern -
//   match -
//
// PUBLIC FUNCTIONS:
//   <function name> - <description>
//--------------------------------------------------------------------

function SearchPattInfo(paramNames, isOptional, limitSearch, pattern, match)
{
  this.paramNames = paramNames;
  this.isOptional = isOptional;
  this.limitSearch = limitSearch;
  this.pattern = pattern;
  this.match = match;
}



//--------------------------------------------------------------------
// CLASS:
//   UpdatePattInfo
//
// DESCRIPTION:
//   Helper class to describe an update pattern ext data item
//
// PUBLIC PROPERTIES:
//   paramName -
//   limitSearch -
//   pattern -
//
// PUBLIC FUNCTIONS:
//   <function name> - <description>
//--------------------------------------------------------------------

function UpdatePattInfo(paramName, limitSearch, pattern)
{
  this.paramName = paramName;
  this.limitSearch = limitSearch;
  this.pattern = pattern;
}






//--------------------------------------------------------------------
// CLASS:
//   NodeSegment
//
// DESCRIPTION:
//   This class stores information representing the position of a
//   participant on a page. It consists of a document node, and a
//   pair of *NODE-RELATIVE* offsets specifying a range within
//   the node.
//
// PUBLIC PROPERTIES:
//   node, matchRangeMin, matchRangeMax
//
// PUBLIC FUNCTIONS:
//   equals(nodeSegment)
//
//--------------------------------------------------------------------

function NodeSegment(node, matchRangeMin, matchRangeMax)
{
  // public properties
  this.node = node;
  
  if (!dw.nodeExists(this.node))
  {
    this.node = null;
  }

  var totalLength = 0;
  if (this.node)
  {
    totalLength = dwscripts.getOuterHTML(this.node).length;
  }

  this.matchRangeMin = (matchRangeMin != null) ? matchRangeMin : 0;
  this.matchRangeMax = (matchRangeMax != null) ? matchRangeMax : totalLength;

  if (this.node)
  {
    // TODO: we should determine why this might be out of range
    if (this.matchRangeMax > totalLength)
    {
      this.matchRangeMax = totalLength;
    }

    // if max is less than or equal to min, assume it is the entire node
    if (this.matchRangeMax <= this.matchRangeMin)
    {
      this.matchRangeMin = 0;
      this.matchRangeMax = totalLength;
    }
  }
}

// public methods
NodeSegment.prototype.equals = NodeSegment_equals;
NodeSegment.prototype.toString = NodeSegment_toString;


//--------------------------------------------------------------------
// FUNCTION:
//   NodeSegment.equals
//
// DESCRIPTION:
//   Compare 2 NodeSegments
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function NodeSegment_equals(oth)
{
  var ret = ( this.node == oth.node
            && this.matchRangeMin == oth.matchRangeMin
            && this.matchRangeMax == oth.matchRangeMax );

  return ret;
}


//--------------------------------------------------------------------
// FUNCTION:
//   NodeSegment.toString
//
// DESCRIPTION:
//   This function returns the string representation of this node segment
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function NodeSegment_toString()
{
  var retVal = "";

  retVal = dwscripts.getOuterHTML(this.node);

  retVal = retVal.substring(this.matchRangeMin, this.matchRangeMax);

  return retVal;
}





//--------------------------------------------------------------------
// CLASS:
//   docEdits
//
// DESCRIPTION:
//   docEdits is a static class used specifically by applyServerBehaviors()
//   to build up a list of stuff to be inserted on the page, then to insert
//   them all at once. If you were to insert participants directly, then
//   after the first one was inserted all the participant pointers to all
//   other SBs on the page would be stale. This class solves that problem
//   (and many others!) by managing weighted inserts.
//
// PUBLIC PROPERTIES:
//   None
//
// PUBLIC FUNCTIONS:
//   apply() - executes all edits. Has no parameters, and should be
//             called when done adding.
//   queue() - adds an edit instruction, enabling support for code
//             block merging, if appropriate.
//   clearAll() - clears all edits.
//
//--------------------------------------------------------------------


//--------------------------------------------------------------------
// FUNCTION:
//   docEdits
//
// DESCRIPTION:
//   The class constructor
//
// ARGUMENTS:
//   node
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function docEdits()
{
  // docEdits is a static class and has no state.
  throw dwscripts.sprintf(MM.MSG_createStaticClass, "docEdits");
}

// public properties
docEdits.QUEUE_DONT_MERGE             = (1 << 0);
docEdits.QUEUE_DONT_PREPROCESS_TEXT   = (1 << 1);
docEdits.QUEUE_DONT_FORMAT_FOR_MERGE  = (1 << 2);

// public methods
docEdits.apply = docEdits_apply;
docEdits.queue = docEdits_queue;
docEdits.clearAll = docEdits_clearAll;

//private methods
docEdits.canMergeBlock = docEdits_canMergeBlock;
docEdits.analyzeMerge = docEdits_analyzeMerge;
docEdits.canMergeNode = docEdits_canMergeNode;
docEdits.mergeCodeBlocks = docEdits_mergeCodeBlocks;
docEdits.deleteCodeBlock = docEdits_deleteCodeBlock;
docEdits.sortWeights = docEdits_sortWeights;
docEdits.sortInserts = docEdits_sortInserts;

// private properties
docEdits.editList = new Array();
docEdits.allSrc = null;
docEdits.strNewlinePref = null;


//--------------------------------------------------------------------
// FUNCTION:
//   docEdits.queue
//
// DESCRIPTION:
//   Schedule an edit to the document.
//
// ARGUMENTS:
//   text - string - new text to be inserted.
//
//   priorNodeSegment - Object - (optional) the node segment within
//     which to replace an existing chunk of text.
//     It contains the following properties:
//       node - DOM node - the document node being referenced
//       matchRangeMin - integer - the starting node-relative offset
//         of the text to replace
//       matchRangeMax - integer -  the ending node-relative offset
//         of the text to replace
//
//   weight - string - the location where the text should be inserted:
//       aboveHTML+nn: insert the text above the <HTML> tag.
//         nn is an integer between 1 and 99. If the +nn is not specified,
//         99 is used.
//       belowHTML+nn: insert the text below the </HTML> tag.
//         nn is an integer between 1 and 99.
//       beforeSelection: insert the text before the current selection
//       afterSelection: insert the text after the current selection
//       replaceSelection: replace the current selection with text
//       beforeNode: insert the text before the given node
//       afterNode: insert the text after the given node
//       replaceNode: replace the given node with text
//       nodeAttribute+attribname: sets attribute attribName of
//         the given node
//       nodeAttribute: inserts text in start tag after the tagname
//
//     NOTE: if priorNodeSegment was given, weight is ignored.
//
//   relativeNode - DOM node - (optional) Only passed if using a
//     node-relative weight
//
//   optionFlags - Or'd list of docEdits.QUEUE_* flags
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function docEdits_queue(text, priorNodeSegment, weight, relativeNode, optionFlags)
{
  try
  {
    var obj = new DocEdit(text, priorNodeSegment, weight, relativeNode, optionFlags);
    docEdits.editList.push(obj);
  }
  catch(e)
  {
    // We encountered an exception while queueing the edit. This error will
    //   halt the current script and force the user to start over. Clear out 
    //   the class members so we don't apply old edits on the next go 'round.
    docEdits.clearAll();
    
    // Rethrow the exception so the user knows what happened.
    throw e;
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   docEdits.apply
//
// DESCRIPTION:
//   Commit the list of edits in the document.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function docEdits_apply()
{
  var maintainSelection = arguments[0] || false;  //optional: if true we will attempt maintain the current selection
  var dontReformatHTML = arguments[1] || false;   //optional: if true we will prevent the code reformatter from running
  var tagSelection = null;

  var dom = dw.getDocumentDOM();

  docEdits.allSrc = dom.documentElement.outerHTML;
  docEdits.strNewlinePref = dwscripts.getNewline();
  
  try
  {
    if (maintainSelection)
    {
      tagSelection = extUtils.getTagSelection();
    }

    // Make sure weights are in order
    docEdits.sortWeights();

    // Process the queued edits
    for (var i=0; i < docEdits.editList.length; i++) //with each object with something to insert
    {
      var editObj = docEdits.editList[i];

      // set the properties of the DocEdit object needed for apply
      editObj.processForApply(i);

    }  // end loop


    // We are now ready to create the new outerHTML string

    if (docEdits.editList.length > 0)
    {
      // Make sure our edits are in order
      docEdits.sortInserts();

      dw.useTranslatedSource(false);

      newSrc = new Array();

      var info = new Object();
      info.lastInsert = 0;
      info.bPendingMerge = false;
      info.bDoMergeNow = false;

      for (var i=0; i < docEdits.editList.length; i++)
      {
        // DEBUG alert("docEdits.editList[" + i + "] = " + docEdits.editList[i].toString());

        if (docEdits.editList[i].insertPos != null)
        {
          // DEBUG alert("insert at "+info.lastInsert+","+docEdits.editList[i].insertPos+":"+docEdits.allSrc.substring(info.lastInsert, docEdits.editList[i].insertPos)+": plus :"+ docEdits.editList[i].text+":");

          if (docEdits.editList[i].insertPos > info.lastInsert)
          {
            // add the text between the end of the last edit, and our new edit
            var betweenEditsStr = docEdits.allSrc.substring(info.lastInsert, docEdits.editList[i].insertPos);
            
            // if we deleted all the content of a table cell, add &nbsp; back in.
            var oldMultiline = RegExp.multiline;
            RegExp.multiline = false;
            if ((newSrc.length > 0) && (betweenEditsStr.search(/^\s*<\/td>/i) != -1))
            {
              var prevSource = "";
              for (var j = newSrc.length - 1; j >= 0 && prevSource == ""; --j)
              {
                if (newSrc[j].search(/^\s*$/) == -1)
                {
                  prevSource = newSrc[j];
                }
              }

              if (prevSource.search(/<td>\s*$/i) != -1)
              {
                newSrc.push("&nbsp;");
              }
            }
            RegExp.multiline = oldMultiline;

            newSrc.push(betweenEditsStr);

            if (info.bPendingMerge)
            {
              // merge the last two source blocks added to newSrc
              docEdits.mergeCodeBlocks(newSrc, docEdits.editList[info.iPendingMerge].mergeDelims[0], docEdits.editList[info.iPendingMerge].mergeDelims[1]);
              info.bPendingMerge = false;
            }
          }

          if (!docEdits.editList[i].text && docEdits.editList[i].mergeDelims)
          {
            info.bDoMergeNow = false;

            docEdits.deleteCodeBlock(newSrc, docEdits.editList[i]);
          }
          else
          {
            // set the bPendingMerge and bDoMergeNow flags
            docEdits.analyzeMerge(info, i);
          }


          if (docEdits.editList[i].text.length > 0)
          {
            // if we are adding the first text to newSrc, then remove
            // any newlines from the start of the text.
            if (newSrc.length == 0)
            {
              var oldMultiline = RegExp.multiline;
              RegExp.multiline = false;
              newSrc.push(docEdits.editList[i].text.replace(/^[\r\n]+/, ""));
              RegExp.multiline = oldMultiline;
            }
            else
            {
              newSrc.push(docEdits.editList[i].text);
            }
          }

          if (info.bDoMergeNow)
          {
            docEdits.mergeCodeBlocks(newSrc, docEdits.editList[i].mergeDelims[0], docEdits.editList[i].mergeDelims[1]);
          }

          if (docEdits.editList[i].replacePos)
          {
            info.lastInsert = docEdits.editList[i].replacePos;
          }
          else
          {
            info.lastInsert = docEdits.editList[i].insertPos;
          }
        }

      } // end loop

      if (info.lastInsert < docEdits.allSrc.length)
      {
        // add the rest of the original source
        var restOrigSource = docEdits.allSrc.substring(info.lastInsert);

        // if we deleted all the content of a table cell, add &nbsp; back in.
        var oldMultiline = RegExp.multiline;
        RegExp.multiline = false;
        if ((newSrc.length > 0) && (restOrigSource.search(/^\s*<\/td>/i) != -1))
        {
          var prevSource = "";
          for (var j = newSrc.length - 1; j >= 0 && prevSource == ""; --j)
          {
            if (newSrc[j].search(/^\s*$/) == -1)
            {
              prevSource = newSrc[j];
            }
          }
          
          if (prevSource.search(/<td>\s*$/i) != -1)
          {
            newSrc.push("&nbsp;");
          }
        }
        RegExp.multiline = oldMultiline;

        newSrc.push(restOrigSource);

            
        if (info.bPendingMerge)
        {
          // merge the last two source blocks added to newSrc
          docEdits.mergeCodeBlocks(newSrc, docEdits.editList[info.iPendingMerge].mergeDelims[0], docEdits.editList[info.iPendingMerge].mergeDelims[1]);
        }
      }
      
      // DEBUG
      // alert("The new document source is:\n\n" + newSrc.join(""));
      
      //dom.documentElement.outerHTML = newSrc.join("");
      if (dontReformatHTML)
        dom.setOuterHTML(newSrc.join(""), false);
      else
		dom.setOuterHTML(newSrc.join(""), true);
 
      // alert("After source formatting:\n\n" + dom.documentElement.outerHTML );

      if (tagSelection)
      {
        extUtils.setTagSelection(tagSelection);
      }
    }
  }
  finally
  {
    // The commit of edits is complete or we encountered an exception. In either case,
    //   clear out the class members to prepare for the next set of edits.
    docEdits.clearAll();
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   docEdits.clearAll
//
// DESCRIPTION:
//   Empties the list of doc edits. When queueing up doc edits, use this
//   function to clear the doc edit list when an error occurs or to reset
//   the edit list when starting on a new set of edits. Note: the doc
//   edit list is automatically cleared on apply.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function docEdits_clearAll()
{
  docEdits.editList.length = 0;
  docEdits.allSrc = null;
}


//--------------------------------------------------------------------
// FUNCTION:
//   docEdits.canMergeBlock
//
// DESCRIPTION:
//   Check whether this participant can possibly participate in block merging.
//   If it can, returns the delims which can be merged, in a 2-element Array.
//
// ARGUMENTS:
//   insertText - string - the text to be inserted
//
// RETURNS:
//   array of strings - returns a 2 element array of the delimiters which
//     can be merged.  Returns null if the text cannot be merged.
//--------------------------------------------------------------------

function docEdits_canMergeBlock(insertText)
{
  var retVal = null;

  var dom = dw.getDocumentDOM();
  var delimInfo = dom.serverModel.getDelimiters();
  var myDelim;

  // Create the mergePattern and noMergePatterns

  var mergePattern = "^\\s*(?:";
  var noMergePattern = "^\\s*(";
  var len1 = mergePattern.length;
  var len2 = noMergePattern.length;

  if (delimInfo && delimInfo.length && insertText && insertText.length)
  {
    for (var i=0; i < delimInfo.length; i++)
    {
      myDelim = delimInfo[i];
      if (myDelim.participateInMerge)
      {
        if (mergePattern.length > len1)
        {
          mergePattern += "|";
        }
        mergePattern += "(?:(" + myDelim.startPattern + ")[\\S\\s]*(" + myDelim.endPattern + "))";
      }
      else
      {
        if (noMergePattern.length > len2)
        {
          noMergePattern += "|";
        }
        noMergePattern += "(" + myDelim.startPattern + "[\\S\\s]*" + myDelim.endPattern + ")";
      }
    }

    // Check the insertText to determine if it can participate in a merge

    var mergeRe = null;
    var noMergeRe = null;
	
	if( mergePattern.length > len1 ){
		try{	
			mergePattern += ")\\s*$";
			mergeRe= new RegExp (mergePattern, "i");
		} 
		catch(e){
			alert( e.description );
			mergeRe = null;
		}
	}
	if( noMergePattern.length > len2 ){
		try{	
			noMergePattern += ")\\s*$";
			noMergeRe= new RegExp (noMergePattern, "i");
		} 
		catch(e){
			alert( e.description );
			noMergeRe = null;
		}
	}

    if (mergeRe != null && (noMergeRe == null || !noMergeRe.test(insertText))) //exclude non-mergeable blocks
    {
      var match = insertText.match(mergeRe);  //try to extract delims
      if (match)
      {			
        for (var i=0; i < delimInfo.length; i++)
        {
          //check the sub-expression pairs stating at item 1
          if (match[2*i+1] && match[2*i+2] && match[2*i+1].length > 0 && match[2*i+2].length > 0)
          {
            var retVal = new Array();
            retVal.push(match[2*i+1]);
            retVal.push(match[2*i+2]);
            break;
          }
        }
      }
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   docEdits.analyzeMerge
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function docEdits_analyzeMerge(info, i)
{
  var dom = dw.getDocumentDOM();

  //merge analysis
  info.bDoMergeNow = false;

  if (docEdits.editList[i].mergeDelims && !docEdits.editList[i].preventMerge)
  {
    //anybody else added before me at this location?
    var bNewGuyBeforeMe = false;
    if (i > 0 && docEdits.editList[i-1].insertPos == docEdits.editList[i].insertPos)
    {
      bNewGuyBeforeMe = true;
      var before = docEdits.editList[i-1];
      if (   before.mergeDelims
          && before.mergeDelims[0].toLowerCase() == docEdits.editList[i].mergeDelims[0].toLowerCase()
          && before.mergeDelims[1].toLowerCase() == docEdits.editList[i].mergeDelims[1].toLowerCase()
         )
      {
        //i can merge with the newly added guy before me
        if (!docEdits.editList[i].bDontMergeTop)
        {
          info.bDoMergeNow = true;
        }
      }
    }
    else
    {
      //nobody is going to add right before me
      //check the preexisting node before me, if any
      if ((docEdits.editList[i].insertPos > 0) && !docEdits.editList[i].bDontMergeTop)
      {
        var beforeNodeOffset = docEdits.editList[i].insertPos;

        var match = docEdits.allSrc.substring(0, beforeNodeOffset).match(/[\s|(?:&nbsp;)]*$/);
        if (match)
        {
          beforeNodeOffset -= (match[0].length + 1);
        }

        if (beforeNodeOffset >= 0)
        {
          var beforeNode = dom.offsetsToNode(beforeNodeOffset, beforeNodeOffset);
          if (beforeNode.tagName=="MM:ENDLOCK") //i want the beginlock tag
          {
            var siblingNodes = beforeNode.parentNode.childNodes;
            for (var k = 0; k < siblingNodes.length; k++)
            {
              if (siblingNodes[k] == beforeNode)
              {
                beforeNode = siblingNodes[k-2];
                break;
              }
            }
          }
          // check if the beforeNode is claimed by an SB which can't merge
          if (beforeNode && docEdits.canMergeNode(beforeNode) &&
              (dwscripts.getNodeOffsets(beforeNode)[1] <= docEdits.editList[i].insertPos))
          {
            var beforeMergeDelims = docEdits.canMergeBlock(extUtils.convertNodeToString(beforeNode));
            if (beforeMergeDelims
                && beforeMergeDelims[0].toLowerCase() == docEdits.editList[i].mergeDelims[0].toLowerCase()
                && beforeMergeDelims[1].toLowerCase() == docEdits.editList[i].mergeDelims[1].toLowerCase())
            {
              info.bDoMergeNow = true;
            }
          }
        }
      }
    }

    //should I merge my closing delimiter?
    if (!docEdits.editList[i].bDontMergeBottom)
    {
      if (!bNewGuyBeforeMe || (bNewGuyBeforeMe && !info.bDoMergeNow))
      {
        //no new guy inserting before me, or new guy whom I cannot merge with
        //check pre-existing node after me
        info.bPendingMerge = false;
        var afterNodeOffset = (docEdits.editList[i].replacePos) ? docEdits.editList[i].replacePos : docEdits.editList[i].insertPos;
        var match = docEdits.allSrc.substring(afterNodeOffset).match(/^[\s|(?:&nbsp;)]*/);
        if (match)
        {
          afterNodeOffset += (match[0].length+1);
        }
        if (afterNodeOffset < docEdits.allSrc.length)
        {
          var afterNode = dom.offsetsToNode(afterNodeOffset, afterNodeOffset);
          if (afterNode.tagName=="MM:ENDLOCK") //i want the beginlock tag
          {
            var siblingNodes = afterNode.parentNode.childNodes;
            for (var k = 0; k < siblingNodes.length; k++)
            {
              if (siblingNodes[k] == afterNode)
              {
                afterNode = siblingNodes[k-2];
                break;
              }
            }
          }
          // check if the afterNode is claimed by an SB which can't merge
          if (afterNode && docEdits.canMergeNode(afterNode) &&
              (dwscripts.getNodeOffsets(afterNode)[0] >= docEdits.editList[i].insertPos))
          {
            var afterMergeDelims = docEdits.canMergeBlock(extUtils.convertNodeToString(afterNode));
            if (afterMergeDelims
                && afterMergeDelims[0].toLowerCase() == docEdits.editList[i].mergeDelims[0].toLowerCase()
                && afterMergeDelims[1].toLowerCase() == docEdits.editList[i].mergeDelims[1].toLowerCase())
            {
              info.bPendingMerge = true;
              info.iPendingMerge = i;
            }
          }
        }
      } // else (new guy I can merge with), so use his info.bPendingMerge flag
    }
  }

  // Check if two adjacent nodes were both prepared for a Split.
  if (i < docEdits.editList.length-1 &&
      docEdits.editList[i+1].insertPos == docEdits.editList[i].insertPos)
  {
    var before = docEdits.editList[i];
    var after = docEdits.editList[i+1];
    // check if we were both prepared for splitting a merged block
    if (after.splitDelims && before.splitDelims &&
        after.splitDelims[0].toLowerCase() == before.splitDelims[0].toLowerCase() &&
        after.splitDelims[1].toLowerCase() == before.splitDelims[1].toLowerCase())
    {
      before.text = before.text.substring(0, before.text.length - (before.splitDelims[1].length + (docEdits.strNewlinePref.length*2)));
      after.text = after.text.substring(after.splitDelims[0].length + (docEdits.strNewlinePref.length*2));
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   docEdits.canMergeNode
//
// DESCRIPTION:
//   Checks to see if the given node is claimed by any server behaviors.
//   If it is, then it checks the version of that SB to determine
//   if other blocks can merge with this one.  We do not want to merge
//   with UD1 or UD4 SB nodes.
//
// ARGUMENTS:
//   matchNode - DOM node - the node to check
//
// RETURNS:
//   boolean - true if it is OK to merge with the node
//--------------------------------------------------------------------

// Find if a SB claims this node, and if it does, what version it is
function docEdits_canMergeNode(matchNode)
{
  var retVal = true;

  var allSBs = dw.serverBehaviorInspector.getServerBehaviors();

  for (var i=0; i < allSBs.length; i++)
  {
    for (var j=0; j < allSBs[i].participants.length; j++)
    {
      var currNode = allSBs[i].participants[j];
      if (currNode == matchNode)
      {
        if (allSBs[i].getVersion && allSBs[i].getIndexedSBPart)
        {
          var sbPart = allSBs[i].getIndexedSBPart(j);
          if (sbPart && sbPart.getVersion() < 5.0)
          {
            retVal = false;
            // keep looking in case another SB claims the node
          }
        }
        else
        {
          retVal = false;
          // keep looking in case another SB claims the node
        }
      }
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   docEdits.mergeCodeBlocks
//
// DESCRIPTION:
//   Looks at the last 2 elements of the new srcArray that's being built.
//   Let's call them block1 and block2.
//   Preconditions:  block1 and block2 are both enclosed by openDelim
//     and closeDelim block1 and block2 may be safely merged into one block
//   Merges block1 and block2, and stuffs any whitespace between block1's
//   closeDelim and block2's openDelim at the end of the combined block.
//   Pushes the combined block back into the srcArray, in place of the
//   2 original blocks.
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function docEdits_mergeCodeBlocks(srcArray, openDelim, closeDelim)
{
  var pattern, myRe, match, whiteSpace, innerWhiteSpace, retval = "";
  var eolCount = 0, i;
  var block2 = srcArray.pop();
  var block1 = srcArray.pop();
  var before = "";
  var block1New = "";

  pattern = "(\\s*)" + dwscripts.escRegExpChars(closeDelim) + "([\\s|(?:&nbsp;)]*)$";
  myRe = new RegExp(pattern, "i");
  match = block1.match(myRe);
  if (match)
  {
    innerWhiteSpace = match[1];
    whiteSpace = match[2];
    i = block1.lastIndexOf(openDelim);
    before = block1.substring(0, i);
    block1New = block1.substring(i, match.index);

    pattern = "^([\\s|(?:&nbsp;)]*)" + dwscripts.escRegExpChars(openDelim) + "(\\s*)";
    myRe = new RegExp(pattern, "i");
    match = block2.match(myRe);
    if (match)
    {
      whiteSpace += match[1];
      innerWhiteSpace += match[2];

      //ensure separation of at least 2 newlines between code blocks
      for (i = 0; i < innerWhiteSpace.length; i++)
      {
        var tempChar = innerWhiteSpace.charAt(i);
        if (tempChar == "\n" || tempChar == "\r")
        {
          eolCount++;
          // If using windows style newline, "\r\n", need to step past '\n'.
          if (   tempChar == "\r" && (i + 1 < innerWhiteSpace.length)
              && innerWhiteSpace.charAt(i + 1) == "\n"
             )
          {
            ++eolCount;
          }
        }
      }

      for (i = eolCount; i < 2; i++)
      {
        innerWhiteSpace += dwscripts.getNewline();
      }

      retval = before + whiteSpace + block1New + innerWhiteSpace + block2.substring(match[0].length);
      srcArray.push(retval);
    }
  }

  // If we couldn't merge, push the two blocks back onto the array
  if (!retval)
  {
    srcArray.push(block1);
    srcArray.push(block2);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   docEdits.deleteCodeBlock
//
// DESCRIPTION:
//   Looks at the last element of the new srcArray that's being built,
//   and the current document edit node.
//   Preconditions:  document edit node is enclosed by an openDelim
//     and closeDelim, such that it can be merged.
//   Deletes the document edit node, fixes up the whitespace,
//   and determines if the open and close delims can safely be removed.
//   When this function returns, the new doc edit will have been added
//   to the srcArray, and the docEditNode's replacePos will have been
//   updated to indicate the new ending position.
//
// ARGUMENTS:
//   srcArray - array - the array of strings that will be joined to
//     form the new document source
//   docEditNode - DocEdit object - the node that we are deleting
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function docEdits_deleteCodeBlock(srcArray, docEditNode)
{
  var pattern, myRe, pos;

  var whiteSpace = " \f\n\r\t\v";

  var bPutCloseDelim = false;
  var bPutOpenDelim = false;

  var bPutStartingEOL = true
  var bPutEndingEOL = true;

  var node = docEditNode.priorNode;
  var thisNode = dwscripts.getOuterHTML(node);

  var openDelim = docEditNode.mergeDelims[0];
  var closeDelim = docEditNode.mergeDelims[1];

  // Deal with the open delimiter

  var lastChunk = srcArray.pop();

  pattern = dwscripts.escRegExpChars(openDelim) + "\\s*$";
  myRe = new RegExp (pattern, "i");

  pos = lastChunk.search(myRe);
  if (pos == -1)
  {
    // Starting delim was not found at the end of the previous block,
    //  so we try to figure out which spaces and new lines to preserve

    pos = lastChunk.length - 1;

    // Preserve spaces and tabs up to the first newline after the participant's
    //   insert text. Strip all other whitespace after that.

    // backup until we hit a character that is not a new line
    while ((pos >= 0) && ("\r\n".indexOf( lastChunk.charAt(pos) ) != -1))
    {
      pos--;
    }

    // if we found this position, add the last chuck back,
    //  without the new lines
    if (pos > -1)
    {
      srcArray.push(lastChunk.substring(0, pos+1));
    }

    // Indicate that we need the close delim, becuase
    //  we did not remove the opening delim
    bPutCloseDelim = true;

    // now look for the delim at the start of the node we are deleting from
    pattern = "^\\s*" + dwscripts.escRegExpChars(openDelim) + "(\\s*)";
    if (thisNode.search(new RegExp(pattern,"i")) != -1 &&
        RegExp.$1.indexOf("\n") == -1 &&
        RegExp.$1.indexOf("\r") == -1
       )
    {
      // we found the open delim, and there are newlines after it
      bPutEndingEOL = false;
    }
  }
  else
  {
    // We found the end delim at the end of the previous block

    if (pos > 0)
    {
      // add the chunk back, minus the opening delim
      srcArray.push(lastChunk.substring(0, pos));
    }
    else
    {
      // If pos equals zero, do nothing, becuase the entire previous
      //  block should be removed
    }
  }


  // Deal with the close delimiter

  var nodeRange = dwscripts.getNodeOffsets(node);
  var afterParticipant = docEdits.allSrc.substring(docEditNode.replacePos, nodeRange[1]);

  pattern = "^\\s*" + dwscripts.escRegExpChars(closeDelim) + "\\s*$";
  myRe = new RegExp (pattern, "i");

  pos = afterParticipant.search(myRe);
  if (pos == -1)
  {
    // the close delim was not the only thing found
    //   after the code we are removing
    while (whiteSpace.indexOf( this.allSrc.charAt(docEditNode.replacePos) ) != -1 && docEditNode.replacePos <= this.allSrc.length)
    {
      docEditNode.replacePos++;
    }

    // Need an open delim, becuase we did not remove the close delim
    bPutOpenDelim = true;

    // search for the close delim at the end of the the block
    //   we are updating
    pattern = "(\\s*)" + dwscripts.escRegExpChars(closeDelim) + "\\s*$";
    if (afterParticipant.search(new RegExp(pattern,"i"))!= -1 &&
        RegExp.$1.indexOf("\n") == -1 &&
        RegExp.$1.indexOf("\r") == -1
       )
    {
      // there were newlines before the close delim, so
      //  add one back.
      bPutStartingEOL = false;
    }
  }
  else
  {
    // Only the close delim was found after this, so set the replace pos
    //  to after the current node.
    docEditNode.replacePos = nodeRange[1];
  }



  if (bPutCloseDelim && bPutOpenDelim)
  {
    // neither operation removed a delim, so just add newlines
    srcArray.push(docEdits.strNewlinePref + docEdits.strNewlinePref);
  }
  else if (bPutCloseDelim)
  {
    // we need a close delim, becuase the open was not removed,
    //  but the close was
    var eol = bPutEndingEOL ? docEdits.strNewlinePref : " ";
    srcArray.push(eol + closeDelim);
  }
  else if (bPutOpenDelim)
  {
    // we need an open delim, becuase the close was not removed,
    //  but the open was
    var eol = bPutStartingEOL ? docEdits.strNewlinePref : " ";
    srcArray.push(openDelim + eol);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   docEdits.sortWeights
//
// DESCRIPTION:
//   This function is used to sort the document edits, based on the
//   queued weights.  The sort preserves the order of edits that were
//   queued with the same weight.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function docEdits_sortWeights()
{
  //var msg="presort -------------\n";
  //for (i=0; i<docEdits.editList.length; i++) {
  //  msg += i+":" +docEdits.editList[i].weight+"="+docEdits.editList[i].text+"\n";
  //}
  //alert(msg);

  //shift-sort algorithm. Keeps same-weight chunks together
  for (var i=0; i < docEdits.editList.length-1; i++)
  {
    for (var j=i+1; j < docEdits.editList.length; j++)
    {
      var aType = docEdits.editList[i].weightType;
      var bType = docEdits.editList[j].weightType;

      var a = docEdits.editList[i].weightNum;
      var b = docEdits.editList[j].weightNum;

      if ((aType == bType && a != null && b != null && a > b)
          || (aType == "belowHTML" && bType=="aboveHTML"))
      {
        var temp = docEdits.editList[j];
        for (var k=j; k>i; k--)
        {
          docEdits.editList[k] = docEdits.editList[k-1];
        }
        docEdits.editList[i] = temp;
      }
    }
  }

  //var msg="After pre sort:\n";
  //for (i=0; i<docEdits.editList.length; i++) {
  //  msg += i+":" +docEdits.editList[i].weight+"="+docEdits.editList[i].text+"\n";
  //}
  //alert(msg);
}


//--------------------------------------------------------------------
// FUNCTION:
//   docEdits.sortInserts
//
// DESCRIPTION:
//   After the edit nodes have been processed, and their insert
//   position has been set, this function sorts the edit nodes
//   based on this position.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function docEdits_sortInserts()
{
  var i,j,k,a,b,temp;

  //shift-sort inserts by insert position
  for (i=0; i<docEdits.editList.length-1; i++)
  {
    for (j=i+1; j<docEdits.editList.length; j++)
    {
      a = docEdits.editList[i].insertPos;
      b = docEdits.editList[j].insertPos;

      //if a should insert before b, swap them
      if (a != null && b != null && a > b)
      {
        temp = docEdits.editList[j];
        for (k=j; k>i; k--)
        {
          docEdits.editList[k] = docEdits.editList[k-1];
        }
        docEdits.editList[i] = temp;
      }
    }
  }

  //var msg="After insertion sort:\n";
  //for (i=0; i<docEdits.editList.length; i++) {
  //  msg += i+": inserting at pos " +docEdits.editList[i].insertPos+","+docEdits.editList[i].replacePos+":"+docEdits.editList[i].text+":\n";
  //}
  //alert(msg);
}




//--------------------------------------------------------------------
// CLASS:
//   DocEdit
//
// DESCRIPTION:
//   This class represents an edit to the document.
//   It is used within the docEdits class.
//
// PUBLIC PROPERTIES:
//   None
//
// PUBLIC FUNCTIONS:
//   processForApply()
//
//--------------------------------------------------------------------

//--------------------------------------------------------------------
// FUNCTION:
//   DocEdit
//
// DESCRIPTION:
//   Constructor function
//
// ARGUMENTS:
//   (see initialize)
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function DocEdit(text, priorNodeSegment, weight, relativeNode, dontPreprocessText, dontFormatForMerge)
{
  this.initialize(text, priorNodeSegment, weight, relativeNode, dontPreprocessText, dontFormatForMerge);
}


// public methods
DocEdit.prototype.processForApply = DocEdit_processForApply;

// private methods
DocEdit.prototype.initialize = DocEdit_initialize;
DocEdit.prototype.formatForMerge = DocEdit_formatForMerge;
DocEdit.prototype.processPriorNodeEdit = DocEdit_processPriorNodeEdit;
DocEdit.prototype.processNewEdit = DocEdit_processNewEdit;
DocEdit.prototype.removeSpaceFromTableCell = DocEdit_removeSpaceFromTableCell;
DocEdit.prototype.toString = DocEdit_toString;


//--------------------------------------------------------------------
// FUNCTION:
//   DocEdit.initialize
//
// DESCRIPTION:
//   Initializes the DocEdit object
//
// ARGUMENTS:
//   text - string - new text to be inserted.
//
//   priorNodeSegment - Object - (optional) the node segment within
//     which to replace an existing chunk of text.
//     It contains the following properties:
//       node - DOM node - the document node being referenced
//       matchRangeMin - integer - the starting node-relative offset
//         of the text to replace
//       matchRangeMax - integer -  the ending node-relative offset
//         of the text to replace
//
//   weight - string - the location where the text should be inserted:
//       aboveHTML+nn: insert the text above the <HTML> tag.
//         nn is an integer between 1 and 99. If the +nn is not specified,
//         99 is used.
//       belowHTML+nn: insert the text below the </HTML> tag.
//         nn is an integer between 1 and 99.
//       beforeSelection: insert the text before the current selection
//       afterSelection: insert the text after the current selection
//       replaceSelection: replace the current selection with text
//       beforeNode: insert the text before the given node
//       afterNode: insert the text after the given node
//       replaceNode: replace the given node with text
//       nodeAttribute+attribname: sets attribute attribName of
//         the given node
//       nodeAttribute: inserts text in start tag after the tagname
//
//     NOTE: if priorNodeSegment was given, weight is ignored.
//
//   relativeNode - DOM node - (optional) Only passed if using a
//     node-relative weight
//
//   optionFlags - Or'd list of docEdits.QUEUE_* flags
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function DocEdit_initialize(text, priorNodeSegment, weight, relativeNode, optionFlags)
{
  //public
  this.text              = text;

  if (priorNodeSegment && dw.nodeExists(priorNodeSegment.node))
  {
    this.priorNodeSegment  = priorNodeSegment;
    this.priorNode         = priorNodeSegment.node || false;
    this.matchRangeMin     = priorNodeSegment.matchRangeMin || 0;
    this.matchRangeMax     = priorNodeSegment.matchRangeMax || 0;

    if (this.matchRangeMin == this.matchRangeMax)
    {
        //  If we are here, we were given a priorNodeSegment which, though non-null and
	    //  in existance, is in fact bogus.  Therefore, act like we were given no
	    //  priorNodeSegment at all (i.e., given a null for that param).  It is dangerous
	    //  to use priorNodeSegment without clearing it here because we apparently have
	    //  data with bad integrety at this point.
	    
        alert("ERROR: bad node segment offsets");
	    priorNodeSegment  = null;
    }
  }
  
  if (!priorNodeSegment)
  {
    this.priorNode = false;
    this.matchRangeMin     = -1;
    this.matchRangeMax     = -1;
  }

  this.weight            = weight || "";  //aboveHTML[+nn], belowHTML[+nn],
                                          //beforeSelection, afterSelection, replaceSelection,
                                          //beforeNode, afterNode, replaceNode,
                                          //nodeAttribute[+attribname]
  this.node               = relativeNode || null;  //optional: only used with "...Node" weights
  
  this.dontMerge = (optionFlags & docEdits.QUEUE_DONT_MERGE);

  this.dontPreprocessText = (optionFlags & docEdits.QUEUE_DONT_PREPROCESS_TEXT);
  this.dontFormatForMerge = (optionFlags & docEdits.QUEUE_DONT_FORMAT_FOR_MERGE);

  this.defaultWeight     = 99;
  this.version           = 5.0;

  //private
  this.insertPos  = null;
  this.replacePos = null;
  this.bDontMergeTop = false;
  this.bDontMergeBottom = false;


  this.weightType        = "";    //weight *might* have a preword, like aboveHTML or nodeAttribute
  this.weightNum         = null;  //weight *might* include a number (set below)
  this.weightInfo        = "";    //weight *might* have extra info, like an attribute name (set below)

  //Initialize weight, weightNum, and weightInfo properties
  //Determine correct weight type, and assign extra weight properties
  if (this.weight)
  {
    //if weight is just number, change to aboveHTML+number
    if (this.weight == String(parseInt(this.weight))) //if just number (old style)
    {
      this.weightNum  = parseInt(this.weight); //convert if number
      this.weightType = "aboveHTML";
      this.weight = this.weightType + "+" + this.weight;  //default is aboveHTML
    }
    //if extra weight info (someWeight+someData), extract data
    else if (this.weight.indexOf("+") > 0)
    {
      var data = this.weight.substring(this.weight.indexOf("+")+1);
      this.weightType = this.weight.substring(0,this.weight.indexOf("+"));

      //if weight is ??+number, extract the number
      if (data == String(parseInt(data)))
      {
        this.weightNum = parseInt(data); //convert if number

      //if weight is ??+??, save data as info
      }
      else
      {
        this.weightInfo  = data;
      }
    }
    //if weight is aboveHTML or belowHTML, add default weight number
    else if (this.weight == "aboveHTML" || this.weight == "belowHTML")
    {
      this.weightType = this.weight;
      this.weight += "+"+String(this.defaultWeight);
      this.weightNum = this.defaultWeight;
    }
    //for backward compatibility,convert "afterDocument" to "belowHTML"
    else if (this.weight == "afterDocument")
    {
      this.weightType = "belowHTML";
      this.weight = this.weightType + "+" + String(this.defaultWeight);
      this.weightNum = this.defaultWeight;
    }
  }
  else  //default if no weight given
  {
    this.weight     = "aboveHTML+"+String(this.defaultWeight);
    this.weightType = "aboveHTML";
    this.weightNum = this.defaultWeight;
  }

  // Only merge above and below the HTML tag.  Merging within
  //  the body can cause problems with translators.
  if (this.weightType != "aboveHTML" && this.weightType != "belowHTML")
  {
    this.preventMerge = true;
  }

}


//--------------------------------------------------------------------
// FUNCTION:
//   DocEdit.toString
//
// DESCRIPTION:
//   Returns a string representation of this node, useful for debugging
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function DocEdit_toString()
{
  var retVal = new Array();
  retVal.push("Text = \n:" + this.text + ":");
  retVal.push("InsertPos = " + this.insertPos);
  retVal.push("ReplacePos = " + this.replacePos);
  retVal.push("Weight = " + this.weight);
  if (this.priorNodeSegment)
  {
    retVal.push("PriorNode = \n:" + this.priorNodeSegment.toString() + ":");
  }
  return retVal.join("\n");
}


//--------------------------------------------------------------------
// FUNCTION:
//   DocEdit.processForApply
//
// DESCRIPTION:
//   This function is called from docEdits.apply to set up the
//   various parameters that will be needed to determine the
//   new document source.
//
// ARGUMENTS:
//   index - integer - the position of this node within the
//     docEdits.editList array.  This is needed so that adjacent
//     nodes can be referenced.
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function DocEdit_processForApply(index)
{
  this.mergeDelims = null;
  if (!this.dontMerge)
  {
    this.mergeDelims = docEdits.canMergeBlock(this.text);
  }

  this.bDontMergeTop = false;
  this.bDontMergeBottom = false;

  this.formatForMerge();

  if (this.priorNode) //if node was already there, replace it
  {
    //DEBUG alert("priorNode = " + dwscripts.getOuterHTML(this.priorNode));

    this.processPriorNodeEdit(index);

  }
  else if (this.text && this.text != null) //if no prior node, and something to insert
  {
    //DEBUG alert("inserting item with weight "+editObj.weight+", type=:"+editObj.weightType+":\n:"+editObj.text+":");

    this.processNewEdit(index);

  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   DocEdit.formatForMerge
//
// DESCRIPTION:
//   This function formats the inserted text if it is a mergeable
//   block, and it does not have the weight of nodeAttribute.
//
//   Reformat it to the following:
//
//     <%
//     Block
//     %>
//
//   This allows us to keep a nice format when merging blocks
//   and keeps our patterns from breaking due to stripped or merged
//   whitespace amongst the merged blocks.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function DocEdit_formatForMerge()
{
  if (!this.dontFormatForMerge && !this.dontMerge && !this.preventMerge &&
      this.mergeDelims && this.mergeDelims.length &&
      (!this.weight || this.weight.indexOf("nodeAttribute") == -1)
     )
  {
    var escStartDelim = dwscripts.escRegExpChars(this.mergeDelims[0]);
    var escEndDelim = dwscripts.escRegExpChars(this.mergeDelims[1]);

    // Preserve spaces and tabs before the first newline before the end delimeter.
    var pattern = "^\\s*" + escStartDelim + "\\s*([\\S\\s]*[^\\r\\n])\\s*" + escEndDelim + "\\s*$";
    this.text = this.text.replace(new RegExp(pattern,"i"),
                      this.mergeDelims[0] + docEdits.strNewlinePref +
                      "$1" + docEdits.strNewlinePref + this.mergeDelims[1]);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   DocEdit.processPriorNodeEdit
//
// DESCRIPTION:
//   This function processes a docEdit node which is updating an
//   existing node on the page.
//
// ARGUMENTS:
//   index - integer - the position of this node within the
//     docEdits.editList array.  This is needed so that adjacent
//     nodes can be referenced.
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function DocEdit_processPriorNodeEdit(index)
{
  //only update if new text has been provided
  if (this.text != null)
  {
    //if nodeAttribute, only update the attribute (or tag section)
    if (this.weight.indexOf("nodeAttribute") == 0)
    {
      var pos = extUtils.findAttributePosition(this.priorNode, this.weightInfo);
      if (pos)
      {
        this.insertPos  = pos[0];
        this.replacePos = pos[1];

        //if positional attribute and removing text
        if (this.weight.indexOf(",") != -1 && !this.text)
        {
          //if attribute has space before and after, and removing attribute, strip a space
          if (docEdits.allSrc.charAt(this.insertPos-1) == " " &&
              docEdits.allSrc.charAt(this.replacePos) == " ")
          {
            this.replacePos++;
          }
        }
      }
    }
    else  //if not nodeAttribute, do a full replace of the tag
    {
      //if replacing a block tag and the new text
      // starts the same but has no end tag, preserve innerHTML
      if (extUtils.isBlockTag(this.priorNode) &&
          (this.text.search(RegExp("\\s*<"+dwscripts.getTagName(this.priorNode),"i"))==0) &&
          (this.text.search(RegExp("</"+dwscripts.getTagName(this.priorNode),"i"))==-1)
         )
      {
        // This logic is now performed in extPart.queueDocEdit()
      }
      else // if not a block tag
      {
        var priorNodeOffsets = dwscripts.getNodeOffsets(this.priorNode);
        var insertMergeDelims = this.mergeDelims;
        var existingMergeDelims = docEdits.canMergeBlock(dwscripts.getOuterHTML(this.priorNode));

        if (this.dontMerge || !existingMergeDelims)
        {
          this.insertPos = this.matchRangeMin + priorNodeOffsets[0];
          this.replacePos = this.matchRangeMax + priorNodeOffsets[0];
        }
        else if (this.text == "")
        {
          this.insertPos = this.matchRangeMin + priorNodeOffsets[0];
          this.replacePos = this.matchRangeMax + priorNodeOffsets[0];

          this.bDontMergeTop = true;
          this.bDontMergeBottom = true;

          this.mergeDelims = existingMergeDelims;
        }
        else if (insertMergeDelims
            && insertMergeDelims[0].toLowerCase() == existingMergeDelims[0].toLowerCase()
            && insertMergeDelims[1].toLowerCase() == existingMergeDelims[1].toLowerCase())
        {
          var escStartDelim = dwscripts.escRegExpChars(insertMergeDelims[0]);
          var escEndDelim = dwscripts.escRegExpChars(insertMergeDelims[1]);

          // Only strip the delimeters if we are not replacing the whole block
          if (this.matchRangeMin != 0 &&
              (priorNodeOffsets[0] + this.matchRangeMax) != priorNodeOffsets[1])
          {
            // Preserve spaces and tabs before the first newline before the end delimeter.
            var pattern = "^\\s*" + escStartDelim + "\\s*([\\S\\s]*[^\\r\\n])\\s*" + escEndDelim + "\\s*$";
            this.text = this.text.replace(new RegExp(pattern,"i"), "$1");
          }

          this.insertPos = this.matchRangeMin + priorNodeOffsets[0];
          this.replacePos = this.matchRangeMax + priorNodeOffsets[0];
          this.bDontMergeTop = true;
          this.bDontMergeBottom = true;
        }
        else
        {
          //must split up existing node and insert in between
          var partBefore = docEdits.allSrc.substring(priorNodeOffsets[0], this.matchRangeMin + priorNodeOffsets[0]);
          var partAfter = docEdits.allSrc.substring(this.matchRangeMax + priorNodeOffsets[0], priorNodeOffsets[1]);

          var pattern = "^\\s*" + dwscripts.escRegExpChars(existingMergeDelims[0]) + "\\s*$";
          if (partBefore && partBefore.search(new RegExp(pattern, "i")) == -1)
          {
            this.text = existingMergeDelims[1] + docEdits.strNewlinePref + this.text;
            this.insertPos = this.matchRangeMin + priorNodeOffsets[0];
            this.bDontMergeTop = true;
          }
          else
          {
            this.insertPos = priorNodeOffsets[0];
          }

          pattern = "^\\s*" + dwscripts.escRegExpChars(existingMergeDelims[1]) + "\\s*$";
          if (partAfter && partAfter.search(new RegExp(pattern, "i")) == -1)
          {
            this.text = this.text + docEdits.strNewlinePref + existingMergeDelims[0];
            this.replacePos = this.matchRangeMax + priorNodeOffsets[0];
            this.bDontMergeBottom = true;
          }
          else
          {
            this.replacePos = priorNodeOffsets[1];
          }
        }
      }
    }
    
    if (!this.dontPreprocessText)
    {
      this.text = dwscripts.preprocessDocEditInsertText(this.text, this.priorNode, true); // pss true for isUpdate
    }  
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   DocEdit.processNewEdit
//
// DESCRIPTION:
//   This function processes a docEdit node which is inserting a
//   new edit on the page.
//
// ARGUMENTS:
//   index - integer - the position of this node within the
//     docEdits.editList array.  This is needed so that adjacent
//     nodes can be referenced.
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function DocEdit_processNewEdit(index)
{
  var dom = dw.getDocumentDOM();
  var allSBs = dw.serverBehaviorInspector.getServerBehaviors();


  if (this.weight=="beforeNode")
  {
    var nodeOffsets = dwscripts.getNodeOffsets(this.node);

    this.insertPos  = nodeOffsets[0];
    this.replacePos = nodeOffsets[0];

    if (!this.dontPreprocessText)
    {
      this.text = dwscripts.preprocessDocEditInsertText(this.text, this.node, false);
    }
  }
  else if (this.weight=="replaceNode")
  {
    var nodeOffsets = dwscripts.getNodeOffsets(this.node);

    this.insertPos  = nodeOffsets[0];
    this.replacePos = nodeOffsets[1];

    if (!this.dontPreprocessText)
    {
      this.text = dwscripts.preprocessDocEditInsertText(this.text, this.node, false);
    }
  }
  else if (this.weight=="afterNode")
  {
    var nodeOffsets = dwscripts.getNodeOffsets(this.node);

    this.insertPos  = nodeOffsets[1];
    this.replacePos = nodeOffsets[1];

    if (!this.dontPreprocessText)
    {
      this.text = dwscripts.preprocessDocEditInsertText(this.text, this.node, false);
    }
  }
  else if (this.weight.indexOf("firstChildOfNode") == 0)
  {
    if (this.node.nodeType == Node.ELEMENT_NODE)
    {
      if (this.node.hasChildNodes())
      {
        var childNodeOffsets = dwscripts.getNodeOffsets(this.node.childNodes[0]);
        this.insertPos  = childNodeOffsets[0];
        this.replacePos = childNodeOffsets[0];
      }
      else
      {
        var nodeOffsets = dwscripts.getNodeOffsets(this.node);
        var nodeHTML = dwscripts.getOuterHTML(this.node);
        var tagName = dwscripts.getTagName(this.node);
        var pos = nodeHTML.search(RegExp("<\\/"+tagName+">","i"));
        if (pos == -1)
        {
          pos = nodeHTML.indexOf("</");
        }
        pos += nodeOffsets[0];
        this.insertPos  = pos;
        this.replacePos = pos;
      }
    }

    if (!this.dontPreprocessText)
    {
      this.text = dwscripts.preprocessDocEditInsertText(this.text, this.node, false);
    }
  }
  else if (this.weight.indexOf("lastChildOfNode") == 0)
  {
    if (this.node.nodeType == Node.ELEMENT_NODE)
    {
      if (this.node.hasChildNodes())
      {
        var last = this.node.childNodes.length - 1;
        var childNodeOffsets = dwscripts.getNodeOffsets(this.node.childNodes[last]);
        this.insertPos  = childNodeOffsets[1];
        this.replacePos = childNodeOffsets[1];
      }
      else
      {
        var nodeOffsets = dwscripts.getNodeOffsets(this.node);
        var nodeHTML = dwscripts.getOuterHTML(this.node);
        var tagName = dwscripts.getTagName(this.node);
        var pos = nodeHTML.search(RegExp("<\\/"+tagName+">","i"));
        if (pos == -1)
        {
          pos = nodeHTML.indexOf("</");
        }
        pos += nodeOffsets[0];
        this.insertPos  = pos;
        this.replacePos = pos;
      }
    }

    if (!this.dontPreprocessText)
    {
      this.text = dwscripts.preprocessDocEditInsertText(this.text, this.node, false);
    }
  }
  else if (this.weight.indexOf("nodeAttribute") == 0)
  {
    //nodeAttribute+ATTRIB (not numerically positioned)
    if (this.weightInfo && this.weightInfo.length)
    {
      if (!this.dontPreprocessText)
      {
        this.text = dwscripts.preprocessDocEditInsertText(this.text, this.node, false);
      }

      //get pos of attrib value
      var pos = extUtils.findAttributePosition(this.node, this.weightInfo);
      if (!pos)  //if attrib doesn't exist
      {
        var nodeOffsets = dwscripts.getNodeOffsets(this.node);
        pos = new Array();
        pos[0] = nodeOffsets[0] + dwscripts.getTagName(this.node).length + 1;  //skip <tag
        pos[1] = pos[0];

        // change text to include entire attribute. use single quotes
        // if this is an ASP.NET document.
        if (dw.getDocumentDOM().documentType.indexOf("ASP.NET") != -1){
          this.text = " " + this.weightInfo + "='" + this.text + "'";
        }else{ 
          this.text = ' ' + this.weightInfo + '="' + this.text + '"';
        }
      }

      //DEBUG alert("pos[0] = " + pos[0] + "\ndwscripts.getNodeOffsets(this.node)[0] = " + dwscripts.getNodeOffsets(this.node)[0] + "\npos[0] - pos of this.node[0] = " + (pos[0]-dwscripts.getNodeOffsets(this.node)[0]) + "\n" + dwscripts.getOuterHTML(this.node).charAt(pos[0] - (dwscripts.getNodeOffsets(this.node)[0]+1)));

      // if the attribute already exists, and its current value is surrounded by double
      // quotes, they need to be changed to single quotes if this is an ASP.NET document.
      if (dw.getDocumentDOM().documentType.indexOf("ASP.NET") != -1 
          && dwscripts.getOuterHTML(this.node).charAt(pos[0] - (dwscripts.getNodeOffsets(this.node)[0]+1)) == '"'){
        this.text = "'" + this.text + "'";
        this.insertPos = pos[0]-1;
        this.replacePos = pos[1]+1;
      }else{
        this.insertPos  = pos[0];
        this.replacePos = pos[1];
      }
    }
    else //must be numbered position
    {
      //inserts into node tag. For example, you may want to change <option> to <option<%= if (foo)..%>>
      var nodeOffsets = dwscripts.getNodeOffsets(this.node);
      var pos = new Array();
      pos[0] = nodeOffsets[0] + dwscripts.getTagName(this.node).length + 1;  //skip <tag
      pos[1] = pos[0];
      this.insertPos  = pos[0];
      this.replacePos = pos[1];
      this.text = " " + dwscripts.trim(this.text); //precede with a space
    }

    if (!this.dontPreprocessText)
    {
      this.text = dwscripts.preprocessDocEditInsertText(this.text, this.node, false);
    }
  }
  else if (this.weight=="beforeSelection")
  {
    sel = extUtils.getSelTableRowOffsets();
    if (!sel || sel.length == 0)
    {
      sel = dom.getSelection();
    }

	if (!sel || sel.length == 0)
    {
      this.insertPos  = 0;
	  this.replacePos = 0;
    }
    else
    {
      this.insertPos  = sel[0];
      this.replacePos = sel[0];
    }

    if (!this.dontPreprocessText)
    {
      this.text = dwscripts.preprocessDocEditInsertText(this.text, null, false);
    }
  }
  else if (this.weight=="replaceSelection")
  {
    sel = extUtils.getSelTableRowOffsets();
    if (!sel || sel.length == 0)
    {
      sel = dom.getSelection();
    }
    
    if (!sel || sel.length == 0)
    {
	  this.insertPos  = 0;
	  this.replacePos = 0;
	}
	else
	{
      sel = this.removeSpaceFromTableCell(sel);

      this.insertPos  = sel[0];
      this.replacePos = sel[1];
    }

    if (!this.dontPreprocessText)
    {
      this.text = dwscripts.preprocessDocEditInsertText(this.text, null, false);
    }
  }
  else if (this.weight=="afterSelection")
  {
    sel = extUtils.getSelTableRowOffsets();
    if (!sel || sel.length == 0)
    {
      sel = dom.getSelection();
    }
    if (!sel || sel.length == 0)
    {
	  this.insertPos  = 0;
	  this.replacePos = 0;
	}
	else
	{
      sel = this.removeSpaceFromTableCell(sel);

      this.insertPos  = sel[0];
      this.replacePos = sel[1];
    }

    this.insertPos  = sel[1];
    this.replacePos = sel[1];

    if (!this.dontPreprocessText)
    {
      this.text = dwscripts.preprocessDocEditInsertText(this.text, null, false);
    }
  }
  else if (this.weightType.indexOf("HTML") != -1) //insert above or below HTML tag
  {
    // DEBUG alert("!inserting item of weight "+this.weight+":\n"+this.text);

    //This code was added to preserve the order of nodes with the same weight,
    //and requires that the caller add "dummy" nodes with null text: x.add(null,priorNode,weight).
    //If the node being added is followed by dummy nodes with the same weight,
    //stops before the next sibling. Look forward, and stop at the next node with the same weight.
    var stoppingNode = null;
    var stoppingNodeOffset = null;
    var foundStop = false;
    for (var i=index+1; i < docEdits.editList.length; i++) //with each object with something to insert
    {
      if (docEdits.editList[i].priorNode) //advance to next placeholder node
      {
        if (this.weight == docEdits.editList[i].weight)
        {
          stoppingNode = docEdits.editList[i].priorNode;
          stoppingNodeOffset = docEdits.editList[i].matchRangeMax;
        }
        break;
      }
    }

    var lighterWeight = 0;
    var lighterNode = 0;
    var lighterNodeOffset = null;

    //detect if there's an existing node with a lower weight, and add after it
    if (this.weightNum && index>0)
    {
      for (var i=0; i<index; i++) //with each object before this one
      {
        //if preceeded by a dummy node with a smaller weight of same type (above or belowHTML)
        if (docEdits.editList[i].priorNode &&
            docEdits.editList[i].weight &&
            docEdits.editList[i].weight.indexOf(this.weightType) == 0)
        {
          var partWeight = extUtils.getWeightNum(docEdits.editList[i].weight);

          //if that weight is smaller than mine, make that the lighter node
          if (partWeight < this.weightNum)
          {
            lighterWeight = partWeight;
            lighterNode = docEdits.editList[i].priorNode;
            lighterNodeOffset = docEdits.editList[i].matchRangeMax;
          }
        }
      }
    }

    //Search other participants for lighter nodes to add after
    for (var i=0; i < allSBs.length; i++)
    {
      // Guard against SB objects which do not have the properties we expect.
      if (allSBs[i].getParticipants)
      {
        //find insertion node
        var sbParts = allSBs[i].getParticipants();
        for (var k=0; k < sbParts.length; k++)
        {
          var partNodeSeg = sbParts[k].getNodeSegment();
          
          // Check if the given node segment is actually located above or below
          // the HTML tag in the document
          if (partNodeSeg.node && dw.nodeExists(partNodeSeg.node) &&
              dwscripts.isInsideTag(partNodeSeg.node,"HTML"))
          {
            continue;  // we do not want to consider this node if it is located in the HTML
          }
          
          var partWeight = String(sbParts[k].getWeight());
          if (partWeight == String(parseInt(partWeight)))
          {
            partWeight = "aboveHTML+" + partWeight;
          }
          if (   stoppingNode && (partNodeSeg.node == stoppingNode)
              && (partNodeSeg.matchRangeMax == stoppingNodeOffset)
             )
          {
            foundStop = true;  //don't go beyond stopping node
            continue;
          }
          else if (partWeight.indexOf(this.weightType)==0)
          { //if same type, keep looking for node above me
            var newWeight = extUtils.getWeightNum(sbParts[k].getWeight());

            //DEBUG alert("Checking part "+k+": "+lighterWeight+" (lighter) <= "+newWeight+" (new) <= "+this.weightNum+" (my weight)?");

            if (newWeight && lighterWeight <= newWeight && (newWeight < this.weightNum
                || (!foundStop && newWeight == this.weightNum)))  //heavier than LW, lighter than me
            {
              lighterWeight     = newWeight;
              lighterNode       = partNodeSeg.node;
              lighterNodeOffset = partNodeSeg.matchRangeMax;
              //DEBUG alert("Changing lighter weight to (new) "+lighterWeight+"\n"+unescape(lighterNode.orig));
            }
          }
        }
      }
      else
      { // Handle UD1 and UD4 Server Behavior objects
        //Search other participants for lighter nodes to add after
        for (k=0; k<allSBs[i].weights.length; k++) { //find insertion node
          var partWeight = String(allSBs[i].weights[k]);
          if (partWeight == String(parseInt(partWeight))) partWeight = "aboveHTML+" + partWeight;
          if (stoppingNode && allSBs[i].participants[k] == stoppingNode) { //don't go beyond stopping node
            foundStop = true;
            continue;
          } else if (partWeight.indexOf(this.weightType)==0) { //if same type, keep looking for node above me
            newWeight = extUtils.getWeightNum(allSBs[i].weights[k]);
            //DEBUG alert("Checking part "+k+": "+lighterWeight+" (lighter) <= "+newWeight+" (new) <= "+editObj.weightNum+" (my weight)?");
            if (newWeight && lighterWeight <= newWeight && (newWeight < this.weightNum
                || (!foundStop && newWeight == this.weightNum))) { //heavier than LW, lighter than me
              lighterWeight = newWeight;
              lighterNode   = allSBs[i].participants[k];
              lighterNodeOffset = 0;
              //DEBUG alert("Changing lighter weight to (new) "+lighterWeight+"\n"+unescape(lighterNode.orig));
        } } }
      }
    }

    if (lighterNode)
    {
      var nodeOffsets = dwscripts.getNodeOffsets(lighterNode);
      this.insertPos = nodeOffsets[1];

      var proposedInsertPos = lighterNodeOffset + nodeOffsets[0];

      if ( this.insertPos > proposedInsertPos )
      {
        //possibly inserting in middle of node
        var insertMergeDelims = null;
        if (!this.dontMerge)
        {
          insertMergeDelims = docEdits.canMergeBlock(this.text);
        }
        var existingMergeDelims = null;
        if (docEdits.canMergeNode(lighterNode))
        {
          existingMergeDelims = docEdits.canMergeBlock(extUtils.convertNodeToString(lighterNode));
        }
        this.bDontMergeTop = true;

        if (insertMergeDelims && existingMergeDelims
            && insertMergeDelims[0].toLowerCase() == existingMergeDelims[0].toLowerCase()
            && insertMergeDelims[1].toLowerCase() == existingMergeDelims[1].toLowerCase())
        {
          var escStartDelim = dwscripts.escRegExpChars(insertMergeDelims[0]);
          var escEndDelim = dwscripts.escRegExpChars(insertMergeDelims[1]);

          // Preserve spaces and tabs before the first newline before the end delimeter.
          var pattern = "^\\s*" + escStartDelim + "\\s*([\\S\\s]*[^\\r\\n])\\s*" + escEndDelim + "\\s*$";
          this.text = docEdits.strNewlinePref + docEdits.strNewlinePref + this.text.replace(new RegExp(pattern, "i"), "$1");
          this.insertPos = proposedInsertPos;
          this.bDontMergeBottom = true;
        }
        else if (!existingMergeDelims)
        {
          //do nothing - insert after this node
        }
        else
        {
          //need to split up nodes, maybe
          var partAfter = docEdits.allSrc.substring(proposedInsertPos, this.insertPos);
          var pattern = "[\r\n]\\s*" + dwscripts.escRegExpChars(existingMergeDelims[1]) + "\\s*$";
          if (partAfter.search(new RegExp(pattern, "i")) == -1)
          {
            this.text = docEdits.strNewlinePref + existingMergeDelims[1] + docEdits.strNewlinePref + this.text
                         + docEdits.strNewlinePref + existingMergeDelims[0] + docEdits.strNewlinePref;
            this.splitDelims = existingMergeDelims;
            this.insertPos = proposedInsertPos;
            // remove the white space from the partAfter
            if (partAfter.search(/^(\s*)/) != -1)
            {
              this.replacePos = this.insertPos + String(RegExp.$1).length;
            }
            this.bDontMergeBottom = true;
          }
          else
          {
            //do nothing - insert after this node
          }
        }
      }
    }
    else  // lighter node not found
    {
      if (this.weightType == "belowHTML")
      {
        this.insertPos  = dwscripts.getNodeOffsets(dom.documentElement)[1];
        if (this.insertPos == 0) //if document w/o HTML, add after everything
        {
          this.insertPos  = dom.documentElement.outerHTML.length;
        }
      }
      else  //aboveHTML, first item
      {
        this.insertPos = 0;
      }
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   DocEdit.removeSpaceFromTableCell
//
// DESCRIPTION:
//   If no selection, and inserting after a &nbsp; at the beginning of a TD
//   tag, remove the &nbsp;. This is really useful for "<td>&nbsp;</td>" inserts.
//
// ARGUMENTS:
//   sel - integer - the selection offset which need to be adjusted
//
// RETURNS:
//   integer - the new selection
//--------------------------------------------------------------------

function DocEdit_removeSpaceFromTableCell(sel)
{
  var dom = dw.getDocumentDOM();

  if (sel[0] == sel[1] && sel[0] > 7)
  {
    if (!docEdits.allSrc)
    {
      docEdits.allSrc = dom.documentElement.outerHTML;
    }

    var tagName = String(dom.getSelectedNode().tagName).toUpperCase();

    if (docEdits.allSrc.substring(sel[0]-7,sel[1]) == ">&nbsp;" && tagName == "TD")
    {
      sel[0] -= 6;
    }
  }

  return sel;
}






//--------------------------------------------------------------------
// CLASS:
//   extUtils
//
// DESCRIPTION:
//   Static class which houses helper functions needed by extension data
//   manager classes.
//
// PUBLIC PROPERTIES:
//   None
//
// PUBLIC FUNCTIONS:
//
//   getTagSelection()
//   setTagSelection(tagSelection)
//
//   isCollapsibleTag(theTag)
//   isBlockTag(node)
//   getWeightNum(weight)
//
//   findAttributePosition(node, attrName, getEntirePos, nodeRelative)
//
//   isDependentNodeSegment(nodeSeg, countFamilyAsOne)
//   onlyFamilyReferences(nodeSegment)
//
//   replaceParamsInStr(theStr, paramObj)
//
//   replaceValuesInNodeSegment(nodeSeg, updatePatterns, paramObj)
//   replaceValuesInString(theStr, updatePatterns, paramObj)
//
//   parametersMatch(params1, params2, paramsToMatch)
//
//   findPatternsInString(nodeStr, quickSearch, searchPatterns, findMultiple)
//   extractParameters(searchPatterns)
//
//   convertNodeToString(node)
//
//--------------------------------------------------------------------

function extUtils()
{
  // extUtils is a static class and has no state. Used to create
  //   a namespace for common helper functions.
  throw dwscripts.sprintf(MM.MSG_createStaticClass, "extUtils");
}

// Public class methods
extUtils.getTagSelection = extUtils_getTagSelection;
extUtils.setTagSelection = extUtils_setTagSelection;

extUtils.isCollapsibleTag = extUtils_isCollapsibleTag;
extUtils.isBlockTag = extUtils_isBlockTag;
extUtils.getWeightNum = extUtils_getWeightNum;

extUtils.findAttributePosition = extUtils_findAttributePosition;

extUtils.isDependentNodeSegment = extUtils_isDependentNodeSegment;
extUtils.onlyFamilyReferences = extUtils_onlyFamilyReferences;

extUtils.replaceParamsInStr = extUtils_replaceParamsInStr;

extUtils.replaceValuesInNodeSegment = extUtils_replaceValuesInNodeSegment;
extUtils.replaceValuesInString = extUtils_replaceValuesInString;

extUtils.parametersMatch = extUtils_parametersMatch;

extUtils.findPatternsInString = extUtils_findPatternsInString;
extUtils.extractParameters = extUtils_extractParameters;

extUtils.convertNodeToString = extUtils_convertNodeToString;



// Private class methods
extUtils.safeReplaceBetweenSubExpressions = extUtils_safeReplaceBetweenSubExpressions;
extUtils.processExtDataText = extUtils_processExtDataText;
extUtils.replaceParamsInExprStr = extUtils_replaceParamsInExprStr;
extUtils.getLoopVarNestLevel = extUtils_getLoopVarNestLevel;
extUtils.evaluateRTCElements = extUtils_evaluateRTCElements;
extUtils.postProcessRTCElements = extUtils_postProcessRTCElements;

//selection code
extUtils.getOffsetsAfterClimbingTree = extUtils_getOffsetsAfterClimbingTree;
extUtils.getOffsetsAfterAccountingForSomeSpecialSelectionCases = extUtils_getOffsetsAfterAccountingForSomeSpecialSelectionCases;
extUtils.isAContainerTag = extUtils_isAContainerTag;
extUtils.cursorIsInsideOfTableCell = extUtils_cursorIsInsideOfTableCell;
extUtils.selectedNodeIsATableNode = extUtils_selectedNodeIsATableNode;
extUtils.getSelTableRowOffsets = extUtils_getSelTableRowOffsets;
extUtils.tableHasOnlyOneColumn = extUtils_tableHasOnlyOneColumn;
extUtils.getOffsetsAfterStrippingWhiteSpace = extUtils_getOffsetsAfterStrippingWhiteSpace;
extUtils.getOffsetsAfterListCheck = extUtils_getOffsetsAfterListCheck;
extUtils.getOffsetsAfterCheckingForBodySelection = extUtils_getOffsetsAfterCheckingForBodySelection;
extUtils.getOffsetsAfterBubblingUpTree = extUtils_getOffsetsAfterBubblingUpTree;
extUtils.isPartOfLockedContent = extUtils_isPartOfLockedContent;
extUtils.isOKToBubbleThroughTag = extUtils_isOKToBubbleThroughTag;
extUtils.stripWhiteSpace = extUtils_stripWhiteSpace;

// Private class data members
// (Currently all used in extUtils_processExtDataText)
extUtils.STR_DELIM_DIRECTIVE_END   = "@>";
extUtils.STR_DELIM_DIRECTIVE_BEGIN = "<@";
extUtils.STR_DELIM_PARAM_BEGIN     = "@@";
extUtils.STR_DELIM_PARAM_END       = "@@";
extUtils.REGEXP_DELIMETERS         = new RegExp(extUtils.STR_DELIM_DIRECTIVE_BEGIN + "|" + extUtils.STR_DELIM_PARAM_BEGIN);
extUtils.REGEXP_PARAM              = new RegExp(extUtils.STR_DELIM_PARAM_BEGIN + "(\\w+)" + extUtils.STR_DELIM_PARAM_END, "g");

// Directives
extUtils.DIRECTIVE_IF      = "if";
extUtils.DIRECTIVE_ELSEIF  = "elseif";
extUtils.DIRECTIVE_ELSE    = "else";
extUtils.DIRECTIVE_ENDIF   = "endif";
extUtils.DIRECTIVE_LOOP    = "loop";
extUtils.DIRECTIVE_ENDLOOP = "endloop";

extUtils.RAW_CODE = "text";
extUtils.PARAMETER = "parameter";

// Directive syntax patterns
extUtils.REGEXP_IF      = new RegExp(  extUtils.STR_DELIM_DIRECTIVE_BEGIN + "\\s*if\\s*\\((\\s*\\S+[\\s\\S]*)\\)\\s*"
                                     + extUtils.STR_DELIM_DIRECTIVE_END);
extUtils.REGEXP_ELSEIF  = new RegExp(  extUtils.STR_DELIM_DIRECTIVE_BEGIN + "\\s*elseif\\s*\\((\\s*\\S+[\\s\\S]*)\\)\\s*"
                                     + extUtils.STR_DELIM_DIRECTIVE_END);
extUtils.REGEXP_ELSE    = new RegExp(extUtils.STR_DELIM_DIRECTIVE_BEGIN + "\\s*else\\s*" + extUtils.STR_DELIM_DIRECTIVE_END);
extUtils.REGEXP_ENDIF   = new RegExp(extUtils.STR_DELIM_DIRECTIVE_BEGIN + "\\s*endif\\s*" + extUtils.STR_DELIM_DIRECTIVE_END);
extUtils.REGEXP_LOOP    = new RegExp(  extUtils.STR_DELIM_DIRECTIVE_BEGIN + "\\s*loop\\s*\\((\\s*" + extUtils.REGEXP_PARAM.source
                                     + "\\s*,)*?\\s*" + extUtils.REGEXP_PARAM.source + "\\s*\\)\\s*" + extUtils.STR_DELIM_DIRECTIVE_END);
extUtils.REGEXP_ENDLOOP = new RegExp(extUtils.STR_DELIM_DIRECTIVE_BEGIN + "\\s*endloop\\s*" + extUtils.STR_DELIM_DIRECTIVE_END);
// Pattern for unrecognized directive. Careful not too match '<@@param1@@' or '@@param2@@>' since those
//  are valid uses of the begin and end directive strings.
extUtils.REGEXP_NONE    = new RegExp(extUtils.STR_DELIM_DIRECTIVE_BEGIN + "[^@][\\s\\S]*?[^@]" + extUtils.STR_DELIM_DIRECTIVE_END);

extUtils.STR_FTN_PARAM = "paramObj";
extUtils.STR_FTN_NAME  = "_MManonymous";


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.getTagSelection
//
// DESCRIPTION:
//   Find out if a tag is selected and return an arrray
//   (tagName, nth occurence of tagName)
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   array - (tagName, nth occurence of tagName)
//--------------------------------------------------------------------
function extUtils_getTagSelection()
{
  var tagSelection = null;
  var tagName = null;
  var tagIndex = -1;

  dw.useTranslatedSource(true);

  var dom = dw.getDocumentDOM();

  curSelection = dom.getSelection();
  
  if( !curSelection || curSelection.length < 1 ) {
	return tagSelection;
  }

  var node = dw.offsetsToNode(curSelection[0], curSelection[0]);

  if (node.nodeType == Node.ELEMENT_NODE)
  {
    tagName = node.tagName;
    if (tagName.toUpperCase() == "MM:BEGINLOCK")
    {
      tagName = null;
      var siblings = node.parentNode.childNodes;
      for (i=0; i<siblings.length; i++)
      {
        if (siblings[i] == node)
        {
          if (node.nodeType == node.ELEMENT_NODE)
          {
            node = siblings[i+1];
            tagName = node.tagName;
            break;
          }
        }
      }
    }
    if (tagName)
    {
      var tags = dom.getElementsByTagName(tagName);
      for (j=0; j<tags.length; j++)
      {
        if (tags[j] == node)
        {
          tagIndex = j;
        }
      }
    }
  }

  dw.useTranslatedSource(false);

  if (tagIndex != -1)
  {
    tagSelection = new Array(tagName, tagIndex);
  }

  return tagSelection;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.setTagSelection
//
// DESCRIPTION:
//   select the nth occurence of the specfied tag
//
// ARGUMENTS:
//   tagSelection - array - the value returned from the function above
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function extUtils_setTagSelection(tagSelection)
{
  var tagName = tagSelection[0];
  var tagIndex = tagSelection[1];

  dw.useTranslatedSource(true);

  var dom = dw.getDocumentDOM();

  var tags = dom.getElementsByTagName(tagName);

  if (tags.length > tagIndex)
  {
    node = tags[tagIndex];
    offsets = dwscripts.getNodeOffsets(node);
    dw.setSelection(offsets[0], offsets[1]);
  }

  dw.useTranslatedSource(false);
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.isBlockTag
//
// DESCRIPTION:
//   This function determines if a given node is a block tag,
//   with an end block </tag>.
//
// ARGUMENTS:
//   node - a DOM pointer
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function extUtils_isBlockTag(node)
{
  var retVal = false;

  if (node && node.nodeType == Node.ELEMENT_NODE)
  {
    var nodeHTML = dwscripts.getOuterHTML(node);

    if (nodeHTML)
    {
      var tagName = dwscripts.getTagName(node);
      retVal = (nodeHTML.search(RegExp("<\\/"+tagName,"i")) != -1);
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.isCollapsibleTag
//
// DESCRIPTION:
//   Returns true if the given tag is one of the tags in the list below.
//
// ARGUMENTS:
//   theTag - string - the tag to check
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function extUtils_isCollapsibleTag(theTag)
{
  var retVal = false;

  var collapsibleTagNames = " P H1 H2 H3 H4 H5 H6 PRE BLOCKQUOTE TD TH DT DD CAPTION ";

  var upperTag = theTag.toString().toUpperCase();

  retVal = (collapsibleTagNames.indexOf(" "+upperTag+" ") != -1);

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.getWeightNum
//
// DESCRIPTION:
//   Converts "aboveHTML+20" to just 20. Does nothing if weight is
//   already a number.
//
// ARGUMENTS:
//   weight - string - the weight value to get the number from
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------
function extUtils_getWeightNum(weight)
{
  if (typeof weight == "string")
  {
    var pos = weight.indexOf("+");
    weight = parseInt((pos > 0)? weight.substring(pos+1) : weight);
  }

  return weight;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.findAttributePosition
//
// DESCRIPTION:
//   Given a node to search and an attribute name (or position),
//   locates the absolute character position of the attribute value.
//   Useful if you want to insert or delete attributes using strings.
//   For example, given
//     <form method="post" action="foo.htm">
//   calling findAttributePosition(formNode, "ACTION") will return
//   the character position of value foo.htm.
//   If the attribute does not exist, returns null.
//   Otherwise, returns 2-member array (like dom.getSelection())
//   where arr[0] is the start position and arr[1] is the end position
//   of the value of the attribute.
//   If nodeRelative is true, the returned offsets are relative to
//   the given node.  If false, the offsets are relative to the document.
//
// ARGUMENTS:
//   node      - a DOM pointer to the tag to search
//   attrName  - attribute name to search for (case insensitive),
//     or position in the form of nn,nn
//   getEntirePos - (optional) if true, returns position of full
//     'someattrib="value"'  By default, it's false and the function
//      returns the position of the value
//   nodeRelative - boolean - set to true if the offsets should be
//     returned relative to the given node.  If false, document relative
//     offsets will be returned.
//
// RETURNS:
//   array of integer - 2 offset values
//--------------------------------------------------------------------
function extUtils_findAttributePosition(node, attrName, getEntirePos, nodeRelative)
{
  var attrPosition = null, offsets;
  var tagStartPos;
  var dom = dw.getDocumentDOM();
  var tagStr = dwscripts.getOuterHTML(node);               //get tag string
  var nodeOffsets = dwscripts.getNodeOffsets(node);

  //if attrName is actually a relative position "nn,nn", find absolute location
  if (attrName.indexOf(",") > 0) //if weight is positioned nodeAttribute+nn,nn
  {
    offsets = attrName.split(",");
    if (offsets.length == 2)
    {
      tagStartPos = (nodeRelative) ? 0 : nodeOffsets[0];
      attrPosition = new Array();
      attrPosition[0] = tagStartPos + parseInt(offsets[0]); //change relative offsets to absolute
      attrPosition[1] = tagStartPos + parseInt(offsets[1]); //change relative offsets to absolute
    }
  }
  //if attrName is *, find position of all attributes (<div????????????????>), used by delete
  else if (attrName.indexOf("*")!=-1 && tagStr && tagStr.charAt(0) == "<")
  {
    tagStartPos = (nodeRelative) ? 0 : nodeOffsets[0];

    var parameters = tagStr.match(/<[^<>\s]+/);
    if (parameters) //if found tag name
    {
       var startPos = parameters[0].length;
       var outerLength = tagStr.length;
       var innerLength = dwscripts.getInnerHTML(node).length;
       var closeTagPos = tagStr.lastIndexOf("</");
       if (closeTagPos > 0)
       {
         attrPosition = new Array();
         attrPosition[0] = tagStartPos + startPos; //step past open tagchange relative offsets to absolute
         attrPosition[1] = (tagStartPos + closeTagPos) - (innerLength + 1); //position of > in open tag
       }
    }
  }
  //if attrName is an attribute name, find it if it exists
  else
  {
    //search for attribute assignment: ' attrName="'
    var attrMatch = tagStr.match(RegExp(" "+attrName+"\\s*=\\s*(['\"])?","i")); //quote is optional
    if (node.tagName == "MM:BEGINLOCK"){
      node = new TagEdit(dwscripts.getOuterHTML(node));
    }
    //DEBUG  alert("attrMatch = " + attrMatch + "\nnode.getAttribute(attrName) = " + node.getAttribute(attrName));
    // Note that attrMatch may have matched the like-named attribute of an inner tag.
    //   So do a check on 'node[attrName] != null' to make sure we matched within
    //   the outer tag.
    if (attrMatch && node.getAttribute(attrName) != null)  //if attrib found
    {
      //DEBUG alert("attrMatch[0] = " + attrMatch[0] + "\nattrMatch[1] = " + attrMatch[1]);
      var theQuote = attrMatch[1];
      
      var theValue = node.getAttribute(attrName);

      // check to make sure the newlines returned are correct and
      //  fix them if they are wrong
      var newLineSetting = dwscripts.getNewline();
      var currNewLine = dwscripts.getNewlineFromString(theValue);
      if (newLineSetting != currNewLine)
      {
        theValue = theValue.replace(new RegExp(dwscripts.escRegExpChars(currNewLine),"ig"), newLineSetting);
      }
      
      //determine start and end position of attribute assignment
      attrPosition = new Array();
      attrPosition[0] = attrMatch.index; //start at beginning: 'attrib="value"'
      if (!getEntirePos) //but if only finding the value part
      {
        attrPosition[0] += attrMatch[0].length; //start at value part
      }
      attrPosition[1] = attrMatch.index + attrMatch[0].length + theValue.length; //end after value

      if (getEntirePos && theQuote)
      {
        attrPosition[1]++; //step past close quote if quoted and getting entire pos
      }

      //change position from node relative to document relative
      tagStartPos = (nodeRelative) ? 0 : nodeOffsets[0];
      attrPosition[0] += tagStartPos;   //change relative offsets to absolute
      attrPosition[1] += tagStartPos;
    }
  }

  return attrPosition;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.isDependentNodeSegment
//
// DESCRIPTION:
//   This function returns true if more than one reference to the current
//   node segment is found.  If countFamilyAsOne is true, references
//   within the same family of server behaviors are only counted once.
//
// ARGUMENTS:
//   nodeSeg - the node segment to check
//   countFamilyAsOne - check the family attribute of the ServerBehavior, to see if
//     multiple references to the same node segment are all part of the
//     same family.
//
// RETURNS:
//   boolean - returns true if there is more than one reference to the
//             current node segment
//--------------------------------------------------------------------
function extUtils_isDependentNodeSegment(nodeSeg, countFamilyAsOne)
{
  var retVal = false;

  var num = 0; family = '';
  var sbList = dw.serverBehaviorInspector.getServerBehaviors();
  var sbPartList = null; // SBParticipant list

  for (var i=0; !retVal && i < sbList.length; i++) //search all ServerBehaviors
  {
    if (sbList[i].getParticipants)
    {
      sbPartList = sbList[i].getParticipants();
      for (j=0; !retVal && j < sbPartList.length; j++)  //scan SB participantNames
      {
        var ns = sbPartList[j].getNodeSegment();
        if (ns.equals(nodeSeg))
        {
          if (countFamilyAsOne && num > 0)
          {
            if (!sbList[i].getFamily() || sbList[i].getFamily() != family)
            {
              num++;
            }
          }
          else
          {
            num++;
            if (countFamilyAsOne && sbList[i].getFamily())
            {
              family = sbList[i].getFamily();
            }
          }
          if (num > 1)
          {
            retVal = true;
          }
          break; //only count one reference per ServerBehavior
        }
      }
    }
    else
    { // Handle UD1 and UD4 Server Behavior objects
      var parts = sbList[i].participants;
      for (j=0; !retVal && j < parts.length; j++) {    //scan ssRec participantNames
        if (parts[j] == nodeSeg.node) {
          if (countFamilyAsOne && num > 0) {
            if (!sbList[i].family || sbList[i].family != family) {
              num++;
            }
          } else {
            num++;
            if (countFamilyAsOne && sbList[i].family) {
              family = sbList[i].family;
            }
          }
          if (num > 1) {
            retVal = true;
          }
          break; //only count one reference per ssRec
        }
      }
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.onlyFamilyReferences
//
// DESCRIPTION:
//   This function returns true if only family references point to a
//   given node segment.  If any references are not part of the family,
//   then false is returned.
//
// ARGUMENTS:
//   nodeSegment - the node segment to check
//   familyName - (optional) the family name to check for
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function extUtils_onlyFamilyReferences(nodeSegment, familyName)
{
  var retVal = false;
  var family = '';
  var onlyFamRefs = true;
  var sbList = dw.serverBehaviorInspector.getServerBehaviors();
  var sbPartList = null; //SBParticipant list

  for (var i=0; onlyFamRefs && i < sbList.length; i++) //search all ServerBehaviors
  {
    if (sbList[i].getParticipants)
    {
      sbPartList = sbList[i].getParticipants();
      for (j=0; onlyFamRefs && j < sbPartList.length; j++) //scan SB participantNames
      {
        var ns = sbPartList[j].getNodeSegment();
        if (ns.equals(nodeSegment))
        {
          if (!sbList[i].getFamily())
          {
            //no family, return false
            onlyFamRefs = false;
            break;
          }
          else if (!family)
          {
            family = sbList[i].getFamily();
          }
          else if (sbList[i].getFamily() != family)
          {
            onlyFamRefs = false;
            break;
          }
        }
      }
    }
    else
    { // Handle UD1 and UD4 Server Behavior objects
      var parts = sbList[i].participants;
      for (j=0; onlyFamRefs && j < parts.length; j++) {    //scan ssRec participantNames
        if (parts[j] == nodeSegment.node) {
          if (!sbList[i].family) {
            //no family, return false
            onlyFamRefs = false;
            break;
          } else if (!family) {
            family = sbList[i].family;
          } else if (sbList[i].family != family) {
            onlyFamRefs = false;
            break;
          }
        }
      }
    }
  }

  //return true if onlyFamRefs is true, and a family value has been set
  retVal = (onlyFamRefs && family && (!familyName || familyName == family));

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.replaceParamsInStr
//
// DESCRIPTION:
//   This function replaces all occurrences of @@paramName@@ within a string,
//   using values from a javaScript object. The object must have each name
//   as a property. For example, values of obj.rs and obj.col will be used
//   to update @@rs@@ and @@col@@ in a string.
//
// ARGUMENTS:
//   theString - any string that may contain parameters @@paramName@@
//   paramObj  - a javaScript object with properties that match each paramName
//
// RETURNS:
//   a string with the parameters replaced with real values
//--------------------------------------------------------------------
function extUtils_replaceParamsInStr(theStr, paramObj)
{
  if (typeof theStr == "string" && theStr.length)
  {
    // Only process the string for directives or parameters if they exist
    if (theStr.indexOf(extUtils.STR_DELIM_DIRECTIVE_BEGIN) != -1)
    {
      theStr = extUtils.processExtDataText(theStr, paramObj);
    }
    else if (theStr.indexOf("@@") != -1)
    {
      for (var i in paramObj) //walk through parameters
      {
        if (theStr.indexOf("@@"+i+"@@") != -1) //if param found, replace it
        {
          theStr = theStr.replace(RegExp("@@"+i+"@@","g"), paramObj[i]);
        }
      }
    }
  }

  return theStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.replaceValuesInNodeSegment
//
// DESCRIPTION:
//   Replaces values within a given node using the updatePatterns,
//   and the new values passed in paramObj.
//   Adds support for the limitSearch attribute (only limitSearch="innerOnly").
//
// ARGUMENTS:
//   nodeSeg        - the node segment to update
//   updatePatterns - the regular expressions to use for making replacements
//   paramObj       - the new values to insert in the string
//
// RETURNS:
//   the updated string
//--------------------------------------------------------------------
function extUtils_replaceValuesInNodeSegment(nodeSeg, updatePatterns, paramObj)
{
  var retVal = '';
  var theNode = nodeSeg.node;
  var theStr = extUtils.convertNodeToString(theNode);

  if (typeof theStr == "string" && theStr.length && theNode.outerHTML)
  {
    var innerLength = dwscripts.getInnerHTML(theNode).length;
    var closeTagPos = dwscripts.getOuterHTML(theNode).lastIndexOf("</");
    var innerStart = closeTagPos - innerLength;
    var tagStart  = theStr.substring(0,innerStart);
    var tagInner  = theStr.substring(innerStart,closeTagPos);
    var tagEnd    = theStr.substring(closeTagPos);
    for (var i=0; i < updatePatterns.length; i++)
    {
      var limitSearch = updatePatterns[i].limitSearch;
      var newParamValue = paramObj[updatePatterns[i].paramName];
      if (updatePatterns[i].pattern)  //if there is a pattern, use it to update
      {
        var pattern = eval(updatePatterns[i].pattern);
        if (!limitSearch || limitSearch == "tagOnly")
        {
          tagStart = extUtils.safeReplaceBetweenSubExpressions(tagStart, pattern, newParamValue);
        }
        if (!limitSearch || limitSearch == "innerOnly")
        {
          var localBeginOffset = nodeSeg.matchRangeMin - innerStart;
          var localEndOffset = nodeSeg.matchRangeMax - innerStart;
          if (localBeginOffset >= 0 && localBeginOffset < localEndOffset && localEndOffset < innerLength)
          {
            var tinyString = tagInner.substring(localBeginOffset, localEndOffset);
            tinyString = extUtils.safeReplaceBetweenSubExpressions(tinyString, pattern, newParamValue);
            tagInner = tagInner.substring(0,localBeginOffset) + tinyString + tagInner.substring(localEndOffset);
          }
          else
          {
            tagInner = extUtils.safeReplaceBetweenSubExpressions(tagInner, pattern, newParamValue);
          }
        }
        if (!limitSearch)
        {
          tagEnd   = extUtils.safeReplaceBetweenSubExpressions(tagEnd  , pattern, newParamValue);
        }
      }
      else
      {
        if (limitSearch == "innerOnly") //innerOnly update pattern, so blow away inner
        {
          tagInner = newParamValue;
        }
        else if (limitSearch == "tagOnly") //tag update pattern, so blow away inner
        {
          tagStart = newParamValue;
        }
        else if (!limitSearch) //no update pattern, so blow away whole thing
        {
          tagStart = newParamValue;
          tagInner = "";
          tagEnd   = "";
        }
      }
    }
    retVal = tagStart + tagInner + tagEnd;
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.replaceValuesInString
//
// DESCRIPTION:
//   Replaces values within a given string using the updatePatterns,
//   and the new values passed in paramObj.
//
// ARGUMENTS:
//   theStr         - the string to update
//   updatePatterns - the regular expressions to use for making replacements
//   paramObj       - the new values to insert in the string
//
// RETURNS:
//   the updated string
//--------------------------------------------------------------------
function extUtils_replaceValuesInString(theStr, updatePatterns, paramObj)
{
  var retVal = '';

  if (typeof theStr == "string" && theStr.length)
  {
    retVal = theStr;
    for (var i=0; i < updatePatterns.length; i++)
    {
      if (updatePatterns[i].pattern)  //if there is a pattern
      {
        pattern = eval(updatePatterns[i].pattern);
        retVal = extUtils.safeReplaceBetweenSubExpressions(retVal, pattern, paramObj[updatePatterns[i].paramName]);
      }
      else
      {
        retVal = paramObj[updatePatterns[i].paramName]; //replace entire string
      }
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.safeReplaceBetweenSubExpressions
//
// DESCRIPTION:
//   Replaces pattern between sub-expressions with a new value, such as:
//     (prePattern)pattern(postPattern)
//   Finds all occurrences and replaces it safely (using replace() fails
//   if the newValue is a number.
//
// ARGUMENTS:
//   theStr         - the string to update
//   regExpStr      - a regular expression (not a string!)
//   newValue       - the string to replace it with
//
// RETURNS:
//   the updated string
//--------------------------------------------------------------------
function extUtils_safeReplaceBetweenSubExpressions(theStr, regExpPattern, newValue)
{
  if (newValue != null)
  {
    var result;
    var attributes = "g" + ((regExpPattern.ignoreCase) ? "i" : "");
    var globalPattern = new RegExp(regExpPattern.source,attributes);

    while ((result = globalPattern.exec(theStr)) != null)
    {
      var newLength = theStr.length;
      theStr = theStr.substring(0, result.index) +
               result[1] + newValue + result[2] +
               theStr.substring(result.index + result[0].length);
      globalPattern.lastIndex += theStr.length - newLength;
    }
  }

  return theStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.parametersMatch
//
// DESCRIPTION:
//   Checks if the two sets of parameters match.  If bMatchExactly is
//   FALSE, Only parameters which both sets have in common are checked.
//   Also, if they have no parameters in common, true is returned.
//
// ARGUMENTS:
//   params1 - the first parameter object
//   params2 - the second parameter object
//   paramsToMatch - an optional list of parameter names to use
//     in checking if the objects match.  If this parameter is
//     not provided, then all of the properties in the params1
//     array will be used
//
// RETURNS:
//   boolean - true if all common parameters match
//--------------------------------------------------------------------
function extUtils_parametersMatch(params1, params2, paramsToMatchArg)
{
  var retVal = true;
  var paramsToMatch = paramsToMatchArg;

  if (!paramsToMatch && params1 != null)
  {
    paramsToMatch = new Array();
    for (var param in params1)
    {
      paramsToMatch.push(param);
    }
  }

  // Check that common properties have the same value
  if (params1 != null && params2 != null && paramsToMatch.length > 0) {
    //check if the parameters match
    for (var i=0; i < paramsToMatch.length; i++)
    {
      var param = paramsToMatch[i];

      // Parameters beginning with 'MM_' are excluded from the comparison. Such
      //   parameters are used internally and are not part of the Server Behavior's
      //   actualy parameter list.
      if (param && param.indexOf('MM_') != 0)
      {
        if (params2[param] != null  &&
            params2[param] != params1[param])
        {
          // The parameters could still be equivalent if both arrays
          retVal = (   typeof params2[param] == "object" && params2[param].length
                    && typeof params1[param] == "object" && params1[param].length
                    && params2[param].length == params1[param].length
                   );
          if (retVal)
          {
            // Make copies of the parameter arrays so that we don't update them
            // in place.
            var tmpParams2 = params2[param].slice(0);
            var tmpParams1 = params1[param].slice(0);
            tmpParams2.sort();
            tmpParams1.sort();
            for (var j = 0; retVal && j < tmpParams2.length; ++j)
            {
              if (tmpParams2[j] != tmpParams1[j])
                retVal = false;
            }
          }

          //if any parameter doesn't match, break
          if (!retVal)
            break;
        }
      }
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.findPatternsInString
//
// DESCRIPTION:
//   This function looks for patterns within a string. If there are no patterns,
//   or all patterns are found, returns the position of the last pattern found
//   (which is equivalent to "true"). Otherwise returns null.
//
// ARGUMENTS:
//   nodeStr        - a string, usually derived from a node elsewhere
//   quickSearch    - a string to quickly test if we have a possible match
//   searchPatterns - an array of patterns. If a pattern starts with /,
//                    it is used as a regular expression.
//   findMultiple   - match the search patterns multiple times within the
//                    given string
//
// RETURNS:
//   an array containing two numbers: the start and end offset position of the
//   last pattern found (if all found), otherwise null.
//--------------------------------------------------------------------
function extUtils_findPatternsInString(nodeStr, quickSearch, searchPatterns, findMultiple)
{
  var pos = null;

  //if something to search and quick search matches (or is empty)
  // Note that the quickSearch is NOT case sensitive
  if (   nodeStr && quickSearch!=null
      && (nodeStr.toUpperCase().indexOf(quickSearch.toUpperCase()) != -1
      || !quickSearch)
     )
  {
    //pos is 0 if there are no patterns (returns true)
    var pos = new Array(0,0);

    // Build up a nodeInfo object which stores off the innerHTML, begin tag string,
    //   and attribute values. This is useful for patterns that have
    //   the limitSearch property defined.
    var callback = new Object();
    callback.tagCount = 0;
    callback.tagStart = -1
    callback.innerStart = -1;
    callback.innerEnd = -1;
    callback.attributes = new Object();
    callback.openTagBegin = new Function("tag,offset","if (this.tagCount == 0) { this.tagStart = offset;}");
    callback.attribute = new Function("name,val", "if (this.tagCount == 0) { this.attributes[name] = val;}");
    callback.openTagEnd = new Function("offset","if (this.tagCount == 0) { this.innerStart = offset; } this.tagCount++;");
    callback.closeTagBegin = new Function("tag,offset"," this.innerEnd = offset");

    dw.scanSourceString(nodeStr, callback);

    var nodeInfo = new Object();
    nodeInfo.outerHTML = nodeStr;
    nodeInfo.tagOnly = nodeStr.substring(callback.tagStart, callback.innerStart);
    nodeInfo.attributes = callback.attributes;
    nodeInfo.innerHTML = nodeStr.substring(callback.innerStart, callback.innerEnd);

    //Tries each pattern. If patterns exist and any
    //patterns are not found, breaks and returns null.
    //Otherwise remembers position of last match (used for "nodeAttribute" insertLocation).
    for (var i=0; i < searchPatterns.length; i++)
    {
      //get the search pattern
      var pattern = searchPatterns[i].pattern;
      var isOptional = (searchPatterns[i].isOptional == "true")

      // Limit the string we search over using the limitSearch property.
      var limitSearch = searchPatterns[i].limitSearch;
      var theStr = nodeInfo.outerHTML;
      if (limitSearch)
      {
        if (limitSearch.toUpperCase() == "TAGONLY")
        {
          theStr = nodeInfo.tagOnly;
        }
        else if (limitSearch.toUpperCase() == "INNERONLY")
        {
          theStr = nodeInfo.innerHTML;
        }
        else
        {
          var attrPatt = /attribute\+(\w+)/i;
          var match = attrPatt.exec(limitSearch);
          if (match && match.length > 1 && nodeInfo.attributes[match[1]])
          {
            theStr = nodeInfo.attributes[match[1]];
          }
        }
      }

      //clear any old match information
      searchPatterns[i].match = '';

      //if pattern starts with "/", must be regular expression
      if (pattern.length > 2 && pattern.charAt(0)=="/") //if regular expression, search for that
      {
        pattern = eval(pattern); //convert /string/ to regular expression

        if (!findMultiple)
        {
          var match = theStr.match(pattern); //search for it as RegExp
          if (match)
          {
            pos[0] = match.index; //remember position
            pos[1] = pos[0]+match[0].length;
            searchPatterns[i].match = match;
          }
          else
          {
            if (!isOptional)
            {
              pos = null;
              break;
            }
          }
        }
        else
        {
          var match;
          var attributes = "g" + ((pattern.ignoreCase) ? "i" : "");
          var globalPattern = new RegExp(pattern.source,attributes);
          searchPatterns[i].match = new Array();

          while ( (match = globalPattern.exec(theStr)) != null )
          {
            searchPatterns[i].match.push(match);
          }

          if (searchPatterns[i].match.length == 0)
          {
            if (!isOptional)
            {
              pos = null;
              break;
            }
          }
        }

      //if no "/", do straight search
      }
      else
      {
        var offsetPos = theStr.indexOf(pattern); //search for string with indexOf()
        if (offsetPos != -1)
        {
          pos[0] = offsetPos;
          pos[1] = pos[0]+pattern.length;
        }
        else
        {
          if (!isOptional)
          {
            pos = null;
            break;
          }
        }
      }
    }
  }
  return pos;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.extractParameters
//
// DESCRIPTION:
//   This function takes the list of search patterns passed to the
//   function above, and extracts the parameters from the matched
//   expressions.
//
// ARGUMENTS:
//   searchPatterns - the list of search patterns passed to the
//   findPatternsInString function
//
//
// RETURNS:
//   a parameter object
//--------------------------------------------------------------------
function extUtils_extractParameters(searchPatterns)
{
  var parameters = new Object();

  //find all the parameters in the current participant,
  for (var i=0; i < searchPatterns.length; i++)
  {
    //check if we have parameters and that a match list was created
    if (searchPatterns[i].paramNames && searchPatterns[i].match)
    {
      //get the list of parameters to extract for this pattern
      var paramList = searchPatterns[i].paramNames.split(",");

      //get the match information
      var match = searchPatterns[i].match;
      var isMultiple = (match.length > 0 && typeof match[0] == "object");

      //now, extract the parameters from this pattern
      for (var j=0; j < paramList.length; j++)
      {
        var paramName = paramList[j];

        //skip over blank parameter names
        if (paramName)
        {
          if (!isMultiple)
          {
            if (match.length > j+1)
            {
              parameters[paramName] = match[j+1];
            }
            else
            {
              alert(dwscripts.sprintf(MM.MSG_NoMatchForParameter, paramName));
              parameters[paramName] = "";
            }
          }
          else
          {
            parameters[paramName] = new Array();
            for (var k=0; k < match.length; k++)
            {
              if (match[k].length > j+1)
              {
                parameters[paramName].push(match[k][j+1]);
              }
              else
              {
                alert(errMsg(MM.MSG_NoMatchForParameter, paramName));
                parameters[paramName].push("");
              }
            }
          }
        }
      }
    }
  }

  return parameters;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.convertNodeToString
//
// DESCRIPTION:
//   This function determines what string should be searched in a given node.
//   If the node is locked, we use node.orig.
//   Otherwise we use the string node.outerHTML or node.data.
//
// ARGUMENTS:
//   node        - a DOM pointer
//
// RETURNS:
//   the string to search
//--------------------------------------------------------------------
function extUtils_convertNodeToString(node)
{
  // NOTE: This function should employ some sort of caching mechanism
  var nodeStr = "";

  if (!node)
  {
    //do nothing, return blank string
  }
  else
  {
    nodeStr = dwscripts.getOuterHTML(node);

    if (!nodeStr && node.data)
    {
      nodeStr = node.data;   //get just data in the case of comments or text
    }
  }

  return nodeStr;
}


//-----------------------------------------------------------------------------
//  FUNCTION:
//    extUtils.processExtDataText (and helper code)
//
//  DESCRIPTION:
//    Before inserting a participant's text into the document, we must resolve
//    all parameters and directives. extUtils.processExtDataText() parses through the insert text
//    block building up a list of runtime code elements: text, directives and parameters.
//    After the parse stage, it builds up a JavaScript function body whose evaluation generates
//    the text block to insert. For example, given the following insertText block
//      <CFSTOREDPROC procedure="@@proc@@">
//      <@loop (@@var0@@, @@val@@, @@type@@)@>
//      <CFPROCPARAM type="IN" dbvarname="@@var0@@" value="@@val@@" cfsqltype="@@type@@">
//      <@endloop@>
//      <@if (@@procRes@@ != '') @>
//      <CFPROCRESULT name="@@procRes@@">
//      <@ endif @>
//      </CFSTOREDPROC>
//
//    will result in the following JS function being built
//
//      function anonymous(paramObj) {
//          var _arr = new Array();
//          var _i = 0;
//          var _stackBuiltIns = new Array();
//          _arr[_i++] = "<CFSTOREDPROC procedure=\"";
//          _arr[_i++] = paramObj.proc;
//          _arr[_i++] = "\">";
//          _stackBuiltIns[0] = {_length: 2, _index: 0};
//          with (_stackBuiltIns[0]) {
//            for (; _index < _length; ++_index) {
//                _arr[_i++] = "<CFPROCPARAM type=\"IN\" dbvarname=\"";
//                _arr[_i++] = paramObj.var0[_index];
//                _arr[_i++] = "\" value=\"";
//                _arr[_i++] = paramObj.val[_index];
//                _arr[_i++] = "\" cfsqltype=\"";
//                _arr[_i++] = paramObj.type[_index];
//              _ arr[_i++] = "\">";
//            }
//          }
//          if (paramObj.procRes != "") {
//              _arr[_i++] = "<CFPROCRESULT name=\"";
//              _arr[_i++] = paramObj.procRes;
//              _arr[_i++] = "\">";
//         }
//          _arr[_i++] = "</CFSTOREDPROC>";
//          return _arr.join("");
//      }
//
//  ARGUMENTS:
//    insertText - the insert text block from the extension data
//    paramObj - parameter object from the SB dialog
//
//  RETURNS:
//    processed insert text
//
//  THROWS:
//    ProcInsTextException
//-----------------------------------------------------------------------------
function extUtils_processExtDataText(rawInsertText, paramObj)
{
  // Stack to keep track of nested directives.
  var directiveStack = new Array();
  // Stack to track runtime code elements.
  var rtcElements = new Array();
  var indexEndDelim = 0;
  var strDirectiveSlice = "";
  var prevDirective = "";

  // Parse the raw insert text from extension data. Build up the set of runtime code
  //   elements (text, directives and parameters) that we find.
  while (rawInsertText.length > 0)
  {
    if (rawInsertText.indexOf(extUtils.STR_DELIM_DIRECTIVE_BEGIN) == 0)
    {
      // Found the beginning of directive. If we find an ending directive, parse the directive.
      //  Otherwise, assume it should be included as part of the insert text. This (mostly)
      //  handles the case in which user is using one of our delimeters for something else.
      //  To include the directive delimeter as part of text, mark only the next character
      //  processed.
      strDirectiveSlice = extUtils.STR_DELIM_DIRECTIVE_BEGIN.charAt(0);
      indexEndDelim = rawInsertText.indexOf(extUtils.STR_DELIM_DIRECTIVE_END);
      if (indexEndDelim != -1)
      {
        strDirectiveSlice = rawInsertText.slice(0, indexEndDelim + extUtils.STR_DELIM_DIRECTIVE_END.length);

        if (extUtils.REGEXP_IF.exec(strDirectiveSlice))
        {
          directiveStack.push(extUtils.DIRECTIVE_IF);
          rtcElements.push(new RTCElement(extUtils.DIRECTIVE_IF, RegExp.$1));
        }
        else if (extUtils.REGEXP_ELSEIF.exec(strDirectiveSlice))
        {
          if (directiveStack.pop() == extUtils.DIRECTIVE_IF)
          {
            directiveStack.push(extUtils.DIRECTIVE_IF);
            rtcElements.push(new RTCElement(extUtils.DIRECTIVE_ELSEIF, RegExp.$1));
          }
          else
            throw new ProcInsTextException(ProcInsTextException.ERR_MISPLACED_ELSEIF);
        }
        else if (extUtils.REGEXP_ELSE.exec(strDirectiveSlice))
        {
          if (directiveStack.pop() == extUtils.DIRECTIVE_IF)
          {
            directiveStack.push(extUtils.DIRECTIVE_ELSE);
            rtcElements.push(new RTCElement(extUtils.DIRECTIVE_ELSE, ""));
          }
          else
            throw new ProcInsTextException(ProcInsTextException.ERR_MISPLACED_ELSE);
        }
        else if (extUtils.REGEXP_ENDIF.exec(strDirectiveSlice))
        {
          prevDirective = directiveStack.pop();
          if (prevDirective == extUtils.DIRECTIVE_IF || prevDirective == extUtils.DIRECTIVE_ELSE)
            rtcElements.push(new RTCElement(extUtils.DIRECTIVE_ENDIF, ""));
          else
            throw new ProcInsTextException(ProcInsTextException.ERR_MISPLACED_ENDIF);
        }
        else if (extUtils.REGEXP_LOOP.exec(strDirectiveSlice))
        {
          if (directiveStack.join().indexOf(extUtils.DIRECTIVE_LOOP) == -1)
          {
            directiveStack.push(extUtils.DIRECTIVE_LOOP);

            // Check that loop directive parameters are arrays and have same length.
            //  Collect them in a new array.
            var arrLength = -1;
            var loopParams = new Array();
            try
            {
              while(extUtils.REGEXP_PARAM.exec(strDirectiveSlice))
              {
                // If parameter is not an array, throw error. We'll accept
                //   null parameters as an array of length 0.
                if (    paramObj[RegExp.$1] == null
                     || (   paramObj[RegExp.$1]
                         && (typeof paramObj[RegExp.$1] == "object")
                         && paramObj[RegExp.$1].length != null
                        )
                   )
                {
                  // If array is not same length of others, throw error.
                  if (   (arrLength == -1)
                      || (paramObj[RegExp.$1] && (arrLength == paramObj[RegExp.$1].length))
                      || ((arrLength == 0) && (paramObj[RegExp.$1] == null))
                     )
                  {
                    arrLength = (paramObj[RegExp.$1]) ? paramObj[RegExp.$1].length : 0;
                    // Collect loop parameters to store in the runtime code element for the loop.
                    loopParams.push(RegExp.$1);
                  }
                  else
                    throw new ProcInsTextException(ProcInsTextException.ERR_LOOP_PARAMS_DIFF_LEN, RegExp.$1);
                }
                else
                  throw new ProcInsTextException(ProcInsTextException.ERR_LOOP_PARAM_NOT_ARRAY, RegExp.$1);
              }
            }
            finally
            {
              // Must reset lastIndex. Requirement of RegExp when exec() global pattern.
              extUtils.REGEXP_PARAM.lastIndex = 0;
            }

            if (arrLength == -1)
            {
              throw new ProcInsTextException(ProcInsTextException.ERR_LOOP_HAS_NO_PARAMS);
            }

            // Push loop element on rtcElement list. Store loop parameters as a ','
            //   delimited string.
            rtcElements.push(new RTCElement(extUtils.DIRECTIVE_LOOP, loopParams.join(",")));
          }
          else
            throw new ProcInsTextException(ProcInsTextException.ERR_MISPLACED_LOOP);
        }
        else if (extUtils.REGEXP_ENDLOOP.exec(strDirectiveSlice))
        {
          if (directiveStack.pop() == extUtils.DIRECTIVE_LOOP)
          {
            rtcElements.push(new RTCElement(extUtils.DIRECTIVE_ENDLOOP, ""));
          }
          else
            throw new ProcInsTextException(ProcInsTextException.ERR_MISPLACED_ENDLOOP);
        }
        else if (extUtils.REGEXP_NONE.exec(strDirectiveSlice))
        {
          // If used our directives in manner we expect, but we can't recognize them
          //  throw an error.
          throw new ProcInsTextException(ProcInsTextException.ERR_UNRECOGNIZED_DIRECTIVE,
                                         strDirectiveSlice);
        }
        else
        {
          // We didn't find one of the defined directives. Mark the delimeter
          // as processed.
          strDirectiveSlice = extUtils.STR_DELIM_DIRECTIVE_BEGIN.charAt(0);
        }
      }

      // Strip off the processed portion of the raw insert text.
      rawInsertText = rawInsertText.slice(strDirectiveSlice.length);

      // If we didn't find one of the defined directives, consider the found delimeter
      //  part of the insert text.
      if (strDirectiveSlice == extUtils.STR_DELIM_DIRECTIVE_BEGIN.charAt(0))
      {
        rtcElements.push(new RTCElement(extUtils.RAW_CODE, extUtils.STR_DELIM_DIRECTIVE_BEGIN.charAt(0)));
      }
    }
    else if (rawInsertText.indexOf(extUtils.STR_DELIM_PARAM_BEGIN) == 0)
    {
      // Process a parameter instance.
      // If it's not a parameter instance, consider the found delimeter part of the insert text.
      //  Do this by marking the next character as processed. (Note: only mark next character processed
      //  to handle the case of a full and partial delimeter appearing adjacent in the insert text,
      //  e.g. @@@param@@
      var processedText = extUtils.STR_DELIM_PARAM_BEGIN.charAt(0);

      // If we find a valid parameter, process the whole param.
      if (extUtils.REGEXP_PARAM.exec(rawInsertText) && RegExp.leftContext.length == 0)
      {
        // Note: don't check if this parameter reference is in the paramObj. Later,
        //   we will replace parameter references not in the paramObj with an
        //   empty string.
        processedText = RegExp.lastMatch;
      }

      // Must reset lastIndex. Requirement of RegExp when exec() global pattern.
      extUtils.REGEXP_PARAM.lastIndex = 0;

      // Insert text or parameter runtime code element based on what we processed.
      if (processedText.length == 1)
      {
        rtcElements.push(new RTCElement(extUtils.RAW_CODE, processedText));
      }
      else
      {
        rtcElements.push(new RTCElement(extUtils.PARAMETER, processedText));
      }

      rawInsertText = rawInsertText.slice(processedText.length);
    }
    else
    {
      // Grab all the text up to the next delimeter, if there is one.
      var indexDelim = rawInsertText.search(extUtils.REGEXP_DELIMETERS);
      var textWithoutDelims;
      if (indexDelim != -1)
        textWithoutDelims = rawInsertText.slice(0, indexDelim);
      else
      {
        textWithoutDelims = rawInsertText;
        indexDelim = rawInsertText.length;
      }

      // Add text entry
      rtcElements.push(new RTCElement(extUtils.RAW_CODE, textWithoutDelims));
      rawInsertText = rawInsertText.slice(indexDelim);
    }
  }

  if (directiveStack.length)
  {
    prevDirective = directiveStack.pop();
    if (prevDirective == extUtils.DIRECTIVE_LOOP)
      throw new ProcInsTextException(ProcInsTextException.ERR_UNTERMINATED_LOOP);
    else
      throw new ProcInsTextException(ProcInsTextException.ERR_UNTERMINATED_IF);
  }

  // Post process the generated runtime code elements.
  extUtils.postProcessRTCElements(rtcElements);
  // Given the list of rtc elements, build the code to insert.
  return extUtils.evaluateRTCElements(rtcElements, paramObj);
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.postProcessRTCElements
//
// DESCRIPTION:
//   Perform post procesing step over the runtime code elements found in
//   processExtDataText. Any directives on a line entirely by themselves should
//   eat the trailing newline. For each such directive, strip the beginning
//   newline in the following text element.
//
// ARGUMENTS:
//   rtcElements - array of RTCElement's found in the parse step.
//
// RETURNS:
//   rtcElements - changes to the array parameter are returned to the caller automatically
//     since this parameter is passed by reference.
//--------------------------------------------------------------------
function extUtils_postProcessRTCElements(rtcElements)
{
  // Temp storage for rtcElement
  var tempRtcElm;
  var tempElmStr;
  // Flag describing if next directive is a candidate for trailing newline removal.
  // Begin as true since a directive starting a participant would be on its own line.
  var bCandidateNewlineRemove = true;

  for (var i = 0; i < rtcElements.length; ++i)
  {
    var elmType = rtcElements[i].getElementType();
    var elmStr = rtcElements[i].getElementString();

    switch(elmType)
    {
      case extUtils.RAW_CODE:
        // If there is a newline at the end of the text or if the text block is empty
        //   (perhaps because we already removed the newline earlier in this function),
        //   a successive directive would begin on its own line. Flag it a candidate
        //   for newline removal.
        if (   elmStr.length == 0
            || (   elmStr.length > 0
                && (elmStr.charAt(elmStr.length-1) == '\n' || elmStr.charAt(elmStr.length-1) == '\r')
               )
           )
        {
          bCandidateNewlineRemove = true;
        }
        else
        {
          bCandidateNewlineRemove = false;
        }
        break;
      case extUtils.DIRECTIVE_IF:
      case extUtils.DIRECTIVE_ELSEIF:
      case extUtils.DIRECTIVE_ELSE:
      case extUtils.DIRECTIVE_ENDIF:
      case extUtils.DIRECTIVE_LOOP:
      case extUtils.DIRECTIVE_ENDLOOP:
        // If this directive is a candidate for newline removal, check that the
        //   next element is a text block and remove it's beginning newline.
        if (bCandidateNewlineRemove && (i + 1 < rtcElements.length))
        {
          tempRtcElm = rtcElements[i+1];
          if (tempRtcElm.getElementType() == extUtils.RAW_CODE)
          {
            tempElmStr = tempRtcElm.getElementString();
            var length = tempElmStr.length;
            var tempChar = (length > 0) ? tempElmStr.charAt(0) : '';
            if (tempChar == '\n' || tempChar == '\r')
            {
              // If this insert text was generated on windows, we'll need to strip
              //   '\r\n'. Otherwise, just strip a single '\n' (unix) or '\r' (mac).
              var numCharsToStrip = 1;
              if (tempChar == '\r' && length > 1 && tempElmStr.charAt(1) == '\n')
              {
                numCharsToStrip = 2;
              }
              tempElmStr = tempElmStr.slice(numCharsToStrip);
              tempRtcElm.setElementString(tempElmStr);
            }
          }
        }

        // No chance for successive directive to appear on its own line. Flag
        //   it as NOT a candidate for newline removal.
        bCandidateNewlineRemove = false;
        break;
      case extUtils.PARAMETER:
        // No chance for a successive directive to appear on its own line. Flag
        //   it as NOT a candidate for newline removal.
        bCandidateNewlineRemove = false;
        break;
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.evaluateRTCElements
//
// DESCRIPTION:
//   Steps through the runtime code elements found from parsing the insert text
//   and builds up a JavaScript function body whose evaluation generates the text block to
//   insert. See extUtils.processExtDataText for details.
//
// ARGUMENTS:
//   rtcElements - array of RTCElements. Describes the elements in the insert text
//     for the participant.
//   paramObj - parameter object passed in to the applySB function.
//
// RETURNS:
//   string - processed text ready to drop in document
//--------------------------------------------------------------------

function extUtils_evaluateRTCElements(rtcElements, paramObj)
{
  // Stack to keep track of nested directives.
  var directiveStack = new Array();
  var processedInsText = "";

  // Hash table to match loop parameters with associated nested loop. If we support
  //  nested loops, we have to change the variable used to iterate through nested
  //  loops in the script. Each value of this mapping is a list of variables iterated over
  //  for a given loop. The key of the map denotes the level of nesting of the loop.
  //  For example, key of 1 means the loop has 1 parent loop - it's nested 1 level.
  //  When finding a reference to an array parameter, we look up it's nesting level
  //  in this table to figure out which index to use for it.
  //  Note - we don't currently support nested loops.
  var levelToLoopParams = new Object();
  var nestLevel = 0;

  // Array to store the parameters used in a given loop.
  var loopParams = null;
  // Length of the array parameters used in a given loop.
  var arrLength = 0;

  // Initialize JavaScript function body that will be evaluated to generate the Insert Text.
  //var generateTextFtn;
  var strGenTextFtn = "function "+extUtils.STR_FTN_NAME+"("+extUtils.STR_FTN_PARAM+") { var _arr = new Array();\n"
                    + "var _i = 0;\n"
                    + "var _stackBuiltIns = new Array();\n";

  for (var i = 0; i < rtcElements.length; ++i)
  {
    var elmType = rtcElements[i].getElementType();
    var elmStr = rtcElements[i].getElementString();

    switch(elmType)
    {
      case extUtils.DIRECTIVE_IF:
        directiveStack.push(extUtils.DIRECTIVE_IF);
        strGenTextFtn += "if ("
                      + extUtils.replaceParamsInExprStr(elmStr, paramObj, directiveStack, levelToLoopParams, true)
                      + ") {\n";
        break;
      case extUtils.DIRECTIVE_ELSEIF:
        strGenTextFtn += "}\nelse if ("
                      + extUtils.replaceParamsInExprStr(elmStr, paramObj, directiveStack, levelToLoopParams, true)
                      + ") {\n";
        break;
      case extUtils.DIRECTIVE_ELSE:
        directiveStack.pop();
        directiveStack.push(extUtils.DIRECTIVE_ELSE);
        strGenTextFtn += "}\nelse {\n";
        break;
      case extUtils.DIRECTIVE_ENDIF:
        directiveStack.pop();
        strGenTextFtn += "}\n";
        break;
      case extUtils.DIRECTIVE_LOOP:
        directiveStack.push(extUtils.DIRECTIVE_LOOP);

        // Loop parameters are comma separated in elmStr.
        loopParams = elmStr.split(",");
        // Must be at least one parameter in the loop, so use length of the first.
        //   If the parameter is null, use a length of 0.
        arrLength = (paramObj[loopParams[0]]) ? paramObj[loopParams[0]].length : 0;

        // Add nest level to track parameters used in the current loop.
        levelToLoopParams[nestLevel] = loopParams;

        // Build JS loop to represent the loop directive. Also, push a new set of
        //  builtin variables on the stack for this loop. Make sure the new instance of
        //  builtin variables is used within this loop by using 'with' statement.
        // Note: if we ever have support for nested loops, the _length and _index builtin
        //  variables will refer to the innermost loop's version of these builtins.
        strGenTextFtn +="_stackBuiltIns["+nestLevel+"] = {_length: " + arrLength + ", _index: 0};\n"
                      + "with (_stackBuiltIns["+nestLevel+"]) {\n"
                      + "for (; _index < _length; ++_index) {\n";
        ++nestLevel;
        break;
      case extUtils.DIRECTIVE_ENDLOOP:
        directiveStack.pop();
        strGenTextFtn +="}\n"
                      + "}\n";
        // Remove param list for current nest level.
        --nestLevel;
        levelToLoopParams[nestLevel] = [];
        break;
      case extUtils.PARAMETER:
        strGenTextFtn += "_arr[_i++] = "
                      + extUtils.replaceParamsInExprStr(elmStr, paramObj, directiveStack, levelToLoopParams, false)
                      + ";\n";
        break;
      case extUtils.RAW_CODE:
        // Escape characters that cause trouble inside an explicit string, e.g. "charsToEscape"
        elmStr = elmStr.replace(/("|'|\\)/g, "\\$1");
        elmStr = elmStr.replace(/\n/g, "\\n");
        elmStr = elmStr.replace(/\r/g, "\\r");

        // Add text entry
        strGenTextFtn += "_arr[_i++] = '" + elmStr + "';\n";
        break;
    }
  }

  // Finish off JavaScript function body to generate insert text.
  strGenTextFtn += "return _arr.join('');} "+extUtils.STR_FTN_NAME+"("+extUtils.STR_FTN_PARAM+");";

  try
  {
    // BUG: creating new Function sometimes fails due to memory issues I believe?
    //generateTextFtn = new Function(extUtils.STR_FTN_PARAM, strGenTextFtn);
    //processedInsText = generateTextFtn(paramObj);

    // The function argument 'paramObj' is defined in this scope.
    processedInsText = eval(strGenTextFtn);
  }
  catch (e)
  {
    throw new ProcInsTextException(ProcInsTextException.ERR_COULD_NOT_EVAL_DIRECTIVE, e);
  }

  return processedInsText;
}


//-----------------------------------------------------------------------------
//  FUNCTION:
//    extUtils.replaceParamsInExprStr
//
//  DESCRIPTION:
//    Replaces parameter instances with the paramObject Javascript reference.
//    When the script is evaluated, the references will resolve to the correct
//    values from the paramObject.
//
//  ARGUMENTS:
//    theExprStr - string expression to replace params in
//    paramObj - server behavior parameter object
//    directiveStack - stack of current nested directives
//    levelToLoopParams - hash table to match loop parameters with associated nested loop.
//    isPartOfDir - boolean. true if theExprStr is part of a directive, i.e. the condition
//      portion of an 'if' directive.
//
//  RETURNS:
//    the updated expression string with params replaced
//
//  THROWS:
//    ProcInsTextException
//-----------------------------------------------------------------------------
function extUtils_replaceParamsInExprStr(theExprStr, paramObj, directiveStack, levelToLoopParams,
                                         isPartOfDir)
{
  if (typeof theExprStr == "string" && theExprStr.length && theExprStr.indexOf(extUtils.STR_DELIM_PARAM_BEGIN) != -1)
  {
    for (var param in paramObj)
    {
      var paramReplace = extUtils.STR_FTN_PARAM + "['" + param + "']";
      if (theExprStr.indexOf(extUtils.STR_DELIM_PARAM_BEGIN + param + extUtils.STR_DELIM_PARAM_END) != -1)
      {
        // If the parameter is an array, we must index it with the appropriate loop variable.
        if (paramObj[param] && (typeof paramObj[param] == "object") && (paramObj[param].length != null))
        {
          // If the array param is used within a loop, use the current element.
          // Else if the array param is used as part of a directive, i.e.
          //   'if' directive condition, outside of a loop, use the string value of the array.
          // Else the array param is used in the code outside of a loop directive,
          //   so throw an error.
          var level = extUtils.getLoopVarNestLevel(param, levelToLoopParams);
          if (directiveStack.join().indexOf(extUtils.DIRECTIVE_LOOP) != -1 && level != -1)
          {
            paramReplace += "[_stackBuiltIns[" + level + "]._index]";
          }
          else if (isPartOfDir)
          {
            paramReplace += ".join(',')";
          }
          else
          {
            throw new ProcInsTextException(ProcInsTextException.ERR_ARRAY_USED_OUTSIDE_LOOP, param);
          }
        }
        theExprStr = theExprStr.replace(RegExp(extUtils.STR_DELIM_PARAM_BEGIN+param+extUtils.STR_DELIM_PARAM_END,"g"), paramReplace);
      }
    }
    
    // Any remaining instances of parameter references in the insert text were
    //   not found in the parameter object. By not sending a value for the 
    //   parameter, we assume the user means to treat it as an empty value.
    //   So, replace it with ''.
    theExprStr = theExprStr.replace(extUtils.REGEXP_PARAM, "''");
  }

  return theExprStr;
}


//-----------------------------------------------------------------------------
//  FUNCTION:
//    extUtils.getLoopVarNestLevel
//
//  DESCRIPTION:
//    Retrieve the level of nested loops in which variable occurs
//
//  ARGUMENTS:
//    param - param name
//    levelToParamList - hash table to match loop parameters with associated nested loop.
//
//  RETURNS:
//    numbered level or -1 if not found
//-----------------------------------------------------------------------------
function extUtils_getLoopVarNestLevel(param, levelToParamList)
{
  for (var level in levelToParamList)
  {
    // Note levelToParamList[level] may have been emptied or made null to clean
    //   out the parameter list for the associated level.
    for (var i = 0; levelToParamList[level] && i < levelToParamList[level].length; ++i)
    {
      if (levelToParamList[level][i] == param)
        return level;
    }
  }
  return -1;
}


// *************** SELECTION CODE *****************


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.getOffsetsAfterClimbingTree
//
// DESCRIPTION:
//
// ARGUMENTS:
//
// RETURNS:
//--------------------------------------------------------------------
function extUtils_getOffsetsAfterClimbingTree(theObj,currOffs)
{
  var currObj = theObj;
  var objParent, parentOffs;
  var climbTree = true;

  // Note - don't walk all the way up to the document node. It has no offsets.
  while (   climbTree && currObj.parentNode
         && currObj.parentNode.nodeType != Node.DOCUMENT_NODE
        )
  {
    objParent = currObj.parentNode;
    parentOffs = dwscripts.getNodeOffsets(objParent);
    if ( (parentOffs[0] < currOffs[0] && parentOffs[1] < currOffs[1]) ||
         (parentOffs[0] > currOffs[0] && parentOffs[1] > currOffs[1]) )
    {
      currObj = objParent;
    }
    else
    {
      climbTree = false;
    }
  }
  return ( dwscripts.getNodeOffsets(currObj) );
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.getOffsetsAfterAccountingForSomeSpecialSelectionCases
//
// DESCRIPTION:
//   like the title says
//
// ARGUMENTS:
//
// RETURNS:
//--------------------------------------------------------------------
function extUtils_getOffsetsAfterAccountingForSomeSpecialSelectionCases(allText, offsets)
{
  var newOffs = oldOffs = offsets;

 // strip leading and trailing white space
 newOffs = extUtils.getOffsetsAfterStrippingWhiteSpace(allText,newOffs[0],newOffs[1]);

 //remove trailing &nbsp; tag if there
 // this can happen if a user shift down-clicks and the following line
 // is empty; dw expands the selection to include the "<p>nbsp;"
 // on the next line
 var selStr = allText.substring(newOffs[0],newOffs[1]);
 var chunk = "&nbsp;";
 var chunkPos = selStr.lastIndexOf(chunk);
 if (chunkPos!=-1 && chunkPos == (selStr.length - chunk.length))
   newOffs[1] -= chunk.length;

 // remove last tag if it is an opening block tag
 // this can happen if a user shift down-clicks; dw selects the
 // opening block tag on the next paragraph, resulting in a selection like:
 //    <p>|some text</p>
 //    <p>|more text</p>
 selStr = allText.substring(newOffs[0], newOffs[1]);
 var pattern = /<([^>]*)>$/;
 var result = selStr.match(pattern);
 if (result != null){
   if ( extUtils.isAContainerTag(result[1]) ){
     newOffs[1] -= result[0].length;
   }
 }

 // if selection starts with a closing block tag, remove it
 // this can happen if a user puts the mouse at the end of a line and
 // presses shift-up-arrow to select it
 selStr = allText.substring(newOffs[0],newOffs[1]);
 pattern = /^<\/([^>]*)>/;
 result = selStr.match(pattern);
 if (result != null){
   if ( extUtils.isAContainerTag(result[1]) ){
     newOffs[0] += result[0].length;
   }
 }

  // strip leading and trailing white space if offsets have changed
  if (newOffs != oldOffs){
    newOffs = extUtils.getOffsetsAfterStrippingWhiteSpace(allText,newOffs[0],newOffs[1]);
    oldOffs = newOffs;
  }

  // account for special list case: selecting the first item in a list
  // can select the opening <ol> or <ul> as well. Strip it.
  newOffs = extUtils.getOffsetsAfterListCheck(allText,newOffs[0],newOffs[1]);

  // strip leading and trailing white space if offsets have changed
  if (newOffs != oldOffs){
    newOffs = extUtils.getOffsetsAfterStrippingWhiteSpace(allText,newOffs[0],newOffs[1]);
  }

  return newOffs;

}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.isAContainerTag
//
// DESCRIPTION:
//
// ARGUMENTS:
//
// RETURNS:
//--------------------------------------------------------------------
function extUtils_isAContainerTag(theTagName)
{
 if ( !theTagName )
   return false;

 var tag = " " + theTagName.toUpperCase() + " ";
 var containerTags = " P H1 H2 H3 H4 H5 H6 LI LAYER DIV TD TABLE FORM PRE BLOCKQUOTE OL UL PRE BODY ";

 return ( containerTags.indexOf(tag) != -1);
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.cursorIsInsideOfTableCell
//
// DESCRIPTION:
//   special case handling if the selected node comes back as TD or TH
//   Determine whether the selection is inside of the cell or if the
//   entire cell is selected
//
// ARGUMENTS:
//
// RETURNS:
//--------------------------------------------------------------------
function extUtils_cursorIsInsideOfTableCell(dom, offsets, cellNode)
{
  var isInsideOfCell = true;
  var allText = dom.documentElement.outerHTML;
  var cellOuterHTML = cellNode.outerHTML;
  var selStr = allText.substring(offsets[0],offsets[1]);

  if ( extUtils.stripWhiteSpace(selStr) == extUtils.stripWhiteSpace(cellOuterHTML) ){
    isInsideOfCell = false;
  }

   return isInsideOfCell;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.selectedNodeIsATableNode
//
// DESCRIPTION:
//
// ARGUMENTS:
//
// RETURNS:
//--------------------------------------------------------------------
function extUtils_selectedNodeIsATableNode(dom,offsets,selNode)
{
  var retVal = false;

  switch (selNode.tagName){

    case "TABLE":
    case "TR":
      retVal = true;
      break;
     case "TD":
     case "TH":
       if ( !extUtils.cursorIsInsideOfTableCell(dom,offsets,selNode) ){
         retVal = true;
         break;
       }
      default:
        break;

   }

    return retVal;

}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.getSelTableRowOffsets
//
// DESCRIPTION:
//   If the selection includes TD or TH tags, corrects the selection
//   to include the entire row(s)
//   If only one TD is selected, does not select the entire row
//
// ARGUMENTS:
//
// RETURNS:
//--------------------------------------------------------------------
function extUtils_getSelTableRowOffsets()
{
  var retVal="";
  var start=0,end=0;
  var DOM = dw.getDocumentDOM();
  var offsets = DOM.getSelection(true); // gets pairs of offsets if multiple selections
  if( !offsets || offsets.length <= 1 ) {
	return retVal;
  }
  var node = DOM.offsetsToNode(offsets[0],offsets[1]);
  //var nodeOffsets = dwscripts.getNodeOffsets(node);

  if (node.nodeType==Node.ELEMENT_NODE && (node.tagName == "TD" || node.tagName == "TH") )
  {
   if (offsets.length == 2  &&
       (extUtils.tableHasOnlyOneColumn(node) ||
        extUtils.cursorIsInsideOfTableCell(DOM,offsets,node))
      )
   {
     // Workaround bug with 1 row 1 col table. If the entire row is selected,
     // dom.getSelection returns offsets for the TD instead. However, 
     // dom.source.getSelection returns the correct offsets for the TR. So,
     // check here if the real selection (dom.source.getselection) is the TR
     // and fix the offsets.
     var sourceOffsets = DOM.source.getSelection(false);
     var sourceNode = DOM.offsetsToNode(sourceOffsets[0], sourceOffsets[1]);
     if (sourceNode && sourceNode.tagName && sourceNode.tagName.toLowerCase() == "tr")
     {
       retVal = new Array(sourceOffsets[0],sourceOffsets[1]);
     }
     else
     {
       retVal = new Array(offsets[0],offsets[1]);
     }
   }
   else
   {
     // start var equals first offset of first table row
     node = node.parentNode;

     if (node.tagName == "FORM")
     {
       node = node.parentNode;  //special case if <TR><FORM><TD>, skip form
     }

     start = dwscripts.getNodeOffsets(node)[0];

     // end var equals last offset of last table row
     node = DOM.offsetsToNode(offsets[offsets.length-2],offsets[offsets.length-1]);
     if (node.nodeType==Node.ELEMENT_NODE &&
         (node.tagName == "TD" || node.tagName == "TH"))
     {
        node = node.parentNode;
        if (node.tagName == "FORM")
        {
          node = node.parentNode;  //special case if <TR><FORM><TD>, skip form
        }
        end = dwscripts.getNodeOffsets(node)[1];
     }
   }
  }

  if (start && end)
  {
   retVal = new Array(start,end);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.tableHasOnlyOneColumn
//
// DESCRIPTION:
//
// ARGUMENTS:
//
// RETURNS:
//--------------------------------------------------------------------
function extUtils_tableHasOnlyOneColumn(cellNode)
{
  var rowNode = cellNode.parentNode;
  var nCols = rowNode.getElementsByTagName("TD").length + rowNode.getElementsByTagName("TH").length;
  return ( nCols < 2 && !rowNode.colspan)
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.getOffsetsAfterStrippingWhiteSpace
//
// DESCRIPTION:
//
// ARGUMENTS:
//
// RETURNS:
//--------------------------------------------------------------------
function extUtils_getOffsetsAfterStrippingWhiteSpace(allText,currOffset1,currOffset2)
{
  var newOffset1 = currOffset1;
  var newOffset2 = currOffset2;
  var selStr = allText.substring(newOffset1,newOffset2);
  var firstNonSpace = selStr.search(/[^\s]/);

  if (firstNonSpace>0) newOffset1 += firstNonSpace;
  while (newOffset2 > newOffset1 && allText.charAt(newOffset2-1).search(/\s/)==0)
    newOffset2--;

  return new Array(newOffset1,newOffset2);
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.getOffsetsAfterListCheck
//
// DESCRIPTION:
//
// ARGUMENTS:
//
// RETURNS:
//--------------------------------------------------------------------
function extUtils_getOffsetsAfterListCheck(docStr,offset1,offset2)
{
  var newOffset1 = offset1;
  var newOffset2 = offset2;
  var openListItems = new Array("<ol>","<OL>","<ul>","<UL>");
  var i, nItems = openListItems.length, closeListItem1, closeListItem2, currItem;
  var selStr = docStr.substring(offset1,offset2);

  for (i=0;i<nItems;i++){
    if (selStr.indexOf(openListItems[i]) == 0){
      currItem = openListItems[i];
      closeListItem1 = "</" + currItem.toLowerCase().substring(1);
      closeListItem2 = "</" + currItem.toUpperCase().substring(1);

      if ( selStr.indexOf(closeListItem1) == -1 && selStr.indexOf(closeListItem2) == -1){
        newOffset1 += currItem.length;
      }
    }
  }
  return new Array(newOffset1,newOffset2);
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.getOffsetsAfterCheckingForBodySelection
//
// DESCRIPTION:
//   check for cases where for whatever reason, the entire body got selected.
//   If this is the case, fix offsets to be inside of the body
//
// ARGUMENTS:
//
// RETURNS:
//--------------------------------------------------------------------
function extUtils_getOffsetsAfterCheckingForBodySelection(allText,currOffs)
{
  var offsets = currOffs;
  var selStr = allText.substring(offsets[0],offsets[1]);
  var newStartOff = currOffs[0];
  var newEndOff   = currOffs[1];
  var openBracketInd,closeBracketInd,nOpenBrackets,nCloseBrackets;
  var ind;

  if (  selStr.indexOf("<BODY") == 0 || selStr.indexOf("<body") == 0 ){
    nOpenBrackets = 1;
    nCloseBrackets = 0;
    closeBracketInd = 0; // index of closing bracket of </body>
    ind=1;

    while ( !closeBracketInd && selStr.charAt(ind) ) {
      if ( selStr.charAt(ind) == "<" ){
        nOpenBrackets++;
      } else if (selStr.charAt(ind) == ">" ){
        nCloseBrackets++;
        if( nOpenBrackets == nCloseBrackets ){
          closeBracketInd = ind;
        }
      }
      ind++;
    }

    // get first non-newline character inside of the body tag
    newStartOff = closeBracketInd + 1;
    while ( selStr.charAt(newStartOff) == "\n" ||
            selStr.charAt(newStartOff) == "\r"  ) {
             newStartOff++;
    }

    // get last non-newline character inside of the body tag
    openBracketInd = selStr.lastIndexOf("<"); // open bracket index of </body>
    newEndOff = openBracketInd - 1;
    while ( selStr.charAt(newEndOff) == "\n" ||
            selStr.charAt(newEndOff) == "\r"  ) {
              newEndOff--;
    }

    // add 1 because selection actually goes to newEndOff minus one
    newEndOff++;

    newStartOff += currOffs[0];
    newEndOff   += currOffs[0];
  }

  return new Array(newStartOff,newEndOff);
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.getOffsetsAfterBubblingUpTree
//
// DESCRIPTION:
//
// ARGUMENTS:
//
// RETURNS:
//--------------------------------------------------------------------
function extUtils_getOffsetsAfterBubblingUpTree(currNode)
{

  // special case for dynamic elements
  if (currNode.parentNode && extUtils.isPartOfLockedContent(currNode) &&
      extUtils.isOKToBubbleThroughTag(currNode.parentNode.tagName)) {
              currNode = currNode.parentNode;
  }

  // climb up to top character style -- otherwise selection could be unbalanced
  while (currNode.parentNode && currNode.parentNode.childNodes.length == 1 &&
         extUtils.isOKToBubbleThroughTag(currNode.parentNode.tagName)) {
               currNode = currNode.parentNode;
  }

  return dwscripts.getNodeOffsets(currNode);
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.isPartOfLockedContent
//
// DESCRIPTION:
//
// ARGUMENTS:
//
// RETURNS:
//--------------------------------------------------------------------
function extUtils_isPartOfLockedContent(currNode)
{
  return (currNode.parentNode && currNode.parentNode.childNodes.length == 3
          && currNode.parentNode.childNodes[0].tagName == "MM:BEGINLOCK");
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.isOKToBubbleThroughTag
//
// DESCRIPTION:
//
// ARGUMENTS:
//
// RETURNS:
//--------------------------------------------------------------------
function extUtils_isOKToBubbleThroughTag(tag)
{
  // this shouldn't happen, but if "undefined" is passed in, its because
  // the node doesn't have a tagName property, which means it is a text or comment node
  if ( !tag )
    return true;

  var bubbleThroughTags =
  " P H1 H2 H3 H4 H5 H6 LI A FONT I B U MM:BEGINLOCK STRIKE BIG SMALL SUB SUP EM STRONG DFN CODE SAMP KBD VAR CITE XMP TT ADDRESS ";
  var tagWithSpaces = " " + tag.toUpperCase() + " ";
  var isColdFusionTag = tag.indexOf("cf") == 0 || tag.indexOf("CF") == 0;

  return ( bubbleThroughTags.indexOf(tagWithSpaces) != -1 || isColdFusionTag );
}


//--------------------------------------------------------------------
// FUNCTION:
//   extUtils.stripWhiteSpace
//
// DESCRIPTION:
//
// ARGUMENTS:
//
// RETURNS:
//--------------------------------------------------------------------
  function extUtils_stripWhiteSpace(inStr)
  {
    var spaceChars = " \n\r\t";
    var startPos = 0;
    while (startPos < inStr.length && spaceChars.indexOf(inStr[startPos]) != -1){
      startPos++;
    }
    var endPos = inStr.length;
    while (endPos-1 > 0 && spaceChars.indexOf(inStr[endPos-1]) != -1){
      endPos--;
    }

    return inStr.substring(startPos,endPos);
}




//--------------------------------------------------------------------
// CLASS:
//   ProcInsTextException
//
// DESCRIPTION:
//   Class to encapsulate exceptions that occur while processing the insert
//   text.
//
// PUBLIC PROPERTIES:
//   errCode - codes from static members of this class
//
// PUBLIC FUNCTIONS:
//   <function name> - <description>
//--------------------------------------------------------------------
function ProcInsTextException(errCode)
{
  var msg = "";
  var argVal = (arguments.length > 1) ? arguments[1] : "";

  this.value = MM.MSG_ErrProcessingInsText;

  if (errCode & ProcInsTextException.ERR_MISPLACED_ELSEIF)
    msg += "\n" + MM.MSG_ErrMisplacedElseIf;
  if (errCode & ProcInsTextException.ERR_MISPLACED_ELSE)
    msg += "\n" + MM.MSG_ErrMisplacedElse;
  if (errCode & ProcInsTextException.ERR_MISPLACED_ENDIF)
    msg += "\n" + MM.MSG_ErrMisplacedEndif;
  if (errCode & ProcInsTextException.ERR_MISPLACED_LOOP)
    msg += "\n" + MM.MSG_ErrMisplacedLoop;
  if (errCode & ProcInsTextException.ERR_MISPLACED_ENDLOOP)
    msg += "\n" + MM.MSG_ErrMisplacedEndloop;
  if (errCode & ProcInsTextException.ERR_LOOP_PARAM_NOT_ARRAY)
    msg += "\n" + dwscripts.sprintf(MM.MSG_ErrLoopParamNotArray, argVal);
  if (errCode & ProcInsTextException.ERR_LOOP_PARAMS_DIFF_LEN)
    msg += "\n" + dwscripts.sprintf(MM.MSG_ErrLoopParamsDiffLen, argVal);
  if (errCode & ProcInsTextException.ERR_ARRAY_USED_OUTSIDE_LOOP)
    msg += "\n" + dwscripts.sprintf(MM.MSG_ErrArrayUsedOutsideLoop, argVal);
  if (errCode & ProcInsTextException.ERR_UNTERMINATED_IF)
    msg += "\n" + MM.MSG_ErrUnterminatedIf;
  if (errCode & ProcInsTextException.ERR_UNTERMINATED_LOOP)
    msg += "\n" + MM.MSG_ErrUnterminatedLoop;
  if (errCode & ProcInsTextException.ERR_LOOP_HAS_NO_PARAMS)
    msg += "\n" + MM.MSG_ErrLoopHasNoParams;
  if (errCode & ProcInsTextException.ERR_COULD_NOT_EVAL_DIRECTIVE)
    msg += "\n" + dwscripts.sprintf(MM.MSG_ErrCouldNotEvalDirective, argVal);
  if (errCode & ProcInsTextException.ERR_UNRECOGNIZED_DIRECTIVE)
    msg += "\n" + dwscripts.sprintf(MM.MSG_ErrUnrecognizedDirective, argVal);

  // Store message without leading newline
  this.message = msg.slice(1);
  this.toString = function() {return this.value + ": " + this.message;}
}


// Error code constants for insert text exception. By making the codes powers of
//  2, we can identify multiple error conditions at once.
ProcInsTextException.ERR_MISPLACED_ELSEIF         = (1<<0);
ProcInsTextException.ERR_MISPLACED_ELSE           = (1<<1);
ProcInsTextException.ERR_MISPLACED_ENDIF          = (1<<2);
ProcInsTextException.ERR_MISPLACED_LOOP           = (1<<3);
ProcInsTextException.ERR_MISPLACED_ENDLOOP        = (1<<4);
ProcInsTextException.ERR_LOOP_PARAM_NOT_ARRAY     = (1<<5);
ProcInsTextException.ERR_LOOP_PARAMS_DIFF_LEN     = (1<<6);
ProcInsTextException.ERR_ARRAY_USED_OUTSIDE_LOOP  = (1<<7);
ProcInsTextException.ERR_UNTERMINATED_IF          = (1<<8);
ProcInsTextException.ERR_UNTERMINATED_LOOP        = (1<<9);
ProcInsTextException.ERR_LOOP_HAS_NO_PARAMS       = (1<<10);
ProcInsTextException.ERR_COULD_NOT_EVAL_DIRECTIVE = (1<<11);
ProcInsTextException.ERR_UNRECOGNIZED_DIRECTIVE   = (1<<12);

//--------------------------------------------------------------------
// CLASS:
//   RTCElement
//
// DESCRIPTION:
//   Used by extUtils.processExtDataText to represent an element in the insert text
//   block for a participant.
//
// PUBLIC PROPERTIES:
//   <property> - <type and description>
//
// PUBLIC FUNCTIONS:
//   getElementType - get type for the runtime code element
//   getElementString - get string data for the element
//   setElementString(tempElmStr) - set string data for the element
//--------------------------------------------------------------------

function RTCElement(elmType, elmStr)
{
  // Type expected to be one of extUtils.DIRECTIVE_*, extUtils.RAW_CODE,
  //   extUtils.PARAMETER.
  this.elementType = elmType;
  this.elementString = elmStr;
}

RTCElement.prototype.getElementType = RTCElement_getElementType;
RTCElement.prototype.getElementString = RTCElement_getElementString;
RTCElement.prototype.setElementString = RTCElement_setElementString;

//--------------------------------------------------------------------
// FUNCTION:
//   RTCElement.getElementType
//
// DESCRIPTION:
//   Retrieve the element type.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - element type
//--------------------------------------------------------------------

function RTCElement_getElementType()
{
  return this.elementType;
}


//--------------------------------------------------------------------
// FUNCTION:
//   RTCElement.getElementString
//
// DESCRIPTION:
//   Retrieve the element string.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - element text
//--------------------------------------------------------------------

function RTCElement_getElementString()
{
  return this.elementString;
}

//--------------------------------------------------------------------
// FUNCTION:
//   RTCElement.setElementString
//
// DESCRIPTION:
//   Set the element string data.
//
// ARGUMENTS:
//   elmStr - string. new string data for element.
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function RTCElement_setElementString(elmStr)
{
  this.elementString = elmStr;
}
