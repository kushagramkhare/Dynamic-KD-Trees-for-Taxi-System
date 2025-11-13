#ifndef TAXI_H
#define TAXI_H

#include "point.h"
#include <vector>
#include <utility>

struct TaxiInfo {
    point node;
    double euclideanDist;
    int graphDist;
    vector<pair<int,int>> path;

    TaxiInfo() : 
        node({0, 0}), 
        euclideanDist(0.0), 
        graphDist(0), 
        path({})         
    {}
};

#endif