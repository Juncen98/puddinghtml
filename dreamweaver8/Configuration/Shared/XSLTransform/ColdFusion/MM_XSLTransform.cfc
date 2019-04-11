<!-- MM_XSLTransform version: 0.6.2 -->
<cfcomponent displayname="MM_XSLTransform" output="no">
<cfset e = StructNew()>
@@errorMessageList@@
											  	
	<cffunction name="setError" access="private" output="false">
		<cfargument name="error" required="true" type="string">
		
		<cfset myError = error>
	</cffunction>

	<cffunction name="hasError" access="private" output="false" returntype="boolean">
		<cfif Len(myError) GT 0>
			<cfreturn true>
		</cfif>
		<cfreturn false>
	</cffunction>

	<cffunction name="getError" access="private" output="false" returntype="string">
		<cfreturn getErrorFromCode('MM_GEN_ERROR') & myError>
	</cffunction>

		<cffunction name="getErrorFromCode" access="private" output="false" returntype="string">
			<cfargument name="errCode" required="true" type="string">
			<cfargument name="args" required="false" type="array">
			
			<cfset var error = e[Arguments.errCode]>
			<cfif StructKeyExists(Arguments, "args")>
				<cfset placeholders = RepeatString("%s,", ArrayLen(Arguments.args))>
				<cfset replacements = ArrayToList(Arguments.args, ",")>
				<cfset error = ReplaceList(error, placeholders, replacements)>
			</cfif>
			
			<cfreturn error>
		</cffunction>

	<cffunction name="isURL" access="private" output="false" returntype="boolean">
		<cfargument name="src" required="true" type="string">
		
		<cfset var mySrc = Arguments['src']>
		<cfset var url_prefixes = 'http,https'>
		<cfset var pos = Find('://', mySrc)>
		
		<cfif pos GT 0>
			<cfif ListFind(url_prefixes, LCase(Left(mySrc, pos - 1)))>
				<cfreturn true>
			</cfif>
		</cfif>
		<cfreturn false>
	</cffunction>
	
	<cffunction name="isRelativePath" access="private" output="false" returntype="boolean">
		<cfargument name="src" required="true" type="string">
		
		<cfset var mySrc = Arguments['src']>
		
		<cfif Find('..', mySrc)>
			<cfreturn true>
		</cfif>
		<cfif Find(':/', mySrc) OR Find(':\\', mySrc) OR Find(':\', mySrc) OR Left(mySrc, 1) EQ '/'>
			<cfreturn false>
		</cfif>
		<cfreturn true>
	</cffunction>
	
	<cffunction name="getRemoteFile" access="private" output="false" returntype="string">
		<cfargument name="src" required="true" type="string">
		<cfargument name="charset" required="true" type="string">
		
		<cfset var mySrc = Arguments['src']>
		<cfset var myCharset = Arguments['charset']>
		<cfset var myFile = ''>
		<cfset var errSrc = ArrayNew(1)>
		<cfset ArrayAppend(errSrc, mySrc)>
		
		<cftry>
			<cfhttp url="#mySrc#" charset="#myCharset#" method="get" throwOnError="yes" redirect="no" timeout="10">
			<cfset myFile = cfhttp.fileContent>
			<cfcatch type="any">
				<cfset setError(getErrorFromCode('MM_OPEN_REMOTE_ERROR', errSrc) & cfcatch.Type & '<br>' & cfcatch.Message)>
			</cfcatch>
		</cftry>
		<cfreturn myFile>
	</cffunction>
	
	<cffunction name="getLocalFile" access="private" output="false" returntype="string">
		<cfargument name="src" required="true" type="string">
		<cfargument name="charset" required="true" type="string">
		
		<cfset var mySrc = Arguments['src']>
		<cfset var myCharset = Arguments['charset']>
		<cfset var myFile = ''>
		<cfset var errSrc = ArrayNew(1)>
		<cfset ArrayAppend(errSrc, mySrc)>
		
		<cfif isRelativePath(mySrc)>
			<cfset mySrc = ExpandPath(mySrc)>
		</cfif>
		<cftry>
			<cffile action="read" file="#mySrc#" charset="#myCharset#" variable="myFile">
			<cfcatch type="any">
				<cfset setError(getErrorFromCode('MM_OPEN_FILE_ERROR', errSrc) & cfcatch.Message & '<br>' & cfcatch.Detail)>
			</cfcatch>
		</cftry>
		<cfreturn myFile>
	</cffunction>
	
	<cffunction name="checkValid" access="private" output="false" returntype="string">
		<cfargument name="src" required="true" type="string">
		<cfargument name="file" required="true" type="string">
		<cfargument name="type" required="true" type="string">
		
		<cfset var mySrc = Arguments['src']>
		<cfset var myFile = Arguments['file']>
		<cfset var errSrc = ArrayNew(1)>
		<cfset ArrayAppend(errSrc, mySrc)>
		
		<cftry>
			<cfset XMLParse(myFile)>
			<cfcatch type="any">
				<cfif type EQ "xml">
					<cfset setError(getErrorFromCode('MM_INVALID_XML_ERROR', errSrc) & cfcatch.Proc & ' ' & mySrc & '<br>' & cfcatch.Message & '<br>' & HTMLEditFormat(cfcatch.Detail) & '<br>' & HTMLCodeFormat(myFile))>
				<cfelse>
					<cfset setError(getErrorFromCode('MM_INVALID_XSL_ERROR', errSrc) & cfcatch.Proc & ' ' & mySrc & '<br>' & cfcatch.Message & '<br>' & HTMLEditFormat(cfcatch.Detail) & '<br>' & HTMLCodeFormat(myFile))>
				</cfif>
			</cfcatch>
		</cftry>
	</cffunction>
	
	<cffunction name="transformNoParams" access="private" output="false" returntype="string">
		<cfargument name="xml" required="true" type="string">
		<cfargument name="xsl" required="true" type="string">
		<cfset var output = ''>
		<cftry>
			<cfset output = XmlTransform(Arguments['xml'], Arguments['xsl'])>
			<cfcatch type="any">
				<cfset setError(getErrorFromCode('MM_TRANSFORMATION_ERROR') & cfcatch.Proc & '<br>' & cfcatch.Message)>
			</cfcatch>
		</cftry>
		<cfreturn output>
	</cffunction>

	<cffunction name="transformParams" access="private" output="false" returntype="string">
		<cfargument name="xml" required="true" type="string">
		<cfargument name="xsl" required="true" type="string">
		<cfargument name="params" required="true" type="struct">
		
		<cfset var output = ''>
		<cfset var XMLReader =''>
		<cfset var XMLSource = ''>
		<cfset var XSLReader =''>
		<cfset var XSLSource = ''>
		<cfset var transformerFactory = ''>
		<cfset var resultWriter = ''>
		<cfset var result = ''>
		
		<cftry>
			<cfset XMLReader = createObject("java", "java.io.StringReader").init(Arguments['xml'])>
			<cfset XMLSource = createObject("java", "javax.xml.transform.stream.StreamSource").init(XMLReader)>
			<cfset XSLReader = createObject("java", "java.io.StringReader").init(Arguments['xsl'])>
			<cfset XSLSource = createObject("java", "javax.xml.transform.stream.StreamSource").init(XSLReader)>
			<cfset transformerFactory = createObject("java", "javax.xml.transform.TransformerFactory").newInstance()>
			<cfset transformer = transformerFactory.newTransformer(XSLSource)>
			<cfset resultWriter = createObject("java", "java.io.StringWriter").init()>
			<cfset result = createObject("java", "javax.xml.transform.stream.StreamResult").init(resultWriter)>
			<cfloop collection=#Arguments['params']# item="item">
				<cfset transformer.setParameter(item, Arguments['params'][item])>
			</cfloop>
			<cfset transformer.transform(XMLSource, result)>
			<cfset output = resultWriter.toString()>
			<cfcatch type="any">
				<cfset setError(getErrorFromCode('MM_TRANSFORMATION_ERROR') & cfcatch.Type & '<br>' & cfcatch.Message)>
			</cfcatch>
		</cftry>
		<cfreturn output>
	</cffunction>

	<cffunction name="transform" access="public" output="true">
		<cfargument name="xml" required="true" type="string" hint="XML source">
		<cfargument name="xsl" required="true" type="string" hint="XSL source">

		<cfset var params = Duplicate(Arguments)>
		<cfset var output = ''>
		<cfset var xmlname = ''>
		<cfset var xslname = ''>
		<cfset var myXml = ''>
		<cfset var myXsl = ''>
		<cfset var myXmlCharSet='utf-8'>
		<cfset var myXslCharSet='utf-8'>
			
		<cfif StructKeyExists(Arguments, "xmlcharset")>
			<cfset myXmlCharSet = params['xmlcharset']>
			<cfset StructDelete(params, 'xmlcharset')>
		</cfif>

		<cfif StructKeyExists(Arguments, "xslcharset")>
			<cfset myXslCharSet = params['xslcharset']>
			<cfset StructDelete(params, 'xslcharset')>
		</cfif>

		<cfset myError = ''>
		<cfif Len(Trim(params['xml'])) EQ 0>
			<cfset setError(getErrorFromCode('MM_XML_EMPTY_ERROR'))>
		</cfif>
		<cfif hasError()>
			<cfoutput>#getError()#</cfoutput>
			<cfreturn getError()>
		</cfif>
		
		<cfif Len(Trim(params['xsl'])) EQ 0>
			<cfset setError(getErrorFromCode('MM_XSL_EMPTY_ERROR'))>
		</cfif>
		<cfif hasError()>
			<cfoutput>#getError()#</cfoutput>
			<cfreturn getError()>
		</cfif>
		
		<cfset xmlname = params['xml']>
		<cfset xslname = params['xsl']>
		<cfset StructDelete(params, 'xml')>
		<cfset StructDelete(params, 'xsl')>
		
		
		<cfif isURL(xmlname)>
			<cfset myXml = JavaCast("string", getRemoteFile(xmlname,myXmlCharSet))>
			<cfelse>
				<cfset myXml = getLocalFile(xmlname,myXmlCharSet)>
		</cfif>
		<cfif hasError()>
			<cfoutput>#getError()#</cfoutput>
			<cfreturn getError()>
		</cfif>
		
		<cfset myXsl = getLocalFile(xslname,myXslCharSet)>
		<cfif hasError()>
			<cfoutput>#getError()#</cfoutput>
			<cfreturn getError()>
		</cfif>
		
		<cfset checkValid(xmlname, myXml, 'xml')>
		<cfif hasError()>
			<cfoutput>#getError()#</cfoutput>
			<cfreturn getError()>
		</cfif>
		<cfset checkValid(xslname, myXsl, 'xsl')>
		<cfif hasError()>
			<cfoutput>#getError()#</cfoutput>
			<cfreturn getError()>
		</cfif>
		
		<cfif StructCount(params) EQ 0>
			<cfset output = transformNoParams(myXml, myXsl)>
			<cfelse>
				<cfset output = transformParams(myXml, myXsl, params)>
		</cfif>
		<cfif hasError()>
			<cfoutput>#getError()#</cfoutput>
			<cfreturn getError()>
		</cfif>

		<cfoutput>#output#</cfoutput>
		<cfreturn output>
	</cffunction>
</cfcomponent>
