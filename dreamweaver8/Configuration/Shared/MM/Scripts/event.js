// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

/* ----------------------------------------------------------------------*/
//event functions

//INTERFACE
//
//event functions:
//
//  notify(menuID, stdCallStr)
//    - called by the menu item to notify interested parties.
//
//  registerID(menuID, cmdName, notifyAfter)
//    - called to register for events before or after the invoke string
//      on a specific menuID
//
//  registerFnCall(fnCallStr, cmdName, notifyAfter)
//    - called to register for events before or after a specific function call
//
//  addToMenuFile(menuID, fnCallStr)
//    - called to add notifiers to the menus.xml file.
//      (specifiy one of menuID or fnCallStr)
//


function event() { }

// static properties
event.menuFile = dw.getMenuFile();
event.callStr = "MM.event.notify";

event.preList  = new Array();
event.postList = new Array();

event.handled = '';
event.menuID = '';
event.fnCall = '';
event.isPost = '';


// static methods
event.getFnID = event_getFnID;
event.notify = event_notify;
event.registerID = event_registerID;
event.registerFnCall = event_registerFnCall;
event.addToMenuFile = event_addToMenuFile;


/* ----------------------------------------------------------------------*/

//Returns a simple string which can be used as an array name
//
function event_getFnID(fnCallStr) {
  var retVal = fnCallStr.replace(/[.()]/g, '');
  return retVal;
}


//Called by menus.xml to notify interested parties of events.
//
function event_notify(menuID, stdCallStr) {
  var itemStr, retVal = false;

  event.menuID = menuID;
  event.fnCall = stdCallStr;
  event.handled = false;
  event.isPost = false;

  itemStr = (menuID) ? menuID : event.getFnID(stdCallStr);

  if (event.preList[itemStr] != null) {
    for (var i=0; !retVal && i < event.preList[itemStr].length; i++) {
      dw.popupCommand(event.preList[itemStr][i]);
      retVal = event.handled;
  } }

  if (!retVal) eval(stdCallStr);

  event.isPost = true;

  if (event.postList[itemStr] != null) {
    for (var i=0; !retVal && i < event.postList[itemStr].length; i++) {
      dw.popupCommand(event.postList[itemStr][i]);
      retVal = event.handled;
  } }
}


//Called by HTML files in the Startup folder to register for events
// based on a specific menu ID string.
//
function event_registerID(menuID, cmdName, notifyAfter) {
  var handle, defined = false;
  var menuDOM, menuitemList, item, idStr, invokeStr, changed=false;

  if (!notifyAfter) {
    if (event.preList[menuID] == null)
      event.preList[menuID] = new Array();
    event.preList[menuID].push(cmdName);
  } else {
    if (event.postList[menuID] == null)
      event.postList[menuID] = new Array();
    event.postList[menuID].push(cmdName);
  }
}


//Called by HTML files in the Startup folder to register for events
// based on a specific function call.
//
function event_registerFnCall(fnCallStr, cmdName, notifyAfter) {
  var simpleName, handle, defined = false;
  var menuDOM, menuitemList, item, invokeStr, index, changed=false;

  simpleName = event.getFnID(fnCallStr);

  if (!notifyAfter) {
    if (event.preList[simpleName] == null)
      event.preList[simpleName] = new Array();
    event.preList[simpleName].push(cmdName);
  } else {
    if (event.postList[simpleName] == null)
      event.postList[simpleName] = new Array();
    event.postList[simpleName].push(cmdName);
  }
}


//Add the necessary notify calls to the menus.xml file.
// Only specify one of menuID or fnCallStr.
//
function event_addToMenuFile(menuID, fnCallStr) {
  var simpleName, handle, defined = false;
  var menuDOM, menuitemList, item, invokeStr, index, changed=false;

  itemStr = (menuID) ? menuID : event.getFnID(fnCallStr);

  //handle = MMNotes.open(event.menuFile, true);
  //if (handle != 0) {
  //  defined = eval(MMNotes.get(handle, itemStr));
  //  MMNotes.close(handle);
  //}

  if (!defined) {
    menuDOM = dw.getDocumentDOM(event.menuFile);
    menuitemList = menuDOM.getElementsByTagName("MENUITEM");
    for (var i=0; i < menuitemList.length; i++) {
      item = menuitemList[i];
      if (!item.outerHTML) continue;
      idStr = item.getAttribute("ID");
      invokeStr = item.getAttribute("INVOKE");
      if (invokeStr != null &&
          ((menuID && idStr != null && idStr == menuID) ||
           (fnCallStr && invokeStr.indexOf(fnCallStr) != -1)) &&
          invokeStr.indexOf(event.callStr) == -1) {

        if (menuID) {
          invokeStr = event.callStr + "('" + menuID + "','" + escQuotes(invokeStr) + "')";
        } else {
          index = invokeStr.indexOf(fnCallStr);
          invokeStr = invokeStr.substring(0,index) +
                      event.callStr + "('','" + escQuotes(fnCallStr) + "')" +
                      invokeStr.substring(index + fnCallStr.length);
        }

        item.setAttribute("INVOKE", invokeStr);
        changed = true;
      }
    }

    if (changed) {
      dw.saveDocument(menuDOM, event.menuFile);
      dw.releaseDocument(menuDOM);
    }

    //handle = MMNotes.open(event.menuFile, true);
    //if (handle != 0) {
    //  MMNotes.set(handle, itemStr, 'true');
    //  MMNotes.close(handle);
    //}

  }
}
