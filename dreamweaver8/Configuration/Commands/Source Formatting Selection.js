// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//-----------------------------------------------------
//
// Source Formatting Selection.js
//
// This file contains the implementation to fire off the Dreamweaver
// source formatter to the selection.

function canAcceptCommand(){
  var retVal = true;
  var dom = dw.getDocumentDOM();

  if (dom && (dom.getParseMode() == 'html' || dw.getDocumentDOM().getParseMode() == 'xml') && (dw.getFocus() == 'document' || dw.getFocus(true) == 'html' || dw.getFocus() == 'textView')){
    var selArr = dom.getSelection();
    if (selArr[0] == selArr[1]){
      retVal = false;
    }else if (dom.getSelectedNode().nodeType == Node.ELEMENT_NODE && dom.getSelectedNode.tagName == 'TABLE'){
      var sourceSel = dom.source.getSelection();
      alert("sourceSel = " + sourceSel);
      var TRs = dom.getSelectedNode().getElementsByTagName('TR');
      var offsets;
      for (var i=0; i < TRs.length; i++){
        offsets = dom.nodeToOffsets(TRs[i]);
        alert("offsets = " + offsets);
        if ((offsets[0] == sourceSel[0]) && (offsets[1] == sourceSel[1])){
          retVal = false;
          break;
        }
      }
    }
  }else{
    retVal = false;
  }

   return retVal;
}

function formatSourceSelection()
{
   dw.getDocumentDOM().formatSelection();
   
   return;         
}
