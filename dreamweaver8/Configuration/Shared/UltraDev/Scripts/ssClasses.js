// SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
// 
// The ssClasses.js file defines the objects used by Server Behaviors to insert and delete
// code on the page, and to maintain information about that code. 
// When using this file you may also need to include the file ssDocManager.js and others.
//
// A Server Behavior is a Dreamweaver extension used to manage server code on the page.
// A Server Behavior instance is a single occurance of that server code. For example, 3 Recordsets
// means three Recordset Server Behavior instances will appear in the Server Behavior Inspector.
// For brevity I'll use the following shorthand: SB = Server Behavior, SBI = Server Behavior Inspector.
//
// --------------
// SSRecord class
// --------------
// The first class, SSRecord, defines an object used extensively by SBs. It stores
// information about each SB instance, and is used to communicate between your SB
// and Dreamweaver. Here is how it is used by each function in the Dreamweaver SB API:
//
//   findServerBehaviors()     - returns an array of SSRecords, one for each SB instance found on the page
//   canApplyServerBehavior()  - passed an SSRecord only if re-opening a SB instance
//   applyServerBehavior()     - passed an SSRecord only if re-opening a SB instance
//   inspectServerBehavior()   - passed the SSRecord for the selected SB instance
//   deleteServerBehavior()    - passed the SSRecord for the selected SB instance
//   
// Here is the flow for this API, and how the SSRecord is passed back and forth:
//  - Whenever the page is translated (after most edits), Dreamweaver calls your findServerBehaviors().
//    This code searchs the page for relevant tags. For each that is found, an SSRecord is created,
//    and an array of these SSRecords is returned by your findServerBehaviors()
//  - The title property for each SSRecord you returned will be displayed in the SBI
//  - If the user selects and deletes an SB instance, deleteServerBehavior() is called and passed
//    an SSRecord. This can then call the one public method of SSRecord: del(). For example, ssRec.del().
//  - If the user double-clicks a SB instance to edit it, inspectServerBehavior() is called and
//    passed the SSRecord. This function can use prior properties of the SSRecord to populate the UI.
//  - If the user clicks OK to apply a SB, applyServerBehavior() is called. This function
//    should add the new server code to the page (see the SSEdits class below). If we are re-applying
//    the SB, a prior SSRecord is passed so that applyServerBehavior() can update existing code instead.
//
// Public Properties of SSRecord (the first 4 are required):
//   title        - the string to be displayed in the SBI
//   selectedNode - a pointer to the node that should be highlighted when the SB instance is selected in the SBI
//   incomplete   - a boolean indicating that a SB instance is incomplete. If true, the SBI displays a red !.
//   participants - an array of node pointers, one for each SB participant. These are used to determine
//                  if a SB instance has been edited in any way. Also used to determine what should be deleted.
//   weights      - an array of weights for each participant (must parallel that array), used for weighted
//                  inserts to ensure new participants are correctly inserted among all existing participants.
//   types        - an array of type codes for each participant (must parallel that array), used by
//                  SBs to identify each participant.
//   type         - a type code for the SB, used by other SBs to identify each SB instance.
//   parameters   - an object for storing user-defined properties
//
//   There are often many properties added to the parameters object by particular SBs. These are used by the SB
//   to communicate with itself. For example, most SBs set a property to rememeber the Recordset used, for
//   example ssRec.parameters.rs = rsName. Then when inspectServerBehavior() is called, it can easily determine
//   the recordset to select by reading the ssRec.parameters.rs property.
//
// Public Methods of SSRecord:
//   del()            - used to delete all participants of the SSRecord.
//
//   This method accepts two optional flags. The first is preserveLinkContent. If this is set to true,
//   the content of link participants is preserved. For example, if you have a participant node like
//      <A HREF="<%=myServerCode%>">Linktext</A>
//   calling ssRec.del(true) will remove the <A> tag but leave Linktext on the page.
//
//   The second flag is preserveBetweenLocks. This is used by Repeat Region and Hide Region to remove the
//   code wrapping the region, but preserve the content of the region. For example: ssRec.del(false,true).
//
//
//   addParticipant() - used to add participant information to the SSRecord
//
//
// -------------
// SSEdits class
// -------------
// The second class, SSEdits, is used specifically by applyServerBehaviors() to build up a list of
// stuff to be inserted on the page, then to insert them all at once. If you were to insert participants
// directly, then after the first one was inserted all the participant pointers to all other SBs on the
// page would be stale. This class solves that problem (and many others!) by managing weighted inserts.
//
// Public Methods of SSEdits:
//   insert()     - executes all edits. Has no parameters, and should be called when done adding.
//   add()        - used to add an edit instruction. The 5 possible parameters are described below. 
//     text:     the text chunk to be inserted (or empty string to delete a node)
//     priorNode:false/"", or a node. Pass a node only if replacing an existing node.
//     weight:   an instruction for where the text should be inserted. If priorNode was given, weight is ignored.
//                 aboveHTML+nn: nn is an integer between 1 and 99. If the +nn is not specified, 99 is used.
//                         These weights are for participants to be inserted above the <HTML> tag.
//                         Typically, Recordset is 50, and other participants are relative, such as 40 or 60.
//                 belowHTML+nn: nn is an integer between 1 and 99. Adds after the close </HTML> tag
//                 beforeSelection, afterSelection, replaceSelection: relative to the current selection
//                 beforeNode, afterNode, replaceNode: relative to another node, given as the next parameter
//                 nodeAttribute+attribname: sets attribute attribName of node given as the next parameter
//                 nodeAttribute: inserts chunk in tag after the tagname
//     relativeNode(optional): Only passed if using a node-relative weight
//     dontStripCfoutput (optional): For Cold Fusion only. Normally, <cfoutput> tags are removed if we are
//                       inserting within existing cfoutput tags. This flag overrides that feature.
//
// Public Properties of SSEdits:
//   SSEdits is a subclass of Array, so you can read the length property.
//

function SSRecord(theTitle) {
//public
  this.title = theTitle || "";
  this.selectedNode = null;
  this.incomplete = false;
  this.type = "";

  this.participants = new Array();
  this.types = new Array();
  this.weights = new Array();
  this.deleteTypes = new Array();

  this.parameters = new Object();

//private
  this.deleteList = null;
}
//public methods
SSRecord.prototype.del = SSRecord_del;
SSRecord.prototype.addParticipant = SSRecord_addParticipant;
SSRecord.prototype.getParticipant = SSRecord_getParticipant;
SSRecord.prototype.getParticipantWeight = SSRecord_getParticipantWeight;

//private
SSRecord.prototype.sort = SSRecord_sort;

//first arg is optional: preserves the contents of any links being deleted. If the HREF of a link contains
//a ? (for example <A HREF="foo.asp?<%=blah%>">My Link</A>), preserves the entire link and strips out only
//the part of the HREF after the ? (becomes <A HREF="foo.asp">My Link</A>). Otherwise, strips the link,
//(becomes My Link).
//The second arg is also optional. If set to true, finds the first <MM:ENDLOCK> and the last <MM:BEGINLOCK>,
//and preserves the stuff in between. This is needed by Repeat Region to preserve the region.

function SSRecord_del(preserveLinkContent, preserveBetweenLocks) {
  var i,j,k, dom = dw.getDocumentDOM();
  var isColdFusion = (dom.serverModel.getServerName() == "Cold Fusion");
  var parts,dependencies,allSSRecs = dw.serverBehaviorInspector.getServerBehaviors();
  var bAddedContentBackIn;
  var allSrc = null;
  this.deleteList = new Array();

  for (i=0; i<this.participants.length; i++) { //with each object with something to insert
    this.deleteList[i] = new Array();
    this.deleteList[i].node = this.participants[i];

    //remember weight, if defined
    var weight = (this.weights && this.weights.length > i)? this.weights[i] : "";
    //if old style (number only) set to aboveHTML+nn
    if (typeof weight == "number") {
      weight = "aboveHTML" + weight;
    }
    this.deleteList[i].weight = String(weight);

    //remember deleteType, if defined
    var delType = (this.deleteTypes && this.deleteTypes.length > i)? this.deleteTypes[i] : "";
    //if the weight is "wrapSelection" and no delete type was specified,
    //we only should delete the outer tag
    if (weight == "wrapSelection" && !delType) {
      delType = "tagOnly";
    }
    this.deleteList[i].deleteType = delType;
  
    //count up the dependencies
    dependencies = 0;
    for (j=0; j<allSSRecs.length; j++) { //search all allSSRecs
      parts = allSSRecs[j].participants;
      for (k=0; k<parts.length; k++) if (parts[k] == this.deleteList[i].node) { //scan ssRec participants
        dependencies++; break;
    } }

    //DEBUG alert("delete flag is "+typeof delType+" = "+delType);
    if (dependencies <= 1 && delType != "none") {
      //if Cold Fusion dynamic content, and parent is <cfoutput>, mark it for deletion too
      if (isColdFusion && this.deleteList[i].node.tagName == "MM_DYNAMIC_CONTENT"
          && this.deleteList[i].node.parentNode.tagName == "CFOUTPUT"
          && this.deleteList[i].node.parentNode.childNodes.length==3) {
        this.deleteList[i].node = this.deleteList[i].node.parentNode;
      }
      
      //DEBUG alert("Maybe deleting "+this.deleteList[i].node.outerHTML);
      var delRange = dom.nodeToOffsets(this.deleteList[i].node);   //default delete range is entire node

      //if weights are stored, special weights like nodeAttribute can alter the delete
      if (weight) {

        //get extra weight info (the stuff after the + in the weight)
        weightInfo = "";
        if (weight.indexOf("+") != -1) {                        //if weight has extra info
          weightInfo = weight.substring(weight.indexOf("+")+1); //get info
        }

        //if weight is "nodeAttribute+[ATTRIB | nn,nn]", find precise pos of attribute to remove it
        if (weight.indexOf("nodeAttribute+") == 0) {

          //nodeAttribute+ATTRIB
          if (weight.indexOf(",") == -1) {   //if followed by ATTRIB, not absolute numbered position
            if (delType != "tagOnly") { //delete the attribute if not "tagOnly" (only value if "innerOnly")
              //set range to entire attrib, unless "innerOnly", then only the value
              delRange = findAttributePosition(this.deleteList[i].node, weightInfo, (delType != "innerOnly")); 
            }

          //nodeAttribute+nn,nn
          } else {  //must be numbered position
            //if weight is "nodeAttribute+25,50", remove only that range within the tag
            //weightInfo is an offset position of the chunk to delete.
            //For example, if the tag is <option <%=foo> ...>, the weight is "nodeAttribute+8,13" so we delete the directive.
            offsets = weightInfo.split(",");
            if (offsets.length > 1) {
              //using absolute start of tag (delRang[0]), compute absolute offsets to del
              delRange[1] = delRange[0] + parseInt(offsets[1]);
              delRange[0] += parseInt(offsets[0]);
              if (!allSrc) allSrc = dom.documentElement.outerHTML;
              //if preceded and followed by space (which is added by insert), remove that too
              if (allSrc.charAt(delRange[0]-1) == " " && allSrc.charAt(delRange[1]) == " ") {
                delRange[0]--;
              }
            } else {                //if nodeAttribute has no offsets, don't delete anything
              delRange = null;
            }
          }
        }

        if (delType.indexOf("attribute+") == 0) {
          var delInfo = delType.substring(delType.indexOf("+")+1); //get info
          delRange = findAttributePosition(this.deleteList[i].node, delInfo, true); 
        }
      }

      if (delRange && delRange.length) {
        this.deleteList[i].insertPos  = delRange[0];
        this.deleteList[i].replacePos = delRange[1];
      } else {
        this.deleteList[i].insertPos  = -1;
      }
    } else {
      //DEBUG alert("**NOT** Deleting "+this.deleteList[i].node.outerHTML);
      this.deleteList[i].insertPos  = -1;  //flag to not delete (there are more than 1 participants)
    }
  }

  if (this.deleteList.length) {
    this.deleteList = this.sort(); //Make sure our edits are in order
    dw.useTranslatedSource(false);
    var newSrc = "", lastInsert=-1;
    for (i=0; i<this.deleteList.length; i++) { //with each object, see if there's something to insert
      node = this.deleteList[i].node;
      weight = this.deleteList[i].weight;
      delType = this.deleteList[i].deleteType;
      insertPos = this.deleteList[i].insertPos;
      if (insertPos != -1) {
        replacePos = this.deleteList[i].replacePos;
        if (!allSrc) allSrc = dom.documentElement.outerHTML;
        newSrc += allSrc.substring(lastInsert,insertPos);
        bAddedContentBackIn = false;

        //if block tag and deleteType is tagOnly, remove the outer tag only and leave the innerHTML.
        //For compatibility with UD1 calls, also works if passed delete flag and it's a link.
        if (isBlockTag(node) && (delType=="tagOnly" || (preserveLinkContent && node.tagName == "A"))) {
          newSrc += node.innerHTML;
          bAddedContentBackIn = true;
        }

        //if block tag & innerOnly delete, find first and last child node positions
        if (node.nodeType == Node.ELEMENT_NODE && weight.indexOf("nodeAttribute")==-1 &&
            delType == "innerOnly") {

          //has a child, so use that to add back all before the child, and after the innerHTML
          if (node.hasChildNodes() && node.childNodes.length) {
            var outerLength = node.outerHTML.length;
            var innerLength = node.innerHTML.length;
            var closeTagPos = node.outerHTML.lastIndexOf("</");
            //delRange = dom.nodeToOffsets(node.childNodes[0]);
            newSrc += allSrc.substring(insertPos, insertPos + closeTagPos - innerLength);
            newSrc += allSrc.substring(insertPos + closeTagPos,insertPos + outerLength);

          //nothing in it, so don't delete anything
          } else {
            newSrc += node.outerHTML;
          }
        }

        //OLD CODE, for compatibility with UD1 calls that might pass delete flags
        if (preserveBetweenLocks) { //special case to preserve between locks (for Repeated Region)
          dw.useTranslatedSource(true);
          newChunk = node.innerHTML;
          //DEBUG alert("save kids of node '"+node.tagName+"'="+node.outerHTML);
          if (node.hasChildNodes() && node.childNodes.length && node.childNodes[0].tagName && node.childNodes[0].tagName.search(/MM[:_]/i)==0) { //preserve locked tag content
            start = newChunk.toUpperCase().indexOf("<MM:ENDLOCK>");      //find first EndLock
            start = (start == -1)? 0 : start + "<MM:ENDLOCK>".length;
            end   = newChunk.toUpperCase().lastIndexOf("<MM:BEGINLOCK"); //> find last BeginLock
            if (end != -1) {
              //DEBUG alert("preserving locked tag content: "+newChunk.substring(start,end));
              newSrc += newChunk.substring(start,end);
              bAddedContentBackIn = true;
            }
          } else { //preserve normal tag content
            //DEBUG alert("preserving normal tag content: "+newChunk);
            newSrc += newChunk;
            bAddedContentBackIn = true;
          }
          dw.useTranslatedSource(false);
        }

        if ((!bAddedContentBackIn) && (weight.indexOf("nodeAttribute") == -1) && node.parentNode &&
            (node.parentNode.nodeType == Node.ELEMENT_NODE) && isCollapsibleTag(node.parentNode.tagName)) {
          dw.useTranslatedSource(true);
          var origParentCode = node.parentNode.innerHTML;
          var newParentCode = "";
          var deletedCode = node.outerHTML;
          startToDelete = origParentCode.indexOf(deletedCode);
          if (startToDelete != -1) {
            var newParentCode = "";
            if (startToDelete > 0) {
              newParentCode = origParentCode.substring(0, startToDelete);
            }
            if (origParentCode.length > (startToDelete + deletedCode.length)) {
              newParentCode += origParentCode.substring(startToDelete + deletedCode.length, origParentCode.length);
            }
            newParentCode = newParentCode.replace(/\s*<MM:BeginLock .*>\s*<MM:EndLock>\s*/gi, "");
            newParentCode = newParentCode.replace("\s*", "");
            if (newParentCode.length == 0) {
              newSrc += "&nbsp;";
            }
          }
          dw.useTranslatedSource(false);
        }
        lastInsert = (replacePos!=null)? replacePos : insertPos;
      }
    }
    if (lastInsert!=-1) dom.documentElement.outerHTML = newSrc + allSrc.substring(lastInsert);
  }
}


//Adds the participant information to the SSRecord
// node is the document node of the participant
// weight and node can be null

function SSRecord_addParticipant(node, weight, type, deleteType) {
  if (node != null) {
    this.participants.push(node);
    this.weights.push(weight);
    this.types.push(type);
    this.deleteTypes.push(deleteType);
  }
}


//Returns the participant node with the given type

function SSRecord_getParticipant(theType) {
  var retVal = null;
  
  for (var i=0; i < this.types.length; i++) {
    if (this.types[i] == theType) {
      retVal = this.participants[i];
      break;
    }
  }
  
  return retVal;
}


//Returns the participant weight with the given type.
//If a node is passed, must also match that.

function SSRecord_getParticipantWeight(theType, theNode) {
  var retVal = null;
  
  for (var i=0; i < this.types.length; i++) {
    if (this.types[i] == theType && (!theNode || this.participants[i] == theNode)) {
      retVal = this.weights[i];
      break;
    }
  }
  
  return retVal;
}


//Sort to ensure that the array is ordered
//from lowest to highest as far as .insertPos is concerned.
function SSRecord_sort() {
  var i,j,k,s,inserted,ins,sortedOffs = new Array();
  var a = this.deleteList;
  sortedOffs.push(a[0]);
  for (i = 1; i < a.length; i++) {
    inserted = false;
    for (j = 0; j < sortedOffs.length; j++) {
      s = sortedOffs[j];
      ins = a[i];
      if (s.insertPos > ins.insertPos) { //push rest back on
        for (k = sortedOffs.length; k > j; k-- ) if ((k - 1) > -1) {
            sortedOffs[k] = sortedOffs[k - 1];
        }
        sortedOffs[j] = ins; //insert this new one here
        inserted = true ;
        break;
    } }
    if (!inserted) sortedOffs.push(a[i]);
  }
  return sortedOffs;
}



//Given a node to search and an attribute name (or position),
//locates the absolute character position of the attribute value. Useful if you
//want to insert or delete attributes using strings. For example, given
//  <form method="post" action="foo.htm">
//calling findAttributePosition(formNode, "ACTION") will return the character
//position of value foo.htm. If the attribute does not exist, returns null.
//Otherwise, returns 2-member array (like dom.getSelection()) where arr[0] is the start
//position and arr[1] is the end position of the value of the attribute.
//ARGUMENTS:
//  node      - a DOM pointer to the tag to search
//  attrName  - attribute name to search for (case insensitive), or position in the form of nn,nn
//  getEntirePos - (optional) if true, returns position of full 'someattrib="value"'
//                 By default, it's false and the function returns the position of the value

function findAttributePosition(node, attrName, getEntirePos) {
  var attrPosition = null, offsets;
  var tagStartPos;
  var dom = dw.getDocumentDOM();
  var tagStr = node.outerHTML;               //get tag string

  //if attrName is actually a relative position "nn,nn", find absolute location
  if (attrName.indexOf(",")>0) { //if weight is positioned nodeAttribute+nn,nn
    offsets = attrName.split(",");
    if (offsets.length == 2) {
      tagStartPos = dom.nodeToOffsets(node)[0]; //find absolute node position
      attrPosition = new Array();
      attrPosition[0] = tagStartPos + parseInt(offsets[0]); //change relative offsets to absolute
      attrPosition[1] = tagStartPos + parseInt(offsets[1]); //change relative offsets to absolute
    }

  //if attrName is *, find position of all attributes (<div????????????????>), used by delete
  } else if (attrName.indexOf("*")!=-1 && tagStr && tagStr.charAt(0) == "<") { //if all attributes (indicated by *)
    tagStartPos = dom.nodeToOffsets(node)[0]; //find absolute node position
    var parameters = tagStr.match(/<[^ <>]+/);
    if (parameters) { //if found tag name
       var startPos = parameters[0].length;
       var outerLength = tagStr.length;
       var innerLength = node.innerHTML.length;
       var closeTagPos = tagStr.lastIndexOf("</");
       if (closeTagPos > 0) {
         attrPosition = new Array();
         attrPosition[0] = tagStartPos + startPos; //step past open tagchange relative offsets to absolute
         attrPosition[1] = (tagStartPos + closeTagPos) - (innerLength + 1); //position of > in open tag
       }
    }

  //if attrName is an attribute name, find it if it exists
  } else {
    //search for attribute assignment: ' attrName="'
    var attrMatch = tagStr.match(RegExp(" "+attrName+"\\s*=\\s*(['\"])?","i")); //quote is optional
    if (attrMatch) {                            //if attrib found
      var theQuote = attrMatch[1];
  
      //determine start and end position of attribute assignment
      attrPosition = new Array();
      attrPosition[0] = attrMatch.index;         //start at beginning: 'attrib="value"'
      if (!getEntirePos) {                       //but if only finding the value part
        attrPosition[0] += attrMatch[0].length;  //start at value part
      }
      attrPosition[1] = attrMatch.index + attrMatch[0].length + node[attrName].length; //end after value
      if (getEntirePos && theQuote) attrPosition[1]++; //step past close quote if quoted and getting entire pos
  
      //change position from node relative to document relative
      tagStartPos = dom.nodeToOffsets(node)[0]; //find absolute node position
      attrPosition[0] += tagStartPos;   //change relative offsets to absolute
      attrPosition[1] += tagStartPos;
    }
  }

  return attrPosition;
}



function isCollapsibleTag(theTag) {
  var collapsibleTagNames = " P H1 H2 H3 H4 H5 H6 PRE BLOCKQUOTE TD TH DT DD CAPTION ";
  var upperTag = theTag.toString().toUpperCase();
  var n = collapsibleTagNames.indexOf(" "+upperTag+" ");
  return (n != -1);
}


// This function is called from the C code when pasting an SSRec
// (see ActionFrameClip.cpp)
function createSSRecord()
{
  return new SSRecord();
}




//Class SSEdits: an array of SSEdit objects
//Usage:
//  var editList  = new SSEdits();
//  editList.add(text,priorNode,weight,nodeForNodeWeights, dontStripCfoutput);
//

function SSEdits() {
  if (SSEdits.arguments.length > 0) this.add(SSEdits.arguments);
}
SSEdits.prototype = new Array;
SSEdits.prototype.add = SSEdits_add;
SSEdits.prototype.insert = SSEdits_insert;
SSEdits.prototype.sortWeights = SSEdits_sortWeights;
SSEdits.prototype.sortInserts = SSEdits_sortInserts;
SSEdits.prototype.removeSpaceFromTableCell = SSEdits_removeSpaceFromTableCell;

function SSEdits_add() {
  var argList = SSEdits_add.arguments;
  this.push(new SSEdit(argList));
}


//Class SSEdit

function SSEdit(args) {
  //public
  this.text              = args[0];
  this.priorNode         = args[1] || false;
  this.weight            = args[2] || ""; //aboveHTML[+nn], belowHTML[+nn],
                                          //beforeSelection, afterSelection, replaceSelection,
                                          //beforeNode, afterNode, replaceNode,
                                          //nodeAttribute[+attribname]
  this.node              = args[3] || null;  //optional: only used with "...Node" weights
  this.dontStripCfoutput = args[4] || false; //optional: only used in Cold Fusion if you *don't* want smart cfoutputs

  this.defaultWeight     = 99;

  //private
  this.insertPos  = null;
  this.replacePos = null;

  this.weightType        = "";    //weight *might* have a preword, like aboveHTML or nodeAttribute
  this.weightNum         = null;  //weight *might* include a number (set below)
  this.weightInfo        = "";    //weight *might* have extra info, like an attribute name (set below)

  //Initialize weight, weightNum, and weightInfo properties
  //Determine correct weight type, and assign extra weight properties
  if (this.weight) {

    //if weight is just number, change to aboveHTML+number
    if (this.weight == String(parseInt(this.weight))) { //if just number (old style)
      this.weightNum  = parseInt(this.weight); //convert if number
      this.weightType = "aboveHTML";
      this.weight = this.weightType + "+" + this.weight;  //default is aboveHTML

    //if extra weight info (someWeight+someData), extract data
    } else if (this.weight.indexOf("+") > 0) {   
      var data = this.weight.substring(this.weight.indexOf("+")+1);
      this.weightType = this.weight.substring(0,this.weight.indexOf("+"));

      //if weight is ??+number, extract the number
      if (data == String(parseInt(data))) {
        this.weightNum = parseInt(data); //convert if number

      //if weight is ??+??, save data as info
      } else {
        this.weightInfo  = data;
      }

    //if weight is aboveHTML or belowHTML, add default weight number
    } else if (this.weight == "aboveHTML" || this.weight == "belowHTML") {   
      this.weightType = this.weight;
      this.weight += "+"+String(this.defaultWeight);
      this.weightNum = this.defaultWeight;

    //for backward compatibility,convert "afterDocument" to "belowHTML"
    } else if (this.weight == "afterDocument") {   
      this.weightType = "belowHTML";
      this.weight = this.weightType + "+" + String(this.defaultWeight);
      this.weightNum = this.defaultWeight;
    }
  } else { //default if no weight given
    this.weight     = "aboveHTML+"+String(this.defaultWeight);
    this.weightType = "aboveHTML";
    this.weightNum = this.defaultWeight;
  }
}


//Must be passed an object of type SSEdits, and each edit must be in page order (top to bottom)

function SSEdits_insert() {
  var maintainSelection = SSEdits_insert.arguments[0] || false;  //optional: if true we will attempt maintain the current selection
  var i,j,k;
  var dom = dw.getDocumentDOM();
  var isColdFusion = (dom.serverModel.getServerName() == "Cold Fusion");
  var stripCfoutput;
  var insertNode, insertWeight, newWeight, allSSRecs, pos;
  var allSSRecs = dw.serverBehaviorInspector.getServerBehaviors();
  var tagSelection = null;
  var langNode = getLanguageNode();
  this.allSrc = null;

  if (maintainSelection) {
    tagSelection = getTagSelection();
  }

  this.sortWeights(); //Make sure weights are in order

  for (j=0; j<this.length; j++) { //with each object with something to insert
    editObj = this[j];
    stripCfoutput = (isColdFusion && !editObj.dontStripCfoutput);

    if (editObj.priorNode) { //if node was already there, replace it

      //DEBUG alert("updating item with weight "+editObj.weight+"\n:"+editObj.text+":");
      if (editObj.text != null) {  //if text (or empty string) to update with
        //if nodeAttribute, only update the attribute (or tag section)
        if (editObj.weight.indexOf("nodeAttribute")==0) {
          pos = findAttributePosition(editObj.priorNode, editObj.weightInfo);
          if (pos) {
            editObj.insertPos  = pos[0];
            editObj.replacePos = pos[1];
            if (editObj.weight.indexOf(",") != -1 && !editObj.text) { //if positional attribute and removing text
              if (!this.allSrc) this.allSrc = dom.documentElement.outerHTML;
              //if attribute has space before and after, and removing attribute, strip a space
              if (this.allSrc.charAt(editObj.insertPos-1) == " " && this.allSrc.charAt(editObj.replacePos) == " ") {
                editObj.replacePos++;
              }
            }
          }
          
  
        //otherwise, do a full replace of the tag
        } else {  //do full replace

          //if replacing a block tag and new text is starts same but has no end tag, preserve innerHTML
          if (isBlockTag(editObj.priorNode) && (editObj.text.search(RegExp("\\s*<"+editObj.priorNode.tagName,"i"))==0)
              && (editObj.text.search(RegExp("</"+editObj.priorNode.tagName,"i"))==-1)) {
            pos = editObj.priorNode.outerHTML.lastIndexOf("</");
            editObj.insertPos  = dom.nodeToOffsets(editObj.priorNode)[0];
            editObj.replacePos =  editObj.insertPos + pos - editObj.priorNode.innerHTML.length;

          } else {
            //get outer position of tag
            editObj.insertPos  = dom.nodeToOffsets(editObj.priorNode)[0];
            editObj.replacePos = dom.nodeToOffsets(editObj.priorNode)[1];
          }
        }
        if (stripCfoutput) editObj.text = stripCfoutputIfNested(editObj.text, editObj.priorNode);

      }

    } else if (editObj.text && editObj.text != null) { //if something to insert

      //DEBUG alert("inserting item with weight "+editObj.weight+", type=:"+editObj.weightType+":\n:"+editObj.text+":");
      if (editObj.weight=="beforeNode") {
        editObj.insertPos  = dom.nodeToOffsets(editObj.node)[0];
        editObj.replacePos = dom.nodeToOffsets(editObj.node)[0];
        if (stripCfoutput) editObj.text = stripCfoutputIfNested(editObj.text, editObj.node);

      } else if (editObj.weight=="replaceNode") {
        editObj.insertPos  = dom.nodeToOffsets(editObj.node)[0];
        editObj.replacePos = dom.nodeToOffsets(editObj.node)[1];
        if (stripCfoutput) editObj.text = stripCfoutputIfNested(editObj.text, editObj.node);

      } else if (editObj.weight=="afterNode") {
        editObj.insertPos  = dom.nodeToOffsets(editObj.node)[1];
        editObj.replacePos = dom.nodeToOffsets(editObj.node)[1];
        if (stripCfoutput) editObj.text = stripCfoutputIfNested(editObj.text, editObj.node);
        
      } else if (editObj.weight.indexOf("firstChildOfNode") == 0) {
        if (editObj.node.nodeType == Node.ELEMENT_NODE) {
          if (editObj.node.hasChildNodes()) {
            editObj.insertPos  = dom.nodeToOffsets(editObj.node.childNodes[0])[0];
            editObj.replacePos = dom.nodeToOffsets(editObj.node.childNodes[0])[0];
          } else {
            var tagName = editObj.node.tagName;
            var pos = editObj.node.outerHTML.search(RegExp("<\\/"+tagName+">","i"));
            if (pos == -1) pos = editObj.node.outerHTML.indexOf("</");
            pos += dom.nodeToOffsets(editObj.node)[0];
            editObj.insertPos  = pos;
            editObj.replacePos = pos;
          }
        }
        if (stripCfoutput) editObj.text = stripCfoutputIfNested(editObj.text, editObj.node);
        
      } else if (editObj.weight.indexOf("lastChildOfNode") == 0) {
        if (editObj.node.nodeType == Node.ELEMENT_NODE) {
          if (editObj.node.hasChildNodes()) {
            var last = editObj.node.childNodes.length - 1;
            editObj.insertPos  = dom.nodeToOffsets(editObj.node.childNodes[last])[1];
            editObj.replacePos = dom.nodeToOffsets(editObj.node.childNodes[last])[1];
          } else {
            var tagName = editObj.node.tagName;
            var pos = editObj.node.outerHTML.search(RegExp("<\\/"+tagName+">","i"));
            if (pos == -1) pos = editObj.node.outerHTML.indexOf("</");
            pos += dom.nodeToOffsets(editObj.node)[0];
            editObj.insertPos  = pos;
            editObj.replacePos = pos;
          }
        }
        if (stripCfoutput) editObj.text = stripCfoutputIfNested(editObj.text, editObj.node);
        
      } else if (editObj.weight.indexOf("nodeAttribute") == 0) {

        //nodeAttribute+ATTRIB (not numerically positioned)
        if (editObj.weightInfo && editObj.weightInfo.length) {
          if (stripCfoutput) editObj.text = stripCfoutputIfNested(editObj.text, editObj.node);
          var pos = findAttributePosition(editObj.node, editObj.weightInfo); //get pos of attrib value
          if (!pos) {                                                        //if attrib doesn't exist
            pos = new Array();
            pos[0] = dom.nodeToOffsets(editObj.node)[0] + editObj.node.tagName.length + 1;  //skip <tag
            pos[1] = pos[0];
            editObj.text = ' '+editObj.weightInfo+'="'+editObj.text+'"'; //change text to include entire attribute
          }
          editObj.insertPos  = pos[0];
          editObj.replacePos = pos[1];

        //nodeAttribute. Insert string directly into tag after tag name  <TAG [INSERT HERE!] ...>
        } else {  //must be numbered position
          //inserts into node tag. For example, you may want to change <option> to <option<%= if (foo)..%>>
          pos = new Array();
          pos[0] = dom.nodeToOffsets(editObj.node)[0] + editObj.node.tagName.length + 1;  //skip <tag
          pos[1] = pos[0];
          editObj.insertPos  = pos[0];
          editObj.replacePos = pos[1];
          editObj.text = " " + stripSpaces(editObj.text); //precede with a space
        }
        if (stripCfoutput) editObj.text = stripCfoutputIfNested(editObj.text, editObj.node);

      } else if (editObj.weight=="beforeSelection") {
        sel = getSelTableRowOffsets();
        if (!sel || sel.length == 0) sel = dom.getSelection();
        editObj.insertPos  = sel[0];
        editObj.replacePos = sel[0];
        if (stripCfoutput) editObj.text = stripCfoutputIfNested(editObj.text);

      } else if (editObj.weight=="replaceSelection") {
        sel = getSelTableRowOffsets();
        if (!sel || sel.length == 0) sel = dom.getSelection();
        sel = this.removeSpaceFromTableCell(sel);

        editObj.insertPos  = sel[0];
        editObj.replacePos = sel[1];

        if (stripCfoutput) editObj.text = stripCfoutputIfNested(editObj.text);

      } else if (editObj.weight=="afterSelection") {
        sel = getSelTableRowOffsets();
        if (!sel || sel.length == 0) sel = dom.getSelection();
        sel = this.removeSpaceFromTableCell(sel);

        editObj.insertPos  = sel[1];
        editObj.replacePos = sel[1];
        if (stripCfoutput) editObj.text = stripCfoutputIfNested(editObj.text);

      //insert above or below HTML tag
      } else if (editObj.weightType.indexOf("HTML") != -1) {
        //DEBUG alert("!inserting item of weight "+editObj.weight+":\n"+editObj.text);

        //This code was added to preserve the order of nodes with the same weight,
        //and requires that the caller add "dummy" nodes with null text: x.add(null,priorNode,weight).
        //If the node being added is followed by dummy nodes with the same weight,
        //stops before the next sibling. Look forward, and stop at the next node with the same weight.
        var stoppingNode = null, foundStop = false;
        for (i=j+1; i<this.length; i++) { //with each object with something to insert
          //DEBUG alert("checking "+this[i].text+" == null && priorNode="+this[i].priorNode);
          if (this[i].priorNode) { //advance to next placeholder node
            //DEBUG alert("found match, "+editObj.weight+"?=="+ this[i].weight);
            if (editObj.weight == this[i].weight) { 
              //DEBUG alert("Insert before stopping node:\n"+unescape(this[i].priorNode.orig));
              stoppingNode = this[i].priorNode;
            }
            break;
          }
        }

        lighterWeight = 0;
        lighterNode = 0;
        if (editObj.weightType != "belowHTML" && langNode) {
          lighterNode = langNode;  //if language tag, insert after that
        }

        //detect if there's an existing node with a lower weight, and add after it
        if (editObj.weightNum && j>0) {
          for (i=0; i<j; i++) { //with each object before this one
            //if preceeded by a dummy node with a smaller weight of same type (above or belowHTML)
            if (this[i].priorNode && this[i].weight && this[i].weight.indexOf(editObj.weightType)==0) {
              var partWeight = getWeightNum(this[i].weight);
              //if that weight is smaler than mine, make that the lighter node
              if (partWeight < editObj.weightNum) {
                lighterWeight = partWeight;
                lighterNode = this[i].priorNode;
        } } } }

        //Search other participants for lighter nodes to add after
        for (i=0; i<allSSRecs.length; i++) {
          for (k=0; allSSRecs[i].weights && k<allSSRecs[i].weights.length; k++) { //find insertion node
            var partWeight = String(allSSRecs[i].weights[k]);
            if (partWeight == String(parseInt(partWeight))) partWeight = "aboveHTML+" + partWeight;
            if (stoppingNode && allSSRecs[i].participants[k] == stoppingNode) { //don't go beyond stopping node
              foundStop = true;
              continue;  
            } else if (partWeight.indexOf(editObj.weightType)==0) { //if same type, keep looking for node above me
              newWeight = getWeightNum(allSSRecs[i].weights[k]);
              //DEBUG alert("Checking part "+k+": "+lighterWeight+" (lighter) <= "+newWeight+" (new) <= "+editObj.weightNum+" (my weight)?");
              if (newWeight && lighterWeight <= newWeight && (newWeight < editObj.weightNum
                  || (!foundStop && newWeight == editObj.weightNum))) { //heavier than LW, lighter than me
                lighterWeight = newWeight;
                lighterNode   = allSSRecs[i].participants[k];
                //DEBUG alert("Changing lighter weight to (new) "+lighterWeight+"\n"+unescape(lighterNode.orig));
        } } } }

        if (lighterNode) {
          editObj.insertPos = dom.nodeToOffsets(lighterNode)[1];
        } else {
          if (editObj.weightType == "belowHTML") {
            editObj.insertPos  = dom.nodeToOffsets(dom.documentElement)[1];
            if (editObj.insertPos == 0) { //if document w/o HTML, add after everything
              editObj.insertPos  = dom.documentElement.outerHTML.length;
            }
          } else {  //aboveHTML, first item
            editObj.insertPos = 0;
          }
        }
      }
  } }

  if (this.length > 0) {    
    this.sortInserts(); //Make sure our edits are in order
        
    dw.useTranslatedSource(false);
    if (!this.allSrc) this.allSrc = dom.documentElement.outerHTML;
    newSrc = "";
    var lastInsert = 0;
    for (i=0; i<this.length; i++) { 
      if (this[i].insertPos != null) {
        //DEBUG alert("insert at "+lastInsert+","+this[i].insertPos+":"+this.allSrc.substring(lastInsert, this[i].insertPos)+": plus :"+ this[i].text+":");
        newSrc += this.allSrc.substring(lastInsert, this[i].insertPos) + this[i].text;
        if (this[i].replacePos) {
          lastInsert = this[i].replacePos;
        } else {
          lastInsert = this[i].insertPos;
        }
    } }
    newSrc += this.allSrc.substring(lastInsert);
    dom.documentElement.outerHTML = newSrc;
    if (tagSelection)
    {
      setTagSelection(tagSelection);
    }
    ensureLanguageTagIsCorrect();
  }
}


//If no selection, and inserting after a &nbsp; at the beginning of a TD
//tag, remove the &nbsp;. This is really useful for "<td>&nbsp;</td>" inserts.
function SSEdits_removeSpaceFromTableCell(sel) {
  var dom = dw.getDocumentDOM();
  if (sel[0] == sel[1] && sel[0] > 7) { 
    if (!this.allSrc) this.allSrc = dom.documentElement.outerHTML;
    var tagName = String(dom.getSelectedNode().tagName).toUpperCase();
    if (this.allSrc.substring(sel[0]-7,sel[1]) == ">&nbsp;" && tagName == "TD") {
      sel[0] -= 6;
    }
  }
  return sel;
}


//Converts "aboveHTML+20" to just 20. Does nothing if weight is already a number.
function getWeightNum(weight) {
  if (typeof weight == "string") {
    var pos = weight.indexOf("+");
    weight = parseInt((pos > 0)? weight.substring(pos+1) : weight);
  }
  return weight;
}


function SSEdits_sortWeights() {
/*
  var msg="presort -------------\n";
  for (i=0; i<this.length; i++) {
    msg += i+":" +this[i].weight+"="+this[i].text+"\n";
  }
  alert(msg);
*/

  //shift-sort algorithm. Keeps same-weight chunks together
  var i,j,k,a,b,temp;
  for (i=0; i<this.length-1; i++) {
    for (j=i+1; j<this.length; j++) {
      aType = this[i].weightType;
      bType = this[j].weightType;
      a = this[i].weightNum;
      b = this[j].weightNum;
      if ((aType == bType && a != null && b != null && a > b)
          || (aType == "belowHTML" && bType=="aboveHTML")) {
        temp = this[j];
        for (k=j; k>i; k--) {
          this[k] = this[k-1];
        }
        this[i] = temp;
      }
    }
  }
/*
  var msg="After pre sort:\n";
  for (i=0; i<this.length; i++) {
    msg += i+":" +this[i].weight+"="+this[i].text+"\n";
  }
  alert(msg);
*/
}


function SSEdits_sortInserts() {
  var i,j,k,a,b,temp;

  //shift-sort inserts by insert position
  for (i=0; i<this.length-1; i++) {
    for (j=i+1; j<this.length; j++) {
      a = this[i].insertPos;
      b = this[j].insertPos;
      //if a should insert before b, swap them
      if (a != null && b != null && a > b) {
        temp = this[j];
        for (k=j; k>i; k--) {
          this[k] = this[k-1];
        }
        this[i] = temp;
      }
    }
  }
/*
  var msg="After insertion sort:\n";
  for (i=0; i<this.length; i++) {
    msg += i+": inserting at pos " +this[i].insertPos+","+this[i].replacePos+":"+this[i].text+":\n";
  }
  alert(msg);
*/
}


//returns node ptr to first language tag if any above the HTML tag
//only needed by ASP and JSP
function getLanguageNode() {
  var langNode = "";
  var dom = dw.getDocumentDOM();
  var langNodes = dom.getElementsByTagName("MM_SCRIPT_LANGUAGE");

  //if we have some language nodes, pick the first one (if it's not in the HTML)
  if (langNodes.length) {
    var inHTML = false, node = langNodes[0];

    //if has parents, traverse to see if one is HTML tag
    while (node.parentNode && node.parentNode.tagName) { //if parent exists
      node = node.parentNode;
      if (node.tagName == "HTML") inHTML = true;         //found an HTML tag
    }

    //if langNode is *not* within HTML tag, choose that
    if (!inHTML) langNode = langNodes[0];
  }

  return langNode;
}


//Gets the correspoding ASP Codepage for the given charset

//Ensures that there is a language tag, and it is correct for the ASP setting.
function charsetToCodePage( charset ) {
  charset = charset.toLowerCase();
  var codepage = "";	
  
  if(    charset.indexOf( "iso-8859-1" ) != -1 ) {
    codepage = "1252";
  }else if(    charset.indexOf( "utf-8" ) != -1 ) {
    codepage = "65001";
  }else if(    charset.indexOf( "shift_jis" ) != -1 ) {
    codepage = "932";
  }else if(    charset.indexOf( "iso-2022-jp" ) != -1 ) {
    codepage = "CODE_JPN_JIS";
  }else if(    charset.indexOf( "euc-jp" ) != -1 ) {
    codepage = "CODE_JPN_EUC";
  }else if(    charset.indexOf( "big5" ) != -1 ) {
    codepage = "950";
  }else if(    charset.indexOf( "gb2312" ) != -1 ) {
    codepage = "936";
  }else if(    charset.indexOf( "euc-kr" ) != -1 ) {
    codepage = "949";
  }
  else if (charset.indexOf( "din_66003-kr" ) != -1)
  {
    codepage = "20106";
  }
  else if (charset.indexOf( "ns_4551-1-kr" ) != -1)
  {
    codepage = "20108";
  }
  else if (charset.indexOf( "sen_850200_b" ) != -1)
  {
    codepage = "20107";
  }
  else if (charset.indexOf( "_autodetect" ) != -1)
  {
    codepage = "50932";
  }
  else if (charset.indexOf( "_autodetect_kr" ) != -1)
  {
    codepage = "50949";
  }
  else if (charset.indexOf( "csISO2022jp" ) != -1)
  {
    codepage = "50221";
  }
  else if (charset.indexOf( "hz-gb-2312" ) != -1)
  {
    codepage = "52936";
  }
  else if (charset.indexOf( "ibm852" ) != -1)
  {
    codepage = "852";
  }
  else if (charset.indexOf( "ibm866" ) != -1)
  {
    codepage = "866";
  }
  else if (charset.indexOf( "irv" ) != -1)
  {
    codepage = "20105";
  }
  else if (charset.indexOf( "irv" ) != -1)
  {
    codepage = "20105";
  }
  else if (charset.indexOf( "iso-2022-kr" ) != -1)
  {
    codepage = "949";
  }
  else if (charset.indexOf( "iso-8859-2" ) != -1)
  {
    codepage = "28592";
  }
  else if (charset.indexOf( "iso-8859-3" ) != -1)
  {
    codepage = "28593";
  }
  else if (charset.indexOf( "iso-8859-4" ) != -1)
  {
    codepage = "28594";
  }
  else if (charset.indexOf( "iso-8859-5" ) != -1)
  {
    codepage = "28595";
  }
  else if (charset.indexOf( "iso-8859-6" ) != -1)
  {
    codepage = "28596";
  }
  else if (charset.indexOf( "iso-8859-7" ) != -1)
  {
    codepage = "28597";
  }
  else if (charset.indexOf( "iso-8859-8" ) != -1)
  {
    codepage = "28598";
  }
  else if (charset.indexOf( "koi8-r" ) != -1)
  {
    codepage = "20866";
  }
  else if (charset.indexOf( "ks_c_5601" ) != -1)
  {
    codepage = "949";
  }
  else if (charset.indexOf( "unicode" ) != -1)
  {
    codepage = "1200";
  }
  else if (charset.indexOf( "unicodeFEFF" ) != -1)
  {
    codepage = "1201";
  }
  else if (charset.indexOf( "utf-7" ) != -1)
  {
    codepage = "65000";
  }
  else if (charset.indexOf( "windows-1250" ) != -1)
  {
    codepage = "1250";
  }
  else if (charset.indexOf( "windows-1251" ) != -1)
  {
    codepage = "1251";
  }
  else if (charset.indexOf( "windows-1252" ) != -1)
  {
    codepage = "1252";
  }
  else if (charset.indexOf( "windows-1253" ) != -1)
  {
    codepage = "1253";
  }
  else if (charset.indexOf( "windows-1254" ) != -1)
  {
    codepage = "1254";
  }
  else if (charset.indexOf( "windows-1255" ) != -1)
  {
    codepage = "1255";
  }
  else if (charset.indexOf( "windows-1256" ) != -1)
  {
    codepage = "1256";
  }
  else if (charset.indexOf( "windows-1257" ) != -1)
  {
    codepage = "1257";
  }
  else if (charset.indexOf( "windows-1258" ) != -1)
  {
    codepage = "1258";
  }
  else if (charset.indexOf( "windows-874" ) != -1)
  {
    codepage = "874";
  }
  else if (charset.indexOf( "x-euc" ) != -1)
  {
    codepage = "51932";
  }
  else if (charset.indexOf( "x-user-defined" ) != -1)
  {
    codepage = "50000";
  }

  return codepage;
}


function ensureLanguageTagIsCorrect()
{
  // NOTE: This function is no longer needed.  The function updatePageDirective()
  //       in the server model extension file now handles this operation.
}


function getTagSelection() {
  // find out if a tag is selected and return an arrray (tagName, nth occurence of tagName)
  var tagSelection = null;
  var tagName = null;
  var tagIndex = -1;
  dw.useTranslatedSource(true);
  var dom = dw.getDocumentDOM();
  curSelection = dom.getSelection();
  var tagName = null;
  var node = dw.offsetsToNode(curSelection[0], curSelection[0]);
    if (node.nodeType == Node.ELEMENT_NODE)
  {
    tagName = node.tagName;
    if (tagName.toUpperCase() == "MM:BEGINLOCK")
    {
      tagName = null;
      var siblings = node.parentNode.childNodes;
      for (i=0; i<siblings.length; i++)
      {
        if (siblings[i] == node) 
        {
          if (node.nodeType == node.ELEMENT_NODE)
          {
            node = siblings[i+1];
            tagName = node.tagName;
            break; 
          }
        }
      }
    }
    if (tagName)
    {
      var tags = dom.getElementsByTagName(tagName);
      for (j=0; j<tags.length; j++)
      {
        if (tags[j] == node)
        {
          tagIndex = j;
        }
      }
    }
  }
  dw.useTranslatedSource(false);
  if (tagIndex != -1)
  {
    tagSelection = new Array(tagName, tagIndex);
  }

  return tagSelection;
}

function setTagSelection(tagSelection)
{
  // select the nth occurence of the specfied tag
  var tagName = tagSelection[0];
  tagIndex = tagSelection[1];
  dw.useTranslatedSource(true);
  var dom = dw.getDocumentDOM();
  var tags = dom.getElementsByTagName(tagName);
  if (tags.length > tagIndex)
  {
    node = tags[tagIndex];
    offsets = dom.nodeToOffsets(node);
    dw.setSelection(offsets[0], offsets[1]);
  }   
  dw.useTranslatedSource(false);
}



// This function determines if a given node is a block tag, with an end block </tag>.
//
// Arguments: node - a DOM pointer
// Returns:   true or false
//
function isBlockTag(node) {
  var retVal = false;
  if (node && node.nodeType == Node.ELEMENT_NODE && node.outerHTML) {
    retVal = (node.outerHTML.search(RegExp("<\\/"+node.tagName,"i")) != -1);
  }
  return retVal;
}

