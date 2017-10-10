package repository;

import java.util.List;

import models.Graph;
import models.User;

public interface IGraphRepository {
	public void insertGraph(User u, String graph_data, String title, String description);
	public void updateGraph(Graph g);
	public List<Graph> getUserGraphs(User u);
	public Graph getUserGraph(User u, int id);
}
