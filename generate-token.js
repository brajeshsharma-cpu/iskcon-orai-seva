// ╔══════════════════════════════════════════════════════╗
// ║  ISKCON Centre Orai — Secure Token Generator         ║
// ║  This runs on the SERVER. The API key stays hidden.  ║
// ╚══════════════════════════════════════════════════════╝

const crypto = require('crypto');

const MERCHANT_ID = 'L1042784';
const SALT        = '9513499579TRJAQP'; // Never exposed to browser

module.exports = async (req, res) => {
  // Allow requests from your own page
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      txnId,
      amount,
      consumerId,
      mobileNo,
      email,
      debitStartDate,
      debitEndDate,
      maxAmount,
      amountType,
      frequency
    } = req.body;

    // Validate required fields
    if (!txnId || !amount || !consumerId || !mobileNo || !debitStartDate || !debitEndDate || !maxAmount || !amountType || !frequency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Hash string format as per Worldline Paynimo docs:
    // merchantId|txnId|totalAmount|accountNo|consumerId|mobileNo|email|
    // debitStart|debitEnd|maxAmount|amountType|frequency|cardNo|expM|expY|cvv|SALT
    const hashString = [
      MERCHANT_ID,
      txnId,
      amount,
      '',            // accountNo (blank — user enters in checkout)
      consumerId,
      mobileNo,
      email || '',
      debitStartDate,
      debitEndDate,
      maxAmount,
      amountType,
      frequency,
      '',            // cardNumber
      '',            // expMonth
      '',            // expYear
      '',            // cvvCode
      SALT
    ].join('|');

    // SHA-512 hash
    const token = crypto.createHash('sha512').update(hashString).digest('hex');

    return res.status(200).json({ token, merchantId: MERCHANT_ID });

  } catch (err) {
    console.error('Token generation error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
