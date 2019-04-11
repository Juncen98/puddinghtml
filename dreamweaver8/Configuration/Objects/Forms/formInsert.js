//
// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
//
//formInsert.js

var PLATFORM = navigator.platform;
// Determine if the form object should be automatically wrapped in form.
function getFormAddPref () {
  var autoAdd, rtnValue = 'ASK';
  var path = dreamweaver.getConfigurationPath() + '/Objects/Forms/formInsert.js';
  var metaFile;
  metaFile = MMNotes.open(path, true);
  if (metaFile) {
    autoAdd = MMNotes.get(metaFile, 'PREF_autoAdd');
    if (autoAdd) rtnValue = autoAdd;
    MMNotes.close(metaFile);
  }
  return rtnValue;
}

function setFormAddPref (setValue) {
  var path = dreamweaver.getConfigurationPath() + '/Objects/Forms/formInsert.js';
  var metaFile;

  metaFile = MMNotes.open(path, true); // Force create the note file.
  if (metaFile) {
    if (setValue) autoAdd = MMNotes.set(metaFile, 'PREF_autoAdd', setValue);
    MMNotes.close(metaFile);
  }
}


function userConfirmAdd() {
  var retVal = false;
  var cmdName = 'ConfirmDS.htm';
  var cmdFile = dreamweaver.getConfigurationPath() + '/Commands/' + cmdName;
  
  var cmdDOM = dreamweaver.getDocumentDOM(cmdFile);
  if (cmdDOM) {
    var cmdWin = cmdDOM.parentWindow;
    // Pass one arg for OK/Cancel, or extra args to define btns
		if (PLATFORM == "Win32")
      cmdWin.render(MM.MSG_AutoFormAdd, MM.BTN_Yes, MM.BTN_No);
		else
		  cmdWin.render(MM.MSG_AutoFormAdd, MM.BTN_No, MM.BTN_Yes);
    dreamweaver.popupCommand(cmdName);
    retVal = (MMNotes.Confirm_RESULT == MM.BTN_Yes); // Reference to confirm global result.
    if (MMNotes.Confirm_DONOTSHOW) {
      if (retVal) setFormAddPref('ADDFORM');
      else setFormAddPref('NOFORM');
    } else {
      // setFormAddPref('ASK'); // Default value.
    }
  }
  return retVal;
}



function returnFormTag(rtnStr) {
  rtnStr = dwscripts.trim(rtnStr);

  var hiddenPatt = /hidden/i;
  var inputPatt = /input/gi;
  var anglePatt = /</g;
  
  if (((rtnStr.match(inputPatt) != null && (rtnStr.match(inputPatt).length == 1) && !hiddenPatt.test(rtnStr)) || (rtnStr.match(inputPatt) == null)) && (rtnStr.match(anglePatt) != null && rtnStr.match(anglePatt).length <= 2)){
	  prefsAccessibilityOption = dw.getPreferenceString("Accessibility", "Accessibility Form Options", "");
	  if (prefsAccessibilityOption=='TRUE'){
      rtnStr= addAccessibility(rtnStr);
    }
  }

  var dom = dw.getDocumentDOM();
  // Set variable for use only if input type is file
  var encType = (rtnStr.indexOf('type="file"') != -1)?' enctype="multipart/form-data"':'';

  // If wrap form field preference is set.
  if (!dwscripts.isInsideTag(dom.getSelectedNode(),"FORM") && 
      !dwscripts.isInsideTag(dom.getSelectedNode(),"CFFORM") &&
      dw.getFocus() != 'textView' && dw.getFocus() != 'html') 
  {
	  var nameValStr = dwscripts.getUniqueNameForTag('form','form');
	  var nameStr ='';
	  var openBlockStr = '';
	  var closeBlockStr = '';
	  if (dom.getIsXHTMLStrictDocument())
	  {
		  //xhtml strict, only id and enclosing element need to be in a p or div
		  nameStr = ' id="' + nameValStr + '"';
		  openBlockStr = '<p>';
		  closeBlockStr = '</p>';
	  }
	  else if (dom.getIsXHTMLDocument())
		  nameStr = ' id="'+ nameValStr + '" name="' + nameValStr + '"';
	  else 
		  nameStr = ' name="' + nameValStr + '"';

    switch (getFormAddPref()) {

    case 'ADDFORM':
      // Check if there is a form around the current selection and wrap the returned tag.
      rtnStr = '<form' + nameStr + encType +' method="post" action="">' + openBlockStr + rtnStr + closeBlockStr + '\</form>';
      break;

    case 'NOFORM':
      // No form requested, do nothing.
      break;
      
    case 'ASK':
    default:
      // Ask for confirmation before adding.
      if (userConfirmAdd()) {
        rtnStr = '<form' + nameStr + encType +' method="post" action="">' + openBlockStr + rtnStr + closeBlockStr + '\</form>';
      }
      break;
	  }
  }
  
  // Return the text field.
  return rtnStr;
}

/////////////////////////////////////////////////////////////////////////
//  addAccessibility: adds accessibility attributes such as tabindex, acessKey,
//                    alt and (optional) "lable/for" to the input tag
//
//  receives: string containing the input tag
//  returns: input tag with non-empty attributes added.

function addAccessibility(rtnStr) { 
   var cmdFile = dreamweaver.getConfigurationPath() + "/Commands/FormOptions.htm";
   var cmdDOM = dreamweaver.getDocumentDOM(cmdFile);
   
   cmdDOM.parentWindow.setFormItem(rtnStr);
   dreamweaver.popupCommand("FormOptions.htm");

   return (cmdDOM.parentWindow.returnAccessibilityStr(rtnStr));	
}