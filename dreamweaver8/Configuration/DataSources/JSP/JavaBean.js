// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
var DEBUG = false
var javabean_filename = "JB_D.gif"
var datasourceleaf_filename = "DSL_D.gif"

function addDynamicSource()
{
	dw.popupServerBehavior("JavaBean.htm");
}


function findDynamicSources()
{
	var retList = new Array();
	var currentdom = dreamweaver.getDocumentDOM();

  if (currentdom) {

		//find matching ssRecs
		var ssRecs = dw.serverBehaviorInspector.getServerBehaviors();
		for (var i=0; i < ssRecs.length; i++) {
		  if (ssRecs[i].type == "JavaBean") {
			retList.push(new ObjectInfo(ssRecs[i].title, javabean_filename,true,"JavaBean.htm",""));
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

	ssRec = findSSrecByTitle(elementName,"JavaBean");

	if (ssRec) 
	{
		className	= ssRec.parameters.Class;
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

		var properties = MMJB.getReadProperties(className,packageName);

		for (var i =0 ; i < properties.length ; i++)
		{
			outArray[i] = new ObjectInfo(properties[i], datasourceleaf_filename,false,"JavaBean.htm","");
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

	ssRec = findSSrecByTitle(elementName,"JavaBean")
	var retVal = "";

	if (ssRec) 
	{
		var paramObj = new Object();

		paramObj.beanName = ssRec.parameters.Id;
		paramObj.property = bindingName;

		var insertText = "<jsp:getProperty name=\"" + paramObj.beanName  + "\"" + " property=\"" + paramObj.property + "\"" + "/>";

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
		var group = new Group("JSPGetProperty");
		var part = group.getParticipants("replaceSelection")[0];

		searchBeanName	   = eval(part.searchPatterns[0].pattern);
		searchPropertyName = eval(part.searchPatterns[1].pattern);

		if (searchBeanName && searchPropertyName)
		{
			var result1 = expression.match(searchBeanName);
			var result2 = expression.match(searchPropertyName);

			if (result1 && result1.length > 1)
			{
				if (result2 && result2.length > 1)
				{
					//find the original ssRec
					var ssRecs = dw.serverBehaviorInspector.getServerBehaviors();
					for (var i=0; i < ssRecs.length; i++) {
					  if (ssRecs[i].type == "JavaBean" && ssRecs[i].parameters.Id == result1[1]) {
						retArray[0] = ssRecs[i].title;
						retArray[1] = result2[1];
						break;
					  }
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
  var ssRec = findSSRecByTitle(sourceName,"JavaBean.htm")

  if (ssRec != null && !bindingName) {
    dw.serverBehaviorInspector.deleteServerBehavior(ssRec);
  } else if (bindingName) {
    alert(MM.MSG_CantDelColumn);
  }
}

