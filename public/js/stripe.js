/* eslint-disable */
import axios from 'axios';
const stripe = Stripe(
  'pk_test_51POgkdHEYoocmqIr5BqLFQuQM5lmUm9cPdmbiklB8VkoFTeKVx13MCCXgdGTbb7AfdbDgEKH01KCyTjq9rtxSx4d00v7eMJGhQ',
);

export const bookTour = async (tourId) => {
  try {
    // 1 - obter sessão de checkout
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`,
    );

    // 2 - criar formulário de checkout + cobrar cartão de crédito
    window.open(session.data.session.url, '_blank');

    // await stripe.redirectToCheckout({
    //   sessionId: session.data.session.id,
    // });
  } catch (err) {
    // console.log(err);
    showAlert('error', err);
  }
};
