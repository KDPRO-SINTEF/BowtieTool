package com.mxgraph.examples.web;

import java.io.IOException;
import java.io.OutputStream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

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
		JsonObject json = new Gson().fromJson(req.getReader(), JsonObject.class);
		
		String username = null;
		try {
			JsonElement j = json.get("username");
			if (j != null) {
				username = j.getAsString();
			}
		} catch (ClassCastException e) {
			System.out.println("Illegal value received: " + e.getMessage());
		}
		
		String password = null;
		try {
			JsonElement j = json.get("password");
			if (j != null) {
				password = j.getAsString();
			}
		} catch (ClassCastException e) {
			System.out.println("Illegal value received: " + e.getMessage());
		}
		
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
		out.write(new Gson()
				.toJsonTree(user)
				.getAsJsonObject()
				.toString().getBytes("UTF-8")
		);
		out.flush();
		out.close();
	}
}
