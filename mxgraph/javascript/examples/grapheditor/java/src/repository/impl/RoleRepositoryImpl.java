package repository.impl;

import java.sql.ResultSet;
import java.sql.SQLException;

import models.Graph;
import models.Role;
import models.User;
import repository.IRoleRepository;
import repository.MySQLAccess;

public class RoleRepositoryImpl implements IRoleRepository {
	private MySQLAccess access;

	public RoleRepositoryImpl(MySQLAccess access) {
		this.access = access;
	}

	@Override
	public Role getUserRoleForGraph(Graph g, User u) {
		Role role = null;
		String query = "SELECT * FROM KPRO.Role WHERE id=? AND user_id=?;";
		try {
			ResultSet rs = access.query(query, g.getId(), u.getId());
			while (rs.next()) {
				int r = rs.getInt("role");
				role = new Role(u, g, r);
			}
		} catch (SQLException e) {
			System.out.println("Quering form db failed");
		}
		return role;
	}
}
