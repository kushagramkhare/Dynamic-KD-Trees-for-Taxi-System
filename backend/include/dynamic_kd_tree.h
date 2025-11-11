#ifndef DYNAMIC_KD_TREE_H
#define DYNAMIC_KD_TREE_H

#include "kdnode.h"
#include "point.h"
#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>
#include <queue>
#include <utility>
using namespace std;


class DynamicKDTree {
private:
    KDNode* root;

    struct NodeDist {
        KDNode* node;
        double dist;
        NodeDist(KDNode* n, double d);
        bool operator<(const NodeDist& other) const;
    };

    int getHeight(KDNode* node);
    void updateHeight(KDNode* node);
    int getBalanceFactor(KDNode* node);
    bool isBalanced(KDNode* node);
    bool compareXY(const point& a, const point& b);
    bool compareYX(const point& a, const point& b);
    bool compare(const point& a, const point& b, int depth);
    KDNode* search(KDNode* node, const point& p, int depth);
    KDNode* rebuild(KDNode* node, int depth);
    void collectpoints(KDNode* node, vector<point>& points);
    KDNode* buildBalanced(vector<point>& points, int depth, int start, int end);
    bool comp_xy_points(int a, int b, const vector<point>& data);
    bool comp_yx_points(int a, int b, const vector<point>& data);
    KDNode* buildKDTreeFromVector(vector<int>& xy_superKey_temp, vector<int>& yx_superKey_temp,
                                  bool div_x, const vector<point>& data);
    KDNode* insertRecursive(KDNode* node, const point& p, int depth, bool& needRebalance);
    KDNode* findMin(KDNode* node, int dim, int depth);
    KDNode* findMax(KDNode* node, int dim, int depth);
    KDNode* deleteRecursive(KDNode* node, const point& p, int depth, bool& found);
    void deleteTree(KDNode* node);
    void knnHelper(KDNode* node, const point& query, int depth,
                   priority_queue<NodeDist>& pq, int k);

public:
    DynamicKDTree();
    DynamicKDTree(const vector<point>& initialPoints);
    ~DynamicKDTree();

    void buildFromVector(const vector<point>& points);
    void insert(const point& p);
    bool deletePoint(const point& p);
    bool search(const point& p);
    vector<point> kNearestNeighbors(const point& query, int k);
    int getHeight();
    int size();
    void countNodes(KDNode* node, int& count);
    void inorder();
    void inorderHelper(KDNode* node);
    void getAllPoints(vector<point>& points);
    void getAllPointsHelper(KDNode* node, vector<point>& points);
};

#endif
