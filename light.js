// Light.js
// Třída pro světlo, které vyzařuje světlo a spotřebovává energii
class Light {
    constructor(x, y, energy) {
      this.x = x;
      this.y = y;
      this.energy = energy; // Spotřeba energie ve wattech
      this.isOn = false; // Výchozí stav světla je vypnuto
    }
  
    // Zapnutí světla
    turnOn() {
      this.isOn = true;
    }
  
    // Vypnutí světla
    turnOff() {
      this.isOn = false;
    }
  
    // Zobrazení světla a jeho vyzařování
    display() {
      if (this.isOn) {
        noStroke();
        for (let r = 10; r > 0; r--) {
          fill(255, 255, 0, this.energy * r / 10); // Intenzita světla je výrazně ztlumena
          ellipse(this.x, this.y, r * 10);
        }
      }
    }
  
    // Vrátí aktuální spotřebu energie (za sekundu)
    getEnergyConsumption(timeElapsed) {
      return this.isOn ? (this.energy * timeElapsed) / 3600000 : 0; // Spotřeba za sekundu
    }
  }
  