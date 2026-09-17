## JWT Authentication: Access Tokens & Refresh Tokens

1. Overview

This project implements authentication with JSON Web Tokens (JWT) using two different tokens:

Access Token — short-lived token used to access protected API resources.

Refresh Token — longer-lived token used to obtain a new access token after the access token expires.

The important mental model is:

The access token is used during normal API requests.
The refresh token is used to get a new access token.

The project also stores the refresh token in an HTTP-only cookie and in the user's MongoDB document.

## 2. Project Flow

The authentication flow can be visualized like this:

                    REGISTER
                       |
                       v
              Create user in MongoDB
                       |
                       v
                Generate 2 JWTs
                 /          \
                /            \
               v              v
        Access Token      Refresh Token
        expires: 15m       expires: 7d
               |              |
               |              +--> HTTP-only cookie
               |              |
               |              +--> MongoDB user document
               |
               +--> Returned in JSON response
                       |
                       v
              Client uses Access Token
                       |
                       v
               Protected API (/me)
                       |
                Token valid?
                 /           \
               YES            NO
                |              |
                v              v
          Return user      Call /refresh
                              |
                              v
                    Verify Refresh Token
                              |
                              v
                     Generate new tokens
                              |
                              v
                     Return new Access Token

## 3. Files and Their Responsibilities

The authentication system is split into several files.

File

Responsibility

auth.js

Generates and verifies access/refresh JWTs

auth.routes.js

Registration, protected user endpoint, and token refresh

user.model.js

Defines the MongoDB user schema

app.js

Configures Express middleware and authentication routes

server.js

Connects to MongoDB and starts the HTTP server

This separation is useful because each file has a focused responsibility.

## 4. auth.js — JWT Generation and Verification

The authentication utility imports jsonwebtoken and configuration values.

import jwt from "jsonwebtoken";
import config from "../../config/config.js";

jsonwebtoken provides the JWT operations:

jwt.sign() → creates a JWT

jwt.verify() → verifies a JWT and returns its decoded payload

4.1 Generating the Tokens

The project has:

export const generatetokens = ({ userid }) => {

The function receives a user ID and creates both tokens.

Access Token

const accesstoken = jwt.sign(
  { id: userid },
  config.ACCESS_TOKEN,
  {
    expiresIn: "15m",
  }
);

There are three important parts:

1. Payload

{ id: userid }

The payload contains the user's ID.

After decoding a valid token, the server can obtain:

decoded.id

and use it to find the user.

2. Secret

config.ACCESS_TOKEN

This is the secret used to sign the access token.

The server later needs the same secret to verify that token.

3. Expiration

expiresIn: "15m"

The access token expires after 15 minutes.

This makes it a short-lived credential.

## 5. Refresh Token Generation

The refresh token is generated separately:

const refreshtoken = jwt.sign(
  { id: userid },
  config.REFRESH_TOKEN,
  {
    expiresIn: "7d",
  }
);

Notice that the project uses a different secret:

config.REFRESH_TOKEN

and a longer expiration:

expiresIn: "7d"

So the two tokens differ in:

purpose

lifetime

secret

storage/transport in this application

## 6. Returning Both Tokens

The function returns:

return { accesstoken, refreshtoken };

This is an object containing both values.

That matters because JavaScript's comma operator does not return multiple values:

return (accessToken, refreshToken);

would return only refreshToken.

An object is appropriate when multiple named values need to be returned:

return {
  accesstoken,
  refreshtoken
};

The caller can then destructure them:

const { accesstoken, refreshtoken } = generatetokens(...);

## 7. Verifying the Access Token

The project defines:

export function verifyaccesstoken(token) {
  const decodetoken = jwt.verify(token, config.ACCESS_TOKEN);
  return decodetoken;
}

jwt.verify() does two important things:

Checks whether the token's signature is valid.

Checks whether the token is still valid, including expiration.

If verification succeeds, the decoded payload is returned.

For this project, that payload contains:

{
  id: userid,
  ...
}

So the route can use:

decoded.id

to identify the user.

If verification fails, jwt.verify() throws an error. The route calling this function catches that error and sends an unauthorized response.

## 8. Verifying the Refresh Token

The refresh token has its own verification function:

export function verifyrefreshtoken(token) {
  const decode = jwt.verify(token, config.REFRESH_TOKEN);
  return decode;
}

The important difference is the secret:

config.REFRESH_TOKEN

The refresh token must be verified using the refresh-token secret.

## 9. Access Token vs Refresh Token

Feature

Access Token

Refresh Token

Main purpose

Access protected APIs

Obtain a new access token

Lifetime in this project

15 minutes

7 days

Secret

ACCESS_TOKEN

REFRESH_TOKEN

Used on normal API requests

Yes

No

Used to refresh authentication

No

Yes

Stored in this project

Returned in JSON

HTTP-only cookie + MongoDB

If expired

Request is rejected

User needs a valid refresh mechanism

Payload here

User ID

User ID

Core distinction

ACCESS TOKEN
    |
    +--> "Can this user access this protected resource?"

REFRESH TOKEN
    |
    +--> "Can this session receive a new access token?"

Do not think of the refresh token as a "stronger access token."

It has a different job.

## 10. Registration Route

The registration route is:

router.post("/reg", async (req, res) => {

Because app.js mounts the router at:

app.use("/app/auth", authroutes);

the full endpoint becomes:

POST /app/auth/reg

10.1 Reading User Data

const { email, name, password } = req.body;

The server extracts the registration data from the request body.

## 11. Checking Whether the User Already Exists

const isuserexisting = await usermodel.findOne({ email });

MongoDB is queried using the email.

If a user exists:

if (isuserexisting) {

the server returns:

res.status(400).json({
  message: "User already exists"
});

This prevents duplicate registration with the same email.

## 12. Password Hashing

The password is not stored directly.

The project uses:

passwordhash: await bcrypt.hash(password, 12)

bcrypt converts the plaintext password into a hash.

The 12 is the bcrypt cost factor used here.

The database therefore stores a password hash rather than the original password.

## 13. Creating the User

const user = await usermodel.create({
  name,
  email,
  passwordhash: await bcrypt.hash(password, 12),
});

MongoDB creates the user document.

The generated MongoDB _id becomes the user's identifier.

## 14. Generating Tokens After Registration

const { accesstoken, refreshtoken } =
  generatetokens({ userid: user._id });

The user's MongoDB _id is placed into both JWT payloads.

Conceptually:

MongoDB user
     |
     +--> _id
            |
            +--> Access JWT payload: { id: _id }
            |
            +--> Refresh JWT payload: { id: _id }

## 15. Storing the Refresh Token

The project stores the refresh token on the user:

user.refreshtoken = refreshtoken;
await user.save();

The user.model.js schema contains:

refreshtoken: {
  type: String,
}

This gives the server a stored reference against which the incoming refresh token can be compared.

## 16. HTTP-Only Cookie

The refresh token is also sent as a cookie:

res.cookie("refreshtoken", refreshtoken, {
  httpOnly: true,
});

The important option is:

httpOnly: true

An HTTP-only cookie cannot be read by client-side JavaScript through document.cookie.

This reduces exposure to token theft through client-side JavaScript, particularly in the event of certain XSS attacks.

The browser still sends the cookie with applicable requests.

## 17. Why the Access Token Is Returned in JSON

The registration response contains:

res.status(201).json({
  message: "USer registered",
  data: {
    name: user.name,
    email: user.email,
  },
  accesstoken,
});

So the access token is returned directly to the client.

The project does not place the access token in the HTTP-only cookie.

The refresh token is the one placed in the cookie.

## 18. /me — Using the Access Token

The route is:

router.get("/me", async (req, res) => {

With the router mounted at /app/auth, the endpoint is:

GET /app/auth/me

This route demonstrates the normal use of an access token.

## 19. Authorization Header

The code extracts the token:

const accesstoken =
  req.headers.authorization?.split(" ")[1];

The expected HTTP header looks like:

Authorization: Bearer <access-token>

Calling:

.split(" ")

turns:

Bearer abc123

into:

["Bearer", "abc123"]

Therefore:

[1]

selects:

abc123

The ?. is optional chaining. It prevents an error if authorization is missing.

## 20. Verifying the Access Token

The route calls:

const decoded = verifyaccesstoken(accesstoken);

Internally:

jwt.verify(token, config.ACCESS_TOKEN);

If the token:

has a valid signature

has not expired

was signed with the expected access-token secret

verification succeeds.

Otherwise, an error is thrown.

## 21. Finding the User

After verification:

const user = await usermodel.findById(decoded.id);

The id came from the JWT payload.

So the complete flow is:

Authorization header
        |
        v
Extract JWT
        |
        v
jwt.verify()
        |
        v
Decode payload
        |
        v
decoded.id
        |
        v
MongoDB findById()
        |
        v
Return user information

## 22. What Happens When the Access Token Expires?

The route catches the verification error:

catch (error) {
  return res.status(401).json({
    message: "Unauthorized invalid or expired access token",
    error: {},
  });
}

The important HTTP status is:

401 Unauthorized

The server is essentially saying:

"The credential presented for this protected request is not currently valid."

At this point, the client can use the refresh-token flow.

## 23. /refresh — Refreshing the Access Token

The refresh endpoint is:

POST /app/auth/refresh

The purpose of this endpoint is not to access normal protected resources.

Its purpose is to issue fresh authentication tokens.

## 24. Reading the Refresh Token From the Cookie

The code uses:

const refreshtoken = req.cookies.refreshtoken;

For this to work, cookie-parser must be installed as Express middleware.

That happens in app.js:

app.use(cookieParser())

This parses the incoming cookies and makes them available through:

req.cookies

Without cookie-parser, this code would not have the parsed req.cookies object in this setup.

## 25. Checking Whether the Refresh Token Exists

if (!refreshtoken) {
  return res.status(401).json({
    message: "Invalid token",
  });
}

If there is no refresh token, the server cannot perform the refresh operation.

## 26. Verifying the Refresh Token

The route calls:

const decode = await verifyrefreshtoken(refreshtoken);

which internally performs:

jwt.verify(token, config.REFRESH_TOKEN);

Notice again:

Access token  -> ACCESS_TOKEN secret
Refresh token -> REFRESH_TOKEN secret

Using separate secrets helps keep the two credentials cryptographically distinct.

## 27. Finding the User From the Refresh Token

After verification:

const user = await usermodel.findById(decode.id);

The refresh token contains the user's ID in its payload.

The server uses that ID to retrieve the MongoDB user.

## 28. Refresh Token Database Check

This is one of the important security parts of this implementation:

if (refreshtoken !== user.refreshtoken) {

The server compares:

Refresh token from cookie
            VS
Refresh token stored in MongoDB

Only if they match does the refresh continue.

This means the server is not relying solely on JWT signature verification.

It also maintains server-side state for the current refresh token.

## 29. What Happens When the Refresh Token Does Not Match?

The code does:

user.refreshtoken = null;
await user.save();

and returns:

return res.status(401).json({
  message: "Unauthorized token",
});

This invalidates the stored refresh token.

This is useful because a refresh token can be revoked server-side by changing/removing the stored token.

## 30. Generating New Tokens

If everything is valid:

const {
  accesstoken,
  refreshtoken: latestrefreshtoken
} = generatetokens({
  userid: user._id,
});

Two fresh tokens are generated.

The new refresh token is given a different local variable name:

latestrefreshtoken

This is simply destructuring with an alias.

It means:

refreshtoken

from the returned object is assigned to:

latestrefreshtoken

## 31. Refresh Token Rotation

The new refresh token is placed into the cookie:

res.cookie("refreshtoken", latestrefreshtoken, {
  httpOnly: true
});

And stored in MongoDB:

user.refreshtoken = latestrefreshtoken;
await user.save();

This means the old refresh token is replaced.

Conceptually:

Old refresh token
       |
       v
Validate
       |
       v
Generate new refresh token
       |
       +--> Replace cookie
       |
       +--> Replace MongoDB value
       |
       v
Old token is no longer the stored token

This pattern is commonly called refresh token rotation.

## 32. Refresh Response

The endpoint returns:

res.status(200).json({
  message: "New tokens generated",
  accesstoken,
});

The new access token is returned to the client.

The refresh token is updated through the HTTP-only cookie.

## 33. Why Have Two Tokens?

Without refresh tokens, you could make an access token valid for a long time:

Access token
     |
     +---- valid for 30 days

But if that token gets stolen, the attacker may be able to use it for a long period.

Instead, the system uses:

Access token
     |
     +---- short lifetime
     |
     +---- used frequently

Refresh token
     |
     +---- longer lifetime
     |
     +---- used only to obtain another access token

This creates a useful security/usability trade-off.

Short access-token lifetime

Limits the useful lifetime of a stolen access token.

Longer refresh-token lifetime

Prevents the user from having to log in every 15 minutes.

## 34. Real-World Example

Imagine logging into a website.

After login:

Access Token  -> expires in 15 minutes
Refresh Token -> expires in 7 days

For the next API request:

GET /profile

Authorization: Bearer ACCESS_TOKEN

The server verifies the access token.

After 15 minutes:

ACCESS TOKEN
      |
      v
Expired

The client sends:

POST /refresh

The browser automatically sends the refresh-token cookie.

The server:

Read refresh cookie
       |
       v
Verify JWT
       |
       v
Find user
       |
       v
Compare with DB token
       |
       v
Generate new access token
       |
       v
Rotate refresh token

The client receives the new access token and can continue making protected API requests.

## 35. Important Mental Model

Think of the tokens like this:

ACCESS TOKEN
---------------------------
"Let me access this API."
Short-lived.
Used frequently.
Sent with protected requests.

REFRESH TOKEN
---------------------------
"Let me obtain a fresh access token."
Longer-lived.
Used less frequently.
Stored more carefully.

A refresh token does not normally replace the access token for every API request.

## 36. Security Comparison

Property

Access Token

Refresh Token

Exposure frequency

High

Low

Lifetime

Short

Longer

Main purpose

Authorization

Session continuation

Should be sent to normal APIs?

Yes

Generally no

Storage in this project

Client receives JSON

HTTP-only cookie

Server-side storage

Not stored in user model

Stored in MongoDB

Can be revoked using DB state here?

Not directly

Yes

Used to generate another token

No

Yes

## 37. Why HTTP-Only Matters

The refresh token is particularly sensitive because it can be used to obtain new access tokens.

The project therefore puts it into:

res.cookie("refreshtoken", refreshtoken, {
  httpOnly: true,
});

With:

httpOnly: true

browser JavaScript cannot directly access that cookie.

This is different from simply storing the refresh token in:

localStorage

where JavaScript running on the page can read it.

However, HttpOnly is not a complete security solution. A production cookie-based authentication system should also carefully consider options such as:

secure: true
sameSite: "..."

and CSRF protection where applicable.

Those settings are not present in the supplied code, so they are not part of this implementation.

## 38. The MongoDB User Model

The user schema contains:

const userschema = new mongoose.Schema({

The relevant fields are:

name
email
passwordhash
refreshtoken

The refresh token field is:

refreshtoken: {
  type: String,
}

This allows the server to maintain the current refresh token associated with the user.

## 39. Express Application Setup

app.js creates the Express application:

const app = express();

It enables JSON request parsing:

app.use(express.json());

It enables cookie parsing:

app.use(cookieParser())

Then it mounts the authentication router:

app.use("/app/auth", authroutes);

So:

auth.routes.js
      |
      v
/app/auth
      |
      +--> POST /reg
      +--> GET  /me
      +--> POST /refresh

## 40. Server Startup

server.js imports the Express application:

import app from "./app.js";

It connects to MongoDB:

await connectdb();

Only after the database connection succeeds does it start listening:

app.listen(3000, ...);

So the startup sequence is:

Start Node process
       |
       v
Connect MongoDB
       |
       v
Connection successful
       |
       v
Start Express server
       |
       v
Listen on port 3000

## 41. Complete Authentication Lifecycle

                    REGISTER / LOGIN
                           |
                           v
                    Verify credentials
                           |
                           v
                    Generate JWT pair
                     /             \
                    /               \
                   v                 v
             ACCESS TOKEN       REFRESH TOKEN
              15 minutes           7 days
                   |                 |
                   |                 +--> HTTP-only cookie
                   |                 |
                   |                 +--> MongoDB
                   |
                   v
             Protected APIs
                   |
             Token expires?
                /      \
              NO        YES
               |          |
               v          v
           Continue    /refresh
                          |
                          v
                 Verify refresh JWT
                          |
                          v
                   Find user
                          |
                          v
                 Compare DB token
                       /     \
                     NO       YES
                     |         |
                     v         v
                   401    Rotate tokens
                              |
                              v
                       New access token
                              |
                              v
                      Continue session

## 42. JWT vs Token — Important Terminology

A JWT is itself a token.

There isn't a separate "JWT token" and then another token generated from the JWT.

In this project:

jwt.sign(...)

creates the actual JWT string.

For example, conceptually:

header.payload.signature

That resulting string is the token sent/stored by the application.

So:

JWT = token format
Access token = JWT used for API authorization
Refresh token = JWT used for refreshing authentication

The distinction is mainly about purpose, not about one token being generated from the other.

## 43. What jwt.sign() Actually Does

Conceptually:

Payload
   +
Secret
   |
   v
JWT signature
   |
   v
JWT string

The server signs the token using the secret.

Later:

Incoming JWT
     +
Expected secret
     |
     v
jwt.verify()
     |
     +--> valid
     |
     +--> invalid / expired

The server can therefore detect whether the token was correctly signed and is still valid.

## 44. What Is Inside the JWT?

This project signs:

{ id: userid }

JWTs commonly have three sections:

HEADER.PAYLOAD.SIGNATURE

Conceptually:

Header
  |
  +--> token metadata/algorithm

Payload
  |
  +--> id

Signature
  |
  +--> proves the token was signed with the expected secret

Important:

JWT payloads are encoded, not encrypted by default.

Therefore sensitive information should not be placed in the payload simply because it is inside a JWT.

## 45. Common Mistakes to Avoid

Mistake 1 — Sending the refresh token with every API request

Don't treat the refresh token like an access token.

Normal protected API:

Authorization: Bearer <access-token>

Refresh endpoint:

refresh-token cookie

Mistake 2 — Making the access token extremely long-lived

A long-lived access token increases the useful lifetime of a stolen access credential.

The project intentionally uses:

15 minutes

for the access token.

Mistake 3 — Using the wrong secret

This is incorrect:

jwt.verify(refreshToken, ACCESS_TOKEN_SECRET);

The refresh token was signed using:

REFRESH_TOKEN

so it needs to be verified with the corresponding refresh secret.

Mistake 4 — Forgetting Bearer

The expected authorization header is:

Authorization: Bearer <token>

The code:

req.headers.authorization?.split(" ")[1]

expects that structure.

Mistake 5 — Forgetting cookie parsing

This:

req.cookies.refreshtoken

depends on:

app.use(cookieParser())

being configured.

Mistake 6 — Thinking JWT verification finds the user

JWT verification only validates/decodes the token.

This:

jwt.verify(token, secret)

does not query MongoDB.

The application separately does:

usermodel.findById(decoded.id)

These are two different operations:

JWT verification
      |
      v
Is this token valid?
      |
      v
decoded.id
      |
      v
MongoDB query
      |
      v
Does this user exist?

## 46. The Three Layers of Authentication in This Project

It helps to separate these concepts.

Layer 1 — Credential verification

During login/registration, the application establishes who the user is.

Layer 2 — JWT verification

The server checks whether the presented JWT is valid.

jwt.verify(...)

Layer 3 — User lookup

The server uses the ID from the JWT to retrieve the user:

usermodel.findById(decoded.id)

Authentication systems often become much easier to understand once these responsibilities are kept separate.

## 47. Why the Refresh Token Is Stored in MongoDB

A pure stateless JWT system would only need to verify the refresh JWT.

This project goes one step further:

Refresh JWT
    |
    v
JWT signature valid?
    |
    v
Compare against MongoDB
    |
    v
Accepted?

The database check provides server-side control over the refresh token.

For example, if the stored refresh token is cleared:

user.refreshtoken = null;

the refresh credential can no longer pass the database comparison.

This gives the server a way to revoke the refresh session.

## 48. Access Token and Refresh Token: Use Cases

Access Token Use Cases

Access tokens are appropriate for:

Fetching the authenticated user's profile

Creating user-owned resources

Updating user-owned resources

Deleting user-owned resources

Accessing protected API endpoints

Sending identity/authorization information with API requests

Example:

GET /app/auth/me
Authorization: Bearer <access-token>

Refresh Token Use Cases

Refresh tokens are appropriate for:

Obtaining a new access token

Keeping a user signed in without requiring frequent password entry

Maintaining a longer-lived login session

Supporting refresh-token rotation

Supporting server-side session revocation when refresh tokens are tracked

Example:

POST /app/auth/refresh

with the refresh token supplied by the browser cookie.

## 49. Simple Analogy

Think of a building.

Access Token = Temporary Access Badge

Badge:
"Allow me into the building."

Duration:
15 minutes

You show it frequently.

Refresh Token = Long-Lived Badge Renewal Credential

Credential:
"Allow me to receive a new temporary badge."

Duration:
7 days

You don't use the renewal credential to enter every room.

You use it to obtain another temporary access badge.

That is the core idea behind access + refresh token authentication.

## 50. Final Mental Model

Remember this:

                 USER LOGS IN
                      |
                      v
              +----------------+
              | Generate tokens|
              +----------------+
                 /          \
                /            \
               v              v
       ACCESS TOKEN      REFRESH TOKEN
         short-lived       long-lived
            |                   |
            |                   |
            v                   v
     Protected APIs       Refresh endpoint
            |                   |
            |                   v
            |             Verify refresh
            |                   |
            |                   v
            |             Check DB token
            |                   |
            |                   v
            |             Generate new pair
            |                   |
            +<------------------+

One-line memory trick

Access token = access the API. Refresh token = refresh the access.

And the most important distinction:

The refresh token is not used to authorize every API request. It is a credential used to obtain a fresh access token.

## 51. Source-Specific Notes

The explanations above are based on the supplied implementation.

The supplied code specifically uses:

Access token expiry: 15m

Refresh token expiry: 7d

Separate ACCESS_TOKEN and REFRESH_TOKEN configuration secrets

Refresh token stored in MongoDB

Refresh token stored in an HTTP-only cookie

Access token returned in the JSON response

Refresh-token comparison against the stored MongoDB value

Refresh-token rotation when /refresh succeeds

The supplied implementation does not show the login route or the contents of the configuration file containing the token secrets, so those parts are not described as implemented here.