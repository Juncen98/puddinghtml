//Copyright 2005 Macromedia, Inc. All rights reserved.
//Given an object and a CSS property, finds the value of
//that property for the object, whether it's defined
//inline or in a stylesheet. (NOTE: The assumption is that
//if the property is defined in a stylesheet, the selector
//for the style definition is an id, i.e., #Layer1.) This 
//function is necessary because Safari 1.3 and earlier do
//not support window.getComputedStyle() or [object].currentStyle
//(see MM_getProp.js).
function MM_scanStyles(obj, prop) { //v8.0
  var inlineStyle = null; var ccProp = prop; var dash = ccProp.indexOf("-");
  while (dash != -1){ccProp = ccProp.substring(0, dash) + ccProp.substring(dash+1,dash+2).toUpperCase() + ccProp.substring(dash+2); dash = ccProp.indexOf("-");}
  inlineStyle = eval("obj.style." + ccProp);
  if(inlineStyle) return inlineStyle;
  var ss = document.styleSheets;
  for (var x = 0; x < ss.length; x++) { var rules = ss[x].cssRules;
	for (var y = 0; y < rules.length; y++) { var z = rules[y].style;
	  if(z[prop] && (rules[y].selectorText == '*[ID"' + obj.id + '"]')) {
        return z[prop];
  }  }  }  return "";
}
MM.VERSION_MM_scanStyles = 8.0; //define latest version number for behavior inspector
