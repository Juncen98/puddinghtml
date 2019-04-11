// Copyright 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

// *************** GLOBALS VARS *****************
var helpDoc = MM.HELP_customizeFavorites; 
var AVAILABLE_OBJECTS_LIST; 
var FAVORITE_OBJECTS_LIST; 
var myCustomizeFavorites; 

// ******************* API **********************

function commandButtons()
{
  return new Array(MM.BTN_OK, "clickedOK()", MM.BTN_Cancel, "window.close()",MM.BTN_Help, "displayHelp()"); 
}

//***************** LOCAL FUNCTIONS  ******************

function initializeUI()
{
  // create list controls 
  AVAILABLE_OBJECTS_LIST = new ListControl("availableObjects");
  FAVORITE_OBJECTS_LIST  = new ListControl("favoriteObjects");   // if we have a valid DOM 
  AVAILABLE_CATEGORIES_LIST = new ListControl("availableCategories"); 

  myCustomizeFavorites = new CustomizeFavorites(AVAILABLE_OBJECTS_LIST,FAVORITE_OBJECTS_LIST,AVAILABLE_CATEGORIES_LIST); 

  myCustomizeFavorites.initializeUI(); 

  updateUI("availableObjects"); 
}

function updateUI(itemName)
{
  switch(itemName)
  {
    case "addButton":
    {
      myCustomizeFavorites.addFavorite(); 
      break;
    }
    case "deleteButton":
    {
      myCustomizeFavorites.deleteFavorite(); 
      break;
    }
    case "addSeparator": 
    {
      myCustomizeFavorites.addSeparator(); 
      break;
    }
    case "upButton": 
    {
      myCustomizeFavorites.upButton()
      break;
    }    
    case "downButton": 
    {
      myCustomizeFavorites.downButton()
      break;
    }    
    case "availableObjects": 
    {
      if (!AVAILABLE_OBJECTS_LIST.getValue())
      {
        myCustomizeFavorites.setAddButtonDisabled(true);  
      }
      else
      {
        myCustomizeFavorites.setAddButtonDisabled(false);        
      }
      break; 
    }

    case "availableObjectsDoubleClick": 
    {
      updateUI('addButton'); 
      break; 
    }

    case "favoriteObjectsDoubleClick": 
    {
      updateUI('deleteButton'); 
      break; 
    }

    case "getAvailableSelected":
    {
      alert(FAVORITE_OBJECTS_LIST.get() + "\n\r" + FAVORITE_OBJECTS_LIST.getValue()); 
      break; 
    }
    case "availableCategories": 
    {
      var curCatValue = this.AVAILABLE_CATEGORIES_LIST.getValue(); 

      if (curCatValue.toLowerCase() == "all") 
      {
        myCustomizeFavorites.setAvailableObjects("all"); 
      } 
      else
      {
        myCustomizeFavorites.setAvailableObjects(curCatValue);
      }
      
      // make sure to notify the availableObjects list so that it can
      // update the add button 
      updateUI("availableObjects"); 
      
      break; 
    }
  }
}

function clickedOK()
{
  myCustomizeFavorites.store(); 
  dw.objectPalette.setActiveCategory('Favorites');
}
