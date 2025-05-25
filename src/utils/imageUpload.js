export const uploadImage = async (file) => {
  try {
    // Create a FormData instance
    const formData = new FormData();
    formData.append('file', file);
    
    // In a real app, you would upload to your server or a service like Cloudinary
    // For now, we'll create a local URL
    const imageUrl = URL.createObjectURL(file);
    return { success: true, url: imageUrl };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: 'Failed to upload image' };
  }
}; 