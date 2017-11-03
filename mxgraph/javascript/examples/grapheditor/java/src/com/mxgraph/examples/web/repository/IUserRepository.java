package com.mxgraph.examples.web.repository;

import com.mxgraph.examples.web.models.User;

public interface IUserRepository {
	public void createUser(String username, String fullname, String password);
	public void deleteUser(User user);
	public void updateUser(int id, String username, String fullname, String password);
	public User validateUser(String username, String password);
	public User getUserById(int id);
	public User getUserByUsername(String username);
	public User getUserByToken(String token);
}
