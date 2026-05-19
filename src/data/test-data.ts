export const USERS = {
  STANDARD:           { username: 'standard_user',          password: 'secret_sauce' },
  LOCKED_OUT:         { username: 'locked_out_user',         password: 'secret_sauce' },
  PROBLEM:            { username: 'problem_user',            password: 'secret_sauce' },
  PERFORMANCE_GLITCH: { username: 'performance_glitch_user', password: 'secret_sauce' },
  ERROR:              { username: 'error_user',              password: 'secret_sauce' },
  VISUAL:             { username: 'visual_user',             password: 'secret_sauce' },
  INVALID:            { username: 'invalid_user',            password: 'wrong_password' },
} as const;

export const CHECKOUT = {
  VALID: { firstName: 'John', lastName: 'Doe', postalCode: '12345' },
} as const;

export const PRODUCTS = {
  BACKPACK:  { name: 'Sauce Labs Backpack',    id: 'sauce-labs-backpack' },
  BIKE_LIGHT: { name: 'Sauce Labs Bike Light', id: 'sauce-labs-bike-light' },
  BOLT_SHIRT: { name: 'Sauce Labs Bolt T-Shirt', id: 'sauce-labs-bolt-t-shirt' },
} as const;

export const MESSAGES = {
  LOCKED_OUT_ERROR:     'Epic sadface: Sorry, this user has been locked out.',
  INVALID_CREDS_ERROR:  'Epic sadface: Username and password do not match any user in this service',
  EMPTY_USERNAME_ERROR: 'Epic sadface: Username is required',
  EMPTY_PASSWORD_ERROR: 'Epic sadface: Password is required',
  FORM_FIRST_NAME:      'Error: First Name is required',
  FORM_LAST_NAME:       'Error: Last Name is required',
  FORM_POSTAL_CODE:     'Error: Postal Code is required',
  ORDER_SUCCESS:        'Thank you for your order!',
} as const;

export const URLS = {
  LOGIN:             '/',
  INVENTORY:         '/inventory.html',
  CART:              '/cart.html',
  CHECKOUT_STEP_ONE: '/checkout-step-one.html',
  CHECKOUT_STEP_TWO: '/checkout-step-two.html',
  CHECKOUT_COMPLETE: '/checkout-complete.html',
} as const;
