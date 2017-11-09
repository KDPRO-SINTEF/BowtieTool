package no.ntnu.kundestyrt.bowtie.models;

public class Role {
  public enum GraphRole {
    OWNER,
    READONLY,
    BYPASS
  }

  private transient User user;
  private transient Graph graph;
  private GraphRole role;

  public Role(User user, Graph graph, int role) {
    this.user = user;
    this.graph = graph;
    this.role = GraphRole.values()[role];
  }

  public User getUser() {
    return user;
  }

  public Graph getGraph() {
    return graph;
  }

  public GraphRole getRole() {
    return role;
  }
}
