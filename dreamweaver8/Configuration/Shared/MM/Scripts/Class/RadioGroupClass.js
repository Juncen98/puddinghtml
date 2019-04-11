// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
//
// This control manages a RADIO GROUP
//
// To define a new radioGroup, create a global variable and define it after onLoad:
//  MYGROUP = new RadioGroup(groupName);
//
// The layerObj parameter is optional.  If specified, that layer will be searched
// for the radio group named groupName
//
// Thereafter, you can call methods:
//  MYGROUP.getSelectedValue();    MYGROUP.setSelectedIndex(2);  
//
//
// Available methods:
//  MYGROUP.getSelectedIndex() - returns selected index
//  MYGROUP.getSelectedValue() - returns value of selected index
//  MYGROUP.setSelectedIndex(ind)  - checks radio button corresponding
//                                   to MYGROUP[ind]
//  MYGROUP.setSelectedValue(val)  - checks radio button that has a value 
//                                   attribute equalling val



function RadioGroup(groupName,layerObj){
   this.obj = (layerObj) ? dwscripts.findDOMObject(groupName, layerObj) : dwscripts.findDOMObject(groupName);
}


RadioGroup.prototype.getSelectedIndex = RadioGroup_getSelectedIndex;
RadioGroup.prototype.getSelectedValue = RadioGroup_getSelectedValue;
RadioGroup.prototype.setSelectedIndex = RadioGroup_setSelectedIndex;
RadioGroup.prototype.setSelectedValue = RadioGroup_setSelectedValue;



function RadioGroup_getSelectedIndex(){
   var i,nBtns = this.obj.length,selInd = -1;
   
   for (i=0;i<nBtns;i++){
      if (this.obj[i].checked == true){
	     selInd = i; 
		 break;
	  }
   }
   return selInd;
}


function RadioGroup_getSelectedValue(){
   var selVal = null;
   var selInd = this.getSelectedIndex();
   
   if (selInd != -1 && this.obj[selInd].value)
      selVal = this.obj[selInd].value;
   
   return selVal;

}



function RadioGroup_setSelectedIndex(ind){
   this.obj[ind].checked = true;
}



function RadioGroup_setSelectedValue(val){
   var i,nBtns = this.obj.length;
   for (i=0;i<nBtns;i++){
      if (this.obj[i].value == val){
	     this.obj[i].checked = true;
		 break;
	  }
   }
}
