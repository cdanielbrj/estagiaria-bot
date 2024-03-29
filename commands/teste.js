import { InteractionResponseType } from 'discord-interactions';

const teste = {
    name: 'teste',
    execute() {
        const messages = [
            'Tô funcionando, tudo namoral',
            'Fala comigo, tô viva, relaxou',
            'Funcional e operante, tudo certo por aqui',
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

export default teste;
