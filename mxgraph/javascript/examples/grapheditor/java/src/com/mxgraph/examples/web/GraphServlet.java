package com.mxgraph.examples.web;

import java.io.IOException;
import java.io.OutputStream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import models.Graph;
import models.Role;
import models.User;
import repository.IGraphRepository;
import repository.IRoleRepository;
import repository.IUserRepository;

/**
 * Servlet implementation class ImageServlet.
 */
public class GraphServlet extends HttpServlet
{

	private static final long serialVersionUID = -5040708166131034516L;
	private IUserRepository userRepo;
	private IGraphRepository graphRepo;
	private IRoleRepository roleRepo;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public GraphServlet(IUserRepository userRepo, IGraphRepository graphRepo, IRoleRepository roleRepo)
	{
		super();
		this.userRepo = userRepo;
		this.graphRepo = graphRepo;
		this.roleRepo = roleRepo;
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
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
			// User isn't authorized
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.getOutputStream().flush();
			response.getOutputStream().close();
			return;
		}

		Graph graph = graphRepo.getUserGraph(user, Integer.parseInt(graphid));
		response.setContentType("application/json");
		response.setStatus(HttpServletResponse.SC_OK);
		OutputStream out = response.getOutputStream();
		out.write(new Gson()
				.toJsonTree(graph)
				.getAsJsonObject()
				.toString().getBytes("UTF-8")
		);
		out.flush();
		out.close();
	}

	/**
	 * Handles exceptions and the output stream buffer.
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		try
		{
			if (request.getContentLength() < Constants.MAX_REQUEST_SIZE)
			{
				long t0 = System.currentTimeMillis();

				handleRequest(request, response);

				long mem = Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory();
				long dt = System.currentTimeMillis() - t0;

				System.out.println("save: ip=" + request.getRemoteAddr() + " ref=\"" + request.getHeader("Referer") + "\" length="
						+ request.getContentLength() + " mem=" + mem + " dt=" + dt);
			}
			else
			{
				response.setStatus(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
			}
		}
		catch (OutOfMemoryError e)
		{
			e.printStackTrace();
			final Runtime r = Runtime.getRuntime();
			System.out.println("r.freeMemory() = " + r.freeMemory() / 1024.0 / 1024);
			System.out.println("r.totalMemory() = " + r.totalMemory() / 1024.0 / 1024);
			System.out.println("r.maxMemory() = " + r.maxMemory() / 1024.0 / 1024);
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
		}
		catch (Exception e)
		{
			e.printStackTrace();
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
		}
		finally
		{
			response.getOutputStream().flush();
			response.getOutputStream().close();
		}
	}

	/**
	 * Gets the parameters and logs the request.
	 * 
	 */
	protected void handleRequest(HttpServletRequest request, HttpServletResponse response) throws Exception
	{
		// Parses parameters
		JsonObject json = new Gson().fromJson(request.getReader(), JsonObject.class);
		
		String graphid = json.get("id") == null ? null : json.get("id").getAsString();
		String logintoken = json.get("token") == null ? null : json.get("token").getAsString();;
		String title = json.get("title") == null ? null : json.get("title").getAsString();
		String description = json.get("description") == null ? null : json.get("description").getAsString();
		String xml = json.get("graph_data") == null ? null : json.get("graph_data").getAsString();
		
		System.out.println("Graph id " + graphid + " Token " + logintoken  + " Title " + title + " Description "+ description + " Graph data " + xml);
		
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

		if (graphid == null) {
			// Graph doesn't exist yet, we need to create it.
			int id = graphRepo.insertGraph(user, xml, title, description);
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
		Graph g = new Graph(Integer.parseInt(graphid), user, xml, title, description);
		Role r = roleRepo.getUserRoleForGraph(g, user);

		if (r == null || r.getRole() != 0) {
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
