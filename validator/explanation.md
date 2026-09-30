# Express Validator — Concept Notes

## Table of Contents

1. [What is express-validator?](#1-what-is-express-validator)
2. [Request Flow](#2-request-flow)
3. [Importing Validators](#3-importing-validators)
4. [`body()`](#4-body)
5. [Validation Methods](#5-validation-methods)
6. [`.withMessage()`](#6-withmessage)
7. [Chaining Validators](#7-chaining-validators)
8. [Validator Middleware Array](#8-creating-a-validator-middleware-array)
9. [`validationResult(req)`](#9-validationresultreq)
10. [`errors.isEmpty()`](#10-errorsisempty)
11. [Why `return`?](#11-why-return)
12. [`errors.array()`](#12-errorsarray)
13. [Why `next()`?](#13-why-next)
14. [Using the Validator in a Route](#14-using-the-validator-in-a-route)
15. [Mental Model & Cheat Sheet](#15-mental-model--cheat-sheet)
16. [Common Pitfalls](#16-common-pitfalls)

---

## 1. What is express-validator?

**express-validator** is a middleware library that **validates** and **sanitizes** incoming data in an Express application.

Never trust data sent by the client. Instead, check it _before_ the request reaches the controller.

- **Validation** → checks whether data meets a rule (e.g. "is this a valid email?")
- **Sanitization** → modifies data into a clean form (e.g. trimming whitespace)

---

## 2. Request Flow

```text
Frontend Request
      ↓
Validation Middleware
      ↓
Are there validation errors?
   ↙              ↘
 YES               NO
  ↓                 ↓
400 Response      next()
                    ↓
               Controller
```

---

## 3. Importing Validators

```js
import { body, validationResult } from "express-validator";
```

Import only what you need.

| Function             | Purpose                                         |
| -------------------- | ----------------------------------------------- |
| `body()`             | Validates fields in `req.body`                  |
| `param()`            | Validates fields in `req.params`                |
| `query()`            | Validates fields in `req.query`                 |
| `validationResult()` | Collects the validation errors from the request |

---

## 4. `body()`

Use `body()` when the data to validate comes from `req.body`.

```js
body("email");
```

> "Select the `email` field from the request body and apply validation rules to it."

Example:

```js
body("email").isEmail();
```

Incoming request body:

```json
{
  "email": "user@example.com"
}
```

---

## 5. Validation Methods

Multiple methods can be chained on a single field. Each method checks one condition.

```js
body("email")
  .exists()
  .withMessage("Email is required")
  .isEmail()
  .withMessage("Invalid email address");
```

### `.exists()`

Checks that the field is present in the request. If it is missing (`undefined`), validation fails.

```js
body("email").exists();
```

> **Note:** By default, `.exists()` passes for empty strings (`""`). To reject empty values as well, use `.notEmpty()` or `.exists({ checkFalsy: true })`.

### `.isEmail()`

Checks that the value is a validly formatted email address.

```js
body("email").isEmail();
```

### `.isMobilePhone()`

Checks that the value is a valid mobile phone number for a given locale.

```js
body("phone").isMobilePhone("en-IN");
```

The `"en-IN"` argument specifies the **locale** (India) used for the phone-number format.

### `.trim()`

A **sanitizer** — removes whitespace from the start and end of the value.

```js
body("password").trim();
```

### `.isLength()`

Checks the length of a string.

```js
body("password").isLength({ min: 6 });
```

Requires at least 6 characters. `max` can also be provided: `{ min: 6, max: 64 }`.

---

## 6. `.withMessage()`

`.withMessage()` sets the error message returned when the validator **immediately before it** fails.

```js
body("email").isEmail().withMessage("Invalid email address");
```

If the email is invalid, the error's `msg` will be:

```text
Invalid email address
```

This gives clients clear, meaningful error messages instead of a generic default.

---

## 7. Chaining Validators

A single field often has several requirements, so validators (and sanitizers) are chained in order.

```js
body("password")
  .exists()
  .withMessage("Password is required")
  .trim()
  .isLength({ min: 6 })
  .withMessage("Minimum of 6 characters is required");
```

The password must:

- exist
- have surrounding whitespace trimmed
- be at least 6 characters long

Think of it as a pipeline of checks:

```text
password
   ↓
Does it exist?
   ↓
Trim whitespace
   ↓
Is it at least 6 characters?
   ↓
Validation result
```

> **Order matters.** Place `.trim()` _before_ `.isLength()` so that a password of `"      "` (spaces only) is measured after trimming.

---

## 8. Creating a Validator Middleware Array

Validators are typically grouped into an array. The **last** item is a middleware that inspects the collected errors.

```js
const registerValidator = [
  body("email")
    .exists()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address"),

  body("phone")
    .exists()
    .withMessage("Phone number is required")
    .isMobilePhone("en-IN")
    .withMessage("Invalid phone number"),

  body("password")
    .exists()
    .withMessage("Password is required")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Minimum of 6 characters is required"),

  // Final middleware: checks the collected errors
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid Request",
        errors: errors.array(),
      });
    }

    next();
  },
];
```

The array contains multiple middleware functions. Express flattens it and runs them **in order**.

---

## 9. `validationResult(req)`

One of the most important pieces.

```js
const errors = validationResult(req);
```

While the request passes through the validators, each failure is recorded on the request object. `validationResult(req)` reads those recorded failures and returns a **result object**.

> "Give me all the validation errors collected for this request."

If both the email and the password are invalid, the result contains multiple errors.

---

## 10. `errors.isEmpty()`

```js
if (!errors.isEmpty()) {
  // ...
}
```

`isEmpty()` returns `true` when there are **no** validation errors.

```text
errors.isEmpty()
       ↓
   ┌───┴───┐
  true    false
   ↓        ↓
No errors  Errors exist
   ↓        ↓
 next()    return 400
```

Because the condition uses `!`:

```js
!errors.isEmpty();
```

it reads as _"the errors are **not** empty"_ — that is, **validation errors exist**. So the block means:

> "If validation errors exist, stop the request and send an error response."

---

## 11. Why `return`?

```js
return res.status(400).json({
  message: "Invalid Request",
  errors: errors.array(),
});
```

`return` immediately ends the middleware once the error response is sent.

Without it, execution would continue down to `next()`, which would:

- pass **invalid data** on to the controller, and
- likely cause a **"Cannot set headers after they are sent"** error, since a response was already sent.

Mental model:

```js
if (validationFailed) {
  return sendError();
}

next();
```

---

## 12. `errors.array()`

`validationResult(req)` returns a result object. `.array()` converts it into a plain array that is easy to send as JSON.

Example response:

```json
{
  "message": "Invalid Request",
  "errors": [
    {
      "type": "field",
      "value": "abc",
      "msg": "Invalid email address",
      "path": "email",
      "location": "body"
    }
  ]
}
```

| Field      | Meaning                                      |
| ---------- | -------------------------------------------- |
| `type`     | Kind of error (`field` for field validation) |
| `value`    | The value that was submitted                 |
| `msg`      | The error message (from `.withMessage()`)    |
| `path`     | The name of the field that failed            |
| `location` | Where the field was read from (`body`, etc.) |

So `errors: errors.array()` means:

> "Send the list of validation errors back to the client."

---

## 13. Why `next()`?

```js
next();
```

`next()` tells Express:

> "This middleware is finished — continue to the next middleware or controller."

In the validator, `next()` is reached **only when there are no validation errors**.

```text
Validation
    ↓
Errors?
  ↙     ↘
YES      NO
 ↓        ↓
return   next()
 ↓        ↓
400    Controller
```

---

## 14. Using the Validator in a Route

Pass the validator **before** the controller:

```js
router.post("/reg", registerValidator, registerController);
```

This creates the middleware chain:

```text
POST /reg
   ↓
registerValidator
   ↓
validation passes?
   ↓
registerController
```

**If validation fails:**

```text
POST /reg
   ↓
registerValidator
   ↓
❌ 400 response
   ↓
Controller never runs
```

**If validation succeeds:**

```text
POST /reg
   ↓
registerValidator
   ↓
✅ next()
   ↓
registerController
```

---

## 15. Mental Model & Cheat Sheet

> **Define rules → run the rules → collect errors → stop if errors exist → `next()` if everything is valid.**

| Concept                 | Purpose                               |
| ----------------------- | ------------------------------------- |
| `body()`                | Validate data from `req.body`         |
| `param()`               | Validate data from `req.params`       |
| `query()`               | Validate data from `req.query`        |
| `.exists()`             | Check that a field is present         |
| `.notEmpty()`           | Check that a value is not empty       |
| `.isEmail()`            | Check email format                    |
| `.isMobilePhone()`      | Check phone number format             |
| `.isLength()`           | Check string length                   |
| `.trim()`               | Remove surrounding whitespace         |
| `.withMessage()`        | Set a custom error message            |
| `validationResult(req)` | Collect validation errors             |
| `.isEmpty()`            | Check whether any errors exist        |
| `.array()`              | Get errors as an array                |
| `return res...`         | Stop and send the validation response |
| `next()`                | Continue to the next middleware       |

### One-Line Memory Trick

**VALIDATE → COLLECT → CHECK → STOP or CONTINUE**

```js
body("email").isEmail()      // VALIDATE
validationResult(req)        // COLLECT
errors.isEmpty()             // CHECK
return res(...) / next()     // STOP or CONTINUE
```

---

## 16. Common Pitfalls

- **`.exists()` accepts empty strings.** Use `.notEmpty()` when a value must not be blank.
- **`.withMessage()` applies only to the validator directly before it.** Add one after every validator that needs a custom message.
- **Multiple errors per field.** A missing `password` can fail both `.exists()` and `.isLength()`. Use `.bail()` after a validator to stop running further checks on that field once it fails:

  ```js
  body("password")
    .exists()
    .withMessage("Password is required")
    .bail()
    .trim()
    .isLength({ min: 6 })
    .withMessage("Minimum of 6 characters is required");
  ```

- **Forgetting `return`** before `res.status(400)...` lets the request continue to `next()`.
- **Validation ≠ authorization.** express-validator checks the _shape_ of the data, not whether the user is allowed to perform the action.
- **Keep validation on the server.** Frontend validation is a convenience; server-side validation is the real safeguard.

---

**That's the core of express-validator.**
