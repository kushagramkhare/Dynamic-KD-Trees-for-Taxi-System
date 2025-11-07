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


enum BalanceType {
    REDBLACK_BALANCE  
};


class DynamicKDTree {
private:
    KDNode* root;
    BalanceType balanceType;
    
    int getHeight(KDNode* node) {
        if (!node) return 0;
        return node->height;
    }
    
    void updateHeight(KDNode* node) {
        if (!node) return;
        node->height = 1 + max(getHeight(node->left), getHeight(node->right));
    }
    
    bool compareXY(const point& a, const point& b) {
        if (a.x != b.x) return a.x < b.x;
        return a.y < b.y;
    }
    
    bool compareYX(const point& a, const point& b) {
        if (a.y != b.y) return a.y < b.y;
        return a.x < b.x;
    }
    
    bool compare(const point& a, const point& b, int depth) {
        return (depth % 2 == 0) ? compareXY(a, b) : compareYX(a, b);
    }
    
    KDNode* search(KDNode* node, const point& p, int depth) {
        if (!node) return nullptr;
        
        if (node->p == p) return node;
        
        bool goLeft = compare(p, node->p, depth);
        return search(goLeft ? node->left : node->right, p, depth + 1);
    }
    
    void collectpoints(KDNode* node, vector<point>& points) {
        if (!node) return;
        collectpoints(node->left, points);
        points.push_back(node->p);
        collectpoints(node->right, points);
    }
    
    KDNode* buildBalanced(vector<point>& points, int depth, int start, int end) {
        if (start > end) return nullptr;
        
        sort(points.begin() + start, points.begin() + end + 1,
             [depth, this](const point& a, const point& b) {
                 return compare(a, b, depth);
             });
        
        int mid = (start + end) / 2;
        KDNode* node = new KDNode(points[mid]);
        
        node->left = buildBalanced(points, depth + 1, start, mid - 1);
        node->right = buildBalanced(points, depth + 1, mid + 1, end);
        
        updateHeight(node);
        return node;
    }
    
    bool comp_xy_points(int a, int b, const vector<point>& data) {
        if (data[a].x == data[b].x) {
            return data[a].y < data[b].y;
        }
        return data[a].x < data[b].x;
    }
    
    bool comp_yx_points(int a, int b, const vector<point>& data) {
        if (data[a].y == data[b].y) {
            return data[a].x < data[b].x;
        }
        return data[a].y < data[b].y;
    }
    void deleteTree(KDNode* node) {
        if (!node) return;
        deleteTree(node->left);
        deleteTree(node->right);
        delete node;
    }
    
    KDNode* buildKDTreeFromVector(vector<int>& xy_superKey_temp, vector<int>& yx_superKey_temp, 
                                  bool div_x, const vector<point>& data) {
        int len = xy_superKey_temp.size();
        if (len == 0) return nullptr;
        
        int mid = len / 2;
        int idx;
        KDNode* node;
        
        if (div_x) {
            idx = xy_superKey_temp[mid];
            node = new KDNode(data[idx].x, data[idx].y);
            
            vector<int> left_xy_superKey(xy_superKey_temp.begin(), xy_superKey_temp.begin() + mid);
            vector<int> left_yx_superKey;
            left_yx_superKey.reserve(mid);
            for (int i = 0; i < len; i++) {
                if (comp_xy_points(yx_superKey_temp[i], idx, data) && yx_superKey_temp[i] != idx) {
                    left_yx_superKey.push_back(yx_superKey_temp[i]);
                }
            }
            node->left = buildKDTreeFromVector(left_xy_superKey, left_yx_superKey, !div_x, data);
            
            vector<int> right_xy_superKey(xy_superKey_temp.begin() + mid + 1, xy_superKey_temp.end());
            vector<int> right_yx_superKey;
            right_yx_superKey.reserve(mid);
            for (int i = 0; i < len; i++) {
                if (!comp_xy_points(yx_superKey_temp[i], idx, data) && yx_superKey_temp[i] != idx) {
                    right_yx_superKey.push_back(yx_superKey_temp[i]);
                }
            }
            node->right = buildKDTreeFromVector(right_xy_superKey, right_yx_superKey, !div_x, data);
            
        } else {
            idx = yx_superKey_temp[mid];
            node = new KDNode(data[idx].x, data[idx].y);
            
            vector<int> left_yx_superKey(yx_superKey_temp.begin(), yx_superKey_temp.begin() + mid);
            vector<int> left_xy_superKey;
            left_xy_superKey.reserve(mid);
            for (int i = 0; i < len; i++) {
                if (comp_yx_points(xy_superKey_temp[i], idx, data) && xy_superKey_temp[i] != idx) {
                    left_xy_superKey.push_back(xy_superKey_temp[i]);
                }
            }
            node->left = buildKDTreeFromVector(left_xy_superKey, left_yx_superKey, !div_x, data);
            
            vector<int> right_yx_superKey(yx_superKey_temp.begin() + mid + 1, yx_superKey_temp.end());
            vector<int> right_xy_superKey;
            right_xy_superKey.reserve(mid);
            for (int i = 0; i < len; i++) {
                if (!comp_yx_points(xy_superKey_temp[i], idx, data) && xy_superKey_temp[i] != idx) {
                    right_xy_superKey.push_back(xy_superKey_temp[i]);
                }
            }
            node->right = buildKDTreeFromVector(right_xy_superKey, right_yx_superKey, !div_x, data);
        }
        
        updateHeight(node);
        return node;
    }
    
   
    
public:
    DynamicKDTree(BalanceType balance = REDBLACK_BALANCE)
        : root(nullptr), balanceType(balance) {}
    
    DynamicKDTree(const vector<point>& initialPoints, BalanceType balance = REDBLACK_BALANCE)
        : root(nullptr), balanceType(balance) {
        buildFromVector(initialPoints);
    }
    
    ~DynamicKDTree() {
        deleteTree(root);
    }
    
    void buildFromVector(const vector<point>& points) {
        if (root) {
            deleteTree(root);
            root = nullptr;
        }
        
        if (points.empty()) return;
        
        int n = points.size();
        vector<int> xy_superKey(n);
        vector<int> yx_superKey(n);
        
        for (int i = 0; i < n; i++) {
            xy_superKey[i] = i;
            yx_superKey[i] = i;
        }
        
        sort(xy_superKey.begin(), xy_superKey.end(), 
             [&points, this](int a, int b) { return comp_xy_points(a, b, points); });
        sort(yx_superKey.begin(), yx_superKey.end(), 
             [&points, this](int a, int b) { return comp_yx_points(a, b, points); });
        
        root = buildKDTreeFromVector(xy_superKey, yx_superKey, true, points);
    }
   
    
    bool search(const point& p) {
        return search(root, p, 0) != nullptr;
    }
    
    int getHeight() {
        return getHeight(root);
    }
    
    void inorder() {
        inorderHelper(root);
        cout << endl;
    }
    
    void inorderHelper(KDNode* node) {
        if (!node) return;
        inorderHelper(node->left);
        cout << "(" << node->p.x << "," << node->p.y << ") ";
        inorderHelper(node->right);
    }
};

#endif