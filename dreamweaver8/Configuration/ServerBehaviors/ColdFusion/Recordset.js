// Copyright 2001-2005 Macromedia, Inc. All rights reserved.
//******************* API **********************

//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//   Prepare the dialog and controls for user input
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function initializeUI()
{
}


//--------------------------------------------------------------------
// FUNCTION:
//   findServerBehaviors
//
// DESCRIPTION:
//   Returns an array of ServerBehavior objects, each one representing
//   an instance of this Server Behavior on the page
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   JavaScript Array of ServerBehavior objects
//--------------------------------------------------------------------
function findServerBehaviors()
{
  var sbList = dwscripts.findSBs(MM.LABEL_TitleRecordset + " (@@RecordsetName@@)", SBRecordsetCF);
  var rss = new Array();

	for (var i=0; i < sbList.length; i++) {
		var rsName = sbList[i].getParameter("RecordsetName");
		if(rss[rsName]) {
			rss[rsName]++;
		} else {
			rss[rsName] = 1;
		}
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
		//fill specific parameters for every rsType
		for (var j = 0;j < MM.rsTypes.length;j++) {
			if (MM.rsTypes[j].serverModel == dw.getDocumentDOM().serverModel.getServerName()) {
				domCommand = dw.getDocumentDOM(dw.getConfigurationPath() + "/Commands/" + MM.rsTypes[j].command); 
				if (domCommand) {
					windowCommand = domCommand.parentWindow;
					if (windowCommand.fillAditionalParameters) {
						sbList[i] = windowCommand.fillAditionalParameters(sbList[i]);
					}
				}
			}
		}
	}
 

  for (var i=0; i < sbList.length; i++)
  {
    if (!sbList[i].getSQLForRecordsetBindings())    {
      sbList[i].setTitle(MM.LABEL_TitleCFQuery + " (" + sbList[i].getRecordsetName() + ")");
    }
    
    var rsName = sbList[i].getParameter("RecordsetName");
    if (rss[rsName] > 1) {
    	// delete the common one
    	if(sbList[i].name == 'Recordset') {
			sbList[i].deleted = true;
    	}
    }
    
    // Remove recordsets whose name begins with MM_
    //  These are created for internal purposes, and should not be displayed.
    if (sbList[i].getParameter("RecordsetName").indexOf("MM_") == 0)    {
      sbList[i].deleted = true;
    }
  }

  return sbList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   canApplyServerBehavior
//
// DESCRIPTION:
//   Returns true if a Server Behavior can be applied to the current
//   document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   boolean - true if the behavior can be applied, false otherwise
//--------------------------------------------------------------------
function canApplyServerBehavior(sbObj)
{
  var success;
    success = dwscripts.canApplySB(sbObj, false); // preventNesting is false

  if (success)
  {
    // If we can't retrieve any CF data sources, ask user to create one before
    //   using this behavior.
    var cfDSNList = MMDB.getColdFusionDsnList();
    if (cfDSNList == null || cfDSNList.length == 0)
    {
      alert(MM.MSG_SBCreateCFDataSource);
      success = false;
    }
  }

  return success;
}


//--------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//   Collects values from the form elements in the dialog box and
//   adds the Server Behavior to the user's document
//
// ARGUMENTS:
//   priorSBRecordset - SBRecordset object - one of the objects returned
//     from findServerBehaviors
//
// RETURNS:
//   string - empty upon success, or an error message
//--------------------------------------------------------------------
function applyServerBehavior(priorSBRecordset) {
	try
	{
		var paramObj = new Object();
		var errStr = "";
		var updateText = "";
		var tagEdit = null;
		var sbObj = priorSBRecordset;
		if (!sbObj) {
			sbObj = new SBRecordsetCF();
				
			// Check if any default values are set for us (i.e., drag and drop 
			//   operations from the database panel set the default connection
			//   and table name values and invoke the recordset sb).  
			if (MM.recordsetSBDefaults) {
				// RST: added to enable the posibility of creating fake SBs to 
				// behave like Recordsets
				sbObj.name = MM.RecordsetPriorRec;
		
				sbObj.setConnectionName(MM.recordsetSBDefaults.connectionName);
				sbObj.setDatabaseCall(MM.recordsetSBDefaults.sql, new Array());
						
				// Clear out the default values.
				MM.recordsetSBDefaults = null;
			}
		}
		var newSBRecordset = recordsetDialog.display(sbObj);
    
		if (newSBRecordset) {
			newSBRecordset.queueCFParamEdits();  
			dwscripts.fixUpSelection(dw.getDocumentDOM(), true, true);
			dwscripts.applySB(newSBRecordset.getParameters(), priorSBRecordset);
	
			// Refresh the cache for recordset.
			MMDB.refreshCache(true);
	
			// CRA moved this code-block 20 lines below...fixed bug: if rsName and filtering variable have changed, no CFARGUMENTS have been added
			// Update references to the recordset on name change.
//		    newSBRecordset.updateRecordsetRefs();
//		    MM.RecordsetApplied = true;
		}
	}
	finally
	{
		// We are building up individual doc edits to apply to the document. If some
		//   JavaScript error occurs, we need to clear leftover edits that didn't
		//   get applied. Otherwise, they'll get added on the next apply.
		dwscripts.clearDocEdits();
    
		if (recordsetDialog.lastCmdFildName) {
			var domCommandFile = dw.getConfigurationPath() + "/Commands/" + recordsetDialog.lastCmdFildName;
			var domCommand = dw.getDocumentDOM(domCommandFile);
			if (domCommand) {
				windowCommand = domCommand.parentWindow;
				if (windowCommand.performFinalOperations) {
					var sqlParams = new Array();
					if (newSBRecordset) {
						newSBRecordset.getDatabaseCall(sqlParams);
					}

					windowCommand.performFinalOperations(newSBRecordset, sbObj, sqlParams);

					// Update references to the recordset on name change.
					if (newSBRecordset) {
						newSBRecordset.updateRecordsetRefs();
						MM.RecordsetApplied = true;
					}
				}
			}
		}
	}

	return errStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//   Sets the values of the form elements in the dialog box based
//   on the given ServerBehavior object
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function inspectServerBehavior(sbObj)
{
}


//--------------------------------------------------------------------
// FUNCTION:
//   deleteServerBehavior
//
// DESCRIPTION:
//   Remove the specified Server Behavior from the user's document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function deleteServerBehavior(sbObj)
{
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
  		if (dwscripts.deleteSB(sbObj))
  		{
    			// Clear out the cache for this recordset.
    			SBDatabaseCall.schemaCache.removeCachedSchemaInfo(sbObj.getRecordsetName());
    			MMDB.refreshCache(true);
		}
	}
}


//--------------------------------------------------------------------
// FUNCTION:
//   analyzeServerBehavior
//
// DESCRIPTION:
//   Performs extra checks needed to determine if the Server Behavior
//   is complete
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//   allRecs - JavaScripts Array of ServerBehavior objects - all of the
//             ServerBehavior objects known to Dreamweaver
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function analyzeServerBehavior(sbObj, allRecs)
{
  sbObj.analyze();
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//   Called from controls to update the dialog based on user input
//
// ARGUMENTS:
//   controlName - string - the name of the control which called us
//   event - string - the name of the event which triggered this call
//           or null
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function updateUI(controlName, event)
{
}


//-------------------------------------------------------------------
// FUNCTION:
//   copyServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function copyServerBehavior(sbObj) 
{
	var smName = dw.getDocumentDOM().serverModel.getServerName();
	var domCommand;
	var isCopyAllowed = true;

	for (var j=0; j<MM.rsTypes.length; j++) {
		if (MM.rsTypes[j].serverModel == smName) {
			domCommand = dw.getDocumentDOM(dw.getConfigurationPath() + "/Commands/" + MM.rsTypes[j].command); 
			if (domCommand) {
				windowCommand = domCommand.parentWindow;
				if (windowCommand.onCopy) {
					isCopyAllowed = isCopyAllowed & windowCommand.onCopy(sbObj);
				}
			}
		}
	}
	
	if (isCopyAllowed) {
		sbObj.preprocessForSerialize();
	}
	
	return isCopyAllowed;
}


//-------------------------------------------------------------------
// FUNCTION:
//   pasteServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function pasteServerBehavior(sbObj) 
{
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
 
	if (isPasteAllowed && sbObj && sbObj.parameterNames) {
  		sbObj.postprocessForDeserialize();
  
  		var rsName = sbObj.getRecordsetName();
  		if (!sbObj.isUniqueRecordsetName(rsName, ""))
  		{
    			rsName = sbObj.getUniqueRecordsetName(); 
    			sbObj.setRecordsetName(rsName);
  		}

  		// Apply the edits.
  		sbObj.queueDocEdits(true);
  		dwscripts.applyDocEdits();
	}
}


//--------------------------------------------------------------------
// FUNCTION:
//   createServerBehaviorObj
//
// DESCRIPTION:
//   This function is called from UltraDev when pasting a ServerBehavior.
//   If you plan to implement copyServerBehavior and pasteServerBehavior for 
//   your SB, you must implement this function to return an empty instance of  
//   the ServerBehavior object or of your subclass of ServerBehavior. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   empty ServerBehavior instance
//--------------------------------------------------------------------
function createServerBehaviorObj()
{
  return new SBRecordsetCF();
}


//--------------------------------------------------------------------
// CLASS:
//   SBRecordsetCF
//
// DESCRIPTION:
//   Subclass of SBDatabaseCall which includes CF recordset specific functionality.
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//   INSPECTORS:
//
//   Overriden functions inherited from SBDatabaseCall:
//
//   CONSTRUCTION:
//
//   initSBRecordsetCF() - base class constructor for subclasses.
//
//   UPDATORS:
//   Overriden SBDatabaseCall functions:
//   queueDocEdits() - schedule the SB edits on the edit list for the page.
//     They are committed when dwscripts.applySB() is called.
//
//   Added functions:
//   queueCFParamEdits() - update the cfparam tags (for sql parameter defaults)
//     in the document.
//
// INCLUDE:
//   ServerBehaviorClass.js
//   SBDatabaseCallClass.js
//   TagEditClass.js
//--------------------------------------------------------------------

function SBRecordsetCF(name, title, selectedNode)
{
  // Array for storing value prompts for sql parameters. If a prompt is defined
  //   for a parameter, it will always be used when getting the test sql (even if
  //   a default value is already defined for the parameter).
  this.paramValuePromptArray = null;

  this.initSBRecordsetCF((name) ? name : "Recordset", title, selectedNode);
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRecordsetCF.initSBRecordsetCF
//
// DESCRIPTION:
//   SBRecordsetCF 'constructor' for subclasses. In JS, subclasses cannot call
//   the base class constructor to initialize it's properties for the subclass
//   instance. Calls directly to the contructor set the base class properties for
//   all instances of the subclass! We provide this init function for subclasses 
//   to call instead of the constructor. Calls to this 'constructor' initialize
//   the base class properties only for the subclass instance. The SBRecordsetCF 
//   constructor calls into this function as well.
//
// ARGUMENTS:
//   name - string. recordset name
//   title - string. 
//   selectedNode - document node ptr. node to select when SB selected in SBPanel.
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function SBRecordsetCF_initSBRecordsetCF(name, title, selectedNode)
{
  // First, initialize base class.
  this.initSBDatabaseCall(name, title, selectedNode);  
}

// Inherit from the SBDatabaseCall class.
SBRecordsetCF.prototype.__proto__ = SBDatabaseCall.prototype;


// PUBLIC METHODS

// Inspectors:
SBRecordsetCF.prototype.getDatabaseCall = SBRecordsetCF_getDatabaseCall;
SBRecordsetCF.prototype.getUserName = SBRecordsetCF_getUserName; 
SBRecordsetCF.prototype.getPassword = SBRecordsetCF_getPassword;
SBRecordsetCF.prototype.getRecordsetBindings = SBRecordsetCF_getRecordsetBindings;

// Updaters:
SBRecordsetCF.prototype.setDatabaseCall = SBRecordsetCF_setDatabaseCall;
SBRecordsetCF.prototype.setPassword = SBRecordsetCF_setPassword; 
SBRecordsetCF.prototype.setUserName = SBRecordsetCF_setUserName; 

SBRecordsetCF.prototype.checkConnectionName = SBRecordsetCF_checkConnectionName;
SBRecordsetCF.prototype.checkDatabaseCall = SBRecordsetCF_checkDatabaseCall;
SBRecordsetCF.prototype.checkPlatformSpecific = SBRecordsetCF_checkPlatformSpecific;
SBRecordsetCF.prototype.queueCFParamEdits = SBRecordsetCF_queueCFParamEdits;
SBRecordsetCF.prototype.queueDocEdits = SBRecordsetCF_queueDocEdits;

// SQL Utilities
SBRecordsetCF.prototype.isSimpleColumnName = SBRecordsetCF_isSimpleColumnName;
SBRecordsetCF.prototype.getSimpleWhereInfo = SBRecordsetCF_getSimpleWhereInfo;
SBRecordsetCF.prototype.getSimpleOrderByInfo = SBRecordsetCF_getSimpleOrderByInfo;
SBRecordsetCF.prototype.addSimpleWhere = SBRecordsetCF_addSimpleWhere;

// Construction
SBRecordsetCF.prototype.initSBRecordsetCF = SBRecordsetCF_initSBRecordsetCF;
SBRecordsetCF.prototype.analyzeConnectionName = SBRecordsetCF_analyzeConnectionName;
SBRecordsetCF.prototype.analyzeDatabaseCall = SBRecordsetCF_analyzeDatabaseCall;
SBRecordsetCF.prototype.analyzePlatformSpecific = SBRecordsetCF_analyzePlatformSpecific;


// PRIVATE METHODS
SBRecordsetCF.prototype.encodeVarRefs = SBRecordsetCF_encodeVarRefs;
SBRecordsetCF.prototype.decodeVarRefs = SBRecordsetCF_decodeVarRefs;
SBRecordsetCF.prototype.stripCFTags = SBRecordsetCF_stripCFTags;
SBRecordsetCF.prototype.replaceParamsWithVals = SBRecordsetCF_replaceParamsWithVals;
SBRecordsetCF.prototype.getSQLForRecordsetBindings = SBRecordsetCF_getSQLForRecordsetBindings;
SBRecordsetCF.prototype.getSQLForTest = SBRecordsetCF_getSQLForTest;

SBRecordsetCF.stripCFIF = SBRecordsetCF_stripCFIF;
SBRecordsetCF.stripCFSWITCH = SBRecordsetCF_stripCFSWITCH;

// PUBLIC PROPERTIES
// CLASS CONSTANTS
// Override of SBDatabaseCall.prototype.EXT_DATA_* constants. Stores names of
// common extension data elements. See SBDatabaseCall.prototype.EXT_DATA_* for 
// details. 
SBRecordsetCF.prototype.EXT_DATA_RS_NAME         = "RecordsetName";
SBRecordsetCF.prototype.EXT_DATA_USER_NAME       = "UserName";
SBRecordsetCF.prototype.EXT_DATA_PASSWORD        = "Password";
SBRecordsetCF.prototype.EXT_DATA_CONN_NAME       = "ConnectionName";
SBRecordsetCF.prototype.EXT_DATA_CONN_PATH       = "ConnectionPath";
SBRecordsetCF.prototype.EXT_DATA_DB_CALL_TEXT    = "SQLStatement";

SBRecordsetCF.prototype.EXT_DATA_SQL_VAR_NAMES   = "VariableNames";
SBRecordsetCF.prototype.EXT_DATA_SQL_VAR_DEFAULT = "VariableDefaults";


//--------------------------------------------------------------------
// FUNCTION:
//   SBRecordsetCF.getDatabaseCall
//
// DESCRIPTION:
//   Get the recordset sql for display to the user. That is, all variable 
//   references are removed. Also get the variable references used.
//
// ARGUMENTS:
//   returnedCallParams - array. Empty array object. 
//
// RETURNS:
//   string - decoded sql. null if not set.
//   returnedCallParams - array. Elements are objects with varName and varDefault
//     properties.
//--------------------------------------------------------------------

function SBRecordsetCF_getDatabaseCall(returnedCallParams)
{
  var decodedSQL = this.getParameter(this.EXT_DATA_DB_CALL_TEXT);
  
  var varRefNames = new Array();
  
  if (returnedCallParams != null)
  {
    // Populate the sql parameters array with the variable values
    var varNames = this.getParameter(this.EXT_DATA_SQL_VAR_NAMES);
    var varDefaults = this.getParameter(this.EXT_DATA_SQL_VAR_DEFAULT);
    for (var j=0; varNames && j < varNames.length; j++) 
    {
      var paramObj = new Object();
      paramObj.varName = varNames[j];

      if (varDefaults[j] != null) 
      {
        paramObj.varDefault = varDefaults[j];
      } 
      else 
      {
        paramObj.varDefault = "";
      }

      returnedCallParams.push(paramObj);
    }
  }

  return decodedSQL;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRecordsetCF.setDatabaseCall
//
// DESCRIPTION:
//   set sql property. also set the parameters referenced in the SQL.
//   if in editable copy, set in preparation for updating the SB instance.
//
// ARGUMENTS:
//   decodedSQL - SQL string without variable references encoded
//   sqlParameters - array. Elements are objects with varName and varDefault
//     properties.
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function SBRecordsetCF_setDatabaseCall(decodedSQL, sqlParameters)
{
  var varNames = new Array();
  var varDefaults = new Array();
  this.paramValuePromptArray = new Array();

  if (sqlParameters != null)
  {
    var paramCount = sqlParameters.length;
    for (var i = 0; i < paramCount; ++i)
    {
      var param = sqlParameters[i];    
      varNames.push(param.varName);
      varDefaults.push(param.varDefault);
      
      // Set the parameter value prompt, if it is set.
      this.paramValuePromptArray.push(param.valuePrompt ? param.valuePrompt : "");
    }
  }

  this.setParameter(this.EXT_DATA_DB_CALL_TEXT, decodedSQL);
  this.setParameter(this.EXT_DATA_SQL_VAR_NAMES, varNames);
  this.setParameter(this.EXT_DATA_SQL_VAR_DEFAULT, varDefaults);
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRecordsetCF.getRecordsetBindings
//
// DESCRIPTION:
//   Get the columns and column types for the recordset returned from the 
//   database call if a recordset is returned. First checks to see if
//   these values are cached. If not, it gets the info from the database and
//   caches the results.
//
// ARGUMENTS: 
//   none
//
// RETURNS:
//   array - even elements (e.g. i) are column names, odd elements (e.g. i+1)
//     are column types. null if no recordset is returned from the database call.
//--------------------------------------------------------------------

function SBRecordsetCF_getRecordsetBindings()
{
  var bindingsAndTypeArray = null;
    
  // Check if the information is in the cache
  bindingsAndTypeArray = 
    SBDatabaseCall.schemaCache.getCachedColumnAndTypeArray(this.getRecordsetName());
  
  if (!bindingsAndTypeArray || !bindingsAndTypeArray.length) 
  {
    // Try to retrieve the information from database
    var connName = dwscripts.getCFDataSourceName(this.getConnectionName());
    
    if (dwscripts.hasServerMarkup(connName))
    {
      bindingsAndTypeArray.push(dwscripts.sprintf("MM_ERROR: " + MM.MSG_NeedCFDataSourceVar, connName));
    }
    else
    {    
      var sql = this.getSQLForRecordsetBindings();

      if (sql)
      {
        bindingsAndTypeArray = MMDB.getColumnAndTypeList(connName, sql);

        // Save it to the cache for future use
        var rsName = this.getRecordsetName();
        SBDatabaseCall.schemaCache.saveColumnAndTypeArrayForCache(rsName, bindingsAndTypeArray);
      }
    }
  }
  
  return bindingsAndTypeArray;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRecordsetCF.encodeVarRefs
//
// DESCRIPTION:
//   Replaces the variable references in the SQL string with the correct code.
//
// ARGUMENTS: 
//   theSQL - the SQL string
//   rsName - the name of the recordset
//   varNameArray - the array of variable names to encode
//
// RETURNS:
//   string - the SQL string with variable references encoded
//--------------------------------------------------------------------

function SBRecordsetCF_encodeVarRefs(theSQL, rsName, varNameArray)
{
  // This function is not used for the ColdFusion subclass.
  return theSQL;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRecordsetCF.decodeVarRefs
//
// DESCRIPTION:
//   Takes an SQL string and decodes the
//   variable references into a form presentable to the user.  These
//   references are returned in the varNameArray parameter.
//
// ARGUMENTS:
//   theSQL - string. the SQL extracted from the code
//   varNameArray - array. Empty array object.
//
// RETURNS:
//   string - the SQL with variable references removed
//   varNameArray - array. Elements are the names of all variables found.
//--------------------------------------------------------------------

function SBRecordsetCF_decodeVarRefs(theSQL, varNameArray) 
{
  // Collect the parameter names that the sql references. The SQL itself does not
  //   need to be decoded.
  var sqlParamRegExp = /#([\w\.\(\)]*)#/g;

  if (varNameArray != null)
  {
    while (sqlParamRegExp.exec(theSQL))
    {
      var caseInsensitiveComp =  new Function("object,searchValue", 
        "return (String(object).toUpperCase() == String(searchValue).toUpperCase());");
      if (dwscripts.findInArray(varNameArray, RegExp.$1, caseInsensitiveComp) == -1)
      {
        varNameArray.push(RegExp.$1);
      }
    }
    sqlParamRegExp.lastIndex = 0;  
  }
  
  return theSQL;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRecordsetCF.analyzeConnectionName
//
// DESCRIPTION:
//   Perform any post-find checks on the Connection name.  Override of base
//   class - ColdFusion does not use connection include files anymore.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBRecordsetCF_analyzeConnectionName()
{
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRecordsetCF.analyzeDatabaseCall
//
// DESCRIPTION:
//   Check that the SQL and SQL parameters are valid
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBRecordsetCF_analyzeDatabaseCall()
{
  // The extension data does not find the sql parameters. So, we must set the
  //  sql parameter information on the recordset object manually. To do this, check 
  //  if any of the cfparam tags in the document are referenced in the recordset sql.
  var dom = dw.getDocumentDOM();
  var paramTags = dom.getElementsByTagName("cfparam");
  
  var sqlParams = new Array();
  var sql = this.getDatabaseCall(sqlParams);
  // Just clear out sqlParams. The sql params are not found using the extension
  //   data.
  sqlParams = new Array();
  
  // Collect the parameter names that the sql references.
  var referencedParams = new Array();
  this.decodeVarRefs(sql, referencedParams);
    
  var caseInsensitiveComp =  new Function("object,searchValue", 
      "return (String(object).toUpperCase() == String(searchValue).toUpperCase());");
  // Cycle through the existing parameter tags.
  for (var j = 0; j < paramTags.length; ++j)
  {
    // If the parameter tag is referenced in the recordset sql, add the
    //   parameter info to the recordset object.
    if (dwscripts.findInArray(referencedParams, paramTags[j].getAttribute("name"),
                              caseInsensitiveComp) != -1
       )
    {
      var param = new Object();
      param.varName = paramTags[j].getAttribute("name"); 
      param.varDefault = paramTags[j].getAttribute("default");
      sqlParams.push(param);
    }
  }
	var cfargumentsfound = false;
	for (var j = 0; j < referencedParams.length; j++) {
		if (referencedParams[j].match(/^arguments\./i)) {
			cfargumentsfound = true;
			break;
		}
	}
	if (cfargumentsfound) {
		var cff = this.getSelectedNode();
		var cfffound = false;
		var j=0;
		while (j++<20 && cff && cff.tagName) {
			if (cff.tagName.toLowerCase() == 'cffunction') {
				cfffound = true;
				break;
			}
			cff = cff.parentNode;
		}
		if (cfffound) {
			var paramTags2 = cff.getElementsByTagName("cfargument");
			var k;
			for (var j = 0; j < referencedParams.length; j++) {
				if (referencedParams[j].match(/^arguments\./i)) {
					var cfargdefval = '-1';
					for (k=0;k<paramTags2.length;k++) {
						if (paramTags2[k].getAttribute('name').toLowerCase() == referencedParams[j].replace(/^arguments\./i, '').toLowerCase()) {
							cfargdefval = paramTags2[k].getAttribute("default");
							break;
						}
					}

					var param = new Object();
					param.varName = referencedParams[j]; 
					param.varDefault = cfargdefval;
					sqlParams.push(param);
				}
			}
		}
	}

  this.setDatabaseCall(sql, sqlParams);    
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRecordsetCF.analyzePlatformSpecific
//
// DESCRIPTION:
//   Check that the platform specific parameters are valid
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBRecordsetCF_analyzePlatformSpecific()
{
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRecordsetCF.checkConnectionName
//
// DESCRIPTION:
//   Checks that the currently assigned Connection name is valid.
//   Also assigns the appropriate connection path. Override of
//   base class function.
//
// ARGUMENTS:
//   bIsForTest - boolean - see description in checkData
//
// RETURNS:
//   boolean - true if the name is valid
//--------------------------------------------------------------------

function SBRecordsetCF_checkConnectionName(bIsForTest)
{
  var isValidRS = true;

  var connName = this.getConnectionName();
  if (!connName)
  {
    isValidRS = false      
    this.appendErrorMessage(MM.MSG_NoCFDataSource);
  }

  return isValidRS;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRecordsetCF.checkDatabaseCall
//
// DESCRIPTION:
//   Check that the entered SQL and SQL parameters are valid.
//
// ARGUMENTS:
//   bIsForTest - boolean - indicates if this check is for the test button
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function SBRecordsetCF_checkDatabaseCall(bIsForTest)
{

  var isValidRS = true;
  
  // Make sure the SQL is a Select statement or call to stored procedure.
  var sqlParams = new Array();
  var theSQL = this.getDatabaseCall(sqlParams);
  if (dwscripts.stripChars(theSQL, " \r\n\t") == "")
  {
    isValidRS = false;
    this.appendErrorMessage(MM.MSG_NoSelectStatement);
  }
  else if (bIsForTest)
  {
    var sqlObj = new SQLStatement(theSQL);
    if (   !sqlObj || (sqlObj.getType() != SQLStatement.STMT_TYPE_SELECT 
        && sqlObj.type != SQLStatement.STMT_TYPE_STORED_PROC)
       )
    {
      isValidRS = false;
      this.appendErrorMessage(MM.MSG_NoSelectStatement);
    }
  }

  for (var i = 0; i < sqlParams.length; i++)
  {
    var param = sqlParams[i];
    var theName = dwscripts.trim(param.varName);
    var theDefaultVal = dwscripts.trim(param.varDefault);
    if (theName == "")
    {
      this.appendErrorMessage(MM.MSG_MissingParamNames);
      isValidRS = false;
      // Return here since we need the param name to label further parameter errors.
      return isValidRS;
    }
    else
    {
      var re = new RegExp("\\b" + theName + "\\b", "i");
      if (theSQL.search(re) == -1)
      {
        isValidRS = false;
        this.appendErrorMessage(theName + " " + MM.MSG_InvalidCFParamNameNotInSQL);
      }

      // It is valid to have a default value of '', so don't throw an error
      //   if it is blank.
  
    }
  }

  return isValidRS;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRecordsetCF.checkPlatformSpecific
//
// DESCRIPTION:
//   Check that the platform specific parameters are valid, and provide
//   the proper defaults if no values were provided.
//
// ARGUMENTS:
//   bIsForTest - boolean - indicates if this check is for the test button
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function SBRecordsetCF_checkPlatformSpecific(bIsForText)
{

  var isValidRS = true;

  if (this.getUserName() == null) 
  {
    this.setUserName("");
  }
  if (this.getPassword() == null) 
  {
    this.setPassword("");
  }
  
  return isValidRS;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRecordsetCF.getSQLForRecordsetBindings
//
// DESCRIPTION:
//   Returns the SQL statement that should be used to get the meta data
//   for this Recordset
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - sql statement
//--------------------------------------------------------------------

function SBRecordsetCF_getSQLForRecordsetBindings()
{
	var sqlParams = new Array();
	var sql = this.getDatabaseCall(sqlParams);
	  
  // To keep the fix minimized, we do it for simple SQL Statement 
  //  only.  
  var sqlObj = new SQLStatement(sql);
  var sqlType = sqlObj.getType();
  
  if (sqlType != SQLStatement.STMT_TYPE_STORED_PROC)  {
    sql = sqlObj.getStatementForMMDB();
    sql = this.replaceParamsWithVals(sql, sqlParams);    
  } else  {
    sql = this.replaceParamsWithVals(sql, sqlParams);    
  }

  // if CF variables still exist, just remove them because they
  // will definitely cause an error when we call MMDB.
  if (sql)
  {
    var sqlVarNames = new Array();
    this.decodeVarRefs(sql, sqlVarNames);
    if (sqlVarNames.length > 0)
    {
      // Replace parameter references with the default value.  
      for (var i = 0; i < sqlVarNames.length; i++)
      {    
        var varRef = new RegExp("#" + dwscripts.escRegExpChars(sqlVarNames[i]) + "#","g");
        sql = sql.replace(varRef, "");
      }
    }
  }

  return sql;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRecordsetCF.getSQLForTest
//
// DESCRIPTION:
//   Returns the SQL statement that should be used when displaying 
//   the test dialog.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - sql statement
//--------------------------------------------------------------------

function SBRecordsetCF_getSQLForTest()
{
  // We must replace all variables referenced in the sql with the appropriate
  //   default value.
  // First, get all the variables referenced in the sql.
  var sqlVarNames = new Array();
  var sqlVarDefaults = new Array();

  // Strip out cf tags from the sql.
  var sql = this.getParameter(this.EXT_DATA_DB_CALL_TEXT);
  sql = SBRecordsetCF.stripCFIF(sql);
  sql = SBRecordsetCF.stripCFSWITCH(sql);
  
  // remove SQL comments
  sql = SQLStatement.stripComments(sql);
  
  sql = this.decodeVarRefs(sql, sqlVarNames);  
  
  // Find default values for the variables.
  var varNames = this.getParameter(this.EXT_DATA_SQL_VAR_NAMES);
  var varDefaults = this.getParameter(this.EXT_DATA_SQL_VAR_DEFAULT);
  var dom = dw.getDocumentDOM();
  var paramTags = dom.getElementsByTagName("cfparam");
  for (var i = 0; i < sqlVarNames.length; ++i)
  {
    // If a prompt is defined to ask the user for the default value for this
    //   parameter, use it. Otherwise, try to find the default value.
    if (this.paramValuePromptArray && this.paramValuePromptArray[i])
    {
      MM.paramName = this.paramValuePromptArray[i]
      dw.runCommand("GetTestValue");

      if (MM.clickedOK)
      {
        sqlVarDefaults[i] = MM.retVal;
      }
      else
      {
        // user clicked cancel, so exit and set statement to blank
        sql = "";
        break;
      }
    }
    else
    {
      // If the parameter has a default value entered in the recordset dialog, use
      //   it. Otherwise, check default values of parameters existing in the document.
      var indexFound = dwscripts.findInArray(varNames, sqlVarNames[i]);
      if (indexFound != -1 && varDefaults[indexFound] != null)
      {
        sqlVarDefaults[i] = varDefaults[indexFound];
      }
      else if (paramTags != null)
      {
        for (var j = 0; j < paramTags.length; ++j)
        {
          if (   paramTags[j].getAttribute("name")    == sqlVarNames[i]
              && paramTags[j].getAttribute("default") != null
             )
          {
            sqlVarDefaults[i] = paramTags[j].getAttribute("default");
          }
        }
      }
      
      // If we couldn't find a default value for the parameter, ask the user for
      //   the value to use.
      if (sqlVarDefaults[i] == null)
      {
        MM.paramName = sqlVarNames[i];
        dw.runCommand("GetTestValue");
        if (MM.clickedOK)
        {
          sqlVarDefaults[i] = MM.retVal;
        }
        else
        {
          // user clicked cancel, so exit and set statement to blank
          sql = "";
          break;
        }
      }
    }
    
    // Escape instances of '.
    sqlVarDefaults[i] = sqlVarDefaults[i].replace(/'/g, "''");
  }

  // Replace parameter references with the default value.  
  for (var i = 0; i < sqlVarNames.length; i++)
  {    
    var varRef = new RegExp("#" + dwscripts.escRegExpChars(sqlVarNames[i]) + "#","g");
    sql = sql.replace(varRef, sqlVarDefaults[i]);
  }

  return sql;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRecordsetCF.stripCFIF
//
// DESCRIPTION:
//   Strip CFIF tags from the sql string. Static function.
//
// ARGUMENTS:
//   sql - string. SQL statement which may or may not contain cfif tags.
//
// RETURNS:
//   string - sql string with cfif tags stripped.
//--------------------------------------------------------------------

function SBRecordsetCF_stripCFIF(sql)
{
  sql = sql.replace(/<cfif[\s\S]*?<\/\s*cfif\s*>/gi, " ");
  return sql;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRecordsetCF.stripCFSWITCH
//
// DESCRIPTION:
//   Strip CFSWITCH tags from the sql string. Static function.
//
// ARGUMENTS:
//   sql - string. SQL statement which may or may not contain CFSWITCH tags.
//
// RETURNS:
//   string - sql string with CFSWITCH tags stripped.
//--------------------------------------------------------------------

function SBRecordsetCF_stripCFSWITCH(sql)
{
  sql = sql.replace(/<cfswitch[\s\S]*?<\/\s*cfswitch\s*>/gi, " ");
  return sql;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRecordsetCF.replaceParamsWithVals
//
// DESCRIPTION:
//   Replace the parameter names in the sql with the associated values.
//   override of a SBDatabaseCall.replaceParamsWithVals
//
// ARGUMENTS:
//   sql - string. sql string in which to replace the parameter names.
//   sqlParams - SQLParameters. describes the parameters in the sql.
//
// RETURNS:
//   string - sql with parameters replaced.
//--------------------------------------------------------------------

function SBRecordsetCF_replaceParamsWithVals(sql, sqlParams)
{
  var statement = sql;
  
  for (var i = 0; i < sqlParams.length; i++)
  {
    var theParam = sqlParams[i];
    var theParamVal = String(theParam.varDefault).replace(/'/g, "''");
    var myRe = new RegExp("#" + theParam.varName + "#","g");
    statement = statement.replace(myRe, theParamVal);
  }
  
  return statement;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRecordsetCF_stripCFTags
//
// DESCRIPTION:
//   Helper function for SBRecordsetCF_getParamObject to strip the CF 
//   directives.
//
// ARGUMENTS:
//   inStr - string. string to strip.
//
// RETURNS:
//   string - with CF directives stripped.
//--------------------------------------------------------------------

function SBRecordsetCF_stripCFTags(inStr)
{
  var theStr = String(inStr);
  theStr = theStr.replace(/(<%=)*/gi,"");    //remove open tags  
  theStr = theStr.replace(/(%>)*/gi,"");  //remove close tags
  return theStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRecordsetCF.getUserName
//
// DESCRIPTION:
//   retrieve the user name
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - user name. null if not set.
//--------------------------------------------------------------------

function SBRecordsetCF_getUserName()
{
  return this.getParameter(this.EXT_DATA_USER_NAME);
}

//--------------------------------------------------------------------
// FUNCTION:
//   SBRecordsetCF.getPassword
//
// DESCRIPTION:
//   retrieve the password 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - password name. null if not set.
//--------------------------------------------------------------------

function SBRecordsetCF_getPassword()
{
  return this.getParameter(this.EXT_DATA_PASSWORD);
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRecordsetCF.setUserName
//
// DESCRIPTION:
//   set the user name for the recordset. if in editable copy, set in preparation for updating
//   the SB instance.
//
// ARGUMENTS:
//   userName - string recordset user name
//
// RETURNS:
//   none
//
// ADDED BY: RCHRISTENSEN
//--------------------------------------------------------------------

function SBRecordsetCF_setUserName(userName)
{
  this.setParameter(this.EXT_DATA_USER_NAME, userName);
}

//--------------------------------------------------------------------
// FUNCTION:
//  SBRecordsetCF.setPassword
//
// DESCRIPTION:
//   set the password for the recordset. if in editable copy, set in preparation for updating
//   the SB instance.
//
// ARGUMENTS:
//   password - string recordset password
//
// RETURNS:
//   none
//
// ADDED BY: RCHRISTENSEN
//--------------------------------------------------------------------

function SBRecordsetCF_setPassword(password)
{
  this.setParameter(this.EXT_DATA_PASSWORD, password);
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBRecordsetCF.queueDocEdits
//
// DESCRIPTION:
//   schedule the SB edits on the edit list for the page. They are committed when
//   dwscripts.applySB() is called. If this is an update of an existing instance,
//   performs manual update. Override of SBDatabaseCall base function.
//
// ARGUMENTS:
//   bIsForPaste - boolean. 'true' if called as part of a pasteServerBehavior
//     operation. Defaults to 'false'.
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBRecordsetCF_queueDocEdits(bIsForPaste)
{
  // First queue up edits to cfparams.
  this.queueCFParamEdits(bIsForPaste);  

  // Ask the user if should update references to the recordset on name change.
  this.updateRecordsetRefs();

  var groupName = dwscripts.getUniqueSBGroupName(this.getParameters(), extGroup.getServerBehaviorFileName(this.name));

  extGroup.queueDocEdits(groupName, this.getParameters(), (this.sbParticipants.length) ? this : null);

}
      

//--------------------------------------------------------------------
// FUNCTION:
//   SBRecordsetCF.queueCFParamEdits
//
// DESCRIPTION:
//   The extension data does not insert or update the sql parameters using  
//   cfparam tags. So, we must manually update these on apply.
//
// ARGUMENTS:
//   bIsForPaste - boolean. 'true' if called as part of a pasteServerBehavior
//     operation. Defaults to 'false'.
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBRecordsetCF_queueCFParamEdits(bIsForPaste)
{
  // If this is a paste operation, we should prompt the user if we need to overwrite
  //   any of the existing cfparams on the page.
  if (bIsForPaste == null)
  {
  	bIsForPaste = false;
  }
  var bPromptForOverwrite = bIsForPaste;
  var updateText = "";
  var sqlParams = new Array();
  this.getDatabaseCall(sqlParams);

  var dom = dw.getDocumentDOM();
  var paramTags = dom.getElementsByTagName("cfparam");

  // Cycle through the parameters in the updated recordset object.
  for (var i = 0; i < sqlParams.length; ++i)
  {
    // Try to find the parameter among the existing cfparams on the page.
    var bPriorNode = false;
    for (var j = 0; j < paramTags.length && !bPriorNode; ++j)
    {
      // If the parameter already exists on the page, update it if needed.
      if (sqlParams[i].varName.toUpperCase() == paramTags[j].getAttribute("name").toUpperCase())
      {
        bPriorNode = true;          
        if (sqlParams[i].varDefault != paramTags[j].getAttribute("default"))
        {
          // Check if we should prompt user for overwrite.
          if (   !bPromptForOverwrite 
              || confirm(dwscripts.sprintf(MM.MSG_ShouldOverwriteParameter, sqlParams[i].varName))
             )
          {
            var tagEdit = new TagEdit(paramTags[j]);
          
            if (sqlParams[i].varDefault != null)
            { 
              tagEdit.setAttribute("default", sqlParams[i].varDefault);
            }
            else
            {
              tagEdit.removeAttribute("default");
            }
          
            updateText = tagEdit.getOuterHTML();
            dwscripts.queueNodeEdit(updateText, paramTags[j]);
          }
        }        
      }      
    }
    
    // If node was not updated, we need to add it.
    if (!bPriorNode)
    {
      var paramObj = new Object();
      paramObj.ParamName = sqlParams[i].varName;
      paramObj.Default = sqlParams[i].varDefault;
      paramObj.ParamType = "";
      if (dw.getDocumentDOM().documentType == "CFC")
      {
        paramObj["MM_location"] = "beforeSelection";
      }
			if (!paramObj.ParamName.match(/^arguments/i)) {
				if (paramObj.ParamName.match(/^[a-z_]/i)) {
      extPart.queueDocEdits("","CFParam_main", paramObj, null);
    }
			}
    }
  }    
}

//--------------------------------------------------------------------
// FUNCTION:
//   isSimpleColumnName
//
// DESCRIPTION:
//   Returns true if the given column name is not a renamed or 
//   calculated column
//
// ARGUMENTS:
//   columnName - string - the column to check
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function SBRecordsetCF_isSimpleColumnName(columnName)
{
  var retVal = false;
  
  var colName = dwscripts.trim(columnName);

  if (colName == '*' || 
      (colName.search(/^[\w\. ]*$/) == 0 && 
       colName.search(/\bas\b/i) == -1)
     )
  {
    retVal = true;
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getSimpleWhereInfo
//
// DESCRIPTION:
//   Returns an object with information about the current where clause,
//   if it is based on a single parameter.
//   Returns an empty object if the where clause is empty, and null 
//   if the where clause is not a simple parameter comparison
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   object - has 4 properties: lval, rval, operator, isString
//--------------------------------------------------------------------

function SBRecordsetCF_getSimpleWhereInfo(sqlObj)
{
  var retVal = null;

  var whereStr = dwscripts.trim(sqlObj.whereClause);

  var info = new Object();
  info.lval = "";
  info.rval = "";
  info.operator = "";
  info.isString = false;

  if (whereStr != "")
  {
    if (whereStr.search(/^\s*([\w\. "]+?)\s*([=><])\s*#?([\w\. ]+?)#?\s*$/) != -1)
    {
      info.lval = RegExp.$1
      info.operator = RegExp.$2
      info.rval = RegExp.$3
    }
    else if (whereStr.search(/^\s*([\w\. "]+?)\s*([=><])\s*'#?([\w\. ]+?)#?'\s*$/) != -1)
    {
      info.lval = RegExp.$1
      info.operator = RegExp.$2
      info.rval = RegExp.$3
      info.isString = true
    }   
    else if (whereStr.search(/^\s*([\w\. "]+?)\s*((<>)|(>=)|(<=))\s*#?([\w\. ]+?)#?\s*$/) != -1)
    {
      info.lval = RegExp.$1
      info.operator = RegExp.$2
      info.rval = RegExp.$6
    }   
    else if (whereStr.search(/^\s*([\w\. "]+?)\s*((<>)|(>=)|(<=))\s*'#?([\w\. ]+?)#?'\s*$/) != -1)
    {
      info.lval = RegExp.$1
      info.operator = RegExp.$2
      info.rval = RegExp.$6
      info.isString = true
    }
    else if (whereStr.search(/^\s*([\w\. "]+?)\s*(like)\s*('%#?([\w\. ]+?)#?%')\s*$/i) != -1)
    {
      info.lval = RegExp.$1
      info.operator = "contains"
      info.rval = RegExp.$4
      info.isString = true
    }
    else if (whereStr.search(/^\s*([\w\. "]+?)\s*(like)\s*('%#?([\w\. ]+?)#?')\s*$/i) != -1)
    {
      info.lval = RegExp.$1
      info.operator = "ends with"
      info.rval = RegExp.$4
      info.isString = true
    }
    else if (whereStr.search(/^\s*([\w\. "]+?)\s*(like)\s*('#?([\w\. ]+?)#?%')\s*$/i) != -1)
    {
      info.lval = RegExp.$1
      info.operator = "begins with"
      info.rval = RegExp.$4
      info.isString = true
    }
    else
    {
      info = null;
    }
  }

  if (info && info.lval)
  {
    info.lval = dwscripts.decodeSQLColumnRef(info.lval);
  }

  retVal = info;

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   addSimpleWhere
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function SBRecordsetCF_addSimpleWhere(sqlObj, columnName, operatorType, parameterName)
{
  switch (operatorType)
  {
  case "=":
  case ">":
  case "<":
  case ">=":
  case "<=":
  case "<>":
    sqlObj.whereClause = dwscripts.encodeSQLColumnRef("", columnName) + " " + operatorType + " " + parameterName;
    break;
  case "begins with":
    sqlObj.whereClause = dwscripts.encodeSQLColumnRef("", columnName) + " LIKE '" + dwscripts.trimQuotes(parameterName) + "%'";
    break;
  case "ends with":
    sqlObj.whereClause = dwscripts.encodeSQLColumnRef("", columnName) + " LIKE '%" + dwscripts.trimQuotes(parameterName) + "'";
    break;
  case "contains":
    sqlObj.whereClause = dwscripts.encodeSQLColumnRef("", columnName) + " LIKE '%" + dwscripts.trimQuotes(parameterName) + "%'";
    break;
  }
  if (sqlObj.whereClause && !sqlObj.whereKeyword)
  {
    sqlObj.whereKeyword = SQLStatement.WHERE_KEYWORD;
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   getSimpleOrderByInfo
//
// DESCRIPTION:
//   Returns an object with information about the current order by clause,
//   if it is based on a single column.
//   Returns an empty object if the where clause is empty, and null if 
//   the order by clause is not a single column
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   objcet - 2 parameters: column, direction
//--------------------------------------------------------------------

function SBRecordsetCF_getSimpleOrderByInfo(sqlObj)
{
  var retVal = null;

  var orderByStr = dwscripts.trim(sqlObj.orderByClause);

  var info = new Object();
  info.column = "";
  info.direction = "";

  if (orderByStr != "")
  {
    // Note: The order of these regexp checks is important. The third regexp matches
    //   the case where no order (ASC, DESC) is specified; however, it will match 
    //   the first two cases where an order is specified. When matching these cases,
    //   it extracts the incorrect value for the column. So, we perform the more 
    //   specific regexp matches first.
    if (orderByStr.search(/^\s*([\w\. "]+)\s+asc\s*$/i) != -1)
    {
      info.column = RegExp.$1    
      info.direction = "ASC"
    }
    else if (orderByStr.search(/^\s*([\w\. "]+)\s+desc\s*$/i) != -1)
    {
      info.column = RegExp.$1    
      info.direction = "DESC"
    }
    else if (orderByStr.search(/^\s*([\w\. "]+)\s*$/i) != -1)
    {
      info.column = RegExp.$1    
      info.direction = "ASC"
    }
    else
    {
      info = null;
    }
    
    if (info && info.column)
    {
      info.column = dwscripts.decodeSQLColumnRef(info.column);
    }
    
    retVal = info;
  }
  else
  {
    retVal = new Object();
  }

  return retVal;
}


