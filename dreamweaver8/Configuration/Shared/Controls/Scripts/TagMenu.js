//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//*-------------------------------------------------------------------
// CLASS:
//   TagMenu
//
// DESCRIPTION:
//   This class represents a select form control which displays
//   the existing tags of a given type.
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//
//--------------------------------------------------------------------




//*-------------------------------------------------------------------
// FUNCTION:
//   TagMenu
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function TagMenu(behaviorName, paramName, tagNames) {
  this.behaviorName = behaviorName;
  this.paramName = paramName;
  this.tagHiddenInLiveData = false;
  
  //Create the list of tag names that should be displayed
  this.tagList = tagNames.toUpperCase().split(",");
  this.tagTypeList = new Array();

  if (this.tagList.length == 0) {
    this.tagList = new Array("DEFAULT");
    this.tagTypeList = new Array("");
  } else {
    for (var i=0; i < this.tagList.length; i++) {
      if (this.tagList[i].indexOf("INPUT") == 0) {
        var tagName = this.tagList[i];
        this.tagList[i] = "INPUT";
        if (tagName.indexOf("/") >= 0) {
          this.tagTypeList.push(tagName.substring(tagName.indexOf("/")+1));
        } else {
          this.tagTypeList.push("");       
        }
      }
    }
  }

  this.listControl = '';
}

//public methods
TagMenu.prototype.initializeUI = TagMenu_initializeUI;
TagMenu.prototype.findServerBehaviors = TagMenu_findServerBehaviors;
TagMenu.prototype.canApplyServerBehavior = TagMenu_canApplyServerBehavior;
TagMenu.prototype.applyServerBehavior = TagMenu_applyServerBehavior;
TagMenu.prototype.inspectServerBehavior = TagMenu_inspectServerBehavior;
TagMenu.prototype.deleteServerBehavior = TagMenu_deleteServerBehavior;
TagMenu.prototype.analyzeServerBehavior = TagMenu_analyzeServerBehavior;
TagMenu.prototype.getValue = TagMenu_getValue;
TagMenu.prototype.setValue = TagMenu_setValue;

//private methods
TagMenu.prototype.getTagElements = TagMenu_getTagElements;
TagMenu.prototype.getNiceName = TagMenu_getNiceName;
TagMenu.prototype.getSelectedTag = TagMenu_getSelectedTag;
TagMenu.prototype.pickValue = TagMenu_pickValue;


//*-------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function TagMenu_initializeUI(newLinkStr) {
  var tagNames = new Array()
  var tagValues = new Array();
  
  var dom = dw.getDocumentDOM();

  // get the current selection
  var selNode, offsets;
  selNode = this.getSelectedTag();
  if (selNode) { //if selection is inside a tag, select the entire tag
    offsets = dw.nodeToOffsets(selNode);
    dw.setSelection(offsets[0],offsets[1]);
  }
  
  if (this.tagList.length == 1 && this.tagList[0] == "A") {

    // if no tag selection, ensure the selection is linkable
    if (!selNode) {
      selStr = dwscripts.trim(dwscripts.fixUpSelection(dom,false,true));
      if (selStr && !stringCanBeLink(selStr)) {
        offsets = dom.getSelection();
        dw.setSelection(offsets[1],offsets[1]);  //move the insertion point after the selection
        selStr = "";
      }
    }

    // add a new link or a selection as the first item in the list
    if (selNode || !selStr) {  //if sel is link, or no valid selection

      newLinkStr = (newLinkStr != null) ? newLinkStr : "New Link";

      //add generic new link item to menu
      tagNames.push(dwscripts.sprintf(MM.LABEL_CreateNewLink,newLinkStr));
		  
      newLinkStr = dwscripts.entityNameDecode(newLinkStr);
	    tagValues.push("createAtSelection+"+newLinkStr);

    } else {                   //else selection could be converted to link, so add it
      var displayString = dwscripts.trim(selStr);
      displayString = displayString.replace(/\s+/," "); //replace all newlines and whitespace with a single space
      displayString = dwscripts.entityNameDecode(displayString);
      tagNames.push(MM.LABEL_SelectionLink+' "' + displayString + '"');
      tagValues.push("createAtSelection+"+selStr);

    }
  }

  // add all other tags to menu
  var nodes = this.getTagElements();
  for (var i=0; i < nodes.length; i++) {

    tagNames.push(this.getNiceName(nodes[i], i));
    tagValues.push(nodes[i]);

  }
    
  // set the list control
  this.listControl = new ListControl(this.paramName);  
  this.listControl.setAll(tagNames, tagValues);

  // if link currently selected, pick it in the list
  if (selNode) {
    this.pickValue(selNode);
  }
}


//*-------------------------------------------------------------------
// FUNCTION:
//   findServerBehaviors
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function TagMenu_findServerBehaviors(paramObj) {
  // no op
}



//*-------------------------------------------------------------------
// FUNCTION:
//   canApplyServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function TagMenu_canApplyServerBehavior(sbObj, errorMsg) {
  var retVal = true;
  
  if (!sbObj && (this.tagList.length != 1 || this.tagList[0] != "A") ) {
    var dom = dw.getDocumentDOM();
    var nodes = this.getTagElements();
    if (nodes.length == 0) {
      retVal = false;
      if (this.tagHiddenInLiveData) {
        alert(MM.MSG_CannotApplyInLiveData);
      } else if (errorMsg) {
        alert(errorMsg);
      } else if (this.tagList[0] == "INPUT" && this.tagTypeList[0] == "RADIO") {
        alert(MM.MSG_NoRadioBtns);
      } else if (this.tagList[0] == "INPUT" && this.tagTypeList[0] == "TEXT") {
        alert(MM.MSG_NoTextfield);
      } else if (this.tagList[0] == "INPUT" && this.tagTypeList[0] == "CHECKBOX") {
        alert(MM.MSG_NoCheckboxes);
      } else if (this.tagList[0] == "SELECT") {
        alert(MM.MSG_NoListMenus);
      } else if (this.tagList[0] == "INPUT" && this.tagTypeList[0] != "") {
        alert(dwscripts.sprintf(MM.MSG_NoSpecificTag,this.tagList[0].toUpperCase() + "/" + this.tagTypeList[0]));
      } else {
        alert(dwscripts.sprintf(MM.MSG_NoSpecificTag,this.tagList[0].toUpperCase()));
      }
    }
  }
  
  return retVal;
}



//*-------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function TagMenu_applyServerBehavior(sbObj, paramObj) {
  var tagNode  = this.listControl.getValue();
  paramObj[this.paramName] = tagNode;
  
  //set the selection property, so that fixUpSelection is not called again
  if (typeof tagNode == "string" && tagNode.indexOf("createAtSelection") != -1) {
    paramObj.MM_selection = tagNode.substring(tagNode.indexOf("+"));
  }
  
  return "";
}



//*-------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function TagMenu_inspectServerBehavior(sbObj) {
  var retVal = true;
  
  var tagNode = sbObj.parameters[this.paramName];

  retVal = this.pickValue(tagNode);

  if (retVal) {

    // limit the list to the currently selected value
    this.listControl.setAll(Array(this.listControl.get()),
                            Array(this.listControl.getValue()));
                            
    this.listControl.object.setAttribute("disabled","true");
                                  
  } else {

    var canDetermineNode = true;

    //if node relative, but only using beforeNode or afterNode, we can't determine
    //the node, so don't display an error message. Detect if there's a beforeNode
    //or afterNode weight, and no childOfNode weights.
    if (this.paramName && sbObj && sbObj.weights) {
      for (var i=0; i<sbObj.weights.length; i++) {
        var weight = sbObj.weights[i];
        if (weight.indexOf("ChildOfNode")!=-1) {  //if child of node, we can determine it
          canDetermineNode = true;
          break;
        } else if (weight.indexOf("beforeNode")==0 || weight.indexOf("afterNode")==0 || weight.indexOf("replaceNode")==0) {
          canDetermineNode = false;
        }
      }
    }

    if (canDetermineNode) {
      alert(MM.MSG_CouldNotFindSelectedNode);

    // If complete, but can't determine the node, so clear and disable the list
    } else if (!sbObj.incomplete) {
      this.listControl.setAll(new Array(""), new Array(""));
      this.listControl.object.setAttribute("disabled","true");
    }
  }
    
  return retVal;
}



//*-------------------------------------------------------------------
// FUNCTION:
//   deleteServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function TagMenu_deleteServerBehavior(sbObj) {
  // no op
}



//*-------------------------------------------------------------------
// FUNCTION:
//   analyzeServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function TagMenu_analyzeServerBehavior(sbObj, allRecs) {
  // no op
}



//*-------------------------------------------------------------------
// FUNCTION:
//   getValue
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function TagMenu_getValue() {
  return this.listControl.getValue();
}



//*-------------------------------------------------------------------
// FUNCTION:
//   setValue
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function TagMenu_setValue(theValue) {
  this.listControl.setValue(theValue);
}



//*-------------------------------------------------------------------
// FUNCTION:
//   getTagElements
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function TagMenu_getTagElements() {
  var retVal = new Array();
  
  var dom = dw.getDocumentDOM();
  var nodes = new Array();
  for (var i=0; i < this.tagList.length; i++) {
    nodes = nodes.concat(dom.getElementsByTagName(this.tagList[i]));
  }

  //In some cases, we cannot find a tag because the Live Data translation has hidden it.
  //If no tags found, scan the locks for the same tag, and give an error for the user
  //to switch to normal view before applying it.
  this.tagHiddenInLiveData = false;
  if (!nodes.length) {
    dw.useTranslatedSource(true);

    //Find and search all lock nodes
    var lockNodes = dom.getElementsByTagName("MM:BEGINLOCK");
    for (var j=0; !this.tagHiddenInLiveData && j<lockNodes.length; j++) {
      var lockNode = lockNodes[j];
     
      //iff this lock was created by the Live Data translator...
      if (lockNode.translatorClass && lockNode.translatorClass == "MM_LIVE_DATA") {
        var lockText = lockNodes[j].orig;
        if (lockText) {
          lockText = unescape(lockText);

          //look for each tagname in the lock's orig attribute.
          for (var i=0; i<this.tagList.length; i++) {

            //looking for tags within orig text
            if (lockText.search(RegExp(this.tagList[i],"i")) != -1) {

              //if found, set flag and bail out
              this.tagHiddenInLiveData = true;
              break;
            }
          }
        }
      }
    }
    dw.useTranslatedSource(false);
  }


  //Eliminate the input nodes not in the type list,
  // also collapse radio groups into a single array of nodes
  var radioList = new Array();
  for (var i=0; i < nodes.length; i++) 
  {
    if (nodes[i].tagName == "INPUT") 
    {
      // Only attempt to add the node if not already in the list. We may have 
      //   duplicate input nodes if the user specified multiple input type
      //   tags in the constructor.
      if (dwscripts.findInArray(retVal, nodes[i]) == -1)
      {
        for (var j=0; j < this.tagTypeList.length; j++) 
        {
          if (!this.tagTypeList[j] ||
              (nodes[i].type && nodes[i].type.toUpperCase() == this.tagTypeList[j]) ||
              (!nodes[i].type && this.tagTypeList[j] == "TEXT")) 
          {
            if (this.tagTypeList[j] == "RADIO") 
            {
              var name = this.getNiceName(nodes[i],i);
              if (radioList[name] == null) 
              {
                radioList[name] = new Array();
                radioList[name].isRadio = true;
                radioList[name].push(nodes[i]);
                retVal.push(radioList[name]);
              } 
              else
              {
                radioList[name].push(nodes[i]);
              }
            } 
            else 
            {
              retVal.push(nodes[i]);
            }
            break;
          }        
        }
      }
    } 
    else 
    {
      retVal.push(nodes[i]);
    }
  }

  return retVal;
}



//*-------------------------------------------------------------------
// FUNCTION:
//   getNiceName
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function TagMenu_getNiceName(node, position) 
{
  retVal = MM.LABEL_Unnamed;
  
  if (node && node.isRadio) {
    node = node[0];
  }

  if (node) {
    if (node.tagName == "A") 
    {
      var displayString = dwscripts.trim(node.innerHTML);
      displayString = displayString.replace(/\s+/," "); //replace all newlines and whitespace with a single space
      displayString = dwscripts.entityNameDecode(displayString);
      retVal = '"' + displayString + '"';
      
    } 
    else if (node.tagName == "INPUT" || node.tagName == "TEXTAREA" || node.tagName == "SELECT") 
    {
      var nodeName = node.getAttribute("name");
      var nodeType = '';
      if (node.tagName == "TEXTAREA") 
      {
        nodeType = "TEXTAREA";
      } 
      else if (node.tagName == "SELECT")
      {
        nodeType = "SELECT";
      }
      else 
      {
        nodeType = node.type;
      }

      //get enclosing form node
      var formNode = node;
      while (!formNode || (formNode.tagName && formNode.tagName.toUpperCase() != "FORM")) 
      {
        formNode = formNode.parentNode;
      }
      
      //if we found a form tag, construct the display string
      if (formNode && formNode.tagName && formNode.tagName.toUpperCase() == "FORM") 
      {

        //get the form name
        var formName = '';
        if (formNode.getAttribute("name")) 
        {
          formName = " " + MM.TYPE_Separator + " " + MM.TYPE_Form + " \"" + formNode.getAttribute("name") + "\"";
        } 
        else 
        {
          var formNum = 0;
          var dom = dw.getDocumentDOM();
          var formList = dom.getElementsByTagName("FORM");
          for (var i=0; i < formList.length; i++) 
          {
            if (formList[i] == formNode) 
            {
              formNum = i;
              break;
            }
          }
          formName = " " + MM.TYPE_Separator + " " + MM.TYPE_Form + " " + formNum;
        }
        
        if (nodeName) 
        {
          retVal = "\"" + nodeName + "\"" + formName;
        } 
        else if (nodeType) 
        {
          retVal = nodeType.toLowerCase() + " ["+ position +"]" + formName;
        }

      } 
      else 
      {  // no form node found
        if (nodeName && nodeType) 
        {
          retVal = nodeType.toLowerCase() + " \"" + nodeName + "\"";
        } 
        else if (nodeType) 
        {
          retVal = nodeType.toLowerCase() + " ["+ position +"]";
        }
      }
      
    } 
    else 
    {
      retVal = node.getAttribute("name");
      if (!retVal) 
      {
        retVal = node.tagName.toLowerCase() + " ["+position+"]";
      }
    }
  }
  
  return retVal;
}



//*-------------------------------------------------------------------
// FUNCTION:
//   getSelectedTag
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function TagMenu_getSelectedTag() {
  var retVal = null;
  
  var dom = dw.getDocumentDOM();
  var node = dom.getSelectedNode();

  var tagNameStr = "," + this.tagList.join(",") + ",";

  while (node && node.nodeType != Node.DOCUMENT_NODE) {
    var tagName = (node.tagName) ? node.tagName.toUpperCase() : "";
    if (node.nodeType == Node.ELEMENT_NODE && tagNameStr.indexOf("," + tagName + ",") != -1) {
      retVal = node;
      break;
    }
    else node = node.parentNode;
  }

  return retVal;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   stringCanBeLink
//
// DESCRIPTION:
//   Determines if the given string can be reasonably become a link. 
//   Some problems happen if things like form elements and tables are 
//   wrapped in A tags.
//
// ARGUMENTS:
//   selStr - the string to check for link worthiness
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function stringCanBeLink(selStr) {
  var illegalLinkTags = " TABLE INPUT FORM LAYER ILAYER DIV TR TD A P CFIF ";
  var i, rootNode, node, tagName;
  var retVal = true;
  var tempFileDom, tempFilePath = dw.getConfigurationPath()+"/Shared/MM/Cache/empty.htm";

  if (DWfile.exists(tempFilePath)) {
    tempFileDom  = dw.getDocumentDOM(tempFilePath);
    tempFileDom.documentElement.outerHTML = "<HTML><BODY>"+selStr+"</BODY></HTML>";
    rootNode = tempFileDom.body;
    if (rootNode.hasChildNodes()) { //nodes to check
      for (i=0; i<rootNode.childNodes.length; i++) {
        node = rootNode.childNodes[i];
        if (node.nodeType == Node.ELEMENT_NODE) {
          tagName = " " + node.tagName.toUpperCase() + " ";
          if (illegalLinkTags.indexOf(tagName) != -1) {
            retVal = false;
            //DEBUG alert("cant link this tag: "+tagName);
  } } } } }
  return retVal;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   pickValue
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function TagMenu_pickValue(theValue) {
  var retVal = false;

  var index = -1;
  var theList = this.listControl.getValue("all");
  for (var i=0; index == -1 && i < theList.length; i++) {
    if (theList[i].isRadio) {
      for (var j=0; j < theList[i].length; j++) {
        if (theList[i][j] == theValue) {
          index = i;
          break;
        }
      }
    } else {
      if (theList[i] == theValue) {
        index = i;
        break;
      }
    }
  }

  if (index >= 0) {
    this.listControl.setIndex(index);
    retVal = true;
  } else {
    this.listControl.pickValue(theValue);
  }

  return retVal;
}
