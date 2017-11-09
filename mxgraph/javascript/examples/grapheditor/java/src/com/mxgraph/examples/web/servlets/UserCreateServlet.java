package com.mxgraph.examples.web.servlets;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.mxgraph.examples.web.repository.IUserRepository;

public class UserCreateServlet extends HttpServlet {

  /** */
  private static final long serialVersionUID = -1983280837215922034L;

  private IUserRepository userRepo;

  public UserCreateServlet(IUserRepository userRepo) {
    this.userRepo = userRepo;
  }

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse response)
      throws ServletException, IOException {
    JsonObject json = new Gson().fromJson(req.getReader(), JsonObject.class);

    String username = null;
    try {
      JsonElement j = json.get("username");
      if (j != null) {
        username = j.getAsString();
      }
    } catch (ClassCastException e) {
      System.out.println("Illegal value received: " + e.getMessage());
    }

    String fullname = null;
    try {
      JsonElement j = json.get("fullname");
      if (j != null) {
        fullname = j.getAsString();
      }
    } catch (ClassCastException e) {
      System.out.println("Illegal value received: " + e.getMessage());
    }

    String password = null;
    try {
      JsonElement j = json.get("password");
      if (j != null) {
        password = j.getAsString();
      }
    } catch (ClassCastException e) {
      System.out.println("Illegal value received: " + e.getMessage());
    }

    if (username == null || fullname == null || password == null) {
      // These fields must be specified
      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      response.getOutputStream().flush();
      response.getOutputStream().close();
      return;
    }

    // Needs more checks here, username *must* be unique, and createUser will error out somehow
    // if this isn't the case.
    if (userRepo.getUserByUsername(username) != null) {
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      response.getOutputStream().flush();
      response.getOutputStream().close();
      return;
    }

    // This isn't really good, as we don't know for certain whether the user was created or not.
    // The MySQLAccess swallows the exception, and we can't know at this level if an error
    // actually occurred.
    userRepo.createUser(username, fullname, password);
    response.setStatus(HttpServletResponse.SC_OK);
    response.getOutputStream().flush();
    response.getOutputStream().close();
  }
}
