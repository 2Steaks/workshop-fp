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

[{ isFunctor: true }].map((x) => x);

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

const promiseMe = new Promise((res, rej) => res({ isLikeMonad: true }))
  .then(x)
  .then(y)
  .then(z);

function couldReturnSomething_(prop) {
  if (!prop) {
    return;
  }

  const foo = toFoo(prop);
  const bar = foo && toBar(foo);

  return bar && toBuzz(bar);
}

// const couldReturnSomething = prop => Maybe.of(prop)
//   .chain(toFoo)
//   .chain(toBar)
//   .chain(toBuzz);

/*******************************************************************************
 * MONADS - MAYBE
 * - Short circuiting
 * - Expects a Just (success) or a Nothing (failure)
 ******************************************************************************/

const Maybe = (x) => ({ x });
Maybe.of = (x) => Just(x);

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

const getNullOrUndefined = (x) => null;
const getValue = (x) => x;

// M.Maybe.of("hello")
//   .chain(safe(getNullOrUndefined))
//   .map(x => x + ' world')
//   .orSome('default value');

const isFunction = x => typeof x === 'function';
const isString = x => typeof x === 'string';

const safe = pred => R.ifElse(pred, M.Maybe.Just, M.Maybe.Nothing);
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

/*******************************************************************************
 * MONADS - EITHER
 * - Branching logic (think train tracks)
 * - Expects a Right (success) or a Left (failure)
 ******************************************************************************/

const Either = (x) => ({ x });
Either.of = (x) => Right(x);

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
  await exec.promise();
  
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