import { cookies } from "next/headers";
import { COOKIE, cookieValido } from "@/estudio/auth";
import publico from "@/estudio/dados/publico.json";
import Entrar from "./ui/Entrar";
import Estudio, { type Publico } from "./ui/Estudio";

export const dynamic = "force-dynamic";

export default async function PaginaEstudio() {
  const dentro = cookieValido((await cookies()).get(COOKIE)?.value);
  return dentro ? <Estudio publico={publico as unknown as Publico} /> : <Entrar />;
}
