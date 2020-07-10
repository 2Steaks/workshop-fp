// https://ramdajs.com/
// https://github.com/ramda/ramda/wiki/Cookbook
import R from "ramda";

const trace = (x) => {
  console.log(JSON.stringify(x));
  return x;
};

/*******************************************************************************
 * TODAY 
 ******************************************************************************/
// - FP core concepts 🧠
// - Use Ramda 🐏
// - Running through some exerices 🏃‍♂️

/*******************************************************************************
 * CONCEPTS
 ******************************************************************************/

// Pure functions instead of shared state & side effects
// Immutability over mutable data
// Function composition over imperative flow control
// Lots of generic, reusable utilities that use higher order functions to act on many data types instead of methods that only operate on their colocated data
// Declarative rather than imperative code (what to do, rather than how to do it)
// Expressions over statements
// Containers & higher order functions over ad-hoc polymorphism

/*******************************************************************************
 * PRINCIPLES
 ******************************************************************************/

// Pure functions

// impure
const hasDateExpired_ = (dateString) => {
  const startDate = dateString && new Date(dateString).getTime();
  const endDate = new Date(Date.now()).getTime();

  return startDate > endDate;
};

// pure
// FP docs written with a system called Hindley-Milner

// hasDateExpired :: Date -> Date -> Bool
const hasDateExpired = R.curry((a, b) => new Date(a).getTime() > new Date(b).getTime());

const warrantyEnd = new Date('01/01/2050');
// hasDateExpired(Date.now(), warrantyEnd)

// We can box up operations that cause side-effects by deferring execution and it will be considered pure
// It only becomes impure when we pull the trigger
const $ = { getJSON: () => {}};
const getJSON = R.curry((callback, url) => $.getJSON(url, callback));

// getJSON('/path/to/file.json');

// What are side effects?
// - changing the file system
// - inserting a record into a database
// - making an http call
// - mutations
// - printing to the screen / logging
// - obtaining user input
// - querying the DOM
// - accessing system state

// What are the benefits?
// - Enables memoization
// - Self documenting
// - Will always work despite future changes (change of library)
// - Highly testable
// - Reasonable (referential transparency + equational reasoning)
// - Parallel code (no race conditions)

// -----------------------------------------------------------------------------

// Immutability

const bananas = { count: 10 };
// Notice how external state could immediately increase cognitive load
function mutateBananas() {
  return bananas.count + 1;
}

// Think about why state machines were created and how complex and bug prone our applications would be without them
// React function components goes a step further by irradicating top level mutable state (this, var, let)
const createNewBananas = (bananas) => ({ ...bananas, count: bananas.count + 1 });

// -----------------------------------------------------------------------------

// Associativity - Pure functions with the same input/output shape are associative
// ((1 + 2) + 3) === (1 + (2 + 3));
// R.add(R.add(1, 2), 3) === R.add(1, R.add(2, 3));

// -----------------------------------------------------------------------------

// Referential transparency - It basically means that in theory you could replace 
// a function return value with the result and not effect the behaviour of the application
function add(a, b) {
  return a + b
}

function multiply(a, b) {
  return a * b;
}

const valueA = add(2, multiply(3, 4));
// replace multiply with value
const valueB = add(2, 12)
// replace add with value
const valueC = 14;
// Replacing a call to the add method with the corresponding return value will 
// change the result of the program, since the message will no longer be printed. 
// In that case, it would only remove the side effect but in other cases, 
// it might change the value returned by the method:
function addWithSideEffect(a, b) {
  const result = a + b;
  console.log("Returning " + result);
  return result;
}

// -----------------------------------------------------------------------------

// Equational reasoning - Interchanging functions that accept the same input shape
function getPerson(x) {
  return renderPerson(x);
}

// getPerson(renderPerson);

// -----------------------------------------------------------------------------

// Composition
const f = () => {};
const g = () => {};
const h = () => {};

const composeA = (x) => f(g(x));
// data must always be passed in as the last argument
// first class functions = treat functions like any other data type
const composeB = R.compose(f, g);
// composition is associative, as long as the order is respected.
// R.compose(R.compose(f, g), h) === R.compose(f, R.compose(g, h));

// -----------------------------------------------------------------------------

// Does it function? FP makes the distinction.
// Just because it uses the "function" keyword doesn't make it a function
function isProcedure() {
  f();
  g();
}

// A function must return
function isFunction(x) {
  return x + 1;
}

// -----------------------------------------------------------------------------

// Basic examples
const isFalse = 'x' === 'y';
const isStillFalse = R.equals('x', 'y');

// specialised function (curried)
const isHello = R.equals('hello');
const isHelloTrue = isHello('hello');


const four = 2 + 2;
const six = R.add(3, 3);

const add4 = R.add(4);
const eight = R.add(3, add4(1));

// -----------------------------------------------------------------------------

const arr = [
  { a: 1, b: 1, c: 1 },
  { a: 2, b: 2, c: 2 },
  { a: 3, b: 3, c: 3 },
  { a: 4, b: 4, c: 4 },
  { a: 5, b: 5, c: 5 }
];
// imperative
// let found;

// for (let i = 0; i < arr.length; i++) {
//   if (arr[i] && arr[i].a === 3) {
//     found = arr[i];
//   }
// }
// ES6 was an improvement
// arr.find((item) => item.a === 3);
// Fully declarative
// R.find(R.propEq('a', 3), arr);
// { a: 3, b: 3, c: 3 }

// -----------------------------------------------------------------------------

const obj = { d: 3, e: 3, f: 3 };
// imperative
// arr.map((item) => {
//   if (item.a === 3) {
//     return { ...item, ...obj };
//   }

//   return item;
// });

// declarative - method has been generalised and is now highly reusable
const mergeWhen = R.curry((pred, obj, arr) => R.map(R.when(pred, R.mergeLeft(obj)), arr));

// mergeWhen(R.propEq('a', 3), obj, arr);
// { a: 3, b: 3, c: 3, d: 3, e: 3, f: 3 }

/*******************************************************************************
 * LENSES
 * - Works like a getter/setter
 * - Works with array indexes
 * - Composable
 * - Immutable
 * - Builds a relationship with the data
 ******************************************************************************/
const setState = () => {};
const values = { filters: { active: [{ crackers: "cheese" }] } };

// old
function updateFilters_(filters = []) {
  setState((prevState) => ({
    ...prevState,
    filters: {
      ...prevState.filters,
      active: filters,
    },
  }));
}

function hasFilters_() {
  const activeFilters = values.filters?.active ?? [];

  return activeFilters.length > 0;
}

// hasFilters_();

// PURE FUNCTION MODULE
const hasValue = R.complement(R.isEmpty);
const activeFilterLens = R.lensPath(["filters", "active"]);

const getFilters = R.view(activeFilterLens);
const hasFilters = R.pipe(getFilters, hasValue);
const setFilters = R.set(activeFilterLens);

// -----------------------------------------------------------------------------

// REACT COMPONENT

// getter
const activeLenses = getFilters(values);

// setter
function updateFilters(filters = []) {
  setState(setFilters(filters));
}

// has data
// hasFilters(values);

/*******************************************************************************
 * COMPOSITION
 * - Data last
 * - Controlling shape of the input is fundamental
 * - Deferred execution through currying makes this possible
 ******************************************************************************/
const nums = [{ a: 2 }, { a: 4 }, { a: 6 }, { a: 8 }, { a: 100 }, { a: 1 }];

const sumBy_ = function (arr, prop) {
  return arr.reduce(function add(total, obj) {
    return total + obj[prop];
  }, 0);
};

// const sumBy = R.pipe(R.map, R.sum);

// sumBy(R.prop('a'), nums); //=> 121
// sumBy((obj) => obj.a * 2, nums); //=> 242
// sumBy(R.identity, [2,4,6,8,100,100]); //=> 220

/*******************************************************************************
 * COMPOSING COMPOSITIONS
 * - Undeniably flexible
 ******************************************************************************/

const words = ["hello", "world", "goodbye"];

// const toUpperAndSplit = R.pipe(R.toUpper, R.split(""));
// const mapUpperAndSplit = R.map(toUpperAndSplit);

// mapUpperAndSplit(words);

// const filterO = R.filter(R.equals('O'));
// const filterLastWordSplit = R.pipe(mapUpperAndSplit, R.flatten, filterO);

// filterLastWordSplit(words);

/*******************************************************************************
 * TRANSDUCTION
 * - Reducer composition
 * - Everything is turned into reducers map/filter etc
 * - Single iteration through nested reducers
 ******************************************************************************/

const hasX = (obj) => obj.x;
const addY = (obj) => ({ ...obj, y: "kapow" });
const filterXMapY = R.pipe(R.filter(hasX), R.map(addY));
const transduceXY = R.into([], filterXMapY);

const transArr = [{ x: "boom" }, { x: false }, { x: "splat" }];
// transduceXY(transArr);

/*******************************************************************************
 * REAL WORLD EXAMPLES
 ******************************************************************************/

function deleteObservation_() {
  const { values } = this.props;
  const { observationModal } = this.state;
  const { rowIndex } = observationModal;
  const previousObservations =
      getNestedValue({
          object: values,
          fieldPath: 'general.observations'
      }) || [];
  const observations = previousObservations.filter(
      (obj, index) => index !== rowIndex
  );

  this.updateObservationData({ observations });
  this.closeObservationModal();
}

// // pure functions
// const getObservations = R.path(["general", "observations"]);
// const removeObservation = (index, values) =>  R.pipe(getObservations, R.remove(index, 1))(values);

// // react component
// function deleteObservation() {
//   const { values } = this.props;
//   const { observationModal } = this.state;
//   const { rowIndex } = observationModal;

//   this.updateObservationData({ observations: removeObservation(rowIndex, values) });
//   this.closeObservationModal();
// }

// -----------------------------------------------------------------------------

function hasAddress_() {
  const { values } = this.props;
  const address = getNestedValue({
      object: values,
      fieldPath: 'collection.address'
  });

  return Boolean(
      address &&
      hasValue(address.country) && 
      hasValue(address.postcode)
  );
}

// pure functions
// const validation = R.where({ country: hasValue, postcode: hasValue });
// const hasAddress = R.pathSatisfies(validation, ['collection', 'address']);

// -----------------------------------------------------------------------------

const camelCase = (str) =>
  str.replace(/[-_]([a-z])/g, (x) => x[1].toUpperCase());

const convertObj = {
  a_one: {},
  b_one: [
    {
      a_two: {},
      b_two: [
        {
          a_three: {},
          b_three: [{}],
        },
      ],
    },
  ],
  c_one: [
    {
      a_two: {},
      b_two: [{}],
    },
  ],
  d_one: {},
};

function convertKeyNames_(object: any, convert: (name: string) => string): any {
  if (object == null || typeof object !== "object") {
    return object;
  }

  if (Array.isArray(object)) {
    return object.map((value) => convertKeyNames_(value, convert));
  } else {
    const converted = {};
    Object.keys(object).forEach((key) => {
      if (Object.keys(object).includes(key)) {
        converted[convert(key)] = convertKeyNames_(object[key], convert);
      }
    });
    return converted;
  }
}

// convertKeyNames_(convertObj, camelCase);

// 1st attempt
// const convertKeyNames = (fn, obj) => {
//   const reduceKey = (acc, [key, value]) => ({...acc, [fn(key)]: convertKeyNames(fn, value) });
//   const reducePairs = R.pipe(R.toPairs, R.reduce(reduceKey, {}));

//   return R.ifElse(Array.isArray, R.map(reducePairs), reducePairs)(obj);
// };

// convertKeyNames(camelCase, convertObj);

// 2nd attempt higher order function with inverted control
// const reduceNodes = (fn) => {
//   const reducer = (acc, [key, value]) => ({ ...acc, ...fn(key, value) });
//   const reducePairs = R.pipe(R.toPairs, R.reduce(reduceKey, {}));

//   return R.ifElse(Array.isArray, R.map(reducePairs), reducePairs);
// };

// const toCamelCaseKeys = (key, value) => ({ [camelCase(key)]: convertKeyNames(value) });
// const convertKeyNames = reduceNodes(toCamelCaseKeys);
// convertKeyNames(convertObj);