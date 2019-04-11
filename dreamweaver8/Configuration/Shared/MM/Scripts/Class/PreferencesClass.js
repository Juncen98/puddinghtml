// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.


//***************   CLASS DEFINITIONS  ***************


//---------------------------------------------------
// Preferences Class

// An object that contains all the preference information for a command.
// Handles loading the preference information from whereever it is stored in DW
//  currently this is in a Design Note assinged to the specified file URL.
// In the future this might actually be part of the DW preferences 
// (the registry and preferences file).
//  
// Values are named and are assocated with the named objects. 
// The named objects are classes that have a get and set method and 
// an object property.
//
// Intended to abstract the idea of preference sets.
// These sets might be specified by the function, user, site, or something else.
// If we just create the idea of sets in mind is should help when we
// actually create them for site wide reports, sites, and users.

// INTERFACE
//
// Preferences methods:
//
//  save() - saves the preferences data
//    - returns true on successful save, false otherwise
//
//  load() - reads the preferences data
//    - returns true on successful load, false otherwise
//
//
//  set() - returns boolean
//    - sets the preferences values using the values returned by
//      the associated objects (usually simple classes of UI elements)
//
//  initialize() - returns boolean
//    - returns true if successfully loading preferences.
//
//
//  getName() - returns the URL assocated with this preference
//    - returns the URL of the file associated with this preference, 
//      usually this is the URL of the command that has the preference.
//
//  getSimpleName() - returns string (preference command name)
//    - returns the name of the command
//
//


//------------------------------------
// Constructor function
//
function Preferences(theURL, nameValues) {
  // properties
  this.url = theURL;
    // Array of objects that have a "set" methods and name property.
  this.objects  = new Array();
    // Object with named properties and values.  
  this.values = nameValues;
}


//------------------------------------
// static properties
Preferences.separator = '/';
Preferences.extensionSep = '.';


//------------------------------------
// method declaration


/*
function Preferences_toString() {
  return this.url;
}
*/

function Preferences_getName() {
  var retVal = '';
  with (this) {
    retVal = url;
    var index = retVal.lastIndexOf(Preferences.separator);
    if (index != -1) retVal = retVal.substring(index + Preferences.separator.length, retVal.length);
    return retVal;
  }
}

function Preferences_getSimpleName() {
  var retVal = this.getName();
  var index = retVal.lastIndexOf(Preferences.extensionSep);
  if (index != -1)
    retVal = retVal.substring(0, index);
  return retVal;
}

//??? Should reference included file.
function arrayContains( curArr, item )
{
   var nElements = curArr.length;
   for( var i = 0; i < nElements; i++ )
      if ( curArr[i] == item )
         return true;

   return false;   
}


//---------------
// Function: Preferences_Load
// Description: 
//   Read all saved preferences (currently using DesignNotes).
//
function Preferences_Load() {
  var rtnBool = true;
  var filePtr = MMNotes.open(this.url, true);
  
  if (!filePtr) return false; //*** If DesignNotes fail return immediately.

  var dnValue;
  var keys = MMNotes.getKeys(filePtr);
  
  // Set the value of each named item.
  for (var curName in this.values) {
    if (arrayContains(keys,curName)) {
      this.values[curName] = MMNotes.get( filePtr, curName);
    }
  }
  
  if (filePtr) MMNotes.close(filePtr);
  return rtnBool;
}


//---------------
// Function: Preferences_Save
// Description: 
//   Read all saved preferences (currently using DesignNotes).
//
function Preferences_Save() {
  var rtnBool = true;
  var filePtr = MMNotes.open(this.url, true);
  
  if (!filePtr) return false; //*** If DesignNotes fail return immediately.

  // Set the value of each named item.
  for (var curName in this.values) {
    MMNotes.set( filePtr, curName, this.values[curName]);
  }
  
  if (filePtr) MMNotes.close(filePtr);
  return rtnBool;
}


//---------------
// Function: Preferences_Initialize
// Description: initializes all the specified objects (UI elements) with the
//   current preference values.
// Parameters: 
//   objList - array of object that have set methods.
//
function Preferences_Initialize(objList) {
  var retBool = true;
  var curValue, curName;
  
  this.objects = objList;
  
  // for each object
  for (curName in this.objects) {
    // use this object name to reference the value by name
    curValue = this.values[curName];
    // if there is a value
    if (curValue) {
      // use the object set method to set the object to the value (usually a UI value)
      this.objects[curName].set(curValue);
    }
  }
  
  return retBool;
}


//---------------
// Function: Preferences_Set
// Description: Sets values from the specified objects (UI elements).
//
function Preferences_Set() {
  var retBool = true;
  var curValue, curName;
 
  if (this.objects) {
    for (curName in this.objects) {
      curValue = this.objects[curName].get();
      if (curValue || curValue == "") {
        this.values[curName] = curValue;
      }
    }
  } else {
    retBool = false;
  }
  return retBool;
}


//------------------------------------
// methods

Preferences.prototype.initialize = Preferences_Initialize;
Preferences.prototype.load = Preferences_Load;
Preferences.prototype.save = Preferences_Save;
Preferences.prototype.set = Preferences_Set;

//Preferences.prototype.toString = Preferences_toString;
Preferences.prototype.getName = Preferences_getName;
Preferences.prototype.getSimpleName = Preferences_getSimpleName;


//----- end of definition




//---------------------------------------------------
// Preference Setters Classes
//
// Mini classes that are used by the preferences object
// to set the UI elements.
//
//


//---------------------------------------------------
// Simple text field object

function PrefField(fieldObj) {
  this.name = fieldObj.name;
  this.object = fieldObj;
}

function PrefField_Set(newValue) {
  this.object.value = newValue;
}

function PrefField_Get() {
  return this.object.value;
}

PrefField.prototype.set = PrefField_Set;
PrefField.prototype.get = PrefField_Get;




//---------------------------------------------------
// Simple checkbox

function PrefCheckbox(inputObj) {
  this.name = inputObj.name;
  this.object = inputObj;
}

function PrefCheckbox_Set(newValue) {
  this.object.checked = newValue;
}

function PrefCheckbox_Get() {
  return this.object.checked;
}

PrefCheckbox.prototype.set = PrefCheckbox_Set;
PrefCheckbox.prototype.get = PrefCheckbox_Get;



//---------------------------------------------------
// Simple Select Class

function PrefSelectClass(listClassObj) {
  this.name = listClassObj.selectName;
  this.object = listClassObj;
}

function PrefSelectClass_Set(newValue) {
  this.object.pickValue(newValue); //??? Should handle the case with multiple selection, first update class.
}

function PrefSelectClass_Get() {
  return this.object.getValue(); //??? Should handle the case with multiple selection 'multiple'
}

PrefSelectClass.prototype.set = PrefSelectClass_Set;
PrefSelectClass.prototype.get = PrefSelectClass_Get;

