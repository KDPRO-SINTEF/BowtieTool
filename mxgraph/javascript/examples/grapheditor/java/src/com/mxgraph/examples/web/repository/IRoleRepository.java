package com.mxgraph.examples.web.repository;

import com.mxgraph.examples.web.models.Graph;
import com.mxgraph.examples.web.models.Role;
import com.mxgraph.examples.web.models.User;

public interface IRoleRepository {
  public void insertRole(Role r);

  public void updateRole(Role r);

  public Role getUserRoleForGraph(Graph g, User u);
}
