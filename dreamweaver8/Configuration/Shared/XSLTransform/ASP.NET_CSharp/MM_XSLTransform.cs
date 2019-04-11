// MM_XSLTransform version: 0.6.2
using System;
using System.Xml;
using System.Xml.XPath;
using System.Xml.Xsl;
using System.IO;
using System.Collections;

namespace MM {
	public class XSLTransform {
		private string xmlUri;				// 	XML source
		private string xslUri;				// 	XSL source
		private Hashtable parameters;			// 	processor parameters
		
		private string errorMsg;			// the error message that might be thrown by the library
		private string errorCode;			//	the	code of the error
		private Hashtable errorMessages;	//	a dictionary with all the codes-messages for the possible thrown errors of the library.
											// 	dynamic strings are represented by the placeholders %s and rendered only when the error is actually thrown

		public XSLTransform(){
			errorMessages = new Hashtable();
@@errorMessageList@@
			
			xmlUri = "";
			xslUri = "";
			errorMsg = "";
			errorCode = "";
			
			parameters = new Hashtable();
		}
		
		public void setXML(string xmlUri_param){
			xmlUri = xmlUri_param;
		}
		public void setXSL(string xslUri_param){
			xslUri = xslUri_param;
		}
		public void addParameter(string paramName, string paramValue){
			if (parameters.Contains(paramName)) {
				parameters.Remove(paramName);
			}
			parameters.Add(paramName, paramValue);
		}
		private void CheckInput() {
			if (xmlUri.Length == 0) {
				setError("MM_EMPTY_XML_SOURCE", null);
				return;				
			}
			if (xslUri.Length == 0) {
				setError("MM_EMPTY_XSL_SOURCE", null);
				return;				
			}
		}
		private bool isURL(string strResource) {
			if (strResource.ToLower().IndexOf("http://") == 1 || strResource.ToLower().IndexOf("https://") == 1) {
				return true;
			}
			return false;
		}
		
		public string Transform(){
			CheckInput();
			if (hasError()) {
				return getError();
			}
			
			// load XML
			XmlDocument docXml = new XmlDocument();
			try {
				docXml.Load(xmlUri);
			} catch (Exception e) {
				string[] args = {xmlUri, e.Message};
				setError("MM_INVALID_XML_ERROR", args);
				return getError();
			}
			// load XSL
			System.Xml.Xsl.XslTransform xslt  = new System.Xml.Xsl.XslTransform();
			try {
				xslt.Load(xslUri);
			} catch (Exception e) {
				string[] args = {xslUri, e.Message};
				setError("MM_INVALID_XSL_ERROR", args);
				return getError();				
			}
			
			XsltArgumentList xslArg = new XsltArgumentList();
			foreach (DictionaryEntry entry in parameters) {
				object val = entry.Value;
				string key = (string)entry.Key;
				xslArg.AddParam(key, "", val);
			}

			// DO the transformation
			StringWriter sw =  new StringWriter();
			try {
				xslt.Transform(docXml, xslArg, sw, null);
			} catch (Exception e) {
				string[] args = {e.Message};
				setError("MM_TRANSFORM_ERROR", args);
				return getError();
			}
			return sw.ToString();
		}
		
		// Error handling functions
		private void setError(string errorCode_param, string[] arrParams){
			errorCode = errorCode_param;
			errorMsg = sprintf((string)errorMessages[errorCode_param], arrParams);
		}
		
		private void addError(string errorCode_param, string[] arrParams){
			errorMsg = errorMsg + sprintf((string)errorMessages[errorCode_param], arrParams);
		}
		
		private bool hasError(){	
			if (errorCode != "") { 
				return true;
			}		
			return false;
		}
		private string getError(){
			return (string)errorMessages["MM_GENERIC_MESSAGE"] + errorMsg;
		}
		
		
		// utility function
		// builds a string using a template and an array of params (C style)
		private string sprintf(string strSource, string[] arrParams) {
			if (arrParams == null) {
				return strSource;
			}
			string strRest = strSource;
			string strReturn = "";
			string strReturnSlice;
			int pos;
			int i;
			
			for (i=0; i < arrParams.Length; i++) {
				pos = strRest.IndexOf("%s");
				if(pos > 0) {
					strReturnSlice = strRest.Substring(0, pos+2);
					strReturnSlice = strReturnSlice.Replace("%s", arrParams[i]);
					strReturn = strReturn +  strReturnSlice;					
					strRest = strRest.Substring(pos+2);
				}
			}
			strReturn = strReturn + strRest;
			return strReturn;
		}
	}	
}