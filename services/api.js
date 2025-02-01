export const faqApi = {
  // Get all FAQs
  getAllFaqs: async () => {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/api/faqs`);
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
      const response = await fetch(`${process.env.API_BASE_URL}/api/faqs`, {
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
      const response = await fetch(`${process.env.API_BASE_URL}/api/faqs/${id}`, {
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
      const response = await fetch(`${process.env.API_BASE_URL}/api/faqs/${id}`, {
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