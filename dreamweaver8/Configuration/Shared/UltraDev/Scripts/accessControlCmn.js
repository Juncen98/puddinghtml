// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//*-------------------------------------------------------------------
// FUNCTION:
//  getAccessLevelsFromNotes
//
// DESCRIPTION:
//  Retrieves the defined access levels from a design note located
//  at the site root.
//
// ARGUMENTS:
//  none
//
// RETURNS:
//  An array of strings
//--------------------------------------------------------------------
function getAccessLevelsFromNotes() {
  var retAccessLevels = new Array();
  var siteURL = dw.getSiteRoot()
  if (siteURL.length) {
    var noteHandle = MMNotes.open(siteURL,true);
    if (noteHandle != null) {
      var listAuthorizationLevels = MMNotes.get(noteHandle,"PageAccessControl");
      MMNotes.close(noteHandle);
      if (listAuthorizationLevels.length > 0) {
        retAccessLevels = listAuthorizationLevels.split(",");
      }
    } else alert("getAccessLevelsFromNotes: noteHandle == null");
  } else alert("getAccessLevelsFromNotes: siteURL.length == 0");
  return retAccessLevels;
}


//*-------------------------------------------------------------------
// FUNCTION:
//  putAccessLevelsToNotes
//
// DESCRIPTION:
//  Stores a list of access levels in a design note located as the
//  site root.
//
// ARGUMENTS:
//  AuthorizationLevels - an array of strings
//
// RETURNS:
//  nothing
//--------------------------------------------------------------------
function putAccessLevelsToNotes(AuthorizationLevels) {
  var siteURL = dw.getSiteRoot()
  if (siteURL.length) {
    var noteHandle = MMNotes.open(siteURL,true);
    if (noteHandle != null) {
      MMNotes.set(noteHandle,"PageAccessControl",AuthorizationLevels.toString());
      MMNotes.close(noteHandle);
    } else alert("putAccessLevelsToNotes: noteHandle == null");
  } else alert("putAccessLevelsToNotes: siteURL.length == 0");
}


//*-------------------------------------------------------------------
// FUNCTION:
//  getSecurityMethodFromNotes
//
// DESCRIPTION:
//  Retrieves the security method from a design note located
//  at the site root.
//
// ARGUMENTS:
//  none
//
// RETURNS:
//  a string
//--------------------------------------------------------------------
function getSecurityMethodFromNotes() {
  var retMethod="";
  var siteURL = dw.getSiteRoot()
  if (siteURL.length) {
    var noteHandle = MMNotes.open(siteURL,true);
    if (noteHandle != null) {
      var retMethod = MMNotes.get(noteHandle,"PageAccessControlMethod");
      MMNotes.close(noteHandle);
    } else alert("getAccessMethodFromNotes: noteHandle == null");
  } else alert("getAccessMethodFromNotes: siteURL.length == 0");
  return retMethod;
}


//*-------------------------------------------------------------------
// FUNCTION:
//  putSecurityMethodToNotes
//
// DESCRIPTION:
//  Stores the security method in a design note located as the
//  site root.
//
// ARGUMENTS:
//  method - a string
//
// RETURNS:
//  nothing
//--------------------------------------------------------------------
function putSecurityMethodToNotes(method) {
  var siteURL = dw.getSiteRoot()
  if (siteURL.length) {
    var noteHandle = MMNotes.open(siteURL,true);
    if (noteHandle != null) {
      MMNotes.set(noteHandle,"PageAccessControlMethod",method);
      MMNotes.close(noteHandle);
    } else alert("putAccessLevelsToNotes: noteHandle == null");
  } else alert("putAccessLevelsToNotes: siteURL.length == 0");
}
 