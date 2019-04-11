// Copyright 1998, 1999, 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

/* ----------------------------------------------------------------------*/
//Grid Control Class

// Include: common.js

function GridControl(selName, layerObj) {
  // properties
  this.selectName  = selName;
  this.object = (layerObj) ? findObject(selName, layerObj) : findObject(selName);
  this.list = new Array();
  this.valueList = new Array();
  this.index = -1;
}

// methods

GridControl.prototype.append    = GridControlAppend;   // append()   //append a new blank line to the end of the list
                                                       // append('default')  //append default text
                                                       // append('default',value)  // append text and an associated value
GridControl.prototype.del       = GridControlDel;      // del()  //delete the selected line
GridControl.prototype.delAll    = GridControlDelAll;
GridControl.prototype.getIndex  = GridControlGetIndex; // getIndex()  //pulls out the selected index.
GridControl.prototype.getContents = GridControlGetContents;
GridControl.prototype.setIndex = GridControlSetIndex; //set selectedIndex
GridControl.prototype.setColumns = GridControlSetColumns; // takes a comma-separated list of col names
GridControl.prototype.setContents = GridControlSetContents; //takes a 2 dimensional array and populates grid


//con is a 2D array that is gotten from getContents()
function GridControlSetContents(con)
{
	var strInner = ""
	for (var i = 0; i < con.length; i++)
	{
		var anOption = con[i]
		var opString = ""
		for (var j = 0; j < anOption.length; j++)
		{
			if (j > 0)
			{
				opString += ":MM_SEPARATOR:"
			}
			//alert("about to encode >>" + anOption[j] + "<<")
			var newStr = GridControlEscHTMLChars(anOption[j])
			//alert("encoded = >>" + newStr + "<<")
			opString += newStr
		}
	
		strInner += "<option>" + opString + "</option>"
	}

	this.object.innerHTML = strInner
}


function GridControlSetColumns(cols)
{
	this.object.columns = cols
}


function GridControlSetIndex(ind)
{
	this.object.selectedIndex = ind
}


function GridControlDelAll()
{
	this.object.innerHTML = ""

}


function GridControlGetContents()
{
	// When you get innerHTML here, there are a bunch of
	// spaces and newlines inserted for formatting.
	// We have to strip this stuff out.


	var strX = this.object.innerHTML
	var str = strX.replace(/\n/g, "")
	str = str.replace(/\r/g, "")
	str = str.replace(/ /g, "")
	var lowerStr = String(str).toLowerCase();

	//alert("get contents\nafter stripping crlf and spaces\nstr = \n\n" + str)

	var opArray = new Array()
	var start = 0
	var theEnd = 0
    
	while (start < str.length)
	{
		//start = str.indexOf("<option", start)
		start = lowerStr.indexOf("<option", start)

		if (start == -1) break

		start = str.indexOf(">", start + 1)

		//end = str.indexOf("</option", start)
		end = lowerStr.indexOf("</option", start)

		var thisOption = str.substring(start + 1, end)

		opArray.push(GridControlMyDelimToArray(thisOption))

		start = end + 9
	}

	return opArray
}


function GridControlMyDelimToArray(strIn)
{

	var delim = ":MM_SEPARATOR:"
	var inString = String(strIn)
	var delimLen = delim.length
	var strLen = inString.length
	var outArray = new Array()

	var start = 0

	while (start <= strLen)
	{
		var found = inString.indexOf(delim, start)
		if (found != -1)
		{
			theStr = inString.substring(start, found)
			theStr = GridControlUnEscHTMLChars(theStr)
			outArray.push(theStr)
			start = found + delimLen
		}
		else
		{
			theStr = inString.substring(start, strLen)
			theStr = GridControlUnEscHTMLChars(theStr)
			outArray.push(theStr)
			start = strLen + 1
		}
	}

	return outArray
}


function GridControlTrim(theString)
{
	var i,firstNonWhite

	if (StripChars(" \n\r\t",theString).length == 0 ) return ""

	i = -1
	while (1)
	{
		i++
		if (theString.charAt(i) != " ")
			break	
	}
	firstNonWhite = i
	//Count the spaces at the end
	i = theString.length
	while (1)
	{
		i--
		if (theString.charAt(i) != " ")
			break	
	}	

	return theString.substring(firstNonWhite,i + 1)

}


function GridControlStripQuotes(inString)
{
	var strIn = GridControlTrim(inString)

	strIn = strIn.replace(/&amp;/g, "&")
	strIn = strIn.replace(/&lt;/g, "<")
	strIn = strIn.replace(/&gt;/g, ">")

	if (strIn.charAt(0) == '"' && strIn.charAt(strIn.length - 1) == '"')
	{

		return GridControlUEQ(strIn.substring(1, strIn.length - 1))
	}

	return (strIn)
}

function GridControlUEQ(strIn)
{
	return GridControlsubAwithBinC("\\\"", "\"", strIn)
}

function GridControlsubAwithBinC(a, b, c)
{
	var i = 0, myC = c
	while((i = myC.indexOf(a, i)) != -1)
	{
		myC = myC.substring(0, i) +  b + myC.substring(i + a.length, myC.length)
		i += b.length
	}
	return myC
}


function GridControlCSVToArray(strIn)
{
	/*
	This function is used to get values from the params
	list box.  The params list box is like a list box, 
	but the values are separated by a comma so that 
	it may look like this:
	list.options[0].value = "paramName,designTimeVal,runTimeVal"

	Parameters:
	strIn - the string with comma delimited values
	*/

	var delim = ","
	var outArray = new Array()
	
	/*
	A flag to tell us if we are inside a string.
	Possible values:
	"" - not inside a string
	"'" - inside a single quote string
	'"' - inside a double quote string
	*/
	var inString = "" 

	var theChar
	var i

	/*
	We ignore delimiters that are inside of strings.
	Strings can be delimited by either single or 
	double quotes.
	*/
	
	var start = 0

	for (i = 0; i < strIn.length; i++)
	{
	
		theChar = strIn.charAt(i)

		if (theChar == delim)	
		{
			if (inString == "")
			{
				outArray.push(GridControlStripQuotes(strIn.substring(start, i)))
				start = i + 1
			}
		}
		else if (theChar == "'")
		{
			if (inString == "'")
			{
				inString = ""
			}
			else if (inString == "")
			{
				inString = "'"
			}
		}
		else if (theChar == '"')
		{
			if (inString == '"')
			{
				inString = ""
			}
			else if (inString == "")
			{
				inString = '"'
			}
		}
	}

	outArray.push(GridControlStripQuotes(strIn.substring(start, strIn.length)))

	return outArray
}

//Append a new, blank item to the end of the list.
//If there is no selection, it replaces the first item.

function GridControlAppend(newItemStr, newValueStr){
  var i, retVal = false;
  with (this) 
  {
    if (!newItemStr)
	{
		newItemStr = "";
		var colArray = GridControlCSVToArray(object.columns)
		for (var i = 0; i < colArray.length; i++)
		{
			if (i > 0)
			{
				newItemStr += ":MM_SEPARATOR:"
			}
		}
	}
 
    object.innerHTML += "<option>" + newItemStr + "</option>"
    
	object.selectedIndex = object.options.length - 1;

    retVal = true;

  }

  return retVal;
}


//Deletes the currently selected item, and selects the one that followed it.

function GridControlDel() {
  	
	var index = this.object.selectedIndex
	//alert("selected index = " + index)
	var theString = this.object.innerHTML

	if (index < 0)
	{
		return false
	}

	var optionStart = -1
	var optionEnd = -1
	for (var i = 0; i < index + 1; i++)
	{
		optionStart = theString.indexOf("<option", optionStart + 1)
		optionEnd = theString.indexOf("</option>", optionEnd + 1)
		//alert("start = " + optionStart + "\nend = " + optionEnd)
	} 
	optionEnd += 9
	
	var newInnerHTML = theString.substring(0, optionStart) + theString.substring(optionEnd, theString.length)
	strOut = "innerhtml :\n" + theString + "\n\nstart = " + optionStart + "\nend = " + optionEnd
	strOut += "\n\nnewinnerhtml = \n" + newInnerHTML
	
	//alert(strOut)
	this.object.innerHTML = newInnerHTML

	if (index > this.object.options.length - 1)
	{
		this.object.selectedIndex = this.object.options.length - 1
	}
	else
	{
		this.object.selectedIndex = index
	}

	return true

}


//Gets the grid's selection

function GridControlGetIndex() {
  this.index = this.object.selectedIndex; //get prior selection
  return this.index;
}


function GridControlEscHTMLChars(theStr) 
{
  theStr = theStr.replace(/&/g,"&amp;"); // always do this one first
  theStr = theStr.replace(/</g,"&lt;");
  theStr = theStr.replace(/>/g,"&gt;");
  theStr = theStr.replace(/"/g,"&quot;");
  theStr = theStr.replace(/ /g,"MM_SPACECHAR");

  return theStr;
}


function GridControlUnEscHTMLChars(theStr) 
{
  
  theStr = theStr.replace(/&lt;/g,"<");
  theStr = theStr.replace(/&gt;/g,">");
  theStr = theStr.replace(/&quot;/g,"\"");
  theStr = theStr.replace(/MM_SPACECHAR/g," ");
  theStr = theStr.replace(/&amp;/g,"&");  // always do this one last

  return theStr;
}
