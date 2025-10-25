import { getKafka } from "../config/Kafka.js";

let producer = null;

const getProducer = () => {
  if (!producer) {
    const kafka = getKafka();
    producer = kafka.producer();
  }
  return producer;
};

export const TrainerSessionCreateProducer = async (session_id,price)=>{
    try {
      const kafkaProducer = getProducer();
      await kafkaProducer.connect();
  
      await kafkaProducer.send({
        topic: "trainer_session_created",
        messages: [
          {
            key: String(session_id), // optional, good for partitioning
            value: JSON.stringify({
              session_id,
              price,
              createdAt: new Date().toISOString(),
            }),
          },
        ],
      });
  
      console.log("✅ Published trainer_session_created event");
    } catch (err) {
      console.error("❌ Error publishing event:", err);
    } finally {
      await kafkaProducer.disconnect();
    }
}

