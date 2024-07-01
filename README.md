## Project Setup Guide

Follow these steps to set up and run the project:

### Prerequisites

Ensure you have the following extensions installed:

- **ESLint**
- **Prettier**
- **EditorConfig**

### Installation Steps

1. **Install Dependencies**  
   Run the following command to install the necessary dependencies:

   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory of the project and add the following variables:

   ```env
   MONGODB_URI=mongodb+srv://admin:<password>@mybookstore.kzlnu4p.mongodb.net/?retryWrites=true&w=majority&appName=MyBookStore
   PI_URL="https://volta-rpc.energyweb.org/"
   PRIVATE_KEY="7cb2bae51e4fc736989c78555ece5b230f11d0ac0763e39a8d45e8d7795aa***"
   CONTRACT_ADDRESS="0x5C61ee90f5099a0A2a7a01093df0F05298324***"
   ACCESS_TOKEN_SECRET=<password>
   REFRESH_TOKEN_SECRET=<password>
   ADMIN_PASSWORD=<password>
   ```

   Replace `<password>` with your actual MongoDB password.

3. **Start the Project**
   Start the project by running:

   ```bash
   npm start
   ```

## Convention

Follow git commit message convention:

```
type(scope): message
```

Types include:

- feat: new feature
- fix: bug fix
- docs: changes in documentation
- style: everything related to styling
- refactor: code changes that neither fixes a bug nor adds a feature
- test: everything related to testing
- chore: updating tasks, etc; no production code change
