//Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

var helpDoc = MM.HELP_piDataGridAspNet; 

var theObj;
var behaviorObj;

var dgNameObj;
var showTitlesObj;
var showFootersObj;
var cellSpacingObj;
var cellPaddingObj;

var cellSpacing = 0;
var cellPadding = 0;

// ********************* API FUNCTIONS ***************************


function canInspectSelection() {

  theObj = buildSelectionNode("asp:datagrid")
  return (theObj != null);

}

function inspectSelection() {

  theObj = buildSelectionNode("asp:datagrid");

  //check theObj is not null
  //for cases when the pi is disabled state
  if (theObj == null)
  {
    return;
  }

  initializeUI();

  // Set the name
  dgNameObj.value = theObj.id;
  
  // Set the ShowTitles attrib
  var tempVar = theObj.getAttribute("ShowHeader");
  if(tempVar == null) 
  {
    showTitlesObj.checked = false;
  } else {
    if(tempVar.toLowerCase() == "true")
	  showTitlesObj.checked = true;
	else 
	  showTitlesObj.checked = false;
  }

  // Set the ShowFooters attrib
  tempVar = theObj.getAttribute("ShowFooter");
  if(tempVar == null) 
  {
    showFootersObj.checked = false;
  } else {
    if(tempVar.toLowerCase() == "true")
	  showFootersObj.checked = true;
	else 
	  showFootersObj.checked = false;
  }

  // Set the Cell Spacing attrib
  tempVar = theObj.getAttribute("CellSpacing");
  if(tempVar == null) 
    cellSpacingObj.value = "0";
  else {
    cellSpacingObj.value = tempVar;
	callSpacing = tempVar;
  }

  // Set the CellPadding attrib
  tempVar = theObj.getAttribute("CellPadding");
  if(tempVar == null) 
    cellPaddingObj.value = "0"
  else {
    cellPaddingObj.value = tempVar;
    cellPadding = tempVar;
  }

  var title = MM.LABEL_TitleDataGrid + " (" + theObj.id + ")";
  var behaviors = dw.sbi.getServerBehaviors();
	if (behaviors != null)
	{
		for (var i=0; i<behaviors.length; i++) {
			if (title == behaviors[i].title)
			behaviorObj = behaviors[i];
		}
	}

  var temp = "null";
  if (behaviorObj)
    temp = behaviorObj.title;
}


// **************************LOCAL FUNCTIONS **********************************

function initializeUI() {
  dgNameObj = findObject("DataGridName");
  showTitlesObj = findObject("ShowColumnTitles");
  showFootersObj = findObject("ShowColumnFooters");
  cellSpacingObj = findObject("CellSpacing");
  cellPaddingObj = findObject("CellPadding");
}

function updateTag(variable)
{
  theObj = buildSelectionNode("asp:datagrid");

  switch (variable) 
  {
    case 'gridName': 
    	if (!dwscripts.isValidVarName(dgNameObj.value, true))
	    {
		    alert(MM.MSG_InvalidID);
	    }
      else
      {
        theObj.id = dgNameObj.value;
      }
	  break;

	case 'titles': 
	  if(showTitlesObj.checked)
	    theObj.setAttribute("ShowHeader", "true");
	  else 
	    theObj.setAttribute("ShowHeader", "false");
	  break;

    case 'footers':
	  if(showFootersObj.checked)
	    theObj.setAttribute("ShowFooter", "true");
	  else 
	    theObj.setAttribute("ShowFooter", "false");
	  break;
	  
    case 'cellspacing':
      if(notAnInteger(cellSpacingObj.value)) {
        alert(MM.MSG_InvalidCellSpacing)
		cellSpacingObj.focus();
	  } else {
        theObj.setAttribute("CellSpacing", cellSpacingObj.value);
	  }
	  break;

    case 'cellpadding':
      if(notAnInteger(cellPaddingObj.value)) {
        alert(MM.MSG_InvalidCellPadding)
		cellPaddingObj.focus();
	  } else {
        theObj.setAttribute("CellPadding", cellPaddingObj.value);
	  }
	  break;
  }

  saveSelectionNode(theObj);
}


function notAnInteger(val){
  return (val != parseInt(val));
}


function ColumnsButtonClicked(){
  var temp = "null";
  if (behaviorObj)
    temp = behaviorObj.title;

  if(behaviorObj)
    dreamweaver.popupServerBehavior(behaviorObj);
}