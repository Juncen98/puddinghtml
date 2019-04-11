
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************************API**************************

function commandButtons()
{
	return new Array(MM.BTN_OK,  "okClicked()",
                   MM.BTN_Cancel,"cancelClicked()",
                   MM.BTN_Help,  "displayHelp()")
}

var helpDoc = MM.HELP_exportAsWAR;


//*******************LOCAL FUNCTIONS*********************


function initializeUI()
{
	var warName = "";
	var includeJSP = "true";
	var siteHandle = MMNotes.open(dw.getSiteRoot(), false);
	if (siteHandle) 
	{
		warName = MMNotes.get(siteHandle, "warFile");
		includeJSP = MMNotes.get(siteHandle, "includeJSP");
		MMNotes.close(siteHandle);
	}
	document.forms[0].warName.value = warName;
	document.forms[0].includeJSPs.checked = eval(includeJSP);
}

function cancelClicked(){
   window.close();
}

function Preferences_getJavaJSP() {
  var JavaJSP = new Array();
  JavaJSP.javaHome = dw.getPreferenceString("Java/JSP Preferences", "Java/JDK home", "");
  JavaJSP.jarArchiver = dw.getPreferenceString("Java/JSP Preferences", "Java Archiver", "");
  JavaJSP.javaCompiler = dw.getPreferenceString("Java/JSP Preferences", "Java Compiler", "");
  JavaJSP.jspCompiler = dw.getPreferenceString("Java/JSP Preferences", "JSP Compiler", "");
  JavaJSP.Template = new Array();
  JavaJSP.Template.warArchiver = dw.getPreferenceString("Java/JSP Preferences", ".war Archiver", "");
  JavaJSP.Template.javaCompiler = dw.getPreferenceString("Java/JSP Preferences", ".java Compiler", "");
  JavaJSP.Template.jspCompiler = dw.getPreferenceString("Java/JSP Preferences", ".jsp Compiler", "");

  return JavaJSP;
}

function Site_getSourceFolders() {
  var root = dw.getSiteRoot();
  var jspSource = ""
  var javaSource = "";
  if (DWfile.exists(root + "\\Web-INF\\Jsp")) {
    jspSource = "WEB-INF/jsp";
  }
  if (DWfile.exists(root + "\\Web-INF\\src")) {
    javaSource = "WEB-INF/src";
  }
  var source = new Array();
  source.jsp = MMNotes.localURLToFilePath(root + jspSource);
  source.java = MMNotes.localURLToFilePath(root + javaSource);

  return source;
}

function browseFolder() {
  var warPath = dw.browseForFileURL('save', 'Export As', 'false', 'true', 'WAR files|*.war');
  if (warPath != "")
  {
    document.forms[0].warName.value = MMNotes.localURLToFilePath(warPath);
  }
}

function saveWarOptions(warName, includeJSP) {
  var siteHandle = MMNotes.open(dw.getSiteRoot(), true);
  if (siteHandle) 
  {
	MMNotes.set(siteHandle, "warFile", warName);
	MMNotes.set(siteHandle, "includeJSP", includeJSP);
	MMNotes.close(siteHandle);
  }
}

function archiveFile(file, includeJSP) {
  var result = true;
  var index = file.lastIndexOf(".");
  if (index >= 0) {
    var extension = file.substr(index).toLowerCase();
	if (extension == ".java" || (extension == ".jsp" && !includeJSP) || extension == ".lck") {
	  result = false;
	}
  }

  return result;
}

function archiveDirectory(directory, includeJSP) {
// directory is relative to the site root
// URL is the URL of the site root
  var result = true;
  if (directory.toLowerCase() == "_notes" || directory.toLowerCase() == "_mmserverscripts") {
	result = false;
  } else {
	var URL = dw.getSiteRoot() + directory;
	var localPath = MMNotes.localURLToFilePath(URL);
	var source = Site_getSourceFolders();
	if (localPath == source.java || (localPath == source.jsp && !includeJSP)) {
	  result = false;
	}
  }

  return result;
}

function Site_getFiles(directory, bAppendRootFolder) {
// directory is relative to the site root
  var files = "";
  var nextDirectory = "";
  var currFolder = dw.getSiteRoot();
  if (directory != "") {
	currFolder = currFolder + directory + "/";
	nextDirectory = directory + "/";
  }
  var includeJSP = document.forms[0].includeJSPs.checked;
  var directories = DWfile.listFolder(currFolder, "directories");
  if (directories) {
    var len = directories.length;
    var i;
    for (i=0; i < len; i++)
    {
	  var nextDir = nextDirectory + directories[i];
	  if (archiveDirectory(nextDir, includeJSP)) {
	    files += Site_getFiles(nextDir, bAppendRootFolder);
	  }
	}
  }
  var siteFiles = DWfile.listFolder(currFolder, "files");
  if (siteFiles) {
  	var siteName = "";
	if (bAppendRootFolder) {
	 siteName = dw.getSiteRoot();
	 siteName = siteName.substring(0, siteName.lastIndexOf("/"));
	 siteName = siteName.substr(siteName.lastIndexOf("/") + 1) + "/";
	}
    var len = siteFiles.length;
    var i;
    for (i = 0; i < len; i++) {
	  if (archiveFile(siteFiles[i], includeJSP)) {
	    files = files + '\r\n"' + siteName + nextDirectory + siteFiles[i] + '"';
	  }
    }
  }

  return files;
}
  
function buildArguments(commandTemplate, jar, name, files) {
  var command = commandTemplate;
  command = command.replace(/\$\$\{Jar\}/gi, jar);
  command = command.replace(/\$\$\{Name\}/gi, name);
  command = command.replace(/\$\$\{Files\}/gi, files);

  return command;
}

function generateTempFileName() {
  return "fileList";
}

function okClicked()
{
	var warName = document.forms[0].warName.value;
	var includeJSP = document.forms[0].includeJSPs.checked;
	var JavaJSP = Preferences_getJavaJSP();
	if (exportSiteAsWAR(warName, includeJSP, JavaJSP.jarArchiver, JavaJSP.Template.warArchiver)) {
		window.close();
	}
}

function exportSiteAsWAR(warName, includeJSP, jarArchiver, warArchiver)
{
	var success = true;
	if (warName.length)
	{
		var index = warName.lastIndexOf(":");
		var warFileName = warName.substr(index + 1);
		var removeFile = false;
		var path = dw.getConfigurationPath() + "/WAR/";
		// save path as a sitewide note for default Export as
		saveWarOptions(warName, includeJSP);
		if (jarArchiver != "" && DWfile.exists(jarArchiver)) {
		  if(navigator.platform.charAt(0) != "M") { // Windows
			  var files = Site_getFiles("", false); // recursive function
			  var tempFile = generateTempFileName();
			  if (!DWfile.exists(path)) {
				if (!DWfile.createFolder(path)) {
					alert(MSG_ErrorWARFolder)
					return false;
				}
			  }
			  path += tempFile;
			  if (DWfile.write(path, files)) { // overwrite
				var arguments = buildArguments(warArchiver, "", warName, "@" + MMNotes.localURLToFilePath(path));
				MM.shellExecute(jarArchiver, arguments, MMNotes.localURLToFilePath(dw.getSiteRoot()));
			  }
			  else {
					alert(MSG_ErrorWARResponse)
					return false;				
			  }
		  }
		  else
		  {
		     // copy java archiver to the folder above the site root (jar utility requires site to be in same directory as the JAR utitlity)
			var srcFile = jarArchiver;
			srcFile = MMNotes.filePathToLocalURL(srcFile);
			var destFile = dw.getSiteRoot();
			destFile = destFile.substr(0, destFile.length - 1); // trim trailing '/'
			var index = destFile.lastIndexOf("/");
			destFile = destFile.substring(0, index); // trim to parent directory excluding '/'
			path = destFile + "/"; // path is the directory of the Jar and temp WAR
			destFile += srcFile.substring(srcFile.lastIndexOf("/"));
			if (!DWfile.exists(destFile)) {
				if (DWfile.copy(jarArchiver, destFile)) {
					removeFile = true;
				}
				else {
					alert(MSG_ErrorCopy + jarArchiver + MSG_ErrorCopyTo + destFile);
					return false;
				}
			}
			var script;
			script = DWfile.read(dw.getConfigurationPath() + "/WAR/jarscript");
			if (script) {
				script = script.replace(/\$\$\{Jar\}/ig, MMNotes.localURLToFilePath(destFile));
				script = script.replace(/\$\$\{Name\}/ig, warFileName);
				var files = Site_getFiles("", true);
				files = files.replace(/\r\n/g, ",");
				script = script.replace(/\$\$\{Files\}/ig, files);						
				dw.runAppleScript(script);
				if (DWfile.exists(path + warFileName)) {
					if (DWfile.copy(path + warFileName, warName)) {
						if (!DWfile.remove(path + warFileName)) {
							//alert("Warning: Could not remove temporary file:" + path + warFileName);
							//success = false;	
						}
					}
					else {
						//alert("Warning: Could not copy WAR file:\n" + path + warFileName + "\nto destination:\n" + warName);
						success = false;	
					}
				}
				else {
					//alert(MSG_ErrorCreateWar + warName);
					success = false;	
				}
			}
			else {
				alert(MSG_ErrorLocateAppleScript + dw.getConfigurationPath() + "/WAR/jarscript");
				success = false;	
			}
			if (removeFile) {
				if (!DWfile.remove(destFile)) {
					//alert("Warning: Could not remove temporary file:" + destFile);
					//success = false;	
				}
			}
		  }
		}
		else {
			// offer redirect to Preference dialog
			alert(MSG_SpecifyArchiverFile);
			success = false;
		}
	}	
	else {
		// offer redirect to Preference dialog
		alert(MSG_SpecifyPath);
		success = false;
	}

	return success;
}
