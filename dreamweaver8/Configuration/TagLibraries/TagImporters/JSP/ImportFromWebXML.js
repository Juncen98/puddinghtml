///////////////////////////////////////////////////////////////////////////////
//
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//
// FileName: ImportFromWebXML.js
//
// Description: This is the implementation for JSP Import From WebXML
//             feature available from the Tag Libraries dialog
//
///////////////////////////////////////////////////////////////////////////////

//*************************API**************************


var helpDoc = MM.HELP_cmdtiImportWebXML;

var SELECTOBJ;
var URICONTROL;
var tldDom;				//dom for the tld.

//*******************API*********************
///////////////////////////////////////////////////////////////////////////////
//  Func Name: canImportTags
//
//  Purpose: Gets called from the Tag DataBase to allow a Tag Import Item to 
//           be disabled 
//      
//  Input Args: None  
//
//  Returns: boolean
//           True if the Site is an JSP site and if there's a remote folder.
//
///////////////////////////////////////////////////////////////////////////////

function canImportTags()
{
  /* 
    Ensure that the ServerModel is JSP and that there's a server to introspect from.
  */
  var retVal  = false;

  var bIsValid = ((site.getAppServerAccessType() != "none") && (site.getAppURLPrefixForSite().length));
  if (bIsValid)
  {
    retVal = true;
  }
  else
  {
    retVal = false;
	alert(MM.MSG_JSPServerMissing);
  }

  if (bIsValid)
  {
	  // Refuse to import if the site's server model is not JSP
	  if(site.getServerModelNameForSite() == "JSP")
	  {
			retVal = true;
	  }
	  else
	  {
		    retVal = false;
			alert(MM.MSG_JSPSiteMissing);
	  }
  }


  return retVal;
}

///////////////////////////////////////////////////////////////////////////////
//  Func Name: importTags
//
//  Purpose: Gets called from the Tag DataBase dialog when the user clicks 
//           selects the JSP\ImportFromWebXML menu item from the Plus Menu.  
//      
//  Input Args: None  
//
//  Returns: boolean
//           True if everything went well, false otherwise.
//
///////////////////////////////////////////////////////////////////////////////
function importTags()
{
	if (SELECTOBJ.getLen()==0)
	{
		alert(MM.MSG_ImportNoTLDsINWEBXML);
		return false;
	}

	var uriloc = SELECTOBJ.getValue();
	if ( uriloc.length)
	{
		var tldData	 = MMHttp.postText(site.getAppURLPrefixForSite() + "_mmServerScripts/getTLD.jsp","uri="+ uriloc,"application/x-www-form-urlencoded");
	}

	if (tldData.statusCode != 200)
	{
		alert(errMsg(MM.MSG_ImportHTTPError,httpError(tldData.statusCode)));
		return false;
	}

	//Initialize the type library dom.
	tldDom			= dw.getDocumentDOM(dw.getConfigurationPath() + '/Shared/MM/Cache/empty.htm');	
	tldDom.documentElement.outerHTML = tldData.data;
	var status = buildTagTree(tldDom,uriloc,"");	
	return status;
}

///////////////////////////////////////////////////////////////////////////////
//  Func Name: initializeUI
//
//  Purpose: Event handler for the form onLoad event.Initialize ui elements
//			 populates with the list of tag libraries avaiable on the server.
//			
//  Input Args: None  
//
//  Returns: Nothing
//
///////////////////////////////////////////////////////////////////////////////

function initializeUI()
{
   SELECTOBJ = new ListControl("ds");
   URICONTROL		= findObject("uri");

   var selectedDS = MM.commandReturnValue;

	//use Remote DS List.
	remoteTLDs = getRemoteTLDList();
	SELECTOBJ.setAll(remoteTLDs[0], remoteTLDs[1]);

  if(!SELECTOBJ.pickValue(selectedDS))
		SELECTOBJ.setIndex(0);
	
  syncURILoc();

}

///////////////////////////////////////////////////////////////////////////////
//  Func Name: getRemoteTLDList
//
//  Purpose: retrieve tld entries from web.xml of the server application.
//			 handle errors if it fails to find one.
//			
//  Input Args: None  
//
//  Returns: Nothing
//
///////////////////////////////////////////////////////////////////////////////


function getRemoteTLDList()
{
	//it get a list of remote JNDI References.
	var httpReply	  = MMHttp.postText(site.getAppURLPrefixForSite() + "_mmServerScripts/getWEBxml.jsp","","application/x-www-form-urlencoded","","TagLibIntrospection/JSP1.2/");
	var  remoteTLDs			= new Array();
	var  remoteTLDUri		= new Array();
	var  remoteTLDLoc		= new Array();
	var tempFilename = dw.getConfigurationPath() + '/Shared/MM/Cache/empty.htm';
	if (DWfile.exists(tempFilename)) 
	{
		var tempDOM	 = dw.getDocumentDOM(tempFilename);
		tempDOM.documentElement.outerHTML = httpReply.data;

		if (httpReply.statusCode != 200)
		{
			alert(errMsg(MM.MSG_ImportHTTPError,httpError(httpReply.statusCode)));
			remoteTLDs.push(remoteTLDUri);
			remoteTLDs.push(remoteTLDLoc);
			return remoteTLDs;
		}

		var taglibNodes = tempDOM.getElementsByTagName("taglib");

		//Check if the web.xml on the application has taglibraries
		//if not display an error message.

		if (taglibNodes.length)
		{
			for (var i=0;i<taglibNodes.length;i++)
			{
				var cNodes	= taglibNodes[i].childNodes;

				for (var j=0;j<cNodes.length;j++)
				{
					if (cNodes[j].tagName == "TAGLIB-URI")
					{
						remoteTLDUri.push(cNodes[j].innerHTML);
					}
					else if (cNodes[j].tagName == "TAGLIB-LOCATION")
					{
						remoteTLDLoc.push(cNodes[j].innerHTML);
					}
				}
			}
		}
		else
		{
			var errNodes	= tempDOM.getElementsByTagName("ERROR");
			if (errNodes.length > 0)
			{
				var errMessage	= errNodes[0].getAttribute("Description");
				alert(errMsg(MM.MSG_ImportHTTPError,errMessage));
			}
			else
			{
				alert(MM.MSG_ImportNoTLDsINWEBXML);
			}
		}
	}

	remoteTLDs.push(remoteTLDUri);
	remoteTLDs.push(remoteTLDLoc);

	return remoteTLDs
}

///////////////////////////////////////////////////////////////////////////////
//  Func Name: syncURILoc
//
//  Purpose: sync the selection to text field.
//	
//  Input Args: None  
//
//  Returns: Nothing
//
///////////////////////////////////////////////////////////////////////////////

function syncURILoc()
{
	var uriloc = SELECTOBJ.getValue();
	URICONTROL.innerHTML = uriloc;
}