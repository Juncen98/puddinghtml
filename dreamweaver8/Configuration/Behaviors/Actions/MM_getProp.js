//Copyright 2005 Macromedia, Inc. All rights reserved.
//Given an object and a letter, finds the appropriate CSS property,
//whether the property is defined inline or in a stylesheet.
//For example:
//    MM_getProp(layer,'Z');
//will return the value of the zIndex property, if any, for the passed DOM object.
//The letter passed in for "prop" is one of: L, T, W, H, P, Z, or V.
//Look at the function to see what each corresponds to.
function MM_getProp(obj, prop) { //v8.0
  if (!obj) return ("");
  if (prop == "L") return obj.offsetLeft;
  else if (prop == "T") return obj.offsetTop;
  else if (prop == "W") return obj.offsetWidth;
  else if (prop == "H") return obj.offsetHeight;
  else {
    if (typeof(window.getComputedStyle) == "undefined") {
	    if (typeof(obj.currentStyle) == "undefined"){
		    if (prop == "P") return MM_scanStyles(obj,"position");
        else if (prop == "Z") return MM_scanStyles(obj,"z-index");
        else if (prop == "V") return MM_scanStyles(obj,"visibility");
	    } else {
	      if (prop == "P") return obj.currentStyle.position;
        else if (prop == "Z") return obj.currentStyle.zIndex;
        else if (prop == "V") return obj.currentStyle.visibility;
	    }
    } else {
	    if (prop == "P") return window.getComputedStyle(obj,null).getPropertyValue("position");
      else if (prop == "Z") return window.getComputedStyle(obj,null).getPropertyValue("z-index");
      else if (prop == "V") return window.getComputedStyle(obj,null).getPropertyValue("visibility");
    }
  }
}
MM.VERSION_MM_getProp = 8.0; //define latest version number for behavior inspector
