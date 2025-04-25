// src/components/FileUpload.js
import React, { useState, useRef } from 'react'; // Import useRef
import axios from 'axios';

// Accept onUploadSuccess prop from parent (Login component)
function FileUpload({ onUploadSuccess }) { 
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState(''); // For success/error feedback
  const [uploading, setUploading] = useState(false); // To disable button during upload

  // Create a ref for the file input
  const fileInputRef = useRef(null);

  // Handles file selection from the input
  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
        setSelectedFile(event.target.files[0]); // Get the first selected file
        setMessage(''); // Clear previous messages
    } else {
        // Handle case where user cancels file selection
        setSelectedFile(null);
    }
  };

  // Handles the upload button click
  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a file first.");
      return;
    }
    if (uploading) {
        return; // Prevent multiple uploads
    }

    setUploading(true);
    setMessage("Uploading...");

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage("Authentication token not found. Please log in again.");
      setUploading(false);
      return;
    }

    // Create a FormData object to send the file
    const formData = new FormData();
    // Append the file with the key 'file' (matching what the backend view expects)
    formData.append('file', selectedFile, selectedFile.name); 

    try {
      // --- CORRECTED URL CONSTRUCTION ---
      // Use template literal (backticks) to correctly insert the environment variable
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/api/vault/files/`;
      console.log("Attempting upload to:", apiUrl); // Optional: log for debugging

      // Make the POST request with axios
      const response = await axios.post(apiUrl, formData, { 
        headers: {
          'Authorization': `Token ${token}`,
          // 'Content-Type': 'multipart/form-data' // Axios sets this automatically
        }
      });
      // --- END CORRECTION ---

      // Handle success
      if (response.status === 201) {
        setMessage("File uploaded successfully!"); // Simplified message
        setSelectedFile(null); // Clear the selection state
        
        // Reset the file input element visually
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; 
        }

        // Call the callback function passed from parent to trigger refresh
        if (onUploadSuccess) { 
            onUploadSuccess(); 
        }
      } else {
         setMessage(`Upload failed with status: ${response.status}`);
      }

    } catch (err) {
      // Handle errors
      console.error("Upload failed:", err);
      // Log the URL that was actually used in case of error
      console.error('Failed URL:', `${process.env.REACT_APP_API_BASE_URL}/api/vault/files/`); 
      setMessage("Upload failed. " + (err.response?.data?.detail || err.response?.statusText || err.message));
    } finally {
      // Re-enable button
      setUploading(false); 
    }
  };

  return (
    // Apply container style to the upload section
    <div className="container-3d"> 
      <h3>Upload New File:</h3>
      
      {/* Visually Hidden File Input */}
      <input 
        type="file" 
        id="actual-file-input" // ID for the label
        className="hidden-file-input" // Class for CSS hiding
        onChange={handleFileChange} 
        ref={fileInputRef} // Assign the ref
      />

      {/* Styled Label acting as the visible "Choose File" button */}
      <label htmlFor="actual-file-input" className="button-3d"> 
        Choose File 
      </label> 
      
      {/* Display selected filename */}
      {selectedFile && <span style={{ marginLeft: '10px' }}>{selectedFile.name}</span>}

      {/* Keep the actual Upload button */}
      <button 
        onClick={handleUpload} 
        disabled={!selectedFile || uploading} // Disable if no file or uploading
        className="button-3d" // Apply style
        style={{ marginLeft: '10px' }} // Add some space
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

      {/* Display feedback message */}
      {/* Add appropriate className for styling */}
      {message && <p className={message.startsWith("File uploaded successfully") ? "success-message" : "error-message"}>{message}</p>} 
    </div>
  );
}

export default FileUpload;

