package com.mxgraph.examples.web.models;

import java.util.Date;

public class Graph {
  private int id;
  private String graph_data;
  private String title;
  private String description;
  private boolean is_public;
  private boolean is_template;
  private Date created;
  private Date last_modified;

  public Graph(int id, String graph_data, String title, String description, boolean is_public) {
    this.id = id;
    this.graph_data = graph_data;
    this.title = title;
    this.description = description;
    this.is_public = is_public;
  }

  public Graph(
      int id,
      String graph_data,
      String title,
      String description,
      boolean is_public,
      boolean is_template,
      Date created,
      Date last_modified) {
    this.id = id;
    this.graph_data = graph_data;
    this.title = title;
    this.description = description;
    this.is_public = is_public;
    this.is_template = is_template;
    this.created = created;
    this.last_modified = last_modified;
  }

  public int getId() {
    return id;
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

  public boolean is_public() {
    return is_public;
  }

  public boolean is_template() {
    return is_template;
  }

  public Date getCreated() {
    return created;
  }

  public Date getLast_modified() {
    return last_modified;
  }
}
