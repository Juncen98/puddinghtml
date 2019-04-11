// Copyright 2005 Macromedia, Inc. All rights reserved.

var PARAM_NUMBER = 1;
var PARAM_BOOLEAN = 2;
var PARAM_STRING = 3;
var PARAM_ALL = 4;


//--------------------------------------------------------------------
// FUNCTION:
//   getDatasources
//
// DESCRIPTION:
//   Return a list of currently defined DSN on teh CF Server
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   dsnList - an array containing all DSN currently defined on
//             CF Server
//--------------------------------------------------------------------
function getDatasources() {
	var dsnList = new Array();
	var i = 0;

	var theDOM = executeRequest(buildRequest('CFIDE.adminapi.datasource', 'getDatasources', null, getAdminPassword()));
	if (theDOM) {
		var currentResult = theDOM.getElementsByTagName("var");
	
		while (i < currentResult.length) {
			dsnList.push(currentResult[i].getAttribute('name'));
			i += currentResult[i].getElementsByTagName("var").length+1;
		}
		return dsnList;
	} else {
		return -1;
	}
}



//--------------------------------------------------------------------
// FUNCTION:
//   existsDatasource
//
// DESCRIPTION:
//   Looks if a specified DSN already exists on the server
//
// ARGUMENTS:
//   dsnName - DataSource Name to be examined
//
// RETURNS:
//   true if exists, false otherwise
//--------------------------------------------------------------------
function existsDatasource(dsnName) {
	var list = getDatasources();
	if (list != -1) {
		for (var i in list) {
			if (list[i].toLowerCase() == dsnName.toLowerCase()) {
				return true;
			}
		}
		return false;
	} else {
		// there was an error while communicating with server
		return -1;
	}
}



//--------------------------------------------------------------------
// FUNCTION:
//   deleteDSN
//
// DESCRIPTION:
//   Deletes a DSN from the CF Server
//
// ARGUMENTS:
//   dsnName - the Data Source Name to be deleted
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function deleteDSN(dsnName) {
	var param = new Object();
	param.dsnname = dsnName;
	executeRequest(buildRequest('CFIDE.adminapi.datasource', 'deleteDatasource', param, getAdminPassword()));
}



//--------------------------------------------------------------------
// FUNCTION:
//   refreshDSList
//
// DESCRIPTION:
//   Refreshes the DS List
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function refreshDSList() {
	MMDB.needToRefreshColdFusionDsnList();	// tells the Connection Manager to empty the cache 
											// and get the ColdFusion data source list from the
											// application server the next time a user requests the list
	dw.databasePalette.refresh();
}



//--------------------------------------------------------------------
// FUNCTION:
//   getConnectionType
//
// DESCRIPTION:
//   Return the type of the specified DSN
//
// ARGUMENTS:
//   dsnName - the dataSource Name to be analyzed
//
// RETURNS:
//   a string containing the DSN type
//--------------------------------------------------------------------
function getDataSourceType(dsnName) {
	return getDataSourceParameter(dsnName, 'driver', PARAM_STRING);
}



//--------------------------------------------------------------------
// FUNCTION:
//   getDataSourceParameter
//
// DESCRIPTION:
//   Return the value of a specified parameter for a specific DataSource
//
// ARGUMENTS:
//   dsnName - the dataSource Name to be analyzed
//   parameter - the parameter name which value has to be returned
//   paramType - parameter type (NUMBER, STRING, BOOLEAN)
//   struct - 
//   displayWarnings - 
//
// RETURNS:
//   If the specified parameter exists, the function returns a string
//   containing the parameter value. A empty string is returned if
//   no parameter (with specified name) was found
//--------------------------------------------------------------------
function getDataSourceParameter(dsnName, parameter, paramType, struct, displayWarnings) {
	var result = "";
	var currentResult;
	
	if (!struct) {
		struct = getDataSourceStructure(dsnName, displayWarnings);
	}
	
	if (struct) {
		currentResult = struct.getElementsByTagName("var");
	}
	
	if (currentResult && currentResult.length) {
		for (var j=0; j<currentResult.length; j++) {
			if (currentResult[j].getAttribute('name').toLowerCase() == parameter.toLowerCase()) {
				switch (paramType) {
					case PARAM_NUMBER:
						if (currentResult[j].getElementsByTagName("number").length) {
							result = currentResult[j].getElementsByTagName("number")[0].innerHTML;
						}
						break;
					case PARAM_BOOLEAN:
						if (currentResult[j].getElementsByTagName("boolean").length) {
							result = currentResult[j].getElementsByTagName("boolean")[0].getAttribute("value");
						}
						break;
					case PARAM_STRING:
						if (currentResult[j].getElementsByTagName("string").length) {
							result = currentResult[j].getElementsByTagName("string")[0].innerHTML;
						}
						break;
					case PARAM_ALL:
						if (currentResult[j].getElementsByTagName("number").length) {
							result = currentResult[j].getElementsByTagName("number")[0].innerHTML;
							break;
						}
						if (currentResult[j].getElementsByTagName("boolean").length) {
							result = currentResult[j].getElementsByTagName("boolean")[0].getAttribute("value");
							break;
						}
						if (currentResult[j].getElementsByTagName("string").length) {
							result = currentResult[j].getElementsByTagName("string")[0].innerHTML;
						}
						break;
				}
				break;
			}
		}
	}
	return result;
}



//--------------------------------------------------------------------
// FUNCTION:
//   getDataSourceStructure
//
// DESCRIPTION:
//   Return an object containing all the parameters for the specified DSN
//
// ARGUMENTS:
//   dsnName - the DataSource Name to be analyzed
//
// RETURNS:
//   an object (DOM format) containing available parameters for the 
//   specified DSN
//--------------------------------------------------------------------
function getDataSourceStructure(dsnName, displayWarnings) {
	var theDOM = executeRequest(buildRequest('CFIDE.adminapi.datasource', 'getDatasources', null, getAdminPassword()));
	if (theDOM) {
		var struct;
		var i = 0, count;
		var result;
		var reg;
		var dsnDescrUpdatedIndexes = new Array();
		var dsnConnStrUpdatedIndexes = new Array();

		var strLoc = theDOM.documentElement.outerHTML;
		
		// Looking for unclused comment tags within 'description' field for each DSN
		reg = new RegExp("(<var\\s*name\\s*=\\s*['\"]description['\"]\\s*>\\s*<\\s*string\\s*>)(.*?)(<\\s*\\/string\\s*><\\/var>)", "gi");
		count = 0;
		while ((result=reg.exec(strLoc)) != null) {
			if ((RegExp.$2.indexOf('<!--')>=0) && (RegExp.$2.indexOf('-->')<0)) {
				strLoc = strLoc.substr(0, result.index) + RegExp.$1 + RegExp.$2 + '-->' + RegExp.$3 + strLoc.substr(result.index+(RegExp.$1+RegExp.$2+RegExp.$3).length);
				dsnDescrUpdatedIndexes.push(count);
			}
			count++;
		} 

		// Looking for unclused comment tags within 'connection string' field for each DSN
		reg = new RegExp("(<var\\s*name\\s*=\\s*['\"]args['\"]\\s*>\\s*<\\s*string\\s*>)(.*?)(<\\s*\\/string\\s*><\\/var>)", "gi");
		count = 0;
		while ((result=reg.exec(strLoc)) != null) {
			if ((RegExp.$2.indexOf('<!--')>=0) && (RegExp.$2.indexOf('-->')<0)) {
				strLoc = strLoc.substr(0, result.index) + RegExp.$1 + RegExp.$2 + '-->' + RegExp.$3 + strLoc.substr(result.index+(RegExp.$1+RegExp.$2+RegExp.$3).length);
				dsnConnStrUpdatedIndexes.push(count);
			}
			count++;
		}

		// Looking for unclused comment tags within 'url' field for each DSN
		reg = new RegExp("(<var\\s*name\\s*=\\s*['\"]url['\"]\\s*>\\s*<\\s*string\\s*>)(.*?)(<\\s*\\/string\\s*><\\/var>)", "gi");
		var start, stop;
		while ((result=reg.exec(strLoc)) != null) {
			if ((RegExp.$2.indexOf('<!--')>=0) && (RegExp.$2.indexOf('-->')<0)) {
				start = 0;
				while ((start<RegExp.$2.length) && (RegExp.$2.substr(start).indexOf('<!--') >= 0)) {
					start = start + RegExp.$2.substr(start).indexOf('<!--');
					stop = RegExp.$2.substr(start).indexOf(';');
					if (RegExp.$2.substr(start, stop-start).indexOf('-->')<0) {
						strLoc = strLoc.substr(0, result.index) + RegExp.$1 + RegExp.$2.substr(0, start+stop) + '-->' + RegExp.$2.substr(start+stop) + RegExp.$3 + strLoc.substr(result.index+(RegExp.$1+RegExp.$2+RegExp.$3).length);
					}
					start = start + stop + 1;
				}
			}
		}
		
		// Delete each variable containing <!--.
		reg = new RegExp("(<var\\s*name\\s*=\\s*['|\"]([^'|\"]*?)['|\"]\\s*>)(.*?)(<\\s*\\/var\\s*>)", "gi");
		while ((result=reg.exec(strLoc)) != null) {
			if ((RegExp.$2.indexOf('<!--')>=0) && (RegExp.$2.indexOf('-->')<0)) {
				strLoc = strLoc.substr(0, result.index) + strLoc.substr(result.index+(RegExp.$1+RegExp.$3+RegExp.$4).length);
			}
		}

		theDOM.documentElement.outerHTML = strLoc;

		var currentResult = theDOM.getElementsByTagName("var");
		count = 0;
		while (i < currentResult.length) {
			if (currentResult[i].getAttribute('name').toLowerCase() == dsnName.toLowerCase()) {
				struct = currentResult[i];
				if (displayWarnings && indexWithinList(count, dsnDescrUpdatedIndexes)) {
					alert(MM.MSG_DSDescrFoundCommentTagUnclosed);
				}
				if (displayWarnings && indexWithinList(count, dsnConnStrUpdatedIndexes)) {
					alert(MM.MSG_DSConnStrFoundCommentTagUnclosed);
				}
				break;
			}
			i += currentResult[i].getElementsByTagName("var").length+1;
			count++;
		}
		return struct;
	}
}



//--------------------------------------------------------------------
// FUNCTION:
//   indexWithinList
//
// DESCRIPTION:
//   Looks within a list after a specified index
//
// ARGUMENTS:
//   index - the value to be searched
//   list - an array of indexes
//
// RETURNS:
//   1 if the specified index exists within the list, 0 otherwise
//--------------------------------------------------------------------
function indexWithinList(index, list) {
	var i;
	for (i=0; i<list.length; i++) {
		if (list[i] == index) {
			return 1;
		}
	}
	return 0;
}


//--------------------------------------------------------------------
// FUNCTION:
//   floatToInteger
//
// DESCRIPTION:
//   Truncs a float number contained within a string
//
// ARGUMENTS:
//   value - the string to be updated
//
// RETURNS:
//   the updated string
//--------------------------------------------------------------------
function floatToInteger(value) {
	while (value.indexOf('.')>0) {
		value = value.substr(0, value.indexOf('.'));
	}
	return value;
}



//--------------------------------------------------------------------
// FUNCTION:
//   trimDotZero
//
// DESCRIPTION:
//   Returns the value in "integer" format for the values which ends
//   in '.0'
//
// ARGUMENTS:
//   value - the value to be updated
//
// RETURNS:
//   value - the value with no ending '.0' characters
//--------------------------------------------------------------------
function trimDotZero(value) {
	if (value.substr(value.length-2, 2) == '.0') {
		value = value.substr(0, value.length-2);
	}
	return value;
}
