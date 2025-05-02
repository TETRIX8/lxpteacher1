
import api from './apiClient';

export const userAPI = {
  getTeacherInfo: async () => {
    const query = `
    query GetMe {
      getMe {
        avatar
        createdAt
        email
        firstName
        lastName
        middleName
        id
        isLead
        roles
        phoneNumber
        legalDocumentsApprovedAt
        notificationsSettings {
          isPushDailyDigestOnEmail
          __typename
        }
        assignedSuborganizations {
          suborganization {
            name
            organization {
              name
            }
            __typename
          }
          __typename
        }
        teacher {
          assignedDisciplines_V2 {
            discipline {
              id
              name
              code
              archivedAt
              studyPeriods {
                name
                startDate
                endDate
                __typename
              }
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
    }
    `;

    try {
      const response = await api.post('', { query });
      return response.data.data.getMe;
    } catch (error) {
      console.error('Error fetching teacher info:', error);
      throw error;
    }
  }
};
