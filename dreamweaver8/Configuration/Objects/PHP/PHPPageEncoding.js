// Copyright 1999, 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//---------------     API FUNCTIONS    ---------------

function isDOMRequired() {
	return false;
}


function objectTag() {
  var dom = dw.getDocumentDOM();
  var encoding = "";
  if( dom )
  	  encoding = dom.getCharSet();
  var encodingStr = "mb_http_input(\"" + encoding + "\");\nmb_http_output(\"" + encoding + "\");"; 
  
  //for text view, just drop the code at the IP, assume the coder is putting it in the correct place
  if( dw.getFocus() == 'textView' )
  {
      return encodingStr;
  }
  else if (dom)
  {
    
    if (encoding)
    {
      var docStr = dom.documentElement.outerHTML;
      var selectionStart = 0;
      var selectionEnd = 0;
      var newDocStr = "";

      //first try to see if this tag is already here and up to date
	  if( -1 < docStr.search( /mb_http_input\(["'][\w-]*["']\)/i)  ||  -1 < docStr.search( /mb_http_output\(["'][\w-]*["']\)/i ) )
	  {
			dom.serverModel.updatePageDirective(dom);
			docStr = dom.documentElement.outerHTML;
			selectionStart = docStr.search( /mb_http_input\(["'][\w-]*["']\)/i );
			if( 0 > selectionStart )
				selectionStart = docStr.search( /mb_http_output\(["'][\w-]*["']\)/i );
			selectionEnd = docStr.indexOf( ")", selectionStart ) +1;
	  }
	  else
	  {  
		  //add this to the top of the page
		  newDocStr =  "<?php\n" + encodingStr + "\n?>\n" + docStr;
		  selectionStart = 6;
		  selectionEnd = encodingStr.length;
          dom.documentElement.outerHTML = newDocStr;
      
         //put the focus to the code view, so the user know we did something
        dom.source.setSelection(selectionStart, selectionEnd);
	  }
    }
  }
}
