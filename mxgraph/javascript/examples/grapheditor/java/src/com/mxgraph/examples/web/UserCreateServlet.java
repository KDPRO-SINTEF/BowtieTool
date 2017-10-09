package com.mxgraph.examples.web;

import java.io.IOException;
import java.io.OutputStream;

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
		String password = req.getParameter("password");
		
		if (username == null || password == null) {
            // User isn't authorized
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getOutputStream().flush();
            response.getOutputStream().close();
            return;
		}
		
		// Needs more checks here, username *must* be unique, and createUser will error out somehow
		// if this isn't the case.
		userRepo.createUser(username, password);
		
        response.setContentType("text/plain");
        response.setStatus(HttpServletResponse.SC_OK);
        OutputStream out = response.getOutputStream();
        out.write("User created".getBytes());
	    
		out.flush();
        out.close();
	}
}
