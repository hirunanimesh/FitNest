import { Kafka } from 'kafkajs';
import fs from 'fs'


export const kafka = new Kafka({
    clientId: 'my-node-client',
    brokers: [process.env.KAFKA_BROKER], // use your actual host and port
    ssl: {
      rejectUnauthorized: true,
      ca: [fs.readFileSync('./ca.pem', 'utf-8')], // path to your Aiven CA certificate
    },
    sasl: {
      mechanism: 'plain',
      username: 'avnadmin', // replace with your Aiven username
      password: process.env.KAFKA_PASSWORD, // replace with your Aiven password
    },
  });