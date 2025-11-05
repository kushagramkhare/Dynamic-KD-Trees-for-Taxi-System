#include "taxi.h"

Taxi::Taxi(int id_, point pos_, bool available_) 
    : id(id_), position(pos_), isAvailable(available_) {}

void Taxi::updatePosition(const point &newPos) {
    position = newPos;
}

void Taxi::setAvailability(bool available) {
    isAvailable = available;
}

bool Taxi::canReach(const point &userPos, double maxDistance) const {
    if (!isAvailable) {
        return false;
    }
    return position.distance(userPos) <= maxDistance;
}