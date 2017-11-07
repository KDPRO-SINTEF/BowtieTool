package com.mxgraph.examples.web.repository;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Properties;

import javax.sql.rowset.CachedRowSet;

import com.sun.rowset.CachedRowSetImpl;

public class MySQLAccess {
	private String dburi;
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

		connection = DriverManager.getConnection(dburi);
		if (connection != null) {
			System.out.println("Database connection opened");
		} else {
			System.out.println("Failed to make connection!");
		}
	}

	public void close()  {
		try {
			if (connection != null) {
				connection.close();
			}
			System.out.println("Database connection closed");
		} catch (Exception e) {
			System.err.println("Database error: " + e.getMessage());
		}
	}

	private void readConfig() {
		Properties prop = new Properties();
		InputStream input = null;

		try {

			//String filename = "G:\\git\\BowtieTool\\mxgraph\\javascript\\examples\\grapheditor\\java\\src\\repository\\config.properties";
			//input = new FileInputStream(new File(filename));
			String filename = "config.properties";
			input = MySQLAccess.class.getClassLoader().getResourceAsStream(filename);
			if (input == null) {
				System.out.println("Sorry, unable to find " + filename);
				return;
			}

			// load a properties file
			prop.load(input);
			dburi = prop.getProperty("dburi");

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

	private static void setValues(PreparedStatement preparedStatement, Object... values) throws SQLException {
		for (int i = 0; i < values.length; i++) {
			preparedStatement.setObject(i + 1, values[i]);
		}
	}

	public CachedRowSet query(String query, Object... values) {
		CachedRowSet cachedRowSet = null;
		try {
			getConnection();
			cachedRowSet = manual_query(query, values);
		} catch (SQLException e) {
			System.err.println("SQL error: Query: " + query + " failed with message " + e.getMessage());
		} finally {
			close();
		}
		return cachedRowSet;
	}
	
	public CachedRowSet manual_query(String query, Object...values) throws SQLException {
		if (connection == null) {
			throw new IllegalStateException();
		}
		
		PreparedStatement preparedStatement = connection.prepareStatement(query);
		CachedRowSet cachedRowSet = new CachedRowSetImpl();
		
		setValues(preparedStatement, values);
		if (preparedStatement.execute()) {
			cachedRowSet.populate(preparedStatement.getResultSet());
		}

		return cachedRowSet;
	}
}