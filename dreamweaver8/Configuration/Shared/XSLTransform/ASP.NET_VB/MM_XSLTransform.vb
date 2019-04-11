' MM_XSLTransform version: 0.6.2
Imports System
Imports System.IO
Imports System.Xml
Imports System.Xml.XPath
Imports System.Xml.Xsl
Imports System.Collections


Namespace MM
	Public Class XSLTransform
		Private xmlUri			As String			' 	XML source
		Private xslUri			As String			'	XSL source
		Private params			As Hashtable		' 	processor parameters
		
		Private errorMsg			As String			'	the error message that might be thrown by the library
		Private errorCode			As String			'	the	code of the error
		Private errorMessages		As Hashtable		'	a dictionary with all the codes-messages for the possible thrown errors of the library.
														' 	dynamic strings are represented by the placeholders %s and rendered only when the error is actually thrown

		Public Sub New()
			errorMessages = new Hashtable()
@@errorMessageList@@

			xmlUri = ""
			xslUri = ""
			errorMsg = ""
			errorCode = ""
			
			params = new Hashtable()
		End Sub

		Public Sub setXML(ByVal xmlUri_param As String)
			xmlUri = xmlUri_param.Trim()
		End Sub

		Public Sub setXSL(ByVal xslUri_param As String)
			xslUri = xslUri_param.Trim()
		End Sub

		Public Sub addParameter(ByVal paramName As String, ByVal paramValue As String)
			params(paramName) = paramValue
		End Sub

		Private Sub CheckInput()
			If xmlUri.Length = 0 Then
				setError("MM_EMPTY_XML_SOURCE", Nothing)
				Exit Sub
			End If
			If xslUri.Length = 0 Then
				 setError("MM_EMPTY_XSL_SOURCE", Nothing)
			End If
		End Sub
		
		Private Function isURL(ByVal strResource As String) As Boolean
			If strResource.ToLower().IndexOf("http://") = 1 Or  strResource.ToLower().IndexOf("https://") = 1 Then
				Return True
			End If
			Return False
		End Function
		
		Public Function Transform() As String
			CheckInput()
			If hasError() Then
				Return getError()
			End If

			' Load XML
		    Dim docXml As  XmlDocument = new XmlDocument()
			Try 
				docXml.Load(xmlUri)
			Catch e As Exception
				Dim args As String() = {xmlUri, e.Message}
				setError("MM_INVALID_XML_ERROR", args)
				Return getError()
			End Try	
			' OR
			' Dim docXml As  XPathDocument = new XPathDocument(xmlUri)
			
			' Load XSL
			Dim xslt as System.Xml.Xsl.XslTransform = new System.Xml.Xsl.XslTransform()
			Try 
				xslt.Load(xslUri)
			Catch e As Exception
				Dim args As String() = {xslUri, e.Message}
				setError("MM_INVALID_XSL_ERROR", args)
				Return getError()
			End Try			
			
		   'Create the XsltArgumentList.
			Dim xslArg As XsltArgumentList = new XsltArgumentList()
			Dim myEnum As IDictionaryEnumerator = params.GetEnumerator()
			While myEnum.MoveNext()
				xslArg.AddParam(myEnum.Key, "", myEnum.Value)
			End While
			
			' DO the transformation
			Dim sw as StringWriter = new StringWriter()
			Try
		 		xslt.Transform(docXml, xslArg, sw, Nothing)
			Catch e As Exception
				Dim args As String() = {e.Message}
				setError("MM_TRANSFORM_ERROR", args)
				Return getError()
			End Try
			Return sw.ToString()
		End Function			
		
		


		
		' Error handling functions
		Private Sub setError(ByVal errorCode_param As String, ByRef arrParams() As String)
			errorCode = errorCode_param
			errorMsg = sprintf(errorMessages(errorCode_param), arrParams)
		End Sub
		
		Private Sub addError(ByVal errorCode_param As String, ByRef arrParams() As String)
			errorMsg = errorMsg & sprintf(errorMessages(errorCode_param), arrParams)
		End Sub
		
		Private Function hasError() As Boolean
			If errorCode <> "" Then
				Return True
			End If
			Return False
		End Function
		
		Private Function getError() As String
			Return errorMessages("MM_GENERIC_MESSAGE") & errorMsg
		End Function
		
		' utility function
		' builds a string using a template and an array of params (C style)
		Private Function sprintf (ByVal strSource As String, ByRef arrParams() As String) As String
			If arrParams Is Nothing Then
				Return strSource
			End If
			
			Dim strRest As String = strSource
			Dim strReturn As String = ""
			Dim strReturnSlice As String
			Dim pos As Integer = -1
			Dim i  As Integer
			
			For i = 0 To arrParams.Length-1
				pos = strRest.IndexOf("%s")
				If pos > 0 Then
					strReturnSlice = strRest.Substring(0, pos+2)
					strReturnSlice = strReturnSlice.Replace("%s", arrParams(i))
					strReturn = strReturn & strReturnSlice					
					strRest = strRest.Substring(pos+2)
				End If
			Next
			strReturn = strReturn & strRest
			Return strReturn
		End Function
	End Class	
End Namespace