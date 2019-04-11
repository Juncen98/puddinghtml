// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//form field names (all text fields):
//Href
//ID
//Title
//Rel
//Rev

// *********** GLOBAL VARS *****************************

var helpDoc = MM.HELP_inspLink;

var TEXT_HREF;
var TEXT_TITLE;
var TEXT_ID;
var TEXT_REL;
var TEXT_REV;

// ******************** API ****************************
function canInspectSelection(){
  return true;
}

function inspectSelection(){
  TEXT_HREF = findObject("Href");
  TEXT_TITLE = findObject("Title");
  TEXT_ID = findObject("ID2");
  TEXT_REL = findObject("Rel");
  TEXT_REV = findObject("Rev");
  
  var dom = dw.getDocumentDOM();
  var linkObj = dom.getSelectedNode();

  if (!linkObj || !linkObj.getAttribute) return;

  if (linkObj.getAttribute("href"))
    TEXT_HREF.value = linkObj.getAttribute("href");
  else
    TEXT_HREF.value = "";	
  if (linkObj.getAttribute("id"))
    TEXT_ID.value=linkObj.getAttribute("id");
  else
    TEXT_ID.value = "";	
  if (linkObj.getAttribute("title"))  
    TEXT_TITLE.value=linkObj.getAttribute("title");
  else
    TEXT_TITLE.value="";	
  if (linkObj.getAttribute("rel"))
    TEXT_REL.value=linkObj.getAttribute("rel");
  else
    TEXT_REL.value = "";	
  if (linkObj.getAttribute("rev"))
    TEXT_REV.value=linkObj.getAttribute("rev");
  else
    TEXT_REV.value ="";	
  
  showHideTranslated();
}



// ******************** LOCAL FUNCTIONS ****************************

function setLinkTag(){
  var dom = dw.getDocumentDOM();
  var linkObj = dom.getSelectedNode();

  var relValue = TEXT_REL.value;
  var bRelEqualsStylesheet = relValue &&
                             relValue.toLowerCase().indexOf("stylesheet")!=-1;
  if (TEXT_HREF.value)
    linkObj.setAttribute("href",TEXT_HREF.value);
  else
    linkObj.removeAttribute("href");
  if (TEXT_ID.value)
    linkObj.setAttribute("id",TEXT_ID.value);
  else
    linkObj.removeAttribute("id");
  if (TEXT_TITLE.value)
    linkObj.setAttribute("title",TEXT_TITLE.value);
  else
    linkObj.removeAttribute("title");
  if (TEXT_REL.value)
    linkObj.setAttribute("rel",TEXT_REL.value);
  else
    linkObj.removeAttribute("rel");
  if (TEXT_REV.value)
    linkObj.setAttribute("rev",TEXT_REV.value);
  else
    linkObj.removeAttribute("rev");
  setTypeAttr(bRelEqualsStylesheet);//set type attribute based on rel value	
}

function browseForFile(){
  var filePath = TEXT_HREF.value;
  var fileName=dwscripts.browseFileWithPath(filePath);
  if (fileName) 
    TEXT_HREF.value=fileName;
}

function setTypeAttr(bStyle){
  var dom = dw.getDocumentDOM();
  var linkObj = dom.getSelectedNode();
  var typeAttr = linkObj.getAttribute("type");
  if (bStyle) //set type to text/css if applicable
    linkObj.setAttribute("type","text/css");
  //otherwise, remove it	
  else if (typeAttr && typeAttr.toLowerCase() == "text/css")
    linkObj.removeAttribute("type");
}
