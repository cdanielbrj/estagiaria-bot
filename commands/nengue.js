import { InteractionResponseType } from 'discord-interactions';

const nengue = {
    name: 'nengue',
    execute() {
        const messages = [
            '"Aqui acabou" é o que o negão certamente diria agora',
            'Isabeeeeeeeeeeeeeeeel',
            'Requisita!',
            'Pô agora ele tá no sogro, tenta de novo semana que vem fazendo o favor',
            'Aposto 10zão com você agora que ele tá fazendo outra build no fifa',
            'Quebra tudo negão, se foda kkkk',
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

export default nengue;