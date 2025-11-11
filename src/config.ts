// !!! ATTENTION !!!
// N'UTILISEZ PAS 'localhost'. L'émulateur mobile ne peut pas le résoudre.
// Mettez l'adresse IP de votre machine sur le réseau local.
// (Ex: 192.168.1.10)
const IP_LOCALE_DE_VOTRE_PC = "192.168.1.101"; // <--- METTEZ VOTRE IP LOCALE ICI

export const keycloakConfig = {
  baseUrl: `http://${IP_LOCALE_DE_VOTRE_PC}:8090`,
  realm: "eventy-realm",
  clientId: "eventy-mobile",
};

// C'est le "schéma" de votre app, défini dans app.json
export const appSchema = "eventy";

// L'URL de votre API Gateway (quand elle sera prête)
export const apiConfig = {
  baseUrl: `http://${IP_LOCALE_DE_VOTRE_PC}:8080/api`, // Port de la Gateway
};