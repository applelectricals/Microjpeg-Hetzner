@echo off
set NODE_ENV=development
set DATABASE_URL=postgresql://user:password@localhost:5432/testdb
set SECRET_KEY=sk_test_mock
set STRIPE_SECRET_KEY=sk_test_mock
set STRIPE_WEBHOOK_SECRET=whsec_mock
set PAYPAL_CLIENT_ID=mock
set PAYPAL_CLIENT_SECRET=mock
set RAZORPAY_KEY_ID=mock
set RAZORPAY_KEY_SECRET=mock
set R2_ACCESS_KEY_ID=mock
set R2_SECRET_ACCESS_KEY=mock
set R2_ACCOUNT_ID=mock
set R2_BUCKET_NAME=mock
npx tsx server/index.ts