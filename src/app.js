// ---------------------------------------------------------
// -- UI elements

const TextD6 = document.getElementById("TextD6");
TextD6.addEventListener("click", rollD6, false);

const TextD20 = document.getElementById("TextD20");
TextD20.addEventListener("click", rollD20, false);

const slider = document.getElementById("amountSlider");
const sliderText = document.getElementById("amountText");

const sliderDiceWidth = document.getElementById("sliderDiceWidth");
const textDiceWidth = document.getElementById("textDiceWidth");

const selectboxColor = document.getElementById("selectboxColor");

const buttonRemoveDices = document.getElementById("button_removeDices");
buttonRemoveDices.addEventListener("click", removeDices, false);

const buttonShuffleElements = document.getElementById("button_ShuffleElements");
buttonShuffleElements.addEventListener("click", shuffleElements, false);

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

async function removeDices() {  
    for (var i=0; i<diceElementIDs.length; i++){
      var id = diceElementIDs[i].id
      if(miro.board.getById(id)!=null) {
        await miro.board.remove(diceElementIDs[i]).catch((error) => { 
            // skip
          })
      }
    }
    diceElementIDs = []
}

async function rollDice(max) {
  const viewport = await miro.board.viewport.get()
  var posX = ( viewport.x + viewport.width ) / 2
  var posY = ( viewport.y + viewport.height ) / 2
  const stickyNote = await miro.board.createStickyNote({
    x:posX, y:posY,
    width: diceWidth,
    style: {
      fillColor: diceColor,
      textAlign: 'center',
      textAlignVertical: 'middle',
    },
    content: 'D'+max+' rolls ' +randomBetween(1,max) 
  });
  diceElementIDs.push(stickyNote)
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

    const amountSlider = document.getElementById("amountSlider")
    const amount = amountSlider.value 
    if( diceHelperSticky == true) {
      var infoSticky = await miro.board.createStickyNote({x, y, width: diceWidth,
            content: amount + " D" + max  });
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
            content: " "+randomBetween(1, max) });
        diceElementIDs.push(sticky)
    }
  });

  // init sliders and register change events
  sliderText.innerHTML = slider.value
  slider.oninput = function() {
      sliderText.innerHTML = this.value
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
    diceHelperSticky == this.value
  }

}

// ---------------------------------------------------------
// -- Helper function

function randomBetween(min,max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// ---------------------------------------------------------

