package com.mxgraph.examples.web;

import java.io.IOException;
import java.util.Enumeration;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sound.midi.Soundbank;

import com.mysql.fabric.Response;

import models.User;
import repository.IUserRepository;

public class ValidateUserServlet extends HttpServlet{
	
	private IUserRepository userRepo;
	
	public ValidateUserServlet(IUserRepository userRepo) {
		this.userRepo = userRepo;
	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

	      
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		int id = Integer.parseInt(req.getParameter("id"));
		User user = userRepo.getUserById(id);
		if(user!=null) {
			System.out.println("User in DB, name "+ user.getUsername() );
		}
	

	  }
	
	
	
	

}
