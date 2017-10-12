package com.mxgraph.examples.web;

import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import models.User;
import repository.IUserRepository;

public class UserLoginServlet extends HttpServlet{

	/**
	 * 
	 */
	private static final long serialVersionUID = -1983280837215922034L;
	private IUserRepository userRepo;

	public UserLoginServlet(IUserRepository userRepo) {
		this.userRepo = userRepo;
	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse response) throws ServletException, IOException {


	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse response) throws ServletException, IOException {
		String username = req.getParameter("username");
		String password = req.getParameter("password");

		if (username == null || password == null) {
			// User must specify these fields.
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getOutputStream().flush();
			response.getOutputStream().close();
			return;
		}

		User user = userRepo.validateUser(username, password);
		if (user == null) {
			// User isn't authorized
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.getOutputStream().flush();
			response.getOutputStream().close();
			return;
		}

		response.setContentType("application/json");
		response.setStatus(HttpServletResponse.SC_OK);
		OutputStream out = response.getOutputStream();
		out.write((
				"  {"
				+ "     \"username\": " + URLEncoder.encode(user.getUsername(), "UTF-8") + "\", "
				+ "     \"fullname\": " + URLEncoder.encode(user.getFullname(), "UTF-8") + "\", "
				+ "     \"token\": \"" + URLEncoder.encode(user.getToken(), "UTF-8") + "\", "
				+ "     \"status\": \"success\""
				+ "}"
				).getBytes());

		out.flush();
		out.close();
	}
}
