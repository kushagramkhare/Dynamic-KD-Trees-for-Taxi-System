#ifndef POINT_H
#define POINT_H

#include <cmath>

struct point {
    int x;
    int y;
    point(int x, int y) : x(x), y(y) {}

    double distanceSquared(const point& other) const {
        double dx = x - other.x;
        double dy = y - other.y;
        return dx * dx + dy * dy;
    }
    
    double distance(const point& other) const {
        return std::sqrt(distanceSquared(other));
    }
};

#endif // POINT_H