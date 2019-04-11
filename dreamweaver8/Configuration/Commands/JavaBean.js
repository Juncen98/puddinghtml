// Copyright 2001, 2002, 2003, 2004 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var PROP_TYPE = "JavaBean";
var classname;

function commandButtons(){
  return new Array(MM.BTN_OK,     "okClicked()",
                   MM.BTN_Cancel,"cancelClicked()",
           MM.BTN_Help,"displayHelp()" );
}

var helpDoc = MM.HELP_ssJavaBean;
                                
//******************* API **********************

function cancelClicked()
{
   MM.classname = "";
   MM.classlocation = "";
   window.close();
}

function okClicked()
{
   MM.classname = classname.get();
   MM.classlocation = classname.getValue();
   window.close();
}


//***************** LOCAL FUNCTIONS  ******************


function initializeUI() 
{
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
  classname   = new ListControl("Class");
  populateClass();
}


function populateClass()
{
	var classesList = MMJB.getClasses();

	var classNameList		= new Array();
	var valueList			= new Array();

	classNameList.push(MM.MSG_SelectAJavaClass);
	valueList.push(MM.MSG_SelectAJavaClass);

	for (var i =0 ; i < classesList.length ; i++)
	{
		classNameList.push(classesList[i]);
		valueList.push(classesList[i]);
	}

	classname.setAll(classNameList,valueList);
	classname.setIndex(0)
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

	classname.init();

	classNames.push(MM.MSG_SelectAJavaClass);
	packageNames.push(MM.MSG_SelectAJavaClass);

	var classnameList = MMJB.getClassesFromPackage(packageName);

    if (!bValueSameAsDisplay)
	{
		if (!classnameList.length)
		{
			var errMessage = MMJB.getErrorMessage();
			if (errMessage && errMessage.length)
			{
				classname.setAll(classNames,classNames);
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
		classname.setAll(classNames,classNames);
	else
		classname.setAll(classNames,packageNames);
 }
