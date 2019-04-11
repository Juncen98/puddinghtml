// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//form field names:
//fileUrl - text field where URL appears
//Delay - form field for delay number
//Action - radio buttons: radioURL is Go To another document
//                        radioThisDoc is stay at current document

// *********** GLOBAL VARS *****************************

var helpDoc = MM.HELP_inspRefresh;

var TEXT_DELAY;
var RADIO_THISDOC;
var RADIO_URL;
var TEXT_FILEURL;

// ******************** API ****************************
function canInspectSelection(){
  var dom = dw.getDocumentDOM();
  var metaObj = dom.getSelectedNode();
  if (!metaObj || !metaObj.getAttribute) return false;

  return (metaObj.tagName && metaObj.tagName=="META" &&
          metaObj.getTranslatedAttribute("http-equiv") && 
          metaObj.getTranslatedAttribute("http-equiv").toLowerCase()=="refresh");
   
}

function inspectSelection(){
  var dom = dw.getDocumentDOM();
  var refreshObj = dom.getSelectedNode();

  if (!refreshObj || !refreshObj.getAttribute) return;

  var tagContent = refreshObj.getAttribute("content"); 
  TEXT_DELAY = findObject("Delay");
  RADIO_URL = findObject("radioURL");
  RADIO_THISDOC = findObject("radioThisDoc");
  TEXT_FILEURL = findObject("fileURL");
  var contentArray;
  
  
  //fill in PI form fields
  //check to see if the refresh applies to the current document by doing
  // an integer check - URL will have a ; 
  if (tagContent == parseInt(tagContent)){ 
    //fill in the TEXT_DELAY value and check the correct radio button:
    TEXT_DELAY.value = tagContent; 
    RADIO_THISDOC.checked = true;
    RADIO_URL.checked = false;
  } else {               // else refresh is used to go to another document
     contentArray = getTokens(tagContent,";"); //create 2-member array
	 //fill in the TEXT_DELAY value
     TEXT_DELAY.value = (parseInt(contentArray[0])==contentArray[0])?contentArray[0]:""; 
	 //check correct radio button:
	 RADIO_URL.checked = true;
   RADIO_THISDOC.checked = false;
	 //strip "URL=" before placing into PI
     if (contentArray[1] && contentArray[1].indexOf("URL=")==0) 
	   contentArray[1] = contentArray[1].substring(4);  
	 //fill in correct URL value  
	 if (contentArray[1])
	   TEXT_FILEURL.value = contentArray[1];
	 else
	   TEXT_FILEURL.value="";  
  }

  showHideTranslated();
}


// ******************** LOCAL FUNCTIONS ****************************

function clearField(){
  TEXT_FILEURL.value="";
}

function setMetaTag(whichButton){
  var dom = dw.getDocumentDOM();
  var metaObj = dom.getSelectedNode();

  //if whichButton is 0, go to URL just checked. If 1, refresh this doc just checked
  //if 2, this function called from a form field other than a checkbox
  var fileName="",refreshContent="";
  var refreshDelay = (parseInt(TEXT_DELAY.value) == TEXT_DELAY.value)?TEXT_DELAY.value:"";
  
  //if going to another doc
  if (whichButton == 0 || (whichButton == 2 && RADIO_URL.checked && !RADIO_THISDOC.checked)){
    fileName=(TEXT_FILEURL.value)?TEXT_FILEURL.value:"";
	  refreshContent = refreshDelay + ";URL=" + fileName;
	
    //set checkboxes correctly
	  RADIO_THISDOC.checked = false;
	  RADIO_URL.checked=true;
  }
  else { //refresh current doc
    refreshContent = refreshDelay;
  	//set checkboxes correctly
	  RADIO_URL.checked = false;
	  RADIO_THISDOC.checked = true;
  }
  
  metaObj.setAttribute("content",refreshContent);
  
}


function browseForFile()
{
  var filePath = TEXT_FILEURL.value;
	var File = dwscripts.browseFileWithPath(filePath);  //returns a local filename
  if (File)
    TEXT_FILEURL.value = File;
}

