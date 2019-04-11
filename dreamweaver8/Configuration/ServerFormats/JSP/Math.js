// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
var DEBUG = false;

function getMathAbsFormatFunc()
{
strRet  ="<%!\n" + 
"public String DoMathAbs(Object aObject,int aType){	\n" + 
"if ((aObject != null) && (aType == 1)){		\n" + 
"		  return String.valueOf(Math.abs(Double.parseDouble(aObject.toString())));	\n" + 
"		}	\n" + 
"		else if(aType == 2){	\n" + 
"		   return String.valueOf(Math.abs(Float.parseFloat(aObject.toString())));	\n" + 
"		}	\n" + 
"		else if(aType == 3){	\n" + 
"		   return String.valueOf(Math.abs(Integer.parseInt(aObject.toString())));	\n" + 
"		}	\n" + 
"		else if(aType == 4){	\n" + 
"		   return String.valueOf(Math.abs(Long.parseLong(aObject.toString())));	\n" + 
"		}	\n" + 
"		return \"\";	\n" + 
"	}	\n" +
"%>\n";
return strRet;
}

function getMathRoundFormatFunc()
{
strRet  ="<%!\n" + 
"public String DoMathRound(Object aObject,Integer aType){	\n" + 
"if ((aObject != null) && (aType == 1)){		\n" + 
"		  return String.valueOf(Math.round(Double.parseDouble(aObject.toString())));	\n" + 
"		}	\n" + 
"		else if(aType == 2){	\n" + 
"		   return String.valueOf(Math.round(Float.parseFloat(aObject.toString())));	\n" + 
"		}	\n" + 
"		return \"\";	\n" + 
"	}	\n" +
"%>\n";
return strRet;
}


function formatDynamicDataRef(str, format)
{
	var ret = str;
	var iStart = getIndexOfEqualsForResponseWrite(str);

	if (iStart > -1)
	{
		var iEnd = str.indexOf("%>", iStart+1);
		if (iEnd > -1)
		{

			//  The inputs are:
			//	type
			//		Double
			//		Float
			//		Long
			//		Integer
			//	Function
			//		Abs
			//		Round


			if (format.func == "abs")
			{
				func = "DoMathAbs";
			}
			else if (format.func == "round")
			{
				func = "DoMathRound";
			}

			//  We found the equals sign corresponding to a
			//  Response.Write (e.g., "<% =").
			//  This is where we insert our function call to format the
			//  currency.
			ret = str.substring(0, iStart+1) + " " + func + "(" + str.substring(iStart+1, iEnd)
			ret = ret + "," + format.formattype;
			ret = ret + ") " + str.substr(iEnd);
		}
		else
		{
			//  Error:  no termination of the JSP block.
			//  alert("no end to JSP");
		}
	}
	else
	{
		//  Error:  no start of JSP block.
		//  alert("no equals");
	}

	return ret;
}

function applyFormat(format)
{
	//alert(format.func);
	if (format.func == "abs") 
	{
		var formatFunc = "DoMathAbs"
	}
	else if (format.func == "round") 
	{
		var formatFunc = "DoMathRound"
	}

	if (getServerFunctionVersion(formatFunc) == -1)
	{
		var currSel = dw.getSelection();
		var htmlNode = dw.getDocumentDOM().documentElement;
		var oldHtmlOffsets = dw.nodeToOffsets(htmlNode);

		var wholeFunc;
		if (format.func == "abs") {
		 wholeFunc = getMathAbsFormatFunc();
		}
		else if (format.func == "round") {
		 wholeFunc = getMathRoundFormatFunc();
		}
		insertBeforeHTMLTag(wholeFunc);

		htmlNode = dreamweaver.getDocumentDOM().documentElement;
		var newHtmlOffsets = dw.nodeToOffsets(htmlNode);
		var delta = newHtmlOffsets[1] - oldHtmlOffsets[1];
		dw.setSelection(currSel[0]+delta, currSel[1]+delta);
	}
}

function deleteFormat(format)
{

	if (format.func == "abs") 
	{
		var formatFunc = "DoMathAbs"
	}
	else if (format.func == "round") 
	{
		var formatFunc = "DoMathRound"
	}
	if ((numFormatFunctionInvokations(formatFunc, 1) < 1) && (getServerFunctionVersion(formatFunc) != -1))
	{
		var currSel = dw.getSelection();
		var htmlNode = dw.getDocumentDOM().documentElement;
		var oldHtmlOffsets = dw.nodeToOffsets(htmlNode);

		//alert(format.func);
		if (format.func == "abs") {
			deleteWholeScriptContainingFunction("DoMathAbs")
		}
		else if (format.func == "round") {
			deleteWholeScriptContainingFunction("DoMathRound");
		}

		htmlNode = dreamweaver.getDocumentDOM().documentElement;
		var newHtmlOffsets = dw.nodeToOffsets(htmlNode);
		var delta = newHtmlOffsets[1] - oldHtmlOffsets[1];
		dw.setSelection(currSel[0]+delta, currSel[1]+delta);
	}
}

