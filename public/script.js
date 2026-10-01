let idToken = null;

const formulario = document.getElementById("formulario");
const numeroInput = document.getElementById("numero");
const mensagem = document.getElementById("mensagem");
const desenho = document.getElementById("desenho");
const baixar = document.getElementById("baixar");

// ===== ANIMAÇÕES DE ENTRADA =====
window.addEventListener("DOMContentLoaded", () => {
  gsap.to("main", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "power3.out"
  });

  gsap.from("header h1", {
    opacity: 0,
    y: -20,
    duration: 0.7,
    delay: 0.2,
    ease: "power2.out"
  });

  gsap.from("header p", {
    opacity: 0,
    y: -10,
    duration: 0.6,
    delay: 0.35,
    ease: "power2.out"
  });

  gsap.from("#botao-google, form", {
    opacity: 0,
    y: 20,
    duration: 0.7,
    delay: 0.45,
    stagger: 0.1,
    ease: "power2.out"
  });
});

function handleCredentialResponse(response) {
  idToken = response.credential;
  
  mensagem.textContent = "Login realizado com sucesso.";
  mensagem.className = "sucesso";
  gsap.from(mensagem, { opacity: 0, y: 8, duration: 0.3 });

  // Esconde o botão do Google de forma agressiva
  const botaoGoogle = document.getElementById("botao-google");
  if (botaoGoogle) {
    botaoGoogle.innerHTML = "";
    botaoGoogle.style.display = "none";
    botaoGoogle.hidden = true;
    botaoGoogle.remove();
  }

  // Pequena animação no formulário
  gsap.from("form", {
    opacity: 0.6,
    scale: 0.97,
    duration: 0.4,
    ease: "power2.out"
  });
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

formulario.addEventListener("submit", async (event) => {
  event.preventDefault();
  
  mensagem.textContent = "";
  mensagem.className = "";
  desenho.innerHTML = "";
  baixar.hidden = true;

  const numero = Number(numeroInput.value);

  if (!Number.isInteger(numero) || numero < 1 || numero > 100) {
    mensagem.textContent = "Digite um número inteiro entre 1 e 100.";
    mensagem.className = "erro";
    gsap.from(mensagem, { opacity: 0, y: 8, duration: 0.3 });
    return;
  }

  if (!idToken) {
    mensagem.textContent = "Faça login com sua conta Google antes de desenhar.";
    mensagem.className = "erro";
    gsap.from(mensagem, { opacity: 0, y: 8, duration: 0.3 });
    return;
  }

  mensagem.textContent = "Gerando desenho...";
  mensagem.className = "";
  gsap.from(mensagem, { opacity: 0, y: 8, duration: 0.3 });

  try {
    const resposta = await fetch("/api/desenho", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      },
      body: JSON.stringify({ numero: numero })
    });

    if (resposta.status === 400) {
      mensagem.textContent = "Dados inválidos.";
      mensagem.className = "erro";
      gsap.from(mensagem, { opacity: 0, y: 8, duration: 0.3 });
      return;
    }

    if (resposta.status === 401) {
      mensagem.textContent = "Autenticação inválida. Faça login novamente.";
      mensagem.className = "erro";
      gsap.from(mensagem, { opacity: 0, y: 8, duration: 0.3 });
      return;
    }

    if (!resposta.ok) {
      mensagem.textContent = "Erro ao gerar o desenho.";
      mensagem.className = "erro";
      gsap.from(mensagem, { opacity: 0, y: 8, duration: 0.3 });
      return;
    }

    const svg = await resposta.text();
    desenho.innerHTML = svg;

    // Animação de entrada do desenho
    gsap.from("#desenho", {
      opacity: 0,
      scale: 0.88,
      duration: 0.65,
      ease: "back.out(1.5)"
    });

    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    baixar.onclick = () => {
      const link = document.createElement("a");
      link.href = url;
      link.download = "desenho.svg";
      link.click();
    };

    baixar.hidden = false;

    // Animação do botão baixar
    gsap.from("#baixar", {
      opacity: 0,
      y: 12,
      duration: 0.4,
      delay: 0.25
    });

    mensagem.textContent = "Desenho gerado com sucesso.";
    mensagem.className = "sucesso";
    gsap.from(mensagem, { opacity: 0, y: 8, duration: 0.3 });

  } catch (erro) {
    console.error(erro);
    mensagem.textContent = "Não foi possível conectar ao servidor.";
    mensagem.className = "erro";
    gsap.from(mensagem, { opacity: 0, y: 8, duration: 0.3 });
  }
});
