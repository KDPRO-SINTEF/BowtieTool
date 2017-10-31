package com.mxgraph.examples.web.models;

public class Role {
	public enum Access {
		OWNER,
		READONLY,
		TEMPLATE
	}
	
	private transient User user;
	private transient Graph graph; 
	private Access role;

	public Role(User user, Graph graph, int role) {
		this.user = user;
		this.graph = graph;
		this.role = Access.values()[role];
	}

	public User getUser() {
		return user;
	}

	public Graph getGraph() {
		return graph;
	}

	public Access getRole() {
		return role;
	}
}
