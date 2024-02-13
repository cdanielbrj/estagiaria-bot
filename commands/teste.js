// commands/teste.js
import { InteractionResponseType } from 'discord-interactions';

const teste = {
    name: 'teste',
    execute() {
        return {
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: 'Testando nova arquitetura',
            },
        };
    },
};

export default teste;
