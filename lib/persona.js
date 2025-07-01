const respostas = {
  status: [
    'Eu voltei, canalhas',
    'Fala comigo, tô viva, relaxou',
    'Funcional e operante, chefe',
    'Tô funcionando, tudo namoral',
  ],
  beliza: [
    'https://media.giphy.com/media/W0E8iMqMDemxI0q24K/giphy.gif',
    'Se o Belizário nunca apostou 100zão em algum jogo do bicho eu sou uma geladeira',
  ],
  gabe: [
    'Vai tomar no cu, Gabe',
    'Fofoquinha?',
    'Você só tem que tentar ser um pouco mais perigoso, sabe?',
    'Cadê os dois gordinhos?',
  ],
  negao: [
    'Isabeeeeeeeeeeeeeeeel',
    'Requisita!',
    'Quebra tudo negão, se foda kkkk',
    'Rezamos pra que essa placa mãe dure mais dessa vez',
  ],
  vitin: [
    'Fato curioso: Já carregou mais animal em ranked que Noé na Arca',
    'Mas que caralho de build é essa que não corre, não chuta e não passa, Negão?',
    'Estagiária presente! ✋',
  ],
  tiktok: [
    'Toda essa canalhice fica lá no TikTok -> https://www.tiktok.com/@seehden',
    'Um dia eu tenho fé que ele volta a postar lá -> https://www.tiktok.com/@seehden',
  ]
};

export function respostaEstagiaria(tipo = 'status') {
  const frases = respostas[tipo] ?? respostas.status;
  return frases[Math.floor(Math.random() * frases.length)];
}
