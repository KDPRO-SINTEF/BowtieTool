package com.mxgraph.examples.web;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.mortbay.jetty.Handler;
import org.mortbay.jetty.Server;
import org.mortbay.jetty.handler.HandlerList;
import org.mortbay.jetty.handler.ResourceHandler;
import org.mortbay.jetty.servlet.Context;
import org.mortbay.jetty.servlet.ServletHolder;

import com.mxgraph.examples.web.repository.IGraphRepository;
import com.mxgraph.examples.web.repository.IRoleRepository;
import com.mxgraph.examples.web.repository.IUserRepository;
import com.mxgraph.examples.web.repository.impl.GraphRepositoryImpl;
import com.mxgraph.examples.web.repository.impl.MySQLAccess;
import com.mxgraph.examples.web.repository.impl.RoleRepositoryImpl;
import com.mxgraph.examples.web.repository.impl.UserRepositoryImpl;
import com.mxgraph.examples.web.servlets.CachelessFileHandler;
import com.mxgraph.examples.web.servlets.GraphServlet;
import com.mxgraph.examples.web.servlets.OpenServlet;
import com.mxgraph.examples.web.servlets.RoleServlet;
import com.mxgraph.examples.web.servlets.TemplateGraphServlet;
import com.mxgraph.examples.web.servlets.UserCreateServlet;
import com.mxgraph.examples.web.servlets.UserGraphServlet;
import com.mxgraph.examples.web.servlets.UserLoginServlet;

/**
 * The save servlet is used to echo XML to the client, eg. for SVG export and saving (see
 * Dialogs.js:SaveDialog and ExportDialog). The export servlet is used to implement image and PDF
 * export (see Dialogs.js:ExportDialog). Note that the CSS support is limited to the following for
 * all HTML markup:
 * http://docs.oracle.com/javase/6/docs/api/index.html?javax/swing/text/html/CSS.html The open
 * servlet is used to open files. It does this by calling some JavaScript hook in the client-side
 * page (see open.html).
 */
public class GraphEditor {

  public static int PORT = 8080;

  /** Uncomment this for better font size rendering in px units within labels. */
  static {
    //		mxGraphicsCanvas2D.HTML_SCALE = 0.75;
    //		mxGraphicsCanvas2D.HTML_UNIT = "px";
  }

  private static Properties readConfig() {
    Properties prop = new Properties();
    InputStream input = null;

    try {

      //String filename = "G:\\git\\BowtieTool\\mxgraph\\javascript\\examples\\grapheditor\\java\\src\\repository\\config.properties";
      //input = new FileInputStream(new File(filename));
      String filename = "config.properties";
      input = MySQLAccess.class.getClassLoader().getResourceAsStream(filename);
      if (input == null) {
        // Returning an empty prop list is fine as we're still able to serve up the static graph application
        // without having to rely on the config values.
        System.out.println("Sorry, unable to find " + filename);
        return prop;
      }

      // load a properties file
      prop.load(input);
    } catch (IOException ex) {
      ex.printStackTrace();
    } finally {
      if (input != null) {
        try {
          input.close();
        } catch (IOException e) {
          e.printStackTrace();
        }
      }
    }
    return prop;
  }

  /** Point your browser to http://localhost:8080/javascript/examples/grapheditor/www/index.html */
  public static void main(String[] args) throws Exception {
    Server server = new Server(PORT);
    Properties config = readConfig();

    MySQLAccess access = new MySQLAccess(config.getProperty("dburi"));
    IUserRepository userRepo = new UserRepositoryImpl(access);
    IGraphRepository graphRepo = new GraphRepositoryImpl(access);
    IRoleRepository roleRepo = new RoleRepositoryImpl(access);

    // Servlets
    Context context = new Context(server, "/");
    context.addServlet(new ServletHolder(new EchoServlet()), "/save");
    context.addServlet(new ServletHolder(new ExportServlet()), "/export");
    context.addServlet(new ServletHolder(new OpenServlet()), "/open");
    context.addServlet(new ServletHolder(new UserLoginServlet(userRepo)), "/user/login");
    context.addServlet(new ServletHolder(new UserCreateServlet(userRepo)), "/user/register");
    context.addServlet(new ServletHolder(new UserGraphServlet(userRepo, graphRepo)), "/user/graph");
    context.addServlet(
        new ServletHolder(new TemplateGraphServlet(userRepo, graphRepo)), "/template/graph");
    context.addServlet(
        new ServletHolder(new GraphServlet(userRepo, graphRepo, roleRepo)), "/graph");
    context.addServlet(new ServletHolder(new RoleServlet(userRepo, graphRepo, roleRepo)), "/role");

    ResourceHandler fileHandler = new CachelessFileHandler();
    fileHandler.setResourceBase(".");
    System.out.println(fileHandler.getResourceBase());

    HandlerList handlers = new HandlerList();
    handlers.setHandlers(new Handler[] {fileHandler, context});
    server.setHandler(handlers);

    System.out.println(
        "Go to http://localhost:"
            + PORT
            + "/mxgraph/javascript/examples/grapheditor/www/index.html");

    server.start();
    server.join();
  }
}
