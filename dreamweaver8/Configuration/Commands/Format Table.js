// Copyright 1998, 1999, 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// *************** GLOBAL VARS  *****************

var helpDoc = MM.HELP_cmdFormatTable;
var DEFAULT_tableStyle = 7;
//these constants used in tableFormats.js file when defining new table formats
var NONE=0,LEFT=1,CENTER=2,RIGHT=3,BOLD=1,ITALIC=2,BOLD_ITALIC=3;

//******************* API **********************

function commandButtons(){
  var tableObj = findTable();
  var Buttons=new Array(MM.BTN_OK,        "applyFormatToSelectedTable();window.close();",
                        MM.BTN_Apply,     "applyFormatToSelectedTable()",
                        MM.BTN_Cancel,    "window.close()",
												MM.BTN_Help,      "displayHelp()");
  if (isUnrecognizedTable(tableObj) || hasCaption(tableObj))
    Buttons=new Array(MM.BTN_OK,"window.close()",
                      MM.BTN_Cancel,"window.close()");

  return Buttons;
}

function canAcceptCommand(){
  if (dw.getDocumentDOM() == null)
    return false;
  else if (dw.getFocus() != 'document')
    return false;
  else if (dw.getDocumentDOM().getParseMode() != 'html')
    return false;
  else if (dw.appName.indexOf("Ringo") >= 0)
  {
    if (dw.getDocumentDOM().isTableLocked())
      return false;
    else if (dw.getDocumentDOM().getShowLayoutView())
      return false;
    else if (dw.getDocumentDOM().getCCSharedSetting_TextOnlyInNonTemplates())
      return false;
    else if (findTable())
      return true;
    else
      return false;
  }
  else if (findTable())
     return true;
  else
    return false;
}


//***************** LOCAL FUNCTIONS  ******************

function findTable(){
  var tableObj="";
  var selObj = dw.getDocumentDOM().getSelectedNode();

  while (tableObj=="" && selObj.parentNode){
    if (selObj.nodeType == Node.ELEMENT_NODE && selObj.tagName=="TABLE")
	  tableObj=selObj;
	else
	  selObj = selObj.parentNode;
  }
  return tableObj;
}

function updatePreview(){
  alternateRows(dwscripts.findDOMObject("presetNames").selectedIndex,getPreviewTable());
}

function removeTag( theObj, Tag )
{
    var children   = theObj.childNodes;
    var nChildren  = children.length;

    for( var i = 0; i < nChildren; i++ )
    {
         var currentChild = children.item(i);

         if ( currentChild.hasChildNodes() )
            removeTag( currentChild, Tag );

         if ( currentChild.nodeType == Node.ELEMENT_NODE &&
              currentChild.tagName == Tag )
              currentChild.outerHTML = currentChild.innerHTML;
     }
}


function applyFormatToSelectedTable(){

  var selObj,selArr;
	var dom = dw.getDocumentDOM()
  
  // get current selection
  selArr = dom.getSelection();
  selObj = dom.offsetsToNode(selArr[0],selArr[1]);
      
  alternateRows(dwscripts.findDOMObject("presetNames").selectedIndex,findTable());
  
  // restore original selection, if it still exists; if not, just select the table.
  if (dw.nodeExists(selObj)){
    selArr = dom.nodeToOffsets(selObj);
  }else{
    selArr = dom.nodeToOffsets(findTable());
  }
  dom.setSelection(selArr[0],selArr[1]);
  
  savePreferences();
}

function isUnrecognizedTable(tableObj) { //checks selected table
  var counter=0;
  var trIter = tableObj.childNodes;
  var trNode=trIter.item(counter);
  var retVal=false;
  while (trNode && !retVal) {
    if (trNode.tagName!="TR" || trNode.childNodes.length==0) 
      retVal=true;
    else trNode=trIter.item(++counter)
  }
  return retVal;
}

function hasCaption(theObj){
  if (theObj.childNodes.item(0).tagName && theObj.childNodes.item(0).tagName=="CAPTION")
    return true;
  return false;
}

function initializeUI() { //fill presetNames list
  var mainLayer=dwscripts.findDOMObject("mainLayer");
  var presetNamesList,nSize,Names,i;
  var tableObj=findTable();
  var selectedFormat;

 if (hasCaption(tableObj))
     mainLayer.innerHTML="<p>&nbsp;</p>" + MSG_CaptionIsPresent;
 else if (isUltraDev() && hasServerBehaviorApplied(tableObj)) {
     mainLayer.innerHTML = "<p>&nbsp;</p>" + MM.MSG_RegionServerBehaviorsNotAllowed;
 } else if (isUnrecognizedTable(tableObj))
    mainLayer.innerHTML="<p>&nbsp;</p>" + MSG_IsInvalidTable;
 else {
	  //add select list options
      mainLayer.visibility="hidden";
      for (i=0;i<4;i++){  //populate select lists
        dwscripts.findDOMObject("topRowAlign").options[i] = new Option(OPTIONS_Align[i]);
        dwscripts.findDOMObject("topRowTextStyle").options[i]=new Option(OPTIONS_Text_Style[i]);
        dwscripts.findDOMObject("leftColAlign").options[i] = new Option(OPTIONS_Align[i]);
        dwscripts.findDOMObject("leftColTextStyle").options[i] = new Option(OPTIONS_Text_Style[i]);
	    dwscripts.findDOMObject("rowLimit").options[i] = new Option(OPTIONS_Row_Limit[i]);
      }
	  dwscripts.findDOMObject("rowLimit").options[4] = new Option(OPTIONS_Row_Limit[4]);

    presetNamesList = dwscripts.findDOMObject("presetNames");
    Names=tableFormats();  //get list of table format names from tableFormats.js file
    nSize = Names.length;
    for (i=0;i<nSize;i++) { 
      presetNamesList.options[i] = new Option(Names[i].name); //populate form field
    }
    dwscripts.findDOMObject("mainLayer").visibility="visible";
    
    selectedFormat = getFormatPreference();
    setUI(selectedFormat); //choose preferred format
    alternateRows(selectedFormat,getPreviewTable()); //apply this format to preview table
    presetNamesList.selectedIndex=selectedFormat; //select default format
 } 
}


function alternateRowColors(trIter,firstRowColor,secondRowColor,rowLimit,useTD,topRowColor){
  var rowLen=trIter.length;
  var cellLen,tdNode,trNode,counter;
  if (rowLimit==0) rowLimit=1000; //repeat first color if rowLimit is equal to 0 
  var counter=2*rowLimit;
  var startRow = (topRowColor)?1:0;
  for (i=startRow;i<rowLen;i++){
    trNode=trIter.item(i);
    rowColor=(counter%(2*rowLimit)<rowLimit)?firstRowColor:secondRowColor;
    if (!useTD){
      // attach bgcolor attribute to tr tags
      trNode.setAttribute("bgcolor",rowColor);
      // remove bgcolor from td tags, so they don't override
      tdIter=trNode.childNodes; cellLen=tdIter.length;
      for (j=0;j<cellLen;j++){
        if (tdIter.item(j).getAttribute("bgcolor") != null && tdIter.item(j).getAttribute("bgcolor") != undefined){   
          tdIter.item(j).removeAttribute("bgcolor"); 
        }
      }
    } 
    else {
      // attach bgcolor attribute to td tags
      // remove tr settings, if any (they're useless now)
      if (trNode.getAttribute("bgcolor") != null && trNode.getAttribute("bgcolor") != undefined){
        trNode.removeAttribute("bgcolor");
      }
      tdIter=trNode.childNodes; cellLen=tdIter.length;
      for (j=0;j<cellLen;j++) 
        tdIter.item(j).setAttribute("bgcolor",rowColor);
	}
    counter++; 
  }
}

function formatTopRow(trIter,topRowColor,topRowTextColor,topRowTextStyle,topRowAlign,useTD){
  var trNode=trIter.item(0), cellLen;

  //add bgcolor & align
  if (!useTD) { 
    // attach bgcolor & align to first row TR tag. make sure to
    // remove settings from TDs to prevent them overriding the TR settings.
    if (topRowColor){
	    trNode.setAttribute("bgcolor",topRowColor);
      tdIter=trNode.childNodes; cellLen=tdIter.length;
      for (i=0;i<cellLen;i++){
        tdNode=tdIter.item(i);
        if (tdNode.getAttribute("bgcolor") != null && tdNode.getAttribute("bgcolor") != undefined){
          tdNode.removeAttribute("bgcolor");
        }
      }
    }
	  if ( !topRowAlign || topRowAlign.toLowerCase() == "none" ){
	    trNode.removeAttribute("align");
    }else{
      trNode.setAttribute("align",topRowAlign);
      tdIter=trNode.childNodes; cellLen=tdIter.length;
      for (i=0;i<cellLen;i++){
        tdNode=tdIter.item(i);
        if (tdNode.getAttribute("align") != null && tdNode.getAttribute("align") != undefined){
          tdNode.removeAttribute("align");
        }
      }
    }
  } else { 
    // attach bgcolor & align to TD tags in first row
    // remove settings from TR tag (they're useless now)
    tdIter=trNode.childNodes; cellLen=tdIter.length;
    for (i=0;i<cellLen;i++){
      tdNode=tdIter.item(i);
	    if (topRowColor)
        tdNode.setAttribute("bgcolor",topRowColor);
      if ( !topRowAlign || topRowAlign.toLowerCase()=="none" )
	      tdNode.removeAttribute("align");
      else
	      tdNode.setAttribute("align",topRowAlign);      
    }
    if (trNode.getAttribute("bgcolor") != null && trNode.getAttribute("bgcolor") != undefined){
      trNode.removeAttribute("bgcolor");
    }
    if (trNode.getAttribute("align") != null && trNode.getAttribute("align") != undefined){
      trNode.removeAttribute("align");
    }
  } 

  //add text color and text formatting
  tdIter=trNode.childNodes; cellLen=tdIter.length;
   for (i=0;i<cellLen;i++) {
     tdNode=tdIter.item(i);
     //set font color, if specified
     if (topRowTextColor){
       if (!findTag(tdNode,"FONT")){ //if the color attribute cannot be added to a "safe" font tag, add it.
         tdNode.innerHTML='<font color="' + topRowTextColor + '">' + tdNode.innerHTML + '</font>';
       }
       else  { //font tag already exists, set color attribute on it
         findTag(tdNode,"FONT").setAttribute("color",topRowTextColor);
       }
		 //remove font color if NOT specified
     }else{
        var fontTag = findTag(tdNode,"FONT");
		 		if (fontTag && fontTag.getAttribute("color")){
					fontTag.removeAttribute("color");
          if (fontTag.attributes.length == 0){
            removeTag(tdNode,"FONT");
          }
				}
			}
      //set text style
     if (topRowTextStyle==0){//if text style set to none
       removeTag(tdNode,"B"); //remove bold tags
       removeTag(tdNode,"I"); //and remove italic tags
     } else {
       if (topRowTextStyle==1 || topRowTextStyle==3){ //if bold or bold italic
         if (topRowTextStyle==1) //if bold
           removeTag(tdNode,"I"); //remove all italic tags
         if (!findTag(tdNode,"B")){ //if a B tag is not found around the table cell text
           removeTag(tdNode,"B"); //remove any other B tags
           tdNode.innerHTML="<b>" + tdNode.innerHTML + "</b>"; //make first child a B tag
         }
       }
       if (topRowTextStyle==2 || topRowTextStyle==3){ //if italic or or bold italic
         if (topRowTextStyle==2) //if italic
           removeTag(tdNode,"B"); //remove all bold tags
         if (!findTag(tdNode,"I")){ //if an I tag is not found around the table cell text 
           removeTag(tdNode,"I"); //remove any other I tags
           tdNode.innerHTML="<i>" + tdNode.innerHTML + "</i>"; //make first child an I tag
         }
       }
     }
   } 
}

function formatLeftCol(trIter,leftColTextStyle,leftColAlign){
  rowLen=trIter.length;
   for (i=0;i<rowLen;i++){
     trNode=trIter.item(i);
     tdNode=trNode.childNodes.item(0);
     //set text style
     if (leftColTextStyle==0){ //if text style set to none
       removeTag(tdNode,"B"); //remove bold tags
       removeTag(tdNode,"I"); //and remove italic tags
     }
     else {
       if (leftColTextStyle==1 || leftColTextStyle==3){ //if text style set to bold or bold italic
         if (leftColTextStyle==1) //if bold
           removeTag(tdNode,"I"); //remove all italic tags
         if (!findTag(tdNode,"B")){ //if B tag is not found around text
           removeTag(tdNode,"B"); //remove all other B tags
           tdNode.innerHTML="<b>" + tdNode.innerHTML + "</b>"; //make first child a B tag
         }
    
       }
       if (leftColTextStyle==2 || leftColTextStyle==3){ //if text style is set to italic or bold italic
         if (leftColTextStyle==2) //if italic
           removeTag(tdNode,"B"); //remove all bold tags
         if (!findTag(tdNode,"I")){ //if i tag is not found around text
           removeTag(tdNode,"I"); //remove all other i tags
           tdNode.innerHTML="<i>" + tdNode.innerHTML + "</i>"; //make first child tag i tag
         }
       }
     }     
     //set alignment
     if ( !leftColAlign || leftColAlign.toLowerCase()=="none" )
	   tdNode.removeAttribute("align");
     else
       tdNode.setAttribute("align",leftColAlign);        
   }
}

function setUI(presetIndex){
      var Names = tableFormats();
	  var thisFormat = Names[presetIndex];			   
      with (thisFormat){
        //error check rowLimit value
	    if (rowLimit>4 || rowLimit<0)rowLimit=1;
	
        //align attributes are specified as "left","center","right", and "";
        //following function gets correct selected index for alignment option
        topRowAlign=getIndex(topRowAlign);
	    leftColAlign=getIndex(leftColAlign); 
        //select the appropriate options
        dwscripts.findDOMObject("rowLimit").selectedIndex=parseInt(rowLimit);
        dwscripts.findDOMObject("topRowAlign").selectedIndex=topRowAlign;
        dwscripts.findDOMObject("topRowTextStyle").selectedIndex=topRowTextStyle;
        dwscripts.findDOMObject("leftColAlign").selectedIndex=leftColAlign;
        dwscripts.findDOMObject("leftColTextStyle").selectedIndex=leftColTextStyle;
	  
	    //fill in textfields
	    dwscripts.findDOMObject("firstRowColor").value = firstRowColor;
	    dwscripts.findDOMObject("firstRow").value = firstRowColor;
	    dwscripts.findDOMObject("secondRowColor").value = secondRowColor;
	    dwscripts.findDOMObject("secondRow").value = secondRowColor;
	    dwscripts.findDOMObject("topRow").value = topRowColor;
	    dwscripts.findDOMObject("topRowColor").value = topRowColor;
	    dwscripts.findDOMObject("topRowTextColor").value = topRowTextColor;
	    dwscripts.findDOMObject("topRowText").value = topRowTextColor;
	    dwscripts.findDOMObject("borderSize").value = border;
	  }

}
function alternateRows(presetChoiceIndex,tableObj){
  var tableNode,trIter,trNode,tdIter,tdNode,counter;
  var useTD,topRowColor,selInd,topRowAlign,topRowTextColor;
  var topRowTextStyle,firstRowColor,secondRowColor;
  var rowLimit,borderSize;

  tableNode=tableObj;
  trIter=tableNode.childNodes;
  useTD=dwscripts.findDOMObject('useTD').checked?true:false;
  
  //The rest of the function assigns values to below variables based on user interface.
  //User interface is initially populated with argument values, but the user can change
  //them to dynamically update the preview table.

  //set variables for the top row
  topRowColor=dwscripts.findDOMObject('topRowColor').value;
  selInd = dwscripts.findDOMObject('topRowAlign').selectedIndex;
  topRowAlign=dwscripts.findDOMObject('topRowAlign').options[selInd].value;
  topRowTextColor=dwscripts.findDOMObject('topRowTextColor').value;
  topRowTextStyle=dwscripts.findDOMObject('topRowTextStyle').selectedIndex;
  
  //set variables for the left col
  selInd = dwscripts.findDOMObject('leftColAlign').selectedIndex;
  leftColAlign=dwscripts.findDOMObject('leftColAlign').options[selInd].value;
  leftColTextStyle=dwscripts.findDOMObject('leftColTextStyle').selectedIndex;
  
  //set variables for the row Colors
  firstRowColor=dwscripts.findDOMObject('firstRowColor').value;
  secondRowColor=dwscripts.findDOMObject('secondRowColor').value;
  rowLimit=dwscripts.findDOMObject("rowLimit").selectedIndex;
  
  //set border size
  borderSize=dwscripts.findDOMObject("borderSize").value;

  //Now, use these values to format the table...
  
  //set table border
  tableNode.setAttribute("border",borderSize); 
 
  //alternate row Colors  
  alternateRowColors(trIter,firstRowColor,secondRowColor,rowLimit,useTD,topRowColor);

  //add left col formatting:text style & alignment
  formatLeftCol(trIter,leftColTextStyle,leftColAlign);

  //add top row formatting:text style,alignent,row color, & text color
  formatTopRow(trIter,topRowColor,topRowTextColor,topRowTextStyle,topRowAlign,useTD);
  
  //set border
  tableNode.setAttribute("border",borderSize);

  //if there is a background color, remove it.
  if (tableNode.getAttribute("bgColor")) {
    tableNode.removeAttribute("bgColor");
  }
}

function updatePreviewTable(){
  var presetIndex = dwscripts.findDOMObject("presetNames").selectedIndex;
  var previewTable = getPreviewTable();
  var mainLayer = dwscripts.findDOMObject("mainLayer");
  
  setUI(presetIndex);
  alternateRows(dwscripts.findDOMObject("presetNames").selectedIndex,previewTable);//format table
}

function getPreviewTable(){
   //returns preview Table object
   return document.getElementsByTagName("TABLE").item(1);
}


function getIndex(align){
  //returns align index of UI that matches text of align argument i.e: "center"
  //Note: I didn't use constants here because it is more intuitive to define
  //the alignment attribute following the html syntax of align="attribute"
    switch (align){
     case "left": align=1; break;
     case "center": align=2; break;
     case "right": align=3; break;
     default: align=0; break;
   }
 return align;
}

//searches the child nodes of tableCellObj -
//returns the innermost object of tagName that surrounds all of the text in
//the cell. returns empty string if not found.
function findTag(obj, tag) {
  var retVal="";
  while (obj.childNodes && obj.childNodes.length == 1) {
    obj = obj.childNodes.item(0);
   if (obj.nodeType == Node.ELEMENT_NODE && obj.tagName == tag)
     retVal=obj;
  }
  return retVal;

}


function getFormatPreference() {
  var metaFile, savedVal, curVal = DEFAULT_tableStyle;
  if (typeof MMNotes != 'undefined') { // Check for MMNotes extension.
   metaFile = MMNotes.open(document.URL, false);
   if (metaFile) {
     // Form specific settings.
     savedVal = MMNotes.get(metaFile, 'MM_pref_FormatTable');
     MMNotes.close(metaFile);
     if (curVal == parseInt(curVal).toString()) {
       curVal = savedVal;
     }
   }
  }
  return parseInt(curVal);
}

function savePreferences() {
  if (typeof MMNotes == 'undefined') {return;} // Check for MMNotes extension.
  var metaFile, curVal;
  metaFile = MMNotes.open(document.URL, true);
  if (metaFile) {
    curVal = MMNotes.set(metaFile, 'MM_pref_FormatTable', findObject("presetNames").selectedIndex);
    MMNotes.close(metaFile);
  }
}
