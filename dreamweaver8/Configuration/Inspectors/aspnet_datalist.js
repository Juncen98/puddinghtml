//Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

var helpDoc = MM.HELP_piDataListAspNet; 

var theObj;
var behaviorObj;

var dlNameObj;
var showTitleObj;
var showFooterObj;

// ********************* API FUNCTIONS ***************************


function canInspectSelection() {

  theObj = buildSelectionNode("asp:datalist");
  return (theObj != null);
  
}

function inspectSelection() {
  
  theObj = buildSelectionNode("asp:datalist");

  //check theObj is not null
  if (theObj == null)
  {
    return;
  }

  initializeUI();

  // Set the name
  dlNameObj.value = theObj.id;
  
  // Set the ShowTitle attrib
  var tempVar = theObj.getAttribute("ShowHeader");
  if(tempVar == null) 
  {
    showTitleObj.checked = false;
  } else {
    if(tempVar.toLowerCase() == "true")
	  showTitleObj.checked = true;
	else 
	  showTitleObj.checked = false;
  }

  // Set the ShowFooter attrib
  tempVar = theObj.getAttribute("ShowFooter");
  if(tempVar == null) 
  {
    showFooterObj.checked = false;
  } else {
    if(tempVar.toLowerCase() == "true")
	  showFooterObj.checked = true;
	else 
	  showFooterObj.checked = false;
  }

  var title = MM.LABEL_TitleDataList + " (" + theObj.id + ")";
  var behaviors = dw.sbi.getServerBehaviors();
	if (behaviors != null)
	{
		for (var i=0; i<behaviors.length; i++) {
			if (title == behaviors[i].title)
			behaviorObj = behaviors[i];
		}
	}
}


// **************************LOCAL FUNCTIONS **********************************

function initializeUI() {
  dlNameObj = findObject("DataListName");
  showTitleObj = findObject("ShowColumnTitle");
  showFooterObj = findObject("ShowColumnFooter");
}

function updateTag(variable)
{
  theObj = buildSelectionNode("asp:datalist");

  switch (variable) {
    case 'listName': 
    	if (!dwscripts.isValidVarName(dlNameObj.value, true))
	    {
		    alert(MM.MSG_InvalidID);
	    }
      else
      {
        theObj.id = dlNameObj.value;
      }
	  break;

	case 'title': 
	  if(showTitleObj.checked)
	    theObj.setAttribute("ShowHeader", "true");
	  else 
	    theObj.setAttribute("ShowHeader", "false");
	  break;

    case 'footer':
	  if(showFooterObj.checked)
	    theObj.setAttribute("ShowFooter", "true");
	  else 
	    theObj.setAttribute("ShowFooter", "false");
	  break;
  }

  saveSelectionNode(theObj);
}


function notAnInteger(val){
  return (val != parseInt(val));
}


function ColumnsButtonClicked(){
  if(behaviorObj)
    dreamweaver.popupServerBehavior(behaviorObj);
}