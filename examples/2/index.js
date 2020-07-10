import axios from "axios";
// https://ramdajs.com/
// https://github.com/ramda/ramda/wiki/Cookbook
import R from "ramda";
// https://monet.github.io/monet.js/
// https://evojam.com/technology-blog/2016/02/22/practical-intro-to-monads-in-javascript
import M from "monet";
// https://github.com/fluture-js/Fluture
// https://dev.to/avaq/fluture-a-functional-alternative-to-promises-21b
import Future from "fluture";
// https://folktale.origamitower.com/
// https://folktale.origamitower.com/api/v2.0.0/en/folktale.concurrency.task.html
import Task from "folktale/concurrency/task";
// https://github.com/rpominov/fun-task
import FunTask from 'fun-task';

const trace = (x) => {
  console.log(JSON.stringify(x));
  return x;
};

const isFunction = x => typeof x === 'function';
const isNumber = x => typeof x === 'number';
const isString = x => typeof x === 'string';

/*******************************************************************************
 * TODAY
 ******************************************************************************/
// - Diving deeper into FP 🏊‍♂️
// - Control flow 🛤
// - Error handling 💣
// - Containing impurity 📦
// - Use Monads 🧙‍♂️
// - Running through some exerices 🏋️‍♂️

/*******************************************************************************
 * FUNCTORS
 * - Laws
 * - Identity, which means to return itself, in this case, another functor
 * - Composition
 * - Inversion of control
 * - Dot chaining
 * - Abstraction of function application (we dont call the funtions we're getting BOX to call it for us)
 * - Building block to other implementations
 * - These arn't just pretty APIs they are founded in mathematics and won't change between implementations
 * - Getting slightly heavier into FP world
 ******************************************************************************/

// The Array can be considered a Functor because of it's map function
// In this case, Array is the context, and x is the value we're mapping over.
const x = 20;             // Some data of type `a`
const f = n => n * 2;     // A function from `a` to `b`
const arr = Array.of(x);  // The type lift.
// JS has type lift sugar for arrays: [x]
// .map() applies the function f to the value x
// in the context of the array.
const result = arr.map(f); // [40]


// Otherwise known as Identity
const Box = (x) => ({
  // Executes function with inner value then returns the result inside another context ready for next composition
  map: (f) => Box.of(f(x)),
  // Unwrap context to raw value
  fold: (f) => f(x),
  inspect: `Box(${JSON.stringify(x)})`,
});

Box.of = Box;

// const doStuffWithText = (text) =>
//   Box.of(text)
//     .map((x) => x.toUpperCase())
//     .map((x) => x.split(""))
//     .map((x) => x.reverse());

// doStuffWithText("hello world");

/*******************************************************************************
 * MONADS
 * - Data structure to handle flow
 * - Method of handling side effects
 * - Used with other monads to produce explicit flow
 * - Just be aware of them
 ******************************************************************************/

// A monad is a way of composing functions that require context in addition to 
// the return value, such as computation, branching, or I/O.

// The point of functors and monads is to abstract that context away so we don’t 
// have to worry about it while we’re composing things.


// The closest thing we have to a Monad is the Promise
const whereMyData = x => Promise.resolve(x);
// Notice out value is still stuck inside the context of a Promise
// whereMyData(20) // Promise(20)

// To get at the data/error we need to add our then/catch
new Promise((res, rej) => res(1))
  // Maps the value
  .then((x) => x + 1)
  // Automatically knows how to handle another Promise and flattens the promise to 4
  .then((y) => new Promise((res, rej) => res(y * 2)))
  // Automatically flattens the promise to 8
  .then((z) => new Promise((res, rej) => res(z * 2)))
  // 8
  .then(console.log) 
  .catch((error) => error);


// A basic example
function couldReturnSomething_(prop) {
  if (!prop) {
    return;
  }

  const foo = toFoo(prop);
  const bar = foo && toBar(foo);

  return bar && toBuzz(bar);
}

// Composition can continue or we can fold out to the raw value
const couldReturnSomething = prop => Maybe.of(prop)
  .chain(toFoo) // returns a Maybe (Just/Nothing)
  .chain(toBar) // returns a Maybe (Just/Nothing)
  .chain(toBuzz) // returns a Maybe (Just/Nothing)
  .fold();

/*******************************************************************************
 * MONADS - MAYBE
 * - Short circuiting
 * - Expects a Just (success) or a Nothing (failure)
 ******************************************************************************/

const Just = (x) => ({
  map: (f) => Just(f(x)),
  fold: (f) => f(x),
  inspect: `Just(${x})`,
});

const Nothing = (x) => ({
  // Will Keep returning a Nothing
  map: (f) => Nothing(),
  // When we fold out we simply return undefined
  fold: (f) => f(),
  inspect: `Nothing(${x})`,
});

const safe = pred => R.ifElse(pred, M.Maybe.Just, M.Maybe.Nothing);

// M.Maybe.of("hello")
//   .chain(safe(isString))
//   .map(x => x + ' world')
//   .orSome('default value');

const option = (x) => (maybe) => {
  if(!(maybe && isFunction(maybe.orSome))) {
    throw new TypeError('option: Last argument must be a Maybe');
  }

  return maybe.orSome(x)
};

// const getName = R.compose(
//   option('no name'),
//   safe(isString),
//   R.prop('name')
// )

// getName({ name: 'Ben' });


// notZero :: a -> Maybe Number
const notZero = safe(
  R.both(isNumber, x => x !== 0)
)
// safeDivide:: a -> a -> Maybe Number
const safeDivide = R.curry(
  (x, y) => R.lift(R.divide)(notZero(x), notZero(y))
)

// safeDivide(20, 0);
// //=> Nothing
// safeDivide(20, 5);
// //=> Just 4

/*******************************************************************************
 * MONADS - EITHER
 * - Branching logic (think train tracks)
 * - Expects a Right (success) or a Left (failure)
 ******************************************************************************/

const Right = (x) => ({
  map: (f) => Right(f(x)),
  // When we fold out the right side will be executed
  fold: (f, g) => g(x),
  inspect: `Right(${x})`,
});

const Left = (x) => ({
  // Notice the function is no longer executed
  map: (f) => Left(x),
  // When we fold out the left side will be executed
  fold: (f, g) => f(x),
  inspect: `Left(${x})`,
});

const halfEven = (x) =>
  x % 2 == 0 ? M.Either.Right(x / 2) : M.Either.Left("Recieve an odd number");

// M.Either.of(20)
//   .chain(halfEven)
//   .chain(halfEven)
//   //.chain(halfEven)
//   .map(x => x * 10)
//   .fold(x => x, x => x);

const willSucceed = () => "It worked";
const willThrow = () => {
  throw "It failed";
};

function stringToUppercaseReversed_() {
  try {
    const response = willSucceed();

    return response.toUpperCase().split("").reverse().join("");
  } catch (error) {
    return error;
  }
}

// stringToUppercaseReversed_();

const tryCatch = (f) => {
  try {
    return M.Either.Right(f());
  } catch (error) {
    return M.Either.Left(error);
  }
};

function stringToUppercaseReversed() {
  return tryCatch(fnWithError)
    .map((x) => x.toUpperCase())
    .map((x) => x.split(""))
    .map((x) => x.reverse());
}

// stringToUppercaseReversed().fold(x => x, x => x.join(''));

/*******************************************************************************
 * MONADS - TASK/FUTURE
 * 
 * - Async operations
 * - Composable
 * - Defered execution
 * - Built-in cancellation
 ******************************************************************************/

/*******************************************************************************
 * MONADS - FUTURE - FLUTURE->FUTURE
 ******************************************************************************/

// pure functions
const flutureDelay = (ms) => {
  return Future((rej, res) => {
    const timerId = setTimeout(() => res(ms), ms);

    return () => clearTimeout(timerId);
  });
};

const FaxiosGet = Future.encaseP(axios.get);
const fetchGoogle = FaxiosGet("https://www.google.co.uk/")
  .pipe(Future.map((x) => x.data));

// -----------------------------------------------------------------------------

// react component
const successFn = (x) => console.log(x);
const failureFn = (error) => console.error(error);
//const unsubscribe = Future.fork(failureFn)(successFn)(flutureDelay(1500));

// Returns cancel action
// unsubscribe();

// 
// async/await style
async function getGoogle() {
  const response = await Future.promise(fetchGoogle);
  
  console.log(response);
}

// getGoogle();


/*******************************************************************************
 * MONADS - TASK/FUTURE - FOLKTALE->TASK
 ******************************************************************************/

// pure functions
const taskDelay = (ms) => {
  return Task.task((resolver) => {
    const timerId = setTimeout(() => resolver.resolve(ms), ms);

    resolver.cleanup(() => {
        clearTimeout(timerId)
    });

    resolver.onCancelled(() => {
      /* does nothing */
    });
  });
};

const TaxiosGet = Task.fromPromised(axios.get);
const fetchBing = TaxiosGet("https://www.bing.com/").map((x) => x.data);

// -----------------------------------------------------------------------------

// react component

// Callback style
// waits 100ms
// Returns cancel action
// const unsubscribe = taskDelay(100).or(taskDelay(2000)).run().listen({
//     onCancelled: () => console.log("task was cancelled"),
//     onRejected: (reason) => console.log(`task was rejected because ${reason}`),
//     onResolved: (x) => console.log(x),
// });

// unsubscribe();

// async/await style
async function getBing() {
  const exec = fetchBing.run();
  const response = await exec.promise();
  
  // this will halt mapping
  exec.future().cancel();
  exec.future().map(x => console.log(x));
}

// getBing();

/*******************************************************************************
 * MONADS - TASK - FUNTASK
 ******************************************************************************/

const funTaskDelay = (ms) => FunTask.create((res) => {
  const id = setTimeout(() => res(ms), ms);

  return () => clearTimeout(id);
})

// const unsubscribe = funTaskDelay.run({
//   success(x) {
//     console.log(x)
//   }, 
//   failure(error) {
//     console.log(`task was rejected because ${error}`)
//   }
// })

// unsubscribe();

async function funTaskToPromise() {
  const response = await funTaskDelay(1000).toPromise();
  console.log(response);
}

// funTaskToPromise();