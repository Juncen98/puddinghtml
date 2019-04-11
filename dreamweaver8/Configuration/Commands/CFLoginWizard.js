/*
* Copyright 2005 Macromedia, Inc. All rights reserved.
* DO NOT REDISTRIBUTE THIS SOFTWARE IN ANY WAY WITHOUT THE EXPRESSED
* WRITTEN PERMISSION OF MACROMEDIA.
*/

var successPage = "index.cfm";
var failurePage = "login.cfm";
var pwdBase64 = MMToBase64(MMDB.getRDSUserName() + ":" + MMDB.getRDSPassword());
var strHeader = "Authorization-MX: Basic " + pwdBase64 + "\r\n";
var strdisplayPage = "CodeComplete";
var apppath = "";
var rand1, rand2;

function initializeUI()
{
	//set the apppath in the "Specify an Application to Secure" dialog to the current sito root
	findObject('apppath').value = dreamweaver.getSiteRoot();   
	if( site.getSiteForURL(dreamweaver.getSiteRoot()) != site.getCurrentSite() )
	{
		alert(dreamweaver.loadString("commands/CFloginWizard/siteDoesNotMatchDocument"));
	}
}

function MMToBase64(theInput)
{
	var base64codes = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	var theOutput = new String();
	var j;
	for (j=0; j<(theInput.length - (theInput.length % 3)); j=j+3)
	{
		theOutput = theOutput + base64codes.charAt(Math.floor(theInput.charCodeAt(j) / 4));
		theOutput = theOutput + base64codes.charAt(((theInput.charCodeAt(j) % 4) * 16) + Math.floor(theInput.charCodeAt(j+1) / 16));
		theOutput = theOutput + base64codes.charAt(((theInput.charCodeAt(j+1) % 16) * 4) + Math.floor(theInput.charCodeAt(j+2) / 64));
		theOutput = theOutput + base64codes.charAt(theInput.charCodeAt(j+2) % 64);
	}

	if ((theInput.length % 3) != 0)
	{
		if ((theInput.length % 3) == 2)
		{
			theOutput = theOutput + base64codes.charAt(Math.floor(theInput.charCodeAt(j) / 4));
			theOutput = theOutput + base64codes.charAt(((theInput.charCodeAt(j) % 4) * 16) + Math.floor(theInput.charCodeAt(j+1) / 16));
			theOutput = theOutput + base64codes.charAt((theInput.charCodeAt(j+1) % 16) * 4);
			theOutput = theOutput + "=";
		}
		else if ((theInput.length % 3) == 1)
		{
			theOutput = theOutput + base64codes.charAt(Math.floor(theInput.charCodeAt(j) / 4));
			theOutput = theOutput + base64codes.charAt((theInput.charCodeAt(j) % 4) * 16);
			theOutput = theOutput + "==";
		}
	}

	return theOutput;
}

function finalDisplay() 
{
	if (strdisplayPage == "CodeComplete2x") {
 		document.CodeComplete2x.visibility = "visible"
	} else if(strdisplayPage == "CodeComplete") {
		document.CodeComplete.visibility = "visible"
	}
		
	/*	
	if (site.getFocus() != "local") {
		findObject('doSync2x').disabled = true;
		findObject('doSync3x').disabled = true;
		var synchAlert =  alert(noFocus_message);
		}
	*/

}
// Determine which authentication type is going to be used
function callCodeGen(auth_type)
{
	apppath = findObject('apppath').value; 
	if( apppath && apppath.length > 0 ){
		if( apppath.charAt(apppath.length-1) != '/' ) {
			apppath += '/';
		}
	}
	
	var basicAuthlogin = findObject('basicAuthlogin');

	if (basicAuthlogin[0].checked) 
		{
			authLogin = basicAuthlogin[0].value;
		} 
	else 
		{
			authLogin = basicAuthlogin[1].value;
		}
	
		//determine if the new folder (app) exists if it does - do nothing if it doesnt create it
			if (! DWfile.exists(apppath)){
      			DWfile.createFolder(apppath);		
			}

	switch (auth_type) {
	
		case "NT" :
			var codeGenStatus = codeGenNT(apppath);
  			// if a page was successfully requested 
  				if (codeGenStatus) {
    				// set the result string to the contents of the response 
					document.NTAuth.visibility = "hidden";              
					finalDisplay();
					commonCodeGen(apppath);
  				}
  		
			break
		case "LDAP" :
			// check if the query string is blank
			qs = findObject('querystring').value;
			if (qs == "") {
				alert(no_queryString_message);
				document.LDAPAuthQueryString.visibility = "visible";
				findObject('querystring').focus();
			} else {
				var codeGenStatus = codeGenLDAP(apppath);
				// if a page was successfully requested
				if (codeGenStatus) {
	 				// set the result string to the contents of the response 
					document.LDAPAuthQueryString.visibility = "hidden";                
 					finalDisplay();
					commonCodeGen(apppath);
  				}
			}
  		
			break
		case "Simple" :
			var codeGenStatus = codeGenSimple(apppath);
	  		// if a page was successfully requested
			
				if (codeGenStatus) {
	  				// set the result string to the contents of the response 
					document.SimpleAuth.visibility = "hidden";                
					finalDisplay();
					commonCodeGen(apppath);
					updateAuthCFC(apppath,rand1,rand2);
  				}
			break	
		}
		
}

function commonCodeGen(apppath)
{
	if( apppath && apppath.length > 0 ){
		if( apppath.charAt(apppath.length-1) != '/' ) {
			apppath += '/';
		}
	}

	//application.cfc magic
	var appcfc = apppath + "Application.cfc";
	
	
	var fileMask = apppath + "*.cfc";
	var functionName = "onRequestStart";
	var argumentName = "thisRequest";
	var includeTemplate = "mm_wizard_application_include.cfm";
	var argumentCode = "<cfargument name=\"" + argumentName + "\" required=\"true\"/>"
	var signature = "<cffunction name=\"" + functionName + "\">";
	var includeCode = "<cfinclude template=\"" + includeTemplate + "\">";
	var logoutCode = "<cfif GetAuthUser() NEQ \"\">" + "\n" +
						"\t" + "\t" + "\t" + "<cfoutput>" + "\n" +
 						"\t" + "\t" + "\t" + "\t" + "<cfform action=\"mm_wizard_authenticate.cfc?method=logout&loginType=#args.authLogin#\" method=\"Post\">" + "\n" +
						"\t" + "\t" + "\t" + "\t" + "\t" + "<cfinput type=\"submit\" Name=\"Logout\" value=\"Logout\">" + "\n" +
						"\t" + "\t" + "\t" + "\t" + "</cfform>" + "\n" +
						"\t" + "\t" + "\t" + "</cfoutput>" + "\n" +
						"\t" +"\t" + "</cfif>";
	var startMethod =	"\t" + signature + "\n" + 
						"\t" + "\t" + argumentCode + "\n" +
						"\t" + "\t" + includeCode + "\n" +
						"\t" + "\t" + logoutCode + "\n" +
						"\t" + "</cffunction>" + "\n";
	
	//determine if the new folder (app) exists if it does - do nothing if it doesnt create it
	if (! DWfile.exists(apppath)){
      DWfile.createFolder(apppath);		
	}

	//go down the list of things we need to add to the 

	if (!DWfile.exists(appcfc))
	{
		copyFilesToSite(apppath);
		//have to create an Application.cfc with the onrequeststart method
		DWfile.write(appcfc,"<cfcomponent>" + "\n" + startMethod + "\n" + "</cfcomponent>");
		strdisplayPage = "CodeComplete";
		return;
	}
	
	var appCfcDom = dreamweaver.getDocumentDOM(appcfc);
	
	//get the cfcomponent tag
	var cfCompTag;
	var name;
	var tags = appCfcDom.getElementsByTagName("cfcomponent");
	if( !tags || tags.length < 1 )
	{
		copyFilesToSite(apppath);
		appCfcDom.documentElement.outerHTML = "<cfcomponent>" + "\n" + startMethod + "\n" + "</cfcomponent>" + documentElement;
		dreamweaver.saveDocument(appCfcDom, appcfc);
		return;
	}
	
	cfCompTag = tags[0];
	
	//find the cffuncttion "onRequestStart"
	tags = cfCompTag.getElementsByTagName("cffunction");
	var onRequestStartTag;
	if ( tags && tags.length > 0 ) 
	{
		for( i = 0; i < tags.length ; i++ )
		{
			name = tags[i].getAttribute("name");
			if(name && name.toLowerCase() == functionName.toLowerCase())
			{
				onRequestStartTag = tags[i];
				break;
			}
		}
	}
		
	if( !onRequestStartTag )
	{
		copyFilesToSite(apppath);
		//function tag doesn't exits, add it to the doc
		cfCompTag.innerHTML = "\n" + startMethod + "\n" + cfCompTag.innerHTML;
		dreamweaver.saveDocument(appCfcDom, appcfc);
		return;
	}
	
	//check the cfarguemunet node
	var argTag;
	var lastArgTag;
	//find the cffuncttion "onRequestStart"
	tags = onRequestStartTag.getElementsByTagName("cfargument");
	if ( tags && tags.length > 0 ) 
	{
		lastArgTag = tags[tags.length-1];
		for( i = 0; i < tags.length ; i++ )
		{
			name = tags[i].getAttribute("name");
			if(name && name == argumentName)
			{
				argTag = tags[i];
				break;
			}
		}
	}
	
	if( argTag ){
		argTag.setAttribute("required", "true");
	}
	else  {
		onRequestStartTag.innerHTML = "\n\t" + argumentCode + onRequestStartTag.innerHTML;
		strdisplayPage = "CodeComplete2x";
		lastArgTag = onRequestStartTag.getElementsByTagName("cfargument")[0];
	}
	
	var incTag;
	//find the cffuncttion "onRequestStart"
	tags = onRequestStartTag.getElementsByTagName("cfinclude");
	if ( tags && tags.length > 0 ) 
	{
		for( i = 0; i < tags.length ; i++ )
		{
			name = tags[i].getAttribute("template");
			if(name && name == includeTemplate)
			{
				incTag = tags[i];
				break;
			}
		}
	}
	
	if( !incTag )
	{
		//insert after the last arg tag
		lastArgTag.outerHTML = lastArgTag.outerHTML + "\n\t" + includeCode;
		strdisplayPage = "CodeComplete2x";
	}
	
	//now just look to see if we check for out auth user
	if( onRequestStartTag.innerHTML.search(/<cfif\s+GetAuthUser\s*\(\s*\)\s*NEQ\s+["']["']\s*>/im) < 0 )
	{
		onRequestStartTag.innerHTML = onRequestStartTag.innerHTML + "\n\t" + logoutCode;
		strdisplayPage = "CodeComplete2x";
	}
	
	copyFilesToSite(apppath);
	dreamweaver.saveDocument(appCfcDom, appcfc);
	return;
}

function copyFilesToSite(apppath)
{
	if( apppath && apppath.length > 0 ){
		if( apppath.charAt(apppath.length-1) != '/' ) {
			apppath += '/';
		}
	}
	
	var folderURL = dreamweaver.getConfigurationPath() + "/" + "commands" + "/" + "CFLoginWizard" + "/";
	var fileMask = "*";
	var list = DWfile.listFolder(folderURL + fileMask, "files");
	
	for (i=0; list.length > i;i++) 
	{
		var fileURL = folderURL + list[i];
		var newURL =apppath + list[i]; 
		if (!(list[i] == "index.cfm" && DWfile.exists(apppath + list[i]))){
			DWfile.copy(fileURL, newURL);
		}
 	}
}

function codeGenNT(apppath)
{
	if( apppath && apppath.length > 0 ){
		if( apppath.charAt(apppath.length-1) != '/' ) {
			apppath += '/';
		}
	}
	var domainname = findObject('domainname').value; 
	
	var filepath = apppath + "mm_wizard_application_include.cfm";
	
	if (domainname == "") {
		
		alert(emptyDomain_message);
		document.NTAuth.visibility = "visible";
		findObject('domainname').focus();
	} else {
	wizardInclude = "<!--- MM WIZARD CODE: BEGIN   --->" + "\n" + 
			        "\n" + 
					"\t" + "<!--- Set the NT Authentication Logic parameters --->" + "\n" +
					"\t" + "<cfset args = StructNew()>" + "\n" +
					"\n" + 
					"\t" + "<!--- Authentication Type ---->" + "\n" +
					"\t" + "<cfset args.authtype = \"NT\">" + "\n" +
					"\n" + 
					"\t" + "<!--- Domain Name ---->" + "\n" +					
					"\t" + "<cfset args.domain = \"" + domainname  + "\">" + "\n" +
					"\n" + 
					"\t" + "<!--- Login type--->" + "\n" +
					"\t" + "<cfset args.authLogin = \""  + authLogin + "\">" + "\n" +
					"\n" + 
					"\t" + "<!--- Login Page ---->" + "\n" +					
					"\t" + "<cfset args.loginform = \"mm_wizard_login.cfm\">" + "\n" +
					"\n" +
					"\t" + "<!--- Call the CFC to perform the authentication --->" + "\n" + 
					"\t" + "<cfinvoke component=\"mm_wizard_authenticate\" method=\"performlogin\">" + "\n" +
					"\t" + "\t" + "<cfinvokeargument name=\"args\" value=\"#args#\">" + "\n" +
					"\t" + "</cfinvoke>" + "\n" +
					"\n" + 
					"<!--- MM WIZARD CODE: END --->";
					
	var foo = DWfile.write(filepath,wizardInclude);
	return true;
	}
}

function codeGenLDAP(apppath)
{
	if( apppath && apppath.length > 0 ){
		if( apppath.charAt(apppath.length-1) != '/' ) {
			apppath += '/';
		}
	}
	
	var lusername = findObject('ldapusername').value; 
	var lpwd = findObject('ldappassword').value; 
	var lserver = findObject("ldapserver").value;	
	var lport = findObject("ldapport").value;
	var lstart = findObject("ldapstart").value;  
	var lquerystring = findObject("querystring").value; 
	var filepath = apppath + "mm_wizard_application_include.cfm";
	
		
	wizardInclude = "<!--- MM WIZARD CODE: BEGIN   --->" + "\n" +
					"\n" +
			        "\t" + "<!--- Set the LDAP Authentication Logic parameters --->" + "\n" +
					"\t" +" <cfset args = StructNew()>" + "\n" +
					"\n" +
					"\t" + "<!--- Authentication Type ---->" + "\n" +
					"\t" + "<cfset args.authtype = \"LDAP\">" + "\n" +
					"\t" + "<cfset args.server = \"" + lserver + "\">" + "\n" +
					"\t" + "<cfset args.port = \"" + lport + "\">" + "\n" +			
					"\t" + "<cfset args.start = \"" + lstart + "\">" + "\n" +
					"\t" + "<cfset args.suser = \"" + lusername + "\">" + "\n" +
					"\t" + "<cfset args.spwd = \"" + lpwd + "\">" + "\n" +
					"\t" + "<cfset args.queryString = \"" + lquerystring + "\">" + "\n" +
					"\n" + 
					"\t" + "<!--- Login type--->" + "\n" +
					"\t" + "<cfset args.authLogin = \""  + authLogin + "\">" + "\n" +
					"\n" + 
					"\t" + "<!--- Login Page ---->" + "\n" +					
					"\t" + "<cfset args.loginform = \"mm_wizard_login.cfm\">" + "\n" +
					"\n" + 
					"\t" + "<!--- Call the CFC to perform the authentication --->" + "\n" + 
					"\t" + "<cfinvoke component=\"mm_wizard_authenticate\" method=\"performlogin\">" + "\n" +
					"\t" + "\t" + "<cfinvokeargument name=\"args\" value=\"#args#\">"  + "\n" +
					"\t" + "</cfinvoke>" + "\n" +
					"\n" + 
					"<!--- MM WIZARD CODE: END --->";
	
	var foo = DWfile.write(filepath,wizardInclude);
	return true;
}

function codeGenSimple(apppath)
{
	if( apppath && apppath.length > 0 ){
		if( apppath.charAt(apppath.length-1) != '/' ) {
			apppath += '/';
		}
	}

	var sname = findObject('simpleusername').value; 
	var spwd = findObject('simplepassword').value; 
	var filepath = apppath + "mm_wizard_application_include.cfm";
	
	if (sname == "" || spwd == ""){
		alert(emptyUserPwd_message);
		document.SimpleAuth.visibility = "visible"
		if( sname == "" ) { 
			findObject('simpleusername').focus();
		} else { 
			findObject('simplepassword').focus();
		}
	} else {
		 //  check to see if it is a j2ee install and if that is running
		var thisURL = getWebroot("J2EE") + "/CFIDE/wizards/common/utils.cfc?method=wizardHash&inPassword=" + spwd + "";	
		var httpReply = MMHttp.postText(thisURL);
	
	 if (httpReply.statusCode != 200){
		
		 var thisURL = getWebroot("server") + "/CFIDE/wizards/common/utils.cfc?method=wizardHash&inPassword=" + spwd + "";	
		 var httpReply = MMHttp.postText(thisURL);
		 
	 } 
	 if (httpReply.statusCode == 200)
	 {
		var ws = new String("\t\n\r\,");
		spwd = dreamweaver.getTokens(httpReply.data,ws);
		getRandStr = dreamweaver.getTokens(httpReply.data,',');
		
		rand1 = getRandStr[1];
		rand2 = getRandStr[2];
		if( rand2.search(/\s\r\n/g) >= 0 )
		{
			rand2 = rand2.substring(0,  rand2.search(/\s\r\n/g));
		}
							 
	 } else {
		alert(not200_message);	
		alert(willNowclose_message);
		window.close();
		return false;
		
	 }
	 
				wizardInclude = "<!--- MM WIZARD CODE: BEGIN   --->" + "\n" +
					 "\n" +
			         "\t" + "<!--- Set the Simple Authentication Logic parameters --->" + "\n" + 
					 "\t" + "<cfset args = StructNew()>" + "\n" + 
					 "\n" +
					 "\t" + "<!--- Authentication Type ---->" + "\n" +
					 "\t" + "<cfset args.authtype = \"Simple\">" + "\n" +
					 "\t" + "<cfset args.suser = \"" + sname + "\">" + "\n" +
					 "\t" + "<cfset args.spwd = \"" + spwd[2] + "\">" + "\n" +
					 "\n" + 
					 "\t" + "<!--- Login type--->" + "\n" +
					 "\t" + "<cfset args.authLogin = \""  + authLogin + "\">" + "\n" +
					 "\n" +
					 "\t" + "<!--- Login Page ---->" +					"\n" +
					 "\t" + "<cfset args.loginform = \"mm_wizard_login.cfm\">" + "\n" +
					 "\n" +
					 "\t" + "<!--- Call the CFC to do the authentication --->" + "\n" +
					 "\t" +"<cfinvoke component=\"mm_wizard_authenticate\" method=\"performlogin\">" + "\n" +
					 "\t" + "\t" + "<cfinvokeargument name=\"args\" value=\"#args#\">" + "\n" +
					 "\t" + "</cfinvoke>" + "\n" +
					 "\n" +
					"<!--- MM WIZARD CODE: END --->";
	
	
	var foo = DWfile.write(filepath,wizardInclude);
	
	return true;
	}
}

function updateAuthCFC(apppath,str1,str2) 
{
	var authURL = apppath + "mm_wizard_authenticate.cfc";
	var token1 = "4YB4B7U";
	var token2 = "U7B4BY4";
	var authCFC = DWfile.read(authURL); // read authenticate.cfc
	
	if(DWfile.exists(authURL)){
		if(authCFC) // if read succeeds
		 {
			var re1 = new RegExp(token1, 'gm');
			var re2 = new RegExp(token2, 'gm');
			var newSalt = authCFC.replace(re1, dwscripts.trim(str1));
			var newPeppa = newSalt.replace(re2, dwscripts.trim(str2));
			DWfile.write(authURL,newPeppa);
								  
		 }
	}
}

function browseFile(fldName)
{
  var fileName;
  var curFld = findObject(fldName);
  var selectedDir = curFld.value;
 
  theSite = dreamweaver.getSiteRoot();

  if (DWfile.exists(selectedDir)) {
    fileName = dw.browseForFolderURL(MSG_CHOOSEFOLDER, curFld.value);
  } else {
    fileName = dw.browseForFolderURL(MSG_CHOOSEFOLDER);
  }


  if (fileName) {	  
    if (fileName.indexOf("file://") != -1) {
      curFld.value = fileName.substring(fileName.indexOf("file://"));
    } else {
      curFld.value = theSite + fileName.substring(fileName.indexOf("file://"));
    }
  }
}
function BeginWizard()
{
	if (dreamweaver.getSiteRoot() == "")
	
		{
			alert(noDWsite_message);
			window.close();
			
		}               
	document.AuthType.visibility = "hidden"; 
	document.AppName.visibility = "visible";
	findObject('apppath').focus();
	
}


// returns url to webroot
function getWebroot(edition)
{
	var URLPrefix = site.getAppURLPrefixForSite(site.getSiteForURL(dreamweaver.getSiteRoot()));
	var URLTokens =  dw.getTokens(URLPrefix,"/");	
	var webroot = "";
	
	if(edition == "server")
	{
		webroot = URLTokens[0] + "//" + URLTokens[1];
	}
	else
	{
		webroot = URLTokens[0] + "//" + URLTokens[1] + "/" + URLTokens[2];
		
	}
	
	return webroot;
	
}


function GoToAuthType()
{
	apppath = findObject('apppath').value; 
	if( apppath && apppath.length > 0 ){
		if( apppath.charAt(apppath.length-1) != '/' ) {
			apppath += '/';
		}
	}
	var appCfcPath = apppath + "Application.cfc";
	
	var nextbutton = findObject('appname_next').value;
	//verify the path is in the current site
	if(apppath.toLowerCase().indexOf(dreamweaver.getSiteRoot().toLowerCase()) < 0){
		alert(AppName_select_path_in_site);
	} 
	else if (DWfile.exists(appCfcPath) && DWfile.getAttributes(appCfcPath).indexOf("R") != -1 )
	{
		alert(NeedToMakeApplicationCFCEditable);
	} 
	else {
		displayAuthType();
	}
}

function displayAuthType()
{
	document.AppName.visibility = "hidden";
	document.NTAuth.visibility = "hidden";
	document.LDAPAuth.visibility = "hidden";
	document.SimpleAuth.visibility = "hidden";
	document.AuthType.visibility = "visible";
}


function selectAuthType()
{
	
	var authRadio = document.AuthType.document.authtypeform.authenticationtype;
	var authSelected;
	
	for (var i=0; i<authRadio.length; i++){
		if (authRadio[i].checked){
			 authSelected= authRadio[i].value;
		}
	}
	
	document.AuthType.visibility = "hidden";
	document.LDAPAuthQueryString.visibility = "hidden";
	if (authSelected == "NT"){
		document.NTAuth.visibility="visible";
		findObject('domainname').focus();
	}
	else if (authSelected  == "LDAP"){
		document.LDAPAuth.visibility = "visible";
		findObject('ldapserver').focus();
	}	
	else if (authSelected == "Simple"){
		document.SimpleAuth.visibility = "visible";
		findObject('simpleusername').focus();
	}	
}


function ldapauthquerystring()
{
	if( ! verifyldapserver() )
	{
		alert( Ldap_server_incorrect_message );
		return;
	}
	document.LDAPAuth.visibility="hidden";
	document.LDAPAuthQueryString.visibility ="visible";
	findObject('querystring').focus();
}

function verifyldapserver()
{
  var lusername = findObject('ldapusername').value; 
  var lpwd = findObject('ldappassword').value; 
  var lserver = findObject('ldapserver').value;	
  var lport = findObject("ldapport").value;
  var lstart = findObject("ldapstart").value; 
  var ldapval = findObject("ldapvalidated");
  var pwdBase64 = MMToBase64(MMDB.getRDSUserName() + ":" + MMDB.getRDSPassword());
  var strHeader = "Authorization-MX: Basic " + pwdBase64 + "\r\n";
  var verified = false;

	 if (lserver == "" || lport == "" || lstart == "" || lusername == "" || lpwd == "")
	{
		alert(Ldap_server_argsmissing_message);
	}
	else
	{ 	
		// make an http request to that url
		  var thisURL = getWebroot("server") +
					   "/CFIDE/wizards/common/utils.cfc?method=verifyldapserver" + 
					   "&vserver=" + lserver + 
					   "&vport=" + lport + 
					   "&vstart=" + lstart + 
					   "&vusername=" + lusername + 
					   "&vpassword=" + lpwd;
		 var httpReply = MMHttp.postText(thisURL,"","",strHeader);
		 
		 //if file not found, try adding a contextpath to the URL
		 if (httpReply.data.indexOf("true") == -1)
		 {
			 thisURL = getWebroot("J2EE") +
					   "/CFIDE/wizards/common/utils.cfc?method=verifyldapserver" + 
					   "&vserver=" + lserver + 
					   "&vport=" + lport + 
					   "&vstart=" + lstart + 
					   "&vusername=" + lusername + 
					   "&vpassword=" + lpwd;
			httpReply = MMHttp.postText(thisURL,"","",strHeader);
		}
	  
	  	if (httpReply.data.indexOf("true") != -1)
	  	{
			// set the result string to the contents of the response 
			ldapval.innerHTML = MSG_verificationSuccessful;
			verified = true;
	  	}
	  	else {
			ldapval.innerHTML = MSG_verificationFailed;
		}
	}
	return verified;
}

function getLDAPQueryString()
{
	alert(NotImplemented);
}

function Put_site()
{
	var list = new Array("Application.cfm","index.cfm","mm_wizard_application_include.cfm","mm_wizard_authenticate.cfc","mm_wizard_login.cfm","readme.txt","mm_wizard_index.cfm");
		for (i=0; list.length > i;i++) {
			if (site.canPut(apppath + list[i])){
				site.put(apppath + list[i]);
			}
		}
		thisURL = getWebroot("server");
		//dreamweaver.browseDocument(  + apppath);

}
	
function Sync_site()
{
	var synch2x = findObject('doSync2x').checked;
	var synch3x = findObject('doSync3x').checked;

		if (site.getAppServerAccessType() != "none") { 
			if (site.remoteIsValid()) {
				if (site.canSynchronize()) {
					site.synchronize();
				} else {
					alert(noSynch_message);
				} 
			} else {
				alert(remoteSiteNotValid_message);
			}
		} else {
			//this is a workaround if the remote site is accessable via RDS - we have to do a put due to a synch bug in Dreamweaver
			findObject('put').checked = true;
			Put_site();
		} 
}

