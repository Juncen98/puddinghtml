//
// Copyright 2005 Macromedia, Inc. All rights reserved.
//
// ----------------------------------------------------

function commandButtons(){
  return new Array(MM.BTN_OK,     "goToLine()",
                   MM.BTN_Cancel, "window.close()");
}

function canAcceptCommand(){
  var retVal = false;
  if (dw.getFocus(true) == 'textView' || dw.getFocus(true) == 'html'){
    retVal = true;
  }
  return retVal;
}

function goToLine(){
  var dom = dw.getDocumentDOM();
  var lineNum = parseInt(document.forms[0].lineNum.value);
  if (typeof lineNum == 'number' && lineNum > 0){
    dom.source.setCurrentLine(lineNum);
  }
  window.close();
}

function initUI(){
  document.forms[0].lineNum.focus();
}

