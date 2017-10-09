package repository;

import models.User;

public interface IUserRepository {
	public void createUser(User user);
	public void deleteUser(User user);
	public void updateUser(User user);
	public User getUserById(int id);
}
