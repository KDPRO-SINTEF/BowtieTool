package com.mxgraph.examples.web;

import java.io.IOException;
import java.util.Enumeration;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sound.midi.Soundbank;

import com.mysql.fabric.Response;

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
		String id = req.getParameter("id");
		if (id!=null) {
			System.out.println(id);
		}
		
	  }
	
	
	
	

}
