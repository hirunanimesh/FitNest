-- Add payment tracking tables

CREATE TABLE payments (
  payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id INT REFERENCES customer(customer_id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  stripe_payment_intent_id TEXT,
  stripe_session_id TEXT,
  payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'succeeded', 'failed', 'canceled')) DEFAULT 'pending',
  payment_type VARCHAR(20) CHECK (payment_type IN ('subscription', 'trainer_session', 'one_time')) NOT NULL,
  reference_id UUID, -- can reference subscription_id or session_id
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add payment history for tracking all payment events
CREATE TABLE payment_history (
  history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(payment_id) ON DELETE CASCADE,
  status_from VARCHAR(20),
  status_to VARCHAR(20),
  stripe_event_id TEXT,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payment_history_payment_id ON payment_history(payment_id);

-- Add trigger for payments updated_at
CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (
        customer_id IN (
            SELECT customer_id FROM customer WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own payment history" ON payment_history
    FOR SELECT USING (
        payment_id IN (
            SELECT payment_id FROM payments 
            WHERE customer_id IN (
                SELECT customer_id FROM customer WHERE user_id = auth.uid()
            )
        )
    );