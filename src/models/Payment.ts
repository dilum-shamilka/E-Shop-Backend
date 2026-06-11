import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    paymentId: { type: String, required: true },
    transactionId: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'LKR' },
    status: { type: String, required: true },
    method: { type: String },
    rawPayHereResponse: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);