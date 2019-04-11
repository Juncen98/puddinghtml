// Copyright 2000, 2001, 2002, 2003, 2004 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var helpDoc = MM.HELP_ssJavaBeanIndexed;
var PROP_TYPE = "JavaBeanIndexed";

var scope;
var paramId;
var itemClassname	= new TextField(PROP_TYPE, "ItemClass");
var collectionClassname;
                                
//******************* API **********************

//Returns array of ssRecords identifying all my server behaviors

function findServerBehaviors() 
{
  var sbList = findSBs(MM.LABEL_JavaBeanCollection);
  return sbList;
}


//Called before script is launched. If no recordsets are defined, returns a error string to alert.

function canApplyServerBehavior(sbObj) 
{
	return true;
}


//add server behavior code to page

function applyServerBehavior(sbObj) 
{
  var paramObj = new Object();
  var errStr = "";

  errStr = CheckData();
  if (errStr != "")
  {
	return errStr;
  }

   if (!errStr)
    errStr = itemClassname.applyServerBehavior(sbObj, paramObj);

  paramObj.Scope			= scope.getValue();
  paramObj.CollectionClass  = collectionClassname.get();
  packageName	 = collectionClassname.getValue();

  if (packageName != paramObj.CollectionClass)
  {
	//we need to store the package for later introspection.
	var siteHandle = MMNotes.open(dw.getSiteRoot(),true);
	if (siteHandle) 
	{
		var siteURL = dw.getSiteRoot();
		if (siteURL.length)
		{
			MMNotes.set(siteHandle,paramObj.CollectionClass,packageName);
		}
		MMNotes.close(siteHandle);
	}
  }

  paramObj.Id				= paramId.get();

  //check that a param value was specified
  if (!errStr) 
  {
    if (!paramObj.Scope) errStr = MM.MSG_NeedParamName;
  }

  if (!errStr)
    applySB(paramObj, sbObj);
      
  return errStr;
}

//Passed the function call above, takes prior arguments and reloads the UI.
//Removes any escape characters \

function inspectServerBehavior(sbObj) 
{
  var success = true;

  if (success && sbObj.parameters.CollectionClass)
  {
		//Check if the class is part of a package

		var siteHandle = MMNotes.open(dw.getSiteRoot(),true);
		if (siteHandle) 
		{
			var siteURL = dw.getSiteRoot();
			if (siteURL.length)
			{
				packageName = MMNotes.get(siteHandle,sbObj.parameters.CollectionClass);
				if (packageName && packageName.length)
				{
					GetClassesFromPackage(packageName,true);				
				}
			}
			MMNotes.close(siteHandle);
		}
 
		collectionClassname.pickValue(sbObj.parameters.CollectionClass);
  }

  GetIndexedProperties();

  if (success && sbObj.parameters.ItemClass)
    success = itemClassname.inspectServerBehavior(sbObj);

  if (success && sbObj.parameters.Id)
     paramId.pickValue(sbObj.parameters.Id);

  scope.pickValue(sbObj.parameters.Scope);
}


function deleteServerBehavior(sbObj) 
{
  itemClassname.deleteServerBehavior(sbObj);
  deleteSB(sbObj);
}


function analyzeServerBehavior(sbObj, allRecs) 
{
  itemClassname.analyzeServerBehavior(sbObj);
 
}


//***************** LOCAL FUNCTIONS  ******************


function initializeUI() 
{
  itemClassname.initializeUI();

  collectionClassname = new ListControl("CollectionClass");
  scope				  = new ListControl("Scope");
  paramId			  = new ListControl("Id");
  //if the platform is mac , hide the browsing for external .jar files for java bean instropection
  var isPlatformWin = (DWfile.getPlatform() ==  "win32");
  if (isPlatformWin)
  {
       //set the browseButtonSpanObj
		var browseButtonSpanObj = dwscripts.findDOMObject('browseButtonSpan');
		if (browseButtonSpanObj != null)
		{	
		    //show the button by setting the visibility flag 
			browseButtonSpanObj.visibility="visible";
		}
  }
  populateScope();
  populateClass();
}

function populateClass()
{
	var classesList = MMJB.getClasses();
	paramId.init();


	var collectionClassList = new Array();

	collectionClassList.push(MM.MSG_SelectAJavaCollectionClass);

	for (var i =0 ; i < classesList.length ; i++)
	{
		collectionClassList.push(classesList[i]);
	}

	collectionClassname.setAll(collectionClassList,collectionClassList);
	collectionClassname.setIndex(0)
	GetIndexedProperties();
}



function populateScope()
{
	scope.add(BeanTypes[0],"page");
	scope.add(BeanTypes[1],"request");
	scope.add(BeanTypes[2],"session");
	scope.add(BeanTypes[3],"application");
	scope.setIndex(0)
}


function GetIndexedProperties()
{
	var aClassName  = collectionClassname.get();
	var packageName	= collectionClassname.getValue();

	paramId.init();
	var indexProp = MMJB.getIndexedProperties(aClassName,packageName);

	var indexPropName = new Array();
	var indexPropValue = new Array();


	for (var i =0 ; i < indexProp.length ; i+=2)
	{
		indexPropName.push(indexProp[i]);
		indexPropValue.push(indexProp[i+1]);
	}

	paramId.setAll(indexPropName,indexPropValue);

	if (paramId.getLen())
	{
		paramId.setIndex(0)
	}

    GetItemClassName();
}


function GetItemClassName()
{
	var indexProp    = paramId.getValue();
	itemClassname.setValue(indexProp);
}


 function GetClassesFromPackageUsingDialog()
 {
	var packageName = dw.browseForFileURL("open",MM.LABEL_JBGetPackageName);
	if (packageName && packageName.length)
	{
		packageName = MMNotes.localURLToFilePath(packageName);
		GetClassesFromPackage(packageName,false);
	}
 }

 function GetClassesFromPackage(packageName,bValueSameAsDisplay)
 {
 	var classNames   = new Array();
	var packageNames = new Array();

	collectionClassname.init();

	classNames.push(MM.MSG_SelectAJavaCollectionClass);
	packageNames.push(MM.MSG_SelectAJavaCollectionClass);

	var classnameList = MMJB.getClassesFromPackage(packageName);

    if (!bValueSameAsDisplay)
	{
		if (!classnameList.length)
		{
			var errMessage = MMJB.getErrorMessage();
			if (errMessage && errMessage.length)
			{
				collectionClassname.setAll(classNames,classNames);
				alert(errMessage);
				return;
			}	
		}
	}


	for (var i =0 ; i < classnameList.length ; i++)
	{
		classNames.push(classnameList[i]);
		packageNames.push(packageName);
	}

    if (bValueSameAsDisplay)
		collectionClassname.setAll(classNames,classNames);
	else
		collectionClassname.setAll(classNames,packageNames);
 }


function CheckData()
{
	var strOut="";
	var aClassName = collectionClassname.get();
	if(aClassName == MM.MSG_SelectAJavaCollectionClass)
	{
		strOut = MM.MSG_ErrSelectAJavaCollectionClass;
	}

	return strOut;
}
