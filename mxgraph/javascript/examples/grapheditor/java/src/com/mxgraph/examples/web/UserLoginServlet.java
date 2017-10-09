package com.mxgraph.examples.web;

import java.io.IOException;
import java.io.OutputStream;

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
            // User isn't authorized
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
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
		
        response.setContentType("text/plain");
        response.setStatus(HttpServletResponse.SC_OK);
        OutputStream out = response.getOutputStream();
        out.write(user.getToken().getBytes());
	    
		out.flush();
        out.close();
        
        /*
        int id = Integer.parseInt(req.getParameter("id"));
        User user = userRepo.getUserById(id);
        response.setContentType("text/plain");
        response.setStatus(HttpServletResponse.SC_OK);

        OutputStream out = response.getOutputStream();
        if(user != null) {          
            out.write(("User in DB, name "+ user.getUsername()).getBytes("UTF-8"));
        } else {
            out.write("No such user exist".getBytes("UTF-8"));
        }
        */
	}
}
