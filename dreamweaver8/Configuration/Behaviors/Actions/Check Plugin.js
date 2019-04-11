// Copyright 1998, 1999, 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//****************** Globals *******************

var helpDoc = MM.HELP_behCheckPlugin;

var PLUGIN_NAMES;
var VBScriptCodename;

function initGlobals() {
  PLUGIN_NAMES = new Array("Flash","Shockwave","LiveAudio", //nice names
                           "QuickTime","Windows Media Player");
  PLUGIN_VALUES= new Array("Shockwave Flash","Shockwave for Director","LiveAudio",         //internal names
                           "QuickTime Plug-In","Windows Media Player");
  VBScriptCodename = "Used by MM_checkPlugin";
}


//******************* BEHAVIOR FUNCTION **********************

//Sends the browser to one URL if the plugin exists, otherwise
//sends the browser to an alternate URL.
//The function accepts the following arguments:
//  plugin  - the *exact* name of the plugin as registered (ex: Shockwave Flash)
//  theURL  - optional URL, often a filename, URL encoded. (ex: file.htm, http://www.x.com/y.htm)
//  altURL  - required URL, often a filename, URL encoded. (ex: file.htm, http://www.x.com/y.htm)
//  autoGo  - boolean. If true, always goes to theURL if plugin detection is not possible
//
//Logic:
//  if not Microsoft browser, plugin is there if it exists in the plugins array
//  otherwise, if not Windows 3.1 (which doesn't support plugins)
//    if seeking flash or director plugins and can detect with VBscript,
//      then ok iff VB script says ActiveX control exists.
//    otherwise can't detect, so go if the autoGo flag is set.
//  Also, only goes somewhere if the URLs are there.

function MM_checkPlugin(plgIn, theURL, altURL, autoGo) { //v4.0
  var ok=false; document.MM_returnValue = false;
  with (navigator) if (appName.indexOf('Microsoft')==-1 || (plugins && plugins.length)) {
    ok=(plugins && plugins[plgIn]);
  } else if (appVersion.indexOf('3.1')==-1) { //not Netscape or Win3.1
    if (plgIn.indexOf("Flash")!=-1 && window.MM_flash!=null) ok=window.MM_flash;
    else if (plgIn.indexOf("Director")!=-1 && window.MM_dir!=null) ok=window.MM_dir;
    else ok=autoGo; }
  if (!ok) theURL=altURL; if (theURL) window.location=theURL;
}

MM.VERSION_MM_checkPlugin = 4.0; //define latest version number for behavior inspector

//******************* API **********************


//Can be used with any tag and any event

function canAcceptBehavior(){
  return true;
}



//Returns a Javascript function to be inserted in HTML head with script tags.

function behaviorFunction() {
  return "MM_checkPlugin";
}



//Returns fn call to insert in HTML tag <TAG... onEvent='thisFn(arg)'>
//Calls escQuotes to find embedded quotes and precede them with \
//Calls dw.doURLEncoding to encode URLs

function applyBehavior() {
  var pluginName, theURL, altURL, autoGo, theMenu;

  if (document.theForm.theRadio[0].checked) { //get URL from textfield or menu
    pluginName = document.theForm.menu.options[document.theForm.menu.selectedIndex].value;
  } else {
    pluginName = escQuotes(document.theForm.pluginName.value);
  }

  theURL = dw.doURLEncoding(document.theForm.theURL.value);  //URL encode
  altURL = dw.doURLEncoding(document.theForm.altURL.value);  //URL encode
  autoGo = document.theForm.IEGoesToURL.checked;
  if (pluginName && altURL) {
    if (!autoGo && (pluginName.indexOf("Flash")!=-1 || pluginName.indexOf("Director"))!=-1) {
      addShockwaveVBscript();
    }
    updateBehaviorFns("MM_checkPlugin");
    return "MM_checkPlugin('"+pluginName+"','"+theURL+"','"+altURL+"',"+autoGo+")";
  } else {
    return MSG_NoPluginOrURL;
  }
}



//Returns a dummy function call to inform Dreamweaver the type of certain behavior
//call arguments. This information is used by DW to fixup behavior args when the
//document is moved or changed.
//
//It is passed an actual function call string generated by applyBehavior(), which
//may have a variable list of arguments, and this should return a matching mask.
//
//The return values are:
//  URL     : argument could be a file path, which DW will update during Save As...
//  NS4.0ref: arg is an object ref that may be changed by Convert Tables to Layers
//  IE4.0ref: arg is an object ref that may be changed by Convert Tables to Layers
//  other...: argument is ignored

function identifyBehaviorArguments(fnCallStr) {
  var argArray;

  argArray = extractArgs(fnCallStr);
  if (argArray.length == 5) {
    return "other,URL,URL,other";
  } else {
    return "";
  }
}



//Passed the function call above, takes prior arguments and reloads the UI.
//Removes any escape characters "\"

function inspectBehavior(argStr){
  var i, plugIn, inMenu;
  var argArray = extractArgs(argStr);

  if (argArray.length == 5) {

    plugIn = unescQuotes(argArray[1]);
    document.theForm.theURL.value = unescape(argArray[2]);  //URL decode
    document.theForm.altURL.value = unescape(argArray[3]);  //URL decode
    document.theForm.IEGoesToURL.checked = eval(argArray[4]);

    inMenu = false;
    for (i=0; i<document.theForm.menu.options.length; i++) { //check if exists in menu
      if (document.theForm.menu.options[i].value == plugIn) {
        document.theForm.menu.selectedIndex = i;
        inMenu = true;
        break;
      }
    }
    if (!inMenu) {
      document.theForm.pluginName.value = plugIn;
      setRadio(1); //set radio
    }
  }
}


// Deletes shockwave VB script if there are no references to "Shockwave " (note the space),
// which occurs in MM_checkPlugin() calls that refer to these plugins.

function deleteBehavior(fnCallStr) {
  initGlobals();
  var dom = dw.getDocumentDOM();
  if (dom && dom.documentElement.innerHTML.indexOf("Shockwave ")==-1) {
    delShockwaveVBscript();
  }
}


//**************** LOCAL FUNCTIONS ****************


//Loads a preset list of some plugin names.

function initializeUI() {
  initGlobals();
  for (i=0; i<PLUGIN_NAMES.length; i++) {
    document.theForm.menu.options[i] = new Option(PLUGIN_NAMES[i]);
    document.theForm.menu.options[i].value = PLUGIN_VALUES[i];
  }

  document.theForm.theURL.focus(); //set focus on textbox
  document.theForm.theURL.select(); //set insertion point into textbox
  document.theForm.theRadio[0].checked = true;
  enableBuddy(false,true);
}

function enableBuddy(disableSelect, disablePlugName){
  if (disableSelect){
    document.theForm.menu.setAttribute("disabled","true");
  }else{
    document.theForm.menu.removeAttribute("disabled");
  }
  if (disablePlugName){
    document.theForm.pluginName.setAttribute("disabled","true");
  }else{
    document.theForm.pluginName.removeAttribute("disabled");
  }
}

//Passed a number, selects that radio.

function setRadio(num) {
  document.theForm.theRadio[0].checked = (num==0)?true:false;
  document.theForm.theRadio[1].checked = (num==1)?true:false;
}



//Adds simple VB script for checking shockwave plugins in IE browsers
//Adds below close body tag if not there already.
//Note the unique script name will be used for deletion.

function addShockwaveVBscript() {
  var dom = dw.getDocumentDOM();
  if (dom && dom.documentElement.innerHTML.indexOf(VBScriptCodename)==-1) {//if not already on page, add it
    dom.body.outerHTML += "\n"+
"<script name=\"" + VBScriptCodename + "\" language=\"javascript\">\n"+
"<!"+"--\n"+
"with (navigator) if (appName.indexOf('Microsoft')!=-1 && appVersion.indexOf('Mac')==-1) document.write(''+\n"+
"'<scr'+'ipt language=\"VBScript\">\\nOn error resume next\\n'+\n"+
"'MM_dir = IsObject(CreateObject(\"SWCtl.SWCtl.1\"))\\n'+\n"+
"'MM_flash = NOT IsNull(CreateObject(\"ShockwaveFlash.ShockwaveFlash\"))\\n</scr'+'ipt>');\n"+
"//--"+">\n"+
"</scr"+"ipt>\n";
  }
}


//Deletes shockwave VB script (must have code name).

function delShockwaveVBscript() {
  var i, allScripts, scriptName, dom = dw.getDocumentDOM();
  if (dom) {
    allScripts = dom.getElementsByTagName("SCRIPT");
    if (allScripts) {
      for (i=0; i<allScripts.length; i++) {
        scriptName = allScripts[i].getAttribute("name");
        if (scriptName && scriptName == VBScriptCodename) {
          allScripts[i].outerHTML = "";
          break
  } } } }
}


//Called by Attain to silently update behavior calls
//Returns new call if ok, otherwise returns empty string

function reapplyBehavior(oldBehaviorCall) {
  var newBehaviorCall = "";
  var behName = "MM_checkPlugin";

  document.SILENT_MODE = true;
  initializeUI();
  inspectBehavior(oldBehaviorCall);
  newBehaviorCall = applyBehavior();
  if (newBehaviorCall.indexOf(behName) == -1) newBehaviorCall=""; //if not fn call, return ""
  document.SILENT_MODE = false;

  return newBehaviorCall;
}
