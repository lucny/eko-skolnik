// main.js
// Proměnné pro Matter.js engine
const Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  Events = Matter.Events;

let engine, world;
let boundaries = [];
let walls = [];
let projectile;
let modalOpen = false;
let modal;
let wallData; // Proměnná pro načtení JSON dat
let lightsData;
let switches = [];
let totalEnergyConsumption = 0; // Celková spotřeba energie
let lightsEnergyConsumption = 0; // Celková spotřeba energie
let gameStarted = false; // Příznak, zda hra začala
let gameEnded = false; // Příznak, zda hra skončila
let playerName = ""; // Jméno hráče
let startTime = 0; // Proměnná pro začátek hry
let endTime = 0; // Proměnná pro konec hry
let lastTime = 0; // Proměnná pro sledování času
let leaderboard = new Leaderboard("vysledky.json");
let logo;

function preload() {
  // Načtení dat ze souboru walls.json
  wallData = loadJSON("skola.json");
  // Načtení konfiguračního souboru pro vypínače a světla
  lightsData = loadJSON("lights.json");
  logo = loadImage('logo.png'); // Nahraď názvem souboru tvého loga
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  leaderboard.loadResults(() => {
    console.log("Výsledky načteny");
  });

  // Inicializace Matter.js engine a světa
  engine = Engine.create();
  world = engine.world;

  // Nastavení nulové gravitace
  engine.world.gravity.y = 0;

  // Přidání mantinelů kolem hrací plochy
  boundaries.push(
    Bodies.rectangle(width / 2, 0, width, 30, { isStatic: true })
  );
  boundaries.push(
    Bodies.rectangle(width / 2, height, width, 30, { isStatic: true })
  );
  boundaries.push(
    Bodies.rectangle(0, height / 2, 30, height, { isStatic: true })
  );
  boundaries.push(
    Bodies.rectangle(width, height / 2, 30, height, { isStatic: true })
  );
  World.add(world, boundaries);

  // Vytvoření hráčova projektilu jako instance třídy Projectile
  const options = {
    restitution: 0.8,
    friction: 0.5,
    density: 1,
  };
  projectile = new Projectile(200, 200, 10, "circle", options, "blue");

  // Načtení zdí z JSON souboru
  wallData.walls.forEach((wall) => {
    walls.push(
      new Wall(
        wall.color,
        wall.x + 50,
        wall.y + 50,
        wall.width,
        wall.height,
        wall.restitution
      )
    );
  });

  lightsData.switches.forEach((switchData) => {
    let lights = switchData.lights.map(
      (lightData) => new Light(lightData.x, lightData.y, lightData.energy)
    );
    let newSwitch = new Switch(
      switchData.x,
      switchData.y,
      switchData.width,
      switchData.height,
      switchData.status,
      lights,
      world
    );
    switches.push(newSwitch);
  });

  // Inicializace modálního okna
  modal = new bootstrap.Modal(document.getElementById("commandModal"));
  document
    .getElementById("submitCommand")
    .addEventListener("click", submitCommand);

  // Vymazání vstupů při zavření okna
  const modalElement = document.getElementById("commandModal");
  modalElement.addEventListener("hidden.bs.modal", () => {
    modalOpen = false;
    document.getElementById("commandInput").value = "";
    document.getElementById("errorMessage").innerText = "";
  });

  // Přidání klikacího eventu na tlačítko Start
  document.getElementById("startButton").addEventListener("click", startGame);

  // Přidání klikacího eventu na tlačítko Restart
  document
    .getElementById("saveButton")
    .addEventListener("click", saveGame);

  // Zobrazení úvodního modálního okna
  $("#startModal").modal("show");
}

// Spuštění hry
function startGame() {
  playerName = document.getElementById("playerName").value;
  if (playerName === "") {
    playerName = "Neznámý hráč"; // Výchozí hodnota, pokud není přezdívka zadána
  }

  $("#startModal").modal("hide"); // Skryje úvodní modální okno
  gameStarted = true;
  startTime = millis(); // Uloží počáteční čas
  lastTime = startTime; // Nastaví poslední čas na začátek hry
}

// Restartování hry
function saveGame() {
  leaderboard.saveResults(); // Uloží výsledky do JSON souboru
  $("#endModal").modal("hide"); // Skryje konečné modální okno
  //resetLightsAndSwitches(); // Funkce pro resetování světel a vypínačů
}

// Kontrola konce hry (všechna světla zhasnutá)
function checkEndGame() {
  let allLightsOff = switches.every((sw) =>
    sw.lights.every((light) => !light.isOn)
  );
  if (allLightsOff && !gameEnded) {
    endTime = millis();
    gameEnded = true;
    gameStarted = false;
    showEndPanel();
  }
}

// Zobrazení výsledků na konci hry
function showEndPanel() {

  const gameTime = (endTime - startTime) / 1000; // Délka hry v sekundách
  leaderboard.addResult(
    playerName,
    totalEnergyConsumption.toFixed(2),
    gameTime.toFixed(2)
  );
  let topThree = leaderboard.getTopThreePlayers();
  let playerRank = leaderboard.getCurrentPlayerRank(playerName);

  resultText = `<p class="bg-warning p-2">Hráč: <b>${playerName}</b><br>
    Spotřebovaná energie: <b>${totalEnergyConsumption.toFixed(2)} W</b><br>
    Čas hry: <b>${gameTime.toFixed(2)} sekund</b></p>`;
  resultText += `<hr><h4 class="text-primary">Žebříček</h4>`;

  topThree.forEach((player, index) => {
    resultText += `${index + 1}. ${player.playerName} - ${player.energy} W, ${
      player.time
    } s<br>`;
  });

  // Kontrola, zda je hráč v žebříčku
  if (playerRank !== null) {
    resultText += `<br><strong>Vaše pořadí:</strong> ${playerRank}. místo`;
  } else {
    resultText += `<br><strong>Vaše pořadí:</strong> Hráč není v žebříčku.`;
  }

  document.getElementById("resultText").innerHTML = resultText;

  $("#endModal").modal("show"); // Zobrazí závěrečné modální okno
}

function draw() {
  if (gameStarted && !gameEnded) {
    background(220);
    // Nastavení polohy pro vykreslení loga a textu
    const logoX = 500; // X souřadnice pro logo
    const logoY = 750; // Y souřadnice pro logo (v oblasti plátna od y > 900)
    const textX = logoX + 200; // X souřadnice pro text vedle loga

    // Vykreslení loga
    image(logo, logoX, logoY, 150, 150); // Logo o velikosti 150x150

    // Nastavení velikosti a vykreslení textu
    textSize(100); // Nastavení velikosti textu
    fill(0,0,100); // Barva textu (černá)
    text('EKO-ŠKOLNÍK', textX, logoY + 100); // Text vedle loga    

    // Aktualizace Matter.js engine
    Engine.update(engine);

    // Zobrazit zdi
    walls.forEach((wall) => wall.display());

    // Vykreslení mantinelů
    boundaries.forEach((boundary) => {
      rectMode(CENTER);
      fill(150);
      rect(
        boundary.position.x,
        boundary.position.y,
        boundary.bounds.max.x - boundary.bounds.min.x,
        boundary.bounds.max.y - boundary.bounds.min.y
      );
    });

    // Výpočet času uběhlého od posledního snímku
    let currentTime = millis();
    let timeElapsed = currentTime - lastTime;
    lastTime = currentTime;

    // Aktualizace celkové spotřeby energie na základě času
    lightsEnergyConsumption += switches.reduce((sum, sw) => {
      return (
        sum +
        sw.lights.reduce(
          (lightSum, light) =>
            lightSum + light.getEnergyConsumption(timeElapsed),
          0
        )
      );
    }, 0);

    checkEndGame(); // Kontrola, zda jsou všechna světla zhasnutá

    // Zobrazení vypínačů a světel
    switches.forEach((sw) => {
      sw.display();
      sw.lights.forEach((light) => light.display());
    });

    // Zobrazit hráčův projektil
    projectile.display();

    // Zobrazení celkové spotřeby energie (s desetinnými čísly)
    fill(0);
    textSize(20);
    text(
      `Spotřeba elektrické energie: ${lightsEnergyConsumption.toFixed(2)} W`,
      50,
      50
    );
    text(
      `Spotřeba energie školníka: ${projectile
        .getEnergyConsumption()
        .toFixed(2)} W`,
      50,
      90
    );
    fill(100, 0, 0);
    textSize(20);
    totalEnergyConsumption =
      lightsEnergyConsumption + projectile.getEnergyConsumption();
    text(`Celková energie: ${totalEnergyConsumption.toFixed(2)} W`, 1420, 50);
    text(`Čas trvání hry: ${((currentTime - startTime)/1000).toFixed(2)}`, 1420, 90);

    // Kontrola kolizí mezi projektily a vypínači
    checkCollisions();
  }
}

// Otevře modální okno
function openModal() {
  modal.show();
  modalOpen = true;
}

// Zavře modální okno
function closeModal() {
  modal.hide();
}

function submitCommand() {
  const command = document.getElementById("commandInput").value;
  const match = command.match(/^shoot\((\d+),\s*(\d+)\)$/);

  if (match) {
    const angle = parseInt(match[1]);
    const force = parseInt(match[2]);
    projectile.shootCommand(angle, force);
  } else {
    document.getElementById("errorMessage").innerText =
      "Neplatný formát! Použijte shoot(angle, force).";
  }
}

function mousePressed(event) {
  projectile.mousePressed(event);
}

function mouseReleased() {
  projectile.mouseReleased();
}

Projectile.prototype.limitVelocity = function (maxSpeed) {
  const velocity = this.body.velocity;
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  if (speed > maxSpeed) {
    const scale = maxSpeed / speed;
    Body.setVelocity(this.body, {
      x: velocity.x * scale,
      y: velocity.y * scale,
    });
  }
};

function checkCollisions() {
  switches.forEach((sw) => {
    const collision = Matter.SAT.collides(projectile.body, sw.body); // Kontrola kolize mezi školníkem a přepínačem

    if (collision.collided) {
      sw.toggle(); // Přepínač se přepne pouze při skutečné kolizi
    }
  });
}
