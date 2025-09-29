import prisma from '../../../generated/prisma/index.js';

export async function getUsersService({
  aranan,
  surec,
  tarih,
  page = 1,
  limit = 500,
  currentAdminId,
}) {
  const offset = (page - 1) * limit;

  console.log('Prisma Client:', prisma);
  console.log('Settings Model:', await prisma.settings.findMany());
  // Ayar çek
  const currentScenarioSetting = await prisma.settings.findFirst({
    where: { name: 'current_scenario' },
  });
  const currentScenario = Number(currentScenarioSetting?.value || '1');

  // Admin yetkisi
  const admin = await prisma.userSystem.findUnique({
    where: { id: currentAdminId },
  });

  if (!admin) {
    throw new Error('Unauthorized');
  }

  const whereConditions = { AND: [] };

  if (aranan) {
    whereConditions.AND.push({
      OR: [
        { phoneNumber: { contains: aranan } },
        { profileName: { contains: aranan } },
      ],
    });
  }

  if (surec) {
    whereConditions.AND.push({
      periods: {
        some: { currentStatus: Number(surec) },
      },
    });
  }

  if (tarih) {
    whereConditions.AND.push({
      chatListTwo: {
        some: {
          dateTime: { equals: new Date(tarih) },
        },
      },
    });
  }

  if (admin.role === 0) {
    whereConditions.AND.push({ userSystemId: currentAdminId });
  } else if (admin.role === 1) {
    whereConditions.AND.push({
      OR: [
        { userSystemId: currentAdminId },
        {
          userSystem: {
            userSystemId: currentAdminId,
          },
        },
      ],
    });
  }

  if (currentScenario === 8) {
    whereConditions.OR = [
      ...(whereConditions.OR || []),
      { userSystemId: 0 },
    ];
  }

  const [users, totalCount] = await Promise.all([
    prisma.userPatient.findMany({
      where: whereConditions,
      include: {
        userSystem: true,
        periods: {
          where: { NOT: { currentStatus: 9 } },
        },
        opportunities: true,
        offers: {
          orderBy: { id: 'desc' },
          take: 1,
        },
        chatListTwo: {
          where: { isEcho: { not: 1 } },
          orderBy: { dateTime: 'desc' },
          take: 1,
        },
      },
      skip: offset,
      take: limit,
      orderBy: {
        chatListTwo: {
          dateTime: 'desc',
        },
      },
    }),
    prisma.userPatient.count({
      where: whereConditions,
    }),
  ]);

  const result = users.map((u) => ({
    id: u.id,
    userSystemId: u.userSystemId,
    avatar: u.avatar,
    identityId: u.identityId,
    fileNumber: u.fileNumber,
    profileName: u.profileName,
    systemUsername: u.userSystem?.username,
    name: u.name,
    surname: u.surname,
    chatId: u.chatId,
    channelId: u.channelId,
    phoneNumber: u.phoneNumber,
    countryCode: u.countryCode,
    opportunityName: u.opportunities?.opportunityName,
    opportunityId: u.opportunityId,
    mail: u.mail,
    gender: u.gender,
    birthDate: u.birthDate,
    language: u.language,
    registerDate: u.registerDate,
    dateTime: u.chatListTwo?.[0]?.dateTime || null,
    currentStatus: u.periods?.[0]?.currentStatus ?? 1,
    chatType: u.chatType,
    amount: u.offers?.[0]?.amount,
    currency: u.offers?.[0]?.currency,
    paid_amount: u.offers?.[0]?.amount_paid,
    offer_date: u.offers?.[0]?.date,
  }));

  return {
    success: true,
    totalRecords: totalCount,
    users: result,
  };
}