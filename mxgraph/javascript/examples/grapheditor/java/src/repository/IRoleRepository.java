package repository;

import models.Graph;
import models.Role;
import models.User;

public interface IRoleRepository {
	public Role getUserRoleForGraph(Graph g, User u);
}
