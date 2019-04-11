// SHARE-IN-MEMORY=true

// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.


// File SBDatabaseCallClass.js
//   Classes defined: SBDatabaseCall

//--------------------------------------------------------------------
// CLASS:
//   SBDatabaseCall
//
// DESCRIPTION:
//
//   Subclass of ServerBehavior which includes functionality specific to making
//   Database calls (e.g., calling a stored procedure, using SQL to return a 
//   recordset, etc.). This is an abstract base class, meaning that it may
//   not be instantiated and used on its own. To use it, you must 
//   subclass SBDatabaseCall and implement the placeholder functions.
//
//   Here's a list of the functions and data members that subclasses 
//   must override (Check the function headers for more details):
//
//     getDatabaseCall()
//     setDatabaseCall()
//
//     getSQLForRecordsetBindings()
//     getSQLForTest()
//
//   Here is a list of functions and data members that subclasses will
//   probably wnat to override:
//
//     getCallObjectName()
//     setCallObjectName()
//     isCallObject()
//
//     analyzeDatabaseCall()
//     analyzePlatformSpecific()
//
//     checkDatabaseCall()
//     checkPlatformSpecific()
//
//     SBDatabaseCall.prototype.EXT_DATA_* constants
//
//
// PUBLIC PROPERTIES:
//
//
// PUBLIC FUNCTIONS:
//
//   INSPECTORS:
//
//   Inherited from ServerBehavior class:
//   getTitle() - get the string to be displayed in the SBI
//   getSelectedNode() - get a pointer to the node that should be 
//      highlighted when the SB instance is selected in the SBI.
//   getServerBehaviorFileName() - get SB filename from ext data.
//   getDataSourceFileName() - get DS filename from ext data.
//   getSubType() - get subtype from ext data.
//   getName() - get SB name, used by other SBs to identify each
//      SB instance.
//   getVersion() - get the SB version number from ext data.
//   getParticipantCount() - get the number of participants.
//   getIndexedSBPart(index) - get SBParticipant from zero based 
//      index into count from getParticipantCount().
//   getNamedSBPart(name, node=NULL) - get SBParticipant from 
//      name (and optionally node).
//   getParticipants() - get SBParticipant list
//   getIsIncomplete() - get flag indicating that a SB instance is
//      incomplete. If true, the SBI displays a red !.
//   getParameterNames() - get list of user-defined property names.
//   getParameter(name) - get value of user-defined property.
//   getParameters() - get user-defined properties, the parameter object.
//   getErrorMessage() - get current error message.
//   getWrapSelectionOffsets(groupName) - if the group describes a
//      server behavior which wraps the selection, then return the
//      document offsets of that region
//   getIsEmpty() - determine if SB has any data.
//   getForceMultipleUpdate()
//   getFamily()
//   getForcePriorUpdate()
//
//   New in SBDatabaseCall class:
//   getCallObjectName() - name of the object, such as a command or stored 
//     procedure, making the database call. Empty if this is a direct database 
//     query (e.g., a SQL statement).
//   isCallObject() - true if an object, such as a command or stored procedure,
//     is making the database call. false if this is a direct database query (e.g.,
//     a SQL statement).
//   getRecordsetName()
//   getConnectionName() 
//   getDatabaseCall(returnedCallParams) - return the text used to invoke a database
//     action in a format presentable to the user. Also, return parameters referenced 
//     in the database call text.
//   getRecordsetBindings - get the columns and column types for the
//     recordset returned by the database call if a recordset is returned. uses cache 
//     to speed processing.
//
//   UPDATE EXISTING SB:
//
//   Inherited from ServerBehavior class:
//   makeEditableCopy() - returns an editable copy of the ServerBehavior
//      object. Setting parameters on the copy allow you to update the 
//      existing SB on the page (see queueDocEdit). Should only be called 
//      if ServerBehavior exists on the page.
//   setParameter(name, value) - set user-defined property. Preserves 
//      original parameter object if performed on editable copy.
//      See makeEditableCopy().
//   setParameters(mapNameToVals) - set parameter object. Preserves 
//      original parameter object if performed on editable copy.
//      See makeEditableCopy().
//   checkData() - check that ServerBehavior information is valid.
//   queueDocEdits() - schedule the SB edits on the edit list for the page.
//      They are committed when dwscripts.applySB() is called.
//   deleteSB() - used to delete all participants of the ServerBehavior.
//
//   Overridden ServerBehavior class methods:
//   queueDocEditsForDelete()
//
//   New in SBDatabaseCall class:
//   setCallObjectName(callObjName) - set name of the object, such as a command or  
//     stored procedure, making the database call. Not used if this is a direct 
//     database query (e.g., a SQL statement).
//   setRecordsetName() - set recordset name in preparation for an
//     update 
//   setConnectionName() - set connection name in preparation for
//     an update
//   setDatabaseCall(dbCallText, callParameters) - set the text used to invoke
//     a database action and the parameters referenced in the call text.
//   checkData(bIsForTest) - override of base class method. Check
//     that the recordset information is valid.
//
//   CONSTRUCTION:
//
//   Inherited from ServerBehavior class:
//   initServerBehavior(name, title='', selectedNode=null) - subclasses
//      call this function to initialize the ServerBehavior base class 
//      properties.
//   addParticipant(SBParticipant) - add participant to the ServerBehavior
//   setIsIncomplete(bIsIncomplete) - set flag indicating that a SB
//      instance is incomplete. If true, the SBI displays a red !.
//   setTitle(title) - set the string to be displayed in the SBI.
//   setSelectedNode(node) - set pointer to the node that should be 
//      highlighted when the SB instance is selected in the SBI.
//   setErrorMessage(msg) - set message about error condition for 
//      others to retrieve.
//   appendErrorMessage(msg) - add to error message for others to retrieve.
//   setForceMultipleUpdate(bForce)
//   setFamily(family)
//   setForcePriorUpdate(partName)
//
//   New in SBDatabaseCall class:
//   initSBDatabaseCall() - subclass constructor
//   analyze() - run in analyzeServerBehavior function
//
//
// INCLUDE:
//   ServerBehaviorClass.js
//--------------------------------------------------------------------

function SBDatabaseCall(name, title, selectedNode)
{
  // SBDatabaseCall is a virtual base class and is not meant to be instantiated.
  //   To make use of SBDatabaseCall, subclass it and implement the empty methods.
  throw dwscripts.sprintf(MM.MSG_createVitualClass, "SBDatabaseCall");

  //this.initSBDatabaseCall(name, title, selectedNode);
}


//--------------------------------------------------------------------
// FUNCTION:
//   initSBDatabaseCall
//
// DESCRIPTION:
//   SBDatabaseCall 'constructor' for subclasses. In JS, subclasses cannot call
//   the base class constructor to initialize it's properties for the subclass
//   instance. Calls directly to the contructor set the base class properties for
//   all instances of the subclass! We provide this init function for subclasses 
//   to call instead of the constructor. Calls to this 'constructor' initialize
//   the base class properties only for the subclass instance. The SBDatabaseCall 
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

function SBDatabaseCall_initSBDatabaseCall(name, title, selectedNode)
{
  this.initServerBehavior(name, title, selectedNode);

  // Initialize a few parameters to default values.
  this.setParameter(this.EXT_DATA_DB_CALL_TEXT, ""); 
}


// Inherit from the ServerBehavior class.
SBDatabaseCall.prototype.__proto__ = ServerBehavior.prototype;


// PUBLIC FUNCTIONS

// Inspectors:
SBDatabaseCall.prototype.getRecordsetName = SBDatabaseCall_getRecordsetName;
SBDatabaseCall.prototype.getConnectionName = SBDatabaseCall_getConnectionName;
SBDatabaseCall.prototype.getDatabaseCall = SBDatabaseCall_getDatabaseCall;
SBDatabaseCall.prototype.getCallObjectName = SBDatabaseCall_getCallObjectName;
SBDatabaseCall.prototype.isCallObject = SBDatabaseCall_isCallObject;
SBDatabaseCall.prototype.getRecordsetBindings = SBDatabaseCall_getRecordsetBindings;

// Update:
SBDatabaseCall.prototype.setRecordsetName = SBDatabaseCall_setRecordsetName;
SBDatabaseCall.prototype.setConnectionName = SBDatabaseCall_setConnectionName;
SBDatabaseCall.prototype.setDatabaseCall = SBDatabaseCall_setDatabaseCall;
SBDatabaseCall.prototype.setCallObjectName = SBDatabaseCall_setCallObjectName;
SBDatabaseCall.prototype.queueDocEditsForDelete = SBDatabaseCall_queueDocEditsForDelete;

SBDatabaseCall.prototype.checkData = SBDatabaseCall_checkData;

// Construction:
SBDatabaseCall.prototype.initSBDatabaseCall = SBDatabaseCall_initSBDatabaseCall;
SBDatabaseCall.prototype.analyze = SBDatabaseCall_analyze;

// UI:
SBDatabaseCall.prototype.updateRecordsetRefs = SBDatabaseCall_updateRecordsetRefs;


// PRIVATE FUNCTIONS
SBDatabaseCall.prototype.getUniqueRecordsetName = SBDatabaseCall_getUniqueRecordsetName;
SBDatabaseCall.prototype.isUniqueRecordsetName = SBDatabaseCall_isUniqueRecordsetName;

SBDatabaseCall.prototype.analyzeRecordsetName = SBDatabaseCall_analyzeRecordsetName;
SBDatabaseCall.prototype.analyzeConnectionName = SBDatabaseCall_analyzeConnectionName;
SBDatabaseCall.prototype.analyzeDatabaseCall = SBDatabaseCall_analyzeDatabaseCall;
SBDatabaseCall.prototype.analyzePlatformSpecific = SBDatabaseCall_analyzePlatformSpecific;

SBDatabaseCall.prototype.checkRecordsetName = SBDatabaseCall_checkRecordsetName;
SBDatabaseCall.prototype.checkConnectionName = SBDatabaseCall_checkConnectionName;
SBDatabaseCall.prototype.IsSiteRelativePath = SBDatabaseCall_IsSiteRelativePath;
SBDatabaseCall.prototype.checkDatabaseCall = SBDatabaseCall_checkDatabaseCall;
SBDatabaseCall.prototype.checkPlatformSpecific = SBDatabaseCall_checkPlatformSpecific;

SBDatabaseCall.prototype.getSQLForRecordsetBindings = SBDatabaseCall_getSQLForRecordsetBindings;
SBDatabaseCall.prototype.getSQLForTest = SBDatabaseCall_getSQLForTest;


// Static functions for schema cache.
SBDatabaseCall.schemaCache = new Object();
SBDatabaseCall.schemaCache.getCachedSchemaInfo = SBDatabaseCall_getCachedSchemaInfo;
SBDatabaseCall.schemaCache.getCachedSchemaKeyInfo = SBDatabaseCall_getCachedSchemaKeyInfo;
SBDatabaseCall.schemaCache.removeCachedSchemaInfo = SBDatabaseCall_removeCachedSchemaInfo;
SBDatabaseCall.schemaCache.writeCachedString = SBDatabaseCall_writeCachedString;
SBDatabaseCall.schemaCache.getCacheURL = SBDatabaseCall_getCacheURL;
SBDatabaseCall.schemaCache.getCachedColumnAndTypeArray = SBDatabaseCall_getCachedColumnAndTypeArray;
SBDatabaseCall.schemaCache.saveColumnAndTypeArrayForCache = SBDatabaseCall_saveColumnAndTypeArrayForCache;
SBDatabaseCall.schemaCache.getCachedParametersArray = SBDatabaseCall_getCachedParametersArray;
SBDatabaseCall.schemaCache.saveParametersForCache = SBDatabaseCall_saveParametersForCache;
SBDatabaseCall.schemaCache.getCachedParamTestValueArray = SBDatabaseCall_getCachedParamTestValueArray;
SBDatabaseCall.schemaCache.saveParamTestValueArrayForCache = SBDatabaseCall_saveParamTestValueArrayForCache;


// CLASS CONSTANTS
//
//  Names of common extension data elements for recordsets. The subclass must
//  override these constants with the names used by the associated recordset 
//  implementation. This allows the class to refer to extension data elements
//  throughout common member functions without assuming specific names.
//  Note: we put these constants on the prototype object because they must be
//  overriden by the subclass before initSBDatabaseCall() is called. Some initializations
//  that take place in initSBDatabaseCall() require that these data members be set 
//  to the appropriate values. If they were just member variables, the subclass
//  must override/define them before initSBDatabaseCall() is called. Placing them on
//  the prototype object forces them to be defined prior to construction.

SBDatabaseCall.prototype.EXT_DATA_CALL_OBJ_NAME   = "";
SBDatabaseCall.prototype.EXT_DATA_RS_NAME         = "RecordsetName";
SBDatabaseCall.prototype.EXT_DATA_CONN_NAME       = "ConnectionName";
SBDatabaseCall.prototype.EXT_DATA_CONN_PATH       = "ConnectionPath";
SBDatabaseCall.prototype.EXT_DATA_DB_CALL_TEXT    = "SQLStatement";


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.getRecordsetName
//
// DESCRIPTION:
//   retrieve the recordset name
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - recordset name. null if not set.
//--------------------------------------------------------------------

function SBDatabaseCall_getRecordsetName()
{
  return this.getParameter(this.EXT_DATA_RS_NAME);
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.getConnectionName
//
// DESCRIPTION:
//   retrieve the connection name for the recordset
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - connection name. null if not set.
//--------------------------------------------------------------------

function SBDatabaseCall_getConnectionName()
{
  return this.getParameter(this.EXT_DATA_CONN_NAME);
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.getCallObjectName
//
// DESCRIPTION:
//   Get name of the object, such as a command or stored 
//   procedure, making the database call. Empty if this is a direct database 
//   query (e.g., a SQL statement).
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - name of the object. null if not set.
//--------------------------------------------------------------------

function SBDatabaseCall_getCallObjectName()
{
  return this.getParameter(this.EXT_DATA_CALL_OBJ_NAME);
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.isCallObject
//
// DESCRIPTION:
//   return true if an object, such as a command or stored procedure,
//     is making the database call. false if this is a direct database query (e.g.,
//     a SQL statement).
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean - true if object is making the database call.
//--------------------------------------------------------------------

function SBDatabaseCall_isCallObject()
{
  return false; 
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.getDatabaseCall
//
// DESCRIPTION:
//   Get the text used to invoke a database action in a format presentable to 
//   the user. Also, return parameters referenced in the database call text. For
//   example, for a recordset, return the SQL to retrieve a recordset, with parameter 
//   references 'decoded' for display, and the SQL parameters.
//
// ARGUMENTS:
//   returnedCallParams - array of objects. used as output argument. Pass in an empty array
//     to be filled in. The object elements can be anything. The subclass and the associated
//     UI must coordinate its structure. 
//
// RETURNS:
//   string - 'decoded' database call text. null if not set.
//   returnedCallParams - array. contains parameters (and associated properties) 
//     referenced in the database call text.
//--------------------------------------------------------------------

function SBDatabaseCall_getDatabaseCall(returnedCallParams)
{
  throw dwscripts.sprintf(MM.MSG_overrideVirtualFunction, "SBDatabaseCall.getDatabaseCall");
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.setRecordsetName
//
// DESCRIPTION:
//   set the recordset name. if in editable copy, set in preparation for updating
//   the SB instance.
//
// ARGUMENTS:
//   recordsetName - string recordset name
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function SBDatabaseCall_setRecordsetName(recordsetName)
{
  this.setParameter(this.EXT_DATA_RS_NAME, recordsetName);
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.setCallObjectName
//
// DESCRIPTION:
//   Set name of the object, such as a command or stored 
//   procedure, making the database call. Empty if this is a direct database 
//   query (e.g., a SQL statement).
//
// ARGUMENTS:
//   callObjectName - string. name of the object.
//
// RETURNS:
//   
//--------------------------------------------------------------------

function SBDatabaseCall_setCallObjectName(callObjectName)
{
  return this.setParameter(this.EXT_DATA_CALL_OBJ_NAME, callObjectName);
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.setConnectionName
//
// DESCRIPTION:
//   set recordset connection name. if in editable copy, set connection name
//   in preparation for updating the SB instance.
//
// ARGUMENTS:
//   connectionName - string name of connection
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function SBDatabaseCall_setConnectionName(connectionName)
{
  this.setParameter(this.EXT_DATA_CONN_NAME, connectionName);
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.setDatabaseCall
//
// DESCRIPTION:
//   set the text used to invoke a database action and the parameters referenced
//   within the text. The text should be in a form presentable to the user,
//   and the function should format the text to make the database call. For example,
//   for a recordset, receive sql for returning a recordset and format the sql 
//   parameters so the sql is a valid database query.
//   if in editable copy, this is a set in preparation for updating the SB instance.
//
// ARGUMENTS:
//   dbCallText - string. Text to invoke database action.
//   callParameters - array of objects. The object elements can be anything. The 
//     subclass and the associated UI must coordinate its structure. 
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function SBDatabaseCall_setDatabaseCall(dbCallText, callParameters)
{
  throw dwscripts.sprintf(MM.MSG_overrideVirtualFunction, "SBDatabaseCall.setDatabaseCall");
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.analyze
//
// DESCRIPTION:
//   Code that all recordsets must run to analyze the found data in
//   the analyzeServerBehavior function
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function SBDatabaseCall_analyze()
{
  this.analyzeRecordsetName();
  this.analyzeConnectionName();
  this.analyzeDatabaseCall();
  this.analyzePlatformSpecific();
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.analyzeRecordsetName
//
// DESCRIPTION:
//   Perform any post-find checks on the Recordset name
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBDatabaseCall_analyzeRecordsetName()
{
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.analyzeConnectionName
//
// DESCRIPTION:
//   Perform any post-find checks on the Connection name.  Check that
//   the connection path is correct.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBDatabaseCall_analyzeConnectionName()
{
  var dom = dw.getDocumentDOM();
  
  //Check that connection information gathered about the instance is complete
  // only check if this is a saved file
  if (dom && dom.URL &&
      this.getParameter(this.EXT_DATA_CONN_PATH) != 
         dwscripts.getConnectionURL(this.getConnectionName()) &&
      this.getParameter(this.EXT_DATA_CONN_PATH) != 
         dwscripts.getConnectionURL(this.getConnectionName(),true)
     ) 
  {
    this.setIsIncomplete(true);
    this.appendErrorMessage(MM.MSG_ConnectionPathInvalid);
  } 
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.analyzeDatabaseCall
//
// DESCRIPTION:
//   Perform any post-find checks on the Database call and the call parameters.  This
//   should be overridden by subclasses.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBDatabaseCall_analyzeDatabaseCall()
{
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.analyzePlatformSpecific
//
// DESCRIPTION:
//   Perform any post-find checks on platform specific values.  This
//   function should be overridden by subclasses.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBDatabaseCall_analyzePlatformSpecific()
{
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.checkData
//
// DESCRIPTION:
//   override of ServerBehavior.checkData. Determine if the recordset 
//   information is valid. It automatically fills in any missing data 
//   which has a known default value or which can be derived from existing 
//   data. Uses SBDatabaseCall.appendErrorMessage to log any errors. 
//   Subclasses with additional data to check should override 
//   SBDatabaseCall.checkPlatformSpecific. This function is
//   not expected to be overridden.
//
// ARGUMENTS:
//   bIsForTest - boolean. true if checking the recordset for a test only.
//     For a test, we relax the checking. For example, we don't check the 
//     recordset name for duplicates since we are not yet inserting it into
//     the page. Default value is false.
//
// RETURNS:
//   boolean - true if OK. if false, use SBDatabaseCall.getErrorMessage to get
//     the errors.
//--------------------------------------------------------------------

function SBDatabaseCall_checkData(bIsForTest)
{
  // Set default value for argument if not present.
  if (arguments.length == 0)
  {
    var bIsForTest = false;
  }
  
  var isValid = true;
 
  // Clear out the error messages
  this.setErrorMessage("");
  
  // Begin checking the recordset
  isValid = this.checkRecordsetName(bIsForTest) && isValid;
  isValid = this.checkConnectionName(bIsForTest) && isValid;
  
  // If recordset or connection aren't valid, just quit there so our error message
  //   doesn't balloon too much. (Note - this is especially important for simple
  //   recordsets. If the connection name is bad, we won't get a sql statement.
  //   We don't want to popup a 'Bad SQL' error in the simple dialog because users
  //   can't enter SQL there. So bail.)
  if (isValid)
  {
    isValid = this.checkDatabaseCall(bIsForTest) && isValid;
    isValid = this.checkPlatformSpecific(bIsForTest) && isValid;
  }

  return isValid;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.checkRecordsetName
//
// DESCRIPTION:
//   Checks that the currently assigned Recordset name is valid
//
// ARGUMENTS:
//   bIsForTest - boolean - see description in checkData
//
// RETURNS:
//   boolean - true if the name is valid
//--------------------------------------------------------------------

function SBDatabaseCall_checkRecordsetName(bIsForTest)
{
  var isValidRS = true;
  
  if (!bIsForTest)
  {
    // Check for valid recordset name.
    var theName = this.getRecordsetName();
    var oldName = this.parameters[this.EXT_DATA_RS_NAME];

    if (!theName || theName == "")
    {
      isValidRS = false      
      this.appendErrorMessage(MM.MSG_NoRecordsetName);
    }
    else
    {
      if (!dwscripts.isValidVarName(theName))
      {
        isValidRS = false      
        this.appendErrorMessage(MM.MSG_InvalidRecordsetName);
      }
  
      if (!this.isUniqueRecordsetName(theName, oldName))
      {
        isValidRS = false      
        this.appendErrorMessage(MM.MSG_DupeRecordsetName);
      }

      if (dwscripts.isReservedWord(theName))
      {
        isValidRS = false      
        this.appendErrorMessage(dwscripts.sprintf(MM.MSG_ReservedWord, theName));
      }
    }
  }

  return isValidRS;
}

//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.IsSiteRelativePath
//
// DESCRIPTION:
//		returns whether a given connection path is 
//		using a doc-relative or site-relative path
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean - true if the name is valid
//--------------------------------------------------------------------

function SBDatabaseCall_IsSiteRelativePath()
{
  var bSiteRelative = false;
	var databaseConnectionPath = this.getParameter(this.EXT_DATA_CONN_PATH);
	if (databaseConnectionPath == null)
	{
		//default to default site url preference for doc-relative or site-relative
		var aCurrentDoc = dw.getDocumentDOM();
		var urlformatPref = aCurrentDoc.getSiteURLFormatFromDoc();
		if (urlformatPref == "site")
		{
				bSiteRelative = true;
		}
	}
	else
	{
		//preserves the existing format if doc or site relative
		if (databaseConnectionPath.charAt(0) == "/")
		{
				bSiteRelative = true;
		}
	}
  return bSiteRelative;
}

//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.checkConnectionName
//
// DESCRIPTION:
//   Checks that the currently assigned Connection name is valid.
//   Also assigns the appropriate connection path.
//
// ARGUMENTS:
//   bIsForTest - boolean - see description in checkData
//
// RETURNS:
//   boolean - true if the name is valid
//--------------------------------------------------------------------

function SBDatabaseCall_checkConnectionName(bIsForTest, bSiteRelative)
{
  var isValidRS = true;

  var connName = this.getConnectionName();
  if (!connName)
  {
    isValidRS = false      
    this.appendErrorMessage(MM.MSG_MissingConnection);
  }
  else
  {	
		if (bSiteRelative != null)
		{
			this.setParameter(this.EXT_DATA_CONN_PATH, dwscripts.getConnectionURL(connName,bSiteRelative));
		}
		else
		{
			this.setParameter(this.EXT_DATA_CONN_PATH, dwscripts.getConnectionURL(connName));
		}
  }

  return isValidRS;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.checkDatabaseCall
//
// DESCRIPTION:
//   Checks that the database call and call parameters are
//   valid.  This should be overridden by subclasses.
//
// ARGUMENTS:
//   bIsForTest - boolean - see description in checkData
//
// RETURNS:
//   boolean - true if the name is valid
//--------------------------------------------------------------------

function SBDatabaseCall_checkDatabaseCall(bIsForTest)
{
  var isValidRS = true;

  return isValidRS;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.checkPlatformSpecific
//
// DESCRIPTION:
//   Checks that any platform specific values are valid, and assigns
//   defaults if the values have not been provided.
//   This should be overridden by subclasses.
//
// ARGUMENTS:
//   bIsForTest - boolean - see description in checkData
//
// RETURNS:
//   boolean - true if the name is valid
//--------------------------------------------------------------------

function SBDatabaseCall_checkPlatformSpecific(bIsForTest)
{
  var isValidRS = true;

  return isValidRS;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.isUniqueRecordsetName
//
// DESCRIPTION:
//   Determines if the proposed recordset name is the same as an existing object.
//
// ARGUMENTS:
//   newName - string. new recordset name.
//   oldName - string. original recordset name, so we don't count the existing
//     recordset as a duplicate if the name hasn't changed.
//
// RETURNS:
//   boolean - true if newName is a duplicate of an existing object name.
//--------------------------------------------------------------------

function SBDatabaseCall_isUniqueRecordsetName(newName, oldName)
{
  var retVal = true;

  if (newName == oldName) 
  {
    return retVal;
  }
 
  // TODO: we might want to check against Data Sources,
  //       rather than just SBs
  var serverBehaviors = dw.sbi.getServerBehaviors();

  for (var i = 0; i < serverBehaviors.length; i++)
  {
    var thisSB = serverBehaviors[i]
    if (thisSB instanceof SBDatabaseCall)
    {
      // TODO: check might need to be case insensitive
      if (thisSB.getRecordsetName() == newName)
      {
        retVal = false;
        break;
      }
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.getUniqueRecordsetName
//
// DESCRIPTION:
//   Generate a unique name for the recordset.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - recordset name
//--------------------------------------------------------------------

function SBDatabaseCall_getUniqueRecordsetName()
{ 
  var rsName = "";

  var dsList = dwscripts.getDataSourcesByFileName();
  var dsNames = dwscripts.getDataSourceNames(dsList);
  var uniqueName = false;
  var num = 0;
  var baseName = dwscripts.getRecordsetBaseName();

  while (!uniqueName)
  {
    num++;
    rsName = baseName + num;
    uniqueName = true;

    for (var i=0; i < dsNames.length; i++)
    {
      if (dsNames[i].toLowerCase() == rsName.toLowerCase())
      {
        uniqueName = false;
        break;
      }
    }
  }

  return rsName;
}
 

//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.updateRecordsetRefs
//
// DESCRIPTION:
//   If the user changed the name of the recordset, he/she probably wants
//   all references to that recordset updated as well. Help user perform
//   these updates by setting the find/replace dialog to replace all references
//   in the document. 
//   Note: the call to showFindReplaceDialog is non-blocking. So, the
//   SB functions will finish up first and leave the Find/Replace dialog up for the
//   user to work with.
//   Note: if this function is called before the server behavior is updated, it will
//   cause the recordset name NOT to be updated when the server behavior updates are
//   applied. Rather, it assumes all recordset name updates for the entire page will be
//   performed using the find/replace dialog. The idea is that the user probably doesn't
//   really want to change the recordset name if they don't want to update it's references.
//   To change this behavior, simple move this call after the recordset update is applied.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function SBDatabaseCall_updateRecordsetRefs(msg)
{
  // Only try to update the recordset references if the old name is different
  //   from the new name to apply and if the old name is already used on the
  //   page. We could get into a state where we've got an old and new name
  //   on a SBDatabaseCall created from scratch rather than one describing an
  //   instance on the page. So, we add a check for participants here too.
  if (   this.applyParameters && this.parameters
      && this.parameters[this.EXT_DATA_RS_NAME] 
      && this.applyParameters[this.EXT_DATA_RS_NAME]
      && this.applyParameters[this.EXT_DATA_RS_NAME] 
         != this.parameters[this.EXT_DATA_RS_NAME]
      && this.getParticipantCount() > 0
     )
  {
    alert((msg != null) ? msg : MM.MSG_UpdateRecordsetRefs);
      
    var searchObject = 
      { searchString: this.parameters[this.EXT_DATA_RS_NAME], 
        replaceString: this.applyParameters[this.EXT_DATA_RS_NAME],
        searchSource: true,
        matchCase: true,
        useRegularExpressions: false,
        ignoreWhitespace: false,
        searchWhat: "document" 
      };
                       
    // HACK! Actually, it's for mac only, but it doesn't hurt windows. The
    // call to setActiveWindow below should not be required. However, due to
    // a bug in C code, the find dialog will not be populated correctly with
    // our search object unless we make sure the focus is in the document.   
    dw.setActiveWindow(dw.getDocumentDOM());
    dw.setUpFindReplace(searchObject);
    dw.showFindReplaceDialog();

    // Force the recordset name to NOT get updated during apply.
    this.applyParameters[this.EXT_DATA_RS_NAME] = undefined;
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.queueDocEditsForDelete
//
// DESCRIPTION:
//   Schedule the SB edits required to delete this server behavior.
//   They are commited when dwscripts.applyDocEdits() is called.
//   Tries to determine if any other server behaviors on the page depend on
//   this one. If so, warns user and allows user to cancel the delete.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean - true if queue was successful.
//--------------------------------------------------------------------

function SBDatabaseCall_queueDocEditsForDelete()
{
  // Cycle through the SBs on the page. Look for the recordset name in the other
  //   SB parameter object. If present, assume the SB depends on the recordset
  //   and warn the user.
  var rsName = this.getRecordsetName();
  var bContinueDelete = true;
  if (rsName)
  {
    var sbList = dw.sbi.getServerBehaviors();
    var bWarnedUser = false;
    for (var i = 0; !bWarnedUser && i < sbList.length; ++i)
    {
      var sbObj = sbList[i];
      
      // Avoid checking against self
      if (this == sbObj)
      {
        continue;
      }
      
      var parameters = null;
      if (sbObj.getParameters)
      {
        parameters = sbObj.getParameters();
      }
      else if (sbObj.parameters)
      {
        // sbObj may be the old SSRecord type - use it's parameter property.
        parameters = sbObj.parameters;
      }
      
      // A parameter value may use the recordset name and additional text. Search
      //   for the rsName within the param values.
      var rsNameRegExp = new RegExp("\\b" + rsName + "\\b");
      for (var param in parameters)
      {
        if (rsNameRegExp.exec(parameters[param]))
        { 
          // Warn user and break out of loop.
          bContinueDelete = confirm(MM.MSG_WarnDependentsOnDelete);
          bWarnedUser = true;
          break;
        }
      }
      
    }
  }
      
  if (bContinueDelete)
  {      
    extGroup.queueDocEditsForDelete(this);
  }

  return bContinueDelete;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.getRecordsetBindings
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

function SBDatabaseCall_getRecordsetBindings()
{
  var bindingsAndTypeArray = null;
    
  // Check if the information is in the cache
  bindingsAndTypeArray = 
    SBDatabaseCall.schemaCache.getCachedColumnAndTypeArray(this.getRecordsetName());
  
  if (!bindingsAndTypeArray || !bindingsAndTypeArray.length) 
  {
    // Try to retrieve the information from database
    var connName = this.getConnectionName();
    
    var sql = this.getSQLForRecordsetBindings();

    bindingsAndTypeArray = MMDB.getColumnAndTypeList(connName, sql)
  
    // Save it to the cache for future use
    var rsName = this.getRecordsetName();
    SBDatabaseCall.schemaCache.saveColumnAndTypeArrayForCache(rsName, bindingsAndTypeArray);
  }
  
  return bindingsAndTypeArray;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.getSQLForRecordsetBindings
//
// DESCRIPTION:
//   Returns the SQL statement that should be used to collect meta data
//   about the Recordset.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - sql statement
//--------------------------------------------------------------------

function SBDatabaseCall_getSQLForRecordsetBindings()
{
  throw dwscripts.sprintf(MM.MSG_overrideVirtualFunction, "SBDatabaseCall.getSQLForRecordsetBindings");
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.getSQLForTest
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

function SBDatabaseCall_getSQLForTest()
{
  throw dwscripts.sprintf(MM.MSG_overrideVirtualFunction, "SBDatabaseCall.getSQLForTest");
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.schemaCache.getCachedSchemaInfo
//
// DESCRIPTION:
//   Get a schema element from the cache for the file. Static function.
//
// ARGUMENTS:
//   fileURL - string. file url of the document
//   key - string. 
//
// RETURNS:
//   string - cached info. null if the element is not present in the cache.
//--------------------------------------------------------------------

function SBDatabaseCall_getCachedSchemaInfo(fileURL,key)
{
  var notes, keys,i;
  var CachedString=null;

  // Make sure the fileURL is valid
  if (!fileURL || !fileURL.length)
    return null;

  // Make sure the key has the UltraDev prefix
  if (key.length < 3 || key.substr(0, 3) != "UD_")
    key = "UD_" + key;

  // If the design note values are not cached in memory, read them from disk
  notesCache = dw.getDocumentDOM().MM_notesCache;
  if (!notesCache || !notesCache.fileURL || notesCache.fileURL != fileURL)
  {
    notesCache = new Object();
    dw.getDocumentDOM().MM_notesCache = notesCache;
    notesCache.fileURL = fileURL;

    // Open the design notes file
    notes = MMNotes.open(fileURL, true);
    if (notes == 0)
      return null;

    // Copy all the UltraDev design notes to the notesCache object
    keys = MMNotes.getKeys(notes);
    for (i = 0; i < keys.length; i++)
    {
      if (keys[i].substr(0, 3) == "UD_")
        notesCache[keys[i]] = MMNotes.get(notes, keys[i]);
    }
    MMNotes.close(notes);
  }

  // Get the design note value that's cached in memory
  CachedString = notesCache[key];
  return (CachedString && CachedString.length) ? CachedString : null;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.schemaCache.getCachedSchemaKeyInfo
//
// DESCRIPTION:
//   Get element from the cached schema for the current document.
//   Static function.
//
// ARGUMENTS:
//   key - string.
//
// RETURNS:
//   string - cached info. null if the element is not present in the cache.
//--------------------------------------------------------------------

function SBDatabaseCall_getCachedSchemaKeyInfo(key)
{
  return SBDatabaseCall.schemaCache.getCachedSchemaInfo(SBDatabaseCall.schemaCache.getCacheURL(),
                                                     key)
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.schemaCache.removeCachedSchemaInfo
//
// DESCRIPTION:
//   Remove the schema element from the cache for the current document.
//   Static function.
//
// ARGUMENTS:
//   key - string.
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBDatabaseCall_removeCachedSchemaInfo(key)
{
  if (key.length < 3 || key.substr(0, 3) != "UD_") 
  {
    key = "UD_" + key;
  }

  var fileURL = SBDatabaseCall.schemaCache.getCacheURL();
  if (fileURL && fileURL.length)
  {
    var notes;
    notes = MMNotes.open(fileURL);
    if (notes != 0)
    {
      MMNotes.remove(notes,key);
      MMNotes.close(notes);
    }
  }

  // Next time we do a get, re-read the Design Notes file
  dw.getDocumentDOM().MM_notesCache = null;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.schemaCache.writeCachedString
//
// DESCRIPTION:
//   This function writes the Cached String for the key/value pair for the
//   file. Static function.
//
// ARGUMENTS:
//   fileURL - string. 
//   key - string.
//   value - string.
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBDatabaseCall_writeCachedString(fileURL,key,value)
{
  if (key.length < 3 || key.substr(0, 3) != "UD_") 
  {
    key = "UD_" + key;
  }

  var notes = 0;

  if (fileURL.length)
  {
    notes = MMNotes.open(fileURL, true);

	if (notes != 0)
	{
	  MMNotes.set(notes, key, value);
      MMNotes.close(notes);
	}
  }

  // Next time we do a get, re-read the Design Notes file
  dw.getDocumentDOM().MM_notesCache = null;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.schemaCache.getCacheURL
//
// DESCRIPTION:
//   Returns the URL of the document if saved or a temporary URL to use for
//   meta information if the document is not saved. Static function.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - fileURL
//--------------------------------------------------------------------

function SBDatabaseCall_getCacheURL()
{
  var fileURL=null;

  var dom = dw.getDocumentDOM();
  
  if (dom) 
  {
    fileURL = dom.URL;
  }

  if (!fileURL.length)
  {
    fileURL = dwscripts.getTempURLForDesignNotes();
  }
  else
  {
    // Just make sure that we've copied over the temporary design notes to the 
    //   permanent set.
    dwscripts.copyDesignNotesFromTempURL();  
  }

  return fileURL;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.schemaCache.getCachedColumnAndTypeArray
//
// DESCRIPTION:
//   get the list of Columns and Type of particular data source from our cache
//   for the current document. Static function.
//
// ARGUMENTS:
//   key - datasource name
//
// RETURNS:
//   array - even elements (e.g. i) are column names, odd elements (e.g. i+1)
//     are column types. if not cached, returns new array.
//--------------------------------------------------------------------

function SBDatabaseCall_getCachedColumnAndTypeArray(key)
{
  var i, elt, index;
  // If the cache is not valid, return an empty array
  if (!MMDB.supportsCache() || MMDB.refreshCache())
    return new Array();

  // Get the name/datatype string out of the cache
  var CachedString = SBDatabaseCall.schemaCache.getCachedSchemaInfo
                       (SBDatabaseCall.schemaCache.getCacheURL(), key);
  if (!CachedString || !CachedString.length)
    return new Array();

  // If the string is an error message, just return it
  if (CachedString.substr(0, 8) == "MM_ERROR")
    return new Array();

  // Split the string into an array
  var CachedArray = dreamweaver.getTokens(CachedString, ",;");

  // Remove the "name" and "datatype" labels from the array
  for (i = 0; i < CachedArray.length; i++)
  {
    elt = CachedArray[i];
    index = elt.indexOf(":");
    if (index != -1)
      CachedArray[i] = elt.substr(index+1);
  }

  return CachedArray;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.schemaCache.saveColumnAndTypeArrayForCache
//
// DESCRIPTION:
//   set the list of Columns and Type of particular data source in our cache
//   for the current document. Static function.
//
// ARGUMENTS:
//   key - datasource name
//   array - even elements (e.g. i) are column names, odd elements (e.g. i+1)
//     are column types. 
//
// RETURNS:
//   string - the string representation of the array that is stored in the cache.
//--------------------------------------------------------------------

function SBDatabaseCall_saveColumnAndTypeArrayForCache(key,ColumnsAndTypeArray)
{
  if (key.length < 3 || key.substr(0, 3) != "UD_") 
  {
    key = "UD_" + key;
  }

  var CachedString = "";
  var fileURL = SBDatabaseCall.schemaCache.getCacheURL();
  if (fileURL && fileURL.length)
  {
    if ((ColumnsAndTypeArray!=null)  && ColumnsAndTypeArray.length)
    {
      for (var i =0 ; i < ColumnsAndTypeArray.length ;i+=2)
      {
        if (i > 0)
        {
          CachedString = CachedString +  ",";
        }

        CachedString = CachedString +  "name:";
        CachedString = CachedString +  ColumnsAndTypeArray[i];
        CachedString = CachedString +  ";datatype:";
        CachedString = CachedString +  ColumnsAndTypeArray[i+1];
      }
    }
  }

  if (CachedString.indexOf("name:MM_ERROR") != -1)
  {
    //We don't make to save anything...
    SBDatabaseCall.schemaCache.removeCachedSchemaInfo(key);
  }
  else
  {
    SBDatabaseCall.schemaCache.writeCachedString(fileURL,key,CachedString);
  }

  return CachedString;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.schemaCache.getCachedParamTestValueArray
//
// DESCRIPTION:
//   get the list of parameter test values of particular data source from our cache
//   for the current document. Static function. Used in conjunction with
//   SBDatabaseCall.schemaCache.saveParamTestValueArrayForCache.
//
// ARGUMENTS:
//   key - datasource name
//
// RETURNS:
//   array - even elements (e.g. i) are param names, odd elements (e.g. i+1)
//     are test values. if not cached, returns new array.
//--------------------------------------------------------------------

function SBDatabaseCall_getCachedParamTestValueArray(key)
{
  var i, elt, index;

  // UD includes schemas prepended to the stored procedure name. However, we still
  //   recognize stored procedure names in the server behavior dialog if the user 
  //   does not use the schema in the code. We also use the stored proc name to store
  //   test values for its input parameters. So, strip off the schema portion of
  //   the stored proc name if there is one. This way, we'll find its test values
  //   whether it includes the schema or not in the source.
  var indexLastDot = key.lastIndexOf(".");
  if (indexLastDot != -1)
  {
    key = key.substr(indexLastDot + 1);
  }
  
  // We prefix key to show this entry is for test values. see 
  //   saveParamTestValueArrayForCache for more details.
  key = "TESTVALUES_" + key;
  
  // Get the name/datatype string out of the cache
  var CachedString = SBDatabaseCall.schemaCache.getCachedSchemaInfo
                       (SBDatabaseCall.schemaCache.getCacheURL(), key);
  if (!CachedString || !CachedString.length)
    return new Array();

  // If the string is an error message, just return it
  if (CachedString.substr(0, 8) == "MM_ERROR")
    return new Array();

  // Split the string into an array
  var CachedArray = dreamweaver.getTokens(CachedString, ",;");

  // Remove the "name" and "testValue" labels from the array
  for (i = 0; i < CachedArray.length; i++)
  {
    elt = CachedArray[i];
    index = elt.indexOf(":");
    if (index != -1)
      CachedArray[i] = elt.substr(index+1);
  }

  return CachedArray;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.schemaCache.saveParamTestValueArrayForCache
//
// DESCRIPTION:
//   set the list of parameter test values of particular data source in our cache
//   for the current document. Static function. Works in conjunction with
//   SBDatabaseCall.schemaCache.getCachedParamTestValueArray.
//
// ARGUMENTS:
//   key - datasource name
//   array - even elements (e.g. i) are param names, odd elements (e.g. i+1)
//     are test values. 
//
// RETURNS:
//   string - the string representation of the array that is stored in the cache.
//--------------------------------------------------------------------

function SBDatabaseCall_saveParamTestValueArrayForCache(key,paramsAndTestValueArray)
{
  if (key.length < 3 || key.substr(0, 3) != "UD_") 
  {
    // UD includes schemas prepended to the stored procedure name. However, we still
    //   recognize stored procedure names in the server behavior dialog if the user 
    //   does not use the schema in the code. We also use the stored proc name to store
    //   test values for its input parameters. So, strip off the schema portion of
    //   the stored proc name if there is one. This way, we'll find its test values
    //   whether it includes the schema or not in the source.
    var indexLastDot = key.lastIndexOf(".");
    if (indexLastDot != -1)
    {
      key = key.substr(indexLastDot + 1);
    }

    // Prefix the key to show that these are test values. We must be careful to
    //   make this cache entry unique in certain instances. For example, say we
    //   are storing the test values for a stored procedure. If the user names the
    //   returned recordset the same as the stored procedure name, the two cache
    //   entries will overwrite one another.
    key = "TESTVALUES_" + key;
  }
    
  fileURL = SBDatabaseCall.schemaCache.getCacheURL();
  if (fileURL && fileURL.length)
  {
    var CachedString = "";

    if ((paramsAndTestValueArray != null)  && paramsAndTestValueArray.length)
    {
      for (var i =0 ; i < paramsAndTestValueArray.length ;i+=2)
      {
        if (i > 0)
        {
          CachedString = CachedString +  ",";
        }

        CachedString = CachedString +  "name:";
        CachedString = CachedString +  paramsAndTestValueArray[i];
        CachedString = CachedString +  ";testValue:";
        CachedString = CachedString +  paramsAndTestValueArray[i+1];
      }
    }
  }

  if (CachedString.indexOf("name:MM_ERROR") != -1)
  {
    //We don't make to save anything...
    SBDatabaseCall.schemaCache.removeCachedSchemaInfo(key);
  }
  else
  {
    SBDatabaseCall.schemaCache.writeCachedString(fileURL,key,CachedString);
  }

  return CachedString;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.schemaCache.getCachedParametersArray
//
// DESCRIPTION:
//   get the list of Parameters for Stored Procedure from our cache for the
//   current document. Static function.
//
// ARGUMENTS:
//   key - datasource name
//
// RETURNS:
//   array - ???
//--------------------------------------------------------------------

function SBDatabaseCall_getCachedParametersArray(key)
{
  return SBDatabaseCall.schemaCache.getCachedColumnAndTypeArray(key)
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBDatabaseCall.schemaCache.saveParametersForCache
//
// DESCRIPTION:
//   Saves Parameters for Stored Procedure in our cache for the current document.
//   Static function.
//
// ARGUMENTS:
//   key - datasource name
//   paramString - ???
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBDatabaseCall_saveParametersForCache(key,ParamString)
{
  if (key.length < 3 || key.substr(0, 3) != "UD_") 
  {
    key = "UD_" + key;
  }

  fileURL = SBDatabaseCall.schemaCache.getCacheURL();

  if (fileURL && fileURL.length)
  {
    if (ParamString.indexOf("name:MM_ERROR") != -1)
    {
      //We don't make to save anything...
      SBDatabaseCall.schemaCache.removeCachedSchemaInfo(key);
    }
    else
    {
      SBDatabaseCall.schemaCache.writeCachedString(fileURL,key,ParamString);
    }
  }
}

