const axios = require('axios');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const FILE_DIR = 'C://Riot Games/League of Legends/lockfile';

const file = fs.readFileSync(FILE_DIR);

const content = file.toString('utf-8');

const [, , port, password, protocol] = content.split(':');

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

const api = axios.default.create({
  baseURL: `${protocol}://127.0.0.1:${port}`,
  auth: {
    username: 'riot',
    password,
  },
});

async function main() {
  try {
    console.log('Programa feito por vinizius.');
    rl.question('Digite o nick para travar aqui: ', async (nickpa) => {
      if (!nickpa.length > 16)
        return console.log('Nick do lol contem no maximo 16 caracteres :3');

      // Pegar o nick do player
      const nick = nickpa;
      const nick2 = encodeURI(nick);

      // Pegar o id usando usando o nick
      const pegarid = await api.get(`/lol-summoner/v1/summoners?name=${nick2}`);

      const summoneid = pegarid.data.summonerId;

      // Data pra enviar no post pra invita pra sala
      const datav = [{ toSummonerId: summoneid }];
      let whileretu = false;
      do {
        const envia = await api({
          method: 'POST',
          url: '/lol-lobby/v2/lobby/invitations',
          data: datav,
          validateStatus: () => true,
        });

        if (envia.status >= 400) {
          throw new Error('Não conseguir invita, Reinicie o programa.');
        }
        console.log(`Invite ${nick}, Status:`, envia.status);

        const recusa = await api({
          method: 'POST',
          url: `/lol-lobby/v2/lobby/members/${summoneid}/kick`,
          validateStatus: () => true,
        });

        if (recusa.status >= 400) {
          throw new Error('Não conseguir da kick, Reinicie o programa.');
        }

        console.log(`Kick ${nick}, Status:`, recusa.status);
        await delay(100);
      } while (whileretu === false);
    });
  } catch (e) {
    console.error(e);
  }
}

main();
