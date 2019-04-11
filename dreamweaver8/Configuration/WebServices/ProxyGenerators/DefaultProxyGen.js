// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

var DEBUG = false;

//*************** GLOBALS VARS *****************
var helpDoc = MM.HELP_wsDefaultProxyGen;
var nameObj;
var generateProxyObj;
var compileProxyObj;
var destOutputDir;
//var introspectorList;
var tempBatFile = "proxies.bat";
var tempBatFileLocation = getTempBatFile();
var outputFile = "out.txt";
//var outputFileLoc = getOutputFile(true);
var outputFileLoc = getOutputFile(false);
var outputFileLocWOQuotes = getOutputFile(false);
var outputFileReplacePattern = /@@outfile@@/g;
var redirectCmd = " >> @@outfile@@ 2>&1";
var MAXPATH = 175;
var tokens = new Array();


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
	if(!dwscripts.IS_WIN)
	{
		return false;
	}

	var serverNames, arr, i, serverName, retValue = false;
	serverNames = proxyGenRec.servermodels;
	if (serverNames)
	{
		arr = serverNames.split(","); 	 
		for(i = 0; i < arr.length; i++)
		{
			serverName = arr[i];
			if(serverName && serverModelName == serverName)
			{
				retValue = true;
				if(serverModelName != "ColdFusion")
				{
					// load the web service extension and see if an SDK is required
					var anExtensionDoc = dw.getConfigurationPath() + "/Components/";
					var aSplitServerModel = serverModelName.split(" ");
					var aServerModelFolder = "";
					for(var j in aSplitServerModel)
					{
						if(j > 0)
						{
							aServerModelFolder += "_";
						}
						aServerModelFolder += aSplitServerModel[j];
					}
					aSplitServerModel = aServerModelFolder.split("#");
					aServerModelFolder = "";
					for(var j in aSplitServerModel)
					{
						if(j > 0)
						{
							aServerModelFolder += "sharp";
						}
						aServerModelFolder += aSplitServerModel[j];
					}
					anExtensionDoc += aServerModelFolder + "/WebServices/WebServices.htm";
					if(DWfile.exists(anExtensionDoc))
					{
						var dom = dw.getDocumentDOM(anExtensionDoc);
						if (dom)
						{
							if(dom.parentWindow.needsSDKInstalled != null)
							{
								if(dom.parentWindow.needsSDKInstalled())
								{
									if(dom.parentWindow.isSDKInstalled != null)
									{
										if(!dom.parentWindow.isSDKInstalled())
										{
											retValue = false;
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
	if(dwscripts.IS_WIN == false)
	{
		return "";
	}

	// NOTE - $$SITEROOT is sent as localURL from the C++ side, so make sure you call getoutputDirAsFilePath()
	// to change it correctly
	var generateProxyObj	= proxyGenRec.generateproxy;
	var compileProxyObj 	= proxyGenRec.compileproxy;
	var outputDir 			= proxyGenRec.outputdir;
	var nodeName			= proxyGenRec.nodename;

	var wsdlName			= wsRec.$$WSDLFILE;
	var siteRoot			= wsRec.$$SITEROOT;
	var userName			= wsRec.$$USERNAME;
	var userPassword		= wsRec.$$USERPASSWORD;

	var configDir			= dwscripts.localURLToFilePath(dw.getConfigurationPath());

	var errMsg				= "";
	var aTempDir			= "";
	var aTempDirFilePath	= "";
	var aTempBatFile		= "";
	var aTempOutputFile		= "";
	var aResult				= "";
	var aWebServiceName		= "";
	var javac				= addQuotes(dwscripts.localURLToFilePath(dw.getRootDirectory() + "Jvm/bin/javac.exe"));
	var java				= addQuotes(dwscripts.localURLToFilePath(dw.getRootDirectory() + "Jvm/bin/java.exe"));

	// set the busy cursor...
	MM.setBusyCursor();

	body:	
	{
		// check to be sure there's something to do
		if ((!generateProxyObj || !generateProxyObj.length) &&
			(!compileProxyObj || !compileProxyObj.length))
		{
			errMsg = MM.MSG_ProxyGenCompileCmdMissing;
			break body;
		}

		// expand $$CONFIGDIR\classes\
		generateProxyObj = expandClassesDir(generateProxyObj);
		compileProxyObj = expandClassesDir(compileProxyObj);

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
			// TODO: figure out a name
			errMsg = MM.MSG_UnknownWSDLFormat;
			break body;
		}

		// get the config/temp folder path
		aSystemTempDir = DWfile.getSystemTempFolder();
		if(aSystemTempDir == null || !aSystemTempDir.length)
		{
			errMsg = MM.MSG_LocalWSDLFileCreateError;
			break body;
		}

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
			aTempDir = dwscripts.filePathToLocalURL(aSystemTempDir + "~DW" + aSequenceNumber);
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
		aTempDirFilePath = addQuotes(dwscripts.localURLToFilePath(aTempDir));

		// write and execute a batch file for generate proxy command
		if (generateProxyObj && generateProxyObj.length)
		{
			aTempBatFile = aTempDir + dwscripts.FILE_SEP + tempBatFile;

			// translate the tokens in the command
			var aGenerateProxyCommand = translateCommand(generateProxyObj, wsdlName, siteRoot, userName, userPassword, configDir, javac, java, aTempDirFilePath);
			if (!DWfile.write(aTempBatFile, aGenerateProxyCommand))
			{
				errMsg = MM.MSG_CreateBatchFileError;
				break body;
			}

			// execute and write output to a file
			aTempOutputFile = aTempDir + dwscripts.FILE_SEP + outputFile;
			if(!MM.createProcess(null,
					addQuotes(dwscripts.localURLToFilePath(aTempBatFile)),
					"-1",
					true,
					dwscripts.localURLToFilePath(aTempDir + dwscripts.FILE_SEP),
					dwscripts.localURLToFilePath(aTempOutputFile)))
			{
				errMsg = MM.MSG_BatchFileRunError;
				break body;
			}
			// read and remove the output file
			if (DWfile.exists(aTempOutputFile))
			{
				aResult += DWfile.read(aTempOutputFile);

				// delete the file after reading the contents
				DWfile.remove(aTempOutputFile);
			}
			// remove the batch file
			if(DWfile.exists(aTempBatFile))
			{
				DWfile.remove(aTempBatFile);
			}
		}
		// compile proxies in temp directory and subdirectories
		if (compileProxyObj && compileProxyObj.length)
		{
			var aProxyCompiler = new ProxyCompiler(translateCommand(compileProxyObj, wsdlName, siteRoot, userName, userPassword, configDir, javac, java, aTempDirFilePath));
			aProxyCompiler.compile(aTempDir);
			errMsg = aProxyCompiler.getErrMsg();
			if(errMsg && errMsg.length)
			{
				break body;
			}
			aResult += aProxyCompiler.getResult();
		}
		var IntrospectClassName = proxyGenRec.introspectorfilename;
		var FileExtensions;	
		var introspectorObjs = getIntrospectorList();
		for (var i=0; i < introspectorObjs.length; i++)
		{
			if(introspectorObjs[i].classname == IntrospectClassName)
			{
				FileExtensions = introspectorObjs[i].extensions;
				break;
			}
		}
		// execute reflector to be sure we have valid proxies
		if (FileExtensions && FileExtensions.length)
		{
			var aProxyReflector = new ProxyReflector(FileExtensions, proxyGenRec.introspectorfilename);
			aProxyReflector.reflect(aTempDir);
			errMsg = aProxyReflector.getErrMsg();
			if(errMsg && errMsg.length)
			{
				break body;
			}
			var someReflectedXML = aProxyReflector.getReflectedXML()
			if(!someReflectedXML || someReflectedXML.length <= 0)
			{
				errMsg = MM.MSG_UnableToGenerateProxy;
				break body;
			}

			aResult += aProxyReflector.getResult();
		}
		// move temp files to permanent location
		var aFileMover = new FileMover();
		var aDestDir = translateCommand(outputDir, wsdlName, siteRoot, userName, userPassword, configDir, javac, java, aTempDirFilePath);
		aFileMover.moveFiles(aTempDir, aDestDir);
		errMsg = aFileMover.getErrMsg();
		if(errMsg && errMsg.length)
		{
			break body;
		}

		// adjust stored locations
		var someReflectedXMLPackets = aProxyReflector.getReflectedXML();
		for(var i = 0; i < someReflectedXMLPackets.length; i++)
		{
			someReflectedXMLPackets[i][0] = dwscripts.replaceString(someReflectedXMLPackets[i][0], aTempDir, aDestDir);
		}
		
		//if we have some reflected xml packets we should be ok 
		//to clear the output buffered from the creatProcess
		if (someReflectedXMLPackets.length)
		{
			aResult = "";
			errMsg  = "";
		}

		var aLevel0Node = new Array();
		aLevel0Node[WebServiceNamePropName] = aWebServiceName;
		aLevel0Node[WSDLLocationPropName] = wsdlName;
		aLevel0Node[ReflectorPropName] = proxyGenRec.introspectorfilename;
		aLevel0Node[UserNamePropName] = userName;
		aLevel0Node[PasswordPropName] = userPassword;
		aLevel0Node[SiteRootPropName] = dw.getSiteRoot();
		aLevel0Node[ServerModelPropName] = dw.getDocumentDOM().serverModel.getDisplayName();
		aLevel0Node[ProxyGeneratorNamePropName] = proxyGenRec.name;
		errMsg = buildWebServiceChooserRecord(aLevel0Node, aProxyReflector);
		if(errMsg && errMsg.length)
		{
			errMsg = aLevel0Node;
			break body;
		}
		errMsg = addWebServiceChooserRecord(aLevel0Node);
		if(errMsg && errMsg.length)
		{
			break body;
		}

		// update UI
		dw.serverComponentsPalette.refresh();
	}


	// cleanup
	if(aTempDir && aTempDir.length && DWfile.exists(aTempDir))
	{
		DWfile.remove(aTempDir);
	}
	MM.clearBusyCursor();

	if(!errMsg || !errMsg.length)
	{
		errMsg = aResult;
	}

	return errMsg;
}

function expandClassesDir(aSource)
{
	var aPatternString = "\\\$\\\$CONFIGDIR[\\\\/]Classes[\\\\/]\\s";
	var aPattern = new RegExp(aPatternString, "gi");
	if(aSource.search(aPattern) != -1)
	{
		// get all jars the path
		var aClassesDir = dw.getConfigurationPath() + "/Classes";
		var aJarList = DWfile.listFolder(aClassesDir + "/*.jar", "files");
		if(aJarList && aJarList.length)
		{
			aClassesDir = dwscripts.localURLToFilePath(aClassesDir) + "/";
			var aClassPath = addQuotes(aClassesDir);
			for(i = 0; i < aJarList.length; i++)
			{
				aClassPath += ";";
				aClassPath += addQuotes(aClassesDir + aJarList[i]);
			}
			aSource = aSource.replace(aPattern, aClassPath + " ");
		}
	}
	return aSource;
}

function buildWebServiceChooserRecord(aLevel0Node, aProxyReflector)
{
	var errMsg = "";
body:
	{
		var aServerModel = dw.getDocumentDOM().serverModel;
		var aLanguageSignature = null;
		if(aServerModel)
		{
			aLanguageSignature = aServerModel.getLanguageSignatures();
			if (!aLanguageSignature)
			{
				errMsg = MM.MSG_NoLanguageSignature;
				break body;
			}
		}

		var someProxyLocations = new Array();
		var ProxyLocationsPropName = "ProxyLocations";

		someProxyLocations.type = ProxyLocationsPropName;
		aLevel0Node.push(someProxyLocations);

		// get proxy locations and parse reflected XML
		var someReflectedXMLPackets = aProxyReflector.getReflectedXML();

		// collect method info from i/f and stub in local vars
		var IFToImplMap = new Object();

		for(var i = 0; i < someReflectedXMLPackets.length; i++)
		{
			var aReflectedXMLPacket = someReflectedXMLPackets[i][1];
			if(!aReflectedXMLPacket)
			{
				continue;
			}
			var aProxyLocation = someReflectedXMLPackets[i][0];
			someProxyLocations.push(aProxyLocation);
			var reflectDom	= dw.getDocumentDOM(dw.getConfigurationPath() + '/Shared/MM/Cache/empty.htm');
			reflectDom.documentElement.outerHTML = aReflectedXMLPacket;
			var ErrorDescriptorNodes = reflectDom.getElementsByTagName("error");
			if (ErrorDescriptorNodes && ErrorDescriptorNodes.length)
			{
				errMsg = getReflectorErrorMessage(ErrorDescriptorNodes[0].code, ErrorDescriptorNodes[0].value, aProxyLocation);
				break body;
			}
			var someClassNodes = reflectDom.getElementsByTagName("classdescriptor");

			// map interfaces to implementations
			for(var j = 0; j < someClassNodes.length; j++)
			{
				var aClassNode = someClassNodes[j];
				if (aClassNode)
				{
					var someInterfaceNodes = aClassNode.getElementsByTagName("interface");
    				if(someInterfaceNodes && someInterfaceNodes.length)
					{
						for(var k = 0; k < someInterfaceNodes.length; k++)
						{
							var anInterfaceName = someInterfaceNodes[k].name;
							var anImpl = new Object();
							IFToImplMap[anInterfaceName] = anImpl;
							anImpl.name = aClassNode.name;
							anImpl.methods = new Array();
							var someMethodNodes = aClassNode.getElementsByTagName("methoddescriptor");
							if(someMethodNodes && someMethodNodes.length)
    						{
								for(var m = 0; m < someMethodNodes.length; m++)
								{
									var aMethodNode = someMethodNodes[m];
									var aMethodObj = new Object();
									anImpl.methods.push(aMethodObj);
									aMethodObj.name = aMethodNode.name;
									var aReturnType = aMethodNode.getElementsByTagName("returntype");
									if(aReturnType && aReturnType.length)
									{
										var aReturnTypeSig = aReturnType[0].getElementsByTagName("typesignaturedescriptor");
										if(aReturnTypeSig && aReturnTypeSig.length)
										{
											aMethodObj.returnType = aReturnTypeSig[0].type;
										}
									}
									var someMethodArgs = aMethodNode.getElementsByTagName("argumentdescriptor");
									if(someMethodArgs && someMethodArgs.length)
									{
										aMethodObj.args = new Array();
										for(var p = 0; p < someMethodArgs.length; p++)
										{
											var aMethodArg = someMethodArgs[p];
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
													anArg.type = aTypeSignature.type;
													anArg.outerHTML = aMethodArg.outerHTML;
													aMethodObj.args.push(anArg);
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


		// do 2nd pass and build object tree
		for(var i = 0; i < someReflectedXMLPackets.length; i++)
		{
			var aReflectedXMLPacket = someReflectedXMLPackets[i][1];
			if(!aReflectedXMLPacket)
			{
				continue;
			}

			var reflectDom = dw.getDocumentDOM(dw.getConfigurationPath() + '/Shared/MM/Cache/empty.htm');
			reflectDom.documentElement.outerHTML = aReflectedXMLPacket;
			var someClassNodes = reflectDom.getElementsByTagName("classdescriptor");
			for(var j = 0; j < someClassNodes.length; j++)
			{
				var aClassNode = someClassNodes[j];
				if (!aClassNode)
				{
					continue;
				}

				// get the class name
				var aClassName =  aClassNode.name;
				var anObjectName = aClassName.split(".");
				anObjectName = "a" + anObjectName[anObjectName.length - 1];

				var aLevel1Node = new Array();
				aLevel1Node.type = "Class";
				aLevel1Node.name = aClassName;
				aLevel1Node.tooltip = aClassName;
				aLevel0Node.push(aLevel1Node);

				// get the public fields
				var someFieldNodes = aClassNode.getElementsByTagName("fielddescriptor");
				if(someFieldNodes && someFieldNodes.length)
				{
					var aLevel2Node = null;

					// iterate over the fields in the class
					for(var k = 0; k < someFieldNodes.length; k++)
					{
						var aFieldNode = someFieldNodes[k];
						if(aFieldNode.getAttribute("public") && aFieldNode.getAttribute("public") == "true")
						{
							if(!aLevel2Node)
							{
								var aLevel2Node = new Array();
								aLevel2Node.type = "Fields";
								aLevel2Node.tooltip = MM.MSG_FieldsNode;
								aLevel2Node.name = MM.MSG_FieldsNode;
								aLevel1Node.push(aLevel2Node);
							}

							var aLevel3Node = new Object();
							aLevel3Node.type = "Field";
							var aLevel3NodeName = getFieldSignature(aLanguageSignature, aFieldNode);
							if(aLevel3NodeName && aLevel3NodeName.length && aLevel3NodeName.indexOf("public ") == 0)
							{
								aLevel3NodeName = aLevel3NodeName.slice(7);
							}
							aLevel3Node.name = aLevel3NodeName;
							aLevel3Node.tooltip = aLevel3NodeName;
							aLevel3Node.dropcode = aLevel3NodeName + dwscripts.getNewline();
							aLevel2Node.push(aLevel3Node);
						}
					}
				}

				// get the public properties
				var somePropertyNodes = aClassNode.getElementsByTagName("propertydescriptor");
				if(somePropertyNodes && somePropertyNodes.length)
				{
					var aLevel2Node = null;

					// iterate over the Propertys in the class
					for(var k = 0; k < somePropertyNodes.length; k++)
					{
						var aPropertyNode = somePropertyNodes[k];
						if(aPropertyNode.getAttribute("public") && aPropertyNode.getAttribute("public") == "true")
						{
							if(!aLevel2Node)
							{
								var aLevel2Node = new Array();
								aLevel2Node.type = "Properties";
								aLevel2Node.tooltip = MM.MSG_PropertiesNode;
								aLevel2Node.name = MM.MSG_PropertiesNode;
								aLevel1Node.push(aLevel2Node);
							}

							var aLevel3Node = new Object();
							aLevel3Node.type = "Property";
							var aLevel3NodeName = getPropertySignature(aLanguageSignature, aPropertyNode);
							if(aLevel3NodeName && aLevel3NodeName.length && aLevel3NodeName.indexOf("public ") == 0)
							{
								aLevel3NodeName = aLevel3NodeName.slice(7);
							}
							aLevel3Node.name = aLevel3NodeName;
							aLevel3Node.tooltip = aLevel3NodeName;
							aLevel3Node.dropcode = aLevel3NodeName + dwscripts.getNewline();
							aLevel2Node.push(aLevel3Node);
						}
					}
				}

				// get the public methods
				var someMethodNodes = aClassNode.getElementsByTagName("methoddescriptor");
				if(someMethodNodes && someMethodNodes.length)
				{
					// iterate over the Methods in the class
					for(var k = 0; k < someMethodNodes.length; k++)
					{
						var aMethodNode = someMethodNodes[k];
						if(aMethodNode.getAttribute("public") && aMethodNode.getAttribute("public") == "true")
						{
							// if this is an interface, try to find its impl so
							// we can get method arg names
							mapIFMethods(aClassName, aMethodNode, IFToImplMap);
							var aLevel2Node = new Array();
							aLevel2Node.type = "Method";
							var aLevel2NodeName = getMethodSignature(aLanguageSignature, aMethodNode);
							if(aLevel2NodeName && aLevel2NodeName.length && aLevel2NodeName.indexOf("public ") == 0)
							{
								aLevel2NodeName = aLevel2NodeName.slice(7);
							}
							aLevel2Node.name = aLevel2NodeName;
							aLevel2Node.tooltip = aLevel2NodeName;
							aLevel2Node.dropcode = getDropMethodSignature(aLanguageSignature, aMethodNode, anObjectName) + dwscripts.getNewline();
							aLevel1Node.push(aLevel2Node);
						}
					}
				}
			}
		}
	}
	return errMsg;
}


function mapIFMethods(ClassName, MethodDescriptorNode, IFToImplMap)
{
	for(var anInterface in IFToImplMap)
	{
		if(ClassName != anInterface)
		{
			continue;
		}

		// look for a matching method signatures
		var someTestMethods = IFToImplMap[anInterface].methods;
		if(!someTestMethods || !someTestMethods.length)
		{
			continue;
		}

		for(var i = 0; i < someTestMethods.length; i++)
		{
			var aTestMethod = someTestMethods[i];

			// do the names match?
			if(MethodDescriptorNode.name != aTestMethod.name)
			{
				// no
				continue;
			}

			// does return type match?
			var aReturnTypeArray = MethodDescriptorNode.getElementsByTagName("returntype");
			var aTestReturnType = aTestMethod.returnType;
			if((aReturnTypeArray && !aTestReturnType) || (!aReturnTypeArray && aTestReturnType))
			{
				// no
				continue;
			}
			if(aReturnTypeArray && aTestReturnType)
			{
				if(aReturnTypeArray.length <= 0)
				{
					// no
					continue;
				}
				var aTypeSig = aReturnTypeArray[0].getElementsByTagName("typesignaturedescriptor");
				if(!aTypeSig || !aTypeSig.length)
				{
					// no
					continue;
				}
				if(aTypeSig[0].type != aTestReturnType)
				{
					// no
					continue;
				}
			}

			// do arg types match?
			var someMethodArgs = MethodDescriptorNode.getElementsByTagName("argumentdescriptor");
			var someTestMethodArgs = aTestMethod.args;
			if((someMethodArgs && !someTestMethodArgs) || (!someMethodArgs && someTestMethodArgs))
			{
				// no
				continue;
			}
			if(someMethodArgs && someTestMethodArgs)
			{
				if(someMethodArgs.length != someTestMethodArgs.length)
				{
					// no
					continue;
				}
				var j = 0;
				for(; j < someMethodArgs.length; j++)
				{
					var someTypeSignatures = someMethodArgs[j].getElementsByTagName("typesignaturedescriptor");
					if(!someTypeSignatures || !someTypeSignatures.length)
					{
						// error
						break;
					}
					var aTypeSignature = someTypeSignatures[0];
					if(!aTypeSignature)
					{
						// error
						break;
					}
					if(aTypeSignature.type != someTestMethodArgs[j].type)
					{
						// no
						break;
					}
				}
				if(j >= someMethodArgs.length)
				{
					// yes, so update args
					for(j = 0; j < someMethodArgs.length; j++)
					{
						someMethodArgs[j].outerHTML = someTestMethodArgs[j].outerHTML;
					}
					return;
				}
			}
		}
	}
}


// proxy compiler object
function ProxyCompiler(aCompileCommand)
{
	this.aCompileCommand = aCompileCommand;
	this.anErrMsg = "";
	this.aResult = "";
}

ProxyCompiler.prototype.getErrMsg = ProxyCompiler_getErrMsg;
ProxyCompiler.prototype.getResult = ProxyCompiler_getResult;
ProxyCompiler.prototype.compile = ProxyCompiler_compile;

function ProxyCompiler_getErrMsg()
{
	return this.anErrMsg;
}

function ProxyCompiler_getResult()
{
	return this.aResult;
}

function ProxyCompiler_compile(aCompileDir)
{
	var aNormalizedCompileDir = aCompileDir;
	if(aNormalizedCompileDir.charAt(aNormalizedCompileDir.length - 1) != dwscripts.FILE_SEP &&
		aNormalizedCompileDir.charAt(aNormalizedCompileDir.length - 1) != "\\" &&
		aNormalizedCompileDir.charAt(aNormalizedCompileDir.length - 1) != "/")
	{
		aNormalizedCompileDir += dwscripts.FILE_SEP;
	}
	var aFileList = DWfile.listFolder(aNormalizedCompileDir, "files");
	if(aFileList && aFileList.length)
	{
		// create a temp batch file to run the compile command
		var aTempBatFile = aNormalizedCompileDir + tempBatFile;
		if (!DWfile.write(aTempBatFile, this.aCompileCommand))
		{
			this.anErrMsg += MM.MSG_CreateBatchFileError;
			return;
		}

		// execute the batch file and write output to a temp file
		var aTempOutputFile = aNormalizedCompileDir + outputFile;
		if(!MM.createProcess(null,
				addQuotes(dwscripts.localURLToFilePath(aTempBatFile)),
				"-1",
				true,
				dwscripts.localURLToFilePath(aNormalizedCompileDir),
				dwscripts.localURLToFilePath(aTempOutputFile)))
		{
			this.anErrMsg += MM.MSG_BatchFileRunError;
			return;
		}
		// read and remove the output file
		if (DWfile.exists(aTempOutputFile))
		{
			this.aResult += DWfile.read(aTempOutputFile);
			DWfile.remove(aTempOutputFile);
		}
		// remove the batch file
		if(DWfile.exists(aTempBatFile))
		{
			DWfile.remove(aTempBatFile);
		}
	}
	var aFolderList = DWfile.listFolder(aNormalizedCompileDir, "directories");
	if(aFolderList && aFolderList.length)
	{
		var n = aFolderList.length;
		for(var i = 0; i < n; i++)
		{
			this.compile(aNormalizedCompileDir + aFolderList[i]);
		}
	}
}

// file mover object
function FileMover()
{
	this.theErrMsg = "";
}

FileMover.prototype.getErrMsg = FileMover_getErrMsg;
FileMover.prototype.moveFiles = FileMover_moveFiles;
FileMover.prototype.copyFiles = FileMover_copyFiles;
FileMover.prototype.deleteFiles = FileMover_deleteFiles;


function FileMover_getErrMsg()
{
	return this.theErrMsg;
}

function FileMover_moveFiles(aSrcFolder, aDestFolder)
{
	this.copyFiles(aSrcFolder, aDestFolder);
	this.deleteFiles(aSrcFolder);
}

function FileMover_copyFiles(aSrcFolder, aDestFolder)
{
	var aFileList = DWfile.listFolder(aSrcFolder, "files");
	if(aFileList && aFileList.length)
	{
		createFolder(aDestFolder);
		var n = aFileList.length;
		for(var i = 0; i < n; i++)
		{
			var aFileName = aFileList[i];
			if(aFileName && aFileName.length)
			{
				var didSucceed = DWfile.copy(aSrcFolder + dwscripts.FILE_SEP + aFileName, aDestFolder + dwscripts.FILE_SEP + aFileName);
				if(didSucceed == false)
				{
					this.theErrMsg += MM.MSG_OutputFileReadError + dwscripts.getNewline();
				}
			}
		}
	}
	var aFolderList = DWfile.listFolder(aSrcFolder, "directories");
	if(aFolderList && aFolderList.length)
	{
		var n = aFolderList.length;
		for(var i = 0; i < n; i++)
		{
			this.copyFiles(aSrcFolder + dwscripts.FILE_SEP + aFolderList[i], aDestFolder + dwscripts.FILE_SEP + aFolderList[i]);
		}
	}
}

function FileMover_deleteFiles(aFolder)
{
	var didSucceed = DWfile.remove(aFolder);
}


//******************* PROXY MANAGEMENT API **********************

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
	if (proxyGenRec)
	{
		var fileName;
		if (proxyGenRec.name.length)
			document.theForm.proxygenname.setAttribute("disabled","true");

		nameObj.value		 		= proxyGenRec.name;
		if(proxyGenRec.generateproxy)
			generateProxyObj.value	= proxyGenRec.generateproxy;
		if(proxyGenRec.compileproxy)  
			compileProxyObj.value	= proxyGenRec.compileproxy;
		if(proxyGenRec.outputdir)
			destOutputDir.value		= proxyGenRec.outputdir;
			
		if (proxyGenRec.introspectorfilename) 
		{
			fileName = proxyGenRec.introspectorfilename;
			if (!introspectorList.pickValue(fileName))
			{
				introspectorList.setIndex(0); 
			}  
		}

		// Populate the drop-down menu with all the server models defined for the proxy record
		// Get the servermodels which is a comma separated list, then parse to get multiple
		// server models		
		var servermodelnames, i, arr, servername, strOut;
		strOut = document.theForm.servermodels.innerHTML;
		servermodelnames = proxyGenRec.servermodels;

		// get the html servermodel list
		serversArr = getHtmlList();
		arr = new Array();
		arr = servermodelnames.split(",");
		if (arr.length)
		{
			for(i = 0; i < arr.length; i++)
			{
				servername = arr[i];
				if (servername)
				{
					for(var j = 0; j < serversArr.length; j++)
						if (servername == serversArr[j]) break;
						if(j >= serversArr.length)
						{
							strOut = strOut + "<option value=\"";
							strOut = strOut + servername;
							strOut = strOut + "\"";
							if(i == 0)
								strOut = strOut + " selected";
							strOut = strOut + ">";
							strOut = strOut + servername;
							strOut = strOut + "</option>";
						}
				}
			}
		}
		document.theForm.servermodels.innerHTML = strOut + "";					
	}
	else
	{
		var servermodels, servermodel, arr;

		// select the introspector for the current server model...
		var selServerName = dw.getDocumentDOM().serverModel.getDisplayName();
		if (selServerName)
		{
			var introspectorObjs = getIntrospectorList();
			if (introspectorObjs.length)
			{
				for (i = 0; i < introspectorObjs.length; i++)
				{
					servermodels = introspectorObjs[i].serverModels;
					if (servermodels.length)
					{
						for(var j = 0; j < servermodels.length; j++)
						{
							servermodel = servermodels[j];
							if (servermodel && servermodel == selServerName)
							{
								if (!introspectorList.pickValue(introspectorObjs[i].classname))
								{
									introspectorList.setIndex(0); 
								} 
								break;							 
							}
						} 	 
					} 		 
				}
				if(i > introspectorObjs.length)
					introspectorList.setIndex(0);
			}
		} 					 
	} 	 
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
	var aProxy = new Object();
	
	// send an error message if there is one, otherwise send the proxy
	// object...
	var errorMsg;
	if(!nameObj.value)
		errorMsg = MM.MSG_ProxyGenNameMissing;
	// Both generateproxy and compile proxy can't be empty which is the case
	// for IBM proxy generator...  
	if(!generateProxyObj.value && !compileProxyObj.value)
		errorMsg = MM.MSG_ProxyGenCompileCmdMissing;
	if(!destOutputDir.value)
		errorMsg = MM.MSG_ProxyDestOutputDirMissing;
	if(destOutputDir.value.length > MAXPATH)
		errorMsg = MM.MSG_ProxyDestOutputDirLengthInvalid;	
	
	// validate the tokens...
	var invalidTokens = new Array();
	invalidTokens = validateTokens(generateProxyObj.value);
	if (invalidTokens.length)
	{
		var error = "";
		for(var i = 0; i < invalidTokens.length; i++)
		{
			if (invalidTokens[i].length)
			{
				if(error.length)
					error += ", ";
				error += invalidTokens[i];
			}
			if (error.length)
				errorMsg = errMsg(MM.MSG_InvalidTokensError, error, MM.MSG_GenerateProxyField);
		}
	}
	invalidTokens = validateTokens(compileProxyObj.value);
	if (invalidTokens.length)
	{
		var error = "";
		for(var i = 0; i < invalidTokens.length; i++)
		{
			if (invalidTokens[i].length)
			{
				error += invalidTokens[i];
				error += " ";
			}
			if (error.length)
				errorMsg = errMsg(MM.MSG_InvalidTokensError, error, MM.MSG_CompileProxyField);
		}
	}
	invalidTokens = validateTokens(destOutputDir.value);
	if (invalidTokens.length)
	{
		var error = "";
		for(var i = 0; i < invalidTokens.length; i++)
		{
			if (invalidTokens[i].length)
			{
				error += invalidTokens[i];
				error += " ";
			}
			if (error.length)
				errorMsg = errMsg(MM.MSG_InvalidTokensError, error, MM.MSG_DefaultOutputDirField);
		}
	}  
	
	aProxy.name 								= 	nameObj.value;
	aProxy.generateproxy				= 	generateProxyObj.value;
	aProxy.compileproxy 				= 	compileProxyObj.value;
	aProxy.outputdir						= 	destOutputDir.value;
	aProxy.introspectorfilename = 	introspectorList.getValue();
	
	// get the html servermodel list
	var retArr = getHtmlList();
	if (retArr)
		aProxy.servermodels 				= 	retArr.toString(); 
	
	if(!retArr.toString())
		errorMsg = MM.MSG_ProxyServerModelsMissing;
	
	if(!errorMsg)
		return aProxy;
	else
		return errorMsg;	
}





//***************** LOCAL FUNCTIONS  ******************

//*-------------------------------------------------------------------
// FUNCTION:
//	 initializeUI
//
// DESCRIPTION:
//	 popoulate the UI elements
//
// ARGUMENTS: 
//	 none
//
// RETURNS:
//	 nothing
//--------------------------------------------------------------------

function initializeUI()
{
	nameObj				= findObject("proxygenname");
	generateProxyObj	= findObject("genproxycommand");
	compileProxyObj		= findObject("compproxycommand");
	destOutputDir		= findObject("destfolder");	
	introspectorList	= new ListControl("introspectorslist");

//	Get the list of introspector from Introspectors folder.
	var introspectorObjs = getIntrospectorList();
	for (var i=0; i < introspectorObjs.length; i++)
	{
		var aObject = introspectorObjs[i];
		introspectorList.add(aObject.name, aObject.classname);
	}
	introspectorList.setIndex(0); 
	
    tokens = new Array();

	// add the tokens to the array...
	tokens.push("$$WSDLFILE");
	tokens.push("$$SITEROOT");
	tokens.push("$$USERNAME");
	tokens.push("$$USERPASSWORD");
	tokens.push("$$CONFIGDIR");
	tokens.push("$$COMPILEDIR");
	tokens.push("$$JAVAC");
	tokens.push("$$JAVA");
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 AddServerModel
//
// DESCRIPTION:
//	Pops a list box with all the server models and adds the selected
//	selected server model(s) to to the list box UI in the Proxy Generator
//	dialog
//
// ARGUMENTS: 
//	 none
//
// RETURNS:
//	 nothing
//--------------------------------------------------------------------
															
function AddServerModel()
{
	var i, strOut;

	dw.runCommand("ServerModelCombo");
	strOut = document.theForm.servermodels.innerHTML;
	var serverNames = MM.commandReturnValue;
	if (serverNames)
	{
		// get the html servermodel list
		serversArr = getHtmlList();

		for (i = 0; i < serverNames.length; i++)
		{
			serverName = serverNames[i];				
			if (serverName)
			{
				// get rid of the duplicates
				for (var j = 0; j < serversArr.length; j++)
					if (serverName == serversArr[j]) break; 			

					if (j >= serversArr.length)
					{
						strOut = strOut + "<option value=\"";
						strOut = strOut + serverName;
						strOut = strOut + "\"";
						if(i == 0)
							strOut = strOut + " selected";
						strOut = strOut + ">";
						strOut = strOut + serverName;
						strOut = strOut + "</option>";						
					}
			} 		
		}	
		document.theForm.servermodels.innerHTML = strOut + "";		 
	}
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 DeleteServerModel
//
// DESCRIPTION:
//	Deletes the selected servermodel from the List Box
//
// ARGUMENTS: 
//	 none
//
// RETURNS:
//	 nothing
//--------------------------------------------------------------------

function DeleteServerModel()
{
	delServerModelItem(); 	 
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 OnBrowse
//
// DESCRIPTION:
//	Brings up a chooser dialog for the user to pick a directory for
//	the Destination field
//
// ARGUMENTS: 
//	 none
//
// RETURNS:
//	 nothing
//--------------------------------------------------------------------

function OnBrowse()
{
	var destFolder;
	outputDir = destOutputDir.value;
	if (outputDir.length)
	{
		// get the site root and strip off any extra "/"
		var siteroot = dw.getSiteRoot();
		if (siteroot.length)
		{
			if(siteroot.charAt(siteroot.length - 1) =="/")
				siteroot = siteroot.substr(0, siteroot.length - 1);
			if (siteroot.length)
			{
				outputDir = translateCommand(outputDir, "", siteroot, "", "", "", "", "", "");
				getoutputDirAsFilePath();
				destFolder = MMNotes.localURLToFilePath(dw.browseForFolderURL(MM.MSG_SelectOutputProxyDir, outputDir)); 	 
			}
		}
	}
	else
		destFolder = MMNotes.localURLToFilePath(dw.browseForFolderURL(MM.MSG_SelectOutputProxyDir, dw.getSiteRoot()));

	if (!destFolder.length)
	{
		return;
	} 	 
	destOutputDir.value = destFolder;
}

//***************** UTILITY FUNCTIONS  ******************
//*-------------------------------------------------------------------
// FUNCTION:
//	 delServerModelItem
//
// DESCRIPTION:
//	 deletes the selected index in the server model option control
//
// ARGUMENTS: 
//	 none
//
// RETURNS:
//	 nothing
//--------------------------------------------------------------------

function delServerModelItem()
{
	var index = document.theForm.servermodels.selectedIndex;
	var theString = document.theForm.servermodels.innerHTML;

	if (index < 0 || !theString)
	{
		return false;
	}

	var optionStart = -1;
	var optionEnd = -1;
	for (var i = 0; i < index + 1; i++)
	{
		optionStart = theString.indexOf("<option", optionStart + 1);
		optionEnd = theString.indexOf("</option>", optionEnd + 1);
	} 
	optionEnd += 9;

	var newInnerHTML = theString.substring(0, optionStart) + theString.substring(optionEnd, theString.length);
	strOut = "innerhtml :\n" + theString + "\n\nstart = " + optionStart + "\nend = " + optionEnd;
	strOut += "\n\nnewinnerhtml = \n" + newInnerHTML;

	document.theForm.servermodels.innerHTML = newInnerHTML;

	if (index > document.theForm.servermodels.options.length - 1)
	{
		document.theForm.servermodels.selectedIndex = document.theForm.servermodels.options.length - 1;
	}
	else
	{
		document.theForm.servermodels.selectedIndex = index;
	}
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 getServerExtensions
//
// DESCRIPTION:
//	Returns the file extensions supported by the current server model 	
//
// ARGUMENTS: 
//	 none
//
// RETURNS:
//	 Array of Strings
//--------------------------------------------------------------------

function getServerExtensions()
{
	var path = dw.getConfigurationPath() + "/ServerModels";
	var urlArray = DWfile.listFolder(path, "files");
	var selServerName = dw.getDocumentDOM().serverModel.getDisplayName();
	var dom, fileExtsArray;

	// Get the list of server models by iterating through files in
	// the Configuration/ServerModels folder.
	serverNames = new Array();
	for (i = 0; i < urlArray.length; i++)
	{
		dom = dw.getDocumentDOM(path + "/" + urlArray[i]);
		if (dom && dom.parentWindow.getServerModelDisplayName != null)
		{
			serverInfo = dom.parentWindow.getServerModelDisplayName();
			if (serverInfo.length && selServerName.length && selServerName == serverInfo)
			{
				fileExtsArray = dom.parentWindow.getFileExtensions();
				break;
			}
		}
	}
	return fileExtsArray; 		
}


//*-------------------------------------------------------------------
// FUNCTION:
//	 translateCommand
//
// DESCRIPTION:
//	The Web Services record sent to applyProxy function is sent as a 
//	token list with $$parameters(for e.g., wsdlName is sent as
//	$$WSDLNAME).	This function replaces the tokens with the actual
//	information and returns the translated command
//
// ARGUMENTS: 
//	 
//	command 			: 	The command that is to be translated
//	wsdl				: 	WSDL URL for which the proxy is generated
//	siteroot			: 	Root of the current site
//	name				: 	User Name used for authentication by the
//							Web Service owner (Mostly, username is not
//							required for consuming web services 
//	userPassword		: 	User Password used for authentication by password
//							Web Service owner (Mostly, username is not
//							required for consuming web services 
//
// RETURNS:
//	 String
//--------------------------------------------------------------------

function translateCommand(command, wsdl, siteroot, name, password, configDir, javac, java, aCompileDir)
{
	var finalCommand = command;
	if(wsdl && wsdl.length)
	{
		finalCommand = finalCommand.replace(/\$\$WSDLFILE/gi, wsdl);
	}
	if(siteroot && siteroot.length)
	{
		finalCommand = finalCommand.replace(/\$\$SITEROOT/gi, siteroot);
	}
	if(name && name.length)
	{
		finalCommand = finalCommand.replace(/\$\$USERNAME/gi, name);
	}
	if(password && password.length)
	{
		finalCommand = finalCommand.replace(/\$\$USERPASSWORD/gi, password);
	}
	if(configDir && configDir.length)
	{
		finalCommand = finalCommand.replace(/\$\$CONFIGDIR/gi, configDir);
	}
	if(javac && javac.length)
	{
		finalCommand = finalCommand.replace(/\$\$JAVAC/gi, javac);
	}
	if(java && java.length)
	{
		finalCommand = finalCommand.replace(/\$\$JAVA/gi, java);
	}
	if(aCompileDir && aCompileDir.length)
	{
		finalCommand = finalCommand.replace(/\$\$COMPILEDIR/gi, aCompileDir);
	}
	return finalCommand;
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 createFolder
//
// DESCRIPTION:
//
// This function iterates through each sub folder of folderURL and if
// it doesn't exist, creates it.	Returns true on success, otherwise
// false
//
// ARGUMENTS: 
//	 
//	folderURL 	: 	The URL that needs to be checked to see if it 
//									exists... 
//
// RETURNS:
//	 boolean
//--------------------------------------------------------------------

function createFolder(folderURL)
{
	var fileFolderURL = MMNotes.localURLToFilePath(folderURL);
	if (fileFolderURL)
	{
		var start = 0, index = -1, nextindex = -1, folder;
		while (index < fileFolderURL.length)
		{
			index = fileFolderURL.indexOf(dwscripts.FILE_SEP, start);
			if(index == -1)
			{
				index = fileFolderURL.indexOf("\\", start);
			}
			if(index == -1)
			{
				index = fileFolderURL.indexOf("/", start);
			}
			if (index != -1)
			{
				folder = fileFolderURL.substr(0, index);
				if(	folder.charAt(folder.length - 1) != dwscripts.FILE_SEP &&
					folder.charAt(folder.length - 1) != "\\" &&
					folder.charAt(folder.length - 1) != "/")
				{
					folder += dwscripts.FILE_SEP;
				}
				folder = MMNotes.filePathToLocalURL(folder);
				if (!DWfile.exists(folder))
				{
					if (DWfile.createFolder(folder))
					{
						start = index + 1;
					}
					else	
						return false;
				}
				else
				{
					start = index + 1;
				}
			}
			else
			{
				folder = fileFolderURL;
				if(	folder.charAt(folder.length - 1) != dwscripts.FILE_SEP &&
					folder.charAt(folder.length - 1) != "\\" &&
					folder.charAt(folder.length - 1) != "/")
				{
					folder += dwscripts.FILE_SEP;
				}
				folder = MMNotes.filePathToLocalURL(folder);
				if (!DWfile.exists(folder))
				{
					if (!DWfile.createFolder(folder))
						return false;
					return true;	
				}
				else
					break;	
			}
		}
	}
	return true;
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 RunDSConfirmDialog_YesNo
//
// DESCRIPTION:
//
//	Pops up a dialog pops a message and asks Yes/No and returns the 
//	value selected by the user
//
// ARGUMENTS: 
//	 
//	messageString 	:  Message string that would appear in the dialog
//	defaultResult 	:  the default result value  
//
// RETURNS:
//	 integer
//--------------------------------------------------------------------

function RunDSConfirmDialog_YesNo(messageString, defaultResult)
{
	var retVal = -1;
	var cmdName = 'ConfirmNoDS.htm';
	var cmdFile = dreamweaver.getConfigurationPath() + '/Commands/' + cmdName;

	var cmdDOM = dreamweaver.getDocumentDOM(cmdFile);
	var retVal = defaultResult; 

	if (cmdDOM) 
	{
	  var cmdWin = cmdDOM.parentWindow;
	  cmdWin.render(messageString, MM.BTN_Yes, MM.BTN_No);
	
	  MMNotes.Confirm_RESULT = true;  		 
	  dw.runCommand(cmdName);
	  if (MMNotes.Confirm_RESULT == MM.BTN_Yes)
			retVal = 1; 
	  else if (MMNotes.Confirm_RESULT == MM.BTN_No)
			retVal = 0; 
	  else
			retVal = -1; 
	}

	return retVal; 	
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 getoutputDirAsFilePath
//
// DESCRIPTION:
//
//	Returns the output directory as a file path, modifies the global
//	variable outputDir
//
// ARGUMENTS: 
//	 
//	none
//
// RETURNS:
//	 nothing
//--------------------------------------------------------------------
	
function getoutputDirAsFilePath()
{
	// check if there are any \, this is just in case the user has entered any \ in the path
	// such as $$SITEROOT\WEB-INF\classes
	outputDir.replace("\\", "/");
	// now change back to file path, we need to do this because we get it in local url						 
	outputDir = MMNotes.localURLToFilePath(outputDir);
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 addOutputRedirection
//
// DESCRIPTION:
//
//	adds output redirection to the command and returns the command.
//	Used for proxy generation and proxy compilation commands.  
//	Currently, the output redirection is done in Windows format
//
// ARGUMENTS: 
//	 
//	command 	: The command for which output redirection needs to be
//							added
//
// RETURNS:
//	 String
//--------------------------------------------------------------------

function addOutputRedirection(command)
{
	var finalCommand = command;
	if (finalCommand)
	{
		finalCommand = finalCommand.replace(outputFileReplacePattern, outputFileLoc);
	}
	
	return finalCommand;	
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 getCurrentDrive
//
// DESCRIPTION:
//	Returns the drive of the directory passed to it
//
// ARGUMENTS: 
//	 
//	siteroot	: The directory that for which the current drive needs to
//							be found
//
// RETURNS:
//	 String
//--------------------------------------------------------------------

function getCurrentDrive(siteroot)
{
	// find the first ":"
	var index = siteroot.indexOf(":");
	var drive;
	if(index != -1)
		drive = siteroot.substr(0, index);
	return drive;  
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 getHtmlList
//
// DESCRIPTION:
//	Returns the server models from the Select List
//
// ARGUMENTS: 
//	 
//	none
//
// RETURNS:
//	 Array of Strings
//--------------------------------------------------------------------

function getHtmlList()
{
	// get the list from the select list
	var selectedList = findObject("servermodels");
	var serversArr = new Array();
	for (i=0;i<selectedList.options.length;i++)
		serversArr.push(selectedList.options[i].text);

	return serversArr;		
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 getOutputFile
//
// DESCRIPTION:
//	Returns the output file to write the output (from executing commands)
//	to.
//
// ARGUMENTS: 
//	 
//	bAddQuotes	: boolean - specifies if quotes should be added
//	should there be spaces in any paths...
//
// RETURNS:
//	String	 
//--------------------------------------------------------------------

function getOutputFile(bAddQuotes)
{
	var path = getWebServicesDirectory(); 	 
	if (path)
		path = path + outputFile;
	else
		path = outputFile;	

	// put quotes around.
	if(bAddQuotes && bAddQuotes == true)
		path = addQuotes(path);
	return path;	
}

//*-------------------------------------------------------------------
// FUNCTION:
//	 getTempBatFile
//
// DESCRIPTION:
//	Returns the name of the batch file to which all the commands are
//	written
//
// ARGUMENTS: 
//	 
//	none
//
// RETURNS:
//	String	 
//--------------------------------------------------------------------

function getTempBatFile()
{
	var path = getWebServicesDirectory();
	if(path)
		path = path + tempBatFile;
	else
		path = tempBatFile;  
		
	return path;	
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

//*-------------------------------------------------------------------
// FUNCTION:
//	 validateTokens
//
// DESCRIPTION:
//	Validates the given command to see if the user has entered
//	any invalid tokens and returns the invalid tokens in an array
//
// ARGUMENTS: 
//	 
//	command  : Command that needs to be validated
//
// RETURNS:
//	Array of Strings
//--------------------------------------------------------------------


function validateTokens(command)
{
	var i = 0, j = 0;
	var invalidTokens = new Array();

	arr = new Array();
	arr = command.split(" "); 	 
	
	if (arr.length)
	{
		for(i = 0; i < arr.length; i++)
		{
			var word = arr[i];
			if (word.length)
			{
				if (word.substr(0, 2) == "$$")
				{
					if (tokens.length)
					{
						for(j = 0; j < tokens.length; j++)
						{
							var token = tokens[j];
							if (token.length)
							{
								if(word.indexOf(token) != -1)
								{
									retVal = true;
									break;
								}
							}
						}
						if (j >= tokens.length)
						{
							invalidTokens.push(word);
						}
					}
				}
			}
		}
	}
	return invalidTokens;
}
