//Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

// *********** GLOBAL VARS *****************************

var helpDoc = MM.HELP_inspSsiCommon;

// ******************** API ****************************


function canInspectSelection(){
	var includeStr;
	var tempStr;
  var retVal = false;
  var dom = dw.getDocumentDOM();
	var theObj = dom.getSelectedNode();


	if (theObj && theObj.nodeType == Node.COMMENT_NODE){
		tempStr		= theObj.data;
		includeStr	= tempStr.toLowerCase().indexOf("#include");

		if (includeStr != -1){
			retVal = true;
		}else{
		  retVal = false;
		}
	}else{
		 retVal = false;
	}
}

function inspectSelection(){
  var dom = dw.getDocumentDOM();
	var theObj = dom.getSelectedNode();
  
	initializeUI();

 	if (theObj.nodeType != Node.COMMENT_NODE)
		return;

	var tempStr = theObj.data;
	var fileStr = tempStr.toLowerCase().indexOf("file");
	var virtualStr = tempStr.toLowerCase().indexOf("virtual");
	var quoteStr = tempStr.indexOf('"');
	var quoteStrLast = tempStr.lastIndexOf('"');
	var includeStr = tempStr.toLowerCase().indexOf("#include");
	var gOrignalURL = tempStr.substring(quoteStr+1,quoteStrLast);
	var gOrignalRadio = ssiType( tempStr.toLowerCase() );

 	var fileRadObj = findObject("radioFile");
	var virtualRadObj = findObject("radioVirtual");

	findObject("editField").value = gOrignalURL;

	if ( gOrignalRadio == "virtual" ){
		virtualRadObj.checked	= true;
		fileRadObj.checked		= false;
	}else{
		fileRadObj.checked		= true;
		virtualRadObj.checked	= false;
	}
}

// whichButton is 0 for no button clicked, 1 for the virtual button,
// 2 for the file button
function setComment(whichButton){
	var dom = dw.getDocumentDOM();
	var theObj = dom.getSelectedNode();

	if (theObj.nodeType != Node.COMMENT_NODE)
		return;

	var tempStr = theObj.data;
	var radioStr;
	
  var fileRadObj = findObject("radioFile");
	var virtualRadObj = findObject("radioVirtual");

	if (whichButton == 1){
		// virtual button was checked
		fileRadObj.checked = false;
		virtualRadObj.checked = true;

	}else if (whichButton == 2){
		// file button was checked
		virtualRadObj.checked = false;
		fileRadObj.checked = true;
	}

	var URL = findObject("editField").value;
		if (fileRadObj.checked){
			// verify that it's okay as a file-type URL
			radioStr = "file";
			if (URL.charAt(0) == '/' || URL.indexOf("../") != -1){
				var relativeURL = findObject("editField").value;
				var fileURL = virtualToFile(relativeURL);

				if ( fileURL == "" ){
					radioStr = "virtual";
					virtualRadObj.checked = true;
					fileRadObj.checked = false;
					return;
				}else{
					URL = fileURL;
					findObject("editField").value = fileURL;
				}
			}

			// file button was checked
			virtualRadObj.checked	= false;
			fileRadObj.checked		= true;
		}

		else{
			radioStr = "virtual";
			virtualRadObj.checked	= true;
			fileRadObj.checked		= false;
		}

		if ( unchanged( radioStr, URL ) )
			return;

  theObj.data =  "#include " + radioStr + "=" + '"' + URL + '" ';
}

function initializeUI(){
  if (navigator.platform.charAt(0)=="M"){
    document.layers["fileLayer"].top = 23;
    document.layers["fileLayer"].left = 254;
    document.layers["virLayer"].top = 23;
    document.layers["virLayer"].left = 196;
    document.layers["typeLayer"].top = 23;
  }
}

