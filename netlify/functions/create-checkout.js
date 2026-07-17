const { SquareClient, SquareEnvironment, SquareError } = require('square');
const crypto = require('crypto');

const BULK_VARIATION_ID = 'UILXF2IGG237AREZJKP7QNGE'; // $199/unit — quantity 50+
const STANDARD_VARIATION_ID = 'NBGAWMEISZFHPPKL7ZMPENWT'; // $299/unit — quantity under 50
const BULK_THRESHOLD = 50;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed.' }) };
  }

  let quantity;
  try {
    quantity = Number.parseInt(JSON.parse(event.body || '{}').quantity, 10);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body.' }) };
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Quantity must be a positive whole number.' }) };
  }

  const { SQUARE_ACCESS_TOKEN, SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID } = process.env;
  if (!SQUARE_ACCESS_TOKEN || !SQUARE_APPLICATION_ID || !SQUARE_LOCATION_ID) {
    console.error('Missing Square environment configuration.');
    return { statusCode: 500, body: JSON.stringify({ error: 'Checkout is not configured on the server.' }) };
  }

  const variationId = quantity >= BULK_THRESHOLD ? BULK_VARIATION_ID : STANDARD_VARIATION_ID;

  const client = new SquareClient({
    token: SQUARE_ACCESS_TOKEN,
    environment: SquareEnvironment.Production,
  });

  try {
    const { order } = await client.orders.create({
      idempotencyKey: crypto.randomUUID(),
      order: {
        locationId: SQUARE_LOCATION_ID,
        lineItems: [
          {
            catalogObjectId: variationId,
            quantity: String(quantity),
          },
        ],
      },
    });

    const { paymentLink } = await client.checkout.paymentLinks.create({
      idempotencyKey: crypto.randomUUID(),
      order: {
        id: order.id,
        locationId: SQUARE_LOCATION_ID,
        version: order.version,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ checkoutUrl: paymentLink.url }),
    };
  } catch (err) {
    console.error('Square checkout creation failed:', err instanceof SquareError ? err.body || err.message : err);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Could not create a checkout link. Please try again.' }),
    };
  }
};
