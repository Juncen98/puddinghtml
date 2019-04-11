// Copyright 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//*************** GLOBAL VARS  *****************

var helpDoc = MM.HELP_behDragLayer;

function initGlobals() {
  //Initial Form Values
  GlayerMenu = 0;
  GconstrainMenu = 0;
  GconstrainUp = "";
  GconstrainDown = "";
  GconstrainLeft = "";
  GconstrainRight = "";
  GtargetLeft = "";
  GtargetTop = "";
  GtargetTolerance = "";

  GhandleMenu = 0;
  GhandleLeft = "";
  GhandleTop = "";
  GhandleWidth = "";
  GhandleHeight = "";
  GbringToFront = true;
  GdropBackMenu = 0;
  GdragJavascript = "";
  GdropJavascript = "";
  GcallJsWhenSnapped = true;
}

var T;
var GlayerMenu;
var GconstrainMenu;
var GconstrainUp;
var GconstrainDown;
var GconstrainLeft;
var GconstrainRight;
var GtargetLeft;
var GtargetTop;
var GtargetTolerance;
var GhandleMenu;
var GhandleLeft;
var GhandleTop;
var GhandleWidth;
var GhandleHeight;
var GbringToFront;
var GdropBackMenu;
var GdragJavascript;
var GdropJavascript;
var GcallJsWhenSnapped;

//******************* BEHAVIOR FUNCTION **********************

//Lets you drag a layer, snap it to a location, and call a JavaScript.
//Accepts the following args:
//  objName  - simple object name, or layer object ref for Netscape (ex: document.layers['foo'])
//  x        - ignored (there for backward compatibility)
//  hL, hT   - integers, define top-left corner of drag handle area within layer
//  hW, hH   - positive integers, define width and height of drag handle area
//             For example, to define a title-bar drag handle, use hL=0, hT=0, hW=100, hH=30
//  toFront  - boolean, if true layer becomes topmost layer while dragged
//  dropBack - boolean, (used only if toFront is true)
//             if true, the layer will return to its original zIndex position when dropped
//             if false, the layer will remain on top when dropped
//  cU       - positive integer, distance layer can be dragged up from its original position
//  cD       - positive integer, distance layer can be dragged down from its original position
//  cL       - positive integer, distance layer can be dragged left from its original position
//  cR       - positive integer, distance layer can be dragged right from its original position
//  targL    - integer, absolute X location (from top/left corner of window) to snap to
//  targT    - integer, absolute Y location (from top/left corner of window) to snap to
//  tol      - tolerance, pixel-distance from target layer can be and still snap to target
//  dropJS   - JavaScript to execute when snapped (can be blank, but use empty quotes "")
//  et       - boolean "every time". if true, calls dropJS every time
//                                   if false, only calls dropJS if snapped to target
//  dragJS   - JavaScript to execute while dragging (can be blank, but use empty quotes "")
//
//This function requires layers and only works for 4.0 and later browsers. It is a composite of 4
//functions, handling initialization, and events mousedown, mousemove, and mouseup.
//Fails gracefully on older browsers by ensuring the .layers or .all arrays exist.

function MM_dragLayer(objName,x,hL,hT,hW,hH,toFront,dropBack,cU,cD,cL,cR,targL,targT,tol,dropJS,et,dragJS) { //v8.0
  //Copyright 2005 Macromedia, Inc. All rights reserved.
  var i,j,aLayer,retVal,curDrag=null,curLeft,curTop,IE=document.all,NS4=document.layers;
  var NS6=(!IE&&document.getElementById), NS=(NS4||NS6); if (!IE && !NS) return false;
  retVal = true; if(IE && event) event.returnValue = true;
  if (MM_dragLayer.arguments.length > 1) {
    curDrag = MM_findObj(objName); if (!curDrag) return false;
    if (!document.allLayers) { document.allLayers = new Array();
      with (document) if (NS4) { for (i=0; i<layers.length; i++) allLayers[i]=layers[i];
        for (i=0; i<allLayers.length; i++) if (allLayers[i].document && allLayers[i].document.layers)
          with (allLayers[i].document) for (j=0; j<layers.length; j++) allLayers[allLayers.length]=layers[j];
      } else {
        if (NS6) { var spns = getElementsByTagName("span"); var all = getElementsByTagName("div"); 
          for (i=0;i<spns.length;i++) if (MM_getProp(spns[i],'P')) allLayers[allLayers.length]=spns[i];}
        for (i=0;i<all.length;i++) {
	  if (NS4){if (all[i].style&&all[i].style.position) allLayers[allLayers.length]=all[i];}
          else if (MM_getProp(all[i],'P')) allLayers[allLayers.length]=all[i]; 
        }
    } }
    curDrag.MM_dragOk=true; curDrag.MM_targL=targL; curDrag.MM_targT=targT;
    curDrag.MM_tol=Math.pow(tol,2); curDrag.MM_hLeft=hL; curDrag.MM_hTop=hT;
    curDrag.MM_hWidth=hW; curDrag.MM_hHeight=hH; curDrag.MM_toFront=toFront;
    curDrag.MM_dropBack=dropBack; curDrag.MM_dropJS=dropJS;
    curDrag.MM_everyTime=et; curDrag.MM_dragJS=dragJS;
  
    curDrag.MM_oldZ = (NS4)?curDrag.zIndex:MM_getProp(curDrag,'Z');
    curLeft= (NS4)?curDrag.left:MM_getProp(curDrag,'L');
    if (String(curLeft)=="NaN") curLeft=0; curDrag.MM_startL = curLeft;
    curTop = (NS4)?curDrag.top:MM_getProp(curDrag,'T');
    if (String(curTop)=="NaN") curTop=0; curDrag.MM_startT = curTop;
    curDrag.MM_bL=(cL<0)?null:curLeft-cL; curDrag.MM_bT=(cU<0)?null:curTop-cU;
    curDrag.MM_bR=(cR<0)?null:curLeft+cR; curDrag.MM_bB=(cD<0)?null:curTop+cD;
    curDrag.MM_LEFTRIGHT=0; curDrag.MM_UPDOWN=0; curDrag.MM_SNAPPED=false; //use in your JS!
    document.onmousedown = MM_dragLayer; document.onmouseup = MM_dragLayer;
    if (NS) document.captureEvents(Event.MOUSEDOWN|Event.MOUSEUP);
  } else {
    var theEvent = ((NS)?objName.type:event.type);
    if (theEvent == 'mousedown') {
      var mouseX = (NS)?objName.pageX : event.clientX + document.body.scrollLeft;
      var mouseY = (NS)?objName.pageY : event.clientY + document.body.scrollTop;
      var maxDragZ=null; document.MM_maxZ = 0;
      for (i=0; i<document.allLayers.length; i++) { aLayer = document.allLayers[i];
        var aLayerZ = (NS4)?aLayer.zIndex:MM_getProp(aLayer,'Z');
        if (aLayerZ > document.MM_maxZ) document.MM_maxZ = aLayerZ;
        var isVisible = ((NS4)?aLayer.visibility:MM_getProp(aLayer,'V')).indexOf('hid') == -1;
        if (aLayer.MM_dragOk != null && isVisible) with (aLayer) {
          var parentL=0; var parentT=0;
          if (NS6) { parentLayer = aLayer.parentNode;
            while (parentLayer != null && parentLayer != document && MM_getProp(parentLayer,'P')) {
              parentL += parseInt(MM_getProp(parentLayer,'L')); parentT += parseInt(MM_getProp(parentLayer,'T'));
              parentLayer = parentLayer.parentNode;
              if (parentLayer==document) parentLayer = null;
          } } else if (IE) { parentLayer = aLayer.parentElement;       
            while (parentLayer != null && MM_getProp(parentLayer,'P')) {
              parentL += MM_getProp(parentLayer,'L'); parentT += MM_getProp(parentLayer,'T');
              parentLayer = parentLayer.parentElement; } }
          var tmpX=mouseX-((NS4)?pageX:(MM_getProp(aLayer,'L'))+parentL+MM_hLeft);
          var tmpY=mouseY-((NS4)?pageY:(MM_getProp(aLayer,'T'))+parentT+MM_hTop);
          if (String(tmpX)=="NaN") tmpX=0; if (String(tmpY)=="NaN") tmpY=0;
          var tmpW = MM_hWidth;  if (tmpW <= 0) tmpW += (NS4)?clip.width:MM_getProp(aLayer,'W');
          var tmpH = MM_hHeight; if (tmpH <= 0) tmpH += (NS4)?clip.height:MM_getProp(aLayer,'H');
          if ((0 <= tmpX && tmpX < tmpW && 0 <= tmpY && tmpY < tmpH) && (maxDragZ == null
              || maxDragZ <= aLayerZ)) { curDrag = aLayer; maxDragZ = aLayerZ; } } }
      if (curDrag) {
        document.onmousemove = MM_dragLayer; if (NS4) document.captureEvents(Event.MOUSEMOVE);
        curLeft = (NS4)?curDrag.left:MM_getProp(curDrag,'L');
        curTop = (NS4)?curDrag.top:MM_getProp(curDrag,'T');
        if (String(curLeft)=="NaN") curLeft=0; if (String(curTop)=="NaN") curTop=0;
        MM_oldX = mouseX - curLeft; MM_oldY = mouseY - curTop;
        document.MM_curDrag = curDrag;  curDrag.MM_SNAPPED=false;
        if(curDrag.MM_toFront) {
          var newZ = parseInt(document.MM_maxZ)+1;
          eval('curDrag.'+((NS4)?'':'style.')+'zIndex=newZ');
          if (!curDrag.MM_dropBack) document.MM_maxZ++; }
        retVal = false; if(!NS4&&!NS6) event.returnValue = false;
    } } else if (theEvent == 'mousemove') {
      if (document.MM_curDrag) with (document.MM_curDrag) {
        var mouseX = (NS)?objName.pageX : event.clientX + document.body.scrollLeft;
        var mouseY = (NS)?objName.pageY : event.clientY + document.body.scrollTop;
        var newLeft = mouseX-MM_oldX; var newTop  = mouseY-MM_oldY;
        if (MM_bL!=null) newLeft = Math.max(newLeft,MM_bL);
        if (MM_bR!=null) newLeft = Math.min(newLeft,MM_bR);
        if (MM_bT!=null) newTop  = Math.max(newTop ,MM_bT);
        if (MM_bB!=null) newTop  = Math.min(newTop ,MM_bB);
        MM_LEFTRIGHT = newLeft-MM_startL; MM_UPDOWN = newTop-MM_startT;
        if (NS4) {left = newLeft; top = newTop;}
        else if (NS6){style.left = newLeft + "px"; style.top = newTop + "px";}
        else {style.pixelLeft = newLeft; style.pixelTop = newTop;}
        if (MM_dragJS) eval(MM_dragJS);
        retVal = false; if(!NS) event.returnValue = false;
    } } else if (theEvent == 'mouseup') {
      document.onmousemove = null;
      if (NS) document.releaseEvents(Event.MOUSEMOVE);
      if (NS) document.captureEvents(Event.MOUSEDOWN); //for mac NS
      if (document.MM_curDrag) with (document.MM_curDrag) {
        if (typeof MM_targL =='number' && typeof MM_targT == 'number' &&
            (Math.pow(MM_targL-((NS4)?left:MM_getProp(document.MM_curDrag,'L')),2)+
             Math.pow(MM_targT-((NS4)?top:MM_getProp(document.MM_curDrag,'T')),2))<=MM_tol) {
          if (NS4) {left = MM_targL; top = MM_targT;}
          else if (NS6) {style.left = MM_targL + "px"; style.top = MM_targT + "px";}
          else {style.pixelLeft = MM_targL; style.pixelTop = MM_targT;}
          MM_SNAPPED = true; MM_LEFTRIGHT = MM_startL-MM_targL; MM_UPDOWN = MM_startT-MM_targT; }
        if (MM_everyTime || MM_SNAPPED) eval(MM_dropJS);
        if(MM_dropBack) {if (NS4) zIndex = MM_oldZ; else style.zIndex = MM_oldZ;}
        retVal = false; if(!NS) event.returnValue = false; }
      document.MM_curDrag = null;
    }
    if (NS) document.routeEvent(objName);
  } return retVal;
}

MM.VERSION_MM_dragLayer = 8.0; //define latest version number for behavior inspector

//******************* API **********************

//Checks for the existence of layers.
//If none exist, returns false so this Action is grayed out; also return false if anything
//other than the body is selected.
//If the body *is* selected, return "onLoad" as the event that should be used for this behavior.
function canAcceptBehavior(theTag) {
  var selObj = dw.getBehaviorElement();
  if (!selObj && theTag)
    selObj = dw.getDocumentDOM().getSelectedNode();
  if (!selObj || selObj.tagName != "BODY")
     return false;
  var nameArray = dw.getObjectRefs("NS 4.0","document","LAYER");  //get layer names (includes CSS)
  if (nameArray.length > 0)
     return "onLoad";
  else
     return false;
}



//Returns a Javascript function to be inserted in HTML head with script tags.

function behaviorFunction(){
  return "MM_findObj,MM_scanStyles,MM_getProp,MM_dragLayer";
}



//Returns fn call to insert in HTML tag <TAG... onEvent='thisFn(arg)'>

function applyBehavior() {
  var objNS,hL,hT,hW,hH,toFront,dropBack,cU,cD,cL,cR,targL,targT,tol,dropJS,et,dragJS;

  var index, errMsg="", argList="";

  if (findObject("mainLayer").visibility != 'hidden') {
    getMain();
  } else {
    getOptions();
  }
  //get layer obj
  index = GlayerMenu;
  objNS = document.MM_NS_REFS[index]; //get layer name from list
  if (objNS.indexOf(REF_UNNAMED) == 0) errMsg += "\n"+MSG_UnnamedLayer;
  argList += "'"+getNameFromRef(objNS)+"','',";

  //get drag handle
  if (GhandleMenu == 0) {
    hL=0; hT=0; hW=0; hH=0;
  } else {
    hL = GhandleLeft;   if (!hL) hL = 0; //if empty, use zero
    hT = GhandleTop;    if (!hT) hT = 0;
    hW = GhandleWidth;  if (!hW) hW = 0;
    hH = GhandleHeight; if (!hH) hH = 0;
    if ((hL != ""+(parseInt(hL))) ||  //if not a number
        (hT != ""+(parseInt(hT))) ||
        (hW != ""+(parseInt(hW))) ||
        (hH != ""+(parseInt(hH)))) errMsg += "\n"+MSG_HandleNotInts;
  }
  argList += hL + "," + hT + "," + hW + "," + hH + ",";

  //get while-dragging setting
  toFront = GbringToFront;
  index = GdropBackMenu;
  dropBack = (index == 1);
  argList += toFront + "," + dropBack + ",";

  //get constraints
  if (GconstrainMenu == 0) {
    cU=-1; cD=-1; cL=-1; cR=-1;
  } else {
    cU = GconstrainUp;
    cD = GconstrainDown;
    cL = GconstrainLeft;
    cR = GconstrainRight;
    if ((cU && cU != ""+(parseInt(cU))) ||  //if not a number
        (cD && cD != ""+(parseInt(cD))) ||
        (cL && cL != ""+(parseInt(cL))) ||
        (cR && cR != ""+(parseInt(cR)))) errMsg += "\n"+MSG_ConstraintsNotInts;
    if ((cU == ""+(parseInt(cU)) && cU < 0) ||  //if number, but negative
        (cD == ""+(parseInt(cD)) && cD < 0) ||
        (cL == ""+(parseInt(cL)) && cL < 0) ||
        (cR == ""+(parseInt(cR)) && cR < 0)) errMsg += "\n"+MSG_ConstraintsNotPos;
  }
  if (!cU) cU = -1;
  if (!cD) cD = -1;
  if (!cL) cL = -1;
  if (!cR) cR = -1;
  argList += cU + "," + cD + "," + cL + "," + cR + ",";

  //get target location and tolerance
  targL = GtargetLeft;
  targT = GtargetTop;
  tol   = GtargetTolerance;
  if ((targL && targL != ""+(parseInt(targL))) ||   //if not empty, and not number
      (targT && targT != ""+(parseInt(targT))) ||
      (tol   && tol   != ""+(parseInt(tol)))) errMsg += "\n"+MSG_TargetNotInts;
  if (tol && tol == ""+(parseInt(tol)) && tol < 0) errMsg += "\n"+MSG_TolNotPositive;
  targL = (targL)?targL:false; //if its empty, use false
  targT = (targT)?targT:false;
  tol   = (tol  )?tol  :0; //if empty, use zero
  argList += targL + "," + targT + "," + tol + ",";

  //get javascript
  dropJS = escQuotes(GdropJavascript);
  et = !GcallJsWhenSnapped;
  dragJS = escQuotes(GdragJavascript);
  argList += "'" + dropJS + "'," + et + ",'" + dragJS + "'";

  if (errMsg) return errMsg
  else {
    updateBehaviorFns("MM_findObj","MM_getProp","MM_scanStyles","MM_dragLayer");
    return "MM_dragLayer("+argList+")";  //return fn call with args
  }
}



//Returns a dummy function call to inform Dreamweaver the type of certain behavior
//call arguments. This information is used by DW to fixup behavior args when the
//document is moved or changed.
//
//It is passed an actual function call string generated by applyBehavior(), which
//may have a variable list of arguments, and this should return a matching mask.
//
//The return values are:
//  URL     : argument could be a file path, which DW will update during Save As...
//  NS4.0ref: arg is an object ref that may be changed by Convert Tables to Layers
//  IE4.0ref: arg is an object ref that may be changed by Convert Tables to Layers
//  other...: argument is ignored

function identifyBehaviorArguments(fnCallStr) {
  var argArray, argList="";

  argArray = extractArgs(fnCallStr);
  if (argArray.length > 2) {
    argList += (argArray[1].indexOf(".")==-1)? "objName,other" : "NS4.0ref,IE4.0ref";
    for (i=0; i<argArray.length-3; i++) argList += ",other";
  }
  return argList;
}



//Given the original function call, this parses out the args and updates
//the UI. All values are written to a set of globals, then some are written
//to the displayed form.

function inspectBehavior(fnStr){
  var argArray,found,numLayers,i;
  var objNS,objIE,hL,hT,hW,hH,toFront,dropBack,cU,cD,cL,cR,targL,targT,tol,dropJS;

  argArray = extractArgs(fnStr);//get new list of layer,vis pairs
  if (argArray.length > 16) { //function call + 16 args

    //set layer obj
    objNS=unescQuotes(argArray[1]);
    objIE=unescQuotes(argArray[2]);
    found = false;
    numLayers = document.MM_NS_REFS.length;
    for (i=0; i<numLayers; i++){  //check if layer is in menu
      if ((objNS && ((objNS == document.MM_NS_REFS[i]) || (objNS == getNameFromRef(document.MM_NS_REFS[i])))) ||
          (objIE && objIE == document.MM_IE_REFS[i]) ) { //if layer there
        GlayerMenu = i;
        found = true;
        break;
      }
    }
    if (!found) alert(errMsg(MSG_LayerNotFound,objNS));

    //set drag handle
    hL = argArray[3];
    hT = argArray[4];
    hW = argArray[5];
    hH = argArray[6];
    if (hL==0 && hT==0 && hW==0 && hH==0) {
      GhandleMenu = 0;
    } else {
      GhandleMenu   = 1;
      GhandleLeft   = (hL==0)?"":hL;
      GhandleTop    = (hT==0)?"":hT;
      GhandleWidth  = (hW==0)?"":hW;
      GhandleHeight = (hH==0)?"":hH;
    }

    //set while-dragging settings
    GbringToFront = (argArray[7]=='true')?true:false;
    GdropBackMenu = (argArray[8]=='true')?1:0;

    //set constraints
    cU = argArray[9];
    cD = argArray[10];
    cL = argArray[11];
    cR = argArray[12];
    if (cU == -1 && cD == -1 && cL == -1 && cD == -1) {
      GconstrainMenu = 0;
    } else {
      GconstrainMenu = 1;
      if (cU != -1) GconstrainUp    = cU;
      if (cD != -1) GconstrainDown  = cD;
      if (cL != -1) GconstrainLeft  = cL;
      if (cR != -1) GconstrainRight = cR;
    }

    //set target location and tolerance
    GtargetLeft = (argArray[13]=="false")?"":argArray[13];
    GtargetTop  = (argArray[14]=="false")?"":argArray[14];
    GtargetTolerance = (argArray[15]==0)?"0":argArray[15];

    //set javascript
    GdropJavascript = argArray[16];
    if (argArray.length > 17) //function call + 17 args
      GcallJsWhenSnapped = !eval(argArray[17]);
    if (argArray.length > 18) //function call + 18 args
      GdragJavascript = argArray[18];

    setMain();
  }
}



//***************** LOCAL FUNCTIONS  ******************


//Detects if the onmousedown event is selected, which makes it invalid to proceed.
//Searches for the layer surround the current selection. If match is found,
//displays and loads the main form with all the layer "nice names", and selects
//the current one. If anything fails, it displays the error layer.

function initializeUI(){
  initGlobals();
  var nsRefs,ieRefs,tags,niceNameSrcArray,nameArray,i,j,tagTokenArray,numLayers;

  document.MM_NS_REFS = new Array();
  document.MM_IE_REFS = new Array();
  document.MM_TAGS    = new Array();
  nsRefs = getObjectRefs("NS 4.0","document","LAYER"); //store parallel NS refs
  ieRefs = getObjectRefs("IE 4.0","document","LAYER"); //store parallel IE refs
  tags   = getObjectTags("document","LAYER"); //store parallel tags

  //remove ILAYERs if any while copying all refs into global arrays
  j = 0;
  for (i=0; i<tags.length; i++) {
    tagTokenArray = getTokens(tags[i],"< ");
    if (tagTokenArray[0].toUpperCase()!="ILAYER") { //if layer's not an ILAYER
      document.MM_NS_REFS[j] = nsRefs[i];
      document.MM_IE_REFS[j] = ieRefs[i];
      document.MM_TAGS[j++]  = tags[i];
    }
  }

  //Search for unreferenceable objects. <DIV id="foo"> is IE only, <LAYER> is NS only.
  //if REF_CANNOT found, return empty string, and use IE refs for nice namelist.
  niceNameSrcArray = document.MM_NS_REFS;
  for (i=0; i<document.MM_NS_REFS.length; i++) {
    if (document.MM_IE_REFS[i].indexOf(REF_CANNOT) == 0) {
      document.MM_IE_REFS[i] = ""; //blank it out
    }
    if (document.MM_NS_REFS[i].indexOf(REF_CANNOT) == 0) {
      document.MM_NS_REFS[i] = ""; //blank it out
      niceNameSrcArray = document.MM_IE_REFS; //use the IE list
    }
  }
  nameArray = niceNames(niceNameSrcArray,MM.TYPE_Layer);  //get layer names (includes CSS)

  with (findObject("layerMenu")) {
    for (i=0; i<nameArray.length; i++) options[i]=new Option(nameArray[i]); //load menu
    selectedIndex = 0;
  }
  
  //Use appropriate images for Mac OS X.
  if (dw.isOSX()) {
    findObject("tabBgWin").src = "../../Shared/MM/Images/tabBgOSX500x160.gif";
    var tab0 = findObject("Tab0");
    var tab1 = findObject("Tab1");
    
    var oldMulti = RegExp.multiline;
    RegExp.multiline = true;
    var pat = /tabBg\.gif(.*)tabBgSel\.gif/;
    tab0.innerHTML = tab0.innerHTML.replace(pat, "tabBgOSX.gif$1tabBgSelOSX.gif");
	tab1.innerHTML = tab1.innerHTML.replace(pat, "tabBgOSX.gif$1tabBgSelOSX.gif");
	RegExp.multiline = oldMulti;
		
	// resize our bg image and window so that all our controls fit in
	var bgImage = findObject("tabBgWin");
	bgImage.width = 578;
	bgImage.height = 165;
	window.resizeToContents();
  } else if (dw.isXPThemed()) {	// use the right images for WinXP with themes
    findObject("tabBgWin").src = "../../Shared/MM/Images/tabBgWinXP500x160.gif";
    var tab0 = findObject("Tab0");
    var tab1 = findObject("Tab1");
    
    var oldMulti = RegExp.multiline;
    RegExp.multiline = true;
    var pat1 = /tabBg\.gif/;
    tab0.innerHTML = tab0.innerHTML.replace(pat1, "tabBgXP.gif");
	tab1.innerHTML = tab1.innerHTML.replace(pat1, "tabBgXP.gif");
    var pat2 = /tabBgSel\.gif/;
    tab0.innerHTML = tab0.innerHTML.replace(pat2, "tabBgSelXP.gif");
	tab1.innerHTML = tab1.innerHTML.replace(pat2, "tabBgSelXP.gif");
	RegExp.multiline = oldMulti;
  }
  
  //Initialize the TabControl.  (Pass in the prefix used for the tab layers)
  T = new TabControl('Tab');
  //Add tab pages.   (Pass the layer name, and the page object)
  T.addPage('mainLayer', new Pg1(LABEL_Basic));
  T.addPage('optionsLayer', new Pg2(LABEL_Advanced));
  //Initialize and display the tabs.  (Could pass the name of a page to start on)
  T.start();
}



//Scan the tag for the selected layer to get it's current left,top position
//Put these position values into the form

function getLayerPosition() {
  var index = findObject("layerMenu").selectedIndex;
  var layerObj = MM_findObj(getNameFromRef(document.MM_NS_REFS[index]), dreamweaver.getDocumentDOM());
  if (layerObj) {
    findObject("targetLeft").value = layerObj.left;
    findObject("targetTop").value = layerObj.top;
    //add default tolerance if nothing there
    with (findObject("targetTolerance")) if (!value) value = 50;
  } else {
    alert(MSG_LayerHasNoPosn);
  }
}


function getMain() {
  GlayerMenu       = findObject("layerMenu").selectedIndex;
  GconstrainMenu   = findObject("constrainMenu").selectedIndex;
  GconstrainUp     = findObject("constrainUp").value;
  GconstrainDown   = findObject("constrainDown").value;
  GconstrainLeft   = findObject("constrainLeft").value;
  GconstrainRight  = findObject("constrainRight").value;
  GtargetLeft      = findObject("targetLeft").value;
  GtargetTop       = findObject("targetTop").value;
  GtargetTolerance = findObject("targetTolerance").value;
}
function setMain() {
 findObject("layerMenu").selectedIndex     = GlayerMenu;
 findObject("constrainMenu").selectedIndex = GconstrainMenu;
 T.update("constrainMenu"); //call update class to show or hide constrain fields
 findObject("constrainUp").value           = GconstrainUp;
 findObject("constrainDown").value         = GconstrainDown;
 findObject("constrainLeft").value         = GconstrainLeft;
 findObject("constrainRight").value        = GconstrainRight;
 findObject("targetLeft").value            = GtargetLeft;
 findObject("targetTop").value             = GtargetTop;
 findObject("targetTolerance").value       = GtargetTolerance;
}
function getOptions() {
  GhandleMenu      = findObject("handleMenu").selectedIndex;
  GhandleLeft      = findObject("handleLeft").value;
  GhandleTop       = findObject("handleTop").value;
  GhandleWidth     = findObject("handleWidth").value;
  GhandleHeight    = findObject("handleHeight").value;
  GbringToFront    = findObject("bringToFront").checked;
  GdropBackMenu    = findObject("dropBackMenu").selectedIndex;
  GdragJavascript  = findObject("dragJavascript").value;
  GdropJavascript  = findObject("dropJavascript").value;
  GcallJsWhenSnapped = findObject("callJsWhenSnapped").checked;
}
function setOptions() {
 findObject("handleMenu").selectedIndex   = GhandleMenu;
 findObject("handleLeft").value           = GhandleLeft;
 findObject("handleTop").value            = GhandleTop;
 findObject("handleWidth").value          = GhandleWidth;
 findObject("handleHeight").value         = GhandleHeight;
 findObject("bringToFront").checked       = GbringToFront;
 findObject("dropBackMenu").selectedIndex = GdropBackMenu;
 findObject("dragJavascript").value       = GdragJavascript;
 findObject("dropJavascript").value       = GdropJavascript;
 findObject("callJsWhenSnapped").checked  = GcallJsWhenSnapped;
}

//*************** Pg1 Class ********************

function Pg1(theTabLabel) {
  this.tabLabel = theTabLabel;
  this.constrainSetObj = findObject("constrainSet");
  this.constrainSetHTML = stripSpaces(this.constrainSetObj.innerHTML);
  this.myLayer = findObject("mainLayer");  //used for rendering bug workaround
}
Pg1.prototype.getTabLabel = Pg1_getTabLabel;
Pg1.prototype.canLoad = Pg1_canLoad;
Pg1.prototype.load = Pg1_load;
Pg1.prototype.update = Pg1_update;
Pg1.prototype.unload = Pg1_unload;
Pg1.prototype.lastUnload = Pg1_lastUnload;

function Pg1_getTabLabel() {
  return this.tabLabel;
}

//Called to check if a page can be loaded
//
function Pg1_canLoad() {
  with (this) {
    constrainSetObj.innerHTML = (GconstrainMenu)?constrainSetHTML:"";
  }
  return true;
}

//Called when the layer for this page is displayed.
// Use this call to initialize controls.
//
function Pg1_load() {
  setMain();
}

//Called when one of the page controls calls the tabControl update function.
// Use this call to respond to user input.
//
function Pg1_update(theItemName) {
  var theObj, temp, temp2;

  theObj = findObject(theItemName);
  with (this) {
    if (theItemName == "constrainMenu") {
      myLayer.visibility = "hidden";  //workaround: hide layer before changing
      constrainSetObj.innerHTML = (theObj.selectedIndex)?constrainSetHTML:"";
      myLayer.visibility = "visible";
  } }
}

//Called when another page is about to be shown, or finish() is called on
// the tabControl.  Use this call to perform any finishing tasks.
//
function Pg1_unload() {
  getMain();
  //setOptions();
  return true;
}

//Called when finish() is called on the tabControl.
// Use this call to perform any last minute page updates.
//
function Pg1_lastUnload() {
  //alert("lastUnload() called " + this.tabLabel);
  return true;
}


//********** Pg2 Class *************
function Pg2(theTabLabel) {
  this.tabLabel = theTabLabel;
  this.handleSetObj = findObject("handleSet");
  this.handleSetHTML = stripSpaces(this.handleSetObj.innerHTML);
  this.myLayer = findObject("optionsLayer");  //used for rendering bug workaround
}
Pg2.prototype.getTabLabel = Pg2_getTabLabel;
Pg2.prototype.canLoad = Pg2_canLoad;
Pg2.prototype.load = Pg2_load;
Pg2.prototype.update = Pg2_update;
Pg2.prototype.unload = Pg2_unload;
Pg2.prototype.lastUnload = Pg2_lastUnload;

function Pg2_getTabLabel() {
  return this.tabLabel;
}

//Called to check if a page can be loaded
//
function Pg2_canLoad() {
  with (this) {
    handleSetObj.innerHTML = (GhandleMenu)?handleSetHTML:"";
  }
  return true;
}

//Called when the layer for this page is displayed.
// Use this call to initialize controls.
//
function Pg2_load() {
  setOptions();
  return true;
}

//Called when one of the page controls calls the tabControl update function.
// Use this call to respond to user input.
//
function Pg2_update(theItemName) {
  var theObj, temp, temp2;

  theObj = findObject(theItemName);
  with (this) {
    if (theItemName == "handleMenu") {
      myLayer.visibility = "hidden";  //workaround: hide layer before changing
      handleSetObj.innerHTML = (theObj.selectedIndex)?handleSetHTML:"";
      myLayer.visibility = "visible";
    }
  }
}

//Called when another page is about to be shown, or finish() is called on
// the tabControl.  Use this call to perform any finishing tasks.
//
function Pg2_unload() {
  getOptions();
  return true;
}

//Called when finish() is called on the tabControl.
// Use this call to perform any last minute page updates.
//
function Pg2_lastUnload() {
  return true;
}
