![Kedo智能流程体系统图片](images/img04.png)
# Kedo - Process Intelligent Agent Development Platform Open Source Project

Welcome to the **Kedo** open-source project! KedoFlow is a process intelligent agent development platform based on large language models, designed to help developers quickly build and deploy intelligent business workflows. This project supports React for front-end development and both .NET Core and Java for back-end development, making it suitable for various application scenarios.

Below are detailed descriptions of the project, its open-source license, usage guide, and important notes.

---

## 1. Project Overview

### 1.1 Core Features
- **Large Language Model Integration**: Integrated with advanced LLMs like DeepSeek, ChatGPT, Qwen, and Claude to provide powerful natural language processing capabilities. The system also easily supports future model expansions.
- **Process Intelligent Agent Development**: Enables developers to define custom workflow logic for automated task handling.
- **Multi-language Back-end Support**: Supports both .NET Core and Java back-end stacks to meet diverse team technology needs.
- **Modern Front-end Framework**: Built using React to deliver a smooth user experience.
- **Multilingual Support**: Supports Chinese and English to accommodate teams across different language backgrounds.

### 1.2 Technology Stack
- **Frontend**: React + TypeScript
- **Backend**:
  - .NET Core
  - Java (under development)
- **Database**: Supports mainstream relational databases such as MySQL and PostgreSQL
- **Other Dependencies**: Can be extended with third-party services as needed

---

## 2. Open Source License

Kedo follows the **Apache 2.0 License**, with additional clauses added. Please read carefully:

### 2.1 Apache 2.0 License Key Points
- You may freely use, modify, and distribute this project’s code.
- If you make modifications, you must clearly mark the modified sections.
- You must include the original license and copyright notice in any distributed copies.

### 2.2 Additional Terms
In addition to the Apache 2.0 License terms, we have added the following:

1. **Commercial Use Authorization**: If you plan to use KedoFlow for commercial purposes (e.g., selling, renting, or offering as a service), you must obtain written permission from us in advance. Please contact our company email: **kedoai@kedowen.com**.
2. **Logo Usage Restrictions**: Modifying or removing the KedoFlow logo or brand identity without permission is prohibited.
3. **Disclaimer of Liability**: The project is provided "as-is" without any express or implied warranties. Ensure thorough testing before deployment.

For more details, please refer to the [LICENSE file](LICENSE).

---

## 3. Installation & Usage Guide

### 3.1 Clone the Project
```bash
git clone https://github.com/kedowen/Kedo.git
cd Kedo
```

### 3.2 Run the Project

#### 1. Docker One-click Deployment (Recommended)
To simplify local deployment, KedoFlow provides a Docker-based one-click deployment solution. You can use `docker-compose` to quickly launch a complete development/testing environment, including frontend, backend, and database services.

1. **Install Dependencies**

Ensure your system has the following tools installed:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/install/)

2. **Start the Project**

Run the following command in the root directory of the project:

```bash
# Build and start all services
docker-compose -f docker-compose.yml up -d
```

3. **Access the Platform**

Open your browser and navigate to:

```
http://localhost:3000
```

You will see the Kedo platform's front-end interface.

4. **Default Login Credentials**
- Username: 15188886666  
- Password: 123456  

---

#### 2. Local Deployment

1. **Frontend Setup**
Go into the frontend directory and install dependencies:
```bash
cd frontend
npm install
npm start
```

2. **Backend Setup**
- **.NET Backend**: [GitHub Repository Link](https://github.com/kedowen/KedoExecutorNet)
- **Java Backend**: Under development, not yet available

---

## 4. Contribution Guidelines

We warmly welcome community developers to contribute to Kedo! Here are the recommended steps to get involved:

1. **Fork the Project**: Click the "Fork" button at the top-right corner of the GitHub page.
2. **Clone Your Fork**: Clone your forked repository to your local machine.
3. **Create a New Branch**: Create a new branch based on the main branch for your development.
4. **Commit Your Changes**: Once development is done, commit and push your changes to your remote repository.
5. **Submit a Pull Request**: Submit a Pull Request to the main repository and describe your changes.

Please follow the project's coding style and guidelines.

---

## 5. Contact Us

If you have any questions or need further assistance, feel free to reach out via the following channels:

- **Official Website**: [www.kedoai.com](https://www.kedoai.com)
- **Company Email**: kedoai@kedowen.com
- **GitHub Issues**: Submit issues or suggestions on the project's Issues page.

---

## 6. Copyright Notice

The Kedo name, logo, and brand identifiers are the intellectual property of **KedoWen Inc.** Unauthorized copying, distribution, or commercial use is strictly prohibited.

Thank you for choosing Kedo! We hope our platform brings value to your projects.
