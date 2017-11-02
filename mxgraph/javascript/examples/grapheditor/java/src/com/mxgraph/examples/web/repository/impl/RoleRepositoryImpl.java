package com.mxgraph.examples.web.repository.impl;

import java.sql.ResultSet;
import java.sql.SQLException;

import com.mxgraph.examples.web.models.Graph;
import com.mxgraph.examples.web.models.Role;
import com.mxgraph.examples.web.models.User;
import com.mxgraph.examples.web.repository.IRoleRepository;
import com.mxgraph.examples.web.repository.MySQLAccess;

public class RoleRepositoryImpl implements IRoleRepository {
	private MySQLAccess access;

	public RoleRepositoryImpl(MySQLAccess access) {
		this.access = access;
	}
	
	@Override
	public void insertRole(Role r) {
		String query = "INSERT INTO Role(id, user_id, role) VALUES (?, ?, ?);";
		access.query(query, r.getGraph().getId(), r.getUser().getId(), r.getRole().ordinal());
	}

	@Override
	public void updateRole(Role r) {
		String query = "UPDATE Role SET role = ? WHERE id = ? AND user_id = ?";
		access.query(query, r.getRole().ordinal(), r.getGraph().getId(), r.getUser().getId());
	}

	@Override
	public Role getUserRoleForGraph(Graph g, User u) {
		Role role = null;
		String query = "SELECT * FROM Role WHERE id=? AND user_id=?;";
		try {
			ResultSet rs = access.query(query, g.getId(), u.getId());
			while (rs.next()) {
				int r = rs.getInt("role");
				role = new Role(u, g, r);
			}
		} catch (SQLException e) {
			System.out.println("SQL error: " + e.getMessage());
		}
		return role;
	}
}
