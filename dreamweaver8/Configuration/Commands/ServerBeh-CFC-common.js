// Copyright 2005 Macromedia, Inc. All rights reserved.

//--------------------------------------------------------------------
// FUNCTION:
//   checkAdvRS
//
// DESCRIPTION:
//   Check the AdvRS version
//
// ARGUMENTS:
//   version - the version to check
//
// RETURNS:
//   true - if the furrent version is greater than the given one
//   false - othervise (no advrs installed / version smaller than given
//           one)
//--------------------------------------------------------------------
function checkAdvRS(version) {
	if ((!MM.AdvRs_Version) || (MM.AdvRs_Version < version)) {
		return false;
	}
	return true;
}



//--------------------------------------------------------------------
// FUNCTION:
//   performFinalOperations
//
// DESCRIPTION:
//   Perform final operations
//
// ARGUMENTS:
//   sbObj
//   priorSBRecordset
//   sqlParams
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function performFinalOperations(sbObj, priorSBRecordset, sqlParams) {
	var dom = dw.getDocumentDOM();
	if( !( dom && dom.documentType == "CFC") ) {
		return;
	}
			
	var cfftag;

	if (sbObj) {
		// find the cffunction tag
		cfftag = sbObj.getParameter('cffunction__tag');
		if (!cfftag) {
			var cfcrs = dom.getElementsByTagName('cfquery');
			var rsName = sbObj.getParameter('RecordsetName');

			var i;
			for (i=0;i<cfcrs.length;i++) {
				if (cfcrs[i].getAttribute('name') == rsName) {
					cfftag = cfcrs[i];
				}
			}
			i=0;
			while (i++<20 && cfftag && cfftag.tagName) {
				if (cfftag.tagName.toLowerCase() != 'cffunction') {
					cfftag = cfftag.parentNode;
				}
			}
		}
	}
	if (!cfftag) {
		// if no CFFUNCTION tag is found, exit
		return;
	}
	if (sbObj && (!priorSBRecordset || !priorSBRecordset.getParameter('RecordsetName'))) {
		// if we deal with a new RecordsSet
		var cfrets = cfftag.getElementsByTagName("CFRETURN");
		for (var i=0;i<cfrets.length;i++) {
			// remove the CFRETURN tag(s)
			cfrets[i].outerHTML = '';
		}

		// add the CFRETURN tag at the end of the CFFUNCTION
		cfftag.innerHTML += "\t<cfreturn " + RECORDSET_SBOBJ.getParameter('RecordsetName') + ">";

		// change the CFFUNCTION's returntype attribute
		cfftag.setAttribute("returntype", "query");
		
		// add SET for recordset variable
		var cfsets = cfftag.getElementsByTagName('CFSET');
		var isset = false;
		// if there variable is already set do not do it again
		var re = new RegExp("var\\s*" + RECORDSET_SBOBJ.getParameter('RecordsetName') + "\\s*=", 'i');
		for(var i=0; i<cfsets.length; i++) {
			isset |= cfsets[i].outerHTML.search(re) != -1 ;
		}
		if(!isset) {
			//if variable is not set - set it
			var cfargs = cfftag.getElementsByTagName('CFARGUMENT');
			if(cfargs.length == 0) {
				cfftag.innerHTML = "\t<cfset var " + RECORDSET_SBOBJ.getParameter('RecordsetName') + ' = "" >' + cfftag.innerHTML;
			} else {
				cfargs[cfargs.length-1].outerHTML += "\t<cfset var " + RECORDSET_SBOBJ.getParameter('RecordsetName') + ' = "" >';
			}
		}
	}

	if (sbObj) {
		// add the cfarguments tag

		// get the CFARGUMENTS used in the query
		var sql = sbObj.getParameter('SQLStatement');
		var sqlargs = new Array();
		var sqlargsinv = new Object();
		var sqlParamsInv = new Object();
		var a;
		sqlargs = sql.match(/Arguments\.(\w+)/ig, a);
		if (sqlargs) {
			for (var i=0;i<sqlargs.length;i++) {
				sqlargsinv[sqlargs[i].replace(/arguments\./i, '').toLowerCase()]=i+1;
			}
		}

		for (var i=0;i<sqlParams.length;i++) {
			var tmp = sqlParams[i].varName;
			if (tmp.match(/^arguments\./i)) {
				tmp = tmp.replace(/^arguments\./i, '');
				sqlParamsInv[tmp.toLowerCase()]=sqlParams[i].varDefault;
			}
		}

		// reset old arguments
		var cfargs = cfftag.getElementsByTagName("CFARGUMENT");
		var argName = '';
		for (var i=0;i<cfargs.length;i++) {
			argName = cfargs[i].getAttribute('name').toLowerCase();
			if (sqlargsinv[argName]) {
				delete sqlargsinv[argName];
				if (sqlParamsInv[argName] != null) {
					cfargs[i].setAttribute("default", sqlParamsInv[argName]);
				}
			}
		}
		// make new arguments
		for (i in sqlargsinv) {
			argName = sqlargs[sqlargsinv[i]-1].replace(/arguments\./i, '');
			var tmp = "\t<cfargument name=\""+(argName)+'"';
			if (sqlParamsInv[argName.toLowerCase()]) {
				tmp += ' default="'+(sqlParamsInv[argName.toLowerCase()])+'"';
			}
			tmp += ' hint="Argument for '+argName+'."';
			tmp += '>';// required="yes">'
			cfftag.innerHTML = tmp + cfftag.innerHTML;
		}
	}
}



//--------------------------------------------------------------------
// FUNCTION:
//   newFunction
//
// DESCRIPTION:
//   Calls the NewFunction command.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function newFunction() {
	var rsName = _RecordsetName.getValue();
	var funcName = 'get' + rsName.substr(0, 1).toUpperCase() +  rsName.substr(1,rsName.length-1);
	var ret = dwscripts.callCommand('CreateNewCFCFunction.htm',funcName);
	if (ret) {
	  _cffunction__tag.initializeUI();
		_cffunction__tag.listControl.setIndex(_cffunction__tag.listControl.getLen()-1);
	}
}

//--------------------------------------------------------------------
// FUNCTION:
//   insertNewCFCRecordset
//
// DESCRIPTION:
//   defines a new CFC recordset in the dom that's passed in
//
// ARGUMENTS:
//   dom - the cfc file to define the recordset in
//   url - path to that file
//	CFCSitePath & CFCNewName - used to refresh the CFC when it's done
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function insertNewCFCRecordset(dom, url, CFCSitePath, CFCNewName)
{
	
	//insert the recordset into the new document, don't popup an intruction messages
	var curInsertMessages = MM.noInsertObjectMessages;
	MM.noInsertObjectMessages = true;
	dom.insertObject("Recordset");
	MM.noInsertObjectWarnings = curInsertMessages;
	
	if( MM.RecordsetApplied )
	{
		//save the file
		dreamweaver.saveDocument(dom, url);
		site.refresh('local');
	
		//upload it to the server so we can introspect this new cfc
		if (site.canPut(url)) {
			site.put(url);
			site.refresh('remote');
			MM.CFCNeedRefresh = true;
			MM.CFCNewName = CFCNewName;
			MM.CFCSitePath = CFCSitePath;
			MM.CFCSitePath = MM.CFCSitePath.replace(/\//g, '.');
		} else {
			alert(MM.MSG_CFCUploadError);
		}
	}
	return;
}

