#ifndef TAXI_H
#define TAXI_H

#include "point.h"

struct Taxi {
    int id;
    point position;
    bool isAvailable;
    
    Taxi(int id_, point pos_, bool available_ = true);
    void updatePosition(const point &newPos);
    void setAvailability(bool available);
    bool canReach(const point &userPos, double maxDistance) const;
};

#endif