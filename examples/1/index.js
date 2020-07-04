// https://ramdajs.com/
// https://github.com/ramda/ramda/wiki/Cookbook
import R from "ramda";

const trace = (x) => {
  console.log(JSON.stringify(x));
  return x;
};

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
const activeFilterLens = R.lensPath(["filters", "active"]);

const hasFilters = R.pipe(R.view(activeFilterLens), R.isEmpty, R.not);
const getFilters = R.view(activeFilterLens);
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
hasFilters(values);

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
 * REAL WORLD
 ******************************************************************************/

const camelCase = (str) =>
  str.replace(/[-_]([a-z])/g, (x) => x[1].toUpperCase());

const obj = {
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

// convertKeyNames_(obj, camelCase);

// 1st attempt
// const convertKeyNames = (fn, obj) => {
//   const reduceKey = (acc, [key, value]) => ({...acc, [fn(key)]: convertKeyNames(fn, value) });
//   const reducePairs = R.pipe(R.toPairs, R.reduce(reduceKey, {}));

//   return R.ifElse(Array.isArray, R.map(reducePairs), reducePairs)(obj);
// };

// convertKeyNames(camelCase, obj);

// 2nd attempt higher order function with inverted control
// const reduceNodes = (fn) => {
//   const reducer = (acc, [key, value]) => ({ ...acc, ...fn(key, value) });
//   const reducePairs = R.pipe(R.toPairs, R.reduce(reduceKey, {}));

//   return R.ifElse(Array.isArray, R.map(reducePairs), reducePairs);
// };

// const toCamelCaseKeys = (key, value) => ({ [camelCase(key)]: convertKeyNames(value) });
// const convertKeyNames = reduceNodes(toCamelCaseKeys);
// convertKeyNames(obj);
