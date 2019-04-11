// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
var DEBUG = false
var helpDoc = MM.HELP_compJavaBeans;
var JAVABEANCLASS_FILENAME="Shared/MM/Images/JavaBean.gif";
var PROPERTIES_FILENAME = "Components/Common/DSL_D.gif";
var METHODS_FILENAME = "Components/Common/DSL_D.gif";
var JavaBeanListFile = "JavaBeanList.xml"

var JavaBeanListOpen  = "<javabeans>\r\n";
var JavaBeanRec		  = "<javabean classname=\"@@name@@\" classlocation=\"@@location@@\"></javabean>\r\n";
var JavaBeanRecClose  = "</javabeans>";

//*************** GLOBALS VARS *****************

//*******************  COMPONENT API **********************
//*-------------------------------------------------------------------
// FUNCTION:
//   displayInstructions
//
// DESCRIPTION:
//	 returns a instructions string to assist the user to make decisions.
//
// ARGUMENTS:
//	 serverModelName
//	
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function displayInstructions()
{
	var dispMsg = "";
	if (navigator.platform == "Win32")
	{
		dispMsg =  MM.MSG_WinJavaBeanInstructions;
	}
	else
	{
		dispMsg =  MM.MSG_MacJavaBeanInstructions;
	}

	return dispMsg;
}


//*******************  COMPONENT API **********************
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
//   a array of componentRec nodes.
//--------------------------------------------------------------------
function getComponentChildren(componentRec)
{
	var cs_Children = new Array();

	if (!componentRec)
	{
		//read saved entries for java beans.
		var aSiteConfigurationPath = dw.getSiteConfigurationPath();
		var javabeanListPath = aSiteConfigurationPath + JavaBeanListFile;
		if (DWfile.exists(javabeanListPath))
		{
			var listData		 = DWfile.read(javabeanListPath);
			var listDom			 = dw.getDocumentDOM(dw.getConfigurationPath() + '/Shared/MM/Cache/empty.htm');	
			listDom.documentElement.outerHTML = listData;
			var javabeanNodes = listDom.getElementsByTagName("javabean");
			if (javabeanNodes.length)
			{
				for (var i=0; i < javabeanNodes.length ; i++ )
				{
					var aName = javabeanNodes[i].classname;
					//we have a call to populate the zero level nodes.
					var rootCompInfo = new ComponentRec(aName, JAVABEANCLASS_FILENAME,true,true,aName);
					rootCompInfo.objectType = "Class";
					rootCompInfo.classlocation = javabeanNodes[i].classlocation;
					cs_Children.push(rootCompInfo);
				}
			}
		}
	}
	else
	{
		if (componentRec.objectType == "Class")
		{
			var propertiesCompInfo = new ComponentRec("Properties", PROPERTIES_FILENAME, true,false,"Properties");
			propertiesCompInfo.objectType = "Properties";

			var methodsCompInfo = new ComponentRec("Methods", METHODS_FILENAME,true,false,"Methods");
			methodsCompInfo.objectType = "Methods";

			cs_Children.push(propertiesCompInfo);
			cs_Children.push(methodsCompInfo);
		}
		else if (componentRec.objectType == "Properties")
		{
			 var Properties = MMJB.getProperties(componentRec.parent.getName(),componentRec.parent.classlocation);
			 if (Properties.length)
			 {
				for (var j = 0;j < Properties.length; j++)
				{
					var propertiesCompInfo = new ComponentRec(Properties[j], PROPERTIES_FILENAME,false,true,Properties[j]);
					propertiesCompInfo.objectType = "Property";
					cs_Children.push(propertiesCompInfo);
				}
			 }
		}
		else if (componentRec.objectType == "Methods")
		{
			 var Methods = MMJB.getMethods(componentRec.parent.getName(),componentRec.parent.classlocation);
			 if (Methods.length)
			 {
				for (var j = 0;j < Methods.length; j++)
				{
					var methodsCompInfo = new ComponentRec(Methods[j], PROPERTIES_FILENAME,false,true,Methods[j]);
					methodsCompInfo.objectType = "Method";
					cs_Children.push(methodsCompInfo);
				}
			 }
		}
	}

	return cs_Children;
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
	return "DWJavaBeansContext";
}


//*-------------------------------------------------------------------
// FUNCTION:
//   toolbarButtons
//
// DESCRIPTION:
//	 returns a list of toolbaricons
//
// ARGUMENTS:
//	 parentNode-componentRec.
//	
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function toolbarControls()
{
	var toolBarBtnArray = new Array();

	var plusButton = new ToolbarControlRec();
	plusButton.image			= PLUSBUTTONUP;
	plusButton.pressedImage		= PLUSBUTTONDOWN;
	plusButton.disabledImage	= "";
	plusButton.toolStyle		= "left";
	plusButton.toolTipText		= MM.MSG_JavaBeanAddToolTipText;
	plusButton.command = "clickedAdd()";
	toolBarBtnArray.push(plusButton);

	var minusButton = new ToolbarControlRec();
	minusButton.image			= MINUSBUTTONUP;
	minusButton.pressedImage	= MINUSBUTTONDOWN;
	minusButton.disabledImage	= MINUSBUTTONDISABLED
	minusButton.toolStyle		= "left";
	minusButton.tooltipText		= MM.MSG_JavaBeanDeleteToolTipText;
	minusButton.command = "clickedDelete()";
	minusButton.enabled = "(dw.serverComponentsPalette.getSelectedNode() !=null && (dw.serverComponentsPalette.getSelectedNode().objectType=='Class'))";
	toolBarBtnArray.push(minusButton);

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
	if (componentRec)
	{
		if (componentRec.objectType=="Class")
		{
			codeToDrop =  dw.getExtDataValue("javabeans_constructor", "insertText");
			codeToDrop =  codeToDrop.replace(RegExp("@@Id@@","g"),componentRec.name);
			codeToDrop =  codeToDrop.replace(RegExp("@@Class@@","g"),componentRec.name);
		}
		else if (componentRec.objectType=="Property")
		{
			codeToDrop =  dw.getExtDataValue("javabeans_property", "insertText");
			codeToDrop =  codeToDrop.replace(RegExp("@@beanName@@","g"),componentRec.parent.parent.name);
			codeToDrop =  codeToDrop.replace(RegExp("@@property@@","g"),componentRec.name);
		}
		else
		{
			codeToDrop =  componentRec.name;
		}
	}
	return codeToDrop;
}

//*-------------------------------------------------------------------
// FUNCTION:
//   deleteComponent
//
// DESCRIPTION:
//	 pressing the "del" key or using the cut operation cause delete to happen.
//
// ARGUMENTS:
//	 component Rec.
//	
// RETURNS:
//   errorString if it fails to delete
//--------------------------------------------------------------------
function deleteComponent(componentRec)
{
	clickedDelete();
}



//*******************  LOCAL  FUNCTIONS **********************
//*-------------------------------------------------------------------
// FUNCTION:
//   clickedAdd()
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------

function clickedAdd()
{
	var retStr="";
	dw.popupCommand("JavaBean.htm");
	if (MM.classname && MM.classlocation)
	{
		if (addJavaBeanEntry(MM.classname,MM.classlocation))
		{
			dw.serverComponentsPalette.refresh();
		}
	}
	return retStr;
	//save the information into "JavaBeansList.xml"
}
//*-------------------------------------------------------------------
// FUNCTION:
//   toolbarButtons
//
// DESCRIPTION:
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------

function clickedDelete()
{
	var retStr="";
	var selectedObj = dw.serverComponentsPalette.getSelectedNode();
	if (selectedObj.objectType == "Class")
	{
		if (deleteJavaBeanEntry(selectedObj.name))
		{
			dw.serverComponentsPalette.refresh();
		}
	}
	return retStr;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   deleteJavaBeanEntry(className)
//
// DESCRIPTION:
//	 delete an entry from the java bean class.
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function deleteJavaBeanEntry(className)
{
	var fileContents;
	var classNameReplacePattern = /@@name@@/g;
	var classLocationReplacePattern = /@@location@@/g;
	var aSiteConfigurationPath = dw.getSiteConfigurationPath();
	var javabeanListPath = aSiteConfigurationPath + JavaBeanListFile;

	fileContents = JavaBeanListOpen;
	if (DWfile.exists(javabeanListPath))
	{
		var listData		 = DWfile.read(javabeanListPath);
		var listDom			 = dw.getDocumentDOM(dw.getConfigurationPath() + '/Shared/MM/Cache/empty.htm');	
		listDom.documentElement.outerHTML = listData;
		var javabeanNodes = listDom.getElementsByTagName("javabean");
		if (javabeanNodes.length)
		{
			for (var i=0; i < javabeanNodes.length ; i++ )
			{
				var aRec = JavaBeanRec;
				if (javabeanNodes[i].classname == className)
				{
					continue;
				}
				aRec = aRec.replace(classNameReplacePattern, javabeanNodes[i].classname);
				aRec = aRec.replace(classLocationReplacePattern, javabeanNodes[i].classlocation);
				fileContents = fileContents + aRec;
			}
		}
	}
	fileContents = fileContents + JavaBeanRecClose;
	return DWfile.write(javabeanListPath,fileContents);
}

//*-------------------------------------------------------------------
// FUNCTION:
//   addJavaBeanEntry(className,classLocation)
//
// DESCRIPTION:
//	 add a new entry information for the java beans file.
//
// ARGUMENTS:
//	
// RETURNS:
//--------------------------------------------------------------------
function addJavaBeanEntry(className,classLocation)
{
	var fileContents;
	var classNameReplacePattern = /@@name@@/g;
	var classLocationReplacePattern = /@@location@@/g;
	var aSiteConfigurationPath = dw.getSiteConfigurationPath();
	var javabeanListPath = aSiteConfigurationPath + JavaBeanListFile;
	fileContents = JavaBeanListOpen;
	if (DWfile.exists(javabeanListPath))
	{
		var listData		 = DWfile.read(javabeanListPath);
		var listDom			 = dw.getDocumentDOM(dw.getConfigurationPath() + '/Shared/MM/Cache/empty.htm');	
		listDom.documentElement.outerHTML = listData;
		var javabeanNodes = listDom.getElementsByTagName("javabean");
		if (javabeanNodes.length)
		{
			for (var i=0; i < javabeanNodes.length ; i++ )
			{
				var aRec = JavaBeanRec;
				aRec = aRec.replace(classNameReplacePattern, javabeanNodes[i].classname);
				aRec = aRec.replace(classLocationReplacePattern, javabeanNodes[i].classlocation);
				fileContents = fileContents + aRec;
			}
		}
	}
	//add the new entry
	var aRec = JavaBeanRec;
	aRec = aRec.replace(classNameReplacePattern, className);
	aRec = aRec.replace(classLocationReplacePattern, classLocation);
	fileContents = fileContents + aRec;

	fileContents = fileContents + JavaBeanRecClose;
	return DWfile.write(javabeanListPath,fileContents);
}

// Specify list of steps that user must complete to get useful information
// in this panel. Note that we display previous steps so that we present
// user with a single dynamic list (not 2 static lists).
//
// TBD: do we want to implement the "events" from previous list for consistency?

function getSetupSteps()
{
	var title = MM.MSG_JavaBean_InstructionsTitle;
	var step1 = MM.MSG_JavaBean_InstructionsStep1;
	var step2 = MM.MSG_JavaBean_InstructionsStep2;
	return new Array(title, step1, step2);
}

function setupStepsCompleted()
{
	var stepsCompleted = 0;	
	return stepsCompleted;
}
