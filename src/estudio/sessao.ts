import { cookies } from "next/headers";
import { COOKIE, cookieValido } from "./auth";
import { ler, salvar } from "./armazem";
import { CONFIG_PADRAO, type ConfigModelos } from "./modelos";

/** A pessoa entrou com a senha? (route handlers e páginas do servidor) */
export async function dentro(): Promise<boolean> {
  return cookieValido((await cookies()).get(COOKIE)?.value);
}

export const NAO_AUTORIZADO = () => Response.json({ erro: "Entre com a senha." }, { status: 401 });

/** A escolha de modelos feita no admin; null quando nunca foi salva (vale ESTUDIO_MODELOS ou o padrão). */
export async function lerConfig(): Promise<ConfigModelos | null> {
  try {
    const c = await ler<ConfigModelos>("config/modelos.json");
    return c ? { ...CONFIG_PADRAO, ...c } : null;
  } catch {
    return null;
  }
}

export async function salvarConfig(c: ConfigModelos): Promise<void> {
  await salvar("config/modelos.json", { ...c, atualizado: new Date().toISOString() });
}
