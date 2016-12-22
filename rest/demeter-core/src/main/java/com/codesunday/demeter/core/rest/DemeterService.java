package com.codesunday.demeter.core.rest;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.log4j.BasicConfigurator;
import org.json.JSONArray;
import org.json.JSONObject;

import com.codesunday.ceres.core.client.CeresClient;
import com.codesunday.ceres.core.domain.ApplicationContext;
import com.codesunday.ceres.core.domain.QueryTemplate;
import com.codesunday.ceres.core.domain.Result;
import com.codesunday.demeter.core.constants.Constants;
import com.codesunday.demeter.core.domain.CeresRegistry;
import com.codesunday.proteus.core.client.ProteusClient;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.stream.JsonWriter;

@Path("/")
public class DemeterService {

	private static CeresRegistry registry;

	private static final String baseOutputPath = "/home/arun/demeter/output/";

	static {
		registry = new CeresRegistry();
		BasicConfigurator.configure();
	}

	@GET
	@Path("/instance")
	public Response getInstance() {

		JSONArray jsonarray = new JSONArray(registry.getAllKeys());
		return Response.status(200).entity(jsonarray.toString()).build();
	}

	@POST
	@Path("/instance")
	public Response createInstance(String inputJsonText) {

		JSONObject inputJson = new JSONObject(inputJsonText);

		System.out.println("json: " + inputJson);

		if (inputJson.has(Constants.KEY) && inputJson.has(Constants.DRIVER)) {

			inputJson.put(Constants.TYPE, Constants.DATABASE_INSTANCE);

			addGlobalProperty(inputJson.toString());

			CeresClient client = CeresClient.getInstance(inputJson.optString(Constants.DRIVER),
					inputJson.optString(Constants.KEY));

			registry.add(inputJson.optString(Constants.KEY), client);
		}

		boolean outcome = true;

		return Response.status(200).entity(outcome).build();
	}

	@DELETE
	@Path("/instance")
	public Response deleteInstance() {

		boolean outcome = true;

		registry.remove();

		return Response.status(200).entity(outcome).build();
	}

	@GET
	@Path("/property/global")
	public Response getGlobalProperty() {

		return Response.status(200).entity(new JSONObject(ApplicationContext.getGlobalMap()).toString()).build();
	}

	@DELETE
	@Path("/property/global")
	public Response deleteGlobalProperty() {

		boolean outcome = true;

		ApplicationContext.clearGlobalMap();

		return Response.status(200).entity(outcome).build();
	}

	@POST
	@Path("/property/global")
	public Response addGlobalProperty(String inputJsonText) {

		boolean outcome = true;

		if (inputJsonText.startsWith("[")) {
			JSONArray inputJson = new JSONArray(inputJsonText);
			ApplicationContext.appendGlobalScope(inputJson);
		} else {
			JSONObject inputJson = new JSONObject(inputJsonText);
			ApplicationContext.appendGlobalScope(inputJson);
		}

		return Response.status(200).entity(outcome).build();
	}

	@GET
	@Path("/property/local/{instanceid}")
	public Response getLocalProperty(@PathParam("instanceid") String instanceid) {

		if (registry.has(instanceid)) {

			return Response.status(200)
					.entity(new JSONObject(registry.get(instanceid).getApplicationContext().getMap()).toString())
					.build();
		} else {

			return Response.status(Response.Status.EXPECTATION_FAILED)
					.entity("instance " + instanceid + " does not exist").build();
		}
	}

	@DELETE
	@Path("/property/local/{instanceid}")
	public Response deleteLocalProperty(@PathParam("instanceid") String instanceid) {

		boolean outcome = true;

		if (registry.has(instanceid)) {

			registry.get(instanceid).getApplicationContext().clearMap();

			return Response.status(200).entity(outcome).build();
		} else {

			return Response.status(Response.Status.EXPECTATION_FAILED)
					.entity("instance " + instanceid + " does not exist").build();
		}
	}

	@POST
	@Path("/property/local/{instanceid}")
	public Response addLocalProperty(@PathParam("instanceid") String instanceid, String inputJsonText) {

		boolean outcome = true;

		if (registry.has(instanceid)) {

			ApplicationContext applicationContext = registry.get(instanceid).getApplicationContext();

			if (inputJsonText.startsWith("[")) {
				JSONArray inputJson = new JSONArray(inputJsonText);
				applicationContext.append(inputJson);
			} else {
				JSONObject inputJson = new JSONObject(inputJsonText);
				applicationContext.append(inputJson);
			}

			return Response.status(200).entity(outcome).build();
		} else {
			return Response.status(Response.Status.EXPECTATION_FAILED)
					.entity("instance " + instanceid + " does not exist").build();
		}

	}

	@POST
	@Path("/query/manage/{instanceid}")
	public Response addQuery(@PathParam("instanceid") String instanceid, String inputJsonText) {

		System.out.println(instanceid);

		if (registry.has(instanceid)) {

			if (inputJsonText.startsWith("[")) {
				JSONArray inputJson = new JSONArray(inputJsonText);

				registry.get(instanceid).addQueries(inputJson);

			} else {
				JSONObject inputJson = new JSONObject(inputJsonText);

				registry.get(instanceid).addQueries(inputJson);

			}

			return Response.status(200).entity(true).build();

		} else {
			return Response.status(Response.Status.EXPECTATION_FAILED)
					.entity("instance " + instanceid + " does not exist").build();

		}

	}

	@GET
	@Path("/query/manage/{instanceid}")
	public Response getQuery(@PathParam("instanceid") String instanceid) {

		if (registry.has(instanceid)) {

			Map<String, Map<String, QueryTemplate>> map = registry.get(instanceid).getAllQueries();

			JSONArray responseJsonArray = new JSONArray();

			if (map.containsKey(Constants.DEFAULT)) {
				Collection<QueryTemplate> collection = map.get(Constants.DEFAULT).values();

				for (QueryTemplate qt : collection) {
					responseJsonArray.put(qt.get());
				}
			}

			return Response.status(200).entity(responseJsonArray.toString()).build();

		} else {
			return Response.status(Response.Status.EXPECTATION_FAILED)
					.entity("instance " + instanceid + " does not exist").build();

		}

	}

	@POST
	@Path("/query/run/{instanceid}/{format}")
	public Response runQuery(@PathParam("instanceid") String instanceid, @PathParam("format") String format,
			@QueryParam("flatten") boolean flatten, @QueryParam("delimiter") String delimiter,
			@QueryParam("enclosedby") String enclosedBy, String inputJsonText) {

		if (format.equalsIgnoreCase(Constants.JSON)) {
			format = Constants.JSON;
		} else {
			format = Constants.DELIMITED;
		}
		
		if(delimiter==null){
			delimiter = ",";
		}

		if (registry.has(instanceid)) {

			Map<String, Object> parameters = new HashMap<String, Object>();

			if (inputJsonText != null && !inputJsonText.isEmpty() && inputJsonText.startsWith("{")) {

				JSONObject query;

				JSONObject inputJson = new JSONObject(inputJsonText);

				if (inputJson.has(Constants.ID)) {
					addQuery(instanceid, inputJson.optJSONObject(Constants.QUERY)
							.put(Constants.ID, inputJson.optString(Constants.ID)).toString());
				}

				if (inputJson.has(Constants.QUERY) && inputJson.opt(Constants.QUERY) instanceof JSONObject) {
					query = inputJson.optJSONObject(Constants.QUERY);
				} else {
					return Response.status(Response.Status.EXPECTATION_FAILED)
							.entity("query or query reference id is not provided").build();
				}

				if (inputJson.has(Constants.PARAMETERS)) {
					JSONArray array = inputJson.optJSONArray(Constants.PARAMETERS);

					for (int i = 0; i < array.length(); i++) {
						JSONObject json = array.optJSONObject(i);

						for (String key : json.keySet()) {
							if (json.get(key) instanceof String) {
								parameters.put(key, json.optString(key));
							} else if (json.get(key) instanceof JSONArray) {
								parameters.put(key, json.optJSONArray(key));
							}
						}
					}
				}

				Result result = registry.get(instanceid).find(query, parameters);

				String downloadId = generateUniqueName();

				List<String> generatesFileNames = new ArrayList<String>();

				for (String viewname : result.getViewNames()) {

					List<JSONObject> view = result.getView(viewname);

					if (viewname.equals(Constants._DEFAULT)) {
						viewname = "";
					} else {
						viewname = "_" + viewname;
					}

					String fileName = downloadId + viewname;

					String filePath;

					if (format.equals(Constants.JSON)) {
						filePath = baseOutputPath + fileName + ".json";
						writeJsonFile(view, new Gson(), filePath, flatten);
					} else {
						filePath = baseOutputPath + fileName + ".txt";
						writeDelimitedFile(view, filePath, delimiter, enclosedBy);
					}

					generatesFileNames.add(filePath);

				}

				// meta data
				String fileName = downloadId + "_" + "meta" + ".json";

				String filePath = baseOutputPath + fileName;

				generatesFileNames.add(filePath);

				inputJson.put(Constants.INSTANCE, instanceid);

				writeJsonFile(inputJson, new Gson(), filePath);

				writeZipFile(baseOutputPath + downloadId + ".zip",
						generatesFileNames.toArray(new String[generatesFileNames.size()]));

				JSONObject json = new JSONObject();

				json.put("download_id", downloadId);

				return Response.status(200).entity(json.toString()).build();

			} else {
				return Response.status(Response.Status.EXPECTATION_FAILED)
						.entity("query or query reference id is not provided").build();
			}

		}
		return Response.status(Response.Status.EXPECTATION_FAILED).entity("instance " + instanceid + " does not exist")
				.build();

	}

	private String generateUniqueName() {
		SimpleDateFormat df = new SimpleDateFormat("yyyyMMdd_HHmmss");
		Date date = new Date(System.currentTimeMillis());

		return df.format(date);

	}

	private void writeJsonFile(List<JSONObject> jsonObjectHolder, Gson gson, String filePath, boolean flatten) {

		try {

			ProteusClient proteus = ProteusClient.getInstance();

			JsonWriter writer = new JsonWriter(new FileWriter(new File(filePath)));

			writer.beginArray();

			for (JSONObject jsonObject : jsonObjectHolder) {

				if (flatten) {
					jsonObject = proteus.flattenAsJson(jsonObject);
				}

				JsonParser parser = new JsonParser();

				JsonObject json = parser.parse(jsonObject.toString()).getAsJsonObject();

				gson.toJson(json, writer);
			}

			writer.endArray();

			writer.close();

		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	private void writeDelimitedFile(List<JSONObject> jsonObjectHolder, String filePath, String delimiter,
			String enclosedBy) {

		ProteusClient proteus = ProteusClient.getInstance();

		try {

			Set<String> keyset = new HashSet<String>();

			for (JSONObject jsonObject : jsonObjectHolder) {

				jsonObject = proteus.flattenAsJson(jsonObject);

				keyset.addAll(jsonObject.keySet());

			}

			List<String> keys = new ArrayList<String>(keyset);
			Collections.sort(keys);

			PrintWriter pw = new PrintWriter(new FileWriter(filePath));

			StringBuilder headerSb = new StringBuilder();

			for (String key : keys) {
				if (enclosedBy != null) {
					headerSb.append(enclosedBy);
				}
				headerSb.append(key);
				if (enclosedBy != null) {
					headerSb.append(enclosedBy);
				}
				headerSb.append(delimiter);
			}

			if (headerSb.length() > 1) {
				pw.write(headerSb.substring(0, headerSb.length() - 1));
			} else {
				pw.write(headerSb.toString());
			}

			pw.write("\n");

			for (JSONObject json : jsonObjectHolder) {

				JSONObject flattenedJson = proteus.flattenAsJson(json);

				String delimitedText = jsonToDelimited(flattenedJson, keys, delimiter, enclosedBy);

				pw.write(delimitedText);
				pw.write("\n");

			}

			pw.flush();
			pw.close();

		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	private String jsonToDelimited(JSONObject input, List<String> keys, String delimiter, String enclosedBy) {

		StringBuilder rowSb = new StringBuilder();

		for (String key : keys) {

			if (enclosedBy != null) {
				rowSb.append(enclosedBy);
			}

			if (input.has(key)) {
				rowSb.append(input.opt(key));
			} else {
				rowSb.append("");
			}

			if (enclosedBy != null) {
				rowSb.append(enclosedBy);
			}

			rowSb.append(delimiter);
		}

		String outputText = rowSb.substring(0, rowSb.length() - 1).toString();

		return outputText;

	}

	private void writeJsonFile(JSONObject jsonObject, Gson gson, String filePath) {

		try {
			JsonWriter writer = new JsonWriter(new FileWriter(new File(filePath)));

			writer.beginArray();

			JsonParser parser = new JsonParser();

			JsonObject json = parser.parse(jsonObject.toString()).getAsJsonObject();

			gson.toJson(json, writer);

			writer.endArray();

			writer.close();

		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	private void writeZipFile(String zipfilename, String... filenames) {
		byte[] buf = new byte[2048];
		try {
			String outFilename = zipfilename;
			ZipOutputStream out = new ZipOutputStream(new FileOutputStream(outFilename));
			for (int i = 0; i < filenames.length; i++) {
				FileInputStream in = new FileInputStream(filenames[i]);
				File file = new File(filenames[i]);
				out.putNextEntry(new ZipEntry(file.getName()));
				int len;
				while ((len = in.read(buf)) > 0) {
					out.write(buf, 0, len);
				}
				out.closeEntry();
				in.close();
			}
			out.close();
		} catch (IOException e) {
		}

	}

	@GET
	@Path("/query/result/{downloadid}")
	@Produces(MediaType.APPLICATION_OCTET_STREAM)
	public Response downloadQueryResult(@PathParam("downloadid") String downloadId) throws FileNotFoundException {

		String filePath = "/home/arun/demeter/output/" + downloadId + ".zip";

		File file = new File(filePath);

		byte[] bytes = download(filePath);

		return Response.ok(file, MediaType.APPLICATION_OCTET_STREAM)
				.header("Content-Disposition", "inline; filename=\"" + file.getName() + "\"").build();
	}

	private byte[] download(String filePath) {
		System.out.println("Sending file: " + filePath);

		try {
			File file = new File(filePath);
			FileInputStream fis = new FileInputStream(file);
			BufferedInputStream inputStream = new BufferedInputStream(fis);
			byte[] fileBytes = new byte[(int) file.length()];
			inputStream.read(fileBytes);
			inputStream.close();

			return fileBytes;
		} catch (IOException ex) {
			ex.printStackTrace();
		}

		return null;
	}

	@POST
	@Path("/query/run/onscreen/{instanceid}")
	public Response runQueryOnScreen(@PathParam("instanceid") String instanceid, String inputJsonText) {

		if (registry.has(instanceid)) {
			//
			// try {
			// TimeUnit.SECONDS.sleep(1);
			// } catch (InterruptedException e) {
			// // TODO Auto-generated catch block
			// e.printStackTrace();
			// }

			Map<String, Object> parameters = new HashMap<String, Object>();

			if (inputJsonText != null && !inputJsonText.isEmpty() && inputJsonText.startsWith("{")) {

				JSONObject query;

				JSONObject inputJson = new JSONObject(inputJsonText);

				if (inputJson.has(Constants.QUERY) && inputJson.opt(Constants.QUERY) instanceof JSONObject) {
					query = inputJson.optJSONObject(Constants.QUERY);
				} else {
					return Response.status(Response.Status.EXPECTATION_FAILED)
							.entity("query or query reference id is not provided").build();
				}

				if (inputJson.has(Constants.PARAMETERS)) {
					JSONArray array = inputJson.optJSONArray(Constants.PARAMETERS);

					for (int i = 0; i < array.length(); i++) {
						JSONObject json = array.optJSONObject(i);

						for (String key : json.keySet()) {
							if (json.get(key) instanceof String) {
								parameters.put(key, json.optString(key));
							} else if (json.get(key) instanceof JSONArray) {
								parameters.put(key, json.optJSONArray(key));
							}
						}
					}
				}

				Result result = registry.get(instanceid).find(query, parameters);

				return Response.status(200).entity(new JSONObject(result.getViews()).toString()).build();
			} else {
				return Response.status(Response.Status.EXPECTATION_FAILED)
						.entity("query or query reference id is not provided").build();
			}

		} else {
			return Response.status(Response.Status.EXPECTATION_FAILED)
					.entity("instance " + instanceid + " does not exist").build();

		}

	}

	@POST
	@Path("/query/run/onscreen/{instanceid}/{queryid}")
	public Response runQueryOnScreen(@PathParam("instanceid") String instanceid, @PathParam("queryid") String queryid,
			String inputJsonText) {

		if (registry.has(instanceid)) {

			Map<String, Object> parameters = new HashMap<String, Object>();

			if (inputJsonText != null && !inputJsonText.isEmpty() && inputJsonText.startsWith("{")) {

				JSONObject inputJson = new JSONObject(inputJsonText);

				if (inputJson.has(Constants.PARAMETERS)) {
					JSONArray array = inputJson.optJSONArray(Constants.PARAMETERS);

					for (int i = 0; i < array.length(); i++) {
						JSONObject json = array.optJSONObject(i);

						for (String key : json.keySet()) {
							if (json.get(key) instanceof String) {
								parameters.put(key, json.optString(key));
							} else if (json.get(key) instanceof JSONArray) {
								parameters.put(key, json.optJSONArray(key));
							}
						}
					}
				}
			}

			Result result = registry.get(instanceid).find("default", queryid, parameters);

			return Response.status(200).entity(new JSONObject(result.getViews()).toString()).build();

		} else {
			return Response.status(Response.Status.EXPECTATION_FAILED)
					.entity("instance " + instanceid + " does not exist").build();

		}

	}

}