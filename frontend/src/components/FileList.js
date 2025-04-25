// src/components/FileList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FileList() {
  const [files, setFiles] = useState([]); // Store the list of files
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Store potential errors

  // Function to fetch files (can be called again later if needed)
  const fetchFiles = async () => {
    setLoading(true); // Start loading
    setError(null); // Clear previous errors
    const token = localStorage.getItem('token');

    if (!token) {
      setError("Authentication token not found. Please log in again.");
      setLoading(false);
      return; // Stop if no token
    }

    try {
      // --- CORRECTED URL ---
      // Make GET request to the backend file list endpoint using env variable
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/api/vault/files/`;
      console.log("Fetching files from:", apiUrl); // Optional debug log
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      // --- END CORRECTION ---
      setFiles(response.data); // Update state with the array of files received
    } catch (err) {
      console.error("Failed to fetch files:", err);
       // Log the URL that was actually used in case of error
      console.error('Failed URL:', `${process.env.REACT_APP_API_BASE_URL}/api/vault/files/`);
      setError("Failed to fetch files. " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Fetch files when the component mounts
  useEffect(() => {
    fetchFiles();
  }, []); // Empty dependency array means run only once on mount

  // --- Download Handler ---
  const handleDownload = async (fileId, filename) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      return;
    }
    setError(null);

    try {
      // --- CORRECTED URL ---
      // Construct the specific download URL using env variable
      const downloadUrl = `${process.env.REACT_APP_API_BASE_URL}/api/vault/files/${fileId}/download/`;
      console.log("Attempting download from:", downloadUrl); // Optional debug log
      const response = await axios.get(downloadUrl, {
        headers: { 'Authorization': `Token ${token}` },
        responseType: 'blob', // Expect binary data
      });
      // --- END CORRECTION ---

      // Trigger browser download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Download failed:", err);
      // Log the URL that was actually used in case of error
      console.error('Failed URL:', `${process.env.REACT_APP_API_BASE_URL}/api/vault/files/${fileId}/download/`);
      // Improved error handling for blob responses
      let errorMsg = `Failed to download file ${filename}. `;
      if (err.response?.data instanceof Blob) {
        try {
          const errorText = await err.response.data.text();
          const errorJson = JSON.parse(errorText); // Try parsing as JSON
          errorMsg += (errorJson.detail || "Server returned error blob.");
        } catch {
          errorMsg += "Server returned non-JSON error blob.";
        }
      } else {
         errorMsg += (err.response?.data?.detail || err.message || "Unknown error");
      }
      setError(errorMsg);
    }
  };

  // --- Delete Handler ---
  const handleDelete = async (fileId, filename) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`)) {
      return; // Stop if user clicks Cancel
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      return;
    }
    setError(null);

    try {
      // --- CORRECTED URL ---
      // Construct the specific detail URL using env variable
      const deleteUrl = `${process.env.REACT_APP_API_BASE_URL}/api/vault/files/${fileId}/`;
      console.log("Attempting delete at:", deleteUrl); // Optional debug log
      const response = await axios.delete(deleteUrl, {
        headers: { 'Authorization': `Token ${token}` }
      });
      // --- END CORRECTION ---

      if (response.status === 204) {
        console.log(`Successfully deleted file metadata ${fileId}`);
        // Update UI by removing the deleted file from the state
        setFiles(currentFiles => currentFiles.filter(file => file.id !== fileId));
      } else {
         setError(`Deletion failed with status: ${response.status}`);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      // Log the URL that was actually used in case of error
      console.error('Failed URL:', `${process.env.REACT_APP_API_BASE_URL}/api/vault/files/${fileId}/`);
      setError(`Failed to delete file ${filename}. ` + (err.response?.data?.detail || err.message));
    }
  };

  // --- Conditional Rendering ---
  if (loading) {
    return <p>Loading files...</p>;
  }

  // Display error message if fetch failed
  if (error && files.length === 0) { // Show error prominently if list fails to load
    return <p className="error-message">Error: {error}</p>;
  }

  // Show message if no files exist for the user
  if (files.length === 0) {
    return <p>No files found in your vault.</p>;
  }

  // Display the list of files
  return (
    // Apply container style to the whole list section
    <div className="container-3d">
      <h3>Your Uploaded Files:</h3>
      {/* Display errors related to download/delete above the list */}
      {error && <p className="error-message">Error: {error}</p>}
      <ul style={{ padding: 0 }}> {/* Removed list-style none as it's on item */}
        {files.map(file => (
          // Apply item style to each li
          <li key={file.id} className="file-item-3d">
            <div><strong>Name:</strong> {file.original_filename}</div>
            <div><strong>Size:</strong> {file.file_size} bytes</div>
            <div><strong>Type:</strong> {file.content_type}</div>
            <div><strong>Uploaded:</strong> {new Date(file.upload_date).toLocaleString()}</div>

            {/* Action buttons */}
            <div style={{ marginTop: '10px' }}>
              <button
                onClick={() => handleDownload(file.id, file.original_filename)}
                className="button-3d" // Apply style
                style={{ marginRight: '10px' }}
              >
                  Download
              </button>
              <button
                onClick={() => handleDelete(file.id, file.original_filename)}
                className="button-3d" // Apply style
              >
                  Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FileList;

