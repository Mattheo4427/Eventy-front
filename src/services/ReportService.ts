import { api } from './api';

export const ReportService = {
  createReport: async (data: {
    reportedUserId?: string;
    reportedTicketId?: string;
    reportedTransactionId?: string;
    reportType: 'SPAM' | 'FRAUD' | 'HARASSMENT' | 'INAPPROPRIATE_CONTENT' | 'OTHER';
    reason: string;
    description?: string;
    evidence?: string;
  }): Promise<void> => {
    await api.post('/interactions/reports', data);
  },
};
