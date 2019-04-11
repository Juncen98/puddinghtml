// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var DEBUG = false;
var proxyClass = "";
var helpDoc = MM.HELP_compWebServices;

var WEB_SERVICES_FILENAME="Components/Common/WebServices/WebServices.gif";
var WEB_SERVICES_CLASS_FILENAME="Components/Common/WebServices/WebServicesClass.gif";
var BROKEN_WEB_SERVICES_FILENAME = "Components/Common/WebServices/BrokenWebServices.gif";
var FIELDS_PUBLIC_FILENAME = "Components/Common/fieldpublic.gif";
var FIELDS_NONPUBLIC_FILENAME = "Components/Common/fieldnonpublic.gif";
var METHODS_FILENAME = "Shared/MM/Images/DSL_D.gif";
var METHODS_PUBLIC_FILENAME = "Components/Common/methodpublic.gif";
var METHODS_NONPUBLIC_FILENAME = "Components/Common/methodnonpublic.gif";
var PROPERTIES_PUBLIC_FILENAME = "Components/Common/propertypublic.gif";
var PROPERTIES_NONPUBLIC_FILENAME = "Components/Common/propertypublic.gif";

var PROXYBUTTONUP = "Shared/MM/Images/refresh.gif";
var PROXYBUTTONDOWN = "Shared/MM/Images/refresh_sel.gif";
var PROXYBUTTONDISABLED	= "Shared/MM/Images/refresh_dis.gif";
var EDITWSERVICEBUTTONUP = "Shared/MM/Images/edit.gif";
var EDITWSERVICEBUTTONDOWN = "Shared/MM/Images/edit_sel.gif";
var EDITWSERVICEBUTTONDISABLED = "Shared/MM/Images/edit_dis.gif";
var DEPLOYSUPPORTBUTTONUP = "Components/Common/WebServices/DeployUp.gif";
var DEPLOYSUPPORTBUTTONDOWN = "Components/Common/WebServices/DeployDown.gif";
var PROPERTIES_FILENAME = "Shared/MM/Images/DSL_D.gif";
var FIELDS_FILENAME = "Shared/MM/Images/DSL_D.gif";
var PLUS_BUTTON_UP				= "Shared/MM/Images/btnAdd.gif";
var PLUS_BUTTON_DOWN			= "Shared/MM/Images/btnAdd_sel.gif";
var proxyloc = "";

//*******************  COMPONENT API **********************

//*-------------------------------------------------------------------
// FUNCTION:
//	 displayInstructions
//
// DESCRIPTION:
//	 returns a instructions string to assist the user to make decisions.
//
// ARGUMENTS:
//	 none.
//	
// RETURNS:
//	 boolean
//--------------------------------------------------------------------
function displayInstructions()
{
	var dispMsg = "";

	if(dwscripts.IS_WIN)
	{
		dispMsg =  MM.MSG_WinWebServicesInstructions;
	}
	else
	{
		dispMsg =  MM.MSG_MacWebServicesInstructions;
	}

	return dispMsg;
}


//*-------------------------------------------------------------------
// FUNCTION:
//	 getComponentChildren
//
// DESCRIPTION:
//	 returns a list of component Children.
//
// ARGUMENTS:
//	 parentNode-componentRec.
//	
// RETURNS:
//	 an array of componentRec nodes.
//--------------------------------------------------------------------

function getComponentChildren(componentRec)
{
	var cs_Children = new Array();
	dom = dw.getDocumentDOM();
	var aDocServerModel = null;
	if (dom && dom.serverModel)
	{
		aDocServerModel = dom.serverModel.getDisplayName();
	}
	else
	{
		//since web services are site level components
		//look in site server model too.
		aDocServerModel = site.getServerDisplayNameForSite();
	}

	if(!aDocServerModel || !aDocServerModel.length)
	{
		return cs_Children;
	}
	if (!componentRec)
	{
		// read the persisted web services
		var WebServicesList = new Array();

		// create path to site-specific web services list file
		var aSiteConfigurationPath = dw.getSiteConfigurationPath();
		if(!aSiteConfigurationPath || !aSiteConfigurationPath.length)
		{
			return;
		}
		var aWebServiceListPath = aSiteConfigurationPath + WebServiceListFile;
		if (DWfile.exists(aWebServiceListPath))
		{
			var listData = DWfile.read(aWebServiceListPath);
			if(listData)
			{
				var listDom = dw.getDocumentDOM(dw.getConfigurationPath() + '/Shared/MM/Cache/empty.htm');
				listDom.documentElement.outerHTML = listData;
				var WebServiceNodes = listDom.getElementsByTagName(WSTag);
				var WebServicesList = new Array();
				if (WebServiceNodes.length)
				{
					var aRecordReader = new WSRecordReader();
					var n = WebServiceNodes.length;
					for(var i = 0; i < n; i++)
					{
						var WebServiceObj = aRecordReader.readFromElement(WebServiceNodes[i]);
						WebServicesList.push(WebServiceObj);
					}
				}
			}
		}

		// iterate over the web service records that were read
		if(WebServicesList.length)
		{
			var n = WebServicesList.length;
			for (var i = 0; i < n; i++ )
			{
				var aWebServiceObj = WebServicesList[i];
				if(!aWebServiceObj)
				{
					continue;
				}

				// don't display web services that don't match doc's server model
				var aServerModel = aWebServiceObj[ServerModelPropName];
				if(!aServerModel || !aServerModel.length || aServerModel != aDocServerModel)
				{
					continue;
				}

				// get the web service name
				var aName = aWebServiceObj[WebServiceNamePropName];

				// get the tooltip
				var tooltipText;
				if(aWebServiceObj[WSDLLocationPropName])
				{
					tooltipText = aWebServiceObj[WSDLLocationPropName];
				}
				else
				{
					tooltipText = aWebServiceObj[WebServiceNamePropName];
				}

				// ComponentRec(name,imageFile,bHasChildren,bIsDraggable,toolTipText,bAllowDelete)
				var rootCompInfo = new ComponentRec(aName, WEB_SERVICES_FILENAME, true, aWebServiceObj.dropcode != null, tooltipText, true);
				rootCompInfo.wsRec = aWebServiceObj;
				rootCompInfo.objectType = "Root";
				if(aWebServiceObj.dropcode)
				{
					rootCompInfo.dropCode = aWebServiceObj.dropcode;
				}
				cs_Children.push(rootCompInfo);
			}
		}
	}
	else
	{
		var aWebServiceObj = componentRec.wsRec;
		if(aWebServiceObj.constructor == Array)
		{
			for(var i = 0; i < aWebServiceObj.length; i++)
			{
				var aChild = aWebServiceObj[i];
				if(aChild.name)
				{
					var anImageFile = WEB_SERVICES_FILENAME;
					if(aChild.type)
					{
						switch(aChild.type)
						{
							case "DataTypes":
								anImageFile = FIELDS_FILENAME;
								break;
							case "Class":
								anImageFile = WEB_SERVICES_CLASS_FILENAME;
								break;
							case "Fields":
								anImageFile = FIELDS_FILENAME;
								break;
							case "Field":
								anImageFile = FIELDS_PUBLIC_FILENAME;
								break;
							case "Method":
								anImageFile = METHODS_PUBLIC_FILENAME;
								break;
							case "Arg":
								anImageFile = FIELDS_PUBLIC_FILENAME;
								break;
							default:
								break;
						}
					}
					var tooltipText = null;
					if(aChild.tooltip)
					{
						tooltipText = aChild.tooltip;
					}

					var hasChildren = aChild.constructor == Array && aChild.length > 0;
					var aCompInfo = new ComponentRec(aChild.name, anImageFile, hasChildren, true, tooltipText);
					if(aChild.dropcode)
					{
						aCompInfo.dropCode = aChild.dropcode;
					}
					else
					{
						aCompInfo.dropCode = aChild.name;
					}
					aCompInfo.wsRec = aChild;
					cs_Children.push(aCompInfo);
				}
			}
		}
	}
	if (cs_Children.length)
		cs_Children = cs_Children.sort(nameSort);

	return cs_Children;
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 getContextMenuId
//
// DESCRIPTION:
//	 returns the context menu id for the connection view
//
// ARGUMENTS:
//		String;
//	
// RETURNS:
//	 context menu id
//--------------------------------------------------------------------
function getContextMenuId()
{
	return "DWWebServicesContext";
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 toolbarButtons
//
// DESCRIPTION:
//	 returns a list of toolbaricons
//
// ARGUMENTS:
//	 none
//	
// RETURNS:
//	 array of toolbar buttons and event handlers.
//--------------------------------------------------------------------

function toolbarControls()
{
	var toolBarBtnArray = new Array();

	dom = dw.getDocumentDOM();
	var plusButton = new ToolbarControlRec();
	var aServerModelName = null;
	if (dom && dom.serverModel)
	{
		aServerModelName = dom.serverModel.getDisplayName();
	}
	else
	{
		//look in the site for potential server model
		aServerModelName = site.getServerDisplayNameForSite();
	}

	if (aServerModelName.length)
	{
		if(aServerModelName == "ColdFusion")
		{
			plusButton.image			= PLUS_BUTTON_UP;
			plusButton.pressedImage		= PLUS_BUTTON_DOWN;
			plusButton.disabledImage	= PLUS_BUTTON_UP;
			plusButton.toolStyle		= "left";
			plusButton.toolTipText		= MM.MSG_WebServicesAddToolTipText;
			plusButton.enabled			= "dwscripts.IS_WIN";
			plusButton.command			= "invokeWebService()";
		}
		else
		{
			plusButton.image			= PLUSDROPBUTTONUP;
			plusButton.pressedImage		= PLUSDROPBUTTONDOWN;
			plusButton.disabledImage	= PLUSDROPBUTTONUP;
			plusButton.toolStyle		= "left";
			plusButton.toolTipText		= MM.MSG_WebServicesAddToolTipText;
			plusButton.enabled			= "dwscripts.IS_WIN";
			plusButton.menuId = "DWWebServicesChoosersContext";
		}
		toolBarBtnArray.push(plusButton);

		var minusButton = new ToolbarControlRec();
		minusButton.image			= MINUSBUTTONUP;
		minusButton.pressedImage	= MINUSBUTTONDOWN;
		minusButton.disabledImage	= MINUSBUTTONDISABLED;
		minusButton.toolStyle		= "left";
		minusButton.toolTipText		= MM.MSG_WebServicesDeleteToolTipText;
		minusButton.command = "clickedDelete()";
		minusButton.enabled = "(dw.serverComponentsPalette.getSelectedNode() != null && dw.serverComponentsPalette.getSelectedNode() && ((dw.serverComponentsPalette.getSelectedNode().objectType=='Root') || (dw.serverComponentsPalette.getSelectedNode().objectType == 'Error') || (dw.serverComponentsPalette.getSelectedNode().objectType == 'MissingProxyGen')))";
		toolBarBtnArray.push(minusButton);

		if(aServerModelName != null && aServerModelName.indexOf(".NET") >= 0)
		{
			var deployWServiceButton = new ToolbarControlRec();
			deployWServiceButton.image			= DEPLOYSUPPORTBUTTONUP;
			deployWServiceButton.pressedImage	= DEPLOYSUPPORTBUTTONDOWN;
			deployWServiceButton.disabledImage	= DEPLOYSUPPORTBUTTONUP;
			deployWServiceButton.toolStyle		= "right";
			deployWServiceButton.toolTipText		= MM.MSG_WebServicesDeployToolTipText;
			deployWServiceButton.command = "site.showTestingServerBinDeployDialog()";
			deployWServiceButton.enabled = true;
			toolBarBtnArray.push(deployWServiceButton);
		}
		//add the rebuild proxy button for windows only.
		//bug 45552:
		if(navigator.platform.charAt(0) !="M")
		{
			var proxyButton = new ToolbarControlRec();
			proxyButton.image			= PROXYBUTTONUP;
			proxyButton.pressedImage	= PROXYBUTTONDOWN;
			proxyButton.disabledImage	= PROXYBUTTONDISABLED;
			proxyButton.toolStyle		= "right";
			proxyButton.toolTipText		= MM.MSG_WebServicesRegenToolTipText;
			proxyButton.command = "reGenerateProxy()";
			proxyButton.enabled = "enableRegenerateProxyButton()";
			toolBarBtnArray.push(proxyButton);
		}
	}

	return toolBarBtnArray;

}

//*-------------------------------------------------------------------
// FUNCTION:
//	 getCodeViewDropCode
//
// DESCRIPTION:
//	 returns the code snippet to drop after a drag operation.
//
// ARGUMENTS:
//	 component Rec.
//	
// RETURNS:
//	 code to drop into code view.
//--------------------------------------------------------------------

function getCodeViewDropCode(componentRec)
{
	var codeToDrop="";
	if (componentRec)
	{
/*
		if (componentRec.objectType=="Class")
		{
			codeToDrop =  dw.getExtDataValue("webservices_constructor", "insertText");
			codeToDrop =  codeToDrop.replace(RegExp("@@Id@@","g"),componentRec.name);
			codeToDrop =  codeToDrop.replace(RegExp("@@Class@@","g"),componentRec.name);
		}
		else if (componentRec.objectType=="Method")
		{
			codeToDrop = componentRec.dropCode;
		}
*/
		if(componentRec.dropCode)
		{
			codeToDrop = componentRec.dropCode;
		}
		else
		{
			codeToDrop = componentRec.name;
		}
	}
	return codeToDrop;
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 deleteComponent
//
// DESCRIPTION:
//	 pressing the "del" key or using the cut operation cause delete to happen.
//
// ARGUMENTS:
//	 component Rec.
//	
// RETURNS:
//	 errorString if it fails to delete
//--------------------------------------------------------------------

function deleteComponent(componentRec)
{
	clickedDelete();
}

//*******************  COMPONENT API **********************
//*-------------------------------------------------------------------
// FUNCTION:
//	 handleDoubleClick
//
// DESCRIPTION:
//	 event handler to javascript to implement on double clicked on item.
//
// ARGUMENTS:
//	 parentNode-componentRec.
//	
// RETURNS:
//	 nothing
//--------------------------------------------------------------------

function handleDoubleClick(componentRec)
{
	var selectedObj = dw.serverComponentsPalette.getSelectedNode();
	// enable only for windows...
	if(dwscripts.IS_WIN)
	{  
		if (selectedObj && selectedObj.wsRec && selectedObj.wsRec[ProxyGeneratorNamePropName])
		{
			if (selectedObj.objectType == "Root")
			{
				editWebService(); 
				return true;
			}
			else if (selectedObj.objectType == "MissingProxyGen")
			{
				displayMissingProxyGenMessage(componentRec);			
				editWebService();
				return true;
			}
		}
	}
	return false;
}

//*******************  LOCAL	FUNCTIONS **********************
//*-------------------------------------------------------------------
// FUNCTION:
//	 clickedDelete
//
// DESCRIPTION:
//	Deletes the currently selected node
//
// ARGUMENTS:
//	None
//
// RETURNS:
//	Nothing
//--------------------------------------------------------------------

function clickedDelete()
{
	var selectedObj = dw.serverComponentsPalette.getSelectedNode();
	if ((selectedObj && selectedObj.objectType == "Root")||
		(selectedObj && selectedObj.objectType == "Error") ||
		(selectedObj && selectedObj.objectType == "MissingProxyGen"))
	{
		var wsRec = selectedObj.wsRec;
		if(wsRec)
		{
			var aName = wsRec[WebServiceNamePropName];
			if (aName)
			{
				deleteWebServiceEntry(aName);
			}
		}
	}
	dw.serverComponentsPalette.refresh();
}

//*-------------------------------------------------------------------
// FUNCTION:
//	editWebService
//
// DESCRIPTION:
//	Brings up the Web Services dialog so that the user can edit
//	the Web Service
//
// ARGUMENTS:
//	None
//	
// RETURNS:
//	Nothing
//--------------------------------------------------------------------

function editWebService()
{
	var selectedObj = dw.serverComponentsPalette.getSelectedNode();
	if (selectedObj && selectedObj.wsRec)
	{
		if ((selectedObj.objectType == "Root")||
			(selectedObj.objectType == "MissingProxyGen"))
		{
			var wsRec = selectedObj.wsRec;
			if(wsRec)
			{
				MMWS.showWebServicesDialog(MM.LABEL_EditUsingWSDLName, wsRec);
			}
		}
	}
}


//*-------------------------------------------------------------------
// FUNCTION:
//	reGenerateProxy
//
// DESCRIPTION:
//	Regenerates the currently selected proxy
//
// ARGUMENTS:
//	None
//	
// RETURNS:
//	Nothing
//--------------------------------------------------------------------

function reGenerateProxy()
{
	var selectedObj = dw.serverComponentsPalette.getSelectedNode();
	if(selectedObj && selectedObj.wsRec && selectedObj.wsRec[ProxyGeneratorNamePropName])
	{
		var wsRec = selectedObj.wsRec;
		var someApplyProxyParams = new Object();
		someApplyProxyParams.$$WSDLFILE = wsRec[WSDLLocationPropName];
		someApplyProxyParams.$$SITEROOT = wsRec[SiteRootPropName];
		someApplyProxyParams.$$USERNAME = wsRec[UserNamePropName];
		someApplyProxyParams.$$USERPASSWORD = wsRec[PasswordPropName];

		if ((selectedObj.objectType == "Root"))
		{
			// get the proxy generator rec
			var proxyGenRec = MMWS.getProxyGenerator(wsRec[ProxyGeneratorNamePropName]);
			if (proxyGenRec)
			{
				var filename = proxyGenRec.filename;
				var path = getWebServicesDirectory();
				if (path && filename)
				{
					filename = path + filename; 			
					//call the proxydocument.parentWindow.function.
					var dom, errMsg;
					if (filename)
					{
						dom = dw.getDocumentDOM(filename);
						// call the initializeUI and loadProxy just to see if it fixes the problem
						if (dom)
						{
							// first load the proxy into local values...
							if(dom.parentWindow.initializeUI != null)
							{
								dom.parentWindow.initializeUI();
							}
							if(dom.parentWindow.loadProxy != null)
							{
								dom.parentWindow.loadProxy(proxyGenRec);
							}
							if (dom.parentWindow.applyProxy != null)
							{
								errMsg =dom.parentWindow.applyProxy(proxyGenRec, someApplyProxyParams);
								if(errMsg)
									alert(errMsg);
							}
						}
					}
				}
			}
		}
		dw.serverComponentsPalette.refresh();
	}
}

//*******************  LOCAL	FUNCTIONS **********************
//*-------------------------------------------------------------------
// FUNCTION:
//	 enableEditProxyButton
//
// DESCRIPTION:
//	 returns if the editProxy button should be enabled or not
//
// ARGUMENTS:
//	 none
//	
// RETURNS:
//	 boolean
//--------------------------------------------------------------------

function enableEditProxyButton()
{
	var retVal = false;
	var selectedObj = dw.serverComponentsPalette.getSelectedNode();

	// enable only for windows...
	if(dwscripts.IS_WIN)
	{
		if (selectedObj && selectedObj != null)
		{
			if (selectedObj.wsRec && selectedObj.wsRec[ProxyGeneratorNamePropName])
			{
				if (selectedObj.objectType == "Root" ||
						selectedObj.objectType == "MissingProxyGen")
				{
					retVal = true;
				}
			}
		}
	}
	return retVal;
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 enableRegenerateProxyButton
//
// DESCRIPTION:
//	 returns if the regenerateProxy button should be enabled or not
//
// ARGUMENTS:
//	 none
//	
// RETURNS:
//	 boolean
//--------------------------------------------------------------------

function enableRegenerateProxyButton()
{
	var retVal = false;
	var selectedObj = dw.serverComponentsPalette.getSelectedNode();
	// enable only for windows...
	if(dwscripts.IS_WIN)
	{
		if (selectedObj && selectedObj != null)
		{
			if (selectedObj.wsRec && selectedObj.wsRec[ProxyGeneratorNamePropName])
			{
				if (selectedObj.objectType == "Root")
				{
					retVal = true;
				}
			}
		}
	}
	return retVal;
}


//*-------------------------------------------------------------------
// FUNCTION:
//	 invokeWebService
//
// DESCRIPTION:
//	 invoke the Web Services dialog.
//
// ARGUMENTS:
//	 component Rec.
//	
// RETURNS:
//	 code to drop into code view.
//--------------------------------------------------------------------
function invokeWebService()
{
  // create a dummy wsRec object...
	var wsRec = new Object();
	MMWS.showWebServicesDialog(MM.LABEL_AddUsingWSDLName, wsRec);
	dw.serverComponentsPalette.refresh();
}


//*-------------------------------------------------------------------
// FUNCTION:
//	 nameSort
//
// DESCRIPTION:
//	 sort algorithm based on names
//
// ARGUMENTS:
//	obj1  :	 The first object
//	obj2	: 	The second object
//	
// RETURNS:
//	 integer
//--------------------------------------------------------------------

function nameSort(obj1, obj2)
{
	return LocaleSort.compareString(obj1.name, obj2.name);
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 displayMissingProxyGenMessage
//
// DESCRIPTION:
//	 displays missing proxy generator message
//
// ARGUMENTS:
//	componentRec
//	
// RETURNS:
//	 nothing
//--------------------------------------------------------------------

function displayMissingProxyGenMessage(componentRec)
{
	var errMessage = getOtherErrorMessage(componentRec.code, componentRec.value, componentRec.wsRec[ProxyGeneratorNamePropName]);
	alert(errMessage);
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 isProxyClassForSM
//
// DESCRIPTION:
//	Checks if the class inherits from a Web Service class or not and
//	returns true or false accordingly 
//
// ARGUMENTS:
//	classDescriptor: the description of the class
//	
// RETURNS:
//	boolean
//--------------------------------------------------------------------

function isProxyClassForSM(classDescriptor)
{
	var isProxy = false;
	isProxy = isProxyClass(classDescriptor);
	return isProxy;
}

//*-------------------------------------------------------------------
// FUNCTION:
//	isProxyClass
//
// DESCRIPTION:
//	returns information about the class from the descriptor 
//
// ARGUMENTS:
//	 classDescriptor: the description of the class
//	
// RETURNS:
//	classInfo : an array that contains the information about
//	the Class
//--------------------------------------------------------------------
function getClassInfoForSM(classDescriptor)
{
	var classInfo = new Array();
	classInfo = getClassInfo(classDescriptor);
	return classInfo;
}

// TODO: Remove the following:
// 1. displayInstructions() API is no longer necessary.
// 2. cleanup code and strings
//
// Specify list of steps that user must complete to get useful information
// in this panel. Note that we display previous steps (1-4) so that we present
// user with a single dynamic list (not 2 static list)
//
// TODO: do we want to implement the "events" from previous list for consistency?

function getSetupSteps()
{
	// do we need to include install SDK in the steps?
	var doSDK = false;
	var dom = null;
	dom = dw.getDocumentDOM();
	if (dom && dom.serverModel)
	{
		var aServerModelName = dom.serverModel.getDisplayName();
	}
	else
	{
		var aServerModelName = site.getServerDisplayNameForSite();
	}
	if (aServerModelName.length)
	{
		if(aServerModelName != "ColdFusion")
		{
			if(needsSDKInstalled != null)
			{
				doSDK = needsSDKInstalled();
			}
		}
	}
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
	
	var someSteps = new Array();
	someSteps.push(MM.MSG_WebService_InstructionsTitle);
	if (curSite.length != 0 && site.getIsServerSite(curSite))
		someSteps.push(MM.MSG_Dynamic_InstructionsStep1A);
	else
		someSteps.push(MM.MSG_Dynamic_InstructionsStep1);	
	someSteps.push(MM.MSG_Dynamic_InstructionsStep2);
	if(doSDK == true)
	{
		someSteps.push(MM.MSG_WebService_InstructionsStep3);		
	}
	someSteps.push(MM.MSG_WebService_InstructionsStep4);

	return someSteps;
}

function setupStepsCompleted()
{
	var stepsCompleted = -1;	// all steps complete

	var serverModel = "";
	var url = "";
	var curSite = null;

	// Try to get the site for the currently selected document
	dom = dw.getDocumentDOM();
	if (dom != null)
		url = dom.URL;
	if (url.length > 0)
		curSite = site.getSiteForURL(url);
	else
		curSite = site.getCurrentSite();
		
	if (curSite.length == 0)
		curSite = site.getCurrentServerSite();

	// If no site defined, prompt user to create one
	if (curSite.length == 0)
		return 0;

	// Try to get the server model of the currently selected document
	// If no document is open, get the default server model for cur site.
	if (dom == null)
		dom = dw.getNewDocumentDOM();
	if (dom && dom.serverModel)
		serverModel = dom.serverModel.getFolderName();

	// If doc type does not support server markup, prompt user
	// to choose dynamic doc type
	if (serverModel.length == 0)
		return 1;

	// is doSDK included in the steps?
	var doSDK = false;
	dom = dw.getDocumentDOM();
	if (dom && dom.serverModel)
	{
		var aServerModelName = dom.serverModel.getDisplayName();
		if(aServerModelName != "ColdFusion")
		{
			doSDK = needsSDKInstalled();
		}
	}
	if(doSDK)
	{
		if(!isSDKInstalled())
		{
			return 2;
		}
	}

	return stepsCompleted;
}
