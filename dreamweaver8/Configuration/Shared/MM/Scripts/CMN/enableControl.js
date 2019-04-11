//Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

// This function takes a pointer to a control, ctrl,
// and a boolean, enable, which tell the function
// whether to enable or disable the control.
// It is okay to call "enable" on a control that is
// already enabled.  Likewise, it is okay to cal
// "disable" on a control that is already disabled.

function SetEnabled(ctrl, enable){
	var outerHTML = ctrl.outerHTML;
	var found = outerHTML.search(/((<.*)\s+disabled=true\b)/i);
	var setOuterHTML = false;
	if (enable)	{
		// we are enabling the control
		if (found > -1){
			// if we found the word "disabled" get rid of it
			var prefix = RegExp.$1;
			var newOuter = outerHTML.substring(0, found + prefix.length - "disabled=true".length);
			newOuter += outerHTML.substring(found + prefix.length);
			outerHTML = newOuter;
			setOuterHTML = true;			
		}
	}else{
		// we are disabling the control
		if (found == -1){
			var foundInsertPoint = outerHTML.search(/(<\w+)\s+/);
			if (foundInsertPoint > -1){
				var prefix = RegExp.$1;
				outerHTML = outerHTML.substring(0, foundInsertPoint + prefix.length) + " disabled=true " + outerHTML.substring(foundInsertPoint + prefix.length);
				setOuterHTML = true;
			}
		}
	}
	if (setOuterHTML){
		ctrl.outerHTML = outerHTML
	}
}

