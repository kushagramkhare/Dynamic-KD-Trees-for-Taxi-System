#ifndef GRAPH_H
#define GRAPH_H

#include <iostream>
#include <unordered_map>
#include <vector>
#include <random>
#include <algorithm>
#include <utility>
#include <climits>
#include <queue>
#include <set>
using namespace std;

struct PairHash {
    size_t operator()(const pair<int, int>& p) const {
        size_t h1 = hash<int>{}(p.first);
        size_t h2 = hash<int>{}(p.second);
        return h1 ^ (h2 << 1);
    }
};

class GridGraph {
private:
    unordered_map<pair<int, int>, vector<pair<int, int>>, PairHash> adjacencyList;
    const int MIN_COORD = -100;
    const int MAX_COORD = 100;
    mt19937 rng;

    bool isValid(int x, int y) const {
        return x >= MIN_COORD && x <= MAX_COORD && y >= MIN_COORD && y <= MAX_COORD;
    }

    void addEdge(const pair<int, int>& node1, const pair<int, int>& node2) {
        adjacencyList[node1].push_back(node2);
        adjacencyList[node2].push_back(node1);
    }

    bool hasEdge(const pair<int, int>& node1, const pair<int, int>& node2) const {
        auto it = adjacencyList.find(node1);
        if (it == adjacencyList.end()) return false;

        const auto& neighbors = it->second;
        return find(neighbors.begin(), neighbors.end(), node2) != neighbors.end();
    }

public:
    GridGraph() : rng(random_device{}()) {}

    void buildSparseGraph(const vector<pair<int,int>>& taxi_locations, pair<int,int> pickup) {
        for(const auto& taxi : taxi_locations) {
            createManhattanPath(pickup, taxi);
        }
    }

    void createManhattanPath(pair<int,int> from, pair<int,int> to) {
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

    vector<pair<pair<int,int>, pair<int,int>>> getAllEdges() const {
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
    
};

#endif