import { prisma } from '../../utils/index.js';
import { BaseRepository } from '../base/base.repository.js';

export class TaskRepository extends BaseRepository {
  constructor() {
    super();
    this._modelName = 'task';
  }

  // Yeni görev oluşturmak BaseRepository'deki create metodu yeterli, ek bir şey yapmana gerek yok.

  // userPatientId'ye göre görevler
  async findByUserPatientId(userPatientId) {
    return this.model.findMany({
      where: { userPatientId: Number(userPatientId) },
      orderBy: [
        { taskFinishDate: 'asc' },
        { taskFinishTime: 'desc' }
      ],
      include: {
        userSystem: {
          select: { username: true }
        }
      }
    });
  }

  // userSystemId'ye göre görevler (ilişkili patient ve opportunity dahil)
  async findByUserSystemId(userSystemId) {
    if (!userSystemId) throw new Error('Geçersiz userSystemId');

    return this.model.findMany({
      where: { userSystemId: Number(userSystemId) },
      orderBy: { taskStartDate: 'desc' },
      include: {
        userSystem: { select: { username: true } },
        userPatient: {
          select: {
            id: true,
            userSystemId: true,
            identityId: true,
            fileNumber: true,
            profileName: true,
            avatar: true,
            name: true,
            surname: true,
            channelId: true,
            chatId: true,
            chatType: true,
            phoneNumber: true,
            countryCode: true,
            mail: true,
            gender: true,
            birthDate: true,
            language: true,
            registerDate: true,
            periods: {
              take: 1,
              orderBy: { id: 'desc' },
              select: { opportunityId: true, opportunity: true }
            }
          }
        }
      }
    });
  }

  // userSystemId'ye göre bugün aktif görevler
  async findActiveByUserSystemId(userSystemId) {
    if (!userSystemId) throw new Error('Geçersiz userSystemId');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.model.findMany({
      where: {
        userSystemId: Number(userSystemId),
        taskStartDate: { lte: today },
        taskFinishDate: { gte: today }
      },
      orderBy: { taskStartDate: 'desc' }
    });
  }

  // Tüm görevler (ilişkili veriler dahil)
  async findAllWithRelations() {
    return this.model.findMany({
      orderBy: { taskStartDate: 'desc' },
      include: {
        userSystem: { select: { username: true } },
        userPatient: {
          select: {
            id: true,
            userSystemId: true,
            identityId: true,
            fileNumber: true,
            profileName: true,
            avatar: true,
            name: true,
            surname: true,
            channelId: true,
            chatId: true,
            chatType: true,
            phoneNumber: true,
            countryCode: true,
            mail: true,
            gender: true,
            birthDate: true,
            language: true,
            registerDate: true,
            periods: {
              take: 1,
              orderBy: { id: 'desc' },
              select: { opportunityId: true, opportunity: true }
            }
          }
        }
      }
    });
  }

  // Admin için yaklaşan görevler
  async findUpcomingByAdmin(userSystemId) {
    if (!userSystemId) throw new Error('Geçersiz userSystemId');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.model.findMany({
      where: {
        userSystemId: Number(userSystemId),
        OR: [
          { taskStartDate: { gte: today } },
          { taskFinishDate: { gte: today } }
        ]
      },
      orderBy: { taskStartDate: 'asc' },
      include: {
        userPatient: true,
        userSystem: { select: { username: true } }
      }
    });
  }
}
