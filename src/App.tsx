import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './App.css';

interface ApiResponse {
  squareFoot: number;
  var: number;
}

function App() {
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string>('');

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setError('');
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
      
      await uploadFile(selectedFile);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
    }
  });

  const uploadFile = async (fileToUpload: File) => {
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const response = await axios.post<ApiResponse>('https://floor-plan-area-fxdpb2b6g-parth-kalsariyas-projects-20384910.vercel.app/api/calculate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to calculate area');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImagePreview('');
    setResult(null);
    setError('');
  };

  return (
    <div className="app-container">
      <h1 className="title">Floor Plan Carpet Area Checker</h1>
      
      <div className="content">
        {!imagePreview ? (
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            <>
              <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="dropzone-text">
                {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
              </p>
            </>
          </div>
        ) : (
          <>
            <div className="image-preview">
              <img src={imagePreview} alt="Floor plan preview" />
            </div>

            {error && <div className="error">{error}</div>}
            
            {result && !loading && (
              <div className="result">
                <h2>Result</h2>
                <div className="result-grid">
                  <div className="result-item">
                    <span className="result-label">Square Foot:</span>
                    <span className="result-value">{result.squareFoot.toFixed(2)} sq ft</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Var:</span>
                    <span className="result-value">{result.var.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {!loading && (imagePreview || result) && (
        <button className="reset-button" onClick={handleReset}>
          Reset
        </button>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loader"></div>
            <p className="loading-text">Model is too large, it generally takes up to 5 minutes. Thanks for your patience.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
