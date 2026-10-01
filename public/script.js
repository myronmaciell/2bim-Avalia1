let idToken = null;

const formulario = document.getElementById("formulario");
const numeroInput = document.getElementById("numero");
const mensagem = document.getElementById("mensagem");
const desenho = document.getElementById("desenho");
const baixar = document.getElementById("baixar");

function handleCredentialResponse(response) {
  idToken = response.credential;

  mensagem.textContent = "Login realizado com sucesso!";
  mensagem.className = "sucesso";

  // Esconde o botão do Google
  const botaoGoogle = document.getElementById("botao-google");
  if (botaoGoogle) {
    botaoGoogle.style.transition = "opacity 0.35s, transform 0.35s";
    botaoGoogle.style.opacity = "0";
    botaoGoogle.style.transform = "scale(0.7) translateY(-15px)";
    
    setTimeout(() => {
      botaoGoogle.innerHTML = "";
      botaoGoogle.remove();
    }, 350);
  }
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

function mostrarMensagem(texto, tipo = "") {
  mensagem.textContent = texto;
  mensagem.className = tipo;
}

formulario.addEventListener("submit", async (event) => {
  event.preventDefault();

  mensagem.textContent = "";
  mensagem.className = "";
  desenho.innerHTML = "";
  desenho.classList.remove("show");
  baixar.hidden = true;

  const numero = Number(numeroInput.value);

  if (!Number.isInteger(numero) || numero < 1 || numero > 100) {
    mostrarMensagem("Digite um número inteiro entre 1 e 100.", "erro");
    return;
  }

  if (!idToken) {
    mostrarMensagem("Faça login com sua conta Google antes de desenhar.", "erro");
    return;
  }

  // Loading
  mostrarMensagem("Gerando desenho...");
  mensagem.classList.add("loading");

  try {
    const resposta = await fetch("/api/desenho", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      },
      body: JSON.stringify({ numero })
    });

    mensagem.classList.remove("loading");

    if (resposta.status === 400) {
      mostrarMensagem("Dados inválidos.", "erro");
      return;
    }

    if (resposta.status === 401) {
      mostrarMensagem("Autenticação inválida. Faça login novamente.", "erro");
      return;
    }

    if (!resposta.ok) {
      mostrarMensagem("Erro ao gerar o desenho.", "erro");
      return;
    }

    const svg = await resposta.text();
    desenho.innerHTML = svg;

    // Dispara a animação CSS do desenho
    requestAnimationFrame(() => {
      desenho.classList.add("show");
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
    mostrarMensagem("Desenho gerado com sucesso!", "sucesso");

  } catch (erro) {
    mensagem.classList.remove("loading");
    console.error(erro);
    mostrarMensagem("Não foi possível conectar ao servidor.", "erro");
  }
});
