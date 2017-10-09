package repository;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Properties;

import javax.sql.rowset.CachedRowSet;

import com.sun.rowset.CachedRowSetImpl;

public class MySQLAccess {
	private String serverName;
	private String password;
	private String username;
	private int portNumber = 3306;
	private Connection connection;
	
	public MySQLAccess() {
		readConfig();
	}

	public void getConnection() throws SQLException {
		try {
			Class.forName("com.mysql.jdbc.Driver");
		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}


		connection = DriverManager.getConnection(
		        "jdbc:mysql://" + this.serverName + ":" + this.portNumber + "?useSSL=false",
				username,
				password
		);
		if (connection != null) {
			System.out.println("You made it, take control your database now!");
		} else {
			System.out.println("Failed to make connection!");
		}
	}

    private void close()  {
        try {
            if (connection != null) {
            	connection.close();
            }
            System.out.println("Closed all connections");
        } catch (Exception e) {

        }
    }
    
    public void readConfig() {
    	Properties prop = new Properties();
    	InputStream input = null;

    	try {

    		String filename = "config.properties";
    		input = MySQLAccess.class.getClassLoader().getResourceAsStream(filename);
    		if(input==null){
    	            System.out.println("Sorry, unable to find " + filename);
    		    return;
    		}

    		// load a properties file
    		prop.load(input);

    		serverName = prop.getProperty("database");
    		password = prop.getProperty("dbpassword");
    		username = prop.getProperty("dbuser");

    	} catch (IOException ex) {
    		ex.printStackTrace();
    	} finally {
    		if (input != null) {
    			try {
    				input.close();
    			} catch (IOException e) {
    				e.printStackTrace();
    			}
    		}
    	}
	}

    public static void setValues(PreparedStatement preparedStatement, Object... values) throws SQLException {
        for (int i = 0; i < values.length; i++) {
            preparedStatement.setObject(i + 1, values[i]);
        }
    }
    
	public CachedRowSet query(String query, Object... values) {
		PreparedStatement preparedStatement = null;
		ResultSet rs = null;
		CachedRowSet cachedRowSet = null;
		try {
			getConnection();
			cachedRowSet = new CachedRowSetImpl();
			preparedStatement = connection.prepareStatement(query);
			setValues(preparedStatement, values);

			rs = preparedStatement.executeQuery();
			cachedRowSet.populate(rs);
		} catch (SQLException e) {

		} finally {
			close();
		}
		return cachedRowSet;

	}

}
