//SHARE-IN-MEMORY=true
// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//--------------------------------------------------------------------
// CLASS:
//   FormFieldsMenu
//
// DESCRIPTION:
//   This class represents a select list of form elements within a given
//   form. The list labels are the form element names, and the list values
//   are the form element nodes.
//
// PUBLIC PROPERTIES:
//
// PUBLIC FUNCTIONS:
//
//   initializeUI()
//   updateUI(control, event)
//
//   getValue()
//   pickValue(theValue)
//   enable(enable)
//
//   applyServerBehavior(sbObj, paramObj)
//   inspectServerBehavior(sbObj)
//
//--------------------------------------------------------------------

// Global varaiable so that other controls can find this one
var FORM_FIELD_MENU = '';


//-------------------------------------------------------------------
// FUNCTION:
//   FormFieldsMenu
//
// DESCRIPTION:
//   Constructor function
//
// ARGUMENTS:
//   behaviorName - the name of the behavior using this control
//   paramName - the name of the parameter that is being set
//   bPrependNoneLabel - boolean (optional). 'true' if should prepend a 'None' to the 
//     beginning of the labels list. Defaults to false.
//   prependLabelsMask - one of FormFieldsMenu.LABELS_MASK_* (optional). Used to
//     specify what text to prepend to the form element names in the list. Defaults
//     to FormFieldsMenu.LABELS_MASK_NONE.
//   elementFilters - array (optional). Used to identify form elements that should
//     not appear in the list. Each element is an object with two properties: prop & value.
//     If any of the prop/value pairs matches a property/value pair in
//     a form element, the element is not included in the list. For example,
//     [{prop: "name", value: "MM"}, {prop: "type", value: "submit"}] will filter out any 
//     form elements with name 'MM' and all submit buttons. Defaults to empty.
//
// RETURNS:
//--------------------------------------------------------------------

function FormFieldsMenu(behaviorName, paramName, bPrependNoneLabel, prependLabelsMask, elementFilters) 
{
  this.initialize(behaviorName, paramName, bPrependNoneLabel, prependLabelsMask,elementFilters);
}

// Class constants
// Label Masks. Used to specify what text, if any, to prepend to the form element names
//   listed in the select list.
FormFieldsMenu.LABELS_MASK_NONE = "NONE";         // elmName
FormFieldsMenu.LABELS_MASK_FORMREF = "FORMREF";   // FORM.elmName
FormFieldsMenu.LABELS_MASK_FORMNAME = "FORMNAME"; // formName.elmName

//public methods
FormFieldsMenu.prototype.initialize = FormFieldsMenu_initialize;
FormFieldsMenu.prototype.initializeUI = FormFieldsMenu_initializeUI;
FormFieldsMenu.prototype.updateUI = FormFieldsMenu_updateUI;

FormFieldsMenu.prototype.get = FormFieldsMenu_get;
FormFieldsMenu.prototype.pick = FormFieldsMenu_pick;
FormFieldsMenu.prototype.getValue = FormFieldsMenu_getValue;
FormFieldsMenu.prototype.pickValue = FormFieldsMenu_pickValue;
FormFieldsMenu.prototype.enable = FormFieldsMenu_enable;

FormFieldsMenu.prototype.applyServerBehavior = FormFieldsMenu_applyServerBehavior;
FormFieldsMenu.prototype.inspectServerBehavior = FormFieldsMenu_inspectServerBehavior;

//private methods
FormFieldsMenu.prototype.findAllFormElements = FormFieldsMenu_findAllFormElements;
FormFieldsMenu.matchRadioInput = FormFieldsMenu_matchRadioInput;

//no ops
FormFieldsMenu.prototype.findServerBehaviors = FormFieldsMenu_findServerBehaviors;
FormFieldsMenu.prototype.canApplyServerBehavior = FormFieldsMenu_canApplyServerBehavior;
FormFieldsMenu.prototype.deleteServerBehavior = FormFieldsMenu_deleteServerBehavior;
FormFieldsMenu.prototype.analyzeServerBehavior = FormFieldsMenu_analyzeServerBehavior;

//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI()
//
// DESCRIPTION:
//   Locates the FormMenu control which is needed for this
//   control, and adds a callback to its event handler.
//
// ARGUMENTS:
//   formControl - JS Object - the form control to 
//     use for this form field control
//
// RETURNS:
//   boolean - false if could not retrieve form elements for the form.
//--------------------------------------------------------------------
function FormFieldsMenu_initialize(behaviorName, paramName, bPrependNoneLabel, prependLabelsMask,elementFilters) 
{
  this.behaviorName = behaviorName;
  this.paramName = paramName;
  
  this.formMenu = '';  // this is a pointer to a formMenu instance

  this.haveFormFields = false;
  
  this.listControl = '';
  
  this.bPrependNoneLabel = (bPrependNoneLabel) ? true : false;
  this.prependLabelsMask = (prependLabelsMask) ? prependLabelsMask 
                                               : FormFieldsMenu.LABELS_MASK_NONE;
  this.elementFilters = (elementFilters) ? elementFilters : null;

  FORM_FIELD_MENU = paramName;
}


//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI()
//
// DESCRIPTION:
//   Locates the FormMenu control which is needed for this
//   control, and adds a callback to its event handler.
//
// ARGUMENTS:
//   formControl - JS Object - the form control to 
//     use for this form field control
//
// RETURNS:
//   boolean - false if could not retrieve form elements for the form.
//--------------------------------------------------------------------
function FormFieldsMenu_initializeUI(formControl) 
{
  var retVal = true;

  // Set the formMenu control
  if (formControl != null) 
  {
    this.formMenu = formControl;
  }
  else
  {
    alert(MM.MSG_MENU_ERROR_5); 
  }

  // Get the labels and values for the list control.
  this.listControl = new ListControl(this.paramName);
  var labels = new Array();
  var values = new Array();
  this.findAllFormElements(labels, values);

  if (labels.length > 0)
  {
    this.listControl.setAll(labels, values);
    this.haveFormFields = true;
  }
  else
  {
    this.listControl.setAll(new Array(""),new Array(""));
    this.haveFormFields = false;
    retVal = false;
  }
  this.listControl.setIndex(-1);

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateUI()
//
// DESCRIPTION:
//   Called from the form Menu to indicate that a new
//   form has been selected.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean - false if could not find form elements for the form.
//--------------------------------------------------------------------
function FormFieldsMenu_updateUI(control, event)
{
  var retVal = true;
  
  if (this.formMenu && control == this.formMenu)
  {
    var labels = new Array();
    var values = new Array();
    this.findAllFormElements(labels, values);

    if (labels.length > 0)
    {
      this.listControl.setAll(labels, values);
      this.haveFormFields = true;
    }
    else
    {
      this.listControl.setAll(new Array(""),new Array(""));
      this.listControl.set(MM.LABEL_NoFields, 0); 
      this.haveFormFields = false;
      retVal = false;
    }

    if (window.updateUI != null)
    {
      window.updateUI(this.paramName, "onUpdateUI"); // indicate that we have updated
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getValue
//
// DESCRIPTION:
//   Returns the currently selected form element node.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function FormFieldsMenu_getValue(arg)
{
  var retVal = this.listControl.getValue(arg);

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   get
//
// DESCRIPTION:
//   Returns the currently selected form element label.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function FormFieldsMenu_get(arg)
{
  var retVal = this.listControl.get(arg);

  // Treat the NoFields and None labels as "".
  if (retVal == MM.LABEL_NoFields || retVal == MM.LABEL_None)
  {
    retVal = "";
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   pick
//
// DESCRIPTION:
//   Select the form element with the given label.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function FormFieldsMenu_pick(formElementLabel)
{
  var retVal = false;
  
  if (this.formMenu) 
  {    
    // If we are prepending a 'None' label, treat '' as 'None'.
    if (formElementLabel == "" && this.bPrependNoneLabel)
    {
      formElementLabel = MM.LABEL_None;
    }
    retVal = this.listControl.pick(formElementLabel, caseInsensitiveCompare);

    if (retVal && window.updateUI != null)
    {
      window.updateUI(this.paramName, "onPickValue");
    }
  }

  return retVal;
}

function caseInsensitiveCompare(object, searchValue)
{
  return (String(object).toUpperCase() == String(searchValue).toUpperCase());
}


//--------------------------------------------------------------------
// FUNCTION:
//   pickValue
//
// DESCRIPTION:
//   Select the form element with the given form element node.
//
// ARGUMENTS:
//   formElementNode - node pointer. the form element to select.
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function FormFieldsMenu_pickValue(formElementNode)
{
  var retVal = false;
  
  if (this.formMenu) 
  {    
    retVal = this.listControl.pickValue(formElementNode);

    if (retVal && window.updateUI != null)
    {
      window.updateUI(this.paramName, "onPickValue");
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   FormFieldsMenu_enable
//
// DESCRIPTION:
//   Enables the list control
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function FormFieldsMenu_enable(enable)
{
  if ((enable != null) && !enable)
  {
    this.listControl.disable();
  }
  else
  {
    this.listControl.enable();
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function FormFieldsMenu_applyServerBehavior(sbObj, paramObj) 
{
  var retVal = "";
  
  var formFieldName = this.listControl.get();
  paramObj[this.paramName] = formFieldName;
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function FormFieldsMenu_inspectServerBehavior(sbObj)
{
  var retVal = false;
  
  var formFieldName = sbObj.parameters[this.paramName];

  retVal = this.pick(formFieldName);

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   findServerBehaviors
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function FormFieldsMenu_findServerBehaviors(paramObj)
{
  // nothing needed here 
}


//--------------------------------------------------------------------
// FUNCTION:
//   canApplyServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function FormFieldsMenu_canApplyServerBehavior(sbObj)
{
  var retVal = true;
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   deleteServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function FormFieldsMenu_deleteServerBehavior(sbObj)
{
  // nothing needed here 
}


//--------------------------------------------------------------------
// FUNCTION:
//   analyzeServerBehavior
//
// DESCRIPTION:
//
// ARGUMENTS: 
//
// RETURNS:
//--------------------------------------------------------------------
function FormFieldsMenu_analyzeServerBehavior(sbObj, allRecs)
{
  // nothing needed here
}

//--------------------------------------------------------------------
// FUNCTION:
//   findAllFormElements
//
// DESCRIPTION:
//   This function returns the labels and values for the listControl that will
//   display all form elements for the selected form. 
//
// ARGUMENTS:
//   labels - empty array. output parameter.
//   values - empty array. output parameter.
//
// RETURNS:
//   labels - array of form element references. Parallel to values.
//   values - array of form element nodes. Parallel to labels.
//--------------------------------------------------------------------

function FormFieldsMenu_findAllFormElements(labels, values) 
{
  if (this.formMenu)
  {
    // Just make sure we've got a form menu. If it's an instance of tagMenu that
    //   we're using, check that a form is selected since it could have any tag type.
    var formNode = this.formMenu.getValue();
    if (formNode && formNode.tagName.toUpperCase() == "FORM")
    {
      // Prepend 'None' label if required.
      if (this.bPrependNoneLabel)
      {
        labels.push(MM.LABEL_None);
        values.push(null); 
      }
    
      var formElements = formNode.elements; 
      if (formElements && formElements.length && formElements.length > 0)
      {
        for (var i = 0; i < formElements.length; ++i)
        {
          // See if this element should be filtered out. 
          var includeElement = true;
          for (var j = 0; includeElement && j < this.elementFilters.length; ++j)
          {
            var prop = this.elementFilters[j].prop;
            var value = this.elementFilters[j].value;
            if (   formElements[i][prop] 
                && formElements[i][prop].toUpperCase() == value.toUpperCase()
               )
            {
              includeElement = false;
            }
          }
          
          // Add the element if not filtered out and if it has a name.
          if (includeElement && formElements[i].name && formElements[i].name != "")
          {
            // Check if this is a radio button which is part of a radio group
            //   that we've already added to the field list. If so, we don't
            //   want to add it again.
            var bIsDuplicateRadio = false;
            if (   formElements[i].tagName == "INPUT" && formElements[i].type
                && formElements[i].type.toUpperCase() == "RADIO"
               )
            {
              bIsDuplicateRadio = (dwscripts.findInArray(values, formElements[i], 
                                   FormFieldsMenu.matchRadioInput) != -1);
            }

            if (!bIsDuplicateRadio)
            {
              values.push(formElements[i]);
              switch (this.prependLabelsMask)
              {
                case FormFieldsMenu.LABELS_MASK_FORMREF:
                  labels.push("FORM." + formElements[i].name);         
                  break;
                case FormFieldsMenu.LABELS_MASK_FORMNAME:
                  labels.push(((formNode.name) ? formNode.name + "." : "")
                              + formElements[i].name);
                  break;
                case FormFieldsMenu.LABELS_MASK_NONE:
                default:
                  labels.push(formElements[i].name);  
              }           
            }
          }
        }
      }
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   matchRadioInput
//
// DESCRIPTION:
//   Pass to dwscripts.findInArray to find a radio input element that
//   is part of a radio group represented by an existing radio input
//   element in a list of form elements. 
//
// ARGUMENTS: 
//   listElm - DOM node ptr.
//   searchValue - DON node ptr. The radio node.
//
// RETURNS:
//   boolean - true if object is a radio node with same name as searchValue
//--------------------------------------------------------------------
function FormFieldsMenu_matchRadioInput(listElm, searchValue)
{
  var retVal = false;
  if(   listElm && listElm.tagName == "INPUT" 
     && listElm.type.toUpperCase() == "RADIO" && listElm.name == searchValue.name
    ) 
  {
    retVal = true;
  }
 
  return retVal; 
}

