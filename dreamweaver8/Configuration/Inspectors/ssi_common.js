//Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.


var helpDoc = MM.HELP_inspSsiCommon;

var gOrignalURL;
var gOrignalRadio;



	
function browseFile()
{
	var filePath = findObject("editField").value;
	fileName = dwscripts.browseFileWithPath(filePath);  //returns a local filename
	if (fileName != "") 
	{
		findObject("editField").value= fileName;
	}
	setComment(0);
} // function browseFile()

function unchanged( type, url )
{
	if ( ( gOrignalRadio == type ) && ( gOrignalURL == url ) )
		return true;
	else
		return false;

} // unchanged()




function editInclude()
{
	var	absoluteURL;
	var docURL;
	var	isDocRelative;
	var relativeURL;
	var siteRootURL;
	var	temp;
	
	relativeURL = findObject("editField").value;

	if ( relativeURL.length <= 0 )
		return;//	Nothing to edit

	docURL = dreamweaver.getDocumentPath("DOCUMENT");
	siteRootURL	= dreamweaver.getSiteRoot();

	isDocRelative = (	
						( relativeURL.length > 3	)	&& 
						( '.' == relativeURL.charAt(0)	)	&&
						( '.' == relativeURL.charAt(1)	)	&& 
						( '/' == relativeURL.charAt(2)	)		
					);

	// Um, let's do some error checking here.

	if	(
			( ""  == siteRootURL			)	&&
			( '/' == relativeURL.charAt(0)	)
		)
	{
		window.alert(MM.MSG_NoSiteForSiteRelURLs);
		return;
	}
	else if	( ( isDocRelative )	&& ( ""  == docURL ) )
	{
		window.alert(MM.MSG_NotSavedForDocRelURLs);
		return;
	}
	
	absoluteURL = dreamweaver.relativeToAbsoluteURL( docURL, siteRootURL, relativeURL);

	if ( absoluteURL != "" )
	{
		dreamweaver.openDocument( absoluteURL );
		return;
	}
	// Should put up an error message here, but what it is I do not know.
} // function editInclude()


//	Returns either file" and "virtual".  Should be passed the unencoded
//	server-side include.  ssiStr should also be lcased before being passed in.
function ssiType( ssiStr ) 
{
	var fileStr;
	var virtualStr;

	fileStr			= ssiStr.indexOf("file");
	virtualStr		= ssiStr.indexOf("virtual");		

	if (	( virtualStr != -1 ) && ( fileStr == -1 )	) 
	{
		return "virtual";
	}
	else if  (	( fileStr != -1 ) && ( virtualStr == -1 )	) 
	{
		return "file";
	} 
	//	if we get here, then the words "file" and "virtural"
	//	both appear in the SSI ( one is in the file name! )
	else if ( virtualStr < fileStr )
	{
		return "virtual";
	}
	else 
	{
		return "file";
	} 
	
} // function ssiType() 

function virtualToFile ( relativeURL )
{
	var absoluteURL;
	var docPathURL;
	var	docBaseURL;
	var docURL;
	var siteRootURL;

	docBaseURL	= docBase();
	if ( docBaseURL[docBaseURL.length-1] != '/' )
		docBaseURL = docBaseURL + '/';

	// [akishnani 03/14/2005] the function relativeToAbsoluteURL is already chopping off the filename
	docPathURL = dreamweaver.getDocumentPath("DOCUMENT"); 
	siteRootURL	= dreamweaver.getSiteRoot();
	absoluteURL = dreamweaver.relativeToAbsoluteURL( docPathURL, siteRootURL, relativeURL ); 

	if (absoluteURL.length == 0)
	{
		window.alert( MM.MSG_CannotConvertURLToIncludeFile );
		return "";
	}

  if ((docBaseURL.length) && (docBaseURL != '/'))
	{
	  //make it file relative
		if ( absoluteURL.indexOf( docBaseURL ) == 0)
		{
			absoluteURL = absoluteURL.substring( docBaseURL.length );
		}
	}

	return absoluteURL;
} // function virtualToFile()


function fileToVirtual(relFileURL)
{
  //convert it to abs
	var siteRelativeURL;
	var absoluteURL;
	var	docBaseURL;
	var docPathURL;
	var docURL;
	var siteRootURL;

	docBaseURL	= docBase();
	if ( docBaseURL[docBaseURL.length-1] != '/' )
		docBaseURL = docBaseURL + '/';

	// [akishnani 03/14/2005] the function relativeToAbsoluteURL is already chopping off the document name
	docPathURL	= dreamweaver.getDocumentPath("DOCUMENT");		
	siteRootURL	= dreamweaver.getSiteRoot();
	absoluteURL = dreamweaver.relativeToAbsoluteURL( docPathURL, siteRootURL, relFileURL ); 

	//convert the absURL to site relative URL
	siteRelativeURL = dw.getDocumentDOM().localPathToSiteRelative(absoluteURL);

	if ( siteRelativeURL.length == 0)
	{
		window.alert( MM.MSG_CannotConvertURLToVirtualFile );
		return "";
	}

	return siteRelativeURL;
}


/*
* the following function fixes the include reference
* from file to virtual for Apache includes if they
* begin with "/" and for PHP includes 
* changes from require_once to virtual
*/
function fixSSIPathForSiteRelativeIncludes(newSSI,newURL)
{
	var fixedSSI=newSSI;
	if ((newURL != null) && (newURL.length > 0))
	{
		var currServerModel = dw.getDocumentDOM().serverModel.getServerName();
		if (newURL.substring(0,1) == "/")
		{
			//for PHP_MySQL replaces "require_once" by "virtual" to serve site relative roots
			if (currServerModel == "PHP")
			{
				fixedSSI = fixedSSI.replace("require_once", "virtual");
			}
			else if (currServerModel == "JSP")
			{
				//don't replace file with virtual since file directive in JSP
				//supports site relative URL's
			}
			else
			{	
			// For Apache include, use 'virtual' for site relative file paths, otherwise 'file'
				fixedSSI = fixedSSI.replace("#include file", "#include virtual");
			}
		}
		else
		{
			if (currServerModel == "PHP")
			{
				fixedSSI = fixedSSI.replace("virtual", "require_once");
			}
			else
			{
				fixedSSI = fixedSSI.replace("#include virtual", "#include file");
			}
		}		
	}
	return fixedSSI;
}

