// SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//*********************  API  ***************************

// FUNCTIONS:
//   function findSBs(title) {
//   function applySB(paramObj, sbObj) {
//   function deleteSB(sbObj) {


//*-------------------------------------------------------------------
// FUNCTION:
//   findSBs
//
// DESCRIPTION:
//   This function searches the current document for all instances of
//   a server behavior(s), and returns an array of javascript objects
//   needed by findServerBehaviors() API. Uses XML services to determine
//   which group files to use, which participants to look for, and where
//   to look. Sets all properties possible, including participants,
//   weights, types etc. Also sets a "parameters" object containing all the
//   parameters needed as properties.
//
//
// ARGUMENTS: 
//   title    - optional parameter for the title of the server behavior
//
// RETURNS:
//   array of SSRecords, fully populated
//--------------------------------------------------------------------

function findSBs( title ) {
  var ssRecs = new Array();
  var groupIds = getAllMyGroupIds();

  for (var i=0; i<groupIds.length; i++) {
    var group = new Group(groupIds[i], true);
    if (!group.title) {
      if (title != null) group.title = title;
    }
    ssRecs = ssRecs.concat(group.find());
  }

  return ssRecs;

}



//*-------------------------------------------------------------------
// FUNCTION:
//   applySB
//
// DESCRIPTION:
//   This function inserts or updates a server behavior.
//   It is typically called by applyServerBehavior, and it uses the
//   SSEdits class to do most of the work of actually inserting or
//   updating objects on the page.
//
//   function applyServerBehavior(sbObj) {
//     var paramObj = new Object();
//     paramObj.param1 = ~get value from UI
//     paramObj.param2 = ~get value from UI
//     paramObj.param3 = ~get value from UI
//     applySB(paramObj, sbObj);
//   }
//
// ARGUMENTS: 
//   paramObj - simple Object with a property for each param to pass in
//   sbObj    - prior SSRecord instance (if editing existing instance)
//   sbName (optional) - the name of a Server Behavior such as My SB.htm
//                      (only use if *not* calling from a Server Behavior).
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function applySB(paramObj, sbObj, sbName) {

  var groupId = getMyGroupId(paramObj, sbName);
  
  if (groupId) {
    var group = new Group(groupId);
    group.apply(paramObj, sbObj);
  } else {
    alert(MM.MSG_NoXmlFile);
  }
  
}



//*-------------------------------------------------------------------
// FUNCTION:
//   deleteSB
//
// DESCRIPTION:
//   Deletes all participants that are not currently being shared.
//   Calls del() method of SSRecord class which does all the work.
//
// ARGUMENTS: 
//   sbObj   - prior SSRecord instance
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function deleteSB(sbObj) {
  sbObj.del();
}





//*********************  LOCAL CLASSES ***************************


//*-------------------------------------------------------------------
// CLASS:
//   Group
//
// DESCRIPTION:
//   This class represents group file data.  The properties of
//   this class can be set from the group xml file, or by hand,
//   and then the find and apply functions can be called to 
//   add and find the specified group.
//
// PUBLIC PROPERTIES:
//   fileId - 
//   title -
//
// PUBLIC FUNCTIONS:
//   getData(getParticipants, includeInsertData)
//   getInsertStrings(paramObj, searchLocation)
//   getParticipants(searchLocation)
//   getParticipantNames()
//   find(paramObj)
//   apply(paramObj, sbObj)
//   addParticipants(participantsArray)
//
//--------------------------------------------------------------------
function Group(theName, findDataOnly) {
  // public properties
  this.name = theName || "";
  this.title = theName;
  this.serverBehavior = '';
  this.dataSource = '';
  this.subType = '';
  
  this.selectParticipant = '';
  
  // private properties
  this.participantNames = new Array();
  this.participants = new Array();
  
  this.DEBUG = false;     //SETDEBUG
  
  //initialize
  if (this.name) {
    this.getData(true, (findDataOnly?false:true));
  }
}

// public methods
Group.prototype.getData = Group_getData;
Group.prototype.getInsertStrings = Group_getInsertStrings;
Group.prototype.getParticipant = Group_getParticipant;
Group.prototype.getParticipants = Group_getParticipants;
Group.prototype.getParticipantNames = Group_getParticipantNames;
Group.prototype.find = Group_find;
Group.prototype.findInString = Group_findInString;
Group.prototype.apply = Group_apply;
Group.prototype.addEdits = Group_addEdits;
Group.prototype.addParticipants = Group_addParticipants;

// private methods
Group.prototype.matchParts = Group_matchParts;
Group.prototype.addPartToGroups = Group_addPartToGroups;
Group.prototype.canAddPartToGroup = Group_canAddPartToGroup;
Group.prototype.partParametersMatchGroup = Group_partParametersMatchGroup;
Group.prototype.partPositionMatchesGroup = Group_partPositionMatchesGroup;
Group.prototype.applyNewGroup = Group_applyNewGroup;

//---------------
// Function: getData
// Description: 
//   Get the information from the group xml file
function Group_getData(getParticipants, includeInsertData) {
  
  //check if the group xml file exists
  if (!dw.getExtDataArray(this.name)) {
    alert(errMsg(MM.MSG_NoGroupDataFile, this.name)); 
  }
  
  //get the title
  this.title = dw.getExtDataValue(this.name, "title");
  
  //get the serverBehavior
  this.serverBehavior = dw.getExtDataValue(this.name, "serverBehavior");
  
  //get the dataSource and subType, if defined
  this.dataSource = dw.getExtDataValue(this.name, "dataSource");
  this.subType = dw.getExtDataValue(this.name, "subType");
  
  //get the selectParticipant
  this.selectParticipant = dw.getExtDataValue(this.name, "groupParticipants", "selectParticipant");
  
  //get the names of the participants
  var parts = dw.getExtDataArray(this.name, "groupParticipants");
  for (var i=0; i < parts.length; i++) {
    this.participantNames.push(parts[i]);
  }

  //get the debug flag from the xml file
  if (!this.DEBUG) {
    this.DEBUG = (dw.getExtDataValue(this.name, "debug") == "true");
  }
  
  //if debug is true, display the information for this group file
  if (this.DEBUG) {
    var MSG = new Array();
    MSG.push("Information for Group: " + this.name);
    MSG.push("Title: " + this.title);
    MSG.push("Server Behavior: " + this.serverBehavior);
    MSG.push("Select Participant: " + this.selectParticipant);
    MSG.push("Participants: ");
    for (var i=0; i < this.participantNames.length; i++) {
      MSG.push("    " + this.participantNames[i]);
    }
    alert(MSG.join("\n"));
  }
  
  //get the complete participant info, if indicated
  if (getParticipants) {
    for (var i=0; i < this.participantNames.length; i++) {
      var node = new Participant();
      node.name = this.participantNames[i];
      node.groupName = this.name;
      if (this.DEBUG) node.DEBUG = true;  // turn debugging on for participants
      node.getData(includeInsertData);
      this.participants.push(node);
    }
  }
    
}


//---------------
// Function: getInsertStrings
// Description: 
//   Gets the text to be inserted for at a given location
//
// Returns: array of strings to be inserted at the given location
//
function Group_getInsertStrings(paramObj, insertLocation) {
  var retVal = new Array();

  for (var i=0; i<this.participants.length; i++) {
    theStr = this.participants[i].getInsertString(paramObj, insertLocation);
    if (theStr) {
      retVal.push(theStr);
    }
  }

  return retVal;
}



//---------------
// Function: getParticipant
// Description: 
//   Returns the participant object with the given participant name
//
function Group_getParticipant(participantName) {
  var retVal = null;
  
  for (var i=0; i < this.participants.length; i++) {
    if (this.participants[i].name == participantName) {
      retVal = this.participants[i];
      break;
    }
  }
  
  return retVal;
}



//---------------
// Function: getParticipants
// Description: 
//   Gets a list of participant objects for a Group. If a searchLocation
// is given, only returns participant objects that use that location.
//
// Returns: array of Participant objects
//
// Arguments:
//   insertLocation (optional)
//
function Group_getParticipants(insertLocation) {
  var retVal = new Array();

  for (var i=0; i < this.participants.length; i++) {
    if (!insertLocation || this.participants[i].location.indexOf(insertLocation) == 0) {
      retVal.push(this.participants[i]);
    }
  }

  return retVal;
}



//---------------
// Function: getParticipantNames
// Description: 
//   Gets a list of participant names for a Group.
//
// Returns: array of Participant names
//
function Group_getParticipantNames() {
  return this.participantNames;
}



//---------------
// Function: find
// Description: 
//   Locates the Behaviors which match this group
//   Returns a list of ssRecords
//
function Group_find() {
  var ssRecList = new Array();    //array of ssRecs
  
  if (this.DEBUG) alert("finding group: " + this.name);
  
  var partList = dw.getParticipants(this.name);

  if (this.DEBUG) {
    if (partList) {
      for (var i=0; i < partList.length; i++) {
        var msg = new Array();
        msg.push("Participant " + i);
        msg.push("participantName = " + partList[i].participantName);
        msg.push("parameters = ");
        for (var j in partList[i].parameters) {
          msg.push("  " + j + " = " + partList[i].parameters[j]);
        }
        msg.push("participantNode = ");
        msg.push(SB_convertNodeToString(partList[i].participantNode,""));
        alert(msg.join("\n"));
      }
    } else {
      alert("no participants found for group: " + this.name);
    }
  }
  
  if (partList) {
  
    //pull out extra information for each part
    for (var i=0; i < partList.length; i++) {

      //set the parts position within the master partList
      partList[i].position = i;

      //extract node parameter information
      var participant = this.getParticipant(partList[i].participantName); 
      participant.extractNodeParam(partList[i].parameters, partList[i].participantNode);

    }
    
    
    //now match up the found parts to create a list of part groups
    var partGroupList = this.matchParts(partList);
    
    
    //now walk the partGroupList and create ssRecs
    for (var i=0; i < partGroupList.length; i++) {

      var partGroup = partGroupList[i];
      
      // create an SSRecord
      var ssRec = new SSRecord();


      //set the type and serverBehavior of each ssRec
      ssRec.type = this.name;
      ssRec.serverBehavior = this.serverBehavior;
      ssRec.subType        = this.subType;
      ssRec.dataSource     = this.dataSource;
      
      
      //sort the partGroup, so that the insert code finds the participant nodes
      // in the correct document order
      partGroup.sort(new Function("a", "b", "return a.position - b.position"));
      
      
      //add the participant information to the ssRec
      for (var j=0; j < partGroup.length; j++) {
        
        //get the participant object for this part
        var participant = this.getParticipant(partGroup[j].participantName);
                
        //add the information to the ssRec
        ssRec.addParticipant(partGroup[j].participantNode, 
                             participant.getWeight(partGroup[j].participantNode),
                             partGroup[j].participantName, 
                             participant.deleteType);
                             
        //add to the params array
        if (ssRec.params == null) {
          ssRec.params = new Array();
        }
        ssRec.params.push(partGroup[j].parameters);
        
        //add the param values
        // NOTE: should handle multiples better
        for (var param in partGroup[j].parameters) {
          if (ssRec.parameters[param] == null) {
            ssRec.parameters[param] = partGroup[j].parameters[param];
          }
        }
        
        //set the selected node
        if (participant.name == this.selectParticipant) {
          ssRec.selectedNode = partGroup[j].participantNode;
        }
        
      }
      
      
      //set the title of the ssRec
      ssRec.title = SB_replaceParamsInStr(this.title, ssRec.parameters); // replace parameters


      //check the ssRec for completeness
      for (var j=0; j < this.participants.length; j++) {

        var isOptional = this.participants[j].isOptional;
        var partNode = ssRec.getParticipant(this.participants[j].name);

        //if this is not an optional participant, check the ssRec for completeness
        if (!isOptional && this.participants[j].whereToSearch && partNode == null) {
          ssRec.incomplete = true;

          if (this.DEBUG) alert("setting record #" + i + " to incomplete: missing part: " + this.participants[j].name);
        }

      }

      //add it to the list of ssRecs
      ssRecList.push(ssRec);
    }
    
  }
            
  return ssRecList;

}



//---------------
// Function: matchParts
// Description: 
//   Processes the list of found parts.
//   These records contain pointers to the participant information.
// Returns: 
//   an array of part arrays
//
//NOTE: need to check for broken server behaviors which might be merged.
//      walk the sbList and locate records which are missing complementary
//      participants.
//
function Group_matchParts(partList) {
  var partGroupList = new Array();
  
  if (this.DEBUG) alert("matching participants to form groups");
  
  //first, go through the identifier parts, and create group nodes
  for (var i=0; i < this.participantNames.length; i++) {
    
    for (var partNum=0; partNum < partList.length; partNum++) {

      if (partList[partNum].participantName == this.participantNames[i]) {
        
        var part = partList[partNum];
        var participant = this.getParticipant(part.participantName);

        //check each identifier to see if we need to create a new group
        if (participant.isIdentifier) {

          var added = this.addPartToGroups(partGroupList, part, partList, participant);

          if (!added) {

            if (this.DEBUG) alert("creating new group and adding part:" + part.participantName + " #" + partNum);

            //create a new record and add the part
            var newGroup = new Array();
            newGroup.push(part);
            partGroupList.push(newGroup);

          }

        }
        
      }

    }
    
  }

  //now try add all the parts to an exisiting part group
  // in the order which they are listed in the xml file
  // (NOTE: this works for multiples, because they will not have been added above)
  for (var i=0; i < this.participantNames.length; i++) {
    
    for (var partNum=0; partNum < partList.length; partNum++) {
     
      if (partList[partNum].participantName == this.participantNames[i]) {
        var part = partList[partNum];
        var participant = this.getParticipant(part.participantName);

        var added = this.addPartToGroups(partGroupList, part, partList, participant);
      }

    }
    
  }
  
  if (this.DEBUG) alert("created " + partGroupList.length + " part groups");
  
  return partGroupList;
}



//---------------
// Function: addPartToGroups
// Description: 
//   This function adds the given part to all matching partGroups.
//   It skips group which already contain a part of the same type,
//   unless the participant is of part type "multiple".
//
// Returns true if the part was added to an existing partGroup.
//
function Group_addPartToGroups(partGroupList, part, partList, participant) {
  var retVal = false;
  
  //see if we can add this part to any of the existing groups
  for (var i=0; i < partGroupList.length; i++) {
    
    var partGroup = partGroupList[i];
    
    var groupHasPart = false;
    if (participant.partType != "multiple") {
      for (var j=0; !groupHasPart && j < partGroup.length; j++) {
        groupHasPart = (partGroup[j].participantName == part.participantName);
      } 
    }
    
    if (!groupHasPart && this.canAddPartToGroup(partGroup, part, partList, participant)) {
    
      if (this.DEBUG) alert("adding part:" + part.participantName + " #" + part.position + " to group #" + i);

      //add to the group
      partGroup.push(part);
      retVal = true;
      
    }
    
  }
  
  return retVal;
}


//---------------
// Function: canAddToGroup
// Description: 
//   Returns true if the part indicated by partNum, in the partList,
//   can be added to the given partGroup.
//
function Group_canAddPartToGroup(partGroup, part, partList, participant) {
  var result = null;
  
  //check if the user has defined a matching function
  if (result == null && window.canAddPartToGroup != null) {
    result = window.canAddPartToGroup(partGroup, part, partList, participant);
  }
  
  //check if the parameters match and the position is correct
  if (result == null) {
    result = ( this.partParametersMatchGroup(partGroup, part, partList, participant) &&
               this.partPositionMatchesGroup(partGroup, part, partList, participant) );
  }
    
  return result;
}


//---------------
// Function: partParametersMatchGroup
// Description: 
//   Returns true if all common parameters between the given part, and
//   the parts in the partGroup match.  It does not check against parts
//   with the same name, to handle parts of type "multiple".
//
function Group_partParametersMatchGroup(partGroup, part, partList, participant) {
  var retVal = true;
  
  for (var i=0; retVal && i < partGroup.length; i++) {
    
    //for multiples, only check the parts which do not 
    // have the same name as the given part
    if (partGroup[i].participantName != part.participantName) {
      
      //check if the parameters match
      retVal = SB_parametersMatch(part.parameters, partGroup[i].parameters);
      
    }
    
  }
  
  return retVal;
}


//---------------
// Function: partPostionMatchesGroup
// Description: 
//   Returns true if the given part is in the correct location, relative
//   to the other parts in this group.
//
function Group_partPositionMatchesGroup(partGroup, part, partList, participant) {
  var retVal = true;
  
  for (var i=0; retVal && i < partGroup.length; i++) {

    var groupPart = partGroup[i];
    var groupParticipant = this.getParticipant(groupPart.participantName);
    
    //only check parts which are both selection relative inserts and 
    // whose search locations match (so we can use the nodeNumber property)
    if ((participant.isSelectionRel && groupParticipant.isSelectionRel) ||
        (participant.isAroundNode && groupParticipant.isAroundNode)) {
      
      //assign the partBefore to the groupPart.  This function is probably
      //being called in the group file order, which means the new part
      //would be after any previous parts most of the time.
      var partBefore = groupPart;
      var partAfter  = part;

      // if they have the same insert location, check their order in the file
      if (participant.location == groupParticipant.location) {

        var names = this.participantNames;
        for (var j=0; j < names.length; j++) {
          if (names[j] == groupPart.participantName) {
            break;
          } else if (names[j] == part.participantName) { //swap the order
            partBefore = part;
            partAfter = groupPart;
            break;
          }
        }

      } else {  
        
        //because the locations are different, 
        // use [before, replace, after] as the order.
        if (groupParticipant.location.indexOf("after") != -1 ||
            (groupParticipant.location.indexOf("replace") != -1 &&
             participant.location.indexOf("before") != -1) ) {
          partBefore = part;
          partAfter  = groupPart;
        }

      }
      
      //check to see if partBefore is between partAfter and the node before it,
      // and partAfter is between partBefore and the node after it
      if (partBefore.position != null && partAfter.position != null && 
          partBefore.position < partAfter.position) {

        //now check that if parts of the same kind are between them, they are paired
        var count = 0;
        for (var j=partBefore.position + 1; j < partAfter.position; j++) {
          if (partList[j].participantName == partBefore.participantName) {
            count++;
          }
          if (partList[j].participantName == partAfter.participantName) {
            count--;
          }
          if (count < 0) {  //found partAfter first, bad position
            retVal = false;
            break;
          }
        }
        if (retVal && count != 0) { //parts did not match, bad position
          retVal = false;
        }
        
      } else {
        retVal = false;
      }
      
    }
  }
  
  return retVal;
}


//---------------
// Function: findInString
// Description: 
//   Locates the Behaviors which match this group
//   Returns a list of ssRecords (at most one ssRecord, for the given text)
//
function Group_findInString(theStr) {
  var ssRecList = new Array();
  
  var foundMatch = false;
  var ssRec = new SSRecord();

  for (var i=0; i < this.participants.length; i++) {
    var parameters = this.participants[i].findInString(theStr);
    if (parameters != null) {
      ssRec.parameters = parameters;
      foundMatch = true;
    }
  }

  if (foundMatch) {
    ssRecList.push(ssRec);
  }
  
  return ssRecList;
}



//---------------
// Function: apply
// Description: 
//   Apply a group to the page
//
function Group_apply(paramObj, sbObj) {
  
  if (this.DEBUG) alert("applying group: " + this.name);
  
  var editList = new SSEdits();     // array of edits to apply
    
  //fix up the selection
  if (!sbObj && paramObj.MM_selection == null) {
    paramObj.MM_selection = fixUpSelection(dw.getDocumentDOM(),false);
  }
  
  //we are changing groups, delete the old, and apply the new
  if (sbObj && sbObj.type != this.name) {
    
    this.applyNewGroup(editList, paramObj, sbObj);
    
  } else {
  
    //walk the list of participants
    for (var i=0; i < this.participants.length; i++) {

      var part = this.participants[i];

      //add each participant to the editList
      part.apply(editList, paramObj, sbObj);

    }
    
  }

  if (this.DEBUG) alert("applying group edits to the document: " + this.name);
  
  //insert all participants
  editList.insert();

}


//---------------
// Function: addEdits
// Description: 
//   adds the group edits to the given editList
//
function Group_addEdits(editList, paramObj, sbObj) {
  //walk the list of participants
  for (var i=0; i < this.participants.length; i++) {

    var part = this.participants[i];

    //add each participant to the editList
    part.apply(editList, paramObj, sbObj);

  }
}


//---------------
// Function: applyNewGroup
// Description: 
//   Converts the sb from one group type to another
//
function Group_applyNewGroup(editList, paramObj, sbObj) {

  if (this.DEBUG) alert("converting group (" + sbObj.type + ") to group: " + this.name);

  var oldGroup = new Group(sbObj.type);
  
  var usedNodes = new Array();

  //walk the list of participants
  for (var i=0; i < this.participants.length; i++) {

    //check if the participant exists in the previous group
    if (oldGroup.getParticipant(this.participants[i].name) != null) {
      
      if (this.DEBUG) alert("updating participant: " + this.participants[i].name);
      
      //apply as normal
      this.participants[i].apply(editList, paramObj, sbObj);

      //add the participants with this name to the used list
      for (var j=0; j < sbObj.participants.length; j++) {
        if (sbObj.types[j] == this.participants[i].name) {
          usedNodes.push(sbObj.participants[j]);
        }
      }

    } else { //participant not found in the previous record
      
      //need to find where to insert
      var foundInsert = false;
      for (var j=0; !foundInsert && j < sbObj.participants.length; j++) {
        
        //found a matching location
        if (sbObj.weights[j].indexOf(this.participants[i].location) == 0 &&
            !SB_isDependentNode(sbObj.participants[j],true)) {
          
          //make sure it is not already in the used node list
          var found = false;
          for (var k=0; !found && k < usedNodes.length; k++) {
            if (sbObj.participants[j] == usedNodes[k]) {
              found = true;
            }
          }
          
          if (!found) {
            
            //get text to insert and replace all parameters
            var insertText = this.participants[i].getInsertText(paramObj);
            
            if (insertText) {

              if (this.DEBUG) alert("replacing participant (" + sbObj.types[j] + ") with participant: " + this.participants[i].name);
            
              //add edit to editList
              editList.add(insertText, sbObj.participants[j], sbObj.weights[j]);      //add the participant

              //add this node to the used node list
              usedNodes.push(sbObj.participants[j]);

              foundInsert = true;
              
            }
          }
          
        }
      }
      
      //if no previous insert location found, apply as normal
      if (!foundInsert) {
        
        if (this.DEBUG) alert("inserting new participant: " + this.participants[i].name);
        
        this.participants[i].apply(editList, paramObj, sbObj);
        
      }
    }

  }

  //now, delete the participants that were not used
  for (var j=0; j < sbObj.participants.length; j++) {
    
    var found = false;
    for (var k=0; !found && k < usedNodes.length; k++) {
      if (sbObj.participants[j] == usedNodes[k]) {
        found = true;
      }
    }
    
    if (!found && !SB_isDependentNode(sbObj.participants[j],true)) {
      
      if (this.DEBUG) alert("deleting participant: " + sbObj.types[j]);
      
      editList.add("", sbObj.participants[j], sbObj.weights[j]);
    }
    
  }

}


//---------------
// Function: addParticipants
// Description: 
//   Adds participant objects to an existing Group. Does not add duplicates.
//
// Arguments:
//   participantsArray  - array of participant objects
//
// Returns:
//   nothing
//
function Group_addParticipants(participantsArray) {
  var part;

  for (var i=0; i<participantsArray.length; i++) {
    partExists = false;

    //scan existing participants to see if it already exists
    for (var j=0; j<this.participants.length; j++) {
      if (this.participants[j].name == participantsArray[i].name) {
        partExists = true;
        break;
      }
    }

    //if participant doesn't already exist, add it
    if (!partExists) {
      this.participants.push(participantsArray[i]);
      this.participantNames.push(participantsArray[i].name);
    }
  }
}



//*-------------------------------------------------------------------
// CLASS:
//   Participant
//
// DESCRIPTION:
//   This class represents participant file data.  The properties of
//   this class can be set from a participant xml file, or by hand,
//   and then the find and apply functions can be called to 
//   add and find the specified participant.
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//   getData(includeInsertData)
//   find(sbList, paramObj)
//   apply(editList, paramObj, sbObj)
//   getInsertString(paramObj, searchLocation)
//
//--------------------------------------------------------------------
function Participant(theName, theGroupName, findDataOnly) {
  
  //group level properties
  this.groupName = (theGroupName != null) ? theGroupName : '';
  
  this.partType = '';
  this.isIdentifier = true;
  this.isOptional = false;
  
  
  //participant properties
  this.name = (theName != null) ? theName : '';
  
  this.quickSearch = null;
  
  this.insertText = '';
  this.location = '';
  this.nodeParamName = '';
  
  this.searchPatterns = '';
  this.whereToSearch = '';
  
  this.updatePatterns = '';
  
  this.deleteType = '';
  

  // private properties
  this.isNodeRel = false;
  this.isSelectionRel = false;
  this.isAroundNode = false;
  this.hasUpdatePatterns = false;
  this.hasLimitedUpdates = false;
  
  this.DEBUG = false;   //SETDEBUG
  
  //initialize
  if (this.groupName || this.name) {
    this.getData((findDataOnly?false:true));
  }
  
}

// public methods
Participant.prototype.getData          = Participant_getData;
Participant.prototype.getInsertString  = Participant_getInsertString;
//Participant.prototype.find             = Participant_find;
Participant.prototype.findInString     = Participant_findInString;
Participant.prototype.apply            = Participant_apply;

// private methods
Participant.prototype.updateExistingNode = Participant_updateExistingNode;
Participant.prototype.getInsertNode = Participant_getInsertNode;
Participant.prototype.getInsertText = Participant_getInsertText;
Participant.prototype.expandParameterObject = Participant_expandParameterObject;
Participant.prototype.getWeight = Participant_getWeight;
Participant.prototype.extractNodeParam = Participant_extractNodeParam;


//---------------
// Function: getData
// Description: 
//   Get the information from the participant and group xml file
//
function Participant_getData(includeInsertData) {
  
  //get the group participant data
  if (this.groupName) {
    //get partType
    this.partType      = dw.getExtDataValue(this.groupName, "groupParticipants", this.name, "partType");
    
    //now set flags based on partType
    this.isIdentifier = (!this.partType || this.partType == "identifier");  //true is the default, if no partType
    this.isOptional   = (this.partType == "option" || this.partType == "multiple"); //false is default if no partType
  }
  
  //get the participant data
  if (this.name) {
    
    //get quickSearch
    this.quickSearch = dw.getExtDataValue(this.name, "quickSearch");
    
    //get insertText
    if (includeInsertData) {
      this.insertText = dw.getExtDataValue(this.name, "insertText");
    }

    //get insert location and node (this information is needed for both find and apply)
    this.location = dw.getExtDataValue(this.name, "insertText", "location");

    //WARNING: major hack.  Randy returns 6 garbage characters.  Remove
    //         these lines when he has fixed this bug.
    if (this.insertText.length >= 6) {
      var garbageStr = this.insertText.substring(this.insertText.length-6);
      if (garbageStr.search(/[^\s]/) == -1) {
        //alert(this.name+".insertText was:"+this.insertText+":");
        this.insertText = this.insertText.substring(0, this.insertText.length-6);
        //alert(this.name+".insertText is now:"+this.insertText+":");
      }
    }

    this.nodeParamName = dw.getExtDataValue(this.name, "insertText", "nodeParamName");
      
    //get whereToSearch
    this.whereToSearch = dw.getExtDataValue(this.name, "searchPatterns", "whereToSearch");
    
    //get searchPatterns
    this.searchPatterns = new Array();
    var searchPattList = dw.getExtDataArray(this.name, "searchPatterns");
    for (var i=0; searchPattList && i < searchPattList.length; i++) {
      if (searchPattList[i] != "whereToSearch") {
        var node = new Object();
        node.paramNames = dw.getExtDataValue(this.name, "searchPatterns", searchPattList[i], "paramNames");
		var isOptionalAttr = dw.getExtDataValue(this.name, "searchPatterns", searchPattList[i], "isOptional");
        node.isOptional = (isOptionalAttr == "true");
        node.pattern = dw.getExtDataValue(this.name, "searchPatterns", searchPattList[i]);
        node.match = '';
        this.searchPatterns.push(node);
      }
    }
    
    //get updatePatterns
    if (includeInsertData) {
      this.updatePatterns = new Array();
      var updatePattList = dw.getExtDataArray(this.name, "updatePatterns");
      for (var i=0; updatePattList && i < updatePattList.length; i++) {
        if (updatePattList[i] != "whereToSearch") {
          var node = new Object();
          node.paramName   = dw.getExtDataValue(this.name, "updatePatterns", updatePattList[i], "paramName");
          node.limitSearch = dw.getExtDataValue(this.name, "updatePatterns", updatePattList[i], "limitSearch");
          node.pattern     = dw.getExtDataValue(this.name, "updatePatterns", updatePattList[i]);
          this.updatePatterns.push(node);
          this.hasUpdatePatterns = true;
          if (node.limitSearch) {
            this.hasLimitedUpdates = true;
          }
        }
      }
    }
    
    //get deleteType
    this.deleteType = dw.getExtDataValue(this.name, "delete", "deleteType");
    
    
    //set some private properties
    this.isSelectionRel = (String(this.location).search(/selection/i) != -1);
    this.isNodeRel = (String(this.location).search(/node/i) != -1);
    this.isAroundNode = this.isNodeRel && 
                        ((String(this.location).search(/before/i) != -1) || 
                         (String(this.location).search(/after/i) != -1));
    
    //get the debug flag from the xml file
    if (!this.DEBUG) {
      this.DEBUG = (dw.getExtDataValue(this.name, "debug") == "true");
    }
  }
  
  //if debug is true, display the information for this participant file
  if (this.DEBUG) {
    var MSG = new Array();
    MSG.push("Participant Name: " + this.name);
    MSG.push("Part Type: " + this.partType);
    MSG.push("Insert Location: " + this.location);
    MSG.push("Node Param Name: " + this.nodeParamName);
    if (includeInsertData) {
      MSG.push("Insert Text: " + this.insertText + ":");
    }
    MSG.push("Where To Search: " + this.whereToSearch);
    MSG.push("Quick Search: " + this.quickSearch);
    MSG.push("Search Patterns:");
    for (var i=0; i < this.searchPatterns.length; i++) {
      if (this.searchPatterns[i].paramNames) {
        MSG.push("    " + this.searchPatterns[i].paramNames + " = " + this.searchPatterns[i].pattern);
      } else {
        MSG.push("    " + this.searchPatterns[i].pattern);
      }
    }
    if (this.hasUpdatePatterns) {
      MSG.push("Update Patterns:");
      for (var i=0; i < this.updatePatterns.length; i++) {
        MSG.push("    " + this.updatePatterns[i].paramName + " = " + this.updatePatterns[i].pattern);
      }
    }
    alert(MSG.join("\n"));
  }
  
}


//---------------
// Function: getInsertString
// Description: 
//   Get the text to be inserted for at a given location
//
// Returns: array of strings to be inserted at the given location
//
function Participant_getInsertString(paramObj, insertLocation) {
  var retVal = "";
  
  if (!insertLocation || this.location.indexOf(insertLocation) == 0) {
    
    var paramArray = this.expandParameterObject(paramObj);
    for (var i=0; i < paramArray.length; i++) {
      retVal += SB_replaceParamsInStr(this.insertText, paramArray[i]);
    }
        
  } else if (this.location.indexOf("wrapSelection") == 0) {

    if (insertLocation == "beforeSelection" || insertLocation == "afterSelection") {

      var paramArray = this.expandParameterObject(paramObj);

      for (var i=0; i < paramArray.length; i++) {

        //get the insert text
        var insertText = SB_replaceParamsInStr(this.insertText, paramArray[i]);

        //search for the tag name within the insertText
        var tagName = "";
        var match = insertText.match(/<([^<> ]*)/);
        if (match && match.length > 1) {
          tagName = match[1];
        }
    
  
        if (insertLocation == "beforeSelection") {

          //check if insert text already has a close tag, and remove it if found
          var closeTagPos = insertText.search(RegExp("<\\/"+tagName,"i"));
          if (closeTagPos != -1) {
            insertText = insertText.substring(0,closeTagPos);
          }

          retVal += insertText;

        } else if (insertLocation == "afterSelection") {

          if (tagName) {
            retVal += "</" + tagName + ">";
          }

        }
      }
    }
  }

  return retVal;
}


/*
//---------------
// Function: find
// Description: 
//   Return a list of PartInfo nodes, which represent the participant matches
//   on the page.
//
function Participant_find(paramObj) {
  var retList = new Array();
  
  //check if we have information for this node
  if (this.whereToSearch && this.searchPatterns.length) {
  
    if (this.DEBUG) alert("finding participant: " + this.name);

    var nodes, node, nodeStr, foundPos;

    //get the nodes to search
    nodes = SB_findAllNodesInLocation(this.whereToSearch);

    //for each search node, get string to search and see if it is a match
    for (var i=0; i < nodes.length; i++) {
      node = nodes[i];

      //get the string to search
      nodeStr = SB_convertNodeToString(node);

      //if all current patterns are found in the string, add node
      foundPos = SB_findPatternsInString(nodeStr, this.quickSearch, this.searchPatterns);
      if (foundPos) {

        var partInfo = new PartInfo(this, node, nodeStr, i, foundPos);
        
        //set previous and next pointers for easy traversal
        if (retList.length != 0) {
          retList[retList.length-1].next = partInfo;
          partInfo.previous = retList[retList.length-1];
        }
        
        retList.push(partInfo);

      } else if (this.DEBUG) {
        var MSG = new Array();
        MSG.push("match failed for participant: " + this.name);
        MSG.push("");
        MSG.push("against node:");
        MSG.push(nodeStr);
        MSG.push("");
        MSG.push("using pattern:");
        if (this.quickSearch && nodeStr.indexOf(this.quickSearch) == -1) {
          MSG.push(this.quickSearch);
        } else {
          for (var j=0; j < this.searchPatterns.length; j++) {
            if (!this.searchPatterns[j].match || !this.searchPatterns[j].match.length) {
              MSG.push(this.searchPatterns[j].pattern);
            }
          }
        }
        alert(MSG.join("\n"));
      }
    }
  
    if (this.DEBUG) {
      if (this.isIdentifier)
        alert("found " + retList.length + " matching nodes for identifier participant " + this.name);
      else
        alert("found " + retList.length + " matching nodes for non-identifier participant " + this.name);      
    }
    
  } else {
    if (this.DEBUG) alert("skipping find of empty participant: " + this.name);
  }

  //return the list of matching nodes
  return retList;
}
*/


//---------------
// Function: findInString
// Description: 
//   If the patterns match, this function returns a parameter object
//   with the extracted parameters.  Otherwise it returns null.
//
function Participant_findInString(theStr, findMultiple) {
  var retVal = null;
  
  if (SB_findPatternsInString(theStr, this.quickSearch, this.searchPatterns, findMultiple)) {
    
    if (this.DEBUG) alert("found participant " + this.name + " in string:\n" + theStr);
    
    retVal = SB_extractParameters(this.searchPatterns);
    
  } else if (this.DEBUG) {
    
    var MSG = new Array();
    MSG.push("match failed for participant: " + this.name);
    MSG.push("");
    MSG.push("against string:");
    MSG.push(theStr);
    MSG.push("");
    MSG.push("using pattern:");
    if (this.quickSearch && theStr.indexOf(this.quickSearch) == -1) {
      MSG.push(this.quickSearch);
    } else {
      for (var j=0; j < this.searchPatterns.length; j++) {
        if (!this.searchPatterns[j].match || !this.searchPatterns[j].match.length) {
          MSG.push(this.searchPatterns[j].pattern);
        }
      }
    }
    alert(MSG.join("\n"));
  }

  
  return retVal;
}



//---------------
// Function: apply
// Description: 
//   adds the information for the paraticipant to the edit list
//
function Participant_apply(editList, paramObj, sbObj) {
  
  //check that we have an insert location and insert text
  if (this.location && this.insertText) {
    
    var paramArray = this.expandParameterObject(paramObj);
    
    if (this.DEBUG && paramArray.length == 0) {
      alert("skipping participant " + this.name + ", with empty parameter");
    }
    
    var priorNodeArray = null;
    var deleteNodeArray = null;
    if (this.partType == "multiple") {
      
      priorNodeArray = new Array();
      deleteNodeArray = new Array();
      
      //find the priorNodes for each parameter object
      
      var partList = dw.getParticipants(this.name);
      for (var j=0; partList && j < partList.length; j++) {
        //get the node information
        this.extractNodeParam(partList[j].parameters, partList[j].participantNode);
      }

      for (var i=0; i < paramArray.length; i++) {
        if (sbObj && !sbObj.MM_forceMultipleUpdate) {
          for (var j=0; j < sbObj.params.length; j++) {
            if (sbObj.types[j] == this.name && 
                SB_parametersMatch(paramArray[i], sbObj.params[j])) {
              priorNodeArray.push(sbObj.participants[j]);
              break;
            }
          }
        }
        
        if (!sbObj || j == sbObj.params.length) {
          
          var existingNode = null;
         
          //look for an existing match on the page, 
          //if the insert location is aboveHTML, belowHTML, or the child of a node
          if ((!sbObj || !sbObj.MM_forceMultipleUpdate) &&
              (this.location.indexOf("aboveHTML") != -1 ||
               this.location.indexOf("belowHTML") != -1 ||
               this.location.indexOf("firstChildOfNode") != -1 ||
               this.location.indexOf("lastChildOfNode") != -1)) {

            if (partList) {
              //select the correct match and assign it to existingNode
              for (var j=0; j < partList.length; j++) {
                //if we have a match, set existingNode and break
                if (SB_parametersMatch(paramArray[i], partList[j].parameters)) {
                  existingNode = partList[j].participantNode;
                  break;
                }
              }
            }
          }
         
          priorNodeArray.push(existingNode);
        }
      }
      
      //identify the prior nodes which need to be deleted
      //(no need to delete attributes because their values get replaced anyhow
      if (sbObj && this.location.indexOf("nodeAttribute+") == -1) {
        for (var i=0; i < sbObj.participants.length; i++) {
          if (sbObj.types[i] == this.name) {
            for (var j=0; j < priorNodeArray.length; j++) {
              if (sbObj.participants[i] == priorNodeArray[j]) {
                break;
              }
            }
            if (j == priorNodeArray.length) {
              deleteNodeArray.push(sbObj.participants[i]);
            }
          }
        }
      }
    }
    
    
    //delete the extra multiple parameters
    if (deleteNodeArray != null) {
      for (var i=0; i < deleteNodeArray.length; i++) {
        var priorNode = deleteNodeArray[i];
        if (priorNode && !SB_isDependentNode(priorNode, true)) {

          if (this.DEBUG) alert("deleting the existing node: " + this.name);

          //delete the existing node
          editList.add("", priorNode, sbObj.getParticipantWeight(this.name,priorNode));
        }
      }
    }
    
    
    //now insert the new edits
    for (var index=0; index < paramArray.length; index++) {
      
      paramObj = paramArray[index];
      
      if (this.DEBUG) alert("adding edits for participant: " + this.name + " ["+ index + "]");

      var insertNode = this.getInsertNode(paramObj);

      //handle the create link insert node
      if (this.location.indexOf("nodeAttribute") == 0 && 
          typeof(insertNode) == "string" &&
          insertNode.indexOf("createAtSelection") == 0) {

        //get the tag and attribute names
        var tagName = this.whereToSearch.substring(this.whereToSearch.indexOf("+") + 1);
        var attrName = this.location.substring(this.location.indexOf("+") + 1);

        if (this.DEBUG && sbObj) alert("Trying to a create a new tag for an existing behavior");

        //get the text to insert within the tag from the insert node info
        var tagText = "";
        if (insertNode.indexOf("+") != -1) {
          tagText = insertNode.substring(insertNode.indexOf("+") + 1);
        }

        //create the insertion string
        insertText = this.getInsertText(paramObj);
        insertText = "<" + tagName + " " + attrName + "=\"" + insertText + "\">"+ tagText + "</" + tagName + ">";

        if (this.DEBUG) alert("adding new tag at selection for part: " + this.name);

        //add to the editList
        editList.add(insertText,false,"replaceSelection");

        break;
      }
      
      
      //handle the wrapSelection location
      if (this.location.indexOf("wrapSelection") == 0) {
        
        var insertText = this.getInsertText(paramObj);
        
        if (!sbObj) {
        
          if (paramObj.MM_selection != null) {
            tagText = paramObj.MM_selection;
          } else {
            tagText = fixUpSelection(dw.getDocumentDOM(),true);
          }

          //search for the tag name within the insertText
          var tagName = "";
          var match = insertText.match(/<([^<> ]*)/);
          if (match && match.length > 1) {
            tagName = match[1];
          }
          
          //check if insert text already has a close tag, and remove it if found
          var closeTagPos = insertText.search(RegExp("<\\/"+tagName,"i"));
          if (closeTagPos != -1) {
            insertText = insertText.substring(0,closeTagPos);
          }

          //now create the full string
          insertText = insertText + tagText + "</" + tagName + ">";

          if (this.DEBUG) alert("wrapping tag around selection for part: " + this.name);

          //add to the editList
          editList.add(insertText,false,"replaceSelection");
          
        } else {
          
          var priorNode = sbObj.getParticipant(this.name);
          
          if (priorNode != null) {

            if (this.DEBUG) alert("wrapping tag around selection for part: " + this.name);

            //add to the editList
            this.updateExistingNode(editList, priorNode, paramObj, "replaceSelection");
            
          }
        }

        break;
      }


      var priorNode = null;
      var existingNode = null;
      var updateNode = null;

      //if we already identified the existing node, just set it
      if (priorNodeArray != null) {
        
        existingNode = priorNodeArray[index];
        
      //try and find the prior node 
      } else {
        
        //if re-edit, set the priorNode
        if (sbObj) {
          priorNode = sbObj.getParticipant(this.name);
          
          if (sbObj.MM_forcePriorUpdate &&
              sbObj.MM_forcePriorUpdate.indexOf(this.name) != -1) {
            updateNode = priorNode;
          }
        }

        //look for an existing match on the page, 
        //if the insert location is aboveHTML, belowHTML, or the child of a node
        if ((!updateNode && !existingNode) &&
            (this.location.indexOf("aboveHTML") != -1 ||
             this.location.indexOf("belowHTML") != -1 ||
             this.location.indexOf("firstChildOfNode") != -1 ||
             this.location.indexOf("lastChildOfNode") != -1)) {

          var partList = dw.getParticipants(this.name);
          
          if (partList) {
            //select the correct match and assign it to existingNode
            for (var j=0; j < partList.length; j++) {
              
              //get the node information
              this.extractNodeParam(partList[j].parameters, partList[j].participantNode);

              //if we have a match, set existingNode and break
              if (SB_parametersMatch(partList[j].parameters, paramObj)) {
                existingNode = partList[j].participantNode;
                break;

              //if aboveHTML or belowHTML, check for family references, and may re-use an orphaned node
              } else if (this.location.indexOf("HTML")!=-1 && SB_onlyFamilyReferences(partList[j].participantNode)) {
                updateNode = partList[j].participantNode;
                //don't break, continue looking, in case there is an exact match
              }

            }
          }
          
        }
        
        //if we found both an existingNode and a node to update, choose the exact match
        if (existingNode && updateNode) {
          updateNode = null;
        }

        if (priorNode && !existingNode && !updateNode && !SB_isDependentNode(priorNode,true)) {
          updateNode = priorNode;
        }
        
      }

      if (updateNode != null) { //change the existing node to match the new parameters

        //if prior object being updated, pass that weight. Otherwise, pass new location weight
        if (sbObj) {
          this.updateExistingNode(editList, updateNode, paramObj, sbObj.getParticipantWeight(this.name,updateNode));
        } else {
          this.updateExistingNode(editList, updateNode, paramObj, this.location);
        }

        if (priorNode && updateNode != priorNode &&
            !SB_isDependentNode(priorNode, true)) {

          if (this.DEBUG) alert("deleting the existing node: " + this.name);

          //delete the existing node
          editList.add("", priorNode, sbObj.getParticipantWeight(this.name,priorNode));
        }
        
        
      } else if (existingNode != null) { //correct node was found, possibly delete prior
        
        if (this.DEBUG) alert("correct node found, no change needed: " + this.name);

        //can we delete the existing one.
        if (priorNode && existingNode != priorNode && !SB_isDependentNode(priorNode,true)) {

          if (this.DEBUG) alert("deleting the existing node: " + this.name);

          //delete the existing node
          editList.add("", priorNode, sbObj.getParticipantWeight(this.name,priorNode));

        }

        //add no-op node as positional placeholder so SSEdits class knows how to order same-weight inserts
        editList.add(null, existingNode, this.location);
        
        
      } else { //add new node
        
        if (this.DEBUG) alert("inserting new node: " + this.name + " with weight " + this.location);

        var insertText = this.getInsertText(paramObj);

        //add node if first time, but don't update if it has no search patterns
        if (!sbObj || this.searchPatterns.length) {
          editList.add(insertText,false,this.location,insertNode,null);
        }
        
      }
      
    }
    
  } else {
    if (this.DEBUG) alert("skipping apply of empty participant: " + this.name);
  }

}


//---------------
// Function: updateExistingNode
// Description: 
//   Update or replace an existing node
//
function Participant_updateExistingNode(editList, existingNode, paramObj, foundWeight) {
  if (existingNode) {


    if (this.hasUpdatePatterns) {  //update the existing node

      if (this.DEBUG) alert("updating existing node: " + this.name);

      if (this.hasLimitedUpdates && !existingNode.orig && existingNode.outerHTML) {
        //do a limited update using limitSearch attribute (only called if limitSearch == "innerOnly")
        var updateText = SB_replaceValuesInNode(existingNode, this.updatePatterns, paramObj);
      } else {
        //use the insertParams to update the text
        var updateText = SB_replaceValuesInString(SB_convertNodeToString(existingNode), this.updatePatterns, paramObj);
      }

      //add edit to editList
      editList.add(updateText, existingNode, foundWeight);      //add the participant

    } else { //replace the existing node

      if (this.DEBUG) alert("replacing existing node: " + this.name);

      //get text to insert and replace all parameters
      var insertText = this.getInsertText(paramObj);

      //add edit to editList
      editList.add(insertText,existingNode, foundWeight);      //add the participant
    }

  }
}


//---------------
// Function: getInsertNode
// Description: 
//   Return the insert node object that was passed in by the user.
//
function Participant_getInsertNode(paramObj) {
  var retVal = '';
  if (this.isNodeRel) {
    if (this.nodeParamName) {
      retVal = paramObj[this.nodeParamName]; //get node from paramObj.prop
    } else {
      alert(MM.MSG_NoNodeSpecForRelInsert);
    }
  }
  return retVal;
}


//---------------
// Function: getInsertText
// Description: 
//   Return the insert text, with the parameters replaced
//
function Participant_getInsertText(paramObj) {
  var retVal = this.insertText;
  retVal = SB_replaceParamsInStr(retVal, paramObj); //replace any parameters in text
  
  //remove new lines from attributes.
  if (this.location.indexOf("nodeAttribute") == 0) {
    retVal = retVal.replace(/[\f\n\r]\s*$/,"");
  }
  
  return retVal;
}


//---------------
// Function: expandParameterObject
// Description: 
//   This function is used to handle parameter objects which have a value
//   passed as an array.  These array values are expanded into multiple
//   parameter objects which can be handled individually, if the value
//   is used in the current participant.
//
//   Returns an array of parameter objects
//
function Participant_expandParameterObject(paramObj) {
  var retList = new Array();
  
  //find the parameter with the shortest length array.
  // We will use this parameter to iterate.
  var loopVar = '';
  for (var j in paramObj) {
    
    //is this an array parameter, and is it used in the current participant
    if (typeof paramObj[j] == "object" && paramObj[j].length != null && 
        this.insertText.indexOf("@@"+j+"@@") != -1) {
          
      if (!loopVar) {
        //we found the first parameter array
        loopVar = j;
      } else {
        //select the parameter array with the shortest length
        if (paramObj[j].length < paramObj[loopVar].length) {
          loopVar = j;
        }
      }
      
    }
    
  }
  
  //if we found an array parameter, expand it into a list of parameter objects
  // otherwise just add the current parameter object
  if (loopVar) {

    if (this.DEBUG) alert("creating " + paramObj[loopVar].length + " copies of paramObj for " + this.name);

    // create a new parameter object for each array value
    for (var k=0; k < paramObj[loopVar].length; k++) {
      
      var tempParams = new Object();
      for (var j in paramObj) {
        if (typeof paramObj[j] == "object" && paramObj[j].length != null) {
          tempParams[j] = paramObj[j][k]; // add array parameters
        } else {
          tempParams[j] = paramObj[j];    // add normal parameters
        }
      }

      //add the new parameter object
      retList.push(tempParams);
    }

  } else {
    
    //no arrays, add a single parameter object
    retList.push(paramObj);
  }
  
  return retList;
}



//---------------
// Function: getWeight
// Description: 
//   Given a participant node, it returns the weight value to be stored in the ssRec
//
function Participant_getWeight(theNode) {
  
  //get the weight information
  var retVal = this.location;

  //if the insert weight is nodeAttribute, add the position of the matched string
  if (retVal == "nodeAttribute") {
    
    //get the node string
    var nodeStr = SB_convertNodeToString(theNode);

    var foundPos = SB_findPatternsInString(nodeStr, this.quickSearch, 
                                           this.searchPatterns);

    if (foundPos) {
      retVal += "+" + foundPos[0] + "," + foundPos[1];
    }
  }

  return retVal;
}


//---------------
// Function: extractNodeParam
// Description: 
//   Extracts the value of the node parameter, and adds it to the
//   list of parameters
//
function Participant_extractNodeParam(parameters, node) {
  if (this.isNodeRel) {
    var nodeParam = this.nodeParamName;

    if ((this.location.indexOf("firstChildOfNode") == 0 ||
         this.location.indexOf("lastChildOfNode") == 0) && nodeParam) {
      parameters[nodeParam] = node.parentNode;

      //The current parent may not be the right one. Check if nodeParamName is
      //name__tag, name__node, nameTag, or nameNode, and if there is a parent node using that
      //exact name. If so, it's probably a better parent node to use for matching.
      if (parameters[nodeParam] && (nodeParam.search(/tag/i) > 0 || nodeParam.search(/node/i) > 0)) {
        var          theTag = nodeParam.substring(0,nodeParam.search(/__tag/i)); //extract tag name from nodeParam
        if (!theTag) theTag = nodeParam.substring(0,nodeParam.search(/__node/i));
        if (!theTag) theTag = nodeParam.substring(0,nodeParam.search(/tag/i));
        if (!theTag) theTag = nodeParam.substring(0,nodeParam.search(/node/i));
        if (theTag) {
          theTag = theTag.toUpperCase();
          if (parameters[nodeParam].tagName && parameters[nodeParam].tagName.toUpperCase() != theTag) { //if current node doesn't match
            var curNode = parameters[nodeParam];
            //ripple upward looking for a parent tag with that exact name
            while (curNode.tagName.toUpperCase() != theTag && curNode.parentNode.nodeType == Node.ELEMENT_NODE) { 
              curNode = curNode.parentNode;
            }
            //if exact match was found, switch to using that node
            if (curNode.tagName.toUpperCase() == theTag) {
              //DEBUG alert("parent tag "+(parameters[nodeParam].tagName.toUpperCase())+" changed to "+theTag);
              parameters[nodeParam] = curNode;
            }
          }
        }
      }

    } else if (this.location.indexOf("nodeAttribute") == 0) {
      parameters[nodeParam] = node;
    }
  }
}


//*********************  LOCAL FUNCTIONS ***************************


//*-------------------------------------------------------------------
// FUNCTION:
//   SB_isDependentNode
//
// DESCRIPTION:
//   This function returns true if more than one reference to the current
//   node is found.  If countGroupAsOne is true, references within the
//   same group of server behaviors are only counted once.
//
// ARGUMENTS:
//   node - the node to check
//   countFamilyAsOne - check the family attribute of the ssRec, to see if
//     multiple references to the same node are all part of the same family.
//
// RETURNS:
//   boolean - returns true if there is more than one reference to the
//             current node
//--------------------------------------------------------------------
function SB_isDependentNode(node, countFamilyAsOne) {
  var retVal = false;
  
  var num = 0; family = '';
  var ssRecs = dw.serverBehaviorInspector.getServerBehaviors();
  
  for (var i=0; !retVal && i < ssRecs.length; i++) { //search all ssRecs
    var parts = ssRecs[i].participants;
    for (j=0; !retVal && j < parts.length; j++) {    //scan ssRec participantNames
      if (parts[j] == node) {
        if (countFamilyAsOne && num > 0) {
          if (!ssRecs[i].family || ssRecs[i].family != family) {
            num++;
          }
        } else {
          num++;
          if (countFamilyAsOne && ssRecs[i].family) {
            family = ssRecs[i].family;
          }
        }
        if (num > 1) {
          retVal = true;
        }
        break; //only count one reference per ssRec
      }
    }
  }
  
  return retVal;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   SB_onlyFamilyReferences
//
// DESCRIPTION:
//   This function returns true if only family references point to a
//   given node.  If any references are not part of the family, then
//   false is returned.
//
// ARGUMENTS:
//   node - the node to check
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function SB_onlyFamilyReferences(node) {
  var retVal = false;
  
  var family = '';
  var onlyFamRefs = true;
  
  var ssRecs = dw.serverBehaviorInspector.getServerBehaviors();
  
  for (var i=0; onlyFamRefs && i < ssRecs.length; i++) { //search all ssRecs
    var parts = ssRecs[i].participants;
    for (j=0; onlyFamRefs && j < parts.length; j++) {    //scan ssRec participantNames
      if (parts[j] == node) {
        if (!ssRecs[i].family) {
          //no family, return false
          onlyFamRefs = false;
          break;
        } else if (!family) {
          family = ssRecs[i].family;
        } else if (ssRecs[i].family != family) {
          onlyFamRefs = false;
          break;
        }
      }
    }
  }
  
  //return true if onlyFamRefs is true, and a family value has been set
  retVal = (onlyFamRefs);
  
  return retVal;
}



//*-------------------------------------------------------------------
// FUNCTION:
//   SB_replaceParamsInStr
//
// DESCRIPTION:
//   This function replaces all occurrences of @@paramName@@ within a string,
//   using values from a javaScript object. The object must have each name
//   as a property. For example, values of obj.rs and obj.col will be used 
//   to update @@rs@@ and @@col@@ in a string.
//
// ARGUMENTS: 
//   theString - any string that may contain parameters @@paramName@@
//   paramObj  - a javaScript object with properties that match each paramName
//
// RETURNS:
//   a string with the parameters replaced with real values
//--------------------------------------------------------------------
function SB_replaceParamsInStr(theStr, paramObj) {
  if (typeof theStr == "string" && theStr.length && theStr.indexOf("@@") != -1) {  //if anything to replace
    for (var i in paramObj) {                                          //walk through parameters
      if (theStr.indexOf("@@"+i+"@@") != -1) {                         //if param found, replace it
        theStr = theStr.replace(RegExp("@@"+i+"@@","g"), paramObj[i]);
      }
    }
  }
  return theStr;
}



//*-------------------------------------------------------------------
// FUNCTION:
//   SB_replaceValuesInNode
//
// DESCRIPTION:
//   Replaces values within a given string using the updatePatterns,
//   and the new values passed in paramObj.
//   Adds support for the limitSearch attribute (only limitSearch="innerOnly").
//
// ARGUMENTS: 
//   theNode        - the node to update
//   updatePatterns - the regular expressions to use for making replacements
//   paramObj       - the new values to insert in the string
//
// RETURNS:
//   the updated string
//--------------------------------------------------------------------
function SB_replaceValuesInNode(theNode, updatePatterns, paramObj) {
  var retVal = '';
  var theStr = SB_convertNodeToString(theNode);

  if (typeof theStr == "string" && theStr.length && theNode.outerHTML) {
    var innerLength = theNode.innerHTML.length;
    var closeTagPos = theNode.outerHTML.lastIndexOf("</");
    var tagStart  = theStr.substring(0,closeTagPos-innerLength);
    var tagInner  = theStr.substring(closeTagPos-innerLength,closeTagPos);
    var tagEnd    = theStr.substring(closeTagPos);
    for (var i=0; i < updatePatterns.length; i++) {
      var limitSearch = updatePatterns[i].limitSearch;
      var newParamValue = paramObj[updatePatterns[i].paramName];
      if (updatePatterns[i].pattern) {  //if there is a pattern, use it to update
        var pattern = eval(updatePatterns[i].pattern);
        if (!limitSearch || limitSearch == "tagOnly") {
          tagStart = safeReplaceBetweenSubExpressions(tagStart, pattern, newParamValue);
        }
        if (!limitSearch || limitSearch == "innerOnly") {
          tagInner = safeReplaceBetweenSubExpressions(tagInner, pattern, newParamValue);
        }
        if (!limitSearch) {
          tagEnd   = safeReplaceBetweenSubExpressions(tagEnd  , pattern, newParamValue);
        }
      } else {
        if (limitSearch == "innerOnly") { //innerOnly update pattern, so blow away inner
          tagInner = newParamValue;
        } else if (limitSearch == "tagOnly") { //tag update pattern, so blow away inner
          tagStart = newParamValue;
        } else if (!limitSearch) { //no update pattern, so blow away whole thing
          tagStart = newParamValue;
          tagInner = "";
          tagEnd   = "";
        }
      }
    }
    retVal = tagStart + tagInner + tagEnd;
  }
  
  return retVal;
}



//*-------------------------------------------------------------------
// FUNCTION:
//   SB_replaceValuesInString
//
// DESCRIPTION:
//   Replaces values within a given string using the updatePatterns,
//   and the new values passed in paramObj.
//
// ARGUMENTS: 
//   theStr         - the string to update
//   updatePatterns - the regular expressions to use for making replacements
//   paramObj       - the new values to insert in the string
//
// RETURNS:
//   the updated string
//--------------------------------------------------------------------
function SB_replaceValuesInString(theStr, updatePatterns, paramObj) {
  var retVal = '';
  
  if (typeof theStr == "string" && theStr.length) {
    retVal = theStr;
    for (var i=0; i < updatePatterns.length; i++) {
      if (updatePatterns[i].pattern) {  //if there is a pattern
        pattern = eval(updatePatterns[i].pattern);
        retVal = safeReplaceBetweenSubExpressions(retVal, pattern, paramObj[updatePatterns[i].paramName]);
      } else {
        retVal = paramObj[updatePatterns[i].paramName]; //replace entire string
      }
    }
  }
  
  return retVal;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   safeReplaceBetweenSubExpressions
//
// DESCRIPTION:
//   Replaces pattern between sub-expressions with a new value, such as:
//     (prePattern)pattern(postPattern)
//   Finds all occurrences and replaces it safely (using replace() fails
//   if the newValue is a number.
//
// ARGUMENTS: 
//   theStr         - the string to update
//   regExpStr      - a regular expression (not a string!)
//   newValue       - the string to replace it with
//
// RETURNS:
//   the updated string
//--------------------------------------------------------------------

function safeReplaceBetweenSubExpressions(theStr, regExpPattern, newValue) {
  if (newValue != null) {
    var result;
    var attributes = "g" + ((regExpPattern.ignoreCase) ? "i" : "");
    var globalPattern = new RegExp(regExpPattern.source,attributes);
    while ((result = globalPattern.exec(theStr)) != null) {
      var newLength = theStr.length;
      theStr = theStr.substring(0, result.index) +
               result[1] + newValue + result[2] +
               theStr.substring(result.index + result[0].length);
      globalPattern.lastIndex += theStr.length - newLength;
    }
  }
  return theStr;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   SB_parametersMatch
//
// DESCRIPTION:
//   Checks if the two sets of parameters match.  Only parameters
//   which both sets have in common are checked.  If they have
//   no parameters in common, true is returned.
//
// ARGUMENTS: 
//   params1 - the first parameter object
//   params2 - the second parameter object
//
// RETURNS:
//   boolean - true if all common parameters match
//--------------------------------------------------------------------
function SB_parametersMatch(params1, params2) {
  var retVal = true;
  
  if (params1 != null && params2 != null) {
    //check if the parameters match
    for (var param in params1) {
      if (params2[param] != null  &&
          params2[param] != params1[param]) {
        retVal = false; //if any parameter doesn't match, break
        break;
      }
    }
  } 
  //else {
  //  alert("ERROR: null parameter object passed to SB_parametersMatch");
  //}

  return retVal;
}



//*-------------------------------------------------------------------
// FUNCTION:
//   SB_findPatternsInString
//
// DESCRIPTION:
//   This function looks for patterns within a string. If there are no patterns,
//   or all patterns are found, returns the position of the last pattern found
//   (which is equivalent to "true"). Otherwise returns null.
//
// ARGUMENTS: 
//   nodeStr        - a string, usually derived from a node elsewhere
//   quickSearch    - a string to quickly test if we have a possible match
//   searchPatterns - an array of patterns. If a pattern starts with /,
//                    it is used as a regular expression.
//   findMultiple   - match the search patterns multiple times within the
//                    given string
//
// RETURNS:
//   an array containing two numbers: the start and end offset position of the
//   last pattern found (if all found), otherwise null.
//--------------------------------------------------------------------
function SB_findPatternsInString(nodeStr, quickSearch, searchPatterns, findMultiple) {
  var pos = null;

  //if something to search and quick search matches (or is empty)
  if (nodeStr && quickSearch!=null && (nodeStr.indexOf(quickSearch) != -1 || !quickSearch)) {
    
    //pos is 0 if there are no patterns (returns true)
    var pos = new Array(0,0);

    //Tries each pattern. If patterns exist and any 
    //patterns are not found, breaks and returns null.
    //Otherwise remembers position of last match (used for "nodeAttribute" insertLocation).
    for (var i=0; i < searchPatterns.length; i++) {
    
      //get the search pattern
      var pattern = searchPatterns[i].pattern;
      
      //clear any old match information
      searchPatterns[i].match = '';

      //if pattern starts with "/", must be regular expression
      if (pattern.length > 2 && pattern.charAt(0)=="/") { //if regular expression, search for that
        pattern = eval(pattern);                          //convert /string/ to regular expression

        if (!findMultiple) {
          var match = nodeStr.match(pattern);                   //search for it as RegExp
          if (match) {
            pos[0] = match.index;            //remember position
            pos[1] = pos[0]+match[0].length;
            searchPatterns[i].match = match;
          } else if (!searchPatterns[i].isOptional) {
            pos = null;
            break;
          }
        } else {
          var match;
          var attributes = "g" + ((pattern.ignoreCase) ? "i" : "");
          var globalPattern = new RegExp(pattern.source,attributes);
          searchPatterns[i].match = new Array();
          while ( (match = globalPattern.exec(nodeStr)) != null ) {
            searchPatterns[i].match.push(match);
          }
          if (searchPatterns[i].match.length == 0 &&
              !searchPatterns[i].isOptional) {
            pos = null;
            break;
          }
        }

      //if no "/", do straight search
      } else {
        var offsetPos = nodeStr.indexOf(pattern); //search for string with indexOf()
        if (offsetPos != -1) {
          pos[0] = offsetPos;
          pos[1] = pos[0]+pattern.length;
        } else if (!searchPatterns[i].isOptional) {
          pos = null;
          break;
        }
      }
    }
  }
  return pos;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   SB_extractParameters
//
// DESCRIPTION:
//   This function takes the list of search patterns passed to the
//   function above, and extracts the parameters from the matched
//   expressions.
//
// ARGUMENTS:
//   searchPatterns - the list of search patterns passed to the 
//   findPatternsInString function
//   
//
// RETURNS:
//   a parameter object
//--------------------------------------------------------------------
function SB_extractParameters(searchPatterns) {
  var parameters = new Object();
  
  //find all the parameters in the current participant, 
  for (var i=0; i < searchPatterns.length; i++) {

    //check if we have parameters and that a match list was created
    if (searchPatterns[i].paramNames && searchPatterns[i].match) {
      
      //get the list of parameters to extract for this pattern
      var paramList = searchPatterns[i].paramNames.split(",");
      
      //get the match information
      var match = searchPatterns[i].match;
      var isMultiple = (match.length > 0 && typeof match[0] == "object");
      
      //now, extract the parameters from this pattern
      for (var j=0; j < paramList.length; j++) {
        var paramName = paramList[j];
        
        //skip over blank parameter names
        if (paramName) {
          if (!isMultiple) {
            if (match.length > j+1) {
              parameters[paramName] = match[j+1];
            } else {
              alert(errMsg(MM.MSG_NoMatchForParameter, paramName));
              parameters[paramName] = "";
            }
          } else {
            parameters[paramName] = new Array();
            for (var k=0; k < match.length; k++) {
              if (match[k].length > j+1) {
                parameters[paramName].push(match[k][j+1]);
              } else {
                alert(errMsg(MM.MSG_NoMatchForParameter, paramName));
                parameters[paramName].push("");
              }
            }
          }        
        }

      }
    }
  }
  
  return parameters;          
}



//*-------------------------------------------------------------------
// FUNCTION:
//   SB_findAllNodesInLocation
//
// DESCRIPTION:
//   Return array of node pointers according to location flag.
//
// ARGUMENTS:
//   loc - one of the following locations:
//     directive
//     TAG[,TAG]
//     TAG+ATTRIBUTE
//     * (any tag)
//     *+ATTRIBUTE
//     TAG+*
//     text
//
// RETURNS:
//   An array of document nodes
//--------------------------------------------------------------------
function SB_findAllNodesInLocation(loc) {

  var dom = dw.getDocumentDOM();
  var retVal = new Array();

  if (loc == "directive") {  //location is a directive
    retVal = dom.getElementsByTagName("MM:BEGINLOCK");
    
  } else if (loc.indexOf("+") != -1) { //location is attribute
    parameters = dw.getTokens(loc,"+");
    tagName  = parameters[0];
    attrName = parameters[1];
    retVal = dom.getElementsByTagName(tagName);
    if (attrName != "*") {  //remove all elements that don't have this attribute defined
        //remove some elements from retVal
    }
    
  } else if (loc.indexOf("/") != -1) { //location is compound tag
    parameters = dw.getTokens(loc,"/");
    tagName = parameters[0];
    tagType = parameters[1];
    var tagList = dom.getElementsByTagName(tagName);
    for (var i=0; i < tagList.length; i++) {
      if ((tagList[i].type != null && tagList[i].type.toUpperCase() == tagType.toUpperCase()) ||
          (tagList[i].type == null && tagType.toUpperCase() == "TEXT")) {
        retVal.push(tagList[i]);
      }
    }
    
  } else {  //location is tag name
    retVal = dom.getElementsByTagName(loc);
  }

  return retVal;
}



//*-------------------------------------------------------------------
// FUNCTION:
//   SB_convertNodeToSting
//
// DESCRIPTION:
//   This function determines what string should be searched in a given node.
//   If the node is locked, we use node.orig.
//   Otherwise we use the string node.outerHTML or node.data.
//
// ARGUMENTS: 
//   node        - a DOM pointer
//
// RETURNS:
//   the string to search
//--------------------------------------------------------------------
function SB_convertNodeToString(node) {
  // NOTE: This function should employ some sort of caching mechanism
  var nodeStr = "";
  if (node.orig) {
    nodeStr = unescape(node.orig);   //if locked node, convert to text
  } else if (node.outerHTML) {
    nodeStr = node.outerHTML;  //get entire node string
  } else if (node.data) {
    nodeStr = node.data;       //get just data in the case of comments or text
  }
  return nodeStr;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   getAllMyGroupIds
//
// DESCRIPTION:
//   This function determines which group XML files refer to the caller
//   (presumably a Server Behavior). If the caller is "foo.htm", returns
//   the id's of all groups files with <group serverBehavior="foo.htm">.
//
// ARGUMENTS:
//   sbName (optional) - the name of a Server Behavior such as My SB.htm
//                      (only use if *not* calling from a Server Behavior).
//
// RETURNS:
//   an array of group id's (XML group file names without the .xml)
//--------------------------------------------------------------------
function getAllMyGroupIds(sbName) {
  //get the name of the calling extension
  if (!sbName) {
    sbName = document.URL;
    var lastSlash = sbName.lastIndexOf("/");
    if (lastSlash != -1) {
      sbName = sbName.substring(lastSlash+1);
    }
  }
  
  //get the group ids matcing that name
  var groupIds = dw.getExtGroups(sbName,"serverBehavior");

  //walk the list of groupIds, and eliminate groups that do not
  // define any information for the current server model
  for (var i=groupIds.length-1; i >= 0; i--) {
    var hasData = false;
    var partNames = dw.getExtDataArray(groupIds[i],"groupParticipants");
    for (var j=0; j < partNames.length; j++) {
      if (dw.getExtDataValue(partNames[j], "insertText")) {
        hasData = true;
        break;
      }
    }    
    if (!hasData) {
      groupIds.splice(i,1);
    } 
  }

  return groupIds;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   getMyGroupId
//
// DESCRIPTION:
//   This function determines which group XML files refer to the caller
//   and finds the correct one. If multiple groups refer to the caller
//   it looks on the paramObj for special filter values and uses them.
//   When users pass in the paramObj to the applySBs() function, they
//   can add filter values to it to help resolve group conflicts:
//     paramObj.MM_dataSource - only consider groups where dataSource matches that
//     paramObj.MM_subTypes   - only consider groups where subTypes   matches
//   For each of these filters, groups without a dataSource or a subType are 
//   considered the default value if a more specific match connot be found.
//
// ARGUMENTS:
//   paramObj - an Object with parameter properties
//   sbName (optional) - the name of a Server Behavior such as My SB.htm
//                      (only use if *not* calling from a Server Behavior).
//
// RETURNS:
//   a single group id (XML group file names without the .xml), if a match was found.
//--------------------------------------------------------------------
function getMyGroupId(paramObj, sbName) {
  var groupId = "";
  var groupIds = getAllMyGroupIds(sbName);

  if (groupIds.length) {
    if (groupIds.length == 1) {
      groupId = groupIds[0];
    } else {
      //if subType or dataSource given, resolve ties by filtering using them
      if (paramObj) {

        var matchGroups = new Array();
        for (var i=0; i<groupIds.length; i++) {
          //if no dataSource or it matches, and no subType or it matches, keep groupId
          if (
              (
               (!paramObj.MM_dataSource && !dw.getExtDataValue(groupIds[i],"dataSource")) ||
               (paramObj.MM_dataSource && dw.getExtDataValue(groupIds[i],"dataSource") == paramObj.MM_dataSource)
              ) 
              &&
              (
               (!paramObj.MM_subType  && !dw.getExtDataValue(groupIds[i],"subType")) ||
               (paramObj.MM_subType && dw.getExtDataValue(groupIds[i],"subType") == paramObj.MM_subType)
              )
             ) {
            matchGroups.push(groupIds[i]);
          }
        }
        
        if (!matchGroups.length && paramObj.MM_subType) {
          for (var i=0; i<groupIds.length; i++) {
            //if no dataSource or it matches, and no subType, keep groupId
            if (
                (
                 (!paramObj.MM_dataSource && !dw.getExtDataValue(groupIds[i],"dataSource")) ||
                 (paramObj.MM_dataSource && dw.getExtDataValue(groupIds[i],"dataSource") == paramObj.MM_dataSource)
                ) 
                && !dw.getExtDataValue(groupIds[i],"subType") 
               ) {
              matchGroups.push(groupIds[i]);
              break;
            }
          }
        }
        
        if (!matchGroups.length && paramObj.MM_dataSource) {
          //if no dataSource, keep groupId
          for (var i=0; i<groupIds.length; i++) {
            if (!dw.getExtDataValue(groupIds[i],"dataSource")) {
              matchGroups.push(groupIds[i]);
              break;
            }
          }
        }

        //if anything left after filtering, use that
        if (matchGroups.length) {
          groupId = matchGroups[0];
        }
      }

    }
  }
  return groupId;
}
