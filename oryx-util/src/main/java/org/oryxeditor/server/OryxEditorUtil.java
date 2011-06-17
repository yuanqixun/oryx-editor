package org.oryxeditor.server;

import java.io.InputStream;
import java.util.Properties;

public abstract class OryxEditorUtil {
	private static Properties props;
	public static Properties getProps() {
		if (props == null) {
			InputStream in;
			try {
				in = OryxEditorUtil.class.getResourceAsStream("/editor.properties");
				props = new Properties();
				props.load(in);
				in.close();
			} catch (Exception e) {
				e.printStackTrace();
				props = new Properties();
			}
		}
		return props;
	}
}
