package repository;

import models.Graph;
import models.Role;
import models.User;

public interface IRoleRepository {
	public void insertRole(Role r);
	public void updateRole(Role r);
	public Role getUserRoleForGraph(Graph g, User u);
}
