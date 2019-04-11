<cfcomponent>

	<!---- ////////////////////////////////////////////////////--->
	<!---- NT Domain Authentication							   --->
	<!---- ////////////////////////////////////////////////////--->
	
  	<cffunction name="ntauth" access="private" output="false" returntype="struct" hint="针对 NT 域进行验证">
    	<cfargument name="nusername" required="true" hint="用户名"> 
		<cfargument name="npassword" required="true" hint="密码"> 
		<cfargument name="ndomain" required="true" hint="要针对其进行验证的域"> 
		<cfset var retargs = StructNew()>

		<CFNTAuthenticate
		 	username="#arguments.nusername#" 	
			password="#arguments.npassword#" 
		 	domain="#arguments.ndomain#"
			listGroups="yes"
		 	result="authenticated"
			>

         <cfif authenticated.status eq "success">
		 	<cfset retargs.authenticated = "YES">
		 <cfelse>
		 	<cfset retargs.authenticated = "NO">
		 </cfif>
		 <!--- return role here, default role is always "user" --->
		 <cfset retargs.roles = ListPrepend(retargs.groups, "user")>
		 <cfreturn retargs>
  	</cffunction>
	
	<!---- ////////////////////////////////////////////////////--->
	<!---- LDAP Authentication 								   --->
	<!---- ////////////////////////////////////////////////////--->
	
	  <cffunction name="ldapauth" access="private" output="true" returntype="struct" hint="针对 LDAP 服务器进行验证。" >
		  <cfargument name="lServer" required="true" hint="LDAP 服务器。"> 
		  <cfargument name="lPort" hint="LDAP 服务器使用的端口。">
		  <cfargument name="sUsername" required="true" hint="在登录向导中设置的用户名。">
		  <cfargument name="sPassword" required="true" hint="在登录向导中设置的密码。">
		  <cfargument name="uUsername" required="true" hint="从客户端传入的用户名。">
		  <cfargument name="uPassword" required="true" hint="从客户端传入的密码。">
		  <cfargument name="sQueryString" required="true" hint="要传递给 LDAP 服务器的字符串">
		  <cfargument name="lStart" required="true"> 
		  
		  <cfset var retargs = StructNew()>
		  <cfset var username = replace(sQueryString,"{username}",uUserName)>
	  
		  <cfldap action="QUERY"
			  name="userSearch"
			  attributes="dn"
			  start="#arguments.lStart#"
			  server="#arguments.lServer#"
			  port="#arguments.lPort#"
			  username="#arguments.sUsername#"
			  password="#arguments.sPassword#"  > 
				  
		<!--- If user search failed or returns 0 rows abort --->
		<cfif  userSearch.recordCount EQ "" >
		  <cfoutput>Error</cfoutput>
		 </cfif>

		<!--- pass the user's DN and password to see if the user authenticates 
		and get the user's roles --->	

		  <cfldap 
			action="QUERY"
			name="auth"
			attributes="dn,roles"
			start="#arguments.lStart#"
			server="#arguments.lServer#"
			port="#arguments.lPort#"
			username="#username#"
			password="#arguments.uPassword#" >

			<!--- If the LDAP query returned a record, the user is valid. --->
			<cfif auth.recordCount>
				<cfset retargs.authenticated="YES">
				 <!--- return role here, default role is always "user" --->
		 		<cfset retargs.roles = "user">
			</cfif>				  
		<cfreturn retargs>
	  </cffunction>
	  
	  <!---- ////////////////////////////////////////////////////--->
	  <!---- Simple Authtentication								 --->
	  <!---- ////////////////////////////////////////////////////--->
	  
  	  <cffunction name="simpleauth" access="private" output="false" returntype="struct" hint="使用单个用户名和密码进行验证">
		<cfargument name="sUserName" required="true" hint="在登录向导中设置的用户名。">
		<cfargument name="sPassword" required="true" hint="在登录向导中设置的密码。">
		<cfargument name="uUserName" required="true" hint="从客户端传入的用户名。">
		<cfargument name="uPassword" required="true" hint="从客户端传入的密码。">
		<cfset var retargs = StructNew()>
		
		<cfif sUserName eq uUserName AND sPassword eq uPassword>
			<cfset retargs.authenticated="YES">
			<cfset retargs.roles = "user">
	  	<cfelse>
			<cfset retargs.authenticated="NO">
	  	</cfif>
		  <cfreturn retargs>
 	 </cffunction>
	 
	  
  	  <!---- ////////////////////////////////////////////////////--->
	  <!--- This method performs the <cflogin> call and in turn  --->
	  <!--- calls the actual authentication method               --->
	  <!---- ////////////////////////////////////////////////////--->
	  <cffunction name="performlogin" access="public" output="true" hint="使用 NT、LDAP 或简单（预定义的用户名和密码）验证来登录用户。">
	  	<cfargument name="args" type="struct" required="true" hint="这些是由登录向导设置的参数">
			<cfset var x = "4YB4B7U">
	  		<cfset var y = "U7B4BY4">
	    <cflogin>
		 <cfif NOT IsDefined("cflogin")>
			<cfif args.authLogin eq "challenge">
				<cfheader statuscode="401">
				<cfheader name="www-Authenticate" value="Basic realm=""MM Wizard #args.authtype# Authentication""">
			<cfelse>
			  	<cfinclude template="#args.loginform#">
			  </cfif>
			  <cfabort>
		 <cfelse>
		       <cftry>
			   <cfif args.authtype eq "NT">
				 <cfinvoke method="ntauth" 
					returnvariable="result" 
					nusername="#cflogin.name#" 
					npassword="#cflogin.password#" 
					ndomain="#args.domain#" >

					<cfelseif args.authtype eq "LDAP">
						<cfinvoke method="ldapauth" returnvariable="result"
						   lStart="#args.start#"
						   lServer="#args.server#"
						   lPort="#args.port#"
						   sUserName="#args.suser#"
						   sPassword="#args.spwd#"
						   sQueryString="#args.queryString#"
						   uUsername="#cflogin.name#"
						   uPassword="#cflogin.password#">					 
						</cfinvoke>
					<cfelseif args.authtype eq "Simple">
						<cfinvoke method="simpleauth" returnvariable="result"
							sUserName="#args.suser#"
							sPassword="#args.spwd#"					  					  
							uUserName="#cflogin.name#"
							uPassword="#hash(x&cflogin.password&y,'SHA-1')#">
						</cfinvoke>
					</cfif>					
				<cfcatch>
					<cfset loginFailed = true>
				<cfif args.authLogin eq "challenge">
					<cfheader statuscode="401">
					<cfheader name="www-Authenticate" value="Basic realm=""MM Wizard #args.authtype# Authentication""">
				<cfelse>
			  		<cfinclude template="#args.loginform#">
			  	</cfif>
					<cfabort>								
				</cfcatch>					
				</cftry>
			</cfif>
				<!--- validate if the user is authenticated --->
			   <cfif result.authenticated eq "YES">
			   			<!--- if authenticated --->
						<cfloginuser name="#cflogin.name#" password="#cflogin.password#" roles="#result.roles#">
					<cfelse>
						<!--- if not authenticated, return to login form with an error message --->
						<cfset loginFailed = true>
				<cfif args.authLogin eq "challenge">
					<cfheader statuscode="401">
					<cfheader name="www-Authenticate" value="Basic realm=""MM Wizard #args.authtype# Authentication""">
				<cfelse>
			  		<cfinclude template="#args.loginform#">
			  	</cfif>
					<cfabort>						
		   		</cfif>
		  </cflogin>
	  </cffunction>
	    <!---- ////////////////////////////////////////////////////--->
	  							<!--- Logout  --->
	    <!---- ////////////////////////////////////////////////////--->
		<cffunction name="logout" access="remote" output="true" hint="注销用户。">
		<cfargument name="logintype" type="string" required="yes" hint="用于登录的登录类型。">
			<cfif isDefined("form.logout")>
				<cflogout>
					<cfif arguments.logintype eq "challenge">
						<cfset foo = closeBrowser()>
					<cfelse>
						<!--- replace this URL to a page logged out users should see --->
						<cflocation url="http://www.macromedia.com">
					</cfif>
			</cfif>
		</cffunction>
		
		 <!---- ////////////////////////////////////////////////////--->
	  							<!--- Close Browser  --->
			<!--- To ensure the header authentication information --->
			<!--- has been thouroughly flushed the browser should be closed --->
	    <!---- ////////////////////////////////////////////////////--->
		<cffunction name="closeBrowser" access="public" output="true" hint="关闭浏览器以清除标头信息。">
			<script language="javascript">
				if(navigator.appName == "Microsoft Internet Explorer") {
					alert("浏览器即将关闭以完成注销。");
					window.close();
				}
				 if(navigator.appName == "Netscape") {
					alert("要完成注销，您必须关闭此浏览器。");
			   }
			</script>
		</cffunction>
</cfcomponent>
