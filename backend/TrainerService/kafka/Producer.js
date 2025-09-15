import { kafka } from "../config/Kafka.js";

const producer = kafka.producer()

export const TrainerSessionCreateProducer = async (session_id,price)=>{
    try {
      await producer.connect();
  
      await producer.send({
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
      await producer.disconnect();
    }
}

