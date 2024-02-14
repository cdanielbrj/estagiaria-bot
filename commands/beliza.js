import { InteractionResponseType } from 'discord-interactions';

const beliza = {
    name: 'beliza',
    execute() {
        const messages = [
            'O modo "Globeliza" só está disponível durante o carnaval, tenta de novo em fevereiro',
            'https://media.giphy.com/media/W0E8iMqMDemxI0q24K/giphy.gif',
            'Se o Belizário nunca apostou 100zão em algum jogo do bicho eu sou um microondas',
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

export default beliza;
