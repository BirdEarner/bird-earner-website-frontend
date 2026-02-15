const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export const adminWithdrawalApi = {
  getWithdrawalRequests: async ({
    token,
    page = 1,
    pageSize = 8,
    status = "all",
    search = "",
  }) => {
    const url = `${baseUrl}/api/admin/withdrawal-requests?page=${page}&pageSize=${pageSize}&status=${status}&search=${encodeURIComponent(
      search
    )}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    if (!response.ok) throw new Error("Failed to fetch withdrawal requests");
    return await response.json();
  },
  updateWithdrawalStatus: async (token, id, status) => {
    const url = `${baseUrl}/api/admin/withdrawal-requests/${id}`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error("Failed to update withdrawal status");
    return await response.json();
  },
};

export const adminPaymentApi = {
  getPaymentHistory: async ({ token, page = 1, pageSize = 8, search = "" }) => {
    const url = `${baseUrl}/api/admin/payment-history?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    if (!response.ok) throw new Error('Failed to fetch payment history');
    return await response.json();
  },
};
export const faqApi = {
  // Get all FAQs
  getAllFaqs: async () => {
    try {
      const response = await fetch(`${baseUrl}/api/faqs`);
      if (!response.ok) throw new Error("Failed to fetch FAQs");
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // Create new FAQ
  createFaq: async (faqData) => {
    try {
      const response = await fetch(`${baseUrl}/api/faqs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(faqData),
      });
      if (!response.ok) throw new Error("Failed to create FAQ");
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // Update FAQ
  updateFaq: async (id, faqData) => {
    try {
      const response = await fetch(`${baseUrl}/api/faqs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(faqData),
      });
      if (!response.ok) throw new Error("Failed to update FAQ");
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // Delete FAQ
  deleteFaq: async (id) => {
    try {
      const response = await fetch(`${baseUrl}/api/faqs/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete FAQ");
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
};

// Admin Authentication API
export const adminAuthApi = {
  // Admin login
  login: async (email, password) => {
    try {
      const response = await fetch(`${baseUrl}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Login API Error:", error);
      throw error;
    }
  },

  // Admin signup
  signup: async (name, email, password, role = "admin") => {
    try {
      const response = await fetch(`${baseUrl}/api/admin/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Signup failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Signup API Error:", error);
      throw error;
    }
  },

  // Verify token (check if user is authenticated)
  verifyToken: async (token) => {
    try {
      const response = await fetch(`${baseUrl}/api/admin/verify`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Token verification failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Token verification API Error:", error);
      throw error;
    }
  },

  // Get all admins (requires superadmin)
  getAllAdmins: async (token) => {
    try {
      const response = await fetch(`${baseUrl}/api/admin/list`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch admins");
      }

      return await response.json();
    } catch (error) {
      console.error("Get all admins API Error:", error);
      throw error;
    }
  },

  // Delete admin (requires superadmin)
  deleteAdmin: async (token, adminId) => {
    try {
      const response = await fetch(`${baseUrl}/api/admin/delete/${adminId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete admin");
      }

      return await response.json();
    } catch (error) {
      console.error("Delete admin API Error:", error);
      throw error;
    }
  },
};

export const contactApi = {
  // Submit contact form
  submitContactForm: async (contactData) => {
    try {
      const response = await fetch(`${baseUrl}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (response.status === 400 && data.errors) {
          const error = new Error("Validation error");
          error.message = JSON.stringify(data);
          throw error;
        }
        throw new Error(data.message || "Failed to submit contact form");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // Get all contact submissions (admin only)
  getAllContacts: async (token) => {
    try {
      const response = await fetch(`${baseUrl}/api/admin/contacts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error("Failed to fetch contacts");
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // Mark contact as read (admin only)
  markAsRead: async (token, id) => {
    try {
      const response = await fetch(`${baseUrl}/api/admin/contacts/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error("Failed to mark contact as read");
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // Delete contact submission (admin only)
  deleteContact: async (token, id) => {
    try {
      const response = await fetch(`${baseUrl}/api/admin/contacts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error("Failed to delete contact");
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
};

// Admin Client Management API
export const adminClientApi = {
  // Get all clients with enhanced details for admin panel
  getAllClients: async (token, page = 1, limit = 8, search = "") => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: search,
      });

      const response = await fetch(
        `${baseUrl}/api/admin/clients?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      if (!response.ok) throw new Error("Failed to fetch clients");
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // Update client availability status
  updateClientAvailability: async (token, clientId, currently_available) => {
    try {
      const response = await fetch(
        `${baseUrl}/api/admin/clients/${clientId}/availability`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ currently_available }),
        }
      );
      if (!response.ok) throw new Error("Failed to update client availability");
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // Get client details with jobs and freelancers
  getClientDetails: async (clientId) => {
    try {
      const response = await fetch(
        `${baseUrl}/api/admin/clients/${clientId}/details`
      );
      if (!response.ok) throw new Error("Failed to fetch client details");
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // Get client statistics
  getClientStats: async () => {
    try {
      const response = await fetch(`${baseUrl}/api/admin/clients/stats`);
      if (!response.ok) throw new Error("Failed to fetch client statistics");
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
};

export const adminFreelancerApi = {
  // Get all freelancers (admin panel)
  getAllFreelancers: async ({ token, page = 1, limit = 8, search = "" } = {}) => {
    try {
      const params = new URLSearchParams({ page, limit, search });
      const response = await fetch(
        `${baseUrl}/api/admin/freelancers?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      if (!response.ok) throw new Error("Failed to fetch freelancers");
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // Update freelancer availability
  updateAvailability: async (token, freelancerId, currently_available) => {
    try {
      const response = await fetch(
        `${baseUrl}/api/admin/freelancers/${freelancerId}/availability`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ currently_available }),
        }
      );
      if (!response.ok)
        throw new Error("Failed to update freelancer availability");
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
};

export const adminServiceApi = {
  // Get all services with pagination and search
  getAllServices: async ({ token, page = 1, limit = 8, search = "", category = "" } = {}) => {
    try {
      const params = new URLSearchParams({ page, limit, search, category });
      const response = await fetch(
        `${baseUrl}/api/admin/services?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      if (!response.ok) throw new Error("Failed to fetch services");
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // Create new service
  createService: async (formData) => {
    try {
      // First upload the image if it exists
      if (formData.get('image')) {
        const imageFormData = new FormData();
        imageFormData.append('file', formData.get('image'));
        imageFormData.append('category', 'service_images');

        console.log({ imageFormData });

        const uploadResponse = await fetch(`${baseUrl}/api/upload?category=service_images`, {
          method: "POST",
          headers: {
            // Authorization: `Bearer ${this.token}`,
            Accept: "application/json",
            // ⚠️ DO NOT manually set 'Content-Type' for FormData — let fetch handle it
          },
          body: imageFormData
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }

        const uploadResult = await uploadResponse.json();
        formData.delete('image');
        formData.append('imageUrl', uploadResult.data.url);
      }

      const formDataObj = {};
      formData.forEach((value, key) => {
        formDataObj[key] = value;
      });


      const response = await fetch(`${baseUrl}/api/admin/services`, {
        method: "POST",
        body: JSON.stringify(formDataObj),
        headers: {
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create service");
      }
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // Update service
  updateService: async (serviceId, formData) => {
    try {
      // First upload the image if it exists
      if (formData.get('image')) {
        const imageFormData = new FormData();
        imageFormData.append('file', formData.get('image'));
        imageFormData.append('category', 'service_images');

        console.log({ imageFormData });


        const uploadResponse = await fetch(`${baseUrl}/api/upload?category=service_images`, {
          method: "POST",
          body: imageFormData,
          headers: {
            // Authorization: `Bearer ${this.token}`,
            Accept: "application/json",
            // ⚠️ DO NOT manually set 'Content-Type' for FormData — let fetch handle it
          },
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }

        const uploadResult = await uploadResponse.json();
        formData.delete('image');
        formData.append('imageUrl', uploadResult.data.url);
      }

      const formDataObj = {};

      formData.forEach((value, key) => {
        formDataObj[key] = value;
      });

      const response = await fetch(
        `${baseUrl}/api/admin/services/${serviceId}`,
        {
          method: "PUT",
          body: JSON.stringify(formDataObj),
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update service");
      }
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // Delete service
  deleteService: async (serviceId) => {
    try {
      const response = await fetch(
        `${baseUrl}/api/admin/services/${serviceId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete service");
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
};

export const loadImageURI = (uri) => {
  console.log({ uri });

  if (!Boolean(uri)) {
    return null;
  } else if (uri.startsWith("http://") || uri.startsWith("https://")) {
    return uri; // Return remote URL as is
  } else if (uri.startsWith("/")) {
    return `${baseUrl}/api${uri}`; // Convert relative path to absolute URL
  } else if (uri.startsWith("file://") || uri.startsWith("blob:") || uri.startsWith("data:")) {
    // console.warn(
    //   "File is being loaded from local storage, ensure this is intended."
    // );
    return uri; // Handle other cases (e.g., local paths)
  } else {
    console.error("Invalid URI format:", uri);
    return null; // Return null for invalid URIs
  }
};
