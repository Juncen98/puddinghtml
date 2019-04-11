
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//********************GLOBAL VARIABLES*************************

var helpDoc = MM.HELP_behJumpMenu;

//initialized in initGlobals()

var GlistOptions;
var GtfLabel;
var GtfURL;
var GselTarget;
var GcbRestore;
var GarrMenuOptions;
var GprevTarget;
var GbPrevRestore;
var GbValidContext;


//function initGlobals
//description: called from initializeUI(), initializes global variables

function initGlobals(){

   //initialize form widget variables:
   var theForm    = document["mainLayer"].document.forms[0];
   GlistOptions   = theForm.ListOptions;
   GtfLabel       = theForm.Label;
   GtfURL         = theForm.URL;
   GselTarget     = theForm.Target;
   GcbRestore     = theForm.FirstOption;
   
   //initialize global array used for storing menu option info
   GarrMenuOptions = new Array();
   
   //determines if behavior can be applied given current context
   GbValidContext = true;
   
}


//BEHAVIOR FUNCTION(S)

//function: MM_jumpMenu
//description: changes the URL of the main window or chosen frame
//arguments: targ - target, it is either 'parent' or a frames reference, e.g.:
//document.frames[\'myFrame\']
//selObj - the menu item, always passed in as a "this" reference
//restore - boolean represented as 0(false) or 1(true)

function MM_jumpMenu(targ,selObj,restore){ //v3.0
  eval(targ+".location='"+selObj.options[selObj.selectedIndex].value+"'");
  if (restore) selObj.selectedIndex=0;
}


//***************************API FUNCTIONS************************

function canAcceptBehavior(behTag){
  var retVal = false;
  var selObj = dw.getBehaviorElement();
  if (!selObj && behTag)
    selObj = dw.getDocumentDOM().getSelectedNode();
  if (selObj && selObj.tagName && selObj.tagName == "SELECT")
    retVal = 'onChange';
    
  // check if the select only contains option values.
  //  If it contains other values, we will blow them away on update, so
  //  don't allow the user to apply the behavior
  if (retVal && selObj.hasChildNodes())
  {
    for (var i=0; i < selObj.childNodes.length; i++)
    {
      var node = selObj.childNodes[i];
      if (!node || !node.tagName || node.tagName.toUpperCase() != "OPTION")
      {
        retVal = false;
        break;
      }
      
      if (node.attributes && node.attributes.length > 0)
      {
        for (var k=0; k < node.attributes.length; k++)
        {
          var attrName = (node.attributes[k].name) ? node.attributes[k].name.toLowerCase() : "";
          if (attrName != "value" && attrName != "selected")
          {
            retVal = false;
            break;
          }
        }
      }
    }
  }

  return retVal;
}

function behaviorFunction(){
   return "MM_jumpMenu";
}

function identifyBehaviorArguments(){
   return "other,other,other";
}

//function: applyBehavior
//returns Jump Menu function call with 3 arguments: target,thisObj,bRestore

function applyBehavior(){

   // if context isn't valid, don't bother with the rest
   // returning an emptry string from this function means the dialog
   // closes if the user clicks the OK button
   // the dialog has already been populated with a friendly error message
   // in the initialize UI function
   if ( !GbValidContext )
      return "";
	  
   var selObj = dreamweaver.getBehaviorElement();
   var selInd = selObj.selectedIndex;
   var optionStr = "";
   var target = escQuotes(GselTarget.options[GselTarget.selectedIndex].value);
   var bRestore= (GcbRestore.checked)?1:0;
   var nOptions = GarrMenuOptions.length,i;
   
   //update options of Jump Menu - text and the value attribute
   for (i=0;i<nOptions;i++){
      if (GarrMenuOptions[i][0] || GarrMenuOptions[i][1]){
         optionStr += (GarrMenuOptions[i][1])?'<option value="' + GarrMenuOptions[i][1] + '">':
	                                         '<option>';                   
	     optionStr += GarrMenuOptions[i][0] + '</option>\n';
	  }
   }
   
   //set new option string (optionStr) to  be innerHTML of select tag
   selObj.innerHTML = optionStr;
   //restore previous selected index
   selObj.selectedIndex = (selInd!=-1)?selInd:0;
   
   
   //if target or restore options have changed, 
   //and this menu has one or more associated Go Buttons, the
   //MM_jumpMenuGo function calls attached to these buttons
   //need to be updated with the correct target and restore values.
   if ( target != GprevTarget ||  bRestore != GbPrevRestore ) 
     updateGoBtnFnCalls(target,bRestore,selObj);

   //create return value - the function call that gets attached to the event
   var retVal = "MM_jumpMenu('" +
                target + "'," +    //add target argument
                "this," +          //add "this" argument
                bRestore + ")";    //add restore argument
 
   return retVal;
   
}

//function: inspectBehavior
//description: passed a function call, extrapolates information
//to correctly update the UI

function inspectBehavior(behFnCallStr){

   //extrapolate arguments of the function
   var argArr = extractArgs(behFnCallStr);
   argArr = argArr.slice(1); //first arg is function name, delete it
   
   //fill in Open URLs In field
   selectTarget(argArr[0]);
   
   //check Select First Option After Chaning URL if applicable
   if (argArr[2]==1)
     GcbRestore.checked = true;
   
   //store initial values of restore and target menu --
   //if they have changed when OK is clicked, MM_jumpButtonGo function
   //calls on any associated Go buttons need to be changed
   GprevTarget = GselTarget.options[GselTarget.selectedIndex].value;
   GbPrevRestore = (GcbRestore.checked)?1:0;
 
}


//********************LOCAL FUNCTIONS*************************

//function: updateGoBtnFnCalls
//description: if a go button is associated with a select menu, and the
//target or restore argument in the MM_jumpMenu function call is changed,
//the respective arguments in any MM_jumpMenuGo function calls associated with
//the current menu must be changed as well.
//
//Regular expression syntax is used to find all MM_jumpMenuGo function
//calls in the document. The function calls are then parsed to see if they are associated
//with this menu, and if so, the arguments are updated, and the document regenerated
//based on the new function call(s)

function updateGoBtnFnCalls(target,bRestore,selObj){
   
   //first of all, lets put together the pattern we are looking for:
   var menuName = selObj.name;
   var pattern = "MM_jumpMenuGo\\(\\s*\\'" + menuName + "\\'\\s*,[^\\)]*\\)";
   var oldFnCall = new RegExp(  pattern,"g"  );
   
   //then replace the old function with the new one      
   var newFnCall =  "MM_jumpMenuGo('" + menuName + "','" + target + "',"+ bRestore  + ")";
   var dom = dw.getDocumentDOM();
   var bodyStr = dom.body.outerHTML;
   var goBtnFnFound = ( bodyStr.search(oldFnCall) != -1);
   if (goBtnFnFound) {
     var newBodyStr = dom.body.outerHTML.replace(oldFnCall,newFnCall);
     dom.body.outerHTML = newBodyStr;
   }

}


//function: escChars
//description: given a text string, escapes certain characters

function escChars(theStr){
  var i, theChar, escStr = "";
  for(var i=0; i<theStr.length; i++) {
    theChar = theStr.charAt(i);
    escStr += (theChar=='"' || theChar=="'" || theChar=="\\" || theChar=="."
	          || theChar=="(" || theChar==")")?("\\"+theChar):theChar;
  }
  return escStr;
}



//function: selectTarget
//description: matches the target argument of the function call
//to an existing option in the Target Menu (aka Open URLs in), and selects it. 
//If not found, an option is created at the bottom of the list and selected.
//default is that the "Main Window" option is selected, so it is only
//changed if the target argument is a frame.

function selectTarget(target){
   var frameName;
   var nTargetOptions;
   var i;
   var bMatchFound;
   
   if (target != 'parent'){ //if we have a frame
	  //compare the target to the frame reference strings
	  //that are stored in the value attributes of the option tags.  
	  nTargetOptions = GselTarget.options.length;
	  bMatchFound = false;
	  
	  for (i=0;i<nTargetOptions;i++){
	     if (target == GselTarget.options[i].value){
		    GselTarget.selectedIndex = i;
			bMatchFound = true;
			break;
		 }
	  }
	  
	  if (!bMatchFound){
	     //we have a case where the target argument is not in the current frameset,
		 //and therefore not listed in the Target menu
		 //this can occur if a frame that is part of a frameset is opened in dreamweaver
		 //independent of that frameset. 
         //Add the target argument as an option at the bottom
		 //of the Target menu, and select it.
		 frameName = extrapolateFrameName(target);
	     GselTarget.options[nTargetOptions] = new Option(MM.TYPE_Frame + '"' + frameName + '"');
		 GselTarget.options[nTargetOptions].value = target;
		 GselTarget.selectedIndex = nTargetOptions;
	  }
   }   

}

//function: initGlobalOptionsArr
//description: the global options arr, stored in the variable GarrMenuOptions,
//stores all of the option label and URLs.
//GarrMenuOptions is a multi-dimensional array, where
//[i][0] is the text label and [i][1] is the URL value
//argument: selObj - a menu object. GarrMenuOptions is created
//from the text and value attributes of the menu options.

function initGlobalOptionsArr(selObj){
   var optionsArr =  selObj.childNodes;
   var nOptions  =   optionsArr.length;
   var i;
   
   for (i=0;i<nOptions;i++){
      GarrMenuOptions[i] = new Array(2);
      GarrMenuOptions[i][0] = optionsArr.item(i).innerHTML || "";
      GarrMenuOptions[i][1] = optionsArr.item(i).value || "";
      if (GarrMenuOptions[i][0]=="" && GarrMenuOptions[i][1]=="") { //exists, but empty
        GarrMenuOptions[i][0] = getUniqueLabel(); //create label
     }
   }
   if (nOptions == 0){
      GarrMenuOptions[0] = new Array(getUniqueLabel(),"");
   }
}



//function: initializeUI
//description: initializes the UI on document onload
//populates the Menu Options text area, the Label text field,
//the URL text field, and the frame target menu.
//also checks if the selection is valid

function initializeUI(){
   
    //Give users feedback if selection is not correct
   //if invalid selection, display error message
   //(done in inInvalidSelection function), and return
   var selObj = dreamweaver.getBehaviorElement();

   if (  isInvalidSelection(selObj)  ){
     GbValidContext = false;
     return;
   }

		
   //selection is valid, so show main layer
   //it starts out hidden, otherwise there is flashing
   //effect from one dialog with text coming up for a few
   //nanoseconds and then turning into error text
   document.layers["mainLayer"].visibility = "visible";
   
   //initialize global variables
   initGlobals();
   
   //populate frame target picklist, & select first one
   populateFrameTargetMenu(GselTarget);
   
    //fill in Menu Options by populating the global options
	//array and then populating the Menu Options field based
	//on this array
   initGlobalOptionsArr(selObj);
   populateMenuOptions();
   
   
   //fill in Label & URL fields
   //if no options, add one, and put focus in label field
   if ( GarrMenuOptions.length == 0) {  //if there are no options
     addOption();  //add an option
   }
   GlistOptions.selectedIndex = 0; //select first option
   GtfLabel.value = GarrMenuOptions[0][0];
   GtfURL.value   = GarrMenuOptions[0][1];
   GtfLabel.focus();  //put focus in Label field
   GtfLabel.select(); //select Label field
}

//function: checkValidity
//description: this behavior can only be attached to a select menu.
//checks selection and displays helpful error message in dialog
//if selection is not a select menu

function isInvalidSelection(currObj){
   var isValid = true,node;
  
   if (!currObj.tagName || currObj.tagName!="SELECT"){
      isValid = false;
      node = document.mainLayer;
      node.innerHTML = "<BR><BR><BR><BR><div align=center><table width=80% bgcolor='#D3D3D3'><tr><td>"
	                         + MSG_Invalid_Selection + "<BR><BR>"
	                         + MSG_Correcting_Selection + "</td></tr></table></div>";
      document.layers["mainLayer"].visibility = "visible";
   }
   return (  !isValid  );

}

//function: populateFrameTargetMenu
//description: called from initializeUI, populates the frame
//target menu with names of the frames in the current frameset.
//if there is no frameset, populates menu with only one choice:
//"Main Window"

function populateFrameTargetMenu(selectObj){
   var counter = 0;
   var frameList;
   
   selectObj.options[counter] = new Option(MM.TYPE_MainWindow);
   selectObj.options[counter++].value = 'parent';
   
   frameList=getObjectRefs("NS 4.0","parent","frame"); //get list of frames
   if (frameList && frameList.length>0) { //if frames
   //if the frame has a name, add name to target picklist
      for (i=0; i<frameList.length; i++) {
         if (frameList[i].indexOf('unnamed')==-1){ //if the frame has a name
            frameName=extrapolateFrameName(frameList[i]);
            selectObj.options[counter] = new Option(MM.TYPE_Frame + ' "' + frameName + '"');
		    selectObj.options[counter++].value = frameList[i];
		 }
      }
	}
   
    //select first item
	selectObj.selectedIndex = 0;
}

// function: extraplateFrameName
//description: given a frame reference, e.g: document.frames[\'myFrame\'],
//returns the frame name

function extrapolateFrameName(frameRef){
   return frameRef.substring(frameRef.indexOf("['")+2,frameRef.indexOf("']"));
}
