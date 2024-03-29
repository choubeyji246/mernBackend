const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt=require("bcryptjs")
const axios = require("axios");
const { body, validationResult } = require("express-validator");
const jwt=require("jsonwebtoken")
const jwtSecret="Hungerness"

//signUp
router.post(
  "/createuser",
 [ body("email").isEmail(),
  body("name").isLength({ min: 5 }),
  body("password").isLength({ min: 5 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
      const salt=await bcrypt.genSalt(0);
      let secPassword=await bcrypt.hash(req.body.password,salt)

    try {
      await User.create({
        name: req.body.name,
        password: secPassword,
        email: req.body.email,
        location: req.body.geolocation,
      });
      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.json({ success: false });
    }
  }
);



//fetch location

router.post('/getlocation', async (req, res) => {
  try {
      let lat = req.body.latlong.lat
      let long = req.body.latlong.long
      console.log(lat, long)
      let location = await axios
          .get("https://api.opencagedata.com/geocode/v1/json?q=" + lat + "+" + long + "&key=74c89b3be64946ac96d777d08b878d43")
          .then(async res => {
              // console.log(`statusCode: ${res.status}`)
              console.log(res.data.results)
              // let response = stringify(res)
              // response = await JSON.parse(response)
              let response = res.data.results[0].components;
              console.log(response)
              let { city, county, state_district, state, postcode } = response
              return String(city + "," + county + "," + state_district + "," + state + "\n" + postcode)
          })
          .catch(error => {
              console.error(error)
          })
      res.send({ location })

  } catch (error) {
      console.error(error.message)
      res.status(500).json({ error: "Server Error" })


  }
})








//Login

router.post(
  "/loginuser",
  [body("email").isEmail(), body("password").isLength({ min: 5 })],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let email = req.body.email;
    try {
      let userData = await User.findOne({ email });
     
      const pwdCompare = await bcrypt.compare(req.body.password, userData.password);
      if (!pwdCompare) {
        return res.status(400).json({ success: false, errors: "Try Logging in with correct credentials" });
      } else {
        const data={
          user:{
            id:userData.id
          }
        }
  
        const authToken=jwt.sign(data,jwtSecret)
        return res.json({success:true,authToken:authToken,message: 'Login successful'})
        
      
      }
     
      
    } catch (error) {
      console.log(error);
      res.json({ success: false });
    }
  }
);

module.exports = router;
