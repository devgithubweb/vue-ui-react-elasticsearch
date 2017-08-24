import {
	ADD_COMPONENT,
	REMOVE_COMPONENT,
	WATCH_COMPONENT,
	SET_QUERY,
	EXECUTE_QUERY,
	UPDATE_HITS,
	UPDATE_AGGS,
	SET_QUERY_OPTIONS
} from "../constants";

import { buildQuery, btoa } from "../utils/helper";

export function addComponent(component) {
	return {
		type: ADD_COMPONENT,
		component
	};
}

export function removeComponent(component) {
	return {
		type: REMOVE_COMPONENT,
		component
	};
}

export function watchComponent(component, react) {
	return {
		type: WATCH_COMPONENT,
		component,
		react
	};
}

export function setQuery(component, query) {
	return {
		type: SET_QUERY,
		component,
		query
	};
}

export function setQueryOptions(component, options) {
	return {
		type: SET_QUERY_OPTIONS,
		component,
		options
	};
}

export function executeQuery(component, query, options = {}, appendToHits = false) {
	return (dispatch, getState) => {
		const { config, queryOptions } = getState();
		let mainQuery = null;
		if (query) {
			mainQuery = {
				query
			}
		}

		console.log("Executing for", component, {
			...mainQuery,
			...queryOptions[component],
			...options
		});

		fetch(`https://${config.url}/${config.app}/${config.type === null ? "" : `${config.type}/`}_search`, {
			method: "POST",
			headers: {
				"Authorization": `Basic ${btoa(config.credentials)}`,
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				...mainQuery,
				...queryOptions[component],
				...options
			})
		})
			.then(response => response.json())
			.then(response => {
				dispatch(updateHits(component, response.hits.hits, appendToHits))
				if ("aggregations" in response) {
					dispatch(updateAggs(component, response.aggregations));
				}
			})
			.catch(err => {
				console.log(err);
			});
	}
}

export function updateHits(component, hits, append = false) {
	return {
		type: UPDATE_HITS,
		component,
		hits,
		append
	}
}

export function updateAggs(component, aggregations) {
	return {
		type: UPDATE_AGGS,
		component,
		aggregations
	}
}

export function updateQuery(componentId, query) {
	return (dispatch, getState) => {
		dispatch(setQuery(componentId, query));

		const store = getState();
		const watchList = store.watchMan[componentId];
		const options = store.queryOptions[componentId];
		if (Array.isArray(watchList)) {
			watchList.forEach(component => {
				const queryObj = buildQuery(component, store.dependencyTree, store.queryList);
				dispatch(executeQuery(component, queryObj, options));
			});
		}
	}
}

export function loadMore(component, options) {
	return (dispatch, getState) => {
		const store = getState();
		const queryObj = buildQuery(component, store.dependencyTree, store.queryList);
		dispatch(executeQuery(component, queryObj, options, true));
	}
}
