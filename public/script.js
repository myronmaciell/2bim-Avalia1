let idToken = null;

const formulario = document.getElementById("formulario");
const numeroInput = document.getElementById("numero");
const mensagem = document.getElementById("mensagem");
const desenho = document.getElementById("desenho");
const baixar = document.getElementById("baixar");

function handleCredentialResponse(response) {
  idToken = response.credential;
  mensagem.textContent = "Login realizado com sucesso.";

  // Esconde o botão
  const botaoGoogle = document.getElementById("botao-google");
  if (botaoGoogle) {
    botaoGoogle.style.display = "none";
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
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "rectangular"
    }
  );
};

formulario.addEventListener("submit", async (event) => {
  event.preventDefault();
  mensagem.textContent = "";
  desenho.innerHTML = "";
  baixar.hidden = true;

  const numero = Number(numeroInput.value);

  if (!Number.isInteger(numero) || numero < 1 || numero > 100) {
    mensagem.textContent = "Digite um número inteiro entre 1 e 100.";
    return;
  }

  if (!idToken) {
    mensagem.textContent = "Faça login com sua conta Google antes de desenhar.";
    return;
  }

  mensagem.textContent = "Gerando desenho...";

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
      return;
    }

    if (resposta.status === 401) {
      mensagem.textContent = "Autenticação inválida. Faça login novamente.";
      return;
    }

    if (!resposta.ok) {
      mensagem.textContent = "Erro ao gerar o desenho.";
      return;
    }

    const svg = await resposta.text();
    desenho.innerHTML = svg;

    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    baixar.onclick = () => {
      const link = document.createElement("a");
      link.href = url;
      link.download = "desenho.svg";
      link.click();
    };

    baixar.hidden = false;
    mensagem.textContent = "Desenho gerado com sucesso.";
  } catch (erro) {
    console.error(erro);
    mensagem.textContent = "Não foi possível conectar ao servidor.";
  }
});
