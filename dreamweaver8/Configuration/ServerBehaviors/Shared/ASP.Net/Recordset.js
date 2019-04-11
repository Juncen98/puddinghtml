// Copyright 2001, 2002, 2003, 2004 Macromedia, Inc. All rights reserved.

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
}

function findServerBehaviors()
{
  var sbList = dwscripts.findSBs(MM.LABEL_TitleDataSet + " (@@RecordsetName@@)", SBRecordsetASPNET);

  for (var i=0; i < sbList.length; i++) {
    var rsName = sbList[i].getParameter("RecordsetName");
		if (rsName) {
			sbList[i].setTitle(MM.LABEL_TitleDataSet + " (" + rsName + ")");
		}
		//fill specific parameters for every rsType
		for (var j = 0;j < MM.rsTypes.length;j++) {
			if (MM.rsTypes[j].serverModel == dw.getDocumentDOM().serverModel.getServerName()) {
				domCommand = dw.getDocumentDOM(dw.getConfigurationPath() + "/Commands/" + MM.rsTypes[j].command); 
				if (domCommand) {
					windowCommand = domCommand.parentWindow;
					if (windowCommand.fillAditionalParameters) {
						sbList[i] = windowCommand.fillAditionalParameters(sbList[i]);
					}
				}
			}
		}
  }

	for (var i = 0; i < sbList.length; i++)
  {
    sbList[i].postProcessFind("Recordset_main");
  }

  return sbList;
}

function canApplyServerBehavior(sbObj)
{
  dwscripts.canApplySB(sbObj, false); // preventNesting is false
  return true;
}

function applyServerBehavior(oldSB)
{
  var sbObj = oldSB;

  // If the passed in thing isn't actually a Recordset SB,
  // pretend it's not there.  (This can happen when launching
  // the recordset dialog from the dynamic text setup steps.)
  if (sbObj && sbObj.name && sbObj.name.toLowerCase && sbObj.name.toLowerCase() != "recordset")
    sbObj = null;

  if (!sbObj)
  {
    sbObj = new SBRecordsetASPNET();
    
    // Check if any default values are set for us (i.e., drag and drop 
    //   operations from the database panel set the default connection
    //   and table name values and invoke the recordset sb).  
    if (MM.recordsetSBDefaults)
    {
		// RST: added to enable the posibility of creating fake SBs to 
		// behave like Recordsets
		sbObj.name = MM.RecordsetPriorRec;

      sbObj.setConnectionName(MM.recordsetSBDefaults.connectionName);
      sbObj.setDatabaseCall(MM.recordsetSBDefaults.sql, new Array());
      
      // Clear out the default values.
      MM.recordsetSBDefaults = null;
    }
  }

  // Default "Display Debugging Info" to true for new recordsets
  
  if (oldSB == null)
  {
    sbObj.setDebug("true");
  }

  var sbObj = recordsetDialog.display(sbObj);
 
  try
  {
    if (sbObj != null)
    {
	  if (oldSB != null)
	  {
        // Update references to the recordset on name change.
        // We want the call to updateRecordsetRefs() to do the
	    // name change, force the new name back to the old
	  
	    sbObj.updateRecordsetRefs(MM.MSG_UpdateDataSetRefs);
        sbObj.applyParameters[sbObj.EXT_DATA_RS_NAME] = sbObj.parameters[sbObj.EXT_DATA_RS_NAME];
      }

      dwscripts.fixUpSelection(dw.getDocumentDOM(), true, true);
      dwscripts.applySB(sbObj.getParameters(), sbObj);

      // Mark the cache as dirty.

      MMDB.refreshCache(true);
      
      MM.RecordsetApplied = true;
    }
  }
  finally
  {
    // We are building up individual doc edits to apply to the document. If some
    //   JavaScript error occurs, we need to clear leftover edits that didn't
    //   get applied. Otherwise, they'll get added on the next apply.
    
	dwscripts.clearDocEdits();
  }

  return "";
}

function inspectServerBehavior(sbObj)
{
}

function deleteServerBehavior(sbObj)
{
  if (dwscripts.deleteSB(sbObj))
  {
    // Clear out the cache for this recordset.
    SBDatabaseCall.schemaCache.removeCachedSchemaInfo(sbObj.getRecordsetName());
    MMDB.refreshCache(true);
  }
}

function analyzeServerBehavior(sbObj, allRecs)
{
  sbObj.analyze();
}

function updateUI(controlName, event)
{
}

function copyServerBehavior(sbObj) 
{
  sbObj.preprocessForSerialize();
  return true;
}

function pasteServerBehavior(sbObj) 
{
  sbObj.postprocessForDeserialize();
  
  var rsName = sbObj.getRecordsetName();

  if (!sbObj.isUniqueRecordsetName(rsName, ""))
  {
    rsName = sbObj.getUniqueRecordsetName(); 
    sbObj.setRecordsetName(rsName);
  }

  // Apply the edits.
  
  sbObj.queueDocEdits();
  dwscripts.applyDocEdits();
}

function createServerBehaviorObj()
{
  return new SBRecordsetASPNET();
}
