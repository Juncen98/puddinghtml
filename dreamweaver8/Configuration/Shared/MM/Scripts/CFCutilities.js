// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.

var introspectionCFC = "/CFIDE/componentutils/cfcexplorer.cfc";

function MMToBase64(theInput)
{
	var base64codes = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	var theOutput = new String();
	var j;
	for (j=0; j<(theInput.length - (theInput.length % 3)); j=j+3)
	{
		theOutput = theOutput + base64codes.charAt(Math.floor(theInput.charCodeAt(j) / 4));
		theOutput = theOutput + base64codes.charAt(((theInput.charCodeAt(j) % 4) * 16) + Math.floor(theInput.charCodeAt(j+1) / 16));
		theOutput = theOutput + base64codes.charAt(((theInput.charCodeAt(j+1) % 16) * 4) + Math.floor(theInput.charCodeAt(j+2) / 64));
		theOutput = theOutput + base64codes.charAt(theInput.charCodeAt(j+2) % 64);
	}

	if ((theInput.length % 3) != 0)
	{
		if ((theInput.length % 3) == 2)
		{
			theOutput = theOutput + base64codes.charAt(Math.floor(theInput.charCodeAt(j) / 4));
			theOutput = theOutput + base64codes.charAt(((theInput.charCodeAt(j) % 4) * 16) + Math.floor(theInput.charCodeAt(j+1) / 16));
			theOutput = theOutput + base64codes.charAt((theInput.charCodeAt(j+1) % 16) * 4);
			theOutput = theOutput + "=";
		}
		else if ((theInput.length % 3) == 1)
		{
			theOutput = theOutput + base64codes.charAt(Math.floor(theInput.charCodeAt(j) / 4));
			theOutput = theOutput + base64codes.charAt((theInput.charCodeAt(j) % 4) * 16);
			theOutput = theOutput + "==";
		}
	}

	return theOutput;
}

function convertForwardToBackSlashes(str)
{
	var strTemp = new String(str);
	return strTemp.replace(/\//gi, "\\");
}

function isQuote( c )
{
   return( c == '\"' || c == '\'' );
}

// Note that '>' should be ignored within quotes inside tag brackets
function isTagEnd( c )
{
   return( c == '>' );
}

function isWhite( c )
{
   return( c == ' ' || c == '\t' || c == '\n' || c == '\r' );
}

// parseAttributes()
//
// Parse the attributes from within the start tag of a given
// node per the rules found here: http://www.w3.org/TR/WD-html-lex/
//
// Return an array of arrays (unfortunately; the associative
// aspect of arrays is overloaded with "instance properties",
// so arrays already contain prototype methods/properties
// value pairs):
//
//          arr[0] --> attributes array
//          arr[1] --> values array
//
// The value for a given attribute are in the same position
// at the attribute within the values array.  Singleton name
// tokens have an empty ("") or undefined value.
//
// If bStripQuotes is true, then any "outer" quotes around an
// attribute value are stripped, e.g., the value in
//
//    NAME="bob's name"
//
// is returned as: bob's name.  If bStripQuotes is false, that
// value is returned as "bob's name"
//
// If bMakeUpper is true, all attribute/value strings are normalized
// to upper case
//
function parseAttributes( node, bStripQuotes, bMakeUpper )
{
   var   tagstr         = node.outerHTML;
   var   pos            = 0;
   var   prevChar       = null;
   var   currentChar    = null;
   var   currentQuote   = null;
   var   arrAttribs     = new Array();
   var   arrValues      = new Array();
   var   arrIdx         = 0;
   var   attrib         = "";
   var   value          = "";
   var   bValueIsEmpty  = false;
   var   bInsideQuote   = false;
   var   bAccumValue    = false;
   var   bAttribReady   = false;
   var   bSkipToWhite   = true;  // initially true to skip "<tag "

   while( pos < node.outerHTML.length )
   {
      prevChar     = currentChar;
      currentChar  = tagstr.charAt( pos++ );

      // Handle quote state; remember actual quote that
      // flipped the state so we match ' and " right
      //
      if ( isQuote( currentChar ) )
      {
         if ( bInsideQuote )
         {
            if ( currentChar == currentQuote )
            {
               // Coming out of quoted region; turn quotes off
               bInsideQuote = false;
               currentQuote = null;
               if ( bStripQuotes )
               {
                  // Careful; make sure ATTR="" works even when we're
                  // stripping quotes off values
                  MM_assert( bAccumValue, MM.MSG_CFC_ParseErrEndQuote );
                  bValueIsEmpty = true;
                  continue;
               }
            }
         }
         else
         if ( bAccumValue && value == "" ) // only turn quotes on after '=' and
         {                                 // before accumulating anything; e.g.,
            // Turn quotes on              // ignore the quote in ATTR=xxx"xxx
            bInsideQuote = true;
            currentQuote = currentChar;
            if ( bStripQuotes )
               continue;
         }
      }

      // Handle the terminating character; write any attribute/value
      // we may have been accumulating and we're done.
      //
      if ( !bInsideQuote &&
	       (isTagEnd( currentChar ) || ((pos < node.outerHTML.length) && (isTagEnd(tagstr.charAt( pos )))))
		 )
      {
         if ( attrib != "" )
         {
            arrAttribs[ arrIdx ]  = bMakeUpper ? attrib.toUpperCase() : attrib;
            arrValues[ arrIdx++ ] = bMakeUpper ? value.toUpperCase() : value;
            attrib = "";
            value  = "";
            bAttribReady = false;
            bAccumValue  = false;
         }
         break;
      }

      // Accumulate characters; if bAccumValue is true, we're on the
      // right side of an "=", otherwise we're on the left side or accumulating
      // a singleton name token.  I don't think quoted regions make sense
      // on the left side either.
      //
      if ( !bInsideQuote && !bAccumValue )
      {
         // first skip to white after tag name <xxxx
         if ( bSkipToWhite && !isWhite( currentChar ) )
            continue;

         bSkipToWhite = false;

         // Whitespace not inside quotes; if we're accumulating
         // an attribute, it's ready (the whitespace terminates it);
         if ( isWhite( currentChar ) )
         {
            bAttribReady = attrib != "";
         }
         else
         {
            // Non-white space; if we have an equals sign, switch
            // over to accumulate the value
            if ( currentChar == '=' )
            {
               bAttribReady = attrib != "";
               bAccumValue  = true;
               MM_assert( bAttribReady, MM.MSG_CFC_ParseErrUnexpectedEQU );
            }
            else
            {
               // Unquoted non-white non-value -- accumulate
               // as name token.  If there's a name token ready,
               // save it as a singleton first.
               //
               if ( bAttribReady )
               {
                  arrAttribs[ arrIdx++ ] = bMakeUpper ? attrib.toUpperCase() : attrib;
                  attrib = "";
                  bAttribReady = false;
               }

               attrib += currentChar;
            }
         }
      }
      else
      {
         // We're accumulating a value
         //
         MM_assert( bAttribReady, MM.MSG_CFC_ParseErrUnexpectedEQU );

         if ( !bInsideQuote && isWhite( currentChar ) )
         {
            // Swallow whitespace until we either get a value
            // or we terminate

            if ( value != "" || bValueIsEmpty )
            {
               arrAttribs[ arrIdx ]  = bMakeUpper ? attrib.toUpperCase() : attrib;
               arrValues[ arrIdx++ ] = bMakeUpper ? value.toUpperCase() : value;
               attrib = "";
               value  = "";
               bAttribReady  = false;
               bAccumValue   = false;
               bValueIsEmpty = false;
            }
         }
         else
         {
            // We're inside a quote, or we're not terminated -- keep
            // accumulating
            //
            value += currentChar;
         }
      }
   }

   // We're done; package up our arrays and return them
   //
   MM_assert( !bAccumValue, MM.MSG_CFC_ParseErrValue );
   return new Array( arrAttribs, arrValues );
}

function caseInsensitiveCompare(obj1, obj2)
{
  return (String(obj1).toUpperCase() == String(obj2).toUpperCase());
}


function makeConsistentBooleanValue(strValue)
{

	//  It's a drag to see inconsistency between yes/true and no/false so we are going to
	//  arbitrarily choose true/false as the value set that we'll use.

	var strReturn = new String(strValue);

	if (caseInsensitiveCompare(strReturn, "yes"))
	{
		strReturn = "true";
	}
	else if (caseInsensitiveCompare(strReturn, "no"))
	{
		strReturn = "false";
	}
	else if (caseInsensitiveCompare(strReturn, "true") || caseInsensitiveCompare(strReturn, "false"))
	{
		strReturn = strReturn.toLowerCase();
	}

	return strReturn;
}


//  The input array, methodsToIgnore, allows some methods to be ignored.  Typically,
//  this is done so we can filter out built-in methods (e.g., getDescriptor(), 
//  getDescriptor_html(), getDescriptor_mcdl(), getDescriptor_wddx(),
//  getDescriptor_wsdl(), etc.).  These are provided by Neo (not by any CFC that in in
//  the inheritence chain).  Built-in methods are often of little or no interest
//  to users so they end up cluttering the tree with "noise."

function parseCFCinMCDL(mcdlDOM, CFCdetails, methodsToIgnore)
{
	var bRet = false;

	do
	{
		CFCdetails.name = "";
		CFCdetails.physicalPath = "";
		CFCdetails.extendsCFC = "";

		CFCdetails.methods = new Array();
		CFCdetails.properties = new Array();

		//  The DOM always has as its immediate second child the WDDXPACKET node
		//  that starts the information we really want to parse.

		if (mcdlDOM.childNodes.length < 2) break;
		var wddxPacketNode = mcdlDOM.childNodes.item(1);
		var b = ((wddxPacketNode.nodeType == Node.ELEMENT_NODE) && (caseInsensitiveCompare(wddxPacketNode.tagName, "wddxPacket")));
		if (!b) break;

		//  Inside this WDDXPACKET tag we have:
		//
		//	<wddxPacket version='1.0'>
		//		<header/>
		//		<data>
		//			<string>
		//				*** GUTS ***
		//			</string>
		//		</data>
		//	</wddxPacket>
		//
		//	The *** GUTS *** within the STRING tag (above) is:
		//
		//  <component name="" path="" extends="">
		//  	<property name="" access="" type="" required="" default="" implementedin=""> 
		//  	<property ...>
		//      <method name="" returntype="" access="" output="" implementedin="">
		//			<parameter name="" type="" required="" default="" >
		//			<parameter ...>
		//			<exceptions types="">
		//			<exceptions ...>
		//		</method>
		//  	<method ...> </method>
		//  </component>
		//
		//  Note:  some massaging of the GUTS has taken place by the time this function is
		//  called.  Specifically:
		//  1)  The GUTS have been HTML decoded.
		//  2)  The tag <?xml version="1.0" encoding="UTF-8"?> has been removed
		//      because it causes the DW parser to freak out.
		//  3)  All tags of the form <char code='0d'/> have been removed.

		var dataNode = wddxPacketNode.childNodes.item(1);
		if (dataNode.childNodes.length < 1) break;
		b = ((dataNode.nodeType == Node.ELEMENT_NODE) && (caseInsensitiveCompare(dataNode.tagName, "data")));
		if (!b) break;

		var stringNode = dataNode.childNodes.item(0);

		//  Bogus or empty CFCs will have not GUTS inside the STRING tag.  Make sure that
		//  we don't try to parse further in this case.

		if (stringNode.childNodes.length < 1) break;
		b = ((stringNode.nodeType == Node.ELEMENT_NODE) && (caseInsensitiveCompare(stringNode.tagName, "string")));
		if (!b) break;

		var componentNode = stringNode.childNodes.item(0);
		var attribs = parseAttributes(componentNode, true, false);

		if (attribs.length)
		{
			var names = attribs[0];
			var values = attribs[1];

			for (var a=0; a<names.length; a++)
			{
				var aName = names[a];
				var aValue = makeConsistentBooleanValue(values[a]);

				switch (String(aName).toLowerCase())
				{
					case "name":
						CFCdetails.name = aValue;
						break;
					case "path":
						CFCdetails.physicalPath = convertForwardToBackSlashes(aValue);
						break;
					case "extends":
						CFCdetails.extendsCFC = aValue;
						break;
				}
			}
		}

		var methods = new Array();
		var properties = new Array();

		var methodsAndPropertiesNodes = componentNode.childNodes;
		if (methodsAndPropertiesNodes.length)
		{
			for (var i=0; i<methodsAndPropertiesNodes.length; i++)
			{
				var aMethodOrPropertyNode = methodsAndPropertiesNodes.item(i);
				attribs = parseAttributes(aMethodOrPropertyNode, true, false);

				if (caseInsensitiveCompare(aMethodOrPropertyNode.tagName, "property"))
				{
					var aProperty = new Object();

					//  <property name="" access="" type="" required="" default="" implementedin=""> 

					aProperty.name = "";
					aProperty.access = "";
					aProperty.theType = "";
					aProperty.required = "";
					aProperty.defaultValue = "";
					aProperty.implementedIn = "";
					aProperty.inherited = false;

					if (attribs.length)
					{
						var names = attribs[0];
						var values = attribs[1];

						for (var a=0; a<names.length; a++)
						{
							var aName = names[a];
							var aValue = makeConsistentBooleanValue(values[a]);

							switch (String(aName).toLowerCase())
							{
								case "name":
									aProperty.name = aValue;
									break;
								case "access":
									aProperty.access = aValue;
									break;
								case "type":
									aProperty.theType = aValue;
									break;
								case "required":
									aProperty.required = aValue;
									break;
								case "default":
									aProperty.defaultValue = aValue;
									break;
								case "implementedin":
									aProperty.implementedIn = aValue;
									aProperty.inherited = !caseInsensitiveCompare(aProperty.implementedIn, CFCdetails.name);
									break;
							}
						}
					}

					properties.push(aProperty);
				}
				else if (caseInsensitiveCompare(aMethodOrPropertyNode.tagName, "method"))
				{
					var aMethod = new Object();

					//  <method name="" returntype="" access="" output="" implementedin="">

					aMethod.name = "";
					aMethod.access = "";
					aMethod.returnType = "";
					aMethod.outputAllowed = "";
					aMethod.implementedIn = "";
					aMethod.roles = "";
					aMethod.inherited = false;

					if (attribs.length)
					{
						var names = attribs[0];
						var values = attribs[1];

						for (var a=0; a<names.length; a++)
						{
							var aName = names[a];
							var aValue = makeConsistentBooleanValue(values[a]);

							switch (String(aName).toLowerCase())
							{
								case "name":
									aMethod.name = aValue;
									break;
								case "access":
									aMethod.access = aValue;
									break;
								case "returntype":
									aMethod.returnType = (caseInsensitiveCompare(aValue, "none")) ? "" : aValue;
									break;
								case "output":
									aMethod.outputAllowed = aValue;
									break;
								case "implementedin":
									aMethod.implementedIn = aValue;
									aMethod.inherited = !caseInsensitiveCompare(aMethod.implementedIn, CFCdetails.name);
									break;
								case "roles":
									aMethod.roles = aValue;
									break;
							}
						}
					}

					//  Is this a method we are supposed to ignore?
					
					var bIgnoreThisMethod = false;
					if (methodsToIgnore.length)
					{
						for (var mi=0; mi<methodsToIgnore.length; mi++)
						{
							if (caseInsensitiveCompare(aMethod.name, methodsToIgnore[mi]))
							{
								bIgnoreThisMethod = true;
								break;
							}		
						}
					}

					if (!bIgnoreThisMethod)
					{
						var arguments = new Array();

						var argumentOrExceptionNodes = aMethodOrPropertyNode.childNodes;
						
						if (argumentOrExceptionNodes.length)
						{
							for (var x=0; x<argumentOrExceptionNodes.length; x++)
							{
								var aArgumentOrExceptionNode = argumentOrExceptionNodes.item(x);

								if (caseInsensitiveCompare(aArgumentOrExceptionNode.tagName, "parameter"))
								{
									attribs = parseAttributes(aArgumentOrExceptionNode, true, false);

									var aArgument = new Object();

									//  <parameter name="" type="" required="" default="" >

									aArgument.name = "";
									aArgument.theType = "";
									aArgument.required = "";
									aArgument.defaultValue = "";

									if (attribs.length)
									{
										var names = attribs[0];
										var values = attribs[1];

										for (var a=0; a<names.length; a++)
										{
											var aName = names[a];
											var aValue = makeConsistentBooleanValue(values[a]);

											switch (String(aName).toLowerCase())
											{
												case "name":
													aArgument.name = aValue;
													break;
												case "type":
													aArgument.theType = aValue;
													break;
												case "required":
													aArgument.required = aValue;
													break;
												case "default":
													aArgument.defaultValue = aValue;
													break;
											}
										}
									}

									arguments.push(aArgument);
								}
							}
						}

						aMethod.arguments = arguments;

						methods.push(aMethod);
					}
				}
			}
		}

		CFCdetails.methods = methods;
		CFCdetails.properties = properties;

		//  If we get all the way here, then we didn't hit any problem.

		bRet = true;
	}
	while (false);

	return bRet;
}


function parseCFCtree(wddxDOM, roots)
{
	var bRet = false;

	do
	{
		//  The DOM always begins with an HTML node containing a HEAD and a BODY.
		//  Inside the BODY is the WDDXPACKET node that starts the information we
		//  really want to parse.
		if (wddxDOM.childNodes.length < 1) break;
		var htmlNode = wddxDOM.childNodes.item(0);

		if (htmlNode.childNodes.length < 2) break;
		var bodyNode = htmlNode.childNodes.item(1);

		if (bodyNode.childNodes.length < 1) break;
		var wddxPacketNode = bodyNode.childNodes.item(0);

		//  The top level node is the wddxDOM.  It should have exactly 2 child nodes:
		//  1)  An empty HEADER tag.
		//  2)  A DATA tag that contains the rest of the packet of data.

		var children = wddxPacketNode.childNodes;
		var nChildren = children.length;
		var b = (nChildren == 2);
		MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
		if (!b) break;

		var headerNode = children.item(0);
		b = ((headerNode.nodeType == Node.ELEMENT_NODE) && (caseInsensitiveCompare(headerNode.tagName, "header")));
		MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
		if (!b) break;

		var dataNode = children.item(1);
		b = ((dataNode.nodeType == Node.ELEMENT_NODE) && (caseInsensitiveCompare(dataNode.tagName, "data")));
		MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
		if (!b) break;

		//  The DATA node should have just one child node:  a STRUCT that contains the rest of
		//  the packet of data.

		children = dataNode.childNodes;
		nChildren = children.length;
		b = (nChildren == 1);
		MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
		if (!b) break;

		var structNode = children.item(0);
		b = ((structNode.nodeType == Node.ELEMENT_NODE) && (caseInsensitiveCompare(structNode.tagName, "struct")));
		MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
		if (!b) break;

		//  Each child node of the current STRUCT should be a VAR representing a unique
		//  root (disk folder) where CFCs can live.

		var varNode_Roots = structNode.childNodes;
		var nVarNode_Roots = varNode_Roots.length;
		b = (nVarNode_Roots > 0);
		MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
		if (!b) break;

		var iVarNode_Root = 0;
		for (iVarNode_Root=0; iVarNode_Root<nVarNode_Roots; iVarNode_Root++)
		{
			var aVarNode_Root = varNode_Roots.item(iVarNode_Root);
			b = ((aVarNode_Root.nodeType == Node.ELEMENT_NODE) && (caseInsensitiveCompare(aVarNode_Root.tagName, "var")));
			MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
			if (!b) break;

			//  The VAR node for each path should have a NAME attribute.
			//  The value of this attribute is the disk path to this root where CFCs can live.

			var attribs   = parseAttributes(aVarNode_Root, true, false);
			b = ((attribs.length == 2) && (caseInsensitiveCompare(attribs[0], "name")));
			MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
			if (!b) break;

			//  Save this disk path in our array of roots.

			var aRoot = new Object();
			aRoot.physicalPath = convertForwardToBackSlashes(attribs[1]);
			aRoot.packages = new Array();

			//  Now get the packages that are within each root.  We should have a STRUCT
			//  within each root VAR.

			children = aVarNode_Root.childNodes;
			nChildren = children.length;
			b = (nChildren == 1);
			MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
			if (!b) break;

			structNode = children.item(0);
			b = ((structNode.nodeType == Node.ELEMENT_NODE) && (caseInsensitiveCompare(structNode.tagName, "struct")));
			MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
			if (!b) break;

			//  Within the STRUCT we should find a VAR for each package
			//  that has CFCs within this root.

			var varNode_Packages = structNode.childNodes;
			var nVarNode_Packages = varNode_Packages.length;
			b = (nVarNode_Packages >= 0);
			MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
			if (!b) break;

			var iVarNode_singlePackage = 0;
			for (iVarNode_singlePackage=0; iVarNode_singlePackage<nVarNode_Packages; iVarNode_singlePackage++)
			{
				var varNode_singlePackage = varNode_Packages.item(iVarNode_singlePackage);
				b = ((varNode_singlePackage.nodeType == Node.ELEMENT_NODE) && (caseInsensitiveCompare(varNode_singlePackage.tagName, "var")));
				MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
				if (!b) break;

				//  Each VAR representing a package within a root should have a NAME attribute
				//  whose value is equal to the package (e.g., foo.bar).

				attribs   = parseAttributes(varNode_singlePackage, true, false);
				b = ((attribs.length == 2) && (caseInsensitiveCompare(attribs[0], "name")));
				MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
				if (!b) break;

				var aPackage = new Object();
				aPackage.name = attribs[1];
				aPackage.CFCs = new Array();

				//  Within each VAR representing a single package we should find an ARRAY of
				//  STRING tags each of which represents the name of a CFC within this package.

				children = varNode_singlePackage.childNodes;
				nChildren = children.length;
				b = (nChildren == 1);
				MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
				if (!b) break;

				var arrayNode = children.item(0);
				b = ((arrayNode.nodeType == Node.ELEMENT_NODE) && (caseInsensitiveCompare(arrayNode.tagName, "array")));
				MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
				if (!b) break;

				attribs   = parseAttributes(arrayNode, true, false);
				b = ((attribs.length == 2) && (caseInsensitiveCompare(attribs[0], "length")));
				MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
				if (!b) break;

				//  Though the ARRAY node provides a length we can ignore it and just get each
				//  child node in turn.
				
				var stringNode_CFCs = arrayNode.childNodes;
				var nStringNode_CFCs = stringNode_CFCs.length;
				b = (nStringNode_CFCs > 0);
				MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
				if (!b) break;

				var iStringNode_CFC = 0;
				for (iStringNode_CFC=0; iStringNode_CFC<nStringNode_CFCs; iStringNode_CFC++)
				{
					var stringNode = stringNode_CFCs.item(iStringNode_CFC);
					b = ((stringNode.nodeType == Node.ELEMENT_NODE) && (caseInsensitiveCompare(stringNode.tagName, "string")));
					MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
					if (!b) break;

					children = stringNode.childNodes;
					nChildren = children.length;
					b = (nChildren == 1);
					MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
					if (!b) break;

					var textNode = children.item(0);
					b = (textNode.nodeType == Node.TEXT_NODE);
					MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
					if (!b) break;

					var aCFC = new Object();
					aCFC.name = textNode.data;
					aPackage.CFCs.push(aCFC);
				}

				if (iStringNode_CFC < nStringNode_CFCs)
				{
					//  We hit an error!

					break;
				}

				aRoot.packages.push(aPackage);
			}

			if (iVarNode_singlePackage < nVarNode_Packages)
			{
				//  We hit an error!

				break;
			}

			if (nVarNode_Packages > 0)
			{
				roots.push(aRoot);
			}
		}

		if (iVarNode_Root < nVarNode_Roots)
		{
			//  We hit an error!

			break;
		}

		//  If we get all the way here, then we didn't hit any problem.

		bRet = true;
	}
	while (false);

	return bRet;
}

function getCurrentUrlPrefix()
{
	var urlPrefix = new String("");
	var currentDOM = dw.getDocumentDOM();
	if (currentDOM != null)
	{
		urlPrefix = new String(currentDOM.serverModel.getAppURLPrefix());
		if (urlPrefix != "")
		{
			if (urlPrefix.charAt(urlPrefix.length - 1) != "/")
			{
				urlPrefix = urlPrefix + "/";
			}
		}
	}

	return urlPrefix;
}

function getIntrospectionUrl()
{
	var theURL = new String("");
	var urlPrefix = new String(getCurrentUrlPrefix());
	if (urlPrefix != "")
	{
		var nStartCharToSearchForSingleSlash = urlPrefix.indexOf("//");
		if (nStartCharToSearchForSingleSlash == -1)
		{
			nStartCharToSearchForSingleSlash = 0;
		}
		else
		{
			nStartCharToSearchForSingleSlash = nStartCharToSearchForSingleSlash + 2;
		}

		var nLengthWebSiteRootURL = urlPrefix.indexOf("/", nStartCharToSearchForSingleSlash);
		if (nLengthWebSiteRootURL == -1)
		{
			nLengthWebSiteRootURL = urlPrefix.length;
		}

		var webSiteRootURL = urlPrefix.substring(0, nLengthWebSiteRootURL);

		if ((introspectionCFC.charAt[0] == "/") &&
		    (webSiteRootURL.charAt[webSiteRootURL.length - 1] == "/"))
		{
			webSiteRootURL = webSiteRootURL.substring(webSiteRootURL, webSiteRootURL.length - 2);
		}

		theURL = webSiteRootURL + introspectionCFC;
	}

	return theURL;
}

function getcfctreeDOM(bForceRefresh)
{
	var theDOM = dw.getNewDocumentDOM();
	var introspectionURL = getIntrospectionUrl();
	if ((introspectionURL != "") && (theDOM != null))
	{
		MM.setBusyCursor();

		var pwdBase64 = MMToBase64(MMDB.getRDSUserName() + ":" + MMDB.getRDSPassword());
		var strHeader = "Authorization-MX: Basic " + pwdBase64 + "\r\n";

		var theResponseObj = MMHttp.postText(introspectionURL + "?method=getcfctree&refreshCache=" + (bForceRefresh ? "true" : "false"),
										     "", "", strHeader); 

		var theResponse = new String(theResponseObj.data);

		//  Do a very cursory check for whether or not the response is at all appropriate.

		var packetIndex = theResponse.toLowerCase().indexOf("<wddxpacket");
		if (packetIndex >= 0)
		{
			theResponse = theResponse.substring(packetIndex);
			theResponse = dwscripts.entityNameDecode(theResponse);
			theDOM.documentElement.outerHTML = theResponse;
		}
		else
		{
			theDOM = null;
		}

		MM.clearBusyCursor();
	}

	return theDOM;
}

function getcfcinmcdlDOM(packageName, CFCname)
{
	var theDOM = dw.getNewDocumentDOM();
	var introspectionURL = getIntrospectionUrl();
	if ((introspectionURL != "") && (theDOM != null))
	{
		var strFullName = "";
		if (packageName != "")
		{
			strFullName = strFullName + packageName + ".";
		}
		strFullName = strFullName + CFCname;

		MM.setBusyCursor();

		var pwdBase64 = MMToBase64(MMDB.getRDSUserName() + ":" + MMDB.getRDSPassword());
		var strHeader = "Authorization-MX: Basic " + pwdBase64 + "\r\n";

		var theResponseObj = MMHttp.postText(introspectionURL + "?method=getcfcinmcdl&name=" + escape(strFullName),
										     "", "", strHeader); 

		var theResponse = new String(theResponseObj.data);

		//  Do a very cursory check for whether or not the response is at all appropriate.

		var packetIndex = theResponse.toLowerCase().indexOf("<wddxpacket");
		if (packetIndex >= 0)
		{
			theResponse = theResponse.substring(packetIndex);
			theResponse = theResponse.replace(/<char code=\'0\w\'\/>/gi, "");
			theResponse = theResponse.replace("&lt;?xml version=\"1.0\" encoding=\"UTF-8\"?&gt;", "");
			theResponse = dwscripts.entityNameDecode(theResponse);
			//  ************** START KLUDGE **********************************
			//
			//  KLUDGE TO COMPENSATE FOR A BUG IN NEO BETA.
			//  The parameter tag and the documentation tag are not well formed.  They have
			//  no closing at the end.  So, we need to fix this up until the fix is put
			//  in the next version of Neo.

			var documentationIndex = theResponse.toLowerCase().indexOf("<documentation");
			while (documentationIndex >= 0)
			{
				var tagEnd = theResponse.toLowerCase().indexOf(">", documentationIndex);
				if (tagEnd > documentationIndex)
				{
					if (theResponse.toLowerCase().charAt(tagEnd - 1) != "/")
					{
						theResponse = theResponse.substring(0, tagEnd) + " /" + theResponse.substring(tagEnd);
					}
				}
				documentationIndex = theResponse.toLowerCase().indexOf("<documentation", documentationIndex + 2);
			}

			var parameterIndex = theResponse.toLowerCase().indexOf("<parameter");
			while (parameterIndex >= 0)
			{
				var tagEnd = theResponse.toLowerCase().indexOf(">", parameterIndex);
				if (tagEnd > parameterIndex)
				{
					if (theResponse.toLowerCase().charAt(tagEnd - 1) != "/")
					{
						theResponse = theResponse.substring(0, tagEnd) + " /" + theResponse.substring(tagEnd);
					}
				}
				parameterIndex = theResponse.toLowerCase().indexOf("<parameter", parameterIndex + 2);
			}
			//
			//  ************** END KLUDGE **********************************

			theDOM.documentElement.outerHTML = theResponse;
		}
		else
		{
			theDOM = null;
		}

		MM.clearBusyCursor();
	}

	return theDOM;
}


function getComponentRootsDOM()
{
	var theDOM = dw.getNewDocumentDOM();
	var introspectionURL = getIntrospectionUrl();
	if ((introspectionURL != "") && (theDOM != null))
	{
		MM.setBusyCursor();

		var pwdBase64 = MMToBase64(MMDB.getRDSUserName() + ":" + MMDB.getRDSPassword());
		var strHeader = "Authorization-MX: Basic " + pwdBase64 + "\r\n";

		var theResponseObj = MMHttp.postText(introspectionURL + "?method=getComponentRoots",
										     "", "", strHeader); 

		var theResponse = new String(theResponseObj.data);

		//  Do a very cursory check for whether or not the response is at all appropriate.

		var packetIndex = theResponse.toLowerCase().indexOf("<wddxpacket");
		if (packetIndex >= 0)
		{
			theResponse = theResponse.substring(packetIndex);
			theResponse = dwscripts.entityNameDecode(theResponse);
			theDOM.documentElement.outerHTML = theResponse;
		}
		else
		{
			theDOM = null;
		}

		MM.clearBusyCursor();
	}

	return theDOM;
}

function parseComponentRoots(wddxDOM, roots)
{
	var bRet = false;

	do
	{
		//  The DOM always begins with an HTML node containing a HEAD and a BODY.
		//  Inside the BODY is the WDDXPACKET node that starts the information we
		//  really want to parse.
		if (wddxDOM.childNodes.length < 1) break;
		var htmlNode = wddxDOM.childNodes.item(0);

		if (htmlNode.childNodes.length < 2) break;
		var bodyNode = htmlNode.childNodes.item(1);

		if (bodyNode.childNodes.length < 1) break;
		var wddxPacketNode = bodyNode.childNodes.item(0);

		//  The top level node is the wddxDOM.  It should have exactly 2 child nodes:
		//  1)  An empty HEADER tag.
		//  2)  A DATA tag that contains the rest of the packet of data.

		var children = wddxPacketNode.childNodes;
		var nChildren = children.length;
		var b = (nChildren == 2);
		MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
		if (!b) break;

		var headerNode = children.item(0);
		b = ((headerNode.nodeType == Node.ELEMENT_NODE) && (caseInsensitiveCompare(headerNode.tagName, "header")));
		MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
		if (!b) break;

		var dataNode = children.item(1);
		b = ((dataNode.nodeType == Node.ELEMENT_NODE) && (caseInsensitiveCompare(dataNode.tagName, "data")));
		MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
		if (!b) break;

		//  The DATA node should have just one child node:  a ARRAY that contains the rest of
		//  the packet of data.

		children = dataNode.childNodes;
		nChildren = children.length;
		b = (nChildren == 1);
		MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
		if (!b) break;

		var arrayNode = children.item(0);
		b = ((arrayNode.nodeType == Node.ELEMENT_NODE) && (caseInsensitiveCompare(arrayNode.tagName, "array")));
		MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
		if (!b) break;

		//  Each child node of the current ARRAY should be a STRUCT holding two VARs, one for the prefix and one for the
		//	physical path. Each VAR should have one STRING. We want to extract the contents of the STRINGs

		var structNode_Roots = arrayNode.childNodes;
		var nStructNode_Roots = structNode_Roots.length;
		b = (nStructNode_Roots > 0);
		MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
		if (!b) break;

		var iStructNode_Root = 0;
		for (iStructNode_Root=0; iStructNode_Root<nStructNode_Roots; iStructNode_Root++)
		{
			var aStructNode_Root = structNode_Roots.item(iStructNode_Root);
			b = ((aStructNode_Root.nodeType == Node.ELEMENT_NODE) && (caseInsensitiveCompare(aStructNode_Root.tagName, "struct")));
			MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
			if (!b) continue;

			//  The STRUCT node for each path should have two VARS attribute.
			var varNode_Roots = aStructNode_Root.childNodes;
			var nVarNode_Roots = varNode_Roots.length;
			b = (nVarNode_Roots > 0);
			MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
			if (!b) continue;
			
			var prefix = '';
			var physicalpath = '';
			
			var iVarNode_Root = 0;
			for (iVarNode_Root=0; iVarNode_Root<nVarNode_Roots; iVarNode_Root++)
			{
				var aVarNode_Root = varNode_Roots.item(iVarNode_Root);
				b = ((aVarNode_Root.nodeType == Node.ELEMENT_NODE) && (caseInsensitiveCompare(aVarNode_Root.tagName, "var")));
				MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
				if (!b) continue;
				
				var attribs   = parseAttributes(aVarNode_Root, true, false);
				b = ((attribs.length == 2) && (caseInsensitiveCompare(attribs[0], "name")));
				MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
				if (!b) continue;
				
				//there should be one string node
				b = (aVarNode_Root.childNodes.length > 0);
				MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
				if (!b) continue;
				
				var aStringNode = aVarNode_Root.childNodes.item(0);
				b = ((aStringNode.nodeType == Node.ELEMENT_NODE) && (caseInsensitiveCompare(aStringNode.tagName, "string")));
				MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
				if (!b) continue;
				
				//get the contents on the string node, it could be empty which is why we don't assert here
				children = aStringNode.childNodes;
				nChildren = children.length;
				b = (nChildren == 1);
				if (!b) continue;

				var textNode = children.item(0);
				b = (textNode.nodeType == Node.TEXT_NODE);
				MM_assert(b, MM.MSG_CFC_wddxPacketParserError);
				if (!b) continue;
				
				//now save the contents of the string
				if(caseInsensitiveCompare(attribs[1], "prefix"))
				{
					prefix = textNode.data;
				}
				else if(caseInsensitiveCompare(attribs[1], "physicalpath"))
				{
					physicalpath = textNode.data;
				}
			}
			
			//if we got a prefix or physicalpath, create a new object and push it back
			if( physicalpath != '' || prefix != '' )
			{
				var aRoot = new Object();
				aRoot.physicalPath = convertForwardToBackSlashes(physicalpath);
				aRoot.prefix = prefix;
				roots.push(aRoot);
				bRet = true;
			}
		}
	}
	while (false);

	return bRet;
}

function buildMethodSignature(aMethod)
{
	var strSignature = "";

	if (aMethod.returnType != "")
	{
		strSignature = strSignature + aMethod.returnType;
		strSignature = strSignature + "  ";
	}

	strSignature = strSignature + aMethod.name + "(";

	if (aMethod.arguments.length)
	{
		for (var p=0; p<aMethod.arguments.length; p++)
		{
			var aArgument = aMethod.arguments[p];
			if (aArgument.theType != "")
			{
				strSignature = strSignature + aArgument.theType + "  ";
			}
			strSignature = strSignature + aArgument.name + ((p < (aMethod.arguments.length - 1)) ? ",  " : "");
		}
	}
	strSignature = strSignature + ")";
	return strSignature;
}

function buildPropertySignature(aProperty)
{
	var strSignature = "";

	if (aProperty.theType != "")
	{
		strSignature = strSignature + aProperty.theType + "  ";
	}

	strSignature = strSignature + aProperty.name;

	return strSignature;
}

function buildArgumentSignature(aArgument)
{
	var strSignature = "";

	if (aArgument.theType != "")
	{
		strSignature = strSignature + aArgument.theType + "  ";
	}

	strSignature = strSignature + aArgument.name + "  (" + ((caseInsensitiveCompare(aArgument.required, "yes") || caseInsensitiveCompare(aArgument.required, "true")) ? MM.MSG_CFC_Required : MM.MSG_CFC_Optional) + ")";

	return strSignature;
}
