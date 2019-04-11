// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.


//*************** GLOBALS VARS *****************

var HELP_DOC = MM.HELP_ssDynamicSelectList;

var selectNode = new TagMenu("DynamicSelectList.htm", "selectNode", "SELECT");
var rsName = new RecordsetMenu("DynamicSelectList.htm", "rsName", true);
var labelColumn = new RecordsetColumnMenu("DynamicSelectList.htm", "labelColumn", null, "rsName", true);
var valueColumn = new RecordsetColumnMenu("DynamicSelectList.htm", "valueColumn", null, "rsName", true);
var expression1 = new DynamicTextField("DynamicSelectList.htm", "expression1", "");
var optionsGrid = new GridControl("optionsGrid");

var VALUE_GRIDCOL_POS = 0;
var LABEL_GRIDCOL_POS = 1;

// TagEdit object for the currently selected select list. Used to track edits made
//   to the static option tags as they are performed in the UI. We do this to preserve
//   as much of the users handed coded select list edits as possible.
var gSelectTagEdit = null;

//******************* API **********************

//--------------------------------------------------------------------
// FUNCTION:
//   canApplyServerBehavior
//
// DESCRIPTION:
//   Returns true if a Server Behavior can be applied to the current
//   document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   boolean - true if the behavior can be applied, false otherwise
//--------------------------------------------------------------------
function canApplyServerBehavior(sbObj) 
{
  var success = true;

  if (success) success = selectNode.canApplyServerBehavior(sbObj);
  if (success) success = rsName.canApplyServerBehavior(sbObj);
  if (success) success = labelColumn.canApplyServerBehavior(sbObj);
  if (success) success = valueColumn.canApplyServerBehavior(sbObj);
  if (success) success = expression1.canApplyServerBehavior(sbObj);
  
  return success;
  
}


//--------------------------------------------------------------------
// FUNCTION:
//   findServerBehaviors
//
// DESCRIPTION:
//   Returns an array of ServerBehavior objects, each one representing
//   an instance of this Server Behavior on the page
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   JavaScript Array of ServerBehavior objects
//--------------------------------------------------------------------
function findServerBehaviors()
{
  var sbList = dwscripts.findSBs(MM.LABEL_DynamicListMenuTitle);
  
  for (var i = 0; i < sbList.length; ++i)
  {
    var mainSBPart = sbList[i].getNamedSBPart("dynamicList_main");
    var selNode = mainSBPart.getNodeSegment().node;
    sbList[i].setParameter("selectNode", selNode);

    // Declare booleans to track if we've found the begin/end parts which
    //   wrap the dynamic option participant. These participants often don't
    //   extract distinctive parameters that we can check for their existence.
    //   So we must track the existence of these participants manually.
    var bFoundBeginPart = false;
    var bFoundEndPart = false;

    // Cycle through the child nodes of the select list and search for each
    //   participant. Add the participants to the SB object. (Note, we are not
    //   adding the participants with correct min/max offsets. We really only
    //   need them to add the nodes and parameters).
    var childNodes = selNode.childNodes;
    for (var j = 0; j < childNodes.length; ++j)
    {
      var paramObj = null;
      var sbPart = null;
      var childOuterHTML = dwscripts.getOuterHTML(childNodes[j]);
      
      paramObj = extPart.findInString("dynamicList_begin", childOuterHTML, false);
      if (paramObj)
      {
        bFoundBeginPart = true;
        sbPart = new SBParticipant("dynamicList_begin", childNodes[j], 0, 0, paramObj);

        // For some server models (e.g., ColdFusion) , the begin and end participants
        //   may be a single node wrapping the dynamic option. In this case, there
        //   will be a single childNode representing all 3 participants. Since we found
        //   the begin participant, check for the dynamic option & end participants too.
        var endParamObj = extPart.findInString("dynamicList_end", childOuterHTML, false);
        if (endParamObj)
        {
          bFoundEndPart = true;
          var addedSBPart = new SBParticipant("dynamicList_end", childNodes[j], 0, 0,
                                              endParamObj);
          sbList[i].addParticipant(addedSBPart);
        
          // We've found the begin and end participants in this node. The
          //   dynamicList_option participant should be found in the child of this
          //   node.
          var dynOptPartNode = childNodes[j];
          if (childNodes[j].childNodes && childNodes[j].childNodes.length > 0)
          {
            dynOptPartNode = childNodes[j].childNodes[0];
            childOuterHTML = dwscripts.getOuterHTML(childNodes[j].childNodes[0]);
          }
          var optParamObj = extPart.findInString("dynamicList_option", childOuterHTML, false);
          if (!optParamObj)
          {
            optParamObj = extPart.findInString("dynamicListNoSel_option", 
                                               childOuterHTML, false);
          }
      
          if (optParamObj)
          {
            addedSBPart = new SBParticipant("dynamicList_option", dynOptPartNode, 
                                            0, 0, optParamObj);
            sbList[i].addParticipant(addedSBPart);
          }
        }
      }      
      if (!sbPart)
      {
        paramObj = extPart.findInString("dynamicList_option", childOuterHTML, false);
        if (paramObj)
        {
          sbPart = new SBParticipant("dynamicList_option", childNodes[j], 0, 0, paramObj);
        }
      }
      if (!sbPart)
      {
        paramObj =  extPart.findInString("dynamicListNoSel_option", childOuterHTML, false);
        if (paramObj)
        {
          sbPart = new SBParticipant("dynamicListNoSel_option", childNodes[j], 0, 0, paramObj);
        }
      }
      if (!sbPart)
      {
        paramObj = extPart.findInString("dynamicList_attrib", childOuterHTML, false);
        if (paramObj)
        {
          sbPart = new SBParticipant("dynamicList_attrib", childNodes[j], 0, 0, paramObj);
        }
      }
      if (!sbPart)
      {                                                 
        paramObj = extPart.findInString("dynamicList_end", childOuterHTML, false);
        if (paramObj)
        {
          bFoundEndPart = true;
          sbPart = new SBParticipant("dynamicList_end", childNodes[j], 0, 0, paramObj);
        }
      }
      
      // if found a participant, add it to the ServerBehavior object.
      if (sbPart)
      {
        sbList[i].addParticipant(sbPart);
      }
    }
    
    // Check that we've found a valid version of the dynamic menu behavior. 
    //   A valid version is a menu with dynamic selection, dynamic options,
    //   or both.
    var paramObj = sbList[i].getParameters();
    if (   paramObj
        && (   (   paramObj.rsName && paramObj.valueColumn && paramObj.labelColumn
                && bFoundBeginPart && bFoundEndPart
               )
            || (paramObj.expression1 && paramObj.expression2)
           )
       )
    {
      // We have a complete dynamic menu instance.         
      // Decode the dynamic select expression.
      if (paramObj.expression1)
      {
        paramObj.expression1 = dwscripts.decodeDynamicExpression(paramObj.expression1);
      }

      // Fix up the SB title.
      var sbTitle = sbList[i].getTitle();
      var theName = selNode.getAttribute("name");
      if (!theName) theName = "";
      sbList[i].setTitle(sbTitle.replace(/@@theName@@/,theName));
    }
    else
    {
      sbList[i].deleted = true;
    }
  }

  return sbList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   analyzeServerBehavior
//
// DESCRIPTION:
//   Performs extra checks needed to determine if the Server Behavior
//   is complete
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//   allRecs - JavaScripts Array of ServerBehavior objects - all of the
//             ServerBehavior objects known to Dreamweaver
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function analyzeServerBehavior(sbObj, allRecs) 
{
  // If the rsName parameter is defined, (i.e., we've got a dynamic option
  //   version of the SB), check it's validity.
  if (sbObj.getParameter("rsName"))
  {
    rsName.analyzeServerBehavior(sbObj, allRecs);
    labelColumn.analyzeServerBehavior(sbObj, allRecs);
    valueColumn.analyzeServerBehavior(sbObj, allRecs);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//   Collects values from the form elements in the dialog box and
//   adds the Server Behavior to the user's document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   string - empty upon success, or an error message
//--------------------------------------------------------------------
function applyServerBehavior(sbObj) 
{
  var paramObj = new Object();
  var errStr = "";
  // Flag to denote that we should apply dynamic options.
  var bIsDynamicOption = false;
  // Flag to denote that we should apply dynamic selection
  var bIsDynamicSel = false;  

  if (!errStr) 
  {
    errStr = selectNode.applyServerBehavior(sbObj, paramObj);
    
    // If this is an insert, make sure a dynamic menu does not already exist
    //   on the chosen select list.
    if (!sbObj && !errStr)    
    {
      var sbList = dwscripts.findSBs();
      
      for (var i = 0; i < sbList.length; ++i)
      {
        var selNode = sbList[i].getNamedSBPart("dynamicList_main").getNodeSegment().node;
        if (selNode == paramObj.selectNode)
        {
          errStr = MM.MSG_MenuHasServerBehavior;
        }
      }
    }
  }
  
  if (!errStr)
  {
    var optionsArray = optionsGrid.getAll();
    var values = new Array();
    var labels = new Array();
    
    for (var i = 0; i < optionsArray.length; ++i)
    {
      values.push(optionsArray[i][VALUE_GRIDCOL_POS]);
      labels.push(optionsArray[i][LABEL_GRIDCOL_POS]);
    }
    
    paramObj.values = values;
    paramObj.labels = labels;
  
    rsName.applyServerBehavior(sbObj, paramObj);
    labelColumn.applyServerBehavior(sbObj, paramObj);
    valueColumn.applyServerBehavior(sbObj, paramObj);
    
    expression1.applyServerBehavior(sbObj, paramObj);
    if (paramObj.expression1)
    {
      paramObj.expression1 = dwscripts.encodeDynamicExpression(paramObj.expression1);

      // Special case for ColdFusion - we must strip surrounding #'s
      if (   paramObj.expression1.length > 1 && paramObj.expression1.charAt(0) == '#' 
          && paramObj.expression1.charAt(paramObj.expression1.length - 1) == '#'
         )
      { 
        paramObj.expression1 = paramObj.expression1.slice(1, paramObj.expression1.length - 1);
      }
    }
    
    bIsDynamicOption = (paramObj.rsName != MM.LABEL_None);
    bIsDynamicSel = (paramObj.expression1 != "");  

    // If neither dynamic option or dynamic selection is added to the list, ask
    //   the user to add one. If dynamic selection but not dynamic options is 
    //   added to the list, be sure that the list has some options to which we 
    //   can add the dynamic selection.
    if (!bIsDynamicOption)
    {
      if (!bIsDynamicSel)
      {
        errStr = MM.MSG_NoDynamicOptOrSel;
      }
      else if (paramObj.values.length == 0 && paramObj.labels.length == 0)
      {
        errStr = MM.MSG_NoOptionsForDynSel;
      }
    }
  }

  if (!errStr) 
  {
    paramObj = getJSPParamObj(paramObj);
  }

  if (!errStr) 
  {
	  var serverModel = dwscripts.getServerModel();
		paramObj.selected = 'selected="selected"';

		if (serverModel.match(/(?:PHP|ASP_JS|JSP)/i)) {
			paramObj.selected = paramObj.selected.replace(/"/g, '\\"');
		}
		if (serverModel.match(/(?:ASP_VB)/i)) {
			paramObj.selected = paramObj.selected.replace(/"/g, '""');
		}
		//alert(serverModel);
	}

  if (!errStr) 
  {
    queueDynListDocEdits(paramObj, bIsDynamicOption, bIsDynamicSel);
    dwscripts.applyDocEdits();
  }
  
  return errStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//   Sets the values of the form elements in the dialog box based
//   on the given ServerBehavior object
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function inspectServerBehavior(sbObj) 
{
  selectNode.inspectServerBehavior(sbObj);
  expression1.inspectServerBehavior(sbObj);

  // If the rsName parameter is defined, (i.e., we've got a dynamic option
  //   version of the SB), try to inspect it. Otherwise, skip it because
  //   we probably have a valid dynamic selection and no dynamic option which
  //   still comprises a complete dynamic menu SB.
  if (sbObj.getParameter("rsName"))
  {
    rsName.inspectServerBehavior(sbObj);
    labelColumn.inspectServerBehavior(sbObj);
    valueColumn.inspectServerBehavior(sbObj);
  }
  
  updateUI("selectNode", "onChange");
}


//--------------------------------------------------------------------
// FUNCTION:
//   deleteServerBehavior
//
// DESCRIPTION:
//   Remove the specified Server Behavior from the user's document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function deleteServerBehavior(sbObj) 
{
  // Cycle through the select list children and update them manually for delete.
  var mainSBPart = sbObj.getNamedSBPart("dynamicList_main");
  var selNode = mainSBPart.getNodeSegment().node;
  var selectTagEdit = new TagEdit(selNode.outerHTML);
  
  // Old list of children.
  var selectChildTagEdits = selectTagEdit.getChildNodes();
  
  // New list of children.
  var newSelectChildTagEdits = new Array();

  for (var i = 0; i < selectChildTagEdits.length; ++i)
  {
    var childOuterHTML = selectChildTagEdits[i].getOuterHTML();
    if (   !extPart.findInString("dynamicList_option", childOuterHTML, false)
        && !extPart.findInString("dynamicListNoSel_option", childOuterHTML, false)
        && !extPart.findInString("dynamicList_begin", childOuterHTML, false)
        && !extPart.findInString("dynamicList_end", childOuterHTML, false)
       )
    {
      // We want to preserve this child because it is not part of the dynamic option
      //   participants. However, if it is an option tag, we
      //   need to remove the dynamic selected attribute if it exists.
      if (selectChildTagEdits[i].getTagName().toUpperCase() == "OPTION")
      {
        var strPattSelAttr = extPart.getSearchPatterns("dynamicList_attrib")[0].pattern;
        var pattSelAttr = eval(strPattSelAttr);
        var optionText = selectChildTagEdits[i].getOuterHTML();
        optionText = optionText.replace(pattSelAttr, "");
        newSelectChildTagEdits.push(new TagEdit(optionText));
      }
      else
      {
        newSelectChildTagEdits.push(selectChildTagEdits[i]);
      }
    }
  }

  // Queue doc edits to replace the entire select node.
  selectTagEdit.setChildNodes(newSelectChildTagEdits);
  var updateText = selectTagEdit.getOuterHTML();
  dwscripts.queueNodeEdit(updateText, selNode); 
  dwscripts.applyDocEdits();
}


//--------------------------------------------------------------------
// FUNCTION:
//   displayHelp
//
// DESCRIPTION:
//   Displays the built-in Dreamweaver help.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function displayHelp()
{
  // Replace the following call if you are modifying this file for your own use.
  dwscripts.displayDWHelp(HELP_DOC);
}


//***************** LOCAL FUNCTIONS  ******************

//--------------------------------------------------------------------
// FUNCTION:
//   queueDynListDocEdits
//
// DESCRIPTION:
//   Queue up all doc edits needed to apply the dynamic select list.
//
// ARGUMENTS:
//   paramObj - the parameter object
//   bIsDynamicOption - boolean
//   bIsDynamicSel - boolean
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function queueDynListDocEdits(paramObj, bIsDynamicOption, bIsDynamicSel)
{
  // Cycle through the select tagEdit child node tagEdits and update them.
  var selectChildTagEdits = gSelectTagEdit.getChildNodes();
  
  // Keep a list of new children. This list is needed if we need to remove any
  //   of the existing children: for a removal, don't push the child tagEdit
  //   onto newSelectChildTagEdits;
  var newSelectChildTagEdits = new Array();
  
  // Index for the values/labels parallel arrays on the paramObj. Needed to
  //   track the value/label used to update the next static option tagEdit
  //   in selectChildTagEdits. The selectChildTagEdits array does not
  //   directly correspond to the values/labels arrays, so we need a separate
  //   index into them.
  var indexNextStaticOption = 0;
  
  // boolean to track whether we need to add dynamic options at the end of
  //   the select list. We will need to do this if updating a select list
  //   which currently does not have dynamic options, and the user has
  //   added dynamic options through the UI.
  var bAppendDynamicOption = bIsDynamicOption;
  for (var i = 0; i < selectChildTagEdits.length; ++i)
  {
    var childOuterHTML = selectChildTagEdits[i].getOuterHTML();

    if (extPart.findInString("dynamicList_begin", childOuterHTML, false))
    {
      if (bIsDynamicOption)
      {
        var beginPartStr = "";
        var endPartStr = "";
        var optionPartStr = "";
        
        beginPartStr = extPart.getInsertString("DynamicSelectList", 
                                               "dynamicList_begin", paramObj);

        // For some server models (e.g., ColdFusion) , the begin and end participants
        //   may be a single node wrapping the dynamic option. In this case, there
        //   will be a single childNode representing all 3 participants. Check for
        //   this case so we know if we need to udpate all 3 parts for this single
        //   childNode.
        if (extPart.findInString("dynamicList_end", childOuterHTML, false))
        {
          endPartStr = extPart.getInsertString("DynamicSelectList", 
                                               "dynamicList_end", paramObj);
  
          // We've found the begin and end participants in this node. The
          //   dynamicList_option participant should be found in the child of this
          //   node.
          var childNodes = selectChildTagEdits[i].getChildNodes();
          if (childNodes && childNodes.length > 0)
          {
            childOuterHTML = childNodes[0].getOuterHTML();
          }
          if (   extPart.findInString("dynamicList_option", childOuterHTML, false)
              || extPart.findInString("dynamicListNoSel_option", childOuterHTML, false)
             )
          {
            // Found dynamic option tag.
            // Indicate that we've already taken care of the dynamic options.
            bAppendDynamicOption = false;
            if (bIsDynamicSel)
            {
              optionPartStr = extPart.getInsertString("DynamicSelectList", 
                                                      "dynamicList_option", 
                                                      paramObj);
            }
            else
            {
              optionPartStr = extPart.getInsertString("DynamicSelectList", 
                                                      "dynamicListNoSel_option", 
                                                      paramObj);
            }
          }
        }
        
        var newTagEdit = new TagEdit(beginPartStr);
        if (optionPartStr)
        {
          newTagEdit.setInnerHTML(optionPartStr);
        }
        newSelectChildTagEdits.push(newTagEdit);
      }
    }
    else if (   extPart.findInString("dynamicList_option", childOuterHTML, false)
             || extPart.findInString("dynamicListNoSel_option", childOuterHTML, false)
            )
    {
      if (bIsDynamicOption)
      {
        bAppendDynamicOption = false;
        var optionPartStr = "";
        if (bIsDynamicSel)
        {
          optionPartStr = extPart.getInsertString("DynamicSelectList", 
                                                  "dynamicList_option", 
                                                  paramObj);
        }
        else
        {
          optionPartStr = extPart.getInsertString("DynamicSelectList", 
                                                  "dynamicListNoSel_option", 
                                                  paramObj);
        }
        newSelectChildTagEdits.push(new TagEdit(optionPartStr));
      }
    }
    else if (selectChildTagEdits[i].getTagName().toUpperCase() == "OPTION")
    {
      // Found a static option tag.
      selectChildTagEdits[i].setAttribute("value", paramObj.values[indexNextStaticOption]);
      selectChildTagEdits[i].setInnerHTML(paramObj.labels[indexNextStaticOption]);

      // Remove the dynamic selected attribute if it exists
      var strPattSelAttr = extPart.getSearchPatterns("dynamicList_attrib")[0].pattern;
      var pattSelAttr = eval(strPattSelAttr);
      var optionText = selectChildTagEdits[i].getOuterHTML();
      
      optionText = optionText.replace(pattSelAttr, "");
      
      if (bIsDynamicSel)
      {
        // Must update the selected attribute of the option tag. We already removed
        //   the previous one, so just add the updated one.
        
        // Add property to paramObj to specify this particular option tag's value
        //   for the dynamic selection.
        var theValue = paramObj.values[indexNextStaticOption];
        paramObj.expression2 = dwscripts.encodeDynamicExpression(theValue);
        var strSelAttr = extPart.getInsertString("DynamicSelectList", 
                                                 "dynamicList_attrib", paramObj);
        
        // Use scanSourceString to figure out where to add the dynamic attribute.
        var callback = new Object();
        callback.tagCount = 0;
        callback.innerStart = -1;
        callback.openTagEnd = new Function("offset","if (this.tagCount == 0) { this.innerStart = offset; } this.tagCount++;");
        dw.scanSourceString(optionText, callback);

        optionText = optionText.slice(0, callback.innerStart - 1) + strSelAttr 
                   + optionText.slice(callback.innerStart - 1);
      }
      
      newSelectChildTagEdits.push(new TagEdit(optionText));
      ++indexNextStaticOption;
    }
    else if (extPart.findInString("dynamicList_end", childOuterHTML, false))
    {
      if (bIsDynamicOption)
      {
        var newTagEdit = new TagEdit(extPart.getInsertString("DynamicSelectList", 
                                     "dynamicList_end", paramObj));
        newSelectChildTagEdits.push(newTagEdit);
      }
    }
    else
    {
      // Probably a piece of user code. Preserve it.
      newSelectChildTagEdits.push(selectChildTagEdits[i]);
    }
  }
  
  // Check if we must add dynamic options at the end of the select list.
  if (bAppendDynamicOption)
  {
    var newTagEdit = new TagEdit(extPart.getInsertString("DynamicSelectList", 
                                                         "dynamicList_begin", 
                                                         paramObj) );    
    newSelectChildTagEdits.push(newTagEdit);
    
    if (newTagEdit.getTagType() == TagEdit.TYPE_BLOCKTAG)
    {
      var newChildEdit = null;
      if (bIsDynamicSel)
      {
        newChildEdit = new TagEdit(extPart.getInsertString("DynamicSelectList", 
                                                         "dynamicList_option", 
                                                         paramObj) );
      }
      else
      {
        newChildEdit = new TagEdit(extPart.getInsertString("DynamicSelectList", 
                                                         "dynamicListNoSel_option", 
                                                         paramObj) );
      }
      newTagEdit.setChildNodes(new Array(newChildEdit));
    }
    else
    {
      if (bIsDynamicSel)
      {
        newTagEdit = new TagEdit(extPart.getInsertString("DynamicSelectList", 
                                                         "dynamicList_option", 
                                                         paramObj) );
      }
      else
      {
        newTagEdit = new TagEdit(extPart.getInsertString("DynamicSelectList", 
                                                         "dynamicListNoSel_option", 
                                                         paramObj) );
      }
      newSelectChildTagEdits.push(newTagEdit);

      newTagEdit = new TagEdit(extPart.getInsertString("DynamicSelectList", 
                                                       "dynamicList_end", 
                                                       paramObj) );
      newSelectChildTagEdits.push(newTagEdit);
    }
                                                               
  }
  
  // Queue doc edits to replace the entire select node.
  gSelectTagEdit.setChildNodes(newSelectChildTagEdits);
  var updateText = gSelectTagEdit.getOuterHTML();
  dwscripts.queueNodeEdit(updateText, paramObj.selectNode); 
}


//--------------------------------------------------------------------
// FUNCTION:
//   getJSPParamObj
//
// DESCRIPTION:
//   For JSP only, check if this is a recordset from a callable object. We
//   switch between different recordset reset code based on whether the 
//   recordset is from a callable or not. Make sure the callableName
//   parameter is set to perform the switch.
//
// ARGUMENTS:
//   paramObj - the parameter object for the SB
//
// RETURNS:
//   object - the updated parameter object
//--------------------------------------------------------------------
function getJSPParamObj(paramObj)
{
  if (!paramObj.callableName && dw.getDocumentDOM().serverModel.getServerName() == "JSP") 
  {
    var recordsetName = paramObj.rsName;
    
    var callableName = ""; // empty string if not from a callable
    var sbList = dw.serverBehaviorInspector.getServerBehaviors();
    for (var i=0; i < sbList.length; i++) 
    {
      if (sbList[i].recordset == recordsetName && sbList[i].callableName) 
      {
        callableName = sbList[i].callableName;
        break;
      }
    }
    
    paramObj.callableName = callableName;
  }
  
  return paramObj;
}


//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//   Prepare the dialog and controls for user input
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function initializeUI() 
{
  selectNode.initializeUI();

  rsName.initializeUI();
  labelColumn.initializeUI();
  valueColumn.initializeUI();
  expression1.initializeUI();  

  updateUI("selectNode");

  elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//   Called from controls to update the dialog based on user input
//
// ARGUMENTS:
//   controlName - string - the name of the control which called us
//   event - string - the name of the event which triggered this call
//           or null
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function updateUI(controlName, event)
{
  if (controlName == "optionAdd")
  {
    updateOnAddOption();
  }
  else if (controlName == "optionDel")
  {
    updateOnDelOption();
  }
  else if (controlName == "optionUp")
  {
    updateOnMoveUpOption();
  }
  else if (controlName == "optionDown")
  {
    updateOnMoveDownOption();
  }
  else if (controlName == "selectNode")
  {
    // Populate the options grid with static options (value and label are static)
    //   from the select list.
    var selNode = selectNode.getValue();
    var optionsGridArray = new Array();
    if (selNode)
    {
      // Update the select tagEdit global. Note that we build the tagEdit using
      //   the select list outerHTML. This is done to eliminate corrupted childNodes 
      //   due to translation.
      gSelectTagEdit = new TagEdit(selNode.outerHTML);
      
      optionNodes = selNode.getElementsByTagName("option");
      for (var i = 0; optionNodes && i < optionNodes.length; ++i)
      {
        // Check the option tag against the dynamic option participant. If it is
        //   not a dynamic option, add it to our list of static options.
        if (   !extPart.findInString("dynamicList_option", 
                                     optionNodes[i].outerHTML, false)
            && !extPart.findInString("dynamicListNoSel_option", 
                                     optionNodes[i].outerHTML, false)
           )
        {
          var optionsGridRow = new Array();
          var theValue = optionNodes[i].getAttribute("value");
          optionsGridRow[VALUE_GRIDCOL_POS] = (theValue) ? theValue : "";
          optionsGridRow[LABEL_GRIDCOL_POS] = optionNodes[i].innerHTML;
          optionsGridArray.push(optionsGridRow);
        }
      }
    }

    optionsGrid.setAll(optionsGridArray);
    optionsGrid.object.blur();
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateOnAddOption
//
// DESCRIPTION:
//   Perform all updates required on the add option event. 
//
// ARGUMENTS:
//   nothing
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function updateOnAddOption()
{
  // Append a new option tagEdit to gSelectTagEdit's childNode tagEdits. There
  //   may be non-option tag childnodes among the option tags. Also, we'd like
  //   to preserve the basic ordering of all child nodes. We assume here that
  //   the new static option should go directly after the last static option tag.
  var selTagEditChildNodes = gSelectTagEdit.getChildNodes();
  var bFoundPosition = false;
  var addPosition = -1;
  for (var i = selTagEditChildNodes.length - 1; !bFoundPosition && i > -1; --i)
  {
    if (   selTagEditChildNodes[i].getTagName().toUpperCase() == "OPTION"
        && !extPart.findInString("dynamicList_option", 
                                 selTagEditChildNodes[i].getOuterHTML(), false)
        && !extPart.findInString("dynamicListNoSel_option", 
                                 selTagEditChildNodes[i].getOuterHTML(), false)
       )
    {
      bFoundPosition = true;
      addPosition = i;
    }
  }

  var newTagEdit = new TagEdit("<option value=\"value\">label</option>");
  selTagEditChildNodes.splice(addPosition + 1, 0, newTagEdit);

  gSelectTagEdit.setChildNodes(selTagEditChildNodes);

  // Finally, update the UI element.
  var newOptionRow = new Array();
  newOptionRow[VALUE_GRIDCOL_POS] = "value";
  newOptionRow[LABEL_GRIDCOL_POS] = "label";
  optionsGrid.append(newOptionRow);
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateOnDelOption
//
// DESCRIPTION:
//   Perform updates required on option delete event.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function updateOnDelOption()
{
  // Update the UI element.
  var numOptionsToSkip = optionsGrid.getIndex();
  var bSuccess = optionsGrid.del();
  
  // Delete an option tagEdit from gSelectTagEdit's childNode tagEdits. There
  //   may be non-option tag childnodes among the option tags. So, get the
  //   index (n) of the currently selected option node from the optionsGrid,
  //   and delete the nth static option tag from the childNode tagEdits.
  if (bSuccess && numOptionsToSkip > -1)
  {
    var selTagEditChildNodes = gSelectTagEdit.getChildNodes();
    var delPosition = -1;
    for (var i = 0; numOptionsToSkip > -1 && i < selTagEditChildNodes.length; ++i)
    {
      if (   selTagEditChildNodes[i].getTagName().toUpperCase() == "OPTION"
          && !extPart.findInString("dynamicList_option", 
                                   selTagEditChildNodes[i].getOuterHTML(), false)
          && !extPart.findInString("dynamicListNoSel_option", 
                                   selTagEditChildNodes[i].getOuterHTML(), false)
         )
      {
        --numOptionsToSkip;
        delPosition = i;
      }
    }

    selTagEditChildNodes.splice(delPosition, 1);

    gSelectTagEdit.setChildNodes(selTagEditChildNodes);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateOnMoveUpOption
//
// DESCRIPTION:
//   Perform required updates on the moveUp option event.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function updateOnMoveUpOption()
{
  // Update the UI element.
  var numOptionsToSkip = optionsGrid.getIndex();
  optionsGrid.moveUp();
  
  // Move the item in gSelectTagEdit. There may be non-option tag childnodes 
  //   among the option tags. So, be sure to move the selected option above
  //   the next option tag child node.
  if (numOptionsToSkip > -1)
  {
    var selTagEditChildNodes = gSelectTagEdit.getChildNodes();
    
    // Track the new position in selTagEditChildNodes for the moved item.
    var newPosition = -1;
    // Track the old position in selTagEditChildNodes for the moved item.
    var oldPosition = -1;
    for (var i = 0; numOptionsToSkip > -1 && i < selTagEditChildNodes.length; ++i)
    {
      if (   selTagEditChildNodes[i].getTagName().toUpperCase() == "OPTION"
          && !extPart.findInString("dynamicList_option", 
                                   selTagEditChildNodes[i].getOuterHTML(), false)
          && !extPart.findInString("dynamicListNoSel_option", 
                                   selTagEditChildNodes[i].getOuterHTML(), false)
         )
      {
        // If we've found the item to move, set the oldPosition. Otherwise, this
        //   may be the option directly above the one we are moving. So, tentatively
        //   set this as the newPosition. newPosition will be updated as we go along.
        if (numOptionsToSkip == 0)
        {
          oldPosition = i;
        }
        else
        {
          newPosition = i;
        }
        --numOptionsToSkip;
      }
    }

    // If we have a new and old position, move the tagEdit child node.
    if (newPosition > -1 && oldPosition > -1)
    {
      var movedChildNode = selTagEditChildNodes.splice(oldPosition, 1);
      selTagEditChildNodes.splice(newPosition, 0, movedChildNode[0]);
      gSelectTagEdit.setChildNodes(selTagEditChildNodes);
    }
  }  
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateOnMoveDownOption
//
// DESCRIPTION:
//   Perform required updates on moveDown option event.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function updateOnMoveDownOption()
{
  // Update the UI element.
  var numOptionsToSkip = optionsGrid.getIndex();
  optionsGrid.moveDown();

  // Move the item in gSelectTagEdit. There may be non-option tag childnodes 
  //   among the option tags. So, be sure to move the selected option below
  //   the previous option tag child node.
  if (numOptionsToSkip > -1)
  {
    var selTagEditChildNodes = gSelectTagEdit.getChildNodes();
    
    // Track the new position in selTagEditChildNodes for the moved item.
    var newPosition = -1;
    // Track the old position in selTagEditChildNodes for the moved item.
    var oldPosition = -1;
    for (var i = 0; numOptionsToSkip > -2 && i < selTagEditChildNodes.length; ++i)
    {
      if (   selTagEditChildNodes[i].getTagName().toUpperCase() == "OPTION"
          && !extPart.findInString("dynamicList_option", 
                                   selTagEditChildNodes[i].getOuterHTML(), false)
          && !extPart.findInString("dynamicListNoSel_option", 
                                   selTagEditChildNodes[i].getOuterHTML(), false)
         )
      {
        // If we've found the item to move, set the oldPosition. Otherwise, if
        //   this is the option directly below the one we are moving, set the
        //   position below this as the newPosition. 
        if (numOptionsToSkip == 0)
        {
          oldPosition = i;
        }
        else if (numOptionsToSkip == -1)
        {
          newPosition = i + 1;
        }
        --numOptionsToSkip;
      }
    }

    // If we have a new and old position, move the tagEdit child node.
    if (newPosition > -1 && oldPosition > -1)
    {
      var movedChildNode = selTagEditChildNodes.splice(oldPosition, 1);
      // Because newPosition is after oldPosition and we deleted the element
      //   at oldPosition, decrement newPosition.
      --newPosition; 
      selTagEditChildNodes.splice(newPosition, 0, movedChildNode[0]);
      gSelectTagEdit.setChildNodes(selTagEditChildNodes);
    }
  }  
}
