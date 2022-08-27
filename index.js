const cors = require("cors");
const express = require("express");

//add a stripe
const stripe = require("stripe")(
  "sk_test_51JvzyGFPY5JuFclZVwMYmI4CcPb5wrJRVPaWgGM67MMflmSuvhZNNNBgd2yljuRIK2e6nllgeVMjLvwjudiC4Orm00mMZ3myv4"
);
const uuid = require("uuid");
const app = express();

// middlewire
app.use(express.json());
app.use(cors());

//routes
app.get("/", (req, res) => {
  res.send("It is working");
});

app.post("/payment", (req, res) => {
  const { product, token } = req.body;
  console.log("Product", product);
  console.log("Price", product.price);
  const idempotency_key = uuid;

  return stripe.customer
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges.create(
        {
          amount: product.price * 100,
          currency: "usd",
          customer: customer.id,
          receipt_email: token.email,
          description: `purchase of product.name`,
          shipping: {
            name: token.card.name,
            address: {
              country: token.card.address_country,
            },
          },
        },
        { idempotency_key }
      );
    })
    .then((result) => res.status(200).json(result))
    .catch((err) => console.log(err));
});

//listen

app.listen(7000, () => console.log("The server is running at 7000"));
