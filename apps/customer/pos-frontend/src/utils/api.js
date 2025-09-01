const BASE_URL = "http://localhost:5000"; // Customer backend URL

export const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const fullUrl = `${BASE_URL}${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  // --- THIS IS THE FIX ---
  // If the response is a 204 No Content, there is no JSON body to parse.
  // We can return null to signify a successful but empty response.
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type");
  if (!response.ok) {
    const errorData =
      contentType && contentType.includes("application/json")
        ? await response.json()
        : { message: `Request failed with status ${response.status}` };
    
    // Handle validation errors with detailed messages
    if (errorData.errors && Array.isArray(errorData.errors)) {
      const errorMessages = errorData.errors.map(err => err.message || err).join(', ');
      throw new Error(errorMessages);
    }
    
    throw new Error(errorData.message || 'Request failed');
  }

  // If we get here and there's no JSON, it's an unexpected issue, but we can handle it.
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return null;
};

