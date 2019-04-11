//
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//
//NBInit.js
//
// Adds or edits the MM_nbSetInitDown function, which gets attached
// to the body onload handler
//
// Used by Set Nav Bar Image and Set Initially Down Images behaviors
//
//--------------------------------------------------------------
//
//
// setInitDownFn()
// removeInitDownArgs(imgName)
// findArrInd(arr,item)



// function: setInitDownFn
// description: add MM_nbInitDown function call if it doesn't exist
// if it does exist, add arguments to end of function call
// arguments: variable number of imageName and downSrc pairs, usually only 1

function setInitDownFn(){
   var bodyNode = dreamweaver.getDocumentDOM('document').body;
   var onLoadVal = bodyNode.onload;
   var initDownFnExists = onLoadVal && onLoadVal.indexOf("MM_nbSetInitDown") != -1;
   var setInitDownFnArgs = setInitDownFn.arguments;
   var nArgs = setInitDownFnArgs.length;
   var newFnStr = "MM_nbSetInitDown("
   
   // the nav bar group name is put in the function call so that it will be
   // easy to build in user-defined groups at a later time.
   // (right now, there can only be one nav bar group per page)
   var navBarGroupName = "group1"; // default nav bar group name
   
   // determine if there is already a MM_nbSetInitDown fn call in onload handler
   if ( initDownFnExists){
      var currFnStr = getHandler(bodyNode,"onLoad","MM_nbSetInitDown");
	  var currFnArgs = extractArgs(currFnStr).slice(1);
	  
	  // add group name to argument call. We use what is already in the doc
	  // in case the user has changed it
	  newFnStr += quote(currFnArgs[0],1) + ",";
	  
	  // go through each name, downSrc pair. look for the name
	  // in the existing MM_nbInitDown function call. If the name isn't there,
	  // add the name and downSrc to the existing function.
	  // If the name is there and the downSrc matches what we are adding,
	  // don't add. If the 
	  // down src, then change the src.
	  for (i=0; i<nArgs; i+=2){
	     arrInd = findArrInd(currFnArgs,setInitDownFnArgs[i])
	     if ( arrInd == -1 ){  // image name is not in function call
		    newFnStr += quote(setInitDownFnArgs[i],1) + "," +
			            quote(setInitDownFnArgs[i+1],1) + ",";
		 } else { 
		    if ( currFnArgs[arrInd+1] != setInitDownFnArgs[i+1] ){
			   currFnArgs[arrInd+1] = setInitDownFnArgs[i+1];
			}
		 }
	  }
	  // combine old args and new args
	  // start at arg 1 because that is where the imgName,downSrc pairs start
	  // fn args are: groupName,imgName,downSrc...[imgName,downSrc]
	  for (i=1; i<currFnArgs.length; i++){
	     newFnStr += quote(currFnArgs[i],1) + ",";
	  }
   } else { // create fn 
      newFnStr += quote(navBarGroupName,1) + ",";
	  for (i=0; i<nArgs; i++){
	     newFnStr += quote(setInitDownFnArgs[i],1) + ",";
	  }
   }
   
   newFnStr = newFnStr.substring(0,newFnStr.length-1) + ")";

   // re-attach function call
   setHandler(bodyNode,"onload",newFnStr);
}

// function: removeInitDownArgs(imgName)
// description: removes image name and down source from MM_nbInitDown
// function, if they exist. Deletes entire function if needed

function removeInitDownArgs(imgName){
   var bodyNode = dreamweaver.getDocumentDOM('document').body;
   var onLoadVal = bodyNode.onload;
   var initDownFnExists = onLoadVal && onLoadVal.indexOf("MM_nbSetInitDown") != -1;
   
   if ( !initDownFnExists )
      return;
	  
   var initDownFnStr = getHandler(bodyNode,"onload","MM_nbSetInitDown");
   var initDownArgs = extractArgs(initDownFnStr).slice(1);
   var nArgs = initDownArgs.length;
   var foundMatch = true;
   
   for (i=0; i<nArgs; i++){
      if (initDownArgs[i] == imgName){
		 if (nArgs < 5)
		    removeHandler(bodyNode,"onload","MM_nbSetInitDown");
	     else {
	        initDownArgs = initDownArgs.slice(0,i).concat( initDownArgs.slice(i+2) )
			foundMatch=true;
	     }
		 break;
      }
   }
   if (foundMatch){
      initDownFnStr = "MM_nbSetInitDown(" + initDownArgs.join(",") + ")";
      setHandler(bodyNode,"onload",initDownFnStr);
   }
}

// function: findArrInd
// description: returns integer determining if item is in the array
// -1:  it is not included, a positive integer or 0 is the position of the
// first match

function findArrInd(arr,item){
   var nItems = arr.length;
   var i;
   var retVal = -1
   
   for (i=0; i<nItems; i++){
      if (arr[i] == item){
	     retVal = i;
		 break;
	  }   
   }
   return retVal;
}

