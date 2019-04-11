<%
	// MM_XSLTransform version: 0.6.2

	function MM_XSLTransform() {
		this.errorMessages = new ActiveXObject("Scripting.Dictionary");
@@errorMessageList@@



		this.xmlUri = "";											// 	XML source
		this.xslUri = "";											// 	XSL source
		this.params = new ActiveXObject("Scripting.Dictionary");	//	processor parameters	  	  
	
		this.errorMsg = "";
		this.errorCode = "";


		this.objXMLDOM = null;
		this.objFreeDOM = null;
		this.objXSLTemplate = null;
		
		// utility methods
		this.trim	 	= MM_XSLTransform__trim;
		this.sprintf 	= MM_XSLTransform__sprintf;
		this.isURL		= MM_XSLTransform__isURL;
		
		// error handling methods
		this.setError 	= MM_XSLTransform__setError;
		this.addError	= MM_XSLTransform__addError;
		this.hasError	= MM_XSLTransform__hasError;
		this.getError	= MM_XSLTransform__getError;
		
		// class methods
		this.setXML		= MM_XSLTransform__setXML;
		this.setXSL		= MM_XSLTransform__setXSL;
		this.addParameter = MM_XSLTransform__addParameter;
		this.Transform	= MM_XSLTransform__Transform;
		
		this.checkInput = MM_XSLTransform__checkInput;
		this.createTransformationObjects = MM_XSLTransform__createTransformationObjects;
		this.loadFromFile = MM_XSLTransform__loadFromFile;
		this.loadFromURL = MM_XSLTransform__loadFromURL;
	}	
	
	
	
		// utility functions
		// replace leading and trailing with the empty string
		function MM_XSLTransform__trim(str) {
			return str.replace(/(^\s*)|(\s*$)/g, "");
		}
		
		// builds a string using a template string and additional params (C style)
		function MM_XSLTransform__sprintf(str){
		  var i = 1;
		  var pos = str.indexOf("%s");
		  while(pos >= 0){
		  	if (String(arguments[i]) == "undefined") arguments[i] = "";
			str = str.substr(0, pos) + arguments[i++] + str.substr(pos+2);
			pos = str.indexOf("%s");
		  }
		  return str;
		}	
		function MM_XSLTransform__isURL(strResource) {
			if ((strResource.toLowerCase()).indexOf("http://") == 0 || (strResource.toLowerCase()).indexOf("https://") == 0) {
				return true;
			}
			return false;	
		}	

		function MM_XSLTransform__setXML(xmlUri) {
			this.xmlUri = this.trim(xmlUri);
		}
		function MM_XSLTransform__setXSL(xslUri) {
			this.xslUri = this.trim(xslUri);
		}
		function MM_XSLTransform__addParameter(paramName, paramValue) {
			if (this.params.Exists(paramName)) {
				this.params.Remove(paramName);
			}
			this.params.Add(paramName, paramValue);
		}

		function MM_XSLTransform__Transform() {
			this.checkInput();
			if (this.hasError()) {
				return this.getError();
			}
			
			// Create the required objects to perform the transformation
			this.createTransformationObjects();
			if (this.hasError()) {
				return this.getError();
			}
			
			// Load XML
			if (this.isURL(this.xmlUri)) {
				this.loadFromURL(this.xmlUri, this.objXMLDOM, "xml");
			} else {
				this.loadFromFile(this.xmlUri, this.objXMLDOM, "xml");
			}
			if (this.hasError()) {
				return this.getError();
			}

			// Load XSL
			if (this.isURL(this.xslUri)) {
				this.loadFromURL(this.xslUri, this.objFreeDOM, "xsl");
			} else {
				this.loadFromFile(this.xslUri, this.objFreeDOM, "xsl");
			}
			if (this.hasError()) {
				return this.getError();
			}

			// DO the transformation
			try {
				this.objXSLTemplate.stylesheet = this.objFreeDOM;
			} catch(e) {
				this.setError("MM_XSL_ERROR", this.xslUri, e.description);
				return this.getError();
			}
			var processor = this.objXSLTemplate.createProcessor();
			// set source xml
			processor.input = this.objXMLDOM;
			// add parameters

			var paramNames = (new VBArray(this.params.Keys())).toArray();
			for (i in paramNames) {
				processor.addParameter(paramNames[i], this.params(paramNames[i]));
			}
			try {
				readyTest = processor.transform();
			} catch(e) {
				this.setError("MM_TRANSFORM_ERROR", e.description);
				return this.getError();
			}				
			return processor.output;
		}

		function MM_XSLTransform__checkInput() {
			if (this.xmlUri == "") {
				this.setError("MM_EMPTY_XML_SOURCE");
				return;
			}
			if (this.xslUri == "") {
				this.setError("MM_EMPTY_XSL_SOURCE");
				return;
			}
		}
		
		function MM_XSLTransform__createTransformationObjects() {
			try {
				this.objXMLDOM = new ActiveXObject("MSXML2.DOMDocument");
			} catch(e) {
				this.setError("MM_MISSING_OBJECT", "MSXML2.DOMDocument");
				return;
			}

			try {
				this.objFreeDOM = new ActiveXObject("MSXML2.FreeThreadedDOMDocument");
			} catch(e) {
				this.setError("MM_MISSING_OBJECT", "MSXML2.FreeThreadedDOMDocument");
				return;
			}
			
			try {
				this.objXSLTemplate = new ActiveXObject("MSXML2.XSLTemplate");
			} catch(e) {
				this.setError("MM_MISSING_OBJECT", "MSXML2.XSLTemplate");
				return;
			}			
		}
		
		function MM_XSLTransform__loadFromFile(path, objdom, filetype) {
			objdom.async = false;
			objdom.resolveExternals = false;
			objdom.validateOnParse = false;
			var realPath;
			try {
				realPath = Server.MapPath(path);
			} catch(e) {
				this.setError("MM_INVALID_PATH", path, e.description);
				return;
			}

			var fs=Server.CreateObject("Scripting.FileSystemObject");
			if (fs.FileExists(realPath) == false)
			{
				this.setError("MM_OPEN_FILE_ERROR", path);
				return;
			}

			var loadingTest = false;	
			try {
				loadingTest = objdom.load(realPath);
			} catch(e) {
				if (filetype == "xml") {
					this.setError("MM_XML_LOADING_ERROR", path, e.description);
				} else {
					this.setError("MM_XSL_LOADING_ERROR", path, e.description);
				}
				return;
			}
			if (!loadingTest) {
				if (filetype == "xml") {
					this.setError("MM_INVALID_XML_ERROR", path);
				} else {
					this.setError("MM_INVALID_XSL_ERROR", path);
				}	
				var myErr = objdom.parseError;
				if (myErr.errorCode != 0) {
					this.addError("MM_LOADING_FAILED_DETAILS", myErr.reason, myErr.errorCode, myErr.filepos, myErr.line, myErr.linepos);
				}
			}
		}
			

		function MM_XSLTransform__loadFromURL(url, objdom, filetype) {
			var objhttp;
			try {
				objhttp = new ActiveXObject("MSXML2.ServerXMLHTTP");
			} catch(e) {
				this.setError("MM_MISSING_OBJECT", "MSXML2.ServerXMLHTTP");
				return;
			}
			try {			
				objhttp.open("GET", url, false)
				objhttp.setRequestHeader("Content-Type","text/xml");
				objhttp.send();
			} catch(e) {
				if (filetype == "xml") {
					this.setError("MM_XML_LOADING_ERROR", url, e.description);
				} else {
					this.setError("MM_XSL_LOADING_ERROR", url, e.description);
				}
				return;
			}	

			objdom.async = false;
			objdom.resolveExternals = false;
			objdom.validateOnParse = false;
			var loadingTest = false;	
			try {
				loadingTest = objdom.load(objhttp.responseStream);
			} catch(e) {
				if (filetype == "xml") {
					this.setError("MM_XML_LOADING_ERROR", url, e.description);
				} else {
					this.setError("MM_XSL_LOADING_ERROR", url, e.description);
				}
				return;
			}
			if (!loadingTest) {
				if (filetype == "xml") {
					this.setError("MM_INVALID_XML_ERROR", url);
				} else {
					this.setError("MM_INVALID_XSL_ERROR", url);
				}	
				var myErr = objdom.parseError;
				if (myErr.errorCode != 0) {
					this.addError("MM_LOADING_FAILED_DETAILS", myErr.reason, myErr.errorCode, myErr.filepos, myErr.line, myErr.linepos);
				}
			}
		}

	
		// Error handling functions
		function MM_XSLTransform__setError(errorCode) {
			this.errorCode = errorCode;
			arguments[0] = this.errorMessages(errorCode);
			this.errorMsg = this.sprintf.apply(this, arguments); 
		}
		function MM_XSLTransform__addError(errorCode) {
			arguments[0] = this.errorMessages(errorCode);
			this.errorMsg = this.errorMsg + this.sprintf.apply(this, arguments);
		}
		function MM_XSLTransform__hasError() {
			if (this.errorCode != "") {
				return true;
			}
			return false;
		}
		function MM_XSLTransform__getError() {
			return  this.errorMessages("MM_GENERIC_MESSAGE") + this.errorMsg;
		}

%>