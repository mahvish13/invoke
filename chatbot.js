import readline from 'node:readline/promises'
import {tavily} from '@tavily/core'
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
dotenv.config();

import Groq from 'groq-sdk';
const tvly = tavily({ apiKey:process.env.TAVILY_API_KEY });

const groq = new Groq({

  apiKey: process.env.GROQ_API_KEY
});
const myCache=new NodeCache({stdTTL:60*60*24}); //save data for 24 hours.


async function webSearch({ query }) {
  console.log("tool is calling.....")
  const response = await tvly.search(query);
  // console.log("response :", response);
  
  const finalResult=response.results.map((result)=>result.content).join('\n\n');
       console.log("finalResult:",finalResult);
      return finalResult;

}


export async function generate(userMessage,threadId) {
 
  const baseMessages=[
      /* {
        role: 'user',
        content: 'What is the current weather in mumbai?'
      }, */
      {
      role: 'system',
      content: `You are a smart personal assistant who answers the asked questions.
      if you know answer to a question ,answer it directly in plain english.
      if the answer requires real-time ,local ,or up-to-dateinformation,or if you don't know the answer ,use the available tools to find it.


      You have access to following tools:

      1. webSearch({query}: {query: string}) // Use this to search the internet for current or unknown information.
      Decidie when to use your own knowledge and when to use the tool.
      Do not mention the tool unless needed.


      Examples:
      Q:What is the capital of France?
      A:The capital of France is Paris.

      Q:what is the weather of Mumbai right now?
      A:(use the search tool to find the latest weather)

      Q:Who is the Prime Minister of India ?
      A:(use the search tool to find the latest Prime Minister)

      Q:Tell me the latest IT news.
      A:(use the search tool to get the latest news)


      Current date and time: ${new Date().toUTCString()}`
      },
    ];
    const messages=myCache.get(threadId)??baseMessages;

   
      
    messages.push({
        role: 'user',
        content:userMessage,
      });
    const MAX_RETRIES=10;
    let count=0;
    while(true){
      if(count>MAX_RETRIES){
        return ' could not find the result,please try again';
      }
      count++;
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
        //here we end the chatbot response;
        myCache.set(threadId,messages);
        console.log(myCache);
         return completion.choices[0].message.content
        
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
   


  


