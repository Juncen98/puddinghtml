//Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

var emptyPath = dw.getConfigurationPath() + "/Shared/MM/Cache/empty.htm";

////////////////////////////////////////////////////////////////////////////////
//
//	Function: docBase
//
//	Returns the base path for the current document.
//
////////////////////////////////////////////////////////////////////////////////
function docBase()
{
	var docURL;
	var docBase;
	var	index	= 0;

	docURL = dreamweaver.getDocumentPath("DOCUMENT");
	if ( "" == docURL )
		return "";

	index = docURL.lastIndexOf('/');
	if ( -1 == index )
		return "";
	
	return docURL.substring(0, index);
} // function docBase()

////////////////////////////////////////////////////////////////////////////////
//
//	Function: findObject
//
//	Returns the named object.
//
////////////////////////////////////////////////////////////////////////////////
function findObject(objName,  parentObj)  
{
	var	curObj	= "";
	var	found	= false;
	var	i		= 0;
	var NS		= (navigator.appName.indexOf("Netscape") != -1);
	var tempObj	= ""
	

	if (!NS && document.all) 
		curObj = document.all[objName]; //IE4
	else 
	{
	    parentObj = (parentObj != null)? parentObj.document : document;

		if (parentObj[objName] != null) 
			curObj = parentObj[objName]; //at top level
		else 
		{ 
    		if (parentObj.forms) for (i=0; i<parentObj.forms.length; i++)
			{  
				//search level for form object
				if (parentObj.forms[i][objName]) 
				{
					curObj = parentObj.forms[i][objName];
					found = true; break;
				} 
			} // if (parentObj.forms) for (i=0; i<parentObj.forms.length; i++)

			if (!found && NS && parentObj.layers && parentObj.layers.length > 0) 
			{
				parentObj = parentObj.layers;
				for (i=0; i<parentObj.length; i++) 
				{ //else search for child layers
					tempObj = findObject(objName,parentObj[i]); //recurse
					if (tempObj) 
					{ 
						curObj = tempObj; break;
					} //if found, done
				} 
			} // if (!found && NS && parentObj.layers && parentObj.layers.length > 0)
		} // if (parentObj[objName] != null)  else 
	} // if (!NS && document.all) else
  
	return curObj;
} // function findObject(objName,  parentObj)


////////////////////////////////////////////////////////////////////////////////
//
//	Function: showHideTranslated
//
//	Shows or hides the translated attribute button layer of a PI according to
//	whether or not the object being inspected has translated attributes.
//
//  In UltraDev, the tool often generates translated attributes without the 
//  user being aware of that fact.  As a result, showing the lightening bolt
//  was causing confusion.  To fix the problem, we always hide the lightening
//  bolt for UltraDev.
//
////////////////////////////////////////////////////////////////////////////////
function showHideTranslated()
{
	if ( !dw.getDocumentDOM() )
		return;
	var theObj = dw.getDocumentDOM().getSelectedNode();
	if (!theObj.tagName)
		return;
	
	if ( theObj.hasTranslatedAttributes() && dw.appName != "Dreamweaver UltraDev")
	{	
		document.layers['tButtonSpan'].visibility = 'visible';
		// Show the layer
	}
	else
	{
		document.layers['tButtonSpan'].visibility = 'hidden';
		// Hide the layer
	}

} // function showHideTranslated( theObj, theLayer )

////////////////////////////////////////////////////////////////////////////////
//
//	Function: launchQuickTagEditor
//
//	Displays the quick tag editor.  If being called because the translated
//	attributes icon was clicked, then the caller should set forTranslationIcon
//	to true.
//
////////////////////////////////////////////////////////////////////////////////
function launchQuickTagEditor( forTranslationIcon )
{
    // Currently, forTranslationIcon is ignored.
	dw.showQuickTagEditor("near mouse");
} // function launchQuickTagEditor( forTranslationIcon )


////////////////////////////////////////////////////////////////////////////////
//
//
//
////////////////////////////////////////////////////////////////////////////////
function buildSelectionNode(tagName)
{
  var dom = dw.getDocumentDOM();
  var theObjOffsets = dom.getSelection();
  var documentContents = dom.documentElement.outerHTML;
  var selection = documentContents.substr(theObjOffsets[0], theObjOffsets[1]-theObjOffsets[0]+1);
  var emptyDom = dw.getDocumentDOM(emptyPath);
  emptyDom.documentElement.outerHTML = "<body>" + selection + "</body>";
  objArray = emptyDom.getElementsByTagName(tagName);

  if (objArray.length != 1)
    return null;
  else
	return objArray[0];
} // function buildSelectionNode


////////////////////////////////////////////////////////////////////////////////
//
//
//
////////////////////////////////////////////////////////////////////////////////
function saveSelectionNode(theObj)
{
  var dom = dw.getDocumentDOM();
  var theObjOffsets = dom.getSelection();
  var documentContents = dom.documentElement.outerHTML;
  var newDocumentContents = documentContents.substr(0, theObjOffsets[0]);
  newDocumentContents += theObj.outerHTML;
  newDocumentContents += documentContents.substr(theObjOffsets[1]);
  dom.documentElement.outerHTML = newDocumentContents;
} // function saveSelectionNode


////////////////////////////////////////////////////////////////////////////////
//	Function: snapshot
//
//  takes a js pi filename
//
//	Returns: xml w/ snapshot info for this PI
//
////////////////////////////////////////////////////////////////////////////////
function snapshot(piFileName)
{
  var controlTags = new Array("input", "select", "button", "textarea");
  var controlTag;
  var controls;
  var control;
  var i, j;

  snapStr = "<snapshot name=\"" + piFileName + "\">\r\n";

  for (i=0; i<controlTags.length; i++)
  {
    controlTag = controlTags[i];
    controls = document.getElementsByTagName(controlTag);
    for (j=0; j < controls.length; j++)
    {
      snapStr += snapshotControl(controls[j]);
    }
  }

  // also get text inside tag names "textLabel" - specifically for template.htm, for bug 79594
  var labelObj = findObject("textLabel");
  if (labelObj)
  {
    snapStr += "\t<string name=\"textLabel\" ";
    snapStr += "value=\"" + labelObj.innerHTML + "\" ";
    snapStr += "/>\r\n";
  }

  snapStr += "</snapshot>\r\n";

  return snapStr;

} // snapshot

////////////////////////////////////////////////////////////////////////////////
//	Function: snapshotControl
//
//	takes name of control object (input, select, button, textarea)
//
//	Returns: xml w/ snapshot info for that control
//
////////////////////////////////////////////////////////////////////////////////
//function snapshotControl(controlName)
function snapshotControl(control)
{

  var controlName = control.name;
  var controlTag = control.tagName;

  var snapStr = "\t<control name=\"" + controlName + "\" ";

  if (control.disabled)
    snapStr += "enabled=\"false\" ";
  else
    snapStr += "enabled=\"true\" ";

  // do something different depending on the type of input object
  if (controlTag == "INPUT")
  {
    var inputType = control.type.toLowerCase();

    if (inputType == "text" || inputType == "password")
    {
      snapStr += "value=\"" + control.value + "\" ";
	  if (control.readonly && control.readonly)
	    snapStr += "readonly=\"true\" ";
	  else
	    snapStr += "readonly=\"false\" ";
    }
    else if (inputType == "hidden" || inputType == "file")
    {
      snapStr += "value=\"" + control.value + "\" ";
    }
    else if (inputType == "checkbox" || inputType == "radio")
    {
      if (control.checked && control.checked)
        snapStr += "checked=\"true\" ";
      else 
        snapStr += "checked=\"false\" ";
    }
    // nothing else to output for submit, reset, button, image
  }
  else if (controlTag == "SELECT")
  {
      snapStr += "innerhtml=\"" + control.innerHTML + "\" ";
  }
  else if (controlTag == "BUTTON")
  {
      snapStr += "value=\"" + control.value + "\" ";
      snapStr += "type=\"" + control.type + "\" ";
  }
  else if (controlTag == "TEXTAREA")
  {
      snapStr += "innerhtml=\"" + control.innerHTML + "\" ";
  }

  snapStr += "/>\r\n";

  return snapStr;
} // snapshotControl

