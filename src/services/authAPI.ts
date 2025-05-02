
import api from './apiClient';

export const authAPI = {
  signIn: async (email: string, password: string) => {
    const query = `
    query SignIn($input: SignInInput!) {
      signIn(input: $input) {
        user {
          id
          isLead
          __typename
        }
        accessToken
        __typename
      }
    }
    `;
    
    const variables = {
      input: { email, password }
    };

    try {
      const response = await api.post('', { query, variables });
      const accessToken = response.data.data.signIn.accessToken;
      localStorage.setItem('accessToken', accessToken);
      return accessToken;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  }
};
