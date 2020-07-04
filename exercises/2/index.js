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

const Identity = (x) => ({
  map: (f) => Identity.of(f(x)),
  fold: (f) => f(x),
  inspect: `Identity(${JSON.stringify(x)})`,
});

Identity.of = Identity;

/*******************************************************************************
 * EXERCISES
 * -
 ******************************************************************************/

/*******************************************************************************
 * EXERCISE - ONE - THE BASE (FUNCTOR)
 ******************************************************************************/

/*******************************************************************************
 * EXERCISE - TWO - NULLABLES (MAYBE)
 ******************************************************************************/

/*******************************************************************************
 * EXERCISE - THREE - TRAIN TRACKS (EITHER)
 ******************************************************************************/

/*******************************************************************************
 * EXERCISE - FOUR - BRIGHT FUTURES (ASYNC)
 ******************************************************************************/
