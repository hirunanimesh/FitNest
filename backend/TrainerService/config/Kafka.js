import { Kafka } from 'kafkajs';
import fs from 'fs'
import dotenv from 'dotenv'

// Ensure environment variables are loaded
dotenv.config()

// Lazy initialization of Kafka instance
let kafkaInstance = null;

export const getKafka = () => {
  if (!kafkaInstance) {
    // Validate required environment variables
    if (!process.env.KAFKA_BROKER) {
      throw new Error('KAFKA_BROKER environment variable is not defined');
    }
    if (!process.env.KAFKA_PASSWORD) {
      throw new Error('KAFKA_PASSWORD environment variable is not defined');
    }
    
    console.log('Initializing Kafka with broker:', process.env.KAFKA_BROKER);
    
    kafkaInstance = new Kafka({
      clientId: 'trainer-service-client',
      brokers: [process.env.KAFKA_BROKER],
      ssl: {
        rejectUnauthorized: true,
        ca: [fs.readFileSync('./ca.pem', 'utf-8')],
      },
      sasl: {
        mechanism: 'plain',
        username: 'avnadmin',
        password: process.env.KAFKA_PASSWORD,
      },
    });
  }
  
  return kafkaInstance;
};

// For backward compatibility
export const kafka = getKafka();