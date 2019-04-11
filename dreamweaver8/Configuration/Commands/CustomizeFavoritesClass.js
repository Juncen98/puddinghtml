//SHARE-IN-MEMORY=true
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//--------------------------------------------------------------------
// CLASS:
//   CustomizeFavorites
//
// DESCRIPTION:
//   This class is used to by the Customize Favorite Objects dialog to 
//   interface (read/write) with the insertbar.xml file  
//
// PUBLIC FUNCTIONS:
//
//   initializeUI() - initializes the UI 
//   store()        - processes the UI and writes out XML to the favorites category of insertbar.xml 
//   addSeparator() - helper function that adds a separator bar 
//   addFavorite()  - helper UI function that adds 


//*************** GLOBALS VARS *****************
var aObjectPath = dw.getConfigurationPath() + "//Objects//insertbar.xml"; 
var SEPARATOR = "------"; 
var SPACER = " - "; 
var FAVORITEIDSUFFIX = "Fav"; 

//*-------------------------------------------------------------------
// OBJECT:
//	CustomizeFavorites
//--------------------------------------------------------------------

// public methods 

CustomizeFavorites.prototype.initializeUI   = CustomizeFavorites_initializeUI; 
CustomizeFavorites.prototype.addSeparator   = CustomizeFavorites_addSeparator; 
CustomizeFavorites.prototype.store          = CustomizeFavorites_store; 
CustomizeFavorites.prototype.deleteFavorite = CustomizeFavorites_deleteFavorite; 
CustomizeFavorites.prototype.addFavorite    = CustomizeFavorites_addFavorite; 
CustomizeFavorites.prototype.upButton       = CustomizeFavorites_upButton; 
CustomizeFavorites.prototype.downButton     = CustomizeFavorites_downButton; 
CustomizeFavorites.prototype.setAddButtonDisabled     = CustomizeFavorites_setAddButtonDisabled; 
CustomizeFavorites.prototype.setAvailableObjects = CustomizeFavorites_setAvailableObjects; 
CustomizeFavorites.prototype.insertBarDOM = ""; 

//--------------------------------------------------------------------
// FUNCTION:
//   CustomizeFavorites
//
// DESCRIPTION:
//   Constructor
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function CustomizeFavorites(AVAILABLE_OBJECTS_LIST,FAVORITE_OBJECTS_LIST,AVAILABLE_CATEGORIES_LIST)
{
  this.AVAILABLE_OBJECTS_LIST =  AVAILABLE_OBJECTS_LIST; 
  this.FAVORITE_OBJECTS_LIST = FAVORITE_OBJECTS_LIST; 
  this.AVAILABLE_CATEGORIES_LIST = AVAILABLE_CATEGORIES_LIST; 
}

//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.initializeUI
//
// DESCRIPTION:
//   Initializes the UI for the Customize Favorites Object dialog 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   true if successful, false otherwise 
//--------------------------------------------------------------------

function CustomizeFavorites_initializeUI()
{
  // initialize variables
  var theDOM = dw.getDocumentDOM(aObjectPath); 
  var theCategories; 
  var theCategoryNames = new Array(MM.LABEL_CustomizeObjectsAll); 
  var theCategoryValues = new Array("all"); 
  var theButtons; 
  var buttonNames = new Array(); 
  var buttonValues = new Array(); 
  var favoriteNames = new Array(); 
  var favoriteValues = new Array(); 
  var retValue = false; 
  
  if (theDOM) 
  {
    // get all of <category> tags 
    theCategories = theDOM.getElementsByTagName("category");
       
    // if we have some categories 
    if (theCategories && theCategories.length)
    {                 
      this.insertBarDOM = theDOM; 

      // for every category 
      for (var z=0;z<theCategories.length;++z)
      {
        // if the current actegory node exists 
        if (theCategories[z])
        {
          // and it has both a name and an ID 
          if (theCategories[z].id && theCategories[z].id.length && theCategories[z].name && theCategories[z].name.length)
          {           
            // and we're not dealing with the favorites (we want to exclude this) 
            if (theCategories[z].id != "DW_Insertbar_Favorites")
            {
              // add to filter list arrays 
              theCategoryNames.push(theCategories[z].name); 
              theCategoryValues.push(theCategories[z].id); 

              // for every category 
              // var cleanCategory = theCategories[z].id.replace("dw_InsertBar_", "", "gi"); 
            
              // add to the button names the name and an empty string as the value 
              buttonNames.push(theCategories[z].name); 
              buttonValues.push(""); 
              
              // grab all the the buttons for this category 
              var theButtons = theCategories[z].getElementsByTagName("button");            
          
              // for every button in this category 
              for (var i=0;i<theButtons.length;++i)
              {  
                // if it has a name and an ID 
                if (theButtons[i].id && theButtons[i].id.length && theButtons[i].name && theButtons[i].name.length)
                {
                  // push the button name and id 
                  buttonNames.push(SPACER + theButtons[i].name); 
                  buttonValues.push(theButtons[i].id); 
                }
              }
            }
            else if (theCategories[z].id == "DW_Insertbar_Favorites")
            {
              var theChildCategoryNodes = theCategories[z].childNodes; 
                            
              if (theChildCategoryNodes && theChildCategoryNodes.length)
              {
                for (var i=0;i<theChildCategoryNodes.length;++i)
                {
                  // alert(theChildCategoryNodes[i].tagName); 
                  if (theChildCategoryNodes[i].tagName.toLowerCase() == "separator" )
                  {
                    favoriteNames.push(SEPARATOR); 
                    favoriteValues.push("separator"); 
                  }
                  else 
                  {
                    if (theChildCategoryNodes[i].name && theChildCategoryNodes[i].name.length && theChildCategoryNodes[i].id && theChildCategoryNodes[i].id.length)
                    {
                      favoriteNames.push(theChildCategoryNodes[i].name); 
                      favoriteValues.push(theChildCategoryNodes[i].id); 
                    }
                  }
                }
              }
              else
              {
                // ** There were no categories found. 
                // alert("Error: this category does not appear to have a valid category."); 
              }

              /*
              // in the case of the favorites category, we want to add this to 
              // the favorites list control 
              var theButtons = theCategories[z].getElementsByTagName("button"); 
                        
              // for every button in the the favorites cateogry 
              for (var i=0;i<theButtons.length;++i)
              {               
                // if the button has a realy name and id 
                if (theButtons[i].name && theButtons[i].name.length && theButtons[i].id && theButtons[i].id.length)
                { 
                  // push the id and names 
                  favoriteNames.push(theButtons[i].name); 
                  favoriteValues.push(theButtons[i].id); 
                }
              } 
              
              */            
            }
          }
        }    
        
        if (z < (theCategories.length-1))
        {
          buttonNames.push(""); 
          buttonValues.push("");
        }  
      }
     
      // set the values for all lists 
      this.AVAILABLE_CATEGORIES_LIST.setAll(theCategoryNames,theCategoryValues);       
      this.AVAILABLE_OBJECTS_LIST.setAll(buttonNames,buttonValues); 
      this.FAVORITE_OBJECTS_LIST.setAll(favoriteNames,favoriteValues); 
      
      // set focus to available objects list 
      this.AVAILABLE_OBJECTS_LIST.focus(); 

      retValue = true; 
    }
    else
    {
      alert("There were no button ID's found."); 
    }    
  }  
  return retValue; 
}


//--------------------------------------------------------------------
// FUNCTION:
//   SQLStatement.store
//
// DESCRIPTION:
//   Writes the favorite objects specified by the user to insertbar.xml and, 
//   once completed, reloads all objects in the Insert Bar. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   true if successful, false otherwise 
//--------------------------------------------------------------------

function CustomizeFavorites_store()
{
  var favoritesXML = ""; 
  var buttonNodes; 
 
  // close the window 
  window.close();

  // get the DOM of the insert bar 
  var theDOM = dw.getDocumentDOM(aObjectPath);

  // otherwise if we have a valid DOM 
  if (theDOM)
  {
    // get all of the button ID's 
    buttonNodes = theDOM.getElementsByTagName("button");    
  } 
     
  // if there's at least one favorite 
  if (this.FAVORITE_OBJECTS_LIST.getLen() > 0)
  {

    // define a new profiler object
    // var aProfiler = new Profiler(); 
    // aProfiler.addCapture("Begin Profile -- Preparing to call fooBar()"); 
    
    // for every object in the favorite objects list 
    for (var i=0;i<this.FAVORITE_OBJECTS_LIST.getLen();++i)
    {
      // add a time stamp 
      // aProfiler.addCapture("i= " + i);
      
      //  get the current value  
      var curValue = this.FAVORITE_OBJECTS_LIST.getValue(i); 
      
      // if the current value exists 
      if (curValue && curValue.length)
      {
        // if the cur value is a separator 
        if (curValue == "separator")
        {
          // add separator code 
          favoritesXML += "\n\r" + "<separator />"; 
        }
                      
        // set the foundNode var to default false 
        var foundNode = false; 
          
        // for every button 
        for (var k=0;k<buttonNodes.length;++k)
        {
          // if we haven't found the node 
          if (!foundNode)
          {
            // if the current button id matches the current vlaue 
            if (buttonNodes[k].id == curValue)
            {
              // alert("found node!" + buttonNodes[k].outerHTML); 
              foundNode = true; 
              var id = buttonNodes[k].id; 
              
              if (id.substring(id.length-3,id.length) != FAVORITEIDSUFFIX)
              {
                buttonNodes[k].id = buttonNodes[k].id + FAVORITEIDSUFFIX; 
              } 
              
              favoritesXML += "\n\r" + buttonNodes[k].outerHTML; 
            }
          }
        }
      }
    }
  } 
  else
  {
    favoritesXML = "empty"; 
  }
  
  // if we have some xml that was created 
  if (favoritesXML && favoritesXML != "" && theDOM)
  {      
    if (favoritesXML == "empty")
    {
      favoritesXML = ""; 
    }
    
    // get an empty DOM so we can add the XML to it since
    // we cannot directly alert the source DOM. Later, we 
    // will reassign the outer HTML of that DOM to this one 
    
    var newDOM = dwscripts.getEmptyDOM(); 
    
    newDOM.documentElement.outerHTML = theDOM.documentElement.outerHTML; 
    
    var arrCategories = newDOM.getElementsByTagName("category"); 
    
    for (var z = 0; z<arrCategories.length;++z)
    {
      if (arrCategories[z].id && arrCategories[z].id == "DW_Insertbar_Favorites")
      {
        arrCategories[z].innerHTML = favoritesXML; 
      }
    }
    
    theDOM.documentElement.outerHTML = newDOM.documentElement.outerHTML;  

    var writeResult = DWfile.write(aObjectPath,   theDOM.documentElement.outerHTML); 
           
    if (writeResult)
    {
      dw.reloadObjects();

    }
    else 
    {
      alert("Error: Unable to write out to insertobject.xml file. "); 
    }
  }

} 


//--------------------------------------------------------------------
// FUNCTION:
//   addSeparator
//
// DESCRIPTION:
//   Adds a separator item to the favorites list control after the currently 
//   selected item. A separator appears as a vertical line and helps the 
//   user define a set of related objects in the Favorites bar. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   true if successful, false otherwise
//--------------------------------------------------------------------

function CustomizeFavorites_addSeparator()
{
  var retValue = true; 
  this.FAVORITE_OBJECTS_LIST.add(SEPARATOR, "separator"); 
  
  return retValue; 
}

//--------------------------------------------------------------------
// FUNCTION:
//   deleteFavorite
//
// DESCRIPTION:
//   Deletes the currently selected item in the favorites list. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   true if successful, false otherwise
//--------------------------------------------------------------------

function CustomizeFavorites_deleteFavorite()
{
  var retValue = true; 
  this.FAVORITE_OBJECTS_LIST.del(); 
  
  return retValue; 
}

//--------------------------------------------------------------------
// FUNCTION:
//   addFavorite
//
// DESCRIPTION:
//   Adds the selected object from the available objects list into 
//   the favorites list
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   true if successful, false otherwise 
//--------------------------------------------------------------------

function CustomizeFavorites_addFavorite()
{
  var retValue = false; 
  var selectedObject = this.AVAILABLE_OBJECTS_LIST.getValue(); 
  
  var canAdd = true; 

  if (!selectedObject || selectedObject == "")
  {
    canAdd = false; 
  }
  
  if (canAdd)
  {
    for (var i=0;i<this.FAVORITE_OBJECTS_LIST.getLen();++i)
    {
      if (this.FAVORITE_OBJECTS_LIST.getValue(i))
      {
        if (this.FAVORITE_OBJECTS_LIST.getValue(i) == selectedObject)
        {
          canAdd = false; 
          alert(MM.MSG_CustomizeObjectsAlreadyAdded); 
        }
      }
    }
  } 
  
  if (canAdd)
  {
    var curName = this.AVAILABLE_OBJECTS_LIST.get(); 
    curName = curName.replace(SPACER, "", "gi"); 
    this.FAVORITE_OBJECTS_LIST.add(curName, this.AVAILABLE_OBJECTS_LIST.getValue());
    retValue = true; 
  }    
  
  return retValue; 
}


//--------------------------------------------------------------------
// FUNCTION:
//   upBotton
//
// DESCRIPTION:
//   Adds a separator item to the favorites list control after the currently 
//   selected item. A separator appears as a vertical line and helps the 
//   user define a set of related objects in the Favorites bar. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   true if successful, false otherwise
//--------------------------------------------------------------------

function CustomizeFavorites_upButton()
{
  var retValue = true; 
  var curIndex = this.FAVORITE_OBJECTS_LIST.getIndex(); 
  var curLength = this.FAVORITE_OBJECTS_LIST.getLen(); 
 
  if (curIndex == 0)
  {
    //
  }
  else if (curLength == curIndex)
  {
    // 
  }
  else 
  {
    var preIndex = this.FAVORITE_OBJECTS_LIST.getIndex() -1; 
    
    var curValue = this.FAVORITE_OBJECTS_LIST.getValue(); 
    var preValue = this.FAVORITE_OBJECTS_LIST.getValue(curIndex-1); 
    
    var curText = this.FAVORITE_OBJECTS_LIST.get(); 
    var preText = this.FAVORITE_OBJECTS_LIST.get(curIndex-1); 
    
    this.FAVORITE_OBJECTS_LIST.set(curText, preIndex); 
    this.FAVORITE_OBJECTS_LIST.setValue(curValue, preIndex); 

    this.FAVORITE_OBJECTS_LIST.set(preText, curIndex); 
    this.FAVORITE_OBJECTS_LIST.setValue(preValue, curIndex);    
    this.FAVORITE_OBJECTS_LIST.setIndex(preIndex);      
  }
  
  
  return retValue; 
}

//--------------------------------------------------------------------
// FUNCTION:
//   downButton
//
// DESCRIPTION:
//   Adds a separator item to the favorites list control after the currently 
//   selected item. A separator appears as a vertical line and helps the 
//   user define a set of related objects in the Favorites bar. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   true if successful, false otherwise
//--------------------------------------------------------------------

function CustomizeFavorites_downButton()
{
  var retValue = true; 
  var curIndex = this.FAVORITE_OBJECTS_LIST.getIndex(); 
  var curLength = this.FAVORITE_OBJECTS_LIST.getLen(); 
 
  if (curLength == curIndex+1)
  {
    // alert("not moving because index is at the bottom."); 
  }
  else 
  {
    var nextIndex = this.FAVORITE_OBJECTS_LIST.getIndex() +1; 
    
    var curValue = this.FAVORITE_OBJECTS_LIST.getValue(); 
    var nextValue = this.FAVORITE_OBJECTS_LIST.getValue(curIndex+1); 
    
    var curText = this.FAVORITE_OBJECTS_LIST.get(); 
    var nextText = this.FAVORITE_OBJECTS_LIST.get(curIndex+1); 
    
    this.FAVORITE_OBJECTS_LIST.set(curText, nextIndex); 
    this.FAVORITE_OBJECTS_LIST.setValue(curValue, nextIndex); 

    this.FAVORITE_OBJECTS_LIST.set(nextText, curIndex); 
    this.FAVORITE_OBJECTS_LIST.setValue(nextValue, curIndex);    
    this.FAVORITE_OBJECTS_LIST.setIndex(nextIndex);      
  }
  
  return retValue; 
}

//--------------------------------------------------------------------
// FUNCTION:
//   setAddButtonDisabled
//
// DESCRIPTION:
//   Sets 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   true if successful, false otherwise
//--------------------------------------------------------------------

function CustomizeFavorites_setAddButtonDisabled(trueOrFalse)
{
  var retValue = true; 
  
  var addButton = dwscripts.findDOMObject("addButton"); 
   
  if (addButton)
  {
    if (trueOrFalse)
    {
      addButton.setAttribute("disabled", true); 
    } 
    else
    {
      addButton.removeAttribute("disabled"); 
    }
  }
  else
  {
    alert("Error: unable to find button labeled 'addButton'."); 
  }

  return retValue; 
} 


//--------------------------------------------------------------------
// FUNCTION:
//   setAvailableObjects
//
// DESCRIPTION:
//   Sets the available objects list  
//
// ARGUMENTS:
//   domNode
//
// RETURNS:
//   true if successful, false otherwise
//--------------------------------------------------------------------

function CustomizeFavorites_setAvailableObjects(nodeID)
{
  var retValue = false; 

  var theDOM; 
  var theCategory; 
  var buttonNames = new Array(); 
  var buttonValues = new Array(); 
    
  if (nodeID)
  {
    if (nodeID.toLowerCase() == "all")
    {
      theDOM = this.insertBarDOM; 
    }
    else 
    {       
      var theCategories =  this.insertBarDOM.getElementsByTagName("category");
      
      if (theCategories && theCategories.length)
      {
		for (var i=0; i<theCategories.length;++i)
		{
		  if (theCategories[i].id && theCategories[i].id == nodeID)
		  {
		    theDOM = theCategories[i]; 
		    break; 
		  }
		}
      }
    }
    
    if (theDOM) 
    {
      if (nodeID.toLowerCase() == "all")     
      {
        var theCategories = theDOM.getElementsByTagName("category");
       
        // if we have some categories 
        if (theCategories && theCategories.length)
        {                 
          // for every category 
          for (var z=0;z<theCategories.length;++z)
          {
            // if the current actegory node exists 
            if (theCategories[z])
            {
              // and it has both a name and an ID 
              if (theCategories[z].id && theCategories[z].id.length && theCategories[z].name && theCategories[z].name.length)
              {           
                // and we're not dealing with the favorites (we want to exclude this) 
                if (theCategories[z].id != "DW_Insertbar_Favorites")
                {
                  // for every category 
                  // var cleanCategory = theCategories[z].id.replace("dw_InsertBar_", "", "gi"); 
            
                  // add to the button names the name and an empty string as the value 
                  buttonNames.push(theCategories[z].name); 
                  buttonValues.push(""); 
              
                  // grab all the the buttons for this category 
                  var theButtons = theCategories[z].getElementsByTagName("button");            
          
                  // for every button in this category 
                  for (var i=0;i<theButtons.length;++i)
                  {  
                    // if it has a name and an ID 
                    if (theButtons[i].id && theButtons[i].id.length && theButtons[i].name && theButtons[i].name.length)
                    {
                      // push the button name and id 
                      buttonNames.push(SPACER + theButtons[i].name); 
                      buttonValues.push(theButtons[i].id); 
                    }
                  }
                }
                else
                {
                  // ** There were no categories found. 
                  // alert("Error: this category does not appear to have a valid category."); 
                }
              }
            }
          }    
        }
      }
      else 
      {
        // grab all the the buttons for this category 
        var theButtons = theDOM.getElementsByTagName("button");            
          
        // for every button in this category 
        for (var i=0;i<theButtons.length;++i)
        {  
          // if it has a name and an ID 
          if (theButtons[i].id && theButtons[i].id.length && theButtons[i].name && theButtons[i].name.length)
          {
            // push the button name and id 
            buttonNames.push(SPACER + theButtons[i].name); 
            buttonValues.push(theButtons[i].id); 
          }
        }    
      }
    }
  } 
  else
  {
    alert("A nodeID was not passed."); 
  }
  
  if (buttonNames.length)
  {
    this.AVAILABLE_OBJECTS_LIST.setAll(buttonNames,buttonValues); 
  }
  else
  {
    this.AVAILABLE_OBJECTS_LIST.setAll("",""); 
  }
  return retValue; 
} 
