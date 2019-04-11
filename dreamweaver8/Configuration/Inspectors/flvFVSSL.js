//Copyright 2005 Macromedia, Inc. All rights reserved.

// *********** GLOBAL VARS *****************************
var HELP_DOC = MM.HELP_FlashVideo_PI;
var flvType = "vitalstream";

function displayHelp()
{
  dwscripts.displayDWHelp(HELP_DOC); 
}

// ******************** API ****************************
function canInspectSelection()
{
  var dom = dw.getDocumentDOM();
  var theObj = dom.getSelectedNode();
  
  if (!theObj) 
    return false;
  
  var children   = theObj.childNodes;
  var nChildren  = children.length;

  for( var i = 0; i < nChildren; i++ )
  {
    var currentChild = children.item(i);
    
    if (currentChild.nodeType == Node.ELEMENT_NODE && 
        currentChild.tagName=="PARAM" &&
        currentChild.getAttribute("name") == "FlashVars")
    {
        var flashVars = currentChild.getAttribute("value");
        return (flashVars.indexOf("&streamName") != -1 && 
                flashVars.indexOf("&serverName") != -1 && 
                flashVars.indexOf("vitalstreamfvsslite") != -1);
    }
  }

  return false;
}


function initializeUI() 
{
  // Store references to form elements in global variables.
  //initialize the common controls
  VIDEO_PLAYER_ID = dwscripts.findDOMObject("videoID");
  VIDEO_WIDTH = dwscripts.findDOMObject("videoWidth");
  VIDEO_HEIGHT = dwscripts.findDOMObject("videoHeight");  
  VIDEO_TOTAL = dwscripts.findDOMObject("videoTotalDim");  
  VIDEO_MAINTAIN_AR = new CheckBox("","videoMaintainAR");
  VIDEO_MAINTAIN_AR.initializeUI();

  //for win-adjust the position of bottom layer
  if (dwscripts.IS_WIN && findObject("topLayer")) 
  {
    document.layers["topLayer"].top = 1;
    VIDEO_PLAYER_ID.setAttribute("style","width:65px;height:16px");
    VIDEO_WIDTH.setAttribute("style","width:65px;height:16px");
    VIDEO_HEIGHT.setAttribute("style","width:65px;height:16px");
  }
  else if (dwscripts.IS_MAC && findObject("topLayer")) 
  {
     document.layers["topLayer"].top = 3;
  }
}

function inspectSelection()
{
  // Call initializeUI() here; it's how the global variables get
  // initialized. The onLoad event on the body tag is never triggered
  // in inspectors.
  initializeUI();

  //get the original code
  var dom = dw.getDocumentDOM();
  var theObj = dom.getSelectedNode();

  if (!dom || !theObj) 
    return;
    
  var objectCode = theObj.outerHTML;

  VIDEO_PLAYER_ID.value = getFlashAttrs(objectCode,"id");
  VIDEO_WIDTH.value = getFlashAttrs(objectCode,"width");
  VIDEO_HEIGHT.value = getFlashAttrs(objectCode,"height");
  //recompute the total based on the current width and height and skin offset
  VIDEO_TOTAL.innerHTML = computeVideoTotal(VIDEO_WIDTH.value,VIDEO_HEIGHT.value,"");
  //save the video aspect ratio
  VIDEO_MAINTAIN_AR.setCheckedState(true);
  MM.VIDEO_AR = VIDEO_WIDTH.value/VIDEO_HEIGHT.value;
}

//--------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//   update the attribute name
//
// ARGUMENTS:
//	 the name of the attribute which changed
//
// RETURNS:
//   void
//--------------------------------------------------------------------
function updateUI(attrName)
{
  if (attrName) 
  {
    switch (attrName)
    {
      //set the videoId
      case "videoID":
      {
        var videoPlayerID = VIDEO_PLAYER_ID.value;
        applyFlashAttr("id",videoPlayerID);
      }
      break;
      //set the videoWidth
      case "videoWidth":
      {
        //apply the videoWidth function
        applyVideoWidth(false);
      }
      break;			
      //set the videoHeight
      case "videoHeight":
      {
        //apply the videoHeight function
        applyVideoHeight(false);
      }
      break;			
    }		
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   editFVSSL
//
// DESCRIPTION:
//   launch the commond with FVSSL as the selection
//	 and the code
//
// ARGUMENTS:
//	 the name of the attribute which changed
//
// RETURNS:
//   void
//--------------------------------------------------------------------
function editFVSSL()
{
  //get the original code
  var dom = dw.getDocumentDOM();
  var theObj = dom.getSelectedNode();
  var objectCode = theObj.outerHTML;

  //set the variables to be the default for Flash Video
  MM.CalledFromFVSSLPI = true;
  dw.runCommand("FlashVideo");
  MM.CalledFromFVSSLPI = false;
}
