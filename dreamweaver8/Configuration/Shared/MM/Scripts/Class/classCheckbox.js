// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

var CONFIG_FOLDER = dw.getConfigurationPath();
var CHECKBOX      = CONFIG_FOLDER + (dw.isOSX() ? "/Shared/MM/Images/checkboxOSX.gif" : (dw.isXPThemed() ? "/Shared/MM/Images/checkboxXP.gif" : "/Shared/MM/Images/checkbox.gif"));
var CHECKBOX_SEL      = CONFIG_FOLDER + (dw.isOSX() ? "/Shared/MM/Images/checkbox_selOSX.gif" : (dw.isXPThemed() ? "/Shared/MM/Images/checkbox_selXP.gif" : "/Shared/MM/Images/checkbox_sel.gif"));
var CHECKBOX_DIS      = CONFIG_FOLDER + (dw.isOSX() ? "/Shared/MM/Images/checkbox_disOSX.gif" : (dw.isXPThemed() ? "/Shared/MM/Images/checkbox_disXP.gif" : "/Shared/MM/Images/checkbox_dis.gif"));

//**************** CheckboxSet CLASS ****************

//PUBLIC METHODS
//--------------
//addCheckbox(name,parents)  - name is required, parents (a comma-separated list) is optional
//                           - IMPORTANT! name and parents cannot contain special characters
//clicked()                  - the HTML tag should pass this: <... onClick="G.clicked(this)">
//isChecked(name)
//check(name,boolean)


//Class Constructor

function CheckboxSet() {
  this.list = new Array();
}
CheckboxSet.prototype.addCheckbox    = CheckboxSet_addCheckbox;
CheckboxSet.prototype.clicked        = CheckboxSet_clicked;
CheckboxSet.prototype.update         = CheckboxSet_update;
CheckboxSet.prototype.updateParent   = CheckboxSet_updateParent;
CheckboxSet.prototype.getCheckboxObj = CheckboxSet_getCheckboxObj;
CheckboxSet.prototype.isChecked      = CheckboxSet_isChecked;
CheckboxSet.prototype.check          = CheckboxSet_check;


//Adds a Checkbox object to the CheckboxSet object.
//Requires a unique name without spaces

function CheckboxSet_addCheckbox(name,parents) {
  var i, newObj, parentList, parentObj;

  this.list.push(new Checkbox(name)); //adds new Checkbox object to array
  if (parents != null) {
    newObj = this.list[this.list.length-1];
    parentList = parents.split(",");
    newObj.parents = parentList;                          //set parentList of Checkbox
    for (i=0; i<parentList.length; i++) {
      parentObj = this.getCheckboxObj(parentList[i]);
      parentObj.isParent = true; //mark parent objects
  } }
}


//Called by the HTML object, updates flags, parents, and children
function CheckboxSet_clicked(htmlObj) {
   var objName = htmlObj.name;
   var checkbox = this.getCheckboxObj(objName);
   checkbox.clicked();
   this.update(htmlObj);
}

function CheckboxSet_update(htmlObj) {
  var i, j, objName = htmlObj.name;
  var obj = this.getCheckboxObj(objName);
  var childObj, foundChild;

  if (obj.parents != null) { //if part of group, update parents
    for (i=0; i<obj.parents.length; i++) {
      this.updateParent(obj.parents[i]);
    }
  }
  if (obj.isParent) {          //if parent, toggle child Checkboxes
    for (i=0; i<this.list.length; i++) { //look through all objects
      childObj = this.list[i];
      if (childObj.parents) {            //if has parent
        foundChild = false;
        for (j=0; j<childObj.parents.length; j++) { //see if I'm in the parent list
          if (childObj.parents[j] == objName) {
            foundChild = true;
        } }
        if (foundChild) for (j=0; j<childObj.parents.length; j++) {
          if (childObj.parents[j] == objName) {
            childObj.check(obj.isChecked());
          } else {
            this.getCheckboxObj(childObj.parents[j]).check(obj.isChecked());
  } } } } }
}

//Called by update() if object has a parent that needs updating

function CheckboxSet_updateParent(name) {
  var i, obj, parentObj, possChecked=0, numChecked=0;

  for (i=0; i<this.list.length; i++) { //look through all objects
    obj = this.list[i];
    if (obj.parents) { //if has parent
      for (j=0; j<obj.parents.length; j++) {
        if (obj.parents[j] == name) { //if I'm in the parent list
          possChecked++;
          if (obj.isChecked()) numChecked++;
  } } } }
  if (possChecked > 0) { //group exists
    parentObj = this.getCheckboxObj(name);
    if (numChecked == 0) parentObj.check(false);
    else if (numChecked == possChecked) parentObj.check(true);
    else parentObj.check(null); //do grayout here if possible
  }
}

//Returns boolean: true if the object is checked

function CheckboxSet_isChecked(name) {
  var checkboxObj = this.getCheckboxObj(name);
  return checkboxObj.isChecked();
}

//Finds checkbox object in array, and returns instance pointer.

function CheckboxSet_getCheckboxObj(name) {
  var i, retVal=null;

  for (i=0; i<this.list.length && this.list[i].getName() != name; i++) ;
  if (i< this.list.length) retVal = this.list[i];
  else alert(errMsg(MM.MSG_CouldNotFindNamedCheckbox, name));
  return retVal; //return Checkbox object
}

//Forcibly checks or unchecks the object, then updates everything.

function CheckboxSet_check(name, checkIt) {
  var checkboxObj = this.getCheckboxObj(name);
  checkboxObj.check(checkIt);
  this.update(checkboxObj);
}

//**************** GRAPHIC 3-STATE CHECKBOX CLASS ****************

//PUBLIC PROPERTIES
//-----------------
//isParent
//parents
//
//PUBLIC METHODS
//--------------
//check(boolean)
//clicked()
//isChecked()
//getName()

function Checkbox(objName){
  this.name = objName;
  this.objRef = findObject(objName);
  this.parents = null;
  this.isParent = false;
  this.checked = false;
  this.objRef.src = CHECKBOX;
}

Checkbox.prototype.update = Checkbox_update;
Checkbox.prototype.clicked  = Checkbox_clicked;
Checkbox.prototype.check  = Checkbox_check;
Checkbox.prototype.isChecked = Checkbox_isChecked;
Checkbox.prototype.getName   = Checkbox_getName;


function Checkbox_update() {
  if (this.checked == null) { //gray out the control
    this.objRef.src = CHECKBOX_DIS;
  } else if (this.checked) {  //activate control
    this.objRef.src = CHECKBOX_SEL;
  } else if (!this.checked) { //de-activate control
    this.objRef.src = CHECKBOX;
  }
}

function Checkbox_check(checkIt) {
  this.checked = checkIt;
  this.update();
}

function Checkbox_clicked() {
  if(this.checked == false || this.checked == null)
    this.checked = true;
  else
    this.checked = false;

  this.update();
}

function Checkbox_isChecked() {
  return this.checked;
}

function Checkbox_getName() {
  return this.name;
}
