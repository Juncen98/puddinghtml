
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************************API**************************

<!--Copyright 2000 Macromedia, Inc. All rights reserved.-->

var helpDoc =  MM.HELP_cmdCFAddColumn; 
function commandButtons(){
  return new Array(MM.BTN_OK,     "okClicked()",
                   MM.BTN_Cancel,"cancelClicked()",
					MM.BTN_Help,"displayHelp()" );
}



//*******************LOCAL FUNCTIONS*********************

function initializeUI(){
   var colArr = MM.commandArgument;
   var colList = document.theForm.Columns;
   var nNewItems = colArr.length,i,j;
   var nOldItems = colList.options.length;


   for (i=0;i<nNewItems;i++){
     colList.options[i] = new Option();
     colList.options[i].text = colArr[i];
   }
   // delete old items
   // go backwards to prevent JS errors
   if (nOldItems > nNewItems){
      for (j=nOldItems-1;j>=i;j--){
       colList.options[j] = null;
    }
   }

}

function cancelClicked(){
   MM.commandReturnValue = "";
   window.close();
}

function okClicked(){
  var retArr = new Array();
  var colList = document.theForm.Columns;

  if ( colList.selectedIndex == -1 ){
     retArr = ""
  } else {
     var nOptions = colList.options.length, i

   for (i=0;i<nOptions;i++){
     if (  colList.options[i].getAttribute("selected")  ){
       retArr.push(colList.options[i].text);
     }
   }
  }

  MM.commandReturnValue = retArr;
  window.close();
}