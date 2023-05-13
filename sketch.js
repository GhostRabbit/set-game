let deck = []
let board = []
let discard = []
let lastPick
let lastBoard

function setup() {
  createCanvas(500, 500)
  rectMode(CENTER)
  textAlign(CENTER, CENTER)
  init()
  clearBoard()
}

function init() {
  console.log("init")
  deck = []
  board = []

  const x = [color('red'), color('green'), color('blue')].forEach(c => {
    Object.keys(Fill).forEach(f => {
      const y = ['A', 'B', 'C'].forEach(l => {
        for (let n = 1; n <= 3; n++) {
          deck.push(new Card(l, n, f, c))
        }
      })
    })
  })

  deck = shuffle(deck)
}

function clearBoard() {
  board.forEach(c => discard.push(c))
  board = []

  if (deck.length < 12) {
    discard = shuffle(discard)
    discard.forEach(c => deck.push(c))
    discard = []
  }

  lastBoard = minute()
  lastPick = second()
}

function draw() {
  clear()
  background(255)

  if (minute() != lastBoard) clearBoard()

  if (second() != lastPick) {
    if (board.length < 12) {
      board.push(deck.shift())
    }
    lastPick = second()
  }

  drawBoard()
  drawCountdown()
}

function drawBoard() {
  let x = -width / 6
  let y = height / 4
  board.forEach((c, i) => {
    if (i % 4 == 0) {
      y = height / 5
      x += width / 3
    }
    c.draw(x, y)
    y += height / 5
  })
}

function drawCountdown() {
  textStyle(NORMAL)
  textSize(height / 25)
  fill(color('#000'))
  text(60 - second(), 20, 20)

}

const Fill = {
  Empty: 'Empty',
  Striped: 'Striped',
  Bubbles: 'Bubbles'
}

class Card {
  constructor(letter, count, fill, color) {
    this.letter = letter
    this.count = count
    this.fill = fill
    this.color = color
  }

  draw(x, y) {
    textSize(height / 8)
    textStyle(BOLD)
    if (this.fill === Fill.Empty) {
      fill(color('#000'))
    } else if (this.fill === Fill.Bubbles) {
      fill(color('#888'))
    } else if (this.fill === Fill.Striped) {
      fill(color('#FFF'))
    }
    stroke(color('black'))
    rect(x, y, 2 * width / 7, height / 6, height / 60)

    fill(this.color)
    noStroke()
    text(this.letter.repeat(this.count), x, y + 5)
  }
}