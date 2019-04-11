// Copyright 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

//*-------------------------------------------------------------------
// CLASS:
//   ImageButton
//
// DESCRIPTION:
//   Represents an image button object.  When the correct images are
//   available, this class can be used to create an image button from
//   a standard input image control.
//
// PUBLIC PROPERTIES:
//
//   initialValue  (boolean) - the starting value of the image button
//
//   value         (boolean) - the current value of the image button
//
//   startDisabled (boolean) - the starting disabled value
//
//   disabled      (boolean) - the current disabled state of the button
//
//   isToggle      (boolean) - indicates the button is a toggle or push
//
//   isRadio       (boolean) - indicates the button operates as a radio
//
// PUBLIC FUNCTIONS:
//
//   reset() - resets the image button to it's initial state
// 
//   enable() - enables the button if it is disabled
//
//   disable() - disables the button if it is enabled
//
//   setDisabled(isDisabled) - sets the disabled state of the button
//
//   setValue(value) - sets the value of the button
//
//   setIsToggle(isToggle) - sets the button to be a toggle or push
//
//--------------------------------------------------------------------



//*-------------------------------------------------------------------
// FUNCTION:
//   ImageButton
//
// DESCRIPTION:
//   Constructs a new Image Button object.
//
// ARGUMENTS: 
//
//   theObjectName (required) - The name of the input image object.
//
//   theVarName (optional) - The name of the variable which the image
//     button is created as.  Deafaults to 'IBTN_<objName>'.  This is
//     used to hook up the necessary events to the class.
//
//   theStateMask (optional) - The list of image types which are available
//     for this button.  The possible image types are 'sShHdD' where
//     's' stands for standard, 'h' stands for highlight, and 'd' stands
//     for disabled.  Capitols indicates the selected state.  Here are
//     the mask symbols with the corresponding file names:
//    
//       s - <image file>.<image ext>
//       S - <image file>_sel.<image ext>
//       h - <image file>_hlt.<image ext>
//       H - <image file>_sel_hlt.<image ext>
//       d - <image file>_dis.<image ext>
//       D - <image file>_sel_dis.<image ext>
//
//   theIsToggle (optional) - Indicates that this image button should
//     operate as a toggle switch, versus a push button.  Defaults
//     to true.
//
//   theIsRadio (optional) - Indicates that this image button should
//     operate like a radio button.  Deafults to false.
//
//   theInitialValue (optional) - Indicates which state the image
//     button should start in.  True indicates selected.
//     Defauts to false, or unselected.
//
//   theIsDisabled (optional) - Indicates if the image button should
//     start in the disabled state or not.  Defaults to false.
//
//   theCanTabWhenDisabled (optional) - Indicates that this image button
//     can accept tabbing into it even when it's disabled. Defaults to false
//
// RETURNS:
//   nothing
//
//--------------------------------------------------------------------
function ImageButton(theObjName, theVarName, theStateMask, 
                     theIsToggle, theIsRadio,
                     theInitialValue, theIsDisabled, theCanTabWhenDisabled)
{
  // public properties

  this.initialValue = (theInitialValue != null) ? theInitialValue : false;
  this.value = '';
  this.startDisabled = (theIsDisabled != null) ? theIsDisabled : false;
  this.disabled = this.startDisabled;
  this.isToggle = (theIsToggle != null) ? theIsToggle : true;
  this.isRadio = (theIsRadio != null) ? theIsRadio : false;
  this.tabWhenDisabled= (theCanTabWhenDisabled != null) ? theCanTabWhenDisabled : false;

  // private properties

  this._name = theObjName;
  this._varName = (theVarName != null) ? theVarName : "IBTN_" + theObjName;
  this._obj = '';
  this._parent = '';
  this._stateMask = theStateMask ? theStateMask : 'sSdD';
  this._mouseOver = false;
  this._mouseDown = false;
  this._filePre = '';
  this._fileExt = '';

  this.init();
}

// public methods
ImageButton.prototype.reset = ImageButton_reset;
ImageButton.prototype.enable = ImageButton_enable;
ImageButton.prototype.disable = ImageButton_disable;
ImageButton.prototype.setDisabled = ImageButton_setDisabled;
ImageButton.prototype.setValue = ImageButton_setValue;
ImageButton.prototype.setIsToggle = ImageButton_setIsToggle;

// private methods
ImageButton.prototype.init = ImageButton_init;
ImageButton.prototype.update = ImageButton_update;
ImageButton.prototype.redraw = ImageButton_redraw;



// Initializes the element
function ImageButton_init() {
  with (this) {
    if (! _stateMask) return;
    
    _obj = findObject(_name);  // need to include findObject

    // hook up the events.  this does not work in all browsers.
    // might need to set these events directly on the image.
    if (_obj) {
      _obj.onClick = _varName + ".update(\"onclick\");" +
                     ((_obj.onClick != null)?_obj.onClick:"");
      _obj.onMouseDown = _varName + ".update(\"onmousedown\");" + 
                         ((_obj.onMouseDown != null)?_obj.onMouseDown:"");
	  _obj.onMouseUp = _varName + ".update(\"onmouseup\");" + 
                         ((_obj.onMouseUp != null)?_obj.onMouseUp:"");
      if (_stateMask.indexOf("h") != -1 || _stateMask.indexOf("H") != -1) {
        _obj.onMouseOver = _varName + ".update(\"onmouseover\");" +
                           ((_obj.onMouseOver != null)?_obj.onMouseOver:"");
        _obj.onMouseOut  = _varName + ".update(\"onmouseout\");" +
                           ((_obj.onMouseOut != null)?_obj.onMouseOut:"");
      }
    }
    
    if (_obj && _obj.src != null) {
      var theSrc = _obj.src;
      var extIndex = theSrc.lastIndexOf(".");
      if (extIndex != -1) { // save the extension
        _fileExt = theSrc.substring(extIndex, theSrc.length);
        theSrc = theSrc.substring(0, extIndex); // remove extension
      }
      var length = theSrc.length;
      if (theSrc.lastIndexOf("_sel_dis") == length-8)
        _filePre = theSrc.substring(0, theSrc.lastIndexOf("_sel_dis"));
      else if (theSrc.lastIndexOf("_sel_hlt") == length-8)
        _filePre = theSrc.substring(0, theSrc.lastIndexOf("_sel_hlt"));
      else if (theSrc.lastIndexOf("_sel") == length-4)
        _filePre = theSrc.substring(0, theSrc.lastIndexOf("_sel"));
      else if (theSrc.lastIndexOf("_hlt") == length-4)
        _filePre = theSrc.substring(0, theSrc.lastIndexOf("_hlt"));
      else if (theSrc.lastIndexOf("_dis") == length-4)
        _filePre = theSrc.substring(0, theSrc.lastIndexOf("_dis"));
      else
        _filePre = theSrc;
    }
    
    reset();
  }
}

//Resets the element
function ImageButton_reset() {
  var isChanged = '';
  with (this) {
    isChanged = (value != initialValue);
    _mouseOver = false;
    _mouseDown = false;
    value = initialValue;
    disabled = startDisabled;
    redraw();
    if (isChanged && this.onChange != null) onChange(this, value);
  }
}

//Enables the element
function ImageButton_enable() {
  if (this._obj) with (this) {
    disabled = false;
    redraw();
  }
}

//Disables the element
function ImageButton_disable() {
  this.disabled = true;
  this.redraw();
}

//Calls the approppriate disable or enable function
function ImageButton_setDisabled(theDisabled) {
  if (theDisabled) {
    this.disable();
  } else {
    this.enable();
  }
}

//Called by the onClick, onMouseOver, onMouseDown, and onMouseOut
// events of the A tag, to change the button image and state
function ImageButton_update(theEvent) {
  if (!this.disabled) with (this) {
    if (theEvent == null || theEvent == "onclick") { // onclick
      _mouseDown = false;
      setValue((isRadio)?true:!value);
    } else { // mouse events
      if (theEvent == "onmouseover") {
        if (_mouseOver) return;
        _mouseOver = true;
      } else if (theEvent == "onmouseout") {
        if (!_mouseDown && !_mouseOver) return;
        _mouseDown = false;
        _mouseOver = false;
      } else if (theEvent == "onmousedown") {
        if (_mouseDown) return;
        _mouseDown = true;
      } else if (theEvent =="onmouseup"){
		_mouseDown = false;
		setValue((isRadio)?true:!value);
      }
      redraw();
    }
  }
}

// Sets the image based on the button state
function ImageButton_redraw() {
  if (this._filePre) with (this) {
    var imageIndex = 's';
    var imageExt = '';
    if (disabled) {
      imageIndex = 'd';
      imageExt += "_dis";
    } else if (_mouseOver) {
      imageIndex = 'h';
      imageExt += "_hlt";
    }
    if ((value && isToggle) || _mouseDown) {
      if (_stateMask.indexOf(imageIndex.toUpperCase()) != -1) {
        imageExt = "_sel" + imageExt;
      } else if (_stateMask.indexOf(imageIndex) == -1) {
        // unselected images not found
        if (_stateMask.indexOf('S') != -1) imageExt = "_sel";
        else imageExt = '';
      }
    } else if (_stateMask.indexOf(imageIndex) == -1) imageExt = '';

    var currImageName = _obj.src;
    var imageName = _filePre + imageExt + _fileExt;
    if (currImageName != imageName) _obj.src = imageName;
  }

	var tabDisableControl= findObject(this._name);
	if (!this.tabWhenDisabled && this.disabled ) tabDisableControl.setAttribute("disabled", "true") 
	  else tabDisableControl.setAttribute("disabled", "false") ;
}

// Sets the value of the image button, and redraws it
function ImageButton_setValue(theValue) {
  var isChanged = '';
  with (this) {
    isChanged = (value != theValue);
    value = theValue;
    redraw();

	var focusControl= findObject(this._name);
	if (focusControl != '[object Image]' && focusControl.focus() == 'true') focusControl.focus();

    if (isChanged && this.onChange != null) onChange(this, value);
  }
}

// Sets the button to be either toggle or push
function ImageButton_setIsToggle(theIsToggle) {
  with (this) {
    isToggle = theIsToggle;
    redraw();
  }
}




//*-------------------------------------------------------------------
// CLASS:
//   ImageButtonGroup
//
// DESCRIPTION:
//  Represents a group of image buttons that behave like radio buttons. 
//  The individual image buttons must be defined before initializing the 
//  image button group
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//  getSelectedButtonName() - Return the name of the selected image button
//  reset() - Resets all the buttons to their initial state
//  disable() - Disables all the buttons
//  enable() - Enables all the buttons
//  select(objName) - Selects the specified image button
//
//--------------------------------------------------------------------


//*-------------------------------------------------------------------
// FUNCTION:
//   ImageButtonGroup
//
// DESCRIPTION:
//  Constructs a new Image Button Group object.
// ARGUMENTS: 
//  buttonNames (required) - List of the names of the Image Button Objects in the group
// RETURNS:
//  nothing
//--------------------------------------------------------------------
function ImageButtonGroup() {
  this._selectedButton = '';
  this._imageButtons = new Array();
  
  var args = ImageButtonGroup.arguments;
  for (var i=0; i < args.length; i++) {
    this._imageButtons.push(args[i]);
    args[i]._parent = this;
    args[i].isRadio = true;
    args[i].onChange = ImageButtonGroup.update; // static callback method
  }
}

// public method
ImageButtonGroup.prototype.getSelectedButtonName = ImageButtonGroup_getSelectedButtonName;
ImageButtonGroup.prototype.reset = ImageButtonGroup_reset;
ImageButtonGroup.prototype.disable = ImageButtonGroup_disable;
ImageButtonGroup.prototype.enable = ImageButtonGroup_enable;
ImageButtonGroup.prototype.select = ImageButtonGroup_select;


// static method
ImageButtonGroup.update = ImageButtonGroup_update;


function ImageButtonGroup_getSelectedButtonName() {
  return this._selectedButton;
}

function ImageButtonGroup_reset() {
  this._selectedButton = '';
  for (var i=0; i < this._imageButtons.length; i++) {
    this._imageButtons[i].reset();
  }
}

function ImageButtonGroup_disable() {
  for (var i=0; i < this._imageButtons.length; i++) {
    this._imageButtons[i].disable();
  }
}

function ImageButtonGroup_enable() {
  for (var i=0; i < this._imageButtons.length; i++) {
    this._imageButtons[i].enable();
  }
}

function ImageButtonGroup_select(objName) {
  for (var i=0; i < this._imageButtons.length; i++) {
    if (this._imageButtons[i]._name == objName) {
      this._imageButtons[i].setValue(true);
      break;
    }
  }
}

function ImageButtonGroup_update(imageBtn, value) {
  if (value && imageBtn._parent) {  //set the other buttons to false, if this one is true
    imageBtn._parent._selectedButton = imageBtn._name;
    var imageList = imageBtn._parent._imageButtons;
    for (var i=0; i < imageList.length; i++) {
      if (imageList[i] != imageBtn) {
        imageList[i].setValue(false);
      }
    }
	var focusControl= findObject(imageBtn._name);
	if (focusControl != '[object Image]' && focusControl.focus() != 'false') focusControl.focus();

  }
}

