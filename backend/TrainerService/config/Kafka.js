import { Kafka } from 'kafkajs';
import fs from 'fs'


export const kafka = new Kafka({
    clientId: 'my-node-client',
    brokers: ["fitnest-kafka-developmentproject38-c6e7.d.aivencloud.com:25322"], // use your actual host and port
    ssl: {
      rejectUnauthorized: true,
      ca: [fs.readFileSync('./ca.pem', 'utf-8')], // path to your Aiven CA certificate
    },
    sasl: {
      mechanism: 'plain',
      username: 'avnadmin', // replace with your Aiven username
      password: 'AVNS_RKqPRvi8HVb_I6KGplz', // replace with your Aiven password
    },
  });