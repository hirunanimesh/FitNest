import mongoose from "mongoose";

const stripeAccountSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  account_id: { type: String, required: true },
  createdAt: { type: Date, required: true ,default:Date.now}
});

const StripeAccount = mongoose.model("StripeAccount", stripeAccountSchema);

export default StripeAccount;
