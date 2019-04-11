// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var DEBUG = false;
var helpDoc = MM.HELP_compCFCs;

var PACKAGE_FILENAME				= "Components/Common/CFCs/Package.gif";
var CFC_FILENAME					= "Components/Common/CFCs/CFC.gif";
var CFC_ERROR_FILENAME				= "Components/Common/CFCs/CFCerror.gif";
var PROPERTIES_FILENAME				= "Components/Common/CFCs/Properties.gif";
var METHOD_FILENAME					= "Components/Common/CFCs/Method.gif";
var METHOD_INHERITED_FILENAME		= "Components/Common/CFCs/MethodInherited.gif";
var ARGUMENT_FILENAME				= "Components/Common/CFCs/Parameter.gif";
var PROPERTY_FILENAME				= "Components/Common/CFCs/Property.gif";
var PROPERTY_INHERITED_FILENAME		= "Components/Common/CFCs/PropertyInherited.gif";
var REFRESH_BUTTON_UP				= "Shared/MM/Images/refresh.gif";
var REFRESH_BUTTON_DOWN				= "Shared/MM/Images/refresh_sel.gif";
var REFRESH_BUTTON_DISABLED			= "Shared/MM/Images/refresh_dis.gif";
var INSERT_BUTTON_UP				= "Shared/MM/Images/insert.gif";
var INSERT_BUTTON_DOWN				= "Shared/MM/Images/insert_sel.gif";
var INSERT_BUTTON_DISABLED			= "Shared/MM/Images/insert_dis.gif";
var DETAILS_BUTTON_UP				= "Components/Common/CFCs/DetailsUp.gif";
var DETAILS_BUTTON_DOWN				= "Components/Common/CFCs/DetailsDown.gif";
var DETAILS_BUTTON_DISABLED			= "Components/Common/CFCs/DetailsDisabled.gif";
var PLUS_BUTTON_UP					= "Shared/MM/Images/btnAdd.gif";
var PLUS_BUTTON_DOWN				= "Shared/MM/Images/btnAdd_sel.gif";
var SITE_BUTTON_UP					= "Components/Common/CFCs/SiteOnly.gif";
var SITE_BUTTON_DOWN				= "Components/Common/CFCs/SiteOnly_sel.gif";
var SITE_BUTTON_DIS					= "Components/Common/CFCs/SiteOnly_dis.gif";
var ALL_BUTTON_UP					= "Components/Common/CFCs/all.gif";
var ALL_BUTTON_DOWN					= "Components/Common/CFCs/all_sel.gif";
var ALL_BUTTON_DIS					= "Components/Common/CFCs/all_dis.gif";

var PACKAGE_OBJECT_TYPE				= "Package";

var CFC_OBJECT_TYPE					= "CFC";

var METHOD_OBJECT_TYPE				= "Method";
var ARGUMENTS_OBJECT_TYPE			= "Arguments";
var ARGUMENT_OBJECT_TYPE			= "Argument";

var PROPERTIES_OBJECT_TYPE			= "Properties";
var PROPERTY_OBJECT_TYPE			= "Property";

var ERROR_OBJECT_TYPE				= "Error";

var CFC_NEED_TO_GET_DETAILS			= "Getting details...";

var FILTERING_SITE_ROOT				= "filtering site root";

var bForceRefresh					= false;
var bAllowTreeBuilding				= true;
var bDoingManualRefresh				= false;

var noteFile = dw.getConfigurationPath() + '/Components/Common/CFCs/CFCs';
var sitePrefix = '';
// get preferences from notes
var noteTmp = getObjectFromNotes(noteFile, 'filter_');
if(noteTmp) {
	if(noteTmp.filter == 'site') {
		sitePrefix = getSitePrefix();
	}
}

var cachedLocalPack = 'waiting';

var packages						= new Array();

function getSitePrefix() {
	var cachePrefix = '';
	cachePrefix = site.getAppURLPrefixForSite().toLowerCase();
	cachePrefix = cachePrefix.replace(/^\w+:\/\/[^\/]*\//, '');
	cachePrefix = cachePrefix.replace(/\//g, '.');
	cachePrefix = cachePrefix.replace(/\.$/, '');

	//if the url prefix does not contain a sub folder then this is null, just return filter siteroot so we know to do it
	if( cachePrefix == '' ) {
		cachePrefix = FILTERING_SITE_ROOT;
	}

	return cachePrefix;
}


//*******************  COMPONENT API **********************

function getParsedCFCinfo(CFCcomponentRec)
{
  
	var aCFC = null;

	if (CFCcomponentRec)
	{
		if (CFCcomponentRec.detailsText == CFC_NEED_TO_GET_DETAILS)
		{
			var packageName = (CFCcomponentRec.parent.getName() == MM.MSG_CFC_UnnamedPackage) ? "" : CFCcomponentRec.parent.getName();
			getCFC(packageName, CFCcomponentRec);
		}
		aCFC = CFCcomponentRec.CFC;
	}

	return aCFC;
}



function getMethodObjFromComponentRec(componentRec)
{
  
	var aMethod = new Object();
	aMethod.name = "";
	aMethod.access = "";
	aMethod.returnType = "";
	aMethod.outputAllowed = "";
	aMethod.arguments = new Array();

	if (componentRec.objectType == METHOD_OBJECT_TYPE)
	{
		var aCFC = getParsedCFCinfo(componentRec.parent);

		if (aCFC.methods.length)
		{
			for (var i=0; i < aCFC.methods.length; i++)
			{
				var possibleMethod = aCFC.methods[i];
				if (possibleMethod.name == componentRec.methodName)
				{
					aMethod = possibleMethod;
					break;
				}
			}
		}
	}

	return aMethod;
}



//*-------------------------------------------------------------------
// FUNCTION:
//   getComponentChildren
//
// DESCRIPTION:
//	 returns a list of component Children.
//
// ARGUMENTS:
//	 parentNode-componentRec.
//	
// RETURNS:
//   an array of componentRec nodes.
//--------------------------------------------------------------------
function getComponentChildren(componentRec)
{
  
	var cs_Children = new Array();
	var bSort = false;

	if (!componentRec)
	{
		//  Only allow packages to be obtained under strictly controlled conditions.
		//  This must be enforced to prevent situations where we might attempt to do
		//  something slow (like getting packages) under conditions when the user
		//  really doesn't want or need those data.

		if (bAllowTreeBuilding)
		{
			getPackages(cs_Children);
			bSort = true;
		}
	}
	else
	{
		if (componentRec.objectType == PACKAGE_OBJECT_TYPE)
		{
			if (componentRec.aPackage.CFCs.length)
			{
				for (var i=0; i < componentRec.aPackage.CFCs.length ; i++ )
				{
					var aCFC = componentRec.aPackage.CFCs[i];
					var cfcCompInfo = new ComponentRec(aCFC.name, CFC_FILENAME, true, false, aCFC.name);
					cfcCompInfo.objectType = CFC_OBJECT_TYPE;
					cfcCompInfo.detailsText = CFC_NEED_TO_GET_DETAILS;
					cs_Children.push(cfcCompInfo);
				}
				bSort = true;
			}
		}
		else if (componentRec.objectType == CFC_OBJECT_TYPE)
		{
			var aCFC = getParsedCFCinfo(componentRec)

			if (componentRec.isOK == 0)
			{
				var errorCompInfo = new ComponentRec(MM.MSG_CFC_TTT_Error_Short, CFC_ERROR_FILENAME, false, false, MM.MSG_CFC_TTT_Error_Short);
				errorCompInfo.objectType = ERROR_OBJECT_TYPE;
				errorCompInfo.detailsText = MM.MSG_CFC_TTT_Error;
				cs_Children.push(errorCompInfo);
			}
			else
			{
				if (aCFC.properties.length)
				{
					var propertiesCompInfo = new ComponentRec(MM.MSG_CFC_PropertiesNodeText, PROPERTIES_FILENAME, true, false, MM.MSG_CFC_PropertiesNodeText);
					propertiesCompInfo.objectType = PROPERTIES_OBJECT_TYPE;
					propertiesCompInfo.detailsText = "";
					cs_Children.push(propertiesCompInfo);
				}

				if (aCFC.methods.length)
				{
					for (var i=0; i < aCFC.methods.length; i++)
					{
						var aMethod = aCFC.methods[i];

						var detailsText = MM.MSG_CFC_TTT_Name + aMethod.name + dwscripts.getNewline();
						detailsText = detailsText + MM.MSG_CFC_TTT_Access + aMethod.access + dwscripts.getNewline();
						detailsText = detailsText + MM.MSG_CFC_TTT_ReturnType + aMethod.returnType + dwscripts.getNewline();
						detailsText = detailsText + MM.MSG_CFC_TTT_OutputAllowed + String(aMethod.outputAllowed).toLowerCase() + dwscripts.getNewline();
						detailsText = detailsText + MM.MSG_CFC_TTT_Roles + aMethod.roles + dwscripts.getNewline();
						detailsText = detailsText + MM.MSG_CFC_TTT_ImplementedIn + aMethod.implementedIn + dwscripts.getNewline();
						detailsText = detailsText + MM.MSG_CFC_TTT_Inherited + (aMethod.inherited ? "true" : "false");

						var signature = buildMethodSignature(aMethod);

						var methodCompInfo = new ComponentRec(signature, (aMethod.inherited ? METHOD_INHERITED_FILENAME : METHOD_FILENAME), (aMethod.arguments.length) ? true : false, true, aMethod.name);
						methodCompInfo.objectType = METHOD_OBJECT_TYPE;
						methodCompInfo.methodName = aMethod.name;
						methodCompInfo.detailsText = detailsText;
						cs_Children.push(methodCompInfo);
					}
				}
			}

			bSort = true;
		}
		else if (componentRec.objectType == PROPERTIES_OBJECT_TYPE)
		{
			var aCFC = getParsedCFCinfo(componentRec.parent);

			if (aCFC.properties.length)
			{
				for (var i=0; i < aCFC.properties.length; i++)
				{
					var aProperty = aCFC.properties[i];

					var detailsText = MM.MSG_CFC_TTT_Name + aProperty.name + dwscripts.getNewline();
					detailsText = detailsText + MM.MSG_CFC_TTT_Type + aProperty.theType + dwscripts.getNewline();
					detailsText = detailsText + MM.MSG_CFC_TTT_ImplementedIn + aProperty.implementedIn + dwscripts.getNewline();
					detailsText = detailsText + MM.MSG_CFC_TTT_Inherited + (aProperty.inherited ? "true" : "false");

					var signature = buildPropertySignature(aProperty);

					var propertyCompInfo = new ComponentRec(signature, (aProperty.inherited ? PROPERTY_INHERITED_FILENAME : PROPERTY_FILENAME), false, true, aProperty.name);
					propertyCompInfo.objectType = PROPERTY_OBJECT_TYPE;
					propertyCompInfo.propertyName = aProperty.name;
					propertyCompInfo.detailsText = detailsText;
					cs_Children.push(propertyCompInfo);
				}
			}

			bSort = true;
		}
		else if (componentRec.objectType == METHOD_OBJECT_TYPE)
		{
			var aMethod = getMethodObjFromComponentRec(componentRec);
			if (aMethod.arguments.length)
			{
				for (var p=0; p < aMethod.arguments.length; p++)
				{
					var aArgument = aMethod.arguments[p];

					var detailsText = MM.MSG_CFC_TTT_Name + aArgument.name + dwscripts.getNewline();
					detailsText = detailsText + MM.MSG_CFC_TTT_Type + aArgument.theType + dwscripts.getNewline();
					detailsText = detailsText + MM.MSG_CFC_TTT_Required + String(aArgument.required).toLowerCase() + dwscripts.getNewline();
					detailsText = detailsText + MM.MSG_CFC_TTT_DefaultValue + aArgument.defaultValue;

					var signature = buildArgumentSignature(aArgument);

					var argumentCompInfo = new ComponentRec(signature, ARGUMENT_FILENAME, false, false, aArgument.name);
					argumentCompInfo.objectType = ARGUMENT_OBJECT_TYPE;
					argumentCompInfo.argumentName = aArgument.name;
					argumentCompInfo.detailsText = detailsText;
					cs_Children.push(argumentCompInfo);
				}
			}
		}
	}

	if ((cs_Children.length) && bSort)
	{
		cs_Children = cs_Children.sort(nameSort);
	}

	return cs_Children;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   getPackages
//
// DESCRIPTION:
//	 add all the packages to the stack of child nodes for the tree
//
// ARGUMENTS:
//	 cs_Children.
//	
// RETURNS:
//--------------------------------------------------------------------
function getPackages(cs_Children)
{
  
	var nPackages = packages.length;
	if (nPackages)
	{
		for (var p=0; p<nPackages; p++)
		{
			packages.pop();
		}
	}
	
	var start = new Date();

	var roots = new Array();
	var cfctreeDOM = getcfctreeDOM(bForceRefresh);

	if ((cfctreeDOM != null) && (cfctreeDOM.hasChildNodes()))
	{
		if (!parseCFCtree(cfctreeDOM, roots))
		{
			if (bDoingManualRefresh)
			{
				//  If we got at least one root then we know that the server is running
				//  and that there must have been some sort of very specific parsing
				//  problem or failure within Neo.  Go ahead and show the data for
				//  the roots we got but warn the user that there was a significant
				//  problem.

				if (roots.length > 0)
				{
					alert(MM.MSG_CFC_PartiallyParsedTree);
				}

				//  If we failed to get even a single root then we either suffered a
				//  massive failure (like the server isn't running) or we encountered
				//  significant problems parsing the first root we found.  In either case
				//  we can't show anything in the tree.  Tell the user why the tree is
				//  going to be empty.

				else
				{
					alert(MM.MSG_CFC_FailedToParseTree);
				}
			}
		}
	}
	else if (bDoingManualRefresh)
	{
		alert(MM.MSG_CFC_FailedToParseTree);
	}
	
	var end = new Date();
	//alert('parse DOM in: ' + (end - start) + ' ms');

	if (roots.length)
	{
		var els2  = 'N/A';
		var rootsToExclude = new Array();
		if( sitePrefix == FILTERING_SITE_ROOT ) {
			parseComponentRoots(getComponentRootsDOM(), rootsToExclude);
		}
		else if (sitePrefix != '') {
			els2 = getLocalPackages();
		}

		for (var r=0; r<roots.length; r++)
		{
			var aRoot = roots[r];
			
			var exlcudeRoot = false;
			
			//check to see if this root is one we want to exlcude. We exlcude any root that has a prefix. The
			//prefix means it's any additional direcotry added in the CF admin page and not directly related to this site
			//and since we're filtering the site root, we want the cfcs that live in the root (have no prefix)
			for ( var i = 0 ; i < rootsToExclude.length ; i++ )
			{
				var anExcludedRoot = rootsToExclude[i];
				if( ( anExcludedRoot.prefix != '' ) &&
					( aRoot.physicalPath.indexOf(anExcludedRoot.physicalPath) == 0 ) )
				{
					exlcudeRoot = true;
					break;
				}
			}
			
			if( exlcudeRoot ){
				continue;
			}
			
			if (aRoot.packages.length)
			{
				for (var p=0; p<aRoot.packages.length; p++)
				{
					var aPackage = aRoot.packages[p];

					//  Save the package information so we can easily access it
					//  from any node in the tree.
					var tmp = aPackage.name.toString().toLowerCase();

					var shThis = false;
					if (sitePrefix == '' || sitePrefix == FILTERING_SITE_ROOT) {
						shThis = true;
					} else {
						if (els2 == 'N/A') {
//							if (tmp.indexOf(sitePrefix) == 0) {
							if ((tmp == sitePrefix) || (tmp.indexOf(sitePrefix + '.') == 0)) {
								shThis = true;
							}
						} else {
							if (els2[tmp] == 1) {
								shThis = true;
							}
						}
					}
					
					if (shThis) {
						packages.push(aPackage);
						var packageCompInfo = new ComponentRec((aPackage.name == "") ? MM.MSG_CFC_UnnamedPackage : aPackage.name, PACKAGE_FILENAME, (aPackage.CFCs.length > 0), false, "");
						packageCompInfo.objectType = PACKAGE_OBJECT_TYPE;
						packageCompInfo.aPackage = aPackage;
						packageCompInfo.detailsText = "";
						cs_Children.push(packageCompInfo);
					}
				}
			}
		}
	}
}

//*-------------------------------------------------------------------
// FUNCTION:
//   getCFCfromNames
//
// DESCRIPTION:
//	 Get all the info on a given CFC in a given package.
//
// ARGUMENTS:
//	 packageName
//	 CFCname
//	 detailsText (a String)
//	 CFCdetails (an Object)
//	
// RETURNS:
//	true/false (did the parsing go OK)
//--------------------------------------------------------------------
function getCFCfromNames(packageName, CFCname, detailsTextObj, CFCdetails)
{
  
	MM.setBusyCursor();

	var cfcinmcdlDOM = getcfcinmcdlDOM(packageName, CFCname);
	var bParsedOK = false;

	CFCdetails.name = CFCname;  //  A reasonable default!

	if ((cfcinmcdlDOM != null) && (cfcinmcdlDOM.hasChildNodes()))
	{
		//  TBD:  Eventually, we will want to allow users control over whether or not
		//  filter out built in methods.  Such methods (e.g., getDescriptor(), 
		//  getDescriptor_html(), getDescriptor_mcdl(), getDescriptor_wddx(),
		//  getDescriptor_wsdl(), etc.) are provided by Neo (not by any CFC that in in
		//  the inheritence chain).  Built-in methods are often of little or no interest
		//  to users so they end up cluttering the tree with "noise."  By default,
		//  we are going to filter them out for now.

		var methodsToIgnore = new Array();
		var bFilterOutBuiltInMethods = true;  //  TBD:  get this from the UI somehow.
		if (bFilterOutBuiltInMethods)
		{
			methodsToIgnore.push("getDescriptor");
			methodsToIgnore.push("getDescriptor_html");
			methodsToIgnore.push("getDescriptor_mcdl");
			methodsToIgnore.push("getDescriptor_wddx");
			methodsToIgnore.push("getDescriptor_wsdl");
			methodsToIgnore.push("cfcToHTML");
			methodsToIgnore.push("cfcToMCDL");
			methodsToIgnore.push("cfcToMCDL_");
			methodsToIgnore.push("cfcToWDDX");
			methodsToIgnore.push("cfcToWSDL");
		}

		//  In some cases we will utterly fail when parsing the CFC.  This can happen
		//  when the CFC has syntax errors or is just an empty shell.  In such cases
		//  the name in CFCdetails will be empty.  If we detect this, just set the name
		//  to be whatever was given to this method (in CFCname).  And, set the tooltip
		//  to indicate that we encountered a problem.

		bParsedOK = parseCFCinMCDL(cfcinmcdlDOM, CFCdetails, methodsToIgnore);
	}

	detailsTextObj.detailsText = MM.MSG_CFC_TTT_Name + CFCdetails.name + dwscripts.getNewline();

	if (!bParsedOK)
	{
		CFCdetails.methods = new Array();
		CFCdetails.properties = new Array();
		detailsTextObj.detailsText = MM.MSG_CFC_TTT_Error
	}
	else
	{
		detailsTextObj.detailsText = detailsTextObj.detailsText + MM.MSG_CFC_TTT_Physicalpath + CFCdetails.physicalPath + dwscripts.getNewline();
		detailsTextObj.detailsText = detailsTextObj.detailsText + MM.MSG_CFC_TTT_Extends + CFCdetails.extendsCFC;
	}

	MM.clearBusyCursor();

	return bParsedOK;
}

//*-------------------------------------------------------------------
// FUNCTION:
//   getCFC
//
// DESCRIPTION:
//	 add a CFC to the stack of child nodes for the tree
//
// ARGUMENTS:
//	 cs_Children.
//	
// RETURNS:
//--------------------------------------------------------------------
function getCFC(packageName, cfcCompInfo)
{
	var CFCname = cfcCompInfo.getName();
	var CFCdetails = new Object();
	var detailsTextObj = new Object();
	cfcCompInfo.isOK = (getCFCfromNames(packageName, CFCname, detailsTextObj, CFCdetails) ? 1 : 0);
	cfcCompInfo.CFC = CFCdetails;
	cfcCompInfo.detailsText = detailsTextObj.detailsText;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   getContextMenuId
//
// DESCRIPTION:
//	 returns the context menu id for the connection view
//
// ARGUMENTS:
//		String;
//	
// RETURNS:
//   context menu id
//--------------------------------------------------------------------
function getContextMenuId()
{
	return "DWCFCsContext";
}

//-------------------------------------------------------------------
// FUNCTION:
//   siteFiltering
//
// DESCRIPTION:
//	 sets the filter on CFC;s
//
// ARGUMENTS:
//		String;
//	
// RETURNS:
//   void
//--------------------------------------------------------------------
function siteFiltering() {
	var note = new Object();
	if(sitePrefix == '') {
		sitePrefix = getSitePrefix();
		note.filter = 'site';
	} else {
		sitePrefix = '';
		note.filter = 'all';
	}
	
	putObjectInNotes(noteFile, note, 'filter_');
	var start = new Date();
	clickedRefresh('no');
	var end = new Date();
	//alert('switch in: ' + (end-start) + ' ms');
}

//-------------------------------------------------------------------
// FUNCTION:
//   siteFiltering
//
// DESCRIPTION:
//	 sets the filter on CFC;s
//
// ARGUMENTS:
//		String;
//	
// RETURNS:
//   void
//--------------------------------------------------------------------
function isSiteFiltering() {
	if(sitePrefix == '') {
		return false
	} else {
		return true;
	}
}

//*-------------------------------------------------------------------
// FUNCTION:
//   toolbarButtons
//
// DESCRIPTION:
//	 returns a list of toolbaricons
//
// ARGUMENTS:
//	 none
//	
// RETURNS:
//   array of toolbar buttons and event handlers.
//--------------------------------------------------------------------

function toolbarControls()
{
	var toolBarBtnArray = new Array();

	var plusButton = new ToolbarControlRec();
	plusButton.image			= PLUS_BUTTON_UP;
	plusButton.pressedImage		= PLUS_BUTTON_DOWN;
	plusButton.disabledImage	= PLUS_BUTTON_UP;
	plusButton.toolStyle		= "left";
	plusButton.toolTipText		= MM.MSG_CFCsCreateToolTipText;
	plusButton.command = "createCFC()";
	toolBarBtnArray.push(plusButton);

	var siteButton = new ToolbarControlRec();
	siteButton.image			= SITE_BUTTON_UP;
	siteButton.pressedImage		= SITE_BUTTON_DOWN;
	siteButton.disabledImage	= SITE_BUTTON_DOWN;
	siteButton.toolStyle		= "left";
	siteButton.toolTipText		= dw.loadString("componentspanel/cfc/site_button_tooltip");
	siteButton.command = "siteFiltering()";
	siteButton.enabled = "!isSiteFiltering()";
	toolBarBtnArray.push(siteButton);

	var allButton = new ToolbarControlRec();
	allButton.image			= ALL_BUTTON_UP;
	allButton.pressedImage	= ALL_BUTTON_DOWN;
	allButton.disabledImage	= ALL_BUTTON_DOWN;
	allButton.toolStyle		= "left";
	allButton.toolTipText	= dw.loadString("componentspanel/cfc/all_button_tooltip");
	allButton.command = "siteFiltering()";
	allButton.enabled = "isSiteFiltering()";
	toolBarBtnArray.push(allButton);

	var detailsButton = new ToolbarControlRec();
	detailsButton.image			= DETAILS_BUTTON_UP;
	detailsButton.pressedImage	= DETAILS_BUTTON_DOWN;
	detailsButton.disabledImage	= DETAILS_BUTTON_DISABLED;
	detailsButton.toolStyle		= "right";
	detailsButton.toolTipText		= MM.MSG_CFCsDetailsToolTipText;
	detailsButton.command = "getDetails()";
	detailsButton.enabled = "canGetDetails()";
	toolBarBtnArray.push(detailsButton);

	var insertButton = new ToolbarControlRec();
	insertButton.image			= INSERT_BUTTON_UP;
	insertButton.pressedImage	= INSERT_BUTTON_DOWN;
	insertButton.disabledImage	= INSERT_BUTTON_DISABLED;
	insertButton.toolStyle		= "right";
	insertButton.toolTipText		= MM.MSG_CFCsInsertToolTipText;
	insertButton.command = "clickedInsertCFC()";
	insertButton.enabled = "insertCFCEnabled()";
	toolBarBtnArray.push(insertButton);

	var refreshButton = new ToolbarControlRec();
	refreshButton.image			= REFRESH_BUTTON_UP;
	refreshButton.pressedImage	= REFRESH_BUTTON_DOWN;
	refreshButton.disabledImage	= REFRESH_BUTTON_DISABLED;
	refreshButton.toolStyle		= "right";
	refreshButton.toolTipText	= MM.MSG_CFCsRefreshToolTipText;
	refreshButton.command = "clickedRefresh()";
	toolBarBtnArray.push(refreshButton);

	return toolBarBtnArray;
}

//*-------------------------------------------------------------------
// FUNCTION:
//   getCodeViewDropCode
//
// DESCRIPTION:
//	 returns the code snippet to drop after a drag operation.
//
// ARGUMENTS:
//	 component Rec.
//	
// RETURNS:
//   code to drop into code view.
//--------------------------------------------------------------------

function getCodeViewDropCode(componentRec)
{
	var codeToDrop="";

	if (componentRec && componentRec.objectType == METHOD_OBJECT_TYPE)
	{
		var aMethod = getMethodObjFromComponentRec(componentRec);
		var aCFC = getParsedCFCinfo(componentRec.parent);

		//  Form a decent name for a return variable.  This isn't entirely consistent
		//  with the naming strategy used for web services.

		var aReturnVarName = null;
		if(aMethod.returnType && (!caseInsensitiveCompare(aMethod.returnType, "void")))
		{
			aReturnVarName = aMethod.name + "Ret";
		}

		codeToDrop = codeToDrop + "<cfinvoke " + dwscripts.getNewline();
		codeToDrop = codeToDrop + " component=\"" + dwscripts.entityNameEncode(aCFC.name) + "\"" + dwscripts.getNewline();
		codeToDrop = codeToDrop + " method=\"" + dwscripts.entityNameEncode(aMethod.name) + "\"";
		if(aReturnVarName)
		{
			codeToDrop += dwscripts.getNewline() + " returnvariable=\"" + aReturnVarName + "\"";
		}
		codeToDrop = codeToDrop + ">" + dwscripts.getNewline();

		if (aMethod.arguments.length)
		{
			for (var p=0; p < aMethod.arguments.length; p++)
			{
				var aArgument = aMethod.arguments[p];

				if (caseInsensitiveCompare(aArgument.required, "yes") || caseInsensitiveCompare(aArgument.required, "true"))
				{
					codeToDrop = codeToDrop + "\t<cfinvokeargument name=\"" + dwscripts.entityNameEncode(aArgument.name) + "\" value=\"" + MM.MSG_CFC_PleasePutAValueHere + "\"/>" + dwscripts.getNewline();
				}
			}
		}

		codeToDrop = codeToDrop + "</cfinvoke>" + dwscripts.getNewline();
	}

	return codeToDrop;
}



//*******************  COMPONENT API **********************
//*-------------------------------------------------------------------
// FUNCTION:
//   handleDoubleClick
//
// DESCRIPTION:
//	 event handler to javascript to implement on double clicked on item.
//
// ARGUMENTS:
//	 parentNode-componentRec.
//	
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function handleDoubleClick(componentRec)
{
	return editCFC();
}


//*-------------------------------------------------------------------
// FUNCTION:
//   nameSort
//
// DESCRIPTION:
//	 sort algorithm based on names
//
// ARGUMENTS:
//	obj1  :   The first object
//  obj2  :   The second object
//	
// RETURNS:
//   integer
//--------------------------------------------------------------------

function nameSort(obj1, obj2)
{
	var result = 0;
	var str1 = new String(obj1.name);
	var str2 = new String(obj2.name);

	if (obj1.objectType == obj2.objectType)
	{
		switch (obj1.objectType)
		{
			case METHOD_OBJECT_TYPE:
				str1 = obj1.methodName;
				str2 = obj2.methodName
				break;
			case PROPERTY_OBJECT_TYPE:
				str1 = obj1.propertyName;
				str2 = obj2.propertyName
				break;
		}
	}

	if (str1.toLowerCase() > str2.toLowerCase())
	{
		result = 1;
	}
	else if (str1.toLowerCase() < str2.toLowerCase())
	{
		result = -1;
	}

	if (obj1.objectType == PROPERTIES_OBJECT_TYPE)
	{
		result = 1;
	}
	else if (obj2.objectType == PROPERTIES_OBJECT_TYPE)
	{
		result = -1;
	}

	return result;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   clickedRefresh
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function clickedRefresh(fr)
{
	if(sitePrefix != '') {  
		sitePrefix = getSitePrefix();
	}

	var old_bForceRefresh = bForceRefresh;
	if(fr && fr == 'no') {
		bForceRefresh = false;
	} else {
		bForceRefresh = true;
	}

	var old_bAllowTreeBuilding = bAllowTreeBuilding;
	bAllowTreeBuilding = true;

	var old_bDoingManualRefresh = bDoingManualRefresh;
	bDoingManualRefresh = true;

	dw.serverComponentsPalette.refresh();

	bForceRefresh = old_bForceRefresh;
	bAllowTreeBuilding = old_bAllowTreeBuilding;
	bDoingManualRefresh = old_bDoingManualRefresh;

	cachedLocalPack = 'waiting';
}


//*-------------------------------------------------------------------
// FUNCTION:
//   insertCFCEnabled
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function insertCFCEnabled()
{
	var componentRec = dw.serverComponentsPalette.getSelectedNode();
	if ((componentRec != null) && (componentRec.objectType == METHOD_OBJECT_TYPE))
	{
		return true;
	}

	return false;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   clickedInsertCFC
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function clickedInsertCFC()
{
	var componentRec = dw.serverComponentsPalette.getSelectedNode();
	var strCode = getCodeViewDropCode(componentRec);
	if (strCode != "")
	{
		var theDOM = dw.getDocumentDOM();
		if (theDOM != null)
		{
			var selection = theDOM.source.getSelection();
			theDOM.source.replaceRange(selection[0], selection[1], strCode);
		}
	}
}


//*-------------------------------------------------------------------
// FUNCTION:
//   createCFC
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function createCFC()
{
	MM.CFCfileToOpen = "";

	dw.runCommand("Create Component.htm");

	//  If all went well in this command, then we are told (through a MM variable) the
	//  path to the new CFC file... which we can now open.  We avoid opening this CFC
	//  file in the command itself because doing so tickles a problem in the internal
	//  mechanism the Kojak uses for suspending/continuing edit ops.

	if (MM.CFCfileToOpen.length > 0)
	{
		var newDOM = dreamweaver.openDocumentFromSite(MM.CFCfileToOpen);

		//  There is no longer any need to switch into code view here because we have fixed
		//  Dreamweaver to automatically switch into code view whenever a CFC file is opened
		//  regardless of how that file is opened.
		/***********************************
		if (newDOM != null)
		{
		  newDOM.setView("code");
		}
		***********************************/

		FWLaunch.bringDWToFront();
		MM.CFCfileToOpen = "";

		clickedRefresh();
	}
}

function snoopForNode(aNode, tagNameToFind, attributeToFind, valueToFind, useNamespaceOnTag)
{
	var snoopedNode = null;

	if (aNode != null)
	{
		var children      = aNode.childNodes;
		var nChildren     = children.length;
		var bContinue     = true;
		var current       = null;

		var tagNameToFindWithoutNamespace = new String(tagNameToFind);
		var startOfTagName = tagNameToFind.indexOf(":");
		if (startOfTagName != -1)
		{
			tagNameToFindWithoutNamespace = tagNameToFindWithoutNamespace.substr(startOfTagName + 1);
		}

		for(var i=0; (snoopedNode == null) && (i<nChildren); i++)
		{
			current = children.item(i);
			if (current.nodeType == Node.ELEMENT_NODE)
			{
				var currentTagName = new String(current.tagName);
				var currentTagNameWithoutNamespace = currentTagName;
				var startOfCurrentTagName = currentTagName.indexOf(":");
				if (startOfCurrentTagName != -1)
				{
					currentTagNameWithoutNamespace = currentTagNameWithoutNamespace.substr(startOfCurrentTagName + 1);
				}

				if ((( useNamespaceOnTag) && caseInsensitiveCompare(currentTagName, tagNameToFind)) ||
					((!useNamespaceOnTag) && caseInsensitiveCompare(currentTagNameWithoutNamespace, tagNameToFindWithoutNamespace)))
				{
					if (attributeToFind.length > 0)
					{
						var attribs = parseAttributes(current, true, false);

						if (attribs.length)
						{
							var names = attribs[0];
							var values = attribs[1];

							for (var a=0; a<names.length; a++)
							{
								var aName = names[a];
								var aValue = values[a];
								if ((caseInsensitiveCompare(aName, attributeToFind)) && (caseInsensitiveCompare(aValue, valueToFind)))
								{
									snoopedNode = current;
									break;
								}
							}
						}
					}
					else
					{
						snoopedNode = current;
					}
				}
			}

			if ((snoopedNode == null) && (current.hasChildNodes()))
			{
				snoopedNode = snoopForNode(current, tagNameToFind, attributeToFind, valueToFind, useNamespaceOnTag);
			}
		}
	}

	return snoopedNode;
}

function getCurrentPackageComponentRec()
{  
	var selectedComponentRec = dw.serverComponentsPalette.getSelectedNode();
	var packageComponentRec = null;

	if (selectedComponentRec)
	{
		switch (selectedComponentRec.objectType)
		{
			case PACKAGE_OBJECT_TYPE:
				packageComponentRec = selectedComponentRec;
				break;
			case CFC_OBJECT_TYPE:
				packageComponentRec = selectedComponentRec.parent;
				break;
			case PROPERTIES_OBJECT_TYPE:
				packageComponentRec = selectedComponentRec.parent.parent;
				break;
			case PROPERTY_OBJECT_TYPE:
				packageComponentRec = selectedComponentRec.parent.parent.parent;
				break;
			case METHOD_OBJECT_TYPE:
				packageComponentRec = selectedComponentRec.parent.parent;
				break;
			case ARGUMENT_OBJECT_TYPE:
				packageComponentRec = selectedComponentRec.parent.parent.parent;
				break;
		}
	}

	return packageComponentRec;
}

function getCurrentCFCComponentRec()
{
	var selectedComponentRec = dw.serverComponentsPalette.getSelectedNode();
	var CFCComponentRec = null;

	if (selectedComponentRec)
	{
		switch (selectedComponentRec.objectType)
		{
			case PACKAGE_OBJECT_TYPE:
				break;
			case CFC_OBJECT_TYPE:
				CFCComponentRec = selectedComponentRec;
				break;
			case PROPERTIES_OBJECT_TYPE:
				CFCComponentRec = selectedComponentRec.parent;
				break;
			case PROPERTY_OBJECT_TYPE:
				CFCComponentRec = selectedComponentRec.parent.parent;
				break;
			case METHOD_OBJECT_TYPE:
				CFCComponentRec = selectedComponentRec.parent;
				break;
			case ARGUMENT_OBJECT_TYPE:
				CFCComponentRec = selectedComponentRec.parent.parent;
				break;
		}
	}

	return CFCComponentRec;
}

function getPhysicalPath(packageAndCFCname)
{
	var strPhysicalPath = new String("");
	var strPackageAndCFCname = new String(packageAndCFCname);
	var lastDot = strPackageAndCFCname.lastIndexOf(".");

	var strJustCFCname = new String(packageAndCFCname);
	var strPackageName = new String("");
	if (lastDot != -1)
	{
		strPackageName = strPackageAndCFCname.substr(0, lastDot);
		strJustCFCname = strPackageAndCFCname.substr(lastDot+1);
	}

	var nPackages = packages.length;
	if (nPackages)
	{
		for (var p=0; (p<nPackages) && (strPhysicalPath.length == 0); p++)
		{
			if ((packages[p].name == strPackageName) ||
			    ((packages[p].name == "") && (strPackageName == "")))
			{
				var nCFCs = packages[p].CFCs.length;
				if (nCFCs)
				{
					for (var c=0; (c<nCFCs) && (strPhysicalPath.length == 0); c++)
					{
						if (packages[p].CFCs[c].name == strJustCFCname)
						{
							//  Unfortunately, we must get the physical path over
							//  HTTP.  We don't know if we've yet gotten this
							//  CFC's info.

							var CFCdetails = new Object();
							var detailsText = new String("");
							if (getCFCfromNames(packages[p].name, strJustCFCname, detailsText, CFCdetails))
							{
								strPhysicalPath = CFCdetails.physicalPath;
							}
							break;
						}
					}
				}
			}
		}
	}

	return strPhysicalPath;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   editCFC
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function editCFC()
{
	var returnVal = false;
	var strAppServerAccessType = new String(site.getAppServerAccessType());
	var strLocalPathToFiles = new String(site.getLocalPathToFiles());
	var strAppServerPathToFiles = new String(site.getAppServerPathToFiles());

	strLocalPathToFiles = convertForwardToBackSlashes(strLocalPathToFiles);
	strAppServerPathToFiles = convertForwardToBackSlashes(strAppServerPathToFiles);

	if (!caseInsensitiveCompare(strAppServerAccessType, "local/network"))
	{
		alert(MM.MSG_CFC_LocalAndAppServerPathsNotSame + dwscripts.getNewline() + MM.MSG_CFC_AppServerAccessType + strAppServerAccessType);
	}
	else if (!caseInsensitiveCompare(strLocalPathToFiles, strAppServerPathToFiles))
	{
		var strLocal = new String(site.getLocalPathToFiles());
		strLocal = strLocal.replace(/\//g, "\\");

		var strAppServer = new String(site.getAppServerPathToFiles());
		strAppServer = strAppServer.replace(/\//g, "\\");

		alert(MM.MSG_CFC_LocalAndAppServerPathsNotSame + dwscripts.getNewline() + MM.MSG_CFC_AppServerAccessType + strAppServerAccessType + dwscripts.getNewline() + MM.MSG_CFC_LocalPathToFiles + strLocal + dwscripts.getNewline() + MM.MSG_CFC_AppServerPathToFile + strAppServer);
	}
	else
	{
		var componentRec = dw.serverComponentsPalette.getSelectedNode();

		if (componentRec)
		{
			var packageComponentRec = getCurrentPackageComponentRec();
			var CFCComponentRec = getCurrentCFCComponentRec();
			var tagNameToFind = new String("");
			var attributeToFind = "";
			var valueToFind = "";

			if ((packageComponentRec != null) && (CFCComponentRec != null))
			{
				var aCFC = getParsedCFCinfo(CFCComponentRec);
				var fullPhysicalPath = aCFC.physicalPath;

				switch (componentRec.objectType)
				{
					case PACKAGE_OBJECT_TYPE:
						//  Do nothing; you can't edit a package per se because it corresponds to
						//  a disk path, not a file.
						break;
					case CFC_OBJECT_TYPE:
						tagNameToFind = "cfcomponent";
						attributeToFind = "";
						valueToFind = CFCComponentRec.getName();
						break;
					case PROPERTIES_OBJECT_TYPE:
						//  This is just an intermediary node in the tree.  Interpret it to mean
						//  that we want to edit the CFC tag.
						tagNameToFind = "cfcomponent";
						attributeToFind = "";
						valueToFind = CFCComponentRec.getName();
						break;
					case PROPERTY_OBJECT_TYPE:
						tagNameToFind = "cfproperty";
						attributeToFind = "name";
						valueToFind = componentRec.propertyName;

						if (aCFC.properties.length)
						{
							for (var i=0; i < aCFC.properties.length; i++)
							{
								var aProperty = aCFC.properties[i];
								if (aProperty.name == componentRec.propertyName)
								{
									if (aProperty.inherited)
									{
										fullPhysicalPath = getPhysicalPath(aProperty.implementedIn);
									}
									break;
								}
							}
						}

						break;
					case METHOD_OBJECT_TYPE:
						tagNameToFind = "cffunction";
						attributeToFind = "name";
						valueToFind = componentRec.methodName;

						if (aCFC.methods.length)
						{
							for (var i=0; i < aCFC.methods.length; i++)
							{
								var aMethod = aCFC.methods[i];
								if (aMethod.name == componentRec.methodName)
								{
									if (aMethod.inherited)
									{
										fullPhysicalPath = getPhysicalPath(aMethod.implementedIn);
									}
									break;
								}
							}
						}

						break;
					case ARGUMENT_OBJECT_TYPE:
						tagNameToFind = "cfargument";
						attributeToFind = "name";
						valueToFind = componentRec.argumentName;

						if (aCFC.methods.length)
						{
							for (var i=0; i < aCFC.methods.length; i++)
							{
								var aMethod = aCFC.methods[i];
								if (aMethod.name == componentRec.parent.methodName)
								{
									if (aMethod.inherited)
									{
										fullPhysicalPath = getPhysicalPath(aMethod.implementedIn);
									}
									break;
								}
							}
						}

						break;
				}
			}

			if (tagNameToFind != "")
			{			
				var cfcDOM = dreamweaver.openDocumentFromSite(fullPhysicalPath);
				if (cfcDOM != null)
				{
					cfcDOM.setView("code");

					var snoopedNode = snoopForNode(cfcDOM, tagNameToFind, attributeToFind, valueToFind, true);
					if (snoopedNode != null)
					{
						var offsetArr = cfcDOM.nodeToOffsets(snoopedNode);
						cfcDOM.source.setSelection(offsetArr[0], offsetArr[1]);
					}
					else
					{
						alert(MM.MSG_CFC_CannotFindEntityToEdit);
					}

					returnVal = true;
				}
			}
		}
	}

	return returnVal;
}

function buildURLtoCurrentCFC()
{
	/********* OBSOLETE ***************************************************
	var theURL = "";

	var packageComponentRec = getCurrentPackageComponentRec();
	var CFCComponentRec = getCurrentCFCComponentRec();
	if ((CFCComponentRec != null) && (packageComponentRec != null))
	{
		var aPackage = packageComponentRec.aPackage;
		var urlPrefix = getCurrentUrlPrefix();
		if (urlPrefix != "")
		{
			var rootWebPath = new String(packageComponentRec.rootWebPath);
			if (rootWebPath != "")
			{
				if (rootWebPath.charAt(0) == "/")
				{
					if (rootWebPath == "/")
					{
						rootWebPath = "";
					}
					else
					{
						rootWebPath = rootWebPath.substr(1);
					}
				}

				if ((rootWebPath.length > 1) && (rootWebPath.charAt(rootWebPath.length - 1) != "/"))
				{
					rootWebPath = rootWebPath + "/";
				}
			}

			packageWebPath = new String(aPackage.name);
			if (packageWebPath != "")
			{
				packageWebPath = packageWebPath.replace(/\./g, "/");
				packageWebPath = packageWebPath + "/";
			}
			
			theURL = urlPrefix + escape(rootWebPath) + escape(packageWebPath) + escape(CFCComponentRec.getName()) + ".cfc";
		}
	}

	********* OBSOLETE ***************************************************/

	return theURL;
}

function invokeMethodOnCurrentCFC(methodName)
{
	var theURL = buildURLtoCurrentCFC();

	if (theURL != "")
	{
		if (methodName != "")
		{
			theURL = theURL + "?method=" + escape(methodName);
		}
		dreamweaver.browseDocument(theURL);
	}
}

//*-------------------------------------------------------------------
// FUNCTION:
//   manageInstances
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function manageInstances()
{
	invokeMethodOnCurrentCFC("browse");
}


//*-------------------------------------------------------------------
// FUNCTION:
//   getDescription
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function getDescription()
{ 
	var CFCComponentRec = getCurrentCFCComponentRec();
	var introspectionURL = getIntrospectionUrl();
	if ((CFCComponentRec != null) && (introspectionURL != ""))
	{
		var aCFC = getParsedCFCinfo(CFCComponentRec);
		if (aCFC != null)
		{
			introspectionURL = introspectionURL + "?method=getcfcinhtml&name=" + escape(aCFC.name);
			dreamweaver.browseDocument(introspectionURL);
		}
	}
}


//*-------------------------------------------------------------------
// FUNCTION:
//   deployCFC
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function deployCFC()
{ 
	invokeMethodOnCurrentCFC("deploy");
}


//*-------------------------------------------------------------------
// FUNCTION:
//   removeCFC
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function removeCFC()
{
	invokeMethodOnCurrentCFC("remove");
}


//*-------------------------------------------------------------------
// FUNCTION:
//   canGetSelectedCFC
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function canGetSelectedCFC()
{
	var componentRec = dw.serverComponentsPalette.getSelectedNode();
	if ((componentRec != null) && (componentRec.objectType != PACKAGE_OBJECT_TYPE))
	{
		return true;
	}

	return false;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   canGetDetails
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function canGetDetails()
{
	var componentRec = dw.serverComponentsPalette.getSelectedNode();
	if ((componentRec != null) && (componentRec.detailsText != ""))
	{
		return true;
	}

	return false;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   getDetails
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function getDetails()
{
	var componentRec = dw.serverComponentsPalette.getSelectedNode();
	if (componentRec != null)
	{
		if ((componentRec.objectType == CFC_OBJECT_TYPE) && (componentRec.detailsText == CFC_NEED_TO_GET_DETAILS))
		{
			var packageName = (componentRec.parent.getName() == MM.MSG_CFC_UnnamedPackage) ? "" : componentRec.parent.getName();
			getCFC(packageName, componentRec);
		}

		var detailsText = componentRec.detailsText;
		if (detailsText != "")
		{
			var msg = "";
			
			if (componentRec.objectType != ERROR_OBJECT_TYPE)
			{
				msg = msg + MM.MSG_CFC_Details + componentRec.getName() + "." + dwscripts.getNewline() + dwscripts.getNewline();
			}
			msg = msg + detailsText;

			alert(msg);
		}
	}
}


//*-------------------------------------------------------------------
// FUNCTION:
//   currentCFChasMethod
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function currentCFChasMethod(methodName)
{
	var CFCComponentRec = getCurrentCFCComponentRec();
	if (CFCComponentRec != null)
	{
		var aCFC = getParsedCFCinfo(CFCComponentRec);
		if (aCFC.methods.length > 0)
		{
			for (var m=0; m<aCFC.methods.length; m++)
			{
				var possibleMethod = aCFC.methods[m];
				if (caseInsensitiveCompare(possibleMethod.name, methodName))
				{
					return true;
				}
			}
		}
	}

	return false;
}

// Specify list of steps that user must complete to get useful information
// in this panel. Note that we display previous steps so that we present
// user with a single dynamic list (not 2 static lists).
//
// TBD: do we want to implement the "events" from previous list for consistency?

function getSetupSteps()
{
	var title = '';
	if(sitePrefix != '') {
		title = MM.MSG_CFC_PP_InstructionsTitle + MM.MSG_CFC_InstructionsTitle;
	} else {
		title = MM.MSG_CFC_InstructionsTitle;
	}
	var step1 = MM.MSG_Dynamic_InstructionsStep1;
	var step2 = MM.MSG_ColdFusion_InstructionsStep2;
	var step3 = MM.MSG_Dynamic_InstructionsStep3;
	var step4 = dwscripts.sprintf(MM.MSG_SetRDSPassword,'<a href="#" onMouseDown="event:SetRDSPassword">','</a>');
	var step5 = dw.loadString("instructions/componentPanel/clickPlusButtonToCreateCFC");

	if(site.getIsServerSite) {
		// DW 2004
		var dom = null;
		var url = "";
		var curSite = null;
		
		// Try to get the site for the currently selected document
		dom = dw.getDocumentDOM();
		if (dom != null) {
			url = dom.URL;
		}
		if (url.length > 0) {
			curSite = site.getSiteForURL(url);
		} else {
			curSite = site.getCurrentSite(); 
		}
		if (curSite.length == 0) {
			curSite = site.getCurrentServerSite();
		}
		
		if (curSite.length != 0 && site.getIsServerSite(curSite)) {
			step1 = MM.MSG_Dynamic_InstructionsStep1A;
		}
		if (curSite.length != 0 && site.getIsServerSite(curSite)) {
			step3 = MM.MSG_Dynamic_InstructionsStep3A;
		}	
	
	}
	
	if( isSiteFiltering() )
		return new Array(title, step1, step2, step3, step4, step5);
	else
		return new Array(title, step1, step2, step3, step4);
}

function setupStepsCompleted()
{
	var dom = null;
	var serverModel = "";
	var url = "";
	var curSite = null;

	// Try to get the site for the currently selected document.

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

	// If no site defined, prompt user to create one.

	if (curSite.length == 0)
	{
		return 0;
	}

	// Try to get the server model of the currently selected document.
	// If no document is open, get the default server model for cur site.

	if (dom == null)
	{
		dom = dw.getNewDocumentDOM();
	}

	if (dom && dom.serverModel)
	{
		serverModel = dom.serverModel.getFolderName();
	}

	// If doc type does not support server markup, prompt user
	// to choose dynamic doc type.

	if (serverModel.length == 0)
	{
		return 1;
	}

	// If no app server is defined, prompt user to specify one.

	if ((dom == null) || (dom.serverModel.testAppServer() == false))
	{
		return 2;
	}

	//  We need to use MMDB.needToPromptForRdsInfo(true) to determine if RDS info is needed.
	//  However, that function only works if you try to refresh the CF DSN list.  That, in turn,
	//  tries to use the given RDS info and make a connection, blah, blah.  Yes, this might be
	//  improved but it is OK to use this technique for now (just prior to beta 3).

	var dsArray = new Array();
	MMDB.needToRefreshColdFusionDsnList();	// force server connection
	var dsArray = MMDB.getColdFusionDsnList();
	if (MMDB.needToPromptForRdsInfo(true))
	{
		return 3;
	}
	
	// if site filtering is on and we got to this point it means they need to define a cfc in their site
	if( isSiteFiltering() )
	{
		return 4;
	}

	return -1;
}

// IAKT
function getLocalPackages() {
	if (cachedLocalPack != 'waiting') {
		return cachedLocalPack;
	}
	return 'N/A';
	var ret = new Object();
	var fileAbsolutePath = dreamweaver.getConfigurationPath() + "/Shared/PP/KT_TMP_FILE.cfm";

	var fileName = "KT_TMP_FILE.cfm";
	var newLocation = site.getAppServerPathToFiles();
	var copied = false;
	var isLocal = false;
	if (newLocation != '') {
		newLocation += fileName;
		if (DWfile.copy(fileAbsolutePath, newLocation)) {
			copied = true;
		}
	}
	if (!copied) {
		newLocation = dreamweaver.getSiteRoot();
		if (newLocation) {
			newLocation += fileName;
			if (DWfile.copy(fileAbsolutePath, newLocation)) {
				isLocal = true;
				if (site.canPut(newLocation)) {
					site.put(newLocation);
					copied = true;
				}
			}
		}
	}
	if (!copied) {
		return 'N/A';
	} else {
		var serverAdress = site.getAppURLPrefixForSite() + fileName;

		var httpReply = MMHttp.getFile(serverAdress, false);
		if (httpReply.statusCode == 200) {
			var dom = dreamweaver.getDocumentDOM(httpReply.data)
			var els1 = dom.getElementsByTagName('package');
			for (var r=0;r<els1.length;r++) {
				ret[els1[r].name]=1;
			}
			DWfile.remove(httpReply.data);
		} else {
			return 'N/A';
		}
	}
	if (isLocal) {
		DWfile.remove(newLocation);
	}
	cachedLocalPack = ret;
	return ret;
}

//--------------------------------------------------------------------
// FUNCTION:
//   putObjectInNotes
//
// DESCRIPTION:
//  put a object in a note file (each property of the object); 
//	
//
// ARGUMENTS:
//		noteFile - the note file where the object info will be stored
//		theObj - object of which properties will be stored in notes
//		prefix - prefix for the notes names (to identify the object)
//		
// RETURNS:
// 	boolean - show if operation succeded
//--------------------------------------------------------------------
function putObjectInNotes(noteFile,theObj,prefix) {
	var idxObj;
	var noteHandle = MMNotes.open(noteFile,true);
	if (noteHandle) {
		for (idxObj in theObj) {	
			if (!MMNotes.set(noteHandle, prefix+idxObj, theObj[idxObj].toString())) {
				MMNotes.close(noteHandle);
				return false;
			}
		}
	} else {
		return false;
	}
	MMNotes.close(noteHandle);
	return true;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getObjectFromNotes
//
// DESCRIPTION:
//  put a object in a note file (each property of the object); 
//	
//
// ARGUMENTS:
//		noteFile - the note file where the object info will be stored
//		prefix - prefix for the notes names (to identify the object)
//		
// RETURNS:
// 	object - the object recovered from the note file or null if note is not found
//--------------------------------------------------------------------
function getObjectFromNotes(noteFile, prefix) {
	var tmObject = new Object();
	var keyIndex;
	var keyName;
	var noteHandle = MMNotes.open(noteFile,true);
	var addedNote = false;
	if (noteHandle) {
		var keys = MMNotes.getKeys(noteHandle);
		for (keyIndex = 0;keyIndex < keys.length;keyIndex++) {
			if (keys[keyIndex].indexOf(prefix) == 0) {
				tmObject[keys[keyIndex].substr(prefix.length)] = MMNotes.get(noteHandle,keys[keyIndex]);
				addedNote = true;
			}
		}
	}
	if (addedNote) {
		return tmObject;
	} else {
		return null;
	}
}


