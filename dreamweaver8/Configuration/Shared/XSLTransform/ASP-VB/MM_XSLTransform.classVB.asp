<%
	' MM_XSLTransform version: 0.6.2

	Class MM_XSLTransform
		Private xmlUri			' 	XML source
		Private xslUri			'	XSL source
		Private params			' 	processor parameters
		
		Private errorMsg		'	the error message that might be thrown by the library
		Private errorCode		'	the	code of the error
		Private errorMessages	'	a dictionary with all the codes-messages for the possible thrown errors of the library.
								' 	dynamic strings are represented by the placeholders %s and rendered only when the error is actually thrown
		
		' objects used for transformation
		Private objXMLDOM
		Private objFreeDOM
		Private objXSLTemplate
		
		
		Private Sub Class_Initialize()
			Set errorMessages = Server.CreateObject("Scripting.Dictionary")
@@errorMessageList@@
			
			Set params = Server.CreateObject("Scripting.Dictionary")
		End Sub

		Public Sub setXML(xmlUri_param)
			xmlUri = Trim(xmlUri_param)
		End Sub

		Public Sub setXSL(xslUri_param)
			xslUri = Trim(xslUri_param)
		End Sub

		Public Sub addParameter(paramName, paramValue)
			params(paramName) = paramValue
		End Sub

		Private Sub CheckInput()
			If len(xmlUri) = 0 Then
				setError "MM_EMPTY_XML_SOURCE", array()
				Exit Sub
			End If
			If len(xslUri) = 0 Then
				 setError "MM_EMPTY_XSL_SOURCE", array()
			End If
		End Sub
		
		Private Sub CreateTransformationObjects()
			On Error Resume Next
			Set objXMLDOM = Server.CreateObject("MSXML2.DOMDocument")
			If err.number <> 0 Then
				On Error GoTo 0
				setError "MM_MISSING_OBJECT", array("MSXML2.DOMDocument")
				Exit Sub				
			End If
			
			Set objFreeDOM = Server.CreateObject("MSXML2.FreeThreadedDOMDocument")
			If err.number <> 0 Then
				On Error GoTo 0
				setError "MM_MISSING_OBJECT", array("MSXML2.FreeThreadedDOMDocument")
				Exit Sub				
			End If

			Set objXSLTemplate = Server.CreateObject("MSXML2.XSLTemplate")
			If err.number <> 0 Then
				On Error GoTo 0
				setError "MM_MISSING_OBJECT", array("MSXML2.XSLTemplate")
				Exit Sub				
			End If
			On Error GoTo 0
		End Sub
		
		Private Function isURL(strResource)
			isURL = False
			If Instr(1, strResource, "http://", 1) = 1 Or Instr(1, strResource, "https://", 1) = 1 Then
				isURL = True
			End If
		End Function
		
		
		Private Sub LoadFromFile(path, ByRef objdom, filetype)
			objdom.async = False
			objdom.resolveExternals = False
			objdom.validateOnParse = False
			On Error Resume Next
			realPath = Server.MapPath(path)
			If err.Number<> 0 Then
				setError "MM_INVALID_PATH", array(path, err.Description)
				On Error GoTo 0	
				Exit Sub
			End If

			Set fs=Server.CreateObject("Scripting.FileSystemObject")
			If (fs.FileExists(realPath))=False Then
				setError "MM_OPEN_FILE_ERROR", array(path)
				On Error GoTo 0	
				Exit Sub
			End If
			Set fs=Nothing
			
			loadingTest = objdom.load (realPath)
			If err.Number <> 0 Then
				If filetype = "xml" Then
					setError "MM_XML_LOADING_ERROR", array(path, err.Description)
				Else
					setError "MM_XSL_LOADING_ERROR", array(path, err.Description)
				End If	
				On Error GoTo 0
				Exit Sub
			End If		
			If loadingTest = false Then
				If filetype = "xml" Then
					setError "MM_INVALID_XML_ERROR", array(path)	
				Else
					setError "MM_INVALID_XSL_ERROR", array(path)	
				End If	
				Set myErr = objdom.parseError
				If (myErr.errorCode <> 0) Then
					addError "MM_LOADING_FAILED_DETAILS", array(myErr.reason, myErr.errorCode, myErr.filepos, myErr.line, myErr.linepos)
				End If
			End If
			On Error GoTo 0
		End Sub		
		

		Private Sub LoadFromURL (url, ByRef objdom, filetype)
			Dim objhttp
			On Error Resume Next
			Set objhttp = Server.CreateObject("MSXML2.ServerXMLHTTP")
			If err.number<>0 Then
				On Error GoTo 0
				setError "MM_MISSING_OBJECT", array("MSXML2.ServerXMLHTTP")
				Exit Sub				
			End If

			objhttp.open "GET", url, False
			objhttp.setRequestHeader "Content-Type","text/xml"
			objhttp.send
			
			If err.Number<> 0 Then
				If filetype = "xml" Then
					setError "MM_XML_LOADING_ERROR", array(url, err.Description)
				Else
					setError "MM_XSL_LOADING_ERROR", array(url, err.Description)
				End If	
				On Error GoTo 0	
				Exit Sub
			End If

			objdom.async = False
			objdom.resolveExternals = False
			objdom.validateOnParse = False
			loadingTest = objdom.load (objhttp.responseStream)
			If err.Number <> 0 Then
				If filetype = "xml" Then
					setError "MM_XML_LOADING_ERROR", array(url, err.Description)
				Else
					setError "MM_XSL_LOADING_ERROR", array(url, err.Description)
				End If			
				On Error GoTo 0
				Exit Sub
			End If		
			If loadingTest = false Then
				If filetype = "xml" Then
					setError "MM_INVALID_XML_ERROR", array(url)	
				Else
					setError "MM_INVALID_XSL_ERROR", array(url)	
				End If			
				Set myErr = objdom.parseError
				If (myErr.errorCode <> 0) Then
					addError "MM_LOADING_FAILED_DETAILS", array(myErr.reason, myErr.errorCode, myErr.filepos, myErr.line, myErr.linepos)
				End If
			End If
			On Error GoTo 0
		End Sub

		
		Public Function Transform()
			CheckInput
			If hasError() Then
				Transform = getError()
				Exit Function
			End If
			
			' Create the required objects to perform the transformation
			CreateTransformationObjects()
			If hasError() Then
				Transform = getError()
				Exit Function
			End If
			
			' Load XML
			If isURL(xmlUri) Then
				LoadFromURL xmlUri, objXMLDOM, "xml" 
			Else
				LoadFromFile xmlUri, objXMLDOM, "xml"
			End If
			If hasError() Then
				Transform = getError()
				Exit Function
			End If

			' Load XSL
			If isURL(xslUri) Then
				LoadFromURL xslUri, objFreeDOM, "xsl"
			Else
				LoadFromFile xslUri, objFreeDOM, "xsl"
			End If
			If hasError() Then
				Transform = getError()
				Exit Function
			End If

			' DO the transformation
			On Error Resume Next
			objXSLTemplate.stylesheet = objFreeDOM
			If Err.Number <> 0 Then
				setError "MM_XSL_ERROR", array(xslUri, Err.Description)	
				Transform = getError()
				On Error GoTo 0
				Exit Function
			End If
			On Error GoTo 0

			Dim processor 
			Set processor = objXSLTemplate.createProcessor
			
			' set source xml
			processor.input = objXMLDOM
			' add parameters
			For each param in params
				processor.addParameter param, params(param)	
			Next
			' call transform
			
			'processor.output = Response
			'readyTest = processor.transform
			On Error Resume Next
			readyTest = processor.transform
			If err.Number <> 0 Then	
				setError "MM_TRANSFORM_ERROR", array(err.description)
				Transform = getError()
				On Error GoTo 0
				Exit Function
			End If	
			On Error GoTo 0
			Transform = processor.output
		End Function			
		
	

		
		' Error handling functions
		Private Sub setError(errorCode_param, ByRef arrParams)
			errorCode = errorCode_param
			errorMsg = sprintf(errorMessages(errorCode_param), arrParams)
		End Sub
		
		Private Sub addError(errorCode_param, ByRef arrParams)
			errorMsg = errorMsg & sprintf(errorMessages(errorCode_param), arrParams)
		End Sub
		
		Private Function hasError()
			hasError = False
			If errorCode <> "" Then
				hasError = True
			End If
		End Function
		
		Private Function getError()
			getError = errorMessages("MM_GENERIC_MESSAGE") & errorMsg
		End Function
		
		' utility function
		' builds a string using a template and an array of params (C style)
		Private Function sprintf (strSource, ByRef arrParams)
			Dim strRest: strRest = strSource
			Dim strReturn: strReturn = ""
			
			For i = 0 To UBound(arrParams)
				pos = Instr(strRest, "%s")
				If pos <> 0 Then
					strReturnSlice = Left(strRest, pos+1)
					strReturnSlice = Replace(strReturnSlice, "%s", arrParams(i))
					strReturn = strReturn & strReturnSlice					
					strRest = Mid(strRest, pos+2)
				End If
			Next
			strReturn = strReturn & strRest
			sprintf = strReturn
		End Function

		Private Sub Class_terminate()
			Set errorMessages = nothing
			Set params = nothing

			Set objXMLDOM = nothing
			Set objFreeDOM = nothing
			Set objXSLTemplate = nothing
		End Sub
	End Class
%>