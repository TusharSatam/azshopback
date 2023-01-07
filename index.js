// const cors=require("cors");
// const express=require("express");
// const stripe=require("stripe")('sk_test_51JBY5WSFH0H2XJ5NlXHpUUYaoSeLUMpzffxSNR0Y5nTyVUFmy3Xso2xPdIY6jUE7OhOGq18llBexkU8Xchzpu5LN00AQUyaxNl');
// const uuid=require("uuid")
// const app= express();

// app.use(express.json())
// app.use(cors())

// //routes

// app.post("/payment",(req,res)=>{
//     // const {product,token}=req.body;
//     const {product,token}=req.body;

//     console.log("PRODUCT",product);
//     console.log("PRICE",product);
//     // const idempontencyKey=uuid()

//     return stripe.customer.create({
//         email:token.email,
//         source:token.id
//     }).then(customer=>{
//         stripe.charges.create({
//             amount:product*100,
//             currency:'usd',
//             customer:customer.id,
//             receipt_email:token.email,
//             description:`purchase of ${product}`,
//             // shipping:{
//             //     name:token.card.name,
//             //     address:{
//             //         country:token.card.address_country
//             //     }
//             // }
//         // },{idempontencyKey})
//     },{})

//     })
//     .then(result=>res.status(200).json(result))
//     .catch(err=>console.log(err))
// })

// app.get('/',(req,res)=>{
//     res.send("Its works!")
// })

// //links

// app.listen(3232,()=>console.log("Listening to port 3232"))

//TESING BY ME
// import Stripe from 'stripe';
const stripe = require("stripe")(
  "sk_test_51JBY5WSFH0H2XJ5NlXHpUUYaoSeLUMpzffxSNR0Y5nTyVUFmy3Xso2xPdIY6jUE7OhOGq18llBexkU8Xchzpu5LN00AQUyaxNl"
);

// const stripe = require('stripe')('sk_test_51JBY5WSFH0H2XJ5NlXHpUUYaoSeLUMpzffxSNR0Y5nTyVUFmy3Xso2xPdIY6jUE7OhOGq18llBexkU8Xchzpu5LN00AQUyaxNl');
const express = require("express");
const cors = require("cors");
// const { client } = require("./client");
// const { client } = require("./client");
const app = express();
const sanityClient =require('@sanity/client');
 const client = sanityClient({
  projectId: 'vskyo0km',
  dataset: 'production',
  apiVersion: '2021-11-16',
  useCdn: true,
  token: 'sk71wyNU6LlJtPXVOP1kUNAJ536DPTyEXia88r4zGCBfgv2XMVz6O154b29tPcYq7GlsljhzdbvGYz169um4nuPw5HJEpssrqbVyOuUaVMWVztJOguUfMDhheeYIpT1u6lI6qOMPWpZPjl4hZ1JQyepqOkB4y6MfJamLDD00GC9VJn9S8NAt',
});
// --------------update related to webhook-----------------
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next(); // Do nothing with the body because I need it in a raw state.
  } else {
    express.json()(req, res, next);  // ONLY do express.json() if the received request is NOT a WebHook from Stripe.
  }
});



// ---------------------
// app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// const YOUR_DOMAIN = "http://localhost:3000";
const YOUR_DOMAIN = "https://azshop.netlify.app";


app.post("/payment", async (req, res) => {
  let s = req.body.map((item) => {
    return {
      pId: `${item.product}`,
      q: `${item.quantity}`,
      // uId:`${item.userId}`
    };
  });
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Months start at 0!
  let dd = today.getDate();
  
  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;
  
  const formattedToday = dd + '/' + mm + '/' + yyyy;
  console.log(formattedToday);
  console.log(...s, { uId: `${req.body[0].userid}` });
  const customer = await stripe.customers.create({
    // res.send(req.body)
    metadata: {
      userId: req.body[0].userid,
      date:formattedToday
      // cart:JSON.stringify([...s,{uId:`${req.body[0].userId}`}])
    },
  });

  try {
    const params = {
      submit_type: "pay",
      mode: "payment",

      payment_method_types: ["card"],
      billing_address_collection: "auto",
      // receipt_email:"tsatam91@gmail.com",

      shipping_options: [{ shipping_rate: "shr_1MLQfiSFH0H2XJ5N0Ch5y36j" }],
      line_items: req.body.map((item) => {
        // const img = item.image[0].asset._ref;
        // const newImage = img
        //   .replace(
        //     "image-",
        //     "https://cdn.sanity.io/images/vfxfwnaw/production/"
        //   )
        //   .replace("-jpg", ".jpg");

        return {
          price_data: {
            currency: "inr",
            product_data: {
              name: item.name,
              // userid:item.userid,
              // images: [newImage],
              // images: [item.asset],
            },
            unit_amount: item.price * 100,
          },
          adjustable_quantity: {
            enabled: true,
            minimum: 1,
          },
          quantity: item.quantity,
          // receipt_email:email,
        };
      }),
      // success_url: `${req.headers.origin}/success`,
      // cancel_url: `${req.headers.origin}/canceled`,
      customer: customer.id,
      success_url: `${YOUR_DOMAIN}/success`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
    };
    const session = await stripe.checkout.sessions.create(params);
    res.status(200).json(session);
    // res.send("success")
  } catch (err) {
    res.status(err.statusCode || 500).json(err.message);
  }

  //   res.redirect(303, session.url);
});

//webhook

const endpointSecret = "whsec_wqG9bmjiqY7V4B6xcttZenk1DEcoDqo0";
// const endpointSecret = "whsec_755132c376969d82dd1d0eb59c52b3ae85afded1101eab0d60e15c3b34f4809e";

// const handleStoreDatatoSanityDB=()=>{
//   lineItems.data.map((item,i)=>{
//     const doc = {
//       _id: `${item.id}`,
//       _type: 'purchase',
//       name: `${item.description}`,
//       price: item.amount_subtotal,
//       total:item.amount_total,
//       quantity:item.quantity,
//       userid:req.body[0].userid
//     };
//     client.createIfNotExists(doc).then(() => {
//       console.log(doc);
//     });
//   })
// }
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let data;
    let eventType;

    // Check if webhook signing is configured.
    // let webhookSecret ="whsec_755132c376969d82dd1d0eb59c52b3ae85afded1101eab0d60e15c3b34f4809e";

    if (endpointSecret) {
      // Retrieve the event by verifying the signature using the raw body and secret.
      let event;
      const sig = req.headers['stripe-signature'];
      // const stripePayload = req.rawBody || req.body;
// console.log((req).rawbody);
console.log(req.body);
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          endpointSecret
        );
      } catch (err) {
        console.log(`Webhook signature verification failed:  ${err}`);
        return res.sendStatus(400);
      }
      // Extract the object from the event.
      data = event.data.object;
      eventType = event.type;
    } else {
      // Webhook signing is recommended, but if the secret is not configured in `config.js`,
      // retrieve the event data directly from the request body.
      data = req.body.data.object;
      eventType = req.body.type;
    }

    // Handle the checkout.session.completed event
    if (eventType === "checkout.session.completed") {
      stripe.customers
        .retrieve(data.customer)
        .then(async (customer) => {
          stripe.checkout.sessions.listLineItems(
            data.id,
            {},
            function (err, lineItems) {
              console.log("line_items", lineItems);
            //  console.log(req.body);
lineItems.data.map((item,i)=>{
  const doc = {
    _id: `${item.id}`,
    _type: 'purchase',
    name: `${item.description}`,
    price: item.amount_subtotal,
    total:item.amount_total,
    quantity:item.quantity,
    userid:customer.metadata.userId,
    launchAt:customer.metadata.date,
  };
  client.createIfNotExists(doc).then(() => {
    console.log(doc);
  });
})




            }
          );
        })
        .catch((err) => console.log(err.message));
    }

    res.status(200).end();
  }
);



app.get('/',(req,res)=>{
  res.send('hello hahahahah')
})

app.listen(4242, () => console.log("Running on port 4242"));
