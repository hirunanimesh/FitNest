import mongoose from "mongoose";

const stripeCustomerSchema = new mongoose.Schema({
  customer_id: { type: String, required: true },
  stripe_customer_id: { type: String, required: true },
  createdAt: { type: Date, required: true ,default:Date.now}
});

const StripeCustomer = mongoose.model("StripeCustomer", stripeCustomerSchema);

export default StripeCustomer;
