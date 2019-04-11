//SHARE-IN-MEMORY=true
//Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//--------------------------------------------------------------------
// CLASS:
//   ParamTypesList
//
// DESCRIPTION:
//		A list with Server Model supported param types
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//
//   initializeUI()
//	 updateUI()
//
//
//
//--------------------------------------------------------------------


//--------------------------------------------------------------------
// FUNCTION:
//   ParamTypesList
//
// DESCRIPTION:
//   Constructor function for the ParamTypesList control
//
// ARGUMENTS:
//   behaviorName - the name of the behavior using this control
//   colectorField - the name of the field colector
//   varType - the name of the Variable type field
//	 name - the name of the "Name" (of the variable) field
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function ParamTypesList(controlName) {
	this.base = ListControl;
	this.base(controlName);
}

// public methods
ParamTypesList.prototype.__proto__ = ListControl.prototype;
ParamTypesList.prototype.initializeUI = ParamTypesList_initializeUI;
//ParamTypesList.prototype.updateUI = ParamTypesList_updateUI;

//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI()
//
// DESCRIPTION:
//   initializes the the control
//
// ARGUMENTS:
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function ParamTypesList_initializeUI() {
	this.init();
	var labelArray = dwscripts.getParameterTypeArray();
	this.setAll(labelArray, labelArray);
	//var labels = this.get('all');
	//var values = this.getValue('all');
	//this.setAll(labels.concat(labelArray), values.concat(labelArray));
}
