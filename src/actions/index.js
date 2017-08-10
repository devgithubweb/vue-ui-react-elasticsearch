import {
	ADD_COMPONENT,
	REMOVE_COMPONENT,
	SET_QUERY,
	EXECUTE_QUERY
} from "../constants";

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

export function setQuery(component, query) {
	return {
		type: SET_QUERY,
		component,
		query
	};
}

export function executeQuery(component, query) {
	return {
		type: EXECUTE_QUERY,
		component,
		query
	};
}
