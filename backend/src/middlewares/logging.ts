function getTimeStamp(): string {
	return new Date().toISOString();
}

function info(namespace: string, message: string, object?: any) {
	if (object) {
		console.info(`[${getTimeStamp()}] [INFO] [${namespace}] ${message}`, object);
	} else {
		console.info(`[${getTimeStamp()}] [INFO] [${namespace}] ${message}`);
	}
}

function warn(namespace: string, message: string, object?: any) {
	if (object) {
		console.warn(`[${getTimeStamp()}] [WARN] [${namespace}] ${message}`, object);
	} else {
		console.warn(`[${getTimeStamp()}] [WARN] [${namespace}] ${message}`);
	}
}

function error(namespace: string, message: string, object?: any) {
	if (object) {
		console.error(`[${getTimeStamp()}] [ERROR] [${namespace}] ${message}`, object);
	} else {
		console.error(`[${getTimeStamp()}] [ERROR] [${namespace}] ${message}`);
	}
}

function debug(namespace: string, message: string, object?: any) {
	if (object) {
		console.debug(`[${getTimeStamp()}] [DEBUG] [${namespace}] ${message}`, object);
	} else {
		console.debug(`[${getTimeStamp()}] [DEBUG] [${namespace}] ${message}`);
	}
}

const logging = {
	info,
	error,
	debug,
	warn
};

export default logging;
