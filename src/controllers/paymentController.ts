import { Request, Response } from 'express';
import crypto from 'crypto';
import Order from '../models/Order';
import Payment from '../models/Payment';

export const initiatePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, amount } = req.body;
    const merchant_id = process.env.PAYHERE_MERCHANT_ID;
    const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET || '';
    const currency = 'LKR';

    const formattedAmount = Number(amount).toFixed(2);
    const hashedSecret = crypto
      .createHash('md5')
      .update(merchant_secret.trim())
      .digest('hex')
      .toUpperCase();

    const hash = crypto
      .createHash('md5')
      .update(merchant_id + orderId + formattedAmount + currency + hashedSecret)
      .digest('hex')
      .toUpperCase();

    res.status(200).json({
      merchant_id,
      order_id: orderId,
      amount: formattedAmount,
      currency,
      hash,
      notify_url: process.env.PAYHERE_NOTIFY_URL,
    });
  } catch (error) {
    console.error('Hash Error:', error);
    res.status(500).json({ message: 'Hash generation failed' });
  }
};

export const paymentNotify = async (req: Request, res: Response): Promise<void> => {
  console.log('🔔 PayHere Notification Received!');

  try {
    const {
      merchant_id,
      order_id,
      status_code,
      md5sig,
      payhere_amount,
      payhere_currency,
      payment_id,
      method,
      status_message,
    } = req.body;

    const merchant_secret = (process.env.PAYHERE_MERCHANT_SECRET || '').trim();
    const hashedSecret = crypto
      .createHash('md5')
      .update(merchant_secret)
      .digest('hex')
      .toUpperCase();

    const expectedMd5sig = crypto
      .createHash('md5')
      .update(
        merchant_id +
          order_id +
          payhere_amount +
          payhere_currency +
          status_code +
          hashedSecret
      )
      .digest('hex')
      .toUpperCase();

    if (md5sig === expectedMd5sig) {
      if (status_code === '2') {
        console.log(`✅ Success: Order ${order_id} is PAID`);

        const updatedOrder = await Order.findByIdAndUpdate(order_id, {
          status: 'paid',
          paymentId: payment_id,
        });

        if (!updatedOrder) {
          console.error(`⚠️ Payment notification received for missing order ${order_id}`);
          res.status(404).send('Order not found');
          return;
        }

        const newPayment = new Payment({
          orderId: order_id,
          paymentId: payment_id,
          amount: Number(payhere_amount),
          currency: payhere_currency,
          status: 'success',
          method,
          rawPayHereResponse: req.body,
        });

        await newPayment.save();
        console.log('🚀 Database Updated: Order -> PAID & Payment Record Created');
      } else if (status_code === '0') {
        console.log(`⏳ Pending: Order ${order_id} is awaiting confirmation`);
      } else {
        console.log(`⚠️ Failed: Order ${order_id} Status ${status_code}`);
        await Order.findByIdAndUpdate(order_id, { status: 'cancelled' });
      }
    } else {
      console.error('❌ Security Warning: Hash Mismatch! Request might not be from PayHere.');
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('🔥 PayHere Notify Error:', error);
    res.status(500).send();
  }
};