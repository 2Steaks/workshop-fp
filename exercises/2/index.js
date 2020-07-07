// https://ramdajs.com/
// https://github.com/ramda/ramda/wiki/Cookbook
import R from "ramda";
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

// Update array at index
const adjust = (index, fn) => (arr) => {
  const list = [...arr];
  list[index] = fn(list[index]);

  return list;
};

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

const functorValues = {
  id: 12345,
  name: "  spongebob stnaperauqs  ",
};

function trimReverseString_(str) {
  const trimmed = str.trim();
  const words = trimmed.split(" ");

  return `${words[0]} ${words[1].split("").reverse().join("")}`;
}

// trimReverseString_(functorValues.name);

////////////////////////////////////////////////////////////////////////////////



/*******************************************************************************
 * EXERCISE - TWO - HANDLING NULL/UNDEFINED (MAYBE)
 ******************************************************************************/

const maybeValues = {
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

// getHeadPropToDecimal_(maybeValues.null);
// getHeadPropToDecimal_(maybeValues.string);
// getHeadPropToDecimal_(maybeValues.empty);
// getHeadPropToDecimal_(maybeValues.missing);
// getHeadPropToDecimal_(maybeValues.prices);

////////////////////////////////////////////////////////////////////////////////



/*******************************************************************************
 * EXERCISE - THREE - TRAIN TRACKS (EITHER)
 ******************************************************************************/

const getCustomerMeta = (id) => {
  if (!id) {
    throw `failed id was missing`;
  }

  return {
    id,
    name: 'Henry',
    address: {},
    phone: '01273111222'
  };
};

// -----------------------------------------------------------------------------

const eitherValues = {
  id: 12345
};

function getCustomer_(values) {
  if (!values.id) {
    console.log('ID was missing');
    return;
  }

  try {
    return getCustomerMeta(values.id);
  } catch (error) {
    console.log(error);
  }
}

// getCustomer_(eitherValues);

////////////////////////////////////////////////////////////////////////////////



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

// getData_();

////////////////////////////////////////////////////////////////////////////////

const request = (ms, data) => Task.task((resolver) => {
  const timerId = setTimeout(() => resolver.resolve(data), ms);

  resolver.cleanup(() => {
      clearTimeout(timerId)
  });
});

const requestFail = (ms) => Task.task((resolver) => {
  const timerId = setTimeout(() => resolver.reject(ms), ms);

  resolver.cleanup(() => {
      clearTimeout(timerId)
  });
});


// pure functions

// -----------------------------------------------------------------------------

// component
async function getData() {

}

// getData();