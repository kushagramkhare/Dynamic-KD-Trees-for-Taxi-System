#ifndef KDNODE_H
#define KDNODE_H

#include "point.h"

class KDNode {
public:
    point p;
    KDNode* left;
    KDNode* right;
    int height;

    KDNode() : p(0, 0), left(nullptr), right(nullptr), height(1) {}

    KDNode(int x, int y) : p(x, y), left(nullptr), right(nullptr), height(1) {}
    KDNode(const point& point) 
        : p(point), left(nullptr), right(nullptr), height(1) {}

    bool operator==(const KDNode& other) const {
        return p == other.p && height == other.height;
    }
};

#endif 
