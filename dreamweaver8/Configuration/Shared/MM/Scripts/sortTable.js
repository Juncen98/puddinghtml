// Copyright 2003 Macromedia, Inc. All rights reserved. 

// Global variables
var table;				// Table object
var tableId; 				// Contains table object id
var rowArray = new Array();		// Data row array
var sortIndex;				// Selected index for sort
var descending = false;			// Descending order
var nRow, actualNRow, maxNCol;		// Various table stats
var isIE;				// True if IE
var recDelimiter = '|';			// Char used as a record separator
var imgObject;
var spacerImage = "space.gif";
var upImage = "up.gif";
var downImage = "down.gif";
//*****************************************************************************
// Main function. This is to be associated with onLoad event in <BODY>. 
//
//*****************************************************************************
function initTable(obj)
{
 
  // Local variables
  var countCol;
  var currentCell;
  var colPos;

  // Initializing global table object variable
  if (obj.tagName == "TABLE")
  {
    // Assumes that the obj is THE OBJECT
	table = obj;
  }
  else
  {    
     // Assumes that the obj is the id of the object
	table = document.getElementById(obj);
  }

  // Check whether it's an object
  if (table == null) return;

  // Check whether it's a table
  if (table.tagName != "TABLE") return;

  // No need to re-init if it's already done
  if (tableId == table.id) return;

  // Setting table id
  tableId = table.id;	

  // Initializing the max col number with the size of last data row
  maxNCol = table.rows[table.rows.length-1].cells.length;

  // Initializing arrays
  rowArray = new Array();
	
  // Setting the number of rows
  nRow = table.rows.length;

  // Should have at least 1 row
  if (nRow < 1) return;

  // Initialization of local variables
  actualNRow = 0;			// Number of actual data rows
		
  // Loop through rows
  for (var i=1; i<nRow; i++)
  {
    colPos = 0;
    // Loop through columns
    // Initializing
			
    // Setting up the title cells
    // Setting up the data rows
    for (var j=0; j<table.rows[i].cells.length; j++)
    {
      currentCell = table.rows[i].cells[j];
      if (j == 0)
      {
        rowArray[actualNRow] = String(currentCell.innerHTML);
      }
      else
      {
        rowArray[actualNRow] += recDelimiter + String(currentCell.innerHTML);
      }
     }
     // Inconsistent col lengh for data rows
     if (table.rows[i].cells.length > maxNCol)
       return;
       actualNRow++;
  }

  // If the row number is < 1, no need to do anything ...
  if (actualNRow < 1) return;
  
}

//*****************************************************************************
// Function called everytime when user clicks on a title to sort
//*****************************************************************************
function initImages()
{
  imgObject.sortOrder[0].src = spacerImage;
  imgObject.sortOrder[1].src = spacerImage;
  imgObject.sortOrder[2].src = spacerImage;
  
}

//*****************************************************************************
// Function called when user clicks on a title to sort
//*****************************************************************************
function sortTable(index,obj)
{

  // Check whether it's viewed by allowed browswers
  if (! checkBrowser()) return;

  // Re-inializing the table object
  initTable(obj);

  // Local variables
  var rowContent;
  var rowCount;
  
  // Can't sort past the max allowed column size
  if (index < 0 || index >= maxNCol) return;
  
  // Assignment of sort index
  sortIndex = index;

  // Doing the sort using JavaScript generic function for an Array
  rowArray.sort(compare);

  
  // Re-drawing the table
  rowCount = 0;
  for (var i=1; i<nRow; i++)
  {
    for (var j=0; j<maxNCol; j++)
    {
      rowContent = rowArray[rowCount].split(recDelimiter);
      table.rows[i].cells[j].innerHTML = rowContent[j];
    }
    rowCount++;
  }
  
 initImages();
  
   // Switching btw descending/ascending sort
  if (descending)
  {
    switch (index)
	{
	  case "0" :
	    imgObject.sortOrder[0].src = downImage;
	    break;
	  case "1" :
	    imgObject.sortOrder[1].src = downImage;
		break;
	  case "2" :
	    imgObject.sortOrder[2].src = downImage;
		break;
	  default : break;
	}
   	descending = false;
  }
  else
  {
    switch (index)
	{
	  case "0" :
	    imgObject.sortOrder[0].src = upImage;
		break;
	  case "1" :
	    imgObject.sortOrder[1].src = upImage;
	    break;
	  case "2" :
	    imgObject.sortOrder[2].src = upImage;
	    break;
	  default : break;
	}
    descending = true;
  }
}

//*****************************************************************************
// Function to be used for Array sorting
//*****************************************************************************
function compare(a, b)
{
  // Getting the element array for inputs (a,b)
  var aRowContent = a.split(recDelimiter);
  var bRowContent = b.split(recDelimiter);
  
  // Needed in case the data conversion is necessary
  var aToBeCompared, bToBeCompared;

  if (sortIndex == 1)
  {
    // Compare as dates
    aToBeCompared = new Date(aRowContent[sortIndex]);
    bToBeCompared = new Date(bRowContent[sortIndex]);
  }
  else 
  {
    // Compare as String
    aToBeCompared = aRowContent[sortIndex].toLowerCase();
    bToBeCompared = bRowContent[sortIndex].toLowerCase();
  }
  if (aToBeCompared < bToBeCompared)
    if (!descending)
    {
      return -1;
    }
    else
    {
      return 1;
    }
    if (aToBeCompared > bToBeCompared)
      if (!descending)
      {
        return 1;
      }
      else
      {
        return -1;
      }
      return 0;
}


//*****************************************************************************
// Function to set the cursor
//*****************************************************************************
function setCursor(obj)
{
  var currentObj;
  // Show hint text at the browser status bar
  // Go to the innermost cell's property
  currentObj = obj;
  while (currentObj.childNodes.length > 0)
  {
    currentObj = currentObj.firstChild;
  }
  window.status = "Sort by " + currentObj.nodeValue;

  // Change the mouse cursor to pointer or hand 
  if (isIE)
    obj.style.cursor = "hand";
  else
    obj.style.cursor = "pointer";
}


//*****************************************************************************
// Function to check browser type/version
//*****************************************************************************
function checkBrowser()
{
  var retVal = false;
  var BROWSER_IE = "Microsoft Internet Explorer ";
  var BROWSER_NETSCAPE = "Netscape ";
  var BROWSER_OPERA = "Opera ";
  var BROWSER_MOZILLA = "Mozilla ";
 
  var OS_WIN = "Windows";
  var OS_MAC = "Macintosh";
  
  var useragentString = navigator.userAgent;

  var browserType;
  var browserVer;
  var platform;
  var browserTypeStartIndex ;
  var browserTypeEndIndex ;
    //Parse user agent string for browser type
  // For Opera Browser
  if (useragentString.indexOf("Opera") != -1)
  {
    browserType = BROWSER_OPERA;
	if(useragentString.indexOf("7.") != -1)
	  browserVer = "7.0";
  }

  // for Internet explorer
  else if (useragentString.indexOf("MSIE") != -1)
  {
    browserType = BROWSER_IE;
	browserTypeStartIndex = useragentString.indexOf("MSIE");
	browserTypeEndIndex = useragentString.indexOf(";", browserTypeStartIndex);
	browserVer = useragentString.substr(browserTypeStartIndex + 5, browserTypeEndIndex - browserTypeStartIndex -5);
  }

  // for Mozilla
  else if ((useragentString.indexOf("Gecko") != -1) 
           && (useragentString.indexOf("Mozilla\/5.0") != -1)
		   && (useragentString.indexOf("Netscape") == -1))
  {
     browserType  = BROWSER_MOZILLA;
	 //find Mozilla version
	 browserTypeStartIndex = useragentString.indexOf("rv:");
	 browserTypeEndIndex = useragentString.indexOf(")", browserTypeStartIndex);
	 browserVer = useragentString.substr(browserTypeStartIndex + 3, browserTypeEndIndex - browserTypeStartIndex -3);
  } 
  // for Netescape 4.9
  else if (useragentString.indexOf("Mozilla\/4.79") != -1)
  {
	 browserType = BROWSER_NETSCAPE;
	 browserVer = "4.79";
  } 
  // For Netescape 4.75
  else if (useragentString.indexOf("Mozilla\/4.75") != -1)
  {
	 browserType = BROWSER_NETSCAPE;
	 browserVer = "4.75";
  } 
  // For Netescape 4.7
  else if (useragentString.indexOf("Mozilla\/4.7") != -1)
  {
	  browserType = BROWSER_NETSCAPE;
	  browserVer ="4.7";
  }
  // For Netescape 6 and above
  else if (useragentString.indexOf("Netscape") != -1)
  {
	 browserType = BROWSER_NETSCAPE;
	 browserTypeStartIndex = useragentString.indexOf("Netscape\/");
	 if (browserTypeStartIndex != -1)
	 {
	   browserVer = useragentString.substr(browserTypeStartIndex + 9);
	 }
	 else
	   browserVer = "6.0";
  }  
  else
  {
     browserType = "";
  }
  
  // Parse for operating systems
  if (useragentString.indexOf("Windows") != -1)
  {
        platform = OS_WIN;
  }
  else if(useragentString.indexOf("Mac") != -1)
  {
      platform = OS_MAC;
  } 
  else 
  {
    platform = "";
  }
  
   isIE = true;
   imgObject = document.all;
 
  if(browserType == BROWSER_IE)
  {
    if(platform == OS_WIN && parseInt(browserVer) >= 5) 
	  retVal = true;
  }
  else if(browserType == BROWSER_NETSCAPE)
  {
    isIE = false;
	imgObject = document.sortFile;
	if(parseInt(browserVer) >= 5)
	  retVal = true;
  }
  else if(browserType == BROWSER_MOZILLA && parseInt(browserVer) > 0)
  {
    imgObject = document.sortFile;
    retVal = true;
  }
  else if(browserType == BROWSER_OPERA)
  {
    if(platform == OS_WIN && parseInt(browserVer) >= 7)
      retVal = true;
  }
  
  return retVal;
}