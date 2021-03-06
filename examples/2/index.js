import axios from "axios";
// https://monet.github.io/monet.js/
// https://evojam.com/technology-blog/2016/02/22/practical-intro-to-monads-in-javascript
import M from "monet";
// https://github.com/fluture-js/Fluture
// https://dev.to/avaq/fluture-a-functional-alternative-to-promises-21b
import Future from "fluture";
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

const isFunction = x => typeof x === 'function';
const isNumber = x => typeof x === 'number';
const isString = x => typeof x === 'string';

/*******************************************************************************
 * TODAY
 ******************************************************************************/
// - Diving deeper into FP 🏊‍
// - We're going to be using Functors 🕺
// - We're going to be using Monads 🧙‍
// - Controlling application flow 🛤
// - Handling errors 💣
// - Containing side-effects 📦
// - Running through some exerices 🏋️‍


/*******************************************************************************
 * SOME FP LINGO
 ******************************************************************************/

// Some basic translations for some common FP terms

// - A SemiGroup is an object that has a concat function that combines it with another object of the same type. :: Sum(3).concat(Sum(3)) = Sum(6)
// - A Monoid is a SemiGroup that also has an assigned empty value (which is called it's identity) :: Sum.empty() === Sum(0)
// - A Functor can map any data type :: Functor(x).map(fn)
// - A Monad is "a monoid in the category of endofunctors" (this has become a running joke in the FP world because to everyone else it doesn't make any sense)
//   - it's a Functor that can also chain (unwrap outer context for another incoming Monad) :: Monad(x).chain(Monad) === behaviour

// This might help: https://github.com/hemanth/functional-programming-jargon

// There's more, but this was just to illustrate the meaning behind these interfaces.
// Today however, will be focusing only on Functors and Monads.

// You should know that the examples you're about to see arn't just pretty APIs,
// they are founded in mathematics and won't change between implementations, 
// a Functor will always .map and a Monad will always .chain

/*******************************************************************************
 * FUNCTORS
 * - They have laws
 *  - Functors must preserve identity morphisms (return a context of the same type)
 *  - Functors preserve composition of morphisms (they can map)
 * - They provide a level of inversion
 * - They are dot chainable
 * - They give you abstraction of function application (we dont call the funtions we're getting BOX to call it for us) this becomes more important later
 * - Building block to other implementations
 ******************************************************************************/

// What the Functor?
// A functor data type is something you can map over. It’s a container which has 
// an interface which can be used to apply a function to the values inside it. 
// When you see a functor, you should think “mappable”.

// The Array can be considered a Functor because of it's map function
// In this case, Array is the context, and x is the value we're mapping over.
const x = 20;             // Some data of type `a`
const f = n => n * 2;     // A function from `a` to `b`
const arr = Array.of(x);  // The type lift.
// JS has type lift sugar for arrays: [x]
// .map() applies the function f to the value x
// in the context of the array.
const result = arr.map(f); // [40]


// A box otherwise known as Identity
const Box = (x) => ({
  // Executes function with inner value then returns the result inside the same 
  // type of context ready for the next action
  map: (f) => Box.of(f(x)),
  // Unwrap context to raw value
  fold: (f) => f(x),
  inspect: `Box(${JSON.stringify(x)})`,
});

Box.of = Box;

// const uppercaseReverse = (text) =>
//   Box.of(text)
//     .map((x) => x.toUpperCase())
//     .map((x) => x.split(""))
//     .map((x) => x.reverse());

// uppercaseReverse("hello world");

// So what do we get?
// - Unified call syntax
// - Minimised state
// - Captured assignment
// - Forced control flow
// - Composition
// - Easier debugging experience (see trace)

// Abstraction of function application?
// We are starting to see why this is powerful
const Nullable = (x) => ({
  // now we can easily handle null/undefined values and stop executing functions
  map: (f) => typeof x === 'undefined' || x === null
    ? Nullable.of(null)
    : Nullable.of(f(x)),
  fold: (f) => f(x),
  inspect: `Nullable(${JSON.stringify(x)})`,
});

Nullable.of = Nullable;

// Nullable.of('hello')
//   .map((x) => x.toUpperCase())
//   .map((x) => null)
//   .map((x) => x.reverse());

/*******************************************************************************
 * MONADS
 * - They are data structures to handle application flow
 * - They protect against runtime errors.
 * - They can be used to handle side effects
 ******************************************************************************/

// A monad is a way of composing functions that require context in addition to 
// the return value, such as computation, branching, or I/O.

// The point of functors and monads is to abstract that context away so we don’t 
// have to worry about it while we’re composing things.

// The closest thing we have to a Monad is a Promise but due to not following 
// some specific rules cannot be considered a Monad
const whereMyData = x => Promise.resolve(x);
// Notice our value is still stuck inside the context of the Promise
// whereMyData(20) // Promise(20)

// To get at the data/error we need to add then/catch
const promiseMe = x => new Promise((res, rej) => res(x))
  // It can map
  .then((x) => x + 1)
  // It automatically knows how to handle another Promise and 
  .then((y) => new Promise((res, rej) => res(y * 2))) // flattens the promise to 4
  .then((z) => new Promise((res, rej) => res(z * 2))) // flattens the promise to 8
  .then(console.log) 
  .catch((error) => error);

// promiseMe(1); // 8


// Fun fact: When the promise specification was worked out, some people argued that 
// promises should be proper monads (https://github.com/promises-aplus/promises-spec/issues/94),
// but they were shut down and told they were living in a fantasy land.

// The FP spec for JS can be found here: https://github.com/fantasyland/fantasy-land 🚨 DRY READ ALERT 🚨
// All libraries based on FP will attempt to abide (some may deviate slightly) by the rules in this repo.
// See https://github.com/ramda/ramda/blob/v0.27.0/source/map.js line: 12


// Here is a basic example of how we might handle application flow
// Variables and conditions thrown loosely around like a teenagers bedroom.
function couldReturnSomething_(prop) {
  if (!prop) {
    return;
  }

  const foo = toFoo(prop);
  const bar = foo && toBar(foo);

  return bar && toBuzz(bar);
}

// Here is how a Maybe might handle the same situation.
// Composition with minimal state
const couldReturnSomething = prop => Maybe.of(prop)
  .chain(toFoo) // returns a Maybe (Just/Nothing)
  .chain(toBar) // returns a Maybe (Just/Nothing)
  .chain(toBuzz) // returns a Maybe (Just/Nothing)
  .fold(); // The composition can continue or we can fold out to the raw value


/*******************************************************************************
 * MONADS - MAYBE
 * - Handles input validation
 * - Can short circuit the function chain
 * - It expects a Just (success) or a Nothing (failure)
 ******************************************************************************/

// A Maybe represents disjunction by using two constructors, Nothing or Just. 
// A Just instance represents the truth case while Nothing is considered false. 
// All Maybe returning methods on an instance will be applied to a Just 
// returning the result. If an instance is a Nothing, then all application is 
// skipped and another Nothing is returned.

const Just = (x) => ({
  map: (f) => Just(f(x)),
  chain: (m) => f(x),
  fold: (f) => f(x),
  inspect: `Just(${x})`,
});

const Nothing = (x) => ({
  // Will Keep returning a Nothing
  map: (f) => Nothing(),
  chain: (m) => Nothing(),
  // When we fold out we simply return undefined
  fold: (f) => f(),
  inspect: `Nothing(${x})`,
});

// You could have a null check like we did before with the Nullable functor
const hasValue = fn => x => typeof fn(x) !== 'undefined' && fn(x) !== null
  ? M.Maybe.Just(x) 
  : M.Maybe.Nothing();

// Or better yet, you could be more explicit with custom validations
const safe = pred => x => pred(x) 
  ? M.Maybe.Just(x) 
  : M.Maybe.Nothing();

// You could even validate a function return value
const safeAfter = (pred, fn) => pipe(fn, safe(pred));

// M.Maybe.of("hello")
//   .chain(safe(isString))
//   .chain(safeAfter(isString, x => x + ' world'))
//   .orSome('default value');

/*******************************************************************************
 * MONADS - EITHER
 * - Branching logic (think train tracks)
 * - Expects a Right (success) or a Left (failure)
 ******************************************************************************/

// Unlike Maybe, which fixes its "left side", or Nothing, Either 
// is a functor in both it's Left and Right sides. This allows for the ability 
// to vary the type on either side and is akin to the imperative if...else trees 
// that are common in programming.

const Left = (x) => ({
  // Notice the function is no longer executed
  map: (f) => Left(x),
  chain: (f) => Left(x),
  // When we fold out the left side will be executed
  fold: (f, g) => f(x),
  inspect: `Left(${x})`,
});

const Right = (x) => ({
  map: (f) => Right(f(x)),
  chain: (f) => f(x),
  // When we fold out the right side will be executed
  fold: (f, g) => g(x),
  inspect: `Right(${x})`,
});

// This function checks to see if the value is an even number, if it is then it
// divides it by 2 and returns a Right. If it's an odd number it returns a Left
// with a reason.
const halfEven = (x) =>
  x % 2 == 0 ? M.Either.Right(x / 2) : M.Either.Left("Recieved an odd number");

// M.Either.of(20)
//   .chain(halfEven)
//   .chain(halfEven)
//   //.chain(halfEven)
//   .map(x => x + 1)
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
  return tryCatch(() => willSucceed())
    .map((x) => x.toUpperCase())
    .map((x) => x.split(""))
    .map((x) => x.reverse());
}

// stringToUppercaseReversed().fold(x => x, x => x.join(''));


/*******************************************************************************
 * MONADS - TASK/FUTURE/ASYNC
 * - Composable asynchronous operations
 * - Deferred execution
 * - Built-in cancellation
 ******************************************************************************/

// Task represents either the success or failure of a given asynchronous 
// operation. The "laziness" of Task allows the ability to build complex 
// asynchronous operations by defining each portion of that flow as 
// smaller "steps" that can be composed together.

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

const Faxios = {
  get: Future.encaseP(axios.get),
  post: Future.encaseP(axios.post)
}
const fetchGoogle = Faxios.get("https://www.google.co.uk/")
  .pipe(Future.map((x) => x.data));


// -----------------------------------------------------------------------------

// react component
const successFn = (x) => console.log(x);
const failureFn = (error) => console.error(error);
//const unsubscribeF = Future.fork(failureFn)(successFn)(flutureDelay(1500));

// Returns cancel action
// unsubscribeF();

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

const Taxios = {
  get: Task.fromPromised(axios.get),
  post: Task.fromPromised(axios.post)
}

const fetchBing = Taxios.get("https://www.bing.com/").map((x) => x.data);

// -----------------------------------------------------------------------------

// react component

// Callback style
// waits 100ms
// Returns cancel action
// const exec = taskDelay(100).or(taskDelay(2000)).run().listen({
//     onCancelled: () => console.log("task was cancelled"),
//     onRejected: (reason) => console.log(`task was rejected because ${reason}`),
//     onResolved: (x) => console.log(x),
// });

// exec.cancel();

// async/await style
async function getBing() {
  const response = await fetchBing.run().promise();
  console.log(response);
}

// getBing();

/*******************************************************************************
 * FINAL NOTES
 ******************************************************************************/

// This was all just to see how Functors and Monads work, but you can also use 
// them inline with libraries like Ramda, to see this in action I would recommend
// taking a look at the crocks library documentation: https://crocks.dev/docs/getting-started.html

// See: https://crocks.dev/docs/crocks/Arrow.html and search for option to see 
// how a Maybe is being used with the option helper.

// If you feel like you're still a little hazy about Monads I would suggest finding
// learning material by Kyle Simpson: https://github.com/getify/Functional-Light-JS/blob/master/manuscript/apB.md/#appendix-b-the-humble-monad