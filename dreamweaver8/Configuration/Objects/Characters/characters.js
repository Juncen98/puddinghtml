// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
var PLATFORM = navigator.platform;

function checkEncoding()
{
  var dom = dw.getDocumentDOM();
	var metaArray = dom.getElementsByTagName("META");
	var encoding="",content="",retVal;
	var latinEncode = "iso-8859-1"
	encoding = dom.getCharSet();
 
	if (encoding != latinEncode && encoding != "utf-8")
	{
	  if (getFormNoWarnPref() == 'ASK')
		  retVal = userConfirmAdd()
	}
}

function userConfirmAdd() {
  var contributeBool = (dw.appName == "Contribute");

  var retVal = false;
  var cmdName;
  if (contributeBool)
    cmdName = 'CCAlert.htm';
  else
    cmdName = 'AlertDS.htm';

  var cmdFile = dreamweaver.getConfigurationPath() + '/Commands/' + cmdName;
  
  var cmdDOM = dreamweaver.getDocumentDOM(cmdFile);
  if (cmdDOM) {
    var cmdWin = cmdDOM.parentWindow;
    // Pass one arg for OK/Cancel, or extra args to define btns
    if (contributeBool)
      cmdWin.render(MM.MSG_odSpecialCharNonLatinEncodeCC, "       "+MM.BTN_OK+"       ");
    else
      cmdWin.render(MM.MSG_SpecialCharNonLatinEncode, "       "+MM.BTN_OK+"       ");
    
    dreamweaver.popupCommand(cmdName);
    retVal = (MMNotes.Confirm_RESULT == "       "+MM.BTN_OK+"       "); // Reference to confirm global result.
    if (MMNotes.Confirm_DONOTSHOW) 
      setFormNoWarn('DONTASK');
  }
  return retVal;
}

function getFormNoWarnPref () {
  var noWarn, rtnValue = 'ASK';
  var path = dreamweaver.getConfigurationPath() + '/Objects/Characters/characters.js';
  var metaFile;
  metaFile = MMNotes.open(path, false);
  if (metaFile) {
    noWarn = MMNotes.get(metaFile, 'PREF_noWarning');
    if (noWarn) rtnValue = noWarn;
    MMNotes.close(metaFile);
  }
  return rtnValue;
}

function setFormNoWarn (setValue) {
  var path = dreamweaver.getConfigurationPath() + '/Objects/Characters/characters.js';
  var metaFile;

  metaFile = MMNotes.open(path, true); // Force create the note file.
  if (metaFile) {
    if (setValue) autoAdd = MMNotes.set(metaFile, 'PREF_noWarning', setValue);
    MMNotes.close(metaFile);
  }
}

function doInsert(entity){
	var dom = dw.getDocumentDOM();
	var sel;
  if (dom.getView() == 'design' || (dom.getView() == 'split' && dw.getFocus(true) != 'textView')){
		dom.insertHTML(entity,true);
		sel = dom.getSelection();
		dom.setSelection(sel[1],sel[1]);
	}
	else{
		// CodeView has focus so just insert the entity string
		// directly into the source over whatever is currently selected.
		// The selection should be automatically collapsed after the
		// entity when we are through, so no need to manually set it.
		sel = dom.source.getSelection();
		dom.source.replaceRange(sel[0], sel[1], entity);
	}
}
