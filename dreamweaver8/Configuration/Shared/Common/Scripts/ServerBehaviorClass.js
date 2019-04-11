// SHARE-IN-MEMORY=true

// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


// File ServerBehaviorClass.js
//   Classes defined: ServerBehavior and SBParticipant

//--------------------------------------------------------------------
// CLASS:
//   ServerBehavior
//
// DESCRIPTION:
//
//   General Usage:
//
//   This class describes a Server Behavior that exists on the page. 
//   It communicates information about the server behavior instance 
//   between your SB implementation and UltraDev.
//
//   Usage within the Server Behavior API:
//
//   findServerBehaviors()    - returns an array of ServerBehaviors, 
//                              one for each SB instance found on the page
//   canApplyServerBehavior() - passed a ServerBehavior only if 
//                              re-opening a SB instance
//   applyServerBehavior()    - passed a ServerBehavior only if 
//                              re-opening a SB instance
//   inspectServerBehavior()  - passed the ServerBehavior for the
//                              selected SB instance
//   deleteServerBehavior()   - passed the ServerBehavior for the 
//                              selected SB instance
//   
//   Data flow for the ServerBehavior API:
//
//    - Whenever the page is translated (after most edits), Dreamweaver 
//      calls your findServerBehaviors(). This code searchs the page for 
//      relevant tags. For each that is found, a ServerBehavior obj is 
//      created, and an array of these ServerBehavior obj's is returned
//      by your findServerBehaviors().  Use dwscripts.findSBs() to perform 
//      the search and to create the ServerBehavior array.
//    - The SBI displays information about the SB instance using properties
//      of the returned ServerBehavior objects. 
//    - If the user selects and deletes an SB instance, 
//      deleteServerBehavior() is called and passed a ServerBehavior obj.
//      Send the ServerBehavior object to dwscripts.deleteSB() to perform
//      the delete.
//    - If the user double-clicks a SB instance to edit it, 
//      inspectServerBehavior() is called and passed the ServerBehavior.
//      This function can get information about the instance and populate 
//      the UI using the ServerBehavior methods .
//    - If the user clicks OK to apply a SB, applyServerBehavior() is 
//      called. This function should add the new server code to the page.
//      If we are re-applying the SB, a prior ServerBehavior obj is passed
//      so that applyServerBehavior() can update existing code instead.
//
//
//   Updating an instance:
//
//   Note that a ServerBehavior class instance is read only. In general, 
//   only findSBs() will construct these objects. Aside from the construction 
//   interface used by findSBs(), no changes can be made to the object.   
//   However, a ServerBehavior instance may be used as the basis for 
//   scheduling edits to the SB it describes on the page. For example, the 
//   repeat region SB may need to set the 'page size' of the recordset on 
//   the page. The repeat region SB could get a handle to the ServerBehavior
//   object describing the recordset, set it's 'page size' parameter,  and 
//   schedule the edit to occur with its own application to the page. To do 
//   this, you must make a copy of the ServerBehavior object using 
//   makeEditableCopy(). You may set parameters on the ServerBehavior object
//   returned from this function, for example:
//
//     sb.setParameter("pageSize", "10")
// 
//   Once setting the new parameters, call queueDocEdits() to schedule 
//   the updates to the document. Calling dwscripts.applySB() for your 
//   SB implementation will commit all the edits to the document. 
//
//
//   New functionality by subclassing:
//
//   SBs may subclass ServerBehavior to include new, or override current,
//   functionality.  For example, a SB might use parameters to communicate
//   with itself. Many SBs set a property to remember the Recordset used, 
//   sb.setParameter("rs", rsName).  Then when inspectServerBehavior() is 
//   called, it can easily determine the recordset to select using 
//   sb.getParameter("rs"). Rather than access this property through the
//   parameters functions, consider introducing a new functions, 
//   setRecordsetName(name) and getRecordsetName(). By subclassing 
//   ServerBehavior and adding these functions, you provide a clean,
//   documented interface for sharing the information among multiple
//   implementations and other interested code blocks. (Note, if your
//   new function sets parameters, consider calling through to the base 
//   class functions for setting parameters).
//   To use the subclass, pass its constructor as the last parameter of 
//   findSBs. See JavaScript documentation for how to subclass.  
//
//
// PUBLIC PROPERTIES:
//
//   There are 4 Required properties. UltraDev accesses these properties 
//   directly.  You should access these using public methods.
//
//   title        - the string to be displayed in the SBI
//   selectedNode - a pointer to the node that should be highlighted when
//                  the SB instance is selected in the SBI
//   incomplete   - a boolean indicating that a SB instance is incomplete. 
//                  If true, the SBI displays a red !.
//   participants - an array of node pointers, one for each SB participant. 
//                  These are used to determine if a SB instance has been 
//                  edited in any way. Also used to determine what should
//                  be deleted.
//
//
// PUBLIC FUNCTIONS:
//
//   INSPECTORS:
//
//    getTitle() - get the string to be displayed in the SBI
//    getSelectedNode() - get a pointer to the node that should be 
//       highlighted when the SB instance is selected in the SBI.
//    getServerBehaviorFileName() - get SB filename from ext data.
//    getDataSourceFileName() - get DS filename from ext data.
//    getSubType() - get subtype from ext data.
//    getName() - get SB name, used by other SBs to identify each
//       SB instance.
//    getVersion() - get the SB version number from ext data.
//    getParticipantCount() - get the number of participants.
//    getIndexedSBPart(index) - get SBParticipant from zero based 
//       index into count from getParticipantCount().
//    getNamedSBPart(name, node=NULL) - get SBParticipant from 
//       name (and optionally node).
//    getParticipants() - get SBParticipant list
//    getIsIncomplete() - get flag indicating that a SB instance is
//       incomplete. If true, the SBI displays a red !.
//    getParameterNames() - get list of user-defined property names.
//    getParameter(name) - get value of user-defined property.
//    getParameters(bCheckData=true) - get user-defined properties, the parameter object.
//    getErrorMessage() - get current error message.
//    getWrapSelectionOffsets(groupName) - if the group describes a
//       server behavior which wraps the selection, then return the
//       document offsets of that region
//    getIsEmpty() - determine if SB has any data.
//    getForceMultipleUpdate()
//    getFamily()
//    getForcePriorUpdate()
//    getPriority()
//
//   UPDATE EXISTING SB:
//
//    makeEditableCopy() - returns an editable copy of the ServerBehavior
//       object. Setting parameters on the copy allow you to update the 
//       existing SB on the page (see queueDocEdit). Should only be called 
//       if ServerBehavior exists on the page.
//    setParameter(name, value) - set user-defined property. Preserves 
//       original parameter object if performed on editable copy.
//       See makeEditableCopy().
//    setParameters(mapNameToVals) - set parameter object. Preserves 
//       original parameter object if performed on editable copy.
//       See makeEditableCopy().
//    checkData() - check that ServerBehavior information is valid.
//    queueDocEdits() - schedule the SB edits on the edit list for the page.
//       They are committed when dwscripts.applySB() is called.
//    deleteSB() - used to delete all participants of the ServerBehavior.
//    removeNamedSBPart() - removes the named paricipant from the 
//       ServerBehavior object
//
//   CONSTRUCTION FUNCTIONS:
//              (to be used only by code constructing ServerBehavior 
//               objects from instances on the page, such as findSBs().)
//
//    ServerBehavior(name, title='', selectedNode=null)
//    initServerBehavior(name, title='', selectedNode=null) - subclasses
//       call this function to initialize the ServerBehavior base class 
//       properties.
//    addParticipant(SBParticipant) - add participant to the ServerBehavior
//    setIsIncomplete(bIsIncomplete) - set flag indicating that a SB
//       instance is incomplete. If true, the SBI displays a red !.
//    setTitle(title) - set the string to be displayed in the SBI.
//    setSelectedNode(node) - set pointer to the node that should be 
//       highlighted when the SB instance is selected in the SBI.
//    setErrorMessage(msg) - set message about error condition for 
//       others to retrieve.
//    appendErrorMessage(msg) - add to error message for others to retrieve.
//    setForceMultipleUpdate(bForce)
//    setFamily(family)
//    setForcePriorUpdate(partName)
//    preprocessForSerialize() - prepare the object for serialization.
//    postprocessForDeserialize() - repair the object after deserialization.
//    deleteIfAlreadyReferenced(allSBs) - sets 'deleted' flag if the main participant
//      node is already referenced by another SB. Only intended for simple, one node
//      server behaviors.
//    setPriorty() - set the priority to be used when deleting SB's in the
//       function above
//    deleteIfSelectedNodeOutsideBody() - sets 'deleted' flag is the main participant
//      node is not located wihtin the body tag of the document.
//
// INCLUDE:
//   dwscriptsExtData.js - for docEdits
//--------------------------------------------------------------------


//--------------------------------------------------------------------
// FUNCTION:
//   ServerBehavior
//
// DESCRIPTION:
//   Constructor function for the ServerBehavior class
//
// ARGUMENTS:
//   name - string - the group file for this server behavior
//   title - string - the title to display in the SB panel
//   selectedNode - DOM node - the node to select when this
//      SB is selected in the SB panel
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function ServerBehavior(name, title, selectedNode) 
{
  // Use the init function for construction.
  this.initServerBehavior(name, title, selectedNode);
}

// Inspectors
ServerBehavior.prototype.getTitle = ServerBehavior_getTitle;
ServerBehavior.prototype.getSelectedNode = ServerBehavior_getSelectedNode;
ServerBehavior.prototype.getServerBehaviorFileName = ServerBehavior_getServerBehaviorFileName;
ServerBehavior.prototype.getDataSourceFileName = ServerBehavior_getDataSourceFileName;
ServerBehavior.prototype.getSubType = ServerBehavior_getSubType;
ServerBehavior.prototype.getName = ServerBehavior_getName;
ServerBehavior.prototype.getParticipantCount = ServerBehavior_getParticipantCount;
ServerBehavior.prototype.getIndexedSBPart = ServerBehavior_getIndexedSBPart;
ServerBehavior.prototype.getNamedSBPart = ServerBehavior_getNamedSBPart;
ServerBehavior.prototype.getParticipants = ServerBehavior_getParticipants;
ServerBehavior.prototype.getIsIncomplete = ServerBehavior_getIsIncomplete;
ServerBehavior.prototype.getParameterNames = ServerBehavior_getParameterNames;
ServerBehavior.prototype.getParameter = ServerBehavior_getParameter;
ServerBehavior.prototype.getParameters = ServerBehavior_getParameters;
ServerBehavior.prototype.getErrorMessage = ServerBehavior_getErrorMessage;
ServerBehavior.prototype.getForceMultipleUpdate = ServerBehavior_getForceMultipleUpdate;
ServerBehavior.prototype.getFamily = ServerBehavior_getFamily;
ServerBehavior.prototype.getForcePriorUpdate = ServerBehavior_getForcePriorUpdate;
ServerBehavior.prototype.toString = ServerBehavior_toString;
ServerBehavior.prototype.getVersion = ServerBehavior_getVersion;
ServerBehavior.prototype.getWrapSelectionOffsets = ServerBehavior_getWrapSelectionOffsets;
ServerBehavior.prototype.getIsEmpty = ServerBehavior_getIsEmpty;
ServerBehavior.prototype.getPriority = ServerBehavior_getPriority;

// Update
ServerBehavior.prototype.makeEditableCopy = ServerBehavior_makeEditableCopy;
ServerBehavior.prototype.queueDocEdits = ServerBehavior_queueDocEdits;
ServerBehavior.prototype.queueDocEditsForDelete = ServerBehavior_queueDocEditsForDelete;
ServerBehavior.prototype.setParameter = ServerBehavior_setParameter;
ServerBehavior.prototype.setParameters = ServerBehavior_setParameters;
ServerBehavior.prototype.checkData = ServerBehavior_checkData;
ServerBehavior.prototype.removeNamedSBPart = ServerBehavior_removeNamedSBPart;

// Construction
ServerBehavior.prototype.initServerBehavior = ServerBehavior_initServerBehavior;
ServerBehavior.prototype.addParticipant = ServerBehavior_addParticipant;
ServerBehavior.prototype.setIsIncomplete = ServerBehavior_setIsIncomplete;
ServerBehavior.prototype.setTitle = ServerBehavior_setTitle;
ServerBehavior.prototype.setSelectedNode = ServerBehavior_setSelectedNode;
ServerBehavior.prototype.setErrorMessage = ServerBehavior_setErrorMessage;
ServerBehavior.prototype.appendErrorMessage = ServerBehavior_appendErrorMessage;
ServerBehavior.prototype.setForceMultipleUpdate = ServerBehavior_setForceMultipleUpdate;
ServerBehavior.prototype.setFamily = ServerBehavior_setFamily;
ServerBehavior.prototype.setForcePriorUpdate = ServerBehavior_setForcePriorUpdate;
ServerBehavior.prototype.preprocessForSerialize = ServerBehavior_preprocessForSerialize;
ServerBehavior.prototype.postprocessForDeserialize = ServerBehavior_postprocessForDeserialize;
ServerBehavior.prototype.deleteIfAlreadyReferenced = ServerBehavior_deleteIfAlreadyReferenced;
ServerBehavior.prototype.setPriority = ServerBehavior_setPriority;
ServerBehavior.prototype.deleteIfSelectedNodeOutsideBody = ServerBehavior_deleteIfSelectedNodeOutsideBody;
ServerBehavior.prototype.makeUD4Compatible = ServerBehavior_makeUD4Compatible;

// Private
ServerBehavior.prototype.handleParamChange = ServerBehavior_handleParamChange;

// Constant used in preprocessForSerialize & postprocessForDeserialize to
//   separate array elements when arrays are converted to strings.
ServerBehavior.ARRAY_SEP_TOKEN = "_TOKENSEP_";


//--------------------------------------------------------------------
// FUNCTION:
//   initServerBehavior
//
// DESCRIPTION:
//   ServerBehavior 'constructor' for subclasses. In JS, subclasses 
//   cannot call the base class constructor to initialize it's 
//   properties for the subclass instance. Calls directly to the 
//   contructor set the base class properties for all instances of the
//   subclass! We provide this init function for subclasses to call
//   instead of the constructor. Calls to this 'constructor' initialize
//   the base class properties only for the subclass instance. The 
//   ServerBehavior constructor calls into this function as well.
//
// ARGUMENTS:
//   name - string - the group file for this server behavior
//   title - string - the title to display in the SB panel
//   selectedNode - DOM node - the node to select when this
//      SB is selected in the SB panel
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function ServerBehavior_initServerBehavior(name, title, selectedNode)
{
  // UD required properties
  this.title = (title) ? title : name; // Default to the SB name if no title.
  this.selectedNode = (selectedNode) ? selectedNode : null;
  this.incomplete = false;
  this.participants = new Array(); // participant nodes

  this.name = name;
  this.parameters = new Object();    
  this.sbParticipants = new Array();
  this.errorMsg = "";
  this.bForceMultipleUpdate = false;
  this.forcePriorUpdate = "";
  this.family = '';
  this.priority = 1;
  
  // Used in deleteSB
  this.deleteList = null;
  this.allSrc = null;

  // Flag to show if in edit mode. edit mode allows users to set parameters
  this.bInEditMode = false; 
  
  // applyParameters is used to store edits to the paramObj. parameters always stores 
  //   the original paramObj. 
  // Note - we really don't need a separate applyParameters array. We could have 
  //   parameter edits apply directly to the parameters object. For now, we separate the
  //   two so we know exactly which parameters are the originals. Also, we can make
  //   applyParameters read-only by default to force users to make a copy of the object
  //   before making edits to it. 
  this.applyParameters = null;
  
  this.watch('applyParameters', this.handleParamChange);
}


//--------------------------------------------------------------------
// FUNCTION:
//   ServerBehavior.makeUD4Compatible
//
// DESCRIPTION:
//   Adds appropriate properties and functions to make this object compatible
//   with the old server behavior object (SSRecord) used in UD4. This function
//   is only used for backward compatibility.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function ServerBehavior_makeUD4Compatible()
{
  this.type           = this.name;
  this.serverBehavior = this.getServerBehaviorFileName();
  this.subType        = this.getSubType();
  this.dataSource     = this.getDataSourceFileName();

  // Build the parallel arrays used to represent SBParticipants in UD4.
  this.params = new Array();
  this.deleteTypes = new Array();
  this.weights = new Array();
  this.types = new Array();
  for (var i = 0; i < this.sbParticipants.length; ++i)
  {
    this.params.push(this.sbParticipants[i].getParameters());
    this.types.push(this.sbParticipants[i].getName());
    this.deleteTypes.push(this.sbParticipants[i].getDeleteType());
    this.weights.push(this.sbParticipants[i].getWeight());
  }

  // Define UD4 object functions
  this.getParticipant = function (type)
  {
    var retVal = null;
    var sbPart = this.getNamedSBPart(type);
    if (sbPart) retVal = sbPart.getNodeSegment().node;
    return retVal;
  };
  
  this.getParticipantWeight	= function (type, node)
  {
    var retVal = null;
    var sbPart = this.getNamedSBPart(type, node);
    if (sbPart) retVal = sbPart.getWeight();
    return retVal;
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   handleParamChange
//
// DESCRIPTION:
//   Guard 'sets' of applyParameters object. by default, it is read-only.
//
// ARGUMENTS:
//   varName - name of variable set
//   oldVal - previous value for var
//   newVal - new value for var 
//
// RETURNS:
//   oldVal if applyParameters is read-only, otherwise newVal
//--------------------------------------------------------------------
function ServerBehavior_handleParamChange(varName, oldVal, newVal)
{
  if (this.bInEditMode)
  {
    return newVal;
  }
  else 
  {
    // Localization *not* required. JS Developer debugging error string.
    throw "Attempt to assign read-only property: " + varName;
  }
  return oldVal;  
}


//--------------------------------------------------------------------
// FUNCTION:
//   getTitle
//
// DESCRIPTION:
//   Get the string to be displayed in the SBI.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   SB title string
//--------------------------------------------------------------------
function ServerBehavior_getTitle()
{
  return this.title;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getSelectedNode
//
// DESCRIPTION:
//   Get pointer to the node that should be highlighted when the SB
//   instance is selected in the SBI.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   node pointer
//--------------------------------------------------------------------
function ServerBehavior_getSelectedNode()
{
  return this.selectedNode;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getServerBehaviorFileName
//
// DESCRIPTION:
//   get SB filename from ext data.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   filename
//--------------------------------------------------------------------
function ServerBehavior_getServerBehaviorFileName()
{
  return extGroup.getServerBehaviorFileName(this.name);
}


//--------------------------------------------------------------------
// FUNCTION:
//   getDataSourceFileName
//
// DESCRIPTION:
//   get DS filename from ext data.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   filename string
//--------------------------------------------------------------------
function ServerBehavior_getDataSourceFileName()
{
  return extGroup.getDataSourceFileName(this.name);
}


//--------------------------------------------------------------------
// FUNCTION:
//   ServerBehavior.getIsEmpty
//
// DESCRIPTION:
//   Determine if the SB has any data.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean - true if has data
//--------------------------------------------------------------------
function ServerBehavior_getIsEmpty()
{
  if (   (this.parameters && this.parameters.length > 0)
      || (this.applyParameters && this.applyParameters.length > 0)
     )
  {
    return false;
  }
  else
  {
    return true;
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   getSubType
//
// DESCRIPTION:
//   get subtype from ext data.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   subtype string
//--------------------------------------------------------------------
function ServerBehavior_getSubType()
{
  return extGroup.getSubType(this.name);
}


//--------------------------------------------------------------------
// FUNCTION:
//   getName
//
// DESCRIPTION:
//   get SB name, used by other SBs to identify each SB instance.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   name string
//--------------------------------------------------------------------
function ServerBehavior_getName()
{
  return this.name;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getVersion
//
// DESCRIPTION:
//   get SB version from extension data
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   version number
//--------------------------------------------------------------------
function ServerBehavior_getVersion()
{
  return extGroup.getVersion(this.name);
}


//--------------------------------------------------------------------
// FUNCTION:
//   getParticipantCount
//
// DESCRIPTION:
//   get number of participants.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   count
//--------------------------------------------------------------------
function ServerBehavior_getParticipantCount()
{
  return this.sbParticipants.length;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getIndexedSBPart
//
// DESCRIPTION:
//   get participant record from zero based index value.
//
// ARGUMENTS:
//   index - zero based index into count returned from getParticipantCount().
//
// RETURNS:
//   SBParticipant or null if bad index. return object is read only.
//--------------------------------------------------------------------
function ServerBehavior_getIndexedSBPart(index)
{
  var sbPart = null;
  if (index < this.sbParticipants.length)
  {
    sbPart = this.sbParticipants[index];
  }
  return sbPart;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getNamedSBPart
//
// DESCRIPTION:
//   get participantRecord from name (and optionally node if this is a multiple
//   type participant).
//
// ARGUMENTS:
//   name - participant name string
//   node (optional) - pointer to participant node
//
// RETURNS:
//   SBParticipant or null if name/node doesn't exist. return obj is read-only.
//--------------------------------------------------------------------
function ServerBehavior_getNamedSBPart(name, node)
{
  var sbPart = null;
  for (var i=0; i < this.sbParticipants.length && !sbPart; i++) 
  {
    if (   this.sbParticipants[i].getName() == name 
        && (!node || this.sbParticipants[i].getNodeSegment().node == node)
       ) 
    {
      sbPart = this.sbParticipants[i];
    }
  }
  return sbPart;
}


//--------------------------------------------------------------------
// FUNCTION:
//   removeNamedSBPart
//
// DESCRIPTION:
//   Removes the participants with this name from the object
//   (and optionally node if this is a multiple type participant).
//
// ARGUMENTS:
//   name - participant name string
//   node (optional) - pointer to participant node
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function ServerBehavior_removeNamedSBPart(name, node)
{
  var sbPart = null;
  for (var i=0; i < this.sbParticipants.length && !sbPart; i++) 
  {
    if (   this.sbParticipants[i].getName() == name 
        && (!node || this.sbParticipants[i].getNodeSegment().node == node)
       ) 
    {
      this.sbParticipants.splice(i, 1);  // delete this one
      i--;
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   getParticipants
//
// DESCRIPTION:
//   retrieve the list of participants
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   array of SBParticipants - elements describe existing participants
//--------------------------------------------------------------------
function ServerBehavior_getParticipants()
{
  return this.sbParticipants;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getIsIncomplete
//
// DESCRIPTION:
//   get flag indicating that a SB instance is incomplete. If true, 
//   the SBI displays a red !.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   TRUE if incomplete
//--------------------------------------------------------------------
function ServerBehavior_getIsIncomplete()
{
  return this.incomplete;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getParameterNames
//
// DESCRIPTION:
//   get list of user-defined property names. uses latest parameter object if
//   in update ServerBehavior.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   array of names
//--------------------------------------------------------------------
function ServerBehavior_getParameterNames()
{
  var paramNames = new Array();
  for (var i in this.parameters)
  {
    paramNames.push(i);
  }

  // Add new params from applyParameters if in edit mode.
  if (this.bInEditMode)
  {
    for (i in this.applyParameters)
    {
      if (dwscripts.findInArray(paramNames, i) == -1)
      {
        paramNames.push(i);
      }
    }
  }

  return paramNames;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getParameter
//
// DESCRIPTION:
//   get value of user-defined property. Uses latest parameter values if in 
//   editable ServerBehavior.
//
// ARGUMENTS:
//   name - property name string
//
// RETURNS:
//   property value or null if doesn't exist
//--------------------------------------------------------------------
function ServerBehavior_getParameter(name)
{
  var paramVal = null;
  var undefined; // Use to compare against 'undefined' type
  
  // Note: be careful about when we use the old parameter value. We only want do this
  //   if the new version of the parameter is undefined. We may have assigned the
  //   new version of the parameter to null, so we must check for '!== undefined'.
  if (this.bInEditMode && this.applyParameters && this.applyParameters[name] !== undefined)
  {
    paramVal = this.applyParameters[name];
  }
  else if (this.parameters[name] !== undefined)
  {
    paramVal = this.parameters[name];
  }
  return paramVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getParameters
//
// DESCRIPTION:
//   Get user-defined properties - the parameter object passed to applySBs().
//   Uses latest parameter object if in edit mode. 
//
// ARGUMENTS:
//   bCheckData - boolean (optional). 'true' if checkData should be called to 
//     repair the parameter object before it is returned. Defaults to 'true'.
//
// RETURNS:
//   object with parameter properties
//--------------------------------------------------------------------

function ServerBehavior_getParameters(bCheckData)
{
  if (bCheckData == null)
  {
    bCheckData = true;
  }
  
  var retParams;
  var undefined; // Use to compare against 'undefined' value.
  
  if (!this.bInEditMode)
  {
    retParams = this.parameters;
  }
  else
  {    
    for (var i in this.parameters)
    {
      // Careful here - the new value could be null, so compare against 'undefined'
      //   using identity equality '==='.
      if (this.applyParameters[i] === undefined)
      {
        this.applyParameters[i] = this.parameters[i];
      }
    }
    retParams = this.applyParameters;
  }
  
  if (bCheckData)
  {
    this.checkData();
  }

  return retParams;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ServerBehavior.checkData
//
// DESCRIPTION:
//   Determine if the server behavior information is valid. Called before
//   ServerBehavior.getParameters returns. This function is empty for the
//   ServerBehavior class. Subclasses should implement to perform the following:
//   1. Add special parameter object properties not exposed in the UI
//   2. Automatically fill in any missing data which has a known default value 
//      or which can be derived from existing data.
//   3. Alert user to errors. Use ServerBehvior.appendErrorMessage to log any errors.
//   Note to subclasses: do not call ServerBehavior.getParameters to get 
//   parameter values in this function (you'll enter an infinite recursive loop).
//   Instead, use ServerBehavior.getParameter to retrieve individual values.
// 
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean - true if OK. if false, use ServerBehaiovr.getErrorMessage to get
//     the errors.
//--------------------------------------------------------------------
function ServerBehavior_checkData()
{
  this.errorMsg = "";
  return true;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getForceMultipleUpdate
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean - true if force multiple update
//--------------------------------------------------------------------
function ServerBehavior_getForceMultipleUpdate()
{
  return this.bForceMultipleUpdate;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getFamily
//
// DESCRIPTION:
//   retrieve family of SB's that this instance belongs to. Families share
//   participants, so you must be careful when updating a participants in common
//   among family members.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - family code
//--------------------------------------------------------------------
function ServerBehavior_getFamily()
{
  return this.family;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getForcePriorUpdate
//
// DESCRIPTION:
//   Determine participant we should update rather than dropping a new instance. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - participant name. 
//--------------------------------------------------------------------
function ServerBehavior_getForcePriorUpdate()
{
  var retVal = "";
  
  if (this.forcePriorUpdate)
  {
    retVal = this.forcePriorUpdate;
  }
  else if (this.MM_forcePriorUpdate)
  {
    retVal = this.MM_forcePriorUpdate;
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   setErrorMessage
//
// DESCRIPTION:
//   set message about error condition for others to retrieve.
//
// ARGUMENTS:
//   errMsg - error message string
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function ServerBehavior_setErrorMessage(errMsg)
{
  this.errorMsg = errMsg;
}

//--------------------------------------------------------------------
// FUNCTION:
//   appendErrorMessage
//
// DESCRIPTION:
//   add to error message for others to retrieve.
//
// ARGUMENTS:
//   errMsg - error message string
//   separator - (otional) string to place between existing error message and errMsg.
//     "\n\n" is the default.
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function ServerBehavior_appendErrorMessage(errMsg, separator)
{
  if (separator == null)
  {
    separator = "\n\n";
  }
  
  if (this.errorMsg.length)
  {
    this.errorMsg += separator + errMsg;
  }
  else
  {
    this.errorMsg += errMsg;
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   getErrorMessage
//
// DESCRIPTION:
//   get current error message.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   error message string
//--------------------------------------------------------------------
function ServerBehavior_getErrorMessage()
{
  return this.errorMsg;
}


//--------------------------------------------------------------------
// FUNCTION:
//   makeEditableCopy
//
// DESCRIPTION:
//   Returns an editable copy of the ServerBehavior object. Setting parameters on 
//   the copy will preserve the original parameters and will allow you to update 
//   the existing SB on the page using ServerBehavior.queueDocEdits (see queueDocEdits).
//   Note: Calling this function if this is already an editable copy will reset
//   the applyParameters data member for the copy.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   ServerBehavior instance 
//--------------------------------------------------------------------
function ServerBehavior_makeEditableCopy()
{
  // Make a new ServerBehavior object for the copy. We must use the constructor
  //   property to create this object since we may have been called from a 
  //   subclass.
  var sbCopy = new this.constructor();

  for (var i in this)
  {
    if (   (typeof this[i] != "function") && (i != "applyParameters")
        && (i != "parameters")
       )
    {
      sbCopy[i] = this[i];
    }
  }

  // Copy over the parameters
  for (var j in this.parameters)
  {
    sbCopy.parameters[j] = this.parameters[j];
  }    
  sbCopy.bInEditMode = true;
  sbCopy.applyParameters = new Object();
  
  return sbCopy;
}


//--------------------------------------------------------------------
// FUNCTION:
//   queueDocEdits
//
// DESCRIPTION:
//   schedule the SB edits on the edit list for the page. They are committed when
//   dwscripts.applySB() is called.
//
// ARGUMENTS:
//   bCheckData - boolean (optional). 'true' if checkData should be called to 
//     repair the parameter object before it is returned. Defaults to 'true'.
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function ServerBehavior_queueDocEdits(bCheckData)
{
  if (arguments.length == 0)
  {
    bCheckData = null;
  }
  extGroup.queueDocEdits(this.name, this.getParameters(bCheckData), (this.sbParticipants.length) ? this : null);
}


//--------------------------------------------------------------------
// FUNCTION:
//   ServerBehavior.queueDocEditsForDelete
//
// DESCRIPTION:
//   Schedule the SB edits required to delete this server behavior.
//   They are commited when dwscripts.applyDocEdits() is called.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean - true if successful.
//--------------------------------------------------------------------

function ServerBehavior_queueDocEditsForDelete()
{
  extGroup.queueDocEditsForDelete(this);
  return true;
}


//--------------------------------------------------------------------
// FUNCTION:
//   setParameter
//
// DESCRIPTION:
//   set user-defined property in parameter object. Preserves original parameter
//   object if performed on editable instance. See makeEditableCopy(). 
//
// ARGUMENTS:
//   name - property name string
//   value - property value
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function ServerBehavior_setParameter(name, value)
{
  if (this.bInEditMode)
  {
    this.applyParameters[name] = value;
  }
  else
  {
    this.parameters[name] = value; 
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   setParameters
//
// DESCRIPTION:
//   set parameter object. Preserves original parameter object if performed
//   on an editable copy. See makeEditableCopy().
//
// ARGUMENTS:
//   mapNameToVals - parameter object
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function ServerBehavior_setParameters(mapNameToVals)
{
  if (this.bInEditMode)
  {
    this.applyParameters = mapNameToVals;
  }
  else
  {
    this.parameters = mapNameToVals;
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   setTitle
//
// DESCRIPTION:
//   set the string to be displayed in the SBI 
//
// ARGUMENTS:
//   title - SB title string
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function ServerBehavior_setTitle(title)
{
  this.title = title;
}


//--------------------------------------------------------------------
// FUNCTION:
//   addParticipant
//
// DESCRIPTION:
//   Adds the participant information to the ServerBehavior
//
// ARGUMENTS:
//   sbPart - SBParticipant
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function ServerBehavior_addParticipant(sbPart) 
{
  var params = sbPart.getParameters();
  
  this.sbParticipants.push(sbPart);
  
  // Add to node property required by UD
  this.participants.push(sbPart.getNodeSegment().node);
  
  // Add the participant's parameters to the SB parameter object.
  if (params) 
  {
    for (var param in params) 
    {
      if (params[param] != null)
      {
        this.parameters[param] = params[param];
      }
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   setIsIncomplete
//
// DESCRIPTION:
//   set flag indicating that a SB instance is incomplete. 
//   If true, the SBI displays a red !.
//
// ARGUMENTS:
//   bIsIncomplete - boolean
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function ServerBehavior_setIsIncomplete(bIsIncomplete)
{
  this.incomplete = bIsIncomplete;
}


//--------------------------------------------------------------------
// FUNCTION:
//   setSelectedNode
//
// DESCRIPTION:
//   set pointer to the node that should be highlighted when the 
//   SB instance is selected in the SBI.
//
// ARGUMENTS:
//   node - document node pointer
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function ServerBehavior_setSelectedNode(node)
{
  this.selectedNode = node;
}


//--------------------------------------------------------------------
// FUNCTION:
//   setForceMultipleUpdate
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   bForce - boolean. true to force multiple update.
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function ServerBehavior_setForceMultipleUpdate(bForce)
{
  this.bForceMultipleUpdate = bForce;
}


//--------------------------------------------------------------------
// FUNCTION:
//   setFamily
//
// DESCRIPTION:
//   Set the SB's family
//
// ARGUMENTS:
//   family - string code for family this SB belongs to.
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function ServerBehavior_setFamily(family)
{
  this.family = family;
}


//--------------------------------------------------------------------
// FUNCTION:
//   setForcePriorUpdate
//
// DESCRIPTION:
//   Mark a participant to force update the existing instance so multiple
//   instances will not be dropped. 
//
// ARGUMENTS:
//   partName - ext data participant filename. 
//
// RETURNS:
//   none
//--------------------------------------------------------------------
function ServerBehavior_setForcePriorUpdate(partName)
{
  this.forcePriorUpdate = partName;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getWrapSelectionOffsets
//
// DESCRIPTION:
//   This function returns a pair of offsets which indicate the
//   range within the document occupied by any code which wraps
//   the selection.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   JavaScript array - a pair of offsets, or null if this behavior
//     does not wrap the selection
//--------------------------------------------------------------------
function ServerBehavior_getWrapSelectionOffsets()
{
  var retVal = null;

  var dom = dw.getDocumentDOM();

  // get the start and end offsets
  var partList = this.getParticipants();

  var start = -1;
  var end = -1;
  for (var i=0; i < partList.length; i++)
  {
    var nodeSegment = partList[i].getNodeSegment();
    var weight = partList[i].getWeight();

    if (weight == "wrapSelection")
    {
      // record the start and end
      var nodeOffset = dwscripts.getNodeOffsets(nodeSegment.node);
      var newStart = nodeOffset[0] + nodeSegment.matchRangeMin;
      var newEnd = nodeOffset[0] + nodeSegment.matchRangeMax;
      if (newStart < start || start == -1)
      {
        start = newStart;
      }
      if (newEnd > end)
      {
        end = newEnd;
      }
    }
    else if (weight == "beforeSelection")
    {
      var nodeOffset = dwscripts.getNodeOffsets(nodeSegment.node);
      var newStart = nodeOffset[0] + nodeSegment.matchRangeMin;
      if (newStart < start || start == -1)
      {
        start = newStart;
      }
    }
    else if (weight == "afterSelection")
    {
      var nodeOffset = dwscripts.getNodeOffsets(nodeSegment.node);
      var newEnd = nodeOffset[0] + nodeSegment.matchRangeMax;
      if (newEnd > end)
      {
        end = newEnd;
      }
    }
  }

  if (start != -1 && end != -1)
  {
    retVal = new Array(start,end);
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   toString
//
// DESCRIPTION:
//   Convert ServerBehavior instance into a string for display.
//   Intended for debugging purposes.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------
function ServerBehavior_toString()
{
  var partStr = "";
  for (var i = 0; i < this.sbParticipants.length; ++i)
  {
    partStr += ((partStr.length) ? ", " : "") + this.sbParticipants[i].getName();
  }
  
  var str = "ServerBehavior Instance\n"
          + "=======================\n"
          + "Name: " + this.name + "\n"
          + "Title: " + this.title + "\n"
          + "Parameters: {" + this.getParameters() + "}\n"
          + "IsIncomplete: " + this.incomplete + "\n"
          + "Participants: " + partStr + "\n"
          + "ForceMultipleUpdate: " + this.bForceMultipleUpdate + "\n"
          + "ForcePriorUpdate: " + this.forcePriorUpdate + "\n"
          + "Family: " + this.family + "\n"
          + "Errors: " + this.errorMsg + "\n"
          + "UD4 backward compatible? " + (this.type != null) + "\n";

  // Add UD4 backward compatible properties if it is backward compatible.
  if (this.type != null)
  {
    str += "\nUD4 Backward Compatible Properties\n"
        +  "==================================\n"
        +  "Type: " + this.type + "\n"
        +  "ServerBehavior: " + this.serverBehavior + "\n"
        +  "SubType: " + this.subType + "\n"
        +  "DataSource: " + this.dataSource + "\n"
        +  "Params: " + this.params + "\n"
        +  "DeleteTypes: " + this.deleteTypes + "\n"
        +  "Weights: " + this.weights + "\n"
        +  "Types: " + this.types + "\n"; 
  }

  return str;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ServerBehavior.preprocessForSerialize
//
// DESCRIPTION:
//   Prepare the server behavior object for serialization. This function is
//   mainly used in the CopyServerBehavior api function. On copy, the server
//   behavior object is serialized and placed on the clipboard.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function ServerBehavior_preprocessForSerialize()
{
  // When the server behavior is serialized, only simple values and arrays are
  //   preserved. Convert the parameters object into parallel arrays to preserve it.
  this.parameterNames = new Array();
  this.parameterTypes = new Array();
  this.parameterValues = new Array();
  for (var i in this.parameters)
  {
    this.parameterNames.push(i);
    this.parameterTypes.push(typeof this.parameters[i]);
    if (typeof this.parameters[i] == "object" && this.parameters[i].length)
    {
      this.parameterValues.push(this.parameters[i].join(ServerBehavior.ARRAY_SEP_TOKEN));
    }
    else
    {
      this.parameterValues.push(this.parameters[i].toString());
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   ServerBehavior.postprocessForDeserialize
//
// DESCRIPTION:
//   Repair the deserialized server behavior object. This function is
//   mainly used in the PasteServerBehavior api function. On paste, the server
//   behavior object is in the state set up by ServerBehavior.preprocessForSerialize.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function ServerBehavior_postprocessForDeserialize()
{
  // Rebuild the paramaters object using the parallel arrays describing its contents.
  this.parameters = new Array();
  for (var i  = 0; i < this.parameterNames.length; ++i)
  {
    var value = this.parameterValues[i];
    
    // If parameter is an array, convert the string value to an array.
    if (this.parameterTypes[i] == "object")
    {
      // We must special case the 'empty' array. Otherwise, we'll create an array
      //   with one blank element where there should have been an empty array.
      if (this.parameterValues[i].length > 0)
      {
        value = this.parameterValues[i].split(ServerBehavior.ARRAY_SEP_TOKEN);
      }
      else
      {
        value = new Array();
      }
    }
    
    this.parameters[this.parameterNames[i]] = value;
  }

  this.parameterNames = null;
  this.parameterTypes = null;
  this.parameterValues = null;
  
  // All boolean values will be treated as the string 'false' or 'true' in the 
  //   serialize causing them to always evaluate to true. Convert them back to
  //   booleans.
  for (var i in this)
  {
    if (this[i] == "false")
    {
      this[i] = false;
    }
    else if (this[i] == "true")
    {
      this[i] = true;
    }
  }
  
  
  // Clear out the participants arrays and the error message. They make no sense 
  //   in a pasted version.
  this.sbParticipants = new Array();
  this.participants = new Array();
  this.errorMsg = "";

  // Make a call to checkData to make sure everything is kosher before we try
  //   to apply the pasted SB to the page.
  this.checkData(true);
}


//--------------------------------------------------------------------
// FUNCTION:
//   ServerBehavior.deleteIfAlreadyReferenced
//
// DESCRIPTION:
//   Call this function in analyzeServerBehavior() to set the 'deleted' flag
//   if the participant node of this server behavior is already claimed by
//   another SB. This function is only intended for simple server behaviors
//   with a single node participant. Such server behaviors are often used
//   as part of large, more complex server behaviors and should not be listed
//   separately in the server behavior panel.
//
// ARGUMENTS:
//   allSBs - array of all server behaviors on the page.
//
// RETURNS:
//   boolean - true if this SB had the 'deleted' flag set.
//--------------------------------------------------------------------

function ServerBehavior_deleteIfAlreadyReferenced(allSBs)
{
  var bAlreadyClaimed = false;
  var thisSBParts = this.getParticipants();
  if (thisSBParts && thisSBParts.length > 0)
  {
    var thisMainPartNode = this.getSelectedNode();
    if (thisMainPartNode == null)
    {
      thisMainPartNode = thisSBParts[0].getNode();
    }
    
    var thisSBName = this.getName();
    
    // Search through all server behavior objects. If any of them have already
    //   claimed this node as their own, set the deleted flag for this server
    //   behavior.
    for (var i = 0; !bAlreadyClaimed && i < allSBs.length; ++i)
    {
      if (allSBs[i].getParticipants)
      {
        var sbParts = allSBs[i].getParticipants();
        // Make sure we aren't looking at the same sbObj.
        if (allSBs[i].getName() != thisSBName && sbParts)
        {
          for (var j = 0; !bAlreadyClaimed && j < sbParts.length; ++j)
          {
            var sbPartNode = sbParts[j].getNode();
            // Check for the same node, and that the priority of the
            //  other item is less than or equal to ours
            if (sbPartNode && sbPartNode == thisMainPartNode &&
                allSBs[i].getPriority() <= this.getPriority())
            {
              bAlreadyClaimed = true;
              this.deleted = true;
            }
          }
        }
      }
      else
      { // Handle UD1 and UD4 Server Behavior objects
        var sbParts = allSBs[i].participants;
        if (allSBs[i].type != thisSBName && sbParts)
        {
          for (var j = 0; !bAlreadyClaimed && j < sbParts.length; ++j)
          {
            var sbPartNode = sbParts[j];
            // Check for the same node, and that the priority of the
            //  other item is less than or equal to ours
            if (sbPartNode && sbPartNode == thisMainPartNode)
            {
              bAlreadyClaimed = true;
              this.deleted = true;
            }
          }
        }
      }
    }
  }
  
  return bAlreadyClaimed;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ServerBehavior.setPriority
//
// DESCRIPTION:
//   This function sets the priority value for this server behavior.
//   This number is used to resolve conflicts, when a number of SBs
//   claim the same node.  See the deleteIfAlreadyReferenced function.
//
// ARGUMENTS:
//   priorityNumber - integer - a number from 1 to 10, with 1 being
//     the highest priority, and 10 the lowest
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function ServerBehavior_setPriority(priorityNumber)
{
  if (priorityNumber > 0 && priorityNumber <= 10)
  {
    this.priority = priorityNumber;
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   ServerBehavior.getPriority
//
// DESCRIPTION:
//   Return the priority for this Server Behavior
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   integer
//--------------------------------------------------------------------

function ServerBehavior_getPriority()
{
  return this.priority;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ServerBehavior.deleteIfSelectedNodeOutsideBody
//
// DESCRIPTION:
//   This function checks to make sure that the selected node for the
//   current behavior is inside the body tag of the document.  If it
//   is outside, the deleted flag is set.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function ServerBehavior_deleteIfSelectedNodeOutsideBody()
{
  if (!this.deleted)
  {
    var thisMainPartNode = this.getSelectedNode();
    if (thisMainPartNode == null)
    {
      var thisSBParts = this.getParticipants();
      if (thisSBParts && thisSBParts.length > 0)
      {
        thisMainPartNode = thisSBParts[0].getNode();
      }
    }

    if (thisMainPartNode != null)
    {
      var isVisible = false;
      for (var node = thisMainPartNode; node != null; node = node.parentNode)
      {
        if (node.nodeType == Node.ELEMENT_NODE && node.tagName == "BODY")
        {
          // visible tag, do not delete
          isVisible = true;
          break;
        }
      }

      if (!isVisible)
      {
        this.deleted = true;
      }
    }
  }
}





//--------------------------------------------------------------------
// CLASS:
//   SBParticipant
//
// DESCRIPTION:
//   Store information about a participant instance. 
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//   getWeight() - get weigth for the participant.
//   getName() - get participant name
//   getParameters() - get instance parameter object
//   getDeleteType() - get delete type from ext data.
//   getNodeSegment() - get {node,matchRangeMin,matchRangeMax}
//   getVersion() - get the participant version number from ext data.
//
// PROTECTED FUNCTIONS:
//   SBParticipant(partName, node, matchRangeMin, matchRangeMax, parameters) - should
//     only be used by functions building ServerBehavior objects from participant 
//     instances. For example, dwscripts.findSBs() makes use of this function.
//
// INCLUDE:
//   dwscriptsExtData.js - for NodeSegment()
//--------------------------------------------------------------------


//--------------------------------------------------------------------
// FUNCTION:
//   SBParticipant
//
// DESCRIPTION:
//   class constructor
//
// ARGUMENTS:
//   name - participant name
//   node - document node for particpant on page
//   matchRangeMin - node-relative offsets of participant
//   matchRangeMax -         "
//   parameters - parameter object for participant
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------
function SBParticipant(name, node, matchRangeMin, matchRangeMax, parameters)
{
  this.node = node;
  this.name = name;
  this.matchRangeMin = (matchRangeMin) ? matchRangeMin : 0;
  this.matchRangeMax = (matchRangeMax) ? matchRangeMax : 0;
  this.parameters = (parameters) ? parameters : new Object();
}

SBParticipant.prototype.getNode = SBParticipant_getNode;
SBParticipant.prototype.getWeight = SBParticipant_getWeight;
SBParticipant.prototype.getName = SBParticipant_getName;
SBParticipant.prototype.getParameters = SBParticipant_getParameters;
SBParticipant.prototype.getDeleteType = SBParticipant_getDeleteType;
SBParticipant.prototype.getNodeSegment = SBParticipant_getNodeSegment;
SBParticipant.prototype.toString = SBParticipant_toString;
SBParticipant.prototype.getVersion = SBParticipant_getVersion;



//--------------------------------------------------------------------
// FUNCTION:
//   getNode
//
// RETURNS:
//   node pointer for participant
//--------------------------------------------------------------------
function SBParticipant_getNode()
{
  return this.node;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getWeight
//
// DESCRIPTION:
//   get participant weight from ext data
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   weight string
//--------------------------------------------------------------------
function SBParticipant_getWeight()
{
  return extPart.getWeight(this.name, this.node);
}


//--------------------------------------------------------------------
// FUNCTION:
//   getName
//
// DESCRIPTION:
//   retrieve participant name
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   name string
//--------------------------------------------------------------------
function SBParticipant_getName()
{
  return this.name;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getParameters
//
// DESCRIPTION:
//   get participant parameters object
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   parameter object
//--------------------------------------------------------------------
function SBParticipant_getParameters()
{
  return this.parameters;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getDeleteType
//
// DESCRIPTION:
//   get delete type from ext data
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   delete type string
//--------------------------------------------------------------------
function SBParticipant_getDeleteType()
{
  return extPart.getDeleteType(this.name);
}


//--------------------------------------------------------------------
// FUNCTION:
//   getNodeSegment
//
// DESCRIPTION:
//   get participant node segment
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   NodeSegment
//--------------------------------------------------------------------
function SBParticipant_getNodeSegment()
{
  return new NodeSegment(this.node, this.matchRangeMin, this.matchRangeMax);
}


//--------------------------------------------------------------------
// FUNCTION:
//   getVersion
//
// DESCRIPTION:
//   get participant version number from ext data
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   version number
//--------------------------------------------------------------------
function SBParticipant_getVersion()
{
  return extPart.getVersion(this.name);
}


//--------------------------------------------------------------------
// FUNCTION:
//   toString
//
// DESCRIPTION:
//   Creates a string version of SBParticipant suitable for display.
//   Meant for debugging purposes.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------
function SBParticipant_toString()
{
  var str = "SBParticipant Instance\n"
          + "======================\n"
          + "Name: " + this.name + "\n"
          + "Parameters: {" + this.parameters + "}\n"
          + "Node: '" + extUtils.convertNodeToString(this.node) + "'\n"
          + "MatchRangeMin: " + this.matchRangeMin + "\n"
          + "MatchRangeMax: " + this.matchRangeMax + "\n"          
  return str;
}
