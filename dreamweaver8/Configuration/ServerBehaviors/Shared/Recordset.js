// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var gSimpleParamName = "MMColParam";

var CONST_TYPE = "recordset";


//******************* API **********************


//*-------------------------------------------------------------------
// FUNCTION:
//   canApplyServerBehavior
//
// DESCRIPTION:
//   Returns true if the server behavior can be applied.
//   Otherwise, displays an alert and returns false.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function canApplyServerBehavior() {
  
  var retVal = true;
  
  return retVal;
}



//*-------------------------------------------------------------------
// FUNCTION:
//   findServerBehaviors
//
// DESCRIPTION:
//   Locates instances of this server behavior on the current page.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   an array of SSRecord objects
//--------------------------------------------------------------------
function findServerBehaviors() {
  
  var paramObj = new Object();
  
  var currServerModel = dw.getDocumentDOM().serverModel.getServerName();
  
  //The standard matching function for findSB's is overridden in the 
  // canAddPartToGroup function below.
  var sbList = dwscripts.findSBs(MM.LABEL_TitleRecordset + " (@@rsName@@)");
  
  // walk the list of found behaviors, and set some extra properties
  for (var i=0; i < sbList.length; i++) {
    var sbObj = sbList[i];
    sbObj.errorMsg = "";
    
    var rsName = sbList[i].getParameter("RecordsetName");
	if (rsName) 
	{
		var baseTitle = dw.loadString("serverBehavior/title/" + sbList[i].name);
		if( !baseTitle )
			baseTitle = sbList[i].name;
		
		sbList[i].setTitle(baseTitle + " (" + rsName + ")");
		if(!sbList[i].getParameter('MM_subType') && sbList[i].subType) {
			sbList[i].setParameter('MM_subType', sbList[i].subType);
		}
	}

    if (sbObj.type == "recordset_UD1") {
      sbObj.title += MM.LABEL_OutOfDate;
      sbObj.outOfDate = true;
      sbObj.MM_forceMultipleUpdate = true;
    }
    
    //set the connection name
    if (sbObj.parameters.cname) {
      
      sbObj.parameters.connectionName = sbObj.parameters.cname;
      sbObj.connectionName = sbObj.parameters.connectionName;

      var dom = dw.getDocumentDOM();

			//if the current server model is JSP
			var urlformat = sbObj.parameters.urlformat;
			if (currServerModel == "JSP") 
			{
			  //if the connection relative path begins with '/' it is site relative
				if ((sbObj.parameters.relpath != null) && (sbObj.parameters.relpath[0]=='/'))
				{
					//set the urlformat to virtual
					urlformat = "virtual";
				}
			}

      if (dom && dom.URL && sbObj.parameters.relpath != getConnectionsPath(sbObj.parameters.cname,urlformat)) {
        sbObj.incomplete = true;
        sbObj.errorMsg += "\n"+MM.MSG_ConnectionPathInvalid;
      }
      
    } else {
      
      if (!sbObj.parameters.connection && sbObj.parameters.dataSource) {
        sbObj.parameters.connection = sbObj.parameters.dataSource;
      }
      if (currServerModel == "ASP") {
        sbObj.parameters.connection = "\"" + sbObj.parameters.connection + "\"";
      }
      sbObj.connectionName = MMDB.getConnectionName(sbObj.parameters.connection,
                                               sbObj.parameters.driver,
                                               sbObj.parameters.dataSource, 
                                               sbObj.parameters.username, 
                                               sbObj.parameters.password);
      sbObj.activeconnection = sbObj.parameters.connection;
    }
        
    //set the properties that other references are expecting
    sbObj.rsName = sbObj.parameters.rsName;
    sbObj.cursortype = sbObj.parameters.cursorType;
    sbObj.cursorlocation = sbObj.parameters.cursorLocation;
    sbObj.locktype = sbObj.parameters.lockType;
    
    if (sbObj.parameters.maxRows == null) {
      sbObj.parameters.maxRows = "";
    }
    
    //remove variable references from the sql, and create an
    // array of those variables.
    var varArray = new Array();
    sbObj.parameters.sql = decodeVarRefs(sbObj.parameters.encodedSQL, varArray);
    sbObj.source = sbObj.parameters.sql;

    //populate the parameters array with the variable values
    sbObj.parameters.varName = new Array();
    sbObj.parameters.defaultValue = new Array();
    sbObj.parameters.runtimeValue = new Array();

    for (var j=0; j < sbObj.params.length; j++) {
      if (sbObj.types[j] == "recordset_variable") {
        if (sbObj.type != "recordset_UD1" || currServerModel == "Cold Fusion") {
          sbObj.parameters.varName.push(sbObj.params[j].varName);
  
          if (currServerModel != "Cold Fusion") {
            sbObj.parameters.runtimeValue.push(sbObj.params[j].runtimeValue);
          } else {
            sbObj.parameters.runtimeValue.push("#" + sbObj.params[j].runtimeValue + "#");
          }
  
          if (sbObj.params[j].defaultValue != null) {
            sbObj.parameters.defaultValue.push(sbObj.params[j].defaultValue);
          } else {
            //check if we have a defaultValue, for CFML        
            //look for the recordset_varDefault participant
            var defaultValue = "";
            for (var k=0; k < sbObj.params.length; k++) {
              if (sbObj.types[k] == "recordset_varDefault" &&
                  sbObj.params[k].runtimeValue == sbObj.params[j].runtimeValue) {
                defaultValue = sbObj.params[k].defaultValue;
                break;
              }
            }
            sbObj.parameters.defaultValue.push(defaultValue);
          }

        } else { // convert old variable references

          //check for multiple variables within the same code block
          var part = new Participant("recordset_variable","",true);
          var params = part.findInString(SB_convertNodeToString(sbObj.participants[j],""),true);
          if (params) {
            for (var k=0; k < params.varName.length; k++) {
              sbObj.parameters.varName.push(params.varName[k]);
              sbObj.parameters.runtimeValue.push(params.runtimeValue[k]);
              sbObj.parameters.defaultValue.push(params.defaultValue[k]);
            }
          }

        }
      }
    }


    //check the variable blocks against the references in the sql
    if (varArray.length != sbObj.parameters.varName.length) {
      sbObj.incomplete = true;
    } else {
      for (var j=0; j < varArray.length; j++) {
        var found = false;
        for (var k=0; k < sbObj.parameters.varName.length; k++) {
          if (varArray[j] == sbObj.parameters.varName[k]) {
            found = true;
            break;
          }
        }
        if (!found) {
          sbObj.incomplete = true;
          break;
        }
      }
    }

	//added by MPR
	for (var j = 0;j < MM.rsTypes.length;j++) {
		if (MM.rsTypes[j].serverModel == "ASP") {
			domCommand = dw.getDocumentDOM(dw.getConfigurationPath() + "/Commands/" + MM.rsTypes[j].command); 
			if (domCommand) {
				windowCommand = domCommand.parentWindow;
				if (windowCommand.fillAditionalParameters) {
					sbObj = windowCommand.fillAditionalParameters(sbObj);
				}
			}
		}			
	}
	//end

		//create the ParamArray for Recordset variable information
    sbObj.ParamArray = new Array();
    for (var j=0; j < sbObj.parameters.varName.length; j++) {
      var node = new Object();
      node.name = sbObj.parameters.varName[j];
      node.value = sbObj.parameters.defaultValue[j];
      node.runTime = sbObj.parameters.runtimeValue[j]; 
      sbObj.ParamArray.push(node);
    }

  }
    
  return sbList;
}



//*-------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//   adds the server behavior to the users page, based on the UI settings
//
// ARGUMENTS:
//   priorRec - if we are re-applying, the previous SSRecord for this
//              server behavior
//
// RETURNS:
//   string - error message to indicate failure, or the empty string
//            to indicate success
//--------------------------------------------------------------------
function applyServerBehavior(priorRec) {
  var errorMsg = "";
  var currServerModel = dw.getDocumentDOM().serverModel.getServerName();
  var Type; 

  if (priorRec) {
    if (priorRec.outOfDate) {
      errorMsg += MM.MSG_SBOutOfDate;
    }
    if (priorRec.errorMsg) {
      errorMsg += priorRec.errorMsg;
    }
  }
  
  //set default values to pass to the recordset command
	MM.RecordsetObject = new Object();
	MM.RecordsetObject.name = CreateNewName();
	MM.RecordsetObject.sql = '';
	MM.RecordsetObject.paramArray = new Array();
    
  MM.RecordsetDone = false;
  MM.RecordsetOK = false;
  MM.RecordsetSwitchingUI = false;
  if(MM.RecordsetPriorRec == 'undefined') {
  	MM.RecordsetPriorRec = false;
  }
  MM.IsSimpleRecordset = getIsSimpleRecordsetSetting();
  
  //update the settings based on the prior record
  if (priorRec) {
    
    MM.RecordsetPriorRec = priorRec.parameters.rsName;
    MM.RecordsetObject = getRecordsetObject(priorRec);
	// Edited by ACO on 08072002 to keep the recordset Type
    MM.RecordsetObject.subType = priorRec.subType;
    
	// CRA added - 25 October 2004
	// We are looking for 'type' attribute within group edml.
	MM.RecordsetObject.mainType = dw.getExtDataValue(priorRec.getName(), "type");
    
    
    if (MM.IsSimpleRecordset && !isSimpleRecordset(priorRec)) {
      MM.IsSimpleRecordset = false;
    }
    
  }
  else if (MM.recordsetSBDefaults)
  {
    // Check if any default values are set for us (i.e., drag and drop 
    //   operations from the database panel set the default connection
    //   and table name values and invoke the recordset sb).  
		if (!MM.RecordsetPriorRec) {
    MM.RecordsetPriorRec = CreateNewName();
		}
    MM.RecordsetObject = new Object();
    MM.RecordsetObject.name = MM.RecordsetPriorRec;
    MM.RecordsetObject.connectionName = MM.recordsetSBDefaults.connectionName;
    MM.RecordsetObject.sql = MM.recordsetSBDefaults.sql;
    MM.RecordsetObject.paramArray = new Array();
    MM.RecordsetObject.mainType = MM.RecordsetPriorRec;

    // Clear out the default values.
    MM.recordsetSBDefaults = null;
  }
	
	//var Type = getRecordsetType(MM.RecordsetObject.subType);
	if (MM.RecordsetObject && MM.RecordsetObject.mainType) {
		Type = MM.RecordsetObject.mainType;
		MM.recordSetType = findDisplaybleRecordsetType(Type, MM.RecordsetObject);
		MM.RecordsetObject.mainType = null;
	}
	if (!Type) { 
		if (MM.IsSimpleRecordset) {
			Type = "Simple";
		} else {
			Type = "Advanced";
		}
		MM.recordSetType = findDisplaybleRecordsetType(Type,MM.RecordsetObject);
	}
  //the simple/advanced recordset UI loop
  // Edited by BRI
  while (!MM.RecordsetDone) {
    MM.RecordsetDone = true;
    for (i=0;i<MM.rsTypes.length;i++) {
    	if (dw.getDocumentDOM().serverModel.getServerName() == MM.rsTypes[i].serverModel) {
	    	if (MM.rsTypes[i].type.toLowerCase() == MM.recordSetType.toLowerCase()) {
			    dw.runCommand(MM.rsTypes[i].command, errorMsg);
	    		break;
	    	}
	    }
    }
    errorMsg = ""; //clear this because it has already been displayed once
  }
    
  //if OK was pressed on the recordset dialog
  if (MM.RecordsetOK) {
    
    var rsObj = MM.RecordsetObject;

    var paramObj = rsObj;
    
    // If the user changed the name of the recordset, he/she probably wants
    //   all references to that recordset updated as well. Help user perform
    //   these updates by setting the find/replace dialog to replace all references
    //   in the document. 
    //   Note: the call to showFindReplaceDialog is non-blocking. So, the
    //   SB functions will finish up first and leave the Find/Replace dialog up for the
    //   user to work with.
    //   Note: if this code is called before the server behavior is updated, it will
    //   cause the recordset name NOT to be updated when the server behavior updates are
    //   applied. Rather, it assumes all recordset name updates for the entire page will be
    //   performed using the find/replace dialog. The idea is that the user probably doesn't
    //   really want to change the recordset name if they don't want to update it's references.
    //   To change this behavior, simply move this code after the recordset update is applied.

    // Only try to update the recordset references if the old name is different
    //   from the new name to apply and if the old name is already used on the
    //   page. 
    if (   MM.RecordsetPriorRec && rsObj.name && MM.RecordsetPriorRec != rsObj.name
        && priorRec
       )
    {
      alert(MM.MSG_UpdateRecordsetRefs);
        
      var searchObject = 
        { searchString: MM.RecordsetPriorRec, 
          replaceString: rsObj.name,
          searchSource: true,
          matchCase: true,
          useRegularExpressions: false,
          ignoreWhitespace: false,
          searchWhat: "document"
        };
                            
      dw.setActiveWindow(dw.getDocumentDOM());                  
      dw.setUpFindReplace(searchObject);
      dw.showFindReplaceDialog();
  
      // Force the recordset name to NOT get updated during apply.
      paramObj.rsName = MM.RecordsetPriorRec;
    }
    else
    {
      //set recordset name
      paramObj.rsName = rsObj.name;
    }
        
    //set the connection information
    paramObj.cname = rsObj.connectionName;

    //set the sql
    paramObj.sql = rsObj.sql;
    
    // IAKT: Added by BRI on 08/07/02
    paramObj.MM_subType = rsObj.subType;

    
    //set the variable arrays
    paramObj.varName = new Array();
    paramObj.defaultValue = new Array();
    paramObj.runtimeValue =  new Array();
    SQLVariableList = "";
    for (var i=0; i < rsObj.paramArray.length; i++) {
	  SQLVariableList+=paramObj.rsName+"__"+rsObj.paramArray[i].name+(i==(rsObj.paramArray.length-1)?"":",");
      paramObj.varName.push(rsObj.paramArray[i].name);
      paramObj.defaultValue.push(rsObj.paramArray[i].defaultVal);
      paramObj.runtimeValue.push(rsObj.paramArray[i].runtimeVal);
    }
	paramObj.SQLVariableList=SQLVariableList;
    //fix up the paramObj with any needed default values
    fixUpParamObjRecordset(paramObj,priorRec);

    //now, apply the behavior
    dwscripts.applySB(paramObj, priorRec);

    //refresh the cache for recordset.
    MMDB.refreshCache(true);
    
    MM.RecordsetApplied = true;
  }

  return "";
}


//*-------------------------------------------------------------------
// FUNCTION:
//   fixUpParamObjRecordset
//
// DESCRIPTION:
//   Sets the default values, and any other required values on the paramObj,
//   prior to calling applySB.
//
// ARGUMENTS:
//   paramObj - A parameter object, with the following attributes:
//     .rsName - the name of the recordset
//     .cname - the name of the connection
//     .unencodedSql - the orignal SQL to encode in the recordset
//     .varName - (optional) an array of recordset variable names
//     .defaultValue - (optional) an array of default values for the variables
//     .runtimeValue - (optional) an array of runtime values for the variables
//     .cursorType - (optional/ASP,JSP) the cursor type
//     .lockType - (optional/ASP,JSP) the lock type
//     .cursorLocation - (optional/ASP) the ASP cursor location
//     .maxRowsValue - (optional/CFML) the maximum rows to return in the query
//     .fetchSize - (optional/JSP) the fetch size
//     .queryTimeout - (optional/JSP) the timeout value for the query
//     
//   priorRec - if we are re-applying, the previous SSRecord for this
//              server behavior
//
// RETURNS:
//   boolean - returns true if all the information necessary for applying
//             is available in the paramObj
//--------------------------------------------------------------------
function fixUpParamObjRecordset(paramObj, priorRec) {
  var retVal = true;
  
  var currServerModel = dw.getDocumentDOM().serverModel.getServerName();
  
  //set recordset name
  if (!paramObj.rsName) {
    if (priorRec.parameters.rsName) {
      paramObj.rsName = priorRec.parameters.rsName;
    } else {
      retVal = false;
    }
  }

  //set the connection information
  if (paramObj.cname == null) {
    if (priorRec.parameters.cname) {
      paramObj.cname = priorRec.parameters.cname;
    } else {
      retVal = false;
    }
  }
    
	if ((priorRec) && (priorRec.parameters.urlformat))
	{
			//set the url format
			paramObj.urlformat = priorRec.parameters.urlformat;
			if (currServerModel == "JSP") 
			{
			  //if the connection relative path begins with '/' it is site relative
				if ((priorRec.parameters.relpath != null) && (priorRec.parameters.relpath[0]=='/'))
				{
					//set the urlformat to virtual
					paramObj.urlformat = "virtual";
				}
			}
	}
	else
	{
		if (paramObj.urlformat == null)
		{
			//set the url format
			paramObj.urlformat = getConnectionsUrlFormat(dw.getDocumentDOM());
		}	  
	}
  

  if (paramObj.relpath == null)
	{	
    paramObj.relpath = getConnectionsPath(paramObj.cname , paramObj.urlformat);
	}

	//for JSP file with "/" serves as virtual url prefix, so change the urlformat to "file"
	if ((currServerModel == "JSP") && ((paramObj.urlformat != null) && (paramObj.urlformat == "virtual")))
	{
		paramObj.urlformat = "file";
	}

  if (paramObj.ext == null)
    paramObj.ext = dw.getDocumentDOM().serverModel.getServerExtension().replace(/\./g, "");
    
    
  //special case the update of connection_ref, to prevent multiple
  // connection statements from being created

  if (priorRec && 
      (priorRec.parameters.relpath != paramObj.relpath ||
       priorRec.parameters.ext != paramObj.ext) &&
      priorRec.parameters.cname == paramObj.cname) {
    priorRec.MM_forcePriorUpdate = "connectionref_statement";
  }


  //set the variable arrays
  if (paramObj.varName == null) {
    if (priorRec) {
      if (priorRec.parameters.varName != null) {
        paramObj.varName = priorRec.parameters.varName;
      } else {
        paramObj.varName = new Array();
      }
    
      if (priorRec.parameters.defaultValue != null) {
        paramObj.defaultValue = priorRec.parameters.defaultValue;
      } else {
        paramObj.defaultValue = new Array();
      }

      if (priorRec.parameters.runtimeValue != null) {
        paramObj.runtimeValue = priorRec.parameters.runtimeValue;
      } else {
        paramObj.runtimeValue = new Array();
      }
    }
  }
  
  
  //set the sql with variable references encoded
  if (paramObj.encodedSQL == null) {
    if (paramObj.sql != null) {
      paramObj.encodedSQL = encodeVarRefs(paramObj.sql, paramObj.rsName, paramObj.varName);
    } else if (priorRec && priorRec.parameters.sql != null) {
      paramObj.sql = priorRec.parameters.sql;
      paramObj.encodedSQL = encodeVarRefs(paramObj.sql, paramObj.rsName, paramObj.varName);
    } else {
      retVal = false;
    }
  }


  //set parameters specific to the individual server models
  if (currServerModel == "ASP") {

    if (paramObj.cursorType == null) {
      if (priorRec && priorRec.parameters.cursorType != null) {
        paramObj.cursorType = priorRec.parameters.cursorType;
      } else {
        paramObj.cursorType = 0; /*adOpenForwardOnly*/
      }
    }
        
    if (paramObj.lockType == null) {
      if (priorRec && priorRec.parameters.lockType != null) {
        paramObj.lockType = priorRec.parameters.lockType;
      } else {
        paramObj.lockType = 1; /*adLockReadOnly*/
      }
    }
        
    if (paramObj.cursorLocation == null) {
      if (priorRec && priorRec.parameters.cursorLocation != null) {
        paramObj.cursorLocation = priorRec.parameters.cursorLocation;
      } else {
        paramObj.cursorLocation = 2; /*adUseServer*/
      }
    }
        
  } else if (currServerModel == "Cold Fusion") {

    //strip the # signs from the runtime values
    for (var i=0; i < paramObj.runtimeValue.length; i++) {
      paramObj.runtimeValue[i] = paramObj.runtimeValue[i].replace(/#(.*)#/, "$1");
    }

    if (paramObj.maxRows == null) {
      paramObj.maxRows = ""; //set to blank, in case first time insert
      if (paramObj.maxRowsValue != null) {
        if (paramObj.maxRowsValue == "") {
          //activate the delete pattern for maxrows
          paramObj.maxRowsDelete = "";
        } else if (priorRec && !priorRec.parameters.maxRows) {
          //active the insert pattern for maxrows, if no previous maxrows parameter exists
          paramObj.maxRows = " maxrows=\"" + paramObj.maxRowsValue + "\"";
        }
      } else if (priorRec && priorRec.parameters.maxRowsValue) {
        //preserve the prior value, if no value provided
        paramObj.maxRowsValue = priorRec.parameters.maxRowsValue;
      }
    }
    
  } else if (currServerModel == "JSP") {
    
    if (paramObj.cursorType == null) {
      if (priorRec && priorRec.parameters.cursorType != null) {
        paramObj.cursorType = priorRec.parameters.cursorType;
      } else {
        paramObj.cursorType = "ResultSet.TYPE_FORWARD_ONLY";
      }
    } else if (paramObj.cursorType == "") {
      paramObj.cursorType = "ResultSet.TYPE_FORWARD_ONLY";
    }

    if (paramObj.lockType == null) {
      if (priorRec && priorRec.parameters.lockType != null) {
        paramObj.lockType = priorRec.parameters.lockType;
      } else {
        paramObj.lockType = "ResultSet.CONCUR_READ_ONLY";
      }
    } else if (paramObj.lockType == "") {
      paramObj.lockType = "ResultSet.CONCUR_READ_ONLY";
    }

    if (paramObj.fetchSize == null) {
      if (priorRec && priorRec.parameters.fetchSize != null) {
        paramObj.fetchSize = priorRec.parameters.fetchSize;
      } else {
        paramObj.fetchSize = "0";
      }
    } else if (paramObj.fetchSize == "") {
      paramObj.fetchSize = "0";
    }
      

    if (paramObj.queryTimeout == null) {
      if (priorRec && priorRec.parameters.queryTimeout != null) {
        paramObj.queryTimeout = priorRec.parameters.queryTimeout;
      } else {
        paramObj.queryTimeout = "0";
      }
    } else if (paramObj.queryTimeout == "") {
      paramObj.queryTimeout = "0";
    }
    
    //if any of the values are not default, set the subType
    if (paramObj.cursorType != "ResultSet.TYPE_FORWARD_ONLY" ||
        paramObj.lockType != "ResultSet.CONCUR_READ_ONLY" ||
        paramObj.fetchSize != "0" ||
        paramObj.queryTimeout != "0") {
          
      paramObj.MM_subType = "JDBC2.0";
    }  
  }
  else if (currServerModel == "JRUN 4.0") {

  var aConn = MMDB.getConnection(paramObj.cname);
  if (aConn)
  {
    if (aConn.useJNDI)
    {
      paramObj.MM_subType = "dataSource"; 
    }
    else
    {
      paramObj.MM_subType = "driver"; 
    }
  }   
  }
  
  return retVal;
}
                                 



//*-------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//   populates the UI based on the SSRecord of the current server behavior
//
// ARGUMENTS: 
//   sbObj - the instance of the server behavior to inspect
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function inspectServerBehavior(sbObj) {
  //the recordset command handles inspecting
}



//*-------------------------------------------------------------------
// FUNCTION:
//   deleteServerBehavior
//
// DESCRIPTION:
//   Removes the selected server behavior from the page
//
// ARGUMENTS: 
//   sbObj - the SSRecord of the server behavior to delete
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function deleteServerBehavior(sbObj) {
	var smName = dw.getDocumentDOM().serverModel.getServerName();
	var domCommand;
	var shouldDelete = true;

	for (var j=0; j<MM.rsTypes.length; j++) {
		if (MM.rsTypes[j].serverModel == smName) {
			domCommand = dw.getDocumentDOM(dw.getConfigurationPath() + "/Commands/" + MM.rsTypes[j].command); 
			if (domCommand) {
				windowCommand = domCommand.parentWindow;
				if (windowCommand.onDelete) {
					shouldDelete = shouldDelete & windowCommand.onDelete(sbObj);
				}
			}
		}
	}

	if (shouldDelete) {
		dwscripts.deleteSB(sbObj);
		//refresh the cache for recordset.
		removeCachedSchemaInfo(sbObj.parameters.rsName);
		MMDB.refreshCache(true);
	}

	return shouldDelete;
}


function analyzeServerBehavior(sbObj, allRecs) {
 if (sbObj.rsName == "MM_editCmd") {
   sbObj.deleted = true;
 }
}


//*-------------------------------------------------------------------
// FUNCTION:
//   copyServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function copyServerBehavior(ssRec) {
	var smName = dw.getDocumentDOM().serverModel.getServerName();
	var domCommand;
	var isCopyAllowed = true;

	if (isCopyAllowed) {
		for (var j=0; j<MM.rsTypes.length; j++) {
			if (MM.rsTypes[j].serverModel == smName) {
				domCommand = dw.getDocumentDOM(dw.getConfigurationPath() + "/Commands/" + MM.rsTypes[j].command); 
				if (domCommand) {
					windowCommand = domCommand.parentWindow;
					if (windowCommand.onCopy) {
						isCopyAllowed = isCopyAllowed && windowCommand.onCopy(ssRec);
					}
				}
			}
		}
	}

	if (isCopyAllowed) {
		ssRec.parts = new Array();
  
		for (var i=0; i < ssRec.participants.length; i++) { 
			if (ssRec.participants[i].nodeType == Node.ELEMENT_NODE) {
				var tagStr = ssRec.participants[i].getAttribute("ORIG");
				if (tagStr != null) {
					tagStr = unescape(tagStr);
				} else {
					tagStr = ssRec.participants[i].outerHTML;
				}
				ssRec.parts.push(String(tagStr));
			} else if (ssRec.participants[i].nodeType == Node.COMMENT_NODE) {
				var tagStr = "<!--" + ssRec.participants[i].data + "-->";
				ssRec.parts.push(String(tagStr));
			}
		}
  
		ssRec.cname = ssRec.parameters.cname;
		ssRec.ext = ssRec.parameters.ext;
		ssRec.urlformat = ssRec.parameters.urlformat;

  		isCopyAllowed = isCopyAllowed && (ssRec.parts.length > 0);
	}

  return isCopyAllowed;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   pasteServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function pasteServerBehavior(ssRec) {
	var smName = dw.getDocumentDOM().serverModel.getServerName();
	var domCommand;
	var isPasteAllowed = true;

	for (var j=0; j<MM.rsTypes.length; j++) {
		if (MM.rsTypes[j].serverModel == smName) {
			domCommand = dw.getDocumentDOM(dw.getConfigurationPath() + "/Commands/" + MM.rsTypes[j].command); 
			if (domCommand) {
				windowCommand = domCommand.parentWindow;
				if (windowCommand.onPaste) {
					isPasteAllowed = isPasteAllowed & windowCommand.onPaste(sbObj);
				}
			}
		}
	}

	if (isPasteAllowed) {
		var i, tagStr, chunk, editList = new SSEdits();
		var rsName = ssRec.rsName;
		var allSSRecs = dw.serverBehaviorInspector.getServerBehaviors();
		var currServerModel = dw.getDocumentDOM().serverModel.getServerName();

		if (IsDupeObjectName(ssRec.rsName)) rsName = CreateNewName(); //ensure name is unique

		for (i=0; ssRec.parts && i<ssRec.parts.length; i++) {
			chunk = ssRec.parts[i];
			if (rsName != ssRec.rsName) {
				chunk = chunk.replace(RegExp("\\b"+ssRec.rsName+"\\b","g"),rsName);   //replace old name with new one
				chunk = chunk.replace(RegExp("\\b"+ssRec.rsName+"_","g"),rsName+"_"); //replace old name_ with new one
				if (currServerModel == "JSP") {
					chunk = chunk.replace(RegExp("\\b(Driver|Conn|Statement)" + ssRec.rsName + "\\b","g"), "$1" + rsName)
				}
			}
			var addChunk = true;

			//for connection participant, don't add again if already exists
			if (ssRec.types[i].indexOf("connection") != -1) {
      
				//create the needed connection chunk
				var connPart = new Participant("connectionref_statement");
				var paramObj = new Object();
				paramObj.cname = ssRec.cname;
				paramObj.ext = ssRec.ext;
				paramObj.urlformat = ssRec.urlformat;
				paramObj.relpath = getConnectionsPath(paramObj.cname,paramObj.urlformat);
				chunk = connPart.getInsertString(paramObj, "aboveHTML");
      
				var partList = dw.getParticipants("connectionref_statement");
				for (var j=0; partList && j < partList.length; j++) {
					if (partList[j].parameters.cname == ssRec.cname) {
						addChunk = false;
						break;
					}
				}
      
			}

			if (addChunk) {
				editList.add(chunk, "", ssRec.weights[i]);
			}
		}
		editList.insert(true);
	}
}


//***************** LOCAL FUNCTIONS  ******************


//*-------------------------------------------------------------------
// FUNCTION:
//   canAddPartToGroup
//
// DESCRIPTION:
//   This function is used to override the standard matching
//   function used in findSBs
//
//   For Cold Fusion we need to do special checks for the 
//   cfparam variable tags.  Multiple ones of these can belong to
//   each behavior.
//
// ARGUMENTS:
//   groupedPartList - a list of parts in the current group
//   part - the part we are testing for compatibility with the
//          groupedPartList
//   partList - the list of all the found parts for this server behavior
//
// RETURNS:
//   boolean or null - null means use the standard matching function,
//      true means include this part in the given group, false means
//      don't include this part in the given group
//--------------------------------------------------------------------
function canAddPartToGroup(partGroup, part, partList) {
  var retVal = null;
  
  if (part.participantName == "recordset_varDefault") {
    retVal = false;
    //check if this is valid
    for (var i=0; i < partList.length; i++) {
      if (partList[i].participantName == "recordset_variable") {
        if (partList[i].parameters.runtimeValue == part.parameters.runtimeValue &&
            isPartOfRecordset(partGroup, partList[i])) {
          //found a match, return true;
          retVal = true;
          break;
        }
      }
    }
  } else if (part.participantName == "recordset_variable") {
    retVal = isPartOfRecordset(partGroup, part);
  }
  
  return retVal;
}

//*-------------------------------------------------------------------
// FUNCTION:
//   isPartOfRecordset
//
// DESCRIPTION:
//   Checks if the given part belongs to the recordset_main particiapnt
//
// ARGUMENTS: 
//   groupedPartList - the part list containing the participants in
//                     the group
//   part - the part to match
//
// RETURNS:
//   boolean - true if it belongs, false otherwise
//--------------------------------------------------------------------
function isPartOfRecordset(partGroup, part) {
  var retVal = false;
  
  for (var i=0; i < partGroup.length; i++) {
    if (partGroup[i].participantName.match(/recordset_main/i) && 
		part.parameters.rsName == partGroup[i].parameters.rsName) {
      retVal = true;
      break;
    }
  }
  
  return retVal;
}



//*-------------------------------------------------------------------
// FUNCTION:
//   encodeVarRefs
//
// DESCRIPTION:
//   This function replaces the variable references in the SQL string
//   with the correct code for the current server model.
//
// ARGUMENTS: 
//   theSQL - the SQL string from the UI
//   rsName - the name of the recordset
//   varNameArray - the array of variable names to encode
//
// RETURNS:
//   string - the SQL string with variable references encoded
//--------------------------------------------------------------------
function encodeVarRefs(theSQL, rsName, varNameArray)
{
  var retVal = theSQL;

  //strip out all new lines and CRs.
  retVal = retVal.replace(/[\n\r]/g," ");
  
  //convert any variables
  if (varNameArray.length != 0) {
    
    //convert each variable reference
    for (var i=0; i < varNameArray.length; i++) {
      
      var varName = varNameArray[i];
      var varExpr = new RegExp("\\b" + varName + "\\b","ig");
      
      var sqlVar = new Participant("recordset_sqlVar");
      
      var paramObj = new Object();
      paramObj.rsName = rsName;
      paramObj.varName = varName;
      
      var newVal = sqlVar.getInsertString(paramObj);
      
      retVal = retVal.replace(varExpr, newVal);
    }
    
  }
  
  return retVal;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   decodeVarRefs
//
// DESCRIPTION:
//   This function takes the SQL string from the code, and decodes the
//   variable references into a form presentable to the user.  These
//   references are returned in the varArray parameter.
//
// ARGUMENTS:
//   theSQL - the SQL string extracted from the code
//   varArray - an array to populate with the referenced variables
//
// RETURNS:
//   the SQL string with variable references removed
//   sets the varArray with an variables found
//--------------------------------------------------------------------
function decodeVarRefs(theSQL, varNameArray) {
  var retVal = theSQL;
  
  var sqlVar = new Participant("recordset_sqlVar");
  
  var searchExpr = eval(sqlVar.searchPatterns[0].pattern); //get the search expression
  
  if (searchExpr) {
    
    //replace the variable references with the simple var name
    var result, start = 0;
    retVal = "";
    while ( (result = searchExpr.exec(theSQL)) != null) {
      retVal += theSQL.substring(start, result.index) + result[2];
      start = result.index + result[0].length;

      //add this variable to varNameArray, if it is not already there
      for (var i=0; i < varNameArray.length; i++) {
        if (varNameArray[i] == result[2]) break;
      }
      if (i >= varNameArray.length) {
        varNameArray.push(result[2]);
      }
    }
    
  if (theSQL && theSQL.length)
    retVal += theSQL.substring(start);
    
  }
  
  return retVal;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   getRecordsetObject
//
// DESCRIPTION:
//   Returns the object which is passed the Recordset command for
//   editing
//
// ARGUMENTS: 
//   sbObj - the SSRecord of the recordset to send to the UI
//
// RETURNS:
//   a recordset object for the Recordset command
//--------------------------------------------------------------------
function getRecordsetObject(sbObj)
{
  var theObj = new Object()
    
	theObj = sbObj.parameters;
  theObj.name = sbObj.parameters.rsName;
  theObj.connectionName = sbObj.connectionName;
  theObj.sql = sbObj.parameters.sql;
  
  theObj.paramArray = new Array()

  if (sbObj.ParamArray) {
    for (var i=0; i < sbObj.ParamArray.length; i++) {
      var newParam = new Object();
      var oldParam = sbObj.ParamArray[i];       
      newParam.name = oldParam.name;
      newParam.defaultVal = oldParam.value;
      newParam.runtimeVal = oldParam.runTime;
      theObj.paramArray[i] = newParam;
    }
  }

  return theObj
}


//*-------------------------------------------------------------------
// FUNCTION:
//   isSimpleRecordset
//
// DESCRIPTION:
//   Returns true if the given recordset can be displayed in the
//   simple recordset dialog
//
// ARGUMENTS: 
//   sbObj - the SSRecord of the recordset to check for simplicity
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function isSimpleRecordset(sbObj) {
  var retVal = false;
  var sqlObj = ParseSimpleSQL(sbObj.parameters.sql);
  
  retVal = (sqlObj && 
            (!sqlObj.filterColumn || 
             (sqlObj.filterVal == gSimpleParamName &&
              sbObj.ParamArray.length == 1 &&
              sbObj.ParamArray[0].name == gSimpleParamName)));
              
  if (retVal && sbObj.ParamArray.length == 1)
  {
    var param = new Object();
    param.runtimeVal = sbObj.ParamArray[0].runTime;
    param.defaultVal = sbObj.ParamArray[0].value;
    
    var paramType = GetParamTypeAndName(param, sbObj.rsName);
    
    if (!paramType)
    {
      retVal = false;
    }
  }

  return retVal;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   getIsSimpleRecordsetSetting
//
// DESCRIPTION:
//   Returns the value of the isSimpleRecordset setting from the
//   Design note.  (This should be moved to the Recordset command)
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function getIsSimpleRecordsetSetting()
{
  var retVal = true;

  var path = dreamweaver.getConfigurationPath() + '/ServerBehaviors/Shared/RSSeverModelSwitches.js';
  var metaFile = MMNotes.open(path, false);
  
  if (metaFile) {
    
    var rsType = MMNotes.get(metaFile, 'PREF_rsType');

	//[bug 189267 akishnani]ASP/JSP: Recordset always opens in "Simple" mode  
	//change it to upper case 
	rsType = rsType.toUpperCase();

    if (rsType == "ADVANCED") {
      retVal = false;
    }
    
    MMNotes.close(metaFile);
  }

  return retVal;
}


function getRecordsetType(type)
{
  var retVal = "";

  var path = dreamweaver.getConfigurationPath() + '/ServerBehaviors/Shared/RSSeverModelSwitches.js';
  var metaFile = MMNotes.open(path, false);
  
  if (metaFile) {
    var rsType = MMNotes.get(metaFile, 'PREF_rsType');
    retVal = rsType;
    MMNotes.close(metaFile);
  }
  
  if (retVal == '') {
  	retVal = 'Simple';
  }
  
  return retVal;
}

//*-------------------------------------------------------------------
// FUNCTION:
//   findDisplaybleRecordsetType
//
// DESCRIPTION:
//  finds a recordset type that can diplay the current Recordset Object
//
// ARGUMENTS: 
//   preferredType - string - usual the last recordset type that has been displayed. If the preferredType cannot display the recordset we searchy through all the types to find one
//   rsObj - Recordset Object
//
// RETURNS:
//   a type that can display the recordset 
//--------------------------------------------------------------------

function findDisplaybleRecordsetType(preferredType,rsObj) {
	displayIndex = 0;
	var curModel = dw.getDocumentDOM().serverModel.getServerName();
	for (i = MM.rsTypes.length-1; i >=0;i--) {
		if (MM.rsTypes[i].serverModel == curModel) {
			if (recordsetDialog.canDialogDisplayRecordset(MM.rsTypes[i].command,rsObj)) {
				displayIndex = i;
				if (MM.rsTypes[i].type.toLowerCase() == preferredType.toLowerCase()) {
					return preferredType;
				}
			}
		}
	}
	return MM.rsTypes[displayIndex].type;
}