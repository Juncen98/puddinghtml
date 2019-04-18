<%@page import="java.sql.PreparedStatement"%>
<%@page import="java.sql.DriverManager"%>
<%@page import="java.sql.Connection"%>
<%@ page language="java" import="java.util.*" pageEncoding="utf-8"%>
<%
    //获取上一个页面传递过来的数据
    
 	 String id =request.getParameter("username");
	String password =request.getParameter("password");
	String email = request.getParameter("email");
//	String id ="12312311";
//	String password = "32412341";
//	String email = "j423123";
    Class.forName("com.mysql.jdbc.Driver");
    String url = "jdbc:mysql://localhost:3306/register";
    Connection conn = DriverManager.getConnection(url,"root","zjc19980904");
    System.out.println("Success connect MySql server!");
    System.out.println(id);
    System.out.println(password);
    System.out.println(email);
  //  System.out.println(json[email]);
    String sql = "insert into user(id,password,email,num) values(?, ?, ?, 1) ";
    PreparedStatement ps = conn.prepareStatement(sql);
 	ps.setString(1,id);
 	ps.setString(2,password);
 	ps.setString(3,email);
 	ps.executeUpdate();
 	//System.out.println(count);
    conn.close();

%>

<script>
//    window.location = "show.jsp";
</script>