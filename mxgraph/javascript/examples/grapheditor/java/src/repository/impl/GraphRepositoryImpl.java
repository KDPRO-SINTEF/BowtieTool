package repository.impl;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import models.Graph;
import models.User;
import repository.IGraphRepository;
import repository.MySQLAccess;

public class GraphRepositoryImpl implements IGraphRepository {
	private MySQLAccess access;

	public GraphRepositoryImpl(MySQLAccess access) {
		this.access = access;
	}

	@Override
	public int insertGraph(User u, String graph_data, String title, String description) {
		String insert_graph = "INSERT INTO Graph(user_id, graph_data, title, description,"
				+ "                            created, last_modified)"
				+ "                 VALUES (?, ?, ?, ?, NOW(), NOW())";
		String select_id = "SELECT LAST_INSERT_ID() AS id;";
		String insert_role = "INSERT INTO Role(id, user_id, role) VALUES (?, ?, 0)";
		int id = -1;
		try {
			access.getConnection();
			access.manual_query(insert_graph, u.getId(), graph_data, title, description);
			ResultSet rs = access.manual_query(select_id);
			while (rs.next()) {
				id = rs.getInt("id");
				access.manual_query(insert_role, id, u.getId());
			}
		} catch (SQLException e) {
			System.err.println("SQL error " + e.getMessage());
		} finally {
			access.close();
		}
		return id;
	}

	@Override
	public void updateGraph(Graph g) {
		String update_graph = "UPDATE Graph"
				+ "               SET graph_data = ?,"
				+ "                   title = ?,"
				+ "                   description = ?,"
				+ "                   last_modified = NOW()"
				+ "             WHERE id = ?";
		access.query(update_graph, g.getGraph_data(), g.getTitle(), g.getDescription(), g.getId());
	}

	@Override
	public List<Graph> getUserGraphs(User u) {
		List<Graph> graphs = new ArrayList<Graph>();
		String query = "SELECT graph_data, id, title, description, created, last_modified"
				+ "       FROM Graph"
				+ "            LEFT JOIN Role"
				+ "            ON Graph.id = Role.id AND Graph.user_id = Role.user_id"
				+ "      WHERE Graph.user_id = ?";
		try {
			ResultSet rs = access.query(query, u.getId());
			while (rs.next()) {
				int id = rs.getInt("id");
				String graph_data = rs.getString("graph_data");
				String title = rs.getString("title");
				String description = rs.getString("description");
				Date created = rs.getDate("created");
				Date last_modified = rs.getDate("last_modified");
				graphs.add(new Graph(id, u, graph_data, title, description, created, last_modified));
			}
		} catch (SQLException e ) {
			System.out.println("SQL error: " + e.getMessage());
		}
		return graphs;
	}

	@Override
	public Graph getUserGraph(User u, int id) {
		Graph graph = null;
		String query = "SELECT graph_data, title, description, created, last_modified"
				+ "       FROM Graph"
				+ "            LEFT JOIN Role"
				+ "            ON Graph.id = Role.id AND Graph.user_id = Role.user_id"
				+ "      WHERE Graph.user_id = ?"
				+ "            AND Graph.id = ?";
		try {
			ResultSet rs = access.query(query, u.getId(), id);
			while (rs.next()) {
				String graph_data = rs.getString("graph_data");
				String title = rs.getString("title");
				String description = rs.getString("description");
				Date created = rs.getDate("created");
				Date last_modified = rs.getDate("last_modified");
				graph = new Graph(id, u, graph_data, title, description, created, last_modified);
			}
		} catch (SQLException e) {
			System.out.println("SQL error: " + e.getMessage());
		}
		return graph;
	}

}
