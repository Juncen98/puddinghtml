<cfparam name="loginFailed" type="boolean" default="false"><!--- if this page get included because the user type in the wrong user name or password, but up an error message ---><cfif loginFailed>	<ul>		<li style="color: #FF0000;">Your login information is not valid. Please try again"</li>	</ul></cfif><!--- This is the login form, you can change the font and color etc but please keep the username and password input names the same ---><cfoutput><H2>Please Login using #args.authtype# authentication.</H2>   <cfform  name="loginform" action="#CGI.script_name#?#CGI.query_string#" method="Post">      <table>         <tr>            <td>username:</td>            <td><cfinput type="text" name="j_username" required="yes" message="A username is required"></td>         </tr>         <tr>            <td>password:</td>            <td><cfinput type="password" name="j_password" required="yes" message="A password is required"></td>         </tr>		       	 </table>      <br>      <input type="submit" value="Log In">   </cfform></cfoutput>