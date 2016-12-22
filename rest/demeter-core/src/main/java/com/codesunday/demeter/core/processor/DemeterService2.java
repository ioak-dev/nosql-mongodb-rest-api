package com.codesunday.demeter.core.processor;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.StreamingOutput;

import org.apache.log4j.BasicConfigurator;
import org.json.JSONArray;
import org.json.JSONObject;

import com.codesunday.ceres.core.client.CeresClient;
import com.codesunday.ceres.core.domain.ApplicationContext;
import com.codesunday.ceres.core.domain.Result;
import com.codesunday.demeter.core.constants.Constants;
import com.codesunday.demeter.core.domain.CeresRegistry;

@Path("/")
public class DemeterService2 {

	private static CeresRegistry registry;

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
	@Consumes(MediaType.APPLICATION_JSON)
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
	@Consumes(MediaType.APPLICATION_JSON)
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
	@Consumes(MediaType.APPLICATION_JSON)
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
	@Consumes(MediaType.APPLICATION_JSON)
	public Response getQuery(@PathParam("instanceid") String instanceid) {

		if (registry.has(instanceid)) {

			return Response.status(200).entity(registry.get(instanceid).getAllQueries().toString()).build();

		} else {
			return Response.status(Response.Status.EXPECTATION_FAILED)
					.entity("instance " + instanceid + " does not exist").build();

		}

	}

	@POST
	@Path("/query/run/{instanceid}/zip")
	@Consumes(MediaType.APPLICATION_JSON)
	public Response runQueryZip(@PathParam("instanceid") String instanceid, String inputJsonText) {

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

				String respText = result.getView().toString();

				UUID uuid = UUID.randomUUID();

				String downloadId = "ZIP_" + uuid.toString();

				File f = new File("/home/arun/demeter/output/" + downloadId + ".zip");
				ZipOutputStream out;
				try {
					out = new ZipOutputStream(new FileOutputStream(f));

					ZipEntry e = new ZipEntry("result.json");
					out.putNextEntry(e);

					byte[] data = respText.getBytes();
					out.write(data, 0, data.length);
					out.closeEntry();

					out.close();
				} catch (FileNotFoundException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				} catch (IOException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}

				JSONObject json = new JSONObject();

				json.put("download_id", downloadId);

				return Response.status(200).entity(json.toString()).header("Access-Control-Allow-Origin", "*")
						.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT").build();

			} else {
				return Response.status(Response.Status.EXPECTATION_FAILED)
						.entity("query or query reference id is not provided")
						.header("Access-Control-Allow-Origin", "*")
						.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT")
						.allow("OPTIONS")
						.build();
			}

		}
		return Response.status(Response.Status.EXPECTATION_FAILED).entity("instance " + instanceid + " does not exist")
				.header("Access-Control-Allow-Origin", "*")
				.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT")
				.allow("OPTIONS")
				.build();

	}

	@GET
	@Path("/query/result/{downloadid}")
	@Produces(MediaType.APPLICATION_OCTET_STREAM)
	public Response downloadQueryResult(@PathParam("downloadid") String downloadId) throws FileNotFoundException {

		// Response responseFull = runQuery(instanceid, queryid, inputJsonText);
		// responseFull.readEntity(String.class);

		// final String filePath =
		// "/run/media/arun/f2677a9b-a9cc-4b68-b4f5-78cb9c797efc/workspace/electron/hello/app.zip";
		//
		// final File file = new File(filePath);
		// final ZipOutputStream zop = new ZipOutputStream(new
		// FileOutputStream(file));
		//
		// ResponseBuilder response = Response.ok(zop);
		// response.header("Content-Type", MediaType.APPLICATION_OCTET_STREAM);
		// response.header("Content-Disposition", "attachment; filename=" +
		// file.getName());
		// return response.build();

		String filePath = "/home/arun/demeter/output/" + downloadId + ".zip";

		File file = new File(filePath);

		byte[] bytes = download(filePath);

		return Response.ok(file, MediaType.APPLICATION_OCTET_STREAM)
				.header("Content-Disposition", "inline; filename=\"" + file.getName() + "\"")
				.header("Access-Control-Allow-Origin", "*")// optional
				.build();
	}

	@GET
	@Path("/query/run/zip")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.MULTIPART_FORM_DATA)
	public Response runQueryZip(@PathParam("instanceid") String instanceid, @PathParam("queryid") String queryid,
			String inputJsonText) throws FileNotFoundException {

		String filePath = "/run/media/arun/f2677a9b-a9cc-4b68-b4f5-78cb9c797efc/workspace/electron/hello/test.zip";

		// File file = new File(filePath);
		//
		// byte[] bytes = download(filePath);

		// StreamingOutput soo = new StreamingOutput() {
		// public void write(OutputStream output) throws IOException,
		// WebApplicationException {
		// try {
		// ZipFile zipFile = new
		// ZipFile("/run/media/arun/f2677a9b-a9cc-4b68-b4f5-78cb9c797efc/workspace/electron/hello/test.zip");
		// InputStream in = zipFile.getInputStream(zipFile
		// .getEntry("test.xml"));
		// IOUtils.copy(in, output);
		// } catch (Exception e) {
		// throw new WebApplicationException(e);
		// }
		// }
		// };
		StreamingOutput soo = new StreamingOutput() {
			public void write(java.io.OutputStream output) throws IOException, WebApplicationException {
				try {
					byte[] data = download(
							"/run/media/arun/f2677a9b-a9cc-4b68-b4f5-78cb9c797efc/workspace/electron/hello/test.zip");
					output.write(data);
					output.flush();
				} catch (Exception e) {
					throw new WebApplicationException("File Not Found !!");
				}
			}
		};

		return Response.ok().entity(soo).header("Content-Disposition", "attachment; filename = sample1.zip").build();
	}

	public byte[] download(String filePath) {
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
	@Path("/query/run/{instanceid}")
	@Consumes(MediaType.APPLICATION_JSON)
	public Response runQuery(@PathParam("instanceid") String instanceid, String inputJsonText) {

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
	@Path("/query/run/{instanceid}/{queryid}")
	@Consumes(MediaType.APPLICATION_JSON)
	public Response runQuery(@PathParam("instanceid") String instanceid, @PathParam("queryid") String queryid,
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