// https://ramdajs.com/
// https://github.com/ramda/ramda/wiki/Cookbook
import M from "monet";
// https://folktale.origamitower.com/
// https://folktale.origamitower.com/api/v2.0.0/en/folktale.concurrency.task.html
import Task from "folktale/concurrency/task";

const trace = (x) => {
  console.log(JSON.stringify(x));
  return x;
};

// Compose functions
const pipe = (...fns) => (arg) =>
  fns.reduce((accumulator, fn) => fn(accumulator), arg);

const Identity = (x) => ({
  map: (f) => Identity.of(f(x)),
  fold: (f) => f(x),
  inspect: `Identity(${JSON.stringify(x)})`,
});

Identity.of = Identity;

/*******************************************************************************
 * EXERCISES
 * - Remember that monads expect another monad to change application flow
 ******************************************************************************/

/*******************************************************************************
 * EXERCISE - ONE - THE BASE (FUNCTOR)
 ******************************************************************************/

const values = {
  id: 12345,
  name: "  spongebob stnaperauqs  ",
};

function trimReverseSurname_(str) {
  const trimmed = str.trim();
  const words = trimmed.split(" ");

  return `${words[0]} ${words[1].split("").reverse().join("")}`;
}

// trimReverseString_(values.name);


// Use a Functor to replace the above implementation
const trim = (x) => x.trim();
const split = (match) => (x) => x.split(match);
const reverse = (x) => x.reverse();
const join = (str) => (x) => x.join(str);
const reverseText = pipe(split(""), reverse, join(""));
// Update array at index
const adjust = (index, fn) => (arr) => {
  const list = [...arr];
  list[index] = fn(list[index]);
  return list;
};
// Your Functor function
const trimReverseSurname = (x) => null;

// trimReverseSurname(values.name);

/*******************************************************************************
 * EXERCISE - TWO - HANDLING NULL/UNDEFINED (MAYBE)
 ******************************************************************************/

const values = {
  null: null,
  string: "",
  empty: [],
  missing: [
    {
      wrong: "field",
    },
  ],
  prices: [
    {
      value: 15500,
    },
    {
      value: 0,
    },
    {
      value: 200,
    },
  ],
};

function centToDecimal(value) {
  return value / 100;
}

function getHeadPropToDecimal_(arr) {
  if (!arr || !Array.isArray(arr)) {
    return 0;
  }

  const item = arr[0];

  return item && item.value ? centToDecimal(item.value) : 0;
}

// getHeadPropToDecimal_(values.null);
// getHeadPropToDecimal_(values.string);
// getHeadPropToDecimal_(values.empty);
// getHeadPropToDecimal_(values.missing);
// getHeadPropToDecimal_(values.prices);

// Use a Maybe to replace the above implementation

// Create a safe head function using a Maybe (Just/Nothing)
const safeHead = (arr) => null;
// Create a safe prop function using a Maybe (Just/Nothing)
const safeProp = (x) => (obj) => null;
// Your Maybe function
const getHeadPropToDecimal = (x) => null;

// getHeadPropToDecimal(values.null).orJust(0);
// getHeadPropToDecimal(values.string).orJust(0);
// getHeadPropToDecimal(values.empty).orJust(0);
// getHeadPropToDecimal(values.missing).orJust(0);
// getHeadPropToDecimal(values.prices).orJust(0);

/*******************************************************************************
 * EXERCISE - THREE - TRAIN TRACKS (EITHER)
 ******************************************************************************/

const getCustomerMeta = (id) => {
  if (!id) {
    throw `ID is missing`;
  }

  return {
    id,
    name: 'Henry',
    address: {},
    phone: '01273111222'
  };
};

// -----------------------------------------------------------------------------

const values = {
  id: 12345
};

function getCustomer_(values) {
  if (!values) {
    console.log('No data');
    return;
  }

  try {
    return getCustomerMeta(values.id);
  } catch (error) {
    console.log(error);
  }
}

// getCustomer_(values);

// Use an Either to replace the above implementation

// Create a safe prop function using an Either
const getProp = (x) => (obj) => null;
// Create a try/catch function using an Either
const tryCatch = (fn) => (x) => null;
// Your Either function
const getCustomer = (x) => null;

// getCustomer(values).fold(
//   x => x,
//   x => x
// );

/*******************************************************************************
 * EXERCISE - FOUR - BRIGHT FUTURES (ASYNC)
 ******************************************************************************/

const responseOne = { data: { foo: { zip: true, pop: false, bang: true } } };
const responseTwo = { data: { bar: { wiz: true, pow: true, zop: true } } };
const responseThree = {
  data: { baz: { beep: false, boop: false, fizz: true } },
};

// {
//   foo: { zip: true, pop: false, bang: true },
//   bar: { wiz: true, pow: true, zop: true },
//   baz: { beep: false, boop: false, fizz: true }
// }

const request_ = (ms, data) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(data), ms);
  });

const requestFail_ = (ms, error) =>
  new Promise((resolve, reject) => {
    setTimeout(() => reject(error), ms);
  });

async function getData_() {
  try {
    const responses = await Promise.all([
      request_(100, responseOne),
      request_(1500, responseTwo),
      request_(500, responseThree),
    ]);

    console.log(responses);
    const result = responses.reduce((acc, next) => {
        return {...acc, ...next.data};
    }, {});
    console.log(result);
  } catch (error) {
    console.log(error);
  }
}

getData_();

// -----------------------------------------------------------------------------

// https://folktale.origamitower.com/api/v2.3.0/en/folktale.concurrency.task.html
// Using the above documentation reimplement getData_
const request = (ms, data) => null;
const requestFail = (ms) => null


// pure functions
const requestA = null;
const requestB = null;
const requestC = null;
const mergeAll = xs => xs.reduce((acc, next) => ({ ...acc, ...next }), {});

const fetchAll = null;

// -----------------------------------------------------------------------------

// component
async function getData() {
  try {
    const result = await fetchAll.run().promise();
    console.log(result);
  } catch (error) {
    console.log(error);
  }
}

// getData();