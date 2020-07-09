// https://ramdajs.com/
// https://github.com/ramda/ramda/wiki/Cookbook
import R from "ramda";

const trace = (x) => {
  console.log(JSON.stringify(x));
  return x;
};

/*******************************************************************************
 * EXERCISES
 * - Hopefully you should get a lego feel from what you do.
 * - Focus on shaping your inputs to unary
 * - Remember to use trace in your compositions
 * - Remember that the imperative has been abstracted away so your FP library will have everything you need
 ******************************************************************************/

/*******************************************************************************
 * EXERCISE - ONE - CURRIED FUNCTION
 ******************************************************************************/
const phrase = "Jingle bells Batman smells";

const words_ = function (str) {
  return str.split(" ");
};

//words_(phrase);

/*******************************************************************************
 * EXERCISE - TWO - CURRIED COMPOSITION
 ******************************************************************************/
const phrases = ["Jingle bells Batman smells", "Robin laid an egg"];

const sentences_ = function (phrases) {
  return phrases.map(words_);
};

// sentences_(phrases);

/*******************************************************************************
 * EXERCISE - THREE - COGNITIVE LOAD
 ******************************************************************************/
const qList = ["quarry", "camel", "quackers", "bacon", "over", "qualified"];

const filterQs_ = function (arr) {
  return arr.filter(function (item) {
    return /q/gi.test(item);
  });
};

// filterQs_(qList);

/*******************************************************************************
 * EXERCISE - FOUR - INPUT SHAPE (Unary)
 ******************************************************************************/
function add_(x, y) {
  return x + y;
}

function multiplyBy3_(x) {
  return x * 3;
}

function divideBy_(x, y) {
  return x / y;
}

// divideBy_(2, multiplyBy3_(add_(3, 5)));

/*******************************************************************************
 * EXERCISE - FIVE - GENERALISE
 ******************************************************************************/
const cameras = [
  { model_name: "Canon EOS 5D", in_stock: true, price: 123 },
  { model_name: "Canon EOS 5D", in_stock: false, price: 456 },
  { model_name: "Canon EOS 5D", in_stock: true, price: 789 },
];

const isLastCameraInStock_ = function (cameras) {
  const lastCamera = cameras[cameras.length - 1];

  return lastCamera.in_stock;
};

// isLastCameraInStock_(cameras);

/*******************************************************************************
 * EXERCISE - SIX - BREAKING IT DOWN (Remainder -> Equals)
 ******************************************************************************/
function isOdd_(x) {
  return x % 2 === 1;
}

function isEven_(x) {
  return x % 2 !== 1;
}

// Create remainder function

// Create Equals function

// Compose isOdd and isEven