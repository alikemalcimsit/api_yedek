export class ReportsController {
  constructor({ reportsService }) {
    this.service = reportsService;
  }

  // BigInt'leri temizleyen yardımcı fonksiyon
  cleanBigInts(data) {
    if (Array.isArray(data)) {
      return data.map(item => this.cleanBigInts(item));
    } else if (typeof data === 'object' && data !== null) {
      const cleaned = {};
      for (const key in data) {
        const value = data[key];
        cleaned[key] = typeof value === 'bigint' ? Number(value) : value;
      }
      return cleaned;
    }
    return data;
  }

  async newDialogs(req, res, next) {
    try {
      const result = await this.service.getNewDialogs(req.query);
      res.json(this.cleanBigInts(result));
    } catch (err) {
      next(err);
    }
  }

  async taskStatusDistribution(req, res, next) {
    try {
      const result = await this.service.getTaskStatusDistribution(req.query);
      res.json(this.cleanBigInts(result));
    } catch (err) {
      next(err);
    }
  }

  async messageCounts(req, res, next) {
    try {
      const result = await this.service.getMessageCounts(req.query);
      res.json(this.cleanBigInts(result));
    } catch (err) {
      next(err);
    }
  }

  async responseTimeAnalysis(req, res, next) {
    try {
      const result = await this.service.getResponseTimeAnalysis(req.query);
      res.json(this.cleanBigInts(result));
    } catch (err) {
      next(err);
    }
  }

  async userPatientRegistrations(req, res, next) {
    try {
      const result = await this.service.getUserPatientRegistrations(req.query);
      res.json(this.cleanBigInts(result));
    } catch (err) {
      next(err);
    }
  }

  async appointmentCounts(req, res, next) {
    try {
      const result = await this.service.getAppointmentCounts(req.query);
      res.json(this.cleanBigInts(result));
    } catch (err) {
      next(err);
    }
  }

  async userLabelDetails(req, res, next) {
    try {
      const result = await this.service.getUserLabelDetails(req.query);
      res.json(this.cleanBigInts(result));
    } catch (err) {
      next(err);
    }
  }

  async userNoteDetails(req, res, next) {
    try {
      const result = await this.service.getUserNoteDetails(req.query);
      res.json(this.cleanBigInts(result));
    } catch (err) {
      next(err);
    }
  }

  async totalOffers(req, res, next) {
    try {
      const result = await this.service.getTotalOffers(req.query);
      res.json(this.cleanBigInts(result));
    } catch (err) {
      next(err);
    }
  }

  async offersUnified(req, res, next) {
    try {
      const result = await this.service.getOffersUnified(req.query);
      res.json(this.cleanBigInts(result));
    } catch (err) {
      next(err);
    }
  }

  async userDepartments(req, res, next) {
    try {
      const result = await this.service.getUserDepartments(req.query);
      res.json(this.cleanBigInts(result));
    } catch (err) {
      next(err);
    }
  }

  async chatTypes(req, res, next) {
    try {
      const result = await this.service.getChatTypes(req.query);
      res.json(this.cleanBigInts(result));
    } catch (err) {
      next(err);
    }
  }

  async userPatientByChannel(req, res, next) {
    try {
      const result = await this.service.getUserPatientByChannel(req.query);
      res.json(this.cleanBigInts(result));
    } catch (err) {
      next(err);
    }
  }
}
