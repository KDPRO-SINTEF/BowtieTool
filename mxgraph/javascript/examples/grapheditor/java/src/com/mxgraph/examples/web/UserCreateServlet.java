package com.mxgraph.examples.web;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import repository.IUserRepository;

public class UserCreateServlet extends HttpServlet{

	/**
	 * 
	 */
	private static final long serialVersionUID = -1983280837215922034L;
	private IUserRepository userRepo;

	public UserCreateServlet(IUserRepository userRepo) {
		this.userRepo = userRepo;
	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse response) throws ServletException, IOException {


	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse response) throws ServletException, IOException {
		String username = req.getParameter("username");
		String fullname = req.getParameter("fullname");
		String password = req.getParameter("password");

		if (username == null || fullname == null || password == null) {
			// These fields must be specified
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getOutputStream().flush();
			response.getOutputStream().close();
			return;
		}

		// Needs more checks here, username *must* be unique, and createUser will error out somehow
		// if this isn't the case.
		userRepo.createUser(username, fullname, password);
		
		// This isn't really good, as we don't know for certain wether the user was created or not.
		// The MySQLAccess swallows the exception, and we can't know at this level if an error
		// actually occured.
		response.setStatus(HttpServletResponse.SC_OK);
		response.getOutputStream().flush();
		response.getOutputStream().close();
	}
}
