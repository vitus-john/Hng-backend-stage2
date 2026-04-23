function successResponse(data) {
	return {
		status: 'success',
		data,
	}
}

function errorResponse(message) {
	return {
		status: 'error',
		message,
	}
}

module.exports = {
	successResponse,
	errorResponse,
}