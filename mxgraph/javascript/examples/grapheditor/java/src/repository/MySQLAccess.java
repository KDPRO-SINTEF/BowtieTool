package repository;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import models.User;

public class MySQLAccess {
	private String serverName = "kprodb.cy5oybncucgm.us-east-1.rds.amazonaws.com";
	private String password; 
	private String username;
	private int portNumber = 3306;
	private Connection connection;
	
	public MySQLAccess(String password, String username) {
		this.password = password;
		this.username = username;
	}
	
	public Connection getConnection() throws SQLException {
		connection = DriverManager.getConnection(
	                   "jdbc:" + "mysql" + "://" +
	                   this.serverName +
	                   ":" + this.portNumber+"?useSSL=false",
	                   username, password);	
	
		if (connection != null) {
			System.out.println("You made it, take control your database now!");
		} else {
			System.out.println("Failed to make connection!");
		}
		return connection;
	}
	
	public void closeConnection() throws SQLException {
		connection.close();
	}
	
	public ResultSet query(String query) throws SQLException {
		 Statement stmt = null;
		 ResultSet rs = null;
		    try {
		        stmt = connection.createStatement();
		        rs = stmt.executeQuery(query);
		   
		    } catch (SQLException e ) {
		        
		    } finally {
		        if (stmt != null) { 
		        	stmt.close(); }
		    }
			return rs;
	}
	


}
