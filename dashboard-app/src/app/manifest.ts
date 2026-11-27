import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Agendamentos — Sistema de Gestão & Agendamentos",
    short_name: "Agendamentos",
    description: "Gerencie horários, clientes, produtos e relatórios da sua clínica em um só lugar.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [
      {
        src: "/images/brand/logo-circulo.png",
        sizes: "1254x1254",
        type: "image/png",
      },
    ],
  };
}
