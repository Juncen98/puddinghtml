<%@ page language="java" import="java.util.*" pageEncoding="UTF-8" %>
<%@ page language="java" import="java.sql.*" %>
<%


				//String loginid =request.getParameter("loginid");
				//String loginpassword =request.getParameter("loginpassword");
				String loginid = "zjc1998";
				String loginpassword ="zjc19980904";
				
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
  								   {%>
  									 
  										<script>
 								   			 window.location= "../user/unregister.html";
 										</script>
									
  								    <%}
  								   else if(getpassword.equals(loginpassword))
 									{ %>
 										
  									 <script>
 								   			 window.location = "../user/sucess.html";
 									</script>
 									<%}
 									else 
 										 %>	
 										<script>
 										window.location = "../user/fault.html";
 										</script>
 										
 	 		 				
 											
 	
 