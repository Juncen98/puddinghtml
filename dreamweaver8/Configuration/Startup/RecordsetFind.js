// Copyright 1999, 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.



//******************* API **********************

function findRs(){
	MM.rsTypes = new Array();
	xmlFiles = new Array();
	xmlFiles = getSiteFiles(dw.getConfigurationPath() + "/Shared/Recordset/",xmlFiles);
	for (fileIdx = 0;fileIdx < xmlFiles.length;fileIdx++) {
		rsDom = dw.getDocumentDOM(xmlFiles[fileIdx]);
		recordsets = rsDom.getElementsByTagName("recordset");
		for (i = 0; i < recordsets.length;i++ ) {
			tm = new Object();
			tm.serverModel = recordsets[i].serverModel;
			tm.type = recordsets[i].type;
			tm.command = recordsets[i].command;
			tm.fileExt = recordsets[i].fileExt;
			tm.documentType = recordsets[i].documentType;
			tm.single = recordsets[i].single;
			tm.priority = recordsets[i].priority;
			tm.saveUI = recordsets[i].saveUI;
			tm.preferedName = recordsets[i].preferedName;
			tm.subTypes = getSubTypes(recordsets[i]);
			tm.changeOnEdit = recordsets[i].changeOnEdit;
			if( tm.fileExt ) { tm.fileExtRegExp = new RegExp(tm.fileExt, "i"); }
			if( tm.documentType ) { tm.documentTypeRegExp = new RegExp(tm.documentType, "i"); }
			MM.rsTypes.push(tm);
		}
	}
	MM.rsTypes = unifyAndSort(MM.rsTypes);
}


// recursively get the php and asp files from the site
function getSiteFiles(location,files) {
	var newFiles=files; //the new list of file
	var fileIdx;
	var folderIdx;
	var filesOfFolder;
	var foldersOfFolder;
	var tempLoc=location;
	if (tempLoc[tempLoc.length - 1] != '/') {
		tempLoc+="/";
	}

	filesOfFolder=DWfile.listFolder(tempLoc,"files");
	// and the php and asp files
	for (fileIdx = 0;fileIdx < filesOfFolder.length; fileIdx++) {
		newFiles[newFiles.length] = tempLoc + filesOfFolder[fileIdx];
	}
	foldersOfFolder=DWfile.listFolder(tempLoc,"directories");
	// recursively add the folders content
	for (folderIdx = 0;folderIdx < foldersOfFolder.length; folderIdx++) {
		//newFiles[newFiles.length] = tempLoc + foldersOfFolder[folderIdx];
		newFiles = getSiteFiles(tempLoc + foldersOfFolder[folderIdx],newFiles);
	}
	return newFiles;
}

function prioritySort(a,b) {
	return a.priority - b.priority;
}

//get the subtypes from a recordset node
function getSubTypes(rsNode) {
	subTypes = rsNode.getElementsByTagName("subType");
	types = new Array();
	for (ii = 0;ii < subTypes.length;ii++) {
		tmObj = new Object;
		tmObj.name = subTypes[ii].name;
		tmObj.value = subTypes[ii].value;
		tmObj.priority = subTypes[ii].priority;
		types.push(tmObj);
	}
	return types;
}

// unify the information conatained in fields with the same type by unifying the subtypes
// IAKT: Edited by BRI on 08/07/02
function unifyAndSort(rsType) {
	var newTypes = new Array();
	var i;
	for (i = 0;i < rsType.length;i++) {
		position0 = arrayContainsElement(newTypes,rsType[i],"type", "serverModel"); // position of the element having the same type and server model
		position = arrayContainsElement(newTypes,rsType[i],"type", "serverModel", "fileExt"); // position of the element having the same type, server model and file extension

		if (position < 0 && position0 >= 0) {
			// if the type and server model match an existing element, but the file extension is different
			if (typeof newTypes[position0].fileExt == 'undefined') {
				// if the matched element does not have a file extension, overwrite it
				position = position0;
			} else {
				// if the matched element has a file extension
				if (typeof rsType[i].fileExt == 'undefined') {
					// if the current element does not have a file extension
					continue;
				}
			}
		}

		if (position < 0) {
			newTypes.push(rsType[i]);
		} else {
			newTypes[position] = unifyElements(newTypes[position],rsType[i]);
		}
	}

	for (i =0;i < newTypes.length;i++) {
		newTypes[i].subTypes.sort(prioritySort);
	}
	newTypes.sort(prioritySort);
	return newTypes;
}


//-------------------------------------------------------
// FUNCTION:
//					unifyElements
// DESCRIPTION:
//				copy the subTypes of the second element in the first element if there isn't allready
// PARAMETERS:
// 				e1 - first rsType element
//				e2 - second rsType element
// RETURN VALUE:
//			the new element
//-------------------------------------------------------
function unifyElements(e1,e2) {
	var ii;
	newEl = e2;
	for (ii = 0;ii < e1.subTypes.length;ii++) {
		if (arrayContainsElement(newEl.subTypes,e1.subTypes[ii],"name","value") < 0) {
			newEl.subTypes.push(e1.subTypes[ii]);
		}
	}
	return newEl;
}



//-------------------------------------------------------
// FUNCTION:
//					arrayContainsElement
// DESCRIPTION:
//				check if an array containes an element and returns the position of the element in the array
// PARAMETERS:
// 				arrayVal - array variable
//				element - the element to be searched
//          ... properties of element that need to be matched
// RETURN VALUE:
//			the index of the matched element , -1 otherwise
// -----------------------------------------------------------

function arrayContainsElement(arrayVal,element) {
	var ii,jj;
	for (ii = 0;ii < arrayVal.length;ii++) {
		// if the function more that 2 arguments mean that we have specified the arguments to be matched
		if (arrayContainsElement.arguments.length > 2) { 
			isEqual = true;
			for (jj = 2;jj < arrayContainsElement.arguments.length;jj++) {
				property = arrayContainsElement.arguments[jj];
				if (arrayVal[ii][property] != element[property]) {
					isEqual = false;
				}
			}
			if (isEqual) {
				return ii;
			}
		} else {// if not we compare the two elements normally
			if (arrayVal[ii] == element) {
				return ii;
			}
		}
	}
	return -1;
}