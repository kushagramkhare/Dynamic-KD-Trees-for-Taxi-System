#include "graph.h" 
#include <iostream>   
#include <queue>      
#include <set>        
#include <algorithm>  
#include <climits>    

GridGraph::GridGraph() : rng(random_device{}()) {}

bool GridGraph::isValid(int x, int y) const {
    return x >= MIN_COORD && x <= MAX_COORD && y >= MIN_COORD && y <= MAX_COORD;
}

void GridGraph::addEdge(const pair<int, int>& node1, const pair<int, int>& node2) {
    adjacencyList[node1].push_back(node2);
    adjacencyList[node2].push_back(node1);
}

bool GridGraph::hasEdge(const pair<int, int>& node1, const pair<int, int>& node2) const {
    auto it = adjacencyList.find(node1);
    if (it == adjacencyList.end()) return false;

    const auto& neighbors = it->second;
    return find(neighbors.begin(), neighbors.end(), node2) != neighbors.end();
}

void GridGraph::buildSparseGraph(const vector<pair<int,int>>& taxi_locations, pair<int,int> pickup) {
    for(const auto& taxi : taxi_locations) {
        createManhattanPath(pickup, taxi);
    }
}

void GridGraph::createManhattanPath(pair<int,int> from, pair<int,int> to) {
    int x = from.first;
    int y = from.second;

    while(x != to.first || y != to.second) {
        pair<int,int> current = {x, y};

        if(adjacencyList.find(current) == adjacencyList.end()) {
            adjacencyList[current] = vector<pair<int,int>>();
        }

        if(x < to.first) {
            pair<int,int> next = {x+1, y};
            if(!hasEdge(current, next)) addEdge(current, next);
            x++;
        } else if(x > to.first) {
            pair<int,int> next = {x-1, y};
            if(!hasEdge(current, next)) addEdge(current, next);
            x--;
        } else if(y < to.second) {
            pair<int,int> next = {x, y+1};
            if(!hasEdge(current, next)) addEdge(current, next);
            y++;
        } else if(y > to.second) {
            pair<int,int> next = {x, y-1};
            if(!hasEdge(current, next)) addEdge(current, next);
            y--;
        }
    }
}

vector<pair<pair<int,int>, pair<int,int>>> GridGraph::getAllEdges() const {
    vector<pair<pair<int,int>, pair<int,int>>> edges;
    set<pair<pair<int,int>, pair<int,int>>> seenEdges;
    
    for (const auto& entry : adjacencyList) {
        const auto& node = entry.first;
        for (const auto& neighbor : entry.second) {
            auto edge = (node < neighbor) ? make_pair(node, neighbor) : make_pair(neighbor, node);
            
            if (seenEdges.find(edge) == seenEdges.end()) {
                edges.push_back(edge);
                seenEdges.insert(edge);
            }
        }
    }
    return edges;
}

vector<pair<int, int>> GridGraph::dijkstraPath(pair<int, int> start, pair<int, int> end) {
    vector<pair<int, int>> path;
    if(start == end) {
        path.push_back(start);
        return path;
    }

    unordered_map<pair<int, int>, int, PairHash> distances;
    unordered_map<pair<int, int>, pair<int, int>, PairHash> previous;
    priority_queue<pair<int, pair<int, int>>,
                   vector<pair<int, pair<int, int>>>,
                   greater<pair<int, pair<int, int>>>> pq;

    distances[start] = 0;
    pq.push({0, start});

    while(!pq.empty()) {
        int currentDist = pq.top().first;
        pair<int, int> currentNode = pq.top().second;
        pq.pop();

        if(currentNode == end) {
            pair<int, int> current = end;
            while(current != start) {
                path.push_back(current);
                current = previous[current];
            }
            path.push_back(start);
            reverse(path.begin(), path.end());
            return path;
        }

        if(distances.count(currentNode) && currentDist > distances[currentNode]) {
            continue;
        }

        auto it = adjacencyList.find(currentNode);
        if(it == adjacencyList.end()) continue;

        for(const auto& neighbor : it->second) {
            int newDist = currentDist + 1;

            if(!distances.count(neighbor) || newDist < distances[neighbor]) {
                distances[neighbor] = newDist;
                previous[neighbor] = currentNode;
                pq.push({newDist, neighbor});
            }
        }
    }

    int x = start.first, y = start.second;
    path.push_back({x, y});
    
    while(x != end.first || y != end.second) {
        if(x < end.first) x++;
        else if(x > end.first) x--;
        else if(y < end.second) y++;
        else if(y > end.second) y--;
        path.push_back({x, y});
    }
    
    return path;
}

int GridGraph::dijkstra(pair<int, int> start, pair<int, int> end) {
    if(start == end) return 0;

    unordered_map<pair<int, int>, int, PairHash> distances;
    priority_queue<pair<int, pair<int, int>>,
                   vector<pair<int, pair<int, int>>>,
                   greater<pair<int, pair<int, int>>>> pq;

    distances[start] = 0;
    pq.push({0, start});

    while(!pq.empty()) {
        int currentDist = pq.top().first;
        pair<int, int> currentNode = pq.top().second;
        pq.pop();

        if(currentNode == end) {
            return currentDist;
        }

        if(distances.count(currentNode) && currentDist > distances[currentNode]) {
            continue;
        }

        auto it = adjacencyList.find(currentNode);
        if(it == adjacencyList.end()) continue;

        for(const auto& neighbor : it->second) {
            int newDist = currentDist + 1;

            if(!distances.count(neighbor) || newDist < distances[neighbor]) {
                distances[neighbor] = newDist;
                pq.push({newDist, neighbor});
            }
        }
    }

    return abs(end.first - start.first) + abs(end.second - start.second);
}