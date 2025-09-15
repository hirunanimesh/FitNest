import mongoose from "mongoose";

const stripeSessionSchema = new mongoose.Schema({
    session_id: { type: String, required: true },
    price_id: { type: String, required: true },
    product_id: { type: String, required: true },
})

const StripeSession = mongoose.model("StripeSession", stripeSessionSchema);

export default StripeSession;