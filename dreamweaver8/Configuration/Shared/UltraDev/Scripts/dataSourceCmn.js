// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*-------------------------------------------------------------------
// CLASS:
//   ObjectInfo
//
// DESCRIPTION:
//   Used as the return structure for the findDynamicSources() and
//   generateDynamicSourceBindings() functions in a DataSource.
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//
//--------------------------------------------------------------------
function ObjectInfo(title, imageFile, allowDelete, dataSource, name) {
  
  this.title = title;
  this.imageFile = imageFile;
  this.allowDelete = allowDelete;
  this.dataSource = dataSource;
  this.name = (name) ? name : "";
}


function getObjectInfoList(origArray, filename, dataSource) {
  var retList = new Array();
  
  for (var i = 0; i < origArray.length; i++) {
    
    retList.push(new ObjectInfo(origArray[i], filename, true, dataSource));
    
  }
  
  return retList;
}



function findSSRecByTitle(title, serverBehavior) {
  var retVal = null;
  
  var ssRecs = dw.serverBehaviorInspector.getServerBehaviors();
  
  for (var i=0; i < ssRecs.length; i++) { //search all ssRecs
    var ssRec = ssRecs[i];
    if (ssRec.participants && ssRec.serverBehavior == serverBehavior && 
        (ssRec.title == title || (ssRec.rsName && ssRec.rsName == title)) ) {
      retVal = ssRec;
      break;
    }
  }
  
  return retVal;
}


