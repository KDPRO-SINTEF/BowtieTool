package models;

import java.util.Date;

public class Graph {
	private int id;
	private User user;
	private String graph_data;
	private String title;
	private String description;
	private Date created;
	private Date last_modified;

	public Graph(int id, User user, String graph_data, String title, String description) {
		this.id = id;
		this.user = user;
		this.graph_data = graph_data;
		this.title = title;
		this.description = description;
	}
	
	public Graph(int id, User user, String graph_data, String title, String description, Date created, Date last_modified) {
		this.id = id;
		this.user = user;
		this.graph_data = graph_data;
		this.title = title;
		this.description = description;
		this.created = created;
		this.last_modified = last_modified;
	}

	public int getId() {
		return id;
	}

	public User getUser() {
		return user;
	}

	public String getGraph_data() {
		return graph_data;
	}

	public String getTitle() {
		return title;
	}

	public String getDescription() {
		return description;
	}

	public Date getCreated() {
		return created;
	}

	public Date getLast_modified() {
		return last_modified;
	}
}
