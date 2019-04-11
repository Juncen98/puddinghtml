// Copyright 2005 Macromedia, Inc. All rights reserved.

var formattingFuncs = new Array();
//list of xslt 1.0 funcs which DW Supports
formattingFuncs[0] = "format-number";
formattingFuncs[1] = "lower-case";
formattingFuncs[2] = "upper-case";
formattingFuncs[3] = "string-length";
formattingFuncs[4] = "string";
formattingFuncs[5] = "ceiling";
formattingFuncs[6] = "floor";
formattingFuncs[7] = "number";
formattingFuncs[8] = "round";
formattingFuncs[9] = "sum";

var outlineId = 5000;

function translateValueOf(node)
{
    var MAX_EXPR_LENGTH = 50;
		var XPATH_STR = "xpath";
		var translatedCode = "";
		var translateStr = '<MM_DYNAMIC_CONTENT SOURCE="@@expression@@" DYNAMICDATA=1><MM:DECORATION HILITECOLOR="Dyn Untranslated Color">{@@expression@@}</MM:DECORATION></MM_DYNAMIC_CONTENT>';
		var xpathExpr = null;
		var dynamicTextPreference = dw.getDynamicTextFormat();
		var funcRegExp = /[A-Za-z0-9\-_]+/ig
		
	  translatedCode = translateStr;
		if (dynamicTextPreference == "{}")
		{
		  xpathExpr = "";
		}
		else
		{
		  var bCanHandleXPATHExpr = true;

			xpathExpr = node.getAttribute("select");

			if (xpathExpr != null)
			{

				 //remove the filter(s) if present
				 var findIndex = 0;
				 filterBeginIndex = xpathExpr.indexOf("[",findIndex);
				 if (filterBeginIndex != -1)
				 {
						while (filterBeginIndex != -1)
						{
							var filterEndIndex = xpathExpr.indexOf("]",findIndex);
							if (filterEndIndex != -1)
							{
								var preFilterString =  xpathExpr.substring(0,filterBeginIndex);
								var postFilterString = xpathExpr.substr(filterEndIndex+1);
								xpathExpr = preFilterString + postFilterString;
								//reset the findIndex to beginning of the string
								findIndex = 0;						
							}
							else
							{
									findIndex = filterBeginIndex+1;
							}
							//look for other filters
							filterBeginIndex = xpathExpr.indexOf("[",findIndex);
						}
				 }

				 //remove a function if present , generally the first argument is xpath node
				 var funcBeginIndex = xpathExpr.indexOf("(");
				 var funcEndIndex   = xpathExpr.lastIndexOf(")");
				 var bHasFormattingFunc = false;

				 if ((funcBeginIndex != -1) && (funcEndIndex != -1))
				 {		
						bHasFormattingFunc = true;

						//check the piece before "(" is function if it an expression select='price - (price * discount)'
						var preFunctionStr = xpathExpr.substring(0,funcBeginIndex);	
						var postFunctionStr= xpathExpr.substring(funcBeginIndex+1,funcEndIndex);

						//trim the end
						preFunctionStr = dwscripts.trim(preFunctionStr);
						postFunctionStr = dwscripts.trim(postFunctionStr);
						//match the function characters
						if (preFunctionStr.match(funcRegExp) != null)
						{

						  //check if the last character is an number or alpha,if an operator then it is an expression
							if ((preFunctionStr.charAt(preFunctionStr.length-1) == "-") || ((preFunctionStr.charAt(preFunctionStr.length-1) == "_")))
							{
							    bHasFormattingFunc = false;
									bCanHandleXPATHExpr = false;
							}

							//check if it one of the formatting funcs which DW supports
							if (bHasFormattingFunc)
							{
							  var bSupports = false;
								for (var i=0; i < formattingFuncs.length; i++)
								{
									 if (formattingFuncs[i] == preFunctionStr)
									 {
									   bSupports = true;
										 break;
									 }
								}
								if (!bSupports)
								{
									bHasFormattingFunc = false;
								}
							}
							
							if (!bHasFormattingFunc)
							{
							   //for functions which we don't support check if there are simple (zero args, or single arg) 
								 //display the function zero arg  (e.g. count(), or count(foo))
								if (bCanHandleXPATHExpr)
								{
									if ((postFunctionStr.length==0) || (postFunctionStr.indexOf(",") == -1))
									{
											bCanHandleXPATHExpr = true;									
									}
									else
									{
											bCanHandleXPATHExpr = false;									
									}
								}
							}
							else
							{
							  //there are no arguments display the function
								if (postFunctionStr.length==0)
								{ 
										bHasFormattingFunc = false;
								}
							}
						}																	
				 }


				 //remove the formating functions
				 if (bHasFormattingFunc)
				 {
					 //extract the xpath parameter which is first param into the function
					 xpathExpr = xpathExpr.substring(funcBeginIndex+1,funcEndIndex);
					 var firstCommaIndex = xpathExpr.indexOf(",");
					 if (firstCommaIndex != -1)
					 {
							xpathExpr = xpathExpr.substring(0,firstCommaIndex);
					 }	
					 
           //we don't handle nested functions , we would display 
				   funcBeginIndex = xpathExpr.indexOf("(");
				 }


				 //if the length is greater than 50 characters display the last part of the path only
				 if (bCanHandleXPATHExpr)
				 {
					 var xPathExprLength = xpathExpr.length;
					 if (xPathExprLength > MAX_EXPR_LENGTH)
					 {
							var pathLastIndexOf = xpathExpr.lastIndexOf("/");
							if (pathLastIndexOf != -1)
							{
								 xpathExpr = xpathExpr.substr(pathLastIndexOf+1);
							}
					 }
					}
			}

			if (bCanHandleXPATHExpr == false)
			{
			  //default to xpath
				xpathExpr = XPATH_STR;
			}
		}
	

		//replace the expression
		var xPathRegExp = /@@expression@@/g;
		translatedCode = translatedCode.replace(xPathRegExp,xpathExpr);						
		return translatedCode;
}

function translateXSLText(node)
{
	var XSLTEXT_STR = "xsl:text";
	var translatedCode = XSLTEXT_STR;
	if (node != null)
	{
	  dw.useTranslatedSource(true);
		//get the inner contents for xsl:text
		nodeContents = node.innerHTML;
		var xslTextBeginNode = "<xsl:text mmTranslatedValueOutlineId=\"OUTLINEID=" + outlineId + "\" mmTranslatedValueOutline=\"OUTLINE=xsl:text\"" + ">";
		var xslEndNode = "</xsl:text>";
		translatedCode = xslTextBeginNode;
		translatedCode+="<span>";
		translatedCode+=nodeContents;
		translatedCode+="</span>";
		translatedCode+=xslEndNode;
		outlineId++;
	  dw.useTranslatedSource(false);

	}
	return translatedCode;
}