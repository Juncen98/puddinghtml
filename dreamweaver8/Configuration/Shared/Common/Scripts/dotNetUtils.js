// Copyright 2002, 2003, 2004 Macromedia, Inc. All rights reserved.

//--------------------------------------------------------------------
// CLASS:
//   dotNetUtils
//
// DESCRIPTION:
//   This class is used to create a namespace for the functions
//   contained within this file.  This namespace will make it
//   easier to identify these functions within the code, and
//   ensure that no other functions exist with these names.
//
//   The functions in this file make it easier to deal with
//   objects, PIs, and server behaviors for .NET form controls,
//   which are translated.
//
// PUBLIC FUNCTIONS:
//
//    dotNetUtils.displayTagDialog()
//    dotNetUtils.generateUniqueID()
//    dotNetUtils.isUniqueID()
//    dotNetUtils.getASPNodesAsElements()
//    dotNetUtils.getUntranslatedDOM()
//    dotNetUtils.isInsideForm()
//    dotNetUtils.checkFormTags()
//    dotNetUtils.getEmptyDOM()
//    dotNetUtils.replaceSel()
//    dotNetUtils.getNiceName()
//    dotNetUtils.getDynamicData()
//    dotNetUtils.setListItems()
//--------------------------------------------------------------------

function dotNetUtils()
{
}

// Info object constructor
dotNetUtils.formInfo = dotNetUtils_formInfo;


// Static Methods
dotNetUtils.displayTagDialog = dotNetUtils_displayTagDialog;
dotNetUtils.generateUniqueID = dotNetUtils_generateUniqueID;
dotNetUtils.isUniqueID = dotNetUtils_isUniqueID;
dotNetUtils.getASPNodesAsElements = dotNetUtils_getASPNodesAsElements;
dotNetUtils.getUntranslatedDOM = dotNetUtils_getUntranslatedDOM;
dotNetUtils.isInsideForm = dotNetUtils_isInsideForm;
dotNetUtils.checkFormTags = dotNetUtils_checkFormTags;
dotNetUtils.getEmptyDOM = dotNetUtils_getEmptyDOM;
dotNetUtils.replaceSel = dotNetUtils_replaceSel;
dotNetUtils.getNiceName = dotNetUtils_getNiceName;
dotNetUtils.getDynamicData = dotNetUtils_getDynamicData;
dotNetUtils.setListItems = dotNetUtils_setListItems;

// Static Properties
dotNetUtils.FORM_OPEN = "<form runat=\"server\">\r";
dotNetUtils.FORM_CLOSE = "</form>";
dotNetUtils.EMPTY_PATH = dw.getConfigurationPath() + "/Shared/MM/Cache/empty.htm";




//--------------------------------------------------------------------
// FUNCTION:
//   dotNetUtils.formInfo
//
// DESCRIPTION:
//   Constructs an object that stores information about the form
//   tag that surrounds the selection
//
// ARGUMENTS:
//   addForm - whether a form should be added around the selection 
//     (optional, defaults to false)
//   setRunatAttribute - whether the form around the selection
//     should have the runat attribute set to "server"
//     (optional, defaults to false)
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function dotNetUtils_formInfo(addForm,setRunatAttribute){
  if (addForm)
    this.addForm = addForm;
  else
    this.addForm = false;
    
  if (setRunatAttribute)
    this.setRunat = setRunatAttribute;
  else
    this.setRunat = false;
}

//--------------------------------------------------------------------
// FUNCTION:
//   dotNetUtils.displayTagDialog
//
// DESCRIPTION:
//   Forces the focus into code view and then displays the tag dialog
//   for the currently-selected tag (in edit mode). When the user
//   clicks OK or cancel in the tag dialog, returns the view and focus
//   back to where they were, and attempts to re-select the tag (the
//   tag editor leaves the IP right after the tag if any edits were
//   made).
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean indicating whether the tag dialog was shown
//--------------------------------------------------------------------
function dotNetUtils_displayTagDialog(){
  var ok = dw.canPopupEditTagDialog();
  var dom = dw.getDocumentDOM();
  var curView = dom.getView();
  var curFocus = dw.getFocus();
  var retVal = false;
  if (ok){
    if (curView == 'design'){
      dom.setView('split');
    }
    dw.setFocus('textView');
    dw.popupEditTagDialog();
    retVal = true;
//    dom.setView(curView);
    dw.setFocus(curFocus);
    if ((curView == 'design' || curFocus == 'document') && (dom.getSelection()[0] == dom.getSelection()[1])){
      dom.setSelection(dom.getSelection()[0]-2,dom.getSelection()[0]-2);
    }
  }
  return retVal;
}

//--------------------------------------------------------------------
// FUNCTION:
//   dotNetUtils.generateUniqueID
//
// DESCRIPTION:
//   Given a baseID, generates an ID that is unique within the document
//
// ARGUMENTS:
//   baseID
//
// RETURNS:
//   string representing an ID that's unique within the document
//--------------------------------------------------------------------
function dotNetUtils_generateUniqueID(baseID){
  var counter = 1;
  while (!dotNetUtils.isUniqueID(baseID + counter)) counter++;
  return (baseID + counter);
}

//--------------------------------------------------------------------
// FUNCTION:
//   dotNetUtils.isUniqueID
//
// DESCRIPTION:
//   Given an ID, scans the document to see if that ID is
//   already in use.
//
// ARGUMENTS:
//   theID
//
// RETURNS:
//   a boolean indicating whether the ID is unique within the document
//--------------------------------------------------------------------
function dotNetUtils_isUniqueID(theID){
  var retVal = true;
  var unDOM = dotNetUtils.getUntranslatedDOM();
  var elementsWithIDs = unDOM.getElementsByAttributeName("id");
  if (elementsWithIDs){
    for (var i=0; i < elementsWithIDs.length; i++){
      if (elementsWithIDs[i].getAttribute("ID").toLowerCase() == theID.toLowerCase()){
        retVal = false;
        break;
      }
    }
  }
  return retVal;
}

//--------------------------------------------------------------------
// FUNCTION:
//   dotNetUtils.getASPNodesAsElements
//
// DESCRIPTION:
//   Given an ASP tag name (e.g., "asp:button"), gets an array of
//   all the element nodes with that tag name that are in the 
//   document
//
// ARGUMENTS:
//   aspTagName - the full name of an asp/asp.net tag, such as
//     "asp:textbox"
//
// RETURNS:
//   an array of element nodes
//--------------------------------------------------------------------
function dotNetUtils_getASPNodesAsElements(aspTagName){
  var dom = dw.getDocumentDOM();
  var documentContents = dom.documentElement.outerHTML;
  var emptyDom = dw.getDocumentDOM(dotNetUtils.EMPTY_PATH);
  emptyDom.documentElement.outerHTML = documentContents;
  var objArray = emptyDom.getElementsByTagName(aspTagName);

  return objArray;
}

//--------------------------------------------------------------------
// FUNCTION:
//   dotNetUtils.getUntranslatedDOM
//
// DESCRIPTION:
//   Takes the current DOM and stuffs it in an empty file on disk,
//   so that it remains untranslated.
//
// ARGUMENTS:
//   None.
//
// RETURNS:
//   dom object
//--------------------------------------------------------------------
function dotNetUtils_getUntranslatedDOM(){
  var dom = dw.getDocumentDOM();
  var documentContents = dom.documentElement.outerHTML;
  var emptyDom = dw.getDocumentDOM(dotNetUtils.EMPTY_PATH);
  emptyDom.documentElement.outerHTML = documentContents;

  return emptyDom;
}

//--------------------------------------------------------------------
// FUNCTION:
//   dotNetUtils.isInsideForm
//
// DESCRIPTION:
//   Checks to see if the tag is within a form tag.
//
// ARGUMENTS:
//   node - the node to check
//
// RETURNS:
//   formObj - returns the form node if it exists or null if not.
//             
//--------------------------------------------------------------------

function dotNetUtils_isInsideForm(node)
{
  var formObj = null;
  var currNode = node;

  while ((formObj == null) && currNode.parentNode)
  {
    if ((currNode.nodeType == currNode.ELEMENT_NODE) &&
	    (currNode.tagName == "FORM"))
    {
	  formObj = currNode;
    }
	else
    {
	  currNode = currNode.parentNode;
    }
  }

  return formObj;
}


//--------------------------------------------------------------------
// FUNCTION:
//   dotNetUtils.checkFormTags
//
// DESCRIPTION:
//   Warns the user if there are any other form tags with runat="server"
//   in the document. (This is an illegal condition that we prompt
//   the user to solve manually.)
//
// ARGUMENTS:
//   name - the name of the object being inserted. This name is used
//          in the error message string.
//
// RETURNS:
//   nothing.
//             
// NOTE!! You MUST include Shared/UltraDev/Scripts/ssDocManager.js
//        if you use this function, because it calls the
//        fixUpSelection() function defined in that file.
//--------------------------------------------------------------------

function dotNetUtils_checkFormTags(name,infoObj)
{
  var emptyDom = dotNetUtils.getEmptyDOM(true);
  var dom = dreamweaver.getDocumentDOM();

  fixUpSelection(dom);
  
  var offsets = dom.getSelection();
  var selNode = dom.offsetsToNode(offsets[0], offsets[1]);
  var formNodes = emptyDom.getElementsByTagName("Form");

  if (formNodes.length > 0)
  {
  // There is at least one form node. 
	// Check if the current selection is inside a form node.

    var aFormNode = dotNetUtils.isInsideForm(selNode);	 

	if (aFormNode)
	{
      // Okay, we're in a form node. Let's check if it has the runat attr.

	  var runatAttr = aFormNode.getAttribute("runat");
	 
	  if (!runatAttr)
	  {
        // Ok, so it doesn't have a runat attribute. We need to see if 
		// there are any other form tags that have runat attrs.

		var outerOffsets = dom.nodeToOffsets(aFormNode, false);
		var tempNode = dom.offsetsToNode(outerOffsets[0], outerOffsets[0]+1);
		if (aFormNode == tempNode)
		{
	        infoObj.setRunat = true;

			if (formNodes.length > 1)
			{
	          // There're are more than 1 form. Let's see if any of them have
			  // runat attrs.
	
			  for (var j = 0; j<formNodes.length; j++)
			  {
			    var tempAttr = formNodes[j].getAttribute("runat");
			
				if (tempAttr)
				{
				  var msg = MM.MSG_Form_RunAtAttrExists;
				  msg = msg.replace(/%s/g, name);
	              alert(msg);
				  break;
				}
			  }
			}
		}
		else
		{
			infoObj.setRunat = false;
		}
	  }
	  else
	  {
        infoObj.setRunat = false;
	  }
	}
	else
	{
    // We're not in a form node, but there are forms on the page. Check
	  // if any of them have the runat attr.
      
	  infoObj.addForm = true;

      for (var k=0; k<formNodes.length; k++)
	  {
        var tempAttr = formNodes[k].getAttribute("runat");
	
		if (tempAttr)
		{
          var msg = MM.MSG_NoForm_RunAtAttrExists;
          msg = msg.replace(/%s/g, name);
          alert(msg);
		}
	  }
	}
  }
  else
  {
    infoObj.addForm = true;
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   dotNetUtils.getEmptyDOM
//
// DESCRIPTION:
//   Gets the dom of an empty document.
//
// ARGUMENTS:
//   cleanup - boolean indicating whether the empty dom should be
//     cleared out before adding anything.
//
// RETURNS:
//   a dom object.
//             
//--------------------------------------------------------------------

function dotNetUtils_getEmptyDOM(cleanUp)
{
  var eDom = dreamweaver.getDocumentDOM(dotNetUtils.EMPTY_PATH);

  if (cleanUp)
  {
    var dom = dreamweaver.getDocumentDOM();
    var oHTML = dom.documentElement.outerHTML
	
	//make sure both documents charsets are the same
	eDom.setCharSet( dom.getCharSet() );
    
	eDom.documentElement.outerHTML = "" + oHTML;
  }
  
  return eDom;
}

//--------------------------------------------------------------------
// FUNCTION:
//   dotNetUtils.replaceSel()
//
// DESCRIPTION:
//   Replaces the current selection with the supplied HTML. 
//
//
// ARGUMENTS:
//   newHTML - the new HTML to insert in place of the current selection.
//
// RETURNS:
//   nothing.
//             
//--------------------------------------------------------------------

function dotNetUtils_replaceSel(newHTML){
  var dom = dw.getDocumentDOM();
  var theObjOffsets = dom.getSelection();
  var documentContents = dom.documentElement.outerHTML;
  var newDocumentContents = documentContents.substr(0, theObjOffsets[0]);
  newDocumentContents += newHTML;
  newDocumentContents += documentContents.substr(theObjOffsets[1]);
  dom.documentElement.outerHTML = newDocumentContents;
}

//*-------------------------------------------------------------------
// FUNCTION:
//   getNiceName
//
// DESCRIPTION:
//   Gives the user some context for determining which node is which.
//
// ARGUMENTS: 
//   node - the node to get the context for
//   position - the position of the node in the array of its fellows
//
// RETURNS:
//   A string describing the position of the node in plain language.
//--------------------------------------------------------------------
function dotNetUtils_getNiceName(node, position){
  retVal = MM.LABEL_Unnamed;
  
  if (node) {
    var tempNode = node;
    if (tempNode.constructor == Array){
      tempNode = tempNode[0];
    }
    var dom = tempNode.parentNode;
    while (dom.parentNode != null)
    {
      dom = dom.parentNode;
    }

    var nodeName;
    var nodeType;
    if (node.isRadio){
      var nodeStr = node[0].outerHTML.toLowerCase();
      var strMatch = nodeStr.match(/groupname="([^"]*)"/i);
      if (!strMatch){
        strMatch = nodeStr.match(/id="([^"]*)"/i);
      }
      if (strMatch)
        nodeName = strMatch[1];
 
      strMatch = nodeStr.match(/<asp:([^\s>]*)/i);
      if (strMatch)
        nodeType = strMatch[1];

    }else{
      var nodeStr = node.outerHTML.toLowerCase();
      var strMatch = nodeStr.match(/id="([^"]*)"/i);
      nodeName = strMatch ? strMatch[1] : null;
      strMatch = nodeStr.match(/<asp:([^\s]*)/i);
      nodeType = strMatch ? strMatch[1] : null;
    }
/*    //get enclosing form node
    var formNode = dotNetUtils.isInsideForm(node);
    //if we found a form tag, construct the display string
    if (formNode){
      //get the form name
      var formName = '';
      if (formNode.getAttribute("name")){
        formName = " " + MM.TYPE_Separator + " " + MM.TYPE_Form + " \"" + formNode.getAttribute("name") + "\"";
      }else{
        var formNum = 0;
        var formList = dom.getElementsByTagName("FORM");
        for (var i=0; i < formList.length; i++){
          if (formList[i] == formNode){
            formNum = i;
            break;
          }
        }
        formName = " " + MM.TYPE_Separator + " " + MM.TYPE_Form + " " + formNum;
      }
        
      if (nodeName){
        retVal = '"' + nodeName + '"' + formName;
      }else if (nodeType && position){
          retVal = nodeType.toLowerCase() + " ["+ position +"]" + formName;
      }

*/    // no form node found
//    }else{
      if (nodeName){
        retVal = '"' + nodeName + '"';
      }else if (nodeType && (position != null)){
        retVal = nodeType.toLowerCase() + " ["+ position +"]";
      }
//    }
  }
  return retVal;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   getDynamicData
//
// DESCRIPTION:
//   Opens the dynamic data dialog and allows the user to choose
//   a database field, then populates the passed-in text field
//   with the dynamic value.
//
// ARGUMENTS: 
//   forField - the field that should be populated with the dynamic
//     value
//
// RETURNS:
//   Nothing.
//--------------------------------------------------------------------
function dotNetUtils_getDynamicData(forField){
  var oldVal = forField.value;
  var newVal = dw.showDynamicDataDialog(forField.value);
  if (newVal){
    forField.value = newVal;
  }else{
    forField.value = oldVal;
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   dotNetUtils.setListItems()
//
// DESCRIPTION:
//   Displays the List Items dialog box, which lets the user
//   choose listitems for the control (either statically or dynamically).
//   Reads existing values from the code, if any, and uses them to
//   populate the dialog box. Directly edits the user's document
//   with the new values.
//
//   The List Items dialog box is really the ServerObj-MenuProps
//   dialog in disguise; the menuInfoObj is constructed manually
//   based on information found in the current document rather than
//   passed in from the Update Record Form server object, and the
//   Title has been changed to protect the innocent.
//
//   This function is called from the four ListControls: checkboxlist,
//   dropdownlist, listbox, and radiobuttonlist.
//
// ARGUMENTS:
//   tagName: a string representing the name of the tag for which listitems 
//     are being defined (e.g., "asp:radiobuttonlist").
//   useSelStr: a Boolean value indicating whether the "default selected"
//     string should be used (true for radiobuttonlist and dropdownlist,
//     false for checkboxlist and listbox).
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function dotNetUtils_setListItems(tagName, useSelStr){
  var dom = dw.getDocumentDOM();
  var theObj = new TagEdit(dom.getSelectedNode().outerHTML);
  var sel = dom.getSelection();
  var wholeDoc = dom.documentElement.outerHTML;
  var start = 0;
  var startDefault = -1;
  var selectStr = "";
  var staticItems = "";
  var anyOtherTag = 1;
  var minimized = false;

  var menuInfoObj = new eoMenu();
  
  if (useSelStr){
    // Search backwards from the current selection to find the string of dynamic code above 
    // the listcontrol that tells which item should be selected, and extract the defaultStr 
    // info. This string is the same for both static and dynamic lists.
    // LMH-C: We used to only check for this string if the control had listitems or a 
    // datasource defined, but since (a) a user might define the listitems programmatically,
    // they might still want a selectStr even if neither a datasource nor any listitems are
    // defined within the tag, and (b) we're already doing a check to try to prevent us from
    // finding another control's selectStr, it seemed the better part of valor to remove the
    // test for items defined within the control.
    start = wholeDoc.lastIndexOf('<%',sel[0]);
    // Try to prevent us from detecting some other list control's selectStr if our list
    // control doesn't have one.
    anyOtherTag = wholeDoc.lastIndexOf('<',sel[0]-1);
    if (start >= anyOtherTag){
      selectStr = wholeDoc.substring(start,wholeDoc.indexOf('%>',start));
    }
    if (selectStr.indexOf('FindByValue(') != -1){
      startDefault = selectStr.indexOf('FindByValue(')+12;
    }
    if (startDefault > 0){
      var nullPatt = new RegExp(dwscripts.getNullToken());
      menuInfoObj.defaultStr = selectStr.substring(startDefault,selectStr.indexOf(')',startDefault)+1);
      // if we're just trying to match a string and not a field in a database,
      // the null token won't be there. we need to handle this case separately
      // so we don't screw up the string. 
      if (menuInfoObj.defaultStr.search(nullPatt) == -1){
        // strip the closing parenthesis and the quotation marks
        menuInfoObj.defaultStr = menuInfoObj.defaultStr.substring(0,menuInfoObj.defaultStr.length-2);
        menuInfoObj.defaultStr = menuInfoObj.defaultStr.replace(/\"/g,"");
        menuInfoObj.defaultSelected = menuInfoObj.defaultStr;
      }else{
        menuInfoObj.defaultSelected = '<%# ' + menuInfoObj.defaultStr.replace(nullPatt,"Container") + ' %>';
      }
    }else{
      start = 0;
      menuInfoObj.defaultStr = "";
      menuInfoObj.defaultSelected = "";
    }
  }
  // Determine whether we're inspecting a menu or a dynamic menu
  if (theObj.getInnerHTML() != null && theObj.getInnerHTML().toLowerCase().indexOf('<asp:listitem') != -1){
    menuInfoObj.type = "menu";
    menuInfoObj.textArr = new Array();
    menuInfoObj.valArr = new Array();
    var cNodes = theObj.getChildNodes();
    // Store the current values in arrays
    for (var i=0; i < cNodes.length; i++){
      if (cNodes[i].getAttribute("text")){
        menuInfoObj.textArr.push(cNodes[i].getAttribute("text"));
        minimized = true;
      }
      else
        menuInfoObj.textArr.push(cNodes[i].getInnerHTML());
      menuInfoObj.valArr.push(cNodes[i].getAttribute("value"));
    }
  }else if (theObj.getAttribute("DataSource")){
    menuInfoObj.type = "dynamicmenu";
    var ds = theObj.getAttribute("DataSource");
    var rec = ds.match(/<%#\s*([^\.]+)\.DefaultView\s*%>/);
    if (rec)
      menuInfoObj.recordset = rec[1];
    else
      menuInfoObj.recordset = "";      
    menuInfoObj.textCol = theObj.getAttribute("DataTextField");
    menuInfoObj.valCol = theObj.getAttribute("DataValueField");
  }

  var fieldInfoObj = (useSelStr)?dwscripts.callCommand("ServerObject-ListItems.htm",menuInfoObj):dwscripts.callCommand("ServerObject-ListItemsNoSel.htm",menuInfoObj);
  
  if (fieldInfoObj){
    var defaultSelected = fieldInfoObj.defaultSelected;
    // Re-create the selectStr using the values from the List Items
    // dialog.
    if (defaultSelected){
      selectStr = '<% @@ID@@.SelectedIndex = @@ID@@.Items.IndexOf(@@ID@@.Items.FindByValue(';
      selectStr = selectStr.replace(/@@ID@@/g,TEXT_ID.value);
      // Determine whether a semi-colon goes at the end of the string based on
      // the server model (CSharp requires it, VB can't have it).
      var semiColon = (dom.documentType == "ASP.NET_CSharp")?";":"";
      // If selecting by database field value
      var whichField = defaultSelected.match(/<%#\s*([\s\S]+)\s*%>/i);
      if (whichField){
        whichField = whichField[1].replace(/, Container/,", " + dwscripts.getNullToken());
        selectStr += whichField + ' ))' + semiColon + ' %>';
      // Otherwise, assume straight string
      }else{
        selectStr += '"' + defaultSelected + '"))' + semiColon + ' %>';
      }
    }else{
      selectStr = "";
    }

    if (fieldInfoObj.type == "menu"){
      // Generate listitem tags
      for (i = 0; i < fieldInfoObj.textArr.length; i++){
        if (minimized)
          staticItems += '<asp:ListItem value="' + fieldInfoObj.valArr[i] + '" text="' + fieldInfoObj.textArr[i] + '" />';
        else
          staticItems += '<asp:ListItem value="' + fieldInfoObj.valArr[i] + '">' + fieldInfoObj.textArr[i] + '</asp:ListItem>';
      }
      theObj.setInnerHTML(staticItems);
      theObj.removeAttribute("DataSource");
      theObj.removeAttribute("DataTextField");
      theObj.removeAttribute("DataValueField");
    }
    
    else if (fieldInfoObj.type == "dynamicMenu"){
      // Just set a few attributes
      theObj.setAttribute("DataSource","<%# " + fieldInfoObj.recordset + ".DefaultView %>");
      theObj.setAttribute("DataTextField",fieldInfoObj.textCol);
      theObj.setAttribute("DataValueField",fieldInfoObj.valCol);
      // And remove any listitem tags
      var newInnerHTML = theObj.getInnerHTML();
      if (newInnerHTML != null)
      {
	      newInnerHTML = newInnerHTML.replace(/<asp:listitem[^>]*>[^<]*<\/asp:listitem>/gi,"");
		  theObj.setInnerHTML(newInnerHTML);
	  }
    }

    if (start){
      var newDocumentContents = wholeDoc.substr(0, start);
      newDocumentContents += selectStr + theObj.getOuterHTML();
      newDocumentContents += wholeDoc.substr(sel[1]);
      dom.documentElement.outerHTML = newDocumentContents;
    
      var index = (selectStr + theObj.getOuterHTML()).toLowerCase().indexOf('<' + tagName.toLowerCase());
      dom.setSelection(start+index+5,start+index+6);    
    }else{
      dotNetUtils.replaceSel(selectStr + theObj.getOuterHTML());
    }    
  }
}
