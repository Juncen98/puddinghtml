// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
var DEBUG = false
var javabean_filename = "JBCollection_D.gif"
var datasourceleaf_filename = "DSL_D.gif"

function addDynamicSource()
{
	dw.popupServerBehavior("JavaBeanIndexed.htm");
}


function findDynamicSources()
{
	var retList = new Array();
	var currentdom = dreamweaver.getDocumentDOM();

  if (currentdom) {

		//find matching ssRecs
		var ssRecs = dw.serverBehaviorInspector.getServerBehaviors();
		for (var i=0; i < ssRecs.length; i++) {
		  if (ssRecs[i].type == "JavaBeanIndexed") 
		  {
			retList.push(new ObjectInfo(ssRecs[i].title, javabean_filename,true,"JavaBeanIndexed.htm",ssRecs[i].parameters.Id));
		  }
		}
	}

	return retList;
}

////////////////////////////////////////////////////////////////////////////////
//	Function: generateDynamicSourceBindings()
//
//	Returns a list of bindings for elementNode on the page.
////////////////////////////////////////////////////////////////////////////////
function generateDynamicSourceBindings(elementName)
{
	var BindingsArray = new Array();
	var outArray = new Array();

	ssRec = findSSrecByTitle(elementName,"JavaBeanIndexed");

	if (ssRec) 
	{
		className = ssRec.parameters.ItemClass;

		packageName = "";
		var siteHandle = MMNotes.open(dw.getSiteRoot(),true);
		if (siteHandle) 
		{
			var siteURL = dw.getSiteRoot();
			if (siteURL.length)
			{
				packageName = MMNotes.get(siteHandle,className);
			}
			MMNotes.close(siteHandle);
		}

		var properties = MMJB.getWriteProperties(className,packageName);

		for (var i =0 ; i < properties.length ; i++)
		{
			outArray[i] = new ObjectInfo(properties[i], datasourceleaf_filename,false,"JavaBeanIndexed.htm","");
		}
	}
		
	return outArray;

}


////////////////////////////////////////////////////////////////////////////////
//
//	Function: generateDynamicDataRef
//
//	Returns a dynamic binding string.
////////////////////////////////////////////////////////////////////////////////
function generateDynamicDataRef(elementName,bindingName,dropObject)
{

	ssRec = findSSrecByTitle(elementName,"JavaBeanIndexed")
	var retVal = "";

	if (ssRec) 
	{
		var paramObj = new Object();

		paramObj.beanName = ssRec.parameters.Id + "_item";

		if (bindingName.length)
		{
			bindingNamePrefix = bindingName.substr(0,1);
			bindingName		  = bindingName.substr(1,bindingName.length);
			bindingName		  = bindingNamePrefix.toUpperCase() + bindingName;
		}

		paramObj.property = bindingName;

		var group = new Group("JSPGetPropertyMethod");
		var insertText = group.getInsertStrings(paramObj,"replaceSelection");
		insertText = insertText + "";
		retVal = insertText;

		// If the string is being inserted inside a script block, strip the
		// script delimiters.
		if (dwscripts.canStripScriptDelimiters(dropObject))
			retVal = dwscripts.stripScriptDelimiters(retVal);


	}

	return retVal;
}


////////////////////////////////////////////////////////////////////////////////
//
//	Function: inspectDynamicDataRef
//
//	Inspects a dynamic binding string and returns a pair of source and binding.
////////////////////////////////////////////////////////////////////////////////
function inspectDynamicDataRef(expression)
{
	var retArray = new Array();

	if (expression && expression.length)
	{
		var group = new Group("JSPGetPropertyMethod");
		var part = group.getParticipants("replaceSelection")[0];

		searchPattern	   = eval(part.searchPatterns[0].pattern);

		if (searchPattern)
		{
			var result1 = expression.match(searchPattern);
	
			if (result1 && result1.length > 1)
			{
				//find the original ssRec
				var ssRecs = dw.serverBehaviorInspector.getServerBehaviors();
				for (var i=0; i < ssRecs.length; i++) {
				  if ((ssRecs[i].type == "JavaBeanIndexed") && (ssRecs[i].parameters.Id +"_item" == result1[1])) {
					retArray[0] = ssRecs[i].title;

					bindingName = result1[2];

					if (bindingName.length)
					{
						bindingNamePrefix = bindingName.substr(0,1);
						bindingName		  = bindingName.substr(1,bindingName.length);
						bindingName		  = bindingNamePrefix.toLowerCase() + bindingName;
					}

					retArray[1] = bindingName;
					break;
				  }
				}
			}
		}
	}
	return retArray;
}



////////////////////////////////////////////////////////////////////////////////
//
//	Function: deleteDynamicSource
//
//	Deletes a dynamic source from the document.
////////////////////////////////////////////////////////////////////////////////
function deleteDynamicSource(sourceName,bindingName)
{
  var ssRec = findSSRecByTitle(sourceName,"JavaBeanIndexed.htm")

  if (ssRec != null && !bindingName) {
    dw.serverBehaviorInspector.deleteServerBehavior(ssRec);
  } else if (bindingName) {
    alert(MM.MSG_CantDelColumn);
  }
}

