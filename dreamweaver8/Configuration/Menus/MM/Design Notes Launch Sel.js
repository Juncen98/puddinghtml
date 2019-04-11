// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//Launches Design Notes iff selection is IMG, EMBED, OBJECT, APPLET, or INPUT/IMAGE

//******************* GLOBALS **********************

var CMD_TO_LAUNCH = "Design Notes.htm";

//***************** API  ******************

function canAcceptCommand() {
  var src = getSrcAttrib();
  return (src != null && src.length > 0);
}

//***************** LOCAL FUNCTIONS  ******************

function initializeUI() {
  var filePath="", src="", metafile, qMark, fObj;

  src = getSrcAttrib();
  qMark = src.lastIndexOf("?");
  if (qMark != -1) src = src.substring(0,qMark); //if url has ?, trim it off
  if (src) 
	{
		//if the docURL is not defined , default to src
		var docURL = src;
		if (dw.getDocumentDOM() != null)
		{
			docURL = dw.getDocumentDOM().URL;
		}
    fObj = new File(src,docURL);
    filePath = fObj.getAbsolutePath(); //resolve the local path of the selection
    if (filePath && fObj.exists()) {  
      metafile = (MMNotes.open(filePath));        //open, or create metafile
      if (metafile) {                            //if okay to open
        MMNotes.close(metafile);                  //close it
        MMNotes.FileInfo_filePath = filePath;     //store the filePath as a global
        dw.popupCommand(CMD_TO_LAUNCH); //launch the command
      } else {
        alert(MSG_MetaDisabled);
      }
    } else {
      alert(MSG_FileNotFound+filePath);
 } }
}

function getSrcAttrib() {
  var i, offsets, selNode, tagName, src="", node;
  var dom  = dw.getDocumentDOM();
  
  selNode = dom.getSelectedNode();
  if (selNode.nodeType == Node.ELEMENT_NODE) {
    tagName = selNode.tagName;
    if (tagName == "IMG" || tagName == "EMBED") { //has SRC attribute
      src = selNode.getAttribute("SRC");

    } else if (tagName == "OBJECT") {             //search OBJECT params for src
      for (i=0; !src && i<selNode.childNodes.length; i++) {
        node = selNode.childNodes[i];
        if (node.nodeType == Node.ELEMENT_NODE) { 
          if (node.tagName == "PARAM" && (""+node.getAttribute("NAME")).toUpperCase() == "SRC") {
            src = node.getAttribute("VALUE");
          } else if (node.tagName == "EMBED") { //for ActiveX controls
            src = node.getAttribute("SRC");
          }
        }
      }

    } else if (tagName == "INPUT" && selNode.getAttribute("SRC")) { //works for input/image
      src = selNode.getAttribute("SRC");

    } else if (tagName == "APPLET" && selNode.getAttribute("CODE")) { //works for applets
      src = selNode.getAttribute("CODE");
  } } 
  if (!src) src="";
  if (1 < src.length && src.length <= 4 && src.charAt(0)==".") src = "";  //if .xyz, consider it to be empty

  return unescape(src);
}
