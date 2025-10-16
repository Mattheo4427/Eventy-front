# Changelog

## Project Cleanup - October 2025

### Removed
- **Keycloak Integration**: Removed all Keycloak-specific code and configuration
  - Deleted `src/config/keycloak.ts`
  - Deleted `src/services/KeycloakAuthService.ts`
  - Removed Keycloak references from translation files

### Modified
- **Authentication System**: Simplified to placeholder implementation
  - `src/contexts/AuthContext.tsx`: Now shows "not yet available" message
  - `src/components/LoginModal.tsx`: Displays info message about upcoming authentication
  
### Translation Updates
- Updated all language files to remove Keycloak terminology:
  - `src/i18n/locales/en.json`: Simplified login messages
  - `src/i18n/locales/es.json`: Simplified login messages
  - `src/i18n/locales/fr.json`: Simplified login messages
  
### Documentation
- Updated `README.md` to reflect current state of the project
- Added roadmap section for planned features
- Clarified authentication is coming soon

### Status
✅ Project is now clean and ready for Git repository
✅ No external service dependencies
✅ Authentication prepared for future implementation
