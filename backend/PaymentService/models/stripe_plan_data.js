import mongoose from "mongoose";

const stripePlanDataSchema = new mongoose.Schema({
  plan_id: { type: String, required: true },
  product_id: { type: String, required: true },
  price_id: { type: String, required: true }
});

const StripePlanData = mongoose.model("StripePlanData", stripePlanDataSchema);

export default StripePlanData;
