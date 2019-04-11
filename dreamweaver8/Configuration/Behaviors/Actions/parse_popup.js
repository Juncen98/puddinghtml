// Copyright 2001, 2002, 2003, 2004 Macromedia, Inc. All rights reserved.
function parseLoadMenus(whichMenu){
  menuId = whichMenu.match(/mm_menu_\d+_\d+/);
  
  // Set a variable for storing menu item names after they've had their
  // &nbsp;s replaced. Used down below when we start stuffing labels into
  // the menuStructure array.
  var spaceReplaced;
  
  // Get the DOM of the current document
  var dom = dw.getDocumentDOM();
  
  // Get the contents of the HEAD
  var docEl = dom.documentElement;
  var headTags = docEl.getElementsByTagName("head");
  var headCont = (headTags.length > 0) ? headTags[0].innerHTML : "";

  // Look for the mmLoadMenus() function. 
  var startFn = headCont.indexOf('function mmLoadMenus()');
  if (startFn != -1){
    var endFn = headCont.indexOf('// mmLoadMenus()')+16;
    var fnStr = headCont.substring(startFn,endFn);

    // Find the current menu within mmLoadMenus()
    var numRegExp = new RegExp('(window\\.)?(mm_menu_\\d+_\\d+)[^\\)]','g')
    var numResult;
    while ((numResult = numRegExp.exec(fnStr)) != null){
      if (numResult[2] == menuId && !startThisMenu){
        var startThisMenu = numRegExp.lastIndex - (numResult[0].length);
        menuFound = true;
      }else if (numResult[2] != menuId && startThisMenu){
        var endThisMenu = numRegExp.lastIndex - (numResult[0].length);
        break;
      }
    }

    if (startThisMenu && !endThisMenu){
      var endThisMenu = endFn;
    }
    if (startThisMenu && endThisMenu){
      BEFORE_ThisMenu = fnStr.substring(0,startThisMenu);
      AFTER_ThisMenu = fnStr.substring(endThisMenu);
    }
    
    // If the menu was created with Images, find & save the
    // references to them.
    var upRegExp = new RegExp(menuId + '\\.bgImageUp\\s*=\\s*"([^"]*)";');
    var imgResult = upRegExp.exec(fnStr);
    if (imgResult){
      G_menuImagePath = imgResult[1];
      G_textOnly = false;
    }
    
    var overRegExp = new RegExp(menuId + '\\.bgImageOver\\s*=\\s*"([^"]*)";');
    imgResult = overRegExp.exec(fnStr);
    if (imgResult){
      G_menuImagePath2 = imgResult[1];
    }
    
    var setting = null;
    
    // Get the settings that are stored as properties of the
    // menu object
    setting = new RegExp(menuId + "\\.hideOnMouseOut\\s*=\\s*([^;]*);").exec(fnStr);
    G_hideOnMouseOut = (setting && setting[1] == 'false')?false:true;
    setting = null;
    
    setting = new RegExp(menuId + "\\.menuBorder\\s*=\\s*([^;]*);").exec(fnStr);
    G_borderSize = (setting)?setting[1]:"1";
    setting = null;
    
    setting = new RegExp(menuId + "\\.menuLiteBgColor\\s*=\\s*'([^']*)';").exec(fnStr);
    G_hiliteColor = (setting)?setting[1]:"#FFFFFF";
    setting = null;

    setting = new RegExp(menuId + "\\.bgColor\\s*=\\s*'([^']*)';").exec(fnStr);
    G_shadowColor = (setting)?setting[1]:"#555555";
    setting = null;
    
    setting = new RegExp(menuId + "\\.menuBorderBgColor\\s*=\\s*'([^']*)';").exec(fnStr);
    G_borderColor = (setting)?setting[1]:"#777777";
    setting = null;
        
    setting = new RegExp(menuId + '\\.fontWeight\\s*=\\s*"bold";').exec(fnStr);
    G_textBold = (setting)?true:false;
    setting = null;

    setting = new RegExp(menuId + '\\.fontStyle\\s*=\\s*"italic";').exec(fnStr);
    G_textItalic = (setting)?true:false;
    setting = null;

    setting = new RegExp(menuId + '\\.childMenuIcon\\s*=\\s*"([^"]*)";').exec(fnStr);
    G_menuArrowPath = (setting)?setting[1]:"arrows.gif";
    setting = null;

    // Variables used in for loop
    var menuRegExp, itemRegExp;
    var menuResult, itemResult;
    var menus = new Array();
    var menuItems = new Array();
    
    // Array for storing the menu structure
    var menuStructure = new Array();
    
    // If menus also have URLs, the URLs are stored in a 
    // separate statement from the one that creates the menus.
    // Create an array for storing these "extra" URLs, so that
    // we can stuff them in the menuStructure array at the 
    // appropriate points later.
    var extraURLs = new Array();
    
    // Variables for storing regular expression matches.
    var matchStr;
    var matchStr2;
    var subMatch1;
    var subMatch2;
    var subMatch3;
    var subMatch4;
        
    // Find the root menu and all the menu items associated
    // with this menuId.

      // To keep us from going over the regexp recursion limit, we have to break
      // up what would otherwise be an incredibly long regexp limit. We'll use
      // the following variables to help us out.
      var endConstructor;
      var argSubstr = "";
      var argRegExp;
      var menuArgs = null;    

    menuRegExp = new RegExp(menuId + '(_\\d)* = new Menu\\(','g');

    while ((menuResult = menuRegExp.exec(fnStr)) != null){
      endConstructor = getConstructorEnd(fnStr,menuRegExp.lastIndex);
      if (endConstructor > menuRegExp.lastIndex){
        argSubstr = fnStr.substring(menuRegExp.lastIndex,endConstructor);
        argRegExp = new RegExp('"[^"]*",\\d+,\\d+,"[^"]*",\\d+,"[^"]*","[^"]*","[^"]*","[^"]*","[^"]*","[^"]*",\\d+,\\d+,\\d+,-?\\d+,-?\\d+,\\w+,\\w+,\\w+,-?\\d+,\\w+,\\w+');
        menuArgs = argSubstr.match(argRegExp);
        if (menuArgs){
          menuResult = menuResult[0] + menuArgs[0] + ');' 
          menus.push(menuResult);
        }
      }
      endConstructor = -1;
      argSubstr = "";
      argRegExp = null;
      menuArgs = null;
    }

//    itemRegExp = new RegExp(menuId + '(_\\d+)*\\.addMenuItem\\(((mm_menu_\\d+(_\\d+)*)|("[^"]*"))(,"[^"]*")?\\);','g');
    itemRegExp = new RegExp(menuId + '(_\\d)*\\.addMenuItem\\(((mm_menu_\\d+(_\\d)*)|("[^"]*"))(,"[^"]*")?\\);','g');
    while ((itemResult = itemRegExp.exec(fnStr)) != null){
      menuItems.push(itemResult[0]);
    }

    // Loop through the items in the menus array.
    for (var i=0; i < menus.length; i++){
    
      // Match various substrings in the menu creation string
//      matchStr = menus[i].match(/(mm_menu_(\d+_\d+)(_\d)*) = new Menu\("([^"]*)",(\d+),(\d+),"([^"]*)",(\d+),"([^"]*)","([^"]*)","([^"]*)","([^"]*)","([^"]*)","([^"]*)",(\d+),(\d+),(\d+),([-\d]+),([-\d]+),([^,]*),([^,]*),([^,]*),(\d+)\);/);

        // The JS1.5 regexp engine is choking on the long match string,
        // so I've broken it out into one main match and four submatches.
        matchStr = menus[i].match(/(mm_menu_(\d+_\d+)(_\d)*) = new Menu\("([^"]*)"/);
        
        
      // If this is the "root" menu, extract the font, size, and
      // color information
      if ((matchStr[1] == menuId) && (matchStr[4] == 'root')){
      
        subMatch1 = menus[i].match(/(\d+),(\d+),"([^"]*)",(\d+)/);
        subMatch2 = menus[i].match(/"([^"]*)","([^"]*)","([^"]*)","([^"]*)","([^"]*)","([^"]*)"/);
        subMatch3 = menus[i].match(/(\d+),(\d+),(-?\d+),(-?\d+),(-?\d+)/);
        subMatch4 = menus[i].match(/(true|false),(true|false),(true|false),(-?\d+),(true|false),(true|false)/);
				
        // First determine whether the user set the width and height manually
        autoItemWidth = (subMatch4[5] == 'true')?true:false;
        autoItemHeight = (subMatch4[6] == 'true')?true:false;
        
	      // If the menu is textOnly, can't just take the itemWidth value; 
        // have to subtract out the "margins" that writeMenus() added.
        if (G_textOnly && autoItemWidth){
          G_itemWidth = parseInt(subMatch1[1]) - (parseInt(subMatch1[4])*2);
        }else{
          G_itemWidth = parseInt(subMatch1[1]);
        }
        G_itemHeight = parseInt(subMatch1[2]);
        G_textFamily = subMatch1[3];
        G_textSize = subMatch1[4];
        G_textUpColor = subMatch2[1];
        G_textOverColor = subMatch2[2];
        G_cellUpColor = subMatch2[3];
        G_cellOverColor = subMatch2[4];
        G_textAlignment = subMatch2[5];
        G_vertAlignment = subMatch2[6];
        G_menuItemPadding = subMatch3[1];
        G_menuItemSpacing = subMatch3[2];
        G_hideTimeout = subMatch3[3];
        G_horzSubmenuOffset = subMatch3[4];
        G_vertSubmenuOffset = subMatch3[5];
        G_submenuRelativeToItem = (subMatch4[1] == 'true')?true:false;
        G_showBorders = (subMatch4[2] == 'true')?true:false;
        G_vertical = (subMatch4[3] == 'true')?true:false;
        G_menuItemIndent = subMatch4[4];  
        
/*  
    // This code goes with the long regExp; if we can ever get it
    // working, we should junk the above and uncomment this.          
        G_itemWidth = parseInt(matchStr[5]) - (parseInt(matchStr[8])*2);
        G_itemHeight = parseInt(matchStr[6]);
        G_textFamily = matchStr[7];
        G_textSize = matchStr[8];
        G_textUpColor = matchStr[9];
        G_textOverColor = matchStr[10];
        G_cellUpColor = matchStr[11];
        G_cellOverColor = matchStr[12];
        G_textAlignment = matchStr[13];
        G_vertAlignment = matchStr[14];
        G_menuItemPadding = matchStr[15];
        G_menuItemSpacing = matchStr[16];
        G_hideTimeout = matchStr[17];
        G_horzSubmenuOffset = matchStr[18];
        G_vertSubmenuOffset = matchStr[19];
        G_submenuRelativeToItem = (matchStr[20] == 'true')?true:false;
        G_showBorders = (matchStr[21] == 'true')?true:false;
        G_vertical = (matchStr[22] == 'true')?true:false;
        G_menuItemIndent = matchStr[23];
*/        
        
      // If this is not the "root" menu, grab the item's 
      // id and its label, and stuff them into the menuStructure
      // array. Also stuff two strings containing a space into 
      // the array; if no URL or target is associated with the menu, 
      // these entries will stay spaces. If a URL or target 
      // *is* associated with the menu, we'll put
      // them here later.
      }else{ 
        menuStructure.push(matchStr[1]);
        if (matchStr[4] == ""){
          menuStructure.push(" ");
        }else{
          spaceReplaced = matchStr[4].replace(/&nbsp;/g," ");
          menuStructure.push(spaceReplaced);
        }
        menuStructure.push(" ");
        menuStructure.push(" ");
      }

      // Now loop through the items in the menuItems array
      for (var j=0; j < menuItems.length; j++){
        // Match various substrings in the menu item creation string
//        matchStr2 = menuItems[j].match(/(mm_menu_(\d+_\d+)(_\d+)*)\.addMenuItem\(((mm_menu_\d+_\d+(_\d+)*)|("([^"]*)"))(,"([^"]*)")?\);/);
        matchStr2 = menuItems[j].match(/(mm_menu_(\d+_\d+)(_\d)*)\.addMenuItem\(((mm_menu_\d+_\d+(_\d)*)|("([^"]*)"))(,"([^"]*)")?\);/);


        // If any match was found
        if (matchStr2){ 
          // If the menu item's id matches the menu's id, 
          // stuff the item's label and URL into the menuStructure array.
          // If the item has a target, push that; if not, push a space.
          if (matchStr[1] == matchStr2[1]){
            var locTokens = (matchStr2.length >=10)?matchStr2[10].match(/(location='|window.open\(')([^']*)'(, ')?(([^']*)')?/):null;
            menuStructure.push(matchStr2[1]);
            // grab the label (which should be at position 8)
            if (matchStr2[8]){
              spaceReplaced = matchStr2[8].replace(/&nbsp;/g," ");
              menuStructure.push(spaceReplaced);
            // I don't think this branch is used any more, but leaving it in just in case
            }else{
              menuStructure.push(matchStr2[5]);
            }
            
            // if locTokens were found, push the values (location and target)
            // into the menuStructure array. if either location or target wasn't found,
            // push a space placeholder. note: we must convert ampersands to their
            // entity values on the way in (here) to prevent URL parameters from getting
            // garbled on the way out.
            if (locTokens && locTokens.length > 0){
              menuStructure.push(locTokens[2].replace(/\&/,'&amp;'));
            }else{
              menuStructure.push(" ");
            }
            if (locTokens && locTokens.length > 3){
              menuStructure.push(locTokens[5].replace(/\&/,'&amp;'));
            }else{
              menuStructure.push(" ");
            }
          }
        }
      }
    }
  }else{
    var menuStructure = new Array(0);
  }
  return menuStructure;
}

function buildTrees(menuStructure,menuName,submenuURL,submenuTarget){
  var treeStr = '';
  var strMatch;
  var prevId;
  for (var i=0; i < menuStructure.length; i=i+4){
    // find the first item that has the same name as the menuName (that is, the
    // root menu)
    if (menuStructure[i] == menuName){
      // if the first item in the root menu is a submenu, call buildTrees
      // to build the submenu.
//      if ((strMatch = menuStructure[i+1].match(/mm_menu_\d+_\d+(_\d+)*/)) != null){
      if ((strMatch = menuStructure[i+1].match(/mm_menu_\d+_\d+(_\d)*/)) != null){
        treeStr += buildTrees(menuStructure,strMatch[0],menuStructure[i+2],menuStructure[i+3]);
        treeStr += '</mm:treenode>\n';
        prevId = null;
      }else{
        if (prevId){
          treeStr += '<mm:treenode value="' + menuStructure[i+1] + '|' + menuStructure[i+2] + '|' + menuStructure[i+3] + '" state="expanded"></mm:treenode>\n';
        }else{
          // this is the first menu item. if its URL is blank, set it to the URL passed to 
          // the function as an argument, if there is one. (it's possible that the user
          // opted to create a menu with no URLs.)
          if (menuStructure[i+2] == " "){
            if (!submenuURL){
              submenuURL = " ";
              submenuTarget = " ";
              treeStr += '<mm:treenode value="' + menuStructure[i+1] + '|' + submenuURL + '|' + submenuTarget + '" state="expanded"></mm:treenode>\n';
            }else{
              treeStr += '<mm:treenode value="' + menuStructure[i+1] + '|' + submenuURL + '|' + submenuTarget + '" state="expanded">\n';
            }
          }else{
            treeStr += '<mm:treenode value="' + menuStructure[i+1] + '|' + menuStructure[i+2] + '|' + menuStructure[i+3] + '" state="expanded"></mm:treenode>\n';
          }
          prevId = menuStructure[i];
        }
      }
    }
  }
  treeStr += (treeStr.substring(treeStr.length-15) == '</mm:treenode>\n')?'':'</mm:treenode>';
  return treeStr;
}

// Helper function that finds the end of the "new Menu()" constructor.
// (Allows for the fact that there might be parentheses within the arguments.)
function getConstructorEnd(str,start){
  var nesting = 1;
  var end = start;
  for (var i = start; nesting != 0 && i < str.length; i++){
    if (str[i] == '(')
      nesting++;
    else if (str[i] == ')'){
      nesting--;
      end = i;
    }
  }
  return end;  
}
