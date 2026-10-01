let idToken = null;

const formulario = document.getElementById("formulario");
const numeroInput = document.getElementById("numero");
const mensagem = document.getElementById("mensagem");
const desenho = document.getElementById("desenho");
const baixar = document.getElementById("baixar");
const main = document.querySelector("main");

// ============================================
// 1. ANIMAÇÃO DE ENTRADA (Timeline avançada)
// ============================================
window.addEventListener("DOMContentLoaded", () => {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.to(main, {
    opacity: 1,
    y: 0,
    duration: 0.9
  })
  .from("header h1", {
    opacity: 0,
    y: -30,
    scale: 0.95,
    duration: 0.7
  }, "-=0.5")
  .from("header p", {
    opacity: 0,
    y: -15,
    duration: 0.6
  }, "-=0.4")
  .from("#botao-google", {
    opacity: 0,
    scale: 0.8,
    duration: 0.6,
    ease: "back.out(1.7)"
  }, "-=0.3")
  .from("form > *", {
    opacity: 0,
    y: 25,
    stagger: 0.12,
    duration: 0.55
  }, "-=0.35");
});

// ============================================
// 2. MICRO-INTERAÇÕES (hover / focus)
// ============================================
document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("mouseenter", () => {
    gsap.to(btn, { scale: 1.03, duration: 0.2, ease: "power2.out" });
  });
  btn.addEventListener("mouseleave", () => {
    gsap.to(btn, { scale: 1, duration: 0.25, ease: "power2.out" });
  });
});

numeroInput.addEventListener("focus", () => {
  gsap.to(numeroInput, {
    borderColor: "#7c5cfc",
    boxShadow: "0 0 0 4px rgba(124, 92, 252, 0.25)",
    duration: 0.25
  });
});

numeroInput.addEventListener("blur", () => {
  gsap.to(numeroInput, {
    boxShadow: "0 0 0 0px rgba(124, 92, 252, 0)",
    duration: 0.25
  });
});

// ============================================
// 3. LOGIN GOOGLE
// ============================================
function handleCredentialResponse(response) {
  idToken = response.credential;

  // Mensagem de sucesso com bounce
  mensagem.textContent = "Login realizado com sucesso!";
  mensagem.className = "sucesso";
  
  gsap.fromTo(mensagem, 
    { opacity: 0, y: 15, scale: 0.9 },
    { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.8)" }
  );

  // Esconde o botão do Google com animação
  const botaoGoogle = document.getElementById("botao-google");
  if (botaoGoogle) {
    gsap.to(botaoGoogle, {
      opacity: 0,
      scale: 0.7,
      y: -20,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => {
        botaoGoogle.innerHTML = "";
        botaoGoogle.remove();
      }
    });
  }

  // Destaca o formulário
  gsap.fromTo("form", 
    { scale: 0.97 },
    { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" }
  );
}

window.onload = function () {
  google.accounts.id.initialize({
    client_id: "476625408052-3f1sc13pg158rvhlnm168lj8316t1cn3.apps.googleusercontent.com",
    callback: handleCredentialResponse
  });

  google.accounts.id.renderButton(
    document.getElementById("botao-google"),
    {
      theme: "filled_black",
      size: "large",
      text: "signin_with",
      shape: "pill",
      width: 280
    }
  );
};

// ============================================
// 4. FUNÇÃO AUXILIAR DE MENSAGENS
// ============================================
function mostrarMensagem(texto, tipo = "") {
  mensagem.textContent = texto;
  mensagem.className = tipo;

  if (tipo === "erro") {
    // Shake de erro
    gsap.fromTo(mensagem, 
      { x: 0 },
      { 
        keyframes: [
          { x: -8 },
          { x: 8 },
          { x: -6 },
          { x: 6 },
          { x: -3 },
          { x: 0 }
        ],
        duration: 0.45,
        ease: "power1.inOut"
      }
    );
  } else {
    gsap.fromTo(mensagem, 
      { opacity: 0, y: 12, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.5)" }
    );
  }
}

// ============================================
// 5. GERAR DESENHO
// ============================================
formulario.addEventListener("submit", async (event) => {
  event.preventDefault();

  mensagem.textContent = "";
  mensagem.className = "";
  desenho.innerHTML = "";
  baixar.hidden = true;

  const numero = Number(numeroInput.value);

  if (!Number.isInteger(numero) || numero < 1 || numero > 100) {
    mostrarMensagem("Digite um número inteiro entre 1 e 100.", "erro");
    return;
  }
