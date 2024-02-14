import { InteractionResponseType } from 'discord-interactions';

const vitin = {
    name: 'vitin',
    execute() {
        const messages = [
            'CHUTA PRO GOL MEU EGOÍSTA, MEU ATACANTE NATO!',
            'Fato curioso: Já carregou mais animal em ranked que Noé na Arca',
            'Cassino? Hoje? Oi? Você disse "Abrir caixa no CS"?',
            'Mas que caralho de build é essa que não corre, não chuta e não passa, Negão?',
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

export default vitin;
