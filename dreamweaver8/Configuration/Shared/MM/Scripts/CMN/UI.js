//SHARE-IN-MEMORY=true
//
// Copyright 2000, 2001, 2002, 2003, 2004 Macromedia, Inc. All rights reserved.
//
//UI.js
//
//Generic functions that control the UI.
//Functions specific to controlling menu item text is stored in menuItem.js
//
//--------------------------------------------------------------
//
//
//findObject(objName,  parentObj)
//loadSelectList()


//given an object name, returns an obj in current document or frameset
//with that name

function findObject(objName,  parentObj) {
  var i,tempObj="",found=false,curObj = "";
    parentObj = (parentObj != null)? parentObj.document : document;
    if (parentObj[objName] != null) curObj = parentObj[objName]; //at top level
    else { //if in form
      if (parentObj.forms) for (i=0; i<parentObj.forms.length; i++) {  //search level for form object
        if (parentObj.forms[i][objName]) {
          curObj = parentObj.forms[i][objName];
          found = true; break;
      } }
      if (!found && parentObj.layers && parentObj.layers.length > 0) {
        parentObj = parentObj.layers;
        for (i=0; i<parentObj.length; i++) { //else search for child layers
          tempObj = findObject(objName,parentObj[i]); //recurse
          if (tempObj) { curObj = tempObj; break;} //if found, done
  } } } 
  return curObj;
}



/////////////////////////////////////////////////////////////////////////////
// Function
//    loadSelectList
//
// Purpose
//    In order to simplify localizations, the text strings for select
//    list options are listed at the top of the .htm files in the
//    Localizable Global Variables section.  When the dialog is loaded,
//    the select widget options are dynamically updated with the
//    localized text strings by calling loadSelectList().
//    
// Parameters
//    selectListObj - the select object to populate
//    locallizedArr - the array of strings for the names of the options.
//
// Optional Parameters
//    containsValues - boolean indicating whether the string array
//       also contains values.  true if it does, false if not.  If
//       it contains values, the array is in the format of option
//       name, value, option name, value...
//    selectedIndex - the option to select initially
//
function loadSelectList(selectListObj, localizedArr)
  // Optional params: containsValues,  selectedIndex
{
   var arrLen = localizedArr.length;
   var containsValues, selectedIndex;
   var i;
   
   if(loadSelectList.arguments.length >= 3)
      containsValues = loadSelectList.arguments[2];
   else
      containsValues = false;

   if(loadSelectList.arguments.length >= 4)
      selectedIndex = loadSelectList.arguments[3];
   else
      selectedIndex = 0;
   
   if(containsValues)
   {
      // The array contains values for each list item.  We
      // need to set the values too.
      for(i = 0; i < arrLen/2; i++)
      {
         selectListObj.options[i] = new Option(localizedArr[i*2]);
         selectListObj.options[i].value = localizedArr[i*2+1];
      }
   }
   else
   {
      for(i = 0; i < arrLen; i++)
         selectListObj.options[i] = new Option(localizedArr[i]);
   }
   
   // Select one of the items by default
   selectListObj.selectedIndex = selectedIndex;
}



//function: getSelectedOptionAttr
//description: given a select object and an attribute, returns the value of that
//attribute for the selected option

function getSelectedOptionAttr(selectListObj, attr){
   var selInd = selectListObj.selectedIndex;
   return selectListObj.options[selInd][attr];
}

/////////////////////////////////////////////////////////////////////////////
// Function
//    wrapTextForAlert
//
// Purpose
//    Alert dialog boxes take the string that you give and display it.
//    However, it does not wrap the string if it is too long.  So, what
//    you get is an alert box with a really long one line string.  This
//    function will take the specified string and insert carriage
//    returns at the specified columns to "wrap" the string.
//
// Parameters
//    string - the string to wrap
//    cols - integer where to wrap the string (eg 65, 80, 100)
//
// Returns
//    the wrapped string
//
function wrapTextForAlert(str, cols)
{
   var i;
   var ch;
   var lastws = 0;
   var colToWrap = cols;
   var wrapString = (str)?str:'';
   
   for(i = 0; i < wrapString.length; i++)
   {
      ch = wrapString.charAt(i);
      if(ch == ' ' || ch == '\t')
         lastws = i;
      if (ch == '\n')
      {
         lastws = i;
         colToWrap = lastws + cols;
      }

      if(i >= colToWrap && lastws != 0)
      {
         wrapString = wrapString.substring(0, lastws) + "\n" +
            wrapString.substring(lastws+1);
         colToWrap = lastws + cols;
      }
   }
   
   return wrapString;
}
