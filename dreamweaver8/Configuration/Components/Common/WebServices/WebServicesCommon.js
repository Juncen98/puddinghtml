// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var WSListTag = "webservices";
var WSTag = "webservice";
var WSNameTag = "wsname";
var WSDLTag = "wsdl";
var ReflectorTag = "reflector";
var UserNameTag = "username";
var PasswordTag = "password";
var SiteRootTag = "siteroot";
var ServerModelTag = "servermodel";
var ProxyGeneratorTag = "proxygenname";
var ProxyLocationsTag = "proxylocations";
var ProxyLocationTag = "proxylocation";

var CDataOpen = "<![CDATA[";
var CDataClose = "]]>"
var WebServiceListFile = "WebServicesList.xml"
var theNewLine = dwscripts.getNewline();

// properties that can be saved in a web service record
var WebServiceNamePropName = "WebServiceName";
var WSDLLocationPropName = "WSDLLocation";
var ReflectorPropName = "Reflector";
var UserNamePropName = "UserName";
var PasswordPropName = "Password";
var SiteRootPropName = "SiteRoot";
var ServerModelPropName = "ServerModel";
var ProxyGeneratorNamePropName = "ProxyGeneratorName";
var ProxyLocationsPropName = "ProxyLocations";
var ProxyLocationPropName = "ProxyLocation";
var ChildNodesPropName = "ChildNodes";

//*-------------------------------------------------------------------
// FUNCTION:
//	addWebServiceChooserRecord(someProperties)
//
// DESCRIPTION:
//	add a new entry information for the web service.  Returns true/false
//	based on if the new entry has been added or not.	This function gets
//	called from the Web Service Chooser dialog
//
// ARGUMENTS:
//	proxyGenName	: Name of the proxy generator
//	proxyLocations	: locations of the proxies
//	wsRec			: web service record
//
// RETURNS:
//	boolean
//--------------------------------------------------------------------

function addWebServiceChooserRecord(someProperties)
{
body:
	{
		// web service name property is used as the key
		var aWebServiceName = someProperties[WebServiceNamePropName];
		if(!aWebServiceName || !aWebServiceName.length)
		{
			break body;
		}
		var aServerModelName = someProperties[ServerModelPropName];
		if(!aServerModelName || !aServerModelName.length)
		{
			break body;
		}

		// build a record
		var aWSRecordBuilder = new WSRecordBuilder();
		var aRecord = aWSRecordBuilder.build(someProperties);
		aWSRecordBuilder = null; // release resource

		// we are going to rewrite the entire file, so start the new file content
		var aFileContents = "<";
		aFileContents += WSListTag;
		aFileContents += ">";
		aFileContents += theNewLine;

		// create path to site-specific web services list file
		var aSiteConfigurationPath = dw.getSiteConfigurationPath();
		if(!aSiteConfigurationPath || !aSiteConfigurationPath.length)
		{
			break body;
		}
		var aWebServiceListPath = aSiteConfigurationPath + WebServiceListFile;

		var didInsertRecord = false;
		if (DWfile.exists(aWebServiceListPath))
		{
			// read and parse existing file
			var listData = DWfile.read(aWebServiceListPath);
			var listDom = dw.getDocumentDOM(dw.getConfigurationPath() + '/Shared/MM/Cache/empty.htm');
			listDom.documentElement.outerHTML = listData;

			// iterate over <webservice> elements
    		var WebServiceNodes = listDom.getElementsByTagName(WSTag);
			if (WebServiceNodes.length)
			{
				var aRecordReader = new WSRecordReader();

			 	// for each <webservice> element
				var i, n = WebServiceNodes.length;
				for(i = 0; i < n; i++)
				{
					// get the web service name
					var aWebServiceObj = aRecordReader.readFromElement(WebServiceNodes[i]);
					var anExistingWebServiceName = aWebServiceObj[WebServiceNamePropName];
					var anExistingServerModelName = aWebServiceObj[ServerModelPropName];
					if(aWebServiceName == anExistingWebServiceName && aServerModelName == anExistingServerModelName)
					{
						// same name, so replace it with our new record
						aFileContents += aRecord;
						didInsertRecord = true;
					}
					else
					{
						// rewrite it
						var anExistingRecord = WebServiceNodes[i].outerHTML;
						aFileContents += anExistingRecord;
					}
				}
			}
		}
		if(!didInsertRecord)
		{
			aFileContents += aRecord;
		}
		aFileContents += "</";
		aFileContents += WSListTag;
		aFileContents += ">";
		var aWriteSucceeded = DWfile.write(aWebServiceListPath, aFileContents);
	}
}

//*-------------------------------------------------------------------
// OBJECT:
//	WSRecordBuilder
//--------------------------------------------------------------------

WSRecordBuilder.prototype.build = WSRecordBuilder_build;
WSRecordBuilder.prototype.addElement = WSRecordBuilder_addElement;
WSRecordBuilder.prototype.getRecord = WSRecordBuilder_getRecord;
WSRecordBuilder.prototype.thePropTags = new Object();
WSRecordBuilder.prototype.thePropTags[WebServiceNamePropName] = WSNameTag;
WSRecordBuilder.prototype.thePropTags[WSDLLocationPropName] = WSDLTag;
WSRecordBuilder.prototype.thePropTags[ReflectorPropName] = ReflectorTag;
WSRecordBuilder.prototype.thePropTags[UserNamePropName] = UserNameTag;
WSRecordBuilder.prototype.thePropTags[PasswordPropName] = PasswordTag;
WSRecordBuilder.prototype.thePropTags[SiteRootPropName] = SiteRootTag;
WSRecordBuilder.prototype.thePropTags[ServerModelPropName] = ServerModelTag;
WSRecordBuilder.prototype.thePropTags[ProxyGeneratorNamePropName] = ProxyGeneratorTag;
WSRecordBuilder.prototype.thePropTags[ProxyLocationsPropName] = ProxyLocationsTag;
WSRecordBuilder.prototype.thePropTags["DataTypes"] = "datatypes";
WSRecordBuilder.prototype.thePropTags["Field"] = "field";
WSRecordBuilder.prototype.thePropTags["Fields"] = "fields";
WSRecordBuilder.prototype.thePropTags["Property"] = "property";
WSRecordBuilder.prototype.thePropTags["Properties"] = "properties";
WSRecordBuilder.prototype.thePropTags["Class"] = "class";
WSRecordBuilder.prototype.thePropTags["Method"] = "method";
WSRecordBuilder.prototype.thePropTags["Arg"] = "arg";
WSRecordBuilder.prototype.thePropTags["name"] = "name";
WSRecordBuilder.prototype.thePropTags["tooltip"] = "tooltip";
WSRecordBuilder.prototype.thePropTags["dropcode"] = "dropcode";
WSRecordBuilder.prototype.thePropTags["isPrimitive"] = "primitive";
WSRecordBuilder.prototype.thePropTags["isArray"] = "array";
WSRecordBuilder.prototype.thePropTags["dataType"] = "datatype";
WSRecordBuilder.prototype.thePropTags["returnType"] = "returntype";

WSRecordBuilder.prototype.theContainedPropTags = new Object();
WSRecordBuilder.prototype.theContainedPropTags[ProxyLocationsPropName] = ProxyLocationTag;

function WSRecordBuilder()
{
	this.theRecord = "";
}

function WSRecordBuilder_build(someProperties)
{
	this.addElement(WSTag, someProperties);
	return this.theRecord;
}

function WSRecordBuilder_addElement(aTag, aValue)
{
	if(aTag && aValue)
	{
		this.theRecord += "<" + aTag + ">";
		if(aValue.constructor == Object || aValue.constructor == Array)
		{
			var i = 0;
			for(var aProp in aValue)
			{
				if(i == 0)
				{
					this.theRecord += theNewLine;
				}
				++i;
				var aTagName = this.thePropTags[aProp];
				this.addElement(aTagName, aValue[aProp]);
				aTagName = null; // release resource
				aProp = null; // release resource
			}
			i = null; // release resource
		}
		if(aValue.constructor == Array)
		{
			for(var i = 0; i < aValue.length; i++)
			{
				if(aValue[i].constructor == Object || aValue[i].constructor == Array)
				{
					var aTagName = this.thePropTags[aValue[i].type];
					this.addElement(aTagName, aValue[i]);
					aTagName = null; // release resource
				}
				else
				{
					// lookup contained type
					var aTagName = this.theContainedPropTags[aValue.type];
					this.addElement(aTagName, aValue[i]);
					aTagName = null; // release resource
				}
			}
			i = null; // release resource
		}
		else if(aValue.constructor != Object)
		{
			this.theRecord += CDataOpen + aValue + CDataClose;
		}
		this.theRecord += "</" + aTag + ">" + theNewLine;
	}
	aTag = null; // release resource
	aValue = null; // release resource
}

function WSRecordBuilder_getRecord()
{
	return this.theRecord;
}

//*-------------------------------------------------------------------
// OBJECT:
//	WSRecordReader
//--------------------------------------------------------------------

WSRecordReader.prototype.getObject = WSRecordReader_getObject();
WSRecordReader.prototype.readFromElement = WSRecordReader_readFromElement;
WSRecordReader.prototype.addElement = WSRecordReader_addElement;
WSRecordReader.prototype.collectPropValue = WSRecordReader_collectPropValue;

// property values
WSRecordReader.prototype.thePropTags = new Object();
WSRecordReader.prototype.thePropTags[WSNameTag] = WebServiceNamePropName;
WSRecordReader.prototype.thePropTags[WSDLTag] = WSDLLocationPropName;
WSRecordReader.prototype.thePropTags[ReflectorTag] = ReflectorPropName;
WSRecordReader.prototype.thePropTags[UserNameTag] = UserNamePropName;
WSRecordReader.prototype.thePropTags[PasswordTag] = PasswordPropName;
WSRecordReader.prototype.thePropTags[SiteRootTag] = SiteRootPropName;
WSRecordReader.prototype.thePropTags[ServerModelTag] = ServerModelPropName;
WSRecordReader.prototype.thePropTags[ProxyGeneratorTag] = ProxyGeneratorNamePropName;
WSRecordReader.prototype.thePropTags["name"] = "name";
WSRecordReader.prototype.thePropTags["tooltip"] = "tooltip";
WSRecordReader.prototype.thePropTags["dropcode"] = "dropcode";
WSRecordReader.prototype.thePropTags["primitive"] = "isPrimitive";
WSRecordReader.prototype.thePropTags["array"] = "isArray";

// leaf objects
WSRecordReader.prototype.theLeafTags = new Object();
WSRecordReader.prototype.theLeafTags[ProxyLocationTag] = ProxyLocationPropName;
WSRecordReader.prototype.theLeafTags["field"] = "Field";
WSRecordReader.prototype.theLeafTags["property"] = "Property";
WSRecordReader.prototype.theLeafTags["arg"] = "Arg";
WSRecordReader.prototype.theLeafTags["returntype"] = "returnType";
WSRecordReader.prototype.theLeafTags["datatype"] = "dataType";

// collection objects
WSRecordReader.prototype.theCollectionTags = new Object();
WSRecordReader.prototype.theCollectionTags["datatypes"] = "DataTypes";
WSRecordReader.prototype.theCollectionTags["class"] = "Class";
WSRecordReader.prototype.theCollectionTags["fields"] = "Fields";
WSRecordReader.prototype.theCollectionTags["properties"] = "Properties";
WSRecordReader.prototype.theCollectionTags["method"] = "Method";

function WSRecordReader()
{
}

function WSRecordReader_getObject()
{
	return this.theObject;
}

function WSRecordReader_readFromElement(aDOMElement)
{
	this.theObject = new Array();
	this.thePropertyValue = "";
	this.addElement(aDOMElement, this.theObject);
	return this.theObject;
}

function WSRecordReader_addElement(aDOMElement, aNode)
{
	if(aDOMElement && aDOMElement.hasChildNodes())
	{
		var aTagName = aDOMElement.tagName;
		if(aTagName && aTagName.length)
		{
			aTagName = aTagName.toLowerCase();
			var aPropertyName = this.thePropTags[aTagName];
			if(aPropertyName && aPropertyName.length)
			{
				this.thePropertyValue = "";
				this.collectPropValue(aDOMElement);
				if(this.thePropertyValue && this.thePropertyValue.length)
				{
					aNode[aPropertyName] = this.thePropertyValue;
				}
			}
			else
			{
				var aNewNode = null;
				aPropertyName = this.theCollectionTags[aTagName];
				if(aPropertyName && aPropertyName.length)
				{
					aNewNode = new Array();

				}
				else
				{
					aPropertyName = this.theLeafTags[aTagName];
					if(aPropertyName && aPropertyName.length)
					{
						aNewNode = new Object();
					}
				}
				if(aNewNode)
				{
					aNewNode.type = aPropertyName;
					aNode.push(aNewNode);
					var n = aDOMElement.childNodes.length;
					for(var i = 0; i < n; i++)
					{
						this.addElement(aDOMElement.childNodes[i], aNewNode);
					}
				}
				else
				{
					var n = aDOMElement.childNodes.length;
					for(var i = 0; i < n; i++)
					{
						this.addElement(aDOMElement.childNodes[i], aNode);
					}
				}
			}
		}
	}
}

function WSRecordReader_collectPropValue(aDOMElement)
{
	if(aDOMElement.nodeType == Node.TEXT_NODE)
	{
		this.thePropertyValue += aDOMElement.data;
	}
	else if(aDOMElement.hasChildNodes())
	{
		var n = aDOMElement.childNodes.length;
		for(var i = 0; i < n; i++)
		{
			this.collectPropValue(aDOMElement.childNodes[i]);
		}
	}
}

//*-------------------------------------------------------------------
// OBJECT:
// proxy reflector object
//--------------------------------------------------------------------

function ProxyReflector(someFileExtensions, aReflectorName)
{
	this.someFileExtensions = someFileExtensions;
	this.aReflectorName = aReflectorName;
	this.anErrMsg = "";
	this.aResult = "";
	this.theReflectedXML = new Array();
}

ProxyReflector.prototype.getErrMsg = ProxyReflector_getErrMsg;
ProxyReflector.prototype.getResult = ProxyReflector_getResult;
ProxyReflector.prototype.reflect = ProxyReflector_reflect;
ProxyReflector.prototype.getReflectedXML = ProxyReflector_getReflectedXML;

function ProxyReflector_getErrMsg()
{
	return this.anErrMsg;
}

function ProxyReflector_getResult()
{
	return this.aResult;
}

function ProxyReflector_reflect(aReflectDir, isFile)
{
	if(isFile != null && isFile == true)
	{
		// individual file
		var reflectdata = eval(this.aReflectorName + ".reflect(aReflectDir)");
		var reflectDom	= dw.getDocumentDOM(dw.getConfigurationPath() + '/Shared/MM/Cache/empty.htm');
		reflectDom.documentElement.outerHTML = reflectdata;
		var ErrorDescriptorNodes = reflectDom.getElementsByTagName("error");
		if (ErrorDescriptorNodes && ErrorDescriptorNodes.length)
		{
			this.anErrMsg += getReflectorErrorMessage(ErrorDescriptorNodes[0].code, ErrorDescriptorNodes[0].value, aProxyFile);
		}
		else
		{
			if(aReflectDir.charAt(aReflectDir.length - 1) != dwscripts.FILE_SEP &&
				aReflectDir.charAt(aReflectDir.length - 1) != "\\" &&
				aReflectDir.charAt(aReflectDir.length - 1) != "/")
			{
				aReflectDir += dwscripts.FILE_SEP;
			}
			aProxyFileAsURL = dwscripts.filePathToLocalURL(aReflectDir);
			var anEntry = new Array();
			anEntry.push(aProxyFileAsURL);
			anEntry.push(reflectdata);
			this.theReflectedXML.push(anEntry);
		}
	}
	else
	{
		// iterate through all the files in the folder
		if(aReflectDir.charAt(aReflectDir.length - 1) != dwscripts.FILE_SEP &&
			aReflectDir.charAt(aReflectDir.length - 1) != "\\" &&
			aReflectDir.charAt(aReflectDir.length - 1) != "/")
		{
			aReflectDir += dwscripts.FILE_SEP;
		}
		var aFileList = DWfile.listFolder(aReflectDir, "files");
		if(aFileList && aFileList.length)
		{
			var n = aFileList.length;
			for(var i = 0; i < n; i++)
			{
				var aFileExtension = dwscripts.getFileExtension(aFileList[i])
				if(!aFileExtension || !aFileExtension.length)
				{
					continue;
				}
				aFileExtension = dwscripts.FILE_EXT_SEP + aFileExtension;
				// for each file in the folder, look for matching extensions
				var anExtensionCount = this.someFileExtensions.length;
				for(var j = 0; j < anExtensionCount; j++)
				{
					var aTargetFileExtension = this.someFileExtensions[j];
					if (!aTargetFileExtension ||
						!aTargetFileExtension.length ||
						aTargetFileExtension != aFileExtension)
					{
						continue;
					}
					var aProxyFileAsURL = aReflectDir + aFileList[i];
					var aProxyFile = dwscripts.localURLToFilePath(aProxyFileAsURL);
					var reflectdata = eval(this.aReflectorName + ".reflect(aProxyFile)");
					var reflectDom	= dw.getDocumentDOM(dw.getConfigurationPath() + '/Shared/MM/Cache/empty.htm');
					reflectDom.documentElement.outerHTML = reflectdata;
					var ErrorDescriptorNodes = reflectDom.getElementsByTagName("error");
					if (ErrorDescriptorNodes && ErrorDescriptorNodes.length)
					{
						this.anErrMsg += getReflectorErrorMessage(ErrorDescriptorNodes[0].code,ErrorDescriptorNodes[0].value, aProxyFile);
					}
					else
					{
						aProxyFileAsURL = dwscripts.filePathToLocalURL(aProxyFileAsURL); // normalize
						var anEntry = new Array();
						anEntry.push(aProxyFileAsURL);
						anEntry.push(reflectdata);
						this.theReflectedXML.push(anEntry);
					}
					break;
				}
			}
		}
		var aFolderList = DWfile.listFolder(aReflectDir, "directories");
		if(aFolderList && aFolderList.length)
		{
			var n = aFolderList.length;
			for(var i = 0; i < n; i++)
			{
				this.reflect(aReflectDir + aFolderList[i]);
			}
		}
	}
}


function ProxyReflector_getReflectedXML()
{
	return this.theReflectedXML;
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 addProxyChooserEntry(introspectorName,proxyLocations,isFile)
//
// DESCRIPTION:
//	 add a new entry information for the web service.	Returns true/false
//	based on if the new entry has been added or not.	This function gets
//	called from the Proxy Class Chooser dialog
//
// ARGUMENTS:
//	introspectorName	: Name of the introspector
//	proxyLocation 		: location of the proxy
//	
// RETURNS:
//	boolean
//--------------------------------------------------------------------
function addProxyChooserEntry(anIntrospector, aProxyFolder, isFile)
{
	if(!anIntrospector || !aProxyFolder || !anIntrospector.extensions)
	{
		return;
	}
	var someExtensions = anIntrospector.extensions;
	if (someExtensions && someExtensions.length)
	{
		// remove trailing separator
		if(aProxyFolder.charAt(aProxyFolder.length - 1) == '/' ||
			aProxyFolder.charAt(aProxyFolder.length - 1) == '\\')
		{
			aProxyFolder = aProxyFolder.slice(0, aProxyFolder.length - 1);
		}

		// execute reflector
		var aProxyReflector = new ProxyReflector(someExtensions, anIntrospector.classname);
		aProxyReflector.reflect(aProxyFolder, isFile);
		errMsg = aProxyReflector.getErrMsg();
		if(errMsg && errMsg.length)
		{
			alert(errMsg);
			return;
		}

		// do we have any valid proxies that got introspected?
		var someReflectedXML = aProxyReflector.getReflectedXML();
		if(someReflectedXML && someReflectedXML.length)
		{
			// create a name
			var aProxyName = "";
			for(var i = 0; i < someReflectedXML.length; i++)
			{
				if(i > 0)
				{
					// strip non-common tail
					var anotherProxyLocation = dwscripts.localURLToFilePath(someReflectedXML[i][0]);
					var aProxyNameLength = aProxyName.length;
					if(anotherProxyLocation.length < aProxyNameLength)
					{
						aProxyNameLength = anotherProxyLocation.length;
					}
					for(var j = 0; j < aProxyNameLength; j++)
					{
						if(aProxyName.charAt(j) != anotherProxyLocation.charAt(j))
						{
							break;
						}
					}
					aProxyName = aProxyName.slice(0, j);
				}
				else
				{
					aProxyName = dwscripts.localURLToFilePath(someReflectedXML[i][0]);
				}
			}
			if(!aProxyName || !aProxyName.length)
			{
				aProxyName = aProxyFolder;
			}

			// add entry to web services persistence
			var aLevel0Node = new Array();
			aLevel0Node[WebServiceNamePropName] = aProxyName;
			aLevel0Node[ReflectorPropName] = anIntrospector.classname;
			aLevel0Node[SiteRootPropName] = dw.getSiteRoot();
			aLevel0Node[ServerModelPropName] = dw.getDocumentDOM().serverModel.getDisplayName();

			// get the matching proxy generator code
			var aProxyGeneratorList = MMWS.getProxyGeneratorList();
			if(aProxyGeneratorList && aProxyGeneratorList.length)
			{
				for(var i = 0; i < aProxyGeneratorList.length; i++)
				{
					var aProxyGenerator = MMWS.getProxyGenerator(aProxyGeneratorList[i]);
					if(aProxyGenerator)
					{
						if(aProxyGenerator.introspectorfilename &&
							aProxyGenerator.introspectorfilename != anIntrospector.classname)
						{
							continue;
						}
						var someServerModels = aProxyGenerator.servermodels;
						var someSplitServerModels = someServerModels.split(",");
						if(someSplitServerModels && someSplitServerModels.length)
						{
							for(var j = 0; j < someSplitServerModels.length; j++)
							{
								var aServerModel = someSplitServerModels[j];
								if(aServerModel == aLevel0Node[ServerModelPropName])
								{
									var filename = aProxyGenerator.filename;
									var path = getWebServicesDirectory();
									if (path && filename)
									{
										filename = path + filename; 			
										//call the proxydocument.parentWindow.function.
										var dom, errMsg;
										if (filename)
										{
											dom = dw.getDocumentDOM(filename);
											// call the initializeUI and loadProxy just to see if it fixes the problem
											if (dom)
											{
												// first load the proxy into local values...
												if(dom.parentWindow.initializeUI != null)
												{
													dom.parentWindow.initializeUI();
												}
												if(dom.parentWindow.loadProxy != null)
												{
													dom.parentWindow.loadProxy(aProxyGenerator);
												}
												if (dom.parentWindow.buildWebServiceChooserRecord != null)
												{
													errMsg = dom.parentWindow.buildWebServiceChooserRecord(aLevel0Node, aProxyReflector);
													if(errMsg && errMsg.length)
													{
														alert(errMsg);
														return;
													}
													errMsg = addWebServiceChooserRecord(aLevel0Node);
													if(errMsg && errMsg.length)
													{
														alert(errMsg);
													}
													// update UI
													dw.serverComponentsPalette.refresh();
													return;
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
		else
		{
			alert(MM.MSG_ProxyNotFound);
		}
	}
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 deleteWebServiceEntry(name)
//
// DESCRIPTION:
//	 delete an entry for the web services.
//
// ARGUMENTS:
//	proxylocation : location of the proxy that is to be deleted
//	
// RETURNS:
//	boolean
//--------------------------------------------------------------------
function deleteWebServiceEntry(name)
{
	// create path to site-specific web services list file
	var aSiteConfigurationPath = dw.getSiteConfigurationPath();
	if(!aSiteConfigurationPath || !aSiteConfigurationPath.length)
	{
		return;
	}
	var aWebServiceListPath = aSiteConfigurationPath + WebServiceListFile;
	var fileContents = "<" + WSListTag + ">" + theNewLine;
	if (DWfile.exists(aWebServiceListPath))
	{
		var listData = DWfile.read(aWebServiceListPath);
		var listDom = dw.getDocumentDOM(dw.getConfigurationPath() + '/Shared/MM/Cache/empty.htm');
		listDom.documentElement.outerHTML = listData;

		// iterate over <webservice> elements
   		var WebServiceNodes = listDom.getElementsByTagName(WSTag);
		if (WebServiceNodes.length)
		{
			var i, n = WebServiceNodes.length;
			var aRecordReader = new WSRecordReader();
			var didDelete = false;
			for (i = 0; i < n; i++)
			{
				if(!didDelete)
				{
					// get the web service name
					var aWebServiceObj = aRecordReader.readFromElement(WebServiceNodes[i]);
					var anExistingWebServiceName = aWebServiceObj[WebServiceNamePropName];
					if (anExistingWebServiceName == name)
					{
						// name matches, so delete
						didDelete = true;
						continue;
					}
				}
				fileContents += WebServiceNodes[i].outerHTML;
				fileContents += theNewLine;
			}
		}
	}
	fileContents = fileContents + "</" + WSListTag + ">";
	return DWfile.write(aWebServiceListPath, fileContents);
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 getReflectorErrorMessage(errCode, errMessage, proxyfile)
//
// DESCRIPTION:
//	 maps an error node to error message.
//
// ARGUMENTS:
//	errCode 		: 	Error code returned from Reflection
//	errMessage	: 	Error message returned form Reflection
//	proxyfile 	: 	Name of the proxy file
//	
// RETURNS:
//--------------------------------------------------------------------
function getReflectorErrorMessage(errCode, errMessage, proxyfile)
{
	var retErrMessage="";
	if(!proxyfile)
		proxyfile = "";
	if (errCode)
	{
		if (errCode == "OUTOFMEMORY")
		{
			retErrMessage = MM.MSG_OUTOFMEMORY;	
		}
		else if (errCode == "INVALIDSIGNATURE")
		{
			retErrMessage = errMsg(MM.MSG_INVALIDSIGNATURE,proxyfile);
		}
		else if (errCode == "INVALIDFILENAME")
		{
			retErrMessage = errMsg(MM.MSG_INVALIDFILENAME,proxyfile);
		}
		else if (errCode == "READFAILURE")
		{
			retErrMessage = errMsg(MM.MSG_READFAILURE,proxyfile);
		}
		else if (errCode == "COMERROR")
		{
			if (errMessage && errMessage.length)
				retErrMessage = errMsg(MM.MSG_COMERROR, errMessage)
		}
		else if (errCode == "UNKNOWNERROR")
		{
			if (errMessage && errMessage.length)
				retErrMessage = errMessage;
			else
				retErrMessage = errMsg(MM.MSG_UNKNOWNERROR,proxyfile);
		}
	}

	return retErrMessage;
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 getOtherErrorMessage(errCode,errMessage, proxyfile)
//
// DESCRIPTION:
//	maps an error node to error message, but these errors are not
//	from Reflection
//
// ARGUMENTS:
//	errCode 		: 	Error code
//	errMessage	: 	Error message
//	proxyfile 	: 	Name of the proxy file
//
// RETURNS:
//--------------------------------------------------------------------
function getOtherErrorMessage(errCode,errMessage, proxygen)
{
	var retErrMessage="";
	if(!proxygen)
		proxygen = "";
	if (errCode)
	{
		if (errCode == "MISSINGPROXYGENERATOR")
	  {
			if (errMessage && errMessage.length)
			  retErrMessage = errMsg(MM.MSG_MISSINGPROXYGENERATOR, proxygen)
	  } 
	}
	
	return retErrMessage;
} 	
