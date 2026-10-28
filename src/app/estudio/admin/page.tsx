import { dentro } from "@/estudio/sessao";
import Admin from "../ui/Admin";
import Entrar from "../ui/Entrar";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Estúdio" };

export default async function PaginaAdmin() {
  return (await dentro()) ? <Admin /> : <Entrar />;
}
