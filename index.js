 require('dotenv').config();
const express = require('express');
const mongoDB = require('./db');
const bodyParser = require('body-parser');
const Razorpay = require('razorpay');
const cors = require('cors');
const app = express();
const port = 5000;
// Initialize Razorpay instance
// const corsOptions = {
//   origin: 'http://localhost:3000/'
// };
app.options('*', cors());
const razorpay = new Razorpay({
  key_id:'rzp_test_JWxfB6ndDJqrtZ',
  key_secret:'CtBEhiN6SvLpVWYDHto9rseN',
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: 'https://mernfrontend-5em7.onrender.com',
  exposedHeaders: '*'
}));

// Connect to MongoDB
mongoDB();

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.use('/api', require('./Routes/CreateUser'));
app.use('/api', require('./Routes/DisplayData'));
app.use('/api', require('./Routes/OrderData'));

// Razorpay checkout route
app.post('/api/razorpay/checkout', async (req, res) => {
  const { amount, email, orderId } = req.body;

  const options = {
    amount: amount * 100, // Amount in paise
    currency: 'INR',
    receipt: orderId,
    payment_capture: 1,
    notes: {
      email,
    },
  };

  try {
    const response = await razorpay.orders.create(options);
    res.json({
      orderId: response.id,
      razorpayKeyId: razorpay.key_id,
      amount: response.amount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Something went wrong',
    });
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
