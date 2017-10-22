package com.mxgraph.examples.web.repository;

import java.util.List;

import com.mxgraph.examples.web.models.Graph;
import com.mxgraph.examples.web.models.User;

public interface IGraphRepository {
	public int insertGraph(User u, String graph_data, String title, String description);
	public void updateGraph(Graph g);
	public List<Graph> getUserGraphs(User u);
	public Graph getUserGraph(User u, int id);
}
