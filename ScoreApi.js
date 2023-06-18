async function reportScore(player) {
  const body = JSON.stringify({
    "points": player.points,
    "mean": player.mean()
  })
  await fetch("https://ghostrabbit.builtwithdark.com/test-set-score", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: body
  });
  console.log("Score published", body);
}

async function printScores() {
  const response = await fetch('https://ghostrabbit.builtwithdark.com/test-set-score-get-all');
  const content = await response.json();
  console.log(content);
  // do something with content
}