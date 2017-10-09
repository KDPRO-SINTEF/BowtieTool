package repository;

import models.Graph;

public interface IGraphRepository {
    public void createGraph(String user_token, String xml_data);
    public Graph getGraphById(int id);
    public Graph getGraphsByUserToken(int id);
}
