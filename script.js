const domain = window.location.protocol + "//" + window.location.host;
const URL = domain + "/models/";

let totalScores = [];
let totalPredictions = 0;
let recognizer; // Declare recognizer in the global scope
let classLabels; // Declare classLabels in the global scope

async function stopRecognition() {
  recognizer.stopListening();
  // Calculate the average score
  const averageScores = totalScores.map((scores) => scores.map((score, index) => (totalScores.reduce((acc, curr) => acc + curr[index], 0) / totalPredictions).toFixed(2)));

  const labelContainer = document.getElementById("label-container");
  for (let i = 0; i < classLabels.length; i++) {
    labelContainer.childNodes[i].innerHTML = classLabels[i] + ": " + averageScores[averageScores.length - 1][i];
  }
}

async function init() {
  const labelContainer = document.getElementById("label-container");
  while (labelContainer.firstChild) {
    labelContainer.removeChild(labelContainer.firstChild);
  }

  recognizer = await createModel(); // Assign the global recognizer
  classLabels = recognizer.wordLabels(); // Assign classLabels globally

  for (let i = 0; i < classLabels.length; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }

  document.getElementById("stopButton").disabled = false; // Enable the stop button

  recognizer.listen(
    (result) => {
      const scores = result.scores;

      totalScores.push(scores);
      totalPredictions++;

      for (let i = 0; i < classLabels.length; i++) {
        const classPrediction = classLabels[i] + ": " + scores[i].toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
      }
    },
    {
      includeSpectrogram: true,
      probabilityThreshold: 0.75,
      invokeCallbackOnNoiseAndUnknown: true,
      overlapFactor: 0.5,
    }
  );
}

async function createModel() {
  const checkpointURL = URL + "model.json"; // model topology
  const metadataURL = URL + "metadata.json"; // model metadata

  const recognizer = speechCommands.create("BROWSER_FFT", undefined, checkpointURL, metadataURL);

  await recognizer.ensureModelLoaded();

  return recognizer;
}
