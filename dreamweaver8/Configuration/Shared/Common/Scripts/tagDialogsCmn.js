// SHARE-IN-MEMORY=true
// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

// CLASS tagDialog
// This static class provides several useful JavaScript functions that 
// can be used by third parties to develop custom tag dialogs. //

// Definitions: 
//   dynamic tag dialog - there are two classifications of tag dialogs: 
//     basic tag dialogs and dynamic tag dialogs. Both modify attributes
//     and values for a particular tag. However, dynamic tag dialogs 
//     have a UI that contains dynamic HTML. The first, topmost control
//     of a dynamic tag dialog is a list control that provides the 
//     primary function of the tag dialog. For instance, for the 
//     the tag <cfftp>, there are many ways to use this tag to upload, 
//     download, delete and copy files. The tag action attribute of the
//     the <cfftp> defines how the tag will be used. Depending on the
//     context of how the tag is being used, the tag many allow for 
//     a variable number of attributes. In a tag dialog, by first asking
//     the user what the primary function of the tag is, we can then 
//     display the acceptable attributes for that tag. When the tag is 
//     edited, the dynamic tag dialog will set the topmost list control
//     to the appropriate value and show the apporpriate list of attributes
//     for within the context. Only Cold Fusion, JRun and JSP feature 
//     dynamic tag dialogs. Tag dialogs that are dynamic define a variable
//     called "applyType" and set its value to "dynamic" in the .htm 
//     source of a tag dialog. The inspectTag() and applyTag() functions
//     include the applyType variable in the parameter of the inspectTagCommon()
//     and applyTagCommon() functions. This alerts these functions that 
//     special actions needed to be taken to show and hide various parts
//     of the UI. 

var configPath = dw.getConfigurationPath(); 

var cbImagePathUnchecked = configPath + (dw.isOSX() ? "/Shared/MM/Images/checkboxOSX.gif" : (dw.isXPThemed() ? "/Shared/MM/Images/checkboxXP.gif" : "/Shared/MM/Images/checkbox.gif"));
var chImagePathChecked   = configPath + (dw.isOSX() ? "/Shared/MM/Images/checkbox_selOSX.gif" : (dw.isXPThemed() ? "/Shared/MM/Images/checkbox_selXP.gif" : "/Shared/MM/Images/checkbox_sel.gif"));
var cbImagePathDisabled  = configPath + (dw.isOSX() ? "/Shared/MM/Images/checkbox_disOSX.gif" : (dw.isXPThemed() ? "/Shared/MM/Images/checkbox_disXP.gif" : "/Shared/MM/Images/checkbox_dis.gif"));


// Defining attname="innerhtml" for a textarea indicates that the value 
// of the field goes between the opening and closing tags and not in an 
// attribute on the tag itself. 

// Defining attname="innerhtmlencoded" for a textarea indicates that the 
// entity-encoded value of the field goes between the opening and closing 
// tags and not in an attribute on the tag itself. Entities will be decoded
// when the dialog is populated.

function tagDialog()
{
}

// Public Methods
tagDialog.inspectTagCommon = tagDialog_inspectTagCommon;
tagDialog.applyTagCommon = tagDialog_applyTagCommon;
tagDialog.browseFile = tagDialog_browseFile;
tagDialog.browseFolder = tagDialog_browseFolder;
tagDialog.populateDropDownList = tagDialog_populateDropDownList;
tagDialog.showOnlyThisLayer = tagDialog_showOnlyThisLayer;
tagDialog.updateColorPicker = tagDialog_updateColorPicker; 
tagDialog.isHexColor = tagDialog_isHexColor; 
tagDialog.setOSXStyleSheetIfNeeded = tagDialog_setOSXStyleSheetIfNeeded; 

// Private Methods
tagDialog.initializeTagNodeObj = tagDialog_initializeTagNodeObj;

//*-------------------------------------------------------------------
// FUNCTION:
//   inspectTagCommon()
//
// DESCRIPTION:
//   Common API function for tag dialogs that ship with UD. Scans a tagNodeObj
//   for attributes and initializes available UI controls within a tag dialog. 
//
// ARGUMENTS:
//   tagNodeObj - a tag node object 
//   theUIObjects - an array of list controls that are used by the current tag dialog 
//   applyType - type of tag dialog insert (for ex., "dynamic")
//   selectedNode - the node of the selected dynamic 
//   SELECTORLIST - the list control object that is used to navigate a dynamic tag dialog
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------

function tagDialog_inspectTagCommon(tagNodeObj, theUIObjects, applyType, selectedNode, SELECTORLIST)
{
  // get all of the input tags and text area tags (controls that store attribute values)
  var theInputTags = document.getElementsByTagName("input");  
  var theTextAreaTags = document.getElementsByTagName("textarea"); 

  // if we're inspecting a "dynamic" tag dialog... (see top for definition)
  if (applyType == "dynamic"){
    // check to see if the attname of the selector list already has an 
    // attribute value defined in the tagNodeObj
    var theSelectListAttName = SELECTORLIST.object.getAttribute("attname");
    var attValue;
    if ((theSelectListAttName == undefined || theSelectListAttName == "") && selectedNode){
      attValue = selectedNode.id.substring(3);
    }else{
      attValue = tagNodeObj.getAttribute(theSelectListAttName);
    }
    var divObject = null;
     
    // if there's an attribute value already defined, find it in the selector list  
    if (attValue){
      attValue = attValue.toLowerCase();
      SELECTORLIST.pickValue(attValue);
    }
    // otherwise set the index to zero 
    else{
      SELECTORLIST.setIndex(0); 
    }
	
	//get the value again from the tag selector (if it couldn't find the 
	//value that was passed in because it's not a valid value, then this should get us a valid one)
	attValue = SELECTORLIST.getValue();

    divObject = dwscripts.findDOMObject("the" + attValue);
    
    // only call showOnlyThisLayer() if "dynamic" tab is showing	  
    if (divObject && divObject.parentNode && divObject.parentNode.visibility && divObject.parentNode.visibility == "visible"){
      tagDialog.showOnlyThisLayer(attValue, divObject.parentNode);
    }
  }

  // Lets begin inspecting the input tags and initialize the UI accordingly, depending
  // on the control 
  
  // for every input tag in the tag dialog UI 
  for (var i=0;i<theInputTags.length;++i)
  {
    // if it has an attribute name 
    if (theInputTags[i].attname)
    {  
      // and the tag type is text 
      if (theInputTags[i].type == "text")
      {
        // and this name is already defined in the tagNodeObj
        if (tagNodeObj.getAttribute(theInputTags[i].attname))
        {  
          // set the UI control's value to be the attribute value
          theInputTags[i].value = tagNodeObj.getAttribute(theInputTags[i].attname);  
        } 

        // or if the content is supposed to go in the innerhtml
        else if (theInputTags[i].attname.toLowerCase() == "innerhtml")
        {
          theInputTags[i].value = tagNodeObj.innerHTML; 
        }
        else if (theInputTags[i].attname.toLowerCase() == "innerhtmlencoded")
        {
          theInputTags[i].value = dwscripts.entityNameDecode(tagNodeObj.innerHTML); 
        }
      }

      else if (theInputTags[i].type == "image")
      {
        // alert("theInputTags[i].outerHTML: " + theInputTags[i].outerHTML + "\ntheInputTags[i].attname: " + theInputTags[i].attname + "\ntheInputTags[i].value: " + theInputTags[i].value + "\ntagNodeObj.getAttribute('font-bold'): " + tagNodeObj.getAttribute('font-bold')); 
        
        // and this name is already defined in the tagNodeObj
        if (tagNodeObj.getAttribute(theInputTags[i].attname) && tagNodeObj.getAttribute(theInputTags[i].attname).toLowerCase() == theInputTags[i].truevalue)
        {
          theInputTags[i].src = chImagePathChecked; 
          theInputTags[i].value = "checked"; 
        }
        else if (tagNodeObj.getAttribute(theInputTags[i].attname) && tagNodeObj.getAttribute(theInputTags[i].attname).toLowerCase() == theInputTags[i].falsevalue)
        {
          theInputTags[i].src = cbImagePathUnchecked; 
          theInputTags[i].value = "unchecked"; 
        }
        else
        {
          theInputTags[i].src = cbImagePathDisabled; 
          theInputTags[i].value = "disabled"; 
        }
                
      }
      // or if the tag type is a checkbox
      else if (theInputTags[i].type == "checkbox")
      {
        // and this name is already defined in the tagNodeObj
        if (tagNodeObj.getAttribute(theInputTags[i].attname))
        {         
          // initialize the truevalue and false values 
          var trueValue = (theInputTags[i].truevalue) ? theInputTags[i].truevalue : "";
          var falseValue = (theInputTags[i].falsevalue) ? theInputTags[i].falsevalue : "";
          
          // if the tagNodeObj attribute matches the "truevalue" attribute on the control
          if (tagNodeObj.getAttribute(theInputTags[i].attname) == trueValue)
          {
            // set the control element to a checked state
            theInputTags[i].setAttribute("checked", true); 
          } 
          
          // if the tagNodeObj attribute matches the "falsevalue" attribute on the control 
          else if (tagNodeObj.getAttribute(theInputTags[i].attname) == falseValue)
          {
            // set the control element to a non-checked state
            theInputTags[i].removeAttribute("checked"); 
          } 
                 
          // otherwise do nothing for (we may want to add more cases later)
          else 
          {
            // do nothing
          }
        } 
        
        // if the attribute has not yet been defined in the tagNodeObj
        else 
        {
          // and if the control is not set to be checked
          if (!theInputTags[i].checked)
          {
            // remove the checked attribute altogether
            theInputTags[i].removeAttribute("checked"); 
          }
        }

        // if the the tagNodeObj has the attribute defined and the tagNodeObj has an attribute "checked" set to true" 
        if (tagNodeObj.getAttribute(theInputTags[i].attname) && tagNodeObj.getAttribute("checked") == "true")
        { 
          // the control is supposed to be checked so check it
          theInputTags[i].checked = true;
        } 
      }
    }  
  }
  
  // if there are textarea tags in the current dialog... 
  if (theTextAreaTags.length > 0)
  {
    // for every textarea tag
    for (var k=0;k<theTextAreaTags.length;++k)
    {
      // if the tagNodeObj has an attribute name that matches the name of the current textarea 
      if (tagNodeObj.getAttribute(theTextAreaTags[k].attname))
      {
        // set the contents of the textarea to the contents of matching tagNodeObj attribute
        theTextAreaTags[k].value = tagNodeObj.getAttribute(theTextAreaTags[k].attname);
      }
      else if (theTextAreaTags[k].attname.toLowerCase() == "innerhtml")
      {
        theTextAreaTags[k].value = tagNodeObj.innerHTML;
      }
      else if (theTextAreaTags[k].attname.toLowerCase() == "innerhtmlencoded")
      {
        theTextAreaTags[k].value = dwscripts.entityNameDecode(tagNodeObj.innerHTML);
      }
    }
  }  

  // if an array of list controls was passed in... 
  if (theUIObjects && theUIObjects.constructor == Array){
    for (var x=0;x<theUIObjects.length;++x){
      // if the UIObject is a select object (it should be if used properly) 
      if (theUIObjects[x].object == "[object Select]"){
        // get the attribute that this control corresponds to
        var theAttName = theUIObjects[x].object.getAttribute('attname');          
        // if the tagNodeObj has an attribute of that name
        if (tagNodeObj.getAttribute(theAttName))
        {
          // get the attribute value and convert it to lower case for comparison
          // with list values
          var attValue = tagNodeObj.getAttribute(theAttName).toLowerCase();
                              
          // set "we've found a matching value" flag to false
          var foundMatch = false;
  
          //check for multiple select lists
		  if( theUIObjects[x].object.multiple )
		  {			  
			  if( attValue )
			  {
			  	//for now, assume the attr is a comma separated list
			  	var attValueArray = attValue.split(',');
			 	for (var k=0;k<attValueArray.length;++k)
			  	{
					  //just go through and pick all the values in the list, for the first one set the selected index too so the first value isn't selected in the list
					  if( !foundMatch )
					  	foundMatch = theUIObjects[x].pickValue(attValueArray[k], new Function("a,b", "return (a.toLowerCase() == b.toLowerCase());"));
					 
					  theUIObjects[x].pickValue(attValueArray[k], new Function("a,b", "return (a.toLowerCase() == b.toLowerCase());"), true);
			  	}
			  }
		  }
		  else
		  {
			  // look for the current attribute value in the list
			  for (var k=0;k<theUIObjects[x].getLen();++k)
			  {
				var listValue = theUIObjects[x].getValue(k).toLowerCase(); 
	
				// if the attribute in the tagNodeObj matches the item in the current select list, or one of the items
				// in the list has a value of " ", and the corresponding attribute has a value of empty string (this will
				// happen with the alt attribute on images, and perhaps others).
				if (listValue ==  attValue || (listValue == " " && attValue == ""))
				{
				  // set the current item for this list control to this item 
				  theUIObjects[x].setIndex(k); 
				  break;
				}
	
				// if a matching value wasn't found, add the current value to the list
				if (!foundMatch)
				{
				  theUIObjects[x].pickValue(tagNodeObj.getAttribute(theAttName)); 
				}
			  }
		  }
        }
      }
    }
  }
} 




//*-------------------------------------------------------------------
// FUNCTION:
//   applyTagCommon()
//
// DESCRIPTION:
//   Common API function for tag dialogs that ship with UD. Identifies 
//   user input and applies a new version of the tag into the tagNodeObj. 
//
// ARGUMENTS:
//   tagNodeObj - a tag node object 
//   theUIObjects - an array of list controls that are used by the current tag dialog 
//   applyType - type of tag dialog insert (for ex., "dynamic")
//   selectedNode - the node of the selected dynamic 
//
// RETURNS:
//   Nothing (at least not explicitly - it does return a modified version of the
//   tagNodeObj DOM node) 
//--------------------------------------------------------------------

function tagDialog_applyTagCommon(tagNodeObj, theUIObjects, applyType, selectedNode){
  var theInputTags = new Array(); 
  var theTextAreaTags = new Array();
  var allViewableSelects = new Array();
  var allViewableSelectNames = new Array(); 

  // if we're inspecting a "dynamic tag dialog"... (see top for definition)
  if (applyType == "dynamic"){
    // if there are attributs on this tag
    if (tagNodeObj.attributes.length){
      // remove all attributes by initializing the tagNodeObj. 
      // we do not want to have any leftover attributes since dynamic 
      // tag dialogs require specific attributes to be defined depending
      // on their context
      tagDialog.initializeTagNodeObj(tagNodeObj); 
    }
    
    // since this is a dynamic tag dialog, we only care about applying values
    // from the controls that are in the visible <div>
    theInputTags = selectedNode.getElementsByTagName("input");
    theTextAreaTags = selectedNode.getElementsByTagName("textarea");
    allViewableSelects = selectedNode.getElementsByTagName("select");  

    // however, the entire tag dialog might not be dynamic -- only one tab 
    // might be -- so check whether there's more than one top-level div. 
    // if there is, then we care about the fields in the other top-level 
    // divs as well.
    var docChildren = document.body.childNodes;
    for (var q=0; q < docChildren.length; q++)
    {
      var theInputs;
      var theTextareas;
      var theSelects;

      if (docChildren[q].tagName && docChildren[q].tagName == 'DIV'){
        // if this div is not the parent of selectedNode, then we've found
        // another top-level div. add its input fields and textareas to
        // the input and textarea arrays.
        if (docChildren[q] != selectedNode.parentNode){
          theInputs = docChildren[q].getElementsByTagName('input');
          for (var x=0; x < theInputs.length; x++){
            theInputTags.push(theInputs[x]);
          }
          theTextareas = docChildren[q].getElementsByTagName('textarea');
          for (var y=0; y < theTextareas.length; y++){
            theTextAreaTags.push(theTextareas[y]);
          }
          theSelects = docChildren[q].getElementsByTagName('select');
          for (var m=0; m < theSelects.length; m++){
            allViewableSelects.push(theSelects[m]);
          }
        }
      }
    }

    // all dynamic tag dialogs should have a list control that defines 
    // an implicit attribute/value pair.
    var theSelectorNode = dwscripts.findDOMObject("theselector"); 
    
    // if that list control exists 
    if (theSelectorNode)
    { 
    
      // get the selected value 
      var curSeletorIndexVal = theSelectorNode.options[theSelectorNode.selectedIndex].value; 

      // if the selected value exists and the the list control has an 
      // attname attribute and its not an empty string
      if (curSeletorIndexVal && curSeletorIndexVal != "" && theSelectorNode.attname && theSelectorNode.attname != "")
      {
        // apply this attribute/value pair to the tagNodeObj
        tagNodeObj.setAttribute(theSelectorNode.attname, curSeletorIndexVal); 
      }    
    }
  }
	
  // IF THE TAG DIALOG IS **NOT** DYNAMIC 
  else{
    // grab all of the input and text area tags in the tag dialog 
    theInputTags = document.getElementsByTagName("input");  // grab all input elements 
    theTextAreaTags = document.getElementsByTagName("textarea"); // grab all text areas
  }

  // first identify all of the input tags and search for values to 
  // add onto the current tag 
  for (var i=0;i<theInputTags.length;++i){     
    // if this is a text field
    if (theInputTags[i].type == "text" || theInputTags[i].type == "hidden" )
    {
      // if it has a value and it's not "innerHTML" 
      if (theInputTags[i].value && theInputTags[i].attname.toLowerCase() != "innerhtml")
      {      
        // set this attribute to the value specificied in the UI
        tagNodeObj.setAttribute(theInputTags[i].attname,theInputTags[i].value);
      } 
      
      // or if the the attname is innerHTML 
      else if (theInputTags[i].attname.toLowerCase() == "innerhtml")
      {
        // set the innerHTML of the tagNodeObj to the field value 
        tagNodeObj.innerHTML = theInputTags[i].value;     
      }
			
      else if (theInputTags[i].attname.toLowerCase() == "innerhtmlencoded")
      {
        // set the innerHTML of the tagNodeObj to the entity-encoded field value 
        tagNodeObj.innerHTML = dwscripts.entityNameEncode(theInputTags[i].value);     
      }

      else
      { 
        // if this is a required attribute but no value has been set in
        // the UI, add it with an empty value.
        if (theInputTags[i].required && theInputTags[i].required == "true")
        {
          // set the value of the attribute to a single space, then set it
          // to empty string. this forces the attribute to be added without
          // a value.
          tagNodeObj.setAttribute(theInputTags[i].attname, " ");  
          tagNodeObj.setAttribute(theInputTags[i].attname, "");  
        }
        
        // no value has been set in the UI, and the attribute is not
        // required, so it can be removed.
        else
        {
          tagNodeObj.removeAttribute(theInputTags[i].attname);
        }
      }
    }
    
    // if this is a checkbox and it has an attname
    else if (theInputTags[i].type == "checkbox" && theInputTags[i].attname)
    {
      // and it's checked... 
      if (theInputTags[i].checked == true)
      {
        // and the true value is not an empty string
        if (theInputTags[i].truevalue != "")
        {
          // set the the attribute name to the value of the "truevalue" attribute
          tagNodeObj.setAttribute(theInputTags[i].attname,theInputTags[i].truevalue);  
        }
        else{
          tagNodeObj.removeAttribute(theInputTags[i].attname);
        }
      } 
      
      // if the checkbox is not checked, and it has a non-empty false value defined
      else if (theInputTags[i].falsevalue && theInputTags[i].falsevalue != "")
      {
        // set the attribute to the value of the "falsevalue" attribute
        tagNodeObj.setAttribute(theInputTags[i].attname,theInputTags[i].falsevalue);
      }
      
      // if it is neither checked nor has a false value defined  
      else
      {
        // remove the attribute 
        tagNodeObj.removeAttribute(theInputTags[i].attname); 
      }
    }
    // we assume we're dealing with a multicheckbox when an image is defined that has an attname attribute
    else if (theInputTags[i].type == "image" && theInputTags[i].attname)
    {
      if (theInputTags[i].value == "disabled")
      {
        // As long as there's no dynamic code in there, it's OK to remove the attribute.
        if (tagNodeObj.getAttribute(theInputTags[i].attname) && tagNodeObj.getAttribute(theInputTags[i].attname).indexOf('<%') == -1){
          tagNodeObj.removeAttribute(theInputTags[i].attname);
        }      
      }      
      else if (theInputTags[i].value == "checked")
      {
        tagNodeObj.setAttribute(theInputTags[i].attname,theInputTags[i].truevalue);        
      }      
      else if (theInputTags[i].value == "unchecked")
      {
        tagNodeObj.setAttribute(theInputTags[i].attname,theInputTags[i].falsevalue);        
      }       
    }
    
  } 

  // now its time to apply the contents of any textareas in the tag dialog
  if (theTextAreaTags.length > 0)
  {
    // lets run through every textarea tag
    for (var k=0;k<theTextAreaTags.length;++k)
    {     
      // if this textarea's content goes as typed between the opening and closing
      // tags of the tagNodeObj
      if (theTextAreaTags[k].getAttribute("attname").toLowerCase() == "innerhtml")
      {
        if (theTextAreaTags[k].value != "")
        {
          tagNodeObj.innerHTML = theTextAreaTags[k].value;  
        }         
      }
      // if this textarea's entity-encoded content goes between the opening and 
      // closing tags of the tagNodeObj
      else if (theTextAreaTags[k].getAttribute("attname").toLowerCase() == "innerhtmlencoded")
      {
        if (theTextAreaTags[k].value != "")
        {
          tagNodeObj.innerHTML = dwscripts.entityNameEncode(theTextAreaTags[k].value);  
        }         
      }
      // otherwise, this textarea corresponds to a specific attribute.
      else
      {
        // and the user has entered text into this field
        if (theTextAreaTags[k].value != "")
        {
          // and the content does not consist of just white spaces
          var notWhiteSpace = theTextAreaTags[k].innerHTML.search(/[^\s]/);
          if (notWhiteSpace >= 0)
          {
            // add this attribute and its value to the tagNodeObj 
            tagNodeObj.setAttribute(theTextAreaTags[k].attname,theTextAreaTags[k].value);  
          }
        }
        else if (theTextAreaTags[k].required && theTextAreaTags[k].required == "true")
        {
      	  // set the value of the attribute to a single space, then set it
          // to empty string. this forces the attribute to be added without
          // a value.
          tagNodeObj.setAttribute(theTextAreaTags[k].attname, " ");  
          tagNodeObj.setAttribute(theTextAreaTags[k].attname, "");  					
        } 
        else if (theTextAreaTags[k].value == "")
        {
          tagNodeObj.removeAttribute(theTextAreaTags[k].attname);  
        }
        else{
          // alert("**Unknown condition**\ntheTextAreaTags[k].value: " + theTextAreaTags[k].value);  
        }
      }
    }
  } 

  // if an array of list controls exists, process the controls in the array
  if (theUIObjects && theUIObjects.length > 0)
  {
    var curValue;
    var curAttributeName;
	
    // create an array of the names of the relevant list objects
	for (var k=0;k<allViewableSelects.length;++k)
    {
   	  allViewableSelectNames.push(allViewableSelects[k].name); 
   	}

    for (var z=0;z<theUIObjects.length;++z)
    {
	  if( theUIObjects[z].object.multiple ) 
	  {
		  	//for now, assume the attr is a comma separated list
			var selectedArray = theUIObjects[z].getValue("multiple");
			if( selectedArray.length > 0 ) {
				curValue = selectedArray.join(",");
			}
	  }
	  else
	  {
			curValue = theUIObjects[z].getValue();
	  }
      curAttributeName = theUIObjects[z].object.getAttribute('attname');

      if (applyType == "dynamic")
      {
        var saveThisAttribute = 0;
        saveThisAttribute = dwscripts.findInArray(allViewableSelectNames,theUIObjects[z].selectName); 

        if (saveThisAttribute >= 0)
        {
	        tagNodeObj.setAttribute(curAttributeName, curValue);             
        }     
      }
      else
      {
        if (curValue && curValue != "")
        { 
          tagNodeObj.setAttribute(curAttributeName, curValue); 
        }        
        // if this is a required attribute but no value has been set in
        // the UI, add it with an empty value.
        else if (theUIObjects[z].object.getAttribute("required") && theUIObjects[z].object.getAttribute("required") == "true")
        {
        // set the value of the attribute to a single space, then set it
        // to empty string. this forces the attribute to be added without
        // a value.
          tagNodeObj.setAttribute(curAttributeName, " ");  
          tagNodeObj.setAttribute(curAttributeName, "");  
        }
        else
        {
          tagNodeObj.removeAttribute(curAttributeName); 
        }
      }
      // if we've just set an attribute to " ", go back and set it to empty string. this will happen
      // with the alt attribute on img tags, and perhaps others.
      if (tagNodeObj.getAttribute(curAttributeName) && tagNodeObj.getAttribute(curAttributeName) == " ")
      {
        tagNodeObj.setAttribute(curAttributeName, "");
      }
    }
  }
}




//*-------------------------------------------------------------------
// FUNCTION:
//   browseFile()
//
// DESCRIPTION:
//   Displays the browse file dialog and sets the return value to the 
//   the appropriate field name
//
// ARGUMENTS:
//   fieldName - dom node whose value attribute will contain the file url
//   parentLayer - the object representing the layer that contains the field
//   (optional; use if there's a naming conflict between fields and/or layers)
//   convertToLocalPath - converts to a local file path if true (default false) 
//
// RETURNS:
//   Nothing
// 
// TODO:
//   1. check to see if this exists in common code already
//   2. if not, consider using a smarter file label 
//--------------------------------------------------------------------

function tagDialog_browseFile(fldName,parentLayer,convertToLocalPath)
{
  var fileName; 
  var curFld = (parentLayer)?dwscripts.findDOMObject(fldName,parentLayer):dwscripts.findDOMObject(fldName);
  var convertToLocalPath = (convertToLocalPath) ? 1: 0; 
   
  fileName = dw.browseForFileURL("select", "", 0, 0);
  
  if (convertToLocalPath) 
  { 
    fileName = dwscripts.localURLToFilePath(fileName); 
  }
  if (fileName.length > 0)
  {
    curFld.value = fileName;    
  }
}




//*-------------------------------------------------------------------
// FUNCTION:
//   browseFolder()
//
// DESCRIPTION:
//   Displays the browse folder dialog and sets the return value to the 
//   the appropriate field name
//
// ARGUMENTS:
//   fieldName - dom node whose value attribute will contain the file url
//   parentLayer - the object representing the layer that contains the field
//   (optional; use if there's a naming conflict between fields and/or layers)
//   convertToLocalPath - converts to a local file path if true (default false) 
//
// RETURNS:
//   Nothing
//
// RETURNS:
//   Nothing
// 
// TODO: 
//   Is this in dwscripts already? This code should live in a common lib
//--------------------------------------------------------------------

function tagDialog_browseFolder(fldName,parentLayer,convertToLocalPath)
{
  var fileName;
  var curFld = (parentLayer)?dwscripts.findDOMObject(fldName,parentLayer):dwscripts.findDOMObject(fldName);
  var selectedDir = curFld.value;
  var theSite = dreamweaver.getSiteRoot();

  if (DWfile.exists(selectedDir)) 
  {
    fileName = dw.browseForFolderURL(MM.MSG_ProxyChooseFolder, selectedDir);
  } 
  else 
  {
    fileName = dw.browseForFolderURL(MM.MSG_ProxyChooseFolder);
  }
  
  if (fileName) 
  {
    if (fileName.indexOf("file://") != -1) 
    {
      if (convertToLocalPath) 
        curFld.value =  dwscripts.localURLToFilePath(fileName); 
      else 
        curFld.value = fileName; 
    } 
    else 
    {
      fileName = theSite + fileName;
      if (convertToLocalPath) 
        curFld.value =  dwscripts.localURLToFilePath(fileName); 
      else 
        curFld.value = fileName;       
    }
  }
}




//*-------------------------------------------------------------------
// FUNCTION:
//   populateDropDownList()
//
// DESCRIPTION:
//   Populates a dropdown list object (argument1) with a set of values 
//   from an array (argument2) and, conditionally, adds an empty 
//   initial value (argument3). 
//   
//
// ARGUMENTS:
//   DROPDOWNOBJ - a dropdown list control 
//   srcArray - an array of strings to populate the value and display name of the control
//   bAddEmpty - true/false value that inserts an initial empty <option> if needed 
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------

function tagDialog_populateDropDownList(DROPDOWNOBJ, displayArray, valueArray, bAddEmpty)
{
  
  // if the the length of the value and display arrays are the same... 
  if (displayArray.length == valueArray.length)
  {
    // if the user wants an empty initial value, add it
    if (bAddEmpty && displayArray[0] != ""){
      displayArray.unshift("");
      // Make sure that different arrays were passed in for display and value
      // before adding an empty string to the value array (otherwise you'll
      // end up adding two empty items to the same array!).
      if (displayArray != valueArray){
        valueArray.unshift("");
      }
    } 

    // set all the labels and values of the list control at once
    DROPDOWNOBJ.setAll(displayArray,valueArray);

  }
  else 
  {
    throw dwscripts.sprintf(MM.MSG_mismatchedArrayLength, DROPDOWNOBJ.selectName, displayArray.length,valueArray.length);
  }

  // set index to zero
  DROPDOWNOBJ.setIndex(0); 

  return true; 
}




//*-------------------------------------------------------------------
// FUNCTION:
//   showOnlyThisLayer()
//
// DESCRIPTION:
//   Used by dynamic tag dialogs to ensure that only one UI view (as defined
//   in a unique <div> tag) is visible. This function gets called when the
//   user selects an item in the dropdown list to change the context of the
//   dynamanic tag dialog. 
//   
//
// ARGUMENTS:
//   showThisLayerName - the name of the layer that should be visible. 
//
// RETURNS:
//   Nothing
// 
// TODO: 
//   Make this function a bit more flexible so that we don't have to 
//   locally prefix the showThisLayerName to be 
//--------------------------------------------------------------------

function tagDialog_showOnlyThisLayer(showThisLayerName,parent)
{
  if (parent == undefined) parent = document;

  var allDivTags = parent.getElementsByTagName("div"); 
  showThisLayerName = "the" + showThisLayerName; 

  // for every div tag found
  for (var i=0;i<allDivTags.length;++i)
  {
    // if the id doesn't match the layer name to show and the name attribute is not defined
    if (allDivTags[i].id != showThisLayerName && !allDivTags[i].name)
    {
      // hide this layer
      allDivTags[i].visibility = "hidden"; 
    }
    // otherwise, show it
    else
    {
      allDivTags[i].visibility = "inherit"; 
    }   
    
    // refresh the current div tag so that the UI is updated (hack) 
    allDivTags[i].innerHTML = allDivTags[i].innerHTML; 
  }
}




//*-------------------------------------------------------------------
// FUNCTION:
//   initializeTagNodeObj()
//
// DESCRIPTION:
//   Given the tagNodeObj, remove all attributes. Used by dynamic tag 
//   dialogs that require all attributes be removed since we only
//   want to apply the attributes that are visible within the current 
//   view
//
// ARGUMENTS:
//   a tagNodeObj (global var) 
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------

function tagDialog_initializeTagNodeObj(tagNodeObj)
{
  var tagName = tagNodeObj.tagName;
  var tagDlgPath = document.URL;
  
  // special case - if a tagName has a ":" such as "jrun:xslt", be sure to 
  // remove the namespace ("jrun") because the .vtm file name will just be "xslt.vtm"  
  if (tagName.substring(":"))
  {
    tagName = tagName.substring(tagName.lastIndexOf(':')+1,tagName.length); 
  }
  var vtmFile = dw.getDocumentDOM(tagDlgPath.substring(0,tagDlgPath.lastIndexOf('/')+1) + tagName + ".vtm");
  var knownAttribs = vtmFile.getElementsByTagName('ATTRIB');
  var tagAttribs = tagNodeObj.attributes;

  for (var i=0; i < tagAttribs.length; i++)
  { 
    for (var k=0; k < knownAttribs.length; k++){
      if (tagAttribs[i].name.toUpperCase() == knownAttribs[k].name.toUpperCase()){
        tagNodeObj.removeAttribute(tagAttribs[i].name);
      }
    }
  }   
}

//*-------------------------------------------------------------------
// FUNCTION:
//   updateColorPicker()
//
// DESCRIPTION:
//   Given a controlType ("colorPicker" or "colorField"), a buttonControl and 
//   textControl name, updates the appropriate control. This is based on the 
//   the version of updateColorPicker in FlashObjects.js but removes validation. 
//   We've added at as a static function to remove the dependency on FlashObjects.js 
//   The colorPickerControlClass should probably be used instead at some point in 
//   the future. For now, this seems like least risky approach. 
//
// ARGUMENTS:
//   controlType, buttonControl, textControl
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------


function tagDialog_updateColorPicker(controlType, buttonControl, textControl, escapeHashes)
{
  var colorCP, colorF;
  if (controlType == "colorPicker")
  {
    if (escapeHashes){ 
      colorCP = "#" + buttonControl.value;     
    }
    else {
      colorCP = buttonControl.value;          
    }
    textControl.value = colorCP;
  }
  else if (controlType == "colorField")
  {
    colorCP = buttonControl.value;
    colorF = textControl.value;
    if (colorF && tagDialog.isHexColor(colorF))
    {
      if (escapeHashes){ 
        colorF = "##"+colorF;
      } else {
        colorF = "#"+colorF;
      } 
      textControl.value = colorF;
    }
    
    if (colorCP != colorF)
    {
      buttonControl.value =  colorF;   // this line does not always work (bug in colorpicker, does not update "")
    }
  }
}

//*-------------------------------------------------------------------
// FUNCTION:
//   isHexColor()
//
// DESCRIPTION:
//   checks to see if "theColor" is a hex color with no # sign in front
//
// ARGUMENTS:
//   theColor (string) 
//
// RETURNS:
//   true/false
//--------------------------------------------------------------------

function tagDialog_isHexColor(theColor)
{
  var pattern = new RegExp("\[a-fA-F0-9\]\{"+theColor.length+"\}");
  var retVal = false;
  if (theColor.length==6 && theColor.search(pattern)!=-1)
    retVal = true;
  return retVal;
}


//*-------------------------------------------------------------------
// FUNCTION:
//   setOSXStyleSheetIfNeeded()
//
// DESCRIPTION:
//   if the system is OSX, dynamically generate a style sheet that tightens
//   the control layout. This function should only be called for tag editors
//   that have so many controls that some of the controls are stripped. 
//   it uses a style sheet in shared/mm/scripts/styles/forms-osx.css 
//   Only a few tag editors take advantage of this function including 
//   <cfschedule>. In order to make this style placeholder work, you must 
//   define a dummy tag <styleplaceholder> in your .htm file somewhere inside
//   the head tag. We use a regular expression to replace that placeholder
//   tag with the link to the style sheet. 
//
// ARGUMENTS:
//   theColor (string) 
//
// RETURNS:
//   true/false
//--------------------------------------------------------------------
function tagDialog_setOSXStyleSheetIfNeeded()
{
  // if its an OSX document, swap the the <styleplaceholder> tag with a link to 
  // the osx10 shee that reduces the white space between controls. 
  if (dw.isOSX())
  {
    var docElem = document.documentElement.innerHTML; 
    var theOSXStylePath = "<link href=\"../../Shared/MM/Styles/forms-osx.css\" rel=\"stylesheet\" type=\"text/css\">";
    document.documentElement.innerHTML = document.documentElement.innerHTML.replace(/<styleplaceholder>/gi,theOSXStylePath); 
  }
}