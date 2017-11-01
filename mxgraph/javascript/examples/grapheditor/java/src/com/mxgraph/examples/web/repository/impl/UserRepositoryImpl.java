package com.mxgraph.examples.web.repository.impl;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Base64;
import java.util.UUID;

import com.mxgraph.examples.web.models.User;
import com.mxgraph.examples.web.repository.IUserRepository;
import com.mxgraph.examples.web.repository.MySQLAccess;

public class UserRepositoryImpl implements IUserRepository{
	private final int SALT_SIZE = 16;
	private MySQLAccess access;

	public UserRepositoryImpl(MySQLAccess access) {
		this.access = access;
	}

	private String hash_pw(String password) {
		SecureRandom random = new SecureRandom();
		byte[] salt = new byte[SALT_SIZE];
		random.nextBytes(salt);

		MessageDigest d;
		byte[] tmp = null;
		try {
			d = MessageDigest.getInstance("SHA-256");
			d.update(salt);
			d.update(password.getBytes());
			byte[] hash = d.digest();

			tmp = new byte[salt.length + hash.length];
			System.arraycopy(salt, 0, tmp, 0, salt.length);
			System.arraycopy(hash, 0, tmp, salt.length, hash.length);
		} catch (NoSuchAlgorithmException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return new String(Base64.getEncoder().encode(tmp));
	}
	
	@Override
	public User validateUser(String username, String password) {
		User user = null;
		String query = "SELECT id, hash_pw FROM User WHERE username = ?";
		try {
			ResultSet rs = access.query(query, username);
			while (rs.next()) {
				int id = rs.getInt("id");
				String hash_pw = rs.getString("hash_pw");
				byte[] bytes = Base64.getDecoder().decode(hash_pw);

				byte[] stored_salt = new byte[SALT_SIZE];
				byte[] stored_hash = new byte[bytes.length - stored_salt.length];
				System.arraycopy(bytes, 0, stored_salt, 0, stored_salt.length);
				System.arraycopy(bytes, stored_salt.length, stored_hash, 0, stored_hash.length);

				MessageDigest d = MessageDigest.getInstance("SHA-256");
				d.update(stored_salt);
				d.update(password.getBytes());
				byte[] calculated_hash = d.digest();

				if (stored_hash.length != calculated_hash.length) {
					return null;
				}

				for (int i = 0; i < stored_hash.length; i++) {
					if (stored_hash[i] != calculated_hash[i]) {
						return null;
					}
				}
				String token = UUID.randomUUID().toString();
				String update_token = "UPDATE User SET token = ? WHERE id = ?";
				access.query(update_token, token, id);
				user = this.getUserById(id);
			}
		} catch (SQLException e ) {
			System.out.println("SQL error: " + e.getMessage());
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
		return user;
	}

	@Override
	public void createUser(String username, String fullname, String password) {
		
		String insert_user = "INSERT User(username, fullname, hash_pw) VALUES (?, ?, ?);";
		access.query(insert_user, username, fullname, hash_pw(password));
	}

	@Override
	public void deleteUser(User user) {
		//XXX: Vi trenger noen constraints i skjemaet for dette, cascade osv.
		String insert_user = "DELETE FROM User WHERE id = ?;";
		access.query(insert_user, user.getId());
	}

	@Override
	public void updateUser(int id, String username, String fullname, String password) {
		// TODO Auto-generated method stub
		String update_user = "UPDATE User SET username = ?, fullname = ?, hash_pw = ? WHERE id = ?;";
		access.query(update_user, username, fullname, hash_pw(password), id);
	}

	@Override
	public User getUserById(int id) {
		User user = null;
		String query = "SELECT * FROM User WHERE id=?";
		try {
			ResultSet rs = access.query(query, id);
			while (rs.next()) {
				String username = rs.getString("username");
				String fullname = rs.getString("fullname");
				String hash_pw = rs.getString("hash_pw");
				String token = rs.getString("token");
				user = new User(id, username, fullname, hash_pw, token);
			}
		} catch (SQLException e ) {
			System.out.println("SQL error: " + e.getMessage());
		}
		return user;
	}

	@Override
	public User getUserByToken(String token) {
		User user = null;
		String query = "SELECT * FROM User WHERE token=?";
		try {
			ResultSet rs = access.query(query, token);
			while (rs.next()) {
				int user_id = rs.getInt("id");
				String username = rs.getString("username");
				String fullname = rs.getString("fullname");
				String hash_pw = rs.getString("hash_pw");
				user = new User(user_id, username, fullname, hash_pw, token);
			}
		} catch (SQLException e ) {
			System.out.println("SQL error: " + e.getMessage());
		}
		return user;
	}

	@Override
	public User getUserByUsername(String username) {
		User user = null;
		String query = "SELECT * FROM User WHERE username=?";
		try {
			ResultSet rs = access.query(query, username);
			while (rs.next()) {
				String user_name = rs.getString("username");
				String fullname = rs.getString("fullname");
				String hash_pw = rs.getString("hash_pw");
				String token = rs.getString("token");
				int user_id = rs.getInt("id");
				user = new User(user_id, user_name, fullname, hash_pw, token);
			}
		} catch (SQLException e ) {
			System.out.println("SQL error: " + e.getMessage());
		}
		return user;
	}

}
