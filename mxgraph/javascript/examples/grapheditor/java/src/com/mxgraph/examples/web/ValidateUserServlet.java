package com.mxgraph.examples.web;

import java.io.IOException;
import java.io.OutputStream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import models.User;
import repository.IUserRepository;

public class ValidateUserServlet extends HttpServlet{
	
	private IUserRepository userRepo;
	
	public ValidateUserServlet(IUserRepository userRepo) {
		this.userRepo = userRepo;
	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse response) throws ServletException, IOException {

	      
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse response) throws ServletException, IOException {
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
		out.flush();
        out.close();
	}
}
