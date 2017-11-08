package com.mxgraph.examples.web.servlets;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.mxgraph.examples.web.models.Graph;
import com.mxgraph.examples.web.models.User;
import com.mxgraph.examples.web.repository.IGraphRepository;
import com.mxgraph.examples.web.repository.IUserRepository;

/** Servlet implementation class TemplateGraphServlet. */
public class TemplateGraphServlet extends HttpServlet {

  private static final long serialVersionUID = -5040708166131034516L;
  private IUserRepository userRepo;
  private IGraphRepository graphRepo;

  /** @see HttpServlet#HttpServlet() */
  public TemplateGraphServlet(IUserRepository userRepo, IGraphRepository graphRepo) {
    super();
    this.userRepo = userRepo;
    this.graphRepo = graphRepo;
  }

  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    String logintoken = request.getParameter("token");

    if (logintoken == null) {
      // User must provide token
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

    List<Graph> templates = graphRepo.getTemplateGraphs();

    response.setContentType("application/json");
    response.setStatus(HttpServletResponse.SC_OK);
    OutputStream out = response.getOutputStream();
    JsonArray json = new Gson().toJsonTree(templates).getAsJsonArray();
    out.write(json.toString().getBytes("UTF-8"));
    out.flush();
    out.close();
  }
}
