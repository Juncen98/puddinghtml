// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var PROP_TYPE = "Proxy";
var CLASSNAME;
var INTROSPECTORLIST;
var isFile = false;
var helpDoc = MM.HELP_wsProxyGenUsingIntrospector;

function commandButtons(){
	return new Array(MM.BTN_OK, "okClicked()",
					 MM.BTN_Cancel, "cancelClicked()",
					 MM.BTN_Help, "displayHelp()" );
}

var helpDoc = MM.HELP_ssProxyChooser;
																
//******************* API **********************

function cancelClicked()
{
	 window.close();
}

function okClicked()
{
	var errMessage;
	// set the busy cursor...
	MM.setBusyCursor();  
	 
	if (!CLASSNAME.value)
	{
		errMessage = MM.MSG_ProxyChooserClassNameMissing;
		MM.clearBusyCursor(); 			 
		alert(errMessage);
		return;
	}
	var ProxyObj = INTROSPECTORLIST.getValue(INTROSPECTORLIST.getIndex()); 
	if (ProxyObj)
	{
		addProxyChooserEntry(ProxyObj, CLASSNAME.value, isFile);
		dw.serverComponentsPalette.refresh();
		window.close();
	}
	else
	{
		errMessage = MM.MSG_IntrospectorNameMissing;
		MM.clearBusyCursor(); 	 
		alert(errMessage);
	}
}


//***************** LOCAL FUNCTIONS  ******************


function checkEnableClass()
{
	var ProxyObj = INTROSPECTORLIST.getValue(INTROSPECTORLIST.getIndex()); 
	if (ProxyObj)
	{
		CLASSNAME.removeAttribute("disabled");
		SetClassesLabel(ProxyObj);
	}
	else
	{
		CLASSNAME.setAttribute("disabled","true");
	}
}

function initializeUI() 
{
    CLASSNAME			= dwscripts.findDOMObject("Class");
	INTROSPECTORLIST	= new ListControl("introspectorslist");

	//Get the list of introspector from Introspectors folder.
	var introspectorObjs = getIntrospectorList();
	var serverModel = dw.getDocumentDOM().serverModel;
	var serverModelName = serverModel.getDisplayName();
	//if the server model for document is not set
	//look for the document type in the site.
	if (serverModelName.length == 0)
	{
		serverModelName = site.getServerDisplayNameForSite();
	}

	for (var i=0 ; i < introspectorObjs.length ; i++)
	{
		var aObject = introspectorObjs[i];
		var serverModels = aObject.serverModels;
		for (var j=0; j < serverModels.length ; j++)
		{
			if (serverModels[j]==serverModelName)
			{
				INTROSPECTORLIST.add(aObject.name,aObject);
				break;
			}
		}
	}
	INTROSPECTORLIST.setIndex(0);
	var ProxyObj = INTROSPECTORLIST.getValue(INTROSPECTORLIST.getIndex()); 
	if (!ProxyObj)
	{
		CLASSNAME.setAttribute("disabled","true");
	}
	else
	{
		SetClassesLabel(ProxyObj);
	}
}

function SetClassesLabel(ProxyObj)
{
	if(!ProxyObj)
	{
		return;
	}
	var aLabel = findObject("ClassesLabel");
	if(!aLabel)
	{
		return;
	}

	// TODO: make this code abstract rather than special case!
	aName = ProxyObj.name;
	if(aName.indexOf(".NET") != -1)
	{
		aLabel.innerHTML = MM.LocationProxyClass;
	}
	else
	{
		aLabel.innerHTML = MM.FolderProxyClass;
	}
}

function GetClass()
{
	// TODO: make this code abstract rather than special case!
	var ProxyObj = INTROSPECTORLIST.getValue(INTROSPECTORLIST.getIndex());
	aName = ProxyObj.name;
	var className = null;
	if(aName.indexOf(".NET") != -1)
	{
		var theFilter = new Array("DLL (*.dll)|*.dll|DLL|");
		className = dw.browseForFileURL("open", MM.LABEL_ProxyGetClassName, false, false, theFilter);
		isFile = true;
	}
	else
	{
		className = dw.browseForFolderURL(MM.MSG_ProxyChooseFolder);
		isFile = false;
	}
	if(className && className.length)
	{
		CLASSNAME.value =  MMNotes.localURLToFilePath(className);
	}

//	var extIndex		= CLASSNAME.value.lastIndexOf(".");
//	if (extIndex != -1)
//	{
//		var extension = CLASSNAME.value.substring(extIndex);
//		for (var i=0; i < INTROSPECTORLIST.getLen() ; i++)
//		{
//			var introObj= INTROSPECTORLIST.getValue(i);
//			if (introObj && (introObj.extension == extension))
//			{
//				var extArray = introObj.extensions;
//				if(extArray.length)
//				{
//					for(var j = 0; j < extArray.length; j++)
//					{
//						var introspectorExt = extArray[j];
//						if(introspectorExt && introspectorExt == extension)
//						{
//							//select the entry in the drop down.
//							INTROSPECTORLIST.setIndex(i);
//							break;
//						} 					 
//					}
//				}
//			}
//		}
//	}
}

