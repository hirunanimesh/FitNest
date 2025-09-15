import { kafka } from "../config/Kafka.js";
import createPlan from "../controllers/stripeController/create-plan.js";
import { deletePlanData } from "../controllers/mongoController/add-plan-data.js";
import updateGymPlanPrice from "../controllers/stripeController/update-gymplan-price.js";
import createSession from "../controllers/stripeController/create-session.js";

// Consumer for plan created
export const GymPlanCreatedConsumer = async () => {
  const consumer = kafka.consumer({ groupId: "payment-service-created" });

  await consumer.connect();
  await consumer.subscribe({ topic: "gym_plan_created", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const payload = JSON.parse(message.value.toString());
        const { planId, title: name, price, duration: interval } = payload;

        console.log("Received event:", payload);
        console.log("Extracted:", planId, name, price, interval);

        await createPlan(name, price, interval, planId);
      } catch (err) {
        console.error("Failed to process message:", err);
      }
    },
  });
};

// Consumer for plan deleted
export const GymPlanDeletedConsumer = async () => {
  const consumer = kafka.consumer({ groupId: "payment-service-deleted" });

  await consumer.connect();
  await consumer.subscribe({ topic: "gym_plan_deleted", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const payload = JSON.parse(message.value.toString());
        const { planId } = payload;

        console.log("Received event:", payload);

        await deletePlanData(planId);
      } catch (err) {
        console.error("Failed to process message:", err);
      }
    },
  });
};


export const GymPlanPriceUpdatedConsumer = async () => {
  const consumer = kafka.consumer({ groupId: "payment-service-price-updated" });

  await consumer.connect();
  await consumer.subscribe({ topic: "gym_plan_updated", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const payload = JSON.parse(message.value.toString());
        const { planId, price, duration } = payload;

        console.log("Received event:", payload);
        await updateGymPlanPrice(planId, price, duration);
        
      } catch (err) {
        console.error("Failed to process message:", err);
      }
    },
  });
}

export const TrainerSessionCreatedConsumer = async () => {
  const consumer = kafka.consumer({ groupId: "payment-service-session-created" });

  await consumer.connect();
  await consumer.subscribe({ topic: "trainer_session_created", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const payload = JSON.parse(message.value.toString());
        const { session_id, price } = payload;

        console.log("Received event:", payload);

        await createSession(price,session_id) 
      } catch (err) {
        console.error("Failed to process message:", err);
      }
    },
  });
}
