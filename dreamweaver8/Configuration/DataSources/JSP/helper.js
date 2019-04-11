// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

function ObjectInfo(title, imageFile, allowDelete,dataSource,name)
{
	this.title = title;
	this.imageFile = imageFile;

	if (ObjectInfo.arguments.length >= 3)
	{
		this.allowDelete = allowDelete
	}
	else
	{
		this.allowDelete = true
	}

	if (ObjectInfo.arguments.length >= 4)
	{
		this.dataSource = dataSource
	}

	if (ObjectInfo.arguments.length >= 5)
	{
		this.name = name
	}
}

function GenerateObjectInfoForSourceBindings(oldArray, filename, dataBinding)
{
	var outArray = new Array();
	for (var i = 0; i < oldArray.length; i++)
	{
		outArray[outArray.length] = new ObjectInfo(oldArray[i], filename, true, dataBinding);
	}
	return outArray;
}

////////////////////////////////////////////////////////////////////////////////
//
//  Function: findNodebyName(elementName)
//
//  Returns a data source node by name.
////////////////////////////////////////////////////////////////////////////////
function findSourceNode(elementName)
{
	var foundnode = null;
	var currentdom = dreamweaver.getDocumentDOM();

	if (currentdom) {
	var nodes = currentdom.getElementsByTagName("MM_RESULTSET");
	for (var index =0 ; index < nodes.length ; index++)	{
		var node = nodes.item(index);
		if (node) {
			if(node.getAttribute("NAME") == elementName) {
				foundnode = node;
			}
		}
	}

	if (!foundnode){
		var nodes = currentdom.getElementsByTagName("MM_CALLABLE");
		for (var index =0 ; index < nodes.length ; index++)	{
			var node = nodes.item(index);
			if (node) {
				if(node.getAttribute("NAME") == elementName) {
					foundnode = node;
				}
			}
		}
	}

	if (!foundnode){
		var nodes = currentdom.getElementsByTagName("MM_CALLRESSET");
		for (var index =0 ; index < nodes.length ; index++)	{
			var node = nodes.item(index);
			if (node) {
				if(node.getAttribute("NAME") == elementName) {
					foundnode = node;
				}
			}
		}
	}
   }

	return foundnode;
}

function findSSrec(node,type)
{
  ssRecs = dw.serverBehaviorInspector.getServerBehaviors();
  ssMatchRec = null;
    for (var j=0; j<ssRecs.length; j++) { //search all ssRecs
      ssRec = ssRecs[j];
      if ((ssRec.participants)&&(ssRec.type == type)) {
        for (var k=0; k<ssRec.participants.length; k++) {    //scan ssRec participants
          if (ssRec.participants[k] == node){
			ssMatchRec = ssRec;
		   } //check if node is participant, and increase refCount
        }
      }
    }
  return ssMatchRec;
}
function findSSrecByTitle(title,type)
{
  ssRecs = dw.serverBehaviorInspector.getServerBehaviors();
  ssMatchRec = null;
    for (var j=0; j<ssRecs.length; j++) { //search all ssRecs
      ssRec = ssRecs[j];
      if ((ssRec.participants)&&(ssRec.type == type)&&(ssRec.title == title)) {
			ssMatchRec = ssRec;
        }
      }
  return ssMatchRec;
}


function GetResultsetNodeForCallable(node)
{
	var rnode = null;
	if (node.hasChildNodes())
	{
		for (var i = 0; i < node.childNodes.length; i ++)
		{
			var thisChild = node.childNodes[i]
			if (thisChild.tagName == "MM_CALLRESSET")
			{
				rnode = thisChild;
				//Currently we support only one returned recordset.
				break;
			}
		}
	}
	
	return rnode;
}


function IsCallableGeneratedRecordset(name)
{
	var foundnode = null;
	var currentdom = dreamweaver.getDocumentDOM();
	if (currentdom) 
	{
		var nodes = currentdom.getElementsByTagName("MM_CALLRESSET");
		for (var index =0 ; index < nodes.length ; index++)	{
			var node = nodes.item(index);
			if (node) {
				if(node.getAttribute("NAME") == name) {
					foundnode = node;
				}
			}
		}
	}
	return foundnode;
}
