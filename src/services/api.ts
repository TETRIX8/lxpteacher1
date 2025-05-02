
import api from './apiClient';
import { authAPI } from './authAPI';
import { userAPI } from './userAPI';
import { disciplinesAPI, documentGenerationAPI } from './disciplinesAPI';

// Re-export all APIs for backward compatibility
export { 
  authAPI, 
  userAPI, 
  disciplinesAPI 
};

// Re-export the document generation API as part of disciplinesAPI for compatibility
Object.assign(disciplinesAPI, {
  generateGroupCharacteristicsPDF: documentGenerationAPI.generateGroupCharacteristicsPDF,
  generateGroupCharacteristicsWord: documentGenerationAPI.generateGroupCharacteristicsWord,
  generateGroupCharacteristicsExcel: documentGenerationAPI.generateGroupCharacteristicsExcel
});

export default api;
