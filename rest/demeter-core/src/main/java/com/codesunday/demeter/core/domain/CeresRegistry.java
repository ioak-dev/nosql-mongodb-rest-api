package com.codesunday.demeter.core.domain;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import com.codesunday.ceres.core.client.CeresClient;
import com.codesunday.ceres.core.exception.CeresException;

public class CeresRegistry {

	private Map<String, CeresClient> registry;

	public CeresRegistry() {
		super();
		registry = new HashMap<String, CeresClient>();
	}

	public Set<String> getAllKeys() {
		return registry.keySet();
	}

	public void add(String key, CeresClient client) {
		registry.put(key, client);
	}

	public void remove(String... keys) {

		if (keys.length > 0) {

			for (String key : keys) {

				if (registry.containsKey(key)) {
					registry.remove(key);
				}

			}
		} else {
			registry.clear();
		}

	}

	public boolean has(String key) {
		if (registry.containsKey(key)) {
			return true;
		} else {
			return false;
		}
	}

	public CeresClient get(String key) {
		if (registry.containsKey(key)) {
			return registry.get(key);
		} else {
			throw new CeresException();
		}
	}

}
