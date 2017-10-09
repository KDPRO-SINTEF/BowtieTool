package repository;

import models.User;

public interface IUserRepository {
	public void createUser(String username, String password);
	public void deleteUser(User user);
	public void updateUser(int id, String username, String password);
	public User getUserById(int id);
	public User getUserByToken(String token);
}
