// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------

var helpDoc = MM.HELP_objComment;
var commentStr = "";

//---------------     API FUNCTIONS    ---------------

function commandButtons(){
   return new Array(MM.BTN_OK,         "setCommentStr()",
                    MM.BTN_Cancel,     "window.close()",
                    MM.BTN_Help,       "displayHelp()" );
}

function getCommentStr(){
  return commentStr;
}

function setCommentStr() 
{
  var commentStart = "<!--";
	var commentEnd = " -->";	
  commentStr = commentStart + document.forms[0].comment.value + commentEnd;
  window.close();
}

function initUI(){
  document.forms[0].comment.focus();
}
