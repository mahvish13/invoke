import readline from 'node:readline/promises'
import {tavily} from '@tavily/core'
import dotenv from 'dotenv';
dotenv.config();

import Groq from 'groq-sdk';
const tvly = tavily({ apiKey:process.env.TAVILY_API_KEY });

const groq = new Groq({

  apiKey: process.env.GROQ_API_KEY
});

async function webSearch({ query }) {
  console.log("tool is calling.....")
  const response = await tvly.search(query);
  // console.log("response :", response);
  
  const finalResult=response.results.map((result)=>result.content).join('\n\n');
       console.log("finalResult:",finalResult);
      return finalResult;

}

async function main() {
  const rl=readline.createInterface({input:process.stdin,output:process.stdout})
  const messages=[
      /* {
        role: 'user',
        content: 'What is the current weather in mumbai?'
      }, */
      {
      role: 'system',
      content: `You are a smart personal assistant who answers the asked questions.

      You have access to following tools:

      1. webSearch({query}: {query: string}) // Search the latest information and realtime data on the internet.

      Current date and time: ${new Date().toUTCString()}`
      },
    ];

   while(true){
      const question = await rl.question('You: ')
      if(question=='bye'){
        break;
      }
      messages.push({
        role: 'user',
        content:question,
      })
     while(true){
          const completion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          temperature: 0,
          
          messages:messages,
          tools: [
            {
              type: 'function',
              function: {
                name: 'webSearch',
                description: 'Search latest information on the internet',
                parameters: {
                  type: 'object',
                  properties: {
                    query: {
                      type: 'string'
                    }
                  },
                  required: ['query'],
                  additionalProperties: false
                }
              }
            }
          ],
          tool_choice: messages.length === 2
            ?{
                type: 'function',
                function: {
                  name: 'webSearch'
                } 
              }
            : 'auto'
        });
      messages.push(completion.choices[0].message);
      const toolCalls = completion.choices[0].message.tool_calls;

      if (!toolCalls && completion.choices[0].message.content) {
        console.log(`Assistant: ${completion.choices[0].message.content}`);
        break;
      }

      for (const tool of toolCalls) {

          // console.log('tool: ', tool);

          const functionName = tool.function.name;
          const functionParams = tool.function.arguments;
          let toolResult = '';


          if (functionName === 'webSearch') {
           toolResult = await webSearch(JSON.parse(functionParams));
          // console.log('tool result:', toolResult);
        }
        messages.push({
          tool_call_id:tool.id,
          role:'tool',
          name:functionName,
          content: toolResult,
        });
        continue;
      }

    }
  
   }
   rl.close();
}

  


main();