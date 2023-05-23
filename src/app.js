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
      diceImageUrl = "https://mirorandomizer.vercel.app/assets/w20-orange-clean.cce9bc98.png"
      diceTextcolor = "#000000"
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
    case 'yellow': 
      diceImageUrl = "https://mirorandomizer.vercel.app/assets/w20-yellow-clean.9d28999b.png"
      diceTextcolor = "#000000"
      stickyBgColor = "yellow"
      break;  
    case 'white': 
      diceImageUrl = "https://mirorandomizer.vercel.app/assets/w20-lightgray-clean.0dfdbe01.png"
      diceTextcolor = "#000000"
      stickyBgColor = "gray"
      break;
    default:
      diceImageUrl = "https://mirorandomizer.vercel.app/assets/w20-black-clean.10e88cb2.png"
      stickyBgColor = "black"
  }
  if (max == 20) {
    // D20: use image + text
    var rotationAngle = randomBetween(-70, 70);
    const image = await miro.board.createImage({
      url: diceImageUrl,
      x: posX,
      y: posY,
      width: diceWidth, // either 'width', or 'height'
      rotation: rotationAngle,
    });
    diceElementIDs.push(image);
    const text = await miro.board.createText({
      content: "" + diceText,
      style: {
        color: diceTextcolor,
        fontSize: diceWidth/5,
        textAlign: "center",
      },
      x: posX,
      y: posY,
      width: 350,
      // 'height' is calculated automatically, based on 'width'
      rotation: rotationAngle,
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
      var posX = x + i * 1.2 * diceWidth + randomBetween(-20, 20)
      var posY = y + randomBetween(-100, 100);
      rollDiceAt(posX, posY, max);
    }
  });

  // init fields and register change events
  textAmount.innerHTML = sliderAmount.value + "dice";
  sliderAmount.oninput = function () {
    textAmount.innerHTML = this.value + " dice(s)";
    if (this.value == 1) {
      textAmount.innerHTML = this.value + " dice ";
    } else {
      textAmount.innerHTML = this.value + " dices";
    }
  };

  textDiceWidth.innerHTML = sliderDiceWidth.value;

  sliderDiceWidth.oninput = function () {
    textDiceWidth.innerHTML = this.value;
    diceWidth = parseInt(this.value);
  };

  textD6.style.background = "#000000"
  textD6.style.border = "1px solid #000000"
  textD20.style.background = "#000000"
  textD20.style.border = "1px solid #000000"
  
  selectboxColor.oninput = function () {
    diceColor = this.value;
    var buttonColor = "#4361ff"
    var buttonTextColor = "#ffffff"
    switch(diceColor) {
      case 'black': 
        buttonColor = "#000000"
        break;
      case 'blue': 
        buttonColor = "#0700ff"
        break;
      case 'green': 
        buttonColor = "#1aa11a"
        break;
      case 'orange': 
        buttonColor = "#f89a47"
        buttonTextColor = "#000000"
        break;
      case 'purple': 
        buttonColor = "#7f26d0"
        break;
      case 'red': 
        buttonColor = "#ce0000"
        break;
      case 'yellow': 
        buttonColor = "#fff472"
        buttonTextColor = "#000000"
        break;  
      case 'white': 
        buttonColor = "#f4f5f6"
        buttonTextColor = "#000000"
        break;
      default:
        buttonColor = "#4361ff"
    }
    textD6.style.background = buttonColor
    textD6.style.border = "1px solid " + buttonColor
    textD6.style.color = buttonTextColor
    textD20.style.background = buttonColor
    textD20.style.border = "1px solid " + buttonColor
    textD20.style.color = buttonTextColor
  };
}

// ---------------------------------------------------------
// -- Helper function

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// ---------------------------------------------------------
