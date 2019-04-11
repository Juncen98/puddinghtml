// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.


//---------------   GLOBAL VARIABLES   ---------------

var helpDoc = MM.HELP_objLink;

//---------------     API FUNCTIONS    ---------------

function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	return false;
}

function objectTag(){
  var Attributes='';
  var Form=document.forms[0];
  var href=Form.href.value;
  var id=Form.id.value;
  var rel=Form.rel.value;
  var rev=Form.rev.value;
  var title=Form.title.value;
  
  if (href!='')
    Attributes+=' href="' + href + '"';
  if (id!='')
    Attributes+=' id="' + id + '"';
  if (rel!=''){
    Attributes+=' rel="' + rel + '"';
	if (rel.toLowerCase().indexOf("stylesheet")!=-1)
	  Attributes+=' type="text/css"';
  }	
  if (rev!='')
    Attributes+=' rev="' + rev + '"';
  if (title!='')
    Attributes+=' title="' + title + '"';

  return '<link' + Attributes + '>';
}

//---------------    LOCAL FUNCTIONS   ---------------

function browseForFile(){
  var filePath = document.forms[0].href.value;
	var fileName = dwscripts.browseFileWithPath(filePath);  //returns a local filename
  document.forms[0].href.value=fileName;
}
