class ApiResponse {
    static success(data, message = 'Success') {
        return {
            success: true,
            message,
            data
        };
    }

    static error(message, errors = null) {
        return {
            success: false,
            message,
            errors
        };
    }

    static paginated(data, page, limit, total) {
        return {
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
}

export default ApiResponse;
