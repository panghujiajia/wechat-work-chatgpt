import { ChatGPTBot } from "./bot.js";
const chatGPTBot = new ChatGPTBot();
import express from 'express';
import bodyParser from 'body-parser';
const jsonParser = bodyParser.json();

const app = express();
const port = 9999

async function main() {
  const initializedAt = Date.now()

  app.get('/', (req: any, res: any) => {
    res.send('Hello World!')
  })

  // 接收回调
  app.post('/workTool/thirdQa', jsonParser, (req: any, res: any) => {
    const { body } = req;

    console.log(`params：${JSON.stringify(body)}`);

    res.send({
      code: 0,
      message: 'success',
      data: {
        type: 5000,
        info: {
          text: ''
        }
      }
    });
    
    chatGPTBot.onMessage(body);
  })

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })

  await chatGPTBot.startGPTBot();
}
main();
