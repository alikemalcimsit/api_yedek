import { prisma } from '../../utils/index.js';

export class ReportsRepository {
    // ✅ Yeni Diyaloglar
    async fetchNewDialogs({ periods, detail }) {
        let whereClause = this.buildPeriodClause('dateTime', periods);
        let groupByClause = this.buildGroupByClause('dateTime', detail);

        return prisma.$queryRawUnsafe(`
    SELECT ${groupByClause} AS message_date,
           COUNT(DISTINCT chatid) AS chatid_count,
           COUNT(CASE WHEN isEcho = '1' OR userSystemId <> 0 THEN chatId END) AS sent_count,
           COUNT(CASE WHEN isEcho = '' AND userSystemId = 0 THEN chatId END) AS inbound_count
    FROM chatListTwo
    WHERE ${whereClause}
    GROUP BY message_date
    ORDER BY message_date;
  `);
    }



    // ✅ Görev Durumu Dağılımı
    async fetchTaskStatusDistribution({ periods }) {
        let whereClause = this.buildPeriodClause('t.taskFinishDate', periods);

        return prisma.$queryRawUnsafe(`
      SELECT s.statusName,
             COUNT(t.id) AS taskCount
      FROM task t
      LEFT JOIN userPatient up ON up.id = t.userPatientId
      LEFT JOIN periods p ON p.userPatientId = up.id
      LEFT JOIN status s ON s.id = p.currentStatus
      WHERE ${whereClause}
      GROUP BY s.id;
    `);
    }



    // ✅ Mesaj Sayıları
    async fetchMessageCounts({ periods }) {
        let whereClause = this.buildPeriodClause('clt.dateTime', periods);

        return prisma.$queryRawUnsafe(`
      SELECT us.id,
             us.name,
             COUNT(DISTINCT CASE WHEN clt.isEcho = '1' THEN clt.id END) AS sendMessageCount,
             COUNT(DISTINCT CASE WHEN clt.isEcho != '1' THEN clt.id END) AS inboundMessageCount
      FROM userSystem us
      JOIN userPatient up ON us.id = up.userSystemId
      JOIN chatListTwo clt ON up.id = clt.userPatientId
      WHERE ${whereClause}
      GROUP BY us.id, us.username
      ORDER BY us.username ASC;
    `);
    }



    // ✅ Yanıt Süreleri
    async fetchResponseTimeAnalysis({ periods }) {
        let whereClause = this.buildPeriodClause('m1.dateTime', periods);

        return prisma.$queryRawUnsafe(`
     SELECT us.id,
       us.name,
       COUNT(DISTINCT up.id) AS total_patients,
       AVG(response_time) AS avg_response_time_seconds,
       MIN(response_time) AS min_response_time_seconds,
       MAX(response_time) AS max_response_time_seconds
FROM (
    SELECT m1.userPatientId,
           m2.userSystemId,
           TIMESTAMPDIFF(SECOND, m1.dateTime, m2.dateTime) AS response_time
    FROM chatListTwo m1
    JOIN chatListTwo m2 ON m1.userPatientId = m2.userPatientId
    WHERE m1.isEcho <> 1
      AND m2.isEcho = 1
      AND m2.dateTime > m1.dateTime
      AND NOT EXISTS (
          SELECT 1 FROM chatListTwo m3
          WHERE m3.userPatientId = m1.userPatientId
            AND m3.dateTime > m1.dateTime
            AND m3.dateTime < m2.dateTime
      )
      AND ${whereClause}
) AS response_times
JOIN userPatient up ON response_times.userPatientId = up.id
JOIN userSystem us ON up.userSystemId = us.id
WHERE us.role <> 2
GROUP BY us.id, us.name
ORDER BY avg_response_time_seconds;
`);
    }

    // ✅ Kullanıcı Kayıtları
    async fetchUserPatientRegistrations({ periods }) {
        let whereClause = this.buildPeriodClause('up.registerDate', periods);

        return prisma.$queryRawUnsafe(`
      SELECT DATE(up.registerDate) AS register_date,
             COUNT(up.id) AS userCount
      FROM userPatient up
      WHERE ${whereClause}
      GROUP BY DATE(up.registerDate)
      ORDER BY register_date;
    `);
    }

    // ✅ Alınan Randevu Sayıları
    async fetchAppointmentCounts({ periods }) {
        let whereClause = this.buildPeriodClause('a.date', periods);

        return prisma.$queryRawUnsafe(`
      SELECT u.name,
             COUNT(*) AS appointmentCount
      FROM appointments a
      JOIN userSystem u ON a.userSystemId = u.id
      WHERE ${whereClause}
      GROUP BY DATE(a.date), u.name
      ORDER BY appointmentCount DESC
      LIMIT 10;
    `);
    }

    // ✅ Etiket Detayları
 
    async fetchUserLabelDetails({ startDate, endDate }) {
    return prisma.$queryRawUnsafe(`
      SELECT up.id AS user_id,
             MAX(up.profileName) AS full_name,
             MAX(up.phoneNumber) AS phoneNumber,
             MAX(up.chatType) AS chatType,
             MAX(up.chatId) AS chatId,
             MAX(up.avatar) AS avatar,
             MAX(us.name) AS system_user_name,
             MAX(ul.updatedAt) AS updatedAt,
             MIN(ul.createdAt) AS createdAt,
             GROUP_CONCAT(labels.label_name SEPARATOR ', ') AS assigned_labels
      FROM userPatient up
      INNER JOIN userSystem us ON us.id = up.userSystemId
      INNER JOIN user_labels ul ON up.id = ul.userPatientId
      LEFT JOIN labels ON FIND_IN_SET(labels.id, ul.labels) > 0
      WHERE DATE(ul.updatedAt) BETWEEN '${startDate}' AND '${endDate}'
      GROUP BY up.id
      HAVING assigned_labels IS NOT NULL
      ORDER BY updatedAt DESC;
    `);
}


    // ✅ Not Detayları
    async fetchUserNoteDetails({ startDate, endDate }) {
        return prisma.$queryRawUnsafe(`
      SELECT up.id AS user_id,
             up.profileName AS full_name,
             up.phoneNumber,
             up.chatType,
             up.chatId,
             up.avatar,
             us.name AS system_user_name,
             ul.id AS note_id,
             ul.notes,
             ul.createdAt,
             ul.updatedAt
      FROM user_notes ul
      INNER JOIN userPatient up ON up.id = ul.userPatientId
      LEFT JOIN userSystem us ON us.id = ul.userSystemId
      WHERE DATE(ul.updatedAt) BETWEEN '${startDate}' AND '${endDate}'
      ORDER BY ul.updatedAt DESC;
    `);
    }

    // ✅ Toplam Teklifler
    async fetchTotalOffers({ startDate, endDate }) {
        return prisma.$queryRawUnsafe(`
      SELECT currency,
             SUM(amount) AS total_offered,
             SUM(amount_paid) AS total_paid
      FROM offers
      WHERE date BETWEEN '${startDate}' AND '${endDate}'
      GROUP BY currency
      ORDER BY currency;
    `);
    }

    // ✅ Teklif Detayları
    async fetchOffersUnified({ startDate, endDate }) {
        return prisma.$queryRawUnsafe(`
      SELECT o.id AS offerId,
             o.userPatientId,
             up.name AS patientName,
             up.surname AS patientSurname,
             up.profileName AS patientProfileName,
             up.phoneNumber,
             us.username AS systemUsername,
             o.amount,
             o.currency,
             o.amount_paid,
             o.date,
             o.selected_services
      FROM offers o
      INNER JOIN userPatient up ON o.userPatientId = up.id
      INNER JOIN userSystem us ON o.userSystemId = us.id
      WHERE o.date BETWEEN '${startDate}' AND '${endDate}'
      ORDER BY o.date DESC, o.userPatientId, o.currency;
    `);
    }

    // ✅ Departman Raporu
    async fetchUserDepartments({ periods }) {
        let whereClause = this.buildPeriodClause('ud.createdAt', periods);

        return prisma.$queryRawUnsafe(`
      SELECT us.id AS userSystemId,
             us.username,
             d.id AS departmentId,
             d.department,
             COUNT(ud.id) AS departmentCount
      FROM user_departments ud
      LEFT JOIN departments d ON d.id = ud.departmentId
      LEFT JOIN userSystem us ON us.id = ud.userSystemId
      WHERE ${whereClause}
      GROUP BY us.id, us.username, d.id, d.department
      ORDER BY us.username, d.department DESC;
    `);
    }

    // ✅ Chat Tipleri
    async fetchChatTypes({ periods }) {
        let whereClause = this.buildPeriodClause('up.registerDate', periods);

        return prisma.$queryRawUnsafe(`
      SELECT up.chatType,
             COUNT(up.id) AS userCount
      FROM userPatient up
      WHERE ${whereClause}
      GROUP BY up.chatType
      ORDER BY userCount DESC;
    `);
    }

    // ✅ Kanal Bazlı Kullanıcı Raporu
    async fetchUserPatientByChannel({ periods }) {
        let whereClause = this.buildPeriodClause('up.registerDate', periods);

        return prisma.$queryRawUnsafe(`
      SELECT up.channelId,
             up.chatType,
             COUNT(up.id) AS userCount
      FROM userPatient up
      WHERE up.channelId IS NOT NULL AND up.channelId != '' AND up.channelId != '0'
        AND ${whereClause}
      GROUP BY up.channelId, up.chatType
      ORDER BY userCount DESC, up.channelId;
    `);
    }

    // Yardımcı fonksiyonlar
    buildPeriodClause(column, periods) {
        if (periods === 'week') return `YEARWEEK(${column}, 1) = YEARWEEK(CURDATE(), 1)`;
        if (periods === 'month') return `DATE_FORMAT(${column}, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')`;
        if (periods === 'year') return `YEAR(${column}) = YEAR(CURDATE())`;
        if (periods === 'day') return `DATE(${column}) = CURDATE()`;
        return '1'; // default: tüm kayıtlar
    }

    buildGroupByClause(column, detail) {
        if (detail === 'days') return `DATE(${column})`;
        if (detail === 'week') return `YEARWEEK(${column}, 1)`;
        if (detail === 'month') return `DATE_FORMAT(${column}, '%Y-%m')`;
        return `DATE(${column})`;
    }
}
