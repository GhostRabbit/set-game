class ScoreArea {
  constructor() {
    this.noSetButton = new Set([random(deck).clone(), random(deck).clone(), random(deck).clone()], undefined, [1]);
    this.alphaRed = color(255, 0, 0, 255/3);
  }

  paint(x, y) {
    textStyle(NORMAL);
    textAlign(LEFT, BOTTOM);
    const hsize = height / 25;
    textSize(hsize);
    stroke(color('black'));
    strokeWeight(dimensions.stroke / 2);
    let strings = [
      [player.score() + " ", player.getColor()],
      ["p", color("white")],
    ];
    this.paintText(
      width - dimensions.ws / 2 - textWidth(player.score() + " p"),
      height - hsize - dimensions.hs / 2,
      strings
    );
    this.paintCountdown();
    this.paintScoreRate();
    this.paintNoSetButton();
  }

  paintText(x, y, text_array) {
    var pos_x = x;
    for (var i = 0; i < text_array.length; ++i) {
      var part = text_array[i];
      var t = part[0];
      var c = part[1];
      var w = textWidth(t);
      fill(c);
      text(t, pos_x, y);
      pos_x += w;
    }
  }

  paintCountdown() {
    textStyle(NORMAL);
    textAlign(LEFT, BOTTOM);
    textSize(height / 25);
    stroke(color("black"));
    fill(color("white"));
    strokeWeight(dimensions.stroke / 2);
    const string = roundTime + " s";
    text(
      string,
      width - dimensions.ws / 2 - textWidth(string),
      height - dimensions.hs / 2
    );
  }

  paintScoreRate() {
    if (player.totalPlayTime < 60) return;

    textStyle(NORMAL);
    textAlign(LEFT, BOTTOM);
    textSize(height / 25);
    stroke(color("black"));
    fill(player.getColor());
    strokeWeight(dimensions.stroke / 2);
    const string = player.mean();
    text(
      string,
      width - dimensions.ws / 2 - textWidth(string),
      height - dimensions.hs * 3
    );
  }

  paintNoSetButton() {
    noStroke();
    let x = dimensions.ws / 2 + 2 * (dimensions.ws + dimensions.w);
    let y = 4 * (dimensions.h + dimensions.hs);
    this.noSetButton.draw(x, y);
    strokeWeight(dimensions.stroke);
    stroke(this.alphaRed);
    line(x, y, x + dimensions.w, y + dimensions.h / 3);
    line(x, y + dimensions.h / 3, x + dimensions.w, y);
  }

  covers(x, y) {
    return width - dimensions.w - dimensions.ws < x && x < width
      && height - dimensions.h < y && y < height;
  }
}
