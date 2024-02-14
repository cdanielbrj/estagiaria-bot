import { InteractionResponseType } from 'discord-interactions';

const tiktok = {
    name: 'tiktok',
    execute() {
        const messages = [
            'Toda essa canalhice fica lá no TikTok -> https://www.tiktok.com/@seehden',
            'Você ainda não me segue pra ver esse conteúdo duvidoso? Tá de bobeira aí... -> https://www.tiktok.com/@seehden',
            'Follow + Like = Humilde -> https://www.tiktok.com/@seehden',
        ];

        const randomIndex = Math.floor(Math.random() * messages.length);
        const randomMessage = messages[randomIndex];

        return {
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: randomMessage,
            },
        };
    },
};

export default tiktok;
