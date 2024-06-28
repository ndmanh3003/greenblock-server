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
   ```
   Replace `<password>` with your actual MongoDB password.
3. **Start the Project**
   Start the project by running:
   ```bash
   npm start
   ```
