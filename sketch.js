let deck = []
let board = []
let discard = []
let roundTime
let lastPick
let lastBoard
const cardBackgrounds = new Object
const weightOfStroke = 5
const animationSpeed = 5000

function setup() {
  createCanvas(500, 500)
  rectMode(CENTER)
  imageMode(CENTER)
  textAlign(CENTER, CENTER)
  init()
  clearBoard()
}

function init() {
  console.log("init")
  deck = []
  board = []

  const x = [color('rgb(204, 102, 0)'), color('rgb(0, 204, 102)'), color('rgb(102, 0, 204)')].forEach(c => {
    Object.keys(Fill).forEach(f => {
      const y = ['X', 'Y', 'Z'].forEach(l => {
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
  roundTime = 60
}

function draw() {
  clear()
  background(255)

  if (second() != lastPick) {
    if (board.length < 12) {
      board.push(deck.shift())
    }
    lastPick = second()
    if (roundTime-- == 0) {
      clearBoard()
    }
  }

  cardBackgrounds[Fill.Striped] = createStripedBackground()
  cardBackgrounds[Fill.Checker] = createCheckerBackground()
  cardBackgrounds[Fill.Wave] = createWaveBackground()
  drawBoard()
  drawCountdown()
}

function createStripedBackground() {
  const w = width * 2 / 7
  const h = height / 6
  const lineWidth = height / 50

  const cnv = createGraphics(w, h)
  const ctx = cnv.canvas.getContext('2d')

  cnv.rect(0, 0, w, h, height / 60)
  ctx.clip()

  ctx.rotate(PI / 4)
  cnv.strokeWeight(lineWidth)
  cnv.stroke(color('#AAA'))
  let y = -h * 2 + lerp(0, 2 * lineWidth, (millis() % animationSpeed) / animationSpeed)
  for (let i = 0; i < 20; i++) {
    cnv.line(-w, y, 2 * w, y)
    y += 2 * lineWidth
  }
  return cnv
}

function createWaveBackground() {
  const w = width * 2 / 7
  const h = height / 6
  const lineWidth = height / 50

  const cnv = createGraphics(w, h)
  const ctx = cnv.canvas.getContext('2d')

  cnv.rect(0, 0, w, h, height / 60)
  ctx.clip()

  let da = lerp(0, 2 * PI, (millis() % (2*animationSpeed)) / (2 * animationSpeed))
  cnv.strokeWeight(lineWidth)
  cnv.stroke(color('#AAA'))
  cnv.noFill()
  let y = -h * 2
  for (let i = 0; i < 20; i++) {
    cnv.beginShape()
    for (let x = -w; x < 2 * w; x += 5) {
      let a = lerp(0, 12 * PI, (x + w)) / (3 * w) - da
      cnv.vertex(x, y + lineWidth * sin(a))
    }
    cnv.endShape()
    y += 2 * lineWidth
  }
  return cnv
}

function createCheckerBackground() {
  const w = width * 2 / 7
  const h = height / 6
  const lineWidth = height / 50

  const cnv = createGraphics(w, h)
  const ctx = cnv.canvas.getContext('2d')

  cnv.rect(0, 0, w, h, height / 60)
  ctx.clip()

  ctx.rotate(PI / 4)
  cnv.strokeWeight(lineWidth)
  cnv.stroke(color('#AAA'))
  let y = -h * 2
  let dr = lineWidth / 2 * sin(lerp(0, 2 * PI, (millis() % animationSpeed) / animationSpeed))
  for (let i = 0; i < 20; i++) {
    for (let x = 0; x < w; x += 2 * lineWidth) {
      cnv.circle(x, y, dr + lineWidth / 3)
      dr *= -1
    }
    y += 2 * lineWidth
  }
  return cnv
}

function drawBoard() {
  let x = -width / 6
  let y
  board.forEach((c, i) => {
    if (i % 4 == 0) {
      y = height / 10
      x += width / 3
    }
    c.draw(x, y)
    y += height / 5
  })
}

function drawCountdown() {
  textStyle(NORMAL)
  textSize(height / 25)
  noFill()
  strokeWeight(1)
  stroke(color('black'))
  text(roundTime, 20, height - 20)
}

const Fill = {
  Wave: 'Wave',
  Striped: 'Striped',
  Checker: 'Checker'
}

class Card {
  constructor(letter, count, fill, color) {
    this.letter = letter
    this.count = count
    this.fill = fill
    this.color = color
  }

  draw(x, y) {
    image(cardBackgrounds[this.fill], x, y)
    stroke(this.color)
    strokeWeight(weightOfStroke)
    noFill()
    rect(x, y, 2 * width / 7, height / 6, height / 60)

    textSize(height / 9)
    textStyle(BOLD)
    stroke(color('black'))
    fill(this.color)
    strokeWeight(weightOfStroke)
    text(this.letter.repeat(this.count), x, y + 5)
  }
}