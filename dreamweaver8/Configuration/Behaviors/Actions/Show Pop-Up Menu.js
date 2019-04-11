// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var MENU_FILE = dw.getConfigurationPath() + "/Shared/Fireworks/mm_menu.js";
var BEHAVIOR_FILE = dw.getConfigurationPath() + '/Behaviors/Actions/Show Pop-Up Menu.htm';
var DEBUG_FILE = dw.getConfigurationPath() + '/POPUP_DEBUG.txt';

var helpDoc = MM.HELP_behShowPopupMenu;
var T = ''; //TabControl object
var SHOW_FW8_WARNING = true;
var pg2Loaded = false;
var Pg4Loaded = false;
var menuId;
var treeStr = '';
var lastMenu;

var firstFourItems = new Array();

var BEFORE_ThisMenu = null; // the code before the current menu
var AFTER_ThisMenu = null; // the code after the current menu
var menuFound = false;

var DEFAULT_TARGETS = new Array(" ","_blank","_parent","_self","_top");
var DOC_TARGETS = new Array(); // Targets gathered from document. 
var FONTS;
var FONT_NAMES = new Array();
var FONT_VALUES = new Array();

// Button vars
var IBTN_add, IBTN_del;
var IBTN_outdent, IBTN_indent;
var IBTN_up, IBTN_down;
var IBTN_makeBold, IBTN_makeItalic;
var IBTN_left, IBTN_center, IBTN_right, GROUP_align;
var IBTN_bottomRight, IBTN_topRight, IBTN_top, IBTN_bottom, GROUP_pos;

// Flags
var autoItemWidth = true;
var autoItemHeight = true;


// Default values for formatting. Most can be overridden 
// by user on Appearance and Advanced tabs.

// Appearance tab settings
var G_textUpColor = "#000000";
var G_textOverColor = "#FFFFFF";
var G_cellUpColor = "#CCCCCC";
var G_cellOverColor = "#000084";
var G_textAlignment = "left";
var G_textFamily = ""; // intentionally empty for internationalization purposes.
var G_textBold = false;
var G_textItalic = false;
var G_textOnly = true;
var G_textSize = "12";

// Advanced tab settings
var G_itemHeight = 18; // Reset by getItemHeight() or by user
var G_itemWidth = 100; // Reset by getLongestItem() (called from buildMenuItems()) or by user
var G_menuItemSpacing = 0;
var G_menuItemPadding = 3;
var G_hiliteColor = "#FFFFFF";
var G_shadowColor = "#555555";
var G_borderColor = "#777777";
var G_borderSize = 1;
var G_showBorders = true;
var G_hideTimeout = 1000;
var G_vertical = true;
var G_menuItemIndent = 0;

// Position tab settings
var G_horzOffset;
var G_vertOffset;
var G_hideOnMouseOut = true;


// Not settable by user. Values set in FW are preserved; 
// otherwise defaults are used.
var G_menuImagePath = "";  // Set by parseLoadMenus() if menu was created with images; otherwise, remains empty string.
var G_menuImagePath2 = ""; // Set by parseLoadMenus() if menu was created with images; otherwise, remains empty string.
var G_menuArrowPath = "arrows.gif";
var G_vertAlignment = "middle";
var G_horzSubmenuOffset = -5;
var G_vertSubmenuOffset = 7;
var G_submenuRelativeToItem = true;

var dwMenu = new Object();
var theMenuItems = new Array();
var menuText = '"root"';
var indent = "  ";
var menuId = "mm_menu_" + dateToUniqueID(new Date()) + "_0";
var newMenuStr = "";

var rootNodes = new Array();
var G_menuHeight; // Calculated by multiplying the number of root items by the itemHeight. Used for positioning only -- not passed to MM_showMenu().
var G_sizingFont = "Courier New"; // Font used for sizing if G_textFamily is blank; Fireworks team depends on this value, so don't change without talking to them!


//******************* BEHAVIOR FUNCTION **********************

// This function must match the function of the
// same name in mm_menu.js
function MM_showMenu(menu, x, y, child, imgname) {
	if (!window.mmWroteMenu) return;
	MM_clearTimeout();
	if (menu) {
		var obj = FIND(imgname) || document.images[imgname] || document.links[imgname] || document.anchors[imgname];
		x = moveXbySlicePos (x, obj);
		y = moveYbySlicePos (y, obj);
	}
	if (document.layers) {
		if (menu) {
			var l = menu.menuLayer || menu;
			l.top = l.left = 1;
			hideActiveMenus();
			if (this.visibility) l = this;
			window.ActiveMenu = l;
		} else {
			var l = child;
		}
		if (!l) return;
		for (var i=0; i<l.layers.length; i++) { 			   
			if (!l.layers[i].isHilite) l.layers[i].visibility = "inherit";
			if (l.layers[i].document.layers.length > 0) MM_showMenu(null, "relative", "relative", l.layers[i]);
		}
		if (l.parentLayer) {
			if (x != "relative") l.parentLayer.left = x || window.pageX || 0;
			if (l.parentLayer.left + l.clip.width > window.innerWidth) l.parentLayer.left -= (l.parentLayer.left + l.clip.width - window.innerWidth);
			if (y != "relative") l.parentLayer.top = y || window.pageY || 0;
			if (l.parentLayer.isContainer) {
				l.Menu.xOffset = window.pageXOffset;
				l.Menu.yOffset = window.pageYOffset;
				l.parentLayer.clip.width = window.ActiveMenu.clip.width +2;
				l.parentLayer.clip.height = window.ActiveMenu.clip.height +2;
				if (l.parentLayer.menuContainerBgColor && l.Menu.menuBgOpaque ) l.parentLayer.document.bgColor = l.parentLayer.menuContainerBgColor;
			}
		}
		l.visibility = "inherit";
		if (l.Menu) l.Menu.container.visibility = "inherit";
	} else if (FIND("menuItem0")) {
		var l = menu.menuLayer || menu;	
		hideActiveMenus();
		if (typeof(l) == "string") l = FIND(l);
		window.ActiveMenu = l;
		var s = l.style;
		s.visibility = "inherit";
		if (x != "relative") {
			s.pixelLeft = x || (window.pageX + document.body.scrollLeft) || 0;
			s.left = s.pixelLeft + 'px';
		}
		if (y != "relative") {
			s.pixelTop = y || (window.pageY + document.body.scrollTop) || 0;
			s.top = s.pixelTop + 'px';
		}
		l.Menu.xOffset = document.body.scrollLeft;
		l.Menu.yOffset = document.body.scrollTop;
	}
	if (menu) window.activeMenus[window.activeMenus.length] = l;
	MM_clearTimeout();
}

//******************* API **********************


// Can only be used on IMGs, AREAs, and links. Cannot be used
// in template files.
function canAcceptBehavior(){
  var retVal;
  var dom = dw.getDocumentDOM();
  var selNode = dom.getSelectedNode();
  if (!selNode.tagName){
    selNode = selNode.parentNode;
  }
  if (dom.getIsTemplateDocument() || dom.getAttachedTemplate() != ""){
    retVal = false;
  }else if (selNode.hasChildNodes() && selNode.childNodes[0].tagName == 'MM:BEGINLOCK'){
    return false;  
  }else  if (selNode.tagName && (selNode.tagName == "IMG" || selNode.tagName == "AREA" || selNode.tagName == "A")){
    retVal = "onMouseOver,(onMouseOver)";
  }else{
    retVal = false;
  }
  return retVal;
}



//Returns a Javascript function to be inserted in HTML head with script tags.

function behaviorFunction(){
  return "MM_showMenu";
}


//Returns fn call to insert in HTML tag <TAG... onEvent='thisFn(arg)'>
function applyBehavior() {
  if (T){
    T.finish();
    var dom = dw.getDocumentDOM();
    var selObj = dw.getBehaviorElement();
    if (!selObj) selObj = dom.getSelectedNode();
  
    // Make sure the object to which the behavior is being applied 
    // has a name.
    var objName = makeUniqueName('img','image');
    if (selObj.tagName == 'IMG' && !selObj.getAttribute("name")){
      selObj.setAttribute("name",objName);
      if (!selObj.getAttribute("id"))
        selObj.setAttribute("id",objName);
    }else if (selObj.tagName == 'A'){
      if ((selObj.childNodes[0].tagName && selObj.childNodes[0].tagName == 'IMG') && !selObj.childNodes[0].getAttribute("name")){
        selObj.childNodes[0].setAttribute("name",objName);
      if (!selObj.childNodes[0].getAttribute("id"))
        selObj.childNodes[0].setAttribute("id",objName);
      }else if (selObj.childNodes[0].tagName && selObj.childNodes[0].tagName == 'IMG'){
        objName = selObj.childNodes[0].getAttribute("name");
      }else{
        objName = makeUniqueName('a','link');
        selObj.setAttribute("name",objName);
        if (!selObj.getAttribute("id"))
          selObj.setAttribute("id",objName);
      }
    }else if (selObj.tagName == 'IMG'){
      objName = selObj.getAttribute("name");
    }else if (selObj.tagName == 'AREA'){
      var mapName = selObj.parentNode.getAttribute("name");
      for (var x=0; x < dom.images.length; x++){
        if (dom.images[x].getAttribute("usemap") && dom.images[x].getAttribute("usemap") == "#" + mapName){
          if (!dom.images[x].getAttribute("name")){
            dom.images[x].setAttribute("name",objName);
           if (!dom.images[x].getAttribute("id"))
              dom.images[x].setAttribute("id",objName);
          }else{
            objName = dom.images[x].getAttribute("name");
          }
        }
      }
    }
      
    var docEl = dom.documentElement;
    var headTags = docEl.getElementsByTagName("head");
    var theHead = (headTags.length > 0) ? headTags[0] : null;

    var fnCall = "MM_showMenu(window." + menuId + "," + G_horzOffset + "," + G_vertOffset + ",null,'" + objName + "')";

    // Don't bother to re-generate the menus if we've just inserted them
    // from Fireworks.
    var insertFlag = theHead.innerHTML.indexOf("<!-- inserted from Fireworks -->");
    if (insertFlag >= 0){
      // just remove the flag.
      theHead.innerHTML = theHead.innerHTML.substring(0,insertFlag);
    }else{
      // Generate the menus. 
      writeMenu(dwMenu,theMenuItems,menuText,indent,menuId,G_hideOnMouseOut);
      var lastLines = "\n" + lastMenu + ".writeMenus();\n} // mmLoadMenus()";
    
      var startFn = theHead.innerHTML.indexOf('function mmLoadMenus()');

      // If there's already an mmLoadMenus() function, we need to insert our
      // new menu into it, not overwrite it.
      if (startFn != -1){
        var endFn = theHead.innerHTML.indexOf('// mmLoadMenus()')+16;

        // If we're inserting a new menu rather than editing an existing one
        if (!menuFound){

          // Find the writeMenus() line (we'll need to replace it) 
          var searchPatt = /mm_menu_\d+_\d+\.writeMenus\(\)/;
          var beginWriteMenus = theHead.innerHTML.search(searchPatt);
        
          // Replace the old writeMenus() line
          newMenuStr += lastLines;

          var fnStr = theHead.innerHTML.substring(startFn,beginWriteMenus) + newMenuStr;
                
        // We're editing an existing menu, so we just need to replace 
        // the old reference to it. If AFTER_ThisMenu is an empty 
        // string, this is the only menu in the function, and we 
        // need to add the writeMenus() line back in.
        }else{
          if (AFTER_ThisMenu == ""){
            // Replace the old writeMenus() line
            newMenuStr += lastLines;
          }
          var fnStr = BEFORE_ThisMenu + newMenuStr + AFTER_ThisMenu;
        }
        theHead.innerHTML = theHead.innerHTML.substring(0,startFn) + fnStr + theHead.innerHTML.substring(endFn);

      // If there's no existing mmLoadMenus() function, add the opening
      // lines before the menu string, and the closing lines after it.
      }else{
        newMenuStr = "function mmLoadMenus() {\n  if (window." + menuId + ") return;\n" + newMenuStr;        
        newMenuStr += lastLines;

        var scriptTag = theHead.getElementsByTagName('SCRIPT');
        if (scriptTag.length > 0){
          var openComment = scriptTag[0].innerHTML.indexOf("<!--");
          if (openComment != -1){
            scriptTag[0].innerHTML = scriptTag[0].innerHTML.substring(0,openComment+4) + "\n" + newMenuStr + "\n" + scriptTag[0].innerHTML.substring(openComment+4);
          }else{
            scriptTag[0].innerHTML = newMenuStr + scriptTag[0].innerHTML;
          }
        }else{
          theHead.innerHTML = theHead.innerHTML + '<script language="JavaScript">\n<!--\n' + newMenuStr + '\n//-->\n</' + 'script>\n';
        }
        // If there are submenus, copy the arrows.gif file 
        // to the current document folder       
        if (newMenuStr.search(/mm_menu_\d+_\d+_\d+/) != -1){
          DWfile.copy(dw.getConfigurationPath() + "/Shared/Fireworks/arrows.gif", dom.URL.substring(0,dom.URL.lastIndexOf('/')+1)+"arrows.gif");
        }
      }
      // If there are submenus, and no arrows.gif file exists in the referenced
      // location, copy it there.
      if (newMenuStr.search(/mm_menu_\d+_\d+_\d+/) != -1 && theHead.innerHTML.indexOf('childMenuIcon') != -1){
        var copyPath = dw.relativeToAbsoluteURL(dom.URL,"",G_menuArrowPath);
        DWfile.copy(dw.getConfigurationPath() + "/Shared/Fireworks/arrows.gif",copyPath);
      }

      if (theHead.innerHTML.indexOf('mm_menu.js') == -1){
        theHead.innerHTML = theHead.innerHTML + '<script language="JavaScript" src="mm_menu.js"><' + '/script>';
        if (DWfile.exists(MENU_FILE)){
          // Copy menu file to same folder as current file
          DWfile.copy(MENU_FILE, dom.URL.substring(0,dom.URL.lastIndexOf('/')+1)+"mm_menu.js");
        }else{
          alert(MISSING_MENU_FILE);
        }
      }else{
        // if the reference to mm_menus.js is there, but the file does not exist at the location
        // referenced, copy a new mm_menu.js to that location.
        var scripts = theHead.getElementsByTagName('script');
        for (var s=0; s < scripts.length; s++){
          if (scripts[s].src && scripts[s].src.indexOf('mm_menu.js') != -1){
            var menuLoc = dw.relativeToAbsoluteURL(dom.URL,"",scripts[s].src);
            if (!DWfile.exists(menuLoc)){
              DWfile.copy(MENU_FILE,menuLoc);
            }
          }
        }
      }
    }

    // If the user opted to hide the menu onMouseOut...
    if (G_hideOnMouseOut){
      setHandler(selObj,'onMouseOut','MM_startTimeout();');
    }else{
      
      if (getHandler(selObj,'onMouseOut','MM_startTimeout') == ""){
        if (getHandler(selObj.parentNode,'onMouseOut','MM_startTimeout')){
          delHandler(selObj.parentNode,'onMouseOut','MM_startTimeout');
        }
      }else{
        delHandler(selObj,'onMouseOut','MM_startTimeout');
      }
    }

    if (dom.body.innerHTML.indexOf('mmLoadMenus()') == -1){
      dom.body.innerHTML = '<script language="JavaScript1.2">mmLoadMenus();</' + 'script>' + dom.body.innerHTML;
    }
  }else if (dwscripts.findDOMObject("useFWInstead").visibility == "visible"){
    var fnCall = OK_TO_FW8_MSG;
  }else{
    var fnCall = SAVE_FIRST;
  }
  return fnCall;
}

function deleteBehavior(applyStr){
  var tokens = dw.getTokens(applyStr,"(),. ");
  menuId = tokens[2];
  
  // Get the DOM of the current document
  var dom = dw.getDocumentDOM();
  var selObj = dw.getBehaviorElement();
  if (!selObj) selObj = dom.getSelectedNode();

  if (dom.body.innerHTML.indexOf("MM_showMenu(") == -1) {
    // Get the contents of the HEAD
    var docEl = dom.documentElement;
    var theHead = docEl.getElementsByTagName("head")[0];
    var headCont = theHead.innerHTML;
  
    // Look for the mmLoadMenus() function
    var startFn = headCont.indexOf('function mmLoadMenus()');  
    if (startFn != -1){
      var endFn = headCont.indexOf('// mmLoadMenus()')+16;
      var fnStr = headCont.substring(startFn,endFn);
      var onlyOne = false;
  
      // Find the current menu within mmLoadMenus()
      var numRegExp = new RegExp('(window\\.)?(mm_menu_\\d+_\\d+)[^\\)]','g')
      var numResult;
      while ((numResult = numRegExp.exec(fnStr)) != null){
        if (numResult[2] == menuId && !startThisMenu){
          var startThisMenu = numRegExp.lastIndex - (numResult[0].length);
        }else if (numResult[2] != menuId && startThisMenu){
          var endThisMenu = numRegExp.lastIndex - (numResult[0].length);
          var nextMenu = numResult[2];
          break;
        }
      }
      // If we found the start of a menu and not an end, we've
      // found the last menu in the function. If no menu is above
      // this one, it means there's only one menu in the function. 
      // If there *is* a menu mentioned before this one, we'll
      // set BEFORE_ThisMenu and AFTER_ThisMenu here, because
      // we need to change the writeMenus() call (it's currently
      // referencing the menu we're deleting).
      if (startThisMenu && !endThisMenu){
        lastMenu = "";
        while ((numResult = numRegExp.exec(fnStr.substring(0,startThisMenu))) != null){
          lastMenu = numResult[2];
        }
        if (lastMenu != ""){
          BEFORE_ThisMenu =  fnStr.substring(0,startThisMenu);
          AFTER_ThisMenu = "\n  "+lastMenu+".writeMenus();\n} // mmLoadMenus()";      
        }else{
          startThisMenu = startFn;
          var endThisMenu = endFn;
          onlyOne = true;
        }
      }
      // If both startThisMenu and endThisMenu have values,
      // save off the parts of the function that come before
      // and after this menu.
      if (startThisMenu && endThisMenu){
        BEFORE_ThisMenu = fnStr.substring(0,startThisMenu);
        AFTER_ThisMenu = fnStr.substring(endThisMenu);
      }
      // If more than one menu was found, we need to extract only
      // the current menu from the function. If it turns out that the
      // menu we're removing was the one being checked for in the first
      // line of the function, we'll remove the reference to our menu
      // and replace it with whichever menu is listed next.
      if (!onlyOne){
        var returnExp = new RegExp('if\\s*\\(window\\.' + menuId + '\\)\\s*return;');
        BEFORE_ThisMenu = BEFORE_ThisMenu.replace(returnExp,'if (window.' + nextMenu + ') return;');
        fnStr = BEFORE_ThisMenu + AFTER_ThisMenu;
        theHead.innerHTML = theHead.innerHTML.substring(0,startFn-1) + fnStr + theHead.innerHTML.substring(endFn);
  
      // If there was only one menu defined in mmLoadMenus(), we need to
      // remove the entire function. If that results in empty SCRIPT tags,
      // remove those too. We also must remove the SCRIPT tags that reference
      // mm_menu.js and call mmLoadMenus().
      }else{
        theHead.innerHTML = theHead.innerHTML.substring(0,startFn-1) + theHead.innerHTML.substring(endFn);
        var scripts = dom.getElementsByTagName('SCRIPT');
        for (var p=0; p < scripts.length; p++){
          if (scripts[p].getAttribute("src") && scripts[p].getAttribute("src").indexOf('mm_menu.js') != -1){
            scripts[p].outerHTML = "";
          }else if (scripts[p].innerHTML == "mmLoadMenus();"){
            scripts[p].outerHTML = "";
          }else if (scripts[p].getAttribute("src") == null && scriptIsEmpty(scripts[p].innerHTML)){
            scripts[p].outerHTML = "";
          }
        }
      }

      // If we're deleting the Show behavior, we should also delete
      // the Hide behavior.
      if (getHandler(selObj,'onMouseOut','MM_startTimeout') == ""){
        if (getHandler(selObj.parentNode,'onMouseOut','MM_startTimeout')){
          delHandler(selObj.parentNode,'onMouseOut','MM_startTimeout');
        }
      }else{
        delHandler(selObj,'onMouseOut','MM_startTimeout');
      }
    }
  }
}

function inspectBehavior(fnStr){
  if (fnStr){
    dwscripts.findDOMObject("readingMenus").visibility = "visible";
    if (arguments.length == 1 && dw.getDocumentDOM().URL !=""){
      var tokens, menuStruct;
    
      tokens = dw.getTokens(fnStr,"(), ");
  
      menuStruct = parseLoadMenus(tokens[1]);
      G_horzOffset = parseInt(tokens[2]);
      G_vertOffset = parseInt(tokens[3]);
      
      if (menuStruct.length > 0){
        treeStr = buildTrees(menuStruct,tokens[1].match(/mm_menu_(\d+_\d+)/)[0]);
    
        // populate the treecontrol with treeStr
        dwscripts.findDOMObject("menuItems").innerHTML = '<mm:treecolumn name="label" value="' + LABEL_Text + '" width="100">\n<mm:treecolumn name="url" value="' + LABEL_Link + '" width="150">\n<mm:treecolumn name="target" value="' + LABEL_Target + '" width="100">\n' + treeStr;
      }
      
      // Add extra targets to targetList
      T.update("addTargets");
      
      dwscripts.findDOMObject("menuItems").selectedNodes = new Array(dwscripts.findDOMObject("menuItems").childNodes[3]);
      T.update("menuItems");
  //    dw.forceGarbageCollection();
    }
    T.obj.visibility = "hidden";
    dwscripts.findDOMObject("readingMenus").visibility = "hidden";
    T.obj.visibility = "visible";
  }
}
  

//*************** Pg1 Class *****************

function Pg1(theTabLabel) {
  this.tabLabel    = theTabLabel;
  
  this.targetList    = new ListControl("targetList");
  this.itemText     = dwscripts.findDOMObject("itemText");
  this.itemURL       = dwscripts.findDOMObject("itemURL");
  this.menuTree     = dwscripts.findDOMObject("menuItems");
  this.browse        = dwscripts.findDOMObject("browseBtn");
  //  Indent, Outdent, Up, Down, Plus, and Minus are all defined as image buttons in the initUI() function.
}


//***** methods *****

Pg1.prototype.getTabLabel = Pg1_getTabLabel; //required
Pg1.prototype.canLoad = Pg1_canLoad;
Pg1.prototype.load = Pg1_load;
Pg1.prototype.update = Pg1_update;
Pg1.prototype.unload = Pg1_unload;


function Pg1_getTabLabel() {
  return this.tabLabel;
}


//Called to check if a page can be loaded
//
function Pg1_canLoad() {
  return true;
}


//Called when the layer for this page is displayed.
// Use this call to initialize controls.

function Pg1_load() {
  with (this){
    targetList.setAll(DEFAULT_TARGETS,DEFAULT_TARGETS);
    
    // Gets targets from links
    T.update("addTargets");

    var frameNames = dw.getDocumentDOM().getFrameNames();
    for (var i=0; i < frameNames.length; i++){
      targetList.append(frameNames[i],frameNames[i]);
    }
    targetList.setIndex(0);


    if (document.getElementsByTagName('mm:treenode').length == 0){
      menuTree.innerHTML = menuTree.innerHTML + '\n<mm:treenode name="item1" value="' + LABEL_NewItem + '| | " state="expanded"></mm:treenode>';
      dwscripts.findDOMObject("item1").selected = true;
    }else{
      menuTree.childNodes[3].selected = true;
    }
    T.update("menuItems");
    rootNodes.length = 0;
  }
}


//Called when another page is about to be shown, or finish() is called on
// the tabControl.  Use this call to perform any finishing tasks.

function Pg1_unload() {
  // Generate the menu items
  with (this){
    // If the last item in the list is "New Item" -- and it's not
    // the *only* item -- remove it
    var itemList = menuTree.treeNodes;
    var lastItem = itemList[itemList.length-1];
    var itemVals = lastItem.getAttribute("value").split('|');
    if (itemList.length > 1 && itemVals[0] == LABEL_NewItem){
      lastItem.outerHTML = "";
    }
      
    // null out the firstFourItems array so we can repopulate
    // it if the user comes back to the Items tab.
    firstFourItems.length = 0;
    
    var menuItemArray = buildMenuItems(menuTree);
    theMenuItems = menuItemArray;
    
    // Get the height of the cells, unless height has been set manually by the user.
    if (autoItemHeight && G_textOnly) G_itemHeight = getItemHeight(menuTree.childNodes[3]);
    
    // Set all properties of menu object (most can be overridden if
    // the user chooses options in the Format and Position tabs).
    dwMenu.menuItems = menuItemArray;
    dwMenu.textUpColor = G_textUpColor;
    dwMenu.textOverColor = G_textOverColor;
    dwMenu.cellUpColor = G_cellUpColor;
    dwMenu.cellOverColor = G_cellOverColor;
    dwMenu.textAlignment = G_textAlignment;
    dwMenu.textBold = G_textBold;
    dwMenu.textItalic = G_textItalic;
    dwMenu.textOnly = G_textOnly;
    dwMenu.textFamily = G_textFamily;
    dwMenu.textSize = G_textSize;
    dwMenu.menuHeight = G_itemHeight;
    dwMenu.menuWidth = G_itemWidth;
    dwMenu.menuImagePath = G_menuImagePath;
    dwMenu.menuImagePath2 = G_menuImagePath2;
    dwMenu.horzOffset = G_horzOffset;
    dwMenu.vertOffset = G_vertOffset;
    dwMenu.vertAlignment = G_vertAlignment;
    dwMenu.hideTimeout = G_hideTimeout;
    dwMenu.horzSubmenuOffset = G_horzSubmenuOffset;
    dwMenu.vertSubmenuOffset = G_vertSubmenuOffset;
    dwMenu.submenuRelativeToItem = G_submenuRelativeToItem;
    dwMenu.menuItemSpacing = G_menuItemSpacing;
    dwMenu.menuItemPadding = G_menuItemPadding;
    dwMenu.opaqueBackground = G_showBorders;
    dwMenu.hiliteColor = G_hiliteColor;
    dwMenu.shadowColor = G_shadowColor;    
    dwMenu.borderColor = G_borderColor;
    dwMenu.borderSize = G_borderSize;
    dwMenu.vertical = G_vertical;
    dwMenu.hideOnMouseOut = G_hideOnMouseOut;
    dwMenu.textIndent = G_menuItemIndent;
    dwMenu.autoItemWidth = autoItemWidth;
    dwMenu.autoItemHeight = autoItemHeight;
    
    var itemList = dwscripts.findDOMObject("menuItems").childNodes;
    for (var i=3; i < itemList.length; i++){
      if (itemList[i].tagName == 'MM:TREENODE'){
        var compoundVal =  itemList[i].getAttribute("value");
        var itemVals = compoundVal.split('|');
        if (i < 7){
          firstFourItems[i-3] = itemVals[0];
        }
        rootNodes.push(itemList[i]);
      }
    }
    while (firstFourItems.length < 4){
      firstFourItems.push(firstFourItems[firstFourItems.length-1])
    }

    // Determine height of whole root menu
    G_menuHeight = parseInt(G_itemHeight * rootNodes.length);
  }
  
  T.obj.visibility = "hidden";
  T.obj.visibility = "visible";
  return true;
}


// Called when one of the page controls calls the tabControl update function.
// Use this call to respond to user input.
function Pg1_update(theItemName) {
  with (this){
/****************************************************
*   When inspectBehavior or Pg1_load() is called    *
*****************************************************/
    if (theItemName == "addTargets"){
      var allNodes = dwscripts.findDOMObject("menuItems").treeNodes;
      var add = true;
      for (var j=0; j < allNodes.length; j++){
        var compoundVal =  allNodes[j].getAttribute("value");
        var itemVals = compoundVal.split('|');
        if (itemVals[2] != " "){
          add = true;
          for (var m=0; m < DOC_TARGETS.length; m++){
            if (DOC_TARGETS[m] == itemVals[2]){
              add = false;
              break;
            }
          }
          if (add){
            DOC_TARGETS.push(itemVals[2]);
          }
        }
      }
      
      // Check document for additional targets
      var dom = dw.getDocumentDOM();
      var links = dom.getElementsByTagName('A');
      for (var q=0; q < links.length; q++){
        if (links[q].getAttribute("target")){
          add = true;
          for (var y=0; y < DOC_TARGETS.length; y++){
            if (DOC_TARGETS[y] == links[q].getAttribute("target")){
              add = false;
              break;
            }
          }
          if (add){
            DOC_TARGETS.push(links[q].getAttribute("target"));
          }
        }
      }

          
      var allTargets = targetList.getValue('all');
      for (var p=0; p < DOC_TARGETS.length; p++){
        var addTarget = true;
        for (var x=0; x < allTargets.length; x++){
          if (allTargets[x] == DOC_TARGETS[p]){
            addTarget = false;
            break;
          }
        }
        if (addTarget){
          targetList.append(DOC_TARGETS[p],DOC_TARGETS[p]);
        }
      }
    }

/****************************************************
*   When the + button is clicked                    *
*****************************************************/
    if (theItemName == "addItem"){
      // Make a unique name for each item added.
      var now = new Date();
      var itemId = "item" + now.getMonth() + now.getDate() + now.getFullYear() + now.getHours() + now.getMinutes() + now.getMilliseconds();
      var newItem = '<mm:treenode name="' + itemId + '" value="' + LABEL_NewItem + '|' + itemURL.value + '| |" state="expanded"></mm:treenode>\n';  

      // Locate the selected node, and then deselect it.
      var whichNode = menuTree.selectedNodes[0];
      whichNode.removeAttribute("selected");

      // If the node we just located has children, we'll 
      // create the new item at the bottom of the childlist.
      if (whichNode.innerHTML.indexOf('mm:treenode') != -1){
        whichNode.innerHTML = whichNode.innerHTML + newItem;
      }
      
      // Otherwise, we need to add the node directly after the
      // one we located. This requires some string manipulation.
      else{
      // Get the position of the node we just located, the 
      // position of the tree control, and the contents of
      // the document.
        var nodePos = document.nodeToOffsets(whichNode);
        var treePos = document.nodeToOffsets(menuTree);
        var wholeDoc = document.documentElement.outerHTML;
        var startOfTree = treePos[0];
        var endOfWhichNode = nodePos[1];
        var endOfTree = treePos[1];
        
        menuTree.outerHTML = wholeDoc.substring(startOfTree,endOfWhichNode) + '\n' + newItem + wholeDoc.substring(endOfWhichNode,endOfTree);
      }
      // Select the item we just added, and call T.update() to
      // update the text fields.

      dwscripts.findDOMObject(itemId).setAttribute("selected","true");
      T.update("menuItems");
    }
    
/****************************************************
*   When the - button is clicked                    *
*****************************************************/
    if (theItemName == "removeItem"){
      // Locate the selected node
      var whichNode = menuTree.selectedNodes[0];
      
      // If the node we just located has children, we'll 
      // alert the user that the children are about to be
      // deleted as well.
      var deleteChildren = false;
      if (whichNode.hasChildNodes()){
        deleteChildren = confirm(DELETE_KIDS);
      }
      
      if (!whichNode.hasChildNodes() || deleteChildren){
        var mom = whichNode.parentNode;
        var nodes = mom.childNodes;
        // If this is a top-level node, we need to start at
        // the fourth child to skip the three MM:TREECOLUMN tags.
        var start = (mom.tagName == "MM:TREECONTROL")?3:0;
        var origNode = whichNode;
        for (var n=start; n < nodes.length; n++){
          if (nodes[n] == whichNode){
            whichNode.outerHTML = "";
            if (n+1 < nodes.length){
              nodes[n+1].setAttribute("selected","true");
            }else if (n-1 >= start){
              nodes[n-1].setAttribute("selected","true");
            }else{
              if (start == 3){
                menuTree.innerHTML = menuTree.innerHTML + '\n<mm:treenode name="item1" value="' + LABEL_NewItem + '| | " state="expanded"></mm:treenode>';
                dwscripts.findDOMObject("item1").selected = true;
              }else{
                mom.setAttribute("selected","true");
              }
            }
            T.update("menuItems");
          }
        }
      }
    }
    
/****************************************************
*   When one of the text fields or the target       *
*   menu changes                                    *
*****************************************************/
    else if (theItemName == "itemText" || theItemName == "itemURL" || theItemName == "targetList"){
      if (menuTree.selectedNodes.length > 0){
        var whichNode = menuTree.selectedNodes[0];
        if (itemText.value.indexOf('|') != -1 || itemURL.value.indexOf('|') != -1){
          alert(MSG_NOPIPES);
          var theItem = dwscripts.findDOMObject(theItemName);
          theItem.value = theItem.value.replace(/\|/g,'');
          theItem.focus();
          theItem.select();
        }else if (targetList.getValue().indexOf('|') != -1){
          alert(MSG_PIPE_IN_FRAME_NAME);
          targetList.setIndex(0);
          targetList.setIndex(-1);
        }else{
          var url = (itemURL.value == "")?" ":itemURL.value;
          whichNode.setAttribute("value",itemText.value + '|' + url + '|' + targetList.getValue());
        }
      }
    }
    
/****************************************************
*   When the treecontrol changes                    *
*****************************************************/
    else if (theItemName == "menuItems"){
      // Update the text fields and target menu
      if (menuTree.selectedNodes.length > 0){
        var selNode = menuTree.selectedNodes[0];
        var compoundVal =  selNode.getAttribute("value");
        var itemVals = compoundVal.split('|');
        itemText.value = itemVals[0];
        itemURL.value = itemVals[1];
        targetList.pickValue(itemVals[2]);
        itemText.focus();
        itemText.select();

        // Enable or disable all the buttons at the top
        enableButtons(selNode,menuTree);

      // If for some reason no node is selected (this should never
      // happen), disable the Minus button.
      }else{
        IBTN_del.disable();
      }
    }
    
/****************************************************
*   When the outdent button is clicked              *
*****************************************************/
    else if (theItemName == "outdent"){
      if (IBTN_outdent.disabled == false){
        var whichNode = menuTree.selectedNodes[0];
        var nodePos = document.nodeToOffsets(whichNode);
        var treePos = document.nodeToOffsets(menuTree);
        var wholeDoc = document.documentElement.outerHTML;
        var startOfTree = treePos[0];
        var startOfNode = nodePos[0];
        var endOfNode = nodePos[1];
        var endOfTree = treePos[1];
        var startTag = whichNode.outerHTML.substring(0,whichNode.outerHTML.indexOf('>')+1);
        var endTag = whichNode.outerHTML.substring(whichNode.outerHTML.indexOf('<',2));
        menuTree.outerHTML = wholeDoc.substring(startOfTree,startOfNode) + '\n' + endTag + startTag + wholeDoc.substring(endOfNode,endOfTree);
        T.update("menuItems");
      }
    }

/****************************************************
*   When the indent button is clicked              *
*****************************************************/
    else if (theItemName == "indent"){
      if (IBTN_indent.disabled == false){
        var nodes = menuTree.treeNodes;
        var whichNode = menuTree.selectedNodes[0];
        for (var i=0; i < nodes.length; i++){
          if (nodes[i] == whichNode){
            nodes[i-1].innerHTML = whichNode.outerHTML;
            whichNode.outerHTML = "";
            T.update("menuItems");
          }
        }
      }
    }
    
/****************************************************
*   When the up button is clicked              *
*****************************************************/
    else if (theItemName == "moveUp"){
      if (IBTN_up.disabled == false){
        var nodes = menuTree.treeNodes;
        var whichNode = menuTree.selectedNodes[0];
        var nodesAtSameLevel = whichNode.parentNode.childNodes;
        var newStr = "";
        for (var i=nodesAtSameLevel.length-1; i >= 0; i--){
          if (nodesAtSameLevel[i] == whichNode){
            newStr = nodesAtSameLevel[i].outerHTML + '\n' + nodesAtSameLevel[i-1].outerHTML + '\n' + newStr;
            i--;
          }else{
            newStr = nodesAtSameLevel[i].outerHTML + '\n' + newStr;
          }
        }
        if (whichNode.parentNode.tagName == "MM:TREECONTROL"){
          menuTree.innerHTML = newStr;
        }else{
          whichNode.parentNode.innerHTML = newStr;
        }
        T.update("menuItems");
      }
    }
    
/****************************************************
*   When the down button is clicked              *
*****************************************************/
    else if (theItemName == "moveDown"){
      if (IBTN_down.disabled == false){
        var nodes = menuTree.treeNodes;
        var whichNode = menuTree.selectedNodes[0];
        var nodesAtSameLevel = whichNode.parentNode.childNodes;        
        var newStr = "";
        for (var i=0; i < nodesAtSameLevel.length; i++){
          if (nodesAtSameLevel[i] == whichNode){
            newStr += nodesAtSameLevel[i+1].outerHTML + '\n' + nodesAtSameLevel[i].outerHTML + '\n';
            i++;
          }else{
            newStr += '\n' + nodesAtSameLevel[i].outerHTML;
          }
        }
        if (whichNode.parentNode.tagName == "MM:TREECONTROL"){
          menuTree.innerHTML = newStr;
        }else{
          whichNode.parentNode.innerHTML = newStr;
        }
        T.update("menuItems");
      }
    }
    
  }
}

//***************** Pg2 Class ******************

function Pg2(theTabLabel) {
  this.tabLabel    = theTabLabel;

  this.orientation  = dwscripts.findDOMObject("orientation");
  this.fontList      = new ListControl("fontList");
  this.fontSize     = dwscripts.findDOMObject("fontSize");
  this.upText        = dwscripts.findDOMObject("upText");
  this.upCell        = dwscripts.findDOMObject("upCell");
  this.overText      = dwscripts.findDOMObject("overText");
  this.overCell      = dwscripts.findDOMObject("overCell");
  this.previewTable  = dwscripts.findDOMObject("previewTable");
  this.cellsRow     = dwscripts.findDOMObject("cellsRow");
  this.colorSwatches= dwscripts.findDOMObject("colorSwatches");
  //  Bold, Italic, Left, Right, and Center are all defined as image buttons in the initUI() function.
}


//***** methods *****

Pg2.prototype.getTabLabel = Pg2_getTabLabel;
Pg2.prototype.canLoad = Pg2_canLoad;
Pg2.prototype.load = Pg2_load;
Pg2.prototype.update = Pg2_update;
Pg2.prototype.unload = Pg2_unload;

function Pg2_getTabLabel() {
  return this.tabLabel;
}



//Called to check if a page can be loaded
//
function Pg2_canLoad() {
  return true;
}



//Called when the layer for this page is displayed.
// Use this call to initialize controls.
function Pg2_load() {
  with (this){
    if (!G_textOnly){
      cellsRow.innerHTML = '<tr><td align="right" valign="baseline">' + LABEL_Cells + ':</td><td colspan="2" valign="baseline"><input type="radio" name="cells" value="useImages" checked>' + LABEL_UseImages + '&nbsp;&nbsp;<input type="radio" name="cells" value="useHTML" onClick="T.update(\'useHTML\')">' + LABEL_UseHTML + '</td><td colspan="2" align="right" valign="baseline">&nbsp;</td><td><select name="orientation" onChange="T.update(\'orientation\')"><option value="vert">' + LABEL_Vertical + '</option><option value="horz">' + LABEL_Horizontal + '</option></select></td></tr>';
      colorSwatches.innerHTML = '<tr height="12"><td nowrap align="right">&nbsp;</td><td align="left">&nbsp; </td><td align="right" nowrap>&nbsp;</td><td align="left">&nbsp;</td><td align="left">&nbsp;</td><td align="left">&nbsp;</td></tr><tr height="15"><td nowrap align="right">&nbsp;</td><td align="left">&nbsp;</td><td align="right">&nbsp;</td><td align="left">&nbsp;</td><td align="left">&nbsp;</td><td align="left">&nbsp;</td></tr><tr height="15"><td nowrap align="right">&nbsp;</td><td align="left">&nbsp;</td><td align="right">&nbsp;</td><td align="left">&nbsp;</td><td align="left">&nbsp;</td><td align="left">&nbsp;</td></tr>';
      orientation = dwscripts.findDOMObject('orientation');
    }else{
      upText.value = G_textUpColor;
      upCell.value = G_cellUpColor;
      overText.value = G_textOverColor;
      overCell.value = G_cellOverColor;
    }

    buildFontArrays();    
    fontList.setAll(FONT_NAMES,FONT_VALUES);
    if (!fontList.pickValue(G_textFamily)){
      FONT_NAMES.splice(FONT_NAMES.length-2,0,G_textFamily);
      FONT_VALUES.splice(FONT_VALUES.length-2,0,G_textFamily);
      fontList.setAll(FONT_NAMES,FONT_VALUES);      
    }
    fontList.pickValue(G_textFamily);
    fontSize.value = G_textSize;
    IBTN_makeBold.setValue((G_textBold));
    IBTN_makeItalic.setValue((G_textItalic));
    GROUP_align.select(G_textAlignment);
    orientation.selectedIndex = (G_vertical)?0:1;
    
    previewTable.innerHTML = generatePreview();
  }
  pg2Loaded = true;
}



// Called when another page is about to be shown, or finish() is called on
// the tabControl.  Use this call to perform any finishing tasks.
function Pg2_unload() {
  with (this){
    // Build menuItems array again on assumption that user
    // changed font settings (which affect the maxWidth property
    // of each menuItem object).
    var menuItemArray = buildMenuItems(dwscripts.findDOMObject("menuItems"));
    theMenuItems = menuItemArray;
    dwMenu.menuItems = menuItemArray;
    
    // Get item height again in case the user changed the
    // font face or font size. 12.17.01 If the user set the height 
    // manually, make sure text will fit. If not, override the manual 
    // setting.
    var sizeNeededToFit = getItemHeight(dwscripts.findDOMObject("menuItems").childNodes[3]);
    if ((autoItemHeight && G_textOnly) || sizeNeededToFit > G_itemHeight){
      G_itemHeight = sizeNeededToFit;
    }
      
    // Determine height of whole root menu
    G_menuHeight = parseInt(G_itemHeight * rootNodes.length);

    // Set properties of menu object that correspond to this tab  
    dwMenu.textUpColor = G_textUpColor;
    dwMenu.textOverColor = G_textOverColor;
    dwMenu.cellUpColor = G_cellUpColor;
    dwMenu.cellOverColor = G_cellOverColor;
    dwMenu.textAlignment = G_textAlignment;
    dwMenu.textBold = G_textBold;
    dwMenu.textItalic = G_textItalic;
    dwMenu.textOnly = G_textOnly;
    dwMenu.textFamily = G_textFamily;
    dwMenu.textSize = G_textSize;
    dwMenu.menuHeight = G_itemHeight;
    dwMenu.menuWidth = G_itemWidth;
    dwMenu.vertical = G_vertical;
        
    // Save settings for next time
    var theFile = MMNotes.open(BEHAVIOR_FILE, true);
    if (theFile){
      MMNotes.set(theFile,"upText",G_textUpColor);
      MMNotes.set(theFile,"overText",G_textOverColor);
      MMNotes.set(theFile,"upCell",G_cellUpColor);
      MMNotes.set(theFile,"overCell",G_cellOverColor);
      MMNotes.set(theFile,"fontFamily",G_textFamily);
      MMNotes.set(theFile,"fontSize",G_textSize);
      MMNotes.set(theFile,"isBold",G_textBold);
      MMNotes.set(theFile,"isItalic",G_textItalic);      
      MMNotes.set(theFile,"horzAlign",G_textAlignment);
      MMNotes.close(theFile);
    }

  }
  T.obj.visibility = "hidden";
  T.obj.visibility = "visible";
  return true;  
}



//Called when one of the page controls calls the tabControl update function.
// Use this call to respond to user input.
function Pg2_update(theItemName) {
  with (this){
    if (theItemName == "orientation"){
      G_vertical = (orientation.selectedIndex == 0)?true:false;
      previewTable.innerHTML = generatePreview();
    }
    if (theItemName == "upText"){
      G_textUpColor = upText.value;
      previewTable.innerHTML = generatePreview();
    }
    if (theItemName == "overText"){
      G_textOverColor = overText.value;
      previewTable.innerHTML = generatePreview();
    }
    if (theItemName == "upCell"){
      G_cellUpColor = upCell.value;
      previewTable.innerHTML = generatePreview();
    }
    if (theItemName == "overCell"){
      G_cellOverColor = overCell.value;
      previewTable.innerHTML = generatePreview();
    }
    if (theItemName == "fontSize"){
      if (fontSize.value.search(/\D/) != -1){
        fontSize.value = G_textSize;
        fontSize.focus();
        fontSize.select();
      }else{
        G_textSize = fontSize.value;
        if (autoItemWidth && G_textOnly) G_itemWidth = getLongestItem(rootNodes);
        previewTable.innerHTML = generatePreview();
      }
    }
    if (theItemName == "fontList"){
      if (fontList.getValue() == "editFontList"){
        buildFontArrays(true);
        fontList.setAll(FONT_NAMES,FONT_VALUES);
        fontList.setIndex(fontList.getLen() - 2);
      }
      G_textFamily = fontList.getValue();
      if (autoItemWidth && G_textOnly) G_itemWidth = getLongestItem(rootNodes);
      previewTable.innerHTML = generatePreview();
    }
    if (theItemName == "makeBold"){
      G_textBold = IBTN_makeBold.value;
      if (autoItemWidth && G_textOnly) G_itemWidth = getLongestItem(rootNodes);
      previewTable.innerHTML = generatePreview();
    }
    if (theItemName == "makeItalic"){
      G_textItalic = IBTN_makeItalic.value;
      if (autoItemWidth && G_textOnly) G_itemWidth = getLongestItem(rootNodes);
      previewTable.innerHTML = generatePreview();
    }
    if (theItemName == "alignCenter" || theItemName == "alignLeft" || theItemName == "alignRight"){
      G_textAlignment = GROUP_align.getSelectedButtonName();
      previewTable.innerHTML = generatePreview();
    }
    if (theItemName == "useHTML"){
      var htmlOnly = confirm(MSG_IRREVOCABLE);
      if (htmlOnly){
        G_menuImagePath = "";
        G_menuImagePath2 = "";
        G_borderSize = 1;
        G_showBorders = true;
        G_textOnly = true;
        cellsRow.innerHTML = '<tr><td align="right" valign="baseline">&nbsp;</td><td colspan="3" valign="baseline"><select name="orientation" onChange="T.update(\'orientation\')"><option value="vert">' + LABEL_Vertical + '</option><option value="horz">' + LABEL_Horizontal + '</option></select></td><td valign="baseline">&nbsp;</td><td valign="baseline">&nbsp;</td></tr>';
        colorSwatches.innerHTML = '<tr><td nowrap align="right">' + LABEL_UpState + ' :</td><td align="left">&nbsp; </td><td align="right" nowrap>' + LABEL_OverState + ':</td><td align="left">&nbsp;</td><td align="left">&nbsp;</td><td align="left">&nbsp;</td></tr><tr><td nowrap align="right">' + LABEL_Text + ':</td><td align="left"><input type="mmcolorbutton" name="upText" value="' + G_textUpColor + '" onChange="T.update(\'upText\')"></td><td align="right">' + LABEL_Text + ':</td><td align="left"> <input type="mmcolorbutton" name="overText" value="' + G_textOverColor + '" onChange="T.update(\'overText\')"></td><td align="left">&nbsp;</td><td align="left">&nbsp;</td></tr><tr> <td nowrap align="right">' + LABEL_Cell + ':</td><td align="left"> <input type="mmcolorbutton" name="upCell" value="' + G_cellUpColor + '" onChange="T.update(\'upCell\')"></td><td align="right">' + LABEL_Cell + ':</td><td align="left"><input type="mmcolorbutton" name="overCell" value="' + G_cellOverColor + '" onChange="T.update(\'overCell\')"></td><td align="left">&nbsp;</td><td align="left">&nbsp;</td></tr>';
      upCell = dwscripts.findDOMObject('upCell');
      overCell = dwscripts.findDOMObject('overCell');
      upText = dwscripts.findDOMObject('upText');
      overText = dwscripts.findDOMObject('overText');
      orientation = dwscripts.findDOMObject('orientation');
      
      if (G_vertical){
         orientation.selectedIndex = 0;
      }else{
        orientation.selectedIndex = 1;
      }

      }
      previewTable.innerHTML = generatePreview();
    }
  }
}


//***************** End of Pg2 Class ******************

//***************** Pg3 Class ******************

function Pg3(theTabLabel) {
  this.tabLabel    = theTabLabel;

  this.previewTable    = dwscripts.findDOMObject("previewTable2");
  this.cellWidth      = dwscripts.findDOMObject("cellWidth");
  this.cellWidthSel    = dwscripts.findDOMObject("cellWidthSel");
  this.cellHeight      = dwscripts.findDOMObject("cellHeight");
  this.cellHeightSel  = dwscripts.findDOMObject("cellHeightSel");
  this.cellPad        = dwscripts.findDOMObject("cellPad");
  this.cellSpace      = dwscripts.findDOMObject("cellSpace");
  this.cellShadow      = dwscripts.findDOMObject("cellShadow");
  this.cellHighlight  = dwscripts.findDOMObject("cellHighlight");
  this.showBorders    = dwscripts.findDOMObject("showBorders");
  this.borderWidth    = dwscripts.findDOMObject("borderWidth");
  this.borderColor    = dwscripts.findDOMObject("borderColor");
  this.menuDelay      = dwscripts.findDOMObject("menuDelay");
  this.textIndent      = dwscripts.findDOMObject("textIndent");
}


//***** methods *****

Pg3.prototype.getTabLabel = Pg3_getTabLabel;
Pg3.prototype.canLoad = Pg3_canLoad;
Pg3.prototype.load = Pg3_load;
Pg3.prototype.update = Pg3_update;
Pg3.prototype.unload = Pg3_unload;


function Pg3_getTabLabel() {
  return this.tabLabel;
}



//Called to check if a page can be loaded
//
function Pg3_canLoad() {
  return true;
}



//Called when the layer for this page is displayed.
// Use this call to initialize controls.
//
function Pg3_load() {
  with (this){
    if (!autoItemWidth){
      cellWidth.removeAttribute("disabled");
      cellWidth.value = G_itemWidth;
      cellWidthSel.selectedIndex = 1;
    }
    if (!autoItemHeight){
      cellHeight.removeAttribute("disabled");
      cellHeight.value = G_itemHeight;
      cellHeightSel.selectedIndex = 1;
    }
    if (!G_textOnly){
      showBorders.checked = G_showBorders;
      G_borderSize = 0;
      borderWidth.value = G_borderSize;
      borderWidth.setAttribute("disabled","true");
      borderColor.value = "#DEDFDE";
      borderColor.setAttribute("disabled","true");
      cellHighlight.value = "#DEDFDE";
      cellHighlight.setAttribute("disabled","true");
      cellShadow.value = G_shadowColor;
    }else{
      cellShadow.value = G_shadowColor;
      cellHighlight.value = G_hiliteColor;
      borderColor.value = G_borderColor;
      borderWidth.value = G_borderSize;
      showBorders.checked = G_showBorders;
      T.update("showBorders");
    }
    menuDelay.value = G_hideTimeout;
    textIndent.value = G_menuItemIndent;
    cellSpace.value = G_menuItemSpacing;
    cellPad.value = G_menuItemPadding;
    previewTable.innerHTML = generatePreview();

  }
    
  Pg3Loaded = true;
}



// Called when another page is about to be shown, or finish() is called on
// the tabControl.  Use this call to perform any finishing tasks.
function Pg3_unload() {
    // If the user changed the cell width or cell height field from
    // Pixels back to Automatic, we'll need to rebuild the menus again
    // to generate a new maxWidth.
    var menuItemArray = buildMenuItems(dwscripts.findDOMObject("menuItems"));
     theMenuItems = menuItemArray;
     dwMenu.menuItems = menuItemArray;

  // Set properties of menu object that correspond to this tab  
    dwMenu.menuHeight = G_itemHeight;
    dwMenu.menuWidth = G_itemWidth;
    dwMenu.menuItemSpacing = G_menuItemSpacing;
    dwMenu.menuItemPadding = G_menuItemPadding;
    dwMenu.opaqueBackground = G_showBorders;
    dwMenu.hiliteColor = G_hiliteColor;
    dwMenu.shadowColor = G_shadowColor;
    dwMenu.borderColor = G_borderColor;
    dwMenu.borderSize = G_borderSize;
    dwMenu.hideTimeout = G_hideTimeout;
    dwMenu.textIndent = G_menuItemIndent;
    dwMenu.autoItemWidth = autoItemWidth;
    dwMenu.autoItemHeight = autoItemHeight;

    // Save settings for next time
    var theFile = MMNotes.open(BEHAVIOR_FILE, true);
    if (theFile){
      MMNotes.set(theFile,"borderColor",G_borderColor);
      MMNotes.set(theFile,"shadowColor",G_shadowColor);
      MMNotes.set(theFile,"hiliteColor",G_hiliteColor);
      MMNotes.set(theFile,"borderSize",G_borderSize);
      MMNotes.set(theFile,"hideTimeout",G_hideTimeout);
      MMNotes.set(theFile,"textIndent",G_menuItemIndent);
      MMNotes.set(theFile,"opaqueBackground",G_showBorders);
      MMNotes.close(theFile);
    }

  T.obj.visibility = "hidden";
  T.obj.visibility = "visible";
  return true;  
}



// Called when one of the page controls calls the tabControl update function.
// Use this call to respond to user input.
function Pg3_update(theItemName) {
  with (this){
    if (theItemName == "cellWidth"){
      if (cellWidth.value.search(/[^\d]/) != -1 || parseInt(cellWidth.value) > 9999){
        cellWidth.value = G_itemWidth;
        cellWidth.focus();
        cellWidth.select();
      }else{
        G_itemWidth = parseInt(cellWidth.value);
        previewTable.innerHTML = generatePreview();
        // Prevents getLongestItem() from overriding a cell width value set
        // by the user.
        autoItemWidth = false;

        // However, if the user has chosen a width that will not 
        // accommodate the text, override anyway. (This is what Fireworks
        // does, and what the browsers do with table widths and heights.)
        var widthNeededToFit = getLongestItem(rootNodes);
        if (widthNeededToFit > G_itemWidth){
          G_itemWidth = widthNeededToFit;
        }
      }
    }
    if (theItemName == "cellHeight"){
      if (cellHeight.value.search(/[^\d]/) != -1 || parseInt(cellHeight.value) > 9999){
        cellHeight.value = G_itemHeight;
        cellHeight.focus();
        cellHeight.select();
      }else{
        G_itemHeight = parseInt(cellHeight.value);
        previewTable.innerHTML = generatePreview();
        // Prevents getItemHeight() from overriding a cell width value set
        // by the user.
        autoItemHeight = false;
        
        // However, if the user has chosen a height that will not 
        // accommodate the text, override anyway. (This is what Fireworks
        // does, and what the browsers do with table widths and heights.)
        var heightNeededToFit = getItemHeight(dwscripts.findDOMObject("menuItems").childNodes[3]);
        if (heightNeededToFit > G_itemHeight){
          G_itemHeight = heightNeededToFit;
        }
      }
    }
    if (theItemName == "cellWidthSel"){
      if (cellWidthSel.selectedIndex == 1 && cellWidth.getAttribute("disabled")){
        cellWidth.removeAttribute("disabled");
        cellWidth.value = getLongestItem(dwscripts.findDOMObject("menuItems").childNodes);
      }else{
        cellWidth.value = "";
        cellWidth.setAttribute("disabled","true");
        G_itemWidth = getLongestItem(dwscripts.findDOMObject("menuItems").childNodes);
        autoItemWidth = true;
      }
    }
    if (theItemName == "cellHeightSel"){
      if (cellHeightSel.selectedIndex == 1 && cellHeight.getAttribute("disabled")){
        cellHeight.removeAttribute("disabled");
        cellHeight.value = getItemHeight(dwscripts.findDOMObject("menuItems").childNodes[3]);
      }else{
        cellHeight.value = "";
        cellHeight.setAttribute("disabled","true");
        G_itemHeight = getItemHeight(dwscripts.findDOMObject("menuItems").childNodes[3]);
        autoItemHeight = true;
      }
    }
    if (theItemName == "cellPad"){
      if (cellPad.value.search(/[^\d]/) != -1 || parseInt(cellPad.value) > 9999){
        cellPad.value = G_menuItemPadding;
        cellPad.focus();
        cellPad.select();
      }else{
        G_menuItemPadding = parseInt(cellPad.value);
        previewTable.innerHTML = generatePreview();
      }
    }
    if (theItemName == "cellSpace"){
      if (cellSpace.value.search(/[^\d]/) != -1 || parseInt(cellSpace.value) > 9999){
        cellSpace.value = G_menuItemSpacing;
        cellSpace.focus();
        cellSpace.select();
      }else{
        G_menuItemSpacing = parseInt(cellSpace.value);
        previewTable.innerHTML = generatePreview();
      }
    }
    if (theItemName == "cellShadow"){
      G_shadowColor = cellShadow.value;
      previewTable.innerHTML = generatePreview();
    }
    if (theItemName == "cellHighlight"){
      G_hiliteColor = cellHighlight.value;
      previewTable.innerHTML = generatePreview();
    }
    if (theItemName == "showBorders"){
      G_showBorders = showBorders.checked;
      if (G_showBorders == false){
        borderWidth.value = "";
        borderWidth.setAttribute("disabled","true");
        borderColor.value = "#DEDFDE";
        borderColor.setAttribute("disabled","true");
        cellHighlight.value = "#DEDFDE";
        cellHighlight.setAttribute("disabled","true");
        cellShadow.value = "#DEDFDE";
        cellShadow.setAttribute("disabled","true");
      }else{
        if (!G_textOnly){
          G_borderSize = 0;
          borderWidth.value = G_borderSize;
          borderWidth.setAttribute("disabled","true");
          borderColor.value = "#DEDFDE";
          borderColor.setAttribute("disabled","true");
          cellHighlight.value = "#DEDFDE";
          cellHighlight.setAttribute("disabled","true");
          cellShadow.value = G_shadowColor;
        }else{
          if (borderWidth.getAttribute("disabled")){
            borderWidth.removeAttribute("disabled");
            borderWidth.value = G_borderSize;
          }
          if (borderColor.getAttribute("disabled")){
            borderColor.removeAttribute("disabled");
            borderColor.value = G_borderColor;
          }
          if (cellHighlight.getAttribute("disabled")){
            cellHighlight.removeAttribute("disabled");
            cellHighlight.value = G_hiliteColor;
          }
          if (cellShadow.getAttribute("disabled")){
            cellShadow.removeAttribute("disabled");
            cellShadow.value = G_shadowColor;
          }
        }
      }
      previewTable.innerHTML = generatePreview();
    }
    if (theItemName == "borderWidth"){
      if (borderWidth.value.search(/[^\d]/) != -1 || parseInt(borderWidth.value) > 9999){
        borderWidth.value = G_borderSize;
        borderWidth.focus();
        borderWidth.select();
      }else{
        G_borderSize = borderWidth.value;
        previewTable.innerHTML = generatePreview();
      }
    }
    if (theItemName == "borderColor"){
      G_borderColor = borderColor.value;
      previewTable.innerHTML = generatePreview();
    }
    if (theItemName == "menuDelay"){
      if (menuDelay.value.search(/[^\d]/) != -1 || parseInt(menuDelay.value) > 999999){
        menuDelay.value = G_hideTimeout;
        menuDelay.focus();
        menuDelay.select();
      }else{
        G_hideTimeout = menuDelay.value;
        previewTable.innerHTML = generatePreview();
      }
    }
    if (theItemName == "textIndent"){
      if (textIndent.value.search(/[^-\d]/) != -1 || parseInt(textIndent.value) > 9999 || parseInt(textIndent.value) < -9999){
        textIndent.value = G_menuItemIndent;
        textIndent.focus();
        textIndent.select();
      }else{
        G_menuItemIndent = textIndent.value;
      }
    }
  }
}

//***************** End of Pg3 Class ******************

//***************** Pg4 Class ******************

function Pg4(theTabLabel) {
  this.tabLabel    = theTabLabel;

  this.leftPos      = dwscripts.findDOMObject("leftPos");
  this.topPos        = dwscripts.findDOMObject("topPos");
  this.hideMenu      = dwscripts.findDOMObject("hideMenu");
  //  The four position presets are defined as image buttons in the initUI() function.
}


//***** methods *****

Pg4.prototype.getTabLabel = Pg4_getTabLabel;
Pg4.prototype.canLoad = Pg4_canLoad;
Pg4.prototype.load = Pg4_load;
Pg4.prototype.update = Pg4_update;
Pg4.prototype.unload = Pg4_unload;


function Pg4_getTabLabel() {
  return this.tabLabel;
}



//Called to check if a page can be loaded
//
function Pg4_canLoad() {
  return true;
}



//Called when the layer for this page is displayed.
// Use this call to initialize controls.
//
function Pg4_load() {
  with (this){
    leftPos.value = G_horzOffset;
    topPos.value = G_vertOffset;
    
    getSelectedPosButton(leftPos.value,topPos.value);
    
    if (G_hideOnMouseOut){
      hideMenu.checked = true;
    }

    Pg4Loaded = true;
  }
}



//Called when another page is about to be shown, or finish() is called on
// the tabControl.  Use this call to perform any finishing tasks.
function Pg4_unload() {
  // Set properties of menu object that correspond to this tab  
//  dwMenu.horzOffset = G_horzOffset;
//  dwMenu.vertOffset = G_vertOffset;
  dwMenu.hideOnMouseOut = G_hideOnMouseOut;

  T.obj.visibility = "hidden";
  T.obj.visibility = "visible";
  return true;  
}



//Called when one of the page controls calls the tabControl update function.
// Use this call to respond to user input.
function Pg4_update(theItemName) {
  with (this){
    if (theItemName == "leftPos"){
      if (leftPos.value.search(/[^-\d]/) != -1){
        leftPos.value = G_horzOffset;
        leftPos.focus();
        leftPos.select();
      }else{
        G_horzOffset = parseInt(leftPos.value);
      }
      getSelectedPosButton(leftPos.value,topPos.value);
    }
    if (theItemName == "topPos"){
      if (topPos.value.search(/[^-\d]/) != -1){
        topPos.value = G_vertOffset;
        topPos.focus();
        topPos.select();
      }else{
        G_vertOffset = parseInt(topPos.value);
      }
      getSelectedPosButton(leftPos.value,topPos.value);
    }
    if (theItemName == "default"){
      leftPos.value = getBoundsOfSelObj()[1] - 3;
      topPos.value = getBoundsOfSelObj()[3] - 3;
      GROUP_pos.select("default");
      T.update("leftPos");
      T.update("topPos");
    }
    if (theItemName == "topRight"){
      leftPos.value = getBoundsOfSelObj()[1];
      topPos.value = getBoundsOfSelObj()[2];
      GROUP_pos.select("topRight");
      T.update("leftPos");
      T.update("topPos");
    }
    if (theItemName == "above"){
      topPos.value = parseInt(getBoundsOfSelObj()[2]) - (G_menuHeight);
      leftPos.value = getBoundsOfSelObj()[0];
      GROUP_pos.select("above");
      T.update("leftPos");
      T.update("topPos");
    }
    if (theItemName == "below"){
      topPos.value = getBoundsOfSelObj()[3];
      leftPos.value = getBoundsOfSelObj()[0];
      GROUP_pos.select("below");
      T.update("leftPos");
      T.update("topPos");
    }
    if (theItemName == "hideMenu"){
      G_hideOnMouseOut = (hideMenu.checked)
    }
  }
}


//***************** End of Pg4 Class ******************

//***************** LOCAL FUNCTIONS  ******************
function learnMore(){
  dwscripts.displayDWHelp(MM.HELP_FW8PopupMenus);
}

// User was shown useFW8menus warning, but opted to
// move ahead anyway.
function continueAnyway(){
  SHOW_FW8_WARNING=false;
  helpDoc = MM.HELP_behShowPopupMenu;
  dwscripts.findDOMObject("loading").visibility = "visible";
 	dwscripts.findDOMObject("useFWInstead").visibility = "hidden";
  initUI();
}

// User clicked Don't Show Me Again when confronted with
// the useFW8menus warning. Make a note not to show the
// warning again (unless of course user selects the option
// a second time, in which the previously-made note should
// be deleted).
function dontShowAgain(bChecked){
  var theFile = MMNotes.open(BEHAVIOR_FILE, true);
  if (theFile){
    if (bChecked)
      MMNotes.set(theFile,"dontShowUseFWMsg","true");
    else
      MMNotes.remove(theFile,"dontShowUseFWMsg");
    MMNotes.close(theFile);
  }
}


function initUI(){
  var dom = dw.getDocumentDOM();
  var head = dom.getElementsByTagName('head')[0];
  var theFile = null; //MMNotes file
  var doSave = false;
  if (dom.URL != "" || head.innerHTML.indexOf('function mmLoadMenus()') != -1){
    if (dom.URL == ""){
      doSave = confirm(MSG_UNSAVED);
      if (doSave){
        dw.saveDocument(dom);
      }
    }
	
    // If the document has been saved and there's no existing pop-up
    // menu in it, let the user know that FW8 CSS menus are a better
    // way to go (unless, of course, they REALLY want to continue,
    // as indicated by the user's checking of the "Don't show me again"
    // box the first time we told them).
    if (head.innerHTML.indexOf('function mmLoadMenus()') == -1){
      theFile = MMNotes.open(BEHAVIOR_FILE, true);
      if (theFile){
        if (MMNotes.get(theFile,"dontShowUseFWMsg"))
          SHOW_FW8_WARNING = false;
        MMNotes.close(theFile);
      }
      if (SHOW_FW8_WARNING){
        	dwscripts.findDOMObject("useFWInstead").visibility = "visible";
        	helpDoc = MM.HELP_FW8PopupMenus;
      }
  	}
  	// There are existing pop-up menus in the document. Just set
  	// SHOW_FW8_WARNING to false.
  	else
  	  SHOW_FW8_WARNING = false;
  			
		// 
    if (!SHOW_FW8_WARNING){
      // Initialize buttons on Items pane; can't do in pane itself
      // because image buttons don't play nicely with tabcontrols.
      IBTN_outdent = new ImageButton("outBtn","IBTN_outdent","sSd",false);
      IBTN_indent = new ImageButton("inBtn","IBTN_indent","sSd",false);
      IBTN_up = new ImageButton("upBtn","IBTN_up","sSd",false);
      IBTN_down = new ImageButton("downBtn","IBTN_down","sSd",false);
      IBTN_del = new ImageButton("removeItem","IBTN_del","sSd",false);
      IBTN_add = new ImageButton("addItem","IBTN_add","sSd",false);

      // Initialize toggle buttons on Format pane
      IBTN_makeBold = new ImageButton("makeBold","IBTN_makeBold","sSd");
      IBTN_makeItalic = new ImageButton("makeItalic","IBTN_makeItalic","sSd");
      IBTN_left = new ImageButton("left","IBTN_left","sSd",true,true);
      IBTN_center = new ImageButton("center","IBTN_center","sSd",true,true);
      IBTN_right = new ImageButton("right","IBTN_right","sSd",true,true);
      GROUP_align = new ImageButtonGroup(IBTN_left,IBTN_center,IBTN_right);
  		
		  // Initialize push buttons on Position pane
      IBTN_bottomRight = new ImageButton("default","IBTN_bottomRight","sSd",true);
      IBTN_bottom = new ImageButton("below","IBTN_bottom","sSd",true);
      IBTN_topRight = new ImageButton("topRight","IBTN_topRight","sSd",true);
      IBTN_top = new ImageButton("above","IBTN_top","sSd",true);
      GROUP_pos = new ImageButtonGroup(IBTN_bottomRight,IBTN_bottom,IBTN_topRight,IBTN_top);
  		
      // Populate global vars with previous values, if any.
      theFile = MMNotes.open(BEHAVIOR_FILE, true);
      if (theFile){
        if (MMNotes.get(theFile,"upText"))
          G_textUpColor = MMNotes.get(theFile,"upText");
        if (MMNotes.get(theFile,"overText"))
          G_textOverColor = MMNotes.get(theFile,"overText");
        if (MMNotes.get(theFile,"upCell"))
          G_cellUpColor = MMNotes.get(theFile,"upCell");
        if (MMNotes.get(theFile,"overCell"))
          G_cellOverColor = MMNotes.get(theFile,"overCell");
        if (MMNotes.get(theFile,"fontFamily"))
          G_textFamily = MMNotes.get(theFile,"fontFamily");
        G_textBold = (MMNotes.get(theFile,"isBold") == "true")?true:false;
        G_textItalic = (MMNotes.get(theFile,"isItalic") == "true")?true:false;
        if (MMNotes.get(theFile,"horzAlign"))
          G_textAlignment = MMNotes.get(theFile,"horzAlign");
        if (MMNotes.get(theFile,"fontSize"))
          G_textSize = MMNotes.get(theFile,"fontSize");
        if (MMNotes.get(theFile,"borderColor"))
          G_borderColor = MMNotes.get(theFile,"borderColor");
        if (MMNotes.get(theFile,"shadowColor"))
          G_shadowColor = MMNotes.get(theFile,"shadowColor");
        if (MMNotes.get(theFile,"hiliteColor"))
          G_hiliteColor = MMNotes.get(theFile,"hiliteColor");
        if (MMNotes.get(theFile,"borderSize"))
          G_borderSize = MMNotes.get(theFile,"borderSize");
        if (MMNotes.get(theFile,"hideTimeout"))
          G_hideTimeout = MMNotes.get(theFile,"hideTimeout");
        if (MMNotes.get(theFile,"textIndent"))
          G_menuItemIndent = MMNotes.get(theFile,"textIndent");
        G_showBorders = (MMNotes.get(theFile,"opaqueBackground") == "true")?true:false;
        MMNotes.close(theFile);
      } 
      
      // Set position globals to default values. May be overridden
      // by values already in the document.
      G_horzOffset = getBoundsOfSelObj()[1] - 3;
      G_vertOffset = getBoundsOfSelObj()[3] - 3;
      
      var tab0 = dwscripts.findDOMObject("Tab0");
      var tab1 = dwscripts.findDOMObject("Tab1");
      var tab2 = dwscripts.findDOMObject("Tab2");
      var tab3 = dwscripts.findDOMObject("Tab3");

      //Use appropriate background & tabs for Mac OS X.
      if (dw.isOSX()) {
        dwscripts.findDOMObject("tabBgWin").src = "../../Shared/MM/Images/tabBgOSX505x410.gif";    
        var oldMulti = RegExp.multiline;
        RegExp.multiline = true;
        var pat1 = /tabBg\.gif/;
        tab0.innerHTML = tab0.innerHTML.replace(pat1, "tabBgOSX.gif");
	      tab1.innerHTML = tab1.innerHTML.replace(pat1, "tabBgOSX.gif");
	      tab2.innerHTML = tab2.innerHTML.replace(pat1, "tabBgOSX.gif");
	      tab3.innerHTML = tab3.innerHTML.replace(pat1, "tabBgOSX.gif");
        var pat2 = /tabBgSel\.gif/;
        tab0.innerHTML = tab0.innerHTML.replace(pat2, "tabBgSelOSX.gif");
	      tab1.innerHTML = tab1.innerHTML.replace(pat2, "tabBgSelOSX.gif");
	      tab2.innerHTML = tab2.innerHTML.replace(pat2, "tabBgSelOSX.gif");
	      tab3.innerHTML = tab3.innerHTML.replace(pat2, "tabBgSelOSX.gif");
	      RegExp.multiline = oldMulti;
	    var bgImage = findObject("tabBgWin");
	    bgImage.height = 400;
	    window.resizeToContents();
        // Use appropriate background & tabs for WinXP with themes  
      } else if (dw.isXPThemed()) {	
        dwscripts.findDOMObject("tabBgWin").src = "../../Shared/MM/Images/tabBgWinXP.gif";
        var oldMulti = RegExp.multiline;
        RegExp.multiline = true;
        var pat1 = /tabBg\.gif/;
        tab0.innerHTML = tab0.innerHTML.replace(pat1, "tabBgXP.gif");
	      tab1.innerHTML = tab1.innerHTML.replace(pat1, "tabBgXP.gif");
	      tab2.innerHTML = tab2.innerHTML.replace(pat1, "tabBgXP.gif");
	      tab3.innerHTML = tab3.innerHTML.replace(pat1, "tabBgXP.gif");
        var pat2 = /tabBgSel\.gif/;
        tab0.innerHTML = tab0.innerHTML.replace(pat2, "tabBgSelXP.gif");
	      tab1.innerHTML = tab1.innerHTML.replace(pat2, "tabBgSelXP.gif");
	      tab2.innerHTML = tab2.innerHTML.replace(pat2, "tabBgSelXP.gif");
	      tab3.innerHTML = tab3.innerHTML.replace(pat2, "tabBgSelXP.gif");
	      RegExp.multiline = oldMulti;
      // Use standard background  
      } else {	
        findObject("tabBgWin").src = "../../Shared/MM/Images/tabBgWin.gif";
      }

      //Initialize the TabControl.    
      T = new TabControl('Tab');
      T.addPage('Layer1', new Pg1(LABEL_Items));
      T.addPage('Layer2', new Pg2(LABEL_Format));
      T.addPage('Layer3', new Pg3(LABEL_Advanced));
      T.addPage('Layer4', new Pg4(LABEL_Position));
      T.start();
    }
  // If document is not saved, show the "you must save first"
  // pane.
  }else{
    dwscripts.findDOMObject("saveDoc").visibility = "visible";
  }
  dwscripts.findDOMObject("loading").visibility = "hidden";
}

function writeMenu(menu, menuItems, text, indent, menuName, hide) {
  var j;
  var hasSubMenus = false;
  // First, write out any submenus. 
  var ieWidth = 120;
  var curSubMenu = 1;
  for (j in menuItems) {
    var menuItem = menuItems[j];
    ieWidth = menuItem.maxTextWidth;
    if (menuItem.subMenu && menuItem.subMenu.length > 0) {
      var name = menuName + "_" + curSubMenu;
      curSubMenu++;
      menuItem.subMenuName = name;
      var theMenuItemName = menuItem.name.replace(/ /g,"&nbsp;");
      writeMenu(menu, menuItem.subMenu, theMenuItemName, indent+"  ", name, hide);
      hasSubMenus = true;
    }
  }

  text = text.replace(/ /g,"&nbsp;");
  lastMenu = menuName;
  var menuWidth = menu.menuWidth;
  if (menu.textOnly && menu.autoItemWidth) menuWidth =   ieWidth + 2*menu.textSize; // add for margins.
  var menuArgs = ',' + menuWidth + ',' + menu.menuHeight + ',"' + menu.textFamily +
'",' + menu.textSize +   ',"' + menu.textUpColor + '","' + menu.textOverColor + '","' + 
  menu.cellUpColor + '","' + menu.cellOverColor + '","' +
  menu.textAlignment + '","' + menu.vertAlignment + '",' +
  menu.menuItemPadding + ',' + menu.menuItemSpacing + ',' +
  menu.hideTimeout + ',' + menu.horzSubmenuOffset + ',' +
  menu.vertSubmenuOffset + ',' + menu.submenuRelativeToItem + ',' +
  menu.opaqueBackground + '';  
  if( text == '"root"' ) {
    menuArgs += ',' + menu.vertical + '';
  } else {
    menuArgs += ',true';
  }
  menuArgs += ',' + menu.textIndent + ',' + menu.autoItemWidth + ',' + menu.autoItemHeight + '';
  newMenuStr += indent+"window." + menuName + " = new Menu(" + text + menuArgs +");\n";

  for (j in menuItems) {
    var menuItem = menuItems[j];
    var itemName = menuItem.name.replace(/ /g,"&nbsp;");
    ieWidth = menuItem.maxTextWidth;
    if (menuItem.subMenuName) {
      newMenuStr += indent+menuName + ".addMenuItem(" + menuItem.subMenuName;
      if (menuItem.url) {
        var doLink = "\"location='" + menuItem.url + "'\"";
        if (menuItem.target) {
          doLink = "\"window.open('" + menuItem.url + "', '" + menuItem.target + "');\"";
        } 
        newMenuStr += "," + doLink;
      } 
      newMenuStr += ");\n";
    } else if (menuItem.name=='"-"') {
        newMenuStr += indent+menuName+".addMenuSeparator();\n";
    } else if (menuItem.name) {
        newMenuStr += indent+menuName+".addMenuItem(" + itemName;
      if (menuItem.url) {
        var doLink = "\"location='" + menuItem.url + "'\"";
        if (menuItem.target) {
          doLink = "\"window.open('" + menuItem.url + "', '" + menuItem.target + "');\"";
        } 
        newMenuStr += "," + doLink;
      } 
      newMenuStr += ");\n";
    }   
  }
  var theMenu = indent+" "+menuName+".";
  if (!menu.textOnly) {
    newMenuStr += theMenu + 'bgImageUp="' + menu.menuImagePath + '";\n';
    newMenuStr += theMenu + 'bgImageOver="' + menu.menuImagePath2 + '";\n';
  }
  if (menu.textBold) {
    newMenuStr += theMenu + 'fontWeight="bold";\n';
  }
  if (menu.textItalic) {
    newMenuStr += theMenu + 'fontStyle="italic";\n';
  }
  if (hide) {
    newMenuStr += theMenu + 'hideOnMouseOut=true;\n';
  } else {
    newMenuStr += theMenu + 'hideOnMouseOut=false;\n';
  }
  if (hasSubMenus) {
    newMenuStr += theMenu + 'childMenuIcon="' + G_menuArrowPath +'";\n';
  }
  if (menu.shadowColor){
      newMenuStr += theMenu + "bgColor='" + menu.shadowColor + "';\n"; // the shadow color for an item
  }

  if (menu.textOnly) {
    // these only make sense for text menus (ignored for image menus)
    newMenuStr += theMenu + "menuBorder=" + menu.borderSize + ";\n";
    newMenuStr += theMenu + "menuLiteBgColor='" + menu.hiliteColor + "';\n"; // the light color for an item
    newMenuStr += theMenu + "menuBorderBgColor='" + menu.borderColor + "';\n"; // the border color for menu
  }
}

function buildMenuItems(theParent){
  var itemArray = new Array();
  var itemList = theParent.childNodes;
  // Have to take the padding out for the maxTextWidth property -- it should just
  // be the width of the text in the cell, not of the cell itself.
  var maxWidth = getLongestItem(itemList) - (G_menuItemPadding*2);
  for (var i=0; i < itemList.length; i++){
    if (itemList[i].tagName == 'MM:TREENODE'){
      var menuItem = new Object();  
      var compoundVal =  itemList[i].getAttribute("value");
      var itemVals = compoundVal.split('|');
      menuItem.name = '"' + itemVals[0] + '"';
      menuItem.url = (itemVals[1] == " ")?"":itemVals[1];
      menuItem.target = (itemVals[2] == " ")?"":itemVals[2];
      menuItem.maxTextWidth = (autoItemWidth && G_textOnly)?maxWidth:G_itemWidth;
      menuItem.subMenu = (itemList[i].hasChildNodes())?buildMenuItems(itemList[i]):new Array(0);
      itemArray.push(menuItem);
    }
  }
  return itemArray;
}

function getItemHeight(menuItem){
  return (parseInt(G_textSize) + parseInt(G_menuItemPadding*2));
}


function getLongestItem(itemList){
  var dom = dw.getDocumentDOM();
  var itemExtents;
  var longest = 0;
  var fontWeight = (G_textBold)?'bold':'normal';
  var fontStyle = (G_textItalic)?'italic':'normal';

  for (var i=0; i < itemList.length; i++){
    if (itemList[i].tagName == 'MM:TREENODE'){
      var compoundVal =  itemList[i].getAttribute("value");
      var itemVals = compoundVal.split('|');
      itemExtents = dom.getTextExtent(itemVals[0],'font-family:' + (G_textFamily)?G_textFamily:G_sizingFont + '; font-size:' + G_textSize + 'px; font-weight:' + fontWeight + '; font-style:' + fontStyle);
      if (itemExtents[0] > longest) longest = itemExtents[0];
    }
  }
  return longest + (G_menuItemPadding*2);
}

function generatePreview(){
    var dom = dw.getDocumentDOM();
    var docPath = dom.URL.substring(0,dom.URL.lastIndexOf('/')+1);
    var fontSize = (G_textSize < 12)?G_textSize:12;
    var fontWeight = (G_textBold)?'bold':'normal';
    var fontStyle = (G_textItalic)?'italic':'normal';
    var border = 0;
    if (G_showBorders){
      if (G_borderSize < 4){
        border = G_borderSize;
      }else{
        border = 3;
      }
    }
    var tableWidth;
    var paddingForPreview = (G_menuItemPadding < 6)?G_menuItemPadding:5;
    var spacingForPreview = (G_menuItemSpacing < 6)?G_menuItemSpacing:5;

    // This is a hack to prevent the preview table from expanding
    // beyond the width of the dialog box and taking the edit
    // controls with it.
    if (G_menuImagePath && DWfile.exists(docPath + G_menuImagePath)){
      tableWidth = dw.getNaturalSize(docPath + G_menuImagePath)[0];
    }else if (G_vertical && G_itemWidth < 380){
      tableWidth = G_itemWidth;
    }else if (!G_vertical && ((G_itemWidth*4) < 350)){
      tableWidth = G_itemWidth*4;
    }else{
      tableWidth = 380;
    }
    var tableStr = "";
    var up = (G_menuImagePath)?'background = "' + docPath + G_menuImagePath + '"':'bgcolor="' + G_cellUpColor + '"';
    var over = (G_menuImagePath2)?'background="' + docPath + G_menuImagePath2 + '"':'bgcolor="' + G_cellOverColor + '"';
    
    if (G_vertical){
      tableStr = '<table width="' + tableWidth + '" border="' + border + '" cellspacing="' + spacingForPreview + '" cellpadding="' + paddingForPreview + '" bordercolor="' + G_borderColor + '">';
    tableStr += '<tr><td nowrap align="' + G_textAlignment + '" ' + up + '><font style="color:' + G_textUpColor + ';font-size:' + fontSize + 'px;font-family:' + G_textFamily + ';font-weight:' + fontWeight + ';font-style:' + fontStyle + ';font-style:' + fontStyle + '">' + shortenText(firstFourItems[0]) + '</font></td></tr>';
    tableStr += '<tr><td nowrap align="' + G_textAlignment + '" ' + over + '><font style="color:' +  G_textOverColor + ';font-size:' + fontSize + 'px;font-family:' + G_textFamily + ';font-weight:' + fontWeight + ';font-style:' + fontStyle + '">' + shortenText(firstFourItems[1]) + '</font></td></tr>';
    tableStr += '<tr><td nowrap align="' + G_textAlignment + '" ' + up + '><font style="color:' + G_textUpColor + ';font-size:' + fontSize + 'px;font-family:' + G_textFamily + ';font-weight:' + fontWeight + ';font-style:' + fontStyle + '">' + shortenText(firstFourItems[2]) + '</font></td></tr>';
    tableStr += '<tr><td nowrap align="' + G_textAlignment + '" ' + up + '><font style="color:' + G_textUpColor + ';font-size:' + fontSize + 'px;font-family:' + G_textFamily + ';font-weight:' + fontWeight + ';font-style:' + fontStyle + '">' + shortenText(firstFourItems[3]) + '</font></td></tr></table>';
  }else{
    tableStr = '<table width="' + tableWidth + '" border="' + border + '" cellpadding="' + paddingForPreview + '" cellspacing="' + spacingForPreview + ' bordercolor="' + G_borderColor + '"><tr>';
    tableStr += '<td width="' + G_itemWidth + '"nowrap align= "' + G_textAlignment + '" ' + up + '><font style="color:' + G_textUpColor + ';font-size:' + fontSize + 'px;font-family:' + G_textFamily + ';font-weight:' + fontWeight + ';font-style:' + fontStyle + ';font-style:' + fontStyle + '">' + shortenText(firstFourItems[0]) + '</font></td>';
    tableStr += '<td width="' + G_itemWidth + '"nowrap align="' + G_textAlignment + '" ' + over + '><font style="color:' +  G_textOverColor + ';font-size:' + fontSize + 'px;font-family:' + G_textFamily + ';font-weight:' + fontWeight + ';font-style:' + fontStyle + '">' + shortenText(firstFourItems[1]) + '</font></td>';
    tableStr += '<td width="' + G_itemWidth + '"nowrap align="' + G_textAlignment + '" ' + up + '><font style="color:' + G_textUpColor + ';font-size:' + fontSize + 'px;font-family:' + G_textFamily + ';font-weight:' + fontWeight + ';font-style:' + fontStyle + '">' + shortenText(firstFourItems[2]) + '</font></td>';
    tableStr += '<td width="' + G_itemWidth + '"nowrap align="' + G_textAlignment + '" ' + up + '><font style="color:' + G_textUpColor + ';font-size:' + fontSize + 'px;font-family:' + G_textFamily + ';font-weight:' + fontWeight + ';font-style:' + fontStyle + '">' + shortenText(firstFourItems[3]) + '</font></td></tr></table>';


  }
    return tableStr;
}

function getBoundsOfSelObj(){
  var dom = dw.getDocumentDOM();
  var selObj = dw.getBehaviorElement();
  var leftPos, rightPos, topPos, bottPos;
  if (!selObj) selObj = dom.getSelectedNode();
  
  if (selObj.tagName == 'IMG' || (selObj.hasChildNodes() && selObj.childNodes[0].tagName == 'IMG')){
    if (selObj.tagName != 'IMG') selObj = selObj.childNodes[0];
    leftPos = 0;
    topPos = 0;
    if (selObj.width){
      rightPos = parseInt(selObj.getAttribute("width"));
    }else if (selObj.src != undefined && selObj.src != "" && DWfile.exists(getFullPath(selObj.src))){
      rightPos = parseInt(dw.getNaturalSize(getFullPath(selObj.src))[0]);
    }else{
      rightPos = 32;
    }
        
    if (selObj.height){
      bottPos = parseInt(selObj.getAttribute("height"));
    }else if (selObj.src != undefined && selObj.src != "" && DWfile.exists(getFullPath(selObj.src))){
      bottPos = parseInt(dw.getNaturalSize(getFullPath(selObj.src))[1]);
    }else{
      bottPos = 32;
    }
    
  }else if (selObj.tagName == 'AREA'){
    var shape = selObj.getAttribute("shape").toLowerCase();
    var allCoords = dw.getTokens(selObj.getAttribute("coords")," ,");
    var xCoords = new Array();
    var yCoords = new Array();
    if (shape == "poly" || shape == "rect"){
      for (var c=0; c < allCoords.length; c++){
        if ((c & 1)){
          yCoords.push(allCoords[c]);
        }else{
          xCoords.push(allCoords[c]);
        }
      }
    }else{
      xCoords.push(parseInt(allCoords[0]) + parseInt(allCoords[2]));
      xCoords.push(parseInt(allCoords[0]) - parseInt(allCoords[2]));
      yCoords.push(parseInt(allCoords[1]) + parseInt(allCoords[2]));
      yCoords.push(parseInt(allCoords[1]) - parseInt(allCoords[2]));
    }
    xCoords.sort(numSort);
    yCoords.sort(numSort);

    leftPos = parseInt(xCoords[0]);
    rightPos = parseInt(xCoords[xCoords.length-1]);
    topPos = parseInt(yCoords[0]);
    bottPos = parseInt(yCoords[yCoords.length-1]);
  // If the selObj is a text link
  }else{
    while (selObj.hasChildNodes() && selObj.childNodes[0].nodeType != Node.TEXT_NODE){
      selObj = selObj.childNodes[0];
    }
    var textStr = selObj.innerHTML;
    var styleObj = dom.getCSSStyleProperties();
    var fontFamily = (styleObj.fontFamily != undefined)?styleObj.fontFamily:"";
    var fontSize = (styleObj.fontSize != undefined)?styleObj.fontSize:"";
    var fontWeight = (styleObj.fontWeight != undefined)?styleObj.fontWeight:"normal";
    var fontStyle = (styleObj.fontStyle != undefined)?styleObj.fontStyle:"normal";
    var itemExtents = dom.getTextExtent(textStr,'font-family:' + fontFamily + '; font-size:' + fontSize + '; font-weight:' + fontWeight + '; font-style:' + fontStyle);
    leftPos = 0;
    topPos = 0;
    rightPos = parseInt(itemExtents[0]);
    bottPos = parseInt(itemExtents[1]);
  }
  return new Array(leftPos,rightPos,topPos,bottPos);
}

function numSort(a,b){
  return a - b;
}

function browseForURL(){
  var urlField = dwscripts.findDOMObject('itemURL');
  var url = dw.browseForFileURL('select');
  if (url != ""){
    urlField.value = url;
    urlField.focus();
    urlField.select();
  }
}

// Takes a text string and shortens it to fit in the preview area.
// Prevents preview area from stretching beyond bounds of dialog box.
function shortenText(textStr){
  var dom = dw.getDocumentDOM();
  var fontWeight = (G_textBold)?'bold':'normal';
  var fontStyle = (G_textItalic)?'italic':'normal';
  var fontSize = (G_textSize < 12)?G_textSize:12;
  var itemExtents = dom.getTextExtent(textStr,'font-family:' + G_textFamily + '; font-size:' + fontSize + 'px; font-weight:' + fontWeight + '; font-style:' + fontStyle);
  var maxWidth = (G_vertical)?370:80;
  
  while (itemExtents[0] > maxWidth){
    textStr = textStr.substring(0,textStr.length-2);
    itemExtents = dom.getTextExtent(textStr,'font-family:' + G_textFamily + '; font-size:' + fontSize + 'px; font-weight:' + fontWeight + '; font-style:' + fontStyle);
  }
  return textStr;
}

function enableButtons(selNode,menuTree){
  // Enable the minus button, then enable or disable the 
  // rest of the buttons based on the selection
  IBTN_del.enable();

  // If the parent of the selected node is not another treenode,
  // disable the Outdent button.
  if (selNode.parentNode.tagName != "MM:TREENODE"){
    IBTN_outdent.disable();
  }else{
    IBTN_outdent.enable();
  }
  // If the parent of the selected node *is* another
  // treenode
  if (selNode.parentNode.tagName == "MM:TREENODE"){
    for (var y=0; y < menuTree.treeNodes.length; y++){
      // If the node above the selected node is its
      // parent, disable the Indent and Up buttons.
      if (menuTree.treeNodes[y] == selNode && menuTree.treeNodes[y-1] == selNode.parentNode){
        IBTN_indent.disable();
        IBTN_up.disable();
        break;
      }else{
        IBTN_indent.enable();
        IBTN_up.enable();
      }  
    }
  // If this is a top-level node, but not the first node
  // in the tree, enable the Indent and Up buttons.
  }else if (selNode != menuTree.treeNodes[0]){
    IBTN_indent.enable();
    IBTN_up.enable();
  // In all other cases, disable the Indent and Up buttons.
  }else{
    IBTN_indent.disable();
    IBTN_up.disable();
  }    
  // If the selected node is the last one in the tree, or if
  // it's the last node at this level, disable the down button.
  if (selNode == menuTree.treeNodes[menuTree.treeNodes.length-1] || selNode == selNode.parentNode.childNodes[selNode.parentNode.childNodes.length-1]){
    IBTN_down.disable();
  }else{
    IBTN_down.enable();        
  }
}

function padNumber(theNum){
  var paddedNum = "";
  if( theNum < 10 ) paddedNum += '0';
  paddedNum += theNum;
  return paddedNum;
}

function dateToUniqueID(theDate) {
  var uniqueID = "";
  uniqueID +=  "" + padNumber(theDate.getMonth()+1)  + padNumber(theDate.getDate()) + padNumber(theDate.getHours()) + padNumber(theDate.getMinutes()) + padNumber(theDate.getSeconds());
  return uniqueID;
}

function buildFontArrays(bEdit){
  if (bEdit){
    dw.editFontList();
  }
  FONTS = dw.getFontList();
  // Null out name and value arrays to prevent duplicate entries
  FONT_NAMES.length = 0;
  FONT_VALUES.length = 0;
  FONT_NAMES.push(DEFAULT_FONT);
  FONT_VALUES.push("");
  for (var f=0; f < FONTS.length; f++){
    FONT_NAMES.push(FONTS[f]);
    FONT_VALUES.push(FONTS[f]);
  }
  FONT_NAMES.push(EDIT_FONT_LIST);
  FONT_VALUES.push("editFontList");
}

function getSelectedPosButton(leftPos,topPos){
  if (leftPos == getBoundsOfSelObj()[1] - 3 && topPos == getBoundsOfSelObj()[3] - 3){
    GROUP_pos.select("default");
  }

  else if (leftPos == getBoundsOfSelObj()[1] && topPos == getBoundsOfSelObj()[2]){
    GROUP_pos.select("topRight");
  }
    
  else if (leftPos == getBoundsOfSelObj()[0] && (topPos == parseInt(getBoundsOfSelObj()[2]) - (G_menuHeight))){
    GROUP_pos.select("above");
  }

  else if (leftPos == getBoundsOfSelObj()[0] && topPos == getBoundsOfSelObj()[3]){
    GROUP_pos.select("below");
  }
}

