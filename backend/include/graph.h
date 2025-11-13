#ifndef GRAPH_H
#define GRAPH_H

#include <unordered_map>
#include <vector>
#include <random>
#include <utility>
#include <cstddef>
#include <functional>

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

    bool isValid(int x, int y) const;
    void addEdge(const pair<int, int>& node1, const pair<int, int>& node2);
    bool hasEdge(const pair<int, int>& node1, const pair<int, int>& node2) const;

public:
    GridGraph();

    void buildSparseGraph(const vector<pair<int,int>>& taxi_locations, pair<int,int> pickup);
    void createManhattanPath(pair<int,int> from, pair<int,int> to);
    vector<pair<pair<int,int>, pair<int,int>>> getAllEdges() const;
    vector<pair<int, int>> dijkstraPath(pair<int, int> start, pair<int, int> end);
    int dijkstra(pair<int, int> start, pair<int, int> end);
};

#endif