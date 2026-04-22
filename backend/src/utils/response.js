export const sendSuccess = (res, status, message, data = null) => {
    const response = {
        success: true,
        message
    };
    if (data) {
        response.data = data;
    }
    return res.status(status).json(response);
};

export const sendError = (res, status, message, errors = null) => {
    const response = {
        success: false,
        message
    };
    if (errors) {
        response.errors = errors;
    }
    return res.status(status).json(response);
};
