// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

// This file contains classes and functions for working
//  with Navigation Bars
//

/*------------------------------------------------------------------*/

//This class represents a navigation bar
//
function NavBar(theSourceDoc, theGroupName) {
  //properties
  this.sourceDoc = theSourceDoc;

  this.groupName = (theGroupName) ? theGroupName : 'group1';
  this.isHorizontal = true;
  this.useTable = true;

  this.elemList = new Array();
  
  this.orderChanged = false;
  
  this.preloadDelList = new Array();
}

//methods
NavBar.prototype.getObjectTag     = NavBar_getObjectTag;
NavBar.prototype.getElemObjectTag = NavBar_getElemObjectTag;
NavBar.prototype.setFromDocument  = NavBar_setFromDocument;
NavBar.prototype.getElemTagList   = NavBar_getElemTagList;
NavBar.prototype.getMapFromImage  = NavBar_getMapFromImage;
NavBar.prototype.updateDocument   = NavBar_updateDocument;

NavBar.prototype.getViewNames = NavBar_getViewNames;
NavBar.prototype.getElem      = NavBar_getElem;
NavBar.prototype.addElem      = NavBar_addElem;
NavBar.prototype.removeElem   = NavBar_removeElem;
NavBar.prototype.moveElemUp   = NavBar_moveElemUp;
NavBar.prototype.moveElemDown = NavBar_moveElemDown;
NavBar.prototype.isComplete   = NavBar_isComplete;

//static properties
NavBar.HorizElem = "%s";
NavBar.VertElem = "%s<br>";
NavBar.HorizTable = "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\"><tr>%s</tr></table>";
NavBar.HorizTableElem = "<td>%s</td>";
NavBar.VertTable = "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\">%s</table>";
NavBar.VertTableElem = "<tr><td>%s</td></tr>";

//static methods


//Returns the HTML for the navigation bar
//
function NavBar_getObjectTag() {
  var retVal = '';
  with (this) {
    for (var i=0; i < elemList.length; i++)
      retVal += getElemObjectTag(elemList[i].getObjectTag());
    if (useTable && isHorizontal) {
      retVal = NavBar.HorizTable.replace(/%s/, retVal);
    } else if (useTable && !isHorizontal) {
      retVal = NavBar.VertTable.replace(/%s/, retVal);
  } }
  return retVal;
}


//Returns the object tag for an element
//
function NavBar_getElemObjectTag(elemTag) {
  var retVal = '';
  with (this) {
    if (useTable && isHorizontal) {
      retVal += NavBar.HorizTableElem.replace(/%s/, elemTag);
    } else if (useTable && !isHorizontal) {
      retVal += NavBar.VertTableElem.replace(/%s/, elemTag);
    } else if (!useTable && isHorizontal) {
      retVal += NavBar.HorizElem.replace(/%s/, elemTag);
    } else if (!useTable && !isHorizontal) {
      retVal += NavBar.VertElem.replace(/%s/, elemTag);
  } }
  return retVal;
}


//Searches the page for nav bar elements and adds them to the list.
//
function NavBar_setFromDocument() {
  var index, retVal = false;
  var objList = this.getElemTagList();
  for (var i=0; i < objList.length; i++) {
    index = this.addElem();
    this.elemList[index].parseObjectTag(objList[i]);
    retVal = true;
  }
  this.orderChanged = false;
  return retVal;
}


//Returns the list of nav bar elements on the page
//
function NavBar_getElemTagList() {
  var map, retVal = new Array();
  var docDOM = dw.getDocumentDOM(this.sourceDoc);
  
  // get the list of images, and then find behaviors
  var imgList = docDOM.getElementsByTagName("IMG");
  for (var i=0; i < imgList.length; i++) {
    if (imgList[i].parentNode.tagName == "A") {
      if (NavBarElem.isValidTag(imgList[i].parentNode))
        retVal.push(imgList[i].parentNode);
    } else {
      map = this.getMapFromImage(imgList[i]);
      if (map && NavBarElem.isValidTag(map)) {
        areaList = map.getElementsByTagName("AREA");
        for (var j=0; j < areaList.length; j++) {
          if (NavBarElem.isValidTag(areaList[j]))
            retVal.push(areaList[j]);
  } } } }
  return retVal;
}

function NavBar_getMapFromImage(image) {
  var retVal = '';
  var docDOM = dw.getDocumentDOM(this.sourceDoc);
  if (image.usemap != null) {
    mapList = docDOM.getElementsByTagName("MAP");
    for (var i=0; !retVal && i < mapList.length; i++) {
      if ("#" + mapList[i].name == image.usemap) 
        retVal = mapList[i];
  } }
  return retVal;
}


//Updates the nav bar on the page
//
function NavBar_updateDocument() {
  var tdObj, trObj, tableObj, tdList, parentObj;
  var tagList, theObj, lastObj = '';
  var imgElems, insertList, reGetLastObj;
  var docDOM = dw.getDocumentDOM(this.sourceDoc);
  with (this) {
    
    // update elements and store the original tag string
    for (var i=0; i < elemList.length; i++) {
      if (elemList[i].tagObj) {
        elemList[i].updateObjectTag();
        elemList[i].origTag = elemList[i].moveObj.outerHTML;
      } else {
        elemList[i].origTag = elemList[i].getObjectTag();
      }
    }
    
    if (orderChanged) {

      tagList = this.getElemTagList();

      for (var i=0; i < tagList.length; i++) {

        // set theObj
        theObj = '';
        if (tagList[i].tagName == "AREA") {
          mapName = "#" + tagList[i].parentNode.name;
          imgElems = docDOM.getElementsByTagName("IMG");
          for (var j=0; !theObj && j < imgElems.length; j++) {
            if (imgElems[j].usemap == mapName) theObj = imgElems[j];
          }
        } else {
          theObj = tagList[i];
        }

        // Set isHorizontal, useTable, and lastObj
        isHorizontal = true;
        useTable = false;
        lastObj = theObj;
        tdObj = lastObj.parentNode;
        if (tdObj.tagName == "TD" && tdObj.childNodes.length == 1) {
          trObj = tdObj.parentNode;
          tableObj = trObj.parentNode;
          if (trObj.tagName == "TR" && tableObj.tagName == "TABLE") {
            useTable = true;
            tdList = trObj.getElementsByTagName("TD");
            if (tdList && tdList.length == 1)
              isHorizontal = false;
        } }
        if (!useTable) {
          parentObj = lastObj.parentNode;
          for (var j=0; j < parentObj.childNodes.length-1; j++) {
            if (parentObj.childNodes[j] == lastObj &&
                parentObj.childNodes[j+1].nodeType == Node.ELEMENT_NODE &&
                parentObj.childNodes[j+1].tagName == "BR") {
              isHorizontal = false;
              lastObj = parentObj.childNodes[j+1];
        } } }

        // update elements
        if (i < elemList.length) {
          reGetLastObj = (theObj == lastObj);
          theObj.outerHTML = "<NAVBARELEM>";
        }

        // remove elements
        if (i >= elemList.length) {
          if (useTable) {
            if (isHorizontal)
              tdObj.outerHTML = '';
            else
              trObj.outerHTML = '';
          } else {
            theObj.outerHTML = '';
            if (!isHorizontal)
              lastObj.outerHTML = '';
        } } 
      }

      // insert elements
      if (elemList.length > tagList.length) {
        newTag = '';
        for (var i=tagList.length; i < elemList.length; i++)
          newTag += getElemObjectTag("<NAVBARELEM>");

        if (useTable) {
          if (isHorizontal)
            trObj.innerHTML = trObj.innerHTML + newTag;
          else
            tableObj.innerHTML = tableObj.innerHTML + newTag;
        } else {
          if (reGetLastObj) {
            insertList = docDOM.getElementsByTagName("NAVBARELEM");
            lastObj = insertList[insertList.length-1];
          }
          lastObj.outerHTML += newTag;
        }
      }

      // re-insert the nav bar elements
      var insertList = docDOM.getElementsByTagName("NAVBARELEM");
      for (var i=0; i < elemList.length && i < insertList.length; i++) {
        insertList[i].outerHTML = elemList[i].origTag;
      }

      // add new preloads
      for (var i=0; i < elemList.length; i++) {
        if (!elemList[i].tagObj) elemList[i].updatePreloads();
      }

      // remove deleted preloads
      if (preloadDelList.length > 0)
        preloadUpdate("", preloadDelList, 0);
    }
  }
}


function NavBar_getViewNames() {
  var retVal = new Array();
  for (var i=0; i < this.elemList.length; i++)
    retVal.push(this.elemList[i].getViewName());
  return retVal;
}


function NavBar_getElem(elemIndex) {
  return this.elemList[elemIndex];
}


function NavBar_addElem(afterIndex, newElem) {
  var retVal = -1;
  afterIndex = (afterIndex != null) ? afterIndex : this.elemList.length-1;
  if (this.elemList.length == 0 ||
      (afterIndex >= -1 && afterIndex < this.elemList.length)) {
    this.orderChanged = true;
    newElem = (newElem) ? newElem : new NavBarElem(this.sourceDoc, this.groupName, this);
    if (this.elemList.length == 0) {
      this.elemList.push(newElem);
      retVal = 0;
    } else {
      this.elemList.splice(afterIndex+1, 0, newElem);
      retVal = afterIndex + 1;
  } }
  return retVal;
}

function NavBar_removeElem(elemIndex, ignorePreloads) {
  var retVal = false;
  if (elemIndex >= 0 && elemIndex < this.elemList.length) {
    this.orderChanged = true;
    if (!ignorePreloads)
      this.preloadDelList = this.preloadDelList.concat(this.elemList[elemIndex].preloadOrigList);
    this.elemList.splice(elemIndex, 1);
    retVal = true;
  }
  return retVal;
}

function NavBar_moveElemUp(elemIndex) {
  var moveElem, retVal = -1;
  if (elemIndex >= 1 && elemIndex < this.elemList.length) {
    this.orderChanged = true;
    moveElem = this.elemList[elemIndex];
    if (this.removeElem(elemIndex, true))
      retVal = this.addElem(elemIndex - 2, moveElem);
  }
  return retVal;
}

function NavBar_moveElemDown(elemIndex) {
  var moveElem, retVal = -1;
  if (elemIndex >= 0 && elemIndex < this.elemList.length - 1) {
    this.orderChanged = true;
    moveElem = this.elemList[elemIndex];
    if (this.removeElem(elemIndex), true)
      retVal = this.addElem(elemIndex, moveElem);
  }
  return retVal;
}

function NavBar_isComplete() {
  retVal = true;
  for (var i=0; retVal && i < this.elemList.length; i++) {
    retVal = this.elemList[i].isComplete();
  }
  return retVal;
}




/*------------------------------------------------------------------*/

//This class represents a navigation bar button
//
function NavBarElem(theSourceDoc, theGroupName, theParent) {
  //properties
  this.sourceDoc = theSourceDoc;
  this.groupName = theGroupName;
  this.parent = theParent;

  this.imgName = this.getUniqueName(LABEL_unnamed, true);
  this.nameAutoSet = true;
  this.upImg = '';
  this.overImg = '';
  this.downImg = '';
  this.overDownImg = '';
  this.URL = '';
  this.altText = '';
  this.targetWindow = '_top';
  this.preloadImages = true;
  this.preloadOrigId = '';
  this.preloadOrigList = new Array();
  this.isDown = false;

  this.overImages = new Array();
  this.downImages = new Array();

  this.tagObj = '';  // the tag object of an existing element
  this.moveObj = '';  // the image tag or anchor tag object
}

//methods
NavBarElem.prototype.getObjectTag    = NavBarElem_getObjectTag;
NavBarElem.prototype.updateObjectTag = NavBarElem_updateObjectTag;
NavBarElem.prototype.updatePreloads  = NavBarElem_updatePreloads;
NavBarElem.prototype.parseObjectTag  = NavBarElem_parseObjectTag;

NavBarElem.prototype.getATag = NavBarElem_getATag;
NavBarElem.prototype.getOnLoadCall = NavBarElem_getOnLoadCall;
NavBarElem.prototype.getOnClickCall = NavBarElem_getOnClickCall;
NavBarElem.prototype.getOnMouseOverCall = NavBarElem_getOnMouseOverCall;
NavBarElem.prototype.getOnMouseOutCall = NavBarElem_getOnMouseOutCall;
NavBarElem.prototype.getNBCall = NavBarElem_getNBCall;
NavBarElem.prototype.insertNBCall = NavBarElem_insertNBCall;
NavBarElem.prototype.getPreloadList = NavBarElem_getPreloadList;

NavBarElem.prototype.isComplete    = NavBarElem_isComplete;
NavBarElem.prototype.getViewName   = NavBarElem_getViewName;
NavBarElem.prototype.getUniqueName = NavBarElem_getUniqueName;
NavBarElem.prototype.setName       = NavBarElem_setName;
NavBarElem.prototype.setUpImage    = NavBarElem_setUpImage;

//static properties
NavBarElem.CloseTag = ">";
NavBarElem.ATagStart = "<a";
NavBarElem.ATagStop = "</a>";
NavBarElem.ALink = "href";
NavBarElem.ATarget = "target";
NavBarElem.AOnClick = "onClick";
NavBarElem.AOnMouseOver = "onMouseOver";
NavBarElem.AOnMouseOut = "onMouseOut";
NavBarElem.ImgTagStart = "<img";
NavBarElem.ImgName = "name";
NavBarElem.ImgSrc = "src";
NavBarElem.ImgBorder = "border";
NavBarElem.ImgAlt = "alt";
NavBarElem.ImgOnLoad = "onLoad";
NavBarElem.UpdateFn = "MM_nbGroup";

//static methods
NavBarElem.isValidTag = NavBarElem_isValidTag;


function NavBarElem_getObjectTag() {
  var retVal = '';
  retVal += this.getATag();
  retVal += NavBarElem.ImgTagStart;
  retVal += " " + NavBarElem.ImgName + "=\"" + this.imgName + "\"";
  retVal += " " + NavBarElem.ImgSrc + "=\"" + dw.doURLEncoding((this.isDown && this.downImg) ? this.downImg : this.upImg) + "\"";
  retVal += " " + NavBarElem.ImgBorder + "=\"0\"";
  retVal += " " + NavBarElem.ImgAlt + "=\"" + this.altText + "\"";
  retVal += " " + NavBarElem.ImgOnLoad + "=\"" + this.getOnLoadCall() + "\"";
  retVal += NavBarElem.CloseTag;
  retVal += NavBarElem.ATagStop;
  return retVal;
}


function NavBarElem_updateObjectTag(behEvent) {
  var imgElems, imgTag = '', newValue = '';
  if (this.tagObj != '') with (this) {
    
    // set imgTag
    if (tagObj.tagName == "IMG") {
      imgTag = tagObj;
    } else if (tagObj.tagName == "A") {
      imgElems = tagObj.getElementsByTagName("IMG");
      if (imgElems.length > 0) imgTag = imgElems[0];
    } else if (tagObj.tagName == "AREA") {
      if (tagObj.parentNode && tagObj.parentNode.tagName == "MAP") {
        mapName = "#" + tagObj.parentNode.name;
        imgElems = dw.getDocumentDOM(this.sourceDoc).getElementsByTagName("IMG");
        for (var i=0; !imgTag && i < imgElems.length; i++) {
          if (imgElems[i].usemap == mapName) imgTag = imgElems[i];
      } }
    }
    
    if (imgTag)
    {
	  // #194622 in mx2004 file url are encoded by default but DW8, we don't escape by defaul,
	  // so if there was any escaped chractor in the file name, the behavior script thinks
	  // it's a different file, and processes differently.  We have to normalize the string
	  // and compare to see if the files are still the same.
      var normalizedInput, normalizedOriginal;
      
      if (imgTag.name != imgName)
		imgTag.name = imgName;
		
      newValue = dw.doURLEncoding((isDown && downImg) ? downImg : upImg);
      
      normalizedInput = unescape(newValue);
      normalizedOriginal = unescape(imgTag.src);
      
      if (normalizedInput != normalizedOriginal) {
        // image changed, clear width/height so that the old size doesn't
        // stick around.
        imgTag.src = newValue;
        imgTag.removeAttribute("WIDTH");
        imgTag.removeAttribute("HEIGHT");
      }
      if (imgTag.alt != altText){
        imgTag.alt = altText;
      }
      if (behEvent != "onLoad") {
        newValue = insertNBCall(imgTag.onLoad, getOnLoadCall());
        if (imgTag.onLoad != newValue) imgTag.onLoad = newValue;
      }
      if (!imgTag.border) imgTag.border = "0";
    }

    if (tagObj.tagName == "IMG") {
// An extra A tag was being inserted for "show down image initially" buttons,
// and this line appeared to be the cause, so I've commented it out. -- LMH
//      tagObj.outerHTML = getATag() + tagObj.outerHTML + NavBarElem.ATagStop;
    } else if (tagObj.tagName == "A" || tagObj.tagName == "AREA") {
      newValue = (URL) ? URL : "javascript:;";
      if (tagObj.href != newValue) tagObj.href = newValue;
      if (tagObj.target || targetWindow)
        if (tagObj.target != targetWindow) tagObj.target = targetWindow;
      if (behEvent != "onClick") {
        newValue = insertNBCall(tagObj.onClick, getOnClickCall());
        if (tagObj.onClick != newValue) tagObj.onClick = newValue;
      }
      if (behEvent != "onMouseOver") {
        newValue = insertNBCall(tagObj.onMouseOver, getOnMouseOverCall());
        if (tagObj.onMouseOver != newValue) tagObj.onMouseOver = newValue;
      }
      if (behEvent != "onMouseOut") {
        newValue = insertNBCall(tagObj.onMouseOut, getOnMouseOutCall());
        if (tagObj.onMouseOut != newValue) tagObj.onMouseOut = newValue;
      }
    }

    updatePreloads();
  }
}


function NavBarElem_updatePreloads() {
  var imgList = ''
  //Add or remove MM_preloadImages() based on checkbox setting
  var obj = dreamweaver.getDocumentDOM(this.sourceDoc).body;
  if (this.preloadOrigId) {
    delHandler(obj,"onLoad","MM_preloadImages", this.preloadId);
  }
  if (this.preloadImages) {
    imgList = this.getPreloadList();
    preloadUpdate(imgList, this.preloadOrigList, 1);
  }
}


function NavBarElem_parseObjectTag(theTagObj) {
  var imgTag, fnCall, args, imgSrc = '';
  if (theTagObj) with (this) {
    tagObj = theTagObj;
    moveObj = tagObj;
    if (tagObj.tagName == "A" || tagObj.tagName == "AREA") {
      if (tagObj.href && tagObj.href != '#') URL = unescape(tagObj.href);
      if (tagObj.target) targetWindow = tagObj.target;
      if (tagObj.onClick &&
          (fnCall = this.getNBCall(tagObj.onClick)) != '') {  // fill downImages
        args = extractArgs(fnCall);
        groupName = args[2];
        downImg = unescape(args[4]);
        for (var i=5; i+1 < args.length; i+=2) {
          downImages.push(unescape(args[i]));
          downImages.push(unescape(args[i+1]));
        }
        if (args[args.length-1] != '0') {
          preloadImages = true;
          if (args[args.length-1] != '1') preloadOrigId = args[args.length-1];
        } else preloadImages = false;
      }
      if (tagObj.onMouseOver &&
          (fnCall = this.getNBCall(tagObj.onMouseOver)) != '') { // fill overImages
        args = extractArgs(fnCall);
        overImg = unescape(args[3]);
        overDownImg = unescape(args[4]);
        for (var i=5; i+2 < args.length; i+=3) {
          overImages.push(unescape(args[i]));
          overImages.push(unescape(args[i+1]));
          overImages.push(unescape(args[i+2]));
        }
        if (args[args.length-1] != '0') {
          preloadImages = true;
          if (args[args.length-1] != '1') preloadOrigId = args[args.length-1];
        } else preloadImages = false;
      }
      
      // set imgTag
      if (tagObj.tagName == "A") {
        imgElems = tagObj.getElementsByTagName("IMG");
        if (imgElems.length > 0) imgTag = imgElems[0];
      } else if (tagObj.tagName == "AREA") {
        if (tagObj.parentNode && tagObj.parentNode.tagName == "MAP") {
          mapName = "#" + tagObj.parentNode.name;
          imgElems = dw.getDocumentDOM(this.sourceDoc).getElementsByTagName("IMG");
          for (var i=0; !imgTag && i < imgElems.length; i++) {
            if (imgElems[i].usemap == mapName) imgTag = imgElems[i];
        } }
        moveObj = imgTag;
      }
    } else if (tagObj.tagName == "IMG") {
      imgTag = theTagObj;
    }
    if (imgTag) {
      if (imgTag.src)  imgSrc = unescape(imgTag.src);
      if (imgTag.onLoad && (fnCall = this.getNBCall(imgTag.onLoad)) != '') {
        args = extractArgs(fnCall);
        if (args.length > 4) {
          isDown = true;
          groupName = args[2];
          upImg = unescape(args[4]);
        }
      } else upImg = imgSrc;
      if (imgTag.name) {
        imgName = imgTag.name;
        nameAutoSet = false;
      } else {
        setUpImage(upImg);
      }
      if (imgTag.alt){
        altText = imgTag.alt;
      }
    }
    if (preloadImages) preloadOrigList = getPreloadList();
  }
}


function NavBarElem_getATag() {
  var retVal = '';
  retVal += NavBarElem.ATagStart;
  retVal += " " + NavBarElem.ALink + "=\"" + dw.doURLEncoding((this.URL) ? this.URL : "#") + "\"";
  if (this.targetWindow)
    retVal += " " + NavBarElem.ATarget + "=\"" + this.targetWindow + "\"";
  retVal += " " + NavBarElem.AOnClick + "=\"" + this.getOnClickCall() + "\"";
  retVal += " " + NavBarElem.AOnMouseOver + "=\"" + this.getOnMouseOverCall() + "\"";
  retVal += " " + NavBarElem.AOnMouseOut + "=\"" + this.getOnMouseOutCall() + "\"";
  retVal += NavBarElem.CloseTag;
  return retVal;
}

function NavBarElem_getOnLoadCall() {
  var retVal = '';
  if (this.isDown && this.downImg) {
    retVal = NavBarElem.UpdateFn + "('init','" + this.groupName + "','" +
             this.imgName + "','" + dw.doURLEncoding(this.upImg) + "'";
    for (var i=0; i < this.downImages.length; i+=2) {
      retVal += ",'" + this.downImages[i] + "','" + dw.doURLEncoding(this.downImages[i+1]) + "'";
    }
    retVal += "," + ((this.preloadImages) ? '1' : '0') + ")";
  }
  return retVal;
}

function NavBarElem_getOnClickCall() {
  var retVal = '';
  retVal += NavBarElem.UpdateFn + "('down','" + this.groupName + "','" +
            this.imgName + "','" + dw.doURLEncoding(this.downImg) + "'";
  for (var i=0; i < this.downImages.length; i+=2) {
    retVal += ",'" + this.downImages[i] + "','" + dw.doURLEncoding(this.downImages[i+1]) + "'";
  }
  retVal += "," + ((this.preloadImages) ? '1' : '0') + ")";
  return retVal;
}

function NavBarElem_getOnMouseOverCall() {
  var retVal = '';
  retVal += NavBarElem.UpdateFn + "('over','" +
            this.imgName + "','" + dw.doURLEncoding(this.overImg) + "','" + dw.doURLEncoding(this.overDownImg) + "'";
  for (var i=0; i < this.overImages.length; i+=3) {
    retVal += ",'" + this.overImages[i] + "','" +     // img name
              dw.doURLEncoding(this.overImages[i+1]) + "','" +  // over image
              dw.doURLEncoding(this.overImages[i+2]) + "'";     // overDown image
  }
  retVal += "," + ((this.preloadImages) ? '1' : '0') + ")";
  return retVal;
}

function NavBarElem_getOnMouseOutCall() {
  var retVal = '';
  retVal += NavBarElem.UpdateFn + "('out')";
  return retVal;
}

function NavBarElem_getNBCall(fnCallStr) {
  var retVal = '';
  var callList = dw.getTokens(fnCallStr, ";");
  for (var i=0; !retVal && i < callList.length; i++)
    if (callList[i].indexOf(NavBarElem.UpdateFn) != -1)
      retVal = callList[i];
  return retVal;
}


function NavBarElem_insertNBCall(eventStr, newFnCallStr) {
  var currCall, index, retVal = eventStr;
  if (!eventStr) {
    retVal = newFnCallStr;
  } else if (eventStr.indexOf(NavBarElem.UpdateFn) == -1) {
    retVal = eventStr + ";" + newFnCallStr;
  } else {
    currCall = this.getNBCall(eventStr);
    index = eventStr.indexOf(currCall);
    retVal = eventStr.substring(0, index) + newFnCallStr +
             eventStr.substring(index+currCall.length);
  }
  return retVal;
}

function NavBarElem_getPreloadList() {
  var imgList = new Array();
  with (this) {
    if (isDown) {
      if (upImg) imgList.push(dw.doURLEncoding(upImg));
    } else {
      if (downImg) imgList.push(dw.doURLEncoding(downImg));
    }
    if (overImg) imgList.push(dw.doURLEncoding(overImg));
    if (overDownImg) imgList.push(dw.doURLEncoding(overDownImg));
    for (var i=0; i+2 < overImages.length; i+=3) {
      if (overImages[i+1]) imgList.push(dw.doURLEncoding(overImages[i+1]));
      if (overImages[i+2]) imgList.push(dw.doURLEncoding(overImages[i+2]));
    }
    for (var i=0; i+1 < downImages.length; i+=2) {
      if (downImages[i+1]) imgList.push(dw.doURLEncoding(downImages[i+1]));
    }
  }
  return imgList;
}


//Returns true if this element is complete
//
function NavBarElem_isComplete() {
  var retVal = false;
  retVal = (this.upImg && this.imgName);
  return retVal;
}


//Returns the nice name for display in a list of elements
//
function NavBarElem_getViewName() {
  var retVal = '';
  retVal = this.imgName + ((this.isDown) ? " *" : "");
  return retVal;
}


//Returns a unique element name
//
function NavBarElem_getUniqueName(nameBase, forceNum) {
  var count=1,retVal = '';
  var docDOM = dw.getDocumentDOM(this.sourceDoc);
  var imgList = docDOM.getElementsByTagName("IMG");
  for (var i=0; i < imgList.length; i++) {
    if (imgList[i].name == nameBase + ((!forceNum && count==1) ? '' : count.toString())) {
      count++;
      i = -1; // restart loop
  } }
  if (this.parent) {
    for (var i=0; i < this.parent.elemList.length; i++) {
      if (this.parent.elemList[i] != this) {
        if (this.parent.elemList[i].imgName == nameBase + ((!forceNum && count==1) ? '' : count.toString())) {
          count++;
          i = -1; // restart loop
    } } }
  }
  retVal = nameBase + ((!forceNum && count==1) ? '' : count.toString());
  return retVal;
}


//Sets the name and updates the auto set flag
//
function NavBarElem_setName(theName) {
  if (this.imgName != theName && theName) {
    this.imgName = this.getUniqueName(theName);
    this.nameAutoSet = false;
  }
}


//Sets the up images and updates the name of the element
//
function NavBarElem_setUpImage(theImage) {
  var simpleName, index;
  this.upImg = theImage;
  if (theImage && this.nameAutoSet) {
    simpleName = theImage;
    index = simpleName.lastIndexOf(MM.File.separator);
    if (index != -1) 
      simpleName = simpleName.substring(index + MM.File.separator.length);
    index = simpleName.lastIndexOf(MM.File.extensionSep);
    if (index != -1) 
      simpleName = simpleName.substring(0, index);
    simpleName = simpleName.replace(/[^A-Za-z0-9]/g, '');
    if (simpleName.search(/\d/) == 0) simpleName = '_' + simpleName;
    if (simpleName)
      this.imgName = this.getUniqueName(simpleName);
  }
}


//Returns true if the given tag represents a nav bar element
//
function NavBarElem_isValidTag(theTagObj) {
  var retVal = false;
  retVal = (theTagObj.outerHTML.indexOf(NavBarElem.UpdateFn) != -1)
  return retVal;
}



/*------------------------------------------------------------------*/

function NavBarView(docObj, theData) {
  //properties
  this.data = theData;

  this.elemList = new ListControl('elemList');
  
  // The layout select list is only used in the 'Insert' version of nav bar, not
  //   in the 'Modify' version. So, only create if it exists.
  this.layout = null;
  if (dwscripts.findDOMObject('layout'))
  {
    this.layout = new ListControl('layout');
    this.layout.setAll(MENULIST_layout);
  }  
  
  this.useTable = findObject('useTable');

  this.prevIndex = '';

  this.elemView = new NavBarElemView(docObj);
}

//methods
NavBarView.prototype.display = NavBarView_display;
NavBarView.prototype.update  = NavBarView_update;
NavBarView.prototype.storeOptions = NavBarView_storeOptions;
NavBarView.prototype.restoreOptions = NavBarView_restoreOptions;


function NavBarView_display(index, sameElem) {
  index = (index != null) ? index : 0;
  with (this) {
    elemList.setAll(data.getViewNames());
    if (index < 0) index = 0;
    if (index >= elemList.getLen()) index = elemList.getLen()-1;
    elemList.setIndex(index);
    elemView.setElem(data.getElem(index));
    elemView.display(sameElem);
    if (layout) layout.setIndex((data.isHorizontal) ? 0 : 1);
    useTable.checked = data.useTable;
    prevIndex = index;
  }
}

function NavBarView_update(itemName) {
  var index, origIndex;
  with (this) {
    switch (itemName) {
      case "elemAdd":
        if (data.getElem(elemList.getIndex()).isComplete()) {
          index = data.addElem(elemList.getIndex());
          if (index != -1) display(index);
          else display();
        } else {
          alert(MSG_NeedNameAndImg + MSG_AddingElem);
        }
        break;
      case "elemRemove":
        if (data.elemList.length >= 2) {
          index = elemList.getIndex();
          if (data.removeElem(index)) display(index);
        } else {
          index = elemList.getIndex();
          if (data.removeElem(index)) {
            index = data.addElem();
            if (index != -1) display(index);
            else display();
          }
        }
        break;
      case "elemUp":
        index = data.moveElemUp(elemList.getIndex());
        if (index != -1) display(index, true);
        break;
      case "elemDown":
        index = data.moveElemDown(elemList.getIndex());
        if (index != -1) display(index, true);
        break;
      case "elemList":
        if (data.getElem(prevIndex).isComplete()) {
          index = elemList.getIndex();
          elemView.setElem(data.getElem(index));
          elemView.display();
        } else {
          elemList.setIndex(prevIndex);
          elemView.display();
          alert(MSG_NeedNameAndImg + MSG_SelectElem);
        }
        break;
      case "elemName":
			 if (elemView.elemName.value.search(/[^A-Za-z0-9_]/) != -1 || elemView.elemName.value.charAt(0).search(/\d/) != -1)
			 {
			   alert(MM.MSG_InvalidName);
				 elemView.elemName.value = data.getElem(elemList.getIndex()).getViewName();
				 break;
			 }
      case "upImg":
      case "isDown":
        elemView.update(itemName);
        elemList.set(data.getElem(elemList.getIndex()).getViewName());
        break;
      case "overImg":
      case "downImg":
      case "overDownImg":
      case "theURL":
      case "theTarget":
      case "preloadImages":
      case "theAltText":
        elemView.update(itemName);
        break;
      case "layout":
        data.isHorizontal = (layout.getIndex() == 0);
        break;
      case "useTable":
        data.useTable = useTable.checked;
        break;
      default:
        //alert("ERROR: UI Update Error - " + itemName);
        break;
    }
  }
}


function NavBarView_storeOptions(cmdFile) {
  var handle = MMNotes.open(cmdFile, true);
  if (handle != 0) {
    MMNotes.set(handle, "LayoutOption", this.data.isHorizontal.toString());
    MMNotes.set(handle, "TableOption", this.data.useTable.toString());
    MMNotes.close(handle);
  }
}


function NavBarView_restoreOptions(cmdFile) {
  var handle = MMNotes.open(cmdFile);
  if (handle != 0) {
    this.data.isHorizontal = (MMNotes.get(handle, "LayoutOption") == "false") ? false : true;
    this.data.useTable     = (MMNotes.get(handle, "TableOption")  == "false") ? false : true;
    MMNotes.close(handle);
  }
}



/*------------------------------------------------------------------*/

function NavBarElemView(docObj, theElem) {
  //properties
  this.elem = (theElem) ? theElem : '';
  this.elemName = findObject('elemName');
  this.upImg = findObject('upImg');
  this.overImg = findObject('overImg');
  this.downImg = findObject('downImg');
  this.overDownImg = findObject('overDownImg');
  this.theURL = findObject('theURL');
  this.theAltText = findObject('theAltText');
  this.theTarget = new ListControl('theTarget');
  this.preloadImages = findObject('preloadImages');
  this.isDown = findObject('isDown');

  // populate the target list
  this.targNames = new Array();
  this.targValues = new Array();
  this.setTargetArrays();
  this.theTarget.setAll(this.targNames, this.targValues);
}

//methods
NavBarElemView.prototype.setElem = NavBarElemView_setElem;
NavBarElemView.prototype.display = NavBarElemView_display;
NavBarElemView.prototype.update  = NavBarElemView_update;
NavBarElemView.prototype.setTargetArrays = NavBarElemView_setTargetArrays;


function NavBarElemView_setElem(theElem) {
  this.elem = theElem;
  this.display();
}

//Updates the current view based on the elem settings
//
function NavBarElemView_display(sameElem) {
  if (this.elem) with (this) {
    elemName.value = elem.imgName;
    upImg.value = elem.upImg;
    overImg.value = elem.overImg;
    downImg.value = elem.downImg;
    overDownImg.value = elem.overDownImg;
    theURL.value = elem.URL;
    theAltText.value = elem.altText;
    theTarget.pickValue(elem.targetWindow);
    preloadImages.checked = elem.preloadImages;
    isDown.checked = elem.isDown;

    if (!sameElem) {
      elemName.select();
      elemName.focus();
    }
  }
}


//Updates the current elem based on the item setting
function NavBarElemView_update(itemName) {
  with (this) {
    switch (itemName) {
      case "elemName":
        elem.setName(elemName.value);
        elemName.value = elem.imgName;
        break;
      case "upImg":
        elem.setUpImage(upImg.value);
        display(true);
        break;
      case "overImg":
        elem.overImg = overImg.value;
        break;
      case "downImg":
        elem.downImg = downImg.value;
        break;
      case "overDownImg":
        elem.overDownImg = overDownImg.value;
        break;
      case "theURL":
        elem.URL = theURL.value;
        break;
      case "theAltText":
        elem.altText = theAltText.value;
        break;
      case "theTarget":
        elem.targetWindow = theTarget.getValue();
        break;
      case "preloadImages":
        elem.preloadImages = preloadImages.checked;
        break;
      case "isDown":
        elem.isDown = isDown.checked;
        break;
      default:
        //alert("ERROR: UI Update Error - " + itemName);
        break;
    }
  }
}


function NavBarElemView_setTargetArrays() {
  var docDOM = dw.getDocumentDOM();
  this.targNames  = docDOM.getFrameNames();
  this.targValues = docDOM.getFrameNames();
   //insert main window name and value
  this.targNames.splice(0, 0, MM.TYPE_MainWindow);
  this.targValues.splice(0, 0, '_top');
}
