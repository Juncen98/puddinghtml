//
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//
//jumpMenuUI.js
//
//Set of functions for use with the Jump Menu object
//and Jump Menu behavior, and who knows, other files might
//access as well in the future
//
//--------------------------------------------------------------
//

//function:populateMenuOptions
//description: populates the Menu Options form field
//based on the contents of GarrMenuOptions. Overloaded to
//behave differently depending on number of arguments.
//arguments:
//none - updates entire form field
//otherwise, updates only the indexes passed as arguments
//for instance populateMenuOptions(2) updates the third listed option,
//populateMenuOptions(2,3) updates the third and fourth.

function populateMenuOptions(){
   var opArr = GarrMenuOptions; //easier to deal with a short name
   var argArr = populateMenuOptions.arguments;
   var nArgs = argArr.length;
   var i;
   
   if (nArgs == 0){ //if no args, update all options
      var nOptions = GarrMenuOptions.length;
      var optionLabel;
      
      for (i=0;i<nOptions;i++){
         GlistOptions.options[i] = new Option();
         optionLabel = createOptionLabel(opArr[i][0],opArr[i][1]);
         GlistOptions.options[i].text = optionLabel;
      }
      
   } 
   else { //if args, only update specified options
   
      var currArg;
      var newLabel="";

      for (i=0;i<nArgs;i++){
         currArg = argArr[i];
         newLable = createOptionLabel( opArr[currArg][0],opArr[currArg][1] );
         GlistOptions.options[currArg].text = newLable;             
      }  
   }
}

//function: isAllWhite
//description: given a text string, determines if there are any non-whitespace
//characters 
//Its used because if an URL is only whitespace, we don't want to display it as:
//Label(  ), we want instead to not use the (), which is confusing here.
//returns: boolean

function isAllWhite(str){
   var isAllWhite = true,i,c,counter=0;
   
   while (  str.charAt(counter)  ){
      c = str.charAt(counter++);
      if ( c != ' ' && c != '\t' && c != '\n' && c != '\r' ){
         isAllWhite = false;
         break;
      }
   }
  
   return isAllWhite;    
}

//function: createOptionLabel
//description: passed option text and option URL, generates
//the text string that appears in Menu Options form field
function createOptionLabel(Text,URL){
   if (  URL && !isAllWhite(URL)  )
      return (  Text + "  (" + URL + ")"  );
   else
      return Text ;
}

//function addOption
function addOption(){
   var newInd = GarrMenuOptions.length;

   if (newInd==0 || GarrMenuOptions[newInd-1][0]) {
     GarrMenuOptions[newInd] = new Array(getUniqueLabel(),"");
     GlistOptions.options[newInd] = new Option(GarrMenuOptions[newInd][0]);
     GlistOptions.selectedIndex = newInd;
     GtfLabel.value = GarrMenuOptions[newInd][0];
     GtfURL.value = GarrMenuOptions[newInd][1];
   }
   GtfLabel.focus();
   GtfLabel.select();
}

//function switchArrayEntries
//description: acts on GarrMenuOptions only ( not UI )
//switches the specified indexes
//called from moveOptionUp() and moveOptionDown();

function switchArrayEntries(arr,ind1,ind2){
   var temp = arr[ind1];
   arr[ind1] = arr[ind2];
   arr[ind2] = temp;
   //arrays are passed by reference and not by value so
   //there is no need to return anything
}

//function deleteOption
function deleteOption(){

   //easier to deal with a shorter name
   var opArr = GarrMenuOptions; 
   
   var nOptions = opArr.length;
   var selInd = GlistOptions.selectedIndex;
   
   //update global array
   if (selInd > 0){ //if the first option is not selected
      if (selInd!=opArr.length-1){ //if last option isn't selected
         opArr = opArr.slice(0,selInd).concat( opArr.slice(selInd+1) );
      } else{ //last option is selected
         opArr = opArr.slice(0,-1);
         selInd--;
      }
   } else { //first option is selected
       if (opArr.length > 1){  //if there is more than one item in list
         opArr = opArr.slice(1);
       } else{  //if there is only one item in list
         opArr[0] = new Array("","");
       }
   }
   //delete extra (empty) option now available in Menu Options field
   //i.e.: delete the selected option
   GarrMenuOptions = opArr;
   populateMenuOptions(); //populate UI with updated global option array
   if (  nOptions!=1  ){
      GlistOptions.options[nOptions-1] = null;
   } 
   if (  nOptions==1 || nOptions==2  ){
      GtfLabel.focus();
   }
   GlistOptions.selectedIndex = selInd;
   //update Label & URL fields to selected option Label & URL
   GtfLabel.value = GarrMenuOptions[selInd][0];
   GtfURL.value   = GarrMenuOptions[selInd][1];
   
}


//function moveOptionUp
function moveOptionUp(){

   var currInd = GlistOptions.selectedIndex;
   var switchInd = currInd-1;
   
   //return if this is the top option
   if (currInd == 0)
      return;
    
   //update global array and re-populate Menu Options field
   switchArrayEntries(GarrMenuOptions,currInd,switchInd); //update array
   populateMenuOptions(currInd,switchInd);  //update UI
   
   //select new location
   GlistOptions.selectedIndex = switchInd;
   showOption(switchInd);
}


//function moveOptionDown
function moveOptionDown(){

   var currInd = GlistOptions.selectedIndex;
   var switchInd = currInd+1;

   //return if this is the bottom most option
   if (currInd == GarrMenuOptions.length-1)
      return;

   //update global array and re-populate Menu Options field
   //based on new global array
   switchArrayEntries(GarrMenuOptions,currInd,switchInd); //update array
   populateMenuOptions(currInd,switchInd); //update UI
   
   //select new location
   GlistOptions.selectedIndex = switchInd;
   showOption(switchInd);
}

//function: showOption
//description: shows Label and URL values when a selection is clicked
//in Menu Options list
function showOption(){
   var currInd = GlistOptions.selectedIndex;
   GtfLabel.value = (GarrMenuOptions[currInd][0])?GarrMenuOptions[currInd][0]:"";
   GtfURL.value   = (GarrMenuOptions[currInd][1])?GarrMenuOptions[currInd][1]:"";

}

//function updateOption
//updates global array and re-writes to screen
//attached to onBlur of Label and URL fields as:
//updateOptionValues(this.name);
//and to Browse button as:
//updateOptionValues("URL");
//
//argument: "URL" or "Label"

function updateOption(whatToUpdate){
   var currInd = GlistOptions.selectedIndex;
   var updateInd = 0;
   var newTextStr = "";
   
   if (whatToUpdate == "Label"){
      newTextStr = GtfLabel.value;
   } else {
      updateInd = 1;
      newTextStr = GtfURL.value;
      if (GtfLabel.value.indexOf(TEXT_defaultItemText)==0) { //if default label, change to simple file name
        var startPos = newTextStr.lastIndexOf("/");
        var endPos = newTextStr.lastIndexOf(".");
        if (endPos > 0) {
          GtfLabel.value = newTextStr.substring(startPos+1,endPos);
          updateOption('Label');
        }
      }
   }
   GarrMenuOptions[currInd][updateInd] = newTextStr;
   populateMenuOptions(currInd);
}



function browseClicked() {
  browseFile(GtfURL);
  updateOption('URL');
}

function getUniqueLabel() {
  var label, i, num=1, isUnique;

  for (isUnique=false; !isUnique; num++) {
    label = TEXT_defaultItemText + num;
    isUnique = true;
    for (i=0; i<GarrMenuOptions.length && isUnique; i++)
      if (GarrMenuOptions[i][0] == label) isUnique=false;
  }
  return label;
}
