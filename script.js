// ---------------- Clases de dominio ----------------
class Pregunta {
    constructor(enunciado, opciones, respuestaCorrecta) {
      this.enunciado = enunciado;
      this.opciones = opciones;
      this.respuestaCorrecta = respuestaCorrecta;
    }
    esCorrecta(r) {
      return this.respuestaCorrecta === r;
    }
  }
  
  class Respuesta {
    constructor(pregunta, seleccion) {
      this.pregunta = pregunta.enunciado;
      this.opciones = pregunta.opciones;
      this.seleccion = seleccion;
      this.correcta = pregunta.respuestaCorrecta;
    }
  }
  
  class Resumen {
    constructor(nombre, puntaje, fecha) {
      this.nombre = nombre;
      this.puntaje = puntaje;
      this.fecha = fecha;
    }
  }
  
  class Partida {
    constructor(nombre, preguntas) {
      this.nombre = nombre;
      this.preguntas = preguntas;
      this.respuestas = [];
      this.puntaje = 0;
      this.fecha = new Date().toLocaleDateString();
      this.index = 0;
    }
    responder(p, r) {
      const esCorrecta = r && p.esCorrecta(r);
      if (esCorrecta) this.puntaje++;
      this.respuestas.push(new Respuesta(p, r));
    }
    obtenerResumen() {
      return new Resumen(this.nombre, this.puntaje, this.fecha);
    }
    obtenerResultadosDetalle() {
      return this.respuestas;
    }
  }
  
  class Ranking {
    constructor(topico) {
      this.claveStorage = `ranking-${topico}`;
      this.partidas = JSON.parse(localStorage.getItem(this.claveStorage)) || [];
    }
    agregar(resumen) {
      this.partidas.push(resumen);
      this.partidas.sort((a, b) => b.puntaje - a.puntaje);
      this.partidas = this.partidas.slice(0, 5);
      localStorage.setItem(this.claveStorage, JSON.stringify(this.partidas));
    }
    obtenerTop() {
      return this.partidas;
    }
  }
  
  // ---------------- Clase Quiz con temporizador ----------------
  class Quiz {
    constructor(topico, nombre) {
      this.topico = topico;
      this.nombre = nombre;
      this.preguntasDisponibles = Quiz.bancoPreguntas[topico];
      this.preguntasPartida = this.seleccionarPreguntas();
      this.partida = new Partida(nombre, this.preguntasPartida);
      this.ranking = new Ranking(topico);
      this.tiempoRestante = 10; // 5 min
      this.timerId = null;
    }
    seleccionarPreguntas() {
      return [...this.preguntasDisponibles]
        .sort(() => 0.5 - Math.random())
        .slice(0, 10);
    }
    iniciarTemporizador() {
      actualizarTemporizadorUI(this.tiempoRestante);
      this.timerId = setInterval(() => {
        this.tiempoRestante--;
        actualizarTemporizadorUI(this.tiempoRestante);
        if (this.tiempoRestante <= 0) {
          this.finalizar();
        }
      }, 1000);
    }
    detenerTemporizador() {
      if (this.timerId !== null) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
    }
    responderPregunta(r) {
      const pregunta = this.partida.preguntas[this.partida.index];
      this.partida.responder(pregunta, r);
    }
    finalizar() {
      this.detenerTemporizador();
      const resumen = this.partida.obtenerResumen();
      this.ranking.agregar(resumen);
      mostrarResultados();
    }
    obtenerRanking() {
      return this.ranking.obtenerTop();
    }
  }
  
  // -------------- Banco de preguntas dummy --------------
  Quiz.bancoPreguntas = {
    vidaMarina: [
      new Pregunta("¿Los corales son...?", ["Plantas", "Rocas", "Animales", "Hongos"], "Animales"),
      new Pregunta("¿De qué familia son las orcas?", ["Tiburones", "Delfines", "Ballenas", "Focas"], "Delfines"),
      new Pregunta("¿Cuál de estos animales es un equinodermo?", ["Estrella de mar", "Medusa", "Pulpo", "Langosta"], "Estrella de mar"),
      new Pregunta("¿Cuál es el pez más rápido del océano?", ["Atún rojo", "Pez vela", "Tiburón mako", "Marlín azul"], "Pez vela"),
      new Pregunta("¿Cuál es el punto más profundo del océano?", ["Fosa de Java", "Fosa de Puerto Rico", "Fosa de las Marianas", "Dorsal Mesoatlántica"], "Fosa de las Marianas"),
      new Pregunta("¿Cuál es el pez más grande del mundo?", ["Tiburón blanco", "Ballena azul", "Tiburón ballena", "Orca"], "Tiburón ballena"),
      new Pregunta("¿Qué pez puede vivir tanto en agua dulce como salada?", ["Tiburón toro", "Pez payaso", "Pez globo", "Anguila eléctrica"], "Tiburón toro"),
      new Pregunta("¿Cuál de estos animales usa tinta como defensa?", ["Pulpo", "Medusa", "Estrella de mar", "Caballito de mar"], "Pulpo"),
      new Pregunta("¿Qué animal marino tiene el cerebro más grande en proporción a su cuerpo?", ["Delfín", "Ballena jorobada", "Tiburón martillo", "Raya"], "Delfín"),
      new Pregunta("¿Cuál de estos animales puede regenerar partes de su cuerpo?", ["Medusa", "Ca", "Estrella de mar", "Pez león"], "Estrella de mar"),
      new Pregunta("¿Qué tipo de simetría tienen los equinodermos adultos?", ["Bilateral", "Radial", "Asimétrica", "Esférica"], "Radial"),
      new Pregunta("¿Cuál de los siguientes animales puede usar herramientas?", ["Tiburón blanco", "Delfín nariz de botella", "Raya", "Atún"], "Delfín nariz de botella"),
      new Pregunta("¿Cuál de estos animales es un crustáceo?", ["Cangrejo", "Estrella de mar", "Pulpo", "Coral"], "Cangrejo"),
      new Pregunta("¿Qué estructura usan los peces para detectar movimientos en el agua?", ["Escamas", "Línea lateral", "Aletas", "Branquias"], "Línea lateral"),
      new Pregunta("¿Cuál de estos animales forma simbiosis con las anémonas?", ["Pez payaso", "Tiburón", "Raya", "Atún"], "Pez payaso")
    ]
  };
  
  
  // ---------------------- Interfaz ----------------------
  
  const pantallaInicio     = document.getElementById("pantallaInicio");
  const pantallaQuiz       = document.getElementById("pantallaQuiz");
  const pantallaResultados = document.getElementById("pantallaResultados");
  const pantallaRanking    = document.getElementById("pantallaRanking");
  
  const btnIniciar       = document.getElementById("btnIniciar");
  const btnSiguiente     = document.getElementById("btnSiguiente");
  const btnVerRanking    = document.getElementById("btnVerRanking");
  const btnVolverInicio1 = document.getElementById("btnVolverInicio");
  const btnVolverInicio2 = document.getElementById("btnVolverInicioDesdeRanking");
  
  const contPregunta = document.getElementById("preguntaActual");
  const contResultados = document.getElementById("detalleResultados");
  const ulRanking  = document.getElementById("ranking");
  const temporizadorUI = document.getElementById("temporizador");
  
  let quiz = null;
  
  // -- Eventos --
  btnIniciar.addEventListener("click", iniciar);
  btnSiguiente.addEventListener("click", siguiente);
  btnVerRanking.addEventListener("click", () => { mostrarRanking(); });
  btnVolverInicio1.addEventListener("click", volverAlMenu);
  btnVolverInicio2.addEventListener("click", volverAlMenu);
  
  // -- Funciones UI básicas --
  function actualizarTemporizadorUI(seg) {
    const min = Math.floor(seg / 60).toString().padStart(2, "0");
    const s = (seg % 60).toString().padStart(2, "0");
    temporizadorUI.textContent = `${min}:${s}`;
  }
  
  function iniciar() {
    const nombre = document.getElementById("nombre").value.trim();
    if (!nombre) {
      alert("Ingresa un nombre válido");
      return;
    }
    quiz = new Quiz("vidaMarina", nombre);
    pantallaInicio.style.display = "none";
    pantallaResultados.style.display = "none";
    pantallaRanking.style.display = "none";
  
    pantallaQuiz.style.display = "block";
    quiz.iniciarTemporizador();
    mostrarPregunta();
  }
  
  function mostrarPregunta() {
    const idx = quiz.partida.index;
    const pregunta = quiz.partida.preguntas[idx];
  
    let html = `<h3>${pregunta.enunciado}</h3>`;
    pregunta.opciones.forEach(op => {
      html += `
        <label class="opcion">
          <input type="radio" name="respuesta" value="${op}">
          ${op}
        </label>`;
    });
    contPregunta.innerHTML = html;
  }
  
  function siguiente() {
    const opciones = document.querySelectorAll('input[name="respuesta"]');
    let seleccion = null;
    opciones.forEach(o => { if (o.checked) seleccion = o.value; });
  
    quiz.responderPregunta(seleccion);
    quiz.partida.index++;
  
    if (quiz.partida.index < quiz.partida.preguntas.length) {
      mostrarPregunta();
    } else {
      quiz.finalizar(); // también detiene temporizador
    }
  }
  
  function mostrarResultados() {
    pantallaQuiz.style.display = "none";
    pantallaResultados.style.display = "block";
  
    contResultados.innerHTML = "";
    quiz.partida.obtenerResultadosDetalle().forEach(r => {
      const div = document.createElement("div");
      div.classList.add("pregunta");
      div.innerHTML = `<strong>${r.pregunta}</strong><br>`;
      r.opciones.forEach(op => {
        let clase = "";
        if (op === r.seleccion && op === r.correcta) clase = "correcta";
        else if (op === r.seleccion && op !== r.correcta) clase = "incorrecta";
        else if (op === r.correcta) clase = "correcta";
        div.innerHTML += `<span class="opcion ${clase}">${op}</span>`;
      });
      contResultados.appendChild(div);
    });
  }
  
  function mostrarRanking() {
    pantallaResultados.style.display = "none";
    pantallaRanking.style.display = "block";
  
    ulRanking.innerHTML = "";
    quiz.obtenerRanking().forEach(r => {
      const li = document.createElement("li");
      li.textContent = `${r.nombre} - ${r.puntaje} pts - ${r.fecha}`;
      ulRanking.appendChild(li);
    });
  }
  
  function volverAlMenu() {
    // reset de pantallas
    pantallaResultados.style.display = "none";
    pantallaRanking.style.display = "none";
    pantallaQuiz.style.display = "none";
    pantallaInicio.style.display = "flex";
  
    // reset de campos
    document.getElementById("nombre").value = "";
    contPregunta.innerHTML = "";
    contResultados.innerHTML = "";
    temporizadorUI.textContent = "5:00";
  }
  