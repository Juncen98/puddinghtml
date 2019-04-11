// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//*************** GLOBAL VARS  *****************

var helpDoc = MM.HELP_cmdSortTable;

var HAVE_SORTED_BY = new Array(9);

//******************* API **********************

function commandButtons(){
   var tableObj = findTable();
   var retArr = new Array(MM.BTN_OK,     "sortAndClose()",
                          MM.BTN_Apply,   "sortTable()",
                          MM.BTN_Cancel,  "window.close()",
                          MM.BTN_Help,    "displayHelp()");

   //display buttons that can only close the dialog if there are problems with table format
   if (hasSpans(tableObj) || isInvalidTable(tableObj))  
     retArr=new Array(MM.BTN_OK,"window.close()",MM.BTN_Cancel,"window.close()");

   return retArr;
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
  var dom = dw.getDocumentDOM();
  var tableObj="";
  var selObj = dom.getSelectedNode();

  while (tableObj=="" && selObj.parentNode){
    if (selObj.nodeType == Node.ELEMENT_NODE && selObj.tagName=="TABLE")
	  tableObj=selObj;
	else
	  selObj = selObj.parentNode;
  }
  return tableObj;
}

function sortAndClose(){
  //If the current sort has already been applied, close the dialog
  //otherwise, sort
  if (findObject("sortCol").selectedIndex==HAVE_SORTED_BY[0] &&
      findObject("subsortCol").selectedIndex-1==HAVE_SORTED_BY[1] &&
      findObject("sortType").selectedIndex==HAVE_SORTED_BY[2] &&
      findObject("subsortType").selectedIndex==HAVE_SORTED_BY[3] &&
      findObject("sortOrder").selectedIndex==HAVE_SORTED_BY[4] &&
      findObject("subsortOrder").selectedIndex==HAVE_SORTED_BY[5]&&
	  findObject("sortFirstRow").checked==HAVE_SORTED_BY[6] &&
	  findObject("sortHeadRows").checked==HAVE_SORTED_BY[7] &&
	  findObject("sortFootRows").checked==HAVE_SORTED_BY[8]){
      window.close();
	  }
   else{
     sortTable();
     window.close();
   }

}

// sort rows in a TBODY section, or in a TABLE
function sortRows(theObj) {
	// skip caption, col, colgroup, thead, tfoot
	// (note: if there's a tbody, this function will be called
	// on that; there may, however, be a thead/tfoot, and then
	// normal rows, in which this will be called on the table object.

  var sortCol = findObject("sortCol").selectedIndex;
  var subsortCol = findObject("subsortCol").selectedIndex-1;
  var bAlphaSort = findObject("sortType").selectedIndex==0 ? true : false;
  var bAlphaSubsort = findObject("subsortType").selectedIndex==0 ? true : false;
  var bSkipFirstRow = !findObject("sortFirstRow").checked;
  var bMoveRowAttrs = findObject("moveRowAttrs").checked;
  var rowIter = theObj.childNodes;
  var rowCount = rowIter.length;
  var rowArray;
  var colIter, rowHTML;
  var textString, startCount, currRow;
  var skippedRows;
  var sectionsIter, sectionsCount, i;
  var i;

  if (rowCount < 2)
    return;

  for (i=0; i<rowCount; i++) {
    if (rowIter.item(i).tagName != "CAPTION" &&
        rowIter.item(i).tagName != "COL" &&
        rowIter.item(i).tagName != "COLGROUP" &&
        rowIter.item(i).tagName != "THEAD" &&
        rowIter.item(i).tagName != "TFOOT")
      break;
  }
  skippedRows = i;

  // now sort the rest of the children
  if (bSkipFirstRow)
    skippedRows++;

  rowCount -= skippedRows;

  //Create a two-dimensional array containing rowCount rows and 3 columns.
  //The first column contains the HTML text for the row,the second
  //column contains the contents of column number sortCol for that row,
  //and the third column contains the contents of column number subsortColumn
  //for that row. 
  rowArray = new Array();
  for (i=0;i<rowCount;i++) {
    // Copy row text into rowArray
    rowArray[i] = new Array();
    rowHTML = rowIter.item(i+skippedRows);  // WAS (bSkipFirstRow)?rowIter.item(i+1):rowIter.item(i);  
    rowArray[i][0] = (bMoveRowAttrs)?rowHTML.outerHTML:rowHTML.innerHTML;
    
    // Copy sort key into rowArray
    colIter = rowHTML.childNodes;
    textString=getTextNode(colIter.item(sortCol));

    rowArray[i][1] = bAlphaSort ?
    gobbleWhiteSpace(textString):parseNumber(gobbleWhiteSpace(textString));
	  
	  //copy subsort key into rowArray, if applicable
    if (subsortCol >= 0){
      textString=getTextNode(colIter.item(subsortCol));
      rowArray[i][2]= bAlphaSubsort ?
      gobbleWhiteSpace(textString):parseNumber(gobbleWhiteSpace(textString));
    }        
  }

  // Sort the rowArray, based on sort key
  rowArray.sort(compareCallback);

  // Copy the contents of the sorted rowArray back into the HTML document
  for (i = 0; i < rowCount; i++) {
    currRow = rowIter.item(i+skippedRows);
    if (bMoveRowAttrs){
	    currRow.outerHTML=rowArray[i][0];
	  }else{
      currRow.innerHTML=rowArray[i][0];
    }
  }
}

function sortTable(){
  var dom = dw.getDocumentDOM();
  var sortCol, subsortCol;
  var textString, bSkipFirstRow, bMoveRowAttrs;
  var sectionsIter, sectionsCount, i;
  var rowCount = 0;

  MM.setBusyCursor();
	
  // Get the selected table
  var tableObj = findTable();

  var bSortHeadRows = findObject("sortHeadRows").checked;
  var bSortFootRows = findObject("sortFootRows").checked;
  var childIter = tableObj.childNodes;
  var childCount = childIter.length;

  // we can't use getElementsByTagName() to find the head/foot/body sections
  // since that will also find those tags in nested tables, so need to
  // go through each child tag and if any is thead, tfoot or tbody,
  // sort those sections separately. Then if we have more than 1 tr
  // children, sort those

  for (i=0; i<childCount; i++) {
    if (childIter.item(i).tagName == "CAPTION" ||
        childIter.item(i).tagName == "COL" ||
        childIter.item(i).tagName == "COLGROUP")
      continue;
    if (childIter.item(i).tagName == "THEAD" && bSortHeadRows ||
        childIter.item(i).tagName == "TFOOT" && bSortFootRows ||
        childIter.item(i).tagName == "TBODY")
      sortRows(childIter.item(i));
    if (childIter.item(i).tagName == "TR")
      rowCount++;
  }

	if (rowCount > 1)
		sortRows(tableObj);

  //plug sort information into global HAVE_SORTED_BY variable
  HAVE_SORTED_BY[0]=findObject("sortCol").selectedIndex;
  HAVE_SORTED_BY[1]=findObject("subsortCol").selectedIndex-1;
  HAVE_SORTED_BY[2]=findObject("sortType").selectedIndex;
  HAVE_SORTED_BY[3]=findObject("subsortType").selectedIndex;
  HAVE_SORTED_BY[4]=findObject("sortOrder").selectedIndex;
  HAVE_SORTED_BY[5]=findObject("subsortOrder").selectedIndex;
  HAVE_SORTED_BY[6]=findObject("sortFirstRow").checked;
  HAVE_SORTED_BY[7]=findObject("sortHeadRows").checked;
  HAVE_SORTED_BY[8]=findObject("sortFootRows").checked;
	
  //restore original selection
  selArr = dom.nodeToOffsets(tableObj);
  dom.setSelection(selArr[0],selArr[1]);

  MM.clearBusyCursor();
}

function compareCallback(a,b){
   var retVal=0;
   var result=0;
   //determine whether to switch a and b based on a and b values and specified sort order
   //if -1 is returned: order stays the same, if 1: values are switched, if 0: values are equal

  if (findObject("sortType").selectedIndex==0)
     result = LocaleSort.compareString(a[1],b[1]);
   else
     if (a[1]!=b[1])
       result = (a[1]<b[1])?-1:1; 

   if (result!=0)
     retVal=(result)*(findObject("sortOrder").selectedIndex==0?1:-1);
   else { 
     if (findObject("subsortType").selectedIndex==0)
       result = LocaleSort.compareString(a[2],b[2])  
     else {
       if (a[2]!=b[2])
		 result = (a[2]<b[2])?-1:1;
	 }
     if (result!=0)
	   retVal=(result )*(findObject("subsortOrder").selectedIndex==0?1:-1);
   }

   return retVal;
}

function countColumns(tableObj) {
	var childIter = tableObj.childNodes;
	var numChildren = childIter.length;

	for (i=0; i<numChildren; i++) {
		if (childIter.item(i).tagName == "CAPTION" ||
			childIter.item(i).tagName == "COL" ||
			childIter.item(i).tagName == "COLGROUP") {
			continue;
		}
		else if (childIter.item(i).tagName == "TBODY" ||
				 childIter.item(i).tagName == "THEAD" ||
				 childIter.item(i).tagName == "TFOOT") {
			return childIter.item(i).childNodes.item(0).childNodes.length;
 		}
		else if (childIter.item(i).tagName == "TR") {
			return childIter.item(i).childNodes.length;
		}
	}
	return 0;
}


function initializeUI(){
   var colCount;
   var tableObj = findTable();
   var errMsg = "";
   var i;

   if (hasSpans(tableObj)){ //if table has rowspans or colspans
     errMsg = MSG_SpansArePresent;
   } else if (isUltraDev() && hasServerBehaviorApplied(tableObj,true)) {
     errMsg = MM.MSG_SomeServerBehaviorsNotAllowed;
   } else if (isInvalidTable(tableObj)){ //if table is invalid
     errMsg = MSG_IsInvalidTable;
   }

    if (errMsg) {
      findObject("ErrMsgLayer").innerHTML="<p>&nbsp;</p>" + errMsg;
      findObject("formLayer").visibility = "hidden";
      findObject("ErrMsgLayer").visibility="visible";
    } else { //if everything is okay
      //dynamically update all form elements
      //dynamically update sort order and type
      with (findObject("sortType")){
        options[0]= new Option(MENU_TypeAlphabetical);
        options[1]= new Option(MENU_TypeNumerical);
      }
      with (findObject("subsortType")){
        options[0]= new Option(MENU_TypeAlphabetical);
        options[1]= new Option(MENU_TypeNumerical);
      }
      with (findObject("sortOrder")){
        options[0]= new Option(MENU_OrderAscending);
        options[1]= new Option(MENU_OrderDescending);
      }
      with (findObject("subsortOrder")){
        options[0]= new Option(MENU_OrderAscending);
        options[1]= new Option(MENU_OrderDescending);
      }
      //dynamically update sortCol and subsortCol menus
      colCount= countColumns(tableObj);
      for (i=0;i<colCount;i++)
        findObject("sortCol").options[i]=new Option(MENU_Column + " " + (i+1)); 
      findObject("subsortCol").options[0]=new Option(" ");
      for (i=0;i<colCount;i++)
        findObject("subsortCol").options[i+1]=new Option(MENU_Column + " " + (i+1)); 
   }
}

function parseNumber(value){

  var retVal=value;
  var numLength = retVal.length;
  var k=0;

  //before sorting as numbers, remove % and $ symbols 
  if (retVal.charAt(0)=="$")
    retVal=retVal.slice(1);
  else if (retVal.charAt(numLength-1)=="%" || retVal.charAt(numLength-1)=="$")
    retVal=retVal.slice(0,-1);
  
  //before sorting as numbers, remove spaces and turn commas into decimal points
  while( retVal.charAt(k) ){ 
    if (retVal.charAt(k)==" ") {
      retVal=retVal.substring(0,k) + retVal.substring(k+1);
	  continue;
    }
    if (retVal.charAt(k)==",") {
       retVal=retVal.substring(0,k) + retVal.substring(k+1);
	   continue;
	}
    k++;
  }

  //following lines exist to work around Netscape crash caused by comparing
  //two values that are both NaN. Workaround: Non-numbers are treated as strings.
  if (parseFloat(retVal) == retVal)
    retVal = parseFloat(retVal);
	
  return retVal;
}


// if tfoot/thead/tbody, step thru children (tr) and then look at *their* children(td/th)
// return true if any cell has rowspan or colspan
function hasSpans(theObj){
   var childIter = theObj.childNodes;
   var iterLength=childIter.length;
   var i;

   for (i=0;i<iterLength;i++) {
      if (childIter.item(i).tagName == "THEAD" ||
          childIter.item(i).tagName == "TFOOT" ||
          childIter.item(i).tagName == "TBODY" ||
          childIter.item(i).tagName == "TR") {
          if (hasSpans(childIter.item(i))) {
		     return true;
		  }
      }

      else if ((childIter.item(i).tagName == "TD" || childIter.item(i).tagName == "TH") &&
          (childIter.item(i).getAttribute("ROWSPAN") || childIter.item(i).getAttribute("COLSPAN"))) {
         return true;
	  }
   }
   return false;
}

function hasCaption(theObj){
  if (theObj.childNodes.item(0).tagName && theObj.childNodes.item(0).tagName=="CAPTION")
    return true;
  return false;
}

function isInvalidTable(theObj){
  var retVal = false;
  var bHasHeadFootOrBody = false;
  var bHasTR = false;
  var childIter = theObj.childNodes;
  var numChildren = childIter.length;
  var cellsInFirstRow = -1;
  var i;

  for (i=0; i<numChildren; i++) {
    // if caption, thead, or tfoot, skip
    if (childIter.item(i).tagName == "CAPTION" ||
	    childIter.item(i).tagName == "COL" ||
	    childIter.item(i).tagName == "COLGROUP")
	  continue;

	else if (childIter.item(i).tagName == "THEAD" ||
	         childIter.item(i).tagName == "TFOOT") {
	  bHasHeadFootOrBody = true;
	  continue;
	}

    // if tbody, check its rows (as if it was a table)
    else if (childIter.item(i).tagName == "TBODY") {
	  bHasHeadFootOrBody = true;
      if (isInvalidTable(childIter.item(i))) {
        retVal=true;
        break;
      }
	}

    // if not tr, or no children, this is bad
    else if (childIter.item(i).tagName != "TR" ||
             childIter.item(i).childNodes.length==0) {
      retVal=true;
      break;
	}
    else {
      // now we know it is a tr, so check number of cells
      //note that we use the childNodes to check the children number
      //instead of getElementsByTagName("TD").length, because the latter
      //would give deceiving results in the case of nested tables
      bHasTR = true;
      if (cellsInFirstRow==-1) {
        cellsInFirstRow=childIter.item(i).childNodes.length;
      }
      else if (childIter.item(i).childNodes.length!=cellsInFirstRow) {
        retVal=true;
	    break;
      }
    }
  }
  
  // can't have TR tags if have a thead, tfoot, or tbody
  if (bHasTR && bHasHeadFootOrBody)
    retVal = true;
    
  return retVal;
}

function getTextNode(theObj){
    var iter=theObj.childNodes;
	var counter=0;
    var child=iter.item(counter);
    var retVal="";

   while (child) {
      retVal+=getTextNode(child);
      child=iter.item(++counter);
   }
     if (theObj.nodeType == Node.TEXT_NODE)
     retVal+=theObj.data;
   
   return retVal;
}

function gobbleWhiteSpace(textstring){
  var lastChar,counter=0;
  var whiteSpaceChars = " \n\r\f\t";

  //gobble whitespace from beginning of string
  while (  textstring && whiteSpaceChars.indexOf( textstring.charAt(0) ) !=  -1  ){
    textstring = textstring.substring(1);
  }
	
  //gobble whitespace from end of string
  lastChar = textstring.length-1;
  while (  textstring && whiteSpaceChars.indexOf( textstring.charAt(lastChar) ) != -1  ){
     textstring = textstring.substring(0,lastChar--);
  }
        
  return textstring;  
}	

//**************** GENERIC FUNCTIONS ****************

function findObject(objName,  parentObj) {
  var i,tempObj="",found=false,curObj = "";
  var NS = (navigator.appName.indexOf("Netscape") != -1);
  if (!NS && document.all) curObj = document.all[objName]; //IE4
  else {
    parentObj = (parentObj != null)? parentObj.document : document;
    if (parentObj[objName] != null) curObj = parentObj[objName]; //at top level
    else { //if in form
      if (parentObj.forms) for (i=0; i<parentObj.forms.length; i++) {  //search level for form object
        if (parentObj.forms[i][objName]) {
          curObj = parentObj.forms[i][objName];
          found = true; break;
      } }
      if (!found && NS && parentObj.layers && parentObj.layers.length > 0) {
        parentObj = parentObj.layers;
        for (i=0; i<parentObj.length; i++) { //else search for child layers
          tempObj = findObject(objName,parentObj[i]); //recurse
          if (tempObj) { curObj = tempObj; break;} //if found, done
  } } } }
  return curObj;
}



