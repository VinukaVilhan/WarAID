# WARAID

WARAID is a web application designed for emergency assistance, providing alert messages, first-aid chatbot functionalities, file management, news updates, and location-based services. The backend is developed using the Ballerina programming language.

## Prerequisites

Before running the application, ensure you have the following installed:

- [Ballerina](https://ballerina.io/downloads/) (for backend)
- [React](https://react.dev/) (for frontend)
- [Vite (JavaScript + SWC)](https://vitejs.dev/guide/) (for frontend build)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) (for managing packages)

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/VinukaVilhan/iwb236-scriptrippers.git
    cd WARAID
    ```

2. Install the frontend dependencies:
    ```bash
    npm install
    ```

## Backend Setup

Some backend service needs to have its own `Config.toml` file which stores the configuration required for the service to run.

### Alert Messages

1. Navigate to the `alertMsg` service directory:
    ```bash
    cd Backend/alertMsg
    ```

2. Create a `Config.toml` file and add the following configurations for the AWS RDS.
    ```toml
    host = "<aws-rds-host>" 
    port = "<port>"                  
    username = "<username>"        
    password = "<password>"  
    database = "<database_name>"
    ```

3. Run the service:
    ```bash
    bal run
    ```

### Files Control

1. Navigate to the `files-control` service directory:
    ```bash
    cd Backend/files-control
    ```

2. Create a `Config.toml` file and add the following configurations for OpenAI and AWS S3.
    ```toml
    openAIToken="<openai_token>"
    accessKeyId = "<aws-access-key-id>"
    secretAccessKey = "<aws-secret-access-key>"
    region = "<aws_bucket_region>"
    bucketName = "<bucket_name>"
    ```

3. Run the service:
    ```bash
    bal run
    ```

### First-Aid Chatbot

1. Navigate to the `first-aid-chatbot` service directory:
    ```bash
    cd Backend/first-aid-chatbot
    ```

2. Create a `Config.toml` file and add the following configurations for the OpenAI.
    ```toml
    openaiEndpointUrl = "<endpoint_url>"
    openaiDeploymentName = "<deployment_name>"
    openaiApiKey = "<api_key>"
    ```

3. Run the service:
    ```bash
    bal run
    ```

### JWT

1. Navigate to the `first-aid-chatbot` service directory:
    ```bash
    cd Backend/first-aid-chatbot
    ```

2. Run the service:
    ```bash
    bal run
    ```

### Location Service

1. Navigate to the `location_service` directory:
    ```bash
    cd Backend/location_service
    ```

2. Create a `Config.toml` file and add the following configurations for the AWS RDS.
    ```toml
    host = "<aws-rds-host>" 
    port = "<port>"                  
    username = "<username>"        
    password = "<password>"  
    database = "<database_name>"
    ```

3. Run the service:
    ```bash
    bal run
    ```

### News

1. Navigate to the `news` service directory:
    ```bash
    cd Backend/news
    ```

2. Create a `Config.toml` file and add the following configurations for the newsapi.org API.
    ```toml
    apiKey = "<API_key>"	
    ```

3. Run the service:
    ```bash
    bal run
    ```

## Frontend Setup

The frontend of WARAID is built using [Vite](https://vitejs.dev/), a modern frontend build tool that provides a faster and leaner development experience.

### Install Dependencies

Before running the frontend, ensure that the required Node.js packages are installed.

1. Navigate to the root directory of the project where the `package.json` file is located:
    ```bash
    cd WARAID
    ```

2. Install the required packages using npm:
    ```bash
    npm install
    ```

   Alternatively, if you are using yarn, you can install the dependencies with:
    ```bash
    yarn install
    ```

### Running the Frontend in Development Mode

After installing the dependencies, you can start the frontend development server.

1. In the root directory of the project, run the following command:
    ```bash
    npm run dev
    ```

   Or, if using yarn:
    ```bash
    yarn dev
    ```

2. By default, Vite will start a local development server on port `5173`. Open your browser and go to:
    ```
    http://localhost:5173
    ```
