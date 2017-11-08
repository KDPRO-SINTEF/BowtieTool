package com.mxgraph.examples.web.servlets;

import java.io.IOException;
import java.io.OutputStream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.mxgraph.examples.web.Constants;
import com.mxgraph.examples.web.models.Graph;
import com.mxgraph.examples.web.models.Role;
import com.mxgraph.examples.web.models.Role.GraphRole;
import com.mxgraph.examples.web.models.User;
import com.mxgraph.examples.web.repository.IGraphRepository;
import com.mxgraph.examples.web.repository.IRoleRepository;
import com.mxgraph.examples.web.repository.IUserRepository;

/** Servlet implementation class GraphServlet. */
public class GraphServlet extends HttpServlet {

  private static final long serialVersionUID = -5040708166131034516L;
  private IUserRepository userRepo;
  private IGraphRepository graphRepo;
  private IRoleRepository roleRepo;

  /** @see HttpServlet#HttpServlet() */
  public GraphServlet(
      IUserRepository userRepo, IGraphRepository graphRepo, IRoleRepository roleRepo) {
    super();
    this.userRepo = userRepo;
    this.graphRepo = graphRepo;
    this.roleRepo = roleRepo;
  }

  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    String graphid = request.getParameter("id");
    String logintoken = request.getParameter("token");

    if (graphid == null || logintoken == null) {
      // User must provide graphid and token
      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      response.getOutputStream().flush();
      response.getOutputStream().close();
      return;
    }

    User user = userRepo.getUserByToken(logintoken);
    if (user == null) {
      // User isn't authenticated
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      response.getOutputStream().flush();
      response.getOutputStream().close();
      return;
    }

    Graph graph = graphRepo.getGraphById(Integer.parseInt(graphid));
    if (graph == null) {
      // Specified graph doesn't exist
      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      response.getOutputStream().flush();
      response.getOutputStream().close();
      return;
    }

    Role r = roleRepo.getUserRoleForGraph(graph, user);
    if (r == null && (!graph.is_public() && !graph.is_template())) {
      // This will trigger when user doesn't have any role for the specified graph, in addition
      // to the graph not being public nor a template.
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      response.getOutputStream().flush();
      response.getOutputStream().close();
      return;
    }

    response.setContentType("application/json");
    response.setStatus(HttpServletResponse.SC_OK);
    OutputStream out = response.getOutputStream();
    JsonObject json = new Gson().toJsonTree(graph).getAsJsonObject();
    json.addProperty("role", r == null ? GraphRole.BYPASS.ordinal() : r.getRole().ordinal());
    out.write(json.toString().getBytes("UTF-8"));
    out.flush();
    out.close();
  }

  /** Handles exceptions and the output stream buffer. */
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    try {
      if (request.getContentLength() < Constants.MAX_REQUEST_SIZE) {
        long t0 = System.currentTimeMillis();

        handleRequest(request, response);

        long mem = Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory();
        long dt = System.currentTimeMillis() - t0;

        System.out.println(
            "save: ip="
                + request.getRemoteAddr()
                + " ref=\""
                + request.getHeader("Referer")
                + "\" length="
                + request.getContentLength()
                + " mem="
                + mem
                + " dt="
                + dt);
      } else {
        response.setStatus(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
      }
    } catch (OutOfMemoryError e) {
      e.printStackTrace();
      final Runtime r = Runtime.getRuntime();
      System.out.println("r.freeMemory() = " + r.freeMemory() / 1024.0 / 1024);
      System.out.println("r.totalMemory() = " + r.totalMemory() / 1024.0 / 1024);
      System.out.println("r.maxMemory() = " + r.maxMemory() / 1024.0 / 1024);
      response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    } catch (Exception e) {
      e.printStackTrace();
      response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    } finally {
      response.getOutputStream().flush();
      response.getOutputStream().close();
    }
  }

  /** Gets the parameters and logs the request. */
  protected void handleRequest(HttpServletRequest request, HttpServletResponse response)
      throws Exception {
    // Parses parameters
    JsonObject json = new Gson().fromJson(request.getReader(), JsonObject.class);

    int graphid = -1;
    try {
      JsonElement j = json.get("id");
      if (j != null) {
        graphid = j.getAsInt();
      }
    } catch (ClassCastException e) {
      System.out.println("Illegal value received: " + e.getMessage());
    }

    String logintoken = null;
    try {
      JsonElement j = json.get("token");
      if (j != null) {
        logintoken = j.getAsString();
      }
    } catch (ClassCastException e) {
      System.out.println("Illegal value received: " + e.getMessage());
    }

    String title = null;
    try {
      JsonElement j = json.get("title");
      if (j != null) {
        title = j.getAsString();
      }
    } catch (ClassCastException e) {
      System.out.println("Illegal value received: " + e.getMessage());
    }

    String description = null;
    try {
      JsonElement j = json.get("description");
      if (j != null) {
        description = j.getAsString();
      }
    } catch (ClassCastException e) {
      System.out.println("Illegal value received: " + e.getMessage());
    }

    boolean is_public = false;
    try {
      JsonElement j = json.get("is_public");
      if (j != null) {
        is_public = j.getAsBoolean();
      }
    } catch (ClassCastException e) {
      System.out.println("Illegal value received: " + e.getMessage());
    }

    String xml = null;
    try {
      JsonElement j = json.get("graph_data");
      if (j != null) {
        xml = j.getAsString();
      }
    } catch (ClassCastException e) {
      System.out.println("Illegal value received: " + e.getMessage());
    }

    System.out.println(
        "Graph id "
            + graphid
            + " Token "
            + logintoken
            + " Title "
            + title
            + " Description "
            + description
            + " Graph data "
            + xml);

    if (logintoken == null || title == null || xml == null) {
      // User must specify these fields
      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      response.getOutputStream().flush();
      response.getOutputStream().close();
      return;
    }

    User user = userRepo.getUserByToken(logintoken);
    if (user == null) {
      // User isn't authorized
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      response.getOutputStream().flush();
      response.getOutputStream().close();
      return;
    }

    if (graphid == -1) {
      // Graph doesn't exist yet, we need to create it.
      int id = graphRepo.insertGraph(user, xml, title, description, is_public);
      response.setContentType("application/json");
      response.setStatus(HttpServletResponse.SC_OK);
      OutputStream out = response.getOutputStream();
      JsonObject a = new JsonObject();
      a.addProperty("id", id);
      out.write(a.toString().getBytes("UTF-8"));
      out.flush();
      out.close();
      return;
    }

    // Graph already exists in db, we need to check if we're allowed to change it.
    Graph g = new Graph(graphid, xml, title, description, is_public);
    Role r = roleRepo.getUserRoleForGraph(g, user);

    if (r == null || r.getRole() != GraphRole.OWNER) {
      // This isn't User's graph, we cannot update.
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      response.getOutputStream().flush();
      response.getOutputStream().close();
      return;
    }

    graphRepo.updateGraph(g);
    response.setStatus(HttpServletResponse.SC_OK);
    response.getOutputStream().flush();
    response.getOutputStream().close();
  }
}
