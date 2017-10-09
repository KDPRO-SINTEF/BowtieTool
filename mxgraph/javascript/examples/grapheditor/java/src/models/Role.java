package models;

public class Role {
	private User user;
	private Graph graph; 
	private int role;

	public Role(User user, Graph graph, int role) {
		this.user = user;
		this.graph = graph;
		this.role = role;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}
	public Graph getGraph() {
		return graph;
	}
	public void setGraph(Graph graph) {
		this.graph = graph;
	}
	public int getRole() {
		return role;
	}
	public void setRole(int role) {
		this.role = role;
	}
}
