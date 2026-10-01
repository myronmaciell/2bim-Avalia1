
import { gerarDesenho } from "../../lib/desenho.js";

export async function onRequest(context) {
    const request = context.request;

    if (request.method !== "POST") {
        return new Response("Método não permitido", {
            status: 405
        });
    }

    let dados;

    try {
        dados = await request.json();
    } catch {
        return new Response("JSON inválido", {
            status: 400
        });
    }

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

    return new Response("Autenticação necessária", {
        status: 401
    });
}
