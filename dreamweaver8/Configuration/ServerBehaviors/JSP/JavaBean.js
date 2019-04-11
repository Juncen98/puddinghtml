// Copyright 2000, 2001, 2002, 2003, 2004 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var helpDoc = MM.HELP_ssJavaBean;
var PROP_TYPE = "JavaBean";
var scope;
var paramId		= new TextField(PROP_TYPE, "Id");
var classname;
var allCheckBox;

                                
//******************* API **********************

//Returns array of ssRecords identifying all my server behaviors

function findServerBehaviors() 
{
  var paramObj = new Object();

 //The standard matching function is overridden in the 
  //canAddPartToGroup() function below.
  var sbList = findSBs(MM.LABEL_JavaBean);

  // walk the list of found behaviors, and set some extra properties
  for (var i=sbList.length-1; i>=0; i--) {

    if (sbList[i].parameters.Id 
        && ((sbList[i].parameters.Id.indexOf("_coll") != -1) || (sbList[i].parameters.Id.indexOf("_item") != -1))) {
      //remove from list
      sbList.splice(i,1);
    } else {
    
      var sbObj = sbList[i];
      sbObj.ParamArray = new Array();
      for (var j=0; j < sbObj.params.length; j++) 
    {
        if 
      ((sbObj.types[j] == "javabean_tagbody") ||
       (sbObj.types[j] == "javabean_tagbodyallprop"))
      {
		  if ((sbObj.params[j].name == sbObj.parameters.Id)||
			  (sbObj.params[j].allname == sbObj.parameters.Id))	
		  {
			  var node      = new Object();
			  node.property = sbObj.params[j].property;
			  node.value    = sbObj.params[j].value;
			  sbObj.ParamArray.push(node);
		  }
     }
    }
    }
  }

  return sbList;
}


//Called before script is launched. If no recordsets are defined, returns a error string to alert.

function canApplyServerBehavior(sbObj) {
	return true;
}


//add server behavior code to page

function applyServerBehavior(sbObj) 
{
  var paramObj = new Object();
  var errStr = "";
  var priorBeanName;

 if (sbObj)
		priorBeanName = sbObj.parameters.Id;

  if (!errStr)
    errStr = paramId.applyServerBehavior(sbObj, paramObj);
 
	errStr = CheckData(priorBeanName)
	if (errStr != "")
	{
		return errStr;
	}

  paramObj.Scope = scope.getValue();
  paramObj.Class = classname.get();

  packageName	 = classname.getValue();

  if (packageName != paramObj.Class)
  {
	//we need to store the package for later introspection.
	var siteHandle = MMNotes.open(dw.getSiteRoot(),true);
	if (siteHandle) 
	{
		var siteURL = dw.getSiteRoot();
		if (siteURL.length)
		{
			MMNotes.set(siteHandle,paramObj.Class,packageName);
		}
		MMNotes.close(siteHandle);
	}
  }

  //check that a param value was specified
  if (!errStr) 
  {
    if (!paramObj.Scope) errStr = MM.MSG_NeedParamName;
  }

	paramObj.name		= new Array();
	paramObj.property   = new Array();
	paramObj.value      = new Array();	
	paramObj.allname    = new Array();
  var patt = /\|  \|/g;
  updateGridRow();

	if (PARAM_LIST.list.length)
	{
		if (allCheckBox.checked)
		{
			paramObj.allname.push(paramObj.Id);
		}

		for (var i=0; i < PARAM_LIST.list.length ; i++)
		{
		   var currRowText = PARAM_LIST.getRow(i);
		   var index = currRowText.indexOf("|");

		   paramName = currRowText.substring(0,index);
		   paramRExpression	= currRowText.substring(index+1);
		   if ((paramRExpression.length) && (paramRExpression.toLowerCase() != MM.LABEL_JBNotInitialized))
		   {
				paramObj.name.push(paramObj.Id);
				paramObj.property.push(paramName);
				
        // Nasty hack to fix bug in GridClass. GridClass uses '|' to mark
        // column borders. This causes problems if we have dynamic expressions 
        // which include a "||". See GridClass.js function replaceEmptyStringsWithTabs.
        // We should really be using GridControlClass, but it doesn't seem worth
        // making this change right now.
				paramRExpression = paramRExpression.replace(patt,"||");
				paramObj.value.push(dwscripts.escQuotes(paramRExpression));
			}
		}
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

  if (success && sbObj.parameters.Id)
    success = paramId.inspectServerBehavior(sbObj);

   scope.pickValue(sbObj.parameters.Scope);

   //Check if the class is part of a package

	var packageName = "";
	var siteHandle = MMNotes.open(dw.getSiteRoot(),true);
	if (siteHandle) 
	{
		var siteURL = dw.getSiteRoot();
		if (siteURL.length)
		{
			packageName = MMNotes.get(siteHandle,sbObj.parameters.Class);
			if (packageName && packageName.length)
			{
				GetClassesFromPackage(packageName,true);				
			}
		}
		MMNotes.close(siteHandle);
	}
 
   classname.pickValue(sbObj.parameters.Class);
 
   var Properties = MMJB.getWriteProperties(sbObj.parameters.Class,packageName);

   if (Properties.length == 0)
   {
	 //Check for the error Message.
	 var errMessage = MMJB.getErrorMessage();
	 if (errMessage && errMessage.length)
	 {
		SetEnabled(ivalue_LABEL, false);
		SetEnabled(allCheckBox, false);
		alert(errMessage);
		return;
	 }
	SetEnabled(ivalue_LABEL, false);
	SetEnabled(allCheckBox, false);
   }
   else
   {
		SetEnabled(ivalue_LABEL, true);
		SetEnabled(allCheckBox, true);
   }

    var list = PARAM_LIST;

	var rowTextArr = new Array();
	var rowValArr  = new Array();


	var bAll = false;

	for (var j = 0;j < sbObj.ParamArray.length; j++)
	{
  
		if (!sbObj.ParamArray[j].property || sbObj.ParamArray[j].property == "*")
		{
			bAll = true;
		}
	}

	if (!bAll)
	{
		allCheckBox.checked = false;
	}
	else
	{
		allCheckBox.checked = true;
	}

	for (var i = 0; i < Properties.length; i++)
	{
		var bHandled = false;

		for (var j = 0;j < sbObj.ParamArray.length; j++)
		{
			if (sbObj.ParamArray[j].property == Properties[i])
			{
				rowTextArr[i] = Properties[i] + "|" + sbObj.ParamArray[j].value;
				bHandled = true;
			}
		}

		if (!bHandled)
		{
			rowTextArr[i] = Properties[i] + "|" + MM.LABEL_JBNotInitialized;
		}

		rowValArr[i]  = "";
	}

	PARAM_LIST.setAllRows(rowTextArr,rowValArr);
}


function deleteServerBehavior(sbObj) 
{
  paramId.deleteServerBehavior(sbObj);
  deleteSB(sbObj);
}


function analyzeServerBehavior(sbObj, allRecs) 
{
  paramId.analyzeServerBehavior(sbObj);

  for (var i=0; i < allRecs.length; i++) 
  { 
    var thisRec = allRecs[i];

	if ((thisRec.type == "JavaBeanIndexed") ||
		(thisRec.type == "JavaBeanEnumeration"))
	{
		for (j=0;  j < thisRec.participants.length; j++) 
		{ 
		  if (thisRec.participants[j] == sbObj.participants[0])	
		  {
			sbObj.deleted = true;
		  }
		}
     }
  }

  // check that className is not blank
  if (!sbObj.parameters.Class) {
    sbObj.incomplete = true;
  }
}


//***************** LOCAL FUNCTIONS  ******************


function initializeUI() 
{
  paramId.initializeUI();
  scope		  = new ListControl("Scope");
  classname   = new ListControl("Class");
  PARAM_LIST  = new Grid("ParamList");

  ivalue_LABEL    = findObject("initValue");
  allCheckBox     = findObject("all");
  
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

  SetEnabled(ivalue_LABEL, false);

  paramId.setValue(createNewName());

  populateScope();
  populateClass();
}


function populateScope()
{
	scope.add(BeanTypes[0],"page");
	scope.add(BeanTypes[1],"request");
	scope.add(BeanTypes[2],"session");
	scope.add(BeanTypes[3],"application");
	scope.setIndex(0)
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


function DeleteParam()
{
	/*
	This function is called when the user
	clicks on the minus button above the params list box.
	If there is not a selected index in the list, we do
	nothing. 
	*/

	PARAM_LIST.del()
	//UpdateMinusButton()
}

function AddParam()
{
	//PARAM_LIST.append()
	//UpdateMinusButton()
	PARAM_LIST.object.options.push(new Option(""))
}


function RefreshBeanProperties()
{
  var aClassName = classname.get();
  packageName	 = classname.getValue();

  var Properties = MMJB.getWriteProperties(aClassName,packageName);

  var rowTextArr = new Array();
  var rowValArr  = new Array();

   if (Properties.length == 0)
   {
	 //Check for the error Message.
	 var errMessage = MMJB.getErrorMessage();
	 if (errMessage && errMessage.length)
	 {
		SetEnabled(ivalue_LABEL, false);
		SetEnabled(allCheckBox, false);
		PARAM_LIST.setAllRows(rowTextArr,rowValArr);
		PARAM_LIST.setRowIndex(-1);
		alert(errMessage);
		return;
	 }
	SetEnabled(ivalue_LABEL, false);
	SetEnabled(allCheckBox, false);
   }

  var bAll = allCheckBox.checked;
  var list = PARAM_LIST;

	for (var j = 0;j < Properties.length; j++)
	{
		rowTextArr[j] = Properties[j] + "|" + MM.LABEL_JBNotInitialized;
		rowValArr[j]  = "";
	}

	PARAM_LIST.setAllRows(rowTextArr,rowValArr);
	PARAM_LIST.setRowIndex(-1);
	SetEnabled(ivalue_LABEL, false);
}



function canAddPartToGroup(groupedPartList, part, partList) {
 
  if ( (part.participantName == "javabean_tagbody")  ||
	   (part.participantName == "javabean_tagbodyallprop"))
  {
    retVal = isPartOfJavaBean(groupedPartList, part);
  }
  
  return retVal;
}

function isPartOfJavaBean(groupedPartList, part) {
  var retVal = false;
  
  for (var i=0; i < groupedPartList.length; i++) {
    if (groupedPartList[i].participantName == "javabean_tagbegin")
	{
	  if (part.participantName == "javabean_tagbody")
	  {
        if (part.parameters.name == groupedPartList[i].parameters.Id) 
		{
		  retVal = true;
		  break;
		}
	  }
	  else if (part.participantName == "javabean_tagbodyallprop")
	  {
        if (part.parameters.allname == groupedPartList[i].parameters.Id) 
		{
		  retVal = true;
		  break;
		}
	  }
   }
 }
  
  return retVal;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   createNewName
//
// DESCRIPTION:
//   This function returns a unique name for a new repeated region
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - a unique name
//--------------------------------------------------------------------
function createNewName()
{
  //search the ssRecs for other names
  var retVal = "";
  
  var ssRecs = dw.serverBehaviorInspector.getServerBehaviors();
  
  var num = 0;
  var beanName = "";
  
  while (!retVal) {
    num++;
    beanName = "Bean" + num;
    for (var i=0; i < ssRecs.length; i++) { //search all ssRecs
      var ssRec = ssRecs[i];
      if (((ssRec.type == "JavaBean") || (ssRec.type == "JavaBeanIndexed")) && 
          (ssRec.parameters.Id.toLowerCase() == beanName.toLowerCase())) {
        break;
      }
    }
    if (i >= ssRecs.length) {
      retVal = beanName;
    }
  }
  
  return retVal;
}

function CheckData(priorName)
{
	// we don't get here if we are just testing the SQL statement

	var strOut = ""

	var theName = Trim(paramId.getValue())

	if (theName == "")
	{
		strOut += MM.MSG_NoJavaBeanName;
		return strOut
	}

	if (!IsValidVarName(theName))
	{
		strOut = MM.MSG_InvalidJavaBeanName
		return strOut
	}

	if (IsDupeObjectName(theName, priorName))
	{
		return MM.MSG_DupeRecordsetName;
	}

	if (IsReservedWord(theName))
	{
		strOut = dwscripts.sprintf(MM.MSG_ReservedWord, theName);
	}

	var aClassName = classname.get();
	if(aClassName == MM.MSG_SelectAJavaClass)
	{
		strOut = MM.MSG_ErrSelectAJavaClass;
	}
	else
	{
		var Properties = MMJB.getWriteProperties(aClassName);
		var errMessage = MMJB.getErrorMessage();
		if (errMessage && errMessage.length)
		{
			strOut = errMessage;
		}
	}


	return strOut;
}

function LaunchDynamicDataDialog() 
{
  var expression = dw.showDynamicDataDialog(ivalue_LABEL.value);
  if (expression) 
  {
    ivalue_LABEL.value = expression;
	  ivalue_LABEL.focus();
  }
}

function updateGridRow()
{
  var currRowObj  = PARAM_LIST.getRowValue();
  var currRowText = PARAM_LIST.getRow();

  var currPropName = currRowText.substring(  0,currRowText.indexOf("|")  );

  if (ivalue_LABEL.value == "")
  {
	var bAll=allCheckBox.checked;

  var newRowText = currPropName + "|" + MM.LABEL_JBNotInitialized; 
  }
  else
  {
	var newRowText = currPropName + "|" + ivalue_LABEL.value; 
  }
  PARAM_LIST.setRow(newRowText);
}


// function: displayGridFieldValues
// description: called when the user clicks on a new row in the grid,
// changes the values of the UI fields to display the correct information

function displayGridFieldValues()
{ 
  // don't bother if grid is empty -- needed because this fn is also
  // called when the connection or table changes
  if (PARAM_LIST.list.length == 0){
    ivalue_LABEL.value = "";
    return;
  }

  PARAM_LIST.setRowIndex(PARAM_LIST.getRowIndex());

   SetEnabled(ivalue_LABEL, true);
   SetEnabled(allCheckBox, true);

    
   var currRowText = PARAM_LIST.getRow();
   var currRowVal  = PARAM_LIST.getRowValue();	

    var index = currRowText.indexOf("|");
    paramName = currRowText.substring(0,index);
    paramRExpression	= currRowText.substring(index+1);
   
   // Important Note: The order of operations here is extremely important.
   // The menu display has to update before showDifferentParams can be called.
   // showDifferentParams can show or hide the submit buttton, so the submit
   // menu value cannot be called until showDifferentParams is.
   // If ever this file is re-written, a class should be written to manage
   // the complexity of the UI interactions. In the meantime, refrain
   // from re-arranging the code unless you are sure of what you are doing.
   
   if (paramRExpression == MM.LABEL_JBNotInitialized) {
     ivalue_LABEL.value = ""; // update label field
   } else {
     ivalue_LABEL.value = paramRExpression; // update label field
   }
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
				var rowTextArr = new Array();
				var rowValArr  = new Array();
				PARAM_LIST.setAllRows(rowTextArr,rowValArr);
				PARAM_LIST.setRowIndex(-1);
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
