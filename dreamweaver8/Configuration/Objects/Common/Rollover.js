//
// Copyright 1998, 1999, 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
// ----------------------------------------------------
//
// Rollover.js
//
// See Commands/Rollover.js for implementation of Rollover
// Image object
//

//*************** GLOBALS *********************

//*************** API *************************

function objectTag() {
   var rolloverTag = callCommand("Rollover.htm");
   if (rolloverTag) { //if inserting call, update the behavior functions as needed
     updateBehaviorFns("MM_findObj","MM_swapImgRestore","MM_preloadImages","MM_swapImage");
   } else {
     rolloverTag = '';
   }
   return(rolloverTag);
}

