//SHARE-IN-MEMORY=true
// Copyright 2002, 2003 Macromedia, Inc. All rights reserved.
//--------------------------------------------------------------------

var webFormControlArray = new Array("asp:checkbox",
									"asp:checkboxlist",
                                    "asp:dropdownlist",
								    "asp:listbox",
								    "asp:radiobutton",
									"asp:radiobuttonlist",
								    "asp:textbox"); 

//--------------------------------------------------------------------
// CLASS:
//   FormFieldsMenuASPNet
//
// DESCRIPTION:
//   This is a subclass of the FormFieldsMenu control class 
//
// PUBLIC PROPERTIES:
//   None
//
// PUBLIC FUNCTIONS:
//   See the base class in:
//     Configuration/Shared/Controls/Scripts/FormFieldsMenu.js
//
//--------------------------------------------------------------------

FormFieldsMenuASPNet.prototype.__proto__ = FormFieldsMenu.prototype;
FormFieldsMenuASPNet.prototype.findAllFormElements = FormFieldsMenuASPNet_findAllFormElements;

FormFieldsMenuASPNet.getWebFormControls = FormFieldsMenuASPNet_getWebFormControls;

//--------------------------------------------------------------------

function FormFieldsMenuASPNet(behaviorName, paramName, bPrependNoneLabel, prependLabelsMask, elementFilters) 
{
  this.initialize(behaviorName, paramName, bPrependNoneLabel, prependLabelsMask,elementFilters);
}

//--------------------------------------------------------------------

function FormFieldsMenuASPNet_findAllFormElements(labels, values) 
{
  if (this.formMenu)
  {  
	// Call the base class

    this.findAllFormElements = this.__proto__.__proto__.findAllFormElements;
    this.findAllFormElements(labels, values);
    this.findAllFormElements = FormFieldsMenuASPNet_findAllFormElements;

    var formNode = this.formMenu.getValue();
    
	if (formNode && (formNode.tagName.toUpperCase() == "FORM"))
    {
      var webCtrls = FormFieldsMenuASPNet.getWebFormControls(formNode);
      
      for (var i = 0; i < webCtrls.length; ++i)
      {
        labels.push(webCtrls[i].getAttribute("NAME"));
        values.push(webCtrls[i]);
      }       
    }
  }
}

function FormFieldsMenuASPNet_getWebFormControls(formNode)
{
  var ret = new Array();

  if (formNode != null)
  {
    // TODO: Only find web controls that are in fromNode!

    var curDOM = dw.getDocumentDOM(); 
    
    if (curDOM) 
    {
      var tempDOM = dwscripts.getEmptyDOM();
	  
	  tempDOM.documentElement.outerHTML = curDOM.documentElement.outerHTML; 
      
      for (var i = 0; i < webFormControlArray.length; ++i)
      {
        var dotnetFormItems = tempDOM.getElementsByTagName(webFormControlArray[i]);  
        
        for (var j = 0; j < dotnetFormItems.length; ++j)
        {
          if (dotnetFormItems[j] && dotnetFormItems[j].id && (dotnetFormItems[j].id != ""))
          {
            ret.push(new WebFormControlNode(dotnetFormItems[j].id));
          }
        }
      }       
    }
  }

  return ret;
}

//--------------------------------------------------------------------

WebFormControlNode.prototype.getAttribute = WebFormControlNode_getAttribute;

function WebFormControlNode(id)
{
  this.name = id;
}

function WebFormControlNode_getAttribute(attr)
{
  var ret = "";
  
  if (attr.toUpperCase().indexOf("NAME") != (-1))
  {
    ret = this.name;
  }

  return ret;
}
