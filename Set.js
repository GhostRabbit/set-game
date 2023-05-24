class Set {
  constructor(cards, borderColor, corrects) {
    this.cards = cards;
    this.borderColor = borderColor;
    this.corrects = corrects;
    this.correct = corrects.reduce((acc, next) => acc && next, true);
  }

  score() {
    if (this.correct) {
      player.score++;
      resetTimer();
    } else {
      player.score--;
    }
  }

  discard() {
    this.cards.forEach(c => discard.push(c));
  }

  draw(x, y) {
    this.x = x;
    this.y = y;
    this.cards.forEach((card, i) => {
      card.paint(x + (i + 0.5) * dimensions.w / 3, y + dimensions.h / 6, 1 / 3);
    });
    rectMode(CORNER);
    noFill();
    strokeWeight(dimensions.stroke / 2);
    stroke(this.borderColor);
    if (!this.correct) {
      fill(color("rgba(255,0,0,0.25)"));
    }
    rect(x, y, dimensions.w, dimensions.h / 3, dimensions.corner / 3);
  }

  covers(x, y) {
    return this.x < x && x < this.x + dimensions.w
      && this.y < y && y < this.y + dimensions.h / 3;
  }

  drawSplash() {
    this.cards.forEach((card, i) => {
      let x = (i + 0.5) * (dimensions.w + dimensions.ws);
      let y = dimensions.h;
      card.paint(x, y);

      y += dimensions.h;
      textAlign(CENTER, CENTER);
      textSize(dimensions.text);
      textStyle(BOLD);
      noStroke();
      fill(color("black"));
      text(card.letter, x, y);
      if (!this.corrects[0]) {
        noFill();
        stroke(color("red"));
        strokeWeight(dimensions.stroke);
        ellipse(x, y - dimensions.stroke, dimensions.w / 2, dimensions.h / 2);
      }

      y += dimensions.h;
      noStroke();
      fill(color("black"));
      text("I".repeat(card.count), x, y);
      if (!this.corrects[1]) {
        noFill();
        stroke(color("red"));
        strokeWeight(dimensions.stroke);
        ellipse(x, y - dimensions.stroke, dimensions.w / 2, dimensions.h / 2);
      }

      y += dimensions.h;
      stroke(color("black"));
      strokeWeight(dimensions.stroke);
      image(cardBackgrounds[card.fill][0], x, y);

      if (!this.corrects[2]) {
        noFill();
        stroke(color("red"));
        strokeWeight(dimensions.stroke);
        line(x - dimensions.w / 2, y - dimensions.h / 2, x + dimensions.w / 2, y + dimensions.h / 2);
        line(x + dimensions.w / 2, y - dimensions.h / 2, x - dimensions.w / 2, y + dimensions.h / 2);
      }

      y += dimensions.h;
      noStroke();
      fill(card.color);
      rectMode(CENTER);
      rect(x, y, dimensions.w / 2, dimensions.h / 2, dimensions.corner / 2);
      if (!this.corrects[3]) {
        noFill();
        stroke(color("red"));
        strokeWeight(dimensions.stroke);
        line(x - dimensions.w / 4, y - dimensions.h / 4, x + dimensions.w / 4, y + dimensions.h / 4);
        line(x + dimensions.w / 4, y - dimensions.h / 4, x - dimensions.w / 4, y + dimensions.h / 4);
      }

    });
  }
}
