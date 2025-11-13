cmake_minimum_required(VERSION 3.10)

project(TaxiBackend)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

file(GLOB_RECURSE SOURCES
    "backend/src/*.cpp"
)

add_executable(taxi_backend ${SOURCES})

target_include_directories(taxi_backend PUBLIC
    "${PROJECT_SOURCE_DIR}/backend/include"
)