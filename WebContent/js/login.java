package java.util.*;
package java.sql.*;



				String loginid =request.getParameter("loginid");
				String loginpassword =request.getParameter("loginpassword");
			//	String loginid = "zjc1998";
			//String loginpassword ="zjc19980904";
				
				Statement stmt = null;
 				String getpassword = null;
 								Connection conn=null;
   								Class.forName("com.mysql.jdbc.Driver");
   									 String url = "jdbc:mysql://localhost:3306/register";
 									   conn = DriverManager.getConnection(url,"root","zjc19980904");
  									  System.out.println("Success connect MySql server!");
 								   stmt = conn.createStatement();
 								   System.out.println(loginid);
 								   System.out.println(loginpassword);
 								   String sql = "select * from user where id = '"+loginid+"' ";
								   ResultSet rs = stmt.executeQuery(sql);//执行SQL并返回结果集
 									while(rs.next())
 									{
 										getpassword=rs.getString("password");
 									}	
 									conn.close();
 							//		System.out.println(loginid);
  								   System.out.println(getpassword);
  								   if(getpassword==null)
  								   {
  									 
  										<script>
 								   			 window.location.herf = "http://localhost:8080/hello/user/unregister.html";
 										</script>
									
  								    }
  								   else if(getpassword.equals(loginpassword))
 									{ 
 										
  									 <script>
 								   			 window.location.herf = "http://localhost:8080/hello/user/unregister.html";
 									</script>
 									}
 									else 
 										<script>
 										window.location.herf = "http://localhost:8080/hello/user/fault.html";
 										</script>
 										
 	 		 				
 											
 	
 