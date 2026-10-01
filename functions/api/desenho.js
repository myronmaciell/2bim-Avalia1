import { gerarDesenho } from "../../lib/desenho.js";

export async function onRequest(context) {
  const request = context.request;

  // 405 - método diferente de POST
  if (request.method !== "POST") {
    return new Response("Método não permitido", {
      status: 405
    });
  }

  // 400 - corpo ausente ou JSON inválido
  let dados;

  try {
    dados = await request.json();
  } catch {
    return new Response("JSON inválido", {
      status: 400
    });
  }

  // 400 - número inválido
  const numero = dados?.numero;

  if (
    !Number.isInteger(numero) ||
    numero < 1 ||
    numero > 100
  ) {
    return new Response("Número inválido", {
      status: 400
    });
  }

  // 401 - token ausente
  const authorization = request.headers.get("Authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return new Response("Token ausente ou inválido", {
      status: 401
    });
  }

  const idToken = authorization.substring(7).trim();

  if (!idToken) {
    return new Response("Token ausente ou inválido", {
      status: 401
    });
  }

  // Verificação do token pelo Google
  const respostaGoogle = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
  );

  if (!respostaGoogle.ok) {
    return new Response("Token inválido ou expirado", {
      status: 401
    });
  }

  let dadosGoogle;

  try {
    dadosGoogle = await respostaGoogle.json();
  } catch {
    return new Response("Token inválido", {
      status: 401
    });
  }

 if (dadosGoogle.email_verified !== true && dadosGoogle.email_verified !== "true") {
  return new Response("E-mail não verificado", {
    status: 401
  });
}

  // Verifica se o e-mail foi confirmado pelo Google
  if (dadosGoogle.email_verified !== "true") {
    return new Response("E-mail não verificado", {
      status: 401
    });
  }

  const email = dadosGoogle.email;

  if (!email) {
    return new Response("E-mail não encontrado", {
      status: 401
    });
  }

  // Gera o desenho usando o e-mail obtido do token
  const svg = gerarDesenho(numero, email);

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml"
    }
  });
}
