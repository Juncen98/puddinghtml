// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.

var DEBUG = false

//*************** GLOBALS VARS *****************

var helpDoc = MM.HELP_wsCF6ProxyGen;
var theCFQueryClass = "coldfusion.xml.rpc.QueryBean";
var theDataTypesNodeName = "structs";

//*******************  PROXY GENERATION API **********************
//*-------------------------------------------------------------------
// FUNCTION:
//	 canGenerateProxy
//
// DESCRIPTION:
//	 Returns true if the proxy generator type can be applied
//	 to the current server model. Otherwise, returns false.
//
// ARGUMENTS:
//
//	 serverModelName: the name of the server model.
//	 proxyGenRec : the proxy record containg the instance specific info.	
//	
// RETURNS:
//	 boolean
//--------------------------------------------------------------------

function canGenerateProxy(serverModelName, proxyGenRec)
{
	var retValue = false;

	if(dwscripts.IS_WIN && serverModelName && serverModelName == "ColdFusion")
	{
		retValue = true;
	}
	return retValue;
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 displayInstructions
//
// DESCRIPTION:
//	 returns a instructions string to assist the user to make decisions.
//
// ARGUMENTS:
//	 none
//	
// RETURNS:
//	 string
//--------------------------------------------------------------------

function displayInstructions()
{
	var dispMsg = "";

	if(dwscripts.IS_WIN)
	{
		dispMsg =  MM.MSG_WinProxyGeneratorInstructions;
	}

	return dispMsg;
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 applyProxy
//
// DESCRIPTION:
//		This function does the actual proxy creation stuff.
//		It takes the current proxy instance and the web service record,
//		creates the proxy and deploys it.
//
// ARGUMENTS:
//	 
//	  proxyGenRec: the proxy record containg the instance specific info.	
//		wsRec:		the web service record containing the token list
//
// RETURNS:
//	 nothing
//--------------------------------------------------------------------

function applyProxy(proxyGenRec, wsRec)
{
	if(!dwscripts.IS_WIN)
	{
		return "";
	}
	MM.setBusyCursor();

	var errMsg				= "";
	var wsdlName			= wsRec.$$WSDLFILE;
	var siteRoot			= wsRec.$$SITEROOT;
	var userName			= wsRec.$$USERNAME;
	var userPassword		= wsRec.$$USERPASSWORD;
	var aTempDir			= "";
	var aWebServiceName		= "";

	body:	
	{
		// check to be sure we have wsdl to operate on
		if(!wsdlName || !wsdlName.length)
		{
			errMsg = MM.MSG_WSDLFileNameMissing;
			break body;
		}

		// read the WSDL
		var someWSDL = "";
		if (wsdlName.substr(0, 5).toLowerCase() == "http:" ||
			wsdlName.substr(0, 6).toLowerCase() == "https:")
		{
			var httpReply = MMHttp.getText(dw.doURLEncoding(wsdlName));
			if (httpReply.statusCode != 200)
			{
				errMsg = MM.MSG_WSDLFileReadError;
				break body;
			}
			someWSDL = httpReply.data;
		}
		// TODO: handle other protocols
		else
		{
			someWSDL = DWfile.read(dwscripts.filePathToLocalURL(aWSDLFile));
			if(!someWSDL || !someWSDL.length)
			{
				// cannot read the WSDL file
				errMsg = MM.MSG_WSDLFileReadError;
				break body;
			}
		}
		if(!someWSDL || !someWSDL.length)
		{
			errMsg = MM.MSG_WSDLFileReadError;
			break body;
		}

		// parse the WSDL and get the service name
		var aCallback = new WSDLCallback();
		if(dreamweaver.scanSourceString(someWSDL, aCallback))
		{
			var anArray = aCallback.translate("service");
			if(anArray && anArray.length)
			{
				var i, n = anArray.length;
				outerloop:
				for(i = 0; i < n; i++)
				{
					var aTempObj = anArray[i];
					for(var aPropName in aTempObj)
					{
						if(aPropName == "name")
						{
							// got service name
							aWebServiceName = aTempObj[aPropName];
							break outerloop;
						}
					}
				}
			}
			if(!aWebServiceName || !aWebServiceName.length)
			{
				anArray = aCallback.translate("definitions");
				if(anArray && anArray.length)
				{
					var i, n = anArray.length;
					outerloop:
					for(i = 0; i < n; i++)
					{
						var aTempObj = anArray[i];
						for(var aPropName in aTempObj)
						{
							if(aPropName == "name")
							{
								// got service name
								aWebServiceName = aTempObj[aPropName];
								break outerloop;
							}
						}
					}
				}
			}
		}

		if(!aWebServiceName || !aWebServiceName.length)
		{
			aWebServiceName = wsdlName;
		}

		// get the config/temp folder path
		aSystemTempDir = DWfile.getSystemTempFolder();
		if(aSystemTempDir == null || !aSystemTempDir.length)
		{
			errMsg = MM.MSG_LocalWSDLFileCreateError;
			break body;
		}

		var javac = dwscripts.localURLToFilePath(dw.getRootDirectory() + "Jvm/bin/javac.exe");

		// create a uniquely-named temp directory
		if(aSystemTempDir.charAt(aSystemTempDir.length - 1) != dwscripts.FILE_SEP &&
			aSystemTempDir.charAt(aSystemTempDir.length - 1) != '\\' &&
			aSystemTempDir.charAt(aSystemTempDir.length - 1) != '/')
		{
			aSystemTempDir += dwscripts.FILE_SEP;
		}
		var aSequenceNumber = 1;
		for(;; aSequenceNumber++)
		{
			aTempDir = aSystemTempDir + "~DW" + aSequenceNumber;
			if(DWfile.exists(aTempDir))
			{
				continue;
			}
			if(!DWfile.createFolder(aTempDir))
			{
				errMsg = MM.MSG_LocalWSDLFileCreateError;
				break body;
			}
			break;
		}

		// create classpath
		var aConfigDir = dw.getConfigurationPath();
		var aClassDir = aConfigDir + dwscripts.FILE_SEP + "Classes";
		if(!DWfile.exists(aClassDir))
		{
			errMsg = MM.MSG_LocalWSDLFileCreateError;
			break body;
		}
		aClassDir = dwscripts.localURLToFilePath(aClassDir);
		var aJarList = DWfile.listFolder(aClassDir + dwscripts.FILE_SEP + "*.jar", "files");
		if(!aJarList || !aJarList.length)
		{
			errMsg = MM.MSG_MissingAxisXercesJars;
			break body;
		}
		var aCommand = " -g -classpath " + addQuotes(dwscripts.localURLToFilePath(aTempDir)) + ";" + addQuotes(aClassDir);
		aClassDir += dwscripts.FILE_SEP;
		var i;
		for(i = 0; i < aJarList.length; i++)
		{
			aCommand += ";";
			aCommand += addQuotes(aClassDir + aJarList[i]);
		}

		var someFileInfo = MMWS.doWSDL2Java(wsdlName, dwscripts.localURLToFilePath(aTempDir));
		if(someFileInfo	&& someFileInfo.constructor == String)
		{
			errMsg = MM.MSG_UnableToGenerateProxy + dwscripts.getNewline() + someFileInfo;
			break body;
		}
		if(someFileInfo && someFileInfo.length)
		{
			// create entry for web services persistence
			var aLevel0Node = new Array();
			aLevel0Node[WebServiceNamePropName] = aWebServiceName;
			aLevel0Node[WSDLLocationPropName] = wsdlName;
			aLevel0Node[ReflectorPropName] = "ReflectJava";
			aLevel0Node[UserNamePropName] = userName;
			aLevel0Node[PasswordPropName] = userPassword;
			aLevel0Node[SiteRootPropName] = dw.getSiteRoot();
			aLevel0Node[ServerModelPropName] = dw.getDocumentDOM().serverModel.getDisplayName();
			aLevel0Node[ProxyGeneratorNamePropName] = "ColdFusion MX";

			// collect method info from i/f and stub in local vars
			var someInterfaceMethods = new Array();
			var someStubMethods = new Array();

			for(i = 0; i < someFileInfo.length; i++)
			{
				var aFileInfo = someFileInfo[i];
				if(aFileInfo && aFileInfo.length == 3)
				{
					var aFileName = aFileInfo[0];
					var aClassName = aFileInfo[1];
					var aType = aFileInfo[2];
					if(aType == "interface" || aType == "stub" || aType == "complexType")
					{
						// compile the java
						if(!MM.createProcess(javac,				// application
								aCommand + " " + addQuotes(aFileName),		// command
								"-1",							// timeout
								true,							// bCreateNoWindow
								dwscripts.localURLToFilePath(aTempDir)))	// run directory
						{
							errMsg = MM.MSG_UnableToRunJavac;
							break body;
						}
						// introspect the class
						aFileName = dwscripts.replaceString(aFileName, ".java", ".class")
						var someReflectXML = ReflectJava.reflect(aFileName);

						// TEMP CODE REMOVE TODO!!!!
//						DWfile.write(aTempDir + "/" + i + ".xml", someReflectXML);

						var reflectDom	= dw.getDocumentDOM(aConfigDir + '/Shared/MM/Cache/empty.htm');
						reflectDom.documentElement.outerHTML = someReflectXML;
						var ErrorDescriptorNodes = reflectDom.getElementsByTagName("error");
						if (ErrorDescriptorNodes && ErrorDescriptorNodes.length)
						{
							errMsg = getReflectorErrorMessage(ErrorDescriptorNodes[0].code, ErrorDescriptorNodes[0].value, aFileName);
							break body;
						}

						// get the class name
						var aClassName = null;
						var someClassNodes = reflectDom.getElementsByTagName("classdescriptor");
						if(someClassNodes && someClassNodes.length)
						{
							aClassName = someClassNodes[0].name;
						}

						if(aType == "complexType")
						{
							// don't bother with coldfusion.xml.rpc.QueryBean
							if(aClassName == theCFQueryClass)
							{
								continue;
							}

							// get the fields
				    		var someFieldNodes = reflectDom.getElementsByTagName("fielddescriptor");
							if(someFieldNodes && someFieldNodes.length)
							{
								var aLevel1Node = null;
								if(aLevel0Node.length)
								{
									// see if we can find a "DataTypes" node
									for(var j = 0; j < aLevel0Node.length; j++)
									{
										if(aLevel0Node[j].type == "DataTypes")
										{
											aLevel1Node = aLevel0Node[j];
											break;
										}
									}
								}
								if(aLevel1Node == null)
								{
									aLevel1Node = new Array();
									aLevel1Node.type = "DataTypes";
									aLevel1Node.name = theDataTypesNodeName;
									aLevel0Node.push(aLevel1Node);
								}

								// create an object for this data type
								var aLevel2Node = new Array();
								aLevel2Node.type = "Class";
								aLevel2Node.name = aClassName;
								aLevel2Node.tooltip = "struct " + aClassName;
								var aSplitClassName = aClassName.split(".");
								aLevel2Node.dropcode = "<cfset a" + aSplitClassName[aSplitClassName.length - 1] + "=StructNew()>" + dwscripts.getNewline();
								aLevel1Node.push(aLevel2Node);

								// iterate over the fields in the class
								for(var j = 0; j < someFieldNodes.length; j++)
								{
									var aFieldNode = someFieldNodes[j];
									var aLevel3Node = new Object();
									aLevel3Node.type = "Field";
									var aTypeString = null;
						    		var someTypeNodes = aFieldNode.getElementsByTagName("typesignaturedescriptor");
									if(someTypeNodes && someTypeNodes.length)
									{
										var aDataType = buildType(someTypeNodes[0]);
										if(aType)
										{
											aTypeString = buildDataTypeString(aDataType, aFieldNode.name);
										}
									}
									if(aTypeString && aTypeString.length)
									{
										aLevel3Node.name = aTypeString;
									}
									else
									{
										aLevel3Node.name = aFieldNode.name;
									}
									aLevel3Node.tooltip = aClassName + "." + aFieldNode.name;
									aLevel3Node.dropcode = "a" + aSplitClassName[aSplitClassName.length - 1] + "." + aFieldNode.name + dwscripts.getNewline();
									// could add type and public info here
									aLevel2Node.push(aLevel3Node);
								}
							}
						}
						else if(aType == "interface")
						{
							// get the methods
				    		var someMethodNodes = reflectDom.getElementsByTagName("methoddescriptor");
							if(someMethodNodes && someMethodNodes.length)
							{
								// iterate over the Methods in the class
								for(var j = 0; j < someMethodNodes.length; j++)
								{
									var aMethodNode = someMethodNodes[j];
									var aMethodObj = new Array();
									someInterfaceMethods.push(aMethodObj);
									aMethodObj.name = aMethodNode.name;
									var aReturnType = aMethodNode.getElementsByTagName("returntype");
									if(aReturnType && aReturnType.length)
									{
										var aReturnTypeSig = aReturnType[0].getElementsByTagName("typesignaturedescriptor");
										if(aReturnTypeSig && aReturnTypeSig.length)
										{
											var aReturnType = buildType(aReturnTypeSig[0]);
											aMethodObj.returnType = aReturnType;
										}
									}
									var someMethodArgs = aMethodNode.getElementsByTagName("argumentdescriptor");
									if(someMethodArgs && someMethodArgs.length)
									{
										for(var k = 0; k < someMethodArgs.length; k++)
										{
											var aMethodArg = someMethodArgs[k];
											if(!aMethodArg)
											{
												continue;
											}
											var someTypeSignatures = aMethodArg.getElementsByTagName("typesignaturedescriptor");
											if(someTypeSignatures && someTypeSignatures.length)
											{
												var aTypeSignature = someTypeSignatures[0];
												if(aTypeSignature)
												{
													anArg = new Object();
													anArg.name = aMethodArg.name;
													var aType = buildType(aTypeSignature);
													anArg.dataType = aType;
													aMethodObj.push(anArg);
												}
											}
										}
									}
								}
							}
						}
						else if(aType == "stub")
						{
							// get the methods
				    		var someMethodNodes = reflectDom.getElementsByTagName("methoddescriptor");
							if(someMethodNodes && someMethodNodes.length)
							{
								// iterate over the Methods in the class
								for(var j = 0; j < someMethodNodes.length; j++)
								{
									var aMethodNode = someMethodNodes[j];
									var aMethodObj = new Array();
									someStubMethods.push(aMethodObj);
									aMethodObj.name = aMethodNode.name;
									var aReturnType = aMethodNode.getElementsByTagName("returntype");
									if(aReturnType && aReturnType.length)
									{
										var aReturnTypeSig = aReturnType[0].getElementsByTagName("typesignaturedescriptor");
										if(aReturnTypeSig && aReturnTypeSig.length)
										{
											var aReturnType = buildType(aReturnTypeSig[0]);
											aMethodObj.returnType = aReturnType;
										}
									}
									var someMethodArgs = aMethodNode.getElementsByTagName("argumentdescriptor");
									if(someMethodArgs && someMethodArgs.length)
									{
										for(var k = 0; k < someMethodArgs.length; k++)
										{
											var aMethodArg = someMethodArgs[k];
											if(!aMethodArg)
											{
												continue;
											}
											var someTypeSignatures = aMethodArg.getElementsByTagName("typesignaturedescriptor");
											if(someTypeSignatures && someTypeSignatures.length)
											{
												var aTypeSignature = someTypeSignatures[0];
												if(aTypeSignature)
												{
													anArg = new Object();
													anArg.name = aMethodArg.name;
													var aType = buildType(aTypeSignature);
													anArg.dataType = aType;
													aMethodObj.push(anArg);
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

			// match interface methods to stub methods and get arg names
			for(i = 0; i < someInterfaceMethods.length; i++)
			{
				var anInterfaceMethod = someInterfaceMethods[i];

				// see if we can find a matching method in stub
				for(var j = 0; j < someStubMethods.length; j++)
				{
					var aStubMethod = someStubMethods[j];

					// do the names match?
					if(anInterfaceMethod.name != aStubMethod.name)
					{
						// no
						continue;
					}

					// same number of arguments?
					if(anInterfaceMethod.length != aStubMethod.length)
					{
						// no
						continue;
					}

					// does return type match?
					if(!compareTypes(anInterfaceMethod.returnType, aStubMethod.returnType))
					{
						// no
						continue;
					}

					// do argument types match?
					for(var k = 0; k < anInterfaceMethod.length; k++)
					{
						var anInterfaceArg = anInterfaceMethod[k];
						var aStubArg = aStubMethod[k];
						if(!compareTypes(anInterfaceArg.dataType, aStubArg.dataType))
						{
							break;
						}
					}
					if(k < anInterfaceMethod.length)
					{
						// no
						continue;
					}

					// we have a match
					someInterfaceMethods[i] = someStubMethods[j];
					break;
				}
			}

			// save the 1st method's dropcode for level 0 node dropcode
			var aFirstLevel1Node = null;
			var aLevel0NodeDropcode = "";

			// create objects for methods and args
			for(i = 0; i < someInterfaceMethods.length; i++)
			{
				var anInterfaceMethod = someInterfaceMethods[i];
				var aReturnType = anInterfaceMethod.returnType;

				var aLevel1Node = new Array();
				aLevel0Node.push(aLevel1Node);
				if(i == 0)
				{
					aFirstLevel1Node = aLevel1Node;
				}
				var aReturnVarName = null;
				var aReturnTypeString = null;
				if(aReturnType && aReturnType.name && aReturnType.name != "VOID")
				{
					if(aReturnType.isPrimitive == "true")
					{
						aReturnTypeString = getPrimitiveTypeString(aReturnType.name);
						if(anInterfaceMethod.name.indexOf("get") == 0)
						{
							aReturnVarName = "a" + anInterfaceMethod.name.slice(3);
						}
						else
						{
							aReturnVarName = anInterfaceMethod.name + "Ret";
						}
					}
					else
					{
						// special case for ColdFusion object query
						if(aReturnType.name == theCFQueryClass)
						{
							aReturnTypeString = "query";
							aReturnVarName = "aQuery";
						}
						else
						{
							var aSplitReturnType = aReturnType.name.split(".");
							aReturnTypeString = aSplitReturnType[aSplitReturnType.length - 1];
							aReturnVarName = "a" + aReturnTypeString;
						}
					}
					if(aReturnType.isArray == "true")
					{
						if(aReturnVarName && aReturnVarName.length)
						{
							aReturnVarName += "Array";
						}
						if(aReturnTypeString && aReturnTypeString.length)
						{
							var anArrayRank = 1;
							if(aReturnType.theRank)
							{
								anArrayRank = aReturnType.theRank;
							}
							for(var j = 0; j < anArrayRank; j++)
							{
								aReturnTypeString += "[]";
							}
						}
					}
				}
				aLevel1Node.type = "Method";
				if(aReturnTypeString && aReturnTypeString.length)
				{
					aLevel1Node.name = aReturnTypeString + " " + anInterfaceMethod.name;
				}
				else
				{
					aLevel1Node.name = anInterfaceMethod.name;
				}
				aLevel1Node.tooltip = aLevel1Node.name;
				aLevel1Node.dropcode = "<cfinvoke " + dwscripts.getNewline();
				aLevel1Node.dropcode += " webservice=\"" + wsdlName + "\"" + dwscripts.getNewline();
				aLevel1Node.dropcode += " method=\"" + anInterfaceMethod.name + "\"";
				if(aReturnVarName)
				{
					aLevel1Node.dropcode +=  dwscripts.getNewline() + " returnvariable=\"" + aReturnVarName + "\"";
				}
				aLevel1Node.dropcode += ">" + dwscripts.getNewline();
				if(i == 0)
				{
					aLevel0NodeDropcode = aLevel1Node.dropcode;
				}
				for(var j = 0; j < anInterfaceMethod.length; j++)
				{
					var anArg = anInterfaceMethod[j];
					var aLevel2Node = new Object();
					var anArgDataType = anArg.dataType;
					var anArgDataTypeString = buildDataTypeString(anArgDataType);
					var anArgName = "";
					if(anArg.name)
					{
						anArgName = anArg.name;
					}
					else
					{
						anArgName += j;
					}
					if(anArgDataTypeString && anArgDataTypeString.length)
					{
						aLevel2Node.name = anArgDataTypeString + " " + anArgName;
					}
					else
					{
						aLevel2Node.name = anArgName;
					}
					aLevel2Node.tooltip = aLevel2Node.name;
					aLevel2Node.dropcode = "\t<cfinvokeargument name=\"" + anArgName + "\" value=\"" + MM.MSG_CFC_PleasePutAValueHere + "\"/>" + dwscripts.getNewline();
					aLevel1Node.dropcode += aLevel2Node.dropcode;

					// could add type info here
					aLevel2Node.type = "Arg";
					aLevel1Node.push(aLevel2Node);
				}
				aLevel1Node.dropcode += "</cfinvoke>" + dwscripts.getNewline();
			}

			// if there's only one method, create an entire template for the root node
			if(someInterfaceMethods.length == 1 &&
				aFirstLevel1Node &&
				aLevel0NodeDropcode.length)
			{
				for(var j = 0; j < aFirstLevel1Node.length; j++)
				{
					aLevel0NodeDropcode += aFirstLevel1Node[j].dropcode;
				}
				aLevel0NodeDropcode += "</cfinvoke>" + dwscripts.getNewline();
				aLevel0Node.dropcode = aLevel0NodeDropcode;
			}

			// now persist the stuff
			var aWSRecordBuilder = new WSRecordBuilder(); // build a record
			var aRecord = aWSRecordBuilder.build(aLevel0Node);
			var aFileContents = "<"; // we are going to rewrite the entire file, so start the new file content
			aFileContents += WSListTag;
			aFileContents += ">";
			aFileContents += theNewLine;

			// web service name property is used as the key
			var aWebServiceName = aLevel0Node[WebServiceNamePropName];

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
						if(aWebServiceName == anExistingWebServiceName)
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

			// update UI
			dw.serverComponentsPalette.refresh();
		}
		else
		{
			errMsg = MM.MSG_WSDLFileReadError;
			break body;
		}
	}

	// cleanup
	if(aTempDir && aTempDir.length && DWfile.exists(aTempDir))
	{
		DWfile.remove(aTempDir);
	}

	MM.clearBusyCursor();
	return errMsg;
}

function buildDataTypeString(aDataType, aVarName)
{
	aDataTypeString = null;
	if(aDataType)
	{
		if(aDataType.isPrimitive == "true")
		{
			aDataTypeString = getPrimitiveTypeString(aDataType.name);
		}
		else
		{
			// special case for ColdFusion object query
			if(aDataType.name == theCFQueryClass)
			{
				aDataTypeString = "query";
			}
			else
			{
				var aSplitType = aDataType.name.split(".");
				aDataTypeString = aSplitType[aSplitType.length - 1];
			}
		}
		if(aVarName && aVarName.length)
		{
			aDataTypeString += " " + aVarName;
		}
		if(aDataType.isArray == "true")
		{
			if(aDataTypeString && aDataTypeString.length)
			{
				var anArrayRank = 1;
				if(aDataType.theRank)
				{
					anArrayRank = aDataType.theRank;
				}
				for(var i = 0; i < anArrayRank; i++)
				{
					aDataTypeString += "[]";
				}
			}
		}
	}
	return aDataTypeString;
}

function compareTypes(aType, anotherType)
{
	if((aType && !anotherType) || (!aType && anotherType))
	{
		// no
		return false;
	}
	if(aType)
	{
		if(aType.name != anotherType.name)
		{
			// no
			return false;
		}
		if((aType.isArray && !anotherType.isArray) ||
			(!aType.isArray && anotherType.isArray))
		{
			// no
			return false;
		}
		if(aType.isArray &&	aType.isArray != anotherType.isArray)
		{
			// no
			return false;
		}
		if((aType.isPrimitive && !anotherType.isPrimitive) ||
			(!aType.isPrimitive && anotherType.isPrimitive))
		{
			// no
			return false;
		}
		if(aType.isPrimitive &&	aType.isPrimitive != anotherType.isPrimitive)
		{
			// no
			return false;
		}
	}
	return true;
}

function buildType(aTypeSig)
{
	var aReturnType = new Object();
	aReturnType.name = aTypeSig.type;
	if(aTypeSig.array && aTypeSig.array == "true")
	{
		aReturnType.isArray = "true";
		aReturnType.theRank = 1;
		if(aTypeSig.rank)
		{
			aReturnType.theRank = aTypeSig.rank;
		}
	}
	else
	{
		aReturnType.isArray = "false";
	}
	if(aTypeSig.primitive && aTypeSig.primitive == "true")
	{
		aReturnType.isPrimitive = "true";
	}
	else
	{
		aReturnType.isPrimitive = "false";
	}
	return aReturnType;
}

function getPrimitiveTypeString(aPrimitiveType)
{
	switch(aPrimitiveType)
	{
		case "VOID":
			return "void";
		case "BOOLEAN":
			return "boolean";
		case "I1":
		case "U1":
			return "byte";
		case "I2":
		case "U2":
			return "short";
		case "CHAR":
			return "char";
		case "I4":
		case "U4":
			return "int";
		case "I8":
		case "U8":
			return "long";
		case "R4":
			return "float";
		case "R8":
			return "double";
		default:
			break;
	}
	return aPrimitiveType;
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 saveProxy
//
// DESCRIPTION:
//	  save the Proxy data instance into javascript Object
//
// ARGUMENTS:
//	 none.
//
// RETURNS:
//	 proxyGenRec an instance of the Proxy data instance if there
//	 is no error.  If there is ann error sends the error message
//--------------------------------------------------------------------
function saveProxy()
{
	return new Object();
}


//*-------------------------------------------------------------------
// FUNCTION:
//	 loadProxy
//
// DESCRIPTION:
//	  launches the Proxy dialog with instance data.
//	  If it is a new instance proxyGenRec is null and an empty dialog opens
//		up.
//
// ARGUMENTS:
//	  proxyGenRec : the proxy record containing the instance specific info.	
//
// RETURNS:
//	 nothing
//--------------------------------------------------------------------
function loadProxy(proxyGenRec)
{
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 addQuotes
//
// DESCRIPTION:
//	Adds quotes to the path and returns it
//
// ARGUMENTS: 
//	 
//	path	: The path to which quotes have to be added
//
// RETURNS:
//	String	 
//--------------------------------------------------------------------

function addQuotes(path)
{
	var newPath = path;
	if(dwscripts.IS_WIN)
	{
		if(newPath.indexOf(" ") != -1) 
		{
			newPath = "\""+ newPath + "\"";
		} 	 
	}
	
	return newPath;  
}
