// Node.js HTTP Server that calls C++ backend
// This server acts as a bridge between frontend and C++ KD-Tree implementation
// Run with: node server.js

const http = require('http');
const { exec } = require('child_process');
const path = require('path');

// Path to C++ executable
const CPP_EXECUTABLE = path.join(__dirname, 'main_graph.exe');

// HTTP Server
const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Health check endpoint
    if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            backend: 'C++ KD-Tree',
            message: 'Server is running and ready to find nearest taxis'
        }));
        return;
    }

    // API endpoint for finding nearest taxis
    if (req.url === '/api/route' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const pickupX = parseInt(data.pickup.x);
                const pickupY = parseInt(data.pickup.y);

                console.log(`\nReceived request for nearest taxis to point (${pickupX}, ${pickupY})`);
                console.log(`Calling C++ backend: ${CPP_EXECUTABLE} ${pickupX} ${pickupY}`);

                // Call C++ executable with pickup coordinates
                exec(`"${CPP_EXECUTABLE}" ${pickupX} ${pickupY}`, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Error executing C++ backend:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            error: 'Failed to execute C++ backend',
                            details: error.message
                        }));
                        return;
                    }

                    try {
                        // Parse JSON output from C++ program
                        const result = JSON.parse(stdout.trim());

                        if (result.nearestTaxi) {
                            console.log(`Found nearest taxi at (${result.nearestTaxi.location.x}, ${result.nearestTaxi.location.y})`);
                            console.log(`Distance: ${result.nearestTaxi.graphDistance} units, Time: ${result.nearestTaxi.estimatedTime.toFixed(2)} minutes`);
                        }

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(result));
                    } catch (parseError) {
                        console.error('Error parsing C++ output:', parseError);
                        console.error('C++ stdout:', stdout);
                        console.error('C++ stderr:', stderr);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            error: 'Failed to parse C++ output',
                            details: parseError.message
                        }));
                    }
                });
            } catch (error) {
                console.error('Error:', error.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
        return;
    }

    // API endpoint for booking a taxi (moves taxi to pickup location)
    if (req.url === '/api/book-taxi' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const pickupX = parseInt(data.pickup.x);
                const pickupY = parseInt(data.pickup.y);
                const taxiX = parseInt(data.taxi.x);
                const taxiY = parseInt(data.taxi.y);

                console.log(`\n[BOOK] Moving taxi from (${taxiX}, ${taxiY}) to pickup (${pickupX}, ${pickupY})`);
                console.log(`Calling C++ backend: ${CPP_EXECUTABLE} ${pickupX} ${pickupY} ${taxiX} ${taxiY}`);

                // Call C++ executable with book command
                exec(`"${CPP_EXECUTABLE}" ${pickupX} ${pickupY} ${taxiX} ${taxiY}`, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Error executing C++ backend:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            error: 'Failed to execute C++ backend',
                            details: error.message
                        }));
                        return;
                    }

                    try {
                        // Parse JSON output from C++ program
                        const result = JSON.parse(stdout.trim());

                        if (result.error) {
                            console.log(`Error: ${result.error}`);
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(result));
                        } else {
                            console.log(`✓ Taxi booked! Moved from (${result.movedFrom.x}, ${result.movedFrom.y}) to (${result.movedTo.x}, ${result.movedTo.y})`);
                            console.log(`  Distance: ${result.distance} units, ETA: ${result.time.toFixed(2)} minutes`);
                            console.log(`  Tree height: ${result.treeHeight}, Tree size: ${result.treeSize}`);
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(result));
                        }
                    } catch (parseError) {
                        console.error('Error parsing C++ output:', parseError);
                        console.error('C++ stdout:', stdout);
                        console.error('C++ stderr:', stderr);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            error: 'Failed to parse C++ output',
                            details: parseError.message
                        }));
                    }
                });
            } catch (error) {
                console.error('Error:', error.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
        return;
    }

    // API endpoint for starting ride (moves taxi to dropoff location)
    if (req.url === '/api/start-ride' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const dropoffX = parseInt(data.dropoff.x);
                const dropoffY = parseInt(data.dropoff.y);
                const taxiX = parseInt(data.taxi.x);
                const taxiY = parseInt(data.taxi.y);

                console.log(`\n[START RIDE] Moving taxi from (${taxiX}, ${taxiY}) to dropoff (${dropoffX}, ${dropoffY})`);
                console.log(`Calling C++ backend: ${CPP_EXECUTABLE} ${dropoffX} ${dropoffY} ${taxiX} ${taxiY}`);

                // Call C++ executable with ride command
                exec(`"${CPP_EXECUTABLE}" ${dropoffX} ${dropoffY} ${taxiX} ${taxiY}`, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Error executing C++ backend:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            error: 'Failed to execute C++ backend',
                            details: error.message
                        }));
                        return;
                    }

                    try {
                        // Parse JSON output from C++ program
                        const result = JSON.parse(stdout.trim());

                        if (result.error) {
                            console.log(`Error: ${result.error}`);
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(result));
                        } else {
                            console.log(`✓ Ride started! Moved from (${result.movedFrom.x}, ${result.movedFrom.y}) to (${result.movedTo.x}, ${result.movedTo.y})`);
                            console.log(`  Distance: ${result.distance} units, Duration: ${result.time.toFixed(2)} minutes`);
                            console.log(`  Tree height: ${result.treeHeight}, Tree size: ${result.treeSize}`);
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(result));
                        }
                    } catch (parseError) {
                        console.error('Error parsing C++ output:', parseError);
                        console.error('C++ stdout:', stdout);
                        console.error('C++ stderr:', stderr);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            error: 'Failed to parse C++ output',
                            details: parseError.message
                        }));
                    }
                });
            } catch (error) {
                console.error('Error:', error.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
        return;
    }

    // API endpoint for moving a taxi dynamically (legacy)
    if (req.url === '/api/move-taxi' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const pickupX = parseInt(data.pickup.x);
                const pickupY = parseInt(data.pickup.y);
                const taxiX = parseInt(data.taxi.x);
                const taxiY = parseInt(data.taxi.y);

                console.log(`\nReceived request to move taxi from (${taxiX}, ${taxiY}) to (${pickupX}, ${pickupY})`);
                console.log(`Calling C++ backend: ${CPP_EXECUTABLE} ${pickupX} ${pickupY} ${taxiX} ${taxiY}`);

                // Call C++ executable with move command
                exec(`"${CPP_EXECUTABLE}" ${pickupX} ${pickupY} ${taxiX} ${taxiY}`, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Error executing C++ backend:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            error: 'Failed to execute C++ backend',
                            details: error.message
                        }));
                        return;
                    }

                    try {
                        // Parse JSON output from C++ program
                        const result = JSON.parse(stdout.trim());

                        if (result.error) {
                            console.log(`Error: ${result.error}`);
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(result));
                        } else {
                            console.log(`Successfully moved taxi from (${result.movedFrom.x}, ${result.movedFrom.y}) to (${result.movedTo.x}, ${result.movedTo.y})`);
                            console.log(`Tree height: ${result.treeHeight}, Tree size: ${result.treeSize}`);
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(result));
                        }
                    } catch (parseError) {
                        console.error('Error parsing C++ output:', parseError);
                        console.error('C++ stdout:', stdout);
                        console.error('C++ stderr:', stderr);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            error: 'Failed to parse C++ output',
                            details: parseError.message
                        }));
                    }
                });
            } catch (error) {
                console.error('Error:', error.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
        return;
    }

    // 404 for other routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = 8002;
server.listen(PORT, () => {
    console.log('==============================================');
    console.log('  Taxi Finder Server - C++ Backend');
    console.log('==============================================');
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoint: POST http://localhost:${PORT}/api/route`);
    console.log(`Backend: C++ KD-Tree (${CPP_EXECUTABLE})`);
    console.log('Press Ctrl+C to stop the server\n');
});
