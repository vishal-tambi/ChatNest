// import api from './api';

// export const authAPI = {
//   login: async (credentials) => {
//     const response = await api.post('/auth/login', credentials);
//     return response.data;
//   },

//   register: async (userData) => {
//     const response = await api.post('/auth/register', userData);
//     return response.data;
//   },

//   verifyToken: async () => {
//     const response = await api.get('/auth/verify');
//     return response.data.user;
//   },

//   logout: async () => {
//     await api.post('/auth/logout');
//   }
// };






// Temporarily replace your src/services/auth.js with this mock version
// This prevents API errors when the backend isn't running yet

export const authAPI = {
  login: async (credentials) => {
    // Mock successful login for demo purposes
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.email === 'demo@chatnest.com' && credentials.password === 'demo123') {
          resolve({
            user: {
              _id: 'demo-user-id',
              name: 'Demo User',
              email: 'demo@chatnest.com'
            },
            token: 'mock-jwt-token'
          });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000); // Simulate network delay
    });
  },

  register: async (userData) => {
    // Mock successful registration
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            _id: 'new-user-id',
            name: userData.name,
            email: userData.email
          },
          token: 'mock-jwt-token'
        });
      }, 1000);
    });
  },

  verifyToken: async () => {
    // Mock token verification - just return null for now
    // This prevents the app from trying to authenticate on page load
    return Promise.reject(new Error('No backend running'));
  },

  logout: async () => {
    // Mock logout
    return Promise.resolve();
  }
};