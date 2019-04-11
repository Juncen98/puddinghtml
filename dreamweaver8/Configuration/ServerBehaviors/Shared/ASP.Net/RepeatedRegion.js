// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************

var HELP_DOC = MM.HELP_ssRepeatedRegion;

var _RecordsetName = new RecordsetMenu("RepeatedRegion.htm", "RecordsetName", "");
var _PageSize = new TextField("RepeatedRegion.htm", "PageSize", "");
var _Show = new RadioGroup("RepeatedRegion.htm", "Show", "");

var LAST_PS = 10;
//--------------------------------------------------------------------

function initializeUI()
{
  _RecordsetName.initializeUI();
  _PageSize.initializeUI();
  _Show.initializeUI();

  var elts = document.forms[0].elements;
  if (elts && elts.length)
    elts[0].focus();
}

function updateUI(controlName, event)
{
  if (window["_" + controlName] != null)
  {
    var controlObj = window["_" + controlName];

    if (_RecordsetName.updateUI != null)
    {
      _RecordsetName.updateUI(controlObj, event);
    }
    if (_PageSize.updateUI != null)
    {
      _PageSize.updateUI(controlObj, event);
    }
  }
  
  if (controlName == "Show")
  {
    if (_Show.getValue() == "PageSize")
    {
      _PageSize.setDisabled(false);
    }
    else if (_Show.getValue() == "FixedRange")
    {
      _PageSize.setDisabled(true);
    }
    else if (_Show.getValue() == "All")
    {
      _PageSize.setDisabled(true);
    }
  }
  
  if (controlName == "PageSize"){
    if (_PageSize.getValue() != ""){
      if (_PageSize.getValue() != parseInt(_PageSize.getValue()) || parseInt(_PageSize.getValue()) < 0){
        alert(MM.MSG_ValueGreaterThanOrEqualToZero);
        _PageSize.setValue(LAST_PS);
      }else{
        LAST_PS = _PageSize.getValue();
      }
    }
  }            
}

function displayHelp()
{
  dwscripts.displayDWHelp(HELP_DOC);
}

function findServerBehaviors()
{
  return dwscripts.findSBs(MM.LABEL_TitleRepeatRegion + " (@@RecordsetName@@)", SBRepeatedRegionASPNET);
}

function canApplyServerBehavior(sbObj)
{
  var success = true;

  if (success)
  {
    success = _RecordsetName.canApplyServerBehavior(sbObj);
  }
  if (success)
  {
    success = _PageSize.canApplyServerBehavior(sbObj);
  }
  if (success)
  {
    success = dwscripts.canApplySB(sbObj, true); // preventNesting is true
  }

  return success;
}

function applyServerBehavior(sbObj)
{
  var newObj = null;
  var paramObj = "";
  
  if (sbObj)
  {
    newObj = sbObj.makeEditableCopy();
    paramObj = newObj.getParameters();
  }
  else
  {
    newObj = new SBRepeatedRegionASPNET();
    paramObj = newObj.getParameters();
  }
  
  var errStr = "";

  if (!errStr)
  {
    errStr = _RecordsetName.applyServerBehavior(sbObj, paramObj);
  }
  if (!errStr)
  {
    errStr = _PageSize.applyServerBehavior(sbObj, paramObj);
  }
  if (!errStr)
  {
    errStr = _Show.applyServerBehavior(sbObj, paramObj);
  }
  
  if (!errStr)
  {
    if (!newObj.checkData(sbObj))
    {
      errStr = newObj.getErrorMessage();
    }
  }
   
  if (!errStr)
  {
    try
	  {
	    if (newObj != null)
      {
        // Start off by queueing the necessary edits to the dataset. 
        newObj.queueDataSetDocEdits();
		
        if (sbObj != null)
		    {
		      // Update existing

          var dom = dw.getDocumentDOM();
          var selOffsets = dom.getSelection(true);
          var node = dom.offsetsToNode(selOffsets[0], selOffsets[1]);
      
          if ((node != null) && (node.tagName != "ASP:REPEATER"))
          {
            node = null;
          }

		      newObj.queueDocEdits(node);
          dwscripts.applyDocEdits();
        }
		    else
		    {
		      // First time insert

          dwscripts.fixUpSelection(dw.getDocumentDOM(), true, false);
          dwscripts.applySB(paramObj, null); //extGroup.queueDocEdits(newObj.name, paramObj, null);  
		    }
          
		    // Mark the cache as dirty.
        
	      MMDB.refreshCache(true);
      }
    }
    finally
    {
      // We are building up individual doc edits to apply to the document. If some
      //   JavaScript error occurs, we need to clear leftover edits that didn't
      //   get applied. Otherwise, they'll get added on the next apply.
      
	  dwscripts.clearDocEdits();
    }   
  }

  return errStr;
}

function inspectServerBehavior(sbObj)
{
  // Find the recordset associated with each region and get it's attributes

  var tag = sbObj.findDataSetTag();
  
  if (tag != null)
  {
    sbObj.setPageSize(tag.getAttribute("PageSize"));	  
  }

  _RecordsetName.inspectServerBehavior(sbObj);
  _PageSize.inspectServerBehavior(sbObj);

  // Custom code added to handle the radio buttons

  if (_PageSize.getValue())
  {
    _Show.pickValue("PageSize");
  }
  else
  {
    _Show.pickValue("All");
    _PageSize.setValue("10");
  }
}

function deleteServerBehavior(sbObj)
{
  _RecordsetName.deleteServerBehavior(sbObj);
  _PageSize.deleteServerBehavior(sbObj);

  dwscripts.deleteSB(sbObj);

  // Remove the paging attributes of the associated
  // DataSet tag

  var tag = sbObj.findDataSetTag();

  if (tag != null)
  {
    var tagEdit = new TagEdit(tag);

	tagEdit.removeAttribute("PageSize");
	tagEdit.removeAttribute("CurrentPage");

    dwscripts.queueNodeEdit(tagEdit.getOuterHTML(), tag);
    dwscripts.applyDocEdits();
  }
}

function analyzeServerBehavior(sbObj, allRecs)
{
  _RecordsetName.analyzeServerBehavior(sbObj, allRecs);
  _PageSize.analyzeServerBehavior(sbObj, allRecs);

  sbObj.analyze(allRecs);
}
