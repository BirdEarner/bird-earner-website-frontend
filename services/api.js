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

// Admin Authentication API
export const adminAuthApi = {
  // Admin login
  login: async (email, password) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';
      const response = await fetch(`${baseUrl}/api/admins/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Login API Error:', error);
      throw error;
    }
  },

  // Admin signup
  signup: async (name, email, password, role = 'admin') => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';
      const response = await fetch(`${baseUrl}/api/admins/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Signup API Error:', error);
      throw error;
    }
  },

  // Verify token (check if user is authenticated)
  verifyToken: async (token) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';
      const response = await fetch(`${baseUrl}/api/admins/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Token verification failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Token verification API Error:', error);
      throw error;
    }
  },

  // Get all admins (requires superadmin)
  getAllAdmins: async (token) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';
      const response = await fetch(`${baseUrl}/api/admins`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch admins');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get all admins API Error:', error);
      throw error;
    }
  },

  // Delete admin (requires superadmin)
  deleteAdmin: async (token, adminId) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';
      const response = await fetch(`${baseUrl}/api/admins/delete/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete admin');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Delete admin API Error:', error);
      throw error;
    }
  },
};

export const contactApi = {
  // Submit contact form
  submitContactForm: async (contactData) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';
      const response = await fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle validation errors
        if (response.status === 400 && data.errors) {
          const error = new Error('Validation error');
          error.message = JSON.stringify(data);
          throw error;
        }
        throw new Error(data.message || 'Failed to submit contact form');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Get all contact submissions (admin only)
  getAllContacts: async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';
      const response = await fetch(`${baseUrl}/api/contact`);
      if (!response.ok) throw new Error('Failed to fetch contacts');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Mark contact as read (admin only)
  markAsRead: async (id) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';
      const response = await fetch(`${baseUrl}/api/contact/${id}/read`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to mark contact as read');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Delete contact submission (admin only)
  deleteContact: async (id) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';
      const response = await fetch(`${baseUrl}/api/contact/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete contact');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};