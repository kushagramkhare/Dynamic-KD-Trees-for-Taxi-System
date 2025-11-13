#include <iostream>
#include <vector>
#include <algorithm>
#include <utility>
#include <cstdlib>
#include <ctime>
#include <iomanip>
#include <cmath>
#include <fstream>
#include "dynamic_kd_tree.h"
#include "graph.h"
#include "taxi.h"

using namespace std;


int main(int argc, char* argv[]) {
    int n;
    
    bool apiMode = (argc == 3 || argc == 5);
    bool bookingMode = (argc == 5);

    if (apiMode) {
        int qx, qy, taxiX, taxiY;
        int k = 5;
        
        if (bookingMode) {
            qx = atoi(argv[1]);
            qy = atoi(argv[2]);
            taxiX = atoi(argv[3]);
            taxiY = atoi(argv[4]);
        } else {
            qx = atoi(argv[1]);
            qy = atoi(argv[2]);
        }

        vector<point> taxiPoints;
        const char* TAXI_STATE_FILE = "taxi_state.txt";

        ifstream inFile(TAXI_STATE_FILE);
        if (inFile.is_open()) {
            int x, y;
            while (inFile >> x >> y) {
                taxiPoints.push_back(point(x, y));
            }
            inFile.close();
            n = taxiPoints.size();
        }
        
        if (taxiPoints.empty()) {
            srand(42);
            n = 50;
            for (int i = 0; i < n; i++) {
                int x = rand() % 100;
                int y = rand() % 100;
                taxiPoints.push_back(point(x, y));
            }
            
            ofstream outFile(TAXI_STATE_FILE);
            for (const auto& p : taxiPoints) {
                outFile << p.x << " " << p.y << "\n";
            }
            outFile.close();
        }

        DynamicKDTree kdtree(taxiPoints);
        
        point query(qx, qy);
        vector<point> nearest = kdtree.kNearestNeighbors(query, k);

        GridGraph roadNetwork;
        vector<pair<int,int>> taxiLocations;
        for(const auto& taxi : nearest) {
            taxiLocations.push_back({taxi.x, taxi.y});
        }
        
        int minX = qx, maxX = qx, minY = qy, maxY = qy;
        for(const auto& loc : taxiLocations) {
            minX = min(minX, loc.first);
            maxX = max(maxX, loc.first);
            minY = min(minY, loc.second);
            maxY = max(maxY, loc.second);
        }
        
        int rangeX = maxX - minX;
        int rangeY = maxY - minY;
        int expandX = max(rangeX / 2, 15);
        int expandY = max(rangeY / 2, 15);
        
        minX -= expandX; maxX += expandX;
        minY -= expandY; maxY += expandY;
        
        for(int x = minX; x <= maxX; x++) {
            for(int y = minY; y <= maxY; y++) {
                vector<pair<int,int>> neighbors;
                if(x > minX) neighbors.push_back({x-1, y});
                if(x < maxX) neighbors.push_back({x+1, y});
                if(y > minY) neighbors.push_back({x, y-1});
                if(y < maxY) neighbors.push_back({x, y+1});
                
                if(!neighbors.empty()) {
                    shuffle(neighbors.begin(), neighbors.end(), mt19937(random_device{}()));
                    int numConnections = 1 + (rand() % min(3, (int)neighbors.size()));
                    for(int i = 0; i < numConnections; i++) {
                        roadNetwork.createManhattanPath({x, y}, neighbors[i]);
                    }
                }
            }
        }
        
        roadNetwork.buildSparseGraph(taxiLocations, {qx, qy});

        if (bookingMode) {
            int distance = roadNetwork.dijkstra({taxiX, taxiY}, {qx, qy});
            double time = distance * 2.0;
            
            point oldPos(taxiX, taxiY);
            point newPos(qx, qy);
            kdtree.deletePoint(oldPos);
            kdtree.insert(newPos);
            
            ofstream outFile(TAXI_STATE_FILE);
            vector<point> allTaxis;
            kdtree.getAllPoints(allTaxis);
            for (const auto& p : allTaxis) {
                outFile << p.x << " " << p.y << "\n";
            }
            outFile.close();
            
            cout << "{";
            cout << "\"success\":true,";
            cout << "\"movedFrom\":{\"x\":" << taxiX << ",\"y\":" << taxiY << "},";
            cout << "\"movedTo\":{\"x\":" << qx << ",\"y\":" << qy << "},";
            cout << "\"distance\":" << fixed << setprecision(2) << distance << ",";
            cout << "\"time\":" << fixed << setprecision(2) << time << ",";
            cout << "\"treeHeight\":" << kdtree.getHeight() << ",";
            cout << "\"treeSize\":" << kdtree.size();
            cout << "}" << endl;
        } else if (nearest.size() > 0) {
            vector<TaxiInfo> taxiInfos;
            int taxiCount = min((int)nearest.size(), 5);
            
            for (int i = 0; i < taxiCount; i++) {
                TaxiInfo info;
                info.node = nearest[i];
                info.euclideanDist = sqrt(nearest[i].distanceSquared(query));
                info.path = roadNetwork.dijkstraPath({nearest[i].x, nearest[i].y}, {qx, qy});
                info.graphDist = info.path.size() - 1;
                taxiInfos.push_back(info);
            }
            
            sort(taxiInfos.begin(), taxiInfos.end(), [](const TaxiInfo& a, const TaxiInfo& b) {
                return a.graphDist < b.graphDist;
            });
            
            cout << "{\"pickup\":{\"x\":" << qx << ",\"y\":" << qy << "},";
            
            cout << "\"roadNetwork\":[";
            vector<pair<pair<int,int>, pair<int,int>>> edges = roadNetwork.getAllEdges();
            for (size_t i = 0; i < edges.size(); i++) {
                cout << "{\"from\":{\"x\":" << edges[i].first.first << ",\"y\":" << edges[i].first.second << "},";
                cout << "\"to\":{\"x\":" << edges[i].second.first << ",\"y\":" << edges[i].second.second << "}}";
                if (i < edges.size() - 1) cout << ",";
            }
            cout << "],";
            
            cout << "\"nearestTaxis\":[";
            for (size_t i = 0; i < taxiInfos.size(); i++) {
                double estimatedTime = taxiInfos[i].graphDist * 2.0;
                
                cout << "{";
                cout << "\"rank\":" << (i + 1) << ",";
                cout << "\"location\":{\"x\":" << taxiInfos[i].node.x << ",\"y\":" << taxiInfos[i].node.y << "},";
                cout << "\"euclideanDistance\":" << fixed << setprecision(2) << taxiInfos[i].euclideanDist << ",";
                cout << "\"graphDistance\":" << taxiInfos[i].graphDist << ",";
                cout << "\"estimatedTime\":" << fixed << setprecision(2) << estimatedTime << ",";
                
                cout << "\"path\":[";
                for(size_t j = 0; j < taxiInfos[i].path.size(); j++) {
                    cout << "{\"x\":" << taxiInfos[i].path[j].first << ",\"y\":" << taxiInfos[i].path[j].second << "}";
                    if(j < taxiInfos[i].path.size() - 1) cout << ",";
                }
                cout << "]";
                
                cout << "}";
                if (i < taxiInfos.size() - 1) cout << ",";
            }
            cout << "],";
            
            const TaxiInfo& selectedTaxi = taxiInfos[0];
            
            cout << "\"nearestTaxi\":{";
            cout << "\"location\":{\"x\":" << selectedTaxi.node.x << ",\"y\":" << selectedTaxi.node.y << "},";
            cout << "\"euclideanDistance\":" << fixed << setprecision(2) << selectedTaxi.euclideanDist << ",";
            cout << "\"graphDistance\":" << selectedTaxi.graphDist << ",";
            cout << "\"estimatedTime\":" << fixed << setprecision(2) << (selectedTaxi.graphDist * 2.0) << ",";
        
            cout << "\"path\":[";
            for(size_t j = 0; j < selectedTaxi.path.size(); j++) {
                cout << "{\"x\":" << selectedTaxi.path[j].first << ",\"y\":" << selectedTaxi.path[j].second << "}";
                if(j < selectedTaxi.path.size() - 1) cout << ",";
            }
            cout << "]";
            
            cout << "}}" << endl;
        } else {
            cout << "{\"pickup\":{\"x\":" << qx << ",\"y\":" << qy << "},\"error\":\"No taxis available\"}" << endl;
        }
    } else {
        srand(time(0));

        cin >> n;
        cout << "Generating " << n << " random taxi locations:" << endl;
        vector<point> taxiPoints;
        for (int i = 0; i < n; i++) {
            int x = rand() % 100;
            int y = rand() % 100;
            taxiPoints.push_back(point(x, y));
            cout << "Taxi " << i << ": (" << x << ", " << y << ")" << endl;
        }

        cout << "\nBuilding Dynamic KD-Tree..." << endl;
        DynamicKDTree kdtree(taxiPoints);

        cout << "\nDynamic KD-Tree built successfully!" << endl;
        cout << "Tree height: " << kdtree.getHeight() << endl;
        cout << "Tree size: " << kdtree.size() << endl;
        cout << "Inorder traversal: ";
        kdtree.inorder();
        cout << endl;

        int qx, qy, k;
        cout << "\n--- K-Nearest Neighbors Search ---" << endl;
        cout << "Enter query point coordinates (x y): ";
        cin >> qx >> qy;
        cout << "Enter number of nearest neighbors to find (k): ";
        cin >> k;

        cout << "\nSearching for " << k << " nearest taxis to point (" << qx << ", " << qy << ")..." << endl;
        
        point query(qx, qy);
        vector<point> nearest = kdtree.kNearestNeighbors(query, k);

        cout << "\nFound " << nearest.size() << " nearest taxi(s):" << endl;
        for (int i = 0; i < nearest.size(); i++) {
            double dist = sqrt(nearest[i].distanceSquared(query));
            cout << i + 1 << ". Taxi at (" << nearest[i].x << ", " << nearest[i].y 
                 << ") - Distance: " << dist << endl;
        }
    }

    return 0;
}
