export class ReportsService {
  constructor({ reportsRepository }) {
    this.repo = reportsRepository;
  }

  async getNewDialogs(params) {
    return this.repo.fetchNewDialogs(params);
  }


  async getTaskStatusDistribution(params) {
    return this.repo.fetchTaskStatusDistribution(params);
  }

  async getMessageCounts(params) {
    return this.repo.fetchMessageCounts(params);
  }

  async getResponseTimeAnalysis(params) {
    return this.repo.fetchResponseTimeAnalysis(params);
  }

  async getUserPatientRegistrations(params) {
    return this.repo.fetchUserPatientRegistrations(params);
  }

  async getAppointmentCounts(params) {
    return this.repo.fetchAppointmentCounts(params);
  }

  async getUserLabelDetails(params) {
    return this.repo.fetchUserLabelDetails(params);
  }

  async getUserNoteDetails(params) {
    return this.repo.fetchUserNoteDetails(params);
  }

  async getTotalOffers(params) {
    return this.repo.fetchTotalOffers(params);
  }

  async getOffersUnified(params) {
    return this.repo.fetchOffersUnified(params);
  }

  async getUserDepartments(params) {
    return this.repo.fetchUserDepartments(params);
  }

  async getChatTypes(params) {
    return this.repo.fetchChatTypes(params);
  }

  async getUserPatientByChannel(params) {
    return this.repo.fetchUserPatientByChannel(params);
  }
}
