package com.mxgraph.examples.web;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;

import models.Graph;
import models.User;
import repository.IGraphRepository;
import repository.IUserRepository;

public class UserGraphServlet extends HttpServlet{

	/**
	 * 
	 */
	private static final long serialVersionUID = -1983280837215922033L;
	private IUserRepository userRepo;
	private IGraphRepository graphRepo;

	public UserGraphServlet(IUserRepository userRepo, IGraphRepository graphRepo) {
		this.userRepo = userRepo;
		this.graphRepo = graphRepo;
	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse response) throws ServletException, IOException {
		String token = req.getParameter("token");
		if (token == null) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getOutputStream().flush();
			response.getOutputStream().close();
			return;
		}
		
		User user = userRepo.getUserByToken(token);
		if (user == null) {
			response.setStatus(HttpServletResponse.SC_FORBIDDEN);
			response.getOutputStream().flush();
			response.getOutputStream().close();
			return;
		}
		List<Graph> graphs = graphRepo.getUserGraphs(user);
		response.setStatus(HttpServletResponse.SC_OK);
		OutputStream out = response.getOutputStream();
		out.write(new Gson()
				.toJsonTree(graphs)
				.getAsJsonArray()
				.toString().getBytes("UTF-8")
		);
		out.flush();
		out.close();
	}
}
