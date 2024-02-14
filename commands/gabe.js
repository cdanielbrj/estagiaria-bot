import { InteractionResponseType } from 'discord-interactions';

const gabe = {
    name: 'gabe',
    execute() {
        const messages = [
            'Vai tomar no cu, Gabe',
            '"Ti fode ai menor" é o que o Gabe certamente diria agora',
            'Winx! Quando damos nossas mãos, nos tornamos poderosas! Porque juntas somos invencíveis!',
            'Fofoquinha?',
            'Você só tem que tentar ser um pouco mais perigoso, sabe?',
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

export default gabe;
