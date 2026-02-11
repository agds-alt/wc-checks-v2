// Midtrans Configuration
import Midtrans from 'midtrans-client';

// Validate environment variables
const validateMidtransConfig = () => {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const clientKey = process.env.MIDTRANS_CLIENT_KEY;
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

  if (!serverKey || !clientKey) {
    console.warn('⚠️  Midtrans credentials not configured. Payment features will not work.');
    console.warn('   Set MIDTRANS_SERVER_KEY and MIDTRANS_CLIENT_KEY in .env');
    return null;
  }

  return { serverKey, clientKey, isProduction };
};

// Create Snap client for payment page
let snapClient: Midtrans.Snap | null = null;

export const getSnapClient = (): Midtrans.Snap | null => {
  if (snapClient) return snapClient;

  const config = validateMidtransConfig();
  if (!config) return null;

  snapClient = new Midtrans.Snap({
    isProduction: config.isProduction,
    serverKey: config.serverKey,
    clientKey: config.clientKey,
  });

  console.log('✅ Midtrans Snap initialized:', {
    mode: config.isProduction ? 'PRODUCTION' : 'SANDBOX',
    serverKey: config.serverKey.substring(0, 20) + '...',
  });

  return snapClient;
};

// Create Core API client (for direct API calls)
let coreApiClient: Midtrans.CoreApi | null = null;

export const getCoreApiClient = (): Midtrans.CoreApi | null => {
  if (coreApiClient) return coreApiClient;

  const config = validateMidtransConfig();
  if (!config) return null;

  coreApiClient = new Midtrans.CoreApi({
    isProduction: config.isProduction,
    serverKey: config.serverKey,
    clientKey: config.clientKey,
  });

  return coreApiClient;
};

// Verify Midtrans notification signature
export const verifyMidtransSignature = (
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean => {
  const config = validateMidtransConfig();
  if (!config) return false;

  const crypto = require('crypto');
  const hash = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${config.serverKey}`)
    .digest('hex');

  return hash === signatureKey;
};

// Midtrans configuration constants
export const MIDTRANS_CONFIG = {
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

// Payment status mapping
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SETTLEMENT: 'settlement',
  CAPTURE: 'capture',
  DENY: 'deny',
  CANCEL: 'cancel',
  EXPIRE: 'expire',
  REFUND: 'refund',
  PARTIAL_REFUND: 'partial_refund',
} as const;

// Transaction status helper
export const isPaymentSuccess = (status: string): boolean => {
  return status === PAYMENT_STATUS.SETTLEMENT || status === PAYMENT_STATUS.CAPTURE;
};

export const isPaymentFailed = (status: string): boolean => {
  return [
    PAYMENT_STATUS.DENY,
    PAYMENT_STATUS.CANCEL,
    PAYMENT_STATUS.EXPIRE,
  ].includes(status as any);
};

export const isPaymentPending = (status: string): boolean => {
  return status === PAYMENT_STATUS.PENDING;
};
