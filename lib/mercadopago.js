import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: { timeout: 5000 }
});

const payment = new Payment(client);

export { payment, client };

export async function createPixPayment({ amount, description, email, planId }) {
  try {
    const paymentData = {
      transaction_amount: Number(amount),
      description: description || 'JobMatch Payment',
      payment_method_id: 'pix',
      payer: {
        email: email,
        first_name: 'Cliente',
        last_name: 'JobMatch'
      },
      metadata: {
        plan_id: planId
      },
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/webhook`
    };

    const response = await payment.create({ body: paymentData });
    return response;
  } catch (error) {
    console.error('Error creating PIX payment:', error);
    throw error;
  }
}

export async function getPaymentStatus(paymentId) {
  try {
    const response = await payment.get({ id: paymentId });
    return response;
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw error;
  }
}
