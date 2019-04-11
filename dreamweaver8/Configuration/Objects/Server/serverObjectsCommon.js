// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

// This file manages the behavior of the error dialog that appears when the
// prerequisites are not met for applying a server object into the document.
// The error dialog contains links to the appropriate dialogs in order to
// meet the prerequisite conditions.


//--------------------------------------------------------------------
// FUNCTION:
//   getSetupStepsForServerObject
//
// DESCRIPTION:
//   Returns a javascript array, which represents the steps that
//   need to be completed before a server object can be inserted
//   into the document.
//
// ARGUMENTS:
//   excludeRecordsetCreationStep - boolean - (optional) set to
//     true to elimnate the recordset creation step
//   bDynDataInstrOnly - boolean (optional) set to true for special
//     case wording in instruction dialog for dynamic data steps.
//
// RETURNS:
//   Array of strings
//--------------------------------------------------------------------

function getSetupStepsForServerObject(excludeRecordsetCreationStep, bDynDataInstrOnly)
{
  var steps = new Array();
  var dom = null;
  var documentType = "";
  var serverModel = "";

  // Try to get the server model of the currently open document.
  // If there's no currently open document, get the default server
  // model for the current site.
  dom = dw.getDocumentDOM();
  
  // Try to get the site for the currently selected document
  var url = "";
  var curSite = null;
  if (dom != null)
    url = dom.URL;
  if (url.length > 0)
    curSite = site.getSiteForURL(url);
  else
    curSite = site.getCurrentSite(); 
  if (curSite.length == 0)
	curSite = site.getCurrentServerSite();
  
  if (dom == null)
  {
    dom = dw.getNewDocumentDOM();
  }
  
  if (dom)
  {
    if (dom.documentType)
    {
      documentType = dom.documentType;
    }
    if (dom.serverModel)
    {
      serverModel = dom.serverModel.getFolderName();
    }
  }

	if ((serverModel.indexOf("XSLT") != -1) || ((documentType == "XSLT") || (documentType == "XSLT-fragment")))
	{
			steps.push(dw.loadString("xmlschema/steptitle"));
			steps.push(dw.loadString("xmlschema/stepXMLSource"));
	}
	else
	{
		if (bDynDataInstrOnly)
		{
			// Special case starting text. See DynamicDataInstrOnly.htm.
			steps.push(dw.loadString("insertbar/server/dynamicDataInstruction"));
		}
		else
		{
			steps.push(MM.MSG_BeforeInsertingServerObject);
		}
		if (curSite.length != 0 && site.getIsServerSite(curSite))
		 steps.push(dwscripts.sprintf(MM.MSG_CreateServer,'<a href="#" onMouseDown="event:CreateSite">','</a>'));
		else
		 steps.push(dwscripts.sprintf(MM.MSG_CreateSite,'<a href="#" onMouseDown="event:CreateSite">','</a>'));
		steps.push(dwscripts.sprintf(MM.MSG_ChooseDynamicDocType,'<a href="#" onMouseDown="event:SetDocType">','</a>'));
		if (curSite.length != 0 && site.getIsServerSite(curSite))
		 steps.push(dwscripts.sprintf(MM.MSG_SetURLPrefix,'<a href="#" onMouseDown="event:CreateSite">','</a>'));
		else
 		 steps.push(dwscripts.sprintf(MM.MSG_SetAppServer,'<a href="#" onMouseDown="event:SetAppServer">','</a>'));

		if (documentType == "ColdFusion")
		{
			// ColdFusion specific steps are only for the DWMX version.
			steps.push(dwscripts.sprintf(MM.MSG_SetRDSPassword,'<a href="#" onMouseDown="event:SetRDSPassword">','</a>'));
			steps.push(dwscripts.sprintf(MM.MSG_CreateCFDataSource,'<a href="#" onMouseDown="event:CreateCFDataSource">','</a>'));
		}
  
		if (!excludeRecordsetCreationStep)
		{
			var fmt = MM.MSG_CreateRecordset;
			var before = '<a href="#" onMouseDown="onCreateRecordset()">';
			var after = '</a>';
			var recordsetDisplayName = dwscripts.getRecordsetDisplayName();
		
			steps.push(dwscripts.sprintf(fmt, before, recordsetDisplayName, after));
		}

		if (documentType == "ASP.NET_CSharp" || documentType == "ASP.NET_VB")
		{
			// For ASP.NET, add an optional step specifying to deploy to the testing server bin.
			steps[steps.length-1] += "<br><br>"
														+ dwscripts.sprintf(MM.MSG_DeployToTestingServerBin,
																								'<a href="#" onMouseDown="site.showTestingServerBinDeployDialog()">','</a>'
																							 );
		}
	}

  // The Instruction steps dialog has very little vertical space between the
  //   last instruction and the bottom of the dialog. As a simple workaround, 
  //   we add a <br> at the end of the last instructions text.
  steps[steps.length - 1] += "<br>";
  
  return steps;
}


//--------------------------------------------------------------------
// FUNCTION:
//   setupStepsCompletedForServerObject
//
// DESCRIPTION:
//   Returns an integer indication how many of the steps have been 
//   completed.  A value of -1 indicates that all of the steps
//   are complete.
//
// ARGUMENTS:
//   excludeRecordsetCreationStep - boolean - (optional) set to
//     true to elimnate the recordset creation step
//
// RETURNS:
//   integer
//--------------------------------------------------------------------

function setupStepsCompletedForServerObject(excludeRecordsetCreationStep)
{
  var dom = null;
  var cfDsnList = null;
  var connList = null;
  var documentType = "";
  var serverModel = "";
  var url = "";
  var curSite = null;
  
  // Try to get the site for the currently selected document
  dom = dw.getDocumentDOM();
  if (dom != null)
  {
    url = dom.URL;
  }
  
  if (url.length > 0)
  {
    curSite = site.getSiteForURL(url);
  }
  else
  {
    curSite = site.getCurrentSite();
  }
  if (curSite.length == 0)
	curSite = site.getCurrentServerSite();

 
  // Try to get the server model of the currently selected document
  if (dom == null)
  {
    dom = dw.getNewDocumentDOM();
  }
  if (dom)
  {
    if (dom.documentType)
    {
      documentType = dom.documentType;
    }
    if (dom.serverModel)
    {
      serverModel = dom.serverModel.getFolderName();
    }
  }
  
   // If no site defined, prompt user to create one
  if (curSite.length == 0)
  {
    //for xsl docs we don't need to have a site defined
    if (((documentType != "XSLT") && (documentType != "XSLT-fragment"))) 
    {
      return 0;
    }
  }


	if (((serverModel != null) && (serverModel.indexOf("XSLT") != -1)) ||
	    (((documentType == "XSLT") || (documentType == "XSLT-fragment"))))
	{
		var xmlSourceDoc = dom.xmlSourceDoc;
		if ((xmlSourceDoc != null) && (xmlSourceDoc.length > 0))
		{
			return -1;
		}
		return 0;
	}
	else
	{
		// If doc type does not support server markup, prompt user
		// to choose dynamic doc type
		if (serverModel.length == 0)
		{
			return 1;
		}

		// If no app server is defined, prompt user to specify one
		if (dom.serverModel.testAppServer() == false)
		{
			return 2;
		}

		if (documentType == "ColdFusion")
		{
			// ColdFusion specific steps are only for the DWMX version.

			// Getting the DSN list updates the flag indicating whether we
			// need to prompt for RDS info.
			cfDsnList = MMDB.getColdFusionDsnList();

			// If RDS password is empty, prompt user to supply one
			if (MMDB.needToPromptForRdsInfo(true))
			{
				return 3;
			}

			// If no CF data sources are defined, send user to CF Administrator
			if (cfDsnList == null || cfDsnList.length == 0)
			{
				return 4;
			}
    
			// If no recordsets are defined, then send user to recordset sb
			if (!excludeRecordsetCreationStep && !recordsetIsDefined())
			{
				return 5;
			}
		}
	/*//The deploy instruction for asp.net is optional...
		else if (documentType == "ASP.NET_CSharp" || documentType == "ASP.NET_VB")
		{
			// If ASCX files have not yet been deployed, send user to deploy dialog
			if (site.getNeedToDeployTestingServerBin())
			{
				return 3;
			}

			// If no recordsets are defined, then send user to recordset sb
			if (!excludeRecordsetCreationStep && !recordsetIsDefined())
			{
				return 4;
			}
		}
	*/
		else
		{   
			// If no recordsets are defined, then send user to recordset sb
			if (!excludeRecordsetCreationStep && !recordsetIsDefined())
			{
				return 3;
			}
		}
	}

  // All setup steps have been completed
  return -1;
}



//--------------------------------------------------------------------
// FUNCTION:
//   onCreateRecordset
//
// DESCRIPTION:
//   Handles event that user clicked the create recordset instruction step.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function onCreateRecordset()
{
  // Only popup the recordset dialog if the document has a server model.
  if (dwscripts.hasServerModel())
  {
    saveBodyRelativeSelection();
    dw.popupServerBehavior("Recordset.htm");
    restoreBodyRelativeSelection();
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   recordsetIsDefined
//
// DESCRIPTION:
//   Returns true if a recordset is currently defined on the page
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function recordsetIsDefined()
{
  var retVal = false;
  
  var rsList = dwscripts.getRecordsetNames();
  if (rsList && rsList.length > 0)
  {
    retVal = true;
  }
  
  return retVal;
}



//--------------------------------------------------------------------
// FUNCTION:
//   saveBodyRelativeSelection
//
// DESCRIPTION:
//   Stores the body tag relative location of the current selection
//   in the global variable CURRENT_SEL.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

var CURRENT_SEL = null;

function saveBodyRelativeSelection()
{
  var dom = dw.getDocumentDOM();
  
  var sel = dom.getSelection();
  
  if (sel && sel.length > 1)
  {
    var bodyOffset = dom.nodeToOffsets(dom.body);

    sel[0] = sel[0] - bodyOffset[0];
    sel[1] = sel[1] - bodyOffset[0];
    
    CURRENT_SEL = sel;
  }  
}


//--------------------------------------------------------------------
// FUNCTION:
//   restoreBodyRelativeSelection
//
// DESCRIPTION:
//   Sets the selection back to it's original location, before the
//   recordset was inserted.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function restoreBodyRelativeSelection()
{
  var sel = CURRENT_SEL;
  CURRENT_SEL = null;
  
  if (sel)
  {
    var dom = dw.getDocumentDOM();
    
    var bodyOffset = dom.nodeToOffsets(dom.body);
    
    sel[0] = sel[0] + bodyOffset[0];
    sel[1] = sel[1] + bodyOffset[0];
    
    dom.setSelection(sel[0], sel[1]);
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   replaceSelectionInDoc
//
// DESCRIPTION:
//	 replaces the current selection with xslt tag around it.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function replaceSelectionInDoc(retCode)
{
	var dom = dw.getDocumentDOM();
	if( dom )
	{
		var sel = dwscripts.getBalancedSelection(dom);
		var docHTML = dom.documentElement.outerHTML;
		var preCode  = docHTML.substring(0,sel[0]);
		var postCode = docHTML.substring(sel[sel.length-1]);
		var newDocHTML = preCode + retCode + postCode;
		dom.documentElement.outerHTML = newDocHTML;
	}
}


//--------------------------------------------------------------------
// FUNCTION:
//   replaceSelectionInDocRemoveNBSP
//
// DESCRIPTION:
//	 replaces the current selection with xslt tag around it, removing the
//   &nbsp string if present
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function replaceSelectionInDocRemoveNBSP(retCode)
{
 	wrapOrReplaceSelectionInDocRemoveNBSP("", "", "", retCode);
}

//--------------------------------------------------------------------
// FUNCTION:
//   wrapSelectionInDocRemoveNBSP
//
// DESCRIPTION:
//	 wraps the current selection with xslt tag around it, removing the
//   &nbsp string if present
//
// ARGUMENTS:
//   codeBeforeSel - what to put before the current selection, codeAfter, defaultForEmptySelection
//	 codeAfterSel - what to put after the current selection
//	 defaultCodeForEmptySel - what to use if the selection is empty or just an nbsp
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function wrapSelectionInDocRemoveNBSP(codeBeforeSel, codeAfterSel, defaultCodeForEmptySel)
{
    wrapOrReplaceSelectionInDocRemoveNBSP(codeBeforeSel, codeAfterSel, defaultCodeForEmptySel)
}

//--------------------------------------------------------------------
// FUNCTION:
//   wrapOrReplaceSelectionInDocRemoveNBSP
//
// DESCRIPTION:
//	 wraps the current selection with xslt tag around it, removing the
//   &nbsp string if present, and replace the selection if wanted. Common
//	 implementation for above functions
//
// ARGUMENTS:
//   codeBeforeSel - what to put before the current selection, codeAfter, defaultForEmptySelection
//	 codeAfterSel - what to put after the current selection
//	 defaultCodeForEmptySel - what to use if the selection is empty or just an nbsp
//	 codeToReplaceSel - code to replace the selection
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function wrapOrReplaceSelectionInDocRemoveNBSP(codeBeforeSel, codeAfterSel, defaultCodeForEmptySel, codeToReplaceSel)
{
    var dom = dw.getDocumentDOM();
	if( dom )
	{
		var sel =  dwscripts.getBalancedSelection(dom);
		var docHTML = dom.documentElement.outerHTML;
		var preCode  = docHTML.substring(0,sel[0]);
		var nbspStr = dom.getNBSPChar();
		if (preCode.length > nbspStr.length)
		{
			var nbspIndex = preCode.lastIndexOf(nbspStr); 
			if (nbspIndex != -1)
			{
				if (nbspIndex == preCode.length-nbspStr.length)
				{
					//we have a &nbsp; preceeding us we can remove
					preCode = preCode.substring(0,preCode.length - nbspStr.length);
				}
			}
		}
		var postCode = docHTML.substring(sel[sel.length-1]);
		if (postCode.length > nbspStr.length)
		{
		  //we have a &nbsp; following us we can remove
			var nbspIndex = postCode.indexOf(nbspStr); 
			if (nbspIndex != -1)
			{
				if (nbspIndex == 0)
				{
					//we have a &nbsp; preceeding us
					postCode = postCode.substring(nbspStr.length,postCode.length);
				}
			}
		}
		
		var selectedCode;
		if( codeToReplaceSel )
		{
			selectedCode = codeToReplaceSel;
		}
		else
		{
			selectedCode = docHTML.substring(sel[0], sel[sel.length-1]);
			if (!selectedCode || selectedCode.length == 0 || selectedCode == nbspStr)
				selectedCode = defaultCodeForEmptySel;
		}
		
		if( !codeBeforeSel )
			codeBeforeSel = "";
		if( !codeAfterSel )
			codeAfterSel = "";
				
		var newDocHTML = preCode + codeBeforeSel + selectedCode + codeAfterSel + postCode;
		dom.documentElement.outerHTML = newDocHTML;
	}
}