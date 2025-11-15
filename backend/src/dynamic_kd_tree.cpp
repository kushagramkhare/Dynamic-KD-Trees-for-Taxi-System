#include "dynamic_kd_tree.h"

DynamicKDTree::NodeDist::NodeDist(KDNode* n, double d) : node(n), dist(d) {}

bool DynamicKDTree::NodeDist::operator<(const NodeDist& other) const {
    return dist < other.dist;
}


int DynamicKDTree::getHeight(KDNode* node) {
    if (!node) return 0;
    return node->height;
}

void DynamicKDTree::updateHeight(KDNode* node) {
    if (!node) return;
    node->height = 1 + max(getHeight(node->left), getHeight(node->right));
}

int DynamicKDTree::getBalanceFactor(KDNode* node) {
    if (!node) return 0;
    return getHeight(node->left) - getHeight(node->right);
}

bool DynamicKDTree::isBalanced(KDNode* node) {
    if (!node) return true;

    int leftHeight = getHeight(node->left);
    int rightHeight = getHeight(node->right);
    int diff = abs(leftHeight - rightHeight);

    if (!node->left || !node->right) {
        return diff <= 1;  
    }
    return diff <= 1 || (rightHeight > 0 && leftHeight <= 2 * rightHeight && rightHeight <= 2 * leftHeight);
}

bool DynamicKDTree::compareXY(const point& a, const point& b) {
    if (a.x != b.x) return a.x < b.x;
    return a.y < b.y;
}

bool DynamicKDTree::compareYX(const point& a, const point& b) {
    if (a.y != b.y) return a.y < b.y;
    return a.x < b.x;
}

bool DynamicKDTree::compare(const point& a, const point& b, int depth) {
    return (depth % 2 == 0) ? compareXY(a, b) : compareYX(a, b);
}

KDNode* DynamicKDTree::search(KDNode* node, const point& p, int depth) {
    if (!node) return nullptr;

    if (node->p == p) return node;

    bool goLeft = compare(p, node->p, depth);
    return search(goLeft ? node->left : node->right, p, depth + 1);
}

KDNode* DynamicKDTree::rebuild(KDNode* node, int depth) {
    if (!node) return nullptr;

    vector<point> points;
    collectpoints(node, points);

    deleteTree(node);

    return buildBalanced(points, depth, 0, points.size() - 1);
}

void DynamicKDTree::collectpoints(KDNode* node, vector<point>& points) {
    if (!node) return;
    collectpoints(node->left, points);
    points.push_back(node->p);
    collectpoints(node->right, points);
}

KDNode* DynamicKDTree::buildBalanced(vector<point>& points, int depth, int start, int end) {
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

bool DynamicKDTree::comp_xy_points(int a, int b, const vector<point>& data) {
    if (data[a].x == data[b].x) {
        return data[a].y < data[b].y;
    }
    return data[a].x < data[b].x;
}

bool DynamicKDTree::comp_yx_points(int a, int b, const vector<point>& data) {
    if (data[a].y == data[b].y) {
        return data[a].x < data[b].x;
    }
    return data[a].y < data[b].y;
}

KDNode* DynamicKDTree::buildKDTreeFromVector(vector<int>& xy_superKey_temp, vector<int>& yx_superKey_temp,
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

KDNode* DynamicKDTree::insertRecursive(KDNode* node, const point& p, int depth, bool& needRebalance) {
    if (!node) {
        needRebalance = false;
        return new KDNode(p);
    }

    if (node->p == p) {
        needRebalance = false;
        return node;
    }

    bool goLeft = compare(p, node->p, depth);

    if (goLeft) {
        node->left = insertRecursive(node->left, p, depth + 1, needRebalance);
    } else {
        node->right = insertRecursive(node->right, p, depth + 1, needRebalance);
    }

    updateHeight(node);

    if (!isBalanced(node)) {
        node = rebuild(node, depth);
        needRebalance = true;
    }

    return node;
}

KDNode* DynamicKDTree::findMin(KDNode* node, int dim, int depth) {
    if (!node) return nullptr;

    if (depth % 2 == dim % 2) {
        if (!node->left) return node;
        return findMin(node->left, dim, depth + 1);
    }

    KDNode* minNode = node;

    KDNode* leftMin = findMin(node->left, dim, depth + 1);
    if (leftMin && compare(leftMin->p, minNode->p, dim)) {
        minNode = leftMin;
    }

    KDNode* rightMin = findMin(node->right, dim, depth + 1);
    if (rightMin && compare(rightMin->p, minNode->p, dim)) {
        minNode = rightMin;
    }

    return minNode;
}

KDNode* DynamicKDTree::findMax(KDNode* node, int dim, int depth) {
    if (!node) return nullptr;

    if (depth % 2 == dim % 2) {
        if (!node->right) return node;
        return findMax(node->right, dim, depth + 1);
    }

    KDNode* maxNode = node;

    KDNode* rightMax = findMax(node->right, dim, depth + 1);
    if (rightMax && compare(maxNode->p, rightMax->p, dim)) {
        maxNode = rightMax;
    }

    KDNode* leftMax = findMax(node->left, dim, depth + 1);
    if (leftMax && compare(maxNode->p, leftMax->p, dim)) {
        maxNode = leftMax;
    }

    return maxNode;
}

KDNode* DynamicKDTree::deleteRecursive(KDNode* node, const point& p, int depth, bool& found) {
    if (!node) {
        found = false;
        return nullptr;
    }

    if (node->p == p) {
        found = true;

        if (!node->left && !node->right) {
            delete node;
            return nullptr;
        }

        if (!node->left || !node->right) {
            KDNode* child = node->left ? node->left : node->right;
            delete node;
            return child;
        }

        int dim = depth % 2;
        KDNode* replacement = nullptr;

        if (getHeight(node->right) >= getHeight(node->left)) {
            replacement = findMin(node->right, dim, depth + 1);
            point tempP = replacement->p;
            node->right = deleteRecursive(node->right, tempP, depth + 1, found);
            node->p = tempP;
        } else {
            replacement = findMax(node->left, dim, depth + 1);
            point tempP = replacement->p;
            node->left = deleteRecursive(node->left, tempP, depth + 1, found);
            node->p = tempP;
        }

    } else {
        bool goLeft = compare(p, node->p, depth);
        if (goLeft) {
            node->left = deleteRecursive(node->left, p, depth + 1, found);
        } else {
            node->right = deleteRecursive(node->right, p, depth + 1, found);
        }
    }

    if (!node) return nullptr;

    updateHeight(node);

    if (!isBalanced(node)) {
        node = rebuild(node, depth);
    }

    return node;
}

void DynamicKDTree::deleteTree(KDNode* node) {
    if (!node) return;
    deleteTree(node->left);
    deleteTree(node->right);
    delete node;
}

void DynamicKDTree::knnHelper(KDNode* node, const point& query, int depth,
                               priority_queue<NodeDist>& pq, int k) {
    if (!node) return;

    double dist = sqrt(pow(node->p.x - query.x, 2) + pow(node->p.y - query.y, 2));

    if ((int)pq.size() < k) {
        pq.push(NodeDist(node, dist));
    } else if (dist < pq.top().dist) {
        pq.pop();
        pq.push(NodeDist(node, dist));
    }

    int diff = (depth % 2 == 0) ? (query.x - node->p.x) : (query.y - node->p.y);

    KDNode* nearChild = (diff < 0) ? node->left : node->right;
    KDNode* farChild = (diff < 0) ? node->right : node->left;

    knnHelper(nearChild, query, depth + 1, pq, k);

    if ((int)pq.size() < k || diff * diff < pq.top().dist) {
        knnHelper(farChild, query, depth + 1, pq, k);
    }
}


DynamicKDTree::DynamicKDTree()
    : root(nullptr) {}

DynamicKDTree::DynamicKDTree(const vector<point>& initialPoints)
    : root(nullptr) {
    buildFromVector(initialPoints);
}

DynamicKDTree::~DynamicKDTree() {
    deleteTree(root);
}

void DynamicKDTree::buildFromVector(const vector<point>& points) {
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

void DynamicKDTree::insert(const point& p) {
    bool needRebalance = false;
    root = insertRecursive(root, p, 0, needRebalance);
}

bool DynamicKDTree::deletePoint(const point& p) {
    bool found = false;
    root = deleteRecursive(root, p, 0, found);
    return found;
}

bool DynamicKDTree::search(const point& p) {
    return search(root, p, 0) != nullptr;
}

vector<point> DynamicKDTree::kNearestNeighbors(const point& query, int k) {
    vector<point> result;
    if (!root || k <= 0) return result;

    priority_queue<NodeDist> pq;
    knnHelper(root, query, 0, pq, k);

    while (!pq.empty()) {
        result.push_back(pq.top().node->p);
        pq.pop();
    }

    reverse(result.begin(), result.end());
    return result;
}

int DynamicKDTree::getHeight() {
    return getHeight(root);
}

int DynamicKDTree::size() {
    int count = 0;
    countNodes(root, count);
    return count;
}

void DynamicKDTree::countNodes(KDNode* node, int& count) {
    if (!node) return;
    count++;
    countNodes(node->left, count);
    countNodes(node->right, count);
}

void DynamicKDTree::inorder() {
    inorderHelper(root);
    cout << endl;
}

void DynamicKDTree::inorderHelper(KDNode* node) {
    if (!node) return;
    inorderHelper(node->left);
    cout << "(" << node->p.x << "," << node->p.y << ") ";
    inorderHelper(node->right);
}

void DynamicKDTree::getAllPoints(vector<point>& points) {
    getAllPointsHelper(root, points);
}

void DynamicKDTree::getAllPointsHelper(KDNode* node, vector<point>& points) {
    if (!node) return;
    points.push_back(node->p);
    getAllPointsHelper(node->left, points);
    getAllPointsHelper(node->right, points);
}

void DynamicKDTree::nearestNeighbor(KDNode* node,
                                    const point& query,
                                    int depth,
                                    KDNode*& best,
                                    double& bestDist) {
    if (!node) return;

    double dist = sqrt(pow(node->p.x - query.x, 2) +
                       pow(node->p.y - query.y, 2));

    if (!best || dist < bestDist) {
        best = node;
        bestDist = dist;
    }

    int diff = (depth % 2 == 0)
               ? query.x - node->p.x
               : query.y - node->p.y;

    KDNode* nearChild = (diff < 0) ? node->left : node->right;
    KDNode* farChild  = (diff < 0) ? node->right : node->left;

    nearestNeighbor(nearChild, query, depth + 1, best, bestDist);

    if (diff * diff < bestDist) {
        nearestNeighbor(farChild, query, depth + 1, best, bestDist);
    }
}

