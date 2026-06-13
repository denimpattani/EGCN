import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.warn('⚠️  Razorpay environment variables (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are missing! Payment operations will fail.');
}

const razorpay = new Razorpay({
  key_id: keyId || 'rzp_test_placeholder_id',
  key_secret: keySecret || 'placeholder_secret',
});

export default razorpay;
