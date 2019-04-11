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
  var requestEncodingStr = "request.setCharacterEncoding(\"" + encoding + "\");";
  
  //for text view, just drop the code at the IP, assume the coder is putting it in the correct place
  if( dw.getFocus() == 'textView' )
  {
      return requestEncodingStr;
  }
  else if (dom)
  {
    
    if (encoding)
    {
      var docStr = dom.documentElement.outerHTML;
      var pageDirectiveEnd = 0;
      var pageDirectiveStart = 0;
      var selectionStart = 0;
      var selectionEnd = 0;
      var newDocStr = "";
      var updateCode = false;

      //first try to see if this tag is already here and up to date
	  if( -1 < docStr.search( /request.setCharacterEncoding\(["'][\w-]*["']\)/i ))
	  {
			dom.serverModel.updatePageDirective(dom);
			docStr = dom.documentElement.outerHTML;
			selectionStart = docStr.search( /request.setCharacterEncoding\(["'][\w-]*["']\)/i );
			selectionEnd = docStr.indexOf( ")", selectionStart ) +1;
	  }
	  else
	  {  
		  //try to add this after the page directive
		  pageDirectiveStart = docStr.search( /<%@\s*Page/i );
		  if( pageDirectiveStart == -1 )
		  {
			  //we didn't find the page directive, just add it to the top of the document 
			  newDocStr = requestEncodingStr + docStr;
			  selectionEnd = requestEncodingStr.length;
			  updateCode = true;
		  }
		  else
		  {
		  	  pageDirectiveEnd =  docStr.indexOf("%>", pageDirectiveStart) + 2;
			  if(pageDirectiveEnd > 1 && pageDirectiveEnd > pageDirectiveStart)
        	  {
				  //include any trailing whitespace in the page directive
				  var whiteSpace = " \f\n\r\t\v";
				  if( whiteSpace.indexOf( docStr.charAt( pageDirectiveEnd +1 ) ) != -1 )
				  {
				  	pageDirectiveEnd++;	
				  }
				  
				  while( whiteSpace.indexOf( docStr.charAt( pageDirectiveEnd ) ) != -1 )
				  {
					pageDirectiveEnd++;
				  }
				  
				  newDocStr = docStr.substring( 0 , pageDirectiveEnd ) + 
				              "<% " + requestEncodingStr + " %>\n" +
							  docStr.substring( pageDirectiveEnd , docStr.length );
				  updateCode = true;
				  selectionStart = pageDirectiveEnd;
				  selectionEnd = selectionStart + requestEncodingStr.length;
			  }
				  
		  }
	  }

      if( updateCode )
        dom.documentElement.outerHTML = newDocStr;
      
      //put the focus to the code view, so the user know we did something
      dom.source.setSelection(selectionStart, selectionEnd);
    }
  }
  
}
