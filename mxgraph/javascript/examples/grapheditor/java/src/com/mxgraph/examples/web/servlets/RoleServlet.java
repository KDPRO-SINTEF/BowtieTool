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

/**
 * Servlet implementation class RoleServlet.
 */
public class RoleServlet extends HttpServlet
{

	private static final long serialVersionUID = -5040708166131034512L;
	private IUserRepository userRepo;
	private IGraphRepository graphRepo;
	private IRoleRepository roleRepo;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public RoleServlet(IUserRepository userRepo, IGraphRepository graphRepo, IRoleRepository roleRepo)
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
			// User isn't authenticated
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.getOutputStream().flush();
			response.getOutputStream().close();
			return;
		}
		
		Graph g = graphRepo.getUserGraph(user, Integer.parseInt(graphid));
		if (g == null) {
			// This isn't User's graph, we cannot get role
			response.setStatus(HttpServletResponse.SC_FORBIDDEN);
			response.getOutputStream().flush();
			response.getOutputStream().close();
			return;
		}
		
		Role r = roleRepo.getUserRoleForGraph(g, user);
		if (r == null) {
			// This will trigger when user doesn't have any role for the specified graph.
			// Shouldn't really be triggered because we check for this earlier.
			// I've decided to include this check anyway since the SQL statements might change for
			// future revisions.
			response.setStatus(HttpServletResponse.SC_FORBIDDEN);
			response.getOutputStream().flush();
			response.getOutputStream().close();
			return;
		}
		
		response.setContentType("application/json");
		response.setStatus(HttpServletResponse.SC_OK);
		OutputStream out = response.getOutputStream();
		JsonObject a = new JsonObject();
		a.addProperty("role", r.getRole().ordinal());
		out.write(a.toString().getBytes("UTF-8"));
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

				System.out.println("role: ip=" + request.getRemoteAddr() + " ref=\"" + request.getHeader("Referer") + "\" length="
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
		
		int role = -1;
		try {
			JsonElement j = json.get("role");
			if (j != null) {
				role = j.getAsInt();
			}
		} catch (ClassCastException e) {
			System.out.println("Illegal value received: " + e.getMessage());
		}
		
		String username = null;
		try {
			JsonElement j = json.get("username");
			if (j != null) {
				username = j.getAsString();
			}
		} catch (ClassCastException e) {
			System.out.println("Illegal value received: " + e.getMessage());
		}
		
		if (graphid == -1 || logintoken == null || role == -1 || username == null) {
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

		// We need to check if we're allowed to change roles for the graph.
		Graph g = graphRepo.getUserGraph(user, graphid);
		if (g == null) {
			// User doesn't have access to graph
			response.setStatus(HttpServletResponse.SC_FORBIDDEN);
			response.getOutputStream().flush();
			response.getOutputStream().close();
			return;
		}
		
		Role r = roleRepo.getUserRoleForGraph(g, user);
		if (r == null || r.getRole() != GraphRole.OWNER) {
			// User isn't owner of graph, can't assign new roles
			response.setStatus(HttpServletResponse.SC_FORBIDDEN);
			response.getOutputStream().flush();
			response.getOutputStream().close();
			return;
		}
		
		User userToAssign = userRepo.getUserByUsername(username);
		if (userToAssign == null) {
			// Specified user doesn't exist in the db
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getOutputStream().flush();
			response.getOutputStream().close();
			return;
		}
		
		Role newRole = new Role(userToAssign, g, role);
		if (roleRepo.getUserRoleForGraph(g, userToAssign) != null) {
			// Role for userToAssign already exist in the db.
			
			if (user.equals(userToAssign) && newRole.getRole() != GraphRole.OWNER) {
				// User can't dissociate himself as owner.
				response.setStatus(HttpServletResponse.SC_FORBIDDEN);
				response.getOutputStream().flush();
				response.getOutputStream().close();
				return;
			}
			
			roleRepo.updateRole(newRole);
			response.setStatus(HttpServletResponse.SC_OK);
			response.getOutputStream().flush();
			response.getOutputStream().close();
			return;
		}
		
		roleRepo.insertRole(newRole);
		response.setStatus(HttpServletResponse.SC_OK);
		response.getOutputStream().flush();
		response.getOutputStream().close();
	}
}
