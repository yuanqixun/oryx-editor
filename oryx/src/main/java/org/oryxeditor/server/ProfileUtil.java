package org.oryxeditor.server;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.LinkedHashMap;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.apache.log4j.Logger;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

/**
 * @author Philipp Berger
 * 
 */
public class ProfileUtil {

	private static String PROFILE_DIR = "/oryx/profiles/";
	private static Logger log = Logger.getLogger(ProfileUtil.class);

	public static LinkedHashMap<String, String> getProfilePlugins(String rootPath,String profileName){
		String profileFilePath = rootPath+PROFILE_DIR + profileName + ".xml";
		File profileFile = new File(profileFilePath);
		if (!profileFile.exists()) {
			log.error("The profile " +profileFilePath+ " doesn't exist!");
		}
		LinkedHashMap<String, String> profilePlugin = new LinkedHashMap<String, String>();
		try {
			extractProfilePluginData(profileFile, profilePlugin);
		} catch (ParserConfigurationException e) {
			e.printStackTrace();
		} catch (SAXException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return profilePlugin;
	}

	private static void extractProfilePluginData(File profileFile,
			LinkedHashMap<String, String> plugins)
			throws ParserConfigurationException, SAXException, IOException {
		InputStream reader = new FileInputStream(profileFile);
		DocumentBuilder builder;
		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		builder = factory.newDocumentBuilder();
		Document document = builder.parse(reader);
		NodeList pluginNodes = document.getElementsByTagName("plugin");
		for (int i = 0; i < pluginNodes.getLength(); i++) {
			String name = pluginNodes.item(i).getAttributes().getNamedItem("name")
					.getNodeValue();
			String src = pluginNodes.item(i).getAttributes().getNamedItem("source")
					.getNodeValue();
			assert (src != null);
			plugins.put(name, src);
		}
	}


}
