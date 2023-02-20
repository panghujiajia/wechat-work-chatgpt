import axios from "axios";
import { ChatGPTPool } from "./chatgpt.js";
import { config } from "./config.js";

const fail = {
  code: -1,
  message: 'fail',
  data: {
    type: 0,
    info: {
      text: ''
    }
  }
};

const success = {
  code: 0,
  message: 'success'
};

export class ChatGPTBot {
  // Record talkid with conversation id
  chatGPTPool = new ChatGPTPool();
  ready = false;
  robotId = config.robotId

  async startGPTBot() {
    console.debug(`Start GPT Bot Config is:${JSON.stringify(config)}`);
    await this.chatGPTPool.startPools();
    console.debug(`🤖️ Start GPT Bot Success, ready to handle message!`);
    this.ready = true;
  }

  async getGPTMessage(text: string, talkerId: string): Promise<string> {
    return await this.chatGPTPool.sendMessage(text, talkerId);
  }

  async onMessage(params: any) {
    // params = {
    //     groupName: 'ChatGPT', // 群名
    //     atMe: 'true', // 是否@我
    //     groupRemark: '', // 群备注
    //     spoken: '你好', // 消息内容
    //     textType: '1', //
    //     rawSpoken: '@OpenAi 你好', // 原始消息文本
    //     receivedName: '面包屑', // 提问者名称
    //     roomType: '1' // 1=外部群 2=外部联系人 3=内部群 4=内部联系人
    // };
    try {
      const { groupName, roomType, spoken, receivedName } = params;
      if (spoken) {
        const talkerId = Buffer.from(`${groupName}_${receivedName}`).toString('base64');
        const gptMessage = await this.getGPTMessage(spoken, talkerId);
        console.log(`Q：${spoken}`);

        console.log(`A：${gptMessage}`);
        let replyItem: any = {
          type: 203
        };
        // 群
        if (['1', '3'].includes(roomType)) {
          replyItem.titleList = [groupName];
          replyItem.atList = [receivedName];
          replyItem.receivedContent = ` ${gptMessage}`;
        } else {
          replyItem.titleList = [receivedName];
          replyItem.receivedContent = gptMessage;
        }
        // 给机器人发指令
        await axios.post(
          `/wework/sendRawMessage`,
          {
            socketType: 2,
            list: [replyItem]
          },
          {
            params: {
              robotId: this.robotId
            }
          }
        );
      }
      return {
        ...success,
        data: {
          type: 5000,
          info: {
            text: ''
          }
        }
      };
    } catch (error: any) {
      console.log(error.response);
      return fail;
    }
  }
}
