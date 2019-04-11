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
  
  //for text view, just drop the code at the IP, assume the coder is putting it in the correct place
  if( dw.getFocus() == 'textView' )
  {
  	  var pageDirective = "<cfprocessingdirective pageencoding=\"" + encoding + "\">\n";
  	  pageDirective += "<cfcontent type=\"text/html; charset=" + encoding + "\">\n";
      pageDirective += "<cfset setEncoding(\"URL\", \"" + encoding + "\")>\n";
      pageDirective += "<cfset setEncoding(\"Form\", \"" + encoding + "\")>\n";
      return pageDirective;
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
      var oldLangStr, newLangStr, newDocStr, tagsToAdd = "";
      var updateCode = false;

      //look for four specific tags and update them or add them if they're not there, 
      //look in reverse order of how we want to add them so it's easier to do
      
      //look for     //<cfset setEncoding("FORM", "encoding")>
      
      pageDirectiveStart = docStr.search( /<cfset\s+setEncoding\s*\(\s*['"]FORM['"]\s*,\s*["']/i );
      if( pageDirectiveStart == -1 )
      {
      	  tagsToAdd = "<cfset setEncoding(\"FORM\", \"" + encoding +"\")>\n" + tagsToAdd;
      }

      //look for     //<cfset setEncoding("URL", "encoding")>
      
      pageDirectiveStart = docStr.search( /<cfset\s+setEncoding\s*\(\s*['"]URL['"]\s*,\s*["']/i );
      if( pageDirectiveStart == -1 )
      {
      	  tagsToAdd = "<cfset setEncoding(\"URL\", \"" + encoding + "\")>\n" + tagsToAdd;
      }
      
      //now look for <cfcontent type="text/html; charset=encoding">

      pageDirectiveStart = docStr.search( /<cfcontent/i );
      if( pageDirectiveStart == -1 )
      {
      	  tagsToAdd =  "<cfcontent type=\"text/html; charset=" + encoding + "\">\n" + tagsToAdd;
      }
      
      
      //look for the first <cfprocessingdirective pageEncoding='encoding'>
    
      pageDirectiveStart = docStr.search( /<cfprocessingdirective\s*pageEncoding=/i );
      if( pageDirectiveStart > -1 )
      {
        
        pageDirectiveEnd = docStr.indexOf(">", pageDirectiveStart) + 1;

        if(pageDirectiveEnd > 1 && pageDirectiveEnd > pageDirectiveStart && tagsToAdd != "")
        {
          //include trailing white space here
          var whiteSpace = " \f\n\r\t\v";
          while ( whiteSpace.indexOf( docStr.charAt( pageDirectiveEnd + 1 ) ) != -1 )
          	  pageDirectiveEnd++;
          
          //add the new tags after the end if this one
          newDocStr = docStr.substring(0, pageDirectiveEnd) +
                            tagsToAdd +
                            docStr.substring(pageDirectiveEnd);
            docStr = newDocStr;
            updateCode = true;
            selectionStart = pageDirectiveEnd;
            selectionEnd = selectionStart+tagsToAdd.length;
        }
        else
        {
        	//we're not modifying the doc, just select the page directive so people
        	//know why the code wasn't added
        	selectionStart = pageDirectiveStart;
        	if( pageDirectiveEnd > pageDirectiveStart )
        		selectionEnd = pageDirectiveEnd;
        	else
        		selectionEnd = selectionStart;
        }
      }
      else
      {
        tagsToAdd =  "<cfprocessingdirective pageEncoding=\"" + encoding + "\">\n" + tagsToAdd;
        newDocStr = tagsToAdd + docStr;
        docStr = newDocStr;
        updateCode = true;
        selectionStart = 0;
        selectionEnd = selectionStart+tagsToAdd.length;
      }

      if( updateCode )
        dom.documentElement.outerHTML = newDocStr;
      
      //put the focus to the code view, so the user know we did something
      dom.source.setSelection(selectionStart, selectionEnd);
    }
  }
  
}
