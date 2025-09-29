export class MessageTransformer {
    static transformToWazzupFormat(entry, channelId, userName, crmUserId) {
        const senderId = entry.sender.id;
        const recipientId = entry.recipient.id;
        const messageText = entry.message?.text || '';

        return {
            messages: [{
                messageId: entry.message?.mid || '',
                dateTime: entry.timestamp || 0,
                channelId,
                chatType: "facebook",
                chatId: (senderId === channelId ? recipientId : senderId),
                type: "text",
                isEcho: entry.message?.is_echo || false,
                contact: {
                    name: userName,
                    avatarUri: ""
                },
                quotedMessage: null,
                editedMessage: null,
                text: messageText,
                status: "sending",
                authorName: "",
                authorId: crmUserId,
                contentUri: null
            }]
        };
    }

    static extractCrmUserId(entry) {
        if (!entry.message?.metadata) return 0;

        try {
            const md = JSON.parse(entry.message.metadata);
            return md.crmUserId || 0;
        } catch {
            return 0;
        }
    }
}