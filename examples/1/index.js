// https://ramdajs.com/
// https://github.com/ramda/ramda/wiki/Cookbook
import R  from "ramda";

const trace = (x) => {
  console.log(JSON.stringify(x));
  return x;
};

/*******************************************************************************
 * BASIC EXAMPLES
 ******************************************************************************/

const isFalse = 'x' === 'y';
const isStillFalse = R.equals('x', 'y');

const isHello = R.equals('hello');
const isHelloTrue = isHello('hello');

// -----------------------------------------------------------------------------

const four = 2 + 2;
const six = R.add(3, 3);

const add4 = R.add(4);
const eight = add4(R.add(3, 1));

// -----------------------------------------------------------------------------

const arr = [
  { a: 1, b: 1, c: 1 },
  { a: 2, b: 2, c: 2 },
  { a: 3, b: 3, c: 3 },
  { a: 4, b: 4, c: 4 },
  { a: 5, b: 5, c: 5 }
];
// imperative
// arr.find((item) => item.a === 3);
// declarative
// R.find(R.propEq('a', 3), arr);
// { a: 3, b: 3, c: 3 }

// -----------------------------------------------------------------------------

const obj = { d: 3, e: 3, f: 3 };
// imperative
// arr.map((item) => {
//   if (item.a === 3) {
//     return { ...item, ...obj };
//   }

//   return obj;
// });
// declarative
const mergeWhen = R.curry((pred, obj, arr) => R.map(R.when(pred, R.mergeLeft(obj)), arr));
// *****
// mergeWhen(R.propEq('a', 3), obj, arr);
// { a: 3, b: 3, c: 3, d: 3, e: 3, f: 3 }
// mergeWhen(R.equals(3), obj, arr[2]);
// {
//   a: { d: 3, e: 3, f: 3 },
//   b: { d: 3, e: 3, f: 3 },
//   c: { d: 3, e: 3, f: 3 }
// }

/*******************************************************************************
 * LENSES
 * - Works like a getter/setter
 * - Works with array indexes
 * - Composable
 * - Immutable
 * - Builds a relationship with the data
 ******************************************************************************/
const values = { filters: { active: [{ badger: "ss" }] } };

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
 * - Controlling shape of the input is fundamental to succeed in FP
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

const myWords = ["hello", "world", "goodbye"];

// const toUpperAndSplit = R.pipe(R.toUpper, R.split(""));
// const mapUpperAndSplit = R.map(toUpperAndSplit);

// mapUpperAndSplit(myWords);

// const filterO = R.filter(R.equals('O'));
// const filterLastWordSplit = R.pipe(mapUpperAndSplit, R.flatten, filterO);

// filterLastWordSplit(myWords);

/*******************************************************************************
 * TRANSDUCTION
 * - Reducer composition
 * - Everything is turned into reducers map/filter etc
 * - Single iteration through reducers
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