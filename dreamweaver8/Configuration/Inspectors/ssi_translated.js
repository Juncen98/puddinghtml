//Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

function canInspectSelection(){
  var dom = dw.getDocumentDOM();  
	var theObj = dom.getSelectedNode();
	var translatorClass;
	var lockType;

	if ( theObj.nodeType != Node.ELEMENT_NODE )
	{
		return false; 
	}

	translatorClass = theObj.getAttribute("translatorClass");
	if ( translatorClass != "MM_SSI" )
	{
		return false;
	}

	lockType = theObj.getAttribute("type");
	if ( lockType != "ssi_comment" )
	{
		return false;
	}

	return true;
} // function canInspectSelection()

function inspectSelection() 
{
	var editFieldStr;
	var fileRadObj;
	var fileStr;
	var includeStr;
	var	origAttr;
	var quoteStr;
	var quoteStrLast;
	var ssiStr;
	var virtualRadObj;
	var virtualStr;
  var dom = dw.getDocumentDOM();

	//	Get the selection and the data from the selection
	var theObj = dom.getSelectedNode();

 	if (theObj.nodeType != Node.ELEMENT_NODE) 
	{
		return;
	}
	
	origAttr		= theObj.getAttribute("ORIG");
	ssiStr			= unescape( origAttr );

	quoteStr		= ssiStr.indexOf('"');
	quoteStrLast	= ssiStr.lastIndexOf('"');
	editFieldStr	= ssiStr.substring(quoteStr+1,quoteStrLast);
	gOrignalURL		= editFieldStr;
	findObject("editField").value = editFieldStr;
	fileRadObj		= findObject("radioFile");
	virtualRadObj	= findObject("radioVirtual");	
	gOrignalRadio = ssiType( ssiStr.toLowerCase() );

	if ( gOrignalRadio == "virtual" )
	{
		virtualRadObj.checked	= true;
		fileRadObj.checked		= false;
	}
	else 
	{
		fileRadObj.checked		= true; 
		virtualRadObj.checked	= false;
	} 

} // function inspectSelection() 
	

// whichButton is 0 for no button clicked, 1 for the virtual button,
// 2 for the file button
function setComment(whichButton) 
{
	var	afterSelStr;
	var beforeSelStr;
	var docSrcStr;
	var entireDocObj;
	var newInc;
  var dom = dw.getDocumentDOM();

  var curSelection = dom.getSelection();
	var theObj = dom.getSelectedNode();

	if (theObj.nodeType == Node.ELEMENT_NODE) 
	{
		var radioStr;
		var fileRadObj = findObject("radioFile");
		var virtualRadObj = findObject("radioVirtual");
		if (whichButton == 1) 
		{
			// virtual button was checked
			fileRadObj.checked		= false;
			virtualRadObj.checked	= true;
		} 
		else if (whichButton == 2) 
		{
			// file button was checked
			virtualRadObj.checked	= false;
			fileRadObj.checked		= true;
		}

		var URL = findObject("editField").value;
		if (URL == null)
			return;

		if (fileRadObj.checked) 
		{
			// verify that it's okay as a file-type URL


			radioStr = "file";

			if (whichButton != 0)
			{
				if (URL.charAt(0) == '/' || URL.indexOf("../") != -1)
				{
					var fileURL;
					
					relativeURL = findObject("editField").value;
					fileURL = virtualToFile(relativeURL);	

					if ( fileURL == "" )
					{		
						radioStr = "virtual";
						virtualRadObj.checked = true;
						fileRadObj.checked = false;
						return;
					}
					else
					{
						URL = fileURL;
						findObject("editField").value = fileURL;
					}

				}	
			}
			
			// file button was checked
			virtualRadObj.checked	= false;
			fileRadObj.checked		= true;	
		} 
		else 
		{
			radioStr = "virtual";
			virtualRadObj.checked	= true;
			fileRadObj.checked		= false;
			//there is change
			if ( unchanged( radioStr, URL ) == false)
			{
			  //convert it to the virtual url 
				URL = fileToVirtual(URL);
				//if unable to convert , default back to file
				if ( URL == "" )
				{		
					radioStr = "file";
					virtualRadObj.checked = false;
					fileRadObj.checked = true;
					return;
				}
			}
		}


		if ( unchanged( radioStr, URL ) )
			return;

		newInc		= "<!--#include " + radioStr + "=" + '"' + URL + '"' +" -->";

		//window.alert( newInc );

		var docSrc = dom.documentElement.outerHTML;

		beforeSelStr = docSrc.substring(0, curSelection[0] );
		afterSelStr  = docSrc.substring(curSelection[1]);
		var fixedSSI = fixSSIPathForSiteRelativeIncludes(newInc,URL);
		docSrc		 = beforeSelStr + fixedSSI + afterSelStr;


//		dw.editLockedRegions(curSelection);
		dom.documentElement.outerHTML = docSrc;
		dom.setSelection(curSelection[0], curSelection[0]+1)	
	}
} // function setComment(whichButton) 

