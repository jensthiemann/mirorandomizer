// ---------------------------------------------------------
// -- UI elements

const sliderAmount = document.getElementById("sliderAmount");
const textAmount = document.getElementById("textAmount");

const textD6 = document.getElementById("textD6");
textD6.addEventListener("click", rollD6, false);

const textD20 = document.getElementById("textD20");
textD20.addEventListener("click", rollD20, false);

const buttonRemoveDices = document.getElementById("buttonRemoveDices");
buttonRemoveDices.addEventListener("click", removeDices, false);

const buttonShuffleElements = document.getElementById("buttonShuffleElements");
buttonShuffleElements.addEventListener("click", shuffleElements, false);

const buttonPickRandom = document.getElementById("buttonPickRandom");
buttonPickRandom.addEventListener("click", pickRandomElement, false);

const sliderDiceWidth = document.getElementById("sliderDiceWidth");
const textDiceWidth = document.getElementById("textDiceWidth");

const selectboxColor = document.getElementById("selectboxColor");

// ---------------------------------------------------------
// -- Initialization

var diceElementIDs = [];
var diceWidth = 200;
var diceColor = "black";
init();

// ---------------------------------------------------------
// -- Event functions

async function shuffleElements() {
  var selection = await miro.board.getSelection();
  var firstElement = selection[0];
  for (var i = 0; i < 2 * selection.length; i++) {
    var r = randomBetween(0, selection.length - 1);
    await miro.board.bringToFront(selection[r]);
  }
  // await miro.board.bringToFront(firstElement)
}

async function pickRandomElement() {
  var selection = await miro.board.getSelection();
  var r = randomBetween(0, selection.length - 1);
  await miro.board.deselect();
  await miro.board.select({ id: selection[r].id });
  await miro.board.bringToFront(selection[r]);
}

async function removeDices() {
  for (var i = 0; i < diceElementIDs.length; i++) {
    var id = diceElementIDs[i].id;
    if (miro.board.getById(id) != null) {
      await miro.board.remove(diceElementIDs[i]).catch((error) => {
        // ignore any error
      });
    }
  }
  diceElementIDs = [];
}

async function rollD6() {
  rollDice(6);
}

async function rollD20() {
  rollDice(20);
}

async function rollDice(max) {
  const viewport = await miro.board.viewport.get();
  var posX = (viewport.x + viewport.width) / 2;
  var posY = (viewport.y + viewport.height) / 2;
  rollDiceAt(posX, posY, max);
}

async function rollDiceAt(posX, posY, max) {
  var result = "" + randomBetween(1, max);
  if (result == "6" || result == "9") {
    result = result + ".";
  }
  drawDice(posX, posY, result, max);
}

async function drawDice(posX, posY, diceText, max) {
  var diceImageUrl = "https://mirorandomizer.vercel.app/assets/w20-black-clean.10e88cb2.png"
  var diceTextcolor = "#ffffff"
  var stickyBgColor = "black"
  switch(diceColor) {
    case 'black': 
      diceImageUrl = "https://mirorandomizer.vercel.app/assets/w20-black-clean.10e88cb2.png"
      stickyBgColor = "black"
      break;
    case 'blue': 
      diceImageUrl = "https://mirorandomizer.vercel.app/assets/w20-blue-clean.34f2d8e0.png"
      stickyBgColor = "blue"
      break;
    case 'green': 
      diceImageUrl = "https://mirorandomizer.vercel.app/assets/w20-green-clean.15281b35.png"
      stickyBgColor = "dark_green"
      break;
    case 'orange': 
      diceImageUrl = "https://mirorandomizer.vercel.app/assets/w20-orange-clean.6fb6dedd.png"
      stickyBgColor = "orange"
      break;
    case 'purple': 
      diceImageUrl = "https://mirorandomizer.vercel.app/assets/w20-purple-clean.add96b4a.png"
      stickyBgColor = "violet"
      break;
    case 'red': 
      diceImageUrl = "https://mirorandomizer.vercel.app/assets/w20-red-clean.13a07752.png"
      stickyBgColor = "red"
      break;
    default:
      diceImageUrl = "https://mirorandomizer.vercel.app/assets/w20-black-clean.10e88cb2.png"
      stickyBgColor = "black"
  }
  /*
  <option value="cyan">cyan</option>
  <option value="gray">gray</option>
  <option value="yellow">yellow</option>
  */
  if (max == 20) {
    // D20: use image + text
    var rotationAngle = randomBetween(-70, 70);
    const image = await miro.board.createImage({
      url: diceImageUrl,
      x: posX,
      y: posY,
      width: 400, // Set either 'width', or 'height'
      rotation: rotationAngle,
    });
    diceElementIDs.push(image);
    const text = await miro.board.createText({
      content: "" + diceText,
      style: {
        color: diceTextcolor,
        fontSize: 80,
        textAlign: "center",
      },
      x: posX,
      y: posY,
      width: 350,
      // 'height' is calculated automatically, based on 'width'
      rotation: rotationAngle, // The text item is upside down on the board
    });
    diceElementIDs.push(text);
  } else {
    // not a D20: use sticky note
    const stickyNote = await miro.board.createStickyNote({
      x: posX,
      y: posY,
      width: diceWidth,
      style: {
        fillColor: stickyBgColor,
        textAlign: "center",
        textAlignVertical: "middle",
      },
      content: "" + diceText,
    });
    diceElementIDs.push(stickyNote);
  }
}

// ---------------------------------------------------------
// -- init

async function init() {
  // register drop event for dices
  await miro.board.ui.on("drop", async ({ x, y, target }) => {
    var max = 1;
    if (target.id.endsWith("D6")) {
      max = 6;
    }
    if (target.id.endsWith("D20")) {
      max = 20;
    }

    const sliderAmount = document.getElementById("sliderAmount");
    const amount = sliderAmount.value;

    for (var i = 0; i < amount; i++) {
      var posX = x + i * 500 + randomBetween(-20, 20) // i*diceWidth
      var posY = y + randomBetween(-100, 100);
      rollDiceAt(posX, posY, max);
    }
  });

  // init fields and register change events
  textAmount.innerHTML = sliderAmount.value + "dice";
  sliderAmount.oninput = function () {
    textAmount.innerHTML = this.value + " dice(s)";
    if (this.value == 1) {
      textAmount.innerHTML = this.value + " dice";
    } else {
      textAmount.innerHTML = this.value + " dices";
    }
  };
  textDiceWidth.innerHTML = sliderDiceWidth.value;
  sliderDiceWidth.oninput = function () {
    textDiceWidth.innerHTML = this.value;
    diceWidth = parseInt(this.value);
  };
  selectboxColor.oninput = function () {
    diceColor = this.value;
  };
}

// ---------------------------------------------------------
// -- Helper function

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// ---------------------------------------------------------
