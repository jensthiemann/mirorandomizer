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
const checkboxShowHelperSticky = document.getElementById("checkboxShowHelperSticky");

// ---------------------------------------------------------
// -- Initialization

var diceElementIDs = [];
var diceWidth = 200;
var diceColor = "black";
var diceHelperSticky = false;
init();

// ---------------------------------------------------------
// -- Event functions

async function shuffleElements() {  
    var selection = await miro.board.getSelection()
    var firstElement = selection[0]
    for (var i=0; i<2*selection.length; i++){
        var r = randomBetween(0,selection.length-1)
        await miro.board.bringToFront(selection[r])
    }
    // await miro.board.bringToFront(firstElement)
}

async function pickRandomElement() {  
  var selection = await miro.board.getSelection()
  var r = randomBetween(0,selection.length-1)
  await miro.board.deselect()
  await miro.board.select({id: selection[r].id})
  await miro.board.bringToFront(selection[r])
}

async function removeDices() {  
    for (var i=0; i<diceElementIDs.length; i++){
      var id = diceElementIDs[i].id
      if(miro.board.getById(id)!=null) {
        await miro.board.remove(diceElementIDs[i]).catch((error) => { 
            // ignore any error
          })
      }
    }
    diceElementIDs = []
}

async function rollDice(max) {
  const viewport = await miro.board.viewport.get()
  var posX = ( viewport.x + viewport.width ) / 2
  var posY = ( viewport.y + viewport.height ) / 2
  var rotationAngle = randomBetween(-10,10)
  const stickyNote = await miro.board.createText({
    content: '<p style="color:#808080"><br/>&nbsp;D'+max+'&nbsp;</p>' +randomBetween(1,max)+'<br/><br/>',
    style: {
      color: '#ffffff',
      fillColor: '#000000',
      fontSize: 80,
      textAlign: 'center',
    },
    x:posX, y:posY,
    width: 350,
    // 'height' is calculated automatically, based on 'width'
    rotation: rotationAngle, // The text item is upside down on the board
  });
  diceElementIDs.push(stickyNote)
console.log("image ...")
  const image = await miro.board.createImage({
    title: 'This is an image',
    url: 'http://localhost:3000/src/assets/w20-black-transparent.png',
    x:0, y:0,
    width: 300, // Set either 'width', or 'height'
    rotation: 0.0,
  });
}

async function rollD6() {
  rollDice(6)
}

async function rollD20() {
  rollDice(20)
}

// ---------------------------------------------------------
// -- init

async function init() {

  // register drop event for dices 
  await miro.board.ui.on('drop', async ({x, y, target}) => {    
    
    var max = 1
    if (target.id.endsWith("D6")) { max = 6 }
    if (target.id.endsWith("D20")) { max = 20 }

    const sliderAmount = document.getElementById("sliderAmount")
    const amount = sliderAmount.value 
    if( diceHelperSticky == true) {
      var infoSticky = await miro.board.createStickyNote({x, y, width: diceWidth,
            content: " D" + max  });
      diceElementIDs.push(infoSticky)
    }

    for(var i=1; i<=amount; i++) {
        var posX = x + i*diceWidth
        var sticky = await miro.board.createStickyNote({x:posX, y, width: diceWidth, 
              style: {
                fillColor: diceColor,
                textAlign: 'center',
                textAlignVertical: 'middle',
              },
              content: " "+randomBetween(1, max)
            });
        diceElementIDs.push(sticky)
    }
  });

  // init fields and register change events
  textAmount.innerHTML = sliderAmount.value + "dice"
  sliderAmount.oninput = function() {
      textAmount.innerHTML = this.value + " dice(s)"
      if( this.value == 1 ) {
        textAmount.innerHTML = this.value + " dice"
      } else {
        textAmount.innerHTML = this.value + " dices"
      }
  }
  textDiceWidth.innerHTML = sliderDiceWidth.value
  sliderDiceWidth.oninput = function() {
    textDiceWidth.innerHTML = this.value
    diceWidth =  parseInt(this.value)
  }
  selectboxColor.oninput = function() {
    diceColor = this.value
  }
  checkboxShowHelperSticky.oninput = function() {
    diceHelperSticky = this.checked
  }  
  
}

// ---------------------------------------------------------
// -- Helper function

function randomBetween(min,max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// ---------------------------------------------------------

