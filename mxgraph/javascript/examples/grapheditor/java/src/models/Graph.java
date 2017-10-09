package models;

public class Graph {
    private int id;
    private User user;
    private String graph_data;
    
    public Graph(int id, User user, String graph_data) {
        this.id = id;
        this.user = user;
        this.graph_data = graph_data;
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
}
