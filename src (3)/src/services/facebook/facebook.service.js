import axios from 'axios';

export class FacebookService {
    constructor() {
        this.pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';
        this.apiVersion = 'v23.0';
    }

    /**
     * Facebook Graph API üzerinden kullanıcı ID'sinden isim çeker
     * @param {string} targetId - Hedef kullanıcı ID'si
     * @returns {Promise<string>} Kullanıcı adı veya hata durumunda targetId
     */
    async getNameById(targetId) {
        try {
            const url = `https://graph.facebook.com/${this.apiVersion}/me/conversations`;
            const params = {
                fields: 'participants{profile_pic,name,id}',
                access_token: this.pageAccessToken
            };

            const response = await axios.get(url, { params });
            const data = response.data;

            if (!data.data) {
                console.warn('Facebook API: No conversation data found');
                return targetId;
            }

            // Tüm konuşmalarda kullanıcıyı ara
            for (const conversation of data.data) {
                for (const participant of conversation.participants.data) {
                    if (participant.id === targetId) {
                        return participant.name || targetId;
                    }
                }
            }

            return targetId;
        } catch (error) {
            console.error('Facebook API getNameById error:', error.message);
            return targetId;
        }
    }

    /**
     * Facebook Graph API ile kullanıcı profil bilgisi çeker
     * @param {string} userId - Kullanıcı ID'si
     * @returns {Promise<Object>} Kullanıcı profil bilgileri
     */
    async getUserProfile(userId) {
        try {
            const url = `https://graph.facebook.com/${this.apiVersion}/${userId}`;
            const params = {
                fields: 'name,profile_pic',
                access_token: this.pageAccessToken
            };

            const response = await axios.get(url, { params });
            return response.data;
        } catch (error) {
            console.error('Facebook API getUserProfile error:', error.message);
            return null;
        }
    }

    /**
     *  Facebook Graph API ile mesaj gönderir
     * @param {*} messageData.recipient - Alıcı bilgisi
     * @param {*} messageData.message - Mesaj içeriği
     * @returns {Promise<Object>} API'den gelen yanıt
     */
    async sendMessage(messageData) {
        try {
            const url = `https://graph.facebook.com/v23.0/me/messages?access_token=${process.env.FACEBOOK_PAGE_ACCESS_TOKEN}`;

            const response = await axios.post(url, messageData, {
                headers: { 'Content-Type': 'application/json' }
            });

            return response.data;
        } catch (error) {
            throw new Error(`Facebook API Error: ${error.response?.data?.error?.message || error.message}`);
        }
    }
}