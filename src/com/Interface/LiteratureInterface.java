package com.Interface;

import java.sql.Connection;
import java.sql.PreparedStatement;

import com.Util.DbUtil;
import com.model.Literature;

public class LiteratureInterface{
    public boolean addLiterature(Literature literature){
        String username=literature.getusername();
        String password=literature.getpassword();
        String email=literature.getemail();
       

        DbUtil db=new DbUtil();
        try {
            String sql="INSERT INTO user(id,password,email,num) VALUES (?,?,?,1)";
            Connection conn=db.getCon();
            PreparedStatement ps=conn.prepareStatement(sql);
            ps.setString(1, username);
            ps.setString(2, password);
            ps.setString(3, email);
            ps.executeUpdate();
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return true;

    }
}