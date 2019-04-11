//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//***************** Class NameValuePair ***************

//Creates and manages a list of name/value pairs.
//Names can contain any character.
//Values can be blank, but cannot be set to null (this is the same as deleting them).

function NameValuePair() {
  this.nameList = new Array();
  this.valueList = new Array();
}
NameValuePair.prototype.test       = NameValuePair_test;
NameValuePair.prototype.set        = NameValuePair_set;        //set(name,value);      //creates or sets record
NameValuePair.prototype.get        = NameValuePair_get;        //get(name);            //returns value
NameValuePair.prototype.getName    = NameValuePair_getName;    //getName(index);       //returns value
NameValuePair.prototype.del        = NameValuePair_del;        //del(name);            //deletes record by name
                                                               //del(index);           //deletes record by index
NameValuePair.prototype.changeName = NameValuePair_changeName; //changeName(name,newName);
NameValuePair.prototype.length     = NameValuePair_length;     //length();
NameValuePair.prototype.getNames   = NameValuePair_getNames;   //getNames();           //returns array of names
NameValuePair.prototype.getAll     = NameValuePair_getAll;     //getAll(separator);    //returns array of name = value


function NameValuePair_test() {
  return this.prop;
}

//Returns true if set, false if added

function NameValuePair_set(name,value) {
  var i, retVal = true;

  with (this) {
    for (i=0; i<nameList.length; i++) {
      if (nameList[i] == name) {     //if name found in list
        valueList[i] = value;        //set value
        break;
    } }
    if (i==nameList.length) {        //if not found, add pair
      nameList.push(name);
      valueList.push(value);
      retVal = false;
    }
  }
  return retVal;
}


//Returns value, or null if pair not found

function NameValuePair_get(name) {
  var i, retVal = null;

  with (this) {
    for (i=0; i<nameList.length; i++) {
      if (nameList[i] == name) {     //if name found in list
        retVal = valueList[i];       //get value
        break;
  } } }
  return retVal;
}


//Returns value, or null if pair not found

function NameValuePair_getName(index) {
  var i, j, retVal = null;

  with (this) {
    index = (parseInt(index) == index)? parseInt(index) : -1; //must be valid number
    if (index != -1) { //indexed get
      j = -1;
      for (i=0; i<nameList.length && j<index; i++) if (valueList[i]!=null) j++; //count non-null items
      if (j==index) retVal = nameList[i-1];
  } }
  return retVal;
}


//Can be passed name or integer index
//Returns true, or false if pair not found

function NameValuePair_del(name) {
  var i, j, index, retVal = false;

  with (this) {
    index = (parseInt(name) == name)? parseInt(name) : -1; //if number passed in, index is set
    if (index != -1) { //indexed delete
      j = -1;
      for (i=0; i<nameList.length && j<index; i++) if (valueList[i]!=null) j++; //count non-null items
      if (j==index) {
        nameList[i-1] = null;
        valueList[i-1] = null;
        retVal = true;
      }

    } else {
      for (i=0; i<nameList.length; i++) {
        if (nameList[i] == name) { //if name found in list
          nameList[i] = null;
          valueList[i] = null;
          retVal = true;
          break;
  } } } }
  return retVal;
}


//Returns true, or false if pair not found

function NameValuePair_changeName(name,newName) {
  var i, retVal = false;

  with (this) {
    for (i=0; i<nameList.length; i++) {
      if (nameList[i] == name) {     //if name found in list
        nameList[i] = newName;
        retVal = true;
        break;
  } } }
  return retVal;
}


//Returns the number of valid pairs

function NameValuePair_length() {
  var i, retVal = 0;

  with (this) {
    for (i=0; i<nameList.length; i++) {
      if (valueList[i] != null) retVal++;
  } }
  return retVal;
}


//Returns array of valid names

function NameValuePair_getNames() {
  var i, retVal = new Array;

  with (this) {
    for (i=0; i<nameList.length; i++) {
      if (valueList[i] != null) retVal.push(nameList[i]);
  } }
  return retVal;
}


//Returns array of valid pairs, separated by = or a separator passed in

function NameValuePair_getAll(separator) {
  var i, retVal = new Array();

  if (!separator) separator = "=";    //default is =
  separator = " " + separator + " ";
  with (this) {
    for (i=0; i<nameList.length; i++) {
      if (valueList[i] != null) retVal.push(nameList[i] + separator + valueList[i]);
  } }
  return retVal;
}
