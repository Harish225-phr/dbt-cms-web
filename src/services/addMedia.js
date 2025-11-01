import apiEndpoints from "../api/endpoints";

export const addMedia = async (formData) => {
  try {
    const token = sessionStorage.getItem('token');
    const tokenType = sessionStorage.getItem('tokenType') || 'Bearer';
    
    // Use fetch directly with FormData for file uploads
    const response = await fetch(apiEndpoints.addMedia(), {
      method: 'POST',
      headers: {
        'Authorization': token ? `${tokenType} ${token}` : '',
        'X-channel-Id': 'WEB',
        'Project': 'HPDBT',
      },
      body: formData
    });
    
    const data = await response.json();

    if (response.ok && data) {
      console.log('Media upload successful:', data);
      return { success: true, data: data };
    } else {
      console.error('Media upload failed:', data);
      return {
        success: false,
        message: data?.message || 'Failed to upload media'
      };
    }
  } catch (error) {
    console.error('Error uploading media:', error);
    const errorMessage = error.message || 'Error uploading media';
    return { success: false, message: errorMessage };
  }
};