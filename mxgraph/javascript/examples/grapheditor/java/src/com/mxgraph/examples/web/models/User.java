package com.mxgraph.examples.web.models;

import java.util.Objects;

public class User {
  private int id;
  private String username;
  private String fullname;
  private transient String hash_pw;
  private String token = null;

  public User(int id, String username, String fullname, String hash_pw) {
    this.id = id;
    this.username = username;
    this.fullname = fullname;
    this.hash_pw = hash_pw;
  }

  public User(int id, String username, String fullname, String hash_pw, String token) {
    this.id = id;
    this.username = username;
    this.fullname = fullname;
    this.hash_pw = hash_pw;
    this.token = token;
  }

  public int getId() {
    return id;
  }

  public void setId(int id) {
    this.id = id;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getFullname() {
    return fullname;
  }

  public void setFullname(String fullname) {
    this.fullname = fullname;
  }

  public String getHash_pw() {
    return hash_pw;
  }

  public void setHash_pw(String hash_pw) {
    this.hash_pw = hash_pw;
  }

  public String getToken() {
    return token;
  }

  public void setToken(String token) {
    this.token = token;
  }

  @Override
  public boolean equals(Object other) {
    return this.id == ((User) other).id;
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, username, token);
  }
}
