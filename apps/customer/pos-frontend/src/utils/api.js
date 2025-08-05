// This function will be our single source of truth for making API calls.
export const authenticatedFetch = async (url, options = {}) => {
  // 1. Get the token from localStorage.
  const token = localStorage.getItem("token");

  // 2. Prepare the headers.
  const headers = {
    "Content-Type": "application/json",
    ...options.headers, // Allow custom headers to be passed in
  };

  // 3. If a token exists, add the Authorization header.
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 4. Make the fetch call with the correct URL and the new headers.
  //    The relative URL (e.g., /api/branches) will be correctly handled by the Vite proxy.
  const response = await fetch(url, {
    ...options, // Pass through any other options like method, body, etc.
    headers,
  });

  // 5. Check for a 401 Unauthorized response specifically.
  //    This can happen if the token expires.
  if (response.status === 401) {
    // Optional: Add logic to automatically log the user out.
    console.error("Authentication error. Token might be expired. Logging out.");
    // localStorage.clear();
    // window.location.href = '/'; // Force a redirect to the login page
  }

  // 6. Basic response handling.
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}`
    );
  }

  return data;
};
