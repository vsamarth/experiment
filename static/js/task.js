let psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

let pages = [
  "instructions/instruct-ready.html",
  "stage.html",
  "postquestionnaire.html",
];

// In javascript, defining a function as `async` makes it return  a `Promise`
// that will "resolve" when the function completes. Below, `init` is assigned to be the
// *returned value* of immediately executing an anonymous async function.
// This is done by wrapping the async function in parentheses, and following the
// parentheses-wrapped function with `()`.
// Therefore, the code within the arrow function (the code within the curly brackets) immediately
// begins to execute when `init is defined. In the example, the `init` function only
// calls `psiTurk.preloadPages()` -- which, as of psiTurk 3, itself returns a Promise.
//
// The anonymous function is defined using javascript "arrow function" syntax.
const init = (async () => {
  await psiTurk.preloadPages(pages);
})();

var instructionPages = [
  // add as a list as many pages as you like
  "instructions/instruct-ready.html",
];

const chairImages = [1, 2, 3, 4, 5].map(
  (i) => `/static/images/chair/img0${i}.png`
);
const tableImages = [1, 2, 3, 4, 5].map(
  (i) => `/static/images/table/img0${i}.png`
);

var StroopExperiment = function () {
  psiTurk.showPage("stage.html");
  const jsPsych = initJsPsych({
    display_element: document.getElementById("root"),
    on_finish: function (data) {
      const correct = jsPsych.data.get().filter({ correct: true }).count();
      psiTurk.recordUnstructuredData("correct", correct);
      // psiTurk.showPage("postquestionnaire.html");
      // psiTurk.recordTrialData({ phase: "postquestionnaire", status: "begin" });
      psiTurk.saveData({
        success: function() { psiTurk.completeHIT(); }
    });
    }
  });


  const preloadImages = {
    type: jsPsychPreload,
    auto_preload: true,
  };

  const tableImages = [1, 2, 3, 4, 5]
    .map((i) => `/static/images/table/img0${i}.jpg`)
    .map((x) => ({
      url: x,
      category: "table",
    }));

  const chairImages = [1, 2, 3, 4, 5]
    .map((i) => `/static/images/chair/img0${i}.jpg`)
    .map((x) => ({
      url: x,
      category: "chair",
    }));

  const images = jsPsych.randomization.shuffle([
    ...tableImages,
    ...chairImages,
  ]);

  const imagesTrial = images.map((image) => ({
    type: jsPsychCategorizeImage,
    stimulus: image.url,
    key_answer: image.category === "table" ? "t" : "c",
    text_answer: image.category === "table" ? "Table" : "Chair",
    choices: ["c", "t"],
    prompt: "<p>Press C for chair, T for table.</p>",
    timeout_message: "<p>Too slow!</p>",
  }));

  jsPsych.run([preloadImages, ...imagesTrial]);
};



// Task object to keep track of the current phase
var currentview;

/*******************
 * Run Task
 ******************/
// In this example `task.js file, an anonymous async function is bound to `window.on('load')`.
// The async function `await`s `init` before continuing with calling `psiturk.doInstructions()`.
// This means that in `init`, you can `await` other Promise-returning code to resolve,
// if you want it to resolve before your experiment calls `psiturk.doInstructions()`.

// The reason that `await psiTurk.preloadPages()` is not put directly into the
// function bound to `window.on('load')` is that this would mean that the pages
// would not begin to preload until the window had finished loading -- an unnecessary delay.
$(window).on("load", async () => {
  await init;
  psiTurk.doInstructions(
    instructionPages, // a list of pages you want to display in sequence
    function () {
      currentview = new StroopExperiment();
    } // what you want to do when you are done with instructions
  );
});
