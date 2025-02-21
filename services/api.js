export const faqApi = {
  // Get all FAQs
  getAllFaqs: async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';
      const response = await fetch(`${baseUrl}/api/faqs`);
      if (!response.ok) throw new Error('Failed to fetch FAQs');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Create new FAQ
  createFaq: async (faqData) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';
      const response = await fetch(`${baseUrl}/api/faqs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(faqData),
      });
      if (!response.ok) throw new Error('Failed to create FAQ');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Update FAQ
  updateFaq: async (id, faqData) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';
      const response = await fetch(`${baseUrl}/api/faqs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(faqData),
      });
      if (!response.ok) throw new Error('Failed to update FAQ');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Delete FAQ
  deleteFaq: async (id) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';
      const response = await fetch(`${baseUrl}/api/faqs/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete FAQ');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
}; 