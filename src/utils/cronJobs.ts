import cron from 'node-cron';
import Order from '../models/Order';

export const startCronJobs = () => {
  // Run every hour to check for orders that need status updates
  cron.schedule('0 * * * *', async () => {
    console.log('⏳ Running automated order tracking cron job...');

    try {
      const now = new Date();

      // Rule 1: Pending or Paid -> Shipped (after 3 days)
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const ordersToShip = await Order.find({
        status: { $in: ['pending', 'paid'] },
        createdAt: { $lte: threeDaysAgo },
      });

      for (const order of ordersToShip) {
        order.status = 'shipped';
        await order.save();
        console.log(`📦 Order ${order._id} automatically marked as SHIPPED.`);
      }

      // Rule 2: Shipped -> Delivered (after 4 days from creation)
      const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
      const ordersToDeliver = await Order.find({
        status: 'shipped',
        createdAt: { $lte: fourDaysAgo },
      });

      for (const order of ordersToDeliver) {
        order.status = 'delivered';
        await order.save();
        console.log(`✅ Order ${order._id} automatically marked as DELIVERED.`);
      }

    } catch (error) {
      console.error('❌ Error in cron job:', error);
    }
  });

  console.log('⏱️ Cron jobs service initialized and running.');
};
