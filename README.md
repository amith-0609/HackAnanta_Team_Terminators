# Internship & Resource Platform

A full-stack application for finding internships, matching with jobs using AI, and sharing resources.

## Features
- **Real-time Job Search**: Scrapes jobs from LinkedIn, Indeed, Glassdoor, etc.
- **AI Matching**: Upload your resume to find the best internships for your skills.
- **Resource Hub**: Share and find study materials.

## Setup Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) (v3.9 or higher)

### 2. Backend Setup (Python)
The backend handles job scraping and resume parsing.

1.  Navigate to the backend folder:
    ```bash
    cd backend/python_server
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Run the server:
    ```bash
    python app.py
    ```
    *The server will start on `http://localhost:5002`*

### 3. Frontend Setup (React)
The frontend is the user interface.

1.  Open a new terminal and navigate to the project root:
    ```bash
    cd HackAnanta_Team_Terminators
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    *The app will open at `http://localhost:8080`*

## Troubleshooting
- **"Module not found: pandas"**: Make sure you ran `pip install -r requirements.txt` in the `backend/python_server` folder.
- **"JobSpy not found"**: Ensure the `backend/JobSpy` folder is present.
