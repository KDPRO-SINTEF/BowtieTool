package repository;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import models.User;

public class UserRepositoryImpl implements IUserRepository{
	private MySQLAccess access;

	public UserRepositoryImpl(MySQLAccess access) {
		this.access = access;
	}

	@Override
	public void createUser(User user) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void deleteUser(User user) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void updateUser(User user) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public User getUserById(int id) {
		   User user = null;
		   String query = "select * from  KPRO.User where id = ?;";
		    try {
		    	ResultSet rs = access.query(query,id);
		        while (rs.next()) {
		            int user_id = rs.getInt("id");
		            String username = rs.getString("username");
		            String hash_pw = rs.getString("hash_pw");
		            user = new User(id, username, hash_pw);
		            System.out.println(username);
		        }
		    } catch (SQLException e ) {
		        System.out.println("Quering form db failed");
		    }
		   return user;
	}
	
}
