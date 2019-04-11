//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//It is up to the user to called dw.useTranslatedSource(true) before this
//call if they want to

//The "offs" param is an array of offset arrays.  If offs[i][2] is not
//null, then the run specified by the offsets is replace by that value.

function ReplaceChunksInDOMString(offs)
{
	//Make sure the offsets are sorted in top to bottom order
	offs = SortOffsetsArray(offs)

	var dom = dw.getDocumentDOM()

	var str = dom.documentElement.outerHTML

	//debug stuff
	var strOut = ""
	for (var i = 0; i < offs.length; i ++)
	{
		strOut += "\n\noffsets = " + offs[i] 
		strOut += "\n\n" + str.substring(offs[i][0], offs[i][1])
	}
	//alert(strOut)
	//end debug stuff

	//Using the array of offsets, recreate the outerHTML for
	//the whole document.

	var charsAdded = 0
	var countChars = true
	var newStr = ""
	var start = 0
	for (var i = 0; i < offs.length; i++)
	{
		newStr += str.substring(start, offs[i][0])
		if (offs[i][2])
		{
			newStr += offs[i][2]
		}
		start = offs[i][1]


		// We count how many chars we added until we
		// get to a rec that has offs[i][3] == true

		if (offs[i][3])
		{
			countChars = false
		}
		else
		{
			charsAdded -= offs[i][1] - offs[i][0]
			if (offs[i][2])
			{
				charsAdded += offs[i][2].length
			}
		}
	}

	newStr += str.substring(start)
	
	dom.documentElement.outerHTML = newStr

	return charsAdded
}



//Insert Sort based on value of offs[i][0]

function SortOffsetsArray(offs)
{
	var sortedOffs = new Array()
	sortedOffs.push(offs[0]) // get it started

	for (var i = 1; i < offs.length; i++)
	{
		var inserted = false
		for (var j = 0; j < sortedOffs.length; j++)
		{
			var s = sortedOffs[j]
			var ins = offs[i]
			if (s[0] > ins[0])
			{
				//push rest back one
				for (var k = sortedOffs.length; k > j; k-- )
				{	
					if ((k - 1) > -1)
					{
						sortedOffs[k] = sortedOffs[k - 1]
					}
				}
				//insert this new one here
				sortedOffs[j] = ins
				inserted = true	
				break
			}
		}

		if (!inserted)
		{
			sortedOffs.push(offs[i])
		}
	}

	return sortedOffs
}



function DeleteChunks(participants)
{
	var toast = participants
	var dom = dw.getDocumentDOM()
	var offs = new Array()

	for (var i = 0; i < toast.length; i++)
	{
		offs.push(dom.nodeToOffsets(toast[i]))
	}

	ReplaceChunksInDOMString(offs)
}
