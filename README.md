# Gym Management System

## Overview

This project is a web-based information system designed to manage users and bookings for a gym. It includes two subsystems: one for gym staff (administrators) and one for gym users (members).

## Table of Contents

1. Introduction
2. [System Description](#system-description)
   - [Administrative Subsystem](#administrative-subsystem)
   - [User Subsystem](#user-subsystem)
3. [Implementation](#implementation)
   - [Technologies](#technologies)
   - [Database](#database)
   - [Web Services](#web-services)
4. [Installation Guide](#installation-guide)
5. [Usage Guide](#usage-guide)
   - [Admin Usage](#admin-usage)
   - [User Usage](#user-usage)
6. [Gantt Chart](#gantt-chart)
7. [Sources](#sources)
8. [Contributors](#contributors)
9. [License](#license)

## Introduction

The goal of this project is to create a network-centric information system for managing users and bookings at a gym. It provides efficient and effective management of gym activities, ensuring a pleasant user experience for all interested parties.

## System Description

The system consists of two main subsystems:

### Administrative Subsystem

- **User Registration Management:** Approve or reject user registration requests.
- **User Management:** CRUD operations on user data including name, surname, country, city, address, email, username, and password.
- **Gym Components Management:** Manage gym trainers and available programs (e.g., pilates, crossfit, pool).
- **Announcements/Offers Management:** Post and manage announcements and offers visible to registered users.
- **Program Schedule Management:** Configure the schedule for each exercise including day, time, trainer, and available spots.

### User Subsystem

- **News/Announcements:** View gym announcements and offers.
- **Gym Services Navigation:** Browse and book gym services and view booking history.
- **User Registration:** Register by filling out a form with basic personal details and wait for admin approval.

## Implementation

### Technologies

The system is developed using JavaScript with Node.js. The main components include:

- **Express:** Web application framework for Node.js.
- **Express-Session:** Middleware for session management.
- **MongoDB Atlas:** Cloud-based NoSQL database service.
- **EJS:** View engine for generating dynamic HTML pages.
- **CSS:** Used for styling and layout.

### Database

The database is hosted on MongoDB Atlas and includes collections such as 'users', 'trainers', and 'programs'. The database can be accessed via the following link: [MongoDB Atlas](https://cloud.mongodb.com/v2/6581152732c0e44ed0eecea1#/metrics/replicaSet/6581159fe1bf8619215f5661/explorer/gym/users/find).

### Web Services

- **Login Service:** 
  - **Endpoint:** `/login`
  - **Method:** HTTP POST
  - **Parameters:** `username`, `password`
  
- **Registration Service:**
  - **Endpoint:** `/signup`
  - **Method:** HTTP POST
  - **Parameters:** `username`, `password`, `email`, `fullname`, etc.

- **Dashboard Service:**
  - **Endpoint:** `/dashboard`
  - **Method:** HTTP GET
  - **Parameters:** Uses session object to retrieve user information

- **Admin Actions:**
  - **Endpoint:** `/admin-action`
  - **Method:** HTTP POST
  - **Parameters:** `userId`, `action`

- **User Deletion:**
  - **Endpoint:** `/admin-dashboard/delete-user`
  - **Method:** HTTP POST
  - **Parameters:** `userId`

- **Add Announcement:**
  - **Endpoint:** `/admin-dashboard/add-announcement`
  - **Method:** HTTP POST
  - **Parameters:** `announcement-text`

- **Reservation Management:**
  - **Endpoint:** `/make-reservation`
  - **Method:** HTTP POST
  - **Parameters:** `scheduleId`, `userId`

- **Logout Service:**
  - **Endpoint:** `/logout`
  - **Method:** HTTP POST
  - **Parameters:** None

## Installation Guide

### System Requirements

- **Operating System:** Windows, Linux, or macOS
- **Python:** [Download Python](https://www.python.org/downloads/)
- **Node.js:** [Download Node.js](https://nodejs.org/en/download)

### Steps

1. Clone the repository:
   ```bash
   cd <project-directory>

