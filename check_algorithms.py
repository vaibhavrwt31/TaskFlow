from backend.algorithms import (
    insertion_sort,
    binary_search,
    insertion_sort_count,
    binary_search_count,
    linear_search_count
)


def check(case_name, result, expected):
    if result == expected:
        print(f"PASS: {case_name}")
    else:
        print(f"FAIL: {case_name} — expected {expected}, got {result}")


# 1. Empty list
records = []
insertion_sort(records, "title")
check(
    "Insertion sort empty list",
    records,
    []
)


# 2. Single element
records = [{"title": "Task A"}]
insertion_sort(records, "title")
check(
    "Insertion sort single element",
    records,
    [{"title": "Task A"}]
)


# Test data for binary search
records = [
    {"title": "Alpha"},
    {"title": "Beta"},
    {"title": "Charlie"},
    {"title": "Delta"},
    {"title": "Echo"}
]


# 3. Binary search first index
check(
    "Binary search first index",
    binary_search(records, "Alpha", "title"),
    0
)


# 4. Binary search middle index
check(
    "Binary search middle index",
    binary_search(records, "Charlie", "title"),
    2
)


# 5. Binary search last index
check(
    "Binary search last index",
    binary_search(records, "Echo", "title"),
    4
)


# 6. Binary search not found
check(
    "Binary search not found",
    binary_search(records, "Zebra", "title"),
    -1
)


# 7. Insertion sort count
records = [
    {"title": "Charlie"},
    {"title": "Alpha"},
    {"title": "Beta"}
]

comparison_count = insertion_sort_count(records, "title")

sorted_expected = [
    {"title": "Alpha"},
    {"title": "Beta"},
    {"title": "Charlie"}
]

check(
    "Insertion sort count sorted result",
    records,
    sorted_expected
)

if type(comparison_count) == int and comparison_count > 0:
    print("PASS: Insertion sort count returns positive int")
else:
    print(
        f"FAIL: Insertion sort count returns positive int — "
        f"got {comparison_count}"
    )


# 8. Binary search count
records = [
    {"title": "Alpha"},
    {"title": "Beta"},
    {"title": "Charlie"},
    {"title": "Delta"},
    {"title": "Echo"}
]

binary_result = binary_search_count(
    records,
    "Charlie",
    "title"
)

if (
    type(binary_result) == dict
    and binary_result["index"] == 2
    and type(binary_result["comparison_count"]) == int
    and binary_result["comparison_count"] > 0
):
    print("PASS: Binary search count")
else:
    print(
        f"FAIL: Binary search count — got {binary_result}"
    )


# 9. Linear search count absent value
records = [
    {"title": "Alpha"},
    {"title": "Beta"},
    {"title": "Charlie"},
    {"title": "Delta"},
    {"title": "Echo"}
]

linear_result = linear_search_count(
    records,
    "Zebra",
    "title"
)

if (
    type(linear_result) == dict
    and linear_result["index"] == -1
    and linear_result["comparison_count"] == len(records)
):
    print("PASS: Linear search count not found")
else:
    print(
        f"FAIL: Linear search count not found — got {linear_result}"
    )