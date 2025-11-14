# Dynamic KD-Trees for Taxi Booking System

A real-time taxi booking system that efficiently finds the nearest available taxis using Dynamic KD-Trees and calculates optimal routes using graph-based pathfinding algorithms.

## Overview

This project implements a spatial indexing system for taxi location management using **Dynamic KD-Trees** with Red-Black balance strategy. The system efficiently handles:
- Finding k-nearest taxis to a pickup location
- Dynamic taxi position updates (insertions and deletions)
- Optimal route calculation using Dijkstra's algorithm on a road network graph
- Real-time visualization of taxis, routes, and road networks

## Features

- **Efficient Spatial Queries**: O(log n) average case for k-nearest neighbor searches using Dynamic KD-Trees
- **Self-Balancing Tree**: Maintains balance using Red-Black strategy to ensure optimal performance
- **Graph-Based Pathfinding**: Uses Dijkstra's algorithm for calculating realistic road distances
- **Dynamic Updates**: Real-time insertion and deletion of taxi locations
- **Interactive Visualization**: Web-based UI showing taxis, routes, and road networks
- **Persistent State**: Taxi positions are saved and restored between sessions
- **Full Booking Flow**: Find taxi � Book taxi � Complete ride with distance and time estimates

## Technology Stack

### Backend
- **C++**: Core data structures (Dynamic KD-Tree, Graph, Dijkstra's algorithm)
- **Node.js**: HTTP server acting as a bridge between frontend and C++ backend
- **Compiler**: g++ (MinGW or GCC)

### Frontend
- **React** (v19.2.0): UI framework
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **JavaScript/ES6**: Business logic

## Installation

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **g++ compiler** (MinGW on Windows, GCC on Linux/Mac)
- **Git**

### Step 1: Clone the Repository

```bash
git clone https://github.com/kushagramkhare/Dynamic-KD-Trees-for-Taxi-System
cd Dynamic-KD-Trees-for-Taxi-System
```

### Step 2: Compile the C++ Backend

Navigate to the backend directory and compile:

```bash
cd backend
g++ -std=c++17 -I include -o main_graph.exe src/main.cpp src/graph.cpp src/dynamic_kd_tree.cpp
```

### Step 3: Install Frontend Dependencies

Install dependencies for frontend-ui:

```bash
cd ../frontend-ui
npm i
```

## Running the Application

### Step 1: Start the Node.js Backend Server

```bash
cd backend
node server.js
```

The server will start on `http://localhost:8002`

You should see:
```
==============================================
  Taxi Finder Server - C++ Backend
==============================================
Server running on http://localhost:8002
API endpoint: POST http://localhost:8002/api/route
Backend: C++ KD-Tree (main_graph.exe)
Press Ctrl+C to stop the server
```

### Step 2: Start the React Frontend

Open a new terminal and run:

```bash
cd frontend-ui
npm start
```

The React app will start on `http://localhost:3000` and automatically open in your browser.

### Step 3: Use the Application

1. **Enter Pickup Location**: Enter any set of coordinates from -100 to 100
2. **Find Nearest Taxis**: The system will show the 5 nearest taxis with routes
3. **Book a Taxi**: Select and book a taxi to move it to your pickup location
4. **Complete Ride**: Enter dropoff location and complete the ride

## Algorithm Details

### Dynamic KD-Tree

- **Insertion**: O(log n) average case
- **Deletion**: O(log n) average case with lazy rebuilding
- **k-NN Search**: O(k log n) average case
- **Balancing Strategy**: Red-Black balance (height difference d 2x)
- **Splitting**: Alternates between x and y dimensions at each level

### Graph Pathfinding

- **Algorithm**: Dijkstra's shortest path
- **Time Complexity**: O((V + E) log V) using priority queue
- **Graph Structure**: Sparse road network with Manhattan-style connections
- **Distance Metric**: Graph distance (number of edges) for realistic road distances

## References

This project is based on the following research papers:

1. **Paper 1**: [Building a Balanced k-d Tree in O(kn log n) Time]
   - [https://arxiv.org/abs/1410.5420]

2. **Paper 2**: [A Dynamic, Self-balancing k-d Tree]
   - [https://arxiv.org/abs/2509.08148]

## Key Algorithms Implemented

- **Dynamic KD-Tree** with Red-Black balancing strategy
- **K-Nearest Neighbors (k-NN)** search
- **Dijkstra's Shortest Path** algorithm
- **Lazy Rebuilding** for tree maintenance
- **Priority Queue** based search optimization

## Performance

- **Initial Tree Build**: O(n log n)
- **Find Nearest Taxi**: O(log n)
- **Book Taxi (update position)**: O(log n)
- **Route Calculation**: O((V + E) log V)
