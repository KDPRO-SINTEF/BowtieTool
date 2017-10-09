package com.mxgraph.examples.web;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.StringReader;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.Hashtable;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.parsers.SAXParserFactory;

import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import org.xml.sax.XMLReader;

import repository.IUserRepository;

/**
 * Servlet implementation class ImageServlet.
 */
public class SaveGraphServlet extends HttpServlet
{

    /**
     * 
     */
    private static final long serialVersionUID = -5040708166131034516L;

    /**
     * 
     */
    private transient SAXParserFactory parserFactory = SAXParserFactory.newInstance();
    private IUserRepository userRepo;

    /**
     * @see HttpServlet#HttpServlet()
     */
    public SaveGraphServlet(IUserRepository userRepo)
    {
        super();
        this.userRepo = userRepo;
    }

    /**
     * Handles exceptions and the output stream buffer.
     */
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
    {
        try
        {
            if (request.getContentLength() < Constants.MAX_REQUEST_SIZE)
            {
                long t0 = System.currentTimeMillis();

                handleRequest(request, response);

                long mem = Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory();
                long dt = System.currentTimeMillis() - t0;

                System.out.println("save: ip=" + request.getRemoteAddr() + " ref=\"" + request.getHeader("Referer") + "\" length="
                        + request.getContentLength() + " mem=" + mem + " dt=" + dt);
            }
            else
            {
                response.setStatus(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
            }
        }
        catch (OutOfMemoryError e)
        {
            e.printStackTrace();
            final Runtime r = Runtime.getRuntime();
            System.out.println("r.freeMemory() = " + r.freeMemory() / 1024.0 / 1024);
            System.out.println("r.totalMemory() = " + r.totalMemory() / 1024.0 / 1024);
            System.out.println("r.maxMemory() = " + r.maxMemory() / 1024.0 / 1024);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
        catch (Exception e)
        {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
        finally
        {
            response.getOutputStream().flush();
            response.getOutputStream().close();
        }
    }

    /**
     * Gets the parameters and logs the request.
     * 
     * @throws ParserConfigurationException 
     * @throws SAXException 
     * @throws DocumentException 
     */
    protected void handleRequest(HttpServletRequest request, HttpServletResponse response) throws Exception
    {
        // Parses parameters
        String format = request.getParameter("format");
        String token = request.getParameter("token");
        String xml = getRequestXml(request);
        /*
         * From here
         * 
         * INSERT INTO KPRO.Graph(user_id, graph_data) VALUES ( (SELECT id FROM KPRO.User WHERE KPRO.User.token = {token}), xml);
         * INSERT INTO KPRO.Roles(id, user_id) VALUES (LAST_INSERT_ID(), (SELECT id FROM KPRO.User WHERE KPRO.User.token = {token}));
         */
        
    }

    /**
     * Gets the XML request parameter.
     */
    protected String getRequestXml(HttpServletRequest request) throws IOException, UnsupportedEncodingException
    {
        String xml = request.getParameter("xml");
        
        // Decoding is optional (no plain text values allowed)
        if (xml != null && xml.startsWith("%3C"))
        {
            xml = URLDecoder.decode(xml, "UTF-8");
        }

        return xml;
    }
}
