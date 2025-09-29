// src/modules/userlabels/userLabels.repository.js
import { prisma } from '../../utils/index.js';
import { BaseRepository } from '../base/base.repository.js';

export class UserLabelsRepository extends BaseRepository {
 constructor() {
    super();
    this._modelName = 'user_labels';
  }
async findByUserPatientId(userPatientId, labelsParam) {
  const whereClause = {
    userPatientId: Number(userPatientId),
  };

  if (labelsParam) {
    whereClause.labels = labelsParam;
  }

  return this.model.findMany({
    where: whereClause,
    include: {
      userSystem: {
        select: {
          username: true,
          name: true,
        },
      },
    },
    orderBy: {
      id: 'desc',
    },
  });
}

async updateLabels(id, data) {
  return this.model.update({
    where: { id: Number(id) },
    data,
  });
}

async findUserPatientAndSystem(userPatientId, userSystemId) {
  return this.prisma.userPatient.findFirst({
    where: {
      id: Number(userPatientId),
    },
    include: {
      userSystem: {
        where: { id: Number(userSystemId) },
        select: {
          username: true,
          name: true,
        },
      },
    },
  });
}

}
