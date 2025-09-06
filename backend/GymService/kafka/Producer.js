import { kafka } from "../config/Kafka.js";

const producer = kafka.producer()

export const GymPlanCreateProducer = async (planId,title,price,duration) => {
    try {
      await producer.connect();
  
      await producer.send({
        topic: "gym_plan_created",
        messages: [
          {
            key: String(planId), // optional, good for partitioning
            value: JSON.stringify({
              planId,
              title,
              price,
              duration,
              createdAt: new Date().toISOString(),
            }),
          },
        ],
      });
  
      console.log("✅ Published gym_plan_created event");
    } catch (err) {
      console.error("❌ Error publishing event:", err);
    } finally {
      await producer.disconnect();
    }
  };


  export const GymPlanDeleteProducer = async (planId) => {
    try {
      await producer.connect();
  
      await producer.send({
        topic: "gym_plan_deleted",
        messages: [
          {
            key: String(planId), // optional, good for partitioning
            value: JSON.stringify({
              planId,
              createdAt: new Date().toISOString(),
            }),
          },
        ],
      });
  
      console.log("✅ Published gym_plan_delete event");
    } catch (err) {
      console.error("❌ Error publishing event:", err);
    } finally {
      await producer.disconnect();
    }
  };


  export const GymPlanPriceUpdateProducer = async (planId,price,duration) => {
    try {
      await producer.connect();
  
      await producer.send({
        topic: "gym_plan_updated",
        messages: [
          {
            key: String(planId), // optional, good for partitioning
            value: JSON.stringify({
              planId,
              price,
              duration,
              updatedAt: new Date().toISOString(),
            }),
          },
        ],
      });
  
      console.log("✅ Published gym_plan_updated event");
    } catch (err) {
      console.error("❌ Error publishing event:", err);
    } finally {
      await producer.disconnect();
    }
  };