#ifndef KD_TREE_H
#define KD_TREE_H

#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>
#include <queue>
#include <utility>
using namespace std;

struct Point {
    int x, y;
    Point(int x = 0, int y = 0) : x(x), y(y) {}
    bool operator==(const Point& other) const {
        return x == other.x && y == other.y;
    }
};

enum BalanceType {
    AVL_BALANCE,      // Height difference <= 1
    REDBLACK_BALANCE  // Height difference <= 2x
};

class KDNode {
public:
    Point p;
    KDNode* left;
    KDNode* right;
    int height;  // Track height for balancing
    
    KDNode(const Point& point) 
        : p(point), left(nullptr), right(nullptr), height(1) {}
};