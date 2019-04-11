// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// Note: eo is simply short for Edit Ops
// Each form type needed some type of preface because the form types could be reserved
// JavaScript keywords, and eo seemed as good as any

function eoDisplayObj(type){
  this.name = "";
}

eoText.prototype = new eoDisplayObj;
function eoText(text){
  this.type = "text";
  this.text = text || "";
}

eoTextField.prototype = new eoDisplayObj;
function eoTextField(value){
  this.type = "textField";
  this.value = value || "";
}

eoFileField.prototype = new eoDisplayObj;
function eoFileField(value){
  this.type = "fileField";
  this.value = value || "";
}

eoHiddenField.prototype = new eoDisplayObj;
function eoHiddenField(value){
  this.type = "hiddenField";
  this.value = value || "";
}

eoPasswordField.prototype = new eoDisplayObj;
function eoPasswordField(value){
  this.type = "passwordField";
  this.value = value || "";
}

eoTextArea.prototype = new eoDisplayObj;
function eoTextArea(value){
  this.type = "textArea";
  this.value = value || "";
}

eoCheckBox.prototype = new eoDisplayObj;
function eoCheckBox(checked){
  this.type = "checkBox";
  this.checked = checked || false;
}

eoDynamicCheckBox.prototype = new eoDisplayObj;
function eoDynamicCheckBox(checkIf,equalTo){
  this.type = "dynamicCheckBox";
  this.checkIf = checkIf || "";
  this.equalTo = equalTo || "";
}

eoMenu.prototype = new eoDisplayObj;
function eoMenu(textArr,valArr,defaultSelected){
  this.type = "menu";
  this.textArr = textArr || "";
  this.valArr  = valArr || "";
  this.defaultSelected = defaultSelected || "";
}

eoDynamicMenu.prototype = new eoDisplayObj;
function eoDynamicMenu(recordset,textCol,valCol,defaultSelected){
  this.type = "dynamicMenu";
  this.recordset = recordset || "";
  this.textCol   = textCol || "";
  this.valCol    = valCol || "";
  this.defaultSelected = defaultSelected || "";
}

eoRadioGroup.prototype = new eoDisplayObj;
function eoRadioGroup(labelArr,valArr,defaultChecked){
  this.type = "radioGroup";
  this.labelArr = labelArr || "";
  this.valArr   = valArr || "";
  this.defaultChecked = defaultChecked || "";
}

eoDynamicRadioGroup.prototype = new eoDisplayObj;
function eoDynamicRadioGroup(recordset,labelCol,valueCol,defaultChecked){
  this.type = "dynamicRadioGroup";
  this.recordset = "";
  this.labelCol  = "";
  this.valCol  = "";
  this.defaultChecked = "";
}